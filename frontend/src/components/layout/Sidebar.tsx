import { Calendar, Newspaper, Download, RotateCcw } from "lucide-react";
import type {
  NewsFilters,
  DateRangeType,
  SortByType,
} from "../../hooks/useFilters";

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
  filters: NewsFilters;
  onDateRangeChange: (range: DateRangeType) => void;
  onSourcesChange: (sources: string[]) => void;
  onSentimentsChange: (sentiments: string[]) => void;
  onSortByChange: (sortBy: SortByType) => void;
  onResetFilters: () => void;
}

export function Sidebar({
  isOpen,
  onClose,
  filters,
  onDateRangeChange,
  onSourcesChange,
  onSentimentsChange,
  onSortByChange,
  onResetFilters,
}: SidebarProps) {
  const sources = [
    { id: "all", name: "All Sources" },
    { id: "bbc", name: "BBC News" },
    { id: "cnn", name: "CNN" },
    { id: "reuters", name: "Reuters" },
    { id: "techcrunch", name: "TechCrunch" },
    { id: "bloomberg", name: "Bloomberg" },
  ];

  const sentiments = [
    { id: "positive", label: "😊 Positive", color: "text-green-500" },
    { id: "neutral", label: "😐 Neutral", color: "text-slate-400" },
    { id: "negative", label: "😞 Negative", color: "text-red-500" },
  ];

  const toggleSource = (sourceId: string) => {
    if (sourceId === "all") {
      onSourcesChange(["all"]);
    } else {
      const filtered = filters.sources.filter((s) => s !== "all");
      if (filtered.includes(sourceId)) {
        const updated = filtered.filter((s) => s !== sourceId);
        onSourcesChange(updated.length > 0 ? updated : ["all"]);
      } else {
        onSourcesChange([...filtered, sourceId]);
      }
    }
  };

  const toggleSentiment = (sentimentId: string) => {
    if (filters.sentiments.includes(sentimentId)) {
      const updated = filters.sentiments.filter((s) => s !== sentimentId);
      // Keep at least one sentiment selected
      if (updated.length > 0) {
        onSentimentsChange(updated);
      }
    } else {
      onSentimentsChange([...filters.sentiments, sentimentId]);
    }
  };

  return (
    <>
      {/* Overlay for mobile */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={onClose}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`
          fixed left-0 top-16 bottom-0 w-72 bg-dark-surface border-r border-border
          overflow-y-auto z-40 transition-transform duration-300
          ${isOpen ? "translate-x-0" : "-translate-x-full"}
          lg:translate-x-0
        `}
      >
        {/* Date Filter */}
        <div className="p-4 border-b border-border">
          <label className="text-sm text-text-secondary mb-2 block flex items-center gap-2">
            <Calendar size={16} />
            Date Range
          </label>
          <select
            value={filters.dateRange}
            onChange={(e) => onDateRangeChange(e.target.value as DateRangeType)}
            className="w-full bg-dark-bg border border-border rounded px-3 py-2 text-text-primary focus-orange cursor-pointer"
          >
            <option value="24h">Last 24 hours</option>
            <option value="7d">Last 7 days</option>
            <option value="30d">Last 30 days</option>
            <option value="custom">Custom Range</option>
          </select>
        </div>

        {/* Source Filter */}
        <div className="p-4 border-b border-border">
          <label className="text-sm text-text-secondary mb-3 block flex items-center gap-2">
            <Newspaper size={16} />
            Sources
          </label>
          <div className="space-y-2">
            {sources.map((source) => (
              <label
                key={source.id}
                className="flex items-center gap-2 text-text-primary cursor-pointer hover:text-orange-primary transition-colors group"
              >
                <input
                  type="checkbox"
                  checked={filters.sources.includes(source.id)}
                  onChange={() => toggleSource(source.id)}
                  className="w-4 h-4 accent-orange-primary cursor-pointer"
                />
                <span className="text-sm group-hover:text-orange-primary transition-colors">
                  {source.name}
                </span>
              </label>
            ))}
          </div>
        </div>

        {/* Sentiment Filter */}
        <div className="p-4 border-b border-border">
          <label className="text-sm text-text-secondary mb-3 block">
            Sentiment Filter
          </label>
          <div className="space-y-2">
            {sentiments.map((sentiment) => (
              <label
                key={sentiment.id}
                className="flex items-center gap-2 text-text-primary cursor-pointer group"
              >
                <input
                  type="checkbox"
                  checked={filters.sentiments.includes(sentiment.id)}
                  onChange={() => toggleSentiment(sentiment.id)}
                  className="w-4 h-4 accent-orange-primary cursor-pointer"
                />
                <span
                  className={`text-sm ${sentiment.color} group-hover:brightness-125 transition-all`}
                >
                  {sentiment.label}
                </span>
              </label>
            ))}
          </div>
        </div>

        {/* Sort Options */}
        <div className="p-4 border-b border-border">
          <label className="text-sm text-text-secondary mb-3 block">
            Sort By
          </label>
          <div className="space-y-2">
            {[
              { id: "latest", label: "Latest" },
              { id: "popular", label: "Most Popular" },
              { id: "sentiment", label: "By Sentiment" },
            ].map((option) => (
              <label
                key={option.id}
                className="flex items-center gap-2 cursor-pointer group"
              >
                <div
                  className={`w-2 h-2 rounded-full transition-all ${
                    filters.sortBy === option.id
                      ? "bg-orange-primary"
                      : "border border-border group-hover:border-orange-primary"
                  }`}
                />
                <span
                  className={`text-sm transition-colors ${
                    filters.sortBy === option.id
                      ? "text-orange-primary"
                      : "text-text-secondary group-hover:text-orange-primary"
                  }`}
                  onClick={() => onSortByChange(option.id as SortByType)}
                >
                  {option.label}
                </span>
              </label>
            ))}
          </div>
        </div>

        {/* Reset Filters Button */}
        <div className="p-4 border-b border-border">
          <button
            onClick={onResetFilters}
            className="w-full bg-dark-bg hover:bg-dark-surface border border-border text-text-primary font-medium py-2.5 px-4 rounded transition-all flex items-center justify-center gap-2"
          >
            <RotateCcw size={18} />
            Reset Filters
          </button>
        </div>

        {/* Export Button */}
        <div className="p-4">
          <button className="w-full bg-orange-primary hover:bg-orange-secondary text-white font-medium py-2.5 px-4 rounded transition-all flex items-center justify-center gap-2 btn-transition">
            <Download size={18} />
            Export Results
          </button>
        </div>
      </aside>
    </>
  );
}
