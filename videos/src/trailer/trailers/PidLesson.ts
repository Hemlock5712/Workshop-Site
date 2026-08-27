import type { Rect, TrailerScript } from "../lib/types";

// Full-length PID lesson (~4.5 min). Everything the 90s trailer cut: why P
// sags, why it rings, over-damped D, the I term and its windup (and why the
// workshop skips it), disturbance recovery, the actual tuning procedure, and
// tolerance via the at-target check (holds never finish; chains use .until).

const TITLE: Rect = { x: 0, y: 0, width: 1920, height: 1080 };
const LAB: Rect = { x: 2560, y: 140, width: 2200, height: 1150 };
const TUNING: Rect = { x: 5480, y: 160, width: 2200, height: 1100 };
const CODE: Rect = { x: 8440, y: 220, width: 1620, height: 960 };
const END: Rect = { x: 10800, y: 60, width: 1920, height: 1080 };
const ARM_CLOSEUP: Rect = { x: 2600, y: 200, width: 980, height: 1050 };
const SCOPE_CLOSEUP: Rect = { x: 3600, y: 200, width: 1120, height: 1040 };

const GOTO_CODE = `// "There" is never exact — pick a tolerance the game allows.
private static final double TARGET = 30.0; // degrees
private static final double TOLERANCE = 2.0; // degrees

public Command goToTarget() {
  return runRepeatedly(() -> setPosition(TARGET)).named("target (hold)");
}

public boolean isAtTarget() {
  return Math.abs(TARGET - positionDegrees()) < TOLERANCE;
}

// chains move on with: arm.goToTarget().until(arm::isAtTarget)`;

