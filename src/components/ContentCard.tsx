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
      className={`module relative ${tag ? "px-5 pb-5 pt-9" : "p-5"} ${className}`.trim()}
      style={
        stripe ? { borderLeftWidth: 3, borderLeftColor: stripe } : undefined
      }
    >
      {tag && <span className="module-tag">{tag}</span>}
      {spec && <span className="module-spec">{spec}</span>}
      {children}
    </div>
  );
}
