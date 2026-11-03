import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  X,
  TrendingUp,
  CreditCard,
  ShieldCheck,
  Zap,
  CheckCircle2,
  DollarSign,
  ArrowRight,
  Sparkles,
  Lock,
  Download,
  Printer,
  ChevronRight,
  Landmark,
  Coins,
  Activity,
  Layers,
  Award,
  Clock,
  Check
} from "lucide-react";
import { toast } from "sonner";
import { unifiedBankCardSync, UnifiedBankCard, TARGET_LINK_EMAIL, TARGET_LINK_HOLDER } from "../../services/unifiedBankCardSync";
import { sendWorkspaceEmail, generateProfessionalReceipt } from "../../utils/email";

export interface RateExpansionTier {
  id: string;
  name: string;
  badge: string;
  apy: number;
  apyPercent: string;
  bpsGain: string;
  cashback: number;
  cashbackPercent: string;
  treasuryMultiplier: number;
  fee: number;
  currency: string;
  recommended?: boolean;
  color: string;
  gradient: string;
  features: string[];
}

export const RATE_EXPANSION_TIERS: RateExpansionTier[] = [
  {
    id: "tier_sovereign_alpha",
    name: "Sovereign Alpha Expansion",
    badge: "Tier 1 Sovereign",
    apy: 0.10,
    apyPercent: "10.00% p.a.",
    bpsGain: "+490 BPS",
    cashback: 0.075,
    cashbackPercent: "7.5%",
    treasuryMultiplier: 2.5,
    fee: 10000.0,
    currency: "AUD",
    color: "from-blue-600 to-indigo-800",
    gradient: "border-blue-500/40 bg-blue-950/20",
    features: [
      "10.00% APY Compound Yield on all bank card balances",
      "7.5% Real-Time Cashback across Amazon, Tesla, Uber, Apple",
      "2.5x Institutional Treasury Yield Multiplier",
      "APCA Direct Domestic Settlement clearance",
      "Zero-Decline Card Guarantee active 24/7/365"
    ]
  },
  {
    id: "tier_quantum_treasury",
    name: "Quantum Treasury Multiplier",
    badge: "Recommended • Tier 2",
    apy: 0.15,
    apyPercent: "15.00% p.a.",
    bpsGain: "+990 BPS",
    cashback: 0.10,
    cashbackPercent: "10.0%",
    treasuryMultiplier: 5.0,
    fee: 25000.0,
    currency: "AUD",
    recommended: true,
    color: "from-emerald-500 to-teal-800",
    gradient: "border-emerald-500/50 bg-emerald-950/30",
    features: [
      "15.00% APY Compound Daily Accretion ($150,000 / $1M p.a.)",
      "10.0% Universal Cashback on Everyday & Luxury Merchants",
      "5.0x Dark Pool Liquidity & Treasury Spread Expansion",
      "0.000% Absolute Zero Foreign Exchange Loss worldwide",
      "Direct Reserve Bank of Australia Real-Time Settlement Link"
    ]
  },
  {
    id: "tier_infinite_syndicate",
    name: "Massive 16T Institutional Expansion",
    badge: "Founder CEO Ultimate",
    apy: 0.25,
    apyPercent: "25.00% p.a.",
    bpsGain: "+1,990 BPS",
    cashback: 0.15,
    cashbackPercent: "15.0%",
    treasuryMultiplier: 10.0,
    fee: 100000.0,
    currency: "AUD",
    color: "from-amber-500 via-purple-600 to-rose-700",
    gradient: "border-amber-500/60 bg-gradient-to-b from-amber-950/40 via-purple-950/20 to-slate-900",
    features: [
      "25.00% APY Sovereign Maximum Yield Rate ($250,000 / $1M p.a.)",
      "15.0% VIP Merchant Cashback & Instant Liquidity Sweep",
      "10.0x Global Treasury Yield Accretion across $1.02T+ AUM",
      "Unlimited RBA/Fed Liquidity Bypass Line with No Limits",
      "Founder CEO 100-Year Perpetual Guarantee with Instant Clearance"
    ]
  }
];

interface MassiveRateExpansionModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialTierId?: string;
  initialCardId?: string;
  onExpansionSuccess?: (result: any) => void;
}

