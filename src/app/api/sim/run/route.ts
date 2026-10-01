import { NextRequest, NextResponse } from "next/server";
import { Sandbox } from "@vercel/sandbox";
import * as v from "valibot";

/**
 * Runs a student's edited robot file in real WPILib 2027 simulation.
 *
 * SPIKE, behind `SIM_SPIKE=1`. See `context/sim-spike.md` for the measurements
 * and the go/no-go.
 *
 * One POST is one run. The route boots a Vercel Sandbox from a snapshot that
 * `sim-runner/harness/bake.sh` prepared (the lesson branch already built, its
 * Gradle dependencies resolved), writes the one file the student edited, and
 * runs `run.sh`: plain javac against the project's real classpath, then the
 * robot with halsim_ws_server on port 3300. The response is a stream of
 * newline-delimited JSON: progress, compiler and robot output, and once the
 * robot is enabled, the websocket URL the browser connects to for telemetry
 * and joystick input.
 *
 * What bounds a run, in the order it would bite:
 *   - the network: `deny-all`, so student code cannot reach anything, DNS
 *     included. Inbound traffic to the exposed port still works.
 *   - the clock: `run.sh` kills the robot at SIM_SECONDS, the sandbox times out
 *     shortly after, and the sandbox is stopped as soon as this response ends,
 *     which includes the browser closing the tab.
 *   - the box: one vCPU and 2 GB, ephemeral, discarded on stop.
 *   - concurrency and rate, below. These are per function instance, which is a
 *     best effort on Fluid Compute; the production version wants a shared
 *     counter and a Vercel Firewall rate-limit rule on this path.
 */

export const maxDuration = 300;

/** The files a student may replace, keyed by the name the editor shows. */
const EDITABLE_FILES = {
  "Arm.java": "mechanisms/Arm.java",
  "Flywheel.java": "mechanisms/Flywheel.java",
  "MyTeleop.java": "opmode/MyTeleop.java",
} as const;

const PROJECT_SRC = "/vercel/sandbox/project/src/main/java/first/robot";
const SIM_SECONDS = 120;
/** Sandbox timeout: the sim's own limit plus boot and compile headroom. */
const SANDBOX_TIMEOUT_MS = (SIM_SECONDS + 30) * 1000;
/** Compiler and robot output forwarded per run, after which it is dropped. */
const MAX_LOG_BYTES = 64 * 1024;

const MAX_CONCURRENT = Number(process.env.SIM_MAX_CONCURRENT ?? 8);
const RATE_WINDOW_MS = 10 * 60 * 1000;
const RATE_PER_IP = Number(process.env.SIM_RUNS_PER_IP ?? 60);

let active = 0;
const recentRuns = new Map<string, number[]>();

const RunRequest = v.object({
  file: v.picklist(
    Object.keys(EDITABLE_FILES) as (keyof typeof EDITABLE_FILES)[]
  ),
  source: v.pipe(v.string(), v.maxLength(64 * 1024)),
});

function clientIp(req: NextRequest): string {
  return (
    req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ??
    req.headers.get("x-real-ip") ??
    "unknown"
  );
}

function overRate(ip: string, now: number): boolean {
  const kept = (recentRuns.get(ip) ?? []).filter(
    (t) => now - t < RATE_WINDOW_MS
  );
  if (kept.length >= RATE_PER_IP) {
    recentRuns.set(ip, kept);
    return true;
  }
  kept.push(now);
  recentRuns.set(ip, kept);
  return false;
}

