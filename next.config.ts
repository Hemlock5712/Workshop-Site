import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    // Modern formats first — Next will pick the best one the browser accepts.
    // AVIF is ~30 % smaller than WebP on photos but slower to encode; WebP
    // covers the long tail. Browsers that support neither fall back to the
    // original.
    formats: ["image/avif", "image/webp"],
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
