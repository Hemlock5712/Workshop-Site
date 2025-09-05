import PageTemplate from "@/components/PageTemplate";

export default function ProjectSetup() {
  return (
    <PageTemplate
      title="Project Setup"
      previousPage={{ href: "/hardware", title: "Hardware Setup" }}
      nextPage={{ href: "/command-framework", title: "Command-Based Framework" }}
    >
      {/* Introduction */}
      <div className="bg-[var(--card)] text-[var(--foreground)] rounded-lg p-8 border border-[var(--border)]">
        <h2 className="text-3xl font-bold text-slate-900 dark:text-slate-100 mb-4">Project Setup - Launching Your Codebase</h2>
        <p className="text-[var(--muted-foreground)] mb-4">
          Step-by-step guide to generating a new WPILib project using the Command framework template.
        </p>
        <div className="bg-learn-100 dark:bg-learn-900/30 p-4 rounded-lg">
          <p className="text-learn-800 dark:text-learn-300 font-medium">
            🎯 Key Concept: Starting with the right template ensures organized commands and subsystems.
          </p>
        </div>
      </div>

      <div className="bg-slate-50 dark:bg-slate-900 rounded-lg p-8 shadow-lg border border-slate-200 dark:border-slate-800">
        <h2 className="text-3xl font-bold text-slate-900 dark:text-slate-100 mb-6">Creating a New WPILib Project</h2>
        <p className="text-slate-600 dark:text-slate-300 mb-6">Follow these step-by-step instructions to create a new FRC robot project using the Command Robot Skeleton (Advanced) template.</p>

        <div className="space-y-4">
          <div className="flex items-start space-x-3">
            <span className="bg-primary-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-sm font-bold">
              1
            </span>
            <div>
              <p className="font-medium">Open VSCode</p>
              <p className="text-slate-600 dark:text-slate-300 text-sm">
                Launch Visual Studio Code with the WPILib extension installed.
              </p>
            </div>
          </div>

          <div className="flex items-start space-x-3">
            <span className="bg-primary-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-sm font-bold">
              2
            </span>
            <div>
              <p className="font-medium">Select the WPILib Logo in Top Right Corner</p>
              <p className="text-slate-600 dark:text-slate-300 text-sm">
                Click on the WPILib logo/icon in the top right corner of VSCode.
              </p>
            </div>
          </div>

          <div className="flex items-start space-x-3">
            <span className="bg-primary-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-sm font-bold">
              3
            </span>
            <div>
              <p className="font-medium">Select &quot;Create a New Project&quot;</p>
              <p className="text-slate-600 dark:text-slate-300 text-sm">
                From the WPILib menu, choose the &quot;Create a new project&quot; option.
              </p>
            </div>
          </div>

          <div className="flex items-start space-x-3">
            <span className="bg-primary-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-sm font-bold">
              4
            </span>
            <div>
              <p className="font-medium">Select &quot;Select a project type (Example or Template)&quot;</p>
              <p className="text-slate-600 dark:text-slate-300 text-sm">
                Choose Template → Java → <strong>Command Robot Skeleton (Advanced)</strong>
              </p>
            </div>
          </div>

          <div className="flex items-start space-x-3">
            <span className="bg-primary-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-sm font-bold">
              5
            </span>
            <div>
              <p className="font-medium">Base folder select &quot;Downloads&quot;</p>
              <div className="bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-900 rounded p-3 mt-2">
                <p className="text-red-800 dark:text-red-300 text-sm">
                  ⚠️ <strong>Warning:</strong> OneDrive locations are not supported and will cause project creation to fail.
                </p>
              </div>
            </div>
          </div>

          <div className="flex items-start space-x-3">
            <span className="bg-primary-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-sm font-bold">
              6
            </span>
            <div>
              <p className="font-medium">Project Name &quot;Workshop&quot;</p>
              <p className="text-slate-600 dark:text-slate-300 text-sm">
                Enter &quot;Workshop&quot; as your project name.
              </p>
            </div>
          </div>

          <div className="flex items-start space-x-3">
            <span className="bg-primary-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-sm font-bold">
              7
            </span>
            <div>
              <p className="font-medium">Team Number</p>
              <p className="text-slate-600 dark:text-slate-300 text-sm">
                Enter your FRC team number. This is required for deploying code to your robot.
              </p>
            </div>
          </div>

          <div className="flex items-start space-x-3">
            <span className="bg-primary-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-sm font-bold">
              8
            </span>
            <div>
              <p className="font-medium">Check &quot;Enable Desktop Support&quot;</p>
              <p className="text-slate-600 dark:text-slate-300 text-sm">
                This allows you to test your robot code on your computer without a robot.
              </p>
            </div>
          </div>

          <div className="flex items-start space-x-3">
            <span className="bg-practice-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-sm font-bold">
              ✓
            </span>
            <div>
              <p className="font-medium">Generate Project</p>
              <p className="text-slate-600 dark:text-slate-300 text-sm">
                Click &quot;Generate Project&quot; and then open the new project when prompted.
              </p>
            </div>
          </div>
        </div>
      </div>

      <iframe
        src="https://www.youtube.com/embed/Y8ExsyaCC34"
        title="Project Setup Tutorial"
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
        allowFullScreen
        className="w-full h-full aspect-video rounded-lg"
      />

      <div className="bg-indigo-50 dark:bg-indigo-950/30 p-4 rounded mt-4">
        <p className="text-indigo-800 dark:text-indigo-300 text-sm">
          <strong>💡 Next Step:</strong> After creating your project, you&apos;ll learn about the Command-Based Framework in the next section. Your project will be ready for implementing subsystems and commands!
        </p>
      </div>
    </PageTemplate>
  );
}