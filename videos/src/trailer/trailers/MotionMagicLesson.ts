import type { Rect, TrailerScript } from "../lib/types";

// Full-length Motion Magic lesson (~4 min). Everything the 90s trailer cut:
// the anatomy of the trapezoid, how to actually CHOOSE cruise and acceleration
// from the hardware, the infeasible-profile failure mode live, how the profile
// shares the work with kG and PID, and the velocity variant for flywheels.

const TITLE: Rect = { x: 0, y: 0, width: 1920, height: 1080 };
const LAB: Rect = { x: 2560, y: 140, width: 2200, height: 1150 };
const DIAGRAM: Rect = { x: 5480, y: 160, width: 2200, height: 1100 };
const CODE: Rect = { x: 8400, y: 220, width: 1620, height: 960 };
const END: Rect = { x: 10800, y: 60, width: 1920, height: 1080 };
const ARM_CLOSEUP: Rect = { x: 2600, y: 200, width: 980, height: 1050 };
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

export const MotionMagicLesson: TrailerScript = {
  id: "MotionMagicLesson",
  voice: "af_heart",
  world: [
    {
      kind: "title",
      id: "title",
      rect: TITLE,
      title: "Motion Magic",
      subtitle:
        "The full lesson — trapezoid profiles, choosing real numbers, and the lies that break them",
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
      kind: "diagram",
      id: "trapezoid",
      rect: DIAGRAM,
      title: "Anatomy of a trapezoid profile",
      nodes: [
        {
          id: "accel",
          label: "Accelerate",
          sublabel: "ramp speed up at a fixed rate",
          x: 80,
          y: 150,
          width: 460,
          height: 220,
          accent: "blue",
          step: 1,
        },
        {
          id: "cruise",
          label: "Cruise",
          sublabel: "hold the chosen top speed",
          x: 880,
          y: 150,
          width: 460,
          height: 220,
          accent: "amber",
          step: 2,
        },
        {
          id: "decel",
          label: "Decelerate",
          sublabel: "ramp down to land at zero",
          x: 1680,
          y: 150,
          width: 460,
          height: 220,
          accent: "purple",
          step: 3,
        },
        {
          id: "setpoint",
          label: "Moving setpoint",
          sublabel: "the target travels the profile",
          x: 880,
          y: 720,
          width: 460,
          height: 220,
          accent: "mint",
          step: 4,
        },
      ],
      edges: [
        { from: "accel", to: "cruise" },
        { from: "cruise", to: "decel" },
        {
          from: "cruise",
          to: "setpoint",
          label: "your PID follows it",
          step: 4,
        },
      ],
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
        "The control trilogy, complete — profiles your hardware can keep",
      url: "frc5712.com/motion-magic",
    },
  ],
  beats: [
    {
      id: "hook",
      text: "This is the full Motion Magic lesson. Feedback corrects. Feedforward predicts. But both still slam into a big jump as hard as the motor allows. Today the target itself learns to travel. Speed up, cruise, slow down. And you will learn to choose numbers your hardware can actually keep.",
      camera: TITLE,
      holdAfter: 0.5,
    },
    {
      id: "problem",
      text: "Start with the arm we already tuned. Its gains are two point five, zero point two, and a k G of three point nine. A gain is a number that sets the push. Ask for sixty degrees in one step. For an instant the error, the gap to the target, is huge. So the controller floors it to twelve volts.",
      camera: LAB,
      events: [
        { type: "gains", kP: 2.5, kD: 0.2, kG: 3.9, at: { word: "gains" } },
        { type: "target", deg: 60, at: { word: "sixty" } },
      ],
    },
    {
      id: "violence",
      text: "Watch the shape of that move. A launch hard enough to snap a chain. A race at full speed. Then a hard scramble to stop at the top. The landing is accurate. But every jump like this makes the mechanism survive maximum violence. That is not a tuning problem. That is the step input itself: asking for the whole move at once.",
      camera: SCOPE_CLOSEUP,
    },
    {
      id: "anatomy-phases",
      text: "Motion Magic swaps the step for a trapezoid profile: a planned trip in three phases. Phase one: accelerate. Speed ramps up at a fixed rate. Phase two: cruise. Hold a chosen top speed. Phase three: decelerate. Ramp back down, so the arm arrives with zero speed left to kill.",
      camera: { x: 5500, y: 120, width: 2160, height: 560 },
      events: [
        {
          type: "diagram",
          artifact: "trapezoid",
          step: 1,
          at: { word: "accelerate" },
        },
        {
          type: "diagram",
          artifact: "trapezoid",
          step: 2,
          at: { word: "cruise" },
        },
        {
          type: "diagram",
          artifact: "trapezoid",
          step: 3,
          at: { word: "decelerate" },
        },
      ],
    },
    {
      id: "anatomy-setpoint",
      text: "Here is the trick that makes it work with the PID you already have. The profile drives a moving setpoint. The setpoint is the target your controller chases. Instead of teleporting to the goal, it travels along the trapezoid. Your feedback loop just follows. The error stays small the whole way.",
      camera: DIAGRAM,
      events: [
        {
          type: "diagram",
          artifact: "trapezoid",
          step: 4,
          at: { word: "setpoint" },
        },
      ],
    },
    {
      id: "glide-down",
      text: "Let's run it live. Load a profile. Cruise is seventy degrees per second. Acceleration is one forty. Now send the arm down to negative twenty. Watch the amber setpoint glide instead of jump. The arm chases a target that never runs away from it.",
      camera: SCOPE_CLOSEUP,
      events: [
        {
          type: "profile",
          cruiseDegPerSec: 70,
          accelDegPerSec2: 140,
          at: { word: "profile" },
        },
        { type: "target", deg: -20, at: { word: "twenty" } },
      ],
    },
    {
      id: "glide-up",
      text: "Now back up to fifty-five degrees. Keep your eye on the output bar. No slam this time. Just a steady, planned push the whole way there. Same arm, same gains as before. The only thing that changed is the shape of the request.",
      camera: LAB,
      events: [{ type: "target", deg: 55, at: { word: "back" } }],
    },
    {
      id: "choose-cruise",
      text: "So where do the numbers come from? Start with cruise velocity. First measure your mechanism's free speed. That is how fast it moves at full voltage. Then take a safe slice of it, maybe seventy or eighty percent. Watch it hold that ceiling on the way down to negative forty.",
      camera: LAB,
      events: [{ type: "target", deg: -40, at: { word: "forty" } }],
    },
    {
      id: "choose-accel",
      text: "Acceleration is a budget. The motor only has so much strength. Gravity steals some of it. A heavy arm is hard to speed up. This arm can really do about seven hundred degrees per second squared. Promising eight hundred is a lie. A profile built on a lie does not bend. It breaks, live, in front of you.",
      camera: ARM_CLOSEUP,
    },
    {
      id: "infeasible-up",
      text: "Let's tell that lie on purpose. Set cruise to four hundred, and acceleration to eight hundred. This arm cannot deliver those numbers. Now command fifty-five degrees. The amber setpoint sprints away. The mint trace falls behind. The gap between them keeps growing. And the voltage is stuck at twelve the whole time.",
      camera: LAB,
      events: [
        {
          type: "profile",
          cruiseDegPerSec: 400,
          accelDegPerSec2: 800,
          at: { word: "four" },
        },
        { type: "target", deg: 55, at: { word: "fifty-five" } },
      ],
      holdAfter: 0.8,
    },
    {
      id: "infeasible-down",
      text: "Swing back to negative forty. It is the same story in reverse. The profile finishes right on schedule. But the arm is nowhere near it. We rebuilt the exact step input we were trying to delete. A profile is a promise your motor has to keep. Never promise more than the physics allows.",
      camera: SCOPE_CLOSEUP,
      events: [{ type: "target", deg: -40, at: { word: "back" } }],
      holdAfter: 0.6,
    },
    {
      id: "restore",
      text: "Restore the honest numbers: seventy and one forty. Send it to thirty degrees. Tight again. The mint trace sits right on the amber line the whole trip. The output stays calm. Profiles the arm can keep will track. Profiles built on lies just move the slam.",
      camera: LAB,
      events: [
        {
          type: "profile",
          cruiseDegPerSec: 70,
          accelDegPerSec2: 140,
          at: { word: "seventy" },
        },
        { type: "target", deg: 30, at: { word: "thirty" } },
      ],
      holdAfter: 0.6,
    },
    {
      id: "teamwork",
      text: "Notice how the three layers split the work. k G holds the arm against gravity the entire time. The profile shapes the path. It decides how fast and how hard. PID only trims the leftover error, a degree or two at most. Small errors mean small pushes. Small pushes mean smooth metal.",
      camera: LAB,
    },
    {
      id: "code",
      text: "In code, this whole lesson is two settings and a different request. Keep the same slot zero gains you already tuned. Set the Motion Magic cruise velocity. Set the acceleration. Then swap position voltage for motion magic voltage. The profile is built on the motor controller itself. It is recalculated a thousand times a second.",
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
      holdAfter: 1.4,
    },
    {
      id: "velocity-variant",
      text: "One more variant before we close. A flywheel does not have a position. It has a speed. And slamming a shooter from zero to five thousand RPM can brown out the robot. That means the battery voltage dips and everything gets weak. Motion magic velocity voltage applies the same idea to speed. It ramps the speed target smoothly instead of jumping it. You choose the acceleration.",
      camera: CODE,
      holdAfter: 0.6,
    },
    {
      id: "cta",
      text: "And that closes the control trilogy. Feedback corrects. PID fights the error it can see. Feedforward predicts. The constants pay for physics up front. Motion Magic plans. The setpoint travels a path your hardware can honestly keep. Everything you just watched is waiting at frc5712.com.",
      camera: END,
      holdAfter: 1.2,
    },
  ],
};
