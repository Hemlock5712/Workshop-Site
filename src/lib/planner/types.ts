// Type definitions for the WaypointPlanner

export interface Point {
  x: number;
  y: number;
}

export interface Waypoint {
  name: string;
  x: number;
  y: number;
  rot: number; // degrees
  isLinked: boolean;
  endSpeed?: number; // Optional manual end speed in m/s (undefined = auto-calculate)
}

export interface Path {
  name: string;
  points: Waypoint[];
}

export interface LinkedWaypointData {
  x: number;
  y: number;
  rot: number; // degrees
}

export type ObstacleType = "rectangle" | "circle" | "polygon";

export interface BaseObstacle {
  name: string;
  x: number;
  y: number;
}

export interface RectangleObstacle extends BaseObstacle {
  type: "rectangle";
  w: number;
  h: number;
}

export interface CircleObstacle extends BaseObstacle {
  type: "circle";
  r: number;
}

export interface PolygonObstacle extends BaseObstacle {
  type: "polygon";
  points: Point[];
}

export type Obstacle = RectangleObstacle | CircleObstacle | PolygonObstacle;

export interface RobotConfig {
  // Robot dimensions
  robotLength: number;
  robotWidth: number;

  // Physics
  maxVelocity: number;
  maxFriction: number; // in G's
  driveBaseRadius: number;

  // Timing and tolerance
  reactionTime: number;
  waypointTolerance: number;
  positionTolerance: number;
  rotationTolerance: number;

  // Drivetrain
  gearRatio: number;
  wheelRadius: number;
  robotMass: number;
  numDriveMotors: number;

  // Motor parameters
  statorCurrentLimit: number;
  motorStallTorque: number;
  motorFreeSpeedRpm: number;
  motorStallCurrent: number;
}

export const DEFAULT_CONFIG: RobotConfig = {
  robotLength: 0.8,
  robotWidth: 0.8,
  maxVelocity: 4.287,
  maxFriction: 1.0,
  driveBaseRadius: 0.4,
  reactionTime: 0.03,
  waypointTolerance: 0.15,
  positionTolerance: 0.02,
  rotationTolerance: 0.0349, // 2 degrees in radians
  gearRatio: 6.746,
  wheelRadius: 0.0483,
  robotMass: 56.7,
  numDriveMotors: 4,
  statorCurrentLimit: 150.0,
  motorStallTorque: 9.3615,
  motorFreeSpeedRpm: 5784.65,
  motorStallCurrent: 476.1,
};

export interface MotorPreset {
  name: string;
  stallTorque: number;
  freeSpeedRpm: number;
  stallCurrent: number;
}

export const MOTOR_PRESETS: Record<string, MotorPreset> = {
  kraken_foc: {
    name: "Kraken X60 FOC",
    stallTorque: 9.3615,
    freeSpeedRpm: 5784.65,
    stallCurrent: 476.1,
  },
  kraken: {
    name: "Kraken X60",
    stallTorque: 7.1573,
    freeSpeedRpm: 6065.33,
    stallCurrent: 374.4,
  },
};

export interface SimulationPose {
  x: number;
  y: number;
  rot: number; // radians
  t: number; // time in seconds
}

export interface Speeds {
  vx: number;
  vy: number;
  omega: number;
}

export interface ViewState {
  scale: number;
  offset: Point;
}

export interface GridSettings {
  enabled: boolean;
  snapEnabled: boolean;
  size: number;
}

export interface PlannerState {
  // Core data
  paths: Record<string, Path>;
  currentPathId: string;
  linkedWaypoints: Record<string, LinkedWaypointData>;
  obstacles: Obstacle[];
  config: RobotConfig;

  // Field settings
  fieldWidth: number;
  fieldImageSrc: string;

  // Selection
  selectedWaypointIndex: number;
  selectedObstacleIndex: number;

  // View state
  view: ViewState;
  grid: GridSettings;

  // Drawing mode
  isDrawingPolygon: boolean;
  tempPolygonPoints: Point[];

