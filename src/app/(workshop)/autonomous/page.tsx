import PageTemplate from "@/components/PageTemplate";
import LessonSection from "@/components/lesson/LessonSection";
import FigureGrid from "@/components/lesson/FigureGrid";
import CodeBlock from "@/components/CodeBlock";
import Box from "@/components/Box";
import { MarginNote, Split } from "@/components/lesson/Prose";

export default function Autonomous() {
  return (
    <PageTemplate
      title="Autonomous"
      lede="One autonomous routine is one class holding one command. The class puts a name on the driver station and owns the mode boundary. The command does the driving, and the one you build here leaves the starting line and stops."
      needs={[
        <>
          A swerve robot you can drive, with a pose you trust, from{" "}
          <strong>Swerve Calibration</strong>.
        </>,
        <>
          A route plan and a starting pose from <strong>PathPlanner</strong>.
        </>,
        <>
          <code>Command.sequence</code> and <code>.withTimeout</code>, from{" "}
          <strong>Command Composition</strong>.
        </>,
        <>Three meters of clear floor and one person on the disable switch.</>,
      ]}
      time="About 30 minutes"
    >
      <Split>
        <div className="measure flex flex-col gap-pad [&>p]:m-0 [&>p]:prose-body">
          <p>
            Nothing here is new syntax. Command Composition gave you{" "}
            <code>Command.sequence</code>. Finish Conditions gave you the rule
            that every step needs an ending. This lesson puts both inside an
            OpMode and drives a real robot with them.
          </p>
          <p>
            The routine is a timed drive, and it is crude on purpose. A timed
            step tells you whether the mode list, the scheduler, and the
            drivetrain agree with each other. It tells you very little about
            where the robot ended up.
          </p>
        </div>
        <MarginNote label="No chooser">
          The driver station lists every <code>@Autonomous</code> class it finds
          and builds the one you pick. Four routines, four classes. There is no{" "}
          <code>SendableChooser</code> anywhere in this project.
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
          The PathPlanner plan does not become code yet. Its published Java
          examples target Commands v2, and pasting them into this project will
          not compile. What carries over is the geometry: where the robot
          starts, which way the first segment runs, and roughly how far.
        </p>
        <p>
          Everything gets built in the constructor, which runs the moment
          somebody picks the mode. The routine lives in a field because{" "}
          <code>end()</code> needs a reference to the command it cancels.
          Building a command sends no output, so the constructor is safe to run
          while the robot is still disabled.
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
    Command drive =
        robot.drivetrain
            .applyRequest(
                () ->
                    new SwerveRequest.RobotCentric()
                        .withVelocityX(1.0)
                        .withVelocityY(0.0)
                        .withRotationalRate(0.0))
            .withTimeout(Seconds.of(1.5));

    Command stop =
        robot.drivetrain
            .applyRequest(() -> new SwerveRequest.RobotCentric())
            .withTimeout(Seconds.of(0.1));

    routine = Command.sequence(drive, stop).named("Leave Start");
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
          A timeout is the only finish line available here.{" "}
          <code>DriveMechanism</code> reports its pose, but nothing on it
          answers <em>am I there yet</em> the way <code>arm.isAtTarget()</code>{" "}
          did on Finish Conditions. Workshop 4 adds a command that measures
          against a field pose and finishes when it arrives.
        </p>
        <p>
          Two names go into this file and they do different jobs. The one in the
          annotation is what the driver station lists, so it is the one a driver
          reads under pressure. The one in <code>.named(...)</code> is what the
          command is called in the log.
        </p>
        <Split>
          <div className="measure flex flex-col gap-pad [&>p]:m-0 [&>p]:prose-body">
            <p>
              The second step is the one people leave out.{" "}
              <code>setControl</code> latches a request: the drivetrain keeps
              applying it until something sends a different one. When a routine
              ends, nothing does. The mechanism falls back to{" "}
              <code>idle()</code>, which sends nothing at all, and the wheels
              carry on at the last speed they were given.
            </p>
            <p>
              In teleop the joystick default covers that. It is set in{" "}
              <code>TeleopOpMode</code>, and bindings belong to the mode that
              made them, so no such default exists in this class. A zero-speed
              step is what stops the robot.
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
          The robot&apos;s field position is never set in this project, so the
          starting pose you wrote down in PathPlanner appears nowhere in the
          code. <code>Drivetrain/Pose</code> starts wherever odometry left off.
          Restart the robot code before a measured run and it reads near zero,
          which makes the distance easy to read straight off the log.
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
            time. The taped distance and the end of <code>Drivetrain/Pose</code>{" "}
            in the log should agree within a few centimeters. The three runs
            should land inside about ten.
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
          step doing its job.
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
              term: "Stuck on a step",
              body: (
                <>
                  Selected, enabled, sitting still. A step with no ending holds
                  the sequence there forever. Look for a request with no{" "}
                  <code>.withTimeout(...)</code> on it.
                </>
              ),
            },
            {
              label: "Never stops",
              term: "A latched request",
              body: (
                <>
                  The timeout expires and the robot keeps rolling. Nothing
                  zeroes the drivetrain, so the last request stays applied. The
                  zero-speed step is the fix.
                </>
              ),
            },
            {
              label: "Wrong place",
              term: "Heading or voltage",
              body: (
                <>
                  It moves, and not where you drew it. Robot-centric X follows
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
          Read the log before guessing. <code>Drivetrain/Pose</code> at the end
          of a run separates a robot that went the wrong way from one that never
          went anywhere.
        </p>
      </LessonSection>

      <LessonSection id="check-your-work" title="Check your work">
        <p>
          Run the routine three times from the same tape mark, on the floor,
          with logging on. You are done when the three runs land on top of each
          other.
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
              A full stop that stays stopped, with no creep after the timeout.
            </li>
            <li>
              Three end poses in <code>Drivetrain/Pose</code> within about ten
              centimeters of each other.
            </li>
          </ul>
        </Box>
        <p>
          Write down the distance the tape measured, the end pose out of the
          log, and the timeout that produced them. Workshop 4 replaces that
          timeout with a field pose the command can steer to. These three
          numbers are what you will hold the new routine against.
        </p>
        <p>
          A second routine is a second file. Copy this one, change the
          annotation name and the numbers, and it turns up on the list beside
          the first. Nothing registers it, and nothing in{" "}
          <code>Robot.java</code> chooses between the two.
        </p>
      </LessonSection>
    </PageTemplate>
  );
}
