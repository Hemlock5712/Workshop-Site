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

import type { Route } from "next";

export type LessonSectionId = "main" | "workshop1" | "workshop2" | "advanced";

export interface Lesson {
  /**
   * Route path, always with a leading slash and no trailing slash.
   *
   * Typed as `Route` rather than `string` so `typedRoutes` checks every entry
   * against the routes that actually exist under `src/app/`. This list drives
   * prev/next, the drawer, the syllabus and the search index, so a slug that
   * does not resolve is a 404 in four places at once — and nothing caught it
   * before, because a wrong string is still a string.
   */
  slug: Route;
  /** Long-form page title (matches the H1 in PageTemplate). */
  title: string;
  /** Short label for the sidebar when space is tight. */
  shortLabel?: string;
  section: LessonSectionId;
  /**
   * Side material you can skip without breaking the next lesson. The sidebar
   * marks these so the linear run reads as the required path. Everything
   * without the flag is load-bearing.
   */
  optional?: boolean;
}

export interface SectionMeta {
  id: LessonSectionId;
  title: string;
  /** Two-digit group number shown in the drawer and on the syllabus. */
  num: string;
  /** One sentence on what the group covers. Shown on the syllabus. */
  blurb: string;
  /**
   * Whether the sidebar wraps this section in a collapsible group header.
   * `main` items live at the top with no header; the workshop / advanced
   * sections are each their own collapsible group.
   */
  collapsible: boolean;
}

/**
 * The two workshop groups are named for what they teach rather than for
 * which evening they were first presented on. "Workshop #1" told a student
 * nothing about whether PID was in it; "Control Fundamentals" does.
 */
export const SECTIONS: ReadonlyArray<SectionMeta> = [
  {
    id: "main",
    title: "Getting Started",
    num: "00",
    blurb:
      "What the workshop is, what you need installed, and the CAD for the mechanisms.",
    collapsible: false,
  },
  {
    id: "workshop1",
    title: "Control Fundamentals",
    num: "01",
    blurb:
      "One motor at a time. Wire it, command it, then close the loop around a sensor.",
    collapsible: true,
  },
  {
    id: "workshop2",
    title: "Drive & Perception",
    num: "02",
    blurb:
      "The whole robot. Swerve, logging, calibration, vision, and driving to a pose.",
    collapsible: true,
  },
  {
    id: "advanced",
    title: "Advanced Topics",
    num: "03",
    blurb: "The other two command dialects, and where each one earns its keep.",
    collapsible: true,
  },
];

/**
 * The flat lesson list. Order here drives prev/next AND sidebar order.
 *
 * The order follows `context/ia-audit.md` §2. The short version of why it
 * looks like this: the mechanism track teaches one command dialect at a
 * time. Basic inline commands first (`/adding-commands`), then composition
 * (`/chaining-commands`) as the dialect everything downstream is written
 * in, and coroutines last, in Advanced Topics, because they are the
 * advanced dialect and only two lessons need them.
 *
 * Every slug here has a real page under `src/app/(workshop)/`. Add the page
 * before you add the entry, or the sidebar links at a route that 404s.
 *
 * `/` is deliberately absent. Home is not a lesson — it is the landing page
 * you arrive on and the thing the rail logo returns you to. Including it made
 * the counter read "30 lessons" when the course is 29, and gave Lesson 01 a
 * Previous link pointing at marketing copy.
 */
