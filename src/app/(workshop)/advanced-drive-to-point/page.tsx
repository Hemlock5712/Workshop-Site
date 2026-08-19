import PageTemplate from "@/components/PageTemplate";
import LessonSection from "@/components/lesson/LessonSection";
import FigureGrid from "@/components/lesson/FigureGrid";
import CodeBlock from "@/components/CodeBlock";
import Box from "@/components/Box";
import DocumentationButton from "@/components/DocumentationButton";
import GitHubContent from "@/components/GitHubContent";
import Quiz from "@/components/Quiz";
import { MarginNote, ProseBlock, Split } from "@/components/lesson/Prose";
import { GitBranch } from "lucide-react";

/**
 * Five sections against the old eight, four excerpts and one embed against
 * twelve code blocks. The same shape as `/drive-to-point`, because this page is
 * a diff on top of that one: show the finished file, and excerpt only what a
 * student cannot get by reading it.
 *
 * The old page walked seven numbered steps, each closing on a "Visible result"
 * that was usually "nothing yet, and the robot is worse for it". Gone with
 * them: the `5-DriveToPoint` `execute()` reprint (the student has that file
 * open), the imports block, the rename before/after, the one-line feedforward
 * block, the unchanged `TeleopOpMode` bindings, the before/after gains table
 * (four sentences of prose), the `WheelForceCalculator` aside for a class the
 * workshop does not use, and the alpha stamp.
 *
 * Kept, because they are the lesson: the two pairs of constraints, the
 * arithmetic that makes 2.1 m the threshold between a trapezoid and a triangle,
 * the `startState` snapshot, `execute()`, the clock finish line and what it
 * costs, and why 10 / 10 / 7 had to become 3.0 / 3.0 / 4.0 once the plan
 * started supplying the speed.
 *
 * Every number and API name here was checked against `6-ProfiledToPoint`.
 */
