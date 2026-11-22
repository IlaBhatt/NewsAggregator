/**
 * News aggregation service with sentiment analysis and credibility scoring
 * Pattern: Service Layer, Decorator (caching)
 */

import { v4 as uuidv4 } from "uuid";
import {
  EnhancedArticle,
  NewsArticle,
  PaginatedArticles,
  SearchParams,
  SentimentType,
} from "../types";
import { NewsApiClient } from "./NewsApiClient";
import { SentimentAnalyzer } from "./SentimentAnalyzer";
import { CredibilityScorer } from "./CredibilityScorer";
import { Cache } from "../utils/Cache";
import { config } from "../config/config";
import { logger } from "../config/logger";

export class NewsService {
  private newsApiClient: NewsApiClient;
  private sentimentAnalyzer: SentimentAnalyzer;
  private credibilityScorer: CredibilityScorer;
  private cache: Cache;

  constructor() {
    this.newsApiClient = new NewsApiClient();
    this.sentimentAnalyzer = new SentimentAnalyzer();
    this.credibilityScorer = new CredibilityScorer();
    this.cache = Cache.getInstance(config.cache.ttlMinutes);

    logger.info("NewsService initialized");
  }

  /**
   * Search news with caching and enhancement
   */
  public async searchNews(
    params: SearchParams,
  ): Promise<{ data: PaginatedArticles; cached: boolean; stale: boolean }> {
    try {
      // Generate cache key from search parameters
      const cacheKey = this.generateCacheKey(
        "search",
        params as unknown as Record<string, unknown>,
      );

      // Check cache first (cache-aside pattern)
      const cached = this.cache.get<PaginatedArticles>(cacheKey);
      if (cached) {
        logger.info(`Returning cached news (stale: ${cached.isStale})`);
        return {
          data: cached.data,
          cached: true,
          stale: cached.isStale,
        };
      }

      // Fetch from API with fallback to stale cache on failure
      try {
        const result = await this.newsApiClient.searchNews(params);
        const enhanced = await this.enhanceArticles(result.articles);

        const paginatedResult: PaginatedArticles = {
          articles: enhanced,
          totalResults: result.totalResults,
          page: params.page || 1,
          pageSize: params.pageSize || 20,
          totalPages: Math.ceil(result.totalResults / (params.pageSize || 20)),
        };

        // Cache the result
        this.cache.set(cacheKey, paginatedResult);

        return {
          data: paginatedResult,
          cached: false,
          stale: false,
        };
      } catch (error) {
        logger.error("Failed to fetch news from API", { error });

        // Try to serve stale data
        const staleData = this.cache.get<PaginatedArticles>(cacheKey);
        if (staleData) {
          logger.warn("Serving stale cached data due to API failure");
          return {
            data: staleData.data,
            cached: true,
            stale: true,
          };
        }

        // No cache available, use mock data as last resort
        logger.warn("No cache available, returning mock data");
        return {
          data: this.getMockData(params),
          cached: false,
          stale: true,
        };
      }
    } catch (error) {
      logger.error("NewsService searchNews error", { error });
      throw error;
    }
  }

  /**
   * Get top headlines
   */
  public async getTopHeadlines(
    country: string = "us",
    category?: string,
  ): Promise<{ data: PaginatedArticles; cached: boolean; stale: boolean }> {
    try {
      const cacheKey = this.generateCacheKey("headlines", {
        country,
        category,
      });

      // Check cache
      const cached = this.cache.get<PaginatedArticles>(cacheKey);
      if (cached) {
        return {
          data: cached.data,
          cached: true,
          stale: cached.isStale,
        };
      }

      // Fetch from API
      try {
        const result = await this.newsApiClient.getTopHeadlines(
          country,
          category,
        );
        const enhanced = await this.enhanceArticles(result.articles);

        const paginatedResult: PaginatedArticles = {
          articles: enhanced,
          totalResults: enhanced.length,
          page: 1,
          pageSize: enhanced.length,
          totalPages: 1,
        };

        // Cache the result
        this.cache.set(cacheKey, paginatedResult);

        return {
          data: paginatedResult,
          cached: false,
          stale: false,
        };
      } catch (error) {
        logger.error("Failed to fetch top headlines", { error });

        // Try stale cache
        const staleData = this.cache.get<PaginatedArticles>(cacheKey);
        if (staleData) {
          return {
            data: staleData.data,
            cached: true,
            stale: true,
          };
        }

        throw error;
      }
    } catch (error) {
      logger.error("NewsService getTopHeadlines error", { error });
      throw error;
    }
  }

  /**
   * Enhance articles with sentiment and credibility
   */
  private async enhanceArticles(
    articles: NewsArticle[],
  ): Promise<EnhancedArticle[]> {
    return articles.map((article) => {
      // Analyze sentiment of title + description
      const textToAnalyze = `${article.title} ${article.description || ""}`;
      const sentiment = this.sentimentAnalyzer.analyze(textToAnalyze);

      // Score source credibility
      const credibility = this.credibilityScorer.score(
        article.source.name,
        article.url,
      );

      return {
        ...article,
        sentiment,
        credibility,
        id: uuidv4(),
      };
    });
  }

  /**
   * Generate cache key from parameters
   */
  private generateCacheKey(
    prefix: string,
    params: Record<string, unknown>,
  ): string {
    const sortedParams = Object.keys(params)
      .sort()
      .map((key) => `${key}=${String(params[key])}`)
      .join("&");
    return `${prefix}:${sortedParams}`;
  }

  /**
   * Get mock data for offline mode / fallback
   */
  private getMockData(params: SearchParams): PaginatedArticles {
    const mockArticles: EnhancedArticle[] = [
      {
        id: uuidv4(),
        source: { id: "mock", name: "Mock News" },
        author: "Mock Author",
        title: "Service Temporarily Unavailable",
        description:
          "The news service is currently experiencing issues. This is mock data.",
        url: "#",
        urlToImage: null,
        publishedAt: new Date().toISOString(),
        content: null,
        sentiment: {
          score: 0,
          type: SentimentType.NEUTRAL,
          confidence: 0,
        },
        credibility: {
          score: 50,
          tier: "medium",
          indicators: ["Mock data"],
        },
      },
    ];

    return {
      articles: mockArticles,
      totalResults: 1,
      page: params.page || 1,
      pageSize: params.pageSize || 20,
      totalPages: 1,
    };
  }

  /**
   * Clear cache
   */
  public clearCache(): void {
    this.cache.clear();
  }

  /**
   * Get cache statistics
   */
  public getCacheStats() {
    return this.cache.getStats();
  }

  /**
   * Get circuit breaker status
   */
  public getCircuitBreakerStats() {
    return this.newsApiClient.getCircuitBreakerStats();
  }
}
