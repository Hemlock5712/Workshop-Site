import { Img, interpolate, staticFile, useCurrentFrame } from "remotion";
import { brand } from "../../../lib/brand";
import type { ImageArtifact } from "../../lib/types";

// Framed image with a slow Ken Burns push so photos never sit dead still.

export function ImageCard({
  def,
  activationFrame,
}: {
  def: ImageArtifact;
  activationFrame: number;
}) {
  const frame = useCurrentFrame();
  const local = Math.max(0, frame - activationFrame);
  const zoom = 1 + Math.min(local, 420) * 0.00016; // ~6.7% over 14s

  return (
    <div
      style={{
        width: "100%",
        height: "100%",
        display: "flex",
        flexDirection: "column",
        gap: 22,
      }}
    >
      {def.title && (
        <div
          style={{
            fontSize: 40,
            fontWeight: 700,
            opacity: interpolate(local, [0, 16], [0, 1], {
              extrapolateRight: "clamp",
            }),
          }}
        >
          {def.title}
        </div>
      )}
      <div
        style={{
          flex: 1,
          borderRadius: 24,
          overflow: "hidden",
          border: `1px solid ${brand.code.border}`,
          boxShadow: "0 30px 80px rgba(0,0,0,0.45)",
          background: brand.colors.backgroundDeep,
        }}
      >
        <Img
          src={staticFile(def.src)}
          style={{
            width: "100%",
            height: "100%",
            objectFit: "cover",
            transform: `scale(${zoom})`,
          }}
        />
      </div>
      {def.caption && (
        <div
          style={{
            fontSize: 28,
            color: brand.colors.textMuted,
            fontStyle: "italic",
          }}
        >
          {def.caption}
        </div>
      )}
    </div>
  );
}
