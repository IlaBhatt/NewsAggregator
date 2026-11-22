/**
 * Offline banner component
 * Shows a notification when user is offline or in offline mode
 */

import { useOffline } from '../contexts/OfflineContext';
import { WifiOff, Info, X } from 'lucide-react';
import { useState } from 'react';

export function OfflineBanner() {
  const { isOnline, isOfflineMode, storageStats } = useOffline();
  const [isDismissed, setIsDismissed] = useState(false);

  // Don't show if online and not in offline mode
  if (isOnline && !isOfflineMode) return null;

  // Don't show if dismissed
  if (isDismissed) return null;

  const isOfflineNetwork = !isOnline;
  const hasStoredData = (storageStats?.articles || 0) > 0;

  return (
    <div
      className={`relative rounded-lg p-4 mb-4 border ${
        isOfflineNetwork
          ? 'bg-accent-red/10 border-accent-red/20'
          : 'bg-accent-blue/10 border-accent-blue/20'
      }`}
      role="alert"
    >
      <div className="flex items-start gap-3">
        <div
          className={`mt-0.5 ${
            isOfflineNetwork ? 'text-accent-red' : 'text-accent-blue'
          }`}
        >
          {isOfflineNetwork ? (
            <WifiOff className="h-5 w-5" />
          ) : (
            <Info className="h-5 w-5" />
          )}
        </div>

        <div className="flex-1">
          <h3
            className={`text-sm font-semibold mb-1 ${
              isOfflineNetwork ? 'text-accent-red' : 'text-accent-blue'
            }`}
          >
            {isOfflineNetwork ? 'No Internet Connection' : 'Offline Mode Active'}
          </h3>
          <p className="text-sm text-text-muted">
            {isOfflineNetwork ? (
              hasStoredData ? (
                <>
                  You are viewing cached content. {storageStats!.articles} articles available
                  offline. Some features may be unavailable.
                </>
              ) : (
                'No cached content available. Please check your internet connection.'
              )
            ) : (
              <>
                You are browsing saved articles ({storageStats?.articles || 0} available). Turn
                off offline mode to fetch new content.
              </>
            )}
          </p>
        </div>

        <button
          onClick={() => setIsDismissed(true)}
          className="text-text-muted hover:text-text-primary transition-colors"
          aria-label="Dismiss notification"
        >
          <X className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}
