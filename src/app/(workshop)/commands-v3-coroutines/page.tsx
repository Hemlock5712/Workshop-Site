import PageTemplate from "@/components/PageTemplate";
import KeyConceptSection from "@/components/KeyConceptSection";
import CodeBlock from "@/components/CodeBlock";
import ComparisonTable from "@/components/ComparisonTable";
import DocumentationButton from "@/components/DocumentationButton";
import Box from "@/components/Box";
import Quiz from "@/components/Quiz";
import { BookOpen, Code2 } from "lucide-react";

export default function CommandsV3Coroutines() {
  return (
    <PageTemplate title="Coroutines and Concurrency">
      <KeyConceptSection
        title="One thread, many paused command bodies"
        description={[
          "A coroutine is a command body the scheduler can pause and resume. It is not a background thread. Commands take turns on the same scheduler thread, and each one must hand control back at a yield point.",
          "Think of several students sharing one workbench. Each student does a small step, leaves their project exactly where it is, and steps aside. On the next robot loop, the scheduler brings each unfinished project back to the same line of code.",
        ]}
        concept="Concurrency means several commands can be in progress. Parallelism would mean several commands execute at the exact same instant. Commands V3 gives you concurrency on one scheduler thread, not parallel robot code."
      />

      <div className="flex flex-wrap gap-3">
        <DocumentationButton
          href="https://github.com/wpilibsuite/allwpilib/blob/main/design-docs/commands-v3.md#cooperative-multitasking"
          title="Cooperative Multitasking Design"
          icon={<BookOpen className="h-5 w-5" />}
        />
        <DocumentationButton
          href="https://github.com/wpilibsuite/allwpilib/blob/main/commandsv3/src/main/java/org/wpilib/command3/Coroutine.java"
          title="Coroutine Source and API Reference"
          icon={<Code2 className="h-5 w-5" />}
        />
      </div>

      <section className="flex flex-col gap-6">
        <h2 className="text-2xl font-semibold leading-tight text-[var(--fg)]">
          First, forget multithreading
        </h2>

        <ComparisonTable
          leftTitle="A thread"
          rightTitle="A V3 coroutine"
          leftTone="warn"
          rightTone="info"
          leftItems={[
            "May execute at the same instant as robot code",
            "Shared data may need locks or atomic values",
            "The operating system or JVM decides when it runs",
            "Blocking mostly stalls that thread",
          ]}
          rightItems={[
            "Executes only while the scheduler has mounted it",
            "Runs on the same thread as the other commands",
            "The command chooses when to yield",
            "Blocking stalls the entire scheduler loop",
          ]}
        />

        <Box
          variant="alert-warning"
          tag="DO NOT MIX UP"
          title="V3 is explicitly single-threaded"
        >
          WPILib&apos;s design lists pre-emptive multitasking and multithreading
          support as non-goals. Commands, trigger scheduling, and cancellation
          are expected to happen on one thread. V3 coroutines make cooperative
          code look linear; they do not make command APIs thread-safe.
        </Box>
      </section>

      <section className="flex flex-col gap-6">
        <h2 className="text-2xl font-semibold leading-tight text-[var(--fg)]">
          One scheduler tick, slowed down
        </h2>
        <p className="text-[15px] leading-relaxed text-[var(--fg-mute)]">
          The normal robot loop calls <code>Scheduler.getDefault().run()</code>.
          During that call, the scheduler polls triggers, starts queued work,
          and gives every running command a turn until it yields or finishes.
        </p>

        <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-4">
          {[
            [
              "01",
              "POLL",
              "Read trigger edges and queue newly requested commands.",
            ],
            [
              "02",
              "RESOLVE",
              "Cancel lower-priority commands that conflict on a mechanism.",
            ],
            [
              "03",
              "TAKE TURNS",
              "Resume each command until it yields, returns, or throws.",
            ],
            [
              "04",
              "CLEAN UP",
              "Remove finished work and cancel children whose parent ended.",
            ],
          ].map(([number, label, detail]) => (
            <div
              key={number}
              className="rounded-md border border-[var(--line)] bg-[var(--bg-elev)] p-4"
            >
              <div className="mono mb-2 text-xs text-[var(--accent)]">
                {number} · {label}
              </div>
              <p className="text-sm leading-relaxed text-[var(--fg-mute)]">
                {detail}
              </p>
            </div>
          ))}
        </div>

        <CodeBlock
          language="text"
          title="Three commands across three 20 ms robot loops"
          code={`LOOP 1   drive: set speeds → yield
         arm:  set target → waitUntil yields
         leds: draw frame → yield

LOOP 2   drive: set new speeds → yield
         arm:  target not reached → waitUntil yields
         leds: draw next frame → yield

LOOP 3   drive: set new speeds → yield
         arm:  target reached → body returns (finished)
         leds: draw next frame → yield`}
        />

        <p className="text-[15px] leading-relaxed text-[var(--fg-mute)]">
          Nothing above runs simultaneously. It only appears simultaneous at
          human timescales because every command gets another short turn about
          every 20 milliseconds.
        </p>
      </section>

      <section className="flex flex-col gap-6">
        <h2 className="text-2xl font-semibold leading-tight text-[var(--fg)]">
          Yield points are bookmarks
        </h2>

        <div className="grid gap-4 lg:grid-cols-2">
          <Box
            variant="concept"
            tag="YIELD"
            title="Pause until the next scheduler turn"
          >
            <code>coroutine.yield()</code> saves the current location and local
            variables, lets other commands run, then resumes on a later loop.
          </Box>
          <Box variant="concept" tag="WAIT" title="Pause until time passes">
            <code>coroutine.wait(Seconds.of(0.5))</code> yields internally until
            the scheduler&apos;s clock reaches the duration.
          </Box>
          <Box
            variant="concept"
            tag="WAIT UNTIL"
            title="Pause until a condition is true"
          >
            <code>coroutine.waitUntil(arm::isAtTarget)</code> checks once per
            turn and yields while the answer is false.
          </Box>
          <Box variant="concept" tag="PARK" title="Pause forever">
            <code>coroutine.park()</code> keeps ownership until cancellation.
            Code after it is unreachable.
          </Box>
          <Box
            variant="concept"
            tag="AWAIT"
            title="Pause until a child finishes"
          >
            <code>coroutine.await(command)</code> schedules the child if needed
            and yields until that child ends.
          </Box>
          <Box
            variant="concept"
            tag="FORK"
            title="Start a child without pausing"
          >
            <code>coroutine.fork(command)</code> starts child work and lets the
            parent continue immediately. The child cannot outlive its parent.
          </Box>
        </div>

        <CodeBlock
          language="java"
          title="The V2 lifecycle is just a coroutine loop"
          code={`public void run(Coroutine coroutine) {
  initialize();

  while (true) {
    execute();
    if (isFinished()) break;
    coroutine.yield(); // the scheduler can now run everything else
  }

  end(false); // reached only on natural completion
}

public void onCancel() {
  end(true);  // cancellation never resumes the body
}`}
        />
      </section>

      <section className="flex flex-col gap-6">
        <h2 className="text-2xl font-semibold leading-tight text-[var(--fg)]">
          Four ways to coordinate commands
        </h2>

        <div className="overflow-x-auto rounded-md border border-[var(--line)]">
          <table className="w-full min-w-[720px] border-collapse text-left text-sm">
            <thead className="bg-[var(--bg-elev-2)] text-[var(--fg)]">
              <tr>
                <th className="border-b border-[var(--line)] p-3">Goal</th>
                <th className="border-b border-[var(--line)] p-3">Use</th>
                <th className="border-b border-[var(--line)] p-3">
                  Parent resumes when
                </th>
                <th className="border-b border-[var(--line)] p-3">
                  Other children
                </th>
              </tr>
            </thead>
            <tbody className="text-[var(--fg-mute)]">
              {[
                [
                  "A, then B",
                  "await(a); await(b);",
                  "Each awaited child finishes",
                  "None running",
                ],
                [
                  "A and B; need both",
                  "awaitAll(a, b);",
                  "Both finish",
                  "Already finished",
                ],
                [
                  "A and B; first wins",
                  "awaitAny(a, b);",
                  "Either finishes",
                  "Cancelled",
                ],
                [
                  "A in background",
                  "fork(a);",
                  "Immediately",
                  "A stays tied to parent",
                ],
              ].map(([goal, use, resumes, others]) => (
                <tr
                  key={goal}
                  className="border-b border-[var(--line-soft)] last:border-0"
                >
                  <th className="p-3 font-medium text-[var(--fg)]">{goal}</th>
                  <td className="p-3">
                    <code>{use}</code>
                  </td>
                  <td className="p-3">{resumes}</td>
                  <td className="p-3">{others}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <Box
          variant="alert-info"
          tag="SIMPLER DEFAULT"
          title="Use groups for fixed choreography"
        >
          For a routine that is always A then B,{" "}
          <code>Command.sequence(a, b)</code> is shorter. For two commands that
          always run together, use <code>Command.parallel(a, b)</code>. Reach
          for coroutine coordination when normal control flow, runtime sensor
          choices, or narrower child ownership makes the routine clearer.
        </Box>
      </section>

      <section className="flex flex-col gap-6">
        <h2 className="text-2xl font-semibold leading-tight text-[var(--fg)]">
          Worked example: score with a recovery path
        </h2>
        <p className="text-[15px] leading-relaxed text-[var(--fg-mute)]">
          This routine starts the flywheel in the background, moves the arm, and
          waits up to 1.25 seconds for shooter speed. If the flywheel never
          becomes ready, it exits instead of feeding a game piece badly.
        </p>

        <CodeBlock
          language="java"
          title="A sensor-driven routine with bounded waits"
          code={`// In Flywheel.java: cancellation must clear the controller's last request.
public Command spinUpSafely() {
  return runRepeatedly(() -> setVelocity(SHOOTING_SPEED_RPS))
      .whenCanceled(motor::stopMotor)
      .named("Flywheel:spinUpSafely");
}

// In Robot.java: coordinate the three mechanisms without claiming them all up front.
public Command scoreSafely() {
  return Command.noRequirements(coroutine -> {
        // Start spin-up and keep reading the next line immediately.
        coroutine.fork(flywheel.spinUpSafely());

        // This line pauses until the arm child finishes.
        coroutine.await(arm.scoringAndWait());

        // A fault cannot trap the entire routine forever.
        if (coroutine
            .waitUntil(flywheel::isAtTarget, Seconds.of(1.25))
            .timedOut()) {
          setShooterFault(true);
          return; // cancels the child; spinUpSafely's cancel hook stops the motor
        }

        setShooterFault(false);
        coroutine.await(intake.feedFor(Seconds.of(0.4)));
      })
      .named("scoreSafely");
}`}
        />

        <ol className="ml-5 list-decimal space-y-2 text-[15px] leading-relaxed text-[var(--fg-mute)]">
          <li>
            <code>fork</code> starts spin-up, but does not create another Java
            thread. The flywheel child gets turns from the same scheduler.
          </li>
          <li>
            While the parent awaits the arm, the flywheel child and unrelated
            commands continue taking their normal turns.
          </li>
          <li>
            The timeout converts a failed sensor or jam into an explicit branch
            instead of an autonomous routine that waits forever.
          </li>
          <li>
            Returning ends the parent. Any unfinished forked children are
            cancelled automatically. The child&apos;s <code>whenCanceled</code>
            hook clears the motor controller&apos;s last request.
          </li>
        </ol>
      </section>

      <section className="flex flex-col gap-6">
        <h2 className="text-2xl font-semibold leading-tight text-[var(--fg)]">
          Cancellation is not an exception
        </h2>
        <p className="text-[15px] leading-relaxed text-[var(--fg-mute)]">
          When a command is cancelled, WPILib does not resume its body or throw
          an exception through it. The saved continuation is discarded. That
          makes cancellation fast, but it means code after an unfinished wait
          never runs.
        </p>

        <CodeBlock
          language="java"
          title="Separate normal completion from interrupt cleanup"
          code={`public Command acquirePiece() {
  return run(coroutine -> {
        motor.setControl(intakeRequest);
        coroutine.waitUntil(this::hasPiece);

        // Runs only when the sensor ends the command naturally.
        motor.setControl(holdRequest);
      })
      // Runs only when another command or scope cancels this one.
      .whenCanceled(() -> motor.setControl(stopRequest))
      .named("Intake:acquirePiece");
}`}
        />

        <Box
          variant="alert-warning"
          tag="PARENT LIFETIME"
          title="Children never detach"
        >
          A child started with <code>fork</code> or <code>await</code> belongs
          to its parent command. Cancelling the parent cancels its whole command
          tree. V3 intentionally has no coroutine equivalent of a detached V2{" "}
          <code>ScheduleCommand</code>.
        </Box>
      </section>

      <section className="flex flex-col gap-6">
        <h2 className="text-2xl font-semibold leading-tight text-[var(--fg)]">
          Code that freezes the scheduler
        </h2>

        <div className="grid gap-4 lg:grid-cols-2">
          <CodeBlock
            language="java"
            title="Wrong — the loop never yields"
            code={`return run(coroutine -> {
  while (!isAtTarget()) {
    updateMotor();
    // The scheduler can never run another command.
  }
}).named("brokenMove");`}
          />
          <CodeBlock
            language="java"
            title="Right — cooperate once per pass"
            code={`return run(coroutine -> {
  while (!isAtTarget()) {
    updateMotor();
    coroutine.yield();
  }
}).named("cooperativeMove");`}
          />
        </div>

        <div className="grid gap-4 lg:grid-cols-3">
          <Box variant="concept" tag="SAFE" title="Short synchronous work">
            Read sensors, calculate a setpoint, and send motor requests. Keep
            each turn short enough to fit comfortably inside the robot loop.
          </Box>
          <Box variant="concept" tag="PAUSE WITH V3" title="Robot-time waiting">
            Use <code>wait</code>, <code>waitUntil</code>, <code>await</code>,
            or <code>yield</code>. These pause only this command body.
          </Box>
          <Box
            variant="concept"
            tag="BLOCKS EVERYTHING"
            title="Thread-style waiting"
          >
            Do not use <code>Thread.sleep</code>, blocking network reads, long
            file operations, or an unyielding loop in a command body.
          </Box>
        </div>
      </section>

      <section className="flex flex-col gap-6">
        <h2 className="text-2xl font-semibold leading-tight text-[var(--fg)]">
          When another thread really exists
        </h2>
        <p className="text-[15px] leading-relaxed text-[var(--fg-mute)]">
          A camera library, vendor callback, or network client may manage its
          own background thread. Keep that boundary outside Commands V3: the
          background code publishes a small immutable result, and scheduler code
          reads the latest result during its normal turn.
        </p>

        <CodeBlock
          language="java"
          title="Cross the boundary with one immutable snapshot"
          code={`private final AtomicReference<VisionResult> latest =
    new AtomicReference<>(VisionResult.empty());

// Called by the camera library's thread.
public void acceptCameraResult(VisionResult result) {
  latest.set(result);
}

// Called by a Commands V3 body on the scheduler thread.
public Command align() {
  return runRepeatedly(() -> {
    VisionResult result = latest.get();
    applyAlignment(result);
  }).named("Vision:align");
}`}
        />

        <Box
          variant="alert-info"
          tag="BOUNDARY RULE"
          title="Do not schedule from the callback"
        >
          Treat the scheduler thread as the owner of command state. A background
          callback should publish data, not call <code>schedule</code>,{" "}
          <code>cancel</code>, or mutate a mechanism while a command may also be
          using it.
        </Box>
      </section>

      <section className="flex flex-col gap-6">
        <h2 className="text-2xl font-semibold leading-tight text-[var(--fg)]">
          Choosing the simplest tool
        </h2>

        <div className="overflow-x-auto rounded-md border border-[var(--line)]">
          <table className="w-full min-w-[680px] border-collapse text-left text-sm">
            <thead className="bg-[var(--bg-elev-2)] text-[var(--fg)]">
              <tr>
                <th className="border-b border-[var(--line)] p-3">Situation</th>
                <th className="border-b border-[var(--line)] p-3">
                  Start with
                </th>
              </tr>
            </thead>
            <tbody className="text-[var(--fg-mute)]">
              {[
                [
                  "Send one motor request and finish",
                  "run(coroutine -> setValue(...))",
                ],
                ["Update a drive request every loop", "runRepeatedly(...)"],
                ["Fixed A then B routine", "Command.sequence(a, b)"],
                ["Fixed A and B together", "Command.parallel(a, b)"],
                [
                  "Branch, loop, retry, or recover from sensors",
                  "A coroutine body",
                ],
                ["Explicit stateful V2 lifecycle is clearer", "ClassicCommand"],
                ["Many named phases can transition repeatedly", "StateMachine"],
              ].map(([situation, tool]) => (
                <tr
                  key={situation}
                  className="border-b border-[var(--line-soft)] last:border-0"
                >
                  <th className="p-3 font-medium text-[var(--fg)]">
                    {situation}
                  </th>
                  <td className="p-3">
                    <code>{tool}</code>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <Quiz
        title="Coroutine Checkpoint"
        questions={[
          {
            id: 1,
            question:
              "How many threads normally execute Commands V3 command bodies?",
            options: [
              "One scheduler thread",
              "One thread per command",
              "One thread per mechanism",
              "Two: one for triggers and one for commands",
            ],
            correctAnswer: 0,
            explanation:
              "Commands are concurrent because several bodies can be paused and in progress, but they take turns executing on one scheduler thread.",
          },
          {
            id: 2,
            question: "What happens when a command calls Thread.sleep(500)?",
            options: [
              "Only that coroutine pauses safely",
              "The scheduler thread is blocked, delaying every command and the robot loop",
              "WPILib converts it into coroutine.wait automatically",
              "The command moves to a background worker",
            ],
            correctAnswer: 1,
            explanation:
              "Thread.sleep blocks the actual scheduler thread. Use coroutine.wait for robot-time delays so other commands can keep taking turns.",
          },
          {
            id: 3,
            question:
              "A parent forks a flywheel command and then returns. What happens next?",
            options: [
              "The flywheel continues as a detached command",
              "The flywheel is promoted to a global command",
              "The flywheel child is cancelled with its parent",
              "Returning is illegal after fork",
            ],
            correctAnswer: 2,
            explanation:
              "Forked and awaited children are lifetime-bound to their parent. A parent that ends naturally or is cancelled takes unfinished children with it.",
          },
          {
            id: 4,
            question:
              "Where does cleanup that must run on interruption belong?",
            options: [
              "After coroutine.park()",
              "In a finally block around coroutine.waitUntil",
              "In a .whenCanceled(...) builder callback",
              "At the start of the next default command only",
            ],
            correctAnswer: 2,
            explanation:
              "Cancellation discards the paused continuation, so the body does not resume and unwind. The dedicated whenCanceled callback is the interruption cleanup hook.",
          },
          {
            id: 5,
            question:
              "A camera callback runs on a vendor thread. What should it usually do?",
            options: [
              "Schedule and cancel commands directly",
              "Write motor outputs so latency is lowest",
              "Publish an immutable result that scheduler-thread code reads later",
              "Call Scheduler.run() from the callback",
            ],
            correctAnswer: 2,
            explanation:
              "Keep command ownership on the scheduler thread. A small atomic snapshot creates a clear, auditable boundary to truly multithreaded vendor code.",
          },
        ]}
      />
    </PageTemplate>
  );
}
