"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { ArrowLeft, ArrowRight } from "lucide-react";
import MarkCompleteToggle from "@/components/MarkCompleteToggle";
import { getPreviousLesson, getNextLesson, type Lesson } from "@/data/lessons";

interface NavOverride {
  href: string;
  title: string;
}

interface NavFooterProps {
  /** Override the auto-derived previous link. Pass `null` to suppress. */
  previousPage?: NavOverride | null;
  /** Override the auto-derived next link. Pass `null` to suppress. */
  nextPage?: NavOverride | null;
}

function lessonToOverride(l: Lesson | null): NavOverride | null {
  if (!l) return null;
  return { href: l.slug, title: l.title };
}

/**
 * Bottom nav row for every workshop page. Reads the current pathname to
 * look up the lesson in `src/data/lessons.ts` and auto-derives Previous /
 * Next links. Pages can still pass explicit `previousPage` / `nextPage`
 * props to override (e.g. for branch-specific nav).
 */
export default function NavFooter({ previousPage, nextPage }: NavFooterProps) {
  const pathname = usePathname() ?? "";

  const prev =
    previousPage === undefined
      ? lessonToOverride(getPreviousLesson(pathname))
      : previousPage;
  const next =
    nextPage === undefined
      ? lessonToOverride(getNextLesson(pathname))
      : nextPage;

  return (
    <div className="flex flex-wrap items-center justify-between gap-4 pt-8 border-t border-[var(--border)]">
      {prev ? (
        <Link
          href={prev.href}
          className="inline-flex items-center gap-2 text-[var(--muted-foreground)] hover:text-[var(--foreground)] font-medium"
        >
          <ArrowLeft className="w-4 h-4" aria-hidden="true" />
          <span>Previous: {prev.title}</span>
        </Link>
      ) : (
        <div />
      )}

      <MarkCompleteToggle />

      {next ? (
        <Link
          href={next.href}
          className="inline-flex items-center gap-2 bg-primary-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-primary-700 transition-colors"
        >
          <span>Next: {next.title}</span>
          <ArrowRight className="w-4 h-4" aria-hidden="true" />
        </Link>
      ) : (
        <div />
      )}
    </div>
  );
}

/**
 * Top breadcrumb row — "Back to <Previous>" link. Same derivation, just
 * separated so PageTemplate can render it above the H1.
 */
export function NavBreadcrumb({
  previousPage,
}: {
  previousPage?: NavOverride | null;
}) {
  const pathname = usePathname() ?? "";
  const prev =
    previousPage === undefined
      ? lessonToOverride(getPreviousLesson(pathname))
      : previousPage;
  if (!prev) return null;
  return (
    <div className="mb-8">
      <Link
        href={prev.href}
        className="inline-flex items-center gap-2 text-primary-600 hover:text-primary-800 font-medium dark:text-primary-400 dark:hover:text-primary-300"
      >
        <ArrowLeft className="w-4 h-4" aria-hidden="true" />
        <span>Back to {prev.title}</span>
      </Link>
    </div>
  );
}
