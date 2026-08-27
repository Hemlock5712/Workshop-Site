# Workshop-Code: what the site needs from it

Findings from auditing [Workshop-Code](https://github.com/Hemlock5712/Workshop-Code)
against the site during the August 2026 prose rewrite. Nothing here has been
changed in that repo. This is the list to work from.

Everything below was read off the repo, not inferred: branch list from
`git ls-remote`, histories and diffs from the GitHub compare API.

## What is actually in the repo

Fifteen branches, and they form **two separate chains that reuse the same
number prefixes.**

**The mechanism chain** (arm and flywheel on a bench, one CANivore):

```
init → 1-Subsystem → 2-Commands → 3-PID → 4-MotionMagic → 5-GettersAndSetters
```

Linear, one commit per step, each step one lesson wide. This is the chain
Workshop 2 teaches from.

**The swerve chain** (a whole drivetrain):

```
Swerve and PathPlanner → … → 1-Swerve → 2-Logging
```

plus `3-Limelight`, `4-DynamicFlywheel`, `5-DriveToPoint`, `6-ProfiledToPoint`,
`6-Coroutines`, `7-StateBased`, `7-InlineCommands`.

The prefixes collide across the two chains. `2-Commands` and `2-Logging` share
a number and have nothing to do with each other: `2-Logging`'s history is
`Swerve and PathPlanner → Migrate 1-Swerve to WPILib 2027 → Add logging to
swerve`. A student told to check out "branch 2" has no way to know which.

## 1. Three branches the site never references

`3-PID`, `4-MotionMagic`, and `5-GettersAndSetters` are referenced by **zero
pages**. They are not stale, and they are not experiments. They are three
lesson-sized commits on the main teaching chain:

| Branch                | Diff from its parent                                                                       |
| --------------------- | ------------------------------------------------------------------------------------------ |
| `3-PID`               | `Arm.java` +42/-26, `Flywheel.java` +25/-15, `Robot.java` +2/-3, `TeleopOpMode.java` +4/-4 |
| `4-MotionMagic`       | `Arm.java` +16/-13, `Flywheel.java` +12/-6                                                 |
| `5-GettersAndSetters` | `Arm.java` +31/-5, `Flywheel.java` +29/-5, `TeleopOpMode.java` +23/-1                      |

### This is the hardware-first handoff, and it is missing from the course

The restructure puts PID and Motion Magic tuning in Workshop 1, entirely in
Phoenix Tuner X. `/pid-control` ends by telling the student to write down their
Slot 0 gains because "Workshop 2 types these numbers into robot code."

**Workshop 2 never does.** The arm code the site teaches from
(`1-Subsystem`, `2-Commands`) is open-loop:

```java
// 2-Commands, Arm.java
private final VoltageOut voltageOut = new VoltageOut(0);
```

The arm on this site never becomes closed-loop on any page. Meanwhile `3-PID`
is sitting there with the receiving end already built and deliberately blank:

```java
// 3-PID, Arm.java
// PID + feedforward gains.
// TODO: CRITICAL - tune on the real robot before driving the arm under power.
private static final double kG = 0.0; // NEEDS TUNING - gravity feedforward
private static final double kS = 0.0; // NEEDS TUNING - static friction feedforward
private static final double kP = 0.0; // NEEDS TUNING - proportional gain
private static final double kD = 0.0; // NEEDS TUNING - derivative gain
```

and it wires them up with `config.Slot0.GravityType =
GravityTypeValue.Arm_Cosine` and `StaticFeedforwardSignValue.UseClosedLoopSign`,
which is exactly the configuration `/pid-control` now tells the student to set
in Tuner X. `4-MotionMagic` does the same for the profile:

```java
private static final double MOTION_MAGIC_CRUISE_VELOCITY = 0.0; // NEEDS SETTING
private static final double MOTION_MAGIC_ACCELERATION = 0.0;    // NEEDS SETTING
```

Six numbers, produced in Workshop 1, with six blanks waiting for them in
branches no lesson opens. **This is the single largest gap the restructure
created**, and closing it needs no new code at all.

**Recommendation.** Add one Workshop 2 lesson between `/building-subsystems`
and `/running-program`, embedding `3-PID` and `4-MotionMagic`: the student
copies the gains off their own Tuner X notes into `Arm.java`, swaps
`VoltageOut` for `PositionVoltage`, then swaps that for `MotionMagicVoltage`.
It is the moment the two halves of the course meet, and it is currently absent.
This is a curriculum decision, so it is a recommendation rather than something
the prose rewrite did on its own.

## 2. `/finish-lines` teaches a branch it does not embed

`/finish-lines` (Workshop 5, "Finish Conditions") has **no `branch` prop**.
`5-GettersAndSetters` implements precisely that lesson, and says so in its own
doc comment:

```java
/**
 * New in this lesson (5-GettersAndSetters): the read side. getPosition tells you
 * where the arm is, getTargetPosition tells you where it is headed, and
 * isAtTarget tells you whether it has arrived. That last check is how a hold
 * gets an ending: arm.vertical().until(arm::isAtTarget) finishes when the arm
 * is really there.
 */
```

The site mentions `isAtTarget` on `/finish-lines`, `/coroutines`, and
`/state-based` without ever showing the branch that defines it. Point
`/finish-lines` at `5-GettersAndSetters`.

Note the ordering problem this creates: `5-GettersAndSetters` sits on the
mechanism chain right after `4-MotionMagic`, but `/finish-lines` is lesson 28
in Workshop 5. Either the branch moves, or the lesson does, or the naming stops
implying an order it does not have. See item 4.

## 3. `/logging-implementation` embeds no branch either

It teaches `DataLogManager` on the arm and hand-writes its two code blocks.
`2-Logging` exists, but it is swerve logging on the swerve chain, so it is the
wrong parent for a Workshop 2 arm lesson.

**Recommendation.** Either add an arm-side logging commit to the mechanism
chain (after `5-GettersAndSetters`), or rename `2-Logging` to say what it is
(`swerve-3-Logging`, or whatever the final scheme is) and leave
`/logging-implementation` hand-written.

## 4. The numbering should say which chain and which lesson

The current prefixes imply a single linear course and deliver two chains with
seven collisions. Two options:

**Option A, prefix by chain.** Cheapest, keeps every existing history.

```
mech-1-Subsystem   mech-2-Commands   mech-3-PID
mech-4-MotionMagic mech-5-GettersAndSetters
swerve-1-Base      swerve-2-Logging  swerve-3-Limelight …
```

**Option B, number by lesson.** Matches `src/data/lessons.ts`, so a student
reads "lesson 14" and checks out `14-…`. Better for students, and it means
renaming a branch every time a lesson is inserted, which is exactly the drift
that put the site's hand-typed roadmap out of sync before.

Option A is the recommendation. The prefix carries the chain, the suffix
carries the topic, and no branch has to be renamed when a lesson moves.

## 5. Whatever changes, these must stay in step

- `scripts/check-embeds.ts` and `pnpm check-embeds` resolve every `branch` +
  `filePath` pair against GitHub, and CI fails when one stops resolving. Run it
  after any rename.
- The `branch` prop appears on 32 call sites across 12 pages. The current map:

| Branch              | Pages                                                                       |
| ------------------- | --------------------------------------------------------------------------- |
| `1-Subsystem`       | `/building-subsystems`                                                      |
| `2-Commands`        | `/adding-commands`, `/running-program`, `/triggers`, `/ai-coding-assistant` |
| `1-Swerve`          | `/swerve-drive-project`                                                     |
| `3-Limelight`       | `/vision-implementation`                                                    |
| `4-DynamicFlywheel` | `/vision-shooting`                                                          |
| `5-DriveToPoint`    | `/drive-to-point`                                                           |
| `6-ProfiledToPoint` | `/advanced-drive-to-point`                                                  |
| `6-Coroutines`      | `/coroutines`                                                               |
| `7-StateBased`      | `/state-based`                                                              |
| `7-InlineCommands`  | `/drive-to-tag-inline`                                                      |

- `/swerve-calibration` quotes `TunerConstants.java` and `TeleopOpMode.java`
  from `1-Swerve` in its section headings but sets no `branch` prop, so
  `check-embeds` does not cover it.
- The swerve project download uses release tag `v3.0-swerve`, not a branch.
  A branch rename does not move a tag.

## 6. Things the rewrite found page by page

Collected from the agents that rewrote each lesson, each verified against the
repo before being written down here.

**`/swerve-calibration` is invisible to `check-embeds`.** It quotes
`src/main/java/frc/robot/generated/TunerConstants.java` and
`src/main/java/frc/robot/opmodes/TeleopOpMode.java` from `1-Swerve` in its prose
and headings, but carries no `GitHubContent` embed and no `branch` prop.
`scripts/check-embeds.ts` only resolves `GitHubContent` props and
`ImplementationContent` object literals, so if either path moves on that branch
nothing fails and the lesson quietly starts lying. It is the one page naming
branch files with no machine check behind it.

**`/chaining-commands` has students hand-write a file with no reference.** They
compose a group straight into their own `TeleopOpMode` with nothing to check it
against. Every command name it leans on matches `2-Commands` exactly
(`runSlow()`, `runFast()`, `stop()` as `runRepeatedly(...)` holds on both
mechanisms), and its "cancelling never stops the motor" aside is true _only_
because `idle()` sends no request on those branches. A lesson-sized commit after
`2-Commands` holding the finished `TeleopOpMode` would let the page take a
`branch` prop and a verified embed.

**`/drive-to-tag-inline` now depends on one file for its first screen.** The
`create(...)` excerpt was cut, so the live embed of
`src/main/java/frc/robot/commands/DriveToTagInline.java` on `7-InlineCommands`
is the only place a student sees the constructor, the profile constraints, and
the arguments to `enableContinuousInput`. Moving or renaming that file breaks
the lesson's opening. The page also quotes the finish condition
(`distance.atGoal() && lateral.atGoal() && heading.atGoal()`) in prose _and_ in
a quiz question, so a change on the branch needs two edits, not one. Two `TODO`
comments in that file are load-bearing teaching material: the sign TODO drives
the wrong-sign failure mode and the on-blocks check, and the `kP` TODO drives
the "every gain ships at zero" aside. Pin either one and the lesson needs
rewriting.

**`/building-subsystems` is the natural parent for the missing gains lesson.**
It is where `withRemoteCANcoder` is introduced, which is the line that puts the
CANcoder in the loop that `3-PID` then tunes.

**Three composition APIs now have no home on the site.** `.andThen(...)`,
`.alongWith(...)` and `.raceWith(...)` appear nowhere outside a doc comment
after the rewrite. They were in a "you will see these in other teams' code"
tour, which was the right thing to cut, but the pointer itself has no owner.
`/finish-lines` or `/state-based` should adopt it.

## 7. Two tools that cannot run in this environment

Neither is caused by the rewrite, and both leave a real gap in what was
verified:

- **`pnpm spell`** cannot run: `cspell` requires Node `>=22.18.0` and the
  machine has 22.15.1. Roughly 30 rewritten pages have therefore never been
  spell-checked, and `CLAUDE.md` notes cspell has caught this repo before.
- **`pnpm lint:force`** cannot run: `typescript-eslint` 8.65 rejects
  TypeScript 7.0. `pnpm lint` is the `scripts/lint-disabled.mjs` stub, so ESLint
  is not covering any of this either.

Run both after a Node bump.