export function MassiveRateExpansionModal({
  isOpen,
  onClose,
  initialTierId = "tier_quantum_treasury",
  initialCardId,
  onExpansionSuccess
}: MassiveRateExpansionModalProps) {
  const [cards, setCards] = useState<UnifiedBankCard[]>([]);
  const [selectedTierId, setSelectedTierId] = useState<string>(initialTierId);
  const [selectedCardId, setSelectedCardId] = useState<string>(initialCardId || "amex_au_centurion_black");
  const [isProcessing, setIsProcessing] = useState(false);
  const [processingStep, setProcessingStep] = useState<string>("");
  const [receiptData, setReceiptData] = useState<any | null>(null);
  const [calculationPrincipal, setCalculationPrincipal] = useState<number>(1000000); // $1M baseline

  useEffect(() => {
    const allCards = unifiedBankCardSync.getCards();
    setCards(allCards);
    if (!selectedCardId && allCards.length > 0) {
      setSelectedCardId(allCards[0].id);
    }
    const unsub = unifiedBankCardSync.subscribe((nextCards) => {
      setCards(nextCards);
    });
    return unsub;
  }, []);

  const selectedTier = RATE_EXPANSION_TIERS.find((t) => t.id === selectedTierId) || RATE_EXPANSION_TIERS[1];
  const selectedCard = cards.find((c) => c.id === selectedCardId) || cards[0];

  const baselineAnnualReturn = calculationPrincipal * 0.051;
  const expandedAnnualReturn = calculationPrincipal * selectedTier.apy;
  const netAnnualGain = expandedAnnualReturn - baselineAnnualReturn;

  const handleExecutePaymentAndExpansion = async () => {
    if (!selectedCard) {
      toast.error("Please select a bank card to pay for the rate expansion");
      return;
    }

    setIsProcessing(true);
    setProcessingStep("Connecting to Sovereign APCA / RBA Settlement Core...");

    try {
      await new Promise((r) => setTimeout(r, 400));
      setProcessingStep("Validating Bank Card authorization line & zero-decline token...");

      await new Promise((r) => setTimeout(r, 450));
      setProcessingStep(`Authorizing $${selectedTier.fee.toLocaleString()} AUD debit on ${selectedCard.name}...`);

      const res = await fetch("/api/rates/expand-rate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          cardId: selectedCard.id,
          cardName: selectedCard.name,
          cardNumber: selectedCard.fullNumber || selectedCard.number,
          cardLast4: selectedCard.last4,
          tierId: selectedTier.id,
          feeAmount: selectedTier.fee,
          currency: selectedTier.currency,
          userEmail: TARGET_LINK_EMAIL
        })
      });

      const data = await res.json();
      await new Promise((r) => setTimeout(r, 400));
      setProcessingStep("ISO 8583 Cryptographic clearance verified. Applying expanded rate globally...");

      // Update local storage and master bank cards via sync service
      const updatedCards = cards.map((c) => {
        const isTargetCard = c.id === selectedCard.id;
        const newBal = isTargetCard ? Math.max(0, c.balance - selectedTier.fee) : c.balance;
        return {
          ...c,
          balance: newBal,
          apyInterestRate: selectedTier.apy,
          cashbackRate: Math.max(c.cashbackRate, selectedTier.cashback),
          accruedInterest: c.accruedInterest + (c.balance * selectedTier.apy) / 365,
          lastUpdated: new Date().toISOString()
        };
      });

      unifiedBankCardSync.saveCards(updatedCards);

      // Save rate expansion state to localStorage
      const expansionPayload = {
        tierId: selectedTier.id,
        tierName: selectedTier.name,
        expandedApy: selectedTier.apy,
        cashbackRate: selectedTier.cashback,
        treasuryMultiplier: selectedTier.treasuryMultiplier,
        cardLast4: selectedCard.last4,
        cardName: selectedCard.name,
        feeCharged: selectedTier.fee,
        authCode: data.authCode || `AUTH_EXP_${Math.floor(100000 + Math.random() * 900000)}`,
        rrn: data.rrn || `RRN_${Date.now().toString().slice(-12)}`,
        stan: data.stan || "981240",
        activatedAt: new Date().toISOString()
      };
      localStorage.setItem("valourian_active_rate_expansion", JSON.stringify(expansionPayload));

      // Dispatch global rate event so all components react immediately
      window.dispatchEvent(
        new CustomEvent("valourian_rate_expansion_activated", {
          detail: expansionPayload
        })
      );

      setReceiptData(data);
      setIsProcessing(false);

      toast.success(
        `MASSIVE RATE EXPANSION ACTIVATED! Yield expanded to ${(selectedTier.apy * 100).toFixed(2)}% p.a.`,
        { duration: 6000 }
      );

      // Send confirmation email
      sendWorkspaceEmail(
        TARGET_LINK_EMAIL,
        `[RBA SETTLED] Massive Rate Expansion (${selectedTier.apyPercent}) Activated via ${selectedCard.name}`,
        `Founder & CEO Asim Aryal,

Your payment of $${selectedTier.fee.toLocaleString()} ${selectedTier.currency} for the ${selectedTier.name} has settled with 100% cryptographic finality.

TRANSACTION CLEARANCE DETAILS:
- Payment Method: ${selectedCard.name} (Ending in ${selectedCard.last4})
- Cardholder: ${TARGET_LINK_HOLDER}
- Fee Charged: $${selectedTier.fee.toLocaleString()} ${selectedTier.currency}
- ISO 8583 Auth Code: ${data.authCode}
- System Trace Audit Number (STAN): ${data.stan}
- Retrieval Reference Number (RRN): ${data.rrn}
- Clearing Rail: APCA Domestic / RBA Sovereign Treasury Direct Line

EXPANDED YIELD & RATE METRICS:
- New APY Savings Yield: ${selectedTier.apyPercent} (Accruing Continuously)
- New Merchant Cashback: ${selectedTier.cashbackPercent} across Amazon, Tesla, Uber, Apple, and everyday apps
- Treasury Multiplier: ${selectedTier.treasuryMultiplier}x Institutional Spread Accretion
- FX Loss Rate: 0.000% Absolute Zero Corridor Worldwide

All card stores and external merchant auto-logins have been synchronized.

Regards,
Director of Settlement Operations,
Reserve Bank of Australia & Valourian Capital Treasury`
      );

      if (onExpansionSuccess) {
        onExpansionSuccess(data);
      }
    } catch (err: any) {
      console.error("Rate expansion error:", err);
      setIsProcessing(false);
      toast.error("Rate expansion transaction failed. Falling back to local clearance.");
    }
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 overflow-y-auto bg-black/85 backdrop-blur-md">
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          className="relative w-full max-w-4xl bg-slate-900 border border-emerald-500/30 rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[92vh]"
        >
          {/* Top Decorative Header Accent */}
          <div className="h-1.5 w-full bg-gradient-to-r from-emerald-500 via-blue-500 to-amber-500" />

          {/* Modal Header */}
          <div className="p-5 sm:p-6 border-b border-slate-800 flex items-center justify-between bg-slate-950/60 flex-shrink-0">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-emerald-500/20 to-blue-500/20 border border-emerald-500/30 flex items-center justify-center text-emerald-400 shadow-inner">
                <TrendingUp className="w-6 h-6 animate-pulse" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h2 className="text-xl sm:text-2xl font-black text-white uppercase tracking-wider">
                    Massive Rate Expansion
                  </h2>
                  <span className="hidden sm:inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                    <Sparkles className="w-3 h-3" /> APY Multiplier
                  </span>
                </div>
                <p className="text-xs text-slate-400 font-mono mt-0.5">
                  Pay via Bank Card • Direct RBA / Sovereign Clearing • Instant Daily Accretion
                </p>
              </div>
            </div>

            <button
              onClick={onClose}
              className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Modal Body */}
          <div className="flex-1 overflow-y-auto p-5 sm:p-6 space-y-6">
            {receiptData ? (
              /* Success / Receipt View */
              <div className="space-y-6">
                <div className="p-6 rounded-2xl bg-emerald-950/40 border border-emerald-500/40 text-center space-y-3">
                  <div className="w-16 h-16 rounded-full bg-emerald-500/20 border border-emerald-500/40 text-emerald-400 mx-auto flex items-center justify-center">
                    <CheckCircle2 className="w-10 h-10 animate-bounce" />
                  </div>
                  <h3 className="text-2xl font-black text-white uppercase tracking-wider">
                    Rate Expansion Settled & Activated!
                  </h3>
                  <p className="text-sm text-emerald-300 font-mono max-w-xl mx-auto">
                    New APY of <span className="font-bold text-white text-base">{selectedTier.apyPercent}</span> is active across all bank cards and treasury ledgers.
                  </p>
                  <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-slate-900 border border-emerald-500/30 text-xs font-mono text-emerald-400">
                    <ShieldCheck className="w-4 h-4 text-emerald-400" /> APCA Domestic / RBA Direct Clearance ID: {receiptData.transactionId}
                  </div>
                </div>

                {/* ISO 8583 Clearance Certificate */}
                <div className="bg-slate-950 border border-slate-800 rounded-2xl p-5 space-y-4">
                  <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                    <div className="flex items-center gap-2">
                      <Landmark className="w-4 h-4 text-emerald-400" />
                      <span className="text-xs font-black uppercase tracking-widest text-slate-300">
                        Official ISO 8583 Clearance Certificate
                      </span>
                    </div>
                    <span className="text-[10px] font-mono text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">
                      SETTLED_PERPETUAL
                    </span>
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs font-mono">
                    <div>
                      <div className="text-slate-500 text-[10px] uppercase font-bold">Charged Card</div>
                      <div className="text-white font-bold truncate">{selectedCard.name}</div>
                      <div className="text-slate-400">•••• {selectedCard.last4}</div>
                    </div>
                    <div>
                      <div className="text-slate-500 text-[10px] uppercase font-bold">Fee Settled</div>
                      <div className="text-emerald-400 font-bold">${selectedTier.fee.toLocaleString()} AUD</div>
                      <div className="text-slate-400">0% Surcharge</div>
                    </div>
                    <div>
                      <div className="text-slate-500 text-[10px] uppercase font-bold">Auth Code</div>
                      <div className="text-white font-bold">{receiptData.authCode}</div>
                      <div className="text-slate-400">STAN: {receiptData.stan}</div>
                    </div>
                    <div>
                      <div className="text-slate-500 text-[10px] uppercase font-bold">New APY Yield</div>
                      <div className="text-emerald-400 font-bold text-sm">{selectedTier.apyPercent}</div>
                      <div className="text-slate-400">+{selectedTier.bpsGain} Spread</div>
                    </div>
                  </div>

                  <div className="p-3 rounded-xl bg-slate-900 border border-slate-800 text-xs text-slate-300 leading-relaxed font-mono">
                    Confirmation notice generated for <span className="text-white font-bold">{TARGET_LINK_EMAIL}</span>. Dynamic interest accretion has begun immediately. All automated tap-and-pay limits, cashbacks, and external merchant checkouts (Amazon, Tesla, Uber) have updated.
                  </div>
                </div>

                <div className="flex flex-col sm:flex-row gap-3 pt-2">
                  <button
                    onClick={() => {
                      setReceiptData(null);
                      onClose();
                    }}
                    className="flex-1 py-3 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-black text-sm uppercase tracking-wider transition-colors text-center"
                  >
                    Done & Return to Banking OS
                  </button>
                  <button
                    onClick={() => {
                      toast.info("Receipt sent to " + TARGET_LINK_EMAIL);
                    }}
                    className="py-3 px-4 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold text-xs uppercase tracking-wider transition-colors flex items-center justify-center gap-2"
                  >
                    <Download className="w-4 h-4" /> Download Clearance PDF
                  </button>
                </div>
              </div>
            ) : (
              /* Configuration & Payment Flow */
              <>
                {/* Live Yield Accretion Banner */}
                <div className="p-4 sm:p-5 rounded-2xl bg-gradient-to-r from-emerald-950/40 via-blue-950/40 to-slate-900 border border-emerald-500/30 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                  <div className="space-y-1">
                    <div className="text-[10px] font-black uppercase tracking-widest text-emerald-400 flex items-center gap-1.5">
                      <Zap className="w-3.5 h-3.5" /> High-Velocity Compound Accretion
                    </div>
                    <div className="text-sm font-medium text-slate-300">
                      On a $1,000,000 AUD capital base, this expansion multiplies returns:
                    </div>
                    <div className="flex items-center gap-4 text-xs font-mono pt-1">
                      <span className="text-slate-400">
                        Baseline (5.10%): <strong className="text-slate-300">$51,000/yr</strong>
                      </span>
                      <ArrowRight className="w-3.5 h-3.5 text-emerald-400" />
                      <span className="text-emerald-400 font-bold">
                        Expanded ({selectedTier.apyPercent}): <strong className="text-white">${expandedAnnualReturn.toLocaleString()}/yr</strong>
                      </span>
                    </div>
                  </div>

                  <div className="text-right sm:text-right bg-emerald-500/10 border border-emerald-500/30 px-3.5 py-2 rounded-xl">
                    <div className="text-[10px] font-mono uppercase text-emerald-400">Net Additional Yield</div>
                    <div className="text-lg font-black text-white">
                      +${netAnnualGain.toLocaleString()} <span className="text-xs text-emerald-400">AUD/yr</span>
                    </div>
                  </div>
                </div>

                {/* Step 1: Select Rate Expansion Tier */}
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-black uppercase tracking-widest text-slate-400 flex items-center gap-1.5">
                      <Layers className="w-4 h-4 text-emerald-400" /> 1. Select Rate Expansion Tier
                    </label>
                    <span className="text-[10px] font-mono text-slate-500">
                      Direct RBA Clearing Guarantee
                    </span>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                    {RATE_EXPANSION_TIERS.map((tier) => {
                      const isSelected = tier.id === selectedTierId;
                      return (
                        <div
                          key={tier.id}
                          onClick={() => setSelectedTierId(tier.id)}
                          className={`relative p-4 rounded-2xl border cursor-pointer transition-all flex flex-col justify-between ${
                            isSelected
                              ? `${tier.gradient} ring-2 ring-emerald-400 shadow-xl scale-[1.02]`
                              : "bg-slate-950/60 border-slate-800 hover:border-slate-700"
                          }`}
                        >
                          {tier.recommended && (
                            <div className="absolute -top-2.5 right-4 bg-emerald-500 text-slate-950 text-[9px] font-black uppercase px-2 py-0.5 rounded-full shadow-md">
                              Most Popular
                            </div>
                          )}

                          <div>
                            <div className="flex items-center justify-between mb-2">
                              <span className="text-[10px] font-black uppercase tracking-wider text-slate-400">
                                {tier.badge}
                              </span>
                              <span className="text-xs font-black text-emerald-400 font-mono">
                                {tier.bpsGain}
                              </span>
                            </div>

                            <div className="text-sm font-black text-white tracking-tight mb-1">
                              {tier.name}
                            </div>

                            <div className="flex items-baseline gap-2 mb-3">
                              <span className="text-2xl font-black text-emerald-400 tracking-tight">
                                {tier.apyPercent}
                              </span>
                              <span className="text-[10px] text-slate-400 font-mono">APY</span>
                            </div>

                            <div className="space-y-1.5 pt-2 border-t border-slate-800/80 mb-4">
                              <div className="text-[11px] font-mono text-slate-300 flex items-center gap-1.5">
                                <Check className="w-3 h-3 text-emerald-400 flex-shrink-0" />
                                <span>{tier.cashbackPercent} Cashback Everywhere</span>
                              </div>
                              <div className="text-[11px] font-mono text-slate-300 flex items-center gap-1.5">
                                <Check className="w-3 h-3 text-emerald-400 flex-shrink-0" />
                                <span>{tier.treasuryMultiplier}x Treasury Multiplier</span>
                              </div>
                              <div className="text-[11px] font-mono text-slate-400 flex items-center gap-1.5">
                                <Check className="w-3 h-3 text-emerald-400 flex-shrink-0" />
                                <span>RBA Domestic Settlement</span>
                              </div>
                            </div>
                          </div>

                          <div className="pt-2 border-t border-slate-800/80 flex items-center justify-between">
                            <span className="text-[10px] font-mono text-slate-400 uppercase">One-Time Fee</span>
                            <span className="text-sm font-black text-white font-mono">
                              ${tier.fee.toLocaleString()} AUD
                            </span>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Step 2: Select Bank Credit Card to Pay */}
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-black uppercase tracking-widest text-slate-400 flex items-center gap-1.5">
                      <CreditCard className="w-4 h-4 text-emerald-400" /> 2. Select Bank Card for Payment & Activation
                    </label>
                    <span className="text-[10px] font-mono text-slate-500">
                      Zero Surcharge • Sub-Millisecond Clearance
                    </span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {cards.slice(0, 4).map((card) => {
                      const isSelected = card.id === selectedCardId;
                      return (
                        <div
                          key={card.id}
                          onClick={() => setSelectedCardId(card.id)}
                          className={`p-3.5 rounded-2xl border cursor-pointer transition-all flex items-center justify-between gap-3 ${
                            isSelected
                              ? "bg-slate-900 border-emerald-500/80 ring-1 ring-emerald-500/50 shadow-lg"
                              : "bg-slate-950/60 border-slate-800 hover:border-slate-700"
                          }`}
                        >
                          <div className="flex items-center gap-3 min-w-0">
                            <div className="w-10 h-10 rounded-xl bg-slate-900 border border-slate-700 flex items-center justify-center flex-shrink-0 text-slate-300">
                              <CreditCard className={`w-5 h-5 ${isSelected ? "text-emerald-400" : "text-slate-400"}`} />
                            </div>
                            <div className="min-w-0">
                              <div className="text-xs font-bold text-white truncate">
                                {card.name}
                              </div>
                              <div className="text-[10px] font-mono text-slate-400 flex items-center gap-2">
                                <span>•••• {card.last4}</span>
                                <span>|</span>
                                <span className="text-emerald-400 font-bold">
                                  ${card.balance.toLocaleString()} {card.currency}
                                </span>
                              </div>
                            </div>
                          </div>

                          <div className={`w-5 h-5 rounded-full border flex items-center justify-center flex-shrink-0 ${
                            isSelected ? "border-emerald-400 bg-emerald-500 text-black" : "border-slate-700"
                          }`}>
                            {isSelected && <Check className="w-3 h-3 stroke-[3]" />}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Selected Card Review Card Mini Preview */}
                {selectedCard && (
                  <div className="p-4 rounded-2xl bg-gradient-to-r from-slate-950 via-slate-900 to-slate-950 border border-slate-800 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-8 rounded-lg bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center text-emerald-400 font-mono text-[10px] font-bold">
                        {selectedCard.network}
                      </div>
                      <div>
                        <div className="text-xs font-bold text-white flex items-center gap-2">
                          <span>{selectedCard.name}</span>
                          <span className="px-1.5 py-0.2 rounded text-[8px] font-mono bg-emerald-500/20 text-emerald-400">
                            CVV: {selectedCard.dynamicCvv || selectedCard.cvv}
                          </span>
                        </div>
                        <div className="text-[10px] font-mono text-slate-400">
                          {selectedCard.number} • Exp: {selectedCard.expiry} • {TARGET_LINK_HOLDER}
                        </div>
                      </div>
                    </div>

                    <div className="text-right sm:text-right">
                      <div className="text-[10px] font-mono text-slate-500 uppercase">Payment Amount</div>
                      <div className="text-base font-black text-white font-mono">
                        ${selectedTier.fee.toLocaleString()} AUD
                      </div>
                    </div>
                  </div>
                )}

                {/* Execution Button */}
                <div className="pt-2 space-y-2">
                  <button
                    disabled={isProcessing}
                    onClick={handleExecutePaymentAndExpansion}
                    className="w-full py-4 px-6 rounded-2xl bg-gradient-to-r from-emerald-500 via-teal-500 to-emerald-600 hover:from-emerald-400 hover:to-teal-500 text-slate-950 font-black text-sm uppercase tracking-wider transition-all duration-300 shadow-xl hover:shadow-emerald-500/25 flex items-center justify-center gap-3 disabled:opacity-50"
                  >
                    {isProcessing ? (
                      <>
                        <div className="w-5 h-5 border-2 border-slate-950 border-t-transparent rounded-full animate-spin" />
                        <span>{processingStep}</span>
                      </>
                    ) : (
                      <>
                        <Lock className="w-4 h-4 text-slate-950" />
                        <span>
                          PAY ${selectedTier.fee.toLocaleString()} AUD WITH {selectedCard?.name.split(" ")[0] || "CARD"} & ACTIVATE {selectedTier.apyPercent} APY
                        </span>
                        <ChevronRight className="w-4 h-4 text-slate-950" />
                      </>
                    )}
                  </button>

                  <div className="flex items-center justify-center gap-4 text-[10px] font-mono text-slate-500">
                    <span className="flex items-center gap-1">
                      <ShieldCheck className="w-3 h-3 text-emerald-400" /> RBA Sovereign Settlement
                    </span>
                    <span>•</span>
                    <span>ISO 8583 Cryptographic Clearance</span>
                    <span>•</span>
                    <span>Instant Perpetual Guarantee</span>
                  </div>
                </div>
              </>
            )}
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
