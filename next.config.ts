import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    // Modern formats first — Next will pick the best one the browser accepts.
    // AVIF is ~30 % smaller than WebP on photos but slower to encode; WebP
    // covers the long tail. Browsers that support neither fall back to the
    // original.
    formats: ["image/avif", "image/webp"],
    // Next.js 15+ silently drops any <Image quality={…}> value that isn't on
    // this allowlist (and falls back to 75). The Gray Matter logo and the
    // sponsor logos request 95 so they read sharp on retina; keep 75 for the
    // mechanism photos so default callers don't change behaviour.
    qualities: [75, 90, 95, 100],
    remotePatterns: [
      {
        protocol: "https",
        hostname: "avatars.githubusercontent.com",
      },
    ],
  },
  async rewrites() {
    return [
      {
        source: "/events/static/:path*",
        destination: "https://us-assets.i.posthog.com/static/:path*",
      },
      {
        source: "/events/:path*",
        destination: "https://us.i.posthog.com/:path*",
      },
    ];
  },
  // This is required to support PostHog trailing slash API requests
  skipTrailingSlashRedirect: true,
};

export default nextConfig;
