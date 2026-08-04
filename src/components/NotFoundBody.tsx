"use client";

/**
 * The body of the 404, kept apart from `src/app/not-found.tsx` only because
 * the search affordance calls `openSearch()` on the shell context, and that
 * needs a client component.
 *
 * A 404 here is usually not a typo. Slugs have moved — `next.config.ts`
 * redirects three of them because they are still linked from Discord and from
 * old slides — so the useful thing to put on this page is navigation rather
 * than an apology. The four curriculum groups come from `lessons.ts`, which
 * means this page cannot drift out of date with the course.
 */

import Link from "next/link";
import { Search } from "lucide-react";
import { useShell } from "@/contexts/ShellContext";
import { useModifierKey } from "@/lib/useModifierKey";
import { getLessonGroups, getSidebarLabel, LESSON_COUNT } from "@/data/lessons";

export default function NotFoundBody() {
  const { openSearch } = useShell();
  const { palette } = useModifierKey();
  const groups = getLessonGroups();

  return (
    <div className="px-6 pb-24 pt-14 md:px-12 lg:px-[76px]">
      <div className="max-w-[660px]">
        <span className="micro">404 · no such page</span>

        <h1
          className="display mt-4"
          style={{
            fontSize: "clamp(34px, 5.2vw, 58px)",
            lineHeight: 1.0,
            letterSpacing: "-0.03em",
            textWrap: "balance",
          }}
        >
          That page moved, or never existed.
        </h1>

        <p
          className="mt-7"
          style={{
            fontFamily: "var(--font-serif)",
            fontSize: "var(--text-body)",
            lineHeight: 1.62,
            color: "var(--tx2)",
          }}
        >
          A few lesson slugs changed when the workshop was reorganised, and old
          links from Discord and from slides still point at the names they used
          to have. What you were after is almost certainly one of the{" "}
          {LESSON_COUNT} lessons below.
        </p>

        <div className="mt-9 flex flex-wrap items-center gap-4">
          <Link
            href="/"
            className="inline-flex items-center gap-2.5 whitespace-nowrap px-[22px] py-[13px] text-sm font-semibold transition-opacity hover:opacity-90"
            style={{
              borderRadius: 2,
              background: "var(--accent)",
              color: "var(--accent-ink)",
            }}
          >
            Back to the workshop
            <span aria-hidden="true">→</span>
          </Link>

          <button
            type="button"
            onClick={openSearch}
            className="inline-flex cursor-pointer items-center gap-2.5 whitespace-nowrap px-[18px] py-[13px] text-sm transition-colors hover:border-[var(--accent)] hover:text-[var(--tx)]"
            style={{
              borderRadius: 2,
              border: "1px solid var(--rule)",
              background: "var(--bg2)",
              color: "var(--tx2)",
            }}
          >
            <Search size={15} aria-hidden="true" />
            Search the lessons
            <span
              className="mono ml-1 hidden rounded-[3px] px-[5px] py-px sm:inline"
              style={{
                fontSize: "var(--text-micro)",
                letterSpacing: "0.08em",
                border: "1px solid var(--rule)",
              }}
            >
              {palette}
            </span>
          </button>
        </div>
      </div>

      <div className="mt-16 grid max-w-[920px] gap-4 sm:grid-cols-2">
        {groups.map((group) => {
          const first = group.lessons[0];
          if (!first) return null;

          return (
            <Link
              key={group.id}
              href={first.slug}
              className="flex flex-col gap-2.5 rounded-lg p-5 transition-colors hover:bg-[var(--accent-soft)]"
              style={{
                border: "1px solid var(--rule)",
                background: "var(--bg2)",
              }}
            >
              <span className="flex items-baseline gap-3">
                <span
                  className="mono shrink-0"
                  style={{
                    fontSize: "var(--text-micro)",
                    letterSpacing: "0.12em",
                    color: "var(--accent)",
                  }}
                >
                  {group.num}
                </span>
                <span
                  className="display"
                  style={{
                    fontSize: "var(--text-lede)",
                    lineHeight: 1.1,
                    color: "var(--tx)",
                  }}
                >
                  {group.title}
                </span>
                <span
                  className="mono ml-auto shrink-0 whitespace-nowrap"
                  style={{ fontSize: "var(--text-micro)", color: "var(--tx3)" }}
                >
                  {String(group.lessons.length).padStart(2, "0")} lessons
                </span>
              </span>

              <span
                style={{
                  fontFamily: "var(--font-serif)",
                  fontSize: "var(--text-aside)",
                  lineHeight: 1.55,
                  color: "var(--tx2)",
                }}
              >
                {group.blurb}
              </span>

              <span className="micro">
                Starts at {first.num} · {getSidebarLabel(first)}
              </span>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
