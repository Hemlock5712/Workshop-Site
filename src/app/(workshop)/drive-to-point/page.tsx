import PageTemplate from "@/components/PageTemplate";
import LessonSection from "@/components/lesson/LessonSection";
import AlphaStatusNote from "@/components/AlphaStatusNote";
import KeyConceptSection from "@/components/KeyConceptSection";
import CodeBlock from "@/components/CodeBlock";
import Box from "@/components/Box";
import CollapsibleSection from "@/components/CollapsibleSection";
import DocumentationButton from "@/components/DocumentationButton";
import GitHubContent from "@/components/GitHubContent";
import ImageBlock from "@/components/ImageBlock";
import Quiz from "@/components/Quiz";
import { MarginNote, ProseBlock, Split } from "@/components/lesson/Prose";
import { GitBranch } from "lucide-react";

export default function DriveToPoint() {
  return (
    <PageTemplate
      title="Read where you are, subtract where you want to be, drive the difference"
      emphasis="drive the difference"
      lede="Every time the drivetrain has moved so far, a human moved it. This page adds a button that drives the robot to an exact spot on the field on its own — position and heading, no sticks."
      needs={[
        <>
          <strong>Logging</strong>, from earlier in Workshop #2. Two of the
          checks at the bottom of this page are graphs of NetworkTables values.
        </>,
        <>
          <strong>Swerve Calibration</strong>. This command drives to an
          absolute field pose, so it can only ever be as accurate as the pose it
          is comparing against.
        </>,
        <>
          <strong>Classic Commands</strong> and <strong>OpModes</strong> for the
          command lifecycle and <code>whileTrue</code>. The Autonomous lesson
          introduced the rule that a sequence cannot pass a command that never
          ends.
        </>,
      ]}
      branch="5-DriveToPoint"
      time="Roughly 45 minutes"
    >
      <Split>
        <KeyConceptSection
          description={[
            "The command that does it is under ninety lines. Odometry says where the robot is. A Pose2d says where it should be. Three PID controllers turn the gap between them into a speed, and that speed goes to the drivetrain as one field-relative request.",
            "The branch adds four files and edits two. Two of the new ones are what you write here: utils/ClassicCommand.java, 123 lines copied in, and commands/DriveToPoint.java, 87 lines you type.",
          ]}
          concept="Driving to a point is subtraction with a gain on it. The arithmetic is the simple part — the hard part is trusting the pose you are subtracting from."
        />
        <MarginNote label="WHAT YOU'LL BUILD">
          Two bindings. Hold <strong>A</strong> and the robot drives to the
          field origin. Hold <strong>B</strong> and it drives to (3 m, 2 m)
          facing 180°.
        </MarginNote>
      </Split>

      <Box
        variant="alert-warning"
        tag="READ FIRST · BRANCH"
        title="This branch is not one commit past the flywheel lesson"
      >
        <p>
          PR #11&apos;s base is <code>2-Logging</code>, not{" "}
          <code>4-DynamicFlywheel</code>. Check out <code>5-DriveToPoint</code>{" "}
          and <code>subsystems/Flywheel.java</code> and{" "}
          <code>utils/TalonFXUtil.java</code> from Dynamic Flywheel Control are
          not in the tree at all. That lesson is a dead-end side branch, and
          nothing after it inherits the work.
        </p>
        <p className="mt-3">
          Vision does come along. The same commit adds{" "}
          <code>subsystems/Limelight.java</code> and{" "}
          <code>LimelightHelpers.java</code> in its own right, so{" "}
          <code>Robot.java</code> still calls{" "}
          <code>Limelight.registerAll(drivetrain, &quot;limelight&quot;)</code>{" "}
          and odometry still gets corrected by AprilTags on a real field.
        </p>
        <p className="mt-3">
          If you built the flywheel and want to keep it, clone a second copy of
          the repository and leave <code>4-DynamicFlywheel</code> checked out
          there.
        </p>
      </Box>

      {/* ── the pose ─────────────────────────────────────────────────── */}
      <LessonSection
        id="the-pose-you-are-driving-to"
        title="The pose you are driving to"
      >
        <p className="prose-body measure">
          A <code>Pose2d</code> is three numbers bundled together: an X in
          meters, a Y in meters, and a heading. It answers both{" "}
          <em>where on the field</em> and <em>which way around</em>. Both the
          robot&apos;s current position and the place you want it to go are
          written as one.
        </p>

        <ImageBlock
          src="/images/drive-to-point-field.png"
          alt="FRC field coordinate system: X runs the length of the field away from the blue driver station, Y runs across it to the left"
          width={1024}
          height={469}
          caption="X runs down the length of the field, Y runs across it. The origin is the blue alliance corner, for both alliances."
        />

        <ul
          className="ml-5 list-disc space-y-2"
          style={{ color: "var(--tx2)" }}
        >
          <li>
            <strong>X</strong> — meters down the length of the field, increasing
            away from the blue driver station.
          </li>
          <li>
            <strong>Y</strong> — meters across the field, increasing to the
            left.
          </li>
          <li>
            <strong>Rotation</strong> — a <code>Rotation2d</code>, the direction
            the front of the robot is pointing. 0° faces down the field along
            increasing X.
          </li>
        </ul>

        <p className="prose-body measure">
          The origin does not move when you switch alliances. The javadoc on{" "}
          <code>DriveMechanism.getPose()</code> says it plainly:{" "}
          <em>
            &quot;(0, 0) is always the blue alliance corner. It does not flip
            when you are on red.&quot;
          </em>{" "}
          That one fact decides a design choice further down this page, so it is
          worth holding on to.
        </p>

        <CodeBlock
          language="java"
          title="The two poses this lesson uses"
          code={`// The field origin, facing 0 degrees. kZero is a ready-made constant.
Pose2d origin = Pose2d.kZero;

// Three meters down the field, two meters left, turned all the way around.
Pose2d target = new Pose2d(3, 2, Rotation2d.fromDegrees(180));

// Where the robot thinks it is right now, from odometry.
Pose2d currentPose = drivetrain.getPose();`}
        />

        <Box
          variant="alert-warning"
          tag="WATCH OUT · POSE"
          title="Nothing in this project has told the robot where it is"
        >
          <p>
            <code>getPose()</code> returns whatever odometry has counted up
            since the code started. Search the whole branch and you will not
            find a single call that resets the pose to a known field position.
            The one call that looks like it might —{" "}
            <code>drivetrain.seedFieldCentric()</code>, on the left bumper — is
            a different operation: it re-zeroes the driver&apos;s idea of
            &quot;forward&quot; and does not touch odometry.
          </p>
          <p className="mt-3">
            That distinction belongs to{" "}
            <a href="/swerve-calibration" className="underline font-medium">
              Swerve Calibration
            </a>{" "}
            — read it there rather than taking a guess here. What matters for
            this page: in the simulator there is no camera, so{" "}
            <code>Limelight.registerAll(...)</code> does nothing and the pose is
            pure odometry from wherever the drivetrain started counting. Holding
            A sends the robot back to <em>that</em> spot, whatever it was. On a
            real field, with a real starting position, an unseeded pose sends
            the robot somewhere you did not intend.
          </p>
        </Box>
      </LessonSection>

      {/* ── ClassicCommand ───────────────────────────────────────────── */}
      <LessonSection
        id="a-second-way-to-write-a"
        title="A second way to write a command"
      >
        <p className="prose-body measure">
          Every command you have written so far came out of a factory:{" "}
          <code>mechanism.run(...)</code>,{" "}
          <code>mechanism.runRepeatedly(...)</code>,{" "}
          <code>Command.sequence(...)</code>. One expression, one body, one{" "}
          <code>.named(...)</code> on the end. That shape is a good fit when the
          command does one thing over and over.
        </p>

        <p className="prose-body measure">
          <code>DriveToPoint</code> does four things, and only one of them
          repeats:
        </p>

        <ul
          className="ml-5 list-disc space-y-2"
          style={{ color: "var(--tx2)" }}
        >
          <li>
            <strong>Once, at the start:</strong> clear out the three PID
            controllers so nothing left over from the last run leaks in.
          </li>
          <li>
            <strong>Every loop:</strong> read the pose, work out three speeds,
            send them.
          </li>
          <li>
            <strong>Every loop, right after that:</strong> decide whether the
            command is done.
          </li>
          <li>
            <strong>Once, at the end:</strong> stop the drivetrain — whether the
            command finished on its own or the driver let go.
          </li>
        </ul>

        <p className="prose-body measure">
          Those four things have names. <code>utils/ClassicCommand.java</code>{" "}
          is a small helper class you copy into the project, and extending it
          gives you exactly four methods to fill in.
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

        <Box variant="concept" title="What interrupted means">
          <p>
            <code>end(boolean interrupted)</code> runs in both cases, and the
            flag tells you which one happened. The branch&apos;s own javadoc:{" "}
            <em>
              &quot;false if isFinished() ended the command, true if it was
              interrupted by another command claiming one of its
              mechanisms.&quot;
            </em>
          </p>
          <p className="mt-3">
            Because it runs either way, <code>end</code> is the one place
            cleanup needs to be. Put your motor-stopping line anywhere else and
            there is a path through the code that skips it.
          </p>
        </Box>

        <Split>
          <ProseBlock>
            <p>
              <code>ClassicCommand</code> is a file, not a framework class.
              WPILib does not ship it: it is 123 lines sitting in{" "}
              <code>utils/</code> on the branch, and the robot template ships
              its own copy. Copy it in and forget about it. What matters here is
              the result — <code>new DriveToPoint(...)</code> is a normal{" "}
              <code>Command</code>, and you bind it to a button like any other.
            </p>
          </ProseBlock>
          <MarginNote label="IF YOU ARE CURIOUS">
            Inside, it turns your four methods into an ordinary{" "}
            <code>Command</code>, written in the advanced dialect you meet at
            the end of the course. You never need to read it;{" "}
            <strong>Drive to Tag, Written as a Coroutine</strong> takes the lid
            off.
          </MarginNote>
        </Split>

        <Box
          variant="alert-warning"
          tag="WATCH OUT"
          title="The name does not come from .named(...)"
        >
          <p>
            <code>.named(...)</code> lives on the builder stage that{" "}
            <code>run(...)</code>, <code>runRepeatedly(...)</code> and the group
            factories hand back. A finished <code>Command</code> does not have
            it, so{" "}
            <code>new DriveToPoint(drivetrain, goal).named(&quot;…&quot;)</code>{" "}
            will not compile.
          </p>
          <p className="mt-3">
            A <code>ClassicCommand</code> gets both its name and its
            requirements from the <code>super(...)</code> call in its
            constructor:{" "}
            <code>super(&quot;DriveToPoint&quot;, drivetrain)</code>. First
            argument is the name that shows up in telemetry; everything after it
            is a mechanism this command owns while it runs.
          </p>
        </Box>
      </LessonSection>

      {/* ── build it ─────────────────────────────────────────────────── */}
      <LessonSection id="build-it" title="Build it">
        <p className="prose-body measure">
          Steps 2 through 8 all happen inside one new file,{" "}
          <code>src/main/java/frc/robot/commands/DriveToPoint.java</code>. Build
          it top to bottom in that order and it compiles at every step except
          where noted.
        </p>

        {/* step 1 */}
        <h3 className="display m-0 text-aside" style={{ marginBottom: "-8px" }}>
          1. Copy in <code>ClassicCommand.java</code>
        </h3>

        <p className="prose-body measure">
          Create <code>src/main/java/frc/robot/utils/ClassicCommand.java</code>{" "}
          and paste the branch&apos;s copy into it. Do not retype it — this is
          plumbing, not a lesson, and the whole file is embedded further down
          the page.
        </p>

        <p className="prose-body-sm measure">
          <strong>Visible result:</strong> the project still builds and the
          robot behaves exactly as before. Nothing extends the class yet.
        </p>

        {/* step 2 */}
        <h3 className="display m-0 text-aside" style={{ marginBottom: "-8px" }}>
          2. New file, class declaration, and the three controllers
        </h3>

        <CodeBlock
          language="java"
          title="DriveToPoint.java — imports, class, fields"
          code={`package frc.robot.commands;

import com.ctre.phoenix6.swerve.SwerveModule.DriveRequestType;
import com.ctre.phoenix6.swerve.SwerveRequest;
import frc.robot.subsystems.DriveMechanism;
import frc.robot.utils.ClassicCommand;
import org.wpilib.math.controller.PIDController;
import org.wpilib.math.geometry.Pose2d;
import org.wpilib.math.kinematics.ChassisVelocities;

public class DriveToPoint extends ClassicCommand {
  private final DriveMechanism drivetrain;
  private final Pose2d targetPose;

  // The whole commanded velocity comes from these controllers. The X/Y gain means: meters per
  // second of speed for every meter of error. TODO: tune these for your drivetrain.
  private final PIDController xController = new PIDController(10, 0, 0);
  private final PIDController yController = new PIDController(10, 0, 0);
  private final PIDController headingController = new PIDController(7, 0, 0);
}`}
        />

        <p className="prose-body measure">
          Three controllers, because a swerve drivetrain can move in three
          directions independently. X and Y each need their own, and heading
          needs a third so the robot can turn to face the right way while it is
          still driving. One controller per direction is the whole reason a
          swerve robot can arrive already pointed correctly.
        </p>

        <p className="prose-body-sm measure">
          <strong>Visible result:</strong> a compile error on{" "}
          <code>DriveToPoint</code> — <code>ClassicCommand</code> has no
          no-argument constructor, so the class will not compile until step 4
          adds one. Three imports are also grayed out as unused. All of it goes
          away as you keep going.
        </p>

        {/* step 3 */}
        <h3 className="display m-0 text-aside" style={{ marginBottom: "-8px" }}>
          3. Add the drive request
        </h3>

        <p className="prose-body measure">
          This is the object that carries your three numbers to the drivetrain.
          It gets built once, as a field, and reused every loop.
        </p>

        <CodeBlock
          language="java"
          title="DriveToPoint.java — a fourth field, under the controllers"
          code={`  // A field-relative velocity request. Blue-origin, to match the odometry pose (which is also
  // always blue-origin). Open-loop drive, so there is no wheel PID to tune.
  private final SwerveRequest.ApplyFieldVelocity driveRequest =
      new SwerveRequest.ApplyFieldVelocity()
          .withForwardPerspective(SwerveRequest.ForwardPerspectiveValue.BlueAlliance)
          .withDriveRequestType(DriveRequestType.OpenLoopVoltage);`}
        />

        <p className="prose-body measure">
          Two settings on that request, and both matter:
        </p>

        <ul
          className="ml-5 list-disc space-y-2"
          style={{ color: "var(--tx2)" }}
        >
          <li>
            <code>ForwardPerspectiveValue.BlueAlliance</code> — the velocities
            you send are measured from the same corner the pose is measured
            from. A human driver needs the opposite treatment, which is why{" "}
            <code>DriveMechanism</code>&apos;s constructor keeps{" "}
            <code>drivetrain::applyOperatorPerspective</code> running every loop
            — its comment on the branch reads{" "}
            <em>
              &quot;check which alliance we are on so &lsquo;forward&rsquo;
              faces the right way.&quot;
            </em>{" "}
            Right for a person, wrong for a controller: the numbers coming out
            of your three PIDs are already in field coordinates, and re-rotating
            them would send the robot the wrong way on one alliance.
          </li>
          <li>
            <code>DriveRequestType.OpenLoopVoltage</code> — the speeds you send
            are turned straight into motor voltage. There is no second PID loop
            on the wheels underneath this one.
          </li>
        </ul>

        <p className="prose-body-sm measure">
          <strong>Visible result:</strong> the <code>SwerveRequest</code> and{" "}
          <code>DriveRequestType</code> imports stop being grayed out.{" "}
          <code>ChassisVelocities</code> is still unused until step 6, and the
          class itself still will not compile.
        </p>

        {/* step 4 */}
        <h3 className="display m-0 text-aside" style={{ marginBottom: "-8px" }}>
          4. The constructor
        </h3>

        <CodeBlock
          language="java"
          title="DriveToPoint.java — the constructor"
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

        <p className="prose-body measure">
          <code>this.drivetrain = drivetrain;</code> looks like it does nothing.
          It is copying the constructor&apos;s parameter into the field of the
          same name — <code>this.</code> means &quot;the field on this
          object,&quot; and the bare name means &quot;the parameter that was
          passed in.&quot; After the constructor ends the parameter is gone; the
          field is what <code>execute()</code> reads two steps from now.
        </p>

        <Split>
          <ProseBlock>
            <p>
              <code>enableContinuousInput(-Math.PI, Math.PI)</code> tells the
              heading controller that its two ends are the same place, so it
              takes the short route. <code>Math.PI</code> is 3.14159…, half a
              turn in radians — this controller works in radians throughout, not
              degrees. The X and Y controllers get no such call, and should not.
              Meters do not wrap.
            </p>
          </ProseBlock>
          <MarginNote label="WHAT GOES WRONG WITHOUT IT">
            Angles wrap around and plain subtraction does not know that. A robot
            at 179° asked to reach −179° has a real error of 2°, but{" "}
            <code>−179 − 179</code> is −358, so an untreated controller spins
            the robot almost all the way around the long way.
          </MarginNote>
        </Split>

        <p className="prose-body-sm measure">
          <strong>Visible result:</strong> the file compiles for the first time.
          The command exists, requires the drivetrain, and does absolutely
          nothing — every inherited method is still empty.
        </p>

        {/* step 5 */}
        <h3 className="display m-0 text-aside" style={{ marginBottom: "-8px" }}>
          5. <code>initialize()</code> — clear the controllers
        </h3>

        <CodeBlock
          language="java"
          title="DriveToPoint.java — initialize()"
          code={`  @Override
  protected void initialize() {
    xController.reset();
    yController.reset();
    headingController.reset();
  }`}
        />

        <p className="prose-body measure">
          A <code>PIDController</code> remembers things between calls — an
          accumulated error for the I term, and the previous error for the D
          term. These three controllers are fields, so the same objects get used
          again the next time the command is scheduled. Without{" "}
          <code>reset()</code>, run number two starts with run number one&apos;s
          leftovers.
        </p>

        <p className="prose-body-sm measure">
          <strong>Visible result:</strong> none. With kI and kD both at zero on
          all three controllers there is nothing stored to clear yet — this line
          is what keeps the command correct the day someone adds a D term.
        </p>

        {/* step 6 */}
        <h3 className="display m-0 text-aside" style={{ marginBottom: "-8px" }}>
          6. <code>execute()</code> — the whole control loop
        </h3>

        <CodeBlock
          language="java"
          title="DriveToPoint.java — execute()"
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

        <p className="prose-body measure">
          <code>calculate(measurement, setpoint)</code> takes where you are and
          where you want to be, in that order, and hands back a number. With kI
          and kD at zero that number is exactly{" "}
          <code>kP × (setpoint − measurement)</code>. Three calls, three
          numbers, and all three are speeds.
        </p>

        <p className="prose-body measure">
          <code>ChassisVelocities</code> is the container for those three:{" "}
          <code>vx</code> in meters per second down the field, <code>vy</code>{" "}
          in meters per second to the left, and <code>omega</code> in radians
          per second counter-clockwise. It replaced the older name{" "}
          <code>ChassisSpeeds</code> — if an example you find online uses that,
          it is written for an older WPILib.
        </p>

        <p className="prose-body-sm measure">
          <strong>Visible result:</strong> still nothing on the robot. The
          command is complete enough to drive, but nothing schedules it yet —
          that is step 9.
        </p>

        {/* step 7 */}
        <h3 className="display m-0 text-aside" style={{ marginBottom: "-8px" }}>
          7. <code>isFinished()</code> — and why it returns false
        </h3>

        <CodeBlock
          language="java"
          title="DriveToPoint.java — isFinished()"
          code={`  @Override
  protected boolean isFinished() {
    // Runs until something interrupts it (like letting go of the button). To make it stop at
    // the goal instead, return:
    // xController.atSetpoint() && yController.atSetpoint() && headingController.atSetpoint();
    return false;
  }`}
        />

        <p className="prose-body measure">
          Copy the commented-out line along with the rest. It is the
          branch&apos;s own note to the reader, and it is a real option:{" "}
          <code>atSetpoint()</code> asks a controller whether its latest error
          is inside a tolerance. The default tolerance is <strong>0.05</strong>,
          in whatever unit that controller works in — so 5 cm for X and Y, and
          0.05 radians, about 2.9°, for heading. Change it with{" "}
          <code>setTolerance(...)</code>.
        </p>

        <Box
          variant="alert-warning"
          tag="THE ONE RULE"
          title="This command never ends, so nothing may wait on it"
        >
          <p>
            <code>return false</code> means exactly what it says. The command
            keeps running until something takes the drivetrain away from it, and
            on this branch that something is the driver releasing the button.
          </p>
          <p className="mt-3">
            Which means <code>new DriveToPoint(...)</code> cannot be a step
            inside <code>Command.sequence(...)</code>. Drop it in one and the
            sequence sticks on that leg forever — the same trap as a bare hold,
            for the same reason. Autonomous routines are sequences, so this
            command is not usable in autonomous yet. The next lesson fixes that
            by giving it a real finish line.
          </p>
        </Box>

        <p className="prose-body-sm measure">
          <strong>Visible result:</strong> no change. <code>false</code> is what{" "}
          <code>ClassicCommand</code> already returns by default — writing it
          out is a statement of intent for whoever reads the file next.
        </p>

        {/* step 8 */}
        <h3 className="display m-0 text-aside" style={{ marginBottom: "-8px" }}>
          8. <code>end()</code> — stop the drivetrain
        </h3>

        <CodeBlock
          language="java"
          title="DriveToPoint.java — end(boolean)"
          code={`  /** Stops the drivetrain. Runs when the command finishes or gets interrupted. */
  @Override
  protected void end(boolean interrupted) {
    drivetrain.setControl(new SwerveRequest.Idle());
  }`}
        />

        <Box variant="concept" title="Why this line is not optional">
          <p>
            In the Autonomous lesson you saw that canceling a command does{" "}
            <em>not</em> stop a motor. Canceling ends the command; the hardware
            keeps doing whatever it was last told to do.
          </p>
          <p className="mt-3">
            In teleop you would probably get away without this line, because the
            drivetrain has a real default command — the joystick drive that{" "}
            <code>TeleopOpMode</code> sets — and it takes the drivetrain back
            the instant <code>DriveToPoint</code> is canceled. With the sticks
            centered, that default commands a stop.
          </p>
          <p className="mt-3">
            Do not lean on it. That default belongs to one OpMode. Schedule this
            command anywhere without it and nothing claims the drivetrain, so{" "}
            <code>Mechanism.idle()</code> takes over at the lowest priority —
            and <code>idle()</code> sends no output at all and does not zero the
            last request, so Phoenix keeps applying the last velocity it was
            given. <code>new SwerveRequest.Idle()</code> is a real request that
            says &quot;stop,&quot; and putting it in <code>end()</code> means
            the command stops the robot itself instead of hoping something else
            will.
          </p>
        </Box>

        <p className="prose-body-sm measure">
          <strong>Visible result:</strong> the file is done at 87 lines. Nothing
          on the robot yet — one step to go.
        </p>

        {/* step 9 */}
        <h3 className="display m-0 text-aside" style={{ marginBottom: "-8px" }}>
          9. Bind it to two buttons
        </h3>

        <p className="prose-body measure">
          Bindings go in the <code>TeleopOpMode</code> constructor, below the
          left-bumper binding that is already there. Three new imports at the
          top of that file.
        </p>

        <CodeBlock
          language="java"
          title="TeleopOpMode.java — three imports and two bindings"
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

        <Split>
          <ProseBlock>
            <p>
              <code>whileTrue</code>, because this command never finishes on its
              own — press and hold, release and it is canceled. No paired{" "}
              <code>whileFalse</code> this time; <code>end()</code> already
              sends the stop request.
            </p>
          </ProseBlock>
          <MarginNote label="A HOLD THE BRANCH DOES NOT LABEL">
            By the naming convention from Classic Commands, a command that never
            finishes should carry a <code>(hold)</code> suffix, so this one
            would be <code>DriveToPoint (hold)</code>. The branch names it{" "}
            <code>&quot;DriveToPoint&quot;</code> and leaves it there. Worth
            noticing rather than copying — the next lesson gives this command a
            real ending, at which point the suffix would be wrong anyway.
          </MarginNote>
        </Split>

        <p className="prose-body-sm measure">
          <strong>Visible result:</strong> the robot moves on its own for the
          first time. Full checks are below.
        </p>
      </LessonSection>

      {/* ── two loops ────────────────────────────────────────────────── */}
      <LessonSection
        id="this-is-not-the-pid-you"
        title="This is not the PID you tuned on the arm"
      >
        <p className="prose-body measure">
          Same three letters, different loop, different everything else. Mixing
          them up is the most common confusion at this point in the course, so
          here they are side by side.
        </p>

        <div className="overflow-x-auto">
          <table className="w-full border-collapse text-note">
            <thead>
              <tr>
                <th
                  className="border px-3 py-2 text-left"
                  style={{
                    borderColor: "var(--rule)",
                    color: "var(--tx)",
                    background: "var(--bg2)",
                  }}
                >
                  &nbsp;
                </th>
                <th
                  className="border px-3 py-2 text-left"
                  style={{
                    borderColor: "var(--rule)",
                    color: "var(--tx)",
                    background: "var(--bg2)",
                  }}
                >
                  <code>config.Slot0.kP</code> (PID Control)
                </th>
                <th
                  className="border px-3 py-2 text-left"
                  style={{
                    borderColor: "var(--rule)",
                    color: "var(--tx)",
                    background: "var(--bg2)",
                  }}
                >
                  <code>new PIDController(...)</code> (here)
                </th>
              </tr>
            </thead>
            <tbody style={{ color: "var(--tx2)" }}>
              <tr>
                <td
                  className="border px-3 py-2 font-semibold"
                  style={{ borderColor: "var(--rule)" }}
                >
                  Runs on
                </td>
                <td
                  className="border px-3 py-2"
                  style={{ borderColor: "var(--rule)" }}
                >
                  the TalonFX itself, at its own high rate
                </td>
                <td
                  className="border px-3 py-2"
                  style={{ borderColor: "var(--rule)" }}
                >
                  your code, once per scheduler loop
                </td>
              </tr>
              <tr>
                <td
                  className="border px-3 py-2 font-semibold"
                  style={{ borderColor: "var(--rule)" }}
                >
                  Error is in
                </td>
                <td
                  className="border px-3 py-2"
                  style={{ borderColor: "var(--rule)" }}
                >
                  rotations of one mechanism
                </td>
                <td
                  className="border px-3 py-2"
                  style={{ borderColor: "var(--rule)" }}
                >
                  meters, or radians of heading
                </td>
              </tr>
              <tr>
                <td
                  className="border px-3 py-2 font-semibold"
                  style={{ borderColor: "var(--rule)" }}
                >
                  Output is
                </td>
                <td
                  className="border px-3 py-2"
                  style={{ borderColor: "var(--rule)" }}
                >
                  volts, for one motor
                </td>
                <td
                  className="border px-3 py-2"
                  style={{ borderColor: "var(--rule)" }}
                >
                  a velocity, for the whole chassis
                </td>
              </tr>
              <tr>
                <td
                  className="border px-3 py-2 font-semibold"
                  style={{ borderColor: "var(--rule)" }}
                >
                  Configured by
                </td>
                <td
                  className="border px-3 py-2"
                  style={{ borderColor: "var(--rule)" }}
                >
                  a Phoenix config object, applied once at startup
                </td>
                <td
                  className="border px-3 py-2"
                  style={{ borderColor: "var(--rule)" }}
                >
                  a constructor argument, in Java
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        <p className="prose-body measure">
          So <code>kP = 10</code> here reads as{" "}
          <em>
            ten meters per second of commanded speed for every meter of error
          </em>
          , and <code>kP = 7</code> on heading reads as{" "}
          <em>seven radians per second for every radian of error</em>. Those are
          the units the branch comment is describing when it says &quot;meters
          per second of speed for every meter of error.&quot;
        </p>

        <p className="prose-body measure">
          Usually these two loops are stacked — an outer loop picks a speed and
          an inner loop on each motor delivers it. Not here.{" "}
          <code>DriveRequestType.OpenLoopVoltage</code> turns the requested
          speed straight into voltage, so there is exactly one PID loop in this
          system and it is the one you wrote.
        </p>
      </LessonSection>

      {/* ── no limit ─────────────────────────────────────────────────── */}
      <LessonSection
        id="nothing-in-that-file-limits-the"
        title="Nothing in that file limits the speed"
      >
        <p className="prose-body measure">
          Do the arithmetic on <code>kP = 10</code>. Three meters from the
          target, <code>execute()</code> asks the drivetrain for{" "}
          <strong>30 m/s</strong>. The checked-in{" "}
          <code>TunerConstants.java</code> puts the example drivetrain&apos;s
          top speed at <code>kSpeedAt12Volts = 4.54</code> m/s. The request is
          more than six times what the robot can do, and there is no line
          anywhere in the file that trims it.
        </p>

        <p className="prose-body measure">
          What that feels like: full power off the line for most of the trip,
          then a sharp falloff in the last half meter as the error finally
          shrinks below 0.454 m. The robot lurches away and crawls in. It works,
          and it looks bad.
        </p>

        <Box
          variant="alert-warning"
          tag="NOTE · UNTUNED"
          title="10 / 10 / 7 are the branch's numbers, and they are marked TODO"
        >
          <p>
            The file&apos;s own comment ends{" "}
            <code>TODO: tune these for your drivetrain</code>. Nobody measured
            these for your robot. The next branch drops them to{" "}
            <strong>3.0 / 3.0 / 4.0</strong> — not because 10 was wrong, but
            because once a plan supplies the speed, PID only has centimeters
            left to correct. Those numbers are marked <code>TODO: tune</code> as
            well.
          </p>
          <p className="mt-3">
            On real hardware, test in a clear space with room in every
            direction, and keep a hand on the disable. A gain this large turns a
            wrong pose into a fast wrong move.
          </p>
        </Box>

        <CollapsibleSection title="Optional: a speed clamp you can add today">
          <p>
            This is <strong>not</strong> on <code>5-DriveToPoint</code>. Add it
            if you want a seatbelt on real hardware before the next lesson
            replaces it properly. Two imports —{" "}
            <code>import static org.wpilib.units.Units.MetersPerSecond;</code>{" "}
            and <code>import frc.robot.generated.TunerConstants;</code> — plus:
          </p>
          <div className="mt-3">
            <CodeBlock
              language="java"
              hideControls
              code={`// The example drivetrain's top speed, straight out of TunerConstants.
private final double maxSpeed = TunerConstants.kSpeedAt12Volts.in(MetersPerSecond);

private static double clamp(double value, double limit) {
  return Math.max(-limit, Math.min(limit, value));
}

// ... then in execute(), wrap the two translation terms:
double vx = clamp(xController.calculate(currentPose.getX(), targetPose.getX()), maxSpeed);
double vy = clamp(yController.calculate(currentPose.getY(), targetPose.getY()), maxSpeed);`}
            />
          </div>
          <p className="mt-3">
            A clamp stops the command asking for the impossible, but it does not
            make the motion good — the robot still runs flat out until the last
            moment. The real answer is to work out the whole trip in advance,
            which is the next lesson.
          </p>
        </CollapsibleSection>
      </LessonSection>

      {/* ── the files ────────────────────────────────────────────────── */}
      <LessonSection id="the-whole-thing" title="The whole thing">
        <p className="prose-body measure">
          <code>DriveToPoint.java</code> in full — 87 lines, and you have now
          seen every one of them.
        </p>

        <GitHubContent
          repository="Hemlock5712/Workshop-Code"
          filePath="src/main/java/frc/robot/commands/DriveToPoint.java"
          branch="5-DriveToPoint"
          pr={{ number: 11, focusFile: "DriveToPoint.java" }}
        />

        <Box
          variant="alert-info"
          tag="NOTE · THE DIFF TAB"
          title="PR #11 shows more than this lesson"
        >
          <p>
            Because the PR&apos;s base is <code>2-Logging</code>, the{" "}
            <strong>GitHub Changes</strong> tab folds in the entire Limelight
            lesson alongside this one. Six files: four added, two edited.
          </p>
          <p className="mt-3">
            <strong>This lesson:</strong>{" "}
            <code>commands/DriveToPoint.java</code> and{" "}
            <code>utils/ClassicCommand.java</code> added, plus the two new
            bindings in <code>opmodes/TeleopOpMode.java</code>.{" "}
            <strong>The vision lesson:</strong>{" "}
            <code>LimelightHelpers.java</code> and{" "}
            <code>subsystems/Limelight.java</code> added, plus the{" "}
            <code>Limelight.registerAll(...)</code> line in{" "}
            <code>Robot.java</code>.
          </p>
        </Box>

        <p className="prose-body measure">
          And the helper class you copied in at step 1:
        </p>

        <GitHubContent
          repository="Hemlock5712/Workshop-Code"
          filePath="src/main/java/frc/robot/utils/ClassicCommand.java"
          branch="5-DriveToPoint"
        />
      </LessonSection>

      {/* ── did it work ──────────────────────────────────────────────── */}
      <LessonSection id="did-it-work" title="Did it work?">
        <ol
          className="ml-5 list-decimal space-y-3"
          style={{ color: "var(--tx2)" }}
        >
          <li>
            Start the simulator and enable Teleop.{" "}
            <strong>{"You should see: "}</strong> the robot sitting still,
            joysticks working as they have since Swerve Setup.
          </li>
          <li>
            Drive a few meters away from where it started with the left stick,
            and turn it with the right. Then hold <strong>A</strong>.{" "}
            <strong>{"You should see: "}</strong> the robot drive itself back
            toward where it began and rotate to 0° on the way — not spin first
            and drive second. Both happen at once, which is what three
            independent controllers buy you.
          </li>
          <li>
            While still holding <strong>A</strong>, push the left stick.{" "}
            <strong>{"You should see: "}</strong> nothing.{" "}
            <code>DriveToPoint</code> requires the drivetrain, so it outranks
            the joystick default command for as long as it runs. The sticks come
            back the moment you release.
          </li>
          <li>
            Release <strong>A</strong> halfway through the trip, with the sticks
            centered. <strong>{"You should see: "}</strong> the robot stop, not
            coast on at its last speed. Two things make that happen —{" "}
            <code>end(true)</code> sends <code>SwerveRequest.Idle</code>, and
            the joystick default command takes the drivetrain back and asks for
            nothing.
          </li>
          <li>
            Hold <strong>B</strong>. <strong>{"You should see: "}</strong> the
            robot drive to (3, 2) and turn to 180°.
          </li>
          <li>
            Keep holding <strong>B</strong> after it arrives.{" "}
            <strong>{"You should see: "}</strong> the robot sit on the target
            and <em>keep working</em> — small corrections, never handing the
            drivetrain back. Correct behavior, not a bug:{" "}
            <code>isFinished()</code> returns <code>false</code>, so the only
            way out is the button.
          </li>
          <li>
            Open Glass or AdvantageScope and graph <code>Drivetrain/Pose</code>{" "}
            for that run. <strong>{"You should see: "}</strong> X settle near 3,
            Y near 2, heading near 180°. How near is the tuning conversation.
          </li>
          <li>
            Graph <code>Drivetrain/TranslationSpeedMps</code> for the same run.{" "}
            <strong>{"You should see: "}</strong> speed jump almost immediately
            to whatever the drivetrain can do, hold there, then fall off steeply
            at the end. That shape is the missing speed limit from the section
            above, drawn out. The next lesson turns it into a trapezoid.
          </li>
        </ol>

        <Box
          variant="alert-info"
          tag="IF IT DIDN'T WORK"
          title="Confidently wrong, creeping in forever, or not compiling"
        >
          <ul className="ml-4 list-disc space-y-3">
            <li>
              <strong>
                The robot drives off confidently in the wrong direction.
              </strong>{" "}
              Almost always the pose, not the command — the robot is driving
              correctly toward where it believes the target is. In the simulator
              that means odometry started counting somewhere you did not expect;
              on a real field it means nothing seeded the pose. Graph{" "}
              <code>Drivetrain/Pose</code> before you touch a gain. If the pose
              looks right and the robot still goes sideways, check that the
              request has{" "}
              <code>
                .withForwardPerspective(ForwardPerspectiveValue.BlueAlliance)
              </code>{" "}
              — with the operator perspective the velocities get re-rotated to
              match the driver&apos;s view of the field.
            </li>
            <li>
              <strong>
                It gets close, then creeps in and never quite arrives.
              </strong>{" "}
              Expected on this branch. Ten centimeters of error asks for 1 m/s;
              one centimeter asks for 10 cm/s, and at some point the request is
              too small to overcome friction and the robot stalls short. There
              is no I term to grind out that last bit. Nothing here is broken —
              this is one of the two problems the next lesson exists to fix.
            </li>
            <li>
              <strong>It will not compile.</strong> Three usual causes. (a){" "}
              <code>cannot find symbol: ChassisSpeeds</code> — the class is{" "}
              <code>ChassisVelocities</code> in this stack, from{" "}
              <code>org.wpilib.math.kinematics</code>. (b) You wrote{" "}
              <code>.named(&quot;DriveToPoint&quot;)</code> on the new command;{" "}
              <code>Command</code> has no such method, and the name comes from{" "}
              <code>super(...)</code>. (c) An error pointing at the class
              declaration itself, which means the constructor is missing or its{" "}
              <code>super(...)</code> call is not the first line in it.
            </li>
          </ul>
        </Box>
      </LessonSection>

      {/* ── what's next ──────────────────────────────────────────────── */}
      <LessonSection id="two-problems-left-over" title="Two problems left over">
        <p className="prose-body measure">
          You have a robot that drives itself to a spot on the field. It has two
          faults, and they are the same fault seen from two directions:
        </p>

        <ul
          className="ml-5 list-disc space-y-2"
          style={{ color: "var(--tx2)" }}
        >
          <li>
            <strong>The motion is ugly.</strong> The controller has no idea what
            the robot can physically do, so it asks for the impossible and gets
            whatever the hardware can give.
          </li>
          <li>
            <strong>It never ends.</strong> Which keeps it out of{" "}
            <code>Command.sequence(...)</code>, and therefore out of every
            autonomous routine.
          </li>
        </ul>

        <p>
          <strong>Profiled Drive to Point</strong> changes one file and both
          faults go away. Instead of turning distance into speed, the command
          works out the entire trip before the robot moves — speed up, cruise,
          slow down — and then follows it. PID stops being the driver and
          becomes a small correction on top, which is why the gains drop from 10
          / 10 / 7 to 3.0 / 3.0 / 4.0 (also marked <code>TODO: tune</code> on
          that branch). And because the plan knows how long the trip takes, the
          command finally has a finish line.
        </p>

        <DocumentationButton
          href="https://github.com/Hemlock5712/Workshop-Code/pull/11"
          title="PR #11 — 5 drive to point"
          icon={<GitBranch className="w-5 h-5" />}
        />
      </LessonSection>

      <AlphaStatusNote />

      <Quiz
        questions={[
          {
            id: 1,
            question:
              "DriveToPoint uses three PID controllers rather than one. Why three?",
            options: [
              "One per swerve module, minus the fourth",
              "A swerve drivetrain moves in X, Y and rotation independently, so each direction gets its own controller",
              "Three controllers average out sensor noise",
              "One controller cannot handle a value as large as a field coordinate",
            ],
            correctAnswer: 1,
            explanation:
              "X, Y and heading are three independent degrees of freedom. Giving each its own controller is what lets the robot close the distance and turn to the goal heading at the same time, instead of driving and then spinning.",
          },
          {
            id: 2,
            question:
              "In a ClassicCommand, which method runs once when the command starts, and which runs every loop?",
            options: [
              "execute() once at the start, initialize() every loop",
              "initialize() once at the start, execute() every loop",
              "Both run every loop; initialize() is only a naming convention",
              "initialize() runs once when the robot boots, execute() once per command",
            ],
            correctAnswer: 1,
            explanation:
              "initialize() runs once when the command is scheduled — in DriveToPoint it resets the three controllers. execute() runs every loop while the command is active, and isFinished() is checked right after it each time.",
          },
          {
            id: 3,
            question:
              "end(boolean interrupted) is where the drivetrain gets stopped. When does it run?",
            options: [
              "Only when isFinished() returns true",
              "Only when another command interrupts this one",
              "Both — the boolean tells you which case happened",
              "Every loop, after execute()",
            ],
            correctAnswer: 2,
            explanation:
              "It runs on a natural finish and on an interrupt, with interrupted set to false or true accordingly. That is exactly why cleanup belongs there: no path out of the command skips it.",
          },
          {
            id: 4,
            question:
              "Why does the command send new SwerveRequest.Idle() in end() instead of relying on the command being canceled?",
            options: [
              "Canceling stops the command, not the hardware — and if no default command claims the drivetrain, idle() sends no output and does not zero the last request",
              "SwerveRequest.Idle() puts the motors in brake mode",
              "It resets the odometry pose back to zero",
              "The scheduler requires every command to send a final request",
            ],
            correctAnswer: 0,
            explanation:
              "Canceling ends the command; the hardware keeps doing whatever it was last told. In teleop the joystick default command happens to take the drivetrain back and ask for nothing, but that default belongs to one OpMode. Without it, Mechanism.idle() takes over at the lowest priority and issues nothing at all, so Phoenix keeps applying the last velocity. Sending Idle in end() makes the command responsible for stopping itself.",
          },
          {
            id: 5,
            question:
              "isFinished() returns false on this branch. What follows from that?",
            options: [
              "The command runs until the driver releases the button, and it cannot be a step inside Command.sequence(...)",
              "The command finishes as soon as the robot is within tolerance",
              "The command will not compile until you give it a real condition",
              "The command runs for exactly one scheduler loop",
            ],
            correctAnswer: 0,
            explanation:
              "A command that never finishes hangs any sequence it is placed in. That is what keeps this version out of autonomous routines, and it is one of the two things the next lesson fixes.",
          },
          {
            id: 6,
            question:
              "The drive request is built with ForwardPerspectiveValue.BlueAlliance. Why not the operator perspective the driver's joystick request uses?",
            options: [
              "The operator perspective is slower to compute",
              "Odometry poses are always blue-origin, so the velocities have to be in that frame too — the operator perspective flips on red and would send the robot the wrong way",
              "Blue alliance robots need different gains",
              "The operator perspective only works while a driver is holding a stick",
            ],
            correctAnswer: 1,
            explanation:
              "getPose() is always measured from the blue alliance corner and never flips. The PID output is computed from that pose, so it must be sent in the same frame. The operator perspective exists for humans, whose idea of forward changes with the alliance.",
          },
          {
            id: 7,
            question:
              'Where does the string "DriveToPoint" come from — the name that shows up in telemetry?',
            options: [
              "The class name; the framework reads it automatically",
              'A .named("DriveToPoint") call on the finished command',
              'The super("DriveToPoint", drivetrain) call in the constructor, which also declares the required mechanism',
              "The @Teleop annotation on the OpMode that binds it",
            ],
            correctAnswer: 2,
            explanation:
              "A ClassicCommand takes its name and its requirements from the super(...) call. .named(...) belongs to the builder stage returned by run(...) / runRepeatedly(...) / the group factories — a finished Command does not have it, so calling it here would not compile.",
          },
          {
            id: 8,
            question:
              "kP = 10 on the X controller and the target is 3 meters away. What velocity does execute() ask for on that axis?",
            options: [
              "3 m/s — the controller caps itself at the error",
              "30 m/s, which is far past what the drivetrain can do; nothing in the file limits it",
              "4.54 m/s, the drivetrain's top speed",
              "0.3 m/s — kP divides the error",
            ],
            correctAnswer: 1,
            explanation:
              "With kI and kD at zero the output is kP times the error: 10 × 3 = 30 m/s, against a top speed of 4.54 m/s in the checked-in TunerConstants. The robot runs flat out for most of the trip and then falls off steeply. Clamping helps a little; planning the trip, next lesson, is the real fix.",
          },
        ]}
      />
    </PageTemplate>
  );
}
