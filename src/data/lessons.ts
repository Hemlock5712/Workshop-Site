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
      "Make the project, write the mechanism and its commands, bind them to a controller, and drive it closed loop.",
  },
  {
    id: "workshop4",
    title: "Routines",
    num: "04",
    blurb:
      "Put commands in order, end a step when the mechanism arrives, write a routine that holds two things at once, and record what it did.",
    unfinished: "Still being written. Rough draft based on current code.",
  },
  {
    id: "workshop5",
    title: "Swerve & Autonomous",
    num: "05",
    blurb:
      "Generate and calibrate a swerve drive, plan a path, and run an autonomous OpMode.",
    unfinished: "Still being written. Rough draft based on current code.",
  },
  {
    id: "workshop6",
    title: "Vision & Navigation",
    num: "06",
    blurb:
      "Add vision, drive to field poses, profile the motion, and plan around obstacles.",
    unfinished: "Still being written. Rough draft based on current code.",
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
    slug: "/mechanisms",
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
  // Workshop 4: Routines. Composition, arrival checks and coroutines are
  // arm-and-flywheel lessons that need nothing but the bench project, and they
  // carry the chain from `mech-3-MotionMagic` through `mech-4-ReadingState` to
  // `mech-5-Coroutines`. They spent a while filed under Swerve, where they sat
  // behind four lessons of drivetrain a student does not need in order to make
  // two commands run in order.
  //
  // They are their own workshop rather than the tail of Robot Programming
  // because Workshop 3 is about making one mechanism work and this is about
  // making several of them cooperate without a driver. The group was called
  // Advanced Commands when it held State Machines; two of the four are not
  // commands at all, so it is named for what a student builds instead.
  {
    slug: "/chaining-commands",
    title: "Command Composition",
    section: "workshop4",
  },
  {
    slug: "/finish-conditions",
    title: "Finish Conditions",
    section: "workshop4",
  },
  // Coroutines follows Finish Conditions because its waits are built out of
  // `isAtTarget()`, and because `mech-4-ReadingState` now writes the first
  // coroutine itself on the Y button. `mech-5-Coroutines` is the same routine
  // in autonomous, where every wait is bounded: nobody can let go of a button.
  {
    slug: "/coroutines",
    title: "Coroutines",
    section: "workshop4",
  },
  // Logging closes the workshop rather than sitting five lessons past the
  // autonomous routine it exists to explain. A routine that runs unattended is
  // the first thing a student cannot debug by watching, so the log is what
  // replaces the eyes on the mechanism.
  {
    slug: "/logging-implementation",
    title: "Logging",
    section: "workshop4",
  },

  // Workshop 5: Swerve & Autonomous
  {
    slug: "/swerve-prerequisites",
    title: "How Swerve Works",
    section: "workshop5",
  },
  {
    slug: "/swerve-drive-project",
    title: "Swerve Project Generator",
    shortLabel: "Swerve Setup",
    section: "workshop5",
  },
  {
    slug: "/swerve-calibration",
    title: "Swerve Calibration",
    section: "workshop5",
  },
  { slug: "/pathplanner", title: "PathPlanner", section: "workshop5" },
  {
    slug: "/autonomous",
    title: "Autonomous",
    section: "workshop5",
  },

  // Workshop 6: Vision & Navigation
  {
    slug: "/vision-implementation",
    title: "Vision",
    section: "workshop6",
  },
  { slug: "/drive-to-point", title: "Drive to Point", section: "workshop6" },
  {
    slug: "/advanced-drive-to-point",
    title: "Profiled Drive to Point",
    shortLabel: "Profiled Drive",
    section: "workshop6",
  },
  {
    slug: "/dynamic-path-planning",
    title: "Dynamic Path Planning",
    shortLabel: "Dynamic Paths",
    section: "workshop6",
  },
  // Drive to Tag closes Vision & Navigation, which is the material it uses.
  // It was the last lesson of Advanced Commands, a group away from the vision
  // and pose-driving lessons its inline command is built out of.
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
