import type { Metadata, Route } from "next";
import { findLessonBySlug } from "@/data/lessons";

/** The production origin. Canonical URLs and the sitemap are built on it. */
export const SITE_URL = "https://frc5712.com";

export const SITE_NAME = "Gray Matter Coding Workshop";

/**
 * A lesson page's `<title>`, canonical URL and Open Graph card, from
 * `lessons.ts`. Each page exports one line:
 *
 *   export const metadata = lessonMetadata("/pid-control");
 *
 * The title is the lesson's name and the root layout's `title.template` adds
 * the site name, so the tab reads "PID Tuning in Tuner X · Gray Matter
 * Workshop". `lessons.ts` holds no lede, so there is no per-lesson
 * description and the layout's site description stands in.
 *
 * A slug that is not in `LESSONS` throws, at build time, rather than shipping
 * a page titled after the whole site.
 */
export function lessonMetadata(slug: Route): Metadata {
  const lesson = findLessonBySlug(slug);
  if (!lesson) {
    throw new Error(`lessonMetadata: ${slug} is not in src/data/lessons.ts`);
  }

  return {
    title: lesson.title,
    alternates: { canonical: slug },
    // Next merges `openGraph` shallowly, so a page that sets it replaces the
    // layout's whole object. `siteName` and `type` are repeated for that
    // reason.
    openGraph: {
      title: lesson.title,
      url: slug,
      siteName: SITE_NAME,
      type: "article",
    },
  };
}
