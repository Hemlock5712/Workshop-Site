import type { MetadataRoute } from "next";
import { LESSONS } from "@/data/lessons";
import { SITE_URL } from "@/lib/lessonMetadata";

/**
 * Home, every lesson in course order, and the two public pages outside
 * `LESSONS`. Built from `lessons.ts`, so a new lesson is listed without an
 * edit here. `/video` is left out on purpose: it is a preview page marked
 * `noindex`. `/search` is left out because a results page is not content.
 * Side routes that remain reachable but are not in `LESSONS` stay unlisted
 * for the same reason they are off the menu.
 */
export default function sitemap(): MetadataRoute.Sitemap {
  return [
    { url: SITE_URL, priority: 1 },
    ...LESSONS.map((lesson) => ({
      url: `${SITE_URL}${lesson.slug}`,
      priority: lesson.optional ? 0.5 : 0.8,
    })),
    { url: `${SITE_URL}/privacy`, priority: 0.1 },
  ];
}
