"use client";

/**
 * ⌘K / Ctrl-K palette. Opened from the topbar button, the keyboard, or
 * anything else that calls `openSearch()` on the shell context.
 *
 * A result row is a lesson with the sections inside it that matched. The
 * index is built per `<LessonSection>`, so "kP" comes back as "14 · PID
 * Control" with "The six numbers, and what each one is measured in" under it,
 * and selecting that row lands on the anchor rather than the top of a
 * 20,000-character page.
 */

import type { Route } from "next";
import { useEffect, useState } from "react";
import type MiniSearch from "minisearch";
import { useRouter } from "next/navigation";
import { Command } from "cmdk";
import { Search } from "lucide-react";
import {
  getSearchInstance,
  groupBySlug,
  searchIndex,
  type GroupedResult,
} from "@/lib/searchConfig";
import type { SearchDoc } from "@/lib/searchSchema";
import { useShell } from "@/contexts/ShellContext";
import { useProgress } from "@/lib/useProgress";

const microLabel = {
  fontSize: 9.5,
  letterSpacing: "0.12em",
  textTransform: "uppercase",
} as const;

/** Lessons shown at once. Each contributes up to three matching sections. */
const MAX_LESSONS = 6;

export default function SearchPalette() {
  const router = useRouter();
  const { searchOpen, closeSearch } = useShell();
  const { completed } = useProgress();
  const [query, setQuery] = useState("");
  const [groups, setGroups] = useState<GroupedResult[]>([]);
  const [instance, setInstance] = useState<MiniSearch<SearchDoc> | null>(null);

  // Fetch the index the first time the palette is opened, not on mount — most
  // sessions never search, and this way they never pay for it.
  useEffect(() => {
    if (searchOpen && !instance) {
      getSearchInstance()
        .then(setInstance)
        .catch((error) => console.error("Search unavailable:", error));
    }
    if (!searchOpen) {
      setQuery("");
      setGroups([]);
    }
  }, [searchOpen, instance]);

  useEffect(() => {
    if (!instance) return;
    const trimmed = query.trim();
    if (trimmed.length > 1) {
      setGroups(
        groupBySlug(searchIndex(instance, trimmed)).slice(0, MAX_LESSONS)
      );
    } else {
      setGroups([]);
    }
  }, [query, instance]);

  if (!searchOpen) return null;

  const go = (url: Route) => {
    router.push(url);
    closeSearch();
  };

  const trimmed = query.trim();
  const searching = trimmed.length > 1;
  const hitCount = groups.reduce(
    (total, group) => total + group.hits.length,
    0
  );

  return (
    <div
      className="fixed inset-0 z-[80] flex justify-center px-6 pb-6 pt-[11vh]"
      role="dialog"
      aria-modal="true"
      aria-label="Search the workshop"
    >
      <button
        type="button"
        onClick={closeSearch}
        aria-label="Close search"
        className="absolute inset-0 cursor-default"
        style={{
          background: "oklch(0.1 0.03 265 / 0.66)",
          backdropFilter: "blur(4px)",
        }}
      />

      <div
        className="relative flex w-[min(680px,100%)] flex-col overflow-hidden rounded-lg"
        style={{
          maxHeight: "74vh",
          border: "1px solid var(--rule)",
          background: "var(--bg2)",
          boxShadow: "0 40px 90px -30px oklch(0.05 0.03 265 / 0.85)",
          animation: "rise 0.18s ease-out",
        }}
      >
        <Command label="Search the Gray Matter Workshop" shouldFilter={false}>
          <label
            className="flex items-center gap-3.5 px-[22px] py-[18px]"
            style={{ borderBottom: "1px solid var(--rule-soft)" }}
          >
            <Search
              size={19}
              aria-hidden="true"
              style={{ color: "var(--accent)" }}
              className="shrink-0"
            />
            <Command.Input
              value={query}
              onValueChange={setQuery}
              autoFocus
              placeholder="Search lessons, mechanisms, gains…"
              className="min-w-0 flex-1 border-0 bg-transparent text-[17px] outline-none"
              style={{ color: "var(--tx)" }}
            />
            <span
              className="mono shrink-0 whitespace-nowrap rounded-[3px] px-[7px] py-[3px]"
              style={{
                fontSize: 9.5,
                letterSpacing: "0.1em",
                color: "var(--tx3)",
                border: "1px solid var(--rule)",
              }}
            >
              ESC
            </span>
          </label>

          <Command.List className="flex-1 overflow-y-auto px-3 py-2.5">
            {searching && groups.length === 0 && (
              <Command.Empty className="px-3.5 py-[34px] text-center">
                <div
                  className="display mb-2"
                  style={{ fontSize: 26, lineHeight: 1.2, color: "var(--tx2)" }}
                >
                  Nothing matches that yet
                </div>
                <div
                  style={{
                    fontFamily: "var(--font-serif)",
                    fontSize: 16,
                    lineHeight: 1.5,
                    color: "var(--tx3)",
                  }}
                >
                  Try a mechanism (arm, flywheel, swerve), a concept (PID,
                  odometry, AprilTag), or a gain name.
                </div>
              </Command.Empty>
            )}

            {!searching && (
              <div
                className="px-3.5 py-[34px] text-center"
                style={{
                  fontFamily: "var(--font-serif)",
                  fontSize: 16,
                  lineHeight: 1.5,
                  color: "var(--tx3)",
                }}
              >
                Start typing. Two letters is enough.
              </div>
            )}

            {groups.map((group) => {
              const done = completed.has(group.slug);
              const context = group.section
                ? group.sectionNum
                  ? `${group.sectionNum} · ${group.section}`
                  : group.section
                : "";

              return (
                <div key={group.slug} className="mb-1.5">
                  {/* The lesson is the heading; its matching sections below are
                      what you actually navigate to. */}
                  <div className="flex items-center gap-4 px-3.5 pb-1 pt-2.5">
                    <span
                      className="mono tabular w-[22px] shrink-0"
                      style={{
                        fontSize: 10,
                        letterSpacing: "0.08em",
                        color: group.lessonNum ? "var(--accent)" : "var(--tx3)",
                      }}
                    >
                      {group.lessonNum || "··"}
                    </span>
                    <span
                      className="truncate"
                      style={{
                        fontFamily: "var(--font-serif)",
                        fontSize: 17,
                        lineHeight: 1.2,
                        color: "var(--tx)",
                      }}
                    >
                      {group.title}
                    </span>
                    {context && (
                      <span
                        className="mono hidden shrink-0 truncate sm:inline"
                        style={{ ...microLabel, color: "var(--tx3)" }}
                      >
                        {context}
                      </span>
                    )}
                    {done && (
                      <span
                        className="mono ml-auto shrink-0"
                        style={{ ...microLabel, color: "var(--accent)" }}
                      >
                        done
                      </span>
                    )}
                  </div>

                  {group.hits.map((hit) => (
                    <Command.Item
                      key={hit.id}
                      value={hit.id}
                      onSelect={() => go(hit.url)}
                      className="ml-[38px] flex cursor-pointer items-center gap-2.5 rounded-[5px] px-3.5 py-[7px] aria-selected:bg-[var(--accent-soft)]"
                      style={{ borderLeft: "1px solid var(--rule-soft)" }}
                    >
                      <span
                        className="min-w-0 flex-1 truncate"
                        style={{
                          fontFamily: "var(--font-serif)",
                          fontSize: 15,
                          lineHeight: 1.3,
                          color: "var(--tx2)",
                        }}
                      >
                        {/* An intro doc has no heading — it is the page opening. */}
                        {hit.heading || "Opening"}
                      </span>
                      {hit.anchor && (
                        <span
                          className="mono shrink-0"
                          style={{ ...microLabel, color: "var(--tx3)" }}
                          aria-hidden="true"
                        >
                          #
                        </span>
                      )}
                    </Command.Item>
                  ))}
                </div>
              );
            })}

            {searching && (
              <Command.Item
                value="__all_results__"
                onSelect={() => go(`/search?q=${encodeURIComponent(trimmed)}`)}
                className="mt-1 flex cursor-pointer items-center gap-4 rounded-[5px] px-3.5 py-[11px] aria-selected:bg-[var(--accent-soft)]"
                style={{
                  borderTop: "1px solid var(--rule-soft)",
                  fontFamily: "var(--font-serif)",
                  fontSize: 16,
                  color: "var(--tx2)",
                }}
              >
                <span className="mono w-[22px] shrink-0 text-center">→</span>
                Open the full search page for “{trimmed}”
              </Command.Item>
            )}
          </Command.List>

          <div
            className="flex items-center gap-[18px] px-[22px] py-[11px]"
            style={{
              borderTop: "1px solid var(--rule-soft)",
              background: "var(--bg)",
            }}
          >
            <span
              className="mono hidden sm:inline"
              style={{ ...microLabel, color: "var(--tx3)" }}
            >
              ↑↓ move
            </span>
            <span
              className="mono hidden sm:inline"
              style={{ ...microLabel, color: "var(--tx3)" }}
            >
              ↵ open
            </span>
            <span
              className="mono ml-auto"
              style={{ ...microLabel, color: "var(--accent)" }}
            >
              {searching
                ? `${hitCount} ${hitCount === 1 ? "section" : "sections"}`
                : "Type to search"}
            </span>
          </div>
        </Command>
      </div>
    </div>
  );
}