export const LESSONS: ReadonlyArray<Lesson> = [
  // ── Getting Started ─────────────────────────────────────────────────
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

  // ── Workshop #1 ─────────────────────────────────────────────────────
  // Bench work first: you verify the hardware turns before you write code
  // that commands it. `/mechanism-setup` used to sit after four code
  // lessons, which contradicted its own opening sentence.
  { slug: "/hardware", title: "Hardware Setup", section: "workshop1" },
  {
    slug: "/mechanism-setup",
    title: "Mechanism Setup",
    shortLabel: "Motor Check",
    section: "workshop1",
  },
  { slug: "/project-setup", title: "Project Setup", section: "workshop1" },
  // Placed here so every example is a real line out of the Arm.java the
  // student cloned one page ago, rather than an invented teaching example.
  {
    slug: "/java-basics",
    title: "The Java You Need",
    shortLabel: "Java Basics",
    section: "workshop1",
  },
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
    title: "Running Your Code",
    shortLabel: "Run Your Code",
    section: "workshop1",
  },
  // Composition, taught the moment there are commands to compose and a
  // simulator to watch them in — and before PID, so everything downstream
  // is written in this dialect.
  {
    slug: "/chaining-commands",
    title: "Chaining Commands",
    shortLabel: "Chaining",
    section: "workshop1",
  },
  { slug: "/pid-control", title: "PID Control", section: "workshop1" },
  { slug: "/motion-magic", title: "Motion Magic", section: "workshop1" },
  // The read side of a mechanism, and the payoff for the deferral made on
  // /chaining-commands: .until(arm::isAtTarget) replaces the fixed timeout.
  {
    slug: "/finish-lines",
    title: "Finish Lines",
    section: "workshop1",
  },

  // ── Workshop #2 ─────────────────────────────────────────────────────
  // Calibrate odometry before anything consumes an absolute field pose,
  // and log before you calibrate — the wheel-radius step reads a log.
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
    slug: "/logging-implementation",
    title: "Logging",
    section: "workshop2",
  },
  {
    slug: "/swerve-calibration",
    title: "Swerve Calibration",
    section: "workshop2",
  },
  {
    slug: "/vision-implementation",
    title: "Vision",
    section: "workshop2",
  },
  // Side branch: `4-DynamicFlywheel` is a dead-end off `3-Limelight`, and
  // nothing downstream inherits it. Skippable without breaking anything.
  {
    slug: "/vision-shooting",
    title: "Dynamic Flywheel Control",
    shortLabel: "Flywheel Control",
    section: "workshop2",
    optional: true,
  },
  { slug: "/drive-to-point", title: "Drive to Point", section: "workshop2" },
  {
    slug: "/advanced-drive-to-point",
    title: "Profiled Drive to Point",
    shortLabel: "Profiled Drive",
    section: "workshop2",
  },
  {
    slug: "/pathplanner",
    title: "Autonomous: Driving to a Pose",
    shortLabel: "Auto Routines",
    section: "workshop2",
  },

  // ── Advanced Topics ─────────────────────────────────────────────────
  // The other two dialects. Everything above this line is chaining.
  // Coroutines first, then the two lessons that need them. /state-based
  // sits in the middle because it and /coroutines are one commit apart on
  // the mechanism track, while /drive-to-tag-inline is on the swerve track
  // — this way the student checks out one track, then the other.
  {
    slug: "/coroutines",
    title: "Coroutines",
    section: "advanced",
  },
  {
    slug: "/state-based",
    title: "State Machines",
    section: "advanced",
  },
  {
    slug: "/drive-to-tag-inline",
    title: "Drive to Tag, Written as a Coroutine",
    shortLabel: "Drive to Tag",
    section: "advanced",
  },
  // Last, and optional. The audit put this in Workshop #1 on the grounds that
  // an assistant is most useful once you can check its answers. True, but it
  // cuts the other way too: a student who meets one at lesson 12 has an easy
  // way to stop writing lesson 12. The worked prompts still run against
  // `2-Commands`, which is the point — you audit the assistant against code
  // you already understand rather than using it to skip understanding.
  {
    slug: "/ai-coding-assistant",
    title: "Coding with an AI Assistant",
    shortLabel: "AI Assistant",
    section: "advanced",
    optional: true,
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
  section: LessonSectionId
): ReadonlyArray<Lesson> {
  return LESSONS.filter((l) => l.section === section);
}

/** Best display label for a lesson — `shortLabel` if set, else `title`. */
export function getSidebarLabel(lesson: Lesson): string {
  return lesson.shortLabel ?? lesson.title;
}

/** How many lessons the course is. Drives the "N / 29 finished" counter. */
export const LESSON_COUNT = LESSONS.length;

/**
 * 1-based position in the course, zero-padded to two digits — the "LESSON 15"
 * kicker and the numbers down the drawer. Returns null for anything not in
 * `LESSONS` (Home, /search, /glossary, /privacy …).
 */
export function getLessonNumber(slug: string): string | null {
  const idx = SLUG_INDEX.get(slug);
  return idx === undefined ? null : String(idx + 1).padStart(2, "0");
}

/** The section a lesson belongs to, for the breadcrumb's middle crumb. */
export function getSectionOf(slug: string): SectionMeta | null {
  const lesson = findLessonBySlug(slug);
  if (!lesson) return null;
  return SECTIONS.find((s) => s.id === lesson.section) ?? null;
}

/**
 * The whole course as section groups, each with its lessons already numbered.
 * The drawer and the syllabus both render straight off this — neither should
 * be re-deriving the numbering, because they have to agree.
 */
export interface LessonGroup extends SectionMeta {
  lessons: ReadonlyArray<Lesson & { num: string }>;
}

export function getLessonGroups(): ReadonlyArray<LessonGroup> {
  return SECTIONS.map((section) => ({
    ...section,
    lessons: LESSONS.filter((l) => l.section === section.id).map((l) => ({
      ...l,
      num: getLessonNumber(l.slug) ?? "",
    })),
  }));
}
