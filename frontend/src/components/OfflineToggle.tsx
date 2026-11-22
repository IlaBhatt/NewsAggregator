/**
 * Offline mode toggle component
 * Displays network status and allows users to toggle offline mode
 */

import { useOffline } from '../contexts/OfflineContext';
import { WifiOff, Wifi, Database, Trash2, CloudOff, Cloud } from 'lucide-react';

export function OfflineToggle() {
  const {
    isOnline,
    isOfflineMode,
    toggleOfflineMode,
    lastSync,
    storageStats,
    clearOfflineData,
    cleanOldData,
  } = useOffline();

  return (
    <div className="bg-dark-surface border border-border rounded-lg p-4 space-y-4">
      {/* Network Status */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          {isOnline ? (
            <Wifi className="h-5 w-5 text-accent-green" />
          ) : (
            <WifiOff className="h-5 w-5 text-accent-red" />
          )}
          <div>
            <p className="text-sm font-medium text-text-primary">
              {isOnline ? 'Online' : 'Offline'}
            </p>
            <p className="text-xs text-text-muted">
              {isOnline ? 'Connected to internet' : 'No internet connection'}
            </p>
          </div>
        </div>
        <div
          className={`px-3 py-1 rounded-full text-xs font-medium ${
            isOnline
              ? 'bg-accent-green/10 text-accent-green'
              : 'bg-accent-red/10 text-accent-red'
          }`}
        >
          {isOnline ? 'Connected' : 'Disconnected'}
        </div>
      </div>

      {/* Offline Mode Toggle */}
      <div className="flex items-center justify-between pt-4 border-t border-border">
        <div className="flex items-center gap-3">
          {isOfflineMode ? (
            <CloudOff className="h-5 w-5 text-text-muted" />
          ) : (
            <Cloud className="h-5 w-5 text-text-muted" />
          )}
          <div>
            <p className="text-sm font-medium text-text-primary">Offline Mode</p>
            <p className="text-xs text-text-muted">
              {isOfflineMode ? 'Using cached data' : 'Live updates enabled'}
            </p>
          </div>
        </div>
        <button
          onClick={toggleOfflineMode}
          disabled={!isOnline}
          className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-accent-primary focus:ring-offset-2 focus:ring-offset-dark-bg disabled:opacity-50 disabled:cursor-not-allowed ${
            isOfflineMode ? 'bg-accent-primary' : 'bg-dark-border'
          }`}
          role="switch"
          aria-checked={isOfflineMode}
          aria-label="Toggle offline mode"
        >
          <span
            className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
              isOfflineMode ? 'translate-x-6' : 'translate-x-1'
            }`}
          />
        </button>
      </div>

      {/* Storage Stats */}
      {storageStats && storageStats.articles > 0 && (
        <div className="pt-4 border-t border-border">
          <div className="flex items-start gap-3">
            <Database className="h-5 w-5 text-text-muted mt-0.5" />
            <div className="flex-1">
              <p className="text-sm font-medium text-text-primary mb-1">Offline Storage</p>
              <div className="space-y-1 text-xs text-text-muted">
                <p>{storageStats.articles} articles saved</p>
                <p>{storageStats.queries} searches cached</p>
                <p>~{storageStats.estimatedSize} KB used</p>
                {lastSync && (
                  <p>
                    Last sync: {new Date(lastSync).toLocaleString()}
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* Storage Actions */}
          <div className="flex gap-2 mt-3">
            <button
              onClick={cleanOldData}
              className="flex-1 px-3 py-1.5 text-xs font-medium text-text-muted bg-dark-bg border border-border rounded hover:bg-dark-border transition-colors"
            >
              Clean Old Data
            </button>
            <button
              onClick={clearOfflineData}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-accent-red bg-accent-red/10 border border-accent-red/20 rounded hover:bg-accent-red/20 transition-colors"
            >
              <Trash2 className="h-3 w-3" />
              Clear All
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
