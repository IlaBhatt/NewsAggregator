/**
 * Component to display active filters
 */

import { X } from 'lucide-react';
import type { NewsFilters } from '../hooks/useFilters';

interface ActiveFiltersProps {
  filters: NewsFilters;
  onRemoveFilter: (filterType: keyof NewsFilters, value?: string) => void;
}

export function ActiveFilters({ filters, onRemoveFilter }: ActiveFiltersProps) {
  const hasActiveFilters =
    filters.dateRange !== '24h' ||
    !filters.sources.includes('all') ||
    filters.sentiments.length < 3 ||
    filters.sortBy !== 'latest';

  if (!hasActiveFilters) {
    return null;
  }

  const getDateRangeLabel = (range: string) => {
    switch (range) {
      case '24h':
        return 'Last 24 hours';
      case '7d':
        return 'Last 7 days';
      case '30d':
        return 'Last 30 days';
      case 'custom':
        return 'Custom range';
      default:
        return range;
    }
  };

  const getSortByLabel = (sort: string) => {
    switch (sort) {
      case 'latest':
        return 'Latest';
      case 'popular':
        return 'Most Popular';
      case 'sentiment':
        return 'By Sentiment';
      default:
        return sort;
    }
  };

  return (
    <div className="mb-4 flex flex-wrap gap-2 items-center">
      <span className="text-sm text-text-secondary">Active filters:</span>

      {filters.dateRange !== '24h' && (
        <FilterChip
          label={getDateRangeLabel(filters.dateRange)}
          onRemove={() => onRemoveFilter('dateRange')}
        />
      )}

      {!filters.sources.includes('all') &&
        filters.sources.map((source) => (
          <FilterChip
            key={source}
            label={source.toUpperCase()}
            onRemove={() => onRemoveFilter('sources', source)}
          />
        ))}

      {filters.sentiments.length < 3 &&
        filters.sentiments.map((sentiment) => (
          <FilterChip
            key={sentiment}
            label={sentiment.charAt(0).toUpperCase() + sentiment.slice(1)}
            onRemove={() => onRemoveFilter('sentiments', sentiment)}
          />
        ))}

      {filters.sortBy !== 'latest' && (
        <FilterChip
          label={getSortByLabel(filters.sortBy)}
          onRemove={() => onRemoveFilter('sortBy')}
        />
      )}
    </div>
  );
}

function FilterChip({
  label,
  onRemove,
}: {
  label: string;
  onRemove: () => void;
}) {
  return (
    <span className="inline-flex items-center gap-1 bg-orange-primary/10 border border-orange-primary/30 text-orange-primary px-3 py-1 rounded-full text-sm">
      {label}
      <button
        onClick={onRemove}
        className="hover:bg-orange-primary/20 rounded-full p-0.5 transition-colors"
        aria-label={`Remove ${label} filter`}
      >
        <X size={14} />
      </button>
    </span>
  );
}
