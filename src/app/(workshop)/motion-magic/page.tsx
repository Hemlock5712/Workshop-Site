import MechanismTabs from "@/components/MechanismTabs";
import PageTemplate from "@/components/PageTemplate";
import AlphaStatusNote from "@/components/AlphaStatusNote";
import CodeBlock from "@/components/CodeBlock";
import KeyConceptSection from "@/components/KeyConceptSection";
import CollapsibleSection from "@/components/CollapsibleSection";
import DocumentationButton from "@/components/DocumentationButton";
import Quiz from "@/components/Quiz";
import { Book } from "lucide-react";

export default function MotionMagic() {
  return (
    <PageTemplate title="Motion Magic">
      {/* Introduction */}
      <KeyConceptSection
        title="Motion Magic: Profiled Motion Control"
        description="Motion Magic builds on PID control by adding smooth acceleration and deceleration profiles. This prevents jerky movements and reduces mechanical stress while maintaining precise positioning."
        concept="Motion Magic automatically generates smooth velocity profiles to reach target positions with controlled acceleration."
      />

      {/* Motion Magic Theory */}
      <section className="flex flex-col gap-8">
        <h2 className="text-3xl font-bold text-slate-900 dark:text-slate-100">
          Understanding Motion Magic Profiles
        </h2>

        <div className="grid md:grid-cols-2 gap-6">
          <div className="bg-[var(--muted)] rounded-lg p-6 border-l-4 border-[var(--border)]">
            <h3 className="text-xl font-bold text-[var(--foreground)] mb-4">
              Trapezoidal Profile
            </h3>
            <p className="text-[var(--foreground)] mb-4 text-sm">
              Motion Magic creates a trapezoidal velocity profile with three
              phases:
            </p>
            <div className="space-y-2">
              <div className="bg-slate-50 dark:bg-slate-900 p-3 rounded">
                <strong className="text-[var(--foreground)]">
                  1. Acceleration:
                </strong>
                <span className="text-[var(--muted-foreground)] text-sm">
                  {" "}
                  Ramp up to cruise velocity
                </span>
              </div>
              <div className="bg-slate-50 dark:bg-slate-900 p-3 rounded">
                <strong className="text-[var(--foreground)]">2. Cruise:</strong>
                <span className="text-[var(--muted-foreground)] text-sm">
                  {" "}
                  Maintain constant max velocity
                </span>
              </div>
              <div className="bg-slate-50 dark:bg-slate-900 p-3 rounded">
                <strong className="text-[var(--foreground)]">
                  3. Deceleration:
                </strong>
                <span className="text-[var(--muted-foreground)] text-sm">
                  {" "}
                  Smoothly brake to target
                </span>
              </div>
            </div>
          </div>

          <div className="bg-[var(--muted)] rounded-lg p-6 border-l-4 border-blue-500">
            <h3 className="text-xl font-bold text-[var(--foreground)] mb-4">
              Key Parameters
            </h3>
            <div className="space-y-3">
              <div className="bg-slate-50 dark:bg-slate-900 p-3 rounded">
                <h4 className="font-bold text-[var(--foreground)]">
                  Motion Magic Cruise Velocity
                </h4>
                <p className="text-[var(--muted-foreground)] text-sm">
                  Maximum velocity during cruise phase (rotations/second)
                </p>
              </div>
              <div className="bg-slate-50 dark:bg-slate-900 p-3 rounded">
                <h4 className="font-bold text-[var(--foreground)]">
                  Motion Magic Acceleration
                </h4>
                <p className="text-[var(--muted-foreground)] text-sm">
                  Rate of acceleration/deceleration (rotations/second²)
                </p>
              </div>
              <div className="bg-slate-50 dark:bg-slate-900 p-3 rounded">
                <h4 className="font-bold text-[var(--foreground)]">
                  Motion Magic Jerk
                </h4>
                <p className="text-[var(--muted-foreground)] text-sm">
                  Rate of change of acceleration (rotations/second³)
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Documentation Link */}
        <div className="bg-[var(--muted)] rounded-lg p-6 border-l-4 border-[var(--border)]">
          <h3 className="text-xl font-bold text-[var(--foreground)] mb-4">
            Official Motion Magic Documentation
          </h3>
          <p className="text-[var(--foreground)] mb-4">
            For the full Motion Magic reference and configuration examples:
          </p>
          <DocumentationButton
            href="https://v6.docs.ctr-electronics.com/en/latest/docs/api-reference/device-specific/talonfx/motion-magic.html"
            title="CTRE Motion Magic API Reference"
            icon={<Book className="w-5 h-5" />}
          />
        </div>

        {/* Motion Magic Tuning Steps */}
        <CollapsibleSection title="Motion Magic Tuning Steps" variant="info">
          <div className="grid md:grid-cols-2 gap-6">
            {/* Arm/Elevator Position Mechanisms */}
            <div className="bg-blue-50 dark:bg-blue-950 p-4 rounded-lg border border-blue-200 dark:border-blue-800">
              <h4 className="font-semibold text-blue-800 dark:text-blue-200 mb-3 flex items-center">
                Position Mechanisms (Arms, Elevators)
              </h4>

              <div className="space-y-4">
                <div>
                  <h5 className="font-semibold text-[var(--foreground)] mb-2">
                    1. Calculate Maximum Velocity:
                  </h5>
                  <ul className="text-sm text-[var(--foreground)] space-y-2 list-disc list-inside">
                    <li>
                      <strong>Motor Speed:</strong> The Kraken X44 runs about
                      125 RPS at maximum (CTRE&apos;s dyno measures ~129)
                    </li>
                    <li>
                      <strong>Efficiency:</strong> Best used around 80%
                      efficiency
                    </li>
                    <li>
                      <strong>Gear Ratio:</strong> Our 25:1 arm gearing reduces
                      speed
                    </li>
                    <li>
                      <code className="bg-slate-50 dark:bg-slate-800 px-1 rounded">
                        maxVel = (125 / 25) * 0.8 = 4.0 RPS
                      </code>
                    </li>
                  </ul>
                </div>

                <div>
                  <h5 className="font-semibold text-[var(--foreground)] mb-2">
                    2. Set Motion Magic Parameters:
                  </h5>
                  <ul className="text-sm text-[var(--foreground)] space-y-2 list-disc list-inside">
                    <li>
                      <strong>Cruise Velocity:</strong> Use calculated max
                      velocity
                    </li>
                    <li>
                      <code className="bg-slate-50 dark:bg-slate-800 px-1 rounded">
                        cruiseVel = 2.0; // conservative start (calculated max
                        is 4.0)
                      </code>
                    </li>
                    <li>
                      <strong>Acceleration:</strong> Start with 2x–4x cruise
                      velocity for smooth motion (the workshop example uses 4x)
                    </li>
                    <li>
                      <strong>Competition:</strong> Typically end up with 4x to
                      10x cruise velocity
                    </li>
                    <li>
                      <code className="bg-slate-50 dark:bg-slate-800 px-1 rounded">
                        acceleration = cruiseVel * 4.0; // = 8.0, matches the
                        example
                      </code>
                    </li>
                  </ul>
                </div>
              </div>
            </div>

            {/* Flywheel Velocity Mechanisms */}
            <div className="bg-green-50 dark:bg-green-950 p-4 rounded-lg border border-green-200 dark:border-green-800">
              <h4 className="font-semibold text-green-800 dark:text-green-200 mb-3 flex items-center">
                Velocity Mechanisms (Flywheels, Shooters)
              </h4>

              <div className="space-y-4">
                <div>
                  <h5 className="font-semibold text-[var(--foreground)] mb-2">
                    1. Calculate Maximum Velocity:
                  </h5>
                  <ul className="text-sm text-[var(--foreground)] space-y-2 list-disc list-inside">
                    <li>
                      <strong>Motor Speed:</strong> The Kraken X44 runs about
                      125 RPS at maximum (CTRE&apos;s dyno measures ~129)
                    </li>
                    <li>
                      <strong>Efficiency:</strong> Best used around 80%
                      efficiency
                    </li>
                    <li>
                      <strong>Direct Drive:</strong> Using Kraken encoder
                      directly on flywheel
                    </li>
                    <li>
                      <code className="bg-slate-50 dark:bg-slate-800 px-1 rounded">
                        maxVel = 125 * 0.8 = 100 RPS
                      </code>
                    </li>
                  </ul>
                </div>

                <div>
                  <h5 className="font-semibold text-[var(--foreground)] mb-2">
                    2. Set Motion Magic Parameters:
                  </h5>
                  <ul className="text-sm text-[var(--foreground)] space-y-2 list-disc list-inside">
                    <li>
                      <strong>Target Velocity:</strong> Use calculated max
                      velocity (for a flywheel, the setpoint IS the target
                      speed; there&apos;s no separate cruise phase)
                    </li>
                    <li>
                      <code className="bg-slate-50 dark:bg-slate-800 px-1 rounded">
                        targetVel = 80.0; // comfortably under that ceiling
                      </code>
                    </li>
                    <li>
                      <strong>Acceleration:</strong> Start with 2x target
                      velocity for smooth spin-up
                    </li>
                    <li>
                      <strong>Competition:</strong> Typically end up with 4x to
                      10x cruise velocity
                    </li>
                    <li>
                      <code className="bg-slate-50 dark:bg-slate-800 px-1 rounded">
                        acceleration = cruiseVel * 2.0; // smooth start
                      </code>
                    </li>
                  </ul>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-[var(--muted)] p-4 rounded mt-4 border-l-4 border-[var(--border)]">
            <h4 className="font-semibold text-[var(--foreground)] mb-2">
              Why This Method Works:
            </h4>
            <p className="text-[var(--foreground)] text-sm">
              Calculating cruise velocity from motor specs and efficiency gives
              you motion limits the mechanism can actually hit, so the profile
              stays smooth instead of oscillating. Start with 2x acceleration
              for smooth motion; competition robots often end up at 4x to 10x
              cruise velocity for faster response.
            </p>
          </div>
        </CollapsibleSection>

        {/* Motion Magic Tuning Video */}
        <section className="flex flex-col gap-6">
          <h3 className="text-2xl font-bold text-slate-900 dark:text-slate-100">
            Motion Magic Tuning Tutorial
          </h3>
          <div className="bg-[var(--muted)] rounded-lg p-6 border-l-4 border-[var(--border)]">
            <p className="text-[var(--foreground)] mb-4">
              This video walks through Motion Magic tuning and how to pick each
              parameter:
            </p>
            <div className="aspect-video rounded-lg overflow-hidden">
              <iframe
                src="https://www.youtube.com/embed/7I7r9p1RBZI"
                title="Motion Magic Tuning Tutorial"
                className="w-full h-full"
                allowFullScreen
              />
            </div>
          </div>
        </section>
      </section>

      {/* Code Implementation */}
      <section className="flex flex-col gap-8">
        <h2 className="text-3xl font-bold text-slate-900 dark:text-slate-100">
          Motion Magic Implementation in Code
        </h2>

        <CollapsibleSection title="Motion Magic Configuration Example">
          <CodeBlock
            language="java"
            title="Motion Magic Setup — just the new lines"
            code={`public Arm() {
    TalonFXConfiguration config = new TalonFXConfiguration();

    // ... same PID + feedforward gains as the PID lesson (kP/kI/kD, kS/kG/kV/kA).

    // The Motion Magic part — three numbers that shape the velocity profile.
    MotionMagicConfigs motionMagic = config.MotionMagic;
    motionMagic.MotionMagicCruiseVelocity = 2.0;    // 2 rot/s max velocity
    motionMagic.MotionMagicAcceleration   = 8.0;    // 8 rot/s² acceleration
    motionMagic.MotionMagicJerk           = 80.0;   // 80 rot/s³ jerk limit

    motor.getConfigurator().apply(config);
}

// Then in your setter, use MotionMagicVoltage instead of PositionVoltage:
motor.setControl(motionMagicRequest.withPosition(positionRotations));`}
          />
        </CollapsibleSection>

        {/* Mechanism Implementation Tabs */}
        <MechanismTabs
          sectionTitle="Workshop Implementation: Motion Magic"
          armContent={{
            beforeItems: [
              "• PID position control with PositionVoltage",
              "• Instant acceleration to target",
              "• Potential mechanical stress from jerky movements",
              "• No velocity planning or profiling",
              "• Abrupt start/stop motions",
            ],
            afterItems: [
              "• Motion Magic profiled motion with MotionMagicVoltage",
              "• Smooth acceleration and deceleration curves",
              "• Reduced mechanical stress and wear",
              "• Configurable cruise velocity and acceleration",
              "• Smooth, predictable motion profiles",
            ],
            repository: "Hemlock5712/Workshop-Code",
            filePath: "src/main/java/frc/robot/subsystems/Arm.java",
            branch: "4-MotionMagic",
            pullRequestNumber: 4,
            focusFile: "Arm.java",
            walkthrough: {
              leftTitle: "Motion Magic Example Params for 25:1 Arm",
              leftItems: [
                "• <strong>25:1 Gearing:</strong> The Kraken X44 runs ~125 RPS, so 5 RPS theoretical max at output",
                "• <strong>Cruise Velocity (2.0):</strong> Conservative start: can reach 5 RPS but load may reduce performance",
                "• <strong>Acceleration (8.0):</strong> How quickly to reach cruise speed",
                "• <strong>Jerk (80.0):</strong> Smoothness of acceleration changes",
                "• <strong>MotionMagicVoltage:</strong> Replaces PositionVoltage for profiled control",
              ],
              rightTitle: "Enhanced Features",
              rightItems: [
                "• <strong>Setpoint Detection:</strong> Checks both position AND velocity",
                "• <strong>Smooth Motion:</strong> Eliminates jerky arm movements",
                "• <strong>Mechanical Safety:</strong> Reduces stress on gearboxes",
                "• <strong>Predictable Timing:</strong> Known motion duration",
              ],
            },
            nextStepText:
              "The arm now follows a smooth, profiled path to each target. Next, we cover tuning methods to get the best performance out of these controllers.",
          }}
          flywheelContent={{
            beforeItems: [
              "• PID velocity control with VelocityVoltage",
              "• Instant acceleration to target speed",
              "• Potential mechanical stress from sudden velocity changes",
              "• No velocity planning or profiling",
              "• Abrupt start/stop motions",
            ],
            afterItems: [
              "• Motion Magic profiled velocity with MotionMagicVelocityVoltage",
              "• Smooth acceleration and deceleration curves",
              "• Reduced mechanical stress and wear",
              "• Configurable acceleration and jerk for velocity changes",
              "• Smooth, predictable velocity transitions",
            ],
            repository: "Hemlock5712/Workshop-Code",
            filePath: "src/main/java/frc/robot/subsystems/Flywheel.java",
            branch: "4-MotionMagic",
            pullRequestNumber: 4,
            focusFile: "Flywheel.java",
            walkthrough: {
              leftTitle: "Motion Magic Parameters",
              leftItems: [
                "• <strong>Acceleration:</strong> How quickly to reach target velocity",
                "• <strong>Jerk:</strong> Smoothness of acceleration changes",
                "• <strong>MotionMagicVelocityVoltage:</strong> Replaces VelocityVoltage for profiled control",
                "• <strong>Velocity Targeting:</strong> Precise speed control with smooth ramping",
              ],
              rightTitle: "Enhanced Features",
              rightItems: [
                "• <strong>Setpoint Detection:</strong> Checks both velocity AND acceleration",
                "• <strong>Smooth Motion:</strong> Eliminates sudden flywheel speed changes",
                "• <strong>Mechanical Safety:</strong> Reduces stress on motors and mechanisms",
                "• <strong>Predictable Timing:</strong> Known velocity change duration",
              ],
            },
            nextStepText:
              "The flywheel now ramps smoothly between target speeds. Next, we cover tuning methods to get the best performance out of the flywheel controller.",
          }}
        />

        {/* Motion Magic vs PID Comparison */}
        <CollapsibleSection title="Motion Magic vs Basic PID" variant="warning">
          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <h4 className="font-semibold text-[var(--foreground)] mb-2">
                When to Use Basic PID:
              </h4>
              <ul className="text-sm text-[var(--foreground)] space-y-1 list-disc list-inside">
                <li>Simple positioning tasks</li>
                <li>Continuous control (like maintaining angle)</li>
                <li>When speed of response is critical</li>
                <li>Mechanisms with very low inertia</li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold text-[var(--foreground)] mb-2">
                When to Use Motion Magic:
              </h4>
              <ul className="text-sm text-[var(--foreground)] space-y-1 list-disc list-inside">
                <li>Large, heavy mechanisms (arms, elevators)</li>
                <li>When smooth motion is important</li>
                <li>Preventing mechanical stress</li>
                <li>Predictable motion timing needed</li>
              </ul>
            </div>
          </div>
        </CollapsibleSection>
      </section>

      {/* Quiz Section */}
      <section className="flex flex-col gap-8">
        <AlphaStatusNote />

        <Quiz
          title="Knowledge Check"
          questions={[
            {
              id: 1,
              question:
                "What is the primary benefit of Motion Magic over basic PID control?",
              options: [
                "It uses less battery power",
                "It adds smooth acceleration and deceleration profiles",
                "It eliminates the need for feedforward gains",
                "It makes motors run faster",
              ],
              correctAnswer: 1,
              explanation:
                "Motion Magic builds on PID by adding smooth acceleration and deceleration profiles, preventing jerky movements and reducing mechanical stress while maintaining precise positioning.",
            },
            {
              id: 2,
              question:
                "What are the three phases of a Motion Magic trapezoidal velocity profile?",
              options: [
                "Start, middle, end",
                "Acceleration, cruise, deceleration",
                "Ramp up, hold, ramp down",
                "Fast, slow, stop",
              ],
              correctAnswer: 1,
              explanation:
                "Motion Magic creates a trapezoidal profile with three phases: acceleration (ramp up to cruise velocity), cruise (maintain constant max velocity), and deceleration (smoothly brake to target).",
            },
            {
              id: 3,
              question:
                "What does Motion Magic Cruise Velocity parameter control?",
              options: [
                "The minimum velocity the mechanism can achieve",
                "The maximum velocity during the cruise phase",
                "The rate of acceleration",
                "The total time to reach the target",
              ],
              correctAnswer: 1,
              explanation:
                "Motion Magic Cruise Velocity sets the maximum velocity maintained during the cruise phase of the motion profile, measured in rotations per second.",
            },
            {
              id: 4,
              question:
                "For a mechanism with 25:1 gearing and a Kraken X44 (about 125 RPS max), what would be the calculated cruise-velocity ceiling at 80% efficiency?",
              options: ["125 RPS", "25 RPS", "4.0 RPS", "0.8 RPS"],
              correctAnswer: 2,
              explanation:
                "With 25:1 gearing, the output is 125 RPS / 25 = 5 RPS theoretical max. At 80% efficiency, this gives 5 * 0.8 = 4.0 RPS. That's the calculated ceiling. The workshop's example code starts even lower (2.0) and tunes up from there.",
            },
            {
              id: 5,
              question:
                "What is the recommended starting value for Motion Magic acceleration?",
              options: [
                "Equal to cruise velocity",
                "2x–4x cruise velocity for smooth motion",
                "10x cruise velocity for fastest response",
                "Half of cruise velocity for safety",
              ],
              correctAnswer: 1,
              explanation:
                "Starting around 2x–4x cruise velocity gives smooth motion (the workshop example uses 4x). During competition tuning, teams typically increase this to 4x to 10x cruise velocity for faster response.",
            },
            {
              id: 6,
              question:
                "When should you use Motion Magic instead of basic PID?",
              options: [
                "For continuous angle control like maintaining heading",
                "For large, heavy mechanisms requiring smooth motion",
                "When speed of response is more important than smoothness",
                "For mechanisms with very low inertia",
              ],
              correctAnswer: 1,
              explanation:
                "Motion Magic is ideal for large, heavy mechanisms (arms, elevators) where smooth motion is important, preventing mechanical stress and providing predictable motion timing.",
            },
          ]}
        />
      </section>
    </PageTemplate>
  );
}
