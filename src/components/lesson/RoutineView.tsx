"use client";

/**
 * One routine on `/coroutines`, as a Code / Timeline toggle.
 *
 * Owner's call, November 2026: every finished routine gets a picture, and the
 * picture shares a frame with its code so the page does not double in length.
 * Code is the default tab and is passed in as an already-rendered
 * `<CodeBlock>`, so Shiki still runs on the server. Both panels stay in the
 * HTML and the hidden one gets `hidden`, so search and no-JS readers still see
 * the code.
 *
 * The timeline replaced `CoroutineTimeline`, an 1100-line node diagram drawn
 * for the autonomous only. This one is data-driven and reads like a schedule
 * chart: a row per line of the routine, with a bar where the routine sits on
 * that line, and below them a lane per mechanism showing which command owns
 * it. A `fork` is a dot, because it returns on the same loop. A wait is a bar.
 * The point the picture makes is that the mechanism lanes keep moving while
 * the routine is parked on a wait.
 *
 * Times are illustrative bench numbers, not measured on every robot: half a
 * second for the arm to travel 90 degrees, 0.6 s for the flywheel to reach
 * 75 rps. A `fork` takes no time on the robot, so playback dwells on it for a
 * moment with the clock frozen, or nobody would ever see it light up.
 *
 * Colour is one hue: accent for what is running, a hatch for what the motor
 * keeps doing after the routine has ended (a latched request, or a coast).
 */

import {
  useCallback,
  useEffect,
  useId,
  useMemo,
  useRef,
  useState,
} from "react";
import type { KeyboardEvent, ReactNode } from "react";
import { Pause, Play, RotateCcw } from "lucide-react";

export type RoutineStep = {
  /** The line as it reads in the code, shortened if it has to be. */
  line: string;
  /** Times, in robot seconds, when the routine is on this line. [t, t] is a fork or a print. */
  at?: [number, number][];
  /** What the caption says while the routine is on this line. */
  note?: string;
};

export type RoutineSegment = {
  from: number;
  to: number;
  label: string;
  /** "after" is drawn hatched: the routine is over and the motor carries on. */
  kind?: "run" | "after";
};

export type RoutineLane = { name: string; segments: RoutineSegment[] };

interface RoutineViewProps {
  /** A rendered `<CodeBlock>`. */
  code: ReactNode;
  steps: RoutineStep[];
  lanes: RoutineLane[];
  /** When the routine's body runs out of lines. */
  end: number;
  /** Width of the time axis, in seconds. */
  total: number;
  /** Caption once the routine has ended. */
  endNote: string;
}

type Visit = { step: number; from: number; to: number };

const DWELL_MS = 650; // how long playback lingers on an instant line
const SPEED = 0.6; // robot seconds per real second while waiting

export default function RoutineView({
  code,
  steps,
  lanes,
  end,
  total,
  endNote,
}: RoutineViewProps) {
  const [tab, setTab] = useState<"code" | "timeline">("code");
  const id = useId();
  const tabs = ["code", "timeline"] as const;
  const onKey = (e: KeyboardEvent) => {
    if (e.key !== "ArrowLeft" && e.key !== "ArrowRight") return;
    e.preventDefault();
    const next = tab === "code" ? "timeline" : "code";
    setTab(next);
    document.getElementById(`${id}-tab-${next}`)?.focus();
  };

  return (
    <div
      className="measure-wide overflow-hidden"
      style={{ border: "1px solid var(--rule)", borderRadius: 3 }}
    >
      <div
        role="tablist"
        aria-label="Routine view"
        className="flex"
        style={{
          borderBottom: "1px solid var(--rule)",
          background: "var(--bg2)",
        }}
      >
        {tabs.map((t) => (
          <button
            key={t}
            id={`${id}-tab-${t}`}
            role="tab"
            type="button"
            aria-selected={tab === t}
            aria-controls={`${id}-panel-${t}`}
            tabIndex={tab === t ? 0 : -1}
            onClick={() => setTab(t)}
            onKeyDown={onKey}
            className="micro px-4 py-2"
            style={{
              color: tab === t ? "var(--accent)" : "var(--tx3)",
              borderBottom: `2px solid ${tab === t ? "var(--accent)" : "transparent"}`,
              marginBottom: -1,
            }}
          >
            {t === "code" ? "Code" : "Timeline"}
          </button>
        ))}
      </div>
      <div
        role="tabpanel"
        id={`${id}-panel-code`}
        aria-labelledby={`${id}-tab-code`}
        hidden={tab !== "code"}
        className="[&>.code-card]:border-0"
      >
        {code}
      </div>
      <div
        role="tabpanel"
        id={`${id}-panel-timeline`}
        aria-labelledby={`${id}-tab-timeline`}
        hidden={tab !== "timeline"}
      >
        {tab === "timeline" && (
          <Timeline
            steps={steps}
            lanes={lanes}
            end={end}
            total={total}
            endNote={endNote}
          />
        )}
      </div>
    </div>
  );
}

