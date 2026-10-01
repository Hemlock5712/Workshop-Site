import PageTemplate from "@/components/PageTemplate";
import LessonSection from "@/components/lesson/LessonSection";
import Box from "@/components/Box";
import CodeBlock from "@/components/CodeBlock";
import Quiz from "@/components/Quiz";
import { MarginNote, ProseBlock, Split } from "@/components/lesson/Prose";
import { lessonMetadata } from "@/lib/lessonMetadata";

export const metadata = lessonMetadata("/testing");

/**
 * Testing, in the order a team needs it: a person at the robot first, then
 * tests the computer runs on every build.
 *
 * The automated half teaches `mech-7-Testing`, whose four tests were run
 * green against WPILib 2027 alpha-7 and Phoenix 6 26.70.0-alpha-2 before this
 * page was written. Three facts on the page came out of breaking them on
 * purpose, not out of documentation:
 * - Without `motorSim.Orientation = Clockwise_Positive`, the flywheel test
 *   fails, because Flywheel is inverted and the sim reports the speed negated.
 * - Without the `Timer.delay(0.1)`, it fails at the first assertion: the
 *   simulated velocity has not arrived yet.
 * - Widening the tolerance to 10 rps fails it at the second assertion. At
 *   exactly 5 rps it still passes, because the simulated speed comes back a
 *   hair under 70, so the check-your-work step uses 10.
 *
 * What the tests do not do, and the page says so: every gain on the branch is
 * 0.0, so asserting a motor voltage would assert zero. They test what the code
 * asks for, never what a mechanism would do.
 */
