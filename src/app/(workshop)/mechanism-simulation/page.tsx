import PageTemplate from "@/components/PageTemplate";
import LessonSection from "@/components/lesson/LessonSection";
import CodeBlock from "@/components/CodeBlock";
import Box from "@/components/Box";
import Quiz from "@/components/Quiz";
import MechanismSelector from "@/components/lesson/MechanismSelector";
import { M, Mech } from "@/components/lesson/Mechanism";
import { lessonMetadata } from "@/lib/lessonMetadata";
import { MECHANISM_VIEWS_JAVA, SIM_UTIL_JAVA } from "./utilSources";

export const metadata = lessonMetadata("/mechanism-simulation");

/**
 * The first Extras lesson, on the `mech-sim` branch: one commit on
 * `mech-5-Coroutines` that adds `ArmSim`, `FlywheelSim`, `utils/SimUtil` and
 * `utils/MechanismViews`, and two hooks in each mechanism's constructor.
 *
 *   git -C reference/.git-store/Workshop-Code.git diff mech-5-Coroutines mech-sim
 *
 * It is for teams writing code before their robot exists. It is not part of
 * the bench course, which never needs it: `/running-program` is Hardware Sim,
 * against real motors, and says so.
 *
 * Design (owner, November 2026): the physics lives in a sim class beside the
 * mechanism it models, with every number spelled out, rather than in a
 * `simulationPeriodic` block in `Robot` or behind a one-call builder. The
 * builder was tried and rejected because a student could leave a setting out.
 *
 * Verified by `MechanismSimTest` on the branch (arm reaches vertical, CANcoder
 * and Talon read the true angle, kG agrees with Arm_Cosine, flywheel reaches
 * 50 rps, both pictures publish). Not verified: tuning in Tuner X against the
 * simulated devices, so the page tunes in code.
 *
 * November 2026: `MechanismViews.arm` and `.flywheel` take the mechanism's
 * getters, not the `TalonFX`, so they no longer guess the control mode from
 * its name. The grey target is always drawn, at what the mechanism was last
 * asked for. Both call-site blocks, the hook-in prose, two Run it steps and
 * one quiz explanation follow the rebuilt `mech-sim`.
 */
