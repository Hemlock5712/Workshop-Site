import PageTemplate from "@/components/PageTemplate";
import LessonSection from "@/components/lesson/LessonSection";
import ModelViewer from "@/components/ModelViewer";
import BillOfMaterials from "@/components/BillOfMaterials";
import KeyConceptSection from "@/components/KeyConceptSection";
import Box from "@/components/Box";
import { armBOMData } from "@/data/armBOM";
import { shooterBOMData } from "@/data/shooterBOM";
import { Package, Wrench, Box as BoxIcon } from "lucide-react";

/* Every download link is the same control, so it is written once. Three copies
   of a 200-character className is how the three of them drifted apart on the
   arm block and the flywheel block in the first place. `min-h-11` because
   these are the only tap targets on the page and `py-2` left them at 37px. */
const DOWNLOAD_LINK =
  "flex min-h-11 flex-1 items-center justify-center gap-2 rounded-md border border-[var(--rule)] bg-[var(--bg2)] px-4 text-note font-medium text-[var(--tx2)] transition-colors hover:border-[var(--accent)] hover:text-[var(--accent)]";

export default function MechanismCAD() {
  return (
    <PageTemplate
      title="The two mechanisms, in 3D, with the parts lists"
      emphasis="with the parts lists"
      lede="Every lesson in Workshop #1 drives one of these two. If your team already has an old competition arm or shooter, use that and skip this page: it exists for teams who need to build one."
      needs={[
        <>Nothing installed. The models spin in the browser.</>,
        <>
          To actually build one: a 3D printer, the bill of materials below, and
          the CTRE hardware from <strong>Prerequisites</strong>.
        </>,
      ]}
      time="10 minutes to look, a few evenings to build"
    >
      <KeyConceptSection
        description="Before we write any code, we need a physical mechanism. If you don't have a previous robot or mechanism to use, below are 3D models of mechanisms you can build affordably."
        concept="Know the physical mechanism before you write code for it: explore the arm and flywheel models in 3D below."
      />

      {/* No negative-margin breakout here. This section used to carry
          `-mx-4 … xl:-mx-16` with every panel inside paying it back as
          `mx-4 … xl:mx-16`, which is a full-bleed effect hand-rolled against
          the page's padding scale. When the panel insets were normalised the
          two scales stopped matching and the pair started overhanging the
          scroll container — 2px at 1440, 24px at 1280, and only clean at
          1024 and below because that is where the smaller `-mx` steps
          happened to fit. The `lesson-stack` column here is already capped at
          `.measure-wide` (660 + 250 + 44 = 954px), which is the sanctioned
          width for a figure crossing into the gutter, so the panels get the
          whole of it by simply not opting out.

          The bordered wrapper each viewer used to sit inside is gone with it.
          `ModelViewer` draws its own frame and control bar now, so the wrapper
          was a panel around a panel — two 1px rules 32px apart. */}
      <LessonSection id="interactive-3d-models" title="Interactive 3D Models">
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
              This is the mechanism you&apos;ll be programming in this workshop.
              Drag to orbit the model and scroll to zoom, or use the view
              buttons under it to jump to a fixed angle.
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
              The arm version of the workshop mechanism. You&apos;ll use it to
              practice precise positioning and control, which come up on nearly
              every FRC robot.
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

        <Box variant="alert-info" title="File format guide">
          {/* `h4`, not `h5`. These sit under the section's `h2` with an `h3`
              between, so `h5` skipped a level and left the page's heading
              outline unnavigable. */}
          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <h4
                className="display m-0 mb-2 text-aside"
                style={{ color: "var(--accent)" }}
              >
                STL Files
              </h4>
              <p className="m-0">
                Standard format for 3D printing. Compatible with most slicers
                including PrusaSlicer, Cura, and Bambu Studio.
              </p>
            </div>
            <div>
              <h4
                className="display m-0 mb-2 text-aside"
                style={{ color: "var(--accent)" }}
              >
                STP Files
              </h4>
              <p className="m-0">
                CAD format for editing and modification. Opens in Fusion 360,
                SolidWorks, and other CAD software.
              </p>
            </div>
          </div>
        </Box>
      </LessonSection>

      {/* The two parts lists — the second thing this page's title promises, and
          previously unreachable from the rail because they sat inside the 3D
          models section. */}
      <LessonSection id="bill-of-materials" title="Bill of materials">
        <BillOfMaterials items={armBOMData} title="Arm Mechanism" />
        <BillOfMaterials items={shooterBOMData} title="Shooter Mechanism" />
      </LessonSection>

      {/* Body copy in `--accent`, an accent-bordered panel and a hand-inlined
          lightning glyph — three paragraphs of prose painted in the one hue
          the design reserves for the primary action, which leaves the page
          with no primary action to mark. This is what a concept Box is for,
          and it is what every other lesson uses to close. */}
      <LessonSection id="what-s-next" title="What's next">
        <Box variant="concept" title="Ready for programming">
          Now that you have a mechanism, the next step is connecting the
          hardware and writing the code to run it. We&apos;ll cover the motors,
          sensors, and controllers needed to bring this CAD model to life.
        </Box>
      </LessonSection>
    </PageTemplate>
  );
}
