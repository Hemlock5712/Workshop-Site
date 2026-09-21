import PageTemplate from "@/components/PageTemplate";
import LessonSection from "@/components/lesson/LessonSection";
import FigureGrid from "@/components/lesson/FigureGrid";
import Box from "@/components/Box";
import Quiz from "@/components/Quiz";
import DocumentationButton from "@/components/DocumentationButton";
import { MarginNote, ProseBlock, Split } from "@/components/lesson/Prose";
import { BookOpen, Wrench } from "lucide-react";

/**
 * Restores the bench half of the old `/vision-options`, retired in August 2026
 * when the two vision pages were collapsed into one.
 *
 * The collapse kept the code and threw away everything a student does before
 * writing any: which camera to buy, where to bolt it, what to plug it into,
 * and the five settings that decide whether the Java on the next page has
 * anything worth reading. `/vision-implementation` carried a shortened camera
 * setup section for a while, and it was the only hardware procedure on the
 * site sitting inside a code lesson.
 *
 * What came back from the January 2026 page: the Limelight/PhotonVision
 * comparison, power and network, the mounting rule, the field map upload, and
 * the ChArUco calibration step. What did not: the three-card "why vision
 * matters" grid, the "what you'll learn" list, and the best-practices
 * do/don't columns, all of which were headings with no procedure under them.
 */
