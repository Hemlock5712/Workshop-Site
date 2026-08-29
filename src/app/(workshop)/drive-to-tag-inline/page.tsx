import PageTemplate from "@/components/PageTemplate";
import LessonSection from "@/components/lesson/LessonSection";
import CodeBlock from "@/components/CodeBlock";
import Box from "@/components/Box";
import Quiz from "@/components/Quiz";
import { MarginNote, ProseBlock, Split } from "@/components/lesson/Prose";

/**
 * A worked example, not a concept lesson. Show the finished file, stop on the
 * four decisions worth stopping on, end.
 *
 * The previous version ran 40.6 minutes across fourteen sections, with twelve
 * code embeds and ten asides. Most of it re-taught lessons that already exist:
 * coroutine bodies, the ClassicCommand lifecycle, ProfiledPIDController, the
 * WPILib source behind atGoal(), and a seven-bullet diff against the robot
 * template. This page is optional and last, so the cuts came out of commentary
 * and duplicated excerpts rather than out of the check or the safety.
 *
 * The source archaeology behind atGoal() stays cut; the placement rule it was
 * arguing for does not. It is one sentence in "The loop", because a student who
 * moves the finish check above the calculate(...) calls gets a command that
 * ends on its first pass and nothing on the page would have warned them.
 *
 * Kept, because a student needs it: target space and the three visibility
 * guards, why the ID check stays, kP shipping at 0.0 and what that costs, the
 * cleanup written twice and the autonomous failure it prevents, the sign check
 * on blocks, the bench procedure, and the failure modes.
 *
 * The `create(...)` excerpt went. It was twenty lines of constructor holding
 * three teaching points, and those three are prose and two bullets now. The
 * live embed at the top of the page still shows the code itself.
 */
