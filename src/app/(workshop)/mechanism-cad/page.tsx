"use client";

import PageTemplate from "@/components/PageTemplate";
import ModelViewer, { ModelViewerRef } from "@/components/ModelViewer";
import BillOfMaterials from "@/components/BillOfMaterials";
import KeyConceptSection from "@/components/KeyConceptSection";
import Box from "@/components/Box";
import { armBOMData } from "@/data/armBOM";
import { shooterBOMData } from "@/data/shooterBOM";
import { useRef } from "react";
import { Package, Wrench, ClipboardCheck, Box as BoxIcon } from "lucide-react";

export default function MechanismCAD() {
  const flywheelModelRef = useRef<ModelViewerRef>(null);
  const armModelRef = useRef<ModelViewerRef>(null);

  return (
    <PageTemplate title="Mechanism CAD">
      {/* Introduction */}
      <KeyConceptSection
        title="Mechanism CAD - 3D Model Exploration"
        description="Before we write any code, we need a physical mechanism. If you don't have a previous robot or mechanism to use, below are 3D models of mechanisms you can build affordably."
        concept="Interactive 3D model of the Flywheel mechanism."
      />

      {/* 3D Model Viewer Section */}
      <section className="flex flex-col gap-8 -mx-4 sm:-mx-6 md:-mx-8 lg:-mx-12 xl:-mx-16">
        <h2 className="text-3xl font-bold text-slate-900 dark:text-slate-100 px-4 sm:px-6 md:px-8 lg:px-12 xl:px-16">
          Interactive 3D Models
        </h2>

        {/* Flywheel Mechanism */}
        <div className="bg-slate-50 dark:bg-slate-900 rounded-lg p-4 md:p-8 shadow-lg border border-slate-200 dark:border-slate-800 mx-4 sm:mx-6 md:mx-8 lg:mx-12 xl:mx-16">
          <div className="flex flex-col gap-6">
            <div className="w-full">
              <ModelViewer
                ref={flywheelModelRef}
                url="/cad/HTTI Mechanism v2 - Shooter Mode.gltf"
                className="w-full h-64 sm:h-80 md:h-96 lg:h-[600px] shadow-lg"
                showResetButton={true}
              />
            </div>

            <div className="text-center space-y-4">
              <h3 className="text-xl font-semibold text-slate-900 dark:text-slate-100">
                Flywheel Mechanism
              </h3>
              <p className="text-slate-600 dark:text-slate-300 max-w-2xl">
                This is the mechanism you&apos;ll be programming in this
                workshop. Use your mouse to orbit the model, zoom in and out,
                and examine the design from different angles.
              </p>

              {/* Download Buttons */}
              <div className="flex gap-3">
                <a
                  href="/cad/HTTI Mechanism v2 - Shooter Mode.stl"
                  download
                  className="flex-1 bg-primary-600 hover:bg-primary-700 text-white px-4 py-2 rounded-lg text-center font-medium transition-colors flex items-center justify-center gap-2"
                >
                  <Package className="w-4 h-4" />
                  Download STL
                </a>
                <a
                  href="/cad/HTTI Mechanism v2 - Shooter Mode.stp"
                  download
                  className="flex-1 bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg text-center font-medium transition-colors flex items-center justify-center gap-2"
                >
                  <Wrench className="w-4 h-4" />
                  Download STP
                </a>
                <a
                  href="https://cad.onshape.com/documents/1ca9ee00bfdd386abbe2ae30"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex-1 bg-orange-500 hover:bg-orange-600 text-white px-4 py-2 rounded-lg text-center font-medium transition-colors flex items-center justify-center gap-2"
                >
                  <BoxIcon className="w-4 h-4" />
                  Onshape CAD
                </a>
              </div>
            </div>
          </div>
        </div>

        {/* Arm Mechanism */}
        <div className="bg-slate-50 dark:bg-slate-900 rounded-lg p-4 md:p-8 shadow-lg border border-slate-200 dark:border-slate-800 mx-4 sm:mx-6 md:mx-8 lg:mx-12 xl:mx-16">
          <div className="flex flex-col gap-6">
            <div className="w-full">
              <ModelViewer
                ref={armModelRef}
                url="/cad/HTTI Mechanism v2 - Arm Mode.gltf"
                className="w-full h-64 sm:h-80 md:h-96 lg:h-[600px] shadow-lg"
                showResetButton={true}
              />
            </div>

            <div className="text-center space-y-4">
              <h3 className="text-xl font-semibold text-slate-900 dark:text-slate-100">
                Arm Mechanism
              </h3>
              <p className="text-slate-600 dark:text-slate-300 max-w-2xl">
                The arm version of the workshop mechanism. You&apos;ll use it to
                practice precise positioning and control, which come up on
                nearly every FRC robot.
              </p>

              {/* Download Buttons */}
              <div className="flex gap-3">
                <a
                  href="/cad/HTTI Mechanism v2 - Arm Mode.stl"
                  download
                  className="flex-1 bg-primary-600 hover:bg-primary-700 text-white px-4 py-2 rounded-lg text-center font-medium transition-colors flex items-center justify-center gap-2"
                >
                  <Package className="w-4 h-4" />
                  Download STL
                </a>
                <a
                  href="/cad/HTTI Mechanism v2 - Arm Mode.stp"
                  download
                  className="flex-1 bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg text-center font-medium transition-colors flex items-center justify-center gap-2"
                >
                  <Wrench className="w-4 h-4" />
                  Download STP
                </a>
                <a
                  href="https://cad.onshape.com/documents/1526b66636cd3480c668b626/w/5db28f1a1dfc3c271601c02c/e/a3954701d9987f0ea70d8b60"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex-1 bg-orange-500 hover:bg-orange-600 text-white px-4 py-2 rounded-lg text-center font-medium transition-colors flex items-center justify-center gap-2"
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
          <Box
            variant="alert-info"
            title="File Format Guide"
            icon={<ClipboardCheck className="w-5 h-5" />}
          >
            <div className="grid md:grid-cols-2 gap-4 text-sm">
              <div>
                <h5 className="font-bold text-blue-800 dark:text-blue-300 mb-2">
                  STL Files
                </h5>
                <p className="text-blue-700 dark:text-blue-300">
                  Standard format for 3D printing. Compatible with most slicers
                  including PrusaSlicer, Cura, and Bambu Studio.
                </p>
              </div>
              <div>
                <h5 className="font-bold text-blue-800 dark:text-blue-300 mb-2">
                  STP Files
                </h5>
                <p className="text-blue-700 dark:text-blue-300">
                  CAD format for editing and modification. Opens in Fusion 360,
                  SolidWorks, and other CAD software.
                </p>
              </div>
            </div>
          </Box>
        </div>

        {/* Arm Bill of Materials */}
        <div className="mt-8 px-4 sm:px-6 md:px-8 lg:px-12 xl:px-16">
          <BillOfMaterials items={armBOMData} title="Arm Mechanism" />
        </div>

        {/* Shooter Bill of Materials */}
        <div className="mt-8 px-4 sm:px-6 md:px-8 lg:px-12 xl:px-16">
          <BillOfMaterials items={shooterBOMData} title="Shooter Mechanism" />
        </div>
      </section>

      {/* Next Steps */}
      <section className="flex flex-col gap-8">
        <h2 className="text-3xl font-bold text-slate-900 dark:text-slate-100">
          What&apos;s Next?
        </h2>

        <div className="bg-primary-50 dark:bg-primary-950/30 rounded-lg p-8 border border-primary-200 dark:border-primary-900">
          <div className="flex items-start space-x-4">
            <div className="flex-shrink-0">
              <div className="flex items-center justify-center w-12 h-12 bg-primary-100 dark:bg-primary-900/50 rounded-lg">
                <svg
                  className="w-6 h-6 text-primary-600 dark:text-primary-400"
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
              <h3 className="text-lg font-semibold text-primary-900 dark:text-primary-300 mb-2">
                Ready for Programming
              </h3>
              <p className="text-primary-800 dark:text-primary-300">
                Now that you have a mechanism, the next step is connecting the
                hardware and writing the code to run it. We&apos;ll cover the
                motors, sensors, and controllers needed to bring this CAD model
                to life.
              </p>
            </div>
          </div>
        </div>
      </section>
    </PageTemplate>
  );
}
