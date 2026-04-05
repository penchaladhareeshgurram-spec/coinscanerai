import { useState, useEffect } from 'react';

export const useDeltaExchange = () => {
  const [prices, setPrices] = useState<Record<string, number>>({});
  const [orderbook, setOrderbook] = useState<Record<string, any>>({});
  const [trades, setTrades] = useState<any[]>([]);

  useEffect(() => {
    let ws: WebSocket;
    let reconnectTimer: NodeJS.Timeout;

    const connect = () => {
      ws = new WebSocket('wss://socket.delta.exchange');

      ws.onopen = () => {
        console.log('Connected to Delta Exchange WS');
        ws.send(JSON.stringify({
          type: 'subscribe',
          payload: {
            channels: [
              { name: 'v2/ticker', symbols: ['BTCUSDT', 'ETHUSDT', 'SOLUSDT', 'XRPUSDT', 'BNBUSDT', 'ADAUSDT'] },
              { name: 'l2_orderbook', symbols: ['BTCUSDT', 'ETHUSDT', 'SOLUSDT', 'XRPUSDT', 'BNBUSDT', 'ADAUSDT'] },
              { name: 'v2/trades', symbols: ['BTCUSDT', 'ETHUSDT', 'SOLUSDT', 'XRPUSDT', 'BNBUSDT', 'ADAUSDT'] }
            ]
          }
        }));
      };

      ws.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          
          if (data.type === 'v2/ticker' && data.symbol) {
            setPrices(prev => ({
              ...prev,
              [data.symbol]: parseFloat(data.mark_price || data.close)
            }));
          } else if (data.type === 'l2_orderbook' && data.symbol) {
            setOrderbook(prev => ({
              ...prev,
              [data.symbol]: {
                bids: data.buy ? data.buy.slice(0, 15) : prev[data.symbol]?.bids || [],
                asks: data.sell ? data.sell.slice(0, 15) : prev[data.symbol]?.asks || []
              }
            }));
          } else if (data.type === 'v2/trades' && data.symbol) {
             if (data.trades && data.trades.length > 0) {
               setTrades(prev => {
                 const newTrades = [...data.trades.map((t: any) => ({ ...t, symbol: data.symbol })), ...prev].slice(0, 50);
                 return newTrades;
               });
             }
          }
        } catch (e) {
          // Ignore parse errors
        }
      };

      ws.onclose = () => {
        console.log('Delta Exchange WS closed. Reconnecting...');
        reconnectTimer = setTimeout(connect, 3000);
      };
      
      ws.onerror = (err) => {
        console.error('Delta Exchange WS error', err);
        ws.close();
      };
    };

    connect();

    return () => {
      clearTimeout(reconnectTimer);
      if (ws) ws.close();
    };
  }, []);

  return { prices, orderbook, trades };
};
