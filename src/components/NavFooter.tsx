"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import MarkCompleteToggle from "@/components/MarkCompleteToggle";
import {
  LESSONS,
  getPreviousLesson,
  getNextLesson,
  type Lesson,
} from "@/data/lessons";

interface NavOverride {
  href: string;
  title: string;
  /** Optional 1-based index shown as "NN" in the engineering label. */
  index?: number;
}

interface NavFooterProps {
  previousPage?: NavOverride | null;
  nextPage?: NavOverride | null;
}

function lessonToOverride(l: Lesson | null): NavOverride | null {
  if (!l) return null;
  const idx = LESSONS.findIndex((x) => x.slug === l.slug);
  return {
    href: l.slug,
    title: l.title,
    index: idx >= 0 ? idx + 1 : undefined,
  };
}

const padIndex = (n: number | undefined) =>
  n === undefined ? "" : String(n).padStart(2, "0");

/**
 * Bottom prev/next row. Each side renders as a wide, two-line panel
 * with a mono micro-label ("← PREVIOUS · 08") and the lesson title.
 * Next button uses the accent treatment (amber border + accent-soft
 * background) so the forward direction reads as the primary action.
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
    <div
      className="mt-10 pt-8"
      style={{ borderTop: "1px solid var(--line-soft)" }}
    >
      <div className="mb-4 flex justify-center">
        <MarkCompleteToggle />
      </div>
      <div className="grid gap-3 sm:grid-cols-2">
        {prev ? (
          <Link
            href={prev.href}
            className="group flex flex-col gap-1 rounded-md p-4 transition-colors"
            style={{
              background: "var(--bg-elev)",
              border: "1px solid var(--line)",
            }}
          >
            <span
              className="mono"
              style={{
                fontSize: 10.5,
                letterSpacing: "0.08em",
                textTransform: "uppercase",
                color: "var(--fg-dim)",
              }}
            >
              ← Previous{prev.index ? ` · ${padIndex(prev.index)}` : ""}
            </span>
            <span style={{ fontSize: 14, fontWeight: 500 }}>{prev.title}</span>
          </Link>
        ) : (
          <div />
        )}

        {next ? (
          <Link
            href={next.href}
            className="group flex flex-col items-end gap-1 rounded-md p-4 text-right transition-colors"
            style={{
              background: "var(--accent-soft)",
              border: "1px solid var(--accent)",
            }}
          >
            <span
              className="mono"
              style={{
                fontSize: 10.5,
                letterSpacing: "0.08em",
                textTransform: "uppercase",
                color: "var(--accent)",
              }}
            >
              Next{next.index ? ` · ${padIndex(next.index)}` : ""} →
            </span>
            <span style={{ fontSize: 14, fontWeight: 500 }}>{next.title}</span>
          </Link>
        ) : (
          <div />
        )}
      </div>
    </div>
  );
}
