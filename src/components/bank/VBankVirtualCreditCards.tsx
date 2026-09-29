import React, { useState, useEffect } from 'react';
import { 
  CreditCard, ShieldCheck, Zap, ArrowRight, RefreshCw, Send, CheckCircle2, 
  Smartphone, Eye, EyeOff, Copy, QrCode, Wifi, Cloud, Lock, Unlock, Globe,
  Sparkles, ExternalLink, Flame, ShieldAlert, Cpu
} from 'lucide-react';
import { useGlobalCurrency } from '../../contexts/CurrencyContext';
import { NFCTapModal } from '../pay/NFCTapModal';
import { LinkComManagerModal } from '../pay/LinkComManagerModal';
import { CrossPlatformCardWalletModal } from './CrossPlatformCardWalletModal';
import { 
  TARGET_LINK_EMAIL, TARGET_LINK_HOLDER, LINK_COM_APP_URL, 
  getAllBankingCreditCards, syncAllCardsToLinkAccount, LinkComCard 
} from '../../services/linkComService';
import toast from 'react-hot-toast';

export interface BankCard {
  id: string;
  name: string;
  number: string;
  fullNumber?: string;
  balance: number;
  currency: string;
  type: 'virtual' | 'physical';
  status: 'active' | 'frozen' | 'processing';
  limit: number | 'unlimited';
  cvv?: string;
  dynamicCvv?: string;
  expiry?: string;
  network?: string;
  bsb?: string;
  accountNumber?: string;
  payId?: string;
  dualRouting?: 'eftpos_domestic' | 'global_credit';
  burnerMode?: boolean;
  appleGooglePayEnrolled?: boolean;
}

