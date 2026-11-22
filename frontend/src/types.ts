/**
 * Type definitions for News Aggregator
 * Matches backend API types
 */

/**
 * Sentiment classification
 */
export type SentimentType = 'positive' | 'neutral' | 'negative';

/**
 * Sentiment analysis result
 */
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
 * News article source
 */
export interface ArticleSource {
  id: string | null;
  name: string;
}

/**
 * Base news article from API
 */
export interface NewsArticle {
  source: ArticleSource;
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
  id: string;
  sentiment: SentimentResult;
  credibility: SourceCredibility;
}

/**
 * Search parameters for news API
 */
export interface SearchParams {
  q?: string; // Search query
  sources?: string; // Comma-separated source IDs
  from?: string; // Start date (ISO 8601)
  to?: string; // End date (ISO 8601)
  language?: string; // Language code (default: 'en')
  sortBy?: 'relevancy' | 'popularity' | 'publishedAt';
  pageSize?: number; // Results per page (default: 20)
  page?: number; // Page number (default: 1)
}

/**
 * Headlines query parameters
 */
export interface HeadlinesParams {
  country?: string; // Country code (default: 'us')
  category?: string; // Category (business, entertainment, health, science, sports, technology)
}

/**
 * Paginated articles response
 */
export interface PaginatedArticles {
  articles: EnhancedArticle[];
  totalResults: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

/**
 * API response wrapper
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

/**
 * Sentiment overview data
 */
export interface SentimentOverviewData {
  positive: number;
  neutral: number;
  negative: number;
}

/**
 * Article for display (simplified for UI components)
 */
export interface Article {
  id: string;
  title: string;
  description: string;
  source: string;
  sentiment: SentimentType;
  credibilityScore: number;
  publishedAt: string;
  url: string;
  imageUrl: string | null;
  author: string | null;
}

/**
 * Convert EnhancedArticle from backend to Article for UI
 */
export function toArticle(enhanced: EnhancedArticle): Article {
  return {
    id: enhanced.id,
    title: enhanced.title,
    description: enhanced.description || '',
    source: enhanced.source.name,
    sentiment: enhanced.sentiment.type,
    credibilityScore: enhanced.credibility.score,
    publishedAt: enhanced.publishedAt,
    url: enhanced.url,
    imageUrl: enhanced.urlToImage,
    author: enhanced.author,
  };
}

/**
 * Calculate sentiment overview from articles
 */
export function calculateSentimentOverview(
  articles: EnhancedArticle[]
): SentimentOverviewData {
  if (articles.length === 0) {
    return { positive: 0, neutral: 0, negative: 0 };
  }

  const counts = articles.reduce(
    (acc, article) => {
      acc[article.sentiment.type]++;
      return acc;
    },
    { positive: 0, neutral: 0, negative: 0 }
  );

  const total = articles.length;
  return {
    positive: Math.round((counts.positive / total) * 100),
    neutral: Math.round((counts.neutral / total) * 100),
    negative: Math.round((counts.negative / total) * 100),
  };
}
