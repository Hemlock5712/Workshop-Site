import { ReactNode } from "react";
import { ArrowUpRight } from "lucide-react";

interface DocumentationButtonProps {
  href: string;
  title: string;
  icon?: ReactNode;
}

/**
 * Link out to vendor documentation.
 *
 * An outlined link rather than a filled button: this is a side road, and a
 * solid accent block competes with the one thing on the page that should be
 * solid accent — the link to the next lesson.
 */
export default function DocumentationButton({
  href,
  title,
  icon,
}: DocumentationButtonProps) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className="inline-flex items-center gap-2.5 px-[18px] py-2.5 text-[13px] font-medium transition-colors hover:border-[var(--accent)] hover:text-[var(--accent)]"
      style={{
        border: "1px solid var(--rule)",
        borderRadius: 2,
        background: "var(--bg2)",
        color: "var(--tx2)",
      }}
    >
      {icon && <span aria-hidden="true">{icon}</span>}
      {title}
      <ArrowUpRight className="h-4 w-4 shrink-0" aria-hidden="true" />
    </a>
  );
}
