"use client";

import PageTemplate from "@/components/PageTemplate";
import Link from "next/link";
import STLViewer from "@/components/STLViewer";

export default function MechanismCAD() {

  return (
    <PageTemplate
      title="Mechanism CAD"
      previousPage={{ href: "/prerequisites", title: "Prerequisites" }}
      nextPage={{ href: "/hardware", title: "Hardware Setup" }}
    >
      {/* Introduction */}
      <div className="bg-[var(--card)] text-[var(--foreground)] rounded-lg p-8 border border-[var(--border)]">
        <h2 className="text-3xl font-bold text-slate-900 dark:text-slate-100 mb-4">
          Mechanism CAD
        </h2>
        <p className="text-[var(--muted-foreground)] mb-4">
          Before diving into programming, we first need a physical mechanism. Provided below are STL files so you can 3D print 
          the major parts of the mechanism that would normally cost several hundred dollars.
        </p>
        <div className="bg-learn-100 dark:bg-learn-900/30 p-4 rounded-lg">
          <p className="text-learn-800 dark:text-learn-300 font-medium">
            🎯 Key Concept: STL files for mechanisms you can build.
          </p>
        </div>
      </div>

      {/* 3D Model Viewer Section */}
      <section className="flex flex-col gap-8">
        <h2 className="text-3xl font-bold text-slate-900 dark:text-slate-100">
          Interactive 3D Model
        </h2>
        
        <div className="bg-slate-50 dark:bg-slate-900 rounded-lg p-8 shadow-lg border border-slate-200 dark:border-slate-800">
          <div className="flex flex-col items-center gap-6">
            <div className="w-full max-w-4xl">
              <STLViewer 
                url="/cad/Xenomorph_Duck.stl"
                width={800}
                height={600}
                className="w-full shadow-lg"
              />
            </div>
            
            <div className="text-center space-y-4">
              <h3 className="text-xl font-semibold text-slate-900 dark:text-slate-100">
                Workshop Mechanism Model
              </h3>
              <p className="text-slate-600 dark:text-slate-300 max-w-2xl">
                This 3D model represents the mechanism you&apos;ll be programming in this workshop. 
                Use your mouse to orbit around the model, zoom in/out, and examine the design from different angles.
              </p>
              
              {/* Download Button */}
              <Link
                href="/cad/Xenomorph_Duck.stl"
                download="Xenomorph_Duck.stl"
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