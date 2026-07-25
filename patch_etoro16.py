import re

with open("src/components/bank/EToroApp.tsx", "r") as f:
    content = f.read()

# Just recreate the whole file
new_content = """
import React, { useState } from 'react';
import { TrendingUp, ArrowRightLeft, DollarSign, Activity, Wallet, Search, BarChart2, ShieldCheck, Zap, Bitcoin, LineChart, Globe, ArrowUpRight, ArrowDownRight, Bot } from "lucide-react";
import { toast } from "sonner";
import { collection, addDoc, serverTimestamp } from "firebase/firestore";
import { db } from "../../firebase";
import { useAuth } from "../../context/AuthContext";

export function EToroApp() {
  const [activeTab, setActiveTab] = useState<'portfolio' | 'trade' | 'funding'>('portfolio');
  const [fundingAmount, setFundingAmount] = useState('');
  const [tradeAction, setTradeAction] = useState('BUY');
  const [tradeAmount, setTradeAmount] = useState('');
  const [isTrading, setIsTrading] = useState(false);
  const [isFunding, setIsFunding] = useState(false);
  const { user } = useAuth();
  
  const [aiEnabled, setAiEnabled] = useState(false);
  const [aiStatus, setAiStatus] = useState("Standby");

  React.useEffect(() => {
    let interval: any;
    if (aiEnabled) {
      setAiStatus("Analyzing Market Liquidity...");
      interval = setInterval(() => {
        setAiStatus(prev => prev === "Analyzing Market Liquidity..." ? "Rebalancing Portfolios..." : "Analyzing Market Liquidity...");
        if (Math.random() > 0.7) {
            toast.success("AI Agent executed micro-rebalance across Tech Sector", { icon: <Zap className="w-4 h-4 text-emerald-400" /> });
        }
      }, 5000);
    } else {
      setAiStatus("Standby");
    }
    return () => clearInterval(interval);
  }, [aiEnabled]);

  const handleTrade = async () => {
    if (!tradeAmount || isNaN(Number(tradeAmount)) || Number(tradeAmount) <= 0) {
      toast.error("Please enter a valid trade amount.");
      return;
    }
    
    setIsTrading(true);
    
    try {
      if (user) {
        await addDoc(collection(db, "transactions"), {
          userId: user.uid,
          type: "ETORO_TRADE",
          action: tradeAction,
          amount: Number(tradeAmount),
          asset: "SpaceX",
          status: "completed",
          timestamp: serverTimestamp()
        });
      }
      
      toast.success(`Successfully executed ${tradeAction} order for SpaceX.`, {
        icon: <Zap className="w-4 h-4 text-emerald-400" />
      });
      setTradeAmount("");
    } catch (error) {
      console.error("Trade error:", error);
      toast.error("Trade execution failed.");
    } finally {
      setIsTrading(false);
    }
  };
  
  const handleFunding = async (type: 'deposit' | 'withdraw') => {
    if (!fundingAmount || isNaN(Number(fundingAmount)) || Number(fundingAmount) <= 0) {
      toast.error("Please enter a valid amount.");
      return;
    }
    
    setIsFunding(true);
    
    try {
      if (user) {
        await addDoc(collection(db, "transactions"), {
          userId: user.uid,
          type: type === 'deposit' ? "ETORO_DEPOSIT" : "ETORO_WITHDRAWAL",
          amount: Number(fundingAmount),
          status: "completed",
          timestamp: serverTimestamp()
        });
      }
      
      toast.success(`Successfully ${type === 'deposit' ? 'deposited to' : 'withdrew from'} eToro.`, {
        icon: <ShieldCheck className="w-4 h-4 text-emerald-400" />
      });
      setFundingAmount("");
    } catch (error) {
      console.error("Funding error:", error);
      toast.error("Funding operation failed.");
    } finally {
      setIsFunding(false);
    }
  };

  return (
    <div className="w-full max-w-6xl mx-auto space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <div className="bg-slate-900 border border-slate-800 rounded-3xl overflow-hidden shadow-2xl relative">
          
          <div className="p-8 border-b border-slate-800/50 bg-slate-900/50 backdrop-blur-xl relative">
          <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-500/10 rounded-full blur-[80px] -mr-32 -mt-32 pointer-events-none"></div>
          
          <div className="flex items-center justify-between mb-8 relative z-10">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-emerald-500/20 rounded-xl flex items-center justify-center border border-emerald-500/30">
                <TrendingUp className="w-6 h-6 text-emerald-400" />
              </div>
              <div>
                <h2 className="text-2xl font-black text-white tracking-tight">eToro Sovereign Brokerage</h2>
                <p className="text-emerald-400/80 text-xs font-bold uppercase tracking-widest flex items-center gap-1">
                   <ShieldCheck className="w-3 h-3" /> Fully Integrated with Valourian Treasury
                </p>
              </div>
            </div>
            <div className="flex gap-2">
              <button onClick={() => setActiveTab("portfolio")} className={`px-4 py-2 rounded-xl text-xs font-bold uppercase tracking-widest transition-colors ${activeTab === 'portfolio' ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' : 'bg-slate-800 text-slate-400 hover:bg-slate-700 hover:text-white'}`}>Portfolio</button>
              <button onClick={() => setActiveTab("trade")} className={`px-4 py-2 rounded-xl text-xs font-bold uppercase tracking-widest transition-colors ${activeTab === 'trade' ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' : 'bg-slate-800 text-slate-400 hover:bg-slate-700 hover:text-white'}`}>Trade</button>
              <button onClick={() => setActiveTab("funding")} className={`px-4 py-2 rounded-xl text-xs font-bold uppercase tracking-widest transition-colors ${activeTab === 'funding' ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' : 'bg-slate-800 text-slate-400 hover:bg-slate-700 hover:text-white'}`}>Funding</button>
            </div>
          </div>
          
          <div className="relative z-10 min-h-[400px]">
            {activeTab === 'portfolio' && (
              <div className="space-y-6">
                <div className="bg-slate-950 rounded-2xl p-6 border border-slate-800 flex justify-between items-center">
                  <div>
                    <div className="text-slate-400 text-xs font-bold uppercase tracking-widest mb-1">Total Equity</div>
                    <div className="text-4xl font-black text-white">$100,240,500.00</div>
                  </div>
                  <div className="text-right">
                    <div className="text-slate-400 text-xs font-bold uppercase tracking-widest mb-1">Available Cash</div>
                    <div className="text-2xl font-black text-emerald-400">$2,500,000.00</div>
                  </div>
                </div>
                
                <h3 className="text-lg font-black text-white">Current Holdings</h3>
                <div className="space-y-3">
                   <div className="bg-slate-800/50 p-4 rounded-xl flex items-center justify-between border border-slate-700">
                      <div className="flex items-center gap-4">
                        <div className="w-10 h-10 bg-slate-900 rounded-lg flex items-center justify-center font-bold text-white">SPX</div>
                        <div>
                          <div className="text-white font-bold">SpaceX</div>
                          <div className="text-xs text-slate-400">1,500,000 Shares (Private)</div>
                        </div>
                      </div>
                      <div className="text-right">
                         <div className="text-white font-bold">$90,000,000.00</div>
                         <div className="text-emerald-400 text-xs flex items-center justify-end gap-1"><ArrowUpRight className="w-3 h-3"/> +12.5%</div>
                      </div>
                   </div>
                   
                   <div className="bg-slate-800/50 p-4 rounded-xl flex items-center justify-between border border-slate-700">
                      <div className="flex items-center gap-4">
                        <div className="w-10 h-10 bg-slate-900 rounded-lg flex items-center justify-center font-bold text-white">OAI</div>
                        <div>
                          <div className="text-white font-bold">OpenAI</div>
                          <div className="text-xs text-slate-400">150,000 Shares (Private)</div>
                        </div>
                      </div>
                      <div className="text-right">
                         <div className="text-white font-bold">$7,500,000.00</div>
                         <div className="text-emerald-400 text-xs flex items-center justify-end gap-1"><ArrowUpRight className="w-3 h-3"/> +8.2%</div>
                      </div>
                   </div>
                   
                   <div className="bg-slate-800/50 p-4 rounded-xl flex items-center justify-between border border-slate-700">
                      <div className="flex items-center gap-4">
                        <div className="w-10 h-10 bg-slate-900 rounded-lg flex items-center justify-center font-bold text-white">PLTR</div>
                        <div>
                          <div className="text-white font-bold">Palantir Tech</div>
                          <div className="text-xs text-slate-400">100,000 Shares</div>
                        </div>
                      </div>
                      <div className="text-right">
                         <div className="text-white font-bold">$2,740,500.00</div>
                         <div className="text-red-400 text-xs flex items-center justify-end gap-1"><ArrowDownRight className="w-3 h-3"/> -1.4%</div>
                      </div>
                   </div>
                </div>

                <div className="bg-slate-950 rounded-2xl p-6 border border-slate-800 mt-6">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${aiEnabled ? 'bg-emerald-500/20 border border-emerald-500/30' : 'bg-slate-800 border border-slate-700'}`}>
                        <Bot className={`w-5 h-5 ${aiEnabled ? 'text-emerald-400' : 'text-slate-400'}`} />
                      </div>
                      <div>
                        <h4 className="text-white font-black">AI Liquidity Management</h4>
                        <p className={`text-[10px] font-bold uppercase tracking-widest ${aiEnabled ? 'text-emerald-400' : 'text-slate-500'}`}>{aiStatus}</p>
                      </div>
                    </div>
                    <button 
                      onClick={() => setAiEnabled(!aiEnabled)}
                      className={`px-4 py-2 rounded-xl text-xs font-bold uppercase tracking-widest transition-colors ${aiEnabled ? 'bg-red-500/20 text-red-400 hover:bg-red-500/30 border border-red-500/30' : 'bg-emerald-500/20 text-emerald-400 hover:bg-emerald-500/30 border border-emerald-500/30'}`}
                    >
                      {aiEnabled ? 'Deactivate AI' : 'Activate AI'}
                    </button>
                  </div>
                  {aiEnabled && (
                    <div className="p-4 bg-emerald-500/10 border border-emerald-500/20 rounded-xl">
                      <p className="text-xs text-emerald-300/80 leading-relaxed">
                        Sovereign Agent is now actively managing liquidity, rebalancing assets in real-time, and targeting high-growth technology equities based on Deep Tech predictive models.
                      </p>
                    </div>
                  )}
                </div>
              </div>
            )}
            
            {activeTab === 'trade' && (
              <div className="space-y-6">
                <div className="relative">
                  <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500" />
                  <input type="text" placeholder="Search assets (e.g. SpaceX, OpenAI, PLTR)..." className="w-full bg-slate-950 border border-slate-800 rounded-2xl py-4 pl-12 pr-4 text-white focus:outline-none focus:border-emerald-500/50 font-medium placeholder:text-slate-600" />
                </div>
                
                <div className="bg-slate-950 rounded-2xl p-6 border border-slate-800">
                   <h3 className="text-lg font-black text-white mb-4">Execute Trade: SpaceX (Private Equity)</h3>
                   <div className="grid grid-cols-2 gap-4 mb-6">
                     <div>
                       <label className="text-xs font-bold text-slate-400 uppercase tracking-widest block mb-2">Action</label>
                       <select value={tradeAction} onChange={e => setTradeAction(e.target.value)} className="w-full bg-slate-900 border border-slate-700 rounded-xl p-3 text-white">
                         <option>BUY</option>
                         <option>SELL</option>
                       </select>
                     </div>
                     <div>
                       <label className="text-xs font-bold text-slate-400 uppercase tracking-widest block mb-2">Amount (USD)</label>
                       <input type="number" value={tradeAmount} onChange={e => setTradeAmount(e.target.value)} placeholder="0.00" className="w-full bg-slate-900 border border-slate-700 rounded-xl p-3 text-white" />
                     </div>
                   </div>
                   
                   <div className="p-4 bg-emerald-500/10 border border-emerald-500/20 rounded-xl flex items-start gap-3 mb-6">
                     <Zap className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
                     <p className="text-xs text-emerald-300/80 leading-relaxed">
                       Sovereign AI Routing Active: This order will be routed directly through Valourian Capital's dark pools to ensure zero market impact. Execution guaranteed at VWAP.
                     </p>
                   </div>
                   
                   <button onClick={handleTrade} disabled={isTrading} className="w-full py-4 bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white font-black rounded-xl transition-colors text-sm tracking-widest shadow-lg shadow-emerald-500/20">
                     EXECUTE SOVEREIGN TRADE
                   </button>
                </div>
              </div>
            )}
            
            {activeTab === 'funding' && (
              <div className="space-y-6">
                <div className="grid md:grid-cols-2 gap-6">
                  <div className="bg-slate-950 rounded-2xl p-6 border border-slate-800">
                     <h3 className="text-lg font-black text-white mb-2">Deposit Funds</h3>
                     <p className="text-xs text-slate-400 mb-6">Transfer from Valourian Treasury to eToro instantly.</p>
                     
                     <div className="space-y-4">
                       <div>
                         <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest block mb-1">Amount</label>
                         <div className="relative">
                           <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                           <input type="text" value={fundingAmount} onChange={e => setFundingAmount(e.target.value)} placeholder="0.00" className="w-full bg-slate-900 border border-slate-700 rounded-xl py-3 pl-9 pr-4 text-white" />
                         </div>
                       </div>
                       <button onClick={() => handleFunding('deposit')} disabled={isFunding} className="w-full py-3 bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white font-bold rounded-xl transition-colors">
                         Deposit Now
                       </button>
                     </div>
                  </div>
                  <div className="bg-slate-950 rounded-2xl p-6 border border-slate-800">
                     <h3 className="text-lg font-black text-white mb-2">Withdraw Funds</h3>
                     <p className="text-xs text-slate-400 mb-6">Transfer from eToro back to Valourian Treasury.</p>
                     
                     <div className="space-y-4">
                       <div>
                         <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest block mb-1">Amount</label>
                         <div className="relative">
                           <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                           <input type="text" value={fundingAmount} onChange={e => setFundingAmount(e.target.value)} placeholder="0.00" className="w-full bg-slate-900 border border-slate-700 rounded-xl py-3 pl-9 pr-4 text-white" />
                         </div>
                       </div>
                       <button onClick={() => handleFunding('withdraw')} disabled={isFunding} className="w-full py-3 bg-slate-800 hover:bg-slate-700 disabled:opacity-50 text-white font-bold rounded-xl transition-colors border border-slate-700">
                         Withdraw Now
                       </button>
                     </div>
                  </div>
                </div>
              </div>
            )}
          </div>
       </div>
    </div>
  );
}
"""

with open("src/components/bank/EToroApp.tsx", "w") as f:
    f.write(new_content)
