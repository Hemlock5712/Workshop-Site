import PageTemplate from "@/components/PageTemplate";
import LessonSection from "@/components/lesson/LessonSection";
import CodeBlock from "@/components/CodeBlock";
import Box from "@/components/Box";
import Quiz from "@/components/Quiz";
import { lessonMetadata } from "@/lib/lessonMetadata";

export const metadata = lessonMetadata("/autonomous");

/**
 * Written against Workshop-Code `swerve-autonomous`, one commit on top of
 * `1-Swerve` that adds LeaveStartAuto. `/bline` follows this lesson on
 * `swerve-bline` and replaces the timer with a drawn path, holding it
 * against the three numbers measured here.
 *
 * Owner-style pass, November 2026: cut the "Two layers" lifecycle/behavior
 * cards and the "Three failure shapes" cards (one described a waitUntil this
 * routine does not have), folded the two stopped-request paragraphs into one.
 */
export default function Autonomous() {
  return (
    <PageTemplate
      title="Autonomous"
      lede="One autonomous routine is one class holding one command. The class puts a name on the driver station and owns the mode boundary. The command does the driving, and the one you build here leaves the starting line and stops."
      needs={[
        <>
          A swerve robot you can drive, with a pose you trust, from{" "}
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
      <p>
        You have written an <code>@Autonomous</code> class once already: Raise
        And Shoot, on <strong>Coroutines</strong>, ran the arm and flywheel with
        no one holding a button. This one has the same shape and drives the
        whole robot.
      </p>
      <p>
        The routine is a timed drive, and it is crude on purpose. A timed step
        tells you whether the mode list, the scheduler, and the drivetrain agree
        with each other. It tells you very little about where the robot ended
        up.
      </p>

      <LessonSection id="build-the-routine" title="Build the routine">
        <p>
          Create <code>LeaveStartAuto.java</code> in the <code>opmodes</code>{" "}
          folder, beside <code>TeleopOpMode.java</code>. The constructor builds
          the routine when somebody picks the mode. <code>start()</code>{" "}
          schedules it on enable. <code>end()</code> cancels it when the mode
          stops for any reason, a disable included.
        </p>
        <CodeBlock
          language="java"
          filename="src/main/java/frc/robot/opmodes/LeaveStartAuto.java"
          title="LeaveStartAuto.java: lifecycle and behavior together"
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
        <p>
          A wait is the only finish line available here.{" "}
          <code>DriveMechanism</code> reports its pose, but nothing on it
          answers <em>am I there yet</em> the way{" "}
          <code>robot.arm.isAtTarget()</code> did on Conditions and Logging.
        </p>
        <p>
          Two names go into this file and they do different jobs. The one in the
          annotation is what the driver station lists, so it is the one a driver
          reads under pressure. The one in <code>.named(...)</code> is what the
          command is called in the scheduler and on the dashboard.
        </p>
        <p>
          When the routine ends, the joystick default from{" "}
          <code>Robot.java</code> takes the drivetrain back, and centered sticks
          ask for zero. The routine still sends <code>stopped</code> itself, so
          it does not depend on nobody touching the sticks. The last line of the
          coroutine covers a routine that runs to the end. A cancel skips that
          line, so <code>whenCanceled</code> sends the same zero.
        </p>
        <p>
          The robot&apos;s field position is never set in this routine.{" "}
          <code>Drivetrain/Pose</code> starts wherever odometry left off.
          Restart the robot code before a measured run and it reads near zero,
          which makes the distance easy to read straight off AdvantageScope.
        </p>
      </LessonSection>

      <LessonSection id="test-in-layers" title="Four test passes">
        <p>Each pass answers one question. Run them in order.</p>
        <Box variant="alert-danger" title="Nobody in front of the robot">
          <p>
            An autonomous routine drives with nobody holding a stick. Give one
            person the robot to watch and one person the driver station, with a
            thumb near disable. Keep the first three meters clear of anything
            you care about. Enable last.
          </p>
        </Box>
        <ol className="ml-5 list-decimal space-y-3">
          <li>
            <strong>On blocks.</strong> Deploy, pick{" "}
            <strong>Leave Start</strong> off the mode list, and enable. All four
            modules drive forward together for about a second and a half. Then
            they stop, and they stay stopped while the mode runs.
          </li>
          <li>
            <strong>On the floor, once.</strong> Put the robot on its tape mark
            with clear floor ahead of it and run the same routine. It leaves in
            the direction its front bumper points, because{" "}
            <code>RobotCentric</code> X is the robot&apos;s forward and not the
            field&apos;s. The starting heading sets the direction.
          </li>
          <li>
            <strong>Measured, three times.</strong> Tape the floor at the front
            edge before and after each run, starting from the same mark every
            time. The taped distance and the last <code>Drivetrain/Pose</code>{" "}
            in AdvantageScope should agree, and the three runs should land close
            together.
          </li>
          <li>
            <strong>Disabled partway.</strong> Hit disable about a second into
            the drive. The wheels stop. Enable again and the routine starts over
            from the first line.
          </li>
        </ol>
      </LessonSection>

      <LessonSection id="check-your-work" title="Check your work">
        <p>
          Run the routine three times from the same tape mark, on the floor,
          with AdvantageScope connected. You are done when the three runs land
          on top of each other.
        </p>
        <Box variant="alert-success" title="You should see">
          <p>
            The robot leaving in the direction its front bumper points, stopping
            and staying stopped, and three end poses in{" "}
            <code>Drivetrain/Pose</code> close to each other.
          </p>
        </Box>
        <p>
          Write down the distance the tape measured, the end pose, and the wait
          that produced them. BLine Paths replaces that wait with a path drawn
          from the same tape mark. These three numbers are what you will hold
          the path against.
        </p>
        <p>
          A second routine is a second file. Copy this one, change the
          annotation name and the numbers, and it turns up on the list beside
          the first. Nothing registers it, and nothing in{" "}
          <code>Robot.java</code> chooses between the two.
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
              "Ending a command sends nothing to the motors. What stops the wheels is the joystick default set in Robot.java, which applies in every mode: it claims the drivetrain once the routine ends, and centered sticks ask for zero. The routine sends stopped itself anyway, so it never relies on the sticks.",
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
              "RobotCentric means the velocities are relative to the robot's front bumper. Point the robot at the side wall and X is toward the side wall. The starting heading on the tape mark is what aims the routine.",
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
              "The driver station lists every @Autonomous class it finds. One routine is one class, and nothing registers it or chooses between them in code. The name in the annotation is the one a driver reads off the list.",
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
              "end() runs when the mode stops for any reason, and it cancels the routine. The cancel runs whenCanceled, which sends the zero. Enable again and the next run starts from the first line, with no need to pick the mode again.",
          },
        ]}
      />
    </PageTemplate>
  );
}
