import type { Rect, TrailerScript } from "../lib/types";

// Full-length commands lesson (~5 min). Consolidates the CommandFramework,
// AddingCommands, and Triggers trailers and goes past them: the scheduler
// tick, mechanism anatomy, the three command shapes, the requirements
// conflict and takeover, cancellation via whenCanceled, default commands,
// composition factories and coroutine helpers, and OpMode-scoped bindings.

const TITLE: Rect = { x: 0, y: 0, width: 1920, height: 1080 };
const FLOW: Rect = { x: 2560, y: 160, width: 2200, height: 1100 };
const SHAPES_CODE: Rect = { x: 5480, y: 180, width: 1620, height: 1000 };
const CONFLICT: Rect = { x: 7800, y: 160, width: 2200, height: 1100 };
const SAFETY_CODE: Rect = { x: 10720, y: 220, width: 1560, height: 960 };
const COMPOSE_CODE: Rect = { x: 12980, y: 200, width: 1620, height: 1000 };
const OPMODE_CODE: Rect = { x: 15260, y: 200, width: 1560, height: 1000 };
const END: Rect = { x: 17480, y: 60, width: 1920, height: 1080 };

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

const GOTO_WHEN_CANCELED = `public Command goTo(Angle target, Angle tolerance) {
  return run(coroutine -> {
        motor.setControl(positionVoltage.withPosition(target.in(Degrees)));
        coroutine.waitUntil(() -> atTarget(target, tolerance));
      })
      .whenCanceled(() -> motor.setControl(voltageOut.withOutput(0)))
      .named("Arm:goTo:" + target.in(Degrees));
}`;

const GOTO_WITH_DEFAULT = `public Arm() {
  // Publish telemetry every loop while idle; a real command pre-empts it.
  setDefaultCommand(runRepeatedly(this::publishTelemetry).named("Arm:telemetry"));
}

public Command goTo(Angle target, Angle tolerance) {
  return run(coroutine -> {
        motor.setControl(positionVoltage.withPosition(target.in(Degrees)));
        coroutine.waitUntil(() -> atTarget(target, tolerance));
      })
      .whenCanceled(() -> motor.setControl(voltageOut.withOutput(0)))
      .named("Arm:goTo:" + target.in(Degrees));
}`;

const COMPOSE = `// The result requires everything its children require,
// so the scheduler knows the plan before it starts.
public Command scoreSequence() {
  return Command.sequence(
      arm.goTo(SCORING, TOL),
      Command.parallel(flywheel.spinUp(), intake.feed()),
      arm.goTo(STOWED, TOL)
  ).named("scoreSequence");
}`;

const PARALLEL_SHAPES = `// "Run both, finish when both finish."
//   Command.parallel(a, b)                       // factory flavor
//   coroutine.awaitAll(a, b)                     // coroutine flavor

// "Run both, finish when the first one finishes; cancel the loser."
//   coroutine.awaitAny(a, b)

// "Run both, finish when the deadline (first arg) finishes; cancel the rest."
//   coroutine -> { coroutine.fork(background); coroutine.await(deadline); }
//        (fork starts background, await blocks on deadline,
//         coroutine exit cancels the still-running fork)`;

const COMPOSE_WITH_PARALLEL = `${COMPOSE}

${PARALLEL_SHAPES}`;

const OPMODE_SKELETON = `@Teleop(name = "Teleop")
public class TeleopOpMode extends PeriodicOpMode {
  private final CommandNiDsXboxController driver =
      new CommandNiDsXboxController(0);
}`;

const OPMODE_ONTRUE = `@Teleop(name = "Teleop")
public class TeleopOpMode extends PeriodicOpMode {
  private final CommandNiDsXboxController driver =
      new CommandNiDsXboxController(0);

  public TeleopOpMode(Robot robot) {
    final Arm arm = robot.arm;

    // Button -> command, fired at the rising edge.
    driver.a().onTrue(arm.goTo(HIGH, TOL));
  }
}`;

