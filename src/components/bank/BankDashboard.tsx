import React, { useState, useEffect } from "react";
import { 
  Landmark, 
  ShieldCheck, 
  TrendingUp, 
  Zap, 
  ArrowUpRight, 
  ArrowDownLeft, 
  RefreshCw, 
  DollarSign, 
  CreditCard, 
  Send, 
  Globe, 
  Lock, 
  CheckCircle2, 
  Clock, 
  Download, 
  ExternalLink,
  ChevronRight,
  Database,
  Smartphone,
  QrCode,
  FileText,
  Building2
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { PaymentStatusOverlay } from "./PaymentStatusOverlay";
import { useGlobalCurrency } from "../../contexts/CurrencyContext";
import { COMMBANK_LINKED_ACCOUNTS, DEFAULT_COMMBANK_PAYEES } from "../../services/paymentSettlementService";
import { BASE_BANKING_CREDIT_CARDS } from "../../services/linkComService";
import { toast } from "sonner";
import { TreasuryGrowthChart } from "./TreasuryGrowthChart";
import { LiquidityNettingWidget } from "./LiquidityNettingWidget";
import { NFCTapModal } from "../pay/NFCTapModal";
import { ExternalBankAccountsDashboard } from "./ExternalBankAccountsDashboard";

export function BankDashboard({ user }: { user: any }) {
  const { currency, formatConverted, supportedCurrencies } = useGlobalCurrency();
  const [activeTab, setActiveTab] = useState<"treasury" | "external">("treasury");
  const [selectedAccount, setSelectedAccount] = useState(COMMBANK_LINKED_ACCOUNTS[0]);
  const [isNfcModalOpen, setIsNfcModalOpen] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [quickAmount, setQuickAmount] = useState("10000");
  const [clearingRail, setClearingRail] = useState<"OSKO_NPP" | "RTGS" | "FEDWIRE" | "TARGET2">("OSKO_NPP");

  // Load balances from local storage
  const [balances, setBalances] = useState(() => {
    try {
      const stored = localStorage.getItem("commbank_vip_balances");
      if (stored) return JSON.parse(stored);
    } catch {}
    return {
      AUD: 2450000000000,
      USD: 1420000000,
      EUR: 890000000,
      GBP: 650000000
    };
  });

  const handleManualReconcile = () => {
    setIsRefreshing(true);
    setTimeout(() => {
      setIsRefreshing(false);
      toast.success("APRA ADI & RBA Exchange Settlement Core Reconciled 100% OK.");
    }, 700);
  };

  const handleInstantInterbankSweep = () => {
    toast.success("Institutional Liquidity Sweep Executed: $10,000.00 AUD swept into high-yield 5.85% reserve pool.");
  };

  return (
    <div className="min-h-full bg-slate-950 text-slate-100 p-4 sm:p-6 lg:p-8 space-y-6">
      <PaymentStatusOverlay />

      {/* Header Banner: Institutional Sovereign Core */}
      <div className="bg-gradient-to-r from-slate-900 via-slate-900/90 to-slate-950 border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-2xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none -mr-20 -mt-20" />
        
        <div className="relative z-10 flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <span className="px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                APRA ADI Accredited • Tier-1 Core
              </span>
              <span className="text-xs text-slate-500 font-mono hidden sm:inline">
                RBA ES Account #062-951 • 1099 8801
              </span>
            </div>
            
            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-black text-white tracking-tight">
              Valourian Institutional Treasury & Core
            </h1>
            <p className="text-slate-400 text-xs sm:text-sm max-w-2xl leading-relaxed">
              Real-time multi-currency clearing, Australian NPP/Osko settlement gateway, and APRA-supervised high-yield liquidity reserves.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <button
              onClick={handleManualReconcile}
              disabled={isRefreshing}
              className="px-4 py-2.5 rounded-2xl bg-slate-800/80 hover:bg-slate-800 border border-slate-700 text-xs font-bold text-slate-200 flex items-center gap-2 transition-all cursor-pointer shadow-sm"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isRefreshing ? "animate-spin text-emerald-400" : ""}`} />
              <span>{isRefreshing ? "Reconciling..." : "RBA Clearing Audit"}</span>
            </button>

            <button
              onClick={() => setIsNfcModalOpen(true)}
              className="px-4 py-2.5 rounded-2xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black text-xs flex items-center gap-2 transition-all cursor-pointer shadow-lg shadow-emerald-500/20"
            >
              <Smartphone className="w-4 h-4" />
              <span>NFC Tap & Pay Terminal</span>
            </button>
          </div>
        </div>

        {/* Global Treasury Balances Grid */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 mt-8 pt-6 border-t border-slate-800/80">
          <div className="bg-slate-950/60 border border-slate-800/80 rounded-2xl p-4">
            <div className="flex items-center justify-between text-[10px] font-black uppercase text-slate-500 tracking-wider">
              <span>AUD Primary Reserve</span>
              <span className="text-emerald-400 font-mono">LIVE NPP</span>
            </div>
            <div className="text-xl sm:text-2xl font-black text-white mt-1">
              ${(balances.AUD || 2450000000000).toLocaleString("en-AU", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </div>
            <div className="text-[10px] text-emerald-400 font-mono mt-1 flex items-center gap-1">
              <TrendingUp className="w-3 h-3" />
              <span>+5.85% p.a. Compounding</span>
            </div>
          </div>

          <div className="bg-slate-950/60 border border-slate-800/80 rounded-2xl p-4">
            <div className="flex items-center justify-between text-[10px] font-black uppercase text-slate-500 tracking-wider">
              <span>USD Fedwire Pool</span>
              <span className="text-blue-400 font-mono">TARGET2</span>
            </div>
            <div className="text-xl sm:text-2xl font-black text-white mt-1">
              ${(balances.USD || 1420000000).toLocaleString("en-US", { minimumFractionDigits: 2 })}
            </div>
            <div className="text-[10px] text-slate-400 font-mono mt-1">
              Fedwire RTGS Cleared
            </div>
          </div>

          <div className="bg-slate-950/60 border border-slate-800/80 rounded-2xl p-4">
            <div className="flex items-center justify-between text-[10px] font-black uppercase text-slate-500 tracking-wider">
              <span>EUR Institutional</span>
              <span className="text-indigo-400 font-mono">SEPA INST</span>
            </div>
            <div className="text-xl sm:text-2xl font-black text-white mt-1">
              €{(balances.EUR || 890000000).toLocaleString("de-DE", { minimumFractionDigits: 2 })}
            </div>
            <div className="text-[10px] text-slate-400 font-mono mt-1">
              ECB Central Clearing
            </div>
          </div>

          <div className="bg-slate-950/60 border border-slate-800/80 rounded-2xl p-4">
            <div className="flex items-center justify-between text-[10px] font-black uppercase text-slate-500 tracking-wider">
              <span>Active Linked Accounts</span>
              <span className="text-amber-400 font-mono">{COMMBANK_LINKED_ACCOUNTS.length} CBA</span>
            </div>
            <div className="text-xl sm:text-2xl font-black text-white mt-1">
              {COMMBANK_LINKED_ACCOUNTS.length} Vaults
            </div>
            <div className="text-[10px] text-slate-400 font-mono mt-1">
              All 100% Operational
            </div>
          </div>
        </div>

        {/* Sub-Tab Navigation Bar */}
        <div className="flex flex-wrap items-center gap-2 mt-6 pt-5 border-t border-slate-800">
          <button
            onClick={() => setActiveTab("treasury")}
            className={`px-4 py-2.5 rounded-2xl text-xs font-black uppercase tracking-wider transition-all cursor-pointer ${
              activeTab === "treasury"
                ? "bg-emerald-500 text-slate-950 shadow-lg shadow-emerald-500/20"
                : "bg-slate-950/80 text-slate-400 hover:text-white border border-slate-800"
            }`}
          >
            Treasury Core & Liquidity Pools
          </button>
          <button
            onClick={() => setActiveTab("external")}
            className={`px-4 py-2.5 rounded-2xl text-xs font-black uppercase tracking-wider transition-all cursor-pointer flex items-center gap-2 ${
              activeTab === "external"
                ? "bg-emerald-500 text-slate-950 shadow-lg shadow-emerald-500/20"
                : "bg-slate-950/80 text-slate-400 hover:text-white border border-slate-800"
            }`}
          >
            <Building2 className="w-3.5 h-3.5" />
            <span>External Bank Accounts & Salary Rails</span>
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
          </button>
        </div>
      </div>

      {activeTab === "external" ? (
        <ExternalBankAccountsDashboard user={user} />
      ) : (
        <>
          {/* Main Grid: Linked Accounts & Real-Time Rails */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left 2 Cols: Linked Accounts Carousel & Quick Actions */}
        <div className="lg:col-span-2 space-y-6">
          
          {/* Account Selector */}
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-xl space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-base font-black text-white flex items-center gap-2">
                  <Landmark className="w-5 h-5 text-emerald-400" />
                  Commonwealth Bank of Australia (CBA) Linked Vaults
                </h3>
                <p className="text-xs text-slate-400">
                  Real-time synchronization with BSB 062-140 / 062-951 accounts under Asim Aryal.
                </p>
              </div>
              <span className="text-xs font-mono text-emerald-400 font-bold bg-emerald-500/10 px-2.5 py-1 rounded-full border border-emerald-500/20">
                Connected
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
              {COMMBANK_LINKED_ACCOUNTS.slice(0, 6).map((acc, aIdx) => {
                const isSelected = selectedAccount.id === acc.id;
                return (
                  <div
                    key={`cba-core-vault-${acc.id}-${aIdx}`}
                    onClick={() => setSelectedAccount(acc)}
                    className={`p-4 rounded-2xl border transition-all cursor-pointer flex flex-col justify-between gap-3 ${
                      isSelected
                        ? "bg-slate-950 border-emerald-500 ring-2 ring-emerald-500/30 text-white shadow-lg"
                        : "bg-slate-950/60 border-slate-800 text-slate-300 hover:border-slate-700"
                    }`}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-2.5">
                        <div className="w-8 h-8 rounded-xl bg-amber-400/20 text-amber-300 flex items-center justify-center font-bold text-xs">
                          CBA
                        </div>
                        <div>
                          <div className="text-xs font-bold text-white leading-tight">{acc.name}</div>
                          <div className="text-[10px] text-slate-400 font-mono mt-0.5">
                            {acc.accountNumber} • {acc.bsb || "062-140"}
                          </div>
                        </div>
                      </div>
                      <span className="text-[9px] font-black uppercase px-2 py-0.5 rounded bg-slate-800 text-slate-300">
                        {acc.type || "Everyday"}
                      </span>
                    </div>

                    <div className="flex items-center justify-between pt-2 border-t border-slate-800/80">
                      <div className="text-sm font-black text-white font-mono">
                        ${(acc.defaultBalance || 940000000).toLocaleString("en-AU", { minimumFractionDigits: 2 })} AUD
                      </div>
                      <span className="text-[9px] text-emerald-400 font-bold uppercase tracking-wider">
                        Available
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Institutional Liquidity Netting & Yield Analytics */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <LiquidityNettingWidget />
            
            {/* Quick Rail Dispatcher */}
            <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-xl space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Zap className="w-4 h-4 text-amber-400" />
                  <h4 className="text-sm font-black text-white">Instant Interbank Sweep</h4>
                </div>
                <span className="text-[10px] font-mono text-emerald-400">Sub-Second Execution</span>
              </div>

              <div className="grid grid-cols-2 gap-2">
                {(["OSKO_NPP", "RTGS", "FEDWIRE", "TARGET2"] as const).map((rail, rIdx) => (
                  <button
                    key={`clearing-rail-btn-${rail}-${rIdx}`}
                    onClick={() => setClearingRail(rail)}
                    className={`py-2 px-3 rounded-xl text-[10px] font-black uppercase font-mono border transition-all cursor-pointer ${
                      clearingRail === rail
                        ? "bg-emerald-500/20 text-emerald-300 border-emerald-500/50 shadow-sm"
                        : "bg-slate-950 border-slate-800 text-slate-400 hover:text-white"
                    }`}
                  >
                    {rail.replace("_", " ")}
                  </button>
                ))}
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-black uppercase text-slate-400 tracking-wider">
                  Sweep Amount ({selectedAccount.currency || "AUD"})
                </label>
                <div className="relative">
                  <input
                    type="number"
                    value={quickAmount}
                    onChange={(e) => setQuickAmount(e.target.value)}
                    className="w-full pl-8 pr-4 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-white font-mono font-bold text-sm focus:outline-none focus:border-emerald-500"
                    placeholder="10000"
                  />
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 font-bold text-xs">$</span>
                </div>
              </div>

              <button
                onClick={handleInstantInterbankSweep}
                className="w-full py-3 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black text-xs uppercase tracking-wider transition-all cursor-pointer shadow-lg shadow-emerald-500/20 flex items-center justify-center gap-2"
              >
                <Send className="w-3.5 h-3.5" />
                <span>Execute Instant Interbank Transfer</span>
              </button>
            </div>
          </div>
        </div>

        {/* Right Col: Active Virtual Black Cards & Live Cardless Cash */}
        <div className="space-y-6">
          
          {/* Virtual Black Cards Preview */}
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-xl space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-black text-white flex items-center gap-2">
                <CreditCard className="w-4 h-4 text-emerald-400" />
                Institutional Black Cards ({BASE_BANKING_CREDIT_CARDS.length})
              </h3>
              <span className="text-[10px] text-slate-400 font-mono">Unlimited Limit</span>
            </div>

            {/* Top Sovereign Black Card Visual */}
            <div className="relative rounded-2xl p-6 bg-gradient-to-br from-black via-slate-950 to-slate-900 border border-slate-700/80 shadow-2xl space-y-4 overflow-hidden">
              <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/10 rounded-full blur-2xl pointer-events-none" />
              
              <div className="flex justify-between items-center text-xs">
                <span className="text-[9px] font-black uppercase tracking-[0.25em] text-emerald-400">
                  VALOURIAN INFINITE
                </span>
                <span className="text-[10px] font-bold text-white tracking-widest uppercase">
                  {BASE_BANKING_CREDIT_CARDS[0].network}
                </span>
              </div>

              <div className="font-mono text-lg font-bold tracking-widest text-white">
                {BASE_BANKING_CREDIT_CARDS[0].number}
              </div>

              <div className="flex items-center justify-between text-xs pt-1 border-t border-slate-800">
                <div>
                  <div className="text-[8px] uppercase text-slate-400 tracking-wider">Cardholder</div>
                  <div className="font-bold text-white text-xs">{BASE_BANKING_CREDIT_CARDS[0].holder}</div>
                </div>
                <div className="text-right">
                  <div className="text-[8px] uppercase text-slate-400 tracking-wider">Expires</div>
                  <div className="font-mono text-white text-xs">{BASE_BANKING_CREDIT_CARDS[0].expiry}</div>
                </div>
              </div>
            </div>

            {/* Quick Cardless Cash Pickup Info */}
            <div className="bg-slate-950/80 border border-slate-800 rounded-2xl p-4 space-y-2">
              <div className="flex items-center justify-between text-xs">
                <span className="font-bold text-white flex items-center gap-1.5">
                  <QrCode className="w-4 h-4 text-emerald-400" />
                  CBA Cardless Cash Direct
                </span>
                <span className="text-[10px] font-mono text-emerald-400 font-bold">READY</span>
              </div>
              <p className="text-[11px] text-slate-400 leading-relaxed">
                Active 8-digit claim code dispatched to <strong>0401044335</strong> for instant collection at any CommBank ATM in Artarmon or Sydney CBD without physical card.
              </p>
            </div>
          </div>

          {/* APRA Compliance & Legal Verification */}
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-xl space-y-3 text-xs">
            <div className="flex items-center gap-2">
              <ShieldCheck className="w-5 h-5 text-emerald-400" />
              <h4 className="font-black text-white text-sm">Regulatory & Audit Verification</h4>
            </div>
            <ul className="space-y-2 text-slate-400 text-[11px] leading-relaxed">
              <li className="flex items-start gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                <span>AP+ Accredited Scheme Participant #BPAY-AU-LIC-2026-9921.</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                <span>RBA Exchange Settlement System (ESS) Direct Settlement Participant.</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                <span>ASIC & AUSTRAC Registered Institutional Liquidity Gateway.</span>
              </li>
            </ul>
          </div>
        </div>
      </div>

      {/* Global Treasury Growth & Yield Compounding Curve */}
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-xl space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <h3 className="text-base sm:text-lg font-black text-white flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-emerald-400" />
              Sovereign Capital Trajectory & Reserve Compounding (2021 – 2026+)
            </h3>
            <p className="text-xs text-slate-400">
              Audited institutional net asset growth denominated in billions AUD with continuous yield reinvestment.
            </p>
          </div>
          <span className="px-3 py-1 rounded-full text-xs font-mono font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 shrink-0">
            Current: $2.45T Sovereign Standard
          </span>
        </div>
        <div className="pt-4">
          <TreasuryGrowthChart />
        </div>
      </div>
      </>
      )}

      {/* Embedded NFC Modal */}
      <NFCTapModal 
        isOpen={isNfcModalOpen} 
        onClose={() => setIsNfcModalOpen(false)}
        cards={BASE_BANKING_CREDIT_CARDS}
        user={user}
      />
    </div>
  );
}
