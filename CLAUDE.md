# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Development Server Rules

**NEVER run development servers automatically** - The user will start/stop servers manually. Do not use commands like:

- `npm run dev`
- `npm start`
- `bun dev`
- Any server-starting commands

The user will handle server management themselves.

## Project Overview

Gray Matter Workshop is an FRC Programming Workshop website built with Next.js 15, focusing on teaching best programming practices, hardware setup, command-based programming, and PID tuning. The site transforms Canva presentation content into an interactive web learning platform.

**Live Site:** [frc5712.com](https://frc5712.com)  
**Repository:** [https://github.com/Hemlock5712/Workshop-Site](https://github.com/Hemlock5712/Workshop-Site)  
**Workshop Code:** [https://github.com/Hemlock5712/Workshop-Code](https://github.com/Hemlock5712/Workshop-Code)  
**Robot Template (ground truth for Java examples):** [https://github.com/Hemlock5712/2027-Template](https://github.com/Hemlock5712/2027-Template)

## Workshop Content Stack (WPILib 2027 / Commands v3)

All workshop content teaches the **WPILib 2027 alpha stack — Commands v3 + OpModes** — NOT the classic Commands v2 framework. When writing or editing any Java example or robot-code prose on the site:

- **Ground truth is the [2027-Template](https://github.com/Hemlock5712/2027-Template) repo** (default branch `2027-dev`; renamed from 2026-Template in July 2026). If an API isn't in the template or shipped WPILib 2027 alpha source, do NOT use it — never invent v3 APIs. On any disagreement, the template wins.
- **Stack**: `org.wpilib.*` packages (not `edu.wpi.first.*`), Java 25, deploys to **SystemCore** (not roboRIO), Commands v3 (`org.wpilib.command3`), Phoenix 6 alpha, GradleRIO 2027 alpha.
- **OpModes replace RobotContainer**: `Robot extends OpModeRobot` owns subsystems as `public final` fields; each mode is its own `@Teleop` / `@Autonomous` / `@Utility` class with per-mode bindings in its constructor; always-on bindings live in the `Robot` constructor. There is no `RobotContainer` and no `SendableChooser`.
- **Key v3 APIs**: subsystems `extend Mechanism`; command factories are `mechanism.run(coroutine -> {...})` / `runRepeatedly(...)` / `idle()` finished with `.named("X")`; scheduler is `Scheduler.getDefault().run()`; `StateMachine` shipped in alpha-6; `ChassisSpeeds` was renamed `ChassisVelocities`.
- **Not used anywhere on the site**: PathPlanner (autonomous uses CTRE `DriveToPose`/`LinearPath` instead), AdvantageKit (logging uses `DataLogManager` only), and **enums in example code** (intentionally avoided — don't add them, even as a "before" contrast).
- **Workshop-Code embeds**: `GitHubContent`/`MechanismTabs` embed live files from [Workshop-Code](https://github.com/Hemlock5712/Workshop-Code) branches and PRs. All numbered teaching branches are v3 with linear, lesson-sized histories (rewritten July 2026); the swerve project download uses release tag `v3.0-swerve`. When changing an embed, verify the file path exists on that branch first.

## Development Commands

Requires Node.js 20+ (Bun v1+ supported). Project uses pnpm by default, but npm/yarn/bun work interchangeably.

### Essential Commands

- **Development server**: `pnpm dev` (with Turbopack for faster builds) - **USER RUNS MANUALLY**
- **Production build**: `pnpm build` (runs `generate-search`, then `next build`)
- **Production server**: `pnpm start` - **USER RUNS MANUALLY**
- **Linting**: `pnpm lint` (ESLint with Next.js config)
- **Type checking**: `pnpm type-check` (TypeScript compiler check)
- **Code formatting**: `pnpm format` (Prettier with write), `pnpm format:check` (check only)
- **Search data generation**: `pnpm generate-search` (updates search index; regenerates `src/data/searchData.ts` unformatted — run `pnpm format` afterward or `format:check` will fail)
- **Spell checking**: `pnpm spell` (cspell on TypeScript and markdown files)
- **Full test suite**: `pnpm test` (runs format:check + lint + type-check + build)

Users can substitute `npm`, `yarn`, or `bun` for `pnpm` in any command.

### Development Workflow

1. **User runs** `pnpm dev` for development with hot reload
2. Before committing, run `pnpm test` to ensure code quality
3. Use `pnpm type-check` for TypeScript validation
4. Use `pnpm lint` for code style consistency

## Code Architecture

### Application Structure

- **Framework**: Next.js 16.2.12 with App Router (`src/app/` directory)
- **UI Library**: React 19.1.0
- **Styling**: Tailwind CSS 4 with dark mode support
- **Theme Management**: next-themes for theme state and system preference detection
- **Type Safety**: TypeScript with strict configuration
- **Icons**: Lucide React icons
- **Syntax Highlighting**: React Syntax Highlighter
- **Search**: MiniSearch for fast fuzzy search functionality

### Key Components Architecture

#### Layout & Navigation — the shell

There is **no persistent sidebar**. Every workshop route renders inside
`src/components/shell/WorkshopShell.tsx`: a fixed 70px rail on the left, a sticky
breadcrumb bar on top, and one scrolling `<main id="main-content">`. `Sidebar.tsx`,
`HamburgerMenu.tsx`, `SidebarContext.tsx` and `SearchBar.tsx` were deleted — don't
reintroduce them.

- **`src/components/shell/WorkshopShell.tsx`**: The frame. Owns the single scroll container.
- **`src/components/shell/AppRail.tsx`**: 70px rail — logo/home, MENU, scroll-progress spine, theme toggle.
- **`src/components/shell/CurriculumDrawer.tsx`**: Full curriculum overlay behind MENU. Focus-trapped.
- **`src/components/shell/Topbar.tsx`**: Breadcrumb, search affordance, course-wide "N / 29 finished".
- **`src/components/shell/SearchPalette.tsx`**: ⌘K palette (cmdk + lazy MiniSearch).
- **`src/contexts/ShellContext.tsx`**: `navOpen` / `searchOpen` / `scrollPct` / `mainRef`. Owns ⌘K and Escape.
- **`src/components/PageTemplate.tsx`**: Lesson frame — outline rail + article. Props: `title`, `emphasis`, `lede`, `needs`, `branch`, `time`.

#### Search System

- **`src/data/searchData.ts`**: Search index, generated by `pnpm generate-search`
- **`src/lib/searchConfig.ts`**: MiniSearch configuration and result mapping
- **Search Features**: Fuzzy search, keyboard navigation, match highlighting, prefix matching
- **Integration**: ⌘K palette from the topbar; `/search` for the full page. Result rows show lesson number and group, both derived from `lessons.ts`.

#### Theme System

- **`src/components/ThemeProvider.tsx`**: Theme provider wrapper using next-themes
- **`src/components/ui/animated-theme-toggler.tsx`**: Animated theme toggle with smooth visual transitions
- **Implementation**: Uses `class` attribute with next-themes for theme management
- **Modes**: light, dark, system (follows OS preference with automatic detection)
- **Integration**: Tailwind CSS `dark:` classes throughout the app
- **Animation**: View Transitions API for smooth theme switching with circular reveal effect

#### Lesson vocabulary

Building blocks for lesson bodies. Prefer these over hand-rolled markup — they
are what keeps 29 pages looking like one site.

- **`src/components/lesson/LessonSection.tsx`**: A numbered step. `id` + `title`. The number is a CSS counter (`.sec-num`), never a prop — inserting a section renumbers the rest for free.
- **`src/components/lesson/Prose.tsx`**: `<Prose>`, `<ProseBlock>`, `<Split>`, `<MarginNote>`, `<WatchOut>`, `<Mark>`.
- **`src/components/lesson/LessonOutline.tsx`**: The "on this page" rail. Scans the DOM for `data-sec` — never takes a hand-maintained list.
- **`src/components/lesson/LessonKicker.tsx`**: "LESSON 15", derived from `lessons.ts`.

Layout rule: **body copy never leaves `--measure` (660px)**. Code blocks,
tables and figures may cross into the `--gutter` rail (`.measure-wide`);
paragraphs may not.

#### Content Components

- **`src/components/CodeBlock.tsx`**: Syntax-highlighted code display. Pass `branch` to tag the snippet with its Workshop-Code branch.
- **`src/components/CodeWalkthrough.tsx`**: Step-by-step code explanation component
- **`src/components/GitHubContent.tsx`**: Live GitHub file viewer with optional tabbed PR diff (Monaco). Pass `pr={{ number, focusFile? }}` to enable the tabbed Final Implementation / GitHub Changes UI.
- **`src/components/ImageBlock.tsx`**: Optimized image display with Next.js Image
- **`src/components/Box.tsx`**: Unified styled box component with alert (warning, info, tip), concept, and info variants
- **`src/components/BillOfMaterials.tsx`**: Hardware BOM table component
- **`src/components/CollapsibleSection.tsx`**: Expandable content sections
- **`src/components/ComparisonTable.tsx`**: Side-by-side comparison tables
- **`src/components/ContentCard.tsx`**: Card-based content layout
- **`src/components/KeyConceptSection.tsx`**: Key learning point sections
- **`src/components/MechanismTabs.tsx`**: Tabbed mechanism selection interface
- **`src/components/ModelViewer.tsx`**: 3D model display with Three.js
- **`src/components/AutoFocusMain.tsx`**: Automatic focus management for main content
- **`src/components/DocumentationButton.tsx`**: Quick access to external documentation
- **`src/components/KeyboardNavigationProvider.tsx`**: Context provider for keyboard shortcuts
- **`src/components/KeyboardShortcutsHelp.tsx`**: Modal displaying available keyboard shortcuts

### Route Organization

Lesson order, drawer grouping, the syllabus, and prev/next all come from
`src/data/lessons.ts` — the single source of truth. The information-architecture
plan that set this order was applied here and the plan file retired, so
`lessons.ts` is now the only authority; there is no `context/ia-audit.md` to
consult. Two branch names still mislead and are worth knowing before you move
anything: `5-GettersAndSetters` is where command composition actually debuts,
and `7-InlineCommands` is an advanced coroutine, not a basics lesson. The
swerve track is not linear — `4-DynamicFlywheel` is a dead-end spur, and
`5-DriveToPoint` forks off `2-Logging`.

**`/` is not in `LESSONS`.** Home is the landing page, not lesson 00 — the
course is 29 lessons and the counter says so.

```
00 Getting Started:
├── /introduction (What the workshop is, and the roadmap)
├── /prerequisites (Required software & hardware)
└── /mechanism-cad (optional — CAD files and 3D models)

01 Control Fundamentals:              — mechanism track, chaining dialect
├── /hardware (CTRE hardware setup; owns the CANivore-USB toggle)
├── /mechanism-setup (Bench check in Tuner X, before any code)
├── /project-setup (Clone 2027-Template, one clean build)
├── /java-basics (The Java You Need — the twelve pieces this site uses)
├── /command-framework (Trigger / Mechanism / Command / Scheduler)
├── /building-subsystems (Mechanisms — branch 1-Subsystem)
├── /adding-commands (Commands — branch 2-Commands)
├── /triggers (Triggers — branch 2-Commands)
├── /running-program (First run — branch 2-Commands)
├── /chaining-commands (Composition — sequence / race / withTimeout)
├── /pid-control (PID + feedforward — branch 3-PID)
├── /motion-magic (Profiled movement — branch 4-MotionMagic)
└── /finish-lines (Getters, isAtTarget, .until — branch 5-GettersAndSetters)

02 Drive & Perception:                — swerve track; NOT linear, see audit §2
├── /swerve-prerequisites (Vocabulary; no code)
├── /swerve-drive-project (branch 1-Swerve)
├── /logging-implementation (branch 2-Logging)
├── /swerve-calibration (Odometry you can trust)
├── /vision-implementation (branch 3-Limelight)
├── /vision-shooting (optional side branch — 4-DynamicFlywheel, a dead end)
├── /drive-to-point (branch 5-DriveToPoint — forks off 2-Logging)
├── /advanced-drive-to-point (branch 6-ProfiledToPoint)
└── /pathplanner (Autonomous routines; slug is historical, no PathPlanner)

03 Advanced Topics:                   — the other two command dialects
├── /coroutines (branch 6-Coroutines)
├── /state-based (State Machines — branch 7-StateBased)
├── /drive-to-tag-inline (branch 7-InlineCommands — hardest page on the site)
└── /ai-coding-assistant (optional — AI assistants; last on purpose, see lessons.ts)

Utility (outside lesson navigation):
├── /search, /privacy, /video
```

**There is no `/glossary`.** The standalone glossary page was retired in August
2026 — it was a second copy of every definition, kept in sync by hand. Inline
definitions now live only in `src/components/GlossaryTerm.tsx`, whose
`glossaryDefinitions` record renders the hover/focus tooltip on an annotated
term; add a term there, not to a page.

**There is no `/planner` in this repo.** The waypoint planner was removed in
August 2026 — `frc5712.com/planner` is served from a separate repository. The
route, its ten components, four hooks and four lib modules (~5,100 lines) are
gone, and nothing here linked to them. Don't reintroduce it, and don't confuse
it with `/pathplanner`, which is lesson 26 and stays.

**Retired slugs, kept as 308 redirects in `next.config.ts`** — they're printed
on old slides: `/logging-options` → `/logging-implementation`,
`/vision-options` → `/vision-implementation`, `/ai-assistant` →
`/ai-coding-assistant`, `/glossary` → `/introduction`.

### Asset Management

- **Images**: Stored in `public/images/` with organized subdirectories
- **Optimization**: All images use Next.js Image component
- **Structure**: `presenters/`, `mechanisms/`, `hardware/` folders

### Development Patterns

- **File Naming**: kebab-case for routes, PascalCase for components
- **Import Alias**: `@/*` maps to `src/*`
- **Component Structure**: Functional components with TypeScript interfaces
- **Styling**: Tailwind utility classes plus the design tokens in `globals.css`. Use template literals for conditional classNames (e.g., ``className={`p-4 ${isOpen ? "px-6" : "px-2"}`}``). The `cn()` utility from `@/lib/utils` is reserved for UI primitives only (`Box.tsx`, `button.tsx`, `animated-theme-toggler.tsx`).
- **Colour**: **never hard-code a Tailwind colour scale.** `text-slate-600`, `bg-blue-50`, `border-primary-200` and friends were swept out entirely and the scales are no longer registered — they will silently render as nothing. Use the tokens: surfaces `--bg` / `--bg2` / `--bg3`, text `--tx` / `--tx2` / `--tx3`, rules `--rule` / `--rule-soft`, and `--accent` (+ `--accent-ink`, `--accent-soft`). Signals are `--ok` and `--err` only. **One accent hue** — if something needs to stand out and isn't the primary action, use a mono micro-label, not a second colour.
- **Radius & elevation**: Tailwind's `--radius-*` and `--shadow-*` scales are redefined in `@theme` to the design's near-square corners and near-flat shadows. `rounded-lg` is 3px here. Don't fight it with arbitrary values.
- **Navigation**: Client-side routing with active state management
- **Video Integration**: YouTube embeds for educational content
- **Code Learning**: Tabbed interfaces combining final code with development process
- **GitHub Integration**: Live embedding of Workshop-Code repository with PR progression
- **Progressive Learning**: 5-step implementation approach following real development workflow
- **Theme Management**: next-themes for system theme detection and persistence

### Important Implementation Notes

- Theme system uses next-themes with class-based dark mode. Dark is `:root`; light is the `html:not(.dark)` branch
- **The scroll container is `<main id="main-content">`, not the window.** Anything measuring scroll position reads that element — `window.scrollY` is always 0 here
- All workshop pages should use PageTemplate for consistency. A lesson opens with the sentence that teaches (`title` + `emphasis`), not its filing label — the short label lives in `lessons.ts` and is what the breadcrumb and drawer show
- Navigation (drawer groups, syllabus, lesson order, prev/next, lesson numbers) is derived from `src/data/lessons.ts` — add/rename/reorder lessons there
- `LessonSectionId` is the section-id union type in `lessons.ts`; `LessonSection` is the lesson-body component. They were both called `LessonSection` and collided
- After content edits, regenerate the search index with `pnpm generate-search`; page titles/descriptions for search come from the hardcoded `routeMap` in `scripts/generate-search-data.js`, so update that map when a page's title or focus changes
- Build process includes comprehensive testing (lint + type-check + build)
- Search system provides fast fuzzy search across all workshop content using MiniSearch
- Theme transitions use View Transitions API for smooth animated theme switching

## Visual Development

### Design Principles

**`src/app/globals.css` is the design authority.** Read it before making any
visual change — it is a design document as much as a stylesheet, and it
explains _why_ at every decision: why the measure is 660px, why light-mode
`--tx3` sits at 0.525 and not 0.565, why code blocks stay dark in both themes,
why the radius scale is 2-3px, why `min-width: 0` is load-bearing.

The rules that matter, all enforced there:

- **Tokens only, never a Tailwind colour scale.** `text-slate-600`,
  `bg-blue-50`, `border-primary-200` and friends are unregistered and render
  as nothing. Surfaces `--bg` / `--bg2` / `--bg3`, text `--tx` / `--tx2` /
  `--tx3`, rules `--rule` / `--rule-soft`, `--accent` (+ `--accent-ink`,
  `--accent-soft`). Signals are `--ok` and `--err` — two, and only two.
- **The type scale is named.** `--text-micro` / `--text-meta` / `--text-note`
  / `--text-ui` / `--text-aside` / `--text-body` / `--text-lede` /
  `--text-title`, plus the `.display` ramp. Do not write inline `fontSize` or
  `text-[Npx]`: 536 of those were swept out, and each one is how the site
  drifted into twenty-seven sizes against four named steps.
- **Spacing is named too**: `--spacing-chip` / `tight` / `control` / `flow` /
  `pad` / `block` / `panel` / `stack`.
- **Body copy never leaves `--measure`.** Code, tables and figures may cross
  into the gutter via `.measure-wide`; paragraphs may not.
- **One accent hue.** If something must stand out and is not the primary
  action, use a mono micro-label (`.micro`), not a second colour.
- **Asides are budgeted.** Roughly two per `LessonSection`, one
  `alert-danger` per lesson. There were 297 of them and a warning stopped
  meaning anything; the "why" belongs in a `<MarginNote>` in the gutter.

There is no `context/design-principles.md` or `context/style-guide.md` — both
were deleted in August 2026. The first was generic "S-Tier SaaS Dashboard"
boilerplate prescribing a persistent sidebar and admin tables, which describes
neither this site nor its design; the second documented a colour palette that
no longer exists. Do not reinstate either.

`context/narration-voice.md` does still exist and is worth reading before
writing prose. It measures cadence rather than asserting rules, and its
findings apply to the website, not just the video scripts.

### Quick Visual Check

IMMEDIATELY after implementing any front-end change:

1. **Identify what changed** - Review the modified components/pages
2. **Navigate to affected pages** - Use `mcp__playwright__browser_navigate` to visit each changed view
3. **Verify design compliance** - Compare against `src/app/globals.css` and the rules above
4. **Validate feature implementation** - Ensure the change fulfills the user's specific request
5. **Check acceptance criteria** - Review any provided context files or requirements
6. **Capture evidence** - Take full page screenshot at desktop viewport (1440px) of each changed view
7. **Check for errors** - Run `mcp__playwright__browser_console_messages`

This verification ensures changes meet design standards and user requirements.

### Comprehensive Design Review

Invoke the `@agent-design-review` subagent for thorough design validation when:

- Completing significant UI/UX features
- Before finalizing PRs with visual changes
- Needing comprehensive accessibility and responsiveness testing
