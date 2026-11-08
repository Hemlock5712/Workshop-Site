import PageTemplate from "@/components/PageTemplate";
import { MarginNote, ProseBlock, Split } from "@/components/lesson/Prose";
import LessonSection from "@/components/lesson/LessonSection";
import FigureGrid from "@/components/lesson/FigureGrid";
import Box from "@/components/Box";
import Link from "next/link";
import { getLessonGroups } from "@/data/lessons";
import { lessonMetadata } from "@/lib/lessonMetadata";

export const metadata = lessonMetadata("/introduction");

/**
 * The roadmap is read straight off `src/data/lessons.ts`: group number, group
 * title, group blurb, lesson order, lesson numbers, optional flags. There is
 * no local copy of any of it.
 *
 * There used to be a `ROADMAP` const here holding hand-typed headings and
 * blurbs beside the derived lesson lists, which meant `SECTIONS` in
 * `lessons.ts` and this file said two different things about the same five
 * workshops. Add or rename a workshop in `lessons.ts` and this page follows.
 */
const WORKSHOPS = getLessonGroups().filter((group) => group.id !== "main");

/**
 * Counted off `WORKSHOPS`, not off `LESSON_COUNT`. `LESSON_COUNT` is every
 * lesson including the three Getting Started pages, which the roadmap below
 * does not list, so quoting it here printed a total the page then failed to
 * show.
 */
const WORKSHOP_LESSONS = WORKSHOPS.reduce(
  (total, group) => total + group.lessons.length,
  0
);

export default function Introduction() {
  return (
    <PageTemplate
      title="Workshop Overview"
      lede="This site is a written version of Team 5712's programming workshops. It starts with a simple mechanism, a flywheel or an arm, and works up to a swerve drive. To keep things simple, it covers CTRE mechanisms and swerve drives only."
      needs={[
        <>
          Every download on{" "}
          <Link href="/prerequisites" className="underline font-medium">
            Prerequisites
          </Link>
          , done before the first hardware lesson.
        </>,
        <>
          A mechanism to run.{" "}
          <Link href="/mechanism-cad" className="underline font-medium">
            Mechanism CAD
          </Link>{" "}
          has models for two.
        </>,
      ]}
      time="4 minutes"
    >
      <Split>
        <ProseBlock>
          <p>
            Nothing here assumes you have written code before. It does assume
            you have a mechanism to run.
          </p>
          <p>
            Team 5712, Hemlock&apos;s Gray Matter, wrote this workshop and still
            teaches it in a room. These pages are the same material in the same
            order, so a team can work through it without us.
          </p>
        </ProseBlock>
      </Split>

      {/* ── hardware is not optional ─────────────────────────────────── */}
      <LessonSection id="the-hardware-is-the-course" title="Required hardware">
        <p>
          There is no software-only path through this workshop. Later lessons
          talk about running your code in &quot;hardware simulation,&quot; and
          the phrase misleads people. Your laptop stands in for the robot
          controller. The motors are real, the CAN bus is real, and the arm on
          the bench is the arm that moves.
        </p>

        <p>
          This workshop is written for those exact devices, and there are no
          alternative instructions for other motor controllers. If you have
          different hardware in your shop, you can still learn the concepts, but
          the code examples will not work out of the box.
        </p>
      </LessonSection>

      {/* ── the stack ────────────────────────────────────────────────── */}
      <LessonSection id="what-you-are-learning-exactly" title="The 2027 stack">
        <Split>
          <ProseBlock>
            <p>
              For the 2027 season, WPILib introduced Commands v3, a new
              programming style which changes how you write code. We&rsquo;re
              going over Commands v3 in this workshop, not the old system. When
              you move to a robot, use a SystemCore. A roboRIO cannot run
              Commands v3.
            </p>
          </ProseBlock>
          <MarginNote label="Alpha">
            WPILib 2027 and Phoenix 6 are both alpha releases, so an API can
            move between builds.{" "}
            <Link href="/project-setup" className="underline">
              Project Setup
            </Link>{" "}
            pins the exact versions these pages were written against.
          </MarginNote>
        </Split>

        <FigureGrid
          cols={2}
          items={[
            {
              label: "Library",
              term: "WPILib 2027 alpha",
              body: (
                <>
                  Commands v3 and OpModes. Each robot mode is its own class, and
                  each mechanism hands out the commands that drive it.
                </>
              ),
            },
            {
              label: "Language",
              term: "Java 25",
              body: (
                <>
                  Packages start with <code>org.wpilib</code>. An example that
                  says <code>edu.wpi.first</code> was written for an older year.
                </>
              ),
            },
            {
              label: "Controller",
              term: "SystemCore",
              body: (
                <>
                  The board your code deploys to. Setup instructions written for
                  a roboRIO do not apply.
                </>
              ),
            },
            {
              label: "Vendor",
              term: "Phoenix 6 alpha",
              body: (
                <>
                  CTRE&apos;s library. It drives every motor and sensor you
                  touch.
                </>
              ),
            },
          ]}
        />

        <Box variant="alert-warning" title="v2 and v3 don't mix">
          Many FRC tutorials are written for Commands v2. Commands v2 and
          Commands v3 cannot be mixed in one project.
        </Box>
      </LessonSection>

      {/* ── the road ─────────────────────────────────────────────────── */}
      <LessonSection id="the-road-ahead" title="The road ahead">
        <p>
          Read the pages in order. The workshops build on each other, and each
          one assumes the hardware or the code from the one before it.
        </p>
      </LessonSection>

      {/* ── the check ────────────────────────────────────────────────── */}
      <LessonSection id="check-your-work" title="Check your work">
        <p>
          You won&apos;t be running any code on this page, but you will need to
          gather a few things before moving forward. Make sure you have
          everything in the list below.
        </p>

        <ol className="ml-5 list-decimal space-y-3">
          <li>A mechanism on a bench, powered, with plenty of room to run.</li>
          <li>A laptop you are allowed to install software on.</li>
        </ol>

        <Box variant="alert-success" title="You are ready when">
          <p>
            Both lines above are true, and the hardware is in front of you
            rather than on a purchase order.
          </p>
        </Box>

        <p>
          Next is{" "}
          <Link href="/prerequisites" className="underline font-medium">
            Prerequisites
          </Link>
          , which is every download and account you need before the hardware
          gets plugged in.
        </p>
      </LessonSection>
    </PageTemplate>
  );
}
