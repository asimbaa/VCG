import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';

import { Network, Activity, Globe, Zap, ArrowRight, ShieldCheck, Cpu } from 'lucide-react';
import { toast } from 'sonner';

export function ReserveArbitrageWidget() {
  const [activeAsset, setActiveAsset] = useState<'RBA Bonds' | 'US Treasuries' | 'UK Gilts'>('US Treasuries');
  const [yieldRate, setYieldRate] = useState(4.25);
  const [chartData, setChartData] = useState<any[]>(Array.from({length: 10}, (_, i) => ({
    time: `10:0${i}`,
    RBA: 4.35 + (Math.random() - 0.5) * 0.02,
    US: 4.25 + (Math.random() - 0.5) * 0.02,
    UK: 3.95 + (Math.random() - 0.5) * 0.02,
  })));
  
  useEffect(() => {
    const interval = setInterval(() => {
      const assets = [
        { name: 'RBA Bonds', baseYield: 4.35, key: 'RBA' },
        { name: 'US Treasuries', baseYield: 4.25, key: 'US' },
        { name: 'UK Gilts', baseYield: 3.95, key: 'UK' }
      ];
      
      const newRBA = 4.35 + (Math.random() - 0.5) * 0.05;
      const newUS = 4.25 + (Math.random() - 0.5) * 0.05;
      const newUK = 3.95 + (Math.random() - 0.5) * 0.05;
      
      const best = [
        { name: 'RBA Bonds', currentYield: newRBA },
        { name: 'US Treasuries', currentYield: newUS },
        { name: 'UK Gilts', currentYield: newUK }
      ].sort((a, b) => b.currentYield - a.currentYield)[0];
      
      if (best.name !== activeAsset) {
        setActiveAsset(best.name as any);
        setYieldRate(best.currentYield);
      } else {
         setYieldRate(best.currentYield);
      }
      
      setChartData(prev => {
        const newData = [...prev.slice(1), {
          time: new Date().toLocaleTimeString('en-US', { hour12: false, hour: '2-digit', minute:'2-digit', second:'2-digit' }),
          RBA: newRBA,
          US: newUS,
          UK: newUK
        }];
        return newData;
      });
      
    }, 2000);
    return () => clearInterval(interval);
  }, [activeAsset]);

  return (
    <div className="bg-slate-900 rounded-[2.5rem] p-8 border border-slate-800 relative overflow-hidden group">
      <div className="absolute top-0 right-0 w-64 h-64 bg-fuchsia-500/10 blur-[80px] rounded-full group-hover:bg-fuchsia-500/20 transition-colors pointer-events-none" />
      
      <div className="relative z-10">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h3 className="text-xl font-black text-white italic tracking-tighter uppercase flex items-center gap-2">
              <Cpu className="w-5 h-5 text-fuchsia-400" />
              Sovereign Reserve Arbitrage
            </h3>
            <p className="text-slate-400 text-xs font-bold uppercase tracking-widest mt-1">
              BigQuery Deep Research / AI Heuristics
            </p>
          </div>
          <div className="px-3 py-1 bg-fuchsia-500/20 border border-fuchsia-500/30 rounded-full flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-fuchsia-400 animate-ping" />
            <span className="text-[10px] font-black text-fuchsia-400 uppercase tracking-widest">Active</span>
          </div>
        </div>

        <div className="grid grid-cols-3 gap-4 mb-8">
          {[
            { name: 'RBA Bonds', yield: 4.35, icon: ShieldCheck },
            { name: 'US Treasuries', yield: 4.25, icon: Globe },
            { name: 'UK Gilts', yield: 3.95, icon: Activity }
          ].map(asset => (
            <div 
              key={asset.name}
              className={`p-4 rounded-2xl border-2 transition-all ${activeAsset === asset.name ? 'bg-fuchsia-500/10 border-fuchsia-500 shadow-[0_0_20px_rgba(217,70,239,0.2)]' : 'bg-slate-950 border-slate-800'}`}
            >
              <div className="flex items-center gap-2 mb-2">
                <asset.icon className={`w-4 h-4 ${activeAsset === asset.name ? 'text-fuchsia-400' : 'text-slate-500'}`} />
                <span className={`text-xs font-bold ${activeAsset === asset.name ? 'text-white' : 'text-slate-400'}`}>{asset.name}</span>
              </div>
              <div className={`text-2xl font-mono font-bold ${activeAsset === asset.name ? 'text-fuchsia-400' : 'text-slate-500'}`}>
                {activeAsset === asset.name ? yieldRate.toFixed(3) : asset.yield.toFixed(2)}%
              </div>
            </div>
          ))}
        </div>


        <div className="h-48 w-full min-w-0 mb-8">
          <ResponsiveContainer width="100%" height="100%" minWidth={0} minHeight={150}>
            <LineChart data={chartData} margin={{ top: 5, right: 5, left: -20, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
              <XAxis dataKey="time" stroke="#475569" fontSize={10} tickMargin={8} />
              <YAxis domain={['auto', 'auto']} stroke="#475569" fontSize={10} tickFormatter={(v) => v.toFixed(2) + '%'} />
              <Tooltip 
                contentStyle={{ backgroundColor: '#0f172a', borderColor: '#1e293b', borderRadius: '8px', fontSize: '12px' }}
                itemStyle={{ fontWeight: 'bold' }}
              />
              <Legend iconType="circle" wrapperStyle={{ fontSize: '10px' }} />
              <Line type="monotone" dataKey="RBA" name="RBA Bonds" stroke="#10b981" strokeWidth={2} dot={false} activeDot={{ r: 4 }} />
              <Line type="monotone" dataKey="US" name="US Treasuries" stroke="#3b82f6" strokeWidth={2} dot={false} activeDot={{ r: 4 }} />
              <Line type="monotone" dataKey="UK" name="UK Gilts" stroke="#d946ef" strokeWidth={2} dot={false} activeDot={{ r: 4 }} />
            </LineChart>
          </ResponsiveContainer>
        </div>
        
        <div className="bg-slate-950 rounded-2xl p-6 border border-slate-800">
          <div className="flex items-center gap-4 mb-4">
            <div className="w-10 h-10 bg-fuchsia-500/20 rounded-xl flex items-center justify-center">
              <Network className="w-5 h-5 text-fuchsia-400" />
            </div>
            <div>
              <div className="text-sm font-bold text-white uppercase tracking-widest">Dynamic NFC Backing</div>
              <div className="text-xs text-slate-400 font-medium">All terminal taps are routed via highest yielding sovereign asset instantly.</div>
            </div>
          </div>
          
          <button 
            onClick={() => {
              toast.info("Executing deep-learning heuristic scan across global sovereign liquidity pools...");
              setTimeout(() => toast.success(`Optimal routing confirmed. All digital cards now backed by ${activeAsset} at ${yieldRate.toFixed(3)}% yield.`), 1500);
            }}
            className="w-full py-3 bg-fuchsia-600 hover:bg-fuchsia-500 text-white font-black uppercase tracking-widest text-xs rounded-xl transition-all shadow-[0_0_20px_rgba(217,70,239,0.3)]"
          >
            Force Heuristic Scan
          </button>
        </div>
      </div>
    </div>
  );
}
