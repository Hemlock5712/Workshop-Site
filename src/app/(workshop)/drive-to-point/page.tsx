import PageTemplate from "@/components/PageTemplate";
import LessonSection from "@/components/lesson/LessonSection";
import CodeBlock from "@/components/CodeBlock";
import Box from "@/components/Box";
import Quiz from "@/components/Quiz";
import Link from "next/link";
import { lessonMetadata } from "@/lib/lessonMetadata";

export const metadata = lessonMetadata("/drive-to-point");

const linkStyle =
  "text-[var(--accent)] underline hover:no-underline font-medium";

/**
 * Rewritten November 2026, when the course moved all on-the-fly driving to
 * BLine. Written against Workshop-Code `swerve-drive-to-point`,
 * whose parent is `swerve-bline`.
 *
 * The old page built `DriveToPoint.java`, three hand-tuned PID controllers in
 * a `while (true)` loop, and `/advanced-drive-to-point` then replaced its
 * kP-times-error speed with a LinearPath profile. Both are gone. A one-waypoint
 * BLine path built in code gets the same controllers, speed limits, end
 * tolerances and stop-on-finish as every drawn path, so the method is one
 * expression and the lesson is about what a field pose means.
 * `/advanced-drive-to-point` 308s here.
 *
 * Verified in simulation, November 2026: from (0, 0, 0) to (3, 2, 180) in
 * 3.8 s, finished at (2.98, 2.00, 178.0), zero velocity one second later. A
 * code-built path needs no extra setup: it picks up BLine's defaults without
 * `config.json` being loaded first. Not verified on hardware.
 *
 * Owner's review, November 2026 (Recording 13): the target now flips with the
 * alliance. `driveToPoint` dropped its `withShouldFlip(() -> false)` and takes
 * the builder's `withDefaultShouldFlip()`, so a spot written for blue is the
 * matching spot on red. Sim, same month: blue ends at (2.99, 2.02, 178),
 * red at (13.53, 6.06, 0). The branch moved onto `swerve-bline`, ahead of
 * `swerve-vision`, to match the lesson order.
 *
 * November 2026, the fold: `DriveMechanism` is gone from the swerve chain.
 * `CommandSwerveDrivetrain` now `implements Mechanism` itself, possible since
 * alpha-7 made `Mechanism` an interface, so `driveToPoint` sits in that file.
 * Packages moved to `first.robot`: the drivetrain is in `mechanisms` and the
 * OpModes in `opmode`. The left-bumper command is `resetHeading()`. The
 * method body did not change.
 */