export const PidLesson: TrailerScript = {
  id: "PidLesson",
  voice: "af_heart",
  world: [
    {
      kind: "title",
      id: "title",
      rect: TITLE,
      title: "PID Control",
      subtitle:
        "The full lesson — sag, ring, damping, and how to actually tune",
      accent: "purple",
    },
    {
      kind: "pid-lab",
      id: "lab",
      rect: LAB,
      startDeg: -45,
      hardStopDeg: -45,
      chips: ["kP", "kI", "kD", "target"],
    },
    {
      kind: "diagram",
      id: "tuning",
      rect: TUNING,
      title: "The tuning procedure",
      nodes: [
        {
          id: "start",
          label: "Start kP small",
          sublabel: "so small it barely moves",
          x: 80,
          y: 150,
          width: 460,
          height: 220,
          accent: "blue",
          step: 1,
        },
        {
          id: "double",
          label: "Double kP",
          sublabel: "until it overshoots and rings",
          x: 880,
          y: 150,
          width: 460,
          height: 220,
          accent: "amber",
          step: 2,
        },
        {
          id: "backoff",
          label: "Back off ~30%",
          sublabel: "just below the ringing point",
          x: 1680,
          y: 150,
          width: 460,
          height: 220,
          accent: "amber",
          step: 3,
        },
        {
          id: "addd",
          label: "Add kD",
          sublabel: "until the landing is crisp",
          x: 880,
          y: 720,
          width: 460,
          height: 220,
          accent: "purple",
          step: 4,
        },
        {
          id: "verify",
          label: "Verify",
          sublabel: "big steps, small steps, bumps",
          x: 1680,
          y: 720,
          width: 460,
          height: 220,
          accent: "mint",
          step: 5,
        },
      ],
      edges: [
        { from: "start", to: "double" },
        { from: "double", to: "backoff" },
        { from: "backoff", to: "addd", step: 4 },
        { from: "addd", to: "verify", step: 5 },
      ],
    },
    {
      kind: "code",
      id: "goto-code",
      rect: CODE,
      fileName: "Arm.java",
      language: "java",
      states: ["", GOTO_CODE],
    },
    {
      kind: "end",
      id: "end",
      rect: END,
      title: "Tuned. Now stop fighting gravity.",
      subtitle:
        "Next lesson: feedforward — kS, kV, and kG carry the load so PID only trims",
      url: "frc5712.com/pid-control",
    },
  ],
  beats: [
    {
      id: "hook",
      text: "Everybody's first PID attempt goes: guess, deploy, wince, guess again. That works, eventually. This lesson gets you to the version where the graph tells you which number to move, so tuning takes twenty minutes instead of a whole build night.",
      camera: TITLE,
      holdAfter: 0.5,
    },
    {
      id: "setup",
      text: "Our rig: an arm on a motor, heavy enough that gravity matters. It's flat on its hard stop, and we want it at thirty. That gap, in degrees, is the error, and it's the only quantity the controller ever sees. Not the angle it's sitting at. The gap.",
      camera: ARM_CLOSEUP,
      events: [{ type: "target", deg: 30, at: { word: "thirty" } }],
    },
    {
      id: "p-concept",
      text: "P stands for proportional: voltage equals kP times the error, where kP is a number you pick. Ten degrees off, some push. One degree off, a tenth of that push. Start it small and watch. The arm rises, slows, and quits climbing short of the target.",
      camera: LAB,
      events: [{ type: "gains", kP: 0.2, kD: 0, at: { word: "proportional" } }],
    },
    {
      id: "p-sag",
      text: "It stalls nineteen degrees short, and that's not a bug. At that angle kP times the remaining error produces exactly enough voltage to hold the arm's weight. Push balances gravity. Nothing is left over to climb the rest, and P can't push without error, so the error stays. Forever.",
      camera: SCOPE_CLOSEUP,
    },
    {
      id: "p-crank",
      text: "The obvious move is to crank kP up, way up. Now a two-degree error makes real voltage. Watch how it gets there, though. It arrives at full speed, blows through the target, overshoots, comes back, overshoots again. Every team has a word for that: ringing.",
      camera: LAB,
      events: [{ type: "gains", kP: 2.5, kD: 0, at: { word: "crank" } }],
    },
    {
      id: "why-ring",
      text: "Ringing isn't randomness. P knows where the arm is and nothing else. It has no idea the arm is crossing the target at ninety degrees a second, so nothing brakes, and momentum takes it straight through. Then the error flips sign, the push flips with it, and around you go again.",
      camera: SCOPE_CLOSEUP,
    },
    {
      id: "d-term",
      text: "D stands for derivative, the rate the error changes. Feed that back with the opposite sign and you get a brake that scales with your closing speed. Approach fast, brake hard. Barely moving, barely any brake. Same kP, a touch of kD. Ask for sixty and it just lands.",
      camera: LAB,
      events: [
        { type: "gains", kP: 2.5, kD: 0.2, at: { word: "derivative" } },
        { type: "target", deg: 60, at: { word: "sixty" } },
      ],
    },
    {
      id: "d-overdone",
      text: "D has a failure mode too. Raise kD far enough and the brake fights the push the whole way. Send the arm back down to ten. It creeps. Smooth, and four seconds slower than the team next to you.",
      camera: SCOPE_CLOSEUP,
      events: [
        { type: "gains", kP: 2.5, kD: 2.8, at: { word: "raise" } },
        { type: "target", deg: 10, at: { word: "ten" } },
      ],
    },
    {
      id: "d-right",
      text: "Back kD off until the landing turns crisp. Quick approach, one settle, done. That's the feel a tuned mechanism has, and no spec sheet will give you the number. Take it up to forty-five and watch it repeat.",
      camera: LAB,
      events: [
        { type: "gains", kP: 2.5, kD: 0.2, at: { word: "off" } },
        { type: "target", deg: 45, at: { word: "forty-five" } },
      ],
    },
    {
      id: "i-intro",
      text: "The I term, then. Integral: add up the error over time and push in proportion to the accumulated total. An arm parked short of the target keeps feeding the pile, the pile keeps growing, and the push grows with it until the gap finally closes. Patience, mechanized.",
      camera: ARM_CLOSEUP,
      events: [
        { type: "gains", kP: 0.35, kD: 0.15, at: { word: "Integral" } },
        { type: "target", deg: 20, at: { word: "short" } },
      ],
    },
    {
      id: "i-demo",
      text: "Same weak P as before, same sag, arm stuck below twenty. Now add kI and watch the memory do its work. The integral climbs, the voltage climbs with it, and the arm grinds its way onto the target. Then it keeps going. All that stored-up push has to go somewhere.",
      camera: SCOPE_CLOSEUP,
      events: [
        { type: "gains", kP: 0.35, kD: 0.05, kI: 1.2, at: { word: "add" } },
      ],
    },
    {
      id: "i-verdict",
      text: "That overshoot has a name: integral windup. It's the reason this workshop leaves kI at zero. Integral is a slow, blind guess at a force you can compute in one line, and nobody on your team is confused about gravity. Next lesson hands that job to feedforward, which pushes the instant you ask.",
      camera: LAB,
      holdAfter: 0.6,
    },
    {
      id: "bump",
      text: "Arriving is the easy half. Back on the tuned gains, and now bump the arm hard, the way a defense bot does. The error appears, and P answers it on the same cycle. D keeps the recovery from becoming a new oscillation, and the arm is back on target in under a second.",
      camera: ARM_CLOSEUP,
      events: [
        { type: "gains", kP: 2.5, kD: 0.2, kI: 0, at: { word: "tuned" } },
        { type: "impulse", degPerSec: -140, at: { word: "bump" } },
      ],
    },
    {
      id: "procedure-1",
      text: "The procedure. Same order every time, in simulation, before the mechanism can hurt anybody. Step one: kP absurdly low. Then double it, and double it again, until the arm overshoots and rings. You need to find that edge before you can back away from it.",
      camera: { x: 5500, y: 120, width: 2160, height: 560 },
      events: [
        { type: "diagram", artifact: "tuning", step: 1, at: { word: "one" } },
        {
          type: "diagram",
          artifact: "tuning",
          step: 2,
          at: { word: "double" },
        },
      ],
    },
    {
      id: "procedure-2",
      text: "Step three walks kP back about thirty percent. Now you're under that edge with margin. Step four: add kD a little at a time until the settle stops bouncing. Then verify like you don't trust yourself, because in a month you won't.",
      camera: TUNING,
      events: [
        { type: "diagram", artifact: "tuning", step: 3, at: { word: "three" } },
        { type: "diagram", artifact: "tuning", step: 4, at: { word: "four" } },
        {
          type: "diagram",
          artifact: "tuning",
          step: 5,
          at: { word: "verify" },
        },
      ],
    },
    {
      id: "tolerance",
      text: "It never lands exactly. A real arm jitters by hundredths of a degree forever, so you declare a tolerance and call anything inside it arrived. The hold command never finishes on its own, and that's on purpose. A chain gets past it with an until check. Let the game pick the number.",
      camera: CODE,
      events: [
        {
          type: "code-state",
          artifact: "goto-code",
          state: 1,
          at: { progress: 0.03 },
        },
      ],
      holdAfter: 1.4,
    },
    {
      id: "cta",
      text: "One arm, one constant force, and the whole procedure transfers: a flywheel or an elevator tunes exactly the same way. What doesn't transfer is guessing kP big enough to hold the arm up. The next lesson stops asking it to.",
      camera: END,
      holdAfter: 1.2,
    },
  ],
};
