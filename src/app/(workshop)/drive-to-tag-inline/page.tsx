import PageTemplate from "@/components/PageTemplate";
import LessonSection from "@/components/lesson/LessonSection";
import KeyConceptSection from "@/components/KeyConceptSection";
import CodeBlock from "@/components/CodeBlock";
import Box from "@/components/Box";
import CollapsibleSection from "@/components/CollapsibleSection";
import DocumentationButton from "@/components/DocumentationButton";
import GitHubContent from "@/components/GitHubContent";
import Quiz from "@/components/Quiz";
import { MarginNote, ProseBlock, Split } from "@/components/lesson/Prose";
import { GitBranch } from "lucide-react";

export default function DriveToTagInline() {
  return (
    <PageTemplate
      title="Drive at a tag using nothing but the camera"
      emphasis="nothing but the camera"
      lede="This command drives the robot to a spot in front of an AprilTag using nothing but the camera. No odometry, no field map, no pose estimate. It reads where the robot sits relative to the tag, works out three speeds, sends them to the drivetrain, and does it again next loop."
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
          feedforward, and <code>TrapezoidProfile.Constraints</code>.
        </>,
      ]}
      branch="7-InlineCommands"
      time="Roughly an hour to read and understand"
    >
      <Split>
        <KeyConceptSection
          title="One loop, one file, the whole job"
          description={[
            "All of that lives in one coroutine body: a single while loop inside a single file. That is the style the branch name is pointing at, and it is the last thing this course teaches.",
            "The branch adds one file, commands/DriveToTagInline.java, 136 lines of it, and four lines in opmodes/TeleopOpMode.java. Nothing else changes.",
          ]}
          concept="A coroutine body is a whole command lifecycle written top to bottom: setup, loop, finish, cleanup."
        />
        <MarginNote label="WHAT YOU'LL BUILD">
          Hold X and the robot drives to one meter in front of AprilTag 1,
          squares up to it, and stops. Reading it and understanding it is the
          quick part; tuning it on a real robot takes longer.
        </MarginNote>
      </Split>

      <Box variant="alert-warning" tag="READ FIRST">
        <p>
          Everything else here builds one idea at a time. This page puts six of
          them in one file and expects you to already know five. If any of the
          list above is unfamiliar, go back to that lesson first: this page will
          not re-teach it.
        </p>
        <p className="mt-3">
          The branch name reads like an introduction to writing commands. It is
          not. There is nothing beginner about <code>7-InlineCommands</code>:
          &quot;inline&quot; here means the whole feature is written inline, in
          one block, instead of being split across four lifecycle methods. It is
          the advanced dialect, and it sits at the end of the course for that
          reason.
        </p>
      </Box>

      {/* ── the shape ────────────────────────────────────────────────── */}
      <LessonSection
        id="the-shape-a-lifecycle-written-top"
        title="The shape: a lifecycle written top to bottom"
      >
        <p className="prose-body measure">
          On Drive to Point you wrote a <code>ClassicCommand</code> with four
          separate methods. This command does the same four things, but they are
          four <em>places in one block of code</em> instead of four methods.
          Read the skeleton before the real file: the whole page hangs off it.
        </p>

        <CodeBlock
          language="java"
          title="The shape of DriveToTagInline.create(...)"
          code={`return drivetrain
    .run(
        (Coroutine coroutine) -> {
          // 1. INITIALIZE — runs once, when the command is scheduled.

          while (true) {
            // 2. EXECUTE — runs once per robot loop.

            if (/* we are there */) {
              break; // 3. IS FINISHED — leaving the loop ends the command.
            }
            coroutine.yield(); // give the robot back until the next loop
          }

          // 4. END — runs once, after a normal finish.
        })
    // 5. And this runs instead, when something interrupts the command.
    .whenCanceled(() -> { /* the same cleanup */ })
    .named("DriveToTagInline");`}
        />

        <Box variant="concept" title="The two styles are the same thing">
          <p>
            This is not an analogy. <code>ClassicCommand</code>, the class you
            extended for <code>DriveToPoint</code>, is <em>implemented</em> as
            exactly that loop. Here is its whole <code>run</code> method,
            straight off the branch:
          </p>
          <div className="mt-3">
            <CodeBlock
              language="java"
              hideControls
              code={`@Override
public final void run(Coroutine coroutine) {
  initialize();
  while (true) {
    execute();
    if (isFinished()) {
      break;
    }
    coroutine.yield();
  }
  end(false); // natural finish
}`}
            />
          </div>
          <p className="mt-3">
            So when you write a <code>ClassicCommand</code>, this loop is
            written for you and your four methods get called from inside it.
            When you write a coroutine body, you write the loop yourself. Same
            machinery, different amount of ceremony.
          </p>
        </Box>

        <p className="prose-body measure">
          Neither style is the right one. Four methods keep the phases apart and
          force you to name them. One body keeps the variables in scope and lets
          you read the routine as a story. The three PID controllers here would
          each need to be a field in the classic style; in the coroutine body
          they are plain locals in the enclosing method.
        </p>
      </LessonSection>

      {/* ── step 1 ───────────────────────────────────────────────────── */}
      <LessonSection
        id="check-out-the-branch-and"
        title="Check out the branch and find the file"
      >
        <CodeBlock
          language="bash"
          title="Terminal"
          code={`git fetch origin
git checkout 7-InlineCommands
gradlew build`}
        />

        <p className="prose-body measure">
          <strong>{"You should see: "}</strong> the build succeeds, and{" "}
          <code>src/main/java/frc/robot/commands/</code> now holds two files:{" "}
          <code>DriveToPoint.java</code> from the last lesson and{" "}
          <code>DriveToTagInline.java</code>, which is new. Nothing else on the
          branch changed except four lines of{" "}
          <code>opmodes/TeleopOpMode.java</code>.
        </p>
      </LessonSection>

      {/* ── step 2 ───────────────────────────────────────────────────── */}
      <LessonSection
        id="read-where-the-robot-is"
        title="Read where the robot is, in the tag's frame"
      >
        <p className="prose-body measure">
          Every other drive command you have written works in{" "}
          <strong>field space</strong>: a <code>Pose2d</code> measured from the
          blue corner. This one works in <strong>target space</strong>, which
          means the origin is the tag itself and everything is measured from
          there. That is what lets it work with no odometry at all: it never
          needs to know where it is on the field, only where it is relative to
          the thing it is driving at.
        </p>

        <CodeBlock
          language="java"
          title="DriveToTagInline.java: the private helper at the bottom of the file"
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

        <p className="prose-body measure">
          Three checks, and any one of them failing means &quot;I do not have a
          usable reading.&quot; The camera has to see something (
          <code>getTV</code>), the thing it sees has to be <em>our</em> tag (
          <code>getFiducialID</code>), and the target-space numbers have to have
          arrived. That last one matters more than it looks: the tag ID and the
          pose are published separately, so there are frames where the camera
          knows which tag it is looking at but has not filled in where the robot
          is. <code>Pose3d.kZero</code> is what that looks like, all zeros, and
          driving on all zeros would mean driving at a tag that is exactly under
          the robot.
        </p>

        <Box
          variant="alert-warning"
          tag="DON'T"
          title="Do not delete the ID check"
        >
          <p>
            The camera reports one tag at a time. Without the{" "}
            <code>getFiducialID</code> check, the moment a different tag became
            the camera&apos;s primary target the robot would start driving at
            that one instead, with no warning and no error. The branch&apos;s
            own comment says it plainly: don&apos;t remove it.
          </p>
        </Box>
      </LessonSection>

      {/* ── step 3 ───────────────────────────────────────────────────── */}
      <LessonSection
        id="build-three-controllers-one-per"
        title="Build three controllers, one per direction"
      >
        <p className="prose-body measure">
          The robot has three things to get right at once: how far it is from
          the tag, how far off to the side, and how square it is facing. Those
          are independent, so each gets its own{" "}
          <code>ProfiledPIDController</code>. This code sits in{" "}
          <code>create(...)</code>, <em>outside</em> the coroutine body.
        </p>

        <Box
          variant="alert-info"
          tag="NEW HERE"
          title="You have not used ProfiledPIDController before"
        >
          <p>
            Profiled Drive to Point looked different. There, one CTRE{" "}
            <code>LinearPath</code> planned the entire trip up front, and three
            plain <code>PIDController</code>s: kP of <code>3.0</code>,{" "}
            <code>3.0</code> and <code>4.0</code>: trimmed the robot back onto
            that plan.
          </p>
          <p className="mt-3">
            A <code>ProfiledPIDController</code> folds the two together: each
            one carries its own trapezoid profile <em>and</em> its own PID. So{" "}
            <code>getSetpoint()</code>, <code>atGoal()</code>,{" "}
            <code>setTolerance</code> and <code>enableContinuousInput</code> are
            all new to you on this page. Read the bullets below slowly.
          </p>
        </Box>

        <CodeBlock
          language="java"
          title="DriveToTagInline.java: inside create(...), before the return"
          code={`public static Command create(
    DriveMechanism drivetrain, String limelightName, int targetTagId, double standoffMeters) {
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

        <ul
          className="ml-5 list-disc space-y-3"
          style={{ color: "var(--tx2)" }}
        >
          <li>
            <strong>
              The constraints are the same numbers as Drive to Point:
            </strong>{" "}
            <code>2.5</code> m/s and <code>3.0</code> m/s² for the two
            translation axes, <code>Math.PI</code> rad/s and{" "}
            <code>2.0 * Math.PI</code> rad/s² for turning. Half a turn per
            second, reaching that in half a second.
          </li>
          <li>
            <strong>
              <code>enableContinuousInput(-Math.PI, Math.PI)</code> is only on
              the heading controller.
            </strong>{" "}
            Angles wrap. Without this, a controller told to go from{" "}
            <code>+3.0</code> rad to <code>-3.0</code> rad takes the long way
            round, nearly a full turn, instead of the 0.28 rad shortcut across
            the wrap. Distance and sideways do not wrap, so they do not get it.
          </li>
          <li>
            <strong>The tolerances are 3 cm and 2 degrees.</strong>{" "}
            <code>setTolerance</code> sets the error band that{" "}
            <code>atGoal()</code> checks later, which is how this command
            decides it has arrived. Loosen it and the robot stops visibly short;
            tighten it and it can sit there never quite satisfied.
          </li>
          <li>
            <strong>
              <code>ApplyRobotVelocity</code>, not{" "}
              <code>ApplyFieldVelocity</code>.
            </strong>{" "}
            <code>DriveToPoint</code> used the field-relative request because it
            drove to a field pose. This command has no idea where the field is.
            It only knows &quot;forward&quot; and &quot;left&quot; as the robot
            sees them.
          </li>
        </ul>

        <Split>
          <ProseBlock>
            <p>
              All four of those are local variables in a static method: not
              fields, and that is on purpose. The coroutine body below is a
              lambda that closes over them, so they stay alive as long as the
              command does.
            </p>
          </ProseBlock>
          <MarginNote label="ONE SET PER COMMAND">
            Because <code>create(...)</code> runs once per call, every command
            you build gets its own fresh set of controllers.
          </MarginNote>
        </Split>
      </LessonSection>

      {/* ── step 4 ───────────────────────────────────────────────────── */}
      <LessonSection
        id="seed-the-profiles-the-initialize"
        title={
          <>
            4. Seed the profiles: the <code>initialize</code> half
          </>
        }
        outlineLabel="Seed the profiles: the initialize half"
      >
        <CodeBlock
          language="java"
          title="DriveToTagInline.java: the top of the coroutine body"
          code={`return drivetrain
    .run(
        (Coroutine coroutine) -> {
          // Setup. Inside the body, so it re-runs every time the command is scheduled.
          LimelightHelpers.setPriorityTagID(limelightName, targetTagId);

          // Start the profiles from where we are, so we don't lurch. Skipped if no tag yet.
          Pose3d robotInTag = readRobotInTag(limelightName, targetTagId);
          if (robotInTag != null) {
            distance.reset(robotInTag.getZ());
            lateral.reset(robotInTag.getX());
            heading.reset(robotInTag.getRotation().getY());
          }`}
        />

        <p className="prose-body measure">
          Two jobs here, and both of them have to happen{" "}
          <em>inside the lambda</em> rather than up in <code>create(...)</code>.
          The command gets built once, when the OpMode constructor runs, but it
          gets <em>scheduled</em> every time you press X. Setup that belongs to
          a run has to live where a run can reach it.
        </p>

        <ul
          className="ml-5 list-disc space-y-3"
          style={{ color: "var(--tx2)" }}
        >
          <li>
            <code>setPriorityTagID</code> tells the camera which tag matters, so
            the target-space pose it publishes is measured against ours and not
            whichever tag happens to be biggest in frame.
          </li>
          <li>
            <code>reset(...)</code> on a <code>ProfiledPIDController</code>{" "}
            plants the profile&apos;s starting point at the current measurement.
            Skip it and the profile starts from wherever the last run left off,
            which is the difference between a smooth ramp away from a standstill
            and a lurch.
          </li>
        </ul>

        <Split>
          <ProseBlock>
            <p>
              Both of those sit behind a null check, because no tag in frame at
              the moment you press X is a normal thing to happen.
            </p>
          </ProseBlock>
          <MarginNote label="WHY THE NULL CHECK">
            If the camera cannot see the tag when you press X there is nothing
            to seed from, so the seeding is skipped entirely. That is fine: the
            loop below refuses to drive without a reading anyway, and the first
            loop that gets one will still start from a sensible place.
          </MarginNote>
        </Split>
      </LessonSection>

      {/* ── step 5 ───────────────────────────────────────────────────── */}
      <LessonSection
        id="the-loop-the-execute-half"
        title={
          <>
            5. The loop: the <code>execute</code> half
          </>
        }
        outlineLabel="The loop: the execute half"
      >
        <p className="prose-body measure">
          Everything from here to the <code>break</code> runs once per robot
          loop, about fifty times a second. The <code>coroutine.yield()</code>{" "}
          at the bottom is what makes that true: it suspends the body, hands
          control back to the scheduler, and resumes on the next tick at the
          exact line after the yield.
        </p>

        <CodeBlock
          language="java"
          title="DriveToTagInline.java: the guard clause"
          code={`// One pass per robot loop.
while (true) {
  robotInTag = readRobotInTag(limelightName, targetTagId);

  // No tag in sight - hold still and look again next loop.
  if (robotInTag == null) {
    drivetrain.setControl(new SwerveRequest.Idle());
    coroutine.yield();
    continue;
  }`}
        />

        <p className="prose-body measure">
          When there is no usable reading the command does not give up and it
          does not guess. It stops driving, yields, and looks again. That is why
          the loop is <code>while (true)</code> with a <code>break</code> in the
          middle rather than <code>while (!atGoal)</code>: the condition it
          needs is not always answerable.
        </p>

        <Box
          variant="alert-warning"
          tag="NAME COLLISION"
          title="SwerveRequest.Idle() is not Mechanism.idle()"
        >
          <p>
            You have met <code>idle()</code> before as the Commands v3 fallback
            that issues no output at all. <code>new SwerveRequest.Idle()</code>{" "}
            is a different thing with a confusingly similar name: a CTRE control
            request, sent through <code>setControl</code>, that replaces
            whatever velocity request the previous loop applied. This command
            sends it deliberately, every loop it cannot see the tag.
          </p>
        </Box>

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

        <p className="prose-body measure">
          Each line is the same <em>shape</em> of sum as Profiled Drive to Point
          , plan plus correction, but the plan now lives inside each controller
          rather than in one <code>LinearPath</code> off to the side.{" "}
          <code>calculate(measurement, goal)</code> steps that controller&apos;s
          profile forward and returns the PID correction;{" "}
          <code>getSetpoint().velocity</code> is the speed the profile{" "}
          <em>planned</em> for this instant. Add them and the plan does the
          driving while the PID nudges.
        </p>

        <p className="prose-body measure">
          Two of the three goals are <code>0.0</code>, because &quot;centered on
          the tag&quot; and &quot;square to the tag&quot; are both zero in the
          tag&apos;s own frame. The distance goal is <code>standoffMeters</code>
          , the fourth argument to <code>create(...)</code>: you do not want to
          drive to zero distance, because zero distance is inside the tag.
        </p>
      </LessonSection>

      {/* ── the fiddly parts ─────────────────────────────────────────── */}
      <LessonSection
        id="three-things-about-this-code-that"
        title="Three awkward parts of this code"
      >
        <p className="prose-body measure">
          These are not rough edges to skip past. They are the reason this page
          is last.
        </p>

        <Box
          variant="alert-warning"
          tag="AWKWARD · 1"
          title="Every kP ships at 0.0, and the robot still moves"
        >
          <p>
            All three controllers are built as{" "}
            <code>new ProfiledPIDController(0.0, 0.0, 0.0, ...)</code>. No P, no
            I, no D. So <code>calculate(...)</code> returns zero every time, and
            the only thing in each sum that is not zero is{" "}
            <code>getSetpoint().velocity</code>: the profile&apos;s planned
            speed.
          </p>
          <p className="mt-3">
            That is deliberate. The profile alone will get the robot most of the
            way there, and a command that drives open-loop off a plan is far
            safer to switch on for the first time than one with an untuned gain
            in it. The file leaves you a one-line TODO above the controllers:{" "}
            <code>tune the speed limits and kP on your robot</code>: and no more
            than that.
          </p>
          <p className="mt-3">
            Which direction to move kP is written down in{" "}
            <code>DriveToPoint.java</code>, in the same folder, which you read
            last lesson: &quot;Raise kP if the robot lags the plan or stops
            short of the goal. Lower it (or add kD) if the robot wobbles.&quot;
            The three controllers here are doing the same job as that
            file&apos;s three, so the same advice applies.
          </p>
          <p className="mt-3">
            The trap: with kP at zero there is <em>nothing</em> correcting
            error. When the profile finishes, the feedforward goes to zero and
            the robot stops wherever it happens to be. If that is 20 cm short,
            the command does not notice and does not recover.
          </p>
        </Box>

        <Box
          variant="alert-warning"
          tag="AWKWARD · 2"
          title="The finish check only means anything after a calculate()"
        >
          <p>
            The finish check has to sit where it sits: after the guard clause,
            and after all three <code>calculate(...)</code> calls.
          </p>
          <div className="mt-3">
            <CodeBlock
              language="java"
              hideControls
              code={`  // A fresh controller claims to be at its goal, so the null check above matters.
  if (distance.atGoal() && lateral.atGoal() && heading.atGoal()) {
    break;
  }
  coroutine.yield();
}`}
            />
          </div>
          <p className="mt-3">
            <code>atGoal()</code> is not a question about the robot. It is a
            question about the <em>controller</em>, and a controller that has
            not been given a measurement cannot answer it. In WPILib&apos;s
            source, <code>atGoal()</code> is{" "}
            <code>atSetpoint() &amp;&amp; goal.equals(setpoint)</code>, and{" "}
            <code>atSetpoint()</code> starts with two flags:{" "}
            <code>m_haveMeasurement</code> and <code>m_haveSetpoint</code>: that
            are only set inside <code>calculate(...)</code>. Worse for us,{" "}
            <code>reset(...)</code> clears <code>m_haveMeasurement</code> again,
            and <code>reset(...)</code> is exactly what the seeding step does.
          </p>
          <p className="mt-3">
            So on the loop where the tag first appears, the three{" "}
            <code>calculate(...)</code> calls above are what make the check
            answerable at all. Move it up above the guard and you are asking a
            controller that has never seen a number whether it has arrived.
          </p>
        </Box>

        <Split>
          <ProseBlock>
            <p>
              The comment on that line, &quot;a fresh controller claims to be at
              its goal&quot;, is what the author believed, and the same claim
              appears in the robot template. Go and read{" "}
              <code>ProfiledPIDController</code> and it does not hold: the{" "}
              <code>m_haveMeasurement</code> guard means a fresh controller
              reports <strong>false</strong>, not true. The placement is still
              right and the check is still correct. Only the stated reason is
              wrong.
            </p>
          </ProseBlock>
          <MarginNote label="READING CODE CRITICALLY">
            This one is worth doing yourself at least once, because it is the
            whole skill: when a comment and the library disagree, the library is
            what runs.
          </MarginNote>
        </Split>

        <Box
          variant="alert-warning"
          tag="AWKWARD · 3"
          title="Nobody can tell you the signs from here"
        >
          <p>
            The three numbers come out of the camera in the tag&apos;s frame (+X
            to the tag&apos;s right, +Y down, +Z out of the tag face) and go
            straight into <code>ChassisVelocities</code> as robot-relative
            forward, sideways and turn. Whether &quot;+Z bigger&quot; should
            mean &quot;drive forward&quot; or &quot;drive backward&quot; depends
            on which way the camera is bolted to the robot, and the file cannot
            know that. Both the working code and the helper&apos;s javadoc carry
            a TODO about it.
          </p>
          <p className="mt-3">
            So expect to flip a sign the first time you run this, and expect to
            do it on a robot up on blocks. Change one axis at a time and write
            down which one you changed.
          </p>
          <p className="mt-3">
            Related: treating tag-frame numbers as robot-frame numbers is only
            exactly right when the robot is square to the tag. It is close
            enough when you start roughly lined up, and the heading controller
            is driving toward square the whole time. Start badly off-angle and
            the approach will curve. The template&apos;s version of this file
            adds a rotation step for that case: see the comparison at the bottom
            of this page.
          </p>
        </Box>
      </LessonSection>

      {/* ── step 6 ───────────────────────────────────────────────────── */}
      <LessonSection
        id="clean-up-twice-the-end"
        title={
          <>
            6. Clean up twice: the <code>end</code> half
          </>
        }
        outlineLabel="Clean up twice: the end half"
      >
        <CodeBlock
          language="java"
          title="DriveToTagInline.java: after the loop, and the cancel hook"
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
              The same two lines appear twice, and that duplication is the price
              of the coroutine style. A <code>ClassicCommand</code> has one{" "}
              <code>end(boolean interrupted)</code> that runs either way. A
              coroutine body does not: if the scheduler cancels the command, the
              body is dropped mid-loop and the lines after the loop never
              execute. <code>.whenCanceled(...)</code> is the hook that covers
              that case.
            </p>
          </ProseBlock>
          <MarginNote label="AND IN THAT ORDER">
            <code>drivetrain.run(...)</code> hands back a builder, not a
            finished <code>Command</code>. <code>.whenCanceled(...)</code> is a
            builder method and <code>.named(&quot;...&quot;)</code> is the
            terminal that turns the builder into a command, so once you have
            called <code>.named(...)</code> there is nothing left to attach to.
            The order in the file is the only order that compiles.
          </MarginNote>
        </Split>

        <Box
          variant="alert-danger"
          tag="THE FAILURE THIS PREVENTS"
          title="Do not count on a default command being there"
        >
          <p>
            Delete <code>.whenCanceled(...)</code> and, in teleop on this
            branch, nothing obvious breaks. Let go of X, the coroutine is
            dropped, and the drivetrain&apos;s default joystick command reclaims
            it and sends a fresh field-centric request every loop with
            deadbanded sticks. The robot stops. That is the default command
            doing it, not your cleanup.
          </p>
          <p className="mt-3">
            Now schedule the same command from an autonomous OpMode. This branch
            has no <code>@Autonomous</code> class yet, and the joystick default
            command is set in the <code>TeleopOpMode</code> constructor, so it
            only exists in teleop. Cancel the command anywhere the drivetrain
            has no default command and the last velocity request stays in force
            with nothing to replace it. Write the command so it stops itself and
            it behaves the same in every mode.
          </p>
          <p className="mt-3">
            The second line is quieter. Skip it and the priority tag ID stays
            set to 1 after the command ends, so the camera&apos;s targeting
            outputs: <code>tv</code>, <code>tid</code>, and the target-space
            pose: stay pinned to that tag until something sets it again. The
            botpose estimates your <code>Limelight</code> subsystem feeds to
            odometry are computed from every visible tag and are not affected,
            and nothing else on this branch reads the targeting outputs. Call
            this one hygiene: leave it in so the next command that does read
            them gets a clean camera.
          </p>
        </Box>
      </LessonSection>

      {/* ── step 7 ───────────────────────────────────────────────────── */}
      <LessonSection id="7-bind-it-to-a-button" title="7. Bind it to a button">
        <p className="prose-body measure">
          Four lines in <code>TeleopOpMode</code>, next to the two{" "}
          <code>DriveToPoint</code> bindings from the last lesson.
        </p>

        <CodeBlock
          language="java"
          title="opmodes/TeleopOpMode.java: in the constructor"
          code={`// Hold A or B to drive straight to a fixed spot on the field. Let go to stop.
driver.a().whileTrue(new DriveToPoint(drivetrain, Pose2d.kZero));
driver
    .b()
    .whileTrue(new DriveToPoint(drivetrain, new Pose2d(3, 2, Rotation2d.fromDegrees(180))));

// Hold X to drive a metre in front of a tag, camera only. TODO: use a real tag ID.
driver.x().whileTrue(DriveToTagInline.create(drivetrain, "limelight", 1, 1.0));`}
        />

        <p className="prose-body measure">
          The four arguments are the drivetrain, the camera&apos;s NetworkTables
          name, the tag ID, and the standoff in meters. The camera name{" "}
          <code>&quot;limelight&quot;</code> has to match what{" "}
          <code>Robot.java</code> passes to{" "}
          <code>Limelight.registerAll(drivetrain, &quot;limelight&quot;)</code>,
          and both have to match the name set on the camera itself. Tag ID{" "}
          <code>1</code> is a placeholder: the branch says so in the comment.
        </p>

        <p className="prose-body measure">
          <code>whileTrue</code> is the right binding even though this command
          finishes on its own. It gives the driver a way out: let go of X and
          the command is canceled, <code>.whenCanceled(...)</code> stops the
          robot, and the joystick default command takes the drivetrain back.
        </p>
      </LessonSection>

      {/* ── the whole file ───────────────────────────────────────────── */}
      <LessonSection id="the-whole-file" title="The whole file">
        <p className="prose-body measure">
          136 lines, and you have now read all of them in pieces. Read it once
          more end to end: the point of this style is that it reads as one
          story, and you cannot see that in fragments.
        </p>

        <GitHubContent
          repository="Hemlock5712/Workshop-Code"
          filePath="src/main/java/frc/robot/commands/DriveToTagInline.java"
          branch="7-InlineCommands"
        />
      </LessonSection>

      {/* ── did it work ──────────────────────────────────────────────── */}
      <LessonSection id="did-it-work" title="Did it work?">
        <Box
          variant="alert-info"
          tag="READ THIS FIRST"
          title="There is no camera in the simulator"
        >
          <p>
            <code>Robot.java</code> says it outright:{" "}
            <code>Limelight.registerAll(...)</code> &quot;does nothing in
            simulation (no camera there).&quot; So in sim{" "}
            <code>getTV(&quot;limelight&quot;)</code> is false,{" "}
            <code>readRobotInTag</code> returns null every loop, and the command
            idles forever. That is the correct result, not a bug, and it still
            proves something worth checking.
          </p>
        </Box>

        <p className="prose-body measure">
          <strong>In the simulator</strong>, with no hardware:
        </p>

        <ol
          className="ml-5 list-decimal space-y-3"
          style={{ color: "var(--tx2)" }}
        >
          <li>
            Run <code>gradlew simulateJava</code> and Enable, the same way as
            every other swerve lesson.
          </li>
          <li>
            Drive with the left stick. <strong>{"You should see: "}</strong> the
            robot moves, because the default joystick command owns the
            drivetrain.
          </li>
          <li>
            Hold X and keep pushing the stick.{" "}
            <strong>{"You should see: "}</strong> the robot stops dead and the
            sticks do nothing. <code>DriveToTagInline</code> requires the
            drivetrain, so scheduling it interrupts the default command, and the
            guard clause is sending <code>Idle</code> every loop.
          </li>
          <li>
            Keep holding X for ten seconds.{" "}
            <strong>{"You should see: "}</strong> nothing at all happen, and no
            error. The command is looking for a tag and there is no camera to
            find one with. Correct.
          </li>
          <li>
            Release X. <strong>{"You should see: "}</strong> the sticks work
            again immediately, because the default command reclaims the
            drivetrain.
          </li>
        </ol>

        <p className="prose-body measure">
          That sequence tests the plumbing, requirements, the binding,
          cancellation, the guard clause, which is most of what goes wrong. The
          driving itself needs the real thing.
        </p>

        <p className="prose-body measure">
          <strong>On the robot</strong>, up on blocks first, with a printed
          AprilTag on a stand about two meters away and the number on it
          matching the ID in your binding:
        </p>

        <ol
          className="ml-5 list-decimal space-y-3"
          style={{ color: "var(--tx2)" }}
        >
          <li>
            Open the Limelight web dashboard and confirm it is seeing the tag
            before you touch anything. <strong>{"You should see: "}</strong> the
            tag outlined in the video feed and the right ID reported.
          </li>
          <li>
            Enable, hold X. <strong>{"You should see: "}</strong> the wheels
            turn to an angle and start driving. On blocks, watch the wheel{" "}
            <em>directions</em>: that is your sign check, and it is free.
          </li>
          <li>
            Cover the camera with your hand while holding X.{" "}
            <strong>{"You should see: "}</strong> the wheels stop within a loop
            or two. Uncover it and they start again. That is the guard clause
            working.
          </li>
          <li>
            Wheels turning the right way? Put it on the floor, clear the area,
            and try it for real. <strong>{"You should see: "}</strong> a smooth
            ramp up, a cruise, and a slow-down as the profile runs out: then the
            robot stops and the command ends.
          </li>
          <li>
            Measure the gap. <strong>{"You should see: "}</strong> roughly one
            meter from the tag, within a few centimeters, and the robot square
            to the tag rather than at an angle.
          </li>
        </ol>

        <Box
          variant="alert-warning"
          tag="IF IT DIDN'T WORK"
          title="X does nothing, the robot goes the wrong way, or it never lets go"
        >
          <ul className="ml-4 list-disc space-y-3">
            <li>
              <strong>
                On the robot, holding X does nothing: no motion, no error, ever.
              </strong>{" "}
              <code>readRobotInTag</code> is returning null on every loop, and
              there are three reasons it can. The camera name in your binding
              does not match the camera&apos;s actual NetworkTables name. Or the
              tag ID does not match the tag in front of you: the binding ships
              with <code>1</code> as a placeholder. Or the camera cannot see the
              tag. Check the Limelight dashboard before you change any code; it
              tells you which of the three it is.
            </li>
            <li>
              <strong>
                The robot drives away from the tag, or slides the wrong way, or
                spins.
              </strong>{" "}
              A sign. This is expected on the first run and the file warns about
              it. Work out which axis by what the robot did: away from the tag
              is <code>forward</code>, wrong-way sideways is{" "}
              <code>sideways</code>, spinning is <code>turn</code>: then negate
              that one value and only that one.
            </li>
            <li>
              <strong>
                The robot drives most of the way, stops short, and the command
                never ends.
              </strong>{" "}
              The profile finished, the feedforward went to zero, and with kP at{" "}
              <code>0.0</code> there is nothing left to close the last gap. But
              the measurement is still outside the 3 cm tolerance, so{" "}
              <code>atGoal()</code> stays false and the loop keeps yielding
              forever. This is the moment to give <code>distance</code> and{" "}
              <code>lateral</code> a real kP. Start small and raise it.
            </li>
            <li>
              <strong>
                You schedule this command outside teleop, it gets interrupted,
                and the robot keeps rolling.
              </strong>{" "}
              The <code>.whenCanceled(...)</code> hook is missing or is not
              doing both lines. Holding X in teleop hides this, because the
              joystick default command reclaims the drivetrain on release and
              stops it for you. An autonomous OpMode has no such default
              command, so the last velocity request stays in force. Cancellation
              skips everything after the loop, which is why both the{" "}
              <code>Idle</code> request and the{" "}
              <code>setPriorityTagID(limelightName, -1)</code> have to be
              repeated in the hook.
            </li>
          </ul>
        </Box>
      </LessonSection>

      {/* ── two styles ───────────────────────────────────────────────── */}
      <LessonSection
        id="two-styles-side-by-side"
        title="Two styles, side by side"
      >
        <p className="prose-body measure">
          <code>DriveToPoint.java</code> is sitting in the same folder on this
          branch, and it is the other dialect. Open both and read them next to
          each other. Different jobs, one drives to a field pose off odometry,
          the other to a tag off the camera, but the same four phases, arranged
          two different ways.
        </p>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-note leading-relaxed">
            <thead>
              <tr style={{ color: "var(--tx)" }}>
                <th className="py-2 pr-4 font-semibold">Phase</th>
                <th className="py-2 pr-4 font-semibold">
                  <code>DriveToPoint</code>
                </th>
                <th className="py-2 font-semibold">
                  <code>DriveToTagInline</code>
                </th>
              </tr>
            </thead>
            <tbody style={{ color: "var(--tx2)" }}>
              <tr>
                <td className="py-2 pr-4">Setup</td>
                <td className="py-2 pr-4">
                  <code>initialize()</code>
                </td>
                <td className="py-2">Everything above the loop</td>
              </tr>
              <tr>
                <td className="py-2 pr-4">Per loop</td>
                <td className="py-2 pr-4">
                  <code>execute()</code>
                </td>
                <td className="py-2">The loop body</td>
              </tr>
              <tr>
                <td className="py-2 pr-4">Finish check</td>
                <td className="py-2 pr-4">
                  <code>isFinished()</code>
                </td>
                <td className="py-2">
                  <code>break</code>
                </td>
              </tr>
              <tr>
                <td className="py-2 pr-4">Cleanup</td>
                <td className="py-2 pr-4">
                  <code>end(boolean interrupted)</code> — one method, both cases
                </td>
                <td className="py-2">
                  Below the loop <em>and</em> <code>.whenCanceled(...)</code> —
                  written twice
                </td>
              </tr>
              <tr>
                <td className="py-2 pr-4">State between loops</td>
                <td className="py-2 pr-4">Fields on the class</td>
                <td className="py-2">Locals the lambda closes over</td>
              </tr>
              <tr>
                <td className="py-2 pr-4">Built as</td>
                <td className="py-2 pr-4">
                  <code>new DriveToPoint(drivetrain, goal)</code>
                </td>
                <td className="py-2">
                  <code>DriveToTagInline.create(...)</code>, a static factory
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        <Box variant="concept" title="Which one should you write?">
          <p>
            Write the classic style when the phases are separate, when other
            people on your team are still learning, or when the command is long
            enough that four labeled methods are a favor to the next reader.
            Write the coroutine style when the routine is a sequence of steps
            that reads naturally top to bottom, or when it needs a pile of state
            that would otherwise become fields nobody can keep track of.
          </p>
          <p className="mt-3">
            Most of this team&apos;s code is neither: it is chained commands.
            Reach for one of these two only when chaining cannot say what you
            mean.
          </p>
        </Box>
      </LessonSection>

      {/* ── template diff ────────────────────────────────────────────── */}
      <LessonSection
        id="if-you-look-this-up-in"
        title="If you look this up in the robot template"
      >
        <p className="prose-body measure">
          The 2027-Template has a file with the same name that is <em>not</em>{" "}
          the same file. It is a later, more careful version of the same idea.
          If you copy from it while following this page you will get compile
          errors, so here is what differs.
        </p>

        <CollapsibleSection title="Workshop-Code vs. 2027-Template: the differences">
          <ul
            className="ml-5 list-disc space-y-3"
            style={{ color: "var(--tx2)" }}
          >
            <li>
              <strong>Different number of arguments:</strong> The branch is{" "}
              <code>
                create(drivetrain, limelightName, targetTagId, standoffMeters)
              </code>
              . The branch takes four arguments. The template&apos;s{" "}
              <code>create(drivetrain, camera, targetTagId)</code> takes three.
            </li>
            <li>
              <strong>{"The standoff moves off the robot. "}</strong> The branch
              takes it as that fourth argument and uses it as the distance
              controller&apos;s goal. The template has no such argument: its
              distance goal is <code>0.0</code>, and the standoff is set on the
              camera instead, as the Limelight&apos;s 3D point-of-interest
              offset in the web UI. Same behavior, but you change it in a
              browser rather than in Java, and you can set a different one per
              tag.
            </li>
            <li>
              <strong>The template rotates into the body frame.</strong> It
              builds{" "}
              <code>
                new ChassisVelocities(vx, vy,
                omega).toRobotRelative(Rotation2d.fromRadians(measuredHeading))
              </code>{" "}
              before sending the request. The branch sends the tag-frame numbers
              directly. That rotation is what makes the approach behave when the
              robot starts well off-square.
            </li>
            <li>
              <strong>The template pins the signs down.</strong> It writes{" "}
              <code>Math.abs(robotInTag.getZ())</code>,{" "}
              <code>-robotInTag.getX()</code> and{" "}
              <code>-robotInTag.getRotation().getY()</code>, and negates the
              forward term. The branch takes all three raw and leaves you a
              TODO.
            </li>
            <li>
              <strong>Different visibility guards.</strong> The branch has one
              helper returning a <code>Pose3d</code> or <code>null</code>,
              checking <code>getTV</code> then the ID then{" "}
              <code>Pose3d.kZero</code>. The template has a boolean helper for
              the ID and two separate guard clauses in the loop, and its comment
              argues the zero-pose check is more reliable than{" "}
              <code>getTV()</code> because <code>getTV()</code> can flip true a
              frame before the target-space data fills in.
            </li>
            <li>
              <strong>{"Different names: "}</strong> The branch&apos;s command
              is named <code>&quot;DriveToTagInline&quot;</code>; the
              template&apos;s is named <code>&quot;DriveToTag&quot;</code>. The
              template also ships a separate{" "}
              <code>commands/DriveToTag.java</code>, the{" "}
              <code>ClassicCommand</code> version of this exact behavior: that
              file does not exist on the branch, where the classic comparison is{" "}
              <code>DriveToPoint</code>.
            </li>
            <li>
              <strong>Different import path:</strong>{" "}
              <code>frc.robot.LimelightHelpers</code> on the branch,{" "}
              <code>frc.robot.subsystems.vision.LimelightHelpers</code> in the
              template.
            </li>
          </ul>
          <p className="mt-4">
            For this page, the branch is what you are reading and the branch
            wins. When you take this to your own robot, the template&apos;s
            version is the better starting point.
          </p>
        </CollapsibleSection>

        <DocumentationButton
          href="https://github.com/Hemlock5712/Workshop-Code/blob/7-InlineCommands/src/main/java/frc/robot/commands/DriveToTagInline.java"
          title="DriveToTagInline.java on 7-InlineCommands"
          icon={<GitBranch className="w-5 h-5" />}
        />

        <DocumentationButton
          href="https://github.com/Hemlock5712/2027-Template/blob/2027-dev/src/main/java/frc/robot/commands/DriveToTag.java"
          title="DriveToTag.java: the template's ClassicCommand version"
          icon={<GitBranch className="w-5 h-5" />}
        />
      </LessonSection>

      {/* ── that's the course ────────────────────────────────────────── */}
      <LessonSection id="that-is-the-last-page" title="That is the last page">
        <p className="prose-body measure">
          You have now seen all four dialects this team writes in. Basic
          commands bound to buttons. Chained commands, which is what almost
          everything actually is. State machines, for when the robot has to be
          in exactly one configuration at a time. And coroutines, for the
          handful of routines that will not fit in the other three.
        </p>

        <p className="prose-body measure">
          The order they were taught in is roughly the order you should reach
          for them. If chaining says what you mean, chain. This page exists
          because sometimes it does not.
        </p>
      </LessonSection>

      <Quiz
        questions={[
          {
            id: 1,
            question:
              "In a coroutine body, which part corresponds to a ClassicCommand's initialize()?",
            options: [
              "The first pass through the while loop",
              "Everything written above the while loop, inside the coroutine body",
              "The code in create(...) that builds the controllers",
              "The .whenCanceled(...) block",
            ],
            correctAnswer: 1,
            explanation:
              "Everything between the opening of the coroutine body and the while loop runs exactly once, when the command is scheduled: that is initialize. The controllers built in create(...) are earlier still: create(...) runs once when the command object is made, which for a button binding is when the OpMode constructor runs, not when you press the button.",
          },
          {
            id: 2,
            question: "What does coroutine.yield() actually do?",
            options: [
              "Ends the command and returns control to the scheduler",
              "Suspends the body, hands control back to the scheduler, and resumes on the next robot loop at the line after the yield",
              "Skips the rest of this loop iteration, like continue",
              "Waits until the next button press",
            ],
            correctAnswer: 1,
            explanation:
              "yield() is what turns a while (true) loop into once-per-robot-loop code instead of a hang. The body pauses, the scheduler runs everything else, and next tick the body picks up exactly where it stopped. Leaving the yield out of a while (true) loop locks up the robot.",
          },
          {
            id: 3,
            question:
              "Why must the atGoal() finish check sit after the guard clause and after the three calculate(...) calls?",
            options: [
              "Because atGoal() is expensive to call",
              "Because atGoal() depends on flags that only calculate(...) sets, so a controller that has not been given a measurement cannot answer it",
              "Because the guard clause resets the controllers",
              "Because the scheduler only allows one finish check per loop",
            ],
            correctAnswer: 1,
            explanation:
              "In WPILib's source, atGoal() is atSetpoint() && goal.equals(setpoint), and atSetpoint() is gated on m_haveMeasurement and m_haveSetpoint: both set only inside calculate(...), and m_haveMeasurement is cleared again by reset(...), which is what the seeding step calls. Note that the branch's comment on that line gives a different reason (“a fresh controller claims to be at its goal”) which the controller's source contradicts: a fresh controller reports false. The placement is right; the comment's reasoning is not.",
          },
          {
            id: 4,
            question:
              "All three controllers ship with kP, kI and kD set to 0.0. What is driving the robot?",
            options: [
              "Nothing: the command is broken as shipped",
              "The profile's planned velocity, added to each PID output as a feedforward term",
              "The SwerveRequest applies a default speed when the PID output is zero",
              "The setTolerance values act as a minimum speed",
            ],
            correctAnswer: 1,
            explanation:
              "Each of the three sums is calculate(...) + getSetpoint().velocity. With the gains at zero, calculate(...) contributes nothing and the profile's planned velocity does all the driving. That is a safe way to switch a new command on for the first time, but it also means nothing corrects error, so if the robot stops short, it stays short.",
          },
          {
            id: 5,
            question:
              "Why does the cleanup appear twice: once after the loop and once in .whenCanceled(...)?",
            options: [
              "It is a mistake in the branch; one copy could be deleted",
              "Because a canceled coroutine is dropped mid-loop, so the lines after the loop never run",
              "Because .whenCanceled(...) runs before the loop, not after",
              "Because the scheduler calls both on every finish",
            ],
            correctAnswer: 1,
            explanation:
              "Breaking out of the loop falls through to the cleanup below it. Being interrupted does not: the body is dropped where it stands and nothing after the loop executes. .whenCanceled(...) is the only hook that covers that path, which is why both copies are needed. A ClassicCommand avoids the duplication with a single end(boolean interrupted).",
          },
        ]}
      />
    </PageTemplate>
  );
}
