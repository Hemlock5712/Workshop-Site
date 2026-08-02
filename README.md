# Gray Matter Coding Workshop Website

🌐 **Live Site: [frc5712.com](https://frc5712.com)**

[![CI/CD Pipeline](https://github.com/Hemlock5712/Workshop-Site/workflows/CI/CD%20Pipeline/badge.svg)](https://github.com/Hemlock5712/Workshop-Site/actions)
[![Deploy with Vercel](https://vercel.com/button)](https://frc5712.com)

An interactive FRC programming workshop built with Next.js and Tailwind CSS. The site walks teams from hardware setup through PID tuning, swerve drive, autonomous, logging, vision, and state machines — with live code embeds, interactive playgrounds, and video lessons.

## 🎯 What It Teaches

All content targets the **WPILib 2027 alpha stack**, not the classic Commands v2 framework:

- **Commands v3 + OpModes** (`org.wpilib.command3`) — subsystems extend `Mechanism`; each mode is its own `@Teleop` / `@Autonomous` class with its bindings in the constructor. There is no `RobotContainer`.
- **Java 25**, deploying to **SystemCore** (not roboRIO), with Phoenix 6 alpha and GradleRIO 2027 alpha.
- **Command conventions**: mechanism commands are persistent **holds** — `runRepeatedly(...)` re-sending the closed-loop request, named with a `(hold)` suffix — bound with `whileTrue` so releasing the button returns the mechanism to its default command. Routines are built by **chaining**: `Command.sequence`, call-site `.until(mech::isAtTarget)`, `Command.race(step, hold)`, and `.withTimeout(...)` as the seatbelt. A hold never finishes, so nothing may ever wait on a hold.
- **Autonomous** uses CTRE `DriveToPose` and `LinearPath` — the workshop does not use PathPlanner.
- **Logging** uses WPILib's `DataLogManager` — the workshop does not use AdvantageKit.

Ground truth for all Java examples is the [2027-Template](https://github.com/Hemlock5712/2027-Template) repository. Lesson pages embed live files and PR diffs from the companion [Workshop-Code](https://github.com/Hemlock5712/Workshop-Code) repository, whose numbered branches build each mechanism step by step.

## 📚 Curriculum

Lesson order, sidebar grouping, and prev/next navigation all come from [`src/data/lessons.ts`](src/data/lessons.ts):

```
Getting Started:
├── /                        Homepage (team, mechanisms, overview)
├── /introduction            Workshop introduction
├── /prerequisites           Required software & hardware
└── /mechanism-cad           CAD files and 3D models

Workshop #1:
├── /hardware                CTRE hardware setup
├── /project-setup           WPILib project creation
├── /command-framework       Command-Based Framework (Commands v3 concepts)
├── /building-subsystems     Mechanisms
├── /adding-commands         Commands
├── /triggers                Triggers
├── /running-program         Run code with hardware sim
├── /mechanism-setup         Mechanism selection & setup
├── /pid-control             PID control + interactive playground
└── /motion-magic            Motion Magic profiled movement

Workshop #2:
├── /swerve-prerequisites    Swerve drive prerequisites
├── /swerve-drive-project    Creating a swerve drive project
├── /pathplanner             Autonomous: Driving to a Pose (CTRE DriveToPose —
│                            the slug is historical; the page no longer teaches PathPlanner)
├── /swerve-calibration      Swerve calibration
├── /logging-options         Logging strategies (DataLogManager)
├── /logging-implementation  Logging system setup
├── /drive-to-point          Drive to point navigation with PID
├── /vision-options          Computer vision approaches
└── /vision-implementation   Vision system integration

Advanced Topics:
├── /vision-shooting         Dynamic Flywheel Control
├── /state-based             State Machines (command3 StateMachine)
└── /advanced-drive-to-point Advanced: Profiled Drive to Point (LinearPath)

Utility pages (outside lesson navigation):
└── /search, /glossary, /planner, /privacy
```

## 🚀 Getting Started

Requires Node.js 20+. The project uses **pnpm** by default, but npm/yarn/bun work interchangeably.

```bash
pnpm install
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

### Development Commands

- `pnpm dev` – start the local development server with Turbopack
- `pnpm build` – build for production (regenerates the search index first)
- `pnpm start` – start the production server
- `pnpm lint` – lint code with ESLint
- `pnpm type-check` – check TypeScript types
- `pnpm format` / `pnpm format:check` – format code with Prettier / check only
- `pnpm generate-search` – regenerate the search index (`src/data/searchData.ts`)
- `pnpm spell` – spell-check TypeScript and markdown files
- `pnpm test` – full suite: format:check + lint + type-check + build

After editing page content, run `pnpm generate-search` and then `pnpm format` — the search index is regenerated unformatted, and `format:check` will fail otherwise.

## 🛠 Tech Stack

- **Framework:** Next.js 16 with App Router
- **UI:** React 19, Tailwind CSS 4 (dark mode via next-themes)
- **Language:** TypeScript
- **Search:** MiniSearch fuzzy search
- **Deployment:** Vercel

## 📁 Project Structure

```
src/
├── app/
│   ├── (workshop)/          # All lesson & utility pages (one folder per route)
│   ├── (planner)/planner/   # Season planner tool
│   ├── api/chat/            # AI assistant endpoint (Gemini + File Search)
│   ├── api/github/          # File fetcher for live Workshop-Code embeds
│   ├── video/               # Unlisted preview page for workshop videos
│   └── layout.tsx           # Root layout (theme, sidebar, search bar)
├── components/              # Sidebar, PageTemplate, GitHubContent, Box,
│                            # interactive playgrounds, quizzes, planner UI…
├── data/                    # lessons.ts (navigation source of truth),
│                            # searchData.ts, bills of materials
├── lib/                     # Search config, playground physics, planner logic
├── hooks/                   # Keyboard navigation, planner hooks
└── contexts/                # Sidebar state
scripts/                     # Search index generator + File Search indexers
videos/                      # Remotion project that renders the workshop videos
context/                     # Design principles and style guide
public/                      # Images, 3D models, downloads
```

Navigation (sidebar groups, lesson order, prev/next links) is derived entirely from `src/data/lessons.ts` — add or reorder lessons there. See [CLAUDE.md](CLAUDE.md) for the full architecture and content-authoring reference.

## 🤖 AI Assistant

[Coding with an AI Assistant](https://frc5712.com/ai-coding-assistant) is an optional Workshop #1 lesson on pointing Claude Code, GitHub Copilot, or OpenAI Codex at your own robot project — including the Agent Skills that ship in the [2027-Template](https://github.com/Hemlock5712/2027-Template) and how to spot an assistant that answered in Commands v2.

The site itself no longer hosts a chat bot. The Gemini-backed `/ai-assistant` page and its File Search index were removed in August 2026: a retrieval index of these pages went stale faster than the pages did, and the workshop would rather teach the tools students already have open. There is no API key to configure — the site runs entirely without one.

## 🌐 Deployment

The site auto-deploys to Vercel: every push to `master` ships to [frc5712.com](https://frc5712.com), and pull requests get preview deployments. GitHub Actions (`.github/workflows/ci.yml`) runs lint, type-check, spell-check, and build on every push and PR.

To deploy your own copy, fork the repository and import it at [vercel.com](https://vercel.com).

## 🤝 Contributing

1. Fork the repository: [https://github.com/Hemlock5712/Workshop-Site](https://github.com/Hemlock5712/Workshop-Site)
2. Create a feature branch
3. Make your changes (lesson navigation lives in `src/data/lessons.ts`)
4. Run `pnpm test && pnpm spell`
5. Submit a pull request

## 📄 License

Educational content based on Gray Matter Coding Workshop materials.
