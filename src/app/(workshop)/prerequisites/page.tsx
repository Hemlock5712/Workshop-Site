import PageTemplate from "@/components/PageTemplate";
import ContentCard from "@/components/ContentCard";
import GlossaryTerm from "@/components/GlossaryTerm";
import { ClipboardCheck } from "lucide-react";

export default function Prerequisites() {
  return (
    <PageTemplate title="Prerequisites">
      <div className="grid gap-6">
        {/* Software Requirements */}
        <ContentCard>
          <h2 className="text-3xl font-bold text-slate-900 dark:text-slate-100 mb-4 flex items-center gap-3">
            <ClipboardCheck className="w-8 h-8 text-primary-600 dark:text-primary-400" />
            Software Requirements
          </h2>

          <div className="space-y-6">
            <div className="border-l-4 border-purple-200 dark:border-purple-900 pl-4">
              <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100">
                <a
                  href="https://docs.wpilib.org/en/stable/docs/zero-to-robot/step-2/wpilib-setup.html"
                  className="text-purple-600 underline hover:no-underline dark:text-purple-400"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  WPILib
                </a>{" "}
                &{" "}
                <a
                  href="https://www.ni.com/en/support/downloads/drivers/download.frc-game-tools.html#553883"
                  className="text-purple-600 underline hover:no-underline dark:text-purple-400"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  Game Tools
                </a>
              </h3>
              <p className="text-slate-600 dark:text-slate-300 mt-2">
                Install <GlossaryTerm term="wpilib">WPILib</GlossaryTerm> VS
                Code and National Instruments Game Tools. On this stack you only
                need Game Tools for the <strong>Driver Station</strong>, the
                program that enables and disables the robot.
              </p>
            </div>

            <div className="border-l-4 border-blue-200 dark:border-blue-900 pl-4">
              <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100">
                <a
                  href="https://apps.microsoft.com/detail/9NVV4PWDW27Z"
                  className="text-blue-600 underline hover:no-underline dark:text-blue-400"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  Phoenix Tuner X
                </a>
              </h3>
              <p className="text-slate-600 dark:text-slate-300 mt-2">
                You&apos;ll use this to configure and tune{" "}
                <GlossaryTerm term="motor controller">TalonFX</GlossaryTerm> and
                other CTRE hardware.
              </p>
            </div>

            <div className="border-l-4 border-indigo-200 dark:border-indigo-900 pl-4">
              <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100">
                <a
                  href="https://github.com/Mechanical-Advantage/AdvantageScope/releases"
                  className="text-indigo-600 underline hover:no-underline dark:text-indigo-400"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  AdvantageScope
                </a>
              </h3>
              <p className="text-slate-600 dark:text-slate-300 mt-2">
                A viewer for robot logs and data. You&apos;ll need it for
                debugging and tuning. A lite version comes preinstalled with
                WPILib, but we recommend downloading the latest full version
                from the GitHub releases page.
              </p>
            </div>

            <div className="border-l-4 border-green-200 dark:border-green-900 pl-4">
              <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100">
                <a
                  href="https://git-scm.com/downloads"
                  className="text-green-600 underline hover:no-underline dark:text-green-400"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  Git
                </a>
              </h3>
              <p className="text-slate-600 dark:text-slate-300 mt-2">
                Use Git for version control. Summarize changes clearly (e.g.,
                &apos;Add drivetrain PID tuning logic&apos;).
              </p>
            </div>

            <div className="border-l-4 border-orange-200 dark:border-orange-900 pl-4">
              <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100">
                <a
                  href="https://github.com/Hemlock5712/2027-Template"
                  className="text-orange-600 underline hover:no-underline dark:text-orange-400"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  WPILib 2027 Alpha stack (2027-Template)
                </a>
              </h3>
              <p className="text-slate-600 dark:text-slate-300 mt-2">
                This workshop runs on the WPILib <strong>2027 alpha</strong>, an
                early-release version of FRC&apos;s programming toolkit. It uses{" "}
                <strong>Java 25</strong> and deploys to{" "}
                <strong>SystemCore</strong>, the robot&apos;s onboard computer.
                Start from the team&apos;s 2027-Template, a ready-made robot
                project you copy. One catch: pick the <code>2027-dev</code>{" "}
                branch (a branch is one version of the code; <code>main</code>{" "}
                is still last season&apos;s).{" "}
                <strong>PathPlanner is not required</strong>; driving in auto is
                covered in Workshop #2.
              </p>
            </div>

            <div className="border-l-4 border-red-200 dark:border-red-900 pl-4">
              <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100">
                <a
                  href="https://github.com/Gold872/elastic-dashboard"
                  className="text-red-600 underline hover:no-underline dark:text-red-400"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  Elastic Dashboard
                </a>
              </h3>
              <p className="text-slate-600 dark:text-slate-300 mt-2">
                Drivers use a dashboard to select autonomous routines, check for
                motor errors, and monitor the robot during a match.
              </p>
            </div>

            <div className="border-l-4 border-yellow-200 dark:border-yellow-900 pl-4">
              <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100">
                <a
                  href="https://www.codecademy.com/learn/learn-java"
                  className="text-yellow-600 underline hover:no-underline dark:text-yellow-400"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  Java Knowledge
                </a>
              </h3>
              <p className="text-slate-600 dark:text-slate-300 mt-2">
                Some basic Java knowledge helps, but it isn&apos;t required.
              </p>
            </div>
          </div>
        </ContentCard>
      </div>

      <div className="bg-primary-50 dark:bg-primary-950/30 border border-primary-200 dark:border-primary-900 rounded-lg p-6 mb-8">
        <h3 className="text-lg font-semibold text-primary-700 dark:text-primary-300 mb-2">
          Ready to Start?
        </h3>
        <p className="text-primary-800 dark:text-primary-300">
          Make sure everything above is installed before you move on to hardware
          setup.
        </p>
      </div>
    </PageTemplate>
  );
}
