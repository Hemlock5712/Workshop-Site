import type { Rect, TrailerScript } from "../lib/types";

// Bindings that clean up after themselves. The camera travels:
// title card → TeleopOpMode code built up in stages → the three-scopes
// diagram → sensor-trigger code → end card.

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

const SENSOR_TRIGGER = `// Sensor -> command. Same shape, just a different boolean source.
Trigger atSpeed = new Trigger(flywheel::atTarget);
atSpeed.onTrue(intake.feed());`;

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
      states: ["", OPMODE_SKELETON, OPMODE_ONTRUE, OPMODE_FULL],
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
          sublabel: "trigger.onTrue(command)",
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
      title: "onTrue, whileTrue, and the three scopes",
      subtitle: "Bindings whose lifetime always matches their owner",
      url: "frc5712.com/triggers",
    },
  ],
  beats: [
    {
      id: "hook",
      text: "Press A, raise the arm. Every robot needs bindings — and Commands version three finally answers the question old code never did: when should a binding stop existing? There is no RobotContainer here. Bindings belong to modes.",
      camera: TITLE,
      holdAfter: 0.5,
    },
    {
      id: "ontrue",
      text: "Teleop is a class now — an OpMode. The controller is a field, and the bindings go in the constructor. Bind driver dot a onTrue, and pressing the button fires the command once, at the rising edge.",
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
      text: "whileTrue is the hold. Keep the left bumper down and the command stays scheduled. Let go, and the scheduler cancels it for you. A press is a moment, a hold is a state — pick the verb that matches.",
      camera: { x: 2620, y: 380, width: 1440, height: 810 },
      events: [
        {
          type: "code-state",
          artifact: "opmode-code",
          state: 3,
          at: { word: "whileTrue" },
        },
      ],
      holdAfter: 0.8,
    },
    {
      id: "scopes",
      text: "Here's the part that kills boilerplate: every binding has a scope. Bind it in the Robot constructor and it's global. Bind it in an OpMode and it lives with the mode. Bind it inside a command body and it dies with the command.",
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
      text: "Watch a mode switch. Selecting auto constructs the auto OpMode with its bindings and tears teleop's down automatically. Pick teleop again and you get a fresh OpMode with fresh bindings. You never unregister anything by hand.",
      camera: { x: 6960, y: 180, width: 1560, height: 1020 },
    },
    {
      id: "sensors",
      text: "And triggers are not just buttons. Any boolean supplier wraps in a Trigger — a flywheel at speed, a beam break, the match timer. A sensor binds exactly like the A button: condition turns true, command fires.",
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
      text: "Command-scoped bindings get wilder — a climb routine that carries its own abort button, torn down the moment the climb ends. See all three scopes, with runnable code, at frc5712.com.",
      camera: END,
      holdAfter: 1.2,
    },
  ],
};
