import React, { useState, useEffect, useRef } from 'react';
import { 
  Activity, BarChart2, Briefcase, Settings, Shield, 
  TrendingUp, TrendingDown, Zap, Bell, Search,
  Play, Square, AlertTriangle, GitBranch, Plus, Save, PlayCircle, X,
  Key, Lock, User, CheckCircle2, LogOut, ChevronDown, ArrowUpRight, ArrowDownRight,
  Layers, Eye, Cpu, Target, Crosshair
} from 'lucide-react';
import { 
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  AreaChart, Area
} from 'recharts';
import { Aurora } from './components/Aurora';
import SplitText from './components/SplitText';

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
  'S&P 500': { name: 'S&P 500 Index', price: 5120.50, change: -0.5, history: generateHistory(5120, 2, 60), liquidity: 8500000000, spread: 0.01 },
  'GOLD': { name: 'Gold Ounce', price: 2340.80, change: 0.2, history: generateHistory(2340, 1, 60), liquidity: 500000000, spread: 0.05 },
  'AAPL': { name: 'Apple Inc.', price: 174.80, change: -0.22, history: generateHistory(175, 0.5, 60), liquidity: 3200000000, spread: 0.01 },
  'EUR/USD': { name: 'Euro / US Dollar', price: 1.0850, change: 0.27, history: generateHistory(1.0850, 0.001, 60), liquidity: 15000000000, spread: 0.005 },
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

// --- Main App Component ---
export default function App() {
  const [showIntro, setShowIntro] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [activeTab, setActiveTab] = useState('dashboard');
  const [botActive, setBotActive] = useState(true);
  const [showNotifications, setShowNotifications] = useState(false);
  const notifRef = useRef<HTMLDivElement>(null);

  const [isDemoMode, setIsDemoMode] = useState(true);
  const [demoBalance, setDemoBalance] = useState(100000);
  const [liveBalance, setLiveBalance] = useState(0);

  const [marketsData, setMarketsData] = useState(initialMarketsData);
  const [activeTrades, setActiveTrades] = useState(initialActiveTrades);
  const [holdingsData, setHoldingsData] = useState(initialHoldingsData);
  const [notificationsData, setNotificationsData] = useState(initialNotificationsData);
  const [performanceData, setPerformanceData] = useState(initialPerformanceData);

  const handleManualTrade = (asset: string, type: 'LONG' | 'SHORT') => {
    const market = marketsData[asset as keyof typeof marketsData];
    if (!market) return;

    const tradeAmount = 5000; // Fixed amount for manual trades for now
    const currentBalance = isDemoMode ? demoBalance : liveBalance;
    
    if (currentBalance < tradeAmount) {
      alert("Insufficient balance");
      return;
    }

    if (isDemoMode) {
      setDemoBalance(prev => prev - tradeAmount);
    } else {
      setLiveBalance(prev => prev - tradeAmount);
    }

    const newTrade = {
      id: `TRD-${Math.floor(Math.random() * 10000)}`,
      asset: asset,
      type: type,
      entry: market.price,
      current: market.price,
      pnl: '+0.00%',
      pnlVal: 0.00,
      risk: 'Manual',
      maxPnl: 0
    };

    setActiveTrades(prev => [newTrade, ...prev]);
    
    setNotificationsData(nPrev => [{
      id: Date.now(),
      type: type === 'LONG' ? 'BUY' : 'SELL',
      asset: asset,
      price: `$${market.price.toLocaleString()}`,
      time: 'Just now',
      msg: `Manual ${type} position executed on ${asset}.`
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
          const lastPrice = market.price;
          let volatility = 1;
          if (key === 'BTC/USD') volatility = 40;
          if (key === 'ETH/USD') volatility = 5;
          if (key === 'S&P 500') volatility = 2;
          if (key === 'EUR/USD') volatility = 0.0005;

          const change = (Math.random() - 0.5) * volatility;
          const newPrice = Number((lastPrice + change).toFixed(key === 'EUR/USD' ? 4 : 2));
          const newChangePct = Number((market.change + (change / lastPrice) * 10).toFixed(2));

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
    }, 2000);
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
    }, 1000);
  };

  if (showIntro) {
    return (
      <div className="min-h-screen bg-[#0A0A0A] flex items-center justify-center p-4 text-white font-sans">
        <SplitText
          text={`Hello, you! ,\n Welcome to coin scanner`}
          className="text-4xl md:text-5xl font-semibold text-center leading-tight"
          delay={130}
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
    );
  }

  if (!isAuthenticated) {
    return <AuthView onLogin={() => setIsAuthenticated(true)} />;
  }

  return (
    <div className="flex h-screen overflow-hidden bg-[#0A0A0A] text-white font-sans">
      {/* Sidebar */}
      <aside className="w-16 md:w-64 border-r border-[#262626] bg-[#141414] flex flex-col transition-all shrink-0">
        <div className="h-16 flex items-center justify-center md:justify-start md:px-6 border-b border-[#262626]">
          <Zap className="w-6 h-6 text-emerald-500 shrink-0" />
          <span className="ml-3 font-bold text-lg hidden md:block tracking-tight">COIN SCANNER</span>
        </div>
        
        <nav className="flex-1 py-6 flex flex-col gap-2 px-3 overflow-y-auto">
          <NavItem icon={<Activity />} label="Dashboard" active={activeTab === 'dashboard'} onClick={() => setActiveTab('dashboard')} />
          <NavItem icon={<BarChart2 />} label="Markets" active={activeTab === 'markets'} onClick={() => setActiveTab('markets')} />
          <NavItem icon={<Layers />} label="Liquidity & Depth" active={activeTab === 'liquidity'} onClick={() => setActiveTab('liquidity')} />
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
          {activeTab === 'dashboard' && <DashboardView botActive={botActive} setBotActive={setBotActive} activeTrades={activeTrades} performanceData={performanceData} marketsData={marketsData} isDemoMode={isDemoMode} demoBalance={demoBalance} liveBalance={liveBalance} onManualTrade={handleManualTrade} />}
          {activeTab === 'markets' && <MarketsView marketsData={marketsData} onManualTrade={handleManualTrade} />}
          {activeTab === 'liquidity' && <LiquidityView marketsData={marketsData} orderBook={initialOrderBook} />}
          {activeTab === 'whales' && <WhaleTrackerView whales={initialWhales} />}
          {activeTab === 'strategy' && <StrategyBuilderView />}
          {activeTab === 'portfolio' && <PortfolioView holdingsData={holdingsData} />}
          {activeTab === 'risk' && <RiskManagementView />}
          {activeTab === 'settings' && <SettingsView onLogout={() => setIsAuthenticated(false)} />}
        </div>
      </main>
    </div>
  );
}

