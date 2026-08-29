/**
 * Single source of truth for lesson order, workshop groups, progress, search,
 * and previous/next navigation.
 */

import type { Route } from "next";

export type LessonSectionId =
  | "main"
  | "workshop1"
  | "workshop2"
  | "workshop3"
  | "workshop4"
  | "workshop5"
  | "workshop6";

export interface Lesson {
  slug: Route;
  title: string;
  shortLabel?: string;
  section: LessonSectionId;
  /** Side material that can be skipped without breaking the required path. */
  optional?: boolean;
}

export interface SectionMeta {
  id: LessonSectionId;
  title: string;
  num: string;
  blurb: string;
  /**
   * Set on a workshop whose lessons are still being written. The pages stay
   * linked and readable; the flag is the honest label on the menu row so a
   * student knows what they are walking into. The string is the reason, shown
   * under the group heading. Clear it when the workshop is finished.
   */
  unfinished?: string;
}

export const SECTIONS: ReadonlyArray<SectionMeta> = [
  {
    id: "main",
    title: "Getting Started",
    num: "00",
    blurb:
      "What the workshop is, what you need installed, and the CAD for the mechanisms.",
  },
  {
    id: "workshop1",
    title: "Hardware & CTRE",
    num: "01",
    blurb:
      "Set up, identify, test, and tune a motor entirely in Phoenix Tuner X.",
  },
  {
    id: "workshop2",
    title: "Code Foundations",
    num: "02",
    blurb:
      "The Java and the Commands v3 vocabulary a robot program is built out of, before you write any of it.",
  },
  {
    id: "workshop3",
    title: "Robot Programming",
    num: "03",
    blurb:
      "Make the project, write the mechanism and its commands, bind them to a controller, and drive it closed loop on real hardware.",
  },
  {
    id: "workshop4",
    title: "Swerve & Autonomous",
    num: "04",
    blurb:
      "Generate and calibrate a swerve drive, plan a path, combine commands, and run an autonomous OpMode.",
    unfinished:
      "Still being written. Waiting on the next WPILib 2027 alpha releases.",
  },
  {
    id: "workshop5",
    title: "Vision & Navigation",
    num: "05",
    blurb:
      "Add vision, drive to field poses, profile the motion, and plan around obstacles.",
    unfinished:
      "Still being written. Waiting on the next WPILib 2027 alpha releases.",
  },
  {
    id: "workshop6",
    title: "Advanced Commands",
    num: "06",
    blurb:
      "Record what the robot did, then write commands that wait, yield, and remember, using coroutines and state machines.",
    unfinished:
      "Still being written. Waiting on the next WPILib 2027 alpha releases.",
  },
];

/**
 * The flat lesson list. Ordering here drives every linear view of the course.
 * Workshop 1 is intentionally code-free; Java begins at Workshop 2, and the
 * first file a student writes by hand is in Workshop 3.
 *
 * Titles are names, not sentences. This list feeds the breadcrumb, the
 * drawer, the search results and the prev/next arrows, and in every one of
 * those places a student is scanning rather than reading. `shortLabel` now
 * exists only for the two titles that still do not fit a drawer row.
 * See `context/lesson-budget.md`.
 */
