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
      text: "Every season starts the same way. A blank project. A blinking cursor. A robot that does nothing. Skip all of it. This workshop starts from a template — a robot program that already works.",
      camera: TITLE,
      holdAfter: 0.5,
    },
    {
      id: "stack",
      text: "Here's the twenty twenty-seven stack. Commands version three with OpModes is the framework. It organizes your robot code. Java twenty-five is the language. GradleRIO is the build tool. It packs your code up for the robot. And it all runs on SystemCore — the new robot controller.",
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
      text: "Getting the code takes one step: clone the twenty twenty-seven template. Cloning means copying the project from GitHub. One catch: pick the right branch. A branch is one version of the code. Use twenty twenty-seven dev. The main branch is still last season.",
      camera: { x: 5500, y: 140, width: 1560, height: 600 },
      events: [
        { type: "diagram", artifact: "flow", step: 1, at: { word: "clone" } },
        { type: "diagram", artifact: "flow", step: 2, at: { word: "branch" } },
      ],
    },
    {
      id: "team-number",
      text: "Then make it yours. Your team number lives in one file, called wpilib preferences dot json. Set it once. From then on, every build knows exactly which robot the code belongs to.",
      camera: { x: 6100, y: 620, width: 1000, height: 580 },
      events: [
        { type: "diagram", artifact: "flow", step: 3, at: { word: "number" } },
      ],
    },
    {
      id: "deploy",
      text: "Now plug in and deploy. Deploy just means sending your code to the robot. Gradle builds the program and ships it over the network. SystemCore boots it up and runs it. And you haven't written a single line yet.",
      camera: { x: 6900, y: 620, width: 1000, height: 580 },
      events: [
        { type: "diagram", artifact: "flow", step: 4, at: { word: "deploy" } },
      ],
      holdAfter: 0.8,
    },
    {
      id: "payoff",
      text: "That's the whole point of a template. No empty files. No setup code to write by hand. No blank screen staring back at you. Setup becomes a fifteen-minute checklist. Then the real work starts today: building your mechanisms.",
      camera: FLOW,
      holdAfter: 0.6,
    },
    {
      id: "cta",
      text: "The full walkthrough covers every click. You'll open the project in WPILib VS Code — the editor for robot code. You'll even test on your laptop, with no robot at all. Start your project at frc5712.com.",
      camera: END,
      holdAfter: 1.2,
    },
  ],
};
