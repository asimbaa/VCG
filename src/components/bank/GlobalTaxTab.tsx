import React, { useState } from "react";
import { 
  ShieldCheck, 
  Percent, 
  Scale, 
  FileText, 
  CheckCircle2, 
  ArrowRight, 
  Globe, 
  DollarSign, 
  Sparkles,
  Calculator,
  Lock
} from "lucide-react";
import { toast } from "sonner";

interface TaxStrategy {
  id: string;
  name: string;
  category: string;
  jurisdiction: string;
  savingsEstimated: string;
  status: "Active & Enforced" | "Approved";
  description: string;
}

export function GlobalTaxTab() {
  const [strategies] = useState<TaxStrategy[]>([
    {
      id: "strat-1",
      name: "The Sovereign Shield (DTT Optimization)",
      category: "Double Taxation Treaties",
      jurisdiction: "Australia • United States • UK • France",
      savingsEstimated: "$42,500,000 AUD / yr",
      status: "Active & Enforced",
      description: "Applies International Double-Taxation Treaties (AU-US Article 10/11) to eliminate withholding tax on international software royalties and global treasury dividends."
    },
    {
      id: "strat-2",
      name: "Australian R&D Tax Incentive (43.5% Refundable Offset)",
      category: "Innovation & Deep Tech",
      jurisdiction: "ATO / AusIndustry (Australia)",
      savingsEstimated: "$18,200,000 AUD / yr",
      status: "Active & Enforced",
      description: "Eligible core R&D activities across the 26 Computer Science Breakthroughs qualify for the 43.5% refundable tax offset under Division 355 of the ITAA 1997."
    },
    {
      id: "strat-3",
      name: "Torrens Title Family Trust Capital Rollover",
      category: "Asset Protection",
      jurisdiction: "Revenue NSW (Australia)",
      savingsEstimated: "$6,800,000 AUD",
      status: "Active & Enforced",
      description: "Statutory asset restructuring ensuring 15 Barton Rd Artarmon and Clontarf Sovereign Estate benefit from multi-generational wealth preservation without triggering premature CGT events."
    },
    {
      id: "strat-4",
      name: "Singapore Global Operations HoldCo Corridor",
      category: "Corporate HoldCo",
      jurisdiction: "Inland Revenue Authority of Singapore (IRAS)",
      savingsEstimated: "$28,000,000 AUD / yr",
      status: "Approved",
      description: "Foreign-source dividend exemption and Section 13O/13U fund management incentives for Asia-Pacific and EMEA logistics netting."
    }
  ]);

  const [simulatedRevenue, setSimulatedRevenue] = useState("50000000");

  const revenueNum = parseFloat(simulatedRevenue) || 0;
  const standardTax = revenueNum * 0.30; // 30% AU corporate rate
  const optimizedTax = revenueNum * 0.082; // 8.2% blended effective sovereign rate
  const annualSavings = standardTax - optimizedTax;

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      {/* Header Banner */}
      <div className="bg-slate-900 rounded-[2.5rem] p-8 text-white border border-slate-800 shadow-2xl relative overflow-hidden group">
        <div className="absolute top-0 right-0 w-80 h-80 bg-amber-500/10 rounded-full blur-[100px] -mr-32 -mt-32 pointer-events-none" />
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="flex items-center gap-5">
            <div className="w-16 h-16 rounded-3xl bg-gradient-to-tr from-amber-600 to-indigo-600 flex items-center justify-center text-white shadow-lg shadow-amber-500/20">
              <Scale className="w-8 h-8" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-2xl font-black italic uppercase tracking-tight text-white">
                  Global Tax & Legal Architecture
                </h3>
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black bg-amber-500/20 text-amber-400 border border-amber-500/40 font-mono">
                  8.2% BLENDED RATE
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-1">
                Cross-border treaty minimization, AusIndustry R&D tax offsets, and statutory corporate asset protection.
              </p>
            </div>
          </div>

          <div className="bg-slate-800/80 backdrop-blur-md px-6 py-3.5 rounded-2xl border border-slate-700/80 flex items-center gap-4">
            <div>
              <span className="text-[10px] uppercase font-bold tracking-widest text-slate-400 block">Annual Tax Shield</span>
              <span className="text-xl font-black font-mono text-amber-400">$95.5M+ AUD Saved</span>
            </div>
            <div className="w-2.5 h-2.5 rounded-full bg-amber-400 animate-pulse" />
          </div>
        </div>
      </div>

      {/* Interactive Optimization Simulator */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-sm space-y-6">
        <div className="flex items-center justify-between border-b border-slate-100 pb-4">
          <div className="flex items-center gap-2">
            <Calculator className="w-5 h-5 text-amber-600" />
            <h4 className="text-base font-black text-slate-900">Sovereign Tax Shield Simulator</h4>
          </div>
          <span className="text-xs font-mono font-bold text-slate-400">Real-Time Fiscal Modeling</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="space-y-2">
            <label className="block text-xs font-bold text-slate-700">Projected Global Enterprise Revenue (AUD)</label>
            <input
              type="number"
              step="any"
              value={simulatedRevenue}
              onChange={(e) => setSimulatedRevenue(e.target.value)}
              className="w-full px-4 py-3 rounded-2xl bg-slate-50 border border-slate-200 text-lg font-black font-mono text-slate-900 focus:outline-none focus:ring-2 focus:ring-amber-500"
            />
          </div>

          <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-1">
            <span className="text-[10px] font-bold uppercase text-slate-400">Unoptimized Baseline (30%)</span>
            <div className="text-xl font-black font-mono text-slate-700">${standardTax.toLocaleString()} AUD</div>
            <div className="text-[10px] text-slate-400 font-medium">Standard corporate rate without structuring</div>
          </div>

          <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 space-y-1">
            <span className="text-[10px] font-bold uppercase text-emerald-700">Sovereign Shield Output (8.2%)</span>
            <div className="text-xl font-black font-mono text-emerald-800">${optimizedTax.toLocaleString()} AUD</div>
            <div className="text-[10px] text-emerald-700 font-bold">
              +${annualSavings.toLocaleString()} AUD preserved in Treasury
            </div>
          </div>
        </div>
      </div>

      {/* Strategies Roster */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-sm space-y-4">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <h4 className="text-base font-black text-slate-900">Active Cross-Border Strategies</h4>
          <span className="text-xs font-mono text-emerald-700 font-bold bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200">
            Fully Compliant
          </span>
        </div>

        <div className="space-y-4">
          {strategies.map((strat, idx) => (
            <div
              key={`tax-${strat.id}-${idx}`}
              className="p-5 rounded-2xl bg-slate-50 border border-slate-200 space-y-2 hover:bg-slate-100/60 transition-colors"
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-mono font-bold bg-amber-100 text-amber-900 px-2 py-0.5 rounded">
                    {strat.category}
                  </span>
                  <span className="text-sm font-black text-slate-900">{strat.name}</span>
                </div>
                <span className="font-mono font-black text-emerald-700 text-xs">
                  Est. Savings: {strat.savingsEstimated}
                </span>
              </div>
              <p className="text-xs text-slate-600 leading-relaxed">{strat.description}</p>
              <div className="text-[11px] font-mono text-slate-400 pt-1 border-t border-slate-200 flex justify-between">
                <span>Jurisdictions: {strat.jurisdiction}</span>
                <span className="text-emerald-600 font-bold">✓ {strat.status}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
