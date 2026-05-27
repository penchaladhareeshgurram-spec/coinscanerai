import React, { useState, useRef, useEffect } from 'react';
import { Send, Bot, User, ShieldAlert, TrendingUp, Target, CheckCircle2, XCircle, X } from 'lucide-react';
import Markdown from 'react-markdown';

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  type?: 'analysis' | 'execution';
  data?: any;
}

export function QuantAssistant({ onExecuteTrade, onClose }: { onExecuteTrade?: (tradeParams: any) => void, onClose?: () => void }) {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      role: 'assistant',
      content: "I am your Quantitative Trading Assistant. I can help clarify your trading doubts, provide deep technical and fundamental analysis. I will wait for your 'EXECUTE' command to prepare trade setups."
    }
  ]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleConfirm = (msgId: string, tradeParams: any) => {
    if (onExecuteTrade) {
      onExecuteTrade(tradeParams);
    }
    setMessages(prev => prev.map(m => m.id === msgId ? { ...m, type: undefined, content: "Trade executed successfully." } : m));
  };

  const handleCancel = (msgId: string) => {
    setMessages(prev => prev.map(m => m.id === msgId ? { ...m, type: undefined, content: "Trade execution cancelled." } : m));
  };

  const handleSend = async () => {
    if (!input.trim()) return;

    const userMsg: Message = { id: Date.now().toString(), role: 'user', content: input };
    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setIsTyping(true);

    if (userMsg.content.toUpperCase() === 'EXECUTE') {
      setTimeout(() => {
        const aiMsg: Message = {
          id: (Date.now() + 1).toString(),
          role: 'assistant',
          content: 'Formatting final trade parameters for manual review...',
          type: 'execution',
          data: {
            asset: 'BTC/USD',
            type: 'LONG',
            entry: 64250.00,
            stopLoss: 62000.00,
            takeProfit: 68000.00,
            size: '0.5 BTC',
            risk: '1.5%'
          }
        };
        setMessages(prev => [...prev, aiMsg]);
        setIsTyping(false);
      }, 1000);
      return;
    }

    try {
      const history = messages.filter(m => m.role === 'user' || m.role === 'assistant').map(m => ({
        role: m.role === 'assistant' ? 'model' : 'user',
        parts: [{ text: m.content }]
      }));

      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: [
            ...history,
            { role: 'user', parts: [{ text: userMsg.content }] }
          ]
        })
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || 'Failed to generate response');
      }

      const data = await response.json();

      const aiMsg: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: data.reply || "I couldn't process that.",
      };
      setMessages(prev => [...prev, aiMsg]);
    } catch (error: any) {
      console.error(error);
      setMessages(prev => [...prev, {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: error.message || "Sorry, I encountered an error while processing your request."
      }]);
    } finally {
      setIsTyping(false);
    }
  };

  return (
    <div className="flex flex-col h-full panel overflow-hidden">
      <div className="p-4 border-b border-[#262626] flex items-center justify-between bg-[#1A1A1A]">
        <div className="flex items-center gap-2">
          <Bot className="w-5 h-5 text-purple-500" />
          <h2 className="text-sm font-bold uppercase tracking-wider">Quant Assistant</h2>
        </div>
        {onClose && (
          <button onClick={onClose} className="p-1 rounded hover:bg-[#262626] text-[#A3A3A3] hover:text-white transition-colors">
            <X className="w-4 h-4" />
          </button>
        )}
      </div>
      
      <div className="flex-1 overflow-y-auto p-4 space-y-4 custom-scrollbar">
        {messages.map((msg) => (
          <div key={msg.id} className={`flex gap-3 ${msg.role === 'user' ? 'flex-row-reverse' : ''}`}>
            <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${msg.role === 'user' ? 'bg-blue-500/20 text-blue-500' : 'bg-purple-500/20 text-purple-500'}`}>
              {msg.role === 'user' ? <User className="w-4 h-4" /> : <Bot className="w-4 h-4" />}
            </div>
            <div className={`max-w-[80%] rounded-xl p-3 ${msg.role === 'user' ? 'bg-blue-500/10 border border-blue-500/20' : 'bg-[#1A1A1A] border border-[#262626]'}`}>
              {msg.role === 'assistant' ? (
                <div className="text-sm leading-relaxed markdown-body">
                  <Markdown>{msg.content}</Markdown>
                </div>
              ) : (
                <p className="text-sm leading-relaxed">{msg.content}</p>
              )}
              
              {msg.type === 'analysis' && msg.data && (
                <div className="mt-4 space-y-3 border-t border-[#262626] pt-3">
                  <div className="grid grid-cols-2 gap-2 text-xs">
                    <div className="bg-[#0A0A0A] p-2 rounded border border-[#262626]">
                      <div className="text-[#737373] mb-1 flex items-center gap-1"><TrendingUp className="w-3 h-3"/> Resistance</div>
                      <div className="font-mono text-red-400">{msg.data.resistance.join(', ')}</div>
                    </div>
                    <div className="bg-[#0A0A0A] p-2 rounded border border-[#262626]">
                      <div className="text-[#737373] mb-1 flex items-center gap-1"><TrendingUp className="w-3 h-3 rotate-180"/> Support</div>
                      <div className="font-mono text-emerald-400">{msg.data.support.join(', ')}</div>
                    </div>
                  </div>
                  <div className="bg-[#0A0A0A] p-2 rounded border border-[#262626] text-xs">
                    <div className="text-[#737373] mb-1 flex items-center gap-1"><ShieldAlert className="w-3 h-3"/> Sentiment</div>
                    <div className="text-white">{msg.data.sentiment}</div>
                  </div>
                  <div className="flex gap-2 text-xs">
                    <div className="bg-[#0A0A0A] p-2 rounded border border-[#262626] flex-1">
                      <div className="text-[#737373] mb-1">Entry Zone</div>
                      <div className="font-mono text-blue-400">{msg.data.entryZone}</div>
                    </div>
                    <div className="bg-[#0A0A0A] p-2 rounded border border-[#262626] flex-1">
                      <div className="text-[#737373] mb-1">Risk/Reward</div>
                      <div className="font-mono text-white">{msg.data.riskReward}</div>
                    </div>
                  </div>
                </div>
              )}

              {msg.type === 'execution' && msg.data && (
                <div className="mt-4 bg-[#0A0A0A] p-3 rounded-lg border border-emerald-500/30">
                  <div className="flex justify-between items-center mb-3">
                    <span className="text-xs font-bold text-emerald-500 flex items-center gap-1"><Target className="w-3 h-3"/> TRADE PARAMETERS</span>
                    <span className={`text-[10px] px-1.5 py-0.5 rounded font-mono ${msg.data.type === 'LONG' ? 'bg-emerald-500/20 text-emerald-500' : 'bg-red-500/20 text-red-500'}`}>{msg.data.type}</span>
                  </div>
                  <div className="grid grid-cols-2 gap-y-2 text-xs font-mono mb-4">
                    <div className="text-[#737373]">Asset:</div><div className="text-white text-right">{msg.data.asset}</div>
                    <div className="text-[#737373]">Entry:</div><div className="text-white text-right">{msg.data.entry}</div>
                    <div className="text-[#737373]">Stop Loss:</div><div className="text-red-400 text-right">{msg.data.stopLoss}</div>
                    <div className="text-[#737373]">Take Profit:</div><div className="text-emerald-400 text-right">{msg.data.takeProfit}</div>
                    <div className="text-[#737373]">Size:</div><div className="text-white text-right">{msg.data.size}</div>
                  </div>
                  <div className="flex gap-2">
                    <button 
                      onClick={() => handleConfirm(msg.id, msg.data)}
                      className="flex-1 bg-emerald-500 hover:bg-emerald-400 text-black py-1.5 rounded text-xs font-bold flex items-center justify-center gap-1 transition-colors"
                    >
                      <CheckCircle2 className="w-3 h-3" /> CONFIRM
                    </button>
                    <button 
                      onClick={() => handleCancel(msg.id)}
                      className="flex-1 bg-red-500/10 hover:bg-red-500/20 text-red-500 border border-red-500/20 py-1.5 rounded text-xs font-bold flex items-center justify-center gap-1 transition-colors"
                    >
                      <XCircle className="w-3 h-3" /> CANCEL
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        ))}
        {isTyping && (
          <div className="flex gap-3">
            <div className="w-8 h-8 rounded-full bg-purple-500/20 text-purple-500 flex items-center justify-center shrink-0">
              <Bot className="w-4 h-4" />
            </div>
            <div className="bg-[#1A1A1A] border border-[#262626] rounded-xl p-3 flex items-center gap-1">
              <div className="w-1.5 h-1.5 bg-[#525252] rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
              <div className="w-1.5 h-1.5 bg-[#525252] rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
              <div className="w-1.5 h-1.5 bg-[#525252] rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      <div className="p-4 border-t border-[#262626] bg-[#141414]">
        <div className="flex items-center bg-[#0A0A0A] border border-[#262626] rounded-lg p-1 focus-within:border-[#404040] transition-colors">
          <input 
            type="text" 
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSend()}
            placeholder="Enter ticker (e.g., BTC) or type 'EXECUTE'..."
            className="flex-1 bg-transparent border-none outline-none px-3 py-2 text-sm text-white placeholder-[#525252]"
          />
          <button 
            onClick={handleSend}
            disabled={!input.trim() || isTyping}
            className="p-2 bg-purple-500/10 text-purple-500 hover:bg-purple-500/20 rounded-md disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            <Send className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
