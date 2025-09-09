"use client";

import PageTemplate from "@/components/PageTemplate";
import ModelViewer from "@/components/ModelViewer";
import BillOfMaterials from "@/components/BillOfMaterials";
import KeyConceptSection from "@/components/KeyConceptSection";
import AlertBox from "@/components/AlertBox";
import { armBOMData } from "@/data/armBOM";
import { shooterBOMData } from "@/data/shooterBOM";

export default function MechanismCAD() {

  return (
    <PageTemplate
      title="Mechanism CAD"
      previousPage={{ href: "/prerequisites", title: "Prerequisites" }}
      nextPage={{ href: "/hardware", title: "Hardware Setup" }}
    >
      {/* Introduction */}
      <KeyConceptSection
        title="Mechanism CAD - 3D Model Exploration"
        description="Before diving into programming, we first need a physical mechanism. If you do not have a previous robot or mechanism below are 3D models of mechanisms you can build affordably."
        concept="Interactive 3D model of the Flywheel mechanism."
      />

      {/* 3D Model Viewer Section */}
      <section className="flex flex-col gap-8">
        <h2 className="text-3xl font-bold text-slate-900 dark:text-slate-100">
          Interactive 3D Models
        </h2>
        
        {/* Flywheel Mechanism */}
        <div className="bg-slate-50 dark:bg-slate-900 rounded-lg p-8 shadow-lg border border-slate-200 dark:border-slate-800">
          <div className="flex flex-col items-center gap-6">
            <div className="w-full max-w-4xl">
              <ModelViewer 
                url="/cad/HTTI Mechanism v2 - Shooter Mode.gltf"
                width={800}
                height={600}
                className="w-full shadow-lg"
              />
            </div>
            
            <div className="text-center space-y-4">
              <h3 className="text-xl font-semibold text-slate-900 dark:text-slate-100">
                Flywheel Mechanism
              </h3>
              <p className="text-slate-600 dark:text-slate-300 max-w-2xl">
                This 3D model represents the mechanism you&apos;ll be programming in this workshop. 
                Use your mouse to orbit around the model, zoom in/out, and examine the design from different angles.
              </p>
              
              {/* Download Buttons */}
              <div className="flex gap-3">
                <a
                  href="/cad/HTTI Mechanism v2 - Shooter Mode.stl"
                  download
                  className="flex-1 bg-primary-600 hover:bg-primary-700 text-white px-4 py-2 rounded-lg text-center font-medium transition-colors"
                >
                  📦 Download STL
                </a>
                <a
                  href="/cad/HTTI Mechanism v2 - Shooter Mode.stp"
                  download
                  className="flex-1 bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg text-center font-medium transition-colors"
                >
                  🔧 Download STP
                </a>
              </div>
              <button
                disabled
                className="bg-slate-300 dark:bg-slate-700 text-slate-500 dark:text-slate-400 px-4 py-2 rounded-lg text-center font-medium cursor-not-allowed mt-2"
              >
                🖨️ Bambu Files - Coming Soon
              </button>
            </div>
          </div>
        </div>

        {/* Arm Mechanism */}
        <div className="bg-slate-50 dark:bg-slate-900 rounded-lg p-8 shadow-lg border border-slate-200 dark:border-slate-800">
          <div className="flex flex-col items-center gap-6">
            <div className="w-full max-w-4xl">
              <ModelViewer 
                url="/cad/HTTI Mechanism v2 - Arm Mode.gltf"
                width={800}
                height={600}
                className="w-full shadow-lg"
              />
            </div>
            
            <div className="text-center space-y-4">
              <h3 className="text-xl font-semibold text-slate-900 dark:text-slate-100">
                Arm Mechanism
              </h3>
              <p className="text-slate-600 dark:text-slate-300 max-w-2xl">
                An Arm mechanism for Workshop programming. This arm mechanism demonstrates 
                precise positioning and control concepts that are essential in FRC robotics.
              </p>
              
              {/* Download Buttons */}
              <div className="flex gap-3">
                <a
                  href="/cad/HTTI Mechanism v2 - Arm Mode.stl"
                  download
                  className="flex-1 bg-primary-600 hover:bg-primary-700 text-white px-4 py-2 rounded-lg text-center font-medium transition-colors"
                >
                  📦 Download STL
                </a>
                <a
                  href="/cad/HTTI Mechanism v2 - Arm Mode.stp"
                  download
                  className="flex-1 bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg text-center font-medium transition-colors"
                >
                  🔧 Download STP
                </a>
              </div>
              <button
                disabled
                className="bg-slate-300 dark:bg-slate-700 text-slate-500 dark:text-slate-400 px-4 py-2 rounded-lg text-center font-medium cursor-not-allowed mt-2"
              >
                🖨️ Bambu Files - Coming Soon
              </button>
            </div>
          </div>
        </div>

        {/* File Format Guide */}
        <AlertBox variant="info" title="📋 File Format Guide">
          <div className="grid md:grid-cols-2 gap-4 text-sm">
            <div>
              <h5 className="font-bold text-blue-800 dark:text-blue-300 mb-2">STL Files</h5>
              <p className="text-blue-700 dark:text-blue-300">
                Standard format for 3D printing. Compatible with most slicers including PrusaSlicer, Cura, and Bambu Studio.
              </p>
            </div>
            <div>
              <h5 className="font-bold text-blue-800 dark:text-blue-300 mb-2">STP Files</h5>
              <p className="text-blue-700 dark:text-blue-300">
                CAD format for editing and modification. Opens in Fusion 360, SolidWorks, and other CAD software.
              </p>
            </div>
          </div>
        </AlertBox>

        {/* Arm Bill of Materials */}
        <div className="mt-8">
          <BillOfMaterials items={armBOMData} title="Arm Mechanism" />
        </div>

        {/* Shooter Bill of Materials */}
        <div className="mt-8">
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
                Ready for Programming!!!
              </h3>
              <p className="text-primary-800 dark:text-primary-300">
                Now that you have a mechanism, you&apos;re ready to move on to connecting 
                and configuring the code to make this work. We&apos;ll cover motors, sensors, 
                and controllers needed to bring this CAD model to life.
              </p>
            </div>
          </div>
        </div>
      </section>
    </PageTemplate>
  );
}