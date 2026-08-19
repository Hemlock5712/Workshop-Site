import PageTemplate from "@/components/PageTemplate";
import LessonSection from "@/components/lesson/LessonSection";
import FigureGrid from "@/components/lesson/FigureGrid";
import KeyConceptSection from "@/components/KeyConceptSection";
import CodeBlock from "@/components/CodeBlock";
import Box from "@/components/Box";
import { MarginNote, Split } from "@/components/lesson/Prose";

export default function Autonomous() {
  return (
    <PageTemplate
      title="An autonomous routine is one OpMode holding one command"
      emphasis="one OpMode holding one command"
      lede="The OpMode gives the routine a name and a lifecycle. The command describes the work. Keeping those roles separate makes a routine easy to select, test, cancel, and replace."
      needs={[
        <>The calibrated swerve project from this workshop.</>,
        <>
          A route plan and starting pose from <strong>PathPlanner</strong>.
        </>,
        <>The OpMode lifecycle and classic commands from Workshop 2.</>,
      ]}
      time="About 30 minutes"
    >
      <Split>
        <KeyConceptSection
          description={[
            "An @Autonomous class owns one routine command. It builds that command in the constructor, schedules it in start(), and cancels it in end().",
            "Commands own resources. A drivetrain command prevents another drivetrain command from running at the same time, while unrelated mechanism commands may run beside it.",
          ]}
          concept="The OpMode owns when the routine runs. Commands own what the routine does."
        />
        <MarginNote label="LIMITED COMPOSITION">
          This page uses sequence and timeout as a focused autonomous recipe.
          Workshop 5 teaches the larger command-composition model, including
          finish conditions and parallel work.
        </MarginNote>
      </Split>

      <LessonSection id="two-layers" title="Keep the routine in two layers">
        <FigureGrid
          cols={2}
          items={[
            {
              label: "Lifecycle",
              term: "Autonomous OpMode",
              body: "Provides the driver-station name, receives Robot, builds the routine, schedules it once, and guarantees cancellation at the mode boundary.",
            },
            {
              label: "Behavior",
              term: "Commands",
              body: "Drive, wait, or run a mechanism. Commands can be tested independently and composed without adding mode logic to Robot.java.",
            },
          ]}
        />
      </LessonSection>

      <LessonSection
        id="build-a-drive-step"
        title="Make one drivetrain command into a finite step"
      >
        <p>
          The swerve wrapper&apos;s <code>applyRequest</code> command is a hold:
          it keeps sending a CTRE request and does not finish. An autonomous
          step needs a finish line, so the first version uses a short timeout.
        </p>
        <CodeBlock
          language="java"
          title="One finite drive step"
          code={`Command leaveStart =
    robot.drivetrain
        .applyRequest(
            () ->
                new SwerveRequest.RobotCentric()
                    .withVelocityX(1.0)
                    .withVelocityY(0.0)
                    .withRotationalRate(0.0))
        .withTimeout(Seconds.of(1.5));`}
        />
        <Box
          variant="alert-warning"
          tag="FIRST TEST"
          title="A timed step is a smoke test, not accurate navigation"
        >
          <p>
            Battery voltage and carpet change how far a timed velocity request
            travels. Use this only to prove the OpMode and command lifecycle.
            The pose-based controllers in Workshop 4 replace time with a
            measured field target.
          </p>
        </Box>
      </LessonSection>

      <LessonSection
        id="build-the-routine"
        title="Put steps in an ordered routine"
      >
        <p>
          <code>Command.sequence</code> starts the next command only after the
          current command finishes. End with a brief zero-speed request so the
          drivetrain does not keep the last nonzero request after the timed
          step.
        </p>
        <CodeBlock
          language="java"
          title="A minimal autonomous command"
          code={`Command stop =
    robot.drivetrain
        .applyRequest(
            () ->
                new SwerveRequest.RobotCentric()
                    .withVelocityX(0.0)
                    .withVelocityY(0.0)
                    .withRotationalRate(0.0))
        .withTimeout(Seconds.of(0.1));

routine = Command.sequence(leaveStart, stop).named("Leave Start");`}
        />
        <Box variant="concept" title="Every step needs a way to finish">
          <p>
            The sequence waits for the current step. A hold with no timeout,
            sensor condition, or natural completion prevents every later step
            from starting. Workshop 5 turns that rule into reusable patterns.
          </p>
        </Box>
      </LessonSection>

      <LessonSection
        id="autonomous-opmode"
        title="Wrap the routine in an Autonomous OpMode"
      >
        <CodeBlock
          language="java"
          filename="src/main/java/frc/robot/opmodes/LeaveStartAuto.java"
          title="LeaveStartAuto.java — lifecycle and behavior together"
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
          There is no chooser in <code>Robot.java</code>. The driver station
          discovers the annotation, shows <strong>Leave Start</strong>, and the
          framework constructs the selected OpMode.
        </p>
      </LessonSection>

      <LessonSection
        id="test-in-layers"
        title="Test the routine in four passes"
      >
        <ol className="ml-5 list-decimal space-y-3">
          <li>
            <strong>Wheels off the floor:</strong> verify the selected OpMode
            starts and stops the modules.
          </li>
          <li>
            <strong>Open floor, low speed:</strong> confirm positive X moves in
            the intended robot-relative direction.
          </li>
          <li>
            <strong>Repeatability:</strong> run three times from the same mark
            and compare the final pose in the log.
          </li>
          <li>
            <strong>Mode boundary:</strong> disable during the drive and confirm{" "}
            <code>end()</code> cancels the routine immediately.
          </li>
        </ol>
        <p>
          The next workshop replaces this deliberately crude timed movement with
          vision-corrected odometry and commands that finish at measured field
          poses.
        </p>
      </LessonSection>
    </PageTemplate>
  );
}
