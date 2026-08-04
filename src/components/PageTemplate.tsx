import type { ReactNode } from "react";
import NavFooter, { type NavOverride } from "@/components/NavFooter";
import LessonOutline from "@/components/lesson/LessonOutline";
import LessonKicker from "@/components/lesson/LessonKicker";

interface PageTemplateProps {
  /**
   * The lesson's title, as a sentence. Long is fine — this is the display
   * line, set at up to 74px, and "Tell the arm where to go, not how hard to
   * push" teaches more than "PID Control" does.
   */
  title: string;
  /**
   * Optional italic phrase inside the title, set in the accent colour. Pass
   * the exact substring of `title` to lift; ignored if it isn't found.
   */
  emphasis?: string;
  /** One paragraph, directly under the title. What this lesson is for. */
  lede?: ReactNode;
  /**
   * The "You'll need" panel beside the title: what has to be true before a
   * student starts. Anything physical goes last and in full text — a student
   * who reads this on the bus needs to know the arm has to be on a bench.
   */
  needs?: ReactNode[];
  /** Workshop-Code branch this lesson is written against, e.g. `3-PID`. */
  branch?: string;
  /** Honest time estimate, shown in the outline rail. */
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
 * The frame every lesson renders into: outline rail on the left, article in
 * the middle, prev/next at the bottom.
 *
 * The article is `--measure` wide plus a `--gutter` margin rail. Body copy
 * never crosses into the rail; code blocks, tables and figures may. That
 * asymmetry is the whole layout — prose stays at a readable line length while
 * the things that genuinely need width get it.
 */
export default function PageTemplate({
  title,
  emphasis,
  lede,
  needs,
  branch,
  time,
  previousPage,
  nextPage,
  children,
}: PageTemplateProps) {
  // Split the title around the emphasised phrase so it can be set in italic
  // accent without the page having to hand-assemble JSX for its own <h1>.
  const [before, after] =
    emphasis && title.includes(emphasis)
      ? [
          title.slice(0, title.indexOf(emphasis)),
          title.slice(title.indexOf(emphasis) + emphasis.length),
        ]
      : [title, null];

  return (
    // `minmax(0, …)` on both breakpoints is load-bearing. With a bare `auto`
    // column plus `justify-center`, the grid track sizes to max-content — so
    // the article stayed as wide as its 660px measure inside a 290px phone
    // viewport and every lesson scrolled sideways. `justify-center` only
    // applies once there are actually two tracks to centre.
    <div className="grid grid-cols-[minmax(0,1fr)] gap-14 px-6 pt-14 md:px-10 min-[1240px]:grid-cols-[184px_minmax(0,auto)] min-[1240px]:justify-center">
      <LessonOutline branch={branch} time={time} />

      <article className="lesson-body measure-wide pb-[120px]">
        <header className="split mb-[52px] items-end">
          <div>
            <LessonKicker />
            <h1
              className="display m-0 mb-[22px]"
              style={{
                fontSize: "clamp(34px, 5.4vw, 74px)",
                lineHeight: 0.96,
                letterSpacing: "-0.022em",
                textWrap: "balance",
              }}
            >
              {before}
              {after !== null && (
                <>
                  <em style={{ fontStyle: "italic", color: "var(--accent)" }}>
                    {emphasis}
                  </em>
                  {after}
                </>
              )}
            </h1>
            {lede && <p className="lesson-lede m-0">{lede}</p>}
          </div>

          {needs && needs.length > 0 && (
            <div className="pb-1.5">
              <div
                className="micro pb-2"
                style={{ borderBottom: "1px solid var(--rule)" }}
              >
                You&rsquo;ll need
              </div>
              <ul
                className="m-0 mt-3 flex list-none flex-col gap-tight p-0 text-note"
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
