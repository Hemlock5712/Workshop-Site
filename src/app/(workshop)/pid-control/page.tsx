import PageTemplate from "@/components/PageTemplate";
import LessonSection from "@/components/lesson/LessonSection";
import FigureGrid from "@/components/lesson/FigureGrid";
import MechanismPlayground from "@/components/MechanismPlayground";
import Box from "@/components/Box";
import Quiz from "@/components/Quiz";
import DocumentationButton from "@/components/DocumentationButton";
import { MarginNote, Split } from "@/components/lesson/Prose";
import { BookOpen } from "lucide-react";
import VideoEmbed from "@/components/VideoEmbed";

/**
 * Reference implementation for `context/lesson-budget.md`.
 *
 * Six sections. A numbered procedure in each section that is a procedure, a
 * table where the content is a table, a three-column figure for the three
 * failure modes, and a closing check a student can actually perform. Two
 * asides on the whole page, both of them safety.
 *
 * The shape to copy: prose says why, and says what "good" looks like. The
 * numbered list says what to do. Neither repeats the other, and neither one
 * narrates the table sitting next to it.
 */
export default function PIDControl() {
  return (
    <PageTemplate
      title="PID Tuning in Tuner X"
      lede="The TalonFX runs the control loop itself. Tuner X sends the setpoint, plots the response, and saves the gains onto the motor."
      needs={[
        <>
          Motor, encoder direction, and mechanism zero verified in{" "}
          <strong>Motor Setup &amp; CAN IDs</strong>.
        </>,
        <>
          Tuner X connected to the CANivore, with <strong>CANivore USB</strong>{" "}
          on.
        </>,
        <>The mechanism, with a clear path to swing, and no obstacles.</>,
      ]}
      time="15 minutes, including the simulation"
    >
      <LessonSection id="how-to-tune" title="How to tune">
        <p>
          CTRE has an excellent guide already that explains how to properly tune
          a PID loop. We strongly suggest following the steps in the guide.
        </p>
        <p>
          After you follow this guide, you can come back here and we'll explain
          how to actually implement it.
        </p>
        <DocumentationButton
          href="https://v6.docs.ctr-electronics.com/en/stable/docs/api-reference/device-specific/talonfx/manual-pid-tuning.html"
          title="CTRE: Manual PID tuning"
          icon={<BookOpen className="h-5 w-5" />}
        />
      </LessonSection>

      <LessonSection id="play-with-the-gains-first" title="Play with the gains">
        <p>
          Drag a gain and watch what happens. Find out what too much{" "}
          <code>kP</code> looks like here, where it costs nothing, rather than
          on a real gearbox.
        </p>
        <p>
          Switch between the three. The arm holds an angle, and gravity pulls on
          it everywhere, so it never rests at zero output. The flywheel holds a
          speed. Nothing drags it off target, but holding that speed costs
          output, and a game piece steals it at once. The elevator is the other
          gravity case, a constant pull.
        </p>
        <MechanismPlayground />
      </LessonSection>

      <LessonSection id="build-the-plot" title="Build the plot">
        <p>
          Before running this, fully power cycle the CANivore and mechanism to
          prevent any old positions from being read.
        </p>
        <ol className="ml-5 list-decimal space-y-3">
          <li>
            Open <strong>Signal &amp; Control</strong> and add the TalonFX you
            are tuning.
          </li>
          <li>
            Plot two signals: the target and the measured position (or velocity
            for flywheels). Put target and measurement in one group so you can
            read the gap between them.
          </li>
        </ol>
      </LessonSection>

      <LessonSection id="feedforward-first" title="Tune the gains">
        <Box variant="alert-info" title="Before you tune">
          <p>
            In the control panel, pick a voltage-based position or velocity
            request, select Slot 0, and enter your small target (for position,
            0.1 rotations, for velocity, 10 rps).
          </p>
        </Box>

        <p>Follow the CTRE tuning guide on your actual mechanism.</p>
        <p>
          A tuned arm sounds like one motion and then silence. If the motor is
          still working after the mechanism stopped, <code>kP</code> is too
          high.
        </p>

        <VideoEmbed
          id="Pt7SBFfl3oM"
          title="Tuning feedback (PID) and feedforward"
        />
      </LessonSection>

      <LessonSection id="failure-shapes" title="Three failure shapes">
        <p>
          Nearly everything that goes wrong on a mechanism looks like one of
          these. Read the plot, not the mechanism.
        </p>
        <FigureGrid
          cols={3}
          items={[
            {
              label: "Runs away",
              term: "Wrong direction",
              body: (
                <>
                  Error grows instead of shrinking and output pins. Disable now.
                  The sensor or the motor is inverted, so go back to Motor
                  Setup.
                </>
              ),
            },
            {
              label: "Buzzes",
              term: "Too much gain",
              body: (
                <>
                  Voltage chatters and the mechanism hums at rest. Cut{" "}
                  <code>kP</code> before reaching for <code>kD</code>. Damping
                  will not fix a loop that is too stiff.
                </>
              ),
            },
            {
              label: "Falls short",
              term: "Not enough output (position control)",
              body: (
                <>
                  Error settles at a constant gap. Increase your <code>kP</code>{" "}
                  to correct this, likely followed by a <code>kD</code> to
                  dampen the overshoot.
                </>
              ),
            },
          ]}
        />
      </LessonSection>

      <LessonSection id="check-your-work" title="Check your work">
        <p>
          Drive the mechanism to its target in both directions, from a
          standstill, three times. You are done when all three runs look alike.
        </p>
        <Box variant="alert-success" title="You should see">
          <ul className="ml-5 list-disc space-y-2">
            <li>The measured trace meets the target and stays there.</li>
            <li>
              Closed-loop error settles near zero and does not drift back out.
            </li>
            <li>Voltage is steady at rest, not chattering.</li>
            <li>The same gains behave across the full range of travel.</li>
          </ul>
        </Box>
      </LessonSection>

      <Quiz
        questions={[
          {
            id: 1,
            question:
              "You set every gain to zero, send a position target, and enable. The arm does nothing. What is wrong?",
            options: [
              "Tuner X needs the control request enabled twice",
              "The CANcoder is not wired into the feedback loop",
              "Nothing. A zero gain scales its term to nothing, so the output is zero volts",
              "kP must never start at zero, or the loop cannot begin",
            ],
            correctAnswer: 2,
            explanation:
              "Zero gains mean zero output. That is the intended starting state, and it is why the procedure has you add one term at a time: whatever the mechanism does next, you know which number caused it.",
          },
          {
            id: 2,
            question:
              "Your arm holds its angle perfectly at 90 degrees and sags badly at 30. Which term is wrong?",
            options: [
              "kD, because the arm is moving more slowly there",
              "kG, or the gravity type, because the hold varies with angle",
              "kS, because friction is higher at low angles",
              "kP, because the error at 30 degrees is larger",
            ],
            correctAnswer: 1,
            explanation:
              "Gravity's pull on an arm changes with the cosine of its angle. A hold that works at one angle and fails at another is the gravity term, so check kG and confirm the gravity type is set to the arm setting rather than the static one.",
          },
          {
            id: 3,
            question: "What order do you tune an arm in?",
            options: [
              "All of them together, raised in proportion",
              "kD first for safety, then kP, then the feedforwards",
              "kP, then kI, then kD, then the feedforwards",
              "kS and kG first, then kP, then kD",
            ],
            correctAnswer: 3,
            explanation:
              "Feedforward before feedback. Each term is measured with the ones after it still at zero, so tuning out of order means measuring one gain while another is already covering for it.",
          },
          {
            id: 4,
            question:
              "The arm reaches its target and then buzzes, sitting still. What do you reach for first?",
            options: [
              "Raise kD to damp the buzz",
              "Add kI to settle the remaining error",
              "Lower kP, because the loop is too stiff",
              "Raise kS to push through the friction",
            ],
            correctAnswer: 2,
            explanation:
              "A buzz at rest is a loop correcting harder than the mechanism can answer. Cut kP first. Damping a loop that is already too stiff adds a second aggressive term to a problem caused by the first.",
          },
        ]}
      />
    </PageTemplate>
  );
}
