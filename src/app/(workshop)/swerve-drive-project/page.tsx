import PageTemplate from "@/components/PageTemplate";
import LessonSection from "@/components/lesson/LessonSection";
import CodeBlock from "@/components/CodeBlock";
import Box from "@/components/Box";
import DocumentationButton from "@/components/DocumentationButton";
import Quiz from "@/components/Quiz";
import { MarginNote, Split } from "@/components/lesson/Prose";
import Link from "next/link";
import { Book, Download } from "lucide-react";
import { lessonMetadata } from "@/lib/lessonMetadata";

export const metadata = lessonMetadata("/swerve-drive-project");

const linkStyle =
  "text-[var(--accent)] underline hover:no-underline font-medium";

/**
 * Rewritten against `context/lesson-budget.md`, then verified.
 *
 * Five sections. The six generator steps stay a numbered procedure, the four
 * measurements stay a list, and the three files stay a table. Three asides: the
 * download, the "no screenshots" note this site relies on instead of a stale UI
 * picture, and the three bench failures.
 *
 * The verification pass put back what the rewrite had spent to reach 12
 * minutes. The "Check yourself" quiz, which the budget may never buy. The
 * `TunerConstants` field names a student greps for. The example robot's
 * geometry, 10 inch offsets on a 7.36:1 drive and a 2.167 inch wheel radius,
 * read off `1-Swerve` to confirm every digit. The two rules the scheduler
 * enforces on a default command, checked against `commandsv3` `Scheduler.java`,
 * which throws `IllegalArgumentException` on both. And the reason the call
 * sits in `TeleopOpMode`, which is that file's own javadoc.
 *
 * Paid for out of the download box, which was previewing steps 5 and 6, and
 * the opening paragraph, which was restating the lede.
 *
 * October 2026: the "Full simulation" section is new. Workshop 3 only ever ran
 * hardware sim, against real motors, and every later swerve page says "in the
 * simulator", so plain Simulate Robot Code is introduced here. It works because
 * `CommandSwerveDrivetrain` starts a 4 ms `updateSimState` notifier whenever
 * `Utils.isSimulation()`, on `1-Swerve`. The three-file table became prose:
 * its "a class extends only one other class" reason was the wrong reason once
 * `Mechanism` became an interface, and the honest one (keep the part you write
 * out of the part Tuner X wrote) fits in two sentences. The default-command
 * section no longer re-teaches latched or cites `arm.stop()`, which
 * the mechanism chain renamed; it links `/running-program#latched`.
 *
 * The three file embeds the rewrite dropped stay dropped: the three-file table
 * accounts for them and the downloaded project contains them. What survives is
 * the TeleopOpMode constructor, because the default command is the one piece of
 * code this lesson teaches.
 */
