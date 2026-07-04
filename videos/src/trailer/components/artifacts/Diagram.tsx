import { useMemo } from "react";
import { interpolate, spring, useCurrentFrame, useVideoConfig } from "remotion";
import { brand } from "../../../lib/brand";
import type { ResolvedEvent } from "../../lib/timeline";
import type { DiagramArtifact, DiagramNode } from "../../lib/types";

// Animated node/edge diagram. Nodes appear when the diagram's current step
// reaches their `step` (driven by word-anchored `diagram` events); visible
// edges carry a traveling pulse so the data flow reads as motion, not as a
// static figure. Nodes belonging to the current step glow.

export function Diagram({
  def,
  events,
}: {
  def: DiagramArtifact;
  events: ResolvedEvent[];
}) {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const steps = useMemo(
    () =>
      events
        .filter(
          (e) => e.event.type === "diagram" && e.event.artifact === def.id
        )
        .map((e) => ({
          frame: e.frame,
          step: e.event.type === "diagram" ? e.event.step : 0,
        })),
    [events, def.id]
  );

  let step = 0;
  let stepFrame = 0;
  for (const s of steps) {
    if (frame >= s.frame) {
      step = s.step;
      stepFrame = s.frame;
    }
  }

  const nodeById = new Map(def.nodes.map((n) => [n.id, n]));
  const nodeVisible = (n: DiagramNode) => (n.step ?? 0) <= step;
  const nodeEnterFrame = (n: DiagramNode) => {
    if ((n.step ?? 0) === 0) return 0;
    // Find when its step was reached.
    const hit = steps.find((s) => s.step >= (n.step ?? 0));
    return hit ? hit.frame : stepFrame;
  };

  return (
    <div style={{ width: "100%", height: "100%", position: "relative" }}>
      {def.title && (
        <div
          style={{
            position: "absolute",
            top: 0,
            left: 40,
            fontSize: 28,
            letterSpacing: 4,
            textTransform: "uppercase",
            color: brand.colors.textMuted,
          }}
        >
          {def.title}
        </div>
      )}
      <svg
        viewBox={`0 0 ${def.rect.width} ${def.rect.height}`}
        style={{ position: "absolute", inset: 0 }}
      >
        {def.edges.map((edge, i) => {
          const from = nodeById.get(edge.from);
          const to = nodeById.get(edge.to);
          if (!from || !to) return null;
          const visible =
            nodeVisible(from) && nodeVisible(to) && (edge.step ?? 0) <= step;
          if (!visible) return null;

          const start = edgeAnchor(from, to);
          const end = edgeAnchor(to, from);
          const enter = Math.max(nodeEnterFrame(from), nodeEnterFrame(to));
          const grow = interpolate(frame - enter, [4, 22], [0, 1], {
            extrapolateLeft: "clamp",
            extrapolateRight: "clamp",
          });
          const tipX = start.x + (end.x - start.x) * grow;
          const tipY = start.y + (end.y - start.y) * grow;

          // A pulse travels from → to on a loop, staggered per edge.
          const pulseT = ((frame - enter) / (fps * 1.6) + i * 0.35) % 1;
          const px = start.x + (end.x - start.x) * pulseT;
          const py = start.y + (end.y - start.y) * pulseT;

          return (
            <g key={i}>
              <line
                x1={start.x}
                y1={start.y}
                x2={tipX}
                y2={tipY}
                stroke={brand.colors.accent}
                strokeWidth={4}
                opacity={0.5}
              />
              {grow >= 1 && (
                <>
                  <ArrowHead from={start} to={end} />
                  <circle
                    cx={px}
                    cy={py}
                    r={9}
                    fill={brand.accents.mint.primary}
                    opacity={0.9}
                  />
                  <circle
                    cx={px}
                    cy={py}
                    r={16}
                    fill={brand.accents.mint.primary}
                    opacity={0.25}
                  />
                </>
              )}
              {edge.label && grow >= 1 && (
                <text
                  x={(start.x + end.x) / 2}
                  y={(start.y + end.y) / 2 - 18}
                  fill={brand.colors.textMuted}
                  fontSize={24}
                  fontFamily={brand.fonts.mono}
                  textAnchor="middle"
                >
                  {edge.label}
                </text>
              )}
            </g>
          );
        })}
      </svg>
      {def.nodes.map((node) => {
        // Nodes ahead of the current step render as dim ghosts, so a camera
        // close-up never frames empty canvas — the reveal brightens them.
        const visible = nodeVisible(node);
        const enter = nodeEnterFrame(node);
        const pop = visible
          ? spring({
              frame: Math.max(0, frame - enter),
              fps,
              config: { damping: 14, mass: 0.6 },
            })
          : 0;
        const isCurrent = (node.step ?? 0) === step && step > 0;
        const accent = brand.accents[node.accent ?? "blue"].primary;
        const glowPulse = 0.55 + Math.sin(frame / 11) * 0.25;
        return (
          <div
            key={node.id}
            style={{
              position: "absolute",
              left: node.x,
              top: node.y,
              width: node.width,
              height: node.height,
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
              gap: 8,
              background: visible
                ? "rgba(38, 64, 96, 0.55)"
                : "rgba(38, 64, 96, 0.18)",
              border: visible
                ? `2.5px solid ${accent}`
                : `2px dashed rgba(159, 188, 217, 0.22)`,
              borderRadius: 20,
              boxShadow: isCurrent
                ? `0 0 ${44 * glowPulse}px ${accent}`
                : visible
                  ? `0 0 14px rgba(0,0,0,0.4)`
                  : "none",
              opacity: visible ? interpolate(pop, [0, 1], [0, 1]) : 0.35,
              transform: `scale(${visible ? interpolate(pop, [0, 1], [0.8, 1]) : 0.96})`,
              padding: "0 18px",
              textAlign: "center",
            }}
          >
            <span style={{ fontSize: 34, fontWeight: 700, lineHeight: 1.15 }}>
              {node.label}
            </span>
            {node.sublabel && (
              <span
                style={{
                  fontSize: 22,
                  color: brand.colors.textMuted,
                  lineHeight: 1.25,
                }}
              >
                {node.sublabel}
              </span>
            )}
          </div>
        );
      })}
    </div>
  );
}

/** Point on the border of `node` toward `other`, so edges don't pierce boxes. */
function edgeAnchor(node: DiagramNode, other: DiagramNode) {
  const cx = node.x + node.width / 2;
  const cy = node.y + node.height / 2;
  const ox = other.x + other.width / 2;
  const oy = other.y + other.height / 2;
  const dx = ox - cx;
  const dy = oy - cy;
  const scaleX = dx !== 0 ? node.width / 2 / Math.abs(dx) : Infinity;
  const scaleY = dy !== 0 ? node.height / 2 / Math.abs(dy) : Infinity;
  const s = Math.min(scaleX, scaleY) * 1.08;
  return { x: cx + dx * Math.min(s, 0.5), y: cy + dy * Math.min(s, 0.5) };
}

function ArrowHead({
  from,
  to,
}: {
  from: { x: number; y: number };
  to: { x: number; y: number };
}) {
  const angle = Math.atan2(to.y - from.y, to.x - from.x);
  const size = 16;
  const points = [
    [to.x, to.y],
    [
      to.x - size * Math.cos(angle - 0.45),
      to.y - size * Math.sin(angle - 0.45),
    ],
    [
      to.x - size * Math.cos(angle + 0.45),
      to.y - size * Math.sin(angle + 0.45),
    ],
  ]
    .map((p) => p.join(","))
    .join(" ");
  return <polygon points={points} fill={brand.colors.accent} opacity={0.75} />;
}
