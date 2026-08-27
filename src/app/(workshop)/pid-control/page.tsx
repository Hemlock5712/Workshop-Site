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
      lede="The TalonFX runs the control loop itself. Tuner X sends the setpoint, plots the response, and saves the gains onto the motor. You will not write any Java in this lesson."
      needs={[
        <>
          Motor, encoder direction, and mechanism zero verified in{" "}
          <strong>Motor Setup &amp; CAN IDs</strong>.
        </>,
        <>
          Tuner X connected to the CANivore, with <strong>CANivore USB</strong>{" "}
          on.
        </>,
        <>The mechanism bolted to the bench, with a clear path to swing.</>,
        <>One person on the power switch who is not driving the laptop.</>,
      ]}
      time="15 minutes, including the simulation"
    >
      <Split>
        <div className="measure flex flex-col gap-pad [&>p]:m-0 [&>p]:prose-body">
          <p>
            You give the TalonFX a target. It reads its sensor, compares the
            two, and adjusts its own output about a thousand times a second.
            Tuner X never sees that loop running. It sets the target, saves the
            gains, and draws the result.
          </p>
          <p>Pick one device and finish it before you touch the other.</p>
        </div>
        <MarginNote label="No code yet">
          Keep VS Code closed for this lesson. Every setpoint, gain, and plot
          lives in Tuner X. Workshop 2 copies the numbers you save here into
          robot code, so you tune before you write any Java.
        </MarginNote>
      </Split>

      {/* Restored. `b092234` ("Reorder workshops") deleted this section along
          with 1,392 other lines when it converted the page from a 3-PID Java
          lesson into a Tuner X lab. The simulation was collateral damage, and
          it belongs here more than it belonged there: it needs no code, so a
          code-free workshop is exactly its home. Feeling what too much kP does
          costs nothing on a simulation and costs a gearbox on the bench.

          The arm/flywheel FigureGrid that used to sit above this is gone, not
          lost. The playground toggles between those two mechanisms and labels
          the control mode on each, so the figure was captioning a control the
          student can just use. Its two teaching points moved into the prose
          below. */}
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

      <LessonSection id="fix-the-units" title="Fix the units first">
        <p>
          A gain is a number of volts per unit of error. So if you and the motor
          disagree about what one unit means, every gain you find is off by the
          gear ratio. No amount of tuning rescues that.
        </p>
        <ol className="ml-5 list-decimal space-y-3">
          <li>
            Open <strong>Configs</strong> and set{" "}
            <code>SensorToMechanismRatio</code> so that one unit equals one
            mechanism rotation, not one motor rotation. A 60:1 arm uses 60.
          </li>
          <li>
            Turn the mechanism through a known angle by hand. A quarter turn of
            the arm should read 0.25, not 15.
          </li>
          <li>
            For the arm, set the gravity type to the arm setting so that{" "}
            <code>kG</code> scales with the cosine of the angle. An elevator
            uses the static setting instead.
          </li>
        </ol>
        <Box
          variant="alert-danger"
          title="Start small, and stay near the switch"
        >
          <p>
            Pick a target close to where the mechanism already sits, and start
            every gain at zero. Disable the control request before changing a
            sensor direction, a ratio, or a feedback source. Any of the three
            can reverse the loop, and a reversed loop drives to the hard stop at
            full output.
          </p>
        </Box>
      </LessonSection>

      <LessonSection id="build-the-plot" title="Build the plot">
        <p>
          Set the plot up once and leave it alone. Two runs are only worth
          comparing if they measured the same thing the same way.
        </p>
        <ol className="ml-5 list-decimal space-y-3">
          <li>
            Open <strong>Signal &amp; Control</strong> and add the TalonFX you
            are tuning.
          </li>
          <li>
            Plot four signals: the target, the measured position or velocity,
            the closed-loop error, and the motor voltage. Put target and
            measurement on one axis so you can read the gap between them.
          </li>
          <li>
            In <strong>Configs</strong>, work in Slot 0 and set every gain to{" "}
            <code>0</code>. Apply with the download button.
          </li>
          <li>
            In the control panel, pick a voltage-based position or velocity
            request, select Slot 0, and enter your small target. Enable it only
            long enough to catch the response.
          </li>
        </ol>
        <p>
          Change one number between runs. Move two gains at once and the plot
          cannot tell you which one did the work.
        </p>
      </LessonSection>

      <LessonSection id="feedforward-first" title="Tune the gains">
        <p>
          Feedforward is the output you can predict before any error exists. Get
          it right and the mechanism nearly holds its target with no feedback at
          all. Which terms matter depends on the mechanism.
        </p>
        <div className="overflow-x-auto">
          <table className="w-full min-w-[560px] border-collapse text-note">
            <thead>
              <tr style={{ borderBottom: "1px solid var(--rule)" }}>
                <th className="px-3 py-2 text-left">Gain</th>
                <th className="px-3 py-2 text-left">Pays for</th>
                <th className="px-3 py-2 text-left">How to find it</th>
              </tr>
            </thead>
            <tbody style={{ color: "var(--tx2)" }}>
              <tr style={{ borderBottom: "1px solid var(--rule-soft)" }}>
                <td className="px-3 py-2">
                  <code>kS</code>
                </td>
                <td className="px-3 py-2">Friction in the gearbox</td>
                <td className="px-3 py-2">
                  Raise it until the mechanism creeps, then back off one step.
                </td>
              </tr>
              <tr style={{ borderBottom: "1px solid var(--rule-soft)" }}>
                <td className="px-3 py-2">
                  <code>kG</code>
                </td>
                <td className="px-3 py-2">Gravity on the arm</td>
                <td className="px-3 py-2">
                  Raise it until the arm holds its angle without sagging or
                  climbing. Arm only.
                </td>
              </tr>
              <tr>
                <td className="px-3 py-2">
                  <code>kV</code>
                </td>
                <td className="px-3 py-2">Output per unit of speed</td>
                <td className="px-3 py-2">
                  Raise it until measured speed lands near the target on its
                  own. Flywheel mostly.
                </td>
              </tr>
            </tbody>
          </table>
        </div>
        <p>
          Measure <code>kS</code> and <code>kG</code> with the loop disabled, on
          a plain voltage request. Leave <code>kA</code> at zero until Motion
          Magic gives the motor a profile to follow.
        </p>
        <p>
          Then add feedback. It cleans up what feedforward could not predict: a
          sagging battery, a tightening chain, a game piece.
        </p>
        <ol className="ml-5 list-decimal space-y-3">
          <li>
            Raise <code>kP</code> until the mechanism reaches its target without
            crawling the last stretch. Double it each time until something
            changes, then move in smaller steps.
          </li>
          <li>
            Stop at the first overshoot or oscillation and drop back to the last
            value that behaved. If it still overshoots, add a little{" "}
            <code>kD</code>.
          </li>
          <li>
            Leave <code>kI</code> at zero. A steady offset is a feedforward
            problem, and <code>kI</code> hides it by winding up until something
            lurches.
          </li>
          <li>
            Repeat at three or four angles or speeds. Gains that work at one
            point are not tuned, they are lucky.
          </li>
        </ol>
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
          Nearly everything that goes wrong on a bench looks like one of these.
          Read the plot, not the mechanism.
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
              term: "Not enough output",
              body: (
                <>
                  Error settles at a constant gap. Check the supply current
                  limit, then the feedforward terms. This is not what{" "}
                  <code>kI</code> is for.
                </>
              ),
            },
          ]}
        />
        <p>
          If the plot looks fine but the mechanism does not, suspect the units.
          A ratio off by a factor of sixty makes a well-tuned loop hold a
          position nobody asked for.
        </p>
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
        <p>
          Write down the Slot 0 gains, the feedback source, the sensor ratios,
          and the inversions. Save the Tuner X configuration to a file. Workshop
          2 types these numbers into robot code, and copying them is far cheaper
          than tuning the same mechanism twice.
        </p>
        {/* CTRE's own manual tuning walkthrough, and the reference this lesson
            is written against. Restoring the original href: a rewrite pointed
            this at closed-loop-requests.html, which documents the request types
            rather than the tuning procedure the page teaches. */}
        <DocumentationButton
          href="https://v6.docs.ctr-electronics.com/en/stable/docs/api-reference/device-specific/talonfx/manual-pid-tuning.html"
          title="CTRE: Manual PID tuning"
          icon={<BookOpen className="h-5 w-5" />}
        />
      </LessonSection>

      {/* The "Check yourself" that `b092234` deleted. The original six
          questions tested Java on branch 3-PID (`config.Slot0.GravityType`,
          which gain ships non-zero), which no longer belongs on a page that
          never opens VS Code. These test the same understanding through the
          bench procedure instead. */}
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
            question: "What order do you tune in?",
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
          {
            id: 5,
            question:
              "You turn the arm a quarter turn by hand and Tuner X reads 15.0. What did you skip?",
            options: [
              "SensorToMechanismRatio, so you are reading motor rotations",
              "The mechanism zero was never set",
              "Nothing. 15.0 is degrees, not rotations",
              "The CANcoder magnet is too far from the shaft",
            ],
            correctAnswer: 0,
            explanation:
              "A quarter turn of the mechanism should read 0.25. Reading 15.0 on a 60:1 arm means the ratio is still 1, so every gain you find would be off by sixty. Fix the units before tuning anything.",
          },
          {
            id: 6,
            question:
              "Why write the gains down instead of leaving them saved on the motor?",
            options: [
              "The gains only persist until the next power cycle",
              "Phoenix stores them per laptop, not per device",
              "Tuner X clears Slot 0 when the CANivore is unplugged",
              "Workshop 2 puts these numbers into Arm.java by hand",
            ],
            correctAnswer: 3,
            explanation:
              "The gains do persist on the device. You write them down because the robot code sets them itself, and Workshop 2 has you type these six numbers into the mechanism file. Copying them is much cheaper than tuning the same arm twice.",
          },
        ]}
      />
    </PageTemplate>
  );
}
