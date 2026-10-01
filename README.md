# Gray Matter Coding Workshop Website

**Live site: [frc5712.com](https://frc5712.com)**

[![CI/CD Pipeline](https://github.com/Hemlock5712/Workshop-Site/workflows/CI/CD%20Pipeline/badge.svg)](https://github.com/Hemlock5712/Workshop-Site/actions)

An FRC programming course built with Next.js. It takes a team from wiring a
motor and tuning it in Phoenix Tuner X, through writing a Commands v3 robot
program, to swerve, autonomous and vision. Lessons carry interactive
playgrounds, quizzes and an arm-or-flywheel reading of the same page.

## What it teaches

Everything targets the **WPILib 2027 alpha stack**, not Commands v2:

- **Commands v3 + OpModes** (`org.wpilib.command3`). Mechanisms `implement
Mechanism`; each mode is its own `@Teleop` / `@Autonomous` / `@Utility`
  class. There is no `RobotContainer`.
- **Java 25** on **SystemCore**, with Phoenix 6 alpha and GradleRIO 2027 alpha.
- **Logging** with WPILib's `DataLogManager`. No AdvantageKit.
- **Vision** with the LimelightLib 2 vendordep.

Ground truth for every Java example is
[Workshop-Code](https://github.com/Hemlock5712/Workshop-Code), checked against
shipped WPILib source. [CLAUDE.md](CLAUDE.md) holds the full content rules.

## Curriculum

Six workshops. Order, grouping, numbering, the menu, search and prev/next all
come from [`src/data/lessons.ts`](src/data/lessons.ts); edit it there, not here.

```
00 Getting Started       /introduction  /prerequisites  /mechanism-cad
01 Hardware & CTRE       /hardware  /mechanism-setup  /pid-control  /motion-magic
02 Code Foundations      /java-basics  /command-framework
03 Robot Programming     /project-setup  /mechanisms  /adding-commands  /opmodes
                         /running-program  /motion-magic-code
04 Routines              /chaining-commands  /finish-conditions  /coroutines
                         /logging-implementation
05 Swerve & Autonomous   /swerve-prerequisites  /swerve-drive-project
                         /swerve-calibration  /pathplanner  /autonomous
06 Vision & Navigation   /vision-hardware  /vision-implementation  /drive-to-point
                         /advanced-drive-to-point  /dynamic-path-planning
                         /drive-to-tag-inline
```

Workshop 1 is entirely in Tuner X, Workshop 2 is concepts with no editor open,
and every lesson in Workshop 3 writes a file. Outside the lesson list: `/` (home),
`/search`, `/privacy`, `/video` (unlisted previews) and `/ai-coding-assistant`.
Retired slugs redirect in `next.config.ts`.

## Getting started

Node.js 20+ and pnpm.

```bash
pnpm install
pnpm dev        # http://localhost:3000, Turbopack
```

Run one dev server at a time. Two on the same checkout share `.next` and break
each other; see CLAUDE.md.

### Commands

| Command                   | What it does                                                                           |
| ------------------------- | -------------------------------------------------------------------------------------- |
| `pnpm dev` / `pnpm start` | Dev server / production server                                                         |
| `pnpm build`              | Regenerates `public/search-index.json`, then `next build`                              |
| `pnpm test`               | format:check, lint, type-check, unit tests, build                                      |
| `pnpm lint`               | ESLint (`next/core-web-vitals`, React Compiler rules)                                  |
| `pnpm type-check`         | `tsc --noEmit` (TypeScript 7)                                                          |
| `pnpm test:unit`          | Vitest: the playground physics models and the metadata helper                          |
| `pnpm prose`              | Reading budget, title and sentence length, banned phrasing, retired names              |
| `pnpm spell`              | cspell                                                                                 |
| `pnpm format`             | Prettier                                                                               |
| `pnpm generate-search`    | Rebuilds the search index; fails if `lessons.ts` and the routes disagree               |
| `pnpm reference:sync`     | Every Workshop-Code branch on disk as a read-only worktree under `reference/`          |
| `pnpm reference:refresh`  | Fetches and fast-forwards those worktrees, prunes deleted branches                     |
| `pnpm workshop-code`      | A writable Workshop-Code clone at `reference/work/Workshop-Code`, every branch tracked |

`reference/` is gitignored and is for authoring only; nothing at build time
reads it. Edit teaching code in `reference/work/Workshop-Code`, run
`./gradlew build` on every branch you moved, push, then `pnpm reference:refresh`.

## Project structure

```
src/
  app/
    (workshop)/       one folder per route, every lesson and utility page
    api/github/       allowlisted file fetcher for Workshop-Code embeds
    layout.tsx        fonts, theme, per-page title template, analytics
    sitemap.ts        home plus every lesson in LESSONS
    robots.ts
  components/
    shell/            WorkshopShell, AppRail, CurriculumDrawer, Topbar,
                      SearchPalette (Cmd-K), SkipLink
    lesson/           LessonSection, Prose, LessonOutline, LessonKicker,
                      Mechanism (<M> / <Mech>), MechanismSelector, explainers
    PageTemplate.tsx  the lesson frame: outline rail, article, prev/next
    Interactive*Playground.tsx   PID, flywheel and elevator simulators
  contexts/           ShellContext (drawer, search, scroll progress)
  data/               lessons.ts, mechanisms.ts, bills of materials
  lib/                physics models and their tests, search config,
                      lessonMetadata.ts
scripts/              search index, prose linter, quiz shuffler, reference sync
context/              lesson budget and narration notes
videos/               Remotion project for the workshop trailers
public/               images, CAD, 3D models, search-index.json
```

There is no sidebar, no chat endpoint and no planner in this repository.
`src/app/globals.css` is the design authority: colour and type are tokens, and
Tailwind colour scales are not registered.

## Deployment

Vercel deploys every push to `master` to [frc5712.com](https://frc5712.com)
and builds a preview for every pull request. GitHub Actions runs format, lint,
type-check, unit tests, prose, spell and build.

## Contributing

1. Branch from `master`.
2. Make the change. Lesson navigation lives in `src/data/lessons.ts`.
3. Run `pnpm test`, `pnpm prose` and `pnpm spell`.
4. Open a pull request.

## License

Educational content based on Gray Matter Coding Workshop materials.
