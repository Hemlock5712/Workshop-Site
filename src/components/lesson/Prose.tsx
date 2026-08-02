import type { ReactNode } from "react";

/**
 * The lesson's reading vocabulary — four pieces that account for most of what
 * a page is made of.
 *
 *   <Prose>      a paragraph of body copy, held to `--measure`
 *   <Split>      a prose block with something in the margin rail beside it
 *   <MarginNote> what goes in that rail
 *   <WatchOut>   the aside that says "this is where people get burned"
 *
 * The measure is 660px and non-negotiable: it is roughly 70 characters of
 * Newsreader at 19px, and the whole reason a student can work through a long
 * page without losing their line.
 */

export function Prose({
  children,
  className = "",
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <p className={`prose-body measure m-0 ${className}`.trim()}>{children}</p>
  );
}

/**
 * A stack of prose paragraphs sharing one measure — use when several
 * paragraphs run together with no margin note between them.
 */
export function ProseBlock({ children }: { children: ReactNode }) {
  return (
    <div className="measure flex flex-col gap-[22px] [&>p]:m-0 [&>p]:prose-body">
      {children}
    </div>
  );
}

/**
 * Prose at `--measure` with the margin rail beside it. Below 1240px the rail
 * has nowhere to go, so `.split` collapses and the note falls in underneath
 * the paragraph it annotates — which is the right reading order anyway.
 */
export function Split({ children }: { children: ReactNode }) {
  return <div className="split">{children}</div>;
}

/**
 * A margin note. Never load-bearing — if a student reads only the main
 * column they still finish the lesson with working code. This is where the
 * "why", the war story, and the thing a mentor would say out loud go.
 */
export function MarginNote({
  label,
  children,
}: {
  label: string;
  children: ReactNode;
}) {
  return (
    <aside className="pt-2.5" style={{ borderTop: "1px solid var(--rule)" }}>
      <div
        className="mono mb-[7px]"
        style={{
          fontSize: 9,
          letterSpacing: "0.14em",
          textTransform: "uppercase",
          color: "var(--accent)",
        }}
      >
        {label}
      </div>
      <div
        style={{
          fontFamily: "var(--font-serif)",
          fontStyle: "italic",
          fontSize: 14.5,
          lineHeight: 1.55,
          color: "var(--tx3)",
        }}
      >
        {children}
      </div>
    </aside>
  );
}

/**
 * The warning form: a right-aligned mono label, then a vertical rule, then
 * the text. Deliberately not a tinted box — a page with six coloured boxes
 * on it has no warnings on it, just decoration. This reads as a note pinned
 * in the margin of a manual.
 */
export function WatchOut({
  label = "Watch\nout",
  children,
}: {
  label?: string;
  children: ReactNode;
}) {
  return (
    <div className="measure grid grid-cols-[72px_1fr] gap-6 sm:grid-cols-[96px_1fr]">
      <div
        className="mono pt-[5px] text-right"
        style={{
          fontSize: 9.5,
          letterSpacing: "0.13em",
          textTransform: "uppercase",
          color: "var(--accent)",
          lineHeight: 1.5,
          whiteSpace: "pre-line",
        }}
      >
        {label}
      </div>
      <div
        className="lesson-prose pl-6"
        style={{
          borderLeft: "1px solid var(--rule)",
          fontFamily: "var(--font-serif)",
          fontSize: 17,
          lineHeight: 1.65,
          color: "var(--tx2)",
        }}
      >
        {children}
      </div>
    </div>
  );
}

/**
 * Highlighter. One clause per page, at most two — it stops meaning anything
 * the moment it is used to mark whole paragraphs.
 */
export function Mark({ children }: { children: ReactNode }) {
  return <mark className="mark">{children}</mark>;
}
