import PageTemplate from "@/components/PageTemplate";
import LessonSection from "@/components/lesson/LessonSection";
import CodeBlock from "@/components/CodeBlock";
import Box from "@/components/Box";
import DocumentationButton from "@/components/DocumentationButton";
import Quiz from "@/components/Quiz";
import { BookOpen } from "lucide-react";
import { lessonMetadata } from "@/lib/lessonMetadata";

export const metadata = lessonMetadata("/java-basics");

/**
 * An on-ramp and a gate, not a Java course. It ran 12 minutes across six
 * sections, and almost all of it was taught again two to four lessons later on
 * code the student types.
 *
 * The overlap was checked page by page before this was cut. `/adding-commands`
 * teaches the lambda and the builder-versus-`Command`
 * point on the real diff, and quizzes them. `/mechanisms` teaches the
 * same fields block, the constructor and the two methods on the file the
 * student writes by hand. Printing all of it here first bought a preview and
 * charged twelve minutes for it.
 *
 * The page cannot simply be deleted: four lessons name it in `needs`.
 * `/command-framework` asks for "the vocabulary: class, field, method,
 * constructor, lambda", `/adding-commands` and `/finish-conditions` for
 * lambdas, `/mechanisms` for fields, constructors and methods. So what
 * survives is exactly what those four promises need and nothing downstream
 * defines: the six words, and `private` / `public` / `implements`.
 * There are no method references on this site, so none are taught here.
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
      lede="We will not be teaching you full Java. If you have no Java experience, we recommend a few free lessons below. Even without them, we will cover things as we go."
      needs={[
        <>Nothing installed. No project, no robot, no build.</>,
        <>A free Codecademy account, which the course below needs.</>,
      ]}
      time="7 minutes"
    >
      <LessonSection id="learn-the-language" title="Learn Java on Codecademy">
        <p>
          Codecademy&apos;s <strong>Learn Java</strong> is free and runs in the
          browser, so there is nothing to install. Four modules cover almost
          everything the code here uses.
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
                <td className="px-3 py-2">Braces, semicolons and comments.</td>
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
          Stop after <strong>Conditionals and Control Flow</strong>. We will not
          use arrays or string methods. Loops turn up once, in Workshop 4, where
          you write a <code>while</code> loop by hand inside a coroutine.
        </p>

        <DocumentationButton
          href="https://www.codecademy.com/learn/learn-java"
          title="Learn Java on Codecademy: free, in the browser, nothing to install"
          icon={<BookOpen className="w-5 h-5" />}
        />
      </LessonSection>

      <LessonSection id="the-six-pieces" title="The six pieces">
        <p>
          There are six main pieces to the code you will be writing. The course
          above covers all of them except the lambda.
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
                  <code>() -&gt; stopMotor()</code> is another. The{" "}
                  <code>() -&gt;</code> is what makes it a parcel instead of a
                  call.
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
          Marking a field <code>private</code> means only code inside{" "}
          <code>Arm.java</code> may touch it, and <code>public</code> is the
          opposite.
        </p>
        <p>
          Another word you will see is <code>implements</code>. Writing{" "}
          <code>public class Arm implements Mechanism</code> gives{" "}
          <code>Arm</code> everything <code>Mechanism</code> can do.{" "}
          <code>Mechanism</code> has a method called{" "}
          <code>runRepeatedly(...)</code>, for instance. Look through{" "}
          <code>Arm.java</code> and you will not find that method written
          anywhere. You can call it anyway.
        </p>

        <CodeBlock
          language="java"
          title="Arm.java, branch mech-2-Commands: the method, the lambda, and the dot"
          code={`/** Push the arm at 3 volts and keep pushing. Never finishes. */
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
          Five questions on the lines above. If you miss more than one, go back
          to the course before the next lesson.
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
                "Why is it () -> stopMotor() and not stopMotor() inside runRepeatedly(...)?",
              options: [
                "() -> hands the call over to run later; stopMotor() on its own runs right now and hands back nothing",
                "() -> is required whenever the method takes no arguments",
                "stopMotor() on its own would stop the motor twice",
                "It is a style preference, and both compile",
              ],
              correctAnswer: 0,
              explanation:
                "runRepeatedly needs code it can call every loop, and () -> stopMotor() hands over the call itself rather than its result. Writing stopMotor() runs the method on the spot and produces nothing to hand over, so it does not compile.",
            },
            {
              id: 3,
              question:
                "Arm.java never contains the word runRepeatedly, and runSlow() calls it. Why does that compile?",
              options: [
                "The compiler pulls in any method it finds in an imported package",
                "runRepeatedly is static, so it needs no object in front of it",
                "Arm implements Mechanism, so everything Mechanism can do, Arm can do",
                "The lambda supplies it",
              ],
              correctAnswer: 2,
              explanation:
                "implements is the whole answer. Mechanism is an interface whose methods already have bodies, so Arm gets every one of them without repeating any. idle() and run(...) arrive the same way. Search the file for those and you will not find them either.",
            },
            {
              id: 4,
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
              id: 5,
              question:
                'runRepeatedly(...).named("runSlow (hold)") compiles, but arm.runSlow().named("lift") does not. Why?',
              options: [
                ".named(...) may only be called inside a mechanism class",
                "runSlow() returns void, so there is nothing to call a method on",
                "Command names have to be unique across the project",
                "runRepeatedly returns a half-finished command that has .named(...); runSlow() already called it, so what comes back is a finished Command, which does not",
              ],
              correctAnswer: 3,
              explanation:
                "The type in front of a dot decides what you can type after it. named(String) is a method on the half-finished command that runRepeatedly(...) returns. runSlow() already called it, so it gives you a finished Command with nothing left to name.",
            },
          ]}
        />
      </LessonSection>
    </PageTemplate>
  );
}
