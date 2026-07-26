import type { Rect, TrailerScript } from "../lib/types";

// One continuous world, laid out left to right. The camera travels:
// title card → arm close-up → full lab → scope close-up → lab → code → end card.
//
// REFERENCE SCRIPT for the shot-list camera model. Every other trailer still
// uses the single `camera: Rect` sugar, which is fine and renders exactly as it
// always did. This one is authored as `shots`, because a 10-25 second beat on
// one framing is a slide no matter how good the artwork is: the camera reaches a
// perceptible ~1px/frame only with a ~48% zoom across a 460-frame hold, so pace
// has to come from cutting between framings instead. Shot boundaries anchor to
// spoken words exactly like events do.
//
// Copy the *pattern*, not the numbers: 2-4 shots per beat, each 90-150 frames,
// with the payoff of the sentence on its own framing.

const TITLE: Rect = { x: 0, y: 0, width: 1920, height: 1080 };
const LAB: Rect = { x: 2560, y: 140, width: 2200, height: 1150 };
const CODE: Rect = { x: 5480, y: 220, width: 1560, height: 960 };
const END: Rect = { x: 7820, y: 60, width: 1920, height: 1080 };

// Sub-regions of the lab the camera can push into (must match PidLab's layout).
const ARM_CLOSEUP: Rect = { x: 2600, y: 200, width: 980, height: 1050 };
const SCOPE_CLOSEUP: Rect = { x: 3600, y: 200, width: 1120, height: 1040 };

// Tighter framings used only as shot targets — they carve up an artifact the
// camera is already on, so no world layout changes.
const TITLE_TIGHT: Rect = { x: 260, y: 300, width: 1400, height: 480 };
const CODE_GAINS: Rect = { x: 5480, y: 220, width: 1560, height: 470 };
const CODE_CALL: Rect = { x: 5480, y: 700, width: 1560, height: 480 };

const CODE_KP_ONLY = `var slot0 = new Slot0Configs();
slot0.kP = 2.5;  // volts per degree of error

motor.getConfigurator().apply(slot0);

// ask for an angle — the controller does the rest
motor.setControl(positionVoltage.withPosition(target));`;

const CODE_WITH_KD = `var slot0 = new Slot0Configs();
slot0.kP = 2.5;  // volts per degree of error
slot0.kD = 0.2;  // ease off as the error closes

motor.getConfigurator().apply(slot0);

// ask for an angle — the controller does the rest
motor.setControl(positionVoltage.withPosition(target));`;

