import PageTemplate from "@/components/PageTemplate";
import { MarginNote, ProseBlock, Split } from "@/components/lesson/Prose";
import LessonSection from "@/components/lesson/LessonSection";
import FigureGrid from "@/components/lesson/FigureGrid";
import Box from "@/components/Box";
import Link from "next/link";
import { getLessonGroups } from "@/data/lessons";

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
      lede="This site is the written version of Team 5712's programming workshop. It starts with one motor on a bench and ends with a swerve drive that finds its own way to a target. Every lesson runs on real CTRE hardware."
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
      time="5 minutes"
    >
      <Split>
        <ProseBlock>
          <p>
            Nothing here assumes you have written code before. It does assume a
            mechanism is sitting in front of you, and that someone nearby can
            cut power to it.
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
          Each lesson clearly states which hardware it uses: Kraken, TalonFX,
          CANcoder, CANivore, and Phoenix 6. This workshop is written for those
          exact devices, and there are no alternative instructions for other
          motor controllers. Everyone works with the same hardware, building the
          same mechanism. If you have different hardware in your shop, you can
          still learn the concepts, but the code examples will not work out of
          the box.
        </p>
      </LessonSection>

      {/* ── the stack ────────────────────────────────────────────────── */}
      <LessonSection id="what-you-are-learning-exactly" title="The 2027 stack">
        <Split>
          <ProseBlock>
            <p>
              For the 2027 season, WPILib introduced Commands v3, a new
              programming style which changes how you write code. We're going
              over Commands v3 in this workshop, not the old system.
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
                  CTRE&apos;s library, and the only vendor library in the
                  course. It drives every motor and sensor you touch.
                </>
              ),
            },
          ]}
        />

        <Box variant="alert-warning" title="Old tutorials won't work">
          Almost every FRC tutorial you find by searching was written for
          Commands v2. Those pages open a file called{" "}
          <code>RobotContainer</code>, import <code>edu.wpi.first</code>{" "}
          packages, and pick autonomous routines from a dashboard dropdown. None
          of that exists here. When an answer from the internet does not match
          your screen, that is usually the reason.
        </Box>
      </LessonSection>

      {/* ── the road ─────────────────────────────────────────────────── */}
      <LessonSection id="the-road-ahead" title="The road ahead">
        <p>
          Read the pages in order. Each workshop assumes the hardware or the
          code from the one before it. The arrows at the bottom of every page
          walk that list for you.
        </p>
      </LessonSection>

      {/* ── the check ────────────────────────────────────────────────── */}
      <LessonSection id="check-your-work" title="Check your work">
        <p>
          You won&apos;t be running any code on this page, but you will need to
          gather a few things before moving forward. Make sure you have
          everything in the list below. Missing even one causes trouble later in
          the workshop.
        </p>

        <ol className="ml-5 list-decimal space-y-3">
          <li>A mechanism on a bench, powered, with a clear path to swing.</li>
          <li>
            A laptop you are allowed to install software on, and a mentor who
            can approve it if you are not.
          </li>
        </ol>

        <Box variant="alert-success" title="You are ready when">
          <p>
            Both lines above are true, and the hardware is in front of you
            rather than on a purchase order. Nothing on that list gets easier to
            find later in the course.
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
