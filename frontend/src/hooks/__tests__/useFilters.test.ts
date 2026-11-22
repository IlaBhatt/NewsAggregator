/**
 * Unit tests for useFilters hook (Jest + RTL)
 */

import { renderHook, act } from '@testing-library/react';
import { useFilters } from '../useFilters';

describe('useFilters', () => {
  it('should initialize with default filters', () => {
    const { result } = renderHook(() => useFilters());

    expect(result.current.filters).toEqual({
      dateRange: '24h',
      sources: ['all'],
      sentiments: ['positive', 'neutral', 'negative'],
      sortBy: 'latest',
    });
  });

  it('should update date range', () => {
    const { result } = renderHook(() => useFilters());

    act(() => {
      result.current.updateDateRange('7d');
    });

    expect(result.current.filters.dateRange).toBe('7d');
  });

  it('should update sources', () => {
    const { result } = renderHook(() => useFilters());

    act(() => {
      result.current.updateSources(['bbc', 'cnn']);
    });

    expect(result.current.filters.sources).toEqual(['bbc', 'cnn']);
  });

  it('should update sentiments', () => {
    const { result } = renderHook(() => useFilters());

    act(() => {
      result.current.updateSentiments(['positive']);
    });

    expect(result.current.filters.sentiments).toEqual(['positive']);
  });

  it('should update sort by', () => {
    const { result } = renderHook(() => useFilters());

    act(() => {
      result.current.updateSortBy('popular');
    });

    expect(result.current.filters.sortBy).toBe('popular');
  });

  it('should reset filters to defaults', () => {
    const { result } = renderHook(() => useFilters());

    // Change all filters
    act(() => {
      result.current.updateDateRange('30d');
      result.current.updateSources(['bbc']);
      result.current.updateSentiments(['positive']);
      result.current.updateSortBy('popular');
    });

    // Reset
    act(() => {
      result.current.resetFilters();
    });

    expect(result.current.filters).toEqual({
      dateRange: '24h',
      sources: ['all'],
      sentiments: ['positive', 'neutral', 'negative'],
      sortBy: 'latest',
    });
  });

  describe('getSearchParams', () => {
    it('should convert filters to API parameters', () => {
      const { result } = renderHook(() => useFilters());

      const params = result.current.getSearchParams({ q: 'test', page: 1 });

      expect(params).toHaveProperty('q', 'test');
      expect(params).toHaveProperty('page', 1);
      expect(params).toHaveProperty('from');
      expect(params).toHaveProperty('to');
      expect(params).toHaveProperty('sortBy', 'publishedAt');
    });

    it('should not include sources param when all sources selected', () => {
      const { result } = renderHook(() => useFilters());

      const params = result.current.getSearchParams({ q: 'test' });

      expect(params.sources).toBeUndefined();
    });

    it('should include sources param when specific sources selected', () => {
      const { result } = renderHook(() => useFilters());

      act(() => {
        result.current.updateSources(['bbc', 'cnn']);
      });

      const params = result.current.getSearchParams({ q: 'test' });

      expect(params.sources).toBe('bbc,cnn');
    });

    it('should map UI sort values to API sort values', () => {
      const { result } = renderHook(() => useFilters());

      // Test 'latest' -> 'publishedAt'
      act(() => {
        result.current.updateSortBy('latest');
      });
      expect(result.current.getSearchParams({}).sortBy).toBe('publishedAt');

      // Test 'popular' -> 'popularity'
      act(() => {
        result.current.updateSortBy('popular');
      });
      expect(result.current.getSearchParams({}).sortBy).toBe('popularity');

      // Test 'sentiment' -> 'relevancy'
      act(() => {
        result.current.updateSortBy('sentiment');
      });
      expect(result.current.getSearchParams({}).sortBy).toBe('relevancy');
    });

    it('should generate stable date strings for same day', () => {
      const { result } = renderHook(() => useFilters());

      const params1 = result.current.getSearchParams({ q: 'test' });
      const params2 = result.current.getSearchParams({ q: 'test' });

      // Dates should be the same (stable)
      expect(params1.from).toBe(params2.from);
      expect(params1.to).toBe(params2.to);
    });

    it('should return different date ranges for different selections', () => {
      const { result } = renderHook(() => useFilters());

      // 24h range
      const params24h = result.current.getSearchParams({ q: 'test' });

      // Change to 7d
      act(() => {
        result.current.updateDateRange('7d');
      });
      const params7d = result.current.getSearchParams({ q: 'test' });

      // From dates should be different (7 days apart)
      expect(params24h.from).not.toBe(params7d.from);
      expect(params24h.to).toBe(params7d.to); // To date should be same (today)
    });
  });
});
