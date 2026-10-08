import PageTemplate from "@/components/PageTemplate";
import LessonSection from "@/components/lesson/LessonSection";
import Box from "@/components/Box";
import CodeBlock from "@/components/CodeBlock";
import Quiz from "@/components/Quiz";
import { MarginNote, ProseBlock, Split } from "@/components/lesson/Prose";
import { lessonMetadata } from "@/lib/lessonMetadata";

export const metadata = lessonMetadata("/git-workflow");

/**
 * Git, taught through the Source Control view of the WPILib VS Code, because
 * that is the window a student already has open. The plain git commands sit in
 * one block for whoever prefers a terminal, and GitHub Desktop gets a line.
 *
 * Facts this page leans on, checked rather than assumed:
 * - The New Project Creator does not run `git init`. The alpha-7 extension
 *   bundle has no git call in it, so the student initialises the repository.
 * - The generated `.gitignore` already ignores `/build/`, `.gradle` and
 *   `bin/`, which is why committed build output means a missing or bypassed
 *   ignore file rather than a missing line in it.
 * - The generated project has no Spotless. Every Workshop-Code branch does,
 *   with `JavaCompile` depending on `spotlessApply`, so a build formats. The
 *   block shown here is that one with the Limelight and Tuner X excludes
 *   dropped, since a fresh project has neither.
 */
