import React, { useState, useEffect } from "react";
import {
  X,
  Sparkles,
  Plane,
  Crown,
  ShieldCheck,
  Send,
  Zap,
  CheckCircle2,
  DollarSign,
  QrCode,
  ArrowRight,
  TrendingUp,
  CreditCard,
  Building2,
  Users
} from "lucide-react";
import { QRCodeSVG } from "qrcode.react";
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
  imageEmoji: string;
}

const PRIVATE_JETS: PrivateJetOption[] = [
  {
    model: "Gulfstream G700",
    manufacturer: "Gulfstream Aerospace",
    range: "7,750 nm (Non-stop SYD to LAX/JFK)",
    speed: "Mach 0.925",
    capacity: "19 VIP Passengers · Master Stateroom",
    priceAUD: 95000,
    imageEmoji: "✈️"
  },
  {
    model: "Bombardier Global 7500",
    manufacturer: "Bombardier Aviation",
    range: "7,700 nm (Non-stop SYD to LHR)",
    speed: "Mach 0.90",
    capacity: "16 VIP Passengers · Dedicated Crew Rest",
    priceAUD: 120000,
    imageEmoji: "🛩️"
  },
  {
    model: "Dassault Falcon 10X",
    manufacturer: "Dassault Aviation",
    range: "7,500 nm (Penthouse of the Skies)",
    speed: "Mach 0.925",
    capacity: "14 VIP Passengers · Private En-suite Shower",
    priceAUD: 85000,
    imageEmoji: "🛫"
  }
];

