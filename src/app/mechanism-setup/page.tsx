"use client";

import { useState } from "react";
import PageTemplate from "@/components/PageTemplate";
import ImageBlock from "@/components/ImageBlock";

export default function MechanismSetup() {
  const [activeTab, setActiveTab] = useState<"arm" | "flywheel">("arm");

  return (
    <PageTemplate
      title="Mechanism Setup"
      previousPage={{ href: "/running-program", title: "Running Program" }}
      nextPage={{ href: "/pid-control", title: "PID Control" }}
    >
      {/* Introduction */}
      <div className="bg-focus-50 dark:bg-focus-900/20 text-[var(--foreground)] rounded-lg p-8 border border-focus-200 dark:border-focus-800">
        <h2 className="text-3xl font-bold text-slate-900 dark:text-slate-100 mb-4">Mechanism Setup - Verifying Hardware Configuration</h2>
        <p className="text-[var(--muted-foreground)] mb-4">
          Before implementing advanced control algorithms, we need to verify that motors and encoders are working correctly.
          This ensures proper direction, zeroing, and basic functionality.
        </p>
        <div className="bg-learn-100 dark:bg-learn-900/30 p-4 rounded-lg">
          <p className="text-learn-800 dark:text-learn-300 font-medium">
            🎯 Key Concept: Always verify hardware setup before adding control algorithms. Otherwise you will be debugging control issues when the problem is hardware configuration.
          </p>
        </div>
      </div>

      {/* Mechanism-Specific Setup Steps */}
      <section className="flex flex-col gap-8">
        <h2 className="text-3xl font-bold text-slate-900 dark:text-slate-100">
          Setup Steps by Mechanism
        </h2>

        {/* Tab Navigation */}
        <div className="card">
          <div className="border-b border-[var(--border)]">
            <div className="flex">
              <button
                onClick={() => setActiveTab("arm")}
                className={`px-6 py-3 text-sm font-medium border-b-2 ${
                  activeTab === "arm"
                    ? "border-primary-600 text-primary-600"
                    : "border-transparent text-[var(--muted-foreground)] hover:text-[var(--foreground)]"
                }`}
              >
                🦾 Arm Mechanism
              </button>
              <button
                onClick={() => setActiveTab("flywheel")}
                className={`px-6 py-3 text-sm font-medium border-b-2 ${
                  activeTab === "flywheel"
                    ? "border-primary-600 text-primary-600"
                    : "border-transparent text-[var(--muted-foreground)] hover:text-[var(--foreground)]"
                }`}
              >
                ⚡ Flywheel Mechanism
              </button>
            </div>
          </div>

          {/* Tab Content */}
          <div className="p-6">
            {activeTab === "arm" ? (
              <div className="flex flex-col gap-8">
                {/* Step 1: Encoder Direction */}
                <div className="card p-8">
                  <h3 className="text-2xl font-bold text-[var(--foreground)] mb-6">
                    1️⃣ Encoder Direction
                  </h3>

                  <div className="grid grid-cols-3 gap-6 mb-8">
                    <div className="col-span-2">
                      <p className="text-[var(--muted-foreground)] mb-4">
                        You&apos;ll need to make sure your encoder is configured correctly. With the device facing you, as shown in the following picture, please make sure that  
                        the encoder position increases as you rotate the arm counterclockwise.
                      </p>
                      
                      <div className="bg-primary-50 dark:bg-primary-950/30 p-4 rounded-lg">
                        <h4 className="font-semibold text-primary-900 dark:text-primary-300 mb-2">Expected Behavior:</h4>
                        <ul className="text-primary-800 dark:text-primary-300 space-y-1 text-sm">
                          <li>• Counterclockwise rotation → Position increases</li>
                          <li>• Clockwise rotation → Position decreases</li>
                          <li>• Position values should be smooth and consistent</li>
                        </ul>
                      </div>
                    </div>

                    <div className="flex w-full justify-center">
                      <ImageBlock
                        src="/images/mechanisms/arm.jpg"
                        alt="Arm mechanism for encoder verification"
                        width={300}
                        height={200}
                        className="rounded-lg"
                      />
                    </div>
                  </div>

                  <iframe
                    src="https://www.youtube.com/embed/zJgSQKrz8yE"
                    title="Encoder Setup and Verification"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                    className="w-full aspect-video rounded-lg"
                  />
                </div>

                {/* Step 2: Zero Encoder Position */}
                <div className="bg-[var(--card)] text-[var(--foreground)] border border-[var(--border)] rounded-lg p-6">
                  <h3 className="text-xl font-bold mb-4">2️⃣ 🎯 Zero Encoder Position</h3>

                  <div className="grid md:grid-cols-2 gap-6 mb-6">
                    <div>
                      <p className="mb-4">
                        Set your mechanism to the zero position before running any control algorithms. For Arm mechanisms,
                        zero should be straight parallel with the ground, facing the 3 o&apos;clock position.
                      </p>

                      <div className="bg-concept-100 dark:bg-concept-900/30 p-4 rounded-lg">
                        <h4 className="font-semibold text-concept-900 dark:text-concept-300 mb-2">Zero Position Setup:</h4>
                        <ul className="text-concept-800 dark:text-concept-300 space-y-1 text-sm">
                          <li>• Position Arm parallel to ground</li>
                          <li>• Arm should point to 3 o&apos;clock position</li>
                          <li>• Reset encoder to 0.0 at this position</li>
                          <li>• Verify position reading stays consistent</li>
                        </ul>
                      </div>
                    </div>

                    <div className="flex w-full justify-center">
                      <div className="w-full h-48 bg-concept-100 dark:bg-concept-900/50 rounded-lg flex items-center justify-center border border-concept-200 dark:border-concept-800">
                        <p className="text-concept-600 dark:text-concept-400 text-sm">Placeholder: Zero Position Image</p>
                      </div>
                    </div>
                  </div>

                  <div className="w-full h-64 bg-concept-100 dark:bg-concept-900/50 rounded-lg flex items-center justify-center border border-concept-200 dark:border-concept-800">
                    <p className="text-concept-600 dark:text-concept-400 text-sm">Placeholder: Zero Encoder Setup Video</p>
                  </div>
                </div>

                {/* Step 3: Verifying Motor Setup */}
                <div className="card p-8">
                  <h3 className="text-2xl font-bold text-[var(--foreground)] mb-6">
                    3️⃣ Verifying Motor Setup
                  </h3>

                  <div className="grid grid-cols-3 gap-6 mb-8">
                    <p className="col-span-2 text-[var(--muted-foreground)]">
                      You&apos;ll want to make sure your motor is spinning in the expected direction. If the motor is getting positive voltage, it should be spinning counterclockwise. You can check this through tuner, with the device facing you as in the following picture.
                    </p>

                    <div className="flex w-full justify-center">
                      <ImageBlock
                        src="/images/mechanisms/arm.jpg"
                        alt="Arm"
                        width={300}
                        height={200}
                        className="rounded-lg"
                      />
                    </div>
                  </div>

                  <iframe
                    src="https://www.youtube.com/embed/iQqR1Wxptzg"
                    title="Motor Testing"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                    className="w-full aspect-video rounded-lg"
                  />

                  {/* Motor Direction Verification */}
                  <div className="mt-8">
                    <h4 className="text-xl font-bold text-learn-600 mb-4">🔧 Motor Direction Verification</h4>
                      
                    <div className="grid md:grid-cols-2 gap-6">
                      <div className="bg-[var(--card)] text-[var(--foreground)] p-6 rounded-lg">
                        <h5 className="font-semibold mb-3">Positive Voltage Test</h5>
                        <p className="text-sm mb-3">Apply +6V to your motor and observe movement direction.</p>
                        <div className="bg-[var(--muted)] text-[var(--muted-foreground)] p-3 rounded border border-[var(--border)]">
                          <p className="text-xs text-[var(--muted-foreground)]">
                            <strong>Expected:</strong> Positive voltage should move the mechanism in the &quot;positive&quot; direction (counter-clockwise for arms).
                          </p>
                        </div>
                      </div>

                      <div className="bg-[var(--card)] text-[var(--foreground)] p-6 rounded-lg">
                        <h5 className="font-semibold mb-3">Encoder Consistency</h5>
                        <p className="text-sm mb-3">Verify encoder readings match motor movement.</p>
                        <div className="bg-[var(--muted)] text-[var(--muted-foreground)] p-3 rounded border border-[var(--border)]">
                          <p className="text-xs text-[var(--muted-foreground)]">
                            <strong>Expected:</strong> Positive motor voltage → positive encoder change, negative motor voltage → negative encoder change.
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <div className="flex flex-col gap-8">
                {/* Flywheel Only Step: Verifying Motor Setup */}
                <div className="card p-8">
                  <h3 className="text-2xl font-bold text-[var(--foreground)] mb-6">
                    1️⃣ Verifying Motor Setup
                  </h3>

                  <div className="grid grid-cols-3 gap-6 mb-8">
                    <div className="col-span-2">
                      <p className="text-[var(--muted-foreground)] mb-4">
                        You&apos;ll want to make sure your flywheel motors are spinning in the expected direction. If the motor is getting positive voltage, both motors should spin in the same direction (leader-follower setup). You can check this through tuner.
                      </p>
                      
                      <div className="bg-primary-50 dark:bg-primary-950/30 p-4 rounded-lg">
                        <h4 className="font-semibold text-primary-900 dark:text-primary-300 mb-2">Expected Behavior:</h4>
                        <ul className="text-primary-800 dark:text-primary-300 space-y-1 text-sm">
                          <li>• Leader and follower motors spin together</li>
                          <li>• Positive voltage → consistent rotation direction</li>
                          <li>• No unusual noise or vibration</li>
                          <li>• Smooth acceleration and deceleration</li>
                        </ul>
                      </div>
                    </div>

                    <div className="flex w-full justify-center">
                      <ImageBlock
                        src="/images/mechanisms/flywheel.png"
                        alt="Flywheel mechanism for motor verification"
                        width={300}
                        height={200}
                        className="rounded-lg"
                      />
                    </div>
                  </div>

                  <iframe
                    src="https://www.youtube.com/embed/iQqR1Wxptzg"
                    title="Motor Testing"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                    className="w-full aspect-video rounded-lg"
                  />

                  {/* Motor Direction Verification */}
                  <div className="mt-8">
                    <h4 className="text-xl font-bold text-learn-600 mb-4">🔧 Motor Direction Verification</h4>
                      
                    <div className="grid md:grid-cols-2 gap-6">
                      <div className="bg-[var(--card)] text-[var(--foreground)] p-6 rounded-lg">
                        <h5 className="font-semibold mb-3">Positive Voltage Test</h5>
                        <p className="text-sm mb-3">Apply +6V to your flywheel and observe rotation.</p>
                        <div className="bg-[var(--muted)] text-[var(--muted-foreground)] p-3 rounded border border-[var(--border)]">
                          <p className="text-xs text-[var(--muted-foreground)]">
                            <strong>Expected:</strong> Both motors should rotate smoothly in the same direction with consistent speed.
                          </p>
                        </div>
                      </div>

                      <div className="bg-[var(--card)] text-[var(--foreground)] p-6 rounded-lg">
                        <h5 className="font-semibold mb-3">Leader-Follower Check</h5>
                        <p className="text-sm mb-3">Verify follower motor tracks leader motor exactly.</p>
                        <div className="bg-[var(--muted)] text-[var(--muted-foreground)] p-3 rounded border border-[var(--border)]">
                          <p className="text-xs text-[var(--muted-foreground)]">
                            <strong>Expected:</strong> Follower motor should mirror leader motor movements with minimal lag.
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Next Step */}
      <div className="bg-[var(--muted)] border border-[var(--border)] rounded-lg p-6">
        <h3 className="text-xl font-bold text-[var(--foreground)] mb-4">✅ Ready for Control</h3>
        <p className="text-[var(--muted-foreground)] mb-4">
          Once your mechanism moves in the correct direction and provides accurate feedback (encoder for arms, motor consistency for flywheels), you&apos;re ready to implement advanced control algorithms.
        </p>
        <div className="bg-indigo-50 dark:bg-indigo-950/30 p-4 rounded mt-4">
          <p className="text-indigo-800 dark:text-indigo-300 text-sm">
            <strong>💡 Next Step:</strong> With verified hardware setup, we can now implement PID control for precise mechanism control.
            The control algorithm will use sensor feedback to automatically reach target positions or velocities.
          </p>
        </div>
      </div>
    </PageTemplate>
  );
}