export default function VisionHardware() {
  return (
    <PageTemplate
      title="Vision Hardware"
      lede="A camera that sees an AprilTag can tell the robot where it is standing. Everything on this page happens before any Java, and none of it can be fixed in code afterwards."
      needs={[
        <>A robot on its wheels, with a PDH and a radio or network switch.</>,
        <>A Limelight, its mount, and an Ethernet cable.</>,
        <>A printed AprilTag from the current field map.</>,
        <>A laptop on the robot network, for the camera web interface.</>,
      ]}
      time="12 minutes"
    >
      <LessonSection id="tags-against-drift" title="Tags against drift">
        <Split>
          <ProseBlock>
            <p>
              Odometry adds up wheel turns. Every skid, every scrubbed wheel and
              every millimetre of error in the wheel radius goes into the total
              and stays there. By the end of a match, the robot&apos;s idea of
              where it stands can be a metre from the truth. Nothing on the
              robot notices.
            </p>
            <p>
              An AprilTag is a printed marker with an ID number. The field
              drawing lists where each ID sits, how high, and which way it
              faces. A camera measures the corners of the tag in the image and
              solves for the transform between camera and tag. From there it
              works backwards to a position on the field.
            </p>
            <p>
              That answer owes nothing to how long the robot has been driving.
              It is also occasional and noisy, so it does not replace odometry.
              The next lesson blends the two.
            </p>
          </ProseBlock>
          <MarginNote label="The map is a file">
            The camera holds its own copy of the field map, so uploading it is
            one of the steps below. A camera on last season&apos;s map reports
            confident nonsense.
          </MarginNote>
        </Split>
      </LessonSection>

      <LessonSection
        id="limelight-or-photonvision"
        title="Limelight or PhotonVision"
      >
        <p>
          Two systems cover most of FRC. Both find AprilTags, both solve a field
          pose from several tags at once, and both publish it to NetworkTables.
          They differ in what arrives in the box.
        </p>

        <div className="overflow-x-auto">
          <table className="w-full min-w-[560px] border-collapse text-note">
            <thead>
              <tr style={{ borderBottom: "1px solid var(--rule)" }}>
                <th className="px-3 py-2 text-left"></th>
                <th className="px-3 py-2 text-left">Limelight</th>
                <th className="px-3 py-2 text-left">PhotonVision</th>
              </tr>
            </thead>
            <tbody style={{ color: "var(--tx2)" }}>
              <tr style={{ borderBottom: "1px solid var(--rule-soft)" }}>
                <td className="px-3 py-2">What you buy</td>
                <td className="px-3 py-2">
                  Sealed camera and processor, one unit
                </td>
                <td className="px-3 py-2">
                  Free software, your own coprocessor and USB camera
                </td>
              </tr>
              <tr style={{ borderBottom: "1px solid var(--rule-soft)" }}>
                <td className="px-3 py-2">Rough cost</td>
                <td className="px-3 py-2">$400 to $500</td>
                <td className="px-3 py-2">$100 to $150</td>
              </tr>
              <tr style={{ borderBottom: "1px solid var(--rule-soft)" }}>
                <td className="px-3 py-2">Setup</td>
                <td className="px-3 py-2">Power, Ethernet, web interface</td>
                <td className="px-3 py-2">
                  Flash the coprocessor, pick a camera, then the same
                </td>
              </tr>
              <tr style={{ borderBottom: "1px solid var(--rule-soft)" }}>
                <td className="px-3 py-2">Tuning</td>
                <td className="px-3 py-2">Web interface only</td>
                <td className="px-3 py-2">
                  Web interface, or your own pipeline
                </td>
              </tr>
              <tr>
                <td className="px-3 py-2">Fails when</td>
                <td className="px-3 py-2">
                  The one unit dies, and it is one part
                </td>
                <td className="px-3 py-2">
                  A camera, a cable or an SD card dies, and there are more
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        <p>
          This workshop uses a Limelight. The reason is scope. A PhotonVision
          build starts with flashing an image onto a coprocessor and picking a
          lens, and none of that teaches pose estimation. Everything on the next
          page maps onto PhotonVision with different class names.
        </p>

        <div className="flex flex-col gap-2 sm:flex-row">
          <DocumentationButton
            href="https://docs.limelightvision.io/docs/docs-limelight/getting-started/summary"
            title="Limelight: getting started"
            icon={<BookOpen className="h-5 w-5" />}
          />
          <DocumentationButton
            href="https://docs.photonvision.org/"
            title="PhotonVision documentation"
            icon={<Wrench className="h-5 w-5" />}
          />
        </div>
      </LessonSection>

      <LessonSection id="mounting-and-wiring" title="Mounting and wiring">
        <p>
          Mounting decides whether any of the next lesson works, and it is the
          part teams get wrong. Bolt the camera where it can see the scoring
          tags at the moment you are scoring, not where there happened to be
          room.
        </p>

        <FigureGrid
          cols={3}
          items={[
            {
              label: "Power",
              term: "PDH, 12 V",
              body: (
                <>
                  A dedicated breaker on the PDH. Not the VRM, whose budget is
                  already spoken for by the radio.
                </>
              ),
            },
            {
              label: "Network",
              term: "Ethernet",
              body: (
                <>
                  Straight to the radio, or to a network switch once you have
                  more than one device. The camera needs a real link, not Wi-Fi.
                </>
              ),
            },
            {
              label: "Angle",
              term: "Never level",
              body: (
                <>
                  Off to one side, and above or below the tag. Dead-on and level
                  gives the worst pose a tag can produce.
                </>
              ),
            },
          ]}
        />

        <Split>
          <ProseBlock>
            <p>
              The angle rule surprises people. A tag viewed square-on and at its
              own height is a plain rectangle. A small error in the measured
              corners then swings the solved angle a long way. View the same tag
              from off to one side and the shape in the image carries much more
              information about where you stand.
            </p>
          </ProseBlock>
          <MarginNote label="Two cameras">
            Many teams run two or three, angled so that something always has a
            tag in frame. The next lesson takes a list of camera names for
            exactly this reason.
          </MarginNote>
        </Split>
      </LessonSection>

      <LessonSection id="set-the-camera-up" title="Set the camera up">
        <p>
          Do these in order, with the robot powered and the laptop on the robot
          network. None of the Java on the next page fixes a camera that skipped
          a step here.
        </p>

        <ol className="ml-5 list-decimal space-y-4">
          <li>
            <strong>Update the Limelight OS and upload the field map.</strong>{" "}
            The OS goes on over USB. The map is a separate download, and it
            loads through the web interface. A camera running last season&apos;s
            map places every tag in the wrong spot.
            <div className="mt-3">
              <DocumentationButton
                href="https://docs.limelightvision.io/docs/resources/downloads"
                title="Limelight: downloads"
                icon={<BookOpen className="h-5 w-5" />}
              />
            </div>
          </li>
          <li>
            <strong>Switch the active pipeline to AprilTag.</strong> A
            color-blob pipeline never publishes a botpose, however well it is
            tuned.
          </li>
          <li>
            <strong>Drop the exposure</strong> as low as it goes while the
            camera still finds tags. A short shutter cuts motion blur, and a
            blurred tag gives a wrong answer rather than no answer.
          </li>
          <li>
            <strong>Enter the camera offsets.</strong> Measure where the camera
            sits relative to the robot&apos;s center, and at what angle. Solving
            gives the camera&apos;s pose, and the offsets turn it into the
            robot&apos;s. Get them wrong and every measurement shifts the same
            way.
            <div className="mt-3">
              <DocumentationButton
                href="https://docs.limelightvision.io/docs/docs-limelight/pipeline-apriltag/apriltag-3d#full-3d-tracking"
                title="Limelight: full 3D tracking"
                icon={<Wrench className="h-5 w-5" />}
              />
            </div>
          </li>
          <li>
            <strong>Calibrate the lens</strong> with a printed ChArUco board.
            This corrects lens distortion, which is worst at the edges of the
            image. Tags sit at the edges whenever you are lined up on something.
            <div className="mt-3">
              <DocumentationButton
                href="https://docs.limelightvision.io/docs/docs-limelight/getting-started/performing-charuco-camera-calibration"
                title="Limelight: ChArUco calibration"
                icon={<Wrench className="h-5 w-5" />}
              />
            </div>
          </li>
          <li>
            <strong>Write down the camera&apos;s name.</strong> That string is
            the NetworkTables table the camera publishes to, and the Java on the
            next page addresses the camera by it. The default is{" "}
            <code>limelight</code>.
          </li>
        </ol>

        <Box variant="alert-warning" title="Glue the lens">
          <p>
            Limelight lenses are threaded and they walk under vibration. Once
            the focus is right for the distance you care about, put a drop of
            glue on the thread. A lens that shifts halfway through a competition
            takes the calibration with it and nothing on the driver station says
            so.
          </p>
        </Box>
      </LessonSection>

      <LessonSection id="check-your-work" title="Check your work">
        <p>
          Hold a printed tag about a metre in front of the camera and watch the
          web interface. Move it left, right, nearer and further.
        </p>

        <Box variant="alert-success" title="You should see">
          <p>
            The tag&apos;s ID, drawn on the image and reported in the numbers
            below it. A distance that matches a tape measure within a few
            centimetres. A botpose that changes smoothly as you move the tag,
            rather than flickering between two answers.
          </p>
        </Box>

        <p>
          Three things go wrong here. No ID at all means the pipeline is still
          on the wrong type, or the exposure went so low that the tag is black.
          An ID with a distance that is out by a factor means the tag size in
          the pipeline does not match the tag you printed. A distance that is
          right up close and drifts as the tag nears the edge of the frame is
          the lens calibration. Run the ChArUco board again, properly this time.
        </p>
      </LessonSection>

      <Quiz
        questions={[
          {
            id: 1,
            question:
              "Why does an AprilTag sighting help a drivetrain that already has odometry?",
            options: [
              "It runs at a higher rate than the wheel encoders",
              "It replaces the gyro, so heading no longer drifts",
              "It is an absolute measurement, so its error does not grow with how long the robot has been driving",
              "It is more precise than odometry on every single reading",
            ],
            correctAnswer: 2,
            explanation:
              "Odometry accumulates: every skid and every millimetre of wheel-radius error stays in the total. A tag sighting is measured against a known field position, so its error is whatever that one reading is worth and nothing more. It is often noisier than odometry frame to frame, so the next lesson blends the two instead of choosing.",
          },
          {
            id: 2,
            question:
              "Where should a camera NOT be mounted, if you want a good pose from a single tag?",
            options: [
              "Level with the tags and facing them square-on",
              "Above the tags, tilted down and off to one side",
              "Below the tags, tilted up and off to one side",
              "Anywhere the tag fills less than half the frame",
            ],
            correctAnswer: 0,
            explanation:
              "Square-on and at tag height is the worst case. The tag is a plain rectangle in the image, and a pixel of error on a corner swings the solved angle a long way. Viewing from an angle puts perspective into the shape, and perspective is what pins the answer down.",
          },
          {
            id: 3,
            question:
              "A camera reports tag IDs correctly but every pose lands about 30 cm behind where the robot really is. What is the most likely cause?",
            options: [
              "The exposure is too high",
              "The camera offsets entered in the web interface do not match where the camera is bolted",
              "The field map is from last season",
              "The Ethernet cable is running through a noisy area",
            ],
            correctAnswer: 1,
            explanation:
              "Solving a tag gives the camera's pose. The offsets are what turn that into the robot's pose, so an error in them shifts every measurement the same way, in the same direction, by the same amount. A stale field map moves individual tags rather than shifting everything uniformly.",
          },
          {
            id: 4,
            question:
              "Why should the Limelight be powered from the PDH rather than the VRM?",
            options: [
              "The VRM supplies the wrong voltage for a Limelight",
              "The PDH is closer to the radio on most robots",
              "A Limelight draws enough that the VRM's budget, already carrying the radio, is the wrong place for it",
              "Only the PDH can be switched off by the robot code",
            ],
            correctAnswer: 2,
            explanation:
              "The VRM has a small budget and the radio is already on it. Browning out a radio to save a breaker costs you the whole robot, not just vision. Give the camera its own breaker on the PDH.",
          },
          {
            id: 5,
            question:
              "What does calibrating the lens with a ChArUco board correct?",
            options: [
              "The camera's position relative to the robot's center",
              "The mapping between tag IDs and field positions",
              "The exposure and gain the pipeline uses",
              "Lens distortion, which bends the image most at its edges",
            ],
            correctAnswer: 3,
            explanation:
              "Every lens bends the image, and the bend is worst away from the center. Calibration measures that bend so the solver can undo it. It matters most exactly when you are lined up on something, because the tag has then moved to the edge of the frame.",
          },
          {
            id: 6,
            question:
              "What does choosing PhotonVision over a Limelight change for the code in the next lesson?",
            options: [
              "Nothing about the ideas, only the class names you call",
              "Nothing at all: the Java is identical",
              "Everything: PhotonVision cannot produce a field pose",
              "PhotonVision needs no camera calibration or offsets",
            ],
            correctAnswer: 0,
            explanation:
              "Both publish an AprilTag pose estimate with a timestamp and a tag count, and both want a standard deviation from you. The shape of the next lesson survives the swap. What changes is the library you install and the names of its methods, plus the coprocessor you had to set up first.",
          },
        ]}
      />
    </PageTemplate>
  );
}
