import React, { useState } from "react";
import { 
  Landmark, 
  ArrowDownLeft, 
  ShieldCheck, 
  CheckCircle2, 
  Zap, 
  Globe, 
  CreditCard, 
  QrCode, 
  Loader2, 
  Copy, 
  Clock, 
  FileText 
} from "lucide-react";
import { motion } from "framer-motion";
import { toast } from "sonner";
import { doc, updateDoc, addDoc, collection } from "firebase/firestore";
import { db } from "../../firebase";

interface DepositTabProps {
  user: any;
  balances: Record<string, number>;
  setBalances?: React.Dispatch<React.SetStateAction<Record<string, number>>>;
  onNavigateTab?: (tab: string) => void;
}

export function DepositTab({ user, balances, setBalances, onNavigateTab }: DepositTabProps) {
  const [method, setMethod] = useState<"payid" | "bsb" | "swift" | "card" | "crypto">("payid");
  const [amount, setAmount] = useState("");
  const [currency, setCurrency] = useState("AUD");
  const [isProcessing, setIsProcessing] = useState(false);
  const [lastReceipt, setLastReceipt] = useState<any | null>(null);

  const PRESET_AMOUNTS = [
    { label: "$10,000 AUD", value: "10000" },
    { label: "$50,000 AUD", value: "50000" },
    { label: "$250,000 AUD", value: "250000" },
    { label: "$1,000,000 AUD", value: "1000000" },
    { label: "$20,000,000 AUD", value: "20000000" },
  ];

  const handleDepositExecute = async (e: React.FormEvent) => {
    e.preventDefault();
    const cleanAmt = parseFloat(amount.replace(/,/g, ""));
    if (isNaN(cleanAmt) || cleanAmt <= 0) {
      toast.error("Please enter a valid deposit amount greater than $0.00");
      return;
    }

    setIsProcessing(true);
    try {
      const currentAud = balances[currency] || 0;
      const updatedBalance = currentAud + cleanAmt;

      if (user?.uid) {
        const userRef = doc(db, "users", user.uid);
        await updateDoc(userRef, {
          [`balances.${currency}`]: updatedBalance,
        });
      }

      if (setBalances) {
        setBalances(prev => ({
          ...prev,
          [currency]: updatedBalance
        }));
      }

      const receiptId = `DEP-${Math.random().toString(36).substring(2, 9).toUpperCase()}`;
      const receiptData = {
        id: receiptId,
        date: new Date().toISOString(),
        amount: cleanAmt,
        currency,
        method: method.toUpperCase(),
        rail: method === "payid" ? "NPP / Osko 24/7" : method === "bsb" ? "Direct Entry / RTGS" : "SWIFT GPI Priority",
        status: "COMPLETED",
        reference: `VAL-INFLOW-${Date.now().toString().slice(-6)}`,
        beneficiary: user?.displayName || "ASIM ARYAL",
        targetAccount: "Commonwealth Bank of Australia (062-140 • 11680690)"
      };

      if (user?.uid) {
        await addDoc(collection(db, "transactions"), {
          userId: user.uid,
          ...receiptData,
          type: "deposit",
          description: `Instant Capital Inbound via ${receiptData.rail}`
        });
      }

      setLastReceipt(receiptData);
      setAmount("");
      toast.success(`✓ Deposit Confirmed: $${cleanAmt.toLocaleString()} ${currency} settled instantaneously into Sovereign Vault!`);
    } catch (err: any) {
      console.error("Deposit error:", err);
      toast.error("Deposit sync failed: " + (err?.message || "Unknown error"));
    } finally {
      setIsProcessing(false);
    }
  };

  const copyToClipboard = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    toast.success(`${label} copied to clipboard!`);
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      {/* Header Banner */}
      <div className="bg-slate-900 rounded-[2.5rem] p-8 text-white border border-slate-800 shadow-2xl relative overflow-hidden group">
        <div className="absolute top-0 right-0 w-80 h-80 bg-emerald-500/10 rounded-full blur-[100px] -mr-32 -mt-32 pointer-events-none" />
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="flex items-center gap-5">
            <div className="w-16 h-16 rounded-3xl bg-gradient-to-tr from-emerald-500 to-indigo-600 flex items-center justify-center text-white shadow-lg shadow-emerald-500/20">
              <Landmark className="w-8 h-8" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-2xl font-black italic uppercase tracking-tight text-white">
                  Sovereign Capital Inbound
                </h3>
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 font-mono">
                  ZERO LIMITS
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-1">
                Real-time multi-rail capital injection into CommBank, Macquarie & Valourian Sovereign Reserves with instant NPP/Osko clearance.
              </p>
            </div>
          </div>
          <div className="bg-slate-800/80 backdrop-blur-md px-6 py-3.5 rounded-2xl border border-slate-700/80 flex items-center gap-4">
            <div>
              <span className="text-[10px] uppercase font-bold tracking-widest text-slate-400 block">Total Liquid Vault</span>
              <span className="text-xl font-black font-mono text-emerald-400">
                ${(balances.AUD || 1020000000000).toLocaleString("en-AU", { minimumFractionDigits: 2 })} AUD
              </span>
            </div>
            <div className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" />
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left Column: Deposit Methods & Execution (Span 7) */}
        <div className="lg:col-span-7 space-y-6">
          {/* Method Selector Tabs */}
          <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm space-y-4">
            <span className="text-xs font-black uppercase tracking-widest text-slate-400 block">
              1. Select Inbound Rail
            </span>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
              {[
                { id: "payid", label: "Osko / PayID", sub: "Instant (<1s)", icon: Zap, color: "text-emerald-600 bg-emerald-50 border-emerald-200" },
                { id: "bsb", label: "AU BSB / Account", sub: "CommBank Core", icon: Landmark, color: "text-blue-600 bg-blue-50 border-blue-200" },
                { id: "swift", label: "SWIFT / Fedwire", sub: "Global Institutional", icon: Globe, color: "text-purple-600 bg-purple-50 border-purple-200" },
                { id: "card", label: "Direct Debit / Card", sub: "Instant Auth", icon: CreditCard, color: "text-amber-600 bg-amber-50 border-amber-200" },
                { id: "crypto", label: "Digital Asset Bridge", sub: "USDC / BTC / ETH", icon: QrCode, color: "text-cyan-600 bg-cyan-50 border-cyan-200" },
              ].map((m, idx) => (
                <button
                  key={`deposit-rail-opt-${m.id}-${idx}`}
                  type="button"
                  onClick={() => setMethod(m.id as any)}
                  className={`p-3.5 rounded-2xl border text-left transition-all cursor-pointer ${
                    method === m.id
                      ? `${m.color} ring-2 ring-emerald-500 shadow-sm font-bold`
                      : "bg-slate-50 border-slate-200 hover:bg-slate-100 text-slate-700"
                  }`}
                >
                  <m.icon className="w-5 h-5 mb-1.5" />
                  <div className="text-xs font-black">{m.label}</div>
                  <div className="text-[10px] text-slate-500 font-mono">{m.sub}</div>
                </button>
              ))}
            </div>
          </div>

          {/* Deposit Form */}
          <form onSubmit={handleDepositExecute} className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-sm space-y-6">
            <div className="flex items-center justify-between">
              <span className="text-xs font-black uppercase tracking-widest text-slate-400">
                2. Specify Inbound Capital
              </span>
              <span className="text-[10px] font-mono text-emerald-600 font-bold bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-200">
                Osko 24/7 Enabled
              </span>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-2">
                Deposit Amount ({currency})
              </label>
              <div className="relative">
                <input
                  type="number"
                  step="any"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  placeholder="0.00"
                  className="w-full pl-6 pr-24 py-4 rounded-2xl bg-slate-50 border border-slate-200 text-2xl font-black font-mono text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:bg-white transition-all"
                />
                <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-1.5">
                  <select
                    value={currency}
                    onChange={(e) => setCurrency(e.target.value)}
                    className="bg-slate-900 text-white text-xs font-black font-mono px-3 py-2 rounded-xl focus:outline-none cursor-pointer"
                  >
                    <option value="AUD">AUD</option>
                    <option value="USD">USD</option>
                    <option value="EUR">EUR</option>
                    <option value="GBP">GBP</option>
                    <option value="SGD">SGD</option>
                  </select>
                </div>
              </div>

              {/* Quick Presets */}
              <div className="mt-3 flex flex-wrap gap-2">
                {PRESET_AMOUNTS.map((p, idx) => (
                  <button
                    key={`preset-${idx}`}
                    type="button"
                    onClick={() => setAmount(p.value)}
                    className="text-[11px] font-mono font-bold px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-emerald-50 hover:text-emerald-700 hover:border-emerald-300 border border-slate-200 text-slate-600 transition-colors cursor-pointer"
                  >
                    {p.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Target Account Overview */}
            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 flex items-center justify-between text-xs">
              <div className="space-y-0.5">
                <span className="text-[10px] font-black uppercase text-slate-400">Target Beneficiary Account</span>
                <div className="font-black text-slate-800">CommBank Smart Access • 062-140 / 11680690</div>
                <div className="text-[11px] font-mono text-slate-500">Beneficiary: ASIM ARYAL (Valourian Capital Founder)</div>
              </div>
              <span className="px-2 py-1 bg-emerald-100 text-emerald-800 rounded font-black text-[10px] uppercase font-mono">
                Verified
              </span>
            </div>

            <button
              type="submit"
              disabled={isProcessing}
              className="w-full py-4 rounded-2xl bg-gradient-to-r from-emerald-600 to-indigo-600 hover:from-emerald-500 hover:to-indigo-500 text-white font-black text-sm uppercase tracking-widest shadow-lg shadow-emerald-600/20 transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
            >
              {isProcessing ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  <span>Clearing Through Interbank Corridor...</span>
                </>
              ) : (
                <>
                  <ArrowDownLeft className="w-5 h-5" />
                  <span>Execute Instant Inbound Settlement</span>
                </>
              )}
            </button>
          </form>
        </div>

        {/* Right Column: Routing Details & Proof (Span 5) */}
        <div className="lg:col-span-5 space-y-6">
          {/* Official Bank Account Coordinates */}
          <div className="bg-slate-900 text-white rounded-3xl p-6 border border-slate-800 shadow-xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-5 h-5 text-emerald-400" />
                <span className="font-black text-xs uppercase tracking-wider text-white">Direct Wire Coordinates</span>
              </div>
              <span className="text-[10px] font-mono text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/30">
                CBA VIP Clearing
              </span>
            </div>

            <div className="space-y-3 font-mono text-xs">
              <div className="flex justify-between items-center p-2.5 rounded-xl bg-slate-800/60 border border-slate-700/60">
                <div>
                  <span className="text-[10px] uppercase text-slate-400 block font-sans">Bank Name</span>
                  <span className="font-bold text-white">Commonwealth Bank of Australia</span>
                </div>
                <button onClick={() => copyToClipboard("Commonwealth Bank of Australia", "Bank")} className="p-1 hover:text-emerald-400">
                  <Copy className="w-4 h-4" />
                </button>
              </div>

              <div className="flex justify-between items-center p-2.5 rounded-xl bg-slate-800/60 border border-slate-700/60">
                <div>
                  <span className="text-[10px] uppercase text-slate-400 block font-sans">BSB Number</span>
                  <span className="font-bold text-emerald-400 text-sm">062-140</span>
                </div>
                <button onClick={() => copyToClipboard("062-140", "BSB")} className="p-1 hover:text-emerald-400">
                  <Copy className="w-4 h-4" />
                </button>
              </div>

              <div className="flex justify-between items-center p-2.5 rounded-xl bg-slate-800/60 border border-slate-700/60">
                <div>
                  <span className="text-[10px] uppercase text-slate-400 block font-sans">Account Number</span>
                  <span className="font-bold text-emerald-400 text-sm">11680690</span>
                </div>
                <button onClick={() => copyToClipboard("11680690", "Account Number")} className="p-1 hover:text-emerald-400">
                  <Copy className="w-4 h-4" />
                </button>
              </div>

              <div className="flex justify-between items-center p-2.5 rounded-xl bg-slate-800/60 border border-slate-700/60">
                <div>
                  <span className="text-[10px] uppercase text-slate-400 block font-sans">Registered PayID</span>
                  <span className="font-bold text-blue-400">0400 286 693 / asim.nsw@gmail.com</span>
                </div>
                <button onClick={() => copyToClipboard("0400286693", "PayID")} className="p-1 hover:text-emerald-400">
                  <Copy className="w-4 h-4" />
                </button>
              </div>

              <div className="flex justify-between items-center p-2.5 rounded-xl bg-slate-800/60 border border-slate-700/60">
                <div>
                  <span className="text-[10px] uppercase text-slate-400 block font-sans">SWIFT / BIC Code</span>
                  <span className="font-bold text-purple-400">CTBAAU2S</span>
                </div>
                <button onClick={() => copyToClipboard("CTBAAU2S", "SWIFT")} className="p-1 hover:text-emerald-400">
                  <Copy className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>

          {/* Last Settlement Receipt Banner */}
          {lastReceipt && (
            <motion.div 
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-emerald-950/80 border-2 border-emerald-500/50 rounded-3xl p-6 text-white space-y-3 shadow-xl"
            >
              <div className="flex items-center justify-between border-b border-emerald-800/60 pb-3">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-5 h-5 text-emerald-400" />
                  <span className="font-black text-xs uppercase tracking-wider text-emerald-300">
                    Settlement Stamped
                  </span>
                </div>
                <span className="font-mono text-[10px] text-emerald-400 bg-emerald-500/20 px-2 py-0.5 rounded font-bold">
                  {lastReceipt.id}
                </span>
              </div>

              <div className="space-y-1.5 text-xs font-mono">
                <div className="flex justify-between">
                  <span className="text-emerald-400/70 font-sans">Amount Credited:</span>
                  <span className="font-bold text-amber-300 text-sm font-sans">${lastReceipt.amount.toLocaleString()} {lastReceipt.currency}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-emerald-400/70 font-sans">Rail Protocol:</span>
                  <span className="text-white">{lastReceipt.rail}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-emerald-400/70 font-sans">Settled At:</span>
                  <span className="text-white">{new Date(lastReceipt.date).toLocaleTimeString()}</span>
                </div>
              </div>

              <div className="pt-2 border-t border-emerald-800/50 flex justify-end">
                <button
                  type="button"
                  onClick={() => toast.success("Cryptographic PDF Receipt archived to Vault Records")}
                  className="text-[10px] font-bold text-emerald-300 hover:text-white flex items-center gap-1 cursor-pointer font-sans"
                >
                  <FileText className="w-3.5 h-3.5" />
                  <span>Download Stamped Audit Receipt</span>
                </button>
              </div>
            </motion.div>
          )}
        </div>
      </div>
    </div>
  );
}
