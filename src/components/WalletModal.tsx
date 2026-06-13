import React, { useState } from 'react';
import { X, ArrowDownCircle, ArrowUpCircle, CreditCard, Landmark } from 'lucide-react';

interface WalletModalProps {
  isOpen: boolean;
  onClose: () => void;
  balance: number;
  onDeposit: (amount: number) => void;
  onWithdraw: (amount: number) => void;
}

export const WalletModal: React.FC<WalletModalProps> = ({ isOpen, onClose, balance, onDeposit, onWithdraw }) => {
  const [activeTab, setActiveTab] = useState<'deposit' | 'withdraw'>('deposit');
  const [amount, setAmount] = useState<string>('');
  const [method, setMethod] = useState<'card' | 'bank'>('card');
  const [loading, setLoading] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSuccessMsg('');
    setErrorMsg('');
    
    const val = parseFloat(amount);
    if (isNaN(val) || val <= 0) {
      setErrorMsg('Please enter a valid amount greater than 0.');
      return;
    }

    if (activeTab === 'withdraw' && val > balance) {
      setErrorMsg('Insufficient balance for withdrawal.');
      return;
    }

    setLoading(true);

    // Simulate API call for payment processing
    setTimeout(() => {
      setLoading(false);
      if (activeTab === 'deposit') {
        onDeposit(val);
        setSuccessMsg(`Successfully deposited $${val.toLocaleString()}`);
      } else {
        onWithdraw(val);
        setSuccessMsg(`Successfully withdrawn $${val.toLocaleString()}`);
      }
      setAmount('');
      
      // Auto close after success
      setTimeout(() => {
        onClose();
        setSuccessMsg('');
      }, 2000);
    }, 1500);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in">
      <div className="bg-[#0A0A0A] border border-[#262626] rounded-xl shadow-2xl w-full max-w-md overflow-hidden flex flex-col relative">
        <div className="flex items-center justify-between p-4 border-b border-[#262626]">
          <h2 className="text-lg font-bold text-white">Wallet & Funding</h2>
          <button onClick={onClose} className="p-1 text-[#A3A3A3] hover:text-white rounded-md hover:bg-[#1A1A1A] transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6">
          <div className="bg-[#1A1A1A] border border-[#262626] rounded-lg p-4 mb-6 flex flex-col items-center justify-center">
            <span className="text-xs text-[#A3A3A3] uppercase tracking-wider mb-1">Available Balance</span>
            <span className="text-3xl font-mono text-white">${balance.toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})}</span>
          </div>

          <div className="flex bg-[#1A1A1A] rounded-lg p-1 mb-6 border border-[#262626]">
            <button 
              onClick={() => { setActiveTab('deposit'); setSuccessMsg(''); setErrorMsg(''); }}
              className={`flex-1 flex justify-center items-center gap-2 py-2 text-sm font-medium rounded-md transition-colors ${activeTab === 'deposit' ? 'bg-[#262626] text-white' : 'text-[#A3A3A3] hover:text-white'}`}
            >
              <ArrowDownCircle className="w-4 h-4" /> Deposit
            </button>
            <button 
              onClick={() => { setActiveTab('withdraw'); setSuccessMsg(''); setErrorMsg(''); }}
              className={`flex-1 flex justify-center items-center gap-2 py-2 text-sm font-medium rounded-md transition-colors ${activeTab === 'withdraw' ? 'bg-[#262626] text-white' : 'text-[#A3A3A3] hover:text-white'}`}
            >
              <ArrowUpCircle className="w-4 h-4" /> Withdraw
            </button>
          </div>

          {successMsg && (
            <div className="mb-4 p-3 bg-emerald-500/20 border border-emerald-500/50 rounded-lg text-emerald-400 text-sm font-medium text-center">
              {successMsg}
            </div>
          )}

          {errorMsg && (
            <div className="mb-4 p-3 bg-red-500/20 border border-red-500/50 rounded-lg text-red-400 text-sm font-medium text-center">
              {errorMsg}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="text-xs text-[#A3A3A3] mb-1.5 block">Amount (USD)</label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-[#A3A3A3] font-mono">$</span>
                <input 
                  type="number" 
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  placeholder="0.00"
                  step="0.01"
                  className="w-full bg-[#1A1A1A] border border-[#262626] rounded-lg pl-8 pr-4 py-2.5 text-sm outline-none focus:border-blue-500 text-white font-mono transition-colors"
                />
              </div>
            </div>

            <div>
              <label className="text-xs text-[#A3A3A3] mb-1.5 block">Payment Method</label>
              <div className="grid grid-cols-2 gap-3">
                <div 
                  onClick={() => setMethod('card')}
                  className={`border rounded-lg p-3 cursor-pointer flex items-center gap-3 transition-colors ${method === 'card' ? 'border-blue-500 bg-blue-500/10 text-white' : 'border-[#262626] bg-[#1A1A1A] text-[#A3A3A3] hover:border-[#404040]'}`}
                >
                  <CreditCard className="w-5 h-5 flex-shrink-0" />
                  <span className="text-sm font-medium">Credit Card</span>
                </div>
                <div 
                  onClick={() => setMethod('bank')}
                  className={`border rounded-lg p-3 cursor-pointer flex items-center gap-3 transition-colors ${method === 'bank' ? 'border-blue-500 bg-blue-500/10 text-white' : 'border-[#262626] bg-[#1A1A1A] text-[#A3A3A3] hover:border-[#404040]'}`}
                >
                  <Landmark className="w-5 h-5 flex-shrink-0" />
                  <span className="text-sm font-medium">Bank Transfer</span>
                </div>
              </div>
            </div>

            {method === 'card' && activeTab === 'deposit' && (
              <div className="pt-2">
                <div className="space-y-3">
                   <input type="text" placeholder="Card Number" className="w-full bg-[#1A1A1A] border border-[#262626] rounded-lg px-3 py-2 text-sm outline-none focus:border-blue-500 text-white transition-colors" />
                   <div className="grid grid-cols-2 gap-3">
                     <input type="text" placeholder="MM/YY" className="bg-[#1A1A1A] border border-[#262626] rounded-lg px-3 py-2 text-sm outline-none focus:border-blue-500 text-white transition-colors" />
                     <input type="text" placeholder="CVC" className="bg-[#1A1A1A] border border-[#262626] rounded-lg px-3 py-2 text-sm outline-none focus:border-blue-500 text-white transition-colors" />
                   </div>
                </div>
              </div>
            )}

            {method === 'bank' && activeTab === 'deposit' && (
              <div className="pt-2">
                 <input type="text" placeholder="Routing Number" className="w-full bg-[#1A1A1A] border border-[#262626] rounded-lg px-3 py-2 text-sm outline-none focus:border-blue-500 text-white transition-colors mb-3" />
                 <input type="text" placeholder="Account Number" className="w-full bg-[#1A1A1A] border border-[#262626] rounded-lg px-3 py-2 text-sm outline-none focus:border-blue-500 text-white transition-colors" />
              </div>
            )}

            <button 
              type="submit" 
              disabled={loading || !amount}
              className={`w-full py-3 rounded-lg text-sm font-bold mt-4 transition-colors flex items-center justify-center
                ${loading || !amount ? 'bg-[#262626] text-[#A3A3A3] cursor-not-allowed' : 
                  activeTab === 'deposit' ? 'bg-blue-600 hover:bg-blue-500 text-white' : 'bg-orange-600 hover:bg-orange-500 text-white'
                }`}
            >
              {loading ? (
                <div className="w-5 h-5 border-2 border-t-transparent border-white rounded-full animate-spin"></div>
              ) : (
                `${activeTab === 'deposit' ? 'Confirm Deposit' : 'Request Withdrawal'}`
              )}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};
