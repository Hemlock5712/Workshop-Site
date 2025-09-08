import PageTemplate from "@/components/PageTemplate";

export default function Prerequisites() {
  return (
    <PageTemplate title="Prerequisites" previousPage={{ href: "/introduction", title: "Introduction" }} nextPage={{ href: "/mechanism-cad", title: "Mechanism CAD" }}>
      <div className="grid gap-6">
        {/* Software Requirements */}
        <div className="bg-slate-50 dark:bg-slate-900 rounded-lg p-6 shadow-lg border border-slate-200 dark:border-slate-800">
          <h2 className="text-3xl font-bold text-slate-900 dark:text-slate-100 mb-4">📋 Software Requirements</h2>

          <div className="space-y-6">
            <div className="border-l-4 border-purple-200 dark:border-purple-900 pl-4">
              <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100">
                <a href="https://docs.wpilib.org/en/stable/docs/zero-to-robot/step-2/wpilib-setup.html"
                  className="text-purple-600 underline hover:no-underline dark:text-purple-400" target="_blank" rel="noopener noreferrer">
                  WPILib
                </a> & <a href="https://www.ni.com/en/support/downloads/drivers/download.frc-game-tools.html#553883"
                  className="text-purple-600 underline hover:no-underline dark:text-purple-400" target="_blank" rel="noopener noreferrer">
                  Game Tools
                </a>
              </h3>
              <p className="text-slate-600 dark:text-slate-300 mt-2">
                Install WPILib VS Code and National Instruments Game Tool (includes Driver Station and roboRIO imaging).
              </p>
            </div>

            <div className="border-l-4 border-blue-200 dark:border-blue-900 pl-4">
              <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100">
                <a href="https://apps.microsoft.com/detail/9NVV4PWDW27Z"
                  className="text-blue-600 underline hover:no-underline dark:text-blue-400" target="_blank" rel="noopener noreferrer">
                  Phoenix Tuner X
                </a>
              </h3>
              <p className="text-slate-600 dark:text-slate-300 mt-2">
                Essential for configuring and tuning TalonFX and other CTRE hardware.
              </p>
            </div>

            <div className="border-l-4 border-green-200 dark:border-green-900 pl-4">
              <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100">
                <a href="https://git-scm.com/downloads"
                  className="text-green-600 underline hover:no-underline dark:text-green-400" target="_blank" rel="noopener noreferrer">
                  Git
                </a>
              </h3>
              <p className="text-slate-600 dark:text-slate-300 mt-2">
                Use Git for version control. Summarize changes clearly (e.g., &apos;Add drivetrain PID tuning logic&apos;).
              </p>
            </div>

            <div className="border-l-4 border-orange-200 dark:border-orange-900 pl-4">
              <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100">
                <a href="https://github.com/mjansen4857/pathplanner/releases"
                  className="text-orange-600 underline hover:no-underline dark:text-orange-400" target="_blank" rel="noopener noreferrer">
                  PathPlanner
                </a>
              </h3>
              <p className="text-slate-600 dark:text-slate-300 mt-2">
                Allows you to draw paths for your swerve drive to follow.
              </p>
            </div>

            <div className="border-l-4 border-red-200 dark:border-red-900 pl-4">
              <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100">
                <a href="https://github.com/Gold872/elastic-dashboard"
                  className="text-red-600 underline hover:no-underline dark:text-red-400" target="_blank" rel="noopener noreferrer">
                  Elastic Dashboard
                </a>
              </h3>
              <p className="text-slate-600 dark:text-slate-300 mt-2">
                Drivers use a dashboard to easily view the robot and key items, such as selecting autonomous routines or viewing motor errors.
              </p>
            </div>

            <div className="border-l-4 border-yellow-200 dark:border-yellow-900 pl-4">
              <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100">
                <a href="https://www.codecademy.com/learn/learn-java"
                  className="text-yellow-600 underline hover:no-underline dark:text-yellow-400" target="_blank" rel="noopener noreferrer">
                  Java Knowledge
                </a>
              </h3>
              <p className="text-slate-600 dark:text-slate-300 mt-2">
                Ideally, some basic knowledge of Java coding (optional but recommended).
              </p>
            </div>
          </div>
        </div>

        {/* Hardware Requirements */}
        <div className="bg-slate-50 dark:bg-slate-900 rounded-lg p-6 shadow-lg border border-slate-200 dark:border-slate-800">
          <h2 className="text-3xl font-bold text-slate-900 dark:text-slate-100 mb-4">🖥️ Hardware Requirements</h2>
          <ul className="list-disc pl-5 space-y-2 text-slate-600 dark:text-slate-300">
            <li>Laptop or desktop with Windows 10+ or macOS 12+, at least 8GB RAM and 10GB free storage</li>
            <li>Stable internet connection for downloads and updates</li>
            <li>Access to a roboRIO, radio, and power supply for hardware testing</li>
          </ul>
        </div>

        {/* Installation Troubleshooting */}
        <div className="bg-slate-50 dark:bg-slate-900 rounded-lg p-6 shadow-lg border border-slate-200 dark:border-slate-800">
          <h2 className="text-3xl font-bold text-slate-900 dark:text-slate-100 mb-4">⚙️ Installation Troubleshooting</h2>
          <ul className="list-disc pl-5 space-y-2 text-slate-600 dark:text-slate-300">
            <li>Run installers as administrator to avoid permission issues</li>
            <li>Disable antivirus or firewall temporarily if downloads fail</li>
            <li>
              Verify Java is on your PATH by running <code className="bg-slate-200 dark:bg-slate-800 px-1 rounded">java -version</code>
            </li>
            <li>
              If WPILib crashes, run <code className="bg-slate-200 dark:bg-slate-800 px-1 rounded">WPILibDoctor</code> for diagnostics
            </li>
          </ul>
        </div>

        {/* Team Setup Tips */}
        <div className="bg-slate-50 dark:bg-slate-900 rounded-lg p-6 shadow-lg border border-slate-200 dark:border-slate-800">
          <h2 className="text-3xl font-bold text-slate-900 dark:text-slate-100 mb-4">🤝 Team Setup Tips</h2>
          <ul className="list-disc pl-5 space-y-2 text-slate-600 dark:text-slate-300">
            <li>Create a shared Git repository and protect the main branch</li>
            <li>Hold short stand-up meetings to coordinate tasks</li>
            <li>Encourage pair programming to help new members learn quickly</li>
          </ul>
        </div>

        {/* Skill Prerequisites */}
        <div className="bg-slate-50 dark:bg-slate-900 rounded-lg p-6 shadow-lg border border-slate-200 dark:border-slate-800">
          <h2 className="text-3xl font-bold text-slate-900 dark:text-slate-100 mb-4">📚 Skill Prerequisites</h2>
          <ul className="list-disc pl-5 space-y-2 text-slate-600 dark:text-slate-300">
            <li>Basic Java programming and command line familiarity</li>
            <li>Understanding of robot components like motors and sensors</li>
            <li>Willingness to learn and experiment</li>
          </ul>
        </div>

        {/* Time Estimates */}
        <div className="bg-slate-50 dark:bg-slate-900 rounded-lg p-6 shadow-lg border border-slate-200 dark:border-slate-800">
          <h2 className="text-3xl font-bold text-slate-900 dark:text-slate-100 mb-4">⏱️ Time Estimates</h2>
          <ul className="list-disc pl-5 space-y-2 text-slate-600 dark:text-slate-300">
            <li>Software installation: 1–2 hours depending on download speeds</li>
            <li>Initial hardware setup: about 2 hours</li>
            <li>Team onboarding and practice: 1 hour</li>
          </ul>
        </div>

        {/* Common Issues */}
        <div className="bg-slate-50 dark:bg-slate-900 rounded-lg p-6 shadow-lg border border-slate-200 dark:border-slate-800">
          <h2 className="text-3xl font-bold text-slate-900 dark:text-slate-100 mb-4">🐞 Common Issues</h2>
          <ul className="list-disc pl-5 space-y-2 text-slate-600 dark:text-slate-300">
            <li>Driver Station cannot see the roboRIO—check network cables and IP settings</li>
            <li>Build failures due to missing vendor libraries—rerun vendor dependency installer</li>
            <li>Outdated firmware—update motor controllers and roboRIO before testing</li>
          </ul>
        </div>
      </div>

      <div className="bg-primary-50 dark:bg-primary-950/30 border border-primary-200 dark:border-primary-900 rounded-lg p-6 mb-8">
        <h3 className="text-lg font-semibold text-primary-700 dark:text-primary-300 mb-2">Ready to Start?</h3>
        <p className="text-primary-800 dark:text-primary-300">
          Make sure you have all the prerequisites installed before proceeding to the hardware setup section.
        </p>
      </div>
    </PageTemplate>
  );
}