import Link from "next/link";
import PageTemplate from "@/components/PageTemplate";
import LessonSection from "@/components/lesson/LessonSection";
import { MarginNote, ProseBlock, Split } from "@/components/lesson/Prose";
import GlossaryTerm from "@/components/GlossaryTerm";
import Box from "@/components/Box";

const linkStyle = "text-[var(--accent)] underline hover:no-underline";

export default function Prerequisites() {
  return (
    <PageTemplate
      title="Prerequisites"
      lede="The software half goes on your laptop. The hardware half sits on the bench in front of you."
      needs={[
        <>A laptop you can install software on.</>,
        <>About half an hour, most of it waiting on downloads.</>,
        <>
          The arm or flywheel from <strong>Mechanism CAD</strong>, built and
          wired.
        </>,
      ]}
      time="About half an hour"
    >
      <Split>
        <ProseBlock>
          <p>
            Work through both lists before{" "}
            <Link href="/hardware" className={linkStyle}>
              Hardware Setup
            </Link>
            , the first page that asks you to plug something in. Nothing here is
            hard. It is a long wait on installers.
          </p>
        </ProseBlock>
      </Split>

      <LessonSection id="what-to-install" title="What to install">
        <p>
          Five programs, plus one you can skip until Workshop 2. Nothing here
          depends on anything else being installed first. One rule: never
          install Java on its own, because WPILib brings the version this
          workshop runs on.
        </p>
        <ol className="ml-5 list-decimal space-y-3">
          <li>
            <a
              href="https://github.com/wpilibsuite/allwpilib/releases"
              className={linkStyle}
              target="_blank"
              rel="noopener noreferrer"
            >
              <strong>
                <GlossaryTerm term="wpilib">WPILib</GlossaryTerm> 2027 alpha 6
              </strong>
            </a>
            . Take <code>v2027.0.0-alpha-6</code> from the releases page, not
            the install guide. The guide still points at last season, because
            nothing about 2027 is official yet. The installer lays down a
            separate copy of VS Code and a Java 25 runtime of its own.
          </li>
          <li>
            <a
              href="https://github.com/wpilibsuite/FirstDriverStation-Public/releases"
              className={linkStyle}
              target="_blank"
              rel="noopener noreferrer"
            >
              <strong>FRC Driver Station</strong>
            </a>
            . This is the new Driver Station tool, which replaces the old Game
            Tools download.
          </li>
          <li>
            <a
              href="https://apps.microsoft.com/detail/9NVV4PWDW27Z"
              className={linkStyle}
              target="_blank"
              rel="noopener noreferrer"
            >
              <strong>Phoenix Tuner X</strong>
            </a>
            . From the Microsoft Store, so it keeps itself current. Tuner X
            configures and tunes{" "}
            <GlossaryTerm term="motor controller">TalonFX</GlossaryTerm> and the
            rest of the CTRE hardware, and all of Workshop 1 happens inside it.
          </li>
          <li>
            <a
              href="https://github.com/Mechanical-Advantage/AdvantageScope/releases"
              className={linkStyle}
              target="_blank"
              rel="noopener noreferrer"
            >
              <strong>AdvantageScope</strong>
            </a>
            . A cut-down copy already came with WPILib. Install the full release
            from GitHub as well. It reads robot logs, and Workshop 2 leans on
            the plots.
          </li>
          <li>
            <a
              href="https://git-scm.com/downloads"
              className={linkStyle}
              target="_blank"
              rel="noopener noreferrer"
            >
              <strong>Git</strong>
            </a>
            . Any current version. Workshop 2 generates its own project rather
            than cloning one. The lesson repositories after it are clones, and
            every change you make is a commit.
          </li>
          <li>
            <a
              href="https://github.com/Gold872/elastic-dashboard"
              className={linkStyle}
              target="_blank"
              rel="noopener noreferrer"
            >
              <strong>Elastic Dashboard</strong>
            </a>{" "}
            <span className="text-note text-[var(--tx3)]">(optional)</span>.
            Skip it for now. A dashboard reads NetworkTables, WPILib&apos;s
            shared table of live robot values, and Workshop 1 runs no robot
            code. Install it when you reach{" "}
            <Link href="/logging-implementation" className={linkStyle}>
              Logging
            </Link>{" "}
            in Workshop 2.
          </li>
        </ol>
      </LessonSection>

      <LessonSection id="the-2027-alpha-stack" title="The 2027 alpha stack">
        <Split>
          <ProseBlock>
            <p>
              This workshop runs on the WPILib{" "}
              <strong>2027 alpha 6 release</strong>, an early release of
              FRC&apos;s programming toolkit. It uses <strong>Java 25</strong>{" "}
              and deploys to <strong>SystemCore</strong>, the robot&apos;s
              onboard computer. All of that arrived with the installer in step
              1.
            </p>
            <p>
              You build the robot project yourself on{" "}
              <Link href="/project-setup" className={linkStyle}>
                Project Setup
              </Link>
              , out of the New Project Creator that comes with the installer
              above. So there is nothing else to download yet. Workshops 3 and 4
              hand you a prepared swerve project instead, because generated CTRE
              constants are not something anyone types.
            </p>
          </ProseBlock>
          <MarginNote label="What alpha means">
            The APIs are still changing. A method that exists today can be
            renamed before kickoff, so every Java example on this site is
            subject to change. We keep the site current with the latest alpha,
            and some things will still read differently on your screen.
          </MarginNote>
        </Split>
      </LessonSection>

      <LessonSection id="java-nothing-to-install" title="Java comes later">
        <ProseBlock>
          <p>
            Robot code shows up in Workshop 2, and it does not stay at the
            beginner end for long. Lambdas, method references, and class
            declarations all turn up there. There will be a few hard concepts,
            but we'll explain them as we get there.
          </p>
          <p>
            Only about twelve pieces of Java are used in this whole site. That
            lesson covers all twelve and then stops.
          </p>
          <p>You don't need to take a Java course first.</p>
        </ProseBlock>
      </LessonSection>

      <LessonSection id="the-minimum-to-follow" title="Hardware on the bench">
        <p>
          Workshop 1 will be run fully inside Tuner X. It owns the CANivore,
          sends every control request, and plots the response off the real
          motor.
        </p>
        <p>
          You find each motor and check which way it turns on{" "}
          <Link href="/mechanism-setup" className={linkStyle}>
            Motor Setup
          </Link>
          , then tune it against how it behaves on{" "}
          <Link href="/pid-control" className={linkStyle}>
            PID Tuning
          </Link>
          .
        </p>
        <ul className="ml-5 list-disc space-y-3">
          <li>
            <strong>The assembled mechanism.</strong> The arm or the flywheel
            from{" "}
            <Link href="/mechanism-cad" className={linkStyle}>
              Mechanism CAD
            </Link>
            , built and wired. Its bill of materials is the exact parts list,
            down to the battery cable and the CAN terminating resistor. A
            mechanism off an old robot works too, as long as it runs the
            hardware below.
          </li>
          <li>
            <strong>A Kraken X44.</strong> The motor Tuner X drives. Its TalonFX
            controller sits inside the case, so there is no separate controller
            to wire.
          </li>
          <li>
            <strong>A CANcoder.</strong> The WCP ThroughBore encoder is a
            CANcoder inside, so the code calls it one. It reports the arm&apos;s
            real angle and keeps that angle through a power cycle. The arm build
            uses one; the flywheel build does not.
          </li>
          <li>
            <strong>A CANivore.</strong> Plugs into a USB port and runs the CAN
            bus the motor and encoder sit on. Name yours <code>canivore</code>{" "}
            so Workshop 2 can reuse the same hardware handoff.
          </li>
          <li>
            <strong>A charged battery and its cable.</strong> A fresh one gives
            about 12 V. Bench tests on{" "}
            <Link href="/mechanism-setup" className={linkStyle}>
              Motor Setup
            </Link>{" "}
            run at 6 V, but the motor still needs a real battery behind it.
          </li>
        </ul>
        <p>
          You do not need a SystemCore, a radio, or a robot. The whole rig is a
          laptop with a CANivore plugged into it, sitting next to one mechanism
          on a table. Workshop 2 adds an Xbox-style controller, and Workshop 3
          moves to a swerve drivetrain.
        </p>
      </LessonSection>

      <LessonSection id="check-your-work" title="Check your work">
        <p>
          Open all five programs once before you leave this page. An installer
          that failed quietly is far easier to find now than later, with the arm
          wired up and the meeting half over.
        </p>
        <div className="overflow-x-auto">
          <table className="w-full min-w-[560px] border-collapse text-note">
            <thead>
              <tr style={{ borderBottom: "1px solid var(--rule)" }}>
                <th className="px-3 py-2 text-left">Program</th>
                <th className="px-3 py-2 text-left">What you should see</th>
              </tr>
            </thead>
            <tbody style={{ color: "var(--tx2)" }}>
              <tr style={{ borderBottom: "1px solid var(--rule-soft)" }}>
                <td className="px-3 py-2">WPILib VS Code</td>
                <td className="px-3 py-2">
                  It opens, and the folder it installed into is named for the
                  2027 alpha.
                </td>
              </tr>
              <tr style={{ borderBottom: "1px solid var(--rule-soft)" }}>
                <td className="px-3 py-2">Driver Station</td>
                <td className="px-3 py-2">
                  It opens with its status lights red. Nothing is connected yet.
                </td>
              </tr>
              <tr style={{ borderBottom: "1px solid var(--rule-soft)" }}>
                <td className="px-3 py-2">Phoenix Tuner X</td>
                <td className="px-3 py-2">
                  It opens and lists no devices. The CANivore is still in a
                  drawer.
                </td>
              </tr>
              <tr style={{ borderBottom: "1px solid var(--rule-soft)" }}>
                <td className="px-3 py-2">AdvantageScope</td>
                <td className="px-3 py-2">
                  It opens to an empty window with no log loaded.
                </td>
              </tr>
              <tr>
                <td className="px-3 py-2">Git</td>
                <td className="px-3 py-2">
                  <code>git --version</code> prints a version in a terminal.
                </td>
              </tr>
            </tbody>
          </table>
        </div>
        <Box variant="alert-success" title="Ready to start">
          <ul className="ml-5 list-disc space-y-2">
            <li>All five programs open, none of them with an error.</li>
            <li>The mechanism is assembled and bolted to the bench.</li>
            <li>The battery is charged and its cable is on the table.</li>
          </ul>
        </Box>
        <p>
          Next is{" "}
          <Link href="/hardware" className={linkStyle}>
            Hardware Setup
          </Link>
          , where you plug the CANivore in and find every device in Tuner X.
        </p>
      </LessonSection>
    </PageTemplate>
  );
}
