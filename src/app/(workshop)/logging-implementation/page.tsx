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
      lede="DataLogManager copies every NetworkTables value and every console line into one file on disk. You start it in Robot.java, publish three signals from your mechanism, then open the file and read them back."
      needs={[
        <>
          The project from <strong>Deploy and Run</strong> running on the bench.
        </>,
        <>
          <strong>Robot.java</strong> and one mechanism class from the previous
          lessons.
        </>,
        <>AdvantageScope installed from Prerequisites.</>,
      ]}
      time="10 minutes"
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
            code={`import org.wpilib.networktables.DoublePublisher;
import org.wpilib.networktables.NetworkTableInstance;

private final DoublePublisher positionLog =
    NetworkTableInstance.getDefault().getDoubleTopic("Arm/PositionRot").publish();
private final DoublePublisher targetLog =
    NetworkTableInstance.getDefault().getDoubleTopic("Arm/TargetRot").publish();
private final DoublePublisher voltageLog =
    NetworkTableInstance.getDefault().getDoubleTopic("Arm/AppliedVolts").publish();

private void record(double position, double target, double volts) {
  positionLog.set(position);
  targetLog.set(target);
  voltageLog.set(volts);
}`}
          />
        </Mech>

        <Mech for="flywheel">
          <CodeBlock
            language="java"
            filename="src/main/java/first/robot/mechanisms/Flywheel.java"
            title="Flywheel.java: three numbers worth keeping"
            code={`import org.wpilib.networktables.DoublePublisher;
import org.wpilib.networktables.NetworkTableInstance;

private final DoublePublisher velocityLog =
    NetworkTableInstance.getDefault().getDoubleTopic("Flywheel/VelocityRPS").publish();
private final DoublePublisher targetLog =
    NetworkTableInstance.getDefault().getDoubleTopic("Flywheel/TargetRPS").publish();
private final DoublePublisher voltageLog =
    NetworkTableInstance.getDefault().getDoubleTopic("Flywheel/AppliedVolts").publish();

private void record(double velocity, double target, double volts) {
  velocityLog.set(velocity);
  targetLog.set(target);
  voltageLog.set(volts);
}`}
          />
        </Mech>

        <p>
          The three publishers are fields, built once when the <M k="noun" /> is
          built. Build one inside a loop and the code opens a fresh handle fifty
          times a second, closing none of them.
        </p>

        <p>
          Call <code>record</code> from whatever already refreshes those values:
          the <code>runRepeatedly(...)</code> command that holds the target, or
          a background task added with{" "}
          <code>Scheduler.getDefault().addPeriodic(...)</code>. The command
          publishes only while it runs. The background task publishes for as
          long as the robot has power, and neither one is a new loop of yours.
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
            Group with a slash. Everything under <code>Arm/</code> arrives
            together in the viewer, next to <code>Flywheel/</code> and
            <code> Drivetrain/</code>.
          </li>
          <li>
            One publisher per fact. Two classes publishing{" "}
            <code>Arm/PositionRot</code> give you a trace that flickers between
            two sources, with nothing to say which one you are reading.
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
            Start the program with <code>./gradlew simulateJava</code> and
            enable the OpMode that moves the arm. Send it to a target, let it
            settle, then send it back.
          </Mech>
          <Mech for="flywheel" as="li">
            Start the program with <code>./gradlew simulateJava</code> and
            enable the OpMode that spins the flywheel. Take it to full, hold it
            there long enough to settle, then let it coast down.
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
            Open it in AdvantageScope. Put <code>Arm/PositionRot</code> and{" "}
            <code>Arm/TargetRot</code> on one graph, and{" "}
            <code>Arm/AppliedVolts</code> on a second.
          </Mech>
          <Mech for="flywheel" as="li">
            Open it in AdvantageScope. Put <code>Flywheel/VelocityRPS</code> and{" "}
            <code>Flywheel/TargetRPS</code> on one graph, and{" "}
            <code>Flywheel/AppliedVolts</code> on a second.
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
                    The file exists and holds no <code>Arm/</code> entries.
                    Either the two constructor lines never ran, or{" "}
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
                    publishing code sits inside a command that finished, so
                    nothing has called <code>set</code> since.
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
                    The file exists and holds no <code>Flywheel/</code> entries.
                    Either the two constructor lines never ran, or{" "}
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
                    publishing code sits inside a command that finished, so
                    nothing has called <code>set</code> since.
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
              An{" "}
              <code>
                <M k="name" />/
              </code>{" "}
              group in the tree, with all three entries under it.
            </li>
            <Mech for="arm" as="li">
              <code>Arm/TargetRot</code> stepping to your target, and{" "}
              <code>Arm/PositionRot</code> catching up to meet it.
            </Mech>
            <Mech for="flywheel" as="li">
              <code>Flywheel/TargetRPS</code> stepping to your target, and{" "}
              <code>Flywheel/VelocityRPS</code> climbing to meet it.
            </Mech>
            <Mech for="arm" as="li">
              <code>Arm/AppliedVolts</code> large while the arm moves, small
              while it holds.
            </Mech>
            <Mech for="flywheel" as="li">
              <code>Flywheel/AppliedVolts</code> large through the spin-up,
              smaller once the wheel is at speed.
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
            question:
              "The arm knows its position. How does that number reach the .wpilog?",
            options: [
              "Publish it on a NetworkTables topic, which DataLogManager records",
              "Call DataLogManager.start() again each time the value changes",
              "Write the number to your own text file in the logs folder every loop",
              "DataLogManager finds the mechanism's fields and records them on its own",
            ],
            correctAnswer: 0,
            explanation:
              "DataLogManager records what changes on NetworkTables, so publishing is how a number of yours gets into the file. The arm holds one DoublePublisher per signal as a field, built once with the arm, and sets it from code that already runs each loop.",
          },
          {
            id: 3,
            question:
              "You ran the program with ./gradlew simulateJava. Where is the .wpilog?",
            options: [
              "Nowhere. A run with no Driver Station attached writes no file",
              "On the SystemCore, so you pull it off the controller first",
              "In AdvantageScope's install folder, once you connect it",
              "In the project's logs folder on your laptop",
            ],
            correctAnswer: 3,
            explanation:
              "The file is written wherever the program runs, and simulateJava runs on your laptop, so take the newest .wpilog out of the project's logs folder. A run with no Driver Station does write a file. It has no clock to date itself with, so it opens as WPILIB_TBD_*.wpilog and gets renamed once a Driver Station supplies one.",
          },
          {
            id: 4,
            question:
              "Arm/PositionRot climbs, then freezes partway through the run and holds one value. What happened?",
            options: [
              "The two constructor lines never ran, so nothing was recorded",
              "The set calls sit in a command that finished, and nothing has published since",
              "SensorToMechanismRatio is wrong, so the numbers no longer match the arm",
              "The publisher is rebuilt every cycle, so the code leaks a handle fifty times a second",
            ],
            correctAnswer: 1,
            explanation:
              "A command publishes only while it runs, so the last value it set is the last value in the file, and the trace flattens there. For a signal that has to cover the whole run, move the set calls to a background task added with Scheduler.getDefault().addPeriodic(...), which publishes for as long as the robot has power. Missing constructor lines would leave no Arm entries at all, and a wrong ratio gives the right shape at the wrong scale.",
          },
        ]}
      />
    </PageTemplate>
  );
}
