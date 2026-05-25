import GitHubContent from "@/components/GitHubContent";
import PageTemplate from "@/components/PageTemplate";
import Box from "@/components/Box";
import CodeBlock from "@/components/CodeBlock";
import KeyConceptSection from "@/components/KeyConceptSection";
import ContentCard from "@/components/ContentCard";
import Quiz from "@/components/Quiz";

export default function Triggers() {
  return (
    <PageTemplate title="Triggers">
      {/* Introduction */}
      <KeyConceptSection
        title="Triggers - Connecting User Input to Commands"
        description="Triggers link user inputs (buttons, joysticks, sensors) to commands. They define when and how commands should run based on controller input or robot state."
        concept="Use onTrue() to run commands when buttons are pressed, and onFalse() to run commands when buttons are released."
      />

      {/* Trigger Examples */}
      <section className="flex flex-col gap-8">
        <h2 className="text-3xl font-bold text-slate-900 dark:text-slate-100">
          Trigger Implementation & Examples
        </h2>

        {/* Trigger Examples */}
        <ContentCard>
          <details>
            <summary className="text-xl font-bold text-primary-600 mb-4 cursor-pointer hover:text-primary-700 dark:hover:text-primary-300">
              🎯 Trigger Examples - Binding Input to Commands
            </summary>
            <div className="mt-4">
              <CodeBlock
                language="java"
                title="RobotContainer.java - configureBindings()"
                code={`package frc.robot;

import edu.wpi.first.wpilibj2.command.button.CommandXboxController;
import frc.robot.subsystems.Arm;

public class RobotContainer {
    // Hardware - controllers and subsystems
    private final CommandXboxController controller = new CommandXboxController(0);
    private final Arm armSubsystem = new Arm();

    public RobotContainer() {
        configureBindings();
    }

    private void configureBindings() {
        // Left trigger: arm runs fast when pressed, stops when released
        controller.leftTrigger().onTrue(arm.runFast());

        // Right trigger: flywheel runs fast when pressed, runs slow when released
        controller.rightTrigger().onTrue(flywheel.runFast()).onFalse(flywheel.runSlow());

        // A button: flywheel runs fast when pressed, stops when released
        controller.a().onTrue(flywheel.runFast()).onFalse(flywheel.stopCommand());
    }
}`}
              />
            </div>
          </details>
        </ContentCard>

        {/* Key Concepts */}
        <div className="grid md:grid-cols-2 gap-6 mb-6">
          <Box
            variant="concept"
            title="🎮 onTrue() Trigger"
            code={
              <code>
                controller.a()
                <br />
                &nbsp;&nbsp;.onTrue(command);
              </code>
            }
          >
            Run a command once when a button is pressed or condition becomes
            true. The command completes its full lifecycle (initialize, execute,
            end).
          </Box>

          <Box
            variant="concept"
            title="🔽 onFalse() Trigger"
            code={
              <code>
                controller.a()
                <br />
                &nbsp;&nbsp;.onFalse(command);
              </code>
            }
          >
            Run a command once when a button is released or condition becomes
            false. Perfect for stopping motors or returning to safe positions.
          </Box>
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          <Box
            variant="concept"
            title="🔄 Chaining Triggers"
            code={
              <code>
                .onTrue(cmd1)
                <br />
                .onFalse(cmd2);
              </code>
            }
          >
            Chain onTrue() and onFalse() together to define different actions
            for press and release, giving you full control over button behavior.
          </Box>

          <Box
            variant="concept"
            title="🎯 Sensor Triggers"
            code={
              <code>
                new Trigger(
                <br />
                &nbsp;&nbsp;() =&gt; sensor.get())
                <br />
                &nbsp;&nbsp;.onTrue(cmd);
              </code>
            }
          >
            Triggers can be created from any boolean condition - sensors, limit
            switches, or custom logic - not just controller buttons.
          </Box>
        </div>
      </section>

      {/* RobotContainer Implementation */}
      <section className="flex flex-col gap-8">
        <ContentCard>
          <h3 className="text-xl font-bold text-slate-900 dark:text-slate-100 mb-4">
            🔄 Before → After: Implementation
          </h3>

          <div className="grid md:grid-cols-2 gap-6 mb-6">
            <Box variant="alert-danger" title="📋 Before">
              <ul className="space-y-2 text-sm">
                <li>• Empty RobotContainer constructor</li>
                <li>• No controller declared</li>
                <li>• No configureBindings() method</li>
                <li>• Commands exist but can&apos;t be triggered</li>
              </ul>
            </Box>

            <Box variant="alert-success" title="✅ After">
              <ul className="space-y-2 text-sm">
                <li>• CommandXboxController instantiated</li>
                <li>• configureBindings() method created</li>
                <li>• Button triggers bound to commands</li>
                <li>• Robot responds to controller input</li>
              </ul>
            </Box>
          </div>

          {/* Final Implementation & GitHub Changes */}
          <h4 className="text-lg font-bold text-slate-900 dark:text-slate-100 mb-3">
            🎯 Final Implementation & GitHub Changes
          </h4>
          <GitHubContent
            repository="Hemlock5712/Workshop-Code"
            filePath="src/main/java/frc/robot/RobotContainer.java"
            branch="2-Commands"
            pr={{ number: 2, focusFile: "RobotContainer.java" }}
          />
        </ContentCard>
      </section>

      {/* Advanced Command Patterns */}
      <section className="flex flex-col gap-8">
        <ContentCard>
          <details>
            <summary className="text-xl font-bold text-primary-600 mb-4 cursor-pointer hover:text-primary-700 dark:hover:text-primary-300">
              🚀 Advanced Command Patterns
            </summary>
            <div className="mt-4 space-y-8">
              <Box
                variant="alert-info"
                title="ℹ️ Advanced Topics - Beyond This Workshop"
              >
                <p className="mb-3">
                  This workshop uses simplified patterns (
                  <code className="bg-[var(--muted)] px-1.5 py-0.5 rounded text-sm">
                    runOnce()
                  </code>
                  ,{" "}
                  <code className="bg-[var(--muted)] px-1.5 py-0.5 rounded text-sm">
                    onTrue()
                  </code>
                  , and{" "}
                  <code className="bg-[var(--muted)] px-1.5 py-0.5 rounded text-sm">
                    onFalse()
                  </code>
                  ) for easier learning. The examples below show advanced
                  command patterns that are powerful for competition but not
                  required for this workshop&apos;s scope.
                </p>
                <p className="text-sm">
                  💡 Feel free to explore these after completing the workshop
                  fundamentals!
                </p>
              </Box>
              <div>
                <h3 className="text-xl font-bold text-[var(--foreground)] mb-2">
                  Extending WPILib Command
                </h3>
                <p className="text-slate-600 dark:text-slate-300 mb-4">
                  For more complex commands, extend Command directly instead of
                  using inline methods.
                  <a
                    href="https://docs.wpilib.org/en/stable/docs/software/commandbased/commands.html#simple-command-example"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-primary-600 hover:text-primary-700 dark:text-primary-400 dark:hover:text-primary-300 underline ml-1"
                  >
                    See WPILib documentation →
                  </a>
                </p>
                <CodeBlock
                  code={`public class AimAndShoot extends Command {
  private final Drivetrain drive;
  private final Shooter shooter;

  public AimAndShoot(Drivetrain drive, Shooter shooter) {
    this.drive = drive;
    this.shooter = shooter;
    addRequirements(drive, shooter);
  }

  @Override
  public void initialize() {
    shooter.setTargetSpeed(3000);
  }

  @Override
  public void execute() {
    drive.aimAtTarget();
  }

  @Override
  public boolean isFinished() {
    return drive.onTarget() && shooter.atSpeed();
  }

  @Override
  public void end(boolean interrupted) {
    drive.stop();
    shooter.stop();
  }
}`}
                />
              </div>

              <div>
                <h3 className="text-xl font-bold text-[var(--foreground)] mb-2">
                  Complex Command Groups
                </h3>
                <p className="text-slate-600 dark:text-slate-300 mb-4">
                  Combine sequences and parallel actions to coordinate
                  subsystems.
                </p>
                <CodeBlock
                  code={`// Run intake and raise arm simultaneously after driving
new SequentialCommandGroup(
  new DriveDistance(2.0, drivetrain),
  new ParallelCommandGroup(
    new RaiseArm(arm),
    new RunIntake(intake).withTimeout(2)
  )
);`}
                />
              </div>

              <div>
                <h3 className="text-xl font-bold text-[var(--foreground)] mb-2">
                  Composition Strategies
                </h3>
                <p className="text-slate-600 dark:text-slate-300 mb-4">
                  Use fluent helpers to assemble commands from smaller pieces.
                </p>
                <CodeBlock
                  code={`Command shootAndDrive =
  shooter.spinUp()
    .andThen(intake.feed())
    .andThen(drivetrain.driveForward(1.0));`}
                />
              </div>

              <div>
                <h3 className="text-xl font-bold text-[var(--foreground)] mb-2">
                  Common Pitfalls
                </h3>
                <p className="text-slate-600 dark:text-slate-300 mb-4">
                  Always declare subsystem requirements to avoid unexpected
                  conflicts.
                </p>
                <CodeBlock
                  code={`public class BadCommand extends Command {
  private final Drivetrain drive;
  public BadCommand(Drivetrain drive) {
    this.drive = drive;
    // Missing: addRequirements(drive);
  }
}`}
                />
              </div>

              <div>
                <h3 className="text-xl font-bold text-[var(--foreground)] mb-2">
                  Advanced Triggers
                </h3>
                <p className="text-slate-600 dark:text-slate-300 mb-4">
                  Create triggers from sensor conditions or button combinations.
                </p>
                <CodeBlock
                  code={`Trigger armReady = new Trigger(
  () -> arm.atPosition() && shooter.atSpeed());
armReady.onTrue(new FireCommand(shooter, arm));`}
                />
              </div>

              <div>
                <h3 className="text-xl font-bold text-[var(--foreground)] mb-2">
                  Real-World Scenario
                </h3>
                <p className="text-slate-600 dark:text-slate-300 mb-4">
                  Combine patterns to build robust autonomous routines.
                </p>
                <CodeBlock
                  code={`Command auto =
  new ParallelDeadlineGroup(
    new DriveDistance(3, drive),
    new SequentialCommandGroup(
      new SpinUpFlywheel(shooter),
      new FeedShooter(intake, shooter)
    )
  );`}
                />
              </div>
            </div>
          </details>
        </ContentCard>
      </section>

      {/* Quiz Section */}
      <section className="flex flex-col gap-8">
        <Quiz
          title="Knowledge Check"
          questions={[
            {
              id: 1,
              question:
                "What is the primary purpose of triggers in command-based programming?",
              options: [
                "To configure motor speeds",
                "To link user inputs or sensor conditions to commands",
                "To manage subsystem hardware",
                "To log telemetry data",
              ],
              correctAnswer: 1,
              explanation:
                "Triggers link user inputs (buttons, joysticks, sensors) to commands. They define when and how commands should run based on controller input or robot state.",
            },
            {
              id: 2,
              question: "What does the onTrue() trigger method do?",
              options: [
                "Runs a command continuously while a button is held",
                "Runs a command once when a button is pressed or condition becomes true",
                "Stops a command when a button is released",
                "Toggles a command on and off with each press",
              ],
              correctAnswer: 1,
              explanation:
                "onTrue() runs a command once when a button is pressed or condition becomes true. The command completes its full lifecycle (initialize, execute, end).",
            },
            {
              id: 3,
              question: "What does the onFalse() trigger method do?",
              options: [
                "Disables a command permanently",
                "Runs a command once when a button is released or condition becomes false",
                "Prevents a command from running",
                "Runs a command while a button is not pressed",
              ],
              correctAnswer: 1,
              explanation:
                "onFalse() runs a command once when a button is released or condition becomes false. It's perfect for stopping motors or returning to safe positions when input ends.",
            },
            {
              id: 4,
              question:
                "What is the benefit of chaining onTrue() and onFalse() together?",
              options: [
                "It makes the code run faster",
                "It defines different actions for button press and release",
                "It prevents commands from conflicting",
                "It automatically adds safety features",
              ],
              correctAnswer: 1,
              explanation:
                "Chaining onTrue() and onFalse() allows you to define different actions for press and release, giving you full control over button behavior (e.g., start motor on press, stop on release).",
            },
            {
              id: 5,
              question:
                "Besides controller buttons, what else can be used to create triggers?",
              options: [
                "Only Xbox controller buttons are supported",
                "Any boolean condition - sensors, limit switches, or custom logic",
                "Only joystick axes",
                "Only keyboard inputs",
              ],
              correctAnswer: 1,
              explanation:
                "Triggers can be created from any boolean condition using 'new Trigger(() -> condition)'. This includes sensors, limit switches, or any custom logic that returns true/false.",
            },
          ]}
        />
      </section>
    </PageTemplate>
  );
}
