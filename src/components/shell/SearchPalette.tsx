"use client";

/**
 * ⌘K / Ctrl-K palette. Opened from the topbar button, the keyboard, or
 * anything else that calls `openSearch()` on the shell context.
 *
 * Search itself is unchanged — the same lazily-loaded MiniSearch index the
 * site has always used. What changed is the result row: a lesson number, the
 * title in the reading face, and the group it belongs to. A student searching
 * "kP" gets back "16 · 01 Control Fundamentals · PID Control", which tells
 * them where the answer lives in the course, not just that a page matched.
 */

import { useEffect, useState } from "react";
import type MiniSearch from "minisearch";
import { useRouter } from "next/navigation";
import { Command } from "cmdk";
import { Search } from "lucide-react";
import {
  getSearchInstance,
  mapMiniSearchResults,
  type SearchResult,
} from "@/lib/searchConfig";
import { useShell } from "@/contexts/ShellContext";
import { useProgress } from "@/lib/useProgress";
import {
  findLessonBySlug,
  getLessonNumber,
  getSectionOf,
} from "@/data/lessons";

const microLabel = {
  fontSize: 9.5,
  letterSpacing: "0.12em",
  textTransform: "uppercase",
} as const;

/** Strip a query string / hash so a search URL still matches a lesson slug. */
function toSlug(url: string): string {
  return url.split(/[?#]/)[0].replace(/\/$/, "") || "/";
}

export default function SearchPalette() {
  const router = useRouter();
  const { searchOpen, closeSearch } = useShell();
  const { completed } = useProgress();
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<SearchResult[]>([]);
  const [instance, setInstance] = useState<MiniSearch | null>(null);

  // Build the index the first time the palette is opened, not on mount — the
  // index is ~188 KB and most sessions never search.
  useEffect(() => {
    if (searchOpen && !instance) getSearchInstance().then(setInstance);
    if (!searchOpen) {
      setQuery("");
      setResults([]);
    }
  }, [searchOpen, instance]);

  useEffect(() => {
    if (!instance) return;
    const trimmed = query.trim();
    if (trimmed.length > 1) {
      setResults(mapMiniSearchResults(instance.search(trimmed)).slice(0, 12));
    } else {
      setResults([]);
    }
  }, [query, instance]);

  if (!searchOpen) return null;

  const go = (url: string) => {
    router.push(url);
    closeSearch();
  };

  const trimmed = query.trim();
  const searching = trimmed.length > 1;

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
            {searching && results.length === 0 && (
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

            {results.map((item) => {
              const slug = toSlug(item.url);
              const lesson = findLessonBySlug(slug);
              const num = getLessonNumber(slug);
              const section = getSectionOf(slug);
              const done = completed.has(slug);
              const context = section
                ? `${section.num} · ${section.title}`
                : item.category;

              return (
                <Command.Item
                  key={item.id}
                  value={item.id}
                  onSelect={() => go(item.url)}
                  className="flex cursor-pointer items-center gap-4 rounded-[5px] px-3.5 py-[11px] aria-selected:bg-[var(--accent-soft)]"
                >
                  <span
                    className="mono tabular w-[22px] shrink-0"
                    style={{
                      fontSize: 10,
                      letterSpacing: "0.08em",
                      color: num ? "var(--accent)" : "var(--tx3)",
                    }}
                  >
                    {num ?? "··"}
                  </span>
                  <span className="flex min-w-0 flex-col gap-[3px]">
                    <span
                      className="truncate"
                      style={{
                        fontFamily: "var(--font-serif)",
                        fontSize: 18,
                        lineHeight: 1.2,
                        color: "var(--tx)",
                      }}
                    >
                      {lesson?.title ?? item.title}
                    </span>
                    <span
                      className="mono truncate"
                      style={{ ...microLabel, color: "var(--tx3)" }}
                    >
                      {context}
                    </span>
                  </span>
                  {done && (
                    <span
                      className="mono ml-auto shrink-0"
                      style={{
                        fontSize: 9,
                        letterSpacing: "0.12em",
                        textTransform: "uppercase",
                        color: "var(--accent)",
                      }}
                    >
                      done
                    </span>
                  )}
                </Command.Item>
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
                ? `${results.length} ${results.length === 1 ? "result" : "results"}`
                : "Type to search"}
            </span>
          </div>
        </Command>
      </div>
    </div>
  );
}
