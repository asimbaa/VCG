import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { ArrowDownUp, RefreshCw, BarChart3, Minimize2 } from 'lucide-react';
import { toast } from 'sonner';

export function LiquidityNettingWidget() {
  const [isNetting, setIsNetting] = useState(false);
  const [exposure, setExposure] = useState(14500000);
  
  const handleNetting = () => {
    setIsNetting(true);
    toast.info("Initiating multi-dimensional liquidity netting across 4 global subsidiaries...");
    
    setTimeout(() => {
      setExposure(0);
      setIsNetting(false);
      toast.success("FX Exposure reduced to ZERO via autonomous internal ledger offset.");
    }, 3000);
  };
  
  useEffect(() => {
    if (exposure === 0) {
      const t = setTimeout(() => setExposure(Math.floor(Math.random() * 5000000) + 10000000), 10000);
      return () => clearTimeout(t);
    }
  }, [exposure]);

  return (
    <div className="bg-slate-900 rounded-[2.5rem] p-8 border border-slate-800 relative overflow-hidden group">
      <div className="absolute top-0 right-0 w-64 h-64 bg-cyan-500/10 blur-[80px] rounded-full group-hover:bg-cyan-500/20 transition-colors pointer-events-none" />
      
      <div className="relative z-10">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h3 className="text-xl font-black text-white italic tracking-tighter uppercase flex items-center gap-2">
              <Minimize2 className="w-5 h-5 text-cyan-400" />
              Liquidity Netting
            </h3>
            <p className="text-slate-400 text-xs font-bold uppercase tracking-widest mt-1">
              Multi-Dimensional Offset
            </p>
          </div>
          <div className="px-3 py-1 bg-cyan-500/20 border border-cyan-500/30 rounded-full flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-cyan-400 animate-ping" />
            <span className="text-[10px] font-black text-cyan-400 uppercase tracking-widest">Active</span>
          </div>
        </div>

        <div className="flex gap-4 mb-6">
          <div className="flex-1 bg-slate-950 rounded-2xl p-4 border border-slate-800">
            <div className="text-xs text-slate-500 font-bold uppercase tracking-widest mb-1">Total FX Exposure</div>
            <div className={`text-2xl font-mono font-bold ${exposure === 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
              ${exposure.toLocaleString()}
            </div>
          </div>
          <div className="flex-1 bg-slate-950 rounded-2xl p-4 border border-slate-800">
            <div className="text-xs text-slate-500 font-bold uppercase tracking-widest mb-1">Offset Efficiency</div>
            <div className="text-2xl font-mono font-bold text-cyan-400">
              {exposure === 0 ? '100%' : '64%'}
            </div>
          </div>
        </div>

        <button 
          disabled={isNetting || exposure === 0}
          onClick={handleNetting}
          className="w-full py-4 bg-cyan-600 hover:bg-cyan-500 disabled:opacity-50 text-white font-black uppercase tracking-widest text-xs rounded-xl transition-all shadow-[0_0_20px_rgba(6,182,212,0.3)] flex items-center justify-center gap-2"
        >
          {isNetting ? (
            <><RefreshCw className="w-4 h-4 animate-spin" /> Neutralizing Exposure...</>
          ) : exposure === 0 ? (
            <><BarChart3 className="w-4 h-4" /> Exposure Neutralized</>
          ) : (
            <><ArrowDownUp className="w-4 h-4" /> Execute Global Offset</>
          )}
        </button>
      </div>
    </div>
  );
}
