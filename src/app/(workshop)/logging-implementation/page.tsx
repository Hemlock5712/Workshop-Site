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
import { BookOpen } from "lucide-react";

export default function LoggingImplementation() {
  return (
    <PageTemplate
      title="Logging"
      lede="DataLogManager copies every NetworkTables value and every console line into one file on disk. You start it in Robot.java, publish three signals from the arm, then open the file and read them back. Drivetrain pose and swerve telemetry wait for Workshop 3."
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
      time="13 minutes"
    >
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
          filename="src/main/java/frc/robot/Robot.java"
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
        <p>
          Three signals are enough for a first log, and they are read in pairs.
          Position against target says whether the arm arrived. Voltage next to
          either one says what the trip cost, and whether the motor was loaded
          the whole way.
        </p>
        <CodeBlock
          language="java"
          filename="src/main/java/frc/robot/subsystems/Arm.java"
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
        <p>
          The three publishers are fields, built once when the arm is built.
          Build one inside a loop and the code opens a fresh handle fifty times
          a second, closing none of them.
        </p>
        <p>
          Call <code>record</code> from whatever already refreshes those values:
          the <code>runRepeatedly(...)</code> command that holds the target, or
          a background task added with{" "}
          <code>Scheduler.getDefault().addPeriodic(...)</code>. The command
          publishes only while it runs. The background task publishes for as
          long as the robot has power, and neither one is a new loop of yours.
        </p>
        <div className="overflow-x-auto">
          <table className="w-full min-w-[560px] border-collapse text-note">
            <thead>
              <tr style={{ borderBottom: "1px solid var(--rule)" }}>
                <th className="px-3 py-2 text-left">Signal</th>
                <th className="px-3 py-2 text-left">Units</th>
                <th className="px-3 py-2 text-left">Question it answers</th>
              </tr>
            </thead>
            <tbody style={{ color: "var(--tx2)" }}>
              <tr style={{ borderBottom: "1px solid var(--rule-soft)" }}>
                <td className="px-3 py-2">
                  <code>Arm/PositionRot</code>
                </td>
                <td className="px-3 py-2">Mechanism rotations</td>
                <td className="px-3 py-2">Where the arm really is.</td>
              </tr>
              <tr style={{ borderBottom: "1px solid var(--rule-soft)" }}>
                <td className="px-3 py-2">
                  <code>Arm/TargetRot</code>
                </td>
                <td className="px-3 py-2">Mechanism rotations</td>
                <td className="px-3 py-2">Where it was told to go.</td>
              </tr>
              <tr>
                <td className="px-3 py-2">
                  <code>Arm/AppliedVolts</code>
                </td>
                <td className="px-3 py-2">Volts</td>
                <td className="px-3 py-2">How hard it pushed to get there.</td>
              </tr>
            </tbody>
          </table>
        </div>
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
          <li>
            Start the program with <code>./gradlew simulateJava</code> and
            enable the OpMode that moves the arm. Send it to a target, let it
            settle, then send it back.
          </li>
          <li>
            Disable, then stop the program, so the end of the file gets written
            out.
          </li>
          <li>
            Find the newest <code>.wpilog</code>. The program ran on your
            laptop, so the file is in the project&apos;s <code>logs</code>{" "}
            folder.
          </li>
          <li>
            Open it in AdvantageScope. Put <code>Arm/PositionRot</code> and{" "}
            <code>Arm/TargetRot</code> on one graph, and{" "}
            <code>Arm/AppliedVolts</code> on a second.
          </li>
          <li>
            Line the enabled interval up against the motion. Position should
            move only while enabled, and voltage should drop off once the arm
            arrives.
          </li>
        </ol>
        <WatchOut>
          Entries reach disk in batches, not one at a time. Kill the program
          while it is still enabled and the last second or two never gets
          written, which is usually the part you wanted. Disable, stop the
          program, and only then cut power.
        </WatchOut>
        <p>Three things go wrong the first time, and they look like this.</p>
        <FigureGrid
          cols={3}
          items={[
            {
              label: "Empty tree",
              term: "Nothing published",
              body: (
                <>
                  The file exists and holds no <code>Arm/</code> entries. Either
                  the two constructor lines never ran, or <code>record</code> is
                  never called from a loop.
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
      </LessonSection>

      <LessonSection id="check-your-work" title="Check your work">
        <p>
          You are finished when a file on your own laptop can tell you what the
          arm did, with nobody in the room narrating it.
        </p>
        <Box variant="alert-success" title="You should see">
          <ul className="ml-5 list-disc space-y-2">
            <li>
              An <code>Arm/</code> group in the tree, with all three entries
              under it.
            </li>
            <li>
              <code>Arm/TargetRot</code> stepping to your target, and{" "}
              <code>Arm/PositionRot</code> catching up to meet it.
            </li>
            <li>
              <code>Arm/AppliedVolts</code> large while the arm moves, small
              while it holds.
            </li>
            <li>The enabled interval covering every part that moves.</li>
          </ul>
        </Box>
        <p>
          Keep the file. Swerve calibration in Workshop 3 pulls a wheel radius
          and four module angles out of logs that look like this one.
        </p>
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
            question: "Where do the two logging calls belong?",
            options: [
              "At the top of the Robot constructor, ahead of the mechanisms",
              "In each mechanism's constructor, so every mechanism starts its own log",
              "In a loop that runs every cycle, so the log keeps up with the robot",
              "Nowhere in code. The Driver Station turns logging on",
            ],
            correctAnswer: 0,
            explanation:
              "DataLogManager.start() and DriverStation.startDataLog(DataLogManager.getLog()) run once, at the top of the Robot constructor. Put them ahead of the mechanisms and everything that happens during startup lands in the same file as the rest of the run.",
          },
          {
            id: 2,
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
            id: 3,
            question:
              "The arm knows its position. How does that number reach the .wpilog?",
            options: [
              "DataLogManager finds the mechanism's fields and records them on its own",
              "Publish it on a NetworkTables topic, which DataLogManager records",
              "Call DataLogManager.start() again each time the value changes",
              "Write the number to your own text file in the logs folder every loop",
            ],
            correctAnswer: 1,
            explanation:
              "DataLogManager records what changes on NetworkTables, so publishing is how a number of yours gets into the file. The arm holds one DoublePublisher per signal as a field, built once with the arm, and sets it from code that already runs each loop.",
          },
          {
            id: 4,
            question:
              "Why name the entry Arm/PositionRot rather than Arm/Position?",
            options: [
              "The unit is in the name, so rotations, degrees, and radians can share a project without two entries colliding",
              "An entry with no unit in its name never reaches the file",
              "The suffix tells DataLogManager how often to sample the entry",
              "AdvantageScope graphs an entry only when its name ends in a unit",
            ],
            correctAnswer: 0,
            explanation:
              "The name is the whole interface to a log, and the person reading it at an event six weeks from now did not write the code. Rot says what the number means. Renaming the entry later still compiles, and it breaks every saved layout and every script that read the old name, so spend the extra minute now.",
          },
          {
            id: 5,
            question:
              "You ran the program with ./gradlew simulateJava. Where is the .wpilog?",
            options: [
              "On the SystemCore, so you pull it off the controller first",
              "In AdvantageScope's install folder, once you connect it",
              "In the project's logs folder on your laptop",
              "Nowhere. A run with no Driver Station attached writes no file",
            ],
            correctAnswer: 2,
            explanation:
              "The file is written wherever the program runs, and simulateJava runs on your laptop, so take the newest .wpilog out of the project's logs folder. A run with no Driver Station does write a file. It has no clock to date itself with, so it opens as WPILIB_TBD_*.wpilog and gets renamed once a Driver Station supplies one.",
          },
          {
            id: 6,
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
              "A command publishes only while it runs, so the last value it set is the last value in the file, and the trace flattens there. Publishing from the runRepeatedly command that holds the target is fine when you only want the trace while that command runs. For a signal that has to cover the whole run, move the set calls to a background task added with Scheduler.getDefault().addPeriodic(...), which publishes for as long as the robot has power. The other answers leave different marks: missing constructor lines leave no Arm entries at all, a wrong ratio gives the right shape at the wrong scale, and a publisher rebuilt every cycle still sets a value every cycle, so it leaks handles without flattening anything.",
          },
        ]}
      />
    </PageTemplate>
  );
}
