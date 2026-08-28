import PageTemplate from "@/components/PageTemplate";
import { Split } from "@/components/lesson/Prose";
import LessonSection from "@/components/lesson/LessonSection";
import CodeBlock from "@/components/CodeBlock";
import Box from "@/components/Box";
import DocumentationButton from "@/components/DocumentationButton";
import Quiz from "@/components/Quiz";
import { GitBranch } from "lucide-react";

/**
 * First contact with Java on this site. Workshop 1 is entirely Tuner X, so a
 * student arriving here has read no code at all.
 *
 * Scope is deliberately small: the six pieces that make the next four lessons
 * readable, plus a reference table for the words that only need a line. This
 * page used to walk a whole `Arm.java` across fourteen sections at 45 minutes.
 * What survived is what has a failure mode attached, above all the lambda that
 * runs nothing and produces no error to say so.
 */
export default function JavaBasics() {
  return (
    <PageTemplate
      title="Java Basics"
      lede="This covers the Java the next four lessons need, and stops there. Every example is printed on the page, taken from the arm you build later in this workshop."
      needs={[<>Nothing installed. No project, no robot, no build.</>]}
      time="12 minutes"
    >
      <Split>
        <div className="measure flex flex-col gap-pad [&>p]:m-0 [&>p]:prose-body">
          <p>
            You will read far more Java here than you write. Six pieces carry
            nearly all of it: the class, the field, the constructor, the method,
            the lambda, and the dot.
          </p>
          <p>
            A <code>{"{"}</code> opens a block and the matching{" "}
            <code>{"}"}</code> closes it. The class braces hold the fields and
            the methods; a method&apos;s braces hold its statements.
          </p>
          <p>
            Every statement ends in <code>;</code>. A line that opens a block
            does not, because it is not a statement. Indentation is for you, and
            the compiler reads only the braces.
          </p>
        </div>
      </Split>

      <LessonSection id="classes-and-objects" title="Classes and objects">
        <p>
          A class describes a kind of thing. <code>class Arm</code> is a drawing
          of an arm, and a drawing moves nothing. A line reading{" "}
          <code>new Arm()</code> builds one real arm from it, and what you get
          back is an object.
        </p>
        <p>
          One class, any number of objects. The flywheel builds{" "}
          <code>new TalonFX(21, canivore)</code> and{" "}
          <code>new TalonFX(22, canivore)</code>, two separate motors from one
          class.
        </p>
        <p>
          <code>public class Arm extends Mechanism</code> adds the second idea.
          Everything <code>Mechanism</code> can do, <code>Arm</code> can do,
          with no trace of it in <code>Arm.java</code>. Search that file for{" "}
          <code>runRepeatedly</code> and you will not find it. It works anyway.
        </p>
      </LessonSection>

      <LessonSection id="fields" title="Fields">
        <p>
          Fields are what an object owns, and they last as long as it does. The
          arm owns four: a bus, a motor, an encoder, and a voltage request.
        </p>

        <CodeBlock
          language="java"
          title="Arm.java, branch mech-1-Mechanisms: the four fields"
          code={`private final CANBus canivore = new CANBus("canivore");
private final TalonFX motor = new TalonFX(31, canivore);
private final CANcoder encoder = new CANcoder(32, canivore);

// Pushes a set voltage at the motor. No sensors involved.
private final VoltageOut voltageOut = new VoltageOut(0);`}
        />

        <p>Take the second line apart, left to right.</p>

        <div className="measure-wide overflow-x-auto">
          <table className="w-full min-w-[520px] border-collapse text-note">
            <thead>
              <tr style={{ borderBottom: "1px solid var(--rule)" }}>
                <th className="px-3 py-2 text-left">Part</th>
                <th className="px-3 py-2 text-left">What it means</th>
              </tr>
            </thead>
            <tbody style={{ color: "var(--tx2)" }}>
              <tr style={{ borderBottom: "1px solid var(--rule-soft)" }}>
                <td className="px-3 py-2">
                  <code>private</code>
                </td>
                <td className="px-3 py-2">
                  Only code inside <code>Arm.java</code> can touch it.
                </td>
              </tr>
              <tr style={{ borderBottom: "1px solid var(--rule-soft)" }}>
                <td className="px-3 py-2">
                  <code>final</code>
                </td>
                <td className="px-3 py-2">
                  Points at this one TalonFX for good. It locks the box, not the
                  contents, so <code>motor.setControl(...)</code> still works.
                </td>
              </tr>
              <tr style={{ borderBottom: "1px solid var(--rule-soft)" }}>
                <td className="px-3 py-2">
                  <code>TalonFX</code>
                </td>
                <td className="px-3 py-2">
                  The type. What kind of thing goes in the box.
                </td>
              </tr>
              <tr style={{ borderBottom: "1px solid var(--rule-soft)" }}>
                <td className="px-3 py-2">
                  <code>motor</code>
                </td>
                <td className="px-3 py-2">
                  The name the rest of the file uses.
                </td>
              </tr>
              <tr style={{ borderBottom: "1px solid var(--rule-soft)" }}>
                <td className="px-3 py-2">
                  <code>=</code>
                </td>
                <td className="px-3 py-2">
                  Put the thing on the right into the box on the left.
                </td>
              </tr>
              <tr>
                <td className="px-3 py-2">
                  <code>new TalonFX(31, canivore)</code>
                </td>
                <td className="px-3 py-2">
                  <code>new</code> builds the object. It is handed CAN ID 31 and
                  the CANivore bus.
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        <p>
          <code>public</code> is the opposite: any file may reach it. That is
          why <code>Robot.java</code> writes <code>public final Arm arm</code>.
        </p>
      </LessonSection>

      <LessonSection
        id="constructors-and-methods"
        title="Constructors and methods"
      >
        <p>
          A constructor has the same name as the class and no return type in
          front of it. It runs once, automatically, the instant{" "}
          <code>new Arm()</code> runs. You never call it by name.
        </p>

        <CodeBlock
          language="java"
          title="Arm.java, branch mech-1-Mechanisms: the constructor"
          code={`public Arm() {
  TalonFXConfiguration config =
      new TalonFXConfiguration()
          .withMotorOutput(
              new MotorOutputConfigs()
                  .withNeutralMode(NeutralModeValue.Coast) // easy to move by hand
                  .withInverted(InvertedValue.CounterClockwise_Positive))
          // Use the CANcoder for position, so the motor knows the arm's real angle.
          .withFeedback(new FeedbackConfigs().withRemoteCANcoder(encoder));

  motor.getConfigurator().apply(config);
}`}
        />

        <Split>
          <div className="measure flex flex-col gap-pad [&>p]:m-0 [&>p]:prose-body">
            <p>
              Fields carrying a <code>= new ...</code> are built before the
              constructor body starts, so <code>motor</code> and{" "}
              <code>encoder</code> exist by the last line. The{" "}
              <code>config</code> variable is local: born on that line, gone at
              the closing brace.
            </p>
          </div>
        </Split>

        <CodeBlock
          language="java"
          title="Arm.java, branch mech-1-Mechanisms: the first method on the site"
          code={`/**
 * Push the arm with a fixed voltage. Positive voltage moves the arm counter-clockwise.
 *
 * @param voltage The voltage to apply.
 */
public void setVoltage(double voltage) {
  motor.setControl(voltageOut.withOutput(voltage));
}`}
        />

        <p>
          A signature reads left to right: who may call it, the return type, the
          name, then the parameter list. Three type words turn up constantly. A{" "}
          <code>double</code> carries a decimal point, a <code>boolean</code> is{" "}
          <code>true</code> or <code>false</code>, and <code>void</code> means
          the method hands nothing back.
        </p>
      </LessonSection>

      <LessonSection id="code-as-a-value" title="Code as a value">
        <p>
          <code>return</code> hands a value back to whoever called the method,
          and stops there. Read the return type first on any method you meet.
        </p>

        <CodeBlock
          language="java"
          title="Arm.java, branch mech-2-Commands: a method that returns a Command"
          code={`// Voltages for the two example commands.
private static final double SLOW_VOLTAGE = 3.0;

/** Push the arm with a gentle voltage and keep pushing. Never finishes. */
public Command runSlow() {
  return runRepeatedly(() -> setVoltage(SLOW_VOLTAGE)).named("runSlow (hold)");
}`}
        />

        <p>
          <code>runSlow()</code> does not move the arm. It builds a{" "}
          <code>Command</code> object and hands it back, and something else runs
          that command later. Only the return type says so.
        </p>
        <p>
          Inside it, <code>() -&gt; setVoltage(SLOW_VOLTAGE)</code> is a lambda:
          a chunk of code handed over as a value. The <code>()</code> is its
          input list, empty here, and everything after the arrow is the code.
        </p>

        <Box
          variant="alert-warning"
          tag="WATCH OUT"
          title="Writing a lambda runs nothing"
        >
          <p>
            Call <code>arm.runSlow()</code> and <code>setVoltage(3.0)</code>{" "}
            does not happen. The lambda sits parked inside the command until the
            scheduler runs it, then fires every loop for as long as the command
            stays scheduled.
          </p>
          <p className="mt-3">
            This failure has no error message. The arm does not move, nothing
            logs, and nobody ever scheduled the command.
          </p>
        </Box>

        <CodeBlock
          language="java"
          title="Arm.java, branch mech-2-Commands: the stop command"
          code={`/** Stop the arm motor and keep it stopped. Never finishes. */
public Command stop() {
  return runRepeatedly(motor::stopMotor).named("stop (hold)");
}`}
        />

        <p>
          <code>motor::stopMotor</code> means the same thing as{" "}
          <code>() -&gt; motor.stopMotor()</code>. Two colons, no parentheses:
          you are handing the method over, not calling it. Write{" "}
          <code>motor.stopMotor()</code> in that slot and Java calls it on the
          spot, gets nothing back, and will not compile.
        </p>
        <p>
          Now the dot. Writing <code>a.b()</code> means &quot;on the thing{" "}
          <code>a</code>, call <code>b</code>&quot;, and what you may type after
          a dot depends on the type in front of it.{" "}
          <code>runRepeatedly(...)</code> hands back a half-finished command,
          which is where <code>.named(...)</code> lives. A finished{" "}
          <code>Command</code> does not have it.
        </p>
      </LessonSection>

      <LessonSection id="words-in-passing" title="Words in passing">
        <p>These appear in code you read here, and each needs one line.</p>

        <div className="measure-wide overflow-x-auto">
          <table className="w-full min-w-[520px] border-collapse text-note">
            <thead>
              <tr style={{ borderBottom: "1px solid var(--rule)" }}>
                <th className="px-3 py-2 text-left">Word</th>
                <th className="px-3 py-2 text-left">What it does</th>
              </tr>
            </thead>
            <tbody style={{ color: "var(--tx2)" }}>
              <tr style={{ borderBottom: "1px solid var(--rule-soft)" }}>
                <td className="px-3 py-2">
                  <code>static</code>
                </td>
                <td className="px-3 py-2">
                  Belongs to the class, not to an object built from it.{" "}
                  <code>Scheduler.getDefault()</code> is called on the class
                  name, with nothing constructed first. Add <code>final</code>{" "}
                  and it is a named constant, spelled in capitals.
                </td>
              </tr>
              <tr style={{ borderBottom: "1px solid var(--rule-soft)" }}>
                <td className="px-3 py-2">
                  <code>@Override</code>
                </td>
                <td className="px-3 py-2">
                  This method replaces one from the class you extended. Misspell
                  the name and the compiler stops you.
                </td>
              </tr>
              <tr style={{ borderBottom: "1px solid var(--rule-soft)" }}>
                <td className="px-3 py-2">
                  <code>@Teleop</code>
                </td>
                <td className="px-3 py-2">
                  A label the framework reads to find your OpMode. Delete it and
                  the mode vanishes, with no compile error.
                </td>
              </tr>
              <tr>
                <td className="px-3 py-2">
                  <code>&lt;</code> <code>&gt;</code> <code>==</code>{" "}
                  <code>!=</code> <code>&amp;&amp;</code> <code>||</code>{" "}
                  <code>!</code>
                </td>
                <td className="px-3 py-2">
                  Less than, greater than, equal, not equal, and, or, not. A
                  leading <code>!</code> reverses everything after it.
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </LessonSection>

      <LessonSection id="check-your-work" title="Check your work">
        <p>
          The check is a reading test. Scroll back to <code>runSlow</code> and
          name every part of it out loud.
        </p>

        <Box variant="alert-success" title="You should be able to say">
          <ul className="ml-5 list-disc space-y-2">
            <li>
              What <code>private</code>, <code>static</code> and{" "}
              <code>final</code> each do on that first line.
            </li>
            <li>
              What <code>runSlow()</code> hands back, and what it leaves undone.
            </li>
            <li>
              Where <code>runRepeatedly</code> comes from, given that it is not
              in the file.
            </li>
            <li>
              When <code>setVoltage</code> runs, and how often after that.
            </li>
          </ul>
        </Box>

        <Quiz
          questions={[
            {
              id: 1,
              question:
                "In runRepeatedly(() -> setVoltage(SLOW_VOLTAGE)), when does setVoltage(3.0) run?",
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
                'runRepeatedly(...).named("runSlow (hold)") compiles, but arm.runFast().named("lift") does not. Why?',
              options: [
                ".named(...) may only be called inside a mechanism class",
                "runFast() returns void, so there is nothing to call a method on",
                "Command names have to be unique across the project",
                "runRepeatedly hands back a half-finished command that has .named(...); runFast() already called it, so what comes back is a finished Command, which does not",
              ],
              correctAnswer: 3,
              explanation:
                "The type in front of a dot decides what you can type after it. named(String) lives on the half-finished command that runRepeatedly(...) hands back. A finished Command has no named(String) at all, so runFast(), which already called it, gives you something with nothing left to name.",
            },
          ]}
        />

        <DocumentationButton
          href="https://github.com/Hemlock5712/Workshop-Code/blob/mech-1-Mechanisms/src/main/java/first/robot/mechanisms/Arm.java"
          title="Arm.java on mech-1-Mechanisms: the file these excerpts come from"
          icon={<GitBranch className="w-5 h-5" />}
        />
      </LessonSection>
    </PageTemplate>
  );
}
