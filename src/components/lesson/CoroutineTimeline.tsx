"use client";

/**
 * The parallel-flow diagram for `/coroutines`, with a step-through simulation.
 *
 * The "Four verbs" table above it defines fork, await, waitUntil and yield.
 * This shows them running at once: the routine reads top to bottom down the
 * left, and every `fork` peels a second flow off to the right that keeps
 * running beside it.
 *
 * Press play and the routine walks itself. The point a static picture cannot
 * make is the one the simulation makes twice: when the main flow parks on an
 * `await`, the forked lanes keep moving. The chevrons in those lanes scroll
 * for the entire time the left column is frozen on a dashed box.
 *
 * The clock is the robot's, not the animation's. Each state dwells long enough
 * on screen to be read, which is why a `fork` that really takes one 20 ms loop
 * gets a full second of attention. The clock only advances during the parked
 * states, where the time actually goes, and 0.50 / 0.60 / 1.00 s are the bench
 * numbers off `mech-5-Coroutines`.
 *
 * With no step selected the whole diagram renders at full strength, so a
 * reader who never presses play still gets the complete static reference.
 * `prefers-reduced-motion` suppresses autoplay and the scrolling chevrons; the
 * step buttons still work.
 *
 * Layout is a hybrid on purpose. Node boxes are absolutely positioned HTML, so
 * code strings wrap and inherit the real fonts; every connector is one SVG
 * layer behind them, because a peel-off curve and a dashed wake-up arrow are
 * not things CSS borders can draw. Both read the constants below, so moving a
 * node moves its arrows.
 *
 * Colour: one hue. A solid border means the flow is executing, a dashed border
 * means it is parked, and `--ok` marks only the instant a condition flips
 * true. `--err` appears once, in the deadlock panel.
 */

import { useCallback, useEffect, useReducer, useRef, useState } from "react";
import { Pause, Play, RotateCcw, SkipForward } from "lucide-react";

// ── geometry ────────────────────────────────────────────────────────────
const W = 880;
const H = 684;

const MAIN_X = 20;
const MAIN_W = 330;
const MAIN_CX = MAIN_X + MAIN_W / 2;
const MAIN_R = MAIN_X + MAIN_W;

const ARM_X = 410;
const FLY_X = 640;
const LANE_W = 190;

/** How far below the fork call a lane starts. The peel-off curve needs the
 *  room: any less and the curve bottoms out under the lane top, which flips
 *  the final segment upwards and points the arrowhead backwards. */
const FORK_DROP = 44;
const CURVE_R = 30;

type NodeSpec = {
  y: number;
  h: number;
  lines: string[];
  tag: string;
  parked?: boolean;
};

const NODES: NodeSpec[] = [
  {
    y: 20,
    h: 58,
    lines: ["coroutine.fork(arm.vertical());"],
    tag: "runs · returns on the same loop",
  },
  {
    y: 122,
    h: 74,
    lines: ["coroutine.await(", "    Command.waitUntil(arm::isAtTarget));"],
    tag: "parked · 0.50 s",
    parked: true,
  },
  {
    y: 238,
    h: 58,
    lines: ["coroutine.fork(flywheel.runFast());"],
    tag: "runs · returns on the same loop",
  },
  {
    y: 340,
    h: 74,
    lines: [
      "coroutine.await(",
      "    Command.waitUntil(flywheel::isAtTarget));",
    ],
    tag: "parked · 0.60 s",
    parked: true,
  },
  {
    y: 456,
    h: 58,
    lines: ["coroutine.wait(Seconds.of(1.0));"],
    tag: "parked · 1.00 s",
    parked: true,
  },
  {
    y: 558,
    h: 52,
    lines: ["// the body runs out of lines"],
    tag: "routine finishes",
  },
];

const midY = (n: NodeSpec) => n.y + n.h / 2;
const BOTTOM = NODES[5].y + NODES[5].h;
const CANCEL_Y = 640;

