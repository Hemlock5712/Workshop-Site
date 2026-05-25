import { ReactNode } from "react";

/**
 * Variant retained for backwards-compatibility with the dozen-or-so call
 * sites that still set it; the engineering reskin no longer paints
 * cards with tinted backgrounds (color signaling is what Box/alert
 * variants are for). `primary` and `concept` now add a subtle left
 * stripe instead of a wash; `default` is the neutral module surface.
 */
type ContentCardVariant = "default" | "primary" | "concept";

interface ContentCardProps {
  children: ReactNode;
  variant?: ContentCardVariant;
  className?: string;
  /**
   * Optional mono "module-tag" rendered in the top-left corner — like
   * "STEP · 02" or "HARDWARE · TALONFX". Triggers the module padding
   * adjustment so the tag has somewhere to live.
   */
  tag?: string;
  /**
   * Optional mono spec line rendered in the top-right corner — used
   * for terse readouts like "target = 90.0° · sample = 5ms".
   */
  spec?: string;
}

const variantStripe: Record<ContentCardVariant, string | null> = {
  default: null,
  primary: "var(--primary-lifted)",
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
  const padding = tag ? "pt-9 pb-5 px-5" : "p-5";

  return (
    <div
      className={`module relative ${padding} ${className}`}
      style={
        stripe
          ? {
              borderLeftWidth: 3,
              borderLeftColor: stripe,
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
