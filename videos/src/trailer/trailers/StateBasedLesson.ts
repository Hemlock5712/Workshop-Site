import type { Rect, TrailerScript } from "../lib/types";

// Full-length state machine lesson (~4 min) — the optional, advanced dialect.
// Framing: everyday teleop is hold-per-button (whileTrue); a state machine is
// the alternative where the robot is always in exactly one named state.
// Covers boolean/if spaghetti, hold-backed states with .when(...) edges,
// when vs whenComplete, building the machine in typed diffs, the
// adding-a-state checklist, and the exact interrupt semantics (declaration
// order, rising edge, onExit → cancel → takeover in the same tick).
// Java mirrors the hold-backed pattern on src/app/(workshop)/state-based/page.tsx.

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

// States own the mechanism's ordinary "(hold)" commands; holds never finish,
// so every transition is a .when(...) — mirroring the state-based page.
const SM_STATES = `public Command autoArmCycle() {
  StateMachine sm = new StateMachine("Auto Arm Cycle");

  State stowed  = sm.addState(arm.stowed());
  State pickup  = sm.addState(arm.pickup());   // ready to grab
  State scoring = sm.addState(arm.scoring());
  sm.setInitialState(stowed);

  return sm;
}`;

const SM_TRANSITIONS = `public Command autoArmCycle() {
  StateMachine sm = new StateMachine("Auto Arm Cycle");

  State stowed  = sm.addState(arm.stowed());
  State pickup  = sm.addState(arm.pickup());   // ready to grab
  State scoring = sm.addState(arm.scoring());
  sm.setInitialState(stowed);

  // Every state runs a hold, so every transition is a .when(...).
  stowed.switchTo(pickup).when(operator.a());
  pickup.switchTo(scoring).when(gripper::hasGamePiece);
  scoring.switchTo(stowed).when(() -> !gripper.hasGamePiece());

  return sm;
}`;

const SM_NEW_STATE = `public Command autoArmCycle() {
  StateMachine sm = new StateMachine("Auto Arm Cycle");

  State stowed  = sm.addState(arm.stowed());
  State pickup  = sm.addState(arm.pickup());   // ready to grab
  State scoring = sm.addState(arm.scoring());
  State defense = sm.addState(arm.backward());
  sm.setInitialState(stowed);

  // Every state runs a hold, so every transition is a .when(...).
  stowed.switchTo(pickup).when(operator.a());
  pickup.switchTo(scoring).when(gripper::hasGamePiece);
  scoring.switchTo(stowed).when(() -> !gripper.hasGamePiece());

  return sm;
}`;

const SM_FULL = `public Command autoArmCycle() {
  StateMachine sm = new StateMachine("Auto Arm Cycle");

  State stowed  = sm.addState(arm.stowed());
  State pickup  = sm.addState(arm.pickup());   // ready to grab
  State scoring = sm.addState(arm.scoring());
  State defense = sm.addState(arm.backward());
  sm.setInitialState(stowed);

  // Every state runs a hold, so every transition is a .when(...).
  stowed.switchTo(pickup).when(operator.a());
  pickup.switchTo(scoring).when(gripper::hasGamePiece);
  scoring.switchTo(stowed).when(() -> !gripper.hasGamePiece());
  sm.switchFromAny().to(defense).when(driver.b());

  return sm;
}`;

