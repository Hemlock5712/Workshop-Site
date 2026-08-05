"use client";

import PageTemplate from "@/components/PageTemplate";
import LessonSection from "@/components/lesson/LessonSection";
import ModelViewer, { ModelViewerRef } from "@/components/ModelViewer";
import BillOfMaterials from "@/components/BillOfMaterials";
import KeyConceptSection from "@/components/KeyConceptSection";
import Box from "@/components/Box";
import { armBOMData } from "@/data/armBOM";
import { shooterBOMData } from "@/data/shooterBOM";
import { useRef } from "react";
import { Package, Wrench, Box as BoxIcon } from "lucide-react";

export default function MechanismCAD() {
  const flywheelModelRef = useRef<ModelViewerRef>(null);
  const armModelRef = useRef<ModelViewerRef>(null);

  return (
    <PageTemplate
      title="The two mechanisms, in 3D, with the parts lists"
      emphasis="with the parts lists"
      lede="Every lesson in Workshop #1 drives one of these two. If your team already has an old competition arm or shooter, use that and skip this page — it exists for teams who need to build one."
      needs={[
        <>Nothing installed. The models spin in the browser.</>,
        <>
          To actually build one: a 3D printer, the bill of materials below, and
          the CTRE hardware from <strong>Prerequisites</strong>.
        </>,
      ]}
      time="10 minutes to look, a few evenings to build"
    >
      {/* Introduction */}
      <KeyConceptSection
        description="Before we write any code, we need a physical mechanism. If you don't have a previous robot or mechanism to use, below are 3D models of mechanisms you can build affordably."
        concept="Know the physical mechanism before you write code for it: explore the arm and flywheel models in 3D below."
      />

      {/* 3D Model Viewer Section */}
      <LessonSection
        id="interactive-3d-models"
        title="Interactive 3D Models"
        className="-mx-4 sm:-mx-6 md:-mx-8 lg:-mx-12 xl:-mx-16"
      >
        {/* Flywheel Mechanism */}
        <div className="bg-[var(--bg2)] rounded-lg p-4 md:p-8 shadow-lg border border-[var(--rule)] mx-4 sm:mx-6 md:mx-8 lg:mx-12 xl:mx-16">
          <div className="flex flex-col gap-6">
            <div className="w-full">
              <ModelViewer
                ref={flywheelModelRef}
                url="/cad/HTTI Mechanism v2 - Shooter Mode.gltf"
                className="w-full h-64 sm:h-80 md:h-96 lg:h-[600px] shadow-lg"
                showResetButton={true}
              />
            </div>

            <div className="space-y-4">
              <h3 className="display m-0 text-lede">Flywheel Mechanism</h3>
              <p className="text-[var(--tx2)] max-w-2xl">
                This is the mechanism you&apos;ll be programming in this
                workshop. Use your mouse to orbit the model, zoom in and out,
                and examine the design from different angles.
              </p>

              {/* Download Buttons */}
              <div className="flex flex-wrap gap-3">
                <a
                  href="/cad/HTTI Mechanism v2 - Shooter Mode.stl"
                  download
                  className="flex-1 border border-[var(--rule)] bg-[var(--bg2)] text-[var(--tx2)] hover:border-[var(--accent)] hover:text-[var(--accent)] px-4 py-2 rounded-md font-medium transition-colors flex items-center justify-center gap-2"
                >
                  <Package className="w-4 h-4" />
                  Download STL
                </a>
                <a
                  href="/cad/HTTI Mechanism v2 - Shooter Mode.stp"
                  download
                  className="flex-1 border border-[var(--rule)] bg-[var(--bg2)] text-[var(--tx2)] hover:border-[var(--accent)] hover:text-[var(--accent)] px-4 py-2 rounded-md font-medium transition-colors flex items-center justify-center gap-2"
                >
                  <Wrench className="w-4 h-4" />
                  Download STP
                </a>
                <a
                  href="https://cad.onshape.com/documents/1ca9ee00bfdd386abbe2ae30"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex-1 border border-[var(--rule)] bg-[var(--bg2)] text-[var(--tx2)] hover:border-[var(--accent)] hover:text-[var(--accent)] px-4 py-2 rounded-md font-medium transition-colors flex items-center justify-center gap-2"
                >
                  <BoxIcon className="w-4 h-4" />
                  Onshape CAD
                </a>
              </div>
            </div>
          </div>
        </div>

        {/* Arm Mechanism */}
        <div className="bg-[var(--bg2)] rounded-lg p-4 md:p-8 shadow-lg border border-[var(--rule)] mx-4 sm:mx-6 md:mx-8 lg:mx-12 xl:mx-16">
          <div className="flex flex-col gap-6">
            <div className="w-full">
              <ModelViewer
                ref={armModelRef}
                url="/cad/HTTI Mechanism v2 - Arm Mode.gltf"
                className="w-full h-64 sm:h-80 md:h-96 lg:h-[600px] shadow-lg"
                showResetButton={true}
              />
            </div>

            <div className="space-y-4">
              <h3 className="display m-0 text-lede">Arm Mechanism</h3>
              <p className="text-[var(--tx2)] max-w-2xl">
                The arm version of the workshop mechanism. You&apos;ll use it to
                practice precise positioning and control, which come up on
                nearly every FRC robot.
              </p>

              {/* Download Buttons */}
              <div className="flex flex-wrap gap-3">
                <a
                  href="/cad/HTTI Mechanism v2 - Arm Mode.stl"
                  download
                  className="flex-1 border border-[var(--rule)] bg-[var(--bg2)] text-[var(--tx2)] hover:border-[var(--accent)] hover:text-[var(--accent)] px-4 py-2 rounded-md font-medium transition-colors flex items-center justify-center gap-2"
                >
                  <Package className="w-4 h-4" />
                  Download STL
                </a>
                <a
                  href="/cad/HTTI Mechanism v2 - Arm Mode.stp"
                  download
                  className="flex-1 border border-[var(--rule)] bg-[var(--bg2)] text-[var(--tx2)] hover:border-[var(--accent)] hover:text-[var(--accent)] px-4 py-2 rounded-md font-medium transition-colors flex items-center justify-center gap-2"
                >
                  <Wrench className="w-4 h-4" />
                  Download STP
                </a>
                <a
                  href="https://cad.onshape.com/documents/1526b66636cd3480c668b626/w/5db28f1a1dfc3c271601c02c/e/a3954701d9987f0ea70d8b60"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex-1 border border-[var(--rule)] bg-[var(--bg2)] text-[var(--tx2)] hover:border-[var(--accent)] hover:text-[var(--accent)] px-4 py-2 rounded-md font-medium transition-colors flex items-center justify-center gap-2"
                >
                  <BoxIcon className="w-4 h-4" />
                  Onshape CAD
                </a>
              </div>
            </div>
          </div>
        </div>

        {/* File Format Guide */}
        <div className="px-4 sm:px-6 md:px-8 lg:px-12 xl:px-16">
          <Box variant="alert-info" title="File Format Guide">
            <div className="grid md:grid-cols-2 gap-4 text-sm">
              <div>
                <h5
                  className="display m-0 mb-2 text-aside"
                  style={{ color: "var(--accent)" }}
                >
                  STL Files
                </h5>
                <p className="text-[var(--accent)]">
                  Standard format for 3D printing. Compatible with most slicers
                  including PrusaSlicer, Cura, and Bambu Studio.
                </p>
              </div>
              <div>
                <h5
                  className="display m-0 mb-2 text-aside"
                  style={{ color: "var(--accent)" }}
                >
                  STP Files
                </h5>
                <p className="text-[var(--accent)]">
                  CAD format for editing and modification. Opens in Fusion 360,
                  SolidWorks, and other CAD software.
                </p>
              </div>
            </div>
          </Box>
        </div>
      </LessonSection>

      {/* The two parts lists — the second thing this page's title promises, and
          previously unreachable from the rail because they sat inside the 3D
          models section. No inset wrappers here: the `px-*` they used to carry
          existed only to cancel the models section's `-mx-*` bleed, and this
          section has no bleed to cancel, so the tables render at the same
          width they did before. */}
      <LessonSection id="bill-of-materials" title="Bill of materials">
        <BillOfMaterials items={armBOMData} title="Arm Mechanism" />
        <BillOfMaterials items={shooterBOMData} title="Shooter Mechanism" />
      </LessonSection>

      {/* Next Steps */}
      <LessonSection id="what-s-next" title="What's next">
        <div className="bg-[var(--bg2)] rounded-lg p-8 border border-[var(--accent)]">
          <div className="flex items-start space-x-4">
            <div className="flex-shrink-0">
              <div className="flex items-center justify-center w-12 h-12 bg-[var(--bg2)] rounded-lg">
                <svg
                  className="w-6 h-6 text-[var(--accent)]"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M13 10V3L4 14h7v7l9-11h-7z"
                  />
                </svg>
              </div>
            </div>
            <div>
              <h3
                className="display m-0 mb-2 text-aside"
                style={{ color: "var(--accent)" }}
              >
                Ready for Programming
              </h3>
              <p className="text-[var(--accent)]">
                Now that you have a mechanism, the next step is connecting the
                hardware and writing the code to run it. We&apos;ll cover the
                motors, sensors, and controllers needed to bring this CAD model
                to life.
              </p>
            </div>
          </div>
        </div>
      </LessonSection>
    </PageTemplate>
  );
}
