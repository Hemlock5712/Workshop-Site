import GithubPageWithPR from "@/components/GithubPageWithPR";
import PageTemplate from "@/components/PageTemplate";
import ConceptBox from "@/components/ConceptBox";
import CodeBlock from "@/components/CodeBlock";
import KeyConceptSection from "@/components/KeyConceptSection";
import ContentCard from "@/components/ContentCard";

export default function Triggers() {
  return (
    <PageTemplate
      title="Triggers"
      previousPage={{ href: "/adding-commands", title: "Commands" }}
      nextPage={{ href: "/running-program", title: "Running Program" }}
    >
      {/* Introduction */}
      <KeyConceptSection
        title="Triggers - Connecting User Input to Commands"
        description="Triggers link user inputs (buttons, joysticks, sensors) to commands. They define when and how commands should run based on controller input or robot state."
        concept="Triggers activate commands based on input conditions."
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
        // 🎮 BUTTON TRIGGERS - Run command while button is held
        controller.a().whileTrue(armSubsystem.moveUp());
        
        // 🔄 BUTTON TRIGGERS - Run command while button is held
        controller.b().whileTrue(armSubsystem.moveDown());     
    }
}`}
              />
            </div>
          </details>
        </ContentCard>

        {/* Key Concepts */}
        <div className="grid md:grid-cols-3 gap-6">
          <ConceptBox
            title="🎮 Button Triggers"
            code={
              <code>
                controller.a()
                <br />
                &nbsp;&nbsp;.whileTrue(command);
              </code>
            }
          >
            Different trigger types for different behaviors: onTrue (once),
            whileTrue (continuous), toggleOnTrue (toggle).
          </ConceptBox>

          <ConceptBox
            title="🎯 Sensor Triggers"
            code={
              <code>
                new Trigger(
                <br />
                &nbsp;&nbsp;() =&gt; sensor.get());
              </code>
            }
          >
            Triggers can also be created from sensor readings or custom
            conditions, not just controller buttons.
          </ConceptBox>

          <ConceptBox
            title="🔄 Trigger Composition"
            code={
              <code>
                trigger1.and(trigger2)
                <br />
                &nbsp;&nbsp;.onTrue(command);
              </code>
            }
          >
            Combine multiple triggers using and(), or(), negate() to create
            complex activation conditions.
          </ConceptBox>
        </div>
      </section>

      {/* RobotContainer Implementation */}
      <section className="flex flex-col gap-8">
        <ContentCard>
          <h3 className="text-xl font-bold text-slate-900 dark:text-slate-100 mb-4">
            🔄 Before → After: Implementation
          </h3>

          <div className="grid md:grid-cols-2 gap-6 mb-6">
            {/* Before Implementation */}
            <div className="bg-red-50 dark:bg-red-950/20 rounded-lg p-4 border border-red-200 dark:border-red-800">
              <h4 className="text-lg font-bold text-red-800 dark:text-red-300 mb-3">
                📋 Before
              </h4>
              <ul className="space-y-2 text-red-700 dark:text-red-300 text-sm">
                <li>• Empty RobotContainer constructor</li>
                <li>• No controller declared</li>
                <li>• No configureBindings() method</li>
                <li>• Commands exist but can&apos;t be triggered</li>
              </ul>
            </div>

            {/* After Implementation */}
            <div className="bg-green-50 dark:bg-green-950/20 rounded-lg p-4 border border-green-200 dark:border-green-800">
              <h4 className="text-lg font-bold text-green-800 dark:text-green-300 mb-3">
                ✅ After
              </h4>
              <ul className="space-y-2 text-green-700 dark:text-green-300 text-sm">
                <li>• CommandXboxController instantiated</li>
                <li>• configureBindings() method created</li>
                <li>• Button triggers bound to commands</li>
                <li>• Robot responds to controller input</li>
              </ul>
            </div>
          </div>

          {/* Final Implementation & GitHub Changes */}
          <h4 className="text-lg font-bold text-slate-900 dark:text-slate-100 mb-3">
            🎯 Final Implementation & GitHub Changes
          </h4>
          <GithubPageWithPR
            repository="Hemlock5712/Workshop-Code"
            filePath="src/main/java/frc/robot/RobotContainer.java"
            branch="2-Commands"
            pullRequestNumber={2}
            focusFile="RobotContainer.java"
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
    </PageTemplate>
  );
}
