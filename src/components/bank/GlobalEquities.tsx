import React, { useState } from "react";
import { motion } from "framer-motion";
import { TrendingUp, PieChart, Activity, Globe, Briefcase, ChevronRight, BarChart4, ChevronUp, Bot, Network } from "lucide-react";

export function GlobalEquities() {
  const [activeTab, setActiveTab] = useState<"portfolio" | "research">("portfolio");

  const portfolio = [
    { ticker: "UBER", name: "Uber Technologies Inc.", shares: "250,000,000", value: "$18.4B", change: "+4.2%", partners: "Enterprise Logistics Integration" },
    { ticker: "GOOGL", name: "Alphabet Inc.", shares: "15,000,000", value: "$2.6B", change: "+1.8%", partners: "Deep Research AI & BigQuery Core" },
    { ticker: "APPL", name: "Apple Inc.", shares: "8,500,000", value: "$1.9B", change: "+2.1%", partners: "Hardware Security Encrypt" },
    { ticker: "TSLA", name: "Tesla Inc.", shares: "12,000,000", value: "$3.1B", change: "+5.4%", partners: "Autonomous Fleet Synergies" },
    { ticker: "NVDA", name: "NVIDIA Corp", shares: "2,000,000", value: "$1.8B", change: "+8.7%", partners: "Quantum Computing Hardware" }
  ];

  const researchQueue = [
    { target: "SpaceX", status: "Due Diligence Active", progress: 85, focus: "Starlink global comms relay" },
    { target: "Stripe", status: "Acquisition Talks", progress: 45, focus: "Global unified clearing house" },
    { target: "Palantir", status: "Algorithm Auditing", progress: 60, focus: "Sovereign data intelligence" }
  ];

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-[2rem] p-6 sm:p-8 relative overflow-hidden shadow-2xl text-white">
      <div className="absolute top-0 right-0 w-96 h-96 bg-indigo-500/10 rounded-full blur-[100px] pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-64 h-64 bg-emerald-500/10 rounded-full blur-[80px] pointer-events-none" />
      
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-8 relative z-10">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 bg-indigo-500/20 rounded-2xl flex items-center justify-center text-indigo-400 border border-indigo-500/30 shadow-[0_0_15px_rgba(99,102,241,0.2)]">
            <PieChart className="w-7 h-7" />
          </div>
          <div>
            <h3 className="text-xl font-black text-white tracking-tight mb-1">Global Strategic Holdings</h3>
            <p className="text-xs text-indigo-200 font-bold uppercase tracking-widest">Sovereign Deep Research & Partnership Portfolio</p>
          </div>
        </div>
        <div className="flex bg-slate-800/50 p-1.5 rounded-xl border border-slate-700/50 backdrop-blur-sm">
          <button 
            onClick={() => setActiveTab("portfolio")}
            className={`px-6 py-2 rounded-lg text-xs font-bold transition-all uppercase tracking-widest ${activeTab === 'portfolio' ? 'bg-indigo-600 text-white shadow-md' : 'text-slate-400 hover:text-white'}`}
          >
            Live Portfolio
          </button>
          <button 
            onClick={() => setActiveTab("research")}
            className={`px-6 py-2 rounded-lg text-xs font-bold transition-all uppercase tracking-widest ${activeTab === 'research' ? 'bg-emerald-600 text-white shadow-md' : 'text-slate-400 hover:text-white'}`}
          >
            Deep Research Queue
          </button>
        </div>
      </div>
      
      <div className="relative z-10">
        {activeTab === "portfolio" ? (
          <div className="grid gap-4">
            {portfolio.map((item, idx) => (
              <motion.div 
                key={item.ticker}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.05 }}
                className="bg-slate-950/50 border border-slate-800/80 p-5 rounded-2xl flex flex-col md:flex-row items-start md:items-center justify-between gap-4 hover:border-indigo-500/50 transition-colors group"
              >
                <div className="flex items-center gap-5 w-full md:w-auto">
                  <div className="w-12 h-12 rounded-xl bg-slate-800 flex flex-col items-center justify-center border border-slate-700 group-hover:bg-indigo-900/30 transition-colors">
                    <span className="text-[10px] text-slate-400 font-black tracking-widest">TICKER</span>
                    <span className="text-sm text-indigo-400 font-black">{item.ticker}</span>
                  </div>
                  <div>
                    <h4 className="text-base font-bold text-slate-200">{item.name}</h4>
                    <div className="flex items-center gap-2 mt-1">
                      <Network className="w-3.5 h-3.5 text-emerald-400" />
                      <span className="text-[10px] text-slate-400 uppercase tracking-wider font-bold">{item.partners}</span>
                    </div>
                  </div>
                </div>
                
                <div className="flex items-center gap-8 w-full md:w-auto border-t border-slate-800 md:border-none pt-4 md:pt-0">
                  <div className="text-right">
                    <div className="text-[10px] text-slate-500 uppercase tracking-widest font-black mb-1">Held Shares</div>
                    <div className="text-sm font-mono text-slate-300 font-bold">{item.shares}</div>
                  </div>
                  <div className="text-right">
                    <div className="text-[10px] text-slate-500 uppercase tracking-widest font-black mb-1">Capital Value</div>
                    <div className="text-sm font-mono text-white font-black">{item.value}</div>
                  </div>
                  <div className="flex items-center gap-1 bg-emerald-500/10 text-emerald-400 px-3 py-1.5 rounded-lg border border-emerald-500/20">
                    <ChevronUp className="w-4 h-4" />
                    <span className="text-xs font-bold font-mono">{item.change}</span>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {researchQueue.map((item, idx) => (
              <motion.div
                key={item.target}
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: idx * 0.1 }}
                className="bg-slate-800/40 border border-emerald-500/20 p-6 rounded-3xl relative overflow-hidden group hover:bg-slate-800/80 transition-colors"
              >
                <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/10 blur-[50px]" />
                <div className="flex justify-between items-start mb-6 relative z-10">
                  <div className="w-12 h-12 bg-emerald-500/20 rounded-xl flex items-center justify-center text-emerald-400 border border-emerald-500/30">
                    <Bot className="w-6 h-6" />
                  </div>
                  <span className="bg-slate-900 text-emerald-400 text-[9px] px-3 py-1 rounded-full uppercase tracking-widest font-black border border-emerald-500/30">
                    AI Agent Active
                  </span>
                </div>
                <h4 className="text-xl font-black text-white mb-2 relative z-10">{item.target}</h4>
                <p className="text-xs text-slate-400 font-medium mb-6 relative z-10 min-h-[32px]">{item.focus}</p>
                
                <div className="relative z-10">
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-[10px] font-bold text-slate-300 uppercase tracking-wider">{item.status}</span>
                    <span className="text-[10px] font-mono text-emerald-400 font-bold">{item.progress}%</span>
                  </div>
                  <div className="w-full h-2 bg-slate-900 rounded-full overflow-hidden border border-slate-700">
                    <div 
                      className="h-full bg-gradient-to-r from-emerald-600 to-teal-400 relative"
                      style={{ width: `${item.progress}%` }}
                    >
                      <div className="absolute top-0 right-0 bottom-0 w-4 bg-white/30 animate-[ping_2s_ease-in-out_infinite]" />
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
