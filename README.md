# Gray Matter Coding Workshop

**Live site: [frc5712.com](https://frc5712.com)**

[![CI/CD Pipeline](https://github.com/Hemlock5712/Workshop-Site/workflows/CI/CD%20Pipeline/badge.svg)](https://github.com/Hemlock5712/Workshop-Site/actions)

An FRC programming course built with Next.js 16. It starts with wiring and
tuning a motor in Phoenix Tuner X, moves to writing a robot program, and ends
with swerve, autonomous and vision. Lessons include interactive simulators,
quizzes, and an arm or flywheel version of the same page.

## What it teaches

All robot code targets the WPILib 2027 alpha stack:

- Commands v3 and OpModes (`org.wpilib.command3`). There is no `RobotContainer`.
- Java 25 on SystemCore, Phoenix 6 alpha, GradleRIO 2027 alpha.
- Logging with WPILib `DataLogManager`. No AdvantageKit.
- PathPlanner through the team's Commands v3 build of PathPlannerLib.
- Vision through the LimelightLib 2 vendordep.

Every Java example is checked against
[Workshop-Code](https://github.com/Hemlock5712/Workshop-Code) and the shipped
WPILib source.

## Lessons

The course is Getting Started plus six workshops. Lesson order, workshop
grouping, numbering, the menu, search and prev/next all come from
[`src/data/lessons.ts`](src/data/lessons.ts). Change them there. Each lesson
is a folder under `src/app/(workshop)/`. Retired slugs redirect in
`next.config.ts`.

## Setup

Node.js 22.18 or later and pnpm. cspell and Vitest refuse older Node versions.

```bash
pnpm install
pnpm dev        # http://localhost:3000
```

Run one dev server at a time. Two servers on one checkout share `.next` and
break each other.

## Commands

| Command                   | What it does                                                  |
| ------------------------- | ------------------------------------------------------------- |
| `pnpm dev` / `pnpm start` | Dev server / production server                                |
| `pnpm build`              | Regenerates the search index, then `next build`               |
| `pnpm test`               | format:check, lint, type-check, unit tests, build             |
| `pnpm lint`               | ESLint on `src/` and `scripts/`                               |
| `pnpm type-check`         | `tsc --noEmit`                                                |
| `pnpm test:unit`          | Vitest on the simulator physics and metadata helper           |
| `pnpm prose`              | Lesson length, title and sentence length, banned phrasing     |
| `pnpm spell`              | cspell                                                        |
| `pnpm format`             | Prettier                                                      |
| `pnpm generate-search`    | Rebuilds `public/search-index.json`                           |
| `pnpm check-embeds`       | Checks any Workshop-Code embeds resolve on GitHub             |
| `pnpm reference:sync`     | Puts every Workshop-Code branch on disk under `reference/`    |
| `pnpm reference:refresh`  | Updates those copies and prunes deleted branches              |
| `pnpm workshop-code`      | A writable Workshop-Code clone for changing the teaching code |

## Folders

- `reference/`: local, gitignored copies of every Workshop-Code branch, for authoring only.
- `videos-next/`: the lesson video series, one video per lesson. See `videos-next/series/BUILD.md`.
- `context/`: the lesson budget, narration notes and the current to-do list.

## Deployment

Vercel deploys `master` to frc5712.com and builds a preview for every pull
request. GitHub Actions runs format, lint, type-check, unit tests, prose,
spell, build and the embed check.

## Contributing

Read [CLAUDE.md](CLAUDE.md) first. It holds the content, code and design
rules for this repo. Branch from `master`, run `pnpm test`, `pnpm prose` and
`pnpm spell`, then open a pull request.

## License

Educational content based on Gray Matter Coding Workshop materials.
