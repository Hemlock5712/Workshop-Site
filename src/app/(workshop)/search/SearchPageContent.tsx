"use client";

/**
 * The full search page, reached from the palette's "open the full search page"
 * row or by linking `/search?q=…` directly.
 *
 * It shows the same results as the palette, at more length: every lesson that
 * matched, the sections inside it that matched, and an excerpt with the terms
 * that actually matched marked. It is deliberately the same shape as the
 * palette — the two used to be separate designs with separate notions of what
 * a result was, and the page carried a hardcoded category-colour table that
 * drifted from `lessons.ts`.
 */

import { useSearchParams } from "next/navigation";
import { useEffect, useMemo, useState, type ReactNode } from "react";
import Link from "next/link";
import type MiniSearch from "minisearch";
import {
  getSearchInstance,
  groupBySlug,
  searchIndex,
  type GroupedResult,
} from "@/lib/searchConfig";
import type { SearchDoc } from "@/lib/searchSchema";
import { useProgress } from "@/lib/useProgress";

const microLabel = {
  fontSize: 9.5,
  letterSpacing: "0.12em",
  textTransform: "uppercase",
} as const;

const escapeRegExp = (value: string) =>
  value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

/**
 * Mark the terms MiniSearch actually matched.
 *
 * Highlighting used to run the raw query through `dangerouslySetInnerHTML`,
 * which meant a fuzzy or prefix hit — the whole point of the search — showed
 * up unmarked, because the typed text was not the matched text. Using
 * `result.terms` marks what the engine really found, and returning React
 * nodes means no HTML is ever assembled from a string.
 */
function markTerms(text: string, terms: string[]): ReactNode {
  if (terms.length === 0) return text;

  const pattern = new RegExp(
    `(${terms
      .slice()
      .sort((a, b) => b.length - a.length)
      .map(escapeRegExp)
      .join("|")})`,
    "gi"
  );

  return text.split(pattern).map((part, index) =>
    // String.split with a capturing group puts the captures at odd indices.
    index % 2 === 1 ? (
      <mark
        key={index}
        style={{
          background: "var(--accent-soft)",
          color: "var(--tx)",
          borderRadius: 2,
          padding: "0 2px",
        }}
      >
        {part}
      </mark>
    ) : (
      part
    )
  );
}

export default function SearchPageContent() {
  const searchParams = useSearchParams();
  const query = searchParams.get("q") || "";
  const { completed } = useProgress();
  const [instance, setInstance] = useState<MiniSearch<SearchDoc> | null>(null);
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    getSearchInstance()
      .then(setInstance)
      .catch((error) => {
        console.error("Search unavailable:", error);
        setFailed(true);
      });
  }, []);

  const groups: GroupedResult[] = useMemo(() => {
    if (!instance || !query.trim()) return [];
    return groupBySlug(searchIndex(instance, query.trim(), 60), 5);
  }, [instance, query]);

  const hitCount = groups.reduce((total, g) => total + g.hits.length, 0);
  const loading = !instance && !failed && query.trim().length > 0;

  return (
    <div className="mx-auto w-full max-w-3xl">
      <header className="mb-9">
        <h1
          className="display mb-2"
          style={{ fontSize: "clamp(30px, 4vw, 42px)", lineHeight: 1.08 }}
        >
          {query ? <>Results for “{query}”</> : "Search"}
        </h1>
        {query && !loading && !failed && (
          <p className="mono" style={{ ...microLabel, color: "var(--tx3)" }}>
            {hitCount} {hitCount === 1 ? "section" : "sections"} in{" "}
            {groups.length} {groups.length === 1 ? "lesson" : "lessons"}
          </p>
        )}
      </header>

      {failed && (
        <p
          style={{
            fontFamily: "var(--font-serif)",
            fontSize: 17,
            color: "var(--tx2)",
          }}
        >
          The search index could not be loaded. Reload the page to try again.
        </p>
      )}

      {loading && (
        <p className="mono" style={{ ...microLabel, color: "var(--tx3)" }}>
          Loading the index…
        </p>
      )}

      {!query && !failed && (
        <p
          style={{
            fontFamily: "var(--font-serif)",
            fontSize: 17,
            lineHeight: 1.55,
            color: "var(--tx2)",
          }}
        >
          Press <kbd className="mono">⌘K</kbd> anywhere on the site, or type a
          query into the address bar as <code>/search?q=…</code>. Try a
          mechanism (arm, flywheel, swerve), a concept (PID, odometry,
          AprilTag), or a gain name.
        </p>
      )}

      {query && !loading && !failed && groups.length === 0 && (
        <div>
          <p
            className="display mb-3"
            style={{ fontSize: 26, lineHeight: 1.2, color: "var(--tx2)" }}
          >
            Nothing matches that
          </p>
          <p
            style={{
              fontFamily: "var(--font-serif)",
              fontSize: 17,
              lineHeight: 1.55,
              color: "var(--tx3)",
            }}
          >
            Try fewer words, or the name of the thing rather than a description
            of it — <em>cruise velocity</em> rather than{" "}
            <em>how do I make the arm move smoothly</em>.
          </p>
        </div>
      )}

      <div className="flex flex-col gap-8">
        {groups.map((group) => {
          const done = completed.has(group.slug);
          const context = group.sectionNum
            ? `${group.sectionNum} · ${group.section}`
            : group.section;

          return (
            <section key={group.slug}>
              <div
                className="mb-3 flex items-baseline gap-4 pb-2"
                style={{ borderBottom: "1px solid var(--rule-soft)" }}
              >
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
                <Link
                  href={group.slug}
                  className="min-w-0 flex-1 truncate hover:underline"
                  style={{
                    fontFamily: "var(--font-serif)",
                    fontSize: 22,
                    lineHeight: 1.2,
                    color: "var(--tx)",
                  }}
                >
                  {group.title}
                </Link>
                {context && (
                  <span
                    className="mono hidden shrink-0 sm:inline"
                    style={{ ...microLabel, color: "var(--tx3)" }}
                  >
                    {context}
                  </span>
                )}
                {done && (
                  <span
                    className="mono shrink-0"
                    style={{ ...microLabel, color: "var(--accent)" }}
                  >
                    done
                  </span>
                )}
              </div>

              <ul className="ml-[38px] flex flex-col gap-[18px]">
                {group.hits.map((hit) => (
                  <li key={hit.id}>
                    <Link href={hit.url} className="group block">
                      <span
                        className="mb-1 block group-hover:underline"
                        style={{
                          fontFamily: "var(--font-serif)",
                          fontSize: 17,
                          lineHeight: 1.3,
                          color: "var(--accent)",
                        }}
                      >
                        {hit.heading || "Opening"}
                      </span>
                      <span
                        className="block"
                        style={{
                          fontFamily: "var(--font-serif)",
                          fontSize: 15,
                          lineHeight: 1.55,
                          color: "var(--tx2)",
                        }}
                      >
                        {markTerms(hit.excerpt, hit.terms)}
                      </span>
                    </Link>
                  </li>
                ))}
              </ul>
            </section>
          );
        })}
      </div>
    </div>
  );
}
