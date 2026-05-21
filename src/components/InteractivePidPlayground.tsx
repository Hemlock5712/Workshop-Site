"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useTheme } from "next-themes";
import uPlot from "uplot";
import "uplot/dist/uPlot.min.css";
import { useShallow } from "zustand/react/shallow";
import { usePidStore } from "@/lib/pidStore";
import {
  DEFAULT_PHYSICS,
  SLIDER_RANGES,
  simulateStepResponse,
  type ControllerGains,
  type Regime,
} from "@/lib/pidPhysics";
import { RotateCcw } from "lucide-react";

function useReducedMotion(): boolean {
  const [reduced, setReduced] = useState(false);
  useEffect(() => {
    if (typeof window === "undefined") return;
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    setReduced(mq.matches);
    const onChange = (e: MediaQueryListEvent) => setReduced(e.matches);
    mq.addEventListener("change", onChange);
    return () => mq.removeEventListener("change", onChange);
  }, []);
  return reduced;
}

type GainKey = keyof ControllerGains;

interface SliderProps {
  label: string;
  axisColor: string;
  value: number;
  min: number;
  max: number;
  step: number;
  precision: number;
  onChange: (v: number) => void;
  ariaDescription: string;
  hint?: string;
}

function Slider({
  label,
  axisColor,
  value,
  min,
  max,
  step,
  precision,
  onChange,
  ariaDescription,
  hint,
}: SliderProps) {
  const onKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (!e.shiftKey) return;
    if (e.key !== "ArrowLeft" && e.key !== "ArrowRight") return;
    e.preventDefault();
    const big = (max - min) / 10;
    const next =
      e.key === "ArrowRight"
        ? Math.min(max, value + big)
        : Math.max(min, value - big);
    onChange(Number(next.toFixed(precision)));
  };
  const id = `pid-slider-${label}`;
  return (
    <div className="flex flex-col gap-1">
      <div className="flex items-baseline justify-between gap-2">
        <label
          htmlFor={id}
          className="font-mono text-xs font-semibold"
          style={{ color: axisColor }}
        >
          {label}
        </label>
        <span className="font-mono text-[11px] tabular-nums text-[var(--muted-foreground)]">
          {value.toFixed(precision)}
        </span>
      </div>
      <input
        id={id}
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(e) => onChange(parseFloat(e.target.value))}
        onKeyDown={onKeyDown}
        aria-label={ariaDescription}
        aria-valuemin={min}
        aria-valuemax={max}
        aria-valuenow={value}
        className="pid-slider w-full"
        style={
          {
            ["--slider-accent" as string]: axisColor,
          } as React.CSSProperties
        }
      />
      {hint && (
        <span className="text-[10px] leading-tight text-[var(--muted-foreground)]">
          {hint}
        </span>
      )}
    </div>
  );
}

const REGIME_STYLE: Record<Regime, { label: string; classes: string; dot: string }> = {
  underdamped: {
    label: "Underdamped",
    dot: "bg-yellow-500",
    classes:
      "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/40 dark:text-yellow-200",
  },
  "critically damped": {
    label: "Critically damped",
    dot: "bg-green-500",
    classes:
      "bg-green-100 text-green-800 dark:bg-green-900/40 dark:text-green-200",
  },
  overdamped: {
    label: "Overdamped",
    dot: "bg-blue-500",
    classes:
      "bg-blue-100 text-blue-800 dark:bg-blue-900/40 dark:text-blue-200",
  },
};

interface SliderConfig {
  key: GainKey;
  label: string;
  axisColor: string;
  hint: string;
  ariaDescription: string;
}

const FEEDBACK_SLIDERS: ReadonlyArray<SliderConfig> = [
  {
    key: "kP",
    label: "kP",
    axisColor: "#dc2626",
    hint: "Proportional — error response",
    ariaDescription:
      "Proportional gain kP. Arrow keys nudge by one; Shift plus arrow keys jump by ten percent of range.",
  },
  {
    key: "kI",
    label: "kI",
    axisColor: "#ca8a04",
    hint: "Integral — kills steady-state error",
    ariaDescription:
      "Integral gain kI. Arrow keys nudge by zero point one; Shift plus arrow keys jump by ten percent of range.",
  },
  {
    key: "kD",
    label: "kD",
    axisColor: "#2563eb",
    hint: "Derivative — damps overshoot",
    ariaDescription:
      "Derivative gain kD. Arrow keys nudge by zero point one; Shift plus arrow keys jump by ten percent of range.",
  },
];

