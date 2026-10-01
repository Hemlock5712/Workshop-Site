"use client";

import dynamic from "next/dynamic";
import {
  useCallback,
  useEffect,
  useRef,
  useState,
  useSyncExternalStore,
} from "react";
import { ArmViz } from "@/components/InteractivePidPlayground";
import { FlywheelViz } from "@/components/InteractiveFlywheelPlayground";

/**
 * Edit the lesson's Java, run it in real WPILib 2027 simulation, watch the
 * mechanism move. SPIKE, rendered only behind `NEXT_PUBLIC_SIM_SPIKE=1`.
 *
 * The browser does three things. It loads the lesson branch's files through
 * `/api/github` into Monaco. On Run it posts the open file to `/api/sim/run`,
 * which streams back progress and robot output. When that stream says the
 * robot is enabled, it opens the halsim_ws websocket in the sandbox directly:
 * telemetry arrives as a HAL SimDevice called "Workshop" (written by
 * `sim-runner/harness/.../Plant.java`), and the hold-to-press buttons send
 * Joystick messages, which is the same path a gamepad takes in the sim GUI.
 *
 * The arm and flywheel figures are the PID playgrounds' own, fed one live
 * sample at a time instead of a precomputed trace.
 */

const Editor = dynamic(
  () => import("@monaco-editor/react").then((m) => m.default),
  {
    ssr: false,
    loading: () => <div className="micro p-pad">loading editor…</div>,
  }
);

const FILES = [
  { name: "Arm.java", path: "src/main/java/first/robot/mechanisms/Arm.java" },
  {
    name: "Flywheel.java",
    path: "src/main/java/first/robot/mechanisms/Flywheel.java",
  },
  {
    name: "MyTeleop.java",
    path: "src/main/java/first/robot/opmode/MyTeleop.java",
  },
] as const;
type FileName = (typeof FILES)[number]["name"];

/** The controls MyTeleop binds, as the Xbox axes and buttons NiDs reports. */
const CONTROLS = [
  { id: "lt", label: "Left trigger", axis: 2 },
  { id: "rt", label: "Right trigger", axis: 3 },
  { id: "a", label: "A", button: 0 },
] as const;
type ControlId = (typeof CONTROLS)[number]["id"];

type Phase =
  | "idle"
  | "booting"
  | "booted"
  | "compiling"
  | "compiled"
  | "compile-failed"
  | "running"
  | "exited"
  | "error";

interface Telemetry {
  armRotations: number;
  armReferenceRotations: number;
  armVolts: number;
  flywheelRps: number;
  flywheelReferenceRps: number;
  flywheelVolts: number;
  simSeconds: number;
}

const ZERO: Telemetry = {
  armRotations: 0.5,
  armReferenceRotations: 0,
  armVolts: 0,
  flywheelRps: 0,
  flywheelReferenceRps: 0,
  flywheelVolts: 0,
  simSeconds: 0,
};

/**
 * The arm's CANcoder reads 0.5 rotations lying on the intake side and 0.25
 * straight up. The playground figure draws 0° horizontal and 90° up, so the
 * two meet at 180° − 360° × rotations.
 */
const armDegrees = (rotations: number) => 180 - rotations * 360;

const noopSubscribe = () => () => {};

function decodeBase64Utf8(b64: string): string {
  const bytes = Uint8Array.from(atob(b64.replace(/\s/g, "")), (c) =>
    c.charCodeAt(0)
  );
  return new TextDecoder().decode(bytes);
}

