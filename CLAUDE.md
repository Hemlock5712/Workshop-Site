# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Development Server Rules

**You may start and stop the dev server yourself.** `pnpm dev`, `pnpm start`,
and stopping them are all yours to run. This replaces an earlier rule that
reserved server management for the user; it was changed in August 2026 because
verifying a front-end change means loading the page, and waiting on a human to
restart turned a two-minute check into a several-round handoff.

**Run exactly one at a time.** This is the rule that actually matters, and it
is not a style preference — two dev servers on the same checkout share one
`.next`, and if they are running different bundlers they destroy each other's
output. A webpack `next dev` and a Turbopack `next dev --turbopack` in
parallel emptied `.next/static` while `.next/dev/static` filled up, so every
route served HTML with 404s for every chunk and nothing hydrated. It reads
exactly like a broken build. Before starting one, check nothing is already
listening:

```bash
netstat -ano | grep LISTENING | grep -E ":300[0-9]\b"
```

Note that `next dev` falls through to 3001, 3002 … when 3000 is taken, so a
second server starts _successfully_ and gives no warning that a first one
exists.

**Never delete `.next` while a server is running or starting.** Wait for the
process to exit — not just for the port to stop answering. A `rm -rf` on a
multi-gigabyte `.next` takes long enough that a restart begun in the meantime
initialises against a directory still being emptied, comes up without
`routes-manifest.json`, and 500s on every route.

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
- **PathPlanner boundary**: Workshop 4 teaches the PathPlanner editor, path/auto vocabulary, and the documented AD* path-finding model. Its published Java integration examples still target Commands v2, so never paste `edu.wpi.first`, `RobotContainer`, or v2 `Command` code into this project. Commands v3 autonomous examples use the workshop drivetrain commands until an official v3 adapter is available.
- **Not used anywhere on the site**: AdvantageKit (logging uses `DataLogManager` only) and **enums in example code** (intentionally avoided — don't add them, even as a "before" contrast).
- **Workshop-Code embeds**: `GitHubContent`/`MechanismTabs` embed live files from [Workshop-Code](https://github.com/Hemlock5712/Workshop-Code) branches. The swerve project download uses release tag `v3.0-swerve`. When changing an embed, verify the file path exists on that branch first.
- **No GitHub embeds on the site at all, for now.** August 2026: every `<GitHubContent>` was removed from every lesson. A page that ends in someone else's 100-plus-line file is mostly scroll, and each of those pages already teaches the same code in `CodeBlock`s. The components survive (`GitHubContent`, `MechanismTabs`) and so does the `pr` prop that renders a "GitHub Changes" tab, but nothing calls them. A local `FileDiff` (unified diff, two gutters, parsed straight from `git diff` output) is built and also unused. The intended end state is a compare view in place of the whole-file dump, but not until the teaching chain's comments and prose settle: a diff of it today is a third Javadoc rewording, and that red and green buries the lines a student types. `pnpm check-embeds` now treats zero embeds as valid and only fails when a page uses the component and nothing parses.
- **Branches are prefixed by chain, not numbered across the course.** There are two chains and they used to collide on every number. `mech-*` is the arm-and-flywheel bench project. The drivetrain chain keeps its old bare numbers (`1-Swerve`, `2-Logging`, `3-Limelight`, `4-DynamicFlywheel`, `5-DriveToPoint`, `6-ProfiledToPoint`, `7-InlineCommands`) and is due the matching `swerve-*` rename when it is rebuilt. The prefix carries the chain and the suffix carries the topic, so inserting a lesson renames nothing. The mechanism chain was rebuilt off the new bare `main` in August 2026 and is linear, one commit per lesson:
  `main → mech-1-Mechanisms → mech-2-Commands → mech-3-MotionMagic → mech-4-ReadingState → mech-5-Coroutines → mech-6-StateBased`
- **The mechanism chain is `first.robot.mechanisms` and `first.robot.opmode`.** The swerve chain has not been rebuilt and is still `frc.robot.subsystems` and `frc.robot.opmodes`. A lesson page must match the chain it embeds; do not "fix" a swerve page to the new package until its branch moves.
- **`TalonFXUtil` and `SimStartup` are gone from the mechanism chain.** Config applies once, directly, with `motor.getConfigurator().apply(config)`. `Robot` has no `simulationInit()` override. Both helpers still exist on the swerve branches, which is why `/vision-shooting` still shows `TalonFXUtil`.
- **Motor config on the mechanism chain uses the fluent builders**, not `config.Slot0.kP = kP`. That is the shape Phoenix Tuner X emits from its config panel's three-dot **Generate Code** action, because a student pastes the config rather than typing it: `new TalonFXConfiguration().withMotorOutput(...).withSlot0(...).withMotionMagic(...)`, with WPILib unit types such as `RotationsPerSecond.of(...)`. Verified against Phoenix 6 `26.50.0-alpha-1`. The swerve chain still uses the imperative style, so `/vision-shooting` keeps it.
- **Paste the generated config whole, then make one edit.** Generate Code emits `final TalonFXConfiguration talonFXCfg = new TalonFXConfiguration()`, so the chain uses that name and that `final`, and it needs `import static org.wpilib.units.Units.*` members (`Volts`, `RotationsPerSecond`, `RotationsPerSecondPerSecond`) for the unit forms. The emitted feedback block hardcodes the encoder: `withFeedback(new FeedbackConfigs().withFeedbackRemoteSensorID(32).withFeedbackSensorSource(FeedbackSensorSourceValue.RemoteCANcoder))`. **Leave it exactly as generated.** `withRemoteCANcoder(encoder)` is equivalent (a remote sensor must sit on the Talon's own CAN bus, so the bare ID is unambiguous) but it was rejected: every edit a student has to make after a paste is a step they can get wrong, and this one breaks nothing when forgotten. The cost is that `Arm`'s `encoder` field has no reader until `mech-4-ReadingState` calls `getPosition()`. Tuner X still owns the encoder's own configuration, so never put a `CANcoderConfiguration` in a lesson.
- **The generated OpMode keeps its generated name.** The New Project Creator writes `opmode/MyTeleop.java` with `@Teleop` already on it, and every mech branch edits that file rather than renaming it. It was `TeleopOpMode` until August 2026, which cost a lesson an F2-rename step and left a real trap: create a second file instead of renaming and two `@Teleop` classes both appear on the driver station. `MyAuto.java` is the same idea, though `/autonomous` still renames it to `LeaveStartAuto` on the swerve chain.
- **OpModes reach mechanisms through `robot` directly.** No `final Arm arm = robot.arm;` aliases in a constructor: write `robot.arm.runFast()`. Two locals that only shorten a field access are two more names to carry, and `robot.arm` already says where the mechanism lives. `Robot`'s own `public final Arm arm = new Arm();` field is a different thing and stays.
- **The raw setter is `private` from lesson one, and the stop helper is `stopMotor`.** Nothing outside a mechanism ever called `setVoltage`, and `stop` is the name a Command wants in `mech-2-Commands`, so both are settled on `mech-1-Mechanisms`. That leaves the mech-1 to mech-2 diff purely additive: three Commands and one import, with no visibility change and no deleted method. The stop Command routes through `this::stopMotor` rather than `motor::stopMotor` so the helper stays used.
- **`Inverted` is not presented as a choice.** The direction is settled on the bench in `/mechanism-setup`, so lesson prose names only `NeutralMode` as a setting the student picks.
- **Generate Code always emits the Expo pair, tuned or not.** A factory-defaulted device still produces `withMotionMagicExpo_kV(Volts.per(RotationsPerSecond).ofNative(0.119999997317791))` and `withMotionMagicExpo_kA(...ofNative(0.10000000149011612))`. Those are defaults riding along in the paste and nothing reads them: the course teaches the trapezoid, `MotionMagicCruiseVelocity` and `MotionMagicAcceleration`, and `/motion-magic` stays as written. Do not rewrite Workshop 1 around Expo, and do not strip the Expo lines out of a pasted block either.
- **Students must not be able to copy our gains.** A tuned config belongs on the page as a screenshot of the Tuner X panel, never as a `CodeBlock` with a copy button. Code blocks in the paste lesson show the shape with `0.0` placeholders or show the edit, not somebody else's numbers.
- **There is no separate PositionVoltage step.** `mech-3-MotionMagic` goes from open-loop `VoltageOut` straight to `MotionMagicVoltage`. Workshop 1 already tunes closed-loop position in Tuner X, so a second code-side PID lesson taught the same layer twice. `mech-1` and `mech-2` stay open loop on purpose, mirroring the bench order.

### Local copies of the teaching code (`reference/`)

`pnpm reference:sync` puts **every branch of Workshop-Code on disk at once**,
one worktree per branch, plus 2027-Template on `2027-dev`. Check a lesson
against the code it embeds without leaving the project:

```
reference/
  .git-store/            bare mirrors, one shared object store per repo
  Workshop-Code/         15 detached worktrees: mech-1 … mech-7, the 7 swerve, main
  2027-Template/2027-dev ground truth for API questions
```

Sixteen checkouts cost 4.2 MB, because the worktrees share the mirror's
history. Cross-state diffs work, and they are the teaching artifact:

```bash
git -C reference/.git-store/Workshop-Code.git diff mech-2-Commands mech-4-MotionMagic
```

- **`reference/` is gitignored**, so `scripts/sync-reference.mjs` is the only
  record of how it is built. It is excluded from `tsconfig.json` (whose
  `include` is `**/*.ts`) and `.prettierignore`.
- **The worktrees are detached on purpose.** A worktree holding `refs/heads/X`
  makes git refuse to move that ref, and the teaching chain gets rebased and
  force-pushed whenever the WPILib alpha breaks an API. Don't commit here.
- **`pnpm reference:refresh`** fetches upstream, fast-forwards each worktree,
  and prunes ones whose branch is gone. It skips any worktree with local
  changes rather than clobbering it.
- **This is not a submodule and must not become one.** A submodule tracks one
  ref at one pinned commit; the teaching states are fifteen refs, and the pin
  would need a commit here every time Workshop-Code moved.
- **Nothing at build time reads it.** The embeds still fetch from GitHub
  through `src/app/api/github/route.ts`, whose `ALLOWED_REPOS` is a one-entry
  allowlist. `reference/` is for authoring, not for rendering.
- **`mech-3-MotionMagic` is embedded by zero pages, and that is the biggest hole
  in the course.** It is the branch where the arm and flywheel go closed loop,
  and its whole point is that a student pastes a config generated in Phoenix
  Tuner X over the block in the constructor. Every gain on it ships at `0.0`, so
  a fresh clone holds the arm still. No lesson opens it, which means no lesson
  teaches the paste. Closing it needs one lesson between `/building-subsystems`
  and `/running-program`, not new code.
- `2-Logging`, on the swerve chain, is also embedded by no page. `/logging-implementation`
  hand-writes its blocks and teaches the arm, so that branch is the wrong
  parent for it.

## Development Commands

Requires Node.js 20+ (Bun v1+ supported). Project uses pnpm by default, but npm/yarn/bun work interchangeably.

### Essential Commands

- **Development server**: `pnpm dev` (with Turbopack for faster builds). One at a time, and see **Development Server Rules** above
- **Production build**: `pnpm build` (runs `generate-search`, then `next build`)
- **Production server**: `pnpm start`
- **Linting**: `pnpm lint` (ESLint with Next.js config)
- **Type checking**: `pnpm type-check` (TypeScript compiler check)
- **Code formatting**: `pnpm format` (Prettier with write), `pnpm format:check` (check only)
- **Search data generation**: `pnpm generate-search` (rewrites `public/search-index.json`, and fails the build when the lesson list and the filesystem disagree)
- **Spell checking**: `pnpm spell` (cspell on TypeScript and markdown files)
- **Prose linting**: `pnpm prose` (reading budget, title and heading length, sentence length, em dashes, banned constructions, quiz answer patterning). `--only=pid-control` checks one page, `--sentences` prints every over-length sentence in full, `--json` is machine-readable. A finding marked `(advisory)` does not fail the run
- **Quiz answer keys**: `npx tsx scripts/quiz-shuffle.ts --all` rotates a patterned answer key without changing any option's text
- **Full test suite**: `pnpm test` (runs format:check + lint + type-check + build)

Users can substitute `npm`, `yarn`, or `bun` for `pnpm` in any command.

## Code Architecture

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
- **`src/components/shell/Topbar.tsx`**: Breadcrumb, search affordance, and the course-wide derived completion count.
- **`src/components/shell/SearchPalette.tsx`**: ⌘K palette (cmdk + lazy MiniSearch).
- **`src/contexts/ShellContext.tsx`**: `navOpen` / `searchOpen` / `scrollPct` / `mainRef`. Owns ⌘K and Escape.
- **`src/components/PageTemplate.tsx`**: Lesson frame — outline rail + article. Props: `title`, `emphasis`, `lede`, `needs`, `branch`, `time`.

#### Search System

- **`public/search-index.json`**: Search index, generated by `pnpm generate-search`
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
- **`src/components/lesson/Mechanism.tsx`**: the arm/flywheel fork. `<M k="file" />` is an inline slot inside a sentence written once for both; `<Mech for="arm">` is a block only one mechanism reads. Both are server components — every variant ships in the HTML and CSS hides one, keyed off `data-mechanism` on `<html>`, which the root layout's inline script sets from `localStorage` before first paint.
- **`src/components/lesson/MechanismSelector.tsx`**: "What mechanism are you working on?", the first child of a mechanism lesson's `PageTemplate`.

**A mechanism lesson is written once and read twice.** From `/building-subsystems`
onward a student picks Arm or Flywheel at the top and reads a whole lesson
about that mechanism. The prose is not duplicated to do it: a sentence true of
both is written once with a slot in it, and the words that differ live in
`src/data/mechanisms.ts`. That file holds **vocabulary, not sentences** — a
name, a filename, a field, a pair of CAN IDs. If a paragraph is genuinely
different for the two, it is different content and belongs in `<Mech>` on the
page. Adding a `sentence` key to the profile turns it into a second content
store nobody reviews as prose, which is the failure it exists to prevent.
`pnpm prose` prices the default (arm) reading and drops the other branch, so
the budget still describes one student at one bench.

Layout rule: **body copy never leaves `--measure` (820px)**. Code blocks,
tables and figures may take `--gutter` more (`.measure-wide`, 1000px);
paragraphs may not.

**There is no margin rail.** A lesson is one column at every width. `--measure`
was 660px with a 250px note rail to its right until August 2026, and the pair
only ever added up above 1240px — below that the rail collapsed inline and the
column stayed at 660 with 300px of nothing beside it. `<MarginNote>` now stacks
under the paragraph it annotates, styled like `<WatchOut>`, and `"You'll need"`
sits under the lede instead of beside the title. `.split` is kept because fifty
of them are written into the pages, but it is a one-column grid that owns the
gap between a paragraph and its note. Don't reintroduce the rail.

### Route Organization

Lesson order, drawer grouping, the syllabus, and prev/next all come from
`src/data/lessons.ts` — the single source of truth. The course is organized as
six workshops with a strict prerequisite boundary: Workshop 1 is entirely in
Tuner X, Java starts at Workshop 2, autonomous does not depend on the
pose-driving material taught in Workshop 5, and command composition is expanded
in Workshop 6. Historical side routes can remain reachable without appearing in
`LESSONS`.

**Workshop 2 is concepts, Workshop 3 is code.** Splitting them was the point of
the August 2026 regroup: Workshop 2 (Code Foundations) is Java Basics and The
Command Framework, and nothing in it opens an editor. Workshop 3 (Robot
Programming) opens with Project Setup and runs through Logging, and every
lesson in it writes a file. Project Setup sits at the top of Workshop 3 rather
than the bottom of Workshop 2 because making the project is the first thing you
do to write code, not the last idea you learn before writing it. The section
ids stay aligned with the displayed numbers (`workshop3` renders `03`); keep
them that way if a group is ever inserted again.

**`/` is not in `LESSONS`.** Home is the landing page, not lesson 00 — the
lesson count is derived from `LESSONS`; do not hard-code it in UI copy.

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
`/ai-coding-assistant`, `/glossary` → `/introduction`, `/robot-class` →
`/building-subsystems`.

**There is no `/robot-class`.** `Robot.java` was its own lesson until August 2026. `/command-framework` already taught `robotPeriodic()` and the
`Scheduler.getDefault().run()` line, and even quizzes deleting it, so what
actually remained was two `public final` fields. Those now sit in the last
section of `/building-subsystems`, next to the classes they own, because
`mech-1-Mechanisms` is the commit that adds them. Don't reinstate the lesson.

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
- **GitHub Integration**: `GitHubContent` and `MechanismTabs` can embed live files from Workshop-Code, but no page calls them (see the embeds note above)
- **Progressive Learning**: 5-step implementation approach following real development workflow
- **Theme Management**: next-themes for system theme detection and persistence

### Important Implementation Notes

- Theme system uses next-themes with class-based dark mode. Dark is `:root`; light is the `html:not(.dark)` branch
- **The scroll container is `<main id="main-content">`, not the window.** Anything measuring scroll position reads that element — `window.scrollY` is always 0 here
- All workshop pages should use PageTemplate for consistency. A lesson opens with the sentence that teaches (`title` + `emphasis`), not its filing label — the short label lives in `lessons.ts` and is what the breadcrumb and drawer show
- Navigation (drawer groups, syllabus, lesson order, prev/next, lesson numbers) is derived from `src/data/lessons.ts` — add/rename/reorder lessons there
- `LessonSectionId` is the section-id union type in `lessons.ts`; `LessonSection` is the lesson-body component. They were both called `LessonSection` and collided
- After content edits, regenerate the search index with `pnpm generate-search`. There is no `routeMap` any more: `scripts/generate-search-data.ts` reads `src/data/lessons.ts` directly and fails the build when the lesson list and the filesystem disagree, so a renamed lesson needs no second edit
- Build process includes comprehensive testing (lint + type-check + build)
- Search system provides fast fuzzy search across all workshop content using MiniSearch
- Theme transitions use View Transitions API for smooth animated theme switching

## Visual Development

### Design Principles

**`src/app/globals.css` is the design authority.** Read it before making any
visual change — it is a design document as much as a stylesheet, and it
explains _why_ at every decision: why the measure is 820px, why light-mode
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
  `pad` / `step` / `panel` / `stack`. There is no `--spacing-block`.
- **Body copy never leaves `--measure`.** Code, tables and figures may take
  `--gutter` more via `.measure-wide`; paragraphs may not. `--gutter` is that
  allowance, not a rail — nothing sits beside the prose.
- **One accent hue.** If something must stand out and is not the primary
  action, use a mono micro-label (`.micro`), not a second colour.
- **Asides are budgeted.** Roughly two per `LessonSection`, one
  `alert-danger` per lesson. There were 297 of them and a warning stopped
  meaning anything; the "why" belongs in a `<MarginNote>` under the paragraph.

There is no `context/design-principles.md` or `context/style-guide.md` — both
were deleted in August 2026. The first was generic "S-Tier SaaS Dashboard"
boilerplate prescribing a persistent sidebar and admin tables, which describes
neither this site nor its design; the second documented a colour palette that
no longer exists. Do not reinstate either.

### Writing

Two authorities, and they do not overlap. **How a sentence sounds is the
`unslop` skill** (`.claude/skills/unslop/SKILL.md`). **How big a lesson is and
what shape it has is `context/lesson-budget.md`.** `pnpm prose` enforces the
mechanical subset of both. Read both before writing or editing lesson prose.

`context/writing-style.md` was the single authority until August 2026 and is
gone. Its voice rules were replaced wholesale by unslop, which is stricter and
covers more; its curriculum rules moved to `context/lesson-budget.md`
unchanged. Do not reinstate it.

- **Apply unslop's pattern-removal rules 1 to 31. Skip its "Adding soul"
  section.** That section asks for opinions, first person, and deliberate mess.
  The audience is an 11-to-18-year-old following a procedure next to a powered
  mechanism, and personality in a bench procedure costs words without adding
  instruction. The house voice stays flat, in the shape of the CTRE Phoenix 6
  docs.
- **A title is a name, not a pitch.** Noun phrase, five words at most: "PID
  Tuning in Tuner X", not "Tune the motor before a robot program ever touches
  it". `PageTemplate` no longer takes an `emphasis` prop; the accent-italic
  phrase inside a sentence-title went with the sentence-titles.
- **The lesson is the unit of attention, and it is 8 to 12 minutes.** 15 is the
  hard cap and there is no floor. Over the cap, split the lesson. Short is
  fine: a lesson that does its job in four minutes has done its job. Judge a
  short page on whether it has its check and its failure modes, not on length.
- **No em dashes, and no parentheses standing in for them.** unslop rule 13:
  reaching for a bracket instead of a dash trades one tell for another. End the
  sentence or use a comma.
- **Vary sentence length.** Uniformly short sentences are the loudest tell that
  a machine wrote the page, and it is the mistake this site made once already.
- **Bold is functional here, not decorative.** The 280 `<strong>` runs on the
  site name a lesson to go to, a Tuner X control to click, or a term at first
  use. unslop rule 15 bans decorative bolding and this is not that, so an audit
  flagging them all is a false positive. The same goes for rule 16 and the 21
  `You should see:` procedure markers.
- `src/app/(workshop)/pid-control/page.tsx` is the reference implementation.
  Copy its shape.
- **Quiz prose is prose.** `<Quiz>` is in the linter's `SKIP_ELEMENTS`, so for
  a long time its ~6,000 student-facing words were never checked and that is
  where the tells hid. `quizProseFindings` now runs the banned list over every
  question, option, and explanation.

`context/narration-voice.md` does still exist and is worth reading before
writing prose. It measures cadence rather than asserting rules, and its
findings apply to the website, not just the video scripts.

### Quick Visual Check

After any front-end change, run the `visual-check` skill. It drives a real
browser through the `playwright` devDependency, because there is no Playwright
MCP server configured for this project.

### Comprehensive Design Review

Invoke the `@agent-design-review` subagent for thorough design validation when:

- Completing significant UI/UX features
- Before finalizing PRs with visual changes
- Needing comprehensive accessibility and responsiveness testing
