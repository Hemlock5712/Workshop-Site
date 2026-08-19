import PageTemplate from "@/components/PageTemplate";
import { MarginNote, ProseBlock, Split } from "@/components/lesson/Prose";
import LessonSection from "@/components/lesson/LessonSection";
import FigureGrid from "@/components/lesson/FigureGrid";
import CodeBlock from "@/components/CodeBlock";
import Box from "@/components/Box";
import DocumentationButton from "@/components/DocumentationButton";
import Quiz from "@/components/Quiz";
import { BookOpen, FolderTree } from "lucide-react";

/**
 * Optional lesson. Not in `LESSONS`, and the target of a 308 redirect from
 * `/ai-assistant` in `next.config.ts`, so the route has to keep answering.
 *
 * Rewritten August 2026 against `context/writing-style.md`. It was 26.4
 * minutes across seven sections with seven asides, most of it spent on a
 * prompt-by-prompt walkthrough that quoted `Arm.java` and `TeleopOpMode.java`
 * back in full. Both files are taught on `/adding-commands` already, so the
 * two Java CodeBlocks that restated them are gone, along with the three
 * assistant cards and the five skill cards that the directory tree below
 * already labels.
 *
 * What survives is the part no other page carries: this stack postdates the
 * training data, so an assistant writes Commands v2 with total confidence.
 * The tells table, the read-before-you-write prompt, and the build-first habit
 * are the lesson.
 *
 * Restored on review, as content a student needs rather than prose: the second
 * `Arm.java` path a template clone has ("one folder deeper" without
 * naming `arm/` is not a path); the two filenames a Copilot or Codex session
 * has to be handed, plus the `AGENTS.md` / `.github/copilot-instructions.md`
 * that stop you retyping them; the instruction to reuse `SLOW_VOLTAGE` rather
 * than only the observation that a new constant is wrong; the missing-`onFalse`
 * diagnostic for an arm that keeps pushing after you let go; and `Running Your
 * Code` in `needs[]`, which the closing check depends on. Paid for out of the
 * duplication in the `Split`, never out of a step.
 *
 * The alert-danger also claimed counting files caught two of the three
 * failures. Counting catches one. Reading the diff is what catches a v2 import.
 */
