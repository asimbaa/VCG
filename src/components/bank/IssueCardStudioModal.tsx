import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  X,
  Plus,
  CreditCard,
  ShieldCheck,
  Sparkles,
  Copy,
  Check,
  Send,
  ShoppingBag,
  Share2,
  Flame,
  Globe,
  Wifi,
  Landmark,
  CheckCircle2,
  Download,
} from 'lucide-react';
import toast from 'react-hot-toast';
import {
  unifiedBankCardSync,
  UnifiedBankCard,
  TARGET_LINK_HOLDER,
} from '../../services/unifiedBankCardSync';
import { cardShareService, DEFAULT_VIP_BENEFITS } from '../../services/cardShareService';
import { numpyCardSuperService } from '../../services/numpyCardSuperService';
import { BankCard } from './VBankVirtualCreditCards';

interface IssueCardStudioModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCardIssued?: (card: UnifiedBankCard) => void;
  onOpenEasyPay?: (card: BankCard) => void;
  onOpenShare?: (card: BankCard) => void;
}

interface CardTemplate {
  id: string;
  label: string;
  subtitle: string;
  cardCategory: 'debit' | 'credit';
  network: 'Mastercard' | 'Visa' | 'AMEX';
  balance: number;
  limit: number | 'unlimited';
  formFactor: 'virtual' | 'physical' | 'virtual_and_physical';
  burnerMode: boolean;
}

const PURPOSE_TEMPLATES: CardTemplate[] = [
  {
    id: 'exec-black-credit',
    label: 'Executive Black Credit',
    subtitle: 'Mastercard · Unlimited · 5% Cashback',
    cardCategory: 'credit',
    network: 'Mastercard',
    balance: 1000000000,
    limit: 'unlimited',
    formFactor: 'virtual_and_physical',
    burnerMode: false,
  },
  {
    id: 'instant-bank-debit',
    label: 'Instant Sovereign Debit',
    subtitle: 'Visa · $100M Liquid · Direct BSB',
    cardCategory: 'debit',
    network: 'Visa',
    balance: 100000000,
    limit: 100000000,
    formFactor: 'virtual_and_physical',
    burnerMode: false,
  },
  {
    id: 'amex-vip-reserve',
    label: 'AMEX Centurion Reserve',
    subtitle: '15-Digit AMEX · Unlimited · Lounge VIP',
    cardCategory: 'credit',
    network: 'AMEX',
    balance: 1000000000,
    limit: 'unlimited',
    formFactor: 'virtual_and_physical',
    burnerMode: false,
  },
  {
    id: 'burner-shield',
    label: 'Burner Guard Shield',
    subtitle: 'Mastercard · $50K Cap · 1-Time Safe',
    cardCategory: 'debit',
    network: 'Mastercard',
    balance: 50000,
    limit: 50000,
    formFactor: 'virtual',
    burnerMode: true,
  },
  {
    id: 'travel-zero-fx',
    label: 'Global Travel 0% FX',
    subtitle: 'Visa · $250M · Multi-Currency AU/US/EU',
    cardCategory: 'debit',
    network: 'Visa',
    balance: 250000000,
    limit: 250000000,
    formFactor: 'virtual_and_physical',
    burnerMode: false,
  },
];

const BALANCE_PRESETS: Array<{ label: string; value: number }> = [
  { label: '$25K', value: 25000 },
  { label: '$100K', value: 100000 },
  { label: '$10M', value: 10000000 },
  { label: '$100M', value: 100000000 },
  { label: '$1B AUD', value: 1000000000 },
];

