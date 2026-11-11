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
 * One request field swapped, the arm's two voltage commands replaced by two
 * position holds with `stop()` kept, the flywheel's two numbers changed, and
 * one binding losing its `whileFalse`.
 *
 * There is no paste step. The student pasted their tuned config on
 * `/mechanisms`, after tuning in Workshop 1 (owner's November 2026 review).
 * The branch ships `0.0` gains so a fresh clone holds still, which is why the
 * check below still says to repeat the paste if nothing moves.
 *
 * Control requests themselves are defined on `/mechanisms#configs-and-requests`.
 * This page only says that the request picked in Tuner X's Control drop-down
 * on `/motion-magic` is the class it sends.
 */
export default function MotionMagicCode() {
  return (
    <PageTemplate
      title="Motion Magic in Code"
      lede="You have already run Motion Magic from the Control drop-down in Tuner X. This lesson sends the same request from code."
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
      time="6 minutes"
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

        <p>Your editor offers its import.</p>
      </LessonSection>

      <LessonSection id="the-commands" title="Name targets, not volts">
        <Mech for="arm" as="div" className="flex flex-col gap-pad">
          <p>
            Replace <code>setVoltage</code> with <code>setPosition</code>, and
            replace <code>runSlow</code> and <code>runFast</code> with two
            position commands, <code>vertical</code> and <code>horizontal</code>
            . Keep <code>stop</code> and <code>stopMotor</code>: you may still
            want to stop the arm while it is moving to a target.
          </p>
          <CodeBlock
            language="java"
            title="Arm.java: the commands"
            code={`  /**
   * Move to vertical, 0.25 rotations or 90 degrees, and hold it there. This is the stowed
   * position for transport. Never finishes.
   */
  public Command vertical() {
    return runRepeatedly(() -> setPosition(0.25)).named("vertical");
  }

  /**
   * Move to horizontal, 0.5 rotations or 180 degrees, and hold it there. This is the ground
   * intake position. Never finishes.
   */
  public Command horizontal() {
    return runRepeatedly(() -> setPosition(0.5)).named("horizontal");
  }

  private void setPosition(double rotations) {
    motor.setControl(positionOut.withPosition(rotations));
  }`}
          />
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
    return runRepeatedly(() -> setVelocity(25.0)).named("runSlow");
  }

  /** Spin the flywheel at 75 rotations per second and hold it. Never finishes. */
  public Command runFast() {
    return runRepeatedly(() -> setVelocity(75.0)).named("runFast");
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
            With closed-loop control, we often want the motor to keep holding
            its position. In <code>MyTeleop.java</code>, switch{" "}
            <code>runFast</code> to <code>vertical</code> and delete the{" "}
            <code>whileFalse(robot.arm.stop())</code>.
          </p>
          <CodeBlock
            language="java"
            title="MyTeleop.java: the arm binding"
            filename="src/main/java/first/robot/opmode/MyTeleop.java"
            code={`    // Hold the left trigger to drive the arm to its vertical position. Releasing cancels the
    // command; the position request stays applied, so the arm finishes the move and holds there.
    robot.driver.leftTrigger().whileTrue(robot.arm.vertical());`}
          />
          <p>
            Releasing the trigger cancels the command, and the motor keeps
            applying the last request it received. On a voltage request that
            would have caused problems, because the motor would never have
            stopped turning. On a position request it is what you want: the arm
            holds the target against gravity.
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
              right trigger, then settle at 25 when you release. Plot its
              velocity in Tuner X to read the numbers.
            </Mech>
          </ul>
        </Box>
        <p>
          A <M k="noun" /> that does not move at all may still have{" "}
          <code>0.0</code> values in its config, so repeat the paste from{" "}
          <a href="/mechanisms#configure-once" className="underline">
            Mechanisms
          </a>
          . One that overshoots and hunts is a tuning problem. Fix it in Tuner X
          with{" "}
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
              "Arm still has stop(). Why does the left-trigger binding no longer end in whileFalse(robot.arm.stop())?",
            options: [
              "A position request keeps holding its target after the command is canceled, and holding is what you want",
              "whileFalse does not work with Motion Magic requests",
              "whileTrue already sends a stop when the trigger is released",
              "stop() only works on voltage requests",
            ],
            correctAnswer: 0,
            explanation:
              "With no whileFalse, the last position request stays applied, so the arm finishes its move and holds there against gravity. stop() would send NeutralOut on the release, and the arm would go limp in coast and stop holding its target.",
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
              "Overshoot is a tuning problem, and tuning belongs in Tuner X, where you can plot the response. Fix them there with the PID tuning procedure, then paste the new config so the code carries the same numbers as the device.",
          },
        ]}
      />
    </PageTemplate>
  );
}
