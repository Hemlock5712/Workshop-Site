import ComingSoonPage from "@/components/ComingSoonPage";

export default function SwerveDriveProject() {
  return (
    <ComingSoonPage
      title="Creating a Swerve Drive Project"
      previousPage={{ href: "/motion-magic", title: "Motion Magic" }}
      nextPage={{ href: "/pathplanner", title: "Adding PathPlanner" }}
    />
  );
}
