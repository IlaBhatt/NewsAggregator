import { useQuery } from "@tanstack/react-query";
import { newsApi, ApiError } from "../services/newsApi";
import { offlineStorage } from "../utils/offlineStorage";
import { useOffline } from "../contexts/OfflineContext";
import type { UseQueryResult } from "@tanstack/react-query";
import type {
  ApiResponse,
  PaginatedArticles,
  SearchParams,
  HeadlinesParams,
} from "../types";

export const newsKeys = {
  all: ["news"] as const,
  search: (params: SearchParams) => ["news", "search", params] as const,
  headlines: (params?: HeadlinesParams) =>
    ["news", "headlines", params] as const,
  health: () => ["health"] as const,
};

export function useSearchNews(
  params: SearchParams,
  enabled = true,
): UseQueryResult<ApiResponse<PaginatedArticles>, ApiError> {
  const { isOnline, isOfflineMode, refreshStats } = useOffline();

  return useQuery({
    queryKey: newsKeys.search(params),
    queryFn: async () => {
      if (!isOnline || isOfflineMode) {
        const cachedArticles = await offlineStorage.getQueryResults(
          params.q || "",
        );
        if (cachedArticles.length > 0) {
          console.log(
            `📦 Loaded ${cachedArticles.length} articles from offline storage`,
          );
          return {
            status: "success" as const,
            data: {
              articles: cachedArticles,
              totalResults: cachedArticles.length,
              page: 1,
              pageSize: cachedArticles.length,
              totalPages: 1,
            },
            metadata: {
              timestamp: new Date().toISOString(),
              version: "v1",
              cached: true,
              offline: true,
            },
          };
        }
      }

      const response = await newsApi.searchNews(params);

      if (response.data?.articles) {
        await offlineStorage.saveArticles(response.data.articles, params.q);
        await offlineStorage.saveQuery(
          params.q || "",
          response.data.articles.map((a) => a.id),
          params,
        );
        await offlineStorage.updateLastSync();
        await refreshStats();
        console.log(
          `💾 Saved ${response.data.articles.length} articles to offline storage`,
        );
      }

      return response;
    },
    enabled: enabled && !!params.q,
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
    retry: isOnline ? 2 : 0,
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
    refetchOnMount: false,
    refetchOnWindowFocus: false
  });
}

/**
 * Hook to get top headlines with offline support
 * @param params Headlines parameters
 * @param enabled Whether the query should run (default: true)
 */
export function useHeadlines(
  params?: HeadlinesParams,
  enabled = true,
): UseQueryResult<ApiResponse<PaginatedArticles>, ApiError> {
  const { isOnline, isOfflineMode, refreshStats } = useOffline();

  return useQuery({
    queryKey: newsKeys.headlines(params),
    queryFn: async () => {
      // If offline or in offline mode, try to get from IndexedDB
      if (!isOnline || isOfflineMode) {
        const cachedArticles = await offlineStorage.getAllArticles();
        if (cachedArticles.length > 0) {
          console.log(
            `📦 Loaded ${cachedArticles.length} headlines from offline storage`,
          );
          // Return most recent articles
          const sortedArticles = cachedArticles
            .sort(
              (a, b) =>
                new Date(b.publishedAt).getTime() -
                new Date(a.publishedAt).getTime(),
            )
            .slice(0, 20);

          return {
            status: "success" as const,
            data: {
              articles: sortedArticles,
              totalResults: sortedArticles.length,
              page: 1,
              pageSize: sortedArticles.length,
              totalPages: 1,
            },
            metadata: {
              timestamp: new Date().toISOString(),
              version: "v1",
              cached: true,
              offline: true,
            },
          };
        }
      }

      // Fetch from API if online
      const response = await newsApi.getHeadlines(params);

      // Save to IndexedDB for offline access
      if (response.data?.articles) {
        await offlineStorage.saveArticles(response.data.articles, "headlines");
        await offlineStorage.updateLastSync();
        await refreshStats();
        console.log(
          `💾 Saved ${response.data.articles.length} headlines to offline storage`,
        );
      }

      return response;
    },
    enabled,
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
    retry: isOnline ? 2 : 0, // Don't retry if offline
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
    refetchOnMount: false,
    refetchOnWindowFocus: false,
  });
}

/**
 * Hook to get API health status
 */
export function useHealth(): UseQueryResult<ApiResponse<unknown>, ApiError> {
  return useQuery({
    queryKey: newsKeys.health(),
    queryFn: () => newsApi.getHealth(),
    staleTime: 1 * 60 * 1000, // 1 minute
    gcTime: 5 * 60 * 1000, // 5 minutes
    retry: 1,
    refetchOnMount: false,
    refetchOnWindowFocus: false,
  });
}
