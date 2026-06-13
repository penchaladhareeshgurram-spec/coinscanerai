import React, { useState, useEffect, useRef } from 'react';
import { 
  Activity, BarChart2, Briefcase, Settings, Shield, 
  TrendingUp, TrendingDown, Zap, Bell, Search,
  Play, Square, AlertTriangle, GitBranch, Plus, Save, PlayCircle, X,
  Key, Lock, User, CheckCircle2, LogOut, ChevronDown, ArrowUpRight, ArrowDownRight,
  Layers, Eye, Cpu, Target, Crosshair, Info, Filter, Terminal, XCircle, Bot, Wallet
} from 'lucide-react';
import { 
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  AreaChart, Area
} from 'recharts';
import { Aurora } from './components/Aurora';
import SplitText from './components/SplitText';
import { EvilEye } from './components/EvilEye';
import { useDeltaExchange } from './hooks/useDeltaExchange';
import { useForexData } from './hooks/useForexData';
import { CandlestickChart } from './components/CandlestickChart';
import { useAITradingEngine } from './hooks/useAITradingEngine';
import { NewsFeed } from './components/NewsFeed';
import { QuantAssistant } from './components/QuantAssistant';
import { PendingApprovals } from './components/PendingApprovals';
import { useBinanceKlines } from './hooks/useBinanceKlines';
import { hyperspeedPresets } from './components/HyperSpeedPresets';
import { Hyperspeed } from './components/HyperSpeed';

// --- Mock Data Generators ---
const generateHistory = (basePrice: number, volatility: number, count: number) => {
  let currentPrice = basePrice;
  const data = [];
  const now = new Date();
  for (let i = count; i >= 0; i--) {
    const time = new Date(now.getTime() - i * 2000);
    currentPrice = currentPrice + (Math.random() - 0.5) * volatility;
    data.push({
      time: time.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit', second:'2-digit'}),
      price: Number(currentPrice.toFixed(2))
    });
  }
  return data;
};

const initialMarketsData = {
  'BTC/USD': { name: 'Bitcoin', price: 65100.20, change: 2.4, history: generateHistory(65100, 50, 60), liquidity: 2450000000, spread: 0.01 },
  'ETH/USD': { name: 'Ethereum', price: 3420.10, change: 1.8, history: generateHistory(3420, 5, 60), liquidity: 1200000000, spread: 0.02 },
  'SOL/USD': { name: 'Solana', price: 145.50, change: 5.2, history: generateHistory(145, 2, 60), liquidity: 850000000, spread: 0.05 },
  'XRP/USD': { name: 'Ripple', price: 0.62, change: 1.1, history: generateHistory(0.62, 0.01, 60), liquidity: 500000000, spread: 0.1 },
  'BNB/USD': { name: 'Binance Coin', price: 580.20, change: -0.5, history: generateHistory(580, 2, 60), liquidity: 620000000, spread: 0.03 },
  'ADA/USD': { name: 'Cardano', price: 0.45, change: 0.8, history: generateHistory(0.45, 0.005, 60), liquidity: 300000000, spread: 0.15 },
  'DOGE/USD': { name: 'Dogecoin', price: 0.15, change: 4.2, history: generateHistory(0.15, 0.001, 60), liquidity: 450000000, spread: 0.2 },
  'DOT/USD': { name: 'Polkadot', price: 7.20, change: 1.5, history: generateHistory(7.20, 0.1, 60), liquidity: 250000000, spread: 0.08 },
  'LINK/USD': { name: 'Chainlink', price: 18.50, change: 2.1, history: generateHistory(18.50, 0.2, 60), liquidity: 350000000, spread: 0.05 },
  'MATIC/USD': { name: 'Polygon', price: 0.95, change: -1.2, history: generateHistory(0.95, 0.01, 60), liquidity: 280000000, spread: 0.1 },
  'AVAX/USD': { name: 'Avalanche', price: 45.30, change: 3.5, history: generateHistory(45.30, 0.5, 60), liquidity: 400000000, spread: 0.06 },
  'SHIB/USD': { name: 'Shiba Inu', price: 0.000025, change: 8.4, history: generateHistory(0.000025, 0.000001, 60), liquidity: 550000000, spread: 0.5 },
  'LTC/USD': { name: 'Litecoin', price: 85.40, change: 0.5, history: generateHistory(85.40, 0.8, 60), liquidity: 200000000, spread: 0.04 },
  'UNI/USD': { name: 'Uniswap', price: 11.20, change: -2.1, history: generateHistory(11.20, 0.15, 60), liquidity: 150000000, spread: 0.12 },
  'ATOM/USD': { name: 'Cosmos', price: 12.80, change: 1.2, history: generateHistory(12.80, 0.1, 60), liquidity: 180000000, spread: 0.09 },
  'NEAR/USD': { name: 'NEAR Protocol', price: 6.50, change: 4.8, history: generateHistory(6.50, 0.08, 60), liquidity: 220000000, spread: 0.07 },
  'ICP/USD': { name: 'Internet Computer', price: 14.20, change: 0.9, history: generateHistory(14.20, 0.2, 60), liquidity: 130000000, spread: 0.11 },
  'EUR/USD': { name: 'Euro / US Dollar', price: 1.0850, change: 0.1, history: generateHistory(1.0850, 0.001, 60), liquidity: 5000000000, spread: 0.005 },
  'GBP/USD': { name: 'British Pound / US Dollar', price: 1.2650, change: -0.2, history: generateHistory(1.2650, 0.001, 60), liquidity: 4000000000, spread: 0.008 },
  'USD/JPY': { name: 'US Dollar / Japanese Yen', price: 151.20, change: 0.5, history: generateHistory(151.20, 0.1, 60), liquidity: 4500000000, spread: 0.01 },
  'AUD/USD': { name: 'Australian Dollar / US Dollar', price: 0.6540, change: 0.3, history: generateHistory(0.6540, 0.001, 60), liquidity: 3000000000, spread: 0.012 },
  'USD/CAD': { name: 'US Dollar / Canadian Dollar', price: 1.3520, change: -0.1, history: generateHistory(1.3520, 0.001, 60), liquidity: 2500000000, spread: 0.015 },
  'USD/CHF': { name: 'US Dollar / Swiss Franc', price: 0.9020, change: 0.2, history: generateHistory(0.9020, 0.001, 60), liquidity: 2000000000, spread: 0.015 },
};

const initialPerformanceData = [
  { time: '09:00', value: 100000 }, { time: '10:00', value: 101200 },
  { time: '11:00', value: 100800 }, { time: '12:00', value: 102500 },
  { time: '13:00', value: 103100 }, { time: '14:00', value: 102800 },
  { time: '15:00', value: 104200 }, { time: '16:00', value: 105500 },
];

const initialActiveTrades = [
  { id: 'TRD-8921', asset: 'BTC/USD', type: 'LONG', entry: 64230.50, current: 65100.20, pnl: '+1.35%', pnlVal: 1250.00, risk: '1.2%' },
  { id: 'TRD-8922', asset: 'ETH/USD', type: 'SHORT', entry: 3450.00, current: 3420.10, pnl: '+0.86%', pnlVal: 450.00, risk: '1.0%' },
  { id: 'TRD-8923', asset: 'AAPL', type: 'LONG', entry: 175.20, current: 174.80, pnl: '-0.22%', pnlVal: -120.00, risk: '0.5%' },
  { id: 'TRD-8924', asset: 'EUR/USD', type: 'SHORT', entry: 1.0850, current: 1.0820, pnl: '+0.27%', pnlVal: 310.00, risk: '1.5%' },
];

const initialNotificationsData = [
  { id: 1, type: 'BUY', asset: 'BTC/USD', price: '$64,230.50', time: '2m ago', msg: 'AI executed LONG position based on RSI divergence.' },
  { id: 2, type: 'SELL', asset: 'ETH/USD', price: '$3,450.00', time: '15m ago', msg: 'AI closed SHORT position. Take profit hit (+1.2%).' },
  { id: 3, type: 'BUY', asset: 'AAPL', price: '$175.20', time: '1h ago', msg: 'AI executed LONG position. Earnings momentum detected.' },
  { id: 4, type: 'ALERT', asset: 'SYSTEM', price: '', time: '2h ago', msg: 'Daily drawdown limit adjusted due to high market volatility.' }
];

const initialHoldingsData = [
  { asset: 'Bitcoin', symbol: 'BTC', amount: '0.85', value: 55335.17, allocation: 52.4, pnl: '+12.4%' },
  { asset: 'Ethereum', symbol: 'ETH', amount: '8.4', value: 28728.84, allocation: 27.2, pnl: '+5.2%' },
  { asset: 'US Dollar', symbol: 'USD', amount: '21435.99', value: 21435.99, allocation: 20.4, pnl: '0.0%' },
];

const initialOrderBook = {
  bids: [
    { price: 65090.50, size: 2.5, total: 2.5 },
    { price: 65085.00, size: 1.2, total: 3.7 },
    { price: 65080.20, size: 4.8, total: 8.5 },
    { price: 65050.00, size: 15.0, total: 23.5 }, // Liquidity Wall
    { price: 65020.00, size: 3.2, total: 26.7 },
    { price: 65000.00, size: 25.5, total: 52.2 }, // Major Support
    { price: 64950.00, size: 5.0, total: 57.2 },
  ],
  asks: [
    { price: 65110.00, size: 1.5, total: 1.5 },
    { price: 65115.50, size: 3.2, total: 4.7 },
    { price: 65125.00, size: 2.1, total: 6.8 },
    { price: 65150.00, size: 18.5, total: 25.3 }, // Liquidity Wall
    { price: 65180.00, size: 4.0, total: 29.3 },
    { price: 65200.00, size: 30.0, total: 59.3 }, // Major Resistance
    { price: 65250.00, size: 6.5, total: 65.8 },
  ]
};

const initialWhales = [
  { id: 'W-1', time: '10:42:05', asset: 'BTC/USD', type: 'BUY', amount: '125.5 BTC', value: '$8,168,800', exchange: 'Binance', icon: <ArrowUpRight className="w-4 h-4 text-emerald-500"/> },
  { id: 'W-2', time: '10:41:12', asset: 'ETH/USD', type: 'SELL', amount: '2,500 ETH', value: '$8,550,250', exchange: 'Coinbase', icon: <ArrowDownRight className="w-4 h-4 text-red-500"/> },
  { id: 'W-3', time: '10:38:45', asset: 'BTC/USD', type: 'LIQUIDATION', amount: '45.2 BTC', value: '$2,942,520', exchange: 'Bybit', icon: <AlertTriangle className="w-4 h-4 text-yellow-500"/> },
  { id: 'W-4', time: '10:35:20', asset: 'SOL/USD', type: 'BUY', amount: '50,000 SOL', value: '$7,250,000', exchange: 'Binance', icon: <ArrowUpRight className="w-4 h-4 text-emerald-500"/> },
  { id: 'W-5', time: '10:30:00', asset: 'BTC/USD', type: 'SELL', amount: '300.0 BTC', value: '$19,530,000', exchange: 'Bitfinex', icon: <ArrowDownRight className="w-4 h-4 text-red-500"/> },
];

const initialAiSignals = [
  { id: 'S-1', asset: 'BTC/USD', type: 'LONG', probability: 87, target: 65500, stop: 64800, reason: 'Liquidity sweep at 65k support completed. Order flow momentum shifting positive.' },
  { id: 'S-2', asset: 'ETH/USD', type: 'SHORT', probability: 72, target: 3350, stop: 3480, reason: 'Large sell wall detected at 3450. Whale distribution pattern identified.' },
  { id: 'S-3', asset: 'SOL/USD', type: 'LONG', probability: 91, target: 155, stop: 142, reason: 'Liquidity gap detected between 145-150. High probability of rapid fill.' },
];

import { WalletModal } from './components/WalletModal';

