import { interpolate, spring, useCurrentFrame, useVideoConfig } from "remotion";
import { brand } from "../../../lib/brand";
import type { TitleArtifact } from "../../lib/types";

export function TitleCard({ def }: { def: TitleArtifact }) {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const accent = brand.accents[def.accent ?? "blue"].primary;

  const titleSpring = spring({
    frame,
    fps,
    config: { damping: 16, mass: 0.8 },
  });
  const titleOpacity = interpolate(titleSpring, [0, 1], [0, 1]);
  const titleY = interpolate(titleSpring, [0, 1], [46, 0]);
  const kickerOpacity = interpolate(frame, [4, 20], [0, 1], {
    extrapolateRight: "clamp",
  });
  const subtitleOpacity = interpolate(frame, [18, 36], [0, 1], {
    extrapolateRight: "clamp",
  });
  const underlineWidth = interpolate(frame, [22, 52], [0, 340], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  return (
    <div
      style={{
        height: "100%",
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
        padding: "0 150px",
      }}
    >
      <div
        style={{
          fontSize: 30,
          letterSpacing: 7,
          textTransform: "uppercase",
          color: brand.colors.textMuted,
          opacity: kickerOpacity,
          marginBottom: 30,
        }}
      >
        Gray Matter Workshop
      </div>
      <h1
        style={{
          fontSize: 170,
          fontWeight: 800,
          lineHeight: 1,
          letterSpacing: -4,
          margin: 0,
          background: `linear-gradient(135deg, ${brand.colors.text} 0%, ${accent} 100%)`,
          WebkitBackgroundClip: "text",
          WebkitTextFillColor: "transparent",
          opacity: titleOpacity,
          transform: `translateY(${titleY}px)`,
        }}
      >
        {def.title}
      </h1>
      <div
        style={{
          width: underlineWidth,
          height: 10,
          borderRadius: 999,
          background: accent,
          boxShadow: `0 0 26px ${accent}`,
          marginTop: 42,
        }}
      />
      {def.subtitle && (
        <p
          style={{
            fontSize: 50,
            color: brand.colors.textMuted,
            marginTop: 40,
            fontWeight: 400,
            opacity: subtitleOpacity,
          }}
        >
          {def.subtitle}
        </p>
      )}
    </div>
  );
}
