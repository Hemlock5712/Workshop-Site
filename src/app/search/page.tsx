import { Suspense } from "react";
import PageTemplate from "@/components/PageTemplate";
import SearchPageContent from "./SearchPageContent";

function SearchFallback() {
  return (
    <div className="max-w-4xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-slate-900 dark:text-slate-100 mb-4">
          Search Results
        </h1>
      </div>
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
        <span className="ml-2 text-slate-600 dark:text-slate-300">
          Loading search...
        </span>
      </div>
    </div>
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