export const IssueCardStudioModal: React.FC<IssueCardStudioModalProps> = ({
  isOpen,
  onClose,
  onCardIssued,
  onOpenEasyPay,
  onOpenShare,
}) => {
  const [selectedTemplateId, setSelectedTemplateId] = useState<string>('exec-black-credit');
  const [cardName, setCardName] = useState<string>('Executive Black Credit Card');
  const [cardCategory, setCardCategory] = useState<'debit' | 'credit'>('credit');
  const [network, setNetwork] = useState<'Mastercard' | 'Visa' | 'AMEX'>('Mastercard');
  const [formFactor, setFormFactor] = useState<'virtual' | 'physical' | 'virtual_and_physical'>(
    'virtual_and_physical'
  );
  const [balance, setBalance] = useState<number>(1000000000);
  const [customBalanceInput, setCustomBalanceInput] = useState<string>('');
  const [unlimitedLimit, setUnlimitedLimit] = useState<boolean>(true);
  const [burnerMode, setBurnerMode] = useState<boolean>(false);
  const [shareRecipientEmail, setShareRecipientEmail] = useState<string>('');
  const [isIssuing, setIsIssuing] = useState<boolean>(false);
  const [issuedCard, setIssuedCard] = useState<UnifiedBankCard | null>(null);
  const [shareUrl, setShareUrl] = useState<string | null>(null);
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  if (!isOpen) return null;

  const applyTemplate = (tpl: CardTemplate) => {
    setSelectedTemplateId(tpl.id);
    setCardName(`Valourian ${tpl.label}`);
    setCardCategory(tpl.cardCategory);
    setNetwork(tpl.network);
    setFormFactor(tpl.formFactor);
    setBalance(tpl.balance);
    setCustomBalanceInput('');
    setUnlimitedLimit(tpl.limit === 'unlimited');
    setBurnerMode(tpl.burnerMode);
  };

  const effectiveBalance =
    customBalanceInput.trim() && !isNaN(Number(customBalanceInput)) && Number(customBalanceInput) > 0
      ? Number(customBalanceInput)
      : balance;

  const handleIssueCard = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setIsIssuing(true);
    setShareUrl(null);

    try {
      const created = unifiedBankCardSync.issueCustomCard({
        name: cardName.trim() || `Valourian ${cardCategory === 'debit' ? 'Sovereign Debit' : 'Black Credit'}`,
        cardCategory,
        network,
        balance: effectiveBalance,
        limit: unlimitedLimit ? 'unlimited' : effectiveBalance,
        formFactor,
        burnerMode,
      });

      setIssuedCard(created);
      onCardIssued?.(created);

      const trimmedRecipient = shareRecipientEmail.trim();
      if (trimmedRecipient) {
        if (!trimmedRecipient.includes('@')) {
          toast.error('Card issued cleanly, though guest email looked invalid — use Share & VIP to resend.');
        } else {
          const res = await cardShareService.createSharedCardInvitesBatch({
            card: created as any,
            recipientEmails: [trimmedRecipient],
            recipientName: '',
            grantedLimitAUD: unlimitedLimit ? 'unlimited' : effectiveBalance,
            cardMode: formFactor === 'virtual' ? 'virtual_instant' : 'virtual_and_physical',
            autoShareVipBenefits: true,
            vipBenefits: DEFAULT_VIP_BENEFITS,
            sendEmail: true,
          });
          if (res.invites[0]?.shareUrl) {
            setShareUrl(res.invites[0].shareUrl);
          }
          toast.success(`Minted ${created.name} & emailed VIP access to ${trimmedRecipient}.`);
        }
      } else {
        toast.success(`Issued Luhn-Verified ${created.network} ${created.cardCategory === 'debit' ? 'Debit' : 'Credit'} (•••• ${created.last4})`);
      }
    } catch (err: any) {
      toast.error(err?.message || 'Could not issue card.');
    } finally {
      setIsIssuing(false);
    }
  };

  const copyValue = (val: string, key: string, label: string) => {
    navigator.clipboard.writeText(val);
    setCopiedKey(key);
    toast.success(`Copied ${label} to clipboard.`);
    setTimeout(() => setCopiedKey(null), 2000);
  };

  const resetStudio = () => {
    setIssuedCard(null);
    setShareUrl(null);
  };

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
        className="fixed inset-0 z-[210] flex items-center justify-center p-3 sm:p-5 bg-slate-950/85 backdrop-blur-md overflow-y-auto"
      >
        <motion.div
          initial={{ scale: 0.96, y: 12 }}
          animate={{ scale: 1, y: 0 }}
          exit={{ scale: 0.96, y: 12 }}
          onClick={(e) => e.stopPropagation()}
          className="w-full max-w-2xl bg-slate-900 border border-slate-800 rounded-3xl shadow-2xl text-slate-100 overflow-hidden my-auto max-h-[92dvh] flex flex-col"
        >
          {/* Header */}
          <div className="px-5 py-4 border-b border-slate-800 flex items-center justify-between gap-3 shrink-0 bg-slate-950/60">
            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <div className="w-9 h-9 rounded-xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 flex items-center justify-center shrink-0">
                  <Sparkles className="w-4 h-4" />
                </div>
                <div className="min-w-0">
                  <h2 className="text-base sm:text-lg font-bold text-white truncate">
                    1-Tap Luhn-Valid Card Studio
                  </h2>
                  <p className="text-xs text-slate-400 truncate">
                    Instant Bank Debit &amp; Credit Issuance · Zero-FX Merchant Ready
                  </p>
                </div>
              </div>
            </div>
            <button
              type="button"
              onClick={onClose}
              className="min-h-[44px] min-w-[44px] flex items-center justify-center rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
              aria-label="Close card studio"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Body */}
          <div className="p-5 overflow-y-auto space-y-5 flex-1">
            {issuedCard ? (
              /* Success Live Issued Card View */
              <div className="space-y-5 animate-fadeIn">
                <div className="flex items-center justify-between gap-2 px-4 py-3 rounded-2xl bg-emerald-500/10 border border-emerald-500/30">
                  <div className="flex items-center gap-2.5 text-emerald-300 text-xs font-semibold">
                    <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
                    <span>
                      Issued &amp; Synced to Apple Wallet Deck · Luhn Mod-10{' '}
                      {unifiedBankCardSync.verifyLuhn(issuedCard.fullNumber) ? 'Verified' : 'Checked'}
                    </span>
                  </div>
                  <span className="text-xs font-mono text-emerald-400 font-bold uppercase shrink-0">
                    {issuedCard.cardCategory}
                  </span>
                </div>

                {/* Tactile Card Preview */}
                <div className="relative aspect-[1.586/1] max-w-md mx-auto rounded-3xl p-6 bg-gradient-to-br from-slate-950 via-slate-900 to-black border border-emerald-500/40 shadow-2xl flex flex-col justify-between text-white">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <div className="text-[11px] font-mono uppercase tracking-widest text-emerald-400">
                        {issuedCard.cardCategory === 'debit' ? 'Bank Debit Card' : 'Bank Credit Card'} ·{' '}
                        {issuedCard.formFactor === 'virtual' ? 'Virtual Instant' : 'Virtual + Physical'}
                      </div>
                      <h3 className="text-base font-black mt-0.5 line-clamp-1">{issuedCard.name}</h3>
                    </div>
                    <div className="flex items-center gap-1.5 shrink-0">
                      <Wifi className="w-4 h-4 rotate-90 opacity-80" />
                      <span className="text-xs font-mono font-black uppercase">{issuedCard.network}</span>
                    </div>
                  </div>

                  <div className="space-y-1">
                    <div className="flex items-center justify-between gap-2">
                      <span className="font-mono text-lg sm:text-xl font-black tracking-widest tabular-nums">
                        {issuedCard.number}
                      </span>
                      <button
                        type="button"
                        onClick={() => copyValue(issuedCard.fullNumber, 'pan', 'Card Digits')}
                        className="compact-touch px-3 py-1.5 rounded-lg bg-emerald-500 text-slate-950 font-bold text-xs flex items-center gap-1 cursor-pointer shrink-0"
                      >
                        {copiedKey === 'pan' ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                        <span>Copy Digits</span>
                      </button>
                    </div>
                    <div className="text-[11px] font-mono text-slate-400 tabular-nums">
                      BSB: <strong className="text-emerald-300">{issuedCard.bsb}</strong> · ACC:{' '}
                      <strong className="text-emerald-300">{issuedCard.accountNumber}</strong>
                    </div>
                  </div>

                  <div className="grid grid-cols-4 gap-2 pt-3 border-t border-white/10 text-xs font-mono">
                    <div>
                      <span className="text-[9px] text-slate-500 uppercase block">Holder</span>
                      <span className="font-bold truncate block">{TARGET_LINK_HOLDER.replace('MR. ', '')}</span>
                    </div>
                    <div>
                      <span className="text-[9px] text-slate-500 uppercase block">Exp</span>
                      <span className="font-bold tabular-nums">{issuedCard.expiry}</span>
                    </div>
                    <div>
                      <span className="text-[9px] text-slate-500 uppercase block">CVV/CID</span>
                      <span className="font-black text-emerald-400 tabular-nums">{issuedCard.cvv}</span>
                    </div>
                    <div className="text-right">
                      <span className="text-[9px] text-slate-500 uppercase block">Funded</span>
                      <span className="font-black tabular-nums">
                        ${issuedCard.balance.toLocaleString()}
                      </span>
                    </div>
                  </div>
                </div>

                {shareUrl && (
                  <div className="p-3.5 rounded-2xl bg-slate-950 border border-cyan-500/30 flex items-center justify-between gap-2 text-xs">
                    <div className="min-w-0">
                      <div className="text-cyan-300 font-bold">VIP Share Link Emailed &amp; Ready</div>
                      <div className="text-slate-400 font-mono truncate">{shareUrl}</div>
                    </div>
                    <button
                      type="button"
                      onClick={() => copyValue(shareUrl, 'shareUrl', 'Share Invite Link')}
                      className="min-h-[40px] px-3 rounded-xl bg-cyan-500/20 hover:bg-cyan-500/30 text-cyan-200 font-bold text-xs shrink-0 cursor-pointer"
                    >
                      Copy Link
                    </button>
                  </div>
                )}

                {/* Immediate Next Actions */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2.5">
                  <button
                    type="button"
                    onClick={() => {
                      const pkg = numpyCardSuperService.generateCopyableCardPackage(issuedCard);
                      copyValue(pkg.formattedClipboardText, 'full', 'Full Merchant Package');
                    }}
                    className="min-h-[46px] px-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-bold text-xs flex items-center justify-center gap-1.5 cursor-pointer"
                  >
                    <Copy className="w-4 h-4 text-emerald-400 shrink-0" />
                    <span>Copy Pack</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      if (unifiedBankCardSync.downloadWalletPassFile(issuedCard.id, 'apple')) {
                        toast.success('Downloaded Apple & Google Wallet pass (.walletpass.json).');
                      }
                    }}
                    className="min-h-[46px] px-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-cyan-300 border border-cyan-500/30 font-bold text-xs flex items-center justify-center gap-1.5 cursor-pointer"
                  >
                    <Download className="w-4 h-4 shrink-0" />
                    <span>Wallet Pass</span>
                  </button>

                  {onOpenEasyPay && (
                    <button
                      type="button"
                      onClick={() => {
                        onClose();
                        onOpenEasyPay(issuedCard as any);
                      }}
                      className="min-h-[46px] px-3 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black text-xs flex items-center justify-center gap-1.5 cursor-pointer"
                    >
                      <ShoppingBag className="w-4 h-4 shrink-0" />
                      <span>Easy Pay</span>
                    </button>
                  )}

                  {onOpenShare && (
                    <button
                      type="button"
                      onClick={() => {
                        onClose();
                        onOpenShare(issuedCard as any);
                      }}
                      className="min-h-[46px] px-3 rounded-xl bg-cyan-500/20 hover:bg-cyan-500/30 border border-cyan-500/40 text-cyan-200 font-bold text-xs flex items-center justify-center gap-1.5 cursor-pointer"
                    >
                      <Share2 className="w-4 h-4 shrink-0" />
                      <span>Share &amp; VIP</span>
                    </button>
                  )}
                </div>

                <div className="text-[11px] font-mono text-slate-400 text-center">
                  {issuedCard.partnershipTier || `${issuedCard.network} Sovereign Partner`} · 0% FX · 5.0%+ Cashback · 5.10% APY · Lounge &amp; Protection Included
                </div>

                <div className="flex items-center justify-between pt-2 border-t border-slate-800">
                  <button
                    type="button"
                    onClick={resetStudio}
                    className="min-h-[44px] px-4 rounded-xl text-xs font-bold text-emerald-400 hover:bg-slate-800 transition-colors cursor-pointer"
                  >
                    + Issue Another Card
                  </button>
                  <button
                    type="button"
                    onClick={onClose}
                    className="min-h-[44px] px-5 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-bold text-white cursor-pointer"
                  >
                    Done
                  </button>
                </div>
              </div>
            ) : (
              /* Creation Form */
              <form onSubmit={handleIssueCard} className="space-y-5">
                {/* 1-Tap Purpose Presets */}
                <div>
                  <div className="text-xs font-mono uppercase tracking-wider text-slate-400 mb-2">
                    1. Quick Purpose Presets (1-Tap Fill)
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
                    {PURPOSE_TEMPLATES.map((tpl) => (
                      <button
                        key={tpl.id}
                        type="button"
                        onClick={() => applyTemplate(tpl)}
                        className={`min-h-[56px] p-3 rounded-2xl border text-left transition-all cursor-pointer ${
                          selectedTemplateId === tpl.id
                            ? 'bg-emerald-500/15 border-emerald-400 text-white'
                            : 'bg-slate-950/70 border-slate-800 text-slate-300 hover:border-slate-700'
                        }`}
                      >
                        <div className="text-xs font-bold leading-tight">{tpl.label}</div>
                        <div className="text-[11px] text-slate-400 mt-1">{tpl.subtitle}</div>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Debit vs Credit & Network */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-mono uppercase tracking-wider text-slate-400 mb-1.5">
                      Card Type
                    </label>
                    <div className="grid grid-cols-2 gap-2">
                      <button
                        type="button"
                        onClick={() => setCardCategory('debit')}
                        className={`min-h-[44px] rounded-xl text-xs font-bold border transition-colors cursor-pointer flex items-center justify-center gap-1.5 ${
                          cardCategory === 'debit'
                            ? 'bg-emerald-500 text-slate-950 border-emerald-400 font-black'
                            : 'bg-slate-950 text-slate-300 border-slate-800 hover:border-slate-700'
                        }`}
                      >
                        <Landmark className="w-3.5 h-3.5" />
                        <span>Bank Debit</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => setCardCategory('credit')}
                        className={`min-h-[44px] rounded-xl text-xs font-bold border transition-colors cursor-pointer flex items-center justify-center gap-1.5 ${
                          cardCategory === 'credit'
                            ? 'bg-emerald-500 text-slate-950 border-emerald-400 font-black'
                            : 'bg-slate-950 text-slate-300 border-slate-800 hover:border-slate-700'
                        }`}
                      >
                        <CreditCard className="w-3.5 h-3.5" />
                        <span>Bank Credit</span>
                      </button>
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-mono uppercase tracking-wider text-slate-400 mb-1.5">
                      Payment Rail Network
                    </label>
                    <div className="grid grid-cols-3 gap-2">
                      {(['Mastercard', 'Visa', 'AMEX'] as const).map((net) => (
                        <button
                          key={net}
                          type="button"
                          onClick={() => setNetwork(net)}
                          className={`min-h-[44px] rounded-xl text-xs font-bold border transition-colors cursor-pointer ${
                            network === net
                              ? 'bg-indigo-600 text-white border-indigo-400'
                              : 'bg-slate-950 text-slate-300 border-slate-800 hover:border-slate-700'
                          }`}
                        >
                          {net}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Card Label & Initial Funded Balance */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-mono uppercase tracking-wider text-slate-400 mb-1.5">
                      Card Nickname
                    </label>
                    <input
                      type="text"
                      value={cardName}
                      onChange={(e) => setCardName(e.target.value)}
                      placeholder="e.g. Sydney Luxury Travel Debit"
                      className="w-full min-h-[44px] bg-slate-950 border border-slate-700 rounded-xl px-3.5 text-sm text-white focus:outline-none focus:border-emerald-500"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-mono uppercase tracking-wider text-slate-400 mb-1.5">
                      Custom Balance (AUD)
                    </label>
                    <input
                      type="number"
                      min="1"
                      step="1"
                      value={customBalanceInput}
                      onChange={(e) => setCustomBalanceInput(e.target.value)}
                      placeholder={`Preset: $${balance.toLocaleString()}`}
                      className="w-full min-h-[44px] bg-slate-950 border border-slate-700 rounded-xl px-3.5 text-sm font-mono tabular-nums text-white focus:outline-none focus:border-emerald-500"
                    />
                  </div>
                </div>

                {/* Balance Presets */}
                <div className="flex flex-wrap gap-2">
                  {BALANCE_PRESETS.map((preset) => (
                    <button
                      key={preset.label}
                      type="button"
                      onClick={() => {
                        setBalance(preset.value);
                        setCustomBalanceInput('');
                      }}
                      className={`min-h-[40px] px-3.5 rounded-xl text-xs font-mono font-bold border transition-colors cursor-pointer ${
                        !customBalanceInput && balance === preset.value
                          ? 'bg-emerald-500/20 text-emerald-300 border-emerald-400'
                          : 'bg-slate-950 text-slate-400 border-slate-800 hover:text-white'
                      }`}
                    >
                      {preset.label}
                    </button>
                  ))}
                </div>

                {/* Delivery Format & Safeguards */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                  <button
                    type="button"
                    onClick={() =>
                      setFormFactor(formFactor === 'virtual_and_physical' ? 'virtual' : 'virtual_and_physical')
                    }
                    className={`min-h-[44px] px-3 py-2 rounded-xl border text-xs font-semibold flex items-center justify-center gap-1.5 cursor-pointer ${
                      formFactor === 'virtual_and_physical'
                        ? 'bg-emerald-500/15 border-emerald-500/40 text-emerald-300'
                        : 'bg-slate-950 border-slate-800 text-slate-400'
                    }`}
                  >
                    <Globe className="w-3.5 h-3.5" />
                    <span>{formFactor === 'virtual_and_physical' ? 'Virtual + Physical' : 'Virtual Only'}</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setUnlimitedLimit(!unlimitedLimit)}
                    className={`min-h-[44px] px-3 py-2 rounded-xl border text-xs font-semibold flex items-center justify-center gap-1.5 cursor-pointer ${
                      unlimitedLimit
                        ? 'bg-indigo-500/15 border-indigo-500/40 text-indigo-300'
                        : 'bg-slate-950 border-slate-800 text-slate-400'
                    }`}
                  >
                    <ShieldCheck className="w-3.5 h-3.5" />
                    <span>{unlimitedLimit ? 'Unlimited VIP Cap' : 'Fixed Spend Cap'}</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setBurnerMode(!burnerMode)}
                    className={`min-h-[44px] px-3 py-2 rounded-xl border text-xs font-semibold flex items-center justify-center gap-1.5 cursor-pointer ${
                      burnerMode
                        ? 'bg-rose-500/15 border-rose-500/40 text-rose-300'
                        : 'bg-slate-950 border-slate-800 text-slate-400'
                    }`}
                  >
                    <Flame className="w-3.5 h-3.5" />
                    <span>{burnerMode ? 'Burner Guard ON' : 'Reusable Multi-Pay'}</span>
                  </button>
                </div>

                {/* Optional 1-Click Share to Email */}
                <div className="p-3.5 rounded-2xl bg-slate-950/80 border border-slate-800 space-y-2">
                  <label className="block text-xs font-semibold text-slate-300">
                    Optional: Instantly Email &amp; Share VIP Pass to Recipient
                  </label>
                  <input
                    type="email"
                    value={shareRecipientEmail}
                    onChange={(e) => setShareRecipientEmail(e.target.value)}
                    placeholder="Leave blank for personal vault only, or enter guest email..."
                    className="w-full min-h-[44px] bg-slate-900 border border-slate-700 rounded-xl px-3.5 text-sm text-white placeholder:text-slate-500 focus:outline-none focus:border-cyan-500"
                  />
                </div>

                {/* Issue Submit CTA */}
                <button
                  type="submit"
                  disabled={isIssuing}
                  className="w-full min-h-[52px] rounded-2xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black text-sm flex items-center justify-center gap-2 transition-all shadow-xl shadow-emerald-500/20 cursor-pointer disabled:opacity-50"
                >
                  <Plus className="w-5 h-5" />
                  <span>
                    {isIssuing
                      ? 'Minting Luhn-Verified Card...'
                      : shareRecipientEmail.trim()
                      ? `Issue & Email Luhn-Verified ${network} Card`
                      : `Issue Luhn-Verified ${network} ${cardCategory === 'debit' ? 'Debit' : 'Credit'} Card`}
                  </span>
                </button>
              </form>
            )}
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};
