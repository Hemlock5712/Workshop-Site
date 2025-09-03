import PageTemplate from "@/components/PageTemplate";

export default function ProjectSetup() {
  return (
    <PageTemplate
      title="Project Setup"
      previousPage={{ href: "/hardware", title: "Hardware Setup" }}
      nextPage={{ href: "/command-framework", title: "Command Framework" }}
    >
      <div className="bg-white dark:bg-gray-900 rounded-lg p-8 shadow-lg border border-gray-200 dark:border-gray-800">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-6">Creating a New WPILib Project</h2>
        <p className="text-gray-600 dark:text-gray-300 mb-6">Follow these step-by-step instructions to create a new FRC robot project using the Command Robot Skeleton (Advanced) template.</p>

        <div className="space-y-4">
          <div className="flex items-start space-x-3">
            <span className="bg-blue-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-sm font-bold">
              1
            </span>
            <div>
              <p className="font-medium">Open VSCode</p>
              <p className="text-gray-600 dark:text-gray-300 text-sm">
                Launch Visual Studio Code with the WPILib extension installed.
              </p>
            </div>
          </div>

          <div className="flex items-start space-x-3">
            <span className="bg-blue-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-sm font-bold">
              2
            </span>
            <div>
              <p className="font-medium">Select the WPILib Logo in Top Right Corner</p>
              <p className="text-gray-600 dark:text-gray-300 text-sm">
                Click on the WPILib logo/icon in the top right corner of VSCode.
              </p>
            </div>
          </div>

          <div className="flex items-start space-x-3">
            <span className="bg-blue-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-sm font-bold">
              3
            </span>
            <div>
              <p className="font-medium">Select "Create a New Project"</p>
              <p className="text-gray-600 dark:text-gray-300 text-sm">
                From the WPILib menu, choose the "Create a new project" option.
              </p>
            </div>
          </div>

          <div className="flex items-start space-x-3">
            <span className="bg-blue-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-sm font-bold">
              4
            </span>
            <div>
              <p className="font-medium">Select "Select a project type (Example or Template)"</p>
              <p className="text-gray-600 dark:text-gray-300 text-sm">
                Choose Template → Java → <strong>Command Robot Skeleton (Advanced)</strong>
              </p>
            </div>
          </div>

          <div className="flex items-start space-x-3">
            <span className="bg-blue-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-sm font-bold">
              5
            </span>
            <div>
              <p className="font-medium">Base folder select "Downloads"</p>
              <div className="bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-900 rounded p-3 mt-2">
                <p className="text-red-800 dark:text-red-300 text-sm">
                  ⚠️ <strong>Warning:</strong> OneDrive locations are not supported and will cause project creation to fail.
                </p>
              </div>
            </div>
          </div>

          <div className="flex items-start space-x-3">
            <span className="bg-blue-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-sm font-bold">
              6
            </span>
            <div>
              <p className="font-medium">Project Name "Workshop"</p>
              <p className="text-gray-600 dark:text-gray-300 text-sm">
                Enter "Workshop" as your project name.
              </p>
            </div>
          </div>

          <div className="flex items-start space-x-3">
            <span className="bg-blue-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-sm font-bold">
              7
            </span>
            <div>
              <p className="font-medium">Team Number</p>
              <p className="text-gray-600 dark:text-gray-300 text-sm">
                Enter your FRC team number. This is required for deploying code to your robot.
              </p>
            </div>
          </div>

          <div className="flex items-start space-x-3">
            <span className="bg-blue-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-sm font-bold">
              8
            </span>
            <div>
              <p className="font-medium">Check "Enable Desktop Support"</p>
              <p className="text-gray-600 dark:text-gray-300 text-sm">
                This allows you to test your robot code on your computer without a robot.
              </p>
            </div>
          </div>

          <div className="flex items-start space-x-3">
            <span className="bg-green-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-sm font-bold">
              ✓
            </span>
            <div>
              <p className="font-medium">Generate Project</p>
              <p className="text-gray-600 dark:text-gray-300 text-sm">
                Click "Generate Project" and then open the new project when prompted.
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

      <div className="bg-green-50 dark:bg-green-950/30 border border-green-200 dark:border-green-900 rounded-lg p-6">
        <p className="text-green-800 dark:text-green-300">
          ✅ <strong>Next Steps:</strong> After creating your project, you'll learn about the Command Framework in the next section. Your project will be ready for implementing subsystems and commands!
        </p>
      </div>
    </PageTemplate>
  );
}