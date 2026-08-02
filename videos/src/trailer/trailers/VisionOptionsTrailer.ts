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
      text: "Wheels slip. Carpet gives. Every time either one happens your odometry walks further from the truth, and late in a match the robot is confidently reporting a spot it's nowhere near. A camera that sees an AprilTag fixes that.",
      camera: TITLE,
      holdAfter: 0.5,
    },
    {
      id: "limelight",
      text: "Everything a vision system needs already lives in this box, which is the whole reason teams buy one. Power, Ethernet, done. An evening on mounting instead of a weekend on Linux. Four to five hundred dollars.",
      camera: IMAGE,
    },
    {
      id: "photonvision",
      text: "The alternative costs a quarter as much. PhotonVision is free, and it runs on whatever small computer your team can scrounge. A hundred to a hundred fifty dollars, all in. Same AprilTags, same pose. You pay in evenings instead.",
      camera: { x: 2380, y: 80, width: 1860, height: 1240 },
    },
    {
      id: "tag-to-camera",
      text: "Every AprilTag has a number and a known spot in the field layout. Your camera measures where its corners land, and there's exactly one place the robot could stand for them to look like that.",
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
      text: "The camera hands back a pose and a timestamp. The timestamp matters, because that answer describes where you were a few frames ago. So the drivetrain rewinds, folds the correction in, and replays. Odometry stops lying.",
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
      text: "One tag can lie to you. Seen straight on at range, the math can't tell a tag tilted left from one tilted right, so your pose flips to the wrong side of the field. That's ambiguity. Two tags kill it.",
      camera: DIAGRAM,
      holdAfter: 0.8,
    },
    {
      id: "cta",
      text: "Tags aren't the only thing worth seeing. The same camera finds game pieces. Whichever you buy, mount it where a defender can't park a bumper in front of the lens, and trust it only as far as it earns.",
      camera: END,
      holdAfter: 1.2,
    },
  ],
};
