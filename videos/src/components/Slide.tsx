import {
  AbsoluteFill,
  interpolate,
  spring,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";
import type { AccentColor, Slide as SlideType } from "../lib/types";
import { brand } from "../lib/brand";
import { AnimatedBackground } from "./AnimatedBackground";
import { CodeSlide } from "./CodeSlide";
import { ImageSlide } from "./ImageSlide";

export function Slide({ slide }: { slide: SlideType }) {
  const accent: AccentColor =
    (slide.kind === "title" || slide.kind === "bullets") && slide.accent
      ? slide.accent
      : defaultAccentFor(slide.kind);

  return (
    <AbsoluteFill
      style={{ color: brand.colors.text, fontFamily: brand.fonts.sans }}
    >
      <AnimatedBackground accent={accent} />
      <AbsoluteFill>
        <SlideContent slide={slide} accent={accent} />
      </AbsoluteFill>
      <BrandFooter accent={accent} />
    </AbsoluteFill>
  );
}

function defaultAccentFor(kind: SlideType["kind"]): AccentColor {
  switch (kind) {
    case "code":
      return "amber";
    case "image":
      return "teal";
    case "bullets":
      return "mint";
    default:
      return "blue";
  }
}

function SlideContent({
  slide,
  accent,
}: {
  slide: SlideType;
  accent: AccentColor;
}) {
  switch (slide.kind) {
    case "title":
      return <TitleSlide title={slide.title} subtitle={slide.subtitle} />;
    case "bullets":
      return (
        <BulletSlide
          title={slide.title}
          bullets={slide.bullets}
          accent={accent}
        />
      );
    case "code":
      return (
        <CodeSlide
          title={slide.title}
          language={slide.language}
          code={slide.code}
          highlightLines={slide.highlightLines}
          caption={slide.caption}
        />
      );
    case "image":
      return (
        <ImageSlide
          src={slide.src}
          caption={slide.caption}
          title={slide.title}
        />
      );
  }
}

function TitleSlide({ title, subtitle }: { title: string; subtitle?: string }) {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const titleSpring = spring({
    frame,
    fps,
    config: { damping: 16, mass: 0.8 },
  });
  const titleOpacity = interpolate(titleSpring, [0, 1], [0, 1]);
  const titleY = interpolate(titleSpring, [0, 1], [40, 0]);
  const subtitleOpacity = interpolate(frame, [16, 32], [0, 1], {
    extrapolateRight: "clamp",
  });

  return (
    <div
      style={{
        position: "relative",
        height: "100%",
        padding: "120px 140px",
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
      }}
    >
      <h1
        style={{
          fontSize: 130,
          fontWeight: 800,
          lineHeight: 1.02,
          letterSpacing: -2.5,
          margin: 0,
          background: `linear-gradient(135deg, ${brand.colors.text} 0%, ${brand.colors.accent} 100%)`,
          WebkitBackgroundClip: "text",
          WebkitTextFillColor: "transparent",
          opacity: titleOpacity,
          transform: `translateY(${titleY}px)`,
        }}
      >
        {title}
      </h1>
      {subtitle && (
        <p
          style={{
            fontSize: 44,
            color: brand.colors.textMuted,
            marginTop: 32,
            fontWeight: 400,
            opacity: subtitleOpacity,
          }}
        >
          {subtitle}
        </p>
      )}
    </div>
  );
}

function BulletSlide({
  title,
  bullets,
  accent,
}: {
  title: string;
  bullets: string[];
  accent: AccentColor;
}) {
  const frame = useCurrentFrame();
  const accentColor = brand.accents[accent].primary;
  const titleOpacity = interpolate(frame, [0, 14], [0, 1], {
    extrapolateRight: "clamp",
  });
  const titleY = interpolate(frame, [0, 18], [16, 0], {
    extrapolateRight: "clamp",
  });

  return (
    <div
      style={{
        position: "relative",
        height: "100%",
        padding: "120px 140px",
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
      }}
    >
      <h2
        style={{
          fontSize: 80,
          fontWeight: 700,
          margin: 0,
          marginBottom: 56,
          opacity: titleOpacity,
          transform: `translateY(${titleY}px)`,
        }}
      >
        {title}
      </h2>
      <ul style={{ listStyle: "none", padding: 0, margin: 0 }}>
        {bullets.map((bullet, i) => {
          const start = 20 + i * 14;
          const opacity = interpolate(frame, [start, start + 14], [0, 1], {
            extrapolateRight: "clamp",
          });
          const x = interpolate(frame, [start, start + 14], [-24, 0], {
            extrapolateRight: "clamp",
          });
          const pulse = 0.7 + Math.sin((frame - start) / 10 + i) * 0.3;
          return (
            <li
              key={i}
              style={{
                fontSize: 48,
                color: brand.colors.text,
                marginBottom: 24,
                opacity,
                transform: `translateX(${x}px)`,
                display: "flex",
                alignItems: "center",
                gap: 24,
              }}
            >
              <span
                style={{
                  width: 16,
                  height: 16,
                  borderRadius: 999,
                  background: accentColor,
                  flexShrink: 0,
                  boxShadow: `0 0 20px ${accentColor}`,
                  opacity: pulse,
                }}
              />
              {bullet}
            </li>
          );
        })}
      </ul>
    </div>
  );
}

function BrandFooter({ accent }: { accent: AccentColor }) {
  const accentColor = brand.accents[accent].primary;
  return (
    <div
      style={{
        position: "absolute",
        bottom: 60,
        left: 140,
        right: 140,
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        color: brand.colors.textMuted,
        fontSize: 24,
        letterSpacing: 1,
      }}
    >
      <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
        <span
          style={{
            width: 10,
            height: 10,
            borderRadius: 999,
            background: accentColor,
            boxShadow: `0 0 12px ${accentColor}`,
          }}
        />
        <span>Gray Matter Workshop</span>
      </div>
      <span style={{ fontFamily: brand.fonts.mono }}>frc5712.com</span>
    </div>
  );
}
