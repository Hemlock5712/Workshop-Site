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
      text: "The match ends. The robot did something weird. Nobody knows why. Everyone argues. Logging turns those arguments into data. And in WPILib 2027, the recorder is already built in. You just have to turn it on.",
      camera: TITLE,
      holdAfter: 0.5,
    },
    {
      id: "publish",
      text: "Here's the pipeline. Your robot code publishes its numbers to NetworkTables — a shared table every tool can read. Positions, targets, speeds. You're doing that part already. Every dashboard value you've ever sent is on that wire.",
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
      text: "DataLogManager sits underneath and records it all. Every NetworkTables change, plus console prints, streams into one wpilog file — the robot's flight recorder. It's built into WPILib. No extra library. No framework to adopt.",
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
      text: "The whole setup is two lines in your Robot constructor. Start DataLogManager. Then tell DriverStation to log its data too. Put those lines before anything else. Now every run of your robot records itself.",
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
      text: "After the match, drag the wpilog file into AdvantageScope — the free viewer app. Or connect live while you tune. Whole poses drop straight onto the 3D field view. You watch your robot replay its own match.",
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
      text: "Other tools exist. Epilogue writes logging code for you at compile time. AdvantageKit records every input, so teams can replay a match in code. Hoot captures Phoenix device signals on its own. Some teams love these. This workshop picks DataLogManager: two lines, and it ships with WPILib.",
      camera: DIAGRAM,
      holdAfter: 0.6,
    },
    {
      id: "cta",
      text: "Stop guessing what the robot did. The full comparison of logging options is waiting at frc5712.com. It also covers when the heavier tools earn their keep. Turn the recorder on before your next practice match.",
      camera: END,
      holdAfter: 1.2,
    },
  ],
};
