import React, { useState, useEffect } from "react";
import {
  X,
  Sparkles,
  Plane,
  Crown,
  ShieldCheck,
  Send,
  Zap,
  DollarSign,
  QrCode,
  TrendingUp,
  Globe,
  Shield,
  Ticket,
  CheckCircle2,
  Copy,
  RefreshCw,
} from "lucide-react";
import { QRCodeSVG } from "qrcode.react";
import { collection, addDoc } from "firebase/firestore";
import { auth, db, handleFirestoreError, OperationType } from "../../firebase";
import { unifiedBankCardSync, UnifiedBankCard } from "../../services/unifiedBankCardSync";
import { smsEmailDispatchService, USER_EMAIL, USER_NAME } from "../../services/smsEmailDispatchService";
import toast from "react-hot-toast";

interface CardBenefitsShowcaseModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialTab?: "cashback" | "aviation" | "concierge" | "lounge" | "immense";
}

interface PrivateJetOption {
  model: string;
  manufacturer: string;
  range: string;
  speed: string;
  capacity: string;
  priceAUD: number;
  tag: string;
}

interface ConciergeDirective {
  id: string;
  category: string;
  notes: string;
  createdAt: string;
  status: string;
  desk: string;
}

interface ProtectionClaim {
  id: string;
  merchant: string;
  amountAUD: number;
  reason: string;
  status: string;
  submittedAt: string;
}

interface BenefitVoucher {
  code: string;
  title: string;
  amountAUD: number;
  storeScope: string;
  issuedAt: string;
}

const PRIVATE_JETS: PrivateJetOption[] = [
  {
    model: "Gulfstream G700",
    manufacturer: "Gulfstream Aerospace",
    range: "7,750 nm (Non-stop SYD to LAX/JFK)",
    speed: "Mach 0.925",
    capacity: "19 VIP Passengers · Master Stateroom",
    priceAUD: 95000,
    tag: "ULTRA-LONG RANGE",
  },
  {
    model: "Bombardier Global 7500",
    manufacturer: "Bombardier Aviation",
    range: "7,700 nm (Non-stop SYD to LHR)",
    speed: "Mach 0.90",
    capacity: "16 VIP Passengers · Dedicated Crew Rest",
    priceAUD: 120000,
    tag: "FLAGSHIP CABIN",
  },
  {
    model: "Dassault Falcon 10X",
    manufacturer: "Dassault Aviation",
    range: "7,500 nm (Penthouse of the Skies)",
    speed: "Mach 0.925",
    capacity: "14 VIP Passengers · En-suite Shower",
    priceAUD: 85000,
    tag: "RAPID STANDBY",
  },
];

const LOUNGE_LOCATIONS = [
  { id: "syd-t1", label: "Sydney Kingsford Smith (SYD T1 · Qantas First & Centurion)" },
  { id: "lhr-t5", label: "London Heathrow (LHR T5 · Concorde Room & Centurion)" },
  { id: "jfk-t4", label: "New York JFK (Terminal 4 · Flagship Centurion Suite)" },
  { id: "sin-t3", label: "Singapore Changi (SIN T3 · The Private Room)" },
  { id: "dxb-conA", label: "Dubai International (DXB · Emirates First Concourse A)" },
];

const FX_CURRENCIES = [
  { code: "USD", label: "USD · US Dollar" },
  { code: "EUR", label: "EUR · Eurozone" },
  { code: "GBP", label: "GBP · British Pound" },
  { code: "CHF", label: "CHF · Swiss Franc" },
  { code: "JPY", label: "JPY · Japanese Yen" },
  { code: "SGD", label: "SGD · Singapore Dollar" },
  { code: "AED", label: "AED · UAE Dirham" },
];

const DIRECTIVES_KEY = "valourian_concierge_directives";
const CLAIMS_KEY = "valourian_protection_claims";
const VOUCHERS_KEY = "valourian_benefit_vouchers";

