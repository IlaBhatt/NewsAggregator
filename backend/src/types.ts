

export enum SentimentType {
  POSITIVE = 'positive',
  NEUTRAL = 'neutral',
  NEGATIVE = 'negative',
}


export interface SentimentResult {
  score: number; // Range: -1 to 1
  type: SentimentType;
  confidence: number; // Range: 0 to 1
}

/**
 * Source credibility information
 */
export interface SourceCredibility {
  score: number; // Range: 0 to 100
  tier: 'high' | 'medium' | 'low';
  indicators: string[];
}

/**
 * News article from external API
 */
export interface NewsArticle {
  source: {
    id: string | null;
    name: string;
  };
  author: string | null;
  title: string;
  description: string | null;
  url: string;
  urlToImage: string | null;
  publishedAt: string;
  content: string | null;
}

/**
 * Enhanced article with sentiment and credibility
 */
export interface EnhancedArticle extends NewsArticle {
  sentiment: SentimentResult;
  credibility: SourceCredibility;
  id: string; // Generated unique identifier
}

/**
 * Search parameters for news API
 */
export interface SearchParams {
  query?: string;
  sources?: string;
  from?: string;
  to?: string;
  language?: string;
  sortBy?: 'relevancy' | 'popularity' | 'publishedAt';
  pageSize?: number;
  page?: number;
}

/**
 * API response wrapper with metadata
 */
export interface ApiResponse<T> {
  status: 'success' | 'error';
  data?: T;
  error?: {
    code: string;
    message: string;
  };
  metadata: {
    timestamp: string;
    version: string;
    cached: boolean;
    stale?: boolean;
  };
  links?: {
    self: string;
    next?: string;
    prev?: string;
  };
}


export interface PaginatedArticles {
  articles: EnhancedArticle[];
  totalResults: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

export enum CircuitState {
  CLOSED = 'closed',
  OPEN = 'open',
  HALF_OPEN = 'half_open',
}


export interface CircuitBreakerConfig {
  threshold: number;
  timeout: number;
  resetTimeout: number;
}

export interface CacheEntry<T> {
  data: T;
  timestamp: number;
  ttl: number;
  stale: boolean;
}

export interface Alert {
  id: string;
  type: 'warning' | 'error' | 'info';
  message: string;
  timestamp: string;
  metadata?: Record<string, unknown>;
}
