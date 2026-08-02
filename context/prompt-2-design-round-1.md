# Prompt 2 — Design exploration, round 1 (five prototypes)

Run after the content/structure work. Pick one winner, then run
`prompt-3-design-round-2.md` on it.

---

You are exploring visual directions for **Workshop-Site**, an FRC coding curriculum
(frc5712.com). Next.js + Tailwind + Convex, 31 lesson pages under `src/app/(workshop)/`.

Read `context/design-principles.md` and `context/style-guide.md` first. If a prototype departs from
either, say so and why — don't silently fight them.

## 1. Aesthetic

This is a coding curriculum for **middle and high schoolers who have never written code**. It must
read as _made by a person who teaches this_, not assembled from a component library.

Two failure modes are equally bad:

- **Childish** — they'll dismiss it as beneath them.
- **Enterprise SaaS documentation** — they'll bounce off it.

Aim for **serious tools, made welcoming**: the feeling of being handed real equipment by someone
who expects you to use it well.

The page has to survive being _worked through_, not skimmed — long scroll, many code blocks,
frequent "do this now" steps.

## 2. References

Produce **five distinct prototypes**, one per direction. They must be genuinely different
approaches, not five palettes of the same layout.

| #   | Direction           | Reference points                                         |
| --- | ------------------- | -------------------------------------------------------- |
| A   | Warm technical docs | Stripe Docs, Linear, Tailwind Docs                       |
| B   | Print workbook      | Tufte CSS, Bret Victor essays, physical lab manuals      |
| C   | Maker learn-guide   | Adafruit Learn, SparkFun tutorials                       |
| D   | Editorial long-form | magazine feature layout, strong type, full-bleed figures |
| E   | Progress ladder     | visible path, checkpoints, "you are here" in a sequence  |

For each, state in one line what it optimizes for and what it gives up.

## 3. Intent

Each prototype renders **the same real page: the PID lesson**, using actual content from the
existing site — never lorem ipsum, never invented copy.

It must include the hard parts:

- a long code block
- an inline code reference mid-sentence
- a numbered do-this-now sequence
- a diagram slot
- a "common mistake" aside
- next / previous lesson navigation

Also show the **lesson index**. How 31 lessons are presented as a learnable order is half the
design problem, and it's the part a single page mockup usually hides.

Success: a 13-year-old can tell where they are, what to do next, and what they just learned.

## 4. Guardrails

**Hard bans.** These are the tells that make a site read as AI-generated:

- No purple/blue gradient hero. No gradient text.
- No three-column feature-card grid with an icon on each card.
- No emoji as heading bullets or section icons.
- No glassmorphism, no decorative `backdrop-blur`, no floating orbs or blobs.
- No `rounded-2xl shadow-xl` applied uniformly to every surface.
- No stock or AI-generated illustration.
- No copy in the register of "Unlock the power of…", "Dive into…", "Let's explore…".
- Nothing centered that should be left-aligned. Long text is never centered.

**Required:**

- WCAG AA contrast.
- Light and dark.
- Mobile down to 360px.
- Code blocks scroll horizontally without the page doing so.
- Every interactive element keyboard-reachable.
- At most 5 type sizes. At most one accent hue.

## Deliverable

Five self-contained prototypes plus a one-paragraph rationale each. **No production wiring** — these
exist to be chosen between, not shipped.
