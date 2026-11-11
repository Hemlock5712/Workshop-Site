import PageTemplate from "@/components/PageTemplate";
import LessonSection from "@/components/lesson/LessonSection";
import CodeBlock from "@/components/CodeBlock";
import Box from "@/components/Box";
import DocumentationButton from "@/components/DocumentationButton";
import Quiz from "@/components/Quiz";
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
 *
 * November 2026, pre-review pass in the owner's style: cut the "Three ways
 * this goes wrong" box and its quiz question, the default-command
 * IllegalArgumentException paragraph, and the list of DriveMechanism methods
 * no page step uses yet.
 *
 * Owner's review, November 2026 (Recording 11): the page is about one file.
 * The generator can write a whole project; we keep only `TunerConstants.java`,
 * generated alone (not Generate Project) and pasted over ours, then the team
 * number. Check your work moved up to right after those two edits. The
 * joystick default moved from `TeleopOpMode` into the `Robot` constructor on
 * `1-Swerve` and every swerve branch after it, so it applies in every mode, as
 * last year's v2 RobotContainer default did. `seedFieldCentric()` was checked
 * in Phoenix 6 `26.70.0-alpha-2` `SwerveDrivetrain`: it resets only the pose's
 * rotation, from the operator perspective, and leaves X and Y alone.
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
          <strong>Swerve Basics</strong>.
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
          href="https://github.com/Hemlock5712/Workshop-Code/archive/refs/tags/v3.1-swerve.zip"
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-2 rounded-lg border border-[var(--rule)] bg-[var(--bg2)] px-6 py-3 font-medium text-[var(--tx2)] transition-colors hover:border-[var(--accent)] hover:text-[var(--accent)]"
        >
          <Download className="h-5 w-5" />
          Download Swerve Project (v3.1, Commands v3)
        </a>
      </Box>

      <LessonSection
        id="one-file-is-the-whole-output"
        title="What the generator writes"
      >
        <p>
          The generator can write a whole project. We already have a project
          made for you, so we only care about one file it writes,{" "}
          <code>TunerConstants.java</code>. At the end you export it into this
          project.
        </p>
      </LessonSection>

      <LessonSection id="six-steps-in-this-order" title="Six steps, in order">
        <ol className="ml-5 list-decimal space-y-3">
          <li>
            Put every device on one CAN bus with a unique ID, and write the IDs
            down corner by corner. You want thirteen listed and no duplicate-ID
            warning.
          </li>
          <li>
            Open the swerve project generator, under <strong>Mechanisms</strong>
            , behind a <strong>New Project</strong> button.
          </li>
          <li>
            Measure the robot and enter four numbers. Take them off the real
            robot, not the CAD.
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
                <strong>Wheel radius</strong>: half the wheel&apos;s diameter.
              </li>
              <li>
                <strong>Drive gear ratio</strong>: motor rotations per wheel
                rotation, off the module&apos;s spec sheet.
              </li>
            </ul>
          </li>
          <li>
            For each module, pick its CANcoder and two motors. Then run{" "}
            <strong>Encoder Calibration</strong> with the wheel straight and the
            bevel gear facing the center of the robot. With the robot on blocks,
            run the steer and drive checks. If the corner moving is not the one
            the wizard named, its devices are assigned to the wrong module.
          </li>
          <li>
            Generate only the constants. Do not select{" "}
            <strong>Generate Project</strong>. Overwrite{" "}
            <code>src/main/java/frc/robot/generated/TunerConstants.java</code>{" "}
            with the file it writes. You should see your own CAN IDs and a{" "}
            <code>kCANBus</code> line naming your CANivore.
          </li>
          <li>
            Change <code>teamNumber</code> in{" "}
            <code>.wpilib/wpilib_preferences.json</code> from <code>5712</code>{" "}
            to your team number, and{" "}
            <Link href="/running-program#deploy" className={linkStyle}>
              deploy to SystemCore
            </Link>
            .
          </li>
        </ol>
        <DocumentationButton
          href="https://v6.docs.ctr-electronics.com/en/latest/docs/tuner/tuner-swerve/index.html"
          title="CTRE: Tuner X Swerve Project Generator"
          icon={<Book className="h-5 w-5" />}
        />
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
          </li>
          <li>
            Push the left stick forward: four modules pointing the same way,
            four wheels turning the same direction. Push the right stick
            sideways and the modules splay into a rotation pattern.
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
      </LessonSection>

      <LessonSection id="full-simulation" title="Full simulation">
        <p>
          <Link href="/running-program" className={linkStyle}>
            Hardware Simulation
          </Link>{" "}
          ran your code on the laptop against real motors on the bench.{" "}
          <strong>Simulate Robot Code</strong> runs it with no hardware at all:
          the wheels turn, odometry counts them, and the pose moves.
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
          when you push the stick and stopping when you let go. Every later
          swerve page that says &quot;in the simulator&quot; means this.
        </p>
      </LessonSection>

      <LessonSection
        id="three-files-and-why-there-have"
        title="Three files, one drivetrain"
      >
        <p>
          The drivetrain is three classes. <code>TunerConstants.java</code> is
          Tuner X&apos;s, from your robot: every number about it.{" "}
          <code>CommandSwerveDrivetrain.java</code> is Tuner X&apos;s too,
          lightly edited. It holds the motors, odometry, the simulation thread,
          and forward matched to your alliance color.
        </p>
        <p>
          <code>DriveMechanism.java</code> is the workshop&apos;s, written by
          hand. It implements <code>Mechanism</code>, owns a{" "}
          <code>CommandSwerveDrivetrain</code> as a private field, and is what
          an OpMode talks to. That keeps the code you write out of the files
          Tuner X writes.
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
          . For a drivetrain the last request is a speed, so the robot would
          keep rolling.
        </p>
        <p>
          So the <code>Robot</code> constructor makes the joystick drive the
          drivetrain&apos;s default command, in every mode. Whenever another
          drivetrain command ends or is interrupted, the drivetrain goes back to
          the sticks.
        </p>
        <CodeBlock
          language="java"
          title="Robot.java: the joystick drive, set as the default"
          filename="src/main/java/frc/robot/Robot.java"
          code={`public class Robot extends OpModeRobot {
  public final DriveMechanism drivetrain = new DriveMechanism();
  public final CommandNiDsXboxController driver = new CommandNiDsXboxController(0);

  private final double maxSpeed = TunerConstants.kSpeedAt12Volts.in(MetersPerSecond); // top speed
  private final double maxAngularRate =
      RotationsPerSecond.of(0.75).in(RadiansPerSecond); // 3/4 turn per second

  private final SwerveRequest.FieldCentric drive =
      new SwerveRequest.FieldCentric()
          .withDeadband(maxSpeed * 0.1)
          .withRotationalDeadband(maxAngularRate * 0.1) // ignore the sticks' bottom 10%
          .withDriveRequestType(DriveRequestType.OpenLoopVoltage); // plain voltage, no wheel PID

  public Robot() {
    // Joystick drive, in every mode. Set here instead of in an OpMode so it always exists: when
    // any other drivetrain command ends or is interrupted, the drivetrain goes back to the sticks.
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

    // ... the disabled Idle binding, unchanged
  }

  // ... simulationInit and robotPeriodic, unchanged
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
          <code>TeleopOpMode</code> keeps only its buttons. The left bumper runs{" "}
          <code>seedFieldCentric()</code>, which resets only the rotation of the
          pose. The way the robot faces right now becomes forward for the
          driver. X and Y do not change, so the robot&apos;s place on the field
          stays the same.
        </p>
        <CodeBlock
          language="java"
          title="TeleopOpMode.java: the buttons"
          filename="src/main/java/frc/robot/opmodes/TeleopOpMode.java"
          code={`@Teleop(name = "Teleop")
public class TeleopOpMode extends PeriodicOpMode {
  public TeleopOpMode(Robot robot) {
    final DriveMechanism drivetrain = robot.drivetrain;
    final CommandNiDsXboxController driver = robot.driver;

    // Left bumper: make the robot's current facing the new "forward".
    driver.leftBumper().onTrue(drivetrain.seedFieldCentric());
  }
}`}
        />
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
              "The devices assigned to front left belong to another corner, so fix that before going on",
            ],
            correctAnswer: 3,
            explanation:
              "An offset or an inversion changes how a module moves, not which module answers. A different corner moving means the devices picked for that module are not the ones on that corner, and every measurement taken after that gets filed under the wrong wheel.",
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
              "The joystick default command from Robot.java is still running, and centered sticks are a request for zero speed",
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
              "The heading in the pose, so the way the robot faces now becomes forward for the sticks. X and Y stay the same",
              "The CANcoder offsets stored in TunerConstants.java",
            ],
            correctAnswer: 2,
            explanation:
              "seedFieldCentric() resets only the rotation of the pose: the way the robot faces right now becomes forward for the driver. It never touches x or y, so the robot's place on the field is what it was before.",
          },
        ]}
      />
    </PageTemplate>
  );
}
