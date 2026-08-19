# Writing Style

The rules for every word a student reads on this site: page titles, ledes,
section headings, body copy, asides, table cells, figure captions.

`pnpm prose` checks the mechanical subset. This file covers the rest.

## Who is reading

A middle schooler, 11 to 14, or a high schooler, 15 to 18. Most have never
written code. They are reading on a laptop next to a mechanism on a bench,
usually with a mentor nearby and a meeting that ends in an hour.

Attention span is the binding constraint. A middle schooler holds focus for
about 10 to 14 minutes. A high schooler manages 15 to 20. A lesson that runs
40 minutes is not a thorough lesson. It is a lesson nobody finishes.

## The budget

**Aim for 8 to 12 minutes. 15 is the hard cap, 6 is the enforced floor.**

The band is the target and the floor is the gate. A page whose whole job is
orientation, like the overview, can sit at 7 and be finished; a lesson with a
bench procedure in it should not.

There is a floor as well as a ceiling, and it matters as much. Workshop 1 is
the foundation of the course now that the hardware has to work in Tuner X
before anyone opens VS Code, and several of its lessons run under 5 minutes.
That is not concision. That is a lesson that hands a student a procedure
without telling them what a good result looks like or what to do when they do
not get one. A short lesson gets the missing procedure, the failure modes, and
the check added. A long one gets cut.

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

A lesson over budget is not fixed by tightening sentences. It is fixed by
cutting a section, or by splitting the lesson in two. Tightening buys 10%.
Cutting buys 40%.

### What the budget may never buy

A quiz costs 2 minutes and a simulation costs 2.5, and both are charged. That
makes them the cheapest-looking thing on an over-budget page and the most
expensive thing to lose. **Never delete a `<Quiz>` or a playground to fit the
budget.** Three pages lost their "Check yourself" exactly that way the day the
charge was introduced.

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
measured content, never come in under it.** A page that says "12 minutes" while
carrying fourteen is lying to a student deciding whether to start, and it is
exactly what happened when the model learned to charge for quizzes and six
pages silently fell behind.

## The reference