export default function MechanismSimulation() {
  return (
    <PageTemplate
      title="Mechanism Simulation"
      lede="Run your code against a physics model when there is no mechanism."
      needs={[
        <>
          Workshops 3 and 4 done, through{" "}
          <a href="/coroutines" className="underline">
            Coroutines
          </a>
          .
        </>,
        <>
          The <code>mech-sim</code> branch checked out and building.
        </>,
        <>An Xbox-style controller plugged into the laptop.</>,
      ]}
      branch="mech-sim"
      time="12 minutes"
    >
      <p>
        Your code runs unchanged, and a picture shows where the mechanism went.
      </p>

      <MechanismSelector />

      <LessonSection id="two-simulations" title="Simulate, not Hardware Sim">
        <p>
          <a href="/running-program" className="underline">
            Hardware Simulation
          </a>{" "}
          used <strong>Hardware Sim Robot Code</strong>, where the motors were
          real. This lesson uses <strong>Simulate Robot Code</strong>, where the
          motors are simulated too. A simulated Talon accepts every request and
          runs its closed loop, but nothing turns its rotor. Something has to
          play the part of the <M k="noun" />, and that is the sim class.
        </p>
        <p>
          The branch adds four files. <M k="name" />
          <code>Sim.java</code> sits in <code>mechanisms/</code> beside the
          class it models, and it is the one to read and change. The two in{" "}
          <code>utils/</code> you copy as they are: <code>SimUtil</code> handles
          the CTRE setup and <code>MechanismViews</code> draws the picture. Both
          are printed whole under{" "}
          <a href="#your-mechanism" className="underline">
            Your own mechanism
          </a>
          .
        </p>
      </LessonSection>

      <LessonSection id="the-sim-class" title="The sim class">
        <p>
          The top of the class is the real mechanism, written down. WPILib
          provides the physics model, and its constructor takes every number.
        </p>
        <Mech for="arm">
          <CodeBlock
            language="java"
            title="ArmSim.java: the arm, written down"
            filename="src/main/java/first/robot/mechanisms/ArmSim.java"
            code={`  // The real arm, from its bill of materials. Change these and the simulated arm changes with them.
  static final double GEARING = 28.125; // 8:60 then 16:60: motor turns per arm turn
  static final double LENGTH_METERS = Arm.LENGTH.in(Meters); // pivot to tip
  static final double MASS_KG = 0.3;

  // WPILib's model of an arm swinging on one joint, under gravity.
  private final SingleJointedArmSim physics =
      new SingleJointedArmSim(
          DCMotor.getKrakenX44(1), // the motor driving it
          GEARING,
          SingleJointedArmSim.estimateMOI(LENGTH_METERS, MASS_KG), // how hard it is to swing
          LENGTH_METERS,
          Double.NEGATIVE_INFINITY, // no hard stops: it can swing all the way round
          Double.POSITIVE_INFINITY,
          true, // gravity
          Units.rotationsToRadians(0.75)); // starts hanging straight down`}
          />
        </Mech>
        <Mech for="flywheel">
          <CodeBlock
            language="java"
            title="FlywheelSim.java: the flywheel, written down"
            filename="src/main/java/first/robot/mechanisms/FlywheelSim.java"
            code={`  // The real flywheel. The motor's speed is the wheel speed your code commands, so the gearing here
  // is 1, matching the config.
  private static final double GEARING = 1.0;
  private static final double MOMENT_OF_INERTIA = 0.002; // kg·m², how hard it is to spin up

  private static final DCMotor MOTOR = DCMotor.getKrakenX44(1);

  // WPILib's model of a spinning wheel. (Written out in full because it shares this class's name.)
  private final org.wpilib.simulation.FlywheelSim physics =
      new org.wpilib.simulation.FlywheelSim(
          Models.flywheelFromPhysicalConstants(MOTOR, MOMENT_OF_INERTIA, GEARING), MOTOR);`}
          />
        </Mech>
        <p>
          Every loop, <code>update()</code> takes three steps. It reads the
          voltage the simulated motor is applying and hands it to the model. The
          model moves the <M k="noun" /> forward 20 ms. The result goes back
          into the simulated devices, so your code reads it the way it would
          read a real sensor.
        </p>
        <Mech for="arm">
          <CodeBlock
            language="java"
            title="ArmSim.java: one loop"
            code={`    // 1. Voltage in: what the motor is applying, from the battery we give it.
    motorSim.Orientation = SimUtil.orientationOf(motor);
    motorSim.setSupplyVoltage(RobotController.getBatteryVoltage());
    encoderSim.setSupplyVoltage(RobotController.getBatteryVoltage());
    physics.setInputVoltage(motorSim.getMotorVoltage());

    // 2. Physics: how the arm moves in one 20 ms loop.
    physics.update(0.020);

    // 3. Motion out: the CANcoder sits on the arm shaft, so it reads the arm itself.
    //    The motor's rotor spins GEARING times faster than the arm.
    double armRotations = Units.radiansToRotations(physics.getAngle());
    double armRotationsPerSecond = Units.radiansToRotations(physics.getVelocity());
    encoderSim.setRawPosition(armRotations);
    encoderSim.setVelocity(armRotationsPerSecond);
    motorSim.setRawRotorPosition(armRotations * GEARING);
    motorSim.setRotorVelocity(armRotationsPerSecond * GEARING);`}
          />
          <p>
            Before its first step, the arm copies the CANcoder&apos;s direction
            and magnet offset onto the simulated CANcoder, through{" "}
            <code>SimUtil.matchCANcoderConfig</code>. Without that the simulated
            CANcoder ignores the offset, and the angle your code reads is not
            the angle the model holds.
          </p>
        </Mech>
        <Mech for="flywheel">
          <CodeBlock
            language="java"
            title="FlywheelSim.java: one loop"
            code={`    // 1. Voltage in: what the motor is applying, from the battery we give it.
    motorSim.Orientation = SimUtil.orientationOf(motor);
    motorSim.setSupplyVoltage(RobotController.getBatteryVoltage());
    physics.setInputVoltage(motorSim.getMotorVoltage());

    // 2. Physics: how the wheel speeds up or slows down in one 20 ms loop.
    physics.update(0.020);

    // 3. Motion out: the rotor spins GEARING times faster than the wheel.
    double wheelRotationsPerSecond = Units.radiansToRotations(physics.getAngularVelocity());
    wheelRotations += wheelRotationsPerSecond * 0.020;
    motorSim.setRawRotorPosition(wheelRotations * GEARING);
    motorSim.setRotorVelocity(wheelRotationsPerSecond * GEARING);`}
          />
        </Mech>
      </LessonSection>

      <LessonSection id="hook-it-in" title="Hook it into the mechanism">
        <p>
          Two calls go at the end of the <M k="file" /> constructor, after the
          config is applied. The picture is drawn from the mechanism&apos;s own
          getters, so it runs on a real robot too. The sim is built only under
          Simulate Robot Code, which is what Phoenix&apos;s{" "}
          <code>Utils.isSimulation()</code> reports. A deployed robot and
          Hardware Sim both skip it.
        </p>
        <Mech for="arm">
          <CodeBlock
            language="java"
            title="Arm.java: end of the constructor"
            filename="src/main/java/first/robot/mechanisms/Arm.java"
            code={`    motor.getConfigurator().apply(talonFXCfg);

    // A picture of the arm, drawn from its own getters. Runs everywhere.
    MechanismViews.arm("ArmView", () -> getPosition(), () -> getTargetPosition(), LENGTH);

    // Simulate Robot Code only: there is no real arm, so physics plays its part.
    if (Utils.isSimulation()) {
      new ArmSim(motor, encoder);
    }`}
          />
          <p>
            <code>LENGTH</code> is a new field on <code>Arm</code>,{" "}
            <code>Inches.of(9)</code>, because the picture and the physics both
            need it.
          </p>
        </Mech>
        <Mech for="flywheel">
          <CodeBlock
            language="java"
            title="Flywheel.java: end of the constructor"
            filename="src/main/java/first/robot/mechanisms/Flywheel.java"
            code={`    motor.getConfigurator().apply(talonFXCfg);

    // A speed gauge, drawn from its own getters. A full bar is 100 rotations per second.
    MechanismViews.flywheel("FlywheelView", () -> getVelocity(), () -> getTargetVelocity(), 100);

    // Simulate Robot Code only: there is no real flywheel, so physics plays its part.
    if (Utils.isSimulation()) {
      new FlywheelSim(motor);
    }`}
          />
        </Mech>
        <p>
          Nothing goes in <code>Robot.java</code>. The sim registers its own
          loop with the scheduler, the same way the picture does. That
          registration lasts as long as whatever made it, so build the mechanism
          as a field on <code>Robot</code>. One built inside an OpMode would
          stop simulating when that OpMode ended.
        </p>
      </LessonSection>

      <LessonSection id="run-it" title="Run it">
        <p>
          The branch ships every gain at <code>0.0</code>, so the simulated{" "}
          <M k="noun" /> holds still at first. Give it gains of your own before
          you run it.
        </p>
        <ol className="ml-5 list-decimal space-y-3">
          <li>
            In the config in <M k="file" />, enter your own starting{" "}
            <Mech for="arm">
              <code>kG</code>, <code>kP</code>, cruise velocity and
              acceleration. Motion Magic will not move with a cruise velocity of
              0.
            </Mech>
            <Mech for="flywheel">
              <code>kV</code>, <code>kP</code> and acceleration. The velocity
              profile ramps at that acceleration and has no cruise velocity.
            </Mech>
          </li>
          <li>
            Open the <strong>&hellip;</strong> menu at the end of the editor
            toolbar and choose <strong>Simulate Robot Code</strong>. Keep{" "}
            <strong>Sim GUI</strong> ticked.
          </li>
          <li>
            Drop the controller on <strong>Joystick[0]</strong>, pick{" "}
            <strong>Teleoperated</strong> and your OpMode, and enable, as in{" "}
            <a href="/running-program#first-run" className="underline">
              Hardware Simulation
            </a>
            .
          </li>
          <li>
            From the <strong>NetworkTables</strong> menu, open{" "}
            <strong>Telemetry</strong>, then{" "}
            <Mech for="arm">
              <strong>ArmView</strong>
            </Mech>
            <Mech for="flywheel">
              <strong>FlywheelView</strong>
            </Mech>
            . <strong>You should see:</strong>{" "}
            <Mech for="arm">
              an orange arm hanging straight down, and a thin grey target line
              pointing right, at 0.
            </Mech>
            <Mech for="flywheel">an empty gauge.</Mech>
          </li>
          <li>
            Hold the buttons you bound. <strong>You should see:</strong> the
            picture follow. The thin grey line marks the target the mechanism
            was last asked for, and it stays drawn after you let go.
          </li>
        </ol>
        <p>
          Tune the way{" "}
          <a href="/pid-control" className="underline">
            PID Tuning in Tuner X
          </a>{" "}
          does, in the same order, but change the number in code and restart the
          simulation between tries. These gains tune a model, not your
          mechanism, so expect to tune again once it is built.
        </p>
      </LessonSection>

      <LessonSection id="your-mechanism" title="Your own mechanism">
        <p>
          Copy the four files into your project and change the numbers at the
          top of the sim class to match your design: the gearing,{" "}
          <Mech for="arm">the length and mass of the arm,</Mech>
          <Mech for="flywheel">the wheel&apos;s moment of inertia,</Mech> and
          the motor in <code>DCMotor</code>. Most of them come from your CAD.
        </p>
        <p>
          The two <code>utils/</code> files go in unchanged. Each is folded
          here. Copy it from the header, or open it to read.
        </p>
        <CodeBlock
          collapsed
          language="java"
          title="SimUtil.java"
          filename="src/main/java/first/robot/utils/SimUtil.java"
          code={SIM_UTIL_JAVA}
        />
        <CodeBlock
          collapsed
          language="java"
          title="MechanismViews.java"
          filename="src/main/java/first/robot/utils/MechanismViews.java"
          code={MECHANISM_VIEWS_JAVA}
        />
        <p>
          Change the motor in one more place. A simulated Talon models its own
          motor for current limiting, and it assumes a Kraken X60 unless told.
          The bench runs a Kraken X44, so the constructor says so:
        </p>
        <CodeBlock
          language="java"
          title="The sim's constructor"
          code={`    motorSim.setMotorType(TalonFXSimState.MotorType.KrakenX44);`}
        />
        <p>
          Left at the X60, the simulated bench arm ran away from its target with
          the output pinned near its limit.
        </p>
      </LessonSection>

      <LessonSection id="check-your-work" title="Check your work">
        <Box variant="alert-success" title="You should see">
          <ul className="ml-5 list-disc space-y-2">
            <Mech for="arm" as="li">
              The arm swing to vertical while you hold the left trigger, and its
              orange line settle on the grey target line.
            </Mech>
            <Mech for="flywheel" as="li">
              The orange bar climb to the grey target bar while you hold A, and
              drop back when you let go.
            </Mech>
          </ul>
        </Box>
      </LessonSection>

      <Quiz
        questions={[
          {
            id: 1,
            question:
              "Under Simulate Robot Code, the arm's sim class is never built. What happens when you hold a button?",
            options: [
              "The Sim GUI warns that no physics model is registered",
              "The arm moves normally, because the simulated Talon runs its own physics",
              "The code runs and the Talon accepts the request, but nothing turns the rotor, so the arm never moves",
              "The program crashes when the command starts",
            ],
            correctAnswer: 2,
            explanation:
              "A simulated Talon runs its closed loop and applies a voltage, but it has no idea what that voltage would do to a mechanism. The sim class turns the voltage into motion. Without one, the position never changes.",
          },
          {
            id: 2,
            question:
              "Why is the sim built inside if (Utils.isSimulation()) rather than every time?",
            options: [
              "WPILib requires every sim class to be gated",
              "On a real robot, or in Hardware Sim, there is a real mechanism and its sensors already report where it is",
              "The picture only works when the sim is built",
              "It runs faster that way",
            ],
            correctAnswer: 1,
            explanation:
              "Phoenix's Utils.isSimulation() is true under Simulate Robot Code only, so a deployed robot and Hardware Sim both skip the sim class. The picture is outside the check because it reads the mechanism's own getters, and those work everywhere.",
          },
          {
            id: 3,
            question:
              "You tune your arm in simulation, then build the real arm. What should you expect?",
            options: [
              "You must delete the sim class before the real arm will move",
              "The real arm needs the gains doubled",
              "The same gains work exactly, because the physics model is accurate",
              "The gains are a starting point, and you tune again on the real arm",
            ],
            correctAnswer: 3,
            explanation:
              "The model is only as good as the numbers you gave it, and it leaves out friction and backlash. The real mechanism gets tuned again in Tuner X.",
          },
        ]}
      />
    </PageTemplate>
  );
}
