/**
 * Offline mode context and provider
 * Manages online/offline state, offline mode toggle, and sync status
 */

import React, { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react';
import { offlineStorage } from '../utils/offlineStorage';

interface OfflineContextType {
  // Network state
  isOnline: boolean;
  
  // User preference for offline mode
  isOfflineMode: boolean;
  toggleOfflineMode: () => void;
  
  // Sync status
  syncStatus: 'idle' | 'syncing' | 'success' | 'error';
  lastSync: Date | null;
  
  // Storage stats
  storageStats: {
    articles: number;
    queries: number;
    estimatedSize: number;
  } | null;
  
  // Actions
  refreshStats: () => Promise<void>;
  clearOfflineData: () => Promise<void>;
  cleanOldData: () => Promise<void>;
}

const OfflineContext = createContext<OfflineContextType | undefined>(undefined);

export const OfflineProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [isOfflineMode, setIsOfflineMode] = useState(
    localStorage.getItem('offlineMode') === 'true'
  );
  const [syncStatus, setSyncStatus] = useState<'idle' | 'syncing' | 'success' | 'error'>('idle');
  const [lastSync, setLastSync] = useState<Date | null>(null);
  const [storageStats, setStorageStats] = useState<{
    articles: number;
    queries: number;
    estimatedSize: number;
  } | null>(null);

  // Listen to online/offline events
  useEffect(() => {
    const handleOnline = () => {
      setIsOnline(true);
      console.log('🌐 Connection restored');
    };
    
    const handleOffline = () => {
      setIsOnline(false);
      console.log('📡 Connection lost - switching to offline mode');
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  // Load initial data
  useEffect(() => {
    const init = async () => {
      try {
        const lastSyncTimestamp = await offlineStorage.getLastSync();
        if (lastSyncTimestamp) {
          setLastSync(new Date(lastSyncTimestamp));
        }
        await refreshStats();
      } catch (error) {
        console.error('Failed to initialize offline storage:', error);
      }
    };
    init();
  }, []);

  // Toggle offline mode
  const toggleOfflineMode = useCallback(() => {
    const newMode = !isOfflineMode;
    setIsOfflineMode(newMode);
    localStorage.setItem('offlineMode', String(newMode));
    console.log(`${newMode ? '📴' : '🌐'} Offline mode ${newMode ? 'enabled' : 'disabled'}`);
  }, [isOfflineMode]);

  // Refresh storage statistics
  const refreshStats = useCallback(async () => {
    try {
      const stats = await offlineStorage.getStorageStats();
      setStorageStats(stats);
    } catch (error) {
      console.error('Failed to get storage stats:', error);
    }
  }, []);

  // Clear all offline data
  const clearOfflineData = useCallback(async () => {
    try {
      setSyncStatus('syncing');
      await offlineStorage.clearAll();
      setStorageStats({ articles: 0, queries: 0, estimatedSize: 0 });
      setLastSync(null);
      setSyncStatus('success');
      console.log('🗑️ Offline data cleared');
      setTimeout(() => setSyncStatus('idle'), 2000);
    } catch (error) {
      console.error('Failed to clear offline data:', error);
      setSyncStatus('error');
      setTimeout(() => setSyncStatus('idle'), 2000);
    }
  }, []);

  // Clean old data (older than 7 days)
  const cleanOldData = useCallback(async () => {
    try {
      setSyncStatus('syncing');
      const deletedCount = await offlineStorage.clearOldArticles(7);
      await refreshStats();
      setSyncStatus('success');
      console.log(`🧹 Cleaned ${deletedCount} old articles`);
      setTimeout(() => setSyncStatus('idle'), 2000);
    } catch (error) {
      console.error('Failed to clean old data:', error);
      setSyncStatus('error');
      setTimeout(() => setSyncStatus('idle'), 2000);
    }
  }, [refreshStats]);

  const value: OfflineContextType = {
    isOnline,
    isOfflineMode,
    toggleOfflineMode,
    syncStatus,
    lastSync,
    storageStats,
    refreshStats,
    clearOfflineData,
    cleanOldData,
  };

  return <OfflineContext.Provider value={value}>{children}</OfflineContext.Provider>;
};

export const useOffline = () => {
  const context = useContext(OfflineContext);
  if (!context) {
    throw new Error('useOffline must be used within OfflineProvider');
  }
  return context;
};
