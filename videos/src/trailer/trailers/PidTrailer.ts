import type { Rect, TrailerScript } from "../lib/types";

// One continuous world, laid out left to right. The camera travels:
// title card → arm close-up → full lab → scope close-up → lab → code → end card.

const TITLE: Rect = { x: 0, y: 0, width: 1920, height: 1080 };
const LAB: Rect = { x: 2560, y: 140, width: 2200, height: 1150 };
const CODE: Rect = { x: 5480, y: 220, width: 1560, height: 960 };
const END: Rect = { x: 7820, y: 60, width: 1920, height: 1080 };

// Sub-regions of the lab the camera can push into (must match PidLab's layout).
const ARM_CLOSEUP: Rect = { x: 2600, y: 200, width: 980, height: 1050 };
const SCOPE_CLOSEUP: Rect = { x: 3600, y: 200, width: 1120, height: 1040 };

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
      camera: TITLE,
      holdAfter: 0.5,
    },
    {
      id: "error",
      text: "Meet the arm. It rests at negative forty-five degrees. We want it at positive thirty. That goal is called the setpoint. The gap left to travel is the error. PID starts with the error.",
      camera: ARM_CLOSEUP,
      events: [{ type: "target", deg: 30, at: { word: "thirty" } }],
    },
    {
      id: "p-low",
      text: "P stands for proportional. It pushes harder when the error is bigger. How hard? A number called the P gain decides. With a small gain, gravity wins. The arm stalls below the target and just hangs there.",
      camera: LAB,
      events: [{ type: "gains", kP: 0.2, kD: 0, at: { word: "pushes" } }],
    },
    {
      id: "p-high",
      text: "So crank the P gain way up. Now the arm launches. It flies straight past thirty. Then it swings back and forth around the setpoint. More P gives more speed. But P can't tell it's arriving too fast.",
      camera: SCOPE_CLOSEUP,
      events: [{ type: "gains", kP: 2.5, kD: 0, at: { word: "crank" } }],
    },
    {
      id: "d-term",
      text: "That's the D term's job. D stands for derivative. It watches how fast the error is shrinking. Then it eases off before you arrive. Keep the same P and add a little D. Now send the arm to sixty degrees. It just lands.",
      camera: LAB,
      events: [
        { type: "gains", kP: 2.5, kD: 0.2, at: { word: "derivative" } },
        { type: "target", deg: 60, at: { word: "sixty" } },
      ],
      holdAfter: 1.2,
    },
    {
      id: "code",
      text: "In code, this whole story is one slot config on the TalonFX. k P is the push. k D is the brakes. Then you just ask for an angle. The controller runs on the motor a thousand times a second.",
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
          at: { word: "brakes" },
        },
      ],
      holdAfter: 1.6,
    },
    {
      id: "cta",
      text: "There's more to learn. Gravity feedforward. Motion Magic. And how to tune a real arm without snapping it. The full PID lesson is waiting at frc5712.com.",
      camera: END,
      holdAfter: 1.2,
    },
  ],
};
