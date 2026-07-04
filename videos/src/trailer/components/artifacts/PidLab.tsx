import { useMemo } from "react";
import { useCurrentFrame } from "remotion";
import { brand } from "../../../lib/brand";
import { simulateArm, SIM, type SimEvent } from "../../lib/pidSim";
import type { ResolvedTimeline } from "../../lib/timeline";
import type { PidLabArtifact } from "../../lib/types";

// Internal layout — the camera close-up rects in the trailer script assume it.
const ARM_PANEL = { left: 40, top: 60, width: 980, height: 1050 };
const CHIPS = { left: 1040, top: 60, width: 1120, height: 130 };
const SCOPE = { left: 1040, top: 220, width: 1120, height: 890 };

const PIVOT = { x: 430, y: 600 };
const ARM_LENGTH = 350;
const WINDOW_FRAMES = 180; // 6 s of scope history
const Y_MAX = 85;
const Y_MIN = -55;

const toRad = (deg: number) => (deg * Math.PI) / 180;

export function PidLab({
  def,
  resolved,
}: {
  def: PidLabArtifact;
  resolved: ResolvedTimeline;
}) {
  const frame = useCurrentFrame();

  const simEvents = useMemo<SimEvent[]>(
    () =>
      resolved.events.flatMap((e): SimEvent[] => {
        if (e.event.type === "gains") {
          return [
            { frame: e.frame, kP: e.event.kP, kD: e.event.kD, kG: e.event.kG },
          ];
        }
        if (e.event.type === "target") {
          return [{ frame: e.frame, targetDeg: e.event.deg }];
        }
        if (e.event.type === "profile") {
          return [
            {
              frame: e.frame,
              profile: {
                cruiseDegPerSec: e.event.cruiseDegPerSec,
                accelDegPerSec2: e.event.accelDegPerSec2,
              },
            },
          ];
        }
        return [];
      }),
    [resolved.events]
  );

  const sim = useMemo(
    () =>
      simulateArm({
        fps: resolved.fps,
        totalFrames: Math.max(1, resolved.totalDurationInFrames),
        startDeg: def.startDeg,
        hardStopDeg: def.hardStopDeg,
        events: simEvents,
      }),
    [
      resolved.fps,
      resolved.totalDurationInFrames,
      def.startDeg,
      def.hardStopDeg,
      simEvents,
    ]
  );

  const f = Math.min(frame, sim.angles.length - 1);
  const angle = sim.angles[f];
  const target = sim.targets[f];
  const volts = sim.volts[f];
  const hasTarget = !Number.isNaN(target);

  // Live gain values + the frame each control last changed (for chip pops).
  const hud = useMemo(() => {
    let kP = 0;
    let kD = 0;
    let kG = 0;
    let targetDeg: number | null = null;
    let gainsChanged = -1;
    let targetChanged = -1;
    for (const e of simEvents) {
      if (e.frame > f) break;
      if (e.kP !== undefined) {
        kP = e.kP;
        kD = e.kD ?? kD;
        if (e.kG !== undefined) kG = e.kG;
        gainsChanged = e.frame;
      }
      if (e.targetDeg !== undefined) {
        targetDeg = e.targetDeg;
        targetChanged = e.frame;
      }
    }
    return { kP, kD, kG, targetDeg, gainsChanged, targetChanged };
  }, [simEvents, f]);

  const error = hasTarget ? target - angle : null;
  const settled = error !== null && Math.abs(error) < 1.5;

  return (
    <div
      style={{
        width: "100%",
        height: "100%",
        position: "relative",
        fontFamily: brand.fonts.sans,
      }}
    >
      <ArmPanel
        frame={frame}
        angle={angle}
        target={hasTarget ? target : null}
        volts={volts}
        error={error}
        settled={settled}
        hardStopDeg={def.hardStopDeg}
      />
      <div
        style={{
          position: "absolute",
          ...CHIPS,
          display: "flex",
          gap: 24,
        }}
      >
        {(def.chips ?? ["kP", "kD", "target"]).map((chip) => {
          const config = {
            kP: {
              value: hud.kP > 0 ? hud.kP.toFixed(2) : "—",
              color: brand.accents.blue.primary,
              changedFrame: hud.gainsChanged,
            },
            kD: {
              value: hud.kD > 0 ? hud.kD.toFixed(2) : "—",
              color: brand.accents.purple.primary,
              changedFrame: hud.gainsChanged,
            },
            kG: {
              value: hud.kG > 0 ? hud.kG.toFixed(2) : "—",
              color: brand.accents.mint.primary,
              changedFrame: hud.gainsChanged,
            },
            target: {
              value: hud.targetDeg === null ? "—" : `${hud.targetDeg}°`,
              color: brand.accents.amber.primary,
              changedFrame: hud.targetChanged,
            },
          }[chip];
          return (
            <HudChip
              key={chip}
              label={chip}
              value={config.value}
              color={config.color}
              changedFrame={config.changedFrame}
              frame={frame}
            />
          );
        })}
      </div>
      <Scope frame={f} sim={sim} />
    </div>
  );
}

