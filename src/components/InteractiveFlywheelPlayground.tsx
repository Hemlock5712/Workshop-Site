"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useTheme } from "next-themes";
import uPlot from "uplot";
import "uplot/dist/uPlot.min.css";
import { useShallow } from "zustand/react/shallow";
import { useFlywheelStore } from "@/lib/flywheelStore";
import {
  FLY_TARGET_RANGE_RPM,
  FLY_SLIDER_RANGES,
  FLY_HOLD_PHASE_SEC,
  flywheelPhysicsFor,
  simulateFlywheelResponse,
  type FlywheelGains,
  type FlyRegime,
} from "@/lib/flywheelPhysics";
import { Lightbulb, RotateCcw, Gauge } from "lucide-react";

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

type GainKey = keyof FlywheelGains;

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
  const id = `fly-slider-${label}`;
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
  FlyRegime,
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
    ariaDescription: "Velocity feedforward: back-EMF compensation.",
  },
];

// ── Flywheel viz ────────────────────────────────────────────────────────

interface FlywheelVizProps {
  responseAngleRad: Float64Array;
  responseRpm: Float64Array;
  durationSec: number;
  reducedMotion: boolean;
  isDark: boolean;
}

const FLY_VB = 220;
const FLY_CENTER = { x: FLY_VB / 2, y: FLY_VB / 2 - 6 };
const FLY_RADIUS = 78;
const SAMPLE_RATE_MS = 1;

function FlywheelViz({
  responseAngleRad,
  responseRpm,
  durationSec,
  reducedMotion,
  isDark,
}: FlywheelVizProps) {
  const rotorRef = useRef<SVGGElement>(null);
  const rpmLabelRef = useRef<SVGTextElement>(null);

  const placeRotor = useCallback((angleRad: number, rpm: number) => {
    if (rotorRef.current) {
      const deg = (angleRad * 180) / Math.PI;
      rotorRef.current.setAttribute(
        "transform",
        `rotate(${deg} ${FLY_CENTER.x} ${FLY_CENTER.y})`
      );
    }
    if (rpmLabelRef.current) {
      const rounded = Math.round(rpm);
      rpmLabelRef.current.textContent = `${rounded === 0 ? 0 : rounded} rpm`;
    }
  }, []);

  useEffect(() => {
    placeRotor(responseAngleRad[0] ?? 0, responseRpm[0] ?? 0);
  }, [responseAngleRad, responseRpm, placeRotor]);

  useEffect(() => {
    if (responseAngleRad.length === 0) return;
    if (reducedMotion) {
      const lastIdx = responseAngleRad.length - 1;
      placeRotor(responseAngleRad[lastIdx] ?? 0, responseRpm[lastIdx] ?? 0);
      return;
    }
    let frameId = 0;
    const startTime = performance.now();
    const loopMs = durationSec * 1000 + 600;
    const tick = () => {
      const elapsed = performance.now() - startTime;
      const loopT = elapsed % loopMs;
      let idx: number;
      if (loopT < durationSec * 1000) {
        idx = Math.min(
          responseAngleRad.length - 1,
          Math.floor(loopT / SAMPLE_RATE_MS)
        );
      } else {
        idx = responseAngleRad.length - 1;
      }
      placeRotor(responseAngleRad[idx] ?? 0, responseRpm[idx] ?? 0);
      frameId = requestAnimationFrame(tick);
    };
    frameId = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frameId);
  }, [responseAngleRad, responseRpm, durationSec, reducedMotion, placeRotor]);

  const housing = isDark ? "#475569" : "#cbd5e1";
  const housingTrim = isDark ? "#64748b" : "#94a3b8";
  const wheel1 = isDark ? "#9fbcd9" : "#264060";
  const wheel2 = isDark ? "#c1d4e7" : "#4a73a0";
  const hub = isDark ? "#0d233f" : "#0d233f";

  // Spoke positions (evenly distributed around the wheel)
  const spokes = [0, 60, 120, 180, 240, 300];

  return (
    <svg
      viewBox={`0 0 ${FLY_VB} ${FLY_VB}`}
      className="block h-full w-full"
      role="img"
      aria-label="Simulated flywheel spinning at the current angular velocity."
    >
      <defs>
        <radialGradient id="flyWheelGrad" cx="35%" cy="35%" r="70%">
          <stop offset="0%" stopColor={wheel2} />
          <stop offset="100%" stopColor={wheel1} />
        </radialGradient>
        <linearGradient id="flyHousingGrad" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor={housingTrim} />
          <stop offset="100%" stopColor={housing} />
        </linearGradient>
      </defs>

      {/* Outer housing ring (stationary frame) */}
      <circle
        cx={FLY_CENTER.x}
        cy={FLY_CENTER.y}
        r={FLY_RADIUS + 9}
        fill="none"
        stroke="url(#flyHousingGrad)"
        strokeWidth={6}
      />
      {/* Housing tick marks every 30° */}
      {Array.from({ length: 12 }, (_, k) => k * 30).map((deg) => {
        const r = (deg * Math.PI) / 180;
        const inner = FLY_RADIUS + 11;
        const outer = FLY_RADIUS + 16;
        const x1 = FLY_CENTER.x + inner * Math.cos(r);
        const y1 = FLY_CENTER.y + inner * Math.sin(r);
        const x2 = FLY_CENTER.x + outer * Math.cos(r);
        const y2 = FLY_CENTER.y + outer * Math.sin(r);
        return (
          <line
            key={deg}
            x1={x1}
            y1={y1}
            x2={x2}
            y2={y2}
            stroke={housingTrim}
            strokeWidth={1.25}
          />
        );
      })}

      {/* Rotor group — rotated imperatively each frame */}
      <g ref={rotorRef}>
        <circle
          cx={FLY_CENTER.x}
          cy={FLY_CENTER.y}
          r={FLY_RADIUS}
          fill="url(#flyWheelGrad)"
          stroke={hub}
          strokeWidth={1.5}
        />
        {/* Spokes */}
        {spokes.map((deg) => {
          const r = (deg * Math.PI) / 180;
          const x2 = FLY_CENTER.x + (FLY_RADIUS - 8) * Math.cos(r);
          const y2 = FLY_CENTER.y + (FLY_RADIUS - 8) * Math.sin(r);
          return (
            <line
              key={deg}
              x1={FLY_CENTER.x}
              y1={FLY_CENTER.y}
              x2={x2}
              y2={y2}
              stroke={isDark ? "#1e293b" : "#e2e8f0"}
              strokeWidth={2}
              strokeLinecap="round"
            />
          );
        })}
        {/* Reference dot so spinning is visible */}
        <circle
          cx={FLY_CENTER.x + (FLY_RADIUS - 14)}
          cy={FLY_CENTER.y}
          r={5}
          fill={isDark ? "#fbbf24" : "#f59e0b"}
        />
        {/* Hub */}
        <circle cx={FLY_CENTER.x} cy={FLY_CENTER.y} r={9} fill={hub} />
        <circle
          cx={FLY_CENTER.x}
          cy={FLY_CENTER.y}
          r={3.5}
          fill={isDark ? "#cbd5e1" : "#cbd5e1"}
        />
      </g>

      {/* RPM readout */}
      <text
        ref={rpmLabelRef}
        x={FLY_VB - 10}
        y={FLY_VB - 8}
        fontSize={13}
        fontWeight={600}
        textAnchor="end"
        fill={isDark ? "#e2e8f0" : "#0d233f"}
        fontFamily="ui-monospace, monospace"
      >
        0 rpm
      </text>
    </svg>
  );
}

