const fs = require('fs');
let content = fs.readFileSync('src/components/bank/PastOrdersView.tsx', 'utf8');

const targetImports = `import React, { useState } from "react";
import { FileDown, ChevronLeft, ChevronRight, CheckCircle2, Clock } from "lucide-react";`;
const replacementImports = `import React, { useState, useMemo } from "react";
import { FileDown, ChevronLeft, ChevronRight, CheckCircle2, Clock, TrendingUp } from "lucide-react";
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from "recharts";`;

content = content.replace(targetImports, replacementImports);

const targetComponentStart = `export function PastOrdersView({ transactions }: { transactions: any[] }) {
  const [currentPage, setCurrentPage] = useState(1);`;

const replacementComponentStart = `export function PastOrdersView({ transactions }: { transactions: any[] }) {
  const [currentPage, setCurrentPage] = useState(1);

  // Filter food delivery transactions
  const foodDeliveryData = useMemo(() => {
    const foodTxns = transactions.filter(t => 
      t.recipient && t.recipient.toLowerCase().includes("uber eats")
    );
    
    // Group by month for the last 6 months
    const last6Months = Array.from({length: 6}, (_, i) => {
      const d = new Date();
      d.setMonth(d.getMonth() - (5 - i));
      return { 
        month: d.toLocaleString('default', { month: 'short' }),
        monthNum: d.getMonth(),
        year: d.getFullYear(),
        totalValue: 0,
        frequency: 0
      };
    });

    foodTxns.forEach(txn => {
      const d = new Date(txn.date);
      const m = d.getMonth();
      const y = d.getFullYear();
      const bucket = last6Months.find(b => b.monthNum === m && b.year === y);
      if (bucket) {
        bucket.totalValue += Math.abs(txn.amount);
        bucket.frequency += 1;
      }
    });

    return last6Months;
  }, [transactions]);
`;

content = content.replace(targetComponentStart, replacementComponentStart);

const targetHeader = `<div className="flex justify-between items-center mb-6">
        <div>
          <h2 className="text-xl font-bold text-white tracking-tight">Institutional Past Orders</h2>
          <p className="text-slate-400 text-sm mt-1">Review your completed capital allocations and cleared transactions.</p>
        </div>`;

const replacementHeader = `<div className="flex flex-col md:flex-row gap-6 mb-6">
        <div className="flex-1">
          <h2 className="text-xl font-bold text-white tracking-tight">Institutional Past Orders</h2>
          <p className="text-slate-400 text-sm mt-1">Review your completed capital allocations and cleared transactions.</p>
          
          <div className="mt-6 bg-slate-950 border border-slate-800 rounded-2xl p-4 h-48 w-full">
             <div className="flex items-center gap-2 mb-2">
               <TrendingUp className="w-4 h-4 text-emerald-500" />
               <span className="text-xs font-bold text-slate-300 uppercase tracking-wider">Food Delivery Activity (6 Mo)</span>
             </div>
             <ResponsiveContainer width="100%" height="100%">
               <AreaChart data={foodDeliveryData} margin={{ top: 5, right: 0, left: -20, bottom: 0 }}>
                 <defs>
                   <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
                     <stop offset="5%" stopColor="#10b981" stopOpacity={0.3}/>
                     <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                   </linearGradient>
                 </defs>
                 <CartesianGrid strokeDasharray="3 3" stroke="#334155" vertical={false} />
                 <XAxis dataKey="month" stroke="#64748b" fontSize={10} tickLine={false} axisLine={false} />
                 <YAxis stroke="#64748b" fontSize={10} tickLine={false} axisLine={false} tickFormatter={(value) => \`$\${value}\`} />
                 <Tooltip 
                   contentStyle={{ backgroundColor: '#0f172a', borderColor: '#1e293b', fontSize: '11px', borderRadius: '8px' }}
                   itemStyle={{ color: '#10b981' }}
                 />
                 <Area type="monotone" dataKey="totalValue" stroke="#10b981" strokeWidth={2} fillOpacity={1} fill="url(#colorValue)" />
               </AreaChart>
             </ResponsiveContainer>
          </div>
        </div>`;

content = content.replace(targetHeader, replacementHeader);

fs.writeFileSync('src/components/bank/PastOrdersView.tsx', content);
console.log("Updated PastOrdersView.tsx");
