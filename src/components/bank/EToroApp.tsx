import { Globe, BarChart2, LineChart } from 'lucide-react';
import { CheckCircle2, Loader2, Activity, Bot, TrendingUp, ShieldCheck, DollarSign, Zap, Search } from "lucide-react";
import { motion } from "framer-motion";

import React, { useState } from 'react';
import { CryptoPortfolioWidget } from "./CryptoPortfolioWidget";

import { toast } from "sonner";
import { collection, addDoc, serverTimestamp } from "firebase/firestore";
import { db } from "../../firebase";
// Mock auth
const useAuth = () => ({ user: { uid: 'mock-user-123' } });

export function EToroApp() {
  const [activeTab, setActiveTab] = useState<string>('portfolio');
  const [availableCash, setAvailableCash] = useState(2000000); // Start with 2M from Treasury
  const [totalEquity, setTotalEquity] = useState(100240500);
  const [fundingAmount, setFundingAmount] = useState('');
  const [tradeAction, setTradeAction] = useState('BUY');
  const [tradeAmount, setTradeAmount] = useState('');
  const [isTrading, setIsTrading] = useState(false);
  const [showExecutionModal, setShowExecutionModal] = useState(false);
  const [rebalanceStatus, setRebalanceStatus] = useState<'idle' | 'executing' | 'complete'>('idle');
  const [executionProgress, setExecutionProgress] = useState(0);
  const [currentExecutionStep, setCurrentExecutionStep] = useState(0);


  const [aiEnabled, setAiEnabled] = useState(false);
  const [aiStatus, setAiStatus] = useState("Standby");
  const [bridgeAsset, setBridgeAsset] = useState('BTC');
  const [bridgeAddress, setBridgeAddress] = useState('');
  const [bridgeAmount, setBridgeAmount] = useState('');
  const [isBridging, setIsBridging] = useState(false);
  const [bridgeStatus, setBridgeStatus] = useState<null | 'validating' | 'confirmed' | 'failed'>(null);


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

  const [isFunding, setIsFunding] = useState(false);
  const { user } = useAuth();
  

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
              <button onClick={() => setActiveTab("bridge")} className={`px-4 py-2 rounded-xl text-xs font-bold uppercase tracking-widest transition-colors ${activeTab === 'bridge' ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' : 'bg-slate-800 text-slate-400 hover:bg-slate-700 hover:text-white'}`}>Bridge</button>

            </div>
          </div>
          
          <div className="relative z-10 min-h-[400px]">
            {activeTab === 'portfolio' && (
              <div className="space-y-6">
                <div className="bg-slate-950 rounded-2xl p-6 border border-slate-800 flex justify-between items-center">
                  <div>
                    <div className="text-slate-400 text-xs font-bold uppercase tracking-widest mb-1">Total Equity</div>
                    <div className="text-4xl font-black text-white">${totalEquity.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</div>
                  </div>
                  <div className="text-right">
                    <div className="text-slate-400 text-xs font-bold uppercase tracking-widest mb-1">Available Cash</div>
                    <div className="text-2xl font-black text-emerald-400">${availableCash.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</div>
                  </div>
                </div>
                
                <CryptoPortfolioWidget totalEquity={totalEquity} />
                {/* Automated Crypto Rebalancing Strategy Widget */}
                <div className="bg-slate-950 rounded-2xl p-6 border border-slate-800 mt-6 relative overflow-hidden">
                   <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/10 rounded-full blur-[40px] -mr-16 -mt-16 pointer-events-none"></div>
                   <div className="flex items-center gap-3 mb-6">
                     <div className="w-10 h-10 rounded-xl bg-blue-500/20 border border-blue-500/30 flex items-center justify-center">
                       <BarChart2 className="w-5 h-5 text-blue-400" />
                     </div>
                     <div>
                       <h3 className="text-lg font-black text-white">Custom Rebalancing Strategies</h3>
                       <p className="text-xs text-blue-400/80 uppercase tracking-widest font-bold">Automated Allocation Rules</p>
                     </div>
                   </div>
                   
                   <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                     <div className="bg-slate-900 rounded-xl p-4 border border-slate-800">
                       <label className="block text-[10px] font-black uppercase tracking-widest text-slate-500 mb-2">Target BTC Allocation (%)</label>
                       <input 
                         type="number" 
                         defaultValue={60}
                         className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 font-semibold text-white focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors"
                       />
                     </div>
                     <div className="bg-slate-900 rounded-xl p-4 border border-slate-800">
                       <label className="block text-[10px] font-black uppercase tracking-widest text-slate-500 mb-2">Threshold Deviation (%)</label>
                       <input 
                         type="number" 
                         defaultValue={5}
                         className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 font-semibold text-white focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors"
                       />
                     </div>
                   </div>
                   
                   <button 
                     onClick={() => toast.success("Custom rebalancing strategy saved and deployed to execution engine.")}
                     className="w-full bg-blue-600 hover:bg-blue-500 text-white font-black uppercase tracking-widest py-3 rounded-xl transition-colors text-xs"
                   >
                     Save & Deploy Strategy
                   </button>
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
                
                {/* Automated Crypto Rebalancing Strategy Widget */}
                <div className="bg-slate-950 rounded-2xl p-6 border border-slate-800 mt-6 relative overflow-hidden">
                   <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/10 rounded-full blur-[40px] -mr-16 -mt-16 pointer-events-none"></div>
                   <div className="flex items-center gap-3 mb-6">
                     <div className="w-10 h-10 rounded-xl bg-blue-500/20 border border-blue-500/30 flex items-center justify-center">
                       <BarChart2 className="w-5 h-5 text-blue-400" />
                     </div>
                     <div>
                       <h3 className="text-lg font-black text-white">Custom Rebalancing Strategies</h3>
                       <p className="text-xs text-blue-400/80 uppercase tracking-widest font-bold">Automated Allocation Rules</p>
                     </div>
                   </div>
                   
                   <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                     <div className="bg-slate-900 rounded-xl p-4 border border-slate-800">
                       <label className="block text-[10px] font-black uppercase tracking-widest text-slate-500 mb-2">Target BTC Allocation (%)</label>
                       <input 
                         type="number" 
                         defaultValue={60}
                         className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 font-semibold text-white focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors"
                       />
                     </div>
                     <div className="bg-slate-900 rounded-xl p-4 border border-slate-800">
                       <label className="block text-[10px] font-black uppercase tracking-widest text-slate-500 mb-2">Threshold Deviation (%)</label>
                       <input 
                         type="number" 
                         defaultValue={5}
                         className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 font-semibold text-white focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors"
                       />
                     </div>
                   </div>
                   
                   <button 
                     onClick={() => toast.success("Custom rebalancing strategy saved and deployed to execution engine.")}
                     className="w-full bg-blue-600 hover:bg-blue-500 text-white font-black uppercase tracking-widest py-3 rounded-xl transition-colors text-xs"
                   >
                     Save & Deploy Strategy
                   </button>
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
                </div>
            )}
            
            {activeTab === 'trade' && (
              <div className="space-y-6">
                <div className="relative">
                  <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500" />
                  <input type="text" placeholder="Search assets (e.g. SpaceX, OpenAI, PLTR)..." className="w-full bg-slate-950 border border-slate-800 rounded-2xl py-4 pl-12 pr-4 text-white focus:outline-none focus:border-emerald-500/50 font-medium placeholder:text-slate-600" />
                </div>
                
                                  <div className="bg-slate-950 rounded-2xl p-6 border border-emerald-500/30">
                     <div className="flex items-center gap-3 mb-2">
                        <Globe className="w-5 h-5 text-emerald-400" />
                        <h3 className="text-lg font-black text-white">Strategic Asset Liquidation</h3>
                     </div>
                     <p className="text-xs text-slate-400 mb-6">Transfer sovereign assets (e.g. Tesla, SpaceX) into eToro for immediate liquidation and bank withdrawal.</p>
                     
                     <div className="space-y-4">
                       <div>
                         <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest block mb-1">Asset Allocation</label>
                         <select className="w-full bg-slate-900 border border-slate-700 rounded-xl py-3 px-4 text-white font-semibold">
                             <option>Tesla (TSLA) - 2% Strategic Stake Liquidation</option>
                             <option>SpaceX (SPX) - Secondary Market Offload</option>
                         </select>
                       </div>
                       <div>
                         <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest block mb-1">Destination Bank Account</label>
                         <input type="text" placeholder="e.g. Commonwealth Bank (BSB 062-000)" className="w-full bg-slate-900 border border-slate-700 rounded-xl py-3 px-4 text-white" />
                       </div>
                       <button onClick={() => {
                           setIsFunding(true);
                           toast.success("Initiating 2% TSLA transfer to eToro...", { icon: <Activity className="w-4 h-4 text-emerald-400"/> });
                           setTimeout(() => {
                               toast.success("TSLA shares liquidated at market rate.", { icon: <LineChart className="w-4 h-4 text-emerald-400"/> });
                           }, 2000);
                           setTimeout(() => {
                               toast.success("$2,509,000.00 withdrawn to Commonwealth Bank successfully.", { icon: <DollarSign className="w-4 h-4 text-emerald-400"/> });
                               setIsFunding(false);
                           }, 4000);
                       }} disabled={isFunding} className="w-full py-3 bg-emerald-500/20 hover:bg-emerald-500/30 disabled:opacity-50 text-emerald-400 font-bold rounded-xl transition-colors border border-emerald-500/50 uppercase tracking-widest text-xs">
                         Execute 2% Transfer & Withdraw
                       </button>
                     </div>
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
            {activeTab === 'rebalance' && (
              <div className="space-y-6">
                <div className="bg-slate-950 rounded-2xl p-6 border border-emerald-500/30 relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/10 rounded-full blur-[40px] -mr-16 -mt-16 pointer-events-none"></div>
                    <div className="flex items-center gap-3 mb-6">
                        <div className="w-10 h-10 rounded-xl bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center">
                            <Bot className="w-5 h-5 text-emerald-400" />
                        </div>
                        <div>
                            <h3 className="text-lg font-black text-white">AI Crypto Rebalancing</h3>
                            <p className="text-xs text-emerald-400/80 uppercase tracking-widest font-bold">Real-time Sentiment Analysis Active</p>
                        </div>
                    </div>
                    
                    <div className="grid md:grid-cols-3 gap-4 mb-6">
                        <div className="bg-slate-900 rounded-xl p-4 border border-slate-800">
                            <div className="text-xs text-slate-500 font-bold uppercase tracking-widest mb-1">Market Sentiment</div>
                            <div className="text-xl font-black text-emerald-400">Extreme Greed (84)</div>
                        </div>
                        <div className="bg-slate-900 rounded-xl p-4 border border-slate-800">
                            <div className="text-xs text-slate-500 font-bold uppercase tracking-widest mb-1">Recommended Action</div>
                            <div className="text-xl font-black text-white">De-risk to BTC/ETH</div>
                        </div>
                        <div className="bg-slate-900 rounded-xl p-4 border border-slate-800">
                            <div className="text-xs text-slate-500 font-bold uppercase tracking-widest mb-1">Expected Yield</div>
                            <div className="text-xl font-black text-emerald-400">+14.2% APY</div>
                        </div>
                    </div>

                    <div className="space-y-4 mb-6">
                        <h4 className="text-sm font-bold text-white uppercase tracking-widest">Proposed Portfolio Adjustments</h4>
                        
                        <div className="grid md:grid-cols-2 gap-4">
                            <div className="flex items-center justify-between bg-slate-900 p-3 rounded-xl border border-red-500/20">
                                <div className="flex items-center gap-3">
                                    <div className="w-8 h-8 rounded-full bg-red-500/10 flex items-center justify-center text-red-400 font-bold text-xs">SELL</div>
                                    <span className="text-white font-bold">Solana (SOL)</span>
                                </div>
                                <div className="text-right">
                                    <div className="text-white font-mono font-bold">-25%</div>
                                    <div className="text-xs text-slate-500 font-mono">Take profit on recent rally</div>
                                </div>
                            </div>
                            
                            <div className="flex items-center justify-between bg-slate-900 p-3 rounded-xl border border-red-500/20">
                                <div className="flex items-center gap-3">
                                    <div className="w-8 h-8 rounded-full bg-red-500/10 flex items-center justify-center text-red-400 font-bold text-xs">SELL</div>
                                    <span className="text-white font-bold">Dogecoin (DOGE)</span>
                                </div>
                                <div className="text-right">
                                    <div className="text-white font-mono font-bold">-100%</div>
                                    <div className="text-xs text-slate-500 font-mono">Sentiment turned bearish</div>
                                </div>
                            </div>

                            <div className="flex items-center justify-between bg-slate-900 p-3 rounded-xl border border-emerald-500/20">
                                <div className="flex items-center gap-3">
                                    <div className="w-8 h-8 rounded-full bg-emerald-500/10 flex items-center justify-center text-emerald-400 font-bold text-xs">BUY</div>
                                    <span className="text-white font-bold">Bitcoin (BTC)</span>
                                </div>
                                <div className="text-right">
                                    <div className="text-white font-mono font-bold">+15%</div>
                                    <div className="text-xs text-slate-500 font-mono">Safe haven asset</div>
                                </div>
                            </div>
                            
                            <div className="flex items-center justify-between bg-slate-900 p-3 rounded-xl border border-emerald-500/20">
                                <div className="flex items-center gap-3">
                                    <div className="w-8 h-8 rounded-full bg-emerald-500/10 flex items-center justify-center text-emerald-400 font-bold text-xs">BUY</div>
                                    <span className="text-white font-bold">Ethereum (ETH)</span>
                                </div>
                                <div className="text-right">
                                    <div className="text-white font-mono font-bold">+10%</div>
                                    <div className="text-xs text-slate-500 font-mono">Yield opportunities via staking</div>
                                </div>
                            </div>
                        </div>
                    </div>
                    
                    <button 
                        onClick={() => setShowExecutionModal(true)}
                        className="w-full py-4 bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-400 border border-emerald-500/50 font-black rounded-xl transition-colors text-sm tracking-widest"
                    >
                        PREVIEW & EXECUTE AI REBALANCE
                    </button>

                    {showExecutionModal && (
                        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
                            <div className="bg-slate-900 border border-emerald-500/30 rounded-2xl p-6 w-full max-w-md shadow-[0_0_50px_rgba(16,185,129,0.1)] relative">
                                {rebalanceStatus === 'idle' && (
                                    <button onClick={() => setShowExecutionModal(false)} className="absolute top-4 right-4 text-slate-400 hover:text-white">
                                        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
                                    </button>
                                )}
                                
                                <div className="flex items-center gap-3 mb-6">
                                    <Activity className={`w-6 h-6 text-emerald-400 ${rebalanceStatus === 'executing' ? 'animate-pulse' : ''}`} />
                                    <h3 className="text-xl font-black text-white">{rebalanceStatus === 'idle' ? 'Execution Details' : rebalanceStatus === 'executing' ? 'AI Execution in Progress' : 'Execution Complete'}</h3>
                                </div>
                                
                                {rebalanceStatus === 'idle' ? (
                                    <>
                                        <div className="space-y-4 mb-8">
                                            <div className="flex justify-between items-center pb-3 border-b border-slate-800">
                                                <span className="text-slate-400 font-bold text-xs uppercase tracking-widest">Routing Strategy</span>
                                                <span className="text-white font-black">TWAP (Smart Router)</span>
                                            </div>
                                            <div className="flex justify-between items-center pb-3 border-b border-slate-800">
                                                <span className="text-slate-400 font-bold text-xs uppercase tracking-widest">Estimated Gas Fees</span>
                                                <span className="text-yellow-400 font-mono font-bold">$142.50 (0.045 ETH)</span>
                                            </div>
                                            <div className="flex justify-between items-center pb-3 border-b border-slate-800">
                                                <span className="text-slate-400 font-bold text-xs uppercase tracking-widest">Est. Slippage Impact</span>
                                                <span className="text-emerald-400 font-mono font-bold">0.12%</span>
                                            </div>
                                            <div className="flex justify-between items-center pb-3 border-b border-slate-800">
                                                <span className="text-slate-400 font-bold text-xs uppercase tracking-widest">Execution Time</span>
                                                <span className="text-white font-mono font-bold">~45 minutes</span>
                                            </div>
                                        </div>
                                        
                                        <button 
                                            onClick={() => {
                                                setRebalanceStatus('executing');
                                                setExecutionProgress(0);
                                                setCurrentExecutionStep(0);
                                                
                                                toast.success("AI Agent executing portfolio rebalance...", { icon: <Bot className="w-4 h-4 text-emerald-400" />});
                                                
                                                // Simulate steps
                                                const simulateStep = (step, progress, delay) => {
                                                    setTimeout(() => {
                                                        setCurrentExecutionStep(step);
                                                        setExecutionProgress(progress);
                                                    }, delay);
                                                };
                                                
                                                simulateStep(1, 25, 1000); // Route optimization
                                                simulateStep(2, 50, 2500); // Acquiring liquidations
                                                simulateStep(3, 75, 4000); // Balancing assets
                                                simulateStep(4, 100, 5500); // Finalizing
                                                
                                                setTimeout(() => {
                                                    setRebalanceStatus('complete');
                                                    toast.success("Rebalance complete. Orders filled via TWAP.");
                                                    setTimeout(() => {
                                                        setShowExecutionModal(false);
                                                        setRebalanceStatus('idle');
                                                    }, 2000);
                                                }, 6000);
                                            }}
                                            className="w-full py-4 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black rounded-xl transition-colors uppercase tracking-widest text-xs"
                                        >
                                            CONFIRM REBALANCE
                                        </button>
                                    </>
                                ) : (
                                    <div className="space-y-6 mb-4">
                                        <div className="w-full h-2 bg-slate-800 rounded-full overflow-hidden">
                                            <motion.div 
                                                className="h-full bg-emerald-500"
                                                initial={{ width: 0 }}
                                                animate={{ width: `${executionProgress}%` }}
                                                transition={{ duration: 0.5 }}
                                            />
                                        </div>
                                        
                                        <div className="space-y-3">
                                            {[
                                                { label: "Neural Route Optimization", time: "est. 12s" },
                                                { label: "Executing Limit Orders (TWAP)", time: "est. 45m" },
                                                { label: "Validating Blockchain Confirmations", time: "est. 3m" },
                                                { label: "Finalizing Vault Deposits", time: "est. 1s" }
                                            ].map((step, idx) => (
                                                <div key={idx} className={`flex justify-between items-center pb-2 border-b border-slate-800 ${currentExecutionStep > idx ? 'text-emerald-400' : currentExecutionStep === idx ? 'text-white' : 'text-slate-600'}`}>
                                                    <div className="flex items-center gap-2">
                                                        {currentExecutionStep > idx ? (
                                                            <CheckCircle2 className="w-4 h-4" />
                                                        ) : currentExecutionStep === idx ? (
                                                            <Loader2 className="w-4 h-4 animate-spin" />
                                                        ) : (
                                                            <div className="w-4 h-4 rounded-full border border-slate-700" />
                                                        )}
                                                        <span className="font-bold text-xs uppercase tracking-widest">{step.label}</span>
                                                    </div>
                                                    <span className="font-mono text-xs">{step.time}</span>
                                                </div>
                                            ))}
                                        </div>
                                        
                                        {rebalanceStatus === 'complete' && (
                                            <div className="p-4 bg-emerald-500/10 border border-emerald-500/30 rounded-xl text-center">
                                                <p className="text-emerald-400 font-bold uppercase tracking-widest text-xs">Rebalance Finished Successfully</p>
                                            </div>
                                        )}
                                    </div>
                                )}
                            </div>
                        </div>
                    )}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}