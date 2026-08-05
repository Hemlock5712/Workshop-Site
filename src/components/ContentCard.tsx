import { ReactNode } from "react";

/**
 * A framed block of related content — a step, a spec, a small table of facts.
 *
 * `variant` survives from the previous design where it painted tinted
 * backgrounds. It now only chooses which hue the left rule takes, and
 * `default` has none. Colour on this site carries one meaning (accent = the
 * thing to act on) and a card is not that.
 */
type ContentCardVariant = "default" | "primary" | "concept";

interface ContentCardProps {
  children: ReactNode;
  variant?: ContentCardVariant;
  className?: string;
  /**
   * Mono corner label — "STEP · 02", "HARDWARE · TALONFX". Adds top padding
   * so the tag has somewhere to sit.
   */
  tag?: string;
  /** Mono readout in the top-right — "target = 90.0° · sample = 5 ms". */
  spec?: string;
}

const variantStripe: Record<ContentCardVariant, string | null> = {
  default: null,
  primary: "var(--lift)",
  concept: "var(--accent)",
};

export default function ContentCard({
  children,
  variant = "default",
  className = "",
  tag,
  spec,
}: ContentCardProps) {
  const stripe = variantStripe[variant];

  return (
    <div
      // The inset comes from `.module` now. Only the tagged form overrides it,
      // and only at the top, where the `.module-tag` sits in the corner.
      className={`module relative ${tag ? "pt-9" : ""} ${className}`.trim()}
      style={
        stripe
          ? {
              borderLeftWidth: 3,
              borderLeftColor: stripe,
              // Back the left inset off by the 2px the stripe adds over a
              // 1px border, so the text lands on the panel edge every other
              // panel's text lands on.
              paddingLeft: "calc(var(--spacing-pad) - 2px)",
            }
          : undefined
      }
    >
      {tag && <span className="module-tag">{tag}</span>}
      {spec && <span className="module-spec">{spec}</span>}
      {children}
    </div>
  );
}
