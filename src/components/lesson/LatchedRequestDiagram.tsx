"use client";

/**
 * The latched-request explainer for `/running-program#latched`.
 *
 * The owner's November 2026 review asked for a picture here instead of a
 * paragraph: a release with no `whileFalse` is the most common confusion on
 * the bench, and it is a confusion about where a request lives. So the chain
 * is drawn left to right, the way a request travels: the controller, the
 * laptop running your code, the CANivore, and the TalonFX with its motor.
 *
 * Hold the button and `runFast()` sends `VoltageOut` 6 V every loop, drawn as
 * packets on the wires. Let go and the command is canceled, so the packets
 * stop, but the TalonFX box keeps showing the last request and the rotor
 * keeps turning. That is the whole lesson. Tick `whileFalse(stop())` and the
 * release starts `stop()` instead, which sends `NeutralOut`: that is what
 * `TalonFX.stopMotor()` sends in Phoenix 6 26.70.0-alpha-2 (it calls
 * `disable()`, which is `setControl(new NeutralOut())`).
 *
 * The packet rate is the eye's, not the robot's: a real loop is 20 ms.
 * `prefers-reduced-motion` freezes the packets and the rotor; the status
 * line still says everything the motion does.
 *
 * Colour: one accent for anything live. `--err` marks only the latched
 * request after a bare release, the state the diagram exists to show.
 */

import { useEffect, useRef, useState } from "react";
import { RotateCcw } from "lucide-react";

/** The binding is read at the moment of release, like the real one: changing
 *  the checkbox afterwards only changes what the next release does. */
type Phase = "idle" | "held" | "latched" | "stopped";

const PACKET_MS = 900;
const PACKETS = 3;

function usePrefersReducedMotion() {
  const [reduced, setReduced] = useState(false);
  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    setReduced(mq.matches);
    const onChange = () => setReduced(mq.matches);
    mq.addEventListener("change", onChange);
    return () => mq.removeEventListener("change", onChange);
  }, []);
  return reduced;
}

/** One wire between two boxes. Horizontal from `lg` up, vertical below. */
function Wire({
  sending,
  label,
  t,
  reduced,
}: {
  sending: boolean;
  label: string;
  t: number;
  reduced: boolean;
}) {
  const dots = sending
    ? Array.from({ length: PACKETS }, (_, i) =>
        reduced ? (i + 0.5) / PACKETS : (t / PACKET_MS + i / PACKETS) % 1
      )
    : [];
  const line = sending ? "var(--accent)" : "var(--rule)";
  return (
    <div className="relative flex shrink-0 items-center justify-center self-stretch lg:w-14 h-10 lg:h-auto">
      {/* the wire */}
      <div
        className="absolute left-1/2 top-0 h-full w-[2px] -translate-x-1/2 lg:left-0 lg:top-1/2 lg:h-[2px] lg:w-full lg:translate-x-0 lg:-translate-y-1/2"
        style={{ background: line }}
      />
      {dots.map((p, i) => (
        <span key={i} aria-hidden="true">
          <span
            className="absolute hidden h-2 w-2 -translate-x-1/2 -translate-y-1/2 rounded-full lg:block"
            style={{
              left: `${p * 100}%`,
              top: "50%",
              background: "var(--accent)",
            }}
          />
          <span
            className="absolute h-2 w-2 -translate-x-1/2 -translate-y-1/2 rounded-full lg:hidden"
            style={{
              top: `${p * 100}%`,
              left: "50%",
              background: "var(--accent)",
            }}
          />
        </span>
      ))}
      <span className="sr-only">{sending ? label : "nothing sent"}</span>
    </div>
  );
}

function Node({
  tag,
  title,
  children,
  live,
}: {
  tag: string;
  title: string;
  children: React.ReactNode;
  live: boolean;
}) {
  return (
    <div
      className="flex min-w-0 flex-1 flex-col gap-tight rounded-lg border px-control py-control"
      style={{
        borderColor: live ? "var(--accent)" : "var(--rule)",
        background: "var(--bg)",
      }}
    >
      <span className="micro">{tag}</span>
      <span className="text-note font-semibold" style={{ color: "var(--tx)" }}>
        {title}
      </span>
      {children}
    </div>
  );
}

