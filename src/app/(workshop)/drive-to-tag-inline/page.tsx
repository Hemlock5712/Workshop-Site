import PageTemplate from "@/components/PageTemplate";
import LessonSection from "@/components/lesson/LessonSection";
import CodeBlock from "@/components/CodeBlock";
import Box from "@/components/Box";
import Quiz from "@/components/Quiz";
import { MarginNote, ProseBlock, Split } from "@/components/lesson/Prose";
import Link from "next/link";
import { lessonMetadata } from "@/lib/lessonMetadata";

export const metadata = lessonMetadata("/drive-to-tag-inline");

const linkStyle =
  "text-[var(--accent)] underline hover:no-underline font-medium";

/**
 * A worked example, not a concept lesson. Rewritten October 2026 onto
 * LimelightLib 2, the vendordep `/vision-implementation` installs.
 *
 * The old page read the camera through a copied `LimelightHelpers.java`
 * (`getTV`, `getFiducialID`, `getBotPose3d_TargetSpace`, `setPriorityTagID`),
 * which the vision lesson now tells students to delete. Everything here was
 * read off the `2.0.0-beta9-alpha7` sources jar, not from memory:
 *   new Limelight(name)
 *   camera.hasTarget()          false when NO_DATA or STALE (0.25 s), or no target
 *   camera.getLatestResults().fiducialTargets   FiducialTarget[]
 *   FiducialTarget.fiducialId / .getRobotPose_TargetSpace()
 * Picking the tag out of `fiducialTargets` by ID replaces both the priority-tag
 * override and its cleanup, so the second line of the old "cleanup, twice"
 * block is gone and one `stop(...)` helper serves every exit.
 *
 * TARGET SPACE CHANGED. LimelightLib 2 documents every space as NWU: x out of
 * the tag face, y to the tag's left, z up. The old helper's +X right, +Y down,
 * +Z out convention does not apply, so distance is X, sideways is Y, squareness
 * is yaw about Z, and squared-up is a yaw of pi. The signs are still worth the
 * blocks check: they come from the library's javadoc, not from a robot.
 *
 * THE STOP IS NOT `SwerveRequest.Idle`. Idle "does nothing to the swerve module
 * state" (Phoenix 6 javadoc; the 24.3 Java source returns OK and touches
 * nothing), so the modules keep their last request. The stop is a zero
 * `ChassisVelocities` on the same robot-relative request.
 *
 * No `branch` prop: `7-InlineCommands` still has the copied LimelightHelpers and the old target-space axes.
 * With no embed, the three excerpts together are the whole class except the
 * package line and imports, which are listed in prose.
 */
