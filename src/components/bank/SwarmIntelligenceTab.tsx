import React, { useState } from "react";
import { BrainCircuit, Cpu, Globe, ShieldCheck, Zap, ArrowRight, Activity, Database, CheckCircle2 } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export function SwarmIntelligenceTab() {
  const [prompt, setPrompt] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);
  const [activeAgents, setActiveAgents] = useState<string[]>([]);
  const [completion, setCompletion] = useState(false);

  const agents = [
    { id: "nlp", name: "Semantic Parser", icon: BrainCircuit, color: "text-blue-500", bg: "bg-blue-500/10", border: "border-blue-500/30" },
    { id: "compliance", name: "Global Compliance", icon: ShieldCheck, color: "text-purple-500", bg: "bg-purple-500/10", border: "border-purple-500/30" },
    { id: "treasury", name: "Liquidity Allocator", icon: Database, color: "text-emerald-500", bg: "bg-emerald-500/10", border: "border-emerald-500/30" },
    { id: "execution", name: "Execution Node", icon: Zap, color: "text-amber-500", bg: "bg-amber-500/10", border: "border-amber-500/30" },
  ];

  const handleExecute = (e: React.FormEvent) => {
    e.preventDefault();
    if (!prompt) return;
    
    setIsProcessing(true);
    setActiveAgents([]);
    setCompletion(false);

    // Simulate Swarm Activation
    agents.forEach((agent, index) => {
      setTimeout(() => {
        setActiveAgents(prev => [...prev, agent.id]);
      }, index * 1200);
    });

    setTimeout(() => {
      setIsProcessing(false);
      setCompletion(true);
    }, agents.length * 1200 + 1000);
  };

  return (
    <div className="w-full max-w-6xl mx-auto space-y-6">
      <div className="flex justify-between items-end">
        <div>
          <h2 className="text-3xl font-black text-white tracking-widest uppercase flex items-center gap-3">
            <BrainCircuit className="w-8 h-8 text-emerald-500" />
            Swarm Intelligence Core
          </h2>
          <p className="text-slate-400 mt-2">Natural language multi-agent orchestration for complex institutional directives.</p>
        </div>
        <div className="flex items-center gap-2 px-4 py-2 bg-emerald-500/10 border border-emerald-500/30 text-emerald-500 rounded-lg text-sm font-bold">
          <Activity className="w-4 h-4 animate-pulse" />
          Neural Net Online
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-8 shadow-xl">
            <form onSubmit={handleExecute} className="space-y-4">
              <label className="text-xs font-black uppercase tracking-widest text-slate-400 block">Executive Directive</label>
              <textarea 
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                disabled={isProcessing}
                placeholder="e.g., 'Acquire 500 BTC via OTC desks and route to institutional cold storage, ensuring all KYC/AML protocols are met...'"
                className="w-full h-32 bg-slate-950 border border-slate-800 rounded-xl p-4 text-white focus:outline-none focus:border-emerald-500 font-mono text-sm resize-none disabled:opacity-50"
              />
              <div className="flex justify-end">
                <button 
                  type="submit"
                  disabled={isProcessing || !prompt}
                  className="bg-emerald-500 text-slate-900 px-8 py-4 rounded-xl font-black uppercase tracking-widest hover:bg-emerald-400 transition-all shadow-[0_0_20px_rgba(16,185,129,0.3)] disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                >
                  {isProcessing ? (
                    <><Globe className="w-5 h-5 animate-spin" /> Orchestrating...</>
                  ) : (
                    <><Zap className="w-5 h-5" /> Deploy Swarm</>
                  )}
                </button>
              </div>
            </form>
          </div>

          <AnimatePresence>
            {(isProcessing || completion) && (
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-slate-900 border border-slate-800 rounded-2xl p-8 shadow-xl"
              >
                <h3 className="text-sm font-black uppercase tracking-widest text-slate-400 mb-6 flex items-center gap-2">
                  <Cpu className="w-4 h-4" /> Agent Telemetry
                </h3>
                
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  {agents.map((agent) => {
                    const isActive = activeAgents.includes(agent.id);
                    const isDone = completion || activeAgents.indexOf(agent.id) < activeAgents.length - 1;
                    
                    return (
                      <div key={agent.id} className={`p-4 rounded-xl border transition-all duration-500 ${isActive ? agent.bg + ' ' + agent.border : 'bg-slate-950 border-slate-800 opacity-40'}`}>
                        <agent.icon className={`w-8 h-8 mb-3 ${isActive ? agent.color : 'text-slate-600'}`} />
                        <div className={`font-bold text-sm ${isActive ? 'text-white' : 'text-slate-500'}`}>{agent.name}</div>
                        <div className={`text-xs mt-1 font-mono ${isActive ? agent.color : 'text-slate-600'}`}>
                          {isActive && !completion && activeAgents[activeAgents.length-1] === agent.id ? "PROCESSING..." : isActive ? "COMPLETE" : "STANDBY"}
                        </div>
                      </div>
                    );
                  })}
                </div>

                {completion && (
                  <motion.div 
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="mt-6 p-4 bg-emerald-500/10 border border-emerald-500/30 rounded-xl flex items-start gap-4"
                  >
                    <CheckCircle2 className="w-6 h-6 text-emerald-500 mt-1 shrink-0" />
                    <div>
                      <h4 className="text-emerald-500 font-bold mb-1">Directive Successfully Executed</h4>
                      <p className="text-slate-400 text-sm">
                        The AI Swarm has autonomously parsed your request, verified compliance boundaries, allocated necessary treasury funds, and successfully executed the cross-chain/fiat routing. Final audits have been logged to the immutable ledger.
                      </p>
                    </div>
                  </motion.div>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        <div className="space-y-6">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl">
            <h3 className="font-bold text-white mb-4">Neural Architecture</h3>
            <div className="space-y-4">
              <div className="p-4 bg-slate-950 rounded-xl border border-slate-800">
                <div className="text-xs font-bold text-emerald-500 mb-1">LLM CORE</div>
                <div className="text-sm text-white">Sovereign-Alpha V.4 (1T Params)</div>
              </div>
              <div className="p-4 bg-slate-950 rounded-xl border border-slate-800">
                <div className="text-xs font-bold text-blue-500 mb-1">LATENCY</div>
                <div className="text-sm text-white">12ms (Direct Fiber to Exchange)</div>
              </div>
              <div className="p-4 bg-slate-950 rounded-xl border border-slate-800">
                <div className="text-xs font-bold text-purple-500 mb-1">SECURITY</div>
                <div className="text-sm text-white">Quantum-Resistant Encryption</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
