import PageTemplate from "@/components/PageTemplate";
import LessonSection from "@/components/lesson/LessonSection";
import KeyConceptSection from "@/components/KeyConceptSection";
import Box from "@/components/Box";
import Quiz from "@/components/Quiz";

export default function ProjectSetup() {
  return (
    <PageTemplate
      title="Start from the team's template, not a blank project"
      emphasis="not a blank project"
      lede="You clone one repository and run one build. When it finishes clean, you have a project that already knows about Commands v3, OpModes and Phoenix 6, and you have proved your toolchain works before any lesson depends on it."
      needs={[
        <>
          Everything on <strong>Prerequisites</strong> installed: WPILib 2027,
          Java 25, Git.
        </>,
        <>An internet connection. The first build downloads the vendordeps.</>,
        <>
          No hardware. This page never talks to a motor; it ends on a green
          build.
        </>,
      ]}
      time="About 20 minutes, most of it the first Gradle build"
    >
      {/* Introduction */}
      <KeyConceptSection
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
          repo. Clone it (the default <code>2027-dev</code> branch has the 2027
          stack; the <code>main</code> branch is still the older 2026 stack) so
          you start with the OpMode wiring already in place, then set your team
          number in <code>.wpilib/wpilib_preferences.json</code>. The site
          mirrors the 2027 alpha stack (GradleRIO <code>2027.0.0-alpha-6</code>,
          Phoenix 6 <code>26.50.0-alpha-1</code>).
        </p>
      </Box>

      <LessonSection
        id="clone-the-template"
        title="The workshop path: clone the 2027-Template"
      >
        <p className="prose-body measure">
          This is the path the workshop follows. Four steps and you have a
          building project with the OpMode wiring, mechanisms folder, and
          GradleRIO 2027 alpha configuration already in place.
        </p>

        {/* `measure`: without the card that used to wrap these, the step rows
            would run the article's full 954px. Body copy caps at the measure. */}
        <div className="measure space-y-4">
          <div className="flex items-start space-x-3">
            <span className="bg-[var(--accent)] text-[var(--accent-ink)] rounded-full w-6 h-6 flex items-center justify-center text-note font-bold">
              1
            </span>
            <div>
              <p className="font-medium">Clone the template</p>
              <p className="text-[var(--tx2)] text-note">
                <code>
                  git clone -b 2027-dev
                  https://github.com/Hemlock5712/2027-Template.git Workshop
                </code>{" "}
                (the <code>2027-dev</code> branch is the 2027 stack; the{" "}
                <code>main</code> branch is still the older 2026 stack).
              </p>
            </div>
          </div>

          <div className="flex items-start space-x-3">
            <span className="bg-[var(--accent)] text-[var(--accent-ink)] rounded-full w-6 h-6 flex items-center justify-center text-note font-bold">
              2
            </span>
            <div>
              <p className="font-medium">Open the folder in VS Code</p>
              <p className="text-[var(--tx2)] text-note">
                Use the WPILib 2027 alpha VS Code install from the Prerequisites
                page. Avoid OneDrive-synced locations; they break Gradle builds.
              </p>
            </div>
          </div>

          <div className="flex items-start space-x-3">
            <span className="bg-[var(--accent)] text-[var(--accent-ink)] rounded-full w-6 h-6 flex items-center justify-center text-note font-bold">
              3
            </span>
            <div>
              <p className="font-medium">Set your team number</p>
              <p className="text-[var(--tx2)] text-note">
                Edit <code>.wpilib/wpilib_preferences.json</code> and set{" "}
                <code>teamNumber</code> to your FRC team number. Deploys
                won&apos;t find your robot without it.
              </p>
            </div>
          </div>

          <div className="flex items-start space-x-3">
            <span className="bg-[var(--accent)] text-[var(--accent-ink)] rounded-full w-6 h-6 flex items-center justify-center text-note font-bold">
              4
            </span>
            <div>
              <p className="font-medium">Build once to verify</p>
              <p className="text-[var(--tx2)] text-note">
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
                (it&apos;s the tour of what you just cloned).
              </p>
            </div>
          </div>
        </div>
      </LessonSection>

      <LessonSection
        id="blank-project-alternative"
        title="Alternative: creating a blank WPILib project"
      >
        <p className="prose-body measure">
          For reference, this is how you&apos;d create a project from
          WPILib&apos;s built-in generator. Note that the generated skeleton
          does <em>{"not "}</em> include the OpMode structure this workshop
          teaches; you&apos;d be wiring mechanisms and OpModes up by hand, which
          is exactly why we clone the template instead.
        </p>

        <div className="measure space-y-4">
          <div className="flex items-start space-x-3">
            <span className="bg-[var(--accent)] text-[var(--accent-ink)] rounded-full w-6 h-6 flex items-center justify-center text-note font-bold">
              1
            </span>
            <div>
              <p className="font-medium">Open VSCode</p>
              <p className="text-[var(--tx2)] text-note">
                Launch Visual Studio Code with the WPILib extension installed.
              </p>
            </div>
          </div>

          <div className="flex items-start space-x-3">
            <span className="bg-[var(--accent)] text-[var(--accent-ink)] rounded-full w-6 h-6 flex items-center justify-center text-note font-bold">
              2
            </span>
            <div>
              <p className="font-medium">
                Select the WPILib Logo in Top Right Corner
              </p>
              <p className="text-[var(--tx2)] text-note">
                Click on the WPILib logo/icon in the top right corner of VSCode.
              </p>
            </div>
          </div>

          <div className="flex items-start space-x-3">
            <span className="bg-[var(--accent)] text-[var(--accent-ink)] rounded-full w-6 h-6 flex items-center justify-center text-note font-bold">
              3
            </span>
            <div>
              <p className="font-medium">
                Select &quot;Create a New Project&quot;
              </p>
              <p className="text-[var(--tx2)] text-note">
                From the WPILib menu, choose the &quot;Create a new
                project&quot; option.
              </p>
            </div>
          </div>

          <div className="flex items-start space-x-3">
            <span className="bg-[var(--accent)] text-[var(--accent-ink)] rounded-full w-6 h-6 flex items-center justify-center text-note font-bold">
              4
            </span>
            <div>
              <p className="font-medium">
                Select &quot;Select a project type (Example or Template)&quot;
              </p>
              <p className="text-[var(--tx2)] text-note">
                Choose Template → Java →{" "}
                <strong>Command Robot Skeleton (Advanced)</strong>. This
                generates the classic project layout; the workshop path above
                starts from the <strong>2027-Template</strong> instead.
              </p>
            </div>
          </div>

          <div className="flex items-start space-x-3">
            <span className="bg-[var(--accent)] text-[var(--accent-ink)] rounded-full w-6 h-6 flex items-center justify-center text-note font-bold">
              5
            </span>
            <div>
              <p className="font-medium">
                Base folder: select &quot;Downloads&quot;
              </p>
              <Box variant="alert-warning" title="Warning" className="mt-2">
                OneDrive locations are not supported and will cause project
                creation to fail.
              </Box>
            </div>
          </div>

          <div className="flex items-start space-x-3">
            <span className="bg-[var(--accent)] text-[var(--accent-ink)] rounded-full w-6 h-6 flex items-center justify-center text-note font-bold">
              6
            </span>
            <div>
              <p className="font-medium">Project Name &quot;Workshop&quot;</p>
              <p className="text-[var(--tx2)] text-note">
                Enter &quot;Workshop&quot; as your project name.
              </p>
            </div>
          </div>

          <div className="flex items-start space-x-3">
            <span className="bg-[var(--accent)] text-[var(--accent-ink)] rounded-full w-6 h-6 flex items-center justify-center text-note font-bold">
              7
            </span>
            <div>
              <p className="font-medium">Team Number</p>
              <p className="text-[var(--tx2)] text-note">
                Enter your FRC team number. This is required for deploying code
                to your robot.
              </p>
            </div>
          </div>

          <div className="flex items-start space-x-3">
            <span className="bg-[var(--accent)] text-[var(--accent-ink)] rounded-full w-6 h-6 flex items-center justify-center text-note font-bold">
              8
            </span>
            <div>
              <p className="font-medium">
                Check &quot;Enable Desktop Support&quot;
              </p>
              <p className="text-[var(--tx2)] text-note">
                This allows you to test your robot code on your computer without
                a robot.
              </p>
            </div>
          </div>

          <div className="flex items-start space-x-3">
            <span className="bg-[var(--accent)] text-[var(--accent-ink)] rounded-full w-6 h-6 flex items-center justify-center text-note font-bold">
              9
            </span>
            <div>
              <p className="font-medium">Generate Project</p>
              <p className="text-[var(--tx2)] text-note">
                Click &quot;Generate Project&quot; and then open the new project
                when prompted.
              </p>
            </div>
          </div>
        </div>
      </LessonSection>

      <LessonSection id="watch-it-done" title="Watch it done">
        <iframe
          src="https://www.youtube.com/embed/Y8ExsyaCC34"
          title="Project setup tutorial"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowFullScreen
          className="w-full h-full aspect-video rounded-lg"
        />
      </LessonSection>

      <Quiz
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
              "main: the default branch is always the newest",
              "2027-dev: it has the 2027 stack; main is still last season's code",
              "Either one: they're kept identical",
              "release: templates always ship from a release branch",
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
              "Run ./gradlew build (or WPILib: Build Robot Code): a clean build means the toolchain and dependencies are in place",
              "Open every file and look for red squiggles",
              "You can't check without robot hardware",
            ],
            correctAnswer: 1,
            explanation:
              "One clean build verifies Java 25, the vendor libraries, and the alpha toolchain all work before you write any code. Then read the template's ONBOARDING.md; it's the tour of what you cloned.",
          },
        ]}
      />
    </PageTemplate>
  );
}