export const LESSONS: ReadonlyArray<Lesson> = [
  // Getting Started
  {
    slug: "/introduction",
    title: "Workshop Overview",
    section: "main",
  },
  { slug: "/prerequisites", title: "Prerequisites", section: "main" },
  {
    slug: "/mechanism-cad",
    title: "Mechanism CAD",
    section: "main",
    optional: true,
  },

  // Workshop 1: Hardware & CTRE
  { slug: "/hardware", title: "Hardware Setup", section: "workshop1" },
  {
    slug: "/mechanism-setup",
    title: "Motor Setup & CAN IDs",
    shortLabel: "Motor Setup",
    section: "workshop1",
  },
  {
    slug: "/pid-control",
    title: "PID Tuning in Tuner X",
    shortLabel: "PID Tuning",
    section: "workshop1",
  },
  {
    slug: "/motion-magic",
    title: "Motion Magic in Tuner X",
    shortLabel: "Motion Magic",
    section: "workshop1",
  },

  // Workshop 2: Code Foundations
  { slug: "/java-basics", title: "Java Basics", section: "workshop2" },
  {
    slug: "/command-framework",
    title: "The Command Framework",
    shortLabel: "Command Framework",
    section: "workshop2",
  },

  // Workshop 3: Robot Programming. Project Setup opens it rather than closing
  // Workshop 2: making the project is the first thing you do to write code,
  // not the last idea you learn before writing it.
  { slug: "/project-setup", title: "Project Setup", section: "workshop3" },
  {
    slug: "/building-subsystems",
    title: "Mechanisms",
    section: "workshop3",
  },
  {
    slug: "/adding-commands",
    title: "Writing Commands",
    section: "workshop3",
  },
  { slug: "/opmodes", title: "OpModes", section: "workshop3" },
  {
    slug: "/running-program",
    title: "Hardware Simulation",
    section: "workshop3",
  },
  // The lesson the chain always had a branch for and never had a page.
  // `mech-3-MotionMagic` is where the gains measured in Workshop 1 finally
  // reach the robot program, so Workshop 3 ends with the mechanism running
  // closed loop rather than with a logging aside.
  {
    slug: "/motion-magic-code",
    title: "Motion Magic in Code",
    shortLabel: "Motion Magic Code",
    section: "workshop3",
  },

  // Workshop 4: Swerve & Autonomous
  {
    slug: "/swerve-prerequisites",
    title: "How Swerve Works",
    section: "workshop4",
  },
  {
    slug: "/swerve-drive-project",
    title: "Swerve Project Generator",
    shortLabel: "Swerve Setup",
    section: "workshop4",
  },
  {
    slug: "/swerve-calibration",
    title: "Swerve Calibration",
    section: "workshop4",
  },
  { slug: "/pathplanner", title: "PathPlanner", section: "workshop4" },
  // Composition and finish conditions sit here, not in Workshop 6, because
  // `/autonomous` is the first page that uses them: it writes
  // `Command.sequence` three times and `.withTimeout` four. Filed under
  // "Advanced Commands" they were taught five and six lessons after the
  // lesson that depends on them.
  {
    slug: "/chaining-commands",
    title: "Command Composition",
    section: "workshop4",
  },
  {
    slug: "/finish-lines",
    title: "Finish Conditions",
    section: "workshop4",
  },
  {
    slug: "/autonomous",
    title: "Autonomous",
    section: "workshop4",
  },

  // Workshop 5: Vision & Navigation
  {
    slug: "/vision-implementation",
    title: "Vision",
    section: "workshop5",
  },
  { slug: "/drive-to-point", title: "Drive to Point", section: "workshop5" },
  {
    slug: "/advanced-drive-to-point",
    title: "Profiled Drive to Point",
    shortLabel: "Profiled Drive",
    section: "workshop5",
  },
  {
    slug: "/dynamic-path-planning",
    title: "Dynamic Path Planning",
    shortLabel: "Dynamic Paths",
    section: "workshop5",
  },

  // Workshop 6: Advanced Commands
  {
    slug: "/logging-implementation",
    title: "Logging",
    section: "workshop6",
  },
  { slug: "/coroutines", title: "Coroutines", section: "workshop6" },
  {
    slug: "/state-based",
    title: "State Machines",
    section: "workshop6",
  },
  {
    slug: "/drive-to-tag-inline",
    title: "Example: Drive to Tag",
    shortLabel: "Drive to Tag",
    section: "workshop6",
    optional: true,
  },
];

const SLUG_INDEX: ReadonlyMap<string, number> = new Map(
  LESSONS.map((lesson, index) => [lesson.slug, index])
);

export function findLessonBySlug(slug: string): Lesson | null {
  const index = SLUG_INDEX.get(slug);
  return index === undefined ? null : (LESSONS[index] ?? null);
}

export function getPreviousLesson(slug: string): Lesson | null {
  const index = SLUG_INDEX.get(slug);
  if (index === undefined || index === 0) return null;
  return LESSONS[index - 1] ?? null;
}

export function getNextLesson(slug: string): Lesson | null {
  const index = SLUG_INDEX.get(slug);
  if (index === undefined || index === LESSONS.length - 1) return null;
  return LESSONS[index + 1] ?? null;
}

export function getLessonsBySection(
  section: LessonSectionId
): ReadonlyArray<Lesson> {
  return LESSONS.filter((lesson) => lesson.section === section);
}

export function getSidebarLabel(lesson: Lesson): string {
  return lesson.shortLabel ?? lesson.title;
}

export const LESSON_COUNT = LESSONS.length;

export function getLessonNumber(slug: string): string | null {
  const index = SLUG_INDEX.get(slug);
  return index === undefined ? null : String(index + 1).padStart(2, "0");
}

export function getSectionOf(slug: string): SectionMeta | null {
  const lesson = findLessonBySlug(slug);
  if (!lesson) return null;
  return SECTIONS.find((section) => section.id === lesson.section) ?? null;
}

export interface LessonGroup extends SectionMeta {
  lessons: ReadonlyArray<Lesson & { num: string }>;
}

export function getLessonGroups(): ReadonlyArray<LessonGroup> {
  return SECTIONS.map((section) => ({
    ...section,
    lessons: LESSONS.filter((lesson) => lesson.section === section.id).map(
      (lesson) => ({
        ...lesson,
        num: getLessonNumber(lesson.slug) ?? "",
      })
    ),
  }));
}
