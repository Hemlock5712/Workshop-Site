import type { Rect, TrailerScript } from "../lib/types";

// Vision options: why odometry drifts, the Limelight vs PhotonVision choice,
// and the AprilTag → camera → pose → drivetrain pipeline as a living diagram.

const TITLE: Rect = { x: 0, y: 0, width: 1920, height: 1080 };
const IMAGE: Rect = { x: 2560, y: 180, width: 1500, height: 1000 };
const DIAGRAM: Rect = { x: 5480, y: 140, width: 2200, height: 1100 };
const END: Rect = { x: 8420, y: 40, width: 1920, height: 1080 };

// Sub-regions of the diagram the camera pushes into.
const DIAGRAM_LEFT: Rect = { x: 5460, y: 420, width: 1400, height: 800 };
const DIAGRAM_RIGHT: Rect = { x: 6560, y: 420, width: 1400, height: 800 };

export const VisionOptionsTrailer: TrailerScript = {
  id: "VisionOptionsTrailer",
  voice: "af_heart",
  world: [
    {
      kind: "title",
      id: "title",
      rect: TITLE,
      title: "Vision Options",
      subtitle: "Cameras, AprilTags, and a pose you can trust",
      accent: "teal",
    },
    {
      kind: "image",
      id: "limelight",
      rect: IMAGE,
      src: "images/mechanisms/limelight.png",
      title: "Limelight",
      caption:
        "Plug-and-play vision — processing, LEDs, and NetworkTables in one box",
    },
    {
      kind: "diagram",
      id: "pipeline",
      rect: DIAGRAM,
      title: "From tag to pose",
      nodes: [
        {
          id: "tag",
          label: "AprilTag",
          sublabel: "known field location",
          x: 40,
          y: 440,
          width: 460,
          height: 220,
          accent: "amber",
          step: 1,
        },
        {
          id: "camera",
          label: "Camera",
          sublabel: "Limelight or PhotonVision",
          x: 590,
          y: 440,
          width: 460,
          height: 220,
          accent: "blue",
          step: 2,
        },
        {
          id: "pose",
          label: "Pose Estimate",
          sublabel: "field coordinates + timestamp",
          x: 1140,
          y: 440,
          width: 460,
          height: 220,
          accent: "purple",
          step: 3,
        },
        {
          id: "drivetrain",
          label: "Drivetrain",
          sublabel: "odometry, corrected",
          x: 1690,
          y: 440,
          width: 460,
          height: 220,
          accent: "mint",
          step: 4,
        },
      ],
      edges: [
        { from: "tag", to: "camera", label: "seen by" },
        { from: "camera", to: "pose", label: "solves" },
        { from: "pose", to: "drivetrain", label: "fuses into" },
      ],
    },
    {
      kind: "end",
      id: "end",
      rect: END,
      title: "Pick your camera",
      subtitle:
        "Limelight vs PhotonVision, AprilTags, and how much to trust them",
      url: "frc5712.com/vision-options",
    },
  ],
  beats: [
    {
      id: "hook",
      text: "Your robot thinks it knows where it is. Then the wheels slip. Odometry — the robot's guess from wheel spins — quietly drifts from reality. Vision fixes that. Cameras spot AprilTags — printed markers on the field — and hand you your true position.",
      camera: TITLE,
      holdAfter: 0.5,
    },
    {
      id: "limelight",
      text: "This is the Limelight, a plug-and-play robot camera. The processing, the lights, and the networking all live in one box. Wire up power and Ethernet, and it starts tracking. Budget roughly four hundred to five hundred dollars.",
      camera: IMAGE,
    },
    {
      id: "photonvision",
      text: "Prefer free? PhotonVision is free software. It runs on a small add-on computer, like a Raspberry Pi. All in, that's roughly one hundred to one hundred fifty dollars. Both options read AprilTags and find your pose — your position plus heading. You're choosing convenience versus cost.",
      camera: { x: 2380, y: 80, width: 1860, height: 1240 },
    },
    {
      id: "tag-to-camera",
      text: "Here's the pipeline. An AprilTag sits at a known spot on the field. Your camera sees it and measures its corners. From that, it works out exactly where the robot must be standing.",
      camera: DIAGRAM_LEFT,
      events: [
        {
          type: "diagram",
          artifact: "pipeline",
          step: 1,
          at: { word: "AprilTag" },
        },
        {
          type: "diagram",
          artifact: "pipeline",
          step: 2,
          at: { word: "camera" },
        },
      ],
    },
    {
      id: "pose-to-drivetrain",
      text: "That answer becomes a pose estimate: your field position, plus the exact time it was taken. Feed it to the drivetrain. Every frame with a tag in view snaps your odometry back to reality.",
      camera: DIAGRAM_RIGHT,
      events: [
        {
          type: "diagram",
          artifact: "pipeline",
          step: 3,
          at: { word: "pose" },
        },
        {
          type: "diagram",
          artifact: "pipeline",
          step: 4,
          at: { word: "drivetrain" },
        },
      ],
    },
    {
      id: "trust",
      text: "One warning. A single tag can trick the math. Sometimes the answer flips to the wrong side. That's called ambiguity. Catch two or more tags at once, and they combine into one much stronger estimate. More tags, more trust.",
      camera: DIAGRAM,
      holdAfter: 0.8,
    },
    {
      id: "cta",
      text: "Vision can also spot game pieces and track targets. Pick your camera. Wire it into your WPILib 2027 drivetrain. Never trust drifting odometry again. The full comparison is waiting at frc5712.com.",
      camera: END,
      holdAfter: 1.2,
    },
  ],
};
