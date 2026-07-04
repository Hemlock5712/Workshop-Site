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
          label: "2027-dev branch",
          sublabel: "main is still the 2026 stack",
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
      text: "Every season starts the same way: a blank project, a blinking cursor, and a robot that does nothing. Skip all of it. This workshop starts from a template that is already a working robot program.",
      camera: TITLE,
      holdAfter: 0.5,
    },
    {
      id: "stack",
      text: "The twenty twenty-seven stack looks like this. Commands version three with OpModes is the framework. Java twenty-five is the language. GradleRIO does the building. And everything deploys to SystemCore — the new robot controller.",
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
      text: "Getting the code is one clone away — the team's twenty twenty-seven template, Phoenix six vendordeps already in place. One catch: check your branch. The default, twenty twenty-seven dev, is the new stack; main is still last season.",
      camera: { x: 5500, y: 140, width: 1560, height: 600 },
      events: [
        { type: "diagram", artifact: "flow", step: 1, at: { word: "clone" } },
        { type: "diagram", artifact: "flow", step: 2, at: { word: "branch" } },
      ],
    },
    {
      id: "team-number",
      text: "Then make it yours. Your team number lives in one file — wpilib preferences dot json. Set it once, and every build and every deploy knows exactly which robot it belongs to.",
      camera: { x: 6100, y: 620, width: 1000, height: 580 },
      events: [
        { type: "diagram", artifact: "flow", step: 3, at: { word: "number" } },
      ],
    },
    {
      id: "deploy",
      text: "Now plug in and deploy. Gradle compiles Java twenty-five, ships it over the network, and SystemCore boots your program — mechanisms, OpModes, and scheduler running before you've written a single line yourself.",
      camera: { x: 6900, y: 620, width: 1000, height: 580 },
      events: [
        { type: "diagram", artifact: "flow", step: 4, at: { word: "deploy" } },
      ],
      holdAfter: 0.8,
    },
    {
      id: "payoff",
      text: "That's the whole pitch of a template: no scheduler to wire, no boilerplate marathon, no blank Robot dot java staring back. Setup becomes a fifteen-minute checklist, and the real work — your mechanisms — starts today.",
      camera: FLOW,
      holdAfter: 0.6,
    },
    {
      id: "cta",
      text: "The full walkthrough covers every click: WPILib VS Code, project options, desktop support so you can test without a robot in front of you. Start your project at frc5712.com.",
      camera: END,
      holdAfter: 1.2,
    },
  ],
};
