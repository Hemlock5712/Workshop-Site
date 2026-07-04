import { useMemo } from "react";
import { useCurrentFrame } from "remotion";
import { brand } from "../../../lib/brand";
import {
  simulateFlywheel,
  FLYWHEEL_SIM,
  type FlywheelSimEvent,
} from "../../lib/flywheelSim";
import type { ResolvedTimeline } from "../../lib/timeline";
import type { FlywheelLabArtifact } from "../../lib/types";

// Velocity-control twin of PidLab: spinning shooter wheel on the left,
// RPM scope + gain chips on the right. Feed events shoot a game piece
// through the wheel and the speed dip shows up on the scope.

const WHEEL_PANEL = { left: 40, top: 60, width: 980, height: 1050 };
const CHIPS = { left: 1040, top: 60, width: 1120, height: 130 };
const SCOPE = { left: 1040, top: 220, width: 1120, height: 890 };

const HUB = { x: 490, y: 560 };
const WHEEL_RADIUS = 260;
const WINDOW_FRAMES = 180; // 6 s of scope history
const RPM_MAX = 4800;

export function FlywheelLab({
  def,
  resolved,
}: {
  def: FlywheelLabArtifact;
  resolved: ResolvedTimeline;
}) {
  const frame = useCurrentFrame();

  const simEvents = useMemo<FlywheelSimEvent[]>(
    () =>
      resolved.events.flatMap((e): FlywheelSimEvent[] => {
        if (e.event.type === "gains") {
          return [
            {
              frame: e.frame,
              kP: e.event.kP,
              kS: e.event.kS,
              kV: e.event.kV,
            },
          ];
        }
        if (e.event.type === "rpm") {
          return [{ frame: e.frame, targetRps: e.event.value / 60 }];
        }
        if (e.event.type === "feed") {
          return [{ frame: e.frame, feed: true }];
        }
        return [];
      }),
    [resolved.events]
  );

  const sim = useMemo(
    () =>
      simulateFlywheel({
        fps: resolved.fps,
        totalFrames: Math.max(1, resolved.totalDurationInFrames),
        events: simEvents,
      }),
    [resolved.fps, resolved.totalDurationInFrames, simEvents]
  );

  const f = Math.min(frame, sim.speeds.length - 1);
  const rpm = sim.speeds[f] * 60;
  const targetRpm = sim.targets[f] * 60;
  const hasTarget = !Number.isNaN(targetRpm);
  const volts = sim.volts[f];

  // Wheel rotation: integrate display angle at a slowed-down rate so high RPM
  // doesn't strobe at 30 fps. Deterministic: sum over frames via closed form
  // is impossible with varying speed, so accumulate in a memoized pass.
  const displayAngles = useMemo(() => {
    const angles = new Float32Array(sim.speeds.length);
    let a = 0;
    for (let i = 0; i < sim.speeds.length; i++) {
      a += (sim.speeds[i] / resolved.fps) * 14; // degrees per frame, slowed
      angles[i] = a % 360;
    }
    return angles;
  }, [sim.speeds, resolved.fps]);

  const hud = useMemo(() => {
    let kP = 0;
    let kS = 0;
    let kV = 0;
    let target: number | null = null;
    let gainsChanged = -1;
    let targetChanged = -1;
    for (const e of simEvents) {
      if (e.frame > f) break;
      if (e.kP !== undefined) {
        kP = e.kP;
        kS = e.kS ?? kS;
        kV = e.kV ?? kV;
        gainsChanged = e.frame;
      }
      if (e.targetRps !== undefined) {
        target = e.targetRps * 60;
        targetChanged = e.frame;
      }
    }
    return { kP, kS, kV, target, gainsChanged, targetChanged };
  }, [simEvents, f]);

  const error = hasTarget ? targetRpm - rpm : null;
  const settled = error !== null && Math.abs(error) < 80;

  return (
    <div
      style={{
        width: "100%",
        height: "100%",
        position: "relative",
        fontFamily: brand.fonts.sans,
      }}
    >
      <WheelPanel
        frame={frame}
        rpm={rpm}
        angle={displayAngles[f]}
        volts={volts}
        error={error}
        settled={settled}
        feedFrames={sim.feedFrames}
      />
      <div style={{ position: "absolute", ...CHIPS, display: "flex", gap: 24 }}>
        {(def.chips ?? ["kP", "kS", "kV", "target"]).map((chip) => {
          const config = {
            kP: {
              value: hud.kP > 0 ? hud.kP.toFixed(2) : "—",
              color: brand.accents.blue.primary,
              changedFrame: hud.gainsChanged,
            },
            kS: {
              value: hud.kS > 0 ? hud.kS.toFixed(2) : "—",
              color: brand.accents.teal.primary,
              changedFrame: hud.gainsChanged,
            },
            kV: {
              value: hud.kV > 0 ? hud.kV.toFixed(2) : "—",
              color: brand.accents.mint.primary,
              changedFrame: hud.gainsChanged,
            },
            target: {
              value: hud.target === null ? "—" : `${Math.round(hud.target)}`,
              color: brand.accents.amber.primary,
              changedFrame: hud.targetChanged,
            },
          }[chip];
          return (
            <Chip
              key={chip}
              label={chip === "target" ? "target rpm" : chip}
              value={config.value}
              color={config.color}
              changedFrame={config.changedFrame}
              frame={frame}
            />
          );
        })}
      </div>
      <RpmScope frame={f} sim={sim} />
    </div>
  );
}

