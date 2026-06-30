import { AbsoluteFill, useCurrentFrame, useVideoConfig } from "remotion";
import { brand } from "../lib/brand";
import type { AccentColor } from "../lib/types";

interface Shape {
  x: number;
  y: number;
  radius: number;
  speed: number;
  hueShift: number;
}

const SHAPES: Shape[] = [
  { x: 0.12, y: 0.18, radius: 280, speed: 0.6, hueShift: 0 },
  { x: 0.78, y: 0.22, radius: 360, speed: -0.4, hueShift: 0.5 },
  { x: 0.22, y: 0.82, radius: 220, speed: 0.5, hueShift: 1 },
  { x: 0.85, y: 0.78, radius: 300, speed: -0.7, hueShift: 1.5 },
  { x: 0.5, y: 0.5, radius: 180, speed: 0.3, hueShift: 0.25 },
];

export function AnimatedBackground({
  accent = "blue",
}: {
  accent?: AccentColor;
}) {
  const frame = useCurrentFrame();
  const { width, height } = useVideoConfig();
  const accentColor = brand.accents[accent];

  return (
    <AbsoluteFill
      style={{
        background: `radial-gradient(circle at 30% 20%, ${brand.colors.surface} 0%, ${brand.colors.background} 45%, ${brand.colors.backgroundDeep} 100%)`,
      }}
    >
      <svg
        width={width}
        height={height}
        style={{ position: "absolute", inset: 0 }}
      >
        <defs>
          <filter id="soft-blur" x="-20%" y="-20%" width="140%" height="140%">
            <feGaussianBlur stdDeviation="40" />
          </filter>
        </defs>
        {SHAPES.map((shape, i) => {
          const t =
            (frame / brand.fps) * shape.speed + shape.hueShift * Math.PI;
          const dx = Math.cos(t) * 80;
          const dy = Math.sin(t * 0.7) * 60;
          const radiusFlex = 1 + Math.sin(t * 0.5) * 0.08;
          return (
            <circle
              key={i}
              cx={shape.x * width + dx}
              cy={shape.y * height + dy}
              r={shape.radius * radiusFlex}
              fill={accentColor.glow}
              filter="url(#soft-blur)"
              opacity={0.55}
            />
          );
        })}
      </svg>
      <Grid />
    </AbsoluteFill>
  );
}

function Grid() {
  return (
    <div
      style={{
        position: "absolute",
        inset: 0,
        backgroundImage:
          "linear-gradient(rgba(159,188,217,0.04) 1px, transparent 1px), linear-gradient(90deg, rgba(159,188,217,0.04) 1px, transparent 1px)",
        backgroundSize: "80px 80px",
        maskImage:
          "radial-gradient(ellipse at center, black 30%, transparent 80%)",
      }}
    />
  );
}
