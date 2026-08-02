import Link from "next/link";
import PageTemplate from "@/components/PageTemplate";
import ContentCard from "@/components/ContentCard";
import GlossaryTerm from "@/components/GlossaryTerm";
import KeyConceptSection from "@/components/KeyConceptSection";
import Box from "@/components/Box";
import { ClipboardCheck, Cpu } from "lucide-react";

const linkStyle =
  "text-[var(--accent)] underline hover:no-underline text-[var(--accent)]";

export default function Prerequisites() {
  return (
    <PageTemplate
      title="Two lists: what to install, and what to have on the bench"
      emphasis="what to have on the bench"
      lede="The software half goes on your laptop. Set aside an hour for downloads and installers, longer on a slow connection."
      time="About an hour"
    >
      <KeyConceptSection
        description={[
          "The hardware half sits in front of you. From Hardware Setup on, every page in Workshop #1 assumes a real motor you can power up and watch turn.",
        ]}
        concept="You need both halves. There is no software-only path through Workshop #1."
      />

      <Box
        variant="alert-info"
        tag="BEFORE YOU START"
        title="What this page is"
      >
        <p>
          A checklist, not a lesson. There is no code on it. Work through both
          lists before{" "}
          <Link href="/hardware" className={linkStyle}>
            Hardware Setup
          </Link>
          , which is the first page that asks you to plug something in.
        </p>
        <p className="mt-3">
          <strong>What you&apos;ll finish with:</strong> every program
          installed, and an honest answer to whether you have the hardware to
          follow along. <strong>About an hour</strong>, most of it waiting on
          downloads.
        </p>
      </Box>

      <div className="grid gap-6">
        {/* Software Requirements */}
        <ContentCard>
          <h2 className="display measure-wide m-0 mb-4 flex items-center gap-3">
            <ClipboardCheck className="w-8 h-8 text-[var(--accent)]" />
            Software Requirements
          </h2>

          <div className="space-y-6">
            <div className="border-l-4 border-[var(--accent)] pl-4">
              <h3 className="text-lg font-semibold text-[var(--tx)]">
                <a
                  href="https://docs.wpilib.org/en/stable/docs/zero-to-robot/step-2/wpilib-setup.html"
                  className="text-[var(--accent)] underline hover:no-underline"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  WPILib
                </a>{" "}
                &{" "}
                <a
                  href="https://www.ni.com/en/support/downloads/drivers/download.frc-game-tools.html#553883"
                  className="text-[var(--accent)] underline hover:no-underline"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  Game Tools
                </a>
              </h3>
              <p className="text-[var(--tx2)] mt-2">
                Install <GlossaryTerm term="wpilib">WPILib</GlossaryTerm> VS
                Code and National Instruments Game Tools. On this stack you only
                need Game Tools for the <strong>Driver Station</strong>, the
                program that enables and disables the robot.
              </p>
            </div>

            <div className="border-l-4 border-[var(--accent)] pl-4">
              <h3 className="text-lg font-semibold text-[var(--tx)]">
                <a
                  href="https://apps.microsoft.com/detail/9NVV4PWDW27Z"
                  className="text-[var(--accent)] underline hover:no-underline"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  Phoenix Tuner X
                </a>
              </h3>
              <p className="text-[var(--tx2)] mt-2">
                You&apos;ll use this to configure and tune{" "}
                <GlossaryTerm term="motor controller">TalonFX</GlossaryTerm> and
                other CTRE hardware.
              </p>
            </div>

            <div className="border-l-4 border-[var(--accent)] pl-4">
              <h3 className="text-lg font-semibold text-[var(--tx)]">
                <a
                  href="https://github.com/Mechanical-Advantage/AdvantageScope/releases"
                  className="text-[var(--accent)] underline hover:no-underline"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  AdvantageScope
                </a>
              </h3>
              <p className="text-[var(--tx2)] mt-2">
                A viewer for robot logs and data. You&apos;ll need it for
                debugging and tuning. A lite version comes preinstalled with
                WPILib, but we recommend downloading the latest full version
                from the GitHub releases page.
              </p>
            </div>

            <div className="border-l-4 border-[var(--ok)] pl-4">
              <h3 className="text-lg font-semibold text-[var(--tx)]">
                <a
                  href="https://git-scm.com/downloads"
                  className="text-[var(--ok)] underline hover:no-underline"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  Git
                </a>
              </h3>
              <p className="text-[var(--tx2)] mt-2">
                Use Git for version control. Summarize changes clearly (e.g.,
                &apos;Add drivetrain PID tuning logic&apos;).
              </p>
            </div>

            <div className="border-l-4 border-[var(--accent)] pl-4">
              <h3 className="text-lg font-semibold text-[var(--tx)]">
                <a
                  href="https://github.com/Hemlock5712/2027-Template"
                  className="text-[var(--accent)] underline hover:no-underline"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  WPILib 2027 Alpha stack (2027-Template)
                </a>
              </h3>
              <p className="text-[var(--tx2)] mt-2">
                This workshop runs on the WPILib <strong>2027 alpha</strong>, an
                early-release version of FRC&apos;s programming toolkit. It uses{" "}
                <strong>Java 25</strong> and deploys to{" "}
                <strong>SystemCore</strong>, the robot&apos;s onboard computer.
                Start from the team&apos;s 2027-Template, a ready-made robot
                project you copy. One catch: pick the <code>2027-dev</code>{" "}
                branch (a branch is one version of the code; <code>main</code>{" "}
                is still last season&apos;s). You clone it on{" "}
                <Link href="/project-setup" className={linkStyle}>
                  Project Setup
                </Link>
                , so there is nothing to download yet.
              </p>
            </div>

            <div className="border-l-4 border-[var(--err)] pl-4">
              <h3 className="text-lg font-semibold text-[var(--tx)]">
                <a
                  href="https://github.com/Gold872/elastic-dashboard"
                  className="text-[var(--err)] underline hover:no-underline"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  Elastic Dashboard
                </a>{" "}
                <span className="text-sm font-normal text-[var(--tx2)]">
                  (optional for Workshop #1)
                </span>
              </h3>
              <p className="text-[var(--tx2)] mt-2">
                A dashboard shows live values while the robot runs — whatever
                your code publishes to NetworkTables, WPILib&apos;s shared table
                of live data. Workshop #1 does not need one; the bench work
                happens in Tuner X and the simulator. Install it when you reach{" "}
                <Link href="/logging-implementation" className={linkStyle}>
                  Logging
                </Link>{" "}
                in Workshop #2.
              </p>
              <Box
                variant="alert-info"
                title="A dashboard does not pick which mode runs"
              >
                <p>
                  On older FRC code, a dashboard held a drop-down that chose the
                  autonomous routine. This stack has no such chooser. Each mode
                  is its own class with a name in its annotation —{" "}
                  <code>@Teleop(name = &quot;Teleop&quot;)</code>,{" "}
                  <code>@Autonomous(name = &quot;Drive To Pose&quot;)</code> —
                  and those names are what the driver sees on the Driver
                  Station. The driver picks one there, and that is the only one
                  the robot builds.
                </p>
              </Box>
            </div>

            <div className="border-l-4 border-[var(--accent)] pl-4">
              <h3 className="text-lg font-semibold text-[var(--tx)]">
                <Link
                  href="/java-basics"
                  className="text-[var(--accent)] underline hover:no-underline"
                >
                  Java — nothing to install, and nothing to learn first
                </Link>
              </h3>
              <p className="text-[var(--tx2)] mt-2">
                You do not need to know Java before you start. You do need to
                read it. Robot code on this site is Java from the first lesson
                that has code in it, and it does not stay at the beginner end
                for long — lambdas, method references, and class declarations
                all show up in Workshop #1.
              </p>
              <p className="text-[var(--tx2)] mt-2">
                So the workshop teaches the Java it uses, in one lesson.{" "}
                <Link href="/java-basics" className={linkStyle}>
                  The Java You Need
                </Link>{" "}
                comes right after you clone the project, and it takes one real
                robot file — the arm you are about to build — apart line by
                line. About twelve pieces of Java hold up this whole site, and
                that page covers all twelve and then stops.
              </p>
              <p className="text-[var(--tx2)] mt-2">
                Do not go take a Java course first. Read that page when you get
                to it.
              </p>
            </div>
          </div>
        </ContentCard>

        {/* Hardware Requirements */}
        <ContentCard>
          <h2 className="display measure-wide m-0 mb-4 flex items-center gap-3">
            <Cpu className="w-8 h-8 text-[var(--accent)]" />
            Hardware Requirements
          </h2>

          <p className="text-[var(--tx2)]">
            Workshop #1 is a bench workshop. You check which way a motor turns
            on{" "}
            <Link href="/mechanism-setup" className={linkStyle}>
              Mechanism Setup
            </Link>
            , you watch it move under your own code on{" "}
            <Link href="/running-program" className={linkStyle}>
              Running Your Code
            </Link>
            , and you tune it against how it actually behaves on{" "}
            <Link href="/pid-control" className={linkStyle}>
              PID Control
            </Link>
            . None of that works without the hardware in front of you.
          </p>

          <Box
            variant="alert-warning"
            tag="READ THIS FIRST"
            title="Hardware simulation is not a physics simulation"
          >
            <p>
              Workshop #1 runs your code through something WPILib calls Hardware
              Simulation, and the name misleads people. What is simulated is the
              robot controller: your code runs on your laptop instead of on a
              SystemCore. The motor commands are real. They go out over the
              CANivore to an actual Kraken, which actually spins.
            </p>
            <p className="mt-3">
              There is no software-only path through Workshop #1. Without a
              motor on the bench, nothing moves, and there is nothing to tune.
              Better you know that here than at{" "}
              <Link href="/running-program" className="underline">
                Running Your Code
              </Link>
              , ten lessons later.
            </p>
          </Box>

          <h3 className="text-lg font-semibold text-[var(--tx)] mt-6">
            The minimum to follow Workshop #1
          </h3>
          <ul className="ml-4 mt-3 list-disc space-y-3 text-[var(--tx2)]">
            <li>
              <strong>The assembled mechanism.</strong> The arm or the flywheel
              from{" "}
              <Link href="/mechanism-cad" className={linkStyle}>
                Mechanism CAD
              </Link>
              , built and wired. Its bill of materials is the exact parts list,
              down to the battery cable and the CAN terminating resistor. An
              existing mechanism off an old robot works too, as long as it runs
              on the hardware below.
            </li>
            <li>
              <strong>A Kraken X44.</strong> The motor your code commands, with
              its <GlossaryTerm term="motor controller">TalonFX</GlossaryTerm>{" "}
              controller built into the case, so there is no separate controller
              to wire.
            </li>
            <li>
              <strong>A CANcoder.</strong> The WCP ThroughBore encoder is a
              CANcoder inside, which is why the code calls it one. It reports
              the arm&apos;s real angle and remembers that angle after a power
              cycle. The arm build uses one; the flywheel build does not.
            </li>
            <li>
              <strong>A CANivore.</strong> Plugs into a USB port on your laptop
              and runs the CAN bus that the motor and encoder sit on. This is
              the part that stands in for a robot controller all through
              Workshop #1. Name yours <code>canivore</code> — the mechanism code
              on every Workshop #1 branch looks for that exact name.
            </li>
            <li>
              <strong>A charged battery and its cable.</strong> A fresh one
              gives about 12 V. Bench tests on{" "}
              <Link href="/mechanism-setup" className={linkStyle}>
                Mechanism Setup
              </Link>{" "}
              run at 6 V, but the motor still needs a real battery behind it.
            </li>
            <li>
              <strong>An Xbox-style controller</strong>, plugged into the same
              laptop. Every button binding in Workshop #1 is written against the
              first controller on the driver station.
            </li>
          </ul>

          <Box variant="alert-tip" title="What you do not need">
            <p>
              No SystemCore, no radio, no robot. Workshop #1 runs from a laptop,
              a CANivore, and one mechanism on a table. Workshop #2 moves to a
              swerve drivetrain, which is a different pile of hardware.
            </p>
          </Box>
        </ContentCard>
      </div>

      <div className="bg-[var(--bg2)] border border-[var(--accent)] rounded-lg p-6 mb-8">
        <h3 className="text-lg font-semibold text-[var(--accent)] mb-2">
          Ready to Start?
        </h3>
        <p className="text-[var(--accent)]">
          Software installed, mechanism on the bench, battery charged. Next is{" "}
          <Link
            href="/hardware"
            className="underline hover:no-underline font-semibold"
          >
            Hardware Setup
          </Link>
          , where you plug the CANivore in and find every device in Tuner X.
        </p>
      </div>
    </PageTemplate>
  );
}
