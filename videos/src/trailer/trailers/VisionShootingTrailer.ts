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
      text: "A single hardcoded flywheel speed scores from exactly one carpet tile, and everywhere else your driver is guessing, under defense, with eight seconds left. The robot already knows where it's standing. Let that pick the speed.",
      camera: TITLE,
      holdAfter: 0.5,
    },
    {
      id: "pose-distance",
      text: "It starts with the pose. Wheels give a rough one, AprilTags keep it honest, and together they're good enough to hand the shooter a distance it can believe. Range and bearing to the goal, from one subtraction.",
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
      text: "Distance goes into a lookup map, and the map hands back a flywheel speed. You measure a handful of points; interpolation invents the rest. Every loop the flywheel gets a fresh setpoint, before anyone pulls the trigger.",
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
      text: "In code it's an InterpolatingDoubleTreeMap. Just a sorted list of pairs. Fill it on a practice field, with a hopper of game pieces and somebody writing numbers on tape. Ask for an untested distance and it splits the difference.",
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
      text: "Two small pieces. First a helper that measures from the drivetrain's pose out to the goal. Then runRepeatedly wrapped around the lookup, so it happens every loop instead of once when the button went down. The setpoint chases the robot.",
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
      text: "None of this works without an afternoon of boring testing. Park, shoot, adjust, write it down, back up a meter, repeat. Four honest points beat twenty guesses. Add another only when you notice you're missing from somewhere specific.",
      camera: { x: 5520, y: 420, width: 1440, height: 660 },
      holdAfter: 0.8,
    },
    {
      id: "cta",
      text: "One trigger, any range. The math is unglamorous and the table is short, which is exactly why it works at eleven at night the day before a regional.",
      camera: END,
      holdAfter: 1.2,
    },
  ],
};
