import PageTemplate from "@/components/PageTemplate";
import LessonSection from "@/components/lesson/LessonSection";
import FigureGrid from "@/components/lesson/FigureGrid";
import KeyConceptSection from "@/components/KeyConceptSection";
import Box from "@/components/Box";
import DocumentationButton from "@/components/DocumentationButton";
import { MarginNote, Split } from "@/components/lesson/Prose";
import { BookOpen } from "lucide-react";

export default function PIDControl() {
  return (
    <PageTemplate
      title="Tune the motor before a robot program ever touches it"
      emphasis="before a robot program"
      lede="Closed-loop control belongs to the motor controller, so you can learn and tune it without writing Java. Tuner X will send the setpoint, plot the response, and save the gains while the mechanism is still on the bench."
      needs={[
        <>
          The motor, encoder direction, and mechanism zero verified in{" "}
          <strong>Motor Setup &amp; CAN IDs</strong>.
        </>,
        <>
          Phoenix Tuner X connected to the CANivore with{" "}
          <strong>CANivore USB</strong> turned on.
        </>,
        <>
          The mechanism secured to the bench, a clear travel area, and one
          person next to the power switch.
        </>,
      ]}
      time="About 45 minutes"
    >
      <Split>
        <KeyConceptSection
          description={[
            "You give the TalonFX a target. It compares that target with the sensor reading and changes its own output many times a second. Tuner X is only the control surface; the loop itself runs on the motor controller.",
            "Tune one contribution at a time. Feedforward handles output you can predict. Feedback corrects the error that remains.",
          ]}
          concept="A setpoint says where the mechanism should be. PID turns the error between that setpoint and the sensor into corrective output."
        />
        <MarginNote label="NO CODE YET">
          Do not open VS Code during this lab. Every setpoint, gain, plot, and
          configuration change happens in Phoenix Tuner X. Robot programming
          starts in Workshop 2.
        </MarginNote>
      </Split>

      <LessonSection
        id="choose-the-loop"
        title="Choose the loop you are tuning"
      >
        <p>
          The arm and flywheel answer different questions, so they need
          different closed loops. Select one device in Tuner X and finish it
          before moving to the other.
        </p>
        <FigureGrid
          cols={2}
          items={[
            {
              label: "Arm",
              term: "Position control",
              body: (
                <>
                  The setpoint is an angle in mechanism rotations. Plot the
                  position setpoint, measured position, closed-loop error, and
                  motor voltage.
                </>
              ),
            },
            {
              label: "Flywheel",
              term: "Velocity control",
              body: (
                <>
                  The setpoint is a speed in rotations per second. Plot the
                  velocity setpoint, measured velocity, closed-loop error, and
                  motor voltage.
                </>
              ),
            },
          ]}
        />
        <Box
          variant="alert-warning"
          tag="SAFETY"
          title="Start with a small target"
        >
          <p>
            Use a nearby arm position or a low flywheel speed first. Keep every
            gain at zero until the step that introduces it, and disable control
            before changing sensor direction, ratios, or feedback source.
          </p>
        </Box>
      </LessonSection>

      <LessonSection
        id="open-signal-control"
        title="Build one plot and one control panel"
      >
        <ol className="ml-5 list-decimal space-y-3">
          <li>
            Open the <strong>Signal &amp; Control</strong> workspace in Tuner X
            and add the TalonFX you are tuning.
          </li>
          <li>
            Add the target, measured position or velocity, closed-loop error,
            and motor voltage to the plot. Give target and measurement the same
            axis.
          </li>
          <li>
            Open the device <strong>Configs</strong> tab. Work in Slot 0 and set
            every gain to <code>0</code> before you begin.
          </li>
          <li>
            In the control panel, choose a voltage-based position or velocity
            request and Slot 0. Enter the small setpoint you chose above.
          </li>
          <li>
            Apply configuration changes with the download button, then enable
            the control request only long enough to read the response.
          </li>
        </ol>
        <Box
          variant="concept"
          title="Change one number, then run the same test"
        >
          <p>
            A useful plot compares repeated trials. Keep the setpoint, starting
            position, load, and test duration as consistent as you can. If two
            gains change at once, the graph cannot tell you which one helped.
          </p>
        </Box>
      </LessonSection>

      <LessonSection
        id="tune-feedforward"
        title="Tune the predictable output first"
      >
        <p>
          Feedforward supplies output before an error appears. The useful terms
          depend on the mechanism:
        </p>
        <div className="overflow-x-auto">
          <table className="w-full min-w-[560px] border-collapse text-note">
            <thead>
              <tr style={{ borderBottom: "1px solid var(--rule)" }}>
                <th className="px-3 py-2 text-left">Gain</th>
                <th className="px-3 py-2 text-left">What it pays for</th>
                <th className="px-3 py-2 text-left">Bench test</th>
              </tr>
            </thead>
            <tbody style={{ color: "var(--tx2)" }}>
              <tr style={{ borderBottom: "1px solid var(--rule-soft)" }}>
                <td className="px-3 py-2">
                  <code>kS</code>
                </td>
                <td className="px-3 py-2">Static friction</td>
                <td className="px-3 py-2">
                  Raise it until the mechanism just begins to move, then back
                  off slightly.
                </td>
              </tr>
              <tr style={{ borderBottom: "1px solid var(--rule-soft)" }}>
                <td className="px-3 py-2">
                  <code>kG</code>
                </td>
                <td className="px-3 py-2">Gravity on the arm</td>
                <td className="px-3 py-2">
                  Adjust until the arm can hold without drifting when the target
                  equals its position.
                </td>
              </tr>
              <tr>
                <td className="px-3 py-2">
                  <code>kV</code>
                </td>
                <td className="px-3 py-2">Output needed per unit of speed</td>
                <td className="px-3 py-2">
                  For the flywheel, adjust until measured speed is close to the
                  target before adding feedback.
                </td>
              </tr>
            </tbody>
          </table>
        </div>
        <p>
          Leave <code>kA</code> for the Motion Magic lab. It becomes easier to
          judge when the motor is following a known acceleration profile.
        </p>
      </LessonSection>

      <LessonSection
        id="tune-feedback"
        title="Use feedback to remove what remains"
      >
        <ol className="ml-5 list-decimal space-y-3">
          <li>
            Increase <code>kP</code> in small steps until the mechanism reaches
            the target promptly. Stop when it begins to overshoot or oscillate.
          </li>
          <li>
            If the response needs damping, add a small <code>kD</code>. Increase
            it only while the plot shows less overshoot and less oscillation.
          </li>
          <li>
            Leave <code>kI</code> at zero for this workshop. Fix a persistent
            load with the appropriate feedforward term before accumulating error
            over time.
          </li>
          <li>
            Repeat at several arm angles or flywheel speeds. A gain set that
            works at one point is not finished until it behaves across the
            mechanism&apos;s useful range.
          </li>
        </ol>
        <Box
          variant="alert-warning"
          tag="STOP"
          title="Know the three failure shapes"
        >
          <ul className="ml-5 list-disc space-y-2">
            <li>
              <strong>Runs away:</strong> feedback direction is wrong. Disable
              immediately and fix the sensor or motor direction.
            </li>
            <li>
              <strong>Buzzes or snaps:</strong> the feedback gain is too
              aggressive. Reduce <code>kP</code> before trying more damping.
            </li>
            <li>
              <strong>Never reaches the target:</strong> check current limits
              and feedforward before reaching for <code>kI</code>.
            </li>
          </ul>
        </Box>
      </LessonSection>

      <LessonSection
        id="save-the-result"
        title="Save a result Workshop 2 can use"
      >
        <p>
          Record the final Slot 0 gains, feedback source, sensor ratios,
          inversion, and the exact test that produced the plot. Export or save
          the Tuner X configuration, then capture one final response in both
          directions. Workshop 2 will translate these verified settings into
          robot code; it should not have to rediscover them.
        </p>
        <DocumentationButton
          href="https://v6.docs.ctr-electronics.com/en/stable/docs/api-reference/device-specific/talonfx/manual-pid-tuning.html"
          title="CTRE: Manual PID tuning"
          icon={<BookOpen className="h-5 w-5" />}
        />
      </LessonSection>
    </PageTemplate>
  );
}
