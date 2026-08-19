import PageTemplate from "@/components/PageTemplate";
import LessonSection from "@/components/lesson/LessonSection";
import CodeBlock from "@/components/CodeBlock";
import Box from "@/components/Box";
import DocumentationButton from "@/components/DocumentationButton";
import Quiz from "@/components/Quiz";
import { MarginNote, Split } from "@/components/lesson/Prose";
import { GitBranch } from "lucide-react";

/**
 * The first file a student writes by hand. Five sections against the old nine.
 *
 * Deliberately gone: the Java vocabulary walk, which is `/java-basics`; the
 * private setter and the command thread, which is `/adding-commands`; and the
 * whole of `Robot.java`, which is `/robot-class`. What is left is the part that
 * lives only on this page: which fields hold hardware, what the constructor
 * decides, and the two lines that reach the motor.
 */
export default function BuildingSubsystems() {
  return (
    <PageTemplate
      title="Mechanisms"
      lede="A mechanism is one physical part of the robot, written as one Java class. On branch 1-Subsystem you write Arm.java and Flywheel.java: hardware fields, one constructor, two methods. No commands yet, and the check at the end is a clean build."
      needs={[
        <>
          A clean <code>./gradlew build</code>, from{" "}
          <strong>Project Setup</strong>.
        </>,
        <>
          Fields, constructors and methods, from <strong>Java Basics</strong>.
        </>,
        <>Arm and flywheel answering in Tuner X at IDs 31, 32, 21 and 22.</>,
      ]}
      branch="1-Subsystem"
      time="14 minutes"
    >
      <Split>
        <div className="measure flex flex-col gap-pad [&>p]:m-0 [&>p]:prose-body">
          <p>
            Work in the lesson repository, not the template clone from{" "}
            <strong>Project Setup</strong>. The template is the finished robot,
            and its arm sits one folder deeper at{" "}
            <code>subsystems/arm/Arm.java</code>.
          </p>
          <p>Clone the branch alongside it:</p>
        </div>
        <MarginNote label="Already wired">
          <code>Robot.java</code> holds{" "}
          <code>public final Arm arm = new Arm();</code> from the lesson before
          this one. Nothing else in the project mentions either class yet.
        </MarginNote>
      </Split>

      <CodeBlock
        language="bash"
        hideControls
        code={`git clone -b 1-Subsystem https://github.com/Hemlock5712/Workshop-Code.git`}
      />

      <p>
        Six Java files land in that clone and this page writes two of them. To
        type them yourself, delete <code>subsystems/Arm.java</code> and{" "}
        <code>subsystems/Flywheel.java</code> and start from the class line
        below. To read instead, leave them alone.
      </p>

      <LessonSection id="hardware-fields" title="The hardware fields">
        <p>
          Open <code>src/main/java/frc/robot/subsystems/Arm.java</code>. The
          class line and four fields go in first.
        </p>

        <CodeBlock
          language="java"
          title="Arm.java: the class line and the fields"
          filename="src/main/java/frc/robot/subsystems/Arm.java"
          code={`public class Arm extends Mechanism {
  private final CANBus canivore = new CANBus("canivore");
  private final TalonFX motor = new TalonFX(31, canivore);
  private final CANcoder encoder = new CANcoder(32, canivore);

  // Pushes a set voltage at the motor. No sensors involved.
  private final VoltageOut voltageOut = new VoltageOut(0);`}
        />

        <ul className="ml-5 list-disc space-y-2">
          <li>
            <code>extends Mechanism</code> is what makes this a mechanism rather
            than a plain object. Building one registers it with the scheduler,
            and it is where <code>runRepeatedly(...)</code> and the default{" "}
            <code>idle()</code> command come from.
          </li>
          <li>
            <code>new CANBus(&quot;canivore&quot;)</code> names the bus these
            devices sit on. That string has to match the name you gave the
            CANivore in Tuner X. Spell it differently and nothing answers.
          </li>
          <li>
            <code>31</code>, <code>32</code>, <code>21</code> and{" "}
            <code>22</code> are the CAN IDs from <strong>Motor Setup</strong>.
            If your bench came out with different numbers, change the code to
            match. Do not leave the two disagreeing.
          </li>
          <li>
            <code>VoltageOut</code> is a Phoenix 6 control request: an object
            that says &quot;apply this many volts&quot;. It is built once as a
            field, not allocated fresh every loop.
          </li>
        </ul>

        <p>
          Let your editor add the imports. Every type name stops being
          underlined. The class still has no closing brace, so it will not
          compile yet.
        </p>
      </LessonSection>

      <LessonSection id="configure-once" title="Configure the motor once">
        <p>
          The constructor runs one time, the moment <code>new Arm()</code> is
          evaluated. Five statements. Two are choices, and <code>Inverted</code>{" "}
          matches the direction you proved on <strong>Motor Setup</strong>.
        </p>

        <CodeBlock
          language="java"
          title="Arm.java: the constructor"
          code={`  public Arm() {
    TalonFXConfiguration config = new TalonFXConfiguration();
    config.MotorOutput.NeutralMode = NeutralModeValue.Coast; // easy to move by hand
    config.MotorOutput.Inverted = InvertedValue.CounterClockwise_Positive;

    // Use the CANcoder for position, so the motor knows the arm's real angle.
    config.Feedback.withRemoteCANcoder(encoder);

    TalonFXUtil.applyConfigWithRetries(motor, config);
  }`}
        />

        <Box variant="concept" tag="NEUTRAL MODE" title="Coast, not Brake">
          <p>
            Neutral mode is what the motor does when nothing is commanding it.{" "}
            <code>Coast</code> cuts the power and lets the shaft spin freely.{" "}
            <code>Brake</code> makes the motor resist being turned, so the
            mechanism stays roughly where you left it.
          </p>
          <p className="mt-3">
            The lesson arm picks <code>Coast</code>, and the branch says why on
            that line. You will be pushing this arm around a bench all day. A
            competition arm carrying weight usually wants <code>Brake</code>, or
            it drops the instant you disable.
          </p>
        </Box>

        <Box
          variant="concept"
          tag="FEEDBACK SOURCE"
          title="The CANcoder in the loop"
        >
          <p>
            A TalonFX counts its own rotor turns, and that count starts at zero
            every time the controller powers on. The CANcoder is absolute. It
            knows the arm&apos;s angle the moment it boots.
          </p>
          <p className="mt-3">
            That one line makes the CANcoder the motor&apos;s position source
            instead of the rotor. Nothing reads a position on this branch. Leave
            the line out and every angle you ask for later is measured from
            wherever the arm sat at power-on.
          </p>
        </Box>

        <Split>
          <div className="measure flex flex-col gap-pad [&>p]:m-0 [&>p]:prose-body">
            <p>
              <code>TalonFXUtil.applyConfigWithRetries(motor, config)</code>{" "}
              tries five times, then reports an error to the driver station. It
              is a small helper on the branch, called on the class name with no{" "}
              <code>new</code> involved.
            </p>
          </div>
          <MarginNote label="Why not apply()">
            Phoenix&apos;s own <code>apply(...)</code> sends the configuration
            once and hands back a status code. A CAN bus can hiccup while the
            robot powers up. A config that quietly failed to apply is miserable
            to debug.
          </MarginNote>
        </Split>
      </LessonSection>

      <LessonSection id="two-methods" title="Two methods">
        <CodeBlock
          language="java"
          title="Arm.java: the two methods"
          code={`  /**
   * Push the arm with a fixed voltage. Positive voltage moves the arm counter-clockwise.
   *
   * @param voltage The voltage to apply.
   */
  public void setVoltage(double voltage) {
    motor.setControl(voltageOut.withOutput(voltage));
  }

  /** Stop the arm motor. */
  public void stop() {
    motor.stopMotor();
  }
}`}
        />

        <p>
          <code>voltageOut.withOutput(voltage)</code> sets the number on the
          request object you built as a field, and{" "}
          <code>motor.setControl(...)</code> sends it. The motor holds that
          request until something replaces it.
        </p>
        <p>
          Nothing here reads a sensor and nothing corrects itself. Ask for 6 V
          and you get 6 V, whatever the arm does with it.
        </p>
        <p>
          Both are public for now, so any file can call{" "}
          <code>arm.setVoltage(6.0)</code>. <strong>Writing Commands</strong>{" "}
          takes that away and hands out commands instead.
        </p>
      </LessonSection>

      <LessonSection id="flywheel-follower" title="The flywheel's follower">
        <p>
          Same three parts, one new idea. The flywheel runs two TalonFX motors:
          a leader on CAN <code>21</code> and a follower on CAN <code>22</code>.
          The code only ever talks to the leader.
        </p>

        <CodeBlock
          language="java"
          title="Flywheel.java: fields and constructor"
          filename="src/main/java/frc/robot/subsystems/Flywheel.java"
          code={`public class Flywheel extends Mechanism {
  private final CANBus canivore = new CANBus("canivore");
  private final TalonFX leader = new TalonFX(21, canivore);
  private final TalonFX follower = new TalonFX(22, canivore);

  // Pushes a set voltage at the leader motor. No sensors involved.
  private final VoltageOut voltageOut = new VoltageOut(0);

  public Flywheel() {
    // The follower copies the leader, spinning the opposite direction.
    follower.setControl(new Follower(leader.getDeviceID(), MotorAlignmentValue.Opposed));

    TalonFXConfiguration config = new TalonFXConfiguration();
    config.MotorOutput.NeutralMode = NeutralModeValue.Coast; // easy to spin by hand
    config.MotorOutput.Inverted = InvertedValue.CounterClockwise_Positive;

    TalonFXUtil.applyConfigWithRetries(leader, config);
  }`}
        />

        <Box
          variant="alert-warning"
          tag="SECOND ARGUMENT"
          title="Opposed, not true"
        >
          <p>
            The <code>Follower</code> request goes to CAN 22 once, in the
            constructor, and never again. After that the follower mirrors
            whatever output the leader is given, running the other way because
            of how the two motors are mounted.
          </p>
          <p className="mt-3">
            The second argument is a <code>MotorAlignmentValue</code>, not a
            true/false flag. A snippet that passes a boolean there belongs to a
            different API. Flip <code>Opposed</code> to match a guide that says
            both motors spin the same way, and you will fight a correctly wired
            flywheel all afternoon. <strong>Motor Setup</strong> has the bench
            check that settles which way is right.
          </p>
        </Box>

        <p>
          The two methods are the arm&apos;s two methods pointed at{" "}
          <code>leader</code>. Write them, then build. The follower needs no
          methods of its own.
        </p>
      </LessonSection>

      <LessonSection id="check-your-work" title="Check your work">
        <p>
          Nothing on this branch moves a motor, so the check is a build and
          three things you can see.
        </p>

        <ol className="ml-5 list-decimal space-y-3">
          <li>
            Run <code>./gradlew build</code>. <code>BUILD SUCCESSFUL</code> is
            the real check here: every import resolved, and every name you typed
            exists.
          </li>
          <li>
            List <code>src/main/java/frc/robot/subsystems/</code>. Two files,{" "}
            <code>Arm.java</code> and <code>Flywheel.java</code>, and no{" "}
            <code>opmodes</code> folder yet. That folder arrives with the
            commands.
          </li>
          <li>
            Search <code>Arm.java</code> for <code>Command</code>. One hit,
            inside the doc comment. Not one line of code on this branch builds
            one.
          </li>
          <li>
            In Tuner X, confirm all four devices answer on the{" "}
            <code>canivore</code> bus at 31, 32, 21 and 22. They have to be the
            numbers in your two constructors.
          </li>
        </ol>

        <Box variant="alert-success" title="You should see">
          <ul className="ml-5 list-disc space-y-2">
            <li>
              Four private final fields on <code>Arm</code>, and a constructor
              ending in <code>applyConfigWithRetries</code>.
            </li>
            <li>
              <code>setVoltage</code> and <code>stop</code> on each mechanism,
              and no other public method.
            </li>
          </ul>
        </Box>

        <p>Three errors cover nearly everything that goes wrong here.</p>

        <div className="measure-wide overflow-x-auto">
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
                  <code>cannot find symbol: Mechanism</code>
                </td>
                <td className="px-3 py-2">A missing import.</td>
                <td className="px-3 py-2">
                  <code>Mechanism</code> is in <code>org.wpilib.command3</code>,
                  the CTRE types in <code>com.ctre.phoenix6</code>.
                </td>
              </tr>
              <tr style={{ borderBottom: "1px solid var(--rule-soft)" }}>
                <td className="px-3 py-2">
                  <code>cannot find symbol: TalonFXUtil</code>
                </td>
                <td className="px-3 py-2">
                  The helper file is not in your project.
                </td>
                <td className="px-3 py-2">
                  It ships on the branch under <code>frc/robot/utils</code>.
                  Clone it again.
                </td>
              </tr>
              <tr>
                <td className="px-3 py-2">
                  Your <code>Arm.java</code> has <code>vertical()</code> and{" "}
                  <code>scoring()</code>.
                </td>
                <td className="px-3 py-2">
                  You are in the robot template, not the lesson branch.
                </td>
                <td className="px-3 py-2">
                  The template keeps its arm one folder deeper. Work from{" "}
                  <code>1-Subsystem</code>.
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        <DocumentationButton
          href="https://github.com/Hemlock5712/Workshop-Code/blob/1-Subsystem/src/main/java/frc/robot/subsystems/Arm.java"
          title="Arm.java on branch 1-Subsystem"
          icon={<GitBranch className="w-5 h-5" />}
        />
      </LessonSection>

      <Quiz
        questions={[
          {
            id: 1,
            question:
              "Which statement about the v3 Mechanism base class is correct?",
            options: [
              "Mechanism is an empty marker: extending it changes nothing about the class",
              "Mechanism is an interface you implement, so Arm writes implements Mechanism",
              "Mechanism is a class you extend, so Arm writes extends Mechanism",
              "Mechanism is final, so you wrap one in a helper class instead of subclassing",
            ],
            correctAnswer: 2,
            explanation:
              "In the alpha this workshop pins, v2027.0.0-alpha-6, Mechanism.java declares `public class Mechanism`, and both the lesson branches and the robot template write `extends Mechanism`. It is not an empty marker either: constructing one registers it with the default scheduler, which is how the scheduler knows your arm exists. This is alpha software, so if you are on a newer build, check the class line before you trust a tutorial.",
          },
          {
            id: 2,
            question:
              "The constructor sets config.MotorOutput.NeutralMode = NeutralModeValue.Coast. What does that mean, and why this arm?",
            options: [
              "Coast caps the arm's maximum speed while you are learning",
              "Coast cuts power when nothing is commanding the motor, so you can move the arm by hand on the bench",
              "Coast makes the motor resist being turned, so the arm holds its position when disabled",
              "Coast is required whenever a CANcoder is attached to a TalonFX",
            ],
            correctAnswer: 1,
            explanation:
              "Neutral mode is what the motor does when nothing is commanding it. Coast lets the shaft spin freely; Brake makes it resist motion and hold roughly still. The branch chooses Coast and explains itself on that line: `// easy to move by hand`. A competition arm carrying weight usually wants Brake, or it drops the moment you disable.",
          },
          {
            id: 3,
            question:
              "Why does Arm configure config.Feedback.withRemoteCANcoder(encoder) when nothing on this branch reads a position?",
            options: [
              "It resets the CANcoder to zero every time the robot boots",
              "It tells the CANcoder to follow the motor's rotor count",
              "A TalonFX will not accept a VoltageOut request until a feedback source is set",
              "It makes the CANcoder the motor's position source, so angles asked for later are measured from the arm's real angle instead of from wherever it powered on",
            ],
            correctAnswer: 3,
            explanation:
              "A TalonFX counts rotor turns from zero at every power-on, so it has no idea where the arm physically is. The CANcoder is absolute and knows its angle the moment it boots. withRemoteCANcoder points the motor's position feedback at that sensor, which is what lets closed-loop position work later.",
          },
          {
            id: 4,
            question:
              "Flywheel's constructor runs follower.setControl(new Follower(leader.getDeviceID(), MotorAlignmentValue.Opposed)). What has it set up?",
            options: [
              "It copies CAN 21's configuration onto CAN 22",
              "CAN 22 mirrors CAN 21 and turns the same way, so both push together",
              "CAN 22 mirrors CAN 21 and turns the opposite way, so one setVoltage call drives both",
              "CAN 21 and CAN 22 alternate, one taking over each scheduler loop",
            ],
            correctAnswer: 2,
            explanation:
              "Follower tells one TalonFX to copy another's output. The second argument is a MotorAlignmentValue, not a true/false flag, and Opposed means the follower runs backwards relative to the leader, which is correct for how these two motors are mounted. It is told once in the constructor; after that the class only ever talks to the leader.",
          },
        ]}
      />
    </PageTemplate>
  );
}
