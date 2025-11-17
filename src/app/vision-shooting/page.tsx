import PageTemplate from "@/components/PageTemplate";
import KeyConceptSection from "@/components/KeyConceptSection";
import Box from "@/components/Box";
import ContentCard from "@/components/ContentCard";
import CollapsibleSection from "@/components/CollapsibleSection";
import CodeBlock from "@/components/CodeBlock";
import GithubPageWithPR from "@/components/GithubPageWithPR";
import Quiz from "@/components/Quiz";
import { Lightbulb, AlertTriangle, TrendingUp } from "lucide-react";

export default function DynamicFlywheel() {
  return (
    <PageTemplate
      title="Dynamic Flywheel Control"
      previousPage={{
        href: "/vision-implementation",
        title: "Implementing Vision",
      }}
      nextPage={{ href: "/state-based", title: "State-Based Control" }}
    >
      <KeyConceptSection
        title="Vision-Based Shooting with Dynamic Velocity"
        description="Using odometry data with an interpolating lookup table, your robot can shoot accurately from anywhere on the field."
        concept="Use swerve odometry and velocity mapping to achieve consistent shooting from any position without manual adjustment."
      />

      <p className="text-slate-600 dark:text-slate-300 text-center -mt-4">
        Instead of fixed shooting speeds, dynamic flywheel control adapts in
        real-time, making your robot more versatile and competitive during
        matches.
      </p>

      {/* Why Dynamic Velocity */}
      <section className="flex flex-col gap-8">
        <h2 className="text-3xl font-bold text-slate-900 dark:text-slate-100">
          Why Dynamic Velocity Control?
        </h2>

        <div className="grid md:grid-cols-2 gap-6">
          <div className="bg-red-50 dark:bg-red-950/30 rounded-lg p-6 border-l-4 border-red-400 dark:border-red-900">
            <h3 className="text-xl font-bold text-red-800 dark:text-red-300 mb-4 flex items-center gap-2">
              <span>❌</span>
              Fixed Velocity Problems
            </h3>
            <ul className="space-y-2 text-sm text-slate-700 dark:text-slate-300">
              <li className="flex items-start">
                <span className="mr-2">•</span>
                <span>Only accurate from one specific distance</span>
              </li>
              <li className="flex items-start">
                <span className="mr-2">•</span>
                <span>Requires driver to position robot precisely</span>
              </li>
              <li className="flex items-start">
                <span className="mr-2">•</span>
                <span>
                  Wastes time moving to &quot;sweet spot&quot; locations
                </span>
              </li>
              <li className="flex items-start">
                <span className="mr-2">•</span>
                <span>Limited strategic positioning options</span>
              </li>
              <li className="flex items-start">
                <span className="mr-2">•</span>
                <span>Multiple preset buttons needed for different zones</span>
              </li>
            </ul>
          </div>

          <div className="bg-green-50 dark:bg-green-950/30 rounded-lg p-6 border-l-4 border-green-400 dark:border-green-900">
            <h3 className="text-xl font-bold text-green-800 dark:text-green-300 mb-4 flex items-center gap-2">
              <span>✅</span>
              Dynamic Velocity Benefits
            </h3>
            <ul className="space-y-2 text-sm text-slate-700 dark:text-slate-300">
              <li className="flex items-start">
                <span className="mr-2">•</span>
                <span>Shoot accurately from anywhere on the field</span>
              </li>
              <li className="flex items-start">
                <span className="mr-2">•</span>
                <span>
                  Automatic velocity adjustment—no driver input needed
                </span>
              </li>
              <li className="flex items-start">
                <span className="mr-2">•</span>
                <span>Faster scoring cycles (shoot from current position)</span>
              </li>
              <li className="flex items-start">
                <span className="mr-2">•</span>
                <span>More strategic flexibility during matches</span>
              </li>
              <li className="flex items-start">
                <span className="mr-2">•</span>
                <span>Single button command handles all distances</span>
              </li>
            </ul>
          </div>
        </div>
      </section>

      {/* Understanding Interpolation */}
      <section className="flex flex-col gap-8">
        <h2 className="text-3xl font-bold text-slate-900 dark:text-slate-100">
          Understanding Distance-to-Velocity Mapping
        </h2>

        <p className="text-slate-600 dark:text-slate-300">
          The core of dynamic flywheel control is an{" "}
          <strong>InterpolatingTreeMap</strong>—a data structure that stores
          known distance-velocity pairs and automatically calculates velocities
          for distances in between.
        </p>

        <ContentCard>
          <div className="flex items-start gap-4 mb-4">
            <div className="bg-blue-500 text-white rounded-full w-10 h-10 flex items-center justify-center font-bold flex-shrink-0">
              <TrendingUp className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-xl font-bold text-slate-900 dark:text-slate-100 mb-2">
                How InterpolatingTreeMap Works
              </h3>
              <p className="text-slate-600 dark:text-slate-300">
                You provide key distance-velocity pairs, and the map fills in
                the gaps automatically using linear interpolation.
              </p>
            </div>
          </div>

          <div className="space-y-4">
            <div className="bg-slate-50 dark:bg-slate-900 p-4 rounded-lg border border-slate-200 dark:border-slate-800">
              <h4 className="font-semibold text-slate-900 dark:text-slate-100 mb-3">
                Example Mapping:
              </h4>
              <div className="space-y-2 text-sm text-slate-600 dark:text-slate-300">
                <div className="flex justify-between p-2 bg-white dark:bg-slate-800 rounded">
                  <span className="font-mono">Distance: 1.0 m</span>
                  <span className="font-mono">→ Velocity: 10 RPS</span>
                </div>
                <div className="flex justify-between p-2 bg-white dark:bg-slate-800 rounded">
                  <span className="font-mono">Distance: 2.0 m</span>
                  <span className="font-mono">→ Velocity: 30 RPS</span>
                </div>
                <div className="flex justify-between p-2 bg-white dark:bg-slate-800 rounded">
                  <span className="font-mono">Distance: 3.0 m</span>
                  <span className="font-mono">→ Velocity: 60 RPS</span>
                </div>
              </div>
            </div>

            <div className="bg-primary-50 dark:bg-primary-950/30 p-4 rounded-lg border border-primary-200 dark:border-primary-800">
              <h4 className="font-semibold text-primary-900 dark:text-primary-300 mb-2">
                📊 Automatic Interpolation:
              </h4>
              <p className="text-sm text-slate-700 dark:text-slate-300 mb-2">
                If your robot is at <strong>1.5 meters</strong> (between 1.0 and
                2.0), the map automatically calculates:
              </p>
              <p className="text-sm font-mono bg-white dark:bg-slate-800 p-2 rounded">
                Velocity = 10 + (30 - 10) × (1.5 - 1.0) / (2.0 - 1.0) ={" "}
                <strong>20 RPS</strong>
              </p>
              <p className="text-xs text-slate-600 dark:text-slate-400 mt-2">
                Linear interpolation ensures smooth velocity transitions as the
                robot moves around the field.
              </p>
            </div>
          </div>
        </ContentCard>
      </section>

      {/* Implementation */}
      <section className="flex flex-col gap-8">
        <h2 className="text-3xl font-bold text-slate-900 dark:text-slate-100">
          Implementation Guide
        </h2>

        <ContentCard>
          <div className="flex items-start gap-4 mb-4">
            <div className="bg-purple-500 text-white rounded-full w-10 h-10 flex items-center justify-center font-bold flex-shrink-0">
              1
            </div>
            <div>
              <h3 className="text-xl font-bold text-slate-900 dark:text-slate-100 mb-2">
                Set Up the Lookup Table
              </h3>
              <p className="text-slate-600 dark:text-slate-300">
                Create an InterpolatingTreeMap and populate it with
                distance-velocity pairs based on testing.
              </p>
            </div>
          </div>

          <CodeBlock
            language="java"
            title="Flywheel Subsystem Constructor"
            code={`public class Flywheel extends SubsystemBase {
    // Interpolating map: distance (meters) -> velocity (RPS)
    private final InterpolatingDoubleTreeMap table = new InterpolatingDoubleTreeMap();
    private final Translation2d target = new Translation2d(3, 5); // Fixed target position
    private double distance = 0.0;

    public Flywheel(CommandSwerveDrivetrain drivetrain) {
        m_drivetrain = drivetrain;

        // Populate lookup table with tested values
        table.put(0.0, 0.0);    // At target: no velocity needed
        table.put(1.0, 10.0);   // 1 meter away: 10 RPS
        table.put(2.0, 30.0);   // 2 meters away: 30 RPS
        table.put(3.0, 60.0);   // 3 meters away: 60 RPS
        // Add more points as needed from real-world testing
    }
}`}
          />

          <Box
            variant="alert-tip"
            title="Tuning Tip"
            icon={<Lightbulb className="w-5 h-5" />}
          >
            <p>
              Start with a few key distance points, then add more data through
              testing. You don&apos;t need every possible distance—interpolation
              handles the values in between!
            </p>
          </Box>
        </ContentCard>

        <ContentCard>
          <div className="flex items-start gap-4 mb-4">
            <div className="bg-purple-500 text-white rounded-full w-10 h-10 flex items-center justify-center font-bold flex-shrink-0">
              2
            </div>
            <div>
              <h3 className="text-xl font-bold text-slate-900 dark:text-slate-100 mb-2">
                Calculate Distance to Target
              </h3>
              <p className="text-slate-600 dark:text-slate-300">
                Use your swerve drivetrain&apos;s odometry to get the
                robot&apos;s position, then calculate distance to the target.
              </p>
            </div>
          </div>

          <CodeBlock
            language="java"
            title="Periodic Distance Update"
            code={`@Override
public void periodic() {
    // Get current robot pose from swerve odometry
    Pose2d robotPose = m_drivetrain.getState().Pose;
    Translation2d robotXY = robotPose.getTranslation();

    // Calculate Euclidean distance to fixed target
    distance = robotXY.getDistance(target);

    // Log for debugging (optional)
    SmartDashboard.putNumber("Distance to Target", distance);
    SmartDashboard.putNumber("Target Velocity", table.get(distance));
}`}
          />

          <Box variant="alert-info" title="🎯 Target Position">
            <p>
              The <code>target</code> is a fixed field position (e.g., speaker
              center). In this example, it&apos;s at coordinates (3, 5). Update
              this based on your field layout and game objectives.
            </p>
          </Box>
        </ContentCard>

        <ContentCard>
          <div className="flex items-start gap-4 mb-4">
            <div className="bg-purple-500 text-white rounded-full w-10 h-10 flex items-center justify-center font-bold flex-shrink-0">
              3
            </div>
            <div>
              <h3 className="text-xl font-bold text-slate-900 dark:text-slate-100 mb-2">
                Create the Distance Shoot Command
              </h3>
              <p className="text-slate-600 dark:text-slate-300">
                This command continuously queries the lookup table and adjusts
                flywheel velocity as the robot moves.
              </p>
            </div>
          </div>

          <CodeBlock
            language="java"
            title="Dynamic Velocity Command"
            code={`/**
 * Continuously adjusts flywheel velocity based on distance to target.
 * The velocity updates automatically as the robot moves around the field.
 */
public Command distanceShoot() {
    return run(() -> setVelocity(table.get(distance)));
}
}`}
          />

          <div className="bg-green-50 dark:bg-green-950/30 p-4 rounded-lg border-l-4 border-green-400 dark:border-green-900 mt-4">
            <h4 className="font-semibold text-green-800 dark:text-green-300 mb-2">
              ✨ Automatic Adjustment
            </h4>
            <p className="text-sm text-slate-700 dark:text-slate-300">
              As the robot drives around, the <code>periodic()</code> method
              updates <code>distance</code>, and the command automatically
              queries the new velocity. No manual intervention required!
            </p>
          </div>
        </ContentCard>
      </section>

      {/* Code Example from GitHub */}
      <section className="flex flex-col gap-8">
        <h2 className="text-3xl font-bold text-slate-900 dark:text-slate-100">
          Workshop Implementation: Dynamic Flywheel
        </h2>

        <p className="text-slate-600 dark:text-slate-300">
          See the complete implementation in the Workshop-Code repository. The{" "}
          <code>4-DynamicFlywheel</code> branch shows how all the pieces fit
          together in a real subsystem.
        </p>

        <GithubPageWithPR
          repository="Hemlock5712/Workshop-Code"
          filePath="src/main/java/frc/robot/subsystems/Flywheel.java"
          branch="4-DynamicFlywheel"
          pullRequestNumber={10}
          focusFile="Flywheel.java"
        />
      </section>

      {/* Tuning Guide */}
      <section className="flex flex-col gap-8">
        <h2 className="text-3xl font-bold text-slate-900 dark:text-slate-100">
          Tuning Your Velocity Map
        </h2>

        <CollapsibleSection
          title="📋 Step-by-Step Tuning Process"
          variant="info"
        >
          <div className="space-y-6">
            <div className="flex gap-4">
              <span className="bg-primary-500 text-white rounded-full w-8 h-8 flex items-center justify-center font-bold flex-shrink-0">
                1
              </span>
              <div>
                <h4 className="font-semibold text-slate-900 dark:text-slate-100">
                  Start with closest or farthest distance
                </h4>
                <p className="text-sm text-slate-600 dark:text-slate-300 mt-1">
                  Put your robot at the closest or farthest distance from the
                  target and manually tune the flywheel velocity until shots are
                  accurate.
                </p>
              </div>
            </div>

            <div className="flex gap-4">
              <span className="bg-primary-600 text-white rounded-full w-8 h-8 flex items-center justify-center font-bold flex-shrink-0">
                2
              </span>
              <div>
                <h4 className="font-semibold text-slate-900 dark:text-slate-100">
                  Test at Key Distances
                </h4>
                <p className="text-sm text-slate-600 dark:text-slate-300 mt-1">
                  Position your robot at specific distances (1m, 2m, 3m, etc.)
                  and manually tune the flywheel velocity until shots are
                  consistently successful.
                </p>
                <br />
                <Box
                  variant="alert-warning"
                  title="Test Systematically"
                  icon={<AlertTriangle className="w-5 h-5" />}
                >
                  <p className="text-sm">
                    Test each distance multiple times to account for
                    variability. Record the velocity that gives the best
                    consistency, not just a single lucky shot.
                  </p>
                </Box>
              </div>
            </div>

            <div className="flex gap-4">
              <span className="bg-primary-700 text-white rounded-full w-8 h-8 flex items-center justify-center font-bold flex-shrink-0">
                3
              </span>
              <div>
                <h4 className="font-semibold text-slate-900 dark:text-slate-100">
                  Record Successful Velocities
                </h4>
                <p className="text-sm text-slate-600 dark:text-slate-300 mt-1">
                  Log the distance and corresponding velocity for each
                  successful test. Create a table of proven data points.
                </p>
                <div className="bg-slate-50 dark:bg-slate-900 p-3 rounded mt-2">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-slate-300 dark:border-slate-700">
                        <th className="text-left py-2">Distance (m)</th>
                        <th className="text-left py-2">Velocity (RPS)</th>
                        <th className="text-left py-2">Success Rate</th>
                      </tr>
                    </thead>
                    <tbody className="text-slate-600 dark:text-slate-300">
                      <tr>
                        <td>1.0</td>
                        <td>10.0</td>
                        <td>95%</td>
                      </tr>
                      <tr>
                        <td>2.0</td>
                        <td>30.0</td>
                        <td>90%</td>
                      </tr>
                      <tr>
                        <td>3.0</td>
                        <td>60.0</td>
                        <td>92%</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>
            </div>

            <div className="flex gap-4">
              <span className="bg-primary-800 text-white rounded-full w-8 h-8 flex items-center justify-center font-bold flex-shrink-0">
                4
              </span>
              <div>
                <h4 className="font-semibold text-slate-900 dark:text-slate-100">
                  Populate the TreeMap
                </h4>
                <p className="text-sm text-slate-600 dark:text-slate-300 mt-1">
                  Add your tested distance-velocity pairs to the lookup table in
                  your code. Start with 3-5 key points.
                </p>
                <CodeBlock
                  language="java"
                  title="Updated Lookup Table"
                  code={`// Based on testing results
table.put(1.0, 10.0);   // 95% success rate
table.put(2.0, 30.0);   // 90% success rate
table.put(3.0, 60.0);   // 92% success rate
table.put(4.0, 85.0);   // Additional data point
table.put(5.0, 100.0);  // Maximum range`}
                />
              </div>
            </div>

            <div className="flex gap-4">
              <span className="bg-primary-900 text-white rounded-full w-8 h-8 flex items-center justify-center font-bold flex-shrink-0">
                5
              </span>
              <div>
                <h4 className="font-semibold text-slate-900 dark:text-slate-100">
                  Let Interpolation Fill the Gaps
                </h4>
                <p className="text-sm text-slate-600 dark:text-slate-300 mt-1">
                  Test at intermediate distances (1.5m, 2.5m, etc.) to verify
                  that interpolation is giving good results. Fine-tune by adding
                  more data points if needed.
                </p>
                <div className="bg-green-50 dark:bg-green-950/30 p-3 rounded mt-2 border-l-4 border-green-400 dark:border-green-900">
                  <p className="text-sm text-green-800 dark:text-green-300">
                    <strong>Pro Tip:</strong> Try not to add too many points. It
                    is only recommended to add points when you start missing.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </CollapsibleSection>
      </section>

      {/* Quiz */}
      <section className="flex flex-col gap-8">
        <Quiz
          title="Knowledge Check"
          questions={[
            {
              id: 1,
              question:
                "What is the primary advantage of dynamic flywheel control over fixed velocity shooting?",
              options: [
                "It uses less battery power",
                "It automatically adjusts velocity based on distance to target",
                "It eliminates the need for PID control",
                "It makes the flywheel spin faster",
              ],
              correctAnswer: 1,
              explanation:
                "Dynamic flywheel control automatically calculates and applies the correct velocity based on the robot's current distance to the target, allowing accurate shooting from any position without manual adjustment.",
            },
            {
              id: 2,
              question: "What does an InterpolatingTreeMap do?",
              options: [
                "It stores only exact distance-velocity pairs with no calculation",
                "It automatically calculates velocities for distances between stored data points",
                "It sorts robot positions by distance",
                "It replaces the need for odometry",
              ],
              correctAnswer: 1,
              explanation:
                "An InterpolatingTreeMap stores known distance-velocity pairs and uses linear interpolation to automatically calculate appropriate velocities for distances that fall between your stored data points.",
            },
            {
              id: 3,
              question:
                "How does the flywheel subsystem know the robot's distance to the target?",
              options: [
                "The driver manually inputs the distance",
                "It uses swerve drivetrain odometry to get robot pose and calculates distance",
                "It measures distance with an ultrasonic sensor",
                "It estimates based on flywheel motor current",
              ],
              correctAnswer: 1,
              explanation:
                "The subsystem gets the robot's current pose from the swerve drivetrain's odometry system, then calculates the Euclidean distance between the robot's position and the fixed target coordinates.",
            },
            {
              id: 4,
              question:
                "If your lookup table has entries for 1.0m→10 RPS and 2.0m→30 RPS, what velocity will it calculate for 1.5m?",
              options: ["15 RPS", "20 RPS", "25 RPS", "10 RPS"],
              correctAnswer: 1,
              explanation:
                "The map uses linear interpolation: 10 + (30-10) × (1.5-1.0)/(2.0-1.0) = 10 + 20×0.5 = 20 RPS. The velocity increases linearly between the two data points.",
            },
            {
              id: 5,
              question:
                "When tuning your velocity map, what is the recommended approach?",
              options: [
                "Test only at the exact distances you'll shoot from in matches",
                "Add every possible distance from 0 to maximum range",
                "Test at 3-5 key distances and let interpolation fill the gaps",
                "Copy values from another team's robot",
              ],
              correctAnswer: 2,
              explanation:
                "The most efficient approach is to test at 3-5 key distances throughout your shooting range. The InterpolatingTreeMap will automatically calculate appropriate velocities for intermediate distances through linear interpolation.",
            },
            {
              id: 6,
              question:
                "What happens in the distanceShoot() command's run method?",
              options: [
                "It sets a fixed velocity and never changes it",
                "It continuously queries the lookup table with current distance and updates velocity",
                "It only calculates velocity once when the command starts",
                "It turns off the flywheel motors",
              ],
              correctAnswer: 1,
              explanation:
                "The command continuously queries table.get(distance) to get the appropriate velocity for the current distance, then applies it to the flywheel. As the robot moves and distance changes, the velocity automatically adjusts.",
            },
          ]}
        />
      </section>
    </PageTemplate>
  );
}
