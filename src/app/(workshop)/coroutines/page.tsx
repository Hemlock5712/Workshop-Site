import PageTemplate from "@/components/PageTemplate";
import { MarginNote, ProseBlock, Split } from "@/components/lesson/Prose";
import LessonSection from "@/components/lesson/LessonSection";
import KeyConceptSection from "@/components/KeyConceptSection";
import CodeBlock from "@/components/CodeBlock";
import Box from "@/components/Box";
import CollapsibleSection from "@/components/CollapsibleSection";
import GitHubContent from "@/components/GitHubContent";
import DocumentationButton from "@/components/DocumentationButton";
import Quiz from "@/components/Quiz";
import { GitBranch } from "lucide-react";

export default function Coroutines() {
  return (
    <PageTemplate
      title="A routine that can pause in the middle"
      emphasis="pause in the middle"
      lede="A coroutine is code that can stop partway through and pick up later at the same spot. That lets you write a robot routine the way you would say it out loud: raise the arm, wait for it, spin the flywheel, wait for it, shoot."
      needs={[
        <>
          An <code>Arm</code> with <code>vertical()</code> and{" "}
          <code>isAtTarget()</code>, and a <code>Flywheel</code> with{" "}
          <code>runFast()</code> and <code>isAtTarget()</code> — all from{" "}
          <strong>Finish Lines</strong>.
        </>,
        <>
          Tuned arm gains from <strong>PID Control</strong> and{" "}
          <strong>Motion Magic</strong>. The branch ships them as zeros; an
          untuned arm never reaches 90&deg; and this whole routine runs on
          timeouts.
        </>,
        <>
          The run-and-watch loop from <strong>Running Your Code</strong>.
        </>,
      ]}
      branch="6-Coroutines"
      time="Roughly 45 minutes"
    >
      <Split>
        <KeyConceptSection
          description={[
            "This is the second dialect, not a better one. Chaining stays the default. Reach for a coroutine when a hold has to stay alive across several steps, or when the routine needs a real loop or a real if.",
          ]}
          concept="A coroutine pauses and resumes, so a routine reads as a plain list of steps."
        />
        <MarginNote label="WHAT YOU'LL BUILD">
          One new file — <code>RaiseAndShootOpMode.java</code>, an autonomous
          routine that raises the arm, spins up the flywheel while the arm keeps
          holding, and shoots.
        </MarginNote>
      </Split>

      <p>
        You are switching back to the <strong>mechanism track</strong>. The last
        time you touched arm-and-flywheel code was <strong>Finish Lines</strong>
        , on <code>5-GettersAndSetters</code>. Pick that project back up and
        check out the next branch:
      </p>

      <CodeBlock
        language="bash"
        hideControls
        code={`git checkout 6-Coroutines`}
      />

      {/* ── chaining is still the default ────────────────────────────── */}
      <LessonSection
        id="chaining-is-still-the-default"
        title="Chaining is still the default"
      >
        <p className="prose-body measure">
          The robot template ships the same autonomous routine written twice,
          once in each dialect, and it does not hedge about which one you should
          reach for. The chained version&apos;s own comment says it is &quot;the
          recommended style for multi-mechanism autos on this team - chaining is
          as far as most routines ever need to go.&quot; The coroutine version
          calls itself &quot;the advanced dialect&quot; in its opening sentence,
          and the one right after it says &quot;Most routines don&apos;t need
          this.&quot;
        </p>

        <Box variant="concept" title="When a coroutine earns its keep">
          <p>Two situations, both from the template&apos;s own comments:</p>
          <ul className="ml-4 mt-3 list-disc space-y-2">
            <li>
              <strong>A hold has to span several steps.</strong> In a sequence,
              a hold must be given a finish line before the next step can run,
              so it stops. In a coroutine you start it once and it keeps running
              underneath everything that follows.
            </li>
            <li>
              <strong>The logic needs a real loop or a real branch.</strong> A
              sequence is a fixed list. A coroutine body is ordinary Java, so{" "}
              <code>while</code> and <code>if</code> work the way they always
              do.
            </li>
          </ul>
          <p className="mt-3">
            Everything else — two steps in order, a step with a time limit, a
            step run while something is held — is a job for{" "}
            <code>Command.sequence</code> and <code>Command.race</code>. Do not
            rewrite working chained routines into coroutines.
          </p>
        </Box>
      </LessonSection>

      {/* ── the verbs ────────────────────────────────────────────────── */}
      <LessonSection id="four-verbs" title="Four verbs">
        <p className="prose-body measure">
          Inside a coroutine body you get an object called{" "}
          <code>coroutine</code>. Four of its methods carry almost every routine
          you will write. The branch file you are about to build lists exactly
          these four in its own comment header.
        </p>

        <ul
          className="ml-5 list-disc space-y-3"
          style={{ color: "var(--tx2)" }}
        >
          <li>
            <code>coroutine.fork(command)</code> — start a command and keep
            going. It runs underneath you until you cancel it or the routine
            ends.
          </li>
          <li>
            <code>coroutine.await(command)</code> — run a command and stop here
            until it finishes.
          </li>
          <li>
            <code>coroutine.waitUntil(condition)</code> — stop here until the
            condition is true.
          </li>
          <li>
            <code>coroutine.yield()</code> — stop here for exactly one scheduler
            loop, then carry on. This is the one you need when you write your
            own loop; it is what lets other commands run while your loop is
            going. You will use it on{" "}
            <strong>{"Drive to Tag, Written as a Coroutine "}</strong>.
          </li>
        </ul>

        <Box
          variant="alert-warning"
          tag="THE ONE RULE, AGAIN"
          title="Never await a hold"
        >
          <p>
            <code>arm.vertical()</code> is a hold. It re-sends its position
            request every loop and never finishes on its own.{" "}
            <code>coroutine.await(arm.vertical())</code> would therefore sit
            there for the rest of the match. Nothing errors and nothing logs —
            the routine stops at that line.
          </p>
          <p className="mt-3">
            <code>fork</code> is the answer. It starts the hold and returns
            immediately, so the next line runs while the arm keeps holding. This
            is the same rule you met on <strong>Chaining Commands</strong>,
            spelled with a different verb.
          </p>
        </Box>

        <CollapsibleSection title="Three more you will see, but do not need yet">
          <ul
            className="ml-5 list-disc space-y-2"
            style={{ color: "var(--tx2)" }}
          >
            <li>
              <code>coroutine.park()</code> — stop here permanently. Nothing
              after it ever runs, and the command has to be canceled from
              outside. This is what <code>Mechanism.idle()</code> is built from.
            </li>
            <li>
              <code>coroutine.awaitAll(commands)</code> — wait for every one of
              them to finish.
            </li>
            <li>
              <code>coroutine.awaitAny(commands)</code> — wait for the first one
              to finish, then cancel the rest.
            </li>
          </ul>
        </CollapsibleSection>
      </LessonSection>

      {/* ── build it ─────────────────────────────────────────────────── */}
      <LessonSection id="build-the-routine" title="Build the routine">
        <p className="prose-body measure">
          The <code>5-GettersAndSetters</code> &rarr; <code>6-Coroutines</code>{" "}
          diff adds exactly one file and changes nothing else. Six steps, and
          the file is done.
        </p>

        {/* step 1 */}
        <h3 className="display m-0 text-aside">
          Step 1 — Make the file and the empty shell
        </h3>

        <p className="prose-body measure">
          New file:{" "}
          <code>src/main/java/frc/robot/opmodes/RaiseAndShootOpMode.java</code>.
          It is a whole OpMode, so it looks like <code>TeleopOpMode</code> —
          annotation on the class, mechanisms pulled out of <code>Robot</code>{" "}
          in the constructor.
        </p>

        <CodeBlock
          language="java"
          title="RaiseAndShootOpMode.java — the shell"
          code={`package frc.robot.opmodes;

import frc.robot.Robot;
import frc.robot.subsystems.Arm;
import frc.robot.subsystems.Flywheel;
import org.wpilib.command3.Command;
import org.wpilib.command3.Scheduler;
import org.wpilib.opmode.Autonomous;
import org.wpilib.opmode.PeriodicOpMode;

@Autonomous(name = "Raise And Shoot")
public class RaiseAndShootOpMode extends PeriodicOpMode {
  private final Command routine;

  public RaiseAndShootOpMode(Robot robot) {
    final Arm arm = robot.arm;
    final Flywheel flywheel = robot.flywheel;

    routine =
        Command.noRequirements(
                coroutine -> {
                  // Steps 2 to 6 go in here.
                })
            .named("Raise And Shoot");
  }

  @Override
  public void start() {
    Scheduler.getDefault().schedule(routine);
  }

  @Override
  public void end() {
    Scheduler.getDefault().cancel(routine);
  }
}`}
        />

        <p className="prose-body measure">
          Three things here are worth naming.{" "}
          <code>Command.noRequirements</code> builds a command that claims no
          mechanism of its own — the forked commands claim theirs, one at a
          time, which is the whole point.{" "}
          <code>.named(&quot;Raise And Shoot&quot;)</code> is the same mandatory
          terminal every group needs. And building the routine in the
          constructor does not run it: a built <code>Command</code> sits inert
          until something hands it to the scheduler, which is what{" "}
          <code>start()</code> does.
        </p>

        <p className="prose-body measure">
          <strong>Result:</strong> the project builds, and{" "}
          <strong>Raise And Shoot</strong> shows up in the autonomous list on
          the driver station. Selecting it does nothing yet, because the body is
          empty.
        </p>

        <p className="prose-body measure">
          The finished file on the branch has one more import at the top,{" "}
          <code>import static org.wpilib.units.Units.Seconds;</code>. It is not
          in the shell because nothing in the shell uses it yet. Step 3 is where
          it comes in.
        </p>

        {/* step 2 */}
        <h3 className="display m-0 text-aside">
          Step 2 — Start the arm hold with <code>fork</code>
        </h3>

        <CodeBlock
          language="java"
          title="First line of the body"
          code={`// fork, not await: vertical() is a hold and never finishes.
coroutine.fork(arm.vertical());`}
        />

        <p className="prose-body measure">
          <strong>Result:</strong> run it and the arm does essentially nothing.
          That is correct, and it is worth understanding. The body has no lines
          after the fork, so the routine reaches its end on the very first pass
          — and ending a routine cancels everything it forked. The hold is
          created and destroyed in the same breath. Step 3 gives the routine
          something to wait for.
        </p>

        <Box variant="alert-tip" title="A command on its own line does nothing">
          <p>
            Writing <code>arm.vertical();</code> without the{" "}
            <code>coroutine.fork(...)</code> around it compiles fine and has no
            effect at all. You built a <code>Command</code> object and then
            threw it away. Every command needs someone to schedule it — a
            trigger binding, <code>Scheduler.getDefault().schedule(...)</code>,
            or <code>fork</code> / <code>await</code>.
          </p>
        </Box>

        {/* step 3 */}
        <h3 className="display m-0 text-aside">
          Step 3 — Wait for the arm, with a seatbelt
        </h3>

        <p className="prose-body measure">
          Add <code>import static org.wpilib.units.Units.Seconds;</code> at the
          top of the file first. If you added it back in step 1, it is gone:
          every compile on this branch runs <code>spotlessApply</code> first,
          and <code>removeUnusedImports()</code> deletes any import the file
          does not use yet.
        </p>

        <CodeBlock
          language="java"
          title="Add below the fork"
          code={`// Always time out a wait in an auto, or a stuck arm freezes the whole match.
coroutine.await(
    Command.waitUntil(arm::isAtTarget)
        .named("wait for the arm")
        .withTimeout(Seconds.of(3.0))); // TODO: time your own arm`}
        />

        <p className="prose-body measure">
          <code>Command.waitUntil(arm::isAtTarget)</code> is a command that does
          nothing except finish once the arm is within 1&deg; of its target.
          That one <em>does</em> end on its own, so <code>await</code> is safe
          here. The three-second timeout is what stops a jammed arm from eating
          the entire fifteen-second autonomous period.
        </p>

        <Box
          variant="alert-warning"
          tag="ORDER MATTERS"
          title="named first, then withTimeout"
        >
          <p>
            <code>Command.waitUntil(...)</code> hands you a builder, not a
            finished command. <code>.named(&quot;...&quot;)</code> is what turns
            it into a <code>Command</code>, and <code>.withTimeout(...)</code>{" "}
            is a method on <code>Command</code>. Written the other way round it
            does not compile:
          </p>
          <div className="mt-3">
            <CodeBlock
              language="java"
              hideControls
              code={`// Does not compile — the builder has no withTimeout.
Command.waitUntil(arm::isAtTarget).withTimeout(Seconds.of(3.0)).named("...")

// Compiles — name it into a Command, then decorate the Command.
Command.waitUntil(arm::isAtTarget).named("wait for the arm").withTimeout(Seconds.of(3.0))`}
            />
          </div>
          <p className="mt-3">
            This is the mirror image of the rule from{" "}
            <strong>Chaining Commands</strong>. There you could not re-name an
            already-finished command; here you cannot decorate an unfinished
            builder. Naming is the line between the two.
          </p>
        </Box>

        {/* step 4 */}
        <h3 className="display m-0 text-aside">
          Step 4 — The flywheel, exactly the same pair
        </h3>

        <CodeBlock
          language="java"
          title="Add below the arm wait"
          code={`// The arm hold is still running here - that is the point of fork.
coroutine.fork(flywheel.runFast());
coroutine.await(
    Command.waitUntil(flywheel::isAtTarget)
        .named("wait for the flywheel")
        .withTimeout(Seconds.of(3.0)));`}
        />

        <p className="prose-body measure">
          Two forks are now live at once and neither has been canceled. The arm
          is still being commanded to 90&deg; while the flywheel climbs to 75
          rotations per second. This is the thing a sequence cannot do without
          wrapping every later step in a <code>Command.race</code> against the
          arm hold.
        </p>

        {/* step 5 */}
        <h3 className="display m-0 text-aside">Step 5 — Shoot</h3>

        <CodeBlock
          language="java"
          title="Add below the flywheel wait"
          code={`coroutine.wait(Seconds.of(1.0)); // shoot`}
        />

        <p className="prose-body measure">
          Nothing in that line fires a shot, and that is not an omission.{" "}
          <code>6-Coroutines</code> has two mechanisms, <code>Arm</code> and{" "}
          <code>Flywheel</code> — there is no feeder and no indexer to build a
          shoot command out of. So &quot;shoot&quot; here means &quot;hold the
          flywheel at speed for a second while a piece is fed in by hand,&quot;
          and the wait is the placeholder where a real feeder command would go.
        </p>

        <p className="prose-body measure">
          <code>wait(Time)</code> is <code>waitUntil</code>&apos;s timed
          sibling: it pauses for a fixed duration instead of for a condition.
          Both forks keep running while it pauses. One second is a guess — this
          is the line you shorten once you have watched a real game piece leave
          the wheel.
        </p>

        {/* step 6 */}
        <h3 className="display m-0 text-aside">Step 6 — Fall off the end</h3>

        <CodeBlock
          language="java"
          title="The last line in the body"
          code={`// Ending the routine cancels both forked holds.`}
        />

        <Split>
          <ProseBlock>
            <p>
              There is no cleanup step. When the body runs out of lines the
              routine finishes, and finishing cancels every command it forked.
              That is the one piece of bookkeeping the coroutine does for you.
            </p>
            <p>
              Canceling is not stopping, though. The arm and flywheel fall back
              to <code>idle()</code>, which issues no output and does not clear
              the last request, so Phoenix keeps applying it — the same
              behaviour you saw on <strong>Chaining Commands</strong>.
            </p>
          </ProseBlock>
          <MarginNote label="WHY THE BRANCH GETS AWAY WITH IT">
            The autonomous period is about to end and the robot is about to be
            disabled. If you extend this routine into something that runs
            mid-match, end it with explicit stop steps.
          </MarginNote>
        </Split>
      </LessonSection>

      {/* ── the whole file ───────────────────────────────────────────── */}
      <LessonSection id="the-finished-file" title="The finished file">
        <p className="prose-body measure">
          This is the live file on the branch. Compare it against what you
          typed, especially the indentation of the two <code>await</code> calls.
        </p>

        <GitHubContent
          repository="Hemlock5712/Workshop-Code"
          branch="6-Coroutines"
          filePath="src/main/java/frc/robot/opmodes/RaiseAndShootOpMode.java"
        />
      </LessonSection>

      {/* ── side by side ─────────────────────────────────────────────── */}
      <LessonSection
        id="the-same-routine-both-dialects"
        title="The same routine, both dialects"
      >
        <p className="prose-body measure">
          The robot template keeps a matched pair for exactly this comparison:{" "}
          <code>DriveStowDriveChainedOpMode</code> and{" "}
          <code>DriveStowDriveOpMode</code>. Drive to a pose, hold the stow pose
          while driving to a second one. Same behaviour, same file structure,
          two dialects. (<code>DriveToPose</code> and <code>robot.stow()</code>{" "}
          are template classes — they are not on any Workshop-Code branch, so
          read these, do not paste them.)
        </p>

        <CodeBlock
          language="java"
          title="DriveStowDriveChainedOpMode.java — chaining"
          code={`routine =
    Command.sequence(
            // Leg 1: DriveToPose finishes on its own, so it can sit in a sequence as-is.
            new DriveToPose(robot.drivetrain, pose1),

            // Stow is a hold - it would stick here forever. .until(...) gives it a finish
            // line: this step ends the moment the arm actually reaches the stow angle.
            robot.stow().until(robot.arm::isAtTarget).named("stow until stowed"),

            // Leg 2 WHILE holding the stow pose: the race ends when DriveToPose finishes
            // (the hold never finishes, so the drive always decides) and cancels the hold.
            Command.race(new DriveToPose(robot.drivetrain, pose2), robot.stow())
                .named("drive holding stow"))
        .named("Drive Stow Drive (Chained)");`}
        />

        <CodeBlock
          language="java"
          title="DriveStowDriveOpMode.java — coroutine"
          code={`routine =
    Command.noRequirements(
            coroutine -> {
              // Drive to the first pose and wait until we're there.
              coroutine.await(new DriveToPose(robot.drivetrain, pose1));

              // Start holding the stow pose (arm vertical + flywheel stopped). fork keeps it
              // running - so it stays commanded and visible in telemetry - through the next
              // drive, and it is canceled automatically when this routine ends.
              coroutine.fork(robot.stow());
              coroutine.waitUntil(robot.arm::isAtTarget); // move on once actually stowed

              // Drive to the second pose while the stow pose is still held.
              coroutine.await(new DriveToPose(robot.drivetrain, pose2));
            })
        .named("Drive Stow Drive");`}
        />

        <p className="prose-body measure">
          Line up the middle of each. The chained version has to give the stow
          hold a finish line with <code>.until(...)</code>, and then has to hand
          it back in a <code>Command.race</code> to keep it alive through leg 2.
          The coroutine version forks the stow once and never mentions it again.
        </p>

        <Box variant="concept" title="The trade-off, in the template's words">
          <p>
            The chained file names the cost of its own approach:{" "}
            <em>
              &quot;the sequence owns every mechanism it touches for the whole
              routine, so between its steps a mechanism can show up in telemetry
              as owned-but-uncommanded (the motor still holds its last setpoint
              in firmware, and nothing else can steal it).&quot;
            </em>
          </p>
          <p className="mt-3">
            The coroutine file says what it buys instead:{" "}
            <em>
              &quot;the command that issued a control request should keep
              running as long as that request is active. You should never fall
              back to idle while a motor is still holding a setpoint.&quot;
            </em>{" "}
            It also says when the cheaper option is fine —{" "}
            <em>
              &quot;that&apos;s fine for trivial logic or plain onboard
              (open-loop) motors&quot;
            </em>
            .
          </p>
          <p className="mt-3">
            So: closed-loop mechanism, held across several steps, and you care
            what telemetry shows? Coroutine. Anything else? Chain it.
          </p>
        </Box>

        <div className="flex flex-col gap-3">
          <DocumentationButton
            href="https://github.com/Hemlock5712/2027-Template/blob/2027-dev/src/main/java/frc/robot/opmodes/DriveStowDriveOpMode.java"
            title="DriveStowDriveOpMode.java — the coroutine version"
            icon={<GitBranch className="w-5 h-5" />}
          />
          <DocumentationButton
            href="https://github.com/Hemlock5712/2027-Template/blob/2027-dev/src/main/java/frc/robot/opmodes/DriveStowDriveChainedOpMode.java"
            title="DriveStowDriveChainedOpMode.java — the chained version"
            icon={<GitBranch className="w-5 h-5" />}
          />
        </div>
      </LessonSection>

      {/* ── did it work ──────────────────────────────────────────────── */}
      <LessonSection id="did-it-work" title="Did it work?">
        <ol
          className="ml-5 list-decimal space-y-3"
          style={{ color: "var(--tx2)" }}
        >
          <li>
            Build. If it compiles, your <code>.named(...)</code> and{" "}
            <code>.withTimeout(...)</code> are in the right order.
          </li>
          <li>
            Launch it. Either start the GUI simulator and pick{" "}
            <strong>Raise And Shoot</strong> from the autonomous list, or go
            straight there:
            <div className="mt-2">
              <CodeBlock
                language="bash"
                hideControls
                code={`./gradlew simulateJavaAgent -Pmode=auto:"Raise And Shoot"`}
              />
            </div>
            The name in that command is the string in{" "}
            <code>@Autonomous(name = ...)</code>, not the class name.
          </li>
          <li>
            <strong>{"You should see: "}</strong> the arm swings to vertical
            (0.25 rotations, 90&deg;) and <em>stays</em> there. It does not sag
            back.
          </li>
          <li>
            <strong>{"You should see: "}</strong> as soon as the arm settles,
            the flywheel spins up to 75 rotations per second — and the arm is
            still being held while it does. That is the fork earning its place.
          </li>
          <li>
            <strong>{"You should see: "}</strong> about a second after the
            flywheel reaches speed, the routine ends. Both holds stop being
            commanded.
          </li>
          <li>
            <strong>{"Time it. "}</strong> A healthy run is short — however long
            the arm takes, plus however long the flywheel takes, plus one
            second. If it takes almost exactly seven seconds every single time,
            that is 3&nbsp;+&nbsp;3&nbsp;+&nbsp;1: both waits hit their timeout
            and neither mechanism ever arrived.
          </li>
          <li>
            <strong>Now break it on purpose.</strong> Change the first line from{" "}
            <code>coroutine.fork(arm.vertical())</code> to{" "}
            <code>coroutine.await(arm.vertical())</code> and run again.{" "}
            <strong>{"You should see: "}</strong> the arm moves to vertical and
            nothing else ever happens. No flywheel, no error, no log line. The
            routine is parked on line one for the rest of the period. Put the{" "}
            <code>fork</code> back.
          </li>
        </ol>

        <Box
          variant="alert-info"
          tag="IF IT DIDN'T WORK"
          title="Seven wasted seconds, a routine that sits forever, or a missing import"
        >
          <ul className="ml-4 list-disc space-y-2">
            <li>
              <strong>
                The routine takes seven seconds and nothing reaches its target.
              </strong>{" "}
              Both waits timed out. On <code>6-Coroutines</code> the arm ships
              with <code>kG</code>, <code>kS</code>, <code>kP</code> and{" "}
              <code>kD</code> all set to <code>0.0</code>, marked{" "}
              <code>NEEDS TUNING</code>, and Motion Magic cruise and
              acceleration set to <code>0.0</code>, marked{" "}
              <code>NEEDS SETTING</code>. An arm with those numbers does not go
              anywhere. Tune it first; the routine is fine.
            </li>
            <li>
              <strong>
                The first thing happens and then the routine sits forever.
              </strong>{" "}
              You awaited a hold. <code>arm.vertical()</code>,{" "}
              <code>flywheel.runFast()</code> and <code>flywheel.stop()</code>{" "}
              all end in <code>(hold)</code> and none of them ever finishes.
              Those go in <code>fork</code>. Only{" "}
              <code>Command.waitUntil(...)</code> and other self-finishing
              commands belong in <code>await</code>.
            </li>
            <li>
              <strong>
                It will not compile, and the error points at a{" "}
                <code>waitUntil</code> line.
              </strong>{" "}
              Almost always the decorator order: <code>.withTimeout(...)</code>{" "}
              written before <code>.named(...)</code>. The builder does not have
              a <code>withTimeout</code> — only the named <code>Command</code>{" "}
              does.
            </li>
            <li>
              <strong>
                It will not compile, and the error is{" "}
                <code>cannot find symbol: Seconds</code>.
              </strong>{" "}
              The import is missing. Add{" "}
              <code>import static org.wpilib.units.Units.Seconds;</code> at the
              top. If you are sure you already added it, add it again — every
              compile runs <code>spotlessApply</code>, and{" "}
              <code>removeUnusedImports()</code> strips the import out of the
              file on disk until a line actually uses it.
            </li>
          </ul>
        </Box>
      </LessonSection>

      {/* ── what's next ──────────────────────────────────────────────── */}
      <LessonSection id="where-this-goes-next" title="What's next">
        <p className="prose-body measure">
          You have now seen every dialect the site uses except one.{" "}
          <strong>State Machines</strong> is the next branch on this track, one
          commit further along, and it goes back to chaining — states are built
          with <code>Command.parallel</code>. Then{" "}
          <strong>{"Drive to Tag, Written as a Coroutine "}</strong>comes back
          to this page&apos;s material with the fourth verb, <code>yield</code>,
          in a routine whose body is a real <code>while</code> loop.
        </p>

        <p className="prose-body measure">
          Between now and then, the honest advice is the template&apos;s: reach
          for a sequence first, and only switch when you can name which of the
          two reasons above applies.
        </p>
      </LessonSection>

      <Quiz
        questions={[
          {
            id: 1,
            question:
              "Why does the routine call coroutine.fork(arm.vertical()) instead of coroutine.await(arm.vertical())?",
            options: [
              "fork is faster than await",
              "vertical() is a hold and never finishes, so await would stop the routine there permanently",
              "await only works on commands that require no mechanisms",
              "fork automatically applies a three-second timeout",
            ],
            correctAnswer: 1,
            explanation:
              "arm.vertical() is built with runRepeatedly and is named 'vertical (hold)'. A hold never finishes on its own, so await would sit on that line for the rest of the match with no error and no log. fork starts it and returns immediately, which is exactly what the branch comment says: 'fork, not await: vertical() is a hold and never finishes.'",
          },
          {
            id: 2,
            question:
              'Why is it .named("wait for the arm").withTimeout(Seconds.of(3.0)) and not the other way around?',
            options: [
              "Style only — either order compiles",
              "withTimeout must come last so the scheduler reads the name first",
              "Command.waitUntil(...) returns a builder; .named(...) turns it into a Command, and .withTimeout(...) is a Command method",
              "Timeouts can only be applied to commands that have no requirements",
            ],
            correctAnswer: 2,
            explanation:
              "Command.waitUntil(...) hands back a builder stage, not a finished Command. That stage has named, until, whenCanceled and withPriority — no withTimeout. Naming it produces a Command, and .withTimeout(Time) is a method on Command. Reversing the two does not compile.",
          },
          {
            id: 3,
            question:
              "What does the .withTimeout(Seconds.of(3.0)) on each wait actually protect you from?",
            options: [
              "It stops the motor from overheating",
              "It caps how long the flywheel is allowed to spin",
              "If the mechanism never reaches its target, the routine moves on instead of freezing for the rest of the period",
              "It makes isAtTarget() return true after three seconds",
            ],
            correctAnswer: 2,
            explanation:
              "The branch comment says it plainly: 'Always time out a wait in an auto, or a stuck arm freezes the whole match.' A jammed arm means isAtTarget() never becomes true, so the wait would never end. The timeout gives up and lets the rest of the routine run.",
          },
          {
            id: 4,
            question:
              "The coroutine body forks the arm hold and the flywheel hold, waits a second, and then runs out of lines. What happens to the two forked holds?",
            options: [
              "They keep running until something else claims those mechanisms",
              "Both are canceled automatically when the routine ends",
              "They are canceled only if you call coroutine.park() first",
              "They finish on their own, which is what ends the routine",
            ],
            correctAnswer: 1,
            explanation:
              "Ending the routine cancels everything it forked — that is the bookkeeping a coroutine does for you, and the last comment in the file. Note that canceled is not the same as stopped: the mechanisms fall back to idle(), which sends no output and does not clear the last request, so Phoenix keeps applying it.",
          },
          {
            id: 5,
            question:
              "Your routine drives to a pose, then drives to a second pose, and nothing needs to be held across both legs. Which dialect should you use?",
            options: [
              "A coroutine, because coroutines are the newer and more capable dialect",
              "Chaining — Command.sequence handles it, and the template calls chaining 'as far as most routines ever need to go'",
              "Either, but a coroutine will run faster",
              "A coroutine, because Command.sequence cannot hold two drive legs",
            ],
            correctAnswer: 1,
            explanation:
              "Chaining is the default and this routine gives you no reason to leave it. The template reserves coroutines for two cases: a hold that must span several steps, and logic that needs real loops or branches. Two independent legs in order is neither.",
          },
        ]}
      />
    </PageTemplate>
  );
}