type Branch = {
  x: number;
  cx: number;
  top: number;
  name: string;
  sub: string;
  forkFrom: number;
  wakeY: number;
  wakeLabel: string;
  /** the step this lane is forked on, and the park step it later wakes */
  bornAt: number;
  wakeStep: number;
  kind: "arm" | "flywheel";
  /** what the gauge reads at a given 0..1 progress toward its target */
  readout: (level: number, cancelled: boolean) => string;
};

function branch(
  x: number,
  forkNode: number,
  parkNode: number,
  rest: Omit<Branch, "x" | "cx" | "top" | "forkFrom" | "wakeY">
): Branch {
  const forkFrom = midY(NODES[forkNode]);
  return {
    x,
    cx: x + LANE_W / 2,
    top: forkFrom + FORK_DROP,
    forkFrom,
    wakeY: midY(NODES[parkNode]),
    ...rest,
  };
}

const BRANCHES: Branch[] = [
  branch(ARM_X, 0, 1, {
    name: "arm.vertical()",
    sub: "runRepeatedly · never finishes",
    wakeLabel: "arm::isAtTarget",
    bornAt: 0,
    wakeStep: 1,
    kind: "arm",
    readout: (level, cancelled) =>
      cancelled
        ? "cancelled · still holding 90°"
        : level >= 1
          ? "holding 90°"
          : `${Math.round(level * 90)}° of 90°`,
  }),
  branch(FLY_X, 2, 3, {
    name: "flywheel.runFast()",
    sub: "runRepeatedly · never finishes",
    wakeLabel: "flywheel::isAtTarget",
    bornAt: 2,
    wakeStep: 3,
    kind: "flywheel",
    readout: (level, cancelled) =>
      cancelled
        ? "cancelled · still spinning"
        : level >= 1
          ? "holding 75 rps"
          : `${Math.round(level * 75)} of 75 rps`,
  }),
];

/** Where a lane's little mechanism gauge sits, and how tall it is. */
const GAUGE_DY = 96;
const GAUGE_H = 58;

// ── the simulation ──────────────────────────────────────────────────────
type Step = {
  node: number;
  parked: boolean;
  from: number;
  to: number;
  dwell: number;
  status: string;
};

const STEPS: Step[] = [
  {
    node: 0,
    parked: false,
    from: 0,
    to: 0,
    dwell: 1100,
    status:
      "fork starts the arm and returns on the very same loop. The routine does not wait for it.",
  },
  {
    node: 1,
    parked: true,
    from: 0,
    to: 0.5,
    dwell: 2100,
    status:
      "The routine is parked on await. The arm flow keeps running the whole time.",
  },
  {
    node: 2,
    parked: false,
    from: 0.5,
    to: 0.5,
    dwell: 1100,
    status:
      "Awake for one loop: fork the flywheel, then straight on to the next line.",
  },
  {
    node: 3,
    parked: true,
    from: 0.5,
    to: 1.1,
    dwell: 2100,
    status: "Parked again, and now both forks are running beside it.",
  },
  {
    node: 4,
    parked: true,
    from: 1.1,
    to: 2.1,
    dwell: 2100,
    status:
      "wait parks for a fixed time instead of a condition. Both forks still run through it.",
  },
  {
    node: 5,
    parked: false,
    from: 2.1,
    to: 2.1,
    dwell: 1800,
    status:
      "The body runs out of lines, so the routine finishes and both forks are cancelled.",
  },
];

const LAST = STEPS.length - 1;

/** The flywheel's spin-up step. The rAF loop needs this without a closure
 *  over React state, so the ramp is computed straight off the sim snapshot. */
const FLY_WAKE_STEP = 3;
function flyLevel(s: { step: number | null; progress: number }) {
  if (s.step === null) return 1;
  if (s.step < FLY_WAKE_STEP) return 0;
  if (s.step === FLY_WAKE_STEP) return s.progress;
  return 1;
}
const CHEVRON_GAP = 62;

/** A tint, not a block: 34% went muddy over an area this size. */
const LANE_FILL = "color-mix(in oklch, var(--accent) 16%, transparent)";

