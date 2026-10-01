import PageTemplate from "@/components/PageTemplate";
import LessonSection from "@/components/lesson/LessonSection";
import FigureGrid from "@/components/lesson/FigureGrid";
import ModelViewer from "@/components/ModelViewer";
import BillOfMaterials from "@/components/BillOfMaterials";
import Box from "@/components/Box";
import { MarginNote, Split } from "@/components/lesson/Prose";
import { armBOMData } from "@/data/armBOM";
import { shooterBOMData } from "@/data/shooterBOM";
import { Package, Wrench, Box as BoxIcon } from "lucide-react";
import { lessonMetadata } from "@/lib/lessonMetadata";

export const metadata = lessonMetadata("/mechanism-cad");

/* Every download link is the same control, so it is written once. Three copies
   of a 200-character className is how the three of them drifted apart on the
   arm block and the flywheel block in the first place. `min-h-11` because
   these are the only tap targets on the page and `py-2` left them at 37px. */
const DOWNLOAD_LINK =
  "flex min-h-11 flex-1 items-center justify-center gap-2 rounded-md border border-[var(--rule)] bg-[var(--bg2)] px-4 text-note font-medium text-[var(--tx2)] transition-colors hover:border-[var(--accent)] hover:text-[var(--accent)]";

export default function MechanismCAD() {
  return (
    <PageTemplate
      title="Mechanism CAD"
      lede="Workshops 1 and 3 run on a real arm or a real flywheel on a bench. This page has the 3D models, the parts lists, and the build notes for both. Teams attending in person can skip it, and so can a team that already has a mechanism with a TalonFX on it."
      needs={[
        <>Nothing installed. The models spin in the browser.</>,
        <>To build one: a 3D printer, a saw, and hex keys.</>,
        <>
          The CTRE hardware from <strong>Prerequisites</strong>: Kraken X44,
          CANivore, CANcoder.
        </>,
        <>
          Bench space for the arm to turn a full circle without hitting
          anything.
        </>,
      ]}
      time="11 minutes"
    >
      <Split>
        <div className="measure flex flex-col gap-pad [&>p]:m-0 [&>p]:prose-body">
          <p>
            Both builds start from the same base: 1x2 aluminum tube, T-slot
            extrusion, and a two-stage WCP rotation gearbox. What bolts to the
            gearbox output is the only real difference between them.
          </p>
          <p>
            Build one, not both. The two parts lists overlap by about two
            thirds, and Workshop 1 tunes one device at a time. Printing and
            assembly take two or three build nights, so start before the week
            you need it.
          </p>
        </div>
        <MarginNote label="Already have one?">
          An old competition arm or shooter works. It needs a TalonFX on it and
          a CANivore. An arm too long to clear the bench through a full turn
          also needs a hard stop at each end of travel.
        </MarginNote>
      </Split>

      <FigureGrid
        cols={2}
        items={[
          {
            label: "Arm",
            term: "About $860 in new parts",
            body: (
              <>
                One motor, one through-bore CANcoder, and a 9 inch tube on the
                output shaft. The tube is short enough to clear the bench
                through a full 360 degrees, so a wrong sign or a bad gain spins
                the arm instead of crashing it.
              </>
            ),
          },
          {
            label: "Flywheel",
            term: "About $800 in new parts",
            body: (
              <>
                Same base, no encoder, two 4 inch compliant wheels on the
                output. It stays inside its own footprint, and the parts list
                ends with a tennis ball.
              </>
            ),
          },
        ]}
      />

      {/* No negative-margin breakout here. This section used to carry
          `-mx-4 ... xl:-mx-16` with every panel inside paying it back as
          `mx-4 ... xl:mx-16`, which is a full-bleed effect hand-rolled against
          the page padding scale. The `lesson-stack` column is already capped
          at `.measure-wide` (820 + 180 = 1000px), the sanctioned width for a
          figure wider than the text column, so the panels get the whole of it
          by not opting out. The bordered wrapper each viewer used to sit
          inside is gone with it: `ModelViewer` draws its own frame and control
          bar, so the wrapper was a panel around a panel. */}
      <LessonSection id="interactive-3d-models" title="The two models">
        <p>
          Drag to orbit either model, and scroll to zoom. The buttons underneath
          jump to a fixed angle.
        </p>

        <div className="flex flex-col gap-6">
          <ModelViewer
            url="/cad/shooter-mode.glb"
            label="The shooter flywheel mechanism"
            weight="1.8 MB"
            className="h-64 sm:h-80 md:h-96 lg:h-[600px]"
          />

          <div className="measure flex flex-col gap-4">
            <h3 className="display m-0 text-lede">Flywheel Mechanism</h3>
            <p>
              The gearbox output carries a compliant wheel on each end of the
              shaft. There is no encoder on this build. The TalonFX has a rotor
              sensor of its own.
            </p>

            <div className="flex flex-wrap gap-3">
              <a
                href="/cad/HTTI Mechanism v2 - Shooter Mode.stl"
                download
                className={DOWNLOAD_LINK}
              >
                <Package className="h-4 w-4" aria-hidden="true" />
                Download STL
              </a>
              <a
                href="/cad/HTTI Mechanism v2 - Shooter Mode.stp"
                download
                className={DOWNLOAD_LINK}
              >
                <Wrench className="h-4 w-4" aria-hidden="true" />
                Download STP
              </a>
              <a
                href="https://cad.onshape.com/documents/1ca9ee00bfdd386abbe2ae30"
                target="_blank"
                rel="noopener noreferrer"
                className={DOWNLOAD_LINK}
              >
                <BoxIcon className="h-4 w-4" aria-hidden="true" />
                Onshape CAD
              </a>
            </div>
          </div>
        </div>

        <div className="flex flex-col gap-6">
          <ModelViewer
            url="/cad/arm-mode.glb"
            label="The single-jointed arm mechanism"
            weight="1.6 MB"
            className="h-64 sm:h-80 md:h-96 lg:h-[600px]"
          />

          <div className="measure flex flex-col gap-4">
            <h3 className="display m-0 text-lede">Arm Mechanism</h3>
            <p>
              A 9 inch aluminum tube clamped to the gearbox output, with a
              through-bore CANcoder reading the joint angle. That encoder is the
              main thing the flywheel list does not have.
            </p>

            <div className="flex flex-wrap gap-3">
              <a
                href="/cad/HTTI Mechanism v2 - Arm Mode.stl"
                download
                className={DOWNLOAD_LINK}
              >
                <Package className="h-4 w-4" aria-hidden="true" />
                Download STL
              </a>
              <a
                href="/cad/HTTI Mechanism v2 - Arm Mode.stp"
                download
                className={DOWNLOAD_LINK}
              >
                <Wrench className="h-4 w-4" aria-hidden="true" />
                Download STP
              </a>
              <a
                href="https://cad.onshape.com/documents/1526b66636cd3480c668b626/w/5db28f1a1dfc3c271601c02c/e/a3954701d9987f0ea70d8b60"
                target="_blank"
                rel="noopener noreferrer"
                className={DOWNLOAD_LINK}
              >
                <BoxIcon className="h-4 w-4" aria-hidden="true" />
                Onshape CAD
              </a>
            </div>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full min-w-[520px] border-collapse text-note">
            <thead>
              <tr style={{ borderBottom: "1px solid var(--rule)" }}>
                <th className="px-3 py-2 text-left">File</th>
                <th className="px-3 py-2 text-left">Opens in</th>
                <th className="px-3 py-2 text-left">Use it to</th>
              </tr>
            </thead>
            <tbody style={{ color: "var(--tx2)" }}>
              <tr style={{ borderBottom: "1px solid var(--rule-soft)" }}>
                <td className="px-3 py-2">
                  <code>.stl</code>
                </td>
                <td className="px-3 py-2">PrusaSlicer, Cura, Bambu Studio</td>
                <td className="px-3 py-2">Slice and print a part as drawn.</td>
              </tr>
              <tr style={{ borderBottom: "1px solid var(--rule-soft)" }}>
                <td className="px-3 py-2">
                  <code>.stp</code>
                </td>
                <td className="px-3 py-2">Fusion 360, SolidWorks, Onshape</td>
                <td className="px-3 py-2">
                  Change a dimension before you print.
                </td>
              </tr>
              <tr>
                <td className="px-3 py-2">Onshape</td>
                <td className="px-3 py-2">A browser, nothing installed</td>
                <td className="px-3 py-2">Measure a part or check a fit.</td>
              </tr>
            </tbody>
          </table>
        </div>
      </LessonSection>

      <LessonSection id="bill-of-materials" title="Bill of materials">
        <Split>
          <div className="measure flex flex-col gap-pad [&>p]:m-0 [&>p]:prose-body">
            <p>
              Both lists are complete down to the CAN terminating resistor. Open{" "}
              <strong>Show Details</strong> to sort, filter by vendor, or print
              a shopping list for whoever orders parts.
            </p>
            <p>
              All new, the arm comes to about $860 and the flywheel to about
              $800. Most of that is CTRE hardware. Tick{" "}
              <strong>Recycle CTRE Parts</strong> and{" "}
              <strong>3D Print for $5 Total</strong> and the arm lands near
              $170.
            </p>
            <p>
              Most rows come from West Coast Products, with the extrusion and
              T-nuts at Tnutz and the collars, resistor and Wago nuts at
              AndyMark. The Kraken ships from CTRE, and the arm hub from
              ThriftyBot. Place all five orders the same day. Nothing stalls a
              build like waiting a week on a 19 cent resistor.
            </p>
          </div>
          <MarginNote label="One CANivore">
            The CANivore is the most expensive line on either list, and a single
            one runs both builds. If your team owns one, it does not need to be
            on the order.
          </MarginNote>
        </Split>

        <BillOfMaterials items={armBOMData} title="Arm Mechanism" />
        <BillOfMaterials items={shooterBOMData} title="Shooter Mechanism" />
      </LessonSection>

      <LessonSection id="printing-the-parts" title="Printing the parts">
        <p>
          Seven rows on the arm list are marked printable, and the gearbox and
          its gears are four of them. Printing them instead of buying saves
          about $150, and hands you the part of the mechanism most likely to
          fail.
        </p>
        <p>
          Print the gears in something stiffer than PLA. A Kraken X44 behind a
          two-stage reduction strips PLA teeth, and a stripped tooth makes no
          noise. The mechanism stops reaching its target and nothing tells you
          why.
        </p>
        <p>
          Printed gearbox plates need the four flanged bearings and the long{" "}
          <code>#10-32</code> screws further down the list. The bought kit
          includes those. Those are the rows people skip.
        </p>
        <ol className="ml-5 list-decimal space-y-3">
          <li>
            Print one tube plug sleeve and test fit it before anything else. The
            plugs are cut for .125 inch wall and the tube is .0625 inch, so the
            sleeve makes up the difference.
          </li>
          <li>
            Measure that first print against the model. A slicer that read the
            file in the wrong units hands you a part that looks correct on its
            own.
          </li>
          <li>
            Print the gearbox plates next, then dry-fit the bearings before
            anything else goes in.
          </li>
          <li>
            Print the gears last. Reprinting one is cheap. Reprinting four
            because the plate spacing was wrong is not.
          </li>
        </ol>
      </LessonSection>

      <LessonSection id="assembly-notes" title="Assembly notes">
        <p>
          None of this is in the CAD. Build in this order and you will not have
          to take the mechanism back apart.
        </p>
        <ol className="ml-5 list-decimal space-y-3">
          <li>
            Cut the tube to 9 inches and the extrusion to 10 inches first. WCP
            ships tube in 48 inch sticks, and Tnutz will cut extrusion to any
            length you ask for.
          </li>
          <li>
            Slide all eleven T-nuts into the extrusion before the end cap goes
            on. They are 10-32. Adding a twelfth later means pulling the cap.
          </li>
          <li>
            Build the gearbox on the bench, not on the mechanism. It should turn
            by hand with no gear noise before it bolts to anything.
          </li>
          <li>
            Set the hex collar clamps so nothing rubs the CANcoder. The collars
            on the list carry a ridge for that. A shaft walking sideways into an
            encoder reads as a dead sensor.
          </li>
          <li>
            Bolt the base to a bench or a steel plate. Not to a folding table.
          </li>
          <li>
            Wire the CAN chain late, with the terminating resistor at the far
            end from the CANivore. The two-slot lever nuts hold it.
          </li>
          <li>
            Land the battery leads dead last, with the battery in another room.
            The 12 gauge cable goes into the WAGO lever nuts once its alligator
            clips are cut off. Strip only enough to seat the wire, because bare
            copper on a battery lead will weld a wrench to your frame.
          </li>
        </ol>
        <Box variant="alert-danger" title="Bolt it down before power">
          <p>
            A Kraken X44 behind this gearbox will drag a bench that is not fixed
            down. Bolt the base before the arm sees power. The bench arm needs
            no stops because it clears a full turn. A reused or longer arm that
            cannot clear the bench needs a physical stop at each end of travel.
            Workshop 1 applies voltage by hand in Tuner X, and an inverted motor
            drives straight into whatever is in the way.
          </p>
        </Box>
      </LessonSection>

      <LessonSection id="check-your-work" title="Check your work">
        <p>
          Run this with the battery disconnected. Every line is cheap to fix on
          a build night. Finding one during Workshop 1 stops four people instead
          of you.
        </p>
        <Box variant="alert-success" title="Before Workshop 1">
          <ul className="ml-5 list-disc space-y-2">
            <li>
              The base is bolted down and does not shift when you lean on it.
            </li>
            <li>
              <strong>Arm:</strong> it turns a full circle by hand without
              touching the bench, with no binding and nothing rubbing the
              encoder. An arm that cannot clear lands on a stop you built at
              each end, not on the gearbox.
            </li>
            <li>
              <strong>Flywheel:</strong> it spins freely by hand and coasts for
              a second or two.
            </li>
            <li>
              One CAN chain runs from the CANivore through every device and ends
              in the resistor.
            </li>
            <li>Battery leads landed, polarity checked, no bare copper.</li>
          </ul>
        </Box>
        <p>
          Write the gear tooth counts on tape and stick it to the extrusion. The
          arm list builds 8:60 then 16:60, about 28:1. Workshop 1 never asks for
          it, because the arm&apos;s CANcoder reads the output shaft directly. A
          mechanism that reads only the motor&apos;s own sensor does need it.
          Counting teeth through an assembled gearbox is miserable.
        </p>
      </LessonSection>
    </PageTemplate>
  );
}
