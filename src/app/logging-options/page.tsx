import ComingSoonPage from "@/components/ComingSoonPage";

export default function LoggingOptions() {
  return (
    <ComingSoonPage
      title="Logging Options"
      previousPage={{ href: "/vision-implementation", title: "Implementing Vision" }}
      nextPage={{ href: "/logging-implementation", title: "Implementing Logging" }}
    />
  );
}