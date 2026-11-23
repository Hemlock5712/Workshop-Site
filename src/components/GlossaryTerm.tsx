"use client";

import { useId, useState } from "react";

interface GlossaryTermProps {
  term: string;
  children?: React.ReactNode;
  definition?: string;
}

/**
 * The definitions. This record is the whole feature now: the standalone
 * `/glossary` page was retired (a second copy of every definition, kept in
 * sync by hand), so an annotated term is defined here and nowhere else. A term
 * with no entry renders as plain text rather than as an affordance that leads
 * nowhere.
 */
const glossaryDefinitions: Record<string, string> = {
  // Hardware & Electronics
  "motor controller":
    "A device that sets the voltage or current applied to a motor. It controls the motor's direction, speed, and position.",
  talonfx:
    "The CTRE motor controller built into motors such as the Kraken. It runs closed-loop position and velocity control on the motor at 1 kHz.",
  kraken:
    "A brushless motor with a TalonFX motor controller built in. It accepts a position or velocity target as well as a voltage.",
  encoder:
    "A sensor that measures how far a shaft has turned and how fast it is turning.",
  cancoder:
    "A CTRE magnetic encoder that reports the absolute angle of a shaft over the CAN bus. It keeps that angle through a power cycle.",
  canivore:
    "A CTRE USB adapter that provides a CAN FD bus for motors and sensors.",
  "can bus":
    "The wired network that connects motors, sensors, and the robot controller, a SystemCore in this course. Every device on the bus shares the same pair of wires.",
  "device id":
    "The number that identifies one motor or sensor on a CAN bus. Code uses it to select the device to control.",
  roborio:
    "The FRC robot controller that SystemCore replaces. This course deploys to SystemCore, and its code does not run on a roboRIO.",

  // Programming Concepts
  subsystem:
    "One physical part of the robot, such as an arm, a flywheel, or a drivetrain, and the code that owns its motors and sensors. Commands v3 calls it a mechanism.",
  command:
    "An action the robot performs, such as raising an arm or spinning a flywheel. A command claims the mechanisms it uses while it runs.",
  trigger:
    "A condition, such as a button press or a sensor reading, bound to a command. whileTrue runs the command while the condition is true and cancels it when the condition ends.",
  "command-based programming":
    "The structure most FRC teams use for robot code. Mechanisms own the hardware, commands are the actions, and triggers start the commands.",
  periodic:
    "A method the robot program calls once every loop, 50 times a second. Robot has robotPeriodic() and an OpMode has periodic(). A mechanism has none.",
  mechanism:
    "One physical part of the robot, such as an arm, a flywheel, or a drivetrain. In Commands v3, Mechanism is an interface implemented by the class that owns the hardware and hands out its commands.",
  opmode:
    "One selectable mode of the robot program, such as teleop, an autonomous routine, or a utility task. Each OpMode is its own class, and the Driver Station lists them by name.",
  hold: "A runRepeatedly command that sends the same request every loop and never finishes. Bind it with whileTrue so releasing the button cancels it. In a coroutine, fork it, because awaiting it blocks every later step.",
  "state machine":
    "A pattern where the robot is in exactly one named state at a time, and buttons or sensors move it between states. A jump with no declared transition cannot happen.",
  coroutine:
    "A command body written as ordinary Java that runs top to bottom and can pause on a line, then resume there on a later loop. Its calls are fork, await, waitUntil, wait, and yield.",

  // Control Theory
  pid: "A closed-loop controller that drives a motor to a target position or velocity. It computes its output from the error, the difference between the target and the measurement.",
  "pid control":
    "A closed-loop controller that drives a motor to a target position or velocity. It computes its output from the error, the difference between the target and the measurement.",
  kp: "Proportional gain. Its output is the error multiplied by kP, so a larger error produces a larger output.",
  proportional:
    "The PID term whose output is the error multiplied by kP. A larger error produces a larger output.",
  ki: "Integral gain. Its output grows with the error accumulated over time, which removes a small steady error. This course leaves kI at zero.",
  integral:
    "The PID term whose output grows with the error accumulated over time, which removes a small steady error. This course leaves kI at zero.",
  kd: "Derivative gain. Its output is proportional to how fast the error is changing, which slows the approach to the target and reduces overshoot.",
  derivative:
    "The PID term whose output is proportional to how fast the error is changing. It slows the approach to the target and reduces overshoot.",
  feedforward:
    "Output calculated from the target and a model of the mechanism, not from the error. It leaves the PID terms less to correct.",
  ks: "Static feedforward. The voltage needed to overcome static friction, applied in the direction of motion.",
  kg: "Gravity feedforward. The voltage needed to hold an arm or elevator against gravity. On an arm it scales with the cosine of the angle and is largest when the arm is horizontal.",
  kv: "Velocity feedforward. The voltage applied per unit of target velocity. A flywheel gets most of its output from it.",
  "motion magic":
    "A Phoenix 6 control mode that moves to a position target along a motion profile. The mechanism accelerates to a cruise velocity, holds it, then decelerates into the target.",
  "closed-loop":
    "Control that uses sensor feedback. The controller compares the measurement to the target and adjusts the output to reduce the error.",
  "control request":
    "The instruction a TalonFX is following right now: what to output and what target to aim at. VoltageOut and MotionMagicVoltage are two. Code sends one every loop, and the motor keeps applying the last one it received until a different one replaces it.",
  "open-loop":
    "Control with no sensor feedback. The code sets an output, such as 6 volts, and nothing checks the result.",

  // Software & Tools
  wpilib:
    "The official FRC software library and tools for writing, deploying, and simulating robot code.",
  "phoenix tuner":
    "The CTRE application for configuring, updating, and testing CTRE devices over the CAN bus. It can drive a motor and plot its signals without any robot code.",
  "phoenix tuner x":
    "The CTRE application for configuring, updating, and testing CTRE devices over the CAN bus. It can drive a motor and plot its signals without any robot code.",
  "driver station":
    "The application that connects a laptop to the robot. It enables and disables the robot, selects the OpMode, and shows status and errors.",
  git: "A version control system that records each change to a project as a commit. Any earlier commit can be restored.",

  // Units & Measurements
  rotations:
    "The position unit Phoenix 6 uses. One full turn of the shaft is 1 rotation.",
  rps: "Rotations per second, the velocity unit Phoenix 6 uses. A motor at 10 RPS completes 10 full turns every second.",
  voltage:
    "The electrical output applied to a motor. An FRC robot runs on a 12 volt battery, so the output ranges from -12 V for full reverse to +12 V for full forward.",
  "gear ratio":
    "The number of motor rotations per rotation of the output. At 25:1 the motor turns 25 times for one output turn, so the output is 25 times slower with 25 times the torque.",
  tolerance:
    "The allowed distance from the target that still counts as reached. With a target of 90° and a tolerance of 2°, any angle from 88° to 92° counts.",
  "swerve drive":
    "A drivetrain where every wheel module steers and drives independently. The robot can move in any direction while it rotates.",
  motor:
    "An electric device that turns a shaft when voltage is applied. Motors move the robot's wheels, arms, and flywheels.",
  sensor:
    "A device that measures a physical quantity, such as position, velocity, or distance, and reports it to the robot code.",
};

