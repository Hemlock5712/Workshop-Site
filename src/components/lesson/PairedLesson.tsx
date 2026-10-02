import Link from "next/link";
import type { Route } from "next";
import { findLessonBySlug, getLessonNumber } from "@/data/lessons";

/**
 * The bridge between a Tuner X lesson and the code lesson that does the same
 * job in Java.
 *
 * Workshop 1 is entirely Tuner X and the code that repeats it is in Workshop
 * 3, so a class that wants to do it in Tuner, then do it in code, then move on
 * needs to jump between them. This is the jump: one line under the lede that
 * names the other half and links to it. Lesson number and title both come from
 * `lessons.ts`, so a renamed or reordered lesson never leaves a stale card.
 *
 *   <PairedLesson kind="code" to="/motion-magic-code" />   on a Tuner page
 *   <PairedLesson kind="tuner" to="/motion-magic" />       on a code page
 */
export default function PairedLesson({
  kind,
  to,
}: {
  kind: "tuner" | "code";
  to: Route;
}) {
  const lesson = findLessonBySlug(to);
  if (!lesson) return null;
  const num = getLessonNumber(to);
  const label = kind === "code" ? "NEXT, IN CODE" : "DONE IN TUNER X AS";

  return (
    <aside className="measure flex flex-wrap items-baseline gap-x-control gap-y-chip border-t border-b border-[var(--rule-soft)] py-tight">
      <span className="micro">{label}</span>
      <Link
        href={to}
        className="font-medium text-[var(--accent)] underline-offset-4 hover:underline"
      >
        {num ? `Lesson ${num}: ` : ""}
        {lesson.title}
      </Link>
    </aside>
  );
}