// ---------------------------------------------------------------------------

function WheelPanel({
  frame,
  rpm,
  angle,
  volts,
  error,
  settled,
  feedFrames,
}: {
  frame: number;
  rpm: number;
  angle: number;
  volts: number;
  error: number | null;
  settled: boolean;
  feedFrames: number[];
}) {
  const accent = brand.accents.blue.primary;
  const mint = brand.accents.mint.primary;
  const amber = brand.accents.amber.primary;
  const speedGlow = Math.min(1, rpm / 3500);

  // Ball animation: slides in from the left channel, launches out the top.
  const activeFeed = feedFrames.find(
    (ff) => frame >= ff - 14 && frame <= ff + 10
  );
  let ball: { x: number; y: number } | null = null;
  if (activeFeed !== undefined) {
    const t = frame - activeFeed;
    if (t < 0) {
      const p = (t + 14) / 14; // approach along the feed channel
      ball = { x: 90 + p * (HUB.x - 90 - WHEEL_RADIUS - 40), y: HUB.y + 190 };
    } else {
      const p = t / 10; // launched
      ball = {
        x: HUB.x + WHEEL_RADIUS * 0.5 + p * 320,
        y: HUB.y - WHEEL_RADIUS * 0.6 - p * 620,
      };
    }
  }

  return (
    <div
      style={{
        position: "absolute",
        ...WHEEL_PANEL,
        background: "rgba(38, 64, 96, 0.32)",
        border: `1px solid ${brand.code.border}`,
        borderRadius: 22,
      }}
    >
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          padding: "26px 34px 0",
        }}
      >
        <span
          style={{
            fontSize: 26,
            letterSpacing: 4,
            textTransform: "uppercase",
            color: brand.colors.textMuted,
          }}
        >
          Flywheel — live sim
        </span>
        <span
          style={{
            fontFamily: brand.fonts.mono,
            fontSize: 30,
            color:
              error === null ? brand.colors.textMuted : settled ? mint : amber,
          }}
        >
          {error === null
            ? "idle"
            : settled
              ? "at speed"
              : `${error > 0 ? "-" : "+"}${Math.abs(Math.round(error))} rpm`}
        </span>
      </div>

      <svg
        viewBox="0 0 980 900"
        style={{ position: "absolute", top: 80, left: 0 }}
      >
        {/* Feed channel */}
        <rect
          x={40}
          y={HUB.y + 160}
          width={HUB.x - WHEEL_RADIUS - 60}
          height={60}
          rx={14}
          fill="#16293f"
        />
        {/* Launch guide */}
        <path
          d={`M ${HUB.x + WHEEL_RADIUS * 0.35} ${HUB.y - WHEEL_RADIUS * 0.85} L ${
            HUB.x + WHEEL_RADIUS * 0.95
          } ${HUB.y - WHEEL_RADIUS * 1.55}`}
          stroke="#16293f"
          strokeWidth={26}
          strokeLinecap="round"
        />

        {/* Speed glow */}
        <circle
          cx={HUB.x}
          cy={HUB.y}
          r={WHEEL_RADIUS + 18}
          fill="none"
          stroke={mint}
          strokeWidth={10}
          opacity={0.12 + speedGlow * 0.4}
        />

        {/* Wheel */}
        <g transform={`rotate(${angle} ${HUB.x} ${HUB.y})`}>
          <circle
            cx={HUB.x}
            cy={HUB.y}
            r={WHEEL_RADIUS}
            fill="#1c334f"
            stroke={accent}
            strokeWidth={3}
          />
          {[0, 60, 120, 180, 240, 300].map((spoke) => (
            <line
              key={spoke}
              x1={HUB.x}
              y1={HUB.y}
              x2={
                HUB.x + WHEEL_RADIUS * 0.92 * Math.cos((spoke * Math.PI) / 180)
              }
              y2={
                HUB.y + WHEEL_RADIUS * 0.92 * Math.sin((spoke * Math.PI) / 180)
              }
              stroke="#2c4a70"
              strokeWidth={22}
            />
          ))}
          <circle
            cx={HUB.x + WHEEL_RADIUS * 0.92}
            cy={HUB.y}
            r={16}
            fill={mint}
          />
          <circle
            cx={HUB.x}
            cy={HUB.y}
            r={54}
            fill="#16293f"
            stroke={accent}
            strokeWidth={2.5}
          />
          <circle cx={HUB.x} cy={HUB.y} r={13} fill={accent} />
        </g>

        {/* Game piece */}
        {ball && (
          <circle cx={ball.x} cy={ball.y} r={30} fill={amber} opacity={0.95} />
        )}

        {/* RPM readout */}
        <text
          x={HUB.x}
          y={HUB.y + WHEEL_RADIUS + 90}
          fill={brand.colors.text}
          fontSize={54}
          fontFamily={brand.fonts.mono}
          fontWeight={700}
          textAnchor="middle"
        >
          {Math.round(rpm)} rpm
        </text>
      </svg>

      {/* Output voltage bar */}
      <div style={{ position: "absolute", bottom: 44, left: 90, right: 90 }}>
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            marginBottom: 10,
            fontSize: 24,
            color: brand.colors.textMuted,
          }}
        >
          <span style={{ letterSpacing: 3, textTransform: "uppercase" }}>
            output
          </span>
          <span style={{ fontFamily: brand.fonts.mono }}>
            {volts.toFixed(1)} V
          </span>
        </div>
        <div
          style={{
            position: "relative",
            height: 16,
            borderRadius: 999,
            background: "rgba(10, 26, 46, 0.9)",
            border: `1px solid ${brand.code.border}`,
          }}
        >
          <div
            style={{
              position: "absolute",
              top: 0,
              bottom: 0,
              left: 0,
              width: `${(volts / FLYWHEEL_SIM.maxVolts) * 100}%`,
              background: amber,
              borderRadius: 999,
              boxShadow: `0 0 14px ${amber}`,
            }}
          />
        </div>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------

