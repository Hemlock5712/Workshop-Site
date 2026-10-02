import PageTemplate from "@/components/PageTemplate";
import LessonSection from "@/components/lesson/LessonSection";
import FigureGrid from "@/components/lesson/FigureGrid";
import CodeBlock from "@/components/CodeBlock";
import Box from "@/components/Box";
import { MarginNote, Split } from "@/components/lesson/Prose";
import Quiz from "@/components/Quiz";
import { lessonMetadata } from "@/lib/lessonMetadata";

export const metadata = lessonMetadata("/autonomous");

/**
 * Written against Workshop-Code `swerve-autonomous`, one commit on top of
 * `1-Swerve` that adds LeaveStartAuto. `/pathplanner` follows this lesson on
 * `swerve-pathplanner` and replaces the timer with a drawn path, holding it
 * against the three numbers measured here.
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
      time="30 minutes"
    >
      <Split>
        <div className="measure flex flex-col gap-pad [&>p]:m-0 [&>p]:prose-body">
          <p>
            You have written an <code>@Autonomous</code> class once already:
            Raise And Shoot, on <strong>Coroutines</strong>, ran the arm and
            flywheel with no one holding a button. This one has the same shape
            and drives the whole robot.
          </p>
          <p>
            The routine is a timed drive, and it is crude on purpose. A timed
            step tells you whether the mode list, the scheduler, and the
            drivetrain agree with each other. It tells you very little about
            where the robot ended up.
          </p>
        </div>
        <MarginNote label="One class each">
          The driver station lists every <code>@Autonomous</code> class it finds
          and builds the one you pick. Four routines, four classes, and nothing
          in <code>Robot.java</code> chooses between them. PathPlanner adds one
          choice inside a routine: which path Follow Path drives.
        </MarginNote>
      </Split>

      <LessonSection id="two-layers" title="Two layers">
        <p>
          The class is the part you cannot test without a driver station. Keep
          everything else out of it. A command that reads a controller, checks
          the match clock, or names a mode has taken on the class&apos;s job.
        </p>
        <FigureGrid
          cols={2}
          items={[
            {
              label: "Lifecycle",
              term: (
                <>
                  The <code>@Autonomous</code> class
                </>
              ),
              body: "The name on the driver station, the Robot handed to its constructor, and the schedule and cancel calls at the mode boundary.",
            },
            {
              label: "Behavior",
              term: "The routine command",
              body: "Which way to drive, for how long, and how it stops. The same command can run from a button or from another routine unchanged.",
            },
          ]}
        />
        <p>
          A command built on the drivetrain requires the drivetrain, so a second
          drivetrain command cannot run beside it. Arm and flywheel commands
          can. That is the same resource rule the scheduler has enforced since
          Workshop 2.
        </p>
      </LessonSection>

      <LessonSection id="build-the-routine" title="Build the routine">
        <p>
          Everything gets built in the constructor, which runs the moment
          somebody picks the mode. The routine lives in a field because{" "}
          <code>end()</code> needs a reference to the command it cancels.
          Building a command sends no output, so the constructor is safe to run
          while the robot is still disabled. <code>start()</code> runs when the
          mode is enabled, and <code>end()</code> runs when it stops for any
          reason, a disable included.
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
          <code>robot.arm.isAtTarget()</code> did on Finish Conditions.{" "}
          <strong>PathPlanner</strong>, the next lesson, replaces the wait with
          a drawn path that knows where it ends.
        </p>
        <p>
          Two names go into this file and they do different jobs. The one in the
          annotation is what the driver station lists, so it is the one a driver
          reads under pressure. The one in <code>.named(...)</code> is what the
          command is called in the scheduler and on the dashboard.
        </p>
        <Split>
          <div className="measure flex flex-col gap-pad [&>p]:m-0 [&>p]:prose-body">
            <p>
              The <code>stopped</code> request is the line people leave out.{" "}
              <code>setControl</code> latches a request: the drivetrain keeps
              applying it until something sends a different one. When a routine
              ends, nothing does. This OpMode sets no default command, so the
              wheels carry on at the last speed they were given.
            </p>
            <p>
              It is sent twice for that reason. The last line of the coroutine
              covers a routine that runs to the end. A cancel stops the
              coroutine where it is and skips that line, so{" "}
              <code>whenCanceled</code> sends the same zero.
            </p>
          </div>
          <MarginNote label="Do the arithmetic">
            One meter per second for a second and a half is about a meter and a
            half, less whatever the ramp-up costs. Battery voltage and carpet
            move that number on every run. The third pass below measures it
            instead of trusting it.
          </MarginNote>
        </Split>
        <p>
          The robot&apos;s field position is never set in this routine.{" "}
          <code>Drivetrain/Pose</code> starts wherever odometry left off.
          Restart the robot code before a measured run and it reads near zero,
          which makes the distance easy to read straight off AdvantageScope.
        </p>
      </LessonSection>

      <LessonSection id="test-in-layers" title="Four test passes">
        <p>
          Each pass answers one question, and each one can fail on its own. Run
          them in order. A routine that fails the second pass has nothing to
          prove in the third.
        </p>
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
            in AdvantageScope should agree within a few centimeters. The three
            runs should land inside about ten.
          </li>
          <li>
            <strong>Disabled partway.</strong> Hit disable about a second into
            the drive. The wheels stop at once. Re-select the mode from the list
            before running again: picking a mode builds the OpMode fresh, and a
            fresh routine with it.
          </li>
        </ol>
        <p>
          A second and a half is a small slice of an autonomous period. A robot
          that sits still for the rest of it has not failed. That is the stop
          doing its job.
        </p>
      </LessonSection>

      <LessonSection id="failure-shapes" title="Three failure shapes">
        <p>
          A routine fails quietly. Nothing throws, nothing logs a complaint, and
          the robot does something you did not ask for. Almost all of it looks
          like one of these three.
        </p>
        <FigureGrid
          cols={3}
          items={[
            {
              label: "Nothing moves",
              term: "Stuck on a wait",
              body: (
                <>
                  Selected, enabled, sitting still. A wait with no time limit
                  holds the routine there forever. Every{" "}
                  <code>coroutine.waitUntil(...)</code> in a routine takes a
                  timeout.
                </>
              ),
            },
            {
              label: "Never stops",
              term: "A latched request",
              body: (
                <>
                  The wait ends and the robot keeps rolling. Nothing zeroes the
                  drivetrain, so the last request stays applied. Send{" "}
                  <code>stopped</code> on every way out.
                </>
              ),
            },
            {
              label: "Wrong place",
              term: "Heading or voltage",
              body: (
                <>
                  It moves, and not where you aimed it. Robot-centric X follows
                  the starting heading, and a tired battery shortens a timed
                  step by a surprising amount.
                </>
              ),
            },
          ]}
        />
        <p>
          A mode missing from the driver station list is a different problem.
          Take it back to <strong>OpModes</strong>: a class that is not{" "}
          <code>public</code>, an annotation with no name, or a constructor that
          does not take <code>Robot</code>.
        </p>
        <p>
          Read <code>Drivetrain/Pose</code> before guessing. Its value at the
          end of a run separates a robot that went the wrong way from one that
          never went anywhere.
        </p>
      </LessonSection>

      <LessonSection id="check-your-work" title="Check your work">
        <p>
          Run the routine three times from the same tape mark, on the floor,
          with AdvantageScope connected. You are done when the three runs land
          on top of each other.
        </p>
        <Box variant="alert-success" title="You should see">
          <ul className="ml-5 list-disc space-y-2">
            <li>
              <strong>Leave Start</strong> on the mode list, and the drive
              beginning the moment you enable.
            </li>
            <li>
              The robot leaving in the direction its front bumper was pointing.
            </li>
            <li>
              A full stop that stays stopped, with no creep after the wait.
            </li>
            <li>
              Three end poses in <code>Drivetrain/Pose</code> within about ten
              centimeters of each other.
            </li>
          </ul>
        </Box>
        <p>
          Write down the distance the tape measured, the end pose, and the wait
          that produced them. PathPlanner replaces that wait with a path drawn
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
              "You delete the setControl(stopped) line after the wait and run Leave Start on blocks. What do the wheels do after 1.5 seconds?",
            options: [
              "They stop, because the command ends when the coroutine returns",
              "They stop, because autonomous sets a default command",
              "They keep turning at 1 m/s, because the last request stays latched and nothing replaces it",
              "They slow down gradually as the battery sags",
            ],
            correctAnswer: 2,
            explanation:
              "The coroutine returns and the command ends, and ending a command sends nothing to the motors. This OpMode sets no default, so nothing claims the drivetrain afterwards. The zero-speed request is what replaces the moving one.",
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
              "end() cancels the routine, and you pick the mode off the list again so a fresh OpMode builds a fresh routine",
            ],
            correctAnswer: 3,
            explanation:
              "end() runs when the mode stops for any reason, and it cancels the routine. The cancel runs whenCanceled, which sends the zero. Picking the mode builds the OpMode fresh, so the next run starts from the first line.",
          },
        ]}
      />
    </PageTemplate>
  );
}
