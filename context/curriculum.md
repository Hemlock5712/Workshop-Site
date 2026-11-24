# Curriculum: route organization and history

Moved out of CLAUDE.md in November 2026. Read this before adding, renaming,
reordering, merging or reinstating a lesson, or touching a redirect.

## Route Organization

Lesson order, drawer grouping, the syllabus, and prev/next all come from
`src/data/lessons.ts` — the single source of truth. The course is organized as
seven workshops with a strict prerequisite boundary: Workshop 1 is entirely in
Tuner X, Java starts at Workshop 2, the first file is written in Workshop 3,
routines are built in Workshop 4, the swerve drive is generated and tuned in
Workshop 5, Workshop 6 drives it (autonomous, BLine, Drive to Point), and
Workshop 7 adds vision (Vision Hardware, Vision, Align to Tag). Historical side
routes can remain reachable without appearing in `LESSONS`.

**Swerve, Navigation and Vision are three workshops.** Owner's review,
November 2026, split the old Swerve & Autonomous and Vision & Navigation.
Workshop 5 is `/swerve-basics` (the components, then robot-centric,
field-centric, `Pose2d` and odometry, kept short; it replaced How Swerve
Works), `/swerve-drive-project` (generate only `TunerConstants.java` into the
prepared project and set the team number) and `/swerve-drive-tuning` (steer
gains first, then wheel radius, top speed and the drive loop, with
every drive request on `DriveRequestType.Velocity`, owner's call: the generator's `OpenLoopVoltage` is changed in `Robot.java` on all seven swerve branches; Swerve Calibration folded in and its
module-zeroing material was cut). Drive to Point sits in Navigation, before
Vision; Align to Tag stays after Vision because it needs it.

**Drive to Point teaches the drift that Vision then fixes.** Owner's call,
November 2026: a student drives to a point on odometry alone, sees the robot
land a little off and further off over time, and the Vision workshop is the
correction. So `/drive-to-point` does not list Vision under "You'll need" and
must not say it comes after Vision. The Workshop-Code branch order still
disagrees: `swerve-drive-to-point` is built on `swerve-vision`, so a student on
that branch already has the camera code. The November 2026 rebuild for
Recording 13 puts `swerve-drive-to-point` on `swerve-bline`, ahead of
`swerve-vision`; see the Recording 13 bullet in `context/teaching-code.md`.

**Workshop 4 is Routines, and it renumbered everything after it.** September
2026: Command Composition, Finish Conditions and Coroutines left the tail of
Workshop 3, Logging came up from the old Workshop 6 to join them, and Swerve
and Vision shifted to 5 and 6. Workshop 3 is about making one mechanism work
and stops at Motion Magic in Code; Workshop 4 is about making several cooperate
with no driver holding a button. The group was called Advanced Commands when
it held State Machines, and is named for what a student builds.

