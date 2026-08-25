import PageTemplate from "@/components/PageTemplate";
import LessonSection from "@/components/lesson/LessonSection";
import Box from "@/components/Box";
import CodeBlock from "@/components/CodeBlock";
import Quiz from "@/components/Quiz";
import { MarginNote, ProseBlock, Split } from "@/components/lesson/Prose";
import VideoEmbed from "@/components/VideoEmbed";

export default function RunningProgram() {
  return (
    <PageTemplate
      title="Hardware Simulation"
      lede="Your laptop stands in for the robot controller and drives the real motors on the bench. You start the program, pick Teleop, enable it, and press the buttons bound in your TeleopOpMode. Powered motors and a CANivore are required."
      needs={[
        <>
          The <code>mech-2-Commands</code> branch checked out and building.
        </>,
        <>
          A bench checked in Tuner X, CANivore on this laptop:{" "}
          <a href="/hardware" className="underline">
            Hardware Setup
          </a>{" "}
          and{" "}
          <a href="/mechanism-setup" className="underline">
            Motor Setup
          </a>
          .
        </>,
        <>An Xbox-style controller plugged into the same laptop.</>,
        <>Clear space around the mechanism, and a hand free for Disable.</>,
      ]}
      branch="mech-2-Commands"
      time="14 minutes"
    >
      <Split>
        <ProseBlock>
          <p>
            Hardware simulation stands in for the robot controller and nothing
            else. Every motor request leaves the laptop over USB, crosses the
            CANivore onto the CAN bus, and lands in the Kraken on your bench.
          </p>
          <p>
            No part of this project models the arm, and nothing here works
            without powered motors.
          </p>
        </ProseBlock>
        <MarginNote label="No SystemCore yet">
          The laptop plays the controller for now. <code>./gradlew deploy</code>{" "}
          sends the same code to a SystemCore, and your mechanism code does not
          change.
        </MarginNote>
      </Split>

      <LessonSection id="canivore-usb-off" title="Hand over the CAN bus">
        <p>
          Two programs cannot own the CAN bus at once. Leave{" "}
          <strong>CANivore USB</strong> on and Tuner X keeps the bus, so your
          code reaches nothing.
        </p>
        <p>
          Open Tuner X, open the CANivore settings, and turn CANivore USB{" "}
          <strong>off</strong>. Your devices drop off the Tuner X list, which is
          correct. It is the switch you turned on for bench testing, covered on{" "}
          <a href="/mechanism-setup" className="underline">
            Motor Setup
          </a>
          .
        </p>
        <Box
          variant="alert-danger"
          tag="WATCH OUT · REAL MOTORS"
          title="Clear the bench before you enable"
        >
          <p>
            Enable the robot, hold a trigger, and a geared arm swings under 6
            volts. Clear the path it travels. Check that nothing is clamped in
            the way, and keep a hand near Disable. If anything looks wrong,
            disable first and ask afterwards.
          </p>
        </Box>
      </LessonSection>

      <LessonSection
        id="opmodes-and-the-simulator"
        title="OpModes and the simulator"
      >
        <p>
          Start the simulator with <code>./gradlew simulateJava</code>. The
          driver station lists every mode class by name: each{" "}
          <code>@Teleop</code>, <code>@Autonomous</code> and{" "}
          <code>@Utility</code> class in the project. Pick one and that OpMode
          is constructed right there, bindings and all.
        </p>
        <p>
          <code>Scheduler.getDefault().run()</code> ticks every loop whichever
          mode is selected. The robot program finds modes by scanning classes at
          run time, so a class with the wrong shape goes missing instead of
          failing the build.
        </p>
      </LessonSection>

      <LessonSection id="your-four-bindings" title="Your four bindings">
        <p>
          Your bindings live in the <code>TeleopOpMode</code> constructor on{" "}
          <code>mech-2-Commands</code>. Three come with the branch. The fourth,
          on B, is yours to add.
        </p>

        <CodeBlock
          language="java"
          title="What your constructor should contain"
          filename="src/main/java/first/robot/opmode/TeleopOpMode.java"
          code={`// From the branch:
driver.leftTrigger().onTrue(arm.runFast()).onFalse(arm.stop());
driver.rightTrigger().onTrue(flywheel.runFast()).onFalse(flywheel.runSlow());
driver.a().onTrue(flywheel.runFast()).onFalse(flywheel.stop());

// Yours, on B:
driver.b().onTrue(arm.runSlow()).onFalse(arm.stop());`}
        />

        <p>
          Open the file and check the B line is there. Add it and rebuild if it
          is missing. Two of these bindings drive the arm, two drive the
          flywheel, and the arm pair is the experiment below.
        </p>
      </LessonSection>

      <LessonSection id="first-run" title="Run it">
        <VideoEmbed id="xsR7m6ToUFE" title="Hardware Simulation" />
        <ol className="ml-5 list-decimal space-y-3">
          <li>
            In Tuner X, turn <strong>CANivore USB off</strong> and close the
            control window. <strong>You should see:</strong> your devices drop
            out of the Tuner X list.
          </li>
          <li>
            Plug the controller into the laptop. Check the mechanism is powered
            and its path clear.
          </li>
          <li>
            Run <code>./gradlew simulateJava</code>, or{" "}
            <em>WPILib: Simulate Robot Code</em> in VS Code.{" "}
            <strong>You should see:</strong> a simulation window, a driver
            station window, and{" "}
            <code>********** Robot program startup complete **********</code> in
            the console.
          </li>
          <li>
            Drag your controller from <strong>System Joysticks</strong> onto
            slot&nbsp;0 of <strong>Joysticks</strong>. Your code reads{" "}
            <code>new CommandNiDsXboxController(0)</code>, so port 0 is the one
            it hears.
          </li>
          <li>
            Pick <strong>Teleop</strong> from the mode list.{" "}
            <strong>You should see:</strong>{" "}
            <code>********** Starting OpMode Teleop **********</code>. That
            print is your constructor running.
          </li>
          <li>
            Click <strong>Enable</strong>. <strong>You should see:</strong>{" "}
            nothing move. Every command here hangs off a button, and none is
            down.
          </li>
          <li>
            Hold the <strong>left trigger</strong>.{" "}
            <strong>You should see:</strong> the arm push at 6&nbsp;V for as
            long as you hold, and stop when you let go.
          </li>
          <li>
            Hold the <strong>right trigger</strong>, then release it.{" "}
            <strong>You should see:</strong> the flywheel spin up hard, then
            keep spinning more gently. That binding releases into{" "}
            <code>flywheel.runSlow()</code>, not <code>stop()</code>.
          </li>
          <li>
            Press and release <strong>A</strong>.{" "}
            <strong>You should see:</strong> the flywheel go to full, then stop
            dead. A drives the same flywheel and releases into a different
            command.
          </li>
          <li>
            Hold <strong>B</strong>, your own binding.{" "}
            <strong>You should see:</strong> the arm push gently at 3&nbsp;V,
            and stop on release.
          </li>
          <li>
            Click <strong>Disable</strong> before you walk away. Leave the
            program running for the next section.
          </li>
        </ol>
        <p>Three things go wrong here more than anything else.</p>
        <ul className="ml-5 list-disc space-y-2">
          <li>
            <strong>
              The build says <code>invalid source release: 25</code>.
            </strong>{" "}
            Gradle is on an older Java. Launch from the WPILib VS Code
            extension, or point Gradle at the WPILib 2027 Java 25 toolchain.
          </li>
          <li>
            <strong>Teleop never appears in the mode list.</strong> Selecting a
            mode prints <code>Starting OpMode</code>, so a mode that never
            prints never started. Check it against the four rules on{" "}
            <a href="/opmodes" className="underline">
              OpModes
            </a>
            .
          </li>
          <li>
            <strong>Teleop is selected and no motor turns.</strong> CANivore USB
            is still on, or the controller is not on port&nbsp;0, or the driver
            station still says Disabled. A burst of{" "}
            <code>CAN message is stale</code> at startup is normal; the same
            line a few seconds later means the bus is unreachable.
          </li>
        </ul>
      </LessonSection>

      <LessonSection id="two-buttons-one-arm" title="Two buttons, one arm">
        <p>
          The left trigger runs <code>arm.runFast()</code> at 6&nbsp;V. B runs{" "}
          <code>arm.runSlow()</code> at 3&nbsp;V. Both need the arm, and only
          one command can hold it.
        </p>
        <ol className="ml-5 list-decimal space-y-3">
          <li>
            Enable, and hold the <strong>left trigger</strong> down.{" "}
            <strong>You should see:</strong> the arm at 6&nbsp;V.
          </li>
          <li>
            Keeping the left trigger down, press and hold <strong>B</strong>.{" "}
            <strong>You should see:</strong> the arm drop to 3&nbsp;V at once. B
            won.
          </li>
          <li>
            Release <strong>B</strong>, still holding the left trigger.{" "}
            <strong>You should see:</strong> the arm stop, and stay stopped.
          </li>
          <li>
            Release the left trigger too. <strong>You should see:</strong>{" "}
            nothing change. The arm was already stopped.
          </li>
        </ol>
        <Box variant="concept" title="Why B won">
          <p>
            One command holds a mechanism at a time. When a new one needs the
            arm, the scheduler weighs it against the holder.
          </p>
          <ul className="ml-4 mt-3 list-disc space-y-1">
            <li>
              <strong>Strictly lower priority:</strong> the newcomer is turned
              away and nothing changes.
            </li>
            <li>
              <strong>Equal or higher:</strong> the running command is canceled
              and the newcomer takes the arm.
            </li>
          </ul>
          <p className="mt-3">
            Every command you have written runs at the default priority of{" "}
            <code>0</code>. Equal counts, so the newest press wins.
          </p>
        </Box>
        <Box
          variant="alert-warning"
          tag="WATCH OUT"
          title="A held button fires once"
        >
          <p>
            Releasing B scheduled <code>arm.stop()</code>, which needs the arm
            too. It took the arm by the same rule and sent zero. The left
            trigger never got the arm back, because <code>onTrue</code> fires on
            the press. A button already down has nothing left to fire.
          </p>
          <p className="mt-3">
            <code>whileTrue</code> has no such gap.{" "}
            <a href="/chaining-commands" className="underline">
              Command Composition
            </a>{" "}
            makes it the way this team binds a hold.
          </p>
        </Box>
      </LessonSection>

      <LessonSection id="check-your-work" title="Check your work">
        <p>
          Walk the four buttons once more, then the two-button test. You are
          done when each one repeats itself, and the newest press takes the arm
          every time.
        </p>
        <Box variant="alert-success" title="You should see">
          <ul className="ml-5 list-disc space-y-2">
            <li>The arm moving at two speeds, under the left trigger and B.</li>
            <li>
              The flywheel left spinning after the right trigger, and stopped
              after A.
            </li>
          </ul>
        </Box>
        <p>Turn CANivore USB back on before your next session in Tuner X.</p>
      </LessonSection>

      <Quiz
        questions={[
          {
            id: 1,
            question:
              "In hardware simulation, what is being simulated and what is real?",
            options: [
              "The motors are simulated but the controller is real",
              "It models the arm's physics so you can test without hardware",
              "Everything is simulated: the motors, the physics, and the controller",
              "The robot controller is stood in for by your laptop; the CANivore, the CAN bus and the motors are all real hardware",
            ],
            correctAnswer: 3,
            explanation:
              "Hardware simulation replaces the robot controller, not the robot. Your program runs on the laptop and sends real requests over USB to the CANivore and onto the real CAN bus. There is no physics model anywhere in this project, and none of this page works without the motors on the bench.",
          },
          {
            id: 2,
            question:
              "What setting must be turned OFF in Tuner X before running your code in hardware simulation?",
            options: [
              "Motor Control",
              "CANivore USB",
              "Simulation Mode",
              "Hardware Detection",
            ],
            correctAnswer: 1,
            explanation:
              "Only one program can own the CAN bus over USB. With CANivore USB on, Tuner X holds the bus and the simulator cannot reach your motors. It is one switch with two positions: on for bench work in Tuner X, off when your code is driving.",
          },
          {
            id: 3,
            question:
              "You hold the left trigger (arm.runFast(), 6 V), then press B (arm.runSlow(), 3 V) without letting go. What happens?",
            options: [
              "The arm drops to 3 V: runSlow is scheduled at equal priority, so it takes the arm and runFast is canceled",
              "Both commands run and the voltages add up to 9 V",
              "The scheduler throws an error about conflicting requirements",
              "B is ignored, because the arm is already claimed by runFast",
            ],
            correctAnswer: 0,
            explanation:
              "One command owns a mechanism at a time. A newly scheduled command is turned away only if it is strictly lower priority than the one running. Both of these run at the default priority of 0, so equal counts and the newest press wins.",
          },
          {
            id: 4,
            question:
              "In that same experiment you release B while still holding the left trigger. Why does the arm stop instead of going back to 6 V?",
            options: [
              "runFast automatically resumes on the next scheduler tick",
              "Releasing B cancels runSlow, and canceling a command stops the motor",
              "onFalse scheduled arm.stop(), and onTrue only fires on the press: a button already held has nothing left to fire",
              "The left trigger binding expired after a few seconds",
            ],
            correctAnswer: 2,
            explanation:
              "onTrue and onFalse only ever schedule; neither one cancels. Releasing B scheduled arm.stop(), which claimed the arm. The left trigger fired its onTrue back when you first pressed it and will not fire again until you release and press it once more. whileTrue is the verb that fixes this, and it arrives on Command Composition.",
          },
        ]}
      />
    </PageTemplate>
  );
}
