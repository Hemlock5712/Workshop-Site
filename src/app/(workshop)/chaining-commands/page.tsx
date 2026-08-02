import PageTemplate from "@/components/PageTemplate";
import LessonSection from "@/components/lesson/LessonSection";
import KeyConceptSection from "@/components/KeyConceptSection";
import CodeBlock from "@/components/CodeBlock";
import Box from "@/components/Box";
import DocumentationButton from "@/components/DocumentationButton";
import Quiz from "@/components/Quiz";
import { GitBranch } from "lucide-react";

export default function ChainingCommands() {
  return (
    <PageTemplate
      title="One button, several commands, in order"
      emphasis="in order"
      lede="So far every button runs exactly one command. This page is where you put commands together: run the arm, wait for it, then spin the flywheel — all from one button press."
      needs={[
        <>
          The arm and flywheel commands from <strong>Commands</strong> —{" "}
          <code>runSlow()</code>, <code>runFast()</code>, <code>stop()</code> on
          both mechanisms.
        </>,
        <>
          A <code>TeleopOpMode</code> with working button bindings, from{" "}
          <strong>Triggers</strong>.
        </>,
        <>
          The simulator running, from <strong>Running Your Code</strong>. You
          need to be able to press a button and watch a motor turn.
        </>,
      ]}
      time="Roughly 30 minutes"
    >
      <KeyConceptSection
        description={[
          "Chaining is the style this team writes almost everything in. There is a second, more powerful style called coroutines, and you will meet it at the very end of the course. You will not need it before then.",
        ]}
        concept="Chaining means gluing commands you already have into one bigger command."
      />

      <Box variant="alert-info" tag="WHAT YOU'LL BUILD">
        <p className="mt-3">
          <strong>What you&apos;ll build:</strong> one button that raises the
          arm, then spins the flywheel, then stops both when you let go.{" "}
          <strong>Roughly 30 minutes</strong>, most of it watching the
          simulator.
        </p>
      </Box>

      {/* ── THE ONE RULE ─────────────────────────────────────────────── */}
      <LessonSection
        id="the-problem-a-hold-never-ends"
        title="The problem: a hold never ends"
      >
        <p className="prose-body measure">
          Every command you wrote on the Commands page is a{" "}
          <strong>hold</strong>. <code>runRepeatedly(...)</code> re-sends its
          request every single loop and never stops on its own. That is what the{" "}
          <code>(hold)</code> in the name is telling you.
        </p>

        <Box
          variant="alert-warning"
          tag="THE ONE RULE"
          title="Nothing may ever wait on a hold"
        >
          <p>
            Put a hold in a list of steps and the list stops there forever. Step
            two never runs, because step one never finishes. This is not a bug
            in the framework — a hold is <em>supposed</em> to run until
            something takes the mechanism away from it.
          </p>
          <p className="mt-3">
            So before you can chain anything, you need a way to give a hold an
            ending. That is the first tool below.
          </p>
        </Box>
      </LessonSection>

      {/* ── 1. whileTrue ─────────────────────────────────────────────── */}
      <LessonSection
        id="bind-holds-with-whiletrue"
        title={
          <>
            1. Bind holds with <code>whileTrue</code>
          </>
        }
        outlineLabel="Bind holds with whileTrue"
      >
        <p className="prose-body measure">
          On the Commands page you bound holds in pairs: <code>onTrue</code> to
          start one and <code>onFalse</code> to start another that undoes it.
          That works, and you will see it in the <code>2-Commands</code> code.
          But there is one verb that says it directly.
        </p>

        <CodeBlock
          language="java"
          title="TeleopOpMode.java — the same behavior, two ways"
          code={`// What 2-Commands does: two bindings, one to start and one to undo.
driver.a().onTrue(flywheel.runFast()).onFalse(flywheel.stop());

// What whileTrue says instead: run this while the button is down.
// Release the button and the command is canceled.
driver.a().whileTrue(flywheel.runFast());`}
        />

        <p className="prose-body measure">
          <code>whileTrue</code> is the team default for holds from here on. It
          reads the way the behavior actually works, and there is no second
          binding to forget.
        </p>

        <Box
          variant="alert-warning"
          tag="WATCH OUT"
          title="Canceling a motor command does not stop the motor"
        >
          <p>
            When a command is canceled, the mechanism goes back to its{" "}
            <code>idle()</code> default. On these branches <code>idle()</code>{" "}
            sends <em>nothing at all</em> — it does not zero the last request.
            Phoenix keeps applying the last voltage it was given, so the
            flywheel keeps spinning.
          </p>
          <p className="mt-3">
            That is why <code>stop()</code> exists as its own command, and why
            you pair the binding with <code>whileFalse</code>:
          </p>
          <div className="mt-3">
            <CodeBlock
              language="java"
              hideControls
              code={`driver.a().whileTrue(flywheel.runFast()).whileFalse(flywheel.stop());`}
            />
          </div>
        </Box>
      </LessonSection>

      {/* ── 2. withTimeout ───────────────────────────────────────────── */}
      <LessonSection
        id="give-a-hold-an-ending"
        title={
          <>
            2. Give a hold an ending with <code>.withTimeout(...)</code>
          </>
        }
        outlineLabel="Give a hold an ending with .withTimeout(...)"
      >
        <p className="prose-body measure">
          <code>.withTimeout(...)</code> wraps a command and ends it after a set
          amount of time, whether it was done or not. A hold with a timeout on
          it is no longer a hold — it is a <strong>step</strong>, something with
          a beginning and an end. Steps are what you can put in a list.
        </p>

        <CodeBlock
          language="java"
          title="A hold becomes a step"
          code={`// arm.runFast() by itself: pushes forever, never finishes.
// With a timeout: pushes for one second, then ends.
arm.runFast().withTimeout(Seconds.of(1.0))`}
        />

        <Box
          variant="alert-info"
          tag="NOTE · UNITS"
          title="Seconds.of(1.0), not 1.0"
        >
          <p>
            <code>.withTimeout(...)</code> will not accept a bare number. WPILib
            uses <em>unit types</em> so you cannot accidentally pass
            milliseconds where seconds were expected —{" "}
            <code>Seconds.of(1.0)</code> produces a value of type{" "}
            <code>Time</code>, and that is what the method wants. You need this
            import at the top of the file:
          </p>
          <div className="mt-3">
            <CodeBlock
              language="java"
              hideControls
              code={`import static org.wpilib.units.Units.Seconds;`}
            />
          </div>
        </Box>

        <p className="prose-body-sm measure">
          A timeout is a blunt ending — it stops after a fixed time rather than
          when the arm actually arrives. Later, on <strong>Finish Lines</strong>
          , you will replace it with a condition that watches the real position
          and keep the timeout as a backstop. For now the arm has no way to
          report where it is, so time is what you have.
        </p>
      </LessonSection>

      {/* ── 3. Command.sequence ──────────────────────────────────────── */}
      <LessonSection
        id="run-steps-in-order-with"
        title={
          <>
            3. Run steps in order with <code>Command.sequence</code>
          </>
        }
        outlineLabel="Run steps in order with Command.sequence"
      >
        <p className="prose-body measure">
          <code>Command.sequence(a, b, c)</code> runs <code>a</code> until it
          finishes, then <code>b</code>, then <code>c</code>. It is a list of
          steps. Every step needs its own ending, or the list stops there — that
          is THE ONE RULE again.
        </p>

        <CodeBlock
          language="java"
          title="TeleopOpMode.java — raise the arm, then spin up"
          code={`// Y: push the arm up for a second, THEN start the flywheel.
driver
    .y()
    .whileTrue(
        Command.sequence(
                // A step: it ends on its own, so the sequence moves on.
                arm.runFast().withTimeout(Seconds.of(1.0)),
                // A hold: the last step, so the whole group is a hold too.
                flywheel.runFast())
            .named("Lift Then Spin (hold)"))
    .whileFalse(flywheel.stop());`}
        />

        <Box
          variant="alert-danger"
          tag="DON'T"
          title="A bare hold in the middle"
        >
          <p>
            Swap the first step for a bare <code>arm.runFast()</code> and the
            sequence sticks on it forever. The flywheel never starts. Nothing
            errors, nothing logs — the routine sits there. If a routine seems
            frozen, a hold with no ending is the first thing to look for.
          </p>
        </Box>
      </LessonSection>

      {/* ── 4. Command.race ──────────────────────────────────────────── */}
      <LessonSection
        id="do-one-thing-while-holding"
        title={
          <>
            4. Do one thing <em>while</em> holding another with{" "}
            <code>Command.race</code>
          </>
        }
        outlineLabel="Do one thing while holding another with Command.race"
      >
        <p className="prose-body measure">
          A sequence is &quot;this, then that.&quot; Sometimes you want
          &quot;this <em>while</em> that.&quot; <code>Command.race</code> starts
          every member at once, and the moment any one of them finishes it
          cancels all the rest.
        </p>

        <CodeBlock
          language="java"
          title="Spin the flywheel while the arm holds position"
          code={`// The flywheel step has an ending; the arm hold does not.
// So the flywheel always decides when this group ends, and when it
// does, the arm hold is canceled with it.
Command.race(
        flywheel.runFast().withTimeout(Seconds.of(2.0)),
        arm.runSlow())
    .named("Spin While Holding Arm")`}
        />

        <Box variant="concept" title="Why the step always wins">
          <p>
            A hold never finishes, so it can never be the one that ends the
            race. Whichever member <em>can</em> finish is always the decider.
            That is what makes <code>race</code> the tool for &quot;do this one
            thing while keeping that other thing held.&quot;
          </p>
          <p className="mt-3">
            You may hear this pattern called a <strong>deadline</strong> — one
            member sets the time limit and the others get canceled when it is
            up. In Commands v3 you spell it <code>Command.race(...)</code>.
            There is no <code>Command.deadline(...)</code> method.
          </p>
        </Box>
      </LessonSection>

      {/* ── naming ───────────────────────────────────────────────────── */}
      <LessonSection
        id="every-group-has-to-be-named"
        title="Every group has to be named"
      >
        <p className="prose-body measure">
          <code>Command.sequence(...)</code> and <code>Command.race(...)</code>{" "}
          do not hand you a finished <code>Command</code>. They hand you a
          builder, and <code>.named(&quot;...&quot;)</code> is what turns it
          into one. Leave the name off and the project will not compile — WPILib
          enforces it, because an unnamed command is invisible when you are
          trying to work out what the robot is doing.
        </p>

        <p className="prose-body measure">
          Two conventions worth copying: name the group after what it{" "}
          <em>does</em>, and if the group is a hold, end the name with{" "}
          <code>(hold)</code> the same way the mechanism commands do.
        </p>

        <Box
          variant="alert-warning"
          tag="WATCH OUT"
          title="Do not re-name a finished command"
        >
          <p>
            <code>arm.runFast()</code> is already a <code>Command</code> — it
            already has a name. Writing{" "}
            <code>
              arm.runFast().withTimeout(Seconds.of(1.0)).named(&quot;lift&quot;)
            </code>{" "}
            will not compile. Naming happens once, where the command is built.
          </p>
        </Box>
      </LessonSection>

      {/* ── two shapes ───────────────────────────────────────────────── */}
      <LessonSection id="two-shapes-of-group" title="Two shapes of group">
        <p className="prose-body measure">
          Whether your group ends on its own depends entirely on its last step.
          This catches people out, so it is worth being deliberate about which
          shape you are building.
        </p>

        <Box
          variant="alert-success"
          tag="SHAPE A · PREFER THIS"
          title="The group is a hold"
        >
          <p>
            The last step is a hold, so the group never finishes. Bind it with{" "}
            <code>whileTrue(...)</code> and pair it with{" "}
            <code>whileFalse(...)</code> to clean up. Hold the button, the
            routine runs; let go, it is canceled. This is the{" "}
            <code>Lift Then Spin (hold)</code> example above, and it is what you
            want at this point in the course.
          </p>
        </Box>

        <Box
          variant="alert-warning"
          tag="SHAPE B · CAREFUL"
          title="The group finishes"
        >
          <p>
            Every step has an ending, so the group ends too — and then nothing
            is commanding the mechanism. It falls back to <code>idle()</code>,
            which sends no output and does not zero the last request. The motor
            keeps doing whatever it was last told to do.
          </p>
          <p className="mt-3">
            A finishing group has to end with explicit stop steps, or the
            mechanism needs a real default command. Neither the arm nor the
            flywheel has a default command yet — you will see your first one on
            the swerve drivetrain.
          </p>
        </Box>
      </LessonSection>

      {/* ── did it work ──────────────────────────────────────────────── */}
      <LessonSection id="did-it-work" title="Did it work?">
        <ol
          className="ml-5 list-decimal space-y-3 text-[15px] leading-relaxed"
          style={{ color: "var(--fg-mute)" }}
        >
          <li>
            Add the <code>Lift Then Spin (hold)</code> binding to your{" "}
            <code>TeleopOpMode</code> constructor, with the <code>Seconds</code>{" "}
            import at the top of the file.
          </li>
          <li>
            Start the simulator and click Enable, the same way as last page.
          </li>
          <li>
            Hold Y. <strong>You should see:</strong> the arm runs for one second
            and stops, <em>then</em> the flywheel starts. One after the other,
            not both at once.
          </li>
          <li>
            Keep holding Y. <strong>You should see:</strong> the flywheel keeps
            spinning and never stops by itself. Correct — the last step is a
            hold, so the whole group is a hold.
          </li>
          <li>
            Release Y. <strong>You should see:</strong> the flywheel stops,
            because <code>whileFalse(flywheel.stop())</code> takes over.
          </li>
          <li>
            <strong>Now break it on purpose.</strong> Bind Y to just{" "}
            <code>arm.runFast().withTimeout(Seconds.of(1.0))</code> instead, and
            hold it for two seconds. <strong>You should see:</strong> after one
            second the command ends — and the arm <em>keeps moving anyway</em>.
            That is Shape B. Nothing claims the arm, <code>idle()</code> sends
            nothing, and Phoenix is still applying the 6&nbsp;V you last asked
            for.
          </li>
          <li>
            <strong>Now fix it.</strong> Put the step back in a sequence with a
            real ending:
            <div className="mt-2">
              <CodeBlock
                language="java"
                hideControls
                code={`Command.sequence(
        arm.runFast().withTimeout(Seconds.of(1.0)),
        arm.stop().withTimeout(Seconds.of(0.5)))
    .named("Lift Then Stop")`}
              />
            </div>
            <strong>You should see:</strong> the arm runs for a second, stops,
            and stays stopped after the routine ends.
          </li>
        </ol>

        <Box
          variant="alert-info"
          tag="IF IT DIDN'T WORK"
          title="Three things that go wrong here"
        >
          <ul className="ml-4 list-disc space-y-2">
            <li>
              <strong>
                Nothing happens when you press Y, and the flywheel never starts.
              </strong>{" "}
              A step in the sequence has no ending — most likely a bare{" "}
              <code>arm.runFast()</code> with the <code>.withTimeout(...)</code>{" "}
              left off. The routine is stuck on step one.
            </li>
            <li>
              <strong>It will not compile, pointing at your sequence.</strong>{" "}
              Either the group has no <code>.named(&quot;...&quot;)</code>, or
              you put <code>.named(...)</code> on a command that already had a
              name.
            </li>
            <li>
              <strong>Both mechanisms move at the same time.</strong> You built
              a <code>Command.race</code> where you meant{" "}
              <code>Command.sequence</code>. Race starts everything at once;
              sequence waits.
            </li>
          </ul>
        </Box>
      </LessonSection>

      {/* ── what's next ──────────────────────────────────────────────── */}
      <LessonSection id="what-comes-later" title="What comes later">
        <p className="prose-body measure">
          Four tools cover almost every routine this team writes:{" "}
          <code>whileTrue</code>, <code>.withTimeout(...)</code>,{" "}
          <code>Command.sequence</code> and <code>Command.race</code>. Three
          more show up further along:
        </p>

        <ul
          className="ml-5 list-disc space-y-2 text-[15px] leading-relaxed"
          style={{ color: "var(--fg-mute)" }}
        >
          <li>
            <code>.until(...)</code> — end a hold when something is actually{" "}
            <em>true</em> rather than after a fixed time. It needs the mechanism
            to report its own position, which it cannot do yet. That is{" "}
            <strong>Finish Lines</strong>, and you will upgrade this very
            routine there.
          </li>
          <li>
            <code>Command.parallel(...)</code> — run several commands at once
            and wait for all of them. It comes up when a single state has to
            pose the whole robot, on <strong>State Machines</strong>.
          </li>
          <li>
            <code>.andThen(...)</code>, <code>.alongWith(...)</code> and{" "}
            <code>.raceWith(...)</code> — shorthands for gluing two commands
            together. You will see them in other teams&apos; code. They do the
            same jobs as the three factories above.
          </li>
        </ul>

        <p className="prose-body measure">
          The robot template has a full multi-mechanism routine written in this
          style. Its own comments call chaining &quot;as far as most routines
          ever need to go&quot; — worth reading once you are comfortable with
          the four tools above.
        </p>

        <DocumentationButton
          href="https://github.com/Hemlock5712/2027-Template/blob/2027-dev/src/main/java/frc/robot/opmodes/DriveStowDriveChainedOpMode.java"
          title="DriveStowDriveChainedOpMode.java — the chaining reference"
          icon={<GitBranch className="w-5 h-5" />}
        />
      </LessonSection>

      <Quiz
        title="Knowledge Check"
        questions={[
          {
            id: 1,
            question:
              "You put arm.runFast() — a hold, with no timeout — as the first step of Command.sequence(...). What happens?",
            options: [
              "The sequence skips it and runs the next step",
              "The sequence sticks on that step forever and the later steps never run",
              "The command fails to compile",
              "The step runs for one scheduler loop, then the sequence moves on",
            ],
            correctAnswer: 1,
            explanation:
              "A hold never finishes, so a sequence containing a bare hold waits on it forever. Nothing errors and nothing logs — the routine just sits there. Give the step an ending with .withTimeout(...) (or, later, .until(...)).",
          },
          {
            id: 2,
            question:
              "Why does .withTimeout(Seconds.of(2.0)) refuse a plain 2.0?",
            options: [
              "It takes a Time, a WPILib unit type, so you cannot mix up seconds and milliseconds",
              "Timeouts must be whole numbers of seconds",
              "The scheduler needs the value at compile time",
              "It accepts a double — Seconds.of(...) is just a style preference",
            ],
            correctAnswer: 0,
            explanation:
              "WPILib uses unit types for quantities like this. Seconds.of(2.0) produces a Time, which is what the method signature asks for. It needs `import static org.wpilib.units.Units.Seconds;` at the top of the file.",
          },
          {
            id: 3,
            question:
              "In Command.race(flywheel.runFast().withTimeout(Seconds.of(2.0)), arm.runSlow()), what ends the group?",
            options: [
              "Whichever finishes first — it is unpredictable",
              "The flywheel step, because the arm hold can never finish; the arm is then canceled",
              "The arm hold, once the arm reaches its position",
              "Nothing — a race containing a hold runs forever",
            ],
            correctAnswer: 1,
            explanation:
              "A race ends as soon as any member finishes, and cancels the rest. A hold can never be that member, so the step with the timeout is always the decider. That is what makes race the tool for “do this while holding that.”",
          },
          {
            id: 4,
            question:
              "Your group's last step is a hold. How should you bind it, and why?",
            options: [
              "onTrue(group) — the hold keeps it running as long as you need",
              "whileTrue(group), paired with whileFalse(stop) — releasing cancels it, and the stop is needed because idle() sends no output",
              "onTrue(group).onFalse(group) — the second call cancels the first",
              "whileTrue(group) alone — canceling a command stops its motors",
            ],
            correctAnswer: 1,
            explanation:
              "whileTrue cancels the group on release. But canceling does not stop the motor: the mechanism falls back to idle(), which issues no output and does not zero the last request, so Phoenix keeps applying it. The whileFalse(stop) binding is what actually stops the hardware.",
          },
          {
            id: 5,
            question:
              "Which of these is the deadline pattern in Commands v3 — run a step while holding something, canceling the hold when the step is done?",
            options: [
              "Command.deadline(step, hold)",
              "Command.race(step, hold).named(“…”)",
              "Command.sequence(step, hold).named(“…”)",
              "step.withDeadline(hold)",
            ],
            correctAnswer: 1,
            explanation:
              "There is no Command.deadline(...) in v3. A race ends when its first member finishes and cancels the others, which is exactly the deadline behavior. Remember the terminal .named(“…”) — a group is not a Command until it has one.",
          },
        ]}
      />
    </PageTemplate>
  );
}
