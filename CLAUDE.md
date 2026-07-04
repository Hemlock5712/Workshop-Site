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

- **Framework**: Next.js 15.4.6 with App Router (`src/app/` directory)
- **UI Library**: React 19.1.0
- **Styling**: Tailwind CSS 4 with dark mode support
- **Theme Management**: next-themes for theme state and system preference detection
- **Type Safety**: TypeScript with strict configuration
- **Icons**: Lucide React icons
- **Syntax Highlighting**: React Syntax Highlighter
- **Search**: MiniSearch for fast fuzzy search functionality

### Key Components Architecture

#### Layout & Navigation

- **`src/app/layout.tsx`**: Root layout with theme setup, font configuration, sidebar integration, and search bar
- **`src/components/Sidebar.tsx`**: Collapsible navigation with workshop organization, tooltips, and responsive design
- **`src/components/PageTemplate.tsx`**: Consistent page wrapper with prev/next navigation and prose styling
- **`src/components/SearchBar.tsx`**: Fuzzy search component with MiniSearch integration

#### Search System

- **`src/data/searchData.ts`**: Comprehensive search index of all workshop content
- **`src/lib/searchConfig.ts`**: MiniSearch configuration and result mapping
- **Search Features**: Fuzzy search, keyboard navigation, category filtering, match highlighting, prefix matching
- **Integration**: Search bar positioned in top right corner of header

#### Theme System

- **`src/components/ThemeProvider.tsx`**: Theme provider wrapper using next-themes
- **`src/components/ui/animated-theme-toggler.tsx`**: Animated theme toggle with smooth visual transitions
- **Implementation**: Uses `class` attribute with next-themes for theme management
- **Modes**: light, dark, system (follows OS preference with automatic detection)
- **Integration**: Tailwind CSS `dark:` classes throughout the app
- **Animation**: View Transitions API for smooth theme switching with circular reveal effect

#### Content Components

- **`src/components/CodeBlock.tsx`**: Syntax-highlighted code display
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

Lesson order, sidebar grouping, and prev/next navigation all come from `src/data/lessons.ts` — the single source of truth. Current structure:

```
Getting Started:
├── / (Homepage with team, mechanisms, overview)
├── /introduction (Workshop introduction)
├── /prerequisites (Required software & hardware)
└── /mechanism-cad (CAD files and 3D modeling)

Workshop #1:
├── /hardware (CTRE hardware setup)
├── /project-setup (WPILib project creation)
├── /command-framework (Command-Based Framework — Commands v3 concepts)
├── /building-subsystems (Mechanisms)
├── /adding-commands (Commands)
├── /triggers (Triggers)
├── /running-program (Run code with hardware sim)
├── /mechanism-setup (Mechanism selection & setup)
├── /pid-control (PID control + interactive playground)
└── /motion-magic (Motion Magic profiled movement)

Workshop #2:
├── /swerve-prerequisites (Swerve drive prerequisites)
├── /swerve-drive-project (Creating a swerve drive project)
├── /pathplanner (Autonomous: Driving to a Pose — CTRE DriveToPose; slug is historical, page no longer teaches PathPlanner)
├── /swerve-calibration (Swerve calibration)
├── /logging-options (Logging strategies — DataLogManager)
├── /logging-implementation (Logging system setup)
├── /drive-to-point (Drive to point navigation with PID)
├── /vision-options (Computer vision approaches)
└── /vision-implementation (Vision system integration)

Advanced Topics:
├── /vision-shooting (Dynamic Flywheel Control)
├── /state-based (State Machines — command3 StateMachine)
└── /advanced-drive-to-point (Advanced: Profiled Drive to Point — LinearPath)

Utility (outside lesson navigation):
├── /search, /glossary, /ai-assistant, /planner, /privacy
```

### Asset Management

- **Images**: Stored in `public/images/` with organized subdirectories
- **Optimization**: All images use Next.js Image component
- **Structure**: `presenters/`, `mechanisms/`, `hardware/` folders

### Development Patterns

- **File Naming**: kebab-case for routes, PascalCase for components
- **Import Alias**: `@/*` maps to `src/*`
- **Component Structure**: Functional components with TypeScript interfaces
- **Styling**: Tailwind utility classes with dark mode variants. Use template literals for conditional classNames (e.g., ``className={`p-4 ${isOpen ? "px-6" : "px-2"}`}``). The `cn()` utility from `@/lib/utils` is reserved for UI primitives only (`Box.tsx`, `button.tsx`, `animated-theme-toggler.tsx`).
- **Navigation**: Client-side routing with active state management
- **Video Integration**: YouTube embeds for educational content
- **Code Learning**: Tabbed interfaces combining final code with development process
- **GitHub Integration**: Live embedding of Workshop-Code repository with PR progression
- **Progressive Learning**: 5-step implementation approach following real development workflow
- **Theme Management**: next-themes for system theme detection and persistence

### Important Implementation Notes

- Theme system uses next-themes with class-based dark mode
- Sidebar state management handles responsive behavior and tooltips
- All workshop pages should use PageTemplate for consistency
- Navigation (sidebar groups, lesson order, prev/next) is derived from `src/data/lessons.ts` — add/rename/reorder lessons there, not in Sidebar
- After content edits, regenerate the search index with `pnpm generate-search`; page titles/descriptions for search come from the hardcoded `routeMap` in `scripts/generate-search-data.js`, so update that map when a page's title or focus changes
- Build process includes comprehensive testing (lint + type-check + build)
- Search system provides fast fuzzy search across all workshop content using MiniSearch
- Theme transitions use View Transitions API for smooth animated theme switching

## Visual Development

### Design Principles

- Comprehensive design checklist in `/context/design-principles.md`
- Brand style guide in `/context/style-guide.md`
- When making visual (front-end, UI/UX) changes, always refer to these files for guidance

### Quick Visual Check

IMMEDIATELY after implementing any front-end change:

1. **Identify what changed** - Review the modified components/pages
2. **Navigate to affected pages** - Use `mcp__playwright__browser_navigate` to visit each changed view
3. **Verify design compliance** - Compare against `/context/design-principles.md` and `/context/style-guide.md`
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
