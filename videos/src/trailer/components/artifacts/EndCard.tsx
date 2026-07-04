import { interpolate, spring, useCurrentFrame, useVideoConfig } from "remotion";
import { brand } from "../../../lib/brand";
import type { EndArtifact } from "../../lib/types";

export function EndCard({
  def,
  activationFrame,
}: {
  def: EndArtifact;
  activationFrame: number;
}) {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const local = Math.max(0, frame - activationFrame);
  const accent = brand.accents.teal.primary;

  const titleSpring = spring({
    frame: local,
    fps,
    config: { damping: 15, mass: 0.7 },
  });
  const urlSpring = spring({
    frame: Math.max(0, local - 14),
    fps,
    config: { damping: 13, mass: 0.6 },
  });
  const subtitleOpacity = interpolate(local, [26, 44], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const pulse = 1 + Math.sin(local / 14) * 0.012;

  return (
    <div
      style={{
        height: "100%",
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
        alignItems: "center",
        textAlign: "center",
        padding: "0 130px",
      }}
    >
      <h1
        style={{
          fontSize: 108,
          fontWeight: 800,
          letterSpacing: -2,
          margin: 0,
          opacity: interpolate(titleSpring, [0, 1], [0, 1]),
          transform: `translateY(${interpolate(titleSpring, [0, 1], [40, 0])}px)`,
        }}
      >
        {def.title}
      </h1>
      <div
        style={{
          marginTop: 64,
          padding: "26px 66px",
          borderRadius: 20,
          border: `2px solid ${accent}`,
          background: "rgba(94, 234, 212, 0.08)",
          boxShadow: `0 0 60px rgba(94, 234, 212, 0.25)`,
          fontFamily: brand.fonts.mono,
          fontSize: 62,
          color: accent,
          opacity: interpolate(urlSpring, [0, 1], [0, 1]),
          transform: `scale(${interpolate(urlSpring, [0, 1], [0.9, 1]) * pulse})`,
        }}
      >
        {def.url}
      </div>
      {def.subtitle && (
        <p
          style={{
            fontSize: 38,
            color: brand.colors.textMuted,
            marginTop: 56,
            maxWidth: 1250,
            lineHeight: 1.45,
            opacity: subtitleOpacity,
          }}
        >
          {def.subtitle}
        </p>
      )}
    </div>
  );
}
