import { ReactNode } from "react";
import { cn } from "@/lib/utils";

export type BoxVariant =
  | "concept" // Framed panel — a definition or a rule worth stopping on
  | "alert-warning" // Where people get burned
  | "alert-info" // Context you need but wouldn't guess
  | "alert-tip" // A shortcut, not a requirement
  | "alert-success" // "You should now see…" — the check after a step
  | "alert-danger"; // Do not do this

interface BoxProps {
  variant: BoxVariant;
  title?: ReactNode;
  subtitle?: ReactNode;
  children: ReactNode;
  className?: string;
  /**
   * The mono label down the left. Defaults per variant ("WATCH OUT", "NOTE",
   * …). Free-form, so a page can say "WATCH OUT · WINDUP".
   */
  tag?: string;
  // Concept variant only
  code?: ReactNode;
  uses?: ReactNode;
  /**
   * Concept variant only. Drops the body back to `--text-aside` for a Box
   * used as a cell in a multi-column comparison row, where the column is
   * ~300px and the reading size would be four words a line.
   *
   * A concept Box in the reading column is *not* compact: it is a paragraph
   * a student reads, at the width they read everything else at, so it gets
   * `--text-body` like the rest of the column. The site had this backwards —
   * all 39 full-measure Boxes rendered at the six comparison cells' size.
   */
  compact?: boolean;
}

/**
 * Asides.
 *
 * These used to be tinted cards — a yellow wash for warnings, blue for info,
 * green for success. On a page with six of them the colour stopped carrying
 * information and started reading as decoration, which is exactly how a real
 * warning gets skipped.
 *
 * The form now is the one the design uses throughout: a right-aligned mono
 * label, a vertical rule, and the text. The label says what kind of aside it
 * is in words. Colour is used once — accent on the label — and only the
 * danger variant departs from it, because "do not do this" is the one case
 * where a second signal earns its keep.
 *
 * `concept` keeps a frame, because it is a thing you come back to rather than
 * something you read past.
 */

const VARIANT_META: Record<
  Exclude<BoxVariant, "concept">,
  { label: string; color: string }
> = {
  "alert-warning": { label: "Watch\nout", color: "var(--accent)" },
  "alert-info": { label: "Note", color: "var(--accent)" },
  "alert-tip": { label: "Tip", color: "var(--accent)" },
  "alert-success": { label: "Check", color: "var(--ok)" },
  "alert-danger": { label: "Don't", color: "var(--err)" },
};

export default function Box({
  variant,
  title,
  subtitle,
  children,
  className,
  tag,
  code,
  uses,
  compact = false,
}: BoxProps) {
  if (variant !== "concept") {
    const meta = VARIANT_META[variant];
    return (
      <div
        // One column on a phone. The two-track form spends 72px on the label,
        // 20px on the gap and 20px on the text inset — 113px of a 310px
        // column, which left the text at 22-25 characters a line while the
        // prose beside it ran at 36. The warnings were narrower than the page
        // they interrupt, which is backwards: an aside a student is meant to
        // absorb in one pass should not be the hardest thing to read. Below
        // `sm` the label sits above the rule instead of beside it, and the
        // text gets the full measure less its own inset (~33 characters).
        className={cn(
          "measure grid grid-cols-1 gap-2 sm:grid-cols-[96px_minmax(0,1fr)] sm:gap-6",
          className
        )}
        role="note"
      >
        <div
          className="mono pt-chip text-left text-micro sm:text-right"
          style={{
            letterSpacing: "0.13em",
            textTransform: "uppercase",
            color: meta.color,
            whiteSpace: "pre-line",
          }}
        >
          {tag ?? meta.label}
        </div>
        <div
          className="lesson-prose pl-5 text-aside sm:pl-6"
          style={{
            borderLeft: `1px solid ${
              variant === "alert-danger" ? "var(--err)" : "var(--rule)"
            }`,
            fontFamily: "var(--font-serif)",
            color: "var(--tx2)",
          }}
        >
          {title && (
            <p
              className="m-0 mb-1.5 font-semibold"
              style={{ color: "var(--tx)" }}
            >
              {title}
            </p>
          )}
          {subtitle && (
            <p className="m-0 mb-1.5" style={{ color: "var(--tx)" }}>
              {subtitle}
            </p>
          )}
          {children}
        </div>
      </div>
    );
  }

  // Concept — a framed panel. Used for definitions and the rules a lesson
  // keeps referring back to.
  return (
    <div
      // `min-w-0` for the reason spelled out on `.lesson-stack > *`: a concept
      // Box is usually a grid child, grid children default to `min-width:
      // auto`, and the code slot below holds identifiers like
      // `MotionMagicCruiseVelocity` whose min-content width is wider than a
      // phone. Without this the Box refused to shrink and pushed
      // /motion-magic 72px past the viewport instead of letting the code
      // slot's own `overflow-x: auto` scroll.
      className={cn("measure flex min-w-0 flex-col gap-3 p-pad", className)}
      style={{
        background: "var(--bg2)",
        border: "1px solid var(--rule)",
        borderLeft: "3px solid var(--accent)",
        borderRadius: 3,
        // The one panel inset is `--spacing-pad`, and it is measured to the
        // *text*, not to the box. This Box's accent bar is 3px where every
        // other panel's border is 1px, so without the 2px back-off its
        // heading sat two pixels right of a `.module`'s heading — the same
        // class of near-miss the 447/448/449 triple was.
        paddingLeft: "calc(var(--spacing-pad) - 2px)",
      }}
    >
      {tag && (
        <div className="micro" style={{ color: "var(--accent)" }}>
          {tag}
        </div>
      )}
      {/* `h3`, not `h4`. A concept Box sits inside a `LessonSection`, whose
          heading is the `h2` — so `h4` skipped a level, and it did it on
          nearly every lesson: `/pid-control`, `/adding-commands` and
          `/swerve-calibration` all rendered `h1 h2 … h4` with nothing in
          between. Heading navigation is how a screen-reader user reads a
          20,000-character page without listening to all of it. */}
      {title && (
        <h3 className="display m-0 text-lede" style={{ color: "var(--tx)" }}>
          {title}
        </h3>
      )}
      {subtitle && (
        <p className="m-0 font-semibold text-ui" style={{ color: "var(--tx)" }}>
          {subtitle}
        </p>
      )}
      <div
        className={`lesson-prose flex-1 ${compact ? "text-aside" : "text-body"}`}
        style={{
          fontFamily: "var(--font-serif)",
          color: "var(--tx2)",
        }}
      >
        {children}
      </div>
      {code && (
        <div
          className="mono p-3 text-meta"
          style={{
            background: "var(--code-bg)",
            border: "1px solid var(--rule)",
            borderRadius: 2,
            color: "var(--code-tx)",
            overflowX: "auto",
          }}
        >
          {code}
        </div>
      )}
      {uses && (
        <div className="text-note" style={{ color: "var(--tx)" }}>
          <span className="micro">When to use</span>
          <div
            className="mt-1 text-aside"
            style={{
              fontFamily: "var(--font-serif)",
              color: "var(--tx2)",
            }}
          >
            {uses}
          </div>
        </div>
      )}
    </div>
  );
}
