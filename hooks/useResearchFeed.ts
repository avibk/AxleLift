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
  const requestSequenceRef = useRef(0);

  const fetchArticles = useCallback(
    async (
      opts?: { refresh?: boolean },
      requestId = ++requestSequenceRef.current
    ) => {
      if (requestId !== requestSequenceRef.current) return;

      const isRefresh = opts?.refresh ?? false;
      if (isRefresh) setRefreshing(true);
      else setLoading(true);
      setError(null);

      try {
        const results = await researchFeedService.fetchArticles(category, searchQuery, {
          bypassCache: isRefresh,
        });
        if (requestId === requestSequenceRef.current) setArticles(results);
      } catch {
        if (requestId === requestSequenceRef.current) {
          setError("Could not load research papers. Check your connection and try again.");
        }
      } finally {
        if (requestId === requestSequenceRef.current) {
          setLoading(false);
          setRefreshing(false);
        }
      }
    },
    [category, searchQuery]
  );

  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    const requestId = ++requestSequenceRef.current;
    debounceRef.current = setTimeout(() => {
      fetchArticles(undefined, requestId);
    }, searchQuery ? 400 : 0);

    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
      requestSequenceRef.current += 1;
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
