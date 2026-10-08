import PageTemplate from "@/components/PageTemplate";
import LessonSection from "@/components/lesson/LessonSection";
import Box from "@/components/Box";
import DocumentationButton from "@/components/DocumentationButton";
import Quiz from "@/components/Quiz";
import { MarginNote, ProseBlock, Split } from "@/components/lesson/Prose";
import Link from "next/link";
import { Book } from "lucide-react";
import { lessonMetadata } from "@/lib/lessonMetadata";

export const metadata = lessonMetadata("/swerve-calibration");

/**
 * Split in October 2026. This page ran 14.9 minutes across 18 steps, and its
 * own header had been calling it two lessons since the budget rewrite. The
 * seam is the floor. This half is the bench: the three kinds of zeroing, the
 * module offsets, and the steer gains, all with the robot square and Tuner X
 * reading sensors. The carpet half (wheel radius, top speed, slip current, the
 * drive loop and the deadband) is `/swerve-drive-tuning`, with its square
 * check and five of the old quiz questions.
 *
 * The id `three-things-that-all-sound-like` is linked from
 * `/swerve-drive-project` and named by `/vision-implementation`. Do not rename.
 *
 * Every number that was here and stayed here is unchanged: the 5 cm over six
 * meters per half degree, kP 100 / kD 0.5 / kS 0.1 / kV 1.91. The new check
 * and the new quiz cover only what this half teaches. The old Q2, on
 * `seedFieldCentric()`, duplicated `/swerve-drive-project` Q5 and became a
 * question about `resetPose` instead.
 */
