import PageTemplate from "@/components/PageTemplate";
import { MarginNote, Split } from "@/components/lesson/Prose";
import LessonSection from "@/components/lesson/LessonSection";
import CodeBlock from "@/components/CodeBlock";
import Box from "@/components/Box";
import DocumentationButton from "@/components/DocumentationButton";
import Quiz from "@/components/Quiz";
import { GitBranch } from "lucide-react";

/**
 * Lesson 21, and no longer "advanced". It moved out of Workshop 5 because
 * `/autonomous` is two lessons later and builds its whole routine out of
 * `Command.sequence` and `.withTimeout`: composition is a prerequisite for
 * that page, not a victory lap after it. So sequencing leads, `race` follows, and the tour of `.andThen`,
 * `.alongWith`, `Command.parallel` and the coroutine preview is gone. Those
 * belong to the lessons that use them.
 *
 * This is also the first page on the site to show `import static
 * org.wpilib.units.Units.Seconds`, since `/java-basics` stopped pre-teaching
 * static imports. One line of prose introduces it where it appears.
 */
export default function ChainingCommands() {
  return (
    <PageTemplate
      title="Command Composition"
      lede="You have written commands that do one thing while a button is held. An autonomous routine is a list of those commands, run in order. This lesson builds the list."
      needs={[
        <>
          Arm and flywheel commands from <strong>Writing Commands</strong>:{" "}
          <code>runSlow()</code>, <code>runFast()</code>, <code>stop()</code>.
        </>,
        <>
          A <code>TeleopOpMode</code> with working button bindings, from{" "}
          <strong>OpModes</strong>.
        </>,
        <>
          The simulator running, from <strong>Hardware Simulation</strong>.
        </>,
      ]}
      time="About 20 minutes"
    >
      <Split>
        <div className="measure flex flex-col gap-pad [&>p]:m-0 [&>p]:prose-body">
          <p>
            Every mechanism command you have written so far is a{" "}
            <strong>hold</strong>. <code>runRepeatedly(...)</code> re-sends the
            same request every loop and never ends.
          </p>
          <p>
            So the work comes in two parts: give a command an ending, then glue
            the endings together in order.
          </p>
        </div>
        <MarginNote label="Where this goes">
          Autonomous is two lessons away, and its routine is one of these: drive
          off the line, then stop. Every step there needs the ending you are
          about to add.
        </MarginNote>
      </Split>

      <LessonSection id="holds-and-steps" title="Holds and steps">
        <p>
          A hold never reports that it is finished, so a list containing one
          stops there for good. Step two never runs. Nothing errors and nothing
          logs, so the routine looks frozen.
        </p>
        <p>
          <code>.withTimeout(...)</code> wraps a command and ends it after a
          fixed time, finished or not. That turns a hold into a{" "}
          <strong>step</strong>, something with a beginning and an end. Steps
          are what you can put in a list.
        </p>

        <CodeBlock
          language="java"
          title="A hold, and the same hold as a step"
          code={`import static org.wpilib.units.Units.Seconds;

// A hold. Pushes forever, never finishes.
arm.runFast()

// A step. Pushes for one second, then ends.
arm.runFast().withTimeout(Seconds.of(1.0))`}
        />

        <Split>
          <div className="measure flex flex-col gap-pad [&>p]:m-0 [&>p]:prose-body">
            <p>
              The <code>import static</code> line is what lets you write{" "}
              <code>Seconds</code> rather than <code>Units.Seconds</code> every
              time. <code>.withTimeout(...)</code> refuses a bare{" "}
              <code>1.0</code>. It takes a <code>Time</code>, so nobody can pass
              milliseconds where seconds were meant.
            </p>
          </div>
          <MarginNote label="Blunt ending">
            A timeout ends the step after a fixed time, not when the arm
            arrives. Finish Conditions is next and replaces it with a condition
            that watches the real position. The timeout stays on as a backstop.
          </MarginNote>
        </Split>
      </LessonSection>

      <LessonSection id="steps-in-order" title="Steps in order">
        <p>
          <code>Command.sequence(a, b, c)</code> runs <code>a</code> until it
          finishes, then <code>b</code>, then <code>c</code>. You write
          autonomous routines in exactly this shape.
        </p>

        <CodeBlock
          language="java"
          title="TeleopOpMode.java: raise the arm, then spin up"
          code={`Command liftThenSpin =
    Command.sequence(
            // A step: it ends, so the sequence moves on.
            arm.runFast().withTimeout(Seconds.of(1.0)),
            // A hold: the last member, so the group is a hold too.
            flywheel.runFast())
        .named("Lift Then Spin (hold)");`}
        />

        <p>
          <code>Command.sequence(...)</code> hands back a builder rather than a{" "}
          <code>Command</code>. <code>.named(&quot;...&quot;)</code> is what
          finishes it, and leaving it off will not compile. Name the group after
          what it does. If the group is a hold, end the name with{" "}
          <code>(hold)</code>, the way the mechanism commands do.
        </p>
        <p>
          Do not re-name a command that already has one.{" "}
          <code>arm.runFast()</code> arrives finished, so{" "}
          <code>.named(...)</code> on it is a compile error.
        </p>

        <Box
          variant="alert-danger"
          tag="DON'T"
          title="A bare hold in the middle"
        >
          <p>
            Swap the first member for a plain <code>arm.runFast()</code> and the
            sequence sticks there for the rest of the match. When a routine
            looks frozen, a member with no ending is the first thing to check.
          </p>
        </Box>
      </LessonSection>

      <LessonSection id="two-at-once" title="Two things at once">
        <p>
          A sequence is this, then that. A race is this while that.{" "}
          <code>Command.race(...)</code> starts every member at the same time
          and cancels the rest as soon as one finishes.
        </p>

        <CodeBlock
          language="java"
          title="Spin the flywheel while the arm holds position"
          code={`Command spinWhileHolding =
    Command.race(
            flywheel.runFast().withTimeout(Seconds.of(2.0)),
            arm.runSlow())
        .named("Spin While Holding Arm");`}
        />

        <p>
          The flywheel member has an ending and the arm hold does not, so the
          flywheel decides when the group ends. A hold can never win a race.
          Other teams call this pattern a deadline. Commands v3 spells it{" "}
          <code>Command.race(...)</code>, and there is no{" "}
          <code>Command.deadline(...)</code>.
        </p>
      </LessonSection>

      <LessonSection id="bind-the-group" title="Bind the group">
        <p>
          A group is a command, so it binds like one. On{" "}
          <strong>Writing Commands</strong> you started a hold with{" "}
          <code>onTrue</code> and undid it with <code>onFalse</code>, because
          neither verb cancels anything.
        </p>
        <p>
          <code>whileTrue</code> does cancel. It runs the group while the button
          is held and drops it on release. From here on it is how this team
          binds a hold.
        </p>

        <CodeBlock
          language="java"
          title="TeleopOpMode.java: one button, both mechanisms"
          code={`driver.y().whileTrue(liftThenSpin).whileFalse(flywheel.stop());`}
        />

        <Box variant="alert-warning" title="Canceling never stops the motor">
          <p>
            A canceled command hands the mechanism back to <code>idle()</code>,
            and <code>idle()</code> sends nothing at all. It does not zero the
            last request, so Phoenix keeps applying the last voltage it was
            given. The flywheel keeps spinning. Every group needs a stop
            somewhere: a <code>whileFalse</code> binding, or a stop step of its
            own.
          </p>
        </Box>

        <p>
          Whether a group ends at all comes down to its last member. End on a
          hold and the group is a hold. End on a step and the group finishes by
          itself, with nothing left commanding the mechanism. Then the stop
          belongs inside the group.
        </p>
      </LessonSection>

      <LessonSection id="check-your-work" title="Check your work">
        <ol
          className="ml-5 list-decimal space-y-3"
          style={{ color: "var(--tx2)" }}
        >
          <li>
            Add the <code>Seconds</code> import and the{" "}
            <code>Lift Then Spin (hold)</code> binding to your{" "}
            <code>TeleopOpMode</code> constructor.
          </li>
          <li>Start the simulator and click Enable.</li>
          <li>Hold Y for three seconds, then release.</li>
          <li>
            Now break it on purpose. Drop <code>.withTimeout(...)</code> off the
            arm member, hold Y again, then put the timeout back.
          </li>
          <li>
            Bind Y to <code>arm.runFast().withTimeout(Seconds.of(1.0))</code> on
            its own instead and hold it for two seconds. The step ends after one
            second and the arm keeps pushing 6&nbsp;V, because nothing claimed
            it afterwards. A closing{" "}
            <code>arm.stop().withTimeout(Seconds.of(0.5))</code> step is the
            fix.
          </li>
        </ol>

        <Box variant="alert-success" title="You should see">
          <ul className="ml-5 list-disc space-y-2">
            <li>
              The arm runs for one second and stops, then the flywheel starts.
            </li>
            <li>
              The flywheel holds while Y is down and stops when you release it.
            </li>
            <li>
              With the timeout gone, the arm pushes and the flywheel never
              starts.
            </li>
          </ul>
        </Box>

        <p>These three failures look nothing alike.</p>

        <div className="overflow-x-auto">
          <table className="w-full min-w-[520px] border-collapse text-note">
            <thead>
              <tr style={{ borderBottom: "1px solid var(--rule)" }}>
                <th className="px-3 py-2 text-left">What you see</th>
                <th className="px-3 py-2 text-left">Cause</th>
              </tr>
            </thead>
            <tbody style={{ color: "var(--tx2)" }}>
              <tr style={{ borderBottom: "1px solid var(--rule-soft)" }}>
                <td className="px-3 py-2">Y does nothing</td>
                <td className="px-3 py-2">A member with no ending.</td>
              </tr>
              <tr style={{ borderBottom: "1px solid var(--rule-soft)" }}>
                <td className="px-3 py-2">The group will not compile</td>
                <td className="px-3 py-2">
                  No <code>.named(&quot;...&quot;)</code>, or{" "}
                  <code>.named(...)</code> on a command that already had one.
                </td>
              </tr>
              <tr>
                <td className="px-3 py-2">Both mechanisms move together</td>
                <td className="px-3 py-2">
                  A <code>Command.race</code> where you meant{" "}
                  <code>Command.sequence</code>.
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        <p>
          Get this binding working in the simulator. Autonomous is the same move
          against a drivetrain, with a stop on the end.
        </p>

        <DocumentationButton
          href="https://github.com/Hemlock5712/2027-Template/blob/2027-dev/src/main/java/frc/robot/opmodes/DriveStowDriveChainedOpMode.java"
          title="The template's chained OpMode"
          icon={<GitBranch className="h-5 w-5" />}
        />
      </LessonSection>

      <Quiz
        questions={[
          {
            id: 1,
            question:
              "You put arm.runFast(), a hold with no timeout, as the first member of Command.sequence(...). What happens?",
            options: [
              "The sequence sticks on it forever and the later members never run",
              "The command fails to compile",
              "It runs for one scheduler loop, then the sequence moves on",
              "The sequence skips it and runs the next member",
            ],
            correctAnswer: 0,
            explanation:
              "A hold never finishes, so the sequence waits on it for the rest of the match. Nothing errors and nothing logs, so the routine looks frozen. Give the member an ending with .withTimeout(...), or later with .until(...).",
          },
          {
            id: 2,
            question:
              "Why does .withTimeout(Seconds.of(2.0)) refuse a plain 2.0?",
            options: [
              "The scheduler needs the value at compile time",
              "It accepts a double, and Seconds.of(...) is a style preference",
              "It takes a Time, a WPILib unit type, so seconds and milliseconds cannot be mixed up",
              "Timeouts must be whole numbers of seconds",
            ],
            correctAnswer: 2,
            explanation:
              "WPILib uses unit types for quantities like this. Seconds.of(2.0) produces a Time, which is what the method signature asks for. It needs `import static org.wpilib.units.Units.Seconds;` at the top of the file.",
          },
          {
            id: 3,
            question:
              "In Command.race(flywheel.runFast().withTimeout(Seconds.of(2.0)), arm.runSlow()), what ends the group?",
            options: [
              "Whichever finishes first, and that is unpredictable",
              "The flywheel member, because the arm hold can never finish; the arm is then canceled",
              "The arm hold, once the arm reaches its position",
              "Nothing, because a race containing a hold runs forever",
            ],
            correctAnswer: 1,
            explanation:
              "A race ends as soon as any member finishes, and cancels the rest. A hold can never be that member, so the one with the timeout always decides. That is why race is the tool for doing one thing while holding another.",
          },
          {
            id: 4,
            question:
              "Your group's last member is a hold. You bind it with whileTrue and nothing else, then release the button. What does the flywheel do?",
            options: [
              "It coasts down over about a second",
              "It throws an error, because a canceled hold has no stop",
              "It stops, because canceling a command stops its motors",
              "It keeps spinning, because idle() sends no output and does not zero the last request",
            ],
            correctAnswer: 3,
            explanation:
              "whileTrue does cancel the group on release, but canceling is not stopping. The mechanism falls back to idle(), which issues no request at all, so Phoenix keeps applying the last voltage. A whileFalse(flywheel.stop()) binding, or a stop step inside the group, is what stops the hardware.",
          },
        ]}
      />
    </PageTemplate>
  );
}
