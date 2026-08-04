import { ReactNode } from "react";

type CollapsibleSectionVariant = "default" | "warning" | "info";

interface CollapsibleSectionProps {
  title: ReactNode;
  children: ReactNode;
  /** Kept for the existing call sites; only `warning` still changes anything. */
  variant?: CollapsibleSectionVariant;
  className?: string;
}

/**
 * Optional detail, folded away.
 *
 * Rules rather than a raised card, so a folded section reads as part of the
 * page instead of a widget dropped onto it. The marker is a mono plus/minus so
 * the affordance is unmistakable without a chevron graphic.
 *
 * `warning` gets an accent rule down the left. The other variants are visually
 * identical — the tinted blue and grey cards they used to render are gone, and
 * keeping the prop only saves editing eleven call sites for nothing.
 */
export default function CollapsibleSection({
  title,
  children,
  variant = "default",
  className = "",
}: CollapsibleSectionProps) {
  return (
    <details
      className={`measure group ${className}`.trim()}
      style={{
        borderTop: "1px solid var(--rule)",
        borderBottom: "1px solid var(--rule-soft)",
        borderLeft:
          variant === "warning" ? "2px solid var(--accent)" : undefined,
        paddingLeft: variant === "warning" ? 20 : undefined,
      }}
    >
      <summary
        className="flex cursor-pointer list-none items-baseline gap-3.5 py-4 transition-colors hover:text-[var(--accent)] [&::-webkit-details-marker]:hidden"
        style={{
          fontFamily: "var(--font-serif)",
          fontSize: "var(--text-body)",
          lineHeight: 1.3,
          color: "var(--tx)",
        }}
      >
        <span
          className="mono shrink-0"
          aria-hidden="true"
          style={{ fontSize: "var(--text-meta)", color: "var(--accent)" }}
        >
          <span className="group-open:hidden">+</span>
          <span className="hidden group-open:inline">−</span>
        </span>
        {title}
      </summary>
      <div className="lesson-prose flex flex-col gap-4 pb-6 pt-1">
        {children}
      </div>
    </details>
  );
}
