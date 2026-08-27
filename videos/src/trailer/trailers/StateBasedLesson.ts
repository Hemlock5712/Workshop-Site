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
      text: "Heads up: this lesson is optional and advanced. Everyday teleop needs none of it. One button, one hold, whileTrue. That covers the rest of the workshop. But some robots outgrow buttons. You add a flag, then a second flag to guard the first, and by week three nobody can say what the arm is doing.",
      camera: TITLE,
      holdAfter: 0.5,
    },
    {
      id: "why-not-ifs",
      text: "The failures rhyme. Two triggers fire in the same tick and fight over one motor. A flag gets set on the way up and never cleared on the way down, so the arm spends the match convinced it is holding a piece it dropped ages ago. Nobody can point at the line that decides.",
      camera: TITLE_PUSH,
    },
    {
      id: "state-idea",
      text: "A state machine trades guessing for names. Exactly one state is alive, and while it is alive, its command runs. Kill that command, start the next, and the arm has changed state. Three to start. Stowed is where the arm sits when nobody is asking for anything: tucked inside frame perimeter, safe.",
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
      text: "Pickup swings down to meet the game piece. Scoring lifts to whatever height this year's field wants. Neither is a new command. They're the same hold factories your button bindings already call, which is why a state machine adds no motor code. Ask what the arm is doing and you get one name.",
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
      text: "Now the edges. An edge is a declared move from one state to exactly one other, and if you never declared it, the machine cannot make it. Start with a button. Press A and stowed's hold is cancelled, pickup's starts, all inside one scheduler tick. No flag to set. No flag to forget.",
      camera: EDGE_OPERATOR,
      events: [
        { type: "diagram", artifact: "states", step: 4, at: { word: "edges" } },
      ],
    },
    {
      id: "edge-sensor",
      text: "The second edge has no button behind it. The gripper's sensor goes true and the machine walks itself from pickup to scoring. A when condition gets sampled every tick the state runs, and it fires on the rising edge only. It has to go false before it can fire again.",
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
      text: "The third edge closes the loop. The piece leaves the gripper, the sensor drops back to false, and the arm heads home by itself. Notice it's still a when, not whenComplete. Scoring runs a hold, and a hold has no end, so whenComplete just sits there forever.",
      camera: EDGE_COMPLETE,
      events: [
        { type: "diagram", artifact: "states", step: 6, at: { word: "third" } },
      ],
    },
    {
      id: "two-kinds",
      text: "So, two kinds. A hold-backed state leaves on when, because something outside it has to say go. whenComplete is for a state whose command genuinely ends by itself: one shot of the flywheel, one wrist flip. Pick the wrong one and the state never leaves at all.",
      camera: DIAGRAM,
      holdAfter: 0.6,
    },
    {
      id: "code-construct",
      text: "Building it is mostly bookkeeping. The constructor demands a name, and you thank it later when that name is what labels your state in the log. addState hands you back a State object, and that object is how you write edges. Then set the initial state, or the build fails.",
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
      text: "Now wire them. One line per arrow, and every one of them is a when. The better question is what you cannot write here. Stowed has no line to scoring, so the arm can never skip pickup and go score a piece it never picked up. Whole categories of bug stop being possible.",
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
      text: "Mid-season, your driver wants a defense position with the arm swung backward. The whole job: one addState line for the new hold, then its edges in, and its edges out if it ever hands control back. That's it. The three states you already tuned never find out.",
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
      text: "Defense can't wait for a tidy path through the graph. It needs an any-state interrupt, and switchFromAny gives you one in a line. One catch, and it has bitten people: that line only covers the states that exist at the moment you call it. Declare it after your last addState.",
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
      text: "Say that button fires mid-cycle, halfway into a pickup. Transitions get checked in declaration order and the first one to trip wins, which is why the order you write them matters. Then, inside one scheduler tick: onExit runs, the old hold is cancelled, defense takes over, and onEnter runs with the new command already going.",
      camera: DIAGRAM,
      events: [
        { type: "diagram", artifact: "states", step: 7, at: { word: "fires" } },
      ],
      holdAfter: 0.6,
    },
    {
      id: "factories",
      text: "Look at what a state actually is. It's the same factories you'd bind to buttons in a plain teleop OpMode, unchanged, not one line different. That's the part that should make you relax: a state machine costs you no motor code, no new gains, and nothing you already tuned.",
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
      text: "So that's the trade. You write more structure up front, and in exchange your arm can only ever be in a place you named. Most robots never need it, and there's no shame in a wall of whileTrue bindings that works. But when your teleop code starts scaring you, this is the ladder out.",
      camera: END,
      holdAfter: 1.2,
    },
  ],
};
