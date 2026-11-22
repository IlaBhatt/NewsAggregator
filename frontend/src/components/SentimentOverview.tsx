import { TrendingUp } from "lucide-react";

interface SentimentData {
  positive: number;
  neutral: number;
  negative: number;
}

interface SentimentOverviewProps {
  data?: SentimentData;
}

export function SentimentOverview({ data }: SentimentOverviewProps) {
  const sentimentData = data || {
    positive: 0,
    neutral: 0,
    negative: 0,
  };

  const sentiments = [
    {
      type: "Positive",
      emoji: "😊",
      percentage: sentimentData.positive,
      color: "text-green-500",
      bgColor: "bg-green-500",
      hoverBorder: "hover:border-green-500",
    },
    {
      type: "Neutral",
      emoji: "😐",
      percentage: sentimentData.neutral,
      color: "text-slate-400",
      bgColor: "bg-slate-400",
      hoverBorder: "hover:border-slate-400",
    },
    {
      type: "Negative",
      emoji: "😞",
      percentage: sentimentData.negative,
      color: "text-red-500",
      bgColor: "bg-red-500",
      hoverBorder: "hover:border-red-500",
    },
  ];

  return (
    <div className="bg-dark-surface rounded-lg p-6 border border-border card-hover">
      <h2 className="text-lg font-semibold text-text-primary mb-4 flex items-center gap-2">
        <TrendingUp size={20} className="text-orange-primary" />
        Sentiment Overview
      </h2>

      {/* Sentiment Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
        {sentiments.map((sentiment) => (
          <div
            key={sentiment.type}
            className={`bg-dark-bg rounded-lg p-4 border border-border transition-all duration-300 ${sentiment.hoverBorder} cursor-pointer group`}
          >
            <div className="text-3xl mb-2 group-hover:scale-110 transition-transform duration-300">
              {sentiment.emoji}
            </div>
            <div className={`text-3xl font-bold mb-1 ${sentiment.color}`}>
              {sentiment.percentage}%
            </div>
            <div className="text-sm text-text-muted">{sentiment.type}</div>
          </div>
        ))}
      </div>

      {/* Progress Bars */}
      <div className="space-y-3">
        {sentiments.map((sentiment) => (
          <div key={sentiment.type} className="flex items-center gap-3">
            <span className="text-sm text-text-secondary w-20">
              {sentiment.type}
            </span>
            <div className="flex-1 bg-dark-bg rounded-full h-2.5 overflow-hidden">
              <div
                className={`${sentiment.bgColor} h-full transition-all duration-500 ease-out`}
                style={{ width: `${sentiment.percentage}%` }}
              />
            </div>
            <span className="text-sm text-text-muted w-12 text-right">
              {sentiment.percentage}%
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
