import PageTemplate from "@/components/PageTemplate";
import KeyConceptSection from "@/components/KeyConceptSection";
import Box from "@/components/Box";
import DocumentationButton from "@/components/DocumentationButton";
import Quiz from "@/components/Quiz";
import Link from "next/link";
import { Book, Download } from "lucide-react";

export default function SwerveDriveProject() {
  return (
    <PageTemplate
      title="Creating a Swerve Drive Project"
      previousPage={{
        href: "/swerve-prerequisites",
        title: "Swerve Drive Prerequisites",
      }}
      nextPage={{ href: "/pathplanner", title: "Adding PathPlanner" }}
    >
      {/* Introduction */}
      <KeyConceptSection
        title="Using Phoenix Tuner X to Generate Swerve Code"
        description="With the swerve drive fundamentals covered, we're ready to create a complete swerve drivetrain using CTRE's Phoenix Tuner X. This powerful tool generates production-ready swerve code, handling all the complexity of kinematics, odometry, and control."
        concept="Phoenix Tuner X generates a complete, competition-ready swerve drivetrain with one configuration wizard."
      />

      <Box variant="alert-info" title="Prerequisites Complete?">
        <p className="mb-2">
          Before proceeding, make sure you&apos;ve reviewed the{" "}
          <Link
            href="/swerve-prerequisites"
            className="text-primary-600 underline hover:no-underline hover:text-primary-800 dark:text-primary-400 dark:hover:text-primary-300 font-medium"
          >
            Swerve Drive Prerequisites
          </Link>{" "}
          page, which covers:
        </p>
        <ul className="list-disc list-inside space-y-1 text-sm text-slate-600 dark:text-slate-300">
          <li>Holonomic motion and swerve drive concepts</li>
          <li>Module anatomy (drive motor, azimuth motor, CANcoder)</li>
          <li>Coordinate systems (robot-centric vs field-centric)</li>
        </ul>
      </Box>

      {/* Quick Download Section */}
      <Box variant="alert-info" title="📦 Quick Start: Download Baseline Code">
        <p className="mb-4 text-slate-600 dark:text-slate-300">
          Need a baseline to get started? Download our complete swerve drive
          project from the workshop code repository. This serves as an excellent
          starting point with all the core swerve functionality already
          implemented. After downloading just change the Team Number in the
          `.wpilib/wpilib_preferences.json` and import tuner constants.
        </p>
        <a
          href="https://github.com/Hemlock5712/Workshop-Code/archive/refs/tags/v1.0-swerve.zip"
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center px-6 py-3 bg-primary-600 hover:bg-primary-700 text-white rounded-lg transition-colors font-medium gap-2"
        >
          <Download className="w-5 h-5" />
          Download Swerve Project (v1.0)
        </a>
      </Box>

      {/* Section 1: Phoenix Tuner X Project Setup */}
      <section className="flex flex-col gap-8">
        <h2 className="text-3xl font-bold text-slate-900 dark:text-slate-100">
          Creating a Swerve Project with Phoenix Tuner X
        </h2>

        <Box variant="alert-info" title="🚀 CTRE Swerve Project Generator">
          <p className="mb-4">
            CTRE provides a comprehensive swerve drive project generator in
            Phoenix Tuner X that creates a complete, competition-ready swerve
            drivetrain implementation. This is the recommended starting point
            for all swerve projects.
          </p>
          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <h4 className="font-semibold text-slate-900 dark:text-slate-100 mb-2">
                What the Generator Creates:
              </h4>
              <ul className="list-disc list-inside space-y-1 text-sm text-slate-600 dark:text-slate-300">
                <li>Complete CommandSwerveDrivetrain subsystem</li>
                <li>Tuner constants for all swerve parameters</li>
                <li>Module configurations and CAN IDs</li>
                <li>Field-centric and robot-centric drive commands</li>
                <li>Simulation support for testing without hardware</li>
                <li>PathPlanner integration for autonomous</li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold text-slate-900 dark:text-slate-100 mb-2">
                Required Information:
              </h4>
              <ul className="list-disc list-inside space-y-1 text-sm text-slate-600 dark:text-slate-300">
                <li>CAN IDs for all drive motors, steer motors, encoders</li>
                <li>CANivore name (if using CANivore)</li>
                <li>Wheel diameter and gear ratios</li>
                <li>Module positions (wheelbase and trackwidth)</li>
              </ul>
            </div>
          </div>
        </Box>

        <div className="space-y-6">
          <h3 className="text-2xl font-bold text-slate-900 dark:text-slate-100">
            Step-by-Step Setup Process
          </h3>

          <div className="space-y-4">
            <div className="flex items-start space-x-4">
              <div className="bg-primary-600 text-white rounded-full w-8 h-8 flex items-center justify-center font-bold flex-shrink-0">
                1
              </div>
              <div className="flex-1">
                <h4 className="font-semibold text-slate-900 dark:text-slate-100 mb-2">
                  Open Phoenix Tuner X
                </h4>
                <p className="text-slate-600 dark:text-slate-300">
                  Launch Phoenix Tuner X and connect to your robot or CANivore.
                  Ensure all swerve motors and encoders are visible and have
                  unique CAN IDs.
                </p>
              </div>
            </div>

            <div className="flex items-start space-x-4">
              <div className="bg-primary-600 text-white rounded-full w-8 h-8 flex items-center justify-center font-bold flex-shrink-0">
                2
              </div>
              <div className="flex-1">
                <h4 className="font-semibold text-slate-900 dark:text-slate-100 mb-2">
                  Navigate to Swerve Project Generator
                </h4>
                <p className="text-slate-600 dark:text-slate-300">
                  Click on <strong>Mechanisms</strong> in the left sidebar. This
                  will open the configuration wizard.
                </p>
              </div>
            </div>

            <div className="flex items-start space-x-4">
              <div className="bg-primary-600 text-white rounded-full w-8 h-8 flex items-center justify-center font-bold flex-shrink-0">
                3
              </div>
              <div className="flex-1">
                <h4 className="font-semibold text-slate-900 dark:text-slate-100 mb-2">
                  Configure Robot Parameters
                </h4>
                <p className="text-slate-600 dark:text-slate-300 mb-3">
                  Enter your robot&apos;s physical parameters:
                </p>
                <div className="bg-slate-50 dark:bg-slate-900 p-4 rounded-lg border border-slate-200 dark:border-slate-800">
                  <ul className="space-y-2 text-sm text-slate-600 dark:text-slate-300">
                    <li>
                      <strong>Wheelbase:</strong> Front-to-back distance between
                      modules (meters)
                    </li>
                    <li>
                      <strong>Trackwidth:</strong> Side-to-side distance between
                      modules (meters)
                    </li>
                    <li>
                      <strong>Wheel Diameter:</strong> Diameter of drive wheels
                      (inches)
                    </li>
                    <li>
                      <strong>Drive Gear Ratio:</strong> Motor rotations per
                      wheel rotation
                    </li>
                  </ul>
                </div>
              </div>
            </div>

            <div className="flex items-start space-x-4">
              <div className="bg-primary-600 text-white rounded-full w-8 h-8 flex items-center justify-center font-bold flex-shrink-0">
                4
              </div>
              <div className="flex-1">
                <h4 className="font-semibold text-slate-900 dark:text-slate-100 mb-2">
                  Follow the Steps to Generate and Export
                </h4>
                <p className="text-slate-600 dark:text-slate-300">
                  Click <strong>New Project</strong> and follow the steps in
                  Tuner X to set up and test your swerve drivetrain. Once you
                  finish, click <strong>Generate Tuner Constants</strong> and
                  you&apos;ll be ready to override the TunerConstants.java file
                  with your own values.
                </p>
              </div>
            </div>
          </div>
        </div>

        <DocumentationButton
          href="https://v6.docs.ctr-electronics.com/en/latest/docs/tuner/tuner-swerve/index.html"
          title="CTRE Swerve Project Generator Documentation"
          icon={<Book className="w-5 h-5" />}
        />
      </section>
      {/* Quiz Section */}
      <section className="flex flex-col gap-8">
        <Quiz
          title="Knowledge Check"
          questions={[
            {
              id: 1,
              question:
                "What tool does CTRE provide to generate a complete swerve drivetrain project?",
              options: [
                "WPILib Project Creator",
                "Phoenix Tuner X",
                "Visual Studio Code Extension",
                "PathPlanner GUI",
              ],
              correctAnswer: 1,
              explanation:
                "Phoenix Tuner X includes a comprehensive swerve project generator that creates a complete, competition-ready swerve drivetrain implementation with CommandSwerveDrivetrain, tuner constants, module configurations, and simulation support.",
            },
            {
              id: 2,
              question:
                "What information is required when configuring your robot in Phoenix Tuner X?",
              options: [
                "Only motor CAN IDs",
                "Only wheel diameter",
                "CAN IDs, wheelbase, trackwidth, wheel diameter, and gear ratios",
                "Just the CANivore name",
              ],
              correctAnswer: 2,
              explanation:
                "The Phoenix Tuner X swerve generator requires comprehensive robot parameters including all CAN IDs (drive motors, steer motors, encoders), physical dimensions (wheelbase and trackwidth), wheel diameter, drive gear ratio, and CANivore name if applicable.",
            },
            {
              id: 3,
              question:
                "What does the Phoenix Tuner X swerve generator automatically create?",
              options: [
                "Only motor configurations",
                "Complete CommandSwerveDrivetrain subsystem, tuner constants, module configs, field-centric drive commands, simulation support, and PathPlanner integration",
                "Only the subsystem code",
                "Just the CAN ID mappings",
              ],
              correctAnswer: 1,
              explanation:
                "The swerve generator creates a comprehensive package including the CommandSwerveDrivetrain subsystem, TunerConstants with all parameters, module configurations, field-centric and robot-centric drive commands, simulation support for testing, and PathPlanner integration for autonomous.",
            },
            {
              id: 4,
              question:
                "Where do you access the swerve project generator in Phoenix Tuner X?",
              options: [
                "File > New Project",
                "Tools > Swerve Generator",
                "Mechanisms in the left sidebar",
                "Settings > Robot Configuration",
              ],
              correctAnswer: 2,
              explanation:
                "The swerve project generator is accessed through the Mechanisms option in Phoenix Tuner X's left sidebar, which opens the configuration wizard to set up your swerve drivetrain parameters.",
            },
            {
              id: 5,
              question:
                "What is the wheelbase measurement used in swerve configuration?",
              options: [
                "Side-to-side distance between modules",
                "Front-to-back distance between modules",
                "Diagonal distance between opposite modules",
                "Distance from robot center to wheel",
              ],
              correctAnswer: 1,
              explanation:
                "Wheelbase is the front-to-back distance between swerve modules (measured in meters). This is different from trackwidth, which is the side-to-side distance. Both measurements are critical for accurate kinematics calculations.",
            },
          ]}
        />
      </section>

      <section className="flex flex-col gap-8">
        <h2 className="text-3xl font-bold text-slate-900 dark:text-slate-100">
          What&apos;s Next?
        </h2>

        <div className="bg-green-50 dark:bg-green-900/20 rounded-lg p-6 border-l-4 border-green-500">
          <h3 className="text-xl font-semibold text-green-900 dark:text-green-300 mb-4">
            Up Next: PathPlanner
          </h3>
          <p className="text-slate-600 dark:text-slate-300 mb-4">
            Now that your swerve project is generated, the next step is
            autonomous path following with PathPlanner.
          </p>
        </div>
      </section>
    </PageTemplate>
  );
}
