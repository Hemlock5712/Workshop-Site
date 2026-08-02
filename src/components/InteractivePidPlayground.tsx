"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useTheme } from "next-themes";
import uPlot from "uplot";
import "uplot/dist/uPlot.min.css";
import { useShallow } from "zustand/react/shallow";
import { usePidStore } from "@/lib/pidStore";
import {
  TARGET_RANGE_DEG,
  SLIDER_RANGES,
  physicsFor,
  simulateStepResponse,
  type ControllerGains,
  type Regime,
} from "@/lib/pidPhysics";
import { Lightbulb, RotateCcw, Target as TargetIcon } from "lucide-react";

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

// ── Slider ───────────────────────────────────────────────────────────────

interface SliderProps {
  label: string;
  unit: string;
  axisColor: string;
  value: number;
  min: number;
  max: number;
  step: number;
  precision: number;
  onChange: (v: number) => void;
  ariaDescription: string;
}

function Slider({
  label,
  unit,
  axisColor,
  value,
  min,
  max,
  step,
  precision,
  onChange,
  ariaDescription,
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
  const pct = ((value - min) / (max - min)) * 100;
  return (
    <div className="flex flex-col gap-1.5">
      <div className="flex items-baseline justify-between gap-2">
        <div className="flex items-baseline gap-1.5">
          {/* The gain colour lives on the swatch and the slider track, not
              on the label text. As text it was 2.9:1 against the panel for kI
              and 3.3:1 for kG — the colour has to survive being read, and
              these are 13px. The swatch keeps the slider-to-trace mapping. */}
          <span
            aria-hidden="true"
            className="inline-block h-2 w-2 shrink-0 rounded-full"
            style={{ background: axisColor }}
          />
          <label
            htmlFor={id}
            className="font-mono text-[13px] font-semibold"
            style={{ color: "var(--tx)" }}
          >
            {label}
          </label>
          <span className="font-mono text-[10px] text-[var(--muted-foreground)]">
            {unit}
          </span>
        </div>
        <span
          className="font-mono text-[12px] tabular-nums rounded-md px-1.5 py-0.5 bg-[var(--muted)] text-[var(--foreground)]"
          aria-hidden
        >
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
        aria-label={`${ariaDescription} Current value ${value.toFixed(precision)} ${unit}.`}
        aria-valuemin={min}
        aria-valuemax={max}
        aria-valuenow={value}
        className="pid-slider w-full"
        style={
          {
            ["--slider-accent" as string]: axisColor,
            ["--slider-fill" as string]: `${pct}%`,
          } as React.CSSProperties
        }
      />
    </div>
  );
}

// ── Regime chip ──────────────────────────────────────────────────────────

/** Regime status pill — engineering style: mono uppercase label, soft
    accent-bg with a coloured ring, dot leading. Tokens drive the colour
    so the pill stays consistent across light + dark themes. */
const REGIME_STYLE: Record<Regime, { label: string; cssVar: string }> = {
  oscillating: {
    label: "OSCILLATING",
    cssVar: "var(--accent)",
  },
  stable: {
    label: "STABLE",
    cssVar: "var(--ok)",
  },
  drifting: {
    label: "DRIFTING",
    cssVar: "var(--err)",
  },
};

// ── Slider configs ──────────────────────────────────────────────────────

interface SliderConfig {
  key: GainKey;
  label: string;
  axisColor: string;
  ariaDescription: string;
}

const FEEDBACK_SLIDERS: ReadonlyArray<SliderConfig> = [
  {
    key: "kP",
    label: "kP",
    axisColor: "#dc2626",
    ariaDescription: "Proportional gain.",
  },
  {
    key: "kI",
    label: "kI",
    axisColor: "#ca8a04",
    ariaDescription: "Integral gain.",
  },
  {
    key: "kD",
    label: "kD",
    axisColor: "#2563eb",
    ariaDescription: "Derivative gain.",
  },
];

const FEEDFORWARD_SLIDERS: ReadonlyArray<SliderConfig> = [
  {
    key: "kS",
    label: "kS",
    axisColor: "#7c3aed",
    ariaDescription: "Static friction feedforward.",
  },
  {
    key: "kV",
    label: "kV",
    axisColor: "#0891b2",
    ariaDescription: "Velocity feedforward.",
  },
  {
    key: "kG",
    label: "kG",
    axisColor: "#16a34a",
    ariaDescription: "Gravity feedforward.",
  },
];

// ── Arm visualization ───────────────────────────────────────────────────
//
// Convention: theta=0 → arm horizontal (extends right from pivot),
//             theta=+90° → straight up,
//             theta=-90° → straight down.
// In SVG y grows downward, so:
//   end.x = pivot.x + L·cos(theta)
//   end.y = pivot.y − L·sin(theta)

interface ArmVizProps {
  responseTheta: Float64Array;
  targetDeg: number;
  initialDeg: number;
  durationSec: number;
  reducedMotion: boolean;
  isDark: boolean;
}

const ARM_VB = 220;
const ARM_PIVOT = { x: 64, y: 110 };
const ARM_LENGTH = 110;
const TICK_RADIUS = 96; // arc radius for reference ticks
const SAMPLE_RATE_MS = 1;

function ArmViz({
  responseTheta,
  targetDeg,
  initialDeg,
  durationSec,
  reducedMotion,
  isDark,
}: ArmVizProps) {
  const armLineRef = useRef<SVGLineElement>(null);
  const ballRef = useRef<SVGCircleElement>(null);
  const angleLabelRef = useRef<SVGTextElement>(null);

  const placeArm = useCallback((thetaDeg: number) => {
    const r = (thetaDeg * Math.PI) / 180;
    const ex = ARM_PIVOT.x + ARM_LENGTH * Math.cos(r);
    const ey = ARM_PIVOT.y - ARM_LENGTH * Math.sin(r);
    armLineRef.current?.setAttribute("x2", ex.toString());
    armLineRef.current?.setAttribute("y2", ey.toString());
    ballRef.current?.setAttribute("cx", ex.toString());
    ballRef.current?.setAttribute("cy", ey.toString());
    if (angleLabelRef.current) {
      // Suppress signed-zero display ("-0°")
      const rounded = Math.round(thetaDeg);
      angleLabelRef.current.textContent = `${rounded === 0 ? 0 : rounded}°`;
    }
  }, []);

  useEffect(() => {
    placeArm(responseTheta[0] ?? initialDeg);
  }, [responseTheta, initialDeg, placeArm]);

  useEffect(() => {
    if (responseTheta.length === 0) return;
    if (reducedMotion) {
      placeArm(responseTheta[responseTheta.length - 1] ?? 0);
      return;
    }
    let frameId = 0;
    const startTime = performance.now();
    const loopMs = durationSec * 1000 + 600;
    const tick = () => {
      const elapsed = performance.now() - startTime;
      const loopT = elapsed % loopMs;
      let thetaDeg: number;
      if (loopT < durationSec * 1000) {
        const idx = Math.min(
          responseTheta.length - 1,
          Math.floor(loopT / SAMPLE_RATE_MS)
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

  const tRad = (targetDeg * Math.PI) / 180;
  const tx = ARM_PIVOT.x + ARM_LENGTH * Math.cos(tRad);
  const ty = ARM_PIVOT.y - ARM_LENGTH * Math.sin(tRad);

  const gradStart = isDark ? "#9fbcd9" : "#264060";
  const gradEnd = isDark ? "#c1d4e7" : "#4a73a0";
  const ghost = isDark ? "#64748b" : "#94a3b8";
  const tickColor = isDark ? "#475569" : "#cbd5e1";
  const mount = isDark ? "#475569" : "#cbd5e1";
  const ballStroke = isDark ? "#0d233f" : "#fff";

  // Half-circle protractor sweep from -90° (bottom) to +90° (top)
  const arcStart = {
    x: ARM_PIVOT.x,
    y: ARM_PIVOT.y + TICK_RADIUS, // -90° (down)
  };
  const arcEnd = {
    x: ARM_PIVOT.x,
    y: ARM_PIVOT.y - TICK_RADIUS, // +90° (up)
  };

  return (
    <svg
      viewBox={`0 0 ${ARM_VB} ${ARM_VB}`}
      className="block h-full w-full"
      role="img"
      aria-label="Simulated 1-DOF arm. theta=0 is horizontal (pointing right), +90° is up, -90° is down. Solid arm shows the current angle; dashed arm marks the target."
    >
      {/* Reference half-arc */}
      <path
        d={`M ${arcStart.x} ${arcStart.y} A ${TICK_RADIUS} ${TICK_RADIUS} 0 0 1 ${arcEnd.x} ${arcEnd.y}`}
        fill="none"
        stroke={tickColor}
        strokeWidth={1}
        strokeDasharray="2 4"
        opacity={0.65}
      />
      {[-90, -45, 0, 45, 90].map((deg) => {
        const r = (deg * Math.PI) / 180;
        const inner = TICK_RADIUS - 6;
        const outer = TICK_RADIUS + 2;
        const label = TICK_RADIUS + 14;
        const x1 = ARM_PIVOT.x + inner * Math.cos(r);
        const y1 = ARM_PIVOT.y - inner * Math.sin(r);
        const x2 = ARM_PIVOT.x + outer * Math.cos(r);
        const y2 = ARM_PIVOT.y - outer * Math.sin(r);
        const lx = ARM_PIVOT.x + label * Math.cos(r);
        const ly = ARM_PIVOT.y - label * Math.sin(r) + 3;
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
              fill={ghost}
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
        stroke={ghost}
        strokeWidth={2.5}
        strokeDasharray="4 4"
        opacity={0.55}
        strokeLinecap="round"
      />
      <circle
        cx={tx}
        cy={ty}
        r={6}
        fill="none"
        stroke={ghost}
        strokeWidth={1.5}
        strokeDasharray="2 2"
        opacity={0.7}
      />

      {/* Mount bracket (vertical wall to the left of the pivot) */}
      <rect
        x={ARM_PIVOT.x - 22}
        y={ARM_PIVOT.y - 30}
        width={14}
        height={60}
        rx={2}
        fill={mount}
      />
      <rect
        x={ARM_PIVOT.x - 22}
        y={ARM_PIVOT.y - 30}
        width={3}
        height={60}
        rx={1}
        fill={ghost}
        opacity={0.7}
      />

      <defs>
        <linearGradient id="armGrad" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stopColor={gradStart} />
          <stop offset="100%" stopColor={gradEnd} />
        </linearGradient>
        <radialGradient id="ballGrad" cx="35%" cy="35%" r="65%">
          <stop offset="0%" stopColor={gradEnd} />
          <stop offset="100%" stopColor={gradStart} />
        </radialGradient>
      </defs>

      <line
        ref={armLineRef}
        x1={ARM_PIVOT.x}
        y1={ARM_PIVOT.y}
        x2={ARM_PIVOT.x + ARM_LENGTH}
        y2={ARM_PIVOT.y}
        stroke="url(#armGrad)"
        strokeWidth={9}
        strokeLinecap="round"
      />
      <circle
        ref={ballRef}
        cx={ARM_PIVOT.x + ARM_LENGTH}
        cy={ARM_PIVOT.y}
        r={10}
        fill="url(#ballGrad)"
        stroke={ballStroke}
        strokeWidth={1.75}
      />

      <circle
        cx={ARM_PIVOT.x}
        cy={ARM_PIVOT.y}
        r={4.5}
        fill={isDark ? "#cbd5e1" : "#0d233f"}
      />
      <circle
        cx={ARM_PIVOT.x}
        cy={ARM_PIVOT.y}
        r={1.75}
        fill={isDark ? "#0d233f" : "#cbd5e1"}
      />

      {/* Live angle readout — bottom-right corner */}
      <text
        ref={angleLabelRef}
        x={ARM_VB - 10}
        y={ARM_VB - 10}
        fontSize={13}
        fontWeight={600}
        textAnchor="end"
        fill={isDark ? "#e2e8f0" : "#0d233f"}
        fontFamily="ui-monospace, monospace"
      >
        0°
      </text>
    </svg>
  );
}

// ── Main component ──────────────────────────────────────────────────────

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
    }))
  );
  const targetDeg = usePidStore((s) => s.targetDeg);
  const setTargetDeg = usePidStore((s) => s.setTargetDeg);
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
    [setKP, setKI, setKD, setKS, setKV, setKG]
  );

  const targetRad = (targetDeg * Math.PI) / 180;
  const physics = useMemo(() => physicsFor(targetRad), [targetRad]);

  // Throttled mirror of gains+target → sim recompute.
  const inputs = useMemo(() => ({ ...gains, targetDeg }), [gains, targetDeg]);
  const [throttled, setThrottled] = useState(inputs);
  const rafRef = useRef<number | null>(null);
  const timeoutRef = useRef<number | null>(null);
  useEffect(() => {
    if (reducedMotion) {
      if (timeoutRef.current !== null) return;
      timeoutRef.current = window.setTimeout(() => {
        timeoutRef.current = null;
        setThrottled(inputs);
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
      setThrottled(inputs);
    });
    return () => {
      if (rafRef.current !== null) {
        window.cancelAnimationFrame(rafRef.current);
        rafRef.current = null;
      }
    };
  }, [inputs, reducedMotion]);

  const response = useMemo(() => {
    const { targetDeg: td, kP, kI, kD, kS, kV, kG } = throttled;
    const targetR = (td * Math.PI) / 180;
    return simulateStepResponse(physicsFor(targetR), {
      kP,
      kI,
      kD,
      kS,
      kV,
      kG,
    });
  }, [throttled]);

  // uPlot
  const containerRef = useRef<HTMLDivElement>(null);
  const plotRef = useRef<uPlot | null>(null);

  const accent = useMemo(
    () => ({
      target: isDark ? "#64748b" : "#94a3b8",
      setpoint: isDark ? "#f59e0b" : "#b45309",
      actual: isDark ? "#7da4cb" : "#264060",
      actualFillTop: isDark
        ? "rgba(125, 164, 203, 0.28)"
        : "rgba(38, 64, 96, 0.16)",
      actualFillBottom: isDark
        ? "rgba(125, 164, 203, 0)"
        : "rgba(38, 64, 96, 0)",
      grid: isDark ? "rgba(148, 163, 184, 0.12)" : "rgba(100, 116, 139, 0.13)",
      text: isDark ? "#94a3b8" : "#64748b",
    }),
    [isDark]
  );

  const buildPlot = useCallback(() => {
    if (!containerRef.current) return;
    const width = containerRef.current.clientWidth;
    const opts: uPlot.Options = {
      width: width || 480,
      height: 220,
      padding: [12, 12, 0, 0],
      legend: { show: false },
      cursor: {
        drag: { x: false, y: false },
        focus: { prox: 30 },
        points: { show: false },
      },
      scales: {
        x: { time: false, range: [0, physics.durationSec] },
        // Fixed -90° → 90° range so different gain configurations are directly
        // comparable. Matches the arm's physical mechanical range.
        y: { range: [-90, 90] },
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
          // Explicit ticks: -90, -45, 0, 45, 90.
          splits: () => [-90, -45, 0, 45, 90],
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
      containerRef.current
    );
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [accent, physics.durationSec, targetDeg]);

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
        plotRef.current.setSize({ width: el.clientWidth, height: 220 });
      }
    });
    obs.observe(el);
    return () => obs.disconnect();
  }, []);

  const regimeStyle = REGIME_STYLE[response.metrics.regime];
  const physicsTargetDeg = (physics.target * 180) / Math.PI;
  const initialDeg = (physics.initialAngle * 180) / Math.PI;

  const settlingStr =
    response.metrics.settlingTime !== null
      ? `${response.metrics.settlingTime.toFixed(2)} s`
      : "—";

  const renderSlider = (cfg: SliderConfig) => {
    const range = SLIDER_RANGES[cfg.key];
    return (
      <Slider
        key={cfg.key}
        label={cfg.label}
        unit={range.unit}
        axisColor={cfg.axisColor}
        value={gains[cfg.key]}
        min={range.min}
        max={range.max}
        step={range.step}
        precision={range.precision}
        onChange={setters[cfg.key]}
        ariaDescription={cfg.ariaDescription}
      />
    );
  };

  return (
    <section className="module relative p-5 sm:p-6" style={{ paddingTop: 40 }}>
      <span className="module-tag">PID · LIVE TUNER</span>
      {/* ── Toolbar ──────────────────────────── */}
      <header className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-2.5">
          <span
            className="font-mono inline-flex items-center gap-1.5 rounded-sm px-2.5 py-1 text-[11px] font-semibold"
            style={{
              background: "var(--bg-elev)",
              border: `1px solid ${regimeStyle.cssVar}`,
              color: regimeStyle.cssVar,
              letterSpacing: "0.08em",
            }}
            aria-live="polite"
          >
            <span
              aria-hidden
              style={{
                display: "inline-block",
                width: 6,
                height: 6,
                borderRadius: "50%",
                background: regimeStyle.cssVar,
              }}
            />
            {regimeStyle.label}
          </span>
          <div
            className="flex items-center gap-x-3 text-[11px] text-[var(--muted-foreground)] tabular-nums"
            aria-label="Performance metrics"
          >
            <span>
              <span className="text-[var(--foreground)] font-medium">
                {response.metrics.overshootDeg.toFixed(1)}°
              </span>{" "}
              overshoot
            </span>
            <span>
              <span className="text-[var(--foreground)] font-medium">
                {response.metrics.steadyStateErrorDeg.toFixed(1)}°
              </span>{" "}
              final err
            </span>
            <span>
              <span className="text-[var(--foreground)] font-medium">
                {settlingStr}
              </span>{" "}
              settle
            </span>
            <span>
              <span className="text-[var(--foreground)] font-medium">
                {response.metrics.peakVoltage.toFixed(1)} V
              </span>{" "}
              peak
            </span>
          </div>
        </div>
        <button
          type="button"
          onClick={reset}
          className="inline-flex items-center gap-1 rounded-md border border-[var(--border)] bg-[var(--muted)] px-2 py-1 text-[11px] font-medium text-[var(--foreground)] transition-colors hover:bg-[var(--border)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--primary)] focus-visible:ring-offset-1"
          aria-label="Reset all gains and the target to defaults"
        >
          <RotateCcw className="h-3 w-3" />
          Reset
        </button>
      </header>

      {/* ── Target picker ───────────────────── */}
      <div className="mb-4 flex flex-wrap items-center gap-3 rounded-lg border border-[var(--border)] bg-[var(--background)] px-3 py-2">
        <label
          htmlFor="pid-target"
          className="inline-flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-[0.06em] text-[var(--muted-foreground)]"
        >
          <TargetIcon className="h-3.5 w-3.5" aria-hidden />
          Target
        </label>
        <input
          id="pid-target"
          type="range"
          min={TARGET_RANGE_DEG.min}
          max={TARGET_RANGE_DEG.max}
          step={TARGET_RANGE_DEG.step}
          value={targetDeg}
          onChange={(e) => setTargetDeg(parseFloat(e.target.value))}
          aria-label="Target angle in degrees. The arm starts at zero, holds for one second, then steps to this angle."
          aria-valuemin={TARGET_RANGE_DEG.min}
          aria-valuemax={TARGET_RANGE_DEG.max}
          aria-valuenow={targetDeg}
          className="pid-slider min-w-0 flex-1"
          style={
            {
              ["--slider-accent" as string]: "#475569",
              ["--slider-fill" as string]: `${((targetDeg - TARGET_RANGE_DEG.min) / (TARGET_RANGE_DEG.max - TARGET_RANGE_DEG.min)) * 100}%`,
            } as React.CSSProperties
          }
        />
        <span className="rounded-md bg-[var(--muted)] px-2 py-0.5 font-mono text-[12px] tabular-nums text-[var(--foreground)]">
          {targetDeg}°
        </span>
        <span className="font-mono text-[10px] text-[var(--muted-foreground)]">
          {(targetDeg / 360).toFixed(3)} rot
        </span>
      </div>

      {/* ── Visualization ───────────────────── */}
      <div className="grid gap-4 md:grid-cols-[180px_minmax(0,1fr)] md:gap-5">
        <div className="rounded-xl border border-[var(--border)] bg-[var(--background)] p-2 md:aspect-square md:p-3">
          <ArmViz
            responseTheta={response.theta}
            targetDeg={physicsTargetDeg}
            initialDeg={initialDeg}
            durationSec={physics.durationSec}
            reducedMotion={reducedMotion}
            isDark={isDark}
          />
        </div>
        <div className="rounded-xl border border-[var(--border)] bg-[var(--background)] p-2 md:p-3">
          <div
            ref={containerRef}
            className="pid-plot w-full"
            style={{ minHeight: 220 }}
            aria-label={`Response plot for a step to ${targetDeg} degrees. Dashed line is the target, dotted is the profile setpoint (stepping from zero to the target at one second), solid is the actual arm angle over five seconds.`}
            role="img"
          />
          <div className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-0.5 px-1 text-[10px] text-[var(--muted-foreground)]">
            <span className="inline-flex items-center gap-1">
              <span
                aria-hidden
                className="inline-block h-px w-3.5"
                style={{
                  background: `repeating-linear-gradient(to right, ${accent.target} 0 4px, transparent 4px 8px)`,
                }}
              />
              target
            </span>
            <span className="inline-flex items-center gap-1">
              <span
                aria-hidden
                className="inline-block h-px w-3.5"
                style={{
                  background: `repeating-linear-gradient(to right, ${accent.setpoint} 0 2px, transparent 2px 5px)`,
                }}
              />
              profile setpoint
            </span>
            <span className="inline-flex items-center gap-1">
              <span
                aria-hidden
                className="inline-block h-px w-3.5"
                style={{ background: accent.actual }}
              />
              arm angle
            </span>
          </div>
        </div>
      </div>

      {/* ── Tuning hint ─────────────────────── */}
      <div className="mt-4 flex items-start gap-2 rounded-lg border border-[var(--border)] bg-[var(--muted)]/50 px-3 py-2 text-[11px] leading-relaxed text-[var(--muted-foreground)]">
        <Lightbulb
          className="mt-0.5 h-3.5 w-3.5 shrink-0 text-[var(--accent)]"
          aria-hidden
        />
        <p>
          Each loop the arm starts at <span className="font-mono">0°</span>{" "}
          (horizontal). For the first second the setpoint stays at{" "}
          <span className="font-mono">0°</span>. Use that window to tune{" "}
          <span className="font-mono">kG</span> until the arm holds. For a
          Kraken X44 + 25:1 driving a 2&nbsp;kg&nbsp;·&nbsp;0.4&nbsp;m arm,
          CTRE&apos;s dyno numbers give{" "}
          <span className="font-mono">kG = mgL / (Kₜ·R) ≈ 0.92&nbsp;V</span>.
          Add <span className="font-mono">kS</span> to overcome residual static
          friction. At <span className="font-mono">t&nbsp;=&nbsp;1&nbsp;s</span>{" "}
          the setpoint steps to your slider target;{" "}
          <span className="font-mono">kP</span> and{" "}
          <span className="font-mono">kD</span> chase the arm there and damp the
          overshoot. Order: <span className="font-mono">kG → kS → kP → kD</span>
          .
        </p>
      </div>

      {/* ── Sliders ─────────────────────────── */}
      <div className="mt-5 grid gap-5 md:grid-cols-2">
        <div>
          <h3 className="mb-2 text-[10px] font-semibold uppercase tracking-[0.08em] text-[var(--muted-foreground)]">
            Feedback · PID
          </h3>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
            {FEEDBACK_SLIDERS.map(renderSlider)}
          </div>
        </div>
        <div>
          <h3 className="mb-2 text-[10px] font-semibold uppercase tracking-[0.08em] text-[var(--muted-foreground)]">
            Feedforward
          </h3>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
            {FEEDFORWARD_SLIDERS.map(renderSlider)}
          </div>
        </div>
      </div>

      {/* ── Footer ──────────────────────────── */}
      <p className="mt-4 text-[11px] leading-relaxed text-[var(--muted-foreground)]">
        2 kg · 0.4 m arm on a Kraken X44 + 25:1 reduction (4.11 N·m stall, 7758
        RPM free per CTRE dyno data; ≈ 103 N·m / 310 RPM at the arm; back-EMF
        modelled, ±12 V saturation). Gains use Phoenix 6 / WPILib mechanism-side
        units. Drop these values straight into a{" "}
        <span className="font-mono text-[var(--foreground)]">Slot0Configs</span>{" "}
        with{" "}
        <span className="font-mono text-[var(--foreground)]">
          SensorToMechanismRatio&nbsp;=&nbsp;25
        </span>
        .
      </p>
    </section>
  );
}
