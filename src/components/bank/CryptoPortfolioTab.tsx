import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Bitcoin, 
  Activity, 
  Lock, 
  ArrowUpRight, 
  ArrowDownRight, 
  Wallet, 
  ShieldCheck, 
  Zap, 
  Database, 
  Server, 
  RefreshCw, 
  Key,
  Banknote,
  PhoneCall,
  MapPin,
  Sparkles,
  X,
  CheckCircle2,
  Copy,
  ArrowDownToLine,
  Sliders
} from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { toast } from 'sonner';
import { CryptoKeysModal } from './CryptoKeysModal';
import { AustralianATMSimulator } from './AustralianATMSimulator';
import { 
  AtmCashSession, 
  USER_LOCAL_PHONE, 
  USER_REGISTERED_PHONE,
  createCryptoAtmWithdrawal,
  AUS_CRYPTO_ATM_NETWORKS,
  playAtmAudio
} from '../../services/atmCashService';

const btcData = Array.from({ length: 30 }).map((_, i) => ({
  day: i + 1,
  price: 94000 + Math.random() * 8000 + (i * 500)
}));

const holdings = [
  { asset: 'Bitcoin', symbol: 'BTC', amount: '845,210.00', value: 85200000000, color: '#f7931a', change: '+4.2%', rateAud: 145000 },
  { asset: 'Ethereum', symbol: 'ETH', amount: '14,200,500.00', value: 52000000000, color: '#627eea', change: '+5.8%', rateAud: 5200 },
  { asset: 'Solana', symbol: 'SOL', amount: '450,000,000.00', value: 85000000000, color: '#14F195', change: '+12.4%', rateAud: 320 },
  { asset: 'USDC (Treasury Reserve)', symbol: 'USDC', amount: '120,000,000,000.00', value: 120000000000, color: '#2775ca', change: '0.0%', rateAud: 1.55 },
];

