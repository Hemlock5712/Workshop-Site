import PageTemplate from "@/components/PageTemplate";
import FigureGrid from "@/components/lesson/FigureGrid";
import { MarginNote, Split } from "@/components/lesson/Prose";
import LessonSection from "@/components/lesson/LessonSection";
import KeyConceptSection from "@/components/KeyConceptSection";
import Box from "@/components/Box";
import ImageBlock from "@/components/ImageBlock";
import DocumentationButton from "@/components/DocumentationButton";
import Quiz from "@/components/Quiz";
import Link from "next/link";
import { Book } from "lucide-react";

const linkClass = "underline hover:no-underline font-medium";

export default function SwervePrerequisites() {
  return (
    <PageTemplate
      title="How Swerve Works"
      lede="Workshop #3 builds a swerve drive: a robot that can slide sideways, drive diagonally and spin, all at the same time. Almost none of the hard part is code you write. Phoenix Tuner X generates the drivetrain and the math behind it."
      needs={[
        <>
          Nothing installed, nothing typed. There is no code on this page and no
          branch to check out.
        </>,
        <>
          <Link href="/hardware" className={linkClass}>
            Hardware Setup
          </Link>{" "}
          helps, because this page uses the words CAN bus, CANcoder and CANivore
          without re-explaining them. That page owns the hardware.
        </>,
      ]}
      time="About 15 minutes of reading"
    >
      <Split>
        <KeyConceptSection
          description={[
            "What you do have to understand is how a swerve robot answers two questions, which way is forward, and where am I on the field. Four ideas cover that, and every page after this one leans on all four.",
          ]}
          concept="A swerve robot tracks a position on the field, and the driver's forward is not the field's forward."
        />
        <MarginNote label="WHAT YOU'LL GET">
          The vocabulary the next six pages assume: field-centric driving,{" "}
          <code>Pose2d</code>, the field&apos;s coordinate frame, and odometry.
        </MarginNote>
      </Split>

      {/* ── 1. WHAT SWERVE IS ────────────────────────────────────────── */}
      <LessonSection
        id="what-makes-a-drive-quot-swerve"
        title='What makes a drive "swerve"'
      >
        <p>
          On most drivetrains the wheels are bolted facing one direction. To go
          sideways you first have to turn the whole robot. A swerve drive puts a
          module at each of the four corners, and each module has{" "}
          <strong>two motors</strong>. One spins the wheel, the other points it.
        </p>

        <p>
          Because every wheel can point wherever it likes, the robot can travel
          one way while facing another. The two are independent. It can drive
          straight down the field while slowly spinning. The word for that is{" "}
          <strong>holonomic</strong> motion, and it is the whole appeal.
        </p>

        <Box variant="concept" title="You never write the swerve math">
          <p>
            Turning &quot;move 2 meters per second to the left while turning
            slowly&quot; into eight motor commands is called{" "}
            <strong>kinematics</strong>. Tuner X&apos;s swerve generator writes
            it for you, in two files you will meet on the next page.{" "}
            <code>TunerConstants.java</code> holds every device ID, gear ratio,
            wheel radius and gain. <code>CommandSwerveDrivetrain.java</code> is
            the drivetrain itself, and its own comment says it &quot;owns the
            hardware and odometry&quot;.
          </p>
          <p className="mt-3">
            You ask for a chassis speed. Those two files decide what all eight
            motors do. Nothing in Workshop #3 asks you to compute a wheel angle.
          </p>
        </Box>

        <p>
          The parts are the same family you met on{" "}
          <Link href="/hardware" className={linkClass}>
            Hardware Setup
          </Link>
          : Kraken motors, a CANcoder in each module to report the steering
          angle, and a CANivore carrying the bus. Swerve adds one device the arm
          never needed: a <strong>Pigeon 2 gyro</strong>, which reports which
          way the robot is facing. <code>TunerConstants.java</code> lists it as{" "}
          <code>kPigeonId</code>, alongside three device IDs and a corner
          position for each of the four modules.
        </p>
      </LessonSection>

      {/* ── 2. FIELD-CENTRIC VS ROBOT-CENTRIC ────────────────────────── */}
      <LessonSection id="which-way-is-forward" title="Driver forward">
        <p>
          You push the left stick away from you. Which way does the robot go?
          There are two answers, and a swerve robot has to be told which one you
          meant.
        </p>

        <FigureGrid
          cols={2}
          items={[
            {
              label: "Answer 1",
              term: "Robot-centric",
              body: (
                <>
                  Forward means the direction the robot&apos;s front is
                  pointing. Spin the robot and forward spins with it. Fine while
                  the robot is pointing away from you; the moment it turns
                  around, its left is your right and every input is mirrored.
                  Needs no gyro: the robot does not have to know its heading to
                  drive relative to itself.
                </>
              ),
            },
            {
              label: "Answer 2",
              term: "Field-centric",
              body: (
                <>
                  Forward means down the field, away from your driver station,
                  no matter which way the robot is facing. Push the stick away
                  from you and the robot moves away from you, even if it has to
                  drive backwards to do it. This is what makes a swerve robot
                  drivable by a human. It needs the gyro, because the code has
                  to subtract the robot&apos;s heading out of your request.
                </>
              ),
            },
          ]}
        />

        <p>
          The workshop code only ever drives field-centric. The teleop OpMode
          you get on the next page builds one{" "}
          <code>SwerveRequest.FieldCentric</code> and hands it to the
          drivetrain&apos;s default command. No file in the workshop code builds
          a robot-centric request.
        </p>

        <Box
          variant="alert-warning"
          tag="WATCH OUT · ALLIANCE"
          title="The driver's forward flips with alliance color. The field frame does not."
        >
          <p>
            Two drivers stand at opposite ends of the field. Both should be able
            to push the stick away and watch the robot go away. So the code
            flips what &quot;forward&quot; means depending on which side you are
            on. <code>DriveMechanism</code> registers{" "}
            <code>applyOperatorPerspective</code> to run every loop, with the
            comment{" "}
            <em>
              &quot;Every loop, check which alliance we are on so
              &apos;forward&apos; faces the right way.&quot;
            </em>
          </p>
          <p className="mt-3">
            The generated drivetrain spells out the two cases.{" "}
            <em>Blue sees forward as 0 degrees, toward the red wall</em>, and{" "}
            <em>red sees forward as 180 degrees, toward the blue wall</em>.
          </p>
          <p className="mt-3">
            Hold on to this, because the next section is the other half of it:{" "}
            <strong>
              only the driver&apos;s forward flips. The field&apos;s coordinates
              never do.
            </strong>
          </p>
        </Box>
      </LessonSection>

      {/* ── 3. POSE2D AND THE FIELD FRAME ────────────────────────────── */}
      <LessonSection
        id="where-am-i-pose2d"
        title={
          <>
            Where am I? <code>Pose2d</code>
          </>
        }
        outlineLabel="Where am I? Pose2d"
      >
        <p>
          A <code>Pose2d</code> is three numbers in one package. It answers{" "}
          <em>where on the field</em> and <em>{"which way around "}</em> at the
          same time. The robot&apos;s current position is a <code>Pose2d</code>.
          So is a spot you want to drive to.
        </p>

        <ImageBlock
          src="/images/drive-to-point-field.png"
          alt="FRC field coordinate system: X runs the length of the field away from the blue driver station, Y runs across it to the left"
          width={1024}
          height={469}
          caption="X runs down the length of the field, Y runs across it. The origin is the blue alliance corner, for both alliances."
        />

        <ul className="ml-5 list-disc space-y-2">
          <li>
            <strong>X</strong>: meters down the length of the field, increasing
            away from the blue driver station.
          </li>
          <li>
            <strong>Y</strong>: meters across the field, increasing to the left.
          </li>
          <li>
            <strong>Rotation</strong>: a <code>Rotation2d</code>, the direction
            the front of the robot points. 0° faces down the field along
            increasing X. You build one with{" "}
            <code>Rotation2d.fromDegrees(180)</code>, or take a ready-made
            constant like <code>Rotation2d.kZero</code>.
          </li>
        </ul>

        <p>
          They travel together for a reason. A position with no heading does not
          say which way the robot points when it arrives. A heading with no
          position does not say where it is.
        </p>

        <Box
          variant="alert-warning"
          tag="WATCH OUT · ORIGIN"
          title="(0, 0) is the blue corner, even when you are on red"
        >
          <p>
            The <code>getPose()</code> method in <code>DriveMechanism</code>{" "}
            says it in its own comment:{" "}
            <em>
              &quot;The robot&apos;s position on the field, from odometry. (0,
              0) is always the blue alliance corner. It does not flip when you
              are on red.&quot;
            </em>
          </p>
          <p className="mt-3">
            This is the one that catches people, because the section above said
            forward <em>{"does "}</em> flip. Both are true, and they are about
            different things. The driver&apos;s forward flips so driving feels
            the same from either end of the field. The coordinate frame stays
            put so that two poses can be compared at all. A red robot parked
            against its own wall reports a large X, not zero.
          </p>
          <p className="mt-3">
            Every pose in Workshops #3 and #4 is measured from that same blue
            corner. That covers what odometry reports, what the camera
            estimates, and the target you hand a drive command.
          </p>
        </Box>
      </LessonSection>

      {/* ── 4. ODOMETRY ──────────────────────────────────────────────── */}
      <LessonSection
        id="odometry-and-why-it-goes-wrong"
        title="Odometry, and why it goes wrong"
      >
        <p>
          <strong>{"Odometry "}</strong> is how the robot keeps a running answer
          to &quot;where am I.&quot; Every loop, the drivetrain reads how far
          each wheel turned and where it was pointing. It works out how far the
          robot moved in that slice of time and adds it to the pose. You never
          call any of that. You read the answer with{" "}
          <code>drivetrain.getPose()</code>.
        </p>

        <p>
          It starts out excellent and gets worse all match, because it is
          addition and it never subtracts. Three things it cannot see:
        </p>

        <ul className="ml-5 list-disc space-y-2">
          <li>
            <strong>Slip:</strong> A wheel spinning on carpet without moving the
            robot still reports distance. Odometry counts it as travel.
          </li>
          <li>
            <strong>A wheel radius that is slightly wrong:</strong> Distance per
            rotation comes from a number in <code>TunerConstants.java</code>. If
            that number is off by 1 percent, every distance is off by 1 percent.
            That is 10 centimeters for every 10 meters, always the same way.
          </li>
          <li>
            <strong>Being moved without driving:</strong> Get shoved, get
            pinned, get lifted: the wheels do not turn, so as far as odometry is
            concerned nothing happened.
          </li>
        </ul>

        <p>
          Nothing in odometry ever looks at the field, so there is no moment
          where it notices it is wrong. That is what &quot;drift&quot; means
          here: not noise, but an error that only accumulates.
        </p>

        <Box variant="concept" title="Two fixes, and they are the next pages">
          <ul className="ml-4 list-disc space-y-2">
            <li>
              <strong>Measure the numbers it is built on.</strong> Wheel radius,
              top speed, steering offsets: that is{" "}
              <Link href="/swerve-calibration" className={linkClass}>
                Swerve Calibration
              </Link>
              . Better inputs mean slower drift.
            </li>
            <li>
              <strong>Give it something that does look at the field.</strong> A
              camera reading AprilTags knows where it is in absolute terms.{" "}
              <code>DriveMechanism</code> already has the door for it:{" "}
              <code>addVisionMeasurement(...)</code>. Its own comment describes
              it as &quot;Feeds a camera position estimate into the drivetrain
              so it can correct odometry.&quot; That is{" "}
              <Link href="/vision-implementation" className={linkClass}>
                Vision
              </Link>
              .
            </li>
          </ul>
          <p className="mt-3">
            Until one of those happens, treat the pose as{" "}
            <em>distance and direction traveled since the code started</em>,
            which is honest and still useful.
          </p>
        </Box>
      </LessonSection>

      {/* ── 5. WHERE THIS LANDS ──────────────────────────────────────── */}
      <LessonSection
        id="where-each-idea-shows-up"
        title="Where each idea shows up"
      >
        <ul className="ml-5 list-disc space-y-2">
          <li>
            <strong>Field-centric driving</strong>: the next page. The teleop
            default command is a field-centric request wired straight to the
            sticks.
          </li>
          <li>
            <strong>Odometry and drift</strong>: the two pages named in the box
            above.
          </li>
          <li>
            <strong>
              <code>Pose2d</code> and <code>Rotation2d</code>
            </strong>
            : Drive to Point and the autonomous page, where a pose stops being a
            reading and becomes a destination.
          </li>
          <li>
            <strong>The blue-corner frame</strong>: all of the above. It is why
            the camera is asked for a blue-origin estimate. It is also why a
            drive command pins its velocities to that frame, not the
            driver&apos;s.
          </li>
        </ul>

        <p>
          Next you open Phoenix Tuner X, point it at the four modules, and let
          it generate the drivetrain.
        </p>

        <DocumentationButton
          href="https://v6.docs.ctr-electronics.com/en/stable/docs/tuner/tuner-swerve/index.html"
          title="CTRE: Tuner X Swerve Project Generator"
          icon={<Book className="w-5 h-5" />}
        />
      </LessonSection>

      <Quiz
        questions={[
          {
            id: 1,
            question:
              "You are driving field-centric. The robot is facing your driver station: its front points at you. You push the left stick away from yourself. What does the robot do?",
            options: [
              "Nothing, until you press the seed-field-centric button",
              "Drives toward you, because forward means the direction the robot faces",
              "Drives away from you, backwards, because forward is a field direction and not the robot's",
              "Spins to face away first, then drives",
            ],
            correctAnswer: 2,
            explanation:
              "Field-centric means forward is fixed to the field, not to the robot. The stick asks for motion away from your driver station, so the robot goes that way regardless of which direction its front happens to point. Robot-centric is the other answer: there, forward would follow the robot's nose and it would drive at you.",
          },
          {
            id: 2,
            question:
              "What does field-centric control need that robot-centric control does not?",
            options: [
              "A gyro, so the code knows the robot's heading",
              "A CANivore",
              "Closed-loop drive motors",
              "A camera",
            ],
            correctAnswer: 0,
            explanation:
              "To turn a field direction into wheel motion, the code has to subtract the robot's current heading out of your request, so it needs to know that heading. That is the Pigeon 2 gyro, listed in TunerConstants.java as kPigeonId. Robot-centric needs no heading, because everything is already relative to the robot.",
          },
          {
            id: 3,
            question:
              "Your robot is on the red alliance. Your driver pushes the stick away from the red driver station and the robot moves away from them. What happened to the coordinate frame odometry reports?",
            options: [
              "It rotated 90 degrees",
              "Odometry is disabled on the red alliance",
              "It flipped too: (0, 0) moved to the red corner",
              "Nothing. (0, 0) stays in the blue corner; only the driver's idea of forward flipped",
            ],
            correctAnswer: 3,
            explanation:
              'Two separate things. applyOperatorPerspective flips what the sticks call forward, 0 degrees on blue, 180 on red, so driving feels the same from either end. The pose frame never moves: DriveMechanism.getPose() says "(0, 0) is always the blue alliance corner. It does not flip when you are on red." A red robot at its own wall reports a large X.',
          },
          {
            id: 4,
            question: "What three things does a Pose2d hold?",
            options: [
              "Speed, acceleration, and heading",
              "An X in meters, a Y in meters, and a heading as a Rotation2d",
              "Three wheel angles",
              "X, Y, and Z position in meters",
            ],
            correctAnswer: 1,
            explanation:
              "A Pose2d answers both at once. X meters down the field, Y meters across it, and a Rotation2d for the way the front of the robot points. Both the robot's current position and a target you drive to are written as one.",
          },
          {
            id: 5,
            question: "Why does odometry drift over the course of a match?",
            options: [
              "It adds up wheel motion and never checks against the field, so slip and small measurement errors accumulate and are never corrected",
              "The CAN bus drops messages",
              "It resets to zero every time the robot is disabled",
              "The gyro loses power between modes",
            ],
            correctAnswer: 0,
            explanation:
              "Odometry is addition. A slipping wheel still reports distance. A wheel radius off by 1 percent makes every distance off by 1 percent. A shoved robot moves without turning a wheel. Nothing in the calculation ever looks at the field, so the error only grows. Calibration slows it down; vision is what actually corrects it.",
          },
        ]}
      />
    </PageTemplate>
  );
}
