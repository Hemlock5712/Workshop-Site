import type { Rect, TrailerScript } from "../lib/types";

// Full-length state machine lesson (~4 min). Everything the 90s trailer cut:
// why boolean/if spaghetti fails, each state and edge of the Auto Arm Cycle in
// depth, conditional vs completion transitions, building the machine in typed
// diffs, the adding-a-state checklist, and the exact interrupt semantics
// (declaration order, rising edge, onExit → cancel → takeover, no extra yield).
// All Java comes verbatim from src/app/(workshop)/state-based/page.tsx.

const TITLE: Rect = { x: 0, y: 0, width: 1920, height: 1080 };
const DIAGRAM: Rect = { x: 2560, y: 160, width: 2200, height: 1150 };
const CODE: Rect = { x: 5480, y: 200, width: 1680, height: 1000 };
const CODE2: Rect = { x: 7600, y: 300, width: 1700, height: 780 };
const END: Rect = { x: 9860, y: 60, width: 1920, height: 1080 };

// Camera close-ups inside the diagram (world coordinates).
const TITLE_PUSH: Rect = { x: 140, y: 120, width: 1640, height: 880 };
const EDGE_OPERATOR: Rect = { x: 2600, y: 220, width: 1520, height: 800 };
const EDGE_SENSOR: Rect = { x: 3380, y: 220, width: 1400, height: 740 };
const EDGE_COMPLETE: Rect = { x: 2600, y: 300, width: 2120, height: 1060 };

// Verbatim from the state-based page (comments trimmed to fit).
const SM_STATES = `public Command autoArmCycle() {
  StateMachine sm = new StateMachine("Auto Arm Cycle");

  State stowed  = sm.addState(arm.low());
  State pickup  = sm.addState(arm.low());        // ready to grab
  State scoring = sm.addState(arm.high());
  sm.setInitialState(stowed);

  return sm;
}`;

const SM_TRANSITIONS = `public Command autoArmCycle() {
  StateMachine sm = new StateMachine("Auto Arm Cycle");

  State stowed  = sm.addState(arm.low());
  State pickup  = sm.addState(arm.low());        // ready to grab
  State scoring = sm.addState(arm.high());
  sm.setInitialState(stowed);

  stowed.switchTo(pickup).when(operator.intake);
  pickup.switchTo(scoring).when(gripper::hasGamePiece);
  scoring.switchTo(stowed).whenCompleteAnd(() -> !gripper.hasGamePiece());

  return sm;
}`;

const SM_NEW_STATE = `public Command autoArmCycle() {
  StateMachine sm = new StateMachine("Auto Arm Cycle");

  State stowed  = sm.addState(arm.low());
  State pickup  = sm.addState(arm.low());        // ready to grab
  State scoring = sm.addState(arm.high());
  State defense = sm.addState(arm.backward());
  sm.setInitialState(stowed);

  stowed.switchTo(pickup).when(operator.intake);
  pickup.switchTo(scoring).when(gripper::hasGamePiece);
  scoring.switchTo(stowed).whenCompleteAnd(() -> !gripper.hasGamePiece());

  return sm;
}`;

const SM_FULL = `public Command autoArmCycle() {
  StateMachine sm = new StateMachine("Auto Arm Cycle");

  State stowed  = sm.addState(arm.low());
  State pickup  = sm.addState(arm.low());        // ready to grab
  State scoring = sm.addState(arm.high());
  State defense = sm.addState(arm.backward());
  sm.setInitialState(stowed);

  stowed.switchTo(pickup).when(operator.intake);
  pickup.switchTo(scoring).when(gripper::hasGamePiece);
  scoring.switchTo(stowed).whenCompleteAnd(() -> !gripper.hasGamePiece());
  sm.switchFromAny().to(defense).when(driver.defenseMode);

  return sm;
}`;

const ARM_FACTORIES = `/** Drive to a target angle and finish once we arrive. */
public Command goTo(Angle target, Angle tolerance, String label) {
  return run(coroutine -> {
    setPosition(target);
    coroutine.waitUntil(() -> atTarget(target, tolerance));
  }).named("Arm:" + label);
}

// Thin wrappers — one per useful position.
public Command low()      { return goTo(Degrees.of(0),   Degrees.of(1), "LOW"); }
public Command high()     { return goTo(Degrees.of(90),  Degrees.of(2), "HIGH"); }
public Command backward() { return goTo(Degrees.of(180), Degrees.of(3), "BACKWARD"); }`;

