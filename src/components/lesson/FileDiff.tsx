import { highlightLines } from "@/lib/highlight";

/**
 * A file diff, in the shape `git diff` prints it.
 *
 * **Not in use yet, deliberately.** Built August 2026 and parked: run it
 * over `mech-1 -> mech-2` today and a third of the red and green is
 * Javadoc rewording, which teaches nothing and buries the two lines that
 * matter. It becomes worth switching on once the chain's comments and
 * prose settle, so that a diff is mostly code.
 *
 * The problem this solves: a lesson that shows three separate code blocks
 * ("add this import", "add these methods") never says *where* in the file any
 * of it goes, and a student reading the third block has lost the first. A diff
 * answers "what changed and where" in one artifact, with real line numbers off
 * the branch.
 *
 * Input is a unified diff, verbatim from `git diff branchA branchB -- path`.
 * That is deliberate: the alternative is computing a diff from a before/after
 * pair here, which would drift from what the branch actually contains. Paste
 * what git prints and the page cannot disagree with the repo.
 *
 * Two gutters, not one. The left is the line number in the old file, the right
 * in the new one, so "line 26" in the prose has an unambiguous referent. An
 * added line has no old number; a removed line has no new one.
 *
 * ## Colour
 *
 * `--ok` and `--err` are the site's two signal tokens, but they are tuned per
 * theme and this card is dark in *both* themes, the same rule `CodeBlock`
 * follows. The light theme's `--ok` sits at 0.52 lightness, which on
 * `--code-bg` is unreadable. So the add/remove colours are pinned to the
 * dark-theme values rather than reading the token, exactly as `--code-tx` is.
 */

const ADD = "oklch(0.78 0.13 155)";
const DEL = "oklch(0.71 0.17 27)";
const ADD_BG = "color-mix(in oklch, oklch(0.78 0.13 155) 13%, transparent)";
const DEL_BG = "color-mix(in oklch, oklch(0.71 0.17 27) 12%, transparent)";

type Kind = "context" | "add" | "del";

interface Row {
  kind: Kind;
  oldNo: number | null;
  newNo: number | null;
  text: string;
}

interface Hunk {
  /** The `@@` header's trailing context, e.g. `public class Arm ...`. */
  heading: string;
  rows: Row[];
  /** Unchanged lines skipped between the previous hunk and this one. */
  skipped: number;
}

/** Parse a unified diff into hunks with both sides' line numbers. */
function parse(diff: string): Hunk[] {
  const hunks: Hunk[] = [];
  let oldNo = 0;
  let newNo = 0;
  let lastOldEnd = 1;

  for (const line of diff.replace(/\r\n/g, "\n").split("\n")) {
    const header = /^@@ -(\d+)(?:,\d+)? \+(\d+)(?:,\d+)? @@ ?(.*)$/.exec(line);
    if (header) {
      oldNo = Number(header[1]);
      newNo = Number(header[2]);
      hunks.push({
        heading: header[3] ?? "",
        rows: [],
        skipped: Math.max(0, oldNo - lastOldEnd),
      });
      continue;
    }
    if (!hunks.length) continue;
    if (
      line.startsWith("diff ") ||
      line.startsWith("index ") ||
      line.startsWith("--- ") ||
      line.startsWith("+++ ") ||
      line.startsWith("\\ No newline")
    ) {
      continue;
    }

    const hunk = hunks[hunks.length - 1]!;
    const body = line.slice(1);
    if (line.startsWith("+")) {
      hunk.rows.push({ kind: "add", oldNo: null, newNo: newNo++, text: body });
    } else if (line.startsWith("-")) {
      hunk.rows.push({ kind: "del", oldNo: oldNo++, newNo: null, text: body });
    } else if (line.startsWith(" ") || line === "") {
      hunk.rows.push({
        kind: "context",
        oldNo: oldNo++,
        newNo: newNo++,
        text: body,
      });
    }
    lastOldEnd = oldNo;
  }
  return hunks;
}

interface FileDiffProps {
  /** Unified diff text, verbatim from `git diff`. */
  diff: string;
  /** Path shown top-left. */
  filename?: string;
  /** Branch the change starts from. */
  from?: string;
  /** Branch it lands on. */
  to?: string;
  language?: string;
  /** Hide the `N unchanged lines` separators. */
  hideSkips?: boolean;
}

