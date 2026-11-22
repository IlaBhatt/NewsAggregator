import { CacheEntry } from "../types";
import { logger } from "../config/logger";

export class Cache {
  private static instance: Cache;
  private cache: Map<string, CacheEntry<unknown>>;
  private defaultTtl: number;
  private cleanupMultiplier: number;

  private constructor(ttlMinutes: number = 15, cleanupMultiplier: number = 2) {
    this.cache = new Map();
    this.defaultTtl = ttlMinutes * 60 * 1000;
    this.cleanupMultiplier = cleanupMultiplier;
    logger.info(
      `Cache initialized with TTL: ${ttlMinutes} minutes, cleanup at ${cleanupMultiplier}× TTL`,
    );
  }

  public static getInstance(
    ttlMinutes?: number,
    cleanupMultiplier?: number,
  ): Cache {
    if (!Cache.instance) {
      Cache.instance = new Cache(ttlMinutes, cleanupMultiplier);
    }
    return Cache.instance;
  }

  public set<T>(key: string, data: T, ttl?: number): void {
    const effectiveTtl = ttl || this.defaultTtl;
    const entry: CacheEntry<T> = {
      data,
      timestamp: Date.now(),
      ttl: effectiveTtl,
      stale: false,
    };

    this.cache.set(key, entry as CacheEntry<unknown>);
    logger.debug(`Cache SET: ${key}`);
  }

  
  public get<T>(key: string): { data: T; isStale: boolean } | null {
    const entry = this.cache.get(key) as CacheEntry<T> | undefined;

    if (!entry) {
      logger.debug(`Cache MISS: ${key}`);
      return null;
    }

    const age = Date.now() - entry.timestamp;
    const isStale = age > entry.ttl;

    if (isStale && !entry.stale) {
      entry.stale = true;
      this.cache.set(key, entry as CacheEntry<unknown>);
    }

    logger.debug(`Cache HIT: ${key} (stale: ${isStale})`);
    return { data: entry.data, isStale };
  }

  public has(key: string): boolean {
    const result = this.get(key);
    return result !== null && !result.isStale;
  }

  public delete(key: string): boolean {
    const deleted = this.cache.delete(key);
    if (deleted) {
      logger.debug(`Cache DELETE: ${key}`);
    }
    return deleted;
  }

  public clear(): void {
    this.cache.clear();
    logger.info("Cache cleared");
  }

  public getStats(): {
    size: number;
    entries: Array<{ key: string; age: number; stale: boolean }>;
  } {
    const entries = Array.from(this.cache.entries()).map(([key, entry]) => ({
      key,
      age: Date.now() - entry.timestamp,
      stale: entry.stale,
    }));

    return {
      size: this.cache.size,
      entries,
    };
  }

  public cleanup(): number {
    let removed = 0;
    const now = Date.now();

    for (const [key, entry] of this.cache.entries()) {
      const age = now - entry.timestamp;
      if (age > entry.ttl * this.cleanupMultiplier) {
        this.cache.delete(key);
        removed++;
      }
    }

    if (removed > 0) {
      logger.info(
        `Cache cleanup: removed ${removed} stale entries (>${this.cleanupMultiplier}× TTL)`,
      );
    }

    return removed;
  }

  public static resetInstance(): void {
    if (Cache.instance) {
      Cache.instance.clear();
      Cache.instance = null as unknown as Cache;
    }
  }
}
