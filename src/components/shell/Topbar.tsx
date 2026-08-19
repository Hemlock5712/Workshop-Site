"use client";

/**
 * Sticky bar across the top of the scroll container.
 *
 * Left: where you are — `Workshop / 01 Hardware & CTRE / PID Tuning`,
 * with a completion pill once the lesson is finished. On non-lesson routes it
 * degrades to the workshop wordmark.
 *
 * Right: the search affordance and the course-wide finished counter. The
 * counter is here rather than in the rail because it answers a different
 * question from the rail's spine — that one is "how far down this page", this
 * one is "how far through the course".
 */

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Search } from "lucide-react";
import { useShell } from "@/contexts/ShellContext";
import { useModifierKey } from "@/lib/useModifierKey";
import { useProgress } from "@/lib/useProgress";
import { findLessonBySlug, getSectionOf, LESSON_COUNT } from "@/data/lessons";

const microLabel = {
  fontSize: "var(--text-micro)",
  letterSpacing: "0.14em",
  textTransform: "uppercase",
} as const;

export default function Topbar() {
  const pathname = usePathname();
  const { openSearch } = useShell();
  const { completed } = useProgress();
  const { palette } = useModifierKey();

  const lesson = findLessonBySlug(pathname);
  const section = getSectionOf(pathname);
  const done = completed.has(pathname);
  const doneCount = completed.size;
  const donePct = Math.round((doneCount / LESSON_COUNT) * 100);

  return (
    <div
      // `px-4` below `sm` to match the lesson body's inset at the same size —
      // the breadcrumb sits directly above the H1, so the two have to start on
      // the same vertical.
      className="sticky top-0 z-[35] flex items-center gap-3 px-4 py-2.5 sm:px-6 lg:gap-[18px] lg:px-10"
      style={{
        background: "var(--bg)",
        borderBottom: "1px solid var(--rule-soft)",
      }}
    >
      {lesson ? (
        <span className="flex min-w-0 items-center gap-2.5">
          <Link
            href="/"
            className="mono whitespace-nowrap"
            style={{ ...microLabel, color: "var(--tx3)" }}
          >
            Workshop
          </Link>
          <span aria-hidden="true" style={{ color: "var(--tx3)" }}>
            /
          </span>
          {section && (
            <>
              <span
                className="mono hidden whitespace-nowrap xl:inline"
                style={{ ...microLabel, color: "var(--tx3)" }}
              >
                {section.num} {section.title}
              </span>
              <span
                aria-hidden="true"
                className="hidden xl:inline"
                style={{ color: "var(--tx3)" }}
              >
                /
              </span>
            </>
          )}
          <span
            className="mono truncate"
            style={{ ...microLabel, color: "var(--tx)" }}
          >
            {lesson.title}
          </span>
          {done && (
            <span
              className="mono shrink-0 whitespace-nowrap rounded-full px-2 py-0.5"
              style={{
                fontSize: "var(--text-micro)",
                letterSpacing: "0.12em",
                textTransform: "uppercase",
                background: "var(--accent-soft)",
                color: "var(--accent)",
                animation: "rise 0.3s ease-out",
              }}
            >
              ✓ complete
            </span>
          )}
        </span>
      ) : (
        <span
          className="mono truncate"
          style={{ ...microLabel, color: "var(--tx3)" }}
        >
          FRC 5712 · Coding Workshop
        </span>
      )}

      <button
        type="button"
        onClick={openSearch}
        title={`Search the workshop: ${palette}`}
        // `min-w-0` and no floor on the width: the rail already takes 70px, so
        // at a 360px viewport this button and the breadcrumb are sharing a
        // 290px column. A `min-w-[150px]` here pushed the bar wider than the
        // page and the whole lesson scrolled sideways.
        className="ml-auto flex min-w-0 shrink-0 items-center gap-2.5 rounded-[4px] px-3 py-[7px] transition-colors hover:border-[var(--accent)] hover:text-[var(--tx2)] sm:max-w-[330px] sm:flex-1 sm:shrink"
        style={{
          border: "1px solid var(--rule)",
          background: "var(--bg2)",
          color: "var(--tx3)",
        }}
      >
        <Search size={15} aria-hidden="true" className="shrink-0" />
        <span className="hidden truncate text-note sm:inline">
          Search lessons
        </span>
        <span
          className="mono ml-auto hidden shrink-0 whitespace-nowrap rounded-[3px] px-[5px] py-px md:inline"
          style={{
            fontSize: "var(--text-micro)",
            letterSpacing: "0.08em",
            border: "1px solid var(--rule)",
          }}
        >
          {palette}
        </span>
      </button>

      <span
        title="Lessons you have finished"
        className="hidden shrink-0 items-center gap-2.5 whitespace-nowrap md:flex"
      >
        <span
          className="hidden h-[3px] w-14 overflow-hidden rounded-sm lg:block"
          style={{ background: "var(--rule-soft)" }}
          aria-hidden="true"
        >
          {/* `scaleX` rather than `width` — off the layout path, same result.
              See the matching fill in `CurriculumDrawer`. */}
          <span
            className="block h-full w-full origin-left"
            style={{
              transform: `scaleX(${donePct / 100})`,
              background: "var(--accent)",
              transition: "transform 0.45s cubic-bezier(0.2,0.7,0.3,1)",
            }}
          />
        </span>
        <span
          className="mono"
          style={{
            fontSize: "var(--text-micro)",
            letterSpacing: "0.12em",
            textTransform: "uppercase",
            color: "var(--tx3)",
          }}
        >
          <span style={{ color: "var(--accent)" }}>
            {String(doneCount).padStart(2, "0")}
          </span>{" "}
          / {LESSON_COUNT} finished
        </span>
      </span>
    </div>
  );
}
