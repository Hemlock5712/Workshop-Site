"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useTheme } from "next-themes";
import { readPlotTheme } from "@/lib/plotTheme";
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
import SliderNumberInput from "@/components/SliderNumberInput";

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
            className="font-mono text-note font-semibold"
            style={{ color: "var(--tx)" }}
          >
            {label}
          </label>
          <span className="font-mono text-micro text-[var(--tx2)]">{unit}</span>
        </div>
        <SliderNumberInput
          value={value}
          min={min}
          max={max}
          step={step}
          precision={precision}
          onChange={onChange}
          ariaLabel={`${ariaDescription} Value in ${unit}.`}
        />
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
    dot: "bg-[var(--bg2)]",
    classes:
      "bg-[var(--bg2)] text-[var(--accent)] ring-1 ring-[color-mix(in_oklch,var(--accent)_70%,transparent)] text-[var(--accent)]",
  },
  stable: {
    label: "Stable",
    dot: "bg-[var(--bg2)]",
    classes:
      "bg-[var(--bg2)] text-[var(--ok)] ring-1 ring-[color-mix(in_oklch,var(--ok)_70%,transparent)] text-[var(--ok)]",
  },
  drifting: {
    label: "Drifting",
    dot: "bg-[var(--bg2)]",
    classes:
      "bg-[var(--bg2)] text-[var(--err)] ring-1 ring-[color-mix(in_oklch,var(--err)_70%,transparent)] text-[var(--err)]",
  },
};

interface SliderConfig {
  key: GainKey;
  label: string;
  ariaDescription: string;
}

const FEEDBACK_SLIDERS: ReadonlyArray<SliderConfig> = [
  {
    key: "kP",
    label: "kP",
    ariaDescription: "Proportional gain.",
  },
  {
    key: "kI",
    label: "kI",
    ariaDescription: "Integral gain.",
  },
  {
    key: "kD",
    label: "kD",
    ariaDescription: "Derivative gain.",
  },
];

const FEEDFORWARD_SLIDERS: ReadonlyArray<SliderConfig> = [
  {
    key: "kS",
    label: "kS",
    ariaDescription: "Static friction feedforward.",
  },
  {
    key: "kV",
    label: "kV",
    ariaDescription: "Velocity feedforward.",
  },
  {
    key: "kG",
    label: "kG",
    ariaDescription: "Gravity feedforward: constant lift voltage.",
  },
];

// ── Elevator viz ────────────────────────────────────────────────────────

interface ElevatorVizProps {
  responsePosition: Float64Array;
  targetM: number;
  maxMeters: number;
  durationSec: number;
  reducedMotion: boolean;
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

  const rail = "var(--tx3)";
  const tickColor = "var(--rule)";
  const ghost = "var(--tx3)";
  const carriage1 = "var(--lift)";
  const carriage2 = "color-mix(in oklch, var(--lift) 55%, var(--tx))";
  const cable = "var(--tx3)";
  const groundFill = "var(--bg3)";

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
        fill={"var(--tx2)"}
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
          stroke={"var(--bg)"}
          strokeWidth={1}
        />
        {/* Roller wheels on rails */}
        <circle
          cx={RAIL_X - 28}
          cy={RAIL_BOTTOM - CARRIAGE_HALF_H}
          r={3}
          fill={"var(--tx2)"}
        />
        <circle
          cx={RAIL_X + 28}
          cy={RAIL_BOTTOM - CARRIAGE_HALF_H}
          r={3}
          fill={"var(--tx2)"}
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
        fill={"var(--tx)"}
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

