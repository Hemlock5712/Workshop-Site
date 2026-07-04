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
      text: "Last time, PID got our arm to the setpoint by reacting to error. But a reaction is always late. Feedforward flips the plan: compute the push you know you'll need, and apply it before the error ever shows up.",
      camera: TITLE,
      holdAfter: 0.5,
    },
    {
      id: "recap",
      text: "Here's the same arm with gentle feedback gains. Send it to forty-five degrees and watch closely — it rises, then stalls just under the line. Feedback needs an error to make voltage, so it always settles for one.",
      camera: LAB,
      events: [
        { type: "gains", kP: 0.6, kD: 0.15, at: { word: "gentle" } },
        { type: "target", deg: 45, at: { word: "forty-five" } },
      ],
    },
    {
      id: "gravity",
      text: "The thief is gravity. It drags on the arm every single moment — hardest when the arm is level — and the controller only answers after some angle has already been stolen. That gap is permanent.",
      camera: ARM_CLOSEUP,
    },
    {
      id: "kg",
      text: "But we know that force. So cancel it: kG times the cosine of the arm's angle, added to the output on every loop. No error required. Watch the gap close on its own.",
      camera: LAB,
      events: [
        { type: "gains", kP: 0.6, kD: 0.15, kG: 3.9, at: { word: "cancel" } },
      ],
    },
    {
      id: "proof",
      text: "Now ask for seventy-five degrees. Same gentle gains — but with gravity pre-paid, the arm glides up and lands exactly on the line. Feedback is only sweeping up the crumbs now.",
      camera: SCOPE_CLOSEUP,
      events: [{ type: "target", deg: 75, at: { word: "seventy-five" } }],
    },
    {
      id: "code",
      text: "In code it's one more line in the slot config. kP and kD stay on as the cleanup crew, and kG holds the arm against gravity — configured as arm cosine, so it scales automatically as the arm moves.",
      camera: CODE,
      events: [
        {
          type: "code-state",
          artifact: "code",
          state: 1,
          at: { progress: 0.03 },
        },
        { type: "code-state", artifact: "code", state: 2, at: { word: "kG" } },
      ],
      holdAfter: 1.6,
    },
    {
      id: "cta",
      text: "Predict what you can, correct what's left — that's the whole trick. Next up: Motion Magic, where the path itself gets planned. The full lesson is at frc5712.com.",
      camera: END,
      holdAfter: 1.2,
    },
  ],
};
