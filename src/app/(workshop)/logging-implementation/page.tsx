import PageTemplate from "@/components/PageTemplate";
import LessonSection from "@/components/lesson/LessonSection";
import FigureGrid from "@/components/lesson/FigureGrid";
import CodeBlock from "@/components/CodeBlock";
import Box from "@/components/Box";
import DocumentationButton from "@/components/DocumentationButton";
import {
  MarginNote,
  ProseBlock,
  Split,
  WatchOut,
} from "@/components/lesson/Prose";
import Quiz from "@/components/Quiz";
import MechanismSelector from "@/components/lesson/MechanismSelector";
import { M, Mech } from "@/components/lesson/Mechanism";
import { BookOpen } from "lucide-react";

/**
 * Rewritten for WPILib 2027 alpha-7, which added `org.wpilib.telemetry`. The
 * page used to hand-roll three `DoublePublisher` fields per mechanism and
 * wire them to NetworkTables by hand. `Telemetry.getTable(getName())` plus
 * `table.log(name, value)` is the same three signals in three lines, with no
 * fields to build once and no handles to leak in a loop.
 *
 * Two deliberate omissions. Epilogue is not mentioned: it was rebuilt on top
 * of Telemetry and is not deprecated, but teaching both is two things to
 * learn where the course needs one. `DataLogTelemetryBackend` writes straight
 * to file without NetworkTables and gets a single sentence, because it
 * appears only in WPILib's own tests and nothing here needs it.
 *
 * DataLogManager did not change and neither did section one. It captures
 * every NetworkTables change, and the NetworkTables backend that `RobotBase`
 * registers in its own constructor puts telemetry at `/Telemetry`, so the
 * signals land in the `.wpilog` as `NT:/Telemetry/...` with no extra wiring.
 * WPILib's own `hatchbotcmdv3` example does exactly this.
 *
 * Values are logged as plain doubles through `.in(Unit)` rather than as
 * `Measure` objects. The backend does accept a `Measure`, but the entry name
 * it derives from one is not something this page should assert without
 * checking, and `.in(Rotations)` is the more teachable line anyway: it puts
 * the unit in the source next to the unit in the name.
 *
 * Written once, read twice — see `src/data/mechanisms.ts`.
 *
 * The fork here is wider than a substitution, and it is why the three signals
 * are not slots. An arm logs a position against a target; a flywheel logs a
 * velocity against a target, and the sentence that says what the pair is
 * telling you is a different sentence, not the same one with a different noun
 * in it. So the code blocks and the reading of the trace fork, and the naming
 * rules, which are about names rather than about either mechanism, do not.
 *
 * Both readings publish three signals under one group with the unit in the
 * name, which is the thing the lesson is actually for.
 */