  // Resolved from the `--plot-*` tokens, not branched on `isDark`.
  //
  // It has to be *resolved*: uPlot paints to a 2D canvas context, and
  // `strokeStyle = "var(--accent)"` is not a colour a canvas can parse — it
  // silently draws nothing. The SVG mechanism beside this chart can and does
  // use `var()` directly, because SVG is DOM and resolves it normally.
  //
  // `resolvedTheme` stays in the dependency list as the *signal* that the
  // class on <html> changed and the values need re-reading; the values
  // themselves are no longer a copy kept in this file.
  const accent = useMemo(() => {
    const t = readPlotTheme();
    return {
      target: t.target,
      setpoint: t.setpoint,
      actual: t.actual,
      actualFillTop: t.actualFill,
      actualFillBottom: t.actualFade,
      grid: t.grid,
      text: t.ink,
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [resolvedTheme, mounted]);

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
    <section className="rounded-2xl border border-[var(--rule)] bg-[var(--bg2)] p-5 shadow-sm sm:p-6">
      {/* ── Toolbar ──────────────────────────── */}
      <header className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-2.5">
          <span
            className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-meta font-semibold ${regimeStyle.classes}`}
            aria-live="polite"
          >
            <span
              aria-hidden
              className={`inline-block h-1.5 w-1.5 rounded-full ${regimeStyle.dot}`}
            />
            {regimeStyle.label}
          </span>
          <div
            className="flex items-center gap-x-3 text-meta text-[var(--tx2)] tabular-nums"
            aria-label="Performance metrics"
          >
            <span>
              <span className="text-[var(--tx)] font-medium">
                {(response.metrics.overshootM * 100).toFixed(1)}
              </span>{" "}
              cm overshoot
            </span>
            <span>
              <span className="text-[var(--tx)] font-medium">
                {(response.metrics.steadyStateErrorM * 100).toFixed(1)}
              </span>{" "}
              cm final err
            </span>
            <span>
              <span className="text-[var(--tx)] font-medium">
                {settlingStr}
              </span>{" "}
              settle
            </span>
            <span>
              <span className="text-[var(--tx)] font-medium">
                {response.metrics.peakVoltage.toFixed(1)} V
              </span>{" "}
              peak
            </span>
          </div>
        </div>
        <button
          type="button"
          onClick={reset}
          className="inline-flex items-center gap-1 rounded-md border border-[var(--rule)] bg-[var(--bg2)] px-2 py-1 text-meta font-medium text-[var(--tx)] transition-colors hover:bg-[var(--rule)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent)] focus-visible:ring-offset-1"
          aria-label="Reset all gains and the target to defaults"
        >
          <RotateCcw className="h-3 w-3" />
          Reset
        </button>
      </header>

      {/* ── Target picker ───────────────────── */}
      <div className="mb-4 flex flex-wrap items-center gap-3 rounded-lg border border-[var(--rule)] bg-[var(--bg)] px-3 py-2">
        <label
          htmlFor="elev-target"
          className="inline-flex items-center gap-1.5 text-meta font-semibold uppercase tracking-[0.06em] text-[var(--tx2)]"
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
              ["--slider-accent" as string]: "var(--accent)",
              ["--slider-fill" as string]: `${((targetM - ELEV_TARGET_RANGE_M.min) / (ELEV_TARGET_RANGE_M.max - ELEV_TARGET_RANGE_M.min)) * 100}%`,
            } as React.CSSProperties
          }
        />
        <SliderNumberInput
          value={targetM}
          min={ELEV_TARGET_RANGE_M.min}
          max={ELEV_TARGET_RANGE_M.max}
          step={ELEV_TARGET_RANGE_M.step}
          precision={2}
          onChange={setTargetM}
          ariaLabel="Target carriage height in meters."
          suffix="m"
        />
      </div>

      {/* ── Visualization ───────────────────── */}
      <div className="grid gap-4 md:grid-cols-[180px_minmax(0,1fr)] md:gap-5">
        <div className="rounded-xl border border-[var(--rule)] bg-[var(--bg)] p-2 md:aspect-square md:p-3">
          <ElevatorViz
            responsePosition={response.positionM}
            targetM={targetM}
            maxMeters={ELEV_TARGET_RANGE_M.max}
            durationSec={physics.durationSec}
            reducedMotion={reducedMotion}
          />
        </div>
        <div className="rounded-xl border border-[var(--rule)] bg-[var(--bg)] p-2 md:p-3">
          <div
            ref={containerRef}
            className="pid-plot w-full"
            style={{ minHeight: 220 }}
            aria-label={`Position-response plot for the elevator target of ${targetM.toFixed(2)} m. Dashed is the commanded target, solid is the carriage position.`}
            role="img"
          />
          <div className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-0.5 px-1 text-micro text-[var(--tx2)]">
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
      <div className="mt-4 flex items-start gap-2 rounded-lg border border-[var(--rule)] bg-[var(--bg2)]/50 px-3 py-2 max-w-[70ch] text-meta text-[var(--tx2)]">
        <Lightbulb
          className="mt-0.5 h-3.5 w-3.5 shrink-0 text-[var(--accent)]"
          aria-hidden
        />
        <p>
          The carriage starts at the ground and holds there for 1&nbsp;s, then
          steps up to your slider target. Gravity is constant, so{" "}
          <span className="font-mono">kG</span> is just a fixed voltage:{" "}
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
          <div className="micro mb-2">Feedback · PID</div>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
            {FEEDBACK_SLIDERS.map(renderSlider)}
          </div>
        </div>
        <div>
          <div className="micro mb-2">Feedforward</div>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
            {FEEDFORWARD_SLIDERS.map(renderSlider)}
          </div>
        </div>
      </div>

      {/* ── Footer ──────────────────────────── */}
      <p className="mt-4 max-w-[70ch] text-meta text-[var(--tx2)]">
        8&nbsp;kg carriage on a Kraken X60 + 15:1 reduction + 1&quot;-radius
        spool (back-EMF + stick-slip friction modelled, ±12&nbsp;V saturation,
        max travel 1.5&nbsp;m). Gains use Phoenix 6 / WPILib elevator units.
        Drop these into a{" "}
        <span className="font-mono text-[var(--tx)]">Slot0Configs</span> with{" "}
        <span className="font-mono text-[var(--tx)]">
          SensorToMechanismRatio
        </span>{" "}
        configured to report meters of travel.
      </p>
    </section>
  );
}
