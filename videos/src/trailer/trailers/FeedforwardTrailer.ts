import type { Rect, TrailerScript } from "../lib/types";

// Control trilogy, part 2 — picks up exactly where the PID trailer ended.
// Same lab, one new idea: pay gravity up front (kG) so feedback only has to
// clean up the leftovers.

const TITLE: Rect = { x: 0, y: 0, width: 1920, height: 1080 };
const LAB: Rect = { x: 2560, y: 140, width: 2200, height: 1150 };
const CODE: Rect = { x: 5480, y: 220, width: 1560, height: 960 };
const END: Rect = { x: 7820, y: 60, width: 1920, height: 1080 };
const ARM_CLOSEUP: Rect = { x: 2600, y: 200, width: 980, height: 1050 };
const SCOPE_CLOSEUP: Rect = { x: 3600, y: 200, width: 1120, height: 1040 };

const CODE_FEEDBACK_ONLY = `var slot0 = new Slot0Configs();
slot0.kP = 0.6;   // gentle feedback — the cleanup crew
slot0.kD = 0.15;

motor.getConfigurator().apply(slot0);
motor.setControl(positionVoltage.withPosition(target));`;

const CODE_WITH_KG = `var slot0 = new Slot0Configs();
slot0.kP = 0.6;   // gentle feedback — the cleanup crew
slot0.kD = 0.15;
slot0.kG = 3.9;   // feedforward: volts to hold the arm level

motor.getConfigurator().apply(slot0);
motor.setControl(positionVoltage.withPosition(target));`;

export const FeedforwardTrailer: TrailerScript = {
  id: "FeedforwardTrailer",
  voice: "af_heart",
  world: [
    {
      kind: "title",
      id: "title",
      rect: TITLE,
      title: "Feedforward",
      subtitle: "Stop reacting. Start predicting.",
      accent: "mint",
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
      states: ["", CODE_FEEDBACK_ONLY, CODE_WITH_KG],
    },
    {
      kind: "end",
      id: "end",
      rect: END,
      title: "Predict, then correct",
      subtitle:
        "Feedforward carries the load, feedback cleans up — the pattern every good mechanism uses",
      url: "frc5712.com/pid-control",
    },
  ],
  beats: [
    {
      id: "hook",
      text: "Last time, PID moved our arm by reacting to error. Error is the gap between the arm and its target. But a reaction is always late. Feedforward flips the plan. It figures out the push you will need. Then it applies that push before any error shows up.",
      camera: TITLE,
      holdAfter: 0.5,
    },
    {
      id: "recap",
      text: "Here is the same arm, with gentle feedback gains. Gains are the numbers that set the push. Send it to forty-five degrees. It rises, then stalls just under the line. Feedback needs an error to make voltage. So it always keeps a little error.",
      camera: LAB,
      events: [
        { type: "gains", kP: 0.6, kD: 0.15, at: { word: "gentle" } },
        { type: "target", deg: 45, at: { word: "forty-five" } },
      ],
    },
    {
      id: "gravity",
      text: "The thief is gravity. It drags on the arm every single moment. It pulls hardest when the arm is level. And feedback only answers after some angle is already lost. So the gap never goes away.",
      camera: ARM_CLOSEUP,
    },
    {
      id: "kg",
      text: "But we know that force. So cancel it up front. That is feedforward. A number called k G adds just enough volts to hold the arm. No error needed. Watch the gap close on its own.",
      camera: LAB,
      events: [
        { type: "gains", kP: 0.6, kD: 0.15, kG: 3.9, at: { word: "cancel" } },
      ],
    },
    {
      id: "proof",
      text: "Now ask for seventy-five degrees. The feedback gains have not changed. But gravity is already paid for. The arm glides up and lands right on the line. Feedback only sweeps up the crumbs now.",
      camera: SCOPE_CLOSEUP,
      events: [{ type: "target", deg: 75, at: { word: "seventy-five" } }],
    },
    {
      id: "code",
      text: "In code, this is one more line in the slot config. k P and k D stay on as the cleanup crew. Then k G holds the arm up against gravity. We set it to arm cosine mode. That way the push shrinks as the arm points higher.",
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
          at: { word: "holds" },
        },
      ],
      holdAfter: 1.6,
    },
    {
      id: "cta",
      text: "Predict what you can. Correct what is left. That is the whole trick. Next up is Motion Magic, where the path itself gets planned. The full lesson is at frc5712.com.",
      camera: END,
      holdAfter: 1.2,
    },
  ],
};
