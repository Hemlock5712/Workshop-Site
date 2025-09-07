import ComingSoonPage from "@/components/ComingSoonPage";

export default function VisionImplementation() {
  return (
    <ComingSoonPage
      title="Implementing Vision"
      previousPage={{ href: "/vision-options", title: "Vision Options" }}
      nextPage={{ href: "/logging-options", title: "Logging Options" }}
    />
  );
}