export default function ProfiledDriveToPoint() {
  return (
    <PageTemplate
      title="Profiled Drive to Point"
      lede="Drive to Point turns distance into speed. Three meters out it asks for 30 m/s, and at the goal it asks for almost nothing. This version plans the whole trip before the robot moves, then follows the plan."
      needs={[
        <>
          <strong>Drive to Point</strong>. This lesson edits that one file.
        </>,
        <>
          <strong>Swerve Calibration</strong>. The goal is an absolute field
          pose.
        </>,
        <>
          <strong>Logging</strong>. Two of the checks below are graphs.
        </>,
      ]}
      branch="6-ProfiledToPoint"
      time="20 minutes"
    >
      <Split>
        <ProseBlock>
          <p>
            One file changes: <code>commands/DriveToPoint.java</code>, 87 lines
            to 120. A and B are already bound from the last lesson, and nothing
            else on the branch moves.
          </p>
        </ProseBlock>
        <MarginNote label="One rename">
          The field <code>targetPose</code> becomes <code>goal</code>. The plan
          has a start and a goal now, so <code>target</code> was ambiguous.
          Rename the parameter, the assignment, and the javadoc line with it.
        </MarginNote>
      </Split>

      <LessonSection id="the-trip-planner" title="The trip planner">
        <p>
          Phoenix 6 ships a straight-line trip planner called{" "}
          <code>LinearPath</code>. You hand it two pairs of limits, one for
          driving and one for turning, then ask it the same question every loop.
          At <em>t</em> seconds into the trip, where should the robot be, and
          how fast should it be going?
        </p>

        <p>
          The answer is a <code>LinearPath.State</code>, holding a{" "}
          <code>pose</code> and a <code>velocity</code>. The pose is what PID
          measures against. The velocity is the feedforward: the speed the plan
          says the robot should be doing right now.
        </p>

        <p>
          Plot that planned speed against time and you get a trapezoid, which is
          where <code>TrapezoidProfile</code> gets its name. The branch drives
          at 2.5 m/s with 3.0 m/s² of acceleration.
        </p>

        <FigureGrid
          items={[
            {
              label: "Phase 1",
              term: "Speed up",
              body: (
                <>
                  Gain 3.0 m/s of speed every second. Reaching 2.5 m/s takes
                  about <strong>0.83 s</strong> and covers about{" "}
                  <strong>1.04 m</strong>.
                </>
              ),
            },
            {
              label: "Phase 2",
              term: "Cruise",
              body: "Hold 2.5 m/s for whatever distance is left in the middle. A short trip has no middle.",
            },
            {
              label: "Phase 3",
              term: "Slow down",
              body: "Shed 3.0 m/s every second, timed to arrive at the goal with a planned speed of zero.",
            },
          ]}
        />

        <p>
          Speeding up and slowing down each need about 1.04 m, so a trip shorter
          than <strong>2.1 m</strong> never reaches 2.5 m/s. Those come out as a
          triangle: speed up, then straight into slowing down. No special case
          to write.
        </p>
      </LessonSection>

      <LessonSection id="make-the-change" title="Make the change">
        <p>
          Three new fields and three rewritten methods, all in the one file.
          Three imports come with them: <code>com.ctre.phoenix6.Utils</code>,{" "}
          <code>com.ctre.phoenix6.swerve.utility.LinearPath</code>, and{" "}
          <code>org.wpilib.math.trajectory.TrapezoidProfile</code>.
        </p>

        <CodeBlock
          language="java"
          title="DriveToPoint.java: a new field, next to the controllers"
          code={`// The trip planner. First pair of limits: top speed (m/s) and acceleration (m/s²) for
// driving. Second pair: the same for turning (rad/s, rad/s²).
// TODO: tune to what your drivetrain can do.
private final LinearPath path =
    new LinearPath(
        new TrapezoidProfile.Constraints(2.5, 3.0),
        new TrapezoidProfile.Constraints(Math.PI, 2.0 * Math.PI));`}
        />

        <p>
          <code>Math.PI</code> is half a turn in radians, so the turning limits
          read as half a turn per second, and one full turn per second squared.
        </p>

        <p>
          The plan is built once, from where the robot was and how fast it was
          moving when the button went down. That snapshot and a clock reading
          are the other two fields.
        </p>

        <CodeBlock
          language="java"
          title="DriveToPoint.java: two new fields, and initialize()"
          code={`// Where the robot was, and how fast it was moving, when the command started. The whole
// trip is planned from this one snapshot.
private LinearPath.State startState = new LinearPath.State();
// When the command started. (now - startTime) says how far into the trip we are.
private double startTime;

/** Takes the starting snapshot and starts the trip clock. */
@Override
protected void initialize() {
  startState = new LinearPath.State(drivetrain.getPose(), drivetrain.getFieldVelocity());
  startTime = Utils.getCurrentTimeSeconds();
  xController.reset();
  yController.reset();
  headingController.reset();
}`}
        />

        <p>
          A robot already rolling gets a plan that starts from the speed it has,
          not from a standstill. That is what <code>getFieldVelocity()</code> is
          doing there.
        </p>
      </LessonSection>

      <LessonSection id="the-control-loop" title="The new control loop">
        <CodeBlock
          language="java"
          title="DriveToPoint.java: execute()"
          code={`/** Runs every robot loop while the command is active. */
@Override
protected void execute() {
  // Ask the plan where we should be, this many seconds into the trip.
  double t = Utils.getCurrentTimeSeconds() - startTime;
  LinearPath.State setpoint = path.calculate(t, startState, goal);

  Pose2d measuredPose = drivetrain.getPose();

  // The plan's velocity does the driving. Each PID call below adds a small correction that
  // pulls the measured pose back onto the planned pose.
  ChassisVelocities feedforward = setpoint.velocity;
  double vx = feedforward.vx + xController.calculate(measuredPose.getX(), setpoint.pose.getX());
  double vy = feedforward.vy + yController.calculate(measuredPose.getY(), setpoint.pose.getY());
  double omega =
      feedforward.omega
          + headingController.calculate(
              measuredPose.getRotation().getRadians(), setpoint.pose.getRotation().getRadians());

  drivetrain.setControl(driveRequest.withVelocity(new ChassisVelocities(vx, vy, omega)));
}`}
        />

        <p>
          The planned velocity goes out as it is. Each controller adds a small
          correction on top, pulling the measured pose back onto the planned
          pose. On a perfect floor every correction would be zero and the plan
          would drive the trip alone.
        </p>

        <p>
          The finish line is the plan&apos;s own clock.{" "}
          <code>isFinished()</code> returns <code>path.isFinished(t)</code>,
          with <em>t</em> the seconds since the command started. No position
          tolerance anywhere.
        </p>

        <Box
          variant="alert-warning"
          tag="WATCH OUT · FINISH"
          title="A clock, not a tape measure"
        >
          <p>
            <code>path.isFinished(t)</code> asks whether the plan is over, not
            whether the robot arrived. Fall behind the plan and the command
            still ends on schedule, wherever the robot happens to be. That is
            the trade for a finish line that cannot hang.
          </p>
        </Box>

        <p>
          The finished file, 120 lines. The <strong>GitHub Changes</strong> tab
          is PR #12: 59 lines added, 26 removed.
        </p>

        <GitHubContent
          repository="Hemlock5712/Workshop-Code"
          filePath="src/main/java/frc/robot/commands/DriveToPoint.java"
          branch="6-ProfiledToPoint"
          pr={{ number: 12, focusFile: "DriveToPoint.java" }}
        />
      </LessonSection>

      <LessonSection id="the-gains" title="Lower the gains">
        <p>
          On <code>5-DriveToPoint</code>, PID output was the whole commanded
          velocity, and the error it measured was the distance to the goal.
          Meters of error, for most of the trip. A kP of 10 paid for that.
        </p>

        <p>
          Now the error is the gap between the measured pose and{" "}
          <code>setpoint.pose</code>, and that stays in centimeters the whole
          way. X and Y come down to 3.0, heading to 4.0.
        </p>

        <p>
          Leave them at 10 and the correction piles onto a plan that was already
          asking for the right speed. Ten centimeters of drift buys another
          meter per second. The robot hunts around the path instead of settling
          onto it.
        </p>

        <Box
          variant="alert-warning"
          tag="NOTE · UNTUNED"
          title="Starting points, not answers"
        >
          <p>
            Nobody measured these gains or these limits for your robot. Raise kP
            if the robot lags the plan or stops short of the goal. Lower it, or
            add a little kD, if the robot wobbles.
          </p>
          <p className="mt-3">
            The 2.5 m/s cruise is a little over half the{" "}
            <code>kSpeedAt12Volts = 4.54</code> m/s in{" "}
            <code>TunerConstants.java</code>. That headroom is where the
            correction goes. On real hardware, run it in clear space with a hand
            on the disable.
          </p>
        </Box>
      </LessonSection>

      <LessonSection id="check-your-work" title="Check your work">
        <ol
          className="ml-5 list-decimal space-y-3"
          style={{ color: "var(--tx2)" }}
        >
          <li>
            Enable Teleop in the simulator and hold <strong>B</strong>. The
            robot eases away, holds a steady speed, and eases off at the end.
            From the origin that goal is 3.6 m out, past the 2.1 m needed for
            cruise.
          </li>
          <li>
            Keep holding <strong>B</strong> after it arrives. The robot stays
            stopped, because the command finished on its own. On{" "}
            <code>5-DriveToPoint</code> it would still be pushing.
          </li>
          <li>
            Graph <code>Drivetrain/TranslationSpeedMps</code> for that run. A
            ramp up, a flat top near 2.5, a ramp down to zero. The flat top is
            the proof the plan is in charge.
          </li>
          <li>
            Hold <strong>A</strong> until the robot stops, sending it back to{" "}
            <code>Pose2d.kZero</code>. The speed graph shows the same trapezoid
            the other way, and <code>Drivetrain/Pose</code> settles near zero.
            It turns toward 0° while it drives rather than spinning first.
          </li>
        </ol>

        <p>
          <strong>It lunges off in the wrong direction.</strong> The{" "}
          <code>startState</code> line is missing from <code>initialize()</code>
          , so the plan is drawn from the empty{" "}
          <code>new LinearPath.State()</code> the field was given at
          declaration.
        </p>

        <p>
          <strong>It weaves along the path.</strong> The gains are still 10 / 10
          / 7. If they are already at 3.0 and 4.0, lower kP further or add a
          little kD.
        </p>

        <p>
          <strong>It stops short of the goal.</strong> Graph the speed again. A
          trace that never reaches the flat top means the limits are past what
          the drivetrain can do, so lower 2.5 and 3.0. A trace that does reach
          it means the gains are too small.
        </p>

        <p>
          A command with an ending is a step, and{" "}
          <code>Command.sequence(...)</code> takes steps.{" "}
          <strong>Dynamic Path Planning</strong> uses this one as the final
          approach, after a planner handles the trip across open field.
        </p>

        <DocumentationButton
          href="https://github.com/Hemlock5712/Workshop-Code/pull/12"
          title="PR #12: Update Drive to point to use profiled PID"
          icon={<GitBranch className="w-5 h-5" />}
        />
      </LessonSection>

      <Quiz
        questions={[
          {
            id: 1,
            question:
              "6-ProfiledToPoint drops the PID gains from 10 / 10 / 7 to 3.0 / 3.0 / 4.0. Why?",
            options: [
              "PID no longer produces the driving velocity: it corrects the small gap between the plan and the measured pose",
              "LinearPath requires gains below 5.0",
              "The lower gains make the robot reach the goal faster",
              "Smaller gains are always safer, whatever the controller is doing",
            ],
            correctAnswer: 0,
            explanation:
              "On 5-DriveToPoint, PID output was the commanded velocity, so it needed a big gain to move the robot at all. Now setpoint.velocity does the driving and PID trims centimeters of drift. Leaving the gains at 10 stacks a large correction on a plan that was already correct, and the robot hunts.",
          },
          {
            id: 2,
            question:
              "What does path.calculate(t, startState, goal) hand back each loop?",
            options: [
              "The forces each swerve module should apply",
              "The distance remaining to the goal",
              "A LinearPath.State: the pose the robot should be at right now, and the velocity it should be moving at",
              "A finished Command you can bind to a button",
            ],
            correctAnswer: 2,
            explanation:
              "It returns a LinearPath.State with two parts. setpoint.pose is where the plan says you should be at time t, and it becomes the PID target. setpoint.velocity is how fast, and it becomes the feedforward.",
          },
          {
            id: 3,
            question:
              "The driving limits are TrapezoidProfile.Constraints(2.5, 3.0). What do those two numbers mean?",
            options: [
              "2.5 seconds to accelerate, 3.0 seconds to decelerate",
              "A top speed of 2.5 m/s and an acceleration limit of 3.0 m/s²",
              "kP of 2.5 and kD of 3.0",
              "2.5 meters of travel at 3.0 volts",
            ],
            correctAnswer: 1,
            explanation:
              "The first pair sets cruise speed to 2.5 m/s and acceleration to 3.0 m/s². The second pair sets the turning limits to Math.PI rad/s and 2.0 * Math.PI rad/s². The branch marks all four TODO: tune.",
          },
          {
            id: 4,
            question: "How does isFinished() decide the command is done?",
            options: [
              "It never finishes, so the driver releases the button",
              "It waits for all three PID controllers to report atSetpoint()",
              "It checks whether the measured pose is within a tolerance of the goal",
              "It returns path.isFinished(elapsed): the planned trip time is up",
            ],
            correctAnswer: 3,
            explanation:
              "It is a clock check, not a distance check, so no position tolerance is needed. The trade: if the robot fell behind the plan, the command still ends on schedule, wherever the robot actually is.",
          },
          {
            id: 5,
            question:
              "Why can this version sit inside Command.sequence(...) when the 5-DriveToPoint version could not?",
            options: [
              "Because it requires the drivetrain and the old one did not",
              "Because it extends ClassicCommand and the old one did not",
              "Because it finishes on its own, and the old isFinished() returned false forever",
              "Because Command.sequence only accepts commands that use feedforward",
            ],
            correctAnswer: 2,
            explanation:
              "Nothing may wait on a command that never ends. The old version ran until interrupted, so it would hang a sequence on its first leg. A real finish line makes the command usable in routines and as the final approach after dynamic planning.",
          },
        ]}
      />
    </PageTemplate>
  );
}
