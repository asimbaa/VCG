import React, { useState } from "react";
import { 
  Repeat, 
  CheckCircle2, 
  PauseCircle, 
  PlayCircle, 
  Plus, 
  Calendar, 
  DollarSign, 
  ShieldCheck, 
  Server, 
  Zap, 
  Building, 
  Clock, 
  Trash2,
  RefreshCw
} from "lucide-react";
import { toast } from "sonner";

interface SubscriptionItem {
  id: string;
  name: string;
  vendor: string;
  amount: number;
  currency: string;
  cadence: "Monthly" | "Annual" | "Weekly";
  nextBilling: string;
  status: "active" | "paused";
  fundingCard: string;
  category: "Infrastructure" | "Executive Living" | "Utilities" | "FinTech Feeds";
}

export function RecurringSubscriptionsTab() {
  const [subscriptions, setSubscriptions] = useState<SubscriptionItem[]>([
    {
      id: "sub-1",
      name: "AWS Sovereign Cloud Cluster",
      vendor: "Amazon Web Services AU",
      amount: 45000,
      currency: "AUD",
      cadence: "Monthly",
      nextBilling: "2026-11-01",
      status: "active",
      fundingCard: "Valourian Centurion Black (•••• 0001)",
      category: "Infrastructure"
    },
    {
      id: "sub-2",
      name: "Google Workspace & Gemini Enterprise",
      vendor: "Google LLC",
      amount: 8200,
      currency: "AUD",
      cadence: "Monthly",
      nextBilling: "2026-11-05",
      status: "active",
      fundingCard: "Valourian Corporate (•••• 4829)",
      category: "Infrastructure"
    },
    {
      id: "sub-3",
      name: "Bloomberg Anywhere Dual Terminal",
      vendor: "Bloomberg Finance L.P.",
      amount: 24000,
      currency: "USD",
      cadence: "Monthly",
      nextBilling: "2026-11-10",
      status: "active",
      fundingCard: "Macquarie Sovereign Reserve",
      category: "FinTech Feeds"
    },
    {
      id: "sub-4",
      name: "Starlink Maritime & Jet Fleet Link",
      vendor: "SpaceX Starlink",
      amount: 15000,
      currency: "AUD",
      cadence: "Monthly",
      nextBilling: "2026-11-12",
      status: "active",
      fundingCard: "Valourian Centurion Black (•••• 0001)",
      category: "Infrastructure"
    },
    {
      id: "sub-5",
      name: "Crown Towers Sydney Presidential Penthouse Retainer",
      vendor: "Crown Sydney Resorts Pty Ltd",
      amount: 120000,
      currency: "AUD",
      cadence: "Monthly",
      nextBilling: "2026-11-15",
      status: "active",
      fundingCard: "CBA Smart Access (062-140 • 11680690)",
      category: "Executive Living"
    },
    {
      id: "sub-6",
      name: "Origin Energy Sovereign HV Power Grid",
      vendor: "Origin Energy Electricity Ltd",
      amount: 12800,
      currency: "AUD",
      cadence: "Monthly",
      nextBilling: "2026-11-18",
      status: "active",
      fundingCard: "CBA VAL Business Trans",
      category: "Utilities"
    },
    {
      id: "sub-7",
      name: "Sydney Water Commercial Artarmon Infrastructure",
      vendor: "Sydney Water Corporation",
      amount: 3400,
      currency: "AUD",
      cadence: "Monthly",
      nextBilling: "2026-11-20",
      status: "active",
      fundingCard: "CBA VAL Business Trans",
      category: "Utilities"
    }
  ]);

  const [filter, setFilter] = useState<string>("all");

  const totalMonthlyAud = subscriptions
    .filter(s => s.status === "active")
    .reduce((acc, s) => acc + (s.currency === "AUD" ? s.amount : s.amount * 1.55), 0);

  const toggleStatus = (id: string) => {
    setSubscriptions(prev => prev.map(s => {
      if (s.id === id) {
        const next = s.status === "active" ? "paused" : "active";
        toast.success(`Subscription ${s.name} is now ${next.toUpperCase()}`);
        return { ...s, status: next };
      }
      return s;
    }));
  };

  const handleInstantSettle = (item: SubscriptionItem) => {
    toast.success(`✓ Immediate Pre-Settlement Executed: $${item.amount.toLocaleString()} ${item.currency} dispatched to ${item.vendor}! Next invoice deferred.`);
  };

  const filtered = filter === "all" ? subscriptions : subscriptions.filter(s => s.category === filter);

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      {/* Header Banner */}
      <div className="bg-slate-900 rounded-[2.5rem] p-8 text-white border border-slate-800 shadow-2xl relative overflow-hidden group">
        <div className="absolute top-0 right-0 w-80 h-80 bg-purple-500/10 rounded-full blur-[100px] -mr-32 -mt-32 pointer-events-none" />
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="flex items-center gap-5">
            <div className="w-16 h-16 rounded-3xl bg-gradient-to-tr from-purple-600 to-indigo-600 flex items-center justify-center text-white shadow-lg shadow-purple-500/20">
              <Repeat className="w-8 h-8" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-2xl font-black italic uppercase tracking-tight text-white">
                  Corporate Retainers & Subscriptions
                </h3>
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black bg-purple-500/20 text-purple-400 border border-purple-500/40 font-mono">
                  AUTO-SETTLE 24/7
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-1">
                Zero-touch autonomous settlement for deep-tech cloud clusters, satellite uplinks, and executive assets.
              </p>
            </div>
          </div>

          <div className="bg-slate-800/80 backdrop-blur-md px-6 py-3.5 rounded-2xl border border-slate-700/80 flex items-center gap-4">
            <div>
              <span className="text-[10px] uppercase font-bold tracking-widest text-slate-400 block">Monthly Outflow Run-Rate</span>
              <span className="text-xl font-black font-mono text-purple-400">
                ${totalMonthlyAud.toLocaleString("en-AU", { minimumFractionDigits: 2, maximumFractionDigits: 2 })} AUD
              </span>
            </div>
            <div className="w-2.5 h-2.5 rounded-full bg-purple-400 animate-pulse" />
          </div>
        </div>
      </div>

      {/* Categories Filter */}
      <div className="flex flex-wrap gap-2">
        {["all", "Infrastructure", "FinTech Feeds", "Executive Living", "Utilities"].map((cat, idx) => (
          <button
            key={`sub-category-${cat}-${idx}`}
            onClick={() => setFilter(cat)}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              filter === cat
                ? "bg-slate-900 text-white shadow-sm"
                : "bg-white text-slate-600 hover:bg-slate-100 border border-slate-200"
            }`}
          >
            {cat === "all" ? "All Corporate Retainers" : cat}
          </button>
        ))}
      </div>

      {/* Subscriptions Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filtered.map((item, idx) => (
          <div 
            key={`sub-item-${item.id}-${idx}`}
            className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm hover:shadow-md transition-shadow flex flex-col justify-between space-y-4"
          >
            <div>
              <div className="flex items-center justify-between mb-3">
                <span className="text-[10px] font-mono px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-600 font-bold border border-slate-200">
                  {item.category}
                </span>
                <span className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded-full ${
                  item.status === "active" ? "bg-emerald-50 text-emerald-700 border border-emerald-200" : "bg-amber-50 text-amber-700 border border-amber-200"
                }`}>
                  {item.status.toUpperCase()}
                </span>
              </div>

              <h4 className="text-base font-black text-slate-900 leading-snug">{item.name}</h4>
              <p className="text-xs text-slate-500 font-medium mt-0.5">{item.vendor}</p>

              <div className="mt-4 pt-4 border-t border-slate-100 flex items-baseline justify-between">
                <div>
                  <span className="text-2xl font-black font-mono text-slate-900">
                    ${item.amount.toLocaleString()}
                  </span>
                  <span className="text-xs font-bold text-slate-400 ml-1.5">{item.currency} / {item.cadence.toLowerCase()}</span>
                </div>
              </div>

              <div className="mt-3 text-[11px] font-mono text-slate-500 space-y-1">
                <div className="flex justify-between">
                  <span>Funding Source:</span>
                  <span className="font-bold text-slate-700">{item.fundingCard}</span>
                </div>
                <div className="flex justify-between">
                  <span>Next Automated Debit:</span>
                  <span className="font-bold text-slate-800">{item.nextBilling}</span>
                </div>
              </div>
            </div>

            <div className="pt-3 border-t border-slate-100 flex items-center justify-between gap-2">
              <button
                type="button"
                onClick={() => toggleStatus(item.id)}
                className={`flex-1 py-2 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition-colors cursor-pointer ${
                  item.status === "active" 
                    ? "bg-slate-100 hover:bg-amber-50 text-slate-700 hover:text-amber-800" 
                    : "bg-emerald-50 hover:bg-emerald-100 text-emerald-800"
                }`}
              >
                {item.status === "active" ? <PauseCircle className="w-3.5 h-3.5" /> : <PlayCircle className="w-3.5 h-3.5" />}
                <span>{item.status === "active" ? "Pause" : "Resume"}</span>
              </button>

              <button
                type="button"
                onClick={() => handleInstantSettle(item)}
                className="flex-1 py-2 rounded-xl bg-purple-600 hover:bg-purple-500 text-white text-xs font-black uppercase tracking-wider transition-colors flex items-center justify-center gap-1 cursor-pointer"
              >
                <Zap className="w-3.5 h-3.5" />
                <span>Pre-Settle</span>
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
