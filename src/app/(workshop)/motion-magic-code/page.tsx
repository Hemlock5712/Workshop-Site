import PageTemplate from "@/components/PageTemplate";
import LessonSection from "@/components/lesson/LessonSection";
import CodeBlock from "@/components/CodeBlock";
import Box from "@/components/Box";
import Quiz from "@/components/Quiz";
import MechanismSelector from "@/components/lesson/MechanismSelector";
import PairedLesson from "@/components/lesson/PairedLesson";
import { M, Mech } from "@/components/lesson/Mechanism";
import { lessonMetadata } from "@/lib/lessonMetadata";

export const metadata = lessonMetadata("/motion-magic-code");

/**
 * The lesson `mech-3-MotionMagic` waited for, and the page that teaches
 * exactly the `mech-2-Commands` to `mech-3-MotionMagic` diff:
 *
 *   git -C reference/.git-store/Workshop-Code.git diff mech-2-Commands mech-3-MotionMagic
 *
 * One request field swapped, the config re-pasted from Tuner X, the arm's
 * three voltage commands replaced by two position holds, the flywheel's two
 * numbers changed, and one binding losing its `whileFalse`.
 *
 * The config is re-pasted on purpose, not assumed. A student who pasted on
 * `/mechanisms` before tuning, or who copied the branch, has `0.0` gains in
 * the file, and the branch ships them that way so a fresh clone holds still.
 * Telling everyone to paste again makes the lede and the failure check agree.
 * The code blocks show the shape with `0.0` placeholders, never our gains.
 *
 * Control requests themselves are defined on `/mechanisms#configs-and-requests`.
 * This page only says that the request picked in Tuner X's Control drop-down
 * on `/motion-magic` is the class it sends.
 */