export default async function FileDiff({
  diff,
  filename,
  from,
  to,
  language = "java",
  hideSkips = false,
}: FileDiffProps) {
  const hunks = parse(diff);
  const rows = hunks.flatMap((h) => h.rows);
  const highlighted = await highlightLines(
    rows.map((r) => r.text).join("\n"),
    language
  );

  const added = rows.filter((r) => r.kind === "add").length;
  const removed = rows.filter((r) => r.kind === "del").length;
  const widest = Math.max(
    2,
    ...rows.map((r) => String(r.newNo ?? r.oldNo ?? 0).length)
  );
  const num = `${widest}ch`;

  let i = 0;

  return (
    <div
      className="code-card measure-wide overflow-hidden"
      style={{
        border: "1px solid var(--rule)",
        borderRadius: 3,
        background: "var(--code-bg)",
      }}
    >
      <div
        className="flex items-center gap-3 px-3.5 py-[9px]"
        style={{ borderBottom: "1px solid var(--rule)" }}
      >
        <span
          className="mono truncate"
          style={{ fontSize: "var(--text-meta)", color: "var(--code-tx)" }}
        >
          {filename ?? "diff"}
        </span>
        <span
          className="mono ml-auto shrink-0 whitespace-nowrap"
          style={{ fontSize: "var(--text-micro)", color: "var(--code-tx2)" }}
        >
          <span style={{ color: ADD }}>+{added}</span>{" "}
          <span style={{ color: DEL }}>&minus;{removed}</span>
        </span>
        {from && to && (
          <span
            className="mono shrink-0 whitespace-nowrap"
            style={{
              fontSize: "var(--text-micro)",
              letterSpacing: "0.12em",
              color: "var(--accent)",
              border: "1px solid var(--accent)",
              borderRadius: 2,
              padding: "1px 5px",
            }}
          >
            {from} → {to}
          </span>
        )}
      </div>

      <pre
        className="code-body m-0 overflow-x-auto py-2"
        style={{ background: "transparent" }}
        tabIndex={0}
      >
        <code
          className="grid"
          style={{
            gridTemplateColumns: `calc(${num} + 16px) calc(${num} + 16px) 18px minmax(0, max-content)`,
            background: "transparent",
            fontFamily: "var(--font-mono)",
            fontSize: "var(--text-note)",
            lineHeight: "22px",
          }}
        >
          {hunks.map((hunk, hi) => (
            <div key={hi} className="contents">
              {!hideSkips && hunk.skipped > 0 && (
                <div
                  className="contents"
                  aria-label={`${hunk.skipped} unchanged lines`}
                >
                  <span
                    aria-hidden="true"
                    className="col-span-3 select-none"
                    style={{ borderTop: "1px solid var(--rule-soft)" }}
                  />
                  <span
                    className="select-none pl-3.5"
                    style={{
                      color: "var(--code-tx2)",
                      borderTop: "1px solid var(--rule-soft)",
                    }}
                  >
                    {hunk.skipped} unchanged{" "}
                    {hunk.skipped === 1 ? "line" : "lines"}
                    {hunk.heading ? ` · ${hunk.heading.trim()}` : ""}
                  </span>
                </div>
              )}

              {hunk.rows.map((row, ri) => {
                const html = highlighted[i++] ?? "";
                const bg =
                  row.kind === "add"
                    ? ADD_BG
                    : row.kind === "del"
                      ? DEL_BG
                      : undefined;
                const sign =
                  row.kind === "add" ? "+" : row.kind === "del" ? "−" : "";
                const signColor =
                  row.kind === "add"
                    ? ADD
                    : row.kind === "del"
                      ? DEL
                      : "transparent";
                return (
                  <div key={`${hi}-${ri}`} className="contents">
                    <span
                      aria-hidden="true"
                      className="select-none pr-2 text-right"
                      style={{ background: bg, color: "var(--code-tx2)" }}
                    >
                      {row.oldNo ?? ""}
                    </span>
                    <span
                      aria-hidden="true"
                      className="select-none pr-2 text-right"
                      style={{
                        background: bg,
                        color: "var(--code-tx2)",
                        borderRight: "1px solid var(--rule-soft)",
                      }}
                    >
                      {row.newNo ?? ""}
                    </span>
                    <span
                      aria-hidden="true"
                      className="select-none pl-2"
                      style={{ background: bg, color: signColor }}
                    >
                      {sign}
                    </span>
                    <span
                      className="pl-1 pr-5"
                      style={{ background: bg }}
                      dangerouslySetInnerHTML={{ __html: html || "&nbsp;" }}
                    />
                  </div>
                );
              })}
            </div>
          ))}
        </code>
      </pre>
    </div>
  );
}
