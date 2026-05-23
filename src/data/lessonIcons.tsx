"use client";

/**
 * Sidebar icon map for each workshop lesson + section header.
 *
 * Kept separate from `src/data/lessons.ts` so workshop pages that need
 * lesson metadata (e.g. PageTemplate's prev/next derivation) don't pull
 * in the entire Lucide icon graph.
 *
 * Add a new entry here whenever you add a lesson to `lessons.ts`.
 */

import {
  Home,
  Info,
  CheckCircle2,
  Box as BoxIcon,
  Cog,
  Folder,
  Layers,
  Terminal,
  Gamepad2,
  Play,
  Settings2,
  Zap,
  Sparkles,
  BookOpen,
  Truck,
  Map as MapIcon,
  Crosshair,
  FileText,
  FileCode,
  MapPin,
  Eye,
  Camera,
  Target,
  GitBranch,
  Navigation,
  Beaker,
  Lightbulb,
  type LucideIcon,
} from "lucide-react";
import { ReactNode } from "react";
import type { LessonSection } from "@/data/lessons";

const ICON_CLASS = "w-5 h-5";

function makeIcon(Icon: LucideIcon): ReactNode {
  return <Icon className={ICON_CLASS} aria-hidden />;
}

export const LESSON_ICONS: Record<string, ReactNode> = {
  "/": makeIcon(Home),
  "/introduction": makeIcon(Info),
  "/prerequisites": makeIcon(CheckCircle2),
  "/mechanism-cad": makeIcon(BoxIcon),

  "/hardware": makeIcon(Cog),
  "/project-setup": makeIcon(Folder),
  "/command-framework": makeIcon(Layers),
  "/building-subsystems": makeIcon(Layers),
  "/adding-commands": makeIcon(Terminal),
  "/triggers": makeIcon(Gamepad2),
  "/running-program": makeIcon(Play),
  "/mechanism-setup": makeIcon(Settings2),
  "/pid-control": makeIcon(Zap),
  "/motion-magic": makeIcon(Sparkles),

  "/swerve-prerequisites": makeIcon(BookOpen),
  "/swerve-drive-project": makeIcon(Truck),
  "/pathplanner": makeIcon(MapIcon),
  "/swerve-calibration": makeIcon(Crosshair),
  "/logging-options": makeIcon(FileText),
  "/logging-implementation": makeIcon(FileCode),
  "/drive-to-point": makeIcon(MapPin),
  "/vision-options": makeIcon(Eye),
  "/vision-implementation": makeIcon(Camera),

  "/vision-shooting": makeIcon(Target),
  "/state-based": makeIcon(GitBranch),
  "/advanced-drive-to-point": makeIcon(Navigation),
};

export const SECTION_ICONS: Record<LessonSection, ReactNode> = {
  main: makeIcon(Home),
  workshop1: makeIcon(Beaker),
  workshop2: makeIcon(Zap),
  advanced: makeIcon(Lightbulb),
};
