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
      text: "This is the full feedforward lesson. PID got our arm to the setpoint by reacting to error — but a reaction is always late. Feedforward flips the plan: compute the push you already know you'll need, and apply it before the error ever exists. Four gains, one idea.",
      camera: TITLE,
      holdAfter: 0.5,
    },
    {
      id: "recap-sag",
      text: "Start with the arm and gentle feedback gains. Send it to forty-five degrees and watch the landing — it rises, slows, and stalls just under the line. Feedback needs an error to make voltage, so it always settles for one.",
      camera: ARM_LAB,
      events: [
        { type: "gains", kP: 0.6, kD: 0.15, at: { word: "gentle" } },
        { type: "target", deg: 45, at: { word: "forty-five" } },
      ],
    },
    {
      id: "gravity",
      text: "The thief is gravity. It drags on the arm every single moment — hardest when the arm is level — and the controller only answers after some angle has already been stolen. That gap is permanent, because closing it would erase the very error that pays for the holding voltage.",
      camera: ARM_CLOSEUP,
    },
    {
      id: "kg",
      text: "But gravity is not a mystery — it's a formula. So cancel it: kG times the cosine of the arm's angle, added to the output on every loop, error or not. Watch the gap close on its own. Same gentle gains — the feedforward is doing the holding now.",
      camera: ARM_LAB,
      events: [
        { type: "gains", kP: 0.6, kD: 0.15, kG: 3.9, at: { word: "cancel" } },
      ],
    },
    {
      id: "kg-proof",
      text: "Now ask for seventy-five degrees. With gravity pre-paid, the arm glides up and lands exactly on the line — no sag, no ringing, and the scope shows it. Feedback is only sweeping up crumbs. That gain has a name: kG, feedforward for gravity.",
      camera: ARM_SCOPE_CLOSEUP,
      events: [{ type: "target", deg: 75, at: { word: "seventy-five" } }],
    },
    {
      id: "family",
      text: "And kG has a whole family. Every predictable cost gets its own gain: kS pays for friction, kV pays for speed, kA pays for acceleration. Each one is a physical measurement of your mechanism, not a knob you fiddle with. To meet the rest, we need a new rig.",
      camera: ARM_LAB,
      holdAfter: 0.5,
    },
    {
      id: "ks",
      text: "A shooter flywheel. Try to spin it with a whisper of voltage and nothing happens — static friction holds the wheel still until roughly half a volt. That's kS: the volts it takes to make anything move at all. Below kS, your commands are just wishes.",
      camera: WHEEL_CLOSEUP,
    },
    {
      id: "velocity-problem",
      text: "Velocity control looks different, but watch the same disease. Proportional feedback only, and a target of thirty-six hundred RPM. The wheel spins up fast — then flattens out around two thousand and parks there, forty percent short of the shot we asked for.",
      camera: FLY_LAB,
      events: [
        { type: "gains", kP: 0.15, kD: 0, at: { word: "proportional" } },
        { type: "rpm", value: 3600, at: { word: "thirty-six" } },
      ],
    },
    {
      id: "sag-explain",
      text: "Sixteen hundred RPM short — this is the flywheel version of the sagging arm. Cruising at speed costs steady voltage, and proportional control can only make voltage out of error, so it keeps a huge error on the books forever just to stay spinning at all.",
      camera: FLY_SCOPE_CLOSEUP,
    },
    {
      id: "kv",
      text: "But the cruise voltage is predictable too. kV: volts per rotation per second — measure it once and pay it up front, plus kS to break the friction. Add both and the wheel climbs straight to thirty-six hundred and holds it. Feedback is down to trimming leftovers.",
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
      text: "Now the real test: game pieces. Each ball through the wheel steals speed on contact — watch the scope. One. Two. Three. Every dip is over four hundred RPM, and every recovery is nearly instant, because feedforward never stopped paying the cruise voltage while feedback caught the difference.",
      camera: FLY_LAB,
      events: [
        { type: "feed", at: { word: "one" } },
        { type: "feed", at: { word: "two" } },
        { type: "feed", at: { word: "three" } },
      ],
    },
    {
      id: "ka",
      text: "There's one more relative: kA, feedforward for acceleration. Changing speed takes extra voltage beyond cruising, and kA pays that bill during spin-up, or whenever a motion profile demands acceleration. Most mechanisms barely need it — but when Motion Magic arrives next lesson, kA will already be waiting.",
      camera: WHEEL_CLOSEUP,
    },
    {
      id: "characterize",
      text: "So where do these numbers come from? Measurement, not guessing. Apply a known voltage — say six volts — let the wheel settle, and read the steady speed. Divide volts by speed and that's kV. The voltage where the wheel first budges — that's kS. Your robot tells you its own constants.",
      camera: FLY_LAB,
    },
    {
      id: "code-arm",
      text: "In code, feedforward lives right next to the feedback gains. Here's the arm's slot config — kP and kD stay on as the cleanup crew, and one new line, kG, holds the arm against gravity, configured as arm cosine so it scales as the arm moves.",
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
          at: { word: "kG" },
        },
      ],
      holdAfter: 1.4,
    },
    {
      id: "code-fly",
      text: "And the flywheel is two lines more. kS covers the friction, kV pays the cruise voltage per rotation per second, and a small kP trims the leftovers. Then a velocity request instead of a position request — setControl with a velocity voltage and the target in rotations per second.",
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
          at: { word: "kS" },
        },
      ],
      holdAfter: 1.4,
    },
    {
      id: "recipe",
      text: "Step back and the whole lesson is one sentence: predict what you can, correct what's left. kS breaks the friction, kG cancels gravity, kV pays for speed, kA pays for change — and feedback shrinks from doing the work to merely checking it.",
      camera: FLY_LAB,
      holdAfter: 0.5,
    },
    {
      id: "cta",
      text: "Next lesson: Motion Magic. Instead of asking a mechanism to teleport, we plan the whole path — and with feedforward paying the way, it follows that plan almost perfectly. The write-up, the sim, and the code are at frc5712.com. Stop reacting. Start predicting.",
      camera: END,
      holdAfter: 1.2,
    },
  ],
};
