import PageTemplate from "@/components/PageTemplate";
import { MarginNote, ProseBlock, Split } from "@/components/lesson/Prose";
import LessonSection from "@/components/lesson/LessonSection";
import KeyConceptSection from "@/components/KeyConceptSection";
import CodeBlock from "@/components/CodeBlock";
import Box from "@/components/Box";
import ContentCard from "@/components/ContentCard";
import CollapsibleSection from "@/components/CollapsibleSection";
import GitHubContent from "@/components/GitHubContent";
import DocumentationButton from "@/components/DocumentationButton";
import Quiz from "@/components/Quiz";
import { Terminal, Bot, Blocks, BookOpen, FolderTree } from "lucide-react";

export default function AICodingAssistant() {
  return (
    <PageTemplate
      title="A teammate that types fast and is sometimes confidently wrong"
      emphasis="confidently wrong"
      lede="An AI coding assistant works inside your robot project. It reads your files, writes new commands, runs Gradle, and explains what it did. The template you cloned at Project Setup already ships the instructions these tools need."
      branch="2-Commands"
    >
      <KeyConceptSection
        description={[
          "It will also hand you code for the wrong framework, because the framework this workshop teaches is newer than almost everything the model was trained on. Most of this page is about spotting that.",
        ]}
        concept="The assistant writes the code. Checking it against the real project is your job, and this page shows you how."
      />

      <Box
        variant="alert-info"
        tag="OPTIONAL · BEFORE YOU START"
        title="What this page needs, and what you get out of it"
      >
        <p>
          <strong>This one is optional.</strong> No later lesson depends on it,
          and nothing earlier does either: you can read it whenever you like.
        </p>
        <p className="mt-3">
          It sits at the end of the course on purpose. An assistant is only
          useful once you can tell whether it is lying to you, and the way you
          learn that is by writing the code yourself first. Read it now and it
          is a tool. Read it at lesson 9 and it is a way to skip lesson 9.
        </p>
        <p className="mt-3">
          The worked examples below run against <code>2-Commands</code>: the
          branch from <strong>Commands</strong>, near the start of Control
          Fundamentals. That is deliberate: the point is to check an
          assistant&rsquo;s answers against code you already understand
          completely, not to have it explain something new.
        </p>
        <ul className="mt-3 ml-4 list-disc space-y-1">
          <li>
            The robot project from <strong>Project Setup</strong>. The{" "}
            <code>.claude/</code> folder has been sitting in it since you cloned
            it.
          </li>
          <li>
            The <code>2-Commands</code> code from <strong>Commands</strong>:{" "}
            <code>Arm.java</code> with <code>runSlow()</code>,{" "}
            <code>runFast()</code> and <code>stop()</code>, and a{" "}
            <code>TeleopOpMode</code> with three bindings in it. If your project
            does not look like that yet, check out the <code>2-Commands</code>{" "}
            branch of{" "}
            <a
              href="https://github.com/Hemlock5712/Workshop-Code/tree/2-Commands"
              target="_blank"
              rel="noopener noreferrer"
              className="text-[var(--accent)] hover:underline"
            >
              Workshop-Code
            </a>{" "}
            and work from there: every file path and identifier on this page
            comes from that branch.
          </li>
          <li>
            The ability to run the code and press a button, from{" "}
            <strong>Running Your Code</strong>.
          </li>
          <li>One assistant installed. Three options are listed below.</li>
        </ul>
        <p className="mt-3">
          <strong>What you&apos;ll do:</strong> ask an assistant to explain one
          line of <code>Arm.java</code>, then ask it to add a{" "}
          <code>runReverse()</code> command on the B button, then check both
          answers against the real files. <strong>Roughly 20 minutes.</strong>
        </p>
      </Box>

      {/* ── THE V2 PROBLEM ───────────────────────────────────────────── */}
      <LessonSection
        id="it-will-write-the-wrong-framework"
        title="It will write the wrong framework"
      >
        <p className="prose-body measure">
          Read this part even if you skip the rest of the page. WPILib 2027 and
          Commands v3 are newer than the code these models learned from. Nearly
          every FRC repository on the internet, every tutorial, every forum
          thread is <strong>Commands v2</strong>. So that is what an assistant
          reaches for, and it does not hedge: it writes v2 with complete
          confidence.
        </p>

        <CodeBlock
          language="java"
          title="The same command, both ways"
          code={`// WHAT AN ASSISTANT HANDS YOU BY DEFAULT — Commands v2. Does not compile here.
import edu.wpi.first.wpilibj2.command.Command;
import edu.wpi.first.wpilibj2.command.SubsystemBase;

public class Arm extends SubsystemBase {
  public Command runReverse() {
    return runOnce(() -> setVoltage(-3.0));
  }
}

// WHAT YOUR PROJECT ACTUALLY USES — Commands v3.
import org.wpilib.command3.Command;
import org.wpilib.command3.Mechanism;

public class Arm extends Mechanism {
  public Command runReverse() {
    return runRepeatedly(() -> setVoltage(-SLOW_VOLTAGE)).named("runReverse (hold)");
  }
}`}
        />

        <Box
          variant="alert-warning"
          tag="THE TELLS"
          title="The tells that mean it wrote v2"
        >
          <ul className="ml-4 list-disc space-y-2">
            <li>
              <code>import edu.wpi.first.…</code> anywhere. Every WPILib import
              in this project starts <code>org.wpilib.</code>
            </li>
            <li>
              <code>extends SubsystemBase</code>. Here it is{" "}
              <code>extends Mechanism</code>.
            </li>
            <li>
              A <code>RobotContainer</code> class, or a{" "}
              <code>SendableChooser</code> for picking an autonomous. Neither
              exists in this stack. Modes are separate classes in{" "}
              <code>opmodes/</code> tagged <code>@Teleop</code> or{" "}
              <code>@Autonomous</code>.
            </li>
            <li>
              <code>SequentialCommandGroup</code>,{" "}
              <code>ParallelCommandGroup</code>, <code>InstantCommand</code>,{" "}
              <code>RunCommand</code>. v3 spells those{" "}
              <code>Command.sequence(...)</code>,{" "}
              <code>Command.parallel(...)</code>, and the mechanism factories
              you already use.
            </li>
            <li>
              <code>@Override public void periodic()</code> inside a{" "}
              <code>Mechanism</code>. A <code>Mechanism</code> has no{" "}
              <code>periodic()</code>: what it hands you is <code>run</code>,{" "}
              <code>runRepeatedly</code>, <code>idle</code>,{" "}
              <code>idleFor</code> and <code>setDefaultCommand</code>. An OpMode
              does have a <code>periodic()</code>, so seeing one in{" "}
              <code>TeleopOpMode.java</code> is fine. It is only a tell when it
              turns up in a mechanism.
            </li>
            <li>
              The word <strong>roboRIO</strong>. This code deploys to
              SystemCore.
            </li>
          </ul>
        </Box>

        <p className="prose-body measure">
          The fastest check is not reading. It is building. Run{" "}
          <code>gradlew build</code> and a v2 import fails immediately with
          something like{" "}
          <code>package edu.wpi.first.wpilibj2.command does not exist</code>.
          Build after every change an assistant makes, before you run anything.
        </p>
      </LessonSection>

      {/* ── WHAT THE TEMPLATE SHIPS ──────────────────────────────────── */}
      <LessonSection
        id="what-the-template-already-tells-the"
        title="What the template already tells the assistant"
      >
        <p className="prose-body measure">
          The{" "}
          <a
            href="https://github.com/Hemlock5712/2027-Template"
            target="_blank"
            rel="noopener noreferrer"
            className="text-[var(--accent)] hover:underline"
          >
            2027-Template
          </a>{" "}
          ships with an instruction file and five <strong>Agent Skills</strong>{" "}
          that describe how this specific robot works. They exist to close the
          gap above. Grounding the assistant in the real project is the
          difference between v2 that will not compile and v3 that does.
        </p>

        <p className="prose-body measure">
          A <strong>skill</strong> is a folder holding a <code>SKILL.md</code>{" "}
          file: plain Markdown with a short description at the top saying{" "}
          <em>when</em> to read it. Your question matches the description, the
          assistant loads the file, and follows what it says. Because a skill is
          Markdown, any assistant that can open files can use one.
        </p>

        <CodeBlock
          language="text"
          title="Where the instructions live in your project"
          code={`2027-Template/
├── CLAUDE.md          ← entry point: project rules + pointers to the skills
├── ONBOARDING.md      ← the wiring guide (there is no RobotContainer!)
└── .claude/
    └── skills/
        ├── robot-description/SKILL.md   ← map of the code
        ├── game-info/SKILL.md           ← field + alliance conventions
        ├── run-sim/SKILL.md             ← running the simulator
        ├── log-reading/SKILL.md         ← reading .wpilog / .hoot logs
        └── teaching/SKILL.md            ← teacher mode (on by default)`}
        />

        <div className="grid gap-4 md:grid-cols-2">
          <ContentCard tag="SKILL" className="flex flex-col gap-2">
            <h3 className="display m-0 text-aside">
              <code>robot-description</code>
            </h3>
            <p className="text-note" style={{ color: "var(--tx2)" }}>
              The map of the code: OpModes, Mechanisms, commands, and where each
              piece lives. It carries the biggest surprise for anyone coming
              from Commands v2: the &quot;there is no RobotContainer&quot;
              wiring model. This is the skill an assistant should read before
              touching anything.
            </p>
          </ContentCard>

          <ContentCard tag="SKILL" className="flex flex-col gap-2">
            <h3 className="display m-0 text-aside">
              <code>game-info</code>
            </h3>
            <p className="text-note" style={{ color: "var(--tx2)" }}>
              Field and alliance conventions the code enforces:
              blue-alliance-origin coordinates, operator-perspective flipping,
              and the AprilTag conventions. Its game-piece and field-zone
              sections are marked TODO until a real season game is wired in.
            </p>
          </ContentCard>

          <ContentCard tag="SKILL" className="flex flex-col gap-2">
            <h3 className="display m-0 text-aside">
              <code>run-sim</code>
            </h3>
            <p className="text-note" style={{ color: "var(--tx2)" }}>
              How to run the robot in simulation, including a headless{" "}
              <code>gradlew simulateJavaAgent</code> task that enables the robot
              without anyone clicking Enable, so the assistant can run a routine
              by itself and check the result.
            </p>
          </ContentCard>

          <ContentCard tag="SKILL" className="flex flex-col gap-2">
            <h3 className="display m-0 text-aside">
              <code>log-reading</code>
            </h3>
            <p className="text-note" style={{ color: "var(--tx2)" }}>
              Where <code>.wpilog</code> and <code>.hoot</code> files land,
              which telemetry keys this robot actually publishes, and how to
              analyse a run: in AdvantageScope or with a script the assistant
              writes itself.
            </p>
          </ContentCard>

          <ContentCard
            tag="SKILL"
            className="flex flex-col gap-2 md:col-span-2"
          >
            <h3 className="display m-0 text-aside">
              <code>teaching</code>
            </h3>
            <p className="text-note" style={{ color: "var(--tx2)" }}>
              Teacher mode is <strong>on by default</strong>. It tells the
              assistant to explain things the way a student needs them: plain
              words first, one idea at a time, a pointer to the exact file and
              line instead of a wall of pasted code. The code it writes is still
              real, correct code: only the explanations change. A mentor doing
              focused work can say &quot;teacher mode off&quot; for the session.
            </p>
          </ContentCard>
        </div>

        <DocumentationButton
          href="https://github.com/Hemlock5712/2027-Template/blob/2027-dev/ONBOARDING.md"
          title="ONBOARDING.md: there is no RobotContainer"
          icon={<BookOpen className="h-5 w-5" />}
        />
      </LessonSection>

      {/* ── PICK ONE ─────────────────────────────────────────────────── */}
      <LessonSection id="pick-an-assistant" title="Pick an assistant">
        <p className="prose-body measure">
          Any agentic coding tool works, because the skills are ordinary
          Markdown files. These three are what we see teams using.
        </p>

        <div className="grid gap-4 md:grid-cols-3">
          <ContentCard tag="ASSISTANT" className="flex flex-col gap-2">
            <div className="flex items-center gap-2">
              <Terminal
                className="h-5 w-5"
                style={{ color: "var(--accent)" }}
              />
              <h3 className="display m-0 text-aside">Claude Code</h3>
            </div>
            <p className="flex-1 text-note" style={{ color: "var(--tx2)" }}>
              Anthropic&apos;s coding agent, in the terminal or as a VS Code
              extension. It reads <code>CLAUDE.md</code> on startup and finds
              the skills on its own, so there is nothing to configure.
            </p>
            <a
              href="https://claude.com/claude-code"
              target="_blank"
              rel="noopener noreferrer"
              className="text-note text-[var(--accent)] hover:underline"
            >
              claude.com/claude-code
            </a>
          </ContentCard>

          <ContentCard tag="ASSISTANT" className="flex flex-col gap-2">
            <div className="flex items-center gap-2">
              <Blocks className="h-5 w-5" style={{ color: "var(--accent)" }} />
              <h3 className="display m-0 text-aside">GitHub Copilot</h3>
            </div>
            <p className="flex-1 text-note" style={{ color: "var(--tx2)" }}>
              Lives inside VS Code, which you already have open for WPILib.
              Agent mode edits files and runs Gradle tasks. Free for verified
              students through GitHub Education.
            </p>
            <a
              href="https://github.com/features/copilot"
              target="_blank"
              rel="noopener noreferrer"
              className="text-note text-[var(--accent)] hover:underline"
            >
              github.com/features/copilot
            </a>
          </ContentCard>

          <ContentCard tag="ASSISTANT" className="flex flex-col gap-2">
            <div className="flex items-center gap-2">
              <Bot className="h-5 w-5" style={{ color: "var(--accent)" }} />
              <h3 className="display m-0 text-aside">OpenAI Codex</h3>
            </div>
            <p className="flex-1 text-note" style={{ color: "var(--tx2)" }}>
              OpenAI&apos;s coding agent, as a CLI and an IDE extension.
              Configure it with an <code>AGENTS.md</code> file that points at
              the template&apos;s skill files.
            </p>
            <a
              href="https://openai.com/codex"
              target="_blank"
              rel="noopener noreferrer"
              className="text-note text-[var(--accent)] hover:underline"
            >
              openai.com/codex
            </a>
          </ContentCard>
        </div>

        <Box
          variant="alert-tip"
          tag="COPILOT / CODEX"
          title="Point them at the skill yourself"
        >
          <p>
            Only Claude Code discovers <code>.claude/skills/</code>{" "}
            automatically. With the other two, name the file in your first
            message of a session:
          </p>
          <div className="mt-3">
            <CodeBlock
              language="text"
              hideControls
              code={`Read .claude/skills/robot-description/SKILL.md and ONBOARDING.md before
you change anything in this project.`}
            />
          </div>
          <p className="mt-3">
            To make that automatic, reference the skills folder from{" "}
            <code>.github/copilot-instructions.md</code> or{" "}
            <code>AGENTS.md</code> at the project root.
          </p>
        </Box>
      </LessonSection>

      {/* ── PROMPT 1 ─────────────────────────────────────────────────── */}
      <LessonSection
        id="prompt-1-make-it-read-before"
        title="Prompt 1: make it read before it writes"
      >
        <Split>
          <ProseBlock>
            <p>
              Start with a question you can grade. You already know what this
              line does, which is exactly why it is a good first prompt: you are
              testing the assistant, not the code.
            </p>
          </ProseBlock>
          <MarginNote label="WHY START HERE">
            This prompt changes nothing, so the worst case is a wrong
            explanation you can catch by opening the file. If the answer is
            vague, or it starts talking about <code>SubsystemBase</code>, you
            have learned something useful before letting it write anything: that
            session is not grounded, and you should point it at the skills.
          </MarginNote>
        </Split>

        <p className="prose-body measure">
          Both prompts below use the <code>2-Commands</code> layout, where the
          arm sits at <code>src/main/java/frc/robot/subsystems/Arm.java</code>.
          The template clone from <strong>Project Setup</strong> keeps its arm
          one folder deeper, at{" "}
          <code>src/main/java/frc/robot/subsystems/arm/Arm.java</code>. Change
          the path in the prompt to match whichever project you have open.
        </p>

        <ol
          className="ml-5 list-decimal space-y-3"
          style={{ color: "var(--tx2)" }}
        >
          <li>
            Open your robot project folder in the assistant: the same folder you
            have been editing, with <code>build.gradle</code> at the top of it.{" "}
            <strong>{"You should see: "}</strong> it reports the project it is
            working in. Claude Code also says it loaded <code>CLAUDE.md</code>.
          </li>
          <li>
            Paste this prompt:
            <div className="mt-2">
              <CodeBlock
                language="text"
                title="Prompt: read only"
                code={`Read src/main/java/frc/robot/subsystems/Arm.java and explain this line
one piece at a time:

    runRepeatedly(() -> setVoltage(FAST_VOLTAGE)).named("runFast (hold)")

I have finished the Commands lesson. Do not change any files.`}
              />
            </div>
          </li>
          <li>
            Read the answer against the file. <strong>You should see</strong> it
            hit four things: <code>runRepeatedly</code> re-runs its action every
            scheduler loop; <code>() -&gt; setVoltage(FAST_VOLTAGE)</code> is
            the action, and <code>FAST_VOLTAGE</code> is 6.0;{" "}
            <code>.named(...)</code> is required before you have a{" "}
            <code>Command</code> at all; and the <code>(hold)</code> in the name
            marks a command that never finishes.
          </li>
        </ol>

        <CollapsibleSection title="The real Arm.java on 2-Commands: check its answer against this">
          <GitHubContent
            repository="Hemlock5712/Workshop-Code"
            branch="2-Commands"
            filePath="src/main/java/frc/robot/subsystems/Arm.java"
          />
        </CollapsibleSection>
      </LessonSection>

      {/* ── PROMPT 2 ─────────────────────────────────────────────────── */}
      <LessonSection
        id="prompt-2-make-it-change-something"
        title="Prompt 2: make it change something"
      >
        <p className="prose-body measure">
          The arm can go up. It cannot go back down under power. Reverse the
          voltage and you have a command for that, which is a small enough
          change that you can check every line of it.
        </p>

        <p className="prose-body measure">
          Bind it to B. On <code>2-Commands</code> the only face button used is{" "}
          <code>driver.a()</code>, so <code>b()</code> is free: the other two
          bindings are on the triggers.
        </p>

        <ol
          className="ml-5 list-decimal space-y-3"
          style={{ color: "var(--tx2)" }}
        >
          <li>
            Paste this prompt in the same session:
            <div className="mt-2">
              <CodeBlock
                language="text"
                title="Prompt: one small change"
                code={`Add a runReverse() command to src/main/java/frc/robot/subsystems/Arm.java
that pushes -SLOW_VOLTAGE, matching the style of runSlow(). Then bind it in
src/main/java/frc/robot/opmodes/TeleopOpMode.java as:

    driver.b().onTrue(arm.runReverse()).onFalse(arm.stop());

Show me the diff before you write anything.`}
              />
            </div>
            <strong>{"You should see: "}</strong> a proposed change to exactly
            two files and nothing else.
          </li>
          <li>
            Compare the <code>Arm.java</code> half against this. The new method
            goes in with the other command factories:
            <div className="mt-2">
              <CodeBlock
                language="java"
                title="Arm.java: the new method, in context"
                code={`  /** Push the arm with a gentle voltage and keep pushing. Never finishes. */
  public Command runSlow() {
    return runRepeatedly(() -> setVoltage(SLOW_VOLTAGE)).named("runSlow (hold)");
  }

  /** NEW — push the arm the other way at the same gentle voltage. Never finishes. */
  public Command runReverse() {
    return runRepeatedly(() -> setVoltage(-SLOW_VOLTAGE)).named("runReverse (hold)");
  }

  /** Push the arm with a stronger voltage and keep pushing. Never finishes. */
  public Command runFast() {
    return runRepeatedly(() -> setVoltage(FAST_VOLTAGE)).named("runFast (hold)");
  }`}
              />
            </div>
            <code>SLOW_VOLTAGE</code> is already declared at the top of the
            class as <code>3.0</code>. A minus sign in front of it is the whole
            change. Nothing new needs to be added to the file.
          </li>
          <li>
            Compare the <code>TeleopOpMode.java</code> half. The binding is a
            fourth line in the constructor, in the same shape as the three
            already there:
            <div className="mt-2">
              <CodeBlock
                language="java"
                title="TeleopOpMode.java: the constructor, with the new binding last"
                code={`  public TeleopOpMode(Robot robot) {
    final Arm arm = robot.arm;
    final Flywheel flywheel = robot.flywheel;

    // Left trigger: push the arm up while held, stop when released.
    driver.leftTrigger().onTrue(arm.runFast()).onFalse(arm.stop());

    // Right trigger: spin fast while held, drop back to the slow voltage when released.
    driver.rightTrigger().onTrue(flywheel.runFast()).onFalse(flywheel.runSlow());

    // A: spin fast while held, stop when released.
    driver.a().onTrue(flywheel.runFast()).onFalse(flywheel.stop());

    // NEW — B: push the arm the other way while held, stop when released.
    driver.b().onTrue(arm.runReverse()).onFalse(arm.stop());
  }`}
              />
            </div>
          </li>
          <li>
            Accept the change, then run <code>gradlew build</code>.{" "}
            <strong>{"You should see: "}</strong> <code>BUILD SUCCESSFUL</code>.
            Do this before you run the robot, every time.
          </li>
        </ol>

        <Box
          variant="alert-info"
          tag="NOTE · WHY -SLOW_VOLTAGE"
          title="Reuse the constant, do not add a number"
        >
          <p>
            An assistant will often write <code>-3.0</code> directly, or declare
            a new <code>REVERSE_VOLTAGE = -3.0</code> beside the others. Both
            work. Neither is what you asked for, and both mean the arm now has
            two places to change if 3.0 turns out to be too much. Ask it to use
            the existing constant.
          </p>
        </Box>
      </LessonSection>

      {/* ── DID IT WORK ──────────────────────────────────────────────── */}
      <LessonSection id="did-it-work" title="Did it work?">
        <ol
          className="ml-5 list-decimal space-y-3"
          style={{ color: "var(--tx2)" }}
        >
          <li>
            Run the code and enable the robot the way{" "}
            <strong>Running Your Code</strong> showed you.
          </li>
          <li>
            Hold the left trigger for a moment, then release.{" "}
            <strong>{"You should see: "}</strong> the arm pushes one way,
            exactly as it did before. Nothing you added has broken what was
            already there.
          </li>
          <li>
            Hold B. <strong>{"You should see: "}</strong> the arm pushes the{" "}
            <em>other</em> way. Slower than the left trigger, because 3.0 V is
            half of 6.0 V.
          </li>
          <li>
            Release B. <strong>{"You should see: "}</strong> the arm stops,
            because <code>onFalse(arm.stop())</code> takes over. If it keeps
            going, the <code>onFalse</code> half of the binding is missing.{" "}
            <code>onTrue</code> schedules a hold, and a hold never ends by
            itself: the only reason releasing B stops the arm is that{" "}
            <code>arm.stop()</code> takes the arm away from it.
          </li>
          <li>
            Press A while still holding B. <strong>{"You should see: "}</strong>{" "}
            the flywheel spins and the arm carries on. They are different
            mechanisms, so nothing is being fought over.
          </li>
        </ol>

        <Box
          variant="alert-warning"
          tag="IF IT DIDN'T WORK"
          title="It writes v2, forgets .named(), or edits only one of the two files"
        >
          <ul className="ml-4 list-disc space-y-2">
            <li>
              <strong>
                The build fails with{" "}
                <code>
                  package edu.wpi.first.wpilibj2.command does not exist
                </code>{" "}
                or <code>cannot find symbol: class SubsystemBase</code>.
              </strong>{" "}
              It wrote Commands v2. Revert the change, tell it to read{" "}
              <code>ONBOARDING.md</code> and{" "}
              <code>.claude/skills/robot-description/SKILL.md</code>, and to
              match the existing methods in <code>Arm.java</code> exactly. Then
              ask again.
            </li>
            <li>
              <strong>
                The build fails pointing at your new <code>runReverse()</code>.
              </strong>{" "}
              The <code>.named(&quot;...&quot;)</code> is missing. WPILib makes
              an unnamed command a build error on purpose: a command with no
              name is invisible in a log when you are trying to work out what
              the robot is doing.
            </li>
            <li>
              <strong>It builds, but B does nothing.</strong> It edited{" "}
              <code>Arm.java</code> and forgot <code>TeleopOpMode.java</code>.
              Open the constructor and count the bindings: there should be four.
              Assistants lose the second file surprisingly often when a request
              spans two.
            </li>
          </ul>
        </Box>

        <Box
          variant="alert-danger"
          tag="DON'T"
          title="Accept a diff you have not read"
        >
          <p>
            The temptation is to approve everything and run it. Two of the three
            failures above are caught by opening the diff and counting the files
            it touched. A change to <code>Robot.java</code>, a new class you did
            not ask for, or a rewritten <code>stop()</code> all mean the
            assistant went further than the request. Say no and re-scope it.
          </p>
        </Box>
      </LessonSection>

      {/* ── KEEPING IT USEFUL ────────────────────────────────────────── */}
      <LessonSection
        id="keeping-it-useful-for-the-rest"
        title="Keeping it useful for the rest of the season"
      >
        <p className="prose-body measure">
          Four prompts worth keeping, all of which run against code you already
          have or will have shortly:
        </p>

        <ul
          className="ml-5 list-disc space-y-2"
          style={{ color: "var(--tx2)" }}
        >
          <li>
            &quot;Why won&apos;t the flywheel spin when I press A? Read{" "}
            <code>Flywheel.java</code> and <code>TeleopOpMode.java</code>{" "}
            first.&quot;
          </li>
          <li>
            &quot;Read the newest log in <code>logs/</code> and tell me when the
            robot enabled and what the arm was doing.&quot;
          </li>
          <li>
            &quot;Explain what changed between my file and the one on the{" "}
            <code>3-PID</code> branch, one method at a time.&quot;
          </li>
          <li>
            &quot;Run the sim headless with{" "}
            <code>gradlew simulateJavaAgent</code> and tell me if anything threw
            an error.&quot;
          </li>
        </ul>

        <p className="prose-body measure">
          As your robot grows, the skills go stale. They ship with TODO sections
          for the parts nobody can fill in yet: the real game, the real field
          poses, your actual mechanisms. Fill them in as you go. A skill
          describing last month&apos;s robot misleads an assistant the same way
          a stale comment misleads a teammate.
        </p>

        <Box
          variant="alert-warning"
          tag="SAFETY · YOU OWN THE CODE"
          title="Review everything before it touches a real robot"
        >
          <p>
            An assistant is a teammate, not an autopilot. Read every change,
            build before you run, and make sure <em>{"you "}</em> can explain
            what the code does. &quot;The AI wrote it&quot; will not help you at
            a competition with six minutes on the clock.
          </p>
          <p className="mt-3">
            The 2027 stack is alpha software, so APIs shift between releases.
            When the assistant and the compiler disagree, the compiler is right.
            When the assistant and the template disagree, the template is right.
          </p>
        </Box>

        <DocumentationButton
          href="https://github.com/Hemlock5712/2027-Template/tree/2027-dev/.claude/skills"
          title="The five skill files in the template"
          icon={<FolderTree className="h-5 w-5" />}
        />
      </LessonSection>

      <Quiz
        questions={[
          {
            id: 1,
            question:
              "You ask for a new command and the assistant hands you `public class Arm extends SubsystemBase` with imports from `edu.wpi.first.wpilibj2.command`. What happened?",
            options: [
              "It wrote Commands v2, because that is what nearly all of its training data contains",
              "It picked the newer API: v2 is the 2027 version",
              "It read the wrong file in your project",
              "Both spellings work; v3 accepts either import",
            ],
            correctAnswer: 0,
            explanation:
              "Commands v3 and WPILib 2027 are newer than the code these models learned from, and almost every FRC repo online is v2. The v3 spellings are `extends Mechanism` and `org.wpilib.command3`. Ground the session by pointing it at ONBOARDING.md and the robot-description skill.",
          },
          {
            id: 2,
            question:
              "What is the fastest way to find out whether an assistant's change is v2 code?",
            options: [
              "Read the diff carefully line by line",
              "Run `gradlew build`: wrong-framework imports fail instantly",
              "Deploy it and see whether the robot moves",
              "Ask the assistant whether it used Commands v3",
            ],
            correctAnswer: 1,
            explanation:
              "The compiler settles it in seconds: a v2 import fails with something like `package edu.wpi.first.wpilibj2.command does not exist`. Asking the assistant does not help: it was confident the first time. Build after every change, before you run anything.",
          },
          {
            id: 3,
            question: "What is an Agent Skill in this template?",
            options: [
              "A plugin you install into your assistant",
              "A folder holding a SKILL.md Markdown file whose description tells the assistant when to read it",
              "A paid feature of Claude Code",
              "A Gradle task that generates documentation",
            ],
            correctAnswer: 1,
            explanation:
              "A skill is plain Markdown. The description at the top says when it applies, and any assistant that can open files can use it. Claude Code finds `.claude/skills/` on its own; with Copilot or Codex you name the file yourself, or reference the folder from AGENTS.md.",
          },
          {
            id: 4,
            question:
              'The assistant\'s runReverse() compiles and the arm moves, but it named the command "runReverse" instead of "runReverse (hold)". Why does that matter?',
            options: [
              "It doesn't: the suffix is decoration",
              "The command will run only once without it",
              "The name shows up in logs and on the dashboard, and (hold) is how this project marks a command that never finishes",
              "WPILib rejects names without a suffix",
            ],
            correctAnswer: 2,
            explanation:
              "runRepeatedly never finishes on its own, so nothing may ever wait on it. Every hold on the branch carries the (hold) suffix so that a stuck routine sitting on a hold is obvious the moment you read the name. A name that lies about the shape of the command costs you a debugging session later.",
          },
          {
            id: 5,
            question:
              "The assistant makes a change that works, and you do not understand it. What is the right next move?",
            options: [
              "Ship it: it builds and the robot moves",
              "Ask it to explain that one piece again in simpler terms, and open the file yourself",
              "Revert it and write the whole thing by hand",
              "Ask a different assistant for a second opinion",
            ],
            correctAnswer: 1,
            explanation:
              "Teacher mode is on by default, so asking for a simpler explanation of one specific piece is exactly what the teaching skill is for. Code you cannot explain is code you cannot debug at a competition, and the assistant will not be sitting in the pit with you.",
          },
        ]}
      />
    </PageTemplate>
  );
}
