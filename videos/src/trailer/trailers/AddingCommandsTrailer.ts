import type { Rect, TrailerScript } from "../lib/types";

// Commands are holds. The camera travels: title card → one-hold-three-uses
// diagram → the hold factory typed into Arm.java → a chained auto that first
// sticks on a bare hold, then gets its finish line → back to the diagram
// for the closing habits → end card.

const TITLE: Rect = { x: 0, y: 0, width: 1920, height: 1080 };
const DIAGRAM: Rect = { x: 2560, y: 160, width: 2200, height: 1100 };
const CODE1: Rect = { x: 5480, y: 220, width: 1560, height: 900 };
const CODE2: Rect = { x: 7560, y: 180, width: 1620, height: 1000 };
const END: Rect = { x: 9800, y: 60, width: 1920, height: 1080 };

const ARM_SKELETON = `public class Arm extends Mechanism {
  private final TalonFX motor = new TalonFX(31);
  private final PositionVoltage positionVoltage = new PositionVoltage(0);

  private void setPosition(double position) { ... }
}`;

const ARM_HOLD = `public class Arm extends Mechanism {
  private final TalonFX motor = new TalonFX(31);
  private final PositionVoltage positionVoltage = new PositionVoltage(0);

  // A hold: re-sends the setpoint every tick, forever.
  public Command scoring() {
    return runRepeatedly(() -> setPosition(SCORING_POSITION))
        .named("scoring (hold)");
  }

  // Private. Commands are the only way to move the arm.
  private void setPosition(double position) { ... }
}`;

const AUTO_STUCK = `// Score the preload — chained in an @Autonomous OpMode.
routine =
    Command.sequence(
            // BUG: spinUp() is a hold. It never finishes,
            // so the sequence sticks here forever.
            robot.flywheel.spinUp(),
            robot.intake.feed())
        .named("Score Preload");`;

const AUTO_FIXED = `// Score the preload — chained in an @Autonomous OpMode.
routine =
    Command.sequence(
            // The fix: a finish line, at the call site.
            robot.flywheel.spinUp()
                .until(robot.flywheel::isAtSpeed)
                .withTimeout(Seconds.of(2)) // the seatbelt
                .named("spin up"),

            // Feed WHILE the hold keeps the wheel at speed.
            Command.race(
                    robot.intake.feed()
                        .until(robot.intake::isEmpty)
                        .named("feed until empty"),
                    robot.flywheel.spinUp())
                .named("feed holding speed"))
        .named("Score Preload");`;

export const AddingCommandsTrailer: TrailerScript = {
  id: "AddingCommandsTrailer",
  voice: "af_heart",
  world: [
    {
      kind: "title",
      id: "title",
      rect: TITLE,
      title: "Adding Commands",
      subtitle: "Holds, finish lines, and races",
      accent: "amber",
    },
    {
      kind: "diagram",
      id: "shapes",
      rect: DIAGRAM,
      title: "One hold, three ways to use it",
      nodes: [
        {
          id: "body",
          label: "A hold",
          sublabel: 'runRepeatedly + "(hold)" name',
          x: 80,
          y: 440,
          width: 460,
          height: 220,
          accent: "purple",
          step: 1,
        },
        {
          id: "finish",
          label: "Bind it",
          sublabel: "whileTrue — release gives it back",
          x: 1660,
          y: 100,
          width: 460,
          height: 220,
          accent: "mint",
          step: 2,
        },
        {
          id: "park",
          label: "Chain it",
          sublabel: ".until(...) — a finish line",
          x: 1660,
          y: 440,
          width: 460,
          height: 220,
          accent: "amber",
          step: 3,
        },
        {
          id: "wait",
          label: "Race it",
          sublabel: "do a step WHILE holding",
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
      states: ["", ARM_SKELETON, ARM_HOLD],
    },
    {
      kind: "code",
      id: "wait-code",
      rect: CODE2,
      fileName: "ScorePreloadOpMode.java",
      language: "java",
      states: ["", AUTO_STUCK, AUTO_FIXED],
    },
    {
      kind: "end",
      id: "end",
      rect: END,
      title: "A hold never finishes",
      subtitle: "runRepeatedly, .until at the call site, race to hold",
      url: "frc5712.com/adding-commands",
    },
  ],
  beats: [
    {
      id: "hook",
      text: "What can your robot do? Each answer is a command. A command is a named action from one robot part — a mechanism. On our team, almost every command is a hold. A hold keeps the arm at a target, and it never finishes.",
      camera: TITLE,
      holdAfter: 0.5,
    },
    {
      id: "shapes",
      text: "Every mechanism command starts the same way. One method, runRepeatedly, re-sends a target forever. That command is a hold. You can bind a hold to a button. You can chain it with a finish line. Or you can race it against a step. Three uses, one hold.",
      camera: DIAGRAM,
      events: [
        { type: "diagram", artifact: "shapes", step: 1, at: { word: "hold" } },
        {
          type: "diagram",
          artifact: "shapes",
          step: 2,
          at: { word: "bind" },
        },
        { type: "diagram", artifact: "shapes", step: 3, at: { word: "chain" } },
        {
          type: "diagram",
          artifact: "shapes",
          step: 4,
          at: { word: "race" },
        },
      ],
    },
    {
      id: "set-and-finish",
      text: "Here is the recipe. runRepeatedly re-sends set position over and over, forever. The name ends with the word hold, so you can spot it on the dashboard. The setter stays private. The only way to move the arm is through a command.",
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
          at: { word: "runRepeatedly" },
        },
      ],
      holdAfter: 0.8,
    },
    {
      id: "set-and-park",
      text: "Now the one rule. A hold never finishes, so nothing may ever wait on a hold. Watch this auto. The sequence reaches spin up, a hold, and sticks there forever. On the dashboard, the stuck step's name says hold. That name is your debugging clue.",
      camera: CODE2,
      events: [
        {
          type: "code-state",
          artifact: "wait-code",
          state: 1,
          at: { word: "watch" },
        },
      ],
    },
    {
      id: "set-and-wait",
      text: "The fix happens where you use the hold, not inside it. Dot until gives the hold a finish line: until the flywheel is at speed. A timeout is the seatbelt. And race means: do this step while holding.",
      camera: { x: 7620, y: 480, width: 1500, height: 680 },
      events: [
        {
          type: "code-state",
          artifact: "wait-code",
          state: 2,
          at: { word: "until" },
        },
      ],
      holdAfter: 1.0,
    },
    {
      id: "habits",
      text: "Two last habits. A hold only ends when something cancels it. Need cleanup on the way out? Put it in whenCanceled. And bind a hold with whileTrue. Release the button, and the mechanism's default command takes back over.",
      camera: DIAGRAM,
      holdAfter: 0.6,
    },
    {
      id: "cta",
      text: "Holds, finish lines, and races. That is the whole everyday toolkit. See the full lesson, with real template code, at frc5712.com.",
      camera: END,
      holdAfter: 1.2,
    },
  ],
};
