# CodeRunner as a lesson host: a plan for a fresh context window

Written 2026-08-25, immediately after the mechanism branch chain was rebuilt,
and acted on the same day. Everything below the status section is the original
plan, kept as written so the reasoning stays legible. Read the status section
first: it says which parts are now settled.

Read `CLAUDE.md` first. This document assumes it.

## Status, 2026-08-25 (updated the same day it was written)

All five spikes are done. Work happens in
**<https://github.com/Hemlock5712/CodeRunner>**, branch `wpilib-2027-java25`,
cloned at `C:/Users/joeoj/Downloads/CodeRunner`. Upstream is wired as the
`upstream` remote. The reasoning is written up there in
`docs/decisions/035-wpilib-2027-java-25.md`; this section is only the summary.

**Two unknowns in this document were answered early, and both were good
news.**

The sim pipeline survives the package move. CodeRunner runs
`simulateExternalJavaRelease`, reads `build/sim/release_java.json`, and calls
`wpi.sim.addWebsocketsServer()` to raise the web Driver Station. All three
still exist in `GradleRIO-2027.0.0-alpha-6.jar`, read out of the jar rather
than guessed at. `run-sim.sh` and `sim-headless.init.gradle` needed no edits.

Every artifact resolves for `linuxx86-64`, including the Phoenix 6 alpha
software-sim natives `simProTalonFX` and `simProCANcoder`. The arm and the
flywheel have simulation binaries on the alpha, so spike 2 is not blocked on
availability.

`first.robot` is fine. The control plane gates a project on one thing,
`build.gradle` at the root, and copies directories verbatim. The only
`frc.robot` strings in CodeRunner are synthetic test fixtures.

**What changed in the fork:** Temurin 25.0.4.1+1 with `JAVA_HOME` moved off a
version-numbered path; the WPILib extension at `2027.0.0-alpha-6`;
`redhat.java` at 1.55.0, because 1.38 predates Java 25 and would have marked
every generated file as a syntax error before Gradle ran; and
`catalog/modules/robot-starter` replaced by the generated 2027 project from
Workshop-Code `main`.

**All five spikes are done.** Spike 1 and the runnable half of spike 2 are
verified by a `Workspace image` CI job in the fork, which builds the image and
exercises it; this machine has no Docker, so CI is where the proof lives.

| Spike                               | Outcome                                                                                |
| ----------------------------------- | -------------------------------------------------------------------------------------- |
| 1. Container builds our stack       | Passes. `BUILD SUCCESSFUL` inside the image on JDK 25.                                 |
| 2. Simulation does something useful | **It runs and shows nothing.** See below.                                              |
| 3. Catalog generator                | Built: `pnpm catalog`. Eight modules from six branches plus `main` and one plain-java. |
| 4. A `plain-java` module            | Built: `context/lesson-modules/java-basics`, compiles and runs.                        |
| 5. Hosting                          | Recommendation written, nothing provisioned.                                           |

**Spike 2 is the answer that matters, and it is not the one this plan
expected.** The blocker was never the JDK. The robot program starts, the HALSim
WebSocket serves the Driver Station, and NetworkTables comes up. Then CI lists
every NT topic `mech-2-Commands` publishes and finds eleven, all of them
WPILib's own `/FMSInfo` boilerplate. No arm angle, no flywheel speed, no
voltage. AdvantageScope would connect and plot an empty dashboard.

Grepping the chain explains it twice. Nothing publishes telemetry, and nothing
feeds a Phoenix `SimState` from a physics model, so even with telemetry added
every position would read zero. Both gaps have to close before a student sees
anything move, and both are curriculum work rather than infrastructure work.
The three ways forward are in `docs/decisions/035-wpilib-2027-java-25.md`;
adding telemetry and physics to `mech-1` and `mech-2` alone would prove the
idea at a bounded cost. **Nothing further should be built on the CodeRunner
side until that call is made.**

**One defect was found and fixed along the way.** `run-sim.sh` bypasses
GradleRIO's `simulateJava` task, so it also bypassed the JVM arguments that
task attaches. On JDK 25 that dropped the native-access grant and both
`--add-opens`, which would have failed at run time rather than build time.

