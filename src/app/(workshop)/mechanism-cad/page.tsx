import PageTemplate from "@/components/PageTemplate";
import LessonSection from "@/components/lesson/LessonSection";
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
      lede="The course runs on a real arm or a real flywheel on a bench. This page has the 3D models, the parts lists, and the build notes for both. Teams attending in person can skip it, and so can a team that already has a mechanism with a TalonFX on it."
      time="5 minutes"
    >
      <Split>
        <div className="measure flex flex-col gap-pad [&>p]:m-0 [&>p]:prose-body">
          <p>
            Both builds start from the same base: 1x2 aluminum tube, T-slot
            extrusion, and a two-stage WCP rotation gearbox. The two parts lists
            share most of their rows, so parts from one build can be recycled
            into the other.
          </p>
        </div>
        <MarginNote label="Already have one?">
          An old competition arm or shooter works. It needs a TalonFX on it and
          a CANivore.
        </MarginNote>
      </Split>

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
              A 9 inch aluminum tube on the gearbox output, with a through-bore
              CANcoder reading the joint angle. That encoder is the main thing
              the flywheel list does not have.
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
              ThriftyBot.
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
          Seven rows on the arm list are marked printable, including the gearbox
          and its gears. A printed gearbox also needs the four flanged bearings
          and the long <code>#10-32</code> screws further down the list, which
          the bought kit already includes.
        </p>
      </LessonSection>

      <LessonSection id="assembly-notes" title="Assembly notes">
        <ul className="ml-5 list-disc space-y-3">
          <li>
            Slide all eleven T-nuts into the extrusion before the end cap goes
            on. Adding one later means pulling the cap.
          </li>
          <li>
            Build the gearbox on the bench first. It should turn by hand with no
            gear noise before it bolts to anything. While the gears are in your
            hand, write the tooth counts on a strip of tape and stick it to the
            extrusion.
          </li>
          <li>Set the hex collar clamps so nothing rubs the CANcoder.</li>
          <li>
            Wire the CAN chain with the terminating resistor at the far end from
            the CANivore. The two-slot lever nuts hold it.
          </li>
          <li>
            The mechanism never connects to a battery directly. Cut the
            alligator clips off the SB50 adapter cable and seat its leads in the
            WAGO lever nuts. The battery&apos;s own SB50 connector plugs into
            that adapter.
          </li>
        </ul>
      </LessonSection>

      <LessonSection id="check-your-work" title="Check your work">
        <p>Run this with the battery unplugged.</p>
        <Box variant="alert-success" title="Before Workshop 1">
          <ul className="ml-5 list-disc space-y-2">
            <li>
              <strong>Arm:</strong> it turns a full circle by hand without
              touching the bench, with no binding and nothing rubbing the
              encoder.
            </li>
            <li>
              <strong>Flywheel:</strong> it spins freely by hand.
            </li>
            <li>
              One CAN chain runs from the CANivore through every device and ends
              in the resistor.
            </li>
            <li>
              The SB50 adapter leads are seated in the lever nuts, polarity
              checked, with no bare copper showing.
            </li>
          </ul>
        </Box>
      </LessonSection>
    </PageTemplate>
  );
}