/**
 * The little mechanism inside a forked lane. This is what makes an `await`
 * worth watching: the left column sits frozen on a dashed box while the arm
 * visibly swings to 90° and the flywheel visibly spins up to speed.
 *
 * The arm sweeps 0° to 90° with `level`. The flywheel's disc turns on `spin`,
 * which the animation loop advances in proportion to `level`, so it starts
 * slow and winds up rather than snapping to full speed.
 */
function MechGauge({
  kind,
  cx,
  cy,
  level,
  spin,
  dim,
}: {
  kind: "arm" | "flywheel";
  cx: number;
  cy: number;
  level: number;
  spin: number;
  dim: boolean;
}) {
  const o = dim ? 0.25 : 1;

  if (kind === "arm") {
    const L = 34;
    const px = cx - 14;
    const py = cy + 17;
    const a = (level * 90 * Math.PI) / 180;
    return (
      <g opacity={o}>
        {/* the setpoint, and the floor it swings from */}
        <line
          x1={px}
          y1={py}
          x2={px}
          y2={py - L}
          stroke="var(--ok)"
          strokeWidth="1.5"
          strokeDasharray="3 3"
          strokeOpacity="0.7"
        />
        <line
          x1={px - 4}
          y1={py}
          x2={px + L + 6}
          y2={py}
          stroke="var(--rule)"
          strokeWidth="1"
        />
        <line
          x1={px}
          y1={py}
          x2={px + Math.cos(a) * L}
          y2={py - Math.sin(a) * L}
          stroke="var(--accent)"
          strokeWidth="4"
          strokeLinecap="round"
        />
        <circle cx={px} cy={py} r="4" fill="var(--accent)" />
      </g>
    );
  }

  const R = 19;
  return (
    <g opacity={o}>
      <circle
        cx={cx}
        cy={cy}
        r={R}
        fill="none"
        stroke="var(--rule)"
        strokeWidth="1"
      />
      {/* how close to 75 rps, as an arc */}
      <circle
        cx={cx}
        cy={cy}
        r={R}
        fill="none"
        stroke="var(--ok)"
        strokeWidth="2.5"
        strokeDasharray={`${level * 2 * Math.PI * R} ${2 * Math.PI * R}`}
        transform={`rotate(-90 ${cx} ${cy})`}
        strokeLinecap="round"
      />
      <g transform={`rotate(${spin} ${cx} ${cy})`}>
        {[0, 60, 120].map((d) => {
          const r = (d * Math.PI) / 180;
          return (
            <line
              key={d}
              x1={cx - Math.cos(r) * (R - 5)}
              y1={cy - Math.sin(r) * (R - 5)}
              x2={cx + Math.cos(r) * (R - 5)}
              y2={cy + Math.sin(r) * (R - 5)}
              stroke="var(--accent)"
              strokeWidth="2.5"
              strokeLinecap="round"
            />
          );
        })}
      </g>
      <circle cx={cx} cy={cy} r="3" fill="var(--accent)" />
    </g>
  );
}

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

