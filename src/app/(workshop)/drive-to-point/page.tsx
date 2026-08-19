import PageTemplate from "@/components/PageTemplate";
import LessonSection from "@/components/lesson/LessonSection";
import CodeBlock from "@/components/CodeBlock";
import Box from "@/components/Box";
import DocumentationButton from "@/components/DocumentationButton";
import GitHubContent from "@/components/GitHubContent";
import ImageBlock from "@/components/ImageBlock";
import Quiz from "@/components/Quiz";
import { MarginNote, ProseBlock, Split } from "@/components/lesson/Prose";
import { GitBranch } from "lucide-react";

/**
 * Five sections against the old eight, four excerpts and one embed against
 * thirteen code blocks.
 *
 * The old page built `DriveToPoint.java` field by field across nine numbered
 * steps, each closing on a "Visible result" that was usually "nothing changes
 * yet". That is a diff, not a lesson. What survives is what a student cannot
 * get by reading the finished file: which frame the pose is measured in, why
 * the heading controller wraps and the other two do not, why the stop request
 * lives in `end()`, and what 30 m/s of commanded speed does on a 4.54 m/s
 * drivetrain.
 *
 * Deliberately gone: the optional speed clamp (not on the branch, and the next
 * lesson replaces it properly), the `ClassicCommand.java` embed (123 lines the
 * page tells you not to read, and the PR diff still reaches them), the
 * PID-versus-Slot-0 comparison table (three sentences of prose), and the
 * per-step compile-error commentary.
 *
 * The "where the flywheel went" margin note went the same way in August 2026,
 * when the prose linter started joining sentences across an inline `<code>`
 * and the page had to come back under the 15-minute cap. It was branch
 * housekeeping about another lesson's file, and a margin note is the one thing
 * on a page that is never load-bearing.
 *
 * "Check yourself" is not payable. It was cut once to buy back two minutes and
 * has been put back: the original eight questions are six, every answer is
 * taught on this page rather than on the branch, and the tolerance numbers
 * behind `atSetpoint()` came back with them.
 *
 * This is the first page in the course to use Java `super` and `this`.
 * `/java-basics` used to pre-teach both, fifteen lessons early, and no longer
 * does. Both are defined here, where they first appear.
 */