export default function LatchedRequestDiagram() {
  const [phase, setPhase] = useState<Phase>("idle");
  const [whileFalse, setWhileFalse] = useState(false);
  const [{ t, angle }, setClock] = useState({ t: 0, angle: 0 });
  const reduced = usePrefersReducedMotion();
  const last = useRef<number | null>(null);

  const held = phase === "held";
  const stopRunning = phase === "stopped";
  const latched = phase === "latched";
  const sending = held || stopRunning;
  const spinning = held || latched;

  const command = held ? "runFast()" : stopRunning ? "stop()" : "nothing";
  const request = held ? "VoltageOut · 6 V" : "NeutralOut";
  const lastRequest =
    phase === "idle"
      ? "none yet"
      : stopRunning
        ? "NeutralOut"
        : "VoltageOut · 6 V";

  useEffect(() => {
    if (reduced || !(sending || spinning)) {
      last.current = null;
      return;
    }
    let raf = 0;
    const tick = (now: number) => {
      const dt = last.current === null ? 0 : now - last.current;
      last.current = now;
      setClock((c) => ({
        t: now,
        angle: spinning ? (c.angle + dt * 0.4) % 360 : c.angle,
      }));
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [reduced, sending, spinning]);

  const press = () => setPhase("held");
  const release = () =>
    setPhase((p) => (p === "held" ? (whileFalse ? "stopped" : "latched") : p));

  const status =
    phase === "idle"
      ? "Hold the button."
      : held
        ? "runFast() sends VoltageOut 6 V every loop, and the motor runs."
        : stopRunning
          ? "The release canceled runFast() and whileFalse started stop(). It sends NeutralOut, and the motor stops."
          : "The release canceled runFast(), so nothing is sending. The TalonFX keeps the last request it received, and the motor keeps running.";

  return (
    <figure className="module measure-wide m-0">
      <span className="module-tag">What a release sends</span>

      <div className="flex flex-col gap-pad px-panel pt-step pb-panel">
        <div className="flex flex-col lg:flex-row">
          <Node tag="Controller" title="Driver" live={held}>
            <button
              type="button"
              onPointerDown={(e) => {
                e.currentTarget.setPointerCapture(e.pointerId);
                press();
              }}
              onPointerUp={release}
              onPointerCancel={release}
              onKeyDown={(e) => {
                if ((e.key === " " || e.key === "Enter") && !e.repeat) {
                  e.preventDefault();
                  press();
                }
              }}
              onKeyUp={(e) => {
                if (e.key === " " || e.key === "Enter") release();
              }}
              onBlur={release}
              aria-pressed={held}
              className="mt-tight touch-none select-none rounded-lg border px-control py-chip text-note"
              style={{
                borderColor: "var(--accent)",
                background: held ? "var(--accent)" : "var(--bg3)",
                color: held ? "var(--accent-ink)" : "var(--tx)",
              }}
            >
              {held ? "Holding" : "Hold the button"}
            </button>
          </Node>

          <Wire sending={held} label="button held" t={t} reduced={reduced} />

          <Node tag="Laptop" title="Your code" live={sending}>
            <span className="text-note" style={{ color: "var(--tx2)" }}>
              Running: <code>{command}</code>
            </span>
          </Node>

          <Wire sending={sending} label={request} t={t} reduced={reduced} />

          <Node tag="USB · CAN" title="CANivore" live={sending}>
            <span className="text-note" style={{ color: "var(--tx2)" }}>
              {sending ? (
                <>
                  Passing on <code>{request}</code>
                </>
              ) : (
                "Nothing to pass on"
              )}
            </span>
          </Node>

          <Wire sending={sending} label={request} t={t} reduced={reduced} />

          <Node tag="Motor controller" title="TalonFX" live={spinning}>
            <span className="text-note" style={{ color: "var(--tx2)" }}>
              Last request:{" "}
              <code style={latched ? { color: "var(--err)" } : undefined}>
                {lastRequest}
              </code>
            </span>
            <div className="flex items-center gap-tight">
              <svg
                width="28"
                height="28"
                viewBox="-14 -14 28 28"
                aria-hidden="true"
              >
                <circle
                  r="12"
                  fill="none"
                  stroke={spinning ? "var(--accent)" : "var(--rule)"}
                  strokeWidth="2"
                />
                <line
                  x1="0"
                  y1="0"
                  x2="0"
                  y2="-10"
                  stroke={spinning ? "var(--accent)" : "var(--tx3)"}
                  strokeWidth="2.5"
                  strokeLinecap="round"
                  transform={`rotate(${angle})`}
                />
              </svg>
              <span
                className="text-note"
                style={{ color: latched ? "var(--err)" : "var(--tx2)" }}
              >
                {spinning ? "Motor running" : "Motor stopped"}
              </span>
            </div>
          </Node>
        </div>

        <p
          className="m-0 text-note"
          style={{ color: "var(--tx)" }}
          aria-live="polite"
        >
          {status}
        </p>

        <div className="flex flex-wrap items-center gap-pad">
          <label
            className="flex items-center gap-tight text-note"
            style={{ color: "var(--tx)" }}
          >
            <input
              type="checkbox"
              checked={whileFalse}
              onChange={(e) => setWhileFalse(e.target.checked)}
            />
            Bind <code>.whileFalse(stop())</code>
          </label>
          <button
            type="button"
            onClick={() => setPhase("idle")}
            disabled={phase === "idle"}
            className="flex items-center gap-tight rounded-lg border border-[var(--rule)] bg-[var(--bg3)] px-control py-chip text-note text-[var(--tx2)] disabled:opacity-40"
          >
            <RotateCcw className="h-[13px] w-[13px]" />
            Reset
          </button>
        </div>
      </div>
    </figure>
  );
}
