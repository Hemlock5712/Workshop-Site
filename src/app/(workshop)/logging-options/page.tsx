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
        concept="Comprehensive logging transforms debugging from guesswork into data-driven problem solving."
      />

      {/* Why Logging Matters */}
      <section className="flex flex-col gap-8">
        <h2 className="text-3xl font-bold text-slate-900 dark:text-slate-100">
          Why Logging is Critical in FRC
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
                ✅ With Comprehensive Logging
              </h4>
              <ul className="list-disc list-inside space-y-2 text-sm text-slate-600 dark:text-slate-300">
                <li>Replay exact robot state from any match</li>
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
          <p className="mb-3">
            Top FRC teams invest heavily in data logging infrastructure. Being
            able to quickly diagnose and fix issues between matches can mean the
            difference between winning and losing in elimination rounds.
          </p>
          <p className="text-sm text-slate-600 dark:text-slate-300">
            Modern logging frameworks make it easier than ever to capture
            comprehensive data without impacting robot performance.
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
            While comprehensive logging is valuable, excessive logging can
            impact robot performance:
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
          Several logging frameworks are available for FRC teams. Each has
          different features, complexity, and use cases:
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

        {/* AdvantageKit */}
        <div className="bg-slate-50 dark:bg-slate-900 rounded-lg p-8 border border-slate-200 dark:border-slate-800">
          <div className="flex items-start gap-4 mb-6">
            <div className="bg-green-600 text-white rounded-lg px-4 py-2 font-bold text-lg">
              2
            </div>
            <div className="flex-1">
              <h3 className="text-2xl font-bold text-slate-900 dark:text-slate-100 mb-2">
                AdvantageKit
              </h3>
              <p className="text-slate-600 dark:text-slate-300">
                Comprehensive logging and replay framework developed by Team
                6328 (Mechanical Advantage). Industry-leading solution for
                advanced teams.
              </p>
            </div>
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <h4 className="font-semibold text-slate-900 dark:text-slate-100 mb-3">
                ✅ Advantages
              </h4>
              <ul className="list-disc list-inside space-y-2 text-sm text-slate-600 dark:text-slate-300">
                <li>
                  <strong>Deterministic replay:</strong> Re-run robot code with
                  logged data
                </li>
                <li>
                  <strong>Hardware abstraction:</strong> IO layer separation for
                  testability
                </li>
                <li>
                  <strong>Comprehensive capture:</strong> All inputs/outputs
                  logged automatically
                </li>
                <li>
                  <strong>Time-travel debugging:</strong> Step through logged
                  matches
                </li>
                <li>
                  <strong>Simulation support:</strong> Test code without
                  hardware
                </li>
                <li>Integrates with AdvantageScope for visualization</li>
              </ul>
            </div>

            <div>
              <h4 className="font-semibold text-slate-900 dark:text-slate-100 mb-3">
                ⚠️ Limitations
              </h4>
              <ul className="list-disc list-inside space-y-2 text-sm text-slate-600 dark:text-slate-300">
                <li>Significant code restructuring required</li>
                <li>Steeper learning curve for implementation</li>
                <li>Requires understanding of IO layer pattern</li>
                <li>More complex setup and maintenance</li>
                <li>Best adopted at start of season, not mid-season</li>
              </ul>
            </div>
          </div>

          <div className="mt-6">
            <h4 className="font-semibold text-slate-900 dark:text-slate-100 mb-3">
              🎯 Best For
            </h4>
            <p className="text-sm text-slate-600 dark:text-slate-300">
              Advanced teams who want deterministic replay, time-travel
              debugging, and comprehensive testing capabilities. Requires
              significant investment in code architecture.
            </p>
          </div>

          <div className="mt-6">
            <DocumentationButton
              href="https://github.com/Mechanical-Advantage/AdvantageKit"
              title="AdvantageKit GitHub Repository"
              icon={<Book className="w-5 h-5" />}
            />
          </div>
        </div>

        {/* Hoot Logging */}
        <div className="bg-slate-50 dark:bg-slate-900 rounded-lg p-8 border border-slate-200 dark:border-slate-800">
          <div className="flex items-start gap-4 mb-6">
            <div className="bg-orange-600 text-white rounded-lg px-4 py-2 font-bold text-lg">
              3
            </div>
            <div className="flex-1">
              <h3 className="text-2xl font-bold text-slate-900 dark:text-slate-100 mb-2">
                Hoot Logging
              </h3>
              <p className="text-slate-600 dark:text-slate-300">
                Lightweight logging framework specifically designed for CTRE
                Phoenix 6 and modern FRC hardware.
              </p>
            </div>
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <h4 className="font-semibold text-slate-900 dark:text-slate-100 mb-3">
                ✅ Advantages
              </h4>
              <ul className="list-disc list-inside space-y-2 text-sm text-slate-600 dark:text-slate-300">
                <li>Optimized for Phoenix 6 signals and CTRE hardware</li>
                <li>Automatic capture of motor controller telemetry</li>
                <li>Low overhead with efficient signal logging</li>
                <li>Simple API for custom logging</li>
                <li>Outputs to .wpilog format</li>
                <li>Works well with CANivore high-frequency data</li>
              </ul>
            </div>

            <div>
              <h4 className="font-semibold text-slate-900 dark:text-slate-100 mb-3">
                ⚠️ Limitations
              </h4>
              <ul className="list-disc list-inside space-y-2 text-sm text-slate-600 dark:text-slate-300">
                <li>Focused primarily on CTRE ecosystem</li>
                <li>Less comprehensive than AdvantageKit</li>
                <li>Smaller community and documentation</li>
              </ul>
            </div>
          </div>

          <div className="mt-6">
            <h4 className="font-semibold text-slate-900 dark:text-slate-100 mb-3">
              🎯 Best For
            </h4>
            <p className="text-sm text-slate-600 dark:text-slate-300">
              Teams using CTRE Phoenix 6 hardware who want optimized logging for
              motor controllers and CANivore devices.
            </p>
          </div>
        </div>

        {/* WPILib Epilogue */}
        <div className="bg-slate-50 dark:bg-slate-900 rounded-lg p-8 border border-slate-200 dark:border-slate-800">
          <div className="flex items-start gap-4 mb-6">
            <div className="bg-blue-600 text-white rounded-lg px-4 py-2 font-bold text-lg">
              4
            </div>
            <div className="flex-1">
              <h3 className="text-2xl font-bold text-slate-900 dark:text-slate-100 mb-2">
                WPILib Epilogue (Java Only)
              </h3>
              <p className="text-slate-600 dark:text-slate-300">
                Annotation-based logging framework built into WPILib 2025+.
                Automatically generates logging code at compile time using the
                @Logged annotation.
              </p>
            </div>
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <h4 className="font-semibold text-slate-900 dark:text-slate-100 mb-3">
                ✅ Advantages
              </h4>
              <ul className="list-disc list-inside space-y-2 text-sm text-slate-600 dark:text-slate-300">
                <li>
                  <strong>Zero boilerplate:</strong> Add @Logged annotation, get
                  automatic logging
                </li>
                <li>Built into WPILib - no additional dependencies</li>
                <li>
                  Generates efficient logging code at compile time (no runtime
                  overhead)
                </li>
                <li>Logs to NetworkTables and DataLog automatically</li>
                <li>Integrates seamlessly with AdvantageScope</li>
                <li>
                  Configurable timing (defaults to 50Hz offset from robot loop)
                </li>
                <li>Performance metrics logged to NetworkTables</li>
              </ul>
            </div>

            <div>
              <h4 className="font-semibold text-slate-900 dark:text-slate-100 mb-3">
                ⚠️ Limitations
              </h4>
              <ul className="list-disc list-inside space-y-2 text-sm text-slate-600 dark:text-slate-300">
                <li>Java only (not available for C++ or Python)</li>
                <li>Requires WPILib 2025 or later</li>
                <li>
                  Only available for teams using annotation processing (Gradle
                  default)
                </li>
                <li>Less control than manual logging approaches</li>
                <li>New in 2025 - still maturing</li>
              </ul>
            </div>
          </div>

          <div className="mt-6">
            <h4 className="font-semibold text-slate-900 dark:text-slate-100 mb-3">
              🎯 Best For
            </h4>
            <p className="text-sm text-slate-600 dark:text-slate-300">
              Java teams using WPILib 2025+ who want comprehensive logging with
              minimal code. Perfect for teams who want the simplicity of
              DataLogManager with better structure and less manual code.
            </p>
          </div>

          <div className="mt-6">
            <DocumentationButton
              href="https://docs.wpilib.org/en/stable/docs/software/telemetry/robot-telemetry-with-annotations.html"
              title="WPILib Epilogue Documentation"
              icon={<Book className="w-5 h-5" />}
            />
          </div>
        </div>
      </section>

      {/* Comparison Table */}
      <section className="flex flex-col gap-8">
        <h2 className="text-3xl font-bold text-slate-900 dark:text-slate-100">
          Logging Framework Comparison
        </h2>

        <div className="overflow-x-auto">
          <table className="w-full border-collapse">
            <thead>
              <tr className="border-b-2 border-slate-300 dark:border-slate-700">
                <th className="text-left p-4 font-semibold text-slate-900 dark:text-slate-100">
                  Feature
                </th>
                <th className="text-left p-4 font-semibold text-slate-900 dark:text-slate-100">
                  DataLogManager
                </th>
                <th className="text-left p-4 font-semibold text-slate-900 dark:text-slate-100">
                  Epilogue
                </th>
                <th className="text-left p-4 font-semibold text-slate-900 dark:text-slate-100">
                  AdvantageKit
                </th>
                <th className="text-left p-4 font-semibold text-slate-900 dark:text-slate-100">
                  Hoot Logging
                </th>
              </tr>
            </thead>
            <tbody>
              <tr className="border-b border-slate-200 dark:border-slate-800">
                <td className="p-4 font-medium text-slate-900 dark:text-slate-100">
                  Setup Complexity
                </td>
                <td className="p-4 text-slate-600 dark:text-slate-300">
                  Very Easy - One line
                </td>
                <td className="p-4 text-slate-600 dark:text-slate-300">
                  Very Easy - Annotations
                </td>
                <td className="p-4 text-slate-600 dark:text-slate-300">
                  Complex - Major restructure
                </td>
                <td className="p-4 text-slate-600 dark:text-slate-300">
                  Easy - Simple integration
                </td>
              </tr>
              <tr className="border-b border-slate-200 dark:border-slate-800">
                <td className="p-4 font-medium text-slate-900 dark:text-slate-100">
                  Learning Curve
                </td>
                <td className="p-4 text-slate-600 dark:text-slate-300">
                  Minimal
                </td>
                <td className="p-4 text-slate-600 dark:text-slate-300">
                  Minimal
                </td>
                <td className="p-4 text-slate-600 dark:text-slate-300">
                  Steep
                </td>
                <td className="p-4 text-slate-600 dark:text-slate-300">
                  Moderate
                </td>
              </tr>
              <tr className="border-b border-slate-200 dark:border-slate-800">
                <td className="p-4 font-medium text-slate-900 dark:text-slate-100">
                  Performance Impact
                </td>
                <td className="p-4 text-slate-600 dark:text-slate-300">
                  Very Low
                </td>
                <td className="p-4 text-slate-600 dark:text-slate-300">
                  Very Low (compile-time)
                </td>
                <td className="p-4 text-slate-600 dark:text-slate-300">
                  Low (when properly configured)
                </td>
                <td className="p-4 text-slate-600 dark:text-slate-300">
                  Very Low
                </td>
              </tr>
              <tr className="border-b border-slate-200 dark:border-slate-800">
                <td className="p-4 font-medium text-slate-900 dark:text-slate-100">
                  Data Capture
                </td>
                <td className="p-4 text-slate-600 dark:text-slate-300">
                  NetworkTables only
                </td>
                <td className="p-4 text-slate-600 dark:text-slate-300">
                  Annotated classes
                </td>
                <td className="p-4 text-slate-600 dark:text-slate-300">
                  Comprehensive (all I/O)
                </td>
                <td className="p-4 text-slate-600 dark:text-slate-300">
                  Focused on CTRE devices
                </td>
              </tr>
              <tr className="border-b border-slate-200 dark:border-slate-800">
                <td className="p-4 font-medium text-slate-900 dark:text-slate-100">
                  Replay Capability
                </td>
                <td className="p-4 text-slate-600 dark:text-slate-300">
                  No (visualization only)
                </td>
                <td className="p-4 text-slate-600 dark:text-slate-300">
                  No (visualization only)
                </td>
                <td className="p-4 text-slate-600 dark:text-slate-300">
                  Yes (deterministic)
                </td>
                <td className="p-4 text-slate-600 dark:text-slate-300">
                  Yes (limited)
                </td>
              </tr>
              <tr className="border-b border-slate-200 dark:border-slate-800">
                <td className="p-4 font-medium text-slate-900 dark:text-slate-100">
                  Visualization
                </td>
                <td className="p-4 text-slate-600 dark:text-slate-300">
                  AdvantageScope
                </td>
                <td className="p-4 text-slate-600 dark:text-slate-300">
                  AdvantageScope
                </td>
                <td className="p-4 text-slate-600 dark:text-slate-300">
                  AdvantageScope
                </td>
                <td className="p-4 text-slate-600 dark:text-slate-300">
                  AdvantageScope or Tuner X
                </td>
              </tr>
              <tr className="border-b border-slate-200 dark:border-slate-800">
                <td className="p-4 font-medium text-slate-900 dark:text-slate-100">
                  Community Support
                </td>
                <td className="p-4 text-slate-600 dark:text-slate-300">
                  WPILib official
                </td>
                <td className="p-4 text-slate-600 dark:text-slate-300">
                  WPILib official
                </td>
                <td className="p-4 text-slate-600 dark:text-slate-300">
                  Strong (Team 6328)
                </td>
                <td className="p-4 text-slate-600 dark:text-slate-300">
                  Growing
                </td>
              </tr>
              <tr className="border-b border-slate-200 dark:border-slate-800">
                <td className="p-4 font-medium text-slate-900 dark:text-slate-100">
                  Best Use Case
                </td>
                <td className="p-4 text-slate-600 dark:text-slate-300">
                  Most teams, simple logging
                </td>
                <td className="p-4 text-slate-600 dark:text-slate-300">
                  Java teams, minimal boilerplate
                </td>
                <td className="p-4 text-slate-600 dark:text-slate-300">
                  Advanced teams, comprehensive testing
                </td>
                <td className="p-4 text-slate-600 dark:text-slate-300">
                  CTRE-focused teams
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </section>

      {/* Recommendation */}
      <section className="flex flex-col gap-8">
        <h2 className="text-3xl font-bold text-slate-900 dark:text-slate-100">
          Recommended Approach for This Workshop
        </h2>

        <div className="bg-primary-50 dark:bg-primary-950/30 rounded-lg p-8 border border-slate-200 dark:border-slate-800">
          <h3 className="text-xl font-semibold text-slate-900 dark:text-slate-100 mb-6">
            📊 Using DataLogManager + Epilogue
          </h3>

          <p className="text-slate-600 dark:text-slate-300 mb-6">
            For this workshop, we&apos;ll use a combination of WPILib&apos;s
            DataLogManager and Epilogue for structured annotation-based logging.
            This provides:
          </p>

          <div className="grid md:grid-cols-2 gap-6 mb-6">
            <div className="bg-slate-50 dark:bg-slate-900 p-6 rounded-lg border border-slate-200 dark:border-slate-800">
              <h4 className="font-bold text-primary-600 dark:text-primary-400 mb-3">
                Why DataLogManager?
              </h4>
              <ul className="list-disc list-inside space-y-2 text-sm text-slate-600 dark:text-slate-300">
                <li>Simple setup with minimal code changes</li>
                <li>Automatic capture of NetworkTables data</li>
                <li>Official WPILib support and maintenance</li>
                <li>Works with AdvantageScope for visualization</li>
              </ul>
            </div>

            <div className="bg-slate-50 dark:bg-slate-900 p-6 rounded-lg border border-slate-200 dark:border-slate-800">
              <h4 className="font-bold text-green-600 dark:text-green-400 mb-3">
                Why Add Epilogue?
              </h4>
              <ul className="list-disc list-inside space-y-2 text-sm text-slate-600 dark:text-slate-300">
                <li>Zero boilerplate with @Logged annotations</li>
                <li>Automatic structured logging of subsystems</li>
                <li>Compile-time code generation (no runtime overhead)</li>
                <li>Built into WPILib 2025 - no extra dependencies</li>
              </ul>
            </div>
          </div>

          <Box
            variant="alert-info"
            title="Future Considerations"
            icon={<Lightbulb className="w-5 h-5" />}
          >
            <p>
              As your team&apos;s sophistication grows, consider migrating to
              AdvantageKit for deterministic replay and comprehensive testing.
              However, start simple with DataLogManager + Epilogue to build good
              logging habits before adopting more complex frameworks.
            </p>
          </Box>
        </div>
      </section>

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
            href="https://github.com/Mechanical-Advantage/AdvantageKit"
            title="AdvantageKit GitHub"
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
                "It allows you to replay exact robot state from any match and debug issues quickly",
                "It reduces battery consumption",
                "It improves WiFi connection",
              ],
              correctAnswer: 1,
              explanation:
                "Comprehensive logging captures all robot telemetry during matches, allowing teams to replay exact robot state, analyze performance, identify root causes of failures, and make data-driven tuning decisions - all critical for debugging between matches.",
            },
            {
              id: 2,
              question:
                "What is the main difference between DataLogManager and AdvantageKit?",
              options: [
                "DataLogManager is faster than AdvantageKit",
                "AdvantageKit provides deterministic replay capability while DataLogManager only provides visualization",
                "DataLogManager requires more code than AdvantageKit",
                "AdvantageKit only works with Python",
              ],
              correctAnswer: 1,
              explanation:
                "AdvantageKit provides deterministic replay capabilities - you can re-run robot code with logged data for time-travel debugging. DataLogManager only captures data for post-match visualization, without replay functionality.",
            },
            {
              id: 3,
              question:
                "What makes WPILib Epilogue different from manual logging with SmartDashboard?",
              options: [
                "Epilogue requires more boilerplate code",
                "Epilogue uses @Logged annotations to automatically generate logging code at compile time",
                "Epilogue is slower than SmartDashboard",
                "Epilogue only works with vision systems",
              ],
              correctAnswer: 1,
              explanation:
                "Epilogue uses @Logged annotations to automatically generate logging code at compile time, eliminating boilerplate SmartDashboard.put() calls while maintaining zero runtime overhead through compile-time code generation.",
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
          Now that you understand the logging framework options, you&apos;ll
          implement DataLogManager and Epilogue in your robot code to capture
          telemetry.
        </Box>
      </section>
    </PageTemplate>
  );
}
