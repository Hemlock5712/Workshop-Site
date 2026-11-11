import PageTemplate from "@/components/PageTemplate";
import FigureGrid from "@/components/lesson/FigureGrid";
import LessonSection from "@/components/lesson/LessonSection";
import FieldAxes from "@/components/lesson/FieldAxes";
import ContentCard from "@/components/ContentCard";
import ImageBlock from "@/components/ImageBlock";
import Box from "@/components/Box";
import Quiz from "@/components/Quiz";
import Link from "next/link";
import { lessonMetadata } from "@/lib/lessonMetadata";

export const metadata = lessonMetadata("/swerve-basics");

const linkClass = "underline hover:no-underline font-medium";

/**
 * Swerve Basics, formerly How Swerve Works (`/swerve-prerequisites`, which
 * redirects here). Owner's review, November 2026 (Recording 11): the page is
 * the parts and the words, nothing else. OpModes, `SwerveRequest`,
 * `applyOperatorPerspective` and `addVisionMeasurement` were cut because the
 * pages that use them explain them.
 *
 * The components section copies `/hardware`'s cards. The module and Pigeon
 * photos are the owner's, in `public/images/hardware/`.
 *
 * The field figure is `FieldAxes`, blue-corner origin by the owner's call,
 * matching `getPose()`.
 */
