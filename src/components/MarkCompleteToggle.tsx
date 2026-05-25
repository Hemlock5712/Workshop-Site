"use client";

import { Check, Circle } from "lucide-react";
import { usePathname } from "next/navigation";
import { useProgress } from "@/lib/useProgress";

/**
 * Per-page "Mark complete" toggle that lives in the prev/next nav row.
 * Reads its slug from the current pathname so PageTemplate doesn't need
 * to thread an extra prop through every workshop page.
 */
export default function MarkCompleteToggle() {
  const pathname = usePathname();
  const { isCompleted, toggleComplete } = useProgress();

  // SSR-safe: usePathname returns null in some edge cases; bail out silently.
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
      className="inline-flex items-center gap-2 rounded-md border px-3 py-1.5 text-sm font-medium transition-colors focus-visible:outline-none"
      style={{
        background: done ? "var(--accent-soft)" : "var(--bg-elev)",
        borderColor: done ? "var(--ok)" : "var(--line)",
        color: done ? "var(--ok)" : "var(--fg-mute)",
      }}
    >
      {done ? (
        <Check className="h-4 w-4" aria-hidden />
      ) : (
        <Circle className="h-4 w-4" aria-hidden />
      )}
      <span
        className="font-mono"
        style={{
          fontSize: 11,
          letterSpacing: "0.06em",
          textTransform: "uppercase",
        }}
      >
        {done ? "Completed" : "Mark complete"}
      </span>
    </button>
  );
}
