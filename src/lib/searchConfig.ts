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

export const createSearchInstance = () => {
  const miniSearch = new MiniSearch({
    fields: ['title', 'description', 'content', 'tags', 'category'],
    storeFields: ['title', 'description', 'content', 'url', 'category', 'tags'],
    searchOptions: {
      boost: { title: 2, tags: 1.5, description: 1.2 },
      fuzzy: 0.2,
      prefix: true,
      combineWith: 'OR'
    }
  });
  
  miniSearch.addAll(searchData);
  return miniSearch;
};