import type { Rect, TrailerScript } from "../lib/types";

// State-based control with the Commands v3 StateMachine: states are commands,
// transitions are declared edges, and switchFromAny interrupts from anywhere.
// Camera: title → state graph diagram → StateMachine code → Arm factories → end.

const TITLE: Rect = { x: 0, y: 0, width: 1920, height: 1080 };
const DIAGRAM: Rect = { x: 2560, y: 160, width: 2200, height: 1150 };
const CODE: Rect = { x: 5480, y: 200, width: 1680, height: 1000 };
const CODE2: Rect = { x: 7640, y: 300, width: 1700, height: 780 };
const END: Rect = { x: 9860, y: 60, width: 1920, height: 1080 };

const SM_STATES_ONLY = `public Command autoArmCycle() {
  StateMachine sm = new StateMachine("Auto Arm Cycle");

  State stowed  = sm.addState(arm.low());
  State pickup  = sm.addState(arm.low());        // ready to grab
  State scoring = sm.addState(arm.high());
  State defense = sm.addState(arm.backward());
  sm.setInitialState(stowed);

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

export const StateBasedTrailer: TrailerScript = {
  id: "StateBasedTrailer",
  voice: "af_heart",
  world: [
    {
      kind: "title",
      id: "title",
      rect: TITLE,
      title: "State-Based Control",
      subtitle:
        "Your mechanism knows its states — and how to move between them",
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
          step: 5,
        },
      ],
      edges: [
        { from: "stowed", to: "pickup", label: "operator.intake", step: 4 },
        { from: "pickup", to: "scoring", label: "hasGamePiece", step: 4 },
        { from: "scoring", to: "stowed", label: "whenCompleteAnd", step: 4 },
        { from: "stowed", to: "defense", step: 5 },
        { from: "scoring", to: "defense", label: "switchFromAny", step: 5 },
      ],
    },
    {
      kind: "code",
      id: "sm-code",
      rect: CODE,
      fileName: "Routines.java",
      language: "java",
      states: ["", SM_STATES_ONLY, SM_FULL],
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
      title: "Give your mechanism states",
      subtitle:
        "Transitions, entry and exit hooks, and any-state interrupts in Commands v3",
      url: "frc5712.com/state-based",
    },
  ],
  beats: [
    {
      id: "hook",
      text: "Your arm has moods. Stowed. Pickup. Scoring. Most code smears them across a pile of booleans. State-based control names each one — and in WPILib 2027, Commands v3 ships a real StateMachine class to run them.",
      camera: TITLE,
      holdAfter: 0.5,
    },
    {
      id: "states",
      text: "A state is just a command that runs while you're in it. Stowed runs arm dot low. Pickup holds the same target, ready to grab. Scoring runs arm dot high. The machine keeps exactly one alive at a time.",
      camera: DIAGRAM,
      events: [
        {
          type: "diagram",
          artifact: "states",
          step: 1,
          at: { word: "Stowed" },
        },
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
      id: "transitions",
      text: "Transitions are the edges. Press intake, and stowed switches to pickup. The gripper sees a game piece — pickup hands off to scoring. And when scoring's command completes with the piece gone, you fall back to stowed.",
      camera: { x: 2600, y: 220, width: 2120, height: 1060 },
      events: [
        {
          type: "diagram",
          artifact: "states",
          step: 4,
          at: { word: "Transitions" },
        },
      ],
    },
    {
      id: "interrupt",
      text: "And some transitions ignore the graph. switchFromAny sends you to defense from anywhere — any state, one interrupt, no copy-pasted checks. Every arrow in this machine is declared, not buried in an if statement.",
      camera: { x: 2900, y: 420, width: 1700, height: 880 },
      events: [
        {
          type: "diagram",
          artifact: "states",
          step: 5,
          at: { word: "defense" },
        },
      ],
      holdAfter: 0.8,
    },
    {
      id: "code",
      text: "Four steps in code. Construct the machine with a name. Add states — each one owns a command. Set the initial state; the compiler enforces it. Then wire transitions, and the any-state interrupt, in plain declarative lines.",
      camera: CODE,
      events: [
        {
          type: "code-state",
          artifact: "sm-code",
          state: 1,
          at: { progress: 0.03 },
        },
        {
          type: "code-state",
          artifact: "sm-code",
          state: 2,
          at: { word: "wire" },
        },
      ],
      holdAfter: 1.4,
    },
    {
      id: "factories",
      text: "And the states themselves? Factory methods on the Arm mechanism. goTo drives to a target angle and finishes once it arrives. Low, high, backward — one-line wrappers, one per useful position. No phase fields. Just commands.",
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
      text: "There's more — completion versus conditional transitions, entry and exit hooks, and branching mid-command with plain Java. The full state machine lesson is waiting at frc5712.com.",
      camera: END,
      holdAfter: 1.2,
    },
  ],
};
