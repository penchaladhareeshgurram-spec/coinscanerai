import React from 'react';
import { Newspaper, ExternalLink, BrainCircuit, TrendingUp } from 'lucide-react';
import { useMarketNews } from '../hooks/useMarketNews';

export function NewsFeed() {
  const { news, loading } = useMarketNews();

  // Mock sentiment calculation based on news
  const sentimentScore = 68; // 0-100
  const isBullish = sentimentScore > 50;

  return (
    <div className="panel flex flex-col h-full">
      <div className="p-4 border-b border-[#262626] flex flex-col gap-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Newspaper className="w-5 h-5 text-blue-500" />
            <h2 className="text-lg font-bold">Live Market News</h2>
          </div>
          <div className="flex items-center gap-2 bg-[#1A1A1A] px-3 py-1.5 rounded-lg border border-[#262626]">
            <BrainCircuit className="w-4 h-4 text-purple-500" />
            <span className="text-xs font-bold text-[#A3A3A3]">NLP Sentiment:</span>
            <span className={`text-xs font-bold ${isBullish ? 'text-emerald-500' : 'text-red-500'}`}>
              {isBullish ? 'BULLISH' : 'BEARISH'} ({sentimentScore}%)
            </span>
          </div>
        </div>
        <p className="text-xs text-[#737373] leading-relaxed">
          <strong className="text-[#A3A3A3]">Sentiment Analysis & NLP:</strong> The AI scans news articles, social media, and earnings reports in real-time to gauge market sentiment and predict volatility.
        </p>
      </div>
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {loading ? (
          <div className="text-[#A3A3A3] text-sm animate-pulse flex items-center justify-center h-full">Loading news...</div>
        ) : (
          news.map(article => (
            <a 
              key={article.id} 
              href={article.url} 
              target="_blank" 
              rel="noopener noreferrer"
              className="flex gap-4 group hover:bg-[#1A1A1A] p-3 rounded-lg transition-colors border border-transparent hover:border-[#262626]"
            >
              {article.imageurl && (
                <img src={article.imageurl} alt={article.title} className="w-20 h-20 object-cover rounded-md shrink-0" referrerPolicy="no-referrer" />
              )}
              <div className="flex-1 flex flex-col justify-between">
                <h3 className="text-sm font-semibold text-white group-hover:text-blue-400 transition-colors line-clamp-2 leading-snug">{article.title}</h3>
                <div className="flex items-center justify-between mt-2">
                  <span className="text-xs font-medium text-[#A3A3A3] bg-[#1A1A1A] px-2 py-1 rounded">{article.source}</span>
                  <span className="text-xs text-[#525252] flex items-center gap-1">
                    {new Date(article.published_on * 1000).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                    <ExternalLink className="w-3 h-3 opacity-0 group-hover:opacity-100 transition-opacity" />
                  </span>
                </div>
              </div>
            </a>
          ))
        )}
      </div>
    </div>
  );
}
