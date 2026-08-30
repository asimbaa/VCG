import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Bitcoin, Activity, Lock, ArrowUpRight, ArrowDownRight, Wallet, ShieldCheck, Zap, Database, Server, RefreshCw } from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

const btcData = Array.from({ length: 30 }).map((_, i) => ({
  day: i + 1,
  price: 94000 + Math.random() * 8000 + (i * 500)
}));

const holdings = [
  { asset: 'Bitcoin', symbol: 'BTC', amount: '845,210.00', value: 85200000000, color: '#f7931a', change: '+4.2%' },
  { asset: 'Ethereum', symbol: 'ETH', amount: '14,200,500.00', value: 52000000000, color: '#627eea', change: '+5.8%' },
  { asset: 'Solana', symbol: 'SOL', amount: '450,000,000.00', value: 85000000000, color: '#14F195', change: '+12.4%' },
  { asset: 'USDC (Treasury Reserve)', symbol: 'USDC', amount: '120,000,000,000.00', value: 120000000000, color: '#2775ca', change: '0.0%' },
];

export function CryptoPortfolioTab() {
  const [activeAsset, setActiveAsset] = useState('BTC');

  const formatCurrency = (val: number) => {
    if (val >= 1e9) return `$${(val / 1e9).toFixed(2)}B`;
    if (val >= 1e6) return `$${(val / 1e6).toFixed(2)}M`;
    return `$${val.toLocaleString()}`;
  };

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      <div className="bg-slate-900 rounded-3xl p-8 border border-slate-800 shadow-2xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-orange-500/10 rounded-full blur-[100px] pointer-events-none translate-x-1/3 -translate-y-1/3" />
        <div className="relative z-10 flex flex-col md:flex-row justify-between items-start md:items-end gap-6">
          <div>
             <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 bg-orange-500/10 border border-orange-500/20 rounded-xl flex items-center justify-center">
                <Bitcoin className="w-6 h-6 text-orange-400" />
              </div>
              <div>
                <h1 className="text-3xl font-black text-white uppercase tracking-widest">Sovereign Crypto Vault</h1>
                <p className="text-slate-400 font-mono text-sm">Tier-1 Institutional Digital Asset Accumulation & Cold Storage.</p>
              </div>
            </div>
            <div className="mt-8">
              <div className="text-slate-500 font-black uppercase tracking-widest text-xs mb-1">Total Digital Asset Value (USD)</div>
              <div className="text-6xl font-black text-white tracking-tighter flex items-center gap-4">
                $342.20B
                <span className="text-sm font-bold text-emerald-400 bg-emerald-500/10 px-3 py-1 rounded-full border border-emerald-500/20 flex items-center gap-1">
                  <ArrowUpRight className="w-4 h-4" /> +8.4% 24h
                </span>
              </div>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-slate-950/50 border border-slate-800 p-4 rounded-xl backdrop-blur-sm">
              <div className="text-slate-500 text-[10px] font-black uppercase tracking-widest mb-1">Cold Storage Security</div>
              <div className="text-xl font-bold text-emerald-400 flex items-center gap-2">
                HSM Grade-A <ShieldCheck className="w-4 h-4" />
              </div>
            </div>
            <div className="bg-slate-950/50 border border-slate-800 p-4 rounded-xl backdrop-blur-sm">
              <div className="text-slate-500 text-[10px] font-black uppercase tracking-widest mb-1">Daily Staking Yield</div>
              <div className="text-xl font-bold text-blue-400 flex items-center gap-2">
                +$45.2M <Zap className="w-4 h-4" />
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white rounded-3xl border border-slate-200 p-6">
             <div className="flex items-center justify-between mb-6">
               <h3 className="font-black text-slate-900 uppercase tracking-widest text-sm flex items-center gap-2">
                 <Activity className="w-4 h-4 text-slate-400" /> Market Dynamics (BTC)
               </h3>
               <div className="text-sm font-bold text-slate-500 bg-slate-100 px-3 py-1 rounded-lg">30D Accumulation Phase</div>
             </div>
             <div className="h-[300px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={btcData}>
                    <defs>
                      <linearGradient id="colorPrice" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#f7931a" stopOpacity={0.3}/>
                        <stop offset="95%" stopColor="#f7931a" stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                    <XAxis dataKey="day" hide />
                    <YAxis domain={['auto', 'auto']} hide />
                    <Tooltip 
                      contentStyle={{ backgroundColor: '#0f172a', border: 'none', borderRadius: '12px', color: '#fff' }}
                      itemStyle={{ color: '#f7931a', fontWeight: 'bold' }}
                    />
                    <Area type="monotone" dataKey="price" stroke="#f7931a" strokeWidth={3} fillOpacity={1} fill="url(#colorPrice)" />
                  </AreaChart>
                </ResponsiveContainer>
             </div>
          </div>

          <div className="bg-slate-900 rounded-3xl border border-slate-800 p-6 text-white overflow-hidden relative">
             <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-500/10 rounded-full blur-3xl -mr-20 -mt-20 pointer-events-none" />
             <h3 className="font-black uppercase tracking-widest text-sm flex items-center gap-2 mb-6">
               <Server className="w-4 h-4 text-indigo-400" /> Proprietary OTC Accumulation Protocol
             </h3>
             <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-slate-950 border border-slate-800 p-4 rounded-xl">
                  <div className="text-slate-500 text-[10px] font-black uppercase tracking-widest mb-2">Algorithm Status</div>
                  <div className="text-emerald-400 font-bold flex items-center gap-2"><RefreshCw className="w-4 h-4 animate-spin-slow" /> ACTIVE (TWAP)</div>
                  <p className="text-xs text-slate-400 mt-2">DCAing $500M daily across 14 Tier-1 liquidity venues to prevent market slippage.</p>
                </div>
                <div className="bg-slate-950 border border-slate-800 p-4 rounded-xl">
                  <div className="text-slate-500 text-[10px] font-black uppercase tracking-widest mb-2">Block Volume (24h)</div>
                  <div className="text-white font-bold text-xl">4,250 BTC</div>
                  <p className="text-xs text-slate-400 mt-2">Acquired via Dark Pool network.</p>
                </div>
                <div className="bg-slate-950 border border-slate-800 p-4 rounded-xl">
                  <div className="text-slate-500 text-[10px] font-black uppercase tracking-widest mb-2">Network Fees Saved</div>
                  <div className="text-indigo-400 font-bold text-xl">$1.2M</div>
                  <p className="text-xs text-slate-400 mt-2">Optimized via custom Lightning/L2 routing.</p>
                </div>
             </div>
          </div>
        </div>

        <div className="bg-white border border-slate-200 rounded-3xl p-6">
          <h3 className="font-black text-slate-900 uppercase tracking-widest text-sm mb-6 pb-4 border-b border-slate-100 flex items-center gap-2">
            <Database className="w-4 h-4 text-slate-400" /> Reserve Assets
          </h3>
          <div className="space-y-4">
            {holdings.map((h, i) => (
              <div key={i} className="p-4 rounded-2xl bg-slate-50 border border-slate-100 hover:border-slate-300 transition-colors">
                <div className="flex justify-between items-start mb-2">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full" style={{ backgroundColor: h.color }} />
                    <span className="font-bold text-sm text-slate-900">{h.asset}</span>
                  </div>
                  <span className="text-xs font-bold text-emerald-500 bg-emerald-50 px-2 py-1 rounded-md">{h.change}</span>
                </div>
                <div className="flex justify-between items-end mt-4">
                  <div>
                    <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Holdings</div>
                    <div className="font-mono text-slate-700 text-sm font-bold">{h.amount} <span className="text-slate-400">{h.symbol}</span></div>
                  </div>
                  <div className="text-right">
                    <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Fiat Value</div>
                    <div className="font-black text-slate-900 text-lg tracking-tight">{formatCurrency(h.value)}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
          <div className="mt-6">
            <button className="w-full py-4 bg-slate-900 hover:bg-slate-800 text-white rounded-xl font-bold uppercase tracking-widest text-xs transition-colors flex items-center justify-center gap-2">
              <Lock className="w-4 h-4" /> Verify HSM Signatures
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
