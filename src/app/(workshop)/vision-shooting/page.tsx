import PageTemplate from "@/components/PageTemplate";
import { MarginNote, ProseBlock, Split } from "@/components/lesson/Prose";
import LessonSection from "@/components/lesson/LessonSection";
import AlphaStatusNote from "@/components/AlphaStatusNote";
import KeyConceptSection from "@/components/KeyConceptSection";
import Box from "@/components/Box";
import CollapsibleSection from "@/components/CollapsibleSection";
import CodeBlock from "@/components/CodeBlock";
import GitHubContent from "@/components/GitHubContent";
import DocumentationButton from "@/components/DocumentationButton";
import Quiz from "@/components/Quiz";
import { GitBranch } from "lucide-react";

export default function DynamicFlywheel() {
  return (
    <PageTemplate
      title="Let the robot pick its own shooting speed"
      emphasis="its own shooting speed"
      lede="A flywheel that always spins at one speed only scores from one spot on the field. Every other shot is either short or long, so the driver has to hunt for the sweet spot before every shot."
      needs={[
        <>
          The vision setup from <strong>Vision</strong>. Branch{" "}
          <code>4-DynamicFlywheel</code> is one commit off{" "}
          <code>3-Limelight</code>.
        </>,
        <>
          Odometry you trust, from <strong>Swerve Calibration</strong>. This
          whole lesson is arithmetic on the robot&apos;s reported position. If
          that position is wrong, every speed the table hands back is wrong too,
          and nothing on this page will tell you so.
        </>,
        <>
          A flywheel on the bench: two Krakens, CAN IDs <strong>21</strong> and{" "}
          <strong>22</strong>, on the CANivore. You met this mechanism in
          Workshop&nbsp;#1 — the same two motors on the same CAN IDs, and the
          distance lookup is the new part.
        </>,
      ]}
      branch="4-DynamicFlywheel"
      time="about 40 minutes to type in"
    >
      <Split>
        <KeyConceptSection
          description={[
            "The drivetrain already knows roughly where it is on the field. So the flywheel can ask it, work out how far away the goal is, and look up the speed that works at that distance — every loop, while the robot is still moving.",
          ]}
          concept="A lookup table turns a handful of measured shots into a speed for every distance in between."
        />
        <MarginNote label="WHAT YOU'LL BUILD">
          A <code>Flywheel</code> mechanism that reads the drivetrain&apos;s
          pose, measures the distance to a fixed field point, and sets its speed
          from a lookup table, bound to the A button. Typing it in and watching
          the numbers move is the short part. Filling the table with speeds that
          actually score is a separate session, on a real field, with a pile of
          game pieces — more on that below.
        </MarginNote>
      </Split>

      <Box
        variant="alert-warning"
        tag="OPTIONAL · DEAD-END BRANCH"
        title="Read this before you start typing"
      >
        <p>
          This lesson is a side trip, and the branch it teaches is a dead end.{" "}
          <code>4-DynamicFlywheel</code> sits <strong>one commit</strong> on top
          of <code>3-Limelight</code>. Nothing after it builds on it.
        </p>
        <p className="mt-3">
          The next lesson, <strong>Drive to Point</strong>, uses{" "}
          <code>5-DriveToPoint</code> — and that branch forks off{" "}
          <code>2-Logging</code> instead. Compare the two and git reports them
          as <em>diverged</em>: ahead 1, behind 2. Its <code>subsystems/</code>{" "}
          folder holds exactly three files —{" "}
          <code>CommandSwerveDrivetrain.java</code>,{" "}
          <code>DriveMechanism.java</code> and <code>Limelight.java</code>.{" "}
          <strong>
            No <code>Flywheel.java</code>. No{" "}
            <code>utils/TalonFXUtil.java</code>.
          </strong>
        </p>
        <p className="mt-3">
          Check out <code>5-DriveToPoint</code> after this lesson and the
          flywheel you built disappears. That is not a mistake in your work — it
          is how the repository is laid out. Two ways to keep it:
        </p>
        <ul className="ml-4 mt-3 list-disc space-y-1">
          <li>
            Stay on <code>4-DynamicFlywheel</code> until you are finished
            playing with it, and clone a second copy of the repository for the
            next lesson.
          </li>
          <li>
            Or commit your work on a branch of your own before you switch:{" "}
            <code>git switch -c my-flywheel</code>, then <code>git add -A</code>{" "}
            and <code>git commit</code>. It will still be there when you come
            back.
          </li>
        </ul>
        <p className="mt-3">
          Skipping this page breaks nothing later. It is here because the idea
          is worth knowing, not because anything depends on it.
        </p>
      </Box>

      {/* ── THE IDEA ─────────────────────────────────────────────────── */}
      <LessonSection
        id="four-measurements-every-distance-in-between"
        title="Four measurements, every distance in between"
      >
        <p>
          You cannot measure the right flywheel speed at every possible
          distance. There are infinitely many distances and one afternoon of
          practice time. So you measure a few, write them down, and let the code
          fill in the gaps.
        </p>

        <p>
          <code>InterpolatingDoubleTreeMap</code> is the WPILib class that does
          the filling in. You hand it pairs — a distance and the speed that
          works at that distance — and ask it for any distance you like. Between
          two rows it draws a straight line and reads the answer off it. That is
          all &quot;linear interpolation&quot; means.
        </p>

        <p>
          These are the four pairs the branch ships, in meters and rotations per
          second:
        </p>

        <div className="overflow-x-auto">
          <table className="w-full min-w-[520px] border-collapse text-note">
            <thead>
              <tr>
                <th
                  className="border-b px-3 py-2 text-left font-semibold"
                  style={{ borderColor: "var(--line)", color: "var(--fg)" }}
                >
                  Distance (m)
                </th>
                <th
                  className="border-b px-3 py-2 text-left font-semibold"
                  style={{ borderColor: "var(--line)", color: "var(--fg)" }}
                >
                  Speed (rot/s)
                </th>
                <th
                  className="border-b px-3 py-2 text-left font-semibold"
                  style={{ borderColor: "var(--line)", color: "var(--fg)" }}
                >
                  Where the number comes from
                </th>
              </tr>
            </thead>
            <tbody style={{ color: "var(--tx2)" }}>
              <tr>
                <td
                  className="border-b px-3 py-2 align-top font-mono"
                  style={{ borderColor: "var(--line-soft)" }}
                >
                  0.0
                </td>
                <td
                  className="border-b px-3 py-2 align-top font-mono"
                  style={{ borderColor: "var(--line-soft)" }}
                >
                  0.0
                </td>
                <td
                  className="border-b px-3 py-2 align-top"
                  style={{ borderColor: "var(--line-soft)" }}
                >
                  In the table — <code>table.put(0.0, 0.0)</code>
                </td>
              </tr>
              <tr>
                <td
                  className="border-b px-3 py-2 align-top font-mono"
                  style={{ borderColor: "var(--line-soft)" }}
                >
                  1.0
                </td>
                <td
                  className="border-b px-3 py-2 align-top font-mono"
                  style={{ borderColor: "var(--line-soft)" }}
                >
                  10.0
                </td>
                <td
                  className="border-b px-3 py-2 align-top"
                  style={{ borderColor: "var(--line-soft)" }}
                >
                  In the table — <code>table.put(1.0, 10.0)</code>
                </td>
              </tr>
              <tr>
                <td
                  className="border-b px-3 py-2 align-top font-mono"
                  style={{ borderColor: "var(--line-soft)" }}
                >
                  1.5
                </td>
                <td
                  className="border-b px-3 py-2 align-top font-mono"
                  style={{ borderColor: "var(--line-soft)" }}
                >
                  20.0
                </td>
                <td
                  className="border-b px-3 py-2 align-top"
                  style={{ borderColor: "var(--line-soft)" }}
                >
                  <em>Not in the table.</em> Halfway between the two rows above,
                  so halfway between 10 and 30.
                </td>
              </tr>
              <tr>
                <td
                  className="border-b px-3 py-2 align-top font-mono"
                  style={{ borderColor: "var(--line-soft)" }}
                >
                  2.0
                </td>
                <td
                  className="border-b px-3 py-2 align-top font-mono"
                  style={{ borderColor: "var(--line-soft)" }}
                >
                  30.0
                </td>
                <td
                  className="border-b px-3 py-2 align-top"
                  style={{ borderColor: "var(--line-soft)" }}
                >
                  In the table — <code>table.put(2.0, 30.0)</code>
                </td>
              </tr>
              <tr>
                <td
                  className="border-b px-3 py-2 align-top font-mono"
                  style={{ borderColor: "var(--line-soft)" }}
                >
                  3.0
                </td>
                <td
                  className="border-b px-3 py-2 align-top font-mono"
                  style={{ borderColor: "var(--line-soft)" }}
                >
                  60.0
                </td>
                <td
                  className="border-b px-3 py-2 align-top"
                  style={{ borderColor: "var(--line-soft)" }}
                >
                  In the table — <code>table.put(3.0, 60.0)</code>
                </td>
              </tr>
              <tr>
                <td className="px-3 py-2 align-top font-mono">4.0</td>
                <td className="px-3 py-2 align-top font-mono">60.0</td>
                <td className="px-3 py-2 align-top">
                  <em>Past the last row.</em> The map stops at the edge — see
                  the warning below.
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        <Box
          variant="alert-warning"
          tag="WATCH OUT"
          title="Off the end of the table, the number stops changing"
        >
          <p>
            Ask for a distance further out than your last row and the map hands
            back the value at that last row. It does <strong>not</strong> keep
            the line going. With this table, 3.5 m, 4 m and 9 m all return{" "}
            <code>60.0</code>.
          </p>
          <p className="mt-3">
            That is the safe choice — an extrapolated speed at 9 meters would be
            a guess with nothing behind it. But it means a shot from beyond your
            furthest measured point is quietly wrong, and the robot gives no
            sign. Measure out to the furthest distance you ever plan to shoot
            from.
          </p>
        </Box>
      </LessonSection>

      {/* ── STEP 1 ───────────────────────────────────────────────────── */}
      <LessonSection id="add-the-two-new" title="Add the two new files">
        <p>
          This branch adds four files&apos; worth of changes on top of{" "}
          <code>3-Limelight</code>: two brand-new files, plus edits to{" "}
          <code>Robot.java</code> and <code>opmodes/TeleopOpMode.java</code>.
          Create the new ones first.
        </p>

        <ul className="ml-5 list-disc space-y-2">
          <li>
            <code>src/main/java/frc/robot/utils/TalonFXUtil.java</code> — a
            small helper. Phoenix&apos;s <code>apply(...)</code> sends a
            configuration to a motor once and reports whether it landed; it does
            not retry. This helper tries up to five times, which covers the
            short CAN hiccups that happen while a robot boots, and reports to
            the driver station if all five fail. The swerve track has not needed
            it until now.
          </li>
          <li>
            <code>src/main/java/frc/robot/subsystems/Flywheel.java</code> — the
            lesson.
          </li>
        </ul>

        <CollapsibleSection title="Read the helper: TalonFXUtil.java">
          <GitHubContent
            repository="Hemlock5712/Workshop-Code"
            branch="4-DynamicFlywheel"
            filePath="src/main/java/frc/robot/utils/TalonFXUtil.java"
            title="TalonFXUtil"
            description="Retries a TalonFX configuration up to five times, then reports a driver station error naming the device ID."
          />
        </CollapsibleSection>

        <h3 className="display measure m-0 text-title">
          The fields at the top of <code>Flywheel.java</code>
        </h3>

        <p>
          Everything below sits{" "}
          <strong>inside the class braces and above the constructor</strong>.
          These are field declarations — each one names a thing the mechanism
          owns for as long as the robot is on. None of them is a statement you
          could drop into a method.
        </p>

        <CodeBlock
          language="java"
          title="Flywheel.java — class declaration and fields"
          filename="src/main/java/frc/robot/subsystems/Flywheel.java"
          code={`public class Flywheel extends Mechanism {
  // Field point we are shooting at, blue-alliance origin (meters). TODO: set the real goal.
  private static final Translation2d TARGET = new Translation2d(3, 5);

  // PID + feedforward gains.
  private static final double kS = 0.0; // overcomes friction
  private static final double kV = 0.125; // volts per rotation-per-second
  private static final double kP = 0.0; // correction strength

  // Motion Magic limits: how fast the wheel may spin and how quickly it may speed up.
  private static final double MOTION_MAGIC_CRUISE_VELOCITY = 100.0; // top speed (rot/s)
  private static final double MOTION_MAGIC_ACCELERATION = 1000.0; // ramp rate (rot/s²)

  private final CANBus canivore = new CANBus("canivore");
  private final TalonFX leader = new TalonFX(21, canivore);
  private final TalonFX follower = new TalonFX(22, canivore);

  // Asks the motor to ramp to a target speed instead of jumping to it.
  private final MotionMagicVelocityVoltage velocityOut = new MotionMagicVelocityVoltage(0);

  private final DriveMechanism drivetrain;

  // distance (meters) -> flywheel speed (rotations/second). Gaps are filled in automatically.
  private final InterpolatingDoubleTreeMap table = new InterpolatingDoubleTreeMap();

  // Publish live numbers to NetworkTables. DataLogManager also records them to the log file.
  private final NetworkTable telemetry = NetworkTableInstance.getDefault().getTable("Flywheel");
  private final DoublePublisher distancePublisher =
      telemetry.getDoubleTopic("DistanceToTargetMeters").publish();
  private final DoublePublisher targetVelocityPublisher =
      telemetry.getDoubleTopic("TargetVelocityRps").publish();`}
        />

        <p>Three of those deserve a second look.</p>

        <ul className="ml-5 list-disc space-y-2">
          <li>
            <code>TARGET</code> is a <code>Translation2d</code> — an x and a y
            in meters, measured from the blue-alliance corner of the field, the
            same origin the pose uses. <code>(3, 5)</code> is a placeholder, and
            the branch says so in its own comment:{" "}
            <code>TODO: set the real goal</code>.
          </li>
          <li>
            <code>drivetrain</code> has no <code>= new ...</code> on it. There
            is only ever one drivetrain, and <code>Robot</code> already owns it,
            so the flywheel is handed the existing one in its constructor.
          </li>
          <li>
            The two <code>DoublePublisher</code>s are typed handles into
            NetworkTables. Creating them once up here is cheaper than looking
            the topic up every loop, and it means the names{" "}
            <code>Flywheel/DistanceToTargetMeters</code> and{" "}
            <code>Flywheel/TargetVelocityRps</code> are spelled in exactly one
            place. Logging is already running from the Logging lesson, so both
            numbers land in the <code>.wpilog</code> file with no extra work.
          </li>
        </ul>

        <p>
          <strong>{"You should see: "}</strong> Nothing yet — the file will not
          compile until it has a constructor. What you should see is red
          squiggles on the <em>imports</em> only if you typed a package name
          wrong. Grab the import block below if you want to be sure.
        </p>

        <CollapsibleSection title="The full import block, if you want to paste it">
          <CodeBlock
            language="java"
            hideControls
            code={`import static org.wpilib.units.Units.RotationsPerSecond;

import com.ctre.phoenix6.CANBus;
import com.ctre.phoenix6.configs.TalonFXConfiguration;
import com.ctre.phoenix6.controls.Follower;
import com.ctre.phoenix6.controls.MotionMagicVelocityVoltage;
import com.ctre.phoenix6.hardware.TalonFX;
import com.ctre.phoenix6.signals.InvertedValue;
import com.ctre.phoenix6.signals.MotorAlignmentValue;
import com.ctre.phoenix6.signals.NeutralModeValue;
import frc.robot.utils.TalonFXUtil;
import org.wpilib.command3.Command;
import org.wpilib.command3.Mechanism;
import org.wpilib.math.geometry.Translation2d;
import org.wpilib.math.interpolation.InterpolatingDoubleTreeMap;
import org.wpilib.networktables.DoublePublisher;
import org.wpilib.networktables.NetworkTable;
import org.wpilib.networktables.NetworkTableInstance;`}
          />
        </CollapsibleSection>
      </LessonSection>

      {/* ── STEP 2 ───────────────────────────────────────────────────── */}
      <LessonSection
        id="the-constructor-table-follower"
        title="The constructor: table, follower, configuration"
      >
        <p>
          The constructor runs once, when <code>Robot</code> builds the
          flywheel. Three jobs: fill the table, tell the second motor to copy
          the first, and push the gains down to the hardware.
        </p>

        <CodeBlock
          language="java"
          title="Flywheel.java — the constructor"
          filename="src/main/java/frc/robot/subsystems/Flywheel.java"
          code={`  public Flywheel(DriveMechanism drivetrain) {
    this.drivetrain = drivetrain;

    // Build the distance -> speed table. Tune these points with real test shots.
    table.put(0.0, 0.0);
    table.put(1.0, 10.0);
    table.put(2.0, 30.0);
    table.put(3.0, 60.0);

    // The follower copies the leader, spinning the opposite direction.
    follower.setControl(new Follower(leader.getDeviceID(), MotorAlignmentValue.Opposed));

    TalonFXConfiguration config = new TalonFXConfiguration();
    config.MotorOutput.NeutralMode = NeutralModeValue.Coast; // easy to spin by hand
    config.MotorOutput.Inverted = InvertedValue.CounterClockwise_Positive;
    config.Slot0.kS = kS;
    config.Slot0.kV = kV;
    config.Slot0.kP = kP;
    config.MotionMagic.MotionMagicCruiseVelocity = MOTION_MAGIC_CRUISE_VELOCITY;
    config.MotionMagic.MotionMagicAcceleration = MOTION_MAGIC_ACCELERATION;

    TalonFXUtil.applyConfigWithRetries(leader, config);
  }`}
        />

        <p>
          <code>MotorAlignmentValue.Opposed</code> is the important one. It
          makes the follower spin backward relative to the leader, which is
          exactly what the branch&apos;s own comment asks for:{" "}
          <em>
            the follower copies the leader, spinning the opposite direction
          </em>
          . Set it the other way and the two motors fight each other.
        </p>

        <Box
          variant="alert-warning"
          tag="NOTE · GAINS"
          title="Two of these three gains ship as zero"
        >
          <p>
            <code>kV = 0.125</code> is a real number: volts per rotation per
            second. That one term is doing all the work — ask for 60 rot/s and
            it applies about 7.5 volts, which gets the wheel roughly there.
          </p>
          <p className="mt-3">
            <code>kS = 0.0</code> and <code>kP = 0.0</code> are placeholders. As
            shipped there is no correction at all: nothing measures the real
            speed and pushes harder when the wheel is slow. It runs
            open-loop-ish, and it will sag when a game piece hits it. Tuning
            those two is bench work, using the same procedure as the{" "}
            <strong>{"PID Control "}</strong> lesson. Do not read the zeros as
            &quot;tuned and finished.&quot;
          </p>
        </Box>

        <p>
          <strong>{"You should see: "}</strong>
          <code>gradlew build</code> ends in <code>BUILD SUCCESSFUL</code>.
          Every <code>final</code> field now gets assigned, which is what Step 1
          was missing. The class still does nothing — no command, no binding.
        </p>
      </LessonSection>

      {/* ── STEP 3 ───────────────────────────────────────────────────── */}
      <LessonSection id="measure-the-distance" title="Measure the distance">
        <p>
          Two short private methods. The first asks the drivetrain where it
          thinks it is and measures to the target. The second sends a speed to
          the motor. Both publish their number on the way past, so you can watch
          them.
        </p>

        <CodeBlock
          language="java"
          title="Flywheel.java — the two private helpers"
          filename="src/main/java/frc/robot/subsystems/Flywheel.java"
          code={`  /** Distance (meters) from where the robot thinks it is to the target. */
  private double distanceToTarget() {
    double distance = drivetrain.getPose().getTranslation().getDistance(TARGET);
    distancePublisher.set(distance);
    return distance;
  }

  private void setVelocity(double rps) {
    targetVelocityPublisher.set(rps);
    leader.setControl(velocityOut.withVelocity(RotationsPerSecond.of(rps)));
  }`}
        />

        <p>
          Read that first line right to left. <code>drivetrain.getPose()</code>{" "}
          hands back a <code>Pose2d</code> — a position <em>and</em> a heading.{" "}
          <code>.getTranslation()</code> throws the heading away and keeps the x
          and y. <code>.getDistance(TARGET)</code> is the straight-line distance
          between two points, the one you would measure with a tape.
        </p>

        <p>
          Notice the wording of the comment the branch put there:{" "}
          <em>where the robot thinks it is</em>. That is deliberate. The pose is
          wheel odometry corrected by AprilTag sightings — a good estimate, not
          ground truth. The number this method returns inherits every bit of
          error in it.
        </p>

        <Box
          variant="alert-info"
          tag="NOTE · UNITS"
          title="RotationsPerSecond.of(rps), not rps"
        >
          <p>
            Every flywheel in Workshop-Code and in the robot template writes{" "}
            <code>withVelocity(RotationsPerSecond.of(rps))</code> rather than
            passing a bare <code>double</code>. Wrapping the number in a unit
            type keeps the unit attached to the value, so nobody downstream has
            to guess whether 60 meant rotations or radians. The static import at
            the top of the file is what makes the short spelling work.
          </p>
        </Box>

        <p>
          There is no <code>periodic()</code> method to put this in. Mechanisms
          in Commands&nbsp;v3 do not have one. The measuring happens inside the
          command instead, which is the next step.
        </p>

        <p>
          <strong>{"You should see: "}</strong>
          <code>gradlew build</code> ends in <code>BUILD SUCCESSFUL</code>.
          Nothing calls either method yet, so nothing moves — the checkpoint is
          that <code>RotationsPerSecond</code> and <code>Translation2d</code>{" "}
          resolved and the two publishers are in scope.
        </p>
      </LessonSection>

      {/* ── STEP 4 ───────────────────────────────────────────────────── */}
      <LessonSection
        id="the-command-that-keeps"
        title="The command that keeps re-measuring"
      >
        <p>
          Here is the whole point of the lesson in one method.{" "}
          <code>runRepeatedly(...)</code> runs its body every scheduler loop —
          about fifty times a second. So the distance is measured again, the
          table is asked again, and the motor is given a new speed again, fifty
          times a second, while the robot is still driving.
        </p>

        <CodeBlock
          language="java"
          title="Flywheel.java — the commands, with the branch's own comment block"
          filename="src/main/java/frc/robot/subsystems/Flywheel.java"
          code={`  // Both commands below are HOLDS: runRepeatedly runs the action every loop and never finishes.
  // Never make a sequence wait on a hold. Need an ending? Add it where you use the command:
  // flywheel.distanceShoot().until(someCondition). The "(hold)" in each name shows up on the
  // dashboard and in logs - if a stuck routine is sitting on a "(hold)", you found the bug.

  /**
   * Keep setting the flywheel speed from the live distance to the target. A hold - it never
   * finishes on its own. Bind it with {@code whileTrue} so it stops when the button is released.
   */
  public Command distanceShoot() {
    return runRepeatedly(() -> setVelocity(table.get(distanceToTarget())))
        .named("distanceShoot (hold)");
  }

  /** Stop the flywheel and keep it stopped. Never finishes. */
  public Command stop() {
    return runRepeatedly(leader::stopMotor).named("stop (hold)");
  }`}
        />

        <Split>
          <ProseBlock>
            <p>
              The body reads inside out:{" "}
              <code>setVelocity(table.get(distanceToTarget()))</code>. Measure,
              look up, send. Three calls, one line, once per loop.
            </p>
            <p>
              <code>runRepeatedly(...)</code> never finishes on its own, so both
              names end in <code>(hold)</code> — the site&apos;s convention is
              that every hold says so. That suffix is not decoration; it is a
              warning to the next person who reads it. Put{" "}
              <code>distanceShoot()</code> into a{" "}
              <code>Command.sequence(...)</code> and the sequence stops there
              forever, because step one never ends.
            </p>
          </ProseBlock>
          <MarginNote label="IT SHOWS UP IN THE LOG">
            Which means a routine that has quietly frozen tells you which hold
            it froze on.
          </MarginNote>
        </Split>

        <Box
          variant="alert-danger"
          tag="DON'T"
          title="Do not measure the distance once and reuse it"
        >
          <p>
            The tempting shortcut is to work the distance out in the
            constructor, or once at the top of the command, and store it. Both
            give you the distance to the target at the moment the robot booted
            or the moment you pressed the button. Drive two meters and the speed
            is wrong, with nothing to tell you.
          </p>
          <p className="mt-3">
            The re-measuring <em>is</em> the lesson. <code>runRepeatedly</code>{" "}
            is what does it.
          </p>
        </Box>

        <p>
          <strong>{"You should see: "}</strong>
          <code>gradlew build</code> ends in <code>BUILD SUCCESSFUL</code>, and{" "}
          <code>Flywheel.java</code> is finished: two public commands,{" "}
          <code>distanceShoot()</code> and <code>stop()</code>. Nothing runs
          either one yet — no <code>Robot</code> field owns the flywheel and no
          button is bound to it. That is Step 5.
        </p>
      </LessonSection>

      {/* ── STEP 5 ───────────────────────────────────────────────────── */}
      <LessonSection
        id="own-it-in-robot"
        title={
          <>
            Step 5 — Own it in <code>Robot</code>, bind it in{" "}
            <code>TeleopOpMode</code>
          </>
        }
        outlineLabel="Own it in Robot, bind it in TeleopOpMode"
      >
        <p>
          Mechanisms are <code>public final</code> fields on <code>Robot</code>.
          Add one line, below the drivetrain:
        </p>

        <CodeBlock
          language="java"
          title="Robot.java — the flywheel joins the drivetrain"
          filename="src/main/java/frc/robot/Robot.java"
          code={`public class Robot extends OpModeRobot {
  public final DriveMechanism drivetrain = new DriveMechanism();

  // The flywheel reads the drivetrain's position to pick its shooting speed.
  public final Flywheel flywheel = new Flywheel(drivetrain);`}
        />

        <Box
          variant="alert-warning"
          tag="WATCH OUT"
          title="Order matters on these two lines"
        >
          <p>
            Java builds fields top to bottom, and the language will not let you
            read one before it is declared. Put the flywheel line <em>above</em>{" "}
            the drivetrain line and the build stops with{" "}
            <code>illegal forward reference</code>, pointing at{" "}
            <code>drivetrain</code>. That is the good outcome — the compiler
            catches it by name instead of leaving you a null to chase at the
            field. Declare the drivetrain above anything that takes it as an
            argument.
          </p>
        </Box>

        <p>
          Now the binding. Button bindings for a driving mode go in that
          OpMode&apos;s constructor, and the framework removes them when the
          mode switches. This is what the branch writes:
        </p>

        <CodeBlock
          language="java"
          title="TeleopOpMode.java — inside the constructor"
          filename="src/main/java/frc/robot/opmodes/TeleopOpMode.java"
          code={`    // Hold A: spin the flywheel at the speed picked from the live distance to the goal.
    driver.a().whileTrue(robot.flywheel.distanceShoot());`}
        />

        <p>
          <code>whileTrue</code> is the right verb for a hold: the command runs
          while A is down and is canceled the moment you let go. That is the
          binding the command&apos;s own javadoc asks for.
        </p>

        <Box
          variant="alert-warning"
          tag="THE BRANCH LEAVES THIS OUT"
          title="Canceling the command does not stop the wheel"
        >
          <p>
            The branch binds <code>whileTrue</code> and nothing else. Release A
            and the command is canceled — but canceling hands the mechanism back
            to <code>idle()</code>, and <code>idle()</code> sends{" "}
            <em>nothing</em>. It does not zero the last request. Phoenix carries
            on applying the last speed it was given, so the wheel keeps
            spinning.
          </p>
          <p className="mt-3">
            That is why <code>stop()</code> exists on this class. The branch
            never binds it. Add the pair yourself:
          </p>
          <div className="mt-3">
            <CodeBlock
              language="java"
              hideControls
              code={`driver
    .a()
    .whileTrue(robot.flywheel.distanceShoot())
    .whileFalse(robot.flywheel.stop());`}
            />
          </div>
        </Box>

        <p>
          <strong>{"You should see: "}</strong>
          <code>gradlew build</code> ends in <code>BUILD SUCCESSFUL</code>.
          Start the robot code and a <code>Flywheel</code> table appears in your
          dashboard tree with <code>DistanceToTargetMeters</code> and{" "}
          <code>TargetVelocityRps</code> under it, before you press A. If the
          table is missing, <code>Robot</code> never built the flywheel — check
          the field you just added.
        </p>
      </LessonSection>

      {/* ── FILLING THE TABLE ────────────────────────────────────────── */}
      <LessonSection
        id="the-four-numbers-in-the-table"
        title="The four numbers in the table are not your numbers"
      >
        <p>
          0, 10, 30, 60 are placeholders. The branch says so in its own comment
          — <code>Tune these points with real test shots</code> — and they were
          never measured on your shooter, with your wheels, your compression or
          your game piece.
        </p>

        <p>
          There is no formula for these. You cannot compute them from the
          geometry, because the answer depends on how much the game piece
          squashes, how much it slips on the wheel, how worn the wheel is, and
          how much the battery has sagged. Every team that runs a lookup table
          got its numbers the same way: by shooting.
        </p>

        <h3 className="display measure m-0 text-title">
          How teams actually fill it in
        </h3>

        <ol className="ml-5 list-decimal space-y-3">
          <li>
            <strong>Park at one distance and stay there.</strong> Tape mark on
            the carpet. Read <code>Flywheel/DistanceToTargetMeters</code> and
            check the robot agrees with your tape measure. If it does not, stop
            — your odometry is the problem, not the flywheel.
          </li>
          <li>
            <strong>Hunt for the speed by hand.</strong> Change the number in{" "}
            <code>table.put(...)</code>, redeploy, shoot. Big steps first, then
            smaller ones. You are looking for the middle of the range that
            scores, not the first speed that goes in once.
          </li>
          <li>
            <strong>Shoot five, not one.</strong> A single lucky shot is not
            data. If four out of five score, write the number down. If two out
            of five score, you found the edge of the range, not the middle.
          </li>
          <li>
            <strong>Move a meter and do it again.</strong> Three or four
            distances spread across the range you will actually shoot from.
            Include the furthest one, because the table stops changing past your
            last row.
          </li>
          <li>
            <strong>Test in between.</strong> Stand halfway between two measured
            distances and shoot. That is the interpolation doing its job. If it
            misses there, add a row between them — that is the only reason to
            add rows.
          </li>
        </ol>

        <Box variant="alert-tip" title="Expect this to take a practice session">
          <p>
            Four distances, five shots each, redeploying between attempts, is an
            hour or two with someone feeding game pieces. That is normal. Put
            the numbers in a shared note as you go, with the date and the
            battery, so nobody re-does the work in March.
          </p>
        </Box>

        <p>
          The same warning applies to <code>TARGET</code>. As shipped it is{" "}
          <code>new Translation2d(3, 5)</code> with a{" "}
          <code>TODO: set the real goal</code> next to it. Look up the real
          coordinates in the game manual&apos;s field drawings, measured from
          the blue-alliance origin, and put those in before you measure a single
          shot.
        </p>
      </LessonSection>

      {/* ── FULL FILE ────────────────────────────────────────────────── */}
      <LessonSection id="the-whole-file" title="The whole file">
        <p>
          Everything above, in one piece, straight off the branch. The
          &quot;GitHub Changes&quot; tab shows the four-file diff against{" "}
          <code>3-Limelight</code> — that diff is exactly this lesson.
        </p>

        <GitHubContent
          repository="Hemlock5712/Workshop-Code"
          filePath="src/main/java/frc/robot/subsystems/Flywheel.java"
          branch="4-DynamicFlywheel"
          pr={{ number: 10, focusFile: "Flywheel.java" }}
        />

        <DocumentationButton
          href="https://github.com/Hemlock5712/Workshop-Code/tree/4-DynamicFlywheel"
          title="Branch 4-DynamicFlywheel on GitHub"
          icon={<GitBranch className="w-5 h-5" />}
        />
      </LessonSection>

      {/* ── DID IT WORK ──────────────────────────────────────────────── */}
      <LessonSection id="did-it-work" title="Did it work?">
        <p>
          You do not need a game piece for any of this. You are checking that
          two numbers move the way the table says they should.
        </p>

        <ol className="ml-5 list-decimal space-y-3">
          <li>
            Run <code>gradlew build</code>.{" "}
            <strong>{"You should see: "}</strong> <code>BUILD SUCCESSFUL</code>.
            If the compiler points at <code>.named(...)</code>, read the second
            failure below.
          </li>
          <li>
            Start the robot code and open your dashboard. Find the{" "}
            <code>Flywheel</code> table. <strong>{"You should see: "}</strong>{" "}
            two entries, <code>DistanceToTargetMeters</code> and{" "}
            <code>TargetVelocityRps</code>. They appear as soon as the flywheel
            is built, before you press anything.
          </li>
          <li>
            Enable, and drive the robot around.{" "}
            <strong>{"You should see: "}</strong>{" "}
            <code>DistanceToTargetMeters</code> changing smoothly as you move.
            Drive toward the point you put in <code>TARGET</code> and it should
            fall; drive away and it should climb. Check it against a tape
            measure once — the robot&apos;s idea of the distance is only as good
            as your odometry.
          </li>
          <li>
            Hold A. <strong>{"You should see: "}</strong>{" "}
            <code>TargetVelocityRps</code> stop reading zero, and the wheel spin
            up. With the shipped table, anywhere past 3 meters gives you exactly{" "}
            <code>60.0</code>.
          </li>
          <li>
            Keep A held and drive from about 2 meters in to about 1 meter.{" "}
            <strong>{"You should see: "}</strong> <code>TargetVelocityRps</code>{" "}
            slide down from around 30 toward around 10, and the wheel slow to
            match. That is the table being read fifty times a second. Park at
            1.5 meters and it should sit near <code>20.0</code>.
          </li>
          <li>
            Drive out past 3 meters, still holding A.{" "}
            <strong>{"You should see: "}</strong> the speed climb to{" "}
            <code>60.0</code> and then stop climbing, however far you go. Not a
            bug — that is the end of the table.
          </li>
          <li>
            Release A. <strong>{"You should see: "}</strong> with the
            branch&apos;s binding as written,{" "}
            <em>the wheel keeps spinning at the last speed it was given</em>.
            Add the <code>whileFalse(robot.flywheel.stop())</code> from Step 5
            and try again: now the motor is released and the wheel coasts down.
            Neutral mode on this branch is <code>Coast</code>, so expect it to
            take a few seconds rather than stop dead.
          </li>
        </ol>

        <Box
          variant="alert-info"
          tag="IF IT DIDN'T WORK"
          title="A crash on A, a missing name, a distance that never changes"
        >
          <ul className="ml-4 list-disc space-y-3">
            <li>
              <strong>
                The robot code crashes the instant you press A, with a{" "}
                <code>NullPointerException</code>.
              </strong>{" "}
              The table is empty. Ask an empty{" "}
              <code>InterpolatingDoubleTreeMap</code> for a value and it returns{" "}
              <code>null</code>, which blows up on its way into{" "}
              <code>setVelocity(double)</code>. Check that the four{" "}
              <code>table.put(...)</code> lines are inside the constructor and
              that you did not comment them out while experimenting.
            </li>
            <li>
              <strong>
                It will not compile, and the error points at{" "}
                <code>.named(...)</code>.
              </strong>{" "}
              <code>runRepeatedly(...)</code> hands back a builder, not a
              finished <code>Command</code>, and{" "}
              <code>.named(&quot;...&quot;)</code> is what turns it into one.
              Every command has to have a name — WPILib makes an unnamed one a
              build error. The other version of this mistake is adding a second{" "}
              <code>.named(...)</code> to a command that already has one.
            </li>
            <li>
              <strong>
                <code>DistanceToTargetMeters</code> never changes while you
                drive.
              </strong>{" "}
              The problem is upstream of this file. The pose is frozen, which
              means the drivetrain is not reporting motion. Go back to{" "}
              <strong>Swerve Calibration</strong> and confirm odometry moves
              before you debug anything here. The flywheel is doing its job
              perfectly with a bad input.
            </li>
            <li>
              <strong>
                One motor screams, or the wheels shove against each other.
              </strong>{" "}
              The follower is aligned the wrong way. It must be{" "}
              <code>
                new Follower(leader.getDeviceID(), MotorAlignmentValue.Opposed)
              </code>{" "}
              — <code>Opposed</code> is what makes the follower spin backward
              relative to the leader, which is what the branch&apos;s comment
              prescribes. Also confirm the leader really is CAN&nbsp;21 and the
              follower CAN&nbsp;22, not swapped. If the driver station shows a{" "}
              <em>failed to configure after 5 attempts</em> error naming a
              device ID, that is <code>TalonFXUtil</code> telling you the motor
              never got its configuration — check CAN wiring first.
            </li>
          </ul>
        </Box>
      </LessonSection>

      {/* ── WHAT'S NEXT ──────────────────────────────────────────────── */}
      <LessonSection id="what-s-next" title="What's next">
        <Box
          variant="alert-warning"
          tag="BEFORE YOU SWITCH BRANCHES"
          title="Save this work if you want to keep it"
        >
          <p>
            Last reminder, because this is the moment it bites.{" "}
            <strong>Drive to Point</strong> runs on <code>5-DriveToPoint</code>,
            which forks off <code>2-Logging</code> and has never had a{" "}
            <code>Flywheel.java</code> or a <code>TalonFXUtil.java</code> in it.
            Check it out and both files are gone from your working tree.
          </p>
          <p className="mt-3">
            Commit to a branch of your own first, or keep a second clone. Either
            works. Losing an afternoon of typing to a <code>git switch</code> is
            an annoying way to learn this.
          </p>
        </Box>

        <p>
          The pattern you learned here is bigger than flywheels. Any time a
          mechanism needs a number that depends on where the robot is standing —
          a hood angle, a wrist position, how long to hold a feeder — the same
          three pieces apply: a lookup table of measured pairs, a distance
          computed from the pose, and a <code>runRepeatedly</code> command that
          redoes both every loop.
        </p>

        <p>
          Next up, the drivetrain stops being something the driver steers and
          starts driving itself to a pose you name.
        </p>
      </LessonSection>

      <AlphaStatusNote />

      <Quiz
        questions={[
          {
            id: 1,
            question:
              "Your table has table.put(1.0, 10.0) and table.put(2.0, 30.0). The robot is 1.5 meters away. What speed does table.get(1.5) hand back?",
            options: ["10.0", "20.0", "30.0", "40.0"],
            correctAnswer: 1,
            explanation:
              "InterpolatingDoubleTreeMap draws a straight line between the two rows it has. 1.5 is halfway between 1.0 and 2.0, so the answer is halfway between 10 and 30: 20.0 rotations per second.",
          },
          {
            id: 2,
            question:
              "The last row of the table is table.put(3.0, 60.0). The robot drives out to 5 meters. What does the map return?",
            options: [
              "60.0 — it stops at the last row and does not extrapolate",
              "100.0 — it keeps the line going past the last row",
              "0.0 — the distance is out of range",
              "It throws an error you have to catch",
            ],
            correctAnswer: 0,
            explanation:
              "Past the last row the map hands back the value at that row, every time. That is the safe choice — an extrapolated speed would be a guess with no measurement behind it — but it means shots from beyond your furthest measured distance are quietly wrong. Measure out as far as you plan to shoot.",
          },
          {
            id: 3,
            question:
              "Why does distanceShoot() use runRepeatedly(...) instead of measuring the distance once when the button is pressed?",
            options: [
              "runRepeatedly uses less bandwidth on the CAN bus",
              "The robot keeps moving, so the distance changes and the speed has to be looked up again every loop",
              "The lookup table can only be read from inside runRepeatedly",
              "It is the only way to give a command a name",
            ],
            correctAnswer: 1,
            explanation:
              "A distance measured once is the distance you were at when you pressed the button. Drive two meters and the speed is wrong, with nothing to tell you. runRepeatedly re-runs its body every scheduler loop — about fifty times a second — so measure, look up and send all happen again while the robot is still moving.",
          },
          {
            id: 4,
            question:
              'The command is named "distanceShoot (hold)". What is the (hold) suffix telling you?',
            options: [
              "The command holds the mechanism at a fixed position",
              "The command never finishes on its own, so nothing may wait on it",
              "The command only runs while the robot is stationary",
              "The command has the highest scheduler priority",
            ],
            correctAnswer: 1,
            explanation:
              "runRepeatedly never ends by itself. Put a hold inside Command.sequence(...) and the sequence stops there forever, because step one never finishes. The suffix is a warning to the next reader, and it shows up in the log so a frozen routine tells you which hold it froze on.",
          },
          {
            id: 5,
            question:
              "Where does the flywheel get the distance to the target from?",
            options: [
              "A rangefinder mounted next to the shooter",
              "The Limelight reports the distance directly",
              "drivetrain.getPose() measured against a fixed Translation2d field point",
              "The driver types it into the dashboard before each shot",
            ],
            correctAnswer: 2,
            explanation:
              "distanceToTarget() calls drivetrain.getPose().getTranslation().getDistance(TARGET). The pose is wheel odometry corrected by AprilTag sightings, so this number inherits every bit of error in your calibration and vision setup. Check it against a tape measure before you trust it.",
          },
          {
            id: 6,
            question:
              "The branch binds driver.a().whileTrue(robot.flywheel.distanceShoot()) and nothing else. You release A. What happens to the wheel?",
            options: [
              "It stops, because canceling a command stops its motors",
              "It keeps spinning — idle() sends no output and does not zero the last request, so Phoenix keeps applying it",
              "It coasts to a stop within one scheduler loop",
              "The robot code throws an error because no command owns the mechanism",
            ],
            correctAnswer: 1,
            explanation:
              "Canceling hands the mechanism back to idle(), which issues no motor output at all and does not clear the last control request. Phoenix carries on applying the speed it was last given. That is why stop() exists as its own command, and why you pair the binding with whileFalse(robot.flywheel.stop()).",
          },
        ]}
      />
    </PageTemplate>
  );
}
