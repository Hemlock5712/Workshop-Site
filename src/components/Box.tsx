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
  /** Accepted and ignored — the label carries the signal now. See below. */
  icon?: ReactNode;
  className?: string;
  /**
   * The mono label down the left. Defaults per variant ("WATCH OUT", "NOTE",
   * …). Free-form, so a page can say "WATCH OUT · WINDUP".
   */
  tag?: string;
  // Concept variant only
  code?: ReactNode;
  uses?: ReactNode;
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
}: BoxProps) {
  if (variant !== "concept") {
    const meta = VARIANT_META[variant];
    return (
      <div
        className={cn(
          "measure grid grid-cols-[72px_1fr] gap-5 sm:grid-cols-[96px_1fr] sm:gap-6",
          className
        )}
        role="note"
      >
        <div
          className="mono pt-[5px] text-right"
          style={{
            fontSize: 9.5,
            letterSpacing: "0.13em",
            textTransform: "uppercase",
            color: meta.color,
            lineHeight: 1.5,
            whiteSpace: "pre-line",
          }}
        >
          {tag ?? meta.label}
        </div>
        <div
          className="lesson-prose pl-5 sm:pl-6"
          style={{
            borderLeft: `1px solid ${
              variant === "alert-danger" ? "var(--err)" : "var(--rule)"
            }`,
            fontFamily: "var(--font-serif)",
            fontSize: 17,
            lineHeight: 1.65,
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
      className={cn("measure flex flex-col gap-3 p-6", className)}
      style={{
        background: "var(--bg2)",
        border: "1px solid var(--rule)",
        borderLeft: "3px solid var(--accent)",
        borderRadius: 3,
      }}
    >
      {tag && (
        <div
          className="mono"
          style={{
            fontSize: 9.5,
            letterSpacing: "0.14em",
            textTransform: "uppercase",
            color: "var(--accent)",
          }}
        >
          {tag}
        </div>
      )}
      {title && (
        <h4
          className="display m-0"
          style={{ fontSize: 22, lineHeight: 1.15, color: "var(--tx)" }}
        >
          {title}
        </h4>
      )}
      {subtitle && (
        <p
          className="m-0 font-semibold"
          style={{ fontSize: 15, color: "var(--tx)" }}
        >
          {subtitle}
        </p>
      )}
      <div
        className="lesson-prose flex-1"
        style={{
          fontFamily: "var(--font-serif)",
          fontSize: 16.5,
          lineHeight: 1.6,
          color: "var(--tx2)",
        }}
      >
        {children}
      </div>
      {code && (
        <div
          className="mono p-3"
          style={{
            fontSize: 12.5,
            background: "#030718",
            border: "1px solid var(--rule)",
            borderRadius: 2,
            color: "#dadee5",
            overflowX: "auto",
          }}
        >
          {code}
        </div>
      )}
      {uses && (
        <div style={{ fontSize: 14, color: "var(--tx)" }}>
          <span
            className="mono"
            style={{
              fontSize: 9.5,
              letterSpacing: "0.14em",
              textTransform: "uppercase",
              color: "var(--tx3)",
            }}
          >
            When to use
          </span>
          <div
            className="mt-1"
            style={{
              fontFamily: "var(--font-serif)",
              fontSize: 16,
              lineHeight: 1.6,
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
