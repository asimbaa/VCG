import React, { useState, useEffect } from "react";
import { 
  Building2, 
  Send, 
  TrendingUp, 
  CheckCircle2, 
  Clock, 
  Download, 
  ShieldCheck, 
  Zap, 
  ArrowUpRight, 
  ArrowDownLeft, 
  RefreshCw, 
  DollarSign, 
  FileText, 
  Sparkles, 
  Plus, 
  ExternalLink,
  ChevronRight,
  Landmark,
  Smartphone
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  externalBankService, 
  ExternalBankAccount, 
  ExternalPaymentRecord 
} from "../../services/externalBankService";
import { toast } from "sonner";

interface Props {
  user?: any;
}

export function ExternalBankAccountsDashboard({ user }: Props) {
  const [accounts, setAccounts] = useState<ExternalBankAccount[]>([]);
  const [payments, setPayments] = useState<ExternalPaymentRecord[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedAccount, setSelectedAccount] = useState<ExternalBankAccount | null>(null);
  
  // Transfer Form state
  const [targetAccountId, setTargetAccountId] = useState<string>("");
  const [customBsb, setCustomBsb] = useState<string>("");
  const [customAccountNumber, setCustomAccountNumber] = useState<string>("");
  const [customAccountName, setCustomAccountName] = useState<string>("");
  const [customBankName, setCustomBankName] = useState<string>("Commonwealth Bank of Australia");
  const [amount, setAmount] = useState<string>("14000000"); // Default 14M as requested
  const [category, setCategory] = useState<"Monthly Executive Salary" | "Director Remuneration" | "Treasury Dividend" | "General Interbank Transfer">("Monthly Executive Salary");
  const [reference, setReference] = useState<string>("Executive Salary Payout - Founder Asim Aryal");
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [lastPayment, setLastPayment] = useState<ExternalPaymentRecord | null>(null);

  useEffect(() => {
    const unsub = externalBankService.subscribe((accs, pays) => {
      setAccounts(accs);
      setPayments(pays);
      if (accs.length > 0 && !targetAccountId) {
        // default to primary salary account
        const primary = accs.find(a => a.isPrimarySalaryAccount) || accs[0];
        setTargetAccountId(primary.id);
        setSelectedAccount(primary);
      }
    });
    return () => unsub();
  }, []);

  const handleQuickPreset = (presetAmount: string, cat: any, refText: string) => {
    setAmount(presetAmount);
    setCategory(cat);
    setReference(refText);
  };

  const handleExecutePayment = async (e: React.FormEvent) => {
    e.preventDefault();
    const numAmount = parseFloat(amount.replace(/,/g, ""));
    if (isNaN(numAmount) || numAmount <= 0) {
      toast.error("Please enter a valid transfer amount greater than $0.");
      return;
    }

    setIsSubmitting(true);
    try {
      const selectedAcc = accounts.find(a => a.id === targetAccountId);
      
      const record = await externalBankService.executeExternalPayment({
        destinationAccountId: targetAccountId === "custom" ? undefined : targetAccountId,
        destinationBank: targetAccountId === "custom" ? customBankName : selectedAcc?.bankName,
        destinationAccountName: targetAccountId === "custom" ? customAccountName : (selectedAcc?.accountName || "External Bank Account"),
        destinationHolder: targetAccountId === "custom" ? "ASIM ARYAL" : selectedAcc?.accountHolder,
        destinationBsb: targetAccountId === "custom" ? customBsb : (selectedAcc?.bsb || "062-140"),
        destinationAccountNumber: targetAccountId === "custom" ? customAccountNumber : (selectedAcc?.accountNumber || "11680690"),
        amount: numAmount,
        currency: "AUD",
        category,
        reference,
        userId: user?.uid || "asim_aryal"
      });

      setLastPayment(record);
      setIsModalOpen(false);
      // Reset to default 14M
      setAmount("14000000");
    } catch (err: any) {
      toast.error(err?.message || "Failed to execute external payment.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Banner: External Bank Accounts & Salary Gateway */}
      <div className="bg-gradient-to-r from-slate-900 via-slate-900/90 to-slate-950 border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-2xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-80 h-80 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none -mr-20 -mt-20" />
        
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <span className="px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                Live External Bank Accounts Clearing Core
              </span>
              <span className="text-xs text-slate-400 font-mono hidden sm:inline">
                NPP / Osko 24/7 Real-Time Interbank Bridge
              </span>
            </div>
            
            <h2 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
              External Bank Accounts & Salary Payouts
            </h2>
            <p className="text-slate-400 text-xs sm:text-sm max-w-2xl leading-relaxed">
              Pay funds from Valourian Sovereign Treasury directly to external Australian bank accounts (CommBank, NAB, Westpac, ANZ, Macquarie). Funds clear instantly via NPP/Osko and appear in your external accounts dashboard ASAP.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <button
              onClick={() => {
                handleQuickPreset("14000000", "Monthly Executive Salary", "Executive Salary Payout - Founder Asim Aryal");
                setIsModalOpen(true);
              }}
              className="px-5 py-3 rounded-2xl bg-gradient-to-r from-emerald-500 to-teal-400 hover:from-emerald-400 hover:to-teal-300 text-slate-950 font-black text-xs uppercase tracking-wider flex items-center gap-2 transition-all cursor-pointer shadow-xl shadow-emerald-500/20"
            >
              <Zap className="w-4 h-4 fill-current" />
              <span>Pay $14M Salary to CommBank</span>
            </button>

            <button
              onClick={() => setIsModalOpen(true)}
              className="px-4 py-3 rounded-2xl bg-slate-800 hover:bg-slate-700 text-white font-bold text-xs flex items-center gap-2 transition-all cursor-pointer border border-slate-700"
            >
              <Send className="w-4 h-4 text-emerald-400" />
              <span>Custom External Transfer</span>
            </button>
          </div>
        </div>
      </div>

      {/* Grid of External Bank Accounts with Live Balances */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Landmark className="w-5 h-5 text-emerald-400" />
            <h3 className="text-base font-black text-white">
              Connected External Accounts (Live Mirrored Balances)
            </h3>
          </div>
          <span className="text-xs font-mono text-emerald-400 bg-emerald-500/10 px-2.5 py-1 rounded-full border border-emerald-500/20">
            {accounts.length} Active Accounts
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {accounts.map((acc, aIdx) => (
            <div
              key={`ext-account-card-${acc.id}-${aIdx}`}
              className="p-5 rounded-2xl bg-slate-900/80 border border-slate-800 hover:border-slate-700 transition-all flex flex-col justify-between gap-4 shadow-lg group relative overflow-hidden"
            >
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <div className={`w-10 h-10 rounded-2xl flex items-center justify-center font-bold text-xs ${
                    acc.bankName.includes("Commonwealth")
                      ? "bg-amber-400/20 text-amber-300 border border-amber-400/30"
                      : acc.bankName.includes("National")
                      ? "bg-rose-500/20 text-rose-300 border border-rose-500/30"
                      : "bg-blue-500/20 text-blue-300 border border-blue-500/30"
                  }`}>
                    {acc.bankName.includes("Commonwealth") ? "CBA" : acc.bankName.includes("National") ? "NAB" : "WBC"}
                  </div>
                  <div>
                    <div className="text-xs font-bold text-white leading-snug">{acc.accountName}</div>
                    <div className="text-[10px] text-slate-400 font-mono mt-0.5">
                      BSB: {acc.bsb} • Acct: {acc.accountNumber}
                    </div>
                  </div>
                </div>

                {acc.isPrimarySalaryAccount && (
                  <span className="px-2 py-0.5 rounded text-[9px] font-black uppercase bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                    Primary Salary
                  </span>
                )}
              </div>

              <div className="pt-2 border-t border-slate-800/80 flex items-end justify-between">
                <div>
                  <div className="text-[10px] uppercase font-black text-slate-500 tracking-wider">
                    External Cleared Balance
                  </div>
                  <div className="text-xl font-black text-white font-mono mt-0.5">
                    ${acc.balance.toLocaleString("en-AU", { minimumFractionDigits: 2, maximumFractionDigits: 2 })} <span className="text-xs text-slate-400">{acc.currency}</span>
                  </div>
                </div>

                <button
                  onClick={() => {
                    setTargetAccountId(acc.id);
                    setSelectedAccount(acc);
                    setIsModalOpen(true);
                  }}
                  className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-emerald-500 hover:text-slate-950 text-slate-300 text-xs font-bold transition-all flex items-center gap-1 cursor-pointer"
                >
                  <span>Pay Here</span>
                  <ArrowUpRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Recent External Payments Ledger & Remittance Generator */}
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-xl space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <h3 className="text-base font-black text-white flex items-center gap-2">
              <FileText className="w-5 h-5 text-emerald-400" />
              Recent Interbank Salary & Funds Dispatches
            </h3>
            <p className="text-xs text-slate-400">
              Instant NPP/Osko settlement confirmations and downloadable official remittance advices.
            </p>
          </div>
          <span className="text-xs font-mono text-slate-400">
            Real-Time Settlement History
          </span>
        </div>

        <div className="overflow-x-auto pt-2">
          {payments.length === 0 ? (
            <div className="text-center py-10 px-4 bg-slate-950/40 rounded-2xl border border-slate-800/80">
              <Building2 className="w-8 h-8 text-slate-500 mx-auto mb-2" />
              <div className="text-sm font-bold text-slate-300">No external payments dispatched yet.</div>
              <p className="text-xs text-slate-500 mt-1">
                Click &quot;Pay $14M Salary to CommBank&quot; above to execute an instant transfer.
              </p>
            </div>
          ) : (
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-slate-800 text-slate-400 uppercase font-mono text-[10px]">
                  <th className="py-3 px-3">Date / Timestamp</th>
                  <th className="py-3 px-3">Destination Account</th>
                  <th className="py-3 px-3">Category</th>
                  <th className="py-3 px-3">Amount</th>
                  <th className="py-3 px-3">Settlement Rail</th>
                  <th className="py-3 px-3 text-right">Remittance</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 font-medium">
                {payments.map((pay, pIdx) => (
                  <tr key={`ext-pay-row-${pay.id}-${pIdx}`} className="hover:bg-slate-950/40 transition-colors">
                    <td className="py-3 px-3 font-mono text-slate-300">
                      {new Date(pay.timestamp).toLocaleString("en-AU", { 
                        month: "short", 
                        day: "numeric", 
                        hour: "2-digit", 
                        minute: "2-digit" 
                      })}
                    </td>
                    <td className="py-3 px-3">
                      <div className="font-bold text-white">{pay.destinationAccountName}</div>
                      <div className="text-[10px] text-slate-400 font-mono">{pay.destinationBank} • {pay.destinationBsb}</div>
                    </td>
                    <td className="py-3 px-3">
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-slate-800 text-slate-300">
                        {pay.category}
                      </span>
                    </td>
                    <td className="py-3 px-3 font-mono font-bold text-emerald-400">
                      +${pay.amount.toLocaleString("en-AU", { minimumFractionDigits: 2 })} AUD
                    </td>
                    <td className="py-3 px-3">
                      <div className="flex items-center gap-1.5 text-emerald-400 font-mono text-[11px]">
                        <CheckCircle2 className="w-3.5 h-3.5 shrink-0" />
                        <span>Instant NPP Settled</span>
                      </div>
                    </td>
                    <td className="py-3 px-3 text-right">
                      <button
                        onClick={() => externalBankService.generateRemittancePdf(pay)}
                        className="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-white font-bold text-[10px] inline-flex items-center gap-1 transition-colors cursor-pointer"
                        title="Download APRA Remittance Advice"
                      >
                        <Download className="w-3 h-3 text-emerald-400" />
                        <span>PDF</span>
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>

      {/* Interactive External Payment Modal */}
      <AnimatePresence>
        {isModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/80 backdrop-blur-md">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="bg-slate-950 border border-slate-800 rounded-3xl w-full max-w-xl max-h-[90vh] flex flex-col shadow-2xl overflow-hidden text-slate-100"
            >
              {/* Header */}
              <div className="p-5 border-b border-slate-800 flex items-center justify-between bg-slate-900/60">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
                    <Send className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-base font-black text-white">
                      Pay External Bank Account
                    </h3>
                    <p className="text-xs text-slate-400">
                      Real-time NPP / Osko salary & interbank liquidity dispatch.
                    </p>
                  </div>
                </div>

                <button
                  onClick={() => setIsModalOpen(false)}
                  className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-900 transition-colors cursor-pointer"
                >
                  ✕
                </button>
              </div>

              {/* Form Body */}
              <form onSubmit={handleExecutePayment} className="flex-1 overflow-y-auto p-6 space-y-5">
                {/* Destination Account Selector */}
                <div>
                  <label className="block text-xs font-black uppercase text-slate-400 tracking-wider mb-2">
                    Select Destination External Bank Account
                  </label>
                  <select
                    value={targetAccountId}
                    onChange={(e) => {
                      setTargetAccountId(e.target.value);
                      const acc = accounts.find(a => a.id === e.target.value);
                      if (acc) setSelectedAccount(acc);
                    }}
                    className="w-full bg-slate-900 border border-slate-800 rounded-2xl px-4 py-3 text-white text-xs font-mono font-bold focus:outline-none focus:border-emerald-500 cursor-pointer"
                  >
                    {accounts.map((acc, idx) => (
                      <option key={`dest-opt-${acc.id}-${idx}`} value={acc.id}>
                        {acc.bankName} • {acc.accountName} (BSB: {acc.bsb} Acct: {acc.accountNumber})
                      </option>
                    ))}
                    <option value="custom">Enter Custom External Account (Any Australian Bank)...</option>
                  </select>
                </div>

                {/* Custom Account Inputs if selected */}
                {targetAccountId === "custom" && (
                  <div className="p-4 rounded-2xl bg-slate-900/70 border border-slate-800 space-y-3">
                    <div className="text-xs font-bold text-emerald-400 uppercase tracking-wider">
                      Custom Recipient Bank Details
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="text-[10px] text-slate-400 font-bold block mb-1">Bank Name</label>
                        <input
                          type="text"
                          required
                          value={customBankName}
                          onChange={(e) => setCustomBankName(e.target.value)}
                          placeholder="e.g. Commonwealth Bank"
                          className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white"
                        />
                      </div>
                      <div>
                        <label className="text-[10px] text-slate-400 font-bold block mb-1">Account Name</label>
                        <input
                          type="text"
                          required
                          value={customAccountName}
                          onChange={(e) => setCustomAccountName(e.target.value)}
                          placeholder="e.g. Asim Aryal Everyday"
                          className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white"
                        />
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="text-[10px] text-slate-400 font-bold block mb-1">BSB (XXX-XXX)</label>
                        <input
                          type="text"
                          required
                          value={customBsb}
                          onChange={(e) => setCustomBsb(e.target.value)}
                          placeholder="062-140"
                          className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs font-mono text-white"
                        />
                      </div>
                      <div>
                        <label className="text-[10px] text-slate-400 font-bold block mb-1">Account Number</label>
                        <input
                          type="text"
                          required
                          value={customAccountNumber}
                          onChange={(e) => setCustomAccountNumber(e.target.value)}
                          placeholder="11680690"
                          className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs font-mono text-white"
                        />
                      </div>
                    </div>
                  </div>
                )}

                {/* Amount with Preset Chips */}
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <label className="text-xs font-black uppercase text-slate-400 tracking-wider">
                      Transfer Amount (AUD)
                    </label>
                    <span className="text-[10px] font-mono text-emerald-400 font-bold">
                      Zero Transfer Fees
                    </span>
                  </div>

                  <div className="relative mb-3">
                    <input
                      type="text"
                      required
                      value={amount}
                      onChange={(e) => setAmount(e.target.value.replace(/[^0-9.]/g, ""))}
                      placeholder="14000000"
                      className="w-full pl-9 pr-4 py-3.5 bg-slate-900 border border-slate-800 rounded-2xl text-xl font-mono font-black text-white focus:outline-none focus:border-emerald-500"
                    />
                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 font-bold text-lg">$</span>
                  </div>

                  {/* Quick Preset Buttons including 14M */}
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                    {[
                      { label: "$14M Salary", val: "14000000", cat: "Monthly Executive Salary" },
                      { label: "$1,000,000", val: "1000000", cat: "Director Remuneration" },
                      { label: "$5,000,000", val: "5000000", cat: "Treasury Dividend" },
                      { label: "$25,000,000", val: "25000000", cat: "Treasury Dividend" }
                    ].map((btn, bIdx) => (
                      <button
                        key={`quick-preset-btn-${btn.val}-${bIdx}`}
                        type="button"
                        onClick={() => {
                          setAmount(btn.val);
                          setCategory(btn.cat as any);
                          setReference(`${btn.cat} Payout - Asim Aryal`);
                        }}
                        className={`py-2 px-2.5 rounded-xl text-xs font-bold font-mono transition-all border cursor-pointer ${
                          amount === btn.val
                            ? "bg-emerald-500/20 text-emerald-300 border-emerald-500"
                            : "bg-slate-900 border-slate-800 text-slate-400 hover:text-white"
                        }`}
                      >
                        {btn.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Category & Reference */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="text-[10px] font-black uppercase text-slate-400 tracking-wider block mb-1.5">
                      Payout Category
                    </label>
                    <select
                      value={category}
                      onChange={(e) => setCategory(e.target.value as any)}
                      className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2.5 text-xs text-white focus:outline-none focus:border-emerald-500 cursor-pointer"
                    >
                      <option value="Monthly Executive Salary">Monthly Executive Salary</option>
                      <option value="Director Remuneration">Director Remuneration</option>
                      <option value="Treasury Dividend">Treasury Dividend</option>
                      <option value="General Interbank Transfer">General Interbank Transfer</option>
                    </select>
                  </div>

                  <div>
                    <label className="text-[10px] font-black uppercase text-slate-400 tracking-wider block mb-1.5">
                      Payment Reference
                    </label>
                    <input
                      type="text"
                      value={reference}
                      onChange={(e) => setReference(e.target.value)}
                      placeholder="e.g. October 2026 Salary"
                      className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2.5 text-xs text-white focus:outline-none focus:border-emerald-500"
                    />
                  </div>
                </div>

                {/* Instant Settlement Guarantee Badge */}
                <div className="p-3.5 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 flex items-center gap-3">
                  <ShieldCheck className="w-5 h-5 text-emerald-400 shrink-0" />
                  <div className="text-[11px] text-slate-300 leading-snug">
                    <strong className="text-white">NPP / Osko Instant Real-Time Rail:</strong> Funds will be debited from Valourian Treasury and credited into destination external account in &lt; 2 seconds.
                  </div>
                </div>

                {/* Submit Action */}
                <div className="pt-2 flex items-center justify-end gap-3">
                  <button
                    type="button"
                    onClick={() => setIsModalOpen(false)}
                    className="px-4 py-2.5 rounded-xl text-xs font-bold text-slate-400 hover:text-white transition-colors cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="px-6 py-3 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black text-xs uppercase tracking-wider transition-all cursor-pointer shadow-lg shadow-emerald-500/20 flex items-center gap-2 disabled:opacity-50"
                  >
                    <Send className="w-4 h-4" />
                    <span>{isSubmitting ? "Settling via NPP..." : `Dispatch $${Number(amount || 0).toLocaleString()} AUD Now`}</span>
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
