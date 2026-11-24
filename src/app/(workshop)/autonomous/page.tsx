import PageTemplate from "@/components/PageTemplate";
import LessonSection from "@/components/lesson/LessonSection";
import CodeBlock from "@/components/CodeBlock";
import Box from "@/components/Box";
import Quiz from "@/components/Quiz";
import Link from "next/link";
import { lessonMetadata } from "@/lib/lessonMetadata";

export const metadata = lessonMetadata("/autonomous");

const linkStyle =
  "text-[var(--accent)] underline hover:no-underline font-medium";

/**
 * Written against Workshop-Code `swerve-autonomous`, one commit on top of
 * `1-Swerve` that adds LeaveStartAuto. `/bline` follows this lesson on
 * `swerve-bline` and adds a second autonomous that follows a drawn path.
 *
 * Owner-style pass, November 2026: cut the "Two layers" lifecycle/behavior
 * cards and the "Three failure shapes" cards (one described a waitUntil this
 * routine does not have), folded the two stopped-request paragraphs into one.
 *
 * Owner's review, November 2026 (Recording 13): the class is built up in
 * three steps instead of pasted whole, the four test passes became
 * "Simulation first", and the taped, measured runs went with them. `/bline`
 * no longer needs numbers from this page and no longer deletes this class.
 */
