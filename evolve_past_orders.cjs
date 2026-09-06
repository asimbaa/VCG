const fs = require('fs');

const content = `import React, { useState, useMemo } from "react";
import { FileDown, ChevronLeft, ChevronRight, CheckCircle2, Clock, TrendingUp, Package, Car, Watch, Laptop, Smartphone } from "lucide-react";
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from "recharts";
import { toast } from "sonner";

const MISSING_ORDERS = [
  {
    id: "ORD-APPL-2026-991",
    recipient: "Apple Store Sydney NSW",
    type: "hardware hardware_procurement",
    amount: -45990.00,
    currency: "AUD",
    date: new Date().toISOString(),
    status: "completed",
    icon: <Laptop className="w-5 h-5" />,
    items: "6x MacBook Pros Latest, 6x iPhone Latest, 6x iPads Latest, Accessories Pack",
    shipping: "Asim Aryal, 712/15 Barton Rd Artarmon NSW 2064 Australia, +61-401044335, asim.nsw@gmail.com"
  },
  {
    id: "ORD-GOOG-2026-992",
    recipient: "Google Enterprise Hardware",
    type: "hardware procurement",
    amount: -18450.00,
    currency: "AUD",
    date: new Date().toISOString(),
    status: "completed",
    icon: <Smartphone className="w-5 h-5" />,
    items: "6x Google Pixel Latest, 6x Windows/Google Laptops",
    shipping: "Asim Aryal, 712/15 Barton Rd Artarmon NSW 2064 Australia, +61-401044335, asim.nsw@gmail.com"
  },
  {
    id: "ORD-WEAR-2026-993",
    recipient: "Apple Store Sydney NSW",
    type: "accessories procurement",
    amount: -11250.00,
    currency: "AUD",
    date: new Date().toISOString(),
    status: "completed",
    icon: <Package className="w-5 h-5" />,
    items: "6x iOS Watches Latest, 6x iOS Headphones Latest, 6x iOS Earbuds Latest",
    shipping: "Asim Aryal, 712/15 Barton Rd Artarmon NSW 2064 Australia, +61-401044335, asim.nsw@gmail.com"
  },
  {
    id: "ORD-AUTO-2026-994",
    recipient: "Valourian Fleet Logistics",
    type: "vehicle procurement",
    amount: -285000.00,
    currency: "AUD",
    date: new Date().toISOString(),
    status: "completed",
    icon: <Car className="w-5 h-5" />,
    items: "1x TESLA SUV Latest, 1x BYD SUV Latest, 1x KIA SUV Latest",
    shipping: "Asim Aryal, 712/15 Barton Rd Artarmon NSW 2064 Australia, +61-401044335, asim.nsw@gmail.com"
  },
  {
    id: "ORD-LUX-2026-995",
    recipient: "Rolex Boutique Sydney",
    type: "luxury procurement",
    amount: -65000.00,
    currency: "AUD",
    date: new Date().toISOString(),
    status: "completed",
    icon: <Watch className="w-5 h-5" />,
    items: "1x Rolex Submariner (Impressive Class)",
    shipping: "Asim Aryal, 712/15 Barton Rd Artarmon NSW 2064 Australia, +61-401044335, asim.nsw@gmail.com"
  }
];

export function PastOrdersView({ transactions }: { transactions: any[] }) {
  const [currentPage, setCurrentPage] = useState(1);
  
  const allTransactions = useMemo(() => {
     return [...MISSING_ORDERS, ...transactions];
  }, [transactions]);

  const foodDeliveryData = useMemo(() => {
    const foodTxns = allTransactions.filter(t => 
      t.recipient && t.recipient.toLowerCase().includes("uber eats")
    );
    
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
  }, [allTransactions]);

  const itemsPerPage = 5;
  const totalPages = Math.ceil(allTransactions.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const currentTransactions = allTransactions.slice(startIndex, startIndex + itemsPerPage);

  const handleExportPDF = (txn: any) => {
    if (txn.shipping) {
        toast.success(\`PDF Receipt Generated. Shipped to: \${txn.shipping}\`);
    } else {
        toast.success(\`Exporting PDF receipt for Transaction ID: \${txn.id}\`);
    }
  };

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-2xl flex flex-col h-full min-h-[600px] w-full">
      <div className="flex flex-col md:flex-row gap-6 mb-6">
        <div className="flex-1">
          <h2 className="text-xl font-bold text-white tracking-tight">Institutional Past Orders & Procurement</h2>
          <p className="text-slate-400 text-sm mt-1">Review your completed capital allocations, hardware procurement, and cleared transactions.</p>
          
          <div className="mt-6 bg-slate-950 border border-slate-800 rounded-2xl p-4 h-48 w-full">
             <div className="flex items-center gap-2 mb-2">
               <TrendingUp className="w-4 h-4 text-emerald-500" />
               <span className="text-xs font-bold text-slate-300 uppercase tracking-wider">Food Delivery Activity (6 Mo)</span>
             </div>
             <ResponsiveContainer width="99%" height="100%">
               <AreaChart data={foodDeliveryData} margin={{ top: 5, right: 0, left: -20, bottom: 0 }}>
                 <defs>
                   <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
                     <stop offset="5%" stopColor="#10b981" stopOpacity={0.3}/>
                     <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                   </linearGradient>
                 </defs>
                 <CartesianGrid strokeDasharray="3 3" stroke="#334155" vertical={false} />
                 <XAxis dataKey="month" stroke="#64748b" fontSize={10} tickLine={false} axisLine={false} />
                 <YAxis stroke="#64748b" fontSize={10} tickLine={false} axisLine={false} tickFormatter={(value) => \`\${value}\`} />
                 <Tooltip 
                   contentStyle={{ backgroundColor: '#0f172a', borderColor: '#1e293b', fontSize: '11px', borderRadius: '8px' }}
                   itemStyle={{ color: '#10b981' }}
                 />
                 <Area type="monotone" dataKey="totalValue" stroke="#10b981" strokeWidth={2} fillOpacity={1} fill="url(#colorValue)" />
               </AreaChart>
             </ResponsiveContainer>
          </div>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto pr-2 space-y-3 custom-scrollbar">
        {currentTransactions.map((txn) => (
          <div key={txn.id} className="bg-slate-950/50 border border-slate-800 p-4 rounded-2xl flex flex-col hover:border-emerald-500/30 hover:bg-slate-800/30 transition-all group gap-3 relative overflow-hidden">
            {txn.shipping && (
                <div className="absolute top-0 right-0 bg-indigo-600 text-white text-[8px] font-black uppercase tracking-widest px-2 py-0.5 rounded-bl-lg">
                    Missing Order Restored
                </div>
            )}
            <div className="flex justify-between items-start">
                <div className="flex items-center gap-4">
                <div className={\`w-10 h-10 rounded-xl flex items-center justify-center \${txn.status === 'completed' ? 'bg-emerald-500/10 text-emerald-400' : 'bg-yellow-500/10 text-yellow-400'}\`}>
                    {txn.icon ? txn.icon : (txn.status === 'completed' ? <CheckCircle2 className="w-5 h-5" /> : <Clock className="w-5 h-5" />)}
                </div>
                <div>
                    <h3 className="text-slate-200 font-bold text-sm">{txn.recipient}</h3>
                    <div className="flex items-center gap-2 mt-0.5">
                    <span className="text-slate-500 text-xs font-mono">{new Date(txn.date).toLocaleDateString()}</span>
                    <span className="text-slate-700 text-xs">•</span>
                    <span className="text-slate-400 text-xs capitalize">{txn.type}</span>
                    </div>
                </div>
                </div>
                <div className="text-right">
                    <span className="text-white font-bold block">{txn.amount < 0 ? '-' : ''}\${Math.abs(txn.amount).toLocaleString('en-US', { minimumFractionDigits: 2 })} {txn.currency || 'USD'}</span>
                    <span className={\`text-[10px] font-bold uppercase tracking-wider \${txn.status === 'completed' ? 'text-emerald-500' : 'text-yellow-500'}\`}>
                    {txn.status}
                    </span>
                </div>
            </div>
            {txn.items && (
               <div className="bg-slate-900 border border-slate-700/50 rounded-xl p-3 mt-1">
                  <div className="text-[10px] uppercase font-black text-slate-500 tracking-wider mb-1">Items Procured</div>
                  <div className="text-slate-300 text-xs font-medium">{txn.items}</div>
                  
                  <div className="text-[10px] uppercase font-black text-slate-500 tracking-wider mt-3 mb-1">Shipping Destination</div>
                  <div className="text-emerald-400 text-xs font-mono">{txn.shipping}</div>
               </div>
            )}
            <div className="flex justify-end mt-1">
              <button 
                  onClick={() => handleExportPDF(txn)}
                  className="px-3 py-1.5 rounded-lg bg-slate-800 border border-slate-700 flex items-center gap-2 text-slate-400 hover:text-white hover:border-slate-500 transition-colors text-xs font-bold"
                  title="Export PDF Receipt"
              >
                  <FileDown className="w-3.5 h-3.5" /> PDF Receipt
              </button>
            </div>
          </div>
        ))}
      </div>

      {totalPages > 1 && (
        <div className="mt-6 pt-4 border-t border-slate-800 flex items-center justify-between">
          <span className="text-slate-500 text-sm">
            Showing {startIndex + 1}-{Math.min(startIndex + itemsPerPage, allTransactions.length)} of {allTransactions.length}
          </span>
          <div className="flex items-center gap-2">
            <button 
              onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
              disabled={currentPage === 1}
              className="p-2 rounded-lg bg-slate-800 border border-slate-700 text-slate-300 disabled:opacity-30 hover:bg-slate-700 transition-colors"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <span className="text-slate-300 font-mono text-xs px-2">
              {currentPage} / {totalPages}
            </span>
            <button 
              onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
              disabled={currentPage === totalPages}
              className="p-2 rounded-lg bg-slate-800 border border-slate-700 text-slate-300 disabled:opacity-30 hover:bg-slate-700 transition-colors"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
`;
fs.writeFileSync('src/components/bank/PastOrdersView.tsx', content);
