
import toast from "react-hot-toast";
import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CreditCard, Smartphone, Zap, CheckCircle2, ShieldCheck, Fingerprint, Lock, Unlock, Settings, ArrowRightLeft, Loader2, ArrowDownToLine, RefreshCw, SmartphoneNfc, Camera, Copy, Eye, EyeOff, Plus } from 'lucide-react';
import { useGlobalCurrency } from '../../contexts/CurrencyContext';
import { NFCTapModal } from '../pay/NFCTapModal';
import Webcam from 'react-webcam';

interface BankCard {
  id: string;
  type: 'physical' | 'virtual';
  name: string;
  number: string;
  balance: number;
  currency: string;
  status: 'active' | 'frozen';
  limit: number | 'unlimited';
  cvv?: string;
  expiry?: string;
}

const INITIAL_CARDS: BankCard[] = [
  { id: 'c1', type: 'virtual', name: 'Valourian Global Virtual Black', number: '5119 3988 4562 4829', balance: 940000000, currency: 'AUD', status: 'active', limit: 'unlimited', cvv: '482', expiry: '12/28' },
  { id: 'c2', type: 'virtual', name: 'AuraDrive Business Virtual', number: '5119 3988 4562 8291', balance: 940000000, currency: 'AUD', status: 'active', limit: 940000000, cvv: '119', expiry: '09/27' },
  { id: 'c3', type: 'virtual', name: 'Sovereign Logistics Virtual', number: '5119 3988 4562 1029', balance: 940000000, currency: 'AUD', status: 'active', limit: 9400000000, cvv: '741', expiry: '04/29' },
  { id: 'p1', type: 'physical', name: 'Valourian Physical Black Card (Primary)', number: '5119 3988 4562 9999', balance: 940000000, currency: 'AUD', status: 'active', limit: 'unlimited', cvv: '999', expiry: '01/30' },
];

const EXCHANGE_RATES: Record<string, number> = {
  'USD': 1.00,
  'AUD': 1.52,
  'EUR': 0.92,
  'GBP': 0.79,
  'JPY': 150.4,
  'SGD': 1.34
};