**Two things still to decide.** Phoenix 6 binaries land in the published image
and CTRE's licence is the only non-open one in the bundle. And
`gradle.properties` memory was raised to 768m by reasoning; the container build
survives at that number but nobody has measured the peak.

**One correction to the original text below.** The mechanism chain was
collapsed to six branches after this was written: `mech-3-PID` and
`mech-4-MotionMagic` became a single `mech-3-MotionMagic`, and the rest shifted
down to `mech-4-ReadingState`, `mech-5-Coroutines`, `mech-6-StateBased`. The
mapping table in "Why it fits us" still lists the old seven, which is exactly
why the generator reads the branch list from git instead.

Spike 2 is next, and it is the one that decides whether this is worth
finishing: a student presses a button and either the arm moves in
AdvantageScope or it does not.

## The idea

[CodeRunner](https://github.com/mathewdunne/CodeRunner) is a browser-based IDE
built for teaching FRC programming. Serve our workshop as CodeRunner lesson
modules and a student gets a working WPILib project, an editor, a Driver
Station and telemetry with nothing installed locally.

Live demo: <https://mathewdunne.github.io/CodeRunner/>

## What CodeRunner actually is

Verified by reading the repo on 2026-08-25, not inferred.

- Browser VS Code (openvscode-server) with the WPILib extension, one isolated
  Docker container per student.
- One-click simulation: it builds the project, starts it, and streams telemetry
  to an embedded AdvantageScope plus a web Driver Station with gamepad support.
- MIT licensed. Redistributes AdvantageScope (BSD-3, patched),
  openvscode-server (MIT) and WPILib (BSD-3).
- Deployed with Docker Compose. `CODERUNNER_DEMO_MODE=1 docker compose up` is
  the whole demo path. Production adds auth and an allowlist.
- Control plane is a Bun server on 4000, web shell is Vite on 5173.
- Active: last push was the same day this was written. Two stars, so treat it as
  a project we would be an early adopter of, not a settled dependency.

## The module contract

This is the part that matters, and it is genuinely small. From
`docs/lessons/authoring-modules.md`.

A lessons repository is a public GitHub repo with `modules.json` at the root and
one directory per module:

```text
modules.json
modules/
  <module-id>/
    README.md      the lesson text, auto-opened as the startup editor
    .vscode/       launch.json and settings.json, shipped into the workspace
    src/ ...       a complete starting project
```

```json
{
  "schemaVersion": 1,
  "modules": [
    {
      "id": "hello-world",
      "title": "Hello, World",
      "description": "Variables, terminal input, and printing values.",
      "subdir": "modules/hello-world",
      "kind": "plain-java",
      "order": 10
    }
  ]
}
```

Every field is required. `kind` is `plain-java` (no Gradle, run from the editor
Run button, robot UI hidden) or `robot` (full Gradle WPILib project, run from
the Driver Station). `order` is a sort key, so number in tens and leave gaps.
`subdir` is what points at the directory, so the `modules/` name is convention
rather than requirement.

Three facts worth keeping:

- **A module directory is a complete starting project.** CodeRunner copies the
  contents into the workspace. There is no build or packaging step.
- **Publishing is a git push.** Point `LESSONS_CATALOG_REPO` at `owner/repo`,
  optionally `LESSONS_CATALOG_BRANCH`, and the catalog is cached for 60
  seconds. No app rebuild, no redeploy.
- **A remote catalog fully replaces the bundled demo modules.** Students see
  ours or theirs, never both.

CodeRunner also rewrites `build.gradle` at run time, non-destructively, to strip
the desktop simulation GUI and enable the WebSocket server the web Driver
Station needs. The student still sees their own unmodified `build.gradle`. So a
project that calls `addGui()` and `addDriverstation()` works unedited, which is
exactly what the WPILib generator writes and therefore what our `main` holds.

## Why it fits us

Each `mech-*` branch tip is already a complete starting project, which is
precisely what a module directory has to be. We did not design for this and it
lines up anyway:

| Our asset                 | CodeRunner module                                   |
| ------------------------- | --------------------------------------------------- |
| `mech-1-Mechanisms` tip   | `kind: "robot"`, `order: 10`                        |
| `mech-2-Commands` tip     | `kind: "robot"`, `order: 20`                        |
| `mech-3-PID` tip          | `kind: "robot"`, `order: 30`                        |
| `mech-4-MotionMagic` tip  | `kind: "robot"`, `order: 40`                        |
| `mech-5-ReadingState` tip | `kind: "robot"`, `order: 50`                        |
| `mech-6-Coroutines` tip   | `kind: "robot"`, `order: 60`                        |
| `mech-7-StateBased` tip   | `kind: "robot"`, `order: 70`                        |
| `/java-basics` examples   | one or more `plain-java` modules, `order: 1` upward |

The `order` gaps also solve something we already have a problem with. The
missing PID handoff lesson can slot in at `35` without renumbering anything, and
the Workshop 2 ordering inversion can be fixed in the catalog before it is
fixed in `lessons.ts`.

## The blocker, and it is a real one

**Largely cleared. See the status section.** The JDK bump is done and every
artifact resolves; what is left is watching the container build succeed.

**The CodeRunner container ships JDK 17. Our stack requires Java 25.** Verified
in `containers/code/Dockerfile`:

```dockerfile
ARG JDK_VERSION=17.0.15+6
ENV JAVA_HOME=/usr/lib/jvm/jdk-17
ARG WPILIB_EXT_VERSION=2026.1.1
```

And the bundled `robot-starter` demo module is a different stack from ours on
every axis:

|            | CodeRunner demo                    | Our workshop                            |
| ---------- | ---------------------------------- | --------------------------------------- |
| GradleRIO  | `edu.wpi.first.GradleRIO` 2026.2.1 | `org.wpilib.GradleRIO` 2027.0.0-alpha-6 |
| Java       | 17                                 | 25                                      |
| Packages   | `edu.wpi.first.*`                  | `org.wpilib.*`                          |
| Commands   | WPILibNewCommands (v2)             | CommandsV3                              |
| Vendor     | AdvantageKit                       | Phoenix 6 alpha                         |
| Target     | roboRIO                            | SystemCore                              |
| Main class | `frc.robot.Main`                   | `first.Main`                            |

Java 25 source and target cannot compile on JDK 17, so this is not a
configuration tweak. It does look tractable: the JDK and the extension version
are `ARG`s, so a build-arg override or a small fork can add JDK 25 and the 2027
alpha extension. Whether the WPILib 2027 alpha maven and the Phoenix 6 alpha
vendordep resolve inside the container is the unknown, and it is the first
thing to find out. Note also that CLAUDE.md forbids AdvantageKit on this site,
so the demo module is not a template to copy from.

Everything else in this plan is worthless if that spike fails.

## Two design traps

**Our lessons are seven git refs. CodeRunner wants seven directories.** This is
the same shape as the submodule argument in CLAUDE.md, and it has the same
answer. Do not hand-maintain a second copy of the code. Write a generator that
walks the `mech-*` chain and materialises each branch tip into
`modules/<id>/`, then writes `modules.json` from the branch list.
`scripts/sync-reference.mjs` is the working model for this: it already turns
branches into on-disk trees. The catalog repo becomes a build artifact with the
branches as the single source of truth.

**The README is a second copy of the lesson.** CodeRunner auto-opens
`modules/<id>/README.md` as the lesson text. Our lesson text already exists as
29 pages on the site. Writing it twice is exactly the failure that retired the
glossary and the hand-typed roadmap, both recorded in CLAUDE.md as things not
to reintroduce. Decide this before writing a single README. Three options:

1. Generate the README from the page source. Highest fidelity, needs a
   TSX-to-Markdown path for our lesson components, which is real work.
2. Keep the README thin: the goal, the numbered steps, the check, and a link to
   the full lesson on frc5712.com. Cheapest, and the split is honest if the
   README is explicitly the bench card rather than the lesson.
3. Invert it: make CodeRunner the lesson and reduce the site page to a summary.
   Largest change, and it throws away the design work in `globals.css`.

Option 2 is the recommendation. Option 1 is the trap that looks clever.

## What cannot move

**Workshop 1 is hardware, and CodeRunner is simulation.** `/hardware`,
`/mechanism-setup`, `/pid-control` and `/motion-magic` are entirely Phoenix
Tuner X against a real CANivore, TalonFX and CANcoder. None of that has a
CodeRunner equivalent, and it should not get a fake one.

This has a consequence for the code lessons. `mech-3-PID` and
`mech-4-MotionMagic` receive six gains a student measured on their own
mechanism. In CodeRunner there is no mechanism, so those two modules need
either a stated set of simulation gains or a note that the blanks stay blank
until the student is at the bench. Pick one deliberately; a module that cannot
run is worse than no module.

`/running-program` has the same problem in reverse. It is titled Hardware
Simulation and it drives real motors from the laptop, so it is not a
CodeRunner lesson either.

The swerve chain is out of scope until it is rebuilt. It is still `frc.robot`
with `subsystems/` and `opmodes/`, and it carries generated CTRE constants and
a calibrated module layout that no student types.

## Spikes, in order

1. **Can the container build our stack at all?** Fork or override the build
   args to JDK 25 and the 2027 alpha WPILib extension. Drop the
   `mech-1-Mechanisms` tip in as a module and try to build and simulate it.
   Everything downstream depends on the answer. Budget real time for the
   Phoenix 6 alpha vendordep resolving inside the container.
2. **Does simulation do anything useful without hardware?** Our mechanisms are
   a TalonFX arm with a remote CANcoder and a two-motor flywheel. Phoenix 6 has
   simulation support, but confirm that a student pressing a button sees the arm
   move in AdvantageScope rather than nothing at all. If simulation is inert,
   the `robot` modules are only an editor, and that is a much smaller win.
3. **Write the catalog generator.** Branches to `modules/` plus `modules.json`,
   modelled on `scripts/sync-reference.mjs`. Only worth doing once 1 and 2 pass.
4. **One `plain-java` module** from `/java-basics`, to prove the cheap half of
   the course works and to have something to show.
5. **Decide hosting.** Docker Compose has to run somewhere with a container per
   student. Vercel does not do this. Cost and admin per student is a real
   question for a volunteer-run workshop, and demo mode may be enough for an
   in-person session.

## Open decisions

- **Where does the catalog repo live?** A new `Workshop-Lessons` repo is
  cleanest, since Workshop-Code's teaching states are branches and the catalog
  needs directories on one branch. Do not try to make one repo do both.
- **Which lessons get modules?** Recommendation: Workshop 2 code lessons plus
  `/java-basics`, and nothing from Workshop 1.
- **Does `first.robot` work?** CodeRunner's docs describe robot modules as
  `src/main/java/frc/robot/...`. It copies directories, so `first.robot` should
  be fine, but the run-time Gradle override and the Driver Station wiring are
  worth checking for a hard-coded `frc.robot`.
- **Do we contribute upstream?** The 2027 alpha and Java 25 support is useful to
  anyone on the alpha, and CodeRunner is MIT with an active maintainer. A PR
  parameterising the JDK properly may be less work than carrying a fork.

## Assets a new session should know exist

- `mech-1-Mechanisms` through `mech-7-StateBased` on Workshop-Code: seven
  complete, compiling starting projects, one per lesson.
- `main` on Workshop-Code: the bare generated project, the natural `order: 0`
  module.
- `reference/` and `scripts/sync-reference.mjs`: every branch on disk at once,
  and the working pattern for the catalog generator.
- `src/data/lessons.ts`: lesson order, grouping and numbering. The authority.
  `order` in `modules.json` should be derived from it, not typed.
- `context/workshop-code-plan.md`: the audit of what the site needs from
  Workshop-Code, including the gaps this plan inherits.
