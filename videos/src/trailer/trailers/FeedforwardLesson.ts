import type { Rect, TrailerScript } from "../lib/types";

// Full-length feedforward lesson (~4.5 min). Everything the 90s trailer cut:
// the whole SVA+G family. kG on the arm (condensed recap), then kS, kV, and
// kA on a shooter flywheel, how to measure kV instead of guessing it, and the
// Phoenix 6 code for both mechanisms.

const TITLE: Rect = { x: 0, y: 0, width: 1920, height: 1080 };
const ARM_LAB: Rect = { x: 2560, y: 140, width: 2200, height: 1150 };
const FLY_LAB: Rect = { x: 5480, y: 140, width: 2200, height: 1150 };
const ARM_CODE: Rect = { x: 8440, y: 220, width: 1560, height: 960 };
const FLY_CODE: Rect = { x: 10640, y: 220, width: 1620, height: 960 };
const END: Rect = { x: 13000, y: 60, width: 1920, height: 1080 };
const ARM_CLOSEUP: Rect = { x: 2600, y: 200, width: 980, height: 1050 };
const ARM_SCOPE_CLOSEUP: Rect = { x: 3600, y: 200, width: 1120, height: 1040 };
const WHEEL_CLOSEUP: Rect = { x: 5520, y: 200, width: 980, height: 1050 };
const FLY_SCOPE_CLOSEUP: Rect = { x: 6520, y: 200, width: 1120, height: 1040 };

const ARM_CODE_FEEDBACK_ONLY = `var slot0 = new Slot0Configs();
slot0.kP = 0.6;   // gentle feedback — the cleanup crew
slot0.kD = 0.15;

motor.getConfigurator().apply(slot0);
motor.setControl(positionVoltage.withPosition(target));`;

const ARM_CODE_WITH_KG = `var slot0 = new Slot0Configs();
slot0.kP = 0.6;   // gentle feedback — the cleanup crew
slot0.kD = 0.15;
slot0.kG = 3.9;   // feedforward: volts to hold the arm level

motor.getConfigurator().apply(slot0);
motor.setControl(positionVoltage.withPosition(target));`;

const FLY_CODE_FEEDBACK_ONLY = `var slot0 = new Slot0Configs();
slot0.kP = 0.15;   // feedback trims the leftovers

motor.getConfigurator().apply(slot0);
motor.setControl(velocityVoltage.withVelocity(targetRps));`;

const FLY_CODE_WITH_FF = `var slot0 = new Slot0Configs();
slot0.kS = 0.5;    // volts to overcome friction
slot0.kV = 0.115;  // volts per rotation-per-second
slot0.kP = 0.15;   // feedback trims the leftovers

motor.getConfigurator().apply(slot0);
motor.setControl(velocityVoltage.withVelocity(targetRps));`;