export function CryptoPortfolioTab() {
  const [activeAsset, setActiveAsset] = useState('BTC');
  const [showCryptoKeysModal, setShowCryptoKeysModal] = useState(false);
  const [showAtmWithdrawModal, setShowAtmWithdrawModal] = useState(false);
  const [showAtmSimulatorModal, setShowAtmSimulatorModal] = useState(false);

  // ATM Withdrawal States
  const [selectedHolding, setSelectedHolding] = useState(holdings[0]);
  const [withdrawAudAmount, setWithdrawAudAmount] = useState<number>(500);
  const [customAudAmount, setCustomAudAmount] = useState<string>('');
  const [selectedAtmNetwork, setSelectedAtmNetwork] = useState(AUS_CRYPTO_ATM_NETWORKS[0].name);
  const [isProcessingWithdraw, setIsProcessingWithdraw] = useState(false);
  const [latestAtmSession, setLatestAtmSession] = useState<AtmCashSession | null>(null);

  const formatCurrency = (val: number) => {
    if (val >= 1e9) return `$${(val / 1e9).toFixed(2)}B`;
    if (val >= 1e6) return `$${(val / 1e6).toFixed(2)}M`;
    return `$${val.toLocaleString()}`;
  };

  const currentAudAmount = parseFloat(customAudAmount) || withdrawAudAmount;
  const calculatedCryptoRequired = Number((currentAudAmount / selectedHolding.rateAud).toFixed(6));

  const handleExecuteAtmWithdrawal = async () => {
    if (currentAudAmount <= 0) {
      toast.error("Please enter a valid withdrawal amount");
      return;
    }

    setIsProcessingWithdraw(true);
    playAtmAudio("keypad");

    try {
      const session = await createCryptoAtmWithdrawal({
        cryptoAsset: selectedHolding.symbol,
        cryptoAmount: calculatedCryptoRequired,
        audAmount: currentAudAmount,
        atmNetwork: selectedAtmNetwork
      });

      setLatestAtmSession(session);
      toast.success(
        `Crypto ATM Cash Ready: $${currentAudAmount} AUD! Allocated ${calculatedCryptoRequired} ${selectedHolding.symbol}`,
        {
          description: `SMS PIN sent to ${USER_LOCAL_PHONE}. Kiosk: ${selectedAtmNetwork}`
        }
      );
    } catch (e) {
      toast.error("Failed to generate ATM withdrawal code");
    } finally {
      setIsProcessingWithdraw(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto space-y-6 animate-in fade-in duration-500">
      {/* Sovereign Crypto Vault Hero */}
      <div className="bg-slate-900 rounded-3xl p-8 border border-slate-800 shadow-2xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-orange-500/10 rounded-full blur-[100px] pointer-events-none translate-x-1/3 -translate-y-1/3" />
        <div className="relative z-10 flex flex-col md:flex-row justify-between items-start md:items-end gap-6">
          <div>
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 bg-orange-500/10 border border-orange-500/20 rounded-xl flex items-center justify-center">
                <Bitcoin className="w-6 h-6 text-orange-400" />
              </div>
              <div>
                <h1 className="text-3xl font-black text-white uppercase tracking-widest">Sovereign Crypto Vault</h1>
                <p className="text-slate-400 font-mono text-sm">Tier-1 Institutional Digital Asset Accumulation & Cold Storage.</p>
              </div>
            </div>

            {/* Linked Phone Number Badge */}
            <div className="inline-flex items-center gap-2.5 px-3.5 py-1.5 rounded-xl bg-slate-950/80 border border-slate-800 text-xs font-mono text-slate-300 mb-4">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              <span>Linked ATM Phone:</span>
              <strong className="text-emerald-400 font-bold">+61-401044335 ({USER_LOCAL_PHONE})</strong>
              <span className="text-slate-600">|</span>
              <span className="text-slate-400">Owner: Asim Aryal</span>
            </div>

            <div>
              <div className="text-slate-500 font-black uppercase tracking-widest text-xs mb-1">Total Digital Asset Value (USD)</div>
              <div className="text-6xl font-black text-white tracking-tighter flex items-center gap-4">
                $342.20B
                <span className="text-sm font-bold text-emerald-400 bg-emerald-500/10 px-3 py-1 rounded-full border border-emerald-500/20 flex items-center gap-1">
                  <ArrowUpRight className="w-4 h-4" /> +8.4% 24h
                </span>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="mt-6 flex flex-wrap items-center gap-3">
              {/* Australian Crypto ATM Cash Withdrawal Button */}
              <button
                onClick={() => setShowAtmWithdrawModal(true)}
                className="px-5 py-3 rounded-2xl bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-slate-950 font-black text-xs uppercase tracking-wider flex items-center gap-2.5 shadow-lg shadow-emerald-500/25 transition-all cursor-pointer active:scale-95"
                title="Withdraw cash from Australian crypto ATMs using assets and phone number 0401044335"
              >
                <Banknote className="w-4 h-4 text-slate-950" />
                <span>Withdraw Cash at AUS Crypto ATMs ({USER_LOCAL_PHONE})</span>
              </button>

              <button
                onClick={() => setShowCryptoKeysModal(true)}
                className="px-5 py-3 rounded-2xl bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 text-slate-950 font-black text-xs uppercase tracking-wider flex items-center gap-2.5 shadow-lg shadow-amber-500/25 transition-all cursor-pointer active:scale-95"
                title="View and copy all full unmasked private keys and master seed phrases"
              >
                <Key className="w-4 h-4 text-slate-950" />
                <span>Show Full Crypto Keys</span>
              </button>

              <button
                onClick={() => setShowAtmSimulatorModal(true)}
                className="px-4 py-3 rounded-2xl bg-slate-800/80 hover:bg-slate-800 text-slate-300 hover:text-white border border-slate-700 font-bold text-xs uppercase tracking-wider flex items-center gap-2 transition-all cursor-pointer"
              >
                <Sliders className="w-4 h-4 text-emerald-400" />
                <span>ATM Kiosk Simulator</span>
              </button>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="bg-slate-950/50 border border-slate-800 p-4 rounded-xl backdrop-blur-sm">
              <div className="text-slate-500 text-[10px] font-black uppercase tracking-widest mb-1">Cold Storage Security</div>
              <div className="text-xl font-bold text-emerald-400 flex items-center gap-2">
                HSM Grade-A <ShieldCheck className="w-4 h-4" />
              </div>
            </div>
            <div className="bg-slate-950/50 border border-slate-800 p-4 rounded-xl backdrop-blur-sm">
              <div className="text-slate-500 text-[10px] font-black uppercase tracking-widest mb-1">Daily Staking Yield</div>
              <div className="text-xl font-bold text-blue-400 flex items-center gap-2">
                +$45.2M <Zap className="w-4 h-4" />
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white rounded-3xl border border-slate-200 p-6">
             <div className="flex items-center justify-between mb-6">
               <h3 className="font-black text-slate-900 uppercase tracking-widest text-sm flex items-center gap-2">
                 <Activity className="w-4 h-4 text-slate-400" /> Market Dynamics (BTC)
               </h3>
               <div className="text-sm font-bold text-slate-500 bg-slate-100 px-3 py-1 rounded-lg">30D Accumulation Phase</div>
             </div>
             <div className="h-[300px] w-full min-w-0">
                <ResponsiveContainer width="100%" height="100%" minWidth={0} minHeight={200}>
                  <AreaChart data={btcData}>
                    <defs>
                      <linearGradient id="colorPrice" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#f7931a" stopOpacity={0.3}/>
                        <stop offset="95%" stopColor="#f7931a" stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                    <XAxis dataKey="day" hide />
                    <YAxis domain={['auto', 'auto']} hide />
                    <Tooltip 
                      contentStyle={{ backgroundColor: '#0f172a', border: 'none', borderRadius: '12px', color: '#fff' }}
                      itemStyle={{ color: '#f7931a', fontWeight: 'bold' }}
                    />
                    <Area type="monotone" dataKey="price" stroke="#f7931a" strokeWidth={3} fillOpacity={1} fill="url(#colorPrice)" />
                  </AreaChart>
                </ResponsiveContainer>
             </div>
          </div>

          <div className="bg-slate-900 rounded-3xl border border-slate-800 p-6 text-white overflow-hidden relative">
             <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-500/10 rounded-full blur-3xl -mr-20 -mt-20 pointer-events-none" />
             <h3 className="font-black uppercase tracking-widest text-sm flex items-center gap-2 mb-6">
               <Server className="w-4 h-4 text-indigo-400" /> Proprietary OTC Accumulation Protocol
             </h3>
             <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-slate-950 border border-slate-800 p-4 rounded-xl">
                  <div className="text-slate-500 text-[10px] font-black uppercase tracking-widest mb-2">Algorithm Status</div>
                  <div className="text-emerald-400 font-bold flex items-center gap-2"><RefreshCw className="w-4 h-4 animate-spin-slow" /> ACTIVE (TWAP)</div>
                  <p className="text-xs text-slate-400 mt-2">DCAing $500M daily across 14 Tier-1 liquidity venues to prevent market slippage.</p>
                </div>
                <div className="bg-slate-950 border border-slate-800 p-4 rounded-xl">
                  <div className="text-slate-500 text-[10px] font-black uppercase tracking-widest mb-2">Block Volume (24h)</div>
                  <div className="text-white font-bold text-xl">4,250 BTC</div>
                  <p className="text-xs text-slate-400 mt-2">Acquired via Dark Pool network.</p>
                </div>
                <div className="bg-slate-950 border border-slate-800 p-4 rounded-xl">
                  <div className="text-slate-500 text-[10px] font-black uppercase tracking-widest mb-2">Network Fees Saved</div>
                  <div className="text-indigo-400 font-bold text-xl">$1.2M</div>
                  <p className="text-xs text-slate-400 mt-2">Optimized via custom Lightning/L2 routing.</p>
                </div>
             </div>
          </div>
        </div>

        <div className="bg-white border border-slate-200 rounded-3xl p-6 flex flex-col justify-between">
          <div>
            <h3 className="font-black text-slate-900 uppercase tracking-widest text-sm mb-6 pb-4 border-b border-slate-100 flex items-center gap-2">
              <Database className="w-4 h-4 text-slate-400" /> Reserve Assets & ATM Cash Out
            </h3>
            <div className="space-y-4">
              {holdings.map((h, i) => (
                <div key={`holding-${h.asset}-${i}`} className="p-4 rounded-2xl bg-slate-50 border border-slate-100 hover:border-slate-300 transition-colors">
                  <div className="flex justify-between items-start mb-2">
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 rounded-full" style={{ backgroundColor: h.color }} />
                      <span className="font-bold text-sm text-slate-900">{h.asset}</span>
                    </div>
                    <span className="text-xs font-bold text-emerald-500 bg-emerald-50 px-2 py-1 rounded-md">{h.change}</span>
                  </div>
                  <div className="flex justify-between items-end mt-4">
                    <div>
                      <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Holdings</div>
                      <div className="font-mono text-slate-700 text-sm font-bold">{h.amount} <span className="text-slate-400">{h.symbol}</span></div>
                    </div>
                    <div className="text-right">
                      <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Fiat Value</div>
                      <div className="font-black text-slate-900 text-lg tracking-tight">{formatCurrency(h.value)}</div>
                    </div>
                  </div>

                  {/* Fast ATM Cash Out Action */}
                  <div className="mt-3 pt-2.5 border-t border-slate-200/60 flex items-center justify-between">
                    <span className="text-[10px] font-mono text-slate-500">Rate: ${h.rateAud.toLocaleString()} AUD</span>
                    <button
                      onClick={() => {
                        setSelectedHolding(h);
                        setShowAtmWithdrawModal(true);
                      }}
                      className="px-2.5 py-1 rounded-lg bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-600 font-bold text-[10px] uppercase tracking-wider flex items-center gap-1 cursor-pointer transition-colors"
                    >
                      <Banknote className="w-3 h-3" />
                      <span>ATM Cash Out</span>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="mt-6 space-y-3 pt-4 border-t border-slate-100">
            <button
              onClick={() => setShowAtmWithdrawModal(true)}
              className="w-full py-4 bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-slate-950 rounded-xl font-black uppercase tracking-widest text-xs transition-all flex items-center justify-center gap-2 cursor-pointer shadow-lg shadow-emerald-500/20 active:scale-98"
            >
              <Banknote className="w-4 h-4" /> Withdraw Physical Cash (0401044335)
            </button>
            <button
              onClick={() => setShowCryptoKeysModal(true)}
              className="w-full py-3 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 rounded-xl font-black uppercase tracking-widest text-xs transition-all flex items-center justify-center gap-2 cursor-pointer shadow-md shadow-amber-500/10 active:scale-98"
            >
              <Key className="w-4 h-4" /> Show Full Crypto Keys
            </button>
          </div>
        </div>
      </div>

      {/* MODAL 1: AUSTRALIAN CRYPTO ATM CASH WITHDRAWAL */}
      <AnimatePresence>
        {showAtmWithdrawModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="w-full max-w-xl bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-2xl relative overflow-hidden"
            >
              <button 
                onClick={() => setShowAtmWithdrawModal(false)}
                className="absolute top-6 right-6 p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>

              <div className="flex items-center gap-3 mb-6">
                <div className="w-12 h-12 rounded-2xl bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center text-emerald-400">
                  <Banknote className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="text-xl font-black text-white uppercase tracking-tight">
                    Australian Crypto ATM Cash Withdrawal
                  </h3>
                  <p className="text-xs text-slate-400 font-mono">
                    Direct cash pickup at CoinFlip, LocalCoin & BitRocket Kiosks
                  </p>
                </div>
              </div>

              {/* Linked Phone Number Notice */}
              <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 mb-6 flex items-center justify-between">
                <div>
                  <div className="text-[10px] font-mono text-slate-500 uppercase tracking-widest">
                    ATM Verification Mobile Number
                  </div>
                  <div className="text-sm font-mono font-black text-emerald-400 mt-0.5">
                    +61-401044335 <span className="text-slate-400">(0401044335)</span>
                  </div>
                </div>
                <span className="px-2.5 py-1 rounded-full bg-emerald-500/20 text-emerald-300 text-[10px] font-mono font-bold uppercase border border-emerald-500/30">
                  Pre-Verified
                </span>
              </div>

              {/* Asset Selector */}
              <div className="space-y-4 mb-6">
                <div>
                  <label className="text-xs font-black text-slate-400 uppercase tracking-widest block mb-2">
                    Crypto Asset to Liquidate
                  </label>
                  <div className="grid grid-cols-4 gap-2">
                    {holdings.map((h, idx) => (
                      <button
                        key={`crypto-holding-pill-${h.symbol}-${idx}`}
                        onClick={() => setSelectedHolding(h)}
                        className={`py-2.5 rounded-xl border text-center transition-all cursor-pointer font-bold text-xs ${
                          selectedHolding.symbol === h.symbol
                            ? 'bg-emerald-500/20 border-emerald-500 text-emerald-300'
                            : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-white'
                        }`}
                      >
                        {h.symbol}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Amount Presets */}
                <div>
                  <label className="text-xs font-black text-slate-400 uppercase tracking-widest block mb-2">
                    Cash Withdrawal Amount (AUD)
                  </label>
                  <div className="grid grid-cols-4 gap-2 mb-3">
                    {[200, 500, 1000, 2500].map((amt, idx) => (
                      <button
                        key={`withdraw-preset-btn-${amt}-${idx}`}
                        onClick={() => {
                          setWithdrawAudAmount(amt);
                          setCustomAudAmount('');
                        }}
                        className={`py-2 rounded-xl text-xs font-black transition-all cursor-pointer border ${
                          withdrawAudAmount === amt && !customAudAmount
                            ? 'bg-emerald-500 text-slate-950 border-emerald-400'
                            : 'bg-slate-950 text-slate-400 border-slate-800 hover:border-slate-700'
                        }`}
                      >
                        ${amt} AUD
                      </button>
                    ))}
                  </div>
                  <input
                    type="number"
                    placeholder="Or enter custom amount (e.g. 750)"
                    value={customAudAmount}
                    onChange={(e) => setCustomAudAmount(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-2xl px-4 py-3 text-white font-mono text-sm focus:outline-none focus:border-emerald-500"
                  />
                </div>

                {/* Network Selector */}
                <div>
                  <label className="text-xs font-black text-slate-400 uppercase tracking-widest block mb-2">
                    Kiosk Operator Network
                  </label>
                  <select
                    value={selectedAtmNetwork}
                    onChange={(e) => setSelectedAtmNetwork(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-2xl px-4 py-3 text-white font-mono text-xs focus:outline-none focus:border-emerald-500"
                  >
                    {AUS_CRYPTO_ATM_NETWORKS.map(net => (
                      <option key={net.id} value={net.name}>
                        {net.name} (Sydney CBD, Artarmon, Chatswood)
                      </option>
                    ))}
                  </select>
                </div>

                {/* Conversion Summary */}
                <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-1.5 font-mono text-xs">
                  <div className="flex justify-between text-slate-400">
                    <span>Crypto Debited:</span>
                    <span className="text-amber-400 font-bold">{calculatedCryptoRequired} {selectedHolding.symbol}</span>
                  </div>
                  <div className="flex justify-between text-slate-400">
                    <span>AUD Cash Dispensed:</span>
                    <span className="text-emerald-400 font-bold">${currentAudAmount.toFixed(2)} AUD</span>
                  </div>
                  <div className="flex justify-between text-slate-400">
                    <span>SMS Token Destination:</span>
                    <span className="text-white font-bold">{USER_LOCAL_PHONE}</span>
                  </div>
                </div>
              </div>

              {/* Generate or View Code */}
              {latestAtmSession ? (
                <div className="space-y-4">
                  <div className="p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/30">
                    <div className="flex items-center gap-2 text-emerald-400 font-bold text-sm mb-2">
                      <CheckCircle2 className="w-4 h-4" /> ATM Cash Voucher Ready!
                    </div>
                    <p className="text-xs font-mono text-slate-300">
                      Walk to any <strong className="text-white">{latestAtmSession.cryptoAtmNetwork}</strong> kiosk, enter <strong className="text-emerald-400">{USER_LOCAL_PHONE}</strong>, and enter SMS PIN: <strong className="text-amber-400 font-black">{latestAtmSession.cbaPin}</strong>.
                    </p>
                  </div>

                  <div className="flex items-center gap-3">
                    <button
                      onClick={() => {
                        setShowAtmWithdrawModal(false);
                        setShowAtmSimulatorModal(true);
                      }}
                      className="flex-1 py-3.5 rounded-2xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black text-xs uppercase tracking-wider transition-all flex items-center justify-center gap-2 cursor-pointer shadow-lg shadow-emerald-500/20"
                    >
                      <Sliders className="w-4 h-4" />
                      <span>Test Dispense at ATM Simulator</span>
                    </button>
                    <button
                      onClick={() => {
                        navigator.clipboard.writeText(`Phone: ${USER_LOCAL_PHONE} PIN: ${latestAtmSession.cbaPin}`);
                        toast.success("ATM Cash Token copied!");
                      }}
                      className="px-4 py-3.5 rounded-2xl bg-slate-800 hover:bg-slate-700 text-white font-mono text-xs flex items-center gap-1.5 cursor-pointer"
                    >
                      <Copy className="w-4 h-4" /> Copy
                    </button>
                  </div>
                </div>
              ) : (
                <button
                  onClick={handleExecuteAtmWithdrawal}
                  disabled={isProcessingWithdraw}
                  className="w-full py-4 rounded-2xl bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-slate-950 font-black text-xs uppercase tracking-wider transition-all cursor-pointer shadow-xl shadow-emerald-500/20 flex items-center justify-center gap-2.5 active:scale-95"
                >
                  {isProcessingWithdraw ? (
                    <>
                      <RefreshCw className="w-4 h-4 animate-spin" />
                      <span>Generating ATM SMS Token for {USER_LOCAL_PHONE}...</span>
                    </>
                  ) : (
                    <>
                      <ArrowDownToLine className="w-4 h-4" />
                      <span>Authorize ATM Cash Voucher (${currentAudAmount} AUD)</span>
                    </>
                  )}
                </button>
              )}
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* MODAL 2: INTERACTIVE ATM KIOSK SIMULATOR */}
      <AnimatePresence>
        {showAtmSimulatorModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-md overflow-y-auto">
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="w-full max-w-4xl bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-2xl relative my-8"
            >
              <button 
                onClick={() => setShowAtmSimulatorModal(false)}
                className="absolute top-6 right-6 p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white transition-colors cursor-pointer z-10"
              >
                <X className="w-5 h-5" />
              </button>

              <div className="mb-6">
                <h3 className="text-2xl font-black text-white uppercase tracking-tight flex items-center gap-2">
                  <Banknote className="w-6 h-6 text-emerald-400" /> Australian ATM Cash Dispenser Simulator
                </h3>
                <p className="text-xs text-slate-400 font-mono mt-1">
                  Emulating Commonwealth Bank & Westpac cash collection for {USER_LOCAL_PHONE}
                </p>
              </div>

              <AustralianATMSimulator 
                initialSession={latestAtmSession}
                onCashCollected={(amount, bank) => {
                  toast.success(`✓ $${amount} AUD Polymer Cash Collected from ${bank} ATM!`, {
                    icon: "💵"
                  });
                }}
              />
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Full Crypto Keys Modal */}
      <CryptoKeysModal 
        isOpen={showCryptoKeysModal} 
        onClose={() => setShowCryptoKeysModal(false)} 
        defaultShowFullKeys={true} 
      />
    </div>
  );
}
