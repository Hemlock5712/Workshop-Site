import type { Rect, TrailerScript } from "../lib/types";

// Full-length commands lesson (~5 min). Consolidates the CommandFramework,
// AddingCommands, and Triggers trailers and goes past them: the scheduler
// tick, mechanism anatomy, holds and THE ONE RULE, the requirements conflict
// and takeover, priority, whenCanceled cleanup, default commands, chained
// routines (sequence / .until / race / withTimeout), and OpMode-scoped
// whileTrue bindings. Mirrors the settled conventions on the site's
// command-framework, adding-commands, and triggers pages.

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

const ARM_HOLD = `public class Arm extends Mechanism {
  private final TalonFX motor = new TalonFX(31);
  private final VoltageOut voltageOut = new VoltageOut(0);
  private final PositionVoltage positionVoltage = new PositionVoltage(0);

  // The everyday shape: a hold. runRepeatedly re-sends the
  // setpoint every tick, forever. It never finishes on its own.
  public Command scoring() {
    return runRepeatedly(() -> setPosition(SCORING_POSITION))
        .named("scoring (hold)");
  }
}`;

const ARM_ONE_RULE = `public class Arm extends Mechanism {
  // THE ONE RULE: a hold never finishes, so nothing may
  // ever wait on a hold. A bare hold inside
  // Command.sequence(...) sticks there forever — and the
  // "(hold)" name on the dashboard is your debugging clue.
  public Command scoring() {
    return runRepeatedly(() -> setPosition(SCORING_POSITION))
        .named("scoring (hold)");
  }
}`;

const ARM_QUESTION = `public class Arm extends Mechanism {
  public Command scoring() {
    return runRepeatedly(() -> setPosition(SCORING_POSITION))
        .named("scoring (hold)");
  }

  // Not a command — a question other code can ask. Chains
  // use it as a finish line, always at the call site:
  //   arm.scoring().until(arm::isAtTarget)
  public boolean isAtTarget() {
    return Math.abs(getPosition() - getTargetPosition()) < TOLERANCE;
  }

  // Private. The only way to move the arm is a command.
  private void setPosition(double position) { ... }
}`;

const SCORING_WHEN_CANCELED = `// Most holds need no cleanup: the motor keeps its last
// closed-loop request until the next command replaces it.
// When cleanup IS needed, whenCanceled is the hook —
// it fires only when the command is cancelled.
public Command scoring() {
  return runRepeatedly(() -> setPosition(SCORING_POSITION))
      .whenCanceled(() -> motor.setControl(voltageOut.withOutput(0)))
      .named("scoring (hold)");
}`;

const SCORING_WITH_DEFAULT = `public Arm() {
  // When nothing claims the arm, fall back to the stowed hold.
  // Out of the box the default is idle(); override it with one
  // of the mechanism's own holds.
  setDefaultCommand(stowed());
}

public Command scoring() {
  return runRepeatedly(() -> setPosition(SCORING_POSITION))
      .whenCanceled(() -> motor.setControl(voltageOut.withOutput(0)))
      .named("scoring (hold)");
}`;

const CHAIN_SEQUENCE = `// An auto routine, chained: drive out, then stow the arm.
routine =
    Command.sequence(
            // DriveToPose finishes on its own — it can
            // sit in a sequence as-is.
            new DriveToPose(robot.drivetrain, pose1),
            // stow() is a hold. .until(...) gives it a
            // finish line, right at the call site.
            robot.stow().until(robot.arm::isAtTarget)
                .named("stow until stowed"))
        .named("Drive Then Stow");`;

const CHAIN_FULL = `// The full routine: drive out, stow, drive back.
routine =
    Command.sequence(
            // DriveToPose finishes on its own — it can
            // sit in a sequence as-is.
            new DriveToPose(robot.drivetrain, pose1),
            // stow() is a hold. .until(...) gives it a
            // finish line; .withTimeout(...) is the seatbelt.
            robot.stow().until(robot.arm::isAtTarget)
                .withTimeout(Seconds.of(2))
                .named("stow until stowed"),
            // Leg 2 WHILE holding the stow pose. The hold
            // never finishes, so the drive always decides —
            // then the race cancels the hold.
            Command.race(
                    new DriveToPose(robot.drivetrain, pose2),
                    robot.stow())
                .named("drive holding stow"))
        .named("Drive Stow Drive (Chained)");`;

const OPMODE_SKELETON = `@Teleop(name = "Teleop")
public class TeleopOpMode extends PeriodicOpMode {
  private final CommandNiDsXboxController driver =
      new CommandNiDsXboxController(0);
}`;

