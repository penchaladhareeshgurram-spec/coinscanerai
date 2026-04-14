import { OHLCV } from './demandSupply';

export interface Level {
  price: number;
  type: 'support' | 'resistance';
  touches: number;
  isBroken?: boolean;
}

export function detectSupportResistance(data: OHLCV[], threshold = 0.005): Level[] {
  const levels: Level[] = [];
  if (data.length < 10) return levels;

  const highs: number[] = [];
  const lows: number[] = [];

  // Find swing highs and lows
  for (let i = 2; i < data.length - 2; i++) {
    const curr = data[i];
    if (curr.high > data[i-1].high && curr.high > data[i-2].high && curr.high > data[i+1].high && curr.high > data[i+2].high) {
      highs.push(curr.high);
    }
    if (curr.low < data[i-1].low && curr.low < data[i-2].low && curr.low < data[i+1].low && curr.low < data[i+2].low) {
      lows.push(curr.low);
    }
  }

  const lastClose = data[data.length - 1].close;

  // Cluster highs for resistance
  const resistanceClusters = clusterLevels(highs, threshold);
  resistanceClusters.forEach(cluster => {
    if (cluster.touches >= 2) {
      const isBroken = lastClose > cluster.price * (1 + threshold);
      levels.push({ price: cluster.price, type: 'resistance', touches: cluster.touches, isBroken });
    }
  });

  // Cluster lows for support
  const supportClusters = clusterLevels(lows, threshold);
  supportClusters.forEach(cluster => {
    if (cluster.touches >= 2) {
      const isBroken = lastClose < cluster.price * (1 - threshold);
      levels.push({ price: cluster.price, type: 'support', touches: cluster.touches, isBroken });
    }
  });

  return levels;
}

function clusterLevels(levels: number[], threshold: number) {
  const clusters: { price: number, touches: number }[] = [];
  
  levels.forEach(level => {
    let found = false;
    for (const cluster of clusters) {
      if (Math.abs(cluster.price - level) / cluster.price <= threshold) {
        cluster.price = (cluster.price * cluster.touches + level) / (cluster.touches + 1);
        cluster.touches += 1;
        found = true;
        break;
      }
    }
    if (!found) {
      clusters.push({ price: level, touches: 1 });
    }
  });

  return clusters;
}