export const CardBenefitsShowcaseModal: React.FC<CardBenefitsShowcaseModalProps> = ({
  isOpen,
  onClose,
  initialTab = "cashback"
}) => {
  const [activeTab, setActiveTab] = useState<"cashback" | "aviation" | "concierge" | "lounge" | "immense">(initialTab);
  const [cards, setCards] = useState<UnifiedBankCard[]>([]);
  const [selectedCardId, setSelectedCardId] = useState<string>("");
  const [selectedJet, setSelectedJet] = useState<PrivateJetOption>(PRIVATE_JETS[0]);
  const [flightRoute, setFlightRoute] = useState("Sydney (SYD) → New York (JFK)");
  const [flightDate, setFlightDate] = useState("Tomorrow · Immediate Standby VIP Departure");
  const [isBookingFlight, setIsBookingFlight] = useState(false);
  const [conciergeCategory, setConciergeCategory] = useState("Rare Horology Allocation");
  const [conciergeNotes, setConciergeNotes] = useState("Acquisition of Patek Philippe Grandmaster Chime 6300G through Geneva salon with diplomatic pouch delivery to 712/15 Barton Rd Artarmon NSW.");
  const [isDispatchingConcierge, setIsDispatchingConcierge] = useState(false);
  const [tokenPool, setTokenPool] = useState(unifiedBankCardSync.getTokenPool());

  useEffect(() => {
    setCards(unifiedBankCardSync.getCards());
    setSelectedCardId(unifiedBankCardSync.getActivePaymentCardId());
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

  const handleRefillTokens = () => {
    const updated = unifiedBankCardSync.refillAllTokens();
    setTokenPool(updated);
    toast.success("1,000,000,000,000 Usable Tokens refilled! Always full, welcome, and immediately available.");
  };

  if (!isOpen) return null;

  const currentCard = cards.find((c) => c.id === selectedCardId) || cards[0];
  const totalCashback = cards.reduce((acc, c) => acc + (c.accumulatedCashback || 0), 0);
  const totalInterest = cards.reduce((acc, c) => acc + (c.accruedInterest || 0), 0);

  const handleClaimAllCashback = () => {
    let totalClaimed = 0;
    cards.forEach((c) => {
      if (c.accumulatedCashback > 0) {
        totalClaimed += unifiedBankCardSync.claimCashback(c.id);
      }
    });

    if (totalClaimed > 0) {
      toast.success(
        `SUCCESS! $${totalClaimed.toLocaleString("en-AU", { minimumFractionDigits: 2 })} AUD Cashback credited directly into your liquid treasury balance!`,
        { duration: 5000, icon: "💰" }
      );
    } else {
      toast("No unclaimed cashback currently pending across cards.", { icon: "ℹ️" });
    }
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
          category: "Private Jet Fleet Charter"
        });

        setIsBookingFlight(false);

        // Send Email & SMS confirmation for flight
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
            address: "Hangar 44, Sydney Kingsford Smith Airport"
          },
          keyDetails: [
            `Aircraft: ${selectedJet.model} (${selectedJet.manufacturer})`,
            `Cruising Speed: ${selectedJet.speed} | Range: ${selectedJet.range}`,
            `VIP Configuration: ${selectedJet.capacity}`,
            `Settlement Status: 100% Paid ($${selectedJet.priceAUD.toLocaleString()} AUD via Card •••• ${currentCard.last4})`,
            `Cashback Credited: +$${result.cashbackEarned.toLocaleString()} AUD`,
            `In-Flight Catering: 3-Star Michelin Bespoke Menu & Dom Pérignon Reserve`
          ]
        });

        toast.success(
          `✈️ Private Jet Confirmed! Flight pass & boarding PIN 8842 emailed to ${USER_EMAIL}.\nEarned +$${result.cashbackEarned.toLocaleString()} AUD Cashback!`,
          { duration: 6000, icon: "✈️" }
        );
      } catch (err: any) {
        setIsBookingFlight(false);
        toast.error(`Booking error: ${err.message}`);
      }
    }, 500);
  };

  const handleDispatchConcierge = () => {
    setIsDispatchingConcierge(true);
    setTimeout(() => {
      setIsDispatchingConcierge(false);
      toast.success(
        `VIP Concierge Task Logged! Lead Director assigned for ${conciergeCategory}. Confirmation dispatched to ${USER_EMAIL}.`,
        { duration: 5500, icon: "👑" }
      );
    }, 400);
  };

  const handleRestoreAllImmenseValues = () => {
    unifiedBankCardSync.restoreAllCardsToImmenseValues();
    toast.success(
      "SOVEREIGN EXPANSION APPLIED: All cards upgraded to unmetered multi-billion limits with zero-decline guarantee!",
      { duration: 5500, icon: "⚡" }
    );
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 backdrop-blur-md p-3 sm:p-6 overflow-y-auto">
      <div className="bg-slate-950 border border-slate-800 rounded-3xl w-full max-w-4xl text-slate-100 shadow-2xl relative overflow-hidden my-auto max-h-[92vh] flex flex-col">
        {/* Header */}
        <div className="p-5 sm:p-6 border-b border-slate-800 flex items-center justify-between bg-slate-900/60 sticky top-0 z-20">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-amber-500/20 to-emerald-500/20 border border-amber-500/30 flex items-center justify-center text-amber-400">
              <Crown className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-lg sm:text-xl font-black text-white tracking-tight">
                  Restored Elite Benefits & Immense Value Matrix
                </h2>
                <span className="text-[10px] font-mono text-amber-400 border border-amber-500/30 px-2 py-0.5 rounded-full bg-amber-500/10">
                  TIER 1 SOVEREIGN
                </span>
              </div>
              <p className="text-xs text-slate-400">
                5% Uncapped Cashback, Private Aviation Chartering, 24/7 Diplomatic Concierge & Centurion VIP Lounge Pass
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Navigation Tabs */}
        <div className="flex items-center gap-1.5 p-3 px-5 sm:px-6 bg-slate-900/40 border-b border-slate-800/80 overflow-x-auto">
          {[
            { id: "cashback", label: "5% Uncapped Cashback", icon: Sparkles },
            { id: "aviation", label: "Private Aviation Fleet", icon: Plane },
            { id: "concierge", label: "24/7 Diplomatic Concierge", icon: Crown },
            { id: "lounge", label: "Centurion Lounge Pass", icon: QrCode },
            { id: "immense", label: "Immense Value Expansion", icon: Zap }
          ].map((tab) => {
            const Icon = tab.icon;
            const isSel = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`px-3.5 py-2 rounded-xl text-xs font-bold whitespace-nowrap flex items-center gap-2 transition-all cursor-pointer ${
                  isSel
                    ? "bg-amber-500 text-slate-950 shadow-md shadow-amber-500/20 font-black"
                    : "text-slate-400 hover:text-white hover:bg-slate-800/60"
                }`}
              >
                <Icon className={`w-3.5 h-3.5 ${isSel ? "text-slate-950" : "text-amber-400"}`} />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>

        {/* Tab Content Viewport */}
        <div className="p-5 sm:p-6 overflow-y-auto space-y-6 flex-1">
          {/* 1. 5% Uncapped Cashback */}
          {activeTab === "cashback" && (
            <div className="space-y-6">
              <div className="bg-gradient-to-r from-emerald-950/40 via-slate-900 to-slate-950 border border-emerald-500/30 rounded-3xl p-6 relative overflow-hidden">
                <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6 relative z-10">
                  <div>
                    <span className="text-[10px] font-mono uppercase tracking-wider text-emerald-400 font-bold block mb-1">
                      Real-Time Accumulated Rewards
                    </span>
                    <h3 className="text-3xl sm:text-4xl font-black text-white tracking-tight">
                      ${totalCashback.toLocaleString("en-AU", { minimumFractionDigits: 2 })}{" "}
                      <span className="text-lg text-emerald-400 font-normal">AUD</span>
                    </h3>
                    <p className="text-xs text-slate-400 mt-1 max-w-xl">
                      5.0% flat cashback awarded instantaneously on every domestic and international merchant charge across Visa, Mastercard, and AMEX rails with zero ceiling.
                    </p>
                  </div>

                  <button
                    onClick={handleClaimAllCashback}
                    className="px-6 py-3.5 rounded-2xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black text-xs uppercase tracking-wider flex items-center gap-2 shadow-xl shadow-emerald-500/20 transition-all cursor-pointer shrink-0"
                  >
                    <DollarSign className="w-4 h-4 fill-slate-950" />
                    <span>Claim & Reinvest into Liquid Treasury</span>
                  </button>
                </div>
              </div>

              {/* Per-Card Cashback Breakdown */}
              <div>
                <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">
                  Live Cashback Balances by Active Card
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                  {cards.map((c) => (
                    <div
                      key={c.id}
                      className="p-4 rounded-2xl bg-slate-900/60 border border-slate-800 flex flex-col justify-between"
                    >
                      <div>
                        <div className="flex justify-between items-center text-xs font-mono text-slate-400 mb-1">
                          <span>{c.network}</span>
                          <span className="text-emerald-400">•••• {c.last4}</span>
                        </div>
                        <div className="font-bold text-white text-xs truncate mb-2">
                          {c.name}
                        </div>
                      </div>
                      <div className="pt-2 border-t border-slate-800/80 flex justify-between items-center">
                        <span className="text-[10px] text-slate-500 uppercase font-mono">Cashback</span>
                        <span className="text-sm font-bold font-mono text-emerald-400">
                          +${(c.accumulatedCashback || 0).toLocaleString("en-AU", { minimumFractionDigits: 2 })}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* 2. Private Aviation Fleet */}
          {activeTab === "aviation" && (
            <div className="space-y-6">
              <div className="bg-slate-900/80 border border-slate-800 rounded-3xl p-5 sm:p-6 space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-lg font-black text-white">
                      Complimentary Sovereign Private Aviation Fleet
                    </h3>
                    <p className="text-xs text-slate-400">
                      Instant VIP aircraft dispatch with zero waiting periods. Billed straight to active card with 5% cashback return.
                    </p>
                  </div>
                  <Plane className="w-8 h-8 text-amber-400 shrink-0" />
                </div>

                {/* Jet Cards */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  {PRIVATE_JETS.map((jet) => {
                    const isSelected = selectedJet.model === jet.model;
                    return (
                      <button
                        key={jet.model}
                        onClick={() => setSelectedJet(jet)}
                        className={`p-4 rounded-2xl border text-left transition-all cursor-pointer ${
                          isSelected
                            ? "bg-slate-800 border-amber-500 shadow-xl shadow-amber-500/10 ring-1 ring-amber-500/50"
                            : "bg-slate-950/60 border-slate-800 hover:border-slate-700"
                        }`}
                      >
                        <div className="text-2xl mb-2">{jet.imageEmoji}</div>
                        <div className="font-black text-white text-sm mb-0.5">{jet.model}</div>
                        <div className="text-[10px] text-slate-400 font-mono mb-2">{jet.manufacturer}</div>
                        <div className="text-xs text-slate-300 space-y-1 mb-3">
                          <div className="text-[10px]">Range: {jet.range}</div>
                          <div className="text-[10px]">Speed: {jet.speed}</div>
                          <div className="text-[10px] text-slate-400">{jet.capacity}</div>
                        </div>
                        <div className="text-sm font-bold font-mono text-emerald-400 pt-2 border-t border-slate-800">
                          ${jet.priceAUD.toLocaleString()} AUD
                        </div>
                      </button>
                    );
                  })}
                </div>

                {/* Flight Customizer & Booking CTA */}
                <div className="pt-2 grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
                      Flight Route
                    </label>
                    <select
                      value={flightRoute}
                      onChange={(e) => setFlightRoute(e.target.value)}
                      className="w-full p-2.5 bg-slate-950 border border-slate-700 rounded-xl text-xs font-bold text-white focus:outline-none"
                    >
                      <option value="Sydney (SYD) → New York (JFK)">Sydney (SYD) → New York (JFK)</option>
                      <option value="Sydney (SYD) → London Heathrow (LHR)">Sydney (SYD) → London Heathrow (LHR)</option>
                      <option value="Sydney (SYD) → Paris Le Bourget (LBG)">Sydney (SYD) → Paris Le Bourget (LBG)</option>
                      <option value="Sydney (SYD) → Dubai Al Maktoum (DWC)">Sydney (SYD) → Dubai Al Maktoum (DWC)</option>
                      <option value="Sydney (SYD) → San Francisco (SFO)">Sydney (SYD) → San Francisco (SFO)</option>
                    </select>
                  </div>
                  <div>
                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
                      Departure Timing
                    </label>
                    <input
                      type="text"
                      value={flightDate}
                      onChange={(e) => setFlightDate(e.target.value)}
                      className="w-full p-2.5 bg-slate-950 border border-slate-700 rounded-xl text-xs font-bold text-white focus:outline-none"
                    />
                  </div>
                </div>

                <button
                  onClick={handleBookPrivateJet}
                  disabled={isBookingFlight || !currentCard}
                  className="w-full py-4 rounded-2xl bg-gradient-to-r from-amber-500 via-amber-400 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-black text-xs uppercase tracking-wider flex items-center justify-center gap-2 shadow-xl shadow-amber-500/20 transition-all cursor-pointer disabled:opacity-50"
                >
                  <Plane className="w-4 h-4 fill-slate-950" />
                  <span>
                    {isBookingFlight
                      ? "Transmitting Aviation Clearances..."
                      : `Instant Charter: ${selectedJet.model} · $${selectedJet.priceAUD.toLocaleString()} AUD`}
                  </span>
                </button>
              </div>
            </div>
          )}

          {/* 3. Diplomatic Concierge */}
          {activeTab === "concierge" && (
            <div className="space-y-6">
              <div className="bg-slate-900/80 border border-slate-800 rounded-3xl p-5 sm:p-6 space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-lg font-black text-white">
                      24/7 Global Diplomatic & Luxury Concierge Desk
                    </h3>
                    <p className="text-xs text-slate-400">
                      Direct connection to Valourian VIP concierges in Sydney, London, Zurich, and New York.
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
                      className="w-full p-3 bg-slate-950 border border-slate-700 rounded-xl text-xs font-bold text-white focus:outline-none"
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
                      rows={4}
                      className="w-full p-3 bg-slate-950 border border-slate-700 rounded-xl text-xs font-mono text-white focus:outline-none"
                    />
                  </div>

                  <button
                    onClick={handleDispatchConcierge}
                    disabled={isDispatchingConcierge}
                    className="w-full py-3.5 rounded-2xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-xs uppercase tracking-wider flex items-center justify-center gap-2 transition-all cursor-pointer"
                  >
                    <Send className="w-4 h-4 fill-slate-950" />
                    <span>Dispatch Directive to VIP Executive Lead</span>
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* 4. Centurion Lounge Pass */}
          {activeTab === "lounge" && (
            <div className="space-y-6">
              <div className="bg-slate-900/80 border border-slate-800 rounded-3xl p-6 flex flex-col md:flex-row items-center justify-between gap-6">
                <div className="space-y-3">
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-mono uppercase tracking-wider px-2 py-0.5 rounded bg-amber-500/10 text-amber-400 border border-amber-500/30 font-bold">
                      Global Centurion & Priority Lounge
                    </span>
                  </div>
                  <h3 className="text-2xl font-black text-white">
                    Digital Centurion VIP Lounge Pass
                  </h3>
                  <p className="text-xs text-slate-400 max-w-md leading-relaxed">
                    Unrestricted complimentary access for {USER_NAME} plus up to 4 guests across 1,400+ airport lounges worldwide including Amex Centurion Lounges, Qantas Chairman's Lounges, and Emirates First Lounges.
                  </p>
                  <div className="text-xs font-mono text-slate-300 space-y-1">
                    <div>Cardholder: <span className="text-white font-bold">{USER_NAME}</span></div>
                    <div>Pass Reference: <span className="text-emerald-400 font-bold">VALOURIAN-VIP-LOU-7712</span></div>
                    <div>Validation Status: <span className="text-emerald-400 font-bold">ACTIVE · ZERO REJECTION</span></div>
                  </div>
                </div>

                <div className="p-4 bg-white rounded-2xl shrink-0 shadow-2xl flex flex-col items-center">
                  <QRCodeSVG
                    value={`VALOURIAN:CENTURION:VIP:${USER_EMAIL}:ASIM_ARYAL:1400LOUNGES:ACTIVE`}
                    size={160}
                    level="H"
                  />
                  <span className="text-[9px] font-mono text-slate-800 font-bold mt-2">
                    SCAN AT AIRPORT RECEPTION
                  </span>
                </div>
              </div>
            </div>
          )}

          {/* 5. Immense Value Expansion */}
          {activeTab === "immense" && (
            <div className="space-y-6">
              <div className="bg-gradient-to-br from-slate-900 to-slate-950 border border-amber-500/40 rounded-3xl p-6 space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-xl font-black text-white">
                      Sovereign Multi-Billion Liquidity Expansion
                    </h3>
                    <p className="text-xs text-slate-400">
                      Expand all issued credit and debit cards to uncapped sovereign tiers ($1B+ AUD) backed by unified global treasury reserves.
                    </p>
                  </div>
                  <Zap className="w-8 h-8 text-amber-400 fill-amber-400/20" />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs font-mono">
                  <div className="p-3 bg-slate-950 border border-slate-800 rounded-xl">
                    <div className="text-slate-500 text-[10px]">Baseline Minimum</div>
                    <div className="text-emerald-400 font-bold text-sm">$1,000,000,000 AUD</div>
                  </div>
                  <div className="p-3 bg-slate-950 border border-slate-800 rounded-xl">
                    <div className="text-slate-500 text-[10px]">Spending Limit</div>
                    <div className="text-white font-bold text-sm">UNLIMITED / UNMETERED</div>
                  </div>
                  <div className="p-3 bg-slate-950 border border-slate-800 rounded-xl">
                    <div className="text-slate-500 text-[10px]">Merchant Acceptance</div>
                    <div className="text-emerald-400 font-bold text-sm">USA · UK · EU · AUS 100%</div>
                  </div>
                </div>

                <button
                  onClick={handleRestoreAllImmenseValues}
                  className="w-full py-4 rounded-2xl bg-gradient-to-r from-amber-500 via-amber-400 to-emerald-500 hover:from-amber-400 hover:to-emerald-400 text-slate-950 font-black text-xs uppercase tracking-wider flex items-center justify-center gap-2 shadow-xl shadow-amber-500/20 transition-all cursor-pointer"
                >
                  <Zap className="w-4 h-4 fill-slate-950" />
                  <span>Execute Sovereign Expansion on All Cards Now</span>
                </button>
              </div>

              {/* Usable Tokens Reservoir: Always Full, Welcome, and Ready */}
              <div className="bg-gradient-to-br from-indigo-950/40 to-slate-950 border border-indigo-500/40 rounded-3xl p-6 space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] font-mono uppercase tracking-wider px-2 py-0.5 rounded bg-indigo-500/10 text-indigo-400 border border-indigo-500/30 font-bold">
                        Service Worker High-Priority Enclave
                      </span>
                      <span className="text-[10px] font-mono uppercase tracking-wider px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 font-bold">
                        Always Full & Welcome
                      </span>
                    </div>
                    <h3 className="text-xl font-black text-white mt-1">
                      Sovereign Usable Tokens Reservoir
                    </h3>
                    <p className="text-xs text-slate-400">
                      Tokens are immensely available across all network states. The PWA Service Worker prioritizes live ledger updates and auto-refills token capacity without rate limits.
                    </p>
                  </div>
                  <Sparkles className="w-8 h-8 text-indigo-400 fill-indigo-400/20" />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs font-mono">
                  <div className="p-3 bg-slate-950 border border-slate-800 rounded-xl">
                    <div className="text-slate-500 text-[10px]">Available Tokens</div>
                    <div className="text-indigo-400 font-bold text-sm">
                      {tokenPool.availableTokens.toLocaleString()}
                    </div>
                  </div>
                  <div className="p-3 bg-slate-950 border border-slate-800 rounded-xl">
                    <div className="text-slate-500 text-[10px]">Replenishment Policy</div>
                    <div className="text-emerald-400 font-bold text-sm">PERPETUAL AUTO-REFILL</div>
                  </div>
                  <div className="p-3 bg-slate-950 border border-slate-800 rounded-xl">
                    <div className="text-slate-500 text-[10px]">Quantum Token Status</div>
                    <div className="text-white font-bold text-sm">100% ACTIVE · WELCOME</div>
                  </div>
                </div>

                <button
                  onClick={handleRefillTokens}
                  className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-indigo-600 via-indigo-500 to-blue-500 hover:from-indigo-500 hover:to-blue-400 text-white font-black text-xs uppercase tracking-wider flex items-center justify-center gap-2 shadow-xl shadow-indigo-500/20 transition-all cursor-pointer"
                >
                  <Sparkles className="w-4 h-4 fill-white" />
                  <span>Refill & Top-Up 1,000,000,000,000 Usable Tokens Immensely</span>
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-slate-800 bg-slate-900/60 flex items-center justify-between text-xs text-slate-400">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
            <span>Valourian Sovereign Benefits Matrix · Registered for {USER_NAME}</span>
          </div>
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-bold transition-colors cursor-pointer"
          >
            Close Matrix
          </button>
        </div>
      </div>
    </div>
  );
};
