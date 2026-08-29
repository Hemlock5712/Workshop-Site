import PageTemplate from "@/components/PageTemplate";
import LessonSection from "@/components/lesson/LessonSection";
import CodeBlock from "@/components/CodeBlock";
import Box from "@/components/Box";
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
 * The binding section stays shared and stays last: `MyTeleop` is one file
 * that names both mechanisms, so it is not a fork, and it is the reason the
 * command section ends by sending the reader back to write the other one.
 */
export default function AddingCommands() {
  return (
    <PageTemplate
      title="Writing Commands"
      lede="The voltage setter is private and nothing can reach it. On branch mech-2-Commands three commands become the way in: one slow, one fast, one that holds the mechanism still."
      needs={[
        <>
          Branch <code>mech-1-Mechanisms</code> building clean, with a private{" "}
          <code>setVoltage</code> and <code>stopMotor</code> on <code>Arm</code>{" "}
          and <code>Flywheel</code>.
        </>,
        <>
          Lambdas, method references, and <code>private</code> from{" "}
          <strong>Java Basics</strong>.
        </>,
        <>
          <code>robot.arm</code> and <code>robot.flywheel</code> from{" "}
          <strong>Mechanisms</strong>. The bindings below reach the mechanisms
          through that object.
        </>,
      ]}
      branch="mech-2-Commands"
      time="7 minutes"
    >
      <MechanismSelector />

      <Split>
        <div className="measure flex flex-col gap-pad [&>p]:m-0 [&>p]:prose-body">
          <p>
            The <M k="noun" /> has a working motor and no way yet to ask it for
            anything. A command is the way in, and it wraps that private setter.
            The scheduler hands the mechanism to one command at a time, so two
            of them can never fight over the same motor.
          </p>
        </div>
      </Split>

      <LessonSection id="add-the-command-import" title="One import">
        <p>
          Open{" "}
          <code>
            <M k="path" />
          </code>
          . One line goes in at the top, alphabetically, just above{" "}
          <code>Mechanism</code>.
        </p>

        <CodeBlock
          language="java"
          title="the bottom of the import block"
          code={`import com.ctre.phoenix6.signals.NeutralModeValue;
import org.wpilib.command3.Command;
import org.wpilib.command3.Mechanism;`}
          highlightLines={[2]}
        />

        <p>
          That is the only edit to what is already in the file.{" "}
          <code>setVoltage</code> is already <code>private</code>, and the stop
          helper is already called <code>stopMotor</code>, so the command below
          can take the name <code>stop</code> without displacing anything.
        </p>
      </LessonSection>

      <LessonSection id="your-first-command" title="Three commands">
        <p>Three methods, and they all look alike.</p>

        <Mech for="arm">
          <CodeBlock
            language="java"
            title="Arm.java: the three commands"
            code={`  // Each command uses runRepeatedly, which runs its action every loop while the
  // command is scheduled. Every one of them is a hold: it never finishes on its own.

  /** Push the arm at 3 volts and keep pushing. Never finishes. */
  public Command runSlow() {
    return runRepeatedly(() -> setVoltage(3.0)).named("runSlow (hold)");
  }

  /** Push the arm at 6 volts and keep pushing. Never finishes. */
  public Command runFast() {
    return runRepeatedly(() -> setVoltage(6.0)).named("runFast (hold)");
  }

  /** Stop the arm motor and keep it stopped. Never finishes. */
  public Command stop() {
    return runRepeatedly(this::stopMotor).named("stop (hold)");
  }`}
          />
        </Mech>

        <Mech for="flywheel">
          <CodeBlock
            language="java"
            title="Flywheel.java: the three commands"
            code={`  // Same setup as Arm. runRepeatedly runs the action every loop while the command
  // is scheduled. Every one of these is a hold: it never finishes on its own.

  /** Spin the flywheel at 3 volts and hold it there. Never finishes. */
  public Command runSlow() {
    return runRepeatedly(() -> setVoltage(3.0)).named("runSlow (hold)");
  }

  /** Spin the flywheel at 6 volts and hold it there. Never finishes. */
  public Command runFast() {
    return runRepeatedly(() -> setVoltage(6.0)).named("runFast (hold)");
  }

  /** Stop the flywheel and keep it stopped. Never finishes. */
  public Command stop() {
    return runRepeatedly(this::stopMotor).named("stop (hold)");
  }`}
          />
        </Mech>

        <p>
          Three things happen on the <code>runSlow</code> line.
        </p>

        <ul className="ml-5 list-disc space-y-2">
          <li>
            <code>() -&gt; setVoltage(3.0)</code> is a lambda. It does not call{" "}
            <code>setVoltage</code> here. It hands that call to{" "}
            <code>runRepeatedly</code>, which makes it for you every loop.
          </li>
          <li>
            <code>runRepeatedly</code> comes from <code>Mechanism</code>, which
            is what the class extends.
          </li>
          <li>
            <code>.named(...)</code> gives the command a name. Names show up in
            logs and on the dashboard, which is what makes one findable when it
            misbehaves later.
          </li>
        </ul>

        <p>
          <code>this::stopMotor</code> is the same as{" "}
          <code>() -&gt; stopMotor()</code>, pointing at the private helper from
          last lesson. Every name ends in <code>(hold)</code> because{" "}
          <code>runRepeatedly</code> has no exit: these run until something else
          claims the mechanism. Even <code>stop()</code> holds, sending zero
          every loop rather than once.
        </p>

        <Box variant="alert-warning" title="A hold never finishes">
          <p>
            So never make anything wait for one. A hold inside{" "}
            <code>Command.sequence</code> sticks there forever and the sequence
            never reaches its next step. When a step needs an ending, add it
            where you use the command rather than writing a new method here:{" "}
            <code>
              <M k="noun" />
              .runSlow().until(someCondition)
            </code>
            . The <code>(hold)</code> in every name is there so a stuck sequence
            names its own bug in the log.
          </p>
        </Box>
      </LessonSection>

      <LessonSection id="did-it-work" title="Check your work">
        <p>
          Run <em>WPILib: Build Robot Code</em>. You should see{" "}
          <code>BUILD SUCCESSFUL</code>. If it does not, the error is almost
          always one of these three.
        </p>

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
      </LessonSection>

      <Quiz
        questions={[
          {
            id: 1,
            question:
              "setVoltage is private on both mechanisms. What does keeping it that way buy you?",
            options: [
              "So the only way to move the arm is through a command, which lets the scheduler track who owns the motor",
              "Because Mechanism requires all setters to be private",
              "To hide the voltage constants from other mechanisms",
              "Private methods run faster on SystemCore",
            ],
            correctAnswer: 0,
            explanation:
              "The scheduler tracks which command owns which mechanism, so two commands can never drive the same motor at once. A plain setVoltage(6.0) call from anywhere would go around that bookkeeping entirely, and the scheduler would have no idea it happened.",
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
              "You bind driver.a().whileTrue(robot.flywheel.runFast()) and leave the whileFalse off. You release A. What happens?",
            options: [
              "Nothing changes, because whileTrue only ever schedules",
              "The command is canceled, the flywheel falls back to idle(), and the wheel keeps spinning at 6 V",
              "The build fails: whileTrue requires a matching whileFalse",
              "The flywheel stops: releasing the button cancels the command, and canceling stops the motor",
            ],
            correctAnswer: 1,
            explanation:
              "whileTrue does cancel on the release, so the command really does end. Canceling is not stopping. The flywheel falls back to idle(), which sends nothing at all, so Phoenix keeps applying the last 6 V request. whileFalse(robot.flywheel.stop()) is what sends zero.",
          },
        ]}
      />
    </PageTemplate>
  );
}
