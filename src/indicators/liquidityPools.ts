export interface OHLCV {
  time: number | string;
  open: number;
  high: number;
  low: number;
  close: number;
  volume?: number;
}

export interface LiquidityPool {
  type: 'buy-side' | 'sell-side';
  price: number;
  time: number | string;
  isSwept: boolean;
}

export function detectLiquidityPools(data: OHLCV[], timeframe: string = '1D', threshold = 0.002): LiquidityPool[] {
  const pools: LiquidityPool[] = [];
  if (data.length < 3) return pools;

  // Determine dynamic window size based on timeframe
  // e.g., 1m considers previous 10 minutes (10 candles)
  let windowSize = 20; 
  if (timeframe === '1m' || timeframe === '1M') {
    windowSize = 10;
  } else if (timeframe === '5m') {
    windowSize = 12; // 1 hour
  } else if (timeframe === '15m') {
    windowSize = 8; // 2 hours
  } else if (timeframe === '1h' || timeframe === '1H') {
    windowSize = 24; // 1 day
  }

  // Only consider the most recent 'windowSize' data points for checking new pools
  // This satisfies the requirement "only considers the previous 10 minutes of candle data"
  const recentLength = Math.min(data.length, windowSize + 2); // get slightly more for comparisons
  const offset = data.length - recentLength;

  for (let i = Math.max(2, offset); i < data.length - 2; i++) {
    const curr = data[i];
    
    // Check for buy-side liquidity (local highs)
    let isBuySide = false;
    for (let j = Math.max(0, i - windowSize); j < i; j++) {
      if (Math.abs(data[j].high - curr.high) / curr.high < threshold) {
        isBuySide = true;
        break;
      }
    }

    if (isBuySide) {
      let swept = false;
      for (let k = i + 1; k < data.length; k++) {
        if (data[k].high > curr.high) {
          swept = true;
          break;
        }
      }
      pools.push({ type: 'buy-side', price: curr.high, time: curr.time, isSwept: swept });
    }

    // Check for sell-side liquidity (local lows)
    let isSellSide = false;
    for (let j = Math.max(0, i - windowSize); j < i; j++) {
      if (Math.abs(data[j].low - curr.low) / curr.low < threshold) {
        isSellSide = true;
        break;
      }
    }

    if (isSellSide) {
      let swept = false;
      for (let k = i + 1; k < data.length; k++) {
        if (data[k].low < curr.low) {
          swept = true;
          break;
        }
      }
      pools.push({ type: 'sell-side', price: curr.low, time: curr.time, isSwept: swept });
    }
  }

  const uniquePools: LiquidityPool[] = [];
  pools.forEach(pool => {
    const exists = uniquePools.find(p => p.type === pool.type && Math.abs(p.price - pool.price) / pool.price < threshold);
    if (!exists) {
      uniquePools.push(pool);
    }
  });

  const activePools = uniquePools.filter(p => !p.isSwept);

  // Return closest 3 buy-side and 3 sell-side
  const currentPrice = data[data.length - 1].close;
  const buySide = activePools.filter(p => p.type === 'buy-side' && p.price >= currentPrice).sort((a, b) => a.price - b.price).slice(0, 3);
  const sellSide = activePools.filter(p => p.type === 'sell-side' && p.price <= currentPrice).sort((a, b) => b.price - a.price).slice(0, 3);

  return [...buySide, ...sellSide];
}
