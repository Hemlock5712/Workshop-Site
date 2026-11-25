# Site overhaul to-do

What is left from the October 2026 review. Check items off as they land and
delete this file when the list is empty.

## Needs the owner

- [ ] **Re-record the Tuner X videos** on the real bench (the owner is
      recording them; simulation cannot show kG or the hand tests):
      `pid-control` `Pt7SBFfl3oM` (plus a flywheel one), `motion-magic`
      `7I7r9p1RBZI`, `mechanism-setup` `cDWF3bj1Juk` and `mjGn3y19eUc`,
      `hardware` `aktcCtcrEyY` and `TkScJADvD-Y`.
- [ ] **BLine on the real robot.** Run `swerve-bline` for gains, traction and
      the stop on disable. Untested so far: the editor's folder-picker export
      and the Windows desktop app.
- [ ] **Control-system plate** for the bench mechanism (mentor request):
      needs Onshape CAD.
- [ ] **Analytics.** Vercel Analytics plus Speed Insights and PostHog all
      run. Pick one product-analytics tool or keep both.
- [ ] **MDX for lesson prose.** Optional; pilot on one page if wanted.
- [ ] **Pagefind for search.** Indexes the rendered HTML at build time with a
      small runtime stub, in place of the lazy MiniSearch. Sequence it with
      the MDX decision.

## WPILib beta 1 upgrade

Workshop-Code is on alpha-7. Alpha-8 shipped on 2026-10-24, but BLine
(`2027.0.0-beta.3`, `wpilibYear: 2027_alpha7`), LimelightLib and Phoenix 6
have no alpha-8 builds, so the move waits for beta 1. Found by reading
allwpilib `main` on 2026-11-25 against every Workshop-Code branch. Nothing
was built or run.

### Needs the owner

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
- [ ] **Logging through Epilogue.** WPILib's own Commands v3 templates put
      `@Logged` on `Robot` and call `Epilogue.update(this)` in
      `robotPeriodic()`. Epilogue walks every field and public getter on its
      own, so the `TelemetryLoggable` + `logTo` + `Telemetry.log("Arm", arm)`
      shape taught on `/conditions-and-logging` could become one annotation
      and one line. The prebuilt `Epilogue` class arrived in alpha-8
      (allwpilib#9493), so this waits for beta 1. Costs: it logs everything
      unless told not to (`@NotLogged`, `importance`), names come from the
      code, and nobody has checked what it does with a `TalonFX` field, so
      `AppliedVoltage` would likely need its own getter. Reverses the November
      decision recorded in `curriculum.md`.

### Can do now, on alpha-7

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
      check `teaching-code.md` already gates driving on, then update
      `/align-to-tag`.
- [ ] The mech chain's `build.gradle` Spotless block still excludes
      `LimelightHelpers.java`, which no mech branch has.

### Code, once beta 1 and the vendordeps land

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

## Still to do

- [ ] Wire `scripts/audit-ui.mjs` into CI against `next start`.
- [ ] Pages over the 12 minute target (all under the 15 cap, November 2026):
      `/drive-to-point` 14.7, `/mechanism-setup` 14.2, `/mechanisms` 14.0,
      `/coroutines` 13.5, `/swerve-drive-project` 13.2,
      `/ai-coding-assistant` 13.1, `/bline` 12.7,
      `/pid-control` 12.7, `/finish-conditions` 12.1.
- [ ] Inline `style={{}}` props (about 400) to utility classes; split the
      large explainer components alongside the new unit tests.
