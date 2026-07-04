import type { Rect, TrailerScript } from "../lib/types";

// The framework video: triggers (WHEN), mechanisms (WHAT), commands (HOW),
// and the scheduler that ties them together — shown as a living diagram,
// then as real Commands v3 code.

const TITLE: Rect = { x: 0, y: 0, width: 1920, height: 1080 };
const DIAGRAM: Rect = { x: 2560, y: 160, width: 2200, height: 1100 };
const CODE: Rect = { x: 5480, y: 180, width: 1620, height: 1000 };
const CODE2: Rect = { x: 7560, y: 260, width: 1500, height: 780 };
const END: Rect = { x: 9800, y: 60, width: 1920, height: 1080 };

const MECHANISM_CODE = `public class Arm extends Mechanism {
  private final TalonFX motor = new TalonFX(31);
  private final PositionVoltage positionVoltage = new PositionVoltage(0);

  // A command is a coroutine body wrapped by run(...).
  public Command setVoltage(double volts) {
    return run(coroutine -> motor.setControl(voltageOut.withOutput(volts)))
        .named("Arm:setVoltage:" + volts);
  }

  // Set a target, wait until we arrive, then finish on our own.
  public Command goTo(Angle target, Angle tolerance) {
    return run(coroutine -> {
      motor.setControl(positionVoltage.withPosition(target.in(Degrees)));
      coroutine.waitUntil(() -> atTarget(target, tolerance));
    }).named("Arm:goTo:" + target.in(Degrees));
  }
}`;

const COMPOSE_CODE = `// The result requires everything its children require,
// so the scheduler knows the plan before it starts.
public Command scoreSequence() {
  return Command.sequence(
      arm.goTo(SCORING, TOL),
      Command.parallel(flywheel.spinUp(), intake.feed()),
      arm.goTo(STOWED, TOL)
  ).named("scoreSequence");
}`;

export const CommandFrameworkTrailer: TrailerScript = {
  id: "CommandFrameworkTrailer",
  voice: "af_heart",
  world: [
    {
      kind: "title",
      id: "title",
      rect: TITLE,
      title: "Command-Based, v3",
      subtitle: "Triggers, mechanisms, commands — and the loop that runs them",
      accent: "purple",
    },
    {
      kind: "diagram",
      id: "flow",
      rect: DIAGRAM,
      title: "One tick of the scheduler",
      nodes: [
        {
          id: "trigger",
          label: "Trigger",
          sublabel: "driver.a() — the WHEN",
          x: 80,
          y: 440,
          width: 460,
          height: 220,
          accent: "amber",
          step: 1,
        },
        {
          id: "scheduler",
          label: "Scheduler",
          sublabel: "the loop that decides",
          x: 880,
          y: 440,
          width: 460,
          height: 220,
          accent: "purple",
          step: 2,
        },
        {
          id: "command",
          label: "Command",
          sublabel: "goTo(SCORING) — the HOW",
          x: 1680,
          y: 150,
          width: 460,
          height: 220,
          accent: "blue",
          step: 3,
        },
        {
          id: "mechanism",
          label: "Mechanism",
          sublabel: "the Arm — the WHAT",
          x: 1680,
          y: 730,
          width: 460,
          height: 220,
          accent: "mint",
          step: 4,
        },
      ],
      edges: [
        { from: "trigger", to: "scheduler", label: "fires" },
        { from: "scheduler", to: "command", label: "schedules" },
        { from: "command", to: "mechanism", label: "requires" },
      ],
    },
    {
      kind: "code",
      id: "mechanism-code",
      rect: CODE,
      fileName: "Arm.java",
      language: "java",
      states: ["", MECHANISM_CODE],
    },
    {
      kind: "code",
      id: "compose-code",
      rect: CODE2,
      fileName: "Routines.java",
      language: "java",
      states: ["", COMPOSE_CODE],
    },
    {
      kind: "end",
      id: "end",
      rect: END,
      title: "Mechanisms, then commands, then triggers",
      subtitle: "The order every workshop step builds on",
      url: "frc5712.com/command-framework",
    },
  ],
  beats: [
    {
      id: "hook",
      text: "Robot code has one hard problem: everything wants to happen at once. Commands version three untangles it with three small ideas and one loop — and it's the framework behind every step of this workshop.",
      camera: TITLE,
      holdAfter: 0.5,
    },
    {
      id: "trigger",
      text: "First idea: the trigger. A button, a sensor, any boolean expression. A trigger is the WHEN — the moment something should start.",
      camera: { x: 2580, y: 400, width: 1500, height: 820 },
      events: [
        { type: "diagram", artifact: "flow", step: 1, at: { word: "trigger" } },
      ],
    },
    {
      id: "scheduler",
      text: "Watching every trigger is the scheduler — the loop at the heart of the robot. Each tick, it decides what runs, what keeps running, and what gets cancelled.",
      camera: { x: 3100, y: 380, width: 1600, height: 860 },
      events: [
        {
          type: "diagram",
          artifact: "flow",
          step: 2,
          at: { word: "scheduler" },
        },
      ],
    },
    {
      id: "command-mechanism",
      text: "What it schedules is a command — the HOW. And every command declares the mechanism it needs — the WHAT, one class per physical thing. The scheduler tracks that ownership, so two commands can never fight over the same motor.",
      camera: DIAGRAM,
      events: [
        { type: "diagram", artifact: "flow", step: 3, at: { word: "command" } },
        {
          type: "diagram",
          artifact: "flow",
          step: 4,
          at: { word: "mechanism" },
        },
      ],
    },
    {
      id: "code",
      text: "Here's a real mechanism. Hardware lives in private fields, and every command is a factory method: run wraps a coroutine body, and the chain must end in dot named — the compiler refuses an unnamed command. Need to wait? Yield, like waitUntil the arm arrives.",
      camera: CODE,
      events: [
        {
          type: "code-state",
          artifact: "mechanism-code",
          state: 1,
          at: { progress: 0.03 },
        },
      ],
      holdAfter: 1.0,
    },
    {
      id: "compose",
      text: "And whole commands compose. Sequence them, run them in parallel — the result automatically requires everything its children require. One factory method, and a full scoring routine is a schedulable command.",
      camera: CODE2,
      events: [
        {
          type: "code-state",
          artifact: "compose-code",
          state: 1,
          at: { progress: 0.05 },
        },
      ],
      holdAfter: 1.4,
    },
    {
      id: "cta",
      text: "Mechanisms first, then commands, then triggers — that's the order the whole workshop builds in. See the full framework lesson at frc5712.com.",
      camera: END,
      holdAfter: 1.2,
    },
  ],
};
