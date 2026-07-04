import { useMemo } from "react";
import { Highlight } from "prism-react-renderer";
import { interpolate, useCurrentFrame } from "remotion";
import { brand } from "../../../lib/brand";
import { diffLines } from "../../lib/diff";
import { codeTheme } from "../../lib/codeTheme";
import type { ResolvedEvent } from "../../lib/timeline";
import type { CodeArtifact } from "../../lib/types";

const LINE_HEIGHT = 48;
const FONT_SIZE = 30;
/** Typing speed in characters per frame (~57 cps — screencast-fast, still legible). */
const CHARS_PER_FRAME = 1.9;
/** Frames of settle before typing begins after a state change. */
const TYPE_DELAY = 10;

interface CodeStateChange {
  frame: number;
  state: number;
}

export function CodePanel({
  def,
  events,
}: {
  def: CodeArtifact;
  events: ResolvedEvent[];
}) {
  const frame = useCurrentFrame();

  const changes = useMemo<CodeStateChange[]>(
    () =>
      events
        .filter(
          (e) => e.event.type === "code-state" && e.event.artifact === def.id
        )
        .map((e) => ({
          frame: e.frame,
          state: e.event.type === "code-state" ? e.event.state : 0,
        })),
    [events, def.id]
  );

  let stateIndex = 0;
  let prevIndex = 0;
  let transitionStart = Number.NEGATIVE_INFINITY;
  for (const change of changes) {
    if (frame >= change.frame) {
      prevIndex = stateIndex;
      stateIndex = change.state;
      transitionStart = change.frame;
    }
  }

  const rows = useMemo(
    () => diffLines(def.states[prevIndex] ?? "", def.states[stateIndex] ?? ""),
    [def.states, prevIndex, stateIndex]
  );

  // Typing schedule: added rows type top-to-bottom, sequentially.
  const schedule = useMemo(() => {
    let charCursor = 0;
    return rows.map((row) => {
      if (row.kind !== "added") return null;
      const cost = Math.max(row.text.length, 2);
      const start = charCursor;
      charCursor += cost;
      return { startChar: start, cost };
    });
  }, [rows]);

  const typeStartFrame = transitionStart + TYPE_DELAY;
  const charsTyped = Math.max(0, (frame - typeStartFrame) * CHARS_PER_FRAME);
  const totalCost = schedule.reduce((sum, s) => sum + (s ? s.cost : 0), 0);
  const typingDone = charsTyped >= totalCost;
  const cursorVisible =
    totalCost > 0 && frame - typeStartFrame < totalCost / CHARS_PER_FRAME + 45;

  return (
    <div
      style={{
        height: "100%",
        display: "flex",
        flexDirection: "column",
        background: brand.code.background,
        border: `1px solid ${brand.code.border}`,
        borderRadius: 20,
        boxShadow: "0 30px 80px rgba(0,0,0,0.45)",
        overflow: "hidden",
        fontFamily: brand.fonts.mono,
        fontSize: FONT_SIZE,
      }}
    >
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 12,
          padding: "20px 30px",
          borderBottom: `1px solid ${brand.code.border}`,
          background: "rgba(38, 64, 96, 0.25)",
        }}
      >
        {["#ff5f57", "#febc2e", "#28c840"].map((color) => (
          <span
            key={color}
            style={{
              width: 16,
              height: 16,
              borderRadius: 999,
              background: color,
            }}
          />
        ))}
        <span
          style={{
            marginLeft: 16,
            color: brand.colors.textMuted,
            fontSize: 26,
          }}
        >
          {def.fileName}
        </span>
      </div>

      <div style={{ padding: "38px 44px", flex: 1 }}>
        <Highlight
          code={def.states[stateIndex] ?? ""}
          language={def.language}
          theme={codeTheme}
        >
          {({ tokens, getTokenProps }) => (
            // pre whitespace so code indentation survives outside a <pre> tag
            <div style={{ whiteSpace: "pre" }}>
              {rows.map((row, rowIdx) => {
                if (row.kind === "removed") {
                  const h = interpolate(
                    frame - transitionStart,
                    [0, 8],
                    [LINE_HEIGHT, 0],
                    { extrapolateLeft: "clamp", extrapolateRight: "clamp" }
                  );
                  if (h <= 0.5) return null;
                  return (
                    <div
                      key={`r-${rowIdx}`}
                      style={{
                        height: h,
                        overflow: "hidden",
                        opacity: h / LINE_HEIGHT,
                        color: brand.code.comment,
                      }}
                    >
                      {row.text || " "}
                    </div>
                  );
                }

                const lineTokens = tokens[row.newIndex] ?? [];
                const slot = schedule[rowIdx];

                if (row.kind === "kept" || !slot) {
                  return (
                    <div key={`k-${rowIdx}`} style={{ height: LINE_HEIGHT }}>
                      {renderSliced(
                        lineTokens,
                        Number.POSITIVE_INFINITY,
                        getTokenProps
                      )}
                    </div>
                  );
                }

                const charsIntoRow = charsTyped - slot.startChar;
                if (charsIntoRow <= 0) return null; // not inserted yet — no height
                const visibleChars = Math.min(
                  row.text.length,
                  Math.floor(charsIntoRow)
                );
                const isTypingHere = charsIntoRow < slot.cost;
                const showCursor =
                  cursorVisible &&
                  (isTypingHere ||
                    (typingDone && rowIdx === lastAddedIndex(schedule)));

                return (
                  <div
                    key={`a-${rowIdx}`}
                    style={{
                      height: LINE_HEIGHT,
                      display: "flex",
                      alignItems: "center",
                    }}
                  >
                    <span>
                      {renderSliced(lineTokens, visibleChars, getTokenProps)}
                    </span>
                    {showCursor && <Cursor blink={typingDone} frame={frame} />}
                  </div>
                );
              })}
              {totalCost === 0 && cursorAtRest(frame)}
            </div>
          )}
        </Highlight>
      </div>
    </div>
  );
}

function lastAddedIndex(
  schedule: ({ startChar: number; cost: number } | null)[]
): number {
  for (let i = schedule.length - 1; i >= 0; i--) {
    if (schedule[i]) return i;
  }
  return -1;
}

function renderSliced(
  lineTokens: { types: string[]; content: string; empty?: boolean }[],
  maxChars: number,
  getTokenProps: (input: { token: { types: string[]; content: string } }) => {
    style?: React.CSSProperties;
  }
) {
  if (lineTokens.length === 0) return " ";
  const out: React.ReactNode[] = [];
  let used = 0;
  for (let i = 0; i < lineTokens.length; i++) {
    const token = lineTokens[i];
    if (used >= maxChars) break;
    const take = Math.min(token.content.length, maxChars - used);
    const { style } = getTokenProps({ token });
    out.push(
      <span key={i} style={style}>
        {take >= token.content.length
          ? token.content
          : token.content.slice(0, take)}
      </span>
    );
    used += take;
  }
  if (out.length === 0) return " ";
  return out;
}

function Cursor({ blink, frame }: { blink: boolean; frame: number }) {
  const visible = blink ? frame % 24 < 13 : true;
  return (
    <span
      style={{
        display: "inline-block",
        width: 16,
        height: 38,
        marginLeft: 3,
        background: brand.accents.amber.primary,
        opacity: visible ? 0.9 : 0,
        borderRadius: 2,
      }}
    />
  );
}

/** Idle blinking cursor for the empty (pre-typing) panel state. */
function cursorAtRest(frame: number) {
  return (
    <div style={{ height: LINE_HEIGHT, display: "flex", alignItems: "center" }}>
      <Cursor blink frame={frame} />
    </div>
  );
}