export default function DriveToTagInline() {
  return (
    <PageTemplate
      title="Example: Drive to Tag"
      lede="Hold X and the robot drives to a meter in front of an AprilTag, squares up to it, and stops. No odometry, no field map: the camera is the only sensor."
      needs={[
        <>
          <strong>Coroutines</strong>: <code>coroutine.yield()</code> and what a
          coroutine body is.
        </>,
        <>
          <strong>Vision</strong>: the Limelight, AprilTags, and{" "}
          <code>LimelightHelpers</code>.
        </>,
        <>
          <strong>Profiled Drive to Point</strong>: trapezoid profiles, PID plus
          feedforward.
        </>,
      ]}
      branch="7-InlineCommands"
      time="12 minutes"
    >
      <Split>
        <ProseBlock>
          <p>
            The branch adds one file,{" "}
            <code>commands/DriveToTagInline.java</code>, and four lines in{" "}
            <code>opmodes/TeleopOpMode.java</code>. Nothing else changes.
          </p>
          <p>
            The binding is one line:{" "}
            <code>
              driver.x().whileTrue(DriveToTagInline.create(drivetrain,
              &quot;limelight&quot;, 1, 1.0))
            </code>
            . The arguments are the drivetrain, the camera&apos;s NetworkTables
            name, the tag ID, and the standoff in meters. Tag 1 is a
            placeholder.
          </p>
        </ProseBlock>
        <MarginNote label="One block">
          Four phases, one block: setup above the loop, the loop body, a{" "}
          <code>break</code>, cleanup below.
        </MarginNote>
      </Split>

      <LessonSection id="read-where-the-robot-is" title="The tag's frame">
        <p>
          Every other drive command here works in field space, a{" "}
          <code>Pose2d</code> from the blue corner. This one works in target
          space, where the origin is the tag. No odometry needed.
        </p>

        <CodeBlock
          language="java"
          title="DriveToTagInline.java: the pose helper"
          code={`/**
 * The robot's pose in the tag's frame, or null when the camera isn't looking at our tag.
 *
 * <p>Limelight target space: +X is the tag's right, +Y is down, +Z points out of the tag face. So
 * distance is Z, sideways is X, squareness is the rotation about Y. TODO: verify the signs on
 * hardware.
 */
private static Pose3d readRobotInTag(String limelightName, int targetTagId) {
  // Also false when the camera is unplugged.
  if (!LimelightHelpers.getTV(limelightName)) {
    return null;
  }
  if ((int) LimelightHelpers.getFiducialID(limelightName) != targetTagId) {
    return null;
  }
  Pose3d pose = LimelightHelpers.getBotPose3d_TargetSpace(limelightName);
  // All zeros means no target-space data yet.
  return pose.equals(Pose3d.kZero) ? null : pose;
}`}
        />

        <p>
          Three checks, and any one failing means there is no usable reading.
          The ID and the pose are published separately, so some frames carry the
          right ID and a pose of all zeros. Driving on those would mean driving
          at a tag underneath the robot.
        </p>

        <p>
          Do not delete the ID check. The camera reports one tag at a time, and
          without it the robot drives at whichever tag becomes primary. No
          error, no warning.
        </p>
      </LessonSection>

      <LessonSection
        id="build-three-controllers-one-per"
        title="One controller per axis"
      >
        <p>
          Distance, sideways offset, and squareness are independent, so each
          gets its own <code>ProfiledPIDController</code>. That class is new
          here: a trapezoid profile and a PID controller in one object. All
          three are locals in <code>create(...)</code>, and the coroutine body
          closes over them.
        </p>

        <p>
          The tolerances are 3 cm and 2 degrees. <code>setTolerance</code> sets
          the band <code>atGoal()</code> reads, which is how the command decides
          it has arrived.
        </p>

        <ul
          className="ml-5 list-disc space-y-3"
          style={{ color: "var(--tx2)" }}
        >
          <li>
            <code>enableContinuousInput</code> goes on the heading controller
            only. Angles wrap. Without it, a controller sent from{" "}
            <code>+3.0</code> rad to <code>-3.0</code> rad takes the long way
            round instead of the 0.28 rad shortcut.
          </li>
          <li>
            <code>ApplyRobotVelocity</code>, not <code>ApplyFieldVelocity</code>
            . This command has no idea where the field is. It knows forward and
            left as the robot sees them.
          </li>
        </ul>
      </LessonSection>

      <LessonSection id="the-loop-the-execute-half" title="The loop">
        <p>
          Above the loop, <code>setPriorityTagID</code> pins the camera to our
          tag. Then <code>reset(...)</code> plants each profile at the current
          measurement, so the first pass ramps instead of lurching. Everything
          below runs once per robot loop.
        </p>

        <p>
          When the helper returns null, the loop sends{" "}
          <code>new SwerveRequest.Idle()</code>, yields, and looks again. It
          does not guess and it does not give up. That is why the loop is{" "}
          <code>while (true)</code> with a <code>break</code> in the middle: the
          finish condition is not always answerable.
        </p>

        <CodeBlock
          language="java"
          title="DriveToTagInline.java: three numbers, three speeds"
          code={`  // Which number is which is explained on readRobotInTag below.
  double measuredDistance = robotInTag.getZ();
  double measuredLateral = robotInTag.getX();
  double measuredYaw = robotInTag.getRotation().getY();

  // Back off to the standoff, slide until centered, turn until square.
  double forward =
      distance.calculate(measuredDistance, standoffMeters)
          + distance.getSetpoint().velocity;
  double sideways =
      lateral.calculate(measuredLateral, 0.0) + lateral.getSetpoint().velocity;
  double turn = heading.calculate(measuredYaw, 0.0) + heading.getSetpoint().velocity;

  // TODO: if the robot slides or turns the wrong way, flip that value's sign.
  drivetrain.setControl(
      driveRequest.withVelocity(new ChassisVelocities(forward, sideways, turn)));`}
        />

        <p>
          Each speed is a plan plus a correction.{" "}
          <code>getSetpoint().velocity</code> is what the profile planned for
          this instant; <code>calculate(...)</code> is the PID output on top.
          Two of the goals are zero, because centered and square are both zero
          in the tag&apos;s frame. The third is the standoff, since zero
          distance is inside the tag.
        </p>

        <p>
          The <code>break</code> sits after those three{" "}
          <code>calculate(...)</code> calls, on{" "}
          <code>
            distance.atGoal() &amp;&amp; lateral.atGoal() &amp;&amp;
            heading.atGoal()
          </code>
          . Move it above them and you are asking a controller with no
          measurement whether it has arrived.
        </p>

        <Box variant="alert-warning" title="Every gain ships at zero">
          <p>
            All three controllers are built with kP, kI and kD at{" "}
            <code>0.0</code>, so <code>calculate(...)</code> returns zero and
            the profile does the whole job. That is a safer first run than an
            untuned gain.
          </p>
          <p className="mt-3">
            Nothing corrects error, though. When the profile runs out the robot
            stops wherever it is, and 20 cm short stays 20 cm short.{" "}
            <code>DriveToPoint.java</code>, in the same folder, says which way
            to move kP.
          </p>
        </Box>
      </LessonSection>

      <LessonSection id="clean-up-twice-the-end" title="Cleanup, twice">
        <CodeBlock
          language="java"
          title="DriveToTagInline.java: the two exits"
          code={`          // Cleanup, on a normal finish.
          drivetrain.setControl(new SwerveRequest.Idle());
          LimelightHelpers.setPriorityTagID(limelightName, -1); // -1 = no priority
        })
    // Being interrupted skips the cleanup above, so repeat it here.
    .whenCanceled(
        () -> {
          drivetrain.setControl(new SwerveRequest.Idle());
          LimelightHelpers.setPriorityTagID(limelightName, -1);
        })
    .named("DriveToTagInline");`}
        />

        <Split>
          <ProseBlock>
            <p>
              Breaking out of the loop falls through to the two lines below it.
              Cancellation does not. The body is dropped where it stands, so{" "}
              <code>.whenCanceled(...)</code> repeats both lines.
            </p>
          </ProseBlock>
          <MarginNote label="Order matters">
            <code>drivetrain.run(...)</code> hands back a builder.{" "}
            <code>.named(...)</code> turns it into a command, so nothing can
            attach after it.
          </MarginNote>
        </Split>

        <Box variant="alert-danger" title="Do not lean on the default command">
          <p>
            In teleop, deleting <code>.whenCanceled(...)</code> looks harmless.
            Let go of X, the joystick default command reclaims the drivetrain,
            and the robot stops. That is the default command, not your cleanup.
          </p>
          <p className="mt-3">
            Now schedule the same command from an autonomous OpMode, where the
            drivetrain has no default command. The last velocity request stays
            in force and the robot keeps rolling.
          </p>
        </Box>
      </LessonSection>

      <LessonSection id="did-it-work" title="Check your work">
        <p>
          There is no camera in simulation, so the helper returns null every
          pass and the command idles forever. That is the correct result, and it
          still checks the binding, the requirements, and the guard clause.
        </p>

        <ol
          className="ml-5 list-decimal space-y-3"
          style={{ color: "var(--tx2)" }}
        >
          <li>
            Run <strong>WPILib: Hardware Sim Robot Code</strong> and Enable.
            Drive with the left stick, then hold X and keep pushing.{" "}
            <strong>{"You should see: "}</strong> the robot stops dead and the
            sticks do nothing. Release X and they work again.
          </li>
          <li>
            Put the robot on blocks, with a printed tag two meters away. Confirm
            the Limelight dashboard reports the right ID before you enable.
          </li>
          <li>
            Enable and hold X. <strong>{"You should see: "}</strong> the wheels
            swing to an angle and spin. Wrong direction means a sign to flip,
            and blocks make that check free.
          </li>
          <li>
            Cover the camera with your hand.{" "}
            <strong>{"You should see: "}</strong> the wheels stop within a loop
            or two, and start again when you uncover it.
          </li>
          <li>
            Signs right? On the floor, area clear, hold X.{" "}
            <strong>{"You should see: "}</strong> a ramp, a cruise, a slow-down,
            then a stop a meter out and square to the tag.
          </li>
        </ol>

        <Box variant="alert-warning" title="If it did not work">
          <p>
            <strong>Holding X does nothing, ever.</strong> The helper is
            returning null every pass. Check the dashboard: either the camera
            name in the binding is wrong, or the tag ID is, or the camera cannot
            see the tag. The name has to match what <code>Robot.java</code>{" "}
            passes to <code>Limelight.registerAll(...)</code>, and the name on
            the camera.
          </p>
          <p className="mt-3">
            <strong>It drives away, slides sideways, or spins.</strong> That is
            a sign. Negate the one value that matches what the robot did, and
            only that one.
          </p>
          <p className="mt-3">
            <strong>It stops short and never ends.</strong> The profile finished
            and there is no kP to close the last gap, so the measurement stays
            outside the 3 cm tolerance. Give <code>distance</code> and{" "}
            <code>lateral</code> a small kP.
          </p>
        </Box>
      </LessonSection>

      <Quiz
        questions={[
          {
            id: 1,
            question:
              "In a coroutine body, which part corresponds to a ClassicCommand's initialize()?",
            options: [
              "The first pass through the while loop",
              "The code in create(...) that builds the controllers",
              "Everything written above the while loop, inside the coroutine body",
              "The .whenCanceled(...) block",
            ],
            correctAnswer: 2,
            explanation:
              "Everything between the opening of the coroutine body and the while loop runs once, when the command is scheduled. The controllers built in create(...) are earlier still: create(...) runs when the command object is made, which for a button binding is when the OpMode constructor runs.",
          },
          {
            id: 2,
            question:
              "Why does this command work in the tag's frame instead of field space?",
            options: [
              "Target space is more accurate than a field pose",
              "So it needs no odometry: it only has to know where it sits relative to the tag",
              "Because the Limelight cannot publish a field pose",
              "Because ApplyRobotVelocity requires a Pose3d",
            ],
            correctAnswer: 1,
            explanation:
              "The origin is the tag, so centered and square are both zero and the goals are easy to state. Nothing in the command needs a field map, a pose estimate, or an odometry reading.",
          },
          {
            id: 3,
            question:
              "All three controllers ship with kP, kI and kD set to 0.0. What is driving the robot?",
            options: [
              "The profile's planned velocity, added to each PID output as a feedforward term",
              "Nothing: the command is broken as shipped",
              "The SwerveRequest applies a default speed when the PID output is zero",
              "The setTolerance values act as a minimum speed",
            ],
            correctAnswer: 0,
            explanation:
              "Each sum is calculate(...) + getSetpoint().velocity. With the gains at zero, calculate(...) contributes nothing and the profile does all the driving. That is safe for a first run, but nothing corrects error, so a robot that stops short stays short.",
          },
          {
            id: 4,
            question:
              "The camera loses the tag halfway through a run. Then what?",
            options: [
              "The command ends, and the default command takes over",
              "It keeps driving on the last reading until the tag comes back",
              "atGoal() returns true, so the loop breaks",
              "It sends SwerveRequest.Idle, yields, and looks for the tag again next loop",
            ],
            correctAnswer: 3,
            explanation:
              "The guard clause stops the drivetrain and returns to the top of the loop. That is why the loop is written as while (true) with a break in the middle: with no reading, the finish condition cannot be answered at all.",
          },
          {
            id: 5,
            question:
              "Why does the cleanup appear twice, once after the loop and once in .whenCanceled(...)?",
            options: [
              "It is a mistake in the branch; one copy could be deleted",
              "Because a canceled coroutine is dropped mid-loop, so the lines after the loop never run",
              "Because .whenCanceled(...) runs before the loop, not after",
              "Because the scheduler calls both on every finish",
            ],
            correctAnswer: 1,
            explanation:
              "Breaking out of the loop falls through to the cleanup below it. Being interrupted does not: the body is dropped where it stands. .whenCanceled(...) is the only hook that covers that path, which a ClassicCommand handles with a single end(boolean interrupted).",
          },
          {
            id: 6,
            question:
              "The loop breaks once all three controllers report atGoal(). Why does that check sit after the three calculate(...) calls?",
            options: [
              "Because calculate(...) is what hands a controller its measurement, and a controller with no measurement cannot answer",
              "Because atGoal() throws an exception if it is called before calculate(...)",
              "Because a break has to be the last statement in a while loop",
              "Because the guard clause resets all three controllers on every pass",
            ],
            correctAnswer: 0,
            explanation:
              "atGoal() is a question about the controller, not about the robot. Ask it above the calculate(...) calls and you are asking a controller that has been handed nothing whether it has arrived. The guard clause resets nothing: reset(...) runs once, above the loop.",
          },
        ]}
      />
    </PageTemplate>
  );
}
