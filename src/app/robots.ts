import type { MetadataRoute } from "next";
import { SITE_URL } from "@/lib/lessonMetadata";

/**
 * Everything is public. `/api/` is the GitHub proxy and `/events/` is the
 * PostHog rewrite in `next.config.ts`; neither is a page.
 */
export default function robots(): MetadataRoute.Robots {
  return {
    rules: { userAgent: "*", allow: "/", disallow: ["/api/", "/events/"] },
    sitemap: `${SITE_URL}/sitemap.xml`,
  };
}
