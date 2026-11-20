import React, { useEffect, useState } from 'react';
import {
  Check,
  CheckCircle2,
  Copy,
  CreditCard,
  Download,
  Eye,
  EyeOff,
  Loader2,
  ShieldCheck,
  Sparkles,
  Truck,
  Wifi,
  ArrowLeft,
} from 'lucide-react';
import toast from 'react-hot-toast';
import { cardShareService, SharedCardInvite } from '../../services/cardShareService';
import { ValourianLogo } from '../bank/ValourianLogo';

interface MagicClaimPortalProps {
  inviteId: string;
  onExitToApp?: () => void;
}

export const MagicClaimPortal: React.FC<MagicClaimPortalProps> = ({ inviteId, onExitToApp }) => {
  const [invite, setInvite] = useState<SharedCardInvite | null>(null);
  const [loading, setLoading] = useState(true);
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [requestPhysical, setRequestPhysical] = useState(false);
  const [shippingAddress, setShippingAddress] = useState('');
  const [claiming, setClaiming] = useState(false);
  const [revealed, setRevealed] = useState(true);
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  useEffect(() => {
    let active = true;
    setLoading(true);
    cardShareService
      .getSharedCardInvite(inviteId)
      .then((inv) => {
        if (!active) return;
        setInvite(inv);
        if (inv) {
          setFullName(inv.claimedByName || inv.recipientName || '');
          setEmail(inv.claimedByEmail || inv.recipientEmail || '');
          setRequestPhysical(inv.allowPhysicalCard && inv.cardMode === 'virtual_and_physical');
        }
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => {
      active = false;
    };
  }, [inviteId]);

  const handleCopy = (value: string, label: string) => {
    navigator.clipboard.writeText(value);
    setCopiedKey(label);
    toast.success(`Copied ${label} to clipboard.`);
    setTimeout(() => setCopiedKey(null), 2000);
  };

  const handleDownloadPass = (passText: string, fileSlug: string) => {
    try {
      const blob = new Blob([passText], { type: 'text/plain;charset=utf-8' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `valourian-card-pass-${fileSlug}.txt`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      URL.revokeObjectURL(url);
      toast.success('Downloaded card pass credentials file.');
    } catch {
      handleCopy(passText, 'Full Checkout Bundle');
    }
  };

  const handleActivate = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!invite) return;

    const finalName = fullName.trim() || 'Valued VIP Cardholder';
    const finalEmail = email.trim() || invite.recipientEmail || 'vip@valourian.capital';
    if (!finalEmail.includes('@')) {
      toast.error('Please enter a valid email address.');
      return;
    }
    if (requestPhysical && !shippingAddress.trim()) {
      toast.error('Please enter a delivery street address for the physical card courier.');
      return;
    }

    setClaiming(true);
    try {
      const updated = await cardShareService.claimSharedCardInvite(invite.inviteId, {
        fullName: finalName,
        email: finalEmail,
        requestPhysicalCard: requestPhysical && invite.allowPhysicalCard,
        shippingAddress,
      });
      if (updated) {
        setInvite(updated);
        toast.success('Card activated immediately. Ready to copy & use at any checkout!');
      } else {
        toast.error('This share invite has been revoked or is unavailable.');
      }
    } finally {
      setClaiming(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-[100dvh] bg-slate-950 text-white flex flex-col items-center justify-center p-6">
        <Loader2 className="w-8 h-8 text-emerald-400 animate-spin mb-3" />
        <p className="text-sm text-slate-400">Verifying encrypted card pass...</p>
      </div>
    );
  }

  if (!invite || invite.status === 'revoked') {
    return (
      <div className="min-h-[100dvh] bg-slate-950 text-white flex flex-col items-center justify-center p-6">
        <div className="max-w-md w-full bg-slate-900 border border-slate-800 rounded-3xl p-6 text-center space-y-4">
          <ValourianLogo className="w-10 h-10 mx-auto" />
          <h1 className="text-lg font-bold">
            {invite?.status === 'revoked' ? 'Share Access Revoked' : 'Invite Link Not Found'}
          </h1>
          <p className="text-sm text-slate-400">
            This shared card link is no longer active. Request a fresh card invite from the cardholder.
          </p>
          {onExitToApp && (
            <button
              onClick={onExitToApp}
              className="w-full min-h-[44px] bg-slate-800 hover:bg-slate-700 text-white rounded-xl text-sm font-semibold cursor-pointer"
            >
              Return to Valourian OS
            </button>
          )}
        </div>
      </div>
    );
  }

  const limitDisplay =
    invite.grantedLimitAUD === 'unlimited'
      ? 'Unlimited VIP Facility'
      : `$${Number(invite.grantedLimitAUD).toLocaleString('en-AU', { minimumFractionDigits: 2 })} AUD`;
  const isClaimed = invite.status === 'claimed';
  const isPreAddressed = Boolean(invite.recipientEmail && invite.recipientName);
  const fullPackage = [
    `Cardholder: ${(invite.claimedByName || fullName || 'VALOURIAN VIP').toUpperCase()}`,
    `Card Number: ${invite.fullNumber}`,
    `Expiry: ${invite.expiry}`,
    `CVV: ${invite.cvv}`,
    `PIN: ${invite.pin}`,
    `BSB: ${invite.bsb}`,
    `Account: ${invite.accountNumber}`,
    `PayID: ${invite.payId}`,
  ].join('\n');

  return (
    <div className="min-h-[100dvh] bg-slate-950 text-slate-100 py-6 px-4 sm:px-6">
      <div className="max-w-xl mx-auto space-y-5">
        {/* Top Brand Bar */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <ValourianLogo className="w-8 h-8" />
            <div>
              <div className="text-sm font-bold text-white">Valourian Express Access</div>
              <div className="text-xs text-slate-400">
                Shared by {invite.senderName} · Minimal-Doc Activation
              </div>
            </div>
          </div>
          {onExitToApp && (
            <button
              onClick={onExitToApp}
              className="min-h-[40px] px-3 py-1.5 rounded-xl bg-slate-900 border border-slate-800 text-xs font-semibold text-slate-300 hover:text-white flex items-center gap-1.5 cursor-pointer"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Workspace</span>
            </button>
          )}
        </div>

        {/* Visual Card Preview */}
        <div className="aspect-[1.586/1] w-full rounded-3xl p-6 sm:p-7 bg-gradient-to-br from-slate-900 via-emerald-950/60 to-slate-950 border border-emerald-500/35 shadow-2xl flex flex-col justify-between relative overflow-hidden">
          <div className="flex items-start justify-between gap-2">
            <div>
              <div className="text-[11px] font-mono font-bold uppercase tracking-wider text-emerald-400">
                {invite.cardCategory === 'debit' ? 'Bank Debit Card' : 'Bank Credit Card'} · {invite.network}
              </div>
              <h2 className="text-base sm:text-lg font-bold text-white mt-0.5 line-clamp-1">
                {invite.cardName}
              </h2>
            </div>
            <Wifi className="w-5 h-5 text-emerald-300 rotate-90 shrink-0" />
          </div>

          <div className="space-y-1">
            <div className="flex items-center justify-between gap-2">
              <span className="font-mono text-lg sm:text-2xl font-bold tracking-widest tabular-nums text-white">
                {isClaimed
                  ? revealed
                    ? invite.formattedNumber
                    : `•••• •••• •••• ${invite.maskedLast4}`
                  : `•••• •••• •••• ${invite.maskedLast4}`}
              </span>
              {isClaimed && (
                <button
                  type="button"
                  onClick={() => setRevealed(!revealed)}
                  className="p-2 rounded-lg bg-white/10 hover:bg-white/20 text-white cursor-pointer"
                  aria-label="Toggle reveal digits"
                >
                  {revealed ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              )}
            </div>
            <div className="text-xs text-slate-300 font-mono">
              {invite.allowPhysicalCard ? 'Virtual + Physical Card Ready' : 'Instant Virtual Access'}
            </div>
          </div>

          <div className="flex items-end justify-between text-xs font-mono pt-3 border-t border-white/10">
            <div>
              <div className="text-[10px] text-slate-400 uppercase">Holder</div>
              <div className="font-bold text-white uppercase">
                {invite.claimedByName || fullName || 'INSTANT GUEST VIP'}
              </div>
            </div>
            {isClaimed && (
              <>
                <div>
                  <div className="text-[10px] text-slate-400 uppercase">Expires</div>
                  <div className="font-bold text-white">{invite.expiry}</div>
                </div>
                <div>
                  <div className="text-[10px] text-slate-400 uppercase">CVV</div>
                  <div className="font-bold text-emerald-400">{invite.cvv}</div>
                </div>
              </>
            )}
            <div className="text-right">
              <div className="text-[10px] text-slate-400 uppercase">Allowance</div>
              <div className="font-bold text-emerald-400 tabular-nums">{limitDisplay}</div>
            </div>
          </div>
        </div>

        {/* Claim Step OR Unlocked Merchant Copy Panel */}
        {!isClaimed ? (
          <form
            onSubmit={handleActivate}
            className="bg-slate-900 border border-slate-800 rounded-3xl p-5 sm:p-6 space-y-4 shadow-xl"
          >
            <div>
              <h3 className="text-base font-bold text-white">
                {isPreAddressed ? '1-Tap Magic Activation' : '2-Field Instant Card Access'}
              </h3>
              <p className="text-xs text-slate-400 mt-1">
                Zero lengthy underwriting · Zero ID document upload · Immediate checkout activation
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">Full Name</label>
                <input
                  type="text"
                  required
                  placeholder="Your full name"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  className="w-full min-h-[44px] bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2 text-sm text-white focus:outline-none focus:border-emerald-500"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">Email Address</label>
                <input
                  type="email"
                  required
                  placeholder="you@domain.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full min-h-[44px] bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2 text-sm text-white focus:outline-none focus:border-emerald-500"
                />
              </div>
            </div>

            {invite.allowPhysicalCard && (
              <div className="bg-slate-950 border border-slate-800 rounded-2xl p-4 space-y-3">
                <div className="flex items-center justify-between gap-3">
                  <div className="flex items-center gap-2">
                    <Truck className="w-4 h-4 text-emerald-400 shrink-0" />
                    <div>
                      <div className="text-xs font-bold text-white">
                        Also Ship Physical Titanium/Metal Card
                      </div>
                      <div className="text-[11px] text-slate-400">
                        Express courier included while virtual card works right away
                      </div>
                    </div>
                  </div>
                  <input
                    type="checkbox"
                    checked={requestPhysical}
                    onChange={(e) => setRequestPhysical(e.target.checked)}
                    className="w-5 h-5 accent-emerald-500 cursor-pointer"
                  />
                </div>
                {requestPhysical && (
                  <div className="space-y-2">
                    <input
                      type="text"
                      placeholder="Delivery street address, suburb, postcode & country"
                      value={shippingAddress}
                      onChange={(e) => setShippingAddress(e.target.value)}
                      className="w-full min-h-[44px] bg-slate-900 border border-slate-700 rounded-xl px-3.5 py-2 text-sm text-white focus:outline-none focus:border-emerald-500"
                    />
                    <button
                      type="button"
                      onClick={() => setShippingAddress('Unit 712, 15 Barton Rd, Artarmon NSW 2064, Australia')}
                      className="compact-touch text-[11px] font-mono text-emerald-400 hover:text-emerald-300 underline cursor-pointer"
                    >
                      Use Default Sydney Dispatch Hub (Artarmon NSW 2064)
                    </button>
                  </div>
                )}
              </div>
            )}

            <button
              type="submit"
              disabled={claiming}
              className="w-full min-h-[48px] bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-sm rounded-xl flex items-center justify-center gap-2 transition-colors cursor-pointer shadow-lg"
            >
              <CreditCard className="w-4 h-4" />
              <span>
                {claiming
                  ? 'Activating Card...'
                  : requestPhysical
                  ? 'Activate Virtual Card & Dispatch Physical'
                  : 'Activate Card Now'}
              </span>
            </button>
          </form>
        ) : (
          <div className="bg-slate-900 border border-emerald-500/35 rounded-3xl p-5 sm:p-6 space-y-4 shadow-xl">
            <div className="flex items-center justify-between gap-2">
              <div className="flex items-center gap-2 text-emerald-400 font-bold text-sm">
                <ShieldCheck className="w-5 h-5" />
                <span>Card Active · Ready for Immediate Checkout</span>
              </div>
              {invite.physicalDispatchStatus !== 'not_requested' && (
                <span className="text-xs font-mono text-cyan-300">Courier Queued</span>
              )}
            </div>

            {invite.physicalDispatchStatus !== 'not_requested' && invite.physicalShippingAddress && (
              <div className="bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-xs text-slate-300 flex items-center gap-2">
                <Truck className="w-4 h-4 text-cyan-400 shrink-0" />
                <span>Physical card queued for courier dispatch to: {invite.physicalShippingAddress}</span>
              </div>
            )}

            {/* Clean Copy Buttons */}
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
              <button
                type="button"
                onClick={() => handleCopy(invite.fullNumber, 'Digits (No Spaces)')}
                className="min-h-[44px] px-3 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs flex items-center justify-center gap-1.5 cursor-pointer"
              >
                {copiedKey === 'Digits (No Spaces)' ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                <span>Copy Digits</span>
              </button>
              <button
                type="button"
                onClick={() => handleCopy(invite.formattedNumber, 'With Spaces')}
                className="min-h-[44px] px-3 py-2 rounded-xl bg-slate-950 hover:bg-slate-800 border border-slate-700 text-white font-semibold text-xs flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <Copy className="w-3.5 h-3.5" />
                <span>With Spaces</span>
              </button>
              <button
                type="button"
                onClick={() => handleCopy(invite.cvv, 'CVV')}
                className="min-h-[44px] px-3 py-2 rounded-xl bg-slate-950 hover:bg-slate-800 border border-slate-700 text-emerald-300 font-mono font-bold text-xs flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <Copy className="w-3.5 h-3.5" />
                <span>CVV {invite.cvv}</span>
              </button>
              <button
                type="button"
                onClick={() => handleCopy(invite.expiry, 'Expiry')}
                className="min-h-[44px] px-3 py-2 rounded-xl bg-slate-950 hover:bg-slate-800 border border-slate-700 text-white font-mono text-xs flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <Copy className="w-3.5 h-3.5" />
                <span>Exp {invite.expiry}</span>
              </button>
              <button
                type="button"
                onClick={() => handleCopy(`${invite.bsb} ${invite.accountNumber}`, 'BSB & Account')}
                className="min-h-[44px] px-3 py-2 rounded-xl bg-slate-950 hover:bg-slate-800 border border-slate-700 text-white font-mono text-xs flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <Copy className="w-3.5 h-3.5" />
                <span>BSB {invite.bsb}</span>
              </button>
              <button
                type="button"
                onClick={() => handleCopy(fullPackage, 'Full Checkout Bundle')}
                className="min-h-[44px] px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-semibold text-xs flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <Copy className="w-3.5 h-3.5" />
                <span>Copy Full</span>
              </button>
              <button
                type="button"
                onClick={() => handleDownloadPass(fullPackage, invite.maskedLast4)}
                className="col-span-2 sm:col-span-3 min-h-[44px] px-3 py-2 rounded-xl bg-slate-950 hover:bg-slate-800 border border-emerald-500/35 text-emerald-300 font-semibold text-xs flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Save Offline VIP Card Pass (.txt)</span>
              </button>
            </div>
          </div>
        )}

        {/* Auto-Shared VIP Benefits Certificate */}
        {invite.autoShareVipBenefits && invite.vipBenefits.length > 0 && (
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-5 space-y-3">
            <div className="flex items-center gap-2 text-xs font-bold text-emerald-400 uppercase tracking-wider">
              <Sparkles className="w-4 h-4" />
              <span>Included Auto-Shared VIP Benefits</span>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs text-slate-200">
              {invite.vipBenefits.map((perk) => (
                <div key={perk} className="flex items-center gap-2 bg-slate-950 px-3 py-2 rounded-xl border border-slate-800">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                  <span>{perk}</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