export default function SwerveCalibration() {
  return (
    <PageTemplate
      title="Swerve Calibration"
      lede="The project you generated holds offsets from wheels you held straight by eye. This lesson zeroes the four modules against a straight edge and tunes the motors that steer them. No Java."
      needs={[
        <>
          A swerve robot you can drive, from{" "}
          <strong>Swerve Project Generator</strong>.
        </>,
        <>AdvantageScope connected to the robot, for live plots.</>,
        <>Phoenix Tuner X, and a long straight edge.</>,
      ]}
      time="12 minutes"
    >
      {/* The id is a link target for the three-way "zeroing" distinction, so
          other pages can point here instead of restating it. Do not rename. */}
      <LessonSection
        id="three-things-that-all-sound-like"
        title="Three kinds of zeroing"
      >
        <p>
          Three operations in the swerve code all get called resetting or
          seeding. Mix them up and you get a robot that drives beautifully and
          has no idea where it is.
        </p>
        <p>
          <code>seedFieldCentric()</code>, on the left bumper, changes which way
          the sticks call forward: whatever the robot faces now becomes forward.
          Every loop, <code>applyOperatorPerspective()</code> sets that same
          forward from alliance color: 0&deg; on blue and 180&deg; on red.
          Neither supplies an x or a y.
        </p>
        <p>
          <code>resetPose(Pose2d)</code> moves the pose itself: x, y and heading
          in meters from the blue corner. It exists on the Phoenix 6 drivetrain,
          but <code>DriveMechanism</code> does not expose it and nothing calls
          it. Until <strong>Vision</strong> in Workshop 6, read{" "}
          <code>Drivetrain/Pose</code> as distance traveled since boot.
        </p>
      </LessonSection>

      <LessonSection id="zero-the-modules" title="Zero the modules">
        <p>
          Each module has a CANcoder reading which way its wheel points, and an
          offset saying which reading counts as straight ahead. The four{" "}
          <code>k*EncoderOffset</code> constants in your file came from the
          wheels you held straight by eye in the generator. A straight edge does
          better.
        </p>
        <ol className="ml-5 list-decimal space-y-2">
          <li>
            Disable the robot. Nothing should be commanding a module while you
            set it.
          </li>
          <li>
            Press a straight edge flat along one side so both wheels on that
            side sit against it, then do the other side. By eye is not close
            enough: half a degree of steering error walks the robot 5 cm
            sideways over six meters.
          </li>
          <li>
            Check which way each module faces. CTRE marks this one important:
            every module&apos;s bevel gear has to face the vertical center of
            the robot. A module that is straight but flipped zeroes 180&deg;
            off, and the drive verification tests fail later without saying why.
          </li>
          <li>
            Holding the wheels straight, run the calibration step in the Tuner X
            swerve generator. It reads all four CANcoders where they sit and
            writes the offset constants for you.
          </li>
        </ol>
        <Split>
          <ProseBlock>
            <p>
              Generate <code>TunerConstants.java</code> again and replace your
              copy, the way you did on the last page, then redeploy.
            </p>
          </ProseBlock>
          <MarginNote label="Glue them down">
            These zeros are stored against a physical sensor position. A
            CANcoder that shifts two degrees in a collision makes all four
            wrong, and it looks like bad odometry.
          </MarginNote>
        </Split>
        <DocumentationButton
          href="https://v6.docs.ctr-electronics.com/en/latest/docs/tuner/tuner-swerve/index.html"
          title="CTRE: Tuner X Swerve Project Generator"
          icon={<Book className="w-5 h-5" />}
        />
      </LessonSection>

      <LessonSection id="steer-gains" title="Tune the steer gains">
        <p>
          A steering motor holds an angle. That is a position loop with no
          gravity to fight, so skip kG and start at kS. The generator gave you
          real numbers, kP 100, kD 0.5, kS 0.1 and kV 1.91, and they are often
          close. Adjust them rather than starting from zero.
        </p>
        <p>
          Follow{" "}
          <Link
            href="/pid-control#feedforward-first"
            className="font-semibold underline decoration-1 underline-offset-2"
            style={{ color: "var(--accent)" }}
          >
            the order from the PID page
          </Link>
          . kS is the smallest output that breaks the module loose. Raise kP
          until it oscillates, then back off. Add kD, as much as you can get
          without jitter. Change one number per test.
        </p>
        <p>
          <code>DriveMechanism</code> publishes{" "}
          <code>Drivetrain/ModuleStates</code> and{" "}
          <code>Drivetrain/ModuleTargets</code>. Put the angle from both on one
          AdvantageScope plot and flick the right stick. Tuned looks like two
          traces on top of each other. Untuned lags, overshoots, or buzzes.
        </p>
      </LessonSection>

      <LessonSection id="check-your-work" title="Check your work">
        <p>
          Put the robot on the floor with a carpet seam or a taped line ahead of
          it, and keep a hand on disable.
        </p>
        <ol className="ml-5 list-decimal space-y-2">
          <li>
            Enable, push the left stick forward, and sight along the line for a
            few meters.
          </li>
          <li>
            Flick the right stick back and forth while you watch the angle plot.
          </li>
          <li>
            Turn 90&deg; in place and press the left bumper. Watch{" "}
            <code>Drivetrain/Pose</code>.
          </li>
        </ol>
        <Box variant="alert-success" title="You should see">
          <p>
            The robot tracking the line with no steady curve to either side.
            Commanded and measured module angles sitting on top of each other
            through every flick. After the bumper, forward moves to the new
            facing, and x and y do not change.
          </p>
        </Box>
        <p>
          A consistent curve to one side means a module is zeroed wrong, so put
          the straight edge back on and re-save. A wander that comes and goes is
          the steer gains. With both clean, go on to{" "}
          <Link
            href="/swerve-drive-tuning"
            className="font-semibold underline decoration-1 underline-offset-2"
            style={{ color: "var(--accent)" }}
          >
            Swerve Drive Tuning
          </Link>{" "}
          for the measurements that need the carpet.
        </p>
      </LessonSection>

      <Quiz
        questions={[
          {
            id: 1,
            question:
              "After zeroing, the robot drives a steady curve to the left on every run. What do you do?",
            options: [
              "Raise the steer kP until the curve goes away",
              "Put the straight edge back on and re-save the module zeros",
              "Lower kWheelRadius on the left side",
              "Press the left bumper to reset forward before each run",
            ],
            correctAnswer: 1,
            explanation:
              "A curve that is the same every time is a module that thinks straight is a degree or so off straight. That is an offset, and only re-zeroing against the straight edge fixes it. A wander that comes and goes is the steer gains. The bumper changes which way the sticks call forward, not how a module points.",
          },
          {
            id: 2,
            question:
              "One module is straight against the edge, but its bevel gear faces outward. What happens if you save the zeros like that?",
            options: [
              "Nothing: the CANcoder reads the same either way",
              "Tuner X refuses to save the offset",
              "That module drives backwards at full speed",
              "It zeroes 180 degrees off, and the drive tests fail later without saying why",
            ],
            correctAnswer: 3,
            explanation:
              "CTRE requires every bevel gear to face the vertical center of the robot. A module flipped the other way is still straight, so the offset looks reasonable, but it describes the wheel half a turn from where the code expects. Nothing flags it until the drive checks go wrong.",
          },
          {
            id: 3,
            question:
              "You flick the right stick and plot commanded against measured module angle. What does a tuned steer loop look like?",
            options: [
              "Two traces on top of each other",
              "The measured trace a steady few degrees behind the command",
              "The measured trace overshooting and settling within a second",
              "A flat measured trace, since the module should resist the command",
            ],
            correctAnswer: 0,
            explanation:
              "The steer loop's job is to put the wheel where the drivetrain asked, immediately. Lag, overshoot and buzz are the three ways it falls short. Raise kP until it oscillates and back off, then add kD until just before it jitters.",
          },
          {
            id: 4,
            question:
              "Which call moves the robot's x and y in Drivetrain/Pose?",
            options: [
              "seedFieldCentric(), on the left bumper",
              "applyOperatorPerspective(), every loop",
              "resetPose(Pose2d), which DriveMechanism does not expose",
              "Re-saving the module zeros in Tuner X",
            ],
            correctAnswer: 2,
            explanation:
              "seedFieldCentric() and applyOperatorPerspective() both decide which way the sticks call forward and never supply an x or a y. resetPose(Pose2d) is the one that places the robot on the field, and nothing in the workshop code calls it. Until vision corrects it, the pose is distance traveled since the code started.",
          },
          {
            id: 5,
            question:
              "You are on the red alliance. What does applyOperatorPerspective() set forward to?",
            options: [
              "0 degrees, toward the red wall",
              "Whatever the robot was facing at boot",
              "It does nothing on red; only blue needs a perspective",
              "180 degrees, toward the blue wall",
            ],
            correctAnswer: 3,
            explanation:
              "Blue sees forward as 0 degrees and red as 180, so a driver at either end pushes the stick away and the robot goes away. The field coordinates do not flip: (0, 0) is the blue corner for both alliances.",
          },
        ]}
      />
    </PageTemplate>
  );
}
