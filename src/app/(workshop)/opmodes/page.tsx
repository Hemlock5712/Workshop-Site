import PageTemplate from "@/components/PageTemplate";
import LessonSection from "@/components/lesson/LessonSection";
import FigureGrid from "@/components/lesson/FigureGrid";
import CodeBlock from "@/components/CodeBlock";
import Box from "@/components/Box";
import { Split } from "@/components/lesson/Prose";

export default function OpModes() {
  return (
    <PageTemplate
      title="OpModes"
      lede="Every way the robot can run is its own class with an annotation on top. The driver station lists those classes by name, and picking one builds it. There is no RobotContainer in this project."
      needs={[
        <>
          The project from <strong>Project Setup</strong>, building clean.
        </>,
        <>
          Commands and button bindings from <strong>Writing Commands</strong>.
        </>,
        <>
          The scheduler vocabulary from <strong>Command-Based Framework</strong>
          .
        </>,
      ]}
      time="10 minutes"
    >
      <Split>
        <div className="measure flex flex-col gap-pad [&>p]:m-0 [&>p]:prose-body">
          <p>
            An OpMode is one way the robot can run: driver control, a single
            autonomous routine, a pit procedure that zeroes an arm before a
            match.
          </p>
          <p>
            Nothing registers these classes anywhere. The framework finds them
            by their annotation, and the driver station shows what it found.
            Selecting a mode constructs it, along with every binding in its
            constructor. Selecting a different mode takes those bindings away.
          </p>
        </div>
      </Split>

      <LessonSection id="three-kinds" title="Three OpMode roles">
        <p>
          All three are ordinary Java classes. The annotation decides which name
          the driver station shows, and it tells the next person opening the
          file what the mode is for.
        </p>
        <FigureGrid
          cols={3}
          items={[
            {
              label: "Driver control",
              term: "@Teleop",
              body: "Controller bindings and the defaults a driver expects. They exist only while teleop is the selected mode.",
            },
            {
              label: "Preplanned",
              term: "@Autonomous",
              body: "One routine, named on the driver station, scheduled when the mode starts and canceled when it ends.",
            },
            {
              label: "Pit work",
              term: "@Utility",
              body: "Zeroing, characterization, diagnostics. Keeping these out of teleop means a driver cannot trip one in a match.",
            },
          ]}
        />
        <p>
          One routine per class, not one class holding four of them. Four
          autonomous plans mean four <code>@Autonomous</code> classes and four
          names on the list.
        </p>
      </LessonSection>

      <LessonSection id="teleop-shape" title="The smallest Teleop OpMode">
        <p>
          <strong>Project Setup</strong> left two generated files in{" "}
          <code>opmode/</code>. <code>MyTeleop</code> is the one this section
          rewrites. Rename it to <code>TeleopOpMode</code> before you start.
          Press <code>F2</code> on the class name and VS Code renames the file
          with it. <code>MyAuto</code> becomes <code>LeaveStartAuto</code> in{" "}
          <strong>Autonomous</strong>, so leave it alone for now.
        </p>
        <CodeBlock
          language="java"
          filename="src/main/java/first/robot/opmode/TeleopOpMode.java"
          title="TeleopOpMode.java: one button, one mode"
          code={`package first.robot.opmode;

import first.robot.Robot;
import org.wpilib.command3.button.CommandNiDsXboxController;
import org.wpilib.opmode.PeriodicOpMode;
import org.wpilib.opmode.Teleop;

@Teleop(name = "Driver Control")
public class TeleopOpMode extends PeriodicOpMode {
  private final CommandNiDsXboxController driver = new CommandNiDsXboxController(0);

  public TeleopOpMode(Robot robot) {
    driver.a().whileTrue(robot.arm.runSlow()).whileFalse(robot.arm.stop());
  }
}`}
        />
        <p>
          The constructor is handed the one <code>Robot</code>, and that is the
          only way in to the arm. An OpMode never builds a mechanism of its own:
          two modes would end up configuring the same motor. There is no loop in
          here either. The bindings are made once, and the scheduler checks the
          trigger on every robot loop.
        </p>
      </LessonSection>

      <LessonSection id="constructor" title="Inside the constructor">
        <p>
          The robot program constructs the OpMode the moment someone picks it on
          the driver station. That can happen while the robot is still disabled,
          and constructor code runs anyway. Three things belong in there, and
          three do not.
        </p>
        <ul className="ml-5 list-disc space-y-2">
          <li>
            Trigger bindings for this mode, which is most of what a teleop class
            holds.
          </li>
          <li>
            A command built and kept in a field, ready for <code>start()</code>{" "}
            to schedule.
          </li>
          <li>
            A default command, set with{" "}
            <code>robot.arm.setDefaultCommand(...)</code>. It is a binding like
            any other, so it lasts as long as this mode does.
          </li>
          <li>
            No motor output. The robot may still be disabled when this code
            runs.
          </li>
          <li>
            No state you need after a mode switch. The OpMode is rebuilt each
            time; <code>Robot</code> is not.
          </li>
          <li>
            No motor configuration. IDs, inversions, and gains belong to the
            mechanism.
          </li>
        </ul>
      </LessonSection>

      <LessonSection id="lifecycle" title="Mode boundaries">
        <p>
          Most teleop classes need neither method below. Bindings made in the
          constructor are enough, and the framework removes them when the mode
          changes. There is no cleanup code to write.
        </p>
        <CodeBlock
          language="java"
          title="The lifecycle shape"
          code={`@Override
public void start() {
  // Called once when this OpMode becomes active.
}

@Override
public void end() {
  // Called once when this OpMode stops being active.
}`}
        />
        <p>
          Autonomous is where the two earn their place. <code>start()</code>{" "}
          schedules the routine and <code>end()</code> cancels it. Pair them
          every time. Hit disable partway through a run and <code>end()</code>{" "}
          fires, so the routine stops on that loop rather than running on into
          the next mode.
        </p>
        <p>
          Utility modes use the same boundary. Begin the calibration in{" "}
          <code>start()</code>, stop it in <code>end()</code>, and the mode is
          safe to leave at any point.
        </p>
      </LessonSection>

      <LessonSection id="scope" title="Where behavior lives">
        <p>
          One question settles most of it. What is the smallest scope where this
          behavior still works? Put it there.
        </p>
        <div className="overflow-x-auto">
          <table className="w-full min-w-[560px] border-collapse text-note">
            <thead>
              <tr style={{ borderBottom: "1px solid var(--rule)" }}>
                <th className="px-3 py-2 text-left">Behavior</th>
                <th className="px-3 py-2 text-left">Home</th>
                <th className="px-3 py-2 text-left">Anywhere else</th>
              </tr>
            </thead>
            <tbody style={{ color: "var(--tx2)" }}>
              <tr style={{ borderBottom: "1px solid var(--rule-soft)" }}>
                <td className="px-3 py-2">Driver buttons</td>
                <td className="px-3 py-2">
                  The <code>@Teleop</code> class
                </td>
                <td className="px-3 py-2">
                  A binding in <code>Robot</code> stays live in every mode.
                </td>
              </tr>
              <tr style={{ borderBottom: "1px solid var(--rule-soft)" }}>
                <td className="px-3 py-2">One autonomous routine</td>
                <td className="px-3 py-2">
                  Its own <code>@Autonomous</code> class
                </td>
                <td className="px-3 py-2">
                  A routine with no annotation has no name to select.
                </td>
              </tr>
              <tr style={{ borderBottom: "1px solid var(--rule-soft)" }}>
                <td className="px-3 py-2">Zeroing, characterization</td>
                <td className="px-3 py-2">
                  A <code>@Utility</code> class
                </td>
                <td className="px-3 py-2">
                  On a driver button, someone starts it during a match.
                </td>
              </tr>
              <tr style={{ borderBottom: "1px solid var(--rule-soft)" }}>
                <td className="px-3 py-2">A binding every mode needs</td>
                <td className="px-3 py-2">
                  The <code>Robot</code> constructor
                </td>
                <td className="px-3 py-2">
                  Copied into each OpMode, the copies drift apart.
                </td>
              </tr>
              <tr>
                <td className="px-3 py-2">Motor IDs and gains</td>
                <td className="px-3 py-2">The mechanism</td>
                <td className="px-3 py-2">
                  In an OpMode, two modes can configure the same motor.
                </td>
              </tr>
            </tbody>
          </table>
        </div>
        <Box
          variant="alert-warning"
          tag="COMMON MIX-UP"
          title="An OpMode is not a mechanism"
        >
          <p>
            The OpMode decides when an action is available. The mechanism owns
            the motor and hands out the command. If changing a driver button
            means editing motor configuration, the two have been mixed together.
          </p>
        </Box>
      </LessonSection>

      <LessonSection id="check-your-work" title="Check your work">
        <p>
          Build it, then go look at the list of modes. Deploy and Run covers the
          simulator properly later; this is the short version.
        </p>
        <ol className="ml-5 list-decimal space-y-3">
          <li>
            Run <code>./gradlew build</code>. Nothing else is worth checking
            until that finishes clean.
          </li>
          <li>
            Read your teleop class once. Public class, annotation with a name,
            public constructor taking <code>Robot</code>, every binding inside
            it.
          </li>
          <li>
            Start the simulator with <code>./gradlew simulateJava</code>, then
            read the mode list on the driver station.
          </li>
          <li>
            Pick your teleop mode, enable, and press the bound button. Then
            switch modes and press it again.
          </li>
        </ol>
        <Box variant="alert-success" title="You should see">
          <ul className="ml-5 list-disc space-y-2">
            <li>Every mode class you wrote, listed by its annotation name.</li>
            <li>The button running its command while teleop is selected.</li>
            <li>The same button doing nothing after the mode changes.</li>
          </ul>
        </Box>
        <p>A mode missing from that list is one of four things:</p>
        <ul className="ml-5 list-disc space-y-2">
          <li>
            The class is not <code>public</code>, or it is <code>abstract</code>
            .
          </li>
          <li>The annotation carries no name.</li>
          <li>
            The class sits outside <code>first.robot</code> and its subpackages.
          </li>
          <li>
            The constructor does not take a <code>Robot</code>.
          </li>
        </ul>
        <p>Fix the class, rebuild, and the name appears.</p>
      </LessonSection>
    </PageTemplate>
  );
}
