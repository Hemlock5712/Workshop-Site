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
      text: "This is the full Motion Magic lesson. Feedback corrects and feedforward predicts — but both still slam a step input as hard as the motor allows. Today the setpoint itself learns to travel: accelerate, cruise, decelerate, and how to choose numbers your hardware can actually keep.",
      camera: TITLE,
      holdAfter: 0.5,
    },
    {
      id: "problem",
      text: "Start with the arm we already tuned — gains of two point five, zero point two, and a kG of three point nine — and ask for sixty degrees in a single step. The error is enormous for one instant, so the controller floors it to twelve volts.",
      camera: LAB,
      events: [
        { type: "gains", kP: 2.5, kD: 0.2, kG: 3.9, at: { word: "gains" } },
        { type: "target", deg: 60, at: { word: "sixty" } },
      ],
    },
    {
      id: "violence",
      text: "Watch the shape of that move: a chain-snapping launch, a race at full speed, and a hard scramble to stop at the top. The landing is accurate — but every step command asks the mechanism to survive maximum violence. That's not a tuning problem. That's the step input itself.",
      camera: SCOPE_CLOSEUP,
    },
    {
      id: "anatomy-phases",
      text: "Motion Magic swaps the step for a trapezoid profile in three phases. Phase one: accelerate — speed ramps up at a fixed rate. Phase two: cruise — hold a chosen top speed. Phase three: decelerate — ramp back down so the mechanism arrives with zero speed left to kill.",
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
      text: "Here's the trick that makes it work with the PID you already have: the profile drives a moving setpoint. Instead of teleporting to the goal, the setpoint travels along the trapezoid, and your feedback loop just follows it — always a small error away, never an enormous one.",
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
      text: "Let's run it live. Load a profile — cruise seventy degrees per second, acceleration one forty — and send the arm down to negative twenty. Watch the amber setpoint glide instead of jump. The arm chases a target that never runs away from it.",
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
      text: "Now back up to fifty-five, and keep your eye on the output bar. No slam — just a steady, planned push the whole way there. Same mechanism, same gains as before. The only thing that changed is the shape of the request.",
      camera: LAB,
      events: [{ type: "target", deg: 55, at: { word: "back" } }],
    },
    {
      id: "choose-cruise",
      text: "So where do the numbers come from? Cruise velocity first: measure your mechanism's free speed — how fast it moves at full voltage — and take a safe fraction of it, maybe seventy or eighty percent. Watch it hold that ceiling on the way down to negative forty.",
      camera: LAB,
      events: [{ type: "target", deg: -40, at: { word: "forty" } }],
    },
    {
      id: "choose-accel",
      text: "Acceleration is a torque budget: motor torque minus gravity, divided by inertia. This arm can do about seven hundred degrees per second squared flat out — promising eight hundred is a lie. And a profile built on a lie doesn't bend. It breaks, live, in front of you.",
      camera: ARM_CLOSEUP,
    },
    {
      id: "infeasible-up",
      text: "Let's tell that lie on purpose. Cruise four hundred, acceleration eight hundred — numbers this arm cannot deliver — and command fifty-five degrees. The amber setpoint sprints away, the mint trace falls behind, and the gap between them keeps growing while the voltage rails at twelve.",
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
      text: "Swing back to negative forty and it's the same story in reverse: the profile finishes on schedule, but the arm is nowhere near it — you've rebuilt the step input you were trying to delete. A profile is a promise your motor has to keep. Never promise more than the physics.",
      camera: SCOPE_CLOSEUP,
      events: [{ type: "target", deg: -40, at: { word: "back" } }],
      holdAfter: 0.6,
    },
    {
      id: "restore",
      text: "Restore the honest numbers — seventy and one forty — and send it to thirty degrees. Tight again: the mint trace sits right on the amber line the whole trip, and the output stays calm. Feasible profiles track. Infeasible profiles just relocate the slam.",
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
      text: "Notice how the three layers split the work. kG holds the arm against gravity the entire time. The profile shapes the path — how fast, how hard. And PID only trims the leftover error, a degree or two at most. Small errors mean small corrections mean smooth metal.",
      camera: LAB,
    },
    {
      id: "code",
      text: "In code, this whole lesson is two settings and a different request. Same Slot0 gains you already tuned. Then set cruise velocity, set acceleration, and swap PositionVoltage for MotionMagicVoltage. The profile is generated on the motor controller itself, recalculated a thousand times a second.",
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
      text: "One more variant before we close. Flywheels don't have positions — they have speeds — and slamming a shooter from zero to five thousand RPM browns out robots. MotionMagicVelocityVoltage applies the same idea to velocity: it ramps the speed target smoothly, at an acceleration you choose, instead of stepping it.",
      camera: CODE,
      holdAfter: 0.6,
    },
    {
      id: "cta",
      text: "And that closes the control trilogy. Feedback corrects — PID fights the error it can see. Feedforward predicts — the constants pay for physics up front. Motion Magic plans — the setpoint travels a path your hardware can honestly keep. Everything you just watched is waiting at frc5712.com.",
      camera: END,
      holdAfter: 1.2,
    },
  ],
};
