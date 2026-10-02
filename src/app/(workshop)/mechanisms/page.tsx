import PageTemplate from "@/components/PageTemplate";
import LessonSection from "@/components/lesson/LessonSection";
import CodeBlock from "@/components/CodeBlock";
import Box from "@/components/Box";
import ImageBlock from "@/components/ImageBlock";
import DocumentationButton from "@/components/DocumentationButton";
import Quiz from "@/components/Quiz";
import { Split } from "@/components/lesson/Prose";
import MechanismSelector from "@/components/lesson/MechanismSelector";
import PairedLesson from "@/components/lesson/PairedLesson";
import GlossaryTerm from "@/components/GlossaryTerm";
import { M, Mech } from "@/components/lesson/Mechanism";
import { GitBranch } from "lucide-react";
import { lessonMetadata } from "@/lib/lessonMetadata";

export const metadata = lessonMetadata("/mechanisms");

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
 * `/adding-commands`. `Robot.java` used to be its own lesson; the scheduler
 * and the constructor were already taught on `/command-framework`, so only
 * the two mechanism fields survived and they live in the last section here.
 */
export default function Mechanisms() {
  return (
    <PageTemplate
      title="Mechanisms"
      lede="A mechanism is one physical part of the robot, written as one Java class. On branch mech-1-Mechanisms you write Arm.java and Flywheel.java: hardware fields, one constructor, two methods."
      needs={[
        <>
          A clean build, from <strong>Project Setup</strong>.
        </>,
        <>
          Fields, constructors and methods, from <strong>Java Basics</strong>.
        </>,
        <>Arm and flywheel working in Tuner X at IDs 31, 32 and 21.</>,
      ]}
      branch="mech-1-Mechanisms"
      time="14 minutes"
    >
      <MechanismSelector />

      <PairedLesson kind="tuner" to="/mechanism-setup" />

      <Split>
        <div className="measure flex flex-col gap-pad [&>p]:m-0 [&>p]:prose-body">
          <p>
            Work in the project you generated in <strong>Project Setup</strong>.
            There is nothing to clone, and the file is new.
          </p>
          <p>
            Both classes live in a <code>mechanisms</code> folder beside{" "}
            <code>Robot.java</code>, at{" "}
            <code>src/main/java/first/robot/mechanisms/</code>. Make the folder,
            then make the file in it.
          </p>
        </div>
      </Split>

      <div className="measure-wide grid grid-cols-1 gap-6 sm:grid-cols-2">
        <ImageBlock
          src="/images/mechanisms/new-folder.png"
          alt="The VS Code Explorer right-click menu on the robot folder, with New Folder circled in red"
          title="Step 1 · New Folder"
          caption="Right-click robot, not src or java. The folder has to land beside Robot.java, and one made a level up puts your class in the wrong package."
          width={538}
          height={574}
        />

        <ImageBlock
          src="/images/mechanisms/new-file.png"
          alt="The VS Code Explorer right-click menu on the new mechanisms folder, with New File circled in red"
          title="Step 2 · New File"
          caption="New File, not New Java File. The Java option writes its own package and class lines, and you are about to paste both."
          width={538}
          height={574}
        />
      </div>

      <LessonSection id="hardware-fields" title="The hardware fields">
        <p>
          Name the file{" "}
          <code>
            <M k="file" />
          </code>{" "}
          and paste this into it. The package line and the imports are the part
          you cannot work out from a lesson, so they are here in full. The class
          is empty and it compiles. The three comments mark the three places the
          rest of this lesson goes.
        </p>

        <Mech for="arm">
          <CodeBlock
            language="java"
            title="Arm.java: the empty class"
            filename="src/main/java/first/robot/mechanisms/Arm.java"
            code={`package first.robot.mechanisms;

// The static imports are the ones your editor will not offer to add for you.
// Tuner X writes Volts.per(RotationsPerSecond) into the config you paste below,
// so they are here already and that paste just works.
import static org.wpilib.units.Units.RotationsPerSecond;
import static org.wpilib.units.Units.RotationsPerSecondPerSecond;
import static org.wpilib.units.Units.Volts;

import com.ctre.phoenix6.CANBus;
import com.ctre.phoenix6.configs.FeedbackConfigs;
import com.ctre.phoenix6.configs.MotionMagicConfigs;
import com.ctre.phoenix6.configs.MotorOutputConfigs;
import com.ctre.phoenix6.configs.Slot0Configs;
import com.ctre.phoenix6.configs.TalonFXConfiguration;
import com.ctre.phoenix6.controls.MotionMagicVoltage;
import com.ctre.phoenix6.controls.VoltageOut;
import com.ctre.phoenix6.hardware.CANcoder;
import com.ctre.phoenix6.hardware.TalonFX;
import com.ctre.phoenix6.signals.FeedbackSensorSourceValue;
import com.ctre.phoenix6.signals.GravityTypeValue;
import com.ctre.phoenix6.signals.InvertedValue;
import com.ctre.phoenix6.signals.NeutralModeValue;
import org.wpilib.command3.Mechanism;

public class Arm implements Mechanism {
  // The fields go here.

  public Arm() {
    // The motor configuration goes here.
  }

  // The two methods go here.
}`}
          />
        </Mech>

        <Mech for="flywheel">
          <CodeBlock
            language="java"
            title="Flywheel.java: the empty class"
            filename="src/main/java/first/robot/mechanisms/Flywheel.java"
            code={`package first.robot.mechanisms;

// The static imports are the ones your editor will not offer to add for you.
// Tuner X writes Volts.per(RotationsPerSecond) into the config you paste below,
// so they are here already and that paste just works.
import static org.wpilib.units.Units.RotationsPerSecond;
import static org.wpilib.units.Units.RotationsPerSecondPerSecond;
import static org.wpilib.units.Units.Volts;

import com.ctre.phoenix6.CANBus;
import com.ctre.phoenix6.configs.MotionMagicConfigs;
import com.ctre.phoenix6.configs.MotorOutputConfigs;
import com.ctre.phoenix6.configs.Slot0Configs;
import com.ctre.phoenix6.configs.TalonFXConfiguration;
import com.ctre.phoenix6.controls.MotionMagicVelocityVoltage;
import com.ctre.phoenix6.controls.VoltageOut;
import com.ctre.phoenix6.hardware.TalonFX;
import com.ctre.phoenix6.signals.InvertedValue;
import com.ctre.phoenix6.signals.NeutralModeValue;
import org.wpilib.command3.Mechanism;

public class Flywheel implements Mechanism {
  // The fields go here.

  public Flywheel() {
    // The motor configuration goes here.
  }

  // The two methods go here.
}`}
          />
        </Mech>

        <p>
          Your editor greys out an import until something uses it. That is
          expected. Most go quiet as you fill the class in, and a few wait for{" "}
          <strong>Motion Magic in Code</strong>. The class compiles at every
          step from here. The fields come first.
        </p>

        <Mech for="arm">
          <CodeBlock
            language="java"
            title="Arm.java: the class line and the fields"
            filename="src/main/java/first/robot/mechanisms/Arm.java"
            code={`public class Arm implements Mechanism {
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
            code={`public class Flywheel implements Mechanism {
  private final CANBus canivore = new CANBus("canivore");
  private final TalonFX motor = new TalonFX(21, canivore);

  // Pushes a set voltage at the motor. No sensors involved.
  private final VoltageOut voltageOut = new VoltageOut(0);`}
          />
        </Mech>

        <ul className="ml-5 list-disc space-y-2">
          <li>
            <code>implements Mechanism</code> makes this a mechanism. Every
            method on that interface already has a body, so there is nothing to
            override, and <code>runRepeatedly(...)</code> is yours from here on.
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
            <code>VoltageOut</code> is a control request, built once as a field
            and reused. <strong>Configs and requests</strong> below says what
            that means.
          </li>
        </ul>
      </LessonSection>

      <LessonSection id="configure-once" title="Configure the motor once">
        <p>
          The constructor runs one time, the moment{" "}
          <code>
            new <M k="name" />
            ()
          </code>{" "}
          is evaluated. <code>NeutralMode</code> is the one setting here you
          choose. <code>Inverted</code> is not a choice: it is the direction you
          proved on <strong>Motor Setup</strong>, and the mechanism decided it
          long before any code ran. Ignore the two <code>Expo</code> values.
          They are defaults built into every config Tuner X generates, and no
          workshop uses them.
        </p>

        <ImageBlock
          src="/images/setup/generate-code.png"
          alt="Phoenix Tuner X with the config panel's three-dot menu open and Generate Code circled in red, above the Motion Magic fields"
          title="Where the config comes from"
          caption="Behind the menu, cruise velocity, acceleration and jerk sit at 0 while Expo_kV and Expo_kA already hold values. That is why those two lines arrive in every generated config, tuned or not."
          width={2559}
          height={1525}
        />

        <Box variant="alert-warning" title="These are our numbers, not yours">
          <p>
            The block below is the shape, not a config to copy. Open the config
            panel in Tuner X, press the three dots, choose{" "}
            <strong>Generate Code</strong>, and paste the result over the whole
            statement. If the device holds your gains from Workshop 1, they come
            along. Leave them in. Nothing reads them until{" "}
            <strong>Motion Magic in Code</strong>.
          </p>
        </Box>

        <Mech for="arm">
          <CodeBlock
            language="java"
            title="Arm.java: the constructor"
            code={`  public Arm() {
    final TalonFXConfiguration talonFXCfg =
        new TalonFXConfiguration()
            .withMotorOutput(
                new MotorOutputConfigs()
                    .withNeutralMode(NeutralModeValue.Coast) // easy to move by hand
                    .withInverted(InvertedValue.CounterClockwise_Positive))
            .withMotionMagic(
                new MotionMagicConfigs()
                    .withMotionMagicExpo_kV(
                        Volts.per(RotationsPerSecond).ofNative(0.119999997317791))
                    .withMotionMagicExpo_kA(
                        Volts.per(RotationsPerSecondPerSecond).ofNative(0.10000000149011612)))
            .withFeedback(
                new FeedbackConfigs()
                    .withFeedbackRemoteSensorID(32)
                    .withFeedbackSensorSource(FeedbackSensorSourceValue.RemoteCANcoder));

    motor.getConfigurator().apply(talonFXCfg);
  }`}
          />
        </Mech>

        <Mech for="flywheel">
          <CodeBlock
            language="java"
            title="Flywheel.java: the constructor"
            code={`  public Flywheel() {
    final TalonFXConfiguration talonFXCfg =
        new TalonFXConfiguration()
            .withMotorOutput(
                new MotorOutputConfigs()
                    .withNeutralMode(NeutralModeValue.Coast) // easy to spin by hand
                    // positive shoots: clockwise from the motor side
                    .withInverted(InvertedValue.Clockwise_Positive))
            .withMotionMagic(
                new MotionMagicConfigs()
                    .withMotionMagicExpo_kV(
                        Volts.per(RotationsPerSecond).ofNative(0.119999997317791))
                    .withMotionMagicExpo_kA(
                        Volts.per(RotationsPerSecondPerSecond).ofNative(0.10000000149011612)));

    motor.getConfigurator().apply(talonFXCfg);
  }`}
          />
        </Mech>

        <Box variant="concept" tag="NEUTRAL MODE" title="Coast, not Brake">
          <p>
            Neutral mode is what the motor does when nothing is commanding it.{" "}
            <code>Coast</code> lets the shaft spin freely, and{" "}
            <code>Brake</code> resists being turned. The lesson <M k="noun" />{" "}
            picks <code>Coast</code> because you will <M k="byHand" /> all day.
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
              A TalonFX counts its own rotor turns from zero at every power-on.
              The CANcoder is absolute, and <code>withFeedback</code> makes it
              the motor&apos;s position source. Nothing reads a position on this
              branch. Leave the block out and every angle you ask for later is
              measured from wherever the arm sat at power-on.
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
              The arm&apos;s config has a <code>withFeedback</code> block naming
              its CANcoder. The flywheel has no CANcoder, so it has no such
              block. A rotor count starts at zero every power-on, which ruins an
              angle and does not matter to a speed.
            </p>
          </Box>
        </Mech>

        <p>
          <code>
            <M k="motor" />
            .getConfigurator().apply(talonFXCfg)
          </code>{" "}
          sends every setting above to the motor controller in one message.
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
  private void setVoltage(double voltage) {
    motor.setControl(voltageOut.withOutput(voltage));
  }

  /** Stop the motor. */
  private void stopMotor() {
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
   * Spin the flywheel with a fixed voltage.
   *
   * @param voltage The voltage to apply.
   */
  private void setVoltage(double voltage) {
    motor.setControl(voltageOut.withOutput(voltage));
  }

  /** Stop the motor. */
  private void stopMotor() {
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
          sends it.
        </p>
        <p>
          Nothing here reads a sensor. Ask for 6 V and you get 6 V, whatever the{" "}
          <M k="noun" /> does with it.
        </p>

        <p>
          Both are <code>private</code>, and nothing calls them yet. The next
          lesson wraps them in commands, and one of those commands takes the
          name <code>stop</code>, so the helper is <code>stopMotor</code>.
        </p>
      </LessonSection>

      <LessonSection id="configs-and-requests" title="Configs and requests">
        <p>
          This file sends the motor two kinds of message. A{" "}
          <strong>config</strong> is settings: inversion, neutral mode, gains,
          the feedback sensor. The TalonFX saves it, so the constructor applies
          it once. A{" "}
          <GlossaryTerm term="control request">control request</GlossaryTerm> is
          what to do right now, and it carries the target. The target changes
          while the robot runs, so code sends a request every loop.
        </p>
        <p>
          You have used both in Tuner X. The config panel is the config, and the{" "}
          <strong>Control</strong> drop-down on <strong>Motor Setup</strong>{" "}
          picks a request. Voltage Out in that drop-down is{" "}
          <code>VoltageOut</code> here. Motion Magic Voltage is{" "}
          <code>MotionMagicVoltage</code>, which replaces it two lessons from
          now.
        </p>
        <p>
          Every request name is made of the same parts. The column is what the
          motor outputs. The row is what it aims at, and a{" "}
          <code>MotionMagic</code> prefix means a profile shapes the move.
        </p>

        <div className="measure-wide overflow-x-auto">
          <table className="w-full min-w-[620px] border-collapse text-note">
            <thead>
              <tr style={{ borderBottom: "1px solid var(--rule)" }}>
                <th className="px-3 py-2 text-left">Aims at</th>
                <th className="px-3 py-2 text-left">Duty cycle</th>
                <th className="px-3 py-2 text-left">Volts</th>
                <th className="px-3 py-2 text-left">Amps</th>
              </tr>
            </thead>
            <tbody style={{ color: "var(--tx2)" }}>
              <tr style={{ borderBottom: "1px solid var(--rule-soft)" }}>
                <td className="px-3 py-2">Nothing</td>
                <td className="px-3 py-2">
                  <code>DutyCycleOut</code>
                </td>
                <td className="px-3 py-2">
                  <code>VoltageOut</code>
                </td>
                <td className="px-3 py-2">
                  <code>TorqueCurrentFOC</code>
                </td>
              </tr>
              <tr style={{ borderBottom: "1px solid var(--rule-soft)" }}>
                <td className="px-3 py-2">A position</td>
                <td className="px-3 py-2">
                  <code>PositionDutyCycle</code>
                </td>
                <td className="px-3 py-2">
                  <code>PositionVoltage</code>
                </td>
                <td className="px-3 py-2">
                  <code>PositionTorqueCurrentFOC</code>
                </td>
              </tr>
              <tr style={{ borderBottom: "1px solid var(--rule-soft)" }}>
                <td className="px-3 py-2">A velocity</td>
                <td className="px-3 py-2">
                  <code>VelocityDutyCycle</code>
                </td>
                <td className="px-3 py-2">
                  <code>VelocityVoltage</code>
                </td>
                <td className="px-3 py-2">
                  <code>VelocityTorqueCurrentFOC</code>
                </td>
              </tr>
              <tr style={{ borderBottom: "1px solid var(--rule-soft)" }}>
                <td className="px-3 py-2">A position, profiled</td>
                <td className="px-3 py-2">
                  <code>MotionMagicDutyCycle</code>
                </td>
                <td className="px-3 py-2">
                  <code>MotionMagicVoltage</code>
                </td>
                <td className="px-3 py-2">
                  <code>MotionMagicTorqueCurrentFOC</code>
                </td>
              </tr>
              <tr>
                <td className="px-3 py-2">A velocity, profiled</td>
                <td className="px-3 py-2">
                  <code>MotionMagicVelocityDutyCycle</code>
                </td>
                <td className="px-3 py-2">
                  <code>MotionMagicVelocityVoltage</code>
                </td>
                <td className="px-3 py-2">
                  <code>MotionMagicVelocityTorqueCurrentFOC</code>
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        <p>
          This course stays in the volts column, so the gains you tuned are in
          volts. A request also stays latched. The motor keeps applying the last
          one it received until a different one arrives, even after the code
          that sent it has stopped running. That is what{" "}
          <code>stopMotor()</code> is for, and{" "}
          <a href="/running-program#latched" className="underline">
            Hardware Simulation
          </a>{" "}
          shows what happens without it.
        </p>
      </LessonSection>

      <LessonSection id="register-on-robot" title="Hand it to Robot">
        <p>
          Nothing has built the class yet. <code>Robot</code> is where it
          becomes a real object: built once at startup, outliving every mode,
          and handed to every OpMode. Add the two fields.
        </p>

        <CodeBlock
          language="java"
          title="Robot.java: the mechanisms it owns"
          filename="src/main/java/first/robot/Robot.java"
          code={`package first.robot;

import first.robot.mechanisms.Arm;
import first.robot.mechanisms.Flywheel;
import org.wpilib.command3.Scheduler;
import org.wpilib.framework.OpModeRobot;

public class Robot extends OpModeRobot {
  // The robot's mechanisms. Public so OpModes can use them.
  public final Arm arm = new Arm();
  public final Flywheel flywheel = new Flywheel();

  public Robot() {}

  @Override
  public void robotPeriodic() {
    Scheduler.getDefault().run();
  }
}`}
        />

        <p>
          <code>public</code> so every OpMode can reach them, and{" "}
          <code>final</code> so nothing swaps them out.
        </p>

        <p>
          Building only the <M k="noun" />? Delete the{" "}
          <code>
            <M k="other" />
          </code>{" "}
          field and its import. A field that builds a class you never wrote does
          not compile.
        </p>
      </LessonSection>

      <LessonSection id="check-your-work" title="Check your work">
        <p>Nothing on this branch moves a motor, so the check is a build.</p>

        <ol className="ml-5 list-decimal space-y-3">
          <li>
            Run <em>WPILib: Build Robot Code</em>. You should see{" "}
            <code>BUILD SUCCESSFUL</code>, which means every import resolved and
            every name you typed exists.
          </li>
          <li>
            List <code>src/main/java/first/robot/mechanisms/</code>.{" "}
            <code>
              <M k="file" />
            </code>{" "}
            is in it, beside <code>Robot.java</code>.
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
              <code>getConfigurator().apply(talonFXCfg)</code>.
            </li>
            <li>
              <code>setVoltage</code> and <code>stopMotor</code>, both{" "}
              <code>private</code>, and no public method but the constructor.
            </li>
          </ul>
        </Box>

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
      </LessonSection>

      <Quiz
        questions={[
          {
            id: 1,
            question: "Which statement about Mechanism is correct?",
            options: [
              "Mechanism is final, so you wrap one in a helper class instead of subclassing",
              "Mechanism is an empty marker: implementing it changes nothing about the class",
              "Mechanism is an interface you implement, so Arm writes implements Mechanism",
              "Mechanism is a class you extend, so Arm writes extends Mechanism",
            ],
            correctAnswer: 2,
            explanation:
              "Mechanism.java declares `public interface Mechanism`, and every lesson branch writes `implements Mechanism`. It is not an empty marker either: every one of its methods carries a default body, so runRepeatedly(...), run(...), idle() and setDefaultCommand(...) all arrive with that one line.",
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
              "Why does Arm's config name a feedback sensor when nothing on this branch reads a position?",
            options: [
              "It resets the CANcoder to zero every time the robot boots",
              "It tells the CANcoder to follow the motor's rotor count",
              "A TalonFX will not accept a VoltageOut request until a feedback source is set",
              "It makes the CANcoder the motor's position source, so angles asked for later are measured from the arm's real angle instead of from wherever it powered on",
            ],
            correctAnswer: 3,
            explanation:
              "A TalonFX counts rotor turns from zero at every power-on, so it has no idea where the arm physically is. The CANcoder is absolute and knows its angle the moment it boots. The withFeedback block points the motor's position feedback at that sensor, which is what lets closed-loop position work later. You set the same pair in Tuner X on Motor Setup. Generate Code writes back what the device already holds.",
          },
          {
            id: 4,
            question:
              "setVoltage sends voltageOut.withOutput(6.0) once, and then nothing calls it again. What does the motor do?",
            options: [
              "Keeps applying 6 V, because a request stays latched until a different one replaces it",
              "Applies 6 V for one 20 ms loop, then drops to zero",
              "Applies 6 V until the config is applied again",
              "Nothing, because a request has to be saved to the device like a config",
            ],
            correctAnswer: 0,
            explanation:
              "A config is saved and applied once. A request is an instruction the motor keeps following until it gets a different one. Nothing times it out after a loop. A motor left on its last request keeps going, and stopMotor() exists to replace it.",
          },
        ]}
      />
    </PageTemplate>
  );
}
