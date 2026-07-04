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
      text: "Feedforward and feedback can land the arm anywhere you ask. But watch how it gets there: floor the voltage, race, brake hard. Fast — but violent. Motion Magic keeps the speed and deletes the violence.",
      camera: TITLE,
      holdAfter: 0.5,
    },
    {
      id: "problem",
      text: "Here are our tuned gains, asked to jump to sixty degrees in one step. The error is enormous for an instant, so the controller slams to twelve volts — chain-snapping acceleration, then a hard scramble to stop at the top.",
      camera: LAB,
      events: [
        { type: "gains", kP: 2.5, kD: 0.2, kG: 3.9, at: { word: "gains" } },
        { type: "target", deg: 60, at: { word: "sixty" } },
      ],
    },
    {
      id: "idea",
      text: "Motion Magic replaces the step with a profile: accelerate, cruise, decelerate. The setpoint itself travels — watch it glide — and the arm only ever has to chase a target that never runs away from it.",
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
      text: "Send it back up and look at the output bar — no slam, just a steady, planned push the whole way. Same mechanism, same gains, a much calmer robot.",
      camera: LAB,
      events: [{ type: "target", deg: 55, at: { word: "back" } }],
    },
    {
      id: "tuning",
      text: "Cruise velocity and acceleration are promises about your hardware: how fast the mechanism may move, and how hard it may accelerate. Tune them to what the metal can take, and the profile handles the rest.",
      camera: SCOPE_CLOSEUP,
      events: [{ type: "target", deg: 10, at: { word: "promises" } }],
    },
    {
      id: "code",
      text: "In code, it's two settings and a different request. Set cruise velocity, set acceleration, then swap PositionVoltage for MotionMagicVoltage. The profile runs on the motor controller itself, a thousand times a second.",
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
      text: "That's the whole control story: feedback corrects, feedforward predicts, Motion Magic plans. Your arm is competition-smooth. The full lesson is waiting at frc5712.com.",
      camera: END,
      holdAfter: 1.2,
    },
  ],
};
