import PageTemplate from "@/components/PageTemplate";
import LessonSection from "@/components/lesson/LessonSection";
import FigureGrid from "@/components/lesson/FigureGrid";
import Box from "@/components/Box";
import DocumentationButton from "@/components/DocumentationButton";
import Quiz from "@/components/Quiz";
import { MarginNote, Split } from "@/components/lesson/Prose";
import { BookOpen } from "lucide-react";

export default function MotionMagic() {
  return (
    <PageTemplate
      title="Motion Magic in Tuner X"
      lede="Plain position control asks for the whole move at once. Motion Magic hands the loop a moving target instead, so the mechanism accelerates, cruises, and stops on purpose. The Slot 0 gains you already saved carry over unchanged."
      needs={[
        <>
          Slot 0 gains you trust, saved in{" "}
          <strong>PID Tuning in Tuner X</strong>.
        </>,
        <>
          The same <strong>Signal &amp; Control</strong> plot, still showing
          target and measurement.
        </>,
        <>
          The mechanism bolted down, its path clear, and its travel limits
          written down.
        </>,
        <>One person on the power switch, hands clear of the mechanism.</>,
      ]}
      time="14 minutes"
    >
      <Split>
        <div className="measure flex flex-col gap-pad [&>p]:m-0 [&>p]:prose-body">
          <p>
            The feedback loop from the last lesson does not change. Motion Magic
            sits in front of it and moves the target for it. It walks that
            target from where the mechanism is to where you asked it to go, one
            small step at a time.
          </p>
          <p>
            Two numbers describe the route. Cruise velocity caps the speed.
            Acceleration caps how fast the speed may change. A third number,
            jerk, rounds the corner between them, and it stays at zero for now.
          </p>
        </div>
        <MarginNote label="Still no Java">
          Every number in this lesson lives on the motor and is set from Tuner
          X. Workshop 2 copies the profile numbers into robot code the same way
          it copies the gains, so write them down as you go.
        </MarginNote>
      </Split>

      <FigureGrid
        cols={2}
        items={[
          {
            label: "Arm",
            term: "Position profile",
            body: (
              <>
                The target is an angle. Both cruise velocity and acceleration
                apply, and the profile plans its own stop so the mechanism
                arrives with no speed left.
              </>
            ),
          },
          {
            label: "Flywheel",
            term: "Velocity profile",
            body: (
              <>
                The target is a speed. Only acceleration applies, because there
                is no arrival to plan. The profile ramps the speed target
                instead of stepping it.
              </>
            ),
          },
        ]}
      />

      <LessonSection id="read-the-profile" title="Read the profile shape">
        <p>
          Know what the plot should look like before you change any numbers. A
          position profile has three phases, and every problem in this lesson
          shows up as one of them going wrong.
        </p>
        <FigureGrid
          cols={3}
          items={[
            {
              label: "1",
              term: "Accelerate",
              body: "Speed rises at the configured acceleration. Too much here reads as a snap in the structure, a spike in current, or a wheel that slips.",
            },
            {
              label: "2",
              term: "Cruise",
              body: "Speed holds at the ceiling you set. A long move spends most of its time here. A short move skips this phase entirely.",
            },
            {
              label: "3",
              term: "Decelerate",
              body: "The profile turns around early enough to reach the target with zero planned speed. If the mechanism keeps going, the loop is at fault, not the profile.",
            },
          ]}
        />
        <p>
          A short move never reaches cruise. The profile ramps up, turns around,
          and comes back down in a triangle. That is the correct shape. Raising
          cruise velocity will not flatten the top of it, because the distance
          is what limits the peak.
        </p>
      </LessonSection>

      <LessonSection id="configure-motion-magic" title="Set the first limits">
        <Split>
          <div className="measure flex flex-col gap-pad [&>p]:m-0 [&>p]:prose-body">
            <p>
              Start slow enough to watch. A two-second move across the range is
              easy to read on the plot, and easy to stop by hand. You can always
              speed it up later.
            </p>
          </div>
          <MarginNote label="Units">
            Cruise velocity is mechanism rotations per second. Acceleration is
            mechanism rotations per second squared. If{" "}
            <code>SensorToMechanismRatio</code> is wrong, a 60:1 arm reports
            sixty times its real speed, and every number you enter here is off
            by that factor.
          </MarginNote>
        </Split>
        <ol className="ml-5 list-decimal space-y-3">
          <li>
            Open <strong>Configs</strong> and leave Slot 0 exactly as you saved
            it. You are changing the route, not the loop.
          </li>
          <li>
            Under <strong>Motion Magic</strong>, enter a cruise velocity and an
            acceleration. Both are in mechanism rotations, not motor rotations.
          </li>
          <li>
            Leave jerk at zero. Zero means no jerk limit, and the profile stays
            a plain trapezoid.
          </li>
          <li>Apply the configuration with the download button.</li>
          <li>
            In <strong>Signal &amp; Control</strong>, switch the request from
            plain position control to a Motion Magic position request, still on
            Slot 0. Pick a target a few degrees away.
          </li>
          <li>
            Add the closed-loop reference and its slope to the plot, beside
            measured position, measured velocity, and motor voltage. The
            reference is what the profile asked for. The measurement is what you
            got.
          </li>
        </ol>
        <Box variant="alert-danger" title="Short move first">
          <p>
            Motion Magic drives the whole distance you ask for at the speed you
            configured. Ask for a few degrees before you ask for the full range,
            and keep every target inside the travel you wrote down. A profile
            aimed past a hard stop still runs into it at cruise speed.
          </p>
        </Box>
      </LessonSection>

      <LessonSection id="tune-feedforward" title="Tune kV and kA">
        <p>
          The profile hands the loop a target velocity and a target acceleration
          at every instant. <code>kV</code> and <code>kA</code> turn those two
          numbers into voltage before any error exists. Tuned well, they do most
          of the work of the move, and feedback is left with the difference.
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
                  <code>kV</code>
                </td>
                <td className="px-3 py-2">Holding speed</td>
                <td className="px-3 py-2">
                  Raise it until the measurement sits on the reference through
                  the cruise phase.
                </td>
              </tr>
              <tr style={{ borderBottom: "1px solid var(--rule-soft)" }}>
                <td className="px-3 py-2">
                  <code>kA</code>
                </td>
                <td className="px-3 py-2">Changing speed</td>
                <td className="px-3 py-2">
                  Raise it until the measurement tracks through the ramp, not
                  only after it flattens out.
                </td>
              </tr>
              <tr style={{ borderBottom: "1px solid var(--rule-soft)" }}>
                <td className="px-3 py-2">
                  <code>kP</code>
                </td>
                <td className="px-3 py-2">Whatever feedforward missed</td>
                <td className="px-3 py-2">
                  Adjust it last. If <code>kP</code> is doing most of the work,
                  feedforward is too low.
                </td>
              </tr>
              <tr>
                <td className="px-3 py-2">
                  <code>kD</code>
                </td>
                <td className="px-3 py-2">Overshoot at the stop</td>
                <td className="px-3 py-2">
                  Keep it only while the plot shows less overshoot than the run
                  before it.
                </td>
              </tr>
            </tbody>
          </table>
        </div>
        <p>
          Leave <code>kS</code> and <code>kG</code> where they are. You found
          them with the loop disabled last lesson, and a profile does not change
          what friction and gravity cost.
        </p>
        <p>
          Change one number per run. The plot cannot separate two edits, and two
          edits are how a good gain gets thrown out with a bad one.
        </p>
      </LessonSection>

      <LessonSection id="tune-the-limits" title="Raise the limits">
        <p>
          By now the conservative profile should track cleanly on every run. Now
          find out how much the mechanism will take before it stops behaving.
        </p>
        <ol className="ml-5 list-decimal space-y-3">
          <li>
            Raise acceleration one step at a time and watch the ramp. Stop when
            the measurement falls behind, the current spikes, or the structure
            shakes.
          </li>
          <li>
            Raise cruise velocity the same way, watching the flat section
            instead of the ramp.
          </li>
          <li>
            Run the longest move you will ever ask for, in both directions. The
            long move is what exposes cruise tracking.
          </li>
          <li>
            Run the shortest useful move too. It never cruises, so it tests the
            stop instead.
          </li>
        </ol>
        <Split>
          <div className="measure flex flex-col gap-pad [&>p]:m-0 [&>p]:prose-body">
            <p>
              Then back off from the ceiling you found. A profile tuned to the
              last volt on a fresh battery falls behind on a tired one. A loaded
              mechanism is slower than an empty one, and a match gives you both
              at once.
            </p>
          </div>
          <MarginNote label="Jerk">
            If the corner into acceleration is what shakes the mechanism, a
            small jerk limit rounds it off. It also lengthens every move and
            adds one more number to tune. Most mechanisms in this workshop never
            need one.
          </MarginNote>
        </Split>
      </LessonSection>

      <LessonSection id="failure-shapes" title="Three failure shapes">
        <p>
          Three shapes cover almost every failed run from here. Read the gap
          between the reference and the measurement, not the mechanism. Voltage
          tells you which kind of gap it is: a gain too low, or a limit the
          motor cannot reach.
        </p>
        <FigureGrid
          cols={3}
          items={[
            {
              label: "Trails",
              term: "Never catches up",
              body: (
                <>
                  The measurement lags from the first moment. Feedforward is too
                  low, or the limits are past what the motor can deliver. Lower
                  acceleration before adding gain.
                </>
              ),
            },
            {
              label: "Snaps",
              term: "Acceleration too high",
              body: (
                <>
                  The mechanism jolts at the start and the current spikes with
                  it. Lower acceleration. A jerk limit softens the corner once
                  acceleration is sane.
                </>
              ),
            },
            {
              label: "Overshoots",
              term: "A loop problem",
              body: (
                <>
                  The reference lands on the target and the measurement sails
                  past it. No profile number causes that. Go back to{" "}
                  <code>kP</code> and <code>kD</code>.
                </>
              ),
            },
          ]}
        />
        <p>
          If the measurement sits on the reference the whole way and the move is
          still too slow, nothing is tuned wrong. The limits are lower than the
          mechanism can take, so go back and raise them.
        </p>
      </LessonSection>

      <LessonSection id="check-your-work" title="Check your work">
        <p>
          Run the same move five times from a standstill, alternating direction.
          You are done when the five traces sit on top of each other.
        </p>
        <Box variant="alert-success" title="You should see">
          <ul className="ml-5 list-disc space-y-2">
            <li>
              The measurement follows the reference through all three phases.
            </li>
            <li>The mechanism arrives once and stays there, with no bounce.</li>
            <li>
              Current peaks during acceleration and settles during cruise.
            </li>
            <li>The long move and the short move both stop cleanly.</li>
          </ul>
        </Box>
        <p>
          Write down cruise velocity, acceleration, jerk, and the Slot 0 gains,
          next to the mechanism, the date, and the battery you used. Save the
          Tuner X configuration to a file and keep one plot of a long move.
          Workshop 2 starts from these numbers instead of from zero.
        </p>
        <DocumentationButton
          href="https://v6.docs.ctr-electronics.com/en/stable/docs/api-reference/device-specific/talonfx/manual-pid-tuning.html#profiled-tuning"
          title="CTRE: Profiled tuning"
          icon={<BookOpen className="h-5 w-5" />}
        />
      </LessonSection>

      <Quiz
        questions={[
          {
            id: 1,
            question:
              "What does Motion Magic change about the feedback loop you tuned last lesson?",
            options: [
              "It replaces the Slot 0 gains with gains of its own",
              "It moves the target the loop aims at, one small step at a time, from where the mechanism is to where you asked it to go",
              "It removes the need for feedforward, because the profile already knows the route",
              "It lets the motor turn faster than its free speed on long moves",
            ],
            correctAnswer: 1,
            explanation:
              "Slot 0 carries over untouched. Motion Magic sits in front of the loop and hands it a moving target, so the loop does the same job it did last lesson against a target that keeps changing. Feedforward has more to work with here, because the profile states the speed and acceleration to expect at every instant.",
          },
          {
            id: 2,
            question:
              "You leave jerk at zero in the Motion Magic configs. What does that do to the profile?",
            options: [
              "It runs with no acceleration limit either, because jerk overrides acceleration",
              "It ignores cruise velocity and uses acceleration alone",
              "It refuses to run until jerk has a value",
              "It stays a plain trapezoid, with no limit on how fast acceleration may change",
            ],
            correctAnswer: 3,
            explanation:
              "Zero means no jerk limit, so speed rises, holds, and falls in straight lines with sharp corners between them. A jerk limit rounds the corner into acceleration, which is worth doing when that corner is what shakes the mechanism. It also lengthens every move and adds a third number to tune.",
          },
          {
            id: 3,
            question:
              "Which units does Tuner X expect for cruise velocity and acceleration?",
            options: [
              "Percent of the motor's free speed",
              "Motor rotations per second and per second squared",
              "Mechanism rotations per second and per second squared",
              "Degrees per second and degrees per second squared",
            ],
            correctAnswer: 2,
            explanation:
              "Both numbers are in mechanism rotations, and SensorToMechanismRatio is what makes one rotation mean one turn of the mechanism rather than one turn of the rotor. Get that ratio wrong on a 60:1 arm and the reported speed is off by a factor of sixty, which puts every profile number you enter off by the same factor.",
          },
          {
            id: 4,
            question:
              "A short move ramps up, turns around, and comes back down without ever holding a flat speed. What should you change?",
            options: [
              "Nothing. Distance limits the peak, so a triangle is the right shape for a short move",
              "Lower acceleration until the profile has time to reach cruise",
              "Set a jerk limit, which is what adds the cruise phase",
              "Raise cruise velocity until the top of the trace flattens out",
            ],
            correctAnswer: 0,
            explanation:
              "The profile has to start braking early enough to arrive with no speed left, and on a short move that point comes before cruise velocity is ever reached. Raising cruise velocity changes nothing you can see on the plot. On a move this short, acceleration is the only number that changes how it feels.",
          },
          {
            id: 5,
            question:
              "The measurement tracks the reference through the ramp, then sags below it for the whole cruise section, while motor voltage still has headroom. What do you do?",
            options: [
              "Raise kA",
              "Raise kD",
              "Lower cruise velocity until the sag disappears",
              "Raise kV",
            ],
            correctAnswer: 3,
            explanation:
              "kV pays for holding a speed, and cruise is the phase that asks for nothing else. kA pays for changing speed, which the clean ramp already shows is covered, and kD acts only on how fast the error is changing. Lowering cruise velocity hides the gap here instead of closing it, and it is the right move only in the other case, where voltage is pinned at the supply and the motor cannot hold the speed you asked for.",
          },
          {
            id: 6,
            question:
              "The measurement lags the reference from the first moment of the move and never catches up. What comes first?",
            options: [
              "Add a jerk limit to soften the start",
              "Lower acceleration, before adding any gain",
              "Raise kP until the gap closes",
              "Raise cruise velocity so the profile spends less time on the ramp",
            ],
            correctAnswer: 1,
            explanation:
              "A trace that trails from the start means feedforward is too low, or the limits are past what the motor can deliver. The limits are the cheaper thing to rule out, so lower acceleration and run it again. If kP ends up doing most of the work, the profile is asking for more than feedforward is paying for.",
          },
        ]}
      />
    </PageTemplate>
  );
}
