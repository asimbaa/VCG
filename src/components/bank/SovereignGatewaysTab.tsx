import React, { useState, useEffect } from 'react';
import { 
  Network, 
  Bitcoin, 
  Banknote, 
  ArrowRight, 
  Wallet, 
  ShieldCheck, 
  MapPin, 
  QrCode, 
  Lock, 
  Globe, 
  CheckCircle2, 
  Smartphone, 
  Building2, 
  Clock, 
  Sparkles, 
  Copy, 
  RefreshCw, 
  Zap, 
  Receipt, 
  PhoneCall,
  Flame,
  ArrowDownToLine,
  Sliders
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'sonner';
import { AustralianATMSimulator } from './AustralianATMSimulator';
import { 
  AtmCashSession, 
  USER_LOCAL_PHONE, 
  USER_REGISTERED_PHONE,
  createCbaCardlessCash, 
  createWestpacEmergencyCash, 
  createCryptoAtmWithdrawal,
  AUS_CRYPTO_ATM_NETWORKS,
  CBA_ATM_LOCATIONS,
  WESTPAC_ATM_LOCATIONS,
  playAtmAudio
} from '../../services/atmCashService';

interface SovereignGatewaysTabProps {
  user?: any;
  balances?: any;
  setBalances?: React.Dispatch<React.SetStateAction<any>>;
}

export function SovereignGatewaysTab({ user, balances, setBalances }: SovereignGatewaysTabProps) {
  const [activeView, setActiveView] = useState<'atm' | 'crypto_atm' | 'routing'>('atm');
  
  // ATM Cash Generation States
  const [selectedBank, setSelectedBank] = useState<'CBA' | 'Westpac'>('CBA');
  const [withdrawAmount, setWithdrawAmount] = useState<number>(500);
  const [customWithdrawAmount, setCustomWithdrawAmount] = useState<string>('');
  const [isGeneratingCode, setIsGeneratingCode] = useState(false);
  const [activeSession, setActiveSession] = useState<AtmCashSession | null>(null);
  const [cashSessions, setCashSessions] = useState<AtmCashSession[]>([]);

  // Crypto ATM Withdrawal States
  const [cryptoAsset, setCryptoAsset] = useState<'BTC' | 'ETH' | 'SOL' | 'USDC'>('BTC');
  const [cryptoAtmNetwork, setCryptoAtmNetwork] = useState(AUS_CRYPTO_ATM_NETWORKS[0].name);
  const [cryptoAudAmount, setCryptoAudAmount] = useState<number>(1000);
  const [isProcessingCryptoWithdraw, setIsProcessingCryptoWithdraw] = useState(false);

  // Exchange rates for Crypto ATM conversion
  const rates: Record<string, number> = {
    BTC: 145000, // 1 BTC = $145,000 AUD
    ETH: 5200,   // 1 ETH = $5,200 AUD
    SOL: 320,    // 1 SOL = $320 AUD
    USDC: 1.55   // 1 USDC = $1.55 AUD
  };

  const calculatedCryptoAmount = Number((cryptoAudAmount / rates[cryptoAsset]).toFixed(6));

  // Initialize with initial active cash session
  useEffect(() => {
    const defaultSession: AtmCashSession = {
      id: "CBA-CASH-INITIAL",
      type: "cba_cardless",
      userPhone: USER_REGISTERED_PHONE,
      amount: 500,
      currency: "AUD",
      status: "ready_for_pickup",
      cbaClaimCode: "8492 1029",
      cbaPin: "4912",
      kioskLocation: "CommBank Artarmon Hub (6/117-119 Hampden Rd)",
      createdAt: new Date().toISOString(),
      expiresAt: new Date(Date.now() + 30 * 60 * 1000).toISOString()
    };
    setActiveSession(defaultSession);
    setCashSessions([defaultSession]);
  }, []);

  const handleGenerateBankCash = async () => {
    const amt = parseFloat(customWithdrawAmount) || withdrawAmount;
    if (amt <= 0 || amt > 50000) {
      toast.error("Please enter a valid amount between $20 and $50,000 AUD");
      return;
    }

    setIsGeneratingCode(true);
    playAtmAudio("keypad");

    try {
      let session: AtmCashSession;
      if (selectedBank === 'CBA') {
        session = await createCbaCardlessCash(amt);
        toast.success(`CBA Cardless Cash Created: $${amt} AUD! Claim Code & PIN sent to ${USER_LOCAL_PHONE}`, {
          description: `Code: ${session.cbaClaimCode} • PIN: ${session.cbaPin}`
        });
      } else {
        session = await createWestpacEmergencyCash(amt);
        toast.success(`Westpac Emergency Cash Created: $${amt} AUD! 6-digit Code sent to ${USER_LOCAL_PHONE}`, {
          description: `Code: ${session.westpacCode}`
        });
      }

      setActiveSession(session);
      setCashSessions(prev => [session, ...prev]);
    } catch (err) {
      toast.error("Failed to generate cash pickup code");
    } finally {
      setIsGeneratingCode(false);
    }
  };

  const handleExecuteCryptoAtmWithdrawal = async () => {
    if (cryptoAudAmount <= 0) {
      toast.error("Please specify a valid cash withdrawal amount");
      return;
    }

    setIsProcessingCryptoWithdraw(true);
    playAtmAudio("keypad");

    try {
      const session = await createCryptoAtmWithdrawal({
        cryptoAsset,
        cryptoAmount: calculatedCryptoAmount,
        audAmount: cryptoAudAmount,
        atmNetwork: cryptoAtmNetwork
      });

      toast.success(
        `Crypto ATM Cash Ready: $${cryptoAudAmount} AUD! Allocated ${calculatedCryptoAmount} ${cryptoAsset}`,
        {
          description: `SMS PIN sent to ${USER_LOCAL_PHONE}. Verified at ${cryptoAtmNetwork}`
        }
      );

      setActiveSession(session);
      setCashSessions(prev => [session, ...prev]);
      setActiveView('atm');
    } catch (e) {
      toast.error("Failed to generate crypto ATM withdrawal");
    } finally {
      setIsProcessingCryptoWithdraw(false);
    }
  };

  return (
    <div className="w-full max-w-7xl mx-auto space-y-8 animate-in fade-in duration-500">
      {/* Top Header & View Navigator */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-6 md:p-8 backdrop-blur-xl shadow-2xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="relative z-10 flex flex-col lg:flex-row justify-between items-start lg:items-end gap-6">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <div className="w-12 h-12 bg-emerald-500/20 border border-emerald-500/40 rounded-2xl flex items-center justify-center text-emerald-400">
                <Network className="w-6 h-6" />
              </div>
              <div>
                <h1 className="text-3xl font-black text-white tracking-widest uppercase">
                  Sovereign Gateways & ATM Hub
                </h1>
                <p className="text-slate-400 font-mono text-xs mt-0.5">
                  Direct Cash Withdrawals • CBA & Westpac Cardless Cash • Australian Crypto ATMs (0401044335)
                </p>
              </div>
            </div>

            {/* Verified Identity Badge */}
            <div className="mt-4 inline-flex items-center gap-3 px-4 py-2 bg-slate-950/80 border border-slate-800 rounded-2xl text-xs font-mono">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" />
              <span className="text-slate-400">Linked Phone:</span>
              <span className="text-emerald-300 font-black tracking-wide">+61-401044335 (0401044335)</span>
              <span className="text-slate-600">|</span>
              <span className="text-slate-400">Holder:</span>
              <span className="text-white font-bold">Mr. Asim Aryal (Artarmon NSW)</span>
              <span className="px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-400 font-black text-[10px] uppercase">
                24/7 Live
              </span>
            </div>
          </div>

          {/* Navigation View Switcher */}
          <div className="flex flex-wrap bg-slate-950 p-1.5 rounded-2xl border border-slate-800 gap-1">
            <button 
              onClick={() => setActiveView('atm')}
              className={`px-4 py-2.5 rounded-xl text-xs font-black uppercase tracking-wider transition-all cursor-pointer flex items-center gap-2 ${
                activeView === 'atm' 
                  ? 'bg-gradient-to-r from-emerald-500 to-teal-500 text-slate-950 shadow-lg shadow-emerald-500/20' 
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <Banknote className="w-4 h-4" />
              <span>Australian ATM Simulator</span>
            </button>
            <button 
              onClick={() => setActiveView('crypto_atm')}
              className={`px-4 py-2.5 rounded-xl text-xs font-black uppercase tracking-wider transition-all cursor-pointer flex items-center gap-2 ${
                activeView === 'crypto_atm' 
                  ? 'bg-gradient-to-r from-amber-500 to-orange-500 text-slate-950 shadow-lg shadow-amber-500/20' 
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <Bitcoin className="w-4 h-4" />
              <span>Crypto ATM Cash (0401044335)</span>
            </button>
            <button 
              onClick={() => setActiveView('routing')}
              className={`px-4 py-2.5 rounded-xl text-xs font-black uppercase tracking-wider transition-all cursor-pointer flex items-center gap-2 ${
                activeView === 'routing' 
                  ? 'bg-slate-800 text-white shadow-md' 
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <Sliders className="w-4 h-4" />
              <span>Dark Pool OTC</span>
            </button>
          </div>
        </div>
      </div>

      {/* VIEW 1: AUSTRALIAN ATM SIMULATOR & CARDLESS CASH */}
      {activeView === 'atm' && (
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-8">
          {/* Quick Cash Generation Form */}
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 lg:p-8 shadow-xl">
            <div className="flex flex-col md:flex-row md:items-center justify-between pb-6 border-b border-slate-800 gap-4">
              <div>
                <h3 className="text-lg font-black text-white uppercase tracking-wider flex items-center gap-2">
                  <Flame className="w-5 h-5 text-amber-400" /> Generate ATM Cash Pickup Code
                </h3>
                <p className="text-xs text-slate-400 font-mono mt-0.5">
                  Dispatched directly to {USER_LOCAL_PHONE} for physical cash collection at any Australian ATM.
                </p>
              </div>

              {/* Bank Selector */}
              <div className="flex bg-slate-950 p-1 rounded-xl border border-slate-800">
                <button
                  onClick={() => setSelectedBank('CBA')}
                  className={`px-4 py-2 rounded-lg text-xs font-black uppercase tracking-wider transition-all cursor-pointer flex items-center gap-2 ${
                    selectedBank === 'CBA'
                      ? 'bg-[#ffcc00] text-slate-950 shadow-md font-bold'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  <div className="w-3 h-3 bg-black rotate-45 border border-yellow-300" />
                  <span>CommBank (Cardless Cash)</span>
                </button>
                <button
                  onClick={() => setSelectedBank('Westpac')}
                  className={`px-4 py-2 rounded-lg text-xs font-black uppercase tracking-wider transition-all cursor-pointer flex items-center gap-2 ${
                    selectedBank === 'Westpac'
                      ? 'bg-red-600 text-white shadow-md font-bold'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  <span className="font-serif font-black">W</span>
                  <span>Westpac (Emergency Cash)</span>
                </button>
              </div>
            </div>

            {/* Amount Selection Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 my-6">
              {[100, 200, 500, 1000, 2500].map((amt, idx) => (
                <button
                  key={`bank-atm-amt-${amt}-${idx}`}
                  onClick={() => {
                    setWithdrawAmount(amt);
                    setCustomWithdrawAmount('');
                  }}
                  className={`py-3.5 px-4 rounded-2xl font-black text-sm tracking-tight transition-all cursor-pointer border ${
                    withdrawAmount === amt && !customWithdrawAmount
                      ? selectedBank === 'CBA' 
                        ? 'bg-[#ffcc00] text-slate-950 border-yellow-400 shadow-lg shadow-yellow-500/20' 
                        : 'bg-red-600 text-white border-red-500 shadow-lg shadow-red-600/20'
                      : 'bg-slate-950 text-slate-300 border-slate-800 hover:border-slate-700'
                  }`}
                >
                  ${amt} AUD
                </button>
              ))}
            </div>

            <div className="flex flex-col sm:flex-row items-center gap-4">
              <div className="relative flex-1 w-full">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 font-black text-sm">$</span>
                <input
                  type="number"
                  placeholder="Or enter custom AUD amount (e.g. 750)"
                  value={customWithdrawAmount}
                  onChange={(e) => setCustomWithdrawAmount(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-2xl pl-9 pr-4 py-3.5 text-white font-mono text-sm focus:outline-none focus:border-emerald-500"
                />
              </div>

              <button
                onClick={handleGenerateBankCash}
                disabled={isGeneratingCode}
                className={`w-full sm:w-auto px-8 py-3.5 rounded-2xl font-black text-xs uppercase tracking-wider transition-all cursor-pointer shadow-xl flex items-center justify-center gap-2.5 active:scale-95 ${
                  selectedBank === 'CBA'
                    ? 'bg-gradient-to-r from-yellow-400 to-amber-500 hover:from-yellow-300 hover:to-amber-400 text-slate-950 shadow-yellow-500/20'
                    : 'bg-gradient-to-r from-red-600 to-rose-700 hover:from-red-500 hover:to-rose-600 text-white shadow-red-600/20'
                }`}
              >
                {isGeneratingCode ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    <span>Dispatching SMS to {USER_LOCAL_PHONE}...</span>
                  </>
                ) : (
                  <>
                    <Zap className="w-4 h-4" />
                    <span>Generate Instant ATM Cash Code</span>
                  </>
                )}
              </button>
            </div>

            {/* Active Cash Code Banner */}
            {activeSession && (
              <div className="mt-6 p-4 rounded-2xl bg-slate-950 border border-emerald-500/30 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center text-emerald-400">
                    <Sparkles className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-white font-bold text-sm">
                        Active {activeSession.type === 'cba_cardless' ? 'CommBank' : 'Westpac'} Pickup Code:
                      </span>
                      <span className="px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 text-xs font-mono font-black">
                        ${activeSession.amount} AUD
                      </span>
                    </div>
                    <div className="text-xs font-mono text-slate-400 mt-0.5">
                      {activeSession.type === 'cba_cardless' ? (
                        <>Claim Code: <span className="text-yellow-400 font-bold">{activeSession.cbaClaimCode}</span> • Cash PIN: <span className="text-emerald-400 font-bold">{activeSession.cbaPin}</span></>
                      ) : (
                        <>Emergency Code: <span className="text-red-400 font-bold">{activeSession.westpacCode}</span></>
                      )}
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => {
                      const text = activeSession.type === 'cba_cardless' 
                        ? `CBA Code: ${activeSession.cbaClaimCode} PIN: ${activeSession.cbaPin}`
                        : `Westpac Code: ${activeSession.westpacCode}`;
                      navigator.clipboard.writeText(text);
                      toast.success("ATM Codes copied to clipboard!");
                    }}
                    className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-mono flex items-center gap-1 cursor-pointer"
                  >
                    <Copy className="w-3.5 h-3.5" /> Copy
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Interactive Australian ATM Simulator */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-xl font-black text-white uppercase tracking-wider flex items-center gap-2">
                  <Building2 className="w-5 h-5 text-emerald-400" /> Physical ATM Kiosk Emulation
                </h3>
                <p className="text-xs text-slate-400 font-mono">
                  Test instant dispensing of Australian polymer banknotes with realistic mechanical sound effects.
                </p>
              </div>
            </div>

            <AustralianATMSimulator 
              initialSession={activeSession}
              onCashCollected={(amount, bank) => {
                toast.success(`Successfully collected $${amount} AUD from ${bank} ATM! Vault updated.`, {
                  icon: "💵"
                });
                if (setBalances) {
                  setBalances((prev: any) => ({
                    ...prev,
                    aud: Math.max(0, (prev.aud || 0) - amount)
                  }));
                }
              }}
            />
          </div>
        </motion.div>
      )}

      {/* VIEW 2: AUSTRALIAN CRYPTO ATM NETWORK (0401044335) */}
      {activeView === 'crypto_atm' && (
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            {/* Left: Crypto ATM Cash Withdrawal Terminal (Span 7) */}
            <div className="lg:col-span-7 bg-slate-900 border border-slate-800 rounded-3xl p-6 lg:p-8 shadow-xl space-y-6">
              <div>
                <h3 className="text-xl font-black text-white uppercase tracking-wider flex items-center gap-2.5">
                  <Bitcoin className="w-6 h-6 text-amber-400" /> Australian Crypto ATM Cash Extraction
                </h3>
                <p className="text-xs text-slate-400 font-mono mt-1">
                  Convert cold vault crypto assets directly into physical AUD banknotes via your registered phone number.
                </p>
              </div>

              {/* Registered Phone Link Badge */}
              <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-amber-500/20 border border-amber-500/40 flex items-center justify-center text-amber-400">
                    <PhoneCall className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="text-slate-500 text-[10px] font-mono uppercase tracking-widest">
                      Kiosk Authentication Phone
                    </div>
                    <div className="text-sm font-mono font-black text-white">
                      +61-401044335 <span className="text-slate-500">(0401044335)</span>
                    </div>
                  </div>
                </div>
                <span className="px-2.5 py-1 rounded-full bg-emerald-500/20 border border-emerald-500/30 text-emerald-400 text-[10px] font-bold uppercase">
                  ATM Authorized
                </span>
              </div>

              {/* Asset Selection */}
              <div>
                <label className="text-xs font-black text-slate-400 uppercase tracking-widest block mb-2">
                  Select Crypto Asset to Liquidate
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  {(['BTC', 'ETH', 'SOL', 'USDC'] as const).map((asset, idx) => (
                    <button
                      key={`crypto-asset-pill-${asset}-${idx}`}
                      onClick={() => setCryptoAsset(asset)}
                      className={`p-3.5 rounded-2xl border text-center transition-all cursor-pointer ${
                        cryptoAsset === asset
                          ? 'bg-amber-500/20 border-amber-500 text-amber-300 shadow-md'
                          : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-white'
                      }`}
                    >
                      <div className="font-black text-sm">{asset}</div>
                      <div className="text-[10px] font-mono text-slate-500 mt-0.5">
                        ${rates[asset].toLocaleString()} AUD
                      </div>
                    </button>
                  ))}
                </div>
              </div>

              {/* ATM Kiosk Network Selection */}
              <div>
                <label className="text-xs font-black text-slate-400 uppercase tracking-widest block mb-2">
                  Select ATM Kiosk Operator
                </label>
                <select
                  value={cryptoAtmNetwork}
                  onChange={(e) => setCryptoAtmNetwork(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-2xl px-4 py-3 text-white font-mono text-xs focus:outline-none focus:border-amber-500 cursor-pointer"
                >
                  {AUS_CRYPTO_ATM_NETWORKS.map((net, nIdx) => (
                    <option key={`aus-crypto-atm-${net.id}-${nIdx}`} value={net.name}>
                      {net.name} • Max ${net.maxDaily.toLocaleString()} AUD/day • Fee: {net.fee}
                    </option>
                  ))}
                </select>
              </div>

              {/* Amount to Withdraw in AUD */}
              <div>
                <label className="text-xs font-black text-slate-400 uppercase tracking-widest block mb-2">
                  Cash Amount to Collect (AUD)
                </label>
                <div className="grid grid-cols-4 gap-2 mb-3">
                  {[200, 500, 1000, 2500].map((amt, idx) => (
                    <button
                      key={`crypto-amt-btn-${amt}-${idx}`}
                      onClick={() => setCryptoAudAmount(amt)}
                      className={`py-2 rounded-xl text-xs font-black transition-all cursor-pointer border ${
                        cryptoAudAmount === amt
                          ? 'bg-amber-500 text-slate-950 border-amber-400'
                          : 'bg-slate-950 text-slate-400 border-slate-800 hover:border-slate-700'
                      }`}
                    >
                      ${amt}
                    </button>
                  ))}
                </div>
                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 font-black text-sm">$</span>
                  <input
                    type="number"
                    value={cryptoAudAmount}
                    onChange={(e) => setCryptoAudAmount(Number(e.target.value))}
                    className="w-full bg-slate-950 border border-slate-800 rounded-2xl pl-9 pr-4 py-3.5 text-white font-mono text-sm focus:outline-none focus:border-amber-500"
                  />
                </div>
              </div>

              {/* Conversion Preview Box */}
              <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-2 font-mono text-xs">
                <div className="flex justify-between text-slate-400">
                  <span>Crypto Asset Debited:</span>
                  <span className="text-amber-400 font-bold">{calculatedCryptoAmount} {cryptoAsset}</span>
                </div>
                <div className="flex justify-between text-slate-400">
                  <span>Physical Cash Dispensed:</span>
                  <span className="text-emerald-400 font-bold">${cryptoAudAmount.toFixed(2)} AUD</span>
                </div>
                <div className="flex justify-between text-slate-400">
                  <span>Sovereign Netting Spread:</span>
                  <span className="text-emerald-400 font-bold">0.00% (Zero Fee VIP)</span>
                </div>
                <div className="flex justify-between text-slate-400">
                  <span>SMS Handshake Target:</span>
                  <span className="text-white font-bold">{USER_LOCAL_PHONE}</span>
                </div>
              </div>

              {/* Execute Button */}
              <button
                onClick={handleExecuteCryptoAtmWithdrawal}
                disabled={isProcessingCryptoWithdraw}
                className="w-full py-4 rounded-2xl bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 text-slate-950 font-black text-xs uppercase tracking-wider transition-all cursor-pointer shadow-xl shadow-amber-500/20 flex items-center justify-center gap-2.5 active:scale-95"
              >
                {isProcessingCryptoWithdraw ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    <span>Communicating with {cryptoAtmNetwork}...</span>
                  </>
                ) : (
                  <>
                    <ArrowDownToLine className="w-4 h-4" />
                    <span>Generate Crypto ATM Cash Voucher (${cryptoAudAmount} AUD)</span>
                  </>
                )}
              </button>
            </div>

            {/* Right: Kiosks Locator & How It Works (Span 5) */}
            <div className="lg:col-span-5 space-y-6">
              {/* Nearby Kiosks */}
              <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-xl">
                <h4 className="text-sm font-black text-white uppercase tracking-wider mb-4 flex items-center gap-2">
                  <MapPin className="w-4 h-4 text-emerald-400" /> Supported Sydney & Regional Kiosks
                </h4>
                <div className="space-y-3">
                  {AUS_CRYPTO_ATM_NETWORKS.map((net, nIdx) => (
                    <div key={`kiosk-net-${net.id}-${nIdx}`} className="p-3.5 rounded-2xl bg-slate-950 border border-slate-800 hover:border-slate-700 transition-colors">
                      <div className="flex justify-between items-start mb-1">
                        <span className="font-bold text-sm text-white">{net.name}</span>
                        <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-400 font-bold">
                          Active 24/7
                        </span>
                      </div>
                      <p className="text-xs text-slate-400 font-mono">{net.locations}</p>
                      <div className="flex justify-between items-center text-[10px] font-mono text-slate-500 mt-2 pt-2 border-t border-slate-900">
                        <span>Max Single Tx: ${net.maxDaily.toLocaleString()} AUD</span>
                        <span>Auth: SMS 0401044335</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Step-by-step instructions */}
              <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-xl">
                <h4 className="text-sm font-black text-white uppercase tracking-wider mb-4 flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4 text-amber-400" /> 3-Step ATM Cash Collection
                </h4>
                <ol className="space-y-3 text-xs text-slate-300 font-mono list-decimal pl-4">
                  <li>Walk up to any CoinFlip, LocalCoin, or BitRocket ATM kiosk.</li>
                  <li>Select "Withdraw Cash" on the screen and enter phone number <strong className="text-emerald-400">0401044335</strong>.</li>
                  <li>Enter the SMS PIN generated by this app. Collect polymer AUD notes immediately from the cash tray.</li>
                </ol>
              </div>
            </div>
          </div>
        </motion.div>
      )}

      {/* VIEW 3: DARK POOL OTC & LIQUIDITY */}
      {activeView === 'routing' && (
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 items-center bg-slate-900 p-8 rounded-2xl border border-slate-800 shadow-xl relative overflow-hidden">
            <div className="absolute inset-0 opacity-10 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-emerald-500 via-slate-900 to-slate-900 pointer-events-none" />
            
            <div className="flex flex-col items-center text-center space-y-3 z-10">
              <div className="w-16 h-16 bg-slate-950 border border-slate-700 rounded-full flex items-center justify-center shadow-[0_0_15px_rgba(255,255,255,0.1)]">
                <Lock className="w-8 h-8 text-slate-300" />
              </div>
              <div>
                <div className="font-bold text-white">Cold Multi-Sig Vault</div>
                <div className="text-xs text-slate-400 font-mono">BIP-39 HSM Grade-A</div>
              </div>
            </div>

            <div className="hidden md:flex items-center justify-center z-10">
              <ArrowRight className="w-8 h-8 text-emerald-500/50" />
            </div>

            <div className="flex flex-col items-center text-center space-y-3 z-10">
              <div className="w-16 h-16 bg-orange-500/10 border border-orange-500/30 rounded-full flex items-center justify-center shadow-[0_0_15px_rgba(249,115,22,0.2)]">
                <Bitcoin className="w-8 h-8 text-orange-500" />
              </div>
              <div>
                <div className="font-bold text-white">Dark Pool OTC</div>
                <div className="text-xs text-slate-400 font-mono">Zero Slippage Netting</div>
              </div>
            </div>

            <div className="hidden md:flex items-center justify-center z-10">
              <ArrowRight className="w-8 h-8 text-emerald-500/50" />
            </div>

            <div className="flex flex-col items-center text-center space-y-3 z-10">
              <div className="w-16 h-16 bg-emerald-500/10 border border-emerald-500/30 rounded-full flex items-center justify-center shadow-[0_0_15px_rgba(16,185,129,0.2)]">
                <Banknote className="w-8 h-8 text-emerald-500" />
              </div>
              <div>
                <div className="font-bold text-white">Fiat Settlement</div>
                <div className="text-xs text-slate-400 font-mono">NPP / CBA / Westpac / ATM</div>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6">
              <h3 className="font-bold text-white mb-4 flex items-center gap-2">
                <ShieldCheck className="w-5 h-5 text-emerald-500" /> Multi-Sig Security Protocol
              </h3>
              <ul className="space-y-3 text-sm text-slate-400">
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-500 mt-0.5 shrink-0" /> 
                  3-of-5 threshold signatures required for transfers &gt; $10M AUD.
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-500 mt-0.5 shrink-0" /> 
                  Automated SMS OTP challenge dispatch to 0401044335 for high-value ATM dispatch.
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-500 mt-0.5 shrink-0" /> 
                  Real-time blockchain mempool RBF (Replace-By-Fee) acceleration.
                </li>
              </ul>
            </div>

            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6">
              <h3 className="font-bold text-white mb-4 flex items-center gap-2">
                <Globe className="w-5 h-5 text-emerald-500" /> Deep Liquidity Venues
              </h3>
              <ul className="space-y-3 text-sm text-slate-400">
                <li className="flex items-start gap-2">
                  <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 mt-1.5 shrink-0" /> 
                  Institutional Dark Pools (Cumberland, Wintermute, Genesis).
                </li>
                <li className="flex items-start gap-2">
                  <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 mt-1.5 shrink-0" /> 
                  Direct API integration with Commonwealth Bank and Westpac APCA rails.
                </li>
                <li className="flex items-start gap-2">
                  <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 mt-1.5 shrink-0" /> 
                  Zero-slippage algorithmic market making across AUD, USD, EUR pairs.
                </li>
              </ul>
            </div>
          </div>
        </motion.div>
      )}
    </div>
  );
}
