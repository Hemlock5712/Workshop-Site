import PageTemplate from "@/components/PageTemplate";
import KeyConceptSection from "@/components/KeyConceptSection";

export default function RunningProgram() {
  return (
    <PageTemplate
      title="Running Program"
      previousPage={{ href: "/adding-commands", title: "Commands" }}
      nextPage={{ href: "/mechanism-setup", title: "Mechanism Setup" }}
    >
      {/* Introduction */}
      <KeyConceptSection
        title="Running Program - Hardware Simulation Testing"
        description="WPILib provides a powerful tool called Hardware Simulation. This allows you to run your code in the simulator, while also running motors that are connected to the CANivore."
        concept="Hardware simulation eliminates the need to use a roboRIO for testing, while still allowing you to test your code on hardware."
      />

      {/* CANivore USB Warning */}
      <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-6">
        <div className="flex items-start gap-3">
          <svg className="w-6 h-6 text-red-600 dark:text-red-400 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.732-.833-2.464 0L4.35 16.5c-.77.833.192 2.5 1.732 2.5z" />
          </svg>
          <div>
            <h3 className="text-lg font-bold text-red-800 dark:text-red-300 mb-2">Important: CANivore USB Setting</h3>
            <p className="text-red-700 dark:text-red-300 mb-3">
              Before running Hardware Simulation code, you <strong>must</strong> turn <strong>OFF</strong> the &quot;CANivore USB&quot; setting in TunerX. 
              This prevents conflicts between the simulation environment and physical hardware communication.
            </p>
            <div className="bg-red-100 dark:bg-red-900/30 p-3 rounded border border-red-200 dark:border-red-700">
              <p className="text-red-800 dark:text-red-200 text-sm">
                <strong>Steps:</strong> Open TunerX → Go to CANivore settings → Disable &quot;CANivore USB&quot;
              </p>
            </div>
          </div>
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

