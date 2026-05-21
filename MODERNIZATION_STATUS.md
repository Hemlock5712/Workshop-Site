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

---

## Overnight session — 2026-05-21

### SHIPPED

**Bonus pickup: Fallback queue item A — valibot at the GitHub trust boundary.**
- `src/lib/githubSchemas.ts` (new) — `GitHubPRDataSchema`, `GitHubFilesArraySchema`, `GitHubFileContentSchema`, plus a `parseGitHub()` helper that throws `GitHubSchemaError` with the offending path on mismatch.
- `src/components/GitHubPR.tsx:14-21,151,167,205,210,225` — every `await res.json()` now goes through `parseGitHub()` before the rest of the component reads from it. `GitHubSchemaError` surfaces a typed message instead of leaking through as a generic `Error`.
- `src/components/GitHubPage.tsx:6-10,54-60` — same treatment for the file-contents endpoint.
- `src/app/api/chat/route.ts:1-26,40-55,85-89` — incoming POST body parsed with `ChatRequestSchema`. Malformed client payloads now return `400` with the offending path instead of a `500`. Outbound stream is still passed to `convertToModelMessages`; the AI SDK does deeper validation downstream and that path is unchanged.
- Smoke-tested by hitting `/triggers` (uses `GitHubPR`) — 0 console errors, embed rendered correctly through the valibot gate.
- Added `valibot@1.4.0` (29 KB minified, tree-shakes per-schema; no runtime cost on routes that don't import schemas).

---

**Headline: PID + Feedforward Playground v0.5 live on `/pid-control`.** Six gain sliders (kP/kI/kD + kS/kV/kG), modernized uPlot step-response chart with dotted gridlines and gradient fill, and a live SVG arm that replays the trajectory in real time alongside a ghosted target. The playground replaced the yellow `KeyConceptSection` at the top of `/pid-control` only — the other 27 pages were not touched.

Files:

- `src/lib/pidPhysics.ts` (new, 246 lines) — 1-DOF arm sim. 1 ms integrator, 200 Hz controller, semi-implicit Euler. Trapezoidal motion profile generator (`trapezoidalProfile`). Setpoint-tracking PID + WPILib-shaped ArmFeedforward (`kS*sign(ω_sp) + kV*ω_sp + kG*sin(θ)`). Anti-windup integral clamp (±12 N·m·s). Metrics: overshoot %, 10-90 rise time, 2 % settling-band time, regime classification. Physics tuned (`maxTorque=60`, `vMax=10`, `aMax=80`) so kP changes produce visibly different overshoot envelopes — see Known Issues below for why this took two passes.
- `src/lib/pidStore.ts` (new, 33 lines) — Zustand store fronting the six gains. Picked Zustand over `useState` to future-proof Phase 2 (3D arm coupling) and Phase 3 (Web Worker physics) without prop-drilling.
- `src/components/InteractivePidPlayground.tsx` (new, 580 lines) — client component. RAF-throttled sim recompute on slider change (250 ms throttle when `prefers-reduced-motion`). uPlot chart with subtle gradient fill, dotted gridlines, no chrome. Live SVG arm with protractor reference arc (0°/45°/90° ticks), pivot mount, ghost target arm, end-effector ball; mutated imperatively via refs every RAF so we never re-render React state at 60 Hz. Sliders are native `<input type=range>` with Shift+arrow = 10 % jump, aria-labels per gain, focus-visible ring. Regime chip live region (`aria-live="polite"`).
- `src/components/PageHero.tsx` (new, 60 lines) — left text / right interactive layout. Title is optional so it composes with `PageTemplate`'s existing `<h1>` instead of duplicating it.
- `src/app/(workshop)/pid-control/page.tsx:18-23` — swapped `KeyConceptSection` → `PageHero` + `InteractivePidPlayground`. No other content on the page changed.
- `src/app/globals.css:131-188` — `.pid-slider` themed via `--slider-accent` CSS var per gain; `.pid-plot` strips uPlot's default chrome.

Deps:

- `uplot@1.6.32` — ~30 KB canvas chart for sub-ms step-response repaints. Chosen over Recharts (SVG, ~150 KB).
- `zustand@5.0.13` — gains store. `useShallow` for the gain selector to avoid identity re-renders.

Validated:

- `pnpm lint` clean.
- `pnpm type-check` clean.
- Playwright at 1440 × 900 and 375 × 812. Console error count: **0** at every gain configuration tested.
- Acceptance criteria (all observed in Playwright screenshots):
  - `kP=130, kD=0` → 39.9 % overshoot, large oscillation. `.playwright-screenshots/pid-v07-1440-test-kP-high.png`
  - Add `kD=12` → overshoot drops to 3.8 %. `.playwright-screenshots/pid-v08-1440-test-kD-damps.png`
  - `kP=50, kI=8, kD=2` → arm settles right on 90° (gravity sag eliminated). `.playwright-screenshots/pid-v09-1440-test-kI-removes-ss-err.png`
  - `kG≈7.85` alone → cancels gravity sag without any kI. `.playwright-screenshots/pid-v10-1440-test-kG-cancels-gravity.png`
  - Mobile 375 px stacks gracefully. `.playwright-screenshots/pid-v12-375-mobile-playground.png`, `pid-v13-375-mobile-ff-sliders.png`
  - Dark mode `pid-v14-1440-dark.png`
  - Keyboard: focus kP, ArrowRight → 51, Shift+ArrowRight → 71. Works.

### ATTEMPTED BUT NOT LANDED

- **First physics pass shipped with `maxTorque=25`, `vMax=6`, `aMax=30`** and high kP (180) produced **0 %** overshoot because the actuator clamp saturated and the motion profile damped everything. Re-tuned to `maxTorque=60 / vMax=10 / aMax=80` after a numerical sweep in `/tmp/sim-test2.mjs` (not committed). Default `kP=50, kD=2` now reads "Underdamped, 20.9 % overshoot" out of the box.
- **Web Worker physics**: not done. The acceptance criteria explicitly made it optional ("Run physics on the main thread first … only move to a Worker if FPS visibly drops below 50"). Static `simulateStepResponse` runs ~0.5 ms per call on the dev machine; throttled to RAF; no FPS issue observed. Worker can come in Phase 2 when 3D arm coupling lands.
- **Lighthouse score**: not measured. Dev server is running (Turbopack) and CLAUDE.md forbids running `pnpm start`. Documenting build-output route sizes belongs in a separate session where the user can stop dev → build → start → measure.

### WHAT THE USER SHOULD LOOK AT FIRST

Open `/pid-control` and drag the sliders. The arm visualization is the headline change the user explicitly requested late in the session ("would be nice to see a simulation of some sort of gui of mechanism … instead of just a line graph"). Verify the arm playback feels right at the defaults; if the loop timing is off (3 s sim + 600 ms hold) it's tuned in `InteractivePidPlayground.tsx:259`. Then drag kP up to ~130 with kD=0 to feel the oscillation in both the arm and the plot.

### DECISIONS YOU COULDN'T MAKE

1. **Should the playground also appear on `/motion-magic`?** That page is the natural next home — motion profiles + feedforward are its core topic. Spec scoped tonight's work to `/pid-control` only, so I didn't touch it. Question: copy the playground into `/motion-magic` with different defaults (showing more aggressive profile + kV demonstration), or factor the page-level integration so both pages reuse one canonical playground state?
2. **Slider grouping naming.** I labelled them "FEEDBACK (PID)" and "FEEDFORWARD". The existing static content on the same page uses "P / I / D" headers under "Understanding PID Components" and a separate "⚡ Feedforward Gains" box. Slight redundancy now. Worth removing the static "Understanding PID Components" / "Feedforward Gains" cards entirely since the interactive playground now teaches the same content?
3. **Setpoint trace visibility.** I added a third dotted trace ("motion-profile setpoint") because it's pedagogically useful — students see what the controller is *trying* to track. It does add visual noise, especially when the actual line tracks it tightly. Could be a toggle ("show setpoint").
4. **kV interpretation for non-profile mechanisms.** kV in the playground only matters during the profile ramp. The existing page copy explicitly says kV is for *flywheels and intakes*, not arms. There's a small pedagogical mismatch — the user explicitly asked for kV included, so I included it, but the framing could mislead. Worth a one-line caption clarifying kV is "ProfiledPIDController-style FF on the profile velocity"?

### KNOWN ISSUES / FOLLOW-UPS

- **`@/lib/utils` cn() is not used in the new components.** I respected the CLAUDE.md rule ("`cn()` is reserved for UI primitives only"). All conditional classNames use template literals.
- **uPlot ResizeObserver thrash on rapid sidebar collapse.** Not actually observed, but worth flagging — the `ResizeObserver` in `InteractivePidPlayground.tsx:333` calls `setSize` on every observed layout change. If users collapse the sidebar mid-drag we *might* see a frame stutter. If reported, debounce.
- **Arm SVG breaks the prose width budget.** The `PageHero` right-slot is wider than the `max-w-4xl` content column thanks to the grid template (`minmax(0,1fr)_minmax(0,1.15fr)`). At 1440 px desktop the playground card sits inside the prose column fine; at wider viewports it stays bounded by the prose container. No issue, just non-obvious if anyone tries to widen the layout later.
- **Static "Understanding PID Components" cards below the playground still use raw color divs** (`bg-[var(--muted)] dark:bg-slate-700/20` plus colored left borders). They are NOT in scope for fallback queue item C (Box-variant sweep) yet, but they're prime candidates next time Box gets refactored to left-border accents.
- **`prefers-reduced-motion` arm behavior** — snaps the arm to the final pose instead of animating. The chart still updates on a 250 ms throttle. Visually verified by toggling `(prefers-reduced-motion: reduce)` in the code; not screenshotted because Playwright doesn't expose a clean way to flip the media query without rebooting the browser context.
- **PageHero's grid template uses `lg:grid-cols-[minmax(0,1fr)_minmax(0,1.15fr)]`** — the `minmax(0,…)` is load-bearing. Without it the right column's uPlot canvas refuses to shrink because of an `auto` min-width default on grid items. Don't simplify this template without re-verifying at 1440 px.
- **`SLIDER_RANGES` lives in `pidPhysics.ts`** even though it's purely UI. I left it there so the playground and the physics module stay in lockstep on what's a sane value. Could be moved to `pidStore.ts` if the physics file feels overloaded later.

### SCREENSHOT INDEX (`.playwright-screenshots/`)

- `pid-v01-1440-initial.png` — first build, before duplicate-title fix
- `pid-v02-1440-hero-fixed.png` — duplicate `<h1>` removed
- `pid-v04-1440-with-arm.png` — first arm + modernized chart pass (still showing the old physics defaults)
- `pid-v06-1440-defaults-tuned.png` — after maxTorque/profile retune; default 21 % overshoot
- `pid-v07-1440-test-kP-high.png` — kP=130 → 39.9 % overshoot
- `pid-v08-1440-test-kD-damps.png` — kP=130 + kD=12 → 3.8 %
- `pid-v09-1440-test-kI-removes-ss-err.png` — kI=8 settles right on 90°
- `pid-v10-1440-test-kG-cancels-gravity.png` — kG=7.85 cancels gravity without kI
- `pid-v11-375-mobile-full.png`, `pid-v12-…`, `pid-v13-…` — mobile layout
- `pid-v14-1440-dark.png` — dark mode
- `pid-v15-1440-final.png` — full-page light-mode capture at the defaults
