import PageTemplate from "@/components/PageTemplate";
import LessonSection from "@/components/lesson/LessonSection";
import CodeBlock from "@/components/CodeBlock";
import Box from "@/components/Box";
import Quiz from "@/components/Quiz";
import MechanismSelector from "@/components/lesson/MechanismSelector";
import { M, Mech } from "@/components/lesson/Mechanism";

/**
 * The lesson `mech-3-MotionMagic` waited for.
 *
 * The branch existed from the start and no page embedded it, so the course
 * tuned gains in Tuner X in Workshop 1 and then never spent them. This page is
 * that handoff: paste the generated config again, now that it carries gains,
 * swap the control request, and the commands start naming targets.
 *
 * Generate Code itself is taught on `/building-subsystems`, where a student
 * pastes an open-loop config to get inversion and neutral mode right. Do not
 * repeat the screenshot here. What is new on this page is that the same paste
 * now carries Slot0 and Motion Magic values.
 *
 * Deliberately small. One field, one paste, the commands renaming, and the one
 * new idea: a position hold needs no `whileFalse`, because the controller keeps
 * applying the target after the command is canceled.
 */
export default function MotionMagicCode() {
  return (
    <PageTemplate
      title="Motion Magic in Code"
      lede="The gains you measured in Tuner X came across with the config you already pasted. Nothing left to configure: swap the control request, and the commands stop asking for volts and start naming a target."
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

      <LessonSection id="the-request" title="Swap the control request">
        <p>
          Every command so far pushed a voltage and hoped. The gains to do
          better are already in your <M k="file" />. Generate Code read them off
          the device you tuned in Workshop 1, and they came across with the rest
          of the config on <strong>Mechanisms</strong>. Nothing there needs
          touching.
        </p>
        <p>
          What changes is the request. <code>VoltageOut</code> goes, and one
          that names a target takes its place. Nothing to import. The class you
          need has been at the top of the file since <strong>Mechanisms</strong>
          . The only import that moves is <code>VoltageOut</code>, leaving.
        </p>

        <Mech for="arm">
          <CodeBlock
            language="java"
            title="Arm.java: the field"
            filename="src/main/java/first/robot/mechanisms/Arm.java"
            code={`  // Moves the arm to a target angle along a smooth Motion Magic ramp.
  private final MotionMagicVoltage positionOut = new MotionMagicVoltage(0);`}
          />
        </Mech>

        <Mech for="flywheel">
          <CodeBlock
            language="java"
            title="Flywheel.java: the field"
            filename="src/main/java/first/robot/mechanisms/Flywheel.java"
            code={`  // Asks the motor to ramp to a target speed instead of jumping to it.
  private final MotionMagicVelocityVoltage velocityOut = new MotionMagicVelocityVoltage(0);`}
          />
        </Mech>
      </LessonSection>

      <LessonSection id="the-commands" title="Name targets, not volts">
        <p>
          Rename the private <code>setVoltage</code> to{" "}
          <code>
            <M k="setter" />
          </code>{" "}
          and give it the new request to send. Leave the old name and the
          commands below have nothing to call. Nothing else about them moves:
          still <code>runRepeatedly</code>, still <code>.named(...)</code>,
          still holds.
        </p>

        <Mech for="arm">
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
        </Mech>

        <Mech for="flywheel">
          <CodeBlock
            language="java"
            title="Flywheel.java: the commands"
            code={`  /** Spin the flywheel at 25 rotations per second and hold it. Never finishes. */
  public Command runSlow() {
    return runRepeatedly(() -> setVelocity(25.0)).named("runSlow (hold)");
  }

  /** Spin the flywheel at 75 rotations per second and hold it. Never finishes. */
  public Command runFast() {
    return runRepeatedly(() -> setVelocity(75.0)).named("runFast (hold)");
  }

  /** Stop the flywheel and keep it stopped. Never finishes. */
  public Command stop() {
    return runRepeatedly(this::stopMotor).named("stop (hold)");
  }

  private void setVelocity(double rps) {
    motor.setControl(velocityOut.withVelocity(RotationsPerSecond.of(rps)));
  }`}
          />
        </Mech>
      </LessonSection>

      <LessonSection id="the-opmode" title="Update the bindings">
        <CodeBlock
          language="java"
          title="MyTeleop.java: the constructor"
          filename="src/main/java/first/robot/opmode/MyTeleop.java"
          code={`  public MyTeleop(Robot robot) {
    // Hold the left trigger to drive the arm to its vertical position. Releasing cancels the
    // command; the position request stays applied, so the arm holds where it is.
    driver.leftTrigger().whileTrue(robot.arm.vertical());

    // Right trigger: spin fast while held, drop back to the slow hold speed when released.
    driver.rightTrigger().whileTrue(robot.flywheel.runFast()).whileFalse(robot.flywheel.runSlow());

    // A: spin fast while held, stop when released.
    driver.a().whileTrue(robot.flywheel.runFast()).whileFalse(robot.flywheel.stop());
  }`}
        />

        <Box variant="alert-info" title="Position needs no whileFalse">
          <p>
            The arm binding is a bare <code>whileTrue</code>. Releasing the
            trigger cancels the command, and the controller carries on applying
            the last position request, so the arm holds where it got to. That is
            the trap from <strong>OpModes</strong> working for you rather than
            against you. Speed is different: a flywheel left on its last target
            keeps spinning, so those bindings keep their <code>whileFalse</code>
            .
          </p>
        </Box>
      </LessonSection>

      <LessonSection id="check-your-work" title="Check your work">
        <p>
          Start <strong>WPILib: Hardware Sim Robot Code</strong> and hold your
          binding. It builds on the way, so a compile error turns up here
          without a separate build step.
        </p>
        <Box variant="alert-success" title="You should see">
          <ul className="ml-5 list-disc space-y-2">
            <Mech for="arm" as="li">
              The arm drive to the target and stop there, rather than push for
              as long as you hold.
            </Mech>
            <Mech for="arm" as="li">
              The arm stay put when you release, holding against gravity.
            </Mech>
            <Mech for="flywheel" as="li">
              The wheel come up to a speed and hold it, rather than climb for as
              long as the button is down.
            </Mech>
            <Mech for="flywheel" as="li">
              The same speed every time, whatever the battery is doing.
            </Mech>
          </ul>
        </Box>
        <p>
          A mechanism that does not move at all is the giveaway that the{" "}
          <code>0.0</code> gains are still in the file. One that overshoots and
          hunts is a real tuning problem, and it belongs back in Tuner X rather
          than in the Java.
        </p>
      </LessonSection>

      <Quiz
        questions={[
          {
            id: 1,
            question:
              "Why does the arm binding use a bare whileTrue, with no whileFalse behind it?",
            options: [
              "Releasing cancels the command, and the controller keeps applying the last position request, so the arm holds where it is",
              "The scheduler zeroes a mechanism as soon as nothing commands it",
              "A position command finishes on its own, so there is nothing to cancel",
              "whileFalse only works with VoltageOut requests",
            ],
            correctAnswer: 0,
            explanation:
              "Canceling a command never reaches the motor controller. With a voltage request that is a hazard, so something has to take over. With a position request it is the behavior you want: the controller holds the target it was last given.",
          },
          {
            id: 3,
            question: "Where do the numbers in this config come from?",
            options: [
              "Tuner X computes them the first time the robot program connects",
              "Workshop 1, measured on the bench and read back out with Generate Code",
              "The Phoenix 6 documentation's recommended starting values",
              "They are calculated from the mechanism's mass and gearing at startup",
            ],
            correctAnswer: 1,
            explanation:
              "You tuned them on the bench two workshops ago and they have been on the device since. Generate Code reads back what the device already holds. That is the reason this lesson pastes rather than types.",
          },
        ]}
      />
    </PageTemplate>
  );
}
