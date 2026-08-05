import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Lesson order, prev/next, the drawer and the syllabus are all derived from
  // one hand-maintained list in src/data/lessons.ts, and every entry there is
  // a route string. Nothing checked those strings against the routes that
  // actually exist, so a renamed folder or a typo'd slug shipped as a 404 that
  // only a reader would find. Stable since 15.5; this makes it a build error.
  typedRoutes: true,
  // Stable in Next 16. Matters here because the three playgrounds and the
  // planner carry ~60 hand-written useMemo / useCallback / memo calls between
  // them, written by hand precisely because those components re-render on
  // every slider drag.
  //
  // `react-compiler-healthcheck` reports 121 of 121 components compiling with
  // no bailouts, including the playgrounds that mutate SVG through refs at
  // 60 Hz — which was the thing most likely to defeat it.
  //
  // Verifying this is harder than it should be. React 19 has useMemoCache
  // built in, so the emitted calls minify into a property access and grepping
  // the bundle for `_c(` or `compiler-runtime` finds nothing whether it ran or
  // not. The check that actually works is building both ways: client JS is
  // 15,061,017 bytes on versus 14,970,029 off, and the chunk digests differ.
  // The ~91 KB is the memoization bookkeeping.
  //
  // One caveat while ESLint is off (see the note in package.json / the lint
  // script): the compiler's diagnostics ship as an eslint-plugin-react-hooks
  // rule, so nothing warns in the normal loop if a future edit makes a
  // component un-compilable. `pnpm dlx react-compiler-healthcheck` is the
  // standalone way to check, and it needs no linting.
  reactCompiler: true,
  experimental: {
    // TypeScript 7 is the Go port and does not ship the programmatic compiler
    // API Next reaches for by default; without this the build stops with
    // "TypeScript 7.0.2 does not provide the compiler API required by
    // Next.js". This makes Next shell out to the project's own tsc instead —
    // the same check, run a different way.
    useTypeScriptCli: true,
  },
  // cacheComponents (Next 16's merge of Dynamic IO, `use cache` and PPR) is
  // NOT on yet, and turning it on is a two-line change that needs one thing
  // first.
  //
  // Every lesson page renders a dozen `<CodeBlock>`s, and CodeBlock is now an
  // async Server Component that highlights with Shiki. Under cacheComponents
  // that reads as uncached data outside a Suspense boundary, and the build
  // fails on every code-bearing route — which is nearly all of them. The fix
  // is `"use cache"` inside CodeBlock so the highlighted markup is produced
  // once at build rather than treated as dynamic; Shiki output is a pure
  // function of (code, language, theme), so it is about as cacheable as
  // anything gets.
  //
  // Worth knowing before spending time on it: the site already prerenders all
  // 38 routes as static, so PPR has no dynamic holes to fill here. The gain is
  // the stricter correctness checking, not speed. It already earned its keep
  // once — it is what caught `new Date()` being called during the prerender of
  // the footer copyright, which would have frozen the year into static HTML.
  //
  //   cacheComponents: true,
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
  // are printed on old slides, so they redirect rather than
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
      // The glossary page was a second copy of every definition, kept in sync
      // by hand, and not worth the upkeep. The definitions themselves survive
      // as the hover/focus tooltips in `GlossaryTerm.tsx`, so there is no
      // reference page to land on — old links go to the course opening, which
      // is the closest thing to "start here".
      {
        source: "/glossary",
        destination: "/introduction",
        permanent: true,
      },
    ];
  },
  // This is required to support PostHog trailing slash API requests
  skipTrailingSlashRedirect: true,
};

export default nextConfig;
