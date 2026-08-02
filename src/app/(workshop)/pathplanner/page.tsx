import PageTemplate from "@/components/PageTemplate";
import LessonSection from "@/components/lesson/LessonSection";
import AlphaStatusNote from "@/components/AlphaStatusNote";
import KeyConceptSection from "@/components/KeyConceptSection";
import Box from "@/components/Box";
import CodeBlock from "@/components/CodeBlock";
import GitHubContent from "@/components/GitHubContent";
import DocumentationButton from "@/components/DocumentationButton";
import Quiz from "@/components/Quiz";
import Link from "next/link";
import { GitBranch } from "lucide-react";

const bodyStyle = { color: "var(--fg-mute)" } as const;

export default function AutonomousRoutines() {
  return (
    <PageTemplate
      title="An autonomous routine is a class you write"
      emphasis="a class you write"
      lede="Every routine is its own class tagged @Autonomous. The driver station lists them by name, and the one the driver picks is the only one that gets built. There is no dropdown to register, no chooser object, and no file to load off the robot."
      needs={[
        <>
          The <code>DriveToPoint</code> command from{" "}
          <Link href="/drive-to-point" className="underline hover:no-underline">
            Drive to Point
          </Link>{" "}
          and{" "}
          <Link
            href="/advanced-drive-to-point"
            className="underline hover:no-underline"
          >
            Profiled Drive to Point
          </Link>{" "}
          — the <code>6-ProfiledToPoint</code> branch on disk.
        </>,
        <>
          A drivetrain whose odometry you trust, from{" "}
          <Link
            href="/swerve-calibration#seeding"
            className="underline hover:no-underline"
          >
            Swerve Calibration
          </Link>
          . Every pose on this page is read off odometry.
        </>,
        <>
          The simulator, and the habit of enabling it, from{" "}
          <Link
            href="/running-program"
            className="underline hover:no-underline"
          >
            Running Your Code
          </Link>
          .
        </>,
      ]}
      time="Roughly 30 minutes"
    >
      <Box
        variant="alert-info"
        tag="ABOUT THIS URL"
        title="No PathPlanner here"
      >
        <p>
          This page lives at <code>/pathplanner</code> because that link is in
          old Discord messages and old slides, and breaking it would strand
          people. <strong>This stack does not use PathPlanner</strong> — no path
          editor, no <code>.path</code> files, no <code>AutoBuilder</code>. The
          speed profile PathPlanner would have generated is already computed on
          the robot by CTRE&apos;s <code>LinearPath</code>, inside the{" "}
          <code>DriveToPoint</code> command you finished on the last page. So an
          autonomous routine is a short list of those commands, written in Java.
        </p>
      </Box>

      <KeyConceptSection
        description={[
          "Inside the class you build one command in the constructor, schedule it when the robot is enabled, and cancel it when the mode ends. The command is a Command.sequence of drive legs — the same chaining you learned in Workshop #1, applied to a drivetrain instead of an arm.",
        ]}
        concept="Autonomous = an @Autonomous class holding one Command.sequence of DriveToPoint legs."
      />

      <Box variant="alert-info" tag="WHAT YOU'LL BUILD">
        <p className="mt-3">
          <strong>What you&apos;ll build:</strong> one new file — an{" "}
          <code>@Autonomous</code> OpMode that drives two legs, one after the
          other, and appears by name on the driver station.{" "}
          <strong>Roughly 30 minutes</strong>, most of it deciding on poses.
        </p>
      </Box>

      {/* ── the leg ──────────────────────────────────────────────────── */}
      <LessonSection
        id="the-leg-you-already-built"
        title="The leg you already built"
      >
        <p className="text-[15px] leading-relaxed" style={bodyStyle}>
          <code>DriveToPoint</code> takes a drivetrain and a goal{" "}
          <code>Pose2d</code>, and drives to it in a straight line while turning
          to the goal heading. <code>LinearPath</code> plans the whole trip up
          front — speed up, cruise, slow down — and that planned velocity does
          the driving. Three <code>PIDController</code>s (X, Y, heading) only
          trim off the drift between where odometry says you are and where the
          plan says you should be.
        </p>

        <CodeBlock
          language="java"
          title="Building one leg"
          code={`// Drive to a field pose: 3 m downfield, 2 m to the left, facing 180 degrees.
Pose2d goal = new Pose2d(3, 2, Rotation2d.fromDegrees(180));

// The leg requires the drivetrain, and idles it when it ends.
Command leg = new DriveToPoint(robot.drivetrain, goal);`}
        />

        <Box variant="concept" title="Why this one can go in a sequence">
          <p>
            Almost every command you have written so far is a{" "}
            <strong>hold</strong> — it never finishes, so nothing may wait on
            it. <code>DriveToPoint</code> is different. <code>LinearPath</code>{" "}
            knows how long the whole trip takes, so the command&apos;s{" "}
            <code>isFinished()</code> is a plain time check:{" "}
            <code>path.isFinished(t)</code>. It ends on its own. That is exactly
            what a step in a <code>Command.sequence</code> has to do, and it is
            why this lesson comes after the two that build the command.
          </p>
        </Box>

        <GitHubContent
          repository="Hemlock5712/Workshop-Code"
          branch="6-ProfiledToPoint"
          filePath="src/main/java/frc/robot/commands/DriveToPoint.java"
          title="DriveToPoint.java — the leg, on 6-ProfiledToPoint"
          description="The command your routine will sequence. Note the TODO: tune comments on the constraints and the PID gains — the branch ships them untuned."
        />

        <Box
          variant="alert-warning"
          tag="NAMING"
          title="DriveToPose is the template's copy of this class"
        >
          <p>
            The{" "}
            <a
              href="https://github.com/Hemlock5712/2027-Template/blob/2027-dev/src/main/java/frc/robot/commands/DriveToPose.java"
              target="_blank"
              rel="noopener noreferrer"
              className="underline hover:no-underline"
            >
              2027-Template
            </a>{" "}
            ships the same command under the name <code>DriveToPose</code>: same{" "}
            <code>LinearPath</code>, same{" "}
            <code>TrapezoidProfile.Constraints(2.5, 3.0)</code> and{" "}
            <code>(Math.PI, 2.0 * Math.PI)</code>, same 3.0 / 3.0 / 4.0 PID
            gains, same <code>ClassicCommand</code> base. It exists in the
            template only —{" "}
            <strong>
              no Workshop-Code branch has a class called{" "}
              <code>DriveToPose</code>
            </strong>
            . If you are reading a template file and see that name, it is your{" "}
            <code>DriveToPoint</code>.
          </p>
        </Box>
      </LessonSection>

      {/* ── 1. write the routine ─────────────────────────────────────── */}
      <LessonSection id="1-write-the-routine" title="1. Write the routine">
        <p className="text-[15px] leading-relaxed" style={bodyStyle}>
          Create one new file next to your <code>TeleopOpMode</code>. The
          framework finds every annotated class in{" "}
          <code>frc.robot.opmodes</code> on its own — there is nothing to
          register anywhere else.
        </p>

        <CodeBlock
          language="java"
          title="A new file — two legs in sequence"
          filename="src/main/java/frc/robot/opmodes/AutonomousOpMode.java"
          code={`package frc.robot.opmodes;

import frc.robot.Robot;
import frc.robot.commands.DriveToPoint;
import org.wpilib.command3.Command;
import org.wpilib.command3.Scheduler;
import org.wpilib.math.geometry.Pose2d;
import org.wpilib.math.geometry.Rotation2d;
import org.wpilib.opmode.Autonomous;
import org.wpilib.opmode.PeriodicOpMode;

@Autonomous(name = "Two Leg Auto")
public class AutonomousOpMode extends PeriodicOpMode {
  private final Command routine;

  public AutonomousOpMode(Robot robot) {
    // Field poses are blue-origin (x forward from the blue wall, y left).
    // TODO: replace with the real poses for your routine.
    final Pose2d firstLeg = new Pose2d(2.0, 0.0, Rotation2d.kZero); // 2 m straight ahead
    final Pose2d secondLeg =
        new Pose2d(2.0, 1.5, Rotation2d.fromDegrees(90)); // then 1.5 m left, facing +y

    // Each leg requires the drivetrain. The sequence inherits that requirement,
    // and the scheduler hands the drivetrain from one leg to the next.
    routine =
        Command.sequence(
                new DriveToPoint(robot.drivetrain, firstLeg),
                new DriveToPoint(robot.drivetrain, secondLeg))
            .named("Two Leg Auto");
  }

  @Override
  public void start() {
    Scheduler.getDefault().schedule(routine); // fires once when the robot is enabled
  }

  @Override
  public void end() {
    Scheduler.getDefault().cancel(routine);
  }
}`}
        />

        <p className="text-[15px] leading-relaxed" style={bodyStyle}>
          Three things are worth naming, because they are the whole shape of an
          autonomous routine on this stack:
        </p>

        <ul
          className="ml-5 list-disc space-y-2 text-[15px] leading-relaxed"
          style={bodyStyle}
        >
          <li>
            <strong>The constructor builds; it does not run.</strong>{" "}
            <code>Command.sequence(...).named(&quot;Two Leg Auto&quot;)</code>{" "}
            produces an object and stores it. Nothing moves yet. A built command
            is inert until the scheduler is handed it.
          </li>
          <li>
            <strong>
              <code>start()</code> hands it over.
            </strong>{" "}
            It fires once, when the robot is enabled in this mode.{" "}
            <code>Scheduler.getDefault().schedule(routine)</code> is what starts
            the first leg.
          </li>
          <li>
            <strong>
              <code>end()</code> takes it back.
            </strong>{" "}
            When the mode ends — the match period is over, or a driver switches
            modes — <code>cancel(routine)</code> stops it wherever it got to.
            Each leg&apos;s own cleanup then idles the drivetrain.
          </li>
        </ul>

        <Box variant="alert-tip" tag="RESULT" title="What you should see">
          <p>
            Build the project. <strong>Two Leg Auto</strong> now appears by name
            in the driver station&apos;s list of autonomous modes. You have not
            run it yet — the poses are still placeholders and odometry is still
            unseeded — but the routine is discoverable, which is the first
            checkpoint.
          </p>
        </Box>
      </LessonSection>

      {/* ── 2. real poses ────────────────────────────────────────────── */}
      <LessonSection id="2-make-the-poses-real" title="2. Make the poses real">
        <p className="text-[15px] leading-relaxed" style={bodyStyle}>
          A <code>Pose2d</code> is three numbers: x in meters, y in meters, and
          a heading. <code>Rotation2d.kZero</code> means facing along +x;{" "}
          <code>Rotation2d.fromDegrees(90)</code> means facing along +y. The
          numbers in the file above are placeholders that came with the
          template&apos;s example, and the template flags them with its own{" "}
          <code>TODO</code>.
        </p>

        <Box
          variant="alert-warning"
          tag="FIELD FRAME"
          title="Poses are blue-alliance origin, always"
        >
          <p>
            Odometry puts (0, 0) at the blue alliance corner, x running away
            from the blue wall and y running to the left.{" "}
            <strong>That origin does not flip when you are on red</strong> — it
            is the Phoenix convention, and <code>DriveMechanism.getPose()</code>{" "}
            says so in its own javadoc. The velocity request inside{" "}
            <code>DriveToPoint</code> is pinned to the same frame with{" "}
            <code>ForwardPerspectiveValue.BlueAlliance</code>, so the command
            and the odometry always agree.
          </p>
          <p className="mt-3">
            On red, that means the goal poses change, not the origin. Mirror
            each goal to the red side of the field and keep one place in the
            code that does the mirroring, so there is one thing to check when a
            routine goes the wrong way.
          </p>
        </Box>

        <p className="text-[15px] leading-relaxed" style={bodyStyle}>
          The cheapest way to get honest numbers is to stop guessing: push the
          robot to the spot you want, read <code>Drivetrain/Pose</code> out of
          the telemetry you set up on{" "}
          <Link
            href="/logging-implementation"
            className="underline hover:no-underline"
          >
            Logging
          </Link>
          , and type those numbers into the file.
        </p>

        <Box variant="alert-tip" tag="RESULT" title="What you should see">
          <p>
            Rebuild. <code>AutonomousOpMode.java</code> still compiles, and the
            two <code>Pose2d</code> literals are your measured numbers instead
            of the placeholder <code>2.0, 0.0</code> and <code>2.0, 1.5</code>.
            Delete the <code>TODO</code> comment above them once they are your
            numbers.
          </p>
        </Box>
      </LessonSection>

      {/* ── 3. seeding ───────────────────────────────────────────────── */}
      <LessonSection
        id="seed-the-pose-before-the"
        title="Seed the pose before the routine runs"
      >
        <p className="text-[15px] leading-relaxed" style={bodyStyle}>
          This is the step that quietly ruins autonomous routines.{" "}
          <code>DriveToPoint</code> never looks at the field. It reads{" "}
          <code>drivetrain.getPose()</code>, which is odometry — the
          drivetrain&apos;s running tally of where it thinks it is. If that
          tally starts wrong, every leg is wrong by the same amount, and the
          robot will drive confidently to the wrong place.
        </p>

        <p className="text-[15px] leading-relaxed" style={bodyStyle}>
          The template&apos;s own autonomous example says this out loud in a
          comment:{" "}
          <em>
            &quot;Assumes odometry has been seeded to the starting pose.&quot;
          </em>{" "}
          Here is what that means in practice, and what does and does not do it.
        </p>

        <Box
          variant="alert-danger"
          tag="NOT THIS"
          title="seedFieldCentric() does not seed odometry"
        >
          <p>
            <code>drivetrain.seedFieldCentric()</code> — the one bound to the
            left bumper in your <code>TeleopOpMode</code> — resets the{" "}
            <em>driver&apos;s</em> forward direction so that pushing the stick
            away drives away from the driver. It changes nothing about the
            robot&apos;s x and y. The two operations get confused constantly
            because both sound like &quot;reset the robot.&quot;{" "}
            <Link
              href="/swerve-calibration#seeding"
              className="underline hover:no-underline"
            >
              Swerve Calibration
            </Link>{" "}
            is where that distinction is drawn out properly.
          </p>
        </Box>

        <p className="text-[15px] leading-relaxed" style={bodyStyle}>
          On the branch you have, exactly one thing writes an absolute field
          pose into odometry: <strong>vision</strong>. <code>Robot.java</code>{" "}
          calls{" "}
          <code>Limelight.registerAll(drivetrain, &quot;limelight&quot;)</code>,
          and each camera feeds AprilTag sightings in through{" "}
          <code>addVisionMeasurement(...)</code> every loop. So the practical
          procedure is:
        </p>

        <ol
          className="ml-5 list-decimal space-y-3 text-[15px] leading-relaxed"
          style={bodyStyle}
        >
          <li>
            Place the robot at its real starting spot,{" "}
            <strong>with an AprilTag in view</strong>.
          </li>
          <li>
            Power on and watch <code>Drivetrain/Pose</code> in your telemetry.
            Do not enable yet. <code>registerAll</code> puts each camera&apos;s
            update on the scheduler, and the scheduler runs every loop whether
            the robot is enabled or disabled — so the corrections should pull
            the pose to the right field coordinates within a second or two while
            you are still disabled.
          </li>
          <li>
            Only enable once the pose reads right, and only then run the
            routine. If you start facing a blank wall, the pose stays at
            whatever it was when the code booted.
          </li>
        </ol>

        <Box
          variant="alert-info"
          tag="HEADING"
          title="Single-tag sightings lean on the gyro"
        >
          <p>
            The <code>Limelight</code> class uses MegaTag1 when two or more tags
            are visible, and falls back to MegaTag2 for a single tag. MegaTag2
            trusts the gyro for heading rather than the tags — the file pins its
            heading trust to <code>IGNORE_VISION_HEADING = 9_999_999</code> to
            say so. Its javadoc puts it plainly:{" "}
            <em>
              &quot;seed the gyro, or single-tag results will be off.&quot;
            </em>{" "}
            Two tags in view at start is worth arranging.
          </p>
        </Box>

        <Box
          variant="alert-warning"
          tag="MISSING API"
          title="There is no resetPose() on DriveMechanism yet"
        >
          <p>
            Real teams usually want a second route: write a known starting pose
            straight into odometry, no camera required. The{" "}
            <code>DriveMechanism</code> on this branch does not expose one. Its
            public surface is <code>applyRequest</code>,{" "}
            <code>seedFieldCentric</code>, <code>setControl</code>,{" "}
            <code>getPose</code>, <code>getFieldVelocity</code> and{" "}
            <code>addVisionMeasurement</code> — read the file and check for
            yourself. Adding a pass-through that writes a pose into the
            drivetrain is a reasonable thing to build once you are comfortable;
            it is not something this workshop has built for you, and the pages
            here will not pretend otherwise.
          </p>
        </Box>
      </LessonSection>

      {/* ── 4. run it ────────────────────────────────────────────────── */}
      <LessonSection id="4-run-it" title="4. Run it">
        <p className="text-[15px] leading-relaxed" style={bodyStyle}>
          Step 3 is a real-robot step. <code>Limelight</code> says so in its own
          javadoc —{" "}
          <em>&quot;Does nothing in simulation (there is no camera).&quot;</em>{" "}
          Nothing seeds odometry in the simulator, so the sim robot starts at
          (0, 0, 0) and every goal pose is measured from there. That is fine for
          checking the shape of a routine; it is not fine for trusting the
          numbers.
        </p>

        <p className="text-[15px] leading-relaxed" style={bodyStyle}>
          Two ways to start it. The normal one is the simulator you have been
          using: launch it, pick <strong>Two Leg Auto</strong> from the
          autonomous modes, set the robot state to Autonomous, and enable. The
          second is a headless run that picks the mode for you — useful when you
          are iterating on poses and do not want to click anything.
        </p>

        <CodeBlock
          language="bash"
          title="Two ways to start the routine"
          code={`# The usual way: sim GUI, you click Enable.
./gradlew simulateJava

# Headless, and it selects the @Autonomous by name for you.
./gradlew simulateJavaAgent -Pmode=auto:"Two Leg Auto"`}
        />

        <p className="text-[15px] leading-relaxed" style={bodyStyle}>
          The headless run prints which OpMode it picked, which makes it a quick
          way to check the name matched:
        </p>

        <CodeBlock
          language="text"
          hideControls
          code={`[SimStartup] Headless start: enabled=true mode=AUTONOMOUS opmode="Two Leg Auto"`}
        />
      </LessonSection>

      {/* ── mid-path actions ─────────────────────────────────────────── */}
      <LessonSection
        id="doing-something-partway-through"
        title="Doing something partway through"
      >
        <p className="text-[15px] leading-relaxed" style={bodyStyle}>
          In a path editor this is an &quot;event marker&quot;: a flag dropped
          on the path that fires an action. Here there is nothing to drop it on
          — the legs are ordinary commands in a list, so an action is another
          entry in the same list. The two chaining tools you already know cover
          it:
        </p>

        <ul
          className="ml-5 list-disc space-y-2 text-[15px] leading-relaxed"
          style={bodyStyle}
        >
          <li>
            <strong>Between legs:</strong> put the mechanism command in the
            sequence, with a finish line —{" "}
            <code>hold.until(condition).named(&quot;...&quot;)</code>. Without
            one, the sequence stops there forever.
          </li>
          <li>
            <strong>During a leg:</strong>{" "}
            <code>Command.race(leg, hold).named(&quot;...&quot;)</code>. A race
            ends the moment any member finishes and cancels the rest — the hold
            never finishes, so the leg always decides.
          </li>
        </ul>

        <Box
          variant="alert-info"
          tag="HEADS UP"
          title="Your swerve branch has no arm and no flywheel"
        >
          <p>
            <code>6-ProfiledToPoint</code> ships three things under{" "}
            <code>subsystems/</code>: <code>CommandSwerveDrivetrain</code>,{" "}
            <code>DriveMechanism</code> and <code>Limelight</code>. The arm and
            flywheel you built in Workshop #1 are on the mechanism-track
            branches and are not in this tree, so you cannot run a
            multi-mechanism routine on the branch in front of you. The{" "}
            <strong>2027-Template</strong> has all of them in one project, and
            its worked example is below — read it as the shape you are heading
            for.
          </p>
        </Box>

        <CodeBlock
          language="java"
          title="2027-Template — DriveStowDriveChainedOpMode.java (its own DriveToPose is your DriveToPoint)"
          code={`routine =
    Command.sequence(
            // Leg 1: DriveToPose finishes on its own, so it can sit in a sequence as-is.
            new DriveToPose(robot.drivetrain, pose1),

            // Stow is a hold - it would stick here forever. .until(...) gives it a finish
            // line: this step ends the moment the arm actually reaches the stow angle.
            robot.stow().until(robot.arm::isAtTarget).named("stow until stowed"),

            // Leg 2 WHILE holding the stow pose: the race ends when DriveToPose finishes
            // (the hold never finishes, so the drive always decides) and cancels the hold.
            Command.race(new DriveToPose(robot.drivetrain, pose2), robot.stow())
                .named("drive holding stow"))
        .named("Drive Stow Drive (Chained)");`}
        />

        <p className="text-[15px] leading-relaxed" style={bodyStyle}>
          The methods it calls — <code>robot.stow()</code>,{" "}
          <code>robot.intake()</code>, <code>robot.score()</code> — live at the
          bottom of the template&apos;s <code>Robot.java</code>. Each one poses
          the whole robot at once, and each is built with{" "}
          <code>Command.parallel(arm..., flywheel...)</code>. That operator gets
          its own treatment on{" "}
          <Link href="/state-based" className="underline hover:no-underline">
            State Machines
          </Link>
          , where posing the whole robot is the entire point.
        </p>

        <p className="text-[15px] leading-relaxed" style={bodyStyle}>
          That file&apos;s own comment calls chaining{" "}
          <em>
            &quot;the recommended style for multi-mechanism autos on this team —
            chaining is as far as most routines ever need to go.&quot;
          </em>{" "}
          It is worth reading in full.
        </p>

        <DocumentationButton
          href="https://github.com/Hemlock5712/2027-Template/blob/2027-dev/src/main/java/frc/robot/opmodes/DriveStowDriveChainedOpMode.java"
          title="DriveStowDriveChainedOpMode.java — a multi-mechanism routine"
          icon={<GitBranch className="w-5 h-5" />}
        />

        <Box variant="concept" title="A second routine is a second file">
          <p>
            Want a choice on the driver station? Add another class with another{" "}
            <code>@Autonomous(name = &quot;...&quot;)</code> in the same
            package. It shows up as another entry, and only the one the driver
            selects is ever constructed. Nothing else changes — no registration
            list, no chooser to keep in sync, no file to redeploy.
          </p>
        </Box>
      </LessonSection>

      {/* ── did it work ──────────────────────────────────────────────── */}
      <LessonSection id="did-it-work" title="Did it work?">
        <ol
          className="ml-5 list-decimal space-y-3 text-[15px] leading-relaxed"
          style={bodyStyle}
        >
          <li>
            Build the project. <strong>You should see:</strong> it compiles, and{" "}
            <strong>Two Leg Auto</strong> is in the autonomous list on the
            driver station.
          </li>
          <li>
            Start the routine one of the two ways above.{" "}
            <strong>You should see:</strong> the robot leaves immediately —{" "}
            <code>start()</code> schedules on enable, so there is no delay.
          </li>
          <li>
            Watch leg one. <strong>You should see:</strong> a smooth ramp up to
            speed, a cruise, and a slow-down into the goal — not a lurch. That
            ramp is <code>LinearPath</code>; it is the difference between{" "}
            <code>5-DriveToPoint</code> and <code>6-ProfiledToPoint</code>.
          </li>
          <li>
            Watch the handover. <strong>You should see:</strong> the robot stops
            at the first pose, then starts the second leg — including the turn
            to 90 degrees. One leg finishing is what releases the drivetrain for
            the next.
          </li>
          <li>
            Watch the end. <strong>You should see:</strong> after the last leg
            the robot sits still. The sequence is finished, and each leg idles
            the drivetrain in its own cleanup.
          </li>
          <li>
            Check <code>Drivetrain/Pose</code> against your goal.{" "}
            <strong>You should see:</strong> close, but not exact. The three PID
            gains and the profile constraints in <code>DriveToPoint</code> are
            both marked <code>TODO: tune</code> on the branch — that gap is
            tuning work, not a bug.
          </li>
        </ol>

        <Box
          variant="alert-info"
          tag="IF IT DIDN'T WORK"
          title="Three things that go wrong here"
        >
          <ul className="ml-4 list-disc space-y-3">
            <li>
              <strong>The routine is not on the driver station at all.</strong>{" "}
              Headless prints{" "}
              <code>
                [SimStartup] No AUTONOMOUS OpMode named &quot;...&quot; found;
                staying disabled.
              </code>{" "}
              Check three things: the class is in <code>frc.robot.opmodes</code>
              , it carries <code>@Autonomous(name = ...)</code>, and its
              constructor takes a single <code>Robot</code>. The framework
              discovers by annotation and constructs with that argument; miss
              any of the three and it is invisible.
            </li>
            <li>
              <strong>
                The robot drives, smoothly, to somewhere completely wrong.
              </strong>{" "}
              Odometry was never seeded, so your poses are measured from
              wherever the code happened to boot. This is step 3, and it is by
              far the most common cause. Watch <code>Drivetrain/Pose</code>{" "}
              <em>before</em> you enable — if it reads (0, 0, 0) while the robot
              is plainly not in the blue corner, that is the bug.
            </li>
            <li>
              <strong>It enables, and nothing moves at all.</strong> The routine
              was built but never handed over. Check that <code>start()</code>{" "}
              contains <code>Scheduler.getDefault().schedule(routine)</code> — a
              built command is inert until the scheduler has it. If{" "}
              <code>start()</code> is right, check that the sequence has no bare
              hold in it: a hold never finishes, so a sequence that reaches one
              stops there and never reports an error.
            </li>
          </ul>
        </Box>
      </LessonSection>

      <AlphaStatusNote />

      <Quiz
        title="Knowledge Check"
        questions={[
          {
            id: 1,
            question:
              "How does this stack run autonomous routines, given that PathPlanner is not used anywhere?",
            options: [
              "It still loads a .path file from the deploy directory at startup",
              "Each routine is its own @Autonomous class holding a Command.sequence of DriveToPoint legs",
              "You pick a routine from a dropdown in the code editor before deploying",
              "Autonomous is generated for you by Phoenix Tuner X",
            ],
            correctAnswer: 1,
            explanation:
              "One class per routine, tagged @Autonomous. The driver station lists them by name and constructs only the one the driver picks. Inside, you build a Command.sequence of DriveToPoint legs in the constructor, schedule it in start(), and cancel it in end().",
          },
          {
            id: 2,
            question:
              "What makes DriveToPoint usable as a step inside Command.sequence, when almost every other command you have written is not?",
            options: [
              "It is a ClassicCommand, and only ClassicCommands can be sequenced",
              "It finishes on its own — LinearPath knows the trip time, so isFinished() is a time check",
              "The sequence gives every step a two-second timeout automatically",
              "It requires the drivetrain, and required commands always end",
            ],
            correctAnswer: 1,
            explanation:
              "A sequence waits for each step. A hold never finishes, so a sequence containing one sticks forever. DriveToPoint's isFinished() returns path.isFinished(t) — the profile knows how long the trip takes — so it ends by itself and the sequence moves on.",
          },
          {
            id: 3,
            question:
              "You are on the red alliance. What do you change about the goal poses in your routine?",
            options: [
              "Nothing — the field origin flips to your alliance automatically",
              "Mirror the goals to the red side; the origin stays in the blue corner",
              "Switch the poses to robot-relative coordinates",
              "Negate the heading on every pose and leave x and y alone",
            ],
            correctAnswer: 1,
            explanation:
              "Odometry keeps (0, 0) at the blue alliance corner no matter which alliance you are on, and DriveToPoint pins its velocity request to that same blue-origin frame. So on red you change the goals, not the origin — mirror them, in one place in the code.",
          },
          {
            id: 4,
            question:
              "Your routine drives smoothly but ends up two meters from where you wanted. What should you check first?",
            options: [
              "Whether odometry was seeded to the real starting pose before you enabled",
              "Whether you called seedFieldCentric() before the routine started",
              "Whether the sequence was named",
              "Whether the second leg's heading is in degrees rather than radians",
            ],
            correctAnswer: 0,
            explanation:
              "DriveToPoint follows odometry, so a wrong starting pose offsets every leg by the same amount. seedFieldCentric() is not the fix — it resets the driver's forward direction and leaves x and y untouched. On this branch, vision is what writes an absolute pose into odometry, so start with a tag in view.",
          },
          {
            id: 5,
            question:
              "You want a mechanism to hold a pose WHILE a drive leg runs. What do you write?",
            options: [
              "Command.sequence(leg, hold) — the sequence runs them together",
              'Command.race(leg, hold).named("...") — the leg finishes and cancels the hold',
              "Command.deadline(leg, hold) — the leg is the deadline",
              "Bind the hold to a button and press it during autonomous",
            ],
            correctAnswer: 1,
            explanation:
              "A race ends as soon as any member finishes and cancels the rest. The hold can never be that member, so the leg always decides. There is no Command.deadline(...) in Commands v3 — race is how the deadline pattern is spelled, and the group still needs its .named(...) terminal.",
          },
        ]}
      />

      {/* ── what's next ──────────────────────────────────────────────── */}
      <LessonSection id="what-s-next" title="What's next?">
        <Box variant="alert-success" title="That is the end of Workshop #2">
          <p>
            You have a swerve drive that logs, sees AprilTags, drives to a pose
            on a profile, and runs a routine on its own. Everything you have
            written since Workshop #1 has been in one dialect: chaining —{" "}
            <code>Command.sequence</code>, <code>Command.race</code>,{" "}
            <code>.withTimeout(...)</code>, <code>.until(...)</code>.
          </p>
          <p className="mt-3">
            Advanced Topics is where the other two dialects live. Next up is{" "}
            <Link href="/coroutines" className="underline hover:no-underline">
              Coroutines
            </Link>
            : the style for routines that need loops, branches, or a hold that
            has to span several steps. It starts by asking you to check out a
            mechanism-track branch again, so keep this one somewhere you can get
            back to it.
          </p>
        </Box>
      </LessonSection>
    </PageTemplate>
  );
}
