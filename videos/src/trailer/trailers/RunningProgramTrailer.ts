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
      text: "Your code builds with no errors. Your mechanism works on paper. But the robot does not exist yet. Good news: WPILib twenty twenty-seven can run your whole program tonight. Right on your laptop. You can even watch it move.",
      camera: TITLE,
      holdAfter: 0.5,
    },
    {
      id: "launch",
      text: "One Gradle command does it: simulateJava. Gradle is the build tool. It runs your robot code right on your laptop. A simulator window opens with a driver station — the panel that starts the robot. Nothing is wired up.",
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
      text: "That driver station lists every OpMode by name. An OpMode is one mode your robot can run. Teleop means a driver controls it. Autonomous means the robot drives itself. The list comes straight from your code. Write a new mode, and it shows up.",
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
      text: "Pick one, and that OpMode is constructed — built fresh, right then. That's when its buttons get connected to actions. Then, every loop, the scheduler ticks. The scheduler is the part that runs your commands. Your mechanism starts moving on screen.",
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
      text: "Here are both ways to launch the sim. simulateJava opens the window. You click Enable yourself. simulateJavaAgent runs headless — no window at all. It enables the robot for you. You can even pick the exact starting mode by name.",
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
      text: "Want real motion? CTRE hardware sim can spin real motors from your laptop. The code reaches them through a CANivore — a USB hub for robot parts. One catch: turn off the CANivore USB setting in the TunerX app first. Otherwise the two programs fight.",
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
      text: "So before a single part is bolted on, you can test everything. Drive your mechanism. Try every button. Break nothing. See the full running program guide at frc5712.com.",
      camera: END,
      holdAfter: 1.2,
    },
  ],
};
