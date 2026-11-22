import { ChevronLeft, ChevronRight } from 'lucide-react';

interface PaginationProps {
  currentPage: number;
  totalPages: number;
  totalResults: number;
  resultsPerPage: number;
  onPageChange: (page: number) => void;
}

export function Pagination({
  currentPage,
  totalPages,
  totalResults,
  resultsPerPage,
  onPageChange,
}: PaginationProps) {
  const startResult = (currentPage - 1) * resultsPerPage + 1;
  const endResult = Math.min(currentPage * resultsPerPage, totalResults);

  const getPageNumbers = () => {
    const pages: (number | string)[] = [];
    const maxVisible = 5;

    if (totalPages <= maxVisible) {
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i);
      }
    } else {
      pages.push(1);

      if (currentPage > 3) {
        pages.push('...');
      }

      const start = Math.max(2, currentPage - 1);
      const end = Math.min(totalPages - 1, currentPage + 1);

      for (let i = start; i <= end; i++) {
        pages.push(i);
      }

      if (currentPage < totalPages - 2) {
        pages.push('...');
      }

      pages.push(totalPages);
    }

    return pages;
  };

  return (
    <div className="flex flex-col sm:flex-row items-center justify-between mt-8 gap-4">
      {/* Results info */}
      <p className="text-sm text-text-muted">
        Showing{' '}
        <span className="text-text-primary font-medium">
          {startResult}-{endResult}
        </span>{' '}
        of <span className="text-text-primary font-medium">{totalResults}</span>{' '}
        results
      </p>

      {/* Page navigation */}
      <div className="flex items-center gap-2">
        {/* Previous button */}
        <button
          onClick={() => onPageChange(currentPage - 1)}
          disabled={currentPage === 1}
          className="p-2 border border-border rounded hover:border-orange-primary hover:text-orange-primary text-text-secondary transition-all disabled:opacity-30 disabled:cursor-not-allowed disabled:hover:border-border disabled:hover:text-text-secondary"
          aria-label="Previous page"
        >
          <ChevronLeft size={20} />
        </button>

        {/* Page numbers */}
        {getPageNumbers().map((page, index) => (
          <button
            key={index}
            onClick={() => typeof page === 'number' && onPageChange(page)}
            disabled={page === '...'}
            className={`px-3 py-1 rounded min-w-[2.5rem] transition-all ${
              page === currentPage
                ? 'bg-orange-primary text-white font-medium'
                : page === '...'
                  ? 'text-text-muted cursor-default'
                  : 'border border-border text-text-secondary hover:border-orange-primary hover:text-orange-primary'
            }`}
          >
            {page}
          </button>
        ))}

        {/* Next button */}
        <button
          onClick={() => onPageChange(currentPage + 1)}
          disabled={currentPage === totalPages}
          className="p-2 border border-border rounded hover:border-orange-primary hover:text-orange-primary text-text-secondary transition-all disabled:opacity-30 disabled:cursor-not-allowed disabled:hover:border-border disabled:hover:text-text-secondary"
          aria-label="Next page"
        >
          <ChevronRight size={20} />
        </button>
      </div>
    </div>
  );
}