**Finish Conditions and Logging are one lesson, `/conditions-and-logging`.**
Owner's call, November 2026: Finish Conditions had shrunk to three getters
nothing called, and Logging sat after the routine it exists to explain. The
merged lesson is `mech-4-ReadingState`: tolerance and the three getters, then
`DataLogManager.start()` + `DriverStation.startDataLog(...)` in the `Robot`
constructor, then each mechanism `implements Mechanism, TelemetryLoggable` with
an `@Override logTo(TelemetryTable table)` that logs the getters, `AtTarget`
and `AppliedVoltage`, and `Robot.robotPeriodic()` calls
`Telemetry.log("Arm", arm)` after the scheduler. The old private `record()` +
`Scheduler.getDefault().addPeriodic(...)` shape is gone. The getters are
logged as `Measure`s with no `.in(Unit)` (owner's call): `RobotBase`'s type
handler writes the SI base unit with a `unit` property, so `Position` is `rad`,
`Velocity` `rad/s`, `AppliedVoltage` `V`, and AdvantageScope converts on the
graph. Sim-verified: all eight `NT:/Telemetry/...` entries, with units, land
in the `.wpilog`.
Both old slugs 308 here, and Coroutines follows it.

**There is no `/chaining-commands`, and routines are coroutines only.**
Owner's call, November 2026: Commands v3 composes with coroutines, so Command
Composition (`Command.sequence`, `Command.race`, `.withTimeout`) was cut, and
Finish Conditions lost `.until(...)` and the builder-versus-`Command` `.named`
ordering. No mech branch ever used any of them. Coroutines owns every routine: the core
calls (`fork`, `waitUntil`, `await`, `wait`; `yield` and the hand-written
`while` loop were cut), three teleop routines in `MyTeleop` with unbounded waits
(Y `raiseAndLower` on the arm, X `spinUpAndStop` on the flywheel, B `wave`, the
arm routine in a `for` loop), then `RaiseAndShootOpMode` with a time limit on
every wait and each `Coroutine.WaitResult` stored before its `if`. Each
finished routine is a `RoutineView`: a Code / Timeline toggle, so the picture
costs no page length. `CoroutineTimeline` is deleted. To match,
`mech-4-ReadingState` was rebuilt to add only the read side and the Y button
moved to `mech-5-Coroutines`. Don't teach a routine as a command group or a
decorated hold. The slug 308s to `/coroutines`.

**`/vision-shooting` is optional and unlisted, on `swerve-vision-shooting`.**
Owner's call, November 2026: rebuild it, keep it out of `lessons.ts`. The
branch is one commit on `swerve-vision`: a two-Kraken `Flywheel` (CAN 21 and
22, follower opposed) that reads the distance to a placeholder `TARGET` off
`drivetrain.getPose()` and looks the speed up in an
`InterpolatingDoubleTreeMap`, with the Tuner X paste at 0.0 gains and the
right trigger bound `whileTrue(distanceShoot()).whileFalse(stop())`. It
replaced `4-DynamicFlywheel`. Builds and starts in sim; not verified on
hardware.

**There is no `/testing`.** Cut in the owner's November 2026 review: no
entry-level team will write JUnit tests. The `mech-6-Testing` branch was
deleted with it. The slug 308s to `/conditions-and-logging`.

**There is no `/state-based`.** State Machines was retired in September 2026 and
the page is deleted: `StateMachine` shipped in alpha-6, but there is no
documentation worth sending a student to and no Workshop-Code branch behind the
lesson. The slug 308s to `/coroutines`, and the two `state-based-*.mp4` entries
are gone from `/video`. Don't reinstate it without a branch and real docs.

**Workshop 2 is concepts, Workshop 3 is code.** Splitting them was the point of
the August 2026 regroup: Workshop 2 (Code Foundations) is Java Basics and The
Command Framework, and nothing in it opens an editor. Workshop 3 (Robot
Programming) opens with Project Setup and runs through Motion Magic in Code,
and every lesson in it writes a file. Project Setup sits at the top of Workshop 3 rather
than the bottom of Workshop 2 because making the project is the first thing you
do to write code, not the last idea you learn before writing it. The section
ids stay aligned with the displayed numbers (`workshop3` renders `03`); keep
them that way if a group is ever inserted again.

**`/` is not in `LESSONS`.** Home is the landing page, not lesson 00 — the
lesson count is derived from `LESSONS`; do not hard-code it in UI copy.

**There is no `/glossary`.** The standalone glossary page was retired in August
2026 — it was a second copy of every definition, kept in sync by hand. Inline
definitions now live only in `src/components/GlossaryTerm.tsx`, whose
`glossaryDefinitions` record renders the hover/focus tooltip on an annotated
term; add a term there, not to a page.

**There is no `/planner` in this repo.** The waypoint planner was removed in
August 2026 — `frc5712.com/planner` is served from a separate repository. The
route, its ten components, four hooks and four lib modules (~5,100 lines) are
gone, and nothing here linked to them. Don't reintroduce it, and don't confuse
it with `/bline`, which is a lesson and stays.

**Retired slugs, kept as 308 redirects in `next.config.ts`** — they're printed
on old slides: `/logging-options`, `/logging-implementation`,
`/finish-conditions`, `/finish-lines` and `/testing` → `/conditions-and-logging`,
`/vision-options` → `/vision-hardware`, `/ai-assistant` →
`/ai-coding-assistant`, `/glossary` → `/introduction`, `/robot-class` →
`/mechanisms`, `/building-subsystems` → `/mechanisms`, `/dynamic-path-planning` and `/advanced-drive-to-point` → `/drive-to-point`,
`/drive-to-tag-inline` → `/align-to-tag`, `/pathplanner` → `/bline`, `/project-structure` and
`/git-workflow` → `/project-setup`, `/chaining-commands` → `/coroutines`,
`/swerve-prerequisites` → `/swerve-basics`, `/swerve-calibration` →
`/swerve-drive-tuning`.

**There is no `/project-structure` or `/git-workflow`.** Both were cut in the
owner's November 2026 review: Workshop 3 goes from Project Setup straight to
Mechanisms. Don't reinstate them.

**There is no `/dynamic-path-planning`.** Pathfinding was retired in
November 2026 along with the decision to move off PathPlanner: BLine, its
replacement, has no obstacle pathfinding, and a target chosen at runtime is a
field pose handed to Drive to Point. The slug 308s to `/drive-to-point`.

**`/align-to-tag` replaced `/drive-to-tag-inline`, and is not the same
lesson.** The old page drove its own loop straight off LimelightLib target
space, with flipped axes and no plan for losing the tag, and was retired in
November 2026 in favour of handing a tag-layout field pose to Drive to Point.
The owner reversed half of that the same month: a spot measured from one tag
does not depend on the field pose being right, and recording it on each
event's field absorbs that field's tag mounting. So Align to Tag is the Drive
to Point call with a tag-frame pose supplier, anchored to odometry between
frames. `7-InlineCommands` stays deleted. Don't bring back a camera-space
control loop.

**There is no `/advanced-drive-to-point`.** Profiled Drive to Point was
retired in November 2026 when Drive to Point moved onto BLine, which already
profiles every path. The slug 308s to `/drive-to-point`.

**Two slugs were renamed to their titles in September 2026.**
`/building-subsystems` became `/mechanisms`, having said "subsystem" for a
year after Commands v3 renamed the thing and the lesson title already said
"Mechanisms"; its screenshots moved to `public/images/mechanisms/`, beside the
arm and flywheel photos the home page uses. `/finish-lines` became
`/finish-conditions`, because "finish lines" was a metaphor and the title was
never that, and merged into `/conditions-and-logging` in November 2026. Both old
slugs redirect.

**Vision is two lessons, and was one for a month.** September 2026:
`/vision-hardware` opens Workshop 7 and `/vision-implementation` follows it.
The split restores the January 2026 shape that an August 2026 pass collapsed.
Collapsing them kept the code and dropped the bench work, which left the only
hardware procedure on the site sitting inside a code lesson, and putting the
missing material back into one page runs it past the 15 minute cap. So the
hardware page has no Java on it and the code page has no screwdriver on it.
`/vision-options` redirects to `/vision-hardware`, its successor, rather than
to the code page. Don't merge them again. What the split deliberately did not
bring back from the old `/vision-options`: the three-card "why vision matters"
grid, the "what you'll learn" list, and the do/don't best-practices columns,
each a heading with no procedure under it.

**There is no `/robot-class`.** `Robot.java` was its own lesson until August 2026. `/command-framework` already taught `robotPeriodic()` and the
`Scheduler.getDefault().run()` line, and even quizzes deleting it, so what
actually remained was two `public final` fields. Those now sit in the last
section of `/mechanisms`, next to the classes they own, because
`mech-1-Mechanisms` is the commit that adds them. Don't reinstate the lesson.
