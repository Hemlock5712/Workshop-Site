// Pronunciation overrides applied to narration text BEFORE TTS generation.
//
// When Kokoro mispronounces a word, add an entry here with a respelling that
// produces the right sound. The replacement only affects audio — slide text
// in the script files is unchanged.
//
// Tips:
// - Try a phonetic respelling first ("Whipp lib" for "WPILib").
// - Add spaces or hyphens to force letter-by-letter reading ("C T R E").
// - Mixed-case acronyms often need hyphens or spaces between letters.
// - After editing, rerun `pnpm tts <ScriptId>` to regenerate audio.
//
// Order matters: longer/more-specific entries first. Each `from` is a literal
// substring match (case-sensitive). Use the `applyPronunciations` helper
// rather than editing this object directly.

export const pronunciationOverrides: Record<string, string> = {
  // === Seed entries — adjust after listening ===

  // FRC / WPILib stack
  WPILib: "Whipp lib",
  wpilib: "Whipp lib",
  roboRIO: "robo Rio",
  SystemCore: "System Core",
  AprilTag: "April Tag",
  AdvantageScope: "Advantage Scope",
  AdvantageKit: "Advantage Kit",
  PathPlanner: "Path Planner",
  DriveToPose: "Drive To Pose",
  LinearPath: "Linear Path",
  SignalLogger: "Signal Logger",
  DataLogManager: "Data Log Manager",
  DriverStation: "Driver Station",
  NetworkTables: "Network Tables",
  SmartDashboard: "Smart Dashboard",
  "Elastic Dashboard": "Elastic Dashboard",
  "VS Code": "V S Code",
  "NI Game Tools": "N I Game Tools",
  "Game Tools": "Game Tools",
  Epilogue: "Epilogue",
  ".wpilog": "W P I log",
  wpilog: "W P I log",

  // Commands v3 / OpMode framework
  OpModeRobot: "Op Mode Robot",
  OpModes: "Op Modes",
  OpMode: "Op Mode",
  Pose2d: "Pose 2 D",
  ChassisVelocities: "Chassis Velocities",

  // FRC acronyms
  FRC: "F R C",
  PID: "P I D",
  kP: "K P",
  kI: "K I",
  kD: "K D",
  kG: "K G",
  kS: "K S",
  kV: "K V",
  kA: "K A",
  RPM: "R P M",
  PDH: "P D H",
  CAN: "Can",

  // CTRE hardware
  CTRE: "C T R E",
  CANivore: "Can-iv-ore",
  CANcoder: "Can-coder",
  TalonFX: "Talon F X",
  "Kraken X44": "Kraken X 44",
  "Kraken X60": "Kraken X 60",
  "Phoenix 6": "Phoenix six",
  "Phoenix Tuner X": "Phoenix Tuner",
  "Hoot Logging": "Hoot Logging",

  // Vision-specific
  Limelight: "Limelight",
  LimelightHelpers: "Limelight Helpers",
  PhotonVision: "Photon Vision",
  MegaTag2: "Mega Tag two",
  MegaTag1: "Mega Tag one",
  MegaTag: "Mega Tag",
  MT1: "M T one",
  MT2: "M T two",
  "perspective-n-point": "perspective N point",
  PnP: "P n P",
  Kalman: "Kahl-mun",

  // CamelCase API names spoken in narration (Commands v3)
  addVisionMeasurement: "add Vision Measurement",
  registerAll: "register All",
  addPeriodic: "add Periodic",
  fpgaToCurrentTime: "F P G A to Current Time",
  telemeterize: "tele meter ize",
  runRepeatedly: "run Repeatedly",
  setDefaultCommand: "set Default Command",
  waitUntil: "wait Until",
  whileTrue: "while True",
  leftBumper: "left Bumper",
  onTrue: "on True",
  "Command.sequence": "Command sequence",
  "Command.parallel": "Command parallel",
  "Command.race": "Command race",
  whenCanceled: "when Canceled",
  withTimeout: "with Timeout",
  withPriority: "with Priority",

  // command3 StateMachine (state-based lesson + trailer)
  StateMachine: "State Machine",
  switchFromAny: "switch From Any",
  switchTo: "switch To",
  whenComplete: "when Complete",
  addState: "add State",
  onEnter: "on Enter",
  onExit: "on Exit",
  // Caption shows the real API punctuation; audio says it the way a mentor does.
  ".named": "dot named",

  // URLs and team identifiers
  "frc5712.com/prerequisites":
    "F R C fifty-seven twelve dot com slash prerequisites",
  "frc5712.com": "F R C fifty-seven twelve dot com",
  "Team 5712": "Team fifty-seven twelve",
  "team 5712": "team fifty-seven twelve",
};

export function applyPronunciations(text: string): string {
  let result = text;
  // Apply longer keys first so "frc5712.com/prerequisites" wins over "frc5712.com".
  const keys = Object.keys(pronunciationOverrides).sort(
    (a, b) => b.length - a.length
  );
  for (const key of keys) {
    if (result.includes(key)) {
      result = result.split(key).join(pronunciationOverrides[key]);
    }
  }
  return result;
}
