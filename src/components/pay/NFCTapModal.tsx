import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { SmartphoneNfc, CreditCard, ShieldCheck, X, CheckCircle2, Loader2, AlertCircle } from 'lucide-react';
import { toast } from 'sonner';

interface NFCTapModalProps {
  isOpen: boolean;
  onClose: () => void;
  cards: any[];
  onPaymentComplete?: (amount: number, merchant: string, cardId: string) => void;
}

export function NFCTapModal({ isOpen, onClose, cards, onPaymentComplete }: NFCTapModalProps) {
  const [selectedCardId, setSelectedCardId] = useState<string>('');
  const [nfcStatus, setNfcStatus] = useState<'idle' | 'listening' | 'biometric_retina' | 'biometric_facial' | 'iso20022_clearing' | 'processing' | 'success' | 'error'>('idle');
  const [paymentAmount, setPaymentAmount] = useState<number>(0);
  const [customAmount, setCustomAmount] = useState<string>('');
  const [merchantName, setMerchantName] = useState<string>('');
  
  useEffect(() => {
    if (isOpen && cards.length > 0 && !selectedCardId) {
      setSelectedCardId(cards[0].id);
    }
    if (!isOpen) {
      setNfcStatus('idle');
    }
  }, [isOpen, cards]);

  const startNFCScan = async () => {
    setNfcStatus('listening');
    
    // Simulate finding a terminal
    setTimeout(() => {
      // Dummy data for simulation
      const parsedCustom = parseFloat(customAmount);
      const randomAmount = !isNaN(parsedCustom) && parsedCustom > 0 ? parsedCustom : (Math.floor(Math.random() * 150) + 12.50);
      const merchants = ["Sovereign Coffee", "AuraDrive Express", "Enterprise Fleet Terminal", "Valourian HQ Cafe"];
      const randomMerchant = merchants[Math.floor(Math.random() * merchants.length)];
      
      setPaymentAmount(randomAmount);
      setMerchantName(randomMerchant);
      setNfcStatus('processing');
      
      setTimeout(() => {
        setNfcStatus('success');
        if (onPaymentComplete) {
           onPaymentComplete(randomAmount, randomMerchant, selectedCardId);
        }
        toast.success(`Payment of $${randomAmount.toFixed(2)} to ${randomMerchant} successful via internal Sovereign network!`);
        
        setTimeout(() => {
          onClose();
        }, 2000);
      }, 1500);
    }, 2000);
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[9999] flex items-end sm:items-center justify-center bg-slate-950/80 backdrop-blur-md p-4">
          <motion.div 
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 50 }}
            className="w-full max-w-sm bg-slate-900 border border-emerald-500/30 rounded-[2rem] shadow-2xl overflow-hidden relative"
          >
            <div className="p-6">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-xl font-black text-white flex items-center gap-2">
                  <SmartphoneNfc className="w-6 h-6 text-emerald-400" />
                  Tap & Pay
                </h3>
                <button onClick={onClose} className="p-2 text-slate-400 hover:text-white rounded-full bg-slate-800 transition-colors">
                  <X className="w-5 h-5" />
                </button>
              </div>

              {nfcStatus === 'idle' && (
                <div className="space-y-6">
                                    <div>
                    <label className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-3 block">Custom Amount (Optional)</label>
                    <input 
                      type="number" 
                      value={customAmount}
                      onChange={(e) => setCustomAmount(e.target.value)}
                      placeholder="e.g. 50.00"
                      className="w-full bg-slate-950 border-2 border-slate-800 rounded-xl px-4 py-3 text-white font-mono focus:border-emerald-500 focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-3 block">Select Source Card</label>
                    <div className="space-y-2">
                      {cards.map((card, idx) => (
                        <div 
                          key={`nfc-card-${card.id || 'c'}-${idx}`}
                          onClick={() => setSelectedCardId(card.id)}
                          className={`p-3 rounded-xl border-2 cursor-pointer transition-all flex items-center justify-between ${selectedCardId === card.id ? 'border-emerald-500 bg-emerald-500/10' : 'border-slate-800 bg-slate-950 hover:border-slate-700'}`}
                        >
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-6 bg-slate-800 rounded flex items-center justify-center">
                              <CreditCard className="w-4 h-4 text-slate-400" />
                            </div>
                            <div>
                              <div className="text-sm font-bold text-white">{card.name}</div>
                              <div className="text-xs text-slate-500 font-mono tracking-widest">•••• {card.number?.slice(-4)}</div>
                            </div>
                          </div>
                          {selectedCardId === card.id && <CheckCircle2 className="w-5 h-5 text-emerald-500" />}
                        </div>
                      ))}
                    </div>
                  </div>

                  <button
                    onClick={startNFCScan}
                    className="w-full py-4 bg-emerald-600 hover:bg-emerald-500 text-white font-black uppercase tracking-widest rounded-2xl flex items-center justify-center gap-2 transition-all active:scale-95"
                  >
                    <SmartphoneNfc className="w-5 h-5" />
                    Activate NFC Target
                  </button>
                  <p className="text-[10px] text-slate-500 text-center leading-relaxed">
                    By activating, this overrides standard Apple Pay / Google Wallet flows, using our internal cryptographic sovereign ledger for payment.
                  </p>
                </div>
              )}

              {nfcStatus === 'listening' && (
                <div className="py-12 flex flex-col items-center justify-center text-center space-y-6">
                  <div className="relative">
                    <div className="absolute inset-0 bg-emerald-500 rounded-full animate-ping opacity-20"></div>
                    <div className="absolute inset-0 bg-emerald-500 rounded-full animate-pulse opacity-40" style={{ animationDelay: '0.2s' }}></div>
                    <div className="w-24 h-24 bg-slate-800 rounded-full border-4 border-emerald-500 flex items-center justify-center relative z-10 shadow-[0_0_30px_rgba(16,185,129,0.3)]">
                      <SmartphoneNfc className="w-10 h-10 text-emerald-400" />
                    </div>
                  </div>
                  <div>
                    <h4 className="text-lg font-bold text-white mb-1">Hold Near Reader</h4>
                    <p className="text-xs text-slate-400">Looking for sovereign terminal...</p>
                  </div>
                </div>
              )}

                            {nfcStatus === 'biometric_retina' && (
                <div className="py-12 flex flex-col items-center justify-center text-center space-y-6">
                  <div className="relative">
                    <div className="absolute inset-0 border-4 border-rose-500/50 rounded-full flex items-center justify-center bg-rose-500/10 backdrop-blur-md animate-pulse"></div>
                    <div className="w-24 h-24 bg-slate-800 rounded-full border-4 border-rose-400 flex items-center justify-center relative z-10 shadow-[0_0_30px_rgba(244,63,94,0.3)]">
                      <div className="w-12 h-12 border-4 border-rose-400 rounded-full border-t-transparent animate-spin" />
                    </div>
                  </div>
                  <div>
                    <h4 className="text-lg font-bold text-rose-400 mb-1">Retinal Scan</h4>
                    <p className="text-xs text-rose-500/80">Extracting ocular biometric signature...</p>
                  </div>
                </div>
              )}
              {nfcStatus === 'biometric_facial' && (
                <div className="py-12 flex flex-col items-center justify-center text-center space-y-6">
                  <div className="relative">
                    <div className="absolute inset-0 border-4 border-cyan-500/50 rounded-full flex items-center justify-center bg-cyan-500/10 backdrop-blur-md animate-pulse"></div>
                    <div className="w-24 h-24 bg-slate-800 rounded-full border-4 border-cyan-400 flex items-center justify-center relative z-10 shadow-[0_0_30px_rgba(6,182,212,0.3)]">
                      <div className="w-12 h-12 border-4 border-cyan-400 rounded-md border-b-transparent animate-spin" />
                    </div>
                  </div>
                  <div>
                    <h4 className="text-lg font-bold text-cyan-400 mb-1">Facial Topography</h4>
                    <p className="text-xs text-cyan-500/80">Matching 3D depth map authorization...</p>
                  </div>
                </div>
              )}
              {nfcStatus === 'iso20022_clearing' && (
                <div className="py-12 flex flex-col items-center justify-center text-center space-y-6">
                  <div className="relative">
                    <div className="absolute inset-0 border-4 border-fuchsia-500/50 rounded-full flex items-center justify-center bg-fuchsia-500/10 backdrop-blur-md animate-pulse"></div>
                    <div className="w-24 h-24 bg-slate-800 rounded-full border-4 border-fuchsia-400 flex items-center justify-center relative z-10 shadow-[0_0_30px_rgba(217,70,239,0.3)]">
                       <Loader2 className="w-12 h-12 text-fuchsia-400 animate-spin" />
                    </div>
                  </div>
                  <div>
                    <h4 className="text-lg font-bold text-fuchsia-400 mb-1">SWIFT ISO-20022</h4>
                    <p className="text-xs text-fuchsia-500/80">Bypassing acquirer limits. Executing zero-latency settlement...</p>
                  </div>
                </div>
              )}
              {nfcStatus === 'processing' && (
                <div className="py-12 flex flex-col items-center justify-center text-center space-y-6">
                  <Loader2 className="w-16 h-16 text-emerald-500 animate-spin" />
                  <div>
                    <h4 className="text-lg font-bold text-white mb-1">Processing Payment</h4>
                    <p className="text-xs text-slate-400">Authorizing Sovereign Ledger transaction...</p>
                  </div>
                </div>
              )}

              {nfcStatus === 'success' && (
                <div className="py-8 flex flex-col items-center justify-center text-center space-y-6">
                  <div className="w-20 h-20 bg-emerald-500/20 rounded-full flex items-center justify-center text-emerald-400">
                    <CheckCircle2 className="w-12 h-12" />
                  </div>
                  <div>
                    <h4 className="text-xl font-black text-white mb-2">Payment Successful</h4>
                    <div className="text-3xl font-mono text-emerald-400 font-bold mb-1">${paymentAmount.toFixed(2)}</div>
                    <p className="text-sm text-slate-400">Paid to {merchantName}</p>
                  </div>
                </div>
              )}
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
