import type MiniSearch from "minisearch";

export interface SearchResult {
  id: string;
  title: string;
  description: string;
  content: string;
  url: string;
  category: string;
  tags: string[];
  score: number;
  match?: {
    [key: string]: string[];
  };
}

interface MiniSearchRawResult {
  id: string;
  score: number;
  match?: {
    [key: string]: string[];
  };
  [key: string]: unknown;
}

export const mapMiniSearchResults = (
  results: MiniSearchRawResult[]
): SearchResult[] => {
  return results.map((result: MiniSearchRawResult) => ({
    id: result.id,
    title: result.title as string,
    description: result.description as string,
    content: result.content as string,
    url: result.url as string,
    category: result.category as string,
    tags: result.tags as string[],
    score: result.score,
    match: result.match,
  }));
};

let cachedInstance: MiniSearch | null = null;
let pendingInstance: Promise<MiniSearch> | null = null;

// Lazily load both MiniSearch and the search-data JSON only on first call.
// Subsequent callers receive the same instance — the index is built once per
// session, not on every SearchBar mount.
export const getSearchInstance = (): Promise<MiniSearch> => {
  if (cachedInstance) return Promise.resolve(cachedInstance);
  if (pendingInstance) return pendingInstance;

  pendingInstance = (async () => {
    const [{ default: MiniSearchCtor }, { searchData }] = await Promise.all([
      import("minisearch"),
      import("@/data/searchData"),
    ]);

    const miniSearch = new MiniSearchCtor({
      fields: ["title", "description", "content", "tags", "category"],
      storeFields: [
        "title",
        "description",
        "content",
        "url",
        "category",
        "tags",
      ],
      searchOptions: {
        boost: { title: 2, tags: 1.5, description: 1.2 },
        fuzzy: 0.2,
        prefix: true,
        combineWith: "OR",
      },
    });

    miniSearch.addAll(searchData);
    cachedInstance = miniSearch;
    return miniSearch;
  })();

  return pendingInstance;
};
