import { useMemo } from "react";
import { useCurrentFrame } from "remotion";
import { brand } from "../../lib/brand";
import type { ResolvedTimeline } from "../lib/timeline";

interface CaptionWord {
  text: string;
  startFrame: number;
  endFrame: number;
}

interface CaptionChunk {
  startFrame: number;
  endFrame: number;
  words: CaptionWord[];
}

const MAX_CHUNK_CHARS = 42;
const CHUNK_LINGER_FRAMES = 8;

function buildChunks(resolved: ResolvedTimeline): CaptionChunk[] {
  const chunks: CaptionChunk[] = [];
  for (const beat of resolved.beats) {
    let current: CaptionWord[] = [];
    let chars = 0;
    const flush = () => {
      if (current.length === 0) return;
      chunks.push({
        startFrame: current[0].startFrame,
        endFrame: current[current.length - 1].endFrame + CHUNK_LINGER_FRAMES,
        words: current,
      });
      current = [];
      chars = 0;
    };
    for (const word of beat.words) {
      current.push({
        text: word.text,
        startFrame: beat.startFrame + word.startFrame,
        endFrame: beat.startFrame + word.endFrame,
      });
      chars += word.text.length + 1;
      // Break on width, or early at sentence ends so chunks follow the speech.
      if (chars >= MAX_CHUNK_CHARS || /[.!?]$/.test(word.text)) flush();
    }
    flush();
  }
  return chunks;
}

export function Captions({ resolved }: { resolved: ResolvedTimeline }) {
  const frame = useCurrentFrame();
  const chunks = useMemo(() => buildChunks(resolved), [resolved]);
  const active = chunks.find(
    (c) => frame >= c.startFrame && frame <= c.endFrame
  );
  if (!active) return null;

  return (
    <div
      style={{
        position: "absolute",
        bottom: 104,
        left: 0,
        right: 0,
        display: "flex",
        justifyContent: "center",
        pointerEvents: "none",
      }}
    >
      <div
        style={{
          background: "rgba(8, 24, 41, 0.78)",
          border: "1px solid rgba(159, 188, 217, 0.14)",
          borderRadius: 16,
          padding: "16px 34px",
          fontSize: 36,
          fontWeight: 500,
          display: "flex",
          gap: "0.55ch",
          flexWrap: "wrap",
          justifyContent: "center",
          maxWidth: 1500,
        }}
      >
        {active.words.map((word, i) => {
          const isCurrent = frame >= word.startFrame && frame < word.endFrame;
          const wasSpoken = frame >= word.startFrame;
          return (
            <span
              key={i}
              style={{
                color: isCurrent
                  ? brand.colors.learn
                  : wasSpoken
                    ? brand.colors.text
                    : brand.colors.textMuted,
                transform: isCurrent ? "translateY(-2px)" : "none",
                transition: "none",
              }}
            >
              {word.text}
            </span>
          );
        })}
      </div>
    </div>
  );
}
