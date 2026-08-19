import PageTemplate from "@/components/PageTemplate";
import LessonSection from "@/components/lesson/LessonSection";
import FigureGrid from "@/components/lesson/FigureGrid";
import Box from "@/components/Box";
import DocumentationButton from "@/components/DocumentationButton";
import Quiz from "@/components/Quiz";
import { MarginNote, ProseBlock, Split } from "@/components/lesson/Prose";
import { BookOpen } from "lucide-react";

/**
 * The gate to every code lesson in Workshop 2.
 *
 * One procedure, not two: the blank-project generator used to sit here as an
 * alternative and competed with the path the course follows. The template is
 * the path. What this page has to leave behind is a clone on the right branch
 * and one clean `./gradlew build`, because the next six lessons assume both.
 */
export default function ProjectSetup() {
  return (
    <PageTemplate
      title="Project Setup"
      lede="You clone the team's robot template, set your team number, and build it once. The build is what matters here: it proves Java, Gradle and the vendor libraries work before a lesson depends on them. No hardware, no code yet."
      needs={[
        <>
          Everything on <strong>Prerequisites</strong> installed: the WPILib
          2027 alpha, and Git.
        </>,
        <>An internet connection. The first build downloads a lot.</>,
        <>A local folder to work in, not one synced to the cloud.</>,
      ]}
      time="12 minutes, plus the first build"
    >
      <Split>
        <ProseBlock>
          <p>
            The template is a finished robot project. The OpMode wiring, the
            mechanisms folder and the Phoenix 6 vendordep are already in it.
            Nothing on this page asks you to create a file.
          </p>
          <p>
            One step here can fail, and that is the build. The causes are dull:
            the network, the Java version, and where the folder lives. All three
            are easier to fix now than in the middle of a lesson about arms.
          </p>
        </ProseBlock>
        <MarginNote label="Two repos, not one">
          This clone is your reference copy of a working robot, and it stays
          that way. From <strong>Building Mechanisms</strong> on, each lesson
          clones a second, smaller repository with one branch per lesson. Keep
          both, side by side.
        </MarginNote>
      </Split>

      <LessonSection id="pinned-versions" title="Pinned versions">
        <p>
          Every Java example on this site was checked against the versions
          below. This is alpha software, and methods do get renamed between
          builds. If your numbers do not match these, expect an example on a
          later page to fail to compile.
        </p>
        <div className="overflow-x-auto">
          <table className="w-full min-w-[560px] border-collapse text-note">
            <thead>
              <tr style={{ borderBottom: "1px solid var(--rule)" }}>
                <th className="px-3 py-2 text-left">Piece</th>
                <th className="px-3 py-2 text-left">Version</th>
                <th className="px-3 py-2 text-left">Where it comes from</th>
              </tr>
            </thead>
            <tbody style={{ color: "var(--tx2)" }}>
              <tr style={{ borderBottom: "1px solid var(--rule-soft)" }}>
                <td className="px-3 py-2">GradleRIO</td>
                <td className="px-3 py-2">
                  <code>2027.0.0-alpha-6</code>
                </td>
                <td className="px-3 py-2">
                  The WPILib 2027 alpha install, plus the template build file.
                </td>
              </tr>
              <tr style={{ borderBottom: "1px solid var(--rule-soft)" }}>
                <td className="px-3 py-2">Phoenix 6</td>
                <td className="px-3 py-2">
                  <code>26.50.0-alpha-1</code>
                </td>
                <td className="px-3 py-2">
                  A vendordep in the template, downloaded on the first build.
                </td>
              </tr>
              <tr style={{ borderBottom: "1px solid var(--rule-soft)" }}>
                <td className="px-3 py-2">Java</td>
                <td className="px-3 py-2">
                  <code>25</code>
                </td>
                <td className="px-3 py-2">
                  Came with WPILib. Do not install a second one yourself.
                </td>
              </tr>
              <tr>
                <td className="px-3 py-2">Deploy target</td>
                <td className="px-3 py-2">SystemCore</td>
                <td className="px-3 py-2">
                  The robot computer, in place of the old roboRIO.
                </td>
              </tr>
            </tbody>
          </table>
        </div>
        <p>
          Both version numbers are readable in your own clone once you have it.
          Look in <code>build.gradle</code> for the GradleRIO plugin, and under{" "}
          <code>vendordeps/</code> for the Phoenix file, which is named for the
          release it pins. Check those two if a later lesson behaves differently
          from the page.
        </p>
      </LessonSection>

      <LessonSection id="clone-the-template" title="Clone the template">
        <p>
          Take the <code>2027-dev</code> branch. Every example on this site was
          checked against it. <code>main</code> is the default branch and an
          older snapshot of the same template. A clone without <code>-b</code>{" "}
          lands there, compiles fine, and drifts from the lessons. If that
          already happened, run <code>git checkout 2027-dev</code> inside the
          folder.
        </p>
        <Box variant="alert-warning" title="Where the folder lives">
          <p>
            Clone into a plain local path, something like{" "}
            <code>C:\Users\you\Workshop</code>. OneDrive, Google Drive and
            Dropbox rewrite files underneath Gradle while it is working, and the
            build then fails in ways that look like broken code.
          </p>
        </Box>
        <ol className="ml-5 list-decimal space-y-3">
          <li>
            Open a terminal in that folder and clone the template:{" "}
            <code>
              git clone -b 2027-dev
              https://github.com/Hemlock5712/2027-Template.git Workshop
            </code>
          </li>
          <li>
            Open the new <code>Workshop</code> folder in the WPILib copy of VS
            Code. The 2027 installer put a second VS Code on your machine, and
            that copy is the one set up for Java 25.
          </li>
          <li>
            Open <code>.wpilib/wpilib_preferences.json</code> and set{" "}
            <code>teamNumber</code> to your team number. Without it a deploy has
            no address to look for.
          </li>
          <li>
            Read <code>ONBOARDING.md</code> at the top of the repo. It is the
            map of what you just cloned, and it leads with the change that
            catches out every returning programmer: there is no{" "}
            <code>RobotContainer</code>.
          </li>
        </ol>
        <p>
          Three things under <code>src/main/java/frc/robot/</code> carry the
          rest of Workshop 2. The <code>subsystems/</code> folder holds one
          class per physical part of the robot. Each mode the driver can pick on
          the Driver Station gets its own class in <code>opmodes/</code>. And{" "}
          <code>Robot.java</code> owns the subsystems and starts the scheduler.
        </p>
      </LessonSection>

      <LessonSection id="first-build" title="The first build">
        <p>
          Nothing needs to be plugged in for this, and no robot has to exist.
          Build from a terminal in the project folder, or from the WPILib menu
          in VS Code, which chooses the right Java for you.
        </p>
        <ol className="ml-5 list-decimal space-y-3">
          <li>
            Run <code>./gradlew build</code>. In PowerShell that is{" "}
            <code>.\gradlew build</code>, and in the WPILib menu it is{" "}
            <strong>Build Robot Code</strong>.
          </li>
          <li>
            Leave it alone while it runs. The first build fetches the Gradle
            distribution, the Java 25 toolchain and the vendor libraries:
            several minutes on a home connection, longer on school Wi-Fi.
          </li>
          <li>
            Read the last line. A finished build prints{" "}
            <code>BUILD SUCCESSFUL</code> and how long it took. A broken one
            prints <code>BUILD FAILED</code>, with a{" "}
            <code>What went wrong</code> block a few lines above it.
          </li>
          <li>
            Run the same command a second time. It should finish in seconds now,
            because everything it downloaded is cached.
          </li>
        </ol>
        <p>
          A build compiles. It sends nothing anywhere, so there is no way to
          break a robot from this page. Deploying is a separate command, and it
          waits until <strong>Running the Program</strong>.
        </p>
        <p>
          Gradle keeps that cache in your home directory, not in the project. So
          the next repository you clone, including every lesson branch in
          Workshop 2, builds at the fast speed rather than the slow one.
        </p>
      </LessonSection>

      <LessonSection id="build-failures" title="Three ways it breaks">
        <p>
          A setup that fails almost always fails in one of these three ways.
          Read the error text rather than the file it points at.
        </p>
        <FigureGrid
          cols={3}
          items={[
            {
              label: "Could not resolve",
              term: "No network",
              body: (
                <>
                  Gradle stopped on a library it could not download. The first
                  build has to reach the internet. Later builds do not, once the
                  cache is warm.
                </>
              ),
            },
            {
              label: "invalid source release: 25",
              term: "Wrong Java",
              body: (
                <>
                  Gradle is running on an older JDK, usually one somebody
                  installed by hand. Build from the WPILib menu, or point Gradle
                  at the WPILib Java 25 toolchain.
                </>
              ),
            },
            {
              label: "No such file or directory",
              term: "Wrong folder",
              body: (
                <>
                  <code>gradlew</code> sits at the top of the clone, and the
                  terminal opened somewhere else. Change into the{" "}
                  <code>Workshop</code> folder, then run the build again.
                </>
              ),
            },
          ]}
        />
        <p>
          Anything else, read the first line under <code>What went wrong</code>{" "}
          and search that. Gradle names the file and the reason, and a mentor
          can read that line far faster than a screenshot of your editor.
        </p>
      </LessonSection>

      <LessonSection id="check-your-work" title="Check your work">
        <p>
          Build twice, then look at the file tree. Both builds have to pass, and
          the second one has to be quick.
        </p>
        <Box variant="alert-success" title="You should see">
          <ul className="ml-5 list-disc space-y-2">
            <li>
              <code>BUILD SUCCESSFUL</code> as the last line of the output.
            </li>
            <li>A second build that finishes in seconds, not minutes.</li>
            <li>
              <code>opmodes/</code> and <code>subsystems/</code> under{" "}
              <code>src/main/java/frc/robot/</code>, and no{" "}
              <code>RobotContainer.java</code> anywhere in the project.
            </li>
            <li>
              Your team number in <code>.wpilib/wpilib_preferences.json</code>.
            </li>
            <li>
              <code>git branch --show-current</code> printing{" "}
              <code>2027-dev</code>.
            </li>
          </ul>
        </Box>
        <p>
          Then leave this clone alone. Do not rename its folders.{" "}
          <strong>The Command Framework</strong> reads code out of it, and{" "}
          <strong>Building Mechanisms</strong> clones a separate lesson
          repository beside it.
        </p>
        <DocumentationButton
          href="https://github.com/Hemlock5712/2027-Template/blob/2027-dev/ONBOARDING.md"
          title="2027-Template: ONBOARDING.md"
          icon={<BookOpen className="h-5 w-5" />}
        />
      </LessonSection>

      <Quiz
        questions={[
          {
            id: 1,
            question: "Which branch of the 2027-Template do you clone?",
            options: [
              "2027-dev, the branch every example here is checked against",
              "Whichever one GitHub opens first, they are interchangeable",
              "release, because templates ship from a release branch",
              "main, because the default branch is the newest code",
            ],
            correctAnswer: 0,
            explanation:
              "Clone with git clone -b 2027-dev. Leave off -b and you land on main, the default branch. It is an older snapshot of the same template, so it compiles fine and drifts from the lessons.",
          },
          {
            id: 2,
            question: "Why not put the project in a OneDrive folder?",
            options: [
              "OneDrive deletes Java files",
              "Git does not work inside OneDrive",
              "OneDrive makes the robot run slower",
              "Sync rewrites files while Gradle is working, and the build fails",
            ],
            correctAnswer: 3,
            explanation:
              "Cloud sync moves files underneath Gradle mid-build. The failures that follow look like broken code. Clone to a plain local path instead.",
          },
          {
            id: 3,
            question: "How do you know the first build worked?",
            options: [
              "The editor shows no red squiggles",
              "The last line reads BUILD SUCCESSFUL, with a time",
              "A deploy to the robot succeeds",
              "You cannot tell without hardware",
            ],
            correctAnswer: 1,
            explanation:
              "One clean build proves Java 25, the vendordeps and the alpha toolchain are all in place. A failure prints BUILD FAILED and a What went wrong block.",
          },
          {
            id: 4,
            question: "The build says invalid source release: 25. Why?",
            options: [
              "Gradle is running on an older JDK than the WPILib one",
              "The template needs Java 21",
              "The vendordeps failed to download",
              "Java 25 is not out yet",
            ],
            correctAnswer: 0,
            explanation:
              "Something is pointing Gradle at a hand-installed JDK. Build from the WPILib menu in VS Code, or point Gradle at the WPILib Java 25 toolchain.",
          },
        ]}
      />
    </PageTemplate>
  );
}
