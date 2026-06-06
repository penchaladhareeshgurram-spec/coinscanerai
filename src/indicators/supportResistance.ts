export interface SupportResistanceLevel {
  price: number;
  type: 'support' | 'resistance';
  strength: number;
}

export function calculateSupportResistance(
  data: { time: number | string; open: number; high: number; low: number; close: number }[],
  timeframe: string
): SupportResistanceLevel[] {
  if (!data || data.length === 0) return [];

  // Determine window size based on timeframe
  // For '1m' timeframe, we want the previous 10 minutes (10 candles)
  let windowSize = 20; // Default window size
  if (timeframe === '1m' || timeframe === '1M') { // Sometimes it's '1M' in UI
    windowSize = 10;
  } else if (timeframe === '5m') {
    windowSize = 12; // 1 hour of 5m
  } else if (timeframe === '15m') {
    windowSize = 8; // 2 hours of 15m
  } else if (timeframe === '1h' || timeframe === '1H') {
    windowSize = 24; // 1 day of 1h
  }

  // Slice data to only consider the dynamic window
  const recentData = data.slice(-windowSize);

  let supportLevels: SupportResistanceLevel[] = [];
  let resistanceLevels: SupportResistanceLevel[] = [];

  // Implement a simple local high/low algorithm within the recent data window
  // Look at swing highs and swing lows. A swing high is a high that is higher than the N candles before and after it.
  const swingWindow = Math.max(1, Math.floor(windowSize / 5)); // Just a small window for local extrema

  for (let i = swingWindow; i < recentData.length - swingWindow; i++) {
    const currentHeart = recentData[i];
    let isResistance = true;
    let isSupport = true;

    for (let j = i - swingWindow; j <= i + swingWindow; j++) {
      if (i === j) continue;
      
      const compare = recentData[j];
      
      if (currentHeart.high <= compare.high) {
        isResistance = false;
      }
      if (currentHeart.low >= compare.low) {
        isSupport = false;
      }
    }

    if (isResistance) {
      resistanceLevels.push({ price: currentHeart.high, type: 'resistance', strength: 1 });
    }
    if (isSupport) {
      supportLevels.push({ price: currentHeart.low, type: 'support', strength: 1 });
    }
  }

  // Merge nearby levels (within 0.1% or similar depending on the asset, but let's just return distinct ones for now or simple merging)
  // Simple clustering to combine very close levels
  const mergedLevels: SupportResistanceLevel[] = [];
  const allLevels = [...supportLevels, ...resistanceLevels];

  // We could just return the raw swing points
  for (const level of allLevels) {
    let merged = false;
    for (const m of mergedLevels) {
      // If difference is less than 0.1% roughly
      if (Math.abs(level.price - m.price) / m.price < 0.001) {
        if (level.type === m.type) {
          m.strength += 1; // Increase strength of level
          m.price = (m.price + level.price) / 2; // Average price
        }
        merged = true;
        break;
      }
    }
    if (!merged) {
      mergedLevels.push({...level});
    }
  }

  // If there are no swing highs/lows inside this window (e.g., straight trend),
  // fallback to absolute min/max of the window
  if (mergedLevels.length === 0 && recentData.length > 0) {
     let globalHigh = recentData[0].high;
     let globalLow = recentData[0].low;
     for (const c of recentData) {
       if (c.high > globalHigh) globalHigh = c.high;
       if (c.low < globalLow) globalLow = c.low;
     }

     mergedLevels.push({ price: globalHigh, type: 'resistance', strength: 1});
     mergedLevels.push({ price: globalLow, type: 'support', strength: 1});
  }

  return mergedLevels;
}