const FEEDFORWARD_SLIDERS: ReadonlyArray<SliderConfig> = [
  {
    key: "kS",
    label: "kS",
    axisColor: "#7c3aed",
    hint: "Static — friction breakaway boost",
    ariaDescription:
      "Static friction feedforward kS. Arrow keys nudge by zero point zero five.",
  },
  {
    key: "kV",
    label: "kV",
    axisColor: "#0891b2",
    hint: "Velocity — tracks profile speed",
    ariaDescription:
      "Velocity feedforward kV. Arrow keys nudge by zero point zero five.",
  },
  {
    key: "kG",
    label: "kG",
    axisColor: "#16a34a",
    hint: "Gravity — cancels arm weight",
    ariaDescription:
      "Gravity feedforward kG. Arrow keys nudge by zero point one. Around 7.85 perfectly balances this arm.",
  },
];

// ── Arm visualization ────────────────────────────────────────────────────
//
// SVG arm. theta=0 hangs straight down (gravity-aligned), theta=π/2 points
// horizontally to the right. Pivot is at (cx, cy); the arm end ball is
// imperatively moved every RAF so we don't churn React state at 60 Hz.

interface ArmVizProps {
  responseTheta: Float64Array;
  targetDeg: number;
  durationSec: number;
  reducedMotion: boolean;
  isDark: boolean;
}

const ARM_VB = 220;
const ARM_PIVOT = { x: 110, y: 70 };
const ARM_LENGTH = 110;
const SAMPLE_RATE_MS = 1; // physics dt

