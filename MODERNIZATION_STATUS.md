# Modernization — Status & Continuation Guide

Last updated by Claude (Opus 4.7) in the previous context window.
Use this file as the source of truth for what shipped, what's still queued,
and what the next agent (with Playwright MCP) should pick up first.

---

## Shipped tonight (Day-1 quick-wins from the engineering audit)

All changes are code-only, type-safe, and validated by `pnpm lint` + `pnpm type-check` (both pass clean).

| # | Change | Files touched | Validation |
|---|---|---|---|
| 1 | **Lazy MiniSearch index + module-singleton cache.** `createSearchInstance()` (sync) replaced with `getSearchInstance()` (async, memoized). Both `minisearch` and `@/data/searchData` are now dynamic imports — the ~188 KB index no longer ships with the initial bundle of every workshop page. | `src/lib/searchConfig.ts`, `src/components/SearchBar.tsx`, `src/app/(workshop)/search/SearchPageContent.tsx` | lint + tsc clean |
| 2 | **Dynamic-import CodeBlock (Monaco).** `CodeBlock.tsx` is now a thin client wrapper that `next/dynamic`-imports the heavy implementation. Real implementation moved to `CodeBlockClient.tsx`. All 14 consumers unchanged. | `src/components/CodeBlock.tsx` (new wrapper), `src/components/CodeBlockClient.tsx` (was old CodeBlock body) | lint + tsc clean |
| 3 | **Dynamic-import react-syntax-highlighter in the AI assistant.** Extracted into `MarkdownCodeBlock.tsx` and dynamic-imported with `ssr: false`. Removes ~100-150 KB from the `/ai-assistant` route's initial chunk. | `src/components/MarkdownCodeBlock.tsx` (new), `src/app/(workshop)/ai-assistant/page.tsx` | lint + tsc clean |
| 4 | **Verified ModelViewer (Three.js) is already route-isolated.** Only consumer is `src/app/(workshop)/mechanism-cad/page.tsx`. Next's automatic route splitting already keeps Three.js + R3F + drei off every other route. Wrapping in `next/dynamic({ssr:false})` would break the `useRef<ModelViewerRef>` reset-camera handle. No code change needed. | (verification only) | — |
| 5 | **Removed the `as any` in the AI assistant code renderer.** Now uses `React.ReactElement<{className?, children?}>` — autocomplete restored, no type escape. | `src/app/(workshop)/ai-assistant/page.tsx` | tsc clean |
| 6 | **Discriminated unions on GitHub embed types.** `GitHubFile.status: string` → `GitHubFileStatus = "added" \| "modified" \| ...` (full GitHub REST set). `GitHubPRData.state: string` → `"open" \| "closed"`. | `src/components/GitHubPR.tsx` | tsc clean |
| 7 | **Removed `format` from build script.** Builds are now deterministic — no more source-file mutation during `pnpm build`. | `package.json` | — |
| 8 | **Added `.env.example`.** Documents `GOOGLE_GENERATIVE_AI_API_KEY`, `GEMINI_FILE_SEARCH_STORE`, `NEXT_PUBLIC_POSTHOG_KEY`. Removes the #1 AI-assistant onboarding tripwire. | `.env.example` (new) | — |
| 9 | **Aligned CI workflow.** Switched from Bun → pnpm (matches project default), split into discrete steps (format-check, lint, type-check, spell, build), added spell-check, fixed push/PR branch logic (now both fire on master + main). | `.github/workflows/ci.yml` | — |
| 10 | **Tightened tsconfig (safe flags only).** Added `noImplicitOverride: true` and `noFallthroughCasesInSwitch: true`. Skipped `noUncheckedIndexedAccess` and `exactOptionalPropertyTypes` — those surface dozens of real fixes that belong in their own focused PR. | `tsconfig.json` | tsc clean |

### Bundle-size estimate (initial JS on a typical workshop page)
- **~188 KB** off main bundle (search index now lazy)
- **~2.5-3.5 MB deferred** (Monaco now dynamic-imported via CodeBlock wrapper)
- **~100-150 KB** off the `/ai-assistant` route initial chunk

These won't show in Lighthouse until you rebuild for production (`pnpm build && pnpm start`) — dev mode does its own chunking.

### Verification commands (run with dev server stopped)
```powershell
pnpm install
pnpm lint
pnpm type-check
pnpm build
pnpm start  # then check the home page and /search smoke test
```

### Smoke tests to run with dev (or prod) server up
1. Home page loads, search bar visible in header, no console errors
2. Ctrl+K opens the palette, "Start typing to search workshop content"
3. Type "PID" — results appear within ~100 ms (first open does the lazy load)
4. Click a result — navigates correctly
5. `/search?q=PID` — page renders results
6. Any page with code blocks (e.g. `/pid-control`) — Monaco loads after a moment, copy button works
7. `/ai-assistant` — page loads, send a message, code-fenced responses render with syntax highlighting

If the search palette ever stalls on a blank state, the lazy load failed — check console.
Safe revert for just the search work: `git checkout src/lib/searchConfig.ts src/components/SearchBar.tsx 'src/app/(workshop)/search/SearchPageContent.tsx'`.

---

## Queued — Doesn't need Playwright

These are low-risk and can be picked up by any agent (with or without browser access).

