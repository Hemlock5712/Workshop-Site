import PageTemplate from "@/components/PageTemplate";
import LessonSection from "@/components/lesson/LessonSection";
import CodeBlock from "@/components/CodeBlock";
import Box from "@/components/Box";
import DocumentationButton from "@/components/DocumentationButton";
import Quiz from "@/components/Quiz";
import { Split } from "@/components/lesson/Prose";
import MechanismSelector from "@/components/lesson/MechanismSelector";
import { M, Mech } from "@/components/lesson/Mechanism";
import { GitBranch } from "lucide-react";

/**
 * The first file a student writes by hand, and the first lesson written once
 * and read twice.
 *
 * A student picks Arm or Flywheel at the top and reads a whole lesson about
 * that mechanism: its fields, its constructor, its two methods, its check. The
 * flywheel used to be a fourth section that opened "same three parts, one new
 * idea" and then showed a diff, which is a fine thing to read second and a
 * poor thing to read first. A student assigned the flywheel read three
 * sections about an arm before reaching their own mechanism.
 *
 * The prose is not duplicated to do it. Sentences true of both are written
 * once with `<M>` slots in them; only the CANcoder, which is a genuinely
 * different idea rather than a different word, sits inside `<Mech>`. Read the
 * note at the top of `src/data/mechanisms.ts` before adding another.
 *
 * The flywheel was two motors until August 2026, and the follower carried a
 * code block, a warning box, two paragraphs and a quiz question. The bench
 * mechanism now has one motor, so the two classes differ by the CANcoder and
 * nothing else.
 *
 * Deliberately gone, unchanged from before: the Java vocabulary walk, which is
 * `/java-basics`; the private setter and the command thread, which is
 * `/adding-commands`; and the whole of `Robot.java`, which is `/robot-class`.
 */
