import { Request, Response, NextFunction } from "express";
import { NewsService } from "../services/NewsService";
import {
  SearchParams,
  ApiResponse,
  PaginatedArticles,
  EnhancedArticle,
} from "../types";
import { config } from "../config/config";
import { logger } from "../config/logger";

export class NewsController {
  private newsService: NewsService;

  constructor() {
    this.newsService = new NewsService();
  }

  /**
   * Search news articles
   * GET /api/v1/news/search
   */
  public searchNews = async (
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<void> => {
    try {
      const queryParam = req.query.q as string;
      const searchParams: SearchParams = {
        query: queryParam,
        sources: req.query.sources as string,
        from: req.query.from as string,
        to: req.query.to as string,
        language: (req.query.language as string) || "en",
        sortBy: req.query.sortBy as "relevancy" | "popularity" | "publishedAt",
        pageSize: parseInt(req.query.pageSize as string) || 20,
        page: parseInt(req.query.page as string) || 1,
      };

      if (!queryParam) {
        res
          .status(400)
          .json(
            this.createErrorResponse(
              "BAD_REQUEST",
              'Query parameter "q" is required',
            ),
          );
        return;
      }

      const result = await this.newsService.searchNews(searchParams);
      const response = this.createSuccessResponse(result.data, {
        cached: result.cached,
        stale: result.stale,
      });

      response.links = this.buildPaginationLinks(req, result.data);

      res.json(response);
    } catch (error) {
      next(error);
    }
  };

  /**
   * Get top headlines
   * GET /api/v1/news/headlines
   */
  public getTopHeadlines = async (
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<void> => {
    try {
      const country = (req.query.country as string) || "us";
      const category = req.query.category as string;

      const result = await this.newsService.getTopHeadlines(country, category);

      const response = this.createSuccessResponse(result.data, {
        cached: result.cached,
        stale: result.stale,
      });

      res.json(response);
    } catch (error) {
      next(error);
    }
  };

  /**
   * Get service health status
   * GET /api/v1/health
   */
  public getHealth = async (
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<void> => {
    try {
      const cacheStats = this.newsService.getCacheStats();
      const circuitBreakerStats = this.newsService.getCircuitBreakerStats();

      res.json({
        status: "healthy",
        timestamp: new Date().toISOString(),
        version: config.apiVersion,
        cache: {
          size: cacheStats.size,
          entries: cacheStats.entries.length,
        },
        circuitBreaker: {
          state: circuitBreakerStats.state,
          failureCount: circuitBreakerStats.failureCount,
        },
      });
    } catch (error) {
      next(error);
    }
  };

  /**
   * Clear cache (admin endpoint)
   * POST /api/v1/admin/cache/clear
   */
  public clearCache = async (
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<void> => {
    try {
      this.newsService.clearCache();
      res.json({
        status: "success",
        message: "Cache cleared successfully",
        timestamp: new Date().toISOString(),
      });
    } catch (error) {
      next(error);
    }
  };

  /**
   * Create success response with metadata
   */
  private createSuccessResponse<T>(
    data: T,
    metadata?: Record<string, unknown>,
  ): ApiResponse<T> {
    return {
      status: "success",
      data,
      metadata: {
        timestamp: new Date().toISOString(),
        version: config.apiVersion,
        cached: false,
        ...metadata,
      },
    };
  }

  /**
   * Create error response
   */
  private createErrorResponse(
    code: string,
    message: string,
  ): ApiResponse<never> {
    return {
      status: "error",
      error: {
        code,
        message,
      },
      metadata: {
        timestamp: new Date().toISOString(),
        version: config.apiVersion,
        cached: false,
      },
    };
  }

  /**
   * Build HATEOAS pagination links
   */
  private buildPaginationLinks(
    req: Request,
    data: PaginatedArticles,
  ): { self: string; next?: string; prev?: string } {
    const baseUrl = `${req.protocol}://${req.get("host")}${req.baseUrl}${req.path}`;
    const queryParams = new URLSearchParams(
      req.query as Record<string, string>,
    );

    const links: { self: string; next?: string; prev?: string } = {
      self: `${baseUrl}?${queryParams.toString()}`,
    };

    // Next page link
    if (data.page < data.totalPages) {
      const nextParams = new URLSearchParams(queryParams);
      nextParams.set("page", String(data.page + 1));
      links.next = `${baseUrl}?${nextParams.toString()}`;
    }

    // Previous page link
    if (data.page > 1) {
      const prevParams = new URLSearchParams(queryParams);
      prevParams.set("page", String(data.page - 1));
      links.prev = `${baseUrl}?${prevParams.toString()}`;
    }

    return links;
  }
}