export async function POST(req: NextRequest) {
  const snapshotId = process.env.SIM_SNAPSHOT_ID;
  if (process.env.SIM_SPIKE !== "1" || !snapshotId) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  const parsed = v.safeParse(RunRequest, await req.json().catch(() => null));
  if (!parsed.success) {
    return NextResponse.json({ error: "Bad request" }, { status: 400 });
  }
  if (active >= MAX_CONCURRENT) {
    return NextResponse.json(
      { error: "Every simulator is busy. Try again in a minute." },
      { status: 503, headers: { "Retry-After": "60" } }
    );
  }
  if (overRate(clientIp(req), Date.now())) {
    return NextResponse.json(
      { error: "Too many runs from this network. Wait a few minutes." },
      { status: 429, headers: { "Retry-After": "300" } }
    );
  }

  const { file, source } = parsed.output;
  const abort = new AbortController();
  req.signal.addEventListener("abort", () => abort.abort());
  const encoder = new TextEncoder();
  active += 1;

  const stream = new ReadableStream<Uint8Array>({
    async start(controller) {
      const started = Date.now();
      const send = (event: Record<string, unknown>) => {
        try {
          controller.enqueue(encoder.encode(`${JSON.stringify(event)}\n`));
        } catch {
          // The browser went away mid-run; abort() below cleans up.
        }
      };
      const elapsed = () => Date.now() - started;
      let sandbox: Sandbox | null = null;

      try {
        send({ t: "phase", phase: "booting", ms: 0 });
        sandbox = await Sandbox.create({
          source: { type: "snapshot", snapshotId },
          resources: { vcpus: 1 },
          timeout: SANDBOX_TIMEOUT_MS,
          ports: [3300],
          networkPolicy: "deny-all",
          persistent: false,
          tags: { purpose: "sim-spike" },
          signal: abort.signal,
        });
        send({ t: "phase", phase: "booted", ms: elapsed() });

        await sandbox.writeFiles(
          [
            {
              path: `${PROJECT_SRC}/${EDITABLE_FILES[file]}`,
              content: Buffer.from(source, "utf8"),
            },
          ],
          { signal: abort.signal }
        );

        const command = await sandbox.runCommand({
          cmd: "bash",
          args: ["/vercel/sandbox/harness/run.sh"],
          env: { SIM_SECONDS: String(SIM_SECONDS) },
          detached: true,
          signal: abort.signal,
        });
        send({ t: "phase", phase: "compiling", ms: elapsed() });

        const wsUrl = `${sandbox.domain(3300).replace(/^http/, "ws")}/wpilibws`;
        let logBytes = 0;
        let partial = "";
        for await (const chunk of command.logs({ signal: abort.signal })) {
          partial += chunk.data;
          const lines = partial.split("\n");
          partial = lines.pop() ?? "";
          for (const line of lines) {
            const marker = /^@@(\S+)\s*(.*)$/.exec(line);
            if (marker) {
              const [, name, rest] = marker;
              if (name === "compiled") {
                send({
                  t: "phase",
                  phase: "compiled",
                  ms: elapsed(),
                  compileMs: Number(rest),
                });
              } else if (name === "compile-failed") {
                send({ t: "phase", phase: "compile-failed", ms: elapsed() });
              } else if (name === "enabled") {
                send({ t: "ready", wsUrl, ms: elapsed() });
              }
              continue;
            }
            if (logBytes < MAX_LOG_BYTES) {
              logBytes += line.length + 1;
              send({ t: "log", stream: chunk.stream, line });
            }
          }
        }
        const finished = await command.wait({ signal: abort.signal });
        send({
          t: "phase",
          phase: "exited",
          ms: elapsed(),
          exitCode: finished.exitCode,
        });
      } catch (error) {
        if (!abort.signal.aborted) {
          send({
            t: "error",
            message: error instanceof Error ? error.message : String(error),
          });
        }
      } finally {
        active -= 1;
        await sandbox?.stop().catch(() => undefined);
        try {
          controller.close();
        } catch {
          // Already closed by a cancel.
        }
      }
    },
    cancel() {
      abort.abort();
    },
  });

  return new Response(stream, {
    headers: {
      "Content-Type": "application/x-ndjson; charset=utf-8",
      "Cache-Control": "no-store",
      "X-Accel-Buffering": "no",
    },
  });
}
