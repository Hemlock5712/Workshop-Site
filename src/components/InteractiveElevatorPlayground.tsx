"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useTheme } from "next-themes";
import uPlot from "uplot";
import "uplot/dist/uPlot.min.css";
import { useShallow } from "zustand/react/shallow";
import { useElevatorStore } from "@/lib/elevatorStore";
import {
  ELEV_TARGET_RANGE_M,
  ELEV_SLIDER_RANGES,
  elevatorPhysicsFor,
  simulateElevatorResponse,
  type ElevatorGains,
  type ElevRegime,
} from "@/lib/elevatorPhysics";
import { Lightbulb, RotateCcw, ArrowUpDown } from "lucide-react";

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

type GainKey = keyof ElevatorGains;

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
  const id = `elev-slider-${label}`;
  const pct = ((value - min) / (max - min)) * 100;
  return (
    <div className="flex flex-col gap-1.5">
      <div className="flex items-baseline justify-between gap-2">
        <div className="flex items-baseline gap-1.5">
          <label
            htmlFor={id}
            className="font-mono text-[13px] font-semibold"
            style={{ color: axisColor }}
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

const REGIME_STYLE: Record<
  ElevRegime,
  { label: string; classes: string; dot: string }
> = {
  oscillating: {
    label: "Oscillating",
    dot: "bg-amber-500",
    classes:
      "bg-amber-50 text-amber-900 ring-1 ring-amber-200/70 dark:bg-amber-950/40 dark:text-amber-100 dark:ring-amber-800/50",
  },
  stable: {
    label: "Stable",
    dot: "bg-emerald-500",
    classes:
      "bg-emerald-50 text-emerald-900 ring-1 ring-emerald-200/70 dark:bg-emerald-950/40 dark:text-emerald-100 dark:ring-emerald-800/50",
  },
  drifting: {
    label: "Drifting",
    dot: "bg-rose-500",
    classes:
      "bg-rose-50 text-rose-900 ring-1 ring-rose-200/70 dark:bg-rose-950/40 dark:text-rose-100 dark:ring-rose-800/50",
  },
};

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
    ariaDescription: "Gravity feedforward — constant lift voltage.",
  },
];

// ── Elevator viz ────────────────────────────────────────────────────────

interface ElevatorVizProps {
  responsePosition: Float64Array;
  targetM: number;
  maxMeters: number;
  durationSec: number;
  reducedMotion: boolean;
  isDark: boolean;
}

const ELEV_VB_W = 220;
const ELEV_VB_H = 220;
const RAIL_X = ELEV_VB_W / 2;
const RAIL_TOP = 22;
const RAIL_BOTTOM = ELEV_VB_H - 22;
const RAIL_HEIGHT = RAIL_BOTTOM - RAIL_TOP;
const CARRIAGE_HALF_H = 14;
const CARRIAGE_HALF_W = 36;
const SAMPLE_RATE_MS = 1;

