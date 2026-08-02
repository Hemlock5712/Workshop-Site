import PageTemplate from "@/components/PageTemplate";
import LessonSection from "@/components/lesson/LessonSection";
import KeyConceptSection from "@/components/KeyConceptSection";
import Box from "@/components/Box";
import Link from "next/link";
import { getLessonsBySection, type LessonSectionId } from "@/data/lessons";

const headingStyle = {
  fontFamily: "var(--font-serif)",
  color: "var(--fg)",
  letterSpacing: "-0.01em",
} as const;

const bodyStyle = {
  color: "var(--fg-mute)",
} as const;

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
    heading: "Workshop #1 — an arm and a flywheel",
    blurb:
      "Wire it, check it turns, then write the code that drives it. By the end you hold a button and the arm goes to an angle you chose and stops there.",
  },
  {
    id: "workshop2",
    heading: "Workshop #2 — a swerve drive that knows where it is",
    blurb:
      "A drivetrain, a log file, a camera, and a robot that drives itself to a point on the field without a driver touching the sticks.",
  },
  {
    id: "advanced",
    heading: "Advanced Topics — the other way to write commands",
    blurb:
      "Everything above is written in one style. These three pages teach the second one and the two places it earns its keep.",
  },
];

export default function Introduction() {
  const workshop1 = getLessonsBySection("workshop1");
  const workshop2 = getLessonsBySection("workshop2");
  const advanced = getLessonsBySection("advanced");

  return (
    <PageTemplate
      title="A motor that does nothing, then a robot that finds its own way across the field"
      emphasis="finds its own way"
      lede="This site is the written version of Team 5712's programming workshop. You start by making one motor turn. You finish with a swerve drive that drives itself to a spot it located with a camera."
      needs={[
        <>
          <strong>Hardware, for real.</strong> Workshop #1 runs on a Kraken X44
          motor, a ThroughBore encoder (a CANcoder inside), and a CANivore.
          Workshop #2 adds a swerve drivetrain and a Limelight camera. There is
          no version of this course you can do without them — see the note
          below.
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
          start. Workshop #1 stops and teaches you the twelve pieces this site
          uses, at{" "}
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
      <KeyConceptSection
        description={[
          "Nothing here assumes you have written code before. It does assume the hardware is in front of you. Every lesson ends with something you can hear and watch move, which is the whole reason the course is shaped this way.",
        ]}
        concept="Read the pages in order. Each one leaves you with code that runs, and the next one changes that same code."
      />

      <Box variant="alert-info" tag="WHAT YOU'LL BUILD">
        <p className="mt-3">
          <strong>How long:</strong> Workshop #1 is {workshop1.length} lessons,
          Workshop #2 is {workshop2.length}, and Advanced Topics adds{" "}
          {advanced.length}. Every lesson page opens with its own estimate —
          most run 20 to 45 minutes, a few run about an hour. That makes each
          workshop several hours of work. Plan on more than one sitting.
        </p>
      </Box>

      {/* ── hardware is not optional ─────────────────────────────────── */}
      <LessonSection
        id="the-hardware-is-the-course"
        title="The hardware is the course"
      >
        <p className="text-[15px] leading-relaxed" style={bodyStyle}>
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
        <p className="text-[15px] leading-relaxed" style={bodyStyle}>
          Which version of FRC&apos;s libraries you are learning decides whether
          outside help is any use to you. FRC programming changed shape for
          2027, and this site teaches the new shape:
        </p>

        <ul
          className="ml-4 list-disc space-y-2 text-[15px] leading-relaxed"
          style={bodyStyle}
        >
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

        <p className="text-[15px] leading-relaxed" style={bodyStyle}>
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
        <p className="text-[15px] leading-relaxed" style={bodyStyle}>
          The same list lives in the sidebar, and the arrows at the bottom of
          every page walk it in order. Lessons marked <em>optional</em> are side
          trips — skip one and the next lesson still works.
        </p>

        <div className="flex flex-col gap-6">
          {ROADMAP.map((section) => {
            const lessons = getLessonsBySection(section.id);
            return (
              <div key={section.id} className="module" style={{ padding: 24 }}>
                <h3
                  className="mb-2 text-xl font-semibold leading-tight"
                  style={headingStyle}
                >
                  {section.heading}
                </h3>
                <p
                  className="mb-4 text-[14px] leading-relaxed"
                  style={bodyStyle}
                >
                  {section.blurb}
                </p>
                <ol className="grid gap-2 sm:grid-cols-2">
                  {lessons.map((lesson, i) => (
                    <li key={lesson.slug}>
                      <Link
                        href={lesson.slug}
                        className="flex items-baseline gap-3 rounded-md border border-[var(--line-soft)] bg-[var(--bg)] p-3 transition-colors hover:border-[var(--accent)]"
                      >
                        <span
                          className="mono shrink-0"
                          style={{
                            color: "var(--accent)",
                            fontSize: 10.5,
                            letterSpacing: "0.08em",
                          }}
                        >
                          {String(i + 1).padStart(2, "0")}
                        </span>
                        <span
                          className="text-[14px] font-medium"
                          style={{ color: "var(--fg)" }}
                        >
                          {lesson.title}
                          {lesson.optional && (
                            <span
                              className="mono ml-2"
                              style={{
                                color: "var(--fg-mute)",
                                fontSize: 10,
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
          tag="ONE ODD URL"
          title="Autonomous: Driving to a Pose lives at /pathplanner"
        >
          <p>
            That address is left over from an older version of the course. The
            page does not teach PathPlanner, and this stack does not use
            PathPlanner anywhere — autonomous routines drive to a pose with
            CTRE&apos;s own path code, which you build yourself in the two
            lessons before it. The URL stays so links posted to Discord and
            printed on slides keep working.
          </p>
        </Box>
      </LessonSection>

      {/* ── who wrote this ───────────────────────────────────────────── */}
      <LessonSection
        id="who-this-is-for-and-who"
        title="Who this is for, and who made it"
      >
        <p className="text-[15px] leading-relaxed" style={bodyStyle}>
          This is written for FRC students, most of them in middle or high
          school, who have never programmed anything. It is also written for the
          mentor or lead programmer sitting next to them, which is why the pages
          say what the code does rather than only what to type.
        </p>

        <p className="text-[15px] leading-relaxed" style={bodyStyle}>
          Team 5712, Hemlock&apos;s Gray Matter, built this site with help from
          its friends. Two goals shaped it. The first is that you learn the
          patterns good FRC teams already use, instead of inventing your own and
          finding out in week five. The second is that the code holds up at a
          competition — where a match lasts two and a half minutes, nobody can
          reach the robot, and the thing that breaks is never the thing you
          tested.
        </p>

        <p className="text-[15px] leading-relaxed" style={bodyStyle}>
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
