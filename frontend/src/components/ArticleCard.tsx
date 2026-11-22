import { Clock, Star, ExternalLink, User } from 'lucide-react';
import type { Article } from '../types';

interface ArticleCardProps {
  article: Article;
}

const sentimentConfig = {
  positive: {
    emoji: '😊',
    label: 'Positive',
    bgColor: 'bg-green-500/10',
    textColor: 'text-green-500',
  },
  neutral: {
    emoji: '😐',
    label: 'Neutral',
    bgColor: 'bg-slate-400/10',
    textColor: 'text-slate-400',
  },
  negative: {
    emoji: '😞',
    label: 'Negative',
    bgColor: 'bg-red-500/10',
    textColor: 'text-red-500',
  },
};

export function ArticleCard({ article }: ArticleCardProps) {
  const sentiment = sentimentConfig[article.sentiment];
  const stars = Math.round((article.credibilityScore / 100) * 5);

  const getTimeAgo = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60));

    if (diffInHours < 1) return 'Just now';
    if (diffInHours < 24) return `${diffInHours}h ago`;
    const days = Math.floor(diffInHours / 24);
    return `${days}d ago`;
  };

  const handleArticleClick = () => {
    if (article.url) {
      window.open(article.url, '_blank', 'noopener,noreferrer');
    }
  };

  return (
    <article className="bg-dark-surface rounded-lg overflow-hidden border border-border card-hover group cursor-pointer" onClick={handleArticleClick}>
      {/* Article Image (if available) */}
      {article.imageUrl && (
        <div className="w-full h-48 overflow-hidden">
          <img
            src={article.imageUrl}
            alt={article.title}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
            onError={(e) => {
              // Hide image if it fails to load
              e.currentTarget.style.display = 'none';
            }}
          />
        </div>
      )}

      <div className="p-5">
        {/* Header with source and sentiment */}
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            {/* Credibility Stars */}
            <div className="flex">
              {[...Array(5)].map((_, i) => (
                <Star
                  key={i}
                  size={16}
                  className={`${
                    i < stars
                      ? 'fill-orange-primary text-orange-primary'
                      : 'text-border'
                  } transition-colors`}
                />
              ))}
            </div>
            <span className="text-sm text-text-secondary">{article.source}</span>
          </div>

          {/* Sentiment Badge */}
          <div
            className={`flex items-center gap-2 ${sentiment.bgColor} ${sentiment.textColor} px-3 py-1 rounded-full text-sm font-medium`}
          >
            <span>{sentiment.emoji}</span>
            <span>{sentiment.label}</span>
          </div>
        </div>

        {/* Title */}
        <h3 className="text-lg font-semibold text-text-primary mb-2 transition-colors line-clamp-2 group-hover:text-orange-primary">
          {article.title}
        </h3>

        {/* Description */}
        <p className="text-text-secondary text-sm mb-4 line-clamp-2">
          {article.description}
        </p>

        {/* Footer metadata */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4 text-xs text-text-muted">
            <span className="flex items-center gap-1">
              <Clock size={14} />
              {getTimeAgo(article.publishedAt)}
            </span>
            {article.author && (
              <span className="flex items-center gap-1">
                <User size={14} />
                <span className="truncate max-w-[150px]">{article.author}</span>
              </span>
            )}
          </div>

          {/* Read more link */}
          <div
            onClick={(e) => e.stopPropagation()}
            className="flex items-center gap-1 text-xs text-orange-primary hover:text-orange-secondary transition-colors"
          >
            <span>Read</span>
            <ExternalLink size={14} />
          </div>
        </div>
      </div>
    </article>
  );
}
