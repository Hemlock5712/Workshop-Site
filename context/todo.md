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
- [ ] **How a released button stops a mechanism.** Today it is
      `whileFalse(stop())`, taught on 8 pages. Alpha-8 adds
      `.whenExited(() -> stopMotor())` on the command builder
      (allwpilib#9402), which runs on finish, cancel and interrupt. WPILib's
      own v3 example (`wpilibjExamples/.../rebuiltcmdv3`) instead overrides
      `idle()` to send zero and calls `setDefaultCommand(x.idle())` in
      `Robot`. The latched-request demo on `/running-program` depends on the
      choice. The default-command option already works on alpha-7; the
      `whenExited` option needs beta 1.

- [x] **Deleted the branches no page teaches**, 2026-11-26, on the owner's
      word: `1-Swerve` (renamed `swerve-project`), `2-Logging`, `3-Limelight`,
      `4-DynamicFlywheel`, `5-DriveToPoint` and `6-ProfiledToPoint`. Their
      pull requests (#8 to #12) closed with them. Every one has a local
      `backup/2026-11-26/<branch>` tag in `reference/work/Workshop-Code`,
      which is not on GitHub. `p1-flywheel`, the one-off bench run, is still
      there: it was not named when the others were approved.
- [ ] **Re-capture three `/project-setup` screenshots.** The page moved to
      the "Command v3 Robot Skeleton (Advanced)" template on 2026-11-26 and
      three pictures showed the old flow, so their `ImageBlock`s were removed
      and the figure titles now skip from Step 3 to 5 to 7. The files are
      still in `public/images/project-setup/`:
      `step-4.png` (New Project Creator page 2, Project Base set to the
      skeleton), `step-6.png` (Review and Create, naming the skeleton) and
      `step-8.png` (Vendor Dependencies on a fresh skeleton project, Commands
      v3 already installed, only the CTRE-Phoenix (v6) Install button
      circled). Nobody has watched the new flow in the real wizard: the
      Epilogue lines and the missing OpMode are read off the extension's
      template files.
- [ ] **Twelve lesson videos are stale until re-voiced and re-rendered.**
      The scripts and cue files were brought back in line with the 2026-11-26
      pages, and all twelve pass `render-page.mjs --draft --dry`. What is left
      needs the owner's go-ahead, because voicing uses the cloned voice and
      uploading publishes. Re-voice, then render and upload (`voice.mjs`,
      then steps 4 and 5 in `context/videos.md`): `project-setup` (epilogue,
      teleop and phoenix lines replace the CommandsV2 swap), `opmodes` (file,
      edit, bind), `swerve-drive-project` (generate, files), `autonomous`
      (life, sim, floor, close; the old four-pass and three-numbers lines were
      stale), `bline` (folder, builder, opmode, path, chooser, start, trigger;
      the install line is cut, Leave Start is kept, nothing cancels in
      `end()`), `drive-to-point` (flip, check, a new warn line; the goal now
      flips with the alliance), `vision-implementation` (install) and
      `align-to-tag` (empty). Render and upload only, narration unchanged and
      the voiced dry run already passing: `coroutines`, `mechanism-setup`,
      `pid-control`, `swerve-drive-tuning`.
- [ ] **`/ai-coding-assistant` points at a stale template.** It sends
      students to 2027-Template's `ONBOARDING.md` and `.claude/skills`, and
      2027-Template is still on GradleRIO alpha-6 (`2027-dev`, last change
      October 2026). Either bring 2027-Template to alpha-7, or give
      Workshop-Code `main` its own onboarding file and skills and point the
      page there.

## On the real robot

Everything below was checked in simulation only.

- [ ] **BLine.** Run `swerve-bline` for gains, traction and the stop on
      disable. Untested: the editor's folder-picker export and the Windows
      desktop app.
- [ ] **The tag frame's sign.** `toTagFrame` assumes target-space Z points
      into the wall; Limelight's docs say out of it. The sim check cannot
      catch this. Settle it before anyone drives Align to Tag.
- [ ] **`Vision.toTagFrame` can use wpimath**, once the sign above is known.
      The hand-written axis swap is what `CoordinateSystem.convert(pose,
CoordinateSystem.EDN(), CoordinateSystem.NWU())` does: Limelight target
      space is X right, Y down, Z along the tag's normal. With Limelight's
      documented "Z out of the target", the library call gives +X out of the
      face with no minus sign, the opposite of today's `-getZ()`, and what the
      rotation becomes has not been worked out. Left alone on 2026-11-26
      because the sim check synthesizes the sighting with the inverse of the
      same function, so it cannot catch a wrong sign. Then update
      `/align-to-tag`.
- [ ] **Stick signs** through `CommandXboxController` on the FIRST Driver
      Station.

## Can do now: the site

- [x] `scripts/audit-ui.mjs` is fit for CI and runs as the `ui-audit` job:
      it ignores `/_vercel/` responses, counts `el.labels` and
      `aria-labelledby`, fails on an unnamed control, and takes
      `AUDIT_CHROMIUM` for a browser path. The `·` separator on lesson pages
      uses `--tx3`. Clean on all 28 page states on 2026-11-26.
- [ ] Pages over the 12 minute target, all under the 15 cap, from
      `pnpm prose` on 2026-11-26: `/bline` 14.3, `/mechanism-setup` 13.5,
      `/coroutines` 13.0, `/ai-coding-assistant` 12.8, `/mechanisms` 12.6,
      `/swerve-drive-tuning` 12.1. A pass that day cut only duplication:
      captions repeating a step, bullets restating a code comment, recap
      sentences. It brought `/pid-control` to 12.0 and took the rest down by
      0.1 to 0.7. What is left is structure, not prose: `/mechanism-setup` is
      about 19 steps, a table and a quiz, and `/bline` is six code blocks and
      eight steps, built up in steps on the owner's instruction. Getting
      either to 12 means splitting the page or dropping a step, which is the
      owner's call.
- [ ] `scripts/audit-ui.mjs` checks seven pages. It runs in CI since
      2026-11-26. A one-off run that day over eleven more lessons found one
      real failure the seven had missed, since fixed: highlighted line numbers
      in `CodeBlock` used the light theme's `--accent` on the dark code
      background, 3.68:1. Consider auditing every route in `lessons.ts`, which
      costs about three seconds a page state.

## Can do now: Workshop-Code

Each item changes a branch and the pages that show it. Building needs
`frcmaven.wpi.edu` and `maven.ctr-electronics.com`, which a cloud session
reaches only if the environment allows them; check the Phoenix 6 jar with
`javap` before using any Phoenix method, because CTRE's API site is not
reachable either.

Landed on 2026-11-26, built on every branch and checked in simulation. The
detail is in `teaching-code.md` and `curriculum.md`.

- [x] Fold `DriveMechanism` into `CommandSwerveDrivetrain`, move the swerve
      chain to `first.robot`, rename `1-Swerve` to `swerve-project`, and cut
      tag `v3.4-swerve`.
- [x] Drop `end() { cancel(routine); }` from `RaiseAndShootOpMode`,
      `LeaveStartAuto` and `AutoOpMode`.
- [x] The shooter aims at its own alliance's goal.
- [x] One logging shape: the shooter `Flywheel` is `TelemetryLoggable`.
- [x] Start from "Command v3 Robot Skeleton (Advanced)": `main` rebuilt, the
      mech chain rebased, every `MyTeleop` is `implements OpMode`.
- [x] `SimStartup` out of the student project, replaced by `SimRobot` under
      `src/test`.
- [x] `MechanismViews` draws from the mechanism's own getters.
- [x] The mech chain's Spotless block no longer excludes
      `LimelightHelpers.java`. The swerve chain's `build.gradle` still does.

## Once beta 1 and the vendordeps land

- [ ] **Move to the center-origin field.** allwpilib#9590 is on `main`
      (2026-11-07) and will ship in beta 1: (0, 0) is the field center, +X
      points at the blue alliance wall, and every field-relative pose turns
      180 degrees from 2026. WPILib calls it silently breaking, because a
      logged pose does not say which frame it is in. The owner's rule in
      `teaching-code.md` ("Every pose is blue-wall origin") is to switch
      everything together once WPILib ships it, so wait until BLine and
      LimelightLib also have center-origin builds; mixing frames pulls
      odometry half a field on every vision update. Then:
  - Branches: `driveToPoint` goals, the shooter `TARGET` (its `target()`
    uses BLine's `FlippingUtil` today; the red goal becomes
    `TARGET.rotateBy(Rotation2d.PI)`), BLine's flip and its
    16.54 × 8.07 m field, and the LimelightLib estimate type that replaces
    `MT1_WPIBLUE` / `MT2_WPIBLUE`.
  - Pages with field coordinates: `/drive-to-point`, `/autonomous`,
    `/swerve-basics`, `/vision-shooting`, `/align-to-tag`, plus the site's
    field graphics.
  - Rewrite the blue-wall bullet in `teaching-code.md`.

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
