import React from 'react';

interface MarketData {
  name: string;
  price: number;
  change: number;
  liquidity: number;
  history?: { price: number }[];
}

interface HeatmapProps {
  markets: Record<string, MarketData>;
}

export const MarketHeatmap: React.FC<HeatmapProps> = ({ markets }) => {
  const marketEntries = Object.entries(markets).map(([symbol, data]) => {
    // Calculate volatility as max - min over history relative to current price
    let vol = 1;
    if (data.history && data.history.length > 0) {
      const prices = data.history.map(h => h.price);
      const mx = Math.max(...prices);
      const mn = Math.min(...prices);
      vol = ((mx - mn) / data.price) * 100;
    }
    
    return {
      symbol,
      ...data,
      volatility: vol
    };
  });

  const totalVolatility = marketEntries.reduce((sum, m) => sum + (m.volatility || 1), 0);

  return (
    <div className="w-full bg-[#0A0A0A] border border-[#262626] rounded-xl overflow-hidden mt-6">
      <div className="p-4 border-b border-[#262626] bg-[#141414]">
        <h3 className="text-sm font-semibold text-[#A3A3A3] uppercase tracking-wider">Market Heatmap (Volatility)</h3>
      </div>
      <div className="flex flex-wrap gap-[1px] p-[1px] bg-[#262626] content-start">
        {marketEntries.map(m => {
          const baseSize = ((m.volatility || 1) / totalVolatility) * 100;
          
          let bgColor = 'bg-[#404040]';
          if (m.change > 3) bgColor = 'bg-emerald-600';
          else if (m.change > 0) bgColor = 'bg-emerald-500/80';
          else if (m.change < -3) bgColor = 'bg-red-600';
          else if (m.change < 0) bgColor = 'bg-red-500/80';
          
          return (
            <div 
              key={m.symbol}
              className={`${bgColor} min-h-[100px] flex flex-col justify-center items-center flex-grow transition-all cursor-pointer hover:opacity-90`}
              style={{ flexBasis: `${Math.max(8, baseSize * 2)}%` }}
              title={`${m.name}: ${m.change}% (Vol: ${m.volatility.toFixed(2)}%)`}
            >
              <div className="font-bold text-white md:text-lg">{m.symbol.split('/')[0]}</div>
              <div className="text-sm font-medium text-white/90">
                {m.change > 0 ? '+' : ''}{m.change.toFixed(2)}%
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