const ARM_HOLDS = `// The states run the arm's ordinary hold commands — the same
// factories the button bindings use. A hold re-sends its
// setpoint every tick and never finishes on its own.
public Command stowed() {
  return runRepeatedly(() -> setPosition(STOWED_POSITION))
      .named("stowed (hold)");
}

public Command pickup() {
  return runRepeatedly(() -> setPosition(PICKUP_POSITION))
      .named("pickup (hold)");
}
// ...scoring() and backward(): same recipe, one hold per preset.`;

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
          sublabel: "arm.stowed()",
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
          sublabel: "arm.pickup() — ready to grab",
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
          sublabel: "arm.scoring()",
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
        { from: "stowed", to: "pickup", label: "operator.a()", step: 4 },
        { from: "pickup", to: "scoring", label: "hasGamePiece", step: 5 },
        { from: "scoring", to: "stowed", label: ".when(empty)", step: 6 },
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
      states: ["", ARM_HOLDS],
    },
    {
      kind: "end",
      id: "end",
      rect: END,
      title: "One state alive. Every arrow declared.",
      subtitle:
        "Entry and exit hooks, exit transitions, and completion edges — in the full lesson",
      url: "frc5712.com/state-based",
    },
  ],
  beats: [
    {
      id: "hook",
      text: "Quick heads up: this lesson is optional, and advanced. Everyday teleop needs none of it. Each button holds a preset with whileTrue, and that covers the whole workshop. But some robots outgrow buttons. Their code becomes a pile of booleans and forty if statements. Soon nobody can say what the arm is doing right now.",
      camera: TITLE,
      holdAfter: 0.5,
    },
    {
      id: "why-not-ifs",
      text: "The failures are always the same. Two triggers fire at once and fight over the motor. A flag gets set on the way up, and never cleared on the way down. Nothing can answer the simple question: what is the arm doing right now? There is no single source of truth. Just guesses spread across a dozen booleans.",
      camera: TITLE_PUSH,
    },
    {
      id: "state-idea",
      text: "A state machine replaces the guessing with names. The robot is always in exactly one named state. A state is just a command that runs while you are in it. The machine keeps one alive at a time, never two. Start with three states. The first is Stowed. It runs the arm's stowed hold, tucked in and safe.",
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
      text: "Pickup runs the pickup hold, down low and ready to grab. Scoring runs the scoring hold, up high. These are the mechanism's ordinary hold commands. The very same ones the button bindings use. Ask the machine what the arm is doing. It answers with exactly one name, never a shrug.",
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
      text: "Now the edges. An edge is a transition, a declared move from one state to another. The first edge is a button: stowed dot switchTo pickup, when operator dot A. Press A, and the machine cancels stowed's hold and starts pickup's. No flag to set. No flag to forget.",
      camera: EDGE_OPERATOR,
      events: [
        { type: "diagram", artifact: "states", step: 4, at: { word: "edges" } },
      ],
    },
    {
      id: "edge-sensor",
      text: "The second edge has no button at all: pickup dot switchTo scoring, when gripper hasGamePiece. Grab a game piece, and the sensor moves the machine for you. A when condition is checked every tick while the state runs. It fires when the answer flips from false to true. To fire again, it must go false first.",
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
      text: "The third edge closes the loop: scoring dot switchTo stowed, when the gripper is empty. Score the piece, and the arm heads home. Why a when, and not whenComplete? Because scoring runs a hold, and a hold never finishes. A whenComplete on a hold-backed state would never fire.",
      camera: EDGE_COMPLETE,
      events: [
        { type: "diagram", artifact: "states", step: 6, at: { word: "third" } },
      ],
    },
    {
      id: "two-kinds",
      text: "So there are two kinds of transitions. Hold-backed states leave on when. The condition is watched while the hold runs. whenComplete waits for the state's command to finish by itself. Save it for self-finishing commands, like a one-shot fire command. Always match the transition to the command underneath.",
      camera: DIAGRAM,
      holdAfter: 0.6,
    },
    {
      id: "code-construct",
      text: "Time to build it. Construct the StateMachine with a name. The name is required, and it shows up in telemetry. addState wraps each hold and hands back a State. Then setInitialState. That one is checked at compile time. Leave it out, and you get a build error, not a runtime surprise.",
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
      text: "Now wire the transitions. Three short lines, one per arrow in the diagram. Button edge, sensor edge, gripper-empty edge. Every state runs a hold, so every transition is a when. And notice what does not exist: illegal jumps. Stowed can never teleport to scoring, because no transition was declared for it.",
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
      text: "Mid-season, the game demands a fourth position: defense, with the arm swung backward. Here is the whole checklist. Add one addState line wrapping the backward hold. Then declare its transitions in, and out again if it ever hands control back. Nothing else changes. The other states never even know.",
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
      text: "Defense cannot wait for a tidy path through the graph. It needs to fire from anywhere. So it gets an any-state interrupt: sm dot switchFromAny, to defense, when driver dot B. One line covers every state in the machine at the time you call it. So declare it after your last addState.",
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
      text: "Here is exactly what happens when that button fires mid-cycle. Transitions are checked in the order you declared them. The first one to trip wins. The old state's onExit hooks run. Its hold is cancelled. Defense takes over in the same scheduler tick. Then onEnter fires, with the new command already running.",
      camera: DIAGRAM,
      events: [
        { type: "diagram", artifact: "states", step: 7, at: { word: "fires" } },
      ],
      holdAfter: 0.6,
    },
    {
      id: "factories",
      text: "So what do the states actually run? The arm's ordinary hold commands. The same factories your button bindings use. runRepeatedly re-sends the setpoint every tick, forever. A hold never finishes, and here that is fine. Nothing ever waits on these holds. The transitions watch buttons and sensors instead.",
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
      text: "That is state-based control. Named states. Declared edges. One command alive at a time. A single source of truth you can read straight out of telemetry. And remember, it is optional. Hold-per-button covers most robots just fine. When you outgrow it, the full lesson is waiting at frc5712.com.",
      camera: END,
      holdAfter: 1.2,
    },
  ],
};
