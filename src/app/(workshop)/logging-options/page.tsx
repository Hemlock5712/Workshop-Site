import PageTemplate from "@/components/PageTemplate";
import KeyConceptSection from "@/components/KeyConceptSection";
import ContentCard from "@/components/ContentCard";
import Box from "@/components/Box";
import DocumentationButton from "@/components/DocumentationButton";
import Quiz from "@/components/Quiz";
import {
  BarChart2,
  Book,
  Wrench,
  Zap,
  Lightbulb,
  AlertTriangle,
} from "lucide-react";

export default function LoggingOptions() {
  return (
    <PageTemplate title="Logging Options">
      {/* Introduction */}
      <KeyConceptSection
        title="Data Logging - Understanding What Happened"
        description="Data logging captures robot telemetry, sensor values, and system state during operation. This data is essential for debugging issues, analyzing performance, tuning mechanisms, and understanding what happened during a match."
        concept="Logging turns debugging from guesswork into data-driven problem solving."
      />

      {/* Why Logging Matters */}
      <section className="flex flex-col gap-8">
        <h2 className="text-3xl font-bold text-slate-900 dark:text-slate-100">
          Why Logging Matters in FRC
        </h2>

        <div className="bg-primary-50 dark:bg-primary-950/30 rounded-lg p-8 border border-slate-200 dark:border-slate-800">
          <h3 className="text-xl font-semibold text-slate-900 dark:text-slate-100 mb-6">
            🎯 The Logging Challenge
          </h3>

          <p className="text-slate-600 dark:text-slate-300 mb-6">
            During a match, your robot operates for only 2-3 minutes. When
            something goes wrong, you need to quickly understand what happened
            and fix it before the next match. Without logging, you&apos;re
            debugging blind.
          </p>

          <div className="grid md:grid-cols-2 gap-6">
            <div className="bg-slate-50 dark:bg-slate-900 p-6 rounded-lg border border-slate-200 dark:border-slate-800">
              <h4 className="font-bold text-red-600 dark:text-red-400 mb-3 text-lg">
                ❌ Without Logging
              </h4>
              <ul className="list-disc list-inside space-y-2 text-sm text-slate-600 dark:text-slate-300">
                <li>Guess what went wrong based on driver observation</li>
                <li>Attempt to reproduce issues in the pits</li>
                <li>Waste time debugging problems that already occurred</li>
                <li>Miss subtle performance issues and edge cases</li>
                <li>Struggle to tune PID and feedforward values</li>
              </ul>
            </div>

            <div className="bg-slate-50 dark:bg-slate-900 p-6 rounded-lg border border-slate-200 dark:border-slate-800">
              <h4 className="font-bold text-green-600 dark:text-green-400 mb-3 text-lg">
                ✅ With Logging
              </h4>
              <ul className="list-disc list-inside space-y-2 text-sm text-slate-600 dark:text-slate-300">
                <li>Review exact robot state from any match</li>
                <li>Analyze sensor data, motor outputs, and commands</li>
                <li>Identify root causes of failures quickly</li>
                <li>Optimize performance with data-driven decisions</li>
                <li>Tune PID values using real match data</li>
              </ul>
            </div>
          </div>
        </div>

        <div className="grid md:grid-cols-3 gap-6">
          <Box variant="concept" title="Debug Faster">
            See exactly what your robot was doing when something went wrong. No
            more guessing or trying to reproduce issues.
          </Box>
          <Box variant="concept" title="Tune Better">
            Analyze PID response curves, feedforward effectiveness, and
            mechanism performance with real match data.
          </Box>
          <Box variant="concept" title="Improve Continuously">
            Track performance metrics across matches to identify trends and
            opportunities for improvement.
          </Box>
        </div>

        <Box
          variant="alert-info"
          title="Logging is a Competitive Advantage"
          icon={<Lightbulb className="w-5 h-5" />}
        >
          <p>
            Top FRC teams invest heavily in logging because diagnosing and
            fixing an issue between matches can decide an elimination round.
          </p>
        </Box>
      </section>

      {/* What to Log */}
      <section className="flex flex-col gap-8">
        <h2 className="text-3xl font-bold text-slate-900 dark:text-slate-100">
          What Should You Log?
        </h2>

        <p className="text-slate-600 dark:text-slate-300">
          Effective logging captures all relevant robot state while managing
          data volume and performance impact:
        </p>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          <ContentCard>
            <div className="bg-primary-100 dark:bg-primary-900/20 p-4 rounded-lg mb-4">
              <h3 className="text-xl font-bold text-primary-900 dark:text-primary-300">
                🎮 Inputs
              </h3>
            </div>
            <ul className="list-disc list-inside space-y-2 text-sm text-slate-600 dark:text-slate-300">
              <li>Joystick values and button presses</li>
              <li>Sensor readings (encoders, gyros, limit switches)</li>
              <li>Vision detection results</li>
              <li>NetworkTables values</li>
              <li>Game-specific data (alliance, match number)</li>
            </ul>
          </ContentCard>

          <ContentCard>
            <div className="bg-green-100 dark:bg-green-900/20 p-4 rounded-lg mb-4">
              <h3 className="text-xl font-bold text-green-900 dark:text-green-300">
                🤖 Robot State
              </h3>
            </div>
            <ul className="list-disc list-inside space-y-2 text-sm text-slate-600 dark:text-slate-300">
              <li>Motor outputs (voltage, current, duty cycle)</li>
              <li>Mechanism positions and velocities</li>
              <li>Robot pose (X, Y, heading)</li>
              <li>Subsystem states and modes</li>
              <li>Active commands</li>
            </ul>
          </ContentCard>

          <ContentCard>
            <div className="bg-orange-100 dark:bg-orange-900/20 p-4 rounded-lg mb-4">
              <h3 className="text-xl font-bold text-orange-900 dark:text-orange-300">
                ⚙️ Control Signals
              </h3>
            </div>
            <ul className="list-disc list-inside space-y-2 text-sm text-slate-600 dark:text-slate-300">
              <li>Target setpoints and actual values</li>
              <li>PID error and output</li>
              <li>Feedforward calculations</li>
              <li>Path following targets</li>
              <li>Control loop timing</li>
            </ul>
          </ContentCard>
        </div>

        <Box
          variant="alert-warning"
          title="Balance Detail with Performance"
          icon={<AlertTriangle className="w-5 h-5" />}
        >
          <p className="mb-3">
            Logging has costs, and too much of it starts to hurt the robot:
          </p>
          <ul className="list-disc list-inside space-y-2 text-slate-600 dark:text-slate-300">
            <li>
              <strong>Network bandwidth:</strong> Don&apos;t spam NetworkTables
              with high-frequency data
            </li>
            <li>
              <strong>CPU overhead:</strong> Logging shouldn&apos;t slow down
              control loops
            </li>
            <li>
              <strong>Storage space:</strong> Log files can grow large with
              high-frequency data
            </li>
            <li>
              <strong>Best practice:</strong> Use efficient binary logging
              formats and appropriate sample rates
            </li>
          </ul>
        </Box>
      </section>

      {/* Logging Framework Options */}
      <section className="flex flex-col gap-8">
        <h2 className="text-3xl font-bold text-slate-900 dark:text-slate-100">
          FRC Logging Framework Options
        </h2>

        <p className="text-slate-600 dark:text-slate-300">
          This workshop uses exactly one: WPILib&apos;s built-in{" "}
          <code>DataLogManager</code>, mirroring the 2027 template. Here&apos;s
          what it does — followed by a short vocabulary list of the other
          framework names you&apos;ll hear around FRC, and why we don&apos;t use
          them.
        </p>

        {/* DataLogManager */}
        <div className="bg-slate-50 dark:bg-slate-900 rounded-lg p-8 border border-slate-200 dark:border-slate-800">
          <div className="flex items-start gap-4 mb-6">
            <div className="bg-primary-600 text-white rounded-lg px-4 py-2 font-bold text-lg">
              1
            </div>
            <div className="flex-1">
              <h3 className="text-2xl font-bold text-slate-900 dark:text-slate-100 mb-2">
                DataLogManager (WPILib Built-in)
              </h3>
              <p className="text-slate-600 dark:text-slate-300">
                Official WPILib data logging system that captures all
                NetworkTables data to binary .wpilog files.
              </p>
            </div>
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <h4 className="font-semibold text-slate-900 dark:text-slate-100 mb-3">
                ✅ Advantages
              </h4>
              <ul className="list-disc list-inside space-y-2 text-sm text-slate-600 dark:text-slate-300">
                <li>Built into WPILib - no additional dependencies</li>
                <li>Automatically logs all NetworkTables data</li>
                <li>Efficient binary format (.wpilog) for compact storage</li>
                <li>Integrated with AdvantageScope for visualization</li>
                <li>Simple setup with one line of code</li>
                <li>Low performance overhead</li>
              </ul>
            </div>

            <div>
              <h4 className="font-semibold text-slate-900 dark:text-slate-100 mb-3">
                ⚠️ Limitations
              </h4>
              <ul className="list-disc list-inside space-y-2 text-sm text-slate-600 dark:text-slate-300">
                <li>Only logs data published to NetworkTables</li>
                <li>No built-in replay/simulation capabilities</li>
                <li>Requires manual data publication from code</li>
                <li>Less structured than framework-based approaches</li>
              </ul>
            </div>
          </div>

          <div className="mt-6">
            <h4 className="font-semibold text-slate-900 dark:text-slate-100 mb-3">
              🎯 Best For
            </h4>
            <p className="text-sm text-slate-600 dark:text-slate-300">
              Teams who want simple, effective logging without additional
              framework complexity. Ideal for most FRC teams.
            </p>
          </div>
        </div>

        {/* Other frameworks — evaluated, not used */}
        <div className="bg-slate-50 dark:bg-slate-900 rounded-lg p-8 border border-slate-200 dark:border-slate-800">
          <h3 className="text-2xl font-bold text-slate-900 dark:text-slate-100 mb-2">
            Names you&apos;ll hear (evaluated, not used here)
          </h3>
          <p className="text-slate-600 dark:text-slate-300 mb-6">
            Plenty of good teams use these tools, so you should recognize the
            names — but the workshop and the 2027 template don&apos;t use them.
            Treat this list as vocabulary, not required learning.
          </p>

          <ul className="list-disc list-inside space-y-4 text-sm text-slate-600 dark:text-slate-300">
            <li>
              <strong>AdvantageKit</strong> (Team 6328) — a logging framework
              whose headline feature is <em>deterministic replay</em>:
              re-running a match log through your robot code in simulation.
              Getting that requires extending <code>LoggedRobot</code> and
              restructuring every subsystem around an IO layer. We record and
              review logs; we don&apos;t re-run them through the code — so the
              extra machinery would buy us nothing here.
            </li>
            <li>
              <strong>Epilogue (@Logged)</strong> — WPILib&apos;s
              annotation-based logging (2025+). A reasonable alternative, but
              DataLogManager plus plain NetworkTables publishing keeps the
              mental model smallest for a teaching codebase.
            </li>
            <li>
              <strong>Hoot logging</strong> — CTRE&apos;s device-side signal
              log. You already have this one without doing anything: Phoenix 6
              devices write a <code>.hoot</code> file automatically alongside
              DataLogManager&apos;s <code>.wpilog</code>, viewable in Tuner X or
              AdvantageScope.
            </li>
          </ul>

          <p className="text-sm text-slate-600 dark:text-slate-300 mt-6">
            One name that is <em>not</em> a logging framework:{" "}
            <strong>AdvantageScope</strong> is the log <em>viewer</em> we do use
            — it opens <code>.wpilog</code> and <code>.hoot</code> files
            regardless of which framework wrote them.
          </p>
        </div>
      </section>

      {/* Recommendation */}
      <section className="flex flex-col gap-8">
        <h2 className="text-3xl font-bold text-slate-900 dark:text-slate-100">
          Recommended Approach for This Workshop
        </h2>

        <div className="bg-primary-50 dark:bg-primary-950/30 rounded-lg p-8 border border-slate-200 dark:border-slate-800">
          <h3 className="text-xl font-semibold text-slate-900 dark:text-slate-100 mb-6">
            📊 Using WPILib DataLogManager
          </h3>

          <p className="text-slate-600 dark:text-slate-300 mb-6">
            For this workshop we mirror the 2027 template and use WPILib&apos;s
            built-in <code>DataLogManager</code>. It records every NetworkTables
            value change — including everything the drivetrain&apos;s telemetry
            publishes — to a binary <code>.wpilog</code> file, plus console
            output and (via <code>DriverStation.startDataLog</code>) the
            Driver-Station and joystick data. There&apos;s no extra vendordep,
            no <code>LoggedRobot</code>, and no replay layer to learn.
          </p>

          <div className="grid md:grid-cols-2 gap-6 mb-6">
            <div className="bg-slate-50 dark:bg-slate-900 p-6 rounded-lg border border-slate-200 dark:border-slate-800">
              <h4 className="font-bold text-primary-600 dark:text-primary-400 mb-3">
                Why DataLogManager?
              </h4>
              <ul className="list-disc list-inside space-y-2 text-sm text-slate-600 dark:text-slate-300">
                <li>
                  Built into WPILib: no vendordep, and two lines in{" "}
                  <code>Robot</code>&apos;s constructor turn it on
                </li>
                <li>
                  Captures all NetworkTables data automatically (your telemetry
                  plus DS/joystick state) to an efficient <code>.wpilog</code>
                </li>
                <li>
                  Opens directly in AdvantageScope for graphing and review
                </li>
                <li>
                  Phoenix 6 devices <em>also</em> log to a <code>.hoot</code>{" "}
                  file readable in Tuner X or AdvantageScope, so you get extra
                  signal data for free
                </li>
                <li>Fewest moving parts, which suits a teaching codebase</li>
              </ul>
            </div>

            <div className="bg-slate-50 dark:bg-slate-900 p-6 rounded-lg border border-slate-200 dark:border-slate-800">
              <h4 className="font-bold text-green-600 dark:text-green-400 mb-3">
                What we&apos;re NOT using (and why)
              </h4>
              <ul className="list-disc list-inside space-y-2 text-sm text-slate-600 dark:text-slate-300">
                <li>
                  <strong>AdvantageKit</strong> — its IO-layer / replay model is
                  more than this workshop needs; DataLogManager covers
                  record-and-review
                </li>
                <li>
                  <strong>Epilogue (@Logged)</strong> — a fine alternative, but
                  DataLogManager + plain NetworkTables publishing keeps the
                  mental model smallest
                </li>
                <li>
                  <strong>Deterministic log replay</strong> — out of scope; we
                  record and review logs, we don&apos;t re-run them through the
                  code
                </li>
              </ul>
            </div>
          </div>

          <Box
            variant="alert-info"
            title="How it looks"
            icon={<Lightbulb className="w-5 h-5" />}
          >
            <p>
              Two lines in <code>Robot</code>&apos;s constructor start it (
              <code>DataLogManager.start()</code> +{" "}
              <code>DriverStation.startDataLog(DataLogManager.getLog())</code>);
              after that you just publish the values you care about to
              NetworkTables — the swerve telemetry helper already does this for
              the drivetrain. The next lesson wires it all up.
            </p>
          </Box>
        </div>
      </section>

      <Box
        variant="alert-info"
        tag="ON THE HORIZON"
        title="A new WPILib Telemetry API is in development"
      >
        WPILib is working on a first-class telemetry framework — a static{" "}
        <code>Telemetry.log(&quot;name&quot;, value)</code> API with pluggable
        backends for NetworkTables and log files (
        <a
          href="https://github.com/wpilibsuite/allwpilib/pull/7773"
          target="_blank"
          rel="noopener noreferrer"
          className="underline"
        >
          allwpilib PR #7773
        </a>
        ). As of mid-2026 it is still an open draft: not merged, not in any 2027
        alpha. If it ships, this workshop will likely adopt it in place of
        hand-rolled NetworkTables publishing. Until then, DataLogManager is the
        shipped, supported path.
      </Box>

      {/* Resources */}
      <section className="flex flex-col gap-8">
        <h2 className="text-3xl font-bold text-slate-900 dark:text-slate-100">
          Additional Resources
        </h2>

        <div className="grid md:grid-cols-2 gap-4">
          <DocumentationButton
            href="https://docs.wpilib.org/en/stable/docs/software/telemetry/datalog.html"
            title="WPILib DataLogManager Documentation"
            icon={<Book className="w-5 h-5" />}
          />
          <DocumentationButton
            href="https://github.com/Hemlock5712/2027-Template"
            title="2027-Template — the logging setup we mirror"
            icon={<Wrench className="w-5 h-5" />}
          />
          <DocumentationButton
            href="https://github.com/Mechanical-Advantage/AdvantageScope"
            title="AdvantageScope - Log Visualization"
            icon={<BarChart2 className="w-5 h-5" />}
          />
          <DocumentationButton
            href="https://v6.docs.ctr-electronics.com/"
            title="Phoenix 6 Documentation"
            icon={<Zap className="w-5 h-5" />}
          />
        </div>
      </section>

      {/* Quiz Section */}
      <section className="flex flex-col gap-8">
        <Quiz
          title="Knowledge Check"
          questions={[
            {
              id: 1,
              question:
                "What is the primary advantage of comprehensive data logging in FRC?",
              options: [
                "It makes the robot drive faster",
                "It lets you review exact robot state from any match and debug issues quickly",
                "It reduces battery consumption",
                "It improves WiFi connection",
              ],
              correctAnswer: 1,
              explanation:
                "Comprehensive logging captures all robot telemetry during matches, letting teams review exact robot state, analyze performance, identify root causes of failures, and make data-driven tuning decisions - all critical for debugging between matches.",
            },
            {
              id: 2,
              question:
                "How does this workshop's logging approach (DataLogManager) capture data?",
              options: [
                "You annotate every field with @Logged",
                "It records every NetworkTables value change to a .wpilog file, so you publish your robot state to NetworkTables and it's captured automatically",
                "It writes a CSV file you open in a spreadsheet",
                "It streams video of the match",
              ],
              correctAnswer: 1,
              explanation:
                "DataLogManager records all NetworkTables value changes (plus console output and, via DriverStation.startDataLog, DS/joystick data) to a binary .wpilog. You get logging by publishing the values you care about to NetworkTables — the swerve telemetry helper already does this for the drivetrain.",
            },
            {
              id: 3,
              question:
                "How do you turn on DataLogManager in the 2027 template?",
              options: [
                "Extend LoggedRobot instead of OpModeRobot",
                "Call DataLogManager.start() (and DriverStation.startDataLog(...)) in Robot's constructor",
                "Add the AdvantageKit vendordep and an annotation processor",
                "Enable it from the Driver Station settings",
              ],
              correctAnswer: 1,
              explanation:
                "Two lines in Robot's constructor do it: DataLogManager.start() begins logging NetworkTables + console output, and DriverStation.startDataLog(DataLogManager.getLog()) adds the Driver-Station and joystick data. No vendordep and no LoggedRobot.",
            },
            {
              id: 4,
              question:
                "What type of data should you prioritize logging for effective debugging?",
              options: [
                "Only motor voltages",
                "Only camera images",
                "Sensor inputs, motor outputs, robot state, and control signals",
                "Only NetworkTables keys",
              ],
              correctAnswer: 2,
              explanation:
                "Effective logging captures sensor inputs (encoders, gyros, vision), motor outputs (voltage, current), robot state (pose, subsystem states), and control signals (PID setpoints, errors) - providing complete context for debugging.",
            },
            {
              id: 5,
              question: "Why might excessive logging impact robot performance?",
              options: [
                "Logging makes motors spin slower",
                "High-frequency data logging can consume network bandwidth, CPU cycles, and storage space",
                "Logging disables the gyroscope",
                "Logging prevents autonomous mode from working",
              ],
              correctAnswer: 1,
              explanation:
                "Excessive logging (especially high-frequency strings or large data) can spam NetworkTables bandwidth, increase CPU overhead in control loops, and create very large log files. Efficient binary formats and appropriate sample rates are essential.",
            },
          ]}
        />
      </section>

      {/* What's Next Section */}
      <section className="flex flex-col gap-8">
        <h2 className="text-3xl font-bold text-slate-900 dark:text-slate-100">
          What&apos;s Next?
        </h2>

        <Box variant="alert-success" title="Up Next: Implementing Logging">
          Next you&apos;ll start DataLogManager in <code>Robot</code>&apos;s
          constructor, publish your robot state to NetworkTables so it lands in
          the <code>.wpilog</code>, and open the result in AdvantageScope.
        </Box>
      </section>
    </PageTemplate>
  );
}
