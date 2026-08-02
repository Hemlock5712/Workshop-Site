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
      text: "By now your arm holds any angle you give it. Feedback cleans up what it can see, feedforward pays gravity up front, and both are still happy to get there at maximum brutality. Today we fix how it travels, not where it lands. Then the arithmetic on what your hardware can honestly promise.",
      camera: TITLE,
      holdAfter: 0.5,
    },
    {
      id: "problem",
      text: "Same arm, same gains we settled on last lesson. Nothing about the tuning is wrong. Now ask for sixty degrees in one step. For one instant the error is the entire move, and the controller answers the only way a controller can: everything it has, twelve volts, immediately.",
      camera: LAB,
      events: [
        { type: "gains", kP: 2.5, kD: 0.2, kG: 3.9, at: { word: "gains" } },
        { type: "target", deg: 60, at: { word: "sixty" } },
      ],
    },
    {
      id: "violence",
      text: "Look at the shape, not the accuracy. It launches hard enough to skip a chain, sprints, then throws itself at the stop. The landing is dead on. Every time you command a move like that, the mechanism eats the worst hit the motor can deliver. Tuning won't fix it. It's the step input itself.",
      camera: SCOPE_CLOSEUP,
    },
    {
      id: "anatomy-phases",
      text: "Motion Magic swaps the step for a plan in three parts. Accelerate, and the arm spends torque it needs back later. Cruise, the only stretch where nothing interesting happens. Decelerate, the part everybody forgets, because that is where the profile spends the momentum it built instead of dumping it into a hard stop.",
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
      text: "None of this requires new tuning, which is the whole trick. The setpoint stops teleporting to the goal and starts walking the profile, one control cycle at a time. Your PID runs exactly as it did before. The difference is that the error it sees never gets big enough to be worth twelve volts.",
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
      text: "Let's run it live. Load a profile with numbers this arm can actually hold. Send it down to negative twenty. Watch the amber trace: it doesn't jump, it leaves. And the mint trace, the arm itself, stays glued right behind it the whole way down.",
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
      text: "Now back the other way, up high, and watch the output bar instead of the arm. It never touches the rail. The push builds, then backs off on its own, and the gearbox never learns anything happened; nothing changed but the shape of the request.",
      camera: LAB,
      events: [{ type: "target", deg: 55, at: { word: "back" } }],
    },
    {
      id: "choose-cruise",
      text: "Start by measuring, not guessing. Run the mechanism at full voltage and see how fast it really goes, then set cruise velocity to a comfortable slice of that, seventy or eighty percent. The margin is there for the fourth match of the day, when the battery is tired. Down to negative forty.",
      camera: LAB,
      events: [{ type: "target", deg: -40, at: { word: "forty" } }],
    },
    {
      id: "choose-accel",
      text: "Acceleration is a torque budget. You don't get a vote. Gravity takes a cut, inertia takes a cut, and what's left is all a heavy arm gets. About seven hundred degrees per second squared, on a good day. Ask for eight hundred and the profile won't bend to fit. It fails, live.",
      camera: ARM_CLOSEUP,
    },
    {
      id: "infeasible-up",
      text: "Let's tell the lie on purpose. Cruise at four hundred, acceleration at eight hundred, neither of which this arm has ever done. Command fifty-five degrees and the amber setpoint sprints off without the arm, the mint trace falling further behind every cycle while the voltage sits pinned at twelve, doing everything it can.",
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
      text: "Swing back the other way. Same failure, mirrored. The profile finishes right on schedule and means nothing, because the arm is still somewhere behind it. We have rebuilt the exact step input we spent this lesson deleting. A profile your motor can't keep isn't a plan. It's a slam with extra steps.",
      camera: SCOPE_CLOSEUP,
      events: [{ type: "target", deg: -40, at: { word: "back" } }],
      holdAfter: 0.6,
    },
    {
      id: "restore",
      text: "Honest numbers back in: seventy, and the acceleration to match. Send it to thirty degrees. The mint trace sits on top of the amber line the whole trip, and the output bar never gets excited. A profile the arm can keep gets tracked. The other kind just relocates the slam.",
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
      text: "Three layers, none of them doing another's job. kG carries the weight whether the arm is moving or parked. The profile owns how fast and how hard, which leaves PID a degree or two to clean up.",
      camera: LAB,
    },
    {
      id: "code",
      text: "In code the whole lesson is two config values and a different control request; slot zero stays exactly as you tuned it. Add the Motion Magic cruise velocity and acceleration, then send motion magic voltage where you used to send position voltage. From there the TalonFX generates the profile, a thousand times a second.",
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
      text: "One more variant. A flywheel has no position, only a speed, and jumping a shooter to five thousand RPM will brown the robot out mid-match. Motion magic velocity voltage ramps the speed target instead, on an acceleration you pick.",
      camera: CODE,
      holdAfter: 0.6,
    },
    {
      id: "cta",
      text: "Three lessons ago your arm couldn't hold an angle. Now it moves the way a mechanism moves when somebody thought about the trip and not just the destination. Go measure your own hardware before you pick numbers for it, and stop lying to your gearbox.",
      camera: END,
      holdAfter: 1.2,
    },
  ],
};
