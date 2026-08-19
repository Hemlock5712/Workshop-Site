import Link from "next/link";
import PageTemplate from "@/components/PageTemplate";
import LessonSection from "@/components/lesson/LessonSection";
import {
  MarginNote,
  Prose,
  ProseBlock,
  Split,
} from "@/components/lesson/Prose";
import GlossaryTerm from "@/components/GlossaryTerm";
import KeyConceptSection from "@/components/KeyConceptSection";
import Box from "@/components/Box";

const linkStyle = "text-[var(--accent)] underline hover:no-underline";

/** Tool name over its one paragraph — the shape of every row in the install list. */
const itemStyle = "measure flex flex-col gap-tight";

export default function Prerequisites() {
  return (
    <PageTemplate
      title="Two lists: what to install, and what to have on the bench"
      emphasis="what to have on the bench"
      lede="The software half goes on your laptop. Set aside an hour for downloads and installers, longer on a slow connection."
      time="About an hour"
    >
      <Prose>
        A checklist, not a lesson. There is no code on it. Work through both
        lists before{" "}
        <Link href="/hardware" className={linkStyle}>
          Hardware Setup
        </Link>
        , which is the first page that asks you to plug something in.
      </Prose>

      <Split>
        <KeyConceptSection
          description={[
            "The hardware half sits in front of you. From Hardware Setup on, every page in Workshop #1 assumes a real motor you can power up and watch turn.",
          ]}
          concept="You need both halves. There is no software-only path through Workshop #1."
        />
        <MarginNote label="WHAT YOU'LL FINISH WITH">
          Every program installed, and an honest answer to whether you have the
          hardware to follow along. About an hour, most of it waiting on
          downloads.
        </MarginNote>
      </Split>

      {/* ── the software list ────────────────────────────────────────── */}
      <LessonSection
        id="what-goes-on-your-laptop"
        title="What goes on your laptop"
      >
        <div className={itemStyle}>
          <h3 className="display m-0 text-aside">
            <a
              href="https://docs.wpilib.org/en/stable/docs/zero-to-robot/step-2/wpilib-setup.html"
              className={linkStyle}
              target="_blank"
              rel="noopener noreferrer"
            >
              WPILib
            </a>{" "}
            &{" "}
            <a
              href="https://www.ni.com/en/support/downloads/drivers/download.frc-game-tools.html#553883"
              className={linkStyle}
              target="_blank"
              rel="noopener noreferrer"
            >
              Game Tools
            </a>
          </h3>
          <p className="prose-body m-0">
            Install <GlossaryTerm term="wpilib">WPILib</GlossaryTerm> VS Code
            and National Instruments Game Tools. On this stack you only need
            Game Tools for the <strong>Driver Station</strong>, the program that
            enables and disables the robot.
          </p>
        </div>

        <div className={itemStyle}>
          <h3 className="display m-0 text-aside">
            <a
              href="https://apps.microsoft.com/detail/9NVV4PWDW27Z"
              className={linkStyle}
              target="_blank"
              rel="noopener noreferrer"
            >
              Phoenix Tuner X
            </a>
          </h3>
          <p className="prose-body m-0">
            You&apos;ll use this to configure and tune{" "}
            <GlossaryTerm term="motor controller">TalonFX</GlossaryTerm> and
            other CTRE hardware.
          </p>
        </div>

        <div className={itemStyle}>
          <h3 className="display m-0 text-aside">
            <a
              href="https://github.com/Mechanical-Advantage/AdvantageScope/releases"
              className={linkStyle}
              target="_blank"
              rel="noopener noreferrer"
            >
              AdvantageScope
            </a>
          </h3>
          <p className="prose-body m-0">
            A viewer for robot logs and data. You&apos;ll need it for debugging
            and tuning. A lite version comes preinstalled with WPILib, but we
            recommend downloading the latest full version from the GitHub
            releases page.
          </p>
        </div>

        <Split>
          <div className={itemStyle}>
            <h3 className="display m-0 text-aside">
              <a
                href="https://git-scm.com/downloads"
                className={linkStyle}
                target="_blank"
                rel="noopener noreferrer"
              >
                Git
              </a>
            </h3>
            <p className="prose-body m-0">Use Git for version control.</p>
          </div>
          <MarginNote label="COMMIT MESSAGES">
            Summarize changes clearly (e.g., &apos;Add drivetrain PID tuning
            logic&apos;).
          </MarginNote>
        </Split>

        <div className={itemStyle}>
          <h3 className="display m-0 text-aside">
            <a
              href="https://github.com/Gold872/elastic-dashboard"
              className={linkStyle}
              target="_blank"
              rel="noopener noreferrer"
            >
              Elastic Dashboard
            </a>{" "}
            <span className="text-note text-[var(--tx3)]">
              (optional for Workshop #1)
            </span>
          </h3>
          <p className="prose-body m-0">
            A dashboard shows live values while the robot runs — whatever your
            code publishes to NetworkTables, WPILib&apos;s shared table of live
            data. Workshop #1 does not need one; the bench work happens entirely
            in Tuner X. Install it when you reach{" "}
            <Link href="/logging-implementation" className={linkStyle}>
              Logging
            </Link>{" "}
            in Workshop #2.
          </p>
        </div>

        <Box
          variant="alert-info"
          title="A dashboard does not pick which mode runs"
        >
          <p>
            On older FRC code, a dashboard held a drop-down that chose the
            autonomous routine. This stack has no such chooser. Each mode is its
            own class with a name in its annotation —{" "}
            <code>@Teleop(name = &quot;Teleop&quot;)</code>,{" "}
            <code>@Autonomous(name = &quot;Drive To Pose&quot;)</code> — and
            those names are what the driver sees on the Driver Station. The
            driver picks one there, and that is the only one the robot builds.
          </p>
        </Box>
      </LessonSection>

      {/* ── the stack, which is not a download ───────────────────────── */}
      <LessonSection
        id="the-2027-alpha-stack"
        title="The stack underneath: WPILib 2027 alpha"
      >
        <ProseBlock>
          <p>
            This workshop runs on the WPILib <strong>2027 alpha</strong>, an
            early-release version of FRC&apos;s programming toolkit. It uses{" "}
            <strong>Java 25</strong> and deploys to <strong>SystemCore</strong>,
            the robot&apos;s onboard computer.
          </p>
          <p>
            Start from the team&apos;s{" "}
            <a
              href="https://github.com/Hemlock5712/2027-Template"
              className={linkStyle}
              target="_blank"
              rel="noopener noreferrer"
            >
              2027-Template
            </a>
            , a ready-made robot project you copy. You clone it on{" "}
            <Link href="/project-setup" className={linkStyle}>
              Project Setup
            </Link>
            , so there is nothing to download yet.
          </p>
        </ProseBlock>

        <Box
          variant="alert-warning"
          tag="WATCH OUT · BRANCH"
          title={
            <>
              Pick the <code>2027-dev</code> branch
            </>
          }
        >
          <p>
            A branch is one version of the code, and <code>main</code> is still
            last season&apos;s. The one you want is <code>2027-dev</code>.
          </p>
        </Box>
      </LessonSection>

      {/* ── java ─────────────────────────────────────────────────────── */}
      <LessonSection
        id="java-nothing-to-install"
        title="Java — nothing to install, and nothing to learn first"
      >
        <ProseBlock>
          <p>
            You do not need to know Java before you start. You do need to read
            it. Robot code on this site is Java from the first lesson that has
            code in it, and it does not stay at the beginner end for long —
            lambdas, method references, and class declarations all show up in
            Workshop #2.
          </p>
          <p>
            So the workshop teaches the Java it uses, in one lesson.{" "}
            <Link href="/java-basics" className={linkStyle}>
              The Java You Need
            </Link>{" "}
            is the first lesson in Workshop #2, before Project Setup, and it
            takes one future robot file apart line by line. About twelve pieces
            of Java hold up this whole site, and that page covers all twelve and
            then stops.
          </p>
          <p>
            Do not go take a Java course first. Read{" "}
            <Link href="/java-basics" className={linkStyle}>
              that page
            </Link>{" "}
            when you get to it.
          </p>
        </ProseBlock>
      </LessonSection>

      {/* ── why the bench is not optional ────────────────────────────── */}
      <LessonSection
        id="a-bench-workshop"
        title="Workshop #1 is a bench workshop"
      >
        <Prose>
          You identify each motor and check which way it turns on{" "}
          <Link href="/mechanism-setup" className={linkStyle}>
            Motor Setup &amp; CAN IDs
          </Link>
          , then tune PID and Motion Magic against how it actually behaves on{" "}
          <Link href="/pid-control" className={linkStyle}>
            PID Control
          </Link>
          . None of that works without the hardware in front of you.
        </Prose>

        <Box
          variant="alert-warning"
          tag="READ THIS FIRST"
          title="Tuner X is the only controller in Workshop #1"
        >
          <p>
            Workshop #1 does not create, build, or run a robot project. Phoenix
            Tuner X owns the CANivore, sends each control request, and plots the
            response from the real motor and sensor.
          </p>
          <p className="mt-3">
            There is no software-only path through Workshop #1. Without a motor
            on the bench, nothing moves and there is nothing to tune. Java and
            hardware simulation begin only after the control behavior has been
            verified in Tuner X.
          </p>
        </Box>
      </LessonSection>

      {/* ── the bench list ──────────────────────────────────────────── */}
      <LessonSection
        id="the-minimum-to-follow"
        title="The minimum to follow Workshop #1"
      >
        <ul className="list-disc space-y-control">
          <li>
            <strong>The assembled mechanism.</strong> The arm or the flywheel
            from{" "}
            <Link href="/mechanism-cad" className={linkStyle}>
              Mechanism CAD
            </Link>
            , built and wired. Its bill of materials is the exact parts list,
            down to the battery cable and the CAN terminating resistor. An
            existing mechanism off an old robot works too, as long as it runs on
            the hardware below.
          </li>
          <li>
            <strong>A Kraken X44.</strong> The motor Tuner X controls, with its{" "}
            <GlossaryTerm term="motor controller">TalonFX</GlossaryTerm>{" "}
            controller built into the case, so there is no separate controller
            to wire.
          </li>
          <li>
            <strong>{"A CANcoder. "}</strong> The WCP ThroughBore encoder is a
            CANcoder inside, which is why the code calls it one. It reports the
            arm&apos;s real angle and remembers that angle after a power cycle.
            The arm build uses one; the flywheel build does not.
          </li>
          <li>
            <strong>A CANivore.</strong> Plugs into a USB port on your laptop
            and runs the CAN bus that the motor and encoder sit on. This is the
            connection Tuner X uses to reach the bench hardware in Workshop #1.
            Name yours <code>canivore</code> so the same hardware handoff can be
            used when robot programming begins in Workshop #2.
          </li>
          <li>
            <strong>A charged battery and its cable.</strong> A fresh one gives
            about 12 V. Bench tests on{" "}
            <Link href="/mechanism-setup" className={linkStyle}>
              Mechanism Setup
            </Link>{" "}
            run at 6 V, but the motor still needs a real battery behind it.
          </li>
        </ul>

        <Box variant="alert-tip" title="What you do not need">
          <p>
            No SystemCore, no radio, no robot. Workshop #1 runs from a laptop, a
            CANivore, and one mechanism on a table. Workshop #2 adds an
            Xbox-style controller for robot programming; Workshop #3 moves to a
            swerve drivetrain.
          </p>
        </Box>
      </LessonSection>

      {/* ── the handoff ─────────────────────────────────────────────── */}
      <LessonSection id="ready-to-start" title="Ready to start?">
        <Prose>
          Software installed, mechanism on the bench, battery charged. Next is{" "}
          <Link href="/hardware" className={linkStyle}>
            Hardware Setup
          </Link>
          , where you plug the CANivore in and find every device in Tuner X.
        </Prose>
      </LessonSection>
    </PageTemplate>
  );
}
