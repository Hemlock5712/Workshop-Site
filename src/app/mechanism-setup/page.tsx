import PageTemplate from "@/components/PageTemplate";
import Image from "next/image";

export default function MechanismSetup() {
  return (
    <PageTemplate
      title="Mechanism Setup"
      previousPage={{ href: "/adding-commands", title: "Adding Commands" }}
      nextPage={{ href: "/pid-control", title: "PID Control" }}
    >
      {/* Introduction */}
      <div className="bg-gradient-to-r from-orange-50 to-red-50 dark:from-orange-950/30 dark:to-red-950/30 rounded-lg p-8 border border-gray-200 dark:border-gray-800">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-4">
          Verifying Your Mechanism Setup
        </h2>
        <p className="text-gray-600 dark:text-gray-300 mb-4">
          Before implementing advanced control algorithms, we need to verify that motors and encoders are working correctly. 
          This ensures proper direction, zeroing, and basic functionality.
        </p>
        <div className="bg-orange-100 dark:bg-orange-900/30 p-4 rounded-lg">
          <p className="text-orange-800 dark:text-orange-300 font-medium">
            🔍 Key Concept: Always verify hardware setup before adding control algorithms - this prevents debugging control issues when the problem is hardware configuration
          </p>
        </div>
      </div>

      {/* Encoder Verification */}
      <section className="flex flex-col gap-8">
        <h2 className="text-3xl font-bold text-gray-900 dark:text-gray-100">
          Encoder Direction and Zeroing
        </h2>

        <div className="bg-white dark:bg-gray-900 rounded-lg p-8 shadow-lg border border-gray-200 dark:border-gray-800">
          <h3 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-6">
            Verifying Encoder Setup
          </h3>

          <div className="grid grid-cols-3 gap-6 mb-8">
            <div className="col-span-2">
              <p className="text-gray-600 dark:text-gray-300 mb-4">
                You&apos;ll need to make sure your encoder is configured correctly. With the device facing you like the following image, 
                ensure that the encoder position is going up as you rotate the arm counterclockwise.
              </p>
              
              <div className="bg-blue-50 dark:bg-blue-950/30 p-4 rounded-lg">
                <h4 className="font-semibold text-blue-900 dark:text-blue-300 mb-2">Expected Behavior:</h4>
                <ul className="text-blue-800 dark:text-blue-300 space-y-1 text-sm">
                  <li>• Counterclockwise rotation → Position increases</li>
                  <li>• Clockwise rotation → Position decreases</li>
                  <li>• Position values should be smooth and consistent</li>
                  <li>• No sudden jumps or erratic readings</li>
                </ul>
              </div>
            </div>

            <div className="flex w-full justify-center">
              <Image src="/images/mechanisms/arm.jpg" alt="Arm mechanism for encoder verification" width={300} height={200} className="rounded-lg" />
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

        {/* Motor Direction Verification */}
        <div className="bg-white dark:bg-gray-900 rounded-lg p-8 shadow-lg border border-gray-200 dark:border-gray-800">
          <h3 className="text-xl font-bold text-green-600 mb-4">🔧 Motor Direction Verification</h3>
          
          <div className="grid md:grid-cols-2 gap-6">
            <div className="bg-green-50 dark:bg-green-950/30 p-6 rounded-lg">
              <h4 className="font-semibold text-green-900 dark:text-green-300 mb-3">Positive Voltage Test</h4>
              <p className="text-green-800 dark:text-green-300 text-sm mb-3">
                Apply +6V to your motor and observe movement direction.
              </p>
              <div className="bg-white dark:bg-gray-900 p-3 rounded border">
                <p className="text-xs text-gray-700 dark:text-gray-300">
                  <strong>Expected:</strong> Positive voltage should move the mechanism in the &quot;positive&quot; direction (typically up for arms, out for extensions).
                </p>
              </div>
            </div>

            <div className="bg-yellow-50 dark:bg-yellow-950/30 p-6 rounded-lg">
              <h4 className="font-semibold text-yellow-900 dark:text-yellow-300 mb-3">Encoder Consistency</h4>
              <p className="text-yellow-800 dark:text-yellow-300 text-sm mb-3">
                Verify encoder readings match motor movement.
              </p>
              <div className="bg-white dark:bg-gray-900 p-3 rounded border">
                <p className="text-xs text-gray-700 dark:text-gray-300">
                  <strong>Expected:</strong> Positive motor voltage → positive encoder change, negative motor voltage → negative encoder change.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Troubleshooting */}
        <div className="bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-900 rounded-lg p-6">
          <h3 className="text-xl font-bold text-red-700 dark:text-red-300 mb-4">🚨 Common Issues & Solutions</h3>
          
          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <h4 className="font-semibold text-red-800 dark:text-red-200 mb-2">Encoder Reading Wrong Direction:</h4>
              <ul className="text-red-700 dark:text-red-300 space-y-1 text-sm list-disc list-inside">
                <li>Check encoder wiring connections</li>
                <li>Verify encoder is reading from correct motor</li>
                <li>Consider inverting encoder in software if needed</li>
                <li>Ensure encoder is mechanically coupled correctly</li>
              </ul>
            </div>
            
            <div>
              <h4 className="font-semibold text-red-800 dark:text-red-200 mb-2">Motor Moving Wrong Direction:</h4>
              <ul className="text-red-700 dark:text-red-300 space-y-1 text-sm list-disc list-inside">
                <li>Check motor wiring (swap +/- if needed)</li>
                <li>Verify correct motor controller configuration</li>
                <li>Use motor inversion in software if wiring is correct</li>
                <li>Check CAN ID matches configuration</li>
              </ul>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-900 p-4 rounded mt-4">
            <p className="text-red-800 dark:text-red-300 text-sm">
              <strong>💡 Pro Tip:</strong> Always test basic motor movement and encoder reading before implementing any control algorithms. 
              This saves hours of debugging later when you can&apos;t tell if the issue is your control code or hardware setup.
            </p>
          </div>
        </div>

        {/* Next Steps */}
        <div className="bg-indigo-50 dark:bg-indigo-950/30 border border-indigo-200 dark:border-indigo-900 rounded-lg p-6">
          <h3 className="text-xl font-bold text-indigo-700 dark:text-indigo-300 mb-4">✅ Ready for Control</h3>
          <p className="text-indigo-800 dark:text-indigo-300 mb-4">
            Once your mechanism moves in the correct direction and encoders provide accurate feedback, you&apos;re ready to implement advanced control algorithms.
          </p>
          <div className="bg-indigo-100 dark:bg-indigo-900/30 p-4 rounded">
            <p className="text-indigo-800 dark:text-indigo-300 text-sm">
              <strong>🚀 Next Step:</strong> With verified hardware setup, we can now implement PID control for precise positioning. 
              The control algorithm will use the encoder feedback to automatically reach target positions.
            </p>
          </div>
        </div>
      </section>
    </PageTemplate>
  );
}