export default function DriveToPoint() {
  return (
    <PageTemplate
      title="Drive to Point"
      lede="Hold a button and the robot drives itself to one spot on the field, position and heading together. Three PID controllers turn the gap between the current pose and the target pose into a chassis velocity. Accuracy comes from odometry."
      needs={[
        <>
          <strong>Swerve Calibration</strong>. The command is only as accurate
          as the pose it subtracts from.
        </>,
        <>
          <strong>Classic Commands</strong> and <strong>OpModes</strong>, for
          the lifecycle and <code>whileTrue</code>.
        </>,
        <>
          <strong>Logging</strong>. The last check below is a graph.
        </>,
      ]}
      branch="5-DriveToPoint"
      time="25 minutes"
    >
      <p>
        Every meter the drivetrain has covered so far, a human drove. Hold{" "}
        <strong>A</strong> for the field origin. Hold <strong>B</strong> for (3
        m, 2 m) facing 180°.
      </p>

      <LessonSection id="the-pose-you-are-driving-to" title="The target pose">
        <p>
          A <code>Pose2d</code> bundles three numbers: X in meters, Y in meters,
          and a <code>Rotation2d</code> heading. The robot&apos;s current
          position and the place you are sending it are both written this way.
          0° points down the field.
        </p>

        <ImageBlock
          src="/images/drive-to-point-field.png"
          alt="Field coordinates: X down the length of the field, Y across it to the left"
          width={1024}
          height={469}
          caption="The origin is the blue alliance corner for both alliances. It never flips."
        />

        <Box
          variant="alert-warning"
          tag="WATCH OUT · POSE"
          title="Nothing has told the robot where it is"
        >
          <p>
            <code>getPose()</code> returns whatever odometry has counted since
            the code started. Nothing on this branch resets it to a known field
            position. The left-bumper <code>seedFieldCentric()</code> call
            re-zeroes the driver&apos;s forward, not odometry.
          </p>
          <p className="mt-3">
            The simulator has no camera, so holding <strong>A</strong> returns
            the robot to wherever odometry started counting. On a real field an
            unseeded pose sends it somewhere you did not intend. Seeding belongs
            to{" "}
            <a href="/swerve-calibration" className="underline font-medium">
              Swerve Calibration
            </a>
            .
          </p>
        </Box>
      </LessonSection>

      <LessonSection
        id="a-second-way-to-write-a"
        title="Four methods to fill in"
      >
        <p>
          Every command so far came out of a factory:{" "}
          <code>mechanism.run(...)</code> or <code>Command.sequence(...)</code>,
          one expression with <code>.named(...)</code> on the end. This one does
          four things, and only one of them repeats.
        </p>

        <CodeBlock
          language="java"
          title="The shape you are about to fill in"
          code={`public class DriveToPoint extends ClassicCommand {

  public DriveToPoint(DriveMechanism drivetrain, Pose2d targetPose) {
    super("DriveToPoint", drivetrain); // command name + required mechanisms
  }

  @Override
  protected void initialize() {}               // once, when the command starts

  @Override
  protected void execute() {}                  // every loop, while it is active

  @Override
  protected boolean isFinished() {             // every loop, right after execute
    return false;                              // true = finish now
  }

  @Override
  protected void end(boolean interrupted) {}   // once, when it ends either way
}`}
        />

        <p>
          <code>super(...)</code> calls the constructor of the class you
          extended, here <code>ClassicCommand</code>. It takes the command name
          first, then every mechanism this command owns while it runs. That is
          where the telemetry name comes from. <code>.named(...)</code> belongs
          to the builder <code>run(...)</code> hands back, so calling it on a
          finished <code>Command</code> will not compile.
        </p>

        <p>
          <code>ClassicCommand</code> is a file, not a framework class: 123
          lines that turn your four methods into an ordinary{" "}
          <code>Command</code>. Before anything else, paste the branch&apos;s
          copy into{" "}
          <code>src/main/java/frc/robot/utils/ClassicCommand.java</code> and
          leave it alone. It is in the PR diff below.
        </p>
      </LessonSection>

      <LessonSection id="build-it" title="Build the command">
        <p>
          One new file, <code>commands/DriveToPoint.java</code>. Six field
          declarations go in at the top, two of them plain: the drivetrain and
          the target pose. Three are <code>PIDController</code> fields with kP
          of 10 on X and Y and 7 on heading. The sixth is one{" "}
          <code>SwerveRequest.ApplyFieldVelocity</code>, built once and reused
          every loop. Copy them from the file at the end of this section.
        </p>

        <p>
          Three controllers, because a swerve drivetrain moves in three
          directions at once. Heading gets its own, so the robot turns to face
          the right way while still driving.
        </p>

        <p>
          The request is blue-relative because the pose is. The joystick request
          uses the operator perspective, which flips on red so forward matches
          what the driver sees. Your controllers already work in field
          coordinates, and re-rotating their output would drive the robot the
          wrong way on one alliance. <code>OpenLoopVoltage</code> means no wheel
          PID underneath yours.
        </p>

        <CodeBlock
          language="java"
          title="DriveToPoint.java: the constructor"
          code={`  /**
   * @param drivetrain the swerve drive to command
   * @param targetPose the field pose (blue-origin) to drive to, including the goal heading
   */
  public DriveToPoint(DriveMechanism drivetrain, Pose2d targetPose) {
    super("DriveToPoint", drivetrain); // command name + required mechanism
    this.drivetrain = drivetrain;
    this.targetPose = targetPose;

    // Wrap heading error to [-pi, pi] so the robot turns the short way around.
    headingController.enableContinuousInput(-Math.PI, Math.PI);
  }`}
        />

        <Split>
          <ProseBlock>
            <p>
              <code>this.drivetrain = drivetrain;</code> looks like it does
              nothing. It copies the parameter into the field of the same name.
              The <code>this.</code> prefix means the field on this object; the
              bare name means the parameter passed in. The parameter disappears
              when the constructor ends, and the field is what{" "}
              <code>execute()</code> reads.
            </p>
            <p>
              <code>enableContinuousInput</code> tells the heading controller
              that its two ends are the same place, so the robot turns the short
              way. That controller works in radians, not degrees. X and Y get no
              such call. Meters do not wrap.
            </p>
          </ProseBlock>
          <MarginNote label="What goes wrong without it">
            A robot at 179° asked to reach −179° has a real error of 2°. But{" "}
            <code>−179 − 179</code> is −358, so an untreated controller spins
            the long way around.
          </MarginNote>
        </Split>

        <p>
          Then the loop. <code>initialize()</code> calls <code>reset()</code> on
          all three controllers, because a <code>PIDController</code> is a field
          here and remembers its error between runs.
        </p>

        <CodeBlock
          language="java"
          title="DriveToPoint.java: execute()"
          code={`  @Override
  protected void execute() {
    Pose2d currentPose = drivetrain.getPose();

    double vx = xController.calculate(currentPose.getX(), targetPose.getX());
    double vy = yController.calculate(currentPose.getY(), targetPose.getY());
    double omega =
        headingController.calculate(
            currentPose.getRotation().getRadians(), targetPose.getRotation().getRadians());

    drivetrain.setControl(driveRequest.withVelocity(new ChassisVelocities(vx, vy, omega)));
  }`}
        />

        <p>
          <code>calculate(measurement, setpoint)</code> takes where you are,
          then where you want to be. With kI and kD at zero, out comes kP times
          the error. <code>ChassisVelocities</code> holds the three results:{" "}
          <code>vx</code> and <code>vy</code> in meters per second,{" "}
          <code>omega</code> in radians per second. It was called{" "}
          <code>ChassisSpeeds</code> until recently, so an example using that
          name targets an older WPILib.
        </p>

        <p>
          <code>isFinished()</code> returns <code>false</code>, so the command
          runs until the driver lets go. That keeps it out of{" "}
          <code>Command.sequence(...)</code>. A sequence handed a command that
          never ends sticks on that leg forever, so no autonomous routine can
          use it.
        </p>

        <p>
          The branch leaves the other option in a comment on that line:{" "}
          <code>
            xController.atSetpoint() &amp;&amp; yController.atSetpoint()
            &amp;&amp; headingController.atSetpoint()
          </code>
          . <code>atSetpoint()</code> asks whether the latest error is inside a
          tolerance. The default is <strong>0.05</strong>, in whatever unit that
          controller works in: 5 cm on X and Y, 0.05 radians on heading, about
          2.9°. <code>setTolerance(...)</code> changes it.
        </p>

        <p>
          <code>end(boolean interrupted)</code> sends{" "}
          <code>new SwerveRequest.Idle()</code>. It runs whether the command
          finished or something took the drivetrain away, and the flag tells you
          which. No exit skips it, so that is where the stop belongs.
        </p>

        <p>
          Canceling does not stop a motor: it ends the command, and the hardware
          carries on doing what it was last told. Teleop would forgive the
          omission, since the joystick default takes the drivetrain back and
          asks for nothing.
        </p>

        <p>
          That default belongs to one OpMode. Schedule the command anywhere
          without it and nothing claims the drivetrain, so{" "}
          <code>Mechanism.idle()</code> takes over at the lowest priority. It
          sends no output at all, and Phoenix keeps applying the last velocity.
        </p>

        <p>The whole file, 87 lines:</p>

        <GitHubContent
          repository="Hemlock5712/Workshop-Code"
          filePath="src/main/java/frc/robot/commands/DriveToPoint.java"
          branch="5-DriveToPoint"
          pr={{ number: 11, focusFile: "DriveToPoint.java" }}
        />

        <p>
          Two bindings go in the <code>TeleopOpMode</code> constructor, under
          the left-bumper binding already there. <code>whileTrue</code>, because
          the command never finishes on its own: release and it is canceled.
        </p>

        <CodeBlock
          language="java"
          title="TeleopOpMode.java: three imports and two bindings"
          code={`import frc.robot.commands.DriveToPoint;
import org.wpilib.math.geometry.Pose2d;
import org.wpilib.math.geometry.Rotation2d;

// ... inside the constructor, after the seedFieldCentric binding:

    // Hold A or B to drive straight to a fixed spot on the field. Let go to stop.
    driver.a().whileTrue(new DriveToPoint(drivetrain, Pose2d.kZero));
    driver
        .b()
        .whileTrue(new DriveToPoint(drivetrain, new Pose2d(3, 2, Rotation2d.fromDegrees(180))));`}
        />
      </LessonSection>

      <LessonSection id="the-gains" title="The gains">
        <p>
          These three controllers are not the Slot 0 gains you tuned in Tuner X.
          Those run on the TalonFX itself, in rotations of one mechanism, and
          put out volts for one motor. These run in your code once a loop, in
          meters and radians, and command a velocity for the whole chassis.
        </p>

        <p>
          So <code>kP = 10</code> reads as ten meters per second of commanded
          speed for every meter of error. On heading, <code>kP = 7</code> reads
          as seven radians per second for every radian. Do the arithmetic. Three
          meters out, <code>execute()</code> asks for <strong>30 m/s</strong>,
          against the <strong>4.54 m/s</strong> in{" "}
          <code>TunerConstants.kSpeedAt12Volts</code>. Nothing in the file trims
          it.
        </p>

        <p>
          The robot lurches away at full power, then crawls in over the last
          half meter as the error shrinks. It works, and it looks bad.
        </p>

        <Box
          variant="alert-danger"
          tag="DANGER · UNTUNED"
          title="10 / 10 / 7 are marked TODO"
        >
          <p>
            The comment in the file ends{" "}
            <code>TODO: tune these for your drivetrain</code>. Nobody measured
            them for your robot. On real hardware, test in a clear space and
            keep a hand on the disable. A gain this large turns a wrong pose
            into a fast wrong move.
          </p>
        </Box>
      </LessonSection>

      <LessonSection id="check-your-work" title="Check your work">
        <ol
          className="ml-5 list-decimal space-y-3"
          style={{ color: "var(--tx2)" }}
        >
          <li>
            Enable Teleop in the simulator, drive a few meters from where the
            robot started, and turn it. Now hold <strong>A</strong>: it should
            drive back and rotate to 0° together, not spin first and drive
            second.
          </li>
          <li>
            Keep holding <strong>A</strong> and push the left stick. Nothing
            should happen: <code>DriveToPoint</code> requires the drivetrain, so
            it outranks the joystick default until you release.
          </li>
          <li>
            Release <strong>A</strong> halfway through the trip with the sticks
            centered. The robot should stop, not coast on at its last speed.
          </li>
          <li>
            Hold <strong>B</strong>. The robot drives to (3, 2), turns to 180°,
            then sits on the target making small corrections for as long as you
            hold.
          </li>
          <li>
            Graph <code>Drivetrain/Pose</code> and{" "}
            <code>Drivetrain/TranslationSpeedMps</code> for that run. X settles
            near 3, Y near 2, heading near 180°. Speed jumps to whatever the
            drivetrain can do, holds, then falls off steeply.
          </li>
        </ol>

        <p>
          <strong>It drives off confidently in the wrong direction.</strong>{" "}
          Suspect the pose, not the gains. The robot is driving correctly toward
          where it believes the target is, so graph <code>Drivetrain/Pose</code>{" "}
          before touching a number. If the pose is right and it still slides
          sideways, check the request has{" "}
          <code>ForwardPerspectiveValue.BlueAlliance</code>.
        </p>

        <p>
          <strong>It gets close, creeps in, and never arrives.</strong> Expected
          on this branch. One centimeter of error asks for 10 cm/s, and at some
          point the request cannot overcome friction. There is no I term to
          grind out the last bit.
        </p>

        <p>
          <strong>It will not compile.</strong> Usually one of three. A{" "}
          <code>ChassisSpeeds</code> where <code>ChassisVelocities</code>{" "}
          belongs, a <code>.named(...)</code> call on the new command, or a{" "}
          <code>super(...)</code> that is not the first line of the constructor.
        </p>

        <p>
          <strong>Profiled Drive to Point</strong> changes this one file and
          both faults go away. It plans the whole trip before the robot moves,
          so PID becomes a small correction and the command gets a finish line.
        </p>

        <DocumentationButton
          href="https://github.com/Hemlock5712/Workshop-Code/pull/11"
          title="PR #11: 5 drive to point"
          icon={<GitBranch className="w-5 h-5" />}
        />
      </LessonSection>

      <Quiz
        questions={[
          {
            id: 1,
            question:
              "Which of the three PID controllers gets enableContinuousInput(-Math.PI, Math.PI), and why?",
            options: [
              "All three, so each one takes the shortest route to its setpoint",
              "Only the heading controller, because angles wrap and meters do not",
              "Only the X and Y controllers, because the field walls bound them",
              "None of them: the call belongs on the SwerveRequest instead",
            ],
            correctAnswer: 1,
            explanation:
              "Heading is the one axis whose two ends are the same place. Without the call, a robot at 179 degrees asked to reach -179 degrees computes an error of -358 and spins the long way around. X and Y are meters: 3 meters is never the same place as -3 meters, so wrapping them would be wrong. The bounds are -pi and pi because that controller works in radians.",
          },
          {
            id: 2,
            question:
              'Where does the name "DriveToPoint" that shows up in telemetry come from?',
            options: [
              "The class name, which ClassicCommand reads by reflection",
              'A .named("DriveToPoint") call on the finished command',
              'The super("DriveToPoint", drivetrain) call, which also declares the mechanism the command owns',
              "The @Teleop annotation on the OpMode that binds it",
            ],
            correctAnswer: 2,
            explanation:
              "super(...) calls the constructor of the class you extended. Its first argument is the command name; everything after it is a mechanism this command owns while it runs. .named(...) belongs to the builder that run(...) hands back, so calling it on a finished Command does not compile, and that is one of the three usual compile errors here.",
          },
          {
            id: 3,
            question:
              "Why does the stop request go in end(boolean interrupted) rather than at the bottom of execute() or after isFinished() returns true?",
            options: [
              "end() runs on a natural finish and on an interrupt, so no exit from the command skips the stop",
              "end() is the only method permitted to call setControl",
              "SwerveRequest.Idle() puts the drive motors in brake mode, which only takes effect once the command is over",
              "The scheduler will not release a mechanism until the command sends one final request",
            ],
            correctAnswer: 0,
            explanation:
              "Canceling ends the command, not the motion: the hardware carries on with the last request it was given. end() is the one method that runs on both exits, and the interrupted flag tells you which happened. Teleop happens to forgive a missing stop, because the joystick default takes the drivetrain back and asks for nothing, but that default belongs to one OpMode.",
          },
          {
            id: 4,
            question:
              "isFinished() returns false on this branch. What follows from that?",
            options: [
              "The command runs until the driver releases the button, and it cannot be a step inside Command.sequence(...)",
              "The command ends as soon as all three controllers are inside tolerance",
              "The command will not compile until you give it a real condition",
              "The command runs for exactly one scheduler loop and then ends",
            ],
            correctAnswer: 0,
            explanation:
              "A command that never finishes sticks any sequence it is placed in on that leg forever, and autonomous routines are sequences. The commented-out alternative on the branch is xController.atSetpoint() && yController.atSetpoint() && headingController.atSetpoint(), whose default tolerance is 0.05: 5 cm on X and Y, 0.05 radians on heading. Profiled Drive to Point gives the command a real finish line instead.",
          },
          {
            id: 5,
            question:
              "The drive request is built with ForwardPerspectiveValue.BlueAlliance rather than the operator perspective the joystick request uses. Why?",
            options: [
              "The operator perspective costs an extra rotation on every loop",
              "The pose from odometry is always blue-origin, so velocities computed from it have to be sent in that same frame",
              "Robots on the red alliance need a different set of gains",
              "The operator perspective only applies while a human is holding a stick",
            ],
            correctAnswer: 1,
            explanation:
              "getPose() is measured from the blue alliance corner for both alliances and never flips, and the three controller outputs are computed from that pose. The operator perspective exists for a driver, whose idea of forward changes with the alliance. Re-rotating a field-frame velocity through it would send the robot the wrong way on one alliance.",
          },
          {
            id: 6,
            question:
              "kP is 10 on the X controller and the target is three meters away. What velocity does execute() ask for on that axis?",
            options: [
              "3 m/s, because the controller caps its output at the error",
              "30 m/s, well past the 4.54 m/s in TunerConstants, and nothing in the file trims it",
              "4.54 m/s, the drivetrain's top speed, because the request is clamped there",
              "0.3 m/s, because kP divides the error",
            ],
            correctAnswer: 1,
            explanation:
              "With kI and kD at zero the output is kP times the error, so 10 times 3 is 30 m/s against a top speed of 4.54 m/s. That is the speed trace in the last check: flat out for most of the trip, then a steep falloff. The gains carry TODO: tune these for your drivetrain, so treat them as somebody else's starting point rather than an answer.",
          },
        ]}
      />
    </PageTemplate>
  );
}
