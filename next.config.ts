import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Dev-only. Next blocks /_next/* requests whose Origin isn't localhost,
  // which silently breaks client chunks, the image optimiser and HMR when you
  // open the dev server from another device on the LAN (phone, second laptop).
  // Add whatever address the dev machine answers on; ignored in production.
  allowedDevOrigins: ["192.168.1.118"],
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
  // The two "options" survey pages were folded into the lessons that follow
  // them: the parts worth keeping (the AprilTag primer, camera mounting, the
  // logging-tool vocabulary) now live on the implementation pages. Both slugs
  // are linked from Discord and from old slides, so they redirect rather than
  // 404. `skipTrailingSlashRedirect` below only suppresses Next's automatic
  // trailing-slash normalisation; it does not affect these.
  async redirects() {
    return [
      {
        source: "/logging-options",
        destination: "/logging-implementation",
        permanent: true,
      },
      {
        source: "/vision-options",
        destination: "/vision-implementation",
        permanent: true,
      },
      // The Gemini-backed workshop chat was retired: a RAG index of these
      // pages went stale faster than the pages did, and the lesson now
      // teaches students to point Claude Code or Copilot at their own
      // project instead. Same reasoning as above — old links redirect.
      {
        source: "/ai-assistant",
        destination: "/ai-coding-assistant",
        permanent: true,
      },
    ];
  },
  // This is required to support PostHog trailing slash API requests
  skipTrailingSlashRedirect: true,
};

export default nextConfig;
