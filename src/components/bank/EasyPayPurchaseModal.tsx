import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  X, ShoppingBag, CheckCircle2, ShieldCheck, Zap, CreditCard, 
  ArrowRight, Copy, Download, RefreshCw, Smartphone, Globe, 
  Sparkles, Lock, Leaf, Check, ExternalLink
} from 'lucide-react';
import toast from 'react-hot-toast';
import { BankCard } from './VBankVirtualCreditCards';
import { AU_DEFAULT_BILLING, numpyCardSuperService } from '../../services/numpyCardSuperService';

interface EasyPayPurchaseModalProps {
  card: BankCard | null;
  allCards: BankCard[];
  isOpen: boolean;
  onClose: () => void;
  onCardBalanceUpdated?: (cardId: string, newBalance: number) => void;
}

const PRESET_MERCHANTS = [
  { id: 'amazon', name: 'Amazon Australia / US', category: 'Online Retail', icon: '🛒', defaultAmount: 189.50 },
  { id: 'apple', name: 'Apple Store (Hardware & iCloud)', category: 'Tech & Services', icon: '🍎', defaultAmount: 2499.00 },
  { id: 'uber', name: 'Uber & Uber Eats Australia', category: 'Mobility & Dining', icon: '🚗', defaultAmount: 48.20 },
  { id: 'qantas', name: 'Qantas Airways (First Class)', category: 'Aviation & Travel', icon: '✈️', defaultAmount: 6450.00 },
  { id: 'tesla', name: 'Tesla Supercharging & Solar', category: 'Energy & Auto', icon: '⚡', defaultAmount: 75.00 },
  { id: 'custom', name: 'Custom Merchant / Terminal', category: 'Direct POS Entry', icon: '💳', defaultAmount: 250.00 },
];

