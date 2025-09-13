"use client";

import { useSearchParams } from "next/navigation";
import { useEffect, useState, useRef } from "react";
import Link from "next/link";
import {
  createSearchInstance,
  SearchResult,
  mapMiniSearchResults,
} from "@/lib/searchConfig";

export default function SearchPageContent() {
  const searchParams = useSearchParams();
  const query = searchParams.get("q") || "";
  const [results, setResults] = useState<SearchResult[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const searchRef = useRef(createSearchInstance());

  useEffect(() => {
    setIsLoading(true);
    if (query.trim()) {
      const searchResults = searchRef.current.search(query.trim());
      const mappedResults = mapMiniSearchResults(searchResults);
      setResults(mappedResults);
    } else {
      setResults([]);
    }
    setIsLoading(false);
  }, [query]);

  const getCategoryColor = (category: string) => {
    switch (category) {
      case "Workshop 1":
        return "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300";
      case "Workshop 2":
        return "bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-300";
      case "Getting Started":
        return "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300";
      case "Resources":
        return "bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-300";
      default:
        return "bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-300";
    }
  };

  const highlightMatch = (text: string, queryTerm: string) => {
    if (!queryTerm.trim()) return text;

    const regex = new RegExp(
      `(${queryTerm.trim().replace(/[.*+?^${}()|[\]\\]/g, "\\$&")})`,
      "gi"
    );
    return text.replace(
      regex,
      '<mark class="bg-yellow-200 dark:bg-yellow-900/50 px-1 rounded">$1</mark>'
    );
  };

  const getMatchPreview = (item: SearchResult, queryTerm: string) => {
    // Check if query appears in content for a preview
    const lowerContent = item.content.toLowerCase();
    const lowerQuery = queryTerm.toLowerCase();
    const matchIndex = lowerContent.indexOf(lowerQuery);

    if (matchIndex !== -1) {
      const contextStart = Math.max(0, matchIndex - 50);
      const contextEnd = Math.min(
        item.content.length,
        matchIndex + queryTerm.length + 50
      );
      let preview = item.content.slice(contextStart, contextEnd);

      if (contextStart > 0) preview = "..." + preview;
      if (contextEnd < item.content.length) preview = preview + "...";

      return preview;
    }

    return item.description;
  };

  return (
    <div className="max-w-4xl mx-auto">
      {/* Search Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-slate-900 dark:text-slate-100 mb-4">
          Search Results
        </h1>
        {query && (
          <div className="flex items-center gap-2 text-slate-600 dark:text-slate-300">
            <span>Searching for:</span>
            <span className="bg-[var(--muted)] px-2 py-1 rounded font-mono text-sm">
              &quot;{query}&quot;
            </span>
            <span>•</span>
            <span>{results.length} results found</span>
          </div>
        )}
      </div>

      {/* Loading State */}
      {isLoading && (
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
          <span className="ml-2 text-slate-600 dark:text-slate-300">
            Searching...
          </span>
        </div>
      )}

      {/* No Query */}
      {!query && !isLoading && (
        <div className="text-center py-12">
          <svg
            className="mx-auto h-12 w-12 text-slate-400 dark:text-slate-500 mb-4"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="m21 21-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
            />
          </svg>
          <h3 className="text-xl font-medium text-slate-900 dark:text-slate-100 mb-2">
            No search query
          </h3>
          <p className="text-slate-600 dark:text-slate-300">
            Use the search bar above to find workshop content
          </p>
        </div>
      )}

      {/* No Results */}
      {query && !isLoading && results.length === 0 && (
        <div className="text-center py-12">
          <svg
            className="mx-auto h-12 w-12 text-slate-400 dark:text-slate-500 mb-4"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M9.172 16.172a4 4 0 015.656 0M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
            />
          </svg>
          <h3 className="text-xl font-medium text-slate-900 dark:text-slate-100 mb-2">
            No results found
          </h3>
          <p className="text-slate-600 dark:text-slate-300 mb-4">
            We couldn&apos;t find anything matching &quot;{query}&quot;
          </p>
          <div className="text-sm text-slate-500 dark:text-slate-400">
            <p>Try:</p>
            <ul className="list-disc list-inside mt-2 space-y-1">
              <li>
                Different keywords (e.g., &quot;PID&quot;, &quot;motor&quot;,
                &quot;subsystem&quot;)
              </li>
              <li>More general terms</li>
              <li>Checking for typos</li>
            </ul>
          </div>
        </div>
      )}

      {/* Search Results */}
      {!isLoading && results.length > 0 && (
        <div className="space-y-6">
          {results.map((result) => (
            <div
              key={result.id}
              className="bg-[var(--card)] border border-[var(--border)] rounded-lg p-6 shadow-sm hover:shadow-md transition-shadow"
            >
              <div className="flex items-start justify-between mb-3">
                <Link href={result.url} className="group flex-1">
                  <h2
                    className="text-xl font-semibold text-primary-600 dark:text-primary-400 group-hover:text-primary-800 dark:group-hover:text-primary-300 mb-2 leading-tight"
                    dangerouslySetInnerHTML={{
                      __html: highlightMatch(result.title, query),
                    }}
                  />
                </Link>
                <span
                  className={`px-3 py-1 rounded-full text-xs font-medium whitespace-nowrap ml-4 ${getCategoryColor(result.category)}`}
                >
                  {result.category}
                </span>
              </div>

              <p className="text-slate-600 dark:text-slate-300 mb-4 leading-relaxed">
                {getMatchPreview(result, query)}
              </p>

              <div className="flex items-center justify-between">
                <div className="flex flex-wrap gap-2">
                  {result.tags.slice(0, 5).map((tag) => (
                    <span
                      key={tag}
                      className="px-2 py-1 text-xs bg-[var(--muted)] text-[var(--muted-foreground)] rounded-full"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
                <div className="text-xs text-slate-500 dark:text-slate-400">
                  Score: {Math.round(result.score * 100) / 100}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Search Tips */}
      {results.length > 0 && (
        <div className="mt-12 bg-[var(--muted)] rounded-lg p-6">
          <h3 className="font-semibold text-[var(--foreground)] mb-3">
            Search Tips
          </h3>
          <div className="grid md:grid-cols-2 gap-4 text-sm text-[var(--muted-foreground)]">
            <div>
              <p className="font-medium mb-1">Keywords to try:</p>
              <ul className="space-y-1">
                <li>• &quot;PID control&quot; - Control theory</li>
                <li>• &quot;subsystem&quot; - Code architecture</li>
                <li>• &quot;motor&quot; - Hardware setup</li>
              </ul>
            </div>
            <div>
              <p className="font-medium mb-1">Advanced search:</p>
              <ul className="space-y-1">
                <li>• Use quotes for exact phrases</li>
                <li>• Try related terms</li>
                <li>• Check different categories</li>
              </ul>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
