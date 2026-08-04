import PageTemplate from "@/components/PageTemplate";
import LessonSection from "@/components/lesson/LessonSection";
import { Book, Cpu, Zap, Code, Gauge, Settings } from "lucide-react";

// No previousPage/nextPage on the PageTemplate below: the glossary is
// reference material, not a step in the lesson sequence. Hard-coding them
// spliced it between / and /introduction, which lessons.ts knows nothing
// about, so /introduction's Previous link pointed straight past it.
export default function Glossary() {
  return (
    <PageTemplate title="Glossary of Terms">
      <div className="bg-[var(--bg2)] border-l-4 border-[var(--accent)] p-6 mb-8">
        <p className="text-lg font-medium text-[var(--accent)] mb-2 flex items-center gap-2">
          <Book className="w-5 h-5" />
          About This Glossary
        </p>
        <p className="text-[var(--accent)]">
          New to FRC programming? This glossary explains the technical terms
          used throughout the workshop in plain language. Each term gets a
          simple definition and, where helpful, a real-world analogy.
        </p>
      </div>

      {/* Hardware & Electronics Terms */}
      <LessonSection
        id="hardware-electronics"
        title={
          <>
            <Cpu className="w-8 h-8 text-[var(--accent)]" />
            Hardware & Electronics
          </>
        }
        outlineLabel="Hardware & Electronics"
        className="mb-8"
      >
        <div className="grid grid-cols-[minmax(0,1fr)] gap-4">
          <div
            id="motor-controller"
            className="min-w-0 bg-[var(--bg2)] rounded-lg p-6 border border-[var(--rule)] scroll-mt-24"
          >
            <h3 className="display m-0 mb-2 text-lede">Motor Controller</h3>
            <p className="text-[var(--tx2)] mb-2">
              <strong>Simple:</strong> A smart device that controls how a motor
              spins. Think of it like a dimmer switch for lights, but much
              smarter: it can control speed, direction, and precisely how far
              the motor turns.
            </p>
            <p className="text-[var(--tx2)]">
              <strong>Technical:</strong> An electronic device that manages
              power delivery to a motor while monitoring performance metrics
              like position, velocity, and current draw.
            </p>
          </div>

          <div
            id="talonfx"
            className="min-w-0 bg-[var(--bg2)] rounded-lg p-6 border border-[var(--rule)] scroll-mt-24"
          >
            <h3 className="display m-0 mb-2 text-lede">TalonFX / Kraken X44</h3>
            <p className="text-[var(--tx2)] mb-2">
              <strong>Simple:</strong> A specific type of motor controller made
              by CTRE. The Kraken X44 is a motor with a TalonFX controller built
              right into it, like having an engine and transmission in one
              package.
            </p>
            <p className="text-[var(--tx2)]">
              <strong>Technical:</strong> CTRE&apos;s integrated brushless motor
              and motor controller unit featuring built-in FOC control, 1kHz PID
              loops, and CAN bus communication.
            </p>
          </div>

          <div
            id="encoder"
            className="min-w-0 bg-[var(--bg2)] rounded-lg p-6 border border-[var(--rule)] scroll-mt-24"
          >
            <h3 className="display m-0 mb-2 text-lede">Encoder</h3>
            <p className="text-[var(--tx2)] mb-2">
              <strong>Simple:</strong> A sensor that measures how far and how
              fast a motor has turned. Like a speedometer and odometer combined,
              but for motors instead of cars.
            </p>
            <p className="text-[var(--tx2)] mb-2">
              <strong>Real-world analogy:</strong> Imagine trying to park a car
              blindfolded. An encoder is like opening your eyes so you can see
              exactly where you are and how fast you&apos;re moving.
            </p>
            <p className="text-[var(--tx2)]">
              <strong>Technical:</strong> A rotary position sensor that provides
              feedback on shaft rotation, measured in rotations, degrees, or
              encoder ticks.
            </p>
          </div>

          <div
            id="cancoder"
            className="min-w-0 bg-[var(--bg2)] rounded-lg p-6 border border-[var(--rule)] scroll-mt-24"
          >
            <h3 className="display m-0 mb-2 text-lede">CANcoder</h3>
            <p className="text-[var(--tx2)] mb-2">
              <strong>Simple:</strong> A standalone encoder that connects to the
              CAN bus. Unlike encoders built into motors, you can mount this
              anywhere to measure rotation of wheels, arms, or other mechanisms.
            </p>
            <p className="text-[var(--tx2)]">
              <strong>Technical:</strong> CTRE&apos;s absolute magnetic encoder
              that communicates over CAN bus, providing persistent position
              measurement even after power cycles.
            </p>
          </div>

          <div
            id="canivore"
            className="min-w-0 bg-[var(--bg2)] rounded-lg p-6 border border-[var(--rule)] scroll-mt-24"
          >
            <h3 className="display m-0 mb-2 text-lede">CANivore</h3>
            <p className="text-[var(--tx2)] mb-2">
              <strong>Simple:</strong> A device that creates a high-speed
              network for your robot&apos;s motors and sensors to talk to each
              other. Like a super-fast Wi-Fi router, but for robot parts instead
              of computers. It increases the refresh rate of motors from 50 Hz
              to 250 Hz, giving you more accurate odometry.
            </p>
            <p className="text-[var(--tx2)]">
              <strong>Technical:</strong> A USB-to-CAN FD interface that
              provides an additional CAN bus network with higher bandwidth and
              lower latency than the roboRIO&apos;s built-in CAN bus.
            </p>
          </div>

          <div
            id="phoenix-6"
            className="min-w-0 bg-[var(--bg2)] rounded-lg p-6 border border-[var(--rule)] scroll-mt-24"
          >
            <h3 className="display m-0 mb-2 text-lede">Phoenix 6</h3>
            <p className="text-[var(--tx2)] mb-2">
              <strong>Simple:</strong> The latest software library from CTRE for
              controlling their motors and sensors. It&apos;s the
              &quot;language&quot; your code uses to talk to TalonFXs and
              CANcoders.
            </p>
            <p className="text-[var(--tx2)]">
              <strong>Technical:</strong> CTRE&apos;s API for communicating with
              v6 firmware devices, offering improved performance, FOC support,
              and simplified licensing compared to Phoenix 5.
            </p>
          </div>

          <div
            id="can-bus"
            className="min-w-0 bg-[var(--bg2)] rounded-lg p-6 border border-[var(--rule)] scroll-mt-24"
          >
            <h3 className="display m-0 mb-2 text-lede">CAN Bus</h3>
            <p className="text-[var(--tx2)] mb-2">
              <strong>Simple:</strong> The communication network that connects
              motors, sensors, and the robot brain (roboRIO). Like a telephone
              line that lets all robot parts talk to each other using the same
              wire.
            </p>
            <p className="text-[var(--tx2)]">
              <strong>Technical:</strong> Controller Area Network, a
              communication protocol that allows multiple devices to communicate
              over a shared bus using unique device IDs.
            </p>
          </div>

          <div
            id="device-id"
            className="min-w-0 bg-[var(--bg2)] rounded-lg p-6 border border-[var(--rule)] scroll-mt-24"
          >
            <h3 className="display m-0 mb-2 text-lede">Device ID</h3>
            <p className="text-[var(--tx2)] mb-2">
              <strong>Simple:</strong> A unique number (like a name tag) given
              to each motor or sensor so your code knows which one to control.
            </p>
            <p className="text-[var(--tx2)]">
              <strong>Technical:</strong> A unique integer identifier (typically
              1-62) assigned to each CAN device for addressing and communication
              on the network.
            </p>
          </div>

          <div
            id="roborio"
            className="min-w-0 bg-[var(--bg2)] rounded-lg p-6 border border-[var(--rule)] scroll-mt-24"
          >
            <h3 className="display m-0 mb-2 text-lede">roboRIO</h3>
            <p className="text-[var(--tx2)] mb-2">
              <strong>Simple:</strong> The &quot;brain&quot; of your robot.
              It&apos;s a small computer that runs your code and tells all the
              motors and sensors what to do.
            </p>
            <p className="text-[var(--tx2)]">
              <strong>Technical:</strong> National Instruments&apos; embedded
              controller designed for FRC, running a real-time Linux operating
              system and WPILib framework. Note: the WPILib 2027 stack this
              workshop targets deploys to <strong>SystemCore</strong>, the
              roboRIO&apos;s successor, instead.
            </p>
          </div>

          <div
            id="swerve-drive"
            className="min-w-0 bg-[var(--bg2)] rounded-lg p-6 border border-[var(--rule)] scroll-mt-24"
          >
            <h3 className="display m-0 mb-2 text-lede">Swerve Drive</h3>
            <p className="text-[var(--tx2)] mb-2">
              <strong>Simple:</strong> A drivetrain where every wheel can both
              spin and steer on its own. The robot can drive any direction while
              rotating, like a shopping cart where all four wheels steer.
            </p>
            <p className="text-[var(--tx2)]">
              <strong>Technical:</strong> Four independent modules, each with a
              drive motor and a steering motor. The workshop uses CTRE&apos;s
              generated swerve code wrapped in a hand-written{" "}
              <code>DriveMechanism</code>. Covered in Workshop #2.
            </p>
          </div>
        </div>
      </LessonSection>

      {/* Programming Concepts */}
      <LessonSection
        id="programming-concepts"
        title={
          <>
            <Code className="w-8 h-8 text-[var(--ok)]" />
            Programming Concepts
          </>
        }
        outlineLabel="Programming Concepts"
        className="mb-8"
      >
        <div className="grid grid-cols-[minmax(0,1fr)] gap-4">
          <div
            id="subsystem"
            className="min-w-0 bg-[var(--bg2)] rounded-lg p-6 border border-[var(--rule)] scroll-mt-24"
          >
            <h3 className="display m-0 mb-2 text-lede">Subsystem</h3>
            <p className="text-[var(--tx2)] mb-2">
              <strong>Simple:</strong> A section of code that represents one
              physical part of your robot (like an arm, shooter, or drivetrain).
              It knows how to control its motors and read its sensors.
            </p>
            <p className="text-[var(--tx2)] mb-2">
              <strong>Real-world analogy:</strong> Think of your robot like a
              human body. The arm subsystem is like your actual arm: it knows
              how to move, knows where it is, and has specific jobs it can do.
            </p>
            <p className="text-[var(--tx2)]">
              <strong>Technical:</strong> In Commands v3 (WPILib 2027) this is
              called a <strong>Mechanism</strong>: a class you extend that owns
              hardware (motors, sensors) and exposes commands.
            </p>
          </div>

          <div
            id="command"
            className="min-w-0 bg-[var(--bg2)] rounded-lg p-6 border border-[var(--rule)] scroll-mt-24"
          >
            <h3 className="display m-0 mb-2 text-lede">Command</h3>
            <p className="text-[var(--tx2)] mb-2">
              <strong>Simple:</strong> An action your robot performs, like
              &quot;raise arm&quot; or &quot;shoot ball&quot;. Commands use
              subsystems to get things done.
            </p>
            <p className="text-[var(--tx2)] mb-2">
              <strong>Real-world analogy:</strong> If subsystems are body parts,
              commands are actions. &quot;Raise arm&quot; is a command that
              tells the arm subsystem what to do, just like your brain tells
              your arm to pick up a cup.
            </p>
            <p className="text-[var(--tx2)]">
              <strong>Technical:</strong> A schedulable unit of robot behavior
              that declares its mechanism requirements, built from a mechanism
              factory and finished with <code>.named(&quot;...&quot;)</code>.
              Most commands on this team are <strong>holds</strong> (
              <code>runRepeatedly</code> re-sending a setpoint). A step-by-step
              initialize / execute / isFinished / end lifecycle is also
              available by extending <code>ClassicCommand</code>, and advanced
              routines can be a single coroutine body via{" "}
              <code>mechanism.run(coroutine -&gt; ...)</code>.
            </p>
          </div>

          <div
            id="trigger"
            className="min-w-0 bg-[var(--bg2)] rounded-lg p-6 border border-[var(--rule)] scroll-mt-24"
          >
            <h3 className="display m-0 mb-2 text-lede">Trigger</h3>
            <p className="text-[var(--tx2)] mb-2">
              <strong>Simple:</strong> A connection between a button press (or
              sensor reading) and a command. When you press button A, the
              trigger runs a specific command.
            </p>
            <p className="text-[var(--tx2)] mb-2">
              <strong>Real-world analogy:</strong> Like a light switch: when you
              flip it (trigger), the light turns on (command runs). The switch
              doesn&apos;t create light itself, it just tells the light what to
              do.
            </p>
            <p className="text-[var(--tx2)]">
              <strong>Technical:</strong> A boolean condition (from buttons,
              sensors, or custom logic) that schedules commands when its state
              changes. <code>whileTrue()</code> is the everyday method: it runs
              a hold while the condition is true and hands the mechanism back to
              its default command when it goes false. <code>onTrue()</code>{" "}
              fires once, for self-finishing commands.
            </p>
          </div>

          <div
            id="command-based"
            className="min-w-0 bg-[var(--bg2)] rounded-lg p-6 border border-[var(--rule)] scroll-mt-24"
          >
            <h3 className="display m-0 mb-2 text-lede">
              Command-Based Programming
            </h3>
            <p className="text-[var(--tx2)] mb-2">
              <strong>Simple:</strong> The main way FRC teams organize robot
              code. You divide your robot into subsystems (parts), create
              commands (actions), and use triggers (buttons) to make things
              happen.
            </p>
            <p className="text-[var(--tx2)]">
              <strong>Technical:</strong> WPILib&apos;s design pattern
              organizing code into subsystems, commands, and triggers, providing
              clear separation of concerns and automatic scheduling/conflict
              resolution.
            </p>
          </div>

          <div
            id="command-swerve-drivetrain"
            className="min-w-0 bg-[var(--bg2)] rounded-lg p-6 border border-[var(--rule)] scroll-mt-24"
          >
            <h3 className="display m-0 mb-2 text-lede">
              CommandSwerveDrivetrain
            </h3>
            <p className="text-[var(--tx2)] mb-2">
              <strong>Simple:</strong> A special class generated by Phoenix
              Tuner X that handles all the complex math for swerve drive. It
              connects CTRE&apos;s swerve logic with WPILib&apos;s command-based
              structure.
            </p>
            <p className="text-[var(--tx2)]">
              <strong>Technical:</strong> A generated class that extends
              CTRE&apos;s SwerveDrivetrain. In the v3 template it isn&apos;t a
              Mechanism itself. A hand-written <code>DriveMechanism</code>{" "}
              (extends Mechanism) wraps it and exposes the drive commands to
              command-based code.
            </p>
          </div>

          <div
            id="periodic"
            className="min-w-0 bg-[var(--bg2)] rounded-lg p-6 border border-[var(--rule)] scroll-mt-24"
          >
            <h3 className="display m-0 mb-2 text-lede">Periodic Method</h3>
            <p className="text-[var(--tx2)] mb-2">
              <strong>Simple:</strong> Code that runs automatically every 20
              milliseconds (50 times per second). Used for displaying data or
              monitoring sensors, NOT for controlling motors directly.
            </p>
            <p className="text-[var(--tx2)]">
              <strong>Technical:</strong> A callback the scheduler runs every
              robot loop (20ms) for telemetry/monitoring. Commands v3 mechanisms
              don&apos;t have a <code>periodic()</code> method. Use a{" "}
              <code>runRepeatedly(...)</code> default command, or register a
              callback with <code>Scheduler.getDefault().addPeriodic(...)</code>
              .
            </p>
          </div>

          <div
            id="mechanism"
            className="min-w-0 bg-[var(--bg2)] rounded-lg p-6 border border-[var(--rule)] scroll-mt-24"
          >
            <h3 className="display m-0 mb-2 text-lede">Mechanism</h3>
            <p className="text-[var(--tx2)] mb-2">
              <strong>Simple:</strong> The Commands v3 (WPILib 2027) name for a
              subsystem: one physical part of the robot (arm, flywheel,
              drivetrain). It owns the hardware and hands out commands.
            </p>
            <p className="text-[var(--tx2)]">
              <strong>Technical:</strong> A base class you extend (
              <code>extends Mechanism</code>). It supplies command factories (
              <code>run</code>, <code>runRepeatedly</code>, <code>idle</code>)
              and automatically holds a low-priority idle default command until
              something else commands it.
            </p>
          </div>

          <div
            id="opmode"
            className="min-w-0 bg-[var(--bg2)] rounded-lg p-6 border border-[var(--rule)] scroll-mt-24"
          >
            <h3 className="display m-0 mb-2 text-lede">OpMode</h3>
            <p className="text-[var(--tx2)] mb-2">
              <strong>Simple:</strong> A &quot;mode&quot; the robot can be in:
              driver teleop, an autonomous routine, or a calibration task. Each
              one is its own class, and the driver station lists them by name.
              The Commands v3 stack organizes robot setup around OpModes.
            </p>
            <p className="text-[var(--tx2)]">
              <strong>Technical:</strong> A class extending{" "}
              <code>PeriodicOpMode</code> tagged <code>@Teleop</code>,{" "}
              <code>@Autonomous</code>, or <code>@Utility</code>. Selecting it
              constructs it (building its button bindings); switching away tears
              it down.
            </p>
          </div>

          <div
            id="coroutine"
            className="min-w-0 bg-[var(--bg2)] rounded-lg p-6 border border-[var(--rule)] scroll-mt-24"
          >
            <h3 className="display m-0 mb-2 text-lede">Coroutine</h3>
            <p className="text-[var(--tx2)] mb-2">
              <strong>Simple:</strong> The thing that lets a Commands v3 command
              body pause and resume. Inside a command you call{" "}
              <code>coroutine.wait(...)</code>, <code>waitUntil(...)</code>, or{" "}
              <code>await(...)</code> to pause until something happens. Then the
              code keeps going from where it left off.
            </p>
            <p className="text-[var(--tx2)]">
              <strong>Technical:</strong> The <code>Coroutine</code> handle
              passed to a command body. It lets a single method suspend at{" "}
              <code>yield</code>/<code>wait</code>/<code>waitUntil</code>/
              <code>await</code>/<code>park</code>/<code>fork</code> and resume
              on a later scheduler tick, so the whole command reads as one
              straight-line method. On this team it&apos;s an optional advanced
              dialect; everyday robot code uses holds and chaining instead.
            </p>
          </div>

          <div
            id="hold"
            className="min-w-0 bg-[var(--bg2)] rounded-lg p-6 border border-[var(--rule)] scroll-mt-24"
          >
            <h3 className="display m-0 mb-2 text-lede">Hold</h3>
            <p className="text-[var(--tx2)] mb-2">
              <strong>Simple:</strong> A command that takes a mechanism to a
              setpoint and <em>stays there</em>: hold a button (
              <code>whileTrue</code>) and the arm goes to the scoring angle and
              keeps fighting gravity; let go and the default command comes back.
              Almost every mechanism command in this workshop is a hold.
            </p>
            <p className="text-[var(--tx2)] mb-2">
              <strong>The one rule:</strong> a hold never finishes, so nothing
              may ever wait on a hold. A bare hold inside{" "}
              <code>Command.sequence</code> sticks there forever. Every hold is
              named with a <code>(hold)</code> suffix so a stuck routine is
              visible on the dashboard.
            </p>
            <p className="text-[var(--tx2)]">
              <strong>Technical:</strong>{" "}
              <code>
                runRepeatedly(() -&gt; setPosition(TARGET)).named(&quot;target
                (hold)&quot;)
              </code>{" "}
              — the closed-loop request is re-sent every scheduler tick. Give a
              hold a finish line at the call site with{" "}
              <code>.until(mech::isAtTarget)</code>; never bake an{" "}
              <code>...AndWait</code> variant into the mechanism.
            </p>
          </div>

          <div
            id="chaining"
            className="min-w-0 bg-[var(--bg2)] rounded-lg p-6 border border-[var(--rule)] scroll-mt-24"
          >
            <h3 className="display m-0 mb-2 text-lede">Chaining</h3>
            <p className="text-[var(--tx2)] mb-2">
              <strong>Simple:</strong> Building a routine (like an auto) by
              snapping commands together, one after another. This is the
              team&apos;s recommended style, as far as most routines ever need
              to go.
            </p>
            <p className="text-[var(--tx2)]">
              <strong>Technical:</strong> Three tools:{" "}
              <code>Command.sequence(...)</code> for steps that finish on their
              own, <code>.until(mech::isAtTarget)</code> to give a hold a finish
              line at the call site, and <code>Command.race(step, hold)</code>{" "}
              for &quot;do this step WHILE holding&quot; (the hold never
              finishes, so the step always decides).{" "}
              <code>.withTimeout(...)</code> is the seatbelt so an auto never
              burns the period stuck at a setpoint. Reference:{" "}
              <code>DriveStowDriveChainedOpMode.java</code> in the
              2027-Template.
            </p>
          </div>

          <div
            id="state-machine"
            className="min-w-0 bg-[var(--bg2)] rounded-lg p-6 border border-[var(--rule)] scroll-mt-24"
          >
            <h3 className="display m-0 mb-2 text-lede">StateMachine</h3>
            <p className="text-[var(--tx2)] mb-2">
              <strong>Simple:</strong> An optional, advanced way to organize
              robot behavior where the robot is always in exactly one named
              state (stowed, pickup, scoring…) and buttons or sensors move it
              between states. Illegal jumps can&apos;t happen because no
              transition was declared for them.
            </p>
            <p className="text-[var(--tx2)]">
              <strong>Technical:</strong>{" "}
              <code>org.wpilib.command3.StateMachine</code>, shipped in WPILib
              2027 alpha-6. Each state owns a command (typically one of the
              mechanism&apos;s holds); transitions are declared with{" "}
              <code>when(...)</code> (checked every tick) or{" "}
              <code>whenComplete()</code> (for self-finishing state commands).
              See the State Machines lesson and{" "}
              <code>StateMachineTeleop.java</code> in the 2027-Template.
            </p>
          </div>
        </div>
      </LessonSection>

      {/* Control Theory */}
      <LessonSection
        id="control-theory"
        title={
          <>
            <Gauge className="w-8 h-8 text-[var(--accent)]" />
            Control Theory
          </>
        }
        outlineLabel="Control Theory"
        className="mb-8"
      >
        <div className="grid grid-cols-[minmax(0,1fr)] gap-4">
          <div
            id="pid"
            className="min-w-0 bg-[var(--bg2)] rounded-lg p-6 border border-[var(--rule)] scroll-mt-24"
          >
            <h3 className="display m-0 mb-2 text-lede">PID Control</h3>
            <p className="text-[var(--tx2)] mb-2">
              <strong>Simple:</strong> A smart way to automatically control
              motors to reach exact positions or speeds. Instead of you
              constantly adjusting, PID measures the error and corrects it.
            </p>
            <p className="text-[var(--tx2)] mb-2">
              <strong>Real-world analogy:</strong> Like cruise control in a car.
              You set a target speed (60 mph), and the car automatically adjusts
              the gas pedal to maintain that speed, even going uphill or
              downhill.
            </p>
            <p className="text-[var(--tx2)]">
              <strong>Technical:</strong> Proportional-Integral-Derivative
              controller that uses error feedback to automatically adjust motor
              output, minimizing the difference between desired and actual
              states.
            </p>
          </div>

          <div
            id="kp"
            className="min-w-0 bg-[var(--bg2)] rounded-lg p-6 border border-[var(--rule)] scroll-mt-24"
          >
            <h3 className="display m-0 mb-2 text-lede">
              kP (Proportional Gain)
            </h3>
            <p className="text-[var(--tx2)] mb-2">
              <strong>Simple:</strong> How strongly the motor reacts to being
              away from the target. Higher kP = stronger reaction. Like pressing
              the gas pedal harder when you&apos;re further from your target
              speed.
            </p>
            <p className="text-[var(--tx2)]">
              <strong>Technical:</strong> The proportional gain coefficient
              determining motor output per unit of error (Output = kP × Error).
            </p>
          </div>

          <div
            id="ki"
            className="min-w-0 bg-[var(--bg2)] rounded-lg p-6 border border-[var(--rule)] scroll-mt-24"
          >
            <h3 className="display m-0 mb-2 text-lede">kI (Integral Gain)</h3>
            <p className="text-[var(--tx2)] mb-2">
              <strong>Simple:</strong> Corrects for small steady errors that
              build up over time. Usually left at zero for FRC because it can
              cause instability.
            </p>
            <p className="text-[var(--tx2)] mb-2">
              <strong>When to use:</strong> Most FRC mechanisms don&apos;t need
              this. Only use if your mechanism consistently stops just short of
              the target.
            </p>
            <p className="text-[var(--tx2)]">
              <strong>Technical:</strong> The integral gain coefficient that
              accumulates error over time to eliminate steady-state error
              (Output = kI × ∑Error).
            </p>
          </div>

          <div
            id="kd"
            className="min-w-0 bg-[var(--bg2)] rounded-lg p-6 border border-[var(--rule)] scroll-mt-24"
          >
            <h3 className="display m-0 mb-2 text-lede">kD (Derivative Gain)</h3>
            <p className="text-[var(--tx2)] mb-2">
              <strong>Simple:</strong> Slows down the motor as it approaches the
              target to prevent overshooting. Like easing off the gas as you
              approach a stop sign.
            </p>
            <p className="text-[var(--tx2)]">
              <strong>Technical:</strong> The derivative gain coefficient that
              responds to the rate of error change, providing damping to reduce
              oscillation (Output = kD × dError/dt).
            </p>
          </div>

          <div
            id="feedforward"
            className="min-w-0 bg-[var(--bg2)] rounded-lg p-6 border border-[var(--rule)] scroll-mt-24"
          >
            <h3 className="display m-0 mb-2 text-lede">Feedforward (FF)</h3>
            <p className="text-[var(--tx2)] mb-2">
              <strong>Simple:</strong> A &quot;smart guess&quot; about how much
              power you need, based on physics rather than error. Instead of
              waiting for the motor to be wrong and then correcting it,
              feedforward predicts what&apos;s needed.
            </p>
            <p className="text-[var(--tx2)] mb-2">
              <strong>Real-world analogy:</strong> When carrying a heavy
              backpack upstairs, you automatically use more effort than on flat
              ground. You don&apos;t wait to slow down and then push harder. You
              predict you&apos;ll need more force.
            </p>
            <p className="text-[var(--tx2)]">
              <strong>Technical:</strong> Model-based control that predicts
              required output based on system physics (gravity, friction,
              velocity) rather than reacting to error.
            </p>
          </div>

          <div
            id="ks"
            className="min-w-0 bg-[var(--bg2)] rounded-lg p-6 border border-[var(--rule)] scroll-mt-24"
          >
            <h3 className="display m-0 mb-2 text-lede">
              kS (Static Feedforward)
            </h3>
            <p className="text-[var(--tx2)] mb-2">
              <strong>Simple:</strong> The minimum voltage needed to overcome
              friction and get your mechanism moving from a standstill. Like the
              initial push needed to get a heavy door to start opening.
            </p>
            <p className="text-[var(--tx2)]">
              <strong>Technical:</strong> Static friction compensation, a
              constant voltage applied to overcome static friction regardless of
              desired velocity.
            </p>
          </div>

          <div
            id="kg"
            className="min-w-0 bg-[var(--bg2)] rounded-lg p-6 border border-[var(--rule)] scroll-mt-24"
          >
            <h3 className="display m-0 mb-2 text-lede">
              kG (Gravity Feedforward)
            </h3>
            <p className="text-[var(--tx2)] mb-2">
              <strong>Simple:</strong> Extra power needed to hold up an arm or
              elevator against gravity. The voltage changes based on the angle:
              horizontal arms need more help than vertical ones.
            </p>
            <p className="text-[var(--tx2)] mb-2">
              <strong>When to use:</strong> For arms, elevators, or anything
              fighting gravity. Not needed for wheels or horizontal mechanisms.
            </p>
            <p className="text-[var(--tx2)]">
              <strong>Technical:</strong> Gravity compensation coefficient that
              applies voltage proportional to the cosine of the mechanism angle
              to counteract gravitational torque.
            </p>
          </div>

          <div
            id="kv"
            className="min-w-0 bg-[var(--bg2)] rounded-lg p-6 border border-[var(--rule)] scroll-mt-24"
          >
            <h3 className="display m-0 mb-2 text-lede">
              kV (Velocity Feedforward)
            </h3>
            <p className="text-[var(--tx2)] mb-2">
              <strong>Simple:</strong> How much voltage is needed per unit of
              speed. Helps the motor reach and maintain target speeds smoothly.
            </p>
            <p className="text-[var(--tx2)] mb-2">
              <strong>When to use:</strong> For flywheels, shooters, and any
              mechanism where speed control is important.
            </p>
            <p className="text-[var(--tx2)]">
              <strong>Technical:</strong> Velocity feedforward gain determining
              voltage per unit of target velocity (Volts = kV × TargetVelocity).
            </p>
          </div>

          <div
            id="motion-magic"
            className="min-w-0 bg-[var(--bg2)] rounded-lg p-6 border border-[var(--rule)] scroll-mt-24"
          >
            <h3 className="display m-0 mb-2 text-lede">Motion Magic</h3>
            <p className="text-[var(--tx2)] mb-2">
              <strong>Simple:</strong> An upgrade to PID that makes movements
              smooth instead of jerky. Instead of rushing to the target, it
              accelerates smoothly, cruises, then slows down smoothly.
            </p>
            <p className="text-[var(--tx2)] mb-2">
              <strong>Real-world analogy:</strong> Like an elevator: it
              doesn&apos;t instantly jump to full speed and slam to a stop. It
              accelerates smoothly when starting, maintains speed, then
              decelerates smoothly to arrive gently.
            </p>
            <p className="text-[var(--tx2)]">
              <strong>Technical:</strong> CTRE&apos;s trapezoidal motion profile
              generator that creates smooth velocity curves with controlled
              acceleration, cruise, and deceleration phases.
            </p>
          </div>

          <div
            id="closed-loop"
            className="min-w-0 bg-[var(--bg2)] rounded-lg p-6 border border-[var(--rule)] scroll-mt-24"
          >
            <h3 className="display m-0 mb-2 text-lede">Closed-Loop Control</h3>
            <p className="text-[var(--tx2)] mb-2">
              <strong>Simple:</strong> A control method that uses sensor
              feedback. The motor checks where it actually is (using an encoder)
              and adjusts automatically to reach the target.
            </p>
            <p className="text-[var(--tx2)]">
              <strong>Technical:</strong> A feedback control system where sensor
              measurements inform control decisions, creating a closed feedback
              loop (sensor → controller → motor → sensor).
            </p>
          </div>

          <div
            id="open-loop"
            className="min-w-0 bg-[var(--bg2)] rounded-lg p-6 border border-[var(--rule)] scroll-mt-24"
          >
            <h3 className="display m-0 mb-2 text-lede">Open-Loop Control</h3>
            <p className="text-[var(--tx2)] mb-2">
              <strong>Simple:</strong> Direct voltage control with no sensor
              feedback. You tell the motor &quot;run at 6 volts&quot; and hope
              it does what you want. Simple but imprecise.
            </p>
            <p className="text-[var(--tx2)] mb-2">
              <strong>When to use:</strong> For testing motors, simple
              movements, or mechanisms where precision isn&apos;t critical (like
              running an intake).
            </p>
            <p className="text-[var(--tx2)]">
              <strong>Technical:</strong> Control without feedback. Motor output
              is set directly without measuring actual performance or position.
            </p>
          </div>
        </div>
      </LessonSection>

      {/* Software & Tools */}
      <LessonSection
        id="software-tools"
        title={
          <>
            <Settings className="w-8 h-8 text-[var(--accent)]" />
            Software & Tools
          </>
        }
        outlineLabel="Software & Tools"
        className="mb-8"
      >
        <div className="grid grid-cols-[minmax(0,1fr)] gap-4">
          <div
            id="wpilib"
            className="min-w-0 bg-[var(--bg2)] rounded-lg p-6 border border-[var(--rule)] scroll-mt-24"
          >
            <h3 className="display m-0 mb-2 text-lede">WPILib</h3>
            <p className="text-[var(--tx2)] mb-2">
              <strong>Simple:</strong> The main programming toolkit for FRC
              robots. It includes everything you need to write robot code, like
              Microsoft Word does for documents.
            </p>
            <p className="text-[var(--tx2)]">
              <strong>Technical:</strong> FRC&apos;s official software library
              providing robot framework, command-based programming structure,
              motor control, sensor integration, and development tools.
            </p>
          </div>

          <div
            id="phoenix-tuner-x"
            className="min-w-0 bg-[var(--bg2)] rounded-lg p-6 border border-[var(--rule)] scroll-mt-24"
          >
            <h3 className="display m-0 mb-2 text-lede">Phoenix Tuner X</h3>
            <p className="text-[var(--tx2)] mb-2">
              <strong>Simple:</strong> A program that lets you test and
              configure CTRE motors without writing any code. You can spin
              motors, check sensors, update firmware, and tune PID values.
            </p>
            <p className="text-[var(--tx2)]">
              <strong>Technical:</strong> CTRE&apos;s device configuration and
              diagnostic tool for configuring, testing, and tuning Phoenix
              devices with live plotting and control.
            </p>
          </div>

          <div
            id="driver-station"
            className="min-w-0 bg-[var(--bg2)] rounded-lg p-6 border border-[var(--rule)] scroll-mt-24"
          >
            <h3 className="display m-0 mb-2 text-lede">Driver Station</h3>
            <p className="text-[var(--tx2)] mb-2">
              <strong>Simple:</strong> The program that connects your laptop to
              the robot during matches. It shows you robot status, lets you
              enable/disable the robot, and displays error messages.
            </p>
            <p className="text-[var(--tx2)]">
              <strong>Technical:</strong> FMS-compatible software interface for
              robot communication, control mode selection, joystick input,
              diagnostics, and competition connectivity.
            </p>
          </div>

          <div
            id="git"
            className="min-w-0 bg-[var(--bg2)] rounded-lg p-6 border border-[var(--rule)] scroll-mt-24"
          >
            <h3 className="display m-0 mb-2 text-lede">
              Git / Version Control
            </h3>
            <p className="text-[var(--tx2)] mb-2">
              <strong>Simple:</strong> A system that saves every version of your
              code as you work. Like a super-powered &quot;undo&quot; button
              that lets you go back to any previous version of your code, even
              from weeks ago.
            </p>
            <p className="text-[var(--tx2)] mb-2">
              <strong>Real-world analogy:</strong> Like Google Docs version
              history, but for code. You can see what changed, who changed it,
              and restore old versions if needed.
            </p>
            <p className="text-[var(--tx2)]">
              <strong>Technical:</strong> Distributed version control system
              tracking code changes, enabling collaboration, branching, and code
              history management.
            </p>
          </div>

          <div
            id="networktables"
            className="min-w-0 bg-[var(--bg2)] rounded-lg p-6 border border-[var(--rule)] scroll-mt-24"
          >
            <h3 className="display m-0 mb-2 text-lede">NetworkTables</h3>
            <p className="text-[var(--tx2)] mb-2">
              <strong>Simple:</strong> A shared bulletin board for your robot.
              Your code can post numbers (like battery voltage) to it, and your
              laptop can read them. It&apos;s how dashboards get their data.
            </p>
            <p className="text-[var(--tx2)]">
              <strong>Technical:</strong> A publish-subscribe messaging system
              used in FRC to communicate data between the robot, driver station,
              and coprocessors over the network.
            </p>
          </div>

          <div
            id="tuner-constants"
            className="min-w-0 bg-[var(--bg2)] rounded-lg p-6 border border-[var(--rule)] scroll-mt-24"
          >
            <h3 className="display m-0 mb-2 text-lede">TunerConstants.java</h3>
            <p className="text-[var(--tx2)] mb-2">
              <strong>Simple:</strong> A specific file generated by Phoenix
              Tuner X that contains all the settings for your swerve drive, like
              CAN IDs, gear ratios, and physical measurements.
            </p>
            <p className="text-[var(--tx2)]">
              <strong>Technical:</strong> A generated Java configuration file
              containing static constants that define the physical properties
              and electrical configuration of the swerve drivetrain.
            </p>
          </div>
        </div>
      </LessonSection>

      {/* Units & Measurements */}
      <LessonSection
        id="units-measurements"
        title={
          <>
            <Zap className="w-8 h-8 text-[var(--accent)]" />
            Units & Measurements
          </>
        }
        outlineLabel="Units & Measurements"
      >
        <div className="grid grid-cols-[minmax(0,1fr)] gap-4">
          <div
            id="rotations"
            className="min-w-0 bg-[var(--bg2)] rounded-lg p-6 border border-[var(--rule)] scroll-mt-24"
          >
            <h3 className="display m-0 mb-2 text-lede">Rotations</h3>
            <p className="text-[var(--tx2)] mb-2">
              <strong>Simple:</strong> How CTRE motors measure position: one
              full spin = 1 rotation. Much easier than degrees (360°) or radians
              (2π).
            </p>
            <p className="text-[var(--tx2)] mb-2">
              <strong>Example:</strong> If your arm is at 0.25 rotations, it has
              turned one-quarter of a full circle (90 degrees).
            </p>
            <p className="text-[var(--tx2)]">
              <strong>Technical:</strong> Phoenix 6&apos;s native position unit
              representing complete shaft revolutions (1 rotation = 360° = 2π
              radians).
            </p>
          </div>

          <div
            id="rps"
            className="min-w-0 bg-[var(--bg2)] rounded-lg p-6 border border-[var(--rule)] scroll-mt-24"
          >
            <h3 className="display m-0 mb-2 text-lede">
              RPS (Rotations Per Second)
            </h3>
            <p className="text-[var(--tx2)] mb-2">
              <strong>Simple:</strong> How fast a motor is spinning, measured in
              full rotations each second.
            </p>
            <p className="text-[var(--tx2)] mb-2">
              <strong>Example:</strong> A motor running at 10 RPS completes 10
              full spins every second.
            </p>
            <p className="text-[var(--tx2)]">
              <strong>Technical:</strong> Velocity measurement in Phoenix 6 (1
              RPS = 60 RPM = 360°/s).
            </p>
          </div>

          <div
            id="voltage"
            className="min-w-0 bg-[var(--bg2)] rounded-lg p-6 border border-[var(--rule)] scroll-mt-24"
          >
            <h3 className="display m-0 mb-2 text-lede">Voltage</h3>
            <p className="text-[var(--tx2)] mb-2">
              <strong>Simple:</strong> The &quot;strength&quot; of electrical
              power sent to the motor. FRC uses 12-volt batteries, so motors can
              receive anywhere from -12V (full reverse) to +12V (full forward).
            </p>
            <p className="text-[var(--tx2)] mb-2">
              <strong>Example:</strong> 6V makes the motor run at half power,
              12V is full power.
            </p>
            <p className="text-[var(--tx2)]">
              <strong>Technical:</strong> Electrical potential difference
              measured in volts, controlling motor speed and torque output (FRC
              nominal: 12V).
            </p>
          </div>

          <div
            id="gear-ratio"
            className="min-w-0 bg-[var(--bg2)] rounded-lg p-6 border border-[var(--rule)] scroll-mt-24"
          >
            <h3 className="display m-0 mb-2 text-lede">Gear Ratio</h3>
            <p className="text-[var(--tx2)] mb-2">
              <strong>Simple:</strong> How much the motor&apos;s speed is
              reduced to increase power. A 25:1 gear ratio means the motor spins
              25 times for the output to spin once: slower but 25x stronger.
            </p>
            <p className="text-[var(--tx2)] mb-2">
              <strong>Real-world analogy:</strong> Like bicycle gears: low gear
              (high ratio) is slow but powerful for hills; high gear (low ratio)
              is fast but weak for flat roads.
            </p>
            <p className="text-[var(--tx2)]">
              <strong>Technical:</strong> Ratio of input rotations to output
              rotations, trading velocity for torque (25:1 = 25 motor rotations
              per 1 output rotation).
            </p>
          </div>

          <div
            id="tolerance"
            className="min-w-0 bg-[var(--bg2)] rounded-lg p-6 border border-[var(--rule)] scroll-mt-24"
          >
            <h3 className="display m-0 mb-2 text-lede">Tolerance</h3>
            <p className="text-[var(--tx2)] mb-2">
              <strong>Simple:</strong> How close is &quot;close enough&quot; to
              the target. If your target is 90° with a tolerance of 2°, anywhere
              from 88° to 92° counts as success.
            </p>
            <p className="text-[var(--tx2)] mb-2">
              <strong>Why it matters:</strong> Perfect precision is impossible.
              Tolerance defines acceptable error so your robot can move on to
              the next action.
            </p>
            <p className="text-[var(--tx2)]">
              <strong>Technical:</strong> Acceptable error range from setpoint,
              defining when a control system is considered &quot;at target&quot;
              or finished.
            </p>
          </div>
        </div>
      </LessonSection>
    </PageTemplate>
  );
}