export const CardBenefitsShowcaseModal: React.FC<CardBenefitsShowcaseModalProps> = ({
  isOpen,
  onClose,
  initialTab = "cashback",
}) => {
  const [activeTab, setActiveTab] = useState<"cashback" | "aviation" | "concierge" | "lounge" | "immense">(initialTab);
  const [cards, setCards] = useState<UnifiedBankCard[]>([]);
  const [selectedCardId, setSelectedCardId] = useState<string>("");
  const [selectedJet, setSelectedJet] = useState<PrivateJetOption>(PRIVATE_JETS[0]);
  const [flightRoute, setFlightRoute] = useState("Sydney (SYD) → New York (JFK)");
  const [flightDate, setFlightDate] = useState("Tomorrow · Immediate Standby VIP Departure");
  const [isBookingFlight, setIsBookingFlight] = useState(false);

  // Cashback & Yield interactive tools
  const [projectedMonthlySpend, setProjectedMonthlySpend] = useState<number>(250000);
  const [projectedTreasuryReserve, setProjectedTreasuryReserve] = useState<number>(2500000);
  const [redeemPointsCardId, setRedeemPointsCardId] = useState<string>("");

  // Concierge state
  const [conciergeCategory, setConciergeCategory] = useState("Rare Horology Allocation");
  const [conciergeNotes, setConciergeNotes] = useState(
    "Acquisition of Patek Philippe Grandmaster Chime 6300G through Geneva salon with diplomatic pouch delivery to 712/15 Barton Rd Artarmon NSW."
  );
  const [isDispatchingConcierge, setIsDispatchingConcierge] = useState(false);
  const [directives, setDirectives] = useState<ConciergeDirective[]>(() => {
    try {
      const saved = localStorage.getItem(DIRECTIVES_KEY);
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  // Lounge state
  const [selectedLounge, setSelectedLounge] = useState(LOUNGE_LOCATIONS[0].id);
  const [guestCount, setGuestCount] = useState<number>(2);
  const [gatePassActivatedAt, setGatePassActivatedAt] = useState<string | null>(null);

  // Immense FX & Purchase Protection state
  const [fxAmountAUD, setFxAmountAUD] = useState<number>(25000);
  const [targetFxCurrency, setTargetFxCurrency] = useState<string>("USD");
  const [claimReason, setClaimReason] = useState<string>("Price Drop Protection (90-Day Guarantee)");
  const [claimMerchant, setClaimMerchant] = useState<string>("Apple Sydney Flagship");
  const [claimAmountAUD, setClaimAmountAUD] = useState<string>("4500");
  const [claims, setClaims] = useState<ProtectionClaim[]>(() => {
    try {
      const saved = localStorage.getItem(CLAIMS_KEY);
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });
  const [issuedVouchers, setIssuedVouchers] = useState<BenefitVoucher[]>(() => {
    try {
      const saved = localStorage.getItem(VOUCHERS_KEY);
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  const [tokenPool, setTokenPool] = useState(unifiedBankCardSync.getTokenPool());

  useEffect(() => {
    setActiveTab(initialTab);
  }, [initialTab]);

  useEffect(() => {
    const loaded = unifiedBankCardSync.getCards();
    setCards(loaded);
    const activeId = unifiedBankCardSync.getActivePaymentCardId();
    setSelectedCardId(activeId);
    setRedeemPointsCardId((prev) => prev || activeId || loaded[0]?.id || "");
    setTokenPool(unifiedBankCardSync.getTokenPool());

    const unsubscribe = unifiedBankCardSync.subscribe((nextCards) => {
      setCards(nextCards);
    });

    const handleTokensRefilled = (e: any) => {
      if (e.detail) setTokenPool(e.detail);
    };
    window.addEventListener("valourian_tokens_refilled", handleTokensRefilled);

    return () => {
      unsubscribe();
      window.removeEventListener("valourian_tokens_refilled", handleTokensRefilled);
    };
  }, [isOpen]);

  if (!isOpen) return null;

  const currentCard = cards.find((c) => c.id === selectedCardId) || cards[0];
  const pointsCard = cards.find((c) => c.id === redeemPointsCardId) || currentCard;
  const totalCashback = cards.reduce((acc, c) => acc + (c.accumulatedCashback || 0), 0);
  const totalInterest = cards.reduce((acc, c) => acc + (c.accruedInterest || 0), 0);
  const totalPoints = cards.reduce((acc, c) => acc + (c.rewardsPoints || 0), 0);
  const totalPointsValueAUD = totalPoints * 0.01;
  const combinedUnclaimedValue = totalCashback + totalInterest + totalPointsValueAUD;

  const annualCashbackProjection = projectedMonthlySpend * 12 * 0.05;
  const annualApyProjection = projectedTreasuryReserve * 0.051;
  const fxSavingsAUD = fxAmountAUD * 0.03;

  const saveVoucherBenefit = async (voucher: BenefitVoucher) => {
    setIssuedVouchers((prev) => {
      const next = [voucher, ...prev.filter((v) => v.code !== voucher.code)].slice(0, 12);
      try {
        localStorage.setItem(VOUCHERS_KEY, JSON.stringify(next));
        window.dispatchEvent(new CustomEvent("valourian_vouchers_updated", { detail: { voucher } }));
      } catch {}
      return next;
    });

    const cu = auth.currentUser;
    if (cu?.uid && cu.uid !== "ceo-founder-override" && (!cu.email || cu.emailVerified)) {
      try {
        await addDoc(collection(db, "vouchers"), {
          code: voucher.code,
          amount: voucher.amountAUD,
          userId: cu.uid,
          title: voucher.title,
          storeScope: voucher.storeScope,
          claimed: false,
          createdAt: new Date().toISOString(),
        });
      } catch (err) {
        handleFirestoreError(err, OperationType.CREATE, "vouchers");
      }
    }
  };

  const handleCopyCode = (code: string) => {
    try {
      navigator.clipboard?.writeText(code);
    } catch {}
    toast.success(`Voucher code ${code} copied to clipboard.`);
  };

  const handleSweepAllYield = () => {
    let sweptCashback = 0;
    let sweptInterest = 0;
    cards.forEach((c) => {
      const res = unifiedBankCardSync.claimAllCardValue(c.id);
      sweptCashback += res.cashback;
      sweptInterest += res.interest;
    });
    const totalSwept = sweptCashback + sweptInterest;
    if (totalSwept > 0) {
      toast.success(
        `Swept $${totalSwept.toLocaleString("en-AU", { minimumFractionDigits: 2 })} AUD ($${sweptCashback.toLocaleString("en-AU", { minimumFractionDigits: 2 })} cashback + $${sweptInterest.toLocaleString("en-AU", { minimumFractionDigits: 2 })} APY interest) into liquid card balances.`
      );
    } else {
      toast("All cashback and accrued interest have already been swept into your liquid balances.");
    }
  };

  const handleClaimSingleCard = (cardId: string, cardName: string) => {
    const res = unifiedBankCardSync.claimAllCardValue(cardId);
    if (res.totalClaimed > 0) {
      toast.success(
        `Credited $${res.totalClaimed.toLocaleString("en-AU", { minimumFractionDigits: 2 })} AUD onto ${cardName}.`
      );
    } else {
      toast(`No pending yield on ${cardName}.`);
    }
  };

  const handleRedeemPoints = (pointsToRedeem: number) => {
    if (!pointsCard) return;
    if (pointsToRedeem <= 0 || pointsCard.rewardsPoints < pointsToRedeem) {
      toast.error("Insufficient points available on the selected card.");
      return;
    }
    const result = unifiedBankCardSync.redeemRewardsPoints(pointsCard.id, pointsToRedeem);
    if (result.creditAmount > 0) {
      toast.success(
        `Redeemed ${result.redeemedPoints.toLocaleString()} pts for +$${result.creditAmount.toLocaleString("en-AU", { minimumFractionDigits: 2 })} AUD cash balance on •••• ${pointsCard.last4}.`
      );
    }
  };

  const handleRefillTokens = () => {
    const updated = unifiedBankCardSync.refillAllTokens();
    setTokenPool(updated);
    toast.success("1,000,000,000,000 Usable Tokens refilled and immediately available.");
  };

  const handleBookPrivateJet = async () => {
    if (!currentCard) return;
    setIsBookingFlight(true);

    setTimeout(async () => {
      try {
        const result = unifiedBankCardSync.spendFromCard(currentCard.id, {
          merchantName: `Valourian Executive Aviation (${selectedJet.model})`,
          merchantLocation: "Sydney Jet Base VIP FBO, Mascot NSW",
          region: "AUS",
          foreignAmount: selectedJet.priceAUD,
          foreignCurrency: "AUD",
          category: "Private Jet Fleet Charter",
        });

        setIsBookingFlight(false);
        if (!result.success) {
          toast.error(result.declinedReason || "Card authorization declined. Check card freeze, merchant locks, or spend cap.");
          return;
        }

        await smsEmailDispatchService.dispatchAssetPickupPass({
          title: `Private Jet Charter: ${selectedJet.model}`,
          subtitle: `Route: ${flightRoute} · Departure: ${flightDate}`,
          addressOrLocation: "Sydney Jet Base VIP Terminal, Airport Dr, Mascot NSW 2020",
          trackingId: `JET-${Date.now().toString(36).toUpperCase()}`,
          releasePin: "8842",
          cryptographicToken: result.transaction.arqcToken,
          handoverLead: {
            name: "Captain Julian Vance (Chief Pilot)",
            organization: "Valourian Sovereign Aviation Division",
            phone: "+61 401 044 335",
            email: "aviation@valourian.com",
            address: "Hangar 44, Sydney Kingsford Smith Airport",
          },
          keyDetails: [
            `Aircraft: ${selectedJet.model} (${selectedJet.manufacturer})`,
            `Cruising Speed: ${selectedJet.speed} | Range: ${selectedJet.range}`,
            `VIP Configuration: ${selectedJet.capacity}`,
            `Settlement Status: 100% Paid ($${selectedJet.priceAUD.toLocaleString()} AUD via Card •••• ${currentCard.last4})`,
            `Cashback Credited: +$${result.cashbackEarned.toLocaleString()} AUD`,
            `In-Flight Catering: Bespoke Menu & Reserve Cellar`,
          ],
        });

        toast.success(
          `Private Jet Confirmed! Boarding PIN 8842 dispatched to ${USER_EMAIL}. Earned +$${result.cashbackEarned.toLocaleString()} AUD cashback.`
        );
      } catch (err: any) {
        setIsBookingFlight(false);
        toast.error(`Booking error: ${err.message}`);
      }
    }, 450);
  };

  const handleIssueChauffeurCredit = async () => {
    const voucher: BenefitVoucher = {
      code: `VAL-AIR-500-${Math.floor(1000 + Math.random() * 9000)}`,
      title: "$500 AUD Complimentary Airport Chauffeur Credit",
      amountAUD: 500,
      storeScope: "UberApp Executive Transfer",
      issuedAt: new Date().toISOString(),
    };
    await saveVoucherBenefit(voucher);
    toast.success(`Issued ${voucher.code} ($500 AUD Chauffeur Credit for UberApp).`);
  };

  const handleDispatchConcierge = async () => {
    setIsDispatchingConcierge(true);
    const nextDirective: ConciergeDirective = {
      id: `CON-${Date.now().toString(36).toUpperCase()}`,
      category: conciergeCategory,
      notes: conciergeNotes.trim() || "Executive priority allocation request",
      createdAt: new Date().toISOString(),
      status: "ASSIGNED · PRIORITY DESK",
      desk: "Geneva & Sydney VIP Desk",
    };

    const cu = auth.currentUser;
    if (cu?.uid && (!cu.email || cu.emailVerified)) {
      try {
        await addDoc(collection(db, "luxury_concierge_bookings"), {
          userId: cu.uid,
          category: nextDirective.category,
          notes: nextDirective.notes,
          status: nextDirective.status,
          desk: nextDirective.desk,
          createdAt: nextDirective.createdAt,
        });
      } catch (err) {
        handleFirestoreError(err, OperationType.CREATE, "luxury_concierge_bookings");
      }
    }

    setDirectives((prev) => {
      const updated = [nextDirective, ...prev].slice(0, 10);
      try {
        localStorage.setItem(DIRECTIVES_KEY, JSON.stringify(updated));
      } catch {}
      return updated;
    });
    setIsDispatchingConcierge(false);
    toast.success(
      `VIP Concierge Directive ${nextDirective.id} assigned for ${conciergeCategory}.`
    );
  };

  const handleIssueSuiteCredit = async () => {
    const voucher: BenefitVoucher = {
      code: `VAL-SUITE-1500-${Math.floor(1000 + Math.random() * 9000)}`,
      title: "$1,500 AUD Complimentary Hotel & Suite Upgrade Credit",
      amountAUD: 1500,
      storeScope: "BookingApp Luxury Stays",
      issuedAt: new Date().toISOString(),
    };
    await saveVoucherBenefit(voucher);
    toast.success(`Issued ${voucher.code} ($1,500 AUD Suite Upgrade Credit for Booking.com).`);
  };

  const handleIssueDiningCredit = async () => {
    const voucher: BenefitVoucher = {
      code: `VAL-DINING-150-${Math.floor(1000 + Math.random() * 9000)}`,
      title: "$150 AUD Complimentary Airport & Fine Dining Credit",
      amountAUD: 150,
      storeScope: "UberEatsApp Dining",
      issuedAt: new Date().toISOString(),
    };
    await saveVoucherBenefit(voucher);
    toast.success(`Issued ${voucher.code} ($150 AUD Dining Credit for Uber Eats).`);
  };

  const handleSwitchCardCurrency = () => {
    if (!currentCard) return;
    const ok = unifiedBankCardSync.switchCardCurrency(currentCard.id, targetFxCurrency);
    if (ok) {
      toast.success(
        `Card •••• ${currentCard.last4} switched to ${targetFxCurrency} at 0.00% FX interbank rate (saving $${fxSavingsAUD.toLocaleString("en-AU", { minimumFractionDigits: 2 })} AUD vs 3% retail markup).`
      );
    }
  };

  const handleSubmitProtectionClaim = () => {
    const amt = parseFloat(claimAmountAUD) || 0;
    if (amt <= 0 || !claimMerchant.trim()) {
      toast.error("Enter a valid merchant name and claim amount.");
      return;
    }
    const newClaim: ProtectionClaim = {
      id: `PP-${Date.now().toString(36).toUpperCase()}`,
      merchant: claimMerchant.trim(),
      amountAUD: amt,
      reason: claimReason,
      status: "APPROVED · $0 EXCESS",
      submittedAt: new Date().toISOString(),
    };
    setClaims((prev) => {
      const next = [newClaim, ...prev].slice(0, 10);
      try {
        localStorage.setItem(CLAIMS_KEY, JSON.stringify(next));
      } catch {}
      return next;
    });
    toast.success(
      `Protection Claim ${newClaim.id} approved with $0.00 excess for $${amt.toLocaleString("en-AU", { minimumFractionDigits: 2 })} AUD.`
    );
  };

  const handleRestoreAllImmenseValues = () => {
    unifiedBankCardSync.restoreAllCardsToImmenseValues();
    toast.success(
      "SOVEREIGN EXPANSION APPLIED: All cards upgraded to unmetered multi-billion limits with zero-decline guarantee."
    );
  };

  const activeLoungeLabel = LOUNGE_LOCATIONS.find((l) => l.id === selectedLounge)?.label || LOUNGE_LOCATIONS[0].label;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 backdrop-blur-md p-2 sm:p-6 overflow-y-auto">
      <div className="bg-slate-950 border border-slate-800 rounded-3xl w-full max-w-5xl text-slate-100 shadow-2xl relative overflow-hidden my-auto max-h-[94vh] flex flex-col">
        {/* Header */}
        <div className="p-4 sm:p-6 border-b border-slate-800 flex items-center justify-between gap-3 bg-slate-900/80 sticky top-0 z-20">
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-10 h-10 rounded-2xl bg-amber-500/15 border border-amber-500/30 flex items-center justify-center text-amber-400 shrink-0">
              <Crown className="w-5 h-5" />
            </div>
            <div className="min-w-0">
              <div className="flex flex-wrap items-center gap-2">
                <h2 className="text-base sm:text-xl font-black text-white tracking-tight truncate">
                  Elite Benefits & Immense Value Matrix
                </h2>
                <span className="text-[10px] font-mono text-amber-300 border border-amber-500/30 px-2 py-0.5 rounded-md bg-amber-500/10 shrink-0">
                  TIER 1 SOVEREIGN
                </span>
              </div>
              <p className="text-xs text-slate-400 truncate">
                5% Cashback, 5.10% APY, Aviation Charter, 24/7 Concierge, Centurion Lounges & 0% FX
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close Benefits Matrix"
            className="min-h-[44px] min-w-[44px] flex items-center justify-center rounded-xl text-slate-300 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer shrink-0"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Navigation Tabs */}
        <div className="flex items-center gap-1.5 p-3 px-4 sm:px-6 bg-slate-900/50 border-b border-slate-800/80 overflow-x-auto">
          {[
            { id: "cashback", label: "5% Cashback & APY", icon: Sparkles },
            { id: "aviation", label: "Private Aviation", icon: Plane },
            { id: "concierge", label: "24/7 Concierge", icon: Crown },
            { id: "lounge", label: "Centurion Lounge", icon: QrCode },
            { id: "immense", label: "0% FX & Protection", icon: Shield },
          ].map((tab) => {
            const Icon = tab.icon;
            const isSel = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActiveTab(tab.id as any)}
                className={`min-h-[44px] px-3.5 py-2 rounded-xl text-xs font-bold whitespace-nowrap flex items-center gap-2 transition-all cursor-pointer ${
                  isSel
                    ? "bg-amber-500 text-slate-950 font-black"
                    : "text-slate-300 hover:text-white hover:bg-slate-800"
                }`}
              >
                <Icon className={`w-4 h-4 ${isSel ? "text-slate-950" : "text-amber-400"}`} />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>

        {/* Tab Content Viewport */}
        <div className="p-4 sm:p-6 overflow-y-auto space-y-6 flex-1">
          {/* 1. 5% Uncapped Cashback & 5.10% APY Yield */}
          {activeTab === "cashback" && (
            <div className="space-y-6">
              <div className="bg-slate-900 border border-emerald-500/30 rounded-3xl p-5 sm:p-6">
                <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6">
                  <div>
                    <span className="text-[11px] font-mono uppercase tracking-wider text-emerald-400 font-bold block mb-1">
                      Combined Unclaimed Yield & Points Power
                    </span>
                    <h3 className="text-3xl sm:text-4xl font-black text-white tracking-tight tabular-nums">
                      ${combinedUnclaimedValue.toLocaleString("en-AU", { minimumFractionDigits: 2 })}{" "}
                      <span className="text-base sm:text-lg text-emerald-400 font-semibold">AUD</span>
                    </h3>
                    <div className="flex flex-wrap gap-x-5 gap-y-1 mt-2 text-xs font-mono text-slate-300 tabular-nums">
                      <span>5% Cashback: <strong className="text-emerald-400">${totalCashback.toLocaleString("en-AU", { minimumFractionDigits: 2 })}</strong></span>
                      <span>5.10% APY Accrued: <strong className="text-sky-400">${totalInterest.toLocaleString("en-AU", { minimumFractionDigits: 2 })}</strong></span>
                      <span>Points Reserve: <strong className="text-amber-400">{totalPoints.toLocaleString()} pts (${totalPointsValueAUD.toLocaleString("en-AU", { minimumFractionDigits: 2 })})</strong></span>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={handleSweepAllYield}
                    className="min-h-[48px] px-6 py-3 rounded-2xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black text-xs uppercase tracking-wider flex items-center gap-2 transition-all cursor-pointer shrink-0 w-full lg:w-auto justify-center"
                  >
                    <DollarSign className="w-4 h-4" />
                    <span>Sweep All Cashback + APY Interest</span>
                  </button>
                </div>
              </div>

              {/* Per-Card Rewards & 1-Click Claim */}
              <div>
                <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">
                  Live Yield by Card (1-Click Balance Sweep)
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                  {cards.map((c) => {
                    const cardYield = (c.accumulatedCashback || 0) + (c.accruedInterest || 0);
                    return (
                      <div
                        key={c.id}
                        className="p-4 rounded-2xl bg-slate-900 border border-slate-800 flex flex-col justify-between gap-3"
                      >
                        <div>
                          <div className="flex justify-between items-center text-xs font-mono text-slate-400 mb-1">
                            <span>{c.network}</span>
                            <span className="text-emerald-400">•••• {c.last4}</span>
                          </div>
                          <div className="font-bold text-white text-xs truncate mb-2">
                            {c.name}
                          </div>
                          <div className="space-y-1 text-[11px] font-mono tabular-nums">
                            <div className="flex justify-between text-slate-400">
                              <span>Cashback (5%)</span>
                              <span className="text-emerald-400 font-bold">+${(c.accumulatedCashback || 0).toLocaleString("en-AU", { minimumFractionDigits: 2 })}</span>
                            </div>
                            <div className="flex justify-between text-slate-400">
                              <span>APY Interest (5.10%)</span>
                              <span className="text-sky-400 font-bold">+${(c.accruedInterest || 0).toLocaleString("en-AU", { minimumFractionDigits: 2 })}</span>
                            </div>
                            <div className="flex justify-between text-slate-400">
                              <span>Points</span>
                              <span className="text-amber-400 font-bold">{(c.rewardsPoints || 0).toLocaleString()} pts</span>
                            </div>
                          </div>
                        </div>

                        <button
                          type="button"
                          onClick={() => handleClaimSingleCard(c.id, c.name)}
                          disabled={cardYield <= 0}
                          className="min-h-[40px] w-full rounded-xl bg-slate-800 hover:bg-emerald-500 hover:text-slate-950 disabled:opacity-40 text-emerald-300 font-bold text-xs transition-colors cursor-pointer"
                        >
                          {cardYield > 0 ? `Claim $${cardYield.toLocaleString("en-AU", { minimumFractionDigits: 2 })}` : "Settled"}
                        </button>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Points-to-Balance Redeemer & Annual Value Projector */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 space-y-4">
                  <div className="flex items-center justify-between gap-2">
                    <h4 className="text-sm font-black text-white">Instant Points-to-Cash Redeemer</h4>
                    <span className="text-[11px] font-mono text-amber-400">100 pts = $1.00 AUD</span>
                  </div>
                  <select
                    value={pointsCard?.id || ""}
                    onChange={(e) => setRedeemPointsCardId(e.target.value)}
                    className="w-full min-h-[44px] px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-xs font-bold text-white"
                  >
                    {cards.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.name} (•••• {c.last4}) — {(c.rewardsPoints || 0).toLocaleString()} pts
                      </option>
                    ))}
                  </select>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                    {[
                      { label: "10K pts ($100)", pts: 10000 },
                      { label: "50K pts ($500)", pts: 50000 },
                      { label: "250K pts ($2.5K)", pts: 250000 },
                      { label: "Redeem All", pts: pointsCard?.rewardsPoints || 0 },
                    ].map((preset) => (
                      <button
                        key={preset.label}
                        type="button"
                        onClick={() => handleRedeemPoints(preset.pts)}
                        disabled={!pointsCard || (pointsCard.rewardsPoints || 0) < preset.pts || preset.pts <= 0}
                        className="min-h-[44px] px-2 py-2 rounded-xl bg-amber-500/15 hover:bg-amber-500 hover:text-slate-950 border border-amber-500/30 text-amber-300 font-bold text-[11px] disabled:opacity-40 transition-colors cursor-pointer"
                      >
                        {preset.label}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 space-y-4">
                  <div className="flex items-center justify-between">
                    <h4 className="text-sm font-black text-white flex items-center gap-2">
                      <TrendingUp className="w-4 h-4 text-emerald-400" />
                      Annual Yield & Cashback Projector
                    </h4>
                    <span className="text-[11px] font-mono text-emerald-400">Uncapped</span>
                  </div>
                  <div className="space-y-3 text-xs">
                    <div>
                      <div className="flex justify-between text-slate-300 mb-1 tabular-nums">
                        <span>Monthly Card Spend</span>
                        <span className="font-mono font-bold text-white">${projectedMonthlySpend.toLocaleString("en-AU")} AUD/mo</span>
                      </div>
                      <input
                        type="range"
                        min={10000}
                        max={2000000}
                        step={10000}
                        value={projectedMonthlySpend}
                        onChange={(e) => setProjectedMonthlySpend(Number(e.target.value))}
                        className="w-full accent-emerald-400 cursor-pointer"
                      />
                    </div>
                    <div>
                      <div className="flex justify-between text-slate-300 mb-1 tabular-nums">
                        <span>Card Float / Reserve Balance</span>
                        <span className="font-mono font-bold text-white">${projectedTreasuryReserve.toLocaleString("en-AU")} AUD</span>
                      </div>
                      <input
                        type="range"
                        min={100000}
                        max={20000000}
                        step={100000}
                        value={projectedTreasuryReserve}
                        onChange={(e) => setProjectedTreasuryReserve(Number(e.target.value))}
                        className="w-full accent-sky-400 cursor-pointer"
                      />
                    </div>
                    <div className="pt-2 border-t border-slate-800 flex items-center justify-between font-mono tabular-nums">
                      <span className="text-slate-400">Total Projected Annual Benefit:</span>
                      <span className="text-base font-black text-emerald-400">
                        +${(annualCashbackProjection + annualApyProjection).toLocaleString("en-AU", { maximumFractionDigits: 0 })} AUD / yr
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* 2. Private Aviation Fleet */}
          {activeTab === "aviation" && (
            <div className="space-y-6">
              <div className="bg-slate-900 border border-slate-800 rounded-3xl p-5 sm:p-6 space-y-4">
                <div className="flex items-center justify-between gap-4">
                  <div>
                    <h3 className="text-lg font-black text-white">
                      Complimentary Sovereign Private Aviation Fleet
                    </h3>
                    <p className="text-xs text-slate-400">
                      Instant VIP aircraft dispatch settled to your active card with 5% uncapped cashback return.
                    </p>
                  </div>
                  <Plane className="w-8 h-8 text-amber-400 shrink-0" />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  {PRIVATE_JETS.map((jet) => {
                    const isSelected = selectedJet.model === jet.model;
                    return (
                      <button
                        key={jet.model}
                        type="button"
                        onClick={() => setSelectedJet(jet)}
                        className={`p-4 rounded-2xl border text-left transition-all cursor-pointer ${
                          isSelected
                            ? "bg-slate-800 border-amber-400 ring-1 ring-amber-400/50"
                            : "bg-slate-950 border-slate-800 hover:border-slate-700"
                        }`}
                      >
                        <span className="text-[10px] font-mono uppercase tracking-wider text-amber-400 block mb-1">
                          {jet.tag}
                        </span>
                        <div className="font-black text-white text-sm mb-0.5">{jet.model}</div>
                        <div className="text-[11px] text-slate-400 font-mono mb-2">{jet.manufacturer}</div>
                        <div className="text-xs text-slate-300 space-y-1 mb-3">
                          <div className="text-[11px]">Range: {jet.range}</div>
                          <div className="text-[11px]">Speed: {jet.speed}</div>
                          <div className="text-[11px] text-slate-400">{jet.capacity}</div>
                        </div>
                        <div className="text-sm font-bold font-mono text-emerald-400 pt-2 border-t border-slate-800 tabular-nums">
                          ${jet.priceAUD.toLocaleString("en-AU")} AUD
                        </div>
                      </button>
                    );
                  })}
                </div>

                <div className="pt-2 grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
                      Flight Route
                    </label>
                    <select
                      value={flightRoute}
                      onChange={(e) => setFlightRoute(e.target.value)}
                      className="w-full min-h-[44px] px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-xs font-bold text-white focus:outline-none"
                    >
                      <option value="Sydney (SYD) → New York (JFK)">Sydney (SYD) → New York (JFK)</option>
                      <option value="Sydney (SYD) → London Heathrow (LHR)">Sydney (SYD) → London Heathrow (LHR)</option>
                      <option value="Sydney (SYD) → Paris Le Bourget (LBG)">Sydney (SYD) → Paris Le Bourget (LBG)</option>
                      <option value="Sydney (SYD) → Dubai Al Maktoum (DWC)">Sydney (SYD) → Dubai Al Maktoum (DWC)</option>
                      <option value="Sydney (SYD) → San Francisco (SFO)">Sydney (SYD) → San Francisco (SFO)</option>
                    </select>
                  </div>
                  <div>
                    <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
                      Departure Timing
                    </label>
                    <input
                      type="text"
                      value={flightDate}
                      onChange={(e) => setFlightDate(e.target.value)}
                      className="w-full min-h-[44px] px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-xs font-bold text-white focus:outline-none"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={handleBookPrivateJet}
                    disabled={isBookingFlight || !currentCard}
                    className="min-h-[48px] py-3.5 px-4 rounded-2xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-xs uppercase tracking-wider flex items-center justify-center gap-2 transition-all cursor-pointer disabled:opacity-50"
                  >
                    <Plane className="w-4 h-4" />
                    <span>
                      {isBookingFlight
                        ? "Transmitting Clearances..."
                        : `Charter ${selectedJet.model} · $${selectedJet.priceAUD.toLocaleString("en-AU")}`}
                    </span>
                  </button>

                  <button
                    type="button"
                    onClick={handleIssueChauffeurCredit}
                    className="min-h-[48px] py-3.5 px-4 rounded-2xl bg-slate-800 hover:bg-slate-700 border border-emerald-500/40 text-emerald-300 font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-2 transition-all cursor-pointer"
                  >
                    <Ticket className="w-4 h-4" />
                    <span>Issue $500 Complimentary Chauffeur Pass</span>
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* 3. Diplomatic Concierge */}
          {activeTab === "concierge" && (
            <div className="space-y-6">
              <div className="bg-slate-900 border border-slate-800 rounded-3xl p-5 sm:p-6 space-y-4">
                <div className="flex items-center justify-between gap-4">
                  <div>
                    <h3 className="text-lg font-black text-white">
                      24/7 Global Diplomatic & Luxury Concierge Desk
                    </h3>
                    <p className="text-xs text-slate-400">
                      Direct allocation requests routed to Valourian executive concierges in Sydney, London, Geneva, and New York.
                    </p>
                  </div>
                  <Crown className="w-8 h-8 text-amber-400 shrink-0" />
                </div>

                <div className="space-y-3">
                  <div>
                    <label className="text-xs font-bold text-slate-400 uppercase tracking-wider block mb-1">
                      Concierge Directive Category
                    </label>
                    <select
                      value={conciergeCategory}
                      onChange={(e) => setConciergeCategory(e.target.value)}
                      className="w-full min-h-[44px] px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-xs font-bold text-white focus:outline-none"
                    >
                      <option value="Rare Horology Allocation">Rare Horology Allocation (Patek / Audemars / Rolex VIP)</option>
                      <option value="Superyacht Berth & Charter">Superyacht Berth (Monaco / Saint-Tropez / Sydney Harbour)</option>
                      <option value="Ultra-Prime Real Estate Escrow">Ultra-Prime Real Estate Escrow & Key Delivery</option>
                      <option value="Private Island Lease">Private Island Lease & Diplomatic Protection</option>
                      <option value="Michelin 3-Star Table Reservation">Michelin 3-Star Table (Chef's Table Worldwide)</option>
                    </select>
                  </div>

                  <div>
                    <label className="text-xs font-bold text-slate-400 uppercase tracking-wider block mb-1">
                      Instructions & Acquisition Details
                    </label>
                    <textarea
                      value={conciergeNotes}
                      onChange={(e) => setConciergeNotes(e.target.value)}
                      rows={3}
                      className="w-full p-3 bg-slate-950 border border-slate-700 rounded-xl text-xs font-mono text-white focus:outline-none"
                    />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <button
                      type="button"
                      onClick={handleDispatchConcierge}
                      disabled={isDispatchingConcierge}
                      className="min-h-[48px] py-3 px-4 rounded-2xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-xs uppercase tracking-wider flex items-center justify-center gap-2 transition-all cursor-pointer"
                    >
                      <Send className="w-4 h-4" />
                      <span>Dispatch Directive to Executive Desk</span>
                    </button>

                    <button
                      type="button"
                      onClick={handleIssueSuiteCredit}
                      className="min-h-[48px] py-3 px-4 rounded-2xl bg-slate-800 hover:bg-slate-700 border border-amber-500/40 text-amber-300 font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-2 transition-all cursor-pointer"
                    >
                      <Ticket className="w-4 h-4" />
                      <span>Generate $1,500 Suite Upgrade Credit</span>
                    </button>
                  </div>
                </div>

                {directives.length > 0 && (
                  <div className="pt-4 border-t border-slate-800 space-y-2">
                    <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400">
                      Recent Concierge Directives
                    </h4>
                    <div className="space-y-2 max-h-44 overflow-y-auto">
                      {directives.map((d) => (
                        <div key={d.id} className="p-3 rounded-xl bg-slate-950 border border-slate-800 flex flex-wrap items-center justify-between gap-2 text-xs">
                          <div>
                            <div className="font-bold text-white">{d.category}</div>
                            <div className="text-[11px] text-slate-400 truncate max-w-md">{d.notes}</div>
                          </div>
                          <div className="text-right font-mono">
                            <div className="text-[11px] font-bold text-emerald-400">{d.status}</div>
                            <div className="text-[10px] text-slate-500">{d.id} · {new Date(d.createdAt).toLocaleTimeString("en-AU")}</div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* 4. Centurion Lounge Pass */}
          {activeTab === "lounge" && (
            <div className="space-y-6">
              <div className="bg-slate-900 border border-slate-800 rounded-3xl p-5 sm:p-6 flex flex-col md:flex-row items-center justify-between gap-6">
                <div className="space-y-4 flex-1 w-full">
                  <div>
                    <span className="text-[10px] font-mono uppercase tracking-wider px-2.5 py-1 rounded bg-amber-500/10 text-amber-400 border border-amber-500/30 font-bold inline-block mb-2">
                      Global Centurion & First Class Network
                    </span>
                    <h3 className="text-xl sm:text-2xl font-black text-white">
                      Digital Centurion VIP Lounge Pass
                    </h3>
                    <p className="text-xs text-slate-400 leading-relaxed mt-1">
                      Unlimited complimentary access for {USER_NAME} across 1,400+ airport lounges worldwide including Centurion Lounges, Qantas First Lounges, and Emirates First.
                    </p>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1">
                        Airport Terminal Check-In
                      </label>
                      <select
                        value={selectedLounge}
                        onChange={(e) => setSelectedLounge(e.target.value)}
                        className="w-full min-h-[44px] px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-xs font-bold text-white"
                      >
                        {LOUNGE_LOCATIONS.map((l) => (
                          <option key={l.id} value={l.id}>{l.label}</option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1">
                        Complimentary Guests ({guestCount}/4)
                      </label>
                      <div className="flex gap-1.5">
                        {[0, 1, 2, 3, 4].map((num) => (
                          <button
                            key={num}
                            type="button"
                            onClick={() => setGuestCount(num)}
                            className={`flex-1 min-h-[44px] rounded-xl text-xs font-black transition-colors cursor-pointer ${
                              guestCount === num
                                ? "bg-amber-500 text-slate-950"
                                : "bg-slate-950 border border-slate-700 text-slate-300 hover:bg-slate-800"
                            }`}
                          >
                            +{num}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>

                  <div className="flex flex-wrap gap-3">
                    <button
                      type="button"
                      onClick={() => {
                        setGatePassActivatedAt(new Date().toLocaleTimeString("en-AU"));
                        toast.success(`Digital gate pass activated for ${activeLoungeLabel} (+${guestCount} guests).`);
                      }}
                      className="min-h-[44px] px-4 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black text-xs uppercase tracking-wider cursor-pointer flex items-center gap-2"
                    >
                      <CheckCircle2 className="w-4 h-4" />
                      <span>Activate Gate Pass Now</span>
                    </button>
                    <button
                      type="button"
                      onClick={handleIssueDiningCredit}
                      className="min-h-[44px] px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 border border-emerald-500/40 text-emerald-300 font-bold text-xs uppercase tracking-wider cursor-pointer flex items-center gap-2"
                    >
                      <Ticket className="w-4 h-4" />
                      <span>Claim $150 Airport Dining Credit</span>
                    </button>
                  </div>

                  <div className="text-xs font-mono text-slate-300 space-y-1 pt-2 border-t border-slate-800">
                    <div>Holder: <span className="text-white font-bold">{USER_NAME}</span></div>
                    <div>Terminal: <span className="text-amber-300 font-bold">{activeLoungeLabel}</span></div>
                    <div>
                      Status:{" "}
                      <span className="text-emerald-400 font-bold">
                        {gatePassActivatedAt ? `CHECKED-IN AT ${gatePassActivatedAt} (+${guestCount} GUESTS)` : `READY FOR ENTRY (+${guestCount} COMPLIMENTARY GUESTS)`}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="p-4 bg-white rounded-2xl shrink-0 shadow-2xl flex flex-col items-center">
                  <QRCodeSVG
                    value={`VALOURIAN:CENTURION:${selectedLounge.toUpperCase()}:GUESTS_${guestCount}:${USER_EMAIL}:ACTIVE`}
                    size={164}
                    level="H"
                  />
                  <span className="text-[10px] font-mono text-slate-900 font-bold mt-2">
                    PASS VALOURIAN-VIP-7712
                  </span>
                </div>
              </div>
            </div>
          )}

          {/* 5. 0% FX, Purchase Protection & Immense Value Expansion */}
          {activeTab === "immense" && (
            <div className="space-y-6">
              {/* 0% FX Zero-Markup Calculator + Live Switcher */}
              <div className="bg-slate-900 border border-slate-800 rounded-3xl p-5 sm:p-6 space-y-4">
                <div className="flex items-center justify-between gap-4">
                  <div>
                    <h3 className="text-lg font-black text-white flex items-center gap-2">
                      <Globe className="w-5 h-5 text-sky-400" />
                      0.00% Foreign Exchange Zero-Spread Switcher
                    </h3>
                    <p className="text-xs text-slate-400">
                      Bypass traditional 3.0% retail FX markups across global merchants and switch primary card currency instantly.
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 items-end">
                  <div>
                    <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1">
                      International Spend (AUD)
                    </label>
                    <input
                      type="number"
                      min={1}
                      value={fxAmountAUD}
                      onChange={(e) => setFxAmountAUD(Number(e.target.value) || 0)}
                      className="w-full min-h-[44px] px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-xs font-mono font-bold text-white tabular-nums"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1">
                      Target Settlement Currency
                    </label>
                    <select
                      value={targetFxCurrency}
                      onChange={(e) => setTargetFxCurrency(e.target.value)}
                      className="w-full min-h-[44px] px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-xs font-bold text-white"
                    >
                      {FX_CURRENCIES.map((cur) => (
                        <option key={cur.code} value={cur.code}>{cur.label}</option>
                      ))}
                    </select>
                  </div>
                  <button
                    type="button"
                    onClick={handleSwitchCardCurrency}
                    disabled={!currentCard}
                    className="min-h-[44px] px-4 py-2 rounded-xl bg-sky-500 hover:bg-sky-400 text-slate-950 font-black text-xs uppercase tracking-wider flex items-center justify-center gap-2 cursor-pointer"
                  >
                    <RefreshCw className="w-4 h-4" />
                    <span>Set Card •••• {currentCard?.last4} to {targetFxCurrency}</span>
                  </button>
                </div>

                <div className="p-3.5 rounded-2xl bg-slate-950 border border-slate-800 flex flex-wrap items-center justify-between gap-2 text-xs font-mono tabular-nums">
                  <span className="text-slate-400">Traditional Retail Bank 3.0% Markup Saved:</span>
                  <span className="text-emerald-400 font-black text-sm">
                    +${fxSavingsAUD.toLocaleString("en-AU", { minimumFractionDigits: 2 })} AUD SAVED (0.00% FX FEE)
                  </span>
                </div>
              </div>

              {/* Zero-Excess Purchase Protection Vault */}
              <div className="bg-slate-900 border border-slate-800 rounded-3xl p-5 sm:p-6 space-y-4">
                <div className="flex items-center justify-between gap-4">
                  <div>
                    <h3 className="text-lg font-black text-white flex items-center gap-2">
                      <ShieldCheck className="w-5 h-5 text-emerald-400" />
                      Zero-Excess Purchase Protection & Extended Warranty
                    </h3>
                    <p className="text-xs text-slate-400">
                      90-day theft/damage protection, price-drop refund, and 24-month extended warranty with $0.00 excess.
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1">
                      Merchant
                    </label>
                    <input
                      type="text"
                      value={claimMerchant}
                      onChange={(e) => setClaimMerchant(e.target.value)}
                      className="w-full min-h-[44px] px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-xs font-bold text-white"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1">
                      Claim Value (AUD)
                    </label>
                    <input
                      type="number"
                      value={claimAmountAUD}
                      onChange={(e) => setClaimAmountAUD(e.target.value)}
                      className="w-full min-h-[44px] px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-xs font-mono font-bold text-white tabular-nums"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1">
                      Protection Benefit Type
                    </label>
                    <select
                      value={claimReason}
                      onChange={(e) => setClaimReason(e.target.value)}
                      className="w-full min-h-[44px] px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-xs font-bold text-white"
                    >
                      <option value="Price Drop Protection (90-Day Guarantee)">Price Drop Protection (90-Day)</option>
                      <option value="Extended Hardware Warranty (+24 Mo)">Extended Hardware Warranty (+24 Mo)</option>
                      <option value="Accidental Damage / Loss ($0 Excess)">Accidental Damage / Loss ($0 Excess)</option>
                      <option value="Return Protection (Merchants Refusing Returns)">Return Protection</option>
                    </select>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={handleSubmitProtectionClaim}
                  className="min-h-[44px] px-5 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black text-xs uppercase tracking-wider cursor-pointer"
                >
                  File Instant Zero-Excess Claim
                </button>

                {claims.length > 0 && (
                  <div className="space-y-2 pt-2 border-t border-slate-800 max-h-40 overflow-y-auto">
                    {claims.map((cl) => (
                      <div key={cl.id} className="p-3 rounded-xl bg-slate-950 border border-slate-800 flex flex-wrap items-center justify-between gap-2 text-xs">
                        <div>
                          <div className="font-bold text-white">{cl.merchant} · ${cl.amountAUD.toLocaleString("en-AU", { minimumFractionDigits: 2 })} AUD</div>
                          <div className="text-[11px] text-slate-400">{cl.reason}</div>
                        </div>
                        <span className="font-mono text-[11px] font-bold text-emerald-400">{cl.status} ({cl.id})</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Multi-Billion Expansion & Usable Tokens Reservoir */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                <div className="bg-slate-900 border border-amber-500/40 rounded-3xl p-5 space-y-4">
                  <div className="flex items-center justify-between gap-2">
                    <div>
                      <h3 className="text-base font-black text-white">Sovereign Multi-Billion Card Expansion</h3>
                      <p className="text-xs text-slate-400">Expand all credit & debit cards to unmetered institutional headroom.</p>
                    </div>
                    <Zap className="w-6 h-6 text-amber-400 shrink-0" />
                  </div>
                  <button
                    type="button"
                    onClick={handleRestoreAllImmenseValues}
                    className="w-full min-h-[48px] rounded-2xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-xs uppercase tracking-wider flex items-center justify-center gap-2 cursor-pointer"
                  >
                    <Zap className="w-4 h-4" />
                    <span>Execute Sovereign Expansion on All Cards</span>
                  </button>
                </div>

                <div className="bg-slate-900 border border-indigo-500/40 rounded-3xl p-5 space-y-4">
                  <div className="flex items-center justify-between gap-2">
                    <div>
                      <h3 className="text-base font-black text-white">Sovereign Usable Tokens Reservoir</h3>
                      <p className="text-xs text-slate-400 font-mono tabular-nums">
                        Available: {tokenPool.availableTokens.toLocaleString()} tokens · Auto-refill active
                      </p>
                    </div>
                    <Sparkles className="w-6 h-6 text-indigo-400 shrink-0" />
                  </div>
                  <button
                    type="button"
                    onClick={handleRefillTokens}
                    className="w-full min-h-[48px] rounded-2xl bg-indigo-600 hover:bg-indigo-500 text-white font-black text-xs uppercase tracking-wider flex items-center justify-center gap-2 cursor-pointer"
                  >
                    <Sparkles className="w-4 h-4" />
                    <span>Refill 1,000,000,000,000 Usable Tokens</span>
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Issued Active Benefit Vouchers Strip */}
          {issuedVouchers.length > 0 && (
            <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 space-y-2">
              <div className="text-[11px] font-bold uppercase tracking-wider text-amber-400">
                Issued Complimentary Partner Benefit Vouchers
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {issuedVouchers.slice(0, 4).map((v) => (
                  <div key={v.code} className="p-3 rounded-xl bg-slate-950 border border-slate-800 flex items-center justify-between gap-2 text-xs">
                    <div className="min-w-0">
                      <div className="font-bold text-white truncate">{v.title}</div>
                      <div className="text-[11px] text-slate-400 font-mono">{v.code} · {v.storeScope}</div>
                    </div>
                    <button
                      type="button"
                      onClick={() => handleCopyCode(v.code)}
                      className="min-h-[36px] px-2.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 flex items-center gap-1 text-[11px] font-bold shrink-0 cursor-pointer"
                    >
                      <Copy className="w-3.5 h-3.5" /> Copy
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-slate-800 bg-slate-900/80 flex flex-wrap items-center justify-between gap-3 text-xs text-slate-400">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
            <span>Valourian Sovereign Benefits Matrix · Registered for {USER_NAME}</span>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="min-h-[44px] px-5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-bold transition-colors cursor-pointer"
          >
            Close Matrix
          </button>
        </div>
      </div>
    </div>
  );
};
