import type { Route } from "next";
import type MiniSearch from "minisearch";
import {
  SEARCH_BOOST,
  SEARCH_INDEX_URL,
  searchIndexOptions,
  type SearchDoc,
} from "./searchSchema";

/** One hit. Mirrors the stored fields, plus what MiniSearch adds. */
export interface SearchResult extends Pick<
  SearchDoc,
  | "id"
  | "title"
  | "heading"
  | "slug"
  | "anchor"
  | "url"
  | "excerpt"
  | "lessonNum"
  | "section"
  | "sectionNum"
> {
  score: number;
  /** Terms that actually matched, for highlighting. Lowercased by MiniSearch. */
  terms: string[];
}

/**
 * Function words stripped from queries so a question phrased as a question
 * still narrows to something.
 *
 * The old config combined terms with OR, which meant "how do I stop a
 * flywheel" matched every page on the site — every page contains "a". Terms
 * are now combined with AND, and AND only works if the noise words are gone
 * first, otherwise the same question matches nothing.
 *
 * "can" is deliberately absent: CAN bus, CANcoder and CANivore are real
 * things a student searches for.
 */
const STOPWORDS = new Set([
  "a",
  "an",
  "and",
  "are",
  "as",
  "at",
  "be",
  "been",
  "but",
  "by",
  "did",
  "do",
  "does",
  "for",
  "from",
  "how",
  "i",
  "if",
  "in",
  "is",
  "it",
  "me",
  "my",
  "of",
  "on",
  "or",
  "should",
  "so",
  "that",
  "the",
  "then",
  "this",
  "to",
  "was",
  "were",
  "what",
  "when",
  "where",
  "which",
  "who",
  "why",
  "will",
  "with",
  "would",
  "you",
  "your",
]);

let cachedInstance: MiniSearch<SearchDoc> | null = null;
let pendingInstance: Promise<MiniSearch<SearchDoc>> | null = null;

/**
 * Fetch the prebuilt index and deserialize it.
 *
 * The index used to be a 460 KB TypeScript module imported into the bundle,
 * so every session that opened the palette paid to parse it as JavaScript and
 * then build the index in the browser. It is now a static JSON asset: fetched
 * once, cached by the browser across visits, and loaded already-built.
 */
export const getSearchInstance = (): Promise<MiniSearch<SearchDoc>> => {
  if (cachedInstance) return Promise.resolve(cachedInstance);
  if (pendingInstance) return pendingInstance;

  pendingInstance = (async () => {
    const [{ default: MiniSearchCtor }, response] = await Promise.all([
      import("minisearch"),
      fetch(SEARCH_INDEX_URL),
    ]);

    if (!response.ok) {
      pendingInstance = null;
      throw new Error(
        `Could not load the search index (${response.status}). ` +
          `Run 'pnpm generate-search' if this is a local build.`
      );
    }

    const instance = MiniSearchCtor.loadJSON<SearchDoc>(
      await response.text(),
      searchIndexOptions
    );
    cachedInstance = instance;
    return instance;
  })();

  return pendingInstance;
};

/** Split a query into meaningful terms, keeping the original if all are noise. */
const meaningfulTerms = (query: string): string[] => {
  const terms = query.trim().toLowerCase().split(/\s+/).filter(Boolean);
  const kept = terms.filter((t) => !STOPWORDS.has(t));
  return kept.length > 0 ? kept : terms;
};

/**
 * Search the index.
 *
 * Every term must match (AND), except that the final term is treated as
 * half-typed and matched by prefix — so "motion mag" finds Motion Magic while
 * still being typed, but "motion magic" does not drag in every page
 * containing the word "motion". Fuzzy matching is limited to terms long
 * enough for a typo to be unambiguous, which keeps `kP`, `ks` and `kv` exact.
 *
 * If AND finds nothing at all, the query is retried with OR so a reader who
 * pastes a whole sentence still gets the closest pages rather than an empty
 * state.
 */
export const searchIndex = (
  instance: MiniSearch<SearchDoc>,
  query: string,
  limit = 30
): SearchResult[] => {
  const terms = meaningfulTerms(query);
  if (terms.length === 0) return [];

  const lastIndex = terms.length - 1;
  const options = {
    boost: { ...SEARCH_BOOST },
    prefix: (_term: string, index: number) => index === lastIndex,
    fuzzy: (term: string, index: number) =>
      term.length >= 4 ? (index === lastIndex ? 0.2 : 0.15) : false,
    combineWith: "AND" as const,
  };

  const joined = terms.join(" ");
  let raw = instance.search(joined, options);
  if (raw.length === 0) {
    raw = instance.search(joined, { ...options, combineWith: "OR" as const });
  }

  return raw.slice(0, limit).map((result) => ({
    id: String(result.id),
    title: result.title as string,
    heading: result.heading as string,
    // MiniSearch types stored fields as `any` — everything here is an
    // assertion, not a check. `slug` and `url` were written by
    // generate-search-data.ts from routes it had already validated against
    // lessons.ts, so they are routes; the rest are plain strings.
    slug: result.slug as Route,
    anchor: result.anchor as string,
    url: result.url as Route,
    excerpt: result.excerpt as string,
    lessonNum: result.lessonNum as string,
    section: result.section as string,
    sectionNum: result.sectionNum as string,
    score: result.score,
    terms: result.terms,
  }));
};

/**
 * Collapse hits so one lesson occupies one row with its best matching
 * sections beneath it. Without this, a query like "flywheel" returns six
 * consecutive rows all reading "Motion Magic" and the reader cannot tell them
 * apart at a glance.
 */
export interface GroupedResult {
  slug: Route;
  title: string;
  lessonNum: string;
  section: string;
  sectionNum: string;
  score: number;
  hits: SearchResult[];
}

export const groupBySlug = (
  results: SearchResult[],
  maxPerPage = 3
): GroupedResult[] => {
  const groups = new Map<string, GroupedResult>();

  for (const result of results) {
    const existing = groups.get(result.slug);
    if (existing) {
      if (existing.hits.length < maxPerPage) existing.hits.push(result);
      existing.score = Math.max(existing.score, result.score);
      continue;
    }
    groups.set(result.slug, {
      slug: result.slug,
      title: result.title,
      lessonNum: result.lessonNum,
      section: result.section,
      sectionNum: result.sectionNum,
      score: result.score,
      hits: [result],
    });
  }

  return [...groups.values()].sort((a, b) => b.score - a.score);
};
