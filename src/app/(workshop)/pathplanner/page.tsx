import PageTemplate from "@/components/PageTemplate";
import AlphaStatusNote from "@/components/AlphaStatusNote";
import KeyConceptSection from "@/components/KeyConceptSection";
import Box from "@/components/Box";
import CodeBlock from "@/components/CodeBlock";
import CollapsibleSection from "@/components/CollapsibleSection";
import Quiz from "@/components/Quiz";
import Link from "next/link";

export default function AutonomousRoutines() {
  return (
    <PageTemplate title="Autonomous: Driving to a Pose">
      {/* Introduction */}
      <KeyConceptSection
        title="Autonomous Without PathPlanner"
        description="The 2027 template drives itself in autonomous with CTRE's on-board path tools, LinearPath and a DriveToPose command, instead of PathPlanner. A routine is just an @Autonomous OpMode that sequences DriveToPose legs (and mechanism commands) in code. No GUI, no vendor dependency, no AutoBuilder."
        concept="Autonomous = an @Autonomous OpMode that sequences DriveToPose legs. Each leg drives in a straight line to a field pose using CTRE LinearPath (a profiled feedforward) plus PID feedback on odometry."
      />

      {/* Section 1: The building block */}
      <section className="flex flex-col gap-8">
        <h2 className="text-3xl font-bold text-slate-900 dark:text-slate-100">
          The building block: DriveToPose
        </h2>

        <p className="text-slate-600 dark:text-slate-300">
          <code>DriveToPose</code> is a command that drives the robot in a
          straight line to a target field pose, on odometry. The{" "}
          <em>feedforward</em> comes from CTRE&apos;s <code>LinearPath</code>, a
          trajectory generator that produces a smooth trapezoid-profiled
          velocity toward the goal. Three PID controllers (X, Y, heading) trim
          the measured pose back onto the profile to cancel drift. You give it a
          goal <code>Pose2d</code> and it finishes when the profile is done.
        </p>

        <CodeBlock
          language="java"
          title="Using DriveToPose"
          code={`// Drive to a field pose: 3 m downfield, 1 m to the left, facing +90°.
// Poses are blue-alliance origin (x forward from the blue wall, y to the left).
Pose2d goal = new Pose2d(3.0, 1.0, Rotation2d.fromDegrees(90));

// DriveToPose requires the drivetrain; it idles the drivetrain when it ends.
Command leg = new DriveToPose(robot.drivetrain, goal);`}
        />

        <Box variant="alert-info" title="Where the controller internals live">
          <p className="text-sm text-slate-600 dark:text-slate-300">
            This page is about <em>composing</em> autonomous routines. The
            inside of the drive-to-a-pose command (the PID feedback, the
            profiled feedforward, and the field-frame math) is built up step by
            step on the{" "}
            <Link
              href="/drive-to-point"
              className="text-primary-600 underline hover:no-underline hover:text-primary-800 dark:text-primary-400 dark:hover:text-primary-300 font-medium"
            >
              Drive to Point
            </Link>{" "}
            lesson (basic, three PID controllers) and the{" "}
            <Link
              href="/advanced-drive-to-point"
              className="text-primary-600 underline hover:no-underline hover:text-primary-800 dark:text-primary-400 dark:hover:text-primary-300 font-medium"
            >
              Profiled Drive to Point
            </Link>{" "}
            lesson (the <code>LinearPath</code> feedforward version that{" "}
            <code>DriveToPose</code> uses).
          </p>
        </Box>
      </section>

      {/* Section 2: An autonomous routine */}
      <section className="flex flex-col gap-8">
        <h2 className="text-3xl font-bold text-slate-900 dark:text-slate-100">
          An autonomous routine is an @Autonomous OpMode
        </h2>

        <p className="text-slate-600 dark:text-slate-300">
          In the OpMode model there is no <code>SendableChooser</code>. Each
          autonomous routine is its own class tagged <code>@Autonomous</code>;
          the driver station lists them by name, and selecting one constructs
          it. You build the routine in the constructor with{" "}
          <code>Command.sequence(...)</code> (legs run one after another) and{" "}
          <code>Command.parallel(...)</code> (things happen together), schedule
          it in <code>start()</code>, and cancel it in <code>end()</code>.
        </p>

        <CodeBlock
          language="java"
          title="AutonomousOpMode.java — two legs in sequence"
          code={`@Autonomous(name = "Drive To Pose")
public class AutonomousOpMode extends PeriodicOpMode {
  private final Command routine;

  public AutonomousOpMode(Robot robot) {
    // Field poses are blue-origin (x forward from the blue wall, y to the left).
    Pose2d firstLeg = new Pose2d(2.0, 0.0, Rotation2d.kZero);            // 2 m straight ahead
    Pose2d secondLeg = new Pose2d(2.0, 1.5, Rotation2d.fromDegrees(90)); // then 1.5 m left, facing +y

    // Each DriveToPose requires the drivetrain; the sequence inherits that
    // requirement and the scheduler hands the drivetrain off between legs.
    routine =
        Command.sequence(
                new DriveToPose(robot.drivetrain, firstLeg),
                new DriveToPose(robot.drivetrain, secondLeg))
            .named("DriveToPose Auto");
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

        <p className="text-slate-600 dark:text-slate-300">
          Want a second routine? Add another <code>@Autonomous</code> class; it
          shows up as another choice on the driver station. To do something at a
          point in the path (the old &quot;event marker&quot;), chain a
          mechanism command into the sequence — a hold with a call-site{" "}
          <code>.until(...)</code>, or <code>Command.race(leg, hold)</code> to
          hold a pose <em>while</em> driving. The team&apos;s worked example of
          exactly that pattern is{" "}
          <a
            href="https://github.com/Hemlock5712/2027-Template/blob/2027-dev/src/main/java/frc/robot/opmodes/DriveStowDriveChainedOpMode.java"
            target="_blank"
            rel="noopener noreferrer"
            className="underline"
          >
            DriveStowDriveChainedOpMode.java
          </a>{" "}
          in the 2027-Template, alongside its{" "}
          <a
            href="https://github.com/Hemlock5712/2027-Template/blob/2027-dev/src/main/java/frc/robot/opmodes/AutonomousOpMode.java"
            target="_blank"
            rel="noopener noreferrer"
            className="underline"
          >
            AutonomousOpMode.java
          </a>{" "}
          and{" "}
          <a
            href="https://github.com/Hemlock5712/2027-Template/blob/2027-dev/src/main/java/frc/robot/commands/DriveToPose.java"
            target="_blank"
            rel="noopener noreferrer"
            className="underline"
          >
            DriveToPose.java
          </a>
          .
        </p>

        <CollapsibleSection title='🧩 Mixing in mechanism actions (the old "event markers")'>
          <div className="space-y-4">
            <p className="text-sm text-slate-600 dark:text-slate-300">
              Because legs are just commands, you can interleave superstructure
              actions with drive legs. Run the flywheel spin-up <em>while</em>{" "}
              driving, then score:
            </p>
            <CodeBlock
              language="java"
              title="Drive + act, composed in code"
              code={`routine =
    Command.sequence(
            // Drive to the pickup pose while the intake runs.
            Command.parallel(
                new DriveToPose(robot.drivetrain, pickupPose),
                robot.superstructure.intake()),
            // Drive to the scoring pose, then score.
            new DriveToPose(robot.drivetrain, scorePose),
            robot.superstructure.score())
        .named("Pickup + Score Auto");`}
            />
          </div>
        </CollapsibleSection>
      </section>

      {/* Section 3: Field frame + alliance */}
      <section className="flex flex-col gap-8">
        <h2 className="text-3xl font-bold text-slate-900 dark:text-slate-100">
          Field frame &amp; alliance
        </h2>

        <Box variant="alert-warning" title="Poses are blue-alliance origin">
          <p className="mb-2 text-sm text-slate-600 dark:text-slate-300">
            Odometry (and therefore <code>DriveToPose</code>) works in the
            blue-alliance-origin field frame. The origin does not flip with
            alliance (this is the Phoenix convention), so write your poses for
            the blue side.
          </p>
          <p className="text-sm text-slate-600 dark:text-slate-300">
            When you&apos;re on the red alliance, flip the goal poses to the red
            side rather than changing the origin. Keep one source of truth for
            the flip and apply it where you build the routine.
          </p>
        </Box>

        <Box variant="alert-info" title="Seed your starting pose">
          <p className="text-sm text-slate-600 dark:text-slate-300">
            <code>DriveToPose</code> follows <em>odometry</em>, so the routine
            assumes the drivetrain&apos;s pose has been seeded to the real
            starting pose before auto runs (e.g. from a known start position or
            a vision estimate). If odometry is wrong at the start, every leg is
            off by the same amount.
          </p>
        </Box>
      </section>

      {/* Quiz Section */}
      <section className="flex flex-col gap-8">
        <AlphaStatusNote />

        <Quiz
          title="Knowledge Check"
          questions={[
            {
              id: 1,
              question:
                "How does the 2027 template run autonomous routines (instead of PathPlanner)?",
              options: [
                "It still uses PathPlanner's AutoBuilder under the hood",
                "Each routine is an @Autonomous OpMode that sequences DriveToPose legs in code",
                "A SendableChooser picks between auto methods in RobotContainer",
                "Autonomous is generated automatically by Phoenix Tuner X",
              ],
              correctAnswer: 1,
              explanation:
                "There's no PathPlanner and no RobotContainer. Each routine is its own @Autonomous class; the driver station lists them by name. You build the routine with Command.sequence(...) of DriveToPose legs (and mechanism commands), schedule it in start(), and cancel it in end().",
            },
            {
              id: 2,
              question: "What does DriveToPose use to drive to a field pose?",
              options: [
                "A PathPlanner .path file loaded from the deploy directory",
                "CTRE LinearPath as a profiled feedforward, plus PID feedback (X, Y, heading) on odometry",
                "Open-loop voltage for a fixed amount of time",
                "Vision targeting only",
              ],
              correctAnswer: 1,
              explanation:
                "DriveToPose samples CTRE's LinearPath (a trapezoid-profiled trajectory) for the feedforward velocity that actually moves the robot, and three PID controllers trim the measured pose back onto the profile to cancel drift. It runs on odometry.",
            },
            {
              id: 3,
              question:
                "In what field frame should you write the goal poses for DriveToPose?",
              options: [
                "Robot-relative (origin at the robot)",
                "Blue-alliance origin — the origin does not flip with alliance",
                "Always relative to your own driver station",
                "Whatever alliance you're on; the origin flips automatically",
              ],
              correctAnswer: 1,
              explanation:
                "Odometry uses the blue-alliance-origin field frame (the Phoenix convention) and the origin does not flip with alliance. Write poses for the blue side and flip the goals to the red side when you're on red.",
            },
            {
              id: 4,
              question:
                "How do you trigger a mechanism action partway through an autonomous routine (the old PathPlanner 'event marker')?",
              options: [
                "Register it with NamedCommands.registerCommand(...)",
                "Place an event marker in the PathPlanner GUI",
                "Put the mechanism command into the Command.sequence, or fork it inside a coroutine body",
                "It's not possible without PathPlanner",
              ],
              correctAnswer: 2,
              explanation:
                "Legs are just commands, so you compose mechanism actions right into the routine: add them to the sequence, run them in parallel with a drive leg via Command.parallel(...), or fork them inside a coroutine body to run in the background.",
            },
            {
              id: 5,
              question: "How do you add a second autonomous routine?",
              options: [
                "Add another option to a SendableChooser",
                "Add another @Autonomous class — it appears as another choice on the driver station",
                "Add a new .path file in deploy/pathplanner",
                "Pass a flag to AutoBuilder.buildAuto(...)",
              ],
              correctAnswer: 1,
              explanation:
                "One @Autonomous class per routine. The framework discovers each annotated class and lists it on the driver station; selecting one constructs that OpMode and schedules its routine.",
            },
          ]}
        />
      </section>

      {/* What's Next Section */}
      <section className="flex flex-col gap-8">
        <h2 className="text-3xl font-bold text-slate-900 dark:text-slate-100">
          What&apos;s Next?
        </h2>

        <Box variant="alert-success" title="Up Next: Swerve Calibration">
          Accurate autonomous depends on accurate odometry. Next you&apos;ll
          calibrate your swerve drive (tune motor gains, configure slip-current
          limits, and measure wheel radius) so <code>DriveToPose</code> tracks
          your field poses precisely.
        </Box>
      </section>
    </PageTemplate>
  );
}