export default function LoggingImplementation() {
  return (
    <PageTemplate
      title="Logging"
      lede="Telemetry publishes a number under a name. DataLogManager copies every published value and every console line into one file on disk. You start the recorder in Robot.java, log three signals from your mechanism, then open the file and read them back."
      needs={[
        <>
          The project from <strong>Hardware Simulation</strong> running on the
          bench.
        </>,
        <>
          <strong>Robot.java</strong> and one mechanism class from the previous
          lessons.
        </>,
        <>AdvantageScope installed from Prerequisites.</>,
      ]}
      time="12 minutes"
    >
      <MechanismSelector />

      <Split>
        <ProseBlock>
          <p>
            A log is the only witness to a failure that lasted a tenth of a
            second. The robot stops, ten people offer a theory, and the file on
            disk is the one account anybody can check.
          </p>
          <p>
            Two lines start the recorder. The rest of this lesson is about
            giving it something worth recording, and then proving you can get
            the file back and read it.
          </p>
        </ProseBlock>
        <MarginNote label="File names">
          A controller with no Driver Station attached has no clock. The file
          opens as <code>WPILIB_TBD_*.wpilog</code> and gets renamed with the
          date once a Driver Station supplies one. A logs folder full of TBD
          files at an event means nothing ever connected.
        </MarginNote>
      </Split>

      <LessonSection id="start-the-log" title="Start the log once">
        <p>
          Both calls go at the top of the <code>Robot</code> constructor, ahead
          of the mechanisms. Anything that happens during startup then lands in
          the same file as the rest of the run.
        </p>
        <CodeBlock
          language="java"
          filename="src/main/java/first/robot/Robot.java"
          title="Robot.java: logging starts once"
          code={`import org.wpilib.driverstation.DriverStation;
import org.wpilib.system.DataLogManager;

public Robot() {
  DataLogManager.start();
  DriverStation.startDataLog(DataLogManager.getLog());

  // Construct mechanisms and global bindings after logging is active.
}`}
        />
        <p>
          <code>DataLogManager.start()</code> opens the file and captures
          NetworkTables values and console output.{" "}
          <code>DriverStation.startDataLog</code> adds what NetworkTables never
          sees: enabled state, robot mode, which OpMode is running, and joystick
          positions. Skip the second call and you get numbers with no way to
          tell whether the robot was enabled when they happened.
        </p>
        <p>
          Leave logging on in every mode and every build. A special logging
          build, deployed after the match that went wrong, records the next
          failure instead of the one you are trying to explain.
        </p>
        <Split>
          <div className="measure flex flex-col gap-pad [&>p]:m-0 [&>p]:prose-body">
            <p>
              That is the whole setup, and it is only for the file. Watching
              numbers live needs nothing at all: <code>RobotBase</code>{" "}
              registers a NetworkTables backend at <code>/Telemetry</code> in
              its own constructor, before your <code>Robot</code> runs. Anything
              you log is on the dashboard whether or not you ever call{" "}
              <code>DataLogManager</code>.
            </p>
          </div>
          <MarginNote label="Straight to file">
            There is a backend that writes to the log without going through
            NetworkTables, for signals too fast or too many to put on the wire.
            You do not need it here, and nothing in this course uses it.
          </MarginNote>
        </Split>
      </LessonSection>

      <LessonSection id="publish-one-mechanism" title="Publish three signals">
        <Mech for="arm" as="p" className="prose-body measure">
          Three signals are enough for a first log, and they are read in pairs.
          Position against target says whether the arm arrived. Voltage next to
          either one says what the trip cost, and whether the motor was loaded
          the whole way.
        </Mech>

        <Mech for="flywheel" as="p" className="prose-body measure">
          Three signals are enough for a first log, and they are read in pairs.
          Velocity against target says whether the wheel is up to speed. Voltage
          next to either one says what the spin-up cost, and what it takes to
          hold that speed once a note goes through.
        </Mech>

        <Mech for="arm">
          <CodeBlock
            language="java"
            filename="src/main/java/first/robot/mechanisms/Arm.java"
            title="Arm.java: three numbers worth keeping"
            code={`import static org.wpilib.units.Units.Rotations;

import org.wpilib.telemetry.Telemetry;
import org.wpilib.telemetry.TelemetryTable;

private void record() {
  TelemetryTable table = Telemetry.getTable(getName());

  table.log("PositionRot", getPosition().in(Rotations));
  table.log("TargetRot", getTargetPosition().in(Rotations));
  table.log("AppliedVolts", motor.getMotorVoltage().getValueAsDouble());
}`}
          />
        </Mech>

        <Mech for="flywheel">
          <CodeBlock
            language="java"
            filename="src/main/java/first/robot/mechanisms/Flywheel.java"
            title="Flywheel.java: three numbers worth keeping"
            code={`import static org.wpilib.units.Units.RotationsPerSecond;

import org.wpilib.telemetry.Telemetry;
import org.wpilib.telemetry.TelemetryTable;

private void record() {
  TelemetryTable table = Telemetry.getTable(getName());

  table.log("VelocityRPS", getVelocity().in(RotationsPerSecond));
  table.log("TargetRPS", getTargetVelocity().in(RotationsPerSecond));
  table.log("AppliedVolts", motor.getMotorVoltage().getValueAsDouble());
}`}
          />
        </Mech>

        <Split>
          <div className="measure flex flex-col gap-pad [&>p]:m-0 [&>p]:prose-body">
            <p>
              <code>Telemetry.getTable(...)</code> hands back the table for a
              name, making it on the first call and returning the same one after
              that. So there is nothing to build in the constructor and nothing
              to keep in a field. Calling it every loop is the intended use.
            </p>
            <p>
              <code>getName()</code> is the <M k="noun" />
              &apos;s own name, which <code>Mechanism</code> takes from the
              class unless you override it. That is what puts all three signals
              under{" "}
              <code>
                <M k="name" />/
              </code>{" "}
              without you spelling the prefix into three strings.
            </p>
            <p>
              <code>.in(Rotations)</code> is where the unit gets decided. Both
              getters return a WPILib unit type rather than a bare number, and
              logging one means naming the unit you want it in. Say it here and
              say it again in the signal name, so the file and the code agree.
            </p>
          </div>
          <MarginNote label="Any type, one method">
            <code>log</code> is overloaded for every primitive, for arrays and
            collections, and for anything with a struct. The drivetrain logs its
            whole <code>Pose2d</code> on one line, which is how AdvantageScope
            draws a robot on a field.
          </MarginNote>
        </Split>

        <p>
          Call <code>record</code> from whatever already runs each loop: the{" "}
          <code>runRepeatedly(...)</code> command that holds the target, or a
          background task added with{" "}
          <code>Scheduler.getDefault().addPeriodic(...)</code>. The command logs
          only while it runs. The background task logs for as long as the robot
          has power, and neither one is a new loop of yours.
        </p>
      </LessonSection>

      <LessonSection id="logging-rules" title="Signal names">
        <p>
          The name is the whole interface to a log. Six weeks from now, at an
          event, someone who did not write this code will be reading it. The
          name in the tree is all the documentation they get.
        </p>
        <ul className="ml-5 list-disc space-y-2">
          <li>
            Put the unit in the name. <code>Arm/Position</code> makes the reader
            guess. <code>Arm/PositionRot</code> can share a project with degrees
            and radians without a collision.
          </li>
          <li>
            Let the table do the grouping. Everything logged to the{" "}
            <code>Arm</code> table arrives together in the viewer, next to{" "}
            <code>Flywheel</code> and <code>Drivetrain</code>. Do not write the
            prefix into the signal name as well.
          </li>
          <li>
            One writer per fact. Two classes logging <code>PositionRot</code> to
            the same table give you a trace that flickers between them, and no
            way to tell which is which.
          </li>
          <li>
            Add a signal when you can name the question it answers. A hundred
            signals nobody plots is slower to search than twelve that get used.
          </li>
        </ul>
        <p>
          Rename a signal later and the code still compiles. Every saved layout
          and every script that read the old name stops working. Spend the extra
          minute now.
        </p>
      </LessonSection>

      <LessonSection id="read-the-file" title="Read the file back">
        <p>
          Do this once, here, on a run whose answer you already know. The first
          log you ever open should not be one you need at eleven at night on an
          event floor.
        </p>
        <ol className="ml-5 list-decimal space-y-3">
          <Mech for="arm" as="li">
            Start the program with{" "}
            <strong>WPILib: Hardware Sim Robot Code</strong> and enable the
            OpMode that moves the arm. Send it to a target, let it settle, then
            send it back.
          </Mech>
          <Mech for="flywheel" as="li">
            Start the program with{" "}
            <strong>WPILib: Hardware Sim Robot Code</strong> and enable the
            OpMode that spins the flywheel. Take it to full, hold it there long
            enough to settle, then let it coast down.
          </Mech>
          <li>
            Disable, then stop the program, so the end of the file gets written
            out.
          </li>
          <li>
            Find the newest <code>.wpilog</code>. The program ran on your
            laptop, so the file is in the project&apos;s <code>logs</code>{" "}
            folder.
          </li>
          <Mech for="arm" as="li">
            Open it in AdvantageScope and expand <code>NT:/Telemetry/Arm</code>.
            Put <code>PositionRot</code> and <code>TargetRot</code> on one
            graph, and <code>AppliedVolts</code> on a second.
          </Mech>
          <Mech for="flywheel" as="li">
            Open it in AdvantageScope and expand{" "}
            <code>NT:/Telemetry/Flywheel</code>. Put <code>VelocityRPS</code>{" "}
            and <code>TargetRPS</code> on one graph, and{" "}
            <code>AppliedVolts</code> on a second.
          </Mech>
          <Mech for="arm" as="li">
            Line the enabled interval up against the motion. Position should
            move only while enabled, and voltage should drop off once the arm
            arrives.
          </Mech>
          <Mech for="flywheel" as="li">
            Line the enabled interval up against the motion. Velocity should
            climb only while enabled, and voltage should settle to a smaller
            steady number once the wheel is at speed.
          </Mech>
        </ol>
        <p>
          A trace that holds one value is not always a bug. Telemetry writes an
          entry only when the value changes, so an arm that is genuinely still
          records one sample and then nothing until it moves. The rest of the
          file tells you which you have. Every signal stopping at the same
          instant means the logging stopped. One flat signal among live ones
          means the thing it measures was flat.
        </p>
        <WatchOut>
          Entries reach disk in batches, not one at a time. Kill the program
          while it is still enabled and the last second or two never gets
          written, which is usually the part you wanted. Disable, stop the
          program, and only then cut power.
        </WatchOut>
        <p>Three things go wrong the first time, and they look like this.</p>
        <Mech for="arm">
          <FigureGrid
            cols={3}
            items={[
              {
                label: "Empty tree",
                term: "Nothing published",
                body: (
                  <>
                    The file exists and holds no <code>Telemetry/Arm</code>{" "}
                    table. Either the two constructor lines never ran, or{" "}
                    <code>record</code> is never called from a loop.
                  </>
                ),
              },
              {
                label: "Flat line",
                term: "Stale signal",
                body: (
                  <>
                    The trace freezes partway through and holds one value. The
                    <code>record</code> call sits inside a command that
                    finished, so nothing has logged since.
                  </>
                ),
              },
              {
                label: "Wrong scale",
                term: "Bad units",
                body: (
                  <>
                    The shape looks right and the numbers are off by the gear
                    ratio. Fix <code>SensorToMechanismRatio</code> on the motor,
                    then log the run again.
                  </>
                ),
              },
            ]}
          />
        </Mech>
        <Mech for="flywheel">
          <FigureGrid
            cols={3}
            items={[
              {
                label: "Empty tree",
                term: "Nothing published",
                body: (
                  <>
                    The file exists and holds no <code>Telemetry/Flywheel</code>{" "}
                    table. Either the two constructor lines never ran, or{" "}
                    <code>record</code> is never called from a loop.
                  </>
                ),
              },
              {
                label: "Flat line",
                term: "Stale signal",
                body: (
                  <>
                    The trace freezes partway through and holds one value. The
                    <code>record</code> call sits inside a command that
                    finished, so nothing has logged since.
                  </>
                ),
              },
              {
                label: "Wrong scale",
                term: "Bad units",
                body: (
                  <>
                    The shape looks right and the numbers are off by the gear
                    ratio. Fix <code>SensorToMechanismRatio</code> on the motor,
                    then log the run again.
                  </>
                ),
              },
            ]}
          />
        </Mech>
      </LessonSection>

      <LessonSection id="check-your-work" title="Check your work">
        <p>
          You are finished when a file on your own laptop can tell you what the{" "}
          <M k="noun" /> did, with nobody in the room narrating it.
        </p>
        <Box variant="alert-success" title="You should see">
          <ul className="ml-5 list-disc space-y-2">
            <li>
              A{" "}
              <code>
                Telemetry/
                <M k="name" />
              </code>{" "}
              table in the tree, with all three entries under it.
            </li>
            <Mech for="arm" as="li">
              <code>TargetRot</code> stepping to your target, and{" "}
              <code>PositionRot</code> catching up to meet it.
            </Mech>
            <Mech for="flywheel" as="li">
              <code>TargetRPS</code> stepping to your target, and{" "}
              <code>VelocityRPS</code> climbing to meet it.
            </Mech>
            <Mech for="arm" as="li">
              <code>AppliedVolts</code> large while the arm moves, small while
              it holds.
            </Mech>
            <Mech for="flywheel" as="li">
              <code>AppliedVolts</code> large through the spin-up, smaller once
              the wheel is at speed.
            </Mech>
            <li>The enabled interval covering every part that moves.</li>
          </ul>
        </Box>
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
              "What does DriverStation.startDataLog(DataLogManager.getLog()) add that DataLogManager.start() does not?",
            options: [
              "Every NetworkTables value change",
              "Console output from the program",
              "Enabled state, robot mode, which OpMode is running, and joystick positions",
              "The motor configuration you saved in Tuner X",
            ],
            correctAnswer: 2,
            explanation:
              "start() captures NetworkTables values and console output. The second call adds what NetworkTables never sees: the control word (enabled, e-stopped, robot mode, Driver Station and FMS attached), the name of the OpMode that is running, and every joystick axis, button, and POV. It records no alliance and no match time, so anything you want from the match itself you publish yourself.",
          },
          {
            id: 2,
            only: "arm",
            question:
              "The arm knows its position. How does that number reach the .wpilog?",
            options: [
              "Log it to the mechanism's Telemetry table, which reaches NetworkTables, which DataLogManager records",
              "Call DataLogManager.start() again each time the value changes",
              "Write the number to your own text file in the logs folder every loop",
              "DataLogManager finds the mechanism's fields and records them on its own",
            ],
            correctAnswer: 0,
            explanation:
              "Telemetry.getTable(getName()).log(...) sends the value to whatever backends are registered, and RobotBase registers a NetworkTables one at /Telemetry before your Robot runs. DataLogManager records every NetworkTables change, so the value lands in the file as NT:/Telemetry/Arm/... with no extra wiring. There is nothing to build in the constructor.",
          },
          {
            id: 5,
            only: "flywheel",
            question:
              "The flywheel knows its speed. How does that number reach the .wpilog?",
            options: [
              "Log it to the mechanism's Telemetry table, which reaches NetworkTables, which DataLogManager records",
              "Call DataLogManager.start() again each time the value changes",
              "Write the number to your own text file in the logs folder every loop",
              "DataLogManager finds the mechanism's fields and records them on its own",
            ],
            correctAnswer: 0,
            explanation:
              "Telemetry.getTable(getName()).log(...) sends the value to whatever backends are registered, and RobotBase registers a NetworkTables one at /Telemetry before your Robot runs. DataLogManager records every NetworkTables change, so the value lands in the file as NT:/Telemetry/Flywheel/... with no extra wiring. There is nothing to build in the constructor.",
          },
          {
            id: 3,
            question:
              "You ran the program with WPILib: Hardware Sim Robot Code. Where is the .wpilog?",
            options: [
              "Nowhere. A run with no Driver Station attached writes no file",
              "On the SystemCore, so you pull it off the controller first",
              "In AdvantageScope's install folder, once you connect it",
              "In the project's logs folder on your laptop",
            ],
            correctAnswer: 3,
            explanation:
              "The program writes the file wherever it runs, and a hardware sim runs on your laptop, so take the newest .wpilog out of the project's logs folder. A run with no Driver Station does write a file. It has no clock to date itself with, so it opens as WPILIB_TBD_*.wpilog and gets renamed once a Driver Station supplies one.",
          },
          {
            id: 4,
            only: "arm",
            question:
              "Arm/PositionRot climbs, then freezes partway through the run and holds one value. What happened?",
            options: [
              "The two constructor lines never ran, so nothing was recorded",
              "The record call sits in a command that finished, and nothing has logged since",
              "SensorToMechanismRatio is wrong, so the numbers no longer match the arm",
              "AdvantageScope graphs only the first few seconds of a signal unless you widen the range",
            ],
            correctAnswer: 1,
            explanation:
              "A command logs only while it runs, so the last value it wrote is the last value in the file, and the trace flattens there. For a signal that has to cover the whole run, move the record call to a background task added with Scheduler.getDefault().addPeriodic(...), which logs for as long as the robot has power. Missing constructor lines would leave no Arm table at all, and a wrong ratio gives the right shape at the wrong scale.",
          },
          {
            id: 6,
            only: "flywheel",
            question:
              "Flywheel/VelocityRPS climbs, then freezes partway through the run and holds one value. What happened?",
            options: [
              "The two constructor lines never ran, so nothing was recorded",
              "The record call sits in a command that finished, and nothing has logged since",
              "SensorToMechanismRatio is wrong, so the numbers no longer match the wheel",
              "AdvantageScope graphs only the first few seconds of a signal unless you widen the range",
            ],
            correctAnswer: 1,
            explanation:
              "A command logs only while it runs, so the last value it wrote is the last value in the file, and the trace flattens there. For a signal that has to cover the whole run, move the record call to a background task added with Scheduler.getDefault().addPeriodic(...), which logs for as long as the robot has power. Missing constructor lines would leave no Flywheel table at all, and a wrong ratio gives the right shape at the wrong scale.",
          },
        ]}
      />
    </PageTemplate>
  );
}