// --- Dashboard View Component ---
function DashboardView({ botActive, setBotActive, activeTrades, performanceData, marketsData, isDemoMode, demoBalance, liveBalance, onManualTrade }: { botActive: boolean, setBotActive: (val: boolean) => void, activeTrades: any[], performanceData: any[], marketsData: any, isDemoMode: boolean, demoBalance: number, liveBalance: number, onManualTrade: (asset: string, type: 'LONG' | 'SHORT') => void }) {
  const currentBalance = isDemoMode ? demoBalance : liveBalance;
  
  return (
    <div className="flex flex-col gap-6 pb-10">
      <div className="flex flex-col lg:flex-row gap-6">
        {/* Portfolio Summary */}
        <div className="panel flex-1 p-6">
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
        <div className="panel w-full lg:w-80 p-6 flex flex-col shrink-0">
          <h2 className="text-sm font-semibold text-[#A3A3A3] uppercase tracking-wider mb-4">AI Risk Engine</h2>
          
          <div className="space-y-4 flex-1">
            <div className="bg-[#1A1A1A] p-4 rounded-lg border border-[#262626]">
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm text-[#A3A3A3]">Current Drawdown</span>
                <span className="font-mono text-emerald-500">0.4%</span>
              </div>
              <div className="w-full bg-[#262626] rounded-full h-1.5">
                <div className="bg-emerald-500 h-1.5 rounded-full" style={{ width: '10%' }}></div>
              </div>
            </div>

            <div className="bg-[#1A1A1A] p-4 rounded-lg border border-[#262626]">
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm text-[#A3A3A3]">Daily Risk Limit</span>
                <span className="font-mono text-white">1.2% / 2.0%</span>
              </div>
              <div className="w-full bg-[#262626] rounded-full h-1.5">
                <div className="bg-blue-500 h-1.5 rounded-full" style={{ width: '60%' }}></div>
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
      </div>

      <div className="flex flex-col xl:flex-row gap-6">
        {/* Active Trades */}
        <div className="panel flex-1 overflow-hidden flex flex-col">
          <div className="p-4 border-b border-[#262626] flex justify-between items-center">
            <h2 className="text-sm font-semibold text-[#A3A3A3] uppercase tracking-wider">Active AI Trades</h2>
            <button className="text-xs text-blue-500 hover:text-blue-400 font-medium">View All</button>
          </div>
          
          <div className="overflow-x-auto">
            <div className="min-w-[600px]">
              <div className="grid grid-cols-6 col-header">
                <div className="col-span-1">Asset</div>
                <div className="col-span-1">Type</div>
                <div className="col-span-1">Entry</div>
                <div className="col-span-1">Current</div>
                <div className="col-span-1">Risk</div>
                <div className="col-span-1 text-right">PNL</div>
              </div>
              
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
            </div>
          </div>
        </div>

        {/* AI Predictive Signals */}
        <div className="panel w-full xl:w-96 flex flex-col shrink-0">
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
                  <div className="flex items-center text-xs font-mono text-blue-400 bg-blue-500/10 px-1.5 py-0.5 rounded">
                    <Target className="w-3 h-3 mr-1" /> {signal.probability}% Prob
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
      </div>
    </div>
  );
}

// --- Markets View Component (Live Updating) ---
function MarketsView({ marketsData, onManualTrade }: { marketsData: any, onManualTrade: (asset: string, type: 'LONG' | 'SHORT') => void }) {
  const [selectedMarket, setSelectedMarket] = useState('BTC/USD');

  const market = marketsData[selectedMarket as keyof typeof marketsData];
  const isPositive = market.change >= 0;

  return (
    <div className="flex flex-col md:flex-row gap-6 h-full min-h-[600px] pb-10">
      <div className="panel w-full md:w-80 flex flex-col shrink-0 overflow-hidden h-[600px] md:h-auto">
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
          <div className="flex bg-[#1A1A1A] rounded-lg p-1 border border-[#262626] self-start sm:self-auto">
            {['1H', '1D', '1W', '1M', '1Y'].map(tf => (
              <button key={tf} className={`px-3 py-1 text-xs font-medium rounded-md ${tf === '1H' ? 'bg-[#262626] text-white' : 'text-[#A3A3A3] hover:text-white'}`}>
                {tf}
              </button>
            ))}
          </div>
        </div>

        <div className="flex-1 p-6">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={market.history}>
              <defs>
                <linearGradient id="colorPrice" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor={isPositive ? '#10B981' : '#EF4444'} stopOpacity={0.3}/>
                  <stop offset="95%" stopColor={isPositive ? '#10B981' : '#EF4444'} stopOpacity={0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#262626" vertical={false} />
              <XAxis dataKey="time" stroke="#A3A3A3" fontSize={12} tickLine={false} axisLine={false} minTickGap={30} />
              <YAxis stroke="#A3A3A3" fontSize={12} tickLine={false} axisLine={false} tickFormatter={(val) => `$${val.toLocaleString()}`} domain={['auto', 'auto']} width={80} orientation="right" />
              <Tooltip contentStyle={{ backgroundColor: '#141414', borderColor: '#262626', borderRadius: '8px' }} itemStyle={{ color: isPositive ? '#10B981' : '#EF4444', fontFamily: 'JetBrains Mono' }} labelStyle={{ color: '#A3A3A3', marginBottom: '4px' }} />
              <Area type="monotone" dataKey="price" stroke={isPositive ? '#10B981' : '#EF4444'} strokeWidth={2} fillOpacity={1} fill="url(#colorPrice)" isAnimationActive={false} />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}

// --- Strategy Builder View Component ---
function StrategyBuilderView() {
  return (
    <div className="max-w-6xl mx-auto space-y-6 pb-10">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Strategy Builder</h1>
          <p className="text-[#A3A3A3] text-sm mt-1">Design, backtest, and deploy custom trading conditions.</p>
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

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <div className="panel p-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-sm font-semibold text-[#A3A3A3] uppercase tracking-wider">Entry Conditions</h2>
              <button className="text-xs text-blue-500 hover:text-blue-400 flex items-center font-medium">
                <Plus className="w-3 h-3 mr-1"/> Add Condition
              </button>
            </div>
            <div className="space-y-3">
              <ConditionRow logic="IF" indicator="RSI (14)" operator="is less than" value="30" />
              <ConditionRow logic="AND" indicator="Price" operator="crosses above" value="EMA (200)" />
              <ConditionRow logic="AND" indicator="Volume" operator="is greater than" value="SMA (20)" />
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
        </div>

        <div className="space-y-6">
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
              <span className="text-sm font-mono text-emerald-500">1.0%</span>
            </div>
            <input type="range" min="0.1" max="5" step="0.1" defaultValue="1" className="w-full accent-emerald-500" />
            <div className="flex justify-between text-xs text-[#A3A3A3] mt-1">
              <span>0.1%</span><span>5.0%</span>
            </div>
          </div>

          <div>
            <div className="flex justify-between mb-2">
              <label className="text-sm font-medium">Max Daily Drawdown (Kill Switch)</label>
              <span className="text-sm font-mono text-red-500">5.0%</span>
            </div>
            <input type="range" min="1" max="20" step="0.5" defaultValue="5" className="w-full accent-red-500" />
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
              <input type="checkbox" defaultChecked className="sr-only peer" />
              <div className="w-11 h-6 bg-[#262626] peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-emerald-500"></div>
            </label>
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
                <button className="px-4 py-2 bg-emerald-500 text-black rounded-lg text-sm font-semibold hover:bg-emerald-400 transition-colors">
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
                  <input type="email" defaultValue="trader@coinscanner.com" disabled className="w-full bg-[#1A1A1A] border border-[#262626] rounded-lg px-3 py-2 text-sm text-[#A3A3A3] cursor-not-allowed" />
                </div>
                <div>
                  <label className="text-xs text-[#A3A3A3] mb-1.5 block">Display Name</label>
                  <input type="text" defaultValue="Coin Scanner Pro User" className="w-full bg-[#1A1A1A] border border-[#262626] rounded-lg px-3 py-2 text-sm outline-none focus:border-blue-500" />
                </div>
                <button className="px-4 py-2 bg-[#262626] text-white rounded-lg text-sm font-medium hover:bg-[#404040] transition-colors">
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
                <button className="px-4 py-2 bg-emerald-500 text-black rounded-lg text-sm font-semibold hover:bg-emerald-400 transition-colors">
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
function ConditionRow({ logic, indicator, operator, value }: { logic: string, indicator: string, operator: string, value: string }) {
  return (
    <div className="flex flex-wrap items-center gap-2 bg-[#1A1A1A] p-2.5 rounded-lg border border-[#262626]">
      <span className={`text-xs font-bold px-2 py-1 rounded shrink-0 ${logic === 'IF' ? 'bg-blue-500/10 text-blue-500' : 'bg-[#262626] text-[#A3A3A3]'}`}>
        {logic}
      </span>
      <select className="bg-[#0A0A0A] border border-[#262626] rounded px-2 py-1.5 text-sm outline-none min-w-[120px] flex-1 sm:flex-none">
        <option>{indicator}</option>
        <option>MACD</option>
        <option>EMA (50)</option>
        <option>Volume</option>
      </select>
      <select className="bg-[#0A0A0A] border border-[#262626] rounded px-2 py-1.5 text-sm outline-none min-w-[140px] flex-1 sm:flex-none">
        <option>{operator}</option>
        <option>is greater than</option>
        <option>crosses below</option>
        <option>is equal to</option>
      </select>
      <input type="text" defaultValue={value} className="bg-[#0A0A0A] border border-[#262626] rounded px-3 py-1.5 text-sm w-24 outline-none font-mono flex-1 sm:flex-none" />
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
      className={`flex items-center px-3 py-2.5 rounded-lg transition-colors w-full ${active ? 'bg-[#1A1A1A] text-white border border-[#262626]' : 'text-[#A3A3A3] hover:bg-[#1A1A1A] hover:text-white border border-transparent'}`}
    >
      <div className={`[&>svg]:w-5 [&>svg]:h-5 shrink-0 ${active ? 'text-emerald-500' : ''}`}>
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

function LiquidityView({ marketsData, orderBook }: { marketsData: any, orderBook: any }) {
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Liquidity & Depth</h1>
        <div className="flex gap-2">
          <select className="bg-[#1A1A1A] border border-[#262626] rounded px-3 py-1.5 text-sm outline-none focus:border-blue-500">
            <option>BTC/USD</option>
            <option>ETH/USD</option>
            <option>SOL/USD</option>
          </select>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Order Book Table */}
        <div className="panel col-span-1 flex flex-col h-[600px]">
          <div className="p-4 border-b border-[#262626]">
            <h2 className="text-sm font-semibold text-[#A3A3A3] uppercase tracking-wider">Order Book (L2)</h2>
          </div>
          <div className="flex-1 overflow-y-auto p-2 font-mono text-sm">
            <div className="grid grid-cols-3 text-[#737373] text-xs mb-2 px-2">
              <div>Price</div>
              <div className="text-right">Size</div>
              <div className="text-right">Total</div>
            </div>
            
            {/* Asks (Sells) */}
            <div className="flex flex-col-reverse mb-4">
              {orderBook.asks.map((ask: any, i: number) => (
                <div key={i} className="grid grid-cols-3 px-2 py-1 hover:bg-[#1A1A1A] relative group">
                  <div className="absolute right-0 top-0 bottom-0 bg-red-500/10 z-0" style={{ width: `${(ask.total / 70) * 100}%` }}></div>
                  <div className="text-red-500 z-10">{ask.price.toFixed(2)}</div>
                  <div className="text-right z-10">{ask.size.toFixed(2)}</div>
                  <div className="text-right z-10">{ask.total.toFixed(2)}</div>
                </div>
              ))}
            </div>
            
            {/* Spread */}
            <div className="py-2 text-center border-y border-[#262626] text-[#A3A3A3] text-xs flex justify-center items-center gap-4">
              <span>Spread: ${(orderBook.asks[0].price - orderBook.bids[0].price).toFixed(2)}</span>
              <span>Mark: $65,100.25</span>
            </div>

            {/* Bids (Buys) */}
            <div className="mt-4">
              {orderBook.bids.map((bid: any, i: number) => (
                <div key={i} className="grid grid-cols-3 px-2 py-1 hover:bg-[#1A1A1A] relative group">
                  <div className="absolute right-0 top-0 bottom-0 bg-emerald-500/10 z-0" style={{ width: `${(bid.total / 60) * 100}%` }}></div>
                  <div className="text-emerald-500 z-10">{bid.price.toFixed(2)}</div>
                  <div className="text-right z-10">{bid.size.toFixed(2)}</div>
                  <div className="text-right z-10">{bid.total.toFixed(2)}</div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Depth Chart */}
        <div className="panel col-span-1 lg:col-span-2 flex flex-col h-[600px]">
          <div className="p-4 border-b border-[#262626] flex justify-between items-center">
            <h2 className="text-sm font-semibold text-[#A3A3A3] uppercase tracking-wider">Depth Chart & Liquidity Walls</h2>
          </div>
          <div className="flex-1 p-4 flex items-center justify-center relative">
            {/* Mocking a depth chart visually for the dashboard */}
            <div className="absolute inset-0 p-8 flex items-end">
               <div className="w-1/2 h-full flex items-end justify-end border-b border-[#262626]">
                  {/* Bids Area */}
                  <div className="w-full h-[30%] bg-emerald-500/20 border-t border-emerald-500 relative">
                     <div className="absolute right-[20%] bottom-0 w-[10%] h-[150%] bg-emerald-500/40 border-t border-emerald-500 flex items-start justify-center">
                        <span className="text-[10px] text-emerald-500 -mt-5 bg-[#0A0A0A] px-1">Buy Wall (65k)</span>
                     </div>
                  </div>
               </div>
               <div className="w-1/2 h-full flex items-end justify-start border-b border-[#262626]">
                  {/* Asks Area */}
                  <div className="w-full h-[40%] bg-red-500/20 border-t border-red-500 relative">
                     <div className="absolute left-[30%] bottom-0 w-[15%] h-[180%] bg-red-500/40 border-t border-red-500 flex items-start justify-center">
                        <span className="text-[10px] text-red-500 -mt-5 bg-[#0A0A0A] px-1">Sell Wall (65.2k)</span>
                     </div>
                  </div>
               </div>
            </div>
            <div className="absolute bottom-2 left-0 right-0 flex justify-between px-8 text-xs text-[#737373] font-mono">
              <span>64,500</span>
              <span>65,100</span>
              <span>65,500</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function WhaleTrackerView({ whales }: { whales: any[] }) {
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Whale Tracker</h1>
        <div className="flex gap-2">
          <button className="bg-[#1A1A1A] hover:bg-[#262626] border border-[#262626] rounded px-3 py-1.5 text-sm transition-colors flex items-center gap-2">
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
                  <button className="text-xs text-blue-500 hover:text-blue-400 font-medium bg-blue-500/10 px-2 py-1 rounded">
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
