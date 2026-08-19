import PageTemplate from "@/components/PageTemplate";
import LessonSection from "@/components/lesson/LessonSection";
import FigureGrid from "@/components/lesson/FigureGrid";
import KeyConceptSection from "@/components/KeyConceptSection";
import Box from "@/components/Box";
import DocumentationButton from "@/components/DocumentationButton";
import { MarginNote, Split } from "@/components/lesson/Prose";
import { BookOpen } from "lucide-react";

export default function MotionMagic() {
  return (
    <PageTemplate
      title="Give the closed loop a route to the target"
      emphasis="a route to the target"
      lede="Plain position control asks for the final position immediately. Motion Magic generates a reachable position, velocity, and acceleration target for every moment of the move, so the mechanism accelerates and stops on purpose."
      needs={[
        <>
          A stable Slot 0 gain set from <strong>PID Tuning in Tuner X</strong>.
        </>,
        <>
          The same Tuner X Signal &amp; Control workspace, with the mechanism
          secured and its travel area clear.
        </>,
        <>The arm&apos;s safe minimum and maximum positions written down.</>,
      ]}
      time="About 35 minutes"
    >
      <Split>
        <KeyConceptSection
          description={[
            "The position loop is still doing the correction. Motion Magic changes the setpoint it sees, moving that setpoint along a profile instead of jumping straight to the destination.",
            "Cruise velocity limits how fast the mechanism may travel. Acceleration limits how quickly it may reach that speed. Jerk is optional and limits how abruptly acceleration may change.",
          ]}
          concept="Tune the loop first, then tune the profile. A motion profile cannot rescue bad feedback gains."
        />
        <MarginNote label="STILL NO JAVA">
          Control the mechanism from Tuner X for this entire lesson. The final
          values become a configuration handoff for Workshop 2.
        </MarginNote>
      </Split>

      <LessonSection
        id="read-the-profile"
        title="Read the shape before changing numbers"
      >
        <FigureGrid
          cols={3}
          items={[
            {
              label: "1",
              term: "Accelerate",
              body: "Velocity rises at the configured acceleration. This is where excessive acceleration causes a snap or wheel slip.",
            },
            {
              label: "2",
              term: "Cruise",
              body: "Velocity holds at the configured ceiling if the move is long enough. A short move may never reach this phase.",
            },
            {
              label: "3",
              term: "Decelerate",
              body: "The profile turns around early enough to arrive at the target with zero planned velocity.",
            },
          ]}
        />
        <Box variant="concept" title="Short moves make triangles">
          <p>
            If there is not enough distance to reach cruise velocity, Motion
            Magic accelerates and then immediately decelerates. That is
            expected; do not raise the cruise limit just to force a flat section
            into the graph.
          </p>
        </Box>
      </LessonSection>

      <LessonSection
        id="configure-motion-magic"
        title="Add the profile in Tuner X"
      >
        <ol className="ml-5 list-decimal space-y-3">
          <li>
            Open the TalonFX <strong>Configs</strong> tab and keep the verified
            Slot 0 gains unchanged.
          </li>
          <li>
            Under <strong>Motion Magic</strong>, enter a conservative cruise
            velocity and acceleration in mechanism rotations per second and
            rotations per second squared.
          </li>
          <li>
            Leave jerk at zero for the first test. Zero means the controller
            uses a trapezoidal profile without an extra jerk limit.
          </li>
          <li>
            Apply the configuration. In Signal &amp; Control, change the request
            from plain position control to a Motion Magic position request using
            Slot 0.
          </li>
          <li>
            Plot the generated position, velocity, and acceleration references
            beside the measured position and velocity.
          </li>
        </ol>
        <Box
          variant="alert-warning"
          tag="UNITS"
          title="Use mechanism rotations"
        >
          <p>
            The values only make sense if the feedback ratios from Motor Setup
            are correct. One rotation must mean one rotation of the mechanism
            being controlled, not one motor-shaft turn hidden behind a gearbox.
          </p>
        </Box>
      </LessonSection>

      <LessonSection
        id="tune-the-limits"
        title="Tune acceleration, then cruise velocity"
      >
        <ol className="ml-5 list-decimal space-y-3">
          <li>
            Start with a move that uses only part of the arm&apos;s safe range.
            Run it in both directions and verify the plotted reference is
            smooth.
          </li>
          <li>
            Raise acceleration until the move is responsive, then step back if
            the mechanism snaps, the current spikes, or measured velocity falls
            far behind the reference.
          </li>
          <li>
            Raise cruise velocity until the mechanism is as fast as the task
            needs. Faster is not automatically better; leave tracking margin for
            a low battery and a loaded mechanism.
          </li>
          <li>
            Test the longest move and the shortest useful move. The long move
            exposes cruise tracking; the short move exposes stopping behavior.
          </li>
        </ol>
        <p>
          If measured acceleration consistently trails the planned acceleration,
          add <code>kA</code> in small steps. If measured cruise velocity trails
          the planned velocity, revisit <code>kV</code>. Use <code>kP</code> and
          <code>kD</code> only for the remaining position error and oscillation.
        </p>
      </LessonSection>

      <LessonSection
        id="decide-on-jerk"
        title="Add jerk only when the mechanism needs it"
      >
        <p>
          A jerk limit rounds the corners where acceleration changes. It can
          make a tall or flexible mechanism feel calmer, but it also lengthens
          the move and adds another number to tune. Leave it at zero unless the
          transition into acceleration is the problem you can see in the plot or
          feel in the structure.
        </p>
        <Box
          variant="alert-info"
          tag="DIAGNOSIS"
          title="Profile problem or loop problem?"
        >
          <ul className="ml-5 list-disc space-y-2">
            <li>
              <strong>The reference itself is too sharp:</strong> lower
              acceleration or add a jerk limit.
            </li>
            <li>
              <strong>
                The reference is smooth but measurement oscillates:
              </strong>{" "}
              return to the Slot 0 feedback gains.
            </li>
            <li>
              <strong>Measurement follows but the whole move is slow:</strong>{" "}
              raise the applicable profile limit within the mechanism&apos;s
              safe range.
            </li>
          </ul>
        </Box>
      </LessonSection>

      <LessonSection
        id="record-the-configuration"
        title="Finish with a configuration handoff"
      >
        <p>
          Save the cruise velocity, acceleration, optional jerk, Slot 0 gains,
          sensor ratios, and two plots: the longest move and a short move. Label
          the mechanism, date, load, and battery condition. Workshop 2 can now
          reproduce a known-good controller in code without tuning blind.
        </p>
        <DocumentationButton
          href="https://v6.docs.ctr-electronics.com/en/stable/docs/api-reference/device-specific/talonfx/manual-pid-tuning.html#profiled-tuning"
          title="CTRE — Profiled tuning"
          icon={<BookOpen className="h-5 w-5" />}
        />
      </LessonSection>
    </PageTemplate>
  );
}
