import PageTemplate from "@/components/PageTemplate";
import KeyConceptSection from "@/components/KeyConceptSection";
import ContentCard from "@/components/ContentCard";
import Box from "@/components/Box";
import DocumentationButton from "@/components/DocumentationButton";
import Quiz from "@/components/Quiz";
import { Book, Wrench, Lightbulb } from "lucide-react";

export default function VisionOptions() {
  return (
    <PageTemplate title="Vision Options">
      <KeyConceptSection
        title="Computer Vision: See the Field"
        description="Cameras let a robot detect game pieces, track targets, and figure out where it is on the field. AprilTags provide absolute field positioning, while object detection helps with game piece manipulation."
        concept="Without vision, your robot only knows where odometry says it is. With it, the robot can see the field and correct itself."
      />

      <section className="flex flex-col gap-8">
        <h2 className="text-3xl font-bold text-slate-900 dark:text-slate-100">
          Why Vision Matters in FRC
        </h2>

        <div className="grid md:grid-cols-3 gap-6">
          <Box variant="concept" title="Absolute Positioning">
            AprilTags provide known field positions, enabling accurate robot
            localization and drift correction for odometry.
          </Box>
          <Box variant="concept" title="Game Piece Detection">
            Detect and track notes, cones, cubes, or other game pieces for
            autonomous pickup and scoring.
          </Box>
          <Box variant="concept" title="Target Tracking">
            Aim and shoot at targets dynamically, adjusting for robot and target
            movement in real time.
          </Box>
        </div>

        <Box variant="alert-info" title="Vision in Modern FRC">
          <p>
            Modern FRC all but requires vision for accurate autonomous and
            teleop assists. Top teams run multiple cameras to keep more of the
            field in view.
          </p>
        </Box>
      </section>

      <section className="flex flex-col gap-8">
        <h2 className="text-3xl font-bold text-slate-900 dark:text-slate-100">
          FRC Vision System Options
        </h2>

        <div className="bg-slate-50 dark:bg-slate-900 rounded-lg p-8 border border-slate-200 dark:border-slate-800">
          <div className="flex items-start gap-4 mb-6">
            <div className="bg-primary-600 text-white rounded-lg px-4 py-2 font-bold text-lg">
              1
            </div>
            <div className="flex-1">
              <h3 className="text-2xl font-bold text-slate-900 dark:text-slate-100 mb-2">
                Limelight
              </h3>
              <p className="text-slate-600 dark:text-slate-300">
                Dedicated vision hardware with integrated processing, LEDs, and
                a NetworkTables interface. Plug it in and it works.
              </p>
            </div>
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <h4 className="font-semibold text-slate-900 dark:text-slate-100 mb-3">
                Advantages
              </h4>
              <ul className="list-disc list-inside space-y-2 text-sm text-slate-600 dark:text-slate-300">
                <li>Zero code required for basic detection</li>
                <li>Built-in LED ring for consistent lighting</li>
                <li>Hardware-accelerated processing</li>
                <li>Web interface for tuning pipelines</li>
                <li>NetworkTables integration out of the box</li>
                <li>Proven reliability in competition</li>
              </ul>
            </div>

            <div>
              <h4 className="font-semibold text-slate-900 dark:text-slate-100 mb-3">
                Limitations
              </h4>
              <ul className="list-disc list-inside space-y-2 text-sm text-slate-600 dark:text-slate-300">
                <li>Higher cost (~$400-500)</li>
                <li>Proprietary hardware and software</li>
                <li>Limited customization vs open source</li>
              </ul>
            </div>
          </div>

          <div className="mt-6">
            <h4 className="font-semibold text-slate-900 dark:text-slate-100 mb-3">
              Best For
            </h4>
            <p className="text-sm text-slate-600 dark:text-slate-300">
              Teams that want proven vision hardware with minimal setup and are
              willing to pay for the convenience.
            </p>
          </div>

          <div className="mt-6">
            <DocumentationButton
              href="https://docs.limelightvision.io/docs/docs-limelight/getting-started/summary"
              title="Limelight Documentation"
              icon={<Book className="w-5 h-5" />}
            />
          </div>
        </div>

        <div className="bg-slate-50 dark:bg-slate-900 rounded-lg p-8 border border-slate-200 dark:border-slate-800">
          <div className="flex items-start gap-4 mb-6">
            <div className="bg-green-600 text-white rounded-lg px-4 py-2 font-bold text-lg">
              2
            </div>
            <div className="flex-1">
              <h3 className="text-2xl font-bold text-slate-900 dark:text-slate-100 mb-2">
                PhotonVision
              </h3>
              <p className="text-slate-600 dark:text-slate-300">
                Open-source vision software that runs on coprocessors (Raspberry
                Pi, Orange Pi, etc.). The cheaper, do-it-yourself route.
              </p>
            </div>
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <h4 className="font-semibold text-slate-900 dark:text-slate-100 mb-3">
                Advantages
              </h4>
              <ul className="list-disc list-inside space-y-2 text-sm text-slate-600 dark:text-slate-300">
                <li>Free and open source</li>
                <li>Works with any USB camera</li>
                <li>Active development and community</li>
                <li>Advanced AprilTag support</li>
                <li>Multi-tag pose estimation</li>
                <li>Lower total cost (~$100-150)</li>
              </ul>
            </div>

            <div>
              <h4 className="font-semibold text-slate-900 dark:text-slate-100 mb-3">
                Limitations
              </h4>
              <ul className="list-disc list-inside space-y-2 text-sm text-slate-600 dark:text-slate-300">
                <li>Requires coprocessor setup</li>
                <li>More configuration complexity</li>
                <li>Camera and lighting selection matters</li>
                <li>Performance depends on hardware chosen</li>
              </ul>
            </div>
          </div>

          <div className="mt-6">
            <h4 className="font-semibold text-slate-900 dark:text-slate-100 mb-3">
              Best For
            </h4>
            <p className="text-sm text-slate-600 dark:text-slate-300">
              Teams that want cheap, flexible vision and don&apos;t mind the
              extra setup. Great for AprilTag localization.
            </p>
          </div>

          <div className="mt-6">
            <DocumentationButton
              href="https://docs.photonvision.org/"
              title="PhotonVision Documentation"
              icon={<Book className="w-5 h-5" />}
            />
          </div>
        </div>
      </section>

      <section className="flex flex-col gap-8">
        <h2 className="text-3xl font-bold text-slate-900 dark:text-slate-100">
          Hardware Setup
        </h2>

        <div className="grid md:grid-cols-2 gap-6">
          <ContentCard>
            <h3 className="text-xl font-bold text-slate-900 dark:text-slate-100 mb-4">
              Power & Connectivity
            </h3>
            <ul className="list-disc list-inside space-y-2 text-sm text-slate-600 dark:text-slate-300">
              <li>
                <strong>Power:</strong> Connect Limelight to the PDH/PDP (12V).
                Do not use the VRM unless necessary.
              </li>
              <li>
                <strong>Ethernet:</strong> Connect directly to the radio or use
                a <strong>network switch</strong> if you have multiple devices.
              </li>
              <li>
                <strong>Mounting:</strong> Mount cameras where they can see the
                scoring tags while you&apos;re scoring, and not at the same
                height as the tags. The camera should view a tag at an angle
                (left or right, and up or down).
              </li>
            </ul>
          </ContentCard>

          <ContentCard>
            <h3 className="text-xl font-bold text-slate-900 dark:text-slate-100 mb-4">
              AprilTag Configuration
            </h3>
            <p className="text-sm text-slate-600 dark:text-slate-300 mb-3">
              Ensure your Limelight is up to date and configured for the current
              game&apos;s AprilTag field map.
            </p>
            <ul className="list-disc list-inside space-y-2 text-sm text-slate-600 dark:text-slate-300">
              <li>
                Update <strong>Limelight OS</strong> to the latest version via
                USB flash drive.
              </li>
              <li>
                Download the latest <strong>AprilTag Field Map</strong> from the
                Limelight Downloads page.
              </li>
              <li>
                Upload the map via the Limelight web interface (Hardware Manager
                2.0).
              </li>
            </ul>
            <div className="mt-4 flex flex-col gap-2">
              <DocumentationButton
                href="https://docs.limelightvision.io/docs/resources/downloads"
                title="Limelight Downloads"
                icon={<Book className="w-5 h-5" />}
              />
              <DocumentationButton
                href="https://docs.limelightvision.io/docs/docs-limelight/pipeline-apriltag/apriltag-map-builder"
                title="Map Builder Guide"
                icon={<Wrench className="w-5 h-5" />}
              />
            </div>
          </ContentCard>
        </div>
      </section>

      <section className="flex flex-col gap-8">
        <h2 className="text-3xl font-bold text-slate-900 dark:text-slate-100">
          Vision System Comparison
        </h2>

        <div className="overflow-x-auto">
          <table className="w-full border-collapse">
            <thead>
              <tr className="border-b-2 border-slate-300 dark:border-slate-700">
                <th className="text-left p-4 font-semibold text-slate-900 dark:text-slate-100">
                  Feature
                </th>
                <th className="text-left p-4 font-semibold text-slate-900 dark:text-slate-100">
                  Limelight
                </th>
                <th className="text-left p-4 font-semibold text-slate-900 dark:text-slate-100">
                  PhotonVision
                </th>
              </tr>
            </thead>
            <tbody>
              <tr className="border-b border-slate-200 dark:border-slate-800">
                <td className="p-4 font-medium text-slate-900 dark:text-slate-100">
                  Cost
                </td>
                <td className="p-4 text-slate-600 dark:text-slate-300">
                  $400-500
                </td>
                <td className="p-4 text-slate-600 dark:text-slate-300">
                  $100-150
                </td>
              </tr>
              <tr className="border-b border-slate-200 dark:border-slate-800">
                <td className="p-4 font-medium text-slate-900 dark:text-slate-100">
                  Setup Complexity
                </td>
                <td className="p-4 text-slate-600 dark:text-slate-300">
                  Very Easy
                </td>
                <td className="p-4 text-slate-600 dark:text-slate-300">
                  Moderate
                </td>
              </tr>
              <tr className="border-b border-slate-200 dark:border-slate-800">
                <td className="p-4 font-medium text-slate-900 dark:text-slate-100">
                  Hardware
                </td>
                <td className="p-4 text-slate-600 dark:text-slate-300">
                  Integrated unit
                </td>
                <td className="p-4 text-slate-600 dark:text-slate-300">
                  Coprocessor + Camera
                </td>
              </tr>
              <tr className="border-b border-slate-200 dark:border-slate-800">
                <td className="p-4 font-medium text-slate-900 dark:text-slate-100">
                  AprilTag Support
                </td>
                <td className="p-4 text-slate-600 dark:text-slate-300">Yes</td>
                <td className="p-4 text-slate-600 dark:text-slate-300">Yes</td>
              </tr>
              <tr className="border-b border-slate-200 dark:border-slate-800">
                <td className="p-4 font-medium text-slate-900 dark:text-slate-100">
                  Custom Pipelines
                </td>
                <td className="p-4 text-slate-600 dark:text-slate-300">
                  Web interface
                </td>
                <td className="p-4 text-slate-600 dark:text-slate-300">
                  Web interface + Code
                </td>
              </tr>
              <tr className="border-b border-slate-200 dark:border-slate-800">
                <td className="p-4 font-medium text-slate-900 dark:text-slate-100">
                  Community Support
                </td>
                <td className="p-4 text-slate-600 dark:text-slate-300">
                  Large, established
                </td>
                <td className="p-4 text-slate-600 dark:text-slate-300">
                  Growing, active
                </td>
              </tr>
              <tr className="border-b border-slate-200 dark:border-slate-800">
                <td className="p-4 font-medium text-slate-900 dark:text-slate-100">
                  Best Use Case
                </td>
                <td className="p-4 text-slate-600 dark:text-slate-300">
                  Plug-and-play reliability
                </td>
                <td className="p-4 text-slate-600 dark:text-slate-300">
                  Cost-effective flexibility
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </section>

      <section className="flex flex-col gap-8">
        <h2 className="text-3xl font-bold text-slate-900 dark:text-slate-100">
          AprilTag Localization
        </h2>

        <p className="text-slate-600 dark:text-slate-300">
          AprilTags are fiducial markers placed at known locations on the FRC
          field. Cameras can detect these tags and calculate the robot&apos;s
          absolute field position.
        </p>

        <div className="grid md:grid-cols-2 gap-6">
          <ContentCard>
            <h3 className="text-xl font-bold text-primary-900 dark:text-primary-300 mb-4">
              How AprilTags Work
            </h3>
            <ul className="list-disc list-inside space-y-2 text-sm text-slate-600 dark:text-slate-300">
              <li>Tags have unique IDs corresponding to field positions</li>
              <li>Camera detects tag and calculates relative pose</li>
              <li>Robot position computed from known tag location</li>
              <li>Multiple tags improve accuracy through fusion</li>
            </ul>
          </ContentCard>

          <ContentCard>
            <h3 className="text-xl font-bold text-green-900 dark:text-green-300 mb-4">
              Benefits for FRC
            </h3>
            <ul className="list-disc list-inside space-y-2 text-sm text-slate-600 dark:text-slate-300">
              <li>Corrects odometry drift automatically</li>
              <li>Enables accurate autonomous navigation</li>
              <li>Works regardless of starting position</li>
              <li>Provides absolute field coordinates</li>
            </ul>
          </ContentCard>
        </div>

        <Box
          variant="alert-tip"
          title="Multi-Camera Setup"
          icon={<Lightbulb className="w-5 h-5" />}
        >
          <p>
            Many top teams use multiple cameras: one facing forward for game
            pieces, and others positioned to always see AprilTags for continuous
            localization.
          </p>
        </Box>
      </section>

      <section className="flex flex-col gap-8">
        <h2 className="text-3xl font-bold text-slate-900 dark:text-slate-100">
          Recommended Approach for This Workshop
        </h2>

        <div className="bg-primary-50 dark:bg-primary-950/30 rounded-lg p-8 border border-slate-200 dark:border-slate-800">
          <h3 className="text-xl font-semibold text-slate-900 dark:text-slate-100 mb-6">
            Using Limelight
          </h3>

          <p className="text-slate-600 dark:text-slate-300 mb-6">
            For this workshop, we&apos;ll use Limelight for its simplicity and
            reliability. The focus is on integrating vision data into your robot
            code, not configuring vision hardware.
          </p>

          <div className="bg-slate-50 dark:bg-slate-900 p-6 rounded-lg border border-slate-200 dark:border-slate-800">
            <h4 className="font-bold text-primary-600 dark:text-primary-400 mb-3">
              What You&apos;ll Learn
            </h4>
            <ul className="list-disc list-inside space-y-2 text-sm text-slate-600 dark:text-slate-300">
              <li>Reading vision data from NetworkTables</li>
              <li>Integrating AprilTag poses into odometry</li>
              <li>Using vision for target tracking</li>
              <li>Commanding turrets/shooters based on vision</li>
            </ul>
          </div>
        </div>
      </section>

      <section className="flex flex-col gap-8">
        <h2 className="text-3xl font-bold text-slate-900 dark:text-slate-100">
          Additional Resources
        </h2>

        <div className="grid md:grid-cols-2 gap-4">
          <DocumentationButton
            href="https://docs.limelightvision.io/"
            title="Limelight Documentation"
            icon={<Book className="w-5 h-5" />}
          />
          <DocumentationButton
            href="https://docs.photonvision.org/"
            title="PhotonVision Documentation"
            icon={<Wrench className="w-5 h-5" />}
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
                "What is the primary advantage of using Limelight over PhotonVision?",
              options: [
                "Lower cost",
                "Open source software",
                "Zero code required for basic detection with integrated hardware and LEDs",
                "Better AprilTag detection accuracy",
              ],
              correctAnswer: 2,
              explanation:
                "Limelight's main advantage is its plug-and-play nature with zero code required for basic detection. It includes integrated processing, built-in LED ring, hardware acceleration, and a web interface for tuning, making it the easiest solution to set up despite higher cost.",
            },
            {
              id: 2,
              question: "What do AprilTags provide for FRC robots?",
              options: [
                "Game piece detection",
                "Absolute field positioning and odometry drift correction",
                "Motor speed control",
                "Battery voltage monitoring",
              ],
              correctAnswer: 1,
              explanation:
                "AprilTags are fiducial markers placed at known locations on the FRC field. When detected by cameras, they provide absolute field positioning by calculating the robot's position from the known tag location, which corrects odometry drift automatically.",
            },
            {
              id: 3,
              question:
                "What is a key limitation of PhotonVision compared to Limelight?",
              options: [
                "Cannot detect AprilTags",
                "Doesn't work with swerve drivetrains",
                "Requires coprocessor setup and more configuration complexity",
                "More expensive",
              ],
              correctAnswer: 2,
              explanation:
                "PhotonVision requires setting up a coprocessor (like Raspberry Pi), selecting and configuring cameras, and managing lighting, which adds complexity. However, it's more cost-effective (~$100-150 vs $400-500) and offers greater flexibility as open source software.",
            },
            {
              id: 4,
              question: "How do AprilTags calculate robot position?",
              options: [
                "GPS satellites triangulation",
                "Camera detects tag, calculates relative pose, then computes robot position from known tag location",
                "Ultrasonic distance sensors",
                "Wheel encoder integration",
              ],
              correctAnswer: 1,
              explanation:
                "AprilTags work by having the camera detect the tag and calculate the relative pose (position and angle) between the camera and tag. Since the tag's field position is known, the robot's absolute position can be computed. Multiple tags improve accuracy through fusion.",
            },
            {
              id: 5,
              question: "Why do top FRC teams often use multiple cameras?",
              options: [
                "For redundancy in case one fails",
                "To see game pieces with one camera while always seeing AprilTags for continuous localization with others",
                "To record matches from different angles",
                "Because vision processing is faster with multiple cameras",
              ],
              correctAnswer: 1,
              explanation:
                "Many top teams use a multi-camera setup: one facing forward for game piece detection and manipulation, and others positioned to always see AprilTags for continuous localization. This provides both game-specific vision and reliable position tracking throughout the match.",
            },
          ]}
        />
      </section>

      {/* What's Next Section */}
      <section className="flex flex-col gap-8">
        <h2 className="text-3xl font-bold text-slate-900 dark:text-slate-100">
          What&apos;s Next?
        </h2>

        <Box variant="alert-success" title="Up Next: Implementing Vision">
          You&apos;ll integrate Limelight into your swerve drivetrain for
          AprilTag-based pose estimation and odometry correction.
        </Box>
      </section>
    </PageTemplate>
  );
}