1. **valibot at GitHub trust boundary** *(audit P0, ~3 hours).* Add valibot, write schemas for the responses in `src/components/GitHubPR.tsx:185-202` and `src/components/GitHubPage.tsx:47-60` and the Gemini streaming response in `src/app/api/chat/route.ts`. Parse before consuming. Real crash-prevention for when GitHub API surprises you.
2. **Centralize lesson navigation in `src/data/lessons.ts`** *(audit #12, half a day, mechanical).* Replace the hand-rolled `previousPage` / `nextPage` props at every workshop page with a single SoT module. Derives sidebar, search route map, and PageTemplate prev/next from it. ~56 LOC removed across 28 pages.
3. **Add `simple-git-hooks` + `lint-staged`** *(audit #18, 1-2 hours).* Pre-commit format + lint on staged files. Eliminates "CI failed on formatting" round-trips.
4. **Consolidate the GitHub embed trio** *(audit #15, M effort).* Collapse `GitHubPage`, `GitHubPR`, `GitHubPageWithPR` into one `<GitHubContent repo file pr?={...}>`. ~300 LOC removed. Wait until after the valibot work so you migrate one set of types.
5. **Generalize `MechanismTabs`** into `<ComparisonWithCodeWalkthrough>` so vision/swerve/pathplanner can stop hand-rolling its layout (audit #20).
6. **Strategic: move to Pagefind** (audit #13). Better than the lazy-MiniSearch we shipped. Indexes rendered HTML at build time; ~2 KB runtime stub. Wait until you decide on the MDX migration — they sequence together.

---

## Queued — Needs Playwright (next context window)

These require live UI verification, which is why they were held back from tonight.

1. **Box-variant visual sweep.** Refactor `src/components/Box.tsx` alert variants from tinted-wash backgrounds (`bg-yellow-50`, `bg-blue-50`, etc.) to left-border accents on `--surface`. Then sweep the 48 raw hardcoded tinted-color divs across ~16 workshop pages and route them through Box. Verify visually across desktop + mobile viewports at each page. **This is the highest-leverage visual change in the redesign vision.**
2. **ContentCard shadow softening** (`shadow-lg` → `--shadow-xs`). Verify nothing looks flat afterward.
3. **`useProgress` hook + sidebar progress pill** (interactivity roadmap Phase 0). LocalStorage key `gmw:progress:v1`. Per-page "Mark complete" near prev/next nav. Verify sidebar checkmarks render correctly across sessions.
4. **Image format hints in `next.config.ts`** (`formats: ['image/avif', 'image/webp']`). Verify hero images on home + mechanism pages still render.
5. **The redesign's Phase 1 token cleanup** — the OKLCH `@theme` rewrite was specifically pushed back on in the design review (chroma-on-dark is wrong audience for Chromebook fleet). Stick with the existing CSS custom properties; only adjust the token values that drive tinted washes.

---

## Strategic — Needs explicit go-ahead

Don't start these without a user-side decision. They're the high-ROI but multi-week bets.

1. **MDX content layer via Velite** (audit Strategic Bet #21). Migrates ~15 KLOC of prose out of `.tsx` files into `.mdx`. Frontmatter-driven nav, easier contribution path, unblocks the interactivity roadmap's quiz authoring. ~1-2 weeks per cohort. Decide this before doing any more page-level redesign work — both depend on the same foundation.
2. **Monaco → Expressive Code for `<CodeBlock>`** (redesign Phase 2 + audit follow-up). Delete `@monaco-editor/react`, install `expressive-code` + `shiki` + plugins. RSC-friendly, zero runtime JS for highlighting. Real ~3 MB removal per code-bearing page. The dynamic-import wrapper we shipped tonight is the bridge — Expressive Code is the destination.
3. **PID Playground v1** (interactivity roadmap Phase 1, M effort). Slider-driven step-response simulator for `/pid-control` + `/motion-magic`. uPlot streaming + Web Worker physics. The single biggest "this rebuild was worth it" deliverable in any of the three plans.
4. **Sidebar rebuild** (~1188 → ~250 lines, data-driven from `src/data/navigation.ts`). Closes real a11y gaps (hover-only tooltips, no focus trap on mobile overlay). Best done alongside `lessons.ts` migration so navigation has one source of truth.

---

## The three plans (still live in conversation history)

If the next context window doesn't have these:

1. **Engineering audit** — bundle/types/deps/DX. Quick wins / High-leverage refactors / Strategic bets / Do-not-do.
2. **Redesign vision** — visual + UX modernization. North star + component upgrade table + 9-week phased rollout. Was design-reviewed; verdict was "proceed with modifications": drop OKLCH, drop the 25-component vocabulary kit, drop vim keybindings except `[`/`]`, content audit before vocabulary design.
3. **Interactivity roadmap** — PID playground / quizzes / 3D sims / `<TryItYourself>` fake-WPILib shim. Skip gamification. Build playgrounds before pursuing CheerpJ alternatives.

The synthesis recommendation: don't treat these as independent — sequence as one unified plan. Audit Day-1 work (this PR) → Box-variant calmness sweep → Monaco → Expressive Code + Sidebar rebuild → PID playground in `PageHero` right-slot → page-level redesigns mechanically applying the kit. Stop and review after the PID playground lands; that's the inflection point that decides whether the rest is worth the time.

---

## Decisions still owed by the user

From the interactivity roadmap's open questions:

1. **Mentor progress dashboard?** Default no — local-storage only.
2. **SysId paste-in for the PID playground?** Yes, but as Phase 4 (after the playground is battle-tested).
3. **Lowest-spec Chromebook target?** Required input before any 3D work in Phase 2+.
4. **"WPILib-style TypeScript" framing for `<TryItYourself>`?** Recommend "Workshop Simulator" — safer, future-proof if the engine swaps.

From the redesign:

5. **Commit to MDX content layer (Velite)?** Decides whether quiz authoring is hand-rolled or frontmatter-driven.
6. **Drop OKLCH and chroma-on-dark? (recommended)** Keep the existing CSS-variable + `.dark` class system; only adjust token values.
