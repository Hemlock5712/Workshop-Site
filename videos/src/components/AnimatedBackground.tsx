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

/**
 * Roughly 3 sigma of the Gaussian this used to be, baked into the element size
 * so the soft edge lives inside a static gradient instead of a live filter.
 */
const BLUR_BLEED = 240;

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
      {/*
        These blobs used to be SVG <circle>s pushed through a single
        `feGaussianBlur stdDeviation="40"`. Because cx/cy/r were all functions of
        the frame, the primitives moved AND resized every frame, so Skia's
        image-filter cache (keyed on the source picture plus filter params)
        missed on 100% of frames and re-blurred ~3.0 Mpx of offscreen surface
        every single frame of every trailer.

        A Gaussian-blurred disc is visually just a radial falloff, so the
        gradient below is the same picture with the blur pre-baked. The size is
        fixed and only `translate` moves, which keeps the rasterization
        cacheable. The old ±8% `radiusFlex` breathing is now opacity instead:
        changing the size would defeat the entire point.
      */}
      {SHAPES.map((shape, i) => {
        const t = (frame / brand.fps) * shape.speed + shape.hueShift * Math.PI;
        const size = shape.radius * 2 + BLUR_BLEED;
        // Whole-pixel offsets so slow drift never forces a sub-pixel resample.
        const dx = Math.round(Math.cos(t) * 80);
        const dy = Math.round(Math.sin(t * 0.7) * 60);
        return (
          <div
            key={i}
            style={{
              position: "absolute",
              width: size,
              height: size,
              left: shape.x * width - size / 2,
              top: shape.y * height - size / 2,
              background: `radial-gradient(circle, ${accentColor.glow} 0%, rgba(0, 0, 0, 0) 68%)`,
              transform: `translate(${dx}px, ${dy}px)`,
              // Breathing moved off `r` and onto opacity — composite-only.
              opacity: 0.55 * (1 + Math.sin(t * 0.5) * 0.08),
            }}
          />
        );
      })}
      <Grid />
    </AbsoluteFill>
  );
}

/**
 * Frame-independent: no useCurrentFrame(), so this rasterizes to the same
 * pixels on every frame of every trailer. Kept as CSS rather than a baked PNG
 * to avoid committing a binary, but it is the next thing to bake if a benchmark
 * still shows the background as hot — three of Remotion's named-expensive
 * properties (two linear-gradients plus a radial-gradient mask) live here.
 */
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
