/**
 * Error message component
 * Displays API errors with retry option
 */

import { AlertCircle, RefreshCw } from 'lucide-react';

interface ErrorMessageProps {
  title?: string;
  message: string;
  onRetry?: () => void;
}

export function ErrorMessage({
  title = 'Error Loading Data',
  message,
  onRetry,
}: ErrorMessageProps) {
  return (
    <div className="bg-dark-surface rounded-lg p-8 border border-red-500/30">
      <div className="flex flex-col items-center text-center max-w-md mx-auto">
        {/* Error icon */}
        <div className="mb-4">
          <AlertCircle size={48} className="text-red-500" />
        </div>

        {/* Title */}
        <h3 className="text-lg font-semibold text-text-primary mb-2">
          {title}
        </h3>

        {/* Error message */}
        <p className="text-text-secondary mb-6">{message}</p>

        {/* Retry button */}
        {onRetry && (
          <button
            onClick={onRetry}
            className="flex items-center gap-2 bg-orange-primary hover:bg-orange-secondary text-white px-6 py-2 rounded-lg transition-colors font-medium"
          >
            <RefreshCw size={16} />
            Try Again
          </button>
        )}
      </div>
    </div>
  );
}

/**
 * Empty state component for no results
 */
export function EmptyState({
  title = 'No Results Found',
  message = 'Try adjusting your search or filters',
}: {
  title?: string;
  message?: string;
}) {
  return (
    <div className="bg-dark-surface rounded-lg p-12 border border-border text-center">
      <div className="max-w-md mx-auto">
        {/* Empty icon */}
        <div className="text-6xl mb-4">🔍</div>

        {/* Title */}
        <h3 className="text-xl font-semibold text-text-primary mb-2">
          {title}
        </h3>

        {/* Message */}
        <p className="text-text-secondary">{message}</p>
      </div>
    </div>
  );
}
