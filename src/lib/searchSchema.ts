/**
 * The one description of the search index's shape.
 *
 * MiniSearch cannot validate that a serialized index was built with the same
 * `fields` it is later loaded with — it will happily deserialize and then
 * return nothing for half your queries. So the build script
 * (`scripts/generate-search-data.ts`) and the browser
 * (`src/lib/searchConfig.ts`) both import this file rather than each spelling
 * the options out. If you change `SEARCH_FIELDS`, the index is stale until
 * `pnpm generate-search` runs again.
 *
 * This module is imported by a Node build script as well as by client code,
 * so it must stay dependency-free and free of any browser or Next.js API. The
 * `Route` import below is the one exception and not really one: it is
 * type-only, erased before the build script ever runs, and it is what makes a
 * result URL checkable against the routes that exist rather than being any
 * string at all.
 */

import type { Route } from "next";

/** Where the prebuilt index is served from. Written into `public/`. */
export const SEARCH_INDEX_URL = "/search-index.json";

/**
 * A single searchable chunk. One lesson produces many of these: an intro doc
 * for the page opening, then one per `<LessonSection>` — which is why
 * "CANivore" returns the section that explains it rather than the top of a
 * 17,000-character page.
 */
export interface SearchDoc {
  /** `"/motion-magic#cruise-velocity"` — unique, and already the link target. */
  id: string;
  /** Lesson title from `lessons.ts`, e.g. "Motion Magic". */
  title: string;
  /** Section heading within the lesson, e.g. "Picking a cruise velocity". */
  heading: string;
  /** Lesson route with no anchor, e.g. "/motion-magic". */
  slug: Route;
  /** Fragment id, or "" for a page-level intro doc. */
  anchor: string;
  /** Full link — `slug` plus `#anchor` when there is one. */
  url: Route;
  /** Prose, with code blocks and quiz answers excluded. */
  content: string;
  /** Identifiers, filenames and branch names. Matched, but weakly. */
  code: string;
  /** Trimmed prose shown under the result. */
  excerpt: string;
  /** Two-digit course position, or "" for non-lesson routes. */
  lessonNum: string;
  /** Group title from `lessons.ts` SECTIONS, e.g. "Robot Programming". */
  section: string;
  /** Group number, e.g. "01". */
  sectionNum: string;
}

/**
 * Fields that get tokenized. `heading` is separate from `content` so that a
 * query matching a section's own title outranks one buried in its body.
 */
export const SEARCH_FIELDS = [
  "title",
  "heading",
  "content",
  "code",
] as const satisfies ReadonlyArray<keyof SearchDoc>;

/**
 * Fields carried through to results. Deliberately excludes `content` — the old
 * index stored every page body verbatim on top of indexing it, which is most
 * of why it weighed 460 KB. `excerpt` is the display copy.
 */
export const SEARCH_STORE_FIELDS = [
  "title",
  "heading",
  "slug",
  "anchor",
  "url",
  "excerpt",
  "lessonNum",
  "section",
  "sectionNum",
] as const satisfies ReadonlyArray<keyof SearchDoc>;

/**
 * Field weights.
 *
 * `code` sits below 1 on purpose: a student searching "MotionMagicVoltage"
 * should find the lesson, but a Java identifier that happens to appear in a
 * dozen snippets must not outrank the section that actually teaches the idea.
 */
export const SEARCH_BOOST = {
  title: 2.5,
  heading: 3,
  content: 1,
  code: 0.4,
} as const;

/** Shared constructor options. Both sides must pass exactly this object. */
export const searchIndexOptions = {
  fields: [...SEARCH_FIELDS],
  storeFields: [...SEARCH_STORE_FIELDS],
};
