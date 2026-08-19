/**
 * Single source of truth for lesson order, workshop groups, progress, search,
 * and previous/next navigation.
 */

import type { Route } from "next";

export type LessonSectionId =
  "main" | "workshop1" | "workshop2" | "workshop3" | "workshop4" | "workshop5";

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
    title: "Robot Programming",
    num: "02",
    blurb:
      "Learn the Java and Commands v3 structure behind a complete robot project.",
  },
  {
    id: "workshop3",
    title: "Swerve & Autonomous",
    num: "03",
    blurb:
      "Generate and calibrate a swerve drive, plan paths, and run an autonomous OpMode.",
  },
  {
    id: "workshop4",
    title: "Vision & Navigation",
    num: "04",
    blurb:
      "Add vision, drive to field poses, profile the motion, and plan around obstacles.",
  },
  {
    id: "workshop5",
    title: "Advanced Commands",
    num: "05",
    blurb:
      "Compose longer behaviors with finish conditions, coroutines, and state machines.",
  },
];

/**
 * The flat lesson list. Ordering here drives every linear view of the course.
 * Workshop 1 is intentionally code-free; Java begins at Workshop 2.
 */
export const LESSONS: ReadonlyArray<Lesson> = [
  // Getting Started
  {
    slug: "/introduction",
    title: "Gray Matter Coding Workshop",
    shortLabel: "Introduction",
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
    section: "workshop1",
  },
  {
    slug: "/motion-magic",
    title: "Motion Magic in Tuner X",
    section: "workshop1",
  },

  // Workshop 2: Robot Programming
  {
    slug: "/java-basics",
    title: "The Java You Need",
    shortLabel: "Java Basics",
    section: "workshop2",
  },
  { slug: "/project-setup", title: "Project Setup", section: "workshop2" },
  {
    slug: "/command-framework",
    title: "Command-Based Framework",
    shortLabel: "Command System",
    section: "workshop2",
  },
  {
    slug: "/adding-commands",
    title: "Classic Commands",
    section: "workshop2",
  },
  { slug: "/opmodes", title: "OpModes", section: "workshop2" },
  { slug: "/robot-class", title: "Robot.java", section: "workshop2" },
  {
    slug: "/building-subsystems",
    title: "Mechanisms",
    section: "workshop2",
  },
  {
    slug: "/running-program",
    title: "Running Your Code",
    shortLabel: "Run Your Code",
    section: "workshop2",
  },
  {
    slug: "/logging-implementation",
    title: "Basic Logging",
    section: "workshop2",
  },

  // Workshop 3: Swerve & Autonomous
  {
    slug: "/swerve-prerequisites",
    title: "How Swerve Works",
    shortLabel: "Swerve Concepts",
    section: "workshop3",
  },
  {
    slug: "/swerve-drive-project",
    title: "Swerve Setup",
    section: "workshop3",
  },
  {
    slug: "/swerve-calibration",
    title: "Swerve Calibration",
    section: "workshop3",
  },
  { slug: "/pathplanner", title: "PathPlanner", section: "workshop3" },
  {
    slug: "/autonomous",
    title: "Autonomous OpModes & Commands",
    shortLabel: "Autonomous",
    section: "workshop3",
  },

  // Workshop 4: Vision & Navigation
  {
    slug: "/vision-implementation",
    title: "Vision",
    section: "workshop4",
  },
  { slug: "/drive-to-point", title: "Drive to Point", section: "workshop4" },
  {
    slug: "/advanced-drive-to-point",
    title: "Profiled Drive to Point",
    shortLabel: "Profiled Drive",
    section: "workshop4",
  },
  {
    slug: "/dynamic-path-planning",
    title: "Dynamic Path Planning",
    shortLabel: "Dynamic Paths",
    section: "workshop4",
  },

  // Workshop 5: Advanced Commands
  {
    slug: "/chaining-commands",
    title: "More Complex Commands",
    shortLabel: "Command Composition",
    section: "workshop5",
  },
  {
    slug: "/finish-lines",
    title: "Command Finish Conditions",
    shortLabel: "Finish Conditions",
    section: "workshop5",
  },
  { slug: "/coroutines", title: "Coroutines", section: "workshop5" },
  {
    slug: "/state-based",
    title: "State Machines",
    section: "workshop5",
  },
  {
    slug: "/drive-to-tag-inline",
    title: "Coroutine Navigation Example",
    shortLabel: "Coroutine Example",
    section: "workshop5",
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
