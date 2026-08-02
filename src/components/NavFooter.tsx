"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import MarkCompleteToggle from "@/components/MarkCompleteToggle";
import { useProgress } from "@/lib/useProgress";
import {
  getPreviousLesson,
  getNextLesson,
  getLessonNumber,
  type Lesson,
} from "@/data/lessons";

interface NavOverride {
  href: string;
  title: string;
  /** Course position, zero-padded. Derived when the link comes from LESSONS. */
  num?: string;
}

interface NavFooterProps {
  previousPage?: NavOverride | null;
  nextPage?: NavOverride | null;
}

function lessonToOverride(lesson: Lesson | null): NavOverride | null {
  if (!lesson) return null;
  return {
    href: lesson.slug,
    title: lesson.title,
    num: getLessonNumber(lesson.slug) ?? undefined,
  };
}

/**
 * The bottom of a lesson: mark-complete, then where to go next.
 *
 * Two halves split by a hairline, no boxes. Forward gets the accent label and
 * the right-hand side; back is present but quiet. Advancing also marks the
 * lesson complete — a student who read to the end and clicked "next" has
 * already told you they're done, and asking them to press a second button is
 * a checkbox for its own sake. The explicit toggle stays for the other cases:
 * skipping a lesson, or un-marking one you want to redo.
 */
export default function NavFooter({ previousPage, nextPage }: NavFooterProps) {
  const pathname = usePathname() ?? "";
  const { isCompleted, markComplete } = useProgress();

  const prev =
    previousPage === undefined
      ? lessonToOverride(getPreviousLesson(pathname))
      : previousPage;
  const next =
    nextPage === undefined
      ? lessonToOverride(getNextLesson(pathname))
      : nextPage;

  if (!prev && !next) return null;

  const done = isCompleted(pathname);

  return (
    <div className="measure-wide mt-16">
      <div className="mb-6 flex justify-start">
        <MarkCompleteToggle />
      </div>

      <nav
        aria-label="Lesson navigation"
        className="grid grid-cols-1 sm:grid-cols-2"
        style={{ borderTop: "1px solid var(--rule)" }}
      >
        {prev ? (
          <Link
            href={prev.href}
            className="flex flex-col gap-2 py-[26px] pr-7 transition-colors hover:text-[var(--accent)]"
            style={{ color: "var(--tx)" }}
          >
            <span className="micro">
              ← {prev.num ? `Lesson ${prev.num}` : "Previous"}
            </span>
            <span className="display" style={{ fontSize: 27, lineHeight: 1.1 }}>
              {prev.title}
            </span>
          </Link>
        ) : (
          <span aria-hidden="true" />
        )}

        {next ? (
          <Link
            href={next.href}
            onClick={() => markComplete(pathname)}
            className="flex flex-col items-start gap-2 py-[26px] transition-colors hover:text-[var(--accent)] sm:items-end sm:border-l sm:pl-7 sm:text-right"
            style={{
              color: "var(--tx)",
              borderLeftColor: "var(--rule-soft)",
            }}
          >
            <span className="micro" style={{ color: "var(--accent)" }}>
              {next.num ? `Lesson ${next.num}` : "Next"} →
            </span>
            <span className="display" style={{ fontSize: 27, lineHeight: 1.1 }}>
              {next.title}
            </span>
            <span
              className="mono mt-[3px]"
              style={{
                fontSize: 9,
                letterSpacing: "0.12em",
                textTransform: "uppercase",
                color: done ? "var(--accent)" : "var(--tx3)",
              }}
            >
              {done
                ? "This lesson is marked complete"
                : "Continuing marks this lesson complete"}
            </span>
          </Link>
        ) : (
          <span aria-hidden="true" />
        )}
      </nav>
    </div>
  );
}
