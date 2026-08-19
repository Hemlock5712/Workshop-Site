import PageTemplate from "@/components/PageTemplate";
import { MarginNote, Split } from "@/components/lesson/Prose";
import LessonSection from "@/components/lesson/LessonSection";
import AlphaStatusNote from "@/components/AlphaStatusNote";
import Box from "@/components/Box";
import CodeBlock from "@/components/CodeBlock";
import GitHubContent from "@/components/GitHubContent";
import DocumentationButton from "@/components/DocumentationButton";
import Quiz from "@/components/Quiz";
import { GitBranch } from "lucide-react";

/**
 * Rewritten against `context/writing-style.md`.
 *
 * The old page ran 32.9 minutes across ten sections with ten asides. Six
 * sections now, two asides, four code embeds. Three things were named
 * load-bearing and all three survive: the interpolation table, the warning that
 * the four shipped numbers are placeholders every team has to measure on its
 * own robot, and the split between `Robot` owning the mechanism and
 * `TeleopOpMode` binding it.
 *
 * Deleted embeds, and why: the `TalonFXUtil` file view and the import block
 * were reference material, and the `Robot.java` and `TeleopOpMode` edits are
 * one line each, so they read as inline code instead.
 *
 * The field declarations ride in the same block as the constructor rather than
 * in a fifth embed. They are not optional reading: the constructor names `kS`,
 * `kV`, `kP` and both `MOTION_MAGIC_*` limits, and `TARGET`, the CANivore bus
 * name and CAN 21/22 are numbers a student types. A review pass restored them
 * after they were cut to the PR diff, along with the `.named(...)` build
 * failure, the Coast spin-down, and the "add a row between them" step.
 */
