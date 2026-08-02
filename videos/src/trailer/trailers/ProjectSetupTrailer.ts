import type { Rect, TrailerScript } from "../lib/types";

// From the 2027-Template to a deployable project. The camera travels:
// title card → the 2027 stack → the clone-to-deploy flow → end card.

const TITLE: Rect = { x: 0, y: 0, width: 1920, height: 1080 };
const STACK: Rect = { x: 2560, y: 180, width: 2200, height: 1100 };
const FLOW: Rect = { x: 5480, y: 100, width: 2200, height: 1100 };
const END: Rect = { x: 7960, y: 60, width: 1920, height: 1080 };

export const ProjectSetupTrailer: TrailerScript = {
  id: "ProjectSetupTrailer",
  voice: "af_heart",
  world: [
    {
      kind: "title",
      id: "title",
      rect: TITLE,
      title: "Project Setup",
      subtitle: "From template to deployable — in one sitting",
      accent: "blue",
    },
    {
      kind: "diagram",
      id: "stack",
      rect: STACK,
      title: "The 2027 stack",
      nodes: [
        {
          id: "framework",
          label: "Commands v3 + OpModes",
          sublabel: "the framework",
          x: 120,
          y: 140,
          width: 900,
          height: 220,
          accent: "amber",
          step: 1,
        },
        {
          id: "java",
          label: "Java 25",
          sublabel: "the language",
          x: 1180,
          y: 140,
          width: 900,
          height: 220,
          accent: "blue",
          step: 2,
        },
        {
          id: "gradle",
          label: "GradleRIO",
          sublabel: "2027.0.0-alpha-6 — the build",
          x: 120,
          y: 700,
          width: 900,
          height: 220,
          accent: "mint",
          step: 3,
        },
        {
          id: "systemcore",
          label: "SystemCore",
          sublabel: "the new robot controller",
          x: 1180,
          y: 700,
          width: 900,
          height: 220,
          accent: "purple",
          step: 4,
        },
      ],
      edges: [{ from: "gradle", to: "systemcore", label: "deploys" }],
    },
    {
      kind: "diagram",
      id: "flow",
      rect: FLOW,
      title: "Template to deployable",
      nodes: [
        {
          id: "clone",
          label: "Clone 2027-Template",
          sublabel: "Hemlock5712 on GitHub",
          x: 80,
          y: 140,
          width: 460,
          height: 220,
          accent: "mint",
          step: 1,
        },
        {
          id: "branch",
          label: "Open in VS Code",
          sublabel: "the WPILib 2027 alpha install",
          x: 880,
          y: 140,
          width: 460,
          height: 220,
          accent: "amber",
          step: 2,
        },
        {
          id: "team",
          label: "Team number",
          sublabel: ".wpilib/wpilib_preferences.json",
          x: 880,
          y: 720,
          width: 460,
          height: 220,
          accent: "blue",
          step: 3,
        },
        {
          id: "deploy",
          label: "Deploy",
          sublabel: "code running on SystemCore",
          x: 1680,
          y: 720,
          width: 460,
          height: 220,
          accent: "purple",
          step: 4,
        },
      ],
      edges: [
        { from: "clone", to: "branch" },
        { from: "branch", to: "team" },
        { from: "team", to: "deploy" },
      ],
    },
    {
      kind: "end",
      id: "end",
      rect: END,
      title: "Start from a working robot",
      subtitle: "The 2027-Template, WPILib VS Code, and your first deploy",
      url: "frc5712.com/project-setup",
    },
  ],
  beats: [
    {
      id: "hook",
      text: "A blank project, a blinking cursor, and two weeks of build season gone before the robot moves an inch. Skip it. Clone the template instead and the program you start with already deploys.",
      camera: TITLE,
      holdAfter: 0.5,
    },
    {
      id: "stack",
      text: "Commands and OpModes give your code its shape. Java is the language, and it's the one piece of this you already know. GradleRIO packages everything and shoves it down the wire. SystemCore catches it and starts running your program. Four names. Four things to blame.",
      camera: STACK,
      events: [
        {
          type: "diagram",
          artifact: "stack",
          step: 1,
          at: { word: "Commands" },
        },
        { type: "diagram", artifact: "stack", step: 2, at: { word: "Java" } },
        {
          type: "diagram",
          artifact: "stack",
          step: 3,
          at: { word: "GradleRIO" },
        },
        {
          type: "diagram",
          artifact: "stack",
          step: 4,
          at: { word: "SystemCore" },
        },
      ],
    },
    {
      id: "clone",
      text: "There is no scaffolding step. You clone the template from GitHub, then open that folder in WPILib VS Code, and what's already on your disk is a real robot program with mechanisms, an OpMode, and a build that works.",
      camera: { x: 5500, y: 140, width: 1560, height: 600 },
      events: [
        { type: "diagram", artifact: "flow", step: 1, at: { word: "clone" } },
        { type: "diagram", artifact: "flow", step: 2, at: { word: "open" } },
      ],
    },
    {
      id: "team-number",
      text: "Then make it yours. Your team number goes in one file, and getting it wrong is the classic first-day mistake: the deploy runs, finds nothing, and times out while everybody stares at the laptop.",
      camera: { x: 6100, y: 620, width: 1000, height: 580 },
      events: [
        { type: "diagram", artifact: "flow", step: 3, at: { word: "number" } },
      ],
    },
    {
      id: "deploy",
      text: "Now plug in and deploy. Gradle builds, ships the result over the network, and SystemCore restarts your program in a few seconds. First deploy of the season, and you still haven't written a line of your own.",
      camera: { x: 6900, y: 620, width: 1000, height: 580 },
      events: [
        { type: "diagram", artifact: "flow", step: 4, at: { word: "deploy" } },
      ],
      holdAfter: 0.8,
    },
    {
      id: "payoff",
      text: "Setup is done. The meeting goes to the arm instead. Every hour lost to a broken build is an hour the mechanism sits on the cart untested, and that's the hour that costs you a match.",
      camera: FLOW,
      holdAfter: 0.6,
    },
    {
      id: "cta",
      text: "Do this once, properly, and you won't think about it again all season. The walkthrough has the exact clicks, including how to run the whole thing on your laptop with no robot yet.",
      camera: END,
      holdAfter: 1.2,
    },
  ],
};
