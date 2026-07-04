import type { Rect, TrailerScript } from "../lib/types";

// Profiled path following with feedforward: the same predict-then-correct
// idea from mechanism control (Motion Magic), applied to the whole
// drivetrain with CTRE's LinearPath. Camera travels: title card →
// predict/correct diagram → profiled command code (path → feedback →
// wheel-force feedforward) → end card.

const TITLE: Rect = { x: 0, y: 0, width: 1920, height: 1080 };
const DIAGRAM: Rect = { x: 2560, y: 120, width: 2200, height: 1100 };
const CODE: Rect = { x: 5480, y: 220, width: 1620, height: 1000 };
const END: Rect = { x: 7920, y: 100, width: 1920, height: 1080 };

// Sub-regions of the diagram the camera pushes into.
const PATH_CLOSEUP: Rect = { x: 2580, y: 340, width: 1300, height: 740 };
const SETPOINT_CLOSEUP: Rect = { x: 3240, y: 340, width: 1400, height: 790 };

// State 1: the profile — CTRE's straight-line generator with constraints.
const CODE_PATH = `// Straight-line profile: translation + rotation constraints.
private final LinearPath path = new LinearPath(
    new TrapezoidProfile.Constraints(MAX_V, MAX_A),
    new TrapezoidProfile.Constraints(Math.PI, 2.0 * Math.PI));`;

// State 2: sample the moving setpoint, trim onto it with PID.
const CODE_FEEDBACK = `${CODE_PATH}

@Override protected void execute() {
  double t = Utils.getCurrentTimeSeconds() - startTime;
  LinearPath.State setpoint = path.calculate(t, startState, goal);

  ChassisVelocities corrected = applyPidCorrections(setpoint, drivetrain.getPose());
  drivetrain.setControl(driveRequest.withVelocity(corrected));
}`;

// State 3: add Phoenix 6 wheel-force feedforwards to the same request.
const CODE_FEEDFORWARD = `${CODE_PATH}

@Override protected void execute() {
  double t = Utils.getCurrentTimeSeconds() - startTime;
  LinearPath.State setpoint = path.calculate(t, startState, goal);

  ChassisVelocities corrected = applyPidCorrections(setpoint, drivetrain.getPose());
  WheelForces forces = wheelForceCalculator.compute(prev, setpoint, DT);

  drivetrain.setControl(driveRequest
      .withVelocity(corrected)
      .withWheelForceFeedforwardsX(forces.x)
      .withWheelForceFeedforwardsY(forces.y));
  prev = setpoint;
}`;

export const AdvancedDriveToPointTrailer: TrailerScript = {
  id: "AdvancedDriveToPointTrailer",
  voice: "af_heart",
  world: [
    {
      kind: "title",
      id: "title",
      rect: TITLE,
      title: "Profiled Drive to Point",
      subtitle: "Predict the path, correct the rest",
      accent: "amber",
    },
    {
      kind: "diagram",
      id: "flow",
      rect: DIAGRAM,
      title: "Predict, then correct",
      nodes: [
        {
          id: "path",
          label: "LinearPath",
          sublabel: "accelerate, cruise, decelerate",
          x: 80,
          y: 440,
          width: 460,
          height: 220,
          accent: "amber",
          step: 1,
        },
        {
          id: "setpoint",
          label: "Moving Setpoint",
          sublabel: "path.calculate(t) — where you should be now",
          x: 880,
          y: 440,
          width: 460,
          height: 220,
          accent: "blue",
          step: 2,
        },
        {
          id: "feedforward",
          label: "Feedforward",
          sublabel: "planned wheel forces, applied early",
          x: 1680,
          y: 150,
          width: 460,
          height: 220,
          accent: "mint",
          step: 3,
        },
        {
          id: "feedback",
          label: "Feedback",
          sublabel: "PID trims onto the path",
          x: 1680,
          y: 730,
          width: 460,
          height: 220,
          accent: "purple",
          step: 4,
        },
      ],
      edges: [
        { from: "path", to: "setpoint", label: "sampled every loop" },
        { from: "setpoint", to: "feedforward", label: "anticipates" },
        { from: "setpoint", to: "feedback", label: "corrects" },
      ],
    },
    {
      kind: "code",
      id: "profiled-code",
      rect: CODE,
      fileName: "ProfiledDriveToPoint.java",
      language: "java",
      states: ["", CODE_PATH, CODE_FEEDBACK, CODE_FEEDFORWARD],
    },
    {
      kind: "end",
      id: "end",
      rect: END,
      title: "Predict, then correct",
      subtitle: "Constraint tuning, MOI, and the full profiled command",
      url: "frc5712.com/advanced-drive-to-point",
    },
  ],
  beats: [
    {
      id: "hook",
      text: "Basic drive to point aims PID at the final target — big error, big lunge, then a wobble at the end. Your mechanisms already solved this with Motion Magic: profile the motion, then follow it. Time the drivetrain learned the same trick.",
      camera: TITLE,
      holdAfter: 0.5,
    },
    {
      id: "profile",
      text: "CTRE's LinearPath plans the whole move up front: accelerate at four meters per second squared, cruise at four point three meters per second, then decelerate to land at zero. A trapezoid your drivetrain can actually track.",
      camera: PATH_CLOSEUP,
      events: [
        {
          type: "diagram",
          artifact: "flow",
          step: 1,
          at: { word: "LinearPath" },
        },
      ],
    },
    {
      id: "setpoint",
      text: "Every loop, you sample that path for a moving setpoint — where you should be right now. PID compares against that, not the faraway target. Errors stay tiny, so corrections stay gentle, and the overshoot mostly disappears.",
      camera: SETPOINT_CLOSEUP,
      events: [
        {
          type: "diagram",
          artifact: "flow",
          step: 2,
          at: { word: "setpoint" },
        },
      ],
    },
    {
      id: "split",
      text: "Then the split. Feedforward computes the wheel forces the plan demands — from your robot's mass and moment of inertia — and applies them before any error exists. Feedback is left with one small job: cleaning up disturbances.",
      camera: DIAGRAM,
      events: [
        {
          type: "diagram",
          artifact: "flow",
          step: 3,
          at: { word: "Feedforward" },
        },
        {
          type: "diagram",
          artifact: "flow",
          step: 4,
          at: { word: "Feedback" },
        },
      ],
    },
    {
      id: "code-feedback",
      text: "In code, the profile is two constraint sets — translation and rotation. Then each execute, calculate hands you the setpoint at elapsed time t, and PID trims your measured pose back onto it. One velocity request, small corrections.",
      camera: CODE,
      events: [
        {
          type: "code-state",
          artifact: "profiled-code",
          state: 1,
          at: { progress: 0.03 },
        },
        {
          type: "code-state",
          artifact: "profiled-code",
          state: 2,
          at: { word: "execute" },
        },
      ],
      holdAfter: 1.0,
    },
    {
      id: "code-forces",
      text: "Phoenix 6 carries the anticipation all the way to the carpet. Wheel force feedforwards — X and Y for every module — ride along on the same request. The robot pushes because the plan says push, not because it fell behind.",
      camera: CODE,
      events: [
        {
          type: "code-state",
          artifact: "profiled-code",
          state: 3,
          at: { word: "feedforwards" },
        },
      ],
      holdAfter: 1.6,
    },
    {
      id: "cta",
      text: "This is the exact shape of the template's own DriveToPose — the predict-then-correct pattern competition autos are built on. Constraint tuning, MOI estimation, and the complete profiled command are waiting at frc5712.com.",
      camera: END,
      holdAfter: 1.2,
    },
  ],
};
