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
      text: "Most robot code is a pile of if statements written the night before competition. This workshop teaches your team a better way — the full WPILib twenty twenty-seven stack, Commands version three, and the new OpMode framework.",
      camera: TITLE,
      holdAfter: 0.5,
    },
    {
      id: "audience",
      text: "It's built for FRC teams writing Java on CTRE hardware. No toy examples — you wire up real devices, run real code, and learn the habits the top teams use every single week.",
      camera: { x: 120, y: 120, width: 1680, height: 945 },
    },
    {
      id: "mechanism",
      text: "Everything starts with one real mechanism. You pick an arm or a flywheel, bolt on the motors, and every lesson after that runs on the thing you built.",
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
      text: "Then you learn command-based programming — mechanisms, commands, and triggers in Commands version three. Your code stops being a tangle and starts reading like a plan the whole team can follow.",
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
      text: "Next comes closed-loop control. PID, Motion Magic, and logging that shows you what the robot actually did — so tuning becomes measurement, not guesswork. That's Workshop One, from bare hardware to full control.",
      camera: { x: 3560, y: 160, width: 1440, height: 820 },
      events: [
        { type: "diagram", artifact: "path", step: 3, at: { word: "control" } },
      ],
    },
    {
      id: "advanced",
      text: "Workshop Two takes the same robot further — swerve drive, vision, and autonomous routines that string it all together. Each step builds on the last, so nothing you learn gets thrown away.",
      camera: DIAGRAM,
      events: [
        { type: "diagram", artifact: "path", step: 4, at: { word: "swerve" } },
      ],
      holdAfter: 0.8,
    },
    {
      id: "cta",
      text: "Grab your team, pick a mechanism, and start with Workshop One. Every lesson, every line of code, and the full learning path are waiting at frc5712.com.",
      camera: END,
      holdAfter: 1.2,
    },
  ],
};