export default function CoroutineTimeline() {
  const reduced = usePrefersReducedMotion();

  /**
   * The clock lives in a ref, not in state. An earlier version advanced the
   * step from inside a `setProgress` updater, and because React invokes
   * updaters twice in development the routine skipped every other state. A ref
   * mutated once per frame, with a forced repaint after it, cannot double-fire.
   */
  const sim = useRef({
    step: null as number | null,
    progress: 0,
    spin: 0,
    flow: 0,
  });
  const [playing, setPlaying] = useState(false);
  const [, repaint] = useReducer((n: number) => n + 1, 0);

  const raf = useRef<number | null>(null);
  const last = useRef<number>(0);

  useEffect(() => {
    if (!playing) return;

    const tick = (now: number) => {
      const dt = Math.min(last.current ? now - last.current : 16, 64);
      last.current = now;

      const s = sim.current;
      if (s.step === null) s.step = 0;

      s.progress += dt / STEPS[s.step].dwell;
      if (s.progress >= 1) {
        s.progress = 0;
        s.step = s.step >= LAST ? 0 : s.step + 1;
      }
      if (!reduced) {
        // Spin ramps with the flywheel, so the disc visibly speeds up.
        s.spin = (s.spin + dt * 0.06 * (0.25 + 2 * flyLevel(s))) % 360;
        s.flow = (s.flow + dt / 900) % 1;
      }

      repaint();
      raf.current = requestAnimationFrame(tick);
    };

    raf.current = requestAnimationFrame(tick);
    return () => {
      if (raf.current) cancelAnimationFrame(raf.current);
      last.current = 0;
    };
  }, [playing, reduced]);

  const play = useCallback(() => {
    if (sim.current.step === null) sim.current.step = 0;
    setPlaying((v) => !v);
  }, []);

  const stepOn = useCallback(() => {
    const s = sim.current;
    s.progress = 0;
    s.step = s.step === null ? 0 : s.step >= LAST ? 0 : s.step + 1;
    setPlaying(false);
    repaint();
  }, []);

  const reset = useCallback(() => {
    sim.current = { step: null, progress: 0, spin: 0, flow: 0 };
    setPlaying(false);
    repaint();
  }, []);

  const { step, progress, spin, flow } = sim.current;
  const live = step !== null;
  const cur = live ? STEPS[step] : null;
  const clock = cur ? cur.from + (cur.to - cur.from) * progress : 0;

  /**
   * How far a mechanism has got toward its target, 0 to 1. In the overview it
   * sits at 1 so the static picture shows both at their setpoint.
   */
  const levelOf = (b: Branch) => {
    if (step === null) return 1;
    if (step < b.wakeStep) return 0;
    if (step === b.wakeStep) return progress;
    return 1;
  };

  /** A lane runs from the step that forked it until the routine ends. */
  const laneState = (
    b: Branch
  ): "idle" | "pending" | "running" | "cancelled" => {
    if (!live || step === null) return "idle";
    if (step === LAST) return "cancelled";
    return step >= b.bornAt ? "running" : "pending";
  };

  const nodeState = (i: number): "idle" | "past" | "active" | "future" => {
    if (!live || step === null) return "idle";
    if (i === step) return "active";
    return i < step ? "past" : "future";
  };

  const wakeLit = (b: Branch) => live && step === b.wakeStep && progress > 0.82;

  const opacityFor = (s: "idle" | "past" | "active" | "future") =>
    s === "future" ? 0.28 : s === "past" ? 0.45 : 1;

  const chevronOffset = reduced ? 0 : flow * CHEVRON_GAP;

  return (
    <div className="measure-wide flex flex-col gap-step">
      {/* ── Panel one: the routine that works ───────────────────── */}
      <figure className="module m-0 overflow-x-auto">
        <span className="module-tag">One routine, three flows</span>

        <div className="px-panel pt-panel pb-pad" style={{ minWidth: W + 68 }}>
          {/* ── controls ── */}
          <div className="mb-flow flex flex-wrap items-center gap-tight">
            <button
              type="button"
              onClick={play}
              aria-label={playing ? "Pause the routine" : "Play the routine"}
              className="flex items-center gap-tight rounded-lg border border-[var(--accent)] bg-[var(--accent)] px-control py-chip text-note text-[var(--accent-ink)]"
            >
              {playing ? (
                <Pause className="h-[13px] w-[13px]" />
              ) : (
                <Play className="h-[13px] w-[13px]" />
              )}
              {playing ? "Pause" : live ? "Resume" : "Play the routine"}
            </button>
            <button
              type="button"
              onClick={stepOn}
              className="flex items-center gap-tight rounded-lg border border-[var(--rule)] bg-[var(--bg3)] px-control py-chip text-note text-[var(--tx)]"
            >
              <SkipForward className="h-[13px] w-[13px]" />
              Step
            </button>
            <button
              type="button"
              onClick={reset}
              disabled={!live}
              className="flex items-center gap-tight rounded-lg border border-[var(--rule)] bg-[var(--bg3)] px-control py-chip text-note text-[var(--tx2)] disabled:opacity-40"
            >
              <RotateCcw className="h-[13px] w-[13px]" />
              Reset
            </button>

            <span className="ml-tight font-mono text-meta text-[var(--tx2)]">
              robot clock{" "}
              <span className="text-[var(--tx)]">{clock.toFixed(2)} s</span>
            </span>
          </div>

          <p
            aria-live="polite"
            className="mb-flow m-0 min-h-[34px] max-w-[520px] text-note text-[var(--tx2)]"
          >
            {cur
              ? cur.status
              : "Six states, one routine. Play it, or step through one state at a time."}
          </p>

          {/* Column headings */}
          <div className="relative mb-tight" style={{ width: W, height: 16 }}>
            <span
              className="absolute font-mono text-micro text-[var(--tx2)]"
              style={{ left: MAIN_X }}
            >
              THE ROUTINE
            </span>
            {BRANCHES.map((b) => (
              <span
                key={b.name}
                className="absolute font-mono text-micro text-[var(--tx2)]"
                style={{ left: b.x }}
              >
                FORKED
              </span>
            ))}
          </div>

          <div className="relative" style={{ width: W, height: H }}>
            {/* ── connector layer ── */}
            <svg
              width={W}
              height={H}
              className="absolute top-0 left-0"
              aria-hidden="true"
            >
              <defs>
                <marker
                  id="ct-arrow"
                  viewBox="0 0 10 10"
                  refX="9"
                  refY="5"
                  markerWidth="6"
                  markerHeight="6"
                  orient="auto"
                >
                  <path d="M 0 0 L 10 5 L 0 10 z" fill="var(--accent)" />
                </marker>
                {BRANCHES.map((b) => (
                  <clipPath key={b.name} id={`ct-clip-${b.x}`}>
                    <rect
                      x={b.x}
                      y={b.top}
                      width={LANE_W}
                      height={BOTTOM - b.top}
                      rx="3"
                    />
                  </clipPath>
                ))}
              </defs>

              {/* main flow: node to node, straight down the left column */}
              {NODES.slice(0, -1).map((n, i) => (
                <line
                  key={n.y}
                  x1={MAIN_CX}
                  y1={n.y + n.h}
                  x2={MAIN_CX}
                  y2={NODES[i + 1].y - 2}
                  stroke="var(--accent)"
                  strokeWidth="2"
                  markerEnd="url(#ct-arrow)"
                  opacity={
                    !live || step === null
                      ? 1
                      : i < step
                        ? 0.45
                        : i === step
                          ? 1
                          : 0.28
                  }
                />
              ))}

              {/* Lanes first, so every connector below can bridge over them. */}
              {BRANCHES.map((b) => {
                const st = laneState(b);
                const on = st === "running";
                const gone = st === "cancelled";
                return (
                  <g
                    key={b.name}
                    opacity={st === "pending" ? 0.18 : gone ? 0.4 : 1}
                  >
                    <rect
                      x={b.x}
                      y={b.top}
                      width={LANE_W}
                      height={BOTTOM - b.top}
                      rx="3"
                      fill={gone ? "none" : LANE_FILL}
                      stroke={gone ? "var(--tx3)" : "var(--accent)"}
                      strokeWidth="1"
                      strokeDasharray={gone ? "5 4" : undefined}
                    />
                    {/* the mechanism itself, moving toward its setpoint */}
                    <MechGauge
                      kind={b.kind}
                      cx={b.cx}
                      cy={b.top + GAUGE_DY + GAUGE_H / 2}
                      level={levelOf(b)}
                      spin={spin}
                      dim={st === "pending"}
                    />

                    <g clipPath={`url(#ct-clip-${b.x})`}>
                      {Array.from(
                        {
                          length: Math.ceil((BOTTOM - b.top) / CHEVRON_GAP) + 1,
                        },
                        (_, k) =>
                          b.top +
                          GAUGE_DY +
                          GAUGE_H +
                          24 +
                          (k - 1) * CHEVRON_GAP
                      ).map((y) => (
                        <path
                          key={y}
                          d={`M ${b.cx - 7} ${y + (on ? chevronOffset : 0)} L ${b.cx} ${y + 7 + (on ? chevronOffset : 0)} L ${b.cx + 7} ${y + (on ? chevronOffset : 0)}`}
                          fill="none"
                          stroke={gone ? "var(--tx3)" : "var(--accent)"}
                          strokeOpacity={on ? 0.85 : 0.45}
                          strokeWidth="1.5"
                        />
                      ))}
                    </g>
                  </g>
                );
              })}

              {/* Connectors. Each is drawn twice: a --bg2 casing punches a clean
                  channel through any lane it crosses, then the real stroke. */}
              {BRANCHES.map((b) => {
                const forkPath = `M ${MAIN_R} ${b.forkFrom} H ${b.cx - CURVE_R} Q ${b.cx} ${b.forkFrom} ${b.cx} ${b.forkFrom + CURVE_R} V ${b.top - 4}`;
                const born = !live || step === null || step >= b.bornAt;
                const lit = live && step === b.bornAt;
                return (
                  <g key={b.name} opacity={born ? (lit ? 1 : 0.5) : 0.18}>
                    <path
                      d={forkPath}
                      fill="none"
                      stroke="var(--bg2)"
                      strokeWidth="8"
                    />
                    <path
                      d={forkPath}
                      fill="none"
                      stroke="var(--accent)"
                      strokeWidth={lit ? 2.5 : 2}
                      markerEnd="url(#ct-arrow)"
                    />
                  </g>
                );
              })}

              {/* the wake-up: the condition flips and the body resumes */}
              {BRANCHES.map((b) => {
                const lit = wakeLit(b);
                const shown = !live || step === null || step === b.wakeStep;
                return (
                  <g key={b.name} opacity={shown ? 1 : 0.18}>
                    <line
                      x1={b.x}
                      y1={b.wakeY}
                      x2={MAIN_R + 3}
                      y2={b.wakeY}
                      stroke="var(--bg2)"
                      strokeWidth="8"
                    />
                    <line
                      x1={b.x}
                      y1={b.wakeY}
                      x2={MAIN_R + 3}
                      y2={b.wakeY}
                      stroke={lit || !live ? "var(--ok)" : "var(--accent)"}
                      strokeWidth="1.5"
                      strokeDasharray="4 3"
                      markerEnd="url(#ct-arrow)"
                    />
                    <circle
                      cx={b.x}
                      cy={b.wakeY}
                      r={lit ? 6 : 4.5}
                      fill={lit || !live ? "var(--ok)" : "var(--bg3)"}
                      stroke={lit ? "var(--ok)" : "var(--bg2)"}
                      strokeWidth="1.5"
                    />
                  </g>
                );
              })}

              {/* the join: ending the body cancels every branch */}
              <g
                opacity={!live || step === null ? 1 : step === LAST ? 1 : 0.22}
              >
                <path
                  d={`M ${MAIN_CX} ${BOTTOM} V ${CANCEL_Y} H ${BRANCHES[1].cx}`}
                  fill="none"
                  stroke="var(--accent)"
                  strokeWidth="1.5"
                  strokeDasharray="4 3"
                />
                {BRANCHES.map((b) => (
                  <line
                    key={b.name}
                    x1={b.cx}
                    y1={CANCEL_Y}
                    x2={b.cx}
                    y2={BOTTOM + 4}
                    stroke="var(--accent)"
                    strokeWidth="1.5"
                    strokeDasharray="4 3"
                    markerEnd="url(#ct-arrow)"
                  />
                ))}
              </g>
            </svg>

            {/* ── node layer ── */}
            {NODES.map((n, i) => {
              const st = nodeState(i);
              const active = st === "active";
              const showBar = active && n.parked;
              return (
                <div
                  key={n.y}
                  className="absolute flex flex-col justify-center gap-[3px] overflow-hidden rounded-lg px-tight"
                  style={{
                    left: MAIN_X,
                    top: n.y,
                    width: MAIN_W,
                    height: n.h,
                    opacity: opacityFor(st),
                    background: active ? "var(--accent-soft)" : "var(--bg2)",
                    border: `${active ? 2 : 1}px ${n.parked ? "dashed" : "solid"} var(--accent)`,
                  }}
                >
                  {n.lines.map((line) => (
                    <code
                      key={line}
                      className="font-mono text-meta whitespace-pre text-[var(--tx)]"
                    >
                      {line}
                    </code>
                  ))}
                  <span className="text-micro text-[var(--tx3)]">{n.tag}</span>

                  {showBar && (
                    <span
                      className="absolute bottom-0 left-0 h-[3px] bg-[var(--accent)]"
                      style={{ width: `${progress * 100}%` }}
                    />
                  )}
                </div>
              );
            })}

            {/* live readout under each mechanism */}
            {BRANCHES.map((b) => {
              const st = laneState(b);
              return (
                <span
                  key={b.name}
                  className="absolute text-center font-mono text-micro text-[var(--tx)]"
                  style={{
                    left: b.x,
                    top: b.top + GAUGE_DY + GAUGE_H + 2,
                    width: LANE_W,
                    opacity: st === "pending" ? 0.3 : 1,
                  }}
                >
                  {st === "pending"
                    ? "not forked yet"
                    : b.readout(levelOf(b), st === "cancelled")}
                </span>
              );
            })}

            {/* branch headings, inside the top of each lane */}
            {BRANCHES.map((b) => {
              const st = laneState(b);
              return (
                <div
                  key={b.name}
                  className="absolute flex flex-col gap-[3px] px-tight"
                  style={{
                    left: b.x,
                    top: b.top + 10,
                    width: LANE_W,
                    opacity:
                      st === "pending" ? 0.28 : st === "cancelled" ? 0.5 : 1,
                  }}
                >
                  <code className="font-mono text-meta text-[var(--tx)]">
                    {b.name}
                  </code>
                  <span className="text-micro text-[var(--tx2)]">
                    {st === "cancelled"
                      ? "cancelled by the routine ending"
                      : b.sub}
                  </span>
                </div>
              );
            })}

            {/* what the wake-up arrows mean */}
            {BRANCHES.map((b) => {
              const shown = !live || step === null || step === b.wakeStep;
              const waiting = live && step === b.wakeStep && !wakeLit(b);
              return (
                <span
                  key={b.name}
                  className="absolute -translate-y-full bg-[var(--bg2)] px-chip font-mono text-micro"
                  style={{
                    left: MAIN_R + 30,
                    top: b.wakeY - 3,
                    opacity: shown ? 1 : 0.2,
                    color: waiting ? "var(--tx3)" : "var(--ok)",
                  }}
                >
                  {waiting
                    ? `waiting on ${b.wakeLabel}`
                    : `${b.wakeLabel} is true`}
                </span>
              );
            })}

            {/* the cancel note */}
            <span
              className="absolute bg-[var(--bg2)] px-chip text-micro text-[var(--tx3)]"
              style={{
                left: MAIN_CX + 16,
                top: CANCEL_Y + 4,
                opacity: !live || step === null || step === LAST ? 1 : 0.22,
              }}
            >
              ending the body cancels both forks
            </span>
          </div>
        </div>
      </figure>

      {/* ── Panel two: the deadlock ──────────────────────────────── */}
      <DeadlockPanel />
    </div>
  );
}