export default function DriveToTagInline() {
  return (
    <PageTemplate
      title="Example: Drive to Tag"
      lede="Hold X and the robot drives to a meter in front of an AprilTag, squares up to it, and stops. No odometry, no field map: the camera is the only sensor."
      needs={[
        <>
          <strong>Coroutines</strong>: <code>coroutine.yield()</code> and a{" "}
          <code>waitUntil</code> with a time limit.
        </>,
        <>
          <strong>Vision</strong>: the LimelightLib vendordep installed, and
          your camera&apos;s name.
        </>,
        <>
          <strong>Profiled Drive to Point</strong>: trapezoid profiles, PID plus
          feedforward.
        </>,
      ]}
      time="13 minutes"
    >
      <Split>
        <ProseBlock>
          <p>
            One new file, <code>commands/DriveToTagInline.java</code>, and one
            line in <code>TeleopOpMode</code>:{" "}
            <code>
              driver.x().whileTrue(DriveToTagInline.create(robot.drivetrain,
              &quot;limelight&quot;, 1, 1.0))
            </code>
            . The arguments are the drivetrain, the camera&apos;s name, the tag
            ID, and the standoff in meters. Tag 1 is a placeholder.
          </p>
          <p>
            The file imports <code>com.limelightvision.Limelight</code> and{" "}
            <code>FiducialTarget</code> from the same package, plus a static
            import of <code>org.wpilib.units.Units.Seconds</code>. VS Code
            offers the rest as you type.
          </p>
        </ProseBlock>
        <MarginNote label="One block">
          The whole command is one coroutine body: a loop that reads, drives and
          yields, and a stop on every way out of it.
        </MarginNote>
      </Split>

      <LessonSection id="read-where-the-robot-is" title="The tag's frame">
        <p>
          Every other drive command here works in field space, a{" "}
          <code>Pose2d</code> from the blue corner. This one works in target
          space, where the origin is the tag. LimelightLib uses the same axes in
          every space: X points out of the tag&apos;s face, Y to the tag&apos;s
          left, and Z up.
        </p>

        <CodeBlock
          language="java"
          title="DriveToTagInline.java: the pose helper"
          code={`/** The robot's pose in our tag's frame, or null when the camera can't see that tag. */
private static Pose3d readRobotInTag(Limelight camera, int targetTagId) {
  // False when the camera is unplugged, its newest frame is stale, or it sees nothing.
  if (!camera.hasTarget()) {
    return null;
  }
  for (FiducialTarget tag : camera.getLatestResults().fiducialTargets) {
    if (tag.fiducialId == targetTagId) {
      return tag.getRobotPose_TargetSpace();
    }
  }
  return null;
}`}
        />

        <p>
          A frame lists every tag in view, each with its own robot pose. The
          loop picks ours by ID and ignores the rest, so a second tag drifting
          into frame cannot pull the robot toward it. Leave the ID check in.
          Without it the robot drives at whichever tag comes first in the list.
        </p>
        <p>
          <code>hasTarget()</code> matters because the getters never go blank.
          After a camera drops out they keep returning its last frame. Once the
          newest frame is a quarter second old, <code>hasTarget()</code> turns
          false. The helper then stops handing out a pose the robot has already
          driven past.
        </p>
      </LessonSection>

      <LessonSection
        id="build-three-controllers-one-per"
        title="One controller per axis"
      >
        <CodeBlock
          language="java"
          title="DriveToTagInline.java: create(...), the setup"
          code={`public static Command create(
    DriveMechanism drivetrain, String cameraName, int targetTagId, double standoffMeters) {
  Limelight camera = new Limelight(cameraName);

  // One profiled PID per axis: the profile plans a smooth ramp, PID trims the drift.
  // TODO: tune the speed limits and kP on your robot.
  ProfiledPIDController distance =
      new ProfiledPIDController(0.0, 0.0, 0.0, new TrapezoidProfile.Constraints(2.5, 3.0));
  ProfiledPIDController lateral =
      new ProfiledPIDController(0.0, 0.0, 0.0, new TrapezoidProfile.Constraints(2.5, 3.0));
  ProfiledPIDController heading =
      new ProfiledPIDController(
          0.0, 0.0, 0.0, new TrapezoidProfile.Constraints(Math.PI, 2.0 * Math.PI));

  SwerveRequest.ApplyRobotVelocity driveRequest =
      new SwerveRequest.ApplyRobotVelocity()
          .withDriveRequestType(DriveRequestType.OpenLoopVoltage);

  heading.enableContinuousInput(-Math.PI, Math.PI);
  distance.setTolerance(0.03); // meters
  lateral.setTolerance(0.03); // meters
  heading.setTolerance(Math.toRadians(2.0)); // radians`}
        />

        <p>
          Distance, sideways offset and squareness are independent, so each gets
          its own <code>ProfiledPIDController</code>: a trapezoid profile and a
          PID controller in one object. All of them are locals, and the
          coroutine body below closes over them. <code>setTolerance</code> sets
          the band <code>atGoal()</code> reads, which is how the command decides
          it has arrived.
        </p>

        <ul className="ml-5 list-disc space-y-3">
          <li>
            <code>enableContinuousInput</code> goes on the heading controller
            only. Angles wrap, and squared up sits right on the wrap, as the
            next section shows.
          </li>
          <li>
            <code>ApplyRobotVelocity</code>, not <code>ApplyFieldVelocity</code>
            . This command has no idea where the field is. It knows forward and
            left as the robot sees them.
          </li>
        </ul>

        <Split>
          <ProseBlock>
            <p>
              The <code>Limelight</code> made here is a second reader on the
              camera <code>Vision</code> already uses. It is safe. It only looks
              at the newest frame and never touches the queue{" "}
              <code>Vision</code> works through.
            </p>
          </ProseBlock>
          <MarginNote label="Same name">
            The string has to match the one in <code>Vision.registerAll</code>,
            and the name on the camera itself.
          </MarginNote>
        </Split>
      </LessonSection>

      <LessonSection id="the-loop-the-execute-half" title="The loop">
        <CodeBlock
          language="java"
          title="DriveToTagInline.java: create(...), the command"
          code={`  return drivetrain
      .run(
          coroutine -> {
            boolean tracking = false;

            while (true) {
              Pose3d robotInTag = readRobotInTag(camera, targetTagId);

              // No tag in view: stop, then give it a second to appear before giving up.
              if (robotInTag == null) {
                stop(drivetrain, driveRequest);
                tracking = false;
                if (coroutine
                    .waitUntil(() -> readRobotInTag(camera, targetTagId) != null, Seconds.of(1.0))
                    .timedOut()) {
                  return;
                }
                continue;
              }

              // First reading since the tag came into view. Start each profile here, at rest.
              if (!tracking) {
                distance.reset(robotInTag.getX());
                lateral.reset(robotInTag.getY());
                heading.reset(robotInTag.getRotation().getZ());
                tracking = true;
              }

              // Back off to the standoff, slide until centered, turn until square.
              double forward =
                  distance.calculate(robotInTag.getX(), standoffMeters)
                      + distance.getSetpoint().velocity;
              double sideways =
                  lateral.calculate(robotInTag.getY(), 0.0) + lateral.getSetpoint().velocity;
              double turn =
                  heading.calculate(robotInTag.getRotation().getZ(), Math.PI)
                      + heading.getSetpoint().velocity;

              // Facing the tag, the robot's forward is the tag's -X and its left is the tag's -Y.
              drivetrain.setControl(
                  driveRequest.withVelocity(new ChassisVelocities(-forward, -sideways, turn)));

              if (distance.atGoal() && lateral.atGoal() && heading.atGoal()) {
                break;
              }
              coroutine.yield();
            }

            stop(drivetrain, driveRequest);
          })
      .whenCanceled(() -> stop(drivetrain, driveRequest))
      .named("DriveToTagInline");
}`}
        />

        <p>
          With no tag in view the loop stops the robot and waits up to a second
          for one. A tag that never shows up ends the command, stopped, rather
          than leaving a held button doing nothing forever. When a tag does show
          up, <code>tracking</code> is false, so each profile restarts from the
          robot&apos;s real position at rest. Without that, a profile picks up
          its old plan mid-ramp and the robot lurches.
        </p>

        <p>
          Each speed is a plan plus a correction.{" "}
          <code>getSetpoint().velocity</code> is what the profile planned for
          this instant, and <code>calculate(...)</code> adds the PID output on
          top. Centered is zero, and the distance goal is the standoff. Squared
          up means facing the tag, so the robot points back down the tag&apos;s
          X axis. That is a yaw of half a turn, <code>Math.PI</code>, right on
          the wrap the heading controller was told about.
        </p>

        <p>
          The minus signs come from the same fact. The robot faces the tag, so
          its forward and left run opposite to the tag&apos;s X and Y. The{" "}
          <code>break</code> sits after the three <code>calculate(...)</code>{" "}
          calls. Move it above them and you are asking a controller with no
          measurement whether it has arrived.
        </p>

        <Box variant="alert-warning" title="Every gain ships at zero">
          <p>
            All three controllers start with kP, kI and kD at <code>0.0</code>,
            so <code>calculate(...)</code> returns zero and the profile does the
            whole job. That is a safer first run than an untuned gain. Nothing
            corrects error, though: when the profile runs out, 20 cm short stays
            20 cm short.
          </p>
        </Box>
      </LessonSection>

      <LessonSection id="clean-up-twice-the-end" title="A stop on every exit">
        <CodeBlock
          language="java"
          title="DriveToTagInline.java: the stop helper"
          code={`/** Sends zero speed. Ending a command does not do this for you. */
private static void stop(DriveMechanism drivetrain, SwerveRequest.ApplyRobotVelocity request) {
  drivetrain.setControl(request.withVelocity(new ChassisVelocities()));
}`}
        />

        <Split>
          <ProseBlock>
            <p>
              The command can end three ways. It arrives and breaks out of the
              loop. It waits a second for a tag that never comes and returns. Or
              it is canceled, because the driver let go of X. The first two run
              a <code>stop(...)</code> in the body. A canceled body is dropped
              where it stands and runs nothing more, so{" "}
              <code>.whenCanceled(...)</code> calls the same helper.
            </p>
            <p>
              The helper exists because{" "}
              <Link href="/running-program#latched" className={linkStyle}>
                ending a command does not stop a motor
              </Link>
              . In teleop the joystick default would cover for a missing stop.
              Schedule this from an autonomous OpMode, where the drivetrain has
              no default, and the robot keeps rolling at its last speed.
            </p>
          </ProseBlock>
          <MarginNote label="Idle is not a stop">
            <code>SwerveRequest.Idle</code> leaves every module on its last
            request. It is the right thing to send while disabled, and the wrong
            thing to send to stop.
          </MarginNote>
        </Split>
      </LessonSection>

      <LessonSection id="did-it-work" title="Check your work">
        <p>
          There is no camera in simulation, so the helper returns null, the wait
          runs out after a second, and the command ends stopped. That still
          checks the binding and the requirement.
        </p>

        <ol className="ml-5 list-decimal space-y-3">
          <li>
            In simulation, enable Teleop and drive with the left stick, then
            hold X and keep pushing. <strong>{"You should see: "}</strong> the
            robot stops dead. A second later the command ends and the sticks
            work again, X still held.
          </li>
          <li>
            Put the robot on blocks, with a printed tag two meters away. Confirm
            the Limelight web interface reports the right ID before you enable.
          </li>
          <li>
            Enable and hold X. <strong>{"You should see: "}</strong> the wheels
            swing to an angle and spin. Wrong direction means a sign to flip,
            and blocks make that check free.
          </li>
          <li>
            Cover the camera with your hand.{" "}
            <strong>{"You should see: "}</strong> the wheels stop within a few
            loops. Uncover it inside a second and they start again. Leave it
            covered and the command ends.
          </li>
          <li>
            Signs right? On the floor, area clear, hold X.{" "}
            <strong>{"You should see: "}</strong> a ramp, a cruise, a slow-down,
            then a stop a meter out and square to the tag.
          </li>
        </ol>

        <Box variant="alert-warning" title="If it did not work">
          <p>
            <strong>Holding X stops the robot and nothing else.</strong> The
            helper returns null every pass. Either the camera name is wrong, the
            tag ID is wrong, or the camera cannot see the tag. The web interface
            settles which.
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
              "You hold X and the camera never sees tag 1. What does the command do?",
            options: [
              "Drives on the last pose the camera reported before the tag left",
              "Sends zero speed, waits up to a second for the tag, then ends with the robot stopped",
              "Keeps waiting for as long as X is held, with the wheels on their last request",
              "Throws an exception, because readRobotInTag returned null",
            ],
            correctAnswer: 1,
            explanation:
              "The null branch calls stop(...) first, then waitUntil with a one-second limit. When timedOut() comes back true the body returns, and the stop it already sent is still in force. A held button with nothing happening and no end is the failure the time limit exists to prevent.",
          },
          {
            id: 2,
            question:
              "Two tags are in frame, tag 1 and tag 4, and you asked for tag 1. Which pose does readRobotInTag return?",
            options: [
              "Tag 4's, if the camera lists it first",
              "An average of the two",
              "Tag 1's, because the loop matches fiducialId against the ID you passed",
              "Null, because more than one tag is in view",
            ],
            correctAnswer: 2,
            explanation:
              "Each frame carries every tag the camera found, each with its own robot pose in that tag's frame. The loop returns the one whose fiducialId matches and skips the others. Delete that check and the robot drives at whichever tag happens to be first.",
          },
          {
            id: 3,
            question:
              "All three controllers ship with kP, kI and kD set to 0.0. What is driving the robot?",
            options: [
              "Nothing: the command is broken as shipped",
              "The SwerveRequest applies a default speed when the PID output is zero",
              "The setTolerance values act as a minimum speed",
              "The profile's planned velocity, added to each PID output",
            ],
            correctAnswer: 3,
            explanation:
              "Each sum is calculate(...) plus getSetpoint().velocity. With the gains at zero, calculate(...) contributes nothing and the profile does all the driving. That is safe for a first run, but nothing corrects error, so a robot that stops short stays short.",
          },
          {
            id: 4,
            question:
              "Squared up and facing the tag, what yaw does the robot have in the tag's frame?",
            options: [
              "Half a turn, Math.PI, because the robot points back along the tag's X axis",
              "Zero, because square means lined up with the tag",
              "A quarter turn, because the tag faces sideways on the field",
              "It depends on the alliance color",
            ],
            correctAnswer: 0,
            explanation:
              "The tag's X axis points out of its face, toward the robot. A robot facing the tag points the other way, which is half a turn. That puts the goal right on the wrap between -pi and pi, and the heading controller gets enableContinuousInput for exactly that reason.",
          },
          {
            id: 5,
            question:
              "Why does .whenCanceled(...) call stop(...) when the body already ends with one?",
            options: [
              "Because .whenCanceled(...) runs before the loop starts",
              "Because a canceled body is dropped where it stands, so the stop at the bottom never runs",
              "It does not need to: the second call could be deleted",
              "Because the scheduler calls both on every finish",
            ],
            correctAnswer: 1,
            explanation:
              "Breaking out of the loop reaches the stop below it, and the timeout path stops before it returns. Cancellation skips both, because the body is never resumed. Without the hook, an autonomous OpMode that cancels this command leaves the robot rolling on its last request.",
          },
          {
            id: 6,
            question:
              "Someone swaps stop(...) for drivetrain.setControl(new SwerveRequest.Idle()). What happens when the command ends in autonomous?",
            options: [
              "The modules stop and lock in an X",
              "The drive motors switch to brake mode and coast to a halt",
              "Nothing changes, because Idle and zero speed are the same request",
              "The robot keeps rolling, because Idle leaves each module on its last request",
            ],
            correctAnswer: 3,
            explanation:
              "Idle does nothing to the module state. Whatever velocity was last sent stays in force. In teleop the joystick default hides this by sending zero a loop later. Autonomous has no default command, so only a real zero-speed request stops the robot.",
          },
        ]}
      />
    </PageTemplate>
  );
}
