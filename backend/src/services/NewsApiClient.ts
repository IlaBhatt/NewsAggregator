import axios, { AxiosInstance, AxiosError } from 'axios';
import { NewsArticle, SearchParams } from '../types';
import { config } from '../config/config';
import { logger } from '../config/logger';
import { CircuitBreaker } from '../utils/CircuitBreaker';

interface NewsApiResponse {
  status: string;
  totalResults: number;
  articles: NewsArticle[];
}

interface NewsApiError {
  status: string;
  code: string;
  message: string;
}

export class NewsApiClient {
  private axiosInstance: AxiosInstance;
  private circuitBreaker: CircuitBreaker;

  constructor() {
    this.axiosInstance = axios.create({
      baseURL: config.newsApi.baseUrl,
      timeout: config.newsApi.timeout,
      headers: {
        'X-Api-Key': config.newsApi.key,
      },
    });

    this.circuitBreaker = new CircuitBreaker(config.circuitBreaker);

    logger.info('NewsAPI client initialized');
  }

  public async searchNews(
    params: SearchParams
  ): Promise<{ articles: NewsArticle[]; totalResults: number }> {
    try {
      const response = await this.circuitBreaker.execute(
        () => this.executeSearch(params),
        undefined
      );

      logger.info(`NewsAPI search successful: ${response.articles.length} articles`);
      return response;
    } catch (error) {
      this.handleError(error);
      throw error;
    }
  }

  private async executeSearch(
    params: SearchParams
  ): Promise<{ articles: NewsArticle[]; totalResults: number }> {
    const queryParams = this.buildQueryParams(params);

    const response = await this.axiosInstance.get<NewsApiResponse>(
      '/everything',
      { params: queryParams }
    );

    if (response.data.status !== 'ok') {
      throw new Error(`NewsAPI returned status: ${response.data.status}`);
    }

    return {
      articles: response.data.articles,
      totalResults: response.data.totalResults,
    };
  }

  public async getTopHeadlines(
    country: string = 'us',
    category?: string
  ): Promise<{ articles: NewsArticle[]; totalResults: number }> {
    try {
      const response = await this.circuitBreaker.execute(() =>
        this.executeTopHeadlines(country, category)
      );

      logger.info(`Top headlines successful: ${response.articles.length} articles`);
      return response;
    } catch (error) {
      this.handleError(error);
      throw error;
    }
  }

  /**
   * Execute top headlines request
   */
  private async executeTopHeadlines(
    country: string,
    category?: string
  ): Promise<{ articles: NewsArticle[]; totalResults: number }> {
    const params: Record<string, string> = { country };
    if (category) {
      params.category = category;
    }

    const response = await this.axiosInstance.get<NewsApiResponse>(
      '/top-headlines',
      { params }
    );

    if (response.data.status !== 'ok') {
      throw new Error(`NewsAPI returned status: ${response.data.status}`);
    }

    return {
      articles: response.data.articles,
      totalResults: response.data.totalResults,
    };
  }

  /**
   * Build query parameters for search
   */
  private buildQueryParams(params: SearchParams): Record<string, string | number> {
    const queryParams: Record<string, string | number> = {};

    if (params.query) queryParams.q = params.query;
    if (params.sources) queryParams.sources = params.sources;
    if (params.from) queryParams.from = params.from;
    if (params.to) queryParams.to = params.to;
    if (params.language) queryParams.language = params.language;
    if (params.sortBy) queryParams.sortBy = params.sortBy;
    if (params.pageSize) queryParams.pageSize = params.pageSize;
    if (params.page) queryParams.page = params.page;

    // Default values
    if (!queryParams.pageSize) queryParams.pageSize = 20;
    if (!queryParams.page) queryParams.page = 1;
    if (!queryParams.language) queryParams.language = 'en';

    return queryParams;
  }

  /**
   * Handle API errors
   */
  private handleError(error: unknown): void {
    if (axios.isAxiosError(error)) {
      const axiosError = error as AxiosError<NewsApiError>;
      
      if (axiosError.response) {
        // Server responded with error
        const apiError = axiosError.response.data;
        logger.error('NewsAPI error response', {
          status: axiosError.response.status,
          code: apiError?.code,
          message: apiError?.message,
        });
      } else if (axiosError.request) {
        // Request made but no response
        logger.error('NewsAPI no response', {
          message: axiosError.message,
        });
      } else {
        // Request setup error
        logger.error('NewsAPI request error', {
          message: axiosError.message,
        });
      }
    } else {
      logger.error('Unexpected error in NewsAPI client', { error });
    }
  }

  /**
   * Get circuit breaker status
   */
  public getCircuitBreakerStats() {
    return this.circuitBreaker.getStats();
  }

  /**
   * Reset circuit breaker
   */
  public resetCircuitBreaker(): void {
    this.circuitBreaker.reset();
  }
}
