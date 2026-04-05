import React, { useEffect, useRef, useState } from 'react';

export interface AILog {
  id: string;
  time: string;
  message: string;
  type: 'INFO' | 'TRADE' | 'RISK';
}

export const useAITradingEngine = (
  botActive: boolean,
  prices: Record<string, number>,
  orderbook: Record<string, any>,
  activeTrades: any[],
  setActiveTrades: React.Dispatch<React.SetStateAction<any[]>>,
  setBalance: React.Dispatch<React.SetStateAction<number>>
) => {
  const [aiLogs, setAiLogs] = useState<AILog[]>([]);
  const lastTradeTime = useRef<number>(0);
  const activeTradesRef = useRef(activeTrades);

  useEffect(() => {
    activeTradesRef.current = activeTrades;
  }, [activeTrades]);

  const log = (message: string, type: 'INFO' | 'TRADE' | 'RISK' = 'INFO') => {
    setAiLogs(prev => [
      {
        id: Math.random().toString(36).substring(7),
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
        message,
        type
      },
      ...prev
    ].slice(0, 50));
  };

  useEffect(() => {
    if (!botActive) return;

    const now = Date.now();
    const btcBook = orderbook['BTCUSDT'];
    const btcPrice = prices['BTCUSDT'];

    if (!btcBook || !btcBook.bids || !btcBook.asks || !btcPrice) return;

    // --- 1. Manage Existing Trades (Dynamic SL/TP & Trailing Stop) ---
    let tradesUpdated = false;
    const updatedTrades = activeTradesRef.current.map(trade => {
      if (trade.asset !== 'BTC/USD') return trade;

      const isLong = trade.type === 'LONG';
      const currentPnlVal = isLong 
        ? (btcPrice - trade.entry) * (trade.size || 1)
        : (trade.entry - btcPrice) * (trade.size || 1);
      
      const currentPnlPct = isLong
        ? ((btcPrice - trade.entry) / trade.entry) * 100
        : ((trade.entry - btcPrice) / trade.entry) * 100;

      let newTrade = { 
        ...trade, 
        current: btcPrice, 
        pnlVal: currentPnlVal, 
        pnl: `${currentPnlPct >= 0 ? '+' : ''}${currentPnlPct.toFixed(2)}%` 
      };

      // Trailing Stop Logic (Lock in profits)
      if (currentPnlPct > 1.0) {
        const newSl = isLong ? btcPrice * 0.995 : btcPrice * 1.005;
        if (!trade.trailingSl || (isLong ? newSl > trade.trailingSl : newSl < trade.trailingSl)) {
          newTrade.trailingSl = newSl;
          log(`[RISK] Trailing SL updated for ${trade.id} to ${newSl.toFixed(2)}`, 'RISK');
          tradesUpdated = true;
        }
      }

      return newTrade;
    });

    // Check for SL/TP hits
    const remainingTrades = updatedTrades.filter(trade => {
      if (trade.asset !== 'BTC/USD') return true;
      const isLong = trade.type === 'LONG';
      const sl = trade.trailingSl || trade.sl;
      const tp = trade.tp;

      if (sl && (isLong ? btcPrice <= sl : btcPrice >= sl)) {
        log(`[TRADE] Stop Loss hit for ${trade.id} at ${btcPrice.toFixed(2)}`, 'TRADE');
        setBalance(prev => prev + trade.pnlVal);
        tradesUpdated = true;
        return false;
      }
      if (tp && (isLong ? btcPrice >= tp : btcPrice <= tp)) {
        log(`[TRADE] Take Profit hit for ${trade.id} at ${btcPrice.toFixed(2)}`, 'TRADE');
        setBalance(prev => prev + trade.pnlVal);
        tradesUpdated = true;
        return false;
      }
      return true;
    });

    if (tradesUpdated) {
      setActiveTrades(remainingTrades);
    }

    // --- 2. Analyze Liquidity & Initialize New Trades ---
    if (now - lastTradeTime.current < 15000) return; // Cooldown 15s between AI trades

    // Calculate Imbalance
    const bidVol = btcBook.bids.reduce((sum: number, b: any) => sum + b.size, 0);
    const askVol = btcBook.asks.reduce((sum: number, a: any) => sum + a.size, 0);
    const totalVol = bidVol + askVol;
    if (totalVol === 0) return;

    const imbalance = bidVol / totalVol;

    // Find Walls
    const maxBid = btcBook.bids.reduce((max: any, b: any) => b.size > max.size ? b : max, btcBook.bids[0]);
    const maxAsk = btcBook.asks.reduce((max: any, a: any) => a.size > max.size ? a : max, btcBook.asks[0]);

    // AI Decision Logic
    if (imbalance > 0.65 && (btcPrice - maxBid.price) < 100) {
      // Bullish
      log(`[AI] Bullish liquidity imbalance (${(imbalance * 100).toFixed(1)}%). Bid wall detected at ${maxBid.price}.`, 'INFO');
      
      const newTrade = {
        id: `AI-${Math.floor(Math.random() * 10000)}`,
        asset: 'BTC/USD',
        type: 'LONG',
        entry: btcPrice,
        current: btcPrice,
        pnl: '+0.00%',
        pnlVal: 0,
        risk: '1.0%',
        size: 1, // 1 BTC for demo
        sl: maxBid.price * 0.998, // SL just below the wall
        tp: btcPrice * 1.02, // 2% TP
      };
      
      log(`[TRADE] Executing LONG on BTC/USD at ${btcPrice.toFixed(2)}. SL: ${newTrade.sl.toFixed(2)}`, 'TRADE');
      setActiveTrades(prev => [newTrade, ...prev]);
      lastTradeTime.current = now;

    } else if (imbalance < 0.35 && (maxAsk.price - btcPrice) < 100) {
      // Bearish
      log(`[AI] Bearish liquidity imbalance (${((1 - imbalance) * 100).toFixed(1)}%). Ask wall detected at ${maxAsk.price}.`, 'INFO');
      
      const newTrade = {
        id: `AI-${Math.floor(Math.random() * 10000)}`,
        asset: 'BTC/USD',
        type: 'SHORT',
        entry: btcPrice,
        current: btcPrice,
        pnl: '+0.00%',
        pnlVal: 0,
        risk: '1.0%',
        size: 1,
        sl: maxAsk.price * 1.002, // SL just above the wall
        tp: btcPrice * 0.98, // 2% TP
      };
      
      log(`[TRADE] Executing SHORT on BTC/USD at ${btcPrice.toFixed(2)}. SL: ${newTrade.sl.toFixed(2)}`, 'TRADE');
      setActiveTrades(prev => [newTrade, ...prev]);
      lastTradeTime.current = now;
    }

  }, [botActive, prices, orderbook]);

  return { aiLogs };
};
