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
      text: "Press A, the arm goes up. That link is a binding, and the interesting question isn't how to make one. It's who deletes it when the match mode changes, because in the old framework that was your job and everybody got it wrong.",
      camera: TITLE,
      holdAfter: 0.5,
    },
    {
      id: "ontrue",
      text: "Teleop is a class in version three, with the controller as a field on it. Bind in the constructor: hold A, and the arm drives to its scoring angle and stays there. Release it, and the binding is still there; it just isn't true anymore.",
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
      text: "whileTrue is doing real work here. Since the hold has no ending, the button release is what cancels it, which is how the arm's default gets the mechanism back. onTrue fires once on the press and never again. Save that for a heading reset.",
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
      text: "This is where the boilerplate goes away. Where you type a binding decides how long it lives. Robot constructor: global, alive for the whole session. An OpMode, and it dies with the mode. Inside a command, and you get exactly one run.",
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
      text: "That middle one is the one you'll feel. Switch to autonomous and every teleop binding leaves with the old OpMode object; switch back and a new one wires them up again. No teardown list, nothing to forget.",
      camera: { x: 6960, y: 180, width: 1560, height: 1020 },
    },
    {
      id: "sensors",
      text: "Nothing here is button-specific. Any boolean your robot can produce wraps in a Trigger, so a flywheel coming up to speed can start the feed itself, no driver involved. Beam breaks, limit switches, a pose estimate.",
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
      text: "The third scope surprises people. A climb routine can register its own abort button, and that button stops existing the moment the climb does. Bindings you never have to remember.",
      camera: END,
      holdAfter: 1.2,
    },
  ],
};
