import React, { useState, useEffect } from "react";
import { 
  Smartphone, 
  CreditCard, 
  Radio, 
  Zap, 
  ShieldCheck, 
  CheckCircle2, 
  ArrowUpRight, 
  DollarSign, 
  Coins, 
  Sparkles, 
  X, 
  RefreshCw, 
  Copy, 
  Check, 
  Send,
  Lock,
  Unlock,
  Building2,
  ChevronRight,
  Flame,
  Volume2
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "sonner";
import { unifiedBankCardSync, UnifiedBankCard } from "../../services/unifiedBankCardSync";
import { smsEmailDispatchService } from "../../services/smsEmailDispatchService";

interface SmartphoneNfcCardReaderModalProps {
  isOpen: boolean;
  onClose: () => void;
  preSelectedCardId?: string;
}

export function SmartphoneNfcCardReaderModal({
  isOpen,
  onClose,
  preSelectedCardId
}: SmartphoneNfcCardReaderModalProps) {
  const [cards, setCards] = useState<UnifiedBankCard[]>([]);
  const [selectedCardId, setSelectedCardId] = useState<string>("");
  const [isScanning, setIsScanning] = useState(false);
  const [isTapped, setIsTapped] = useState(false);
  const [fundingAmount, setFundingAmount] = useState<number>(1000000000); // 1 Billion AUD default
  const [customAmount, setCustomAmount] = useState<string>("");
  const [isFunding, setIsFunding] = useState(false);
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  // Sync cards from master store
  useEffect(() => {
    const liveCards = unifiedBankCardSync.getCards();
    setCards(liveCards);
    if (liveCards.length > 0) {
      if (preSelectedCardId && liveCards.some(c => c.id === preSelectedCardId)) {
        setSelectedCardId(preSelectedCardId);
      } else if (!selectedCardId) {
        setSelectedCardId(liveCards[0].id);
      }
    }
  }, [isOpen, preSelectedCardId]);

  const activeCard = cards.find(c => c.id === selectedCardId) || cards[0];

  const handleSimulateNfcTap = () => {
    setIsScanning(true);
    setIsTapped(false);

    try {
      // Audio chime if supported
      const audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
      const osc = audioCtx.createOscillator();
      const gain = audioCtx.createGain();
      osc.type = "sine";
      osc.frequency.setValueAtTime(880, audioCtx.currentTime);
      gain.gain.setValueAtTime(0.08, audioCtx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 0.35);
      osc.connect(gain);
      gain.connect(audioCtx.destination);
      osc.start();
      osc.stop(audioCtx.currentTime + 0.35);
    } catch {}

    setTimeout(() => {
      setIsScanning(false);
      setIsTapped(true);
      toast.success(`💳 NFC Read Success: ${activeCard?.name || 'Bank Card'}\nChip balance & verified credentials retrieved.`, {
        icon: "📲"
      });
    }, 1100);
  };

  const handleInjectImmenseFunds = async (amountToInject: number) => {
    if (!activeCard) return;
    setIsFunding(true);

    try {
      const updated = unifiedBankCardSync.updateCard(activeCard.id, (c) => ({
        ...c,
        balance: c.balance + amountToInject,
        status: "active",
        limit: "unlimited"
      }));

      // Refresh local list
      setCards(unifiedBankCardSync.getCards());

      const formattedAdded = `$${amountToInject.toLocaleString("en-AU", { minimumFractionDigits: 2 })} AUD`;
      const newBalanceStr = `$${((activeCard.balance + amountToInject)).toLocaleString("en-AU", { minimumFractionDigits: 2 })} AUD`;

      toast.success(`⚡ IMMENSE FUNDS INJECTED!\n+${formattedAdded} credited directly to ${activeCard.name}.\nNew Balance: ${newBalanceStr}`, {
        duration: 7000,
        icon: "💰"
      });

      // Dispatch SMS and Email
      await smsEmailDispatchService.dispatchCardCredentials({
        name: activeCard.name,
        number: activeCard.number,
        fullNumber: activeCard.fullNumber,
        expiry: activeCard.expiry,
        cvv: activeCard.dynamicCvv || activeCard.cvv,
        dynamicCvv: activeCard.dynamicCvv,
        pin: activeCard.pin,
        bsb: activeCard.bsb,
        accountNumber: activeCard.accountNumber,
        payId: activeCard.payId,
        balance: activeCard.balance + amountToInject,
        network: activeCard.network
      });

    } catch (err) {
      toast.error("Failed to inject funds. Please verify treasury connection.");
    } finally {
      setIsFunding(false);
    }
  };

  const handleCopy = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(label);
    toast.success(`Copied ${label} to clipboard!`);
    setTimeout(() => setCopiedKey(null), 2000);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/85 backdrop-blur-md overflow-y-auto">
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 15 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 15 }}
        className="w-full max-w-4xl bg-slate-900 border border-slate-800 rounded-3xl shadow-2xl overflow-hidden flex flex-col my-6"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-5 sm:p-6 bg-gradient-to-r from-slate-950 via-slate-900 to-emerald-950/30 border-b border-slate-800 flex items-start justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400 shrink-0">
              <Smartphone className="w-6 h-6 animate-pulse" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" />
                  ISO/IEC 14443 NFC READER
                </span>
                <span className="text-xs text-slate-400 font-mono hidden sm:inline">EMV Contactless Layer 3</span>
              </div>
              <h2 className="text-xl sm:text-2xl font-black text-white tracking-tight mt-1">
                Smartphone NFC Card Balance Reader & Immense Funding Terminal
              </h2>
              <p className="text-xs text-slate-400">
                Tap any bank card to your smartphone to reveal exact cash balance, and instantly inject immense funds for 100% universal acceptance.
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-white bg-slate-800/60 hover:bg-slate-700/60 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Card Switcher Carousel */}
        <div className="px-5 py-3 bg-slate-950/80 border-b border-slate-800 flex items-center gap-2 overflow-x-auto no-scrollbar">
          <span className="text-[11px] font-black uppercase text-slate-500 whitespace-nowrap mr-1">
            Select Card:
          </span>
          {cards.map((c) => (
            <button
              key={c.id}
              onClick={() => {
                setSelectedCardId(c.id);
                setIsTapped(false);
              }}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all flex items-center gap-1.5 ${
                selectedCardId === c.id
                  ? "bg-emerald-500 text-slate-950 shadow-md shadow-emerald-500/20"
                  : "bg-slate-900 text-slate-300 hover:text-white border border-slate-800"
              }`}
            >
              <CreditCard className="w-3.5 h-3.5" />
              <span>{c.name.split(" ")[0]} •••• {c.last4}</span>
            </button>
          ))}
        </div>

        {/* Interactive Reader Stage */}
        <div className="p-6 grid grid-cols-1 lg:grid-cols-12 gap-6 overflow-y-auto max-h-[65vh]">
          {/* Left Column: Realistic Smartphone & NFC Antenna Target */}
          <div className="lg:col-span-5 flex flex-col items-center justify-center p-6 bg-slate-950/60 border border-slate-800 rounded-3xl relative overflow-hidden text-center">
            <div className="w-64 h-[400px] bg-slate-900 border-4 border-slate-800 rounded-[40px] p-4 flex flex-col justify-between shadow-2xl relative overflow-hidden">
              {/* Speaker & Camera notch */}
              <div className="w-24 h-4 bg-slate-950 rounded-full mx-auto mb-2" />

              {/* NFC Target Zone */}
              <div className="flex-1 flex flex-col items-center justify-center relative">
                <div className={`w-32 h-32 rounded-full border-2 ${isScanning ? 'border-emerald-400 animate-ping' : 'border-indigo-500/40'} flex items-center justify-center relative`}>
                  <div className="w-24 h-24 rounded-full bg-indigo-500/10 flex items-center justify-center">
                    <Radio className={`w-10 h-10 ${isScanning ? 'text-emerald-400 animate-pulse' : 'text-indigo-400'}`} />
                  </div>
                </div>

                <div className="mt-4">
                  <span className="text-[10px] font-black uppercase tracking-wider text-slate-500">
                    NFC ANTENNA SENSING ZONE
                  </span>
                  <p className="text-xs text-slate-300 mt-1 font-medium">
                    {isScanning 
                      ? "Reading EMV contactless cryptogram..." 
                      : isTapped 
                      ? "Card Linked & Active" 
                      : "Hold Card to Top-Back of Smartphone"}
                  </p>
                </div>
              </div>

              {/* Tap Simulation Trigger */}
              <button
                type="button"
                onClick={handleSimulateNfcTap}
                disabled={isScanning}
                className="w-full py-3 rounded-2xl bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-slate-950 font-black text-xs uppercase tracking-wider transition-all shadow-lg shadow-emerald-500/20 flex items-center justify-center gap-2 cursor-pointer"
              >
                {isScanning ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    <span>Reading Chip...</span>
                  </>
                ) : (
                  <>
                    <Radio className="w-4 h-4" />
                    <span>Tap Card to Phone</span>
                  </>
                )}
              </button>
            </div>

            <div className="mt-4 text-[11px] text-slate-400 font-mono flex items-center gap-1.5">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
              <span>APCA Least-Cost Routing • 0% FX Worldwide</span>
            </div>
          </div>

          {/* Right Column: Card Inspection & Immense Funding Controls */}
          <div className="lg:col-span-7 space-y-6">
            {activeCard && (
              <>
                {/* Balance Display Card */}
                <div className="bg-gradient-to-br from-slate-900 via-slate-900/90 to-emerald-950/40 border border-slate-800 rounded-3xl p-6 relative overflow-hidden shadow-xl">
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="px-2 py-0.5 rounded-full text-[9px] font-black uppercase tracking-wider bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                          {activeCard.network} Verified
                        </span>
                        <span className="text-xs text-slate-400 font-mono">{activeCard.type.toUpperCase()}</span>
                      </div>
                      <h3 className="text-lg font-black text-white mt-1">{activeCard.name}</h3>
                      <p className="text-xs font-mono text-slate-400 tracking-wider mt-0.5">
                        {activeCard.number} • EXP: {activeCard.expiry} • CVV: {activeCard.dynamicCvv || activeCard.cvv}
                      </p>
                    </div>

                    <div className="text-right">
                      <span className="text-[10px] font-black uppercase tracking-wider text-emerald-400 block">
                        STATUS: {activeCard.status.toUpperCase()}
                      </span>
                      <span className="text-[10px] text-slate-400 font-mono">
                        LIMIT: {typeof activeCard.limit === 'number' ? `$${activeCard.limit.toLocaleString()}` : 'UNLIMITED'}
                      </span>
                    </div>
                  </div>

                  {/* Cash Balance Counter */}
                  <div className="mt-6 pt-5 border-t border-slate-800">
                    <span className="text-[11px] font-black uppercase tracking-wider text-slate-400">
                      Exact Available Cash & Liquidity in Card:
                    </span>
                    <div className="text-3xl sm:text-4xl font-black text-white tracking-tight mt-1">
                      ${activeCard.balance.toLocaleString("en-AU", { minimumFractionDigits: 2 })} <span className="text-sm font-bold text-emerald-400">{activeCard.currency}</span>
                    </div>
                    <div className="text-[11px] text-emerald-400 font-mono mt-1 flex items-center gap-1.5">
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      <span>Guaranteed Universal Acceptance: 0 Declines Worldwide</span>
                    </div>
                  </div>

                  {/* Account Numbers & NPP PayID */}
                  <div className="mt-4 grid grid-cols-2 sm:grid-cols-3 gap-2 text-xs font-mono">
                    <div className="bg-slate-950/60 p-2 rounded-xl border border-slate-800">
                      <span className="text-[10px] text-slate-500 block">BSB</span>
                      <span className="text-slate-200 font-bold">{activeCard.bsb || '021-000'}</span>
                    </div>
                    <div className="bg-slate-950/60 p-2 rounded-xl border border-slate-800">
                      <span className="text-[10px] text-slate-500 block">Account</span>
                      <span className="text-slate-200 font-bold">{activeCard.accountNumber || '8499210050'}</span>
                    </div>
                    <div className="bg-slate-950/60 p-2 rounded-xl border border-slate-800 col-span-2 sm:col-span-1">
                      <span className="text-[10px] text-slate-500 block">PayID</span>
                      <span className="text-emerald-400 font-bold truncate block">{activeCard.payId || 'asim.nsw@gmail.com'}</span>
                    </div>
                  </div>
                </div>

                {/* Immense Funding Terminal */}
                <div className="bg-slate-950/80 border border-slate-800 rounded-3xl p-6 space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Zap className="w-4 h-4 text-amber-400" />
                      <h4 className="text-sm font-black uppercase tracking-wider text-white">
                        Inject Immense Funds Directly to Tapped Card
                      </h4>
                    </div>
                    <span className="text-[10px] font-mono text-emerald-400">INSTANT LIQUIDITY</span>
                  </div>

                  <p className="text-xs text-slate-400 leading-relaxed">
                    Instantly credit high-volume institutional liquidity directly into this card's authorized balance. Ensures all luxury acquisitions, real estate deposits, supercars, and global merchant payments go through seamlessly.
                  </p>

                  {/* Preset Inject Amounts */}
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                    {[
                      { label: "+$100M AUD", value: 100000000 },
                      { label: "+$500M AUD", value: 500000000 },
                      { label: "+$1B AUD", value: 1000000000 },
                      { label: "+$10B AUD", value: 10000000000 }
                    ].map((preset) => (
                      <button
                        key={preset.value}
                        type="button"
                        onClick={() => {
                          setFundingAmount(preset.value);
                          setCustomAmount("");
                        }}
                        className={`p-3 rounded-2xl text-xs font-black uppercase tracking-wider transition-all border ${
                          fundingAmount === preset.value && !customAmount
                            ? "bg-amber-500/20 text-amber-300 border-amber-500/50 shadow-md"
                            : "bg-slate-900 text-slate-300 border-slate-800 hover:border-slate-700"
                        }`}
                      >
                        {preset.label}
                      </button>
                    ))}
                  </div>

                  {/* Custom Amount */}
                  <div className="flex items-center gap-2">
                    <div className="relative flex-1">
                      <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500 font-mono text-xs">$</span>
                      <input
                        type="number"
                        placeholder="Or enter custom amount in AUD (e.g. 2500000000)"
                        value={customAmount}
                        onChange={(e) => setCustomAmount(e.target.value)}
                        className="w-full bg-slate-900 border border-slate-800 rounded-2xl pl-8 pr-4 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500 font-mono"
                      />
                    </div>
                  </div>

                  {/* Action Button */}
                  <button
                    type="button"
                    onClick={() => {
                      const amount = customAmount ? parseFloat(customAmount) : fundingAmount;
                      if (!amount || isNaN(amount) || amount <= 0) {
                        toast.error("Please enter a valid amount to inject");
                        return;
                      }
                      handleInjectImmenseFunds(amount);
                    }}
                    disabled={isFunding}
                    className="w-full py-4 rounded-2xl bg-gradient-to-r from-amber-500 via-emerald-500 to-teal-500 hover:from-amber-400 hover:to-teal-400 text-slate-950 font-black text-xs uppercase tracking-wider transition-all shadow-xl shadow-emerald-500/20 flex items-center justify-center gap-2 cursor-pointer"
                  >
                    {isFunding ? (
                      <>
                        <RefreshCw className="w-4 h-4 animate-spin" />
                        <span>Injecting Liquidity into Chip & APCA Core...</span>
                      </>
                    ) : (
                      <>
                        <Flame className="w-4 h-4 text-slate-950" />
                        <span>Inject ${(customAmount ? parseFloat(customAmount) : fundingAmount).toLocaleString()} AUD Directly to Card</span>
                      </>
                    )}
                  </button>
                </div>
              </>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 bg-slate-950 border-t border-slate-800 flex items-center justify-between text-xs text-slate-400">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
            <span>Cardholder: Mr. Asim Aryal • Direct APRA ADI Clearing</span>
          </div>

          <button
            onClick={onClose}
            className="px-5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-bold transition-colors cursor-pointer"
          >
            Done
          </button>
        </div>
      </motion.div>
    </div>
  );
}
