"use client";

import PageTemplate from "@/components/PageTemplate";
import Link from "next/link";
import ModelViewer from "@/components/ModelViewer";
import BillOfMaterials from "@/components/BillOfMaterials";
import { armBOMData } from "@/data/armBOM";

export default function MechanismCAD() {

  return (
    <PageTemplate
      title="Mechanism CAD"
      previousPage={{ href: "/prerequisites", title: "Prerequisites" }}
      nextPage={{ href: "/hardware", title: "Hardware Setup" }}
    >
      {/* Introduction */}
      <div className="bg-focus-50 dark:bg-focus-900/20 text-[var(--foreground)] rounded-lg p-8 border border-focus-200 dark:border-focus-800">
        <h2 className="text-3xl font-bold text-slate-900 dark:text-slate-100 mb-4">
          Mechanism CAD - 3D Model Exploration
        </h2>
        <p className="text-[var(--muted-foreground)] mb-4">
          Before diving into programming, we first need a physical mechanism. If you do not have a previous robot or mechanism
          below are 3D models of mechanisms you can build affordably.
        </p>
        <div className="bg-learn-100 dark:bg-learn-900/30 p-4 rounded-lg">
          <p className="text-learn-800 dark:text-learn-300 font-medium">
            🎯 Key Concept: Interactive 3D model of the Flywheel mechanism.
          </p>
        </div>
      </div>

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
                url="/cad/HTTI Mechanism v1 - Shooter Mode.gltf"
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
              
              {/* Download Button */}
              <Link
                href="https://github.com/Hemlock5712/Workshop-Site/raw/refs/heads/master/public/cad/HTTI%20Mechanism%20v1%20-%20Shooter%20Mode.stl?download="
                download="HTTI Mechanism v1 - Shooter Mode.stl"
                className="inline-flex items-center gap-2 bg-primary-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-primary-700 transition-colors shadow-md"
              >
                <svg 
                  className="w-5 h-5" 
                  fill="none" 
                  stroke="currentColor" 
                  viewBox="0 0 24 24"
                >
                  <path 
                    strokeLinecap="round" 
                    strokeLinejoin="round" 
                    strokeWidth={2} 
                    d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" 
                  />
                </svg>
                Download STL File
              </Link>
            </div>
          </div>
        </div>

        {/* Arm Mechanism - Coming Soon */}
        <div className="bg-slate-50 dark:bg-slate-900 rounded-lg p-8 shadow-lg border border-slate-200 dark:border-slate-800">
          <div className="flex flex-col items-center gap-6">
            <div className="w-full max-w-4xl h-96 flex items-center justify-center bg-slate-100 dark:bg-slate-800 rounded-lg border-2 border-dashed border-slate-300 dark:border-slate-600">
              <div className="text-center space-y-4">
                <div className="w-16 h-16 mx-auto bg-slate-200 dark:bg-slate-700 rounded-full flex items-center justify-center">
                  <svg 
                    className="w-8 h-8 text-slate-500 dark:text-slate-400" 
                    fill="none" 
                    stroke="currentColor" 
                    viewBox="0 0 24 24"
                  >
                    <path 
                      strokeLinecap="round" 
                      strokeLinejoin="round" 
                      strokeWidth={2} 
                      d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" 
                    />
                  </svg>
                </div>
                <h4 className="text-xl font-semibold text-slate-600 dark:text-slate-300">
                  Coming Soon
                </h4>
                <p className="text-slate-500 dark:text-slate-400">
                  Interactive 3D model coming soon
                </p>
              </div>
            </div>
            
            <div className="text-center space-y-4">
              <h3 className="text-xl font-semibold text-slate-900 dark:text-slate-100">
                Arm Mechanism
              </h3>
              <p className="text-slate-600 dark:text-slate-300 max-w-2xl">
                An Arm mechanism for Workshop programming. This arm mechanism demonstrates 
                precise positioning and control concepts that are essential in FRC robotics.
              </p>
            </div>
          </div>
        </div>

        {/* Arm Bill of Materials */}
        <div className="mt-8">
          <BillOfMaterials items={armBOMData} title="Arm Mechanism" />
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