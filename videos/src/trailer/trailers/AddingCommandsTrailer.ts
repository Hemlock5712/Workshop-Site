import type { Rect, TrailerScript } from "../lib/types";

// A command is one method body, and it only ever takes three shapes.
// The camera travels: title card → three-shapes diagram → set-and-finish
// code → park and waitUntil code → back to the diagram → end card.

const TITLE: Rect = { x: 0, y: 0, width: 1920, height: 1080 };
const DIAGRAM: Rect = { x: 2560, y: 160, width: 2200, height: 1100 };
const CODE1: Rect = { x: 5480, y: 220, width: 1560, height: 900 };
const CODE2: Rect = { x: 7560, y: 180, width: 1620, height: 1000 };
const END: Rect = { x: 9800, y: 60, width: 1920, height: 1080 };

const ARM_SKELETON = `public class Arm extends Mechanism {
  private final TalonFX motor = new TalonFX(31);
  private final VoltageOut voltageOut = new VoltageOut(0);
  private final PositionVoltage positionVoltage = new PositionVoltage(0);
}`;

const ARM_SET_AND_FINISH = `public class Arm extends Mechanism {
  private final TalonFX motor = new TalonFX(31);
  private final VoltageOut voltageOut = new VoltageOut(0);
  private final PositionVoltage positionVoltage = new PositionVoltage(0);

  // 1. Set once and finish — nothing to wait on.
  public Command setVoltage(double volts) {
    return run(coroutine -> motor.setControl(voltageOut.withOutput(volts)))
        .named("Arm:setVoltage:" + volts);
  }
}`;

const ARM_PARK = `public class Arm extends Mechanism {
  // 2. Set once, then hold. park() yields forever.
  public Command holdAt(Angle target) {
    return run(coroutine -> {
      motor.setControl(positionVoltage.withPosition(target.in(Degrees)));
      coroutine.park();
    }).named("Arm:holdAt:" + target.in(Degrees));
  }
}`;

const ARM_PARK_AND_WAIT = `public class Arm extends Mechanism {
  // 2. Set once, then hold. park() yields forever.
  public Command holdAt(Angle target) {
    return run(coroutine -> {
      motor.setControl(positionVoltage.withPosition(target.in(Degrees)));
      coroutine.park();
    }).named("Arm:holdAt:" + target.in(Degrees));
  }

  // 3. Set once, wait for a condition, finish on its own.
  public Command goTo(Angle target, Angle tolerance) {
    return run(coroutine -> {
      motor.setControl(positionVoltage.withPosition(target.in(Degrees)));
      coroutine.waitUntil(() -> atTarget(target, tolerance));
    }).named("Arm:goTo:" + target.in(Degrees));
  }
}`;

