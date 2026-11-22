/**
 * Unit tests for type utility functions (Jest)
 */

import { toArticle, calculateSentimentOverview } from '../types';
import { mockEnhancedArticle } from '../test/test-utils';

describe('toArticle', () => {
  it('should convert EnhancedArticle to Article', () => {
    const result = toArticle(mockEnhancedArticle);

    expect(result).toEqual({
      id: mockEnhancedArticle.id,
      title: mockEnhancedArticle.title,
      description: mockEnhancedArticle.description,
      source: mockEnhancedArticle.source.name,
      sentiment: mockEnhancedArticle.sentiment.type,
      credibilityScore: mockEnhancedArticle.credibility.score,
      publishedAt: mockEnhancedArticle.publishedAt,
      url: mockEnhancedArticle.url,
      imageUrl: mockEnhancedArticle.urlToImage,
      author: mockEnhancedArticle.author,
    });
  });

  it('should handle null description', () => {
    const articleWithNullDesc = {
      ...mockEnhancedArticle,
      description: null,
    };

    const result = toArticle(articleWithNullDesc);

    expect(result.description).toBe('');
  });

  it('should preserve null values for optional fields', () => {
    const articleWithNulls = {
      ...mockEnhancedArticle,
      author: null,
      urlToImage: null,
    };

    const result = toArticle(articleWithNulls);

    expect(result.author).toBeNull();
    expect(result.imageUrl).toBeNull();
  });
});

describe('calculateSentimentOverview', () => {
  it('should calculate percentages correctly', () => {
    const articles = [
      { ...mockEnhancedArticle, sentiment: { ...mockEnhancedArticle.sentiment, type: 'positive' as const } },
      { ...mockEnhancedArticle, sentiment: { ...mockEnhancedArticle.sentiment, type: 'positive' as const } },
      { ...mockEnhancedArticle, sentiment: { ...mockEnhancedArticle.sentiment, type: 'neutral' as const } },
      { ...mockEnhancedArticle, sentiment: { ...mockEnhancedArticle.sentiment, type: 'negative' as const } },
    ];

    const result = calculateSentimentOverview(articles);

    expect(result.positive).toBe(50); // 2 out of 4
    expect(result.neutral).toBe(25);  // 1 out of 4
    expect(result.negative).toBe(25); // 1 out of 4
  });

  it('should return zeros for empty array', () => {
    const result = calculateSentimentOverview([]);

    expect(result).toEqual({
      positive: 0,
      neutral: 0,
      negative: 0,
    });
  });

  it('should handle all same sentiment', () => {
    const articles = [
      { ...mockEnhancedArticle, sentiment: { ...mockEnhancedArticle.sentiment, type: 'positive' as const } },
      { ...mockEnhancedArticle, sentiment: { ...mockEnhancedArticle.sentiment, type: 'positive' as const } },
    ];

    const result = calculateSentimentOverview(articles);

    expect(result.positive).toBe(100);
    expect(result.neutral).toBe(0);
    expect(result.negative).toBe(0);
  });

  it('should round percentages', () => {
    const articles = [
      { ...mockEnhancedArticle, sentiment: { ...mockEnhancedArticle.sentiment, type: 'positive' as const } },
      { ...mockEnhancedArticle, sentiment: { ...mockEnhancedArticle.sentiment, type: 'positive' as const } },
      { ...mockEnhancedArticle, sentiment: { ...mockEnhancedArticle.sentiment, type: 'neutral' as const } },
    ];

    const result = calculateSentimentOverview(articles);

    // 2/3 = 66.666... should round to 67
    // 1/3 = 33.333... should round to 33
    expect(result.positive).toBe(67);
    expect(result.neutral).toBe(33);
    expect(result.negative).toBe(0);
  });
});
