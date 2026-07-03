import { useCallback, useEffect, useRef, useState } from "react";
import type { FeedCategory, ResearchArticle } from "@/src/types/research.types";
import { researchFeedService } from "@/services/researchFeedService";

export function useResearchFeed(initialCategory: FeedCategory = "All") {
  const [category, setCategory] = useState<FeedCategory>(initialCategory);
  const [searchQuery, setSearchQuery] = useState("");
  const [articles, setArticles] = useState<ResearchArticle[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const fetchArticles = useCallback(
    async (opts?: { refresh?: boolean }) => {
      const isRefresh = opts?.refresh ?? false;
      if (isRefresh) setRefreshing(true);
      else setLoading(true);
      setError(null);

      try {
        const results = await researchFeedService.fetchArticles(category, searchQuery);
        setArticles(results);
      } catch {
        setError("Could not load research papers. Check your connection and try again.");
      } finally {
        setLoading(false);
        setRefreshing(false);
      }
    },
    [category, searchQuery]
  );

  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      fetchArticles();
    }, searchQuery ? 400 : 0);

    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, [fetchArticles, searchQuery]);

  return {
    category,
    setCategory,
    searchQuery,
    setSearchQuery,
    articles,
    loading,
    refreshing,
    error,
    refresh: () => fetchArticles({ refresh: true }),
  };
}
