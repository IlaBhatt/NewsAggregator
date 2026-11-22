/**
 * Custom hook for managing news filter state
 */

import { useState, useCallback } from "react";
import type { SearchParams } from "../types";

export type DateRangeType = "24h" | "7d" | "30d" | "custom";
export type SortByType = "latest" | "popular" | "sentiment";

export interface NewsFilters {
  dateRange: DateRangeType;
  sources: string[];
  sentiments: string[];
  sortBy: SortByType;
}

const DEFAULT_FILTERS: NewsFilters = {
  dateRange: "24h",
  sources: ["all"],
  sentiments: ["positive", "neutral", "negative"],
  sortBy: "latest",
};

/**
 * Convert date range to ISO date strings
 * Returns stable date strings by rounding to the start of the day
 */
function getDateRange(range: DateRangeType): { from?: string; to?: string } {
  const now = new Date();
  // Round to start of current day for stability
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());

  switch (range) {
    case "24h": {
      const from = new Date(today.getTime() - 24 * 60 * 60 * 1000);
      return {
        from: from.toISOString().split("T")[0], // YYYY-MM-DD format
        to: today.toISOString().split("T")[0],
      };
    }
    case "7d": {
      const from = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000);
      return {
        from: from.toISOString().split("T")[0],
        to: today.toISOString().split("T")[0],
      };
    }
    case "30d": {
      const from = new Date(today.getTime() - 30 * 24 * 60 * 60 * 1000);
      return {
        from: from.toISOString().split("T")[0],
        to: today.toISOString().split("T")[0],
      };
    }
    case "custom":
      // For custom, return empty (would need date picker implementation)
      return {};
    default:
      return {};
  }
}

/**
 * Map UI sort options to API sortBy values
 */
function mapSortBy(sortBy: SortByType): SearchParams["sortBy"] {
  switch (sortBy) {
    case "latest":
      return "publishedAt";
    case "popular":
      return "popularity";
    case "sentiment":
      return "relevancy"; // API doesn't support sentiment sort, use relevancy
    default:
      return "publishedAt";
  }
}

/**
 * Hook for managing filter state and converting to API parameters
 */
export function useFilters() {
  const [filters, setFilters] = useState<NewsFilters>(DEFAULT_FILTERS);

  const updateDateRange = useCallback((dateRange: DateRangeType) => {
    setFilters((prev) => ({ ...prev, dateRange }));
  }, []);

  const updateSources = useCallback((sources: string[]) => {
    setFilters((prev) => ({ ...prev, sources }));
  }, []);

  const updateSentiments = useCallback((sentiments: string[]) => {
    setFilters((prev) => ({ ...prev, sentiments }));
  }, []);

  const updateSortBy = useCallback((sortBy: SortByType) => {
    setFilters((prev) => ({ ...prev, sortBy }));
  }, []);

  const resetFilters = useCallback(() => {
    setFilters(DEFAULT_FILTERS);
  }, []);

  /**
   * Convert filters to SearchParams for API
   */
  const getSearchParams = useCallback(
    (baseParams: Partial<SearchParams> = {}): SearchParams => {
      const dateRange = getDateRange(filters.dateRange);
      const sources = filters.sources.filter((s) => s !== "all");

      return {
        ...baseParams,
        ...dateRange,
        sources: sources.length > 0 ? sources.join(",") : undefined,
        sortBy: mapSortBy(filters.sortBy),
      };
    },
    [filters],
  );

  return {
    filters,
    updateDateRange,
    updateSources,
    updateSentiments,
    updateSortBy,
    resetFilters,
    getSearchParams,
  };
}
