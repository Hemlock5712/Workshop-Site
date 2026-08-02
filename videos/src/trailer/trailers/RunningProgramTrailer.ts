import type { Rect, TrailerScript } from "../lib/types";

// Run robot code without a robot: the sim GUI lists OpModes by name, the
// scheduler ticks every loop, and CTRE hardware sim drives real motors over
// a CANivore. Camera: title → sim pipeline diagram → gradle commands → end.

const TITLE: Rect = { x: 0, y: 0, width: 1920, height: 1080 };
const DIAGRAM: Rect = { x: 2560, y: 120, width: 2800, height: 1150 };
const CODE: Rect = { x: 5640, y: 260, width: 1760, height: 820 };
const END: Rect = { x: 7900, y: 40, width: 1920, height: 1080 };

const CODE_GUI = `# GUI simulation — opens the sim driver station; a human clicks Enable.
./gradlew simulateJava`;

const CODE_FULL = `# GUI simulation — opens the sim driver station; a human clicks Enable.
./gradlew simulateJava

# Headless (CI / agent) — auto-enables the robot. Pick the starting mode:
./gradlew simulateJavaAgent                          # autonomous (default)
./gradlew simulateJavaAgent -Pmode=teleop            # teleop
./gradlew simulateJavaAgent -Pmode=auto:"Drive To Pose"   # a specific @Autonomous`;

export const RunningProgramTrailer: TrailerScript = {
  id: "RunningProgramTrailer",
  voice: "af_heart",
  world: [
    {
      kind: "title",
      id: "title",
      rect: TITLE,
      title: "Run It Before You Build It",
      subtitle: "WPILib simulation + CTRE hardware sim — no robot required",
      accent: "teal",
    },
    {
      kind: "diagram",
      id: "sim-flow",
      rect: DIAGRAM,
      title: "From one command to moving motors",
      nodes: [
        {
          id: "gradle",
          label: "simulateJava",
          sublabel: "one Gradle command",
          x: 80,
          y: 460,
          width: 460,
          height: 220,
          accent: "amber",
          step: 1,
        },
        {
          id: "ds",
          label: "Sim Driver Station",
          sublabel: "every OpMode, listed by name",
          x: 760,
          y: 460,
          width: 460,
          height: 220,
          accent: "purple",
          step: 2,
        },
        {
          id: "opmode",
          label: "OpMode",
          sublabel: "constructed when selected",
          x: 1440,
          y: 150,
          width: 460,
          height: 220,
          accent: "blue",
          step: 3,
        },
        {
          id: "scheduler",
          label: "Scheduler",
          sublabel: "ticked every loop",
          x: 1440,
          y: 770,
          width: 460,
          height: 220,
          accent: "mint",
          step: 4,
        },
        {
          id: "motors",
          label: "Real Motors",
          sublabel: "CTRE hardware sim, over CANivore",
          x: 2200,
          y: 460,
          width: 460,
          height: 220,
          accent: "teal",
          step: 5,
        },
      ],
      edges: [
        { from: "gradle", to: "ds", label: "opens" },
        { from: "ds", to: "opmode", label: "select" },
        { from: "opmode", to: "scheduler", label: "robotPeriodic" },
        { from: "scheduler", to: "motors", label: "CAN bus", step: 5 },
      ],
    },
    {
      kind: "code",
      id: "gradle-code",
      rect: CODE,
      fileName: "terminal",
      language: "bash",
      states: ["", CODE_GUI, CODE_FULL],
    },
    {
      kind: "end",
      id: "end",
      rect: END,
      title: "No robot? No problem.",
      subtitle: "OpModes, the sim GUI, and hardware simulation over CANivore",
      url: "frc5712.com/running-program",
    },
  ],
  beats: [
    {
      id: "hook",
      text: "It's the second week of build season, the mechanism is still three welds from done, and you have code you can't test. Except you can. WPILib will run the entire program on your laptop tonight, scheduler and all, and you can watch the arm move.",
      camera: TITLE,
      holdAfter: 0.5,
    },
    {
      id: "launch",
      text: "One Gradle command, and a sim driver station opens on your laptop with nothing wired to it. No robot. No radio. No battery to charge. Just the same code you'd deploy, running in a window.",
      camera: { x: 2580, y: 340, width: 1500, height: 820 },
      events: [
        {
          type: "diagram",
          artifact: "sim-flow",
          step: 1,
          at: { word: "Gradle" },
        },
      ],
    },
    {
      id: "opmodes",
      text: "Every OpMode in that window came straight out of your source, one entry per class you tagged @Teleop or @Autonomous. No registration list to keep in sync. Add one, rebuild, and it shows up.",
      camera: { x: 3040, y: 320, width: 1560, height: 860 },
      events: [
        {
          type: "diagram",
          artifact: "sim-flow",
          step: 2,
          at: { word: "OpMode" },
        },
      ],
    },
    {
      id: "select",
      text: "Selecting a mode is when the OpMode gets constructed, and that timing matters more than it sounds: bindings in that constructor don't exist until you pick the mode. Then the scheduler ticks. Whatever your default command is takes over.",
      camera: { x: 3600, y: 160, width: 1800, height: 1060 },
      events: [
        {
          type: "diagram",
          artifact: "sim-flow",
          step: 3,
          at: { word: "constructed" },
        },
        {
          type: "diagram",
          artifact: "sim-flow",
          step: 4,
          at: { word: "scheduler" },
        },
      ],
    },
    {
      id: "code",
      text: "simulateJava opens the window and waits for a human to click Enable. simulateJavaAgent skips all of that: headless, auto-enabled, and you can name the exact mode to start in, which is how the whole thing runs unattended on a build server.",
      camera: CODE,
      events: [
        {
          type: "code-state",
          artifact: "gradle-code",
          state: 1,
          at: { progress: 0.03 },
        },
        {
          type: "code-state",
          artifact: "gradle-code",
          state: 2,
          at: { word: "simulateJavaAgent" },
        },
      ],
      holdAfter: 1.4,
    },
    {
      id: "hardware-sim",
      text: "CTRE hardware sim goes further and drives actual motors on your bench, over a CANivore, from that same laptop. One catch. Turn off the CANivore USB setting in Tuner X first, or the two programs fight over the port all night.",
      camera: { x: 3820, y: 400, width: 1560, height: 860 },
      events: [
        {
          type: "diagram",
          artifact: "sim-flow",
          step: 5,
          at: { word: "motors" },
        },
      ],
      holdAfter: 0.8,
    },
    {
      id: "cta",
      text: "Every button, every command, tested before a single bolt goes in the arm. The night before your first match is a bad time to find out a trigger was bound backwards.",
      camera: END,
      holdAfter: 1.2,
    },
  ],
};
