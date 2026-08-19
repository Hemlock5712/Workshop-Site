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
          A <strong>Kraken X44</strong>, a <strong>ThroughBore encoder</strong>,
          and a <strong>CANivore</strong>.
        </>,
        <>
          Every download on{" "}
          <Link href="/prerequisites" className="underline font-medium">
            Prerequisites
          </Link>
          , done before the first hardware lesson.
        </>,
        <>
          A mechanism to drive.{" "}
          <Link href="/mechanism-cad" className="underline font-medium">
            Mechanism CAD
          </Link>{" "}
          has models for two.
        </>,
        <>No Java yet. Workshop 1 never leaves Tuner X.</>,
      ]}
      time="8 minutes"
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
        <MarginNote label="How long">
          {WORKSHOP_LESSONS} lessons in {WORKSHOPS.length} workshops. Reading
          one takes about ten minutes. Doing it at the bench takes far longer,
          and nobody finishes a whole workshop in one sitting.
        </MarginNote>
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

        <Box
          variant="alert-warning"
          tag="WATCH OUT"
          title="Simulation still swings the arm"
        >
          <p>
            Nothing about the word simulation makes a mechanism safe. Bolt it
            down before the first lesson and give it room to swing. Keep one
            person on the power switch who is not driving the laptop.
          </p>
        </Box>

        <p>
          Every page names the device it means: Kraken, TalonFX, CANcoder,
          CANivore, Phoenix 6. There are no branches here for a different motor
          controller. The workshop supplies the hardware and every team
          following along builds the same mechanism. If your shop runs something
          else, the ideas carry over and the code does not.
        </p>

        <p>
          The list grows twice. Workshop 3 needs a swerve drivetrain, four
          modules on a frame that drives. Workshop 4 needs a Limelight bolted to
          that frame and reachable on the network. You can read both workshops
          without the parts, but you cannot do them.
        </p>
      </LessonSection>

      {/* ── the stack ────────────────────────────────────────────────── */}
      <LessonSection id="what-you-are-learning-exactly" title="The 2027 stack">
        <Split>
          <ProseBlock>
            <p>
              Which version of WPILib you are learning decides whether outside
              help is any use to you. FRC programming changed shape for 2027,
              and this site teaches the new shape.
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

        <p>
          Almost every FRC tutorial you find by searching was written for
          Commands v2. Those pages open a file called{" "}
          <code>RobotContainer</code>, import <code>edu.wpi.first</code>{" "}
          packages, and pick autonomous routines from a dashboard dropdown. None
          of that exists here. When an answer from the internet does not match
          your screen, that is usually the reason.
        </p>
      </LessonSection>

      {/* ── how to read a lesson ─────────────────────────────────────── */}
      <LessonSection id="how-a-lesson-works" title="Parts of a lesson">
        <p>
          Every page on this site is built the same way. Learn the parts once
          here, instead of puzzling over them on every page that follows.
        </p>

        <FigureGrid
          cols={3}
          items={[
            {
              label: "Top",
              term: "You'll need",
              body: (
                <>
                  Two sentences under the title say what the page does. Beside
                  them sits a list of what must already be true. A line you
                  cannot tick is a reason to go back.
                </>
              ),
            },
            {
              label: "Margin",
              term: "Branch and time",
              body: (
                <>
                  Many lessons name a Workshop-Code branch holding the finished
                  code for that page. The time beside it is a read-through, not
                  a bench session.
                </>
              ),
            },
            {
              label: "Bottom",
              term: "Check your work",
              body: (
                <>
                  The last section of every lesson is a result you can see,
                  hear, or measure. It names what should happen at the bench
                  once the page is done.
                </>
              ),
            },
          ]}
        />

        <p>
          Stop at a failed check. The next lesson assumes the last one worked. A
          wrong CAN ID at lesson five turns into an hour of confusion at lesson
          twelve, and by then nobody suspects the wiring.
        </p>
      </LessonSection>

      {/* ── the road ─────────────────────────────────────────────────── */}
      <LessonSection id="the-road-ahead" title="The road ahead">
        <p>
          Read the pages in order. Each workshop assumes the hardware or the
          code from the one before it. The arrows at the bottom of every page
          walk that list for you.
        </p>

        <p>
          Workshop 1 never opens VS Code. Workshop 2 starts with{" "}
          <Link href="/java-basics" className="underline font-medium">
            Java Basics
          </Link>
          , which covers the language this site uses before any lesson asks you
          to write code. Lessons marked optional are side trips: skip one and
          the next lesson still works.
        </p>

        <div className="flex flex-col gap-6">
          {WORKSHOPS.map((group) => (
            <div key={group.id} className="module">
              <h3 className="display m-0 mb-2 text-lede">
                <span
                  className="mono mr-3 text-micro"
                  style={{ color: "var(--accent)", letterSpacing: "0.08em" }}
                >
                  {group.num}
                </span>
                {group.title}
              </h3>
              <p
                className="mb-4 max-w-[70ch] text-note"
                style={{ color: "var(--tx2)" }}
              >
                {group.blurb}
              </p>
              <ol className="grid gap-2 sm:grid-cols-2">
                {group.lessons.map((lesson) => (
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
                        {lesson.num}
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
          ))}
        </div>
      </LessonSection>

      {/* ── the check ────────────────────────────────────────────────── */}
      <LessonSection id="check-your-work" title="Check your work">
        <p>
          This page has nothing to run. What it has is a shopping list, and the
          course goes badly for anyone who discovers a missing item at lesson
          nine. Work through all four before the next page.
        </p>

        <ol className="ml-5 list-decimal space-y-3">
          <li>
            A <strong>Kraken X44</strong> and a <strong>CANivore</strong>, with
            a USB cable long enough to reach your laptop.
          </li>
          <li>
            A <strong>ThroughBore encoder</strong>. The code calls it a{" "}
            <code>CANcoder</code>, because that is the chip inside it.
          </li>
          <li>
            A mechanism bolted to a bench, powered, with a clear path to swing.
          </li>
          <li>
            A laptop you are allowed to install software on, and a mentor who
            can approve it if you are not.
          </li>
        </ol>

        <Box variant="alert-success" title="You are ready when">
          <p>
            All four lines above are true, and the hardware is in front of you
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
