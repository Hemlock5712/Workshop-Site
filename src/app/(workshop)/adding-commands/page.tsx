import PageTemplate from "@/components/PageTemplate";
import LessonSection from "@/components/lesson/LessonSection";
import CodeBlock from "@/components/CodeBlock";
import Box from "@/components/Box";
import GitHubContent from "@/components/GitHubContent";
import Quiz from "@/components/Quiz";
import { Split } from "@/components/lesson/Prose";
import MechanismSelector from "@/components/lesson/MechanismSelector";
import { M, Mech } from "@/components/lesson/Mechanism";

/**
 * Written once, read twice — see `src/data/mechanisms.ts`.
 *
 * "Three commands on the arm" and "Repeat on the flywheel" were the same
 * section twice, and the second one opened by telling the reader to repeat all
 * of it. They are one section now, and which mechanism it is about comes from
 * the question at the top.
 *
 * The binding section stays shared and stays last: `TeleopOpMode` is one file
 * that names both mechanisms, so it is not a fork, and it is the reason the
 * command section ends by sending the reader back to write the other one.
 */
export default function AddingCommands() {
  return (
    <PageTemplate
      title="Writing Commands"
      lede="On branch mech-2-Commands the voltage setter goes private and three commands take its place. You write the same three on both mechanisms, then bind them to a controller."
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
      ]}
      branch="mech-2-Commands"
      time="11 minutes"
    >
      <MechanismSelector />

      <Split>
        <div className="measure flex flex-col gap-pad [&>p]:m-0 [&>p]:prose-body">
          <p>
            Right now anything in the project can call{" "}
            <code>
              <M k="noun" />
              .setVoltage(6.0)
            </code>
            . Two callers, two voltages, one loop, and the motor takes whichever
            ran last.
          </p>
          <p>
            Commands close that door. The scheduler hands the mechanism to one
            command at a time, and a private setter forces every caller through
            one.
          </p>
        </div>
      </Split>

      <LessonSection id="make-the-setter-private" title="Close the setter">
        <p>
          Open{" "}
          <code>
            <M k="path" />
          </code>
          . Three edits, none of them longer than a line.
        </p>
        <ol className="ml-5 list-decimal space-y-3">
          <li>
            Change <code>public void setVoltage</code> to{" "}
            <code>private void setVoltage</code>. Nothing outside{" "}
            <code>
              <M k="name" />
            </code>{" "}
            calls it yet, so the build stays clean.
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
      </LessonSection>

      <LessonSection id="your-first-command" title="Three commands">
        <p>Three methods, and they all look alike.</p>

        <Mech for="arm">
          <CodeBlock
            language="java"
            title="Arm.java: the three commands"
            code={`/** Push the arm with a gentle voltage and keep pushing. Never finishes. */
public Command runSlow() {
  return runRepeatedly(() -> setVoltage(3.0)).named("runSlow (hold)");
}

/** Push the arm with a stronger voltage and keep pushing. Never finishes. */
public Command runFast() {
  return runRepeatedly(() -> setVoltage(6.0)).named("runFast (hold)");
}

/** Stop the arm motor and keep it stopped. Never finishes. */
public Command stop() {
  return runRepeatedly(motor::stopMotor).named("stop (hold)");
}`}
          />
        </Mech>

        <Mech for="flywheel">
          <CodeBlock
            language="java"
            title="Flywheel.java: the three commands"
            code={`/** Spin the flywheel with a gentle voltage and hold it there. Never finishes. */
public Command runSlow() {
  return runRepeatedly(() -> setVoltage(3.0)).named("runSlow (hold)");
}

/** Spin the flywheel with a stronger voltage and hold it there. Never finishes. */
public Command runFast() {
  return runRepeatedly(() -> setVoltage(6.0)).named("runFast (hold)");
}

/** Stop the flywheel and keep it stopped. Never finishes. */
public Command stop() {
  return runRepeatedly(motor::stopMotor).named("stop (hold)");
}`}
          />
        </Mech>

        <p>
          Three things happen on the <code>runSlow</code> line.{" "}
          <code>() -&gt; setVoltage(3.0)</code> is a lambda: code written down
          and handed over, not run. The <code>runRepeatedly</code> call comes
          from <code>Mechanism</code>, and it wraps that lambda in a loop which
          fires about fifty times a second. Re-sending every loop also restores
          the request after a motor controller reboots. <code>.named(...)</code>{" "}
          closes the builder and produces the <code>Command</code> the method
          returns. Leave the name off and the build fails, because a builder is
          not a <code>Command</code>.
        </p>

        <p>
          <code>
            <M k="motor" />
            ::stopMotor
          </code>{" "}
          means the same thing as{" "}
          <code>
            () -&gt; <M k="motor" />
            .stopMotor()
          </code>
          . Every name ends in <code>(hold)</code> because{" "}
          <code>runRepeatedly</code> has no exit: these commands run until
          something else claims the mechanism. Even <code>stop()</code> is a
          hold, so it sends zero every loop rather than once.
        </p>

        <p>
          Now switch the question at the top of the page and write the same
          three on the other mechanism. Both need them before the bindings below
          will compile.
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
    driver.leftTrigger().whileTrue(arm.runFast()).whileFalse(arm.stop());

    // Right trigger: spin fast while held, drop back to the slow voltage when released.
    driver.rightTrigger().whileTrue(flywheel.runFast()).whileFalse(flywheel.runSlow());

    // A: spin fast while held, stop when released.
    driver.a().whileTrue(flywheel.runFast()).whileFalse(flywheel.stop());
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
          Every <code>whileTrue</code> here has a <code>whileFalse</code> behind
          it. <code>whileTrue</code> schedules on the press and cancels on the
          release, which hands the mechanism back but sends nothing to the
          motor. <code>whileFalse</code> is what runs in its place, and without
          it <code>arm.runFast()</code> keeps pushing 6 V for the rest of the
          match.
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
          have to spin up from dead. A <code>whileFalse</code> names what runs
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
            Count the public methods in{" "}
            <code>
              <M k="file" />
            </code>
            : three returning <code>Command</code>, plus the constructor.{" "}
            <code>setVoltage</code> is private and returns <code>void</code>.
          </li>
          <li>
            Delete <code>.named(&quot;runSlow (hold)&quot;)</code> and build
            again. The compiler points at that line. Put the name back.
          </li>
          <li>
            Add{" "}
            <code>
              <M k="noun" />
              .setVoltage(6.0);
            </code>{" "}
            to the <code>TeleopOpMode</code> constructor and build. The error
            says <code>setVoltage</code> has private access in{" "}
            <code>
              <M k="name" />
            </code>
            . Delete the line.
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
              Three bindings in <code>TeleopOpMode</code>, each one a{" "}
              <code>whileTrue</code> and a <code>whileFalse</code>.
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

        <Mech for="arm">
          <GitHubContent
            repository="Hemlock5712/Workshop-Code"
            branch="mech-2-Commands"
            filePath="src/main/java/first/robot/mechanisms/Arm.java"
            pr={{ number: 14, focusFile: "Arm.java" }}
          />
        </Mech>

        <Mech for="flywheel">
          <GitHubContent
            repository="Hemlock5712/Workshop-Code"
            branch="mech-2-Commands"
            filePath="src/main/java/first/robot/mechanisms/Flywheel.java"
            pr={{ number: 14, focusFile: "Flywheel.java" }}
          />
        </Mech>
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
              'In runRepeatedly(() -> setVoltage(3.0)).named("runSlow (hold)"), what does runRepeatedly(...) hand back before .named(...) runs?',
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
              "You bind driver.a().whileTrue(flywheel.runFast()) and leave the whileFalse off. You release A. What happens?",
            options: [
              "Nothing changes, because whileTrue only ever schedules",
              "The command is canceled, the flywheel falls back to idle(), and the wheel keeps spinning at 6 V",
              "The build fails: whileTrue requires a matching whileFalse",
              "The flywheel stops: releasing the button cancels the command, and canceling stops the motor",
            ],
            correctAnswer: 1,
            explanation:
              "whileTrue does cancel on the release, so the command really does end. Canceling is not stopping. The flywheel falls back to idle(), which sends nothing at all, so Phoenix keeps applying the last 6 V request. whileFalse(flywheel.stop()) is what sends zero.",
          },
        ]}
      />
    </PageTemplate>
  );
}