function ArmViz({
  responseTheta,
  targetDeg,
  durationSec,
  reducedMotion,
  isDark,
}: ArmVizProps) {
  const armLineRef = useRef<SVGLineElement>(null);
  const ballRef = useRef<SVGCircleElement>(null);
  const angleLabelRef = useRef<SVGTextElement>(null);

  // Position the arm given an angle in degrees.
  const placeArm = useCallback((thetaDeg: number) => {
    const r = (thetaDeg * Math.PI) / 180;
    const ex = ARM_PIVOT.x + ARM_LENGTH * Math.sin(r);
    const ey = ARM_PIVOT.y + ARM_LENGTH * Math.cos(r);
    armLineRef.current?.setAttribute("x2", ex.toString());
    armLineRef.current?.setAttribute("y2", ey.toString());
    ballRef.current?.setAttribute("cx", ex.toString());
    ballRef.current?.setAttribute("cy", ey.toString());
    if (angleLabelRef.current) {
      angleLabelRef.current.textContent = `${thetaDeg.toFixed(0)}°`;
    }
  }, []);

  useEffect(() => {
    if (responseTheta.length === 0) return;
    if (reducedMotion) {
      // Snap to final position
      const finalTheta = responseTheta[responseTheta.length - 1] ?? 0;
      placeArm(finalTheta);
      return;
    }

    let frameId = 0;
    const startTime = performance.now();
    const loopMs = durationSec * 1000 + 600; // 600 ms hold at end
    const tick = () => {
      const elapsed = performance.now() - startTime;
      const loopT = elapsed % loopMs;
      let thetaDeg: number;
      if (loopT < durationSec * 1000) {
        const idx = Math.min(
          responseTheta.length - 1,
          Math.floor(loopT / SAMPLE_RATE_MS),
        );
        thetaDeg = responseTheta[idx] ?? 0;
      } else {
        thetaDeg = responseTheta[responseTheta.length - 1] ?? 0;
      }
      placeArm(thetaDeg);
      frameId = requestAnimationFrame(tick);
    };
    frameId = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frameId);
  }, [responseTheta, durationSec, reducedMotion, placeArm]);

  // Ghost target arm position (static)
  const tRad = (targetDeg * Math.PI) / 180;
  const tx = ARM_PIVOT.x + ARM_LENGTH * Math.sin(tRad);
  const ty = ARM_PIVOT.y + ARM_LENGTH * Math.cos(tRad);

  const gradientStart = isDark ? "#9fbcd9" : "#264060";
  const gradientEnd = isDark ? "#c1d4e7" : "#4a73a0";
  const ghostColor = isDark ? "#475569" : "#94a3b8";
  const mountColor = isDark ? "#475569" : "#cbd5e1";
  const tickColor = isDark ? "#475569" : "#cbd5e1";

  return (
    <svg
      viewBox={`0 0 ${ARM_VB} ${ARM_VB}`}
      className="h-full w-full"
      role="img"
      aria-label="Live simulated 1-DOF arm. Solid arm is the current angle; dashed arm is the 90 degree target."
    >
      <defs>
        <linearGradient id="armGrad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor={gradientStart} />
          <stop offset="100%" stopColor={gradientEnd} />
        </linearGradient>
        <radialGradient id="ballGrad" cx="35%" cy="35%" r="65%">
          <stop offset="0%" stopColor={gradientEnd} />
          <stop offset="100%" stopColor={gradientStart} />
        </radialGradient>
      </defs>

      {/* Protractor reference arc, 0 → 90° */}
      <path
        d={`M ${ARM_PIVOT.x} ${ARM_PIVOT.y + 60} A 60 60 0 0 0 ${ARM_PIVOT.x + 60} ${ARM_PIVOT.y}`}
        fill="none"
        stroke={tickColor}
        strokeWidth={1}
        strokeDasharray="2 4"
        opacity={0.7}
      />
      {/* Reference ticks at 0, 45, 90 */}
      {[0, 45, 90].map((deg) => {
        const r = (deg * Math.PI) / 180;
        const x1 = ARM_PIVOT.x + 55 * Math.sin(r);
        const y1 = ARM_PIVOT.y + 55 * Math.cos(r);
        const x2 = ARM_PIVOT.x + 66 * Math.sin(r);
        const y2 = ARM_PIVOT.y + 66 * Math.cos(r);
        const lx = ARM_PIVOT.x + 78 * Math.sin(r);
        const ly = ARM_PIVOT.y + 78 * Math.cos(r) + 3;
        return (
          <g key={deg}>
            <line
              x1={x1}
              y1={y1}
              x2={x2}
              y2={y2}
              stroke={tickColor}
              strokeWidth={1.25}
            />
            <text
              x={lx}
              y={ly}
              fontSize={9}
              textAnchor="middle"
              fill={ghostColor}
              fontFamily="ui-sans-serif, system-ui"
            >
              {deg}°
            </text>
          </g>
        );
      })}

      {/* Ghost target arm */}
      <line
        x1={ARM_PIVOT.x}
        y1={ARM_PIVOT.y}
        x2={tx}
        y2={ty}
        stroke={ghostColor}
        strokeWidth={3}
        strokeDasharray="4 4"
        opacity={0.55}
        strokeLinecap="round"
      />
      <circle
        cx={tx}
        cy={ty}
        r={7}
        fill="none"
        stroke={ghostColor}
        strokeWidth={1.5}
        strokeDasharray="2 2"
        opacity={0.7}
      />

      {/* Mount bracket */}
      <rect
        x={ARM_PIVOT.x - 26}
        y={ARM_PIVOT.y - 22}
        width={52}
        height={14}
        rx={3}
        fill={mountColor}
      />
      <rect
        x={ARM_PIVOT.x - 26}
        y={ARM_PIVOT.y - 22}
        width={52}
        height={3}
        rx={1}
        fill={ghostColor}
        opacity={0.7}
      />

      {/* Live arm */}
      <line
        ref={armLineRef}
        x1={ARM_PIVOT.x}
        y1={ARM_PIVOT.y}
        x2={ARM_PIVOT.x}
        y2={ARM_PIVOT.y + ARM_LENGTH}
        stroke="url(#armGrad)"
        strokeWidth={10}
        strokeLinecap="round"
      />
      <circle
        ref={ballRef}
        cx={ARM_PIVOT.x}
        cy={ARM_PIVOT.y + ARM_LENGTH}
        r={11}
        fill="url(#ballGrad)"
        stroke={isDark ? "#0d233f" : "#fff"}
        strokeWidth={2}
      />

      {/* Pivot pin */}
      <circle
        cx={ARM_PIVOT.x}
        cy={ARM_PIVOT.y}
        r={5}
        fill={isDark ? "#cbd5e1" : "#0d233f"}
      />
      <circle
        cx={ARM_PIVOT.x}
        cy={ARM_PIVOT.y}
        r={2}
        fill={isDark ? "#0d233f" : "#cbd5e1"}
      />

      {/* Live angle label */}
      <text
        ref={angleLabelRef}
        x={ARM_PIVOT.x}
        y={ARM_VB - 12}
        fontSize={14}
        fontWeight={600}
        textAnchor="middle"
        fill={isDark ? "#e2e8f0" : "#0d233f"}
        fontFamily="ui-monospace, monospace"
      >
        0°
      </text>
    </svg>
  );
}