function ElevatorViz({
  responsePosition,
  targetM,
  maxMeters,
  durationSec,
  reducedMotion,
  isDark,
}: ElevatorVizProps) {
  const carriageRef = useRef<SVGGElement>(null);
  const posLabelRef = useRef<SVGTextElement>(null);

  /** Map meters [0..maxMeters] to SVG y (bottom of carriage). */
  const mToY = useCallback(
    (m: number) => {
      const clamped = Math.max(0, Math.min(maxMeters, m));
      const frac = clamped / maxMeters;
      return RAIL_BOTTOM - frac * RAIL_HEIGHT;
    },
    [maxMeters]
  );

  const placeCarriage = useCallback(
    (m: number) => {
      const y = mToY(m) - CARRIAGE_HALF_H;
      carriageRef.current?.setAttribute("transform", `translate(0 ${y})`);
      if (posLabelRef.current) {
        posLabelRef.current.textContent = `${m.toFixed(2)} m`;
      }
    },
    [mToY]
  );

  useEffect(() => {
    placeCarriage(responsePosition[0] ?? 0);
  }, [responsePosition, placeCarriage]);

  useEffect(() => {
    if (responsePosition.length === 0) return;
    if (reducedMotion) {
      placeCarriage(responsePosition[responsePosition.length - 1] ?? 0);
      return;
    }
    let frameId = 0;
    const startTime = performance.now();
    const loopMs = durationSec * 1000 + 600;
    const tick = () => {
      const elapsed = performance.now() - startTime;
      const loopT = elapsed % loopMs;
      let m: number;
      if (loopT < durationSec * 1000) {
        const idx = Math.min(
          responsePosition.length - 1,
          Math.floor(loopT / SAMPLE_RATE_MS)
        );
        m = responsePosition[idx] ?? 0;
      } else {
        m = responsePosition[responsePosition.length - 1] ?? 0;
      }
      placeCarriage(m);
      frameId = requestAnimationFrame(tick);
    };
    frameId = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frameId);
  }, [responsePosition, durationSec, reducedMotion, placeCarriage]);

  const rail = isDark ? "#475569" : "#94a3b8";
  const tickColor = isDark ? "#64748b" : "#cbd5e1";
  const ghost = isDark ? "#64748b" : "#94a3b8";
  const carriage1 = isDark ? "#9fbcd9" : "#264060";
  const carriage2 = isDark ? "#c1d4e7" : "#4a73a0";
  const cable = isDark ? "#94a3b8" : "#64748b";
  const groundFill = isDark ? "#1e293b" : "#f1f5f9";

  const targetY = mToY(targetM);

  return (
    <svg
      viewBox={`0 0 ${ELEV_VB_W} ${ELEV_VB_H}`}
      className="block h-full w-full"
      role="img"
      aria-label="Simulated elevator. The carriage rides on a vertical rail; the dashed ghost marks the commanded target height."
    >
      <defs>
        <linearGradient id="elevCarriageGrad" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor={carriage2} />
          <stop offset="100%" stopColor={carriage1} />
        </linearGradient>
      </defs>

      {/* Ground */}
      <rect
        x={0}
        y={RAIL_BOTTOM}
        width={ELEV_VB_W}
        height={ELEV_VB_H - RAIL_BOTTOM}
        fill={groundFill}
      />

      {/* Rails */}
      <line
        x1={RAIL_X - 28}
        y1={RAIL_TOP - 4}
        x2={RAIL_X - 28}
        y2={RAIL_BOTTOM}
        stroke={rail}
        strokeWidth={2}
        strokeLinecap="round"
      />
      <line
        x1={RAIL_X + 28}
        y1={RAIL_TOP - 4}
        x2={RAIL_X + 28}
        y2={RAIL_BOTTOM}
        stroke={rail}
        strokeWidth={2}
        strokeLinecap="round"
      />

      {/* Top mount with motor */}
      <rect
        x={RAIL_X - 36}
        y={RAIL_TOP - 16}
        width={72}
        height={12}
        rx={2}
        fill={rail}
      />
      <rect
        x={RAIL_X - 18}
        y={RAIL_TOP - 22}
        width={36}
        height={6}
        rx={1}
        fill={isDark ? "#cbd5e1" : "#475569"}
      />

      {/* Height ticks (every 0.5 m) */}
      {[0, 0.5, 1.0, 1.5].map((m) => {
        const y = mToY(m);
        return (
          <g key={m}>
            <line
              x1={RAIL_X + 38}
              y1={y}
              x2={RAIL_X + 46}
              y2={y}
              stroke={tickColor}
              strokeWidth={1.25}
            />
            <text
              x={RAIL_X + 52}
              y={y + 3}
              fontSize={9}
              fill={ghost}
              fontFamily="ui-sans-serif, system-ui"
            >
              {m.toFixed(1)} m
            </text>
          </g>
        );
      })}

      {/* Target ghost marker */}
      <line
        x1={RAIL_X - 38}
        y1={targetY}
        x2={RAIL_X + 38}
        y2={targetY}
        stroke={ghost}
        strokeWidth={1.5}
        strokeDasharray="3 3"
        opacity={0.7}
      />
      <text
        x={RAIL_X - 42}
        y={targetY + 3}
        fontSize={9}
        textAnchor="end"
        fill={ghost}
        fontFamily="ui-sans-serif, system-ui"
        opacity={0.8}
      >
        target
      </text>

      {/* Carriage (group is translated each frame) */}
      <g ref={carriageRef}>
        {/* Cable from top mount to carriage top */}
        <line
          x1={RAIL_X}
          y1={RAIL_TOP - 4}
          x2={RAIL_X}
          y2={RAIL_BOTTOM - CARRIAGE_HALF_H * 2 + CARRIAGE_HALF_H}
          stroke={cable}
          strokeWidth={1.25}
          strokeDasharray="2 2"
          opacity={0.6}
        />
        <rect
          x={RAIL_X - CARRIAGE_HALF_W}
          y={RAIL_BOTTOM - CARRIAGE_HALF_H * 2}
          width={CARRIAGE_HALF_W * 2}
          height={CARRIAGE_HALF_H * 2}
          rx={3}
          fill="url(#elevCarriageGrad)"
          stroke={isDark ? "#0d233f" : "#0d233f"}
          strokeWidth={1}
        />
        {/* Roller wheels on rails */}
        <circle
          cx={RAIL_X - 28}
          cy={RAIL_BOTTOM - CARRIAGE_HALF_H}
          r={3}
          fill={isDark ? "#cbd5e1" : "#0d233f"}
        />
        <circle
          cx={RAIL_X + 28}
          cy={RAIL_BOTTOM - CARRIAGE_HALF_H}
          r={3}
          fill={isDark ? "#cbd5e1" : "#0d233f"}
        />
      </g>

      {/* Live position readout */}
      <text
        ref={posLabelRef}
        x={ELEV_VB_W - 10}
        y={ELEV_VB_H - 8}
        fontSize={13}
        fontWeight={600}
        textAnchor="end"
        fill={isDark ? "#e2e8f0" : "#0d233f"}
        fontFamily="ui-monospace, monospace"
      >
        0.00 m
      </text>
    </svg>
  );
}

