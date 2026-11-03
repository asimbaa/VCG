import React, { useState, useEffect } from "react";
import {
  X,
  CreditCard,
  Globe,
  CheckCircle2,
  Zap,
  ArrowRight,
  ShieldCheck,
  Send,
  Sparkles,
  Smartphone,
  Receipt,
  RotateCw,
  Building2,
  DollarSign,
  Printer
} from "lucide-react";
import { unifiedBankCardSync, UnifiedBankCard, MerchantTransaction } from "../../services/unifiedBankCardSync";
import { smsEmailDispatchService, USER_EMAIL } from "../../services/smsEmailDispatchService";
import toast from "react-hot-toast";

interface GlobalMerchantPOSModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialCardId?: string;
}

interface MerchantPreset {
  name: string;
  location: string;
  region: "USA" | "UK" | "EU" | "AUS";
  currency: string;
  defaultAmount: number;
  category: string;
  iconName: string;
}

const PRESET_MERCHANTS: MerchantPreset[] = [
  // USA
  { name: "Tiffany & Co Flagship", location: "Fifth Avenue, New York, USA", region: "USA", currency: "USD", defaultAmount: 45000, category: "Luxury Jewelry", iconName: "💎" },
  { name: "Uber Technologies Inc HQ", location: "Mission Bay, San Francisco, USA", region: "USA", currency: "USD", defaultAmount: 12500, category: "Corporate Travel", iconName: "🚗" },
  { name: "Apple Park Visitor Center", location: "Cupertino, California, USA", region: "USA", currency: "USD", defaultAmount: 28000, category: "Technology", iconName: "💻" },
  { name: "Tesla Gigafactory Supercharge", location: "Austin, Texas, USA", region: "USA", currency: "USD", defaultAmount: 95000, category: "Automotive Fleet", iconName: "⚡" },
  // UK
  { name: "Harrods Knightsbridge", location: "Knightsbridge, London, UK", region: "UK", currency: "GBP", defaultAmount: 32000, category: "Prestige Department Store", iconName: "🛍️" },
  { name: "Rolls-Royce Motor Cars Mayfair", location: "Berkeley Square, London, UK", region: "UK", currency: "GBP", defaultAmount: 285000, category: "Bespoke Vehicles", iconName: "🏎️" },
  { name: "Savile Row Bespoke Tailors", location: "Savile Row, London, UK", region: "UK", currency: "GBP", defaultAmount: 18500, category: "High Fashion", iconName: "👔" },
  // EU
  { name: "LVMH Louis Vuitton Champs-Élysées", location: "Paris, France", region: "EU", currency: "EUR", defaultAmount: 64000, category: "Haute Couture", iconName: "👜" },
  { name: "Yacht Club de Monaco", location: "Port Hercule, Monaco", region: "EU", currency: "EUR", defaultAmount: 140000, category: "Marina Berth & Fuel", iconName: "⚓" },
  { name: "Hotel de Paris Monte-Carlo", location: "Place du Casino, Monaco", region: "EU", currency: "EUR", defaultAmount: 52000, category: "VIP Hospitality", iconName: "🏨" },
  // AUS
  { name: "Crown Sydney Penthouse Suites", location: "Barangaroo, Sydney, AUS", region: "AUS", currency: "AUD", defaultAmount: 35000, category: "Executive Hospitality", iconName: "👑" },
  { name: "Sydney Jet Base VIP FBO", location: "Mascot, Sydney, AUS", region: "AUS", currency: "AUD", defaultAmount: 85000, category: "Aviation Fuel & Handling", iconName: "✈️" },
  { name: "CommBank Flagship Martin Place", location: "Martin Place, Sydney, AUS", region: "AUS", currency: "AUD", defaultAmount: 500000, category: "Commercial Settlement", iconName: "🏛️" }
];

const FX_RATES: Record<string, number> = {
  AUD: 1.00,
  USD: 1.52,
  EUR: 1.65,
  GBP: 1.93,
  JPY: 0.010,
  CHF: 1.72,
  SGD: 1.13
};