const OPMODE_FULL = `@Teleop(name = "Teleop")
public class TeleopOpMode extends PeriodicOpMode {
  private final CommandNiDsXboxController driver =
      new CommandNiDsXboxController(0);

  public TeleopOpMode(Robot robot) {
    final Arm arm = robot.arm;

    // Button -> command, fired at the rising edge.
    driver.a().onTrue(arm.goTo(HIGH, TOL));

    // Hold to keep it scheduled; release cancels it.
    driver.leftBumper().whileTrue(arm.holdAt(STOWED));
  }
}`;

export const CommandsLesson: TrailerScript = {
  id: "CommandsLesson",
  voice: "af_heart",
  world: [
    {
      kind: "title",
      id: "title",
      rect: TITLE,
      title: "Commands, In Full",
      subtitle:
        "The deep dive — shapes, conflicts, cancellation, and the loop that runs them",
      accent: "purple",
    },
    {
      kind: "diagram",
      id: "flow",
      rect: FLOW,
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
      id: "shapes-code",
      rect: SHAPES_CODE,
      fileName: "Arm.java",
      language: "java",
      states: [
        "",
        ARM_SKELETON,
        ARM_SET_AND_FINISH,
        ARM_PARK,
        ARM_PARK_AND_WAIT,
      ],
    },
    {
      kind: "diagram",
      id: "conflict",
      rect: CONFLICT,
      title: "Two commands, one mechanism",
      nodes: [
        {
          id: "holdat",
          label: "holdAt(STOWED)",
          sublabel: "running — parked on the Arm",
          x: 80,
          y: 150,
          width: 460,
          height: 220,
          accent: "amber",
          step: 1,
        },
        {
          id: "goto",
          label: "goTo(HIGH)",
          sublabel: "just scheduled — needs the Arm",
          x: 80,
          y: 730,
          width: 460,
          height: 220,
          accent: "blue",
          step: 2,
        },
        {
          id: "scheduler",
          label: "Scheduler",
          sublabel: "tracks who owns what",
          x: 880,
          y: 440,
          width: 460,
          height: 220,
          accent: "purple",
        },
        {
          id: "arm",
          label: "Arm",
          sublabel: "one owner at a time",
          x: 1680,
          y: 440,
          width: 460,
          height: 220,
          accent: "mint",
        },
      ],
      edges: [
        { from: "holdat", to: "arm", label: "owns", step: 1 },
        { from: "goto", to: "scheduler", label: "requires Arm", step: 2 },
        { from: "scheduler", to: "holdat", label: "cancels (older)", step: 3 },
        { from: "goto", to: "arm", label: "takes over", step: 4 },
      ],
    },
    {
      kind: "code",
      id: "safety-code",
      rect: SAFETY_CODE,
      fileName: "Arm.java",
      language: "java",
      states: ["", GOTO_WHEN_CANCELED, GOTO_WITH_DEFAULT],
    },
    {
      kind: "code",
      id: "compose-code",
      rect: COMPOSE_CODE,
      fileName: "Routines.java",
      language: "java",
      states: ["", COMPOSE, COMPOSE_WITH_PARALLEL],
    },
    {
      kind: "code",
      id: "opmode-code",
      rect: OPMODE_CODE,
      fileName: "TeleopOpMode.java",
      language: "java",
      states: ["", OPMODE_SKELETON, OPMODE_ONTRUE, OPMODE_FULL],
    },
    {
      kind: "end",
      id: "end",
      rect: END,
      title: "One loop. One owner per mechanism.",
      subtitle:
        "Mechanisms, then commands, then triggers — build in that order",
      url: "frc5712.com/command-framework",
    },
  ],
  beats: [
    {
      id: "hook",
      text: "This is the full command framework lesson. One loop schedules everything a robot does — and this time we go past the trailer: the three shapes of a command, what happens when two commands want one mechanism, cancellation, default commands, compositions, and bindings that clean up after themselves.",
      camera: TITLE,
      holdAfter: 0.5,
    },
    {
      id: "tick-when",
      text: "Everything hangs off one tick of the loop. A trigger — a button, a sensor, any boolean expression — is the WHEN, the moment something should start. And watching every trigger is the scheduler: each tick, it decides what runs, what keeps running, and what gets cancelled.",
      camera: { x: 2580, y: 380, width: 1600, height: 880 },
      events: [
        { type: "diagram", artifact: "flow", step: 1, at: { word: "trigger" } },
        {
          type: "diagram",
          artifact: "flow",
          step: 2,
          at: { word: "scheduler" },
        },
      ],
    },
    {
      id: "tick-how-what",
      text: "When a trigger fires, the scheduler starts a command — the HOW. And every command declares the mechanism it needs — the WHAT, one class per physical thing. The scheduler tracks that ownership constantly, and that single rule means two commands can never fight over the same motor.",
      camera: FLOW,
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
      id: "anatomy",
      text: "Here's what a mechanism looks like. Arm extends Mechanism, and the hardware lives in private fields. Every command is a factory method on the class: run wraps one coroutine body, and the chain must end in dot named, because the compiler refuses an unnamed command.",
      camera: SHAPES_CODE,
      events: [
        {
          type: "code-state",
          artifact: "shapes-code",
          state: 1,
          at: { progress: 0.03 },
        },
      ],
      holdAfter: 0.6,
    },
    {
      id: "shape-finish",
      text: "Shape one: set and finish. The body sets a voltage and ends — same tick. Nothing to wait on, nothing to clean up, and the coroutine parameter sits unused. It schedules, runs once, and is done before the next loop comes around.",
      camera: SHAPES_CODE,
      events: [
        {
          type: "code-state",
          artifact: "shapes-code",
          state: 2,
          at: { word: "voltage" },
        },
      ],
      holdAfter: 0.6,
    },
    {
      id: "shape-park",
      text: "Shape two: set and park. Command the position once, then coroutine dot park yields forever. The closed-loop controller keeps working the motor while the command holds the mechanism — it stays scheduled until something else pre-empts it. This is the shape behind every hold-in-place behavior.",
      camera: SHAPES_CODE,
      events: [
        {
          type: "code-state",
          artifact: "shapes-code",
          state: 3,
          at: { word: "park" },
        },
      ],
    },
    {
      id: "shape-wait",
      text: "Shape three: set and waitUntil. Command the target, then wait until the arm actually arrives. The moment the condition turns true, the body falls off the end, and the command finishes on its own. Ask what a command has to wait for — that answer picks its shape.",
      camera: { x: 5540, y: 460, width: 1500, height: 700 },
      events: [
        {
          type: "code-state",
          artifact: "shapes-code",
          state: 4,
          at: { word: "waitUntil" },
        },
      ],
      holdAfter: 1.0,
    },
    {
      id: "conflict-setup",
      text: "Now the question the whole framework turns on: two commands want the arm at once. Say holdAt STOWED is running — it parked, and it owns the Arm. The scheduler tracks which command owns which mechanism, and ownership is exclusive. One owner per mechanism, always.",
      camera: CONFLICT,
      events: [
        {
          type: "diagram",
          artifact: "conflict",
          step: 1,
          at: { word: "holdAt" },
        },
      ],
    },
    {
      id: "conflict-takeover",
      text: "Press a button and goTo HIGH gets scheduled — and it requires the Arm too. The scheduler settles it immediately: it cancels the older command, dropping holdAt mid-park, and goTo takes over the mechanism. No negotiation, no shared control — the newer command simply owns the arm now.",
      camera: CONFLICT,
      events: [
        {
          type: "diagram",
          artifact: "conflict",
          step: 2,
          at: { word: "goTo" },
        },
        {
          type: "diagram",
          artifact: "conflict",
          step: 3,
          at: { word: "cancels" },
        },
        {
          type: "diagram",
          artifact: "conflict",
          step: 4,
          at: { word: "takes" },
        },
      ],
      holdAfter: 0.6,
    },
    {
      id: "conflict-priority",
      text: "One knob changes that outcome: priority. Default priority is zero, and idle is the lowest. Raise a command with withPriority and it pre-empts a lower-priority command that's already running on the same mechanism — which is exactly how an emergency stop refuses to lose the argument.",
      camera: { x: 8300, y: 330, width: 1280, height: 760 },
      holdAfter: 0.5,
    },
    {
      id: "cancellation",
      text: "Cancellation has a sharp edge. A cancelled coroutine is simply dropped — code after a park or an unfinished waitUntil never runs, so a cleanup line at the bottom of the body won't fire. Interrupt cleanup lives in whenCanceled, a hook that fires only on cancellation. Two endings, two places.",
      camera: SAFETY_CODE,
      events: [
        {
          type: "code-state",
          artifact: "safety-code",
          state: 1,
          at: { progress: 0.03 },
        },
      ],
      holdAfter: 1.0,
    },
    {
      id: "defaults",
      text: "So what runs when nothing claims a mechanism? Every mechanism has a default command. The scheduler runs it whenever no higher-priority command requires that mechanism, and pre-empts it the moment one does. Out of the box that's idle — or set your own, like runRepeatedly publishing telemetry every loop.",
      camera: SAFETY_CODE,
      events: [
        {
          type: "code-state",
          artifact: "safety-code",
          state: 2,
          at: { word: "default" },
        },
      ],
      holdAfter: 0.8,
    },
    {
      id: "compose",
      text: "Whole commands compose. Command dot sequence chains them, Command dot parallel runs them together, and the result automatically requires everything its children require — the scheduler knows the full plan before it starts. One factory method, and a complete scoring routine is a schedulable command.",
      camera: COMPOSE_CODE,
      events: [
        {
          type: "code-state",
          artifact: "compose-code",
          state: 1,
          at: { progress: 0.03 },
        },
      ],
      holdAfter: 0.6,
    },
    {
      id: "parallel-flavors",
      text: "Parallel comes in three flavors. Run both, finish when both finish — the parallel factory, or awaitAll inside a body. Run both, first one to finish wins, cancel the loser — awaitAny. And fork plus await builds a deadline: a fork still running when the body exits is cancelled automatically.",
      camera: { x: 13040, y: 520, width: 1500, height: 660 },
      events: [
        {
          type: "code-state",
          artifact: "compose-code",
          state: 2,
          at: { word: "flavors" },
        },
      ],
      holdAfter: 1.0,
    },
    {
      id: "ontrue",
      text: "Last layer: the bindings. Teleop is a class — an OpMode — and its bindings live in the constructor. Bind driver dot a onTrue, and pressing the button fires the command once, at the rising edge. goTo takes it from there and finishes on its own.",
      camera: OPMODE_CODE,
      events: [
        {
          type: "code-state",
          artifact: "opmode-code",
          state: 1,
          at: { progress: 0.03 },
        },
        {
          type: "code-state",
          artifact: "opmode-code",
          state: 2,
          at: { word: "onTrue" },
        },
      ],
    },
    {
      id: "whiletrue",
      text: "whileTrue is the hold. Keep the left bumper down and holdAt stays scheduled; let go, and the scheduler cancels it for you — the same takeover machinery, driven by a button release. A press is a moment, a hold is a state — pick the verb that matches.",
      camera: { x: 15320, y: 380, width: 1440, height: 810 },
      events: [
        {
          type: "code-state",
          artifact: "opmode-code",
          state: 3,
          at: { word: "whileTrue" },
        },
      ],
      holdAfter: 0.6,
    },
    {
      id: "teardown",
      text: "And because bindings are scoped to the OpMode constructor, they clean up after themselves. Switch modes and the old OpMode's bindings are torn down automatically; pick teleop again and a fresh OpMode constructs fresh bindings. You never unregister anything by hand.",
      camera: OPMODE_CODE,
      holdAfter: 0.5,
    },
    {
      id: "cta",
      text: "That's the framework in full: three shapes for a body, one owner per mechanism, whenCanceled for the exits, defaults for the quiet ticks, factories for the routines, and bindings that die with their mode. Every piece, with runnable code, at frc5712.com.",
      camera: END,
      holdAfter: 1.2,
    },
  ],
};
