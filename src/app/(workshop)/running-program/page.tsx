import PageTemplate from "@/components/PageTemplate";
import { MarginNote, ProseBlock, Split } from "@/components/lesson/Prose";
import LessonSection from "@/components/lesson/LessonSection";
import AlphaStatusNote from "@/components/AlphaStatusNote";
import KeyConceptSection from "@/components/KeyConceptSection";
import Box from "@/components/Box";
import CodeBlock from "@/components/CodeBlock";
import GitHubContent from "@/components/GitHubContent";
import Quiz from "@/components/Quiz";

export default function RunningProgram() {
  return (
    <PageTemplate
      title="The lesson where the motor finally turns"
      emphasis="finally turns"
      lede="Four lessons have ended with a build check. This one ends with a moving arm. You start the robot project on your laptop, pick Teleop on the driver station, click Enable, and press the buttons you wired up on the last page."
      needs={[
        <>
          The <code>2-Commands</code> branch checked out and building, with your
          fourth binding from{" "}
          <a href="/triggers" className="underline">
            Triggers
          </a>{" "}
          in place.
        </>,
        <>
          The bench built and checked in Tuner X:{" "}
          <a href="/hardware" className="underline">
            Hardware Setup
          </a>{" "}
          and{" "}
          <a href="/mechanism-setup" className="underline">
            Mechanism Setup
          </a>
          . Motors powered, CANivore plugged into this laptop, directions
          verified.
        </>,
        <>An Xbox-style controller plugged into the same laptop.</>,
      ]}
      branch="2-Commands"
      time="Roughly 40 minutes"
    >
      <Split>
        <KeyConceptSection
          description={[
            "The thing that makes this work is called hardware simulation, and the name oversells the word simulation. Your laptop stands in for the robot controller. The motors are real, the CAN bus is real, and the arm on the bench is the arm that moves.",
          ]}
          concept="Hardware simulation replaces the robot controller, not the robot. Everything downstream of the CANivore is real hardware."
        />
        <MarginNote label="WHAT YOU'LL BUILD">
          Nothing new. You run the code you already have and watch four buttons
          drive two mechanisms. Then you make two buttons fight over the same
          arm on purpose, and learn who wins. Most of it happens at the bench.
        </MarginNote>
      </Split>

      {/* ── what hardware simulation is ──────────────────────────────── */}
      <LessonSection
        id="what-quot-hardware-simulation-quot-actually"
        title='What "hardware simulation" actually means'
      >
        <p className="prose-body measure">
          Say it plainly, because the word simulation points the wrong way:{" "}
          <strong>this is not a physics sim.</strong> There is no model of your
          arm anywhere in the project. Nothing is pretending. Your program runs
          on the laptop, every motor request goes out over USB to the CANivore,
          onto the CAN bus, and into the real Kraken bolted to your bench. The
          arm you watch move is the arm on the table.
        </p>

        <p className="prose-body measure">
          The one piece being stood in for is the{" "}
          <strong>robot controller</strong>. You do not need a SystemCore on the
          bench to do this. The laptop plays that role, the CANivore carries the
          traffic, and the hardware behaves exactly as it will on the robot.
          That is the whole trick, and it is why the workshop can teach control
          code on a table instead of a full robot.
        </p>

        <Box
          variant="alert-warning"
          tag="WATCH OUT · REAL MOTORS"
          title="The arm is going to move for real"
        >
          <p>
            The moment you click Enable and press a trigger, a geared arm swings
            under 6 volts. Before you start: clear the area around the
            mechanism, make sure nothing is clamped where the arm will travel,
            and keep one hand near the Disable button on the driver station. If
            anything looks wrong, disable first and ask questions after.
          </p>
        </Box>

        <Split>
          <ProseBlock>
            <p>
              <strong>{"The hardware is required. "}</strong>Nothing on this
              page works without a CANivore and powered motors. There is no
              motors-optional route through Workshop&nbsp;#1 — the whole
              run-and-tune loop from here to Motion Magic is done against real
              devices.
            </p>
          </ProseBlock>
          <MarginNote label="THE NUMBERS ARE HONEST">
            When you tune PID two lessons from now, you are tuning against
            actual friction, actual gravity and actual gear lash. Nothing has
            been smoothed out for you.
          </MarginNote>
        </Split>
      </LessonSection>

      {/* ── CANivore USB toggle ──────────────────────────────────────── */}
      <Box
        variant="alert-warning"
        title="First: turn the CANivore USB setting OFF"
      >
        <p className="mb-3">
          Before running anything here you <strong>must</strong> turn{" "}
          <strong>{"OFF "}</strong> the &quot;CANivore USB&quot; setting in
          Tuner X. Two things cannot own the CAN bus at once: with it on, Tuner
          X holds the bus and the simulator cannot reach your motors. This is
          the same toggle you turned <em>on</em> for bench testing — one switch,
          two positions, explained in full on{" "}
          <a
            href="/mechanism-setup#canivore-usb"
            className="underline font-medium"
          >
            Mechanism Setup
          </a>
          .
        </p>
        <p className="m-0">
          Open Tuner X, go to CANivore settings, and disable &quot;CANivore
          USB&quot;.
        </p>
      </Box>

      <LessonSection
        id="hardware-simulation-setup"
        title="Hardware Simulation Setup"
      >
        <iframe
          src="https://www.youtube.com/embed/xsR7m6ToUFE"
          title="Hardware Simulation"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowFullScreen
          className="w-full h-full aspect-video rounded-lg"
        />
      </LessonSection>

      {/* Running on the 2027 stack */}
      <LessonSection
        id="opmodes-and-the-simulator"
        title="OpModes and the simulator"
      >
        <p className="prose-body measure">
          Start the simulator, or deploy to the robot. The driver station then
          lists every mode class <em>by name</em>: each <code>@Teleop</code>,{" "}
          <code>@Autonomous</code>, and <code>@Utility</code> class you wrote.
          Pick one, and that OpMode is <strong>constructed</strong>: built
          fresh, right then, along with its button bindings. Underneath, the
          scheduler (<code>Scheduler.getDefault().run()</code>) keeps ticking
          every loop no matter which mode is active.
        </p>

        <CodeBlock
          language="bash"
          title="Launching the simulator (Gradle)"
          code={`# GUI simulation — opens the sim driver station; a human clicks Enable.
./gradlew simulateJava

# Headless (CI / agent) — auto-enables the robot. Pick the starting mode:
./gradlew simulateJavaAgent                          # autonomous (default)
./gradlew simulateJavaAgent -Pmode=teleop            # teleop
./gradlew simulateJavaAgent -Pmode=auto:"Drive To Pose"   # a specific @Autonomous`}
        />

        <p className="prose-body measure">
          Use the first one. The headless task exists for scripts and for the AI
          assistant lesson later on; it starts the robot enabled with no window
          to click, which is the wrong shape for a bench you are standing next
          to.
        </p>

        <Box
          variant="alert-info"
          tag="NOTE"
          title="Where the code actually runs"
        >
          <p className="mb-2">
            The stack runs on <strong>Java 25</strong> and deploys to{" "}
            <strong>SystemCore</strong> (<code>./gradlew deploy</code> targets{" "}
            <code>/home/systemcore</code>). The mode list comes straight from
            your code: a missing OpMode is <em>{"not "}</em> a compile error. If
            your mode doesn&apos;t show up on the driver station, check that the
            class:
          </p>
          <ul className="list-disc list-inside space-y-1">
            <li>
              is <code>public</code> and not <code>abstract</code>
            </li>
            <li>
              has its annotation with a <code>name</code> (like{" "}
              <code>@Teleop(name = &quot;Teleop&quot;)</code>)
            </li>
            <li>
              lives in <code>frc.robot</code> or a subpackage
            </li>
            <li>
              has a public constructor that takes a <code>Robot</code>
            </li>
          </ul>
        </Box>
      </LessonSection>

      {/* ── the branch anchor ────────────────────────────────────────── */}
      <LessonSection
        id="the-file-you-are-about-to"
        title="The file you are about to run"
      >
        <p className="prose-body measure">
          This is <code>opmodes/TeleopOpMode.java</code> on{" "}
          <code>2-Commands</code>, live from the repository. Three bindings,
          made in the constructor, scoped to this OpMode. Your copy should match
          it plus the B binding you added on <strong>Triggers</strong> — four
          bindings in total, and every one of them a pair.
        </p>

        <GitHubContent
          repository="Hemlock5712/Workshop-Code"
          branch="2-Commands"
          filePath="src/main/java/frc/robot/opmodes/TeleopOpMode.java"
        />

        <CodeBlock
          language="java"
          title="What your constructor should contain"
          filename="src/main/java/frc/robot/opmodes/TeleopOpMode.java"
          code={`// From the branch:
driver.leftTrigger().onTrue(arm.runFast()).onFalse(arm.stop());
driver.rightTrigger().onTrue(flywheel.runFast()).onFalse(flywheel.runSlow());
driver.a().onTrue(flywheel.runFast()).onFalse(flywheel.stop());

// Yours, added on the Triggers page:
driver.b().onTrue(arm.runSlow()).onFalse(arm.stop());`}
        />

        <p className="prose-body measure">
          Two of those four bindings drive the arm. Two drive the flywheel. Hold
          on to that — it is the experiment at the bottom of this page.
        </p>
      </LessonSection>

      {/* ── did it work ──────────────────────────────────────────────── */}
      <LessonSection id="did-it-work" title="Did it work?">
        <ol
          className="ml-5 list-decimal space-y-3"
          style={{ color: "var(--tx2)" }}
        >
          <li>
            In Tuner X, turn <strong>CANivore USB off</strong> and close the
            control window. <strong>{"You should see: "}</strong> your devices
            drop out of the Tuner X list. That is correct — you are handing the
            bus over.
          </li>
          <li>
            Plug the controller into the laptop, and confirm the mechanism is
            powered and clear.
          </li>
          <li>
            From the project folder, run <code>./gradlew simulateJava</code> (or{" "}
            <em>WPILib: Simulate Robot Code</em> in VS Code).{" "}
            <strong>{"You should see: "}</strong> two windows open — the
            simulation GUI and a driver station window — and the console print{" "}
            <code>********** Robot program startup complete **********</code>.
          </li>
          <li>
            In the simulation GUI, drag your controller from the{" "}
            <strong>System Joysticks</strong> panel onto slot&nbsp;0 of the{" "}
            <strong>Joysticks</strong> panel. Your code reads{" "}
            <code>new CommandNiDsXboxController(0)</code>, so port 0 is the one
            it listens to.
          </li>
          <li>
            Pick <strong>Teleop</strong> from the mode list on the driver
            station. <strong>{"You should see: "}</strong>{" "}
            <code>********** Starting OpMode Teleop **********</code> in the
            console. That line is your OpMode constructor running and your four
            bindings coming into existence.
          </li>
          <li>
            Click <strong>Enable</strong>. <strong>{"You should see: "}</strong>{" "}
            nothing move. Correct — every command on this branch is attached to
            a button, and nothing is holding a button yet.
          </li>
          <li>
            Hold the <strong>left trigger</strong>.{" "}
            <strong>{"You should see: "}</strong> the arm push at 6&nbsp;V and
            keep pushing for as long as you hold. Release it and the arm stops.
            That is <code>onTrue(arm.runFast())</code> and{" "}
            <code>onFalse(arm.stop())</code>.
          </li>
          <li>
            Hold the <strong>right trigger</strong>.{" "}
            <strong>{"You should see: "}</strong> the flywheel spin up hard.
            Release it and the flywheel <em>keeps spinning</em>, more gently.
            Not a bug: that binding releases into{" "}
            <code>flywheel.runSlow()</code>, not <code>stop()</code>. It is the
            one pair on the branch that undoes into a different speed rather
            than into zero.
          </li>
          <li>
            Press and release <strong>A</strong>.{" "}
            <strong>{"You should see: "}</strong> the flywheel go to full, then
            stop completely. A and the right trigger drive the same mechanism
            and release into different commands, which is why the flywheel ends
            up somewhere different depending on which one you let go of.
          </li>
          <li>
            Hold <strong>B</strong>, your own binding.{" "}
            <strong>{"You should see: "}</strong> the arm push gently at
            3&nbsp;V and stop on release.
          </li>
          <li>
            Click <strong>Disable</strong> before you walk away. Leave the
            program running — the next section uses it.
          </li>
        </ol>

        <Box
          variant="alert-info"
          tag="IF IT DIDN'T WORK"
          title="Java 25, a missing mode, and a motor that will not turn"
        >
          <ul className="ml-4 list-disc space-y-2">
            <li>
              <strong>
                The build fails with <code>invalid source release: 25</code>.
              </strong>{" "}
              Gradle is running on an older Java. Point it at the WPILib 2027
              Java 25 toolchain, or launch from the WPILib VS Code extension,
              which sorts this out for you. Nothing else on this page will work
              until the build passes.
            </li>
            <li>
              <strong>Teleop is not in the mode list.</strong> OpModes are found
              by scanning classes while the program runs, so a mistake here is
              never a compile error — the mode is silently absent. Walk the
              four-item checklist above. Then read the console: selecting a mode
              prints <code>********** Starting OpMode ... **********</code>, so
              a mode that never prints never started.
            </li>
            <li>
              <strong>{"Teleop is selected but no motor turns. "}</strong> Three
              candidates, most likely first. CANivore USB is still ON, so Tuner
              X still owns the bus. The controller is not on port&nbsp;0 — check
              the Joysticks panel. Or the driver station still says Disabled;
              the scheduler runs either way, so your bindings fire and commands
              start, but no real motor moves until you click Enable. A burst of
              &quot;CAN message is stale&quot; at startup is normal; the same
              message still repeating a few seconds later means the bus is not
              reachable.
            </li>
          </ul>
        </Box>
      </LessonSection>

      {/* ── the ownership collision ──────────────────────────────────── */}
      <LessonSection
        id="two-buttons-one-arm-who-wins"
        title="Two buttons, one arm: who wins?"
      >
        <p className="prose-body measure">
          Every page so far has told you the scheduler makes sure two commands
          never fight over the same motor. You now have the setup to watch it
          happen. The left trigger runs <code>arm.runFast()</code> at 6&nbsp;V.
          B runs <code>arm.runSlow()</code> at 3&nbsp;V. Both need the arm.
          Press both and something has to give.
        </p>

        <ol
          className="ml-5 list-decimal space-y-3"
          style={{ color: "var(--tx2)" }}
        >
          <li>
            Enable, and hold the <strong>left trigger</strong> down.{" "}
            <strong>{"You should see: "}</strong> the arm at 6&nbsp;V. The
            command holding the arm is <code>runFast (hold)</code>.
          </li>
          <li>
            <strong>Keeping the left trigger down</strong>, press and hold{" "}
            <strong>B</strong>. <strong>{"You should see: "}</strong> the arm
            slow down to 3&nbsp;V, immediately. B won.{" "}
            <code>runFast (hold)</code> was canceled the moment{" "}
            <code>runSlow (hold)</code> was scheduled.
          </li>
          <li>
            <strong>Release B. Keep holding the left trigger.</strong>{" "}
            <strong>{"You should see: "}</strong> the arm stop — and stay
            stopped, even though the left trigger is still down. This is the
            part people do not predict.
          </li>
          <li>
            Release the left trigger too. <strong>{"You should see: "}</strong>{" "}
            nothing change. The arm was already stopped.
          </li>
        </ol>

        <Box variant="concept" title="Why B won">
          <p>
            Exactly one command owns a mechanism at a time. When a new command
            that needs the arm is scheduled, the scheduler compares it against
            whatever is already holding the arm:
          </p>
          <ul className="ml-4 mt-3 list-disc space-y-1">
            <li>
              <strong>Strictly lower priority</strong> than the running command
              — the new one is turned away and nothing changes.
            </li>
            <li>
              <strong>Equal or higher priority</strong> — the running command is
              canceled and the new one takes the mechanism.
            </li>
          </ul>
          <p className="mt-3">
            Every command you have written runs at the default priority, which
            is <code>0</code>. Equal counts, so{" "}
            <strong>the newest press always wins</strong>. That is the whole
            rule. There is no queue, no waiting, and no error — the older
            command is gone.
          </p>
        </Box>

        <Box
          variant="alert-warning"
          tag="WATCH OUT"
          title="Step 3 is the weakness of the pair form"
        >
          <p>
            Releasing B scheduled <code>arm.stop()</code>. That command needs
            the arm too, so it took the arm from <code>runSlow (hold)</code> by
            the same rule and started sending zero. The left trigger was held
            down the whole time and did not get the arm back — because{" "}
            <code>onTrue</code> fires on the <em>press</em>, once, and never
            again while you hold. A button that is already down has nothing left
            to fire.
          </p>
          <p className="mt-3">
            <code>whileTrue</code> does not have this problem, and on{" "}
            <a href="/chaining-commands" className="underline">
              Chaining Commands
            </a>{" "}
            it becomes the way this team binds every hold. Remember this arm
            when you get there.
          </p>
        </Box>
      </LessonSection>

      {/* ── the cancellation model ───────────────────────────────────── */}
      <LessonSection
        id="what-actually-ends-a-command"
        title="What actually ends a command"
      >
        <p className="prose-body measure">
          You have now seen a command end because another one took its
          mechanism. That is one of five ways, and they are worth having in one
          list, because &quot;why did my command stop?&quot; and &quot;why
          won&apos;t my command stop?&quot; are the two questions that eat
          debugging time all season.
        </p>

        <ol
          className="ml-5 list-decimal space-y-3"
          style={{ color: "var(--tx2)" }}
        >
          <li>
            <strong>It finishes on its own.</strong> Its work is done and it
            returns. None of your commands do this —{" "}
            <code>runRepeatedly(...)</code> builds a hold, and a hold never
            finishes. That is what the <code>(hold)</code> in the name is
            telling you.
          </li>
          <li>
            <strong>
              Something else claims its mechanism at equal or higher priority.
            </strong>{" "}
            The collision above. This is the common one, and it is how every
            pair binding on this branch works.
          </li>
          <li>
            <strong>Its binding cancels it.</strong>{" "}
            <code>whileTrue(command)</code> starts the command when the question
            turns true and cancels it when the question turns false.{" "}
            <code>onTrue</code> and <code>onFalse</code> never cancel anything —
            they only ever schedule. That difference is the whole reason your
            bindings come in pairs.
          </li>
          <li>
            <strong>The group around it ends.</strong> Once you start composing
            commands, canceling a group cancels every command inside it. Nothing
            outlives its parent.
          </li>
          <li>
            <strong>The OpMode goes away.</strong> Pick a different mode on the
            driver station and this OpMode is torn down: its bindings are
            removed and the commands they started are canceled. You write no
            cleanup code for this.
          </li>
        </ol>

        <Box
          variant="alert-danger"
          tag="THE TRAP"
          title="Canceling a command does not stop a motor"
        >
          <p>
            When the last command on a mechanism is canceled, the mechanism
            falls back to its default, which is <code>idle()</code>. And{" "}
            <code>idle()</code> parks at the lowest priority and{" "}
            <strong>sends nothing at all</strong>. It does not write a zero. It
            does not undo the last request. Phoenix keeps applying whatever
            voltage it was last handed, so the motor keeps running.
          </p>
          <p className="mt-3">
            &quot;Stop the command&quot; and &quot;stop the motor&quot; are two
            different actions. Something has to actively send zero, every loop,
            while holding the mechanism. That is what <code>stop()</code> is,
            and it is why the branch never writes an <code>onTrue</code> without
            an <code>onFalse</code> behind it.
          </p>
        </Box>

        <p className="prose-body measure">
          <strong>Watch it on the bench.</strong> Stop the simulator, delete{" "}
          <code>.onFalse(arm.stop())</code> from your B binding so it reads{" "}
          <code>driver.b().onTrue(arm.runSlow());</code>, and run it again. Hold
          B, then release. <strong>{"You should see: "}</strong> the arm keep
          pushing after you let go, with nothing on screen suggesting anything
          is wrong. The command that asked for 3&nbsp;V is long gone; the
          3&nbsp;V is still there. Disable to stop it, then put the{" "}
          <code>.onFalse(...)</code> back.
        </p>
      </LessonSection>

      <AlphaStatusNote />

      <Quiz
        questions={[
          {
            id: 1,
            question:
              "In hardware simulation, what is being simulated and what is real?",
            options: [
              "Everything is simulated — the motors, the physics, and the controller",
              "The robot controller is stood in for by your laptop; the CANivore, the CAN bus and the motors are all real hardware",
              "The motors are simulated but the controller is real",
              "It models the arm's physics so you can test without hardware",
            ],
            correctAnswer: 1,
            explanation:
              "Hardware simulation replaces the robot controller, not the robot. Your program runs on the laptop and sends real requests over USB to the CANivore and onto the real CAN bus. There is no physics model anywhere in this project, and none of this page works without the motors on the bench.",
          },
          {
            id: 2,
            question:
              "What setting must be turned OFF in Tuner X before running your code in hardware simulation?",
            options: [
              "Motor Control",
              "CANivore USB",
              "Simulation Mode",
              "Hardware Detection",
            ],
            correctAnswer: 1,
            explanation:
              "Only one program can own the CAN bus over USB. With CANivore USB on, Tuner X holds the bus and the simulator cannot reach your motors. It is one switch with two positions: on for bench work in Tuner X, off when your code is driving.",
          },
          {
            id: 3,
            question:
              "You hold the left trigger (arm.runFast(), 6 V), then press B (arm.runSlow(), 3 V) without letting go. What happens?",
            options: [
              "B is ignored, because the arm is already claimed by runFast",
              "The arm drops to 3 V — runSlow is scheduled at equal priority, so it takes the arm and runFast is canceled",
              "Both commands run and the voltages add up to 9 V",
              "The scheduler throws an error about conflicting requirements",
            ],
            correctAnswer: 1,
            explanation:
              "One command owns a mechanism at a time. A newly scheduled command is turned away only if it is strictly lower priority than the one running. Both of these run at the default priority of 0, so equal counts and the newest press wins.",
          },
          {
            id: 4,
            question:
              "In that same experiment you release B while still holding the left trigger. Why does the arm stop instead of going back to 6 V?",
            options: [
              "Releasing B cancels runSlow, and canceling a command stops the motor",
              "onFalse scheduled arm.stop(), and onTrue only fires on the press — a button already held has nothing left to fire",
              "The left trigger binding expired after a few seconds",
              "runFast automatically resumes on the next scheduler tick",
            ],
            correctAnswer: 1,
            explanation:
              "onTrue and onFalse only ever schedule; neither one cancels. Releasing B scheduled arm.stop(), which claimed the arm. The left trigger fired its onTrue back when you first pressed it and will not fire again until you release and press it once more. whileTrue is the verb that fixes this, and it arrives on Chaining Commands.",
          },
          {
            id: 5,
            question:
              "A command holding the arm is canceled and nothing replaces it. What does the motor do?",
            options: [
              "It stops, because canceling releases the motor",
              "It keeps applying the last voltage — the mechanism falls back to idle(), which sends no output and does not zero the last request",
              "It coasts to a stop over about a second",
              "It faults, because no command owns the mechanism",
            ],
            correctAnswer: 1,
            explanation:
              "idle() parks at the lowest priority and issues nothing at all. Phoenix keeps applying the last request it was given. Stopping the command and stopping the motor are different actions — something has to actively send zero every loop, which is exactly what stop() does.",
          },
          {
            id: 6,
            question:
              "On the 2027 OpMode stack, how do you choose whether teleop or an autonomous routine runs?",
            options: [
              "Edit a settings file on the robot and redeploy",
              "Select the @Teleop or @Autonomous class by name on the driver station — picking it constructs that OpMode",
              "Set a boolean flag in the Robot class",
              "The robot picks automatically based on the match timer",
            ],
            correctAnswer: 1,
            explanation:
              "Each mode is its own annotated class. The driver station lists them by name; selecting one constructs that OpMode (building its bindings) and tears down the previous one.",
          },
        ]}
      />
    </PageTemplate>
  );
}
