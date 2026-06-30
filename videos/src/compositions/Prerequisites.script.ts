import type { VideoScript } from "../lib/types";

export const PrerequisitesScript: VideoScript = {
  id: "Prerequisites",
  voice: "af_heart",
  segments: [
    {
      id: "title",
      text: "Before you write a single line of robot code, you need to get your laptop ready. The Gray Matter workshop relies on a specific software stack, and skipping any of these tools will block you later. Let's run through what to install.",
      slide: {
        kind: "title",
        title: "Prerequisites",
        subtitle: "Set up your laptop before the workshop",
        accent: "purple",
      },
    },
    {
      id: "core-software",
      text: "Start with the core WPILib stack. Install WPILib VS Code, which bundles the compiler and templates, and the National Instruments Game Tools, which gives you the Driver Station and roboRIO imaging utility. Then add Phoenix Tuner X to configure your TalonFX motors and other CTRE hardware.",
      slide: {
        kind: "bullets",
        title: "Core robot software",
        accent: "blue",
        bullets: [
          "WPILib VS Code — compiler, templates, examples",
          "NI Game Tools — Driver Station and roboRIO imaging",
          "Phoenix Tuner X — configure TalonFX and CTRE devices",
        ],
      },
    },
    {
      id: "tuning-tools",
      text: "Next, grab the tools that help you debug and drive the robot. AdvantageScope visualizes logs and live telemetry, PathPlanner lets you draw autonomous paths for swerve drive, and Elastic Dashboard is what your drivers see during matches when picking autos or watching motor status.",
      slide: {
        kind: "bullets",
        title: "Debugging and driving",
        accent: "mint",
        bullets: [
          "AdvantageScope — log viewer and data visualization",
          "PathPlanner — draw swerve autonomous paths",
          "Elastic Dashboard — driver station interface",
        ],
      },
    },
    {
      id: "version-control",
      text: "Finally, install Git for version control so your team can collaborate and roll back mistakes. Some basic Java knowledge is also recommended — Codecademy has a free Java course that's plenty to get you started. Don't worry if you're new; we'll explain the patterns as we go.",
      slide: {
        kind: "bullets",
        title: "Workflow essentials",
        accent: "amber",
        bullets: [
          "Git — version control with clear commit messages",
          "Java basics — optional but recommended",
          "Codecademy Learn Java — a solid starting point",
        ],
      },
    },
    {
      id: "outro",
      text: "Get every tool installed before the next module so the hardware setup section goes smoothly. Once your environment is ready, we'll move on to wiring up the roboRIO and CTRE hardware.",
      slide: {
        kind: "title",
        title: "Ready to start",
        subtitle: "Full install guide at frc5712.com/prerequisites",
        accent: "teal",
      },
    },
  ],
};
