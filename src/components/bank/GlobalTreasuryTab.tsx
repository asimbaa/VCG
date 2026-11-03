import React, { useState, useEffect } from 'react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend } from 'recharts';
import { motion } from 'framer-motion';
import { Globe, TrendingUp, ShieldCheck, DollarSign, Activity, Lock, BarChart3, Database, Zap, Sparkles, CreditCard, ChevronRight } from 'lucide-react';
import { MassiveRateExpansionModal } from './MassiveRateExpansionModal';

const yieldData = [
  { month: 'Jan', yield: 2.1, benchmark: 1.8 },
  { month: 'Feb', yield: 2.25, benchmark: 1.82 },
  { month: 'Mar', yield: 2.4, benchmark: 1.85 },
  { month: 'Apr', yield: 2.8, benchmark: 1.9 },
  { month: 'May', yield: 3.1, benchmark: 1.88 },
  { month: 'Jun', yield: 3.5, benchmark: 1.92 },
  { month: 'Jul', yield: 3.8, benchmark: 1.95 },
  { month: 'Aug', yield: 4.12, benchmark: 1.91 }
];

const allocationData = [
  { name: 'Fiat Reserves (AUD/USD)', value: 2450000000000, color: '#3b82f6' },
  { name: 'Strategic Equity Stakes', value: 800000000000, color: '#10b981' },
  { name: 'Corporate Bonds (High Yield)', value: 500000000000, color: '#8b5cf6' },
  { name: 'Physical Real Estate', value: 850000000000, color: '#f59e0b' },
  { name: 'Deep Tech & Compute', value: 75000000000, color: '#ec4899' },
  { name: 'Sovereign Crypto Vault', value: 1250000000000, color: '#06b6d4' }
];

const formatTrillions = (value: number) => {
    return `${(value / 1000000000000).toFixed(2)}T`;
  };

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-slate-900 border border-slate-700 p-4 rounded-xl shadow-2xl">
          <p className="text-white font-bold mb-2">{label}</p>
          {payload.map((entry: any, index: number) => (
            <div key={`tooltip-entry-${entry.name || 'entry'}-${index}`} className="flex items-center gap-2 text-sm font-mono">
              <div className="w-2 h-2 rounded-full" style={{ backgroundColor: entry.color }} />
              <span className="text-slate-300">{entry.name}:</span>
              <span className="text-white font-bold">{entry.name === 'value' ? formatTrillions(entry.value) : entry.value + '%'}</span>
            </div>
          ))}
        </div>
      );
    }
    return null;
  };

