import { Search } from 'lucide-react';
import { useState } from 'react';

interface SearchBarProps {
  onSearch?: (query: string) => void;
  placeholder?: string;
}

export function SearchBar({
  onSearch,
  placeholder = 'Search news articles...',
}: SearchBarProps) {
  const [query, setQuery] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSearch?.(query);
  };

  return (
    <form onSubmit={handleSubmit} className="mb-6">
      <div className="relative">
        <div className="absolute left-4 top-1/2 -translate-y-1/2 text-text-muted pointer-events-none">
          <Search size={20} />
        </div>
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder={placeholder}
          className="w-full bg-dark-surface border border-border rounded-lg px-4 py-3 pl-12 pr-24 text-text-primary placeholder-text-muted focus-orange transition-all"
          aria-label="Search news"
        />
        <button
          type="submit"
          className="absolute right-3 top-1/2 -translate-y-1/2 bg-orange-primary hover:bg-orange-secondary text-white px-4 py-1.5 rounded transition-all btn-transition font-medium"
        >
          Search
        </button>
      </div>
    </form>
  );
}