export default function Autonomous() {
  return (
    <PageTemplate
      title="Autonomous"
      lede="An autonomous routine is one class holding one command. The one you build here drives off the starting line and stops."
      needs={[
        <>
          A swerve robot you can drive, from{" "}
          <strong>Swerve Drive Tuning</strong>.
        </>,
        <>
          <code>run(coroutine -&gt; ...)</code> and{" "}
          <code>coroutine.wait(...)</code>, from <strong>Coroutines</strong>.
        </>,
        <>Three meters of clear floor and one person on the disable switch.</>,
      ]}
      branch="swerve-autonomous"
      time="8 minutes"
    >
      <LessonSection id="build-the-routine" title="Build the routine">
        <p>
          Create <code>LeaveStartAuto.java</code> in the <code>opmodes</code>{" "}
          folder, beside <code>TeleopOpMode.java</code>. We will be creating a
          coroutine to drive the robot forward on a timer. Start with the empty
          class.
        </p>
        <CodeBlock
          language="java"
          filename="src/main/java/frc/robot/opmodes/LeaveStartAuto.java"
          highlightLines={[7]}
          code={`package frc.robot.opmodes;

import frc.robot.Robot;
import org.wpilib.opmode.Autonomous;
import org.wpilib.opmode.PeriodicOpMode;

@Autonomous(name = "Leave Start")
public class LeaveStartAuto extends PeriodicOpMode {
  public LeaveStartAuto(Robot robot) {}
}`}
        />
        <p>The name in the annotation is what the driver station lists.</p>

        <p>
          Next, add a <code>routine</code> field and build it in the
          constructor. The routine needs two requests: one that drives forward
          and one that asks for zero.
        </p>
        <CodeBlock
          language="java"
          filename="src/main/java/frc/robot/opmodes/LeaveStartAuto.java"
          highlightLines={[19]}
          code={`public class LeaveStartAuto extends PeriodicOpMode {
  private final Command routine;

  public LeaveStartAuto(Robot robot) {
    // Robot-centric: X is the robot's own forward, so the starting heading sets the direction.
    final var forward = new SwerveRequest.RobotCentric().withVelocityX(1.0); // meters per second
    final var stopped = new SwerveRequest.RobotCentric(); // every speed is zero

    routine =
        robot
            .drivetrain
            .run(
                coroutine -> {
                  robot.drivetrain.setControl(forward);
                  coroutine.wait(Seconds.of(1.5));
                  robot.drivetrain.setControl(stopped);
                })
            .whenCanceled(() -> robot.drivetrain.setControl(stopped))
            .named("Leave Start");
  }
}`}
        />
        <p>
          The coroutine sends <code>forward</code>, waits a second and a half,
          then sends <code>stopped</code>. A cancel skips the last line of the
          coroutine, so <code>whenCanceled</code> sends the same zero. You will
          also see our coroutine has <code>.named(...)</code>, which we will be
          able to see running on the dashboard.
        </p>

        <p>
          Last, tell the OpMode when to run the routine. <code>start()</code>{" "}
          schedules it on enable. <code>end()</code> cancels it when the mode
          stops for any reason, a disable included.
        </p>
        <CodeBlock
          language="java"
          filename="src/main/java/frc/robot/opmodes/LeaveStartAuto.java"
          code={`  // ... the constructor, unchanged

  @Override
  public void start() {
    Scheduler.getDefault().schedule(routine);
  }

  @Override
  public void end() {
    Scheduler.getDefault().cancel(routine);
  }
}`}
        />
        <p>The finished file, with its imports:</p>
        <CodeBlock
          language="java"
          filename="src/main/java/frc/robot/opmodes/LeaveStartAuto.java"
          title="LeaveStartAuto.java"
          collapsed
          code={`package frc.robot.opmodes;

import static org.wpilib.units.Units.Seconds;

import com.ctre.phoenix6.swerve.SwerveRequest;
import frc.robot.Robot;
import org.wpilib.command3.Command;
import org.wpilib.command3.Scheduler;
import org.wpilib.opmode.Autonomous;
import org.wpilib.opmode.PeriodicOpMode;

@Autonomous(name = "Leave Start")
public class LeaveStartAuto extends PeriodicOpMode {
  private final Command routine;

  public LeaveStartAuto(Robot robot) {
    // Robot-centric: X is the robot's own forward, so the starting heading sets the direction.
    final var forward = new SwerveRequest.RobotCentric().withVelocityX(1.0); // meters per second
    final var stopped = new SwerveRequest.RobotCentric(); // every speed is zero

    routine =
        robot
            .drivetrain
            .run(
                coroutine -> {
                  robot.drivetrain.setControl(forward);
                  coroutine.wait(Seconds.of(1.5));
                  robot.drivetrain.setControl(stopped);
                })
            .whenCanceled(() -> robot.drivetrain.setControl(stopped))
            .named("Leave Start");
  }

  @Override
  public void start() {
    Scheduler.getDefault().schedule(routine);
  }

  @Override
  public void end() {
    Scheduler.getDefault().cancel(routine);
  }
}`}
        />
      </LessonSection>

      <LessonSection id="simulation-first" title="Simulation first">
        <p>
          Before you run any autonomous on a real robot, run it in{" "}
          <Link
            href="/swerve-drive-project#full-simulation"
            className={linkStyle}
          >
            simulation
          </Link>
          .
        </p>
        <ol className="ml-5 list-decimal space-y-3">
          <li>
            Run <strong>WPILib: Simulate Robot Code</strong> and pick{" "}
            <strong>Leave Start</strong> from the autonomous list.
          </li>
          <li>
            Enable, and watch <code>Drivetrain/Pose</code> on the 2D field in
            AdvantageScope.
          </li>
        </ol>
        <Box variant="alert-success" title="You should see">
          <p>
            The robot drive forward about a meter and a half, stop, and stay
            stopped.
          </p>
        </Box>
      </LessonSection>

      <LessonSection id="check-your-work" title="Check your work">
        <Box variant="alert-danger" title="Nobody in front of the robot">
          <p>
            An autonomous routine drives with nobody holding a stick. Give one
            person the robot to watch and one person the driver station, with a
            thumb near disable. Enable last.
          </p>
        </Box>
        <p>
          Put the robot on the floor with clear floor ahead of it, pick{" "}
          <strong>Leave Start</strong>, and enable.
        </p>
        <Box variant="alert-success" title="You should see">
          <p>
            The robot leaving in the direction its front bumper points, then
            stopping and staying stopped.
          </p>
        </Box>
        <p>
          A second routine is a second file. Copy this one, change the
          annotation name and the numbers, and it shows up on the list beside
          the first. Nothing registers it.
        </p>
      </LessonSection>
      <Quiz
        questions={[
          {
            id: 1,
            question:
              "You delete the setControl(stopped) line after the wait and run Leave Start on blocks, hands off the controller. What do the wheels do after 1.5 seconds?",
            options: [
              "They stop, because ending a command sends zero to its motors",
              "They keep turning at 1 m/s forever, because the last request stays latched",
              "They stop, because Robot's joystick default takes the drivetrain back and centered sticks ask for zero",
              "They slow down gradually as the battery sags",
            ],
            correctAnswer: 2,
            explanation:
              "Ending a command sends nothing to the motors. The joystick default set in Robot.java claims the drivetrain once the routine ends, and centered sticks ask for zero. The routine sends stopped itself so it never relies on the sticks.",
          },
          {
            id: 2,
            question:
              "The robot starts the run facing the side wall instead of down the field. Which way does it drive?",
            options: [
              "Toward the side wall, because RobotCentric X is the robot's own forward",
              "Down the field, because the pose is measured from the blue corner",
              "Away from the driver station, because forward flips with alliance",
              "It does not move until the heading is reset",
            ],
            correctAnswer: 0,
            explanation:
              "RobotCentric velocities are relative to the robot's front bumper. Point the robot at the side wall and X is toward the side wall.",
          },
          {
            id: 3,
            question:
              "You want a second routine that drives 2 meters. What do you do?",
            options: [
              "Add a second @Autonomous annotation to LeaveStartAuto",
              "Copy the class, give it a new @Autonomous name and new numbers, and it appears on the mode list",
              "Add an if statement to LeaveStartAuto that picks a wait from the match clock",
              "Register the new class in the Robot constructor",
            ],
            correctAnswer: 1,
            explanation:
              "The driver station lists every @Autonomous class it finds, under the name in the annotation. Nothing registers the class in code.",
          },
          {
            id: 4,
            question:
              "You hit disable one second into the drive. Which method stops the routine, and what do you do before the next run?",
            options: [
              "start() runs again on disable, so just enable to resume",
              "Nothing stops it; the routine finishes on its own after re-enable",
              "The constructor runs again on disable, so nothing else is needed",
              "end() cancels the routine, and enabling again starts it fresh",
            ],
            correctAnswer: 3,
            explanation:
              "end() runs when the mode stops for any reason, and it cancels the routine. The cancel runs whenCanceled, which sends the zero. Enable again and the routine starts from the first line.",
          },
        ]}
      />
    </PageTemplate>
  );
}
