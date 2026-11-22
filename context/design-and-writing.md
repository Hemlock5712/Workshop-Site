# Design and writing rules

Moved out of CLAUDE.md in November 2026. Read this before any visual change
or any edit to lesson prose.

## Visual development

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
- **Asides are budgeted.** Two per lesson, three at most (`pnpm prose`
  enforces three per page), and one `alert-danger` per lesson. There were 297 of them and a warning stopped
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

**The `unslop` skill is not in this repository.** `.claude/` is gitignored, so
the rules referenced above live only on whoever's machine created them. What is
enforceable is in `pnpm prose`, whose `BANNED` list its own comments describe as
"the mechanically checkable subset" of unslop. Treat the rest as judgement until
the skill is committed somewhere tracked.

`context/narration-voice.md` is the voice guide for the lesson videos and is
worth reading before writing prose too. Its cadence findings apply to the
website, not just the video scripts.

### Quick Visual Check

After any front-end change, run the `visual-check` skill. It drives a real
browser through the `playwright` devDependency, because there is no Playwright
MCP server configured for this project.

### Comprehensive Design Review

Invoke the `@agent-design-review` subagent for thorough design validation when:

- Completing significant UI/UX features
- Before finalizing PRs with visual changes
- Needing comprehensive accessibility and responsiveness testing
