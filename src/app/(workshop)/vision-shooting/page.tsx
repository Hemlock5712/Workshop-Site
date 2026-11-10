import PageTemplate from "@/components/PageTemplate";
import { MarginNote, Split } from "@/components/lesson/Prose";
import LessonSection from "@/components/lesson/LessonSection";
import Box from "@/components/Box";
import CodeBlock from "@/components/CodeBlock";
import Quiz from "@/components/Quiz";

/**
 * An optional side page, deliberately not in `lessons.ts`. Owner's call,
 * November 2026: rebuild it, keep it unlisted.
 *
 * Rebuilt that month on Workshop-Code `swerve-vision-shooting` (a7b6e49), one
 * commit on `swerve-vision`. It replaced `4-DynamicFlywheel`, which sat on
 * `3-Limelight` with the copied `LimelightHelpers`, a `TalonFXUtil` retry
 * helper, imperative `config.Slot0.kV = ...` gains, `(hold)` command names, a
 * comment recommending `.until(...)`, and no `whileFalse(stop())` on the
 * binding. The new branch matches the rest of the course: the Tuner X
 * Generate Code paste with every gain at 0.0, one direct `apply`, names with
 * no suffix, and the stop bound on release.
 *
 * Kept from the old page because they are the lesson: the interpolation
 * table, the warning that the four shipped rows are placeholders every team
 * measures on its own robot, and the measuring procedure.
 *
 * The hardware is the old page's, two Krakens on CAN 21 and 22 with the
 * follower opposed and `CounterClockwise_Positive` on the leader. That
 * differs from the mech chain's one-motor `Clockwise_Positive` flywheel and is
 * carried over, not re-verified.
 *
 * Verified in headless simulation, November 2026, with a throwaway OpMode
 * that reset the pose to known distances from `TARGET` and read the leader's
 * closed-loop reference: 2.0 m gave 30, 1.5 m gave 20, 1.0 m gave 10, and
 * 3, 4 and 9 m all gave 60. The leader ran MotionMagicVelocityVoltage, the
 * follower reported Follower, and `stop()` left the leader in NeutralOut.
 * With the shipped 0.0 Motion Magic acceleration the reference stays at 0,
 * which is the "zero until you paste" behaviour; the check gave the probe a
 * test-only ramp rate. Nothing is verified on hardware.
 */
