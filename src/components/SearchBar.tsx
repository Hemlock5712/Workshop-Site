"use client";

import { useMemo, useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  createSearchInstance,
  mapMiniSearchResults,
  SearchResult,
} from "@/lib/searchConfig";
import { useKeyboardNavigation } from "@/hooks/useKeyboardNavigation";
import { Command } from "cmdk";
import * as Dialog from "@radix-ui/react-dialog";
import { Search, Tag } from "lucide-react";

export default function SearchBar() {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<SearchResult[]>([]);

  const searchInstance = useMemo(() => createSearchInstance(), []);

  const handleOpen = () => setOpen(true);
  const handleClose = () => setOpen(false);

  useKeyboardNavigation({
    onSearchFocus: handleOpen,
    onSearchClose: handleClose,
    isSearchOpen: open,
  });

  useEffect(() => {
    if (!open) {
      setQuery("");
      setResults([]);
    }
  }, [open]);

  useEffect(() => {
    const trimmed = query.trim();
    if (trimmed.length > 1) {
      const searchResults = searchInstance.search(trimmed);
      const mapped = mapMiniSearchResults(searchResults);
      setResults(mapped.slice(0, 12));
    } else {
      setResults([]);
    }
  }, [query, searchInstance]);

  const navigateTo = (item: SearchResult) => {
    router.push(item.url);
    setOpen(false);
  };

  const goToSearchPage = () => {
    const trimmed = query.trim();
    if (trimmed) {
      router.push(`/search?q=${encodeURIComponent(trimmed)}`);
      setOpen(false);
    }
  };

  const getCategoryBadge = (category: string) => {
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

  return (
    <>
      <button
        type="button"
        onClick={handleOpen}
        className="flex items-center gap-3 px-4 py-2 rounded-lg border border-[var(--border)] bg-[var(--card)] text-sm text-[var(--muted-foreground)] hover:text-[var(--foreground)] hover:border-primary-500/80 transition-colors w-fit md:w-80"
      >
        <Search className="w-4 h-4" aria-hidden="true" />
        <div className="hidden md:flex gap-2">
          <span className="flex-1 text-left">Search the workshop</span>
          <span className="hidden md:flex items-center gap-1 text-xs text-[var(--muted-foreground)]">
            <kbd className="px-1.5 py-0.5 rounded border border-[var(--border)] bg-[var(--muted)]">
              Ctrl
            </kbd>
            <kbd className="px-1.5 py-0.5 rounded border border-[var(--border)] bg-[var(--muted)]">
              K
            </kbd>
          </span>
        </div>
      </button>

      <Dialog.Root open={open} onOpenChange={setOpen}>
        <Dialog.Portal>
          <Dialog.Overlay className="fixed inset-0 bg-black/50 z-40" />
          <Dialog.Content className="fixed inset-x-0 top-[10vh] mx-auto w-full max-w-2xl z-50 rounded-xl border border-[var(--border)] bg-[var(--card)] text-[var(--foreground)] shadow-2xl focus:outline-none">
            <Dialog.Title className="sr-only">
              Workshop Search Command Palette
            </Dialog.Title>

            <Command label="Search the Gray Matter Workshop">
              <div className="flex items-center gap-2 px-4 py-3 border-b border-[var(--border)]">
                <Search className="w-4 h-4 text-[var(--muted-foreground)]" />
                <Command.Input
                  value={query}
                  onValueChange={setQuery}
                  placeholder="Search for pages, topics, or hardware..."
                  autoFocus
                  className="flex-1 bg-transparent outline-none text-sm"
                />
              </div>

              <Command.List className="max-h-[60vh] overflow-y-auto px-1 pb-3">
                <Command.Empty className="px-4 py-6 text-sm text-[var(--muted-foreground)]">
                  {query.trim().length > 1
                    ? "No results found. Try another keyword."
                    : "Start typing to search workshop content."}
                </Command.Empty>

                {results.length > 0 && (
                  <Command.Group heading="Workshop Content" className="mt-2">
                    {results.map((item) => (
                      <Command.Item
                        key={item.id}
                        value={`${item.title} ${item.description} ${item.tags.join(" ")}`}
                        onSelect={() => navigateTo(item)}
                        className="px-3 py-2 rounded-md aria-selected:bg-[var(--muted)] aria-selected:text-[var(--foreground)]"
                      >
                        <div className="flex flex-col gap-1">
                          <div className="flex items-center justify-between gap-2">
                            <span className="text-sm font-medium text-[var(--foreground)]">
                              {item.title}
                            </span>
                            <span
                              className={`text-xs font-medium px-2 py-0.5 rounded-full ${getCategoryBadge(item.category)}`}
                            >
                              {item.category}
                            </span>
                          </div>
                          <p className="text-xs text-[var(--muted-foreground)] line-clamp-2">
                            {item.description}
                          </p>
                          <div className="flex flex-wrap items-center gap-2">
                            <span className="flex items-center gap-1 text-xs text-[var(--muted-foreground)]">
                              <Tag className="w-3 h-3" />
                              score {Math.round(item.score * 100) / 100}
                            </span>
                            {item.tags.slice(0, 3).map((tag) => (
                              <span
                                key={tag}
                                className="px-2 py-0.5 text-[10px] bg-[var(--muted)] text-[var(--muted-foreground)] rounded-full"
                              >
                                {tag}
                              </span>
                            ))}
                          </div>
                        </div>
                      </Command.Item>
                    ))}
                  </Command.Group>
                )}

                {query.trim().length > 1 && (
                  <>
                    <Command.Separator className="my-2 h-px bg-[var(--border)]" />
                    <Command.Group heading="Actions">
                      <Command.Item
                        value="View all results"
                        onSelect={goToSearchPage}
                        className="px-3 py-2 rounded-md text-sm text-[var(--muted-foreground)] aria-selected:bg-[var(--muted)] aria-selected:text-[var(--foreground)]"
                      >
                        View all results for “{query.trim()}”
                      </Command.Item>
                    </Command.Group>
                  </>
                )}
              </Command.List>
            </Command>
          </Dialog.Content>
        </Dialog.Portal>
      </Dialog.Root>
    </>
  );
}
