import { Highlight, type PrismTheme } from "prism-react-renderer";
import { interpolate, spring, useCurrentFrame, useVideoConfig } from "remotion";
import { brand } from "../lib/brand";

const codeTheme: PrismTheme = {
  plain: {
    color: brand.code.plain,
    backgroundColor: brand.code.background,
  },
  styles: [
    {
      types: ["comment", "prolog", "doctype", "cdata"],
      style: { color: brand.code.comment, fontStyle: "italic" },
    },
    {
      types: ["keyword", "boolean", "operator", "punctuation"],
      style: { color: brand.code.keyword },
    },
    {
      types: ["builtin", "class-name", "tag"],
      style: { color: brand.code.type },
    },
    {
      types: ["string", "char", "attr-value"],
      style: { color: brand.code.string },
    },
    { types: ["number", "constant"], style: { color: brand.code.number } },
    { types: ["function", "method"], style: { color: brand.code.function } },
    { types: ["annotation"], style: { color: brand.code.annotation } },
  ],
};

interface CodeSlideProps {
  title?: string;
  language: string;
  code: string;
  highlightLines?: number[];
  caption?: string;
}

export function CodeSlide({
  title,
  language,
  code,
  highlightLines = [],
  caption,
}: CodeSlideProps) {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const lines = code.replace(/\s+$/, "").split("\n");

  const titleSpring = spring({
    frame,
    fps,
    config: { damping: 18, mass: 0.7 },
  });
  const titleOpacity = interpolate(titleSpring, [0, 1], [0, 1]);
  const titleY = interpolate(titleSpring, [0, 1], [-12, 0]);

  return (
    <div
      style={{
        position: "relative",
        height: "100%",
        padding: "100px 140px",
        display: "flex",
        flexDirection: "column",
        gap: 36,
        justifyContent: "center",
      }}
    >
      {title && (
        <h2
          style={{
            fontSize: 64,
            fontWeight: 700,
            color: brand.colors.text,
            margin: 0,
            fontFamily: brand.fonts.sans,
            opacity: titleOpacity,
            transform: `translateY(${titleY}px)`,
          }}
        >
          {title}
        </h2>
      )}
      <div
        style={{
          background: brand.code.background,
          border: `1px solid ${brand.code.border}`,
          borderRadius: 18,
          padding: "32px 40px",
          fontFamily: brand.fonts.mono,
          fontSize: 32,
          lineHeight: 1.55,
          boxShadow: "0 30px 80px rgba(0,0,0,0.45)",
          overflow: "hidden",
        }}
      >
        <Highlight code={code} language={language} theme={codeTheme}>
          {({ tokens, getLineProps, getTokenProps }) => (
            <pre style={{ margin: 0, background: "transparent" }}>
              {tokens.map((line, i) => {
                if (i >= lines.length) return null;
                const lineNumber = i + 1;
                const isHighlighted = highlightLines.includes(lineNumber);
                const enterStart = 8 + i * 8;
                const enterEnd = enterStart + 14;
                const lineOpacity = interpolate(
                  frame,
                  [enterStart, enterEnd],
                  [0, 1],
                  {
                    extrapolateRight: "clamp",
                  }
                );
                const lineX = interpolate(
                  frame,
                  [enterStart, enterEnd],
                  [-12, 0],
                  {
                    extrapolateRight: "clamp",
                  }
                );
                const highlightPulse = isHighlighted
                  ? 0.6 + Math.sin((frame - enterEnd) / 8) * 0.2
                  : 0;

                return (
                  <div
                    key={i}
                    {...getLineProps({ line })}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: 24,
                      padding: "2px 12px",
                      borderRadius: 6,
                      background: isHighlighted
                        ? brand.code.highlight
                        : "transparent",
                      boxShadow: isHighlighted
                        ? `inset 4px 0 0 0 ${brand.code.highlightBorder}`
                        : "none",
                      opacity: lineOpacity,
                      transform: `translateX(${lineX}px)`,
                      transition: "background 0.3s",
                    }}
                  >
                    <span
                      style={{
                        color: brand.code.lineNumber,
                        fontVariantNumeric: "tabular-nums",
                        minWidth: 36,
                        textAlign: "right",
                        userSelect: "none",
                        opacity: isHighlighted ? 1 : 0.7,
                      }}
                    >
                      {lineNumber}
                    </span>
                    <span style={{ flex: 1 }}>
                      {line.length === 0 ? (
                        <span>&nbsp;</span>
                      ) : (
                        line.map((token, key) => (
                          <span key={key} {...getTokenProps({ token })} />
                        ))
                      )}
                    </span>
                    {isHighlighted && (
                      <span
                        style={{
                          width: 10,
                          height: 10,
                          borderRadius: 999,
                          background: brand.code.highlightBorder,
                          opacity: highlightPulse,
                          boxShadow: `0 0 18px ${brand.code.highlightBorder}`,
                        }}
                      />
                    )}
                  </div>
                );
              })}
            </pre>
          )}
        </Highlight>
      </div>
      {caption && (
        <p
          style={{
            margin: 0,
            color: brand.colors.textMuted,
            fontSize: 28,
            fontFamily: brand.fonts.sans,
            fontStyle: "italic",
          }}
        >
          {caption}
        </p>
      )}
    </div>
  );
}
