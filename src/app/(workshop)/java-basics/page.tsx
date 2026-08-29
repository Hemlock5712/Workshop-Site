import PageTemplate from "@/components/PageTemplate";
import { Split } from "@/components/lesson/Prose";
import LessonSection from "@/components/lesson/LessonSection";
import CodeBlock from "@/components/CodeBlock";
import Box from "@/components/Box";
import DocumentationButton from "@/components/DocumentationButton";
import Quiz from "@/components/Quiz";
import { BookOpen, GitBranch } from "lucide-react";

/**
 * An on-ramp and a gate, not a Java course. It ran 12 minutes across six
 * sections, and almost all of it was taught again two to four lessons later on
 * code the student types.
 *
 * The overlap was checked page by page before this was cut. `/adding-commands`
 * teaches the lambda, `motor::stopMotor` and the builder-versus-`Command`
 * point on the real diff, and quizzes them. `/building-subsystems` teaches the
 * same fields block, the constructor and the two methods on the file the
 * student writes by hand. Printing all of it here first bought a preview and
 * charged twelve minutes for it.
 *
 * The page cannot simply be deleted: four lessons name it in `needs`.
 * `/command-framework` asks for "the vocabulary: class, field, method,
 * constructor, lambda, method reference", `/adding-commands` and
 * `/finish-lines` for lambdas and method references, `/building-subsystems`
 * for fields, constructors and methods. So what survives is exactly what those
 * four promises need and nothing downstream defines: the six words, and
 * `private` / `public` / `final` / `extends`.
 *
 * Everything else is outsourced to Codecademy's free Learn Java, four modules
 * of it, named in section one. That is why nothing here teaches braces,
 * semicolons, `if`, or the comparison operators: a student who wants the
 * language gets a course that checks their typing, not a table on a page.
 *
 * The quiz is the point of the page now, not its tail. It is the only place a
 * student who skipped the course finds out before they open an editor.
 */
