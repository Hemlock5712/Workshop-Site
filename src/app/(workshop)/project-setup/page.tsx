import PageTemplate from "@/components/PageTemplate";
import KeyConceptSection from "@/components/KeyConceptSection";
import Box from "@/components/Box";
import Quiz from "@/components/Quiz";
import { AlertTriangle, Lightbulb } from "lucide-react";

export default function ProjectSetup() {
  return (
    <PageTemplate title="Project Setup">
      {/* Introduction */}
      <KeyConceptSection
        title="Project Setup - Launching Your Codebase"
        description="Step-by-step guide to creating a new WPILib project. This workshop's robot code is built on Commands v3 + OpModes, so the starting point is the team's 2027-Template, which already organizes your code into mechanisms and OpModes."
        concept="Start from the Commands v3 / OpMode project so your code is organized into mechanisms and OpModes from day one."
      />

      <Box
        variant="alert-info"
        tag="NOTE"
        title="This workshop targets the 2027 alpha (Commands v3 + OpModes)"
      >
        <p className="mb-3">
          The robot code uses{" "}
          <strong>Commands v3 + the OpMode framework</strong>, runs on{" "}
          <strong>Java 25</strong>, and deploys to <strong>SystemCore</strong>.
          The workshop&apos;s canonical starting point is the{" "}
          <strong>
            <a
              href="https://github.com/Hemlock5712/2027-Template"
              target="_blank"
              rel="noopener noreferrer"
              className="underline"
            >
              team&apos;s 2027-Template
            </a>
          </strong>{" "}
          repo — clone it (the default <code>2027-dev</code> branch has the 2027
          stack; the <code>main</code> branch is still the older 2026 stack) so
          you start with the OpMode wiring already in place, then set your team
          number in <code>.wpilib/wpilib_preferences.json</code>. The site
          mirrors the 2027 alpha stack (GradleRIO <code>2027.0.0-alpha-6</code>,
          Phoenix 6 <code>26.50.0-alpha-1</code>).
        </p>
      </Box>

      <div className="bg-slate-50 dark:bg-slate-900 rounded-lg p-8 shadow-lg border border-slate-200 dark:border-slate-800">
        <h2 className="text-3xl font-bold text-slate-900 dark:text-slate-100 mb-6">
          The Workshop Path: Clone the 2027-Template
        </h2>
        <p className="text-slate-600 dark:text-slate-300 mb-6">
          This is the path the workshop follows. Four steps and you have a
          building project with the OpMode wiring, mechanisms folder, and
          GradleRIO 2027 alpha configuration already in place.
        </p>

        <div className="space-y-4">
          <div className="flex items-start space-x-3">
            <span className="bg-primary-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-sm font-bold">
              1
            </span>
            <div>
              <p className="font-medium">Clone the template</p>
              <p className="text-slate-600 dark:text-slate-300 text-sm">
                <code>
                  git clone -b 2027-dev
                  https://github.com/Hemlock5712/2027-Template.git Workshop
                </code>{" "}
                — the <code>2027-dev</code> branch is the 2027 stack (the{" "}
                <code>main</code> branch is still the older 2026 stack).
              </p>
            </div>
          </div>

          <div className="flex items-start space-x-3">
            <span className="bg-primary-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-sm font-bold">
              2
            </span>
            <div>
              <p className="font-medium">Open the folder in VS Code</p>
              <p className="text-slate-600 dark:text-slate-300 text-sm">
                Use the WPILib 2027 alpha VS Code install from the Prerequisites
                page. Avoid OneDrive-synced locations — they break Gradle
                builds.
              </p>
            </div>
          </div>

          <div className="flex items-start space-x-3">
            <span className="bg-primary-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-sm font-bold">
              3
            </span>
            <div>
              <p className="font-medium">Set your team number</p>
              <p className="text-slate-600 dark:text-slate-300 text-sm">
                Edit <code>.wpilib/wpilib_preferences.json</code> and set{" "}
                <code>teamNumber</code> to your FRC team number. Deploys
                won&apos;t find your robot without it.
              </p>
            </div>
          </div>

          <div className="flex items-start space-x-3">
            <span className="bg-primary-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-sm font-bold">
              4
            </span>
            <div>
              <p className="font-medium">Build once to verify</p>
              <p className="text-slate-600 dark:text-slate-300 text-sm">
                Run <code>./gradlew build</code> (or WPILib: Build Robot Code).
                A clean build means Java 25, the vendordeps, and the alpha
                toolchain are all in place. Then read the template&apos;s{" "}
                <a
                  href="https://github.com/Hemlock5712/2027-Template/blob/2027-dev/ONBOARDING.md"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="underline"
                >
                  ONBOARDING.md
                </a>{" "}
                — it&apos;s the tour of what you just cloned.
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-slate-50 dark:bg-slate-900 rounded-lg p-8 shadow-lg border border-slate-200 dark:border-slate-800">
        <h2 className="text-3xl font-bold text-slate-900 dark:text-slate-100 mb-6">
          Alternative: Creating a Blank WPILib Project
        </h2>
        <p className="text-slate-600 dark:text-slate-300 mb-6">
          For reference, this is how you&apos;d create a project from
          WPILib&apos;s built-in generator. Note that the generated skeleton
          does <em>not</em> include the OpMode structure this workshop teaches —
          you&apos;d be wiring mechanisms and OpModes up by hand, which is
          exactly why we clone the template instead.
        </p>

        <div className="space-y-4">
          <div className="flex items-start space-x-3">
            <span className="bg-primary-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-sm font-bold">
              1
            </span>
            <div>
              <p className="font-medium">Open VSCode</p>
              <p className="text-slate-600 dark:text-slate-300 text-sm">
                Launch Visual Studio Code with the WPILib extension installed.
              </p>
            </div>
          </div>

          <div className="flex items-start space-x-3">
            <span className="bg-primary-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-sm font-bold">
              2
            </span>
            <div>
              <p className="font-medium">
                Select the WPILib Logo in Top Right Corner
              </p>
              <p className="text-slate-600 dark:text-slate-300 text-sm">
                Click on the WPILib logo/icon in the top right corner of VSCode.
              </p>
            </div>
          </div>

          <div className="flex items-start space-x-3">
            <span className="bg-primary-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-sm font-bold">
              3
            </span>
            <div>
              <p className="font-medium">
                Select &quot;Create a New Project&quot;
              </p>
              <p className="text-slate-600 dark:text-slate-300 text-sm">
                From the WPILib menu, choose the &quot;Create a new
                project&quot; option.
              </p>
            </div>
          </div>

          <div className="flex items-start space-x-3">
            <span className="bg-primary-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-sm font-bold">
              4
            </span>
            <div>
              <p className="font-medium">
                Select &quot;Select a project type (Example or Template)&quot;
              </p>
              <p className="text-slate-600 dark:text-slate-300 text-sm">
                Choose Template → Java →{" "}
                <strong>Command Robot Skeleton (Advanced)</strong>. This
                generates the classic project layout — remember the workshop
                path above starts from the <strong>2027-Template</strong>{" "}
                instead.
              </p>
            </div>
          </div>

          <div className="flex items-start space-x-3">
            <span className="bg-primary-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-sm font-bold">
              5
            </span>
            <div>
              <p className="font-medium">
                Base folder select &quot;Downloads&quot;
              </p>
              <Box
                variant="alert-warning"
                title="Warning"
                icon={<AlertTriangle className="w-5 h-5" />}
                className="mt-2"
              >
                OneDrive locations are not supported and will cause project
                creation to fail.
              </Box>
            </div>
          </div>

          <div className="flex items-start space-x-3">
            <span className="bg-primary-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-sm font-bold">
              6
            </span>
            <div>
              <p className="font-medium">Project Name &quot;Workshop&quot;</p>
              <p className="text-slate-600 dark:text-slate-300 text-sm">
                Enter &quot;Workshop&quot; as your project name.
              </p>
            </div>
          </div>

          <div className="flex items-start space-x-3">
            <span className="bg-primary-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-sm font-bold">
              7
            </span>
            <div>
              <p className="font-medium">Team Number</p>
              <p className="text-slate-600 dark:text-slate-300 text-sm">
                Enter your FRC team number. This is required for deploying code
                to your robot.
              </p>
            </div>
          </div>

          <div className="flex items-start space-x-3">
            <span className="bg-primary-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-sm font-bold">
              8
            </span>
            <div>
              <p className="font-medium">
                Check &quot;Enable Desktop Support&quot;
              </p>
              <p className="text-slate-600 dark:text-slate-300 text-sm">
                This allows you to test your robot code on your computer without
                a robot.
              </p>
            </div>
          </div>

          <div className="flex items-start space-x-3">
            <span className="bg-primary-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-sm font-bold">
              9
            </span>
            <div>
              <p className="font-medium">Generate Project</p>
              <p className="text-slate-600 dark:text-slate-300 text-sm">
                Click &quot;Generate Project&quot; and then open the new project
                when prompted.
              </p>
            </div>
          </div>
        </div>
      </div>

      <iframe
        src="https://www.youtube.com/embed/Y8ExsyaCC34"
        title="Project Setup Tutorial"
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
        allowFullScreen
        className="w-full h-full aspect-video rounded-lg"
      />

      <Box
        variant="alert-tip"
        title="Next Step"
        icon={<Lightbulb className="w-5 h-5" />}
        className="mt-4"
      >
        After creating your project, the next section covers the Command-Based
        Framework, where you&apos;ll start adding mechanisms and commands.
      </Box>

      <Quiz
        title="Knowledge Check"
        questions={[
          {
            id: 1,
            question:
              "What's the starting point for this workshop's robot code on the 2027 stack?",
            options: [
              "The stock Timed Robot template",
              "The team's 2027-Template (Commands v3 + OpModes)",
              "A blank project you wire up by hand",
              "The Romi Robot template",
            ],
            correctAnswer: 1,
            explanation:
              "This workshop targets WPILib 2027 (Commands v3 + OpModes, Java 25, SystemCore). You start from the team's 2027-Template, which already has the OpMode wiring in place.",
          },
          {
            id: 2,
            question:
              "Why should you avoid using OneDrive locations for your WPILib project?",
            options: [
              "OneDrive makes the project run slower",
              "OneDrive locations are not supported and will cause project creation to fail",
              "OneDrive deletes Java files automatically",
              "OneDrive doesn't support version control",
            ],
            correctAnswer: 1,
            explanation:
              "OneDrive locations are not supported by WPILib and will cause project creation to fail. Always use a local directory like Downloads or Documents.",
          },
          {
            id: 3,
            question:
              "Which branch of the 2027-Template should you clone, and why?",
            options: [
              "main — the default branch is always the newest",
              "2027-dev — it has the 2027 stack; main is still last season's code",
              "Either one — they're kept identical",
              "release — templates always ship from a release branch",
            ],
            correctAnswer: 1,
            explanation:
              "Clone with git clone -b 2027-dev. The 2027-dev branch carries the Commands v3 + OpModes stack this workshop teaches; the main branch is still the older 2026 stack.",
          },
          {
            id: 4,
            question:
              "After cloning and setting your team number, how do you check the project is healthy?",
            options: [
              "Deploy straight to the robot and see what happens",
              "Run ./gradlew build (or WPILib: Build Robot Code) — a clean build means the toolchain and dependencies are in place",
              "Open every file and look for red squiggles",
              "You can't check without robot hardware",
            ],
            correctAnswer: 1,
            explanation:
              "One clean build verifies Java 25, the vendor libraries, and the alpha toolchain all work before you write any code. Then read the template's ONBOARDING.md — it's the tour of what you cloned.",
          },
        ]}
      />
    </PageTemplate>
  );
}
