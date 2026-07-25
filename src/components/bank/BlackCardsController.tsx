import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CreditCard, Smartphone, Zap, CheckCircle2, ShieldCheck, Fingerprint, Lock, Unlock, Settings, ArrowRightLeft, Loader2, ArrowDownToLine, RefreshCw, SmartphoneNfc } from 'lucide-react';
import { useGlobalCurrency } from '../../contexts/CurrencyContext';

// Define card types
interface BankCard {
  id: string;
  type: 'physical' | 'virtual';
  name: string;
  number: string;
  balance: number;
  currency: string;
  status: 'active' | 'frozen';
  limit: number | 'unlimited';
}

const INITIAL_CARDS: BankCard[] = [
  { id: 'c1', type: 'virtual', name: 'Valourian Global Virtual Black', number: '•••• •••• •••• 4829', balance: 200000000, currency: 'AUD', status: 'active', limit: 'unlimited' },
  { id: 'c2', type: 'virtual', name: 'AuraDrive Business Virtual', number: '•••• •••• •••• 8291', balance: 200000000, currency: 'AUD', status: 'active', limit: 100000000 },
  { id: 'c3', type: 'virtual', name: 'Sovereign Logistics Virtual', number: '•••• •••• •••• 1029', balance: 200000000, currency: 'AUD', status: 'active', limit: 2000000000 },
  { id: 'p1', type: 'physical', name: 'Valourian Physical Black Card (Primary)', number: '•••• •••• •••• 9999', balance: 200000000, currency: 'AUD', status: 'active', limit: 'unlimited' },
  { id: 'p2', type: 'physical', name: 'Great Southern Bank Card', number: '•••• •••• •••• 5543', balance: 200000000, currency: 'AUD', status: 'active', limit: 250000 },
];

