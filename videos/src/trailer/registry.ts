import type { TrailerScript } from "./lib/types";
// Workshop 1 — foundations
import { IntroductionTrailer } from "./trailers/IntroductionTrailer";
import { PrerequisitesTrailer } from "./trailers/PrerequisitesTrailer";
import { HardwareTrailer } from "./trailers/HardwareTrailer";
import { MechanismSelectionTrailer } from "./trailers/MechanismSelectionTrailer";
import { ProjectSetupTrailer } from "./trailers/ProjectSetupTrailer";
import { BuildingMechanismsTrailer } from "./trailers/BuildingMechanismsTrailer";
import { CommandFrameworkTrailer } from "./trailers/CommandFrameworkTrailer";
import { AddingCommandsTrailer } from "./trailers/AddingCommandsTrailer";
import { TriggersTrailer } from "./trailers/TriggersTrailer";
import { RunningProgramTrailer } from "./trailers/RunningProgramTrailer";
import { StateBasedTrailer } from "./trailers/StateBasedTrailer";
// Control trilogy — each builds on the previous
import { PidTrailer } from "./trailers/PidTrailer";
import { FeedforwardTrailer } from "./trailers/FeedforwardTrailer";
import { MotionMagicTrailer } from "./trailers/MotionMagicTrailer";
// Full lessons — long-form deep dives
import { PidLesson } from "./trailers/PidLesson";
import { FeedforwardLesson } from "./trailers/FeedforwardLesson";
import { MotionMagicLesson } from "./trailers/MotionMagicLesson";
import { StateBasedLesson } from "./trailers/StateBasedLesson";
import { CommandsLesson } from "./trailers/CommandsLesson";
// Workshop 2 — swerve, sensing, autonomy
import { SwerveDriveTrailer } from "./trailers/SwerveDriveTrailer";
import { LoggingOptionsTrailer } from "./trailers/LoggingOptionsTrailer";
import { LoggingImplementationTrailer } from "./trailers/LoggingImplementationTrailer";
import { VisionOptionsTrailer } from "./trailers/VisionOptionsTrailer";
import { VisionImplementationTrailer } from "./trailers/VisionImplementationTrailer";
import { DriveToPointTrailer } from "./trailers/DriveToPointTrailer";
import { VisionShootingTrailer } from "./trailers/VisionShootingTrailer";
import { AdvancedDriveToPointTrailer } from "./trailers/AdvancedDriveToPointTrailer";

// Single source of truth: Root.tsx registers compositions from this list and
// scripts/prepare-trailer.ts generates audio for it. Adding a trailer is one
// script file + one line here. Order here = order in Remotion Studio.
export const TRAILERS: TrailerScript[] = [
  IntroductionTrailer,
  PrerequisitesTrailer,
  HardwareTrailer,
  MechanismSelectionTrailer,
  ProjectSetupTrailer,
  BuildingMechanismsTrailer,
  CommandFrameworkTrailer,
  AddingCommandsTrailer,
  TriggersTrailer,
  RunningProgramTrailer,
  StateBasedTrailer,
  PidTrailer,
  FeedforwardTrailer,
  MotionMagicTrailer,
  SwerveDriveTrailer,
  LoggingOptionsTrailer,
  LoggingImplementationTrailer,
  VisionOptionsTrailer,
  VisionImplementationTrailer,
  DriveToPointTrailer,
  VisionShootingTrailer,
  AdvancedDriveToPointTrailer,
  PidLesson,
  FeedforwardLesson,
  MotionMagicLesson,
  StateBasedLesson,
  CommandsLesson,
];
