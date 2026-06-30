import type { VideoScript } from "../lib/types";

export const IntroductionScript: VideoScript = {
  id: "Introduction",
  voice: "af_heart",
  segments: [
    {
      id: "title",
      text: "Welcome to the Gray Matter Coding Workshop. A hands-on FRC programming course built by Team 5712, Hemlocks Gray Matter, to help your team write code that wins matches.",
      slide: {
        kind: "title",
        title: "Gray Matter Coding Workshop",
        subtitle: "FRC programming, built by Team 5712",
        accent: "purple",
      },
    },
    {
      id: "audience",
      text: "This workshop is designed for FRC teams using Java and CTRE hardware. Whether you're new to command-based programming or leveling up to swerve, every concept is paired with code you can run on a real robot.",
      slide: {
        kind: "bullets",
        title: "Who this is for",
        accent: "amber",
        bullets: [
          "FRC teams using Java",
          "Teams running CTRE hardware",
          "From first command to full swerve",
        ],
      },
    },
    {
      id: "what-youll-learn",
      text: "You'll learn code architecture, subsystems, the command-based framework, PID tuning, motion profiling, path planning, vision, and logging. Two workshops take you from your first subsystem all the way to a competition-ready swerve drive.",
      slide: {
        kind: "bullets",
        title: "What you'll learn",
        accent: "mint",
        bullets: [
          "Subsystems and command-based programming",
          "PID, Motion Magic, and PathPlanner",
          "Swerve drive, vision, and logging",
        ],
      },
    },
    {
      id: "cta",
      text: "Start with Workshop One on the hardware and project setup pages, then move into Workshop Two for swerve and vision. Everything lives at frc5712.com — we'll see you on the first lesson.",
      slide: {
        kind: "title",
        title: "Let's get started",
        subtitle: "frc5712.com",
        accent: "teal",
      },
    },
  ],
};
