import PageTemplate from "@/components/PageTemplate";
import LessonSection from "@/components/lesson/LessonSection";
import CodeBlock from "@/components/CodeBlock";
import Box from "@/components/Box";
import DocumentationButton from "@/components/DocumentationButton";
import Quiz from "@/components/Quiz";
import { WatchOut } from "@/components/lesson/Prose";
import MechanismSelector from "@/components/lesson/MechanismSelector";
import { M, Mech } from "@/components/lesson/Mechanism";
import { BookOpen } from "lucide-react";
import { lessonMetadata } from "@/lib/lessonMetadata";

export const metadata = lessonMetadata("/conditions-and-logging");

/**
 * The page for `mech-4-ReadingState`, which since November 2026 is two
 * lessons in one: the arrival question (`getPosition()`,
 * `getTargetPosition()`, `isAtTarget()`) and the log that shows it.
 *
 * Owner's review, November 2026. Finish Conditions had shrunk to three
 * getters nothing called, with no check of its own, and Logging sat at the
 * end of Workshop 4, after the routine it exists to explain. Merged, the
 * getters are logged the moment they are written, `AtTarget` in the log is
 * the check, and Coroutines starts with a log already running. Both old
 * slugs 308 here.
 *
 * Logging moved from a private `record()` plus
 * `Scheduler.getDefault().addPeriodic(...)` in each constructor to WPILib's
 * `TelemetryLoggable`: the mechanism overrides `logTo(TelemetryTable)` and
 * `Robot.robotPeriodic()` calls `Telemetry.log("Arm", arm)`. The method has a
 * fixed place in the class and every mechanism is logged from one spot.
 * Checked against the alpha-7 sources: `TelemetryTable.log(String, T)`
 * dispatches a `TelemetryLoggable` to a child table of that name, the
 * NetworkTables backend `RobotBase` registers lives at `/Telemetry`, and
 * DataLogManager records NetworkTables under `NT:`. A sim run of the branch
 * wrote all eight `NT:/Telemetry/Arm/...` and `NT:/Telemetry/Flywheel/...`
 * entries to the `.wpilog` in the project's `logs` folder.
 *
 * Values are logged as doubles through `.in(Unit)`. A `Measure` passed
 * straight to `log` is written in its base unit, radians for an `Angle`,
 * which is the wrong unit to read an arm in.
 *
 * Written once, read twice; see `src/data/mechanisms.ts`.
 */
