import PageTemplate from "@/components/PageTemplate";
import ImageBlock from "@/components/ImageBlock";

export default function MechanismSetup() {
  return (
    <PageTemplate
      title="Mechanism Setup"
      previousPage={{ href: "/running-program", title: "Running Program" }}
      nextPage={{ href: "/pid-control", title: "PID Control" }}
    >
      {/* Introduction */}
        <div className="bg-[var(--card)] text-[var(--foreground)] rounded-lg p-8 border border-[var(--border)]">
          <h2 className="text-3xl font-bold text-slate-900 dark:text-slate-100 mb-4">Verifying Your Mechanism Setup</h2>
          <p className="text-[var(--muted-foreground)] mb-4">
            Before implementing advanced control algorithms, we need to verify that motors and encoders are working correctly.
            This ensures proper direction, zeroing, and basic functionality.
          </p>
        <div className="bg-learn-100 dark:bg-learn-900/30 p-4 rounded-lg">
          <p className="text-learn-800 dark:text-learn-300 font-medium">
            🎯 Key Concept: Always verify hardware setup before adding control algorithms - this prevents debugging control issues when the problem is hardware configuration
          </p>
        </div>
      </div>

      {/* Encoder Verification */}
      <section className="flex flex-col gap-8">
          <h2 className="text-3xl font-bold text-slate-900 dark:text-slate-100">
          Encoder Direction and Zeroing
        </h2>

        <div className="card p-8">
          <h3 className="text-2xl font-bold text-[var(--foreground)] mb-6">
            Verifying Encoder Setup
          </h3>

          <div className="grid grid-cols-3 gap-6 mb-8">
            <div className="col-span-2">
                <p className="text-[var(--muted-foreground)] mb-4">
                You&apos;ll need to make sure your encoder is configured correctly. With the device facing you like the following image, 
                ensure that the encoder position is going up as you rotate the arm counterclockwise.
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

      {/* Motor Setup Verification */}
      <div className="card p-8">
        <h3 className="text-2xl font-bold text-[var(--foreground)] mb-6">
          Verifying Motor Setup
        </h3>

        <div className="grid grid-cols-3 gap-6 mb-8">
          <p className="col-span-2 text-[var(--muted-foreground)]">
            You&apos;ll want to make sure your motor is spinning in the expected direction. If the motor is getting positive voltage, it should be spinning counterclockwise. You can check this through tuner, with the device facing you like the following picture.
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
      </div>

      {/* Motor Direction Verification */}
      <div className="card p-8">
        <h3 className="text-xl font-bold text-learn-600 mb-4">🔧 Motor Direction Verification</h3>
          
          <div className="grid md:grid-cols-2 gap-6">
            <div className="bg-[var(--card)] text-[var(--foreground)] p-6 rounded-lg">
              <h4 className="font-semibold mb-3">Positive Voltage Test</h4>
              <p className="text-sm mb-3">Apply +6V to your motor and observe movement direction.</p>
              <div className="bg-[var(--muted)] text-[var(--muted-foreground)] p-3 rounded border border-[var(--border)]">
                <p className="text-xs text-[var(--muted-foreground)]">
                  <strong>Expected:</strong> Positive voltage should move the mechanism in the &quot;positive&quot; direction (counter-clockwise for arms, out for extensions, and up for elevators).
                </p>
              </div>
            </div>

            <div className="bg-[var(--card)] text-[var(--foreground)] p-6 rounded-lg">
              <h4 className="font-semibold mb-3">Encoder Consistency</h4>
              <p className="text-sm mb-3">Verify encoder readings match motor movement.</p>
              <div className="bg-[var(--muted)] text-[var(--muted-foreground)] p-3 rounded border border-[var(--border)]">
                <p className="text-xs text-[var(--muted-foreground)]">
                  <strong>Expected:</strong> Positive motor voltage → positive encoder change, negative motor voltage → negative encoder change.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Zero Encoder Setup */}
        <div className="bg-[var(--card)] text-[var(--foreground)] border border-[var(--border)] rounded-lg p-6">
          <h3 className="text-xl font-bold mb-4">🎯 Zero Encoder Position</h3>

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

          {/* Next Step */}
        <div className="bg-[var(--muted)] border border-[var(--border)] rounded-lg p-6">
          <h3 className="text-xl font-bold text-[var(--foreground)] mb-4">✅ Ready for Control</h3>
          <p className="text-[var(--muted-foreground)] mb-4">
            Once your mechanism moves in the correct direction and encoders provide accurate feedback, you&apos;re ready to implement advanced control algorithms.
          </p>
            <div className="bg-indigo-50 dark:bg-indigo-950/30 p-4 rounded mt-4">
              <p className="text-indigo-800 dark:text-indigo-300 text-sm">
                <strong>💡 Next Step:</strong> With verified hardware setup, we can now implement PID control for precise positioning.
                The control algorithm will use the encoder feedback to automatically reach target positions.
              </p>
            </div>
        </div>
      </section>
    </PageTemplate>
  );
}
