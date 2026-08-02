"use client";

import { usePathname } from "next/navigation";
import { getLessonNumber } from "@/data/lessons";

/**
 * "LESSON 15" above the title.
 *
 * Client-side only because it needs the current route to find its own place in
 * the course, and because that place must come from `lessons.ts` rather than
 * being typed on the page — a hard-coded number goes stale the first time a
 * lesson is inserted above it.
 *
 * Renders nothing on routes outside `LESSONS` (glossary, search, privacy).
 */
export default function LessonKicker() {
  const pathname = usePathname();
  const num = getLessonNumber(pathname);
  if (!num) return null;

  return (
    <div
      className="mono mb-[18px]"
      style={{
        fontSize: 11,
        letterSpacing: "0.16em",
        color: "var(--accent)",
      }}
    >
      LESSON {num}
    </div>
  );
}
