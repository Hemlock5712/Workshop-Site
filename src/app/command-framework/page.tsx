import PageTemplate from "@/components/PageTemplate";
import KeyConceptSection from "@/components/KeyConceptSection";
import ConceptBox from "@/components/ConceptBox";

export default function CommandFramework() {
  return (
    <PageTemplate
      title="Command-Based Framework"
      previousPage={{ href: "/project-setup", title: "Project Setup" }}
      nextPage={{ href: "/building-subsystems", title: "Building Subsystems" }}
    >
      {/* Introduction */}
      <KeyConceptSection
        title="Command-Based Framework - Core Programming Concepts"
        description="The Command-Based Framework organizes robot code into three key components: Triggers (inputs), Subsystems (hardware), and Commands (actions). This structure provides clean separation of concerns and reliable robot behavior."
        concept="Command-based programming is the format in which you will write your code."
      />

      <div className="grid md:grid-cols-3 gap-6">
        <ConceptBox title="Triggers" subtitle="Use BooleanSuppliers (True or False)">
          Link inputs to commands (e.g., press button to drive forward, or use sensor to run Command automatically). All buttons/triggers on a game controller are considered &quot;Triggers&quot;.
        </ConceptBox>

        <ConceptBox title="Subsystems" subtitle="Hardware components and control logic">
          (e.g., Drivetrain, Arm, or Flywheel). Motors and sensors are instantiated. Methods to pull data from sensors within the subsystem are defined.
        </ConceptBox>

        <ConceptBox title="Commands" subtitle="Use Runnables (void functions)">
          Encapsulate robot actions (e.g., DriveForwardCommand, ShootBallCommand).
        </ConceptBox>
      </div>

      <section className="flex flex-col gap-8">
        <h2 className="text-3xl font-bold text-slate-900 dark:text-slate-100">
          Progressive Implementation Path
        </h2>

        <p className="text-slate-600 dark:text-slate-300">
          Follow our step-by-step implementation guide to build a complete command-based robot system. Each pull request builds on the previous one, teaching core concepts progressively.
        </p>
        
        <div className="grid md:grid-cols-1 gap-6">
          <div className="bg-slate-50 dark:bg-slate-900 rounded-lg p-6 shadow-lg border border-slate-200 dark:border-slate-800">
            <h3 className="text-xl font-bold text-[var(--foreground)] mb-4">🚀 Implementation Sequence</h3>
            <div className="space-y-4">
              <div className="flex items-center gap-4 p-4 bg-primary-50 dark:bg-primary-950/20 rounded-lg">
                <div className="bg-primary-500 text-white rounded-full w-8 h-8 flex items-center justify-center font-bold">1</div>
                <div>
                  <h4 className="font-bold text-primary-700 dark:text-primary-300">Building Subsystems</h4>
                  <p className="text-primary-600 dark:text-primary-400 text-sm">Hardware instantiation, motor configuration, and basic control methods</p>
                </div>
              </div>
              <div className="flex items-center gap-4 p-4 bg-primary-100 dark:bg-primary-900/30 rounded-lg">
                <div className="bg-primary-600 text-white rounded-full w-8 h-8 flex items-center justify-center font-bold">2</div>
                <div>
                  <h4 className="font-bold text-primary-800 dark:text-primary-200">Adding Commands</h4>
                  <p className="text-primary-700 dark:text-primary-300 text-sm">Command structure, lifecycle, and controller integration</p>
                </div>
              </div>
              <div className="flex items-center gap-4 p-4 bg-primary-200 dark:bg-primary-800/40 rounded-lg">
                <div className="bg-primary-700 text-white rounded-full w-8 h-8 flex items-center justify-center font-bold">3</div>
                <div>
                  <h4 className="font-bold text-primary-900 dark:text-primary-100">PID Control</h4>
                  <p className="text-primary-800 dark:text-primary-200 text-sm">Precise position control with feedback and tuning</p>
                </div>
              </div>
              <div className="flex items-center gap-4 p-4 bg-primary-300 dark:bg-primary-700/50 rounded-lg">
                <div className="bg-primary-800 text-white rounded-full w-8 h-8 flex items-center justify-center font-bold">4</div>
                <div>
                  <h4 className="font-bold text-primary-950 dark:text-white">Motion Magic</h4>
                  <p className="text-primary-900 dark:text-primary-100 text-sm">Smooth profiled motion with acceleration control</p>
                </div>
              </div>
              <div className="flex items-center gap-4 p-4 bg-primary-400 dark:bg-primary-600/60 rounded-lg">
                <div className="bg-primary-900 text-white rounded-full w-8 h-8 flex items-center justify-center font-bold">5</div>
                <div>
                  <h4 className="font-bold text-slate-900 dark:text-white">Useful Functions</h4>
                  <p className="text-slate-800 dark:text-slate-100 text-sm">Safety features, diagnostics, and utility functions</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Documentation Link */}
        <div className="bg-[var(--muted)] rounded-lg p-6 border-l-4 border-[var(--border)]">
          <h3 className="text-xl font-bold text-[var(--foreground)] mb-4">📚 Official WPILib Command-Based Documentation</h3>
          <p className="text-[var(--foreground)] mb-4">
            For comprehensive Command-Based Framework reference, advanced patterns, and complete API documentation:
          </p>
          <a 
            href="https://docs.wpilib.org/en/stable/docs/software/commandbased/index.html"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center px-6 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors font-medium"
          >
            📖 WPILib Command-Based Programming Guide
            <svg className="ml-2 w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
            </svg>
          </a>
        </div>
      </section>
    </PageTemplate>
  );
}