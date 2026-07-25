import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { BrainCircuit, Cpu, Sparkles, Activity, Layers, Search, Code, CheckCircle2 } from 'lucide-react';

const agentProfiles = [
  {
    id: 1,
    name: "Architect Alpha",
    role: "Venture Creation & Profitability",
    status: "Crafting Next Global Goods",
    color: "blue",
    icon: Sparkles
  },
  {
    id: 2,
    name: "Logistics Prime",
    role: "Supply Chain & Real Asset Routing",
    status: "Fulfilling Commands 24/7",
    color: "emerald",
    icon: Layers
  },
  {
    id: 3,
    name: "Quantum Yield Analyst",
    role: "Index Arbitrage & Market Dynamics",
    status: "Calculating Historical Yield Maps",
    color: "purple",
    icon: Activity
  },
  {
    id: 4,
    name: "Sovereign Exec-1",
    role: "Super-Human Command Interpreter",
    status: "Processing Natural Language Requests",
    color: "amber",
    icon: BrainCircuit
  }
];

export function ExpertAgentsView() {
  const [logs, setLogs] = useState<string[]>([
    "Architect Alpha: Designing next-gen physical asset integrations.",
    "Logistics Prime: Rerouting Apple Vision Pro shipments to Artarmon Hub."
  ]);

  useEffect(() => {
    const interval = setInterval(() => {
      const newLogs = [
        "Quantum Yield Analyst: Verified 250% baseline outperformance vs S&P 500.",
        "Sovereign Exec-1: Executed user command: Enchanting lives and livelihoods.",
        "Architect Alpha: Deployed profitability algorithm for upcoming venture.",
        "Logistics Prime: Verified Tesla Showroom coordinates for VIP delivery."
      ];
      setLogs(prev => [newLogs[Math.floor(Math.random() * newLogs.length)], ...prev].slice(0, 6));
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="bg-white rounded-[2.5rem] p-8 md:p-12 shadow-sm border border-slate-200 mt-10 relative overflow-hidden group">
      <div className="absolute top-0 right-0 w-[400px] h-[400px] bg-slate-900/5 blur-[100px] rounded-full -mr-32 -mt-32 pointer-events-none" />
      
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6 mb-12 relative z-10">
        <div>
          <h3 className="text-3xl font-black text-slate-900 tracking-tighter mb-2 flex items-center gap-3">
            <Cpu className="w-8 h-8 text-blue-500" /> Super Human Expert Agents
          </h3>
          <p className="text-slate-500 text-sm font-semibold max-w-2xl">
            Genius sets of expert AI agents working around the clock. Fulfilling commands, crafting the next sets of ventures, discovering profitabilities, and delivering proven useful goods & services to enchant lives and fortunes.
          </p>
        </div>
        <div className="px-5 py-2 bg-slate-900 text-white rounded-full text-xs font-black uppercase tracking-widest flex items-center gap-2 shadow-lg">
          <div className="w-2 h-2 bg-emerald-400 rounded-full animate-ping" />
          Active 24/7
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 relative z-10">
        {agentProfiles.map((agent) => {
          const Icon = agent.icon;
          return (
            <div key={agent.id} className="bg-slate-50 rounded-3xl p-6 border border-slate-100 hover:border-blue-500/30 transition-all hover:shadow-xl group/card">
              <div className={`w-12 h-12 rounded-2xl bg-${agent.color}-100 text-${agent.color}-600 flex items-center justify-center mb-6`}>
                <Icon className="w-6 h-6" />
              </div>
              <h4 className="text-lg font-black text-slate-900 tracking-tight mb-1">{agent.name}</h4>
              <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-4">{agent.role}</p>
              
              <div className="bg-white p-3 rounded-xl border border-slate-200">
                <div className="flex items-center gap-2 text-xs font-bold text-slate-700">
                  <div className="w-1.5 h-1.5 bg-blue-500 rounded-full animate-pulse" />
                  {agent.status}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      <div className="mt-10 bg-slate-900 rounded-3xl p-6 relative z-10 overflow-hidden">
        <div className="flex items-center justify-between mb-6">
          <h5 className="text-white text-xs font-black uppercase tracking-widest flex items-center gap-2">
            <Code className="w-4 h-4 text-emerald-400" /> Live Agent Operations
          </h5>
        </div>
        <div className="space-y-3 font-mono text-xs">
          <AnimatePresence>
            {logs.map((log, i) => (
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                key={i + log}
                className={`flex items-center gap-3 ${i === 0 ? 'text-emerald-400' : 'text-slate-500'}`}
              >
                <CheckCircle2 className="w-4 h-4 shrink-0" />
                <span className="truncate">{log}</span>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}
