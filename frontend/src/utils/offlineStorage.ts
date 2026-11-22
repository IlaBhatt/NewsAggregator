/**
 * IndexedDB wrapper for offline article storage
 * Provides persistent storage for news articles when offline
 */

import { openDB, DBSchema, IDBPDatabase } from 'idb';
import type { EnhancedArticle } from '../types';

interface OfflineDB extends DBSchema {
  articles: {
    key: string;
    value: {
      article: EnhancedArticle;
      savedAt: number;
      query?: string;
    };
    indexes: { 'by-date': number; 'by-query': string };
  };
  queries: {
    key: string;
    value: {
      query: string;
      articleIds: string[];
      timestamp: number;
      params: Record<string, any>;
    };
  };
  metadata: {
    key: string;
    value: {
      lastSync: number;
      storageSize: number;
    };
  };
}

class OfflineStorage {
  private dbPromise: Promise<IDBPDatabase<OfflineDB>>;
  private readonly DB_NAME = 'NewsAggregatorDB';
  private readonly DB_VERSION = 1;

  constructor() {
    this.dbPromise = this.initDB();
  }

  private async initDB(): Promise<IDBPDatabase<OfflineDB>> {
    return openDB<OfflineDB>(this.DB_NAME, this.DB_VERSION, {
      upgrade(db) {
        // Articles store
        if (!db.objectStoreNames.contains('articles')) {
          const articleStore = db.createObjectStore('articles', { keyPath: 'article.id' });
          articleStore.createIndex('by-date', 'savedAt');
          articleStore.createIndex('by-query', 'query');
        }

        // Queries store
        if (!db.objectStoreNames.contains('queries')) {
          db.createObjectStore('queries', { keyPath: 'query' });
        }

        // Metadata store
        if (!db.objectStoreNames.contains('metadata')) {
          db.createObjectStore('metadata', { keyPath: 'key' });
        }
      },
    });
  }

  /**
   * Save a single article
   */
  async saveArticle(article: EnhancedArticle, query?: string): Promise<void> {
    const db = await this.dbPromise;
    await db.put('articles', {
      article,
      savedAt: Date.now(),
      query,
    });
  }

  /**
   * Save multiple articles
   */
  async saveArticles(articles: EnhancedArticle[], query?: string): Promise<void> {
    const db = await this.dbPromise;
    const tx = db.transaction('articles', 'readwrite');
    
    await Promise.all([
      ...articles.map((article) =>
        tx.store.put({
          article,
          savedAt: Date.now(),
          query,
        })
      ),
      tx.done,
    ]);
  }

  /**
   * Get a single article by ID
   */
  async getArticle(id: string): Promise<EnhancedArticle | undefined> {
    const db = await this.dbPromise;
    const result = await db.get('articles', id);
    return result?.article;
  }

  /**
   * Get all articles
   */
  async getAllArticles(): Promise<EnhancedArticle[]> {
    const db = await this.dbPromise;
    const results = await db.getAll('articles');
    return results.map((r) => r.article);
  }

  /**
   * Save query results
   */
  async saveQuery(
    query: string,
    articleIds: string[],
    params: Record<string, any>
  ): Promise<void> {
    const db = await this.dbPromise;
    await db.put('queries', {
      query,
      articleIds,
      timestamp: Date.now(),
      params,
    });
  }

  /**
   * Get articles for a specific query
   */
  async getQueryResults(query: string): Promise<EnhancedArticle[]> {
    const db = await this.dbPromise;
    const queryData = await db.get('queries', query);

    if (!queryData) return [];

    const articles = await Promise.all(
      queryData.articleIds.map((id) => this.getArticle(id))
    );

    return articles.filter((a): a is EnhancedArticle => a !== undefined);
  }

  /**
   * Clear articles older than specified days
   */
  async clearOldArticles(daysToKeep: number = 7): Promise<number> {
    const db = await this.dbPromise;
    const cutoff = Date.now() - daysToKeep * 24 * 60 * 60 * 1000;

    const tx = db.transaction('articles', 'readwrite');
    const index = tx.store.index('by-date');

    let cursor = await index.openCursor(IDBKeyRange.upperBound(cutoff));
    let deletedCount = 0;

    while (cursor) {
      await cursor.delete();
      deletedCount++;
      cursor = await cursor.continue();
    }

    await tx.done;
    return deletedCount;
  }

  /**
   * Get storage statistics
   */
  async getStorageStats(): Promise<{
    articles: number;
    queries: number;
    estimatedSize: number;
  }> {
    const db = await this.dbPromise;
    const [articles, queries] = await Promise.all([
      db.count('articles'),
      db.count('queries'),
    ]);

    // Estimate size (rough calculation)
    const estimatedSize = articles * 5 + queries * 1; // KB

    return { articles, queries, estimatedSize };
  }

  /**
   * Update last sync timestamp
   */
  async updateLastSync(): Promise<void> {
    const db = await this.dbPromise;
    const stats = await this.getStorageStats();
    
    await db.put('metadata', {
      key: 'lastSync',
      lastSync: Date.now(),
      storageSize: stats.estimatedSize,
    });
  }

  /**
   * Get last sync timestamp
   */
  async getLastSync(): Promise<number | null> {
    const db = await this.dbPromise;
    const metadata = await db.get('metadata', 'lastSync');
    return metadata?.lastSync || null;
  }

  /**
   * Clear all data
   */
  async clearAll(): Promise<void> {
    const db = await this.dbPromise;
    await Promise.all([
      db.clear('articles'),
      db.clear('queries'),
      db.clear('metadata'),
    ]);
  }

  /**
   * Check if database is available
   */
  async isAvailable(): Promise<boolean> {
    try {
      await this.dbPromise;
      return true;
    } catch {
      return false;
    }
  }
}

// Singleton instance
export const offlineStorage = new OfflineStorage();
