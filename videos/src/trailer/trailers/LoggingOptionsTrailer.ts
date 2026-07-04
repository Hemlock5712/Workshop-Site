import type { Rect, TrailerScript } from "../lib/types";

// Logging options: DataLogManager is the workshop choice — built into WPILib,
// two lines, no replay layer. Alternatives (Epilogue, AdvantageKit, Hoot) get
// a mention. Camera: title → pipeline diagram → Robot.java → end.

const TITLE: Rect = { x: 0, y: 0, width: 1920, height: 1080 };
const DIAGRAM: Rect = { x: 2560, y: 140, width: 2200, height: 1150 };
const CODE: Rect = { x: 5480, y: 300, width: 1520, height: 720 };
const END: Rect = { x: 7840, y: 80, width: 1920, height: 1080 };

const ROBOT_EMPTY = `public class Robot extends OpModeRobot {
  public Robot() {
  }
}`;

const ROBOT_LOGGING = `public class Robot extends OpModeRobot {
  public Robot() {
    // Two lines, no vendordep. Start logging before anything else.
    DataLogManager.start();
    DriverStation.startDataLog(DataLogManager.getLog());
  }
}`;

export const LoggingOptionsTrailer: TrailerScript = {
  id: "LoggingOptionsTrailer",
  voice: "af_heart",
  world: [
    {
      kind: "title",
      id: "title",
      rect: TITLE,
      title: "Logging Options",
      subtitle: "Your robot can record every match — turn it on",
      accent: "amber",
    },
    {
      kind: "diagram",
      id: "pipeline",
      rect: DIAGRAM,
      title: "From robot code to replay",
      nodes: [
        {
          id: "robot",
          label: "Robot Code",
          sublabel: "publishes values",
          x: 80,
          y: 440,
          width: 460,
          height: 220,
          accent: "blue",
          step: 1,
        },
        {
          id: "nt",
          label: "NetworkTables",
          sublabel: "positions, setpoints, targets",
          x: 880,
          y: 150,
          width: 460,
          height: 220,
          accent: "amber",
          step: 2,
        },
        {
          id: "dlm",
          label: "DataLogManager",
          sublabel: "built into WPILib",
          x: 880,
          y: 730,
          width: 460,
          height: 220,
          accent: "purple",
          step: 3,
        },
        {
          id: "wpilog",
          label: ".wpilog",
          sublabel: "binary log file",
          x: 1680,
          y: 730,
          width: 460,
          height: 220,
          accent: "teal",
          step: 4,
        },
        {
          id: "ascope",
          label: "AdvantageScope",
          sublabel: "replay or live tuning",
          x: 1680,
          y: 150,
          width: 460,
          height: 220,
          accent: "mint",
          step: 5,
        },
      ],
      edges: [
        { from: "robot", to: "nt", label: "publishes" },
        { from: "nt", to: "dlm", label: "every change", step: 3 },
        { from: "dlm", to: "wpilog", label: "writes", step: 4 },
        { from: "wpilog", to: "ascope", label: "open", step: 5 },
        { from: "nt", to: "ascope", label: "live", step: 5 },
      ],
    },
    {
      kind: "code",
      id: "robot-code",
      rect: CODE,
      fileName: "Robot.java",
      language: "java",
      states: ["", ROBOT_EMPTY, ROBOT_LOGGING],
    },
    {
      kind: "end",
      id: "end",
      rect: END,
      title: "Two lines. Every match recorded.",
      subtitle: "DataLogManager, wpilog files, and AdvantageScope",
      url: "frc5712.com/logging-options",
    },
  ],
  beats: [
    {
      id: "hook",
      text: "The match ends, the robot did something weird, and nobody knows why. Logging turns arguments into data. And in WPILib 2027 the recorder is already built in — you just have to turn it on.",
      camera: TITLE,
      holdAfter: 0.5,
    },
    {
      id: "publish",
      text: "Here's the pipeline. Your robot code publishes everything interesting to NetworkTables — positions, setpoints, velocities. That part you're doing anyway; every dashboard value you've ever sent is already on the wire.",
      camera: { x: 2580, y: 200, width: 1500, height: 800 },
      events: [
        {
          type: "diagram",
          artifact: "pipeline",
          step: 1,
          at: { word: "robot" },
        },
        {
          type: "diagram",
          artifact: "pipeline",
          step: 2,
          at: { word: "NetworkTables" },
        },
      ],
    },
    {
      id: "capture",
      text: "DataLogManager sits underneath and records it all. Every NetworkTables change, plus console output, streams into a binary wpilog file. It's built into WPILib — no vendordep, no framework, no replay layer to adopt.",
      camera: { x: 3280, y: 420, width: 1560, height: 860 },
      events: [
        {
          type: "diagram",
          artifact: "pipeline",
          step: 3,
          at: { word: "DataLogManager" },
        },
        {
          type: "diagram",
          artifact: "pipeline",
          step: 4,
          at: { word: "wpilog" },
        },
      ],
    },
    {
      id: "code",
      text: "The whole setup is two lines in your Robot constructor. Start DataLogManager, then tell DriverStation to log its data too. Do it before anything else, and every run of your robot records itself.",
      camera: CODE,
      events: [
        {
          type: "code-state",
          artifact: "robot-code",
          state: 1,
          at: { progress: 0.03 },
        },
        {
          type: "code-state",
          artifact: "robot-code",
          state: 2,
          at: { word: "Start" },
        },
      ],
      holdAfter: 1.4,
    },
    {
      id: "scope",
      text: "After the match, drag the wpilog into AdvantageScope. Or connect live over NetworkTables while you tune. Struct types like Pose2d drop straight onto the 3D field view — you watch your robot replay its own match.",
      camera: { x: 3560, y: 180, width: 1560, height: 860 },
      events: [
        {
          type: "diagram",
          artifact: "pipeline",
          step: 5,
          at: { word: "AdvantageScope" },
        },
      ],
    },
    {
      id: "alternatives",
      text: "There are alternatives — Epilogue generates logging from annotations at compile time, AdvantageKit records everything for deterministic replay, Hoot captures Phoenix device signals automatically. This workshop picks DataLogManager: two lines, zero ceremony, and it ships with WPILib.",
      camera: DIAGRAM,
      holdAfter: 0.6,
    },
    {
      id: "cta",
      text: "Stop guessing what the robot did. The full comparison of logging options — and when the heavier tools earn their keep — is waiting at frc5712.com. Turn the recorder on before your next practice match.",
      camera: END,
      holdAfter: 1.2,
    },
  ],
};