export default function MotionMagicCode() {
  return (
    <PageTemplate
      title="Motion Magic in Code"
      lede="You have already run Motion Magic from the Control drop-down in Tuner X. This lesson sends the same request from code. It takes one new field, a fresh paste of your tuned config, and commands that name a target."
      needs={[
        <>
          Buttons moving your mechanism, from{" "}
          <strong>Hardware Simulation</strong>.
        </>,
        <>
          Gains tuned on the bench in <strong>PID Tuning in Tuner X</strong> and{" "}
          <strong>Motion Magic in Tuner X</strong>.
        </>,
      ]}
      branch="mech-3-MotionMagic"
      time="10 minutes"
    >
      <MechanismSelector />

      <PairedLesson kind="tuner" to="/motion-magic" />

      <LessonSection id="the-request" title="The request from Tuner X">
        <p>
          On <strong>Motion Magic in Tuner X</strong> you set the Control
          drop-down to <Mech for="arm">Motion Magic Voltage</Mech>
          <Mech for="flywheel">Motion Magic Velocity Voltage</Mech>, gave it a
          target, and watched the <M k="noun" /> follow a profile. That
          drop-down picks a{" "}
          <a href="/mechanisms#configs-and-requests" className="underline">
            control request
          </a>
          , and the Java class has the same name. Swap the{" "}
          <code>VoltageOut</code> field for it.
        </p>

        <Mech for="arm">
          <CodeBlock
            language="java"
            title="Arm.java: the request field"
            filename="src/main/java/first/robot/mechanisms/Arm.java"
            code={`  // Moves the arm to a target angle along a smooth Motion Magic ramp.
  private final MotionMagicVoltage positionOut = new MotionMagicVoltage(0);`}
          />
        </Mech>

        <Mech for="flywheel">
          <CodeBlock
            language="java"
            title="Flywheel.java: the request field"
            filename="src/main/java/first/robot/mechanisms/Flywheel.java"
            code={`  // Asks the motor to ramp to a target speed instead of jumping to it.
  private final MotionMagicVelocityVoltage velocityOut = new MotionMagicVelocityVoltage(0);`}
          />
        </Mech>

        <p>
          Its import has been at the top of the file since{" "}
          <strong>Mechanisms</strong>. Delete the{" "}
          <code>import com.ctre.phoenix6.controls.VoltageOut;</code> line, since
          nothing uses it any more.
        </p>
      </LessonSection>

      <LessonSection id="the-config" title="Paste your tuned config">
        <p>
          The request names a target. The gains decide how hard the motor works
          to reach it, and they live in the config. The config in your file may
          hold <code>0.0</code> gains. The branch ships them so a fresh clone
          holds still, and a paste made before you tuned carries zeros too. So
          paste again.
        </p>
        <ol className="ml-5 list-decimal space-y-3">
          <li>
            In Tuner X, open the <M k="noun" />
            &apos;s config panel, press the three dots, and choose{" "}
            <strong>Generate Code</strong>.
          </li>
          <li>
            Select the whole{" "}
            <code>final TalonFXConfiguration talonFXCfg = ...;</code> statement
            in the constructor and paste over it. Leave{" "}
            <code>motor.getConfigurator().apply(talonFXCfg);</code> under it.
          </li>
          <li>
            Check that <code>withSlot0</code> and the Motion Magic values hold
            the numbers from your bench, not zeros.
          </li>
        </ol>

        <Mech for="arm">
          <CodeBlock
            language="java"
            title="Arm.java: the shape of the paste, with your numbers in place of 0.0"
            code={`    final TalonFXConfiguration talonFXCfg =
        new TalonFXConfiguration()
            .withMotorOutput(
                new MotorOutputConfigs()
                    .withNeutralMode(NeutralModeValue.Coast)
                    .withInverted(InvertedValue.CounterClockwise_Positive))
            .withSlot0(
                new Slot0Configs()
                    .withKG(0.0)
                    .withKS(0.0)
                    .withKP(0.0)
                    .withKD(0.0)
                    .withGravityType(GravityTypeValue.Arm_Cosine))
            .withMotionMagic(
                new MotionMagicConfigs()
                    .withMotionMagicCruiseVelocity(RotationsPerSecond.of(0.0))
                    .withMotionMagicAcceleration(RotationsPerSecondPerSecond.of(0.0))
                    .withMotionMagicExpo_kV(
                        Volts.per(RotationsPerSecond).ofNative(0.119999997317791))
                    .withMotionMagicExpo_kA(
                        Volts.per(RotationsPerSecondPerSecond).ofNative(0.10000000149011612)))
            .withFeedback(
                new FeedbackConfigs()
                    .withFeedbackRemoteSensorID(32)
                    .withFeedbackSensorSource(FeedbackSensorSourceValue.RemoteCANcoder));`}
          />
        </Mech>

        <Mech for="flywheel">
          <CodeBlock
            language="java"
            title="Flywheel.java: the shape of the paste, with your numbers in place of 0.0"
            code={`    final TalonFXConfiguration talonFXCfg =
        new TalonFXConfiguration()
            .withMotorOutput(
                new MotorOutputConfigs()
                    .withNeutralMode(NeutralModeValue.Coast)
                    .withInverted(InvertedValue.Clockwise_Positive))
            .withSlot0(new Slot0Configs().withKS(0.0).withKV(0.0).withKP(0.0))
            .withMotionMagic(
                new MotionMagicConfigs()
                    .withMotionMagicCruiseVelocity(RotationsPerSecond.of(0.0))
                    .withMotionMagicAcceleration(RotationsPerSecondPerSecond.of(0.0))
                    .withMotionMagicExpo_kV(
                        Volts.per(RotationsPerSecond).ofNative(0.119999997317791))
                    .withMotionMagicExpo_kA(
                        Volts.per(RotationsPerSecondPerSecond).ofNative(0.10000000149011612)));`}
          />
        </Mech>
      </LessonSection>

      <LessonSection id="the-commands" title="Name targets, not volts">
        <Mech for="arm" as="div" className="flex flex-col gap-pad">
          <p>
            An arm that holds an angle does not need a slow push, a fast push
            and a stop. Delete <code>runSlow</code>, <code>runFast</code>,{" "}
            <code>stop</code>, <code>setVoltage</code> and{" "}
            <code>stopMotor</code>, and put these in their place.
          </p>
          <CodeBlock
            language="java"
            title="Arm.java: the commands"
            code={`  /**
   * Move to vertical, 0.25 rotations or 90 degrees, and hold it there. This is the stowed
   * position for transport. Never finishes.
   */
  public Command vertical() {
    return runRepeatedly(() -> setPosition(0.25)).named("vertical (hold)");
  }

  /**
   * Move to horizontal, 0.5 rotations or 180 degrees, and hold it there. This is the ground
   * intake position. Never finishes.
   */
  public Command horizontal() {
    return runRepeatedly(() -> setPosition(0.5)).named("horizontal (hold)");
  }

  private void setPosition(double rotations) {
    motor.setControl(positionOut.withPosition(rotations));
  }`}
          />
          <p>
            Nothing binds <code>horizontal</code> yet. Workshop 4 uses it.
          </p>
        </Mech>

        <Mech for="flywheel" as="div" className="flex flex-col gap-pad">
          <p>
            The flywheel keeps all three commands and <code>stopMotor</code>.
            Replace <code>setVoltage</code> with <code>setVelocity</code>, and
            change the two numbers from volts to rotations per second.
          </p>
          <CodeBlock
            language="java"
            title="Flywheel.java: what changes"
            code={`  /** Spin the flywheel at 25 rotations per second and hold it. Never finishes. */
  public Command runSlow() {
    return runRepeatedly(() -> setVelocity(25.0)).named("runSlow (hold)");
  }

  /** Spin the flywheel at 75 rotations per second and hold it. Never finishes. */
  public Command runFast() {
    return runRepeatedly(() -> setVelocity(75.0)).named("runFast (hold)");
  }

  private void setVelocity(double rps) {
    motor.setControl(velocityOut.withVelocity(RotationsPerSecond.of(rps)));
  }`}
          />
        </Mech>
      </LessonSection>

      <LessonSection id="the-opmode" title="Update the bindings">
        <Mech for="arm" as="div" className="flex flex-col gap-pad">
          <p>
            <code>robot.arm.stop()</code> is gone, so the left-trigger line in{" "}
            <code>MyTeleop.java</code> loses its <code>whileFalse</code>.
          </p>
          <CodeBlock
            language="java"
            title="MyTeleop.java: the arm binding"
            filename="src/main/java/first/robot/opmode/MyTeleop.java"
            code={`    // Hold the left trigger to drive the arm to its vertical position. Releasing cancels the
    // command; the position request stays applied, so the arm holds where it is.
    driver.leftTrigger().whileTrue(robot.arm.vertical());`}
          />
          <p>
            Releasing the trigger cancels the command, and the motor keeps
            applying the last request it received. On a voltage request that was
            the hazard in <strong>Hardware Simulation</strong>. On a position
            request it is what you want: the arm holds the target against
            gravity.
          </p>
        </Mech>
        <Mech for="flywheel" as="div" className="flex flex-col gap-pad">
          <p>
            The flywheel bindings in <code>MyTeleop.java</code> do not change. A
            wheel left on its last velocity request keeps spinning, so they keep
            their <code>whileFalse</code>.
          </p>
        </Mech>
      </LessonSection>

      <LessonSection id="check-your-work" title="Check your work">
        <p>
          Start <strong>Hardware Sim Robot Code</strong>, pick Teleoperated and
          your OpMode, enable, and hold the binding. The build runs on the way,
          so a compile error shows up here.
        </p>
        <Box variant="alert-success" title="You should see">
          <ul className="ml-5 list-disc space-y-2">
            <Mech for="arm" as="li">
              The arm drive to vertical and stop there, however long you hold.
            </Mech>
            <Mech for="arm" as="li">
              The arm stay at vertical when you release.
            </Mech>
            <Mech for="flywheel" as="li">
              The wheel come up to 75 rotations per second and hold it on the
              right trigger, then settle at 25 when you release.
            </Mech>
            <Mech for="flywheel" as="li">
              The same speeds every run, whatever the battery is doing.
            </Mech>
          </ul>
        </Box>
        <p>
          A <M k="noun" /> that does not move at all still has <code>0.0</code>{" "}
          gains, so repeat the paste. One that overshoots and hunts is a tuning
          problem. Fix it in Tuner X with{" "}
          <a href="/pid-control" className="underline">
            PID Tuning in Tuner X
          </a>
          , then generate and paste again.
        </p>
      </LessonSection>

      <Quiz
        questions={[
          {
            id: 1,
            question:
              "You enable, hold the binding, and the mechanism does not move. The build was clean. What do you check first?",
            options: [
              "Whether the binding needs a whileFalse to start the command",
              "Whether MotionMagicVoltage needs a second apply() call",
              "Whether the config in the constructor still has 0.0 gains, and paste your generated config again",
              "Whether the scheduler line is still in robotPeriodic()",
            ],
            correctAnswer: 2,
            explanation:
              "With every gain at 0.0 the loop computes zero volts for any target, so the motor sits still and nothing errors. The branch ships that way on purpose. Generate Code in Tuner X and paste over the whole statement.",
          },
          {
            id: 2,
            question:
              "After deleting the arm's old commands, the build fails in MyTeleop.java on robot.arm.stop(). What is the fix?",
            options: [
              "Delete .whileFalse(robot.arm.stop()) from the left-trigger line",
              "Put stop() back on Arm so the binding compiles",
              "Change it to whileFalse(robot.arm.horizontal())",
              "Change whileTrue to onTrue so no whileFalse is needed",
            ],
            correctAnswer: 0,
            explanation:
              "A position request holds its target after the command is canceled, so the arm binding needs nothing on the release. Binding horizontal there would compile, but the arm would swing to horizontal every time you let go.",
          },
          {
            id: 3,
            question:
              "You release the left trigger halfway through the move to vertical. What does the arm do?",
            options: [
              "Drops, because canceling the command zeroes the motor",
              "Swings back to where it started",
              "Stops where it is and holds there",
              "Carries on to vertical and holds it, because the last position request is still applied",
            ],
            correctAnswer: 3,
            explanation:
              "Canceling ends the command and sends nothing to the motor. The TalonFX keeps following the last request it received, which names 0.25 rotations, so it finishes the profile and holds there.",
          },
          {
            id: 4,
            question:
              "The mechanism passes its target, comes back, and passes it again before it settles. Where does the fix go?",
            options: [
              "Change the target number in the command",
              "Retune in Tuner X, then generate and paste the config again",
              "Add a whileFalse to the binding",
              "Send the request twice per loop",
            ],
            correctAnswer: 1,
            explanation:
              "Overshoot is the gains, and the gains belong in Tuner X, where you can plot the response. Fix them there with the PID tuning procedure, then paste the new config so the code carries the same numbers as the device.",
          },
        ]}
      />
    </PageTemplate>
  );
}
