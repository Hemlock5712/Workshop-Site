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
      text: "Last time, PID moved this arm by reacting to error. Reaction is always late — one loop late, every single loop. Feedforward flips that around: work out how much push the arm will need, then send it before there's any error to react to.",
      camera: TITLE,
      holdAfter: 0.5,
    },
    {
      id: "recap",
      text: "Same arm, feedback only, gains dialed gentle. Send it to forty-five degrees. Watch where it parks: short of the line, and it stays there. Feedback has to see error to make voltage, so it keeps a little error forever. On purpose.",
      camera: LAB,
      events: [
        { type: "gains", kP: 0.6, kD: 0.15, at: { word: "gentle" } },
        { type: "target", deg: 45, at: { word: "forty-five" } },
      ],
    },
    {
      id: "gravity",
      text: "Gravity pulls on that arm every millisecond of the match, hardest when it's straight out sideways, and feedback can only answer after the arm has already dropped. So the sag isn't a tuning mistake. It's arithmetic.",
      camera: ARM_CLOSEUP,
    },
    {
      id: "kg",
      text: "That pull isn't a mystery. It's mass, gravity, and the cosine of the angle. Compute it, then cancel it up front. kG hands the motor exactly those volts, no error required, and the gap closes on its own.",
      camera: LAB,
      events: [
        { type: "gains", kP: 0.6, kD: 0.15, kG: 3.9, at: { word: "cancel" } },
      ],
    },
    {
      id: "proof",
      text: "Now ask for seventy-five degrees. Nobody touched the feedback gains. But gravity's bill is already paid, so the arm just glides up and settles on the line, no second attempt, no hunting around underneath it. Feedback barely has anything to do.",
      camera: SCOPE_CLOSEUP,
      events: [{ type: "target", deg: 75, at: { word: "seventy-five" } }],
    },
    {
      id: "code",
      text: "In code it's one line. kP and kD stay exactly where PID left them. Then kG holds the arm against gravity. Set it to arm cosine mode and Phoenix scales that push by the angle for you, so ninety degrees costs almost nothing.",
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
      text: "Predict what you can, correct what's left. That one habit is worth more than any night of guessing. Next up: Motion Magic, and the end of the twelve-volt slam.",
      camera: END,
      holdAfter: 1.2,
    },
  ],
};
