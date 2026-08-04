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
      // `max-w-full` plus `flex-wrap`: an `inline-flex` row does not wrap, so a
      // long vendor title plus the 16px arrow plus 18px of padding each side
      // added up to more than the 272px a 390px phone leaves, and the arrow
      // hung 3px off the side of the page. Wrapping is the graceful failure.
      className="inline-flex max-w-full flex-wrap items-center gap-2.5 px-[18px] py-2.5 text-note font-medium transition-colors hover:border-[var(--accent)] hover:text-[var(--accent)]"
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
