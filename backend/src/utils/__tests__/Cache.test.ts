/**
 * Unit tests for Cache
 */

import { Cache } from '../Cache';

describe('Cache', () => {
  let cache: Cache;

  beforeEach(() => {
    // Reset singleton before each test
    Cache.resetInstance();
    cache = Cache.getInstance(1); // 1 minute TTL for testing
  });

  afterEach(() => {
    Cache.resetInstance();
  });

  describe('set and get', () => {
    it('should store and retrieve data', () => {
      const testData = { message: 'Hello World' };
      
      cache.set('test-key', testData);
      const result = cache.get<typeof testData>('test-key');
      
      expect(result).not.toBeNull();
      expect(result?.data).toEqual(testData);
      expect(result?.isStale).toBe(false);
    });

    it('should return null for non-existent key', () => {
      const result = cache.get('non-existent');
      
      expect(result).toBeNull();
    });

    it('should handle different data types', () => {
      cache.set('string', 'test');
      cache.set('number', 42);
      cache.set('boolean', true);
      cache.set('array', [1, 2, 3]);
      cache.set('object', { a: 1, b: 2 });
      
      expect(cache.get<string>('string')?.data).toBe('test');
      expect(cache.get<number>('number')?.data).toBe(42);
      expect(cache.get<boolean>('boolean')?.data).toBe(true);
      expect(cache.get<number[]>('array')?.data).toEqual([1, 2, 3]);
      expect(cache.get<{ a: number; b: number }>('object')?.data).toEqual({ a: 1, b: 2 });
    });
  });

  describe('TTL and staleness', () => {
    it('should mark data as stale after TTL expires', async () => {
      const ttlMs = 100; // 100ms for testing
      cache.set('test-key', 'data', ttlMs);
      
      // Immediately should be fresh
      let result = cache.get('test-key');
      expect(result?.isStale).toBe(false);
      
      // Wait for TTL to expire
      await new Promise(resolve => setTimeout(resolve, 150));
      
      // Now should be stale
      result = cache.get('test-key');
      expect(result).not.toBeNull();
      expect(result?.isStale).toBe(true);
    });

    it('should still return data even when stale', async () => {
      const testData = 'stale-data';
      cache.set('test-key', testData, 50);
      
      await new Promise(resolve => setTimeout(resolve, 100));
      
      const result = cache.get<string>('test-key');
      expect(result?.data).toBe(testData);
      expect(result?.isStale).toBe(true);
    });
  });

  describe('has', () => {
    it('should return true for fresh data', () => {
      cache.set('test-key', 'data');
      
      expect(cache.has('test-key')).toBe(true);
    });

    it('should return false for non-existent key', () => {
      expect(cache.has('non-existent')).toBe(false);
    });

    it('should return false for stale data', async () => {
      cache.set('test-key', 'data', 50);
      
      await new Promise(resolve => setTimeout(resolve, 100));
      
      expect(cache.has('test-key')).toBe(false);
    });
  });

  describe('delete', () => {
    it('should delete existing entry', () => {
      cache.set('test-key', 'data');
      
      expect(cache.has('test-key')).toBe(true);
      
      const deleted = cache.delete('test-key');
      
      expect(deleted).toBe(true);
      expect(cache.get('test-key')).toBeNull();
    });

    it('should return false for non-existent key', () => {
      const deleted = cache.delete('non-existent');
      
      expect(deleted).toBe(false);
    });
  });

  describe('clear', () => {
    it('should remove all entries', () => {
      cache.set('key1', 'data1');
      cache.set('key2', 'data2');
      cache.set('key3', 'data3');
      
      cache.clear();
      
      expect(cache.get('key1')).toBeNull();
      expect(cache.get('key2')).toBeNull();
      expect(cache.get('key3')).toBeNull();
      expect(cache.getStats().size).toBe(0);
    });
  });

  describe('getStats', () => {
    it('should return cache statistics', () => {
      cache.set('key1', 'data1');
      cache.set('key2', 'data2');
      
      const stats = cache.getStats();
      
      expect(stats.size).toBe(2);
      expect(stats.entries).toHaveLength(2);
      expect(stats.entries[0]).toHaveProperty('key');
      expect(stats.entries[0]).toHaveProperty('age');
      expect(stats.entries[0]).toHaveProperty('stale');
    });
  });

  describe('cleanup', () => {
    it('should remove very stale entries', async () => {
      const shortTTL = 50;
      cache.set('fresh', 'data1', 60000); // Long TTL
      cache.set('stale', 'data2', shortTTL); // Short TTL
      
      // Wait for stale entry to be 2x TTL old
      await new Promise(resolve => setTimeout(resolve, shortTTL * 2.5));
      
      const removed = cache.cleanup();
      
      expect(removed).toBe(1);
      expect(cache.get('fresh')).not.toBeNull();
      expect(cache.get('stale')).toBeNull();
    });
  });

  describe('singleton pattern', () => {
    it('should return same instance', () => {
      const instance1 = Cache.getInstance();
      const instance2 = Cache.getInstance();
      
      expect(instance1).toBe(instance2);
    });

    it('should share data across instances', () => {
      const instance1 = Cache.getInstance();
      instance1.set('shared-key', 'shared-data');
      
      const instance2 = Cache.getInstance();
      const result = instance2.get('shared-key');
      
      expect(result?.data).toBe('shared-data');
    });
  });
});
