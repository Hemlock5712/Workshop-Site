import PageTemplate from "@/components/PageTemplate";
import { MarginNote, Split } from "@/components/lesson/Prose";
import LessonSection from "@/components/lesson/LessonSection";
import KeyConceptSection from "@/components/KeyConceptSection";
import Box from "@/components/Box";
import Link from "next/link";
import { getLessonsBySection, type LessonSectionId } from "@/data/lessons";

/**
 * The roadmap below is generated from `src/data/lessons.ts`, the same list
 * the sidebar reads. It used to be two hand-typed link columns and it had
 * drifted badly — wrong order, duplicate entries, six missing pages. Do not
 * hand-list lessons here again. Add the lesson to `lessons.ts` and it shows
 * up in both places.
 */
const ROADMAP: ReadonlyArray<{
  id: LessonSectionId;
  heading: string;
  blurb: string;
}> = [
  {
    id: "workshop1",
    heading: "Workshop #1 — Hardware & CTRE",
    blurb:
      "Wire and identify the hardware, then tune PID and Motion Magic entirely in Phoenix Tuner X. No Java yet.",
  },
  {
    id: "workshop2",
    heading: "Workshop #2 — Robot Programming",
    blurb:
      "Learn the Java you need, create the project, and build its Commands v3 structure from Robot.java through mechanisms and logging.",
  },
  {
    id: "workshop3",
    heading: "Workshop #3 — Swerve & Autonomous",
    blurb:
      "Generate and calibrate a swerve drive, design a path, and run it from an autonomous OpMode.",
  },
  {
    id: "workshop4",
    heading: "Workshop #4 — Vision & Navigation",
    blurb:
      "Correct odometry with vision, drive to a pose, profile the motion, and reason about dynamic paths.",
  },
  {
    id: "workshop5",
    heading: "Workshop #5 — Advanced Commands",
    blurb:
      "Build longer behaviors with command composition, finish conditions, coroutines, and state machines.",
  },
];