// ── Main component ──────────────────────────────────────────────────────

export default function InteractiveFlywheelPlayground() {
  const reducedMotion = useReducedMotion();
  const { resolvedTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);
  const isDark = mounted && resolvedTheme === "dark";

  const gains = useFlywheelStore(
    useShallow((s) => ({
      kP: s.kP,
      kI: s.kI,
      kD: s.kD,
      kS: s.kS,
      kV: s.kV,
    }))
  );
  const targetRpm = useFlywheelStore((s) => s.targetRpm);
  const setTargetRpm = useFlywheelStore((s) => s.setTargetRpm);
  const setKP = useFlywheelStore((s) => s.setKP);
  const setKI = useFlywheelStore((s) => s.setKI);
  const setKD = useFlywheelStore((s) => s.setKD);
  const setKS = useFlywheelStore((s) => s.setKS);
  const setKV = useFlywheelStore((s) => s.setKV);
  const reset = useFlywheelStore((s) => s.reset);

  const setters: Record<GainKey, (v: number) => void> = useMemo(
    () => ({ kP: setKP, kI: setKI, kD: setKD, kS: setKS, kV: setKV }),
    [setKP, setKI, setKD, setKS, setKV]
  );

  const physics = useMemo(() => flywheelPhysicsFor(targetRpm), [targetRpm]);

  // Throttled mirror of gains + target → sim recompute.
  const inputs = useMemo(() => ({ ...gains, targetRpm }), [gains, targetRpm]);
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
    const { targetRpm: rpm, kP, kI, kD, kS, kV } = throttled;
    return simulateFlywheelResponse(flywheelPhysicsFor(rpm), {
      kP,
      kI,
      kD,
      kS,
      kV,
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
    // Fixed y-range covers 0 to slider max with a small overshoot allowance
    // so we can directly compare tunings.
    const yMax = FLY_TARGET_RANGE_RPM.max + 500;
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
        y: { range: [-200, yMax] },
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
          splits: () => [0, 1000, 2000, 3000, 4000, 5000],
          values: (_u, splits) =>
            splits.map((v) => (v === 0 ? "0" : `${v.toFixed(0)}`)),
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
          label: "RPM",
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
      [response.t, response.targetRpm, response.velocityRpm],
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
    plotRef.current.setData([
      response.t,
      response.targetRpm,
      response.velocityRpm,
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
  const settlingStr =
    response.metrics.settlingTime !== null
      ? `${response.metrics.settlingTime.toFixed(2)} s`
      : "—";

  const renderSlider = (cfg: SliderConfig) => {
    const range = FLY_SLIDER_RANGES[cfg.key];
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

  void FLY_HOLD_PHASE_SEC; // kept for future explicit references

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
                {response.metrics.overshootRpm.toFixed(0)}
              </span>{" "}
              rpm overshoot
            </span>
            <span>
              <span className="text-[var(--foreground)] font-medium">
                {response.metrics.steadyStateErrorRpm.toFixed(0)}
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
          htmlFor="fly-target"
          className="inline-flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-[0.06em] text-[var(--muted-foreground)]"
        >
          <Gauge className="h-3.5 w-3.5" aria-hidden />
          Target
        </label>
        <input
          id="fly-target"
          type="range"
          min={FLY_TARGET_RANGE_RPM.min}
          max={FLY_TARGET_RANGE_RPM.max}
          step={FLY_TARGET_RANGE_RPM.step}
          value={targetRpm}
          onChange={(e) => setTargetRpm(parseFloat(e.target.value))}
          aria-label="Target velocity in RPM. After the 1-second hold the controller steps the setpoint up to this value."
          aria-valuemin={FLY_TARGET_RANGE_RPM.min}
          aria-valuemax={FLY_TARGET_RANGE_RPM.max}
          aria-valuenow={targetRpm}
          className="pid-slider min-w-0 flex-1"
          style={
            {
              ["--slider-accent" as string]: "#475569",
              ["--slider-fill" as string]: `${((targetRpm - FLY_TARGET_RANGE_RPM.min) / (FLY_TARGET_RANGE_RPM.max - FLY_TARGET_RANGE_RPM.min)) * 100}%`,
            } as React.CSSProperties
          }
        />
        <span className="rounded-md bg-[var(--muted)] px-2 py-0.5 font-mono text-[12px] tabular-nums text-[var(--foreground)]">
          {targetRpm} rpm
        </span>
        <span className="font-mono text-[10px] text-[var(--muted-foreground)]">
          {(targetRpm / 60).toFixed(1)} rps
        </span>
      </div>

      {/* ── Visualization ───────────────────── */}
      <div className="grid gap-4 md:grid-cols-[180px_minmax(0,1fr)] md:gap-5">
        <div className="rounded-xl border border-[var(--border)] bg-[var(--background)] p-2 md:aspect-square md:p-3">
          <FlywheelViz
            responseAngleRad={response.angleRad}
            responseRpm={response.velocityRpm}
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
            aria-label={`Velocity-response plot for the flywheel target of ${targetRpm} RPM. Dashed is the commanded target, solid is the measured wheel speed.`}
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
              target rpm
            </span>
            <span className="inline-flex items-center gap-1">
              <span
                aria-hidden
                className="inline-block h-px w-3.5"
                style={{ background: accent.actual }}
              />
              wheel rpm
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
          Every loop the wheel sits idle for 1&nbsp;s, then the setpoint steps
          to your slider target. Tune <span className="font-mono">kV</span>{" "}
          first to predict the back-EMF voltage at speed:{" "}
          <span className="font-mono">V_max / free_rps</span> for this Kraken
          X44 works out to ≈{" "}
          <span className="font-mono">0.093&nbsp;V·s/rot</span> (CTRE dyno
          data). Add <span className="font-mono">kS</span> for the
          static-friction breakaway, then close the loop with{" "}
          <span className="font-mono">kP</span> and{" "}
          <span className="font-mono">kI</span> to nail the steady-state. Order:{" "}
          <span className="font-mono">kV → kS → kP → kI → kD</span>.
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
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            {FEEDFORWARD_SLIDERS.map(renderSlider)}
          </div>
        </div>
      </div>

      {/* ── Footer ──────────────────────────── */}
      <p className="mt-4 text-[11px] leading-relaxed text-[var(--muted-foreground)]">
        0.01&nbsp;kg·m² flywheel on a Kraken&nbsp;X44 motor (4.11&nbsp;N·m
        stall, 7758&nbsp;RPM free per CTRE dyno data; back-EMF modelled,
        ±12&nbsp;V saturation). Gains use Phoenix 6 / WPILib velocity-control
        units. Drop them straight into a{" "}
        <span className="font-mono text-[var(--foreground)]">Slot0Configs</span>{" "}
        on a{" "}
        <span className="font-mono text-[var(--foreground)]">
          VelocityVoltage
        </span>{" "}
        request.
      </p>
    </section>
  );
}