export const GlobalMerchantPOSModal: React.FC<GlobalMerchantPOSModalProps> = ({
  isOpen,
  onClose,
  initialCardId
}) => {
  const [cards, setCards] = useState<UnifiedBankCard[]>([]);
  const [selectedCardId, setSelectedCardId] = useState<string>("");
  const [selectedRegion, setSelectedRegion] = useState<"ALL" | "USA" | "UK" | "EU" | "AUS">("ALL");
  const [selectedMerchant, setSelectedMerchant] = useState<MerchantPreset>(PRESET_MERCHANTS[0]);
  const [amount, setAmount] = useState<string>("45000");
  const [isProcessing, setIsProcessing] = useState(false);
  const [lastReceipt, setLastReceipt] = useState<MerchantTransaction | null>(null);
  const [recentTransactions, setRecentTransactions] = useState<MerchantTransaction[]>([]);
  const [pinInput, setPinInput] = useState("4912");

  useEffect(() => {
    const all = unifiedBankCardSync.getCards();
    setCards(all);
    const active = initialCardId || unifiedBankCardSync.getActivePaymentCardId();
    setSelectedCardId(active);
    setRecentTransactions(unifiedBankCardSync.getRecentTransactions());

    const unsubscribe = unifiedBankCardSync.subscribe((nextCards) => {
      setCards(nextCards);
    });

    return () => unsubscribe();
  }, [initialCardId, isOpen]);

  if (!isOpen) return null;

  const currentCard = cards.find((c) => c.id === selectedCardId) || cards[0];
  const numAmount = parseFloat(amount) || 0;
  const rate = FX_RATES[selectedMerchant.currency] || 1.0;
  const convertedAUD = Math.round(numAmount * rate * 100) / 100;
  const cashbackEstimated = Math.round(convertedAUD * (currentCard?.cashbackRate || 0.05) * 100) / 100;

  const filteredMerchants = selectedRegion === "ALL"
    ? PRESET_MERCHANTS
    : PRESET_MERCHANTS.filter((m) => m.region === selectedRegion);

  const handleSelectMerchant = (m: MerchantPreset) => {
    setSelectedMerchant(m);
    setAmount(String(m.defaultAmount));
  };

  const handleAuthorizeCharge = () => {
    if (!currentCard) return;
    if (numAmount <= 0) {
      toast.error("Please enter a valid amount to charge.");
      return;
    }

    setIsProcessing(true);
    setTimeout(() => {
      try {
        const result = unifiedBankCardSync.spendFromCard(currentCard.id, {
          merchantName: selectedMerchant.name,
          merchantLocation: selectedMerchant.location,
          region: selectedMerchant.region,
          foreignAmount: numAmount,
          foreignCurrency: selectedMerchant.currency,
          category: selectedMerchant.category
        });

        setIsProcessing(false);
        setLastReceipt(result.transaction);
        setRecentTransactions(unifiedBankCardSync.getRecentTransactions());

        toast.success(
          `APPROVED! ${selectedMerchant.currency} ${numAmount.toLocaleString()} paid at ${selectedMerchant.name}.\nEarned +$${result.cashbackEarned.toLocaleString()} AUD Cashback!`,
          { duration: 5500, icon: "💳" }
        );
      } catch (err: any) {
        setIsProcessing(false);
        toast.error(`Transaction failed: ${err.message || "Unknown error"}`);
      }
    }, 450);
  };

  const handleEmailReceipt = async () => {
    if (!lastReceipt) return;
    await smsEmailDispatchService.dispatchMerchantReceipt({
      transactionId: lastReceipt.id,
      cardName: lastReceipt.cardName,
      cardLast4: lastReceipt.cardLast4,
      merchantName: lastReceipt.merchantName,
      merchantLocation: lastReceipt.merchantLocation,
      region: lastReceipt.region,
      foreignAmount: lastReceipt.foreignAmount,
      foreignCurrency: lastReceipt.foreignCurrency,
      convertedAUD: lastReceipt.convertedAUD,
      cashbackEarned: lastReceipt.cashbackEarned,
      authCode: lastReceipt.authorizationCode,
      arqcToken: lastReceipt.arqcToken,
      rail: lastReceipt.rail
    });
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 backdrop-blur-md p-3 sm:p-6 overflow-y-auto">
      <div className="bg-slate-950 border border-slate-800 rounded-3xl w-full max-w-4xl text-slate-100 shadow-2xl relative overflow-hidden my-auto max-h-[92vh] flex flex-col">
        {/* Header */}
        <div className="p-5 sm:p-6 border-b border-slate-800 flex items-center justify-between bg-slate-900/60 sticky top-0 z-20">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400">
              <Globe className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-lg sm:text-xl font-black text-white tracking-tight">
                  Global Merchant POS & Virtual Checkout Terminal
                </h2>
                <span className="text-[10px] font-mono text-emerald-400 border border-emerald-500/30 px-2 py-0.5 rounded-full bg-emerald-500/10">
                  PRE-ARRIVAL ACTIVE
                </span>
              </div>
              <p className="text-xs text-slate-400">
                Test and legitimate-charge cards anywhere in the USA, UK, EU, AUS & globally before physical cards arrive
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

        {/* Content Body */}
        <div className="p-5 sm:p-6 overflow-y-auto space-y-6 flex-1">
          {/* Card Selection Strip */}
          <div className="bg-slate-900/70 border border-slate-800 rounded-2xl p-4">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 mb-3">
              <label className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-2">
                <CreditCard className="w-4 h-4 text-emerald-400" />
                Active Test Card (Immense Liquidity)
              </label>
              <div className="text-xs text-slate-400 font-mono">
                5% Cashback & 0% FX Active
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2">
              {cards.slice(0, 6).map((c) => {
                const isSelected = c.id === selectedCardId;
                return (
                  <button
                    key={c.id}
                    onClick={() => setSelectedCardId(c.id)}
                    className={`p-3 rounded-xl border text-left transition-all cursor-pointer ${
                      isSelected
                        ? "bg-slate-800 border-amber-500/60 shadow-lg shadow-amber-500/10 ring-1 ring-amber-500/40"
                        : "bg-slate-950/60 border-slate-800 hover:border-slate-700"
                    }`}
                  >
                    <div className="flex justify-between items-start mb-1">
                      <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                        {c.network}
                      </span>
                      <span className="text-[10px] font-mono text-emerald-400 font-bold">
                        •••• {c.last4}
                      </span>
                    </div>
                    <div className="text-xs font-bold text-white truncate mb-1">
                      {c.name}
                    </div>
                    <div className="text-xs font-mono text-slate-300 tabular-nums">
                      ${Number(c.balance).toLocaleString("en-AU")} AUD
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Region Tabs & Merchant Grid */}
          <div>
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-3">
              <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                Select Destination Merchant Network
              </label>
              {/* Region Filter Buttons */}
              <div className="flex items-center gap-1 bg-slate-900 p-1 rounded-xl border border-slate-800 self-start sm:self-auto">
                {(["ALL", "USA", "UK", "EU", "AUS"] as const).map((r) => (
                  <button
                    key={r}
                    onClick={() => setSelectedRegion(r)}
                    className={`px-3 py-1 rounded-lg text-xs font-bold transition-colors cursor-pointer ${
                      selectedRegion === r
                        ? "bg-amber-500 text-slate-950 shadow-sm"
                        : "text-slate-400 hover:text-white"
                    }`}
                  >
                    {r === "ALL" ? "Worldwide" : r}
                  </button>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2.5">
              {filteredMerchants.map((m) => {
                const isSel = selectedMerchant.name === m.name;
                return (
                  <button
                    key={m.name}
                    onClick={() => handleSelectMerchant(m)}
                    className={`p-3 rounded-2xl border text-left transition-all cursor-pointer ${
                      isSel
                        ? "bg-slate-800/90 border-emerald-500/60 shadow-lg shadow-emerald-500/10 ring-1 ring-emerald-500/40"
                        : "bg-slate-900/40 border-slate-800/80 hover:border-slate-700"
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1.5">
                      <span className="text-lg">{m.iconName}</span>
                      <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-slate-800 text-slate-300 border border-slate-700">
                        {m.region} · {m.currency}
                      </span>
                    </div>
                    <div className="text-xs font-bold text-white truncate">
                      {m.name}
                    </div>
                    <div className="text-[10px] text-slate-400 truncate mb-1">
                      {m.location}
                    </div>
                    <div className="text-[11px] font-mono font-bold text-emerald-400">
                      Default: {m.currency} {m.defaultAmount.toLocaleString()}
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Amount & Currency Conversion Engine */}
          <div className="bg-gradient-to-br from-slate-900 to-slate-950 border border-slate-800 rounded-3xl p-5 sm:p-6 space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-center">
              <div>
                <label className="text-xs font-bold text-slate-400 uppercase tracking-wider block mb-2">
                  Charge Amount ({selectedMerchant.currency})
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-400 font-bold font-mono text-lg">
                    {selectedMerchant.currency}
                  </div>
                  <input
                    type="number"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    className="w-full pl-20 pr-4 py-3 bg-slate-950 border border-slate-700 rounded-2xl text-xl font-bold font-mono text-white focus:outline-none focus:border-amber-500 transition-colors"
                    placeholder="Enter amount"
                  />
                </div>

                {/* Quick Presets */}
                <div className="flex flex-wrap gap-1.5 mt-2.5">
                  {[5000, 25000, 100000, 500000, 1000000].map((preset) => (
                    <button
                      key={preset}
                      onClick={() => setAmount(String(preset))}
                      className="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-[10px] font-mono text-slate-300 border border-slate-700 transition-colors cursor-pointer"
                    >
                      {preset >= 1000000 ? `$${preset / 1000000}M` : `$${preset / 1000}k`}
                    </button>
                  ))}
                </div>
              </div>

              {/* Live FX Calculation Card */}
              <div className="bg-slate-950/80 border border-slate-800 rounded-2xl p-4 space-y-2 text-xs">
                <div className="flex justify-between items-center pb-2 border-b border-slate-800 text-slate-400">
                  <span>Merchant Currency Rail</span>
                  <span className="font-mono text-white font-bold">
                    1 {selectedMerchant.currency} = {rate.toFixed(4)} AUD
                  </span>
                </div>
                <div className="flex justify-between items-center pb-2 border-b border-slate-800 text-slate-400">
                  <span>Foreign Transaction Fee</span>
                  <span className="text-emerald-400 font-bold font-mono">
                    0.00% (Zero-FX Surcharge)
                  </span>
                </div>
                <div className="flex justify-between items-center pb-2 border-b border-slate-800 text-slate-400">
                  <span>Settled in Base AUD Treasury</span>
                  <span className="text-white font-mono font-bold text-sm">
                    ${convertedAUD.toLocaleString("en-AU", { minimumFractionDigits: 2 })} AUD
                  </span>
                </div>
                <div className="flex justify-between items-center text-slate-400 pt-1">
                  <span className="flex items-center gap-1 text-emerald-400 font-bold">
                    <Sparkles className="w-3.5 h-3.5" /> +5% Instant Cashback
                  </span>
                  <span className="text-emerald-400 font-mono font-bold text-sm">
                    +${cashbackEstimated.toLocaleString("en-AU", { minimumFractionDigits: 2 })} AUD
                  </span>
                </div>
              </div>
            </div>

            {/* Authorization Actions */}
            <div className="pt-2 flex flex-col sm:flex-row items-center gap-3">
              <button
                onClick={handleAuthorizeCharge}
                disabled={isProcessing || !currentCard}
                className="w-full sm:flex-1 py-4 px-6 rounded-2xl bg-gradient-to-r from-emerald-500 via-teal-500 to-emerald-600 hover:from-emerald-400 hover:to-teal-400 text-slate-950 font-black text-sm uppercase tracking-wider flex items-center justify-center gap-2 transition-all shadow-xl shadow-emerald-500/20 cursor-pointer disabled:opacity-50"
              >
                {isProcessing ? (
                  <>
                    <RotateCw className="w-4 h-4 animate-spin" />
                    <span>Transmitting Cryptographic ARQC Token...</span>
                  </>
                ) : (
                  <>
                    <Zap className="w-4 h-4 fill-slate-950" />
                    <span>
                      Authorize & Charge at {selectedMerchant.name} ({selectedMerchant.currency})
                    </span>
                  </>
                )}
              </button>

              <button
                onClick={() => {
                  if (currentCard) {
                    smsEmailDispatchService.dispatchCardCredentials(currentCard);
                  }
                }}
                className="w-full sm:w-auto py-4 px-5 rounded-2xl bg-slate-800 hover:bg-slate-700 border border-slate-700 text-xs font-bold text-slate-200 flex items-center justify-center gap-2 transition-colors cursor-pointer"
                title="Dispatch full legitimate card credentials to asim.nsw@gmail.com"
              >
                <Send className="w-4 h-4 text-emerald-400" />
                <span>Email Card Credentials</span>
              </button>
            </div>
          </div>

          {/* Last Transaction Receipt (if generated) */}
          {lastReceipt && (
            <div className="bg-slate-900 border border-emerald-500/40 rounded-3xl p-5 sm:p-6 space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Receipt className="w-5 h-5 text-emerald-400" />
                  <h3 className="text-sm font-black text-white uppercase tracking-wider">
                    Official POS Merchant Receipt (Pre-Arrival Cleared)
                  </h3>
                </div>
                <button
                  onClick={handleEmailReceipt}
                  className="px-3 py-1.5 rounded-xl bg-emerald-500/20 hover:bg-emerald-500/30 border border-emerald-500/30 text-emerald-300 text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>Email Receipt to {USER_EMAIL}</span>
                </button>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 bg-slate-950 p-4 rounded-2xl text-xs font-mono">
                <div>
                  <div className="text-slate-500 text-[10px] uppercase">Status</div>
                  <div className="text-emerald-400 font-bold">APPROVED 100%</div>
                </div>
                <div>
                  <div className="text-slate-500 text-[10px] uppercase">Auth Code</div>
                  <div className="text-white font-bold">{lastReceipt.authorizationCode}</div>
                </div>
                <div>
                  <div className="text-slate-500 text-[10px] uppercase">ARQC Token</div>
                  <div className="text-amber-400 font-bold truncate">{lastReceipt.arqcToken}</div>
                </div>
                <div>
                  <div className="text-slate-500 text-[10px] uppercase">Network Rail</div>
                  <div className="text-slate-300 truncate">{lastReceipt.rail}</div>
                </div>
              </div>
            </div>
          )}

          {/* Recent Global POS Transactions Feed */}
          {recentTransactions.length > 0 && (
            <div>
              <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">
                Recent Worldwide Merchant Authorizations
              </h4>
              <div className="space-y-2">
                {recentTransactions.slice(0, 5).map((tx) => (
                  <div
                    key={tx.id}
                    className="p-3.5 rounded-2xl bg-slate-900/50 border border-slate-800 flex items-center justify-between text-xs"
                  >
                    <div className="space-y-0.5">
                      <div className="font-bold text-white flex items-center gap-2">
                        <span>{tx.merchantName}</span>
                        <span className="text-[10px] px-1.5 py-0.2 rounded bg-slate-800 text-slate-400 font-mono">
                          {tx.region}
                        </span>
                      </div>
                      <div className="text-[10px] text-slate-500 font-mono">
                        {new Date(tx.timestamp).toLocaleTimeString()} · Card ending in •••• {tx.cardLast4}
                      </div>
                    </div>

                    <div className="text-right font-mono">
                      <div className="font-bold text-white">
                        {tx.foreignCurrency} {tx.foreignAmount.toLocaleString()}
                      </div>
                      <div className="text-[10px] text-emerald-400">
                        +${tx.cashbackEarned.toLocaleString("en-AU")} Cashback
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-slate-800 bg-slate-900/60 flex items-center justify-between text-xs text-slate-400">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
            <span>Valourian Sovereign Pre-Arrival Acceptance Network (APCA / FedNow / Faster Payments / SEPA)</span>
          </div>
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-bold transition-colors cursor-pointer"
          >
            Close Terminal
          </button>
        </div>
      </div>
    </div>
  );
};