export default function Introduction() {
  const workshop1 = getLessonsBySection("workshop1");
  const workshop2 = getLessonsBySection("workshop2");
  const workshop3 = getLessonsBySection("workshop3");
  const workshop4 = getLessonsBySection("workshop4");
  const workshop5 = getLessonsBySection("workshop5");

  return (
    <PageTemplate
      title="A motor that does nothing, then a robot that finds its own way across the field"
      emphasis="finds its own way"
      lede="This site is the written version of Team 5712's programming workshop. You start by making one motor turn. You finish with a swerve drive that drives itself to a spot it located with a camera."
      needs={[
        <>
          <strong>Hardware, for real.</strong> Workshop #1 runs on a Kraken X44
          motor, a ThroughBore encoder (a CANcoder inside), and a CANivore.
          Workshop #3 adds a swerve drivetrain, and Workshop #4 adds a Limelight
          camera. There is no version of this course you can do without them —
          see the note below.
        </>,
        <>
          <strong>Software.</strong>{" "}
          <Link href="/prerequisites" className="underline font-medium">
            Prerequisites
          </Link>{" "}
          lists every download you need before lesson one. Install it all first.
          Nothing later stops to wait for you.
        </>,
        <>
          <strong>No Java yet.</strong> You do not need to know a line of it to
          start. Workshop #1 stays entirely inside Tuner X. Workshop #2 begins
          with the twelve pieces of Java this site uses, at{" "}
          <Link href="/java-basics" className="underline font-medium">
            The Java You Need
          </Link>
          , before any lesson asks you to write code. Everything before that
          page is readable without it.
        </>,
        <>
          <strong>A mechanism to program.</strong> An old competition arm or
          shooter works. If you need to build one,{" "}
          <Link href="/mechanism-cad" className="underline font-medium">
            Mechanism CAD
          </Link>{" "}
          has the 3D models and the parts lists for both.
        </>,
      ]}
      time="about an hour"
    >
      <Split>
        <KeyConceptSection
          description={[
            "Nothing here assumes you have written code before. It does assume the hardware is in front of you. Every lesson ends with something you can hear and watch move, which is the whole reason the course is shaped this way.",
          ]}
          concept="Read the pages in order. Each workshop establishes the hardware or software assumptions used by the next one."
        />
        <MarginNote label="HOW LONG">
          The five workshops contain {workshop1.length}, {workshop2.length},{" "}
          {workshop3.length}, {workshop4.length}, and {workshop5.length}{" "}
          lessons. Most lessons run 20 to 45 minutes; a few take about an hour.
          Plan on more than one sitting for the longer workshops.
        </MarginNote>
      </Split>

      {/* ── hardware is not optional ─────────────────────────────────── */}
      <LessonSection
        id="the-hardware-is-the-course"
        title="The hardware is the course"
      >
        <p>
          Read this before you start, not at lesson thirteen. This workshop has
          no software-only path. Later pages talk about running your code in
          &quot;hardware simulation,&quot; and that phrase misleads people: your
          laptop runs the robot program and drives{" "}
          <strong>real motors over a CANivore</strong>. It is not a physics
          model of a robot. Unplug the hardware and there is nothing to watch.
        </p>

        <Box
          variant="alert-warning"
          tag="WATCH OUT"
          title="CTRE hardware, and nothing else"
        >
          <p>
            Every page names the actual device — Kraken, TalonFX, CANcoder,
            CANivore, Phoenix 6. There are no &quot;if you are using a different
            motor controller&quot; branches anywhere on the site, because the
            workshop supplies the hardware and every team following along builds
            the same mechanism. If your shop runs something else, the ideas
            transfer and the code does not.
          </p>
        </Box>
      </LessonSection>

      {/* ── the stack ────────────────────────────────────────────────── */}
      <LessonSection
        id="what-you-are-learning-exactly"
        title="What you are learning, exactly"
      >
        <p>
          Which version of FRC&apos;s libraries you are learning decides whether
          outside help is any use to you. FRC programming changed shape for
          2027, and this site teaches the new shape:
        </p>

        <ul className="ml-4 list-disc space-y-2">
          <li>
            <strong>WPILib 2027 alpha</strong>, with{" "}
            <strong>Commands v3</strong> and <strong>OpModes</strong>.
            Mechanisms, commands, and triggers, with each robot mode written as
            its own class.
          </li>
          <li>
            <strong>Java 25</strong>, in packages that start with{" "}
            <code>org.wpilib</code>.
          </li>
          <li>
            <strong>SystemCore</strong> — the robot controller your code deploys
            to.
          </li>
          <li>
            <strong>CTRE Phoenix 6</strong>, also an alpha release, for every
            motor and sensor.
          </li>
        </ul>

        <p>
          Almost every FRC tutorial you find by searching was written for
          Commands v2. Those pages open a file called{" "}
          <code>RobotContainer</code>, import <code>edu.wpi.first</code>{" "}
          packages, and pick autonomous routines from a dashboard dropdown. None
          of that exists here. When an answer from the internet does not match
          what you see on screen, this is usually why.
        </p>

        <Box
          variant="alert-info"
          tag="NOTE · API STATUS"
          title="Alpha software moves"
        >
          <p>
            Both WPILib 2027 and Phoenix 6 are alpha releases, so an API can
            change between builds.{" "}
            <Link href="/project-setup" className="underline font-medium">
              Project Setup
            </Link>{" "}
            pins the exact versions this site was written against. Match them
            and the code on these pages compiles.
          </p>
        </Box>
      </LessonSection>

      {/* ── the road ─────────────────────────────────────────────────── */}
      <LessonSection id="the-road-ahead" title="The road ahead">
        <p>
          The same list lives in the sidebar, and the arrows at the bottom of
          every page walk it in order. Lessons marked <em>optional</em> are side
          trips — skip one and the next lesson still works.
        </p>

        <div className="flex flex-col gap-6">
          {ROADMAP.map((section) => {
            const lessons = getLessonsBySection(section.id);
            return (
              <div key={section.id} className="module">
                <h3 className="display m-0 mb-2 text-lede">
                  {section.heading}
                </h3>
                <p
                  className="mb-4 max-w-[70ch] text-note"
                  style={{ color: "var(--tx2)" }}
                >
                  {section.blurb}
                </p>
                <ol className="grid gap-2 sm:grid-cols-2">
                  {lessons.map((lesson, i) => (
                    <li key={lesson.slug}>
                      <Link
                        href={lesson.slug}
                        className="flex items-baseline gap-3 rounded-md border border-[var(--rule-soft)] bg-[var(--bg)] p-3 transition-colors hover:border-[var(--accent)]"
                      >
                        <span
                          className="mono shrink-0 text-micro"
                          style={{
                            color: "var(--accent)",
                            letterSpacing: "0.08em",
                          }}
                        >
                          {String(i + 1).padStart(2, "0")}
                        </span>
                        <span
                          className="text-note font-medium"
                          style={{ color: "var(--tx)" }}
                        >
                          {lesson.title}
                          {lesson.optional && (
                            <span
                              className="mono ml-2 text-micro"
                              style={{
                                color: "var(--tx2)",
                                letterSpacing: "0.08em",
                                textTransform: "uppercase",
                              }}
                            >
                              optional
                            </span>
                          )}
                        </span>
                      </Link>
                    </li>
                  ))}
                </ol>
              </div>
            );
          })}
        </div>

        <Box
          variant="alert-info"
          tag="PATHPLANNER · 2027 ALPHA"
          title="Use the editor without importing the old command stack"
        >
          <p>
            Workshop #3 teaches PathPlanner&apos;s route editor and path
            vocabulary. Its published Java integration examples still target
            Commands v2, so the 2027 project does not import those examples. The
            next lesson builds the autonomous lifecycle with Commands v3 and
            OpModes.
          </p>
        </Box>
      </LessonSection>

      {/* ── who wrote this ───────────────────────────────────────────── */}
      <LessonSection
        id="who-this-is-for-and-who"
        title="Who this is for, and who made it"
      >
        <p>
          This is written for FRC students, most of them in middle or high
          school, who have never programmed anything. It is also written for the
          mentor or lead programmer sitting next to them, which is why the pages
          say what the code does rather than only what to type.
        </p>

        <p>
          Team 5712, Hemlock&apos;s Gray Matter, built this site with help from
          its friends. Two goals shaped it. The first is that you learn the
          patterns good FRC teams already use, instead of inventing your own and
          finding out in week five. The second is that the code holds up at a
          competition — where a match lasts two and a half minutes, nobody can
          reach the robot, and the thing that breaks is never the thing you
          tested.
        </p>

        <p>
          Start with{" "}
          <Link href="/prerequisites" className="underline font-medium">
            Prerequisites
          </Link>
          .
        </p>
      </LessonSection>
    </PageTemplate>
  );
}
