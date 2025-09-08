import PageTemplate from "@/components/PageTemplate";
import Link from "next/link";

export default function Introduction() {
  return (
    <PageTemplate title="Gray Matter Coding Workshop" previousPage={{ href: "/", title: "Home" }} nextPage={{ href: "/prerequisites", title: "Prerequisites" }}>
      <div className="bg-primary-50 dark:bg-primary-950/30 border-l-4 border-primary-400 dark:border-primary-900 p-6">
        <p className="text-lg font-medium text-primary-900 dark:text-primary-300 mb-2">Quick Note</p>
        <p className="text-primary-800 dark:text-primary-300">
          All underlined text and images of code or products will have built-in links to resources
        </p>
      </div>

      <section className="flex flex-col gap-8">
        <h2 className="text-3xl font-bold text-slate-900 dark:text-slate-100">🚀 Why are we here?</h2>
        
        <div className="space-y-6">
          <div className="border-l-4 border-orange-200 dark:border-orange-900 pl-4">
            <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100">
              Learn FRC&apos;s Best Programming Practices
            </h3>
            <p className="text-slate-600 dark:text-slate-300 mt-2">
              Master industry-standard coding patterns, command-based architecture, and proven development workflows that successful FRC teams use.
            </p>
          </div>

          <div className="border-l-4 border-green-200 dark:border-green-900 pl-4">
            <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100">
              Build Competition-Winning Robots
            </h3>
            <p className="text-slate-600 dark:text-slate-300 mt-2">
              Develop reliable, maintainable code that performs under pressure and helps your team succeed at regional and world championships.
            </p>
          </div>
        </div>
      </section>

      <section className="flex flex-col gap-8">
        <h2 className="text-3xl font-bold text-slate-900 dark:text-slate-100">🎯 Target Audience & Goals</h2>
        
        <div className="space-y-6">
          <div className="border-l-4 border-purple-200 dark:border-purple-900 pl-4">
            <h3 className="text-xl font-semibold text-slate-900 dark:text-slate-100 mb-3">
              Who This Workshop Is For
            </h3>
            <p className="text-lg text-slate-600 dark:text-slate-300 mb-4">
              This workshop is designed for FRC Teams using Java and CTRE Hardware.
            </p>
          </div>
          
          <div className="border-l-4 border-blue-200 dark:border-blue-900 pl-4">
            <h3 className="text-xl font-semibold text-slate-900 dark:text-slate-100 mb-3">
              What You&apos;ll Learn
            </h3>
            <div className="grid md:grid-cols-2 gap-4">
              <ul className="space-y-2 text-slate-600 dark:text-slate-300">
                <li>• Code architecture and best practices</li>
                <li>• Subsystems structure and organization</li>
                <li>• Command-based programming framework</li>
                <li>• PID tuning techniques</li>
              </ul>
              <ul className="space-y-2 text-slate-600 dark:text-slate-300">
                <li>• Libraries and framework usage</li>
                <li>• Hardware integration with CTRE devices</li>
                <li>• Motion profiling and control</li>
                <li>• Real-world competition implementation</li>
              </ul>
            </div>
          </div>
          
          <div className="border-l-4 border-amber-200 dark:border-amber-900 pl-4">
            <h3 className="text-xl font-semibold text-slate-900 dark:text-slate-100 mb-3">
              Our Mission
            </h3>
            <p className="text-lg text-slate-600 dark:text-slate-300">
              This site was put together by Team 5712 and help from others as a resource to help cover introduction to advanced materials and to give a clear learning and implementation plan.
              The goal is to learn code architecture, command base programming, PID tuning, libraries, odometry, vision, and more!
            </p>
          </div>
        </div>
      </section>

      <section className="flex flex-col gap-8">
        <h2 className="text-3xl font-bold text-slate-900 dark:text-slate-100">🧠 Workshop Expectations</h2>

        <div className="space-y-6">
          <div className="border-l-4 border-teal-200 dark:border-teal-900 pl-4">
            <h3 className="text-xl font-semibold text-slate-900 dark:text-slate-100 mb-3">
              Prerequisites
            </h3>
            <ul className="list-disc ml-4 text-slate-600 dark:text-slate-300 space-y-1">
              <li>Basic Java programming</li>
              <li>Familiarity with WPILib and command-based concepts</li>
              <li>Experience wiring and configuring CTRE hardware</li>
            </ul>
          </div>

          <div className="border-l-4 border-sky-200 dark:border-sky-900 pl-4">
            <h3 className="text-xl font-semibold text-slate-900 dark:text-slate-100 mb-3">
              Learning Path & Success Criteria
            </h3>
            <p className="text-lg text-slate-600 dark:text-slate-300 mb-4">
              Follow each section in order and check the success criteria to confirm your understanding.
              Completing every section earns you a certificate and digital badge.
            </p>
            <ul className="space-y-2 text-slate-600 dark:text-slate-300">
              <li><strong>Hardware Setup:</strong> Rio communicates with all devices.</li>
              <li><strong>Project Setup:</strong> Command-based project builds without errors.</li>
              <li><strong>Command-Based Framework:</strong> A sample command executes on the robot.</li>
              <li><strong>Building Subsystems:</strong> Subsystem methods control hardware as expected.</li>
              <li><strong>Adding Commands:</strong> Commands bind to joystick buttons successfully.</li>
              <li><strong>Running Program:</strong> Code deploys and driver station shows no faults.</li>
              <li><strong>Mechanism Setup:</strong> Mechanism responds to manual commands.</li>
              <li><strong>PID Control:</strong> Mechanism reaches setpoint smoothly.</li>
              <li><strong>Motion Magic:</strong> Motion profile completes within tolerance.</li>
            </ul>
          </div>

          <div className="border-l-4 border-indigo-200 dark:border-indigo-900 pl-4">
            <h3 className="text-xl font-semibold text-slate-900 dark:text-slate-100 mb-3">
              Completion Rewards
            </h3>
            <p className="text-lg text-slate-600 dark:text-slate-300">
              Finish the full learning path to receive a shareable certificate and badge that
              recognizes your achievement and can be added to team portfolios.
            </p>
          </div>
        </div>
      </section>

      <section className="flex flex-col gap-8">
        <h2 className="text-3xl font-bold text-slate-900 dark:text-slate-100">Choose Your Workshop</h2>

        <div className="grid md:grid-cols-2 gap-8">
          {/* Workshop #1 */}
          <div className="bg-slate-50 dark:bg-slate-900 rounded-lg p-8 shadow-lg border border-slate-200 dark:border-slate-800 hover:shadow-xl transition-shadow">
            <div className="flex items-center mb-4">
              <div className="w-12 h-12 bg-primary-600 rounded-lg flex items-center justify-center text-white font-bold text-xl mr-4">
                1
              </div>
              <h3 className="text-2xl font-bold text-slate-900 dark:text-slate-100">Workshop #1</h3>
            </div>

            <p className="text-slate-600 dark:text-slate-300 mb-6">
              Fundamentals of FRC programming with command-based framework, subsystems, and PID control.
            </p>

            <div className="space-y-3 mb-6">
              <Link
                href="/hardware"
                className="block p-3 bg-slate-100 dark:bg-slate-800 rounded-lg hover:bg-primary-100 dark:hover:bg-primary-950/30 transition-colors group"
              >
                <div className="flex items-center justify-between">
                  <span className="font-medium text-slate-700 dark:text-slate-300 group-hover:text-primary-700 dark:group-hover:text-primary-300">Hardware Setup</span>
                  <span className="text-slate-400 dark:text-slate-500 group-hover:text-primary-500 dark:group-hover:text-primary-300">→</span>
                </div>
              </Link>

              <Link
                href="/project-setup"
                className="block p-3 bg-slate-100 dark:bg-slate-800 rounded-lg hover:bg-primary-100 dark:hover:bg-primary-950/30 transition-colors group"
              >
                <div className="flex items-center justify-between">
                  <span className="font-medium text-slate-700 dark:text-slate-300 group-hover:text-primary-700 dark:group-hover:text-primary-300">Project Setup</span>
                  <span className="text-slate-400 dark:text-slate-500 group-hover:text-primary-500 dark:group-hover:text-primary-300">→</span>
                </div>
              </Link>

              <Link
                href="/command-framework"
                className="block p-3 bg-slate-100 dark:bg-slate-800 rounded-lg hover:bg-primary-100 dark:hover:bg-primary-950/30 transition-colors group"
              >
                <div className="flex items-center justify-between">
                  <span className="font-medium text-slate-700 dark:text-slate-300 group-hover:text-primary-700 dark:group-hover:text-primary-300">Command-Based Framework</span>
                  <span className="text-slate-400 dark:text-slate-500 group-hover:text-primary-500 dark:group-hover:text-primary-300">→</span>
                </div>
              </Link>

              <Link
                href="/building-subsystems"
                className="block p-3 bg-slate-100 dark:bg-slate-800 rounded-lg hover:bg-primary-100 dark:hover:bg-primary-950/30 transition-colors group"
              >
                <div className="flex items-center justify-between">
                  <span className="font-medium text-slate-700 dark:text-slate-300 group-hover:text-primary-700 dark:group-hover:text-primary-300">Building Subsystems</span>
                  <span className="text-slate-400 dark:text-slate-500 group-hover:text-primary-500 dark:group-hover:text-primary-300">→</span>
                </div>
              </Link>

              <Link
                href="/adding-commands"
                className="block p-3 bg-slate-100 dark:bg-slate-800 rounded-lg hover:bg-primary-100 dark:hover:bg-primary-950/30 transition-colors group"
              >
                <div className="flex items-center justify-between">
                  <span className="font-medium text-slate-700 dark:text-slate-300 group-hover:text-primary-700 dark:group-hover:text-primary-300">Adding Commands</span>
                  <span className="text-slate-400 dark:text-slate-500 group-hover:text-primary-500 dark:group-hover:text-primary-300">→</span>
                </div>
              </Link>

              <Link
                href="/running-program"
                className="block p-3 bg-slate-100 dark:bg-slate-800 rounded-lg hover:bg-primary-100 dark:hover:bg-primary-950/30 transition-colors group"
              >
                <div className="flex items-center justify-between">
                  <span className="font-medium text-slate-700 dark:text-slate-300 group-hover:text-primary-700 dark:group-hover:text-primary-300">Running Program</span>
                  <span className="text-slate-400 dark:text-slate-500 group-hover:text-primary-500 dark:group-hover:text-primary-300">→</span>
                </div>
              </Link>

              <Link
                href="/mechanism-setup"
                className="block p-3 bg-slate-100 dark:bg-slate-800 rounded-lg hover:bg-primary-100 dark:hover:bg-primary-950/30 transition-colors group"
              >
                <div className="flex items-center justify-between">
                  <span className="font-medium text-slate-700 dark:text-slate-300 group-hover:text-primary-700 dark:group-hover:text-primary-300">Mechanism Setup</span>
                  <span className="text-slate-400 dark:text-slate-500 group-hover:text-primary-500 dark:group-hover:text-primary-300">→</span>
                </div>
              </Link>

              <Link
                href="/pid-control"
                className="block p-3 bg-slate-100 dark:bg-slate-800 rounded-lg hover:bg-primary-100 dark:hover:bg-primary-950/30 transition-colors group"
              >
                <div className="flex items-center justify-between">
                  <span className="font-medium text-slate-700 dark:text-slate-300 group-hover:text-primary-700 dark:group-hover:text-primary-300">PID Control</span>
                  <span className="text-slate-400 dark:text-slate-500 group-hover:text-primary-500 dark:group-hover:text-primary-300">→</span>
                </div>
              </Link>

              <Link
                href="/motion-magic"
                className="block p-3 bg-slate-100 dark:bg-slate-800 rounded-lg hover:bg-primary-100 dark:hover:bg-primary-950/30 transition-colors group"
              >
                <div className="flex items-center justify-between">
                  <span className="font-medium text-slate-700 dark:text-slate-300 group-hover:text-primary-700 dark:group-hover:text-primary-300">Motion Magic</span>
                  <span className="text-slate-400 dark:text-slate-500 group-hover:text-primary-500 dark:group-hover:text-primary-300">→</span>
                </div>
              </Link>


            </div>

            <Link
              href="/hardware"
              className="w-full bg-primary-600 text-white py-3 px-4 rounded-lg font-semibold hover:bg-primary-700 transition-colors text-center block"
            >
              Start Workshop #1
            </Link>
          </div>

          {/* Workshop #2 */}
          <div className="bg-slate-50 dark:bg-slate-900 rounded-lg p-8 shadow-lg border border-slate-200 dark:border-slate-800 opacity-60">
            <div className="flex items-center mb-4">
              <div className="w-12 h-12 bg-slate-400 rounded-lg flex items-center justify-center text-white font-bold text-xl mr-4">
                2
              </div>
              <h3 className="text-2xl font-bold text-slate-900 dark:text-slate-100">Workshop #2</h3>
            </div>

            <p className="text-slate-600 dark:text-slate-300 mb-6">
              Advanced topics including swerve drive, vision systems, path planning, and data logging.
            </p>

            <div className="space-y-3 mb-6">
              <div className="p-3 bg-slate-100 dark:bg-slate-800 rounded-lg">
                <span className="font-medium text-slate-500 dark:text-slate-400">Creating a Swerve Drive Project</span>
              </div>

              <div className="p-3 bg-slate-100 dark:bg-slate-800 rounded-lg">
                <span className="font-medium text-slate-500 dark:text-slate-400">Adding PathPlanner</span>
              </div>

              <div className="p-3 bg-slate-100 dark:bg-slate-800 rounded-lg">
                <span className="font-medium text-slate-500 dark:text-slate-400">Vision Options</span>
              </div>

              <div className="p-3 bg-slate-100 dark:bg-slate-800 rounded-lg">
                <span className="font-medium text-slate-500 dark:text-slate-400">Implementing Vision</span>
              </div>

              <div className="p-3 bg-slate-100 dark:bg-slate-800 rounded-lg">
                <span className="font-medium text-slate-500 dark:text-slate-400">Logging Options</span>
              </div>

              <div className="p-3 bg-slate-100 dark:bg-slate-800 rounded-lg">
                <span className="font-medium text-slate-500 dark:text-slate-400">Implementing Logging</span>
              </div>

              <div className="p-3 bg-slate-100 dark:bg-slate-800 rounded-lg">
                <span className="font-medium text-slate-500 dark:text-slate-400">Vision-Based Shooting</span>
              </div>
            </div>

            <button
              disabled
              className="w-full bg-slate-400 text-white py-3 px-4 rounded-lg font-semibold cursor-not-allowed text-center block"
            >
              Coming Soon
            </button>
          </div>
        </div>
      </section>
    </PageTemplate>
  );
}