export default function DynamicFlywheel() {
  return (
    <PageTemplate
      title="Vision Shooting"
      lede="One fixed flywheel speed scores from one spot on the field. Here the flywheel takes the distance to the goal from the drivetrain's pose and looks up a speed for it. A few measured shots cover everything in between."
      needs={[
        <>
          <strong>Vision</strong>. This branch is one commit on{" "}
          <code>swerve-vision</code>, and a wrong pose gives a wrong speed.
        </>,
        <>
          The Tuner X config paste from <strong>Mechanisms</strong>.
        </>,
        <>
          A flywheel: two Krakens, CAN IDs <strong>21</strong> and{" "}
          <strong>22</strong>, on the CANivore.
        </>,
      ]}
      branch="swerve-vision-shooting"
      time="10 minutes"
    >
      <p>
        This page is optional. The branch adds{" "}
        <code>subsystems/Flywheel.java</code>, one line in <code>Robot</code>{" "}
        and one binding in <code>TeleopOpMode</code>. Drive to Point does not
        build on it, so commit your work to a branch of your own before you
        check that one out.
      </p>

      <LessonSection
        id="four-measurements-every-distance-in-between"
        title="The lookup table"
      >
        <p>
          You cannot measure the right speed at every distance. So measure a few
          and let the code fill the gaps.
        </p>

        <p>
          <code>InterpolatingDoubleTreeMap</code> does the filling in. Hand it
          pairs of distance and speed. Between two rows it draws a straight line
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
          Past your last row the map returns that row&apos;s value and stops
          climbing. With this table, 3.5, 4 and 9 meters all return{" "}
          <code>60.0</code>, so measure out as far as you plan to shoot.
        </p>
      </LessonSection>

      <LessonSection
        id="the-constructor-table-follower"
        title="The constructor"
      >
        <p>
          The constructor fills the table, applies the config pasted from Tuner
          X to the leader, and tells the second motor to copy the first.
        </p>

        <CodeBlock
          language="java"
          title="Flywheel.java: fields and constructor"
          filename="src/main/java/frc/robot/subsystems/Flywheel.java"
          code={`public class Flywheel implements Mechanism {
  // The point we are shooting at, from the blue alliance corner, in meters. Set the real goal.
  private static final Translation2d TARGET = new Translation2d(3, 5);

  private final CANBus canivore = new CANBus("canivore");
  private final TalonFX leader = new TalonFX(21, canivore);
  private final TalonFX follower = new TalonFX(22, canivore);

  // Asks the motor to ramp to a target speed instead of jumping to it.
  private final MotionMagicVelocityVoltage velocityOut = new MotionMagicVelocityVoltage(0);

  private final DriveMechanism drivetrain;

  // Distance in meters -> flywheel speed in rotations per second. Gaps are filled in for you.
  private final InterpolatingDoubleTreeMap table = new InterpolatingDoubleTreeMap();

  // Everything logged here lands under Flywheel/, live on the dashboard and in the log file.
  private final TelemetryTable telemetry = Telemetry.getTable(getName());

  public Flywheel(DriveMechanism drivetrain) {
    this.drivetrain = drivetrain;

    // Placeholders. Replace every row with speeds you measured on your own robot.
    table.put(0.0, 0.0);
    table.put(1.0, 10.0);
    table.put(2.0, 30.0);
    table.put(3.0, 60.0);

    // Pasted from Tuner X. Every gain is 0.0 until you paste yours over it.
    final TalonFXConfiguration talonFXCfg = new TalonFXConfiguration() /* ... */;

    leader.getConfigurator().apply(talonFXCfg);

    // The follower copies the leader, spinning the opposite direction.
    follower.setControl(new Follower(leader.getDeviceID(), MotorAlignmentValue.Opposed));
  }`}
        />

        <Split>
          <div className="measure flex flex-col gap-pad [&>p]:m-0 [&>p]:prose-body">
            <p>
              Generate the config from the leader in Tuner X and paste it whole,
              as in <strong>Mechanisms</strong>.
            </p>
            <p>
              <code>MotorAlignmentValue.Opposed</code> makes the follower spin
              backward relative to the leader. Set it the other way and the two
              motors shove against each other.
            </p>
          </div>
          <MarginNote label="Zero until you paste">
            The branch ships every gain at <code>0.0</code>, so the wheel does
            not move until your own config replaces it.
          </MarginNote>
        </Split>
      </LessonSection>

      <LessonSection id="measure-the-distance" title="Measure, look up, send">
        <CodeBlock
          language="java"
          title="Flywheel.java: commands and helpers"
          filename="src/main/java/frc/robot/subsystems/Flywheel.java"
          code={`  /** Keep setting the speed from the live distance to the goal. A hold: it never finishes. */
  public Command distanceShoot() {
    return runRepeatedly(() -> setVelocity(table.get(distanceToTarget()))).named("distanceShoot");
  }

  /** Stop the flywheel and keep it stopped. Never finishes. */
  public Command stop() {
    return runRepeatedly(() -> stopMotor()).named("stop");
  }

  /** Distance in meters from where the robot thinks it is to the goal. */
  private double distanceToTarget() {
    double distance = drivetrain.getPose().getTranslation().getDistance(TARGET);
    telemetry.log("DistanceToTargetMeters", distance);
    return distance;
  }

  private void setVelocity(double rps) {
    telemetry.log("TargetVelocityRps", rps);
    leader.setControl(velocityOut.withVelocity(RotationsPerSecond.of(rps)));
  }

  private void stopMotor() {
    leader.stopMotor();
  }`}
        />

        <p>
          Read the distance line right to left. <code>getTranslation()</code>{" "}
          drops the heading off the pose, and <code>getDistance(TARGET)</code>{" "}
          is the distance you would measure with a tape. The pose is odometry
          corrected by AprilTag sightings, so this number carries that error.
        </p>

        <p>
          <code>runRepeatedly(...)</code> runs its body every scheduler loop.
          Measure, look up and send all happen again while the robot is still
          driving, so the speed follows the distance.
        </p>
      </LessonSection>

      <LessonSection id="own-it-in-robot" title="Own it, bind it">
        <p>
          Add the flywheel to <code>Robot</code>, one line below the vision
          field:{" "}
          <code>
            public final Flywheel flywheel = new Flywheel(drivetrain);
          </code>
          . Java will not let a field read one declared after it, so above the
          drivetrain the build stops with <code>illegal forward reference</code>
          .
        </p>

        <CodeBlock
          language="java"
          title="TeleopOpMode.java: under the left-bumper binding"
          filename="src/main/java/frc/robot/opmodes/TeleopOpMode.java"
          code={`    // Right trigger: spin up for the distance to the goal while held, stop when released.
    driver
        .rightTrigger()
        .whileTrue(robot.flywheel.distanceShoot())
        .whileFalse(robot.flywheel.stop());`}
        />

        <p>
          The <code>whileFalse</code> is not optional.{" "}
          <a href="/running-program#latched" className="underline">
            Canceling is not stopping
          </a>
          , so without it the wheel keeps its last speed after you let go.
        </p>
      </LessonSection>

      <LessonSection
        id="the-four-numbers-in-the-table"
        title="Your own numbers"
      >
        <p>
          0, 10, 30 and 60 are placeholders. The right speed depends on the game
          piece and the wheel, so only shooting tells you. <code>TARGET</code>{" "}
          is a placeholder too: take the real goal coordinates from the game
          manual.
        </p>

        <ol className="ml-5 list-decimal space-y-3">
          <li>
            <strong>Park at one distance and stay there.</strong> Check{" "}
            <code>Flywheel/DistanceToTargetMeters</code> against a tape measure.
            If they disagree, fix the pose before the table.
          </li>
          <li>
            <strong>Find the speed that scores.</strong> Change the number in{" "}
            <code>table.put(...)</code>, redeploy, and shoot several times. Big
            steps first, then smaller ones.
          </li>
          <li>
            <strong>Move and do it again.</strong> Three or four distances,
            including the furthest you will shoot from. Then shoot from between
            two rows. If that shot misses, add a row between them.
          </li>
        </ol>
      </LessonSection>

      <LessonSection id="check-your-work" title="Check your work">
        <p>
          Enable Teleop, drive toward <code>TARGET</code> and hold the right
          trigger.
        </p>

        <Box variant="alert-success" title="You should see">
          <ul className="ml-5 list-disc space-y-2">
            <li>
              <code>Flywheel/DistanceToTargetMeters</code> fall as you close in.
            </li>
            <li>
              <code>Flywheel/TargetVelocityRps</code> slide from about 30 at 2
              meters to about 10 at 1 meter, and sit near 20 at 1.5.
            </li>
            <li>
              With your config pasted, the wheel follow that speed and coast
              down when you release.
            </li>
          </ul>
        </Box>

        <p>
          A distance that never changes while you drive is a frozen pose. Fix
          odometry before touching this file. One motor fighting the other is a
          follower aligned the wrong way, or CAN 21 and 22 swapped.
        </p>
      </LessonSection>

      <Quiz
        questions={[
          {
            id: 1,
            question:
              "Your table has table.put(1.0, 10.0) and table.put(2.0, 30.0). The robot is 1.5 meters away. What speed does table.get(1.5) return?",
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
              "Past the last row the map returns the value at that row, every time. A shot from beyond your furthest measured distance is quietly wrong, so measure out as far as you plan to shoot.",
          },
          {
            id: 3,
            question:
              "Why does distanceShoot() use runRepeatedly(...) instead of measuring the distance once when the trigger is pressed?",
            options: [
              "The lookup table can only be read from inside runRepeatedly",
              "It is the only way to give a command a name",
              "runRepeatedly uses less bandwidth on the CAN bus",
              "The robot keeps moving, so the distance changes and the speed has to be looked up again every loop",
            ],
            correctAnswer: 3,
            explanation:
              "A distance measured once is the distance you were at when you pressed the trigger. runRepeatedly re-runs its body every scheduler loop, so measure, look up and send all happen again while the robot is still moving.",
          },
          {
            id: 4,
            question:
              "Where does the flywheel get the distance to the goal from?",
            options: [
              "The Limelight reports the distance directly",
              "drivetrain.getPose() measured against a fixed Translation2d field point",
              "The driver types it into the dashboard before each shot",
              "A rangefinder mounted next to the shooter",
            ],
            correctAnswer: 1,
            explanation:
              "distanceToTarget() calls drivetrain.getPose().getTranslation().getDistance(TARGET). The pose is wheel odometry corrected by AprilTag sightings, so this number inherits its error. Check it against a tape measure before you trust it.",
          },
        ]}
      />
    </PageTemplate>
  );
}
