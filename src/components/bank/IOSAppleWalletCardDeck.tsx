import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  CreditCard, Wifi, ShieldCheck, Zap, Copy, Eye, EyeOff, 
  Send, Sparkles, RefreshCw, ShoppingBag, ArrowUpRight, Check,
  ExternalLink, Layers, LayoutGrid, Leaf, Award
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
}

export const IOSAppleWalletCardDeck: React.FC<IOSAppleWalletCardDeckProps> = ({
  cards,
  onSelectPayId,
  onSelectNfc,
  onSelectCopyModal,
  onSelectEasyPay,
  onRefillCard,
}) => {
  const [activeCardIndex, setActiveCardIndex] = useState<number>(0);
  const [deckMode, setDeckMode] = useState<'stack' | 'grid'>('stack');
  const [revealedIds, setRevealedIds] = useState<Record<string, boolean>>({});
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const toggleReveal = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setRevealedIds(prev => ({ ...prev, [id]: !prev[id] }));
  };

  const handleCopyQuickNumber = (card: BankCard, e: React.MouseEvent) => {
    e.stopPropagation();
    const raw = String(card.fullNumber || card.number || '').replace(/\s+/g, '');
    navigator.clipboard.writeText(raw);
    setCopiedId(card.id);
    if (typeof navigator !== 'undefined' && navigator.vibrate) {
      navigator.vibrate([35, 45, 35]);
    }
    toast.success(`Copied ${card.name} (${raw.slice(-4)}) card number for immediate checkout!`);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleCopyFullPackage = (card: BankCard, e: React.MouseEvent) => {
    e.stopPropagation();
    const pkg = numpyCardSuperService.generateCopyableCardPackage(card);
    navigator.clipboard.writeText(pkg.formattedClipboardText);
    toast.success(`Full Credentials & Billing Package copied for ${card.name}!`);
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

  const activeCard = cards[activeCardIndex] || cards[0];

  return (
    <div className="space-y-6">
      {/* Deck Controls Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-slate-900/80 p-4 rounded-2xl border border-slate-800">
        <div>
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" />
            <h3 className="text-base font-black text-white">
              iOS Apple Wallet Sovereign Card Deck
            </h3>
            <span className="text-[11px] font-mono px-2 py-0.5 rounded-full bg-indigo-500/20 text-indigo-300 font-bold border border-indigo-500/30">
              {cards.length} Operating Cards
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-0.5">
            True operating details • Biometric Apple Pay / Google Wallet ready • Tap or click any card
          </p>
        </div>

        {/* View Mode Toggle */}
        <div className="flex items-center gap-2 self-start sm:self-auto">
          <button
            onClick={() => setDeckMode('stack')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer ${
              deckMode === 'stack'
                ? 'bg-emerald-500 text-slate-950 shadow-md shadow-emerald-500/20 font-black'
                : 'bg-slate-800 text-slate-400 hover:text-white'
            }`}
          >
            <Layers className="w-3.5 h-3.5" />
            Wallet Stack
          </button>
          <button
            onClick={() => setDeckMode('grid')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer ${
              deckMode === 'grid'
                ? 'bg-emerald-500 text-slate-950 shadow-md shadow-emerald-500/20 font-black'
                : 'bg-slate-800 text-slate-400 hover:text-white'
            }`}
          >
            <LayoutGrid className="w-3.5 h-3.5" />
            All Cards Grid
          </button>
        </div>
      </div>

      {deckMode === 'stack' ? (
        /* iOS Wallet Stack View */
        <div className="space-y-6">
          {/* Active Featured Card Spotlight */}
          {activeCard && (
            <div className="space-y-4">
              <div className="max-w-md mx-auto">
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
                      className={`relative aspect-[1.586/1] w-full rounded-3xl p-6 sm:p-7 shadow-2xl border ${style.border} ${style.bg} ${style.text} flex flex-col justify-between overflow-hidden select-none transition-shadow hover:shadow-indigo-500/20`}
                    >
                      {/* Ambient Specular Highlight */}
                      <div className="absolute top-0 right-0 w-72 h-72 bg-white/5 rounded-full blur-3xl pointer-events-none -mr-20 -mt-20" />

                      {/* Card Header: Network + Contactless Icon */}
                      <div className="relative z-10 flex items-start justify-between">
                        <div>
                          <div className="text-xs font-mono font-bold tracking-widest uppercase opacity-75">
                            Valourian Sovereign OS
                          </div>
                          <h4 className="text-sm sm:text-base font-black tracking-tight mt-0.5 line-clamp-1">
                            {activeCard.name}
                          </h4>
                        </div>
                        <div className="flex items-center gap-2">
                          <Wifi className="w-5 h-5 opacity-80 rotate-90" />
                          <span className={`text-[10px] font-mono font-black uppercase px-2 py-0.5 rounded-full border ${style.badge}`}>
                            {activeCard.network || 'Mastercard'}
                          </span>
                        </div>
                      </div>

                      {/* EMV Chip & Net CO2 */}
                      <div className="relative z-10 flex items-center justify-between my-2">
                        <div className={`w-11 h-8 rounded-lg bg-gradient-to-tr ${style.chip} shadow-inner border border-white/20 flex flex-col justify-around p-1 opacity-90`}>
                          <div className="w-full h-0.5 bg-black/20" />
                          <div className="w-full h-0.5 bg-black/20" />
                        </div>
                        <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-500/20 border border-emerald-500/30 text-emerald-300 text-[10px] font-mono font-bold">
                          <Leaf className="w-3 h-3 text-emerald-400" />
                          Net -1.25x CO₂
                        </div>
                      </div>

                      {/* Card Number & Reveal Button */}
                      <div className="relative z-10 space-y-1">
                        <div className="flex items-center justify-between">
                          <span className="font-mono text-base sm:text-lg font-black tracking-widest tabular-nums">
                            {displayNum}
                          </span>
                          <button
                            onClick={(e) => toggleReveal(activeCard.id, e)}
                            className="p-1 rounded-lg hover:bg-white/10 transition-colors opacity-80 hover:opacity-100 cursor-pointer"
                            title={isRevealed ? 'Hide full number' : 'Reveal full 16-digit PAN'}
                          >
                            {isRevealed ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                          </button>
                        </div>
                      </div>

                      {/* Card Footer: Details */}
                      <div className="relative z-10 flex items-end justify-between text-[11px] font-mono">
                        <div>
                          <div className="text-[9px] opacity-70 uppercase tracking-widest">Cardholder</div>
                          <div className="font-bold tracking-wider">ASIM ARYAL</div>
                        </div>
                        <div>
                          <div className="text-[9px] opacity-70 uppercase tracking-widest">Expires</div>
                          <div className="font-bold">{activeCard.expiry || '12/32'}</div>
                        </div>
                        <div>
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
              <div className="max-w-md mx-auto grid grid-cols-2 sm:grid-cols-4 gap-2 pt-2">
                <button
                  onClick={() => onSelectEasyPay(activeCard)}
                  className="py-3 px-3 rounded-2xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black text-xs flex flex-col items-center justify-center gap-1 shadow-lg shadow-emerald-500/20 transition-all cursor-pointer active:scale-95"
                >
                  <ShoppingBag className="w-4 h-4" />
                  <span>Easy Pay</span>
                </button>

                <button
                  onClick={() => onSelectPayId(activeCard.id)}
                  className="py-3 px-3 rounded-2xl bg-slate-900 hover:bg-slate-800 text-blue-400 border border-blue-500/30 font-bold text-xs flex flex-col items-center justify-center gap-1 transition-all cursor-pointer active:scale-95"
                >
                  <Send className="w-4 h-4" />
                  <span>PayID Transfer</span>
                </button>

                <button
                  onClick={() => onSelectNfc(activeCard.id)}
                  className="py-3 px-3 rounded-2xl bg-slate-900 hover:bg-slate-800 text-emerald-400 border border-emerald-500/30 font-bold text-xs flex flex-col items-center justify-center gap-1 transition-all cursor-pointer active:scale-95"
                >
                  <Wifi className="w-4 h-4 rotate-90" />
                  <span>NFC Tap</span>
                </button>

                <button
                  onClick={(e) => handleCopyFullPackage(activeCard, e)}
                  className="py-3 px-3 rounded-2xl bg-slate-900 hover:bg-slate-800 text-purple-400 border border-purple-500/30 font-bold text-xs flex flex-col items-center justify-center gap-1 transition-all cursor-pointer active:scale-95"
                >
                  <Copy className="w-4 h-4" />
                  <span>Copy All</span>
                </button>
              </div>

              {/* Institutional Details Ribbon */}
              <div className="max-w-md mx-auto bg-slate-950/80 rounded-2xl p-4 border border-slate-800 flex items-center justify-between text-xs font-mono">
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
                  <RefreshCw className="w-3 h-3" /> Refill
                </button>
              </div>
            </div>
          )}

          {/* Interactive Stack Deck Carousel Selector */}
          <div>
            <div className="text-xs font-mono text-slate-400 uppercase tracking-wider mb-3 px-1 flex items-center justify-between">
              <span>Card Stack ({cards.length} Cards in Deck)</span>
              <span>Tap any card to bring to front</span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3">
              {cards.map((c, idx) => {
                const style = getCardStyle(c);
                const isSelected = idx === activeCardIndex;
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
                        {c.network || 'Mastercard'}
                      </span>
                      {isSelected && <span className="w-2 h-2 rounded-full bg-emerald-400" />}
                    </div>
                    <div className="text-xs font-black text-white line-clamp-1">
                      {c.name.replace('American Express', 'AMEX')}
                    </div>
                    <div className="flex items-center justify-between text-[10px] font-mono text-slate-400">
                      <span>•••• {raw.slice(-4)}</span>
                      <span className="text-emerald-400 font-bold">
                        ${(typeof c.balance === 'number' ? (c.balance > 1000000000 ? `${(c.balance/1000000000).toFixed(1)}B` : `${(c.balance/1000000).toFixed(0)}M`) : 'Immense')}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      ) : (
        /* Complete Grid View */
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {cards.map((c, idx) => {
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
                  className={`aspect-[1.586/1] w-full rounded-2xl p-4 shadow-lg border ${style.border} ${style.bg} ${style.text} flex flex-col justify-between relative overflow-hidden`}
                >
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-mono uppercase tracking-widest font-bold opacity-75">
                      {c.network || 'Mastercard'}
                    </span>
                    <Wifi className="w-4 h-4 opacity-80 rotate-90" />
                  </div>

                  <div className="text-xs font-black line-clamp-1">{c.name}</div>

                  <div className="font-mono text-sm font-black tracking-wider flex items-center justify-between">
                    <span>{displayNum}</span>
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
                    <div className="text-[10px] text-slate-500">BSB & ACCOUNT</div>
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
                <div className="grid grid-cols-3 gap-2 pt-2 border-t border-slate-800">
                  <button
                    onClick={() => onSelectEasyPay(c)}
                    className="py-2 px-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black text-[11px] flex items-center justify-center gap-1 transition-all cursor-pointer"
                  >
                    <ShoppingBag className="w-3 h-3" /> Pay
                  </button>
                  <button
                    onClick={(e) => handleCopyQuickNumber(c, e)}
                    className="py-2 px-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold text-[11px] flex items-center justify-center gap-1 transition-all cursor-pointer"
                  >
                    {copiedId === c.id ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                    {copiedId === c.id ? 'Copied' : 'Copy'}
                  </button>
                  <button
                    onClick={() => onSelectCopyModal(c)}
                    className="py-2 px-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-indigo-300 font-bold text-[11px] flex items-center justify-center gap-1 transition-all cursor-pointer"
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