export const PidTrailer: TrailerScript = {
  id: "PidTrailer",
  voice: "af_heart",
  world: [
    {
      kind: "title",
      id: "title",
      rect: TITLE,
      title: "PID Control",
      subtitle: "Make the arm land — not lunge",
      accent: "purple",
    },
    {
      kind: "pid-lab",
      id: "lab",
      rect: LAB,
      startDeg: -45,
      hardStopDeg: -45,
    },
    {
      kind: "code",
      id: "code",
      rect: CODE,
      fileName: "Arm.java",
      language: "java",
      states: ["", CODE_KP_ONLY, CODE_WITH_KD],
    },
    {
      kind: "end",
      id: "end",
      rect: END,
      title: "Now tune the real thing",
      subtitle:
        "Gravity feedforward, Motion Magic, and tuning without breaking your robot",
      url: "frc5712.com/pid-control",
    },
  ],
  beats: [
    {
      id: "hook",
      text: "Every rookie robot arm makes one of two mistakes. It crawls toward the target and stops short. Or it flies right past the target and shakes. PID fixes both. And the idea behind it is simpler than the math.",
      shots: [
        // Open wide with a real push instead of the old imperceptible creep.
        { rect: TITLE, drift: { dolly: 0.02 } },
        // Land on the title itself as the promise is made.
        {
          rect: TITLE_TIGHT,
          at: { word: "fixes" },
          move: { kind: "settle" },
          drift: { dolly: 0.012 },
        },
      ],
      holdAfter: 0.5,
    },
    {
      id: "error",
      text: "Meet the arm. It rests at negative forty-five degrees. We want it at positive thirty. That goal is called the setpoint. The gap left to travel is the error. PID starts with the error.",
      shots: [
        { rect: ARM_CLOSEUP, drift: { dolly: 0.02 } },
        // Pull out so the setpoint line reads against the whole lab.
        { rect: LAB, at: { word: "setpoint" }, move: { kind: "smooth" } },
      ],
      events: [{ type: "target", deg: 30, at: { word: "thirty" } }],
    },
    {
      id: "p-low",
      text: "P stands for proportional. It pushes harder when the error is bigger. How hard? A number called the P gain decides. With a small gain, gravity wins. The arm stalls below the target and just hangs there.",
      shots: [
        { rect: LAB, drift: { dolly: 0.025 } },
        // Cut in tight for the sag — the whole point of the beat.
        { rect: ARM_CLOSEUP, at: { word: "gravity" }, move: { kind: "cut" } },
      ],
      events: [{ type: "gains", kP: 0.2, kD: 0, at: { word: "pushes" } }],
    },
    {
      id: "p-high",
      text: "So crank the P gain way up. Now the arm launches. It flies straight past thirty. Then it swings back and forth around the setpoint. More P gives more speed. But P can't tell it's arriving too fast.",
      shots: [
        // Stay on the arm to watch it go, snap because the motion is violent.
        { rect: ARM_CLOSEUP, move: { kind: "snap" }, drift: { dolly: 0.03 } },
        // Cut to the scope the moment the oscillation is the subject.
        { rect: SCOPE_CLOSEUP, at: { word: "swings" }, move: { kind: "cut" } },
        { rect: LAB, at: { word: "speed" }, move: { kind: "smooth" } },
      ],
      events: [{ type: "gains", kP: 2.5, kD: 0, at: { word: "crank" } }],
    },
    {
      id: "d-term",
      text: "That's the D term's job. D stands for derivative. It watches how fast the error is shrinking. Then it eases off before you arrive. Keep the same P and add a little D. Now send the arm to sixty degrees. It just lands.",
      shots: [
        { rect: LAB, drift: { dolly: 0.02 } },
        // The trace is the evidence that D is working.
        {
          rect: SCOPE_CLOSEUP,
          at: { word: "derivative" },
          move: { kind: "smooth" },
        },
        // Cut to the arm for the payoff, and let it breathe on a settle.
        {
          rect: ARM_CLOSEUP,
          at: { word: "sixty" },
          move: { kind: "cut" },
          drift: { dolly: 0.015 },
        },
      ],
      events: [
        { type: "gains", kP: 2.5, kD: 0.2, at: { word: "derivative" } },
        { type: "target", deg: 60, at: { word: "sixty" } },
      ],
      holdAfter: 1.2,
    },
    {
      id: "code",
      text: "In code, this whole story is one slot config on the TalonFX. k P is the push. k D is the brakes. Then you just ask for an angle. The controller runs on the motor a thousand times a second.",
      shots: [
        { rect: CODE, drift: { dolly: 0.018 } },
        // Frame just the gain lines while they are being typed.
        {
          rect: CODE_GAINS,
          at: { word: "brakes" },
          move: { kind: "snap" },
        },
        // Then drop to the call site the narration moves on to.
        { rect: CODE_CALL, at: { word: "angle" }, move: { kind: "smooth" } },
        { rect: CODE, at: { word: "thousand" }, move: { kind: "settle" } },
      ],
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
          at: { word: "brakes" },
        },
      ],
      holdAfter: 1.6,
    },
    {
      id: "cta",
      text: "There's more to learn. Gravity feedforward. Motion Magic. And how to tune a real arm without snapping it. The full PID lesson is waiting at frc5712.com.",
      // A slow pull-back to close, rather than a static card.
      shots: [{ rect: END, drift: { dolly: -0.012 } }],
      holdAfter: 1.2,
    },
  ],
};
