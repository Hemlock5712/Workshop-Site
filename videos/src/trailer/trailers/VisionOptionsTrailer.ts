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
      text: "Your robot thinks it knows where it is. Then the wheels slip, and odometry quietly drifts away from reality. Vision fixes that — cameras that read AprilTags at known field locations and hand you an absolute position.",
      camera: TITLE,
      holdAfter: 0.5,
    },
    {
      id: "limelight",
      text: "This is the Limelight — a dedicated plug-and-play camera. Processing, LEDs, and NetworkTables integrated in one box. Wire power and Ethernet, and it starts tracking. Budget roughly four hundred to five hundred dollars.",
      camera: IMAGE,
    },
    {
      id: "photonvision",
      text: "Prefer free? PhotonVision is open-source software you run on a coprocessor like a Raspberry Pi — roughly one hundred to one hundred fifty dollars all in. Both platforms read AprilTags and estimate pose. You are choosing convenience versus cost.",
      camera: { x: 2380, y: 80, width: 1860, height: 1240 },
    },
    {
      id: "tag-to-camera",
      text: "Here's the pipeline. An AprilTag sits at a known location on the field. Your camera spots it, measures the corners, and solves for exactly where the robot must be standing.",
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
      text: "That solve becomes a pose estimate — field coordinates with a timestamp. Feed it to the drivetrain, and vision snaps your odometry back to reality every frame a tag is in view.",
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
      text: "One caveat: a single tag can be ambiguous — the math sometimes flips the answer. Catch two or more tags at once, and they fuse into one estimate that is dramatically stronger. More tags, more trust.",
      camera: DIAGRAM,
      holdAfter: 0.8,
    },
    {
      id: "cta",
      text: "Vision also unlocks game-piece detection and target tracking. Pick your camera, wire it into your WPILib 2027 drivetrain, and never trust drifting odometry again. The full comparison is waiting at frc5712.com.",
      camera: END,
      holdAfter: 1.2,
    },
  ],
};
