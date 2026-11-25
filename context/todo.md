# To-do

Open work on the site and on Workshop-Code, rewritten on 2026-11-25 after
reading allwpilib `main` against every branch. Check items off as they land
and delete this file when the list is empty.

Workshop-Code is on WPILib alpha-7. Alpha-8 shipped on 2026-10-24, but BLine
(`2027.0.0-beta.3`, `wpilibYear: 2027_alpha7`), LimelightLib and Phoenix 6
have no alpha-8 builds, so the upgrade waits for beta 1.

## Needs the owner

- [ ] **Re-record the Tuner X videos** on the real bench. Simulation cannot
      show kG or the hand tests. Still embedded: `pid-control` `Pt7SBFfl3oM`
      plus a flywheel one to make, `motion-magic` `7I7r9p1RBZI`,
      `mechanism-setup` `cDWF3bj1Juk` and `mjGn3y19eUc`, `hardware`
      `aktcCtcrEyY` and `TkScJADvD-Y`.
- [ ] **Control-system plate** for the bench mechanism, a mentor request.
      Needs Onshape CAD.
- [ ] **Analytics.** Three tools run: Vercel Analytics and Speed Insights,
      which are cookieless and only load when the site is hosted on Vercel,
      and PostHog, which needs the consent banner. PostHog can record page
      views and web vitals itself, so one tool could cover all three; or drop
      PostHog and the banner if traffic counts are all anyone reads. Check
      PostHog's current web vitals option before choosing.
- [ ] **Center-origin field.** allwpilib#9590 is on `main` and will ship in
      beta 1: the origin is the field center, +X points at the blue wall, and
      every field pose turns 180 degrees from 2026. The blue-wall rule in
      `teaching-code.md` says to switch when WPILib ships this. Lesson poses,
      field graphics, the BLine flip and the LimelightLib `WPIBLUE` estimate
      move together.
