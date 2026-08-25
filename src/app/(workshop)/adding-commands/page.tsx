import PageTemplate from "@/components/PageTemplate";
import LessonSection from "@/components/lesson/LessonSection";
import CodeBlock from "@/components/CodeBlock";
import Box from "@/components/Box";
import GitHubContent from "@/components/GitHubContent";
import Quiz from "@/components/Quiz";
import { MarginNote, Split } from "@/components/lesson/Prose";

export default function AddingCommands() {
  return (
    <PageTemplate
      title="Writing Commands"
      lede="On branch mech-2-Commands the arm's voltage setter goes private, and three commands take its place. You write the same three on the flywheel, then bind all six to a controller. Nothing moves yet: the check on this page is a clean build."
      needs={[
        <>
          Branch <code>mech-1-Mechanisms</code> building clean, with{" "}
          <code>public void setVoltage(double)</code> on <code>Arm</code> and{" "}
          <code>Flywheel</code>.
        </>,
        <>
          Lambdas, method references, and <code>private</code> from{" "}
          <strong>Java Basics</strong>.
        </>,
        <>No hardware. This lesson ends at a build, not a moving motor.</>,
      ]}
      branch="mech-2-Commands"
      time="14 minutes"
    >
      <Split>
        <div className="measure flex flex-col gap-pad [&>p]:m-0 [&>p]:prose-body">
          <p>
            Right now anything in the project can call{" "}
            <code>arm.setVoltage(6.0)</code>. Two callers, two voltages, one
            loop, and the motor takes whichever ran last.
          </p>
          <p>
            Commands close that door. The scheduler hands the arm to one command
            at a time, and a private setter forces every caller through one.
          </p>
        </div>
        <MarginNote label="What you build">
          Three commands on the arm, three on the flywheel, and a teleop OpMode
          that binds them to buttons. Pressing those buttons comes later, in{" "}
          <strong>Deploy and Run</strong>.
        </MarginNote>
      </Split>

      <LessonSection id="make-the-setter-private" title="Close the setter">
        <p>
          Open <code>src/main/java/first/robot/mechanisms/Arm.java</code>. Three
          edits, none of them longer than a line.
        </p>
        <ol className="ml-5 list-decimal space-y-3">
          <li>
            Change <code>public void setVoltage</code> to{" "}
            <code>private void setVoltage</code>. Nothing outside{" "}
            <code>Arm</code> calls it yet, so the build stays clean.
          </li>
          <li>
            Delete <code>public void stop()</code>. A command of the same name
            replaces it below.
          </li>
          <li>
            Add <code>import org.wpilib.command3.Command;</code> to the imports
            at the top.
          </li>
        </ol>

        <CodeBlock
          language="java"
          filename="src/main/java/first/robot/mechanisms/Arm.java"
          code={`private void setVoltage(double voltage) {
  motor.setControl(voltageOut.withOutput(voltage));
}`}
        />
      </LessonSection>

      <LessonSection id="your-first-command" title="Three commands on the arm">
        <p>
          Two constants go next to the hardware fields, then one method. Write
          this one first: five more look like it.
        </p>

        <CodeBlock
          language="java"
          title="Arm.java: the two voltages and runSlow()"
          code={`// Voltages for the two example commands.
private static final double SLOW_VOLTAGE = 3.0;
private static final double FAST_VOLTAGE = 6.0;

/** Push the arm with a gentle voltage and keep pushing. Never finishes. */
public Command runSlow() {
  return runRepeatedly(() -> setVoltage(SLOW_VOLTAGE)).named("runSlow (hold)");
}`}
        />

        <p>
          Three things happen on that one line.{" "}
          <code>() -&gt; setVoltage(SLOW_VOLTAGE)</code> is a lambda: code
          written down and handed over, not run. The <code>runRepeatedly</code>{" "}
          call comes from <code>Mechanism</code>, and it wraps that lambda in a
          loop which fires about fifty times a second. Re-sending every loop
          also restores the request after a motor controller reboots.{" "}
          <code>.named(...)</code> closes the builder and produces the{" "}
          <code>Command</code> the method returns. Leave the name off and the
          build fails, because a builder is not a <code>Command</code>.
        </p>

        <p>Two more, same shape.</p>

        <CodeBlock
          language="java"
          title="Arm.java: all three commands"
          code={`/** Push the arm with a gentle voltage and keep pushing. Never finishes. */
public Command runSlow() {
  return runRepeatedly(() -> setVoltage(SLOW_VOLTAGE)).named("runSlow (hold)");
}

/** Push the arm with a stronger voltage and keep pushing. Never finishes. */
public Command runFast() {
  return runRepeatedly(() -> setVoltage(FAST_VOLTAGE)).named("runFast (hold)");
}

/** Stop the arm motor and keep it stopped. Never finishes. */
public Command stop() {
  return runRepeatedly(motor::stopMotor).named("stop (hold)");
}`}
        />

        <p>
          <code>motor::stopMotor</code> means the same thing as{" "}
          <code>() -&gt; motor.stopMotor()</code>. Every name ends in{" "}
          <code>(hold)</code> because <code>runRepeatedly</code> has no exit:
          these commands run until something else claims the mechanism. Even{" "}
          <code>stop()</code> is a hold, so it sends zero every loop rather than
          once.
        </p>
      </LessonSection>

      <LessonSection id="the-same-three-on" title="Repeat on the flywheel">
        <p>
          Open <code>mechanisms/Flywheel.java</code> and repeat all of it: the
          private setter, the deleted <code>stop()</code>, the{" "}
          <code>Command</code> import, then the three commands at the same two
          voltages. The flywheel runs two motors: a leader on CAN 21 and a
          follower on CAN 22 that spins the other way. The commands talk to{" "}
          <code>leader</code>.
        </p>

        <CodeBlock
          language="java"
          title="Flywheel.java: same three commands, leader motor"
          code={`private static final double SLOW_VOLTAGE = 3.0;
private static final double FAST_VOLTAGE = 6.0;

/** Spin the flywheel with a gentle voltage and hold it there. Never finishes. */
public Command runSlow() {
  return runRepeatedly(() -> setVoltage(SLOW_VOLTAGE)).named("runSlow (hold)");
}

/** Spin the flywheel with a stronger voltage and hold it there. Never finishes. */
public Command runFast() {
  return runRepeatedly(() -> setVoltage(FAST_VOLTAGE)).named("runFast (hold)");
}

/** Stop the flywheel and keep it stopped. Never finishes. */
public Command stop() {
  return runRepeatedly(leader::stopMotor).named("stop (hold)");
}

private void setVoltage(double voltage) {
  leader.setControl(voltageOut.withOutput(voltage));
}`}
        />

        <p>
          You never command the follower. It was told once, in the constructor,
          to copy the leader.
        </p>
      </LessonSection>

      <LessonSection id="bind-them-to-the" title="Bind them to the controller">
        <p>
          Six commands that nothing calls do nothing. Create{" "}
          <code>src/main/java/first/robot/opmode/TeleopOpMode.java</code>. What
          follows is the whole file on the branch, minus the copyright header.
        </p>

        <CodeBlock
          language="java"
          filename="src/main/java/first/robot/opmode/TeleopOpMode.java"
          code={`package first.robot.opmode;

import first.robot.Robot;
import first.robot.mechanisms.Arm;
import first.robot.mechanisms.Flywheel;
import org.wpilib.command3.button.CommandNiDsXboxController;
import org.wpilib.opmode.PeriodicOpMode;
import org.wpilib.opmode.Teleop;

/**
 * The driver's controls. The framework builds this class when "Teleop" is picked
 * on the driver station. The button bindings made in the constructor belong to
 * this OpMode, and the framework removes them on a mode switch. No cleanup code
 * needed.
 *
 * <p>The buttons here run the arm and flywheel commands.
 */
@Teleop(name = "Teleop")
public class TeleopOpMode extends PeriodicOpMode {
  private final CommandNiDsXboxController driver = new CommandNiDsXboxController(0);

  public TeleopOpMode(Robot robot) {
    final Arm arm = robot.arm;
    final Flywheel flywheel = robot.flywheel;

    // Left trigger: push the arm up while held, stop when released.
    driver.leftTrigger().onTrue(arm.runFast()).onFalse(arm.stop());

    // Right trigger: spin fast while held, drop back to the slow voltage when released.
    driver.rightTrigger().onTrue(flywheel.runFast()).onFalse(flywheel.runSlow());

    // A: spin fast while held, stop when released.
    driver.a().onTrue(flywheel.runFast()).onFalse(flywheel.stop());
  }
}`}
        />

        <p>
          The bindings sit in the constructor, so they are made once when the
          mode is built. Both <code>robot.arm</code> and{" "}
          <code>robot.flywheel</code> are public fields on <code>Robot</code>,
          and every OpMode reaches the mechanisms through the <code>Robot</code>{" "}
          it is handed.
        </p>

        <p>
          Every <code>onTrue</code> here has an <code>onFalse</code> behind it.
          Leave the second half off and the motor never stops. An{" "}
          <code>onTrue</code> schedules on the press and does nothing on
          release. The <code>arm.runFast()</code> command is a hold, so it would
          keep pushing 6 V for the rest of the match. What ends it is{" "}
          <code>arm.stop()</code>. It needs the arm too, and a command of equal
          or higher priority takes the mechanism from whatever is on it. Both
          sit at the default priority of 0, so <code>stop()</code> wins by
          arriving second.
        </p>

        <Box
          variant="alert-danger"
          tag="THE TRAP"
          title="Canceling a command does not stop the motor"
        >
          <p>
            Cancel a command with nothing to replace it and the mechanism falls
            back to the <code>idle()</code> command that every{" "}
            <code>Mechanism</code> supplies. <code>idle()</code> sends no
            output. It does not zero the last request, so Phoenix keeps holding
            the voltage it was given and the arm keeps pushing.
          </p>
          <p className="mt-3">
            Stopping the command and stopping the motor are two different jobs.
            Something has to send zero every loop, and hold the mechanism while
            it does. That is the job <code>stop()</code> has.
          </p>
        </Box>

        <p>
          The right trigger releases to <code>flywheel.runSlow()</code>, not{" "}
          <code>flywheel.stop()</code>. A wheel still turning at 3 V does not
          have to spin up from dead. An <code>onFalse</code> names what runs
          next, and a stop is only one of the choices.
        </p>
      </LessonSection>

      <LessonSection id="did-it-work" title="Check your work">
        <p>
          The last two checks break the build on purpose. Read the error before
          you undo it.
        </p>

        <ol className="ml-5 list-decimal space-y-3">
          <li>
            Run <code>./gradlew build</code>, or{" "}
            <em>WPILib: Build Robot Code</em>. You should see{" "}
            <code>BUILD SUCCESSFUL</code>.
          </li>
          <li>
            Count the public methods in <code>Arm.java</code>: three returning{" "}
            <code>Command</code>, plus the constructor. <code>setVoltage</code>{" "}
            is private and returns <code>void</code>.
          </li>
          <li>
            Delete <code>.named(&quot;runSlow (hold)&quot;)</code> and build
            again. The compiler points at that line. Put the name back.
          </li>
          <li>
            Add <code>arm.setVoltage(6.0);</code> to the{" "}
            <code>TeleopOpMode</code> constructor and build. The error says{" "}
            <code>setVoltage</code> has private access in <code>Arm</code>.
            Delete the line.
          </li>
        </ol>

        <Box variant="alert-success" title="You should see">
          <ul className="ml-5 list-disc space-y-2">
            <li>
              Six commands, three per mechanism, every name ending in{" "}
              <code>(hold)</code>.
            </li>
            <li>
              One private <code>setVoltage</code> per mechanism, returning{" "}
              <code>void</code>.
            </li>
            <li>
              Three bindings in <code>TeleopOpMode</code>, each one an{" "}
              <code>onTrue</code> and an <code>onFalse</code>.
            </li>
          </ul>
        </Box>

        <p>Three compile errors cover nearly every failure here.</p>

        <div className="overflow-x-auto">
          <table className="w-full min-w-[560px] border-collapse text-note">
            <thead>
              <tr style={{ borderBottom: "1px solid var(--rule)" }}>
                <th className="px-3 py-2 text-left">Error</th>
                <th className="px-3 py-2 text-left">Cause</th>
                <th className="px-3 py-2 text-left">Fix</th>
              </tr>
            </thead>
            <tbody style={{ color: "var(--tx2)" }}>
              <tr style={{ borderBottom: "1px solid var(--rule-soft)" }}>
                <td className="px-3 py-2">
                  <code>
                    NeedsNameBuilderStage cannot be converted to Command
                  </code>
                </td>
                <td className="px-3 py-2">
                  A <code>.named(...)</code> is missing from that method.
                </td>
                <td className="px-3 py-2">
                  Name the command. javac prints both types package-qualified.
                </td>
              </tr>
              <tr style={{ borderBottom: "1px solid var(--rule-soft)" }}>
                <td className="px-3 py-2">
                  <code>cannot find symbol: method withPriority(int)</code>
                </td>
                <td className="px-3 py-2">
                  A builder method landed after <code>.named(...)</code>.
                </td>
                <td className="px-3 py-2">
                  Move it in front of the name. Same for{" "}
                  <code>whenCanceled</code>.
                </td>
              </tr>
              <tr>
                <td className="px-3 py-2">
                  <code>cannot find symbol: class Command</code>
                </td>
                <td className="px-3 py-2">The import is missing.</td>
                <td className="px-3 py-2">
                  Add <code>import org.wpilib.command3.Command;</code>. This
                  stack is never <code>edu.wpi.first</code>.
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        <p>
          Then read the branch against what you typed. The{" "}
          <strong>GitHub Changes</strong> tab shows the whole{" "}
          <code>mech-1-Mechanisms</code> to <code>mech-2-Commands</code> diff,
          all four files at once.
        </p>

        <GitHubContent
          repository="Hemlock5712/Workshop-Code"
          branch="mech-2-Commands"
          filePath="src/main/java/first/robot/mechanisms/Arm.java"
          pr={{ number: 14, focusFile: "Arm.java" }}
        />
      </LessonSection>

      <Quiz
        questions={[
          {
            id: 1,
            question:
              "Why does mech-2-Commands change setVoltage from public to private?",
            options: [
              "So the only way to move the arm is through a command, which lets the scheduler track who owns the motor",
              "Because Mechanism requires all setters to be private",
              "To hide the voltage constants from other mechanisms",
              "Private methods run faster on SystemCore",
            ],
            correctAnswer: 0,
            explanation:
              "The scheduler tracks which command owns which mechanism, so two commands can never drive the same motor at once. A plain setVoltage(6.0) call from anywhere goes around that bookkeeping, so the door gets closed.",
          },
          {
            id: 2,
            question:
              'In runRepeatedly(() -> setVoltage(SLOW_VOLTAGE)).named("runSlow (hold)"), what does runRepeatedly(...) hand back before .named(...) runs?',
            options: [
              "A Runnable that the scheduler wraps later",
              "A finished Command, ready to schedule",
              "A NeedsNameBuilderStage: a half-built command that is not a Command until it is named",
              "void: runRepeatedly schedules the command immediately",
            ],
            correctAnswer: 2,
            explanation:
              "runRepeatedly returns a NeedsNameBuilderStage, and .named(String) is what turns it into a Command. Leave the name off and the build fails: the method promises a Command and a builder is not one.",
          },
          {
            id: 3,
            question:
              "You bind driver.a().onTrue(flywheel.runFast()) and leave the onFalse off. You release A. What happens?",
            options: [
              "The flywheel stops: releasing the button cancels the command, and canceling stops the motor",
              "runFast() is never canceled, so it keeps re-sending 6 V for the rest of the match",
              "The command is canceled but the wheel keeps spinning anyway",
              "The build fails: onTrue requires a matching onFalse",
            ],
            correctAnswer: 1,
            explanation:
              "onTrue schedules on the press and does nothing on release. runFast() is a hold, so nothing ends it. The onFalse binding is what ends it, by scheduling a command that needs the same mechanism.",
          },
        ]}
      />
    </PageTemplate>
  );
}