export default function DriveToPoint() {
  return (
    <PageTemplate
      title="Drive to Point"
      lede="In teleop we will often want our robot to drive itself to a specific spot on the field. We can do this with BLine, on the fly."
      needs={[
        <>
          <strong>BLine Paths</strong>, for the builder in{" "}
          <code>CommandSwerveDrivetrain</code>.
        </>,
        <>
          <code>whileTrue</code> from <strong>Writing Commands</strong>.
        </>,
      ]}
      branch="swerve-drive-to-point"
      time="8 minutes"
    >
      <LessonSection id="the-pose-you-are-driving-to" title="The target pose">
        <p>
          As you learned in{" "}
          <Link href="/swerve-basics" className={linkStyle}>
            Swerve Basics
          </Link>
          , a pose is a position on the field made of a translation and a
          rotation. We will be picking a <code>Pose2d</code> as our target
          position on the field. The robot thinks it has arrived when{" "}
          <code>getPose()</code> reads our target pose, and odometry alone
          drifts.{" "}
          <strong>
            Expect the robot to stop a little off the spot. The Vision workshop
            corrects that drift with a camera.
          </strong>
        </p>
      </LessonSection>

      <LessonSection id="one-waypoint" title="One waypoint, built in code">
        <p>
          Add <code>driveToPoint</code> to <code>CommandSwerveDrivetrain</code>,
          under <code>followPath</code>. One <code>Path.Waypoint</code> is the
          whole path: BLine starts from wherever the robot is when the command
          starts, and drives to the waypoint.
        </p>

        <CodeBlock
          language="java"
          filename="src/main/java/first/robot/mechanisms/CommandSwerveDrivetrain.java"
          highlightLines={[4, 5, 6]}
          code={`public class CommandSwerveDrivetrain extends TunerSwerveDrivetrain implements Mechanism {
  // ... everything up to followPath, unchanged

  public FollowPath driveToPoint(Pose2d goal) {
    return pathBuilder.build(new Path(new Path.Waypoint(goal)));
  }

  // ... the rest, unchanged
}`}
        />

        <p>
          Everything the <code>pathBuilder</code> was given in{" "}
          <Link href="/bline#builder" className={linkStyle}>
            BLine Paths
          </Link>{" "}
          comes along: the three controllers, the speed limits and the end
          tolerances. The command finishes once the robot is within 3 cm and 2°
          of the goal. It sends a zero velocity when it finishes or is canceled.
        </p>
        <p>
          The alliance check comes along too. Like a drawn path, the goal is
          written for the blue alliance. On red, BLine turns it around the field
          center, so the same button drives to the matching spot on your own
          side.
        </p>
      </LessonSection>

      <LessonSection id="bind-it" title="Bind it">
        <p>
          Now let&apos;s tie this to a button and drive to a spot on the field.
          Open <code>TeleopOpMode</code> back up and add two new buttons under
          the left-bumper binding, with their two imports. <strong>A</strong>{" "}
          drives to the field origin, and <strong>B</strong> to (3 m, 2 m)
          facing 180°.
        </p>

        <CodeBlock
          language="java"
          filename="src/main/java/first/robot/opmode/TeleopOpMode.java"
          highlightLines={[1, 2, 10, 11, 12]}
          code={`import org.wpilib.math.geometry.Pose2d;
import org.wpilib.math.geometry.Rotation2d;
// ... the other imports, unchanged

public class TeleopOpMode extends PeriodicOpMode {
  public TeleopOpMode(Robot robot) {
    // Left bumper: make the robot's current facing the new "forward".
    robot.driver.leftBumper().onTrue(robot.drivetrain.resetHeading());

    // Hold A or B to drive straight to a fixed spot on the field. Let go to stop.
    robot.driver.a().whileTrue(robot.drivetrain.driveToPoint(Pose2d.ZERO));
    robot.driver.b().whileTrue(robot.drivetrain.driveToPoint(new Pose2d(3, 2, Rotation2d.PI)));
  }
}`}
        />

        <p>
          <code>whileTrue</code> cancels the command when the button is
          released. While it runs, the path command owns the drivetrain, so the
          joystick default waits. Once the robot arrives the command ends, and
          the sticks have the drivetrain back even if the button is still down.
        </p>
      </LessonSection>

      <LessonSection id="check-your-work" title="Check your work">
        <ol className="ml-5 list-decimal space-y-3">
          <li>
            Enable Teleop in{" "}
            <Link
              href="/swerve-drive-project#full-simulation"
              className={linkStyle}
            >
              full simulation
            </Link>{" "}
            on the blue alliance, drive a few meters from where the robot
            started, and turn it. Hold <strong>A</strong>.
          </li>
          <li>
            Release <strong>A</strong> halfway through the trip with the sticks
            centered.
          </li>
          <li>
            Hold <strong>B</strong> until the robot stops, then switch to red
            and hold <strong>B</strong> again.
          </li>
        </ol>

        <Box variant="alert-success" title="You should see">
          <ul className="ml-5 list-disc space-y-2">
            <li>
              On A, the robot drive back and turn to 0° at the same time, then
              stop on its own.
            </li>
            <li>On release, the robot stop where it is.</li>
            <li>
              On B, <code>Drivetrain/Pose</code> settle within 3 cm of (3, 2)
              and 2° of 180° on blue. On red it settles at the matching spot at
              the other end of the field, (13.54, 6.07) facing 0°.
            </li>
          </ul>
        </Box>

        <Box variant="alert-danger" title="Check the alliance first">
          <p>
            On a real robot, look at the alliance on the driver station before
            you hold the button. On red the target is at the far end of the
            field, and the robot will try to drive all the way there.
          </p>
        </Box>
      </LessonSection>

      <Quiz
        questions={[
          {
            id: 1,
            question:
              "How many waypoints does the path inside driveToPoint have, and where does the robot start from?",
            options: [
              "Two: the robot's pose at build time and the goal",
              "One, the goal. BLine starts from wherever the robot is when the command starts",
              "One, the goal, and the robot's pose is reset to the field origin first",
              "None. The goal is passed to the controllers directly",
            ],
            correctAnswer: 1,
            explanation:
              "The path is new Path(new Path.Waypoint(goal)). BLine drives from the robot's current pose to that waypoint, and nothing resets the pose.",
          },
          {
            id: 2,
            question:
              "The B button is bound to driveToPoint(new Pose2d(3, 2, Rotation2d.PI)). Where does the robot go on the red alliance?",
            options: [
              "To (3, 2), the same spot as on blue",
              "Nowhere. A code-built path has no alliance, so the command ends",
              "To (3, 2), but facing 0° instead of 180°",
              "To the matching spot at the other end of the field, because the builder turns the goal around the field center on red",
            ],
            correctAnswer: 3,
            explanation:
              "The builder was made with withDefaultShouldFlip, which checks the alliance. The goal is written for blue, and on red BLine turns it around the field center, the same as a drawn path.",
          },
          {
            id: 3,
            question:
              "The driver holds B. The robot arrives and the button is still down. Who has the drivetrain?",
            options: [
              "The path command, until the button is released",
              "Nobody, until the button is released",
              "The joystick default command, because the path command finished on arrival",
              "The path command, which restarts every loop while the button is held",
            ],
            correctAnswer: 2,
            explanation:
              "The command ends once the robot is inside the end tolerances. whileTrue does not restart a command that finished, so the default command gets the drivetrain back.",
          },
        ]}
      />
    </PageTemplate>
  );
}
