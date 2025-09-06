import PageTemplate from "@/components/PageTemplate";

export default function SwerveDriveProject() {
  return (
    <PageTemplate
      title="Creating a Swerve Drive Project"
      previousPage={{ href: "/motion-magic", title: "Motion Magic" }}
      nextPage={{ href: "/pathplanner", title: "Adding PathPlanner" }}
    >
      <div className="flex items-center justify-center min-h-96">
        <div className="text-center">
          <h2 className="text-4xl font-bold text-slate-900 dark:text-slate-100 mb-4">
            Coming Soon
          </h2>
          <p className="text-xl text-slate-600 dark:text-slate-400">
            This workshop content is currently being developed.
          </p>
        </div>
      </div>
    </PageTemplate>
  );
}