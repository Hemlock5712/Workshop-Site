import MiniSearch from "minisearch";
import { searchData } from "@/data/searchData";

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

// Generic interface for MiniSearch results (contains id, score, and all stored fields)
interface MiniSearchRawResult {
  id: string;
  score: number;
  match?: {
    [key: string]: string[];
  };
  [key: string]: unknown; // Allow any additional stored fields
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

export const createSearchInstance = () => {
  const miniSearch = new MiniSearch({
    fields: ["title", "description", "content", "tags", "category"],
    storeFields: ["title", "description", "content", "url", "category", "tags"],
    searchOptions: {
      boost: { title: 2, tags: 1.5, description: 1.2 },
      fuzzy: 0.2,
      prefix: true,
      combineWith: "OR",
    },
  });

  miniSearch.addAll(searchData);
  return miniSearch;
};
