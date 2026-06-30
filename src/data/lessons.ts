/**
 * Single source of truth for every workshop lesson.
 *
 * Consumed by:
 *  - `PageTemplate` (auto-derives previous/next links from the current slug)
 *  - `Sidebar` (renders the grouped nav from this list)
 *  - `useProgress` consumers (counts completed lessons per section)
 *
 * The ordering of the `LESSONS` array IS the lesson order. Sidebar groups
 * keep their own internal order from this list, and prev/next links walk
 * the same flat sequence.
 *
 * `shortLabel` is what the sidebar shows when it can't fit the full title.
 * Pages that don't define one fall back to `title`.
 */

export type LessonSection = "main" | "workshop1" | "workshop2" | "advanced";

export interface Lesson {
  /** Route path, always with a leading slash and no trailing slash. */
  slug: string;
  /** Long-form page title (matches the H1 in PageTemplate). */
  title: string;
  /** Short label for the sidebar when space is tight. */
  shortLabel?: string;
  section: LessonSection;
}

export interface SectionMeta {
  id: LessonSection;
  title: string;
  /**
   * Whether the sidebar wraps this section in a collapsible group header.
   * `main` items live at the top with no header; the workshop / advanced
   * sections are each their own collapsible group.
   */
  collapsible: boolean;
}

export const SECTIONS: ReadonlyArray<SectionMeta> = [
  { id: "main", title: "Getting Started", collapsible: false },
  { id: "workshop1", title: "Workshop #1", collapsible: true },
  { id: "workshop2", title: "Workshop #2", collapsible: true },
  { id: "advanced", title: "Advanced Topics", collapsible: true },
];

/**
 * The flat lesson list. Order here drives prev/next AND sidebar order.
 * Mirror the sequence the sidebar currently uses so nothing visibly moves
 * when this module ships.
 */
export const LESSONS: ReadonlyArray<Lesson> = [
  // ── Getting Started ─────────────────────────────────────────────────
  { slug: "/", title: "Home", section: "main" },
  {
    slug: "/introduction",
    title: "Gray Matter Coding Workshop",
    shortLabel: "Introduction",
    section: "main",
  },
  { slug: "/prerequisites", title: "Prerequisites", section: "main" },
  { slug: "/mechanism-cad", title: "Mechanism CAD", section: "main" },

  // ── Workshop #1 ─────────────────────────────────────────────────────
  { slug: "/hardware", title: "Hardware Setup", section: "workshop1" },
  { slug: "/project-setup", title: "Project Setup", section: "workshop1" },
  {
    slug: "/command-framework",
    title: "Command-Based Framework",
    shortLabel: "Command System",
    section: "workshop1",
  },
  {
    slug: "/building-subsystems",
    title: "Mechanisms",
    section: "workshop1",
  },
  { slug: "/adding-commands", title: "Commands", section: "workshop1" },
  { slug: "/triggers", title: "Triggers", section: "workshop1" },
  {
    slug: "/running-program",
    title: "Running Program",
    shortLabel: "Run Program",
    section: "workshop1",
  },
  {
    slug: "/mechanism-setup",
    title: "Mechanism Setup",
    shortLabel: "Mechanism",
    section: "workshop1",
  },
  { slug: "/pid-control", title: "PID Control", section: "workshop1" },
  { slug: "/motion-magic", title: "Motion Magic", section: "workshop1" },

  // ── Workshop #2 ─────────────────────────────────────────────────────
  {
    slug: "/swerve-prerequisites",
    title: "Swerve Drive Prerequisites",
    shortLabel: "Swerve Prereqs",
    section: "workshop2",
  },
  {
    slug: "/swerve-drive-project",
    title: "Creating a Swerve Drive Project",
    shortLabel: "Swerve Project",
    section: "workshop2",
  },
  {
    slug: "/pathplanner",
    title: "Autonomous: Driving to a Pose",
    shortLabel: "Auto Routines",
    section: "workshop2",
  },
  {
    slug: "/swerve-calibration",
    title: "Swerve Calibration",
    shortLabel: "Odom Calib",
    section: "workshop2",
  },
  {
    slug: "/logging-options",
    title: "Logging Options",
    shortLabel: "Log Options",
    section: "workshop2",
  },
  {
    slug: "/logging-implementation",
    title: "Implementing Logging",
    shortLabel: "Logging Setup",
    section: "workshop2",
  },
  { slug: "/drive-to-point", title: "Drive to Point", section: "workshop2" },
  {
    slug: "/vision-options",
    title: "Vision Options",
    section: "workshop2",
  },
  {
    slug: "/vision-implementation",
    title: "Implementing Vision",
    shortLabel: "Vision Setup",
    section: "workshop2",
  },

  // ── Advanced Topics ─────────────────────────────────────────────────
  {
    slug: "/vision-shooting",
    title: "Dynamic Flywheel Control",
    shortLabel: "Odom Shot",
    section: "advanced",
  },
  {
    slug: "/state-based",
    title: "State Machines",
    shortLabel: "State Machines",
    section: "advanced",
  },
  {
    slug: "/advanced-drive-to-point",
    title: "Advanced: Profiled Drive to Point",
    shortLabel: "LinearPath",
    section: "advanced",
  },
];

const SLUG_INDEX: ReadonlyMap<string, number> = new Map(
  LESSONS.map((l, i) => [l.slug, i])
);

/** Return the lesson with this slug, or null if there's no match. */
export function findLessonBySlug(slug: string): Lesson | null {
  const idx = SLUG_INDEX.get(slug);
  return idx === undefined ? null : (LESSONS[idx] ?? null);
}

/** Lesson immediately before this slug, or null if it's the first / unknown. */
export function getPreviousLesson(slug: string): Lesson | null {
  const idx = SLUG_INDEX.get(slug);
  if (idx === undefined || idx === 0) return null;
  return LESSONS[idx - 1] ?? null;
}

/** Lesson immediately after this slug, or null if it's the last / unknown. */
export function getNextLesson(slug: string): Lesson | null {
  const idx = SLUG_INDEX.get(slug);
  if (idx === undefined || idx === LESSONS.length - 1) return null;
  return LESSONS[idx + 1] ?? null;
}

/** All lessons in this section, preserving their order in the flat list. */
export function getLessonsBySection(
  section: LessonSection
): ReadonlyArray<Lesson> {
  return LESSONS.filter((l) => l.section === section);
}

/** Best display label for a lesson — `shortLabel` if set, else `title`. */
export function getSidebarLabel(lesson: Lesson): string {
  return lesson.shortLabel ?? lesson.title;
}