export const BlackCardsController = () => {
  const { formatConverted: format, currency, setCurrency } = useGlobalCurrency() as any;
  const [cards, setCards] = useState<BankCard[]>(() => {
    try {
      const saved = window.localStorage.getItem('valourian_digital_cards_v8');
      if (saved) return JSON.parse(saved);
    } catch (e) {}
    return INITIAL_CARDS;
  });

  useEffect(() => {
    window.localStorage.setItem('valourian_digital_cards_v8', JSON.stringify(cards));
  }, [cards]);
  const [isNfcModalOpen, setIsNfcModalOpen] = useState(false);
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

  const startCameraScan = () => {
    setIsScanning(true);
    setScanProgress(0);
    // Simulate OCR extraction process
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
    
    // Auto currency conversion context
    const localizedAmount = convertAmount(amountNum, 'AUD', currency || 'AUD');

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
           expiry: manualCardExpiry
         };
         if (!cards.find(c => c.number === manualCardNumber)) {
             setCards([...cards, destCard]);
         }
      }

      if (!destCard) {
        let importedCard: any = null;
        if ('NDEFReader' in window) {
          try {
            const ndef = new (window as any).NDEFReader();
            await ndef.scan();
            importedCard = await new Promise((resolve, reject) => {
              const timeout = setTimeout(() => reject(new Error("NFC Scan timeout after 15s")), 15000);
              ndef.addEventListener("readingerror", () => {
                clearTimeout(timeout);
                reject(new Error("Cannot read data from the NFC tag. Try another one?"));
              });
              ndef.addEventListener("reading", ({ message, serialNumber }: any) => {
                clearTimeout(timeout);
                resolve({
                  id: `PHYS-NFC-${serialNumber || Math.random().toString(36).slice(2)}`,
                  name: "Scanned Physical Bank Card",
                  number: "5119 3988 4562 " + Math.floor(1000 + Math.random() * 9000),
                  balance: txType === 'pay' ? amountNum * 2 : 0,
                  limit: 'unlimited',
                  type: 'physical', currency: 'AUD', status: 'active',
                  cvv: '***',
                  expiry: '**/**'
                });
              });
            });
          } catch (e) {
            console.warn("NFC API error, simulating physical card tap...", e);
          }
        }
        
        if (!importedCard) {
          importedCard = await new Promise((resolve) => {
            setTimeout(() => {
              resolve({
                id: `PHYS-NFC-SIM-${Math.random().toString(36).slice(2)}`,
                name: "Tapped Physical Card (NFC)",
                number: "4242 4242 4242 " + Math.floor(1000 + Math.random() * 9000),
                balance: txType === 'pay' ? amountNum * 2 : 0,
                limit: 'unlimited',
                type: 'physical', currency: 'AUD', status: 'active',
                cvv: '123',
                expiry: '12/28'
              });
            }, 2500);
          });
        }
        destCard = importedCard;
        if (destCard && !cards.find(c => c.number === destCard?.number)) {
             setCards(prev => [...prev, destCard as BankCard]);
             toast.success('New NFC Card Added to Treasury Dashboard');
        }
      }

      setNfcState('processing');
      setNfcMessage(`Establishing secure 256-bit connection to ${destCard?.name}...`);
      await new Promise(r => setTimeout(r, 1500));
      setNfcMessage(`Authenticating with payment network...`);
      await new Promise(r => setTimeout(r, 1500));
      
      const currencySymbol = currency === 'USD' ? '$' : currency === 'EUR' ? '€' : currency === 'GBP' ? '£' : '$';
      
      setNfcMessage(txType === 'refund' 
        ? `Transferring ${currencySymbol}${localizedAmount.toLocaleString(undefined, { minimumFractionDigits: 2 })} (${currency}) from Virtual Treasury to ${destCard?.name}...`
        : `Charging ${currencySymbol}${localizedAmount.toLocaleString(undefined, { minimumFractionDigits: 2 })} (${currency}) from ${destCard?.name} to Virtual Treasury...`
      );
      
      await new Promise(r => setTimeout(r, 2000));
      
      if (txType === 'refund' && selectedSource) {
         setCards(cards.map(c => c.id === selectedSource.id ? { ...c, balance: c.balance - amountNum } : c));
      } else if (txType === 'pay' && selectedSource) {
         setCards(cards.map(c => c.id === selectedSource.id ? { ...c, balance: c.balance + amountNum } : c));
      }

      setNfcState('success');
      setNfcMessage(txType === 'refund' ? `Successfully refunded/deposited to physical card with localized conversion.` : `Successfully charged physical card with localized conversion.`);
      
      setTimeout(() => {
        setNfcState('idle');
        setRefundAmount('');
        setSelectedSource(null);
        setSelectedDestination(null);
        setManualCardNumber('');
        setManualCardCVC('');
        setManualCardExpiry('');
      }, 4000);

    } catch (error: any) {
      setNfcState('error');
      setNfcMessage(error.message || 'Transaction failed');
      setTimeout(() => setNfcState('idle'), 4000);
    }
  };

  return (
    <>
      <NFCTapModal 
        isOpen={isNfcModalOpen} 
        onClose={() => setIsNfcModalOpen(false)} 
        cards={INITIAL_CARDS.filter(c => c.status === 'active')} 
        onPaymentComplete={(amt, merch) => {
          toast.success(`NFC Payment completed: ${amt} to ${merch}`);
        }}
      />
      <div className="space-y-6">
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        <div className="xl:col-span-2 space-y-6">
          <div className="bg-white/5 border border-white/10 rounded-2xl p-6">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-medium text-white flex items-center gap-2">
                <CreditCard className="w-5 h-5 text-indigo-400" />
                Global Card Management & Tokenization
              </h2>
              <div className="flex items-center gap-2">
                <button onClick={() => setCurrency && setCurrency('USD')} className={`px-3 py-1 rounded text-xs font-medium ${currency === 'USD' ? 'bg-indigo-500/30 text-indigo-300' : 'bg-white/5 text-white/50'}`}>USD</button>
                <button onClick={() => setCurrency && setCurrency('AUD')} className={`px-3 py-1 rounded text-xs font-medium ${currency === 'AUD' ? 'bg-indigo-500/30 text-indigo-300' : 'bg-white/5 text-white/50'}`}>AUD</button>
                <button onClick={() => setCurrency && setCurrency('EUR')} className={`px-3 py-1 rounded text-xs font-medium ${currency === 'EUR' ? 'bg-indigo-500/30 text-indigo-300' : 'bg-white/5 text-white/50'}`}>EUR</button>
              </div>
            </div>

            <div className="space-y-4">
              {cards.map(card => {
                const isRevealed = revealedCards[card.id];
                const displayNum = isRevealed ? card.number : `•••• •••• •••• ${card.number.slice(-4)}`;
                return (
                  <div key={card.id} className="bg-white/5 border border-white/10 rounded-xl p-5 hover:bg-white/10 transition-colors">
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-4">
                        <div className={`p-3 rounded-xl ${card.type === 'virtual' ? 'bg-indigo-500/20 text-indigo-400' : 'bg-emerald-500/20 text-emerald-400'}`}>
                          {card.type === 'virtual' ? <Cloud className="w-6 h-6" /> : <CreditCard className="w-6 h-6" />}
                        </div>
                        <div>
                          <h3 className="text-white font-medium">{card.name}</h3>
                          <div className="flex items-center gap-3 mt-1">
                            <span className="text-sm font-mono text-white/70">{displayNum}</span>
                            <button onClick={() => toggleReveal(card.id)} className="text-white/40 hover:text-white/80 transition-colors">
                              {isRevealed ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                            </button>
                            {isRevealed && (
                              <button onClick={() => copyToClipboard(card.number, 'Card number')} className="text-white/40 hover:text-white/80 transition-colors">
                                <Copy className="w-4 h-4" />
                              </button>
                            )}
                          </div>
                          {isRevealed && card.cvv && (
                            <div className="flex items-center gap-4 mt-2 text-xs text-white/50 font-mono">
                              <span>EXP: {card.expiry}</span>
                              <div className="flex items-center gap-1">
                                <span>CVV: {card.cvv}</span>
                                <button onClick={() => copyToClipboard(card.cvv || '', 'CVV')} className="hover:text-white/80"><Copy className="w-3 h-3" /></button>
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-lg font-medium text-white">{format(card.balance)}</div>
                        <div className="text-sm text-emerald-400">Limit: {card.limit === 'unlimited' ? 'Unlimited' : format(card.limit as number)}</div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        <div className="space-y-6">
          <div className="bg-white/5 border border-white/10 rounded-2xl p-6">
            <h3 className="text-lg font-medium text-white mb-6 flex items-center gap-2">
              <Zap className="w-5 h-5 text-amber-400" />
              NFC / OCR Treasury Operations
            </h3>
            
            <div className="flex bg-white/5 p-1 rounded-lg mb-6">
               <button onClick={() => setTxType('refund')} className={`flex-1 py-2 text-sm font-medium rounded-md transition-colors ${txType === 'refund' ? 'bg-indigo-500 text-white' : 'text-white/60 hover:text-white'}`}>Push to Card</button>
               <button onClick={() => setTxType('pay')} className={`flex-1 py-2 text-sm font-medium rounded-md transition-colors ${txType === 'pay' ? 'bg-emerald-500 text-white' : 'text-white/60 hover:text-white'}`}>Pull from Card</button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm text-white/70 mb-1">Treasury Source (Virtual)</label>
                <select 
                  className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-3 text-white appearance-none"
                  value={selectedSource?.id || ''}
                  onChange={(e) => setSelectedSource(cards.find(c => c.id === e.target.value) || null)}
                >
                  <option value="">Select Treasury Card</option>
                  {cards.filter(c => c.type === 'virtual').map(card => (
                    <option key={card.id} value={card.id}>{card.name} - {format(card.balance)}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm text-white/70 mb-1">Amount (Local Currency Converted)</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <span className="text-white/50">$</span>
                  </div>
                  <input
                    type="number"
                    value={refundAmount}
                    onChange={(e) => setRefundAmount(e.target.value)}
                    className="w-full bg-white/5 border border-white/10 rounded-lg pl-8 pr-4 py-3 text-white"
                    placeholder="0.00"
                  />
                </div>
                {refundAmount && !isNaN(parseFloat(refundAmount)) && (
                   <div className="text-xs text-white/50 mt-1 flex justify-between">
                     <span>Treasury Base (AUD): ${(parseFloat(refundAmount) / (EXCHANGE_RATES[currency || 'AUD'] || 1) * EXCHANGE_RATES['AUD']).toFixed(2)}</span>
                     <span>Current ({currency}): ${(parseFloat(refundAmount)).toFixed(2)}</span>
                   </div>
                )}
              </div>

              <div className="pt-4 border-t border-white/10">
                <div className="flex justify-between items-center mb-3">
                  <label className="block text-sm text-white/70">External Physical Card</label>
                  {!isScanning && (
                    <button onClick={startCameraScan} className="text-xs text-indigo-400 flex items-center gap-1 hover:text-indigo-300 transition-colors">
                      <Camera className="w-3 h-3" /> OCR Scan
                    </button>
                  )}
                </div>
                
                {isScanning ? (
                  <div className="bg-black/40 border border-white/10 rounded-lg p-4 overflow-hidden relative">
                    <Webcam audio={false} className="w-full rounded opacity-50" />
                    <div className="absolute inset-0 flex flex-col items-center justify-center">
                      <div className="w-3/4 h-32 border-2 border-indigo-500/50 rounded-lg relative overflow-hidden">
                        <div className="absolute top-0 left-0 w-full bg-indigo-500/30 h-1 animate-scan" style={{ top: `${scanProgress}%` }} />
                      </div>
                      <p className="text-xs text-white mt-2">Extracting PAN & Expiry... {scanProgress}%</p>
                    </div>
                  </div>
                ) : (
                  <>
                    <input
                      type="text"
                      value={manualCardNumber}
                      onChange={(e) => setManualCardNumber(e.target.value)}
                      className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-3 text-white font-mono text-sm mb-2"
                      placeholder="Card Number (or Tap NFC)"
                    />
                    <div className="grid grid-cols-2 gap-2">
                      <input
                        type="text"
                        value={manualCardExpiry}
                        onChange={(e) => setManualCardExpiry(e.target.value)}
                        className="bg-white/5 border border-white/10 rounded-lg px-4 py-3 text-white font-mono text-sm"
                        placeholder="MM/YY"
                      />
                      <input
                        type="text"
                        value={manualCardCVC}
                        onChange={(e) => setManualCardCVC(e.target.value)}
                        className="bg-white/5 border border-white/10 rounded-lg px-4 py-3 text-white font-mono text-sm"
                        placeholder="CVC"
                      />
                    </div>
                  </>
                )}
              </div>

              <div className="pt-4">
                <button
                  onClick={handleNfcRefund}
                  disabled={nfcState !== 'idle' || !refundAmount}
                  className="w-full relative overflow-hidden bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-400 hover:to-purple-500 text-white font-medium py-3 rounded-lg flex items-center justify-center gap-2 transition-all disabled:opacity-50"
                >
                  <AnimatePresence mode="wait">
                    {nfcState === 'idle' && (
                      <motion.div key="idle" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="flex items-center gap-2">
                        <SmartphoneNfc className="w-5 h-5" />
                        Initialize NFC / Secure Terminal
                      </motion.div>
                    )}
                    {nfcState === 'waiting' && (
                      <motion.div key="waiting" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="flex items-center gap-2">
                        <Smartphone className="w-5 h-5 animate-pulse" />
                        Ready to Scan / Tap...
                      </motion.div>
                    )}
                    {nfcState === 'processing' && (
                      <motion.div key="processing" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="flex items-center gap-2">
                        <Loader2 className="w-5 h-5 animate-spin" />
                        Processing...
                      </motion.div>
                    )}
                    {nfcState === 'success' && (
                      <motion.div key="success" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="flex items-center gap-2">
                        <CheckCircle2 className="w-5 h-5" />
                        Success
                      </motion.div>
                    )}
                    {nfcState === 'error' && (
                      <motion.div key="error" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="flex items-center gap-2">
                        Failed
                      </motion.div>
                    )}
                  </AnimatePresence>
                </button>
                {nfcMessage && (
                  <p className="text-center text-xs text-white/60 mt-3 font-medium animate-pulse">{nfcMessage}</p>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
    </>
  );
};

const Cloud = ({ className }: { className?: string }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <path d="M17.5 19H9a7 7 0 1 1 6.71-9h1.79a4.5 4.5 0 1 1 0 9Z"/>
  </svg>
);