export default function AICodingAssistant() {
  return (
    <PageTemplate
      title="AI Coding Assistant"
      lede="An assistant reads your robot project, writes commands, and runs Gradle. It also writes Commands v2 by default, because v3 is newer than nearly everything it learned from. Optional: nothing else depends on it."
      needs={[
        <>
          The robot project from <strong>Project Setup</strong>, with its{" "}
          <code>.claude/</code> folder intact.
        </>,
        <>
          The <code>2-Commands</code> code: <code>Arm.java</code> with{" "}
          <code>runSlow()</code>, <code>runFast()</code> and <code>stop()</code>
          .
        </>,
        <>One assistant installed: Claude Code, Copilot, or Codex.</>,
        <>
          Enough Java to argue with a diff, and{" "}
          <strong>Running Your Code</strong> already done.
        </>,
      ]}
      branch="2-Commands"
      time="25 minutes at a keyboard"
    >
      <LessonSection id="commands-v2-by-default" title="Commands v2 by default">
        <p>
          Read this section even if you skip the rest. Nearly every FRC
          repository online is Commands v2, so that is what an assistant reaches
          for. It does not hedge. The code looks right and does not compile.
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

        <p>Six spellings tell you which framework you got.</p>

        <div className="measure-wide overflow-x-auto">
          <table className="w-full min-w-[520px] border-collapse text-note">
            <thead>
              <tr style={{ borderBottom: "1px solid var(--rule)" }}>
                <th className="px-3 py-2 text-left">It wrote</th>
                <th className="px-3 py-2 text-left">This project uses</th>
              </tr>
            </thead>
            <tbody style={{ color: "var(--tx2)" }}>
              <tr style={{ borderBottom: "1px solid var(--rule-soft)" }}>
                <td className="px-3 py-2">
                  <code>import edu.wpi.first.…</code>
                </td>
                <td className="px-3 py-2">
                  <code>org.wpilib.…</code>, on every WPILib import
                </td>
              </tr>
              <tr style={{ borderBottom: "1px solid var(--rule-soft)" }}>
                <td className="px-3 py-2">
                  <code>extends SubsystemBase</code>
                </td>
                <td className="px-3 py-2">
                  <code>extends Mechanism</code>
                </td>
              </tr>
              <tr style={{ borderBottom: "1px solid var(--rule-soft)" }}>
                <td className="px-3 py-2">
                  <code>RobotContainer</code>, <code>SendableChooser</code>
                </td>
                <td className="px-3 py-2">
                  One class per mode under <code>opmodes/</code>
                </td>
              </tr>
              <tr style={{ borderBottom: "1px solid var(--rule-soft)" }}>
                <td className="px-3 py-2">
                  <code>SequentialCommandGroup</code>,{" "}
                  <code>InstantCommand</code>
                </td>
                <td className="px-3 py-2">
                  <code>Command.sequence(...)</code> and the mechanism factories
                </td>
              </tr>
              <tr style={{ borderBottom: "1px solid var(--rule-soft)" }}>
                <td className="px-3 py-2">
                  <code>periodic()</code> in a mechanism
                </td>
                <td className="px-3 py-2">
                  <code>run</code>, <code>runRepeatedly</code>,{" "}
                  <code>idle</code>
                </td>
              </tr>
              <tr>
                <td className="px-3 py-2">roboRIO</td>
                <td className="px-3 py-2">SystemCore</td>
              </tr>
            </tbody>
          </table>
        </div>

        <p>
          An OpMode does have a <code>periodic()</code>. A mechanism has none.
        </p>

        <p>
          The compiler settles this faster than reading does. Run{" "}
          <code>gradlew build</code> and a v2 import fails at once with{" "}
          <code>package edu.wpi.first.wpilibj2.command does not exist</code>.
          Build after every change, before you run anything.
        </p>
      </LessonSection>

      <LessonSection
        id="what-the-template-already-tells-the"
        title="What the template ships"
      >
        <p>
          The{" "}
          <a
            href="https://github.com/Hemlock5712/2027-Template"
            target="_blank"
            rel="noopener noreferrer"
            className="text-[var(--accent)] hover:underline"
          >
            2027-Template
          </a>{" "}
          ships an instruction file and five Agent Skills describing this robot.
          A skill is a folder holding one <code>SKILL.md</code>: plain Markdown,
          whose top line says when to read it.
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

        <p>
          Point an assistant at <code>robot-description</code> first. It carries
          the wiring model, and the surprise for anyone coming from v2: there is
          no <code>RobotContainer</code>. Teacher mode is on by default and
          keeps explanations short.
        </p>

        <DocumentationButton
          href="https://github.com/Hemlock5712/2027-Template/blob/2027-dev/ONBOARDING.md"
          title="ONBOARDING.md: the wiring model"
          icon={<BookOpen className="h-5 w-5" />}
        />
      </LessonSection>

      <LessonSection id="read-before-it-writes" title="Read before writing">
        <Split>
          <ProseBlock>
            <p>
              Start with a question you can grade. You already know what this
              line does, so the answer tells you about the assistant.
            </p>
          </ProseBlock>
          <MarginNote label="Nothing at risk">
            The prompt below changes no files, so the worst case is a wrong
            explanation. An answer mentioning <code>SubsystemBase</code> means
            the session is not grounded.
          </MarginNote>
        </Split>

        <p>
          Claude Code finds <code>.claude/skills/</code> on its own. Copilot and
          Codex do not, so name{" "}
          <code>.claude/skills/robot-description/SKILL.md</code> and{" "}
          <code>ONBOARDING.md</code> in your first message. To avoid typing that
          every session, point at the skills folder from <code>AGENTS.md</code>{" "}
          or <code>.github/copilot-instructions.md</code> at the project root.
        </p>

        <p>
          Check the path before you paste. On <code>2-Commands</code> the arm is
          at <code>src/main/java/frc/robot/subsystems/Arm.java</code>. A
          template clone keeps it one folder deeper, at{" "}
          <code>src/main/java/frc/robot/subsystems/arm/Arm.java</code>. Edit the
          prompt to match the project you have open.
        </p>

        <ol className="ml-5 list-decimal space-y-3">
          <li>
            Open the project folder in the assistant, the one with{" "}
            <code>build.gradle</code> in it. <strong>You should see:</strong> it
            names the project.
          </li>
          <li>
            Paste this prompt.
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
            Grade the answer against the file. <strong>You should see</strong>{" "}
            four things:
            <ul className="mt-2 ml-5 list-disc space-y-1">
              <li>
                <code>runRepeatedly</code> re-runs its action every scheduler
                loop.
              </li>
              <li>
                <code>FAST_VOLTAGE</code> is 6.0.
              </li>
              <li>
                <code>.named(...)</code> is what makes it a <code>Command</code>
                .
              </li>
              <li>
                <code>(hold)</code> marks a command that never finishes.
              </li>
            </ul>
          </li>
        </ol>
      </LessonSection>

      <LessonSection id="one-change-at-a-time" title="One change at a time">
        <p>
          Now let it write something. Ask for the smallest change you can check
          line by line: a <code>runReverse()</code> on the arm, bound to B. On{" "}
          <code>2-Commands</code> only <code>driver.a()</code> is taken, so{" "}
          <code>b()</code> is free.
        </p>

        <CodeBlock
          language="text"
          title="Prompt: one small change"
          code={`Add a runReverse() command to src/main/java/frc/robot/subsystems/Arm.java
that pushes -SLOW_VOLTAGE, matching the style of runSlow(). Then bind it in
src/main/java/frc/robot/opmodes/TeleopOpMode.java as:

    driver.b().onTrue(arm.runReverse()).onFalse(arm.stop());

Show me the diff before you write anything.`}
        />

        <ol className="ml-5 list-decimal space-y-3">
          <li>
            Paste it in the same session and read the diff.{" "}
            <strong>You should see:</strong> exactly two files and nothing else.{" "}
            <code>SLOW_VOLTAGE</code> is already 3.0, so a minus sign is the
            whole change. An assistant will often write <code>-3.0</code>
            instead, or add a <code>REVERSE_VOLTAGE</code> constant. Both
            compile, and both leave two numbers to keep in step, so ask it to
            reuse the constant.
          </li>
          <li>
            Accept, then run <code>gradlew build</code>.{" "}
            <strong>You should see:</strong> <code>BUILD SUCCESSFUL</code>. Do
            this before you run the robot, every time.
          </li>
        </ol>

        <Box
          variant="alert-danger"
          tag="DON'T"
          title="Accept a diff you have not read"
        >
          <p>
            Two of the three failures below are caught by reading the diff and
            counting the files it touched. A change to <code>Robot.java</code>,
            a class you did not ask for, or a rewritten <code>stop()</code>{" "}
            means it went past the request. Say no and ask again, narrower.
          </p>
        </Box>
      </LessonSection>

      <LessonSection id="check-your-work" title="Check your work">
        <ol className="ml-5 list-decimal space-y-3">
          <li>
            Run the code and enable the robot the way{" "}
            <strong>Running Your Code</strong> showed you.
          </li>
          <li>
            Hold the left trigger, then release.{" "}
            <strong>You should see:</strong> the arm pushes one way, exactly as
            before.
          </li>
          <li>
            Hold B, then release. <strong>You should see:</strong> the arm
            pushes the other way and more slowly, then stops. 3.0 V is half of
            6.0 V.
          </li>
        </ol>

        <p>
          <code>onTrue</code> schedules a hold, and a hold never ends by itself.
          Releasing B works because <code>arm.stop()</code> takes the arm away
          from it. If the arm keeps pushing after you let go, the{" "}
          <code>onFalse</code> half of the binding is missing.
        </p>

        <FigureGrid
          cols={3}
          items={[
            {
              label: "Build fails",
              term: "It wrote v2",
              body: (
                <>
                  The error names <code>edu.wpi.first</code> or{" "}
                  <code>SubsystemBase</code>. Revert, tell it to read{" "}
                  <code>ONBOARDING.md</code> and the{" "}
                  <code>robot-description</code> skill, then ask again.
                </>
              ),
            },
            {
              label: "Build fails",
              term: "Missing .named()",
              body: (
                <>
                  The error points at your new method. A builder is not a{" "}
                  <code>Command</code> until it is named, and a nameless command
                  is invisible in a log.
                </>
              ),
            },
            {
              label: "B does nothing",
              term: "One file edited",
              body: (
                <>
                  It changed <code>Arm.java</code> and forgot{" "}
                  <code>TeleopOpMode.java</code>. Count the bindings in the
                  constructor. There should be four.
                </>
              ),
            },
          ]}
        />

        <Box variant="alert-warning" tag="SAFETY" title="You own the code">
          <p>
            Read every change, build before you run, and be able to explain what
            the code does. Nobody in the pit cares which tool typed it.
          </p>
          <p className="mt-3">
            The 2027 stack is alpha software, so APIs move between releases.
            When the assistant and the compiler disagree, the compiler is right.
            The template outranks the assistant too.
          </p>
        </Box>

        <DocumentationButton
          href="https://github.com/Hemlock5712/2027-Template/tree/2027-dev/.claude/skills"
          title="The five skill files"
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
              "It read the wrong file in your project",
              "Both spellings work; v3 accepts either import",
              "It wrote Commands v2, because that is what nearly all of its training data contains",
              "It picked the newer API: v2 is the 2027 version",
            ],
            correctAnswer: 2,
            explanation:
              "Commands v3 and WPILib 2027 are newer than the code these models learned from, and almost every FRC repo online is v2. The v3 spellings are `extends Mechanism` and `org.wpilib.command3`. Ground the session by pointing it at ONBOARDING.md and the robot-description skill.",
          },
          {
            id: 2,
            question:
              "What is the fastest way to find out whether an assistant's change is v2 code?",
            options: [
              "Run `gradlew build`: wrong-framework imports fail instantly",
              "Deploy it and see whether the robot moves",
              "Ask the assistant whether it used Commands v3",
              "Read the diff carefully line by line",
            ],
            correctAnswer: 0,
            explanation:
              "The compiler settles it in seconds: a v2 import fails with something like `package edu.wpi.first.wpilibj2.command does not exist`. Asking the assistant does not help, because it was confident the first time. Build after every change, before you run anything.",
          },
          {
            id: 3,
            question: "What is an Agent Skill in this template?",
            options: [
              "A paid feature of Claude Code",
              "A Gradle task that generates documentation",
              "A plugin you install into your assistant",
              "A folder holding a SKILL.md Markdown file whose description tells the assistant when to read it",
            ],
            correctAnswer: 3,
            explanation:
              "A skill is plain Markdown. The description at the top says when it applies, and any assistant that can open files can use it. Claude Code finds `.claude/skills/` on its own; with Copilot or Codex you name the file yourself.",
          },
          {
            id: 4,
            question:
              'The assistant\'s runReverse() compiles and the arm moves, but it named the command "runReverse" instead of "runReverse (hold)". Why does that matter?',
            options: [
              "The command will run only once without it",
              "The name shows up in logs, and (hold) is how this project marks a command that never finishes",
              "WPILib rejects names without a suffix",
              "It doesn't: the suffix is decoration",
            ],
            correctAnswer: 1,
            explanation:
              "runRepeatedly never finishes on its own, so nothing may ever wait on it. Every hold on the branch carries the (hold) suffix, which makes a routine stuck on a hold obvious the moment you read the name in a log.",
          },
          {
            id: 5,
            question:
              "The diff for runReverse() touches Arm.java, TeleopOpMode.java and Robot.java. What do you do?",
            options: [
              "Accept it: `gradlew build` will fail if the third file is wrong",
              "Edit Robot.java by hand to match",
              "Say no and ask again with a narrower scope",
              "Accept only the Arm.java half, since the binding can wait",
            ],
            correctAnswer: 2,
            explanation:
              "The request named two files, so a third means the assistant went further than you asked. A build success proves nothing here: the extra edit compiles fine and nobody remembers making it. Counting files in a diff catches most of what goes wrong.",
          },
          {
            id: 6,
            question:
              "The assistant makes a change that works, and you do not understand it. What is the right next move?",
            options: [
              "Ask it to explain that one piece again in simpler terms, and open the file yourself",
              "Revert it and write the whole thing by hand",
              "Ask a different assistant for a second opinion",
              "Ship it: it builds and the robot moves",
            ],
            correctAnswer: 0,
            explanation:
              "Teacher mode is on by default, so asking for a simpler explanation of one specific piece is what it is for. Code you cannot explain is code you cannot debug at a competition, and the assistant will not be sitting in the pit with you.",
          },
        ]}
      />
    </PageTemplate>
  );
}
