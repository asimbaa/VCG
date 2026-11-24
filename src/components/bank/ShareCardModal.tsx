import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { QRCodeSVG } from 'qrcode.react';
import {
  X,
  Send,
  Copy,
  Check,
  Share2,
  Sparkles,
  CreditCard,
  Mail,
  ExternalLink,
  ShieldCheck,
  Truck,
  CheckCircle2,
  Ban,
  Users,
  Eye,
  PauseCircle,
  PlayCircle,
  Search,
  Edit3,
  RefreshCw,
} from 'lucide-react';
import toast from 'react-hot-toast';
import {
  cardShareService,
  CardShareMode,
  DEFAULT_VIP_BENEFITS,
  SHARED_INVITES_UPDATED_EVENT,
  SharedCardInvite,
} from '../../services/cardShareService';
import { BankCard } from './VBankVirtualCreditCards';

interface ShareCardModalProps {
  isOpen: boolean;
  onClose: () => void;
  card: BankCard | null;
  allCards?: BankCard[];
  onPreviewClaimPortal?: (inviteId: string) => void;
}

const ALLOWANCE_PRESETS: Array<{ label: string; value: number | 'unlimited' }> = [
  { label: '$5K', value: 5000 },
  { label: '$25K', value: 25000 },
  { label: '$100K', value: 100000 },
  { label: '$500K', value: 500000 },
  { label: 'Unlimited VIP', value: 'unlimited' },
];

