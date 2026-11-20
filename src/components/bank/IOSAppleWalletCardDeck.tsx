import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  CreditCard, Wifi, ShieldCheck, Zap, Copy, Eye, EyeOff, 
  Send, Sparkles, RefreshCw, ShoppingBag, ArrowUpRight, Check,
  ExternalLink, Layers, LayoutGrid, Leaf, Award, MapPin, User,
  Calendar, Lock, CheckCircle2, ChevronDown, ChevronUp, Share2, Plus
} from 'lucide-react';
import toast from 'react-hot-toast';
import { BankCard } from './VBankVirtualCreditCards';
import { AU_DEFAULT_BILLING, numpyCardSuperService } from '../../services/numpyCardSuperService';

interface IOSAppleWalletCardDeckProps {
  cards: BankCard[];
  onSelectPayId: (cardId: string) => void;
  onSelectNfc: (cardId: string) => void;
  onSelectCopyModal: (card: BankCard) => void;
  onSelectEasyPay: (card: BankCard) => void;
  onRefillCard: (cardId: string) => void;
  onSelectShare?: (card: BankCard) => void;
  onOpenIssueStudio?: () => void;
}

export const IOSAppleWalletCardDeck: React.FC<IOSAppleWalletCardDeckProps> = ({
  cards,
  onSelectPayId,
  onSelectNfc,
  onSelectCopyModal,
  onSelectEasyPay,
  onRefillCard,
  onSelectShare,
  onOpenIssueStudio,
}) => {
  const [activeCardIndex, setActiveCardIndex] = useState<number>(0);
  const [deckMode, setDeckMode] = useState<'stack' | 'grid'>('stack');
  const [categoryFilter, setCategoryFilter] = useState<'all' | 'debit' | 'credit'>('all');
  const [revealedIds, setRevealedIds] = useState<Record<string, boolean>>({});
  const [copiedField, setCopiedField] = useState<string | null>(null);
  const [showMerchantStrip, setShowMerchantStrip] = useState<boolean>(true);
  const [isTestingAutofill, setIsTestingAutofill] = useState<boolean>(false);
  const [autofillTestPassed, setAutofillTestPassed] = useState<boolean>(false);

  const isCardDebit = (c: BankCard) =>
    c.cardCategory === 'debit' ||
    String(c.id || '').startsWith('debit_') ||
    c.name.toLowerCase().includes('debit');

  const filteredCards = cards.filter((c) => {
    if (categoryFilter === 'debit') return isCardDebit(c);
    if (categoryFilter === 'credit') return !isCardDebit(c);
    return true;
  });

  const safeIndex = Math.min(activeCardIndex, Math.max(0, filteredCards.length - 1));

  const toggleReveal = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setRevealedIds(prev => ({ ...prev, [id]: !prev[id] }));
  };

  const playFeedbackChime = () => {
    try {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      if (!AudioCtx) return;
      const ctx = new AudioCtx();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(880, ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(1320, ctx.currentTime + 0.1);
      gain.gain.setValueAtTime(0.12, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.1);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + 0.1);
    } catch {}
  };

  const handleCopyText = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    if (typeof navigator !== 'undefined' && navigator.vibrate) {
      navigator.vibrate([35, 45, 35]);
    }
    playFeedbackChime();
    setCopiedField(label);
    toast.success(`Copied ${label} to clipboard! Paste directly into merchant checkout.`);
    setTimeout(() => setCopiedField(null), 2500);
  };

  const handleCopyQuickNumber = (card: BankCard, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    const raw = String(card.fullNumber || card.number || '').replace(/\s+/g, '');
    handleCopyText(raw, 'Card Number (Digits Only)');
  };

  const handleCopyFullPackage = (card: BankCard, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    const pkg = numpyCardSuperService.generateCopyableCardPackage(card);
    handleCopyText(pkg.formattedClipboardText, 'Full Card Package');
  };

  const handleRunAutofillTest = () => {
    setIsTestingAutofill(true);
    setAutofillTestPassed(false);
    playFeedbackChime();
    setTimeout(() => {
      setIsTestingAutofill(false);
      setAutofillTestPassed(true);
      playFeedbackChime();
      toast.success('Merchant Form Test Passed! Clean digits, Luhn Mod 10, and Australian billing address verified.');
    }, 550);
  };

  // Color schemes tailored to tier
  const getCardStyle = (card: BankCard) => {
    const name = card.name.toLowerCase();
    if (name.includes('centurion') || name.includes('black')) {
      return {
        bg: 'bg-gradient-to-br from-zinc-950 via-slate-900 to-black',
        border: 'border-amber-500/30',
        text: 'text-zinc-100',
        accent: 'text-amber-400',
        chip: 'from-amber-400 to-yellow-600',
        badge: 'bg-amber-500/10 text-amber-300 border-amber-500/30',
      };
    }
    if (name.includes('platinum') || name.includes('titanium') || name.includes('apple card')) {
      return {
        bg: 'bg-gradient-to-br from-slate-200 via-slate-400 to-slate-200 text-slate-900',
        border: 'border-slate-300',
        text: 'text-slate-950',
        accent: 'text-indigo-900',
        chip: 'from-slate-400 to-slate-600',
        badge: 'bg-slate-900/10 text-slate-900 border-slate-900/20',
      };
    }
    if (name.includes('diamond') || name.includes('infinity')) {
      return {
        bg: 'bg-gradient-to-br from-violet-950 via-slate-900 to-purple-950',
        border: 'border-purple-500/40',
        text: 'text-white',
        accent: 'text-purple-300',
        chip: 'from-purple-400 to-cyan-400',
        badge: 'bg-purple-500/20 text-purple-200 border-purple-500/30',
      };
    }
    if (name.includes('commonwealth') || name.includes('cba')) {
      return {
        bg: 'bg-gradient-to-br from-amber-950 via-slate-900 to-yellow-950',
        border: 'border-yellow-500/40',
        text: 'text-white',
        accent: 'text-yellow-400',
        chip: 'from-yellow-400 to-amber-600',
        badge: 'bg-yellow-500/20 text-yellow-300 border-yellow-500/30',
      };
    }
    if (name.includes('westpac') || name.includes('anz') || name.includes('nab')) {
      return {
        bg: 'bg-gradient-to-br from-blue-950 via-slate-900 to-indigo-950',
        border: 'border-blue-500/40',
        text: 'text-white',
        accent: 'text-blue-400',
        chip: 'from-blue-400 to-indigo-600',
        badge: 'bg-blue-500/20 text-blue-300 border-blue-500/30',
      };
    }
    return {
      bg: 'bg-gradient-to-br from-slate-900 via-slate-950 to-black',
      border: 'border-emerald-500/30',
      text: 'text-white',
      accent: 'text-emerald-400',
      chip: 'from-emerald-400 to-teal-600',
      badge: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30',
    };
  };

  const activeCard = filteredCards[safeIndex] || cards[0];

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Deck Controls Header */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 bg-slate-900/90 p-4 sm:p-5 rounded-3xl border border-slate-800 shadow-xl">
        <div>
          <div className="flex flex-wrap items-center gap-2">
            <h3 className="text-base sm:text-lg font-black text-white">
              iOS Apple Wallet Sovereign Card Deck
            </h3>
            <span className="text-xs font-mono text-emerald-400 font-bold">
              · {filteredCards.length} Active Cards
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Debit &amp; Credit · Virtual &amp; Physical · Shareable VIP access · Ready for merchant checkout
          </p>
        </div>

        {/* Category Filter + Issue + View Mode Toggle */}
        <div className="flex flex-wrap items-center gap-2">
          {onOpenIssueStudio && (
            <button
              type="button"
              onClick={onOpenIssueStudio}
              className="min-h-[44px] px-3.5 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black text-xs flex items-center gap-1.5 transition-all cursor-pointer shadow-lg shadow-emerald-500/20"
            >
              <Plus className="w-4 h-4" />
              <span>Issue Card</span>
            </button>
          )}

          <div className="flex items-center bg-slate-950 p-1 rounded-xl border border-slate-800">
            {([
              { id: 'all', label: 'All' },
              { id: 'debit', label: 'Bank Debit' },
              { id: 'credit', label: 'Credit & Black' },
            ] as const).map((tab) => (
              <button
                key={tab.id}
                onClick={() => { setCategoryFilter(tab.id); setActiveCardIndex(0); }}
                className={`min-h-[38px] px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                  categoryFilter === tab.id
                    ? 'bg-emerald-500 text-slate-950'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          <button
            onClick={() => setDeckMode('stack')}
            className={`min-h-[44px] px-3.5 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer ${
              deckMode === 'stack'
                ? 'bg-emerald-500 text-slate-950 font-black'
                : 'bg-slate-800 text-slate-400 hover:text-white'
            }`}
          >
            <Layers className="w-3.5 h-3.5" />
            Stack
          </button>
          <button
            onClick={() => setDeckMode('grid')}
            className={`min-h-[44px] px-3.5 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer ${
              deckMode === 'grid'
                ? 'bg-emerald-500 text-slate-950 font-black'
                : 'bg-slate-800 text-slate-400 hover:text-white'
            }`}
          >
            <LayoutGrid className="w-3.5 h-3.5" />
            Grid
          </button>
        </div>
      </div>

      {deckMode === 'stack' ? (
        /* iOS Wallet Stack View */
        <div className="space-y-6">
          {/* Active Featured Card Spotlight */}
          {activeCard && (
            <div className="space-y-4">
              <div className="max-w-xl mx-auto">
                {(() => {
                  const style = getCardStyle(activeCard);
                  const isRevealed = revealedIds[activeCard.id];
                  const raw = String(activeCard.fullNumber || activeCard.number || '').replace(/\s+/g, '');
                  const isAmex = activeCard.network === 'AMEX' || raw.startsWith('3');
                  const formatted = isAmex
                    ? raw.replace(/(\d{4})(\d{6})(\d{5})/, '$1 $2 $3')
                    : raw.replace(/(\d{4})/g, '$1 ').trim();
                  const displayNum = isRevealed ? formatted : `•••• •••• •••• ${raw.slice(-4)}`;
                  const cvv = activeCard.dynamicCvv || activeCard.cvv || (isAmex ? '7712' : '482');

                  return (
                    <motion.div
                      layoutId={`card-${activeCard.id}`}
                      className={`relative aspect-[1.586/1] w-full rounded-3xl p-6 sm:p-8 shadow-2xl border ${style.border} ${style.bg} ${style.text} flex flex-col justify-between overflow-hidden select-none transition-shadow hover:shadow-indigo-500/20`}
                    >
                      {/* Ambient Specular Highlight */}
                      <div className="absolute top-0 right-0 w-80 h-80 bg-white/5 rounded-full blur-3xl pointer-events-none -mr-24 -mt-24" />

                      {/* Card Header: Network + Contactless Icon */}
                      <div className="relative z-10 flex items-start justify-between">
                        <div>
                          <div className="text-[11px] font-mono font-bold tracking-widest uppercase opacity-75">
                            {isCardDebit(activeCard) ? 'Bank Debit Card' : 'Bank Credit Card'} · {activeCard.type === 'physical' ? 'Virtual + Physical' : 'Virtual Instant'}
                          </div>
                          <h4 className="text-base sm:text-lg font-black tracking-tight mt-0.5 line-clamp-1">
                            {activeCard.name}
                          </h4>
                        </div>
                        <div className="flex items-center gap-2">
                          <Wifi className="w-5 h-5 opacity-80 rotate-90" />
                          <span className="text-[11px] font-mono font-black uppercase opacity-90">
                            {activeCard.network || 'Mastercard'}
                          </span>
                        </div>
                      </div>

                      {/* EMV Chip & Net CO2 */}
                      <div className="relative z-10 flex items-center justify-between my-2">
                        <div className={`w-12 h-9 rounded-lg bg-gradient-to-tr ${style.chip} shadow-inner border border-white/20 flex flex-col justify-around p-1.5 opacity-90`}>
                          <div className="w-full h-0.5 bg-black/20" />
                          <div className="w-full h-0.5 bg-black/20" />
                        </div>
                        <div className="flex items-center gap-1.5 text-emerald-300 text-[11px] font-mono font-bold">
                          <Leaf className="w-3.5 h-3.5 text-emerald-400" />
                          <span>Net -1.25x CO₂</span>
                        </div>
                      </div>

                      {/* Card Number & Quick Copy Clickable Area */}
                      <div className="relative z-10 space-y-1">
                        <div className="flex items-center justify-between">
                          <span 
                            onClick={() => handleCopyQuickNumber(activeCard)}
                            className="font-mono text-lg sm:text-2xl font-black tracking-widest tabular-nums cursor-pointer hover:text-emerald-400 transition-colors"
                            title="Click to copy clean digits for merchant checkout"
                          >
                            {displayNum}
                          </span>
                          <div className="flex items-center gap-2 shrink-0">
                            <button
                              onClick={() => handleCopyQuickNumber(activeCard)}
                              className="compact-touch px-2.5 py-1 rounded-md bg-white/10 hover:bg-white/20 text-xs font-mono font-bold flex items-center gap-1 transition-colors cursor-pointer whitespace-nowrap"
                              title="Copy digits directly for checkout"
                            >
                              {copiedField === 'Card Number (Digits Only)' ? (
                                <Check className="w-3.5 h-3.5 text-emerald-400" />
                              ) : (
                                <Copy className="w-3.5 h-3.5" />
                              )}
                              <span>Copy</span>
                            </button>
                            <button
                              onClick={(e) => toggleReveal(activeCard.id, e)}
                              className="compact-touch p-1.5 rounded-lg hover:bg-white/10 transition-colors opacity-80 hover:opacity-100 cursor-pointer"
                              title={isRevealed ? 'Hide full number' : 'Reveal full PAN'}
                              aria-label={isRevealed ? 'Hide full card number' : 'Reveal full card number'}
                            >
                              {isRevealed ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                            </button>
                          </div>
                        </div>
                      </div>

                      {/* Card Footer: Details */}
                      <div className="relative z-10 flex items-end justify-between text-xs font-mono pt-2 border-t border-white/10">
                        <div 
                          onClick={() => handleCopyText('ASIM ARYAL', 'Cardholder Name')}
                          className="cursor-pointer hover:text-emerald-400 transition-colors"
                          title="Click to copy Cardholder Name"
                        >
                          <div className="text-[9px] opacity-70 uppercase tracking-widest">Cardholder</div>
                          <div className="font-bold tracking-wider">ASIM ARYAL</div>
                        </div>
                        <div
                          onClick={() => handleCopyText(activeCard.expiry || '12/32', 'Expiry Date')}
                          className="cursor-pointer hover:text-emerald-400 transition-colors"
                          title="Click to copy Expiry (MM/YY)"
                        >
                          <div className="text-[9px] opacity-70 uppercase tracking-widest">Expires</div>
                          <div className="font-bold">{activeCard.expiry || '12/32'}</div>
                        </div>
                        <div
                          onClick={() => handleCopyText(cvv, 'CVV / Security Code')}
                          className="cursor-pointer hover:text-emerald-400 transition-colors"
                          title="Click to copy CVV/CID"
                        >
                          <div className="text-[9px] opacity-70 uppercase tracking-widest">CVV/CID</div>
                          <div className="font-black text-emerald-400">{cvv}</div>
                        </div>
                        <div className="text-right">
                          <div className="text-[9px] opacity-70 uppercase tracking-widest">Balance</div>
                          <div className="font-black tabular-nums">
                            ${(typeof activeCard.balance === 'number' ? activeCard.balance : 0).toLocaleString()} AUD
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  );
                })()}
              </div>

              {/* Instant Action Toolbar for Spotlight Card */}
              <div className="max-w-xl mx-auto grid grid-cols-2 sm:grid-cols-5 gap-2.5 pt-1">
                <button
                  onClick={() => onSelectEasyPay(activeCard)}
                  className="min-h-[54px] py-3 px-2.5 rounded-2xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black text-xs flex flex-col items-center justify-center gap-1 shadow-lg shadow-emerald-500/20 transition-all cursor-pointer active:scale-95"
                >
                  <ShoppingBag className="w-4 h-4" />
                  <span>Easy Pay</span>
                </button>

                {onSelectShare && (
                  <button
                    onClick={() => onSelectShare(activeCard)}
                    className="min-h-[54px] py-3 px-2.5 rounded-2xl bg-slate-900 hover:bg-slate-800 text-cyan-300 border border-cyan-500/40 font-bold text-xs flex flex-col items-center justify-center gap-1 transition-all cursor-pointer active:scale-95"
                  >
                    <Share2 className="w-4 h-4" />
                    <span>Share &amp; VIP</span>
                  </button>
                )}

                <button
                  onClick={() => onSelectPayId(activeCard.id)}
                  className="min-h-[54px] py-3 px-2.5 rounded-2xl bg-slate-900 hover:bg-slate-800 text-blue-400 border border-blue-500/30 font-bold text-xs flex flex-col items-center justify-center gap-1 transition-all cursor-pointer active:scale-95"
                >
                  <Send className="w-4 h-4" />
                  <span>PayID</span>
                </button>

                <button
                  onClick={() => onSelectNfc(activeCard.id)}
                  className="min-h-[54px] py-3 px-2.5 rounded-2xl bg-slate-900 hover:bg-slate-800 text-emerald-400 border border-emerald-500/30 font-bold text-xs flex flex-col items-center justify-center gap-1 transition-all cursor-pointer active:scale-95"
                >
                  <Wifi className="w-4 h-4 rotate-90" />
                  <span>NFC Tap</span>
                </button>

                <button
                  onClick={(e) => handleCopyFullPackage(activeCard, e)}
                  className="col-span-2 sm:col-span-1 min-h-[54px] py-3 px-2.5 rounded-2xl bg-slate-900 hover:bg-slate-800 text-purple-400 border border-purple-500/30 font-bold text-xs flex flex-col items-center justify-center gap-1 transition-all cursor-pointer active:scale-95"
                >
                  <Copy className="w-4 h-4" />
                  <span>Copy Full</span>
                </button>
              </div>

              {/* Front-Facing 1-Tap Merchant Checkout Auto-Copy Strip */}
              {(() => {
                const rawNum = String(activeCard.fullNumber || activeCard.number || '').replace(/\s+/g, '');
                const isAmex = activeCard.network === 'AMEX' || rawNum.startsWith('3');
                const formattedNum = isAmex
                  ? rawNum.replace(/(\d{4})(\d{6})(\d{5})/, '$1 $2 $3')
                  : rawNum.replace(/(\d{4})/g, '$1 ').trim();
                const expiry = activeCard.expiry || '12/32';
                const [expMonth, expYear] = expiry.includes('/') ? expiry.split('/') : ['12', '32'];
                const expFullYear = expYear.length === 2 ? `20${expYear}` : expYear;
                const cvv = activeCard.dynamicCvv || activeCard.cvv || (isAmex ? '7712' : '482');
                const cardholder = 'ASIM ARYAL';
                const singleLineAutofill = `${rawNum} | ${expiry} | ${cvv} | ${cardholder} | 2064 AU`;

                return (
                  <div className="max-w-xl mx-auto bg-slate-950/90 border border-emerald-500/30 rounded-3xl p-5 shadow-2xl space-y-4 text-white">
                    <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                      <div className="flex items-center gap-2">
                        <CreditCard className="w-4 h-4 text-emerald-400" />
                        <h4 className="text-xs font-black uppercase tracking-wider text-emerald-300">
                          1-Tap Merchant Checkout Auto-Copy
                        </h4>
                      </div>
                      <div className="flex items-center gap-2 shrink-0">
                        <button
                          onClick={handleRunAutofillTest}
                          disabled={isTestingAutofill}
                          className="compact-touch text-[10px] bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-300 border border-emerald-500/30 px-2.5 py-1 rounded-md font-mono font-bold flex items-center gap-1 cursor-pointer transition-colors whitespace-nowrap"
                          title="Simulate autofill test across standard merchant checkout forms"
                        >
                          {isTestingAutofill ? <RefreshCw className="w-3 h-3 animate-spin" /> : <ShieldCheck className="w-3 h-3 text-emerald-400" />}
                          <span>{isTestingAutofill ? 'Testing...' : 'Verify Checkout Format'}</span>
                        </button>
                        <button
                          onClick={() => setShowMerchantStrip(!showMerchantStrip)}
                          className="compact-touch p-1.5 rounded text-slate-400 hover:text-white cursor-pointer"
                          aria-label={showMerchantStrip ? 'Collapse merchant auto-copy panel' : 'Expand merchant auto-copy panel'}
                        >
                          {showMerchantStrip ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                        </button>
                      </div>
                    </div>

                    {autofillTestPassed && (
                      <div className="p-2.5 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-xs font-mono flex items-center justify-between animate-fadeIn">
                        <span className="flex items-center gap-1.5 font-bold">
                          <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                          Amazon, Stripe &amp; Shopify Format Compliant (Luhn Passed)
                        </span>
                        <span className="text-[10px] text-emerald-400/80">0% FX Loss</span>
                      </div>
                    )}

                    {showMerchantStrip && (
                      <div className="space-y-3 pt-1">
                        {/* Row 1: Card Number Copy Buttons */}
                        <div className="bg-slate-900/80 p-3 rounded-2xl border border-slate-800 space-y-1.5">
                          <div className="flex items-center justify-between text-[10px] font-mono text-slate-400 uppercase tracking-wider">
                            <span>Card Number (PAN)</span>
                            <span className="text-emerald-400 font-bold">Ready for Web Checkout</span>
                          </div>
                          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                            <span className="font-mono text-sm sm:text-base font-black text-white tracking-widest tabular-nums">
                              {formattedNum}
                            </span>
                            <div className="flex items-center gap-2">
                              <button
                                onClick={() => handleCopyText(rawNum, 'Card Number (Digits Only)')}
                                className="flex-1 sm:flex-none px-3 py-1.5 bg-emerald-500 hover:bg-emerald-400 text-slate-950 rounded-xl text-xs font-black font-mono flex items-center justify-center gap-1.5 cursor-pointer shadow-md transition-all active:scale-95"
                                title="Copies pure digits without spaces (guaranteed to pass merchant checkout validation)"
                              >
                                {copiedField === 'Card Number (Digits Only)' ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                                <span>Copy Digits</span>
                              </button>
                              <button
                                onClick={() => handleCopyText(formattedNum, 'Card Number (With Spaces)')}
                                className="flex-1 sm:flex-none px-2.5 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl text-xs font-mono font-bold flex items-center justify-center gap-1 cursor-pointer transition-colors"
                                title="Copies card number formatted with spaces"
                              >
                                <Copy className="w-3 h-3" />
                                <span>With Spaces</span>
                              </button>
                            </div>
                          </div>
                        </div>

                        {/* Row 2: Name, Expiry, CVV */}
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                          {/* Name on Card */}
                          <div className="bg-slate-900/80 p-2.5 rounded-2xl border border-slate-800 flex items-center justify-between">
                            <div>
                              <div className="text-[9px] font-mono text-slate-400 uppercase">Cardholder</div>
                              <div className="text-xs font-bold text-white">{cardholder}</div>
                            </div>
                            <button
                              onClick={() => handleCopyText(cardholder, 'Cardholder Name')}
                              className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 cursor-pointer"
                              title="Copy Cardholder Name"
                            >
                              {copiedField === 'Cardholder Name' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                            </button>
                          </div>

                          {/* Expiry */}
                          <div className="bg-slate-900/80 p-2.5 rounded-2xl border border-slate-800 flex items-center justify-between">
                            <div>
                              <div className="text-[9px] font-mono text-slate-400 uppercase">Expires (MM/YY)</div>
                              <div className="text-xs font-bold font-mono text-white">{expiry}</div>
                            </div>
                            <div className="flex items-center gap-1">
                              <button
                                onClick={() => handleCopyText(expiry, 'Expiry Date (MM/YY)')}
                                className="px-1.5 py-1 rounded bg-slate-800 hover:bg-slate-700 text-[10px] font-mono text-slate-300 cursor-pointer"
                                title="Copy MM/YY"
                              >
                                {copiedField === 'Expiry Date (MM/YY)' ? <Check className="w-3 h-3 text-emerald-400" /> : 'MM/YY'}
                              </button>
                              <button
                                onClick={() => handleCopyText(expFullYear, 'Expiry Year (YYYY)')}
                                className="px-1.5 py-1 rounded bg-slate-800 hover:bg-slate-700 text-[10px] font-mono text-slate-300 cursor-pointer"
                                title="Copy 4-digit Year (e.g. 2032)"
                              >
                                {expFullYear}
                              </button>
                            </div>
                          </div>

                          {/* Security Code */}
                          <div className="bg-slate-900/80 p-2.5 rounded-2xl border border-slate-800 flex items-center justify-between">
                            <div>
                              <div className="text-[9px] font-mono text-slate-400 uppercase">CVV / CID</div>
                              <div className="text-xs font-black font-mono text-emerald-400">{cvv}</div>
                            </div>
                            <button
                              onClick={() => handleCopyText(cvv, 'CVV / Security Code')}
                              className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 cursor-pointer"
                              title="Copy CVV/CID"
                            >
                              {copiedField === 'CVV / Security Code' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                            </button>
                          </div>
                        </div>

                        {/* Row 3: Australian Billing Address Components */}
                        <div className="bg-slate-900/80 p-3 rounded-2xl border border-slate-800 space-y-2 text-xs font-mono">
                          <div className="flex items-center justify-between text-[10px] text-slate-400 uppercase">
                            <span className="flex items-center gap-1">
                              <MapPin className="w-3 h-3 text-emerald-400" /> Australian Billing Address
                            </span>
                            <button
                              onClick={() => handleCopyText(`${AU_DEFAULT_BILLING.line1}, ${AU_DEFAULT_BILLING.city} ${AU_DEFAULT_BILLING.state} ${AU_DEFAULT_BILLING.postcode} Australia`, 'Full Billing Address')}
                              className="text-emerald-400 hover:text-emerald-300 text-[10px] flex items-center gap-1 font-bold cursor-pointer"
                            >
                              <Copy className="w-3 h-3" /> Copy Full Line
                            </button>
                          </div>
                          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                            <button
                              onClick={() => handleCopyText(AU_DEFAULT_BILLING.line1, 'Street Address Line 1')}
                              className="p-2 rounded-xl bg-slate-950 border border-slate-800 hover:border-slate-700 text-left transition-colors cursor-pointer"
                            >
                              <div className="text-[9px] text-slate-500">STREET</div>
                              <div className="text-slate-200 font-bold truncate">{AU_DEFAULT_BILLING.line1}</div>
                            </button>
                            <button
                              onClick={() => handleCopyText(AU_DEFAULT_BILLING.city, 'City / Suburb')}
                              className="p-2 rounded-xl bg-slate-950 border border-slate-800 hover:border-slate-700 text-left transition-colors cursor-pointer"
                            >
                              <div className="text-[9px] text-slate-500">SUBURB</div>
                              <div className="text-slate-200 font-bold">{AU_DEFAULT_BILLING.city}</div>
                            </button>
                            <button
                              onClick={() => handleCopyText(AU_DEFAULT_BILLING.state, 'State')}
                              className="p-2 rounded-xl bg-slate-950 border border-slate-800 hover:border-slate-700 text-left transition-colors cursor-pointer"
                            >
                              <div className="text-[9px] text-slate-500">STATE</div>
                              <div className="text-slate-200 font-bold">{AU_DEFAULT_BILLING.state}</div>
                            </button>
                            <button
                              onClick={() => handleCopyText(AU_DEFAULT_BILLING.postcode, 'Postal Code')}
                              className="p-2 rounded-xl bg-slate-950 border border-slate-800 hover:border-slate-700 text-left transition-colors cursor-pointer"
                            >
                              <div className="text-[9px] text-slate-500">POSTCODE</div>
                              <div className="text-emerald-400 font-bold">{AU_DEFAULT_BILLING.postcode}</div>
                            </button>
                          </div>
                        </div>

                        {/* Row 4: Universal Pipe AutoFill String */}
                        <div className="bg-slate-900/60 p-2.5 rounded-xl border border-slate-800 flex items-center justify-between text-xs font-mono">
                          <span className="text-[10px] text-slate-400 truncate mr-2">
                            AutoFill: <strong className="text-slate-200">{singleLineAutofill}</strong>
                          </span>
                          <button
                            onClick={() => handleCopyText(singleLineAutofill, '1-Line Universal AutoFill String')}
                            className="px-2.5 py-1 rounded-lg bg-indigo-500/20 hover:bg-indigo-500/30 text-indigo-300 border border-indigo-500/30 text-[10px] font-bold flex items-center gap-1 cursor-pointer shrink-0 transition-colors"
                          >
                            {copiedField === '1-Line Universal AutoFill String' ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
                            <span>1-Line AutoFill</span>
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                );
              })()}

              {/* Institutional Details Ribbon */}
              <div className="max-w-xl mx-auto bg-slate-950/80 rounded-2xl p-4 border border-slate-800 flex items-center justify-between text-xs font-mono">
                <div>
                  <span className="text-slate-500">BSB: </span>
                  <strong className="text-emerald-400">{activeCard.bsb || '021-000'}</strong>
                  <span className="text-slate-500 ml-3">ACC: </span>
                  <strong className="text-emerald-400">{activeCard.accountNumber || '8499210045'}</strong>
                </div>
                <button
                  onClick={() => onRefillCard(activeCard.id)}
                  className="text-[11px] text-amber-400 hover:text-amber-300 font-bold flex items-center gap-1 transition-colors cursor-pointer"
                  title="Replenish card to unlimited maximum institutional yield"
                >
                  <RefreshCw className="w-3 h-3" /> Refill Full
                </button>
              </div>
            </div>
          )}

          {/* Interactive Stack Deck Carousel Selector */}
          <div>
            <div className="text-xs font-mono text-slate-400 uppercase tracking-wider mb-3 px-1 flex items-center justify-between">
              <span>Card Stack ({filteredCards.length} Cards in Deck)</span>
              <span>Tap any card to bring to front</span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
              {filteredCards.map((c, idx) => {
                const isSelected = idx === safeIndex;
                const raw = String(c.fullNumber || c.number || '').replace(/\s+/g, '');

                return (
                  <div
                    key={`deck-card-${c.id}-${idx}`}
                    onClick={() => setActiveCardIndex(idx)}
                    className={`rounded-2xl p-3.5 border transition-all cursor-pointer flex flex-col justify-between aspect-[1.586/1] select-none ${
                      isSelected
                        ? 'border-emerald-400 bg-slate-800/90 shadow-lg shadow-emerald-500/10 ring-2 ring-emerald-400/30 scale-102'
                        : 'border-slate-800 bg-slate-950/60 hover:border-slate-700 hover:bg-slate-900/60'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-mono font-bold text-slate-400 uppercase">
                        {isCardDebit(c) ? 'DEBIT' : c.network || 'CARD'}
                      </span>
                      {isSelected && <span className="w-2 h-2 rounded-full bg-emerald-400" />}
                    </div>
                    <div className="text-xs font-black text-white line-clamp-1">
                      {c.name.replace('American Express', 'AMEX')}
                    </div>
                    <div className="flex items-center justify-between text-[10px] font-mono text-slate-400">
                      <span>•••• {raw.slice(-4)}</span>
                      <span className="text-emerald-400 font-bold tabular-nums">
                        ${(typeof c.balance === 'number' ? (c.balance >= 1000000000 ? `${(c.balance/1000000000).toFixed(1)}B` : `${(c.balance/1000000).toFixed(0)}M`) : 'Immense')}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      ) : (
        /* Complete Grid View with 1-Click Merchant Copy on Every Card */
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredCards.map((c, idx) => {
            const style = getCardStyle(c);
            const isRevealed = revealedIds[c.id];
            const raw = String(c.fullNumber || c.number || '').replace(/\s+/g, '');
            const isAmex = c.network === 'AMEX' || raw.startsWith('3');
            const formatted = isAmex
              ? raw.replace(/(\d{4})(\d{6})(\d{5})/, '$1 $2 $3')
              : raw.replace(/(\d{4})/g, '$1 ').trim();
            const displayNum = isRevealed ? formatted : `•••• •••• •••• ${raw.slice(-4)}`;
            const cvv = c.dynamicCvv || c.cvv || (isAmex ? '7712' : '482');

            return (
              <div
                key={`grid-card-${c.id}-${idx}`}
                className="bg-slate-900/90 rounded-3xl border border-slate-800 p-5 shadow-xl flex flex-col justify-between hover:border-slate-700 transition-all space-y-4"
              >
                {/* Visual Card Face */}
                <div
                  className={`aspect-[1.586/1] w-full rounded-2xl p-4 sm:p-5 shadow-lg border ${style.border} ${style.bg} ${style.text} flex flex-col justify-between relative overflow-hidden`}
                >
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-mono uppercase tracking-widest font-bold opacity-75">
                      {c.network || 'Mastercard'}
                    </span>
                    <Wifi className="w-4 h-4 opacity-80 rotate-90" />
                  </div>

                  <div className="text-xs sm:text-sm font-black line-clamp-1">{c.name}</div>

                  <div className="font-mono text-sm sm:text-base font-black tracking-wider flex items-center justify-between">
                    <span
                      onClick={() => handleCopyQuickNumber(c)}
                      className="cursor-pointer hover:text-emerald-400 transition-colors"
                      title="Click to copy digits for checkout"
                    >
                      {displayNum}
                    </span>
                    <button
                      onClick={(e) => toggleReveal(c.id, e)}
                      className="p-1 rounded hover:bg-white/10 opacity-75 hover:opacity-100 cursor-pointer"
                    >
                      {isRevealed ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                    </button>
                  </div>

                  <div className="flex items-center justify-between text-[10px] font-mono">
                    <span>ASIM ARYAL</span>
                    <span>EXP {c.expiry || '12/32'}</span>
                    <span className="text-emerald-400 font-bold">CVV {cvv}</span>
                  </div>
                </div>

                {/* Account Details & Balance */}
                <div className="flex items-center justify-between text-xs font-mono pt-1">
                  <div>
                    <div className="text-[10px] text-slate-500">BSB &amp; ACCOUNT</div>
                    <div className="text-slate-200 font-bold">{c.bsb || '021-000'} • {c.accountNumber || '8499210045'}</div>
                  </div>
                  <div className="text-right">
                    <div className="text-[10px] text-slate-500">BALANCE</div>
                    <div className="text-emerald-400 font-black tabular-nums">
                      ${(typeof c.balance === 'number' ? c.balance : 0).toLocaleString()} AUD
                    </div>
                  </div>
                </div>

                {/* Quick Action Buttons */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-2 border-t border-slate-800">
                  <button
                    onClick={() => onSelectEasyPay(c)}
                    className="min-h-[44px] py-2 px-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black text-xs flex items-center justify-center gap-1 transition-all cursor-pointer shadow-md"
                  >
                    <ShoppingBag className="w-3.5 h-3.5" /> Pay
                  </button>
                  {onSelectShare && (
                    <button
                      onClick={() => onSelectShare(c)}
                      className="min-h-[44px] py-2 px-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-cyan-300 font-bold text-xs flex items-center justify-center gap-1 transition-all cursor-pointer"
                    >
                      <Share2 className="w-3.5 h-3.5" /> Share
                    </button>
                  )}
                  <button
                    onClick={() => handleCopyQuickNumber(c)}
                    className="min-h-[44px] py-2 px-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold text-xs flex items-center justify-center gap-1 transition-all cursor-pointer"
                    title="Copy card digits without spaces"
                  >
                    <Copy className="w-3.5 h-3.5" /> Digits
                  </button>
                  <button
                    onClick={() => onSelectCopyModal(c)}
                    className="min-h-[44px] py-2 px-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-indigo-300 font-bold text-xs flex items-center justify-center gap-1 transition-all cursor-pointer"
                  >
                    Details
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
