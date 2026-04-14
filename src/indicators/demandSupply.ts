export interface OHLCV {
  time: number | string;
  open: number;
  high: number;
  low: number;
  close: number;
  volume?: number;
}

export interface Zone {
  type: 'demand' | 'supply';
  top: number;
  bottom: number;
  startTime: number | string;
  endTime?: number | string;
  isBroken?: boolean;
}

export function detectDemandSupply(data: OHLCV[]): Zone[] {
  const zones: Zone[] = [];
  if (data.length < 5) return zones;

  for (let i = 2; i < data.length - 2; i++) {
    const prev = data[i - 1];
    const curr = data[i];
    const next1 = data[i + 1];
    const next2 = data[i + 2];

    const body = Math.abs(curr.open - curr.close);
    const range = curr.high - curr.low;

    // Consolidation (small body) followed by strong bullish move
    if (body < range * 0.5 && next1.close > next1.open && next2.close > next2.open) {
      const moveUp = next2.close - curr.low;
      if (moveUp > range * 2) {
        let isBroken = false;
        for (let k = i + 3; k < data.length; k++) {
          if (data[k].close < curr.low) {
            isBroken = true;
            break;
          }
        }
        zones.push({
          type: 'demand',
          top: Math.max(curr.open, curr.close),
          bottom: curr.low,
          startTime: curr.time,
          isBroken
        });
      }
    }

    // Consolidation followed by strong bearish move
    if (body < range * 0.5 && next1.close < next1.open && next2.close < next2.open) {
      const moveDown = curr.high - next2.close;
      if (moveDown > range * 2) {
        let isBroken = false;
        for (let k = i + 3; k < data.length; k++) {
          if (data[k].close > curr.high) {
            isBroken = true;
            break;
          }
        }
        zones.push({
          type: 'supply',
          top: curr.high,
          bottom: Math.min(curr.open, curr.close),
          startTime: curr.time,
          isBroken
        });
      }
    }
  }

  return zones;
}
