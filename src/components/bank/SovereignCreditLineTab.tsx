import React, { useState } from "react";
import { 
  Landmark, 
  ArrowUpRight, 
  ShieldCheck, 
  Percent, 
  DollarSign, 
  Calendar, 
  CheckCircle2, 
  AlertCircle, 
  Loader2, 
  RefreshCw, 
  TrendingDown,
  Layers
} from "lucide-react";
import { motion } from "framer-motion";
import { toast } from "sonner";
import { doc, updateDoc } from "firebase/firestore";
import { db } from "../../firebase";

interface SovereignCreditLineTabProps {
  user: any;
  balances: Record<string, number>;
  setBalances?: React.Dispatch<React.SetStateAction<Record<string, number>>>;
}

export function SovereignCreditLineTab({ user, balances, setBalances }: SovereignCreditLineTabProps) {
  const [creditLimit] = useState(500000000); // $500M AUD Facility
  const [drawnAmount, setDrawnAmount] = useState(45000000); // $45M currently drawn
  const [drawInput, setDrawInput] = useState("");
  const [repayInput, setRepayInput] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);
  const [targetAccount, setTargetAccount] = useState("cba_smart_access");

  const availableCredit = creditLimit - drawnAmount;
  const utilizationRate = ((drawnAmount / creditLimit) * 100).toFixed(1);

  const handleDrawdown = async (e: React.FormEvent) => {
    e.preventDefault();
    const cleanAmt = parseFloat(drawInput.replace(/,/g, ""));
    if (isNaN(cleanAmt) || cleanAmt <= 0) {
      toast.error("Please enter a valid drawdown amount");
      return;
    }
    if (cleanAmt > availableCredit) {
      toast.error(`Drawdown exceeds remaining available facility of $${availableCredit.toLocaleString()} AUD`);
      return;
    }

    setIsProcessing(true);
    try {
      const newDrawn = drawnAmount + cleanAmt;
      const currentAud = balances.AUD || 0;
      const updatedBalance = currentAud + cleanAmt;

      if (user?.uid) {
        const userRef = doc(db, "users", user.uid);
        await updateDoc(userRef, {
          "balances.AUD": updatedBalance,
        });
      }

      if (setBalances) {
        setBalances(prev => ({
          ...prev,
          AUD: updatedBalance
        }));
      }

      setDrawnAmount(newDrawn);
      setDrawInput("");
      toast.success(`✓ $${cleanAmt.toLocaleString()} AUD drawn from Sovereign Credit Facility and deposited to CommBank!`);
    } catch (err: any) {
      toast.error("Failed to execute drawdown: " + (err?.message || "Error"));
    } finally {
      setIsProcessing(false);
    }
  };

  const handleRepayment = async (e: React.FormEvent) => {
    e.preventDefault();
    const cleanAmt = parseFloat(repayInput.replace(/,/g, ""));
    if (isNaN(cleanAmt) || cleanAmt <= 0) {
      toast.error("Please enter a valid repayment amount");
      return;
    }
    if (cleanAmt > drawnAmount) {
      toast.error("Repayment amount cannot exceed total drawn debt of $" + drawnAmount.toLocaleString() + " AUD");
      return;
    }

    setIsProcessing(true);
    try {
      const newDrawn = Math.max(0, drawnAmount - cleanAmt);
      const currentAud = balances.AUD || 0;
      const updatedBalance = Math.max(0, currentAud - cleanAmt);

      if (user?.uid) {
        const userRef = doc(db, "users", user.uid);
        await updateDoc(userRef, {
          "balances.AUD": updatedBalance,
        });
      }

      if (setBalances) {
        setBalances(prev => ({
          ...prev,
          AUD: updatedBalance
        }));
      }

      setDrawnAmount(newDrawn);
      setRepayInput("");
      toast.success(`✓ $${cleanAmt.toLocaleString()} AUD principal repaid to facility. Interest rate re-indexed to 1.80%.`);
    } catch (err: any) {
      toast.error("Failed to execute repayment: " + (err?.message || "Error"));
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      {/* Sovereign Facility Header */}
      <div className="bg-slate-900 rounded-[2.5rem] p-8 text-white border border-slate-800 shadow-2xl relative overflow-hidden group">
        <div className="absolute top-0 right-0 w-80 h-80 bg-blue-500/10 rounded-full blur-[100px] -mr-32 -mt-32 pointer-events-none" />
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="flex items-center gap-5">
            <div className="w-16 h-16 rounded-3xl bg-gradient-to-tr from-blue-600 to-indigo-600 flex items-center justify-center text-white shadow-lg shadow-blue-500/20">
              <Landmark className="w-8 h-8" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-2xl font-black italic uppercase tracking-tight text-white">
                  Institutional Credit Line & Liquidity
                </h3>
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black bg-blue-500/20 text-blue-400 border border-blue-500/40 font-mono">
                  AAA PRIME
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-1">
                Revolving sovereign credit line backed by $1.02T treasury reserves & strategic equity tranches.
              </p>
            </div>
          </div>

          <div className="bg-slate-800/80 backdrop-blur-md px-6 py-3.5 rounded-2xl border border-slate-700/80 flex items-center gap-4">
            <div>
              <span className="text-[10px] uppercase font-bold tracking-widest text-slate-400 block">Sovereign Prime Rate</span>
              <span className="text-xl font-black font-mono text-emerald-400">1.80% p.a.</span>
            </div>
            <div className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" />
          </div>
        </div>
      </div>

      {/* Facility Metrics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm space-y-1">
          <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">Total Facility Limit</span>
          <div className="text-2xl font-black font-mono text-slate-900">${(creditLimit / 1000000).toFixed(0)}M AUD</div>
          <div className="text-[11px] text-slate-500 font-bold">Uncapped Extension Ready</div>
        </div>

        <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm space-y-1">
          <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">Available to Draw</span>
          <div className="text-2xl font-black font-mono text-emerald-600">${(availableCredit / 1000000).toFixed(1)}M AUD</div>
          <div className="text-[11px] text-emerald-600 font-bold flex items-center gap-1">
            <CheckCircle2 className="w-3.5 h-3.5" /> Instant NPP Clearance
          </div>
        </div>

        <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm space-y-1">
          <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">Current Drawn Debt</span>
          <div className="text-2xl font-black font-mono text-amber-600">${(drawnAmount / 1000000).toFixed(1)}M AUD</div>
          <div className="text-[11px] text-slate-500 font-bold">Facility Utilization: {utilizationRate}%</div>
        </div>

        <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm space-y-1">
          <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">Collateral Coverage</span>
          <div className="text-2xl font-black font-mono text-indigo-600">2,040%</div>
          <div className="text-[11px] text-indigo-600 font-bold">Over-collateralized AAA</div>
        </div>
      </div>

      {/* Drawdown & Repayment Panels */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Drawdown Panel */}
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-sm space-y-6">
          <div className="flex items-center justify-between border-b border-slate-100 pb-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-emerald-50 border border-emerald-200 flex items-center justify-center text-emerald-600">
                <ArrowUpRight className="w-5 h-5" />
              </div>
              <div>
                <h4 className="text-base font-black text-slate-900">Execute Instant Drawdown</h4>
                <p className="text-xs text-slate-500">Inject liquidity into operational accounts with zero friction.</p>
              </div>
            </div>
          </div>

          <form onSubmit={handleDrawdown} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">Drawdown Amount (AUD)</label>
              <input
                type="number"
                step="any"
                value={drawInput}
                onChange={(e) => setDrawInput(e.target.value)}
                placeholder="e.g. 5000000"
                className="w-full px-4 py-3.5 rounded-2xl bg-slate-50 border border-slate-200 text-lg font-black font-mono text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">Destination Account</label>
              <select
                value={targetAccount}
                onChange={(e) => setTargetAccount(e.target.value)}
                className="w-full px-4 py-3 rounded-xl bg-slate-50 border border-slate-200 text-xs font-bold text-slate-800 focus:outline-none"
              >
                <option value="cba_smart_access">CommBank Smart Access (062-140 • 11680690) — ASIM ARYAL</option>
                <option value="cba_val_business">CBA VAL Business Operating (062-151 • 10559938)</option>
                <option value="macquarie_vip">Macquarie Sovereign VIP Liquidity Hub (BSB 182-512)</option>
              </select>
            </div>

            <button
              type="submit"
              disabled={isProcessing}
              className="w-full py-4 rounded-2xl bg-emerald-600 hover:bg-emerald-500 text-white font-black text-xs uppercase tracking-widest shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
            >
              {isProcessing ? <Loader2 className="w-4 h-4 animate-spin" /> : <ArrowUpRight className="w-4 h-4" />}
              <span>Execute Drawdown to Linked Bank</span>
            </button>
          </form>
        </div>

        {/* Repayment Panel */}
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-sm space-y-6">
          <div className="flex items-center justify-between border-b border-slate-100 pb-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-blue-50 border border-blue-200 flex items-center justify-center text-blue-600">
                <TrendingDown className="w-5 h-5" />
              </div>
              <div>
                <h4 className="text-base font-black text-slate-900">Principal Repayment</h4>
                <p className="text-xs text-slate-500">Voluntary partial or full facility paydown at any time.</p>
              </div>
            </div>
          </div>

          <form onSubmit={handleRepayment} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">Repayment Amount (AUD)</label>
              <input
                type="number"
                step="any"
                value={repayInput}
                onChange={(e) => setRepayInput(e.target.value)}
                placeholder="e.g. 10000000"
                className="w-full px-4 py-3.5 rounded-2xl bg-slate-50 border border-slate-200 text-lg font-black font-mono text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div className="p-3.5 bg-slate-50 rounded-2xl border border-slate-200 text-xs space-y-1">
              <div className="flex justify-between font-mono">
                <span className="text-slate-500 font-sans">Effective Annual Interest:</span>
                <span className="font-bold text-slate-800">1.80% Fixed Sovereign Index</span>
              </div>
              <div className="flex justify-between font-mono">
                <span className="text-slate-500 font-sans">Early Payoff Penalty:</span>
                <span className="font-bold text-emerald-600">$0.00 (Zero Penalty Guarantee)</span>
              </div>
            </div>

            <button
              type="submit"
              disabled={isProcessing}
              className="w-full py-4 rounded-2xl bg-blue-600 hover:bg-blue-500 text-white font-black text-xs uppercase tracking-widest shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
            >
              {isProcessing ? <Loader2 className="w-4 h-4 animate-spin" /> : <TrendingDown className="w-4 h-4" />}
              <span>Execute Principal Repayment</span>
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