export const AddingCommandsTrailer: TrailerScript = {
  id: "AddingCommandsTrailer",
  voice: "af_heart",
  world: [
    {
      kind: "title",
      id: "title",
      rect: TITLE,
      title: "Adding Commands",
      subtitle: "One method body, three shapes",
      accent: "amber",
    },
    {
      kind: "diagram",
      id: "shapes",
      rect: DIAGRAM,
      title: "The three shapes of a command",
      nodes: [
        {
          id: "body",
          label: "One method body",
          sublabel: "wrapped by run, sealed by .named",
          x: 80,
          y: 440,
          width: 460,
          height: 220,
          accent: "purple",
          step: 1,
        },
        {
          id: "finish",
          label: "Set and finish",
          sublabel: "body ends the same tick",
          x: 1660,
          y: 100,
          width: 460,
          height: 220,
          accent: "mint",
          step: 2,
        },
        {
          id: "park",
          label: "Set and park",
          sublabel: "coroutine.park() until cancelled",
          x: 1660,
          y: 440,
          width: 460,
          height: 220,
          accent: "amber",
          step: 3,
        },
        {
          id: "wait",
          label: "Set and waitUntil",
          sublabel: "finishes when the condition is true",
          x: 1660,
          y: 780,
          width: 460,
          height: 220,
          accent: "blue",
          step: 4,
        },
      ],
      edges: [
        { from: "body", to: "finish" },
        { from: "body", to: "park" },
        { from: "body", to: "wait" },
      ],
    },
    {
      kind: "code",
      id: "finish-code",
      rect: CODE1,
      fileName: "Arm.java",
      language: "java",
      states: ["", ARM_SKELETON, ARM_SET_AND_FINISH],
    },
    {
      kind: "code",
      id: "wait-code",
      rect: CODE2,
      fileName: "Arm.java",
      language: "java",
      states: ["", ARM_PARK, ARM_PARK_AND_WAIT],
    },
    {
      kind: "end",
      id: "end",
      rect: END,
      title: "Three shapes, one body",
      subtitle: "set-and-finish, set-and-park, set-and-waitUntil",
      url: "frc5712.com/adding-commands",
    },
  ],
  beats: [
    {
      id: "hook",
      text: "In Commands version three, a command is not a class with four lifecycle methods. No initialize, no execute, no isFinished, no end. A command is one method body — and there are only three shapes it ever takes.",
      camera: TITLE,
      holdAfter: 0.5,
    },
    {
      id: "shapes",
      text: "Every command starts the same: run wraps one coroutine body on the mechanism. Then the body picks a shape — finish right away, park until cancelled, or waitUntil a condition comes true. Three shapes cover nearly everything a robot does.",
      camera: DIAGRAM,
      events: [
        { type: "diagram", artifact: "shapes", step: 1, at: { word: "run" } },
        {
          type: "diagram",
          artifact: "shapes",
          step: 2,
          at: { word: "finish" },
        },
        { type: "diagram", artifact: "shapes", step: 3, at: { word: "park" } },
        {
          type: "diagram",
          artifact: "shapes",
          step: 4,
          at: { word: "waitUntil" },
        },
      ],
    },
    {
      id: "set-and-finish",
      text: "Shape one: set and finish. The body sets a voltage and ends — same tick. Nothing to wait on, nothing to clean up. It schedules, runs once, and is done before the next loop comes around.",
      camera: CODE1,
      events: [
        {
          type: "code-state",
          artifact: "finish-code",
          state: 1,
          at: { progress: 0.03 },
        },
        {
          type: "code-state",
          artifact: "finish-code",
          state: 2,
          at: { word: "voltage" },
        },
      ],
      holdAfter: 0.8,
    },
    {
      id: "set-and-park",
      text: "Shape two: set and park. Command the position once, then coroutine dot park yields forever. The closed-loop controller keeps working on the motor while the command holds the mechanism — until something cancels it.",
      camera: CODE2,
      events: [
        {
          type: "code-state",
          artifact: "wait-code",
          state: 1,
          at: { word: "park" },
        },
      ],
    },
    {
      id: "set-and-wait",
      text: "Shape three: set and waitUntil. Command the target, then wait until the arm actually arrives. The moment the condition turns true, the body falls off the end — and the command finishes on its own.",
      camera: { x: 7620, y: 480, width: 1500, height: 680 },
      events: [
        {
          type: "code-state",
          artifact: "wait-code",
          state: 2,
          at: { word: "waitUntil" },
        },
      ],
      holdAfter: 1.0,
    },
    {
      id: "habits",
      text: "Two habits keep these honest. Every factory call returns a fresh command, so two buttons never share state. And cleanup on cancellation lives in whenCanceled — never at the bottom of a body that may never reach it.",
      camera: DIAGRAM,
      holdAfter: 0.6,
    },
    {
      id: "cta",
      text: "Set and finish, set and park, set and waitUntil — that's the whole vocabulary. Watch each shape run on a real arm, then compose them into routines, at frc5712.com.",
      camera: END,
      holdAfter: 1.2,
    },
  ],
};