export default function ConditionsAndLogging() {
  return (
    <PageTemplate
      title="Conditions and Logging"
      lede="Every mechanism command so far uses runRepeatedly, so it never ends. A routine needs another way to know when that command has finished, or should be considered finished. Then we log that answer, so you can see it come true."
      needs={[
        <>
          An arm or flywheel on Motion Magic, from{" "}
          <strong>Motion Magic in Code</strong>.
        </>,
        <>AdvantageScope installed from Prerequisites.</>,
      ]}
      branch="mech-4-ReadingState"
      time="11 minutes"
    >
      <MechanismSelector />

      <LessonSection id="sensor-condition" title="The arrival question">
        <Mech for="arm" as="p">
          First, decide what tolerance counts as good enough. The arm is
          measured as an angle, so its tolerance is an angle too. WPILib&apos;s{" "}
          <code>Angle</code> type converts between rotations, degrees and
          radians for you. Degrees are the easiest of the three to picture, so
          we will make the tolerance one degree.
        </Mech>
        <Mech for="flywheel" as="p">
          First, decide what tolerance counts as good enough. The flywheel is
          measured as a speed, so its tolerance is a speed too. WPILib&apos;s{" "}
          <code>AngularVelocity</code> type converts between rotations a second,
          RPM and radians a second for you. We will make the tolerance half a
          rotation a second.
        </Mech>
        <p>
          This may take some tuning. Too tight and it never comes true, because
          the sensor jitters. Too loose and it comes true before the{" "}
          <M k="noun" /> is anywhere useful. For the same reason, never check
          that the reading equals the target exactly: it almost never will.
        </p>
        <p>
          Next, add three getters. One says where the <M k="noun" /> is. One
          says where it is headed, which we read off the current request. The
          last says whether it has arrived.
        </p>
        <Mech for="arm">
          <CodeBlock
            language="java"
            filename="src/main/java/first/robot/mechanisms/Arm.java"
            title="Arm.java: the arrival check"
            code={`public class Arm implements Mechanism {
  // ... motor, encoder and positionOut, unchanged

  // How close counts as "at target".
  private final Angle tolerance = Degrees.of(1.0);

  // ... constructor and commands, unchanged

  /** True when the arm has reached its target angle. */
  public boolean isAtTarget() {
    return getPosition().isNear(getTargetPosition(), tolerance);
  }

  /** Current measured arm angle. */
  public Angle getPosition() {
    return encoder.getPosition().getValue();
  }

  /** Angle the arm is currently driving toward. */
  public Angle getTargetPosition() {
    return positionOut.getPositionMeasure();
  }

  // ... setPosition and stopMotor, unchanged
}`}
          />
        </Mech>

        <Mech for="flywheel">
          <CodeBlock
            language="java"
            filename="src/main/java/first/robot/mechanisms/Flywheel.java"
            title="Flywheel.java: the arrival check"
            code={`public class Flywheel implements Mechanism {
  // ... motor and velocityOut, unchanged

  // How close counts as "at target".
  private final AngularVelocity tolerance = RotationsPerSecond.of(0.5);

  // ... constructor and commands, unchanged

  /** True when the flywheel has reached its target speed. */
  public boolean isAtTarget() {
    return getVelocity().isNear(getTargetVelocity(), tolerance);
  }

  /** Current measured flywheel speed. */
  public AngularVelocity getVelocity() {
    return motor.getVelocity().getValue();
  }

  /** Speed the flywheel is currently driving toward. */
  public AngularVelocity getTargetVelocity() {
    return velocityOut.getVelocityMeasure();
  }

  // ... setVelocity and stopMotor, unchanged
}`}
          />
        </Mech>
      </LessonSection>

      <LessonSection id="start-the-log" title="Start the log">
        <p>
          Recording starts once, at the top of the <code>Robot</code>{" "}
          constructor, and runs from the first loop to the last.
        </p>
        <CodeBlock
          language="java"
          filename="src/main/java/first/robot/Robot.java"
          title="Robot.java: start recording"
          code={`import org.wpilib.driverstation.DriverStation;
import org.wpilib.system.DataLogManager;

public Robot() {
  // Record every logged value, plus the driver station, to a .wpilog file.
  DataLogManager.start();
  DriverStation.startDataLog(DataLogManager.getLog());
}`}
        />
        <p>
          <code>DataLogManager.start()</code> opens the file and records every
          NetworkTables value. On the robot it records console output too.{" "}
          <code>DriverStation.startDataLog</code> adds what NetworkTables never
          sees: enabled state, robot mode, which OpMode is running, and joystick
          positions. Without it you have numbers and no way to tell whether the
          robot was enabled when they happened.
        </p>
      </LessonSection>

      <LessonSection id="log-the-mechanism" title="Log the mechanism">
        <p>
          The <M k="noun" /> writes its own signals. Add{" "}
          <code>TelemetryLoggable</code> to the <code>implements</code> line,
          then write a <code>logTo</code> method that logs the three getters and
          the motor voltage.
        </p>
        <Mech for="arm">
          <CodeBlock
            language="java"
            filename="src/main/java/first/robot/mechanisms/Arm.java"
            title="Arm.java: log the arrival check"
            code={`import static org.wpilib.units.Units.Rotations;

import org.wpilib.telemetry.TelemetryLoggable;
import org.wpilib.telemetry.TelemetryTable;

public class Arm implements Mechanism, TelemetryLoggable {
  // ... everything above, unchanged

  /** Write the arm's signals to the log. Robot calls this every loop. */
  @Override
  public void logTo(TelemetryTable table) {
    table.log("PositionRot", getPosition().in(Rotations));
    table.log("TargetRot", getTargetPosition().in(Rotations));
    table.log("AtTarget", isAtTarget());
    table.log("AppliedVolts", motor.getMotorVoltage().getValueAsDouble());
  }

  // ... setPosition and stopMotor, unchanged
}`}
          />
        </Mech>
        <Mech for="flywheel">
          <CodeBlock
            language="java"
            filename="src/main/java/first/robot/mechanisms/Flywheel.java"
            title="Flywheel.java: log the arrival check"
            code={`import org.wpilib.telemetry.TelemetryLoggable;
import org.wpilib.telemetry.TelemetryTable;

public class Flywheel implements Mechanism, TelemetryLoggable {
  // ... everything above, unchanged

  /** Write the flywheel's signals to the log. Robot calls this every loop. */
  @Override
  public void logTo(TelemetryTable table) {
    table.log("VelocityRPS", getVelocity().in(RotationsPerSecond));
    table.log("TargetRPS", getTargetVelocity().in(RotationsPerSecond));
    table.log("AtTarget", isAtTarget());
    table.log("AppliedVolts", motor.getMotorVoltage().getValueAsDouble());
  }

  // ... setVelocity and stopMotor, unchanged
}`}
          />
        </Mech>
        <p>
          <Mech for="arm">
            <code>.in(Rotations)</code>
          </Mech>
          <Mech for="flywheel">
            <code>.in(RotationsPerSecond)</code>
          </Mech>{" "}
          picks the unit the number is written in. Put the same unit in the
          signal name, so whoever opens the log later does not have to guess.
        </p>
        <p>
          Nothing calls <code>logTo</code> yet. <code>Robot</code> does, once
          per mechanism, every loop, right after the scheduler runs.
        </p>
        <CodeBlock
          language="java"
          filename="src/main/java/first/robot/Robot.java"
          title="Robot.java: log every mechanism every loop"
          code={`import org.wpilib.telemetry.Telemetry;

@Override
public void robotPeriodic() {
  Scheduler.getDefault().run();
  Telemetry.log("Arm", arm);
  Telemetry.log("Flywheel", flywheel);
}`}
        />
        <p>
          <code>Telemetry.log</code> sees a <code>TelemetryLoggable</code>,
          makes a table with the name you gave it, and hands that table to{" "}
          <code>logTo</code>. Everything the <M k="noun" /> logs lands under{" "}
          <code>
            Telemetry/
            <M k="name" />
          </code>
          . <code>robotPeriodic</code> runs in every mode, so the log keeps
          going whether or not a command is running.
        </p>
      </LessonSection>

      <LessonSection id="read-the-file" title="Read the file back">
        <ol className="ml-5 list-decimal space-y-3">
          <li>
            Start <strong>WPILib: Hardware Sim Robot Code</strong>, enable
            Teleoperated, and hold the <Mech for="arm">left trigger</Mech>
            <Mech for="flywheel">right trigger</Mech> until the <M k="noun" />{" "}
            settles. Let go, then do it once more.
          </li>
          <li>Disable, then stop the program.</li>
          <li>
            Open the newest <code>.wpilog</code> from the project&apos;s{" "}
            <code>logs</code> folder in AdvantageScope. Do it before you start
            the program again: a file still named <code>WPILIB_TBD_</code> is
            deleted on the next start.
          </li>
          <Mech for="arm" as="li">
            Expand <code>NT:/Telemetry/Arm</code>. Put <code>PositionRot</code>{" "}
            and <code>TargetRot</code> on one graph, and <code>AtTarget</code>{" "}
            and <code>AppliedVolts</code> on a second.
          </Mech>
          <Mech for="flywheel" as="li">
            Expand <code>NT:/Telemetry/Flywheel</code>. Put{" "}
            <code>VelocityRPS</code> and <code>TargetRPS</code> on one graph,
            and <code>AtTarget</code> and <code>AppliedVolts</code> on a second.
          </Mech>
        </ol>
        <Box variant="alert-success" title="You should see">
          <ul className="ml-5 list-disc space-y-2">
            <Mech for="arm" as="li">
              <code>TargetRot</code> stepping to your target, and{" "}
              <code>PositionRot</code> catching up to meet it.
            </Mech>
            <Mech for="flywheel" as="li">
              <code>TargetRPS</code> stepping to your target, and{" "}
              <code>VelocityRPS</code> climbing to meet it.
            </Mech>
            <li>
              <code>AtTarget</code> turning true once the two meet, and false
              while the <M k="noun" /> is on its way.
            </li>
          </ul>
        </Box>
        <p>
          A signal that holds one value is not always a bug. Telemetry writes an
          entry only when the value changes, so a <M k="noun" /> that is still
          records one sample and then nothing until it moves.
        </p>
        <WatchOut>
          Entries reach disk in batches. Stop the program while it is still
          enabled and the last of them never get written. Disable first.
        </WatchOut>
        <DocumentationButton
          href="https://docs.wpilib.org/en/latest/docs/software/telemetry/datalog.html"
          title="WPILib: On-robot telemetry recording"
          icon={<BookOpen className="h-5 w-5" />}
        />
      </LessonSection>

      <Quiz
        questions={[
          {
            id: 1,
            question:
              "Why does isAtTarget() compare against a tolerance instead of checking whether the reading equals the target?",
            options: [
              "Tolerance is only needed on hardware; in simulation equality works",
              "A measured value almost never lands exactly on the target, so an exact check would be false forever",
              "Equality is slower to compute than a subtraction",
              "The double type has no equality operator in Java",
            ],
            correctAnswer: 1,
            explanation:
              "The sensor measures a real mechanism and the reading jitters. An arm asked for 0.25 rotations reads 0.2497, then 0.2503. An exact comparison would almost never be true, so anything waiting on it would wait for the rest of the match. You choose how close is close enough, in the same units as the target.",
          },
          {
            id: 2,
            question:
              "Why does isAtTarget() live in the mechanism's own class instead of being written out wherever a routine needs it?",
            options: [
              "Only a mechanism class is allowed to read a sensor",
              "The scheduler only checks conditions declared on a mechanism",
              "Java requires a boolean method to sit next to the field it reads",
              "The tolerance, the target and the units already live there, so every routine asks one readable question",
            ],
            correctAnswer: 3,
            explanation:
              "The mechanism knows its own target, its own units and how close counts. Every routine that waits on it calls isAtTarget() and gets the same answer, and changing the tolerance is one edit in one file.",
          },
          {
            id: 3,
            question:
              "The log shows the arm settling 2 degrees short of its target, with a 1 degree tolerance. What do you change?",
            options: [
              "The gains, in Tuner X. The arm is not reaching its target, and a wider band would only hide that",
              "The tolerance, to 3 degrees, so isAtTarget() comes true",
              "Nothing. isAtTarget() only matters on hardware",
              "The target, to 2 degrees lower, so the arm lands on it",
            ],
            correctAnswer: 0,
            explanation:
              "A tolerance describes how much jitter is acceptable once the arm has arrived. An arm that settles 2 degrees short has not arrived. Widening the band makes the routine move on with the arm in the wrong place.",
            only: "arm",
          },
          {
            id: 5,
            question:
              "The log shows the flywheel settling at 73 rotations per second against a target of 75, with a 0.5 tolerance. What do you change?",
            options: [
              "The tolerance, to 2.5 rotations per second, so isAtTarget() comes true",
              "The gains, in Tuner X. The wheel is not reaching its target, and a wider band would only hide that",
              "Nothing. isAtTarget() only matters on hardware",
              "The target, to 77, so the wheel lands on 75",
            ],
            correctAnswer: 1,
            explanation:
              "A tolerance describes how much jitter is acceptable once the wheel is up to speed. A wheel that settles 2 rotations per second slow has not arrived. Widening the band makes the routine shoot with the wheel at the wrong speed.",
            only: "flywheel",
          },
          {
            id: 6,
            question:
              "What does DriverStation.startDataLog(DataLogManager.getLog()) add that DataLogManager.start() does not?",
            options: [
              "Every NetworkTables value change",
              "Console output from the program",
              "Enabled state, robot mode, which OpMode is running, and joystick positions",
              "The motor configuration you saved in Tuner X",
            ],
            correctAnswer: 2,
            explanation:
              "start() records NetworkTables values, and console output on the robot. The second call adds what NetworkTables never sees: the control word, the name of the OpMode that is running, and every joystick axis, button, and POV.",
          },
          {
            id: 7,
            question:
              "You wrote logTo in your mechanism, but the .wpilog has no table for it. What is missing?",
            options: [
              "A second DataLogManager.start() inside logTo",
              "A command that calls logTo while it runs",
              "Nothing. AdvantageScope hides a table until it has changed twice",
              "The Telemetry.log line in Robot.robotPeriodic() that hands the mechanism to logTo",
            ],
            correctAnswer: 3,
            explanation:
              "logTo only says what to write. Telemetry.log in robotPeriodic() is what calls it, every loop, with a table of the name you gave. Leave that line out and nothing ever calls logTo.",
          },
          {
            id: 8,
            question:
              "You ran the program with WPILib: Hardware Sim Robot Code. Where is the .wpilog?",
            options: [
              "In the project's logs folder on your laptop",
              "On the SystemCore, so you pull it off the controller first",
              "In AdvantageScope's install folder, once you connect it",
              "Nowhere. A simulated run writes no file",
            ],
            correctAnswer: 0,
            explanation:
              "The program writes the file wherever it runs, and a hardware sim runs on your laptop, so the file is in the project's logs folder. Open it before the next start: a file still named WPILIB_TBD_ is deleted when the program starts again.",
          },
        ]}
      />
    </PageTemplate>
  );
}