export default function InteractivePidPlayground() {
  const reducedMotion = useReducedMotion();
  const { resolvedTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);
  const isDark = mounted && resolvedTheme === "dark";

  const gains = usePidStore(
    useShallow((s) => ({
      kP: s.kP,
      kI: s.kI,
      kD: s.kD,
      kS: s.kS,
      kV: s.kV,
      kG: s.kG,
    })),
  );
  const setKP = usePidStore((s) => s.setKP);
  const setKI = usePidStore((s) => s.setKI);
  const setKD = usePidStore((s) => s.setKD);
  const setKS = usePidStore((s) => s.setKS);
  const setKV = usePidStore((s) => s.setKV);
  const setKG = usePidStore((s) => s.setKG);
  const reset = usePidStore((s) => s.reset);

  const setters: Record<GainKey, (v: number) => void> = useMemo(
    () => ({
      kP: setKP,
      kI: setKI,
      kD: setKD,
      kS: setKS,
      kV: setKV,
      kG: setKG,
    }),
    [setKP, setKI, setKD, setKS, setKV, setKG],
  );

  // Throttle gains → sim recompute. Normal motion: next paint (RAF).
  // Reduced motion: 250 ms (4 fps).
  const [throttled, setThrottled] = useState(gains);
  const rafRef = useRef<number | null>(null);
  const timeoutRef = useRef<number | null>(null);

  useEffect(() => {
    if (reducedMotion) {
      if (timeoutRef.current !== null) return;
      timeoutRef.current = window.setTimeout(() => {
        timeoutRef.current = null;
        setThrottled(gains);
      }, 250);
      return () => {
        if (timeoutRef.current !== null) {
          window.clearTimeout(timeoutRef.current);
          timeoutRef.current = null;
        }
      };
    }
    if (rafRef.current !== null) return;
    rafRef.current = window.requestAnimationFrame(() => {
      rafRef.current = null;
      setThrottled(gains);
    });
    return () => {
      if (rafRef.current !== null) {
        window.cancelAnimationFrame(rafRef.current);
        rafRef.current = null;
      }
    };
  }, [gains, reducedMotion]);

  const response = useMemo(
    () => simulateStepResponse(DEFAULT_PHYSICS, throttled),
    [throttled],
  );

  // uPlot lifecycle
  const containerRef = useRef<HTMLDivElement>(null);
  const plotRef = useRef<uPlot | null>(null);

  const accent = useMemo(
    () => ({
      target: isDark ? "#475569" : "#94a3b8",
      setpoint: isDark ? "#f59e0b" : "#b45309",
      actual: isDark ? "#7da4cb" : "#264060",
      actualFillTop: isDark ? "rgba(125, 164, 203, 0.28)" : "rgba(38, 64, 96, 0.18)",
      actualFillBottom: isDark ? "rgba(125, 164, 203, 0)" : "rgba(38, 64, 96, 0)",
      grid: isDark ? "rgba(148, 163, 184, 0.12)" : "rgba(100, 116, 139, 0.14)",
      text: isDark ? "#94a3b8" : "#64748b",
    }),
    [isDark],
  );

  const buildPlot = useCallback(() => {
    if (!containerRef.current) return;
    const width = containerRef.current.clientWidth;
    const opts: uPlot.Options = {
      width: width || 480,
      height: 240,
      padding: [16, 12, 0, 0],
      legend: { show: false },
      cursor: {
        drag: { x: false, y: false },
        focus: { prox: 30 },
        points: { show: false },
      },
      scales: {
        x: { time: false, range: [0, DEFAULT_PHYSICS.durationSec] },
        y: { range: [-15, 130] },
      },
      axes: [
        {
          stroke: accent.text,
          grid: { stroke: accent.grid, width: 1, dash: [2, 4] },
          ticks: { show: false },
          font: "11px ui-sans-serif, system-ui",
          space: 60,
          values: (_u, splits) => splits.map((v) => `${v.toFixed(1)}s`),
        },
        {
          stroke: accent.text,
          grid: { stroke: accent.grid, width: 1, dash: [2, 4] },
          ticks: { show: false },
          font: "11px ui-sans-serif, system-ui",
          size: 38,
          space: 32,
          values: (_u, splits) => splits.map((v) => `${v.toFixed(0)}°`),
        },
      ],
      series: [
        {},
        {
          label: "Target",
          stroke: accent.target,
          width: 1.25,
          dash: [4, 4],
          points: { show: false },
        },
        {
          label: "Setpoint",
          stroke: accent.setpoint,
          width: 1,
          dash: [2, 3],
          points: { show: false },
        },
        {
          label: "Actual",
          stroke: accent.actual,
          width: 2.5,
          points: { show: false },
          fill: (u) => {
            const ctx = u.ctx;
            const h = u.bbox.height;
            const top = u.bbox.top;
            const grad = ctx.createLinearGradient(0, top, 0, top + h);
            grad.addColorStop(0, accent.actualFillTop);
            grad.addColorStop(1, accent.actualFillBottom);
            return grad;
          },
        },
      ],
    };
    plotRef.current?.destroy();
    plotRef.current = new uPlot(
      opts,
      [response.t, response.target, response.setpoint, response.theta],
      containerRef.current,
    );
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [accent]);

  useEffect(() => {
    if (!mounted) return;
    buildPlot();
    return () => {
      plotRef.current?.destroy();
      plotRef.current = null;
    };
  }, [mounted, buildPlot]);

  useEffect(() => {
    if (!plotRef.current) return;
    plotRef.current.setData([
      response.t,
      response.target,
      response.setpoint,
      response.theta,
    ]);
  }, [response]);

  useEffect(() => {
    if (!containerRef.current) return;
    const el = containerRef.current;
    const obs = new ResizeObserver(() => {
      if (plotRef.current && el.clientWidth > 0) {
        plotRef.current.setSize({ width: el.clientWidth, height: 240 });
      }
    });
    obs.observe(el);
    return () => obs.disconnect();
  }, []);

  const regimeStyle = REGIME_STYLE[response.metrics.regime];
  const riseTimeStr =
    response.metrics.riseTime !== null
      ? `${(response.metrics.riseTime * 1000).toFixed(0)} ms`
      : "—";
  const settlingStr =
    response.metrics.settlingTime !== null
      ? `${response.metrics.settlingTime.toFixed(2)} s`
      : "—";
  const targetDeg = (DEFAULT_PHYSICS.target * 180) / Math.PI;

  const renderSlider = (cfg: SliderConfig) => {
    const range = SLIDER_RANGES[cfg.key];
    return (
      <Slider
        key={cfg.key}
        label={cfg.label}
        axisColor={cfg.axisColor}
        value={gains[cfg.key]}
        min={range.min}
        max={range.max}
        step={range.step}
        precision={range.precision}
        onChange={setters[cfg.key]}
        ariaDescription={cfg.ariaDescription}
        hint={cfg.hint}
      />
    );
  };

  return (
    <div className="flex flex-col gap-4 rounded-xl border border-[var(--border)] bg-[var(--card)] p-5 shadow-sm">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div className="flex flex-wrap items-center gap-2">
          <span
            className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-semibold ${regimeStyle.classes}`}
            aria-live="polite"
          >
            <span
              aria-hidden
              className={`inline-block h-1.5 w-1.5 rounded-full ${regimeStyle.dot}`}
            />
            {regimeStyle.label}
          </span>
          <span className="text-xs text-[var(--muted-foreground)] tabular-nums">
            overshoot {response.metrics.overshootPct.toFixed(1)}% · rise{" "}
            {riseTimeStr} · settle {settlingStr}
          </span>
        </div>
        <button
          type="button"
          onClick={reset}
          className="inline-flex items-center gap-1 rounded-md border border-[var(--border)] bg-[var(--muted)] px-2.5 py-1 text-xs font-medium text-[var(--foreground)] transition-colors hover:bg-[var(--border)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--primary)] focus-visible:ring-offset-1"
          aria-label="Reset gains to defaults"
        >
          <RotateCcw className="h-3 w-3" />
          Reset
        </button>
      </div>

      <div className="grid gap-3 sm:grid-cols-[160px_minmax(0,1fr)] sm:gap-4">
        {/* Mechanism */}
        <div className="rounded-lg border border-[var(--border)] bg-[var(--background)] p-2">
          <ArmViz
            responseTheta={response.theta}
            targetDeg={targetDeg}
            durationSec={DEFAULT_PHYSICS.durationSec}
            reducedMotion={reducedMotion}
            isDark={isDark}
          />
        </div>

        {/* Plot */}
        <div className="rounded-lg border border-[var(--border)] bg-[var(--background)] p-2">
          <div
            ref={containerRef}
            className="pid-plot w-full"
            style={{ minHeight: 240 }}
            aria-label="Step response plot: dashed line is the 90 degree target, dotted line is the motion-profile setpoint, solid line is the simulated arm angle over three seconds"
            role="img"
          />
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-[11px] text-[var(--muted-foreground)]">
        <span className="inline-flex items-center gap-1.5">
          <span
            aria-hidden
            className="inline-block h-0.5 w-4"
            style={{
              background: `repeating-linear-gradient(to right, ${accent.target} 0 4px, transparent 4px 8px)`,
            }}
          />
          target 90°
        </span>
        <span className="inline-flex items-center gap-1.5">
          <span
            aria-hidden
            className="inline-block h-0.5 w-4"
            style={{
              background: `repeating-linear-gradient(to right, ${accent.setpoint} 0 2px, transparent 2px 5px)`,
            }}
          />
          motion-profile setpoint
        </span>
        <span className="inline-flex items-center gap-1.5">
          <span
            aria-hidden
            className="inline-block h-0.5 w-4"
            style={{ background: accent.actual }}
          />
          arm angle
        </span>
      </div>

      <div className="flex flex-col gap-3">
        <div>
          <p className="mb-1.5 text-[11px] font-semibold uppercase tracking-wider text-[var(--muted-foreground)]">
            Feedback (PID)
          </p>
          <div className="grid gap-3 sm:grid-cols-3">
            {FEEDBACK_SLIDERS.map(renderSlider)}
          </div>
        </div>
        <div>
          <p className="mb-1.5 text-[11px] font-semibold uppercase tracking-wider text-[var(--muted-foreground)]">
            Feedforward
          </p>
          <div className="grid gap-3 sm:grid-cols-3">
            {FEEDFORWARD_SLIDERS.map(renderSlider)}
          </div>
        </div>
      </div>

      <p className="text-xs text-[var(--muted-foreground)]">
        1-DOF arm: 2 kg · 0.4 m · viscous friction. Trapezoidal motion profile
        steps to 90°. Try kP&nbsp;≈ 100 then bump kD to dampen the ring; or set
        kG to ≈ 7.85 to cancel the gravity sag without any kI at all.
      </p>
    </div>
  );
}