export default function GlossaryTerm({
  term,
  children,
  definition,
}: GlossaryTermProps) {
  const [showTooltip, setShowTooltip] = useState(false);
  const tooltipId = useId();

  // Use provided definition or look up in the definitions above
  const tooltipText = definition || glossaryDefinitions[term.toLowerCase()];

  // Only render as an annotated term if we have a definition
  if (!tooltipText) {
    // No definition - just render plain text
    return <>{children || term}</>;
  }

  return (
    <span className="relative inline-block">
      {/* A button rather than a span: the definition is reachable on hover, so
          it has to be reachable on focus too, and only a focusable element
          fires focus. It navigates nowhere — the tooltip is the whole
          behaviour, and `aria-describedby` is what hands it to a reader that
          cannot hover. */}
      <button
        type="button"
        aria-describedby={showTooltip ? tooltipId : undefined}
        className="cursor-help text-left text-inherit underline decoration-dotted underline-offset-4 transition-colors hover:text-[var(--accent)]"
        style={{ textDecorationColor: "var(--accent)" }}
        onMouseEnter={() => setShowTooltip(true)}
        onMouseLeave={() => setShowTooltip(false)}
        onFocus={() => setShowTooltip(true)}
        onBlur={() => setShowTooltip(false)}
      >
        {children || term}
      </button>

      {showTooltip && (
        <span
          role="tooltip"
          id={tooltipId}
          className="pointer-events-none absolute bottom-full left-1/2 z-50 mb-2 w-64 -translate-x-1/2 px-3.5 py-3"
          style={{
            whiteSpace: "normal",
            background: "var(--bg3)",
            border: "1px solid var(--rule)",
            borderRadius: 3,
            boxShadow: "0 18px 40px -18px oklch(0.05 0.03 265 / 0.7)",
          }}
        >
          <span
            className="mono mb-1.5 block"
            style={{
              fontSize: "var(--text-micro)",
              letterSpacing: "0.14em",
              textTransform: "uppercase",
              color: "var(--accent)",
            }}
          >
            {term}
          </span>
          <span
            className="block"
            style={{
              fontFamily: "var(--font-serif)",
              fontSize: "var(--text-note)",
              lineHeight: 1.5,
              color: "var(--tx2)",
            }}
          >
            {tooltipText}
          </span>
        </span>
      )}
    </span>
  );
}
