import PageTemplate from "@/components/PageTemplate";
import LessonSection from "@/components/lesson/LessonSection";
import Box from "@/components/Box";
import CodeBlock from "@/components/CodeBlock";
import ImageBlock from "@/components/ImageBlock";
import Quiz from "@/components/Quiz";
import { ProseBlock, Split } from "@/components/lesson/Prose";
import VideoEmbed from "@/components/VideoEmbed";

export default function RunningProgram() {
  return (
    <PageTemplate
      title="Hardware Simulation"
      lede="Your laptop stands in for the robot controller and drives the real motors. You start the program, pick Teleop, enable it, and press the buttons bound in your MyTeleop."
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
      ]}
      branch="mech-2-Commands"
      time="13 minutes"
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
            Open the <strong>&hellip;</strong> menu at the end of the editor
            toolbar and choose <strong>Hardware Sim Robot Code</strong>. Not{" "}
            <strong>Simulate Robot Code</strong>, one line above it: that one
            fakes the hardware, and you want the real motors.
          </li>
        </ol>

        <ImageBlock
          src="/images/running-program/hardware-sim.png"
          alt="The VS Code editor toolbar overflow menu, with Hardware Sim Robot Code circled in red and Simulate Robot Code directly above it"
          title="Hardware Sim, not Simulate"
          caption="The two sit next to each other. Simulate Robot Code runs against simulated hardware and nothing on the bench moves."
          width={621}
          height={724}
        />

        <ol className="ml-5 list-decimal space-y-3" start={4}>
          <li>
            A <strong>Pick extensions to run</strong> prompt appears. Leave{" "}
            <strong>Sim GUI</strong> ticked and press OK.{" "}
            <strong>You should see:</strong> a simulation window and{" "}
            <code>********** Robot program startup complete **********</code> in
            the console.
          </li>
          <li>
            Drag your controller out of <strong>System Joysticks</strong>{" "}
            and&nbsp;drop it on <strong>Joystick[0]</strong>. Your code reads{" "}
            <code>new CommandNiDsXboxController(0)</code>, so port 0 is the one
            it hears. Leave <strong>Map gamepad</strong> ticked.
          </li>
        </ol>

        <ImageBlock
          src="/images/running-program/add-controller.png"
          alt="The simulation window, with an arrow from Xbox Controller in System Joysticks to Joystick[0] in the Joysticks panel"
          title="Drop it on Joystick[0]"
          caption="Once it lands, the axis rows twitch as you move the sticks. That is the fastest way to tell the GUI is reading the controller and not the keyboard."
          width={1540}
          height={1111}
        />

        <ol className="ml-5 list-decimal space-y-3" start={6}>
          <li>
            In <strong>Robot State</strong>, pick <strong>Teleoperated</strong>,
            then choose your OpMode from the dropdown under it.{" "}
            <strong>You should see:</strong> <code>OpMode GOOD</code> beside the
            dropdown, and{" "}
            <code>********** Starting OpMode Teleop **********</code> in the
            console. That print is your constructor running.
          </li>
        </ol>

        <ImageBlock
          src="/images/running-program/sim-gui-opmode.png"
          alt="The simulation window with Teleoperated highlighted in Robot State and the Teleop OpMode selected in the dropdown below it"
          title="Teleoperated, then the OpMode"
          caption="Other Devices on the right lists Talon FX 31, CANcoder 32 and Talon FX 21. Real devices on the bench, reached from a program running on your laptop. That panel is empty under plain Simulate Robot Code."
          width={1917}
          height={1108}
        />

        <ol className="ml-5 list-decimal space-y-3" start={7}>
          <li>
            Click <strong>Enable</strong>. <strong>You should see:</strong>{" "}
            nothing move. Every command here hangs off a button, and none is
            down.
          </li>
          <li>
            Now run it. Hold the buttons you bound, whichever ones those turned
            out to be on your mechanism. <strong>You should see:</strong>
            &nbsp;the mechanism move while a button is down, and do whatever
            that binding&apos;s <code>whileFalse</code> says when you let go.
          </li>
          <li>
            Click <strong>Disable</strong> before you walk away. Leave the
            program running for the next section.
          </li>
        </ol>
        <p>Two things go wrong here more than anything else.</p>
        <ul className="ml-5 list-disc space-y-2">
          <li>
            <strong>Teleop is selected and no motor turns.</strong>
            &nbsp;CANivore USB is still on, or the controller is not on
            port&nbsp;0, or the driver station still says Disabled. A burst of{" "}
            <code>CAN message is stale</code> at startup is normal; the same
            line a few seconds later means the bus is unreachable.
          </li>
          <li>
            <strong>Nothing on the bench moves, and it all looks fine.</strong>
            &nbsp;Check <strong>Other Devices</strong> in the simulation window.
            Empty means you started <strong>Simulate Robot Code</strong> rather
            than <strong>Hardware Sim Robot Code</strong>, so the program is
            driving motors that do not exist. Stop it and start the right one.
          </li>
        </ul>
      </LessonSection>

      <LessonSection id="check-your-work" title="Check your work">
        <p>
          Walk your bindings once more. You are done when each one repeats
          itself.
        </p>
        <Box variant="alert-success" title="You should see">
          <ul className="ml-5 list-disc space-y-2">
            <li>
              The mechanism moving while a button is held, every time you hold
              it.
            </li>
            <li>
              The same mechanism doing whatever that binding&apos;s{" "}
              <code>whileFalse</code> names when you let go, every time.
            </li>
          </ul>
        </Box>
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
              "Hardware simulation replaces the robot controller, not the robot. Your program runs on the laptop and sends real requests over USB to the CANivore and onto the real CAN bus. There is no physics model anywhere in this project.",
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
        ]}
      />
    </PageTemplate>
  );
}
