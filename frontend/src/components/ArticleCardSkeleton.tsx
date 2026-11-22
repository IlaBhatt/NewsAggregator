/**
 * Loading skeleton for ArticleCard
 * Displays while articles are being fetched
 */

export function ArticleCardSkeleton() {
  return (
    <article className="bg-dark-surface rounded-lg p-5 border border-border animate-pulse">
      {/* Header with source and sentiment */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          {/* Skeleton stars */}
          <div className="flex gap-1">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="w-4 h-4 bg-border rounded-full" />
            ))}
          </div>
          {/* Skeleton source */}
          <div className="h-4 w-24 bg-border rounded" />
        </div>

        {/* Skeleton sentiment badge */}
        <div className="h-6 w-24 bg-border rounded-full" />
      </div>

      {/* Skeleton title */}
      <div className="space-y-2 mb-2">
        <div className="h-5 bg-border rounded w-full" />
        <div className="h-5 bg-border rounded w-4/5" />
      </div>

      {/* Skeleton description */}
      <div className="space-y-2 mb-4">
        <div className="h-4 bg-border rounded w-full" />
        <div className="h-4 bg-border rounded w-3/4" />
      </div>

      {/* Skeleton footer */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="h-3 w-16 bg-border rounded" />
          <div className="h-3 w-20 bg-border rounded" />
          <div className="h-3 w-24 bg-border rounded" />
        </div>
        <div className="h-3 w-12 bg-border rounded" />
      </div>
    </article>
  );
}

/**
 * Multiple skeleton loaders
 */
export function ArticleListSkeleton({ count = 6 }: { count?: number }) {
  return (
    <div className="space-y-4">
      {[...Array(count)].map((_, i) => (
        <ArticleCardSkeleton key={i} />
      ))}
    </div>
  );
}