function Timeline({
  steps,
  lanes,
  end,
  total,
  endNote,
}: Omit<RoutineViewProps, "code">) {
  // The main flow is sequential, so its visits sort by start time, then by line.
  const visits = useMemo<Visit[]>(
    () =>
      steps
        .flatMap((s, step) =>
          (s.at ?? []).map(([from, to]) => ({ step, from, to }))
        )
        .sort((a, b) => a.from - b.from || a.step - b.step),
    [steps]
  );

  const [t, setT] = useState(0);
  const [visit, setVisit] = useState(-1); // -1: not started, show everything
  const [playing, setPlaying] = useState(false);
  const frame = useRef<number | null>(null);
  const clock = useRef({ last: 0, dwell: 0, t: 0, visit: -1 });

  const stop = useCallback(() => {
    if (frame.current !== null) cancelAnimationFrame(frame.current);
    frame.current = null;
    setPlaying(false);
  }, []);

  useEffect(() => stop, [stop]);

  const tickRef = useRef<(now: number) => void>(() => {});
  const tick = useCallback(
    (now: number) => {
      const c = clock.current;
      const dt = now - c.last;
      c.last = now;
      const v = visits[c.visit];
      if (v && v.from === v.to) {
        c.dwell += dt;
        if (c.dwell >= DWELL_MS) {
          c.dwell = 0;
          c.visit += 1;
        }
      } else {
        c.t = Math.min(total, c.t + (dt / 1000) * SPEED);
        if (v && c.t >= v.to) {
          c.t = v.to;
          c.visit += 1;
        }
      }
      if (c.visit >= visits.length && c.t < total) {
        c.t = Math.min(total, c.t + (dt / 1000) * SPEED);
      }
      setT(c.t);
      setVisit(c.visit);
      if (c.t >= total && c.visit >= visits.length) {
        stop();
        return;
      }
      frame.current = requestAnimationFrame(tickRef.current);
    },
    [visits, total, stop]
  );

  useEffect(() => {
    tickRef.current = tick;
  }, [tick]);

  const play = () => {
    const c = clock.current;
    if (c.visit < 0 || (c.t >= total && c.visit >= visits.length)) {
      c.t = 0;
      c.visit = 0;
      c.dwell = 0;
    }
    c.last = performance.now();
    setPlaying(true);
    frame.current = requestAnimationFrame(tick);
  };

  const reset = () => {
    stop();
    clock.current = { last: 0, dwell: 0, t: 0, visit: -1 };
    setT(0);
    setVisit(-1);
  };

  const scrub = (value: number) => {
    stop();
    let idx = visits.length;
    for (let i = 0; i < visits.length; i++) {
      if (visits[i].from <= value && value < visits[i].to + 1e-6) {
        idx = i;
      } else if (visits[i].from > value) {
        if (idx === visits.length) idx = Math.max(0, i - 1);
        break;
      }
    }
    if (value >= end) idx = visits.length;
    clock.current = { last: 0, dwell: 0, t: value, visit: idx };
    setT(value);
    setVisit(idx);
  };

  const started = visit >= 0;
  const done = started && visit >= visits.length;
  const current = started && !done ? visits[visit] : null;
  const pct = (x: number) => `${(x / total) * 100}%`;
  const caption = !started
    ? "Press play, or drag the slider, to step through the routine."
    : done
      ? endNote
      : (steps[current!.step].note ?? "");

  const ticks: number[] = [];
  for (let x = 0; x <= total + 1e-6; x += 0.5)
    ticks.push(Math.round(x * 10) / 10);

  // Every track draws its own tick lines, end line and time marker. They line up
  // because every track has the same width, and on a phone, where each label
  // sits above its track, nothing has to span rows of a different shape.
  const track = (children: ReactNode, key: string) => (
    <div key={key} className="relative h-7">
      {ticks.map((x) => (
        <span
          key={x}
          className="absolute top-0 bottom-0"
          style={{ left: pct(x), borderLeft: "1px solid var(--rule-soft)" }}
        />
      ))}
      <span
        className="absolute top-0 bottom-0"
        style={{ left: pct(end), borderLeft: "1px dashed var(--tx3)" }}
      />
      {children}
      {started && (
        <span
          className="pointer-events-none absolute top-0 bottom-0"
          style={{ left: pct(t), borderLeft: "2px solid var(--tx)" }}
        />
      )}
    </div>
  );

  return (
    <div className="p-pad" style={{ background: "var(--bg)" }}>
      <Row>
        <span className="micro hidden sm:block" style={{ color: "var(--tx3)" }}>
          Routine
        </span>
        <div className="relative h-6">
          {ticks.map((x) => (
            <span
              key={x}
              className="mono absolute top-1 -translate-x-1/2"
              style={{
                left: pct(x),
                fontSize: "var(--text-micro)",
                color: "var(--tx3)",
              }}
            >
              {x.toFixed(1)}
            </span>
          ))}
        </div>
      </Row>

      {steps.map((s, i) => {
        const active = current?.step === i;
        const dim = started && !active;
        return (
          <Row key={i} active={active}>
            <code
              className="block truncate pt-1 pl-2 sm:py-1"
              title={s.line}
              style={{
                fontSize: "var(--text-note)",
                color: dim ? "var(--tx3)" : "var(--tx)",
                background: "transparent",
                whiteSpace: "pre",
              }}
            >
              {s.line}
            </code>
            {track(
              (s.at ?? []).map(([a, b], k) =>
                a === b ? (
                  <span
                    key={k}
                    className="absolute top-1/2 h-2.5 w-2.5 -translate-x-1/2 -translate-y-1/2 rotate-45"
                    style={{
                      left: pct(a),
                      background: "var(--accent)",
                      opacity: dim ? 0.45 : 1,
                    }}
                  />
                ) : (
                  <span
                    key={k}
                    className="absolute top-1.5 bottom-1.5"
                    style={{
                      left: pct(a),
                      width: pct(b - a),
                      background: "var(--accent-soft)",
                      border: "1px dashed var(--accent)",
                      borderRadius: 2,
                      opacity: dim ? 0.45 : 1,
                    }}
                  />
                )
              ),
              `t${i}`
            )}
          </Row>
        );
      })}

      <div
        className="micro mt-3 mb-1 pt-2"
        style={{ color: "var(--tx3)", borderTop: "1px solid var(--rule)" }}
      >
        Mechanisms
      </div>
      {lanes.map((lane) => (
        <Row key={lane.name}>
          <span
            className="pt-1 pl-2 sm:py-1"
            style={{ fontSize: "var(--text-note)", color: "var(--tx)" }}
          >
            {lane.name}
          </span>
          {track(
            lane.segments.map((seg, k) => (
              <span
                key={k}
                className="mono absolute top-0.5 bottom-0.5 flex items-center overflow-hidden px-1.5 whitespace-nowrap"
                title={seg.label}
                style={{
                  left: pct(seg.from),
                  width: pct(seg.to - seg.from),
                  fontSize: "var(--text-micro)",
                  borderRadius: 2,
                  ...(seg.kind === "after"
                    ? {
                        color: "var(--tx2)",
                        border: "1px solid var(--rule)",
                        background:
                          "repeating-linear-gradient(135deg, var(--bg2) 0 5px, var(--bg3) 5px 10px)",
                      }
                    : {
                        color: "var(--accent-ink)",
                        background: "var(--accent)",
                      }),
                }}
              >
                {seg.label}
              </span>
            )),
            lane.name
          )}
        </Row>
      ))}
      <Row>
        <span className="hidden sm:block" />
        <div className="relative h-5">
          <span
            className="micro absolute top-1 -translate-x-1/2 whitespace-nowrap"
            style={{ left: pct(end), color: "var(--tx3)" }}
          >
            routine ends
          </span>
        </div>
      </Row>

      <div className="mt-pad flex flex-wrap items-center gap-3">
        <button
          type="button"
          onClick={playing ? stop : play}
          aria-label={playing ? "Pause" : "Play"}
          className="flex h-8 w-8 items-center justify-center"
          style={{
            border: "1px solid var(--rule)",
            borderRadius: 3,
            color: "var(--tx)",
          }}
        >
          {playing ? (
            <Pause className="h-4 w-4" />
          ) : (
            <Play className="h-4 w-4" />
          )}
        </button>
        <button
          type="button"
          onClick={reset}
          aria-label="Reset"
          className="flex h-8 w-8 items-center justify-center"
          style={{
            border: "1px solid var(--rule)",
            borderRadius: 3,
            color: "var(--tx2)",
          }}
        >
          <RotateCcw className="h-4 w-4" />
        </button>
        <input
          type="range"
          min={0}
          max={total}
          step={0.02}
          value={t}
          onChange={(e) => scrub(Number(e.target.value))}
          aria-label="Robot time"
          className="min-w-[140px] flex-1"
          style={{ accentColor: "var(--accent)" }}
        />
        <span
          className="mono w-14 text-right"
          style={{ fontSize: "var(--text-note)", color: "var(--tx2)" }}
        >
          {t.toFixed(2)} s
        </span>
      </div>
      <p
        className="m-0 mt-2"
        aria-live="polite"
        style={{
          fontSize: "var(--text-note)",
          color: "var(--tx2)",
          minHeight: "2.6em",
        }}
      >
        {caption}
      </p>
    </div>
  );
}

/** Label and track side by side, or stacked on a phone. Highlighted when active. */
function Row({
  children,
  active = false,
}: {
  children: ReactNode[];
  active?: boolean;
}) {
  return (
    <div
      className="grid grid-cols-1 items-center gap-x-4 sm:grid-cols-[15rem_1fr]"
      style={{
        background: active ? "var(--accent-soft)" : "transparent",
        borderRadius: 2,
      }}
    >
      {children}
    </div>
  );
}
