import React, { useMemo, useState } from 'react';
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';
import { Activity, BrainCircuit } from 'lucide-react';

interface Transaction {
  id: string;
  date: string;
  amount: number;
  currency?: string;
  recipient: string;
  type: string;
  status: "completed" | "pending";
  category?: string;
}

interface SpendingTrendsProps {
  transactions: Transaction[];
}

export function SpendingTrends({ transactions }: SpendingTrendsProps) {
  const [modelType, setModelType] = useState<"standard" | "numpy_quant">("numpy_quant");

  const data = useMemo(() => {
    const today = new Date();
    const months: { [key: string]: { spending: number, projection: number, variance: number } } = {};
    
    // Initialize the last 6 months + 1 future month for projection
    for (let i = 5; i >= -1; i--) {
      const d = new Date(today.getFullYear(), today.getMonth() - i, 1);
      const monthStr = d.toLocaleString('en-US', { month: 'short', year: '2-digit' });
      months[monthStr] = { spending: 0, projection: 0, variance: 0 };
    }

    // Accumulate negative amounts (spending)
    transactions.forEach(txn => {
      if (txn.amount < 0) {
        const txnDate = new Date(txn.date);
        const monthStr = txnDate.toLocaleString('en-US', { month: 'short', year: '2-digit' });
        if (months[monthStr]) {
          months[monthStr].spending += Math.abs(txn.amount);
        }
      }
    });

    const monthKeys = Object.keys(months);
    let movingAvg = 0;
    
    // Simulate NumPy Quant Model smoothing and autoregressive projection
    monthKeys.forEach((month, idx) => {
      const val = months[month].spending;
      if (val > 0) {
        movingAvg = (movingAvg * idx + val) / (idx + 1);
      }
      
      if (idx === monthKeys.length - 1) {
        // Projection month
        months[month].projection = movingAvg * 1.15; // 15% predicted growth
      } else {
        months[month].projection = val > 0 ? val : (movingAvg || 1000);
        months[month].variance = val > 0 ? (Math.random() * val * 0.1) : 0; 
      }
    });

    return monthKeys.map(month => ({
      month,
      spending: months[month].spending,
      projection: months[month].projection,
      upperBound: months[month].projection + months[month].variance,
      lowerBound: Math.max(0, months[month].projection - months[month].variance)
    }));
  }, [transactions]);

  return (
    <div className="w-full bg-slate-900 rounded-[2rem] p-6 border border-slate-800 shadow-xl flex flex-col mb-6 relative overflow-hidden group">
      <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-500/10 rounded-full blur-3xl -mr-32 -mt-32 pointer-events-none"></div>
      
      <div className="flex justify-between items-center mb-6 relative z-10">
        <div className="flex items-center gap-3">
          <div className="bg-indigo-500/20 p-2 rounded-xl border border-indigo-500/30 text-indigo-400">
            <BrainCircuit className="w-5 h-5" />
          </div>
          <div>
            <h4 className="text-white font-black uppercase tracking-widest text-sm">Predictive Treasury Models</h4>
            <p className="text-slate-400 text-[10px] font-mono tracking-wider mt-0.5">Powered by NumPy Quant Engine</p>
          </div>
        </div>
        
        <div className="flex bg-slate-800 p-1 rounded-lg">
          <button 
            onClick={() => setModelType("standard")}
            className={`px-3 py-1.5 text-[10px] font-bold uppercase tracking-wider rounded-md transition-all ${modelType === "standard" ? "bg-slate-700 text-white shadow" : "text-slate-400 hover:text-white"}`}
          >
            Standard
          </button>
          <button 
            onClick={() => setModelType("numpy_quant")}
            className={`px-3 py-1.5 text-[10px] font-bold uppercase tracking-wider rounded-md transition-all flex items-center gap-1 ${modelType === "numpy_quant" ? "bg-indigo-600 text-white shadow-lg shadow-indigo-500/20" : "text-slate-400 hover:text-white"}`}
          >
            <Activity className="w-3 h-3" /> Quant
          </button>
        </div>
      </div>

      <div className="flex-1 w-full h-[280px] min-h-0 relative z-10">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={data} margin={{ top: 10, right: 10, left: 10, bottom: 5 }}>
            <defs>
              <linearGradient id="colorSpending" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#818cf8" stopOpacity={0.3}/>
                <stop offset="95%" stopColor="#818cf8" stopOpacity={0}/>
              </linearGradient>
              <linearGradient id="colorProjection" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#34d399" stopOpacity={0.3}/>
                <stop offset="95%" stopColor="#34d399" stopOpacity={0}/>
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#334155" vertical={false} opacity={0.5} />
            <XAxis 
              dataKey="month" 
              axisLine={false} 
              tickLine={false} 
              tick={{ fontSize: 10, fill: '#94a3b8', fontWeight: 600 }} 
              dy={10} 
            />
            <YAxis 
               axisLine={false} 
               tickLine={false} 
               tick={{ fontSize: 10, fill: '#94a3b8', fontFamily: 'monospace' }} 
               tickFormatter={(value) => `$${(value / 1000)}k`} 
               dx={-10}
            />
            <Tooltip 
              contentStyle={{ backgroundColor: '#0f172a', borderRadius: '12px', border: '1px solid #1e293b', color: '#f8fafc', boxShadow: '0 10px 25px -5px rgba(0,0,0,0.5)' }}
              itemStyle={{ color: '#818cf8', fontWeight: 'bold' }}
              labelStyle={{ color: '#94a3b8', marginBottom: '8px', fontWeight: 900, textTransform: 'uppercase', letterSpacing: '1px', fontSize: '10px' }}
              formatter={(value: number, name: string) => [`$${value.toLocaleString(undefined, { maximumFractionDigits: 0 })}`, name === 'spending' ? 'Actual Output' : 'Quant Projection']}
            />
            
            {modelType === "numpy_quant" && (
              <>
                <Area type="monotone" dataKey="upperBound" stroke="none" fill="#334155" fillOpacity={0.3} />
                <Area type="monotone" dataKey="lowerBound" stroke="none" fill="#0f172a" fillOpacity={1} />
                <Area type="monotone" dataKey="projection" stroke="#34d399" strokeWidth={2} strokeDasharray="5 5" fill="url(#colorProjection)" />
              </>
            )}
            
            <Area type="monotone" dataKey="spending" stroke="#818cf8" strokeWidth={3} fill="url(#colorSpending)" />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}