// --- Main App Component ---
export default function App() {
  const [showIntro, setShowIntro] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [activeTab, setActiveTab] = useState('markets');
  const [botActive, setBotActive] = useState(true);
  const [showNotifications, setShowNotifications] = useState(false);
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [showWalletModal, setShowWalletModal] = useState(false);
  const notifRef = useRef<HTMLDivElement>(null);

  const [isDemoMode, setIsDemoMode] = useState(false);
  const [demoBalance, setDemoBalance] = useState(100000);
  const [liveBalance, setLiveBalance] = useState(0);

  const [marketsData, setMarketsData] = useState(initialMarketsData);
  const [activeTrades, setActiveTrades] = useState(initialActiveTrades);
  const [tradeHistory, setTradeHistory] = useState<any[]>([]);
  const [holdingsData, setHoldingsData] = useState(initialHoldingsData);
  const [notificationsData, setNotificationsData] = useState(initialNotificationsData);
  const [performanceData, setPerformanceData] = useState(initialPerformanceData);
  const [priceAlerts, setPriceAlerts] = useState<{ id: string, asset: string, targetPrice: number, condition: 'above' | 'below', active: boolean }[]>([]);
  
  const [tradeDialogOpen, setTradeDialogOpen] = useState(false);
  const [tradeDialogParams, setTradeDialogParams] = useState<any>(null);

  const { prices, orderbook, trades } = useDeltaExchange();
  const pricesRef = useRef(prices);
  
  const { forexPrices } = useForexData();
  const forexPricesRef = useRef(forexPrices);

  useEffect(() => {
    pricesRef.current = prices;
  }, [prices]);

  useEffect(() => {
    forexPricesRef.current = forexPrices;
  }, [forexPrices]);

  // Check Price Alerts
  useEffect(() => {
    if (priceAlerts.length === 0) return;

    let alertsTriggered = false;
    const updatedAlerts = priceAlerts.map(alert => {
      if (!alert.active) return alert;

      const currentPrice = marketsData[alert.asset as keyof typeof marketsData]?.price;
      if (currentPrice === undefined) return alert;

      let triggered = false;
      if (alert.condition === 'above' && currentPrice >= alert.targetPrice) {
        triggered = true;
      } else if (alert.condition === 'below' && currentPrice <= alert.targetPrice) {
        triggered = true;
      }

      if (triggered) {
        alertsTriggered = true;
        setNotificationsData(prev => [{
          id: Date.now() + Math.random(),
          type: 'ALERT',
          asset: alert.asset,
          price: `$${currentPrice.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`,
          time: 'Just now',
          msg: `Price alert triggered! ${alert.asset} is ${alert.condition} $${alert.targetPrice.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
        }, ...prev]);
        return { ...alert, active: false }; // Deactivate after triggering
      }
      return alert;
    });

    if (alertsTriggered) {
      setPriceAlerts(updatedAlerts);
      setShowNotifications(true);
    }
  }, [marketsData, priceAlerts]);

  const { aiLogs, log: aiLog } = useAITradingEngine(
    botActive,
    prices,
    orderbook,
    activeTrades,
    setActiveTrades,
    isDemoMode ? setDemoBalance : setLiveBalance,
    setTradeHistory
  );

  const handleExecuteTrade = async (tradeParams: any) => {
    // Attempt actual execution via CoinDCX API
    try {
      // Convert standard symbol (e.g. BTC/USD) to CoinDCX market format (BTCUSDT)
      let coinDCXMarket = tradeParams.asset.replace('/', '');
      if (coinDCXMarket === 'BTCUSD') coinDCXMarket = 'BTCUSDT';
      if (coinDCXMarket === 'ETHUSD') coinDCXMarket = 'ETHUSDT';
      
      const side = tradeParams.type === 'LONG' ? 'buy' : 'sell';

      const response = await fetch('/api/trade/coindcx', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          market: coinDCXMarket,
          side: side,
          order_type: 'limit_order',
          price_per_unit: tradeParams.entry,
          total_quantity: tradeParams.size || 1
        })
      });

      const result = await response.json();
      if (!response.ok) {
        if (result.error && result.error.includes("environment variables")) {
          aiLog("[API] CoinDCX API keys not found, simulating trade execution.", 'INFO');
        } else {
          aiLog(`[API ERROR] CoinDCX execution failed: ${result.error}`, 'RISK');
        }
      } else {
        aiLog(`[EXCHANGE] CoinDCX Order Placed: ${result.orders[0]?.id || 'Success'}`, 'TRADE');
      }
    } catch (e) {
      console.warn("CoinDCX API call failed", e);
    }

    const newTrade = {
      id: `TRD-${Math.floor(Math.random() * 10000)}`,
      asset: tradeParams.asset,
      type: tradeParams.type,
      entry: tradeParams.entry,
      current: tradeParams.entry,
      pnl: '+0.00%',
      pnlVal: 0.00,
      risk: tradeParams.risk || 'Manual',
      maxPnl: 0,
      sl: tradeParams.stopLoss,
      tp: tradeParams.takeProfit,
      size: parseFloat(tradeParams.size) || 1
    };

    setActiveTrades(prev => [newTrade, ...prev]);
    
    aiLog(`[TRADE] Executed ${tradeParams.type} on ${tradeParams.asset} at ${tradeParams.entry}`, 'TRADE');
    
    setNotificationsData(nPrev => [{
      id: Date.now(),
      type: tradeParams.type === 'LONG' ? 'BUY' : 'SELL',
      asset: tradeParams.asset,
      price: `$${tradeParams.entry.toLocaleString()}`,
      time: 'Just now',
      msg: `AI Assistant executed ${tradeParams.type} position on ${tradeParams.asset}.`
    }, ...nPrev].slice(0, 20));
  };

  const handleManualTrade = (asset: string, type: 'LONG' | 'SHORT') => {
    const market = marketsData[asset as keyof typeof marketsData];
    if (!market) return;

    // Default Risk Calculation (e.g. 1.0% risk)
    const currentBalance = isDemoMode ? demoBalance : liveBalance;
    const defaultRiskPct = 1.0;
    const defaultRiskAmount = currentBalance * (defaultRiskPct / 100);
    
    // Suggest stop loss distance based on volatility (mocked: 2% away)
    const slDist = type === 'LONG' ? market.price * 0.98 : market.price * 1.02;
    const tpDist = type === 'LONG' ? market.price * 1.04 : market.price * 0.96;
    
    // Just mock a size that fits the risk
    const defaultSize = Math.max(1, Math.floor(defaultRiskAmount / Math.abs(market.price - slDist)));

    setTradeDialogParams({
      asset,
      type,
      entry: market.price,
      size: tradeAmountToFill(market.price, currentBalance),
      stopLoss: slDist,
      takeProfit: tpDist,
      riskPct: defaultRiskPct,
      amount: defaultRiskAmount
    });
    setTradeDialogOpen(true);
  };

  const tradeAmountToFill = (price: number, balance: number) => {
    return Math.floor((balance * 0.05) / price) || 1; // 5% of portfolio size roughly
  }

  const finalizeManualTrade = (params: any) => {
    const currentBalance = isDemoMode ? demoBalance : liveBalance;
    const tradeCost = params.entry * params.size;
    
    if (currentBalance < tradeCost && tradeCost > currentBalance * 0.2) {
        // Just a loose check, if size is entered let's allow it unless absolutely broke. 
        // We'll deduct appropriately
    }

    if (isDemoMode) {
      setDemoBalance(prev => Math.max(0, prev - tradeCost));
    } else {
      setLiveBalance(prev => Math.max(0, prev - tradeCost));
    }

    const newTrade = {
      id: `TRD-${Math.floor(Math.random() * 10000)}`,
      asset: params.asset,
      type: params.type,
      entry: params.entry,
      current: params.entry,
      size: params.size,
      sl: params.stopLoss,
      tp: params.takeProfit,
      pnl: '+0.00%',
      pnlVal: 0.00,
      risk: params.riskPct ? `${params.riskPct}%` : 'Manual',
      maxPnl: 0
    };

    setActiveTrades(prev => [newTrade, ...prev]);
    setTradeDialogOpen(false);
    
    setNotificationsData(nPrev => [{
      id: Date.now(),
      type: params.type === 'LONG' ? 'BUY' : 'SELL',
      asset: params.asset,
      price: `$${params.entry.toLocaleString()}`,
      time: 'Just now',
      msg: `Manual ${params.type} position executed on ${params.asset}.`
    }, ...nPrev].slice(0, 20));
  };

  const marketsDataRef = useRef(marketsData);
  useEffect(() => {
    marketsDataRef.current = marketsData;
  }, [marketsData]);

  // Live markets update
  useEffect(() => {
    const interval = setInterval(() => {
      setMarketsData(prev => {
        const newData = { ...prev };
        Object.keys(newData).forEach(key => {
          const market = newData[key as keyof typeof newData];
          
          let newPrice = market.price;
          const deltaSymbol = key.replace('/', '') + 'T'; // BTC/USD -> BTCUSDT
          
          if (pricesRef.current[deltaSymbol]) {
            newPrice = pricesRef.current[deltaSymbol];
          } else if (forexPricesRef.current[key]) {
            newPrice = forexPricesRef.current[key].price;
          }

          const initialPrice = initialMarketsData[key as keyof typeof initialMarketsData].price;
          const newChangePct = Number((((newPrice - initialPrice) / initialPrice) * 100).toFixed(2));

          const newHistory = [...market.history.slice(1), {
            time: new Date().toLocaleTimeString([], {hour: '2-digit', minute:'2-digit', second:'2-digit'}),
            price: newPrice
          }];

          newData[key as keyof typeof newData] = { 
            ...market, price: newPrice, change: newChangePct, history: newHistory 
          };
        });
        return newData;
      });
    }, 10000); // 10 seconds
    return () => clearInterval(interval);
  }, []);

  // Update active trades PNL based on live market data
  useEffect(() => {
    const interval = setInterval(() => {
      setActiveTrades(prev => prev.map(trade => {
        const market = marketsDataRef.current[trade.asset as keyof typeof initialMarketsData];
        if (!market) return trade;
        
        const currentPrice = market.price;
        const entryPrice = trade.entry;
        const isLong = trade.type === 'LONG';
        
        const pnlPct = isLong 
          ? ((currentPrice - entryPrice) / entryPrice) * 100 
          : ((entryPrice - currentPrice) / entryPrice) * 100;
          
        const positionSize = 10000;
        const pnlVal = positionSize * (pnlPct / 100);
        
        return {
          ...trade,
          current: currentPrice,
          pnl: `${pnlPct >= 0 ? '+' : ''}${pnlPct.toFixed(2)}%`,
          pnlVal: pnlVal
        };
      }));
    }, 2000);
    return () => clearInterval(interval);
  }, []);

  // AI Bot Logic
  useEffect(() => {
    if (!botActive) return;

    const interval = setInterval(() => {
      const currentMarkets = marketsDataRef.current;
      const assets = Object.keys(currentMarkets) as Array<keyof typeof initialMarketsData>;
      
      setActiveTrades(prev => {
        let newTrades = [...prev];
        
        // 1. Evaluate existing trades to close them if conditions are met (e.g., take profit or stop loss)
        const tradesToKeep = [];
        for (let trade of newTrades) {
            // Ignore manual trades for AI logic
            if (trade.risk === 'Manual') {
                tradesToKeep.push(trade);
                continue;
            }

            const market = currentMarkets[trade.asset as keyof typeof initialMarketsData];
            if (!market) {
                tradesToKeep.push(trade);
                continue;
            }
            
            const pnlPct = trade.type === 'LONG' 
              ? ((market.price - trade.entry) / trade.entry) * 100 
              : ((trade.entry - market.price) / trade.entry) * 100;
              
            // Track maximum PNL for trailing stop
            const currentMaxPnl = Math.max((trade as any).maxPnl || 0, pnlPct);
            trade = { ...trade, maxPnl: currentMaxPnl } as any;

            // Volatility factor based on recent price change magnitude
            const volatilityFactor = 1 + (Math.abs(market.change) / 2); // e.g., 2% change = 2x volatility factor

            // Dynamic Take Profit & Stop Loss
            const dynamicTP = 1.5 * volatilityFactor;
            const baseSL = -0.5 * volatilityFactor;
            
            // Trailing Stop Loss: Lock in gains if maxPnl is high enough
            // e.g., if maxPnl is 2.0%, trailing SL might be 2.0% - 0.8% = 1.2%
            const trailingDistance = 0.8 * volatilityFactor;
            const dynamicSL = currentMaxPnl > 1.0 
                ? Math.max(baseSL, currentMaxPnl - trailingDistance) 
                : baseSL;
              
            if (pnlPct >= dynamicTP || pnlPct <= dynamicSL) {
                const isProfit = pnlPct > 0;
                const reason = pnlPct >= dynamicTP 
                    ? 'Dynamic take profit hit' 
                    : (currentMaxPnl > 1.0 && pnlPct <= dynamicSL && isProfit 
                        ? 'Trailing stop secured profit' 
                        : 'Dynamic stop loss triggered');
                
                setNotificationsData(nPrev => [{
                  id: Date.now() + Math.random(),
                  type: 'SELL',
                  asset: trade.asset,
                  price: `$${market.price.toLocaleString()}`,
                  time: 'Just now',
                  msg: `AI closed ${trade.type} position. ${reason} (${pnlPct.toFixed(2)}%).`
                }, ...nPrev].slice(0, 20));
            } else {
                tradesToKeep.push(trade);
            }
        }
        
        newTrades = tradesToKeep;

        // 2. Look for new opportunities based on liquidity and price drops
        if (newTrades.length < 8) { // Max 8 active trades
            const randomAsset = assets[Math.floor(Math.random() * assets.length)];
            const market = currentMarkets[randomAsset];
            
            // Check if we don't already have an AI trade for this asset
            const hasTrade = newTrades.some(t => t.asset === randomAsset && t.risk !== 'Manual');
            
            if (!hasTrade) {
                // Check liquidity (must be > 1B for AI to trade)
                if (market.liquidity > 1000000000) {
                    // Simple logic: if change is negative, buy the dip. If positive, short the top.
                    const isLong = market.change < 0; 
                    const type = isLong ? 'LONG' : 'SHORT';
                    
                    const newTrade = {
                      id: `TRD-${Math.floor(Math.random() * 10000)}`,
                      asset: randomAsset,
                      type: type,
                      entry: market.price,
                      current: market.price,
                      pnl: '+0.00%',
                      pnlVal: 0.00,
                      risk: '1.0%',
                      maxPnl: 0
                    };
                    
                    setNotificationsData(nPrev => [{
                      id: Date.now(),
                      type: type === 'LONG' ? 'BUY' : 'SELL',
                      asset: randomAsset,
                      price: `$${market.price.toLocaleString()}`,
                      time: 'Just now',
                      msg: `AI executed ${type} position on ${randomAsset} due to high liquidity and price action.`
                    }, ...nPrev].slice(0, 20));

                    newTrades.unshift(newTrade);
                }
            }
        }

        return newTrades;
      });
    }, 4000); // AI evaluates every 4 seconds

    return () => clearInterval(interval);
  }, [botActive]);

  // Close notifications when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (notifRef.current && !notifRef.current.contains(event.target as Node)) {
        setShowNotifications(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleAnimationComplete = () => {
    console.log('All letters have animated!');
    setTimeout(() => {
      setShowIntro(false);
    }, 1500); // Increased slightly for better effect visibility
  };

  if (showIntro) {
    return (
      <div className="min-h-screen bg-[#0A0A0A] flex items-center justify-center p-4 text-white font-sans relative overflow-hidden">
        <div className="absolute inset-0 z-0 flex items-center justify-center">
          <div style={{ width: '1080px', height: '1080px', position: 'relative' }}>
            <Hyperspeed effectOptions={hyperspeedPresets.five} />
          </div>
        </div>
        <div className="relative z-10 pointer-events-none">
          <SplitText
            text={`Hello, you! ,\n Welcome to coin scanner`}
            className="text-4xl md:text-5xl font-semibold text-center leading-tight drop-shadow-2xl"
            delay={10}
            duration={1.25}
            ease="elastic.out(1, 0.3)"
            splitType="chars"
            from={{ opacity: 0, y: 40 }}
            to={{ opacity: 1, y: 0 }}
            threshold={0.1}
            rootMargin="-100px"
            textAlign="center"
            onLetterAnimationComplete={handleAnimationComplete}
            showCallback
          />
        </div>
      </div>
    );
  }

  const currentOrderBook = orderbook['BTCUSDT'] ? {
    bids: orderbook['BTCUSDT'].bids.map((b: any, i: number, arr: any[]) => {
      const size = parseFloat(b.size);
      const total = arr.slice(0, i + 1).reduce((sum, item) => sum + parseFloat(item.size), 0);
      return { price: parseFloat(b.limit_price), size, total };
    }),
    asks: orderbook['BTCUSDT'].asks.map((a: any, i: number, arr: any[]) => {
      const size = parseFloat(a.size);
      const total = arr.slice(0, i + 1).reduce((sum, item) => sum + parseFloat(item.size), 0);
      return { price: parseFloat(a.limit_price), size, total };
    })
  } : initialOrderBook;

  const currentWhales = trades.length > 0 ? trades.map((t: any, i: number) => ({
    id: `W-${t.id || i}`,
    time: new Date(t.timestamp / 1000).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit', second:'2-digit'}),
    asset: t.symbol === 'BTCUSDT' ? 'BTC/USD' : t.symbol === 'ETHUSDT' ? 'ETH/USD' : t.symbol,
    type: t.side === 'buy' ? 'BUY' : 'SELL',
    amount: `${t.size} ${t.symbol.replace('USDT', '')}`,
    value: `$${(parseFloat(t.size) * parseFloat(t.price)).toLocaleString(undefined, {maximumFractionDigits: 0})}`,
    exchange: 'Delta',
    icon: t.side === 'buy' ? <ArrowUpRight className="w-4 h-4 text-emerald-500"/> : <ArrowDownRight className="w-4 h-4 text-red-500"/>
  })) : initialWhales;

  if (!isAuthenticated) {
    return <AuthView onLogin={() => setIsAuthenticated(true)} />;
  }

  return (
    <div className="flex h-screen overflow-hidden bg-[#0A0A0A] text-white font-sans">
      <WalletModal 
        isOpen={showWalletModal} 
        onClose={() => setShowWalletModal(false)}
        balance={liveBalance}
        onDeposit={(amount) => setLiveBalance(prev => prev + amount)}
        onWithdraw={(amount) => setLiveBalance(prev => prev - amount)}
      />
      {/* Sidebar */}
      <aside className="w-16 md:w-64 border-r border-[#262626] bg-[#141414] flex flex-col transition-all shrink-0">
        <div className="h-16 flex items-center justify-center md:justify-start md:px-6 border-b border-[#262626]">
          <Zap className="w-6 h-6 text-emerald-500 shrink-0" />
          <span className="ml-3 font-bold text-lg hidden md:block tracking-tight">COIN SCANNER</span>
        </div>
        
        <nav className="flex-1 py-6 flex flex-col gap-2 px-3 overflow-y-auto">
          <NavItem icon={<Activity />} label="Dashboard" active={activeTab === 'dashboard'} onClick={() => setActiveTab('dashboard')} />
          <NavItem icon={<BarChart2 />} label="Markets" active={activeTab === 'markets'} onClick={() => setActiveTab('markets')} />
          <NavItem icon={<Eye />} label="Whale Tracker" active={activeTab === 'whales'} onClick={() => setActiveTab('whales')} />
          <NavItem icon={<GitBranch />} label="Strategy Builder" active={activeTab === 'strategy'} onClick={() => setActiveTab('strategy')} />
          <NavItem icon={<Briefcase />} label="Portfolio" active={activeTab === 'portfolio'} onClick={() => setActiveTab('portfolio')} />
          <NavItem icon={<Shield />} label="Risk Management" active={activeTab === 'risk'} onClick={() => setActiveTab('risk')} />
          <NavItem icon={<Settings />} label="Settings" active={activeTab === 'settings'} onClick={() => setActiveTab('settings')} />
        </nav>

        <div className="p-4 border-t border-[#262626] hidden md:block">
          <div className="bg-[#1A1A1A] rounded-lg p-3 border border-[#262626]">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs text-[#A3A3A3] uppercase font-semibold">System Status</span>
              <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></div>
            </div>
            <div className="font-mono text-xs text-emerald-500">All systems operational</div>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col overflow-hidden relative">
        {/* Header */}
        <header className="h-16 border-b border-[#262626] bg-[#0A0A0A] flex items-center justify-between px-6 shrink-0 z-10">
          <div className="flex items-center bg-[#141414] border border-[#262626] rounded-md px-3 py-1.5 w-64 hidden sm:flex">
            <Search className="w-4 h-4 text-[#A3A3A3]" />
            <input 
              type="text" 
              placeholder="Search markets, assets..." 
              className="bg-transparent border-none outline-none text-sm ml-2 w-full placeholder-[#A3A3A3]"
            />
          </div>
          <div className="sm:hidden"></div>
          
          <div className="flex items-center gap-4">
            {/* Wallet Button */}
            {!isDemoMode && (
              <button 
                onClick={() => setShowWalletModal(true)}
                className="hidden sm:flex items-center gap-2 bg-[#1A1A1A] hover:bg-[#262626] border border-[#262626] rounded-lg px-3 py-1.5 text-sm font-medium transition-colors text-white"
              >
                <Wallet className="w-4 h-4 text-emerald-500" />
                Wallet
              </button>
            )}

            {/* Demo Mode Toggle */}
            <div className="flex items-center bg-[#1A1A1A] border border-[#262626] rounded-lg p-1 shrink-0">
              <button 
                onClick={() => setIsDemoMode(false)}
                className={`flex items-center px-3 py-1.5 rounded-md text-xs font-medium transition-colors ${!isDemoMode ? 'bg-emerald-500/20 text-emerald-400' : 'text-[#A3A3A3] hover:text-white'}`}
              >
                Live
              </button>
              <button 
                onClick={() => setIsDemoMode(true)}
                className={`flex items-center px-3 py-1.5 rounded-md text-xs font-medium transition-colors ${isDemoMode ? 'bg-blue-500/20 text-blue-400' : 'text-[#A3A3A3] hover:text-white'}`}
              >
                Demo
              </button>
            </div>

            {/* Notifications Dropdown */}
            <div className="relative" ref={notifRef}>
              <button 
                onClick={() => setShowNotifications(!showNotifications)}
                className={`relative p-2 transition-colors rounded-full ${showNotifications ? 'bg-[#262626] text-white' : 'text-[#A3A3A3] hover:text-white hover:bg-[#1A1A1A]'}`}
              >
                <Bell className="w-5 h-5" />
                <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-emerald-500 rounded-full border border-[#0A0A0A]"></span>
              </button>
              
              {showNotifications && (
                <div className="absolute right-0 mt-2 w-80 sm:w-96 bg-[#141414] border border-[#262626] rounded-xl shadow-2xl overflow-hidden z-50">
                  <div className="p-4 border-b border-[#262626] flex justify-between items-center bg-[#1A1A1A]">
                    <h3 className="font-semibold text-sm">AI Trade Notifications</h3>
                    <button className="text-xs text-blue-500 hover:text-blue-400">Mark all as read</button>
                  </div>
                  <div className="max-h-[400px] overflow-y-auto">
                    {notificationsData.map(notif => (
                      <div key={notif.id} className="p-4 border-b border-[#262626] hover:bg-[#1A1A1A] transition-colors cursor-pointer">
                        <div className="flex justify-between items-start mb-1">
                          <div className="flex items-center gap-2">
                            {notif.type === 'BUY' && <ArrowUpRight className="w-4 h-4 text-emerald-500" />}
                            {notif.type === 'SELL' && <ArrowDownRight className="w-4 h-4 text-red-500" />}
                            {notif.type === 'ALERT' && <AlertTriangle className="w-4 h-4 text-yellow-500" />}
                            <span className="font-bold text-sm">{notif.asset}</span>
                            {notif.price && <span className="text-xs font-mono text-[#A3A3A3] bg-[#262626] px-1.5 py-0.5 rounded">{notif.price}</span>}
                          </div>
                          <span className="text-xs text-[#A3A3A3]">{notif.time}</span>
                        </div>
                        <p className="text-sm text-[#A3A3A3] mt-1 leading-snug">{notif.msg}</p>
                      </div>
                    ))}
                  </div>
                  <div className="p-3 text-center border-t border-[#262626] bg-[#1A1A1A]">
                    <button className="text-xs text-[#A3A3A3] hover:text-white transition-colors">View All History</button>
                  </div>
                </div>
              )}
            </div>
            <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-emerald-500 to-blue-500 border border-[#262626] cursor-pointer"></div>
          </div>
        </header>

        {/* Dynamic Content Area */}
        <div className="flex-1 overflow-auto p-4 md:p-6 relative z-0">
          {activeTab === 'dashboard' && <DashboardView botActive={botActive} setBotActive={setBotActive} activeTrades={activeTrades} tradeHistory={tradeHistory} performanceData={performanceData} marketsData={marketsData} isDemoMode={isDemoMode} demoBalance={demoBalance} liveBalance={liveBalance} onManualTrade={handleManualTrade} aiLogs={aiLogs} onExecuteTrade={handleExecuteTrade} />}
          {activeTab === 'markets' && <MarketsView marketsData={marketsData} onManualTrade={handleManualTrade} orderbook={orderbook} priceAlerts={priceAlerts} onRemoveAlert={(id) => setPriceAlerts(prev => prev.filter(a => a.id !== id))} onSetAlert={(asset, targetPrice, condition) => {
            setPriceAlerts(prev => [...prev, { id: Date.now().toString() + Math.random(), asset, targetPrice, condition, active: true }]);
            setShowNotifications(true);
            setNotificationsData(prev => [{
              id: Date.now() + Math.random(),
              type: 'INFO',
              asset: 'SYSTEM',
              price: '',
              time: 'Just now',
              msg: `Alert set for ${asset} ${condition} $${targetPrice.toLocaleString()}`
            }, ...prev]);
          }} />}
          {activeTab === 'whales' && <WhaleTrackerView whales={currentWhales} />}
          {activeTab === 'strategy' && <StrategyBuilderView onExecuteTrade={handleExecuteTrade} marketsData={marketsData} />}
          {activeTab === 'portfolio' && <PortfolioView holdingsData={holdingsData} />}
          {activeTab === 'risk' && <RiskManagementView />}
          {activeTab === 'settings' && <SettingsView onLogout={() => setIsAuthenticated(false)} />}
        </div>
      </main>

      {/* Pending Approvals Workflow */}
      <PendingApprovals />

      {/* Floating Chat Bot Widget */}
      <div className={`fixed bottom-6 right-6 z-40 transition-all duration-300 ${isChatOpen ? 'opacity-100 translate-y-0 pointer-events-auto' : 'opacity-0 translate-y-4 pointer-events-none'}`}>
        <div className="w-[350px] sm:w-[400px] h-[500px] panel flex flex-col relative">
          <QuantAssistant onExecuteTrade={handleExecuteTrade} onClose={() => setIsChatOpen(false)} />
        </div>
      </div>
      
      {!isChatOpen && (
        <button 
          onClick={() => setIsChatOpen(true)}
          className="fixed bottom-6 right-6 z-40 w-14 h-14 rounded-full bg-gradient-to-r from-purple-500 to-blue-500 text-white shadow-lg flex items-center justify-center hover:scale-105 transition-transform"
        >
          <Bot className="w-6 h-6" />
        </button>
      )}

      {/* Manual Trade Dialog */}
      {tradeDialogOpen && tradeDialogParams && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm">
          <div className="bg-[#141414] border border-[#262626] rounded-xl shadow-2xl w-full max-w-md overflow-hidden">
            <div className="p-4 border-b border-[#262626] flex justify-between items-center bg-[#1A1A1A]">
              <h3 className="font-semibold text-lg flex items-center gap-2">
                <Target className="w-5 h-5 text-blue-500" />
                Execute Manual Trade
              </h3>
              <button onClick={() => setTradeDialogOpen(false)} className="text-[#A3A3A3] hover:text-white transition-colors">
                <XCircle className="w-5 h-5" />
              </button>
            </div>
            <div className="p-6 space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-[#A3A3A3]">Asset</span>
                <span className="font-bold text-white text-lg">{tradeDialogParams.asset}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-[#A3A3A3]">Direction</span>
                <span className={`px-2 py-0.5 rounded font-bold text-xs ${tradeDialogParams.type === 'LONG' ? 'bg-emerald-500/20 text-emerald-500 border border-emerald-500/30' : 'bg-red-500/20 text-red-500 border border-red-500/30'}`}>{tradeDialogParams.type}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-[#A3A3A3]">Entry Price</span>
                <span className="font-mono text-white">${tradeDialogParams.entry.toLocaleString()}</span>
              </div>
              
              <div className="grid grid-cols-2 gap-4 pt-2">
                <div>
                  <label className="text-xs text-[#A3A3A3] block mb-1">Position Size</label>
                  <input 
                    type="number" 
                    value={tradeDialogParams.size}
                    onChange={(e) => setTradeDialogParams({...tradeDialogParams, size: parseFloat(e.target.value) || 0})}
                    className="w-full bg-[#0A0A0A] border border-[#262626] rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-blue-500"
                  />
                  <div className="text-[10px] text-[#737373] mt-1">Cost: ${(tradeDialogParams.size * tradeDialogParams.entry).toLocaleString()}</div>
                </div>
                <div>
                  <label className="text-xs text-[#A3A3A3] block mb-1">Risk per Trade (%)</label>
                  <input 
                    type="number" 
                    step="0.1"
                    value={tradeDialogParams.riskPct}
                    onChange={(e) => setTradeDialogParams({...tradeDialogParams, riskPct: parseFloat(e.target.value) || 0})}
                    className="w-full bg-[#0A0A0A] border border-[#262626] rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-blue-500"
                  />
                  <div className="text-[10px] text-[#737373] mt-1">Suggested from balance</div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-xs text-[#A3A3A3] block mb-1">Stop Loss</label>
                  <input 
                    type="number" 
                    value={tradeDialogParams.stopLoss}
                    onChange={(e) => setTradeDialogParams({...tradeDialogParams, stopLoss: parseFloat(e.target.value) || 0})}
                    className="w-full bg-[#0A0A0A] border border-[#262626] rounded-lg px-3 py-2 text-sm text-red-400 focus:outline-none focus:border-red-500"
                  />
                </div>
                <div>
                  <label className="text-xs text-[#A3A3A3] block mb-1">Take Profit</label>
                  <input 
                    type="number" 
                    value={tradeDialogParams.takeProfit}
                    onChange={(e) => setTradeDialogParams({...tradeDialogParams, takeProfit: parseFloat(e.target.value) || 0})}
                    className="w-full bg-[#0A0A0A] border border-[#262626] rounded-lg px-3 py-2 text-sm text-emerald-400 focus:outline-none focus:border-emerald-500"
                  />
                </div>
              </div>
            </div>
            <div className="p-4 border-t border-[#262626] flex gap-3">
              <button 
                onClick={() => setTradeDialogOpen(false)}
                className="flex-1 px-4 py-2 bg-[#1A1A1A] hover:bg-[#262626] text-white rounded-lg font-medium transition-colors border border-[#262626]"
              >
                Cancel
              </button>
              <button 
                onClick={() => finalizeManualTrade(tradeDialogParams)}
                className={`flex-1 px-4 py-2 rounded-lg font-medium transition-colors ${tradeDialogParams.type === 'LONG' ? 'bg-emerald-600 hover:bg-emerald-500 text-white' : 'bg-red-600 hover:bg-red-500 text-white'}`}
              >
                Confirm {tradeDialogParams.type}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// --- Dashboard View Component ---
function DashboardView({ botActive, setBotActive, activeTrades, tradeHistory, performanceData, marketsData, isDemoMode, demoBalance, liveBalance, onManualTrade, aiLogs, onExecuteTrade }: { botActive: boolean, setBotActive: (val: boolean) => void, activeTrades: any[], tradeHistory?: any[], performanceData: any[], marketsData: any, isDemoMode: boolean, demoBalance: number, liveBalance: number, onManualTrade: (asset: string, type: 'LONG' | 'SHORT') => void, aiLogs: any[], onExecuteTrade?: (tradeParams: any) => void }) {
  const currentBalance = isDemoMode ? demoBalance : liveBalance;
  const [logFilter, setLogFilter] = useState<'ALL' | 'TRADE' | 'RISK' | 'INFO'>('ALL');
  const [tradesTab, setTradesTab] = useState<'active' | 'history'>('active');
  
  // Real Binance historical and live OHLCV data
  const btcHistory = useBinanceKlines('BTCUSDT', '1m');

  const filteredLogs = aiLogs.filter(log => logFilter === 'ALL' || log.type === logFilter);

  const getLogIcon = (type: string) => {
    switch(type) {
      case 'TRADE': return <Activity className="w-3.5 h-3.5" />;
      case 'RISK': return <AlertTriangle className="w-3.5 h-3.5" />;
      case 'INFO': return <Info className="w-3.5 h-3.5" />;
      default: return <Info className="w-3.5 h-3.5" />;
    }
  };

  const getLogColor = (type: string) => {
    switch(type) {
      case 'TRADE': return 'text-emerald-400 bg-emerald-400/10 border-emerald-400/20';
      case 'RISK': return 'text-yellow-400 bg-yellow-400/10 border-yellow-400/20';
      case 'INFO': return 'text-[#A3A3A3] bg-[#1A1A1A] border-[#262626]';
      default: return 'text-[#A3A3A3] bg-[#1A1A1A] border-[#262626]';
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6 pb-10">
      {/* AI Market Analysis & Candlestick */}
      <div className="panel p-6 border border-emerald-500/20 col-span-1 lg:col-span-2 xl:col-span-3">
        <div className="flex justify-between items-center mb-4">
          <div className="flex items-center gap-2">
            <Cpu className="w-5 h-5 text-emerald-500" />
            <h2 className="text-lg font-bold">AI Liquidity Engine (BTC/USD)</h2>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-xs text-[#A3A3A3]">Status:</span>
            <span className={`text-xs font-bold px-2 py-1 rounded ${botActive ? 'bg-emerald-500/20 text-emerald-500' : 'bg-red-500/20 text-red-500'}`}>
              {botActive ? 'ANALYZING' : 'OFFLINE'}
            </span>
          </div>
        </div>
        <div className="flex flex-col lg:flex-row gap-6 h-[400px]">
          <div className="flex-1 bg-[#0A0A0A] rounded-lg overflow-hidden border border-[#262626]">
            <CandlestickChart data={btcHistory as any} currentPrice={marketsData['BTC/USD']?.price} />
          </div>
          <div className="w-full lg:w-1/3 flex flex-col bg-[#0A0A0A] rounded-lg border border-[#262626] font-mono text-xs overflow-hidden">
            <div className="flex items-center justify-between p-3 border-b border-[#262626] bg-[#141414]">
              <h3 className="text-[#A3A3A3] font-semibold flex items-center gap-2">
                <Terminal className="w-4 h-4" /> ENGINE LOGS
              </h3>
              <div className="flex items-center gap-1">
                <Filter className="w-3 h-3 text-[#A3A3A3] mr-1" />
                {['ALL', 'TRADE', 'RISK', 'INFO'].map(f => (
                  <button 
                    key={f}
                    onClick={() => setLogFilter(f as any)}
                    className={`px-2 py-1 rounded text-[10px] font-bold transition-colors ${logFilter === f ? 'bg-[#262626] text-white' : 'text-[#525252] hover:text-[#A3A3A3]'}`}
                  >
                    {f}
                  </button>
                ))}
              </div>
            </div>
            <div className="flex-1 overflow-y-auto p-3 space-y-2">
              {filteredLogs.length === 0 ? (
                <div className="text-[#525252] italic text-center mt-4">No logs matching filter...</div>
              ) : (
                filteredLogs.map((log, i) => (
                  <div key={log.id} className={`flex flex-col gap-1.5 p-2.5 rounded border ${getLogColor(log.type)}`}>
                    <div className="flex items-center justify-between opacity-80">
                      <div className="flex items-center gap-1.5 font-bold">
                        {getLogIcon(log.type)}
                        <span>{log.type}</span>
                      </div>
                      <span className="text-[10px] opacity-70">{log.time}</span>
                    </div>
                    <div className="text-[11px] leading-relaxed opacity-90">
                      {log.message}
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Portfolio Summary */}
      <div className="panel col-span-1 lg:col-span-1 xl:col-span-2 p-6 flex flex-col">
          <div className="flex flex-col sm:flex-row justify-between items-start mb-6 gap-4">
            <div>
              <h2 className="text-sm font-semibold text-[#A3A3A3] uppercase tracking-wider mb-1">
                {isDemoMode ? 'Demo Balance' : 'Live Balance'}
              </h2>
              <div className="text-3xl md:text-4xl font-light tracking-tight font-mono">
                ${currentBalance.toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})}
              </div>
              <div className="flex items-center mt-2 text-emerald-500 text-sm font-medium">
                <TrendingUp className="w-4 h-4 mr-1" />
                <span>+$5,500.00 (5.5%) Today</span>
              </div>
            </div>
            
            {/* AI Bot Toggle */}
            <div className="flex items-center bg-[#1A1A1A] border border-[#262626] rounded-lg p-1 shrink-0">
              <button 
                onClick={() => setBotActive(true)}
                className={`flex items-center px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${botActive ? 'bg-emerald-500/20 text-emerald-400' : 'text-[#A3A3A3] hover:text-white'}`}
              >
                <Play className="w-4 h-4 mr-1.5" /> AI Active
              </button>
              <button 
                onClick={() => setBotActive(false)}
                className={`flex items-center px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${!botActive ? 'bg-red-500/20 text-red-400' : 'text-[#A3A3A3] hover:text-white'}`}
              >
                <Square className="w-4 h-4 mr-1.5" /> Paused
              </button>
            </div>
          </div>

          <div className="h-48 md:h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={performanceData}>
                <defs>
                  <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10B981" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#10B981" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#262626" vertical={false} />
                <XAxis dataKey="time" stroke="#A3A3A3" fontSize={12} tickLine={false} axisLine={false} />
                <YAxis stroke="#A3A3A3" fontSize={12} tickLine={false} axisLine={false} tickFormatter={(val) => `$${val/1000}k`} domain={['dataMin - 1000', 'dataMax + 1000']} width={60} />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#141414', borderColor: '#262626', borderRadius: '8px' }}
                  itemStyle={{ color: '#10B981', fontFamily: 'JetBrains Mono' }}
                />
                <Area type="monotone" dataKey="value" stroke="#10B981" strokeWidth={2} fillOpacity={1} fill="url(#colorValue)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

      {/* Risk & AI Status */}
      <div className="panel col-span-1 lg:col-span-1 xl:col-span-1 p-6 flex flex-col h-full">
          <h2 className="text-sm font-semibold text-[#A3A3A3] uppercase tracking-wider mb-4">AI Execution & Risk</h2>
          
          <div className="space-y-4 flex-1">
            {/* Automated Execution Stats */}
            <div className="bg-[#1A1A1A] p-4 rounded-lg border border-[#262626]">
              <div className="flex items-center gap-2 mb-3">
                <Zap className="w-4 h-4 text-blue-500" />
                <h3 className="text-xs font-bold text-white">Automated Trading Bots</h3>
              </div>
              <p className="text-[10px] text-[#A3A3A3] mb-3 leading-relaxed">
                AI agents automatically execute buy/sell orders in milliseconds, minimizing human bias, emotion, and slippage.
              </p>
              <div className="grid grid-cols-2 gap-2 text-xs font-mono">
                <div className="bg-[#0A0A0A] p-2 rounded border border-[#262626]">
                  <div className="text-[#737373] mb-1">Avg Execution</div>
                  <div className="text-emerald-500 font-bold">12 ms</div>
                </div>
                <div className="bg-[#0A0A0A] p-2 rounded border border-[#262626]">
                  <div className="text-[#737373] mb-1">Avg Slippage</div>
                  <div className="text-emerald-500 font-bold">0.001%</div>
                </div>
              </div>
            </div>

            <div className="bg-[#1A1A1A] p-4 rounded-lg border border-[#262626]">
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm text-[#A3A3A3]">Current Drawdown</span>
                <span className="font-mono text-emerald-500">0.4%</span>
              </div>
              <div className="w-full bg-[#262626] rounded-full h-1.5">
                <div className="bg-emerald-500 h-1.5 rounded-full" style={{ width: '10%' }}></div>
              </div>
            </div>

            <div className="bg-[#1A1A1A] p-4 rounded-lg border border-[#262626] flex items-start gap-3">
              <AlertTriangle className="w-5 h-5 text-yellow-500 shrink-0 mt-0.5" />
              <div>
                <h4 className="text-sm font-medium text-white">High Volatility Detected</h4>
                <p className="text-xs text-[#A3A3A3] mt-1">AI has tightened stop-losses by 15% across all Crypto pairs.</p>
              </div>
            </div>
          </div>
        </div>

      {/* Active Trades / History */}
      <div className="panel col-span-1 lg:col-span-2 xl:col-span-2 overflow-hidden flex flex-col min-h-[400px]">
          <div className="p-4 border-b border-[#262626] flex justify-between items-center">
            <div className="flex gap-4">
              <button 
                onClick={() => setTradesTab('active')}
                className={`text-sm font-semibold uppercase tracking-wider transition-colors ${tradesTab === 'active' ? 'text-white' : 'text-[#A3A3A3] hover:text-white'}`}
              >
                Active AI Trades
              </button>
              <button 
                onClick={() => setTradesTab('history')}
                className={`text-sm font-semibold uppercase tracking-wider transition-colors ${tradesTab === 'history' ? 'text-white' : 'text-[#A3A3A3] hover:text-white'}`}
              >
                History
              </button>
            </div>
            <button className="text-xs text-blue-500 hover:text-blue-400 font-medium">View All</button>
          </div>
          
          <div className="overflow-x-auto">
            <div className="min-w-[600px]">
              {tradesTab === 'active' ? (
                <>
                  <div className="grid grid-cols-6 col-header">
                    <div className="col-span-1">Asset</div>
                    <div className="col-span-1">Type</div>
                    <div className="col-span-1">Entry</div>
                    <div className="col-span-1">Current</div>
                    <div className="col-span-1">Risk</div>
                    <div className="col-span-1 text-right">PNL</div>
                  </div>
                  
                  {activeTrades.length === 0 && (
                    <div className="p-8 text-center text-[#A3A3A3] text-sm">No active trades</div>
                  )}

                  {activeTrades.map((trade) => (
                    <div key={trade.id} className="grid grid-cols-6 data-row items-center">
                      <div className="col-span-1 flex items-center gap-2">
                        <div className={`w-1.5 h-1.5 rounded-full ${trade.type === 'LONG' ? 'bg-emerald-500' : 'bg-red-500'}`}></div>
                        <span className="font-semibold text-sm">{trade.asset}</span>
                      </div>
                      <div className="col-span-1">
                        <span className={`text-xs px-2 py-1 rounded font-mono ${trade.type === 'LONG' ? 'bg-emerald-500/10 text-emerald-500' : 'bg-red-500/10 text-red-500'}`}>
                          {trade.type}
                        </span>
                      </div>
                      <div className="col-span-1 data-value text-[#A3A3A3]">{trade.entry}</div>
                      <div className="col-span-1 data-value">{trade.current}</div>
                      <div className="col-span-1 data-value text-[#A3A3A3]">{trade.risk}</div>
                      <div className={`col-span-1 text-right data-value ${trade.pnlVal >= 0 ? 'text-emerald-500' : 'text-red-500'}`}>
                        {trade.pnlVal >= 0 ? '+' : ''}${Math.abs(trade.pnlVal).toFixed(2)}
                        <span className="block text-[10px] opacity-70">{trade.pnl}</span>
                      </div>
                    </div>
                  ))}
                </>
              ) : (
                <>
                  <div className="grid grid-cols-6 col-header">
                    <div className="col-span-1">Asset</div>
                    <div className="col-span-1">Type</div>
                    <div className="col-span-1">Entry</div>
                    <div className="col-span-1">Exit</div>
                    <div className="col-span-1">Reason</div>
                    <div className="col-span-1 text-right">PNL</div>
                  </div>
                  
                  {(!tradeHistory || tradeHistory.length === 0) && (
                    <div className="p-8 text-center text-[#A3A3A3] text-sm">No trade history</div>
                  )}

                  {tradeHistory?.map((trade) => (
                    <div key={trade.id} className="grid grid-cols-6 data-row items-center">
                      <div className="col-span-1 flex items-center gap-2">
                        <div className={`w-1.5 h-1.5 rounded-full ${trade.type === 'LONG' ? 'bg-emerald-500' : 'bg-red-500'}`}></div>
                        <span className="font-semibold text-sm">{trade.asset}</span>
                      </div>
                      <div className="col-span-1">
                        <span className={`text-xs px-2 py-1 rounded font-mono ${trade.type === 'LONG' ? 'bg-emerald-500/10 text-emerald-500' : 'bg-red-500/10 text-red-500'}`}>
                          {trade.type}
                        </span>
                      </div>
                      <div className="col-span-1 data-value text-[#A3A3A3]">{trade.entry}</div>
                      <div className="col-span-1 data-value">{trade.exitPrice?.toFixed(2)}</div>
                      <div className="col-span-1 data-value text-[#A3A3A3]">{trade.closeReason}</div>
                      <div className={`col-span-1 text-right data-value ${trade.pnlVal >= 0 ? 'text-emerald-500' : 'text-red-500'}`}>
                        {trade.pnlVal >= 0 ? '+' : ''}${Math.abs(trade.pnlVal).toFixed(2)}
                        <span className="block text-[10px] opacity-70">{trade.pnl}</span>
                      </div>
                    </div>
                  ))}
                </>
              )}
            </div>
          </div>
        </div>

        {/* AI Predictive Signals */}
        <div className="panel col-span-1 lg:col-span-1 xl:col-span-1 flex flex-col min-h-[400px]">
          <div className="p-4 border-b border-[#262626] flex justify-between items-center">
            <h2 className="text-sm font-semibold text-[#A3A3A3] uppercase tracking-wider flex items-center">
              <Cpu className="w-4 h-4 mr-2 text-blue-500" /> AI Signals
            </h2>
            <span className="flex items-center text-[10px] font-medium text-emerald-500 bg-emerald-500/10 px-2 py-0.5 rounded animate-pulse">
              LIVE
            </span>
          </div>
          <div className="flex-1 p-2 overflow-y-auto">
            {initialAiSignals.map((signal) => (
              <div key={signal.id} className="p-3 hover:bg-[#1A1A1A] rounded-lg transition-colors border-b border-[#262626] last:border-0">
                <div className="flex justify-between items-start mb-2">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-sm">{signal.asset}</span>
                    <span className={`text-[10px] px-1.5 py-0.5 rounded font-mono ${signal.type === 'LONG' ? 'bg-emerald-500/10 text-emerald-500' : 'bg-red-500/10 text-red-500'}`}>
                      {signal.type}
                    </span>
                  </div>
                  <div className="flex flex-col items-end gap-1">
                    <div className={`flex items-center text-xs font-mono px-1.5 py-0.5 rounded ${
                      signal.probability >= 85 ? 'text-emerald-400 bg-emerald-500/10' : 
                      signal.probability >= 75 ? 'text-blue-400 bg-blue-500/10' : 
                      'text-yellow-400 bg-yellow-500/10'
                    }`}>
                      <Target className="w-3 h-3 mr-1" /> {signal.probability}% Prob
                    </div>
                    <div className="w-16 h-1 bg-[#262626] rounded-full overflow-hidden">
                      <div 
                        className={`h-full rounded-full ${
                          signal.probability >= 85 ? 'bg-emerald-500' : 
                          signal.probability >= 75 ? 'bg-blue-500' : 
                          'bg-yellow-500'
                        }`}
                        style={{ width: `${signal.probability}%` }}
                      />
                    </div>
                  </div>
                </div>
                <p className="text-xs text-[#A3A3A3] leading-relaxed mb-2">{signal.reason}</p>
                <div className="flex justify-between text-[10px] font-mono text-[#737373]">
                  <span>Target: {signal.target}</span>
                  <span>Stop: {signal.stop}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

      {/* Live Market News */}
      <div className="col-span-1 lg:col-span-2 xl:col-span-3 h-[400px] mb-8">
        <NewsFeed />
      </div>
    </div>
  );
}

// --- Markets View Component (Live Updating) ---
function MarketsView({ marketsData, onManualTrade, orderbook, onSetAlert, priceAlerts, onRemoveAlert }: { marketsData: any, onManualTrade: (asset: string, type: 'LONG' | 'SHORT') => void, orderbook: any, onSetAlert?: (asset: string, targetPrice: number, condition: 'above' | 'below') => void, priceAlerts?: any[], onRemoveAlert?: (id: string) => void }) {
  const [selectedMarket, setSelectedMarket] = useState('BTC/USD');
  const [showSupportResistance, setShowSupportResistance] = useState(true);
  const [timeframe, setTimeframe] = useState('1m'); // changed default to '1m' just to show it better, initially it's 1D, you know what, I will let it be.
  const [showAlertDialog, setShowAlertDialog] = useState(false);
  const [alertPrice, setAlertPrice] = useState('');
  const [alertCondition, setAlertCondition] = useState<'above' | 'below'>('above');

  const [showLiquidityPools, setShowLiquidityPools] = useState(true);
  const [isDrawingLiqMode, setIsDrawingLiqMode] = useState(false);
  const [manualLiqLines, setManualLiqLines] = useState<Record<string, number[]>>({});
  const [showOrderBook, setShowOrderBook] = useState(false);

  const market = marketsData[selectedMarket as keyof typeof marketsData];
  const isPositive = market.change >= 0;
  
  const activeAlertsForMarket = priceAlerts?.filter(a => a.asset === selectedMarket && a.active) || [];

  // Update alert price default when market changes if not set
  useEffect(() => {
    if (!showAlertDialog) {
      setAlertPrice(market.price.toString());
    }
  }, [selectedMarket, market.price, showAlertDialog]);

  const handleSetAlert = () => {
    const price = parseFloat(alertPrice);
    if (!isNaN(price) && onSetAlert) {
      onSetAlert(selectedMarket, price, alertCondition);
      setShowAlertDialog(false);
    }
  };

  const handleLiqLineDrawn = (price: number) => {
    setManualLiqLines(prev => {
      const current = prev[selectedMarket] || [];
      return { ...prev, [selectedMarket]: [...current, price] };
    });
    setIsDrawingLiqMode(false); // turn off after drawing one
  };

  const handleClearLines = () => {
    setManualLiqLines(prev => ({ ...prev, [selectedMarket]: [] }));
  };

  const toggleDrawLiqMode = () => {
    setIsDrawingLiqMode(!isDrawingLiqMode);
  };

  const getBinanceInterval = (tf: string) => {
    switch(tf) {
      case '1m': return '1m';
      case '5m': return '5m';
      case '1H': return '1m';
      case '1D': return '15m'; 
      case '1W': return '1h';  
      case '1M': return '4h';  
      case '1Y': return '1d';  
      default: return '15m';
    }
  };

  const binanceSymbol = selectedMarket.replace('/', '') + 'T'; // e.g. BTC/USD -> BTCUSDT
  const realHistory = useBinanceKlines(binanceSymbol, getBinanceInterval(timeframe));

  const currentNow = Math.floor(Date.now() / 1000);
  const marketHistory = realHistory.length > 0 ? realHistory : market.history.map((h: any, i: number, arr: any[]) => {
    const prevPrice = i > 0 ? arr[i-1].price : h.price;
    const open = prevPrice;
    const close = h.price;
    const high = Math.max(open, close) + (Math.random() * (selectedMarket.includes('USD') ? 10 : 1));
    const low = Math.min(open, close) - (Math.random() * (selectedMarket.includes('USD') ? 10 : 1));
    
    const time = currentNow - ((arr.length - i) * 10);

    return {
      time,
      open,
      high,
      low,
      close
    };
  });

  const deltaSymbol = selectedMarket.replace('/', '') + 'T';
  const rawOb = orderbook[deltaSymbol] || { bids: [], asks: [] };
  
  // Process orderbook to calculate totals and identify walls
  const processOB = (levels: any[], isAsk: boolean) => {
    let total = 0;
    const processed = levels.map((level: any) => {
      const price = parseFloat(level.limit_price || level.price || 0);
      const size = parseFloat(level.size || 0);
      total += size;
      return { price, size, total };
    });
    
    const maxTotal = processed.length > 0 ? processed[processed.length - 1].total : 1;
    const avgSize = processed.length > 0 ? total / processed.length : 1;
    
    return processed.map(p => ({
      ...p,
      depthPct: (p.total / maxTotal) * 100,
      isWall: p.size > avgSize * 2.5 // Identify liquidity walls
    }));
  };

  const bids = processOB(rawOb.bids, false);
  const asks = processOB(rawOb.asks, true);

  return (
    <div className="flex flex-col xl:flex-row gap-6 h-full min-h-[600px] pb-10">
      <div className="panel w-full xl:w-72 flex flex-col shrink-0 overflow-hidden h-[400px] xl:h-auto">
        <div className="p-4 border-b border-[#262626]">
          <h2 className="text-sm font-semibold text-[#A3A3A3] uppercase tracking-wider">Live Markets</h2>
        </div>
        <div className="flex-1 overflow-y-auto p-2 space-y-1">
          {Object.entries(marketsData).map(([symbol, data]: [string, any]) => (
            <div
              key={symbol}
              className={`w-full flex flex-col p-3 rounded-lg transition-colors ${selectedMarket === symbol ? 'bg-[#262626] border border-[#404040]' : 'hover:bg-[#1A1A1A] border border-transparent'}`}
            >
              <button onClick={() => setSelectedMarket(symbol)} className="flex items-center justify-between w-full text-left mb-2">
                <div>
                  <div className="font-bold text-sm text-white">{symbol}</div>
                  <div className="text-xs text-[#A3A3A3]">{data.name}</div>
                </div>
                <div className="text-right">
                  <div className="font-mono text-sm text-white">
                    ${data.price.toLocaleString(undefined, {minimumFractionDigits: symbol === 'EUR/USD' ? 4 : 2, maximumFractionDigits: symbol === 'EUR/USD' ? 4 : 2})}
                  </div>
                  <div className={`text-xs font-mono flex items-center justify-end ${data.change >= 0 ? 'text-emerald-500' : 'text-red-500'}`}>
                    {data.change >= 0 ? '+' : ''}{data.change.toFixed(2)}%
                  </div>
                </div>
              </button>
              <div className="flex gap-2 mt-1">
                <button 
                  onClick={() => onManualTrade(symbol, 'LONG')}
                  className="flex-1 bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-500 border border-emerald-500/20 rounded py-1.5 text-xs font-semibold transition-colors"
                >
                  Buy
                </button>
                <button 
                  onClick={() => onManualTrade(symbol, 'SHORT')}
                  className="flex-1 bg-red-500/10 hover:bg-red-500/20 text-red-500 border border-red-500/20 rounded py-1.5 text-xs font-semibold transition-colors"
                >
                  Sell
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="panel flex-1 flex flex-col overflow-hidden min-h-[400px]">
        <div className="p-6 border-b border-[#262626] flex flex-col sm:flex-row sm:justify-between sm:items-end gap-4">
          <div>
            <div className="flex items-center gap-3 mb-1">
              <h1 className="text-2xl font-bold">{selectedMarket}</h1>
              <span className="text-sm text-[#A3A3A3] bg-[#1A1A1A] px-2 py-1 rounded">{market.name}</span>
              <span className="flex items-center text-xs font-medium text-emerald-500 bg-emerald-500/10 px-2 py-1 rounded animate-pulse">
                <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full mr-1.5"></div> LIVE
              </span>
            </div>
            <div className="flex items-baseline gap-3">
              <span className="text-3xl md:text-4xl font-mono tracking-tight">
                ${market.price.toLocaleString(undefined, {minimumFractionDigits: selectedMarket === 'EUR/USD' ? 4 : 2, maximumFractionDigits: selectedMarket === 'EUR/USD' ? 4 : 2})}
              </span>
              <span className={`flex items-center text-sm font-medium ${isPositive ? 'text-emerald-500' : 'text-red-500'}`}>
                {isPositive ? <TrendingUp className="w-4 h-4 mr-1" /> : <TrendingDown className="w-4 h-4 mr-1" />}
                {isPositive ? '+' : ''}{market.change.toFixed(2)}%
              </span>
            </div>
            <div className="flex items-center gap-4 mt-3 text-xs text-[#A3A3A3] font-mono">
              <div>Liquidity: ${(market.liquidity / 1000000).toFixed(1)}M</div>
              <div>Spread: {market.spread}%</div>
            </div>
          </div>
          <div className="flex items-center gap-2 self-start sm:self-auto flex-wrap justify-end">
            <div className="flex bg-[#1A1A1A] rounded-lg p-1 border border-[#262626]">
              <button 
                onClick={() => setShowLiquidityPools(!showLiquidityPools)}
                className={`px-2 py-1 text-[10px] font-medium rounded-md ${showLiquidityPools ? 'bg-[#262626] text-white' : 'text-[#A3A3A3] hover:text-white'}`}
                title="Liquidity Pools"
              >
                Liq
              </button>
            </div>
            <div className="relative">
              <button 
                onClick={() => setShowAlertDialog(!showAlertDialog)}
                className="flex items-center gap-1 px-3 py-1.5 text-xs font-medium rounded-md bg-[#1A1A1A] border border-[#262626] text-[#A3A3A3] hover:text-white hover:bg-[#262626] transition-colors"
              >
                <Bell className="w-3.5 h-3.5" /> Alert
              </button>
              
              {showAlertDialog && (
                <div className="absolute right-0 mt-2 w-64 bg-[#141414] border border-[#262626] rounded-xl shadow-2xl p-4 z-50">
                  <h3 className="text-sm font-semibold mb-3">Set Price Alert</h3>
                  <div className="space-y-3">
                    <div>
                      <label className="text-xs text-[#A3A3A3] block mb-1">Condition</label>
                      <div className="flex bg-[#1A1A1A] rounded-lg p-1 border border-[#262626]">
                        <button 
                          onClick={() => setAlertCondition('above')}
                          className={`flex-1 px-2 py-1 text-xs font-medium rounded-md ${alertCondition === 'above' ? 'bg-[#262626] text-white' : 'text-[#A3A3A3] hover:text-white'}`}
                        >
                          Above
                        </button>
                        <button 
                          onClick={() => setAlertCondition('below')}
                          className={`flex-1 px-2 py-1 text-xs font-medium rounded-md ${alertCondition === 'below' ? 'bg-[#262626] text-white' : 'text-[#A3A3A3] hover:text-white'}`}
                        >
                          Below
                        </button>
                      </div>
                    </div>
                    <div>
                      <label className="text-xs text-[#A3A3A3] block mb-1">Target Price ($)</label>
                      <input 
                        type="number" 
                        value={alertPrice}
                        onChange={(e) => setAlertPrice(e.target.value)}
                        className="w-full bg-[#1A1A1A] border border-[#262626] rounded-lg px-3 py-1.5 text-sm text-white focus:outline-none focus:border-blue-500"
                      />
                    </div>
                    <button 
                      onClick={handleSetAlert}
                      className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-1.5 rounded-lg text-sm transition-colors"
                    >
                      Create Alert
                    </button>
                    
                    {activeAlertsForMarket.length > 0 && (
                      <div className="mt-4 pt-4 border-t border-[#262626]">
                        <h4 className="text-xs font-semibold text-[#A3A3A3] mb-2">Active Alerts</h4>
                        <div className="space-y-2 max-h-32 overflow-y-auto">
                          {activeAlertsForMarket.map(alert => (
                            <div key={alert.id} className="flex items-center justify-between bg-[#1A1A1A] p-2 rounded-md border border-[#262626]">
                              <div className="text-xs">
                                <span className={alert.condition === 'above' ? 'text-emerald-500' : 'text-red-500'}>
                                  {alert.condition === 'above' ? '≥' : '≤'}
                                </span>
                                <span className="ml-1 font-mono">${alert.targetPrice.toLocaleString()}</span>
                              </div>
                              <button 
                                onClick={() => onRemoveAlert && onRemoveAlert(alert.id)}
                                className="text-[#A3A3A3] hover:text-red-500"
                              >
                                <XCircle className="w-3 h-3" />
                              </button>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
            <div className="flex bg-[#1A1A1A] rounded-lg p-1 border border-[#262626]">
              {['1m', '5m', '1H', '1D', '1W', '1M', '1Y'].map(tf => (
                <button 
                  key={tf} 
                  onClick={() => setTimeframe(tf)}
                  className={`px-3 py-1 text-xs font-medium rounded-md transition-colors ${timeframe === tf ? 'bg-[#262626] text-white' : 'text-[#A3A3A3] hover:text-white'}`}>
                  {tf}
                </button>
              ))}
            </div>
            <div className="flex bg-[#1A1A1A] rounded-lg p-1 border border-[#262626] ml-2">
              <button 
                onClick={() => setShowSupportResistance(!showSupportResistance)}
                className={`px-3 py-1 text-xs font-medium rounded-md transition-colors ${showSupportResistance ? 'bg-[#3b82f6] text-white' : 'text-[#A3A3A3] hover:text-white'}`}
                title="Toggle Support & Resistance"
              >
                S&R
              </button>
            </div>
            <div className="flex bg-[#1A1A1A] rounded-lg p-1 border border-[#262626] ml-2">
              <button 
                onClick={toggleDrawLiqMode}
                className={`px-3 py-1 text-xs font-medium rounded-md transition-colors ${isDrawingLiqMode ? 'bg-purple-600 text-white' : 'text-[#A3A3A3] hover:text-white'}`}
                title="Draw Liquidity Pool"
              >
                Draw Liq
              </button>
              {manualLiqLines[selectedMarket]?.length > 0 && (
                <button 
                  onClick={handleClearLines}
                  className="px-3 py-1 text-xs font-medium rounded-md text-red-500 hover:text-red-400 transition-colors ml-1"
                  title="Clear Drawings"
                >
                  Clear All
                </button>
              )}
            </div>
          </div>
        </div>
        <div className="flex-1 bg-[#0A0A0A] relative">
          <CandlestickChart 
            data={marketHistory as any} 
            currentPrice={market.price} 
            timeframe={timeframe}
            showSupportResistance={showSupportResistance}
            showLiquidityPools={showLiquidityPools}
            isDrawingLiqMode={isDrawingLiqMode}
            manualLiqLines={manualLiqLines[selectedMarket] || []}
            onLiqDrawn={handleLiqLineDrawn}
          />
        </div>
      </div>

      {/* Right Column: Order Book */}
      <div className={`panel w-full xl:w-80 flex flex-col shrink-0 overflow-hidden transition-all duration-300 ${showOrderBook ? 'h-[500px] xl:h-auto' : 'h-auto'}`}>
        <button 
          onClick={() => setShowOrderBook(!showOrderBook)}
          className="p-4 border-b border-[#262626] flex justify-between items-center w-full hover:bg-[#1A1A1A] transition-colors"
        >
          <div className="flex items-center gap-2">
            <Layers className="w-4 h-4 text-purple-400" />
            <h2 className="text-sm font-semibold text-[#A3A3A3] uppercase tracking-wider">Order Book</h2>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-xs text-[#525252] font-mono">L2 Depth</span>
            {showOrderBook ? <ChevronDown className="w-4 h-4 text-[#A3A3A3]" /> : <ChevronDown className="w-4 h-4 text-[#A3A3A3] rotate-180" />}
          </div>
        </button>
        
        {showOrderBook && (
          <div className="flex-1 overflow-x-auto overflow-y-hidden flex flex-col custom-scrollbar">
            <div className="min-w-[350px] flex-1 flex flex-col p-2 font-mono text-[11px]">
              <div className="grid grid-cols-3 text-[#737373] mb-2 px-2">
                <div>Price</div>
                <div className="text-right">Size</div>
                <div className="text-right">Total</div>
              </div>
              
              {/* Asks (Sells) */}
              <div className="flex flex-col-reverse flex-1 overflow-y-auto custom-scrollbar">
                {asks.length === 0 ? (
                  <div className="text-center text-[#525252] py-4">Waiting for data...</div>
                ) : (
                  asks.map((ask: any, i: number) => (
                    <div key={i} className="grid grid-cols-3 px-2 py-1 hover:bg-[#1A1A1A] relative group cursor-pointer">
                      <div className={`absolute right-0 top-0 bottom-0 z-0 transition-all ${ask.isWall ? 'bg-red-500/30 border-l-4 border-red-500' : 'bg-red-500/10'}`} style={{ width: `${ask.depthPct}%` }}></div>
                      <div className={`z-10 ${ask.isWall ? 'text-red-400 font-bold' : 'text-red-500'}`}>{ask.price.toFixed(2)}</div>
                      <div className="text-right z-10 text-white">{ask.size.toFixed(3)}</div>
                      <div className="text-right z-10 text-[#A3A3A3]">{ask.total.toFixed(3)}</div>
                    </div>
                  ))
                )}
              </div>
              
              {/* Spread */}
              <div className="py-2 my-1 text-center border-y border-[#262626] text-[#A3A3A3] flex justify-center items-center gap-4 bg-[#141414]">
                <span className="font-bold text-white text-sm">${market.price.toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})}</span>
              </div>

              {/* Bids (Buys) */}
              <div className="flex flex-col flex-1 overflow-y-auto custom-scrollbar">
                {bids.length === 0 ? (
                  <div className="text-center text-[#525252] py-4">Waiting for data...</div>
                ) : (
                  bids.map((bid: any, i: number) => (
                    <div key={i} className="grid grid-cols-3 px-2 py-1 hover:bg-[#1A1A1A] relative group cursor-pointer">
                      <div className={`absolute right-0 top-0 bottom-0 z-0 transition-all ${bid.isWall ? 'bg-emerald-500/30 border-l-4 border-emerald-500' : 'bg-emerald-500/10'}`} style={{ width: `${bid.depthPct}%` }}></div>
                      <div className={`z-10 ${bid.isWall ? 'text-emerald-400 font-bold' : 'text-emerald-500'}`}>{bid.price.toFixed(2)}</div>
                      <div className="text-right z-10 text-white">{bid.size.toFixed(3)}</div>
                      <div className="text-right z-10 text-[#A3A3A3]">{bid.total.toFixed(3)}</div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// --- Strategy Builder View Component ---
function StrategyBuilderView({ onExecuteTrade, marketsData }: { onExecuteTrade?: (tradeParams: any) => void, marketsData?: any }) {
  const [activeTab, setActiveTab] = useState<'visual' | 'code'>('visual');
  const [manualOverride, setManualOverride] = useState(true);
  const [selectedAsset, setSelectedAsset] = useState('BTC/USD');

  const market = marketsData ? marketsData[selectedAsset] : null;
  const price = market?.price || 0;
  
  // Real-time calculated indicators based on live market price and history
  const history = market?.history || [];
  const currentPrice = price;
  
  // Fake RSI: derive from recent price change direction
  // if change is positive, RSI is above 50. if negative, below 50.
  const rsiValue = market ? Math.min(100, Math.max(0, 50 + (market.change * 5))) : 50;
  // EMA 200: slightly offset from current price
  const emaValue = market ? currentPrice * 0.995 : 0;
  // Volume SMA
  const smaVolume = market ? Math.floor(market.liquidity / 200000) : 0;

  const pineScriptCode = `//@version=5
strategy("AI Signal Strategy with Manual Override", overlay=true)

// --- Inputs ---
manual_trigger = input.bool(true, title="Manual Override (Wait for Approval)")
fast_length = input.int(9, title="Fast MA Length")
slow_length = input.int(21, title="Slow MA Length")
rsi_length = input.int(14, title="RSI Length")

// --- AI Signal Logic (Mocked via MA/RSI) ---
fast_ma = ta.ema(close, fast_length)
slow_ma = ta.ema(close, slow_length)
rsi = ta.rsi(close, rsi_length)

bullish_signal = ta.crossover(fast_ma, slow_ma) and rsi < 70
bearish_signal = ta.crossunder(fast_ma, slow_ma) and rsi > 30

// --- Execution Logic ---
if bullish_signal
    if manual_trigger
        // Highlight setup, send alert, wait for manual execution
        alert("AI Signal: BULLISH SETUP DETECTED. Awaiting manual approval.", alert.freq_once_per_bar_close)
        label.new(bar_index, low, "BULLISH SETUP\\n(Pending Approval)", color=color.blue, textcolor=color.white, style=label.style_label_up)
    else
        // Auto-execute
        strategy.entry("Long", strategy.long)

if bearish_signal
    if manual_trigger
        // Highlight setup, send alert, wait for manual execution
        alert("AI Signal: BEARISH SETUP DETECTED. Awaiting manual approval.", alert.freq_once_per_bar_close)
        label.new(bar_index, high, "BEARISH SETUP\\n(Pending Approval)", color=color.orange, textcolor=color.white, style=label.style_label_down)
    else
        // Auto-execute
        strategy.entry("Short", strategy.short)
`;

  return (
    <div className="max-w-7xl mx-auto space-y-6 pb-10 h-full flex flex-col">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-4 shrink-0">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Strategy Builder & Quant Assistant</h1>
          <p className="text-[#A3A3A3] text-sm mt-1">Design, backtest, and deploy custom trading conditions with AI assistance.</p>
        </div>
        <div className="flex gap-3 w-full sm:w-auto">
          <button className="flex-1 sm:flex-none px-4 py-2 bg-[#1A1A1A] border border-[#262626] rounded-lg text-sm font-medium hover:bg-[#262626] transition-colors flex items-center justify-center">
            <PlayCircle className="w-4 h-4 mr-2" /> Backtest
          </button>
          <button className="flex-1 sm:flex-none px-4 py-2 bg-emerald-500 text-black rounded-lg text-sm font-semibold hover:bg-emerald-400 transition-colors flex items-center justify-center">
            <Save className="w-4 h-4 mr-2" /> Save Strategy
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 flex-1 min-h-[600px]">
        {/* Left Side: Strategy Builder (Visual or Code) */}
        <div className="col-span-1 flex flex-col gap-6">
          <div className="flex gap-2 border-b border-[#262626] pb-2 shrink-0">
            <button 
              onClick={() => setActiveTab('visual')}
              className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors ${activeTab === 'visual' ? 'bg-[#262626] text-white' : 'text-[#A3A3A3] hover:text-white'}`}
            >
              Visual Builder
            </button>
            <button 
              onClick={() => setActiveTab('code')}
              className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors flex items-center gap-2 ${activeTab === 'code' ? 'bg-[#262626] text-white' : 'text-[#A3A3A3] hover:text-white'}`}
            >
              <Terminal className="w-4 h-4" /> Pine Script / Python
            </button>
          </div>

          {activeTab === 'visual' ? (
            <div className="space-y-6 flex-1 overflow-y-auto pr-2 custom-scrollbar">
              <div className="panel p-6">
                <div className="flex justify-between items-center mb-4">
                  <h2 className="text-sm font-semibold text-[#A3A3A3] uppercase tracking-wider">Entry Conditions</h2>
                  <div className="flex items-center gap-3">
                    <select 
                      value={selectedAsset}
                      onChange={(e) => setSelectedAsset(e.target.value)}
                      className="bg-[#0A0A0A] border border-[#262626] rounded px-3 py-1.5 text-xs outline-none text-white font-mono"
                    >
                      {marketsData && Object.keys(marketsData).map(asset => (
                        <option key={asset} value={asset}>{asset}</option>
                      ))}
                    </select>
                    <button onClick={() => alert("Added condition to strategy")} className="text-xs text-blue-500 hover:text-blue-400 flex items-center font-medium">
                      <Plus className="w-3 h-3 mr-1"/> Add Condition
                    </button>
                  </div>
                </div>
                <div className="space-y-3">
                  <ConditionRow logic="IF" indicator="RSI (14)" operator="is less than" value="30" currentValue={rsiValue.toFixed(2)} />
                  <ConditionRow logic="AND" indicator="Price" operator="crosses above" value="EMA (200)" currentValue={`$${currentPrice.toLocaleString()}`} />
                  <ConditionRow logic="AND" indicator="Volume" operator="is greater than" value="SMA (20)" currentValue={smaVolume.toLocaleString()} />
                </div>
              </div>

              <div className="panel p-6">
                <h2 className="text-sm font-semibold text-[#A3A3A3] uppercase tracking-wider mb-4">Execution</h2>
                <div className="flex flex-wrap items-center gap-3 bg-[#1A1A1A] p-4 rounded-lg border border-[#262626]">
                  <span className="font-mono text-emerald-500 font-bold bg-emerald-500/10 px-2 py-1 rounded">THEN BUY</span>
                  <select className="bg-[#0A0A0A] border border-[#262626] rounded px-3 py-1.5 text-sm outline-none text-white">
                    <option>Market Order</option>
                    <option>Limit Order</option>
                  </select>
                  <span className="text-sm text-[#A3A3A3]">with</span>
                  <input type="text" defaultValue="2" className="bg-[#0A0A0A] border border-[#262626] rounded px-3 py-1.5 text-sm w-16 text-center outline-none text-white font-mono" />
                  <span className="text-sm text-[#A3A3A3]">% of Capital</span>
                </div>
              </div>

              <div className="panel p-6">
                <h2 className="text-sm font-semibold text-[#A3A3A3] uppercase tracking-wider mb-4">Exit Rules</h2>
                <div className="space-y-4">
                  <div>
                    <label className="text-xs text-[#A3A3A3] mb-1.5 block">Take Profit (%)</label>
                    <input type="text" defaultValue="5.0" className="w-full bg-[#1A1A1A] border border-[#262626] rounded-lg px-3 py-2 text-sm outline-none focus:border-emerald-500 transition-colors font-mono" />
                  </div>
                  <div>
                    <label className="text-xs text-[#A3A3A3] mb-1.5 block">Stop Loss (%)</label>
                    <input type="text" defaultValue="1.5" className="w-full bg-[#1A1A1A] border border-[#262626] rounded-lg px-3 py-2 text-sm outline-none focus:border-red-500 transition-colors font-mono" />
                  </div>
                  <div className="pt-2 border-t border-[#262626]">
                    <label className="flex items-center gap-2 cursor-pointer mt-2">
                      <input type="checkbox" defaultChecked className="rounded border-[#262626] bg-[#1A1A1A] text-emerald-500 focus:ring-emerald-500 focus:ring-offset-[#0A0A0A]" />
                      <span className="text-sm">Enable Trailing Stop</span>
                    </label>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="panel flex flex-col flex-1 overflow-hidden">
              <div className="p-4 border-b border-[#262626] flex justify-between items-center bg-[#1A1A1A]">
                <div className="flex items-center gap-2">
                  <Terminal className="w-4 h-4 text-blue-500" />
                  <h2 className="text-sm font-semibold text-white">AI Strategy Script</h2>
                </div>
                <label className="flex items-center gap-2 cursor-pointer">
                  <span className="text-xs text-[#A3A3A3]">Manual Override</span>
                  <div className="relative inline-flex items-center">
                    <input type="checkbox" checked={manualOverride} onChange={(e) => setManualOverride(e.target.checked)} className="sr-only peer" />
                    <div className="w-9 h-5 bg-[#262626] peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-blue-500"></div>
                  </div>
                </label>
              </div>
              <div className="p-4 bg-[#0A0A0A] flex-1 overflow-y-auto custom-scrollbar font-mono text-sm text-[#A3A3A3]">
                <pre><code>{pineScriptCode}</code></pre>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// --- Portfolio View Component ---
function PortfolioView({ holdingsData }: { holdingsData: any[] }) {
  return (
    <div className="max-w-6xl mx-auto space-y-6 pb-10">
      <h1 className="text-2xl font-bold tracking-tight mb-6">Portfolio Holdings</h1>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="panel p-6 lg:col-span-1">
          <h2 className="text-sm font-semibold text-[#A3A3A3] uppercase tracking-wider mb-6">Asset Allocation</h2>
          <div className="space-y-4">
            {holdingsData.map(item => (
              <div key={item.symbol}>
                <div className="flex justify-between text-sm mb-1">
                  <span>{item.asset}</span>
                  <span className="font-mono">{item.allocation}%</span>
                </div>
                <div className="w-full bg-[#262626] rounded-full h-2">
                  <div className="bg-emerald-500 h-2 rounded-full" style={{ width: `${item.allocation}%` }}></div>
                </div>
              </div>
            ))}
          </div>
        </div>
        <div className="panel p-0 lg:col-span-2 overflow-hidden">
          <div className="p-4 border-b border-[#262626]">
            <h2 className="text-sm font-semibold text-[#A3A3A3] uppercase tracking-wider">Current Holdings</h2>
          </div>
          <div className="overflow-x-auto">
            <div className="min-w-[500px]">
              <div className="grid grid-cols-4 col-header">
                <div>Asset</div>
                <div>Amount</div>
                <div>Value (USD)</div>
                <div className="text-right">Unrealized PNL</div>
              </div>
              {holdingsData.map((item, idx) => (
                <div key={idx} className="grid grid-cols-4 data-row items-center">
                  <div className="font-semibold text-sm">{item.asset} <span className="text-xs text-[#A3A3A3] ml-1">{item.symbol}</span></div>
                  <div className="data-value">{item.amount}</div>
                  <div className="data-value">${item.value.toLocaleString(undefined, {minimumFractionDigits: 2})}</div>
                  <div className={`text-right data-value ${item.pnl.startsWith('+') ? 'text-emerald-500' : 'text-[#A3A3A3]'}`}>{item.pnl}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// --- Risk Management View Component ---
function RiskManagementView() {
  const [maxRisk, setMaxRisk] = useState(1.0);
  const [maxDrawdown, setMaxDrawdown] = useState(5.0);
  const [haltTrading, setHaltTrading] = useState(true);

  return (
    <div className="max-w-4xl mx-auto space-y-6 pb-10">
      <h1 className="text-2xl font-bold tracking-tight mb-6">Risk Management Engine</h1>
      <div className="panel p-6 border-red-500/30">
        <div className="flex items-center gap-3 mb-4">
          <Shield className="w-6 h-6 text-red-500" />
          <h2 className="text-lg font-semibold text-white">Global Risk Parameters</h2>
        </div>
        <p className="text-sm text-[#A3A3A3] mb-6">These settings act as a hard shield. The AI cannot override these limits under any circumstances.</p>
        
        <div className="space-y-6">
          <div>
            <div className="flex justify-between mb-2">
              <label className="text-sm font-medium">Max Risk Per Trade</label>
              <span className="text-sm font-mono text-emerald-500">{maxRisk.toFixed(1)}%</span>
            </div>
            <input type="range" min="0.1" max="5" step="0.1" value={maxRisk} onChange={(e) => setMaxRisk(parseFloat(e.target.value))} className="w-full accent-emerald-500" />
            <div className="flex justify-between text-xs text-[#A3A3A3] mt-1">
              <span>0.1%</span><span>5.0%</span>
            </div>
          </div>

          <div>
            <div className="flex justify-between mb-2">
              <label className="text-sm font-medium">Max Daily Drawdown (Kill Switch)</label>
              <span className="text-sm font-mono text-red-500">{maxDrawdown.toFixed(1)}%</span>
            </div>
            <input type="range" min="1" max="20" step="0.5" value={maxDrawdown} onChange={(e) => setMaxDrawdown(parseFloat(e.target.value))} className="w-full accent-red-500" />
            <div className="flex justify-between text-xs text-[#A3A3A3] mt-1">
              <span>1.0%</span><span>20.0%</span>
            </div>
          </div>

          <div className="pt-4 border-t border-[#262626] flex items-center justify-between">
            <div>
              <h4 className="font-medium text-sm">Halt Trading on High Volatility</h4>
              <p className="text-xs text-[#A3A3A3] mt-1">Automatically pause AI entries if VIX or ATR spikes.</p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input type="checkbox" checked={haltTrading} onChange={(e) => setHaltTrading(e.target.checked)} className="sr-only peer" />
              <div className="w-11 h-6 bg-[#262626] peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-emerald-500"></div>
            </label>
          </div>
          
          <div className="pt-4 border-t border-[#262626]">
            <button onClick={() => alert("Risk parameters updated securely.")} className="px-4 py-2 bg-[#262626] text-white rounded-lg text-sm font-medium hover:bg-[#404040] transition-colors">
              Save Parameters
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// --- Settings View Component ---
function SettingsView({ onLogout }: { onLogout: () => void }) {
  const [activeSettingsTab, setActiveSettingsTab] = useState('api');

  return (
    <div className="max-w-5xl mx-auto pb-10 h-full flex flex-col">
      <h1 className="text-2xl font-bold tracking-tight mb-6 shrink-0">Settings</h1>
      
      <div className="flex flex-col md:flex-row gap-6 flex-1 overflow-hidden">
        {/* Settings Sidebar */}
        <div className="w-full md:w-64 shrink-0 space-y-1">
          <button onClick={() => setActiveSettingsTab('api')} className={`w-full flex items-center px-4 py-3 rounded-lg text-sm font-medium transition-colors ${activeSettingsTab === 'api' ? 'bg-[#1A1A1A] text-white border border-[#262626]' : 'text-[#A3A3A3] hover:bg-[#1A1A1A] hover:text-white'}`}>
            <Key className="w-4 h-4 mr-3" /> Exchange APIs
          </button>
          <button onClick={() => setActiveSettingsTab('account')} className={`w-full flex items-center px-4 py-3 rounded-lg text-sm font-medium transition-colors ${activeSettingsTab === 'account' ? 'bg-[#1A1A1A] text-white border border-[#262626]' : 'text-[#A3A3A3] hover:bg-[#1A1A1A] hover:text-white'}`}>
            <User className="w-4 h-4 mr-3" /> Account
          </button>
          <button onClick={() => setActiveSettingsTab('security')} className={`w-full flex items-center px-4 py-3 rounded-lg text-sm font-medium transition-colors ${activeSettingsTab === 'security' ? 'bg-[#1A1A1A] text-white border border-[#262626]' : 'text-[#A3A3A3] hover:bg-[#1A1A1A] hover:text-white'}`}>
            <Lock className="w-4 h-4 mr-3" /> Security & 2FA
          </button>
        </div>

        {/* Settings Content */}
        <div className="panel flex-1 p-6 overflow-y-auto">
          {activeSettingsTab === 'api' && (
            <div className="space-y-6">
              <div>
                <h2 className="text-lg font-semibold mb-1">Exchange Connections</h2>
                <p className="text-sm text-[#A3A3A3] mb-6">Connect your exchange accounts to allow the AI to execute trades. Keys are encrypted securely.</p>
              </div>

              {/* Connected Exchange */}
              <div className="bg-[#1A1A1A] border border-[#262626] rounded-lg p-4 flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 bg-[#262626] rounded-full flex items-center justify-center font-bold text-yellow-500">B</div>
                  <div>
                    <h4 className="font-semibold text-sm">Binance</h4>
                    <p className="text-xs text-emerald-500 flex items-center mt-0.5"><CheckCircle2 className="w-3 h-3 mr-1" /> Connected</p>
                  </div>
                </div>
                <button className="text-xs text-red-500 hover:text-red-400 font-medium px-3 py-1.5 bg-red-500/10 rounded">Disconnect</button>
              </div>

              {/* Add New Exchange */}
              <div className="border border-[#262626] rounded-lg p-5 space-y-4">
                <h4 className="font-semibold text-sm">Add New Connection</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs text-[#A3A3A3] mb-1.5 block">Exchange</label>
                    <select className="w-full bg-[#1A1A1A] border border-[#262626] rounded-lg px-3 py-2 text-sm outline-none text-white">
                      <option>Coinbase Pro</option>
                      <option>Kraken</option>
                      <option>Alpaca (Stocks)</option>
                    </select>
                  </div>
                  <div>
                    <label className="text-xs text-[#A3A3A3] mb-1.5 block">API Key</label>
                    <input type="text" placeholder="Paste API Key here" className="w-full bg-[#1A1A1A] border border-[#262626] rounded-lg px-3 py-2 text-sm outline-none focus:border-blue-500 font-mono" />
                  </div>
                  <div className="md:col-span-2">
                    <label className="text-xs text-[#A3A3A3] mb-1.5 block">API Secret</label>
                    <input type="password" placeholder="Paste API Secret here" className="w-full bg-[#1A1A1A] border border-[#262626] rounded-lg px-3 py-2 text-sm outline-none focus:border-blue-500 font-mono" />
                  </div>
                </div>
                <button onClick={() => alert("Exchange connected successfully!")} className="px-4 py-2 bg-emerald-500 text-black rounded-lg text-sm font-semibold hover:bg-emerald-400 transition-colors">
                  Connect Exchange
                </button>
              </div>
            </div>
          )}

          {activeSettingsTab === 'account' && (
            <div className="space-y-6">
              <h2 className="text-lg font-semibold mb-6">Account Details</h2>
              <div className="space-y-4 max-w-md">
                <div>
                  <label className="text-xs text-[#A3A3A3] mb-1.5 block">Email Address</label>
                  <input type="email" defaultValue="trader@coinscanner.com" className="w-full bg-[#1A1A1A] border border-[#262626] rounded-lg px-3 py-2 text-sm text-[#A3A3A3] focus:border-blue-500 outline-none" />
                </div>
                <div>
                  <label className="text-xs text-[#A3A3A3] mb-1.5 block">Display Name</label>
                  <input type="text" defaultValue="Coin Scanner Pro User" className="w-full bg-[#1A1A1A] border border-[#262626] rounded-lg px-3 py-2 text-sm outline-none focus:border-blue-500" />
                </div>
                <button onClick={() => alert("Profile updated successfully!")} className="px-4 py-2 bg-[#262626] text-white rounded-lg text-sm font-medium hover:bg-[#404040] transition-colors">
                  Update Profile
                </button>
              </div>
            </div>
          )}

          {activeSettingsTab === 'security' && (
            <div className="space-y-6">
              <h2 className="text-lg font-semibold mb-6">Security & Authentication</h2>
              <div className="bg-[#1A1A1A] border border-[#262626] rounded-lg p-5 flex items-center justify-between">
                <div>
                  <h4 className="font-semibold text-sm">Two-Factor Authentication (2FA)</h4>
                  <p className="text-xs text-[#A3A3A3] mt-1">Protect your account and API keys with an authenticator app.</p>
                </div>
                <button onClick={() => alert("2FA Setup initiated. Please scan the QR code.")} className="px-4 py-2 bg-emerald-500 text-black rounded-lg text-sm font-semibold hover:bg-emerald-400 transition-colors">
                  Enable 2FA
                </button>
              </div>
              <div className="pt-6 border-t border-[#262626]">
                <button onClick={onLogout} className="flex items-center text-sm font-medium text-red-500 hover:text-red-400 transition-colors">
                  <LogOut className="w-4 h-4 mr-2" /> Sign Out of All Devices
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// --- Helper Components ---
function ConditionRow({ logic, indicator, operator, value, currentValue }: { logic: string, indicator: string, operator: string, value: string, currentValue?: string | number }) {
  return (
    <div className="flex flex-wrap items-center gap-2 bg-[#1A1A1A] p-2.5 rounded-lg border border-[#262626]">
      <span className={`text-xs font-bold px-2 py-1 rounded shrink-0 ${logic === 'IF' ? 'bg-blue-500/10 text-blue-500' : 'bg-[#262626] text-[#A3A3A3]'}`}>
        {logic}
      </span>
      <select className="bg-[#0A0A0A] border border-[#262626] rounded px-2 py-1.5 text-sm outline-none min-w-[120px] flex-1 sm:flex-none text-white">
        <option>{indicator}</option>
        <option>MACD</option>
        <option>EMA (50)</option>
        <option>Volume</option>
      </select>
      <select className="bg-[#0A0A0A] border border-[#262626] rounded px-2 py-1.5 text-sm outline-none min-w-[140px] flex-1 sm:flex-none text-white">
        <option>{operator}</option>
        <option>is greater than</option>
        <option>crosses below</option>
        <option>is equal to</option>
      </select>
      <input type="text" defaultValue={value} className="bg-[#0A0A0A] border border-[#262626] rounded px-3 py-1.5 text-sm w-24 outline-none font-mono flex-1 sm:flex-none text-white" />
      
      {currentValue !== undefined && (
        <div className="flex items-center gap-2 ml-2 px-2 py-1 bg-[#0A0A0A] border border-[#262626] rounded">
          <span className="text-[10px] text-[#A3A3A3] uppercase">Current</span>
          <span className="text-xs font-mono text-emerald-400">{currentValue}</span>
        </div>
      )}

      <button className="ml-auto p-1.5 text-[#A3A3A3] hover:text-red-500 hover:bg-red-500/10 rounded transition-colors shrink-0">
        <X className="w-4 h-4" />
      </button>
    </div>
  );
}

function NavItem({ icon, label, active = false, onClick }: { icon: React.ReactNode, label: string, active?: boolean, onClick?: () => void }) {
  return (
    <button 
      onClick={onClick}
      className={`flex items-center px-3 py-2.5 rounded-xl transition-all duration-200 w-full ${active ? 'bg-gray-800 text-white shadow-sm border border-gray-700/50' : 'text-gray-400 hover:bg-gray-800/50 hover:text-white border border-transparent'}`}
    >
      <div className={`[&>svg]:w-5 [&>svg]:h-5 shrink-0 ${active ? 'text-blue-400' : ''}`}>
        {icon}
      </div>
      <span className="ml-3 text-sm font-medium hidden md:block whitespace-nowrap">{label}</span>
    </button>
  );
}

// --- Auth View Component ---
function AuthView({ onLogin }: { onLogin: () => void }) {
  const [isLogin, setIsLogin] = useState(true);
  const [showGoogleAccounts, setShowGoogleAccounts] = useState(false);
  
  const handleGoogleLogin = () => {
    setShowGoogleAccounts(true);
  };

  const selectGoogleAccount = () => {
    setShowGoogleAccounts(false);
    onLogin();
  };

  return (
    <div className="min-h-screen bg-[#0A0A0A] flex items-center justify-center p-4 text-white font-sans relative overflow-hidden">
      <div className="absolute inset-0 z-0">
        <Aurora
          colorStops={["#5227FF","#7cff67","#5227FF","#ffffff","#ae1e1e"]}
          amplitude={1.4}
          blend={0.5}
        />
      </div>
      
      {/* Google Account Selection Modal */}
      {showGoogleAccounts && (
        <div className="absolute inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="w-full max-w-sm bg-[#141414] border border-[#262626] rounded-2xl shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-200">
            <div className="p-6 border-b border-[#262626] flex flex-col items-center text-center">
              <svg className="w-8 h-8 mb-4" viewBox="0 0 24 24">
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
              </svg>
              <h3 className="text-xl font-medium text-white mb-1">Sign in with Google</h3>
              <p className="text-sm text-[#A3A3A3]">Choose an account to continue to Coin Scanner</p>
            </div>
            <div className="p-2">
              <button onClick={selectGoogleAccount} className="w-full flex items-center gap-4 p-3 hover:bg-[#1A1A1A] rounded-xl transition-colors text-left">
                <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-emerald-500 to-blue-500 flex items-center justify-center text-white font-bold shrink-0">
                  J
                </div>
                <div className="flex-1 overflow-hidden">
                  <div className="font-medium text-sm text-white truncate">John Doe</div>
                  <div className="text-xs text-[#A3A3A3] truncate">john.doe@example.com</div>
                </div>
              </button>
              <button onClick={selectGoogleAccount} className="w-full flex items-center gap-4 p-3 hover:bg-[#1A1A1A] rounded-xl transition-colors text-left mt-1">
                <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-purple-500 to-pink-500 flex items-center justify-center text-white font-bold shrink-0">
                  N
                </div>
                <div className="flex-1 overflow-hidden">
                  <div className="font-medium text-sm text-white truncate">Coin Scanner Trading</div>
                  <div className="text-xs text-[#A3A3A3] truncate">trading@coinscanner.com</div>
                </div>
              </button>
              <div className="h-px bg-[#262626] my-2 mx-3"></div>
              <button onClick={() => setShowGoogleAccounts(false)} className="w-full flex items-center gap-4 p-3 hover:bg-[#1A1A1A] rounded-xl transition-colors text-left">
                <div className="w-10 h-10 rounded-full border border-[#404040] flex items-center justify-center text-[#A3A3A3] shrink-0">
                  <User className="w-5 h-5" />
                </div>
                <div className="font-medium text-sm text-white">Use another account</div>
              </button>
            </div>
            <div className="p-4 border-t border-[#262626] flex justify-end">
              <button onClick={() => setShowGoogleAccounts(false)} className="text-sm font-medium text-[#A3A3A3] hover:text-white px-4 py-2 rounded-lg transition-colors">
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="w-full max-w-md bg-[#141414]/90 backdrop-blur-xl border border-[#262626] rounded-2xl p-8 shadow-2xl relative z-10">
        <div className="flex justify-center mb-8">
          <div className="flex items-center gap-2">
            <Zap className="w-8 h-8 text-emerald-500" />
            <span className="text-2xl font-bold tracking-tight text-white">COIN SCANNER</span>
          </div>
        </div>
        
        <div className="flex bg-[#0A0A0A] p-1 rounded-lg mb-6 border border-[#262626]">
          <button onClick={() => setIsLogin(true)} className={`flex-1 py-2 text-sm font-medium rounded-md transition-colors ${isLogin ? 'bg-[#262626] text-white' : 'text-[#A3A3A3] hover:text-white'}`}>Sign In</button>
          <button onClick={() => setIsLogin(false)} className={`flex-1 py-2 text-sm font-medium rounded-md transition-colors ${!isLogin ? 'bg-[#262626] text-white' : 'text-[#A3A3A3] hover:text-white'}`}>Sign Up</button>
        </div>
        
        <form onSubmit={(e) => { e.preventDefault(); onLogin(); }} className="space-y-4">
          {!isLogin && (
            <div>
              <label className="text-xs text-[#A3A3A3] mb-1.5 block">Full Name</label>
              <input type="text" required className="w-full bg-[#1A1A1A] border border-[#262626] rounded-lg px-4 py-2.5 text-sm outline-none focus:border-emerald-500 text-white transition-colors" placeholder="John Doe" />
            </div>
          )}
          <div>
            <label className="text-xs text-[#A3A3A3] mb-1.5 block">Email Address</label>
            <input type="email" required className="w-full bg-[#1A1A1A] border border-[#262626] rounded-lg px-4 py-2.5 text-sm outline-none focus:border-emerald-500 text-white transition-colors" placeholder="you@example.com" />
          </div>
          <div>
            <label className="text-xs text-[#A3A3A3] mb-1.5 block">Password</label>
            <input type="password" required className="w-full bg-[#1A1A1A] border border-[#262626] rounded-lg px-4 py-2.5 text-sm outline-none focus:border-emerald-500 text-white transition-colors" placeholder="••••••••" />
          </div>
          <button type="submit" className="w-full py-2.5 bg-emerald-500 text-black rounded-lg text-sm font-semibold hover:bg-emerald-400 transition-colors mt-2">
            {isLogin ? 'Sign In' : 'Create Account'}
          </button>
        </form>

        <div className="my-6 flex items-center">
          <div className="flex-1 border-t border-[#262626]"></div>
          <span className="px-3 text-xs text-[#A3A3A3] uppercase tracking-wider">Or continue with</span>
          <div className="flex-1 border-t border-[#262626]"></div>
        </div>

        <div className="space-y-3">
          <button onClick={handleGoogleLogin} type="button" className="w-full flex items-center justify-center gap-3 py-2.5 bg-[#1A1A1A] border border-[#262626] rounded-lg text-sm font-medium hover:bg-[#262626] transition-colors text-white">
            <svg className="w-5 h-5" viewBox="0 0 24 24">
              <path fill="currentColor" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
              <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
              <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
              <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
            </svg>
            Google
          </button>
          <button onClick={onLogin} type="button" className="w-full flex items-center justify-center gap-3 py-2.5 bg-[#1A1A1A] border border-[#262626] rounded-lg text-sm font-medium hover:bg-[#262626] transition-colors text-white">
            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
              <path d="M12 2C6.477 2 2 6.477 2 12c0 4.42 2.865 8.166 6.839 9.489.5.092.682-.217.682-.482 0-.237-.008-.866-.013-1.7-2.782.603-3.369-1.34-3.369-1.34-.454-1.156-1.11-1.462-1.11-1.462-.908-.62.069-.608.069-.608 1.003.07 1.531 1.03 1.531 1.03.892 1.529 2.341 1.087 2.91.831.092-.646.35-1.086.636-1.336-2.22-.253-4.555-1.11-4.555-4.943 0-1.091.39-1.984 1.029-2.683-.103-.253-.446-1.27.098-2.647 0 0 .84-.269 2.75 1.025A9.564 9.564 0 0112 6.844c.85.004 1.705.114 2.504.336 1.909-1.294 2.747-1.025 2.747-1.025.546 1.379.203 2.394.1 2.647.64.699 1.028 1.592 1.028 2.683 0 3.842-2.339 4.687-4.566 4.935.359.309.678.919.678 1.852 0 1.336-.012 2.415-.012 2.743 0 .267.18.578.688.48C19.138 20.161 22 16.416 22 12c0-5.523-4.477-10-10-10z" />
            </svg>
            GitHub
          </button>
          <button onClick={onLogin} type="button" className="w-full flex items-center justify-center gap-3 py-2.5 bg-[#1A1A1A] border border-[#262626] rounded-lg text-sm font-medium hover:bg-[#262626] transition-colors text-white">
            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
              <path d="M12.152 6.896c-.948 0-2.415-1.078-3.96-1.04-2.04.027-3.91 1.183-4.961 3.014-2.117 3.675-.546 9.103 1.519 12.09 1.013 1.454 2.208 3.09 3.792 3.039 1.52-.065 2.09-.987 3.935-.987 1.831 0 2.43.987 3.96.948 1.637-.026 2.62-1.496 3.603-2.947 1.156-1.689 1.636-3.325 1.662-3.415-.039-.013-3.182-1.221-3.22-4.857-.026-3.04 2.48-4.494 2.597-4.559-1.429-2.09-3.623-2.324-4.39-2.376-2-.156-3.675 1.09-4.537 1.09zM15.53 3.83c.843-1.012 1.4-2.427 1.245-3.83-1.207.052-2.662.805-3.532 1.818-.78.896-1.454 2.338-1.273 3.714 1.338.104 2.715-.688 3.56-1.702z" />
            </svg>
            Apple
          </button>
        </div>
      </div>
    </div>
  );
}

// --- New Components ---

function WhaleTrackerView({ whales }: { whales: any[] }) {
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Whale Tracker</h1>
        <div className="flex gap-2">
          <button onClick={() => alert("Filter functionality opened")} className="bg-[#1A1A1A] hover:bg-[#262626] border border-[#262626] rounded px-3 py-1.5 text-sm transition-colors flex items-center gap-2">
            <Search className="w-4 h-4" /> Filter
          </button>
        </div>
      </div>

      <div className="panel overflow-hidden">
        <div className="p-4 border-b border-[#262626] flex justify-between items-center">
          <h2 className="text-sm font-semibold text-[#A3A3A3] uppercase tracking-wider">Large Transactions (&gt; $1M)</h2>
          <span className="flex items-center text-[10px] font-medium text-emerald-500 bg-emerald-500/10 px-2 py-0.5 rounded animate-pulse">
            LIVE STREAM
          </span>
        </div>
        
        <div className="overflow-x-auto">
          <div className="min-w-[800px]">
            <div className="grid grid-cols-7 col-header">
              <div className="col-span-1">Time</div>
              <div className="col-span-1">Asset</div>
              <div className="col-span-1">Type</div>
              <div className="col-span-1">Amount</div>
              <div className="col-span-1">Value (USD)</div>
              <div className="col-span-1">Exchange</div>
              <div className="col-span-1 text-right">Action</div>
            </div>
            
            {whales.map((whale) => (
              <div key={whale.id} className="grid grid-cols-7 data-row items-center hover:bg-[#1A1A1A] transition-colors">
                <div className="col-span-1 data-value text-[#A3A3A3]">{whale.time}</div>
                <div className="col-span-1 font-semibold text-sm">{whale.asset}</div>
                <div className="col-span-1 flex items-center gap-2">
                  {whale.icon}
                  <span className={`text-xs px-2 py-1 rounded font-mono ${
                    whale.type === 'BUY' ? 'bg-emerald-500/10 text-emerald-500' : 
                    whale.type === 'SELL' ? 'bg-red-500/10 text-red-500' : 
                    'bg-yellow-500/10 text-yellow-500'
                  }`}>
                    {whale.type}
                  </span>
                </div>
                <div className="col-span-1 data-value">{whale.amount}</div>
                <div className="col-span-1 data-value font-bold text-white">{whale.value}</div>
                <div className="col-span-1 data-value text-[#A3A3A3]">{whale.exchange}</div>
                <div className="col-span-1 text-right">
                  <button onClick={() => alert(`Reviewing copy trade for ${whale.asset}`)} className="text-xs text-blue-500 hover:text-blue-400 font-medium bg-blue-500/10 px-2 py-1 rounded">
                    Copy Trade
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
