# Prompt 1 — Structure, content, and voice

Run this first. Design comes after; a beautiful site with the wrong lesson order is worse than a
plain one with the right order.

---

You are restructuring **Workshop-Site**, the lesson site for an FRC robotics team
(frc5712.com). 31 lesson pages live under `src/app/(workshop)/`. Next.js + Tailwind + Convex.

Read `context/design-principles.md` and `context/style-guide.md` before starting. If you're going
to depart from either, say so explicitly and why.

**Audience: middle and high schoolers who have never written a line of code.** Not CS students,
not mentors. Assume no prior programming, no Java, no command-line experience.

The companion code repo is `Hemlock5712/Workshop-Code`, which has **one branch per lesson**. The
PR diff between consecutive branches _is_ that lesson's code change. The two tracks:

- **Mechanism:** `1-Subsystem → 2-Commands → 3-PID → 4-MotionMagic → 5-GettersAndSetters → 6-Coroutines → 7-StateBased`
- **Swerve:** `1-Swerve → 2-Logging → 3-Limelight → 4-DynamicFlywheel → 5-DriveToPoint → 6-ProfiledToPoint → 7-InlineCommands`

The finished-robot template students graduate into is `Hemlock5712/2027-Template`.

## Part A — Information architecture

The page list grew by accretion and the order is no longer the learning order. Audit every existing
page against the two tracks above and produce:

- The proposed page order, as a numbered list.
- Which page maps to which branch (and which pages map to no branch — that's fine, say so).
- A classification per page: **prerequisite**, **lesson**, or **reference**.
- Pages to merge, split, cut, or write from scratch.
- **Every gap where a lesson assumes knowledge no earlier page taught.** Name the specific concept
  and the page where it first appears unexplained. This is the most valuable part of the audit.

Every lesson page must open with: what you'll build, what you need first, roughly how long it takes.

## Part B — Step-by-step rewrite

A student should be able to follow a page and end up with working code. Every lesson needs:

- **The goal in one sentence**, before any explanation.
- **Numbered steps**, each a single action with a visible result. If a student can't tell whether a
  step worked, the step is wrong.
- **The exact code to add, and where it goes** — file name and surrounding context, never a bare
  fragment floating without a home.
- **"Did it work?"** per section: what to look for on the dashboard, in the log, in the robot's
  behavior.
- **"If it didn't work"**: the two or three realistic failure modes and how to recognize each.
- A link to the matching branch PR diff.

Introduce each concept **once**, in the lesson that first needs it, in plain words before the
jargon. Write "how hard it pushes" before you write "kP".

## Part C — Voice

The current copy reads as machine-written. Fix it.

**Ban:** "Let's dive into", "Unlock", "Leverage", "Seamless", "Robust", "Powerful", "In today's
world", "It's important to note that", "Simply", "Just", "Easy" (nothing is easy to someone
learning it). No sentence that opens by restating the heading. No paragraph that announces what the
next paragraph will say.

**Do:** Short sentences. Second person. Active voice. Say the actual number, not "a value". Admit
when something is genuinely fiddly — "this one takes a few tries to tune" earns more trust than
pretending it's simple. Where a mistake is common, describe what it looks like when you make it.

Prefer the concrete. "The arm shakes instead of stopping" beats "instability may occur".

## Guardrails

- **Do not invent technical claims.** If a number, behavior, or API isn't verifiable in
  `Workshop-Code` or `2027-Template`, mark it TODO rather than writing something plausible.
- **The code is the source of truth.** Where a page and the code disagree, the code wins — report
  the discrepancy, don't quietly reword the page.
- This is WPILib **2027 alpha**, Commands v3, OpModes. **There is no `RobotContainer`.** Flag any
  page still teaching v2 patterns.
- Preserve existing URLs or provide redirects — these get linked from Discord and slides.
- Don't touch visual design. That's the next prompt.

## Deliverable

**The IA proposal and per-page audit first, as a plan to approve — before rewriting any page.**
Rewriting 31 pages against a wrong structure is worse than leaving them alone.
