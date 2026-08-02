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
      text: "One loop decides everything your robot does, fifty times a second, forever. Miss how that loop makes its decisions and you get the classic symptoms: an arm that twitches, an auto that stalls on step two, and a night of print statements. So we're going slow through the part nobody explains.",
      camera: TITLE,
      holdAfter: 0.5,
    },
    {
      id: "tick-when",
      text: "Start with the trigger. It isn't an event and it doesn't queue anything up. It's a boolean that something keeps asking about: whether the A button is down, whether the flywheel got up to speed. Every tick, the scheduler asks all of them and decides what the answers ought to change.",
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
      text: "When something goes true, a command gets scheduled. Every command declares the Mechanism it moves. That isn't a convention you can skip: in version three a command is a factory method on the class that owns the motor. Which is what buys you the guarantee that two commands never write to the same hardware.",
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
      text: "Arm extends Mechanism. The TalonFX is a private field, and that's the point: nothing outside this class can touch that motor, so teleop can't start fighting your auto over it. Everything moves through a factory method on the Arm. Each one ends with a name, or it won't compile.",
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
      text: "Call this one a hold. It's the shape you'll write ninety percent of the time: runRepeatedly re-fires the same closed-loop request tick after tick, which is what fights gravity, so stop asking and the arm drops. The command has no ending. That's deliberate.",
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
      text: "One rule falls out of that, and it's the rule that eats a Saturday. Drop a bare hold into a sequence and the sequence sits on it. Forever. Your auto drives out, raises the arm, then spends the last twelve seconds of the match doing nothing. The stuck step is named hold.",
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
      text: "A routine needs to know when the arm actually got there, and the tempting move is to write a scoring-and-wait factory. Don't. The Arm only answers a question: am I inside tolerance. Whoever chains the routine bolts the finish line on there, which keeps the decision next to the routine that cares about it.",
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
      text: "Two commands, one arm. It happens constantly: the stowed hold is running, your driver hits the scoring button, and now two pieces of code both want that motor. Plenty of frameworks would let them both write and let whichever ran last win the tick. That's how arms twitch.",
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
      text: "Version three settles that in one tick. The scoring hold needs the Arm. The scheduler doesn't ask anybody; it cancels whichever command is older, and scoring takes the motor. No sharing, no negotiation. Newest schedule wins, which is why a driver's button always beats a routine that's still running.",
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
      text: "There's one dial that changes the outcome: priority. Every command carries a number, zero by default, and withPriority raises it enough to shove a lower command off the mechanism. You'll use this twice: a safety stop that refuses to lose, and a climb nothing gets to interrupt.",
      camera: { x: 8300, y: 330, width: 1280, height: 760 },
      holdAfter: 0.5,
    },
    {
      id: "cancellation",
      text: "A hold ends one way: something cancels it. Driver lets go, a finish line trips, a higher-priority command muscles in. Usually you don't care, because the TalonFX holds its last request until someone sends a new one. A climber under load needs a hand on the way out. That's what whenCanceled is for.",
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
      text: "When no command claims a mechanism, its default command runs. Ships as idle, which does nothing, and that's a perfectly good answer for a drivetrain. For an arm it's a wasted opportunity: point the default at the stowed hold, and the arm parks itself the instant your driver stops asking for anything.",
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
      text: "Chaining is where the one rule earns its keep. Command.sequence runs steps in order, and DriveToPose is fine, because it ends by itself once the robot arrives. The stow step won't. So the routine attaches the finish line, asking the arm whether it's in tolerance, and moves on the moment that goes true.",
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
      text: "Two more tools. A race pairs a step with a hold and ends the instant either one finishes; the hold never will, so the step decides. That's Command.race. Then withTimeout, the seatbelt: cap anything waiting on a sensor, because a beam break that never trips shouldn't cost you the auto.",
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
      text: "Last layer. Teleop is a class in version three, an OpMode, and its bindings live in the constructor. Holds attach with whileTrue. Press and hold A, scoring runs; let go, and the scheduler drops it, so the arm goes back to whatever it does when nobody is asking.",
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
      text: "Its sibling, onTrue, fires once on the press and then walks away. Right for a heading reset, or a shot that ends when the piece is gone. Wire a hold to onTrue and nothing short of the match ending takes it back.",
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
      text: "Bindings clean up after themselves, which is the part that used to eat a hundred lines of teardown code. Each one belongs to the OpMode that built it, so switching to autonomous takes the teleop bindings with it. Nothing to unregister.",
      camera: OPMODE_CODE,
      holdAfter: 0.5,
    },
    {
      id: "cta",
      text: "Coroutines are the advanced dialect underneath all of this, and you can ignore them for a season and still ship a robot that works. The one rule you cannot ignore. So go write a hold, chain it into an auto, and get a sequence stuck on purpose, where it costs you nothing.",
      camera: END,
      holdAfter: 1.2,
    },
  ],
};