export default function SwerveBasics() {
  return (
    <PageTemplate
      title="Swerve Basics"
      lede="A swerve drive can slide sideways, drive diagonally and spin, all at the same time. This page names its parts and the terms the next pages use."
      needs={[
        <>
          The words CAN bus, CANcoder and CANivore, from{" "}
          <Link href="/hardware" className={linkClass}>
            Hardware Setup
          </Link>
          .
        </>,
        <>A swerve robot to look at, for the check at the end.</>,
      ]}
      time="6 minutes"
    >
      <LessonSection id="components" title="Components">
        <p>
          A swerve drive has a module at each corner: front left, front right,
          back left and back right, named from behind the robot. Every module
          can point its wheel in any direction, so the robot can travel one way
          while facing another.
        </p>

        <div className="grid gap-8 md:grid-cols-1 lg:grid-cols-3">
          <ContentCard>
            <ImageBlock
              src="/images/hardware/SwerveModule.png"
              alt="A swerve module with its two motors on top"
              width={160}
              height={160}
              className="mb-4"
            />
            <span className="micro mb-1 block">Four</span>
            <h3 className="display m-0 mb-3 text-lede">Swerve module</h3>
            <p className="text-[var(--tx2)]">
              Two Kraken motors and a CANcoder. The drive motor spins the wheel,
              the steer motor points it, and the CANcoder reads which way it
              points.
            </p>
          </ContentCard>

          <ContentCard>
            <ImageBlock
              src="/images/hardware/Pigeon2.png"
              alt="CTRE Pigeon 2.0 IMU"
              width={276}
              height={256}
              className="mb-4"
            />
            <span className="micro mb-1 block">One</span>
            <h3 className="display m-0 mb-3 text-lede">
              <a
                href="https://store.ctr-electronics.com/products/pigeon-2"
                target="_blank"
                rel="noopener noreferrer"
                className="text-[var(--accent)] underline hover:text-[var(--accent)]"
              >
                Pigeon 2
              </a>
            </h3>
            <p className="text-[var(--tx2)]">
              A gyro. It reports which way the robot is facing, which
              field-centric driving needs.
            </p>
          </ContentCard>

          <ContentCard>
            <ImageBlock
              src="/images/hardware/CANivore.png"
              alt="CANivore USB to CAN FD adapter"
              width={250}
              height={200}
              className="mb-4"
            />
            <span className="micro mb-1 block">One</span>
            <h3 className="display m-0 mb-3 text-lede">
              <a
                href="https://store.ctr-electronics.com/canivore/"
                target="_blank"
                rel="noopener noreferrer"
                className="text-[var(--accent)] underline hover:text-[var(--accent)]"
              >
                CANivore
              </a>
            </h3>
            <p className="text-[var(--tx2)]">
              Carries every swerve device on one CAN FD bus, the same part you
              used on the bench.
            </p>
          </ContentCard>
        </div>

        <p>
          That is thirteen devices: eight motors, four CANcoders and one Pigeon
          2. You never write the math that turns &quot;drive left while
          turning&quot; into eight motor commands. Tuner X generates it on the
          next page.
        </p>
      </LessonSection>

      <LessonSection id="basic-terms" title="Basic terms">
        <FigureGrid
          cols={2}
          items={[
            {
              term: "Robot-centric",
              body: (
                <>
                  Forward is wherever the robot&apos;s front points. Turn the
                  robot around and every stick input is mirrored.
                </>
              ),
            },
            {
              term: "Field-centric",
              body: (
                <>
                  Forward is down the field, away from your driver station, no
                  matter which way the robot faces. It needs the Pigeon 2 to
                  know the heading.
                </>
              ),
            },
            {
              term: "Translation2d",
              body: (
                <>
                  A spot on the field: X and Y in meters.{" "}
                  <code>new Translation2d(2.0, 6.5)</code> is 2 m down the field
                  and 6.5 m across it.
                </>
              ),
            },
            {
              term: "Rotation2d",
              body: (
                <>
                  A heading, the way the robot&apos;s front points.{" "}
                  <code>Rotation2d.fromDegrees(90)</code> faces +Y.
                </>
              ),
            },
            {
              term: "Pose2d",
              body: (
                <>
                  A <code>Translation2d</code> and a <code>Rotation2d</code>{" "}
                  together: where the robot is and which way it faces.{" "}
                  <code>
                    new Pose2d(new Translation2d(2.0, 6.5),
                    Rotation2d.fromDegrees(90))
                  </code>{" "}
                  is that spot, facing +Y.
                </>
              ),
            },
            {
              term: "Odometry",
              body: (
                <>
                  How the robot keeps track of its <code>Pose2d</code>. Every
                  loop it adds up how far each wheel turned. It never checks the
                  field, so slip and bumps make it drift.
                </>
              ),
            },
          ]}
        />

        <FieldAxes />

        <p>
          X runs down the length of the field, away from the blue driver
          station. Y runs across it, to the left. A heading of 0° faces along
          +X. The frame does not flip on red: a red robot at its own wall
          reports a large X.
        </p>
      </LessonSection>

      <LessonSection id="check-your-work" title="Check your work">
        <p>
          Power off. Stand behind a swerve robot with its front pointing away
          from you.
        </p>
        <ol className="ml-5 list-decimal space-y-2">
          <li>
            Name the four corners: front left, front right, back left, back
            right.
          </li>
          <li>
            On one module, find the drive motor, the steer motor and the
            CANcoder.
          </li>
          <li>
            Find the Pigeon 2 and the CANivore. Count the devices on the bus.
          </li>
        </ol>
        <Box variant="alert-success" title="You should see">
          <p>
            Thirteen devices: eight motors, four CANcoders and one Pigeon 2.
          </p>
        </Box>
      </LessonSection>

      <Quiz
        questions={[
          {
            id: 1,
            question:
              "You are driving field-centric. The robot's front points at you. You push the left stick away from yourself. What does the robot do?",
            options: [
              "Drives toward you, because forward is the way the robot faces",
              "Spins to face away first, then drives",
              "Drives away from you, backwards, because forward is a field direction",
              "Nothing, field-centric ignores the left stick",
            ],
            correctAnswer: 2,
            explanation:
              "Field-centric forward is fixed to the field, so the robot goes away from your driver station whichever way its front points. Robot-centric is the one that would drive at you.",
          },
          {
            id: 2,
            question:
              "What does field-centric driving need that robot-centric does not?",
            options: [
              "A gyro, the Pigeon 2, so the code knows the heading",
              "A second CANivore",
              "A camera",
              "Closed-loop drive motors",
            ],
            correctAnswer: 0,
            explanation:
              "To turn a field direction into wheel motion, the code needs the robot's heading. The Pigeon 2 reports it.",
          },
          {
            id: 3,
            question: "What does a Pose2d hold?",
            options: [
              "Speed, acceleration and heading",
              "Three wheel angles",
              "X and Y in meters, and a heading as a Rotation2d",
              "X, Y and Z in meters",
            ],
            correctAnswer: 2,
            explanation:
              "X meters down the field, Y meters across it, and the way the front points. The robot's position and a target you drive to are both a Pose2d.",
          },
          {
            id: 4,
            question: "Why does odometry drift over a match?",
            options: [
              "It resets every time the robot is disabled",
              "It only adds up wheel motion and never checks the field, so slip and bumps build up",
              "The CAN bus drops messages",
              "The Pigeon 2 loses power between modes",
            ],
            correctAnswer: 1,
            explanation:
              "A slipping wheel still reports distance, and a shoved robot moves without turning a wheel. Nothing in odometry looks at the field, so the error only grows.",
          },
        ]}
      />
    </PageTemplate>
  );
}