- [ ] **How a released button stops a mechanism.** Today it is
      `whileFalse(stop())`, taught on 8 pages. Alpha-8 adds
      `.whenExited(() -> stopMotor())` on the command builder
      (allwpilib#9402), which runs on finish, cancel and interrupt. WPILib's
      own v3 example (`wpilibjExamples/.../rebuiltcmdv3`) instead overrides
      `idle()` to send zero and calls `setDefaultCommand(x.idle())` in
      `Robot`. The latched-request demo on `/running-program` depends on the
      choice.
- [ ] **Fold `DriveMechanism` into `CommandSwerveDrivetrain`.** Since
      allwpilib#8303 (alpha-7) `Mechanism` is an interface, made one for
      CTRE swerve, so `CommandSwerveDrivetrain extends TunerSwerveDrivetrain
implements Mechanism` works and the "a Java class can only extend one
      thing" Javadoc is out of date. The `setControl`, `resetPose`,
      `samplePoseAt` and `addVisionMeasurement` wrappers go away because the
      drivetrain already has them. The `seedFieldCentric` command needs a new
      name, because the generated class already has a `void
seedFieldCentric()`. Cost: 7 pages name `DriveMechanism`, and
      `/swerve-drive-project` gives "keeps your code out of the files Tuner X
      writes" as the reason for the split. First check what the 2027 Tuner X
      generator emits; if it already implements `Mechanism`, copy its shape.

## On the real robot

Everything below was checked in simulation only.

- [ ] **BLine.** Run `swerve-bline` for gains, traction and the stop on
      disable. Untested: the editor's folder-picker export and the Windows
      desktop app.
- [ ] **The tag frame's sign.** `toTagFrame` assumes target-space Z points
      into the wall; Limelight's docs say out of it. The sim check cannot
      catch this. Settle it before anyone drives Align to Tag, and do it
      together with the `CoordinateSystem` item below.
- [ ] **Stick signs** through `CommandXboxController` on the FIRST Driver
      Station.

## Can do now: the site

- [ ] **Make `scripts/audit-ui.mjs` fit for CI**, then add it as a job that
      builds, runs `next start` and audits. Run on 2026-11-25 it failed all
      28 page states, every one a false alarm: the `/_vercel/insights` and
      `/_vercel/speed-insights` scripts 404 off Vercel, and the name check
      reads only `aria-label`, `title` and text, so a radio inside a
      `<label>` counts as unnamed. Ignore `/_vercel/` responses and count
      `el.labels`. The one real hit is a decorative `·` separator on
      `/vision-shooting` at 360 px, 1.4:1 in light and 1.6:1 in dark; mark it
      `aria-hidden` or give it a readable token. In a cloud session launch
      with `executablePath: "/opt/pw-browsers/chromium"`, because the
      project's Playwright pins a browser build that is not installed there.
- [ ] Pages over the 12 minute target, all under the 15 cap, from
      `pnpm prose` on 2026-11-25: `/bline` 14.8, `/mechanism-setup` 14.2,
      `/coroutines` 13.2, `/ai-coding-assistant` 13.0, `/mechanisms` 13.0,
      `/pid-control` 12.7, `/swerve-drive-tuning` 12.2. `/bline` is closest
      to the cap.

## Can do now: Workshop-Code

Each item changes a branch and the pages that show it. Building needs
`frcmaven.wpi.edu` and `maven.ctr-electronics.com`, which a cloud session
reaches only if the environment allows them; check the Phoenix 6 jar with
`javap` before using any Phoenix method, because CTRE's API site is not
reachable either.

- [ ] Drop `end() { cancel(routine); }` from `RaiseAndShootOpMode`,
      `LeaveStartAuto` and `AutoOpMode`. A command scheduled inside an OpMode
      is already canceled when that OpMode exits (allwpilib#8492 and #8705,
      both in alpha-7). `AutoOpMode` keeps its
      `FollowPath.clearPendingEventTriggers()`. Check one auto in sim first,
      then update `/coroutines`, `/autonomous` and `/bline`.
- [ ] **The shooter aims at the blue goal on red.** `swerve-vision-shooting`'s
      `Flywheel` measures distance to a fixed `TARGET = (3, 5)`, while
      `driveToPoint` flips with the alliance. On red the lookup table is fed
      the distance to the wrong goal. Flip `TARGET` by
      `MatchState.getAlliance()`; after the center-origin switch the red goal
      is `TARGET.rotateBy(Rotation2d.PI)`. Update `/vision-shooting`.
- [ ] **One logging shape on the swerve chain.** The mech chain uses
      `implements TelemetryLoggable`. The shooter `Flywheel` instead logs
      inside its setters through a stored `TelemetryTable`, `Vision` logs per
      frame and `DriveMechanism` logs from CTRE's telemetry thread. The last
      two have reasons; the `Flywheel` should match the mech chain's `Flywheel`.
- [ ] **`Vision.toTagFrame` can use wpimath.** The hand-written axis swap is
      what `CoordinateSystem.convert(pose, CoordinateSystem.EDN(),
CoordinateSystem.NWU())` does: Limelight target space is X right, Y
      down, Z along the tag's normal. With Limelight's documented "Z out of
      the target", the library call gives +X out of the face with no minus
      sign, which is the opposite of today's `-getZ()`. Pair it with the sign
      check above, then update `/align-to-tag`.
- [ ] **Start from the Command v3 template.** `/project-setup` picks "OpMode
      Robot", which WPILib's `templates.json` marks `commandversion: 2`, then
      swaps CommandsV2 for CommandsV3 by hand. Alpha-7 also ships "Command v3
      Robot" and "Command v3 Robot Skeleton (Advanced)" (allwpilib#8887), and
      the alpha-7 VS Code extension builds its list from that same file and
      installs `commandsv3` itself for a `commandversion: 3` template. The
      skeleton's `Robot` already runs `Scheduler.getDefault().run()`; delete
      its `@Logged` and `Epilogue.update(this)`, since logging is Telemetry.
      Neither template has swerve code. The full one adds an
      `ExampleMechanism` that prints every loop, two `constants/` files, a
      `CommandGamepad` and `ExampleTeleop` / `ExampleAuto`, all to delete, so
      the skeleton is the better fit for the arm and flywheel chain; the
      student then writes the teleop OpMode as `implements OpMode`, not
      `extends PeriodicOpMode`, which only adds an `addPeriodic` nothing uses.
      AdvantageScope's current "Hello, Telemetry!" tutorial already tells
      students to pick "Template > Java > Command v3 Robot", so the entry is
      in the creator; still check the skeleton on alpha-7. The
      swap step, its screenshots and quiz question, the `MyTeleop` / `MyAuto`
      rule in `teaching-code.md`, and every mech branch's starting commit
      change with it.
- [ ] **`SimStartup` out of the student project.** The swerve chain ships
      `SimStartup.java`, a `simulationInit()` override that calls it, and a
      `simulateJavaAgent` block in `build.gradle`, about 140 lines that only
      exist so an agent can start sim enabled. GradleRIO has no such task.
      `mech-sim` already does the same job as a JUnit test
      (`MechanismSimTest`: `DriverStationSim` mode, enable,
      `notifyNewData()`, run the scheduler). Move the OpMode pick and enable
      into a test or test helper under `src/test`, drop the rest, and rewrite
      the headless recipe in `teaching-code.md`.
- [ ] **`MechanismViews` guesses the control mode from its name.**
      `isPositionControl` and the flywheel check match strings inside
      `ControlModeValue.toString()`. Either pass the mechanism's own getters
      (`() -> getPosition()`, `() -> getTargetPosition()`) so the picture
      draws what the mechanism asked for, or use the Talon's applied-control
      getter if the Phoenix 6 jar has one. The file is shown on
      `/mechanism-simulation` (`utilSources.ts`).
- [ ] The mech chain's `build.gradle` Spotless block still excludes
      `LimelightHelpers.java`, which no mech branch has.

## Once beta 1 and the vendordeps land

- [ ] Bump GradleRIO, Phoenix 6, BLine and LimelightLib on every branch.
      The LimelightLib file name changes per release, so re-check the URL.
- [ ] Delete `RobotModeTriggers.disabled().whileTrue(...)` from the swerve
      `Robot.java`. Since allwpilib#9417 (alpha-8) a command whose mechanism
      is not `controllableDuringDisabled()` is refused while disabled, so the
      binding never runs. Update `/triggers`, which teaches it, and the BLine
      bullet in `teaching-code.md`, which credits the stop on disable to it.
- [ ] `LeaveStartAuto`: replace the stop at the end of `run` and the
      `.whenCanceled(...)` with one `.whenExited(...)`. Update `/autonomous`.
- [ ] `mech-sim`: `org.wpilib.math.util.Units` is renamed `UnitConversions`
      (allwpilib#9621).
- [ ] Prose: `SystemCore` is now `Systemcore` (allwpilib#9671), on 10 pages.
- [ ] Check the Auto chooser on the 2027 Driver Station. allwpilib#9622
      removed the shim that let older dashboards show a `Selectable`.
