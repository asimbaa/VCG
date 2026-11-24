import React, { useEffect, useState } from "react";
import {
  Landmark,
  ArrowUpRight,
  CheckCircle2,
  Loader2,
  TrendingDown,
  Plus,
  PauseCircle,
  PlayCircle,
  Sparkles,
  Activity,
  ShieldCheck,
  Store,
  Ticket,
  Globe,
} from "lucide-react";
import { toast } from "sonner";
import { doc, updateDoc } from "firebase/firestore";
import { auth, db, handleFirestoreError, OperationType } from "../../firebase";
import {
  creChargeFacilitiesService,
  CreChargeFacility,
  CreFacilityEvent,
} from "../../services/creChargeFacilitiesService";

interface SovereignCreditLineTabProps {
  user: any;
  balances: Record<string, number>;
  setBalances?: React.Dispatch<React.SetStateAction<Record<string, number>>>;
}

export function SovereignCreditLineTab({
  user,
  balances,
  setBalances,
}: SovereignCreditLineTabProps) {
  const [facilities, setFacilities] = useState<CreChargeFacility[]>(() =>
    creChargeFacilitiesService.getFacilities()
  );
  const [selectedFacilityId, setSelectedFacilityId] = useState<string>(() =>
    creChargeFacilitiesService.getActiveFacilityId()
  );
  const [events, setEvents] = useState<CreFacilityEvent[]>(() =>
    creChargeFacilitiesService.getEvents()
  );

  const [drawInput, setDrawInput] = useState("");
  const [repayInput, setRepayInput] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);
  const [targetAccount, setTargetAccount] = useState("cba_smart_access");

  const [showCreateForm, setShowCreateForm] = useState(false);
  const [newName, setNewName] = useState("");
  const [newLimit, setNewLimit] = useState("25000000");
  const [newNetwork, setNewNetwork] =
    useState<CreChargeFacility["network"]>("CreCharge Sovereign");
  const [newApr, setNewApr] = useState("1.50");

  useEffect(() => {
    const unsub = creChargeFacilitiesService.subscribe((next) => {
      setFacilities(next);
      setEvents(creChargeFacilitiesService.getEvents());
    });
    return () => unsub();
  }, []);

  const activeFacility =
    facilities.find((f) => f.id === selectedFacilityId) || facilities[0];
  const summary = creChargeFacilitiesService.getTotalCapacitySummary();

  const utilizationRate =
    activeFacility && activeFacility.totalLimitAUD > 0
      ? (
          (activeFacility.drawnAmountAUD / activeFacility.totalLimitAUD) *
          100
        ).toFixed(2)
      : "0.00";

  const formatCompactAUD = (val: number) => {
    if (val >= 1_000_000_000) return `$${(val / 1_000_000_000).toFixed(2)}B`;
    if (val >= 1_000_000) return `$${(val / 1_000_000).toFixed(1)}M`;
    return `$${val.toLocaleString("en-AU", { minimumFractionDigits: 2 })}`;
  };

  const handleSelectFacility = (id: string) => {
    setSelectedFacilityId(id);
    creChargeFacilitiesService.setActiveFacilityId(id);
    toast.success("Active CreChargeFacility updated across all stores & apps");
  };

  const handleDrawdown = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeFacility) return;
    const cleanAmt = parseFloat(drawInput.replace(/,/g, ""));
    if (isNaN(cleanAmt) || cleanAmt <= 0) {
      toast.error("Please enter a valid drawdown amount");
      return;
    }

    setIsProcessing(true);
    try {
      const res = creChargeFacilitiesService.drawToAccount(
        activeFacility.id,
        cleanAmt,
        targetAccount
      );
      if (!res.success) {
        toast.error(res.error || "Drawdown declined");
        return;
      }

      const currentAud = balances.AUD || 0;
      const updatedBalance = currentAud + cleanAmt;

      const cloudUid = auth.currentUser?.uid;
      if (cloudUid) {
        try {
          await updateDoc(doc(db, "users", cloudUid), {
            "balances.AUD": updatedBalance,
          });
        } catch (fsErr) {
          handleFirestoreError(fsErr, OperationType.UPDATE, `users/${cloudUid}`);
        }
      }

      if (setBalances) {
        setBalances((prev) => ({
          ...prev,
          AUD: updatedBalance,
        }));
      }
      window.dispatchEvent(
        new CustomEvent("valourian_balance_delta", {
          detail: { currency: "AUD", delta: cleanAmt },
        })
      );

      setDrawInput("");
      toast.success(
        `$${cleanAmt.toLocaleString("en-AU")} AUD drawn from ${activeFacility.facilityName} (Auth: ${res.authCode})`
      );
    } catch (err: any) {
      toast.error("Failed to execute drawdown: " + (err?.message || "Error"));
    } finally {
      setIsProcessing(false);
    }
  };

  const handleRepayment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeFacility) return;
    const cleanAmt = parseFloat(repayInput.replace(/,/g, ""));
    if (isNaN(cleanAmt) || cleanAmt <= 0) {
      toast.error("Please enter a valid repayment amount");
      return;
    }

    setIsProcessing(true);
    try {
      const res = creChargeFacilitiesService.repayFacility(
        activeFacility.id,
        cleanAmt,
        "Valourian AUD Primary Vault"
      );
      if (!res.success) {
        toast.error(res.error || "Repayment could not be applied");
        return;
      }

      const applied = res.appliedRepaymentAUD || cleanAmt;
      const currentAud = balances.AUD || 0;
      const updatedBalance = Math.max(0, currentAud - applied);

      const cloudUid = auth.currentUser?.uid;
      if (cloudUid) {
        try {
          await updateDoc(doc(db, "users", cloudUid), {
            "balances.AUD": updatedBalance,
          });
        } catch (fsErr) {
          handleFirestoreError(fsErr, OperationType.UPDATE, `users/${cloudUid}`);
        }
      }

      if (setBalances) {
        setBalances((prev) => ({
          ...prev,
          AUD: updatedBalance,
        }));
      }
      window.dispatchEvent(
        new CustomEvent("valourian_balance_delta", {
          detail: { currency: "AUD", delta: -applied },
        })
      );

      setRepayInput("");
      toast.success(
        `$${applied.toLocaleString("en-AU")} AUD principal repaid to ${activeFacility.facilityName}.`
      );
    } catch (err: any) {
      toast.error("Failed to execute repayment: " + (err?.message || "Error"));
    } finally {
      setIsProcessing(false);
    }
  };

  const handleCreateCustom = (e: React.FormEvent) => {
    e.preventDefault();
    const limitNum = parseFloat(newLimit.replace(/,/g, "")) || 25_000_000;
    const aprNum = parseFloat(newApr) || 0;
    const created = creChargeFacilitiesService.createCustomFacility({
      facilityName: newName || "Executive Strategic CreCharge Facility",
      totalLimitAUD: limitNum,
      network: newNetwork,
      primeAprPercent: aprNum,
      interestFreeDays: 60,
    });
    setSelectedFacilityId(created.id);
    setNewName("");
    setShowCreateForm(false);
    toast.success(
      `Provisioned ${created.facilityName} (${created.facilityCode}) — active in all stores & apps!`
    );
  };

  return (
    <div className="space-y-6 sm:space-y-8 animate-in fade-in duration-300">
      {/* CreChargeFacilities Master Header */}
      <div className="bg-slate-900 rounded-3xl sm:rounded-[2.5rem] p-5 sm:p-8 text-white border border-slate-800 shadow-2xl relative overflow-hidden">
        <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="flex items-start sm:items-center gap-4 sm:gap-5">
            <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-2xl sm:rounded-3xl bg-gradient-to-tr from-amber-500 to-indigo-600 flex items-center justify-center text-white shadow-lg shrink-0">
              <Landmark className="w-7 h-7 sm:w-8 sm:h-8" />
            </div>
            <div>
              <div className="flex flex-wrap items-center gap-2">
                <h3 className="text-xl sm:text-2xl font-black uppercase tracking-tight text-white">
                  CreChargeFacilities Hub
                </h3>
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 font-mono">
                  ACTIVE IN ALL STORES & APPS
                </span>
              </div>
              <p className="text-xs sm:text-sm text-slate-300 mt-1">
                Revolving sovereign facilities & corporate charge lines accepted across SovereignStore, Uber, Uber Eats, Booking.com, RapidPay, and Global POS.
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <div className="bg-slate-800/90 px-4 sm:px-5 py-3 rounded-2xl border border-slate-700 flex items-center gap-3">
              <div>
                <span className="text-[10px] uppercase font-bold tracking-widest text-slate-400 block">
                  Aggregate Headroom
                </span>
                <span className="text-lg sm:text-xl font-black font-mono text-emerald-400 tabular-nums">
                  {formatCompactAUD(summary.availableCreditAUD)} AUD
                </span>
              </div>
              <ShieldCheck className="w-5 h-5 text-emerald-400 shrink-0" />
            </div>

            <button
              type="button"
              onClick={() => setShowCreateForm((v) => !v)}
              className="min-h-[44px] px-4 py-2.5 rounded-2xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-xs uppercase tracking-wider flex items-center gap-2 transition-all cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>{showCreateForm ? "Close Provisioner" : "New CreCharge Facility"}</span>
            </button>
          </div>
        </div>
      </div>

      {/* CreChargeFacilities Partner Perks & Zero-Fee Settlement Matrix */}
      <div className="bg-white rounded-3xl p-5 sm:p-6 border border-slate-200 shadow-sm flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 flex-1">
          <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200">
            <div className="text-[10px] font-black uppercase tracking-widest text-slate-500">Settlement Window</div>
            <div className="text-sm font-black text-slate-900 mt-0.5 tabular-nums">{activeFacility?.interestFreeDays || 60} Days @ 0% Fee</div>
          </div>
          <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200">
            <div className="text-[10px] font-black uppercase tracking-widest text-slate-500 flex items-center gap-1">
              <Globe className="w-3 h-3 text-emerald-600" /> FX & Wire Markup
            </div>
            <div className="text-sm font-black text-emerald-600 mt-0.5 tabular-nums">$0.00 Guaranteed</div>
          </div>
          <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200">
            <div className="text-[10px] font-black uppercase tracking-widest text-slate-500">Store Rebate</div>
            <div className="text-sm font-black text-indigo-600 mt-0.5 tabular-nums">5.0% Instant Return</div>
          </div>
        </div>

        <button
          type="button"
          onClick={() => {
            if (!activeFacility) return;
            const passCode = `CRE-PASS-${Math.floor(10000 + Math.random() * 89999)}`;
            const passVoucher = {
              code: passCode,
              title: "$25,000 AUD CreCharge Store Procurement Pass",
              amountAUD: 25000,
              storeScope: "All Partner Stores & Apps",
              issuedAt: new Date().toISOString(),
            };
            try {
              const existing = JSON.parse(localStorage.getItem("valourian_benefit_vouchers") || "[]");
              localStorage.setItem("valourian_benefit_vouchers", JSON.stringify([passVoucher, ...existing].slice(0, 12)));
              navigator.clipboard?.writeText(passCode);
            } catch {}
            toast.success(`Issued ${passCode} ($25,000 AUD Store Procurement Pass from ${activeFacility.facilityCode}, copied to clipboard).`);
          }}
          className="min-h-[48px] px-5 py-3 rounded-2xl bg-slate-900 hover:bg-slate-800 text-white font-black text-xs uppercase tracking-wider flex items-center justify-center gap-2 transition-colors cursor-pointer shrink-0"
        >
          <Ticket className="w-4 h-4 text-amber-400" />
          <span>Issue $25,000 Store Procurement Pass</span>
        </button>
      </div>

      {/* Inline Custom Facility Provisioner */}
      {showCreateForm && (
        <form
          onSubmit={handleCreateCustom}
          className="bg-white rounded-3xl p-5 sm:p-6 border border-amber-300 shadow-sm space-y-4"
        >
          <div className="flex items-center justify-between">
            <h4 className="text-sm font-black uppercase tracking-wider text-slate-900 flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-amber-500" />
              Provision Custom CreChargeFacility
            </h4>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Facility Name
              </label>
              <input
                type="text"
                value={newName}
                onChange={(e) => setNewName(e.target.value)}
                placeholder="e.g. Executive Jet & Tech Facility"
                className="w-full min-h-[44px] px-3 py-2 rounded-xl bg-slate-50 border border-slate-300 text-xs font-bold text-slate-900"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Credit Limit (AUD)
              </label>
              <input
                type="number"
                value={newLimit}
                onChange={(e) => setNewLimit(e.target.value)}
                className="w-full min-h-[44px] px-3 py-2 rounded-xl bg-slate-50 border border-slate-300 text-xs font-mono font-bold text-slate-900"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Clearing Network
              </label>
              <select
                value={newNetwork}
                onChange={(e) =>
                  setNewNetwork(e.target.value as CreChargeFacility["network"])
                }
                className="w-full min-h-[44px] px-3 py-2 rounded-xl bg-slate-50 border border-slate-300 text-xs font-bold text-slate-900"
              >
                <option value="CreCharge Sovereign">CreCharge Sovereign</option>
                <option value="AMEX Charge">AMEX Charge</option>
                <option value="Mastercard Commercial">Mastercard Commercial</option>
                <option value="Visa Institutional">Visa Institutional</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Prime Rate (% p.a.)
              </label>
              <input
                type="number"
                step="0.05"
                value={newApr}
                onChange={(e) => setNewApr(e.target.value)}
                className="w-full min-h-[44px] px-3 py-2 rounded-xl bg-slate-50 border border-slate-300 text-xs font-mono font-bold text-slate-900"
              />
            </div>
          </div>
          <div className="flex justify-end">
            <button
              type="submit"
              className="min-h-[44px] px-6 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-black text-xs uppercase tracking-widest cursor-pointer"
            >
              Activate Facility Across All Stores
            </button>
          </div>
        </form>
      )}

      {/* Facility Selector Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {facilities.map((fac) => {
          const isSelected = fac.id === activeFacility?.id;
          const isPaused = fac.status === "paused";
          return (
            <div
              key={fac.id}
              onClick={() => handleSelectFacility(fac.id)}
              className={`rounded-3xl p-5 border transition-all cursor-pointer flex flex-col justify-between gap-4 ${
                isSelected
                  ? "bg-slate-900 text-white border-amber-400 shadow-xl"
                  : "bg-white text-slate-900 border-slate-200 hover:border-slate-400 shadow-sm"
              }`}
            >
              <div className="flex items-start justify-between gap-2">
                <div>
                  <span
                    className={`text-[10px] font-mono font-black uppercase tracking-widest ${
                      isSelected ? "text-amber-400" : "text-slate-500"
                    }`}
                  >
                    {fac.facilityCode} • {fac.network}
                  </span>
                  <h4 className="text-sm sm:text-base font-black mt-0.5 leading-snug">
                    {fac.facilityName}
                  </h4>
                </div>
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    creChargeFacilitiesService.toggleFacilityStatus(fac.id);
                    toast.info(
                      `${fac.facilityName} is now ${
                        isPaused ? "ACTIVE" : "PAUSED"
                      }`
                    );
                  }}
                  className={`min-h-[36px] px-2.5 py-1 rounded-full text-[10px] font-black uppercase flex items-center gap-1 cursor-pointer ${
                    isPaused
                      ? "bg-amber-500/20 text-amber-500 border border-amber-500/40"
                      : "bg-emerald-500/20 text-emerald-500 border border-emerald-500/40"
                  }`}
                >
                  {isPaused ? (
                    <>
                      <PauseCircle className="w-3.5 h-3.5" /> Paused
                    </>
                  ) : (
                    <>
                      <PlayCircle className="w-3.5 h-3.5" /> Active
                    </>
                  )}
                </button>
              </div>

              <div className="space-y-1.5 text-xs">
                <div className="flex justify-between">
                  <span className={isSelected ? "text-slate-400" : "text-slate-500"}>
                    Available Headroom
                  </span>
                  <span className="font-mono font-black text-emerald-500 tabular-nums">
                    {formatCompactAUD(fac.availableCreditAUD)}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className={isSelected ? "text-slate-400" : "text-slate-500"}>
                    Drawn Balance
                  </span>
                  <span className="font-mono font-bold tabular-nums">
                    {formatCompactAUD(fac.drawnAmountAUD)}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className={isSelected ? "text-slate-400" : "text-slate-500"}>
                    Terms
                  </span>
                  <span className="font-mono font-bold">
                    {fac.primeAprPercent === 0
                      ? "0.00% Charge"
                      : `${fac.primeAprPercent.toFixed(2)}% p.a.`}{" "}
                    • {fac.interestFreeDays}d
                  </span>
                </div>
              </div>

              <div
                className={`pt-2 border-t text-[10px] font-bold flex items-center justify-between ${
                  isSelected
                    ? "border-slate-800 text-amber-300"
                    : "border-slate-100 text-slate-600"
                }`}
              >
                <span className="flex items-center gap-1">
                  <Store className="w-3 h-3" /> Stores, Uber, Eats, Booking
                </span>
                {isSelected && <CheckCircle2 className="w-4 h-4 text-emerald-400" />}
              </div>
            </div>
          );
        })}
      </div>

      {/* Selected Facility Metrics Grid */}
      {activeFacility && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-white rounded-3xl p-5 border border-slate-200 shadow-sm space-y-1">
            <span className="text-[10px] font-black uppercase tracking-widest text-slate-500">
              Selected Facility Limit
            </span>
            <div className="text-2xl font-black font-mono text-slate-900 tabular-nums">
              {formatCompactAUD(activeFacility.totalLimitAUD)} AUD
            </div>
            <div className="text-[11px] text-slate-500 font-bold">
              Auto-Replenish: {activeFacility.autoReplenish ? "Enabled" : "Standard"}
            </div>
          </div>

          <div className="bg-white rounded-3xl p-5 border border-slate-200 shadow-sm space-y-1">
            <span className="text-[10px] font-black uppercase tracking-widest text-slate-500">
              Available to Draw / Charge
            </span>
            <div className="text-2xl font-black font-mono text-emerald-600 tabular-nums">
              {formatCompactAUD(activeFacility.availableCreditAUD)} AUD
            </div>
            <div className="text-[11px] text-emerald-600 font-bold flex items-center gap-1">
              <CheckCircle2 className="w-3.5 h-3.5" /> Instant T+0 Clearance
            </div>
          </div>

          <div className="bg-white rounded-3xl p-5 border border-slate-200 shadow-sm space-y-1">
            <span className="text-[10px] font-black uppercase tracking-widest text-slate-500">
              Current Drawn Balance
            </span>
            <div className="text-2xl font-black font-mono text-amber-600 tabular-nums">
              {formatCompactAUD(activeFacility.drawnAmountAUD)} AUD
            </div>
            <div className="text-[11px] text-slate-500 font-bold">
              Utilization: {utilizationRate}%
            </div>
          </div>

          <div className="bg-white rounded-3xl p-5 border border-slate-200 shadow-sm space-y-1">
            <span className="text-[10px] font-black uppercase tracking-widest text-slate-500">
              Collateral Coverage
            </span>
            <div className="text-2xl font-black font-mono text-indigo-600 tabular-nums">
              {activeFacility.collateralCoverageRatio}
            </div>
            <div className="text-[11px] text-indigo-600 font-bold flex items-center gap-1">
              <ShieldCheck className="w-3.5 h-3.5" /> AAA Sovereign Guaranteed
            </div>
          </div>
        </div>
      )}

      {/* Drawdown & Repayment Panels */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 sm:gap-8">
        {/* Drawdown Panel */}
        <div className="bg-white rounded-3xl p-5 sm:p-8 border border-slate-200 shadow-sm space-y-6">
          <div className="flex items-center gap-3 border-b border-slate-100 pb-4">
            <div className="w-10 h-10 rounded-2xl bg-emerald-50 border border-emerald-200 flex items-center justify-center text-emerald-600 shrink-0">
              <ArrowUpRight className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-base font-black text-slate-900">
                Execute Instant Drawdown
              </h4>
              <p className="text-xs text-slate-500">
                Draw from {activeFacility?.facilityName || "CreChargeFacility"} directly into operational accounts.
              </p>
            </div>
          </div>

          <form onSubmit={handleDrawdown} className="space-y-4">
            <div>
              <div className="flex flex-wrap items-center justify-between gap-2 mb-1.5">
                <label className="block text-xs font-bold text-slate-700">
                  Drawdown Amount (AUD)
                </label>
                <div className="flex gap-1.5">
                  {[
                    { label: "+$100K", val: 100000 },
                    { label: "+$1M", val: 1000000 },
                    { label: "+$10M", val: 10000000 },
                  ].map((preset) => (
                    <button
                      key={preset.label}
                      type="button"
                      onClick={() => setDrawInput(String(preset.val))}
                      className="px-2.5 py-1 rounded-lg bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 text-[11px] font-mono font-bold text-emerald-700 cursor-pointer"
                    >
                      {preset.label}
                    </button>
                  ))}
                </div>
              </div>
              <input
                type="number"
                step="any"
                value={drawInput}
                onChange={(e) => setDrawInput(e.target.value)}
                placeholder="e.g. 5000000"
                className="w-full min-h-[48px] px-4 py-3 rounded-2xl bg-slate-50 border border-slate-200 text-lg font-black font-mono text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500 tabular-nums"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">
                Destination Account
              </label>
              <select
                value={targetAccount}
                onChange={(e) => setTargetAccount(e.target.value)}
                className="w-full min-h-[44px] px-4 py-3 rounded-xl bg-slate-50 border border-slate-200 text-xs font-bold text-slate-800 focus:outline-none"
              >
                <option value="cba_smart_access">
                  CommBank Smart Access (062-140 • 11680690) — ASIM ARYAL
                </option>
                <option value="cba_val_business">
                  CBA VAL Business Operating (062-151 • 10559938)
                </option>
                <option value="macquarie_vip">
                  Macquarie Sovereign VIP Liquidity Hub (BSB 182-512)
                </option>
              </select>
            </div>

            <button
              type="submit"
              disabled={isProcessing}
              className="w-full min-h-[48px] py-3.5 rounded-2xl bg-emerald-600 hover:bg-emerald-500 text-white font-black text-xs uppercase tracking-widest shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
            >
              {isProcessing ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <ArrowUpRight className="w-4 h-4" />
              )}
              <span>Execute Drawdown to Linked Bank</span>
            </button>
          </form>
        </div>

        {/* Repayment Panel */}
        <div className="bg-white rounded-3xl p-5 sm:p-8 border border-slate-200 shadow-sm space-y-6">
          <div className="flex items-center gap-3 border-b border-slate-100 pb-4">
            <div className="w-10 h-10 rounded-2xl bg-blue-50 border border-blue-200 flex items-center justify-center text-blue-600 shrink-0">
              <TrendingDown className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-base font-black text-slate-900">
                Principal Repayment
              </h4>
              <p className="text-xs text-slate-500">
                Voluntary partial or full paydown with zero early-settlement fee.
              </p>
            </div>
          </div>

          <form onSubmit={handleRepayment} className="space-y-4">
            <div>
              <div className="flex flex-wrap items-center justify-between gap-2 mb-1.5">
                <label className="block text-xs font-bold text-slate-700">
                  Repayment Amount (AUD)
                </label>
                {activeFacility && activeFacility.drawnAmountAUD > 0 && (
                  <button
                    type="button"
                    onClick={() => setRepayInput(String(activeFacility.drawnAmountAUD))}
                    className="px-2.5 py-1 rounded-lg bg-blue-50 hover:bg-blue-100 border border-blue-200 text-[11px] font-mono font-bold text-blue-700 cursor-pointer"
                  >
                    Repay Full Drawn ({formatCompactAUD(activeFacility.drawnAmountAUD)})
                  </button>
                )}
              </div>
              <input
                type="number"
                step="any"
                value={repayInput}
                onChange={(e) => setRepayInput(e.target.value)}
                placeholder="e.g. 10000000"
                className="w-full min-h-[48px] px-4 py-3 rounded-2xl bg-slate-50 border border-slate-200 text-lg font-black font-mono text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500 tabular-nums"
              />
            </div>

            <div className="p-3.5 bg-slate-50 rounded-2xl border border-slate-200 text-xs space-y-1">
              <div className="flex justify-between font-mono">
                <span className="text-slate-500 font-sans">Effective Annual Rate:</span>
                <span className="font-bold text-slate-800">
                  {activeFacility?.primeAprPercent.toFixed(2)}% Sovereign Index
                </span>
              </div>
              <div className="flex justify-between font-mono">
                <span className="text-slate-500 font-sans">Early Payoff Penalty:</span>
                <span className="font-bold text-emerald-600">
                  $0.00 (Zero Penalty Guarantee)
                </span>
              </div>
            </div>

            <button
              type="submit"
              disabled={isProcessing}
              className="w-full min-h-[48px] py-3.5 rounded-2xl bg-blue-600 hover:bg-blue-500 text-white font-black text-xs uppercase tracking-widest shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
            >
              {isProcessing ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <TrendingDown className="w-4 h-4" />
              )}
              <span>Execute Principal Repayment</span>
            </button>
          </form>
        </div>
      </div>

      {/* Live CreChargeFacility Events Ledger */}
      <div className="bg-white rounded-3xl p-5 sm:p-6 border border-slate-200 shadow-sm space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-100 pb-3">
          <div className="flex items-center gap-2">
            <Activity className="w-4 h-4 text-indigo-600" />
            <h4 className="text-sm font-black uppercase tracking-wider text-slate-900">
              Live CreChargeFacilities Ledger Feed
            </h4>
          </div>
          <span className="text-[11px] font-mono text-slate-500">
            {events.length} recorded facility events
          </span>
        </div>

        {events.length === 0 ? (
          <p className="text-xs text-slate-500 py-4 text-center">
            No facility charges or drawdowns executed yet this session. Select CreCharge in any Store, Uber, Uber Eats, Booking.com, or draw above.
          </p>
        ) : (
          <div className="space-y-2 max-h-64 overflow-y-auto">
            {events.slice(0, 15).map((ev) => (
              <div
                key={ev.eventId}
                className="flex flex-wrap items-center justify-between gap-2 p-3 rounded-2xl bg-slate-50 border border-slate-200 text-xs"
              >
                <div>
                  <div className="font-extrabold text-slate-900">
                    {ev.merchantName}{" "}
                    <span className="text-[10px] font-mono text-indigo-600 uppercase ml-1">
                      [{ev.storeApp}]
                    </span>
                  </div>
                  <div className="text-[11px] text-slate-500 font-mono">
                    {ev.facilityName} • {ev.action.toUpperCase()} • {ev.authCode}
                  </div>
                </div>
                <div className="text-right">
                  <div className="font-mono font-black text-slate-900 tabular-nums">
                    ${ev.amountAUD.toLocaleString("en-AU", { minimumFractionDigits: 2 })} AUD
                  </div>
                  <div className="text-[10px] text-slate-400">
                    {new Date(ev.timestamp).toLocaleTimeString("en-AU")}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
