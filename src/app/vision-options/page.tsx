import ComingSoonPage from "@/components/ComingSoonPage";

export default function VisionOptions() {
  return (
    <ComingSoonPage
      title="Vision Options"
      previousPage={{ href: "/pathplanner", title: "Adding PathPlanner" }}
      nextPage={{ href: "/vision-implementation", title: "Implementing Vision" }}
    />
  );
}