export const ShareCardModal: React.FC<ShareCardModalProps> = ({
  isOpen,
  onClose,
  card,
  allCards = [],
  onPreviewClaimPortal,
}) => {
  const [selectedCard, setSelectedCard] = useState<BankCard | null>(card);
  const [cardMode, setCardMode] = useState<CardShareMode>('virtual_and_physical');
  const [allowance, setAllowance] = useState<number | 'unlimited'>(100000);
  const [customLimit, setCustomLimit] = useState<string>('');
  const [autoShareVipBenefits, setAutoShareVipBenefits] = useState<boolean>(true);
  const [recipientEmailsRaw, setRecipientEmailsRaw] = useState<string>('');
  const [recipientName, setRecipientName] = useState<string>('');
  const [isSending, setIsSending] = useState<boolean>(false);
  const [createdInvites, setCreatedInvites] = useState<SharedCardInvite[]>([]);
  const [activeTab, setActiveTab] = useState<'create' | 'history'>('create');
  const [historyInvites, setHistoryInvites] = useState<SharedCardInvite[]>(() =>
    cardShareService.listInvites()
  );
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [statusFilter, setStatusFilter] = useState<'all' | 'claimed' | 'pending' | 'paused' | 'revoked'>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [editingLimitId, setEditingLimitId] = useState<string | null>(null);
  const [editingLimitValue, setEditingLimitValue] = useState<string>('');
  const [resendingId, setResendingId] = useState<string | null>(null);
  const [emailRelayStatus, setEmailRelayStatus] = useState<{
    mode: string;
    smtpConfigured: boolean;
    fromAddress?: string;
  } | null>(null);

  useEffect(() => {
    if (card) {
      setSelectedCard(card);
    } else if (allCards.length > 0 && !selectedCard) {
      setSelectedCard(allCards[0]);
    }
  }, [card, allCards]);

  useEffect(() => {
    if (!isOpen) return;
    cardShareService.refreshInvitesFromBackend().then(setHistoryInvites);
    fetch('/api/email/status')
      .then((r) => (r.ok ? r.json() : null))
      .then((data) => {
        if (data?.success) {
          setEmailRelayStatus({
            mode: data.mode || 'ethereal_sandbox',
            smtpConfigured: Boolean(data.smtpConfigured),
            fromAddress: data.fromAddress,
          });
        }
      })
      .catch(() => {});
    const onUpdated = () => setHistoryInvites(cardShareService.listInvites());
    window.addEventListener(SHARED_INVITES_UPDATED_EVENT, onUpdated);
    return () => window.removeEventListener(SHARED_INVITES_UPDATED_EVENT, onUpdated);
  }, [isOpen]);

  if (!isOpen || !selectedCard) return null;

  const isDebit =
    selectedCard.cardCategory === 'debit' ||
    String(selectedCard.id || '').startsWith('debit_') ||
    selectedCard.name.toLowerCase().includes('debit');

  const rawNum = String(selectedCard.fullNumber || selectedCard.number || '').replace(/\s+/g, '');
  const last4 = (selectedCard as any).last4 || rawNum.slice(-4) || '7712';

  const parsedEmails = recipientEmailsRaw
    .split(/[\n,;]+/)
    .map((e) => e.trim())
    .filter(Boolean);

  const effectiveLimit: number | 'unlimited' =
    customLimit.trim() && !isNaN(Number(customLimit)) && Number(customLimit) > 0
      ? Number(customLimit)
      : allowance;

  const handleCopyLink = (url: string, key = 'link') => {
    navigator.clipboard.writeText(url);
    setCopiedId(key);
    toast.success('Instant activation link copied to clipboard.');
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleNativeShare = async (invite: SharedCardInvite) => {
    if (typeof navigator !== 'undefined' && navigator.share) {
      try {
        await navigator.share({
          title: `${invite.cardName} · Instant VIP Access`,
          text: `${invite.senderName} shared a ${
            invite.cardCategory === 'debit' ? 'Bank Debit Card' : 'Bank Credit Card'
          } with auto-VIP benefits.`,
          url: invite.shareUrl,
        });
      } catch {}
    } else {
      handleCopyLink(invite.shareUrl, invite.inviteId);
    }
  };

  const handleIssueShare = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedCard) return;

    const invalidEmail = parsedEmails.find((em) => !em.includes('@'));
    if (invalidEmail) {
      toast.error(`Please enter a valid email address: "${invalidEmail}"`);
      return;
    }

    setIsSending(true);
    try {
      const result = await cardShareService.createSharedCardInvitesBatch({
        card: selectedCard as any,
        recipientEmails: parsedEmails,
        recipientName: recipientName.trim(),
        grantedLimitAUD: effectiveLimit,
        cardMode,
        autoShareVipBenefits,
        vipBenefits: DEFAULT_VIP_BENEFITS,
        sendEmail: parsedEmails.length > 0,
      });

      setCreatedInvites(result.invites);
      setHistoryInvites(cardShareService.listInvites());

      if (parsedEmails.length > 1) {
        toast.success(
          `VIP Swarm Dispatched: ${parsedEmails.length} email invitations & live passes generated.`
        );
      } else if (parsedEmails.length === 1) {
        toast.success(`Card share invite emailed to ${parsedEmails[0]}.`);
      } else {
        toast.success('Instant shareable QR pass & link created.');
      }
    } catch (err: any) {
      toast.error(err?.message || 'Unable to generate share invite.');
    } finally {
      setIsSending(false);
    }
  };

  const handleRevoke = async (inviteId: string) => {
    await cardShareService.revokeSharedCardInvite(inviteId);
    setHistoryInvites(cardShareService.listInvites());
    toast.success('Shared card access revoked immediately.');
  };

  const handleTogglePause = async (inv: SharedCardInvite) => {
    const nextStatus = inv.status === 'paused' ? (inv.claimedByEmail ? 'claimed' : 'pending') : 'paused';
    await cardShareService.updateSharedCardInviteControls(inv.inviteId, { status: nextStatus });
    setHistoryInvites(cardShareService.listInvites());
    toast.success(nextStatus === 'paused' ? 'Shared card temporarily paused.' : 'Shared card resumed immediately.');
  };

  const handleSaveInlineLimit = async (inv: SharedCardInvite) => {
    const trimmed = editingLimitValue.trim().toLowerCase();
    let nextLimit: number | 'unlimited';
    if (trimmed === 'unlimited' || trimmed === 'vip') {
      nextLimit = 'unlimited';
    } else {
      const parsed = Number(trimmed);
      if (!Number.isFinite(parsed) || parsed <= 0) {
        toast.error('Enter a valid positive AUD limit or "unlimited".');
        return;
      }
      nextLimit = parsed;
    }
    await cardShareService.updateSharedCardInviteControls(inv.inviteId, { grantedLimitAUD: nextLimit });
    setHistoryInvites(cardShareService.listInvites());
    setEditingLimitId(null);
    toast.success(
      `Allowance updated to ${nextLimit === 'unlimited' ? 'Unlimited VIP' : `$${nextLimit.toLocaleString()} AUD`}.`
    );
  };

  const handleAdvanceCourier = async (inv: SharedCardInvite) => {
    const order: Array<SharedCardInvite['physicalDispatchStatus']> = [
      'queued_production',
      'courier_dispatched',
      'delivered',
    ];
    const currentIdx = order.indexOf(inv.physicalDispatchStatus);
    const nextStage = currentIdx >= 0 ? order[(currentIdx + 1) % order.length] : 'queued_production';
    await cardShareService.updateSharedCardInviteControls(inv.inviteId, { physicalDispatchStatus: nextStage });
    setHistoryInvites(cardShareService.listInvites());
    toast.success(`Courier milestone updated: ${nextStage.replace(/_/g, ' ')}`);
  };

  const handleResendEmail = async (inv: SharedCardInvite) => {
    setResendingId(inv.inviteId);
    try {
      const updated = await cardShareService.resendSharedCardInviteEmail(inv.inviteId);
      setHistoryInvites(cardShareService.listInvites());
      if (updated) {
        toast.success(`Re-dispatched share invite email (${updated.emailChannel || 'relay'}).`);
      }
    } catch {
      toast.error('Unable to resend invite email.');
    } finally {
      setResendingId(null);
    }
  };

  const filteredHistory = historyInvites.filter((inv) => {
    if (statusFilter !== 'all' && inv.status !== statusFilter) return false;
    const q = searchQuery.trim().toLowerCase();
    if (!q) return true;
    return (
      inv.cardName.toLowerCase().includes(q) ||
      (inv.recipientEmail || '').toLowerCase().includes(q) ||
      (inv.recipientName || '').toLowerCase().includes(q) ||
      (inv.claimedByEmail || '').toLowerCase().includes(q) ||
      (inv.claimedByName || '').toLowerCase().includes(q) ||
      inv.maskedLast4.includes(q)
    );
  });

  const latestInvite = createdInvites[0] || null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-[70] flex items-center justify-center p-3 sm:p-5 bg-slate-950/85 backdrop-blur-md overflow-y-auto"
        onClick={onClose}
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
                <Share2 className="w-4 h-4 text-emerald-400 shrink-0" />
                <h2 className="text-base sm:text-lg font-bold text-white truncate">
                  Share Card &amp; VIP Swarm Access
                </h2>
              </div>
              <p className="text-xs text-slate-400 mt-0.5 truncate">
                {isDebit ? 'Bank Debit Card' : 'Bank Credit Card'} · {selectedCard.network || 'Mastercard'} · •••• {last4} ·{' '}
                {cardMode === 'virtual_and_physical' ? 'Virtual + Physical Courier' : 'Instant Virtual'}
              </p>
            </div>
            <button
              onClick={onClose}
              className="min-h-[44px] min-w-[44px] flex items-center justify-center rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
              aria-label="Close modal"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Clean Tabs + Live Email Relay Indicator */}
          <div className="px-5 pt-3 pb-2 border-b border-slate-800/80 flex flex-wrap items-center justify-between gap-2 shrink-0 bg-slate-900">
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setActiveTab('create')}
                className={`min-h-[44px] px-4 rounded-xl text-xs font-semibold transition-colors cursor-pointer ${
                  activeTab === 'create'
                    ? 'bg-emerald-500 text-slate-950 font-bold'
                    : 'bg-slate-800 text-slate-300 hover:text-white'
                }`}
              >
                Create &amp; Send Invite
              </button>
              <button
                type="button"
                onClick={() => setActiveTab('history')}
                className={`min-h-[44px] px-4 rounded-xl text-xs font-semibold transition-colors cursor-pointer flex items-center gap-1.5 ${
                  activeTab === 'history'
                    ? 'bg-emerald-500 text-slate-950 font-bold'
                    : 'bg-slate-800 text-slate-300 hover:text-white'
                }`}
              >
                <span>Issued Invites</span>
                <span className="font-mono text-[11px] tabular-nums">({historyInvites.length})</span>
              </button>
            </div>

            {emailRelayStatus && (
              <div className="text-[11px] font-mono text-slate-400">
                Email Relay:{' '}
                <span className={emailRelayStatus.smtpConfigured ? 'text-emerald-400 font-semibold' : 'text-cyan-300 font-semibold'}>
                  {emailRelayStatus.smtpConfigured ? 'Live SMTP' : 'Sandbox Preview Relay'}
                </span>
              </div>
            )}
          </div>

          {/* Scrollable Body */}
          <div className="p-5 overflow-y-auto space-y-5 flex-1">
            {activeTab === 'create' ? (
              <>
                <form onSubmit={handleIssueShare} className="space-y-4">
                  {/* Card Picker if multiple cards available */}
                  {allCards.length > 1 && (
                    <div>
                      <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                        Select Debit or Credit Card to Share
                      </label>
                      <select
                        value={selectedCard.id}
                        onChange={(e) => {
                          const found = allCards.find((c) => c.id === e.target.value);
                          if (found) {
                            setSelectedCard(found);
                            setCreatedInvites([]);
                          }
                        }}
                        className="w-full min-h-[44px] bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-sm text-white focus:outline-none focus:border-emerald-500"
                      >
                        {allCards.map((c) => {
                          const cat =
                            c.cardCategory === 'debit' ||
                            c.id.startsWith('debit_') ||
                            c.name.toLowerCase().includes('debit')
                              ? 'DEBIT'
                              : 'CREDIT';
                          const tail = String(c.fullNumber || c.number || '').replace(/\s+/g, '').slice(-4);
                          return (
                            <option key={c.id} value={c.id}>
                              [{cat}] {c.name} (•••• {tail}) · ${Number(c.balance || 0).toLocaleString()} AUD
                            </option>
                          );
                        })}
                      </select>
                    </div>
                  )}

                  {/* Card Issuance Mode */}
                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                      Issuance Format
                    </label>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                      <button
                        type="button"
                        onClick={() => setCardMode('virtual_and_physical')}
                        className={`min-h-[52px] p-3 rounded-xl border text-left transition-all cursor-pointer flex items-start gap-2.5 ${
                          cardMode === 'virtual_and_physical'
                            ? 'bg-emerald-500/15 border-emerald-500/60 text-white'
                            : 'bg-slate-950 border-slate-800 text-slate-400 hover:border-slate-700'
                        }`}
                      >
                        <Truck className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                        <div>
                          <div className="text-xs font-bold text-white">Virtual + Physical Card</div>
                          <div className="text-[11px] text-slate-400">
                            Instant virtual use + express courier option
                          </div>
                        </div>
                      </button>

                      <button
                        type="button"
                        onClick={() => setCardMode('virtual_instant')}
                        className={`min-h-[52px] p-3 rounded-xl border text-left transition-all cursor-pointer flex items-start gap-2.5 ${
                          cardMode === 'virtual_instant'
                            ? 'bg-emerald-500/15 border-emerald-500/60 text-white'
                            : 'bg-slate-950 border-slate-800 text-slate-400 hover:border-slate-700'
                        }`}
                      >
                        <CreditCard className="w-4 h-4 text-cyan-400 shrink-0 mt-0.5" />
                        <div>
                          <div className="text-xs font-bold text-white">Virtual Instant Only</div>
                          <div className="text-[11px] text-slate-400">
                            Immediate online, Apple Pay &amp; Google Wallet
                          </div>
                        </div>
                      </button>
                    </div>
                  </div>

                  {/* Pre-Approved Allowance */}
                  <div>
                    <div className="flex items-center justify-between mb-1.5">
                      <label className="text-xs font-semibold text-slate-300">
                        Pre-Approved Spending Allowance (AUD)
                      </label>
                      <span className="text-xs font-mono text-emerald-400 font-bold tabular-nums">
                        {effectiveLimit === 'unlimited'
                          ? 'Unlimited VIP'
                          : `$${Number(effectiveLimit).toLocaleString()} AUD`}
                      </span>
                    </div>
                    <div className="grid grid-cols-3 sm:grid-cols-5 gap-2 mb-2">
                      {ALLOWANCE_PRESETS.map((preset) => {
                        const isSelected = !customLimit && allowance === preset.value;
                        return (
                          <button
                            key={preset.label}
                            type="button"
                            onClick={() => {
                              setAllowance(preset.value);
                              setCustomLimit('');
                            }}
                            className={`min-h-[44px] px-2 py-2 rounded-xl border text-xs font-mono font-bold transition-colors cursor-pointer ${
                              isSelected
                                ? 'bg-emerald-500 text-slate-950 border-emerald-400'
                                : 'bg-slate-950 border-slate-800 text-slate-300 hover:border-slate-700'
                            }`}
                          >
                            {preset.label}
                          </button>
                        );
                      })}
                    </div>
                    <input
                      type="number"
                      min={1}
                      placeholder="Or enter custom AUD limit (optional)..."
                      value={customLimit}
                      onChange={(e) => setCustomLimit(e.target.value)}
                      className="w-full min-h-[44px] bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2 text-xs text-white font-mono focus:outline-none focus:border-emerald-500"
                    />
                  </div>

                  {/* Auto-Share VIP Benefits Toggle */}
                  <div className="bg-slate-950 border border-slate-800 rounded-2xl p-4 space-y-2.5">
                    <div className="flex items-center justify-between gap-3">
                      <div className="flex items-center gap-2">
                        <Sparkles className="w-4 h-4 text-emerald-400 shrink-0" />
                        <div>
                          <div className="text-xs font-bold text-white">
                            Auto-Share All VIP Benefits With Recipients
                          </div>
                          <div className="text-[11px] text-slate-400">
                            Unlock sovereign perks for VIPs, family, and priority customers
                          </div>
                        </div>
                      </div>
                      <button
                        type="button"
                        onClick={() => setAutoShareVipBenefits(!autoShareVipBenefits)}
                        className={`min-h-[32px] w-12 rounded-full transition-colors p-1 cursor-pointer shrink-0 ${
                          autoShareVipBenefits ? 'bg-emerald-500' : 'bg-slate-700'
                        }`}
                        aria-pressed={autoShareVipBenefits}
                      >
                        <div
                          className={`w-5 h-5 rounded-full bg-white transition-transform ${
                            autoShareVipBenefits ? 'translate-x-5' : 'translate-x-0'
                          }`}
                        />
                      </button>
                    </div>
                    {autoShareVipBenefits && (
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5 pt-2 border-t border-slate-800/80 text-[11px] text-slate-300">
                        {DEFAULT_VIP_BENEFITS.map((perk) => (
                          <div key={perk} className="flex items-center gap-1.5">
                            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                            <span>{perk}</span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Recipient Email(s) & Optional Name */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                        Recipient Email(s) <span className="text-slate-500">(comma-separated for VIP swarm)</span>
                      </label>
                      <input
                        type="text"
                        placeholder="vip@partner.com, client@domain.com"
                        value={recipientEmailsRaw}
                        onChange={(e) => setRecipientEmailsRaw(e.target.value)}
                        className="w-full min-h-[44px] bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2 text-sm text-white focus:outline-none focus:border-emerald-500"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                        Recipient Name <span className="text-slate-500">(optional, enables 1-tap claim)</span>
                      </label>
                      <input
                        type="text"
                        placeholder="e.g. Sarah Chen"
                        value={recipientName}
                        onChange={(e) => setRecipientName(e.target.value)}
                        className="w-full min-h-[44px] bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2 text-sm text-white focus:outline-none focus:border-emerald-500"
                      />
                    </div>
                  </div>

                  {/* Submit CTA */}
                  <button
                    type="submit"
                    disabled={isSending}
                    className="w-full min-h-[48px] bg-emerald-500 hover:bg-emerald-400 disabled:opacity-60 text-slate-950 font-bold text-sm rounded-xl flex items-center justify-center gap-2 transition-colors cursor-pointer shadow-lg"
                  >
                    {parsedEmails.length > 1 ? (
                      <>
                        <Users className="w-4 h-4" />
                        <span>
                          {isSending
                            ? 'Sending VIP Swarm Invites...'
                            : `Email ${parsedEmails.length} VIP Invites & Generate Passes`}
                        </span>
                      </>
                    ) : parsedEmails.length === 1 ? (
                      <>
                        <Send className="w-4 h-4" />
                        <span>
                          {isSending ? 'Transmitting Email & Pass...' : 'Send Invite Email & Generate Link'}
                        </span>
                      </>
                    ) : (
                      <>
                        <Share2 className="w-4 h-4" />
                        <span>{isSending ? 'Generating Pass...' : 'Create Instant Shareable Link & QR'}</span>
                      </>
                    )}
                  </button>
                </form>

                {/* Created Pass Result */}
                {latestInvite && (
                  <div className="bg-slate-950 border border-emerald-500/40 rounded-2xl p-4 sm:p-5 space-y-4">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                      <div className="space-y-1.5 flex-1 min-w-0">
                        <div className="flex items-center gap-2 text-emerald-400 text-xs font-bold">
                          <ShieldCheck className="w-4 h-4 shrink-0" />
                          <span>
                            {createdInvites.length > 1
                              ? `${createdInvites.length} Live VIP Invites Issued`
                              : 'Instant Share Pass Ready'}
                          </span>
                        </div>
                        <p className="text-xs text-slate-300 font-mono break-all bg-slate-900 px-3 py-2 rounded-xl border border-slate-800">
                          {latestInvite.shareUrl}
                        </p>
                        {latestInvite.emailChannel && (
                          <div className="flex flex-wrap items-center gap-2 pt-1 text-[11px] text-slate-400">
                            <span>
                              Email status:{' '}
                              <strong className="text-emerald-400">{latestInvite.emailChannel}</strong>
                            </span>
                            {latestInvite.emailPreviewUrl && (
                              <a
                                href={latestInvite.emailPreviewUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="inline-flex items-center gap-1 text-emerald-400 hover:text-emerald-300 underline font-semibold"
                              >
                                <Mail className="w-3 h-3" />
                                Open Rendered Email Preview
                                <ExternalLink className="w-3 h-3" />
                              </a>
                            )}
                          </div>
                        )}
                      </div>

                      <div className="bg-white p-2.5 rounded-xl shrink-0 self-start sm:self-center">
                        <QRCodeSVG value={latestInvite.shareUrl} size={92} />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                      <button
                        type="button"
                        onClick={() => handleCopyLink(latestInvite.shareUrl, latestInvite.inviteId)}
                        className="min-h-[44px] px-3 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-700 text-xs font-semibold text-white flex items-center justify-center gap-1.5 cursor-pointer"
                      >
                        {copiedId === latestInvite.inviteId ? (
                          <Check className="w-3.5 h-3.5 text-emerald-400" />
                        ) : (
                          <Copy className="w-3.5 h-3.5" />
                        )}
                        <span>Copy Share Link</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => handleNativeShare(latestInvite)}
                        className="min-h-[44px] px-3 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-700 text-xs font-semibold text-white flex items-center justify-center gap-1.5 cursor-pointer"
                      >
                        <Share2 className="w-3.5 h-3.5 text-cyan-400" />
                        <span>Share via Device</span>
                      </button>

                      {onPreviewClaimPortal && (
                        <button
                          type="button"
                          onClick={() => {
                            onClose();
                            onPreviewClaimPortal(latestInvite.inviteId);
                          }}
                          className="min-h-[44px] px-3 py-2 rounded-xl bg-emerald-500/20 hover:bg-emerald-500/30 border border-emerald-500/40 text-xs font-bold text-emerald-300 flex items-center justify-center gap-1.5 cursor-pointer"
                        >
                          <Eye className="w-3.5 h-3.5" />
                          <span>Open Magic Claim View</span>
                        </button>
                      )}
                    </div>
                  </div>
                )}
              </>
            ) : (
              /* History & Control Hub Tab */
              <div className="space-y-4">
                {/* Search & Status Filters */}
                <div className="space-y-2.5">
                  <div className="relative">
                    <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      placeholder="Filter by recipient, email, card name, or last 4..."
                      className="w-full min-h-[44px] bg-slate-950 border border-slate-800 rounded-xl pl-10 pr-3.5 py-2 text-xs text-white placeholder:text-slate-500 focus:outline-none focus:border-emerald-500"
                    />
                  </div>
                  <div className="flex flex-wrap items-center gap-1.5">
                    {(['all', 'claimed', 'pending', 'paused', 'revoked'] as const).map((status) => (
                      <button
                        key={status}
                        type="button"
                        onClick={() => setStatusFilter(status)}
                        className={`min-h-[36px] px-3 rounded-lg text-xs font-semibold capitalize transition-colors cursor-pointer ${
                          statusFilter === status
                            ? 'bg-emerald-500 text-slate-950 font-bold'
                            : 'bg-slate-950 text-slate-400 hover:text-white border border-slate-800'
                        }`}
                      >
                        {status}
                      </button>
                    ))}
                  </div>
                </div>

                {filteredHistory.length === 0 ? (
                  <div className="text-center py-10 text-sm text-slate-400">
                    {historyInvites.length === 0
                      ? 'No shared card invites issued yet. Create one in the previous tab.'
                      : 'No shared invites match the active filter or search.'}
                  </div>
                ) : (
                  filteredHistory.map((inv) => {
                    const isEditingLimit = editingLimitId === inv.inviteId;
                    return (
                      <div
                        key={inv.inviteId}
                        className="bg-slate-950 border border-slate-800 rounded-2xl p-4 space-y-3"
                      >
                        <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
                          <div className="min-w-0 space-y-1">
                            <div className="text-sm font-bold text-white truncate">{inv.cardName}</div>
                            <div className="text-xs text-slate-400 font-mono truncate tabular-nums">
                              {inv.cardCategory.toUpperCase()} · •••• {inv.maskedLast4} ·{' '}
                              {inv.grantedLimitAUD === 'unlimited'
                                ? 'Unlimited VIP'
                                : `$${Number(inv.grantedLimitAUD).toLocaleString()} AUD`}
                              {inv.recipientEmail ? ` · To: ${inv.recipientEmail}` : ' · Open QR Link'}
                            </div>
                            <div className="text-[11px] font-mono text-slate-300">
                              Status:{' '}
                              <span
                                className={
                                  inv.status === 'claimed'
                                    ? 'text-emerald-400 font-bold'
                                    : inv.status === 'paused'
                                    ? 'text-amber-300 font-bold'
                                    : inv.status === 'revoked'
                                    ? 'text-rose-400 font-bold'
                                    : 'text-cyan-300 font-bold'
                                }
                              >
                                {inv.status.toUpperCase()}
                              </span>
                              {inv.claimedByEmail ? ` · ${inv.claimedByName || inv.claimedByEmail}` : ''}
                              {inv.physicalDispatchStatus !== 'not_requested'
                                ? ` · Courier: ${inv.physicalDispatchStatus.replace(/_/g, ' ')}`
                                : ''}
                            </div>
                            {inv.emailPreviewUrl && (
                              <a
                                href={inv.emailPreviewUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="inline-flex items-center gap-1 text-[11px] text-emerald-400 hover:text-emerald-300 underline"
                              >
                                <ExternalLink className="w-3 h-3" />
                                <span>Open Email Preview</span>
                              </a>
                            )}
                          </div>

                          <div className="flex flex-wrap items-center gap-2 shrink-0">
                            <button
                              type="button"
                              onClick={() => handleCopyLink(inv.shareUrl, inv.inviteId)}
                              className="min-h-[40px] px-3 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-700 text-xs text-slate-200 flex items-center gap-1 cursor-pointer"
                            >
                              {copiedId === inv.inviteId ? (
                                <Check className="w-3.5 h-3.5 text-emerald-400" />
                              ) : (
                                <Copy className="w-3.5 h-3.5" />
                              )}
                              <span>Copy</span>
                            </button>
                            {onPreviewClaimPortal && inv.status !== 'revoked' && (
                              <button
                                type="button"
                                onClick={() => {
                                  onClose();
                                  onPreviewClaimPortal(inv.inviteId);
                                }}
                                className="min-h-[40px] px-3 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-700 text-xs text-emerald-300 flex items-center gap-1 cursor-pointer"
                              >
                                <Eye className="w-3.5 h-3.5" />
                                <span>Open</span>
                              </button>
                            )}
                          </div>
                        </div>

                        {/* Inline Limit Editor + Live Control Actions */}
                        {isEditingLimit ? (
                          <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-slate-800">
                            <input
                              type="text"
                              value={editingLimitValue}
                              onChange={(e) => setEditingLimitValue(e.target.value)}
                              placeholder="Amount in AUD or 'unlimited'"
                              className="flex-1 min-w-[160px] min-h-[40px] bg-slate-900 border border-slate-700 rounded-xl px-3 text-xs font-mono text-white focus:outline-none focus:border-emerald-500"
                            />
                            <button
                              type="button"
                              onClick={() => setEditingLimitValue('unlimited')}
                              className="min-h-[40px] px-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs text-emerald-300 font-semibold cursor-pointer"
                            >
                              Set Unlimited
                            </button>
                            <button
                              type="button"
                              onClick={() => handleSaveInlineLimit(inv)}
                              className="min-h-[40px] px-3.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs cursor-pointer"
                            >
                              Save Limit
                            </button>
                            <button
                              type="button"
                              onClick={() => setEditingLimitId(null)}
                              className="min-h-[40px] px-3 rounded-xl bg-slate-800 text-slate-300 text-xs cursor-pointer"
                            >
                              Cancel
                            </button>
                          </div>
                        ) : (
                          <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-slate-800">
                            {inv.status !== 'revoked' && (
                              <>
                                <button
                                  type="button"
                                  onClick={() => {
                                    setEditingLimitId(inv.inviteId);
                                    setEditingLimitValue(
                                      inv.grantedLimitAUD === 'unlimited'
                                        ? 'unlimited'
                                        : String(inv.grantedLimitAUD)
                                    );
                                  }}
                                  className="min-h-[38px] px-3 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-700 text-xs text-slate-200 flex items-center gap-1 cursor-pointer"
                                >
                                  <Edit3 className="w-3.5 h-3.5 text-cyan-400" />
                                  <span>Limit</span>
                                </button>

                                <button
                                  type="button"
                                  onClick={() => handleTogglePause(inv)}
                                  className="min-h-[38px] px-3 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-700 text-xs text-amber-300 flex items-center gap-1 cursor-pointer"
                                >
                                  {inv.status === 'paused' ? (
                                    <>
                                      <PlayCircle className="w-3.5 h-3.5" />
                                      <span>Resume</span>
                                    </>
                                  ) : (
                                    <>
                                      <PauseCircle className="w-3.5 h-3.5" />
                                      <span>Pause</span>
                                    </>
                                  )}
                                </button>

                                {(inv.allowPhysicalCard || inv.physicalDispatchStatus !== 'not_requested') && (
                                  <button
                                    type="button"
                                    onClick={() => handleAdvanceCourier(inv)}
                                    className="min-h-[38px] px-3 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-700 text-xs text-cyan-300 flex items-center gap-1 cursor-pointer"
                                  >
                                    <Truck className="w-3.5 h-3.5" />
                                    <span>Advance Courier</span>
                                  </button>
                                )}

                                <button
                                  type="button"
                                  disabled={resendingId === inv.inviteId}
                                  onClick={() => handleResendEmail(inv)}
                                  className="min-h-[38px] px-3 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-700 text-xs text-emerald-300 flex items-center gap-1 cursor-pointer disabled:opacity-50"
                                >
                                  <RefreshCw className={`w-3.5 h-3.5 ${resendingId === inv.inviteId ? 'animate-spin' : ''}`} />
                                  <span>Resend Email</span>
                                </button>

                                <button
                                  type="button"
                                  onClick={() => handleRevoke(inv.inviteId)}
                                  className="min-h-[38px] px-3 py-1.5 rounded-xl bg-rose-500/10 hover:bg-rose-500/20 border border-rose-500/30 text-xs text-rose-300 flex items-center gap-1 cursor-pointer ml-auto"
                                >
                                  <Ban className="w-3.5 h-3.5" />
                                  <span>Revoke</span>
                                </button>
                              </>
                            )}
                          </div>
                        )}
                      </div>
                    );
                  })
                )}
              </div>
            )}
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};
