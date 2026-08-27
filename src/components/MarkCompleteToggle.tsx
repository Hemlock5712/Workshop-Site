"use client";

import { usePathname } from "next/navigation";
import { useProgress } from "@/lib/useProgress";

/**
 * Per-page "Mark complete" toggle. Reads its slug from the current pathname so
 * `PageTemplate` doesn't thread an extra prop through every workshop page.
 *
 * A pill rather than a button-with-icon: it is a state you are reporting, not
 * an action with a consequence, and it needs to sit quietly above the much
 * louder "next lesson" link without competing with it.
 */
export default function MarkCompleteToggle() {
  const pathname = usePathname();
  const { isCompleted, toggleComplete } = useProgress();

  if (!pathname) return null;

  const done = isCompleted(pathname);

  return (
    <button
      type="button"
      onClick={() => toggleComplete(pathname)}
      aria-pressed={done}
      aria-label={
        done ? "Mark this page incomplete" : "Mark this page complete"
      }
      className="mono cursor-pointer whitespace-nowrap rounded-full px-3.5 py-1.5 transition-colors"
      style={{
        fontSize: "var(--text-micro)",
        letterSpacing: "0.12em",
        textTransform: "uppercase",
        border: `1px solid ${done ? "var(--accent)" : "var(--rule)"}`,
        background: done ? "var(--accent-soft)" : "transparent",
        color: done ? "var(--accent)" : "var(--tx3)",
      }}
    >
      {done ? "✓ Completed" : "Mark complete"}
    </button>
  );
}
