# Lesson Cleanup Prompt

A working prompt for trimming one lesson page down to budget and into the
house voice. Workshops 0 to 2 were done by hand before this existed; this is
the same pass, written down so it runs the same way on the rest.

**This file is temporary.** It is a working doc, not an authority. The
authority on length and shape is `context/lesson-budget.md`, and it stays.
Delete this file once the cleanup pass is finished across the pages you meant
to do. The repo has collected `*-PROMPT.md` files at its root before and they
outlive their usefulness quietly.

Suggested order, worst first. Re-run `pnpm prose` to get current numbers before
starting, since these move:

| page                      | min  |
| ------------------------- | ---- |
| `/coroutines`             | 14.3 |
| `/state-based`            | 12.4 |
| `/chaining-commands`      | 11.8 |
| `/logging-implementation` | 11.8 |

Paste everything below, with `<SLUG>` filled in.

---

```
Clean up one lesson page: src/app/(workshop)/<SLUG>/page.tsx

READ FIRST
- context/lesson-budget.md — the budget, the shape, and what may never be cut.
- CLAUDE.md, the "Writing" and "Workshop Content Stack" sections.
- src/app/(workshop)/pid-control/page.tsx — the reference implementation. Copy its shape.
- Note: CLAUDE.md points at an `unslop` skill at .claude/skills/unslop/SKILL.md.
  That file is NOT in this checkout (.claude/ is gitignored). Do not pretend to
  follow it. `pnpm prose` enforces its mechanical subset; the rest is your
  judgement, listed below.

GROUND TRUTH FOR CODE
- reference/Workshop-Code/<branch>/ — run `pnpm reference:sync` if reference/ is missing.
- Every Java snippet must match the branch the page names in its `branch` prop.
- NOT 2027-Template. It is stale on alpha-6 and is not a source for this site.

MEASURE BEFORE YOU CUT
  pnpm prose --only=<slug>
The budget charges for structure, not just words:
  code block 0.75 min · numbered step 0.25 · bullet 0.10 · table 0.50 · quiz 2.0 · sim 2.5
So on a code- or step-heavy page, tightening prose is the expensive way to buy a
minute. Merging two adjacent code blocks buys 45 seconds; rewriting a paragraph
buys about five. Cut structure first.

CUT IN THIS ORDER
1. A section that repeats another page. Say it once, on the page that owns it.
2. Commentary around a code block. Keep the block, delete the paragraph that
   narrates what the reader can already see.
3. Forward references and "what's next" prose. One sentence at the end, not a section.
4. Asides past the budget: two per lesson, one alert-danger. Before adding one,
   try deleting the sentence instead.
5. Duplicated explanation inside a section.
6. Only then, sentences.

NEVER CUT
- The <Quiz>, any playground, or the "Check your work" section. They are the
  cheapest-looking things on an over-budget page and the most expensive to lose.
- Failure modes — the table or FigureGrid of what goes wrong and why.
- Any number a student types: CAN IDs, gains, tolerances, timeouts.
- Safety instructions.
If it will not fit after cutting prose and duplication, it is two lessons. Say so.

VOICE (judgement, not enforced)
- One idea per sentence. Name the actor.
- Vary sentence length. Uniformly short sentences are the loudest tell that a
  machine wrote the page, and this site made that mistake once already.
- Average 12-16 words, nothing over 25. `pnpm prose --sentences` prints the offenders in full.
- Bold is functional here: a lesson name, a Tuner X control, a term at first use.
  The ~280 existing <strong> runs and the "You should see:" markers are correct — do not strip them.
- Titles are names, <=5 words, noun phrase. Headings: noun phrase or bare
  imperative, no finite verb.

MECHANICAL TRAPS, ALL OF WHICH HAVE BEEN HIT
- `time` prop must be >= what `pnpm prose` measures. Update it when you cut.
- Inside JSX, write -&gt; not -> in <code>. A raw `->` is TS1382 at type-check.
- Quiz `id` must be unique per page. A duplicate throws a React duplicate-key
  error that appears ONLY in the browser console — the build passes. Check with:
    grep -n '^\s*id: [0-9]' "src/app/(workshop)/<slug>/page.tsx"
- If the answer key gets patterned, rotate it: npx tsx scripts/quiz-shuffle.ts --all
  Never edit option text to fix patterning.
- Mechanism-fork pages (<Mech>, <M k="...">) are written once and read twice.
  `pnpm prose` prices the arm reading only, so the flywheel branch is uncounted —
  read it yourself. Vocabulary lives in src/data/mechanisms.ts; whole sentences do not.
- Tokens only, never a Tailwind colour scale. No inline fontSize or text-[Npx].
- After content edits: pnpm generate-search

LEAVE NO ARTIFACTS
- Do not create summary, plan, report or notes .md files in the repo. Report in
  your reply instead. Scratch files go in the session scratchpad directory.
- Delete any .md you did create before you call the work done, and say that you did.
- When the whole cleanup pass is finished, delete context/lesson-cleanup-prompt.md
  itself. It is a working doc, not an authority.

VERIFY
  pnpm prose --only=<slug>    # target <=12 min, hard cap 15, no hard findings
  pnpm generate-search
  pnpm format:check && pnpm type-check && pnpm build

REPORT
Before/after minutes, what you cut and why, and anything you judged too risky to
cut. Do not claim a page is done if a finding is still open.
```