// ── the deadlock ────────────────────────────────────────────────────────
const DL_W = 660;
const DL_LANE_X = 470;
const DL_LANE_W = 150;

function DeadlockPanel() {
  return (
    <figure className="module m-0 overflow-x-auto">
      <span className="module-tag">
        The same routine, await instead of fork
      </span>

      <div
        className="px-panel pt-panel pb-panel"
        style={{ minWidth: DL_W + 68 }}
      >
        <div className="relative" style={{ width: DL_W, height: 156 }}>
          <svg
            width={DL_W}
            height={156}
            className="absolute top-0 left-0"
            aria-hidden="true"
          >
            <defs>
              <marker
                id="ct-arrow-err"
                viewBox="0 0 10 10"
                refX="9"
                refY="5"
                markerWidth="6"
                markerHeight="6"
                orient="auto"
              >
                <path d="M 0 0 L 10 5 L 0 10 z" fill="var(--err)" />
              </marker>
              <marker
                id="ct-arrow-2"
                viewBox="0 0 10 10"
                refX="9"
                refY="5"
                markerWidth="6"
                markerHeight="6"
                orient="auto"
              >
                <path d="M 0 0 L 10 5 L 0 10 z" fill="var(--accent)" />
              </marker>
            </defs>

            <rect
              x={DL_LANE_X}
              y={16}
              width={DL_LANE_W}
              height={116}
              rx="3"
              fill={LANE_FILL}
              stroke="var(--accent)"
              strokeWidth="1"
            />
            {[92, 116].map((y) => (
              <path
                key={y}
                d={`M ${DL_LANE_X + 68} ${y} L ${DL_LANE_X + 75} ${y + 7} L ${DL_LANE_X + 82} ${y}`}
                fill="none"
                stroke="var(--accent)"
                strokeOpacity="0.5"
                strokeWidth="1.5"
              />
            ))}

            {/* what the body is waiting on */}
            <line
              x1={MAIN_R}
              y1={30}
              x2={DL_LANE_X - 4}
              y2={30}
              stroke="var(--accent)"
              strokeWidth="1.5"
              markerEnd="url(#ct-arrow-2)"
            />
            {/* the completion that never comes back */}
            <line
              x1={DL_LANE_X}
              y1={52}
              x2={MAIN_R + 4}
              y2={52}
              stroke="var(--err)"
              strokeWidth="1.5"
              strokeDasharray="3 4"
              strokeOpacity="0.8"
            />
            <g stroke="var(--err)" strokeWidth="1.6">
              <line x1={404} y1={46} x2={416} y2={58} />
              <line x1={416} y1={46} x2={404} y2={58} />
            </g>

            {/* the body enters the await and never comes back out */}
            <line
              x1={MAIN_CX}
              y1={66}
              x2={MAIN_CX}
              y2={128}
              stroke="var(--err)"
              strokeWidth="2"
              strokeDasharray="4 4"
              markerEnd="url(#ct-arrow-err)"
            />
          </svg>

          <div
            className="absolute flex flex-col justify-center gap-[3px] rounded-lg bg-[var(--bg2)] px-tight"
            style={{
              left: MAIN_X,
              top: 8,
              width: MAIN_W,
              height: 58,
              border: "1px dashed var(--err)",
            }}
          >
            <code className="font-mono text-meta text-[var(--tx)]">
              coroutine.await(arm.vertical());
            </code>
            <span className="text-micro text-[var(--err)]">
              parked · for the rest of the match
            </span>
          </div>

          <span
            className="absolute font-mono text-micro text-[var(--err)]"
            style={{ left: MAIN_X, top: 134 }}
          >
            nothing below this line ever runs
          </span>

          <span
            className="absolute text-micro text-[var(--err)]"
            style={{ left: MAIN_R + 24, top: 56 }}
          >
            never completes
          </span>

          <div
            className="absolute flex flex-col gap-[3px] px-tight"
            style={{ left: DL_LANE_X, top: 26, width: DL_LANE_W }}
          >
            <code className="font-mono text-meta text-[var(--tx)]">
              arm.vertical()
            </code>
            <span className="text-micro text-[var(--tx2)]">
              holding 90° correctly, and never finishing
            </span>
          </div>
        </div>

        <div className="mt-pad flex max-w-[var(--measure)] flex-col gap-chip">
          <p className="m-0 text-note text-[var(--tx2)]">
            <code>vertical()</code> is built with <code>runRepeatedly</code>, so
            it never finishes on its own. <code>await</code> parks the body
            until the command it was handed completes, and that one never will.
            The arm holds 90° correctly and the rest of the routine is simply
            never reached. No error, no log line, nothing on the dashboard
            except a routine that sits there.
          </p>
          <p className="m-0 text-note text-[var(--tx2)]">
            <code>await</code> is safe on a command that finishes by itself,
            which is why both waits in the diagram above await a{" "}
            <code>Command.waitUntil(…)</code> rather than the hold.
          </p>
        </div>
      </div>
    </figure>
  );
}
