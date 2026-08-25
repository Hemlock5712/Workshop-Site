import type { ReactNode } from "react";

/**
 * The lesson's reading vocabulary — four pieces that account for most of what
 * a page is made of.
 *
 *   <Prose>      a paragraph of body copy, held to `--measure`
 *   <Split>      a prose block with a note attached to it
 *   <MarginNote> that note
 *   <WatchOut>   the aside that says "this is where people get burned"
 *
 * The measure is 820px — roughly 83 characters of Newsreader at 20px. It was
 * 660px with a 250px margin rail to the right of it, and the rail is gone:
 * everything on a lesson now runs in one column, and the column is as wide as
 * a line can be and still be scanned. See the note on `--measure` in
 * `globals.css`.
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
 *
 * This is the piece of the reading vocabulary the CSS default in `globals.css`
 * cannot replace. A bare `<p>` inside `.lesson-body` now gets the treatment on
 * its own, so wrapping one paragraph in `<Prose>` buys nothing there; what a
 * paragraph cannot do by itself is space itself against its neighbour. The
 * 22px gap and the shared measure are this component's whole reason to exist.
 */
export function ProseBlock({
  children,
  className = "",
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <div
      className={`measure flex flex-col gap-pad [&>p]:m-0 [&>p]:prose-body ${className}`.trim()}
    >
      {children}
    </div>
  );
}

/**
 * A prose block with a `<MarginNote>` attached under it. This used to put the
 * note in a rail to the right at 1240px and up; it stacks at every width now,
 * which was already the reading order the markup implied and the only order
 * two thirds of viewports ever saw. All `<Split>` still does is own the gap
 * between the paragraph and its note.
 */
export function Split({ children }: { children: ReactNode }) {
  return <div className="split">{children}</div>;
}

/**
 * A margin note, which is no longer in a margin. Never load-bearing — if a
 * student reads only the main column they still finish the lesson with working
 * code. This is where the "why", the war story, and the thing a mentor would
 * say out loud go.
 *
 * The treatment changed with the rail. In a 250px column, 13px italic at
 * `--tx3` read as a marginalium; in the reading column at 820px the same two
 * sentences read as something the page had given up on, faint small type
 * across a wide line. So it borrows `WatchOut`'s idiom instead — a hairline on
 * the left, the mono label in the accent above it — which is how this site
 * already says "aside" inline. One step under body copy at `--text-aside`, and
 * still italic, so the eye can tell in one glance that skipping it is allowed.
 */
export function MarginNote({
  label,
  children,
}: {
  label: string;
  children: ReactNode;
}) {
  return (
    <aside className="pl-6" style={{ borderLeft: "1px solid var(--rule)" }}>
      <div
        className="mono mb-[7px]"
        style={{
          fontSize: "var(--text-micro)",
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
          fontSize: "var(--text-aside)",
          lineHeight: 1.6,
          color: "var(--tx2)",
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
    <div className="measure grid grid-cols-[72px_minmax(0,1fr)] gap-6 sm:grid-cols-[96px_minmax(0,1fr)]">
      <div
        className="mono pt-[5px] text-right"
        style={{
          fontSize: "var(--text-micro)",
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
          fontSize: "var(--text-aside)",
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
