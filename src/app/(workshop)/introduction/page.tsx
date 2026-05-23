import PageTemplate from "@/components/PageTemplate";
import Link from "next/link";
import Box from "@/components/Box";

export default function Introduction() {
  return (
    <PageTemplate title="Gray Matter Coding Workshop">
      <Box variant="alert-info" title="Quick Note">
        All underlined text and images of code or products will have built-in
        links to resources.
      </Box>

      <Box variant="alert-warning" title="Before You Begin">
        This workshop requires specific software and hardware.{" "}
        <Link
          href="/prerequisites"
          className="underline font-semibold hover:text-[var(--foreground)] transition-colors"
        >
          Review prerequisites
        </Link>{" "}
        before starting to ensure you have everything needed.
      </Box>

      <section className="flex flex-col gap-8">
        <h2 className="text-3xl font-bold text-slate-900 dark:text-slate-100">
          Why Are We Here?
        </h2>

        <div className="space-y-6">
          <div className="border-l-4 border-orange-200 dark:border-orange-900 pl-4">
            <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100">
              Learn FRC&apos;s Best Programming Practices
            </h3>
            <p className="text-slate-600 dark:text-slate-300 mt-2">
              Master industry-standard coding patterns, command-based
              architecture, and proven development workflows that successful FRC
              teams use.
            </p>
          </div>

          <div className="border-l-4 border-green-200 dark:border-green-900 pl-4">
            <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100">
              Build Competition-Winning Robots
            </h3>
            <p className="text-slate-600 dark:text-slate-300 mt-2">
              Develop reliable, maintainable code that performs under pressure
              and helps your team succeed at districts, regionals and FIRST
              Championship.
            </p>
          </div>
        </div>
      </section>

      <section className="flex flex-col gap-8">
        <h2 className="text-3xl font-bold text-slate-900 dark:text-slate-100">
          Target Audience & Goals
        </h2>

        <div className="space-y-6">
          <div className="border-l-4 border-purple-200 dark:border-purple-900 pl-4">
            <h3 className="text-xl font-semibold text-slate-900 dark:text-slate-100 mb-3">
              Who This Workshop Is For
            </h3>
            <p className="text-lg text-slate-600 dark:text-slate-300 mb-4">
              This workshop is designed for FRC Teams using Java and CTRE
              Hardware.
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
              This site was created by Team 5712, Hemlocks Gray Matter, with
              support from its friends as a resource to cover introductory to
              advanced topics while providing a clear learning and
              implementation plan. We are excited for you to learn code
              architecture, command-based programming, and more!
            </p>
          </div>
        </div>
      </section>

      <section className="flex flex-col gap-8">
        <h2 className="text-3xl font-bold text-slate-900 dark:text-slate-100">
          Choose Your Workshop
        </h2>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 lg:gap-8">
          {/* Workshop #1 */}
          <div className="bg-slate-50 dark:bg-slate-900 rounded-lg p-6 sm:p-8 shadow-lg border border-slate-200 dark:border-slate-800 hover:shadow-xl transition-shadow">
            <div className="flex items-center mb-4">
              <div className="w-12 h-12 bg-primary-600 rounded-lg flex items-center justify-center text-white font-bold text-xl mr-4">
                1
              </div>
              <h3 className="text-2xl font-bold text-slate-900 dark:text-slate-100">
                Workshop #1
              </h3>
            </div>

            <p className="text-slate-600 dark:text-slate-300 mb-6">
              Fundamentals of FRC programming with command-based framework,
              subsystems, and PID control.
            </p>

            <div className="space-y-3 mb-6">
              <Link
                href="/hardware"
                className="block p-3 bg-slate-100 dark:bg-slate-800 rounded-lg hover:bg-primary-100 dark:hover:bg-primary-950/30 transition-colors group"
              >
                <div className="flex items-center justify-between">
                  <span className="font-medium text-slate-700 dark:text-slate-300 group-hover:text-primary-700 dark:group-hover:text-primary-300">
                    Hardware Setup
                  </span>
                  <span className="text-slate-400 dark:text-slate-500 group-hover:text-primary-500 dark:group-hover:text-primary-300">
                    →
                  </span>
                </div>
              </Link>

              <Link
                href="/project-setup"
                className="block p-3 bg-slate-100 dark:bg-slate-800 rounded-lg hover:bg-primary-100 dark:hover:bg-primary-950/30 transition-colors group"
              >
                <div className="flex items-center justify-between">
                  <span className="font-medium text-slate-700 dark:text-slate-300 group-hover:text-primary-700 dark:group-hover:text-primary-300">
                    Project Setup
                  </span>
                  <span className="text-slate-400 dark:text-slate-500 group-hover:text-primary-500 dark:group-hover:text-primary-300">
                    →
                  </span>
                </div>
              </Link>

              <Link
                href="/command-framework"
                className="block p-3 bg-slate-100 dark:bg-slate-800 rounded-lg hover:bg-primary-100 dark:hover:bg-primary-950/30 transition-colors group"
              >
                <div className="flex items-center justify-between">
                  <span className="font-medium text-slate-700 dark:text-slate-300 group-hover:text-primary-700 dark:group-hover:text-primary-300">
                    Command System
                  </span>
                  <span className="text-slate-400 dark:text-slate-500 group-hover:text-primary-500 dark:group-hover:text-primary-300">
                    →
                  </span>
                </div>
              </Link>

              <Link
                href="/building-subsystems"
                className="block p-3 bg-slate-100 dark:bg-slate-800 rounded-lg hover:bg-primary-100 dark:hover:bg-primary-950/30 transition-colors group"
              >
                <div className="flex items-center justify-between">
                  <span className="font-medium text-slate-700 dark:text-slate-300 group-hover:text-primary-700 dark:group-hover:text-primary-300">
                    Subsystems
                  </span>
                  <span className="text-slate-400 dark:text-slate-500 group-hover:text-primary-500 dark:group-hover:text-primary-300">
                    →
                  </span>
                </div>
              </Link>

              <Link
                href="/adding-commands"
                className="block p-3 bg-slate-100 dark:bg-slate-800 rounded-lg hover:bg-primary-100 dark:hover:bg-primary-950/30 transition-colors group"
              >
                <div className="flex items-center justify-between">
                  <span className="font-medium text-slate-700 dark:text-slate-300 group-hover:text-primary-700 dark:group-hover:text-primary-300">
                    Commands
                  </span>
                  <span className="text-slate-400 dark:text-slate-500 group-hover:text-primary-500 dark:group-hover:text-primary-300">
                    →
                  </span>
                </div>
              </Link>

              <Link
                href="/triggers"
                className="block p-3 bg-slate-100 dark:bg-slate-800 rounded-lg hover:bg-primary-100 dark:hover:bg-primary-950/30 transition-colors group"
              >
                <div className="flex items-center justify-between">
                  <span className="font-medium text-slate-700 dark:text-slate-300 group-hover:text-primary-700 dark:group-hover:text-primary-300">
                    Triggers
                  </span>
                  <span className="text-slate-400 dark:text-slate-500 group-hover:text-primary-500 dark:group-hover:text-primary-300">
                    →
                  </span>
                </div>
              </Link>

              <Link
                href="/running-program"
                className="block p-3 bg-slate-100 dark:bg-slate-800 rounded-lg hover:bg-primary-100 dark:hover:bg-primary-950/30 transition-colors group"
              >
                <div className="flex items-center justify-between">
                  <span className="font-medium text-slate-700 dark:text-slate-300 group-hover:text-primary-700 dark:group-hover:text-primary-300">
                    Run Program
                  </span>
                  <span className="text-slate-400 dark:text-slate-500 group-hover:text-primary-500 dark:group-hover:text-primary-300">
                    →
                  </span>
                </div>
              </Link>

              <Link
                href="/mechanism-setup"
                className="block p-3 bg-slate-100 dark:bg-slate-800 rounded-lg hover:bg-primary-100 dark:hover:bg-primary-950/30 transition-colors group"
              >
                <div className="flex items-center justify-between">
                  <span className="font-medium text-slate-700 dark:text-slate-300 group-hover:text-primary-700 dark:group-hover:text-primary-300">
                    Mechanism
                  </span>
                  <span className="text-slate-400 dark:text-slate-500 group-hover:text-primary-500 dark:group-hover:text-primary-300">
                    →
                  </span>
                </div>
              </Link>

              <Link
                href="/pid-control"
                className="block p-3 bg-slate-100 dark:bg-slate-800 rounded-lg hover:bg-primary-100 dark:hover:bg-primary-950/30 transition-colors group"
              >
                <div className="flex items-center justify-between">
                  <span className="font-medium text-slate-700 dark:text-slate-300 group-hover:text-primary-700 dark:group-hover:text-primary-300">
                    PID Control
                  </span>
                  <span className="text-slate-400 dark:text-slate-500 group-hover:text-primary-500 dark:group-hover:text-primary-300">
                    →
                  </span>
                </div>
              </Link>

              <Link
                href="/motion-magic"
                className="block p-3 bg-slate-100 dark:bg-slate-800 rounded-lg hover:bg-primary-100 dark:hover:bg-primary-950/30 transition-colors group"
              >
                <div className="flex items-center justify-between">
                  <span className="font-medium text-slate-700 dark:text-slate-300 group-hover:text-primary-700 dark:group-hover:text-primary-300">
                    Motion Magic
                  </span>
                  <span className="text-slate-400 dark:text-slate-500 group-hover:text-primary-500 dark:group-hover:text-primary-300">
                    →
                  </span>
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
          <div className="bg-slate-50 dark:bg-slate-900 rounded-lg p-6 sm:p-8 shadow-lg border border-slate-200 dark:border-slate-800 hover:shadow-xl transition-shadow">
            <div className="flex items-center mb-4">
              <div className="w-12 h-12 bg-primary-600 rounded-lg flex items-center justify-center text-white font-bold text-xl mr-4">
                2
              </div>
              <h3 className="text-2xl font-bold text-slate-900 dark:text-slate-100">
                Workshop #2
              </h3>
            </div>

            <p className="text-slate-600 dark:text-slate-300 mb-6">
              Advanced topics including swerve drive, vision systems, path
              planning, and data logging.
            </p>

            <div className="space-y-3 mb-6">
              <Link
                href="/swerve-prerequisites"
                className="block p-3 bg-slate-100 dark:bg-slate-800 rounded-lg hover:bg-primary-100 dark:hover:bg-primary-950/30 transition-colors group"
              >
                <div className="flex items-center justify-between">
                  <span className="font-medium text-slate-700 dark:text-slate-300 group-hover:text-primary-700 dark:group-hover:text-primary-300">
                    Swerve Prereqs
                  </span>
                  <span className="text-slate-400 dark:text-slate-500 group-hover:text-primary-500 dark:group-hover:text-primary-300">
                    →
                  </span>
                </div>
              </Link>

              <Link
                href="/swerve-drive-project"
                className="block p-3 bg-slate-100 dark:bg-slate-800 rounded-lg hover:bg-primary-100 dark:hover:bg-primary-950/30 transition-colors group"
              >
                <div className="flex items-center justify-between">
                  <span className="font-medium text-slate-700 dark:text-slate-300 group-hover:text-primary-700 dark:group-hover:text-primary-300">
                    Swerve Project
                  </span>
                  <span className="text-slate-400 dark:text-slate-500 group-hover:text-primary-500 dark:group-hover:text-primary-300">
                    →
                  </span>
                </div>
              </Link>

              <Link
                href="/pathplanner"
                className="block p-3 bg-slate-100 dark:bg-slate-800 rounded-lg hover:bg-primary-100 dark:hover:bg-primary-950/30 transition-colors group"
              >
                <div className="flex items-center justify-between">
                  <span className="font-medium text-slate-700 dark:text-slate-300 group-hover:text-primary-700 dark:group-hover:text-primary-300">
                    PathPlanner
                  </span>
                  <span className="text-slate-400 dark:text-slate-500 group-hover:text-primary-500 dark:group-hover:text-primary-300">
                    →
                  </span>
                </div>
              </Link>

              <Link
                href="/swerve-calibration"
                className="block p-3 bg-slate-100 dark:bg-slate-800 rounded-lg hover:bg-primary-100 dark:hover:bg-primary-950/30 transition-colors group"
              >
                <div className="flex items-center justify-between">
                  <span className="font-medium text-slate-700 dark:text-slate-300 group-hover:text-primary-700 dark:group-hover:text-primary-300">
                    Odom Calib
                  </span>
                  <span className="text-slate-400 dark:text-slate-500 group-hover:text-primary-500 dark:group-hover:text-primary-300">
                    →
                  </span>
                </div>
              </Link>

              <Link
                href="/logging-options"
                className="block p-3 bg-slate-100 dark:bg-slate-800 rounded-lg hover:bg-primary-100 dark:hover:bg-primary-950/30 transition-colors group"
              >
                <div className="flex items-center justify-between">
                  <span className="font-medium text-slate-700 dark:text-slate-300 group-hover:text-primary-700 dark:group-hover:text-primary-300">
                    Log Options
                  </span>
                  <span className="text-slate-400 dark:text-slate-500 group-hover:text-primary-500 dark:group-hover:text-primary-300">
                    →
                  </span>
                </div>
              </Link>

              <Link
                href="/logging-implementation"
                className="block p-3 bg-slate-100 dark:bg-slate-800 rounded-lg hover:bg-primary-100 dark:hover:bg-primary-950/30 transition-colors group"
              >
                <div className="flex items-center justify-between">
                  <span className="font-medium text-slate-700 dark:text-slate-300 group-hover:text-primary-700 dark:group-hover:text-primary-300">
                    Logging Setup
                  </span>
                  <span className="text-slate-400 dark:text-slate-500 group-hover:text-primary-500 dark:group-hover:text-primary-300">
                    →
                  </span>
                </div>
              </Link>

              <Link
                href="/drive-to-point"
                className="block p-3 bg-slate-100 dark:bg-slate-800 rounded-lg hover:bg-primary-100 dark:hover:bg-primary-950/30 transition-colors group"
              >
                <div className="flex items-center justify-between">
                  <span className="font-medium text-slate-700 dark:text-slate-300 group-hover:text-primary-700 dark:group-hover:text-primary-300">
                    Drive to Point
                  </span>
                  <span className="text-slate-400 dark:text-slate-500 group-hover:text-primary-500 dark:group-hover:text-primary-300">
                    →
                  </span>
                </div>
              </Link>

              <Link
                href="/vision-options"
                className="block p-3 bg-slate-100 dark:bg-slate-800 rounded-lg hover:bg-primary-100 dark:hover:bg-primary-950/30 transition-colors group"
              >
                <div className="flex items-center justify-between">
                  <span className="font-medium text-slate-700 dark:text-slate-300 group-hover:text-primary-700 dark:group-hover:text-primary-300">
                    Vision Options
                  </span>
                  <span className="text-slate-400 dark:text-slate-500 group-hover:text-primary-500 dark:group-hover:text-primary-300">
                    →
                  </span>
                </div>
              </Link>

              <Link
                href="/vision-implementation"
                className="block p-3 bg-slate-100 dark:bg-slate-800 rounded-lg hover:bg-primary-100 dark:hover:bg-primary-950/30 transition-colors group"
              >
                <div className="flex items-center justify-between">
                  <span className="font-medium text-slate-700 dark:text-slate-300 group-hover:text-primary-700 dark:group-hover:text-primary-300">
                    Vision Setup
                  </span>
                  <span className="text-slate-400 dark:text-slate-500 group-hover:text-primary-500 dark:group-hover:text-primary-300">
                    →
                  </span>
                </div>
              </Link>

              <Link
                href="/vision-shooting"
                className="block p-3 bg-slate-100 dark:bg-slate-800 rounded-lg hover:bg-primary-100 dark:hover:bg-primary-950/30 transition-colors group"
              >
                <div className="flex items-center justify-between">
                  <span className="font-medium text-slate-700 dark:text-slate-300 group-hover:text-primary-700 dark:group-hover:text-primary-300">
                    Odom Shot
                  </span>
                  <span className="text-slate-400 dark:text-slate-500 group-hover:text-primary-500 dark:group-hover:text-primary-300">
                    →
                  </span>
                </div>
              </Link>
            </div>

            <Link
              href="/swerve-prerequisites"
              className="w-full bg-primary-600 text-white py-3 px-4 rounded-lg font-semibold hover:bg-primary-700 transition-colors text-center block"
            >
              Start Workshop #2
            </Link>
          </div>
        </div>
      </section>
    </PageTemplate>
  );
}