CTRE's Phoenix 6 documentation, at
[v6.docs.ctr-electronics.com](https://v6.docs.ctr-electronics.com/en/stable/).
Read a page before writing one. What to copy:

- Headings name the thing. "Motor Orientation". "Status Light Reference".
  "Actuator Limits". Never a sentence, never a promise.
- Procedures are numbered. Prose explains why; the list says what to do.
- Paragraphs are two or three sentences and then stop.
- A note is a note. There are two or three on a page, not nine.
- Nothing is oversold. The docs never tell you a feature is powerful.

## Titles

**A title is a name, not a pitch.** Noun phrase, five words at the most, and it
should be the phrase a student would type into search. `pnpm prose` enforces the
five.

| Write                          | Not                                                       |
| ------------------------------ | --------------------------------------------------------- |
| PID Tuning in Tuner X          | Tune the motor before a robot program ever touches it     |
| Swerve Calibration             | Getting all four modules to agree on which way is forward |
| Command Composition            | Building longer behaviors out of shorter ones             |
| FRC Team 5712 Coding Workshops | Programming a robot, taught the way it's actually learned |

The test: if the title would work on the spine of a book, it is a title. If it
would work on a billboard, delete it.

There is no accent-italic phrase inside a title. `PageTemplate` used to take an
`emphasis` prop for that and no longer does.

## Section headings

Noun phrase or bare imperative, six words at the most.

| Write                  | Not                                           |
| ---------------------- | --------------------------------------------- |
| Tune feedforward first | Tune the predictable output first             |
| Three failure shapes   | Know the three failure shapes                 |
| Save the gains         | Save a result Workshop 2 can use              |
| Wire the CANivore      | Get the hardware talking before anything else |
| Required hardware      | The hardware is required                      |
| Parts of a lesson      | How a lesson works                            |

A copula or a modal is what turns a heading into a claim, so `pnpm prose`
rejects any heading containing one: `is`, `are`, `was`, `were`, `can`, `will`,
`should`, `must`, `does`, `do`, `has`, `have`. "Three failure shapes" and "Fix
the units first" have no finite verb and pass.

## Ledes

Two or three sentences under the title. What this lesson does, what it leaves
behind, and any hard prerequisite. Plain and flat. It is the answer to "am I on
the right page," not a hook.

> The TalonFX runs the control loop itself. Tuner X sends the setpoint, plots
> the response, and saves the gains. No Java yet.

## Sentences

Average 12 to 16 words. Nothing over 25.

**But do not make them all short.** A page of uniform seven-word sentences is
the single loudest tell that a machine wrote it, and it is the mistake this
site made last time. Vary the length. A five-word sentence next to a
twenty-word sentence reads like a person. Twenty seven-word sentences in a row
read like a form letter.

## The dash

**No em dashes. None.** Not `—`, not `&mdash;`, not `-` standing in for one.

An em dash is almost always a sentence that did not decide where it ended. Fix
it, do not punctuate it:

| Instead of                                            | Write                                                |
| ----------------------------------------------------- | ---------------------------------------------------- |
| The loop runs on the controller — not on your laptop. | The loop runs on the controller, not on your laptop. |
| Set kP first — it does most of the work.              | Set kP first. It does most of the work.              |
| Three things break here — wiring, IDs, and firmware.  | Three things break here: wiring, IDs, and firmware.  |

Hyphens in compound words (`closed-loop`, `open-source`) are fine. Ranges use
`to`, not a dash: "10 to 14 minutes".

## Banned constructions

These are the tells. Every one of them appeared on this site.

**The reversal.** "It's not X, it's Y." "This isn't about speed. It's about
control." Say the thing you mean once.

**The rhetorical triple.** "Feedback corrects. Feedforward predicts. Motion
Magic plans." A recap dressed as an insight.

**The significance close.** Ending a paragraph on why it matters: "which is the
whole reason the course is shaped this way", "and that is what makes this
work", "which is exactly how a real warning gets skipped."

**The knowing aside.** "Here's the thing." "Think of it as." "Under the hood."
"The trick is." "It turns out."

**Filler adverbs and adjectives.** simply, just, actually, really, basically,
essentially, seamlessly, powerful, robust, elegant, leverage, utilize, deep
dive, rich, comprehensive.

**Hedged instructions.** "You'll want to set kP." Set kP.

**Anthropomorphized code.** "The scheduler wants", "the robot decides", "the
command knows." Code does not want anything.

**Manufactured suspense.** "There is one more thing." "This is where it gets
interesting."

**The em-dash appositive.** Covered above, and it is the most common of all.

## Structure of a lesson

```
Title            noun phrase, <= 4 words
Lede             2-3 flat sentences
needs[]          <= 4 items, <= 15 words each
time             honest, e.g. "12 minutes"

Section 1..N     3 to 5 sections, <= 350 words each
Last section     "Check your work" - a concrete, observable result
```

Three to five sections. A lesson with nine sections is two lessons.

Every lesson ends with something the student can see, hear, or measure. Not a
summary. A check: "The arm holds position when you let go. The plot shows
error under 0.02 rotations."

## Asides

Two per lesson, three at the absolute most. One `alert-danger` per lesson.

The site once had 297 of them. A page with six warnings has no warnings on it.
Before adding an aside, try deleting the sentence instead. The "why" belongs in
a `<MarginNote>` in the gutter, where it costs the reader nothing.

## Quizzes

Six questions, four options, exactly one defensible answer, and an explanation
that teaches rather than confirms.

**Vary where the answer sits.** Ten quizzes on this site shipped
`correctAnswer: 1` on every question, so a student could score 100% by always
picking option b having read nothing, and option d was used in four quizzes on
the whole site. `pnpm prose` now fails a quiz whose key lands on one option 60%
of the time or uses fewer than three of the four. `scripts/quiz-shuffle.ts`
rotates a patterned key without touching any option's text.

A distractor a knowledgeable student could argue for is a defect. So is a
question whose answer is not taught on the page: that is trivia, and the fix is
usually to add the missing sentence to the lesson rather than to drop the
question.

## Code

Show the smallest thing that makes the point. A 60-line file that teaches one
method should be an excerpt of that method.

Prose does not narrate code line by line. The code says what it does. Prose
says why it is written that way, and what breaks if it is not.

## What still binds

Everything in `CLAUDE.md`. WPILib 2027 and Commands v3 only, `org.wpilib.*`
packages, OpModes rather than `RobotContainer`, no invented v3 APIs, no
AdvantageKit, no enums in examples, no `SendableChooser`, CTRE hardware with no
vendor hedging.

Design rules live in `src/app/globals.css` and bind too: design tokens only,
never a Tailwind colour scale, and body copy never leaves `--measure`.

Run `pnpm spell` after any prose pass. cspell has caught this repo before.
