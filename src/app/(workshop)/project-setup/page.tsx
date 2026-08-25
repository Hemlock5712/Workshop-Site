import PageTemplate from "@/components/PageTemplate";
import LessonSection from "@/components/lesson/LessonSection";
import ImageBlock from "@/components/ImageBlock";
import Box from "@/components/Box";
import Quiz from "@/components/Quiz";
import { MarginNote, ProseBlock, Split } from "@/components/lesson/Prose";

/**
 * The gate to every code lesson in Workshop 2.
 *
 * This page used to clone the team's 2027-Template. It no longer does. Nothing
 * about the 2027 season is official yet, so the offseason course builds its own
 * project from the WPILib New Project Creator and adds the two vendordeps by
 * hand. Workshops 3 and 4 go back to a prepared download, because a swerve
 * drivetrain with CTRE generated constants is not something a student types.
 *
 * Two facts drive the vendordep section, and both are read out of the alpha-6
 * extension rather than guessed. Its `templates.json` marks "OpMode Robot" as
 * `"commandversion": 2`, so a fresh project ships CommandsV2. And CommandsV2's
 * own `conflictsWith` block names CommandsV3 by UUID. A student who skips that
 * step gets a project where no example on this site resolves.
 */
export default function ProjectSetup() {
  return (
    <PageTemplate
      title="Project Setup"
      lede="You generate a robot project with the WPILib New Project Creator, then swap it onto Commands v3 and add Phoenix 6. The build that follows is what matters: it proves Java, Gradle and the vendor libraries work before a lesson depends on them. No hardware yet."
      needs={[
        <>
          The WPILib <strong>2027 alpha 6</strong> installed, from{" "}
          <strong>Prerequisites</strong>.
        </>,
        <>An internet connection. The first build downloads a lot.</>,
        <>A local folder to work in, not one synced to the cloud.</>,
      ]}
      time="13 minutes, plus the first build"
    >
      <Split>
        <ProseBlock>
          <p>
            The New Project Creator ships inside the WPILib copy of VS Code. It
            writes a working robot project in about four clicks, and you never
            create a file by hand.
          </p>
          <p>
            What it writes is not quite what this course teaches, and the second
            half of this page is the one step that fixes it.
          </p>
        </ProseBlock>
        <MarginNote label="Why not a download">
          Workshops 3 and 4 hand you a prepared project instead. A swerve
          drivetrain carries generated CTRE constants and a calibrated module
          layout, and none of that is something you type. Here the point is that
          you built the thing yourself.
        </MarginNote>
      </Split>

      <LessonSection id="make-the-project" title="Make the project">
        <p>
          Open the WPILib copy of VS Code, not the ordinary one. The 2027
          installer put a second VS Code on your machine, and only that copy
          knows about Java 25. Its title bar carries a small red WPILib icon at
          the top right. Click it.
        </p>
        <ImageBlock
          src="/images/project-setup/step-1.png"
          alt="Visual Studio Code welcome screen with the red WPILib icon circled in the top right of the title bar"
          title="Step 1 · The WPILib icon"
          caption="No red icon here means you have the ordinary VS Code open. Close it and find the WPILib one."
          width={1908}
          height={821}
        />
        <p>
          The icon opens the command palette with a <code>&gt;</code> already in
          it. Type <code>WPILib create</code> and pick{" "}
          <strong>WPILib: Create a new project</strong>.
        </p>
        <ImageBlock
          src="/images/project-setup/step-2.png"
          alt="The VS Code command palette filtered to WPILib create, with WPILib: Create a new project highlighted"
          title="Step 2 · Create a new project"
          caption="The palette also lists an import command for older projects. You want the create one."
          width={1908}
          height={821}
        />
        <p>
          The creator runs as four numbered pages. On the first, choose{" "}
          <strong>Template</strong>. An example is somebody else&apos;s finished
          robot, and you would spend the rest of Workshop 2 deleting it.
        </p>
        <ImageBlock
          src="/images/project-setup/step-3.png"
          alt="WPILib New Project Creator step 1, with the Template card selected and Example beside it"
          title="Step 3 · Template, not Example"
          caption="Template gives you a skeleton. Example gives you a complete robot you did not write."
          width={1908}
          height={821}
        />
        <p>
          On the second page set <strong>Language</strong> to <code>java</code>{" "}
          and <strong>Project Base</strong> to <strong>OpMode Robot</strong>.
          OpModes are how the 2027 stack picks which routine runs, and{" "}
          <strong>OpModes</strong> takes them apart later in this workshop.
        </p>
        <ImageBlock
          src="/images/project-setup/step-4.png"
          alt="WPILib New Project Creator step 2, Language set to java and Project Base set to OpMode Robot"
          title="Step 4 · Java and OpMode Robot"
          caption="Timed Robot and Command v2 Robot sit in the same list. Neither matches what this course teaches."
          width={1908}
          height={821}
        />
        <p>
          The third page is the one worth slowing down for. Four fields and a
          checkbox, and three of them cause trouble later if you rush them.
        </p>
        <ol className="ml-5 list-decimal space-y-3">
          <li>
            <strong>Base Folder.</strong> Click <strong>Select Folder</strong>{" "}
            and pick <code>Downloads</code>, or any plain local path. Check that
            the box does not read <code>OneDrive</code> anywhere.
          </li>
          <li>
            <strong>Project Name.</strong> Type <code>Workshop</code>. Later
            lessons name that folder when they tell you where to look.
          </li>
          <li>
            <strong>Team Number.</strong> Yours. A deploy has no address to look
            for without it, and the screenshot below shows 5712.
          </li>
          <li>
            <strong>Enable Desktop Support.</strong> Tick it. This is the box
            that turns on simulation, and Workshop 2 runs the arm in simulation
            before it runs on a motor.
          </li>
        </ol>
        <ImageBlock
          src="/images/project-setup/step-5.png"
          alt="WPILib New Project Creator step 3, with base folder Downloads, project name Workshop, team number 5712, and Enable Desktop Support circled and checked"
          title="Step 5 · Location and config"
          caption="Enable Desktop Support is circled. Miss it and simulation is not available in this project."
          width={1908}
          height={821}
        />
        <Box variant="alert-warning" title="Not in OneDrive">
          <p>
            OneDrive, Google Drive and Dropbox rewrite files underneath Gradle
            while it is working. The build then fails in ways that look like
            broken code, and teams lose whole meetings to it. On a school laptop{" "}
            <code>Documents</code> and <code>Desktop</code> are often synced
            without anyone saying so. <code>Downloads</code> usually is not.
          </p>
        </Box>
        <p>
          The fourth page repeats your choices back. Read the{" "}
          <strong>Location</strong> line, then press{" "}
          <strong>Create Project</strong>.
        </p>
        <ImageBlock
          src="/images/project-setup/step-6.png"
          alt="WPILib New Project Creator step 4, reviewing project type Template, language java, project base OpMode Robot, location and team number"
          title="Step 6 · Review and create"
          caption="Five lines. If any of them is wrong, Back is cheaper than fixing it afterwards."
          width={1908}
          height={821}
        />
        <p>
          A dialog asks whether to open the folder. Choose{" "}
          <strong>Yes (Current Window)</strong>. A new window works too, and
          leaves you with two VS Code windows and no way to tell them apart.
        </p>
        <ImageBlock
          src="/images/project-setup/step-7.png"
          alt="Dialog reading Project successfully created. Would you like to open the folder, with Yes (Current Window), Yes (New Window) and No"
          title="Step 7 · Yes (Current Window)"
          caption="Pressing No leaves the project on disk unopened. File then Open Folder recovers it."
          width={1908}
          height={821}
        />
      </LessonSection>

      <LessonSection id="vendor-libraries" title="Commands v3 and Phoenix 6">
        <p>
          The installer carries both <strong>Commands v2</strong> and{" "}
          <strong>Commands v3</strong>, and a project holds one or the other.
          Yours came with v2. Look in <code>vendordeps/</code> and you will find
          a lone <code>CommandsV2.json</code> there.
        </p>
        <p>
          Nothing is broken yet, because the OpMode template never calls a
          command. But every Java example here is Commands v3, and the extension
          refuses to install v3 while v2 sits in that folder. Swap it now rather
          than halfway through a lesson.
        </p>
        <p>
          There is no Commands v3 template to pick instead, and you did not miss
          it. OpModes are the robot framework, Commands v3 is a separate
          library, and no template in the alpha pairs them. You make that
          pairing here.
        </p>
        <p>
          All three happen in one panel. Click the WPILib icon in the activity
          bar, the narrow strip of icons down the left edge, to open{" "}
          <strong>WPILib Vendor Dependencies</strong>. Everything below is a
          button in that panel, and nothing needs a URL typed.
        </p>
        <ol className="ml-5 list-decimal space-y-3">
          <li>
            Under <strong>Installed Dependencies</strong>, delete{" "}
            <strong>Commands V2</strong> with the bin icon beside it. Do this
            first. Installing v3 while v2 is there fails with a modal error.
          </li>
          <li>
            Under <strong>Available Dependencies</strong>, install{" "}
            <strong>Commands v3</strong>. It reads{" "}
            <code>Loaded from Local Copy</code>, because it came with the alpha
            and needs no download.
          </li>
          <li>
            In the same list, install <strong>CTRE-Phoenix (v6)</strong>. Take
            care here. <strong>CTRE-Phoenix Replay (v6)</strong> sits directly
            under it and is a different library. Phoenix ignores the commands
            version, so its position in this order does not matter.
          </li>
        </ol>
        <ImageBlock
          src="/images/project-setup/step-8.png"
          alt="The WPILib Vendor Dependencies panel, with the activity bar icon, the Commands V2 bin, and both Install buttons circled"
          title="Step 8 · All three, one panel"
          caption="Four circles: the panel icon, the bin, and the two Install buttons. Installed Dependencies should read 2 at the end."
          width={1908}
          height={821}
        />
        <p>
          Changing a dependency starts a build on its own, which is the terminal
          output in the corner of that screenshot. Leave it alone. The first one
          fetches Gradle, the Java 25 toolchain and the vendor libraries. That
          runs for several minutes at home, longer on school Wi-Fi. Later builds
          take seconds, because Gradle caches all of it in your home folder
          rather than in the project.
        </p>
        <p>
          One thing goes wrong here, and it is the network. A build that stops
          on <code>Could not resolve</code> could not reach a library it needed.
          Reconnect and build again. Nothing is corrupted, and the parts that
          did arrive are already cached.
        </p>
        <p>
          Leaving Commands v2 in place produces a clean build, then a wall of
          unresolved imports the moment you paste a lesson example. The versions
          you should end up with are below.
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
                  The alpha 6 install, through the generated build file.
                </td>
              </tr>
              <tr style={{ borderBottom: "1px solid var(--rule-soft)" }}>
                <td className="px-3 py-2">Commands</td>
                <td className="px-3 py-2">
                  <code>v3</code>
                </td>
                <td className="px-3 py-2">
                  You installed it. The template shipped v2.
                </td>
              </tr>
              <tr style={{ borderBottom: "1px solid var(--rule-soft)" }}>
                <td className="px-3 py-2">Phoenix 6</td>
                <td className="px-3 py-2">
                  <code>26.50.0-alpha-1</code>
                </td>
                <td className="px-3 py-2">
                  CTRE&apos;s maven, downloaded on the first build.
                </td>
              </tr>
              <tr>
                <td className="px-3 py-2">Java</td>
                <td className="px-3 py-2">
                  <code>25</code>
                </td>
                <td className="px-3 py-2">
                  Came with WPILib. Do not install a second one yourself.
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </LessonSection>

      <LessonSection id="check-your-work" title="Check your work">
        <p>
          Wait for the build to settle, then look at the file tree. If it has
          already scrolled past, <strong>Build Robot Code</strong> in the WPILib
          menu runs it again.
        </p>
        <Box variant="alert-success" title="You should see">
          <ul className="ml-5 list-disc space-y-2">
            <li>
              <code>BUILD SUCCESSFUL</code> as the last line of the terminal.
            </li>
            <li>
              A <code>Workshop</code> folder under <code>Downloads</code>, with{" "}
              <code>gradlew</code> at the top of it.
            </li>
            <li>
              <code>CommandsV3.json</code> and a Phoenix 6 file under{" "}
              <code>vendordeps/</code>, and no <code>CommandsV2.json</code>.
            </li>
            <li>
              Your team number in <code>.wpilib/wpilib_preferences.json</code>.
            </li>
            <li>
              A <code>Robot.java</code>, and an <code>opmode</code> folder
              holding <code>MyTeleop</code> and <code>MyAuto</code>.
            </li>
          </ul>
        </Box>
        <p>
          Those two opmode files are the ones <strong>OpModes</strong> rewrites,
          and <code>Robot.java</code> is where{" "}
          <strong>Building Mechanisms</strong> hangs its first subsystem. Leave
          them where they are.
        </p>
      </LessonSection>

      <Quiz
        questions={[
          {
            id: 1,
            question: "Which Project Base does this course use?",
            options: [
              "Timed Robot, the simplest one in the list",
              "Command v2 Robot, because the course teaches commands",
              "OpMode Robot",
              "RobotBase Skeleton, for full control",
            ],
            correctAnswer: 2,
            explanation:
              "OpModes are how the 2027 stack chooses which routine runs, and each mode is its own class. Command v2 Robot is the trap in this list: the course is Commands v3 throughout.",
          },
          {
            id: 2,
            question:
              "A fresh OpMode Robot project ships Commands v2. Why swap it?",
            options: [
              "Every Java example here is Commands v3, and WPILib holds only one version",
              "Commands v2 runs slower on SystemCore",
              "Commands v2 does not compile under Java 25",
              "It is optional, and both work fine",
            ],
            correctAnswer: 0,
            explanation:
              "The two vendordeps name each other as conflicts, so a project holds one or the other. Skip the swap and the project builds clean until you paste a lesson example, then nothing resolves.",
          },
          {
            id: 3,
            question: "Why not put the project in a OneDrive folder?",
            options: [
              "OneDrive deletes Java files",
              "Git does not work inside OneDrive",
              "OneDrive makes the robot run slower",
              "Sync rewrites files while Gradle is working, and the build fails",
            ],
            correctAnswer: 3,
            explanation:
              "Cloud sync moves files underneath Gradle mid-build. The failures that follow look like broken code. On a school laptop Documents and Desktop are often synced quietly, so read the path before you accept it.",
          },
          {
            id: 4,
            question: "What does Enable Desktop Support turn on?",
            options: [
              "Deploying over USB instead of Wi-Fi",
              "Simulation and unit testing",
              "A desktop shortcut for the project",
              "Support for a second driver station",
            ],
            correctAnswer: 1,
            explanation:
              "Workshop 2 runs the arm in simulation before it runs on a motor. Leave the box unticked and simulation is not available, and the fix is making the project again.",
          },
          {
            id: 5,
            question: "How do you know the first build worked?",
            options: [
              "The editor shows no red squiggles",
              "A deploy to the robot succeeds",
              "You cannot tell without hardware",
              "The last line reads BUILD SUCCESSFUL, with a time",
            ],
            correctAnswer: 3,
            explanation:
              "One clean build proves Java 25, the vendordeps and the alpha toolchain are all in place. A failure prints BUILD FAILED, with a What went wrong block a few lines above the end.",
          },
          {
            id: 6,
            question:
              "The list offers CTRE-Phoenix (v6) and CTRE-Phoenix Replay (v6). Which do you install?",
            options: [
              "CTRE-Phoenix (v6)",
              "CTRE-Phoenix Replay (v6), since replay is the newer one",
              "Both, so logs can be replayed later",
              "Neither, because Phoenix comes with the template",
            ],
            correctAnswer: 0,
            explanation:
              "Replay is a separate library for re-running saved logs, and the two conflict. No template ships Phoenix at all, so this install is needed whichever base you pick.",
          },
        ]}
      />
    </PageTemplate>
  );
}