export const BlackCardsController = () => {
  const { format, currency } = useGlobalCurrency();
  const [cards, setCards] = useState<BankCard[]>(INITIAL_CARDS);
  const [selectedSource, setSelectedSource] = useState<BankCard | null>(null);
  const [selectedDestination, setSelectedDestination] = useState<BankCard | null>(null);
  const [refundAmount, setRefundAmount] = useState<string>('');
  
  // NFC Simulation State
  const [nfcState, setNfcState] = useState<'idle' | 'waiting' | 'processing' | 'success' | 'error'>('idle');
  const [nfcMessage, setNfcMessage] = useState('');

  const handleNfcRefund = () => {
    if (!selectedSource || !selectedDestination || !refundAmount) return;
    
    const amountNum = parseFloat(refundAmount);
    if (isNaN(amountNum) || amountNum <= 0) {
      alert("Invalid amount");
      return;
    }
    
    if (selectedSource.balance < amountNum) {
      alert("Insufficient funds in source account.");
      return;
    }

    setNfcState('waiting');
    setNfcMessage('Hold physical card near device NFC reader...');

    // Simulate NFC Tap detection after 2.5 seconds
    setTimeout(() => {
      setNfcState('processing');
      setNfcMessage('NFC Handshake Confirmed. Processing EMV push protocol...');
      
      // Simulate bank network processing
      setTimeout(() => {
        // Execute the ledger transfer
        setCards(prev => prev.map(c => {
          if (c.id === selectedSource.id) {
            return { ...c, balance: c.balance - amountNum };
          }
          if (c.id === selectedDestination.id) {
            return { ...c, balance: c.balance + amountNum };
          }
          return c;
        }));
        
        setNfcState('success');
        setNfcMessage(`Successfully refunded ${format(amountNum)} to ${selectedDestination.name}`);
        setRefundAmount('');
        
        // Reset after 4 seconds
        setTimeout(() => {
          setNfcState('idle');
          setSelectedSource(null);
          setSelectedDestination(null);
        }, 4000);
        
      }, 2000);
    }, 2500);
  };

  return (
    <div className="space-y-8">
      {/* Cards Display Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
        {cards.map(card => (
          <div key={card.id} className={`relative p-6 rounded-3xl overflow-hidden shadow-2xl transition-all duration-300 ${card.type === 'physical' ? 'bg-gradient-to-br from-slate-900 to-black border border-slate-700' : 'bg-gradient-to-br from-blue-900 to-indigo-900 border border-blue-700'}`}>
            <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-full blur-2xl -mr-10 -mt-10 pointer-events-none"></div>
            
            <div className="flex justify-between items-start mb-8">
              <div className="flex items-center gap-2">
                {card.type === 'physical' ? <CreditCard className="w-5 h-5 text-slate-300" /> : <Smartphone className="w-5 h-5 text-blue-300" />}
                <span className="text-xs font-bold uppercase tracking-wider text-white/70">
                  {card.type === 'physical' ? 'Physical Card' : 'Virtual Card'}
                </span>
              </div>
              <ShieldCheck className="w-6 h-6 text-emerald-400" />
            </div>

            <div className="space-y-1 mb-6">
              <h3 className="text-lg font-medium text-white truncate">{card.name}</h3>
              <p className="text-white/60 font-mono text-sm tracking-widest">{card.number}</p>
            </div>

            <div className="flex justify-between items-end">
              <div>
                <p className="text-xs text-white/50 uppercase tracking-wider mb-1">Available Balance</p>
                <p className="text-2xl font-bold text-white">{format(card.balance)}</p>
              </div>
              <div className="text-right">
                <p className="text-xs text-white/50 uppercase tracking-wider mb-1">Limit</p>
                <p className="text-sm font-medium text-white">
                  {card.limit === 'unlimited' ? 'UNLIMITED' : format(card.limit)}
                </p>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* NFC Refund Station */}
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-8 shadow-2xl relative overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-blue-500 via-indigo-500 to-purple-500"></div>
        
        <div className="flex items-center gap-4 mb-8">
          <div className="w-12 h-12 rounded-full bg-blue-500/20 flex items-center justify-center">
            <SmartphoneNfc className="w-6 h-6 text-blue-400" />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-white">NFC Physical Refund Station</h2>
            <p className="text-slate-400 text-sm">Tap physical bank cards to refund capital from virtual ledgers.</p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Source Selection */}
          <div className="space-y-4">
            <label className="text-xs font-bold uppercase tracking-wider text-slate-400">Source Virtual Account</label>
            <select 
              className="w-full bg-slate-800 border border-slate-700 text-white rounded-xl p-4 focus:ring-2 focus:ring-blue-500 outline-none"
              value={selectedSource?.id || ''}
              onChange={(e) => setSelectedSource(cards.find(c => c.id === e.target.value) || null)}
              disabled={nfcState !== 'idle'}
            >
              <option value="">Select source account...</option>
              {cards.filter(c => c.type === 'virtual').map(c => (
                <option key={c.id} value={c.id}>{c.name} ({format(c.balance)})</option>
              ))}
            </select>
          </div>

          {/* Amount */}
          <div className="space-y-4">
            <label className="text-xs font-bold uppercase tracking-wider text-slate-400">Refund Amount</label>
            <div className="relative">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 font-bold">$</span>
              <input 
                type="number"
                placeholder="0.00"
                className="w-full bg-slate-800 border border-slate-700 text-white rounded-xl p-4 pl-8 focus:ring-2 focus:ring-blue-500 outline-none font-mono"
                value={refundAmount}
                onChange={(e) => setRefundAmount(e.target.value)}
                disabled={nfcState !== 'idle'}
              />
            </div>
          </div>

          {/* Destination Selection */}
          <div className="space-y-4">
            <label className="text-xs font-bold uppercase tracking-wider text-slate-400">Destination Physical Card</label>
            <select 
              className="w-full bg-slate-800 border border-slate-700 text-white rounded-xl p-4 focus:ring-2 focus:ring-emerald-500 outline-none"
              value={selectedDestination?.id || ''}
              onChange={(e) => setSelectedDestination(cards.find(c => c.id === e.target.value) || null)}
              disabled={nfcState !== 'idle'}
            >
              <option value="">Select physical card to tap...</option>
              {cards.filter(c => c.type === 'physical').map(c => (
                <option key={c.id} value={c.id}>{c.name}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Action Button & NFC Status Modal Overlay */}
        <div className="mt-8 flex justify-end">
          <button
            onClick={handleNfcRefund}
            disabled={!selectedSource || !selectedDestination || !refundAmount || nfcState !== 'idle'}
            className="px-8 py-4 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-bold rounded-xl shadow-lg disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-3 transition-all"
          >
            <SmartphoneNfc className="w-5 h-5" />
            Initiate NFC Refund
          </button>
        </div>

        {/* NFC Modal */}
        <AnimatePresence>
          {nfcState !== 'idle' && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-slate-900/95 backdrop-blur-md z-50 flex items-center justify-center p-8 text-center rounded-3xl"
            >
              <div className="max-w-md w-full space-y-6">
                {nfcState === 'waiting' && (
                  <motion.div 
                    animate={{ scale: [1, 1.1, 1] }} 
                    transition={{ repeat: Infinity, duration: 1.5 }}
                    className="w-24 h-24 bg-blue-500/20 rounded-full flex items-center justify-center mx-auto"
                  >
                    <SmartphoneNfc className="w-12 h-12 text-blue-400" />
                  </motion.div>
                )}
                
                {nfcState === 'processing' && (
                  <motion.div 
                    animate={{ rotate: 360 }} 
                    transition={{ repeat: Infinity, duration: 2, ease: "linear" }}
                    className="w-24 h-24 mx-auto flex items-center justify-center"
                  >
                    <RefreshCw className="w-12 h-12 text-indigo-400" />
                  </motion.div>
                )}

                {nfcState === 'success' && (
                  <motion.div 
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    className="w-24 h-24 bg-emerald-500/20 rounded-full flex items-center justify-center mx-auto"
                  >
                    <CheckCircle2 className="w-12 h-12 text-emerald-400" />
                  </motion.div>
                )}

                <h3 className="text-2xl font-bold text-white">{nfcState === 'success' ? 'Refund Complete' : 'NFC Connection'}</h3>
                <p className="text-slate-300 text-lg">{nfcMessage}</p>
                
                {nfcState === 'waiting' && (
                  <div className="mt-8 flex justify-center">
                    <button onClick={() => setNfcState('idle')} className="text-slate-400 hover:text-white px-4 py-2">
                      Cancel
                    </button>
                  </div>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

      </div>
    </div>
  );
};