export default function LiveSimPanel({ branch }: { branch: string }) {
  const [sources, setSources] = useState<Partial<Record<FileName, string>>>({});
  const [active, setActive] = useState<FileName>("Arm.java");
  const [phase, setPhase] = useState<Phase>("idle");
  const [log, setLog] = useState<string[]>([]);
  const [timing, setTiming] = useState<Record<string, number>>({});
  const [telemetry, setTelemetry] = useState<Telemetry>(ZERO);
  const [wheelAngle, setWheelAngle] = useState(0);
  const [held, setHeld] = useState<Record<ControlId, boolean>>({
    lt: false,
    rt: false,
    a: false,
  });

  const abortRef = useRef<AbortController | null>(null);
  const wsRef = useRef<WebSocket | null>(null);
  const runStartRef = useRef(0);
  const lastFrameRef = useRef(0);

  useEffect(() => {
    let cancelled = false;
    for (const file of FILES) {
      const params = new URLSearchParams({
        repo: "Hemlock5712/Workshop-Code",
        resource: "file",
        path: file.path,
        ref: branch,
      });
      fetch(`/api/github?${params}`)
        .then((r) => (r.ok ? r.json() : Promise.reject(r.status)))
        .then((json: { content?: string }) => {
          if (cancelled || !json.content) return;
          const text = decodeBase64Utf8(json.content);
          setSources((s) => ({ ...s, [file.name]: text }));
        })
        .catch(() => undefined);
    }
    return () => {
      cancelled = true;
    };
  }, [branch]);

  // Integrate the wheel's angle from its speed so the spokes turn smoothly
  // between the 50 Hz samples.
  useEffect(() => {
    let frame = 0;
    const tick = (now: number) => {
      const dt = lastFrameRef.current ? (now - lastFrameRef.current) / 1000 : 0;
      lastFrameRef.current = now;
      setWheelAngle(
        (a) => (a + telemetry.flywheelRps * 2 * Math.PI * dt) % (2 * Math.PI)
      );
      frame = requestAnimationFrame(tick);
    };
    frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
  }, [telemetry.flywheelRps]);

  const sendJoystick = useCallback((next: Record<ControlId, boolean>) => {
    const ws = wsRef.current;
    if (!ws || ws.readyState !== WebSocket.OPEN) return;
    const axes = [0, 0, 0, 0, 0, 0];
    const buttons = Array<boolean>(16).fill(false);
    for (const c of CONTROLS) {
      if (!next[c.id]) continue;
      if ("axis" in c) axes[c.axis] = 1;
      else buttons[c.button] = true;
    }
    ws.send(
      JSON.stringify({
        type: "Joystick",
        device: "0",
        data: { ">axes": axes, ">buttons": buttons },
      })
    );
  }, []);

  const press = (id: ControlId, down: boolean) =>
    setHeld((h) => {
      if (h[id] === down) return h;
      const next = { ...h, [id]: down };
      sendJoystick(next);
      return next;
    });

  const connect = useCallback(
    (url: string) => {
      const ws = new WebSocket(url);
      wsRef.current = ws;
      ws.onopen = () => {
        setTiming((t) => ({ ...t, socket: Date.now() - runStartRef.current }));
        sendJoystick({ lt: false, rt: false, a: false });
      };
      ws.onmessage = (event) => {
        const msg = JSON.parse(String(event.data)) as {
          type: string;
          device?: string;
          data: Record<string, number>;
        };
        if (msg.type !== "SimDevice" || msg.device !== "Workshop") return;
        setTiming((t) =>
          t.firstSample
            ? t
            : { ...t, firstSample: Date.now() - runStartRef.current }
        );
        setTelemetry((prev) => {
          const next = { ...prev };
          for (const [key, value] of Object.entries(msg.data)) {
            const name = key.replace(/^[<>]+/, "") as keyof Telemetry;
            if (name in next) next[name] = value;
          }
          return next;
        });
      };
      ws.onclose = () => {
        if (wsRef.current === ws) wsRef.current = null;
      };
    },
    [sendJoystick]
  );

  const stop = useCallback(() => {
    abortRef.current?.abort();
    abortRef.current = null;
    wsRef.current?.close();
    wsRef.current = null;
    setHeld({ lt: false, rt: false, a: false });
  }, []);

  useEffect(() => stop, [stop]);

  const run = async () => {
    const source = sources[active];
    if (source === undefined) return;
    stop();
    const abort = new AbortController();
    abortRef.current = abort;
    runStartRef.current = Date.now();
    setLog([]);
    setTiming({});
    setTelemetry(ZERO);
    setPhase("booting");

    try {
      const res = await fetch("/api/sim/run", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ file: active, source }),
        signal: abort.signal,
      });
      if (!res.ok || !res.body) {
        const body = (await res.json().catch(() => ({}))) as { error?: string };
        setLog([body.error ?? `HTTP ${res.status}`]);
        setPhase("error");
        return;
      }
      const reader = res.body.pipeThrough(new TextDecoderStream()).getReader();
      let partial = "";
      for (;;) {
        const { value, done } = await reader.read();
        if (done) break;
        partial += value;
        const lines = partial.split("\n");
        partial = lines.pop() ?? "";
        for (const line of lines) {
          if (!line) continue;
          const event = JSON.parse(line) as Record<string, unknown>;
          if (event.t === "phase") {
            setPhase(event.phase as Phase);
            setTiming((t) => ({
              ...t,
              [String(event.phase)]: Number(event.ms),
            }));
          } else if (event.t === "log") {
            setLog((l) => (l.length > 400 ? l : [...l, String(event.line)]));
          } else if (event.t === "ready") {
            setPhase("running");
            setTiming((t) => ({ ...t, ready: Number(event.ms) }));
            connect(String(event.wsUrl));
          } else if (event.t === "error") {
            setLog((l) => [...l, String(event.message)]);
            setPhase("error");
          }
        }
      }
    } catch {
      if (!abort.signal.aborted) setPhase("error");
    } finally {
      if (abortRef.current === abort) abortRef.current = null;
      wsRef.current?.close();
    }
  };

  const busy = [
    "booting",
    "booted",
    "compiling",
    "compiled",
    "running",
  ].includes(phase);
  // The figures only ever show live data, so they render on the client alone.
  // Server and browser disagree in the fifteenth digit of the SVG trig, which
  // is a hydration mismatch React will not patch.
  const mounted = useSyncExternalStore(
    noopSubscribe,
    () => true,
    () => false
  );
  const armDeg = armDegrees(telemetry.armRotations);
  const armTargetDeg = telemetry.armReferenceRotations
    ? armDegrees(telemetry.armReferenceRotations)
    : armDeg;

  return (
    <section
      aria-label="Run this code in simulation"
      className="measure-wide flex flex-col gap-flow"
      style={{ border: "1px solid var(--rule)", background: "var(--bg2)" }}
    >
      <div
        className="flex flex-wrap items-center gap-control px-pad pt-pad"
        role="tablist"
        aria-label="File to edit"
      >
        <span className="micro">Simulation preview</span>
        {FILES.map((f) => (
          <button
            key={f.name}
            role="tab"
            aria-selected={active === f.name}
            onClick={() => setActive(f.name)}
            className="mono text-meta"
            style={{
              color: active === f.name ? "var(--accent)" : "var(--tx3)",
              borderBottom:
                active === f.name
                  ? "1px solid var(--accent)"
                  : "1px solid transparent",
            }}
          >
            {f.name}
          </button>
        ))}
      </div>

      <div style={{ height: 380 }}>
        {sources[active] === undefined ? (
          <div className="micro p-pad">
            loading {active} from {branch}…
          </div>
        ) : (
          <Editor
            language="java"
            theme="vs-dark"
            value={sources[active]}
            onChange={(text) =>
              setSources((s) => ({ ...s, [active]: text ?? "" }))
            }
            options={{
              minimap: { enabled: false },
              fontSize: 13,
              scrollBeyondLastLine: false,
              tabSize: 2,
            }}
          />
        )}
      </div>

      <div className="flex flex-wrap items-center gap-control px-pad">
        <button
          onClick={busy ? stop : run}
          disabled={sources[active] === undefined}
          className="px-[18px] py-2.5 text-note font-medium"
          style={{
            background: busy ? "var(--bg3)" : "var(--accent)",
            color: busy ? "var(--tx)" : "var(--accent-ink)",
            borderRadius: 2,
          }}
        >
          {busy ? "Stop" : `Run with ${active}`}
        </button>
        <span className="mono text-meta" style={{ color: "var(--tx3)" }}>
          {phase}
          {timing.compiled !== undefined &&
            ` · compiled at ${timing.compiled} ms`}
          {timing.ready !== undefined && ` · enabled at ${timing.ready} ms`}
          {timing.firstSample !== undefined &&
            ` · first sample at ${timing.firstSample} ms`}
        </span>
      </div>

      <div className="grid grid-cols-1 gap-flow px-pad sm:grid-cols-2">
        <figure className="m-0">
          <div style={{ aspectRatio: "1 / 1", width: "100%", maxWidth: 260 }}>
            {mounted && (
              <ArmViz
                responseTheta={new Float64Array([armDeg])}
                targetDeg={armTargetDeg}
                initialDeg={armDeg}
                durationSec={1}
                reducedMotion
              />
            )}
          </div>
          <figcaption
            className="mono text-meta"
            style={{ color: "var(--tx3)" }}
          >
            arm {telemetry.armRotations.toFixed(3)} rot · target{" "}
            {telemetry.armReferenceRotations.toFixed(3)} ·{" "}
            {telemetry.armVolts.toFixed(2)} V
          </figcaption>
        </figure>
        <figure className="m-0">
          <div style={{ aspectRatio: "1 / 1", width: "100%", maxWidth: 260 }}>
            {mounted && (
              <FlywheelViz
                responseAngleRad={new Float64Array([wheelAngle])}
                responseRpm={new Float64Array([telemetry.flywheelRps * 60])}
                durationSec={1}
                reducedMotion
              />
            )}
          </div>
          <figcaption
            className="mono text-meta"
            style={{ color: "var(--tx3)" }}
          >
            flywheel {telemetry.flywheelRps.toFixed(1)} rps · target{" "}
            {telemetry.flywheelReferenceRps.toFixed(1)} ·{" "}
            {telemetry.flywheelVolts.toFixed(2)} V
          </figcaption>
        </figure>
      </div>

      <div className="flex flex-wrap items-center gap-control px-pad">
        <span className="micro">Hold</span>
        {CONTROLS.map((c) => (
          <button
            key={c.id}
            aria-pressed={held[c.id]}
            disabled={phase !== "running"}
            onPointerDown={() => press(c.id, true)}
            onPointerUp={() => press(c.id, false)}
            onPointerLeave={() => press(c.id, false)}
            onKeyDown={(e) => {
              if (e.key === " " || e.key === "Enter") press(c.id, true);
            }}
            onKeyUp={(e) => {
              if (e.key === " " || e.key === "Enter") press(c.id, false);
            }}
            className="px-3 py-1.5 text-note"
            style={{
              border: "1px solid var(--rule)",
              borderRadius: 2,
              background: held[c.id] ? "var(--accent-soft)" : "var(--bg)",
              color: held[c.id] ? "var(--accent)" : "var(--tx2)",
            }}
          >
            {c.label}
          </button>
        ))}
      </div>

      <pre
        aria-label="Compiler and robot output"
        className="mono m-0 overflow-auto px-pad pb-pad text-meta"
        style={{ maxHeight: 180, color: "var(--tx2)" }}
      >
        {log.join("\n") || " "}
      </pre>
    </section>
  );
}
