import { Children, isValidElement, type ReactNode } from "react";
import NavFooter, { type NavOverride } from "@/components/NavFooter";
import LessonOutline from "@/components/lesson/LessonOutline";
import LessonSection from "@/components/lesson/LessonSection";
import LessonKicker from "@/components/lesson/LessonKicker";
import { Mech } from "@/components/lesson/Mechanism";
import type { MechanismId } from "@/data/mechanisms";
import type { OutlineEntry } from "@/components/lesson/LessonOutline";

/**
 * Read the sections off the children so the outline rail can be server-
 * rendered. `LessonOutline` still rescans the DOM once mounted — this is only
 * about the first paint, and about the rail surviving a page where JS never
 * arrives.
 *
 * It walks by component identity rather than by markup, so it stays honest
 * for the same reason the DOM scan is: nothing is hand-maintained, and a
 * section that isn't really there cannot appear in the rail. Fragments and
 * arrays are traversed because pages nest sections inside both.
 *
 * A section inside a `<Mech>` fork is tagged with that mechanism rather than
 * dropped, and the rail hides the wrong ones in CSS. The server cannot know
 * which mechanism a visitor picked, so anything decided here in JavaScript is
 * decided wrong for half of them.
 *
 * This used to assume the default and lean on the client rescan, and the
 * assumption does not survive contact with the inline script in the root
 * layout: that script sets `data-mechanism` from `localStorage` BEFORE first
 * paint. A returning flywheel student therefore painted a flywheel lesson
 * beside a rail listing the arm's sections, with two entries whose targets are
 * `display: none` on their page and scroll nowhere. It corrected on mount, and
 * `LessonOutline` carries its own note about hydration taking seconds on the
 * heavy pages.
 *
 * A visitor with no JavaScript never gets the attribute, so they see the
 * default reading and the default reading's entries, which is the same pairing
 * as before.
 */
function collectSections(
  nodes: ReactNode,
  out: OutlineEntry[] = [],
  mech?: MechanismId
): OutlineEntry[] {
  Children.forEach(nodes, (child) => {
    if (!isValidElement(child)) return;
    if (child.type === Mech) {
      const p = child.props as { for?: MechanismId; children?: ReactNode };
      if (p.children) collectSections(p.children, out, p.for ?? mech);
      return;
    }
    if (child.type === LessonSection) {
      const p = child.props as {
        id?: string;
        title?: ReactNode;
        outlineLabel?: string;
      };
      const label =
        p.outlineLabel ?? (typeof p.title === "string" ? p.title : undefined);
      if (p.id && label) out.push({ id: p.id, label, mech });
      return;
    }
    const p = child.props as { children?: ReactNode };
    if (p?.children) collectSections(p.children, out, mech);
  });
  return out;
}

interface PageTemplateProps {
  /**
   * The lesson's name. A noun phrase, five words at the most: "PID Tuning in
   * Tuner X", "Swerve Calibration", "OpModes".
   *
   * This used to be a sentence, on the theory that "Tell the arm where to go,
   * not how hard to push" teaches more than "PID Control" does. It doesn't. A
   * student arriving from search, from the drawer, or from a breadcrumb needs
   * to know what page they are on, and a sentence makes them read the whole
   * line to find out. The sentence that teaches is the `lede`, one line down,
   * where it costs nothing. See `context/lesson-budget.md`.
   */
  title: string;
  /**
   * Two or three flat sentences directly under the title: what this lesson
   * does, what it leaves behind, and any hard prerequisite.
   */
  lede?: ReactNode;
  /**
   * The "You'll need" block under the lede: what has to be true before a
   * student starts. Anything physical goes last and in full text — a student
   * who reads this on the bus needs to know the arm has to be on a bench.
   *
   * It stood beside the title until the margin rail went away, which is
   * exactly the wrong side of the page for it: a student read the title, met a
   * checklist to the right of it, and had to come back left to find the first
   * sentence of the lesson. It reads in order now.
   */
  needs?: ReactNode[];
  /**
   * Workshop-Code branch this lesson is written against, e.g. `3-PID`. In the
   * outline rail from 1240px up, and on a compact line under the lede below
   * that — a student on a phone has to be able to read what they must type.
   */
  branch?: string;
  /** Honest time estimate. Sits wherever `branch` does. */
  time?: string;
  /**
   * Optional explicit Previous link. Omit to auto-derive from
   * `src/data/lessons.ts` based on the current pathname. Pass `null`
   * to suppress the link entirely.
   */
  previousPage?: NavOverride | null;
  /** Optional explicit Next link — same rules as `previousPage`. */
  nextPage?: NavOverride | null;
  children: ReactNode;
}

/**
 * The frame every lesson renders into: outline rail on the left, article
 * beside it, prev/next at the bottom.
 *
 * One column of content, `--measure` wide, with `--gutter` more available to a
 * code block, a table or a figure. Body copy stays at a line length that can
 * be scanned; the things that genuinely need width get it. Nothing sits to the
 * right of the prose any more — the notes that used to be there now stack with
 * the paragraphs they annotate, so a lesson reads top to bottom in one place.
 */