export const FeedforwardLesson: TrailerScript = {
  id: "FeedforwardLesson",
  voice: "af_heart",
  world: [
    {
      kind: "title",
      id: "title",
      rect: TITLE,
      title: "Feedforward",
      subtitle:
        "The full lesson — kS, kV, kA, and kG: predict the force, then correct",
      accent: "mint",
    },
    {
      kind: "pid-lab",
      id: "lab",
      rect: ARM_LAB,
      startDeg: -45,
      hardStopDeg: -45,
      chips: ["kP", "kD", "kG", "target"],
    },
    {
      kind: "flywheel-lab",
      id: "fly",
      rect: FLY_LAB,
      chips: ["kP", "kS", "kV", "target"],
    },
    {
      kind: "code",
      id: "arm-code",
      rect: ARM_CODE,
      fileName: "Arm.java",
      language: "java",
      states: ["", ARM_CODE_FEEDBACK_ONLY, ARM_CODE_WITH_KG],
    },
    {
      kind: "code",
      id: "fly-code",
      rect: FLY_CODE,
      fileName: "Flywheel.java",
      language: "java",
      states: ["", FLY_CODE_FEEDBACK_ONLY, FLY_CODE_WITH_FF],
    },
    {
      kind: "end",
      id: "end",
      rect: END,
      title: "Predict, then correct",
      subtitle:
        "Next lesson: Motion Magic — plan the whole path and let feedforward follow it",
      url: "frc5712.com/pid-control",
    },
  ],
  beats: [
    {
      id: "hook",
      text: "This is the full feedforward lesson. PID moved our arm by reacting to error. Error is the gap between you and the target. But a reaction is always late. Feedforward flips the plan. Work out the push you know you will need. Apply it before the error even exists. Four numbers, one idea.",
      camera: TITLE,
      holdAfter: 0.5,
    },
    {
      id: "recap-sag",
      text: "Start with the arm, using gentle feedback gains. A gain is a number that sets how hard we push. Send the arm to forty-five degrees. It rises, slows, and stalls just under the line. Feedback needs an error to make voltage. So it always keeps a little error.",
      camera: ARM_LAB,
      events: [
        { type: "gains", kP: 0.6, kD: 0.15, at: { word: "gentle" } },
        { type: "target", deg: 45, at: { word: "forty-five" } },
      ],
    },
    {
      id: "gravity",
      text: "The thief is gravity. It drags on the arm every single moment. It pulls hardest when the arm is level. And feedback only answers after some angle is already lost. The gap can never close. If it closed, the error would vanish. And with no error, there is no voltage left to hold the arm.",
      camera: ARM_CLOSEUP,
    },
    {
      id: "kg",
      text: "But gravity is not a mystery. It is a formula. So cancel it up front. A number called k G adds the exact volts that gravity steals. More volts when the arm is level. Fewer when it points up. No error needed. Watch the gap close on its own. Feedforward is doing the holding now.",
      camera: ARM_LAB,
      events: [
        { type: "gains", kP: 0.6, kD: 0.15, kG: 3.9, at: { word: "cancel" } },
      ],
    },
    {
      id: "kg-proof",
      text: "Now ask for seventy-five degrees. Gravity is already paid for. The arm glides up and lands right on the line. No sag. No ringing. The scope proves it. Feedback only sweeps up crumbs. That gain has a name: k G, the feedforward for gravity.",
      camera: ARM_SCOPE_CLOSEUP,
      events: [{ type: "target", deg: 75, at: { word: "seventy-five" } }],
    },
    {
      id: "family",
      text: "And k G has a whole family. Every cost you can predict gets its own gain. k S pays for friction. k V pays for speed. k A pays for speeding up. Each one is a real measurement of your mechanism. It is not a knob you fiddle with. To meet the rest, we need a new rig.",
      camera: ARM_LAB,
      holdAfter: 0.5,
    },
    {
      id: "ks",
      text: "Meet a shooter flywheel. Give it a whisper of voltage. Nothing happens. Friction grips the wheel until about half a volt. That first cost is k S. It is the volts it takes to make anything move at all. Below k S, your commands are just wishes.",
      camera: WHEEL_CLOSEUP,
    },
    {
      id: "velocity-problem",
      text: "Now for velocity control: holding a speed instead of a position. Watch the same disease. Proportional feedback only. The target is thirty-six hundred RPM. RPM means rotations per minute. The wheel spins up fast. Then it flattens out near two thousand and parks there. That is forty percent short.",
      camera: FLY_LAB,
      events: [
        { type: "gains", kP: 0.15, kD: 0, at: { word: "proportional" } },
        { type: "rpm", value: 3600, at: { word: "thirty-six" } },
      ],
    },
    {
      id: "sag-explain",
      text: "Sixteen hundred RPM short. This is the flywheel version of the sagging arm. Staying at speed costs steady voltage. But proportional control can only make voltage out of error. So it holds on to a huge error forever, just to keep spinning at all.",
      camera: FLY_SCOPE_CLOSEUP,
    },
    {
      id: "kv",
      text: "But the cruising voltage is predictable too. That gain is k V: volts for each rotation per second. Measure it once and pay it up front. Include k S to break the friction. Now add both. The wheel climbs straight to thirty-six hundred and holds. Feedback only trims the leftovers.",
      camera: FLY_LAB,
      events: [
        {
          type: "gains",
          kP: 0.15,
          kD: 0,
          kS: 0.5,
          kV: 0.115,
          at: { word: "add" },
        },
      ],
    },
    {
      id: "feed",
      text: "Now the real test: game pieces. Each ball that goes through steals speed from the wheel. Watch the scope. One. Two. Three. Every dip is over four hundred RPM. And every recovery is almost instant. Feedforward never stopped paying the cruise voltage. Feedback just catches the small difference.",
      camera: FLY_LAB,
      events: [
        { type: "feed", at: { word: "one" } },
        { type: "feed", at: { word: "two" } },
        { type: "feed", at: { word: "three" } },
      ],
    },
    {
      id: "ka",
      text: "There is one more relative: k A, the feedforward for acceleration. Acceleration means changing speed. Changing speed takes extra voltage, beyond cruising. k A pays that extra bill during spin-up. Most mechanisms barely need it. But when Motion Magic arrives next lesson, k A will already be waiting.",
      camera: WHEEL_CLOSEUP,
    },
    {
      id: "characterize",
      text: "So where do these numbers come from? You measure them. No guessing. Apply a known voltage, like six volts. Let the wheel settle. Read the steady speed. Divide the volts by that speed. That answer is k V. Then find the voltage where the wheel first budges. That is k S. Your robot tells you its own numbers.",
      camera: FLY_LAB,
    },
    {
      id: "code-arm",
      text: "In code, feedforward lives right next to the feedback gains. Here is the arm's slot config. k P and k D stay on as the cleanup crew. One new line, k G, holds the arm against gravity. We set it to arm cosine mode. Then the volts scale as the arm moves.",
      camera: ARM_CODE,
      events: [
        {
          type: "code-state",
          artifact: "arm-code",
          state: 1,
          at: { progress: 0.03 },
        },
        {
          type: "code-state",
          artifact: "arm-code",
          state: 2,
          at: { word: "holds" },
        },
      ],
      holdAfter: 1.4,
    },
    {
      id: "code-fly",
      text: "And the flywheel needs two lines more. k S covers the friction. k V pays the cruise voltage for each rotation per second. A small k P trims the leftovers. Then we send a velocity request instead of a position request. That is set control with a velocity voltage, and the target in rotations per second.",
      camera: FLY_CODE,
      events: [
        {
          type: "code-state",
          artifact: "fly-code",
          state: 1,
          at: { progress: 0.03 },
        },
        {
          type: "code-state",
          artifact: "fly-code",
          state: 2,
          at: { word: "covers" },
        },
      ],
      holdAfter: 1.4,
    },
    {
      id: "recipe",
      text: "Zoom out. The whole lesson is one sentence. Predict what you can. Correct what is left. k S breaks the friction. k G cancels gravity. k V pays for speed. k A pays for speeding up. Feedback stops doing the heavy work. It just checks the result.",
      camera: FLY_LAB,
      holdAfter: 0.5,
    },
    {
      id: "cta",
      text: "Next lesson: Motion Magic. Instead of asking a mechanism to teleport, we plan the whole path. Feedforward pays the way. The mechanism follows the plan almost perfectly. The write-up, the sim, and the code are at frc5712.com. Stop reacting. Start predicting.",
      camera: END,
      holdAfter: 1.2,
    },
  ],
};
