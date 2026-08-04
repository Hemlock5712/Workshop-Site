import type { ReactNode } from "react";

interface LessonSectionProps {
  /**
   * Anchor id. Also what the on-this-page outline links to, so it has to be
   * stable — it ends up in URLs students paste into Discord.
   */
  id: string;
  /**
   * Heading. A plain string doubles as the outline label; anything with markup
   * in it (a heading naming a method in `<code>`) needs `outlineLabel` too,
   * because the outline rail is plain text.
   */
  title: ReactNode;
  /** Plain-text label for the outline rail. Required when `title` isn't a string. */
  outlineLabel?: string;
  className?: string;
  children: ReactNode;
}

/**
 * One numbered step of a lesson.
 *
 * The number is a CSS counter, not a prop — see `.sec-num` in globals.css.
 * The rule running off to the right is what makes a long lesson scannable at
 * a scroll: the eye catches the horizontal breaks and reads them as chapters.
 *
 * `data-sec` / `data-sec-label` are how `LessonOutline` finds sections. Any
 * section rendered through this component appears in the outline automatically.
 */
export default function LessonSection({
  id,
  title,
  outlineLabel,
  className = "",
  children,
}: LessonSectionProps) {
  const label = outlineLabel ?? (typeof title === "string" ? title : undefined);

  return (
    <section
      id={id}
      data-sec={id}
      data-sec-label={label}
      // No bottom margin: the gap between sections belongs to the parent
      // stack in `PageTemplate`, so a section and an aside are spaced the
      // same way rather than one of them setting its own rhythm.
      className={`scroll-mt-24 ${className}`.trim()}
    >
      <div className="measure-wide mb-[26px] flex items-baseline gap-4">
        <span
          className="mono sec-num tabular shrink-0 text-micro"
          style={{
            letterSpacing: "0.14em",
            color: "var(--accent)",
          }}
          aria-hidden="true"
        />
        {/* `min-w-0` so the heading can shrink: it is a flex item, flex items
            default to `min-width: auto`, and a title like "Step 2 — Add
            LimelightHelpers.java" has a min-content width wider than a phone.
            The `overflow-wrap: break-word` in globals.css is deliberately the
            variant that does *not* shrink intrinsic size, so without this the
            row stayed at min-content and pushed /vision-implementation 37px
            past the viewport. */}
        <h2 className="display-section m-0 min-w-0">{title}</h2>
        <span
          aria-hidden="true"
          className="h-px flex-1"
          style={{ background: "var(--rule-soft)" }}
        />
      </div>
      <div className="lesson-stack flex flex-col gap-[26px]">{children}</div>
    </section>
  );
}
