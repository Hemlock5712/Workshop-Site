# Lesson Budget and Shape

How long a lesson may run, what shape it has, and what it may never cut.

**Voice is not here.** How a sentence sounds is
`.claude/skills/unslop/SKILL.md`, which replaced the voice half of
`context/writing-style.md` in August 2026. This file is the other half: the
curriculum rules, which unslop has no opinion about. `pnpm prose` enforces the
mechanical subset of both.

## Who is reading

A middle schooler, 11 to 14, or a high schooler, 15 to 18. Most have never
written code. They are reading on a laptop next to a mechanism on a bench,
usually with a mentor nearby and a meeting that ends in an hour.

Attention span is the binding constraint. A middle schooler holds focus for
about 10 to 14 minutes. A high schooler manages 15 to 20. A lesson that runs
40 minutes is not a thorough lesson. It is a lesson nobody finishes.

## The budget

**Aim for 8 to 12 minutes. 15 is the hard cap. There is no floor.**

Only the ceiling is enforced. A lesson that does its job in four minutes has
done its job, and a page whose whole job is orientation is finished when it has
oriented you. There was a 6 minute floor until August 2026, on the theory that
a short lesson is one missing its check and its failure modes. That is
sometimes true, and it is not a rule worth failing a build over: it turned into
pressure to pad a page back up to a threshold, which spends a reader's time to
buy a green tick.

Judge a short lesson on what it is missing, not on its length. If it hands a
student a procedure without saying what a good result looks like or what to do
when they do not get one, add those. If it has them and it is short, ship it.

`pnpm prose` computes it, and it charges for structure as well as words,
because a lesson is not a wall of prose:

```
minutes = words / 180
        + 0.75 per code block or embed   a diff against the student's editor
        + 0.25 per numbered step         a round trip to the hardware
        + 0.10 per bullet                prose in list form
        + 0.50 per table                 scanned row by row
        + 2.00 per quiz
        + 2.50 per simulation
```

An identifier inside `<code>` counts as one word, because that is how
`config.Slot0.GravityType` reads.

Which is why a page cannot be judged on word count alone:

|                          | words | structure         | minutes |
| ------------------------ | ----- | ----------------- | ------- |
| `/pathplanner`           | 648   | 13 steps, no code | 9.3     |
| `/vision-implementation` | 1,200 | 8 steps, 2 embeds | 12.2    |

The second carries nearly twice the prose for three more minutes, because the
first spends a third of its budget on a procedure a student stops to perform.
Run `pnpm prose` before deciding what to cut: on a step-heavy page, cutting
words is the expensive way to buy a minute.

A lesson over budget is not fixed by tightening sentences. Fix it by cutting a
section, or by splitting the lesson in two. Tightening buys 10%. Cutting buys
40%.

### What the budget may never buy

A quiz costs 2 minutes and a simulation costs 2.5, and the model charges for
both. That makes them the cheapest-looking thing on an over-budget page and
the most expensive thing to lose. **Never delete a `<Quiz>` or a playground to
fit the budget.** Three pages lost their "Check yourself" exactly that way the
day the charge was introduced, in commit `b092234`.

The same protection covers a procedure step, a safety instruction, a CAN ID, a
gain, and any other number a student types. Pay for the budget out of prose,
duplication, and redundant code embeds. If the page will not fit after that,
it is two lessons: say so instead of cutting the check.

### `time` is wall-clock, and the budget is content

They are different numbers and both are honest. The budget above measures how
much _content_ a page carries: words, steps, code, quizzes, simulations. The
`time` prop states how long the lesson takes end to end, which on a hardware
page includes work no prose can compress. `/autonomous` reads in six minutes
and needs thirty at a bench, and it should say thirty.

The one rule `pnpm prose` enforces is direction: **`time` may exceed the
measured content, never come in under it.** A page that says "12 minutes"
while carrying fourteen is lying to a student deciding whether to start, and
that is exactly what happened when the model learned to charge for quizzes and
six pages silently fell behind.

## Structure of a lesson

```
Title            noun phrase, <= 5 words
Lede             2-3 flat sentences
needs[]          <= 4 items, <= 15 words each
time             honest, e.g. "12 minutes"

Section 1..N     3 to 5 sections, <= 350 words each
Last section     "Check your work" - a concrete, observable result
```

Three to five sections, six at the outside. A lesson with nine sections is two
lessons.

A title is a name, not a pitch: "PID Tuning in Tuner X", not "Tune the motor
before a robot program ever touches it". If it would work on the spine of a
book, it is a title. If it would work on a billboard, delete it. Section
headings are a noun phrase or a bare imperative, six words at most, with no
finite verb. `pnpm prose` rejects any heading containing a copula or a modal,
because that is what turns a heading into a claim.

Every lesson ends with something the student can see, hear, or measure. Not a
summary. A check: "The arm holds position when you let go. The plot shows
error under 0.02 rotations."

Sentences average 12 to 16 words and nothing goes over 25. Do not make them
all short: a page of uniform seven-word sentences is the loudest tell that a
machine wrote it, and it is the mistake this site made once already. See
unslop's rhythm note.

## Asides

Two per lesson, three at the absolute most. One `alert-danger` per lesson.

The site once had 297 of them. A page with six warnings has no warnings on it.
Before adding an aside, try deleting the sentence instead. The "why" belongs
in a `<MarginNote>` in the gutter, where it costs the reader nothing.

## Quizzes

Six questions, four options, exactly one defensible answer, and an
explanation that teaches rather than confirms.

**Quiz prose is prose.** `Quiz` is in the linter's `SKIP_ELEMENTS`, so its
words are not budgeted, but `quizProseFindings` checks every question, option
and explanation against the banned list. Until that check existed, roughly
6,000 student-facing words were unlinted, and that is where the tells hid.

**Vary where the answer sits.** Ten quizzes on this site shipped
`correctAnswer: 1` on every question, so a student could score 100% by always
picking option b having read nothing, and option d was used in four quizzes on
the whole site. `pnpm prose` now fails a quiz whose key lands on one option
60% of the time or uses fewer than three of the four.
`scripts/quiz-shuffle.ts` rotates a patterned key without touching any
option's text.

A distractor a knowledgeable student could argue for is a defect. So is a
question whose answer is not taught on the page: that is trivia, and the fix
is usually to add the missing sentence to the lesson rather than to drop the
question.

## Code

Show the smallest thing that makes the point. A 60-line file that teaches one
method should be an excerpt of that method.

Prose does not narrate code line by line. The code says what it does. Prose
says why it is written that way, and what breaks if it is not.

## The reference

CTRE's Phoenix 6 documentation, at
[v6.docs.ctr-electronics.com](https://v6.docs.ctr-electronics.com/en/stable/).
Read a page before writing one. What to copy is the shape, not the wording:
procedures are numbered, prose explains why while the list says what to do,
paragraphs are two or three sentences and then stop, and a note is a note
rather than one of nine.

## What still binds

Everything in `CLAUDE.md`. WPILib 2027 and Commands v3 only, `org.wpilib.*`
packages, OpModes rather than `RobotContainer`, no invented v3 APIs, no
AdvantageKit, no enums in examples, no `SendableChooser`, CTRE hardware with
no vendor hedging.

Design rules live in `src/app/globals.css` and bind too: design tokens only,
never a Tailwind colour scale, and body copy never leaves `--measure`.

Run `pnpm spell` after any prose pass. cspell has caught this repo before.
