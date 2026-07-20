import type { Rect, TrailerScript } from "../lib/types";

// Bindings that clean up after themselves. The camera travels:
// title card → TeleopOpMode code built up in stages (whileTrue for holds,
// onTrue for self-finishing commands) → the three-scopes diagram →
// sensor-trigger code → end card.

const TITLE: Rect = { x: 0, y: 0, width: 1920, height: 1080 };
const CODE: Rect = { x: 2560, y: 200, width: 1560, height: 1000 };
const DIAGRAM: Rect = { x: 5480, y: 140, width: 2200, height: 1100 };
const CODE2: Rect = { x: 7960, y: 360, width: 1500, height: 600 };
const END: Rect = { x: 9820, y: 80, width: 1920, height: 1080 };

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

    // Hold A: the scoring hold runs. Release A: the hold is
    // cancelled and the arm's default command takes back over.
    driver.a().whileTrue(arm.scoring());
  }
}`;

const OPMODE_FULL = `@Teleop(name = "Teleop")
public class TeleopOpMode extends PeriodicOpMode {
  private final CommandNiDsXboxController driver =
      new CommandNiDsXboxController(0);

  public TeleopOpMode(Robot robot) {
    final Arm arm = robot.arm;

    // Hold A: the scoring hold runs. Release A: the hold is
    // cancelled and the arm's default command takes back over.
    driver.a().whileTrue(arm.scoring());

    // onTrue is for self-finishing commands only.
    // Never bind a bare hold with onTrue — it would run forever.
    driver.start().onTrue(robot.drivetrain.resetHeading());
  }
}`;

const SENSOR_TRIGGER = `// Sensor -> command. Same shape, just a different boolean source.
Trigger atSpeed = new Trigger(flywheel::isAtSpeed);
atSpeed.whileTrue(intake.feed());`;

export const TriggersTrailer: TrailerScript = {
  id: "TriggersTrailer",
  voice: "af_heart",
  world: [
    {
      kind: "title",
      id: "title",
      rect: TITLE,
      title: "Triggers",
      subtitle: "Bindings that clean up after themselves",
      accent: "teal",
    },
    {
      kind: "code",
      id: "opmode-code",
      rect: CODE,
      fileName: "TeleopOpMode.java",
      language: "java",
      states: ["", OPMODE_SKELETON, OPMODE_WHILETRUE, OPMODE_FULL],
    },
    {
      kind: "diagram",
      id: "scopes",
      rect: DIAGRAM,
      title: "Where a binding lives",
      nodes: [
        {
          id: "binding",
          label: "A binding",
          sublabel: "trigger.whileTrue(command)",
          x: 80,
          y: 440,
          width: 460,
          height: 220,
          accent: "amber",
          step: 1,
        },
        {
          id: "global",
          label: "Global scope",
          sublabel: "Robot constructor",
          x: 1660,
          y: 100,
          width: 460,
          height: 220,
          accent: "blue",
          step: 2,
        },
        {
          id: "opmode",
          label: "OpMode scope",
          sublabel: "OpMode constructor",
          x: 1660,
          y: 440,
          width: 460,
          height: 220,
          accent: "purple",
          step: 3,
        },
        {
          id: "command",
          label: "Command scope",
          sublabel: "inside a command body",
          x: 1660,
          y: 780,
          width: 460,
          height: 220,
          accent: "mint",
          step: 4,
        },
      ],
      edges: [
        { from: "binding", to: "global", label: "whole program" },
        { from: "binding", to: "opmode", label: "one mode" },
        { from: "binding", to: "command", label: "one run" },
      ],
    },
    {
      kind: "code",
      id: "sensor-code",
      rect: CODE2,
      fileName: "TeleopOpMode.java",
      language: "java",
      states: ["", SENSOR_TRIGGER],
    },
    {
      kind: "end",
      id: "end",
      rect: END,
      title: "whileTrue, onTrue, and the three scopes",
      subtitle: "Bindings whose lifetime always matches their owner",
      url: "frc5712.com/triggers",
    },
  ],
  beats: [
    {
      id: "hook",
      text: "Press A, raise the arm. That link is called a binding. Every binding has one big question to answer: when should it stop existing? In Commands version three, the answer is simple. Bindings belong to modes.",
      camera: TITLE,
      holdAfter: 0.5,
    },
    {
      id: "ontrue",
      text: "Teleop is a class now, called an OpMode. The controller is a field. Bindings go in the constructor. Bind driver dot a whileTrue arm dot scoring. Scoring is a hold: a command that keeps the arm at one angle. Hold A, and the hold runs.",
      camera: CODE,
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
          at: { word: "Bind" },
        },
      ],
    },
    {
      id: "whiletrue",
      text: "Why whileTrue? A hold never finishes. Release the button, and the arm goes back to its normal job — its default command. onTrue is different. Save it for commands that end on their own, like a heading reset. Never bind a hold with onTrue.",
      camera: { x: 2620, y: 380, width: 1440, height: 810 },
      events: [
        {
          type: "code-state",
          artifact: "opmode-code",
          state: 3,
          at: { word: "onTrue" },
        },
      ],
      holdAfter: 0.8,
    },
    {
      id: "scopes",
      text: "Here is the part that kills boilerplate. Every binding has a scope. A scope decides how long the binding lives. Bind in the Robot constructor, and it is global. Bind in an OpMode, and it lives with the mode. Bind inside a command body, and it dies with the command.",
      camera: DIAGRAM,
      events: [
        {
          type: "diagram",
          artifact: "scopes",
          step: 1,
          at: { word: "binding" },
        },
        {
          type: "diagram",
          artifact: "scopes",
          step: 2,
          at: { word: "global" },
        },
        {
          type: "diagram",
          artifact: "scopes",
          step: 3,
          at: { word: "OpMode" },
        },
        {
          type: "diagram",
          artifact: "scopes",
          step: 4,
          at: { word: "command" },
        },
      ],
    },
    {
      id: "teardown",
      text: "Watch a mode switch. Pick auto, and the framework builds the auto OpMode with its bindings. Teleop's bindings are torn down for you. Pick teleop again, and fresh bindings come back. You never unregister anything by hand.",
      camera: { x: 6960, y: 180, width: 1560, height: 1020 },
    },
    {
      id: "sensors",
      text: "Triggers are not just buttons. Any yes-or-no reading wraps in a Trigger. A flywheel at speed. A beam break. A sensor binds just like the A button. While the flywheel is at speed, the feed hold runs.",
      camera: CODE2,
      events: [
        {
          type: "code-state",
          artifact: "sensor-code",
          state: 1,
          at: { word: "wraps" },
        },
      ],
      holdAfter: 1.0,
    },
    {
      id: "cta",
      text: "Command-scoped bindings go further. A climb routine can carry its own abort button. The binding dies the moment the climb ends. See all three scopes, with runnable code, at frc5712.com.",
      camera: END,
      holdAfter: 1.2,
    },
  ],
};
