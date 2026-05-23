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
      className={`inline-flex items-center gap-1.5 rounded-md border px-3 py-1.5 text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--primary)] focus-visible:ring-offset-2 ${
        done
          ? "border-emerald-200 bg-emerald-50 text-emerald-800 hover:bg-emerald-100 dark:border-emerald-900/60 dark:bg-emerald-950/40 dark:text-emerald-200 dark:hover:bg-emerald-950/60"
          : "border-[var(--border)] bg-[var(--muted)] text-[var(--muted-foreground)] hover:text-[var(--foreground)]"
      }`}
    >
      {done ? (
        <Check className="h-4 w-4" aria-hidden />
      ) : (
        <Circle className="h-4 w-4" aria-hidden />
      )}
      {done ? "Completed" : "Mark complete"}
    </button>
  );
}