const OPMODE_WHILETRUE = `@Teleop(name = "Teleop")
public class TeleopOpMode extends PeriodicOpMode {
  private final CommandNiDsXboxController driver =
      new CommandNiDsXboxController(0);

  public TeleopOpMode(Robot robot) {
    final Arm arm = robot.arm;

    // Holds are bound with whileTrue: hold A, the hold runs;
    // release A, the arm's default command takes back over.
    driver.a().whileTrue(arm.scoring());
  }
}`;

const OPMODE_FULL = `@Teleop(name = "Teleop")
public class TeleopOpMode extends PeriodicOpMode {
  private final CommandNiDsXboxController driver =
      new CommandNiDsXboxController(0);

  public TeleopOpMode(Robot robot) {
    final Arm arm = robot.arm;

    // Holds are bound with whileTrue: hold A, the hold runs;
    // release A, the arm's default command takes back over.
    driver.a().whileTrue(arm.scoring());

    // onTrue is for self-finishing commands ONLY — a hold
    // bound with onTrue would run forever.
    driver.start().onTrue(robot.drivetrain.resetHeading());
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
        "The deep dive — holds, the one rule, chaining, and the loop that runs them",
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
          sublabel: "arm.scoring() — the HOW",
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
      states: ["", ARM_SKELETON, ARM_HOLD, ARM_ONE_RULE, ARM_QUESTION],
    },
    {
      kind: "diagram",
      id: "conflict",
      rect: CONFLICT,
      title: "Two commands, one mechanism",
      nodes: [
        {
          id: "holdat",
          label: "arm.stowed()",
          sublabel: "running — it owns the Arm",
          x: 80,
          y: 150,
          width: 460,
          height: 220,
          accent: "amber",
          step: 1,
        },
        {
          id: "goto",
          label: "arm.scoring()",
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
      states: ["", SCORING_WHEN_CANCELED, SCORING_WITH_DEFAULT],
    },
    {
      kind: "code",
      id: "compose-code",
      rect: COMPOSE_CODE,
      fileName: "AutoOpMode.java",
      language: "java",
      states: ["", CHAIN_SEQUENCE, CHAIN_FULL],
    },
    {
      kind: "code",
      id: "opmode-code",
      rect: OPMODE_CODE,
      fileName: "TeleopOpMode.java",
      language: "java",
      states: ["", OPMODE_SKELETON, OPMODE_WHILETRUE, OPMODE_FULL],
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
      text: "This is the full command framework lesson. One loop runs everything a robot does. Today we go deep. You will learn holds, the commands that never finish. You will learn the one rule that keeps holds safe. Then conflicts, cancellation, default commands, chained routines, and bindings that clean up after themselves.",
      camera: TITLE,
      holdAfter: 0.5,
    },
    {
      id: "tick-when",
      text: "Everything starts with one tick of the loop. First piece: the trigger. A trigger is anything that answers true or false. A button. A sensor. The trigger is the WHEN. It marks the moment something should start. Watching every trigger is the scheduler. Each tick, it decides what runs, what keeps running, and what gets cancelled.",
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
      text: "When a trigger fires, the scheduler starts a command. A command is one action the robot can do. That is the HOW. Every command names the mechanism it needs. A mechanism is one physical thing, like the arm. That is the WHAT. The scheduler tracks who owns what. One owner per mechanism. So two commands can never fight over the same motor.",
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
      text: "Here's what a mechanism looks like in code. Arm extends Mechanism. The hardware lives in private fields. Private means only the Arm can touch the motor. Everything else must go through a command, a factory method on this class. And every command must end in dot named. An unnamed command will not even compile.",
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
      text: "Now the everyday shape: a hold. runRepeatedly runs its body every scheduler tick. So this command re-sends the target position forever. The arm goes to the angle and stays there, fighting gravity. And the name ends in hold, in parentheses. That suffix is the team's convention.",
      camera: SHAPES_CODE,
      events: [
        {
          type: "code-state",
          artifact: "shapes-code",
          state: 2,
          at: { word: "hold" },
        },
      ],
      holdAfter: 0.6,
    },
    {
      id: "shape-park",
      text: "Here is the one rule, and it is the big one. A hold never finishes. So nothing may ever wait on a hold. Put a bare hold in a sequence, and the sequence sticks there forever. The next step never starts. The name is your clue: a stuck routine sitting on a hold command is the bug.",
      camera: SHAPES_CODE,
      events: [
        {
          type: "code-state",
          artifact: "shapes-code",
          state: 3,
          at: { word: "rule" },
        },
      ],
    },
    {
      id: "shape-wait",
      text: "So how does a routine wait for the arm? Never inside the factory. There is no scoring-and-wait method. Instead, the mechanism answers a question: am I at my target yet? At the call site you write dot until, arm is at target. That gives the hold a finish line, right where you need it.",
      camera: { x: 5540, y: 460, width: 1500, height: 700 },
      events: [
        {
          type: "code-state",
          artifact: "shapes-code",
          state: 4,
          at: { word: "question" },
        },
      ],
      holdAfter: 1.0,
    },
    {
      id: "conflict-setup",
      text: "Now the big question. Two commands want the arm at the same time. Say the stowed hold is running. It owns the Arm. The scheduler keeps track of which command owns which mechanism. Ownership is exclusive. One owner per mechanism, always. So what happens when a second command shows up?",
      camera: CONFLICT,
      events: [
        {
          type: "diagram",
          artifact: "conflict",
          step: 1,
          at: { word: "stowed" },
        },
      ],
    },
    {
      id: "conflict-takeover",
      text: "Press a button, and the scoring hold gets scheduled. It needs the Arm too. The scheduler settles it right away. It cancels the older command. The stowed hold is dropped. Then scoring takes over the mechanism. No sharing. No negotiation. The newer command simply owns the arm now.",
      camera: CONFLICT,
      events: [
        {
          type: "diagram",
          artifact: "conflict",
          step: 2,
          at: { word: "scoring" },
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
      text: "One setting can change that outcome: priority. Every command has a priority number. The default is zero. Idle is the lowest of all. Raise a command with withPriority, and it can pre-empt lower-priority commands on the same mechanism. That is how an emergency stop refuses to lose the argument.",
      camera: { x: 8300, y: 330, width: 1280, height: 760 },
      holdAfter: 0.5,
    },
    {
      id: "cancellation",
      text: "How does a hold end? Only by being cancelled. A driver lets go of a button, or a finish line trips. Usually that is fine, because the motor keeps its last request. But some mechanisms need cleanup when their command is taken away. That cleanup goes in whenCanceled. It is a hook that fires only on cancellation.",
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
      text: "So what runs when nothing claims a mechanism? The default command. Every mechanism has one. Out of the box it is idle, which means do nothing. Or pick your own. Here the arm falls back to its stowed hold. Release every button, and the arm tucks itself away. Press one, and that button's command takes over again.",
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
      text: "Now let's chain a routine: drive out, then stow the arm. Command dot sequence runs steps in order. The drive step finishes on its own, so it sits in the sequence as is. But stow is a hold. It gets a finish line at the call site: dot until, arm is at target. Remember the one rule. Never a bare hold in a sequence.",
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
      text: "Two more tools. Command dot race means: do this step WHILE holding. A race ends when its first member finishes, and it cancels the rest. The hold never finishes. So the step always decides. Then withTimeout, the seatbelt. Cap any step that waits on a sensor. A stuck auto moves on, instead of burning the whole period.",
      camera: { x: 13040, y: 520, width: 1500, height: 660 },
      events: [
        {
          type: "code-state",
          artifact: "compose-code",
          state: 2,
          at: { word: "race" },
        },
      ],
      holdAfter: 1.0,
    },
    {
      id: "ontrue",
      text: "Last layer: the bindings. Teleop is its own class, called an OpMode. Its bindings live in the constructor. Holds get bound with whileTrue. Hold the A button, and the scoring hold runs. Let go, and the scheduler cancels it. The arm's default command takes back over.",
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
          at: { word: "whileTrue" },
        },
      ],
    },
    {
      id: "whiletrue",
      text: "What about onTrue? onTrue fires a command once, the moment the button goes down. Save it for commands that finish on their own, like a heading reset. Never bind a bare hold with onTrue. That hold would run forever. The default command would never come back.",
      camera: { x: 15320, y: 380, width: 1440, height: 810 },
      events: [
        {
          type: "code-state",
          artifact: "opmode-code",
          state: 3,
          at: { word: "onTrue" },
        },
      ],
      holdAfter: 0.6,
    },
    {
      id: "teardown",
      text: "And bindings clean up after themselves. Every binding belongs to its OpMode. Switch modes, and the old OpMode's bindings are torn down automatically. Pick teleop again, and a fresh OpMode builds fresh bindings. You never unregister anything by hand.",
      camera: OPMODE_CODE,
      holdAfter: 0.5,
    },
    {
      id: "cta",
      text: "That is the framework in full. Holds that never finish. One rule: never wait on a hold. One owner per mechanism. Defaults for the quiet ticks. Chains for the routines. whileTrue for the buttons. Coroutines? That is the advanced dialect. You can skip it. Every piece, with runnable code, at frc5712.com.",
      camera: END,
      holdAfter: 1.2,
    },
  ],
};
