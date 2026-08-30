import React from 'react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line, Legend } from 'recharts';
import { TrendingUp, BarChart2 } from 'lucide-react';

const data = [
  { year: '2021', sovereign: 100, sp500: 100, nasdaq: 100 },
  { year: '2022', sovereign: 180, sp500: 95, nasdaq: 85 },
  { year: '2023', sovereign: 340, sp500: 110, nasdaq: 105 },
  { year: '2024', sovereign: 820, sp500: 125, nasdaq: 130 },
  { year: '2025', sovereign: 2100, sp500: 135, nasdaq: 155 },
  { year: '2026', sovereign: 5400, sp500: 142, nasdaq: 165 },
];

export function HistoricalYieldComparison() {
  return (
    <div className="bg-white rounded-[2.5rem] p-8 border border-slate-200 shadow-sm relative overflow-hidden mt-10">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h3 className="text-xl font-black text-slate-900 tracking-tight flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-indigo-500" />
            Historical Yield Comparison
          </h3>
          <p className="text-xs text-slate-500 font-semibold mt-1">Sovereign Strategy vs Standard Index Funds (Baseline 100)</p>
        </div>
        <div className="px-4 py-2 bg-indigo-50 text-indigo-700 text-[10px] font-black uppercase tracking-widest rounded-full flex items-center gap-2">
          <BarChart2 className="w-4 h-4" />
          Outperforming Index
        </div>
      </div>
      
      <div className="h-[300px] w-full">
        <ResponsiveContainer width="99%" height="100%">
          <LineChart data={data} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
            <XAxis dataKey="year" axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: '#64748b' }} dy={10} />
            <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: '#64748b' }} dx={-10} tickFormatter={(val) => `${val}%`} />
            <Tooltip 
              contentStyle={{ borderRadius: '1rem', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1)', fontWeight: 'bold' }}
              itemStyle={{ fontSize: '12px' }}
            />
            <Legend wrapperStyle={{ fontSize: '11px', fontWeight: 'bold' }} />
            <Line type="monotone" dataKey="sovereign" name="Sovereign AI Strategy" stroke="#4f46e5" strokeWidth={4} dot={{ r: 4, fill: '#4f46e5', strokeWidth: 2, stroke: '#fff' }} activeDot={{ r: 8 }} />
            <Line type="monotone" dataKey="nasdaq" name="NASDAQ-100" stroke="#0ea5e9" strokeWidth={2} dot={false} activeDot={{ r: 4 }} />
            <Line type="monotone" dataKey="sp500" name="S&P 500" stroke="#94a3b8" strokeWidth={2} dot={false} activeDot={{ r: 4 }} />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
