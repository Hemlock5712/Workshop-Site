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
      text: "Match ends. Something went wrong in the last thirty seconds, three people have three theories, and the only witness is the robot. It can testify. In WPILib 2027 the recorder already ships in the box.",
      camera: TITLE,
      holdAfter: 0.5,
    },
    {
      id: "publish",
      text: "Your robot code already publishes numbers to NetworkTables. Poses, setpoints, target angles. Every value you've ever pushed to a dashboard rode this wire, which means you're already halfway to a log and didn't know it.",
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
      text: "DataLogManager sits under all of that and writes every change to disk, plus your console prints, into one wpilog per run. No vendordep. No framework. Nothing in your mechanisms changes.",
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
      text: "The setup goes in the Robot constructor, at the very top. Start DataLogManager, then hand DriverStation the same log so joystick data and match state land in it too. Everything after that records itself.",
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
      text: "Drag the file into AdvantageScope and the match plays back, joystick by joystick. Or hook it up live while you tune. Drop a pose onto the field view and you can watch the drift you were arguing about.",
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
      text: "Other tools exist. Epilogue generates the logging code at compile time from annotations. Hoot grabs Phoenix signals off the CAN bus by itself. Both are good. Neither is two lines, and two lines is what gets turned on the week before a competition.",
      camera: DIAGRAM,
      holdAfter: 0.6,
    },
    {
      id: "cta",
      text: "The comparison page goes deeper on when the heavier tools actually earn their setup cost. But do the cheap thing tonight, and your next practice match becomes evidence instead of an argument.",
      camera: END,
      holdAfter: 1.2,
    },
  ],
};
