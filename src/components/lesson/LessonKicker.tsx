import type { Route } from "next";
import { LESSONS, getLessonNumber } from "@/data/lessons";

/**
 * "LESSON 15" above the title.
 *
 * The number comes from `lessons.ts` rather than being typed on the page,
 * because a hard-coded number goes stale the first time a lesson is inserted
 * above it.
 *
 * A server component. It used to be a client one only so it could read the
 * pathname, which shipped a component and a router hook to number a heading.
 * A server component has no pathname, so it finds its lesson by the title
 * `PageTemplate` already holds, and every lesson title is unique. A page whose
 * title differs from its `lessons.ts` entry passes `slug` instead.
 *
 * Renders nothing on routes outside `LESSONS` (search, privacy, video).
 */
export default function LessonKicker({
  title,
  slug,
}: {
  title: string;
  slug?: Route;
}) {
  const lesson = slug ?? LESSONS.find((l) => l.title === title)?.slug;
  const num = lesson ? getLessonNumber(lesson) : null;
  if (!num) return null;

  return (
    <div
      className="mono mb-[18px]"
      style={{
        fontSize: "var(--text-meta)",
        letterSpacing: "0.16em",
        color: "var(--accent)",
      }}
    >
      LESSON {num}
    </div>
  );
}
