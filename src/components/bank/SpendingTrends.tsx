import React, { useMemo } from 'react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts';

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
  const data = useMemo(() => {
    const today = new Date();
    const months: { [key: string]: number } = {};
    
    // Initialize the last 6 months
    for (let i = 5; i >= 0; i--) {
      const d = new Date(today.getFullYear(), today.getMonth() - i, 1);
      const monthStr = d.toLocaleString('en-US', { month: 'short', year: 'numeric' });
      months[monthStr] = 0;
    }

    // Accumulate negative amounts (spending)
    transactions.forEach(txn => {
      if (txn.amount < 0) {
        const txnDate = new Date(txn.date);
        const monthStr = txnDate.toLocaleString('en-US', { month: 'short', year: 'numeric' });
        if (months[monthStr] !== undefined) {
          months[monthStr] += Math.abs(txn.amount);
        }
      }
    });

    return Object.keys(months).map(month => ({
      month,
      spending: months[month]
    }));
  }, [transactions]);

  return (
    <div className="w-full h-[250px] bg-slate-50 rounded-2xl p-4 border border-slate-100 flex flex-col mb-6">
      <h4 className="text-sm font-bold text-slate-700 mb-4 px-2 uppercase tracking-wide">6-Month Spending Trends</h4>
      <div className="flex-1 w-full min-h-0">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data} margin={{ top: 5, right: 10, left: 10, bottom: 5 }}>
            <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: '#64748b' }} dy={10} />
            <YAxis 
              axisLine={false} 
              tickLine={false} 
              tick={{ fontSize: 10, fill: '#64748b' }} 
              tickFormatter={(value) => `$${(value / 1000)}k`} 
              dx={-10}
            />
            <Tooltip 
              cursor={{ fill: '#f1f5f9' }}
              contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.05)' }}
              formatter={(value: number) => [`$${value.toLocaleString()}`, 'Spending']}
            />
            <Bar dataKey="spending" radius={[4, 4, 0, 0]}>
              {data.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={'#3b82f6'} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
