import { Suspense } from "react";
import PageTemplate from "@/components/PageTemplate";
import SearchPageContent from "@/app/(workshop)/search/SearchPageContent";

/**
 * Shown while the MiniSearch index loads. No heading — `PageTemplate` already
 * rendered the page's `<h1>`, and the fallback used to render a second one.
 */
function SearchFallback() {
  return (
    <p
      className="mono measure"
      style={{
        fontSize: 10,
        letterSpacing: "0.14em",
        textTransform: "uppercase",
        color: "var(--tx3)",
      }}
    >
      Loading the index…
    </p>
  );
}

export default function SearchPage() {
  return (
    <PageTemplate title="Search Results">
      <Suspense fallback={<SearchFallback />}>
        <SearchPageContent />
      </Suspense>
    </PageTemplate>
  );
}
