/**
 * TanStack Query persister using IndexedDB
 * Enables persistence of query cache for offline support
 */

import { PersistedClient, Persister } from '@tanstack/react-query-persist-client';
import { get, set, del } from 'idb-keyval';

/**
 * Creates an IndexedDB persister for TanStack Query
 * This allows query cache to survive page refreshes
 */
export function createIDBPersister(idbValidKey: IDBValidKey = 'reactQueryCache'): Persister {
  return {
    persistClient: async (client: PersistedClient) => {
      try {
        await set(idbValidKey, client);
      } catch (error) {
        console.error('Failed to persist query cache:', error);
      }
    },
    restoreClient: async () => {
      try {
        return await get<PersistedClient>(idbValidKey);
      } catch (error) {
        console.error('Failed to restore query cache:', error);
        return undefined;
      }
    },
    removeClient: async () => {
      try {
        await del(idbValidKey);
      } catch (error) {
        console.error('Failed to remove query cache:', error);
      }
    },
  };
}
