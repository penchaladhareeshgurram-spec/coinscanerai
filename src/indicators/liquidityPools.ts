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

export function detectLiquidityPools(data: OHLCV[], threshold = 0.002): LiquidityPool[] {
  const pools: LiquidityPool[] = [];
  if (data.length < 10) return pools;

  for (let i = 2; i < data.length - 2; i++) {
    const curr = data[i];
    
    // Check for buy-side liquidity (equal highs)
    let isBuySide = false;
    for (let j = Math.max(0, i - 10); j < i; j++) {
      if (Math.abs(data[j].high - curr.high) / curr.high < threshold) {
        isBuySide = true;
        break;
      }
    }

    if (isBuySide) {
      // Check if it gets swept later
      let swept = false;
      for (let k = i + 1; k < data.length; k++) {
        if (data[k].high > curr.high) {
          swept = true;
          break;
        }
      }
      pools.push({ type: 'buy-side', price: curr.high, time: curr.time, isSwept: swept });
    }

    // Check for sell-side liquidity (equal lows)
    let isSellSide = false;
    for (let j = Math.max(0, i - 10); j < i; j++) {
      if (Math.abs(data[j].low - curr.low) / curr.low < threshold) {
        isSellSide = true;
        break;
      }
    }

    if (isSellSide) {
      // Check if it gets swept later
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

  // Filter out duplicates
  const uniquePools: LiquidityPool[] = [];
  pools.forEach(pool => {
    const exists = uniquePools.find(p => p.type === pool.type && Math.abs(p.price - pool.price) / pool.price < threshold);
    if (!exists) {
      uniquePools.push(pool);
    }
  });

  const currentPrice = data[data.length - 1].close;
  const activePools = uniquePools.filter(p => !p.isSwept);

  // Return the 3 closest buy-side (above price) and 3 closest sell-side (below price)
  const buySide = activePools.filter(p => p.type === 'buy-side' && p.price >= currentPrice).sort((a, b) => a.price - b.price).slice(0, 3);
  const sellSide = activePools.filter(p => p.type === 'sell-side' && p.price <= currentPrice).sort((a, b) => b.price - a.price).slice(0, 3);

  return [...buySide, ...sellSide];
}
