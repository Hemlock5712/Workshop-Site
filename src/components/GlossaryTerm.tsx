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
    "A smart device that controls how a motor spins - like a dimmer switch for lights, but much smarter. It can control speed, direction, and precisely how far the motor turns.",
  talonfx:
    "CTRE's motor controller integrated into motors like the Kraken, featuring built-in FOC control and 1kHz PID loops.",
  kraken:
    "A powerful motor with a built-in controller that makes it smart. Instead of just spinning when you apply power, it can precisely control how fast it spins and exactly where it stops.",
  encoder:
    "A sensor that measures how far and how fast a motor has turned - like a speedometer and odometer combined, but for motors instead of cars.",
  cancoder:
    "A standalone encoder that measures exactly where a rotating part is positioned, like a digital protractor. It remembers position even when the robot is turned off.",
  canivore:
    "A device that creates a high-speed communication network for all your robot parts - like a Wi-Fi router, but for motors and sensors instead of computers.",
  "can bus":
    "The communication network that connects motors, sensors, and the robot brain (roboRIO). Like a telephone line that lets all robot parts talk to each other using the same wire.",
  "device id":
    "A unique number (like a name tag) given to each motor or sensor so your code knows which one to control - like how each house has a different address.",
  roborio:
    "The 'brain' of your robot - a small computer that runs your code and tells all the motors and sensors what to do.",

  // Programming Concepts
  subsystem:
    "A section of code that represents one physical part of your robot (like an arm, shooter, or drivetrain). It knows how to control its motors and read its sensors.",
  command:
    "An action your robot performs, like 'raise arm' or 'shoot ball'. Commands use subsystems to get things done.",
  trigger:
    "A connection between a button (or sensor reading) and a command. Hold button A and the trigger runs its command; for holds, whileTrue hands the mechanism back to its default command on release.",
  "command-based programming":
    "The main way FRC teams organize robot code. You divide your robot into subsystems (parts), create commands (actions), and use triggers (buttons) to make things happen.",
  periodic:
    "A method that runs automatically every 20 milliseconds (50 times per second). Used for displaying data or monitoring sensors, NOT for controlling motors directly.",
  mechanism:
    "The Commands v3 name for a subsystem - one physical part of the robot (arm, flywheel, drivetrain). A class you extend that owns the hardware and hands out commands.",
  opmode:
    "A 'mode' the robot can be in - driver teleop, an autonomous routine, or a calibration task. Each one is its own class; the driver station lists them by name.",
  hold: "A command that takes a mechanism to a setpoint and stays there, re-sending the request forever. Bind holds with whileTrue so the default command comes back on release. A hold never finishes, so nothing may ever wait on one - every hold's name ends in '(hold)' so a stuck routine is easy to spot.",
  chaining:
    "Building a routine by snapping commands together: Command.sequence for self-finishing steps, .until(...) to give a hold a finish line, Command.race for 'do this while holding', and .withTimeout as the seatbelt.",
  "state machine":
    "An optional, advanced pattern where the robot is always in exactly one named state and buttons/sensors move it between states. Illegal jumps can't happen because no transition was declared for them.",
  coroutine:
    "The optional advanced dialect that lets one command body pause and resume (await, fork, waitUntil). Everyday robot code uses holds and chaining instead.",

  // Control Theory
  pid: "A smart way to automatically control motors to reach exact positions or speeds. Like cruise control in a car - you set a target, and PID does the adjusting automatically.",
  "pid control":
    "A smart way to automatically control motors to reach exact positions or speeds. Like cruise control in a car - you set a target, and PID does the adjusting automatically.",
  kp: "Proportional gain - how hard to push based on how far you are from the target. Far away = push hard, close = push gently. Like parking a car.",
  proportional:
    "How hard to push based on how far you are from the target. Far away = push hard, close = push gently. Like parking a car.",
  ki: "Integral gain - remembers past errors and adds extra push if you've been stuck away from the target. Usually kept at 0 for beginners to avoid instability.",
  integral:
    "Remembers past errors and adds extra push if you've been stuck away from the target. Usually kept at 0 for beginners to avoid instability.",
  kd: "Derivative gain - slows down as you approach the target to prevent overshooting. The 'brakes' of your PID system. Like slowing down before a stop sign.",
  derivative:
    "Slows down as you approach the target to prevent overshooting. The 'brakes' of your PID system. Like slowing down before a stop sign.",
  feedforward:
    "A 'smart guess' about how much power you need, based on physics rather than error. Predicts what's needed instead of waiting to be wrong and then correcting.",
  ks: "Static feedforward - the minimum voltage needed to overcome friction and get your mechanism moving from a standstill. Like the initial push to get a heavy door opening.",
  kg: "Gravity feedforward - extra power needed to hold up an arm or elevator against gravity. The voltage changes based on the angle - horizontal arms need more help.",
  kv: "Velocity feedforward - how much voltage is needed per unit of speed. Helps the motor reach and maintain target speeds smoothly. Important for flywheels and shooters.",
  "motion magic":
    "An upgrade to PID that makes movements smooth instead of jerky. Instead of rushing to the target, it accelerates smoothly, cruises, then slows down smoothly - like an elevator.",
  "closed-loop":
    "Control that uses sensor feedback - the motor checks where it actually is and adjusts automatically to reach the target.",
  "open-loop":
    "Direct voltage control with no sensor feedback - you tell the motor 'run at 6 volts' and hope it does what you want. Simple but imprecise.",

  // Software & Tools
  wpilib:
    "The main programming toolkit for FRC robots - like Microsoft Word for documents, but WPILib is for robot code. Includes VS Code, libraries, and simulation tools.",
  "phoenix tuner":
    "A program that lets you test motors and sensors without writing any code - like a 'motor remote control' app. Makes troubleshooting much easier.",
  "phoenix tuner x":
    "A program that lets you test motors and sensors without writing any code - like a 'motor remote control' app. Makes troubleshooting much easier.",
  "driver station":
    "The program that connects your laptop to the robot during matches. Shows robot status, lets you enable/disable, and displays error messages.",
  git: "A version control system that saves every change you make to your code - like an unlimited 'undo' button that remembers everything forever.",

  // Units & Measurements
  rotations:
    "How CTRE motors measure position - one full spin = 1 rotation. Much easier than degrees (360°) or radians (2π).",
  rps: "Rotations Per Second - how fast a motor is spinning. A motor running at 10 RPS completes 10 full spins every second.",
  voltage:
    "The 'strength' of electrical power sent to the motor. FRC uses 12-volt batteries, so motors can receive -12V (full reverse) to +12V (full forward).",
  "gear ratio":
    "How much the motor's speed is reduced to increase power. A 25:1 ratio means the motor spins 25 times for the output to spin once - slower but 25x stronger.",
  tolerance:
    "How close is 'close enough' to the target. If your target is 90° with tolerance of 2°, anywhere from 88-92° counts as success. Perfect precision is impossible.",
  "swerve drive":
    "An advanced drivetrain where each wheel can spin and rotate independently. Like a shopping cart where every wheel can steer - allows the robot to move in any direction while rotating.",
  motor:
    "An electric device that spins when given power. The 'muscles' of your robot that make things move - wheels, arms, shooters, etc.",
  sensor:
    "A device that measures something about the physical world - position, speed, distance, color, etc. The robot's 'senses' like eyes and touch.",
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
