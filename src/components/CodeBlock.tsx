import { highlightLines } from "@/lib/highlight";
import CodeCopyButton from "./CodeCopyButton";

/**
 * A code card.
 *
 * Chrome across the top: the file this goes in, the Workshop-Code branch it
 * comes from, and copy. Naming the file is not decoration — "where does this
 * go?" is the single most common way a student gets stuck, and a snippet
 * floating without a filename is the reason.
 *
 * Highlighting is Shiki, running server-side, so this ships as plain HTML with
 * no JavaScript at all. Only the copy button is a client component. It
 * replaced Monaco, which was a ~3 MB editor doing a highlighter's job with a
 * simplified Java grammar that rendered class and method names as undifferen-
 * tiated white text.
 *
 * The card stays dark in both site themes. A code block is a terminal, and
 * inverting a dozen of them every time someone flips the theme makes a long
 * lesson strobe.
 */
interface CodeBlockProps {
  code: string;
  /** What this file is called. Shown top-left. */
  title?: string;
  /** Alias for `title`, kept for the pages that already use it. */
  filename?: string;
  /** Workshop-Code branch, e.g. `3-PID`. Rendered as the accent chip. */
  branch?: string;
  language?: string;
  className?: string;
  showLineNumbers?: boolean;
  /** Suppress the header entirely — used inside tabbed embeds. */
  hideControls?: boolean;
  /**
   * 1-based lines to mark as the ones that changed. Renders an accent bar in
   * the gutter, which is how you point at "this line" without a screenshot.
   */
  highlightLines?: number[];
}

export default async function CodeBlock({
  code,
  title,
  filename,
  branch,
  language = "java",
  className = "",
  showLineNumbers = true,
  hideControls = false,
  highlightLines: marked = [],
}: CodeBlockProps) {
  const lines = await highlightLines(code, language);
  const label = title ?? filename;
  const markedSet = new Set(marked);
  const gutterWidth = `${Math.max(2, String(lines.length).length)}ch`;

  return (
    <div
      className={`code-card overflow-hidden ${className}`.trim()}
      style={{
        border: "1px solid var(--rule)",
        borderRadius: 3,
        background: "var(--code-bg)",
      }}
    >
      {!hideControls && (
        <div
          className="flex items-center gap-3 px-3.5 py-[9px]"
          style={{ borderBottom: "1px solid var(--rule)" }}
        >
          <span
            className="mono truncate"
            style={{ fontSize: "var(--text-meta)", color: "var(--code-tx)" }}
          >
            {label ?? language}
          </span>
          {branch && (
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
              {branch}
            </span>
          )}
          <CodeCopyButton code={code} />
        </div>
      )}

      {/* The gutter is its own grid column rather than a `::before` on each
          line, so the numbers hold still while a long line scrolls the code
          column, and a copy-paste never picks them up. */}
      <pre
        className="code-body m-0 overflow-x-auto py-3.5"
        style={{ background: "transparent" }}
        tabIndex={0}
      >
        <code
          className="grid"
          style={{
            gridTemplateColumns: showLineNumbers
              ? `calc(${gutterWidth} + 28px) minmax(0, max-content)`
              : "minmax(0, max-content)",
            // Explicitly transparent. The inline-code rule in globals.css
            // paints `code` with --bg2, which is near-white on the light
            // theme — it was landing on top of the dark card and putting
            // light-on-light code at 1.16:1.
            background: "transparent",
            fontFamily: "var(--font-mono)",
            fontSize: "var(--text-note)",
            lineHeight: "22px",
          }}
        >
          {lines.map((html, i) => {
            const n = i + 1;
            const isMarked = markedSet.has(n);
            return (
              <div key={n} className="contents">
                {showLineNumbers && (
                  <span
                    aria-hidden="true"
                    className="sticky left-0 select-none pr-3.5 text-right"
                    style={{
                      background: "var(--code-bg)",
                      color: isMarked ? "var(--accent)" : "var(--code-tx2)",
                      borderRight: isMarked
                        ? "2px solid var(--accent)"
                        : "1px solid var(--rule-soft)",
                      paddingLeft: 14,
                    }}
                  >
                    {n}
                  </span>
                )}
                <span
                  className="pl-3.5 pr-5"
                  style={
                    isMarked
                      ? { background: "oklch(0.755 0.155 55 / 0.09)" }
                      : undefined
                  }
                  dangerouslySetInnerHTML={{ __html: html || "&nbsp;" }}
                />
              </div>
            );
          })}
        </code>
      </pre>
    </div>
  );
}
