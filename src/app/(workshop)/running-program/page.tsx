import PageTemplate from "@/components/PageTemplate";
import KeyConceptSection from "@/components/KeyConceptSection";
import Box from "@/components/Box";
import Quiz from "@/components/Quiz";

export default function RunningProgram() {
  return (
    <PageTemplate
      title="Running Program"
      previousPage={{ href: "/triggers", title: "Triggers" }}
      nextPage={{ href: "/mechanism-setup", title: "Mechanism Setup" }}
    >
      {/* Introduction */}
      <KeyConceptSection
        title="Running Program - Hardware Simulation Testing"
        description={[
          "WPILib provides a powerful tool called Hardware Simulation. This allows you to run your code in the simulator, while also running motors that are connected to the CANivore.",
          "Using a CANivore also allows you to build robot applications that run directly on Windows or Linux machines.",
        ]}
        concept="Hardware simulation eliminates the need to use a roboRIO for testing, while still allowing you to test your code on hardware."
      />

      {/* CANivore USB Warning */}
      <Box
        variant="alert-warning"
        icon={
          <svg
            className="w-6 h-6"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.732-.833-2.464 0L4.35 16.5c-.77.833.192 2.5 1.732 2.5z"
            />
          </svg>
        }
        title="Important: CANivore USB Setting"
      >
        <p className="mb-3">
          Before running Hardware Simulation code, you <strong>must</strong>{" "}
          turn <strong>OFF</strong> the &quot;CANivore USB&quot; setting in
          TunerX. This prevents conflicts between the simulation environment and
          physical hardware communication.
        </p>
        <Box variant="alert-warning" title="Steps" className="mt-3">
          Open TunerX → Go to CANivore settings → Disable &quot;CANivore
          USB&quot;
        </Box>
      </Box>

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

      {/* Quiz Section */}
      <section className="flex flex-col gap-8">
        <Quiz
          title="Knowledge Check"
          questions={[
            {
              id: 1,
              question:
                "What is the primary benefit of Hardware Simulation in WPILib?",
              options: [
                "It makes code run faster than on a roboRIO",
                "It allows testing code with physical hardware without using a roboRIO",
                "It automatically fixes bugs in your code",
                "It provides better PID tuning than on real hardware",
              ],
              correctAnswer: 1,
              explanation:
                "Hardware Simulation allows you to run your code in the simulator while controlling real motors connected to the CANivore, eliminating the need for a roboRIO during testing.",
            },
            {
              id: 2,
              question:
                "What setting must be turned OFF in TunerX before running Hardware Simulation code?",
              options: [
                "Motor Control",
                "CANivore USB",
                "Simulation Mode",
                "Hardware Detection",
              ],
              correctAnswer: 1,
              explanation:
                "The 'CANivore USB' setting must be turned OFF in TunerX to prevent conflicts between the simulation environment and physical hardware communication.",
            },
            {
              id: 3,
              question:
                "What type of device enables Hardware Simulation with physical motors?",
              options: [
                "roboRIO 2.0",
                "Power Distribution Hub",
                "CANivore",
                "Radio",
              ],
              correctAnswer: 2,
              explanation:
                "The CANivore enables Hardware Simulation by allowing robot applications to run directly on Windows or Linux machines while controlling physical CAN devices.",
            },
            {
              id: 4,
              question:
                "Which platforms can run Hardware Simulation with a CANivore?",
              options: [
                "Only Windows",
                "Only Linux",
                "Windows and Linux",
                "Windows, Linux, and macOS",
              ],
              correctAnswer: 2,
              explanation:
                "Hardware Simulation with CANivore can run on both Windows and Linux machines, allowing for flexible development environments without a roboRIO.",
            },
          ]}
        />
      </section>
    </PageTemplate>
  );
}
