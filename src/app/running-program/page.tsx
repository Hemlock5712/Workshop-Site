import PageTemplate from "@/components/PageTemplate";

export default function RunningProgram() {
  return (
    <PageTemplate
      title="Running Program"
      previousPage={{ href: "/adding-commands", title: "Commands" }}
      nextPage={{ href: "/mechanism-setup", title: "Mechanism Setup" }}
    >
      {/* Introduction */}
      <div className="bg-focus-50 dark:bg-focus-900/20 text-[var(--foreground)] rounded-lg p-8 border border-focus-200 dark:border-focus-800">
        <h2 className="text-3xl font-bold text-slate-900 dark:text-slate-100 mb-4">Running Program - Hardware Simulation Testing</h2>
        <p className="text-[var(--muted-foreground)] mb-4">
          WPILib provides a powerful tool called Hardware Simulation. This allows you to run your code in the simulator, while also running motors that are connected to the CANivore.
        </p>
        <div className="bg-learn-100 dark:bg-learn-900/30 p-4 rounded-lg">
          <p className="text-learn-800 dark:text-learn-300 font-medium">
            🎯 Key Concept: Hardware simulation eliminates the need to use a roboRIO for testing, while still allowing you to test your code on hardware.
          </p>
        </div>
      </div>

      <section className="flex flex-col gap-8">
        <h2 className="text-3xl font-bold text-slate-900 dark:text-slate-100">
          Hardware Simulation Setup
        </h2>

        <iframe
          src="https://www.youtube.com/embed/xsR7m6ToUFE"
          title="Hardware Simulation"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowFullScreen
          className="w-full h-full aspect-video rounded-lg"
        />
      </section>
    </PageTemplate>
  );
}