export default function DynamicFlywheel() {
  return (
    <PageTemplate
      title="Vision Shooting"
      lede="One fixed flywheel speed scores from one spot on the field. Here the flywheel takes the distance to the goal from the drivetrain's pose and looks up a speed for it. Four measured shots cover everything in between."
      needs={[
        <>
          The Limelight setup from <strong>Vision</strong>. This branch is one
          commit off <code>3-Limelight</code>.
        </>,
        <>
          Odometry you trust, from <strong>Swerve Calibration</strong>. A wrong
          pose gives a wrong speed.
        </>,
        <>
          A flywheel on the bench: two Krakens, CAN IDs <strong>21</strong> and{" "}
          <strong>22</strong>, on the CANivore.
        </>,
      ]}
      branch="4-DynamicFlywheel"
      time="about 30 minutes to type in"
    >
      <p>
        This branch adds <code>subsystems/Flywheel.java</code> and a helper,{" "}
        <code>utils/TalonFXUtil.java</code>, plus one edited line in{" "}
        <code>Robot</code> and one in <code>TeleopOpMode</code>.
      </p>

      <Box
        variant="alert-warning"
        tag="OPTIONAL · DEAD-END BRANCH"
        title="Save your work before you switch"
      >
        <p>
          <code>4-DynamicFlywheel</code> is one commit on top of{" "}
          <code>3-Limelight</code>, and nothing later builds on it.{" "}
          <strong>Drive to Point</strong> runs on <code>5-DriveToPoint</code>,
          which has never held a <code>Flywheel.java</code>, so checking it out
          deletes your new file.
        </p>
        <p className="mt-3">
          Commit to a branch of your own first: <code>git switch -c</code>, then{" "}
          <code>git add -A</code> and <code>git commit</code>. Skipping this
          page breaks nothing later.
        </p>
      </Box>

      <LessonSection
        id="four-measurements-every-distance-in-between"
        title="The lookup table"
      >
        <p>
          You cannot measure the right speed at every distance. There are
          infinitely many distances and one afternoon of practice time. So
          measure a few and let the code fill the gaps.
        </p>

        <p>
          <code>InterpolatingDoubleTreeMap</code> does the filling in. Hand it
          pairs of distance and speed; between two rows it draws a straight line
          and reads the answer off.
        </p>

        <div className="overflow-x-auto">
          <table className="w-full min-w-[520px] border-collapse text-note">
            <thead>
              <tr style={{ borderBottom: "1px solid var(--rule)" }}>
                <th className="px-3 py-2 text-left">Distance (m)</th>
                <th className="px-3 py-2 text-left">Speed (rot/s)</th>
                <th className="px-3 py-2 text-left">In the table?</th>
              </tr>
            </thead>
            <tbody style={{ color: "var(--tx2)" }}>
              <tr style={{ borderBottom: "1px solid var(--rule-soft)" }}>
                <td className="px-3 py-2 font-mono">0.0</td>
                <td className="px-3 py-2 font-mono">0.0</td>
                <td className="px-3 py-2">Yes</td>
              </tr>
              <tr style={{ borderBottom: "1px solid var(--rule-soft)" }}>
                <td className="px-3 py-2 font-mono">1.0</td>
                <td className="px-3 py-2 font-mono">10.0</td>
                <td className="px-3 py-2">Yes</td>
              </tr>
              <tr style={{ borderBottom: "1px solid var(--rule-soft)" }}>
                <td className="px-3 py-2 font-mono">1.5</td>
                <td className="px-3 py-2 font-mono">20.0</td>
                <td className="px-3 py-2">No, halfway between</td>
              </tr>
              <tr style={{ borderBottom: "1px solid var(--rule-soft)" }}>
                <td className="px-3 py-2 font-mono">2.0</td>
                <td className="px-3 py-2 font-mono">30.0</td>
                <td className="px-3 py-2">Yes</td>
              </tr>
              <tr style={{ borderBottom: "1px solid var(--rule-soft)" }}>
                <td className="px-3 py-2 font-mono">3.0</td>
                <td className="px-3 py-2 font-mono">60.0</td>
                <td className="px-3 py-2">Yes, the last row</td>
              </tr>
              <tr>
                <td className="px-3 py-2 font-mono">4.0</td>
                <td className="px-3 py-2 font-mono">60.0</td>
                <td className="px-3 py-2">No, held flat</td>
              </tr>
            </tbody>
          </table>
        </div>

        <p>
          Past your last row the map hands back that row&apos;s value and stops
          climbing. With this table, 3.5, 4 and 9 meters all return{" "}
          <code>60.0</code>. It is still a miss, with nothing on the dashboard
          to explain it, so measure out as far as you plan to shoot.
        </p>
      </LessonSection>

      <LessonSection
        id="the-constructor-table-follower"
        title="The constructor"
      >
        <p>
          The constructor runs once, when <code>Robot</code> builds the
          flywheel. It fills the table, tells the second motor to copy the
          first, and pushes the gains down through <code>TalonFXUtil</code>.
          That helper retries five times, then reports to the driver station.
        </p>

        <CodeBlock
          language="java"
          title="Flywheel.java: fields and constructor"
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
      telemetry.getDoubleTopic("TargetVelocityRps").publish();

  public Flywheel(DriveMechanism drivetrain) {
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

        <Split>
          <div className="measure flex flex-col gap-pad [&>p]:m-0 [&>p]:prose-body">
            <p>
              <code>MotorAlignmentValue.Opposed</code> makes the follower spin
              backward relative to the leader. Set it the other way and the two
              motors shove against each other.
            </p>
          </div>
          <MarginNote label="TWO GAINS SHIP AT ZERO">
            <code>kV = 0.125</code> does the work: 60 rot/s asks for about 7.5
            volts. <code>kS</code> and <code>kP</code> are zero, so nothing
            corrects a wheel that sags under a game piece.
          </MarginNote>
        </Split>
      </LessonSection>

      <LessonSection id="measure-the-distance" title="Measure, look up, send">
        <p>
          Two short private methods: one measures to the target, the other sends
          a speed to the motor. Both publish their number on the way past.
        </p>

        <CodeBlock
          language="java"
          title="Flywheel.java: the two private helpers"
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
          Read that first line right to left: <code>getTranslation()</code>
          drops the heading off the pose, and <code>
            getDistance(TARGET)
          </code>{" "}
          is the distance you would measure with a tape.
        </p>

        <p>
          The comment says <em>where the robot thinks it is</em> on purpose. The
          pose is odometry corrected by AprilTag sightings, so this number
          carries its error too.
        </p>

        <CodeBlock
          language="java"
          title="Flywheel.java: the two commands"
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

        <p>
          <code>runRepeatedly(...)</code> runs its body every scheduler loop,
          about fifty times a second. Measure, look up, send, again, while the
          robot is still driving. Work the distance out once in the constructor
          instead and you get the speed that suited the moment the robot booted.
        </p>

        <p>
          Neither command ends on its own. Drop a hold into{" "}
          <code>Command.sequence(...)</code> and the sequence stops there
          forever, because step one never finishes.
        </p>
      </LessonSection>

      <LessonSection id="own-it-in-robot" title="Own it, bind it">
        <p>
          Mechanisms are <code>public final</code> fields on <code>Robot</code>.
          Add the flywheel one line below the drivetrain:{" "}
          <code>
            public final Flywheel flywheel = new Flywheel(drivetrain);
          </code>
        </p>

        <p>
          Java will not let a field read one declared after it. Put that line
          above the drivetrain and the build stops with{" "}
          <code>illegal forward reference</code>.
        </p>

        <p>
          Bindings for a driving mode go in that OpMode&apos;s constructor, and
          the framework drops them when the mode switches. The branch writes one
          line in <code>TeleopOpMode</code>:{" "}
          <code>driver.a().whileTrue(robot.flywheel.distanceShoot());</code>
        </p>

        <Box
          variant="alert-danger"
          tag="THE BRANCH LEAVES THIS OUT"
          title="Releasing A does not stop the wheel"
        >
          <p>
            <code>whileTrue</code> cancels the command when you let go, and
            canceling is not stopping. The mechanism falls back to{" "}
            <code>idle()</code>, which sends nothing and does not zero the last
            request, so Phoenix keeps applying the speed it was given. Chain{" "}
            <code>stop()</code> on yourself:{" "}
            <code>.whileFalse(robot.flywheel.stop())</code>.
          </p>
        </Box>

        <p>
          The whole file is below. The GitHub Changes tab holds the four-file
          diff, both edited lines included.
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

      <LessonSection
        id="the-four-numbers-in-the-table"
        title="Your own numbers"
      >
        <p>
          0, 10, 30 and 60 are placeholders. Nothing computes them for you: the
          answer depends on how much the game piece squashes, how much it slips,
          and how worn the wheel is. <code>TARGET</code> is a placeholder too,
          so get the real goal coordinates from the game manual first.
        </p>

        <ol className="ml-5 list-decimal space-y-3">
          <li>
            <strong>Park at one distance and stay there.</strong> Tape a mark on
            the carpet, then check <code>Flywheel/DistanceToTargetMeters</code>{" "}
            against a tape measure. If they disagree, your odometry is the
            problem.
          </li>
          <li>
            <strong>Hunt for the speed, five shots at a time.</strong> Change
            the number in <code>table.put(...)</code>, redeploy, shoot. Big
            steps first, then smaller ones. Four of five scoring is a number
            worth keeping; two of five is the edge of the range, not the middle.
          </li>
          <li>
            <strong>Move a meter and do it again.</strong> Three or four
            distances, including the furthest you will shoot from. Then stand
            between two and shoot: that is the interpolation working. If that
            shot misses, add a row between them.
          </li>
        </ol>

        <p>
          Expect a practice session, with someone feeding game pieces. Write the
          numbers down with the date, so nobody redoes the work in March.
        </p>
      </LessonSection>

      <LessonSection id="check-your-work" title="Check your work">
        <p>
          No game piece needed. Build, deploy, and open your dashboard: a{" "}
          <code>Flywheel</code> table appears with{" "}
          <code>DistanceToTargetMeters</code> and <code>TargetVelocityRps</code>{" "}
          under it before you press anything. Enable and drive, and the distance
          falls as you head toward <code>TARGET</code>. Now hold A and drive
          from 2 meters in to 1 meter. The speed slides from about 30 down to
          about 10, the wheel slows to match, and parking at 1.5 meters sits
          near <code>20.0</code>. Past 3 meters it stops climbing at{" "}
          <code>60.0</code>.
        </p>

        <p>
          Release A and, as the branch is written, the wheel keeps spinning at
          the last speed. Add the <code>whileFalse</code> line and it coasts
          down over a few seconds instead, because neutral mode is{" "}
          <code>Coast</code>.
        </p>

        <p>
          Four things go wrong most often. A <code>NullPointerException</code>{" "}
          the instant you press A means the table is empty, and an empty map
          returns <code>null</code> on its way into{" "}
          <code>setVelocity(double)</code>. A build error at{" "}
          <code>.named(...)</code> means an unnamed command:{" "}
          <code>runRepeatedly</code> returns a builder, and the name finishes
          it. A distance that never changes while you drive is a frozen pose, so
          go back to <strong>Swerve Calibration</strong> before touching this
          file. One motor screaming, or the wheels shoving at each other, is a
          follower aligned the wrong way, or CAN 21 and 22 swapped.
        </p>
      </LessonSection>

      <AlphaStatusNote />

      <Quiz
        questions={[
          {
            id: 1,
            question:
              "Your table has table.put(1.0, 10.0) and table.put(2.0, 30.0). The robot is 1.5 meters away. What speed does table.get(1.5) hand back?",
            options: ["40.0", "10.0", "20.0", "30.0"],
            correctAnswer: 2,
            explanation:
              "InterpolatingDoubleTreeMap draws a straight line between the two rows it has. 1.5 is halfway between 1.0 and 2.0, so the answer is halfway between 10 and 30: 20.0 rotations per second.",
          },
          {
            id: 2,
            question:
              "The last row of the table is table.put(3.0, 60.0). The robot drives out to 5 meters. What does the map return?",
            options: [
              "60.0: it stops at the last row and does not extrapolate",
              "100.0: it keeps the line going past the last row",
              "0.0: the distance is out of range",
              "It throws an error you have to catch",
            ],
            correctAnswer: 0,
            explanation:
              "Past the last row the map hands back the value at that row, every time. Extrapolating would be a guess with no measurement behind it. It does mean a shot from beyond your furthest measured distance is quietly wrong, so measure out as far as you plan to shoot.",
          },
          {
            id: 3,
            question:
              "Why does distanceShoot() use runRepeatedly(...) instead of measuring the distance once when the button is pressed?",
            options: [
              "The lookup table can only be read from inside runRepeatedly",
              "It is the only way to give a command a name",
              "runRepeatedly uses less bandwidth on the CAN bus",
              "The robot keeps moving, so the distance changes and the speed has to be looked up again every loop",
            ],
            correctAnswer: 3,
            explanation:
              "A distance measured once is the distance you were at when you pressed the button. Drive two meters and the speed is wrong, with nothing to tell you. runRepeatedly re-runs its body every scheduler loop, about fifty times a second, so measure, look up and send all happen again while the robot is still moving.",
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
              "runRepeatedly never ends by itself. Put a hold inside Command.sequence(...) and the sequence stops there forever, because step one never finishes. The suffix warns the next reader, and it shows up in the log, so a frozen routine tells you which hold it froze on.",
          },
          {
            id: 5,
            question:
              "Where does the flywheel get the distance to the target from?",
            options: [
              "drivetrain.getPose() measured against a fixed Translation2d field point",
              "The driver types it into the dashboard before each shot",
              "A rangefinder mounted next to the shooter",
              "The Limelight reports the distance directly",
            ],
            correctAnswer: 0,
            explanation:
              "distanceToTarget() calls drivetrain.getPose().getTranslation().getDistance(TARGET). The pose is wheel odometry corrected by AprilTag sightings, so this number inherits every bit of error in your calibration and vision setup. Check it against a tape measure before you trust it.",
          },
          {
            id: 6,
            question:
              "The branch binds driver.a().whileTrue(robot.flywheel.distanceShoot()) and nothing else. You release A. What happens to the wheel?",
            options: [
              "The robot code throws an error because no command owns the mechanism",
              "It stops, because canceling a command stops its motors",
              "It keeps spinning: idle() sends no output and does not zero the last request, so Phoenix keeps applying it",
              "It coasts to a stop within one scheduler loop",
            ],
            correctAnswer: 2,
            explanation:
              "Canceling hands the mechanism back to idle(), which issues no motor output at all and does not clear the last control request. Phoenix carries on applying the speed it was last given. That is why stop() exists as its own command, and why you pair the binding with whileFalse(robot.flywheel.stop()).",
          },
        ]}
      />
    </PageTemplate>
  );
}
