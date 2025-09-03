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
        <h2 className="text-3xl font-bold text-slate-900 dark:text-slate-100">Why are we here?</h2>
        <div className="bg-slate-50 dark:bg-slate-900 rounded-lg p-8 shadow-lg border border-slate-200 dark:border-slate-800">
          <ul className="space-y-4 text-lg">
            <li className="flex items-start">
              <span className="text-2xl mr-4">🎯</span>
              <span>To learn FRC&apos;s best programming practices</span>
            </li>
            <li className="flex items-start">
              <span className="text-2xl mr-4">🏆</span>
              <span>To have a robot that is good enough to win events</span>
            </li>
          </ul>
        </div>
      </section>

      <section className="flex flex-col gap-8">
        <h2 className="text-3xl font-bold text-slate-900 dark:text-slate-100">Our Goal</h2>
        <div className="bg-gradient-to-r from-green-50 to-blue-50 dark:from-green-950/30 dark:to-blue-950/30 rounded-lg p-8 border border-slate-200 dark:border-slate-800">
          <p className="text-lg text-slate-700 dark:text-slate-300">
            Cover code architecture, subsystems structure, PID tuning, libraries, odometry, vision, and more!
          </p>
        </div>
      </section>

      <section className="flex flex-col gap-8">
        <h2 className="text-3xl font-bold text-slate-900 dark:text-slate-100">Target Audience</h2>
        <div className="bg-yellow-50 dark:bg-yellow-950/30 rounded-lg p-8 border border-yellow-200 dark:border-yellow-900">
          <p className="text-lg text-slate-700 dark:text-slate-300">
            <strong>FRC Teams using Java and CTRE Hardware</strong>
          </p>
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
                  <span className="font-medium text-slate-700 dark:text-slate-300 group-hover:text-primary-700 dark:group-hover:text-primary-300">Command Framework</span>
                  <span className="text-slate-400 dark:text-slate-500 group-hover:text-primary-500 dark:group-hover:text-primary-300">→</span>
                </div>
              </Link>

              <Link
                href="/programming"
                className="block p-3 bg-slate-100 dark:bg-slate-800 rounded-lg hover:bg-primary-100 dark:hover:bg-primary-950/30 transition-colors group"
              >
                <div className="flex items-center justify-between">
                  <span className="font-medium text-slate-700 dark:text-slate-300 group-hover:text-primary-700 dark:group-hover:text-primary-300">Programming</span>
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
              Advanced topics including vision, autonomous, path planning, and competition strategy.
            </p>

            <div className="space-y-3 mb-6">
              <div className="p-3 bg-slate-100 dark:bg-slate-800 rounded-lg">
                <span className="font-medium text-slate-500 dark:text-slate-400">Vision & AprilTags</span>
              </div>
              <div className="p-3 bg-slate-100 dark:bg-slate-800 rounded-lg">
                <span className="font-medium text-slate-500 dark:text-slate-400">Autonomous Programming</span>
              </div>
              <div className="p-3 bg-slate-100 dark:bg-slate-800 rounded-lg">
                <span className="font-medium text-slate-500 dark:text-slate-400">Path Planning</span>
              </div>
              <div className="p-3 bg-slate-100 dark:bg-slate-800 rounded-lg">
                <span className="font-medium text-slate-500 dark:text-slate-400">Competition Strategy</span>
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