import type { Rect, TrailerScript } from "../lib/types";

// The toolchain video: template project → WPILib 2027 alpha → SystemCore,
// with AdvantageScope and Elastic alongside — shown as a diagram the camera
// walks left to right, revealing one tool per beat.

const TITLE: Rect = { x: 0, y: 0, width: 1920, height: 1080 };
const DIAGRAM: Rect = { x: 2560, y: 180, width: 2200, height: 1100 };
const END: Rect = { x: 5480, y: 80, width: 1920, height: 1080 };

export const PrerequisitesTrailer: TrailerScript = {
  id: "PrerequisitesTrailer",
  voice: "af_heart",
  world: [
    {
      kind: "title",
      id: "title",
      rect: TITLE,
      title: "Prerequisites",
      subtitle: "The 2027 toolchain — set up right the first time",
      accent: "teal",
    },
    {
      kind: "diagram",
      id: "toolchain",
      rect: DIAGRAM,
      title: "Your 2027 toolchain",
      nodes: [
        {
          id: "template",
          label: "2027-Template",
          sublabel: "Team 5712's starting project",
          x: 80,
          y: 440,
          width: 460,
          height: 220,
          accent: "blue",
          step: 1,
        },
        {
          id: "wpilib",
          label: "WPILib 2027 Alpha",
          sublabel: "Java 25 · Commands v3 + OpModes",
          x: 880,
          y: 440,
          width: 460,
          height: 220,
          accent: "purple",
          step: 2,
        },
        {
          id: "systemcore",
          label: "SystemCore",
          sublabel: "the robot controller",
          x: 1680,
          y: 440,
          width: 460,
          height: 220,
          accent: "mint",
          step: 3,
        },
        {
          id: "ascope",
          label: "AdvantageScope",
          sublabel: "full version — from releases",
          x: 1680,
          y: 80,
          width: 460,
          height: 220,
          accent: "amber",
          step: 4,
        },
        {
          id: "elastic",
          label: "Elastic Dashboard",
          sublabel: "your driver station display",
          x: 1680,
          y: 800,
          width: 460,
          height: 220,
          accent: "teal",
          step: 5,
        },
      ],
      edges: [
        { from: "template", to: "wpilib", label: "opens in" },
        { from: "wpilib", to: "systemcore", label: "deploys to" },
        { from: "systemcore", to: "ascope", label: "streams data", step: 4 },
        { from: "systemcore", to: "elastic", label: "drives", step: 5 },
      ],
    },
    {
      kind: "end",
      id: "end",
      rect: END,
      title: "Set up once, build all season",
      subtitle: "Template · WPILib 2027 · AdvantageScope · Elastic",
      url: "frc5712.com/prerequisites",
    },
  ],
  beats: [
    {
      id: "hook",
      text: "Half of every rookie season disappears into setup problems. Wrong project, wrong tools, wrong versions. This workshop runs on the WPILib twenty twenty-seven alpha — an early-release version of FRC's programming toolkit. Getting your tools right takes one page.",
      camera: TITLE,
      holdAfter: 0.5,
    },
    {
      id: "template",
      text: "Don't start from a stock project — a bare, empty one. Start from Team 5712's twenty twenty-seven template instead. It's a ready-made robot program you copy. Commands version three and OpModes are already wired in. It works on day one.",
      camera: { x: 2580, y: 480, width: 1400, height: 800 },
      events: [
        {
          type: "diagram",
          artifact: "toolchain",
          step: 1,
          at: { word: "stock" },
        },
      ],
    },
    {
      id: "wpilib",
      text: "That template opens in the WPILib twenty twenty-seven alpha. The language underneath is Java twenty-five. This is the same code you'll run all season. You won't learn an old setup now and unlearn it later.",
      camera: { x: 3140, y: 460, width: 1500, height: 840 },
      events: [
        {
          type: "diagram",
          artifact: "toolchain",
          step: 2,
          at: { word: "WPILib" },
        },
      ],
    },
    {
      id: "systemcore",
      text: "Your code deploys to SystemCore. Deploy just means sending your code to the robot. SystemCore is the robot's new onboard computer. Build, deploy, run. You'll use those three steps in every single lesson.",
      camera: { x: 3500, y: 440, width: 1400, height: 820 },
      events: [
        {
          type: "diagram",
          artifact: "toolchain",
          step: 3,
          at: { word: "SystemCore" },
        },
      ],
    },
    {
      id: "tools",
      text: "Two more tools round it out. AdvantageScope draws graphs of your robot's data. Download the full version from its releases page, not the lite one inside WPILib. Elastic Dashboard is the screen your drive team watches.",
      camera: { x: 3560, y: 200, width: 1560, height: 1060 },
      events: [
        {
          type: "diagram",
          artifact: "toolchain",
          step: 4,
          at: { word: "AdvantageScope" },
        },
        {
          type: "diagram",
          artifact: "toolchain",
          step: 5,
          at: { word: "Elastic" },
        },
      ],
    },
    {
      id: "no-pathplanner",
      text: "One thing you won't install: PathPlanner. It's a common tool, but we don't use it. For autonomous driving, this workshop uses CTRE's built-in LinearPath and DriveToPose. Those come with the hardware you already have.",
      camera: DIAGRAM,
      holdAfter: 0.8,
    },
    {
      id: "cta",
      text: "A little setup now saves you a whole season of fighting your tools. The complete checklist — downloads, versions, and the template — is waiting at frc5712.com.",
      camera: END,
      holdAfter: 1.2,
    },
  ],
};
