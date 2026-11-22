import { useState, useMemo } from "react";
import { Header } from "../components/layout/Header";
import { Sidebar } from "../components/layout/Sidebar";
import { SentimentOverview } from "../components/SentimentOverview";
import { SearchBar } from "../components/SearchBar";
import { ArticleCard } from "../components/ArticleCard";
import { Pagination } from "../components/Pagination";
import { ArticleListSkeleton } from "../components/ArticleCardSkeleton";
import { ErrorMessage, EmptyState } from "../components/ErrorMessage";
import { ActiveFilters } from "../components/ActiveFilters";
import { OfflineBanner } from "../components/OfflineBanner";
import { OfflineToggle } from "../components/OfflineToggle";
import { useSearchNews, useHeadlines } from "../hooks/useNews";
import { useFilters, type NewsFilters } from "../hooks/useFilters";
import {
  toArticle,
  calculateSentimentOverview,
  type EnhancedArticle,
} from "../types";

export function Dashboard() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 10;

  // Filter management
  const {
    filters,
    updateDateRange,
    updateSources,
    updateSentiments,
    updateSortBy,
    resetFilters,
    getSearchParams,
  } = useFilters();

  // Determine which query to use
  const isSearching = searchQuery.trim().length > 0;

  // Memoize search params to prevent infinite re-renders
  const searchParams = useMemo(
    () =>
      getSearchParams({
        q: searchQuery,
        page: currentPage,
        pageSize,
        language: "en",
      }),
    [getSearchParams, searchQuery, currentPage, pageSize],
  );

  // Search query (when user has entered a search term)
  const searchResult = useSearchNews(
    searchParams,
    isSearching, // Only enabled when searching
  );

  // Headlines query (default view when not searching)
  const headlinesResult = useHeadlines(
    {
      country: "us",
    },
    !isSearching, // Only enabled when NOT searching
  );

  const activeResult = isSearching ? searchResult : headlinesResult;
  const { data, isLoading, isError, error, refetch } = activeResult;

  // Filter articles by sentiment (client-side)
  const articles = useMemo(() => {
    if (!data?.data?.articles) return [];

    let filteredArticles: EnhancedArticle[] = data.data.articles;

    // Apply sentiment filter (client-side since API doesn't support it)
    if (filters.sentiments.length > 0 && filters.sentiments.length < 3) {
      filteredArticles = filteredArticles.filter((article) =>
        filters.sentiments.includes(article.sentiment.type),
      );
    }

    return filteredArticles.map(toArticle);
  }, [data, filters.sentiments]);

  const sentimentData = useMemo(() => {
    if (!data?.data?.articles) return undefined;
    return calculateSentimentOverview(data.data.articles);
  }, [data]);

  // Compute conditional alerts from the loaded dataset
  const alerts = useMemo(() => {
    const msgs: string[] = [];
    const raw = data?.data?.articles ?? [];
    if (raw.length === 0) return msgs;

    // 1) Predominantly negative sentiment
    if (sentimentData && sentimentData.negative >= 60) {
      msgs.push("High volume of negative news - Content may be distressing");
    }

    // 2) Single source dominates (> 60%)
    const sourceCounts = raw.reduce<Record<string, number>>((acc, a) => {
      const name = a.source?.name || "Unknown";
      acc[name] = (acc[name] || 0) + 1;
      return acc;
    }, {});
    const maxSourceCount = Object.values(sourceCounts).reduce(
      (m, c) => (c > m ? c : m),
      0,
    );
    if (maxSourceCount / raw.length >= 0.6) {
      msgs.push("Limited source diversity - Verify from multiple outlets");
    }

    // 3) Breaking news detected (recently published)
    const now = Date.now();
    const withinMinutes = (iso: string, minutes: number) => {
      const t = new Date(iso).getTime();
      return now - t <= minutes * 60 * 1000;
    };
    const recent15 = raw.some((a) => withinMinutes(a.publishedAt, 15));
    const recent60Count = raw.filter((a) =>
      withinMinutes(a.publishedAt, 60),
    ).length;
    if (recent15 || recent60Count / raw.length >= 0.3) {
      msgs.push("Breaking News Alert - Recently published");
    }

    // 4) Controversial topics
    const controversial = [
      "abortion",
      "gun control",
      "immigration",
      "climate change",
      "israel",
      "palestine",
      "protest",
      "racism",
      "terror",
      "war",
      "lgbt",
    ];
    const hasControversial = raw.some((a) => {
      const hay = `${a.title} ${a.description ?? ""}`.toLowerCase();
      return controversial.some((k) => hay.includes(k));
    });
    if (hasControversial) {
      msgs.push("Diverse viewpoints available - Read multiple perspectives");
    }

    return msgs;
  }, [data, sentimentData]);

  const totalResults = data?.data?.totalResults || 0;
  const totalPages = data?.data?.totalPages || 0;

  const handleSearch = (query: string) => {
    setSearchQuery(query);
    setCurrentPage(1); // Reset to first page when searching
  };

  const handleResetFilters = () => {
    resetFilters();
    setCurrentPage(1); // Reset to first page when filters reset
  };

  const handleRemoveFilter = (
    filterType: keyof NewsFilters,
    value?: string,
  ) => {
    switch (filterType) {
      case "dateRange":
        updateDateRange("24h");
        break;
      case "sources":
        if (value) {
          const updated = filters.sources.filter((s) => s !== value);
          updateSources(updated.length > 0 ? updated : ["all"]);
        }
        break;
      case "sentiments":
        if (value) {
          const updated = filters.sentiments.filter((s) => s !== value);
          if (updated.length > 0) {
            updateSentiments(updated);
          }
        }
        break;
      case "sortBy":
        updateSortBy("latest");
        break;
    }
    setCurrentPage(1);
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    // Scroll to top of results
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleRetry = () => {
    refetch();
  };

  return (
    <div className="min-h-screen bg-dark-bg">
      <Header onMenuClick={() => setIsSidebarOpen(!isSidebarOpen)} />
      <Sidebar
        isOpen={isSidebarOpen}
        onClose={() => setIsSidebarOpen(false)}
        filters={filters}
        onDateRangeChange={updateDateRange}
        onSourcesChange={updateSources}
        onSentimentsChange={updateSentiments}
        onSortByChange={updateSortBy}
        onResetFilters={handleResetFilters}
      />

      <main className="pt-16 lg:pl-72 min-h-screen">
        <div className="p-6 max-w-7xl mx-auto">
          {/* Offline Banner */}
          <OfflineBanner />

          <SentimentOverview data={sentimentData} />

          <SearchBar onSearch={handleSearch} />

          {/* Offline Mode Toggle */}
          <div className="mb-6">
            <OfflineToggle />
          </div>

          {/* Conditional Alerts */}
          {!isLoading && !isError && alerts.length > 0 && (
            <div className="mb-4 space-y-2">
              {alerts.map((msg, idx) => (
                <div
                  key={idx}
                  className="flex items-start gap-2 bg-yellow-900/20 border border-yellow-700 text-yellow-200 px-4 py-2 rounded"
                  role="status"
                  aria-live="polite"
                >
                  <span className="mt-0.5 inline-block h-2 w-2 rounded-full bg-yellow-400" />
                  <span className="text-sm">{msg}</span>
                </div>
              ))}
            </div>
          )}

          <ActiveFilters
            filters={filters}
            onRemoveFilter={handleRemoveFilter}
          />

          {isLoading && <ArticleListSkeleton count={pageSize} />}

          {isError && error && (
            <ErrorMessage message={error.message} onRetry={handleRetry} />
          )}

          {!isLoading && !isError && articles.length === 0 && (
            <EmptyState
              title={isSearching ? "No articles found" : "No news available"}
              message={
                isSearching
                  ? `No results found for \"${searchQuery}\". Try different keywords.`
                  : "No news articles are currently available. Please try again later."
              }
            />
          )}

          {!isLoading && !isError && articles.length > 0 && (
            <>
              <div className="space-y-4 mb-6">
                {articles.map((article) => (
                  <ArticleCard key={article.id} article={article} />
                ))}
              </div>

              {totalPages > 1 && (
                <Pagination
                  currentPage={currentPage}
                  totalPages={totalPages}
                  totalResults={totalResults}
                  resultsPerPage={pageSize}
                  onPageChange={handlePageChange}
                />
              )}
            </>
          )}

          {/* Cache indicator (if data is cached) */}
          {data?.metadata?.cached && (
            <div className="mt-4 text-center text-xs text-text-muted">
              <span className="inline-flex items-center gap-1 bg-dark-surface px-3 py-1 rounded-full border border-border">
                Cached data
                {data.metadata.stale && " (may be outdated)"}
              </span>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