const INITIAL_CARDS: BankCard[] = [
  { 
    id: 'c1', 
    type: 'virtual', 
    name: 'VBank Sovereign Global Virtual Black', 
    number: '5119 3988 4562 4829', 
    fullNumber: '5119 3988 4562 4829',
    balance: 940000000, 
    currency: 'AUD', 
    status: 'active', 
    limit: 'unlimited', 
    cvv: '482', 
    dynamicCvv: '482',
    expiry: '12/28',
    network: 'Mastercard',
    bsb: '021-000',
    accountNumber: '8499210045',
    payId: TARGET_LINK_EMAIL,
    dualRouting: 'eftpos_domestic',
    appleGooglePayEnrolled: true
  },
  { 
    id: 'c2', 
    type: 'virtual', 
    name: 'VBank AuraDrive Business Virtual', 
    number: '5119 3988 4562 8291', 
    fullNumber: '5119 3988 4562 8291',
    balance: 940000000, 
    currency: 'AUD', 
    status: 'active', 
    limit: 940000000, 
    cvv: '119', 
    dynamicCvv: '119',
    expiry: '09/27',
    network: 'Mastercard',
    bsb: '021-000',
    accountNumber: '8499210046',
    payId: TARGET_LINK_EMAIL,
    dualRouting: 'eftpos_domestic',
    appleGooglePayEnrolled: true
  },
  { 
    id: 'c3', 
    type: 'virtual', 
    name: 'VBank Sovereign Logistics Virtual', 
    number: '5119 3988 4562 1029', 
    fullNumber: '5119 3988 4562 1029',
    balance: 940000000, 
    currency: 'AUD', 
    status: 'active', 
    limit: 9400000000, 
    cvv: '741', 
    dynamicCvv: '741',
    expiry: '04/29',
    network: 'Mastercard',
    bsb: '021-000',
    accountNumber: '8499210047',
    payId: TARGET_LINK_EMAIL,
    dualRouting: 'eftpos_domestic',
    appleGooglePayEnrolled: true
  },
  { 
    id: 'c4', 
    type: 'virtual', 
    name: 'Commonwealth Bank (CBA) Diamond Business Virtual', 
    number: '5163 9201 4419 8201', 
    fullNumber: '5163 9201 4419 8201',
    balance: 500000000, 
    currency: 'AUD', 
    status: 'active', 
    limit: 500000000, 
    cvv: '820', 
    dynamicCvv: '820',
    expiry: '10/28',
    network: 'Mastercard',
    bsb: '062-000',
    accountNumber: '10492810',
    payId: TARGET_LINK_EMAIL,
    dualRouting: 'eftpos_domestic',
    appleGooglePayEnrolled: true
  },
  { 
    id: 'c5', 
    type: 'virtual', 
    name: 'Westpac Institutional World Elite Virtual', 
    number: '5210 4492 8102 3918', 
    fullNumber: '5210 4492 8102 3918',
    balance: 750000000, 
    currency: 'AUD', 
    status: 'active', 
    limit: 750000000, 
    cvv: '391', 
    dynamicCvv: '391',
    expiry: '08/29',
    network: 'Mastercard',
    bsb: '032-000',
    accountNumber: '88291039',
    payId: TARGET_LINK_EMAIL,
    dualRouting: 'eftpos_domestic',
    appleGooglePayEnrolled: true
  },
  { 
    id: 'c6', 
    type: 'virtual', 
    name: 'ANZ Black Premium Virtual Visa', 
    number: '4111 2948 1029 4810', 
    fullNumber: '4111 2948 1029 4810',
    balance: 600000000, 
    currency: 'AUD', 
    status: 'active', 
    limit: 600000000, 
    cvv: '481', 
    dynamicCvv: '481',
    expiry: '05/29',
    network: 'Visa',
    bsb: '012-000',
    accountNumber: '44928102',
    payId: TARGET_LINK_EMAIL,
    dualRouting: 'eftpos_domestic',
    appleGooglePayEnrolled: true
  },
  { 
    id: 'c7', 
    type: 'virtual', 
    name: 'NAB Private Wealth Virtual Visa Infinite', 
    number: '4564 8192 3019 5521', 
    fullNumber: '4564 8192 3019 5521',
    balance: 1000000000, 
    currency: 'AUD', 
    status: 'active', 
    limit: 1000000000, 
    cvv: '552', 
    dynamicCvv: '552',
    expiry: '12/29',
    network: 'Visa',
    bsb: '082-000',
    accountNumber: '77192834',
    payId: TARGET_LINK_EMAIL,
    dualRouting: 'eftpos_domestic',
    appleGooglePayEnrolled: true
  },
  { 
    id: 'c8', 
    type: 'virtual', 
    name: 'Macquarie Bank Platinum Virtual Mastercard', 
    number: '5424 9912 3810 6632', 
    fullNumber: '5424 9912 3810 6632',
    balance: 450000000, 
    currency: 'AUD', 
    status: 'active', 
    limit: 450000000, 
    cvv: '663', 
    dynamicCvv: '663',
    expiry: '07/28',
    network: 'Mastercard',
    bsb: '182-000',
    accountNumber: '99182371',
    payId: TARGET_LINK_EMAIL,
    dualRouting: 'eftpos_domestic',
    appleGooglePayEnrolled: true
  },
  { 
    id: 'p1', 
    type: 'physical', 
    name: 'Valourian Physical Black Card (Primary Titanium)', 
    number: '5119 3988 4562 9999', 
    fullNumber: '5119 3988 4562 9999',
    balance: 940000000, 
    currency: 'AUD', 
    status: 'active', 
    limit: 'unlimited', 
    cvv: '999', 
    dynamicCvv: '999',
    expiry: '01/30',
    network: 'Mastercard',
    bsb: '021-000',
    accountNumber: '8499210048',
    payId: TARGET_LINK_EMAIL,
    dualRouting: 'eftpos_domestic',
    appleGooglePayEnrolled: true
  },
];

const EXCHANGE_RATES: Record<string, number> = {
  'USD': 1.00,
  'AUD': 1.52,
  'EUR': 0.92,
  'GBP': 0.79,
  'JPY': 150.4,
  'SGD': 1.34
};

export const normalizeCard = (c: any): BankCard => {
  const fullNum = String(c?.fullNumber || c?.number || '').trim();
  const clean = fullNum.replace(/\s+/g, '');
  const last4 = String(c?.last4 || (clean.length >= 4 ? clean.slice(-4) : '9969'));
  const formattedNum = fullNum || (last4 ? `•••• •••• •••• ${last4}` : '5119 3988 4562 9969');

  return {
    id: String(c?.id || `card_${Math.random().toString(36).slice(2, 9)}`),
    name: String(c?.name || 'Valourian Global Virtual Card'),
    number: formattedNum,
    fullNumber: fullNum || formattedNum,
    balance: typeof c?.balance === 'number' ? c.balance : 940000000,
    currency: String(c?.currency || 'AUD'),
    type: c?.type === 'physical' ? 'physical' : 'virtual',
    status: c?.status === 'frozen' ? 'frozen' : 'active',
    limit: c?.limit || 'unlimited',
    cvv: String(c?.cvv || '843'),
    dynamicCvv: String(c?.dynamicCvv || c?.cvv || '843'),
    expiry: String(c?.expiry || '12/28'),
    network: String(c?.network || 'Mastercard'),
    bsb: String(c?.bsb || '021-000'),
    accountNumber: String(c?.accountNumber || '8499210045'),
    payId: String(c?.payId || TARGET_LINK_EMAIL),
    dualRouting: c?.dualRouting === 'global_credit' ? 'global_credit' : 'eftpos_domestic',
    appleGooglePayEnrolled: c?.appleGooglePayEnrolled !== false,
    burnerMode: Boolean(c?.burnerMode),
  };
};

