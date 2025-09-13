import ComingSoonPage from "@/components/ComingSoonPage";

export default function PathPlanner() {
  return (
    <ComingSoonPage
      title="Adding PathPlanner"
      previousPage={{
        href: "/swerve-drive-project",
        title: "Creating a Swerve Drive Project",
      }}
      nextPage={{ href: "/vision-options", title: "Vision Options" }}
    />
  );
}
