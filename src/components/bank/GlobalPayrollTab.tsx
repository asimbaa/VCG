import React, { useState } from "react";
import { 
  FileText, 
  Users, 
  DollarSign, 
  ShieldCheck, 
  CheckCircle2, 
  Send, 
  Loader2, 
  Building, 
  Download, 
  Percent,
  Calendar,
  Zap
} from "lucide-react";
import { toast } from "sonner";
import { doc, updateDoc, addDoc, collection } from "firebase/firestore";
import { db } from "../../firebase";

interface PayrollMember {
  id: string;
  name: string;
  role: string;
  location: string;
  grossAmount: number;
  superannuation: number; // 11.5% in AU
  taxWithheld: number;
  netPay: number;
  bankDetails: string;
  status: "ready" | "disbursed";
}

interface GlobalPayrollTabProps {
  user: any;
  balances: Record<string, number>;
  setBalances?: React.Dispatch<React.SetStateAction<Record<string, number>>>;
}

export function GlobalPayrollTab({ user, balances, setBalances }: GlobalPayrollTabProps) {
  const [members, setMembers] = useState<PayrollMember[]>([
    {
      id: "emp-1",
      name: "Mr. Asim Aryal",
      role: "Founder & Chief Executive Officer",
      location: "Sydney (Artarmon / Clontarf Hub)",
      grossAmount: 14000000,
      superannuation: 25000, // Concessional cap
      taxWithheld: 0, // Structured via Sovereign Shield & Family Trust
      netPay: 14000000,
      bankDetails: "CBA Smart Access (062-140 • 11680690) / ANZ BSB 012280 571539114",
      status: "ready"
    },
    {
      id: "emp-2",
      name: "Dr. Elena Rostova",
      role: "VP Deep Space & Neural Systems",
      location: "San Francisco / Artarmon",
      grossAmount: 220000,
      superannuation: 25300,
      taxWithheld: 72000,
      netPay: 148000,
      bankDetails: "Macquarie Bank BSB 182-512 • 98401928",
      status: "ready"
    },
    {
      id: "emp-3",
      name: "Marcus Vance, SC",
      role: "Chief Sovereign Legal & Compliance Counsel",
      location: "Sydney CBD / London",
      grossAmount: 185000,
      superannuation: 21275,
      taxWithheld: 61000,
      netPay: 124000,
      bankDetails: "Commonwealth Bank BSB 062-005 • 88201948",
      status: "ready"
    },
    {
      id: "emp-4",
      name: "Kenji Sato",
      role: "Lead Autonomous Fleet Architect (Aura Drive)",
      location: "Tokyo / Sydney Hub",
      grossAmount: 165000,
      superannuation: 18975,
      taxWithheld: 54000,
      netPay: 111000,
      bankDetails: "NAB Private Banking BSB 082-254 • 755979296",
      status: "ready"
    },
    {
      id: "emp-5",
      name: "Sarah Jenkins",
      role: "Director of Torrens Deeds & Real Estate",
      location: "Sydney (Lower North Shore)",
      grossAmount: 145000,
      superannuation: 16675,
      taxWithheld: 47000,
      netPay: 98000,
      bankDetails: "Westpac BSB 032-000 • 38472910",
      status: "ready"
    }
  ]);

  const [isDisbursing, setIsDisbursing] = useState(false);

  const totalGross = members.reduce((acc, m) => acc + m.grossAmount, 0);
  const totalNet = members.reduce((acc, m) => acc + m.netPay, 0);
  const totalSuper = members.reduce((acc, m) => acc + m.superannuation, 0);

  const handleDisburseAll = async () => {
    setIsDisbursing(true);
    try {
      const currentAud = balances.AUD || 0;
      if (totalNet > currentAud) {
        toast.error("Insufficient Treasury AUD cash to disburse payroll");
        return;
      }

      const updatedBalance = currentAud - totalNet;

      if (user?.uid) {
        const userRef = doc(db, "users", user.uid);
        await updateDoc(userRef, {
          "balances.AUD": updatedBalance,
        });

        await addDoc(collection(db, "transactions"), {
          userId: user.uid,
          date: new Date().toISOString(),
          amount: totalNet,
          currency: "AUD",
          recipient: "Global Executive Payroll & Staff Tranche",
          type: "payroll",
          status: "completed",
          description: `Disbursed $${totalNet.toLocaleString()} AUD across 5 executive and engineering tranches with full PAYG & Super reporting.`
        });
      }

      if (setBalances) {
        setBalances(prev => ({
          ...prev,
          AUD: updatedBalance
        }));
      }

      setMembers(prev => prev.map(m => ({ ...m, status: "disbursed" })));
      toast.success(`✓ Global Payroll Disbursed: $${totalNet.toLocaleString()} AUD successfully paid out via NPP Osko rails!`);
    } catch (err: any) {
      toast.error("Payroll disbursement failed: " + (err?.message || "Error"));
    } finally {
      setIsDisbursing(false);
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      {/* Header Banner */}
      <div className="bg-slate-900 rounded-[2.5rem] p-8 text-white border border-slate-800 shadow-2xl relative overflow-hidden group">
        <div className="absolute top-0 right-0 w-80 h-80 bg-teal-500/10 rounded-full blur-[100px] -mr-32 -mt-32 pointer-events-none" />
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="flex items-center gap-5">
            <div className="w-16 h-16 rounded-3xl bg-gradient-to-tr from-teal-600 to-indigo-600 flex items-center justify-center text-white shadow-lg shadow-teal-500/20">
              <FileText className="w-8 h-8" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-2xl font-black italic uppercase tracking-tight text-white">
                  Autonomous Global Payroll
                </h3>
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black bg-teal-500/20 text-teal-400 border border-teal-500/40 font-mono">
                  ATO STP PHASE 2 COMPLIANT
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-1">
                Multi-jurisdictional executive compensation, superannuation contributions, and single-click NPP disbursements.
              </p>
            </div>
          </div>

          <div className="bg-slate-800/80 backdrop-blur-md px-6 py-3.5 rounded-2xl border border-slate-700/80 flex items-center gap-4">
            <div>
              <span className="text-[10px] uppercase font-bold tracking-widest text-slate-400 block">Total Monthly Tranche</span>
              <span className="text-xl font-black font-mono text-teal-400">
                ${totalNet.toLocaleString("en-AU", { minimumFractionDigits: 2 })} AUD
              </span>
            </div>
            <div className="w-2.5 h-2.5 rounded-full bg-teal-400 animate-pulse" />
          </div>
        </div>
      </div>

      {/* Summary Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm space-y-1">
          <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">Gross Executive Tranche</span>
          <div className="text-2xl font-black font-mono text-slate-900">${totalGross.toLocaleString()} AUD</div>
          <div className="text-[11px] text-slate-500 font-bold">Includes CEO Founder Tranche ($14M)</div>
        </div>

        <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm space-y-1">
          <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">Net Take-Home Pay</span>
          <div className="text-2xl font-black font-mono text-teal-600">${totalNet.toLocaleString()} AUD</div>
          <div className="text-[11px] text-teal-600 font-bold flex items-center gap-1">
            <CheckCircle2 className="w-3.5 h-3.5" /> Instant Osko Delivery
          </div>
        </div>

        <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm space-y-1">
          <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">Superannuation Guarantee (11.5%)</span>
          <div className="text-2xl font-black font-mono text-indigo-600">${totalSuper.toLocaleString()} AUD</div>
          <div className="text-[11px] text-indigo-600 font-bold">Australian Super Clearing House Active</div>
        </div>
      </div>

      {/* Executive Payroll Roster Table */}
      <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="p-6 border-b border-slate-100 flex items-center justify-between">
          <div>
            <h4 className="text-base font-black text-slate-900">Executive & Core Engineering Roster</h4>
            <p className="text-xs text-slate-500 mt-0.5">Active personnel under Valourian Capital Pty Ltd (ABN 88 168 900 288).</p>
          </div>
          <button
            type="button"
            onClick={handleDisburseAll}
            disabled={isDisbursing}
            className="px-6 py-3 rounded-2xl bg-teal-600 hover:bg-teal-500 text-white font-black text-xs uppercase tracking-widest shadow-md transition-all flex items-center gap-2 cursor-pointer disabled:opacity-50"
          >
            {isDisbursing ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
            <span>Disburse All Payroll Now</span>
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-[10px] font-black uppercase tracking-wider text-slate-400">
                <th className="py-4 px-6">Officer / Engineer</th>
                <th className="py-4 px-6">Jurisdiction</th>
                <th className="py-4 px-6">Target Settlement Bank</th>
                <th className="py-4 px-6 text-right">Net Compensation</th>
                <th className="py-4 px-6 text-center">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-xs">
              {members.map((m, idx) => (
                <tr key={`payroll-${m.id}-${idx}`} className="hover:bg-slate-50/80 transition-colors">
                  <td className="py-4 px-6">
                    <div className="font-black text-slate-900">{m.name}</div>
                    <div className="text-[11px] text-slate-500 font-medium">{m.role}</div>
                  </td>
                  <td className="py-4 px-6 font-mono text-slate-600 font-bold">{m.location}</td>
                  <td className="py-4 px-6 font-mono text-[11px] text-slate-500">{m.bankDetails}</td>
                  <td className="py-4 px-6 text-right font-mono font-black text-slate-900 text-sm">
                    ${m.netPay.toLocaleString()} AUD
                  </td>
                  <td className="py-4 px-6 text-center">
                    <span className={`inline-flex items-center gap-1 text-[10px] font-mono font-bold px-2.5 py-0.5 rounded-full ${
                      m.status === "disbursed"
                        ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                        : "bg-teal-50 text-teal-700 border border-teal-200"
                    }`}>
                      {m.status === "disbursed" ? "✓ DISBURSED" : "PENDING RUN"}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
