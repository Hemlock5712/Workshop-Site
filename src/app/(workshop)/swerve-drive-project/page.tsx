import PageTemplate from "@/components/PageTemplate";
import LessonSection from "@/components/lesson/LessonSection";
import AlphaStatusNote from "@/components/AlphaStatusNote";
import KeyConceptSection from "@/components/KeyConceptSection";
import CodeBlock from "@/components/CodeBlock";
import Box from "@/components/Box";
import GitHubContent from "@/components/GitHubContent";
import DocumentationButton from "@/components/DocumentationButton";
import Quiz from "@/components/Quiz";
import Link from "next/link";
import { Book, Download, Gamepad2, MapPin } from "lucide-react";

const bodyStyle = { color: "var(--fg-mute)" } as const;

const linkStyle =
  "text-[var(--accent)] underline hover:no-underline hover:text-[var(--accent)] hover:text-[var(--accent)] font-medium";

export default function SwerveDriveProject() {
  return (
    <PageTemplate
      title="The swerve code is already written. You supply the measurements."
      emphasis="You supply the measurements."
      lede="Nobody on this team writes swerve kinematics by hand. Phoenix Tuner X has a generator that walks your robot, tests each module, and writes one file: TunerConstants.java. Every CAN ID, every gear ratio, every module position and every starting gain lives in that one file."
      needs={[
        <>
          An assembled swerve drivetrain: four modules, eight Kraken/TalonFX
          motors, four CANcoders and a Pigeon 2, all wired to the same CANivore.
        </>,
        <>
          Phoenix Tuner X, from{" "}
          <Link href="/hardware" className={linkStyle}>
            Hardware Setup
          </Link>
          , with firmware already up to date on every device.
        </>,
        <>
          The swerve concepts from{" "}
          <Link href="/swerve-prerequisites" className={linkStyle}>
            Swerve Drive Prerequisites
          </Link>{" "}
          — module anatomy, and field-centric versus robot-centric driving.
        </>,
        <>
          A tape measure, and the robot up on blocks so all four wheels can turn
          freely.
        </>,
      ]}
      branch="1-Swerve"
      time="about an hour"
    >
      <KeyConceptSection
        description={[
          "The rest of the swerve project — the drivetrain class, the Mechanism wrapper, the teleop controls — is already in the workshop code. Your job on this page is to produce a TunerConstants.java that describes your robot, drop it in, and drive.",
        ]}
        concept="Tuner X measures your drivetrain and writes TunerConstants.java. You swap that one file into a project that already works."
      />

      <Box variant="alert-info" tag="WHAT YOU'LL BUILD">
        <p className="mt-3">
          <strong>What you&apos;ll build:</strong> a robot you can drive around
          with a controller, field-centric, with a{" "}
          <code>TunerConstants.java</code> that holds your own CAN IDs,
          dimensions and module offsets. <strong>Budget about an hour</strong> —
          most of it is the generator testing one module at a time.
        </p>
      </Box>

      <Box variant="alert-info" title="Quick start: download the baseline code">
        <p className="mb-4" style={bodyStyle}>
          You do not have to build the project from nothing. Download the
          workshop swerve project, which is the code shown on this page. Change
          the team number in <code>.wpilib/wpilib_preferences.json</code> — it
          ships as <code>5712</code> — and replace{" "}
          <code>TunerConstants.java</code> with the one you generate below.
        </p>
        <a
          href="https://github.com/Hemlock5712/Workshop-Code/archive/refs/tags/v3.0-swerve.zip"
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center px-6 py-3 border border-[var(--rule)] bg-[var(--bg2)] text-[var(--tx2)] hover:border-[var(--accent)] hover:text-[var(--accent)] rounded-lg transition-colors font-medium gap-2"
        >
          <Download className="w-5 h-5" />
          Download Swerve Project (v3.0, Commands v3)
        </a>
      </Box>

      {/* ── WHAT THE GENERATOR PRODUCES ──────────────────────────────── */}
      <LessonSection
        id="one-file-is-the-whole-output"
        title="One file is the whole output"
      >
        <p className="text-[15px] leading-relaxed" style={bodyStyle}>
          The generator can emit a complete project, but that is not how this
          workshop uses it. The only piece you keep is{" "}
          <code>src/main/java/frc/robot/generated/TunerConstants.java</code>.
          Everything else in the swerve project — the drivetrain class, the{" "}
          <code>Mechanism</code> that wraps it, the teleop controls, the
          telemetry — is code you already have and will read further down this
          page.
        </p>

        <p className="text-[15px] leading-relaxed" style={bodyStyle}>
          The copy checked into the workshop project is a placeholder for
          somebody else&apos;s robot. <code>DriveMechanism.java</code> says so
          in a comment right where it builds the drivetrain:{" "}
          <em>
            &quot;The checked-in file is an EXAMPLE with fake device IDs and
            gains - regenerate it from Tuner X for your own robot.&quot;
          </em>{" "}
          If you deploy it unchanged, the code will look for motors that are not
          on your bus.
        </p>

        <Box variant="concept" title="What lands in TunerConstants.java">
          <ul className="ml-4 list-disc space-y-1">
            <li>
              The CAN bus name, and one drive ID, steer ID and CANcoder ID per
              module — twelve device IDs in total, plus the Pigeon 2.
            </li>
            <li>
              <code>kDriveGearRatio</code> and <code>kSteerGearRatio</code>, and{" "}
              <code>kWheelRadius</code>.
            </li>
            <li>
              Each module&apos;s X and Y position from the center of the robot,
              which is what kinematics runs on.
            </li>
            <li>
              A CANcoder offset per module, measured with your wheels pointed
              straight.
            </li>
            <li>
              Starting <code>steerGains</code> and <code>driveGains</code>,{" "}
              <code>kSlipCurrent</code> and <code>kSpeedAt12Volts</code>. These
              are estimates. You measure the real ones on{" "}
              <Link href="/swerve-calibration" className={linkStyle}>
                Swerve Calibration
              </Link>
              .
            </li>
          </ul>
        </Box>

        <Box
          variant="alert-warning"
          tag="ABOUT TUNER X"
          title="No screenshots — look for the state, not the button"
        >
          <p>
            Tuner X moves its controls around between releases, so a labeled
            picture of this wizard goes stale within a season. What does not
            move is the <em>state</em> you are trying to reach. Every step below
            tells you what the screen should be showing when you have got it
            right, so you can find the control yourself and still know whether
            it worked.
          </p>
        </Box>
      </LessonSection>

      {/* ── STEPS ────────────────────────────────────────────────────── */}
      <LessonSection
        id="six-steps-in-this-order"
        title="Six steps, in this order"
      >
        <div className="flex flex-col gap-6">
          {/* 1 */}
          <div className="flex items-start gap-4">
            <div className="bg-[var(--accent)] text-[var(--accent-ink)] rounded-full w-8 h-8 flex items-center justify-center font-bold flex-shrink-0">
              1
            </div>
            <div className="flex-1">
              <h3
                className="text-lg font-semibold mb-2"
                style={{ color: "var(--fg)" }}
              >
                Get every device on the bus with a unique ID
              </h3>
              <p className="text-[15px] leading-relaxed" style={bodyStyle}>
                Power the robot, connect Tuner X, and look at the device list.
                All thirteen devices have to be on the same CAN bus: eight
                TalonFX, four CANcoders and one Pigeon 2. Assign IDs now and
                write them down module by module — you will type them into the
                generator in step 3, and a swapped pair is the single most
                common way this page goes wrong.
              </p>
              <p className="mt-2 text-[15px] leading-relaxed" style={bodyStyle}>
                <strong>You should see:</strong> thirteen devices listed, every
                ID different, no duplicate-ID warning and no red firmware
                badges. If a device is missing, it is a wiring or termination
                problem, and it will not become a software problem later — fix
                it here.
              </p>
            </div>
          </div>

          {/* 2 */}
          <div className="flex items-start gap-4">
            <div className="bg-[var(--accent)] text-[var(--accent-ink)] rounded-full w-8 h-8 flex items-center justify-center font-bold flex-shrink-0">
              2
            </div>
            <div className="flex-1">
              <h3
                className="text-lg font-semibold mb-2"
                style={{ color: "var(--fg)" }}
              >
                Open the swerve project generator
              </h3>
              <p className="text-[15px] leading-relaxed" style={bodyStyle}>
                It lives under <strong>Mechanisms</strong> in the left sidebar,
                behind a <strong>New Project</strong> button.
              </p>
              <p className="mt-2 text-[15px] leading-relaxed" style={bodyStyle}>
                <strong>You should see:</strong> a wizard that starts by asking
                for the robot&apos;s physical dimensions, not for code.
              </p>
            </div>
          </div>

          {/* 3 */}
          <div className="flex items-start gap-4">
            <div className="bg-[var(--accent)] text-[var(--accent-ink)] rounded-full w-8 h-8 flex items-center justify-center font-bold flex-shrink-0">
              3
            </div>
            <div className="flex-1">
              <h3
                className="text-lg font-semibold mb-2"
                style={{ color: "var(--fg)" }}
              >
                Measure the robot and enter the numbers
              </h3>
              <p className="text-[15px] leading-relaxed" style={bodyStyle}>
                Four measurements do all the work. Take them off the real robot
                with a tape measure, not off the CAD you meant to build.
              </p>
              <div
                className="mt-3 rounded-lg border p-4"
                style={{
                  borderColor: "var(--line)",
                  background: "var(--bg-elev)",
                }}
              >
                <ul className="space-y-2 text-[14px]" style={bodyStyle}>
                  <li>
                    <strong>Wheelbase</strong> — front-to-back distance between
                    module centers.
                  </li>
                  <li>
                    <strong>Trackwidth</strong> — side-to-side distance between
                    module centers.
                  </li>
                  <li>
                    <strong>Wheel diameter</strong> — of the tread that touches
                    the carpet, on a wheel that has been driven on.
                  </li>
                  <li>
                    <strong>Drive gear ratio</strong> — motor rotations per
                    wheel rotation, from your module&apos;s spec sheet.
                  </li>
                </ul>
              </div>
              <p className="mt-3 text-[15px] leading-relaxed" style={bodyStyle}>
                Wheelbase and trackwidth become each module&apos;s X and Y
                offset from the robot&apos;s center. The checked-in example is a
                square robot with all four modules 10 inches out in each
                direction, and a drive ratio of about 7.36:1 on a 2.167-inch
                wheel radius. Yours will differ.
              </p>
              <p className="mt-2 text-[15px] leading-relaxed" style={bodyStyle}>
                <strong>You should see:</strong> the wizard accept all four
                without complaint. Say the numbers back to yourself before you
                move on — wheelbase and trackwidth are the pair people swap, and
                on a square robot the swap is invisible until the robot turns
                and the modules fight each other.
              </p>
            </div>
          </div>

          {/* 4 */}
          <div className="flex items-start gap-4">
            <div className="bg-[var(--accent)] text-[var(--accent-ink)] rounded-full w-8 h-8 flex items-center justify-center font-bold flex-shrink-0">
              4
            </div>
            <div className="flex-1">
              <h3
                className="text-lg font-semibold mb-2"
                style={{ color: "var(--fg)" }}
              >
                Let the generator drive each module
              </h3>
              <p className="text-[15px] leading-relaxed" style={bodyStyle}>
                With the robot on blocks, the wizard works through the modules
                one at a time, driving each motor and checking what it sees. Two
                of the things it settles here end up in the file as pairs per
                corner: an inversion flag for the steer motor and the encoder,
                and a CANcoder offset measured with that wheel pointed straight.
                Physically hold the wheels straight when it asks, and take that
                part seriously — half a degree of error per module walks the
                robot sideways over a long drive.
              </p>
              <p className="mt-2 text-[15px] leading-relaxed" style={bodyStyle}>
                <strong>You should see:</strong> one module moving at a time,
                and it should be the corner the wizard named. If a different
                corner moves, two CAN IDs are swapped — go back to step 1 and
                fix the IDs rather than working around it here.
              </p>
            </div>
          </div>

          {/* 5 */}
          <div className="flex items-start gap-4">
            <div className="bg-[var(--accent)] text-[var(--accent-ink)] rounded-full w-8 h-8 flex items-center justify-center font-bold flex-shrink-0">
              5
            </div>
            <div className="flex-1">
              <h3
                className="text-lg font-semibold mb-2"
                style={{ color: "var(--fg)" }}
              >
                Generate the constants and swap the file in
              </h3>
              <p className="text-[15px] leading-relaxed" style={bodyStyle}>
                At the end of the wizard, generate the Tuner constants. Take the{" "}
                <code>TunerConstants.java</code> it writes and use it to replace{" "}
                <code>
                  src/main/java/frc/robot/generated/TunerConstants.java
                </code>{" "}
                in the workshop project. Replace the whole file — do not
                hand-merge fields, because the offsets, the inversions and the
                IDs all have to come from the same run.
              </p>
              <p className="mt-2 text-[15px] leading-relaxed" style={bodyStyle}>
                <strong>You should see:</strong> your own CAN IDs in the new
                file, and a <code>kCANBus</code> line naming your CANivore
                rather than the example&apos;s.
              </p>
            </div>
          </div>

          {/* 6 */}
          <div className="flex items-start gap-4">
            <div className="bg-[var(--accent)] text-[var(--accent-ink)] rounded-full w-8 h-8 flex items-center justify-center font-bold flex-shrink-0">
              6
            </div>
            <div className="flex-1">
              <h3
                className="text-lg font-semibold mb-2"
                style={{ color: "var(--fg)" }}
              >
                Set the team number and deploy
              </h3>
              <p className="text-[15px] leading-relaxed" style={bodyStyle}>
                Open <code>.wpilib/wpilib_preferences.json</code> and change{" "}
                <code>&quot;teamNumber&quot;</code> from <code>5712</code> to
                yours. Then deploy the way{" "}
                <Link href="/running-program" className={linkStyle}>
                  Running Your Code
                </Link>{" "}
                showed.
              </p>
              <p className="mt-2 text-[15px] leading-relaxed" style={bodyStyle}>
                <strong>You should see:</strong> the driver station listing{" "}
                <strong>Teleop</strong> as a mode you can select. Modules point
                straight when you enable, and nothing spins on its own.
              </p>
            </div>
          </div>
        </div>

        <DocumentationButton
          href="https://v6.docs.ctr-electronics.com/en/latest/docs/tuner/tuner-swerve/index.html"
          title="CTRE — Tuner X Swerve Project Generator"
          icon={<Book className="w-5 h-5" />}
        />
      </LessonSection>

      {/* ── THREE FILES ──────────────────────────────────────────────── */}
      <LessonSection
        id="three-files-and-why-there-have"
        title="Three files, and why there have to be three"
      >
        <p className="text-[15px] leading-relaxed" style={bodyStyle}>
          Every other mechanism you have written was one class. The drivetrain
          is three, and the reason is a Java rule you met on{" "}
          <Link href="/java-basics" className={linkStyle}>
            The Java You Need
          </Link>
          : a class can only <code>extend</code> one other class.
        </p>

        <p className="text-[15px] leading-relaxed" style={bodyStyle}>
          The generated drivetrain already extends CTRE&apos;s swerve class, so
          it cannot also extend <code>Mechanism</code>. The workshop code
          therefore keeps them apart: <code>CommandSwerveDrivetrain</code> owns
          the hardware, and a hand-written <code>DriveMechanism</code> owns it
          in turn and hands out commands. Its own comment puts it plainly:{" "}
          <em>
            &quot;The swerve drivetrain class already extends CTRE&apos;s
            generated class, and a Java class can only extend one thing. So this
            class owns the drivetrain and offers its commands to the rest of the
            robot.&quot;
          </em>
        </p>

        <div className="overflow-x-auto">
          <table className="w-full min-w-[560px] border-collapse text-[14px]">
            <thead>
              <tr>
                <th
                  className="border-b px-3 py-2 text-left font-semibold"
                  style={{ borderColor: "var(--line)", color: "var(--fg)" }}
                >
                  File
                </th>
                <th
                  className="border-b px-3 py-2 text-left font-semibold"
                  style={{ borderColor: "var(--line)", color: "var(--fg)" }}
                >
                  Who wrote it
                </th>
                <th
                  className="border-b px-3 py-2 text-left font-semibold"
                  style={{ borderColor: "var(--line)", color: "var(--fg)" }}
                >
                  What it is for
                </th>
              </tr>
            </thead>
            <tbody style={bodyStyle}>
              <tr>
                <td
                  className="border-b px-3 py-3 align-top"
                  style={{ borderColor: "var(--line-soft)" }}
                >
                  <code>TunerConstants.java</code>
                </td>
                <td
                  className="border-b px-3 py-3 align-top"
                  style={{ borderColor: "var(--line-soft)" }}
                >
                  Tuner X, from your measurements
                </td>
                <td
                  className="border-b px-3 py-3 align-top"
                  style={{ borderColor: "var(--line-soft)" }}
                >
                  Every number about your robot. Never edit by hand except when
                  calibration tells you to.
                </td>
              </tr>
              <tr>
                <td
                  className="border-b px-3 py-3 align-top"
                  style={{ borderColor: "var(--line-soft)" }}
                >
                  <code>CommandSwerveDrivetrain.java</code>
                </td>
                <td
                  className="border-b px-3 py-3 align-top"
                  style={{ borderColor: "var(--line-soft)" }}
                >
                  Tuner X, then lightly edited
                </td>
                <td
                  className="border-b px-3 py-3 align-top"
                  style={{ borderColor: "var(--line-soft)" }}
                >
                  Motors, odometry, the simulation thread, and keeping
                  &quot;forward&quot; matched to your alliance color.
                </td>
              </tr>
              <tr>
                <td
                  className="border-b px-3 py-3 align-top"
                  style={{ borderColor: "var(--line-soft)" }}
                >
                  <code>DriveMechanism.java</code>
                </td>
                <td
                  className="border-b px-3 py-3 align-top"
                  style={{ borderColor: "var(--line-soft)" }}
                >
                  The workshop, by hand
                </td>
                <td
                  className="border-b px-3 py-3 align-top"
                  style={{ borderColor: "var(--line-soft)" }}
                >
                  The <code>Mechanism</code>. Commands, pose readings, telemetry
                  registration. This is what an OpMode talks to.
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        <p className="text-[15px] leading-relaxed" style={bodyStyle}>
          <code>DriveMechanism</code> is the one to read closely — it is the
          only one of the three you would ever add to. Its public surface is
          small: <code>applyRequest(...)</code> and{" "}
          <code>seedFieldCentric()</code> return commands,{" "}
          <code>setControl(...)</code> sends one request straight through,{" "}
          <code>getPose()</code> and <code>getFieldVelocity()</code> read the
          drivetrain, and <code>addVisionMeasurement(...)</code> is the door the
          camera comes in through two lessons from now.
        </p>

        <GitHubContent
          repository="Hemlock5712/Workshop-Code"
          branch="1-Swerve"
          filePath="src/main/java/frc/robot/subsystems/DriveMechanism.java"
          title="DriveMechanism.java"
          description="The Mechanism wrapper. Everything the rest of the robot is allowed to ask the drivetrain to do."
        />

        <GitHubContent
          repository="Hemlock5712/Workshop-Code"
          branch="1-Swerve"
          filePath="src/main/java/frc/robot/subsystems/CommandSwerveDrivetrain.java"
          title="CommandSwerveDrivetrain.java"
          description="Generated by Tuner X. Read it once so it is not a black box, then leave it alone."
        />
      </LessonSection>

      {/* ── DEFAULT COMMAND ──────────────────────────────────────────── */}
      <LessonSection
        id="your-first-real-default-command"
        title="Your first real default command"
      >
        <p className="text-[15px] leading-relaxed" style={bodyStyle}>
          Back on{" "}
          <Link href="/chaining-commands" className={linkStyle}>
            Chaining Commands
          </Link>{" "}
          there was a loose end: when a group finishes and nothing else claims
          the mechanism, the motor keeps doing whatever it was last told to do.
          The arm and the flywheel never had a default command, so nothing took
          over. The drivetrain is where that changes, and it is the only place
          in the whole workshop code that calls <code>setDefaultCommand</code>.
        </p>

        <p className="text-[15px] leading-relaxed" style={bodyStyle}>
          Here is the whole of <code>TeleopOpMode</code>&apos;s constructor on
          the swerve branch:
        </p>

        <CodeBlock
          language="java"
          title="TeleopOpMode.java — the joystick drive, set as the default"
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

        <p className="text-[15px] leading-relaxed" style={bodyStyle}>
          Read the shape rather than the algebra. <code>applyRequest(...)</code>{" "}
          is an ordinary command factory — it builds a hold with{" "}
          <code>runRepeatedly</code>, exactly like <code>arm.runFast()</code>{" "}
          does:
        </p>

        <CodeBlock
          language="java"
          title="DriveMechanism.java — the factory being handed to setDefaultCommand"
          filename="src/main/java/frc/robot/subsystems/DriveMechanism.java"
          code={`/** Returns a command that keeps sending the given control request to the drivetrain. */
public Command applyRequest(Supplier<SwerveRequest> request) {
  return runRepeatedly(() -> drivetrain.setControl(request.get())).named("applyRequest");
}`}
        />

        <p className="text-[15px] leading-relaxed" style={bodyStyle}>
          So the default command is a hold that re-reads the sticks every loop
          and re-sends a fresh <code>FieldCentric</code> request. Let go of the
          sticks and it is still running — it is now asking for zero.
        </p>

        <Box
          variant="concept"
          title="A real default command versus idle()"
          icon={<Gamepad2 className="w-5 h-5" />}
        >
          <p>
            Every mechanism already has a default command. You saw it on{" "}
            <Link href="/adding-commands" className={linkStyle}>
              Commands
            </Link>
            : <code>Mechanism</code>&apos;s own constructor calls{" "}
            <code>setDefaultCommand(idle())</code>, and <code>idle()</code>{" "}
            parks at the lowest priority and sends <em>nothing at all</em>. It
            does not zero the last request, which is why canceling an arm
            command leaves the arm pushing.
          </p>
          <p className="mt-3">
            The drivetrain replaces that with a default that actually commands
            the hardware. The difference shows up the moment a command is
            canceled:
          </p>
          <ul className="ml-4 mt-3 list-disc space-y-2">
            <li>
              <strong>
                Arm, default is <code>idle()</code>:
              </strong>{" "}
              release the button and the last voltage stays latched. Something
              has to actively send zero, which is what <code>arm.stop()</code>{" "}
              is for.
            </li>
            <li>
              <strong>Drivetrain, default is the joystick drive:</strong>{" "}
              release the button and the joystick command comes straight back.
              Hands off the sticks means a request for zero speed, every loop.
              There is no <code>drivetrain.stop()</code> in the workshop code,
              and it is not needed.
            </li>
          </ul>
        </Box>

        <p className="text-[15px] leading-relaxed" style={bodyStyle}>
          That is the property every later page leans on. When Drive to Point
          takes the drivetrain to run an automatic move, the driver gets control
          back the instant that command ends — not because anything cleaned up,
          but because the default underneath was never anything else.
        </p>

        <Box
          variant="alert-info"
          tag="NOTE · SCOPE"
          title="Why the default is set in the OpMode, not in Robot"
        >
          <p>
            <code>setDefaultCommand</code> makes a binding, and bindings are
            scoped to wherever you make them — the same rule{" "}
            <Link href="/triggers" className={linkStyle}>
              Triggers
            </Link>{" "}
            taught for buttons. Make it in an OpMode constructor and it belongs
            to that OpMode; switch modes and it goes away with the rest of that
            OpMode&apos;s bindings.
          </p>
          <p className="mt-3">
            That is exactly what you want here. The file&apos;s own javadoc says
            why:{" "}
            <em>
              &quot;The joystick-drive default command lives here, not in Robot,
              because it needs this OpMode&apos;s controller.&quot;
            </em>{" "}
            An autonomous OpMode has no controller and no business inheriting a
            stick-driven default.
          </p>
          <p className="mt-3">
            Defaults stack, and the most recent one wins. The constructor&apos;s{" "}
            <code>idle()</code> is underneath the whole time; teleop puts the
            joystick drive on top; end teleop and <code>idle()</code> is what is
            left.
          </p>
        </Box>

        <Box
          variant="alert-warning"
          tag="WATCH OUT"
          title="Two rules the scheduler enforces at runtime"
        >
          <p>
            A default command must require the mechanism it is the default for,
            and it must not require any other mechanism. Break either one and
            you get an <code>IllegalArgumentException</code> the moment the line
            runs — not a compile error, so it lands as a crash on the driver
            station.
          </p>
          <p className="mt-3">
            Commands built by <code>drivetrain.applyRequest(...)</code> satisfy
            both by construction: a factory on a <code>Mechanism</code> requires
            that mechanism and nothing else. You hit this rule when you try to
            make a hand-built group the default.
          </p>
        </Box>

        <GitHubContent
          repository="Hemlock5712/Workshop-Code"
          branch="1-Swerve"
          filePath="src/main/java/frc/robot/opmodes/TeleopOpMode.java"
          title="TeleopOpMode.java"
          description="The full file: the speed limits, the FieldCentric request with its deadbands, and the two bindings above."
        />

        <p className="text-[15px] leading-relaxed" style={bodyStyle}>
          Two details in that file worth noticing. <code>maxSpeed</code> is read
          straight out of <code>TunerConstants.kSpeedAt12Volts</code>, so full
          stick means the top speed the constants claim your robot has — which
          is one more reason to measure that number rather than guess it. And
          the request ships as <code>DriveRequestType.OpenLoopVoltage</code>:
          stick position becomes volts, with no wheel-speed loop. Both of those
          are calibration work, on the next-but-one page.
        </p>
      </LessonSection>

      {/* ── SEEDING ──────────────────────────────────────────────────── */}
      <LessonSection
        id="the-left-bumper-and-what-it"
        title="The left bumper, and what it does not do"
      >
        <p className="text-[15px] leading-relaxed" style={bodyStyle}>
          The other binding in that constructor is{" "}
          <code>driver.leftBumper().onTrue(drivetrain.seedFieldCentric())</code>
          . Press it and whatever way the robot is facing becomes the new
          &quot;forward&quot; for the sticks. You will use it constantly while
          testing, because field-centric driving is unusable if the code&apos;s
          idea of forward and yours disagree.
        </p>

        <Box
          variant="alert-warning"
          tag="COMMON MIX-UP"
          title="Seeding the heading is not resetting the pose"
          icon={<MapPin className="w-5 h-5" />}
        >
          <p>
            <code>seedFieldCentric()</code> changes a heading reference and
            nothing else. It never supplies an x or a y, so it does not tell the
            robot where it is on the field. Those are separate operations with
            separate methods, and confusing them produces a robot that drives
            beautifully and has no idea where it is.
          </p>
          <p className="mt-3">
            <Link href="/swerve-calibration#seeding" className={linkStyle}>
              Swerve Calibration lays the three of them out side by side
            </Link>{" "}
            — <code>seedFieldCentric()</code>,{" "}
            <code>applyOperatorPerspective()</code> and{" "}
            <code>resetPose(Pose2d)</code>. Read that section before you start
            trusting <code>getPose()</code> for anything.
          </p>
        </Box>
      </LessonSection>

      {/* ── DID IT WORK ──────────────────────────────────────────────── */}
      <LessonSection id="did-it-work" title="Did it work?">
        <p className="text-[15px] leading-relaxed" style={bodyStyle}>
          Robot on blocks for the first three checks, then on the floor with
          plenty of room. Keep a hand on the disable.
        </p>

        <ol
          className="ml-5 list-decimal space-y-3 text-[15px] leading-relaxed"
          style={bodyStyle}
        >
          <li>
            Select <strong>Teleop</strong> and enable, hands off the controller.{" "}
            <strong>You should see:</strong> all four wheels stationary and all
            four modules holding whatever angle they were already at. Any
            creeping means a stick is not centered or the deadband is wrong.
          </li>
          <li>
            Push the left stick straight forward.{" "}
            <strong>You should see:</strong> all four modules point the same way
            and all four wheels turn in the same direction. One wheel spinning
            backwards is an inversion answer given during the generator&apos;s
            module test; one module facing sideways is a CANcoder offset.
          </li>
          <li>
            Push the right stick sideways. <strong>You should see:</strong> the
            four modules splay into a rotation pattern, each one tangent to a
            circle around the robot&apos;s center.
          </li>
          <li>
            Put the robot on the floor, point it away from you, and push the
            left stick forward. <strong>You should see:</strong> it drives away
            from you in a straight line.
          </li>
          <li>
            Now turn the robot 90° in place with the right stick, then push the
            left stick forward again. <strong>You should see:</strong> the robot
            still travels in the same direction across the floor as it did the
            first time, even though it is now pointing sideways. That is
            field-centric driving working.
          </li>
          <li>
            Press the left bumper, then push the left stick forward.{" "}
            <strong>You should see:</strong> &quot;forward&quot; is now whatever
            way the robot was pointing when you pressed it.
          </li>
          <li>
            Release everything. <strong>You should see:</strong> the robot stop
            immediately and stay stopped. That is the default command asking for
            zero — not the absence of a command.
          </li>
        </ol>

        <Box
          variant="alert-info"
          tag="IF IT DIDN'T WORK"
          title="Three things that go wrong here"
        >
          <ul className="ml-4 list-disc space-y-2">
            <li>
              <strong>
                The code deploys, then the driver station reports a device that
                cannot be found.
              </strong>{" "}
              You deployed with the example <code>TunerConstants.java</code>{" "}
              still in place, or you copied your generated file to the wrong
              path. It has to land at{" "}
              <code>src/main/java/frc/robot/generated/TunerConstants.java</code>
              , and the <code>kCANBus</code> name in it has to match your
              CANivore.
            </li>
            <li>
              <strong>
                One module drives the wrong way, or spins in place while the
                other three go straight.
              </strong>{" "}
              An inversion or an offset for that corner is wrong. Do not patch
              it by hand in the file — re-run the generator&apos;s module test
              for that module, because inversion and offset are measured
              together and a hand-edited pair will disagree.
            </li>
            <li>
              <strong>
                Nothing moves at all, and the driver station shows no error.
              </strong>{" "}
              Check that <strong>Teleop</strong> is actually the selected mode
              and that the robot is enabled. If both are right, the{" "}
              <code>setDefaultCommand</code> line is missing or commented out.
              With only <code>idle()</code> underneath, the drivetrain sits
              there sending nothing — which looks identical to broken wiring and
              is not.
            </li>
          </ul>
        </Box>
      </LessonSection>

      <AlphaStatusNote />

      <Quiz
        title="Knowledge Check"
        questions={[
          {
            id: 1,
            question:
              "Why is the drivetrain split into CommandSwerveDrivetrain and DriveMechanism instead of being one class?",
            options: [
              "To keep generated code and hand-written code in separate folders",
              "CommandSwerveDrivetrain already extends CTRE's generated swerve class, and a Java class can only extend one thing — so it cannot also extend Mechanism",
              "Mechanism does not work with swerve drivetrains",
              "So the drivetrain can be used without the command framework",
            ],
            correctAnswer: 1,
            explanation:
              "CommandSwerveDrivetrain extends TunerSwerveDrivetrain, and Java allows only one superclass. DriveMechanism extends Mechanism, owns a CommandSwerveDrivetrain as a field, and offers its commands to the rest of the robot. The file's own comment says exactly this.",
          },
          {
            id: 2,
            question:
              "You finish the Tuner X wizard. Which file do you take back to the workshop project?",
            options: [
              "CommandSwerveDrivetrain.java",
              "DriveMechanism.java",
              "TunerConstants.java",
              "All of the generated project, replacing what you had",
            ],
            correctAnswer: 2,
            explanation:
              "TunerConstants.java is the only output you keep. It holds your CAN IDs, gear ratios, wheel radius, module positions, CANcoder offsets and starting gains. Everything else in the swerve project is already written.",
          },
          {
            id: 3,
            question:
              "The arm's default command is idle(). The drivetrain's is the joystick drive. What is the practical difference when a command on each one is canceled?",
            options: [
              "None — canceling always stops the motors",
              "idle() zeroes the output; the joystick drive holds the last request",
              "idle() sends nothing at all, so the arm keeps applying its last voltage; the joystick drive keeps commanding, so hands-off sticks mean a request for zero speed",
              "The drivetrain refuses the cancellation until the driver presses a button",
            ],
            correctAnswer: 2,
            explanation:
              "idle() parks at the lowest priority and issues no output — it does not zero the last request, which is why arm.stop() has to exist. The drivetrain's default is a real command that re-reads the sticks every loop, so centered sticks are an active request for zero.",
          },
          {
            id: 4,
            question:
              "Why is setDefaultCommand called in TeleopOpMode's constructor rather than in Robot's?",
            options: [
              "Robot runs too early for the scheduler to accept it",
              "The default command needs this OpMode's controller, and an OpMode's bindings are scoped to it — an autonomous mode should not inherit a stick-driven default",
              "A default command can only be set on a mechanism that is already running a command",
              "It is a style preference; either location behaves identically",
            ],
            correctAnswer: 1,
            explanation:
              "setDefaultCommand creates a binding scoped where you make it, the same as a button binding. TeleopOpMode's javadoc states the reason: the joystick-drive default lives there because it needs that OpMode's controller. Switch modes and it goes away, leaving the constructor-supplied idle() underneath.",
          },
          {
            id: 5,
            question:
              "Which command is a legal default command for the drivetrain?",
            options: [
              "Any command at all — the scheduler does not check",
              "One that requires the drivetrain and nothing else",
              "One that requires no mechanisms, so it can never conflict",
              "One that requires the drivetrain plus every mechanism it might interrupt",
            ],
            correctAnswer: 1,
            explanation:
              "The scheduler throws IllegalArgumentException if a default command does not require its mechanism, and again if it requires more than one. Commands built by drivetrain.applyRequest(...) satisfy both automatically, because a factory on a Mechanism requires that mechanism alone.",
          },
          {
            id: 6,
            question:
              "You press the left bumper, which runs seedFieldCentric(). What changed?",
            options: [
              "The robot's x and y on the field are now zero",
              "Which direction the driver's sticks call forward — and nothing about where the robot is",
              "The CANcoder offsets stored in TunerConstants.java",
              "The top speed the drivetrain is allowed to command",
            ],
            correctAnswer: 1,
            explanation:
              "seedFieldCentric() is a heading reference and nothing else. It never supplies an x or a y. Setting a real field position is resetPose(Pose2d), a different method — the Swerve Calibration page compares all three operations side by side.",
          },
        ]}
      />

      {/* ── WHAT'S NEXT ──────────────────────────────────────────────── */}
      <LessonSection id="what-s-next" title="What's next">
        <Box variant="alert-success" title="Up next: Logging">
          <p>
            You have a robot that drives, built on constants you have not
            measured yet. Before you measure them, turn on logging — several of
            the calibration steps work by driving the robot, stopping, and
            reading a number out of the log afterward. That is not something you
            can do by watching.
          </p>
          <p className="mt-3">
            <strong>Logging</strong> is two lines in <code>Robot</code>&apos;s
            constructor and a look at what the drivetrain is already publishing.
            Then <strong>Swerve Calibration</strong> replaces the example
            numbers in <code>TunerConstants.java</code> with measurements off
            your own robot.
          </p>
        </Box>
      </LessonSection>
    </PageTemplate>
  );
}