  // Simulation results (derived)
  simulationPath: SimulationPose[];
  collisionDetected: boolean;
  collisionPoint: SimulationPose | null;
  totalDuration: number;
  pathLength: number;
}

export const DEFAULT_FIELD_WIDTH = 17.55;
export const DEFAULT_FIELD_IMAGE = "/images/planner/field26.png";

export const INITIAL_STATE: PlannerState = {
  paths: {
    p1: { name: "Auto Path 1", points: [] },
  },
  currentPathId: "p1",
  linkedWaypoints: {},
  obstacles: [],
  config: DEFAULT_CONFIG,
  fieldWidth: DEFAULT_FIELD_WIDTH,
  fieldImageSrc: DEFAULT_FIELD_IMAGE,
  selectedWaypointIndex: -1,
  selectedObstacleIndex: -1,
  view: {
    scale: 1.0,
    offset: { x: 0, y: 0 },
  },
  grid: {
    enabled: false,
    snapEnabled: false,
    size: 1.0,
  },
  isDrawingPolygon: false,
  tempPolygonPoints: [],
  simulationPath: [],
  collisionDetected: false,
  collisionPoint: null,
  totalDuration: 0,
  pathLength: 0,
};

// Action types for reducer
export type PlannerAction =
  | { type: "SET_STATE"; payload: Partial<PlannerState> }
  | { type: "RESTORE_STATE"; payload: PlannerState }
  | { type: "ADD_WAYPOINT"; payload: { x: number; y: number } }
  | {
      type: "UPDATE_WAYPOINT";
      payload: { index: number; updates: Partial<Waypoint> };
    }
  | { type: "DELETE_WAYPOINT"; payload: { index: number } }
  | { type: "SELECT_WAYPOINT"; payload: { index: number } }
  | { type: "INSERT_WAYPOINT_AFTER"; payload: { index: number } }
  | { type: "TOGGLE_WAYPOINT_LINK"; payload: { index: number } }
  | {
      type: "APPLY_EXISTING_LINK";
      payload: { index: number; linkName: string };
    }
  | { type: "ADD_OBSTACLE"; payload: { type: ObstacleType } }
  | {
      type: "UPDATE_OBSTACLE";
      payload: { index: number; updates: Partial<Obstacle> };
    }
  | { type: "DELETE_OBSTACLE"; payload: { index: number } }
  | { type: "SELECT_OBSTACLE"; payload: { index: number } }
  | { type: "START_POLYGON_DRAWING" }
  | { type: "ADD_POLYGON_POINT"; payload: Point }
  | { type: "FINISH_POLYGON" }
  | { type: "CANCEL_POLYGON" }
  | { type: "CREATE_PATH" }
  | { type: "DELETE_PATH" }
  | { type: "DUPLICATE_PATH" }
  | { type: "REVERSE_PATH" }
  | { type: "SWITCH_PATH"; payload: { pathId: string } }
  | { type: "RENAME_PATH"; payload: { name: string } }
  | { type: "UPDATE_CONFIG"; payload: Partial<RobotConfig> }
  | { type: "SET_MOTOR_PRESET"; payload: { preset: string } }
  | { type: "UPDATE_VIEW"; payload: Partial<ViewState> }
  | { type: "UPDATE_GRID"; payload: Partial<GridSettings> }
  | { type: "SET_FIELD_WIDTH"; payload: { width: number } }
  | { type: "SET_FIELD_IMAGE"; payload: { src: string } }
  | {
      type: "SET_SIMULATION_RESULTS";
      payload: {
        simulationPath: SimulationPose[];
        collisionDetected: boolean;
        collisionPoint: SimulationPose | null;
        totalDuration: number;
        pathLength: number;
      };
    }
  | { type: "MOVE_WAYPOINT"; payload: { index: number; x: number; y: number } }
  | { type: "ROTATE_WAYPOINT"; payload: { index: number; rot: number } }
  | { type: "MOVE_OBSTACLE"; payload: { index: number; x: number; y: number } }
  | { type: "CLEAR_SELECTION" };