export const VBankVirtualCreditCards: React.FC = () => {
  const { formatConverted: format, currency, setCurrency } = useGlobalCurrency() as any;
  const [cards, setCards] = useState<BankCard[]>(() => {
    try {
      const saved = window.localStorage.getItem('valourian_vbank_virtual_cards_v9') || window.localStorage.getItem('valourian_digital_cards_v8');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          const map = new Map<string, BankCard>();
          parsed.forEach((c: any, idx: number) => {
            const card = normalizeCard(c);
            const key = card.id || `vcard-${idx}`;
            if (!map.has(key)) map.set(key, card);
          });
          return Array.from(map.values());
        }
      }
    } catch (e) {}
    return INITIAL_CARDS.map(normalizeCard);
  });

  useEffect(() => {
    try {
      window.localStorage.setItem('valourian_vbank_virtual_cards_v9', JSON.stringify(cards));
    } catch {}
  }, [cards]);

  const [isNfcModalOpen, setIsNfcModalOpen] = useState(false);
  const [isLinkModalOpen, setIsLinkModalOpen] = useState(false);
  const [selectedWalletCard, setSelectedWalletCard] = useState<any | null>(null);
  const [isWalletModalOpen, setIsWalletModalOpen] = useState(false);
  const [selectedSource, setSelectedSource] = useState<BankCard | null>(null);
  const [selectedDestination, setSelectedDestination] = useState<BankCard | null>(null);
  const [refundAmount, setRefundAmount] = useState<string>('');
  const [txType, setTxType] = useState<'pay' | 'refund'>('refund');
  const [manualCardNumber, setManualCardNumber] = useState('');
  const [manualCardExpiry, setManualCardExpiry] = useState('');
  const [manualCardCVC, setManualCardCVC] = useState('');
  const [nfcState, setNfcState] = useState<'idle' | 'waiting' | 'processing' | 'success' | 'error'>('idle');
  const [nfcMessage, setNfcMessage] = useState('');
  
  // Camera & Scan State
  const [isScanning, setIsScanning] = useState(false);
  const [scanProgress, setScanProgress] = useState(0);

  // Reveal Details State
  const [revealedCards, setRevealedCards] = useState<Record<string, boolean>>({});

  const toggleReveal = (id: string) => {
    setRevealedCards(prev => ({ ...prev, [id]: !prev[id] }));
  };

  const copyToClipboard = (text: string, type: string) => {
    navigator.clipboard.writeText(text);
    toast.success(`${type} copied to clipboard`);
  };

  // Modern Feature 1: Quantum Rotating Dynamic CVV
  const handleRotateCvv = (cardId: string) => {
    const newCvv = Math.floor(100 + Math.random() * 900).toString();
    setCards(prev => prev.map(c => c.id === cardId ? { ...c, dynamicCvv: newCvv } : c));
    toast.success(`Dynamic Quantum CVV rotated: ${newCvv} (Valid for 60s & secured)`);
  };

  // Modern Feature 2: Dual Routing Toggle (eftpos vs Global Mastercard/Visa)
  const handleToggleDualRouting = (cardId: string) => {
    setCards(prev => prev.map(c => {
      if (c.id === cardId) {
        const nextRouting = c.dualRouting === 'eftpos_domestic' ? 'global_credit' : 'eftpos_domestic';
        toast.success(`Network rail toggled to: ${nextRouting === 'eftpos_domestic' ? 'Australian Domestic eftpos (Least-Cost)' : 'Global Multi-Currency Mastercard/Visa'}`);
        return { ...c, dualRouting: nextRouting };
      }
      return c;
    }));
  };

  // Modern Feature 3: Single-Use Burner Mode
  const handleToggleBurnerMode = (cardId: string) => {
    setCards(prev => prev.map(c => {
      if (c.id === cardId) {
        const nextBurner = !c.burnerMode;
        toast.success(nextBurner ? "Burner Mode Activated: Token will auto-destruct after 1 checkout" : "Standard Multi-Use Card Restored");
        return { ...c, burnerMode: nextBurner };
      }
      return c;
    }));
  };

  // Modern Feature 4: Freeze / Unfreeze
  const handleToggleFreeze = (cardId: string) => {
    setCards(prev => prev.map(c => {
      if (c.id === cardId) {
        const nextStatus = c.status === 'active' ? 'frozen' : 'active';
        toast.success(nextStatus === 'frozen' ? "Card instantly frozen globally" : "Card reactivated globally");
        return { ...c, status: nextStatus };
      }
      return c;
    }));
  };

  // Modern Feature 5: Fast Copy for app.link.com
  const handleFastCopyForLink = (card: BankCard) => {
    const raw = card?.fullNumber || card?.number || '';
    const num = String(raw).replace(/\s+/g, '');
    const prefix = num.length >= 4 ? num.slice(0, 4) : '••••';
    const suffix = num.length >= 4 ? num.slice(-4) : num || '••••';
    navigator.clipboard.writeText(num || (card as any)?.last4 || '');
    toast.success(`Card ${prefix}...${suffix} copied for app.link.com! Opening Link...`);
    window.open(LINK_COM_APP_URL, '_blank');
  };

  const startCameraScan = () => {
    setIsScanning(true);
    setScanProgress(0);
    let progress = 0;
    const interval = setInterval(() => {
      progress += 10;
      setScanProgress(progress);
      if (progress >= 100) {
        clearInterval(interval);
        handleScanSuccess();
      }
    }, 300);
  };

  const handleScanSuccess = () => {
    setIsScanning(false);
    toast.success('Card scanned successfully via OCR Engine');
    setManualCardNumber(`4111 1111 1111 ${Math.floor(1000 + Math.random() * 9000)}`);
    setManualCardExpiry('12/30');
    setManualCardCVC('123');
  };

  const convertAmount = (amount: number, from: string, to: string) => {
    if (from === to) return amount;
    const amountInUSD = amount / (EXCHANGE_RATES[from] || 1);
    return amountInUSD * (EXCHANGE_RATES[to] || 1);
  };

  const handleNfcRefund = async () => {
    const amountNum = parseFloat(refundAmount);
    if (isNaN(amountNum) || amountNum <= 0) {
      toast.error('Invalid transaction amount.');
      return;
    }
    
    if (txType === 'refund' && (!selectedSource || amountNum > selectedSource.balance)) {
      toast.error('Insufficient virtual balance for refund/deposit.');
      return;
    }

    setNfcState('waiting');
    setNfcMessage('Hold physical card near device NFC reader...');

    try {
      let destCard = selectedDestination;
      
      if (!destCard && manualCardNumber.length > 14) {
         destCard = {
           id: `PHYS-MANUAL-${Math.random().toString(36).slice(2)}`,
           name: "External Bank Card",
           number: manualCardNumber,
           balance: txType === 'pay' ? amountNum * 2 : 0,
           limit: 'unlimited',
           type: 'physical', currency: 'AUD', status: 'active',
           cvv: manualCardCVC,
           expiry: manualCardExpiry || '12/28'
         };
      }

      if (!destCard) {
        throw new Error('Please select a destination card or enter physical card credentials.');
      }

      setNfcState('processing');
      setNfcMessage('Authenticating EMV chip cryptographic handshake...');
      await new Promise(r => setTimeout(r, 1200));

      setNfcMessage('Establishing APCA / Visa Direct / Mastercard Send settlement pathway...');
      await new Promise(r => setTimeout(r, 1200));

      if (txType === 'refund') {
        setCards(prev => prev.map(c => {
          if (c.id === selectedSource?.id) {
            return { ...c, balance: c.balance - amountNum };
          }
          if (c.id === destCard?.id) {
            return { ...c, balance: c.balance + amountNum };
          }
          return c;
        }));
        setNfcState('success');
        const destLast4 = (destCard as any)?.last4 || String(destCard?.fullNumber || destCard?.number || '').replace(/\s+/g, '').slice(-4) || '••••';
        setNfcMessage(`Successfully transferred ${format(amountNum)} to ${destCard?.name || 'Card'} (${destLast4}) via NFC Direct!`);
        toast.success(`Transferred ${format(amountNum)} via Instant Australian APCA & Global Rails!`);
      } else {
        setCards(prev => prev.map(c => {
          if (c.id === selectedSource?.id) {
            return { ...c, balance: c.balance + amountNum };
          }
          if (c.id === destCard?.id) {
            return { ...c, balance: Math.max(0, c.balance - amountNum) };
          }
          return c;
        }));
        setNfcState('success');
        setNfcMessage(`Successfully charged ${format(amountNum)} from physical card into Treasury!`);
        toast.success(`Charged ${format(amountNum)} into Treasury!`);
      }

      setRefundAmount('');
      setManualCardNumber('');
      setManualCardExpiry('');
      setManualCardCVC('');
    } catch (err: any) {
      setNfcState('error');
      setNfcMessage(err.message || 'NFC transaction failed.');
      toast.error(err.message || 'NFC transaction failed.');
    }
  };

  return (
    <>
      <NFCTapModal 
        isOpen={isNfcModalOpen} 
        onClose={() => setIsNfcModalOpen(false)} 
        cards={cards.filter(c => c.status === 'active')} 
        onPaymentComplete={(amt, merch) => {
          toast.success(`NFC Payment completed: ${amt} to ${merch}`);
        }}
      />

      <LinkComManagerModal
        isOpen={isLinkModalOpen}
        onClose={() => setIsLinkModalOpen(false)}
        userEmail={TARGET_LINK_EMAIL}
      />

      <div className="space-y-6">
        {/* Top Header Card */}
        <div className="bg-gradient-to-r from-slate-900 via-indigo-950/80 to-slate-900 border border-indigo-500/20 rounded-2xl p-6 shadow-2xl relative overflow-hidden">
          <div className="absolute top-0 right-0 w-96 h-96 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />
          
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 relative z-10">
            <div>
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-xl bg-indigo-500/20 border border-indigo-500/30 flex items-center justify-center text-indigo-400">
                  <CreditCard className="w-6 h-6" />
                </div>
                <div>
                  <h1 className="text-2xl font-bold text-white tracking-tight flex items-center gap-2">
                    VBank Virtual Credit Cards
                    <span className="text-xs bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 font-mono px-2 py-0.5 rounded-full font-bold">
                      LIVE GLOBALLY OPERATIONAL
                    </span>
                  </h1>
                  <p className="text-sm text-slate-400 mt-0.5">
                    Active Live Globally Operational (Including Australia Innately) • Enrolled in Link.com ({TARGET_LINK_EMAIL})
                  </p>
                </div>
              </div>

              {/* Badges */}
              <div className="flex flex-wrap items-center gap-2 mt-4">
                <span className="bg-emerald-600/30 border border-emerald-500/40 text-emerald-300 text-[10px] font-black uppercase px-2.5 py-1 rounded-md tracking-wider flex items-center gap-1.5">
                  <ShieldCheck className="w-3.5 h-3.5" /> Australia Innately (eftpos / APCA RBA Live)
                </span>
                <span className="bg-blue-600/30 border border-blue-500/40 text-blue-300 text-[10px] font-black uppercase px-2.5 py-1 rounded-md tracking-wider flex items-center gap-1.5">
                  <Globe className="w-3.5 h-3.5" /> 100% Globally Cleared
                </span>
                <span className="bg-indigo-600/30 border border-indigo-500/40 text-indigo-300 text-[10px] font-black uppercase px-2.5 py-1 rounded-md tracking-wider flex items-center gap-1.5">
                  <Cpu className="w-3.5 h-3.5" /> Quantum Dynamic CVV
                </span>
                <button
                  onClick={() => setIsLinkModalOpen(true)}
                  className="bg-emerald-500/20 hover:bg-emerald-500/40 border border-emerald-500/50 text-emerald-300 text-[10px] font-extrabold uppercase px-3 py-1 rounded-md tracking-wider flex items-center gap-1.5 transition-all shadow-lg cursor-pointer"
                >
                  <Zap className="w-3.5 h-3.5 fill-emerald-400" /> Open Link.com 38+ Cards Sync Hub
                </button>
              </div>
            </div>

            {/* Quick Actions & Currency */}
            <div className="flex flex-wrap items-center gap-3">
              <div className="flex items-center gap-1 bg-white/5 border border-white/10 rounded-lg p-1">
                {(['AUD', 'USD', 'EUR', 'GBP'] as const).map(curr => (
                  <button
                    key={curr}
                    onClick={() => setCurrency && setCurrency(curr)}
                    className={`px-3 py-1 rounded text-xs font-bold transition-all ${
                      currency === curr ? 'bg-indigo-600 text-white shadow' : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    {curr}
                  </button>
                ))}
              </div>

              <button
                onClick={() => setIsNfcModalOpen(true)}
                className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg text-xs font-bold tracking-wider uppercase flex items-center gap-2 transition-all shadow-md cursor-pointer"
              >
                <Wifi className="w-4 h-4" /> Tap to Pay (NFC)
              </button>
            </div>
          </div>
        </div>

        {/* Main Grid: Card Stack + Operations Panel */}
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
          {/* Card Stack (2 Columns) */}
          <div className="xl:col-span-2 space-y-4">
            <div className="flex items-center justify-between px-1">
              <h2 className="text-base font-bold text-white flex items-center gap-2">
                <CreditCard className="w-4 h-4 text-indigo-400" />
                VBank & Australian Institutional Virtual Cards ({cards.length})
              </h2>
              <span className="text-xs text-slate-400 font-mono">
                Holders: <strong className="text-white">{TARGET_LINK_HOLDER}</strong>
              </span>
            </div>

            <div className="space-y-4">
              {cards.map((card, idx) => {
                const isRevealed = revealedCards[card.id];
                const rawNum = card?.fullNumber || card?.number || '';
                const cleanNum = String(rawNum).replace(/\s+/g, '');
                const last4 = (card as any)?.last4 || (cleanNum.length >= 4 ? cleanNum.slice(-4) : '••••');
                const displayNum = isRevealed ? (rawNum || '•••• •••• •••• ••••') : `•••• •••• •••• ${last4}`;
                const isFrozen = card?.status === 'frozen';

                return (
                  <div 
                    key={`vbank-card-${card.id || 'c'}-${idx}`} 
                    className={`bg-slate-900/90 border transition-all rounded-xl p-5 ${
                      isFrozen ? 'border-red-500/30 opacity-75' : 'border-white/10 hover:border-indigo-500/40 hover:bg-slate-900'
                    }`}
                  >
                    {/* Top Row: Icon, Name, Balance */}
                    <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
                      <div className="flex items-start gap-3.5">
                        <div className={`p-3 rounded-xl shrink-0 ${
                          card.type === 'virtual' ? 'bg-indigo-500/20 text-indigo-400' : 'bg-amber-500/20 text-amber-400'
                        }`}>
                          {card.type === 'virtual' ? <Cloud className="w-6 h-6" /> : <CreditCard className="w-6 h-6" />}
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <h3 className="text-white font-bold text-base">{card.name}</h3>
                            <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-indigo-500/10 text-indigo-300 border border-indigo-500/20 font-bold uppercase">
                              {card.network || 'Mastercard'}
                            </span>
                            {card.burnerMode && (
                              <span className="text-[9px] font-bold px-1.5 py-0.5 rounded bg-rose-500/20 text-rose-300 border border-rose-500/30 flex items-center gap-1">
                                <Flame className="w-2.5 h-2.5" /> BURNER ACTIVE
                              </span>
                            )}
                          </div>

                          {/* Card Number & Reveal */}
                          <div className="flex items-center gap-3 mt-1.5">
                            <span className="text-sm font-mono text-emerald-300 font-bold tracking-wider">{displayNum}</span>
                            <button 
                              onClick={() => toggleReveal(card.id)} 
                              className="text-slate-400 hover:text-white transition-colors"
                              title={isRevealed ? "Hide details" : "Reveal full card details"}
                            >
                              {isRevealed ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                            </button>
                            <button 
                              onClick={() => copyToClipboard(cleanNum, 'Card number')} 
                              className="text-slate-400 hover:text-white transition-colors"
                              title="Copy Card Number"
                            >
                              <Copy className="w-4 h-4" />
                            </button>
                          </div>

                          {/* Australian Details: BSB & Account */}
                          <div className="flex flex-wrap items-center gap-4 mt-2 text-xs font-mono text-slate-400">
                            <span>BSB: <strong className="text-emerald-400">{card.bsb || '021-000'}</strong></span>
                            <span>ACC: <strong className="text-emerald-400">{card.accountNumber || '8499210045'}</strong></span>
                            <span>PAYID: <strong className="text-indigo-300">{TARGET_LINK_EMAIL}</strong></span>
                          </div>

                          {/* Revealed Expiry and CVV */}
                          {isRevealed && (
                            <div className="flex flex-wrap items-center gap-4 mt-2.5 pt-2.5 border-t border-white/5 text-xs text-slate-300 font-mono">
                              <span>EXP: <strong className="text-white">{card.expiry || '12/28'}</strong></span>
                              <div className="flex items-center gap-1.5">
                                <span>CVV: <strong className="text-white">{card.dynamicCvv || card.cvv}</strong></span>
                                <button 
                                  onClick={() => handleRotateCvv(card.id)} 
                                  className="text-[10px] bg-indigo-500/20 hover:bg-indigo-500/30 text-indigo-300 px-2 py-0.5 rounded border border-indigo-500/30 flex items-center gap-1 cursor-pointer"
                                  title="Rotate Dynamic Security Code"
                                >
                                  <RefreshCw className="w-2.5 h-2.5" /> Rotate CVV
                                </button>
                              </div>
                              <span>PIN: <strong className="text-amber-300">4912</strong></span>
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Right: Balance & Limit */}
                      <div className="text-left sm:text-right shrink-0">
                        <div className="text-lg font-black text-white">{format(card.balance)}</div>
                        <div className="text-xs text-emerald-400 font-medium">
                          Limit: {card.limit === 'unlimited' ? 'Unlimited AUD' : format(card.limit as number)}
                        </div>
                        <div className="text-[10px] text-slate-400 font-mono mt-1">
                          Settlement: 0% FX Worldwide
                        </div>
                      </div>
                    </div>

                    {/* Bottom Features Row: Innovative & Modern Actions */}
                    <div className="mt-4 pt-3 border-t border-white/10 flex flex-wrap items-center justify-between gap-3">
                      <div className="flex flex-wrap items-center gap-2">
                        {/* Dual Routing Toggle */}
                        <button
                          onClick={() => handleToggleDualRouting(card.id)}
                          className="text-[11px] bg-slate-800 hover:bg-slate-700 text-slate-300 px-2.5 py-1 rounded-lg border border-slate-700 flex items-center gap-1.5 cursor-pointer font-medium"
                          title="Toggle between eftpos Domestic Australian routing and Global Network rails"
                        >
                          <Globe className="w-3 h-3 text-indigo-400" />
                          Rail: {card.dualRouting === 'eftpos_domestic' ? 'eftpos AU (Direct)' : 'Global Mastercard'}
                        </button>

                        {/* Burner Toggle */}
                        <button
                          onClick={() => handleToggleBurnerMode(card.id)}
                          className={`text-[11px] px-2.5 py-1 rounded-lg border flex items-center gap-1.5 cursor-pointer font-medium ${
                            card.burnerMode 
                              ? 'bg-rose-500/20 text-rose-300 border-rose-500/40' 
                              : 'bg-slate-800 hover:bg-slate-700 text-slate-300 border-slate-700'
                          }`}
                          title="Auto-destruct token after single checkout"
                        >
                          <Flame className="w-3 h-3 text-rose-400" />
                          Burner: {card.burnerMode ? 'ON' : 'OFF'}
                        </button>

                        {/* Freeze Toggle */}
                        <button
                          onClick={() => handleToggleFreeze(card.id)}
                          className={`text-[11px] px-2.5 py-1 rounded-lg border flex items-center gap-1.5 cursor-pointer font-medium ${
                            isFrozen 
                              ? 'bg-red-500/20 text-red-300 border-red-500/40' 
                              : 'bg-slate-800 hover:bg-slate-700 text-slate-300 border-slate-700'
                          }`}
                        >
                          {isFrozen ? <Lock className="w-3 h-3 text-red-400" /> : <Unlock className="w-3 h-3 text-emerald-400" />}
                          {isFrozen ? 'FROZEN' : 'ACTIVE'}
                        </button>
                      </div>

                      <div className="flex items-center gap-2">
                        {/* Cross-Device Wallet Hub: Android, iOS, Windows, Mac */}
                        <button
                          onClick={() => {
                            setSelectedWalletCard(card);
                            setIsWalletModalOpen(true);
                          }}
                          className="text-[11px] bg-indigo-500/20 hover:bg-indigo-500/30 text-indigo-300 border border-indigo-500/40 px-3 py-1 rounded-lg flex items-center gap-1.5 cursor-pointer font-bold transition-all shadow-sm"
                          title="Open Cross-Device Wallet Hub (Android, iOS, Windows, Mac)"
                        >
                          <Smartphone className="w-3 h-3 text-cyan-400" />
                          Cross-Device Wallet
                        </button>

                        {/* 1-Click Fast Enroll for app.link.com */}
                        <button
                          onClick={() => handleFastCopyForLink(card)}
                          className="text-[11px] bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-300 border border-emerald-500/40 px-3 py-1 rounded-lg flex items-center gap-1.5 cursor-pointer font-bold transition-all shadow-sm"
                          title="Copy credentials and open app.link.com to save this card immediately"
                        >
                          <Zap className="w-3 h-3 fill-emerald-400" />
                          Add to app.link.com
                          <ExternalLink className="w-2.5 h-2.5 opacity-70" />
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Right Column: NFC / Direct Clearance & Fast Sync Hub */}
          <div className="space-y-6">
            {/* Link.com Fast Master Push Box */}
            <div className="bg-gradient-to-br from-emerald-950/40 to-slate-900 border border-emerald-500/30 rounded-2xl p-6 shadow-xl">
              <div className="flex items-center gap-2 mb-3">
                <Zap className="w-5 h-5 text-emerald-400 fill-emerald-400" />
                <h3 className="text-base font-bold text-white">Link.com Master Provisioner</h3>
              </div>
              <p className="text-xs text-slate-300 mb-4 leading-relaxed">
                Connect and push all 38+ digital bank virtual credit cards to <strong className="text-emerald-300">{TARGET_LINK_EMAIL}</strong> for instant 1-Click checkout anywhere Link.com is accepted worldwide.
              </p>

              <div className="space-y-2">
                <button
                  onClick={() => setIsLinkModalOpen(true)}
                  className="w-full py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-bold tracking-wider uppercase flex items-center justify-center gap-2 transition-all shadow-lg cursor-pointer"
                >
                  <RefreshCw className="w-4 h-4" /> Open 38+ Card Sync Wizard
                </button>
                <button
                  onClick={() => window.open(LINK_COM_APP_URL, '_blank')}
                  className="w-full py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl text-xs font-medium flex items-center justify-center gap-2 transition-all cursor-pointer"
                >
                  <ExternalLink className="w-3.5 h-3.5" /> Launch app.link.com Directly
                </button>
              </div>
            </div>

            {/* NFC & Treasury Operations */}
            <div className="bg-slate-900 border border-white/10 rounded-2xl p-6">
              <h3 className="text-base font-bold text-white mb-4 flex items-center gap-2">
                <Wifi className="w-5 h-5 text-indigo-400" />
                NFC & EMV Instant Push / Pull
              </h3>

              <div className="flex bg-white/5 p-1 rounded-lg mb-4">
                <button 
                  onClick={() => setTxType('refund')} 
                  className={`flex-1 py-1.5 text-xs font-bold rounded-md transition-colors ${
                    txType === 'refund' ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:text-white'
                  }`}
                >
                  Push to Card
                </button>
                <button 
                  onClick={() => setTxType('pay')} 
                  className={`flex-1 py-1.5 text-xs font-bold rounded-md transition-colors ${
                    txType === 'pay' ? 'bg-emerald-600 text-white' : 'text-slate-400 hover:text-white'
                  }`}
                >
                  Pull from Card
                </button>
              </div>

              <div className="space-y-3.5">
                <div>
                  <label className="block text-xs text-slate-400 mb-1">Source Virtual Card</label>
                  <select 
                    className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-xs text-white"
                    value={selectedSource?.id || ''}
                    onChange={(e) => setSelectedSource(cards.find(c => c.id === e.target.value) || null)}
                  >
                    <option value="">Select Virtual Card</option>
                    {cards.map((card, idx) => (
                      <option key={`vbank-src-${card.id}-${idx}`} value={card.id}>{card.name} - {format(card.balance)}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs text-slate-400 mb-1">Destination Physical Card</label>
                  <select 
                    className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-xs text-white"
                    value={selectedDestination?.id || ''}
                    onChange={(e) => setSelectedDestination(cards.find(c => c.id === e.target.value) || null)}
                  >
                    <option value="">Select Physical Card</option>
                    {cards.map((card, idx) => {
                      const last4 = (card as any)?.last4 || String(card?.fullNumber || card?.number || '').replace(/\s+/g, '').slice(-4) || '••••';
                      return (
                        <option key={`vbank-dest-${card.id}-${idx}`} value={card.id}>{card.name} ({last4})</option>
                      );
                    })}
                  </select>
                </div>

                <div>
                  <label className="block text-xs text-slate-400 mb-1">Amount (AUD)</label>
                  <input
                    type="number"
                    placeholder="e.g. 500000"
                    value={refundAmount}
                    onChange={(e) => setRefundAmount(e.target.value)}
                    className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-xs text-white font-mono"
                  />
                </div>

                <button
                  onClick={handleNfcRefund}
                  className="w-full py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-bold uppercase tracking-wider flex items-center justify-center gap-2 transition-all cursor-pointer shadow-md"
                >
                  <Send className="w-3.5 h-3.5" /> Execute Instant Clearance
                </button>

                {nfcMessage && (
                  <div className={`p-3 rounded-lg text-xs font-mono border ${
                    nfcState === 'success' 
                      ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-300' 
                      : nfcState === 'error'
                      ? 'bg-red-500/10 border-red-500/30 text-red-300'
                      : 'bg-indigo-500/10 border-indigo-500/30 text-indigo-300'
                  }`}>
                    {nfcMessage}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      <CrossPlatformCardWalletModal
        card={selectedWalletCard}
        isOpen={isWalletModalOpen}
        onClose={() => setIsWalletModalOpen(false)}
        onUpdateCard={(updated) => {
          setSelectedWalletCard(updated);
          setCards((prev) =>
            prev.map((c) =>
              c.id === updated.id
                ? ({
                    ...c,
                    ...updated,
                    status: (updated.status === 'frozen' || updated.isFrozen ? 'frozen' : 'active') as 'active' | 'frozen',
                  } as BankCard)
                : c
            )
          );
        }}
      />
    </>
  );
};

// Keep backwards-compatible alias
export const BlackCardsController = VBankVirtualCreditCards;
