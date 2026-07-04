import type { Rect, TrailerScript } from "../lib/types";

// Vision-based shooting: the vision-corrected pose gives range and heading,
// an interpolating map turns distance into a flywheel setpoint, and one
// runRepeatedly command keeps the setpoint tracking the robot.

const TITLE: Rect = { x: 0, y: 0, width: 1920, height: 1080 };
const DIAGRAM: Rect = { x: 2560, y: 160, width: 2200, height: 1100 };
const CODE: Rect = { x: 5480, y: 240, width: 1520, height: 880 };
const CODE2: Rect = { x: 7480, y: 180, width: 1560, height: 940 };
const END: Rect = { x: 9720, y: 60, width: 1920, height: 1080 };

const TABLE_DECL = `// distance (meters) -> velocity (RPS)
private final InterpolatingDoubleTreeMap table = new InterpolatingDoubleTreeMap();`;

const TABLE_FILLED = `// distance (meters) -> velocity (RPS)
private final InterpolatingDoubleTreeMap table = new InterpolatingDoubleTreeMap();

// Fill the table from real-world testing — measure at a few distances,
// the map handles the in-between values for you.
table.put(0.0, 0.0);    // At target: no velocity needed
table.put(1.0, 10.0);   // 1 meter away: 10 RPS
table.put(2.0, 30.0);
table.put(3.0, 60.0);`;

const SHOOT_DISTANCE = `// v3 mechanisms have no periodic() — compute the distance on demand.
private double distanceToTarget() {
    Pose2d robotPose = m_drivetrain.getPose();
    Translation2d robotXY = robotPose.getTranslation();
    return robotXY.getDistance(target);
}`;

const SHOOT_FULL = `// v3 mechanisms have no periodic() — compute the distance on demand.
private double distanceToTarget() {
    Pose2d robotPose = m_drivetrain.getPose();
    Translation2d robotXY = robotPose.getTranslation();
    return robotXY.getDistance(target);
}

public Command distanceShoot() {
    return runRepeatedly(() -> {
          double distance = distanceToTarget();
          setVelocity(table.get(distance));
        })
        .named("distanceShoot");
}`;

export const VisionShootingTrailer: TrailerScript = {
  id: "VisionShootingTrailer",
  voice: "af_heart",
  world: [
    {
      kind: "title",
      id: "title",
      rect: TITLE,
      title: "Vision-Based Shooting",
      subtitle: "Range and heading from the pose — setpoints from distance",
      accent: "amber",
    },
    {
      kind: "diagram",
      id: "chain",
      rect: DIAGRAM,
      title: "Pose to setpoint, every loop",
      nodes: [
        {
          id: "pose",
          label: "Pose",
          sublabel: "swerve odometry + vision",
          x: 40,
          y: 440,
          width: 460,
          height: 220,
          accent: "blue",
          step: 1,
        },
        {
          id: "distance",
          label: "Distance",
          sublabel: "getDistance(target)",
          x: 590,
          y: 440,
          width: 460,
          height: 220,
          accent: "amber",
          step: 2,
        },
        {
          id: "map",
          label: "Velocity Map",
          sublabel: "InterpolatingDoubleTreeMap",
          x: 1140,
          y: 440,
          width: 460,
          height: 220,
          accent: "purple",
          step: 3,
        },
        {
          id: "flywheel",
          label: "Flywheel",
          sublabel: "setVelocity — every loop",
          x: 1690,
          y: 440,
          width: 460,
          height: 220,
          accent: "mint",
          step: 4,
        },
      ],
      edges: [
        { from: "pose", to: "distance", label: "measures" },
        { from: "distance", to: "map", label: "looks up" },
        { from: "map", to: "flywheel", label: "sets" },
      ],
    },
    {
      kind: "code",
      id: "table-code",
      rect: CODE,
      fileName: "Flywheel.java",
      language: "java",
      states: ["", TABLE_DECL, TABLE_FILLED],
    },
    {
      kind: "code",
      id: "shoot-code",
      rect: CODE2,
      fileName: "Flywheel.java",
      language: "java",
      states: ["", SHOOT_DISTANCE, SHOOT_FULL],
    },
    {
      kind: "end",
      id: "end",
      rect: END,
      title: "Shoot from anywhere",
      subtitle: "Dynamic flywheel control, built on the real robot",
      url: "frc5712.com/vision-shooting",
    },
  ],
  beats: [
    {
      id: "hook",
      text: "Fixed shooting speed works from exactly one spot on the field. Everywhere else, you miss. But your robot already knows its pose — vision keeps it honest — so let the pose pick the velocity, and shoot from anywhere.",
      camera: TITLE,
      holdAfter: 0.5,
    },
    {
      id: "pose-distance",
      text: "The chain starts at the pose — swerve odometry, corrected by AprilTags. Subtract the target's field position and you get one number that matters: distance. Range and heading, both straight from the pose.",
      camera: { x: 2540, y: 440, width: 1400, height: 800 },
      events: [
        { type: "diagram", artifact: "chain", step: 1, at: { word: "pose" } },
        {
          type: "diagram",
          artifact: "chain",
          step: 2,
          at: { word: "distance" },
        },
      ],
    },
    {
      id: "map-flywheel",
      text: "Distance feeds a velocity map. It looks up the flywheel speed for that range, and interpolation fills every gap in between. The flywheel gets a fresh setpoint every single loop.",
      camera: DIAGRAM,
      events: [
        { type: "diagram", artifact: "chain", step: 3, at: { word: "map" } },
        {
          type: "diagram",
          artifact: "chain",
          step: 4,
          at: { word: "flywheel", occurrence: 2 },
        },
      ],
    },
    {
      id: "table",
      text: "In code, the map is an InterpolatingDoubleTreeMap. Fill it from real testing — one meter, ten rotations per second. Two meters, thirty. Three meters, sixty. Stand at one point five meters, and the map answers twenty. No formula required.",
      camera: CODE,
      events: [
        {
          type: "code-state",
          artifact: "table-code",
          state: 1,
          at: { progress: 0.03 },
        },
        {
          type: "code-state",
          artifact: "table-code",
          state: 2,
          at: { word: "Fill" },
        },
      ],
      holdAfter: 1.0,
    },
    {
      id: "command",
      text: "Distance is a one-liner: grab the pose from the drivetrain, measure to the target. Then one command ties it together — runRepeatedly recomputes distance and velocity every loop, so the setpoint tracks the robot as it drives.",
      camera: CODE2,
      events: [
        {
          type: "code-state",
          artifact: "shoot-code",
          state: 1,
          at: { progress: 0.03 },
        },
        {
          type: "code-state",
          artifact: "shoot-code",
          state: 2,
          at: { word: "runRepeatedly" },
        },
      ],
      holdAfter: 1.2,
    },
    {
      id: "tuning",
      text: "Tuning is honest work: park at three to five key distances, find the velocity that actually scores, and record it. Interpolation covers everything in between. Only add a point when you start missing.",
      camera: { x: 5520, y: 420, width: 1440, height: 660 },
      holdAfter: 0.8,
    },
    {
      id: "cta",
      text: "One button, any distance — that's vision-based shooting. Pose to distance, distance to velocity, every loop. See the full Dynamic Flywheel build, on real hardware, at frc5712.com.",
      camera: END,
      holdAfter: 1.2,
    },
  ],
};
