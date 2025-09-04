import PageTemplate from "@/components/PageTemplate";

export default function RunningProgram() {
  return (
    <PageTemplate
      title="Running Program"
      previousPage={{ href: "/adding-commands", title: "Commands" }}
      nextPage={{ href: "/mechanism-setup", title: "Mechanism Setup" }}
    >
      <section className="flex flex-col gap-8 bg-slate-50 dark:bg-slate-900 rounded-lg p-8 shadow-lg border border-slate-200 dark:border-slate-800">
        <h2 className="text-3xl font-bold text-slate-900 dark:text-slate-100">
          Running with Hardware Sim
        </h2>

        <p>WPILib provides a powerful tool called Hardware Simulation. This allows you to run your code in the simulator, while also running motors that are connected to the CANivore.</p>
        <p>This prevents the need to run a full roboRIO for testing, while still allowing you to test your code on real hardware.</p>

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