export default function SwerveDriveProject() {
  return (
    <PageTemplate
      title="Swerve Project Generator"
      lede="Tuner X measures your drivetrain and writes one file. The rest of the swerve project is already written, so you swap that file in and drive. Have the robot assembled and up on blocks."
      needs={[
        <>
          An assembled drivetrain: eight TalonFX, four CANcoders, one Pigeon 2,
          one CANivore.
        </>,
        <>Phoenix Tuner X connected, with firmware current on every device.</>,
        <>
          Module anatomy and field-centric driving from{" "}
          <strong>How Swerve Works</strong>.
        </>,
        <>A tape measure, and the robot up on blocks.</>,
      ]}
      branch="1-Swerve"
      time="60 minutes"
    >
      <Box variant="alert-info" title="Start from the workshop project">
        <p className="mb-4">
          Download the swerve project below. It is the code on this page, and
          steps 5 and 6 are the only two edits it needs.
        </p>
        <a
          href="https://github.com/Hemlock5712/Workshop-Code/archive/refs/tags/v3.0-swerve.zip"
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-2 rounded-lg border border-[var(--rule)] bg-[var(--bg2)] px-6 py-3 font-medium text-[var(--tx2)] transition-colors hover:border-[var(--accent)] hover:text-[var(--accent)]"
        >
          <Download className="h-5 w-5" />
          Download Swerve Project (v3.0, Commands v3)
        </a>
      </Box>

      <LessonSection
        id="one-file-is-the-whole-output"
        title="What the generator writes"
      >
        <p>
          The generator can write a whole project. Only one file comes back with
          you:{" "}
          <code>src/main/java/frc/robot/generated/TunerConstants.java</code>.
        </p>
        <p>
          It has thirteen device IDs, <code>kDriveGearRatio</code>,{" "}
          <code>kSteerGearRatio</code> and <code>kWheelRadius</code>. Per module
          it holds an X and Y offset from the robot&apos;s center, which is what
          kinematics runs on. There is a CANcoder offset per module as well,
          measured with that wheel straight. <code>steerGains</code>,{" "}
          <code>driveGains</code>, <code>kSlipCurrent</code> and{" "}
          <code>kSpeedAt12Volts</code> are estimates you replace over the next
          two lessons.
        </p>
        <Split>
          <p className="measure m-0 prose-body">
            The copy checked into the workshop project belongs to somebody
            else&apos;s robot. It is square, with modules 10 inches out, 7.36:1
            on the drive, and fake IDs. Deploy it unchanged and the code looks
            for motors that are not on your bus.
          </p>
          <MarginNote label="No screenshots">
            Tuner X moves its controls between releases. Each step says what the
            screen shows once you have it right instead.
          </MarginNote>
        </Split>
      </LessonSection>

      <LessonSection id="six-steps-in-this-order" title="Six steps, in order">
        <ol className="ml-5 list-decimal space-y-3">
          <li>
            Put every device on one CAN bus with a unique ID, and write the IDs
            down corner by corner. You want thirteen listed, no duplicate-ID
            warning, no red firmware badge. A missing device is a wiring fault.
          </li>
          <li>
            Open the swerve project generator, under <strong>Mechanisms</strong>
            , behind a <strong>New Project</strong> button. It opens by asking
            for dimensions rather than for code.
          </li>
          <li>
            Measure the robot and enter four numbers.
            <ul className="mt-2 ml-5 list-disc space-y-1">
              <li>
                <strong>Wheelbase</strong>, labeled FL to BL: front-to-back
                distance between module centers.
              </li>
              <li>
                <strong>Trackwidth</strong>, labeled FL to FR: side-to-side
                distance between module centers.
              </li>
              <li>
                <strong>Wheel radius</strong>: half the tread width, on a wheel
                already driven on. The field asks for radius, not diameter.
              </li>
              <li>
                <strong>Drive gear ratio</strong>: motor rotations per wheel
                rotation, off the module&apos;s spec sheet.
              </li>
            </ul>
            <p className="mt-2">
              Take them off the real robot, not the CAD you meant to build.
              Wheelbase and trackwidth are the pair people swap, and on a square
              robot that stays hidden until it turns.
            </p>
          </li>
          <li>
            With the robot on blocks, the wizard drives the modules one at a
            time. Hold each wheel straight when it asks: that measurement
            becomes the corner&apos;s CANcoder offset. Half a degree of error
            per module walks the robot sideways over a long drive. If the corner
            moving is not the one the wizard named, two CAN IDs are swapped.
          </li>
          <li>
            Generate the constants and replace{" "}
            <code>src/main/java/frc/robot/generated/TunerConstants.java</code>{" "}
            with the file it writes. Replace the whole file, since offsets,
            inversions and IDs all come from the same run. You should see your
            own CAN IDs and a <code>kCANBus</code> line naming your CANivore.
          </li>
          <li>
            Set your team number in <code>.wpilib/wpilib_preferences.json</code>
            , which ships as <code>5712</code>, and{" "}
            <Link href="/running-program#deploy" className={linkStyle}>
              deploy to SystemCore
            </Link>
            . The driver station lists <strong>Teleop</strong> as a selectable
            mode. Modules point straight when you enable, and nothing spins on
            its own.
          </li>
        </ol>
        <DocumentationButton
          href="https://v6.docs.ctr-electronics.com/en/latest/docs/tuner/tuner-swerve/index.html"
          title="CTRE: Tuner X Swerve Project Generator"
          icon={<Book className="h-5 w-5" />}
        />
      </LessonSection>

      <LessonSection id="full-simulation" title="Full simulation">
        <p>
          <Link href="/running-program" className={linkStyle}>
            Hardware Simulation
          </Link>{" "}
          ran your code on the laptop against real motors on the bench. This
          project also runs with no hardware at all. Phoenix 6 simulates every
          TalonFX, CANcoder and the Pigeon, and{" "}
          <code>CommandSwerveDrivetrain</code> runs a physics update every 4 ms
          whenever it finds itself in simulation. The wheels turn, odometry
          counts them, and the pose moves.
        </p>
        <ol className="ml-5 list-decimal space-y-3">
          <li>
            Choose <strong>Simulate Robot Code</strong> from the same toolbar
            menu, the line above <strong>Hardware Sim Robot Code</strong>.
          </li>
          <li>
            In the simulation window, drag your controller onto{" "}
            <strong>Joystick[0]</strong>, pick <strong>Teleoperated</strong>,
            and select the <strong>Teleop</strong> OpMode.
          </li>
          <li>
            Open AdvantageScope, connect it to the simulator, and drag{" "}
            <code>Drivetrain/Pose</code> onto a 2D field view.
          </li>
        </ol>
        <p>
          <strong>You should see:</strong> the robot drawn on the field, moving
          when you push the stick and stopping when you let go. The example
          constants work here unchanged, because nothing goes looking for real
          devices. Every later swerve page that says &quot;in the
          simulator&quot; means this.
        </p>
      </LessonSection>

      <LessonSection
        id="three-files-and-why-there-have"
        title="Three files, one drivetrain"
      >
        <p>
          The drivetrain is three classes. <code>TunerConstants.java</code> is
          Tuner X&apos;s, from your robot: every number about it, hand-edited
          only when calibration says to.{" "}
          <code>CommandSwerveDrivetrain.java</code> is Tuner X&apos;s too,
          lightly edited. It holds the motors, odometry, the simulation thread,
          and forward matched to your alliance color.
        </p>
        <p>
          <code>DriveMechanism.java</code> is the workshop&apos;s, written by
          hand. It implements <code>Mechanism</code>, owns a{" "}
          <code>CommandSwerveDrivetrain</code> as a private field, and is what
          an OpMode talks to. That keeps the code you write out of the files
          Tuner X writes. It also narrows the drivetrain&apos;s hundreds of
          methods down to the few the rest of the robot needs.
        </p>
        <p>
          Both <code>applyRequest(...)</code> and{" "}
          <code>seedFieldCentric()</code> return commands, and{" "}
          <code>setControl(...)</code> sends one request straight through. Two
          more read the drivetrain back: <code>getPose()</code> and{" "}
          <code>getFieldVelocity()</code>. The camera comes in later, through{" "}
          <code>addVisionMeasurement(...)</code>.
        </p>
      </LessonSection>

      <LessonSection
        id="your-first-real-default-command"
        title="The drivetrain default command"
      >
        <p>
          A <code>Mechanism</code> has no default command until you give it one,
          and{" "}
          <Link href="/running-program#latched" className={linkStyle}>
            a canceled command leaves its last request in the motors
          </Link>
          . The arm gets away with that, because its last request is a position
          and it holds there. A drivetrain&apos;s last request is a speed.
        </p>
        <p>
          So teleop gives the drivetrain a real default, the only{" "}
          <code>setDefaultCommand</code> call in the workshop code. It sits in{" "}
          <code>TeleopOpMode</code> rather than <code>Robot</code> because it
          needs that mode&apos;s controller.
        </p>
        <CodeBlock
          language="java"
          title="TeleopOpMode.java: the joystick drive, set as the default"
          filename="src/main/java/frc/robot/opmodes/TeleopOpMode.java"
          code={`public TeleopOpMode(Robot robot) {
    final DriveMechanism drivetrain = robot.drivetrain;

    // In WPILib, X points forward and Y points left. The sticks read the other way around, so
    // each axis below gets a minus sign.
    drivetrain.setDefaultCommand(
        drivetrain.applyRequest(
            () ->
                drive
                    .withVelocityX(-driver.getLeftY() * maxSpeed) // left stick up = forward
                    .withVelocityY(-driver.getLeftX() * maxSpeed) // left stick left = left
                    .withRotationalRate(
                        -driver.getRightX() * maxAngularRate))); // right stick left = turn left

    // Left bumper: make the robot's current facing the new "forward".
    driver.leftBumper().onTrue(drivetrain.seedFieldCentric());
  }`}
        />
        <p>
          <code>applyRequest(...)</code> is built on <code>runRepeatedly</code>,
          so it re-reads the sticks and sends a fresh request every loop. Let go
          and the command is still running, asking for zero. Full stick asks for{" "}
          <code>maxSpeed</code>, which comes straight out of{" "}
          <code>TunerConstants.kSpeedAt12Volts</code>.
        </p>
        <p>
          A default command has to require its own mechanism and no other. Break
          that and the scheduler throws an <code>IllegalArgumentException</code>{" "}
          at runtime, not a compile error.
        </p>
        <p>
          The left bumper runs <code>seedFieldCentric()</code>: whatever way the
          robot faces becomes forward for the sticks. It never says where the
          robot is on the field.{" "}
          <Link
            href="/swerve-calibration#three-things-that-all-sound-like"
            className={linkStyle}
          >
            Swerve Calibration
          </Link>{" "}
          sets it beside <code>resetPose(Pose2d)</code>, the call that does.
        </p>
      </LessonSection>

      <LessonSection id="did-it-work" title="Check your work">
        <p>
          Robot on blocks for the first two checks, then on the floor with room
          around it. Keep a hand on disable.
        </p>
        <ol className="ml-5 list-decimal space-y-3">
          <li>
            Select <strong>Teleop</strong> and enable, hands off the controller.
            All four wheels stay still and each module holds the angle it had.
            Creeping means an off-center stick or a wrong deadband.
          </li>
          <li>
            Push the left stick forward: four modules pointing the same way,
            four wheels turning the same direction. A wheel turning backwards is
            an inversion; a module facing sideways is a CANcoder offset. Push
            the right stick sideways and the modules splay into a rotation
            pattern.
          </li>
          <li>
            On the floor, point the robot away from you and push forward. It
            drives away in a straight line. Turn it 90 degrees in place, push
            forward again, and it goes the same direction across the floor.
            Press the left bumper and forward becomes whatever way it is facing
            now.
          </li>
          <li>
            Let go of everything. The robot stops and stays stopped, because its
            default command is asking for zero.
          </li>
        </ol>
        <Box
          variant="alert-info"
          tag="IF IT DIDN'T WORK"
          title="Three ways this goes wrong"
        >
          <ul className="ml-4 list-disc space-y-2">
            <li>
              <strong>A device the driver station cannot find.</strong> You
              deployed with the example file, or yours landed outside{" "}
              <code>src/main/java/frc/robot/generated/</code>. The{" "}
              <code>kCANBus</code> name has to match your CANivore.
            </li>
            <li>
              <strong>One module fighting the other three.</strong> Its
              inversion or its offset is wrong. Re-run the module test for that
              corner rather than editing the file: the two are measured
              together.
            </li>
            <li>
              <strong>Nothing moves and no error appears.</strong> Check that{" "}
              <strong>Teleop</strong> is selected and the robot enabled. If both
              are right, the <code>setDefaultCommand</code> line is missing, and
              a drivetrain nobody commands looks exactly like broken wiring.
            </li>
          </ul>
        </Box>
        <p>
          <strong>Swerve Calibration</strong> is next. It replaces the
          generator&apos;s estimates with numbers measured off your robot.
        </p>
      </LessonSection>

      {/* The "Check yourself" the rewrite deleted to reach 12 minutes, which is
          the one saving the budget may never make. Four of the six original
          questions test material this page still teaches and come back with
          their wording tightened. The two that leaned on the deleted file
          embeds are replaced: one on the module test naming the wrong corner,
          one on the inversion-and-offset pair, both from procedure steps that
          survived. Every option checked against Workshop-Code `1-Swerve`. */}
      <Quiz
        questions={[
          {
            id: 1,
            question:
              "You finish the Tuner X wizard. Which file do you take back to the workshop project?",
            options: [
              "TunerConstants.java",
              "The whole generated project, replacing the one you downloaded",
              "CommandSwerveDrivetrain.java",
              "DriveMechanism.java",
            ],
            correctAnswer: 0,
            explanation:
              "TunerConstants.java is the only output you keep. It holds your thirteen device IDs, the gear ratios, the wheel radius, each module's position and CANcoder offset, and the starting gains. The rest of the swerve project is already written.",
          },
          {
            id: 2,
            question:
              "The wizard says it is testing the front-left module, and the back-right wheel turns. What is wrong?",
            options: [
              "The wheelbase and trackwidth were entered in the wrong order",
              "That corner's steer motor is inverted",
              "The CANcoder offset for that corner is wrong",
              "Two CAN IDs are swapped, so fix the IDs before going on",
            ],
            correctAnswer: 3,
            explanation:
              "An offset or an inversion changes how a module moves, not which module answers. A different corner moving means the IDs you typed do not match the devices on the bus, and every measurement taken after that gets filed under the wrong wheel.",
          },
          {
            id: 3,
            question:
              "You want a command that drives the robot in a square. Which file does it talk to?",
            options: [
              "TunerConstants.java, because it holds the drivetrain's numbers",
              "DriveMechanism.java, the Mechanism an OpMode talks to",
              "CommandSwerveDrivetrain.java, editing it in place",
              "Whichever file the generator wrote last",
            ],
            correctAnswer: 1,
            explanation:
              "DriveMechanism implements Mechanism and is the drivetrain as far as commands and OpModes are concerned. It owns the CommandSwerveDrivetrain privately, so the code you write stays out of the files Tuner X writes, and the rest of the robot only sees applyRequest, seedFieldCentric, setControl and the pose readings.",
          },
          {
            id: 4,
            question:
              "In teleop you let go of every stick. Why does the robot stop?",
            options: [
              "The joystick default command is still running, and centered sticks are a request for zero speed",
              "Canceling a command sends zero to its motors",
              "The drivetrain falls back to an idle command when nothing claims it",
              "The 10% deadband turns the motors off",
            ],
            correctAnswer: 0,
            explanation:
              "Nothing stops a motor on its own: a mechanism nobody commands keeps its last request. The drivetrain stops because its default command re-reads the sticks every loop and sends whatever they say, and centered sticks say zero. Delete the setDefaultCommand line and a robot driven by a released command would keep rolling.",
          },
          {
            id: 5,
            question:
              "You press the left bumper, which runs seedFieldCentric(). What changed?",
            options: [
              "The top speed the drivetrain will command",
              "The robot's x and y on the field are now zero",
              "Which direction the sticks call forward, and nothing about where the robot is",
              "The CANcoder offsets stored in TunerConstants.java",
            ],
            correctAnswer: 2,
            explanation:
              "seedFieldCentric() sets a heading reference. It never supplies an x or a y, so odometry reports what it reported before. resetPose(Pose2d) is the call that places the robot on the field, and Swerve Calibration lines both up next to applyOperatorPerspective().",
          },
          {
            id: 6,
            question:
              "One module drives the wrong way while the other three go straight. What do you do?",
            options: [
              "Flip that module's inversion in TunerConstants.java and leave its offset alone",
              "Re-run the generator's module test for that corner",
              "Regenerate the file from the start with the dimensions re-entered",
              "Raise driveGains until that module keeps up with the others",
            ],
            correctAnswer: 1,
            explanation:
              "A corner's inversion and its CANcoder offset are measured in the same test, so an inversion flipped by hand disagrees with the offset that was measured beside it. Re-run that module's test and take both numbers from one run.",
          },
        ]}
      />
    </PageTemplate>
  );
}
