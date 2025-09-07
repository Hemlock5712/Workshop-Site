"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { createSearchInstance, SearchResult } from "@/lib/searchConfig";

export default function SearchBar() {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<SearchResult[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(-1);
  const searchRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const router = useRouter();

  const searchRef2 = useRef(createSearchInstance());

  useEffect(() => {
    if (query.trim().length > 1) {
      const searchResults = searchRef2.current.search(query);
      const mappedResults: SearchResult[] = searchResults.map((result: any) => ({
        id: result.id,
        title: result.title,
        description: result.description,
        content: result.content,
        url: result.url,
        category: result.category,
        tags: result.tags,
        score: result.score,
        match: result.match
      }));
      setResults(mappedResults.slice(0, 8));
      setIsOpen(true);
      setSelectedIndex(-1);
    } else {
      setResults([]);
      setIsOpen(false);
      setSelectedIndex(-1);
    }
  }, [query]);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setIsOpen(false);
        setSelectedIndex(-1);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (!isOpen || results.length === 0) return;

    switch (e.key) {
      case "ArrowDown":
        e.preventDefault();
        setSelectedIndex(prev => (prev < results.length - 1 ? prev + 1 : 0));
        break;
      case "ArrowUp":
        e.preventDefault();
        setSelectedIndex(prev => (prev > 0 ? prev - 1 : results.length - 1));
        break;
      case "Enter":
        e.preventDefault();
        if (selectedIndex >= 0 && selectedIndex < results.length) {
          navigateToResult(results[selectedIndex]);
        } else if (query.trim()) {
          // Navigate to search results page
          router.push(`/search?q=${encodeURIComponent(query.trim())}`);
          setQuery("");
          setIsOpen(false);
          setSelectedIndex(-1);
          inputRef.current?.blur();
        }
        break;
      case "Escape":
        setIsOpen(false);
        setSelectedIndex(-1);
        inputRef.current?.blur();
        break;
    }
  };

  const navigateToResult = (item: SearchResult) => {
    router.push(item.url);
    setQuery("");
    setIsOpen(false);
    setSelectedIndex(-1);
    inputRef.current?.blur();
  };

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

    const regex = new RegExp(`(${queryTerm.trim().replace(/[.*+?^${}()|[\]\\]/g, '\\$&')})`, 'gi');
    return text.replace(regex, '<mark class="bg-yellow-200 dark:bg-yellow-900/50 px-1 rounded">$1</mark>');
  };

  return (
    <div ref={searchRef} className="relative">
      <div className="relative">
        <input
          ref={inputRef}
          type="text"
          placeholder="Search workshop content..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onKeyDown={handleKeyDown}
          onFocus={() => {
            if (query.trim().length > 1) {
              setIsOpen(true);
            }
          }}
          className="w-64 px-4 py-2 pl-10 pr-4 text-sm bg-[var(--card)] border border-[var(--border)] rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 placeholder-[var(--muted-foreground)]"
        />
        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
          <svg
            className="h-4 w-4 text-[var(--muted-foreground)]"
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
        </div>
        {query && (
          <button
            onClick={() => {
              setQuery("");
              setIsOpen(false);
              setSelectedIndex(-1);
            }}
            className="absolute inset-y-0 right-0 pr-3 flex items-center"
          >
            <svg
              className="h-4 w-4 text-[var(--muted-foreground)] hover:text-[var(--foreground)]"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        )}
      </div>

      {isOpen && results.length > 0 && (
        <div className="absolute top-full left-0 right-0 mt-2 bg-[var(--card)] border border-[var(--border)] rounded-lg shadow-lg max-h-96 overflow-y-auto z-50">
          {results.map((result, index) => (
            <button
              key={result.id}
              onClick={() => navigateToResult(result)}
              className={`w-full p-4 text-left hover:bg-[var(--muted)] border-b border-[var(--border)] last:border-b-0 transition-colors ${
                index === selectedIndex ? "bg-[var(--muted)]" : ""
              }`}
            >
              <div className="flex items-center justify-between mb-2">
                <h3
                  className="font-medium text-[var(--foreground)] text-sm"
                  dangerouslySetInnerHTML={{
                    __html: highlightMatch(result.title, query)
                  }}
                />
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${getCategoryColor(result.category)}`}>
                  {result.category}
                </span>
              </div>
              <p className="text-xs text-[var(--muted-foreground)] line-clamp-2">
                {result.description}
              </p>
              <div className="flex items-center mt-2 space-x-2">
                <span className="text-xs text-[var(--muted-foreground)]">
                  Score: {Math.round(result.score * 100) / 100}
                </span>
                <div className="flex flex-wrap gap-1">
                  {result.tags.slice(0, 3).map((tag) => (
                    <span
                      key={tag}
                      className="px-2 py-0.5 text-xs bg-[var(--muted)] text-[var(--muted-foreground)] rounded-full"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
            </button>
          ))}
          
          {query.trim().length > 1 && results.length === 0 && (
            <div className="p-4 text-center text-[var(--muted-foreground)]">
              <svg
                className="mx-auto h-8 w-8 mb-2"
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
              <p>No results found for &quot;{query}&quot;</p>
              <p className="text-xs mt-1">Try different keywords or browse the navigation</p>
            </div>
          )}
          
          <div className="p-3 bg-[var(--muted)] border-t border-[var(--border)]">
            <div className="flex items-center justify-between text-xs text-[var(--muted-foreground)] mb-2">
              <div className="flex items-center space-x-4">
                <span className="flex items-center">
                  <kbd className="px-1.5 py-0.5 text-xs bg-[var(--card)] border border-[var(--border)] rounded">↑↓</kbd>
                  <span className="ml-1">Navigate</span>
                </span>
                <span className="flex items-center">
                  <kbd className="px-1.5 py-0.5 text-xs bg-[var(--card)] border border-[var(--border)] rounded">Enter</kbd>
                  <span className="ml-1">{selectedIndex >= 0 ? "Select" : "View all"}</span>
                </span>
                <span className="flex items-center">
                  <kbd className="px-1.5 py-0.5 text-xs bg-[var(--card)] border border-[var(--border)] rounded">Esc</kbd>
                  <span className="ml-1">Close</span>
                </span>
              </div>
              <span>Powered by MiniSearch</span>
            </div>
            {searchRef2.current.search(query).length > 8 && (
              <button
                onClick={() => {
                  router.push(`/search?q=${encodeURIComponent(query.trim())}`);
                  setQuery("");
                  setIsOpen(false);
                  setSelectedIndex(-1);
                  inputRef.current?.blur();
                }}
                className="w-full text-center text-xs text-primary-600 dark:text-primary-400 hover:text-primary-800 dark:hover:text-primary-300 py-1"
              >
                View all {searchRef2.current.search(query).length} results →
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
}