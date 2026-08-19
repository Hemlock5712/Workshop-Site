import PageTemplate from "@/components/PageTemplate";
import { MarginNote, Split } from "@/components/lesson/Prose";
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
      lede="Every example is printed on the page, so there is nothing to install and nothing to run. This covers the Java the next four lessons need, and stops there. The specimen is the small arm mechanism you build later in this workshop."
      needs={[
        <>Nothing installed. No project, no robot, no build.</>,
        <>
          No framework knowledge. <code>Mechanism</code> and{" "}
          <code>Command</code> appear here only as type names.
        </>,
      ]}
      time="14 minutes"
    >
      <Split>
        <div className="measure flex flex-col gap-pad [&>p]:m-0 [&>p]:prose-body">
          <p>
            You will read far more Java on this site than you write. Six pieces
            carry nearly all of it: the class, the field, the constructor, the
            method, the lambda, and the dot.
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
        <MarginNote label="Not a Java course">
          Loops, arrays, and interfaces are left out because no lesson here
          needs them. If a construct is missing from this page, you will not
          meet it later.
        </MarginNote>
      </Split>

      <LessonSection id="classes-and-objects" title="Classes and objects">
        <p>
          A class describes a kind of thing. <code>class Arm</code> is a drawing
          of an arm, and a drawing moves nothing. Elsewhere a line reads{" "}
          <code>new Arm()</code>, and that builds one real arm from the drawing.
          What you get back is an object.
        </p>
        <p>
          One class, any number of objects. The flywheel builds{" "}
          <code>new TalonFX(21, canivore)</code> and{" "}
          <code>new TalonFX(22, canivore)</code> from the same class and gets
          two separate motors.
        </p>
        <p>
          <code>public class Arm extends Mechanism</code> adds the second idea.
          Everything <code>Mechanism</code> can do, <code>Arm</code> can do,
          with no trace of it in <code>Arm.java</code>. Search that file for{" "}
          <code>runRepeatedly</code> and you will not find it. It works anyway.
        </p>
        <p>
          The arm object gets made in <code>Robot.java</code>, which writes{" "}
          <code>public final Arm arm = new Arm();</code>. The word{" "}
          <code>public</code> is what lets an OpMode reach it later as{" "}
          <code>robot.arm</code>.
        </p>
      </LessonSection>

      <LessonSection id="fields" title="Fields">
        <p>
          Fields are what an object owns, and they last as long as the object
          does. The arm owns four: a bus, a motor, an encoder, and a voltage
          request.
        </p>

        <CodeBlock
          language="java"
          title="Arm.java, branch 1-Subsystem: the four fields"
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

        <Box variant="concept" title="One word carries the Commands lesson">
          <p>
            On branch <code>1-Subsystem</code> the arm&apos;s{" "}
            <code>setVoltage</code> is <code>public</code>. One branch later it
            becomes <code>private</code>, and every request has to arrive as a
            command instead.
          </p>
        </Box>
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
          title="Arm.java, branch 1-Subsystem: the constructor"
          code={`public Arm() {
  TalonFXConfiguration config = new TalonFXConfiguration();
  config.MotorOutput.NeutralMode = NeutralModeValue.Coast; // easy to move by hand
  config.MotorOutput.Inverted = InvertedValue.CounterClockwise_Positive;

  // Use the CANcoder for position, so the motor knows the arm's real angle.
  config.Feedback.withRemoteCANcoder(encoder);

  TalonFXUtil.applyConfigWithRetries(motor, config);
}`}
        />

        <Split>
          <div className="measure flex flex-col gap-pad [&>p]:m-0 [&>p]:prose-body">
            <p>
              Fields carrying a <code>= new ...</code> are built before the
              constructor body starts, so <code>motor</code> and{" "}
              <code>encoder</code> already exist when the last line hands them
              to Phoenix.
            </p>
            <p>
              <code>config</code> is different. It is a local variable: born on
              that line, gone at the closing brace. <code>setVoltage</code>{" "}
              cannot see it.
            </p>
          </div>
          <MarginNote label="Where a line lives">
            A statement like <code>TalonFXConfiguration config = ...</code> only
            compiles inside a method or constructor. Put one where a field
            belongs and the compiler says{" "}
            <code>&lt;identifier&gt; expected</code>, pointing at a line that
            looks fine.
          </MarginNote>
        </Split>

        <p>
          Constructors can take parameters.{" "}
          <code>TeleopOpMode(Robot robot)</code> takes one <code>Robot</code>,
          and the driver&apos;s button bindings are written inside it. They get
          wired once, when the mode starts, not every loop.
        </p>

        <CodeBlock
          language="java"
          title="Arm.java, branch 1-Subsystem: the first method on the site"
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
          A signature reads left to right. <code>public</code> says who may call
          it. Next comes <code>void</code>, the return type. Then the name, then
          the parameter list: one <code>double</code> called{" "}
          <code>voltage</code>.
        </p>
        <p>
          Three type words turn up constantly. A <code>double</code> carries a
          decimal point, a <code>boolean</code> is <code>true</code> or{" "}
          <code>false</code>, and <code>void</code> means the method hands
          nothing back.
        </p>
      </LessonSection>

      <LessonSection id="code-as-a-value" title="Code as a value">
        <p>
          <code>return</code> hands a value back to whoever called the method,
          and stops there. Read the return type first on any method you meet: it
          tells you whether you get an answer or an object.
        </p>

        <CodeBlock
          language="java"
          title="Arm.java, branch 2-Commands: a method that returns a Command"
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
          that command later. The word <code>return</code> gives no hint of
          this. The return type does.
        </p>
        <p>
          Inside it, <code>() -&gt; setVoltage(SLOW_VOLTAGE)</code> is a lambda:
          a chunk of code handed over as a value. The <code>()</code> on the
          left is its input list, empty here. Everything after the arrow is the
          code.
        </p>

        <Box
          variant="alert-warning"
          tag="WATCH OUT"
          title="Writing a lambda runs nothing"
        >
          <p>
            Call <code>arm.runSlow()</code> and <code>setVoltage(3.0)</code>{" "}
            does not happen. The lambda sits parked inside the command until the
            scheduler runs it. Then it runs every loop, fifty times a second,
            for as long as the command stays scheduled.
          </p>
          <p className="mt-3">
            This failure has no error message. You call{" "}
            <code>arm.runSlow()</code>, the arm does not move, and nothing logs.
            Nobody ever scheduled the command.
          </p>
        </Box>

        <CodeBlock
          language="java"
          title="Arm.java, branch 2-Commands: the stop command"
          code={`/** Stop the arm motor and keep it stopped. Never finishes. */
public Command stop() {
  return runRepeatedly(motor::stopMotor).named("stop (hold)");
}`}
        />

        <p>
          <code>motor::stopMotor</code> means the same thing as{" "}
          <code>() -&gt; motor.stopMotor()</code>. Two colons, and no
          parentheses after the name. You are handing the method over, not
          calling it. Write <code>motor.stopMotor()</code> in that slot and Java
          calls it on the spot, gets nothing back, and has nothing left to hand
          over. It will not compile.
        </p>
        <p>
          Now the dot. Writing <code>a.b()</code> means &quot;on the thing{" "}
          <code>a</code>, call <code>b</code>&quot;, and what you may type after
          a dot depends on the type in front of it.{" "}
          <code>runRepeatedly(...)</code> hands back a half-finished command,
          and <code>.named(...)</code> lives there. A finished{" "}
          <code>Command</code> has no <code>.named(...)</code> at all, so{" "}
          <code>arm.runFast().named(&quot;lift&quot;)</code> will not compile.
        </p>
      </LessonSection>

      <LessonSection id="words-in-passing" title="Words in passing">
        <Split>
          <div className="measure [&>p]:m-0 [&>p]:prose-body">
            <p>These appear in code you read here, and each needs one line.</p>
          </div>
          <MarginNote label="Most blocks are excerpts">
            Code here is usually one method, with the imports and the
            surrounding class left off. Paste one into your editor and{" "}
            <code>cannot find symbol</code> means a missing import, not broken
            code.
          </MarginNote>
        </Split>

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
                  name, with nothing constructed first.
                </td>
              </tr>
              <tr style={{ borderBottom: "1px solid var(--rule-soft)" }}>
                <td className="px-3 py-2">
                  <code>static final</code>
                </td>
                <td className="px-3 py-2">
                  One shared copy that never changes. That is a named constant,
                  spelled in capitals by convention.
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
                  the mode vanishes, with no compile error.{" "}
                  <code>@Autonomous</code> and <code>@Utility</code> are the
                  other two.
                </td>
              </tr>
              <tr style={{ borderBottom: "1px solid var(--rule-soft)" }}>
                <td className="px-3 py-2">
                  <code>import</code>
                </td>
                <td className="px-3 py-2">
                  One line per class borrowed from somewhere else. Your editor
                  writes these for you.
                </td>
              </tr>
              <tr style={{ borderBottom: "1px solid var(--rule-soft)" }}>
                <td className="px-3 py-2">
                  <code>{"//"}</code> <code>{"/** */"}</code>
                </td>
                <td className="px-3 py-2">
                  A comment to the end of the line, and a documented block. The
                  compiler skips both.
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
                  leading <code>!</code> reverses everything after it, so read
                  for it deliberately.
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </LessonSection>

      <LessonSection id="check-your-work" title="Check your work">
        <p>
          Nothing here runs, so the check is a reading test. Scroll back to{" "}
          <code>runSlow</code> and name every part of it out loud.
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
              in <code>Arm.java</code>.
            </li>
            <li>
              When <code>setVoltage</code> runs, and how often after that.
            </li>
          </ul>
        </Box>

        <p>
          Miss one or two and keep going. Every construct here reappears in real
          code within the next three lessons.
        </p>

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
                "What you can type after a dot is decided by the type in front of it. named(String) lives on the half-finished command that runRepeatedly(...) hands back. A finished Command has no named(String) at all, so runFast(), which already called it, gives you something with nothing left to name.",
            },
          ]}
        />

        <DocumentationButton
          href="https://github.com/Hemlock5712/Workshop-Code/blob/1-Subsystem/src/main/java/frc/robot/subsystems/Arm.java"
          title="Arm.java on 1-Subsystem: the file these excerpts come from"
          icon={<GitBranch className="w-5 h-5" />}
        />
      </LessonSection>
    </PageTemplate>
  );
}