export function GlobalTreasuryTab() {
  const [activeMetric, setActiveMetric] = useState<'yield' | 'allocation'>('yield');
  const [isRateExpansionOpen, setIsRateExpansionOpen] = useState(false);
  const [activeExpansion, setActiveExpansion] = useState<{
    tierName: string;
    expandedApy: number;
    cashbackRate: number;
    treasuryMultiplier: number;
  }>(() => {
    try {
      const saved = localStorage.getItem("valourian_active_rate_expansion");
      if (saved) return JSON.parse(saved);
    } catch {}
    return {
      tierName: "Quantum Treasury Multiplier",
      expandedApy: 0.15,
      cashbackRate: 0.10,
      treasuryMultiplier: 5.0
    };
  });

  useEffect(() => {
    const handleExpansion = (e: any) => {
      if (e.detail) {
        setActiveExpansion(e.detail);
      }
    };
    window.addEventListener("valourian_rate_expansion_activated", handleExpansion);
    return () => window.removeEventListener("valourian_rate_expansion_activated", handleExpansion);
  }, []);
  
  const totalAUM = allocationData.reduce((acc, curr) => acc + curr.value, 0);

  
  return (
    <div className="max-w-7xl mx-auto space-y-6">
      {/* Header Section */}
      <div className="bg-slate-900 rounded-3xl p-8 border border-slate-800 shadow-2xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-blue-600/10 rounded-full blur-[100px] pointer-events-none translate-x-1/3 -translate-y-1/3" />
        
        <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6 relative z-10">
          <div>
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 bg-blue-500/10 border border-blue-500/20 rounded-xl flex items-center justify-center">
                <Globe className="w-6 h-6 text-blue-400" />
              </div>
              <div>
                <h1 className="text-3xl font-black text-white uppercase tracking-widest">Global Treasury</h1>
                <p className="text-slate-400 font-mono text-sm">Tier-1 Institutional Asset Management & Algorithmic Yields.</p>
              </div>
            </div>
            
            <div className="mt-8">
              <div className="text-slate-500 font-black uppercase tracking-widest text-xs mb-1">Total Assets Under Management (AUM)</div>
              <div className="text-6xl font-black text-white tracking-tighter flex items-center gap-4">
                {formatTrillions(totalAUM)}
                <span className="text-sm font-bold text-emerald-400 bg-emerald-500/10 px-3 py-1 rounded-full border border-emerald-500/20 flex items-center gap-1">
                  <TrendingUp className="w-4 h-4" /> +14.2% YTD
                </span>
                <span className="text-sm font-bold text-blue-400 bg-blue-500/10 px-3 py-1 rounded-full border border-blue-500/20 flex items-center gap-1">
                  <DollarSign className="w-4 h-4" /> +$4.82B Daily Cashflow
                </span>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="bg-slate-950/50 border border-slate-800 p-4 rounded-xl backdrop-blur-sm min-w-[160px]">
              <div className="text-slate-500 text-[10px] font-black uppercase tracking-widest mb-1">Liquidity Ratio</div>
              <div className="text-2xl font-bold text-white">61.2%</div>
            </div>
            <div className="bg-slate-950/50 border border-slate-800 p-4 rounded-xl backdrop-blur-sm min-w-[160px]">
              <div className="text-slate-500 text-[10px] font-black uppercase tracking-widest mb-1">Sovereign Rating</div>
              <div className="text-2xl font-bold text-white flex items-center gap-2">
                AAA <ShieldCheck className="w-5 h-5 text-emerald-400" />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Massive Rate Expansion Banner */}
      <div className="bg-gradient-to-r from-emerald-950/80 via-slate-900 to-indigo-950/80 rounded-3xl p-6 border border-emerald-500/40 shadow-xl flex flex-col md:flex-row items-start md:items-center justify-between gap-6 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none -mr-20 -mt-20" />
        <div className="flex items-start sm:items-center gap-4 relative z-10">
          <div className="w-14 h-14 rounded-2xl bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center text-emerald-400 flex-shrink-0 shadow-inner">
            <Zap className="w-7 h-7 animate-pulse" />
          </div>
          <div>
            <div className="flex items-center gap-2 mb-1 flex-wrap">
              <span className="text-[10px] font-black uppercase tracking-widest text-emerald-400 bg-emerald-500/10 px-2.5 py-0.5 rounded-full border border-emerald-500/20 flex items-center gap-1">
                <Sparkles className="w-3 h-3" /> Massive Rate Expansion
              </span>
              <span className="text-xs font-mono text-slate-300">
                Active Tier: <strong className="text-white">{activeExpansion.tierName}</strong> ({(activeExpansion.expandedApy * 100).toFixed(2)}% APY)
              </span>
            </div>
            <h3 className="text-lg font-black text-white uppercase tracking-wider">
              Pay via Bank Card to Scale Institutional Rates & Yields
            </h3>
            <p className="text-xs text-slate-400 font-mono mt-0.5 max-w-2xl">
              1-Click settlement using Centurion Black or CBA Diamond to unlock up to 25.00% APY, 15% Cashback, and 10x Treasury Multiplier.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3 relative z-10 w-full sm:w-auto">
          <button
            onClick={() => setIsRateExpansionOpen(true)}
            className="w-full sm:w-auto px-6 py-3.5 rounded-2xl bg-gradient-to-r from-emerald-500 via-teal-500 to-emerald-600 hover:from-emerald-400 hover:to-teal-500 text-slate-950 font-black text-xs uppercase tracking-wider transition-all shadow-lg hover:shadow-emerald-500/20 flex items-center justify-center gap-2.5 cursor-pointer"
          >
            <CreditCard className="w-4 h-4 text-slate-950" />
            <span>Pay & Expand Rates</span>
            <ChevronRight className="w-4 h-4 text-slate-950" />
          </button>
        </div>
      </div>

      <MassiveRateExpansionModal
        isOpen={isRateExpansionOpen}
        onClose={() => setIsRateExpansionOpen(false)}
      />

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left Column: Visualizations */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-sm">
            <div className="flex items-center justify-between mb-8 border-b border-slate-100 pb-4">
              <div className="flex items-center gap-3">
                <BarChart3 className="w-5 h-5 text-slate-800" />
                <h3 className="font-black text-slate-900 uppercase tracking-widest text-sm">Asset Intelligence</h3>
              </div>
              <div className="flex bg-slate-100 p-1 rounded-lg">
                <button 
                  onClick={() => setActiveMetric('yield')}
                  className={`px-4 py-1.5 rounded-md text-xs font-bold uppercase tracking-widest transition-all ${activeMetric === 'yield' ? 'bg-white text-blue-600 shadow-sm' : 'text-slate-500 hover:text-slate-800'}`}
                >
                  Yield Spread
                </button>
                <button 
                  onClick={() => setActiveMetric('allocation')}
                  className={`px-4 py-1.5 rounded-md text-xs font-bold uppercase tracking-widest transition-all ${activeMetric === 'allocation' ? 'bg-white text-blue-600 shadow-sm' : 'text-slate-500 hover:text-slate-800'}`}
                >
                  Allocation
                </button>
              </div>
            </div>

            <div className="h-[350px] w-full min-w-0 relative">
              {activeMetric === 'yield' ? (
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="w-full h-full min-w-0">
                  <ResponsiveContainer width="100%" height="100%" minWidth={0} minHeight={200}>
                    <AreaChart data={yieldData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                      <defs>
                        <linearGradient id="colorYield" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3}/>
                          <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                        </linearGradient>
                        <linearGradient id="colorBench" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#94a3b8" stopOpacity={0.1}/>
                          <stop offset="95%" stopColor="#94a3b8" stopOpacity={0}/>
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                      <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#64748b' }} dy={10} />
                      <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#64748b' }} tickFormatter={(val) => `${val}%`} dx={-10} />
                      <RechartsTooltip content={CustomTooltip} />
                      <Area type="monotone" dataKey="yield" name="Valourian Alpha" stroke="#3b82f6" strokeWidth={3} fillOpacity={1} fill="url(#colorYield)" />
                      <Area type="monotone" dataKey="benchmark" name="Global Benchmark" stroke="#94a3b8" strokeWidth={2} fillOpacity={1} fill="url(#colorBench)" strokeDasharray="5 5" />
                    </AreaChart>
                  </ResponsiveContainer>
                </motion.div>
              ) : (
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="w-full h-full min-w-0 flex items-center justify-center">
                  <ResponsiveContainer width="100%" height="100%" minWidth={0} minHeight={200}>
                    <PieChart>
                      <Pie
                        data={allocationData}
                        cx="50%"
                        cy="50%"
                        innerRadius={80}
                        outerRadius={120}
                        paddingAngle={2}
                        dataKey="value"
                        stroke="none"
                      >
                        {allocationData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <RechartsTooltip content={CustomTooltip} />
                      <Legend 
                        layout="vertical" 
                        verticalAlign="middle" 
                        align="right"
                        iconType="circle"
                        wrapperStyle={{ fontSize: '11px', fontWeight: 'bold', fontFamily: 'monospace' }}
                      />
                    </PieChart>
                  </ResponsiveContainer>
                </motion.div>
              )}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
             <div className="bg-indigo-600 rounded-3xl p-6 text-white relative overflow-hidden">
                <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full blur-2xl -mr-10 -mt-10" />
                <Database className="w-8 h-8 text-indigo-300 mb-4" />
                <h4 className="font-bold text-lg mb-2">Dark Pool Liquidity</h4>
                <p className="text-indigo-200 text-sm font-medium leading-relaxed mb-4">
                  Proprietary OTC routing networks are handling billions in daily flow with zero market impact and 98.4% reduced slippage.
                </p>
                <div className="text-xs font-black uppercase tracking-widest bg-white/10 px-3 py-1.5 rounded-lg inline-block border border-white/20">
                  Routing Optimal
                </div>
             </div>
             
             <div className="bg-slate-900 rounded-3xl p-6 text-white relative overflow-hidden border border-slate-800">
                <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/10 rounded-full blur-2xl -mr-10 -mt-10" />
                <Activity className="w-8 h-8 text-emerald-400 mb-4" />
                <h4 className="font-bold text-lg mb-2">Algorithmic Defense</h4>
                <p className="text-slate-400 text-sm font-medium leading-relaxed mb-4">
                  Quantitative hedge protocols are actively shorting volatile index baskets, preserving capital against macro-economic drawdowns.
                </p>
                <div className="text-xs font-black uppercase tracking-widest bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 px-3 py-1.5 rounded-lg inline-block">
                  Defense Active
                </div>
             </div>
          </div>
        </div>

        {/* Right Column: Key Ledgers */}
        <div className="bg-white border border-slate-200 rounded-3xl p-6">
          <h3 className="font-black text-slate-900 uppercase tracking-widest text-sm mb-6 pb-4 border-b border-slate-100 flex items-center gap-2">
            <Lock className="w-4 h-4 text-slate-400" /> Secure Ledgers
          </h3>
          
          <div className="space-y-4">
            {allocationData.map((asset, index) => (
              <div key={`treasury-alloc-${asset.name}-${index}`} className="p-4 rounded-2xl bg-slate-50 border border-slate-100 hover:border-slate-300 transition-colors cursor-pointer group">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: asset.color }} />
                    <span className="font-bold text-xs text-slate-700 uppercase tracking-wider">{asset.name}</span>
                  </div>
                  <span className="text-[10px] font-mono text-slate-400 bg-white px-2 py-0.5 rounded-md border border-slate-200">
                    {((asset.value / totalAUM) * 100).toFixed(1)}%
                  </span>
                </div>
                <div className="text-xl font-black text-slate-900 tracking-tight">
                  {formatTrillions(asset.value)}
                </div>
              </div>
            ))}
          </div>

          <div className="mt-8 p-5 bg-slate-900 rounded-2xl">
            <div className="text-[10px] font-black uppercase tracking-widest text-slate-500 mb-2">Next Automated Audit</div>
            <div className="text-white font-mono text-sm">24:00:00 UTC (Daily)</div>
            <div className="w-full bg-slate-800 rounded-full h-1 mt-3 overflow-hidden">
              <div className="bg-blue-500 h-full w-[65%]" />
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