// ── Main component ──────────────────────────────────────────────────────

export default function InteractiveElevatorPlayground() {
  const reducedMotion = useReducedMotion();
  const { resolvedTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);
  const isDark = mounted && resolvedTheme === "dark";

  const gains = useElevatorStore(
    useShallow((s) => ({
      kP: s.kP,
      kI: s.kI,
      kD: s.kD,
      kS: s.kS,
      kV: s.kV,
      kG: s.kG,
    }))
  );
  const targetM = useElevatorStore((s) => s.targetM);
  const setTargetM = useElevatorStore((s) => s.setTargetM);
  const setKP = useElevatorStore((s) => s.setKP);
  const setKI = useElevatorStore((s) => s.setKI);
  const setKD = useElevatorStore((s) => s.setKD);
  const setKS = useElevatorStore((s) => s.setKS);
  const setKV = useElevatorStore((s) => s.setKV);
  const setKG = useElevatorStore((s) => s.setKG);
  const reset = useElevatorStore((s) => s.reset);

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

  const physics = useMemo(() => elevatorPhysicsFor(targetM), [targetM]);

  // Throttled mirror of gains + target → sim recompute.
  const inputs = useMemo(() => ({ ...gains, targetM }), [gains, targetM]);
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
    const { targetM: tm, kP, kI, kD, kS, kV, kG } = throttled;
    return simulateElevatorResponse(elevatorPhysicsFor(tm), {
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
        y: { range: [-0.1, ELEV_TARGET_RANGE_M.max + 0.1] },
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
          size: 44,
          splits: () => [0, 0.5, 1.0, 1.5],
          values: (_u, splits) => splits.map((v) => `${v.toFixed(1)}m`),
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
          label: "Position",
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
      [response.t, response.targetM, response.positionM],
      containerRef.current
    );
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [accent, physics.durationSec]);

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
    plotRef.current.setData([response.t, response.targetM, response.positionM]);
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
  const settlingStr =
    response.metrics.settlingTime !== null
      ? `${response.metrics.settlingTime.toFixed(2)} s`
      : "—";

  const renderSlider = (cfg: SliderConfig) => {
    const range = ELEV_SLIDER_RANGES[cfg.key];
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
    <section className="rounded-2xl border border-[var(--border)] bg-[var(--card)] p-5 shadow-[0_1px_2px_rgb(0_0_0_/_0.04)] sm:p-6">
      {/* ── Toolbar ──────────────────────────── */}
      <header className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-2.5">
          <span
            className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-[11px] font-semibold ${regimeStyle.classes}`}
            aria-live="polite"
          >
            <span
              aria-hidden
              className={`inline-block h-1.5 w-1.5 rounded-full ${regimeStyle.dot}`}
            />
            {regimeStyle.label}
          </span>
          <div
            className="flex items-center gap-x-3 text-[11px] text-[var(--muted-foreground)] tabular-nums"
            aria-label="Performance metrics"
          >
            <span>
              <span className="text-[var(--foreground)] font-medium">
                {(response.metrics.overshootM * 100).toFixed(1)}
              </span>{" "}
              cm overshoot
            </span>
            <span>
              <span className="text-[var(--foreground)] font-medium">
                {(response.metrics.steadyStateErrorM * 100).toFixed(1)}
              </span>{" "}
              cm final err
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
          htmlFor="elev-target"
          className="inline-flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-[0.06em] text-[var(--muted-foreground)]"
        >
          <ArrowUpDown className="h-3.5 w-3.5" aria-hidden />
          Target
        </label>
        <input
          id="elev-target"
          type="range"
          min={ELEV_TARGET_RANGE_M.min}
          max={ELEV_TARGET_RANGE_M.max}
          step={ELEV_TARGET_RANGE_M.step}
          value={targetM}
          onChange={(e) => setTargetM(parseFloat(e.target.value))}
          aria-label="Target carriage height in meters. After the 1-second hold the controller steps the setpoint up to this height."
          aria-valuemin={ELEV_TARGET_RANGE_M.min}
          aria-valuemax={ELEV_TARGET_RANGE_M.max}
          aria-valuenow={targetM}
          className="pid-slider min-w-0 flex-1"
          style={
            {
              ["--slider-accent" as string]: "#475569",
              ["--slider-fill" as string]: `${((targetM - ELEV_TARGET_RANGE_M.min) / (ELEV_TARGET_RANGE_M.max - ELEV_TARGET_RANGE_M.min)) * 100}%`,
            } as React.CSSProperties
          }
        />
        <span className="rounded-md bg-[var(--muted)] px-2 py-0.5 font-mono text-[12px] tabular-nums text-[var(--foreground)]">
          {targetM.toFixed(2)} m
        </span>
      </div>

      {/* ── Visualization ───────────────────── */}
      <div className="grid gap-4 md:grid-cols-[180px_minmax(0,1fr)] md:gap-5">
        <div className="rounded-xl border border-[var(--border)] bg-[var(--background)] p-2 md:aspect-square md:p-3">
          <ElevatorViz
            responsePosition={response.positionM}
            targetM={targetM}
            maxMeters={ELEV_TARGET_RANGE_M.max}
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
            aria-label={`Position-response plot for the elevator target of ${targetM.toFixed(2)} m. Dashed is the commanded target, solid is the carriage position.`}
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
                style={{ background: accent.actual }}
              />
              carriage position
            </span>
          </div>
        </div>
      </div>

      {/* ── Tuning hint ─────────────────────── */}
      <div className="mt-4 flex items-start gap-2 rounded-lg border border-[var(--border)] bg-[var(--muted)]/50 px-3 py-2 text-[11px] leading-relaxed text-[var(--muted-foreground)]">
        <Lightbulb
          className="mt-0.5 h-3.5 w-3.5 shrink-0 text-amber-500"
          aria-hidden
        />
        <p>
          The carriage starts at the ground and holds there for 1&nbsp;s, then
          steps up to your slider target. Gravity is constant so{" "}
          <span className="font-mono">kG</span> is just a fixed voltage —{" "}
          <span className="font-mono">kG = m·g·r_spool / (Kₜ·R)</span> ≈{" "}
          <span className="font-mono">0.22&nbsp;V</span> for this 8&nbsp;kg
          carriage on a Kraken X60 + 15:1 + 1&quot; spool. Add{" "}
          <span className="font-mono">kS</span> for the rail friction breakaway,
          then <span className="font-mono">kP</span> and{" "}
          <span className="font-mono">kD</span> close the loop. Order:{" "}
          <span className="font-mono">kG → kS → kP → kD → kI</span>.
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
        8&nbsp;kg carriage on a Kraken X60 + 15:1 reduction + 1&quot;-radius
        spool (back-EMF + stick-slip friction modelled, ±12&nbsp;V saturation,
        max travel 1.5&nbsp;m). Gains use Phoenix 6 / WPILib elevator units —
        drop these into a{" "}
        <span className="font-mono text-[var(--foreground)]">Slot0Configs</span>{" "}
        with{" "}
        <span className="font-mono text-[var(--foreground)]">
          SensorToMechanismRatio
        </span>{" "}
        configured to report meters of travel.
      </p>
    </section>
  );
}
