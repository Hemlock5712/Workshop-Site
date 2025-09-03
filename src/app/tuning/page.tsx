"use client";

import PageTemplate from "@/components/PageTemplate";
import Image from "next/image";
import GithubPageWithPR from "@/components/GithubPageWithPR";

export default function Tuning() {
  return (
    <PageTemplate
      title="Tuning Real Mechanisms"
      previousPage={{ href: "/control-systems", title: "Control Systems" }}
    >
      <div className="bg-white dark:bg-gray-900 rounded-lg p-8 shadow-lg border border-gray-200 dark:border-gray-800">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-4">
          How to Tune Feedforward and PID
        </h2>
        <p className="text-gray-600 dark:text-gray-300 mb-6">
          There are many recommended ways to tune PID, including fancy formulas
          and tests. However, we have always found it best to manually tune.
        </p>

        <div className="bg-blue-50 dark:bg-blue-950/30 p-6 rounded-lg mb-6">
          <h3 className="text-lg font-semibold text-blue-900 dark:text-blue-300 mb-3">
            Tuner X Benefits
          </h3>
          <p className="text-blue-800 dark:text-blue-300 mb-3">
            CTRE&apos;s Tuner X allows you to control a motor directly. You can
            set and change voltage, PID, FF, and MotionMagic values without
            deploying code!
          </p>
          <div className="bg-white dark:bg-gray-900 p-4 rounded border border-gray-200 dark:border-gray-800">
            <h4 className="font-semibold text-gray-900 dark:text-gray-100 mb-2">
              Why Use On-Motor Controllers?
            </h4>
            <ul className="text-gray-700 dark:text-gray-300 space-y-1 text-sm">
              <li>• Runs at 1000Hz vs 50Hz</li>
              <li>• Set and Forget operation</li>
              <li>• Advanced Motion Magic for smoother, consistent movement</li>
            </ul>
          </div>
        </div>

        <div className="bg-green-50 dark:bg-green-950/30 p-6 rounded-lg">
          <h3 className="text-lg font-semibold text-green-900 dark:text-green-300 mb-3">
            Motion Magic Advantages
          </h3>
          <p className="text-green-800 dark:text-green-300">
            Profiled controllers enable you to limit and set realistic maximum
            velocities and accelerations. This makes movements repeatable and
            smoother by following realistic targets and allowing feedforward
            control.
          </p>
        </div>
      </div>

      <section className="flex flex-col gap-8">
        <h2 className="text-3xl font-bold text-gray-900 dark:text-gray-100">
          Code Evolution: From Basic to Advanced
        </h2>

        <article className="flex flex-col gap-8 bg-white dark:bg-gray-900 rounded-lg p-8 shadow-lg border border-gray-200 dark:border-gray-800">
          <h2 className="text-3xl font-bold text-gray-900 dark:text-gray-100">
            Verifying Encoder Setup
          </h2>

          <div className="grid grid-cols-3 gap-4">
            <p className="col-span-2">You&apos;ll need to make sure your encoder is configured correctly. With the device facing you like the following image, ensure that the encoder position is going up as you rotate the arm counterclockwise.</p>

            <div className="flex w-full">
              <Image src="/images/mechanisms/arm.jpg" alt="Arm" width={300} height={200} className="rounded-lg" />
            </div>
          </div>

          <iframe
            src="https://www.youtube.com/embed/zJgSQKrz8yE"
            title="Encoder Setup"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
            className="w-full h-full aspect-video rounded-lg"
          />
        </article>

        <div className="bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-950/30 dark:to-purple-950/30 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-3">
            🎯 Workshop Journey Complete
          </h3>
          <p className="text-gray-700 dark:text-gray-300">
            Explore the final Arm implementation and see exactly how we
            transformed basic voltage control into sophisticated position
            control with PID, feedforward, and Motion Magic.
          </p>
        </div>

        <div className="bg-orange-50 dark:bg-orange-950/30 border border-orange-200 dark:border-orange-900 rounded-lg p-6 mb-6">
          <h3 className="text-xl font-bold text-orange-900 dark:text-orange-300 mb-4">
            🚀 Step 4: Motion Magic (PR #4)
          </h3>
          <p className="text-orange-800 dark:text-orange-300 mb-4">
            Upgrade from basic PID to Motion Magic for smooth, profiled movements with controlled acceleration and velocity.
          </p>
          
          <div className="grid md:grid-cols-2 gap-4 mb-4">
            <div className="bg-white dark:bg-gray-900 rounded-lg p-4">
              <h4 className="font-semibold text-gray-900 dark:text-gray-100 mb-2">Motion Magic Benefits:</h4>
              <ul className="text-sm text-gray-600 dark:text-gray-300 space-y-1">
                <li>• <strong>Smooth Acceleration:</strong> No jerky movements</li>
                <li>• <strong>Velocity Limits:</strong> Controlled maximum speed</li>
                <li>• <strong>Predictable Motion:</strong> Consistent timing</li>
                <li>• <strong>Reduced Wear:</strong> Gentler on mechanisms</li>
              </ul>
            </div>

            <div className="bg-white dark:bg-gray-900 rounded-lg p-4">
              <h4 className="font-semibold text-gray-900 dark:text-gray-100 mb-2">Implementation Changes:</h4>
              <ul className="text-sm text-gray-600 dark:text-gray-300 space-y-1">
                <li>• <strong>MotionMagicVoltage:</strong> Replace PositionVoltage</li>
                <li>• <strong>Cruise Velocity:</strong> Max speed setting</li>
                <li>• <strong>Acceleration:</strong> Rate of speed change</li>
                <li>• <strong>Jerk:</strong> Rate of acceleration change</li>
              </ul>
            </div>
          </div>

          <div className="bg-indigo-50 dark:bg-indigo-950/30 p-3 rounded">
            <p className="text-indigo-800 dark:text-indigo-300 text-sm">
              <strong>Key Learning:</strong> Motion Magic creates professional-quality movement profiles. 
              This is what separates amateur robots from championship-level performance.
            </p>
          </div>
        </div>

        <div className="bg-teal-50 dark:bg-teal-950/30 border border-teal-200 dark:border-teal-900 rounded-lg p-6 mb-6">
          <h3 className="text-xl font-bold text-teal-900 dark:text-teal-300 mb-4">
            🔧 Step 5: Useful Subsystem Functions (PR #5)
          </h3>
          <p className="text-teal-800 dark:text-teal-300 mb-4">
            Add practical utility functions that make the subsystem easier to use and more robust in competition.
          </p>
          
          <div className="grid md:grid-cols-3 gap-4 mb-4">
            <div className="bg-white dark:bg-gray-900 rounded-lg p-4">
              <h4 className="font-semibold text-gray-900 dark:text-gray-100 mb-2">Safety Features:</h4>
              <ul className="text-sm text-gray-600 dark:text-gray-300 space-y-1">
                <li>• Soft limits</li>
                <li>• Emergency stops</li>
                <li>• Position bounds</li>
              </ul>
            </div>

            <div className="bg-white dark:bg-gray-900 rounded-lg p-4">
              <h4 className="font-semibold text-gray-900 dark:text-gray-100 mb-2">Utility Methods:</h4>
              <ul className="text-sm text-gray-600 dark:text-gray-300 space-y-1">
                <li>• Position presets</li>
                <li>• Calibration routines</li>
                <li>• Status reporting</li>
              </ul>
            </div>

            <div className="bg-white dark:bg-gray-900 rounded-lg p-4">
              <h4 className="font-semibold text-gray-900 dark:text-gray-100 mb-2">Diagnostics:</h4>
              <ul className="text-sm text-gray-600 dark:text-gray-300 space-y-1">
                <li>• Health monitoring</li>
                <li>• Performance metrics</li>
                <li>• Error detection</li>
              </ul>
            </div>
          </div>

          <div className="bg-cyan-50 dark:bg-cyan-950/30 p-3 rounded">
            <p className="text-cyan-800 dark:text-cyan-300 text-sm">
              <strong>Key Learning:</strong> These utility functions transform a basic subsystem into a 
              competition-ready component with safety, reliability, and ease of use.
            </p>
          </div>
        </div>

        <GithubPageWithPR repository="Hemlock5712/Workshop-Code" filePath="src/main/java/frc/robot/subsystems/Arm.java" branch="3-PID" pullRequestNumber={3} focusFile="Arm.java" />
      </section>
    </PageTemplate>
  );
}