export default function JavaBasics() {
  return (
    <PageTemplate
      title="Java Basics"
      lede="This page does not teach Java. It sends you to a free course, then names the few words that course leaves unconnected to robot code. The quiz at the end checks that you can read the next four lessons."
      needs={[
        <>Nothing installed. No project, no robot, no build.</>,
        <>A free Codecademy account, which the course below needs.</>,
      ]}
      time="7 minutes"
    >
      <Split>
        <div className="measure flex flex-col gap-pad [&>p]:m-0 [&>p]:prose-body">
          <p>
            Six pieces carry nearly all of the Java in this workshop: the class,
            the field, the constructor, the method, the lambda, and the dot. The
            course below teaches five of them.
          </p>
        </div>
      </Split>

      <LessonSection id="learn-the-language" title="Learn Java on Codecademy">
        <p>
          Codecademy&apos;s <strong>Learn Java</strong> is free and runs in the
          browser, so there is nothing to install. Do not do all sixteen
          modules. Four of them cover almost everything the code here uses.
        </p>

        <div className="measure-wide overflow-x-auto">
          <table className="w-full min-w-[520px] border-collapse text-note">
            <thead>
              <tr style={{ borderBottom: "1px solid var(--rule)" }}>
                <th className="px-3 py-2 text-left">Module</th>
                <th className="px-3 py-2 text-left">What it gives you</th>
              </tr>
            </thead>
            <tbody style={{ color: "var(--tx2)" }}>
              <tr style={{ borderBottom: "1px solid var(--rule-soft)" }}>
                <td className="px-3 py-2">1. Hello World</td>
                <td className="px-3 py-2">
                  Braces, semicolons and comments. The punctuation you are about
                  to stop noticing.
                </td>
              </tr>
              <tr style={{ borderBottom: "1px solid var(--rule-soft)" }}>
                <td className="px-3 py-2">2. Variables</td>
                <td className="px-3 py-2">
                  <code>double</code>, <code>boolean</code>, and what{" "}
                  <code>final</code> does.
                </td>
              </tr>
              <tr style={{ borderBottom: "1px solid var(--rule-soft)" }}>
                <td className="px-3 py-2">3. Object-Oriented Java</td>
                <td className="px-3 py-2">
                  Classes, objects, <code>new</code>, constructors, methods. The
                  one that matters most here.
                </td>
              </tr>
              <tr>
                <td className="px-3 py-2">4. Conditionals and Control Flow</td>
                <td className="px-3 py-2">
                  <code>if</code>, <code>else</code>, and the comparison
                  operators: <code>&lt;</code> <code>&gt;</code> <code>==</code>{" "}
                  <code>!=</code> <code>&amp;&amp;</code> <code>||</code>{" "}
                  <code>!</code>.
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        <p>
          Stop after <strong>Conditionals and Control Flow</strong> and come
          back. Arrays and string methods barely turn up here. Loops do, but not
          until Workshop 5, where a coroutine body is written as a real{" "}
          <code>while</code> loop. That lesson asks for the module by name.
        </p>

        <DocumentationButton
          href="https://www.codecademy.com/learn/learn-java"
          title="Learn Java on Codecademy: free, in the browser, nothing to install"
          icon={<BookOpen className="w-5 h-5" />}
        />
      </LessonSection>

      <LessonSection id="the-six-pieces" title="The six pieces">
        <p>
          The course covers all of these except the lambda. This is what they
          look like in robot code, and it is the vocabulary the next four
          lessons assume you have.
        </p>

        <div className="measure-wide overflow-x-auto">
          <table className="w-full min-w-[520px] border-collapse text-note">
            <thead>
              <tr style={{ borderBottom: "1px solid var(--rule)" }}>
                <th className="px-3 py-2 text-left">Piece</th>
                <th className="px-3 py-2 text-left">In this workshop</th>
              </tr>
            </thead>
            <tbody style={{ color: "var(--tx2)" }}>
              <tr style={{ borderBottom: "1px solid var(--rule-soft)" }}>
                <td className="px-3 py-2">class</td>
                <td className="px-3 py-2">
                  A kind of thing. <code>class Arm</code> is the drawing, and{" "}
                  <code>new Arm()</code> builds one real arm from it.
                </td>
              </tr>
              <tr style={{ borderBottom: "1px solid var(--rule-soft)" }}>
                <td className="px-3 py-2">field</td>
                <td className="px-3 py-2">
                  What an object owns for as long as it lives.{" "}
                  <code>private final TalonFX motor</code> is one.
                </td>
              </tr>
              <tr style={{ borderBottom: "1px solid var(--rule-soft)" }}>
                <td className="px-3 py-2">constructor</td>
                <td className="px-3 py-2">
                  Same name as the class, no return type. It runs once, the
                  instant <code>new Arm()</code> runs, and you never call it by
                  name.
                </td>
              </tr>
              <tr style={{ borderBottom: "1px solid var(--rule-soft)" }}>
                <td className="px-3 py-2">method</td>
                <td className="px-3 py-2">
                  A named block you can call. Read its return type first:{" "}
                  <code>void</code> hands nothing back.
                </td>
              </tr>
              <tr style={{ borderBottom: "1px solid var(--rule-soft)" }}>
                <td className="px-3 py-2">lambda</td>
                <td className="px-3 py-2">
                  Code written down and handed over rather than run.{" "}
                  <code>() -&gt; setVoltage(3.0)</code> is one, and{" "}
                  <code>motor::stopMotor</code> is the same idea written as a
                  method reference.
                </td>
              </tr>
              <tr>
                <td className="px-3 py-2">the dot</td>
                <td className="px-3 py-2">
                  <code>a.b()</code> means &quot;on the thing <code>a</code>,
                  call <code>b</code>&quot;. What you may type after a dot
                  depends on the type in front of it.
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        <p>
          A field carries two more words in front of its type. Marking it{" "}
          <code>private</code> means only code inside <code>Arm.java</code> may
          touch it, and <code>public</code> is the opposite. A{" "}
          <code>final</code> field points at one object for good. It locks the
          box and not the contents, so <code>motor.setControl(...)</code> still
          works while <code>motor = new TalonFX(...)</code> does not.
        </p>
        <p>
          Writing <code>public class Arm extends Mechanism</code> gives{" "}
          <code>Arm</code> everything <code>Mechanism</code> can do.{" "}
          <code>Mechanism</code> has a method called{" "}
          <code>runRepeatedly(...)</code>, for instance. Look through{" "}
          <code>Arm.java</code> and you will not find that method written
          anywhere. You can call it anyway.
        </p>

        <CodeBlock
          language="java"
          title="Arm.java, branch mech-2-Commands: the method, the lambda, and the dot"
          code={`/** Push the arm with a gentle voltage and keep pushing. Never finishes. */
public Command runSlow() {
  return runRepeatedly(() -> setVoltage(3.0)).named("runSlow (hold)");
}`}
        />

        <Box
          variant="alert-warning"
          tag="WATCH OUT"
          title="Writing a lambda runs nothing"
        >
          <p>
            Call <code>arm.runSlow()</code> and <code>setVoltage(3.0)</code>{" "}
            does not happen. The method builds a <code>Command</code> and hands
            it back with the lambda parked inside, and something else runs that
            command later.
          </p>
          <p className="mt-3">
            This failure has no error message. The arm does not move, nothing
            logs, and nobody ever scheduled the command.
          </p>
        </Box>
      </LessonSection>

      <LessonSection id="check-your-work" title="Check your work">
        <p>
          Six questions on the lines above. Miss more than one and the course is
          worth another evening, because the next four lessons read code like
          this on every page.
        </p>

        <Quiz
          questions={[
            {
              id: 1,
              question:
                "In runRepeatedly(() -> setVoltage(3.0)), when does setVoltage(3.0) run?",
              options: [
                "Immediately, when runSlow() is called",
                "Once, at the moment the command is scheduled",
                "Every loop, for as long as the scheduler is running that command",
                "Never: a lambda is only a description",
              ],
              correctAnswer: 2,
              explanation:
                "Writing a lambda runs nothing. runSlow() builds a Command and hands it back with the lambda parked inside. Once something schedules the command, the body runs every loop until the command is canceled.",
            },
            {
              id: 2,
              question:
                "Why is it motor::stopMotor and not motor.stopMotor() inside runRepeatedly(...)?",
              options: [
                ":: hands the method over to be called later; () calls it right now and hands back nothing",
                ":: is required whenever the method takes no arguments",
                "motor.stopMotor() would stop the motor twice",
                ":: is a style preference: both compile",
              ],
              correctAnswer: 0,
              explanation:
                "runRepeatedly needs code it can call every loop. motor::stopMotor is shorthand for () -> motor.stopMotor(). Writing motor.stopMotor() calls the method on the spot and produces nothing to hand over, so it does not compile.",
            },
            {
              id: 3,
              question:
                "In private final TalonFX motor = new TalonFX(31, canivore), what does final stop you doing?",
              options: [
                "Calling any method that changes what the motor outputs",
                "Pointing motor at a different TalonFX later on",
                "Reading the motor's position",
                "Building a second TalonFX anywhere in the file",
              ],
              correctAnswer: 1,
              explanation:
                "final locks the box, not the contents. motor.setControl(...) still works, and the flywheel still builds a TalonFX of its own. What it forbids is motor = new TalonFX(...) somewhere further down the file.",
            },
            {
              id: 4,
              question:
                "Arm.java never contains the word runRepeatedly, and runSlow() calls it. Why does that compile?",
              options: [
                "The compiler pulls in any method it finds in an imported package",
                "runRepeatedly is static, so it needs no object in front of it",
                "Arm extends Mechanism, so everything Mechanism can do, Arm can do",
                "The lambda supplies it",
              ],
              correctAnswer: 2,
              explanation:
                "extends is the whole answer. Arm inherits every method on Mechanism without repeating one of them, which is also where idle() and the scheduler registration come from. Search the file for those and you will not find them either.",
            },
            {
              id: 5,
              question: "When does the code inside public Arm() run?",
              options: [
                "Every scheduler loop, the way a command does",
                "Once, the instant new Arm() runs",
                "Whenever something calls arm.Arm()",
                "Once per OpMode, when that mode starts",
              ],
              correctAnswer: 1,
              explanation:
                "A constructor has the class's name and no return type, and it runs once, automatically, when the object is built. Nothing calls it by name. That is why one-time motor configuration belongs in it.",
            },
            {
              id: 6,
              question:
                'runRepeatedly(...).named("runSlow (hold)") compiles, but arm.runSlow().named("lift") does not. Why?',
              options: [
                ".named(...) may only be called inside a mechanism class",
                "runSlow() returns void, so there is nothing to call a method on",
                "Command names have to be unique across the project",
                "runRepeatedly hands back a half-finished command that has .named(...); runSlow() already called it, so what comes back is a finished Command, which does not",
              ],
              correctAnswer: 3,
              explanation:
                "The type in front of a dot decides what you can type after it. named(String) lives on the half-finished command that runRepeatedly(...) hands back. runSlow() already called it, so it gives you a finished Command with nothing left to name.",
            },
          ]}
        />

        <DocumentationButton
          href="https://github.com/Hemlock5712/Workshop-Code/blob/mech-2-Commands/src/main/java/first/robot/mechanisms/Arm.java"
          title="Arm.java on mech-2-Commands: the file these four lines come from"
          icon={<GitBranch className="w-5 h-5" />}
        />
      </LessonSection>
    </PageTemplate>
  );
}
