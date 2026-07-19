import type { Rect, TrailerScript } from "../lib/types";

// State-based control with the Commands v3 StateMachine — the optional,
// advanced alternative to hold-per-button teleop. States own the mechanism's
// ordinary "(hold)" commands; holds never finish, so every transition is a
// declared .when(...) edge, and switchFromAny interrupts from anywhere.
// Camera: title → state graph diagram → StateMachine code → Arm holds → end.

const TITLE: Rect = { x: 0, y: 0, width: 1920, height: 1080 };
const DIAGRAM: Rect = { x: 2560, y: 160, width: 2200, height: 1150 };
const CODE: Rect = { x: 5480, y: 200, width: 1680, height: 1000 };
const CODE2: Rect = { x: 7640, y: 300, width: 1700, height: 780 };
const END: Rect = { x: 9860, y: 60, width: 1920, height: 1080 };

const SM_STATES_ONLY = `public Command autoArmCycle() {
  StateMachine sm = new StateMachine("Auto Arm Cycle");

  State stowed  = sm.addState(arm.stowed());
  State pickup  = sm.addState(arm.pickup());   // ready to grab
  State scoring = sm.addState(arm.scoring());
  State defense = sm.addState(arm.backward());
  sm.setInitialState(stowed);

  return sm;
}`;

const SM_FULL = `public Command autoArmCycle() {
  StateMachine sm = new StateMachine("Auto Arm Cycle");

  State stowed  = sm.addState(arm.stowed());
  State pickup  = sm.addState(arm.pickup());   // ready to grab
  State scoring = sm.addState(arm.scoring());
  State defense = sm.addState(arm.backward());
  sm.setInitialState(stowed);

  // Holds never finish, so every transition is a .when(...).
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
          step: 5,
        },
      ],
      edges: [
        { from: "stowed", to: "pickup", label: "operator.a()", step: 4 },
        { from: "pickup", to: "scoring", label: "hasGamePiece", step: 4 },
        { from: "scoring", to: "stowed", label: ".when(empty)", step: 4 },
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
      states: ["", ARM_HOLDS],
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
      text: "Your arm has moods. Stowed. Pickup. Scoring. Everyday teleop handles them with one hold per button, and that works great. A state machine is the optional next step. It gives every mood a name, and Commands v3 ships a real StateMachine class to run them.",
      camera: TITLE,
      holdAfter: 0.5,
    },
    {
      id: "states",
      text: "A state is just a command that runs while you are in it. Stowed runs the arm's stowed hold. Pickup runs the pickup hold, ready to grab. Scoring holds the arm up high. The robot is always in exactly one named state. Never two. Never none.",
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
      text: "Transitions are the edges. Press A, and stowed switches to pickup. The gripper sees a game piece, so pickup hands off to scoring. When the gripper is empty again, you fall back to stowed. Buttons and sensors move the machine for you.",
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
      text: "Some transitions ignore the graph. switchFromAny sends you to defense from anywhere. Any state, one line. And here is the quiet superpower: illegal jumps do not exist, because no transition was ever declared for them.",
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
      text: "Four steps in code. Construct the machine with a name. Add states, each wrapping a hold. Set the initial state; the compiler enforces it. Then wire the transitions. Every state runs a hold, and a hold never finishes. So every transition here is a when.",
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
      text: "And the states themselves? The arm's ordinary hold commands, the same ones your buttons use. runRepeatedly re-sends the setpoint every tick, forever. Nothing ever waits on these holds. The transitions watch buttons and sensors instead. No phase fields. Just commands.",
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
      text: "There is more. When versus whenComplete. Entry and exit hooks. Exiting the machine entirely. The full state machine lesson is waiting at frc5712.com.",
      camera: END,
      holdAfter: 1.2,
    },
  ],
};
