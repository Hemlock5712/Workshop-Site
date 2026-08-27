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
      text: "Almost every command on our robot is a hold. It drives the arm to an angle, then keeps on driving it there, forever, until something takes the command away. That word forever does more damage than anything else in the framework.",
      camera: TITLE,
      holdAfter: 0.5,
    },
    {
      id: "shapes",
      text: "One factory, three jobs. Write the hold once and you can bind it to a button, chain it into an auto with a finish line bolted on, or race it against another step so the step decides when both quit. Same command every time.",
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
      text: "Two lines of real work. runRepeatedly wraps the setter and re-fires it every tick, and the hold suffix on the name is what tells you at eleven at night which step your auto died on. The setter stays private, and rookies always fight that.",
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
      text: "In autonomous it costs you the whole period. Watch: the routine spins up the flywheel and then waits for a hold to finish, which it will never do. Fifteen seconds of a robot sitting still with a spinning wheel and a preload it never shot.",
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
      text: "The fix goes at the call, not in the factory. Spin up until the wheel says it's at speed, with a timeout for the day the sensor lies. Then the intake feeds while the spin-up keeps running underneath.",
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
      text: "Two habits and we're done. If a mechanism needs anything done on the way out, whenCanceled is the hook. And bind holds with whileTrue, so letting go of the button hands the arm back to its default.",
      camera: DIAGRAM,
      holdAfter: 0.6,
    },
    {
      id: "cta",
      text: "So: never wait on a hold. Put the finish line at the call, and the dashboard will tell you the day you forget.",
      camera: END,
      holdAfter: 1.2,
    },
  ],
};