export default function Testing() {
  return (
    <PageTemplate
      title="Testing"
      lede="A test is a check you can repeat. Some need a person standing at the robot, and some the computer runs by itself every time the code changes."
      needs={[
        <>
          Your project from{" "}
          <a href="/coroutines" className="underline">
            Coroutines
          </a>
          , building clean, or the <code>mech-7-Testing</code> branch.
        </>,
        <>A charged battery and a clear bench for the on-robot half.</>,
      ]}
      branch="mech-7-Testing"
      time="15 minutes"
    >
      <Split>
        <ProseBlock>
          <p>
            The two halves catch different mistakes. A person at the robot
            catches a motor wired backwards or a loose CANcoder. An automated
            test catches a teammate&apos;s edit that quietly changed a setpoint
            three weeks before an event.
          </p>
        </ProseBlock>
      </Split>

      <LessonSection id="on-the-robot" title="On the robot">
        <p>
          Run this list before the first enable after any change, and before
          every match. It takes two minutes.
        </p>
        <ol className="ml-5 list-decimal space-y-3">
          <li>
            Battery above 12.5 volts on the driver station. A low battery makes
            a tuned mechanism look untuned.
          </li>
          <li>
            Every CAN device in Tuner X with the ID the code expects: 31 and 32
            for the arm, 21 for the flywheel.
          </li>
          <li>
            The code on the robot came from main, built after the last pull.
          </li>
          <li>
            Clear the mechanism&apos;s path. One person holds Disable and says
            &quot;enabling&quot; out loud before clicking Enable.
          </li>
          <li>
            Press one binding at a time, briefly, and watch the mechanism, not
            the screen. Check it moves the right way, stops when it should, and
            does what <code>whileFalse</code> says on release.
          </li>
        </ol>
        <Box
          variant="alert-danger"
          tag="WATCH OUT · REAL MOTORS"
          title="Disable first"
        >
          <p>
            A mechanism heading the wrong way, a grinding noise, or a smell
            means Disable, now. Work out why with the robot disabled.
          </p>
        </Box>
        <p>
          Write what you pressed and what happened in the pull request
          description. That line is how a reviewer knows the change ran on a
          robot.
        </p>
      </LessonSection>

      <LessonSection id="a-test-file" title="A test file">
        <p>
          Automated tests live in <code>src/test/java</code>, in a folder that
          mirrors the class they test. <code>ArmTest.java</code> goes in{" "}
          <code>src/test/java/first/robot/mechanisms/</code>, so it shares{" "}
          <code>Arm</code>&apos;s package. The generated{" "}
          <code>build.gradle</code> already includes JUnit 5, the library that
          runs them, so there is nothing to install.
        </p>
        <CodeBlock
          filename="src/test/java/first/robot/mechanisms/ArmTest.java"
          branch="mech-7-Testing"
          code={`class ArmTest {
  private final Scheduler scheduler = Scheduler.getDefault();
  private Arm arm;

  @BeforeEach
  void setUp() {
    // Start the simulated hardware layer, the same one Simulate Robot Code uses.
    assertTrue(HAL.initialize());
    arm = new Arm();
  }

  @AfterEach
  void tearDown() {
    // The scheduler outlives each test. Clear it so one test's commands never leak into the next.
    scheduler.cancelAll();
  }

  @Test
  void verticalAsksForAQuarterTurn() {
    scheduler.schedule(arm.vertical());
    scheduler.run();

    assertEquals(0.25, arm.getTargetPosition().in(Rotations), 1e-9);
  }
}`}
        />
        <p>
          Every method marked <code>@Test</code> is one test, and JUnit runs
          each against a fresh <code>Arm</code> built in <code>setUp</code>. The
          test schedules a command and calls <code>scheduler.run()</code> once,
          which is one robot loop. Then it asks the arm where it is headed.{" "}
          <code>assertEquals</code> fails the test unless the answer is 0.25
          rotations, give or take <code>1e-9</code>.
        </p>
        <p>
          The second test on the branch schedules <code>vertical()</code>, then{" "}
          <code>horizontal()</code>, and checks that the newer command took the
          arm and the older one stopped running.
        </p>
      </LessonSection>

      <LessonSection id="fake-a-sensor" title="Fake a sensor">
        <p>
          <code>isAtTarget()</code> compares a measured speed to the target. A
          test cannot spin a real wheel, so it sets the speed the simulated
          motor reports.
        </p>
        <CodeBlock
          filename="src/test/java/first/robot/mechanisms/FlywheelTest.java"
          branch="mech-7-Testing"
          code={`// A second handle on CAN ID 21 reaches the same simulated motor as the one inside Flywheel,
// so the mechanism's hardware can stay private.
motorSim = new TalonFX(21, new CANBus("canivore")).getSimState();
// Flywheel sets Clockwise_Positive. Tell the sim, or every speed it reports comes back
// negative.
motorSim.Orientation = ChassisReference.Clockwise_Positive;

// ...then, in the test, with runFast() scheduled and run:
motorSim.setRotorVelocity(74.8);
// Simulated sensors update on their own schedule. Give the new speed time to arrive.
Timer.delay(0.1);
assertTrue(flywheel.isAtTarget());

motorSim.setRotorVelocity(70.0);
Timer.delay(0.1);
assertFalse(flywheel.isAtTarget());`}
        />
        <p>
          Both halves matter. 74.8 is inside the 0.5 rotations per second
          tolerance and must count. 70 is outside it and must not. A test with
          only the first half still passes when somebody widens the tolerance to
          10.
        </p>
        <Split>
          <p>
            The arm&apos;s motor is the other way round,{" "}
            <code>CounterClockwise_Positive</code>, which is also the sim&apos;s
            default. Match the orientation to the mechanism every time.
          </p>
          <MarginNote label="What these tests are not">
            Every gain on the branch is <code>0.0</code>, and nothing here
            models a gearbox. These tests check what the code asks for. Whether
            the arm gets there is still the bench&apos;s job.
          </MarginNote>
        </Split>
      </LessonSection>

      <LessonSection id="testable-code" title="Testable code">
        <p>
          These tests work because the mechanisms from Workshop 3 already answer
          questions. <code>getTargetPosition()</code>,{" "}
          <code>getVelocity()</code> and <code>isAtTarget()</code> each return a
          value, and a test can only check a value it can read. A command that
          sets a motor and reports nothing can only be checked by watching it.
        </p>
        <p>
          So when you add a decision, put it in a method that returns the
          answer: true or false, a speed, an angle. Keep the hardware{" "}
          <code>private</code>. A test reaches it through the simulated device
          on the same CAN ID, as above.
        </p>
        <p>When a test fails for no reason you can see, check these first.</p>
        <ul className="ml-5 list-disc space-y-2">
          <li>
            <strong>The target is still 0.</strong> The test scheduled a command
            and never called <code>scheduler.run()</code>. Scheduling only
            queues it.
          </li>
          <li>
            <strong>A sensor reads the wrong value.</strong> The{" "}
            <code>Timer.delay</code> is missing, or the sim orientation does not
            match the motor&apos;s inversion.
          </li>
          <li>
            <strong>A test passes alone and fails with the others.</strong> A
            command from an earlier test is still scheduled. Keep{" "}
            <code>cancelAll()</code> in <code>tearDown</code>.
          </li>
        </ul>
      </LessonSection>

      <LessonSection id="check-your-work" title="Check your work">
        <ol className="ml-5 list-decimal space-y-3">
          <li>
            Open the command palette and run{" "}
            <strong>WPILib: Test Robot Code</strong>. From a terminal,{" "}
            <code>.\gradlew test</code> does the same.
          </li>
          <li>
            In <code>Flywheel.java</code>, change the tolerance from{" "}
            <code>RotationsPerSecond.of(0.5)</code> to{" "}
            <code>RotationsPerSecond.of(10.0)</code> and run the tests again.
          </li>
          <li>Change it back and run them once more.</li>
        </ol>
        <Box variant="alert-success" title="You should see">
          <ul className="ml-5 list-disc space-y-2">
            <li>
              Four lines ending in <code>PASSED</code>, one per test, then{" "}
              <code>BUILD SUCCESSFUL</code>.
            </li>
            <li>
              With the wide tolerance:{" "}
              <code>atTargetOnlyWithinHalfARotationPerSecond() FAILED</code>,
              pointing at line 72 of <code>FlywheelTest.java</code>.
            </li>
            <li>All four passing again once the tolerance is back.</li>
          </ul>
        </Box>
      </LessonSection>

      <Quiz
        questions={[
          {
            id: 1,
            question:
              "Your test schedules arm.horizontal() and asserts the target is 0.5. It fails, and the target reads 0. What is missing?",
            options: [
              "A call to scheduler.run() after scheduling",
              "A Timer.delay before the assertion",
              "A real arm connected over the CANivore",
              "Setting the sim orientation on the arm motor",
            ],
            correctAnswer: 0,
            explanation:
              "schedule() only queues the command. Nothing in it runs until the scheduler loops once, and run() is that loop. The target stays at the request's starting value of 0 until then.",
          },
          {
            id: 2,
            question:
              "You set the simulated flywheel to 74.8 rps and isAtTarget() is false. The wait is there. What do you check?",
            options: [
              "Whether the tolerance is too tight at 0.5",
              "Whether the HAL was initialized twice",
              "Whether the sim orientation matches Flywheel's Clockwise_Positive",
              "Whether runFast() needs an await",
            ],
            correctAnswer: 2,
            explanation:
              "Flywheel inverts its motor, so the sim must be told Clockwise_Positive. Left at the default, the sim reports the speed negated: -74.8 against a target of 75, which is nowhere near.",
          },
          {
            id: 3,
            question:
              "A teammate wants to test a new isJammed() check on the flywheel. Which version can a test check?",
            options: [
              "A command that stops the motor when the wheel jams",
              "A boolean method that returns true when speed is low and the motor is pushing",
              "A line inside runFast() that prints a warning",
              "A check inside MyTeleop that reads the motor directly",
            ],
            correctAnswer: 1,
            explanation:
              "A test checks values it can read. A method returning true or false can be called with a faked speed and asserted on. A command can then use that method, so the behavior on the robot is the same.",
          },
          {
            id: 4,
            question:
              "All four tests pass. Which is still unchecked until someone stands at the robot?",
            options: [
              "That vertical() asks for 0.25 rotations",
              "That a newer command takes the arm from an older one",
              "That isAtTarget() rejects a speed of 70 rps",
              "That the arm swings the right way and reaches 0.25 rotations",
            ],
            correctAnswer: 3,
            explanation:
              "The tests check what the code asks for. Wiring, inversion, gains and the gearbox only exist on the bench. The on-robot list comes first for that reason, and it still runs before every match.",
          },
        ]}
      />
    </PageTemplate>
  );
}
