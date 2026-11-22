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

Gray Matter Workshop is an FRC Programming Workshop website built with Next.js 16, focusing on teaching best programming practices, hardware setup, command-based programming, and PID tuning. The site transforms Canva presentation content into an interactive web learning platform.

**Live Site:** [frc5712.com](https://frc5712.com)  
**Repository:** [https://github.com/Hemlock5712/Workshop-Site](https://github.com/Hemlock5712/Workshop-Site)  
**Workshop Code:** [https://github.com/Hemlock5712/Workshop-Code](https://github.com/Hemlock5712/Workshop-Code)  
**Robot Template (NOT a source for this site, see below):** [https://github.com/Hemlock5712/2027-Template](https://github.com/Hemlock5712/2027-Template)

## Where the detail lives

This file is loaded into every session, so it holds only what applies to every
task. The rest was moved, unchanged, into `context/` in November 2026. **Read
the matching file before starting that kind of work, and not otherwise.**

| Before you...                                                          | Read                            |
| ---------------------------------------------------------------------- | ------------------------------- |
| write or edit Java, robot-code prose, or a Workshop-Code branch        | `context/teaching-code.md`      |
| add, rename, reorder, merge or reinstate a lesson, or touch a redirect | `context/curriculum.md`         |
| change the shell, search, theme, or a lesson building block            | `context/site-architecture.md`  |
| make a visual change or edit lesson prose                              | `context/design-and-writing.md` |
| size or shape a lesson                                                 | `context/lesson-budget.md`      |
| touch `videos-next/` or `/video`                                       | `context/videos.md`             |
| write narration                                                        | `context/narration-voice.md`    |

A decision recorded in one of those files is the owner's and still binds. When
a new one is made, record it in the matching file, not here.

## Rules that apply everywhere

### Teaching code

- The course teaches the **WPILib 2027 alpha stack, Commands v3 + OpModes**,
  on SystemCore. Never Commands v2, never `RobotContainer`, and never mention
  v2 to students.
- **Never invent an API.** Ground truth is
  [Workshop-Code](https://github.com/Hemlock5712/Workshop-Code), checked
  against shipped WPILib 2027 alpha source; WPILib wins a disagreement.
  2027-Template is stale and is not a source.
- Every branch of Workshop-Code is on disk under `reference/Workshop-Code/`
  (`pnpm reference:sync`). Check a lesson against it. Don't commit there; use
  `pnpm workshop-code` to change teaching code.
- No enums and no AdvantageKit in example code. Lambdas are `() -> foo()`,
  never `foo::bar`. The controller is `CommandXboxController`, a field on
  `Robot`.
- There is no implicit default command, and canceling is not stopping. Never
  write that a mechanism "falls back to `idle()`".
- Paths are BLine, not PathPlanner. Every pose is blue-wall origin.
- Students must not be able to copy our gains: screenshots or `0.0`
  placeholders, never a tuned `CodeBlock`.

### The site

- `src/data/lessons.ts` is the single source for lesson order, numbers,
  grouping and prev/next. Never hard-code a lesson count or number.
- Many lessons and slugs were retired on purpose. Check
  `context/curriculum.md` before creating a page or restoring one.
- Every lesson page uses `PageTemplate` and the lesson vocabulary in
  `src/components/lesson/`. `src/app/(workshop)/pid-control/page.tsx` is the
  reference implementation.
- The scroll container is `<main id="main-content">`, not the window.
- **Tokens only.** Tailwind colour scales (`text-slate-600`) are unregistered
  and render as nothing. No inline `fontSize` or `text-[Npx]`. One accent hue.
  `src/app/globals.css` is the design authority.
- Body copy never leaves `--measure`. There is no sidebar and no margin rail.
- After content edits run `pnpm generate-search`. After a front-end change run
  the `visual-check` skill.

### Prose

- A title is a noun phrase of five words at most. A lesson is 8 to 12 minutes,
  15 at the cap.
- No em dashes and no parentheses standing in for them. Vary sentence length.
  No emoji. Flat procedural voice.
- `pnpm prose` enforces the mechanical subset; `--only=<slug>` checks one page.

### Videos

- No lesson page links or embeds the videos until the owner says so.
- Never commit or upload the voice reference, the venv, or generated clips.

## Development Commands

Requires Node.js 22.18+: cspell and Vitest refuse older versions, and CI runs Node 22 (Bun v1+ supported). Project uses pnpm by default, but npm/yarn/bun work interchangeably.

### Essential Commands

- **Development server**: `pnpm dev` (with Turbopack for faster builds). One at a time, and see **Development Server Rules** above
- **Production build**: `pnpm build` (runs `generate-search`, then `next build`)
- **Production server**: `pnpm start`
- **Linting**: `pnpm lint` (ESLint with Next.js config). ESLint's TypeScript plugins refuse TS 7, so `.pnpmfile.cjs` gives that chain its own TS 6 while `tsc` and the build stay on 7. `.mjs` files are not linted
- **Unit tests**: `pnpm test:unit` (Vitest; behavioral tests on the playground physics in `src/lib/*Physics.ts`)
- **Type checking**: `pnpm type-check` (TypeScript compiler check)
- **Code formatting**: `pnpm format` (Prettier with write), `pnpm format:check` (check only)
- **Search data generation**: `pnpm generate-search` (rewrites `public/search-index.json`, and fails the build when the lesson list and the filesystem disagree)
- **Spell checking**: `pnpm spell` (cspell on TypeScript and markdown files)
- **Prose linting**: `pnpm prose` (reading budget, title and heading length, sentence length, em dashes, banned constructions, quiz answer patterning). `--only=pid-control` checks one page, `--sentences` prints every over-length sentence in full, `--json` is machine-readable. A finding marked `(advisory)` does not fail the run
- **Quiz answer keys**: `npx tsx scripts/quiz-shuffle.ts --all` rotates a patterned answer key without changing any option's text
- **Full test suite**: `pnpm test` (runs format:check + lint + type-check + test:unit + build)

Users can substitute `npm`, `yarn`, or `bun` for `pnpm` in any command.

<!-- BEGIN:nextjs-agent-rules -->

# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->
