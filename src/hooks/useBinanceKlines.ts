import { useState, useEffect } from 'react';

export interface BinanceOHLCV {
  time: number;
  open: number;
  high: number;
  low: number;
  close: number;
  volume?: number;
}

export const useBinanceKlines = (symbol: string, interval: string = '1m') => {
  const [data, setData] = useState<BinanceOHLCV[]>([]);

  useEffect(() => {
    setData([]);
    let ws: WebSocket | null = null;
    let isMounted = true;
    
    // Fetch initial historical data
    const fetchHistory = async () => {
      try {
        const response = await fetch(`https://api.binance.com/api/v3/klines?symbol=${symbol}&interval=${interval}&limit=1000`);
        if (!isMounted) return;
        
        if (!response.ok) {
          console.log(`Failed to fetch Binance data for ${symbol}`);
          return; // Skip if symbol is not supported (e.g. some forex pairs)
        }
        
        const result = await response.json();
        if (!isMounted) return;
        
        if (!Array.isArray(result)) {
           return;
        }

        const formattedData: BinanceOHLCV[] = result.map((d: any) => ({
          time: Math.floor(d[0] / 1000), // lightweight-charts expects seconds
          open: parseFloat(d[1]),
          high: parseFloat(d[2]),
          low: parseFloat(d[3]),
          close: parseFloat(d[4]),
          volume: parseFloat(d[5])
        }));
        
        // Ensure data is sorted
        formattedData.sort((a, b) => a.time - b.time);
        
        setData(formattedData);
        
        // Connect to WebSocket for real-time updates
        ws = new WebSocket(`wss://stream.binance.com:9443/ws/${symbol.toLowerCase()}@kline_${interval}`);
        ws.onmessage = (event) => {
          if (!isMounted) return;
          const message = JSON.parse(event.data);
          const kline = message.k;
          
          setData(prev => {
            if (prev.length === 0) return prev;
            
            const newKline = {
              time: Math.floor(kline.t / 1000),
              open: parseFloat(kline.o),
              high: parseFloat(kline.h),
              low: parseFloat(kline.l),
              close: parseFloat(kline.c),
              volume: parseFloat(kline.v)
            };
            
            const lastKline = prev[prev.length - 1];
            if (lastKline && lastKline.time === newKline.time) {
              // Update last candle
              return [...prev.slice(0, -1), newKline];
            } else if (lastKline && newKline.time > lastKline.time) {
              // Add new candle only if it's strictly newer
              return [...prev, newKline];
            } else {
              // Ignore out-of-order candles
              return prev;
            }
          });
        };
      } catch (e) {
        console.error('Error fetching Binance klines:', e);
      }
    };
    
    fetchHistory();
    
    return () => {
      isMounted = false;
      if (ws) {
        ws.close();
      }
    };
  }, [symbol, interval]);

  return data;
};