// ---------------------------------------------------------------------------

function ArmPanel({
  frame,
  angle,
  target,
  volts,
  error,
  settled,
  hardStopDeg,
}: {
  frame: number;
  angle: number;
  target: number | null;
  volts: number;
  error: number | null;
  settled: boolean;
  hardStopDeg: number;
}) {
  const accent = brand.accents.blue.primary;
  const amber = brand.accents.amber.primary;
  const mint = brand.accents.mint.primary;
  const tipX = PIVOT.x + Math.cos(toRad(angle)) * ARM_LENGTH;
  const tipY = PIVOT.y - Math.sin(toRad(angle)) * ARM_LENGTH;

  return (
    <div
      style={{
        position: "absolute",
        ...ARM_PANEL,
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
          Arm — live sim
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
              ? "on target"
              : `error ${error.toFixed(1)}°`}
        </span>
      </div>

      <svg
        viewBox="0 0 980 900"
        style={{ position: "absolute", top: 80, left: 0 }}
      >
        {/* Mount */}
        <rect
          x={PIVOT.x - 34}
          y={PIVOT.y}
          width={68}
          height={230}
          rx={10}
          fill="#16293f"
        />
        <rect
          x={PIVOT.x - 150}
          y={PIVOT.y + 220}
          width={300}
          height={24}
          rx={8}
          fill="#1c334f"
        />

        {/* Hard stop pin */}
        <circle
          cx={PIVOT.x + Math.cos(toRad(hardStopDeg)) * 150}
          cy={PIVOT.y - Math.sin(toRad(hardStopDeg)) * 150}
          r={13}
          fill={brand.colors.textMuted}
          opacity={0.55}
        />

        {/* Target ghost */}
        {target !== null && (
          <g>
            <line
              x1={PIVOT.x}
              y1={PIVOT.y}
              x2={PIVOT.x + Math.cos(toRad(target)) * (ARM_LENGTH + 60)}
              y2={PIVOT.y - Math.sin(toRad(target)) * (ARM_LENGTH + 60)}
              stroke={amber}
              strokeWidth={5}
              strokeDasharray="16 14"
              opacity={0.85}
            />
            <text
              x={PIVOT.x + Math.cos(toRad(target)) * (ARM_LENGTH + 100)}
              y={PIVOT.y - Math.sin(toRad(target)) * (ARM_LENGTH + 100)}
              fill={amber}
              fontSize={30}
              fontFamily={brand.fonts.mono}
              textAnchor="middle"
            >
              {target}°
            </text>
          </g>
        )}

        {/* Arm */}
        <g transform={`rotate(${-angle} ${PIVOT.x} ${PIVOT.y})`}>
          <rect
            x={PIVOT.x - 44}
            y={PIVOT.y - 23}
            width={ARM_LENGTH + 74}
            height={46}
            rx={20}
            fill="#3a5a80"
            stroke={accent}
            strokeWidth={2.5}
          />
          <circle
            cx={PIVOT.x + ARM_LENGTH + 12}
            cy={PIVOT.y}
            r={34}
            fill={mint}
            opacity={0.92}
          />
        </g>
        <circle
          cx={PIVOT.x}
          cy={PIVOT.y}
          r={56}
          fill="#1c334f"
          stroke={accent}
          strokeWidth={2.5}
        />
        <circle cx={PIVOT.x} cy={PIVOT.y} r={14} fill={accent} />

        {/* Tip trail glow when moving fast */}
        <circle cx={tipX} cy={tipY} r={10} fill={mint} opacity={0.0} />
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
              left:
                volts >= 0
                  ? "50%"
                  : `${50 - (Math.abs(volts) / SIM.maxVolts) * 50}%`,
              width: `${(Math.abs(volts) / SIM.maxVolts) * 50}%`,
              background: amber,
              borderRadius: 999,
              boxShadow: `0 0 14px ${amber}`,
            }}
          />
          <div
            style={{
              position: "absolute",
              left: "50%",
              top: -4,
              bottom: -4,
              width: 2,
              background: brand.colors.textMuted,
              opacity: 0.6,
            }}
          />
        </div>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------

function HudChip({
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
  const sinceChange =
    changedFrame >= 0 ? frame - changedFrame : Number.POSITIVE_INFINITY;
  const pop = 1 + 0.3 * Math.exp(-sinceChange / 7);
  const flash = Math.exp(-sinceChange / 10);

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
          fontSize: 42,
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

function Scope({
  frame,
  sim,
}: {
  frame: number;
  sim: { angles: Float32Array; targets: Float32Array };
}) {
  const mint = brand.accents.mint.primary;
  const amber = brand.accents.amber.primary;
  const plot = { left: 100, top: 84, width: 960, height: 700 };

  const yToPx = (deg: number) =>
    plot.top + ((Y_MAX - deg) / (Y_MAX - Y_MIN)) * plot.height;
  const iToPx = (i: number) =>
    plot.left + (i / (WINDOW_FRAMES - 1)) * plot.width;

  let tracePath = "";
  let targetPath = "";
  let lastPoint: { x: number; y: number } | null = null;
  for (let i = 0; i < WINDOW_FRAMES; i++) {
    const f = frame - (WINDOW_FRAMES - 1) + i;
    if (f < 0) continue;
    const x = iToPx(i);
    const y = yToPx(sim.angles[f]);
    tracePath += `${tracePath ? "L" : "M"}${x.toFixed(1)},${y.toFixed(1)}`;
    lastPoint = { x, y };
    const t = sim.targets[f];
    if (!Number.isNaN(t)) {
      const ty = yToPx(t);
      // New segment after a gap or a step change keeps the line crisp.
      // (Threshold is generous so a gliding Motion Magic profile — which moves
      // a few degrees per frame — stays one continuous curve.)
      const prevT = f > 0 ? sim.targets[f - 1] : NaN;
      const isBreak = Number.isNaN(prevT) || Math.abs(prevT - t) > 8;
      targetPath += `${isBreak || !targetPath ? "M" : "L"}${x.toFixed(1)},${ty.toFixed(1)}`;
    }
  }

  const recOn = Math.sin(frame / 9) > -0.3;
  const currentDeg = sim.angles[frame];

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
          Arm angle · last 6s
        </span>
        <span style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <span
            style={{
              width: 14,
              height: 14,
              borderRadius: 999,
              background: "#f87171",
              opacity: recOn ? 0.95 : 0.25,
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
        {[-45, 0, 30, 60].map((deg) => (
          <g key={deg}>
            <line
              x1={plot.left}
              x2={plot.left + plot.width}
              y1={yToPx(deg)}
              y2={yToPx(deg)}
              stroke={brand.colors.accent}
              strokeWidth={1}
              opacity={deg === 0 ? 0.28 : 0.13}
            />
            <text
              x={plot.left - 14}
              y={yToPx(deg) + 9}
              fill={brand.colors.textMuted}
              fontSize={24}
              fontFamily={brand.fonts.mono}
              textAnchor="end"
              opacity={0.8}
            >
              {deg}°
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
              {currentDeg.toFixed(1)}°
            </text>
          </>
        )}
      </svg>
    </div>
  );
}
