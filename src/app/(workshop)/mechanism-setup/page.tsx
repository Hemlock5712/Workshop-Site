import PageTemplate from "@/components/PageTemplate";
import FigureGrid from "@/components/lesson/FigureGrid";
import LessonSection from "@/components/lesson/LessonSection";
import KeyConceptSection from "@/components/KeyConceptSection";
import Box from "@/components/Box";
import CodeBlock from "@/components/CodeBlock";
import ImageBlock from "@/components/ImageBlock";
import DocumentationButton from "@/components/DocumentationButton";
import Quiz from "@/components/Quiz";
import { MarginNote, ProseBlock, Split } from "@/components/lesson/Prose";
import { BookOpen } from "lucide-react";

export default function MechanismSetup() {
  return (
    <PageTemplate
      title="Make the hardware move before you make it think"
      emphasis="before you make it think"
      lede="Before you write a line of control code, check three things on the bench: the encoder counts the way you expect, the motor turns the way you expect, and zero is where you think it is."
      needs={[
        <>The mechanism assembled and wired, with the battery connected.</>,
        <>
          A CANivore named <code>canivore</code>, plugged into your laptop over
          USB, with <em>Team # or IP</em> set to <code>localhost</code> in Tuner
          X.
        </>,
        <>Every device visible in Tuner X, with current firmware.</>,
        <>
          No robot code running anywhere. See the toggle section directly below.
        </>,
      ]}
      time="About half an hour"
    >
      <Split>
        <KeyConceptSection
          description={[
            "Each check takes a few minutes now. Skip them and you spend an afternoon tuning a PID loop that was never the problem — a motor wired backwards and a bad kP look identical from a laptop.",
          ]}
          concept="Fix direction and zero in Tuner X first. Then the only thing left to debug in your code is your code."
        />
        <MarginNote label="WHAT YOU'LL FINISH WITH">
          An encoder that counts up when the arm turns counterclockwise, a zero
          position you have written down, and a motor whose positive direction
          agrees with that encoder. On the flywheel build: two motors whose
          directions you have checked one at a time. Nearly all of it is inside
          Tuner X — no code yet, you clone the project on the next page.
        </MarginNote>
      </Split>

      {/* ── CANIVORE USB TOGGLE ──────────────────────────────────────────
          This is the site's single explanation of the toggle. `/hardware`
          and `/running-program` both deep-link to #canivore-usb rather than
          restating the rule, so do not rename or remove this id. */}
      <LessonSection
        id="the-canivore-usb-toggle-one-switch"
        title="The CANivore USB toggle: one switch, two positions"
      >
        <p>
          There is a checkbox in Phoenix Tuner X called{" "}
          <strong>CANivore USB</strong>. It decides who is allowed to talk to
          the CAN bus over the USB cable. Only one program can hold that bus at
          a time, so the toggle is not a setting you pick once and forget — it
          is a switch you flip depending on what you are doing.
        </p>

        <FigureGrid
          cols={2}
          items={[
            {
              label: "Position 1 · On",
              term: "Bench work in Tuner X, including everything on this page",
              body: (
                <>
                  Turn it <strong>on</strong> when Tuner X is the thing driving
                  your devices: reading encoder positions, applying Voltage Out,
                  setting sensor direction, zeroing, updating firmware. That is{" "}
                  <strong>Hardware Setup</strong> and this whole page.
                </>
              ),
            },
            {
              label: "Position 2 · Off",
              term: "Running your robot code in hardware simulation",
              body: (
                <>
                  Turn it <strong>off</strong> when your own program is driving
                  the devices. On <strong>Running Your Code</strong> you start
                  the robot project in hardware simulation, and the simulator
                  takes the CANivore for itself. Leave the toggle on and the two
                  fight over the same bus: devices drop out of Tuner X, or your
                  code never reaches a motor.
                </>
              ),
            },
          ]}
        />

        <Box variant="concept" title="How to flip it without breaking anything">
          <ol className="ml-4 list-decimal space-y-1">
            <li>
              Stop whatever is currently using the bus — quit the running robot
              program, or close the control window in Tuner X.
            </li>
            <li>Flip the CANivore USB checkbox to the position you need.</li>
            <li>
              Confirm your devices are listed. Tuner X shows them when the
              toggle is ON; the simulator console reports them when it is OFF.
            </li>
          </ol>
          <p className="mt-3">
            If devices vanish from Tuner X for no obvious reason, this toggle is
            the first thing to check. Something else has the bus.
          </p>
        </Box>

        <p>
          The toggle comes up on two other pages:{" "}
          <strong>Hardware Setup</strong>, where you first connected, and{" "}
          <strong>Running Your Code</strong>, where the simulator takes the bus
          over. The rule does not change — whichever program is driving the
          devices owns the toggle.
        </p>
      </LessonSection>

      {/* ── DEVICE IDS ───────────────────────────────────────────────── */}
      <LessonSection id="which-device-is-which" title="Which device is which">
        <p>
          Tuner X lists devices by CAN ID, so you need to know which number is
          which before you start applying voltage. These are the IDs the
          workshop code expects, and every one of them lives on the bus named{" "}
          <code>canivore</code>:
        </p>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-note">
            <thead>
              <tr style={{ borderBottom: "1px solid var(--rule)" }}>
                <th className="py-2 pr-4 font-semibold">Device</th>
                <th className="py-2 pr-4 font-semibold">CAN ID</th>
                <th className="py-2 font-semibold">In the code</th>
              </tr>
            </thead>
            <tbody style={{ color: "var(--tx2)" }}>
              <tr style={{ borderBottom: "1px solid var(--rule-soft)" }}>
                <td className="py-2 pr-4">Arm motor (TalonFX)</td>
                <td className="py-2 pr-4">
                  <code>31</code>
                </td>
                <td className="py-2">
                  <code>new TalonFX(31, canivore)</code>
                </td>
              </tr>
              <tr style={{ borderBottom: "1px solid var(--rule-soft)" }}>
                <td className="py-2 pr-4">Arm encoder (CANcoder)</td>
                <td className="py-2 pr-4">
                  <code>32</code>
                </td>
                <td className="py-2">
                  <code>new CANcoder(32, canivore)</code>
                </td>
              </tr>
              <tr style={{ borderBottom: "1px solid var(--rule-soft)" }}>
                <td className="py-2 pr-4">Flywheel leader (TalonFX)</td>
                <td className="py-2 pr-4">
                  <code>21</code>
                </td>
                <td className="py-2">
                  <code>new TalonFX(21, canivore)</code>
                </td>
              </tr>
              <tr>
                <td className="py-2 pr-4">Flywheel follower (TalonFX)</td>
                <td className="py-2 pr-4">
                  <code>22</code>
                </td>
                <td className="py-2">
                  <code>new TalonFX(22, canivore)</code>
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        <p>
          If your device IDs do not match this table, either change them in
          Tuner X now or remember to change the numbers in the code later. Do
          not leave the two disagreeing.
        </p>
      </LessonSection>

      {/* ── WHAT POSITIVE MEANS ──────────────────────────────────────── */}
      <LessonSection
        id="what-quot-positive-quot-means-on"
        title='What "positive" means on this robot'
      >
        <p>
          Every direction check on this page rests on one convention:{" "}
          <strong>positive is counterclockwise</strong>, viewed with the device
          facing you. The code says so out loud. Both mechanisms configure their
          motors the same way, and the arm even spells it out in a comment:
        </p>

        <CodeBlock
          language="java"
          title="One line out of Arm.java — you write this at Mechanisms"
          hideControls
          code={`config.MotorOutput.Inverted = InvertedValue.CounterClockwise_Positive;`}
        />

        <p>
          You are not writing any code today, and you do not need to read Java
          to use this page — that comes later, at{" "}
          <strong>The Java You Need</strong>. The line is here for one reason:
          it is the robot code&apos;s half of the promise you are about to check
          on the bench.{" "}
          <strong>
            Positive voltage moves the arm counterclockwise, and the arm&apos;s
            own comment in that file says so.
          </strong>{" "}
          If the bench disagrees with that sentence, something is wired or
          mounted backwards, and you want to know now.
        </p>

        <p>
          Positions are measured in <strong>rotations</strong>, not degrees. One
          full turn is <code>1.0</code>. That makes the mapping short enough to
          memorize:
        </p>

        <ul className="ml-5 list-disc space-y-1">
          <li>
            <code>0.0</code> rotations = 0°
          </li>
          <li>
            <code>0.25</code> rotations = 90° — the code calls this{" "}
            <code>VERTICAL_POSITION</code>
          </li>
          <li>
            <code>0.5</code> rotations = 180° — the code calls this{" "}
            <code>HORIZONTAL_POSITION</code>
          </li>
          <li>
            <code>1.0</code> rotations = 360°, back where you started
          </li>
        </ul>

        <p>
          Those two constants appear in <code>Arm.java</code> from the PID
          branch onward, and they are what the arm aims at once you reach{" "}
          <strong>PID Control</strong>. The two lessons before that push the arm
          with voltages instead, so the names show up later than the numbers do.
          What the numbers mean in the real world depends entirely on where you
          put zero, which is Step 2 below.
        </p>

        <div className="flex flex-col items-center gap-6 md:flex-row md:justify-center">
          <ImageBlock
            src="/images/setup/unit_circle_degrees_rotations_decimal.png"
            alt="Unit circle showing the same angles written as degrees and as decimal rotations, with counterclockwise as the positive direction"
            width={340}
            height={340}
            className="rounded-lg"
          />
          <ImageBlock
            src="/images/setup/counter-clockwise.png"
            alt="Arrow showing the counterclockwise rotation direction with the device facing you"
            width={340}
            height={255}
            className="rounded-lg"
          />
        </div>
      </LessonSection>

      {/* ── ARM ──────────────────────────────────────────────────────── */}
      <LessonSection
        id="arm-build-three-checks"
        title="Arm build: three checks"
      >
        <Split>
          <ProseBlock>
            <p>
              Do these in order. The encoder comes first because step 3 uses the
              encoder to judge the motor, so an encoder that counts backwards
              would make a correct motor look wrong.
            </p>
          </ProseBlock>
          <MarginNote label="IF YOU SWAP THE ENCODER">
            A CANcoder stores its direction and its zero on the device itself,
            not in your code. Replace the encoder and all of that is gone — come
            back and do steps 1 and 2 again on the new one.
          </MarginNote>
        </Split>

        {/* Step 1 */}
        <div className="flex flex-col gap-4">
          <h3 className="display m-0 text-lede">Step 1 — Encoder direction</h3>

          <ol className="ml-5 list-decimal space-y-3">
            <li>
              In Tuner X, select CANcoder <code>32</code> and open its live
              position reading.
            </li>
            <li>
              With the device facing you, turn the arm{" "}
              <strong>counterclockwise</strong> by hand. A factory-defaulted
              TalonFX coasts while nothing is driving it, so the arm should move
              without much fight. Later, <code>Arm.java</code> asks for Coast
              deliberately, for the same reason.
            </li>
            <li>
              <strong>{"You should see: "}</strong> the position number{" "}
              <strong>increases</strong>. Turn the arm back clockwise and it
              should decrease.
            </li>
            <li>
              If it goes the wrong way, go to <em>Info</em> →{" "}
              <em>Sensor Direction</em>, change it, and press <em>Apply</em>.
              Then repeat the hand test — do not assume the change took.
            </li>
          </ol>
        </div>

        {/* Step 2 */}
        <div className="flex flex-col gap-4">
          <h3 className="display m-0 text-lede">Step 2 — Zero the encoder</h3>

          <p>
            Zeroing tells the CANcoder which physical spot counts as{" "}
            <code>0.0</code> rotations. Every target the code ever aims at is
            measured from that spot, so a zero in the wrong place shifts every
            target by the same amount.
          </p>

          <ol className="ml-5 list-decimal space-y-3">
            <li>
              Move the arm by hand to the zero position for your build — read
              the warning below before you decide where that is.
            </li>
            <li>
              In Tuner X, go to <em>Info</em>, press <em>0 encoder</em>, then
              press <em>Apply</em>.
            </li>
            <li>
              <strong>{"You should see: "}</strong> the live position reads
              about <code>0</code> and stays there while the arm is still.
            </li>
            <li>
              Move the arm 90° counterclockwise from there.{" "}
              <strong>{"You should see: "}</strong> roughly <code>0.25</code>.
              That single check confirms direction, zero and the rotations
              mapping all at once.
            </li>
            <li>
              Write down, in words, where zero physically is on your mechanism.
              You will want it at <strong>PID Control</strong> and again at{" "}
              <strong>Motion Magic</strong>.
            </li>
          </ol>

          <Box
            variant="alert-warning"
            tag="TODO(VERIFY)"
            title="Ask the hardware lead where zero belongs before you press the button"
          >
            <p>
              The code does not settle this, and neither does this site. Here is
              exactly what is known:
            </p>
            <ul className="mt-3 ml-4 list-disc space-y-2">
              <li>
                The arm aims at <code>VERTICAL_POSITION = 0.25</code> (90°) and{" "}
                <code>HORIZONTAL_POSITION = 0.5</code> (180°), so zero rotations
                is 0° — a <em>second</em> horizontal, pointing the opposite way
                from the one the code names.
              </li>
              <li>
                From the PID lesson onward the motor is configured with{" "}
                <code>GravityTypeValue.Arm_Cosine</code>. That setting computes
                the gravity push-back from the cosine of the angle, measured
                from horizontal, so it only gives the right answer if zero is an
                arm-horizontal.
              </li>
              <li>
                Both of those fit together — 0° and 180° are both horizontal —
                but <strong>which one your arm should sit at</strong> when you
                press <em>0 encoder</em> is recorded nowhere. Confirm it with
                whoever built the mechanism, write it on the page, and use the
                same answer every time.
              </li>
            </ul>
            <p className="mt-3">
              This matters more than it looks. The <code>kG</code> gain you tune
              on the <strong>PID Control</strong> page is measured from that
              zero.
            </p>
          </Box>

          <iframe
            src="https://www.youtube.com/embed/mjGn3y19eUc"
            title="Encoder setup and verification in Tuner X"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
            className="aspect-video w-full rounded-lg"
          />
        </div>

        {/* Step 3 */}
        <div className="flex flex-col gap-4">
          <h3 className="display m-0 text-lede">Step 3 — Motor direction</h3>

          <ol className="ml-5 list-decimal space-y-3">
            <li>
              In Tuner X, select TalonFX <code>31</code> and set the control
              drop-down to <em>Voltage Out</em>. Keep the CANcoder position
              visible if you can.
            </li>
            <li>
              Apply <strong>+6 V</strong> in a short burst. Be ready to release.
            </li>
            <li>
              <strong>{"You should see: "}</strong> the arm moves{" "}
              <strong>counterclockwise</strong>, and the encoder number goes{" "}
              <strong>up</strong> while it moves. Negative voltage should do the
              reverse.
            </li>
            <li>
              If the arm moves clockwise on positive voltage, the motor is
              inverted relative to the convention. Flip the motor inversion in
              Tuner X so you can finish the bench test, then test again. Do not
              fix it by re-inverting the encoder — you settled the encoder
              against your own hand in step 1, and that answer is the one
              everything else has to agree with.
            </li>
            <li>
              Know that the Tuner X fix is temporary. <code>Arm.java</code>{" "}
              builds a fresh configuration every time the robot boots and
              applies the whole thing, including{" "}
              <code>
                config.MotorOutput.Inverted =
                InvertedValue.CounterClockwise_Positive
              </code>
              . The first time you run robot code, that overwrites whatever you
              set here. So Tuner X gets the bench test done today; the lasting
              fix is either to remount the motor the other way round, or to
              change that one line when you get to <strong>Mechanisms</strong>.
              Write down which way your arm turned — you will need it.
            </li>
          </ol>

          <Split>
            <ProseBlock>
              <p>
                Six volts, not twelve: about half of what a fresh battery gives
                you — plenty to see which way something turns, and slow enough
                that you can stop it.
              </p>
            </ProseBlock>
            <MarginNote label="WHY 6 V">
              It is also not an arbitrary number. The commands you write on the{" "}
              <strong>Commands</strong> page use exactly these two values,{" "}
              <code>SLOW_VOLTAGE = 3.0</code> and{" "}
              <code>FAST_VOLTAGE = 6.0</code>, so bench testing at 6 V is
              testing at the speed your code will run.
            </MarginNote>
          </Split>

          <iframe
            src="https://www.youtube.com/embed/iQqR1Wxptzg"
            title="Testing motor direction with Voltage Out in Tuner X"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
            className="aspect-video w-full rounded-lg"
          />
        </div>
      </LessonSection>

      {/* ── FLYWHEEL ─────────────────────────────────────────────────── */}
      <LessonSection
        id="flywheel-build-the-two-motors-turn"
        title="Flywheel build: the two motors turn opposite ways"
      >
        <Split>
          <ProseBlock>
            <p>
              The flywheel has two motors and they are{" "}
              <strong>supposed to spin against each other</strong>. If you watch
              the shooter under robot code and see the two shafts turning
              opposite ways, that is a working shooter, not a broken one. Two
              motors turning the <em>same</em> way is the symptom of a problem.
              This trips people up every year, so read the rest of this section
              before you change any setting on either motor.
            </p>
            <p>
              Here is the code that decides it, straight out of{" "}
              <code>Flywheel.java</code>. Later branches add gains and speed
              limits around it, but the <code>Follower</code> line and the
              comment above it are identical on every mechanism-track branch
              that has a flywheel:
            </p>
          </ProseBlock>
          <MarginNote label="WHY OPPOSITE">
            The shooter carries one compliant wheel on each side of the gap the
            ball travels through. For the ball to leave the front, the{" "}
            <em>surface</em> of each wheel where it touches the ball has to
            sweep toward the front, and two wheels facing each other across a
            gap can only do that by turning opposite ways — the same geometry as
            the two rollers in a paper shredder, which also turn against each
            other to move one sheet between them. Opposite shafts, same push.
          </MarginNote>
        </Split>

        <CodeBlock
          language="java"
          title="The one line that decides the follower's direction"
          hideControls
          code={`// The follower copies the leader, spinning the opposite direction.
follower.setControl(new Follower(leader.getDeviceID(), MotorAlignmentValue.Opposed));`}
        />

        <p>
          Again, nothing to write today — you build this file at{" "}
          <strong>Mechanisms</strong>. What matters on the bench is the word{" "}
          <code>Opposed</code>, and the comment sitting above it in the real
          file:{" "}
          <strong>the two motors are supposed to spin opposite ways.</strong>{" "}
          CAN 21 is the leader, CAN 22 is the follower, and the follower&apos;s
          direction is worked out from the leader&apos;s — there is no separate
          switch for it.
        </p>

        <p>
          <code>MotorAlignmentValue.Opposed</code> is what tells CAN 22 to
          mirror CAN 21 backwards, so one command spins them the right way
          round.
        </p>

        <Box
          variant="alert-warning"
          tag="WATCH OUT"
          title="On the bench, there is no follower"
        >
          <p>
            That <code>setControl(new Follower(...))</code> line lives in the{" "}
            <code>Flywheel</code> constructor, which only runs when your robot
            code runs. In Tuner X with no code running, CAN 21 and CAN 22 are
            two unrelated motors. Command one and the other does nothing. So
            test them one at a time.
          </p>
        </Box>

        <div className="flex justify-center">
          <ImageBlock
            src="/images/mechanisms/flywheel.png"
            alt="The workshop flywheel shooter, with a compliant wheel on each side of the ball gap"
            width={380}
            height={253}
            className="rounded-lg"
          />
        </div>

        <div className="flex flex-col gap-4">
          <h3 className="display m-0 text-lede">
            Step 1 — Check each motor by itself
          </h3>

          <ol className="ml-5 list-decimal space-y-3">
            <li>
              Decide which end of the shooter is the <strong>exit</strong> — the
              open side the ball leaves from. Everything below is measured
              against that.
            </li>
            <li>
              In Tuner X, select TalonFX <code>21</code>, choose{" "}
              <em>Voltage Out</em>, and apply <strong>+6 V</strong> in a short
              burst. <strong>{"You should see: "}</strong> the surface of that
              wheel, where it would touch the ball, sweeps{" "}
              <strong>toward the exit</strong>.
            </li>
            <li>
              Stop. Now select TalonFX <code>22</code> and apply{" "}
              <strong>+6 V</strong> the same way.{" "}
              <strong>{"You should see: "}</strong> the surface of <em>that</em>{" "}
              wheel sweeps <strong>toward the back</strong> — the opposite of
              motor 21.
            </li>
            <li>
              Write both results down. That backwards-looking result on CAN 22
              is the one you want, because the code is going to feed it the
              opposite sign.
            </li>
          </ol>

          <Split>
            <ProseBlock>
              <p>
                That backwards-looking result on CAN 22 is the one you want.
              </p>
            </ProseBlock>
            <MarginNote label="WHY IT LOOKS BACKWARDS">
              Under robot code, six volts goes to the leader and{" "}
              <code>Opposed</code> hands the follower the mirror image of it. So
              on the robot the follower does what <code>-6 V</code> would have
              done on the bench: it sweeps toward the exit too. Both wheels
              throw, and the shafts turn against each other while they do it.
            </MarginNote>
          </Split>

          <Box
            variant="alert-danger"
            tag="FAIL CASE"
            title="Both wheels sweep the same way at +6 V"
          >
            <p>
              If +6 V makes both wheel surfaces travel toward the exit, one
              motor or gearbox is mounted the wrong way round relative to the
              other. Leave it alone and the code makes it worse: with{" "}
              <code>Opposed</code> in play, one wheel will try to throw the ball
              while the other tries to drag it back in.
            </p>
            <p className="mt-3">
              <strong>This one you fix on the robot, not in Tuner X.</strong>{" "}
              There is no per-motor inversion switch to flip here.{" "}
              <code>Flywheel.java</code> inverts only the leader, and the
              follower&apos;s direction is computed from it by{" "}
              <code>
                new Follower(leader.getDeviceID(), MotorAlignmentValue.Opposed)
              </code>{" "}
              — so the two motors are never differentiated by an inversion
              setting, and anything you change in Tuner X is overwritten the
              next time robot code boots. Check the mechanical build. Swap the
              leader and follower CAN IDs only if the mount really is mirrored.
            </p>
          </Box>

          <iframe
            src="https://www.youtube.com/embed/iQqR1Wxptzg"
            title="Testing motor direction with Voltage Out in Tuner X"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
            className="aspect-video w-full rounded-lg"
          />
        </div>
      </LessonSection>

      {/* ── DID IT WORK ──────────────────────────────────────────────── */}
      <LessonSection id="did-it-work" title="Did it work?">
        <p>
          Run down the list for the build in front of you. Every line is
          something you can see happen, not something you can assume.
        </p>

        <h3 className="display measure m-0 text-lede">
          What the arm should do
        </h3>
        <ul className="ml-4 list-disc space-y-2">
          <li>
            Turning the arm counterclockwise by hand makes the CANcoder position{" "}
            <strong>go up</strong>.
          </li>
          <li>
            At the zero position the reading is about <code>0</code>, and 90°
            counterclockwise from there reads about <code>0.25</code>.
          </li>
          <li>
            +6 V moves the arm counterclockwise, and the encoder number climbs
            while it does.
          </li>
          <li>
            You have written down, in plain words, where zero physically is.
          </li>
        </ul>

        <h3 className="display measure m-0 text-lede">
          What the flywheel should do
        </h3>
        <ul className="ml-4 list-disc space-y-2">
          <li>
            +6 V on CAN <code>21</code> sweeps its wheel surface toward the
            exit.
          </li>
          <li>
            +6 V on CAN <code>22</code> sweeps its wheel surface toward the back
            — opposite to CAN 21, which is correct.
          </li>
        </ul>

        <Box
          variant="alert-info"
          tag="IF IT DIDN'T WORK"
          title="Devices that vanish, a direction that will not stay fixed, an encoder that disagrees"
        >
          <ul className="ml-4 list-disc space-y-3">
            <li>
              <strong>
                Devices disappear from Tuner X, or nothing responds.
              </strong>{" "}
              Something else owns the CAN bus. A robot program is probably still
              running, or the CANivore USB toggle is in the wrong position. Stop
              the program, set the toggle ON, and check the device list again.
            </li>
            <li>
              <strong>
                You fix the encoder direction, and it is wrong again next time
                you look.
              </strong>{" "}
              The change did not stick. Sensor direction is a setting on the
              CANcoder, and it needs <em>Apply</em> after you change it. Power
              cycle and re-read the position before you believe it.
            </li>
            <li>
              <strong>
                The arm moves counterclockwise on +6 V but the encoder counts
                down.
              </strong>{" "}
              Motor and encoder disagree, and you cannot tell which one is wrong
              from that symptom alone. Go back to step 1 and re-settle the
              encoder against your own hand — a direction you can see with the
              power off. Then re-test the motor against the settled encoder.
            </li>
          </ul>
        </Box>
      </LessonSection>

      {/* ── WHAT'S NEXT ──────────────────────────────────────────────── */}
      <LessonSection id="what-you-carry-forward" title="What you carry forward">
        <p>
          Three things from this page get used later, so keep them somewhere you
          can find them: your <strong>device IDs</strong>, the{" "}
          <strong>bus name</strong> (<code>canivore</code>), and{" "}
          <strong>where zero physically is</strong> on the arm. The first two
          show up as literal numbers in the code on the{" "}
          <strong>Mechanisms</strong> page. The third is what makes the gravity
          gain on <strong>PID Control</strong> mean anything.
        </p>

        <p>
          Next page is <strong>Project Setup</strong>, where you clone the robot
          project and build it once. No hardware needed for that one — but leave
          the mechanism wired, because you come back to it in a few lessons.
        </p>

        <DocumentationButton
          href="https://v6.docs.ctr-electronics.com/en/stable/docs/tuner/"
          title="Phoenix Tuner X documentation"
          icon={<BookOpen className="h-5 w-5" />}
        />
      </LessonSection>

      <Quiz
        questions={[
          {
            id: 1,
            question:
              "You turn the arm counterclockwise by hand, with the device facing you. What should the CANcoder position do?",
            options: [
              "Decrease",
              "Increase",
              "Stay the same until the motor is powered",
              "Jump to zero",
            ],
            correctAnswer: 1,
            explanation:
              "Counterclockwise is the positive direction on this robot, so the position increases. If it decreases, change Sensor Direction in Tuner X under Info, press Apply, and test by hand again.",
          },
          {
            id: 2,
            question: "What does zeroing the encoder actually do?",
            options: [
              "It sets the furthest the arm is allowed to travel",
              "It picks the physical spot that counts as 0 rotations, and every target in the code is measured from there",
              "It calibrates the motor's top speed",
              "It resets the motor controller to factory defaults",
            ],
            correctAnswer: 1,
            explanation:
              "Zeroing tells the CANcoder which physical spot is 0.0 rotations. VERTICAL_POSITION = 0.25 (90 degrees) and HORIZONTAL_POSITION = 0.5 (180 degrees) are both measured from it, so a zero in the wrong place shifts every target by the same amount. Where zero belongs on this arm is not recorded in the code — confirm it with whoever built the mechanism.",
          },
          {
            id: 3,
            question:
              "The arm's target positions are in rotations. How many degrees is 0.25 rotations?",
            options: ["25 degrees", "45 degrees", "90 degrees", "180 degrees"],
            correctAnswer: 2,
            explanation:
              "One full rotation is 360 degrees, so 0.25 rotations is 90 degrees and 0.5 rotations is 180 degrees. Those are the two constants the arm aims at from the PID branch onward: VERTICAL_POSITION = 0.25 and HORIZONTAL_POSITION = 0.5.",
          },
          {
            id: 4,
            question:
              "Your robot code is running and you watch the flywheel. The leader (CAN 21) and the follower (CAN 22) are turning in opposite directions. What is going on?",
            options: [
              "The follower is miswired — a leader and follower should always turn the same way",
              "That is correct: the code sets MotorAlignmentValue.Opposed, so the follower mirrors the leader backwards",
              "The follower has lost communication and is coasting to a stop",
              "The two motors are fighting, and one will overheat",
            ],
            correctAnswer: 1,
            explanation:
              "Every Flywheel.java in the mechanism track calls follower.setControl(new Follower(leader.getDeviceID(), MotorAlignmentValue.Opposed)), under the comment 'The follower copies the leader, spinning the opposite direction.' The two wheels sit on either side of the ball, so they must counter-rotate to throw it. Both motors turning the same way is the broken case.",
          },
          {
            id: 5,
            question:
              "You have finished bench testing and want to run your robot code in hardware simulation. What do you do with the CANivore USB toggle?",
            options: [
              "Leave it ON — your code reaches the CANivore through Tuner X",
              "Turn it OFF, after stopping Tuner X from driving the bus, because the simulator takes the CANivore for itself",
              "It only matters when you are updating firmware",
              "Turn it OFF and unplug the CANivore as well",
            ],
            correctAnswer: 1,
            explanation:
              "One toggle, two positions. ON while Tuner X drives the bus for bench work like this page. OFF when your robot code drives it in hardware simulation. Only one program can own the CANivore at a time, so stop the other one before you flip it.",
          },
          {
            id: 6,
            question: "You replace the CANcoder with a new one. What now?",
            options: [
              "Nothing — the settings travel with the robot code",
              "Update the device ID in the code and you are done",
              "Redo the direction and zero steps, because both are stored on the encoder itself",
              "Re-tune the PID gains, but the direction and zero carry over",
            ],
            correctAnswer: 2,
            explanation:
              "Sensor direction and the zero position live on the CANcoder, not in your project. A new device arrives with neither, so steps 1 and 2 have to be repeated before anything downstream is trustworthy.",
          },
        ]}
      />
    </PageTemplate>
  );
}
