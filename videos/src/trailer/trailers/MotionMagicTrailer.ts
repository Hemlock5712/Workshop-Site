import type { Rect, TrailerScript } from "../lib/types";

// Control trilogy, part 3 — feedback corrects, feedforward predicts, and now
// Motion Magic plans: the setpoint itself travels along a trapezoid profile.

const TITLE: Rect = { x: 0, y: 0, width: 1920, height: 1080 };
const LAB: Rect = { x: 2560, y: 140, width: 2200, height: 1150 };
const CODE: Rect = { x: 5480, y: 220, width: 1560, height: 960 };
const END: Rect = { x: 7820, y: 60, width: 1920, height: 1080 };
const SCOPE_CLOSEUP: Rect = { x: 3600, y: 200, width: 1120, height: 1040 };

const CODE_STEP_TARGET = `var cfg = new TalonFXConfiguration();
cfg.Slot0.kP = 2.5;
cfg.Slot0.kD = 0.2;
cfg.Slot0.kG = 3.9;

motor.getConfigurator().apply(cfg);
motor.setControl(positionVoltage.withPosition(target));`;

const CODE_MOTION_MAGIC = `var cfg = new TalonFXConfiguration();
cfg.Slot0.kP = 2.5;
cfg.Slot0.kD = 0.2;
cfg.Slot0.kG = 3.9;
cfg.MotionMagic.MotionMagicCruiseVelocity = 70;  // deg per second
cfg.MotionMagic.MotionMagicAcceleration = 140;   // deg per second squared

motor.getConfigurator().apply(cfg);
motor.setControl(motionMagic.withPosition(target));`;

export const MotionMagicTrailer: TrailerScript = {
  id: "MotionMagicTrailer",
  voice: "af_heart",
  world: [
    {
      kind: "title",
      id: "title",
      rect: TITLE,
      title: "Motion Magic",
      subtitle: "Plan the path, not just the push",
      accent: "amber",
    },
    {
      kind: "pid-lab",
      id: "lab",
      rect: LAB,
      startDeg: -45,
      hardStopDeg: -45,
      chips: ["kP", "kD", "kG", "target"],
    },
    {
      kind: "code",
      id: "code",
      rect: CODE,
      fileName: "Arm.java",
      language: "java",
      states: ["", CODE_STEP_TARGET, CODE_MOTION_MAGIC],
    },
    {
      kind: "end",
      id: "end",
      rect: END,
      title: "Feedback corrects. Feedforward predicts. Motion Magic plans.",
      subtitle:
        "Plus velocity control for flywheels — the full closed-loop story",
      url: "frc5712.com/motion-magic",
    },
  ],
  beats: [
    {
      id: "hook",
      text: "Feedforward and feedback will land your arm on any angle you name, and they'll get there by pinning the voltage to the rail, sprinting, then standing on the brakes at the last instant. Fast. Violent. Motion Magic only fixes the violent part.",
      camera: TITLE,
      holdAfter: 0.5,
    },
    {
      id: "problem",
      text: "These gains came out of the last two lessons. Now ask for sixty degrees in one step. The gap is enormous, so the controller does the only thing it knows: twelve volts, right now, straight through whatever chain is in the way.",
      camera: LAB,
      events: [
        { type: "gains", kP: 2.5, kD: 0.2, kG: 3.9, at: { word: "gains" } },
        { type: "target", deg: 60, at: { word: "sixty" } },
      ],
    },
    {
      id: "idea",
      text: "Motion Magic won't hand the controller the whole jump at once. It hands over a profile instead: a schedule of speeds, ramping up, holding, ramping back down. The setpoint travels that schedule. Watch it glide. Your arm is chasing something it can actually catch.",
      camera: SCOPE_CLOSEUP,
      events: [
        {
          type: "profile",
          cruiseDegPerSec: 70,
          accelDegPerSec2: 140,
          at: { word: "profile" },
        },
        { type: "target", deg: -20, at: { word: "travels" } },
      ],
    },
    {
      id: "demo",
      text: "Send it back up, eyes on the output bar. It never pegs. The push stays measured the whole trip. Same arm, same gains, and nothing in the gearbox getting punished.",
      camera: LAB,
      events: [{ type: "target", deg: 55, at: { word: "back" } }],
    },
    {
      id: "tuning",
      text: "Two numbers. Cruise velocity caps the top speed; acceleration caps how fast it gets there. Both are promises you're making on behalf of a gearbox that has never read your code. Lie in either one and the profile is fiction.",
      camera: SCOPE_CLOSEUP,
      events: [{ type: "target", deg: 10, at: { word: "promises" } }],
    },
    {
      id: "code",
      text: "Two config lines and a different request object. Set the cruise velocity, set the acceleration, then hand the motor motion magic voltage instead of position voltage. That profile lives on the TalonFX now, rebuilt a thousand times a second. Your loop just watches.",
      camera: CODE,
      events: [
        {
          type: "code-state",
          artifact: "code",
          state: 1,
          at: { progress: 0.03 },
        },
        {
          type: "code-state",
          artifact: "code",
          state: 2,
          at: { word: "cruise" },
        },
      ],
      holdAfter: 1.6,
    },
    {
      id: "cta",
      text: "Three lessons, three layers, and your arm finally moves like somebody meant it to. Flywheels are next, and they only care about speed.",
      camera: END,
      holdAfter: 1.2,
    },
  ],
};
