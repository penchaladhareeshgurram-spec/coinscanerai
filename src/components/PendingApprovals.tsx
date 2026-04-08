import React, { useState, useEffect } from 'react';
import { BellRing, CheckCircle2, XCircle, Target } from 'lucide-react';

interface Approval {
  id: string;
  asset: string;
  type: 'LONG' | 'SHORT';
  entry: number;
  reason: string;
}

export function PendingApprovals() {
  const [approvals, setApprovals] = useState<Approval[]>([]);

  // Simulate incoming AI signals that need manual approval
  useEffect(() => {
    const timer = setTimeout(() => {
      setApprovals([
        {
          id: '1',
          asset: 'ETH/USD',
          type: 'LONG',
          entry: 3450.25,
          reason: 'RSI Divergence + MACD Crossover detected on 1H timeframe.'
        }
      ]);
    }, 5000); // Show after 5 seconds for demo purposes

    return () => clearTimeout(timer);
  }, []);

  const handleAction = (id: string, action: 'approve' | 'ignore') => {
    setApprovals(prev => prev.filter(a => a.id !== id));
    // In a real app, 'approve' would trigger the API call to the broker
    if (action === 'approve') {
      console.log(`Trade ${id} approved. Sending to broker...`);
    } else {
      console.log(`Trade ${id} ignored.`);
    }
  };

  if (approvals.length === 0) return null;

  return (
    <div className="fixed bottom-6 right-6 z-50 flex flex-col gap-4 w-80">
      {approvals.map(approval => (
        <div key={approval.id} className="bg-[#141414] border border-blue-500/30 rounded-xl shadow-2xl shadow-blue-500/10 overflow-hidden animate-in slide-in-from-right-8 fade-in duration-300">
          <div className="bg-blue-500/10 p-3 border-b border-blue-500/20 flex items-center gap-2">
            <div className="relative">
              <BellRing className="w-4 h-4 text-blue-500" />
              <div className="absolute -top-1 -right-1 w-2 h-2 bg-blue-500 rounded-full animate-ping"></div>
            </div>
            <h3 className="text-xs font-bold text-blue-500 uppercase tracking-wider">Manual Approval Required</h3>
          </div>
          
          <div className="p-4">
            <div className="flex justify-between items-center mb-3">
              <div className="flex items-center gap-2">
                <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${approval.type === 'LONG' ? 'bg-emerald-500/20 text-emerald-500' : 'bg-red-500/20 text-red-500'}`}>
                  {approval.type}
                </span>
                <span className="font-bold text-lg">{approval.asset}</span>
              </div>
              <div className="text-right">
                <div className="text-xs text-[#A3A3A3]">Entry Price</div>
                <div className="font-mono font-bold">${approval.entry.toLocaleString()}</div>
              </div>
            </div>
            
            <div className="bg-[#0A0A0A] p-2.5 rounded border border-[#262626] mb-4">
              <div className="flex items-center gap-1.5 mb-1 text-xs text-[#737373]">
                <Target className="w-3 h-3" /> AI Signal Reason
              </div>
              <p className="text-xs text-[#A3A3A3] leading-relaxed">{approval.reason}</p>
            </div>

            <div className="flex gap-2">
              <button 
                onClick={() => handleAction(approval.id, 'approve')}
                className="flex-1 bg-emerald-500 hover:bg-emerald-400 text-black py-2 rounded-lg text-sm font-bold flex items-center justify-center gap-1.5 transition-colors"
              >
                <CheckCircle2 className="w-4 h-4" /> BUY
              </button>
              <button 
                onClick={() => handleAction(approval.id, 'ignore')}
                className="flex-1 bg-[#1A1A1A] hover:bg-[#262626] border border-[#262626] text-[#A3A3A3] hover:text-white py-2 rounded-lg text-sm font-bold flex items-center justify-center gap-1.5 transition-colors"
              >
                <XCircle className="w-4 h-4" /> IGNORE
              </button>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
