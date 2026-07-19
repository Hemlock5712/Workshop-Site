import type { Rect, TrailerScript } from "../lib/types";

// The framework video: triggers (WHEN), mechanisms (WHAT), commands (HOW),
// and the scheduler that ties them together — shown as a living diagram,
// then as real Commands v3 code: a hold factory, and a chained routine.

const TITLE: Rect = { x: 0, y: 0, width: 1920, height: 1080 };
const DIAGRAM: Rect = { x: 2560, y: 160, width: 2200, height: 1100 };
const CODE: Rect = { x: 5480, y: 180, width: 1620, height: 1000 };
const CODE2: Rect = { x: 7560, y: 260, width: 1500, height: 780 };
const END: Rect = { x: 9800, y: 60, width: 1920, height: 1080 };

const MECHANISM_CODE = `public class Arm extends Mechanism {
  private final TalonFX motor = new TalonFX(31);
  private final PositionVoltage positionVoltage = new PositionVoltage(0);

  // A hold: re-sends the closed-loop request every tick, forever.
  // It never finishes on its own — that's what makes it a hold.
  public Command scoring() {
    return runRepeatedly(() -> setPosition(SCORING_POSITION))
        .named("scoring (hold)");
  }

  // A plain question. Routines use it as a finish line.
  public boolean isAtTarget() {
    return Math.abs(getPosition() - getTargetPosition()) < TOLERANCE;
  }

  private void setPosition(double position) { ... } // private on purpose
}`;

const COMPOSE_CODE = `routine =
    Command.sequence(
            new DriveToPose(drivetrain, pose1),
            // The hold gets a finish line at the call site.
            robot.stow()
                .until(robot.arm::isAtTarget)
                .named("stow until stowed"),
            // Leg two runs WHILE the stow hold keeps the pose.
            Command.race(new DriveToPose(drivetrain, pose2), robot.stow())
                .named("drive holding stow"))
        .named("Drive Stow Drive");`;

export const CommandFrameworkTrailer: TrailerScript = {
  id: "CommandFrameworkTrailer",
  voice: "af_heart",
  world: [
    {
      kind: "title",
      id: "title",
      rect: TITLE,
      title: "Command-Based, v3",
      subtitle: "Triggers, mechanisms, commands — and the loop that runs them",
      accent: "purple",
    },
    {
      kind: "diagram",
      id: "flow",
      rect: DIAGRAM,
      title: "One tick of the scheduler",
      nodes: [
        {
          id: "trigger",
          label: "Trigger",
          sublabel: "driver.a() — the WHEN",
          x: 80,
          y: 440,
          width: 460,
          height: 220,
          accent: "amber",
          step: 1,
        },
        {
          id: "scheduler",
          label: "Scheduler",
          sublabel: "the loop that decides",
          x: 880,
          y: 440,
          width: 460,
          height: 220,
          accent: "purple",
          step: 2,
        },
        {
          id: "command",
          label: "Command",
          sublabel: "arm.scoring() — the HOW",
          x: 1680,
          y: 150,
          width: 460,
          height: 220,
          accent: "blue",
          step: 3,
        },
        {
          id: "mechanism",
          label: "Mechanism",
          sublabel: "the Arm — the WHAT",
          x: 1680,
          y: 730,
          width: 460,
          height: 220,
          accent: "mint",
          step: 4,
        },
      ],
      edges: [
        { from: "trigger", to: "scheduler", label: "fires" },
        { from: "scheduler", to: "command", label: "schedules" },
        { from: "command", to: "mechanism", label: "requires" },
      ],
    },
    {
      kind: "code",
      id: "mechanism-code",
      rect: CODE,
      fileName: "Arm.java",
      language: "java",
      states: ["", MECHANISM_CODE],
    },
    {
      kind: "code",
      id: "compose-code",
      rect: CODE2,
      fileName: "AutoOpMode.java",
      language: "java",
      states: ["", COMPOSE_CODE],
    },
    {
      kind: "end",
      id: "end",
      rect: END,
      title: "Mechanisms, then commands, then triggers",
      subtitle: "The order every workshop step builds on",
      url: "frc5712.com/command-framework",
    },
  ],
  beats: [
    {
      id: "hook",
      text: "Robot code has one hard problem. Everything wants to happen at once. Commands version three untangles it with three small ideas and one loop. Every step of this workshop builds on that framework.",
      camera: TITLE,
      holdAfter: 0.5,
    },
    {
      id: "trigger",
      text: "First idea: the trigger. A trigger is a yes-or-no signal, like a button. When it turns true, something should start. The trigger is the WHEN.",
      camera: { x: 2580, y: 400, width: 1500, height: 820 },
      events: [
        { type: "diagram", artifact: "flow", step: 1, at: { word: "trigger" } },
      ],
    },
    {
      id: "scheduler",
      text: "Watching every trigger is the scheduler. The scheduler is the loop at the heart of the robot. Each tick of the loop, it decides what starts, what keeps running, and what stops.",
      camera: { x: 3100, y: 380, width: 1600, height: 860 },
      events: [
        {
          type: "diagram",
          artifact: "flow",
          step: 2,
          at: { word: "scheduler" },
        },
      ],
    },
    {
      id: "command-mechanism",
      text: "When a trigger fires, the scheduler starts a command. A command is one action the robot can do — the HOW. Every command names the mechanism it needs — the WHAT, one physical part like the arm. The scheduler tracks who owns what. So two commands can never fight over one motor.",
      camera: DIAGRAM,
      events: [
        { type: "diagram", artifact: "flow", step: 3, at: { word: "command" } },
        {
          type: "diagram",
          artifact: "flow",
          step: 4,
          at: { word: "mechanism" },
        },
      ],
    },
    {
      id: "code",
      text: "Here is a real mechanism. Look at the command called scoring. It is built with runRepeatedly. That re-sends the arm's target every tick, forever. A command like this never finishes on its own. We call it a hold. That is why its name ends in hold.",
      camera: CODE,
      events: [
        {
          type: "code-state",
          artifact: "mechanism-code",
          state: 1,
          at: { progress: 0.03 },
        },
      ],
      holdAfter: 1.0,
    },
    {
      id: "compose",
      text: "Routines are chains of commands. Command dot sequence runs steps one after another. But here is the one rule. A hold never finishes, so nothing may wait on a hold. Dot until gives a hold a finish line. And a race means: do this step while holding.",
      camera: CODE2,
      events: [
        {
          type: "code-state",
          artifact: "compose-code",
          state: 1,
          at: { progress: 0.05 },
        },
      ],
      holdAfter: 1.4,
    },
    {
      id: "cta",
      text: "Mechanisms first, then commands, then triggers. That is the order the whole workshop builds in. See the full framework lesson at frc5712.com.",
      camera: END,
      holdAfter: 1.2,
    },
  ],
};