export const StateBasedLesson: TrailerScript = {
  id: "StateBasedLesson",
  voice: "af_heart",
  world: [
    {
      kind: "title",
      id: "title",
      rect: TITLE,
      title: "State-Based Control",
      subtitle:
        "The full lesson — states, transitions, interrupts, and the StateMachine class",
      accent: "blue",
    },
    {
      kind: "diagram",
      id: "states",
      rect: DIAGRAM,
      title: "Auto Arm Cycle",
      nodes: [
        {
          id: "stowed",
          label: "Stowed",
          sublabel: "arm.low()",
          x: 80,
          y: 380,
          width: 460,
          height: 220,
          accent: "blue",
          step: 1,
        },
        {
          id: "pickup",
          label: "Pickup",
          sublabel: "arm.low() — ready to grab",
          x: 870,
          y: 100,
          width: 460,
          height: 220,
          accent: "amber",
          step: 2,
        },
        {
          id: "scoring",
          label: "Scoring",
          sublabel: "arm.high()",
          x: 1660,
          y: 380,
          width: 460,
          height: 220,
          accent: "mint",
          step: 3,
        },
        {
          id: "defense",
          label: "Defense",
          sublabel: "arm.backward()",
          x: 870,
          y: 800,
          width: 460,
          height: 220,
          accent: "purple",
          step: 7,
        },
      ],
      edges: [
        { from: "stowed", to: "pickup", label: "operator.intake", step: 4 },
        { from: "pickup", to: "scoring", label: "hasGamePiece", step: 5 },
        { from: "scoring", to: "stowed", label: "whenCompleteAnd", step: 6 },
        { from: "stowed", to: "defense", step: 7 },
        { from: "scoring", to: "defense", label: "switchFromAny", step: 7 },
      ],
    },
    {
      kind: "code",
      id: "sm-code",
      rect: CODE,
      fileName: "Routines.java",
      language: "java",
      states: ["", SM_STATES, SM_TRANSITIONS, SM_NEW_STATE, SM_FULL],
    },
    {
      kind: "code",
      id: "arm-code",
      rect: CODE2,
      fileName: "Arm.java",
      language: "java",
      states: ["", ARM_FACTORIES],
    },
    {
      kind: "end",
      id: "end",
      rect: END,
      title: "One state alive. Every arrow declared.",
      subtitle:
        "Entry and exit hooks, exit transitions, and coroutine branching — in the full lesson",
      url: "frc5712.com/state-based",
    },
  ],
  beats: [
    {
      id: "hook",
      text: "Here's how most arm code dies. One boolean for intaking, another for scoring, a flag for defense mode, and forty if statements trying to keep them all honest. It works in week one. Then the robot grows, the booleans multiply, and nobody can say what the arm is doing right now.",
      camera: TITLE,
      holdAfter: 0.5,
    },
    {
      id: "why-not-ifs",
      text: "The failure modes are always the same. Two triggers fire on the same loop and fight over the motor. A flag gets set on the way up and never cleared on the way down. Race conditions, forgotten flags, and no single source of truth — just guesses smeared across a dozen booleans.",
      camera: TITLE_PUSH,
    },
    {
      id: "state-idea",
      text: "State-based control replaces the guessing with a name. A state is just a command that runs while you're in it, and the machine keeps exactly one alive at a time. Start with three positions. The first is Stowed — arm dot low, tucked in and safe, where every cycle begins.",
      camera: DIAGRAM,
      events: [
        {
          type: "diagram",
          artifact: "states",
          step: 1,
          at: { word: "Stowed" },
        },
      ],
    },
    {
      id: "states-walk",
      text: "Pickup runs the same low target, but it means something different — ready to grab. Scoring runs arm dot high. Same motor, same mechanism, three named activities. Ask the machine what the arm is doing, and it answers with exactly one of these — never a shrug.",
      camera: DIAGRAM,
      events: [
        {
          type: "diagram",
          artifact: "states",
          step: 2,
          at: { word: "Pickup" },
        },
        {
          type: "diagram",
          artifact: "states",
          step: 3,
          at: { word: "Scoring" },
        },
      ],
    },
    {
      id: "edge-operator",
      text: "Now the edges — and every edge declares its trigger. The first is operator input: stowed dot switchTo pickup, when operator dot intake. The driver presses the intake button, the machine cancels stowed's command, and pickup takes over. No flag to set, and no flag to forget.",
      camera: EDGE_OPERATOR,
      events: [
        { type: "diagram", artifact: "states", step: 4, at: { word: "edges" } },
      ],
    },
    {
      id: "edge-sensor",
      text: "The second edge has no button at all: pickup dot switchTo scoring, when gripper hasGamePiece. A when condition is checked every scheduler tick while the state's command is running, and it's rising-edge guarded — it has to go false and then true again before it can fire twice.",
      camera: EDGE_SENSOR,
      events: [
        {
          type: "diagram",
          artifact: "states",
          step: 5,
          at: { word: "scoring" },
        },
      ],
    },
    {
      id: "edge-completion",
      text: "The third edge waits for completion: scoring dot switchTo stowed, whenCompleteAnd the gripper is empty. Plain whenComplete fires once, after the state's command finishes on its own. whenCompleteAnd chains one extra check onto that — and it takes precedence over a plain whenComplete when both apply.",
      camera: EDGE_COMPLETE,
      events: [
        { type: "diagram", artifact: "states", step: 6, at: { word: "third" } },
      ],
    },
    {
      id: "two-kinds",
      text: "Which flavor you use depends on the command underneath. A when condition is only checked while the command is looping, so a one-shot that never yields will never see it. Looping states leave on when. One-shot states leave on whenComplete. Pick the transition to match the state.",
      camera: DIAGRAM,
      holdAfter: 0.6,
    },
    {
      id: "code-construct",
      text: "Time to build it. Construct the StateMachine with a name — required, and it shows up in telemetry. addState wraps each command and hands back a State. Then setInitialState. That one is enforced at compile time — leave it out and you get a build error, not a runtime surprise.",
      camera: CODE,
      events: [
        {
          type: "code-state",
          artifact: "sm-code",
          state: 1,
          at: { progress: 0.03 },
        },
      ],
      holdAfter: 0.6,
    },
    {
      id: "code-transitions",
      text: "Now wire the transitions, and notice the shape: three declarative lines, one per arrow in the diagram. Button edge, sensor edge, completion edge. There's no update loop to write and no phase variable to check — the graph you drew on the whiteboard is literally the code you ship.",
      camera: CODE,
      events: [
        {
          type: "code-state",
          artifact: "sm-code",
          state: 2,
          at: { word: "wire" },
        },
      ],
      holdAfter: 0.8,
    },
    {
      id: "adding-a-state",
      text: "Mid-season the game demands a fourth position: defense, arm swung backward. Here's the entire checklist. Add the state — one addState line wrapping arm dot backward. Then wire its transitions in, and out if it ever hands control back. Nothing else changes. The other states never even know.",
      camera: CODE,
      events: [
        {
          type: "code-state",
          artifact: "sm-code",
          state: 3,
          at: { word: "defense" },
        },
      ],
      holdAfter: 0.6,
    },
    {
      id: "interrupt",
      text: "And defense can't wait for a tidy edge from wherever the arm happens to be, so it gets an any-state interrupt: sm dot switchFromAny, to defense, when driver dot defenseMode. One line covers every state in the machine at the time you call it — so declare it after your last addState.",
      camera: CODE,
      events: [
        {
          type: "code-state",
          artifact: "sm-code",
          state: 4,
          at: { word: "interrupt" },
        },
      ],
      holdAfter: 1.0,
    },
    {
      id: "lifecycle",
      text: "Here's exactly what happens when defenseMode fires mid-cycle. Transitions are checked in declaration order, and the first rising edge wins. The old state's onExit callbacks run, its command is canceled, and defense takes over in the same scheduler tick, without an extra yield. onEnter fires with the new command already running.",
      camera: DIAGRAM,
      events: [
        { type: "diagram", artifact: "states", step: 7, at: { word: "fires" } },
      ],
      holdAfter: 0.6,
    },
    {
      id: "factories",
      text: "So what do the states actually run? Factory methods on the Arm mechanism. goTo sets the position, then waits until the arm reports atTarget within a tolerance, so the command genuinely finishes. low, high, and backward are one-line wrappers — one per useful position, each named for telemetry.",
      camera: CODE2,
      events: [
        {
          type: "code-state",
          artifact: "arm-code",
          state: 1,
          at: { progress: 0.05 },
        },
      ],
      holdAfter: 1.2,
    },
    {
      id: "cta",
      text: "That's state-based control: named positions, declared edges, one command alive at a time — a single source of truth you can read straight out of telemetry. The full lesson adds entry and exit hooks, exiting the machine entirely, and branching mid-command in plain Java, all at frc5712.com.",
      camera: END,
      holdAfter: 1.2,
    },
  ],
};
