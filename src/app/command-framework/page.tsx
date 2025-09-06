import PageTemplate from "@/components/PageTemplate";

export default function CommandFramework() {
  return (
    <PageTemplate
      title="Command-Based Framework"
      previousPage={{ href: "/project-setup", title: "Project Setup" }}
      nextPage={{ href: "/building-subsystems", title: "Building Subsystems" }}
    >
      <div className="grid md:grid-cols-3 gap-6">
        <div className="bg-slate-50 dark:bg-slate-900 rounded-lg p-6 shadow-lg border border-slate-200 dark:border-slate-800">
          <h3 className="text-xl font-bold text-[var(--foreground)] mb-3">Triggers</h3>
          <p className="text-slate-600 dark:text-slate-300 mb-3">Use BooleanSuppliers (True or False)</p>
          <p className="text-sm text-slate-500 dark:text-slate-400">
            Link inputs to commands (e.g., press button to drive forward, or use sensor to run Command automatically).
            All buttons/triggers on a game controller are considered &quot;Triggers&quot;.
          </p>
        </div>

        <div className="bg-slate-50 dark:bg-slate-900 rounded-lg p-6 shadow-lg border border-slate-200 dark:border-slate-800">
          <h3 className="text-xl font-bold text-[var(--foreground)] mb-3">Subsystems</h3>
          <p className="text-slate-600 dark:text-slate-300 mb-3">Hardware components and control logic</p>
          <p className="text-sm text-slate-500 dark:text-slate-400">
            (e.g., Drivetrain, Arm, or Flywheel). Motors and sensors are instantiated.
            Methods to pull data from sensors within the subsystem are defined.
          </p>
        </div>

        <div className="bg-slate-50 dark:bg-slate-900 rounded-lg p-6 shadow-lg border border-slate-200 dark:border-slate-800">
          <h3 className="text-xl font-bold text-[var(--foreground)] mb-3">Commands</h3>
          <p className="text-slate-600 dark:text-slate-300 mb-3">Use Runnables (void functions)</p>
          <p className="text-sm text-slate-500 dark:text-slate-400">
            Encapsulate robot actions (e.g., DriveForwardCommand, ShootBallCommand).
          </p>
        </div>
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
      </section>
    </PageTemplate>
  );
}