export default function BuildingSubsystems() {
  return (
    <PageTemplate
      title="Mechanisms"
      lede="A mechanism is one physical part of the robot, written as one Java class. On branch mech-1-Mechanisms you write Arm.java and Flywheel.java: hardware fields, one constructor, two methods."
      needs={[
        <>
          A clean <code>./gradlew build</code>, from{" "}
          <strong>Project Setup</strong>.
        </>,
        <>
          Fields, constructors and methods, from <strong>Java Basics</strong>.
        </>,
        <>Arm and flywheel answering in Tuner X at IDs 31, 32 and 21.</>,
      ]}
      branch="mech-1-Mechanisms"
      time="10 minutes"
    >
      <MechanismSelector />

      <Split>
        <div className="measure flex flex-col gap-pad [&>p]:m-0 [&>p]:prose-body">
          <p>
            Work in the project you generated in <strong>Project Setup</strong>.
            There is nothing to clone, and the file is new.
          </p>
          <p>
            Make a <code>mechanisms</code> folder beside <code>Robot.java</code>
            , at <code>src/main/java/first/robot/mechanisms/</code>. Both
            classes go in it.
          </p>
        </div>
      </Split>

      <LessonSection id="hardware-fields" title="The hardware fields">
        <p>
          Create{" "}
          <code>
            mechanisms/
            <M k="file" />
          </code>
          . The class line and the fields go in first.
        </p>

        <Mech for="arm">
          <CodeBlock
            language="java"
            title="Arm.java: the class line and the fields"
            filename="src/main/java/first/robot/mechanisms/Arm.java"
            code={`public class Arm extends Mechanism {
  private final CANBus canivore = new CANBus("canivore");
  private final TalonFX motor = new TalonFX(31, canivore);
  private final CANcoder encoder = new CANcoder(32, canivore);

  // Pushes a set voltage at the motor. No sensors involved.
  private final VoltageOut voltageOut = new VoltageOut(0);`}
          />
        </Mech>

        <Mech for="flywheel">
          <CodeBlock
            language="java"
            title="Flywheel.java: the class line and the fields"
            filename="src/main/java/first/robot/mechanisms/Flywheel.java"
            code={`public class Flywheel extends Mechanism {
  private final CANBus canivore = new CANBus("canivore");
  private final TalonFX motor = new TalonFX(21, canivore);

  // Pushes a set voltage at the motor. No sensors involved.
  private final VoltageOut voltageOut = new VoltageOut(0);`}
          />
        </Mech>

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
            The CAN IDs come from <strong>Motor Setup</strong>: <M k="ids" />.
            If your bench came out with different numbers, change the code to
            match. Do not leave the two disagreeing.
          </li>
          <Mech for="flywheel" as="li">
            One wheel, one motor, and no CANcoder. A flywheel is tuned for
            speed, and the encoder inside the TalonFX already measures speed.
            The arm needs a second device because an angle has to be right the
            moment the robot boots.
          </Mech>
          <li>
            <code>VoltageOut</code> is a Phoenix 6 control request: an object
            that says &quot;apply this many volts&quot;. Build it once as a
            field, not fresh every loop.
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
          The constructor runs one time, the moment{" "}
          <code>
            new <M k="name" />
            ()
          </code>{" "}
          is evaluated. Two of the settings are choices, and{" "}
          <code>Inverted</code> matches the direction you proved on{" "}
          <strong>Motor Setup</strong>.
        </p>

        <Mech for="arm">
          <CodeBlock
            language="java"
            title="Arm.java: the constructor"
            code={`  public Arm() {
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
        </Mech>

        <Mech for="flywheel">
          <CodeBlock
            language="java"
            title="Flywheel.java: the constructor"
            code={`  public Flywheel() {
    TalonFXConfiguration config =
        new TalonFXConfiguration()
            .withMotorOutput(
                new MotorOutputConfigs()
                    .withNeutralMode(NeutralModeValue.Coast) // easy to spin by hand
                    .withInverted(InvertedValue.CounterClockwise_Positive));

    motor.getConfigurator().apply(config);
  }`}
          />
        </Mech>

        <Box variant="concept" tag="NEUTRAL MODE" title="Coast, not Brake">
          <p>
            Neutral mode is what the motor does when nothing is commanding it.{" "}
            <code>Coast</code> cuts the power and lets the shaft spin freely.{" "}
            <code>Brake</code> makes the motor resist being turned, so the
            mechanism stays roughly where you left it.
          </p>
          <p className="mt-3">
            The lesson <M k="noun" /> picks <code>Coast</code>, and the branch
            says why on that line. You will <M k="byHand" /> all day.
            <Mech for="arm">
              {" "}
              A competition arm carrying weight usually wants <code>Brake</code>
              , or it drops the instant you disable.
            </Mech>
            <Mech for="flywheel">
              {" "}
              A competition flywheel usually keeps <code>Coast</code>. A wheel
              with that much stored energy braked to a stop punishes the gearbox
              every cycle.
            </Mech>
          </p>
        </Box>

        <Mech for="arm">
          <Box
            variant="concept"
            tag="FEEDBACK SOURCE"
            title="The CANcoder in the loop"
          >
            <p>
              A TalonFX counts its own rotor turns, and that count starts at
              zero every time the controller powers on. The CANcoder is
              absolute. It knows the arm&apos;s angle the moment it boots.
            </p>
            <p className="mt-3">
              That one line makes the CANcoder the motor&apos;s position source
              instead of the rotor. Nothing reads a position on this branch.
              Leave the line out and the motor measures every angle you ask for
              later from wherever the arm sat at power-on.
            </p>
          </Box>
        </Mech>

        <Mech for="flywheel">
          <Box
            variant="concept"
            tag="NO FEEDBACK SOURCE"
            title="Nothing to point the motor at"
          >
            <p>
              The arm chains one more line onto its config, naming the CANcoder
              as the motor&apos;s position source. The flywheel has no such
              line, because it has no such device.
            </p>
            <p className="mt-3">
              A TalonFX counts its own rotor turns, and a rotor count is a fine
              way to measure speed. It is a poor way to measure an angle,
              because it starts at zero every power-on. Speed is the only thing
              this mechanism is ever asked for.
            </p>
          </Box>
        </Mech>

        <p>
          <code>
            <M k="motor" />
            .getConfigurator().apply(config)
          </code>{" "}
          sends every setting above to the motor controller in one message. It
          runs once, in the constructor, because the controller keeps those
          settings until something changes them.
        </p>
      </LessonSection>

      <LessonSection id="two-methods" title="Two methods">
        <Mech for="arm">
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
        </Mech>

        <Mech for="flywheel">
          <CodeBlock
            language="java"
            title="Flywheel.java: the two methods"
            code={`  /**
   * Spin the flywheel with a fixed voltage. Positive voltage spins the wheel counter-clockwise.
   *
   * @param voltage The voltage to apply.
   */
  public void setVoltage(double voltage) {
    motor.setControl(voltageOut.withOutput(voltage));
  }

  /** Stop the flywheel motor. */
  public void stop() {
    motor.stopMotor();
  }
}`}
          />
        </Mech>

        <p>
          <code>voltageOut.withOutput(voltage)</code> sets the number on the
          request object you built as a field, and{" "}
          <code>
            <M k="motor" />
            .setControl(...)
          </code>{" "}
          sends it. The motor holds that request until something replaces it.
        </p>
        <p>
          Nothing here reads a sensor. Ask for 6 V and you get 6 V, whatever the{" "}
          <M k="noun" /> does with it.
        </p>

        <p>
          Both are public for now, so any file can call{" "}
          <code>
            <M k="noun" />
            .setVoltage(6.0)
          </code>
          .
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
            List <code>src/main/java/first/robot/mechanisms/</code>.{" "}
            <code>
              <M k="file" />
            </code>{" "}
            is in it, and there is no <code>opmode</code> folder yet. That
            folder arrives with the commands.
          </li>
          <li>
            Search{" "}
            <code>
              <M k="file" />
            </code>{" "}
            for <code>Command</code>. Not one line of code on this branch builds
            one.
          </li>
          <li>
            In Tuner X, confirm every device answers on the{" "}
            <code>canivore</code> bus at <M k="ids" />. Those have to be the
            numbers in your constructor.
          </li>
        </ol>

        <Box variant="alert-success" title="You should see">
          <ul className="ml-5 list-disc space-y-2">
            <li>
              Private final fields on{" "}
              <code>
                <M k="name" />
              </code>
              , and a constructor ending in{" "}
              <code>getConfigurator().apply(config)</code>.
            </li>
            <li>
              <code>setVoltage</code> and <code>stop</code>, and no other public
              method.
            </li>
          </ul>
        </Box>

        <p>
          Two errors cover nearly everything that goes wrong here.{" "}
          <code>cannot find symbol: Mechanism</code> is a missing import.{" "}
          <code>Mechanism</code> is in <code>org.wpilib.command3</code>, the
          CTRE types in <code>com.ctre.phoenix6</code>.
          <Mech for="arm">
            {" "}
            And an <code>Arm.java</code> that already has{" "}
            <code>vertical()</code> and <code>scoring()</code> is the robot
            template, not the lesson branch.
          </Mech>
          <Mech for="flywheel">
            {" "}
            And <code>cannot find symbol: encoder</code> means the{" "}
            <code>withFeedback</code> line came across from the arm. The
            flywheel has no CANcoder to name there.
          </Mech>
        </p>

        <Mech for="arm">
          <DocumentationButton
            href="https://github.com/Hemlock5712/Workshop-Code/blob/mech-1-Mechanisms/src/main/java/first/robot/mechanisms/Arm.java"
            title="Arm.java on branch mech-1-Mechanisms"
            icon={<GitBranch className="w-5 h-5" />}
          />
        </Mech>

        <Mech for="flywheel">
          <DocumentationButton
            href="https://github.com/Hemlock5712/Workshop-Code/blob/mech-1-Mechanisms/src/main/java/first/robot/mechanisms/Flywheel.java"
            title="Flywheel.java on branch mech-1-Mechanisms"
            icon={<GitBranch className="w-5 h-5" />}
          />
        </Mech>

        <p>
          The branch carries both mechanisms, and the next lesson binds commands
          on both. When this one builds, switch the question at the top of the
          page and write the other file.
        </p>
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
              "Mechanism.java declares `public class Mechanism`, and both the lesson branches and the robot template write `extends Mechanism`. It is not an empty marker either: constructing one registers it with the default scheduler, which is how the scheduler knows your arm exists.",
          },
          {
            id: 2,
            question:
              "The constructor sets withNeutralMode(NeutralModeValue.Coast). What does that mean, and why this mechanism?",
            options: [
              "Coast caps the motor's maximum speed while you are learning",
              "Coast cuts power when nothing is commanding the motor, so you can move the mechanism by hand on the bench",
              "Coast makes the motor resist being turned, so the mechanism holds its position when disabled",
              "Coast is required whenever a CANcoder is attached to a TalonFX",
            ],
            correctAnswer: 1,
            explanation:
              "Neutral mode is what the motor does when nothing is commanding it. Coast lets the shaft spin freely; Brake makes it resist motion and hold roughly still. The branch chooses Coast and explains itself on that line: `// easy to move by hand`. A competition arm carrying weight usually wants Brake, or it drops the moment you disable.",
          },
          {
            id: 3,
            question:
              "Why does Arm chain withRemoteCANcoder(encoder) onto its config when nothing on this branch reads a position?",
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
              "Arm's config ends with .withFeedback(new FeedbackConfigs().withRemoteCANcoder(encoder)) and Flywheel's does not. Why not?",
            options: [
              "withFeedback is set once per project, and Arm.java gets there first",
              "The flywheel is tuned for speed, not angle, and the TalonFX's own rotor count already measures speed. There is no CANcoder on the mechanism to point at.",
              "A TalonFX refuses a remote sensor on any mechanism that spins continuously",
              "The flywheel's CANcoder is configured in Tuner X, so the code does not repeat it",
            ],
            correctAnswer: 1,
            explanation:
              "A rotor count is a fine speed measurement and a poor angle measurement, because it starts at zero every power-on. The arm needs to know its real angle the moment it boots, so it carries an absolute CANcoder and points the motor's feedback at it. The flywheel is only ever asked how fast it is going, so the encoder inside the motor is enough and the mechanism has no second device.",
          },
        ]}
      />
    </PageTemplate>
  );
}
