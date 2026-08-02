import type { Rect, TrailerScript } from "../lib/types";

// The workshop overview: who it's for, and the learning path from one real
// mechanism through commands and closed-loop control to swerve and vision.
// Camera: title card → title push-in → path diagram (revealed node by node) → end card.

const TITLE: Rect = { x: 0, y: 0, width: 1920, height: 1080 };
const DIAGRAM: Rect = { x: 2560, y: 140, width: 2200, height: 1100 };
const END: Rect = { x: 5480, y: 60, width: 1920, height: 1080 };

export const IntroductionTrailer: TrailerScript = {
  id: "IntroductionTrailer",
  voice: "af_heart",
  world: [
    {
      kind: "title",
      id: "title",
      rect: TITLE,
      title: "The FRC Programming Workshop",
      subtitle: "WPILib 2027 · Commands v3 · CTRE hardware",
      accent: "blue",
    },
    {
      kind: "diagram",
      id: "path",
      rect: DIAGRAM,
      title: "The learning path",
      nodes: [
        {
          id: "mechanism",
          label: "Mechanism",
          sublabel: "arm or flywheel — real hardware",
          x: 80,
          y: 160,
          width: 460,
          height: 220,
          accent: "mint",
          step: 1,
        },
        {
          id: "commands",
          label: "Commands",
          sublabel: "Commands v3 + OpModes",
          x: 880,
          y: 160,
          width: 460,
          height: 220,
          accent: "blue",
          step: 2,
        },
        {
          id: "control",
          label: "Closed-Loop Control",
          sublabel: "PID · Motion Magic · logging",
          x: 1680,
          y: 160,
          width: 460,
          height: 220,
          accent: "purple",
          step: 3,
        },
        {
          id: "advanced",
          label: "Swerve + Vision",
          sublabel: "Workshop Two — autonomous",
          x: 880,
          y: 720,
          width: 460,
          height: 220,
          accent: "amber",
          step: 4,
        },
      ],
      edges: [
        { from: "mechanism", to: "commands" },
        { from: "commands", to: "control" },
        { from: "control", to: "advanced" },
      ],
    },
    {
      kind: "end",
      id: "end",
      rect: END,
      title: "Start with Workshop One",
      subtitle: "From bare hardware to closed-loop control",
      url: "frc5712.com",
    },
  ],
  beats: [
    {
      id: "hook",
      text: "Most robot code is a pile of if statements written the night before competition, and it holds up right until the one match where it doesn't. This workshop swaps that for a plan.",
      camera: TITLE,
      holdAfter: 0.5,
    },
    {
      id: "audience",
      text: "It's for FRC teams writing Java on CTRE motors and sensors. None of it is a toy example. You'll wire up a real motor, deploy real code to it, and pick up habits top teams have used for years.",
      camera: { x: 120, y: 120, width: 1680, height: 945 },
    },
    {
      id: "mechanism",
      text: "Everything starts with one real mechanism you build yourself. Pick an arm, or pick a flywheel, bolt the motors on, and every lesson after this one runs on the thing sitting on your own bench.",
      camera: { x: 2580, y: 180, width: 1400, height: 800 },
      events: [
        {
          type: "diagram",
          artifact: "path",
          step: 1,
          at: { word: "mechanism" },
        },
      ],
    },
    {
      id: "commands",
      text: "Then comes command-based programming. You split the code into mechanisms, commands, and triggers, and the payoff lands at eleven at night when something breaks and you already know which file to open.",
      camera: { x: 3120, y: 180, width: 1500, height: 820 },
      events: [
        {
          type: "diagram",
          artifact: "path",
          step: 2,
          at: { word: "programming" },
        },
      ],
    },
    {
      id: "control",
      text: "Next, closed-loop control. The robot reads its own sensors and corrects itself, which is the difference between a mechanism that lands on the number you asked for and one that lands somewhere near it. PID first. Motion Magic and logging follow.",
      camera: { x: 3560, y: 160, width: 1440, height: 820 },
      events: [
        { type: "diagram", artifact: "path", step: 3, at: { word: "control" } },
      ],
    },
    {
      id: "advanced",
      text: "Workshop Two keeps the same robot and adds swerve drive, then vision, then autonomous routines. Nothing earlier gets thrown out. The mechanism you built in the first lesson is still the one you're tuning at the end.",
      camera: DIAGRAM,
      events: [
        { type: "diagram", artifact: "path", step: 4, at: { word: "swerve" } },
      ],
      holdAfter: 0.8,
    },
    {
      id: "cta",
      text: "So pick your mechanism and start at lesson one. Everything after that is the same robot, one lesson smarter than it was.",
      camera: END,
      holdAfter: 1.2,
    },
  ],
};