export default function PageTemplate({
  title,
  lede,
  needs,
  branch,
  time,
  previousPage,
  nextPage,
  children,
}: PageTemplateProps) {
  return (
    // `minmax(0, …)` on both breakpoints is load-bearing. With a bare `auto`
    // column plus `justify-center`, the grid track sizes to max-content — so
    // the article stayed as wide as its 660px measure inside a 290px phone
    // viewport and every lesson scrolled sideways. `justify-center` only
    // applies once there are actually two tracks to centre.
    //
    // The inset steps 16 → 24 → 40px. 16px below `sm` is not a style choice:
    // the rail plus two 24px margins left a 272px column on a 390px phone,
    // which is ~37 characters of Newsreader a line, and the 8px each side is
    // worth about 3 characters.
    // The rail column is `auto`, not a fixed 184px. A page with no
    // `<LessonSection>` has nothing to put in an outline, and the fixed track
    // reserved the full width anyway — /project-setup rendered a 184px column
    // on a 1440px screen containing one line, "About 20 minutes, most of it
    // the first Gradle build", and nothing else. `auto` collapses the track to
    // whatever the rail actually needs, and to zero when `LessonOutline`
    // returns null. `gap-14` still applies, so the sticky rail keeps its
    // breathing room on the 27 pages that do have sections.
    <div className="grid grid-cols-[minmax(0,1fr)] gap-14 px-4 pt-14 sm:px-6 md:px-10 min-[1240px]:grid-cols-[auto_minmax(0,auto)] min-[1240px]:justify-center">
      <LessonOutline
        branch={branch}
        time={time}
        initialEntries={collectSections(children)}
      />

      {/* `id` + `tabIndex` so the skip link can land *past* the outline rail.
          Targeting `#main-content` was not a bypass: the rail's nav lives
          inside that element, so focus arrived above it and Tab still walked
          all nine links before the first line of the lesson. Focus lands
          inside `<main>` either way, so the arrow keys still scroll. */}
      <article
        id="lesson-article"
        tabIndex={-1}
        className="lesson-body measure-wide pb-[120px] focus:outline-none"
      >
        <header className="split mb-[52px]">
          <div>
            <LessonKicker />
            {/* The ceiling came down from 74px when the titles became names
                rather than sentences. 74px was sized for "Tell the arm where
                to go, not how hard to push", which fills three lines and reads
                as a masthead; the same size on "OpModes" is one word occupying
                a third of the first screen. 56px keeps the display voice and
                gives the lede and the lesson room above the fold. */}
            <h1
              className="display m-0 mb-[22px]"
              style={{
                fontSize: "clamp(34px, 4.4vw, 56px)",
                lineHeight: 1,
                letterSpacing: "-0.022em",
                textWrap: "balance",
              }}
            >
              {title}
            </h1>
            {lede && <p className="lesson-lede m-0">{lede}</p>}

            {/* Branch and time, for everyone who cannot see the outline rail.
                The rail is `min-[1240px]` only, so below that these two strings
                were on no viewport at all — and the branch is the one thing on
                the page a student has to type (`git clone -b 3-PID`). A phone
                held next to a laptop could not show it. Hidden from 1240px up,
                where the rail says it already; never both. */}
            {(branch || time) && (
              <div
                data-lesson-meta
                className="mt-flow flex flex-wrap items-baseline gap-x-control gap-y-tight min-[1240px]:hidden"
              >
                {branch && (
                  <span className="flex items-baseline gap-tight">
                    <span className="micro">Branch</span>
                    <span
                      className="mono"
                      style={{
                        fontSize: "var(--text-meta)",
                        color: "var(--accent)",
                      }}
                    >
                      {branch}
                    </span>
                  </span>
                )}
                {branch && time && (
                  <span
                    aria-hidden="true"
                    style={{
                      fontSize: "var(--text-meta)",
                      color: "var(--rule)",
                    }}
                  >
                    ·
                  </span>
                )}
                {time && (
                  <span
                    style={{
                      fontFamily: "var(--font-serif)",
                      fontStyle: "italic",
                      fontSize: "var(--text-note)",
                      color: "var(--tx3)",
                    }}
                  >
                    {time}
                  </span>
                )}
              </div>
            )}
          </div>

          {/* Two columns from `sm` up, and that is about the width it
              inherited rather than a taste for grids. In a 250px rail these
              items were a single narrow list; across the full measure a
              stacked list of four four-word entries is a ladder of white
              space above the lesson. Two columns keeps the block about as
              tall as it was, which is the point of putting it here — it has
              to be read past, not read around. */}
          {needs && needs.length > 0 && (
            <div>
              <div
                className="micro pb-2"
                style={{ borderBottom: "1px solid var(--rule)" }}
              >
                You&rsquo;ll need
              </div>
              <ul
                className="m-0 mt-3 grid list-none grid-cols-1 gap-x-panel gap-y-tight p-0 text-note sm:grid-cols-2"
                style={{
                  fontFamily: "var(--font-serif)",
                  color: "var(--tx3)",
                }}
              >
                {needs.map((need, i) => (
                  <li key={i}>{need}</li>
                ))}
              </ul>
            </div>
          )}
        </header>

        {/* One stack, one rhythm. Every top-level block on a lesson — an
            opening passage, an aside, a section, the quiz — sits 52px from
            its neighbour. Without this wrapper the sections spaced themselves
            and everything else butted together, which read as random. */}
        <div className="lesson-stack flex flex-col gap-[52px]">{children}</div>

        <NavFooter previousPage={previousPage} nextPage={nextPage} />
      </article>
    </div>
  );
}
