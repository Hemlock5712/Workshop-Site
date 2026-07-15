import PageTemplate from "@/components/PageTemplate";
import KeyConceptSection from "@/components/KeyConceptSection";
import CodeBlock from "@/components/CodeBlock";
import ComparisonTable from "@/components/ComparisonTable";
import DocumentationButton from "@/components/DocumentationButton";
import Box from "@/components/Box";
import Quiz from "@/components/Quiz";
import { BookOpen, Code2, ExternalLink } from "lucide-react";

export default function CommandsV3Migration() {
  return (
    <PageTemplate title="Commands V3 for V2 Teams">
      <KeyConceptSection
        title="Keep the scheduler model. Replace the command shape."
        description={[
          "Commands V3 still solves the problem you already know: triggers schedule commands, commands claim exclusive access to hardware, defaults fill idle time, and the scheduler advances robot work every loop.",
          "The main change is how an action is written. V2 spreads one action across initialize, execute, isFinished, and end. V3 lets that action read from top to bottom as one method body that pauses at explicit coroutine calls.",
        ]}
        concept="If you understand V2 requirements, scheduling, defaults, and triggers, you already understand most of V3. The coroutine is a clearer way to express time, not a new kind of robot thread."
      />

      <Box
        variant="alert-info"
        tag="SOURCE CHECK · JULY 15, 2026"
        title="This lesson targets the WPILib 2027 alpha"
      >
        <p>
          The examples were checked against the current WPILib{" "}
          <code>org.wpilib.command3</code> source and the team&apos;s{" "}
          <code>2027-Template</code> branch. Commands V3 documentation is still
          being written and the API can change before kickoff, so verify the
          pinned WPILib version before copying code into another project.
        </p>
      </Box>

      <div className="flex flex-wrap gap-3">
        <DocumentationButton
          href="https://github.com/wpilibsuite/allwpilib/blob/main/design-docs/commands-v3.md"
          title="Commands V3 Design Document"
          icon={<BookOpen className="h-5 w-5" />}
        />
        <DocumentationButton
          href="https://github.com/wpilibsuite/allwpilib/tree/main/wpilibjExamples/src/main/java/org/wpilib/examples/hatchbotcmdv3"
          title="Official Example Robot in V3"
          icon={<Code2 className="h-5 w-5" />}
        />
        <DocumentationButton
          href="https://github.com/Hemlock5712/2027-Template/tree/2027-dev"
          title="Team 2027 Template"
          icon={<ExternalLink className="h-5 w-5" />}
        />
      </div>

      <section className="flex flex-col gap-6">
        <h2 className="text-2xl font-semibold leading-tight text-[var(--fg)]">
          What stays, what moves, what changes
        </h2>

        <div className="grid gap-4 lg:grid-cols-3">
          <Box variant="concept" tag="KEEP" title="Scheduler rules">
            Requirements are still exclusive. Triggers still schedule work.
            Default commands still run when hardware is free. A conflicting
            command can still interrupt the command that owns a mechanism.
          </Box>
          <Box variant="concept" tag="RENAME" title="Project structure">
            A V2 <code>Subsystem</code> becomes a V3 <code>Mechanism</code>. The
            team template replaces <code>RobotContainer</code> with a{" "}
            <code>Robot</code> that owns mechanisms and one annotated{" "}
            <code>OpMode</code> per robot mode.
          </Box>
          <Box variant="concept" tag="RETHINK" title="Command bodies">
            Lifecycle callbacks become a linear body. The body returns to
            finish, calls <code>park()</code> to hold, or pauses with{" "}
            <code>yield</code>, <code>wait</code>, <code>waitUntil</code>, or{" "}
            <code>await</code>.
          </Box>
        </div>

        <ComparisonTable
          leftTitle="Commands V2"
          rightTitle="Commands V3"
          leftTone="neutral"
          rightTone="info"
          leftItems={[
            "<code>SubsystemBase</code> owns hardware",
            "<code>Command</code> has four lifecycle callbacks",
            "<code>RobotContainer</code> owns subsystems and bindings",
            "<code>CommandScheduler.getInstance()</code>",
            "Packages start with <code>edu.wpi.first</code>",
          ]}
          rightItems={[
            "<code>Mechanism</code> owns hardware",
            "<code>Command</code> has one coroutine-shaped body",
            "<code>Robot</code> owns mechanisms; <code>OpMode</code> owns mode policy",
            "<code>Scheduler.getDefault()</code>",
            "Packages start with <code>org.wpilib</code>",
          ]}
        />
      </section>

      <section className="flex flex-col gap-6">
        <h2 className="text-2xl font-semibold leading-tight text-[var(--fg)]">
          The same command, side by side
        </h2>
        <p className="text-[15px] leading-relaxed text-[var(--fg-mute)]">
          This arm command sets a target, waits until the encoder reaches it,
          and stops the motor if another command interrupts it. The behavior is
          the same in both versions; only the spelling changes.
        </p>

        <div className="grid gap-4 xl:grid-cols-2">
          <CodeBlock
            language="java"
            title="V2 — state split across callbacks"
            code={`public class MoveArm extends CommandBase {
  private final Arm arm;
  private final double target;

  public MoveArm(Arm arm, double target) {
    this.arm = arm;
    this.target = target;
    addRequirements(arm);
  }

  @Override
  public void initialize() {
    arm.setTarget(target);
  }

  @Override
  public boolean isFinished() {
    return arm.atTarget(target);
  }

  @Override
  public void end(boolean interrupted) {
    if (interrupted) arm.stop();
  }
}`}
          />
          <CodeBlock
            language="java"
            title="V3 — one body with one pause"
            code={`public Command moveTo(double target) {
  return run(coroutine -> {
        setTarget(target);
        coroutine.waitUntil(() -> atTarget(target));
      })
      .whenCanceled(this::stop)
      .named("Arm:moveTo:" + target);
}`}
          />
        </div>

        <Box
          variant="alert-tip"
          tag="READ IT LITERALLY"
          title="V3 executes top to bottom"
        >
          Set the target, pause until the sensor condition is true, then return.
          Returning means normal completion. If the command is cancelled while
          paused, the coroutine is discarded and <code>whenCanceled</code> runs.
        </Box>
      </section>

      <section className="flex flex-col gap-6">
        <h2 className="text-2xl font-semibold leading-tight text-[var(--fg)]">
          Translation guide
        </h2>

        <div className="overflow-x-auto rounded-md border border-[var(--line)]">
          <table className="w-full min-w-[680px] border-collapse text-left text-sm">
            <thead className="bg-[var(--bg-elev-2)] text-[var(--fg)]">
              <tr>
                <th className="border-b border-[var(--line)] p-3">Intent</th>
                <th className="border-b border-[var(--line)] p-3">V2</th>
                <th className="border-b border-[var(--line)] p-3">V3</th>
              </tr>
            </thead>
            <tbody className="text-[var(--fg-mute)]">
              {[
                ["Own hardware", "extends SubsystemBase", "extends Mechanism"],
                [
                  "Run once",
                  "runOnce(action)",
                  "run(co -> action.run()).named(...)",
                ],
                [
                  "Run every loop",
                  "run(action)",
                  "runRepeatedly(action).named(...)",
                ],
                [
                  "Wait for a sensor",
                  "waitUntil(condition)",
                  "co.waitUntil(condition)",
                ],
                [
                  "Wait for time",
                  "waitSeconds(0.5)",
                  "co.wait(Seconds.of(0.5))",
                ],
                [
                  "Run A then B",
                  "a.andThen(b)",
                  "Command.sequence(a, b).named(...)",
                ],
                [
                  "Wait for all",
                  "a.alongWith(b)",
                  "Command.parallel(a, b).named(...)",
                ],
                ["First one wins", "a.raceWith(b)", "co.awaitAny(a, b)"],
                [
                  "Hold forever",
                  "run(action)",
                  "run(co -> { action.run(); co.park(); })",
                ],
                [
                  "Interrupt cleanup",
                  "end(true) / finallyDo",
                  ".whenCanceled(cleanup)",
                ],
              ].map(([intent, v2, v3]) => (
                <tr
                  key={intent}
                  className="border-b border-[var(--line-soft)] last:border-0"
                >
                  <th className="p-3 font-medium text-[var(--fg)]">{intent}</th>
                  <td className="p-3">
                    <code>{v2}</code>
                  </td>
                  <td className="p-3">
                    <code>{v3}</code>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <Box
          variant="alert-info"
          tag="BRIDGE"
          title="You can keep the V2 lifecycle while learning"
        >
          The team template includes <code>utils/ClassicCommand</code>. It
          exposes familiar <code>initialize</code>, <code>execute</code>,{" "}
          <code>isFinished</code>, and <code>end</code> methods while running on
          the V3 scheduler. Use it for a stateful command when that shape is
          clearer, then migrate simple commands to coroutine bodies gradually.
        </Box>
      </section>

      <section className="flex flex-col gap-6">
        <h2 className="text-2xl font-semibold leading-tight text-[var(--fg)]">
          RobotContainer becomes Robot plus OpModes
        </h2>
        <p className="text-[15px] leading-relaxed text-[var(--fg-mute)]">
          V2 puts hardware ownership and every mode&apos;s bindings in one
          container. The 2027 template separates them: <code>Robot</code> owns
          shared hardware, while each <code>OpMode</code> owns only the policy
          that should exist during that mode.
        </p>

        <CodeBlock
          language="java"
          title="V3 structure — shared hardware, mode-scoped controls"
          code={`public class Robot extends OpModeRobot {
  public final Arm arm = new Arm();

  @Override
  public void robotPeriodic() {
    Scheduler.getDefault().run();
  }
}

@Teleop(name = "Competition Teleop")
public class TeleopOpMode extends PeriodicOpMode {
  private final CommandNiDsXboxController driver =
      new CommandNiDsXboxController(0);

  public TeleopOpMode(Robot robot) {
    driver.a().whileTrue(robot.arm.scoring());
    driver.b().whileTrue(robot.arm.stowed());
  }
}`}
        />

        <p className="text-[15px] leading-relaxed text-[var(--fg-mute)]">
          When teleop exits, those two bindings are removed automatically. A
          demo drive mode can define a completely different controller layout
          without conditionals or manual unbinding.
        </p>
      </section>

      <section className="flex flex-col gap-6">
        <h2 className="text-2xl font-semibold leading-tight text-[var(--fg)]">
          Where V3 is better
        </h2>

        <div className="grid gap-4 lg:grid-cols-2">
          <Box
            variant="concept"
            tag="LINEAR LOGIC"
            title="Runtime decisions stay readable"
          >
            A sensor-driven routine can use normal <code>if</code>,{" "}
            <code>while</code>, and early <code>return</code> statements. You do
            not have to spread the current phase across fields and callbacks.
          </Box>
          <Box
            variant="concept"
            tag="OWNERSHIP"
            title="Children can claim hardware just in time"
          >
            A coroutine composition can await one mechanism, release it, then
            await another. V2 often needed proxy commands to avoid a group
            owning every subsystem for its entire lifetime.
          </Box>
          <Box
            variant="concept"
            tag="SCOPING"
            title="Bindings clean themselves up"
          >
            Global, OpMode, and command scopes tie a binding or default command
            to the lifetime where it is valid. This removes mode checks and
            teardown code.
          </Box>
          <Box
            variant="concept"
            tag="OBSERVABILITY"
            title="Names and command trees are visible"
          >
            Builder chains require a name. The scheduler tracks parent/child
            relationships, mechanism ownership, priority, and processing time,
            making logs more useful than a list of anonymous groups.
          </Box>
          <Box
            variant="concept"
            tag="PRIORITY"
            title="Important work can win deliberately"
          >
            <code>withPriority(int)</code> supports more than V2&apos;s binary
            interrupt behavior. A fault indicator or emergency action can
            interrupt routine work predictably.
          </Box>
          <Box
            variant="concept"
            tag="SAFETY"
            title="Builders catch incomplete commands"
          >
            Staged builders prevent unnamed or unfinished command definitions
            from becoming runtime surprises. Several coroutine misuse cases are
            checked by the 2027 compiler plugin.
          </Box>
        </div>
      </section>

      <section className="flex flex-col gap-6">
        <h2 className="text-2xl font-semibold leading-tight text-[var(--fg)]">
          Costs and downsides
        </h2>

        <ComparisonTable
          leftTitle="Use V3 when"
          rightTitle="Be cautious when"
          leftTone="ok"
          rightTone="warn"
          leftItems={[
            "Your team targets Java 25 and the 2027 control system",
            "Routines branch or recover based on live sensor data",
            "You want OpMode-scoped bindings and stronger telemetry",
            "Students are comfortable reading normal top-to-bottom Java",
          ]}
          rightItems={[
            "You need a stable, kickoff-season API today; V3 is still alpha",
            "Your codebase is C++; Commands V3 is currently Java-only",
            "Your team may put blocking calls or unyielding loops in command bodies",
            "Vendor examples and community support still assume Commands V2",
          ]}
        />

        <Box
          variant="alert-warning"
          tag="MOST IMPORTANT RISK"
          title="Cooperation is mandatory"
        >
          V3 cannot forcibly pause a command. A long <code>while</code> loop
          without <code>coroutine.yield()</code>, or a blocking call such as{" "}
          <code>Thread.sleep</code>, stalls the scheduler and therefore the
          robot loop. The next lesson makes this rule concrete.
        </Box>

        <ul className="ml-5 list-disc space-y-2 text-[15px] leading-relaxed text-[var(--fg-mute)]">
          <li>
            Cancellation discards the paused body. Interrupt-only cleanup must
            live in <code>whenCanceled</code>, not after a wait or park.
          </li>
          <li>
            New vocabulary and project structure create a real training cost for
            students who already know V2.
          </li>
          <li>
            The continuation implementation is new infrastructure and has less
            competition-season history than V2.
          </li>
          <li>
            Alpha releases can rename APIs, invalidate examples, or require
            project updates before the final 2027 release.
          </li>
        </ul>
      </section>

      <section className="flex flex-col gap-6">
        <h2 className="text-2xl font-semibold leading-tight text-[var(--fg)]">
          A low-risk migration order
        </h2>

        <ol className="ml-5 list-decimal space-y-3 text-[15px] leading-relaxed text-[var(--fg-mute)]">
          <li>
            Start from the team&apos;s pinned <code>2027-Template</code>. Do not
            upgrade a competition project and redesign its architecture at the
            same time.
          </li>
          <li>
            Move one subsystem to a <code>Mechanism</code> and port its simplest
            set-once or run-repeatedly command factories.
          </li>
          <li>
            Keep complex lifecycle commands on <code>ClassicCommand</code> until
            their tests and behavior are stable.
          </li>
          <li>
            Move controller bindings into one teleop <code>OpMode</code>, then
            test mode transitions and disabled behavior.
          </li>
          <li>
            Port fixed command groups with <code>Command.sequence</code> and{" "}
            <code>Command.parallel</code> before introducing <code>fork</code>{" "}
            or nested <code>await</code>.
          </li>
          <li>
            Add coroutine branching only where it clearly removes state fields
            or proxy-command workarounds. Simulate, log, and test cancellation
            at every wait point.
          </li>
        </ol>
      </section>

      <Quiz
        title="V2 to V3 Checkpoint"
        questions={[
          {
            id: 1,
            question: "Which V2 idea is removed by Commands V3?",
            options: [
              "Exclusive hardware requirements",
              "Default commands",
              "Triggers that schedule commands",
              "None of these; V3 keeps all three ideas",
            ],
            correctAnswer: 3,
            explanation:
              "V3 changes APIs and command structure, but requirements, defaults, triggers, interruption, and a periodic scheduler remain core concepts.",
          },
          {
            id: 2,
            question:
              "What is the closest V3 replacement for RobotContainer in this template?",
            options: [
              "One larger Mechanism",
              "Robot owns shared mechanisms, while OpModes own per-mode bindings and policy",
              "Scheduler owns every mechanism directly",
              "There is no place for controller bindings",
            ],
            correctAnswer: 1,
            explanation:
              "The Robot is the shared hardware owner. Each annotated OpMode defines the defaults, bindings, and routine appropriate to that mode, and those bindings are scoped to its lifetime.",
          },
          {
            id: 3,
            question:
              "Why can a coroutine composition improve mechanism availability?",
            options: [
              "It disables requirement checking",
              "It runs every child on a separate thread",
              "Awaited children can claim mechanisms only while each child is active",
              "Every coroutine automatically has maximum priority",
            ],
            correctAnswer: 2,
            explanation:
              "Nested commands are still requirement-safe, but a no-requirements parent can await children one at a time instead of holding the union of every child requirement for the whole routine.",
          },
          {
            id: 4,
            question:
              "What is the safest first use of V3 on a team that already knows V2?",
            options: [
              "Rewrite the full robot into nested fork calls",
              "Port a small mechanism and its simple command factories using the pinned template",
              "Mix V2 and V3 schedulers on the same hardware",
              "Remove all command requirements during migration",
            ],
            correctAnswer: 1,
            explanation:
              "A narrow vertical slice limits risk and makes the new structure teachable. ClassicCommand remains available for lifecycle-shaped commands while students learn.",
          },
        ]}
      />
    </PageTemplate>
  );
}
