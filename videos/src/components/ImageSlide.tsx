import {
  Img,
  interpolate,
  staticFile,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";
import { brand } from "../lib/brand";

interface ImageSlideProps {
  src: string;
  caption?: string;
  title?: string;
}

export function ImageSlide({ src, caption, title }: ImageSlideProps) {
  const frame = useCurrentFrame();
  const { durationInFrames } = useVideoConfig();

  // Ken Burns: slow zoom + slight pan over the segment.
  const progress = interpolate(frame, [0, durationInFrames], [0, 1], {
    extrapolateRight: "clamp",
  });
  const scale = 1.04 + progress * 0.08;
  const translateX = (progress - 0.5) * 24;
  const translateY = -(progress - 0.5) * 16;

  const fade = interpolate(frame, [0, 16], [0, 1], {
    extrapolateRight: "clamp",
  });

  const isRemote = /^https?:\/\//.test(src);
  const resolved = isRemote ? src : staticFile(src);

  return (
    <div
      style={{
        position: "relative",
        height: "100%",
        padding: 80,
        display: "flex",
        flexDirection: "column",
        gap: 32,
        justifyContent: "center",
        alignItems: "center",
      }}
    >
      {title && (
        <h2
          style={{
            margin: 0,
            color: brand.colors.text,
            fontFamily: brand.fonts.sans,
            fontSize: 56,
            fontWeight: 700,
            opacity: fade,
          }}
        >
          {title}
        </h2>
      )}
      <div
        style={{
          position: "relative",
          width: "100%",
          maxWidth: 1480,
          aspectRatio: "16 / 9",
          borderRadius: 24,
          overflow: "hidden",
          boxShadow: "0 40px 120px rgba(0,0,0,0.55)",
          border: `1px solid ${brand.code.border}`,
          opacity: fade,
        }}
      >
        <Img
          src={resolved}
          style={{
            width: "100%",
            height: "100%",
            objectFit: "cover",
            transform: `scale(${scale}) translate(${translateX}px, ${translateY}px)`,
            transformOrigin: "center",
          }}
        />
      </div>
      {caption && (
        <p
          style={{
            margin: 0,
            color: brand.colors.textMuted,
            fontSize: 28,
            fontFamily: brand.fonts.sans,
            fontStyle: "italic",
            textAlign: "center",
            maxWidth: 1200,
            opacity: fade,
          }}
        >
          {caption}
        </p>
      )}
    </div>
  );
}
