import PageTemplate from "@/components/PageTemplate";
import { MarginNote, Split } from "@/components/lesson/Prose";
import LessonSection from "@/components/lesson/LessonSection";
import AlphaStatusNote from "@/components/AlphaStatusNote";
import KeyConceptSection from "@/components/KeyConceptSection";
import Box from "@/components/Box";
import CollapsibleSection from "@/components/CollapsibleSection";
import GitHubContent from "@/components/GitHubContent";
import DocumentationButton from "@/components/DocumentationButton";
import ContentCard from "@/components/ContentCard";
import CodeBlock from "@/components/CodeBlock";
import Quiz from "@/components/Quiz";
import { Link, Tag, GitBranch } from "lucide-react";

export default function VisionImplementation() {
  return (
    <PageTemplate
      title="The camera tells the drivetrain where it really is"
      emphasis="where it really is"
      lede="Wheel odometry adds up every wheel turn to guess where the robot is. It is smooth, it updates 250 times a second, and it drifts. Push the robot sideways, spin a wheel on carpet, take a hit in a match, and the guess quietly walks away from the truth."
      needs={[
        <>
          The swerve project from{" "}
          <strong>Creating a Swerve Drive Project</strong>, with the logging
          setup from <strong>Logging</strong>. Branch <code>3-Limelight</code>{" "}
          is one commit off <code>2-Logging</code>.
        </>,
        <>
          Odometry you trust, from <strong>Swerve Calibration</strong>. Vision
          corrects odometry — if the wheel radius is wrong, vision spends the
          whole match fighting it.
        </>,
        <>
          A Limelight bolted to the robot, powered, and reachable on the robot
          network. You will spend time in its web interface before you write a
          line of Java.
        </>,
        <>
          An AprilTag you can put in front of the camera. A printed one taped to
          a wall is fine for a bench test.
        </>,
      ]}
      branch="3-Limelight"
      time="About an hour"
    >
      <Split>
        <KeyConceptSection
          description={[
            "An AprilTag sighting is the opposite: it is absolute, it is occasional, and it is noisy. This page wires the two together, so the camera nudges odometry back toward reality every time it sees a tag.",
          ]}
          concept="Vision does not replace odometry. It corrects it, one sighting at a time, weighted by how much that sighting is worth."
        />
        <MarginNote label="WHAT YOU'LL BUILD">
          A <code>Limelight</code> class that reads the camera every loop and
          feeds pose corrections into the drivetrain, plus the single line in{" "}
          <code>Robot</code> that turns it on. Most of the hour is camera setup,
          not code.
        </MarginNote>
      </Split>

      <Box
        variant="alert-warning"
        tag="WATCH OUT"
        title="The simulator cannot test this"
      >
        <p>
          <code>Limelight.java</code>&apos;s own javadoc says it plainly:{" "}
          <em>&quot;Does nothing in simulation (there is no camera).&quot;</em>{" "}
          With no camera on the network there is no pose estimate, so the update
          method returns immediately every loop. Everything on this page has to
          be checked on the real robot with a real tag in front of it.
        </p>
      </Box>

      {/* ── AprilTags ────────────────────────────────────────────────── */}
      <LessonSection
        id="what-an-apriltag-gives-you"
        title="What an AprilTag gives you"
      >
        <p>
          AprilTags are the square black-and-white markers bolted around the
          field. Each one carries a unique ID, and the field drawing says
          exactly where that ID sits. The camera does not know what a speaker or
          a reef is. It sees tag 7, looks up where tag 7 lives, measures how far
          away and at what angle the tag is, and works backwards to where the
          camera must be standing to see it that way.
        </p>

        <div className="grid md:grid-cols-2 gap-6">
          <ContentCard tag="HOW THE MATH RUNS">
            <ul className="ml-4 list-disc space-y-2">
              <li>Every tag ID maps to a known spot on the field.</li>
              <li>
                The camera measures the tag&apos;s pose relative to itself.
              </li>
              <li>
                Known tag position + relative pose = camera position, and the
                offsets you configure turn that into robot position.
              </li>
              <li>Seeing two tags at once beats seeing one, by a lot.</li>
            </ul>
          </ContentCard>

          <ContentCard tag="WHY BOTHER">
            <ul className="ml-4 list-disc space-y-2">
              <li>Wheel odometry drifts; a tag sighting pulls it back.</li>
              <li>
                You get absolute field coordinates, not an accumulated guess.
              </li>
              <li>It works no matter where the robot was placed.</li>
              <li>
                Autonomous stops depending on a perfect starting position.
              </li>
            </ul>
          </ContentCard>
        </div>

        <Box variant="alert-tip" title="Where to bolt the camera">
          <p>
            Mounting decides whether any of this works, and it is the part teams
            get wrong. Put the camera where it can see the scoring tags{" "}
            <em>while you are actually scoring</em>, and{" "}
            <strong>not at the same height as the tags</strong>. You want the
            camera looking at a tag from an angle — off to one side, and above
            or below it. A camera staring at a tag dead-on, level with it, gives
            the worst pose estimate you can get.
          </p>
          <p className="mt-3">
            Many teams run more than one camera for this reason: one aimed where
            the game pieces are, others angled so something always has a tag in
            frame. The code below takes a list of camera names for exactly that
            case.
          </p>
        </Box>
      </LessonSection>

      {/* ── MegaTag1 vs MegaTag2 ─────────────────────────────────────── */}
      <LessonSection
        id="two-solvers-megatag1-and-megatag2"
        title="Two solvers: MegaTag1 and MegaTag2"
      >
        <p>
          The Limelight can turn the same picture into a robot pose two
          different ways, and the difference decides everything else on this
          page. Understand this part and the rest of the file reads itself.
        </p>

        <div className="grid md:grid-cols-2 gap-6">
          <ContentCard tag="MEGATAG1">
            <h3 className="display m-0 mb-2 text-lede">
              Solves everything from the tags
            </h3>
            <p>
              Position <em>and</em> heading come out of the geometry of the tags
              in frame. Nothing else is needed. With two or more tags spread
              across the image that geometry is well constrained and the answer
              is good.
            </p>
            <p className="mt-3">
              With a single tag it is shaky: a small error in the measured
              corner positions swings the solved heading a long way, and the
              heading error drags the position with it.
            </p>
          </ContentCard>

          <ContentCard tag="MEGATAG2">
            <h3 className="display m-0 mb-2 text-lede">
              Takes your heading as given
            </h3>
            <p>
              You tell the camera which way the robot is facing. It stops
              solving for heading and solves only for position, which is a much
              easier problem. One tag is enough.
            </p>
            <p className="mt-3">
              The catch is in the name: it trusts <em>your</em> heading. If the
              gyro is off by ten degrees, the position it hands back is wrong in
              a way no amount of filtering will catch. Seed the gyro.
            </p>
          </ContentCard>
        </div>

        <Box variant="concept" title="What the branch does">
          <p>
            <code>Limelight.java</code> asks for MegaTag1 first. If that
            estimate is valid but came from exactly one tag, it throws it away
            and asks again for MegaTag2. So: two or more tags, MegaTag1; one
            tag, MegaTag2; no tags, nothing at all.
          </p>
          <p className="mt-3">
            That is why the file writes the robot&apos;s heading to the camera
            at the top of every update, before it asks for anything. MegaTag2
            cannot answer without it.
          </p>
        </Box>
      </LessonSection>

      {/* ── STEP 1 ───────────────────────────────────────────────────── */}
      <LessonSection
        id="set-the-camera-up"
        title="Set the camera up in its own web page"
      >
        <p>
          None of the code below can fix a badly configured camera. Do this
          first, on the hardware, with the robot powered.
        </p>

        <ol className="ml-5 list-decimal space-y-4">
          <li>
            <strong>Switch the active pipeline to AprilTag.</strong> Open the
            Limelight web interface and pick the AprilTag pipeline. This is what
            turns on 3D pose estimation; a color-blob pipeline will never
            publish a botpose.
          </li>
          <li>
            <strong>Drop the exposure.</strong> Set it as low as the camera can
            go while still finding tags reliably. Low exposure means a short
            shutter, which means less motion blur while the robot is moving —
            and a blurred tag is a tag with a wrong answer, not a missing one.
          </li>
          <li>
            <strong>Enter the camera offsets.</strong> Measure where the camera
            sits relative to the center of the robot, and at what angle, and
            type those numbers in. AprilTag solving produces the{" "}
            <em>{"camera&apos;s "}</em> pose; the offsets are what turn it into
            the robot&apos;s pose. Get them wrong and every measurement you fuse
            is shifted by the same amount, forever.
            <div className="mt-3">
              <DocumentationButton
                href="https://docs.limelightvision.io/docs/docs-limelight/pipeline-apriltag/apriltag-3d#full-3d-tracking"
                title="Limelight — full 3D tracking and camera pose"
                icon={<Link className="w-5 h-5" />}
              />
            </div>
          </li>
          <li>
            <strong>Calibrate the lens.</strong> Run the ChArUco calibration
            with a printed board. This corrects lens distortion and pays off
            most at the edges of the image, which is exactly where tags are when
            you are lined up on something.
            <div className="mt-3">
              <DocumentationButton
                href="https://docs.limelightvision.io/docs/docs-limelight/getting-started/performing-charuco-camera-calibration"
                title="Limelight — ChArUco camera calibration"
                icon={<Link className="w-5 h-5" />}
              />
            </div>
          </li>
          <li>
            <strong>Write down the camera&apos;s name.</strong> The name in the
            web interface is the NetworkTables table the camera publishes to,
            and the Java code addresses the camera by that exact string. The
            default is <code>limelight</code>, which is what the branch uses.
          </li>
        </ol>

        <p>
          <strong>{"You should see: "}</strong> Hold a tag in front of the
          camera and the web interface reports the tag&apos;s ID. If it does
          not, no amount of Java will help — go back through the pipeline and
          exposure settings.
        </p>
      </LessonSection>

      {/* ── STEP 2 ───────────────────────────────────────────────────── */}
      <LessonSection
        id="add-limelighthelpers-java"
        title={
          <>
            Step 2 — Add <code>LimelightHelpers.java</code>
          </>
        }
        outlineLabel="Add LimelightHelpers.java"
      >
        <p>
          The Limelight publishes everything it knows to NetworkTables as raw
          arrays of numbers. <code>LimelightHelpers</code> is the single file
          Limelight ships to save you from reading those arrays by hand: it
          hands you a typed <code>PoseEstimate</code> instead. Copy it into{" "}
          <code>src/main/java/frc/robot/</code>.
        </p>

        <Box
          variant="alert-info"
          tag="NOTE · PACKAGES"
          title="Use the workshop&rsquo;s copy"
        >
          <p>
            Limelight ships its file against the current competition
            season&apos;s WPILib package names. The copy on this branch has been
            migrated to the 2027 <code>org.wpilib.*</code> packages, and its
            imports read <code>org.wpilib.math.geometry.Pose2d</code> and{" "}
            <code>org.wpilib.networktables.*</code>. Take the branch&apos;s
            version, not a fresh download, or nothing will import.
          </p>
        </Box>

        <p>
          Two pieces of it matter for this lesson. A <code>PoseEstimate</code>{" "}
          carries the fields the rest of the page uses — <code>pose</code>,{" "}
          <code>timestampSeconds</code>, <code>tagCount</code>,{" "}
          <code>avgTagDist</code> and <code>isMegaTag2</code>. And there is one
          small method that decides whether an estimate is worth looking at:
        </p>

        <CodeBlock
          language="java"
          title="LimelightHelpers.java — what counts as a valid estimate"
          code={`public static Boolean validPoseEstimate(PoseEstimate pose) {
  return pose != null && pose.rawFiducials != null && pose.rawFiducials.length != 0;
}`}
        />

        <p>
          A <em>fiducial</em> is one detected tag. So this is asking: did we get
          an answer at all, and did at least one tag go into it? When there is
          no data to read, <code>LimelightHelpers</code> hands back a default{" "}
          <code>PoseEstimate</code> — a pose sitting at the field origin with an
          empty fiducial array. That reading is the one this check exists to
          throw away, and it is the reason a camera that is switched off or
          misnamed produces silence rather than a robot that thinks it is parked
          in the corner of the field.
        </p>

        <p>
          <strong>{"You should see: "}</strong> Build the project. It compiles,
          and every import in the new file resolves. If you see red on{" "}
          <code>org.wpilib.*</code> imports, you took a fresh download instead
          of the branch&apos;s copy.
        </p>

        <CollapsibleSection title="Read the whole file: LimelightHelpers.java">
          <GitHubContent
            repository="Hemlock5712/Workshop-Code"
            branch="3-Limelight"
            filePath="src/main/java/frc/robot/LimelightHelpers.java"
            title="LimelightHelpers"
            description="The workshop's copy of Limelight's helper file, migrated to the WPILib 2027 packages. You do not need to read all 1,396 lines — this is the file the Limelight class below calls into."
          />
        </CollapsibleSection>
      </LessonSection>

      {/* ── STEP 3 ───────────────────────────────────────────────────── */}
      <LessonSection
        id="write-the-limelight-class"
        title={
          <>
            Step 3 — Write the <code>Limelight</code> class
          </>
        }
        outlineLabel="Write the Limelight class"
      >
        <p>
          Create <code>src/main/java/frc/robot/subsystems/Limelight.java</code>.
          It is about eighty lines, and it is worth building in pieces, because
          each piece answers a question.
        </p>

        <h3 className="display measure m-0 text-title">
          3a. Why it is not a <code>Mechanism</code>
        </h3>

        <p>
          A <code>Mechanism</code> exists so the scheduler can hand out
          exclusive ownership of a piece of hardware — one command at a time
          gets the arm. A camera drives nothing, so there is nothing to own and
          nothing to fight over. It is a plain class whose <code>update()</code>{" "}
          runs every loop, registered directly on the scheduler:
        </p>

        <CodeBlock
          language="java"
          title="Limelight.java — one camera per name, all on the scheduler"
          code={`public static void registerAll(DriveMechanism drivetrain, String... cameraNames) {
  for (String name : cameraNames) {
    Limelight camera = new Limelight(name, drivetrain);
    Scheduler.getDefault().addPeriodic(camera::update);
  }
  // One flush per loop sends every camera's heading write in a single batch.
  Scheduler.getDefault().addPeriodic(LimelightHelpers::Flush);
}`}
        />

        <ul className="ml-5 list-disc space-y-2">
          <li>
            <code>String... cameraNames</code> means &quot;any number of
            names&quot;. Call it with one, or with four.
          </li>
          <li>
            <code>Scheduler.getDefault().addPeriodic(...)</code> is the
            scheduler&apos;s escape hatch for per-loop work that is not a
            command. There is no <code>periodic()</code> method in Commands v3;
            this is how you get one.
          </li>
          <li>
            The constructor is <code>private</code>. <code>registerAll</code> is
            the only way to make a <code>Limelight</code>, which means it is not
            possible to create one and forget to schedule it.
          </li>
        </ul>

        <h3 className="display measure m-0 text-title">
          3b. Tell the camera your heading, then pick a solver
        </h3>

        <CodeBlock
          language="java"
          title="Limelight.java — the first half of update()"
          code={`// Tell the camera which way we are facing (MegaTag2 needs it). NoFlush means the shared
// flush in registerAll sends it.
double headingDegrees = drivetrain.getPose().getRotation().getDegrees();
LimelightHelpers.SetRobotOrientation_NoFlush(name, headingDegrees, 0, 0, 0, 0, 0);

// MegaTag1 for 2+ tags; switch to MegaTag2 for a single tag.
PoseEstimate estimate = LimelightHelpers.getBotPoseEstimate_wpiBlue(name);
if (LimelightHelpers.validPoseEstimate(estimate) && estimate.tagCount == 1) {
  estimate = LimelightHelpers.getBotPoseEstimate_wpiBlue_MegaTag2(name);
}`}
        />

        <p>
          The five zeros after the heading are yaw rate, pitch, pitch rate, roll
          and roll rate. The heading you pass is the yaw. This code only has a
          heading to offer, so the rest go in as zero.
        </p>

        <p>
          <code>_NoFlush</code> is a small efficiency detail worth understanding
          because it explains the second <code>addPeriodic</code> above.
          Normally a NetworkTables write is pushed out immediately. With four
          cameras that is four separate pushes per loop. The{" "}
          <code>NoFlush</code> version queues the write instead, and the shared{" "}
          <code>LimelightHelpers::Flush</code> sends all of them together, once.
        </p>

        <p>
          <code>_wpiBlue</code> means the pose comes back in
          blue-alliance-origin coordinates: (0, 0) is the blue corner no matter
          which alliance you are on. That matches{" "}
          <code>DriveMechanism.getPose()</code>, whose own javadoc says it
          &quot;does not flip when you are on red&quot;. Both sides of the
          fusion have to agree on where the origin is, and this is where they
          agree.
        </p>

        <h3 className="display measure m-0 text-title">
          3c. Two conditions, and that is the whole filter
        </h3>

        <CodeBlock
          language="java"
          title="Limelight.java — reject, or carry on"
          code={`// Skip if no tag is in view, or the tags are too far to trust.
if (!LimelightHelpers.validPoseEstimate(estimate)
    || estimate.avgTagDist > MAX_TAG_DISTANCE_METERS) {
  return;
}`}
        />

        <p>
          That is it. No tag in frame, or the average tag is further than{" "}
          <code>MAX_TAG_DISTANCE_METERS = 4.0</code> away, and the update
          returns without telling the drivetrain anything. Everything else gets
          through.
        </p>

        <Box variant="concept" title="Why so few checks">
          <p>
            The distance cut is a hard line because past about four meters a tag
            is a handful of pixels and the answer stops being useful at any
            weight. Everything short of that is handled by the trust numbers in
            3d instead of by rejection: a distant single-tag sighting is not
            thrown away, it is handed over with a large error bar so the
            estimator barely moves for it.
          </p>
          <p className="mt-3">
            Rejecting is cheap to write and expensive to debug — a filter that
            silently drops good data looks exactly like a camera that is not
            working. Weighting degrades instead of disappearing.
          </p>
        </Box>

        <h3 className="display measure m-0 text-title">
          3d. How much to trust it
        </h3>

        <p>
          The pose estimator does not want to be told &quot;the robot is
          here&quot;. It wants to be told &quot;the robot is here, give or take
          this much&quot;, and it blends that against what the wheels say. The
          &quot;give or take&quot; is a <strong>standard deviation</strong>.{" "}
          <code>DriveMechanism.addVisionMeasurement</code> documents its third
          argument as how much to trust the measurement in x, y and theta —
          meters and radians, and bigger numbers mean trust it less.
        </p>

        <p>
          Read it as an error bar. A value of <code>0.2</code> means &quot;I
          think the robot is within about 20 cm of this&quot;. A value of{" "}
          <code>2.0</code> means &quot;somewhere in this two-meter
          neighborhood&quot;, and the estimator will nudge rather than jump. A
          gigantic value means &quot;ignore this number entirely&quot;.
        </p>

        <CodeBlock
          language="java"
          title="Limelight.java — the constants"
          code={`// How much to trust a sighting: stdDev = coefficient * distance^1.2 / tagCount^2.
// Bigger stdDev = trust it less. Far tags count less; more tags count more.
private static final double XY_STD_DEV_COEFFICIENT = 0.333;
private static final double ROTATION_STD_DEV_COEFFICIENT = 1.5; // MegaTag1 heading trust
private static final double MAX_TAG_DISTANCE_METERS = 4.0; // skip far, noisy tags
private static final double IGNORE_VISION_HEADING = 9_999_999; // huge = let the gyro own heading`}
        />

        <CodeBlock
          language="java"
          title="Limelight.java — the second half of update()"
          code={`// Closer tags and more tags earn more trust. MegaTag1 gives a real heading; MegaTag2 leaves
// the heading to the gyro.
double distanceFactor = Math.pow(estimate.avgTagDist, 1.2);
double tagFactor = estimate.tagCount * estimate.tagCount;
double xyStdDev = XY_STD_DEV_COEFFICIENT * distanceFactor / tagFactor;
double headingStdDev =
    estimate.isMegaTag2
        ? IGNORE_VISION_HEADING
        : ROTATION_STD_DEV_COEFFICIENT * distanceFactor / tagFactor;
drivetrain.addVisionMeasurement(
    estimate.pose,
    estimate.timestampSeconds,
    VecBuilder.fill(xyStdDev, xyStdDev, headingStdDev));`}
        />

        <p>Four things are going on in those ten lines.</p>

        <ul className="ml-5 list-disc space-y-3">
          <li>
            <strong>Distance hurts, gently.</strong>{" "}
            <code>Math.pow(avgTagDist, 1.2)</code> grows a little faster than
            distance itself. Doubling the distance to the tag multiplies the
            error bar by about 2.3.
          </li>
          <li>
            <strong>Tag count helps, hard.</strong> The divisor is{" "}
            <code>tagCount * tagCount</code>. Two tags cut the error bar to a
            quarter, three tags to a ninth. This is the term that makes a
            two-tag sighting worth so much more than a one-tag sighting, and it
            is why camera aiming matters.
          </li>
          <li>
            <strong>X and Y get the same number.</strong>{" "}
            <code>VecBuilder.fill(xyStdDev, xyStdDev, headingStdDev)</code> —
            the model does not claim to know more about sideways error than
            forwards error.
          </li>
          <li>
            <strong>The heading is conditional.</strong> That <code>? :</code>{" "}
            is Java&apos;s if/else-that-produces-a-value. Read it as: if this is
            a MegaTag2 estimate, use <code>IGNORE_VISION_HEADING</code>;
            otherwise scale <code>ROTATION_STD_DEV_COEFFICIENT</code> the same
            way as the position.
          </li>
        </ul>

        <Box
          variant="alert-warning"
          tag="THE IMPORTANT ONE"
          title="Why the heading is thrown away on MegaTag2"
        >
          <p>
            <code>IGNORE_VISION_HEADING = 9_999_999</code> is not a tuned
            number. It is a way of writing &quot;infinity&quot; that the
            estimator will accept, and it means this measurement has no opinion
            about which way the robot faces.
          </p>
          <p className="mt-3">
            It has to be that way. A MegaTag2 pose was solved{" "}
            <em>using the heading you gave the camera two lines earlier</em>.
            Feeding that heading back in as if it were an independent
            measurement would be the robot agreeing with itself and getting more
            confident each loop. MegaTag1 heading is a real observation, so it
            gets a real weight; MegaTag2 heading is your own gyro handed back to
            you, so it gets ignored.
          </p>
        </Box>

        <h3 className="display measure m-0 text-title">
          What those numbers actually come out to
        </h3>

        <p>
          Working the formula by hand for a few realistic sightings makes the
          shape of it obvious. These are the position error bars only:
        </p>

        <div className="overflow-x-auto">
          <table className="w-full text-ui" style={{ color: "var(--tx2)" }}>
            <thead>
              <tr className="border-b" style={{ borderColor: "var(--rule)" }}>
                <th className="py-2 pr-4 text-left font-semibold">Tags seen</th>
                <th className="py-2 pr-4 text-left font-semibold">
                  Average distance
                </th>
                <th className="py-2 text-left font-semibold">
                  xy std dev handed to the estimator
                </th>
              </tr>
            </thead>
            <tbody>
              <tr className="border-b" style={{ borderColor: "var(--rule)" }}>
                <td className="py-2 pr-4">1</td>
                <td className="py-2 pr-4">1.0 m</td>
                <td className="py-2">0.33 m</td>
              </tr>
              <tr className="border-b" style={{ borderColor: "var(--rule)" }}>
                <td className="py-2 pr-4">1</td>
                <td className="py-2 pr-4">2.0 m</td>
                <td className="py-2">0.77 m</td>
              </tr>
              <tr className="border-b" style={{ borderColor: "var(--rule)" }}>
                <td className="py-2 pr-4">2</td>
                <td className="py-2 pr-4">2.0 m</td>
                <td className="py-2">0.19 m</td>
              </tr>
              <tr className="border-b" style={{ borderColor: "var(--rule)" }}>
                <td className="py-2 pr-4">2</td>
                <td className="py-2 pr-4">4.0 m</td>
                <td className="py-2">0.44 m</td>
              </tr>
              <tr className="border-b" style={{ borderColor: "var(--rule)" }}>
                <td className="py-2 pr-4">3</td>
                <td className="py-2 pr-4">4.0 m</td>
                <td className="py-2">0.20 m</td>
              </tr>
              <tr>
                <td className="py-2 pr-4">any</td>
                <td className="py-2 pr-4">4.1 m</td>
                <td className="py-2">rejected before it gets here</td>
              </tr>
            </tbody>
          </table>
        </div>

        <p>
          Those are calculated from the constants above, not read off a
          dashboard. Note the second and third rows: at the same distance, the
          second tag is worth four times the trust. Note also that a single tag
          at two meters carries a 0.77 m error bar — the estimator will barely
          move for it, which is the correct amount to move for a measurement
          that shaky.
        </p>

        <h3 className="display measure m-0 text-title">
          The timestamp is not optional
        </h3>

        <p>
          <code>addVisionMeasurement</code> takes{" "}
          <code>estimate.timestampSeconds</code>, not the current time. The
          picture was taken, processed on the camera, and sent over the network
          before your code ever saw it, so by the time you are holding this pose
          the robot has already moved. The estimator needs to know <em>when</em>{" "}
          the robot was there in order to fold the measurement in correctly.{" "}
          <code>DriveMechanism</code> documents the parameter as &quot;when the
          picture was taken&quot;, and <code>Limelight.java</code> passes the
          Limelight&apos;s own value straight through with no conversion.
        </p>

        <p>
          The correction has already been made for you inside{" "}
          <code>LimelightHelpers</code>, which builds the field as{" "}
          <code>(timestamp / 1000000.0) - (latency / 1000.0)</code> — the
          NetworkTables server timestamp in microseconds, less the camera&apos;s
          reported processing latency in milliseconds. That is the moment the
          shutter opened.
        </p>

        <p>
          <strong>{"You should see: "}</strong>
          <code>./gradlew build</code> succeeds. Nothing calls the class yet, so
          a clean build is the whole check at this point — it catches the
          mistyped field name and the missing import before you deploy.
        </p>

        <CollapsibleSection title="Read the whole file: Limelight.java">
          <GitHubContent
            repository="Hemlock5712/Workshop-Code"
            branch="3-Limelight"
            filePath="src/main/java/frc/robot/subsystems/Limelight.java"
            title="Limelight.java"
            description="The complete class: private constructor, registerAll, and one update() that writes the heading, picks MegaTag1 or MegaTag2, rejects on two conditions, weights by distance and tag count, and hands the result to the drivetrain."
          />
        </CollapsibleSection>
      </LessonSection>

      {/* ── STEP 4 ───────────────────────────────────────────────────── */}
      <LessonSection
        id="wire-it-up-in"
        title={
          <>
            Step 4 — Wire it up in <code>Robot</code>
          </>
        }
        outlineLabel="Wire it up in Robot"
      >
        <p>
          One line, in <code>Robot</code>&apos;s constructor. Not in an OpMode —
          OpMode bindings are torn down on a mode switch, and vision has to keep
          correcting odometry in teleop, in autonomous and while disabled.
        </p>

        <CodeBlock
          language="java"
          title="Robot.java — inside the constructor"
          code={`// Vision: set up every Limelight in one call. The names must match each camera's name in
// NetworkTables. Each camera then corrects the drivetrain's odometry with AprilTag sightings
// every loop. Does nothing in simulation (no camera there).
Limelight.registerAll(drivetrain, "limelight");`}
        />

        <p>
          <code>drivetrain</code> is the <code>public final</code> field{" "}
          <code>Robot</code> already owns, and{" "}
          <code>&quot;limelight&quot;</code> is the camera name from step 1. A
          second camera is a second string:{" "}
          <code>
            registerAll(drivetrain, &quot;limelight-front&quot;,
            &quot;limelight-back&quot;)
          </code>
          . You also need <code>import frc.robot.subsystems.Limelight;</code> at
          the top of the file — that and this line are the entire change to{" "}
          <code>Robot.java</code>.
        </p>

        <Box variant="concept" title="Which way the dependency points">
          <p>
            <code>Limelight</code> holds a reference to{" "}
            <code>DriveMechanism</code>, not the other way round. The camera
            reads <code>drivetrain.getPose()</code> for the heading it feeds
            MegaTag2, and calls{" "}
            <code>drivetrain.addVisionMeasurement(...)</code> to hand back its
            correction. The drivetrain never knows a camera exists — which is
            why adding, removing or renaming cameras is a one-line change in{" "}
            <code>Robot</code>.
          </p>
        </Box>

        <p>
          <strong>{"You should see: "}</strong> Deploy, and the robot code stays
          up — no crash on startup, and the Driver Station reports robot code as
          normal. A camera that is not on the network does not throw; it just
          never sends a correction.
        </p>

        <CollapsibleSection title="Read the whole file: Robot.java">
          <GitHubContent
            repository="Hemlock5712/Workshop-Code"
            branch="3-Limelight"
            filePath="src/main/java/frc/robot/Robot.java"
            pr={{ number: 9, focusFile: "Robot.java" }}
          />
        </CollapsibleSection>
      </LessonSection>

      {/* ── DID IT WORK ──────────────────────────────────────────────── */}
      <LessonSection id="did-it-work" title="Did it work?">
        <p>
          All of this happens on the real robot. Deploy, put the robot on the
          floor with a tag somewhere it can see, and open the drivetrain
          telemetry you set up in the Logging lesson —{" "}
          <code>Drivetrain/Pose</code> in NetworkTables.
        </p>

        <ol className="ml-5 list-decimal space-y-3">
          <li>
            Park the robot roughly two meters from a tag, square to the field,
            and note where <code>Drivetrain/Pose</code> says it is.
          </li>
          <li>
            Cover the camera with your hand and push the robot a meter sideways.{" "}
            <strong>{"You should see: "}</strong> the pose moves, because the
            wheels still turn. Uncover the camera.{" "}
            <strong>{"You should see: "}</strong> the pose settles toward the
            place the tag says the robot is, over a second or so rather than in
            one frame. That gradual pull is the error bar doing its job.
          </li>
          <li>
            Drive the robot around for thirty seconds with the camera covered,
            spinning and scrubbing the wheels on purpose. Odometry will drift
            noticeably. Uncover the camera in front of a tag.{" "}
            <strong>{"You should see: "}</strong> the pose walk back to the
            truth.
          </li>
          <li>
            Back away from the tag past four meters.{" "}
            <strong>{"You should see: "}</strong> corrections stop entirely.
            That is <code>MAX_TAG_DISTANCE_METERS</code>, working as designed.
          </li>
          <li>
            Line the robot up so it sees two tags at once, then move so it sees
            only one. <strong>{"You should see: "}</strong> the two-tag pose is
            visibly steadier. With one tag the correction is weaker and slower,
            because <code>tagCount * tagCount</code> is 1 instead of 4.
          </li>
          <li>
            With a single tag in view, watch the rotation component of{" "}
            <code>Drivetrain/Pose</code> while a correction lands.{" "}
            <strong>{"You should see: "}</strong> the position moves and the
            heading does not budge. That is <code>IGNORE_VISION_HEADING</code>{" "}
            keeping MegaTag2 out of the heading.
          </li>
        </ol>

        <Box
          variant="alert-info"
          tag="IF IT DIDN'T WORK"
          title="A pose that never moves, a pose that teleports, and single-tag weirdness"
        >
          <ul className="ml-4 list-disc space-y-3">
            <li>
              <strong>
                The pose never changes, no matter what the camera can see.
              </strong>{" "}
              Almost always the name. The string in{" "}
              <code>registerAll(drivetrain, &quot;limelight&quot;)</code> has to
              match the camera&apos;s NetworkTables name character for character
              — <code>limelight-front</code> is a different camera from{" "}
              <code>limelight</code>, and a camera that is not there publishes
              nothing, so <code>validPoseEstimate</code> returns false and{" "}
              <code>update()</code> returns every loop with no complaint. Check
              the NetworkTables tree for the table name the camera is actually
              publishing to. (If you are in the simulator, this is also the
              expected behavior — there is no camera there.)
            </li>
            <li>
              <strong>
                The pose jumps to somewhere the robot obviously is not.
              </strong>{" "}
              Camera offsets. The solver returns where the <em>camera</em> is;
              the offsets you typed into the web interface are what turn that
              into where the <em>robot</em> is, and an error there shifts every
              single measurement by the same amount. Measure again from the
              center of the robot, and check the angle as carefully as the
              distances. If the pose lands on the far side of the field, check
              you are not mixing a red-origin pose into a blue-origin estimator
              — the code asks for <code>_wpiBlue</code> for a reason.
            </li>
            <li>
              <strong>
                Position corrects fine with two tags and goes strange with one.
              </strong>{" "}
              That is the MegaTag2 path, and MegaTag2 believes whatever heading
              you sent it. A gyro that is off by ten degrees produces a position
              that is confidently wrong. Seed the heading properly — the
              distinction between resetting odometry to a known field pose and{" "}
              <code>seedFieldCentric()</code>, which only rotates the
              driver&apos;s idea of forward, is on the Swerve Calibration page,
              and this is where it bites.
            </li>
          </ul>
        </Box>
      </LessonSection>

      {/* ── REFERENCE ────────────────────────────────────────────────── */}
      <LessonSection id="reference" title="Reference">
        <div className="grid md:grid-cols-2 gap-4">
          <DocumentationButton
            href="https://github.com/Hemlock5712/2027-Template/blob/2027-dev/src/main/java/frc/robot/subsystems/vision/Limelight.java"
            title="Limelight.java in the 2027-Template"
            icon={<GitBranch className="w-5 h-5" />}
          />
          <DocumentationButton
            href="https://docs.limelightvision.io/docs/docs-limelight/apis/complete-networktables-api"
            title="Limelight NetworkTables API"
            icon={<Link className="w-5 h-5" />}
          />
          <DocumentationButton
            href="https://docs.wpilib.org/en/stable/docs/software/vision-processing/apriltag/apriltag-intro.html"
            title="WPILib AprilTag Guide"
            icon={<Tag className="w-5 h-5" />}
          />
        </div>

        <p>
          The template&apos;s version of this class is the same code in a{" "}
          <code>subsystems/vision/</code> package — same constants, same two
          conditions, same MegaTag1-first logic. If you graduate this project
          onto the team template, that is where the file lands.
        </p>
      </LessonSection>

      <section className="flex flex-col gap-6">
        <AlphaStatusNote />

        <Quiz
          questions={[
            {
              id: 1,
              question:
                "The camera has exactly one AprilTag in frame. Which solver does Limelight.java end up using, and why?",
              options: [
                "MegaTag1, because it is always more accurate",
                "MegaTag2, because with one tag the tag geometry cannot pin down heading reliably, so the code hands the camera the gyro heading instead",
                "Neither — a single-tag estimate is rejected",
                "Both, and it averages them",
              ],
              correctAnswer: 1,
              explanation:
                "The code asks for MegaTag1 first. If that estimate is valid and tagCount == 1, it re-fetches as MegaTag2. MegaTag1 solves heading from the tags themselves, which is shaky off a single tag; MegaTag2 takes your heading as given and solves only position.",
            },
            {
              id: 2,
              question:
                "Which line matches the trust model in Limelight.java on 3-Limelight?",
              options: [
                "0.5 * Math.pow(avgTagDist, 2.0) / tagCount",
                "0.333 * Math.pow(avgTagDist, 1.2) / (tagCount * tagCount)",
                "avgTagDist / tagCount",
                "A fixed 0.1, tuned once at the start of the season",
              ],
              correctAnswer: 1,
              explanation:
                "XY_STD_DEV_COEFFICIENT = 0.333, distanceFactor = Math.pow(estimate.avgTagDist, 1.2), and tagFactor = tagCount * tagCount. The rotation term uses the same two factors with ROTATION_STD_DEV_COEFFICIENT = 1.5.",
            },
            {
              id: 3,
              question:
                "Why is headingStdDev set to IGNORE_VISION_HEADING (9,999,999) whenever the estimate came from MegaTag2?",
              options: [
                "MegaTag2 does not report a heading at all, so the value is a placeholder",
                "A MegaTag2 pose was solved using the heading the code sent the camera two lines earlier, so feeding it back as a measurement would be the robot confirming its own guess",
                "The number disables the pose estimator until the next loop",
                "It is a tuned value that happens to work well on carpet",
              ],
              correctAnswer: 1,
              explanation:
                "MegaTag2's heading is your gyro heading handed back to you. Treating it as an independent measurement would make the estimator more and more confident in an error it created. A huge standard deviation is how you say 'this measurement has no opinion about heading'.",
            },
            {
              id: 4,
              question:
                "How many conditions can make update() return without sending anything to the drivetrain, and what are they?",
              options: [
                "Five: field boundary, ambiguity, Z-height, distance and tag count",
                "Two: the estimate is not valid (no tag in frame), or avgTagDist is greater than MAX_TAG_DISTANCE_METERS = 4.0",
                "One: the pose is outside the field perimeter",
                "None — every estimate is passed on and the standard deviations sort it out",
              ],
              correctAnswer: 1,
              explanation:
                "The whole filter is `if (!LimelightHelpers.validPoseEstimate(estimate) || estimate.avgTagDist > MAX_TAG_DISTANCE_METERS) return;`. Everything else is handled by weighting rather than rejection — a poor sighting gets a large error bar instead of being discarded.",
            },
            {
              id: 5,
              question:
                "The robot sees two tags at 2 m instead of one tag at 2 m. What happens to the position standard deviation?",
              options: [
                "It halves, because tagCount doubles",
                "It drops to a quarter, because the divisor is tagCount * tagCount",
                "It stays the same — only distance affects it",
                "It doubles, because more tags means more disagreement",
              ],
              correctAnswer: 1,
              explanation:
                "tagFactor = tagCount * tagCount, so two tags divide by 4 and three tags divide by 9. Working the numbers: one tag at 2 m gives about 0.77 m, two tags at the same distance give about 0.19 m. This is why camera aiming matters so much.",
            },
            {
              id: 6,
              question:
                "Why does Limelight.java pass estimate.timestampSeconds instead of the current time?",
              options: [
                "It is only used for logging",
                "The picture was taken before the code saw it, and the estimator has to fold the measurement in at the moment the robot was actually there",
                "The pose estimator rejects measurements without a timestamp field",
                "It keeps the camera and the robot controller clocks in sync",
              ],
              correctAnswer: 1,
              explanation:
                "Capture, processing and network transport all take time, so by the time your code holds the pose the robot has moved. DriveMechanism documents the parameter as 'when the picture was taken'. The Limelight's own value is passed straight through with no conversion.",
            },
            {
              id: 7,
              question:
                "Why is Limelight a plain class registered with Scheduler.getDefault().addPeriodic(...) rather than a Mechanism?",
              options: [
                "Mechanisms are only for swerve drivetrains",
                "It drives no hardware, so there is no exclusive ownership for the scheduler to hand out — it only needs to run once per loop",
                "Cameras cannot be required by commands in Commands v3",
                "It would work as a Mechanism, but addPeriodic is faster",
              ],
              correctAnswer: 1,
              explanation:
                "A Mechanism exists so one command at a time can own a piece of hardware. A camera actuates nothing, so there is nothing to own. addPeriodic is the scheduler's escape hatch for per-loop work that is not a command — there is no periodic() method in Commands v3.",
            },
          ]}
        />
      </section>

      {/* ── WHAT'S NEXT ──────────────────────────────────────────────── */}
      <LessonSection id="what-s-next" title="What's next">
        <p>
          Now that the drivetrain knows where it is, you can work out how far
          away the goal is and pick a flywheel speed to match — a shot that
          adjusts itself instead of one speed that only works from one spot.
        </p>

        <Box
          variant="alert-warning"
          tag="BRANCH WARNING"
          title="That lesson is a side branch"
        >
          <p>
            <code>4-DynamicFlywheel</code> sits one commit on top of{" "}
            <code>3-Limelight</code>, and nothing after it inherits that work —{" "}
            <code>5-DriveToPoint</code> forks off <code>2-Logging</code> instead
            and has neither the flywheel nor its helper class in its tree. The
            flywheel lesson is worth doing and it is skippable. If you do it,
            keep a copy of the branch somewhere before you move on to Drive to
            Point.
          </p>
        </Box>
      </LessonSection>
    </PageTemplate>
  );
}