function Chip({
  label,
  value,
  color,
  changedFrame,
  frame,
}: {
  label: string;
  value: string;
  color: string;
  changedFrame: number;
  frame: number;
}) {
  const since =
    changedFrame >= 0 ? frame - changedFrame : Number.POSITIVE_INFINITY;
  const pop = 1 + 0.3 * Math.exp(-since / 7);
  const flash = Math.exp(-since / 10);
  return (
    <div
      style={{
        flex: 1,
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        gap: 6,
        background: "rgba(38, 64, 96, 0.32)",
        border: `2px solid ${flash > 0.05 ? color : brand.code.border}`,
        borderRadius: 18,
        transform: `scale(${pop})`,
        boxShadow: flash > 0.05 ? `0 0 ${30 * flash}px ${color}` : "none",
      }}
    >
      <span
        style={{
          fontSize: 22,
          letterSpacing: 3,
          textTransform: "uppercase",
          color: brand.colors.textMuted,
        }}
      >
        {label}
      </span>
      <span
        style={{
          fontFamily: brand.fonts.mono,
          fontSize: 40,
          color,
          fontWeight: 700,
        }}
      >
        {value}
      </span>
    </div>
  );
}

// ---------------------------------------------------------------------------

function RpmScope({
  frame,
  sim,
}: {
  frame: number;
  sim: { speeds: Float32Array; targets: Float32Array };
}) {
  const mint = brand.accents.mint.primary;
  const amber = brand.accents.amber.primary;
  const plot = { left: 110, top: 84, width: 950, height: 700 };

  const yToPx = (rpm: number) =>
    plot.top + ((RPM_MAX - rpm) / RPM_MAX) * plot.height;
  const iToPx = (i: number) =>
    plot.left + (i / (WINDOW_FRAMES - 1)) * plot.width;

  let tracePath = "";
  let targetPath = "";
  let lastPoint: { x: number; y: number } | null = null;
  for (let i = 0; i < WINDOW_FRAMES; i++) {
    const f = frame - (WINDOW_FRAMES - 1) + i;
    if (f < 0) continue;
    const x = iToPx(i);
    const y = yToPx(sim.speeds[f] * 60);
    tracePath += `${tracePath ? "L" : "M"}${x.toFixed(1)},${y.toFixed(1)}`;
    lastPoint = { x, y };
    const t = sim.targets[f] * 60;
    if (!Number.isNaN(t)) {
      const ty = yToPx(t);
      const prevT = f > 0 ? sim.targets[f - 1] * 60 : NaN;
      const isBreak = Number.isNaN(prevT) || Math.abs(prevT - t) > 400;
      targetPath += `${isBreak || !targetPath ? "M" : "L"}${x.toFixed(1)},${ty.toFixed(1)}`;
    }
  }

  return (
    <div
      style={{
        position: "absolute",
        ...SCOPE,
        background: brand.code.background,
        border: `1px solid ${brand.code.border}`,
        borderRadius: 22,
      }}
    >
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          padding: "24px 34px 0",
        }}
      >
        <span
          style={{
            fontSize: 26,
            letterSpacing: 4,
            textTransform: "uppercase",
            color: brand.colors.textMuted,
          }}
        >
          Wheel speed · last 6s
        </span>
        <span style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <span
            style={{
              width: 14,
              height: 14,
              borderRadius: 999,
              background: "#f87171",
              opacity: Math.sin(frame / 9) > -0.3 ? 0.95 : 0.25,
            }}
          />
          <span
            style={{
              fontSize: 24,
              color: brand.colors.textMuted,
              letterSpacing: 2,
            }}
          >
            LIVE
          </span>
        </span>
      </div>

      <svg viewBox="0 0 1120 890" style={{ position: "absolute", inset: 0 }}>
        {[1000, 2000, 3000, 4000].map((rpm) => (
          <g key={rpm}>
            <line
              x1={plot.left}
              x2={plot.left + plot.width}
              y1={yToPx(rpm)}
              y2={yToPx(rpm)}
              stroke={brand.colors.accent}
              strokeWidth={1}
              opacity={0.13}
            />
            <text
              x={plot.left - 14}
              y={yToPx(rpm) + 9}
              fill={brand.colors.textMuted}
              fontSize={24}
              fontFamily={brand.fonts.mono}
              textAnchor="end"
              opacity={0.8}
            >
              {rpm / 1000}k
            </text>
          </g>
        ))}

        {targetPath && (
          <path
            d={targetPath}
            fill="none"
            stroke={amber}
            strokeWidth={4}
            strokeDasharray="14 12"
            opacity={0.9}
          />
        )}
        {tracePath && (
          <>
            <path
              d={tracePath}
              fill="none"
              stroke={mint}
              strokeWidth={13}
              opacity={0.18}
            />
            <path d={tracePath} fill="none" stroke={mint} strokeWidth={5} />
          </>
        )}
        {lastPoint && (
          <>
            <circle cx={lastPoint.x} cy={lastPoint.y} r={10} fill={mint} />
            <text
              x={lastPoint.x - 18}
              y={lastPoint.y - 22}
              fill={mint}
              fontSize={30}
              fontFamily={brand.fonts.mono}
              textAnchor="end"
            >
              {Math.round(sim.speeds[frame] * 60)}
            </text>
          </>
        )}
      </svg>
    </div>
  );
}