export default function GitWorkflow() {
  return (
    <PageTemplate
      title="Git and Pull Requests"
      lede="Git records every change to the project, and GitHub holds the team's copy. Each change happens on its own branch, and a teammate reads it in a pull request before it reaches main."
      needs={[
        <>
          The <code>Workshop</code> project from{" "}
          <a href="/project-setup" className="underline">
            Project Setup
          </a>
          , building clean.
        </>,
        <>
          Git installed from <strong>git-scm.com</strong>. The WPILib installer
          does not include it.
        </>,
        <>A GitHub account, and a teammate with one, for the review step.</>,
      ]}
      time="14 minutes"
    >
      <Split>
        <ProseBlock>
          <p>
            Three words carry this page. A <strong>commit</strong> is a saved
            snapshot of the project with a message saying what changed. A{" "}
            <strong>branch</strong> is a line of commits you can work on without
            touching anyone else&apos;s. The <strong>main</strong> branch is the
            one the robot runs, so it only ever holds code somebody else has
            read.
          </p>
        </ProseBlock>
        <MarginNote label="Other tools">
          GitHub Desktop does every step here with the same names: branch,
          commit, push, pull request. Pick one tool per team, so that the person
          helping you sees the same screen.
        </MarginNote>
      </Split>

      <LessonSection id="put-it-on-github" title="Put the project on GitHub">
        <p>
          One person on the team does this once. Everyone else clones the
          result.
        </p>
        <ol className="ml-5 list-decimal space-y-3">
          <li>
            Open the <code>Workshop</code> folder in the WPILib VS Code and open{" "}
            <strong>Source Control</strong> with <strong>Ctrl+Shift+G</strong>.
          </li>
          <li>
            Click <strong>Initialize Repository</strong>.{" "}
            <strong>You should see:</strong> every project file listed under{" "}
            <strong>Changes</strong>, and no <code>build</code> folder among
            them.
          </li>
          <li>
            Type <code>Generated project</code> in the message box and click{" "}
            <strong>Commit</strong>. Answer <strong>Yes</strong> when it offers
            to stage all your changes.
          </li>
          <li>
            Click <strong>Publish Branch</strong>, sign in to GitHub when asked,
            and choose a private repository.
          </li>
        </ol>
        <p>
          A teammate gets a copy with <strong>Git: Clone</strong> from the
          command palette, then <strong>Clone from GitHub</strong>, then the
          repository name. Clone into <code>Downloads</code> or another plain
          local folder, for the same reason as the project.
        </p>
      </LessonSection>

      <LessonSection id="branch-and-commit" title="Branch, commit, push">
        <p>
          Every change starts from an up to date main. Pull first, then branch,
          so your work starts from what the team has now.
        </p>
        <ol className="ml-5 list-decimal space-y-3">
          <li>
            Click the branch name at the bottom left of the window. Check it
            says <code>main</code>, then open <strong>&hellip;</strong> in
            Source Control and choose <strong>Pull</strong>.
          </li>
          <li>
            Click the branch name again, choose{" "}
            <strong>Create new branch</strong>, and name it for the change:{" "}
            <code>arm-intake-angle</code>, not <code>my-branch</code>.
          </li>
          <li>
            Make the change and build it. Then commit with a message that says
            what the code now does: <code>Lower the intake angle to 0.48</code>.
          </li>
          <li>
            Click <strong>Publish Branch</strong>. Later commits on the same
            branch go up with <strong>Sync Changes</strong>.
          </li>
        </ol>
        <p>
          Commit whenever the project builds and one thing is finished. Five
          small commits are easier to read in review, and easier to undo, than
          one commit holding a whole evening.
        </p>
        <CodeBlock
          language="shell"
          title="The same steps in a terminal"
          showLineNumbers={false}
          code={`git switch main
git pull
git switch -c arm-intake-angle
git add -A
git commit -m "Lower the intake angle to 0.48"
git push -u origin arm-intake-angle`}
        />
      </LessonSection>

      <LessonSection id="pull-request" title="Pull request and review">
        <ol className="ml-5 list-decimal space-y-3">
          <li>
            Open the repository on GitHub. A banner offers{" "}
            <strong>Compare &amp; pull request</strong> for the branch you just
            pushed. Click it.
          </li>
          <li>
            Check the base is <code>main</code>. In the description, write what
            changed and how you tested it: &quot;Ran in hardware simulation, arm
            stops at the new angle.&quot;
          </li>
          <li>
            Add a teammate under <strong>Reviewers</strong> and click{" "}
            <strong>Create pull request</strong>.
          </li>
          <li>
            The reviewer opens <strong>Files changed</strong>, leaves a comment
            on any line they question, and chooses <strong>Approve</strong> or{" "}
            <strong>Request changes</strong>. New commits pushed to the branch
            join the same pull request.
          </li>
          <li>
            Once approved, click <strong>Merge pull request</strong>, then{" "}
            <strong>Delete branch</strong>. Back in VS Code, switch to main and
            pull.
          </li>
        </ol>
        <p>
          The reviewer checks that the change does what the description says and
          nothing else, and that it follows the conventions below. When a line
          is unclear, they ask. The answer usually belongs in a comment in the
          code, where the next reader will find it.
        </p>
      </LessonSection>

      <LessonSection id="team-conventions" title="Team conventions">
        <p>
          Every branch of Workshop-Code formats itself with{" "}
          <strong>Spotless</strong>, using the same Google Java Format that
          WPILib uses. Add it to your <code>build.gradle</code> once: the plugin
          line goes inside the existing <code>plugins</code> block, and the rest
          goes at the bottom of the file.
        </p>
        <CodeBlock
          filename="build.gradle"
          language="groovy"
          code={`plugins {
    // ...the three plugins already here
    id "com.diffplug.spotless" version "8.9.0"
}

spotless {
    lineEndings = 'PRESERVE'
    java {
        target fileTree('.') {
            include 'src/**/*.java'
            exclude '**/build/**', '**/bin/**'
        }
        toggleOffOn()
        googleJavaFormat('1.35.0')
        removeUnusedImports()
        trimTrailingWhitespace()
        endWithNewline()
    }
}

// Format on every build.
tasks.withType(JavaCompile).configureEach {
    dependsOn 'spotlessApply'
}`}
        />
        <p>
          With that last block, every <strong>Build Robot Code</strong> formats
          the project first, so nobody argues about indentation in review. To
          format without building, run <code>.\gradlew spotlessApply</code> in
          the VS Code terminal. <code>.\gradlew spotlessCheck</code> only
          reports.
        </p>
        <p>The rest of what this course already does, written down:</p>
        <ul className="ml-5 list-disc space-y-2">
          <li>
            A mechanism class is named for the thing: <code>Arm</code>,{" "}
            <code>Flywheel</code>. Its command methods are named for the result:{" "}
            <code>vertical()</code>, <code>runFast()</code>.
          </li>
          <li>
            A method that answers yes or no starts with <code>is</code>, like{" "}
            <code>isAtTarget()</code>.
          </li>
          <li>
            Lambdas are written <code>() -&gt; stopMotor()</code>, never{" "}
            <code>this::stopMotor</code>.
          </li>
          <li>One change per pull request, on a branch named for it.</li>
          <li>Nobody commits to main directly, including mentors.</li>
        </ul>
        <Split>
          <p>
            GitHub can enforce the last rule. In the repository, open{" "}
            <strong>Settings</strong>, then <strong>Branches</strong>, add a
            rule for <code>main</code>, and tick{" "}
            <strong>Require a pull request before merging</strong>.
          </p>
          <MarginNote label="Why main stays clean">
            At an event, the code that goes on the robot is whatever main holds.
            A half-finished commit on main is a half-finished robot in the next
            match.
          </MarginNote>
        </Split>
      </LessonSection>

      <LessonSection id="when-it-goes-wrong" title="When it goes wrong">
        <ul className="ml-5 list-disc space-y-3">
          <li>
            <strong>Merge conflict.</strong> GitHub says the branch has
            conflicts, because two branches changed the same lines. In VS Code,
            switch to main and pull, switch back to your branch, then{" "}
            <strong>&hellip;</strong>, <strong>Branch</strong>,{" "}
            <strong>Merge</strong>, and pick <code>main</code>. Each conflict
            shows both versions between{" "}
            <code>&lt;&lt;&lt;&lt;&lt;&lt;&lt;</code> and{" "}
            <code>&gt;&gt;&gt;&gt;&gt;&gt;&gt;</code> markers. Pick{" "}
            <strong>Accept Current</strong>, <strong>Accept Incoming</strong>,
            or edit by hand, then build, commit and sync.
          </li>
          <li>
            <strong>Build output in the commit.</strong> Files under{" "}
            <code>build/</code> or <code>.gradle/</code> appear in{" "}
            <strong>Changes</strong>. The generated <code>.gitignore</code>{" "}
            excludes both, so it is missing or the project sits inside another
            repository. Copy <code>.gitignore</code> back from a fresh project,
            run <code>git rm -r --cached build</code>, and commit.
          </li>
          <li>
            <strong>Forgot to pull.</strong> The push is rejected and VS Code
            says to pull first, because the remote branch has commits you do
            not. Pull, build, then push again. A branch made from a stale main
            shows up later as a conflict, so the branch step starts with a pull.
          </li>
        </ul>
      </LessonSection>

      <LessonSection id="check-your-work" title="Check your work">
        <p>
          Make one small change on a branch, such as a comment above{" "}
          <code>Robot</code>, and take it all the way through review.
        </p>
        <Box variant="alert-success" title="You should see">
          <ul className="ml-5 list-disc space-y-2">
            <li>
              A merged pull request on GitHub, with a teammate&apos;s approval
              on it.
            </li>
            <li>
              Your commit message at the top of main&apos;s history on GitHub.
            </li>
            <li>
              Your teammate pulls main, builds, and gets{" "}
              <code>BUILD SUCCESSFUL</code> with your change in it.
            </li>
          </ul>
        </Box>
      </LessonSection>

      <Quiz
        questions={[
          {
            id: 1,
            question:
              "You want to change the flywheel's fast speed. You are on main. What do you do first?",
            options: [
              "Edit Flywheel.java, commit, and push to main",
              "Pull main, then create a branch named for the change",
              "Create a branch, then pull main into it after you finish",
              "Open a pull request, then start editing",
            ],
            correctAnswer: 1,
            explanation:
              "Pull first so the branch starts from what the team has now, then branch so the change stays off main until someone has reviewed it. Branching from a stale main is how a conflict shows up later.",
          },
          {
            id: 2,
            question:
              "Source Control lists two hundred files under build/ after your first build. What went wrong?",
            options: [
              "Nothing. Build output belongs in the repository",
              "Spotless formatted every file in the build",
              "The .gitignore is missing, or the project sits inside another repository",
              "The build failed and left temporary files behind",
            ],
            correctAnswer: 2,
            explanation:
              "The generated .gitignore excludes /build/. When those files show up, that rule is not being applied. Never commit them: they change on every build and turn every pull request into noise.",
          },
          {
            id: 3,
            question:
              "Your pull request fixes the arm angle and also renames every method in Flywheel. What should the reviewer ask for?",
            options: [
              "Two pull requests, one for each change",
              "Nothing, because both changes build",
              "A longer description explaining both",
              "Squash the commits into one before merging",
            ],
            correctAnswer: 0,
            explanation:
              "One change per pull request. The rename buries the angle fix in a hundred lines of unrelated diff, and if the rename breaks something the fix has to be reverted with it.",
          },
          {
            id: 4,
            question:
              "Your push is rejected with a message to pull first. What happened?",
            options: [
              "Spotless found unformatted code",
              "Your GitHub sign-in expired",
              "Branch protection blocks pushes to every branch",
              "The remote branch has commits that your copy does not",
            ],
            correctAnswer: 3,
            explanation:
              "Someone pushed to the same branch after your last pull. Pull, build to make sure the combined code still works, then push.",
          },
        ]}
      />
    </PageTemplate>
  );
}
