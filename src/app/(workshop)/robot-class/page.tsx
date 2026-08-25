import PageTemplate from "@/components/PageTemplate";
import LessonSection from "@/components/lesson/LessonSection";
import CodeBlock from "@/components/CodeBlock";
import Box from "@/components/Box";
import { MarginNote, Split } from "@/components/lesson/Prose";

export default function RobotClass() {
  return (
    <PageTemplate
      title="Robot.java"
      lede="One Robot object is built at startup and stays alive while modes come and go. It holds the mechanisms, runs the command scheduler once per loop, and starts anything the whole match needs. Mode-specific code stays out of it."
      needs={[
        <>
          The project from <strong>Project Setup</strong>, building clean.
        </>,
        <>
          The scheduler vocabulary from <strong>The Command Framework</strong>.
        </>,
        <>
          The mode boundary from <strong>OpModes</strong>.
        </>,
      ]}
      time="11 minutes"
    >
      <Split>
        <div className="measure flex flex-col gap-pad [&>p]:m-0 [&>p]:prose-body">
          <p>
            Pick teleop and the framework builds a teleop object. Leave teleop
            and that object is thrown away. Pick autonomous and the same thing
            happens again, with a different class. The arm those modes drive is
            one object, built once. It is the same arm in the last second of the
            match.
          </p>
          <p>
            <code>Robot.java</code> is where that one object is created.
            Everything in the file outlives every mode, and nothing in the file
            belongs to one mode. Those two rules decide everything that goes in
            it.
          </p>
        </div>
        <MarginNote label="Older tutorials">
          A tutorial that has you edit RobotContainer is teaching Commands v2.
          This stack has no RobotContainer at all. Shared objects live in Robot,
          and bindings live in the OpModes.
        </MarginNote>
      </Split>

      <LessonSection id="read-the-file" title="The whole file">
        <CodeBlock
          language="java"
          filename="src/main/java/first/robot/Robot.java"
          title="Robot.java: the complete shape"
          code={`package first.robot;

import first.robot.mechanisms.Arm;
import first.robot.mechanisms.Flywheel;
import org.wpilib.command3.Scheduler;
import org.wpilib.framework.OpModeRobot;

public class Robot extends OpModeRobot {
  // One shared object for each physical mechanism.
  public final Arm arm = new Arm();
  public final Flywheel flywheel = new Flywheel();

  public Robot() {
    // Start course-wide services and add truly global bindings here.
  }

  @Override
  public void robotPeriodic() {
    Scheduler.getDefault().run();
  }
}`}
        />
        <p>
          Two fields and one method. The fields are <code>public</code> so an
          OpMode handed a <code>Robot</code> can reach <code>robot.arm</code>{" "}
          directly. They are <code>final</code> so that one arm object serves
          the whole match.
        </p>
        <p>
          A second <code>new Arm()</code> elsewhere in the project does not
          fail. It compiles and it runs. Now two objects configure the same
          motor, and the scheduler counts them as unrelated mechanisms, so two
          commands can drive one gearbox at once. Nothing warns you at build
          time. You find out when the arm fights itself on the bench.
        </p>
        <p>
          Field initializers run before the constructor body, so both mechanisms
          already exist by the first line of <code>Robot()</code>.{" "}
          <code>robotPeriodic()</code> begins after that constructor returns,
          and it keeps being called in every mode, including while the robot is
          disabled.
        </p>
      </LessonSection>

      <LessonSection id="scheduler" title="One scheduler call per loop">
        <p>
          The framework calls <code>robotPeriodic()</code> every 20
          milliseconds, 50 times a second, for as long as the robot has power.
          The single line inside it gives the scheduler one pass. It checks the
          triggers, queues a default command for any mechanism with nothing to
          do, and gives every running command one step.
        </p>
        <p>
          Delete that line and the build still passes. The mechanisms are still
          built. Nothing in the project ever moves again.
        </p>
        <div className="overflow-x-auto">
          <table className="w-full min-w-[560px] border-collapse text-note">
            <thead>
              <tr style={{ borderBottom: "1px solid var(--rule)" }}>
                <th className="px-3 py-2 text-left">The call</th>
                <th className="px-3 py-2 text-left">What happens</th>
                <th className="px-3 py-2 text-left">What you see</th>
              </tr>
            </thead>
            <tbody style={{ color: "var(--tx2)" }}>
              <tr style={{ borderBottom: "1px solid var(--rule-soft)" }}>
                <td className="px-3 py-2">Missing</td>
                <td className="px-3 py-2">No trigger is ever checked</td>
                <td className="px-3 py-2">
                  A clean build, a mode list, and a robot that ignores every
                  button.
                </td>
              </tr>
              <tr style={{ borderBottom: "1px solid var(--rule-soft)" }}>
                <td className="px-3 py-2">Inside an OpMode</td>
                <td className="px-3 py-2">
                  The scheduler stops while that mode is not selected
                </td>
                <td className="px-3 py-2">
                  Buttons work in teleop, and an autonomous routine sits on its
                  first step.
                </td>
              </tr>
              <tr>
                <td className="px-3 py-2">Called twice</td>
                <td className="px-3 py-2">
                  Every command takes two steps a tick
                </td>
                <td className="px-3 py-2">
                  A sequence gets through its steps in half the usual loops, and
                  nothing reports an error.
                </td>
              </tr>
            </tbody>
          </table>
        </div>
        <p>
          The middle row is the common one, and it hides well. A team debugging
          teleop adds a scheduler call to the teleop class, teleop starts
          working, and autonomous quietly stops advancing until the next match.
        </p>
        <Box variant="alert-warning" tag="CRITICAL" title="One call, one place">
          <p>
            <code>Scheduler.getDefault().run()</code> belongs in{" "}
            <code>Robot.robotPeriodic()</code> and nowhere else. Leave it there
            even when a mode looks like it needs a copy of its own. If commands
            are not advancing, the cause is somewhere else.
          </p>
        </Box>
      </LessonSection>

      <LessonSection id="constructor" title="Course-wide setup">
        <p>
          The constructor runs once, at startup, after the mechanism fields
          exist and before any mode is selected. It is the only place in the
          project that can set something up for every mode at once. Four kinds
          of thing earn a spot in it.
        </p>
        <ul className="ml-5 list-disc space-y-2">
          <li>
            Logging. <code>DataLogManager.start()</code> and the DriverStation
            log are two lines, and <strong>Logging</strong> covers what they
            record.
          </li>
          <li>
            A service that two mechanisms share. Build it here, then hand the
            same object to both of them.
          </li>
          <li>
            A safety binding that has to hold in every mode, not only in the one
            mode where a driver would notice it missing.
          </li>
          <li>
            Per-loop work that is not a command, registered with{" "}
            <code>Scheduler.getDefault().addPeriodic(...)</code>. Registering it
            costs one line, and the work itself happens on later loops.
          </li>
        </ul>
        <p>
          Keep the constructor short. Startup waits on it, and no command runs
          and no motor moves until it returns. Reading a file or waiting on a
          camera here delays the whole robot.
        </p>
        <p>
          Other things get put in here by mistake, and each one already has a
          home. Driver buttons go in the teleop class. An autonomous routine
          goes in its own <code>@Autonomous</code> class. Motor IDs, inversions,
          and gains go in the mechanism. A one-off calibration control goes in a{" "}
          <code>@Utility</code> class.
        </p>
        <p>
          The reason is the same every time. A binding made in this constructor
          is live in every mode. Put a calibration routine on a driver button
          and someone can start it mid-match.
        </p>
      </LessonSection>

      <LessonSection id="ownership-test" title="The ownership test">
        <p>
          Where a new field goes comes down to lifetime. Ask how long the object
          has to stay alive, and the answer names the file.
        </p>
        <div className="overflow-x-auto">
          <table className="w-full min-w-[600px] border-collapse text-note">
            <thead>
              <tr style={{ borderBottom: "1px solid var(--rule)" }}>
                <th className="px-3 py-2 text-left">Needs to live for</th>
                <th className="px-3 py-2 text-left">Home</th>
                <th className="px-3 py-2 text-left">In the wrong home</th>
              </tr>
            </thead>
            <tbody style={{ color: "var(--tx2)" }}>
              <tr style={{ borderBottom: "1px solid var(--rule-soft)" }}>
                <td className="px-3 py-2">
                  The whole match, and it owns hardware
                </td>
                <td className="px-3 py-2">
                  A <code>public final</code> field on <code>Robot</code>
                </td>
                <td className="px-3 py-2">
                  Built in an OpMode, the motor is reconfigured on every mode
                  change.
                </td>
              </tr>
              <tr style={{ borderBottom: "1px solid var(--rule-soft)" }}>
                <td className="px-3 py-2">One operating mode</td>
                <td className="px-3 py-2">A field on that OpMode</td>
                <td className="px-3 py-2">
                  Left on <code>Robot</code>, its bindings keep firing in
                  autonomous.
                </td>
              </tr>
              <tr style={{ borderBottom: "1px solid var(--rule-soft)" }}>
                <td className="px-3 py-2">One run of one command</td>
                <td className="px-3 py-2">A local inside the command body</td>
                <td className="px-3 py-2">
                  Held in a field, the second run starts on the first run&apos;s
                  leftovers.
                </td>
              </tr>
              <tr>
                <td className="px-3 py-2">The whole session, no hardware</td>
                <td className="px-3 py-2">
                  The <code>Robot</code> constructor
                </td>
                <td className="px-3 py-2">
                  Started in an OpMode, it stops the moment the mode changes.
                </td>
              </tr>
            </tbody>
          </table>
        </div>
        <p>
          The controller is the field people get wrong. Both the controller
          object and its bindings belong to the teleop class. Bound in the{" "}
          <code>Robot</code> constructor instead, the same button still fires
          while an autonomous routine is running.
        </p>
      </LessonSection>

      <LessonSection id="check-your-work" title="Check your work">
        <p>
          There is no button to press for this lesson, so prove the lifetime
          instead. Two print lines and one mode switch show it.
        </p>
        <ol className="ml-5 list-decimal space-y-3">
          <li>
            Run <code>./gradlew build</code> and wait for{" "}
            <code>BUILD SUCCESSFUL</code>.
          </li>
          <li>
            Search the whole project for <code>getDefault().run</code>. Exactly
            one hit, inside <code>robotPeriodic()</code>. Search for{" "}
            <code>new Arm(</code> and get one hit as well.
          </li>
          <li>
            Add <code>System.out.println(&quot;Robot built&quot;);</code> as the
            first line of the <code>Robot</code> constructor, and{" "}
            <code>System.out.println(&quot;Teleop built&quot;);</code> as the
            first line of your teleop constructor.
          </li>
          <li>
            Start the simulator with <code>./gradlew simulateJava</code>. Watch
            the console while you pick teleop, switch to another mode, and pick
            teleop again.
          </li>
          <li>Delete both print lines once the counts match.</li>
        </ol>
        <Box variant="alert-success" title="You should see">
          <ul className="ml-5 list-disc space-y-2">
            <li>
              <code>Robot built</code> printed once, at startup, and never
              again.
            </li>
            <li>
              <code>Teleop built</code> printed every single time teleop is
              selected.
            </li>
            <li>One scheduler call in the project, and it is in Robot.</li>
            <li>One object per mechanism, all of them built in Robot.java.</li>
          </ul>
        </Box>
        <p>
          A second <code>Robot built</code> line means something other than the
          framework is constructing a <code>Robot</code>. Two hits on{" "}
          <code>new Arm(</code> mean the arm is being built somewhere it should
          be borrowed instead. Fix that before Mechanisms, where every command
          you write reaches the hardware through these fields.
        </p>
      </LessonSection>
    </PageTemplate>
  );
}