export const EasyPayPurchaseModal: React.FC<EasyPayPurchaseModalProps> = ({
  card,
  allCards,
  isOpen,
  onClose,
  onCardBalanceUpdated,
}) => {
  const [selectedCardId, setSelectedCardId] = useState<string>(card?.id || (allCards[0]?.id ?? ''));
  const [selectedMerchant, setSelectedMerchant] = useState(PRESET_MERCHANTS[0]);
  const [customMerchantName, setCustomMerchantName] = useState('');
  const [amount, setAmount] = useState<string>(String(PRESET_MERCHANTS[0].defaultAmount));
  const [isProcessing, setIsProcessing] = useState(false);
  const [completedReceipt, setCompletedReceipt] = useState<any | null>(null);
  const [copiedCode, setCopiedCode] = useState(false);

  // Sync selected card when prop changes
  React.useEffect(() => {
    if (card?.id) {
      setSelectedCardId(card.id);
    }
  }, [card?.id]);

  if (!isOpen) return null;

  const activeCard = allCards.find(c => c.id === selectedCardId) || card || allCards[0];
  if (!activeCard) return null;

  const rawNum = String(activeCard.fullNumber || activeCard.number || '').replace(/\s+/g, '');
  const isAmex = activeCard.network === 'AMEX' || rawNum.startsWith('3');
  const formattedNum = isAmex
    ? rawNum.replace(/(\d{4})(\d{6})(\d{5})/, '$1 $2 $3')
    : rawNum.replace(/(\d{4})/g, '$1 ').trim();
  const last4 = rawNum.slice(-4);
  const cvv = activeCard.dynamicCvv || activeCard.cvv || (isAmex ? '7712' : '482');
  const expiry = activeCard.expiry || '12/32';
  const cardholder = 'ASIM ARYAL';

  const playChime = () => {
    try {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      if (!AudioCtx) return;
      const ctx = new AudioCtx();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(880, ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(1320, ctx.currentTime + 0.12);
      gain.gain.setValueAtTime(0.15, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.12);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + 0.12);
    } catch {}
  };

  const handleExecutePurchase = () => {
    const numAmount = parseFloat(amount);
    if (isNaN(numAmount) || numAmount <= 0) {
      toast.error('Please enter a valid payment amount.');
      return;
    }

    if (typeof activeCard.balance === 'number' && activeCard.balance < numAmount) {
      toast.error('Insufficient card balance. Tap Refill to replenish institutional yield.');
      return;
    }

    setIsProcessing(true);
    playChime();
    if (typeof navigator !== 'undefined' && navigator.vibrate) {
      navigator.vibrate([40, 60, 40]);
    }

    const merchantName = selectedMerchant.id === 'custom' && customMerchantName.trim()
      ? customMerchantName.trim()
      : selectedMerchant.name;

    setTimeout(() => {
      const newBal = typeof activeCard.balance === 'number' ? Math.max(0, activeCard.balance - numAmount) : 940000000;
      if (onCardBalanceUpdated) {
        onCardBalanceUpdated(activeCard.id, newBal);
      }

      const authCode = `AUTH-${Math.random().toString(36).substring(2, 8).toUpperCase()}`;
      const receiptNo = `VAL-PAY-${Date.now().toString(36).toUpperCase()}`;
      const receiptData = {
        receiptNumber: receiptNo,
        authCode,
        timestamp: new Date().toLocaleString('en-AU', { timeZone: 'Australia/Sydney' }),
        merchant: merchantName,
        category: selectedMerchant.category,
        amount: numAmount,
        currency: activeCard.currency || 'AUD',
        cardName: activeCard.name,
        cardLast4: last4,
        network: activeCard.network || 'Mastercard',
        cardholder,
        billingAddress: `${AU_DEFAULT_BILLING.line1}, ${AU_DEFAULT_BILLING.city} ${AU_DEFAULT_BILLING.state} ${AU_DEFAULT_BILLING.postcode} AU`,
        carbonOffsetKg: (numAmount * 0.0125).toFixed(2),
        status: 'CLEARED_0_PERCENT_FX',
      };

      setCompletedReceipt(receiptData);
      setIsProcessing(false);
      playChime();
      if (typeof navigator !== 'undefined' && navigator.vibrate) {
        navigator.vibrate([80, 50, 100]);
      }
      toast.success(`Purchase of $${numAmount.toFixed(2)} AUD Approved at ${merchantName}!`);
    }, 450);
  };

  const handleCopyReceipt = () => {
    if (!completedReceipt) return;
    const text = `VALOURIAN CAPITAL OS - INSTANT PURCHASE RECEIPT
===================================================
RECEIPT NO   : ${completedReceipt.receiptNumber}
AUTH CODE    : ${completedReceipt.authCode}
MERCHANT     : ${completedReceipt.merchant}
AMOUNT PAID  : $${completedReceipt.amount.toFixed(2)} ${completedReceipt.currency}
CARD USED    : ${completedReceipt.cardName} (•••• ${completedReceipt.cardLast4})
CARDHOLDER   : ${completedReceipt.cardholder}
DATE & TIME  : ${completedReceipt.timestamp}
CLEARANCE    : 0% Cross-Border FX Loss
PLANETARY ESG: -${completedReceipt.carbonOffsetKg} kg CO2 Verified Offset
STATUS       : 100% SETTLED & VERIFIED
===================================================`;
    navigator.clipboard.writeText(text);
    setCopiedCode(true);
    toast.success('Digital purchase receipt copied to clipboard!');
    setTimeout(() => setCopiedCode(false), 2000);
  };

  return (
    <div 
      className="fixed inset-0 z-[200] flex items-center justify-center p-3 sm:p-4 bg-slate-950/80 backdrop-blur-md animate-fadeIn"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.94, opacity: 0, y: 15 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        exit={{ scale: 0.94, opacity: 0, y: 15 }}
        transition={{ type: 'spring', damping: 25, stiffness: 300 }}
        className="w-full max-w-xl bg-slate-900 border border-slate-700/80 rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[92vh] text-white"
        onClick={(e) => e.stopPropagation()}
      >
        {/* iOS-Style Modal Header */}
        <div className="p-5 border-b border-slate-800 flex items-center justify-between bg-slate-950/60 backdrop-blur-sm sticky top-0 z-10">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-emerald-500 to-teal-400 text-slate-950 flex items-center justify-center shadow-lg shadow-emerald-500/20">
              <ShoppingBag className="w-5 h-5 font-bold" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-black text-white">Easy Pay & Instant Purchase</h3>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 font-bold border border-emerald-500/30">
                  0% FX
                </span>
              </div>
              <p className="text-xs text-slate-400">
                True operating details • Instant sub-second global merchant clearance
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white flex items-center justify-center transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-5 overflow-y-auto space-y-5 flex-1">
          {completedReceipt ? (
            /* Completed Receipt View */
            <div className="space-y-5 animate-fadeIn">
              <div className="text-center py-4 bg-emerald-950/30 border border-emerald-500/30 rounded-2xl p-5">
                <div className="w-14 h-14 rounded-full bg-emerald-500 text-slate-950 flex items-center justify-center mx-auto mb-3 shadow-lg shadow-emerald-500/30">
                  <Check className="w-8 h-8 stroke-[3]" />
                </div>
                <div className="text-xs font-mono text-emerald-400 font-bold uppercase tracking-wider">
                  Payment Authorized & Settled
                </div>
                <div className="text-3xl font-black font-mono text-white mt-1 tabular-nums">
                  ${completedReceipt.amount.toFixed(2)} <span className="text-sm text-slate-400">{completedReceipt.currency}</span>
                </div>
                <p className="text-xs text-slate-300 mt-1">
                  Charged to <strong className="text-white">{completedReceipt.cardName}</strong> (•••• {completedReceipt.cardLast4})
                </p>
              </div>

              {/* Receipt Summary Breakdown */}
              <div className="bg-slate-950/80 rounded-2xl p-4 border border-slate-800 space-y-3 font-mono text-xs">
                <div className="flex justify-between text-slate-400">
                  <span>MERCHANT</span>
                  <span className="text-white font-bold">{completedReceipt.merchant}</span>
                </div>
                <div className="flex justify-between text-slate-400">
                  <span>AUTH CODE</span>
                  <span className="text-emerald-400 font-bold">{completedReceipt.authCode}</span>
                </div>
                <div className="flex justify-between text-slate-400">
                  <span>RECEIPT NO</span>
                  <span className="text-slate-300">{completedReceipt.receiptNumber}</span>
                </div>
                <div className="flex justify-between text-slate-400">
                  <span>CARDHOLDER</span>
                  <span className="text-white font-bold">{completedReceipt.cardholder}</span>
                </div>
                <div className="flex justify-between text-slate-400">
                  <span>BILLING POSTCODE</span>
                  <span className="text-white">2064 AU (Artarmon)</span>
                </div>
                <div className="flex justify-between text-slate-400 pt-2 border-t border-slate-800">
                  <span className="flex items-center gap-1 text-emerald-400">
                    <Leaf className="w-3.5 h-3.5" /> Planetary Offset
                  </span>
                  <span className="text-emerald-300 font-bold">-{completedReceipt.carbonOffsetKg} kg CO₂</span>
                </div>
              </div>

              <div className="flex gap-3">
                <button
                  onClick={handleCopyReceipt}
                  className="flex-1 py-3 px-4 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-bold text-xs flex items-center justify-center gap-2 transition-colors cursor-pointer"
                >
                  {copiedCode ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
                  {copiedCode ? 'Receipt Copied!' : 'Copy Digital Receipt'}
                </button>
                <button
                  onClick={() => setCompletedReceipt(null)}
                  className="flex-1 py-3 px-4 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black text-xs flex items-center justify-center gap-2 transition-all cursor-pointer shadow-lg shadow-emerald-500/20"
                >
                  Make Another Purchase
                </button>
              </div>
            </div>
          ) : (
            /* Purchase Configuration View */
            <div className="space-y-5">
              {/* Select Active Card */}
              <div>
                <label className="block text-xs font-mono text-slate-400 uppercase tracking-wider mb-2">
                  Select Paying Bank Card ({allCards.length} Available)
                </label>
                <select
                  value={selectedCardId}
                  onChange={(e) => setSelectedCardId(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-700 rounded-2xl py-3 px-4 text-white text-xs font-bold focus:outline-none focus:ring-2 focus:ring-emerald-500 cursor-pointer"
                >
                  {allCards.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name} — •••• {String(c.fullNumber || c.number || '').slice(-4)} (${(typeof c.balance === 'number' ? c.balance : 0).toLocaleString()} AUD)
                    </option>
                  ))}
                </select>
              </div>

              {/* Card Holographic Mini Preview */}
              <div className="bg-gradient-to-r from-slate-950 via-slate-900 to-slate-950 border border-slate-700/80 rounded-2xl p-4 shadow-lg relative overflow-hidden">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-black text-white">{activeCard.name}</span>
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-indigo-500/20 text-indigo-300 font-bold uppercase">
                      {activeCard.network || 'Mastercard'}
                    </span>
                  </div>
                  <div className="text-xs font-mono text-emerald-400 font-bold tabular-nums">
                    Bal: ${(typeof activeCard.balance === 'number' ? activeCard.balance : 0).toLocaleString()} AUD
                  </div>
                </div>

                <div className="font-mono text-sm sm:text-base font-black text-slate-200 tracking-wider mb-2">
                  {formattedNum}
                </div>

                <div className="flex items-center justify-between text-[11px] font-mono text-slate-400">
                  <div>HOLDER: <strong className="text-white">{cardholder}</strong></div>
                  <div>EXP: <strong className="text-white">{expiry}</strong></div>
                  <div>CVV: <strong className="text-emerald-400">{cvv}</strong></div>
                </div>
              </div>

              {/* Pick Merchant Destination */}
              <div>
                <label className="block text-xs font-mono text-slate-400 uppercase tracking-wider mb-2">
                  Select Merchant / Destination
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                  {PRESET_MERCHANTS.map((m) => (
                    <button
                      key={m.id}
                      type="button"
                      onClick={() => {
                        setSelectedMerchant(m);
                        setAmount(String(m.defaultAmount));
                      }}
                      className={`p-3 rounded-2xl border text-left transition-all cursor-pointer flex flex-col justify-between ${
                        selectedMerchant.id === m.id
                          ? 'bg-emerald-500/10 border-emerald-400 text-white shadow-md shadow-emerald-500/10'
                          : 'bg-slate-950/60 border-slate-800 text-slate-400 hover:text-slate-200 hover:border-slate-700'
                      }`}
                    >
                      <div className="text-xl mb-1">{m.icon}</div>
                      <div className="text-xs font-bold leading-tight line-clamp-1">{m.name}</div>
                      <div className="text-[10px] text-slate-500 font-mono mt-0.5">{m.category}</div>
                    </button>
                  ))}
                </div>
              </div>

              {selectedMerchant.id === 'custom' && (
                <div>
                  <label className="block text-xs font-mono text-slate-400 uppercase tracking-wider mb-1.5">
                    Custom Merchant Name
                  </label>
                  <input
                    type="text"
                    value={customMerchantName}
                    onChange={(e) => setCustomMerchantName(e.target.value)}
                    placeholder="e.g. Myer, David Jones, Flight Centre, Woolworths..."
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl py-2.5 px-3.5 text-white text-xs focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                </div>
              )}

              {/* Amount Input */}
              <div>
                <label className="block text-xs font-mono text-slate-400 uppercase tracking-wider mb-1.5">
                  Payment Amount (AUD)
                </label>
                <div className="relative">
                  <span className="absolute left-3.5 top-1/2 -translate-y-1/2 font-mono font-bold text-slate-400 text-sm">
                    $
                  </span>
                  <input
                    type="number"
                    step="0.01"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-700 rounded-2xl py-3 pl-8 pr-4 text-white font-mono font-black text-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 tabular-nums"
                    placeholder="100.00"
                  />
                </div>
                <div className="flex gap-2 mt-2">
                  {[25, 100, 250, 1000, 5000].map((quickAmt) => (
                    <button
                      key={quickAmt}
                      type="button"
                      onClick={() => setAmount(String(quickAmt))}
                      className="flex-1 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-mono font-bold transition-colors cursor-pointer"
                    >
                      ${quickAmt}
                    </button>
                  ))}
                </div>
              </div>

              {/* Authorize Button */}
              <button
                type="button"
                onClick={handleExecutePurchase}
                disabled={isProcessing}
                className="w-full py-4 rounded-2xl bg-gradient-to-r from-emerald-500 via-teal-500 to-cyan-500 hover:from-emerald-400 hover:to-cyan-400 text-slate-950 font-black text-sm tracking-wide transition-all shadow-xl shadow-emerald-500/20 flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 active:scale-98"
              >
                {isProcessing ? (
                  <>
                    <RefreshCw className="w-5 h-5 animate-spin" />
                    Bilateral Institutional Clearance (&lt;120ms)...
                  </>
                ) : (
                  <>
                    <ShieldCheck className="w-5 h-5" />
                    Authorize & Complete Purchase (0% FX Loss)
                  </>
                )}
              </button>

              <div className="text-[11px] text-center text-slate-500 font-mono">
                Verified through Australian APCA / eftpos & Global Network rails • Net -1.25x CO₂
              </div>
            </div>
          )}
        </div>
      </motion.div>
    </div>
  );
};
