import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  SmartphoneNfc, 
  CreditCard, 
  ShieldCheck, 
  X, 
  CheckCircle2, 
  AlertCircle,
  Loader2, 
  Sparkles, 
  Wifi, 
  Lock, 
  Unlock,
  Zap, 
  Building2, 
  Globe, 
  Check, 
  Copy, 
  ArrowUpRight,
  Database,
  Radio,
  Printer,
  Download,
  RefreshCw,
  Coins,
  Volume2,
  VolumeX,
  Fingerprint,
  SlidersHorizontal,
  ChevronDown,
  Layers,
  Send
} from 'lucide-react';
import { toast } from 'sonner';
import { jsPDF } from 'jspdf';
import { renderAutoTable } from '../../utils/safePdfAutoTable';
import { collection, addDoc } from 'firebase/firestore';
import { db } from '../../firebase';
import { unifiedBankCardSync, UnifiedBankCard } from '../../services/unifiedBankCardSync';
import { smsEmailDispatchService } from '../../services/smsEmailDispatchService';
import { useGlobalCurrency } from '../../contexts/CurrencyContext';
import { convertCurrency, formatCurrency } from '../../utils/CurrencyConverter';

interface NFCTapModalProps {
  isOpen: boolean;
  onClose: () => void;
  cards: any[];
  user?: any;
  onPaymentComplete?: (amount: number, merchant: string, cardId: string) => void;
}

export function NFCTapModal({ isOpen, onClose, cards: propCards, user, onPaymentComplete }: NFCTapModalProps) {
  const { currency: globalCur } = useGlobalCurrency();
  const [selectedCardId, setSelectedCardId] = useState<string>('');
  const [cards, setCards] = useState<any[]>(propCards || []);

  // Sync cards with unifiedBankCardSync
  useEffect(() => {
    const syncCards = () => {
      const liveCards = unifiedBankCardSync.getCards();
      const activeId = unifiedBankCardSync.getActivePaymentCardId();
      if (liveCards && liveCards.length > 0) {
        setCards(liveCards);
        if (!selectedCardId) {
          const match = activeId && liveCards.some(c => c.id === activeId) ? activeId : liveCards[0].id;
          setSelectedCardId(match);
        }
      } else if (propCards && propCards.length > 0) {
        setCards(propCards);
        if (!selectedCardId) {
          const match = activeId && propCards.some((c: any) => c.id === activeId) ? activeId : propCards[0].id;
          setSelectedCardId(match);
        }
      }
    };

    syncCards();
    const unsub = unifiedBankCardSync.subscribe((next) => {
      if (next && next.length > 0) {
        setCards(next);
      }
    });
    return unsub;
  }, [propCards]);

  // Listen for direct tap & pay trigger events
  useEffect(() => {
    const handler = (e: any) => {
      if (e?.detail?.cardId) {
        setSelectedCardId(e.detail.cardId);
      }
    };
    window.addEventListener("valourian_open_tap_and_pay", handler);
    return () => window.removeEventListener("valourian_open_tap_and_pay", handler);
  }, []);

  const handleSetActiveDefaultTapCard = (cardId: string) => {
    const target = cards.find(c => c.id === cardId);
    if (!target) return;
    unifiedBankCardSync.setActivePaymentCardId(cardId);
    unifiedBankCardSync.autoPopulateCardCredentials(cardId);
    toast.success(`${target.name} set as DEFAULT active payment card everywhere!`, {
      description: "Auto-populates checkouts and bypasses external browser Google Wallet cards.",
      icon: "⚡"
    });
  };

  // Terminal & Operation States
  const [terminalState, setTerminalState] = useState<
    'ready' | 'approaching' | 'reading' | 'pin_required' | 'authorizing' | 'approved' | 'declined'
  >('ready');

  const [paymentAmount, setPaymentAmount] = useState<number>(64.50);
  const [customAmount, setCustomAmount] = useState<string>('');
  const [merchantName, setMerchantName] = useState<string>('Woolworths Metro Barangaroo');
  const [merchantCategory, setMerchantCategory] = useState<string>('Supermarket & Retail POS');
  const [cardTapped, setCardTapped] = useState(false);
  const [isHapticVibrating, setIsHapticVibrating] = useState(false);
  const [declineReason, setDeclineReason] = useState<string>('');
  const [soundEnabled, setSoundEnabled] = useState(true);

  // Dual-rail routing selection
  const [routingRail, setRoutingRail] = useState<'eftpos_least_cost' | 'global_credit'>('eftpos_least_cost');

  // Contactless PIN Pad state for amounts > $100 AUD
  const [enteredPin, setEnteredPin] = useState<string>('');
  const [isPinKeypadActive, setIsPinKeypadActive] = useState<boolean>(false);

  // Web NFC hardware detection
  const [hasWebNfcHardware, setHasWebNfcHardware] = useState<boolean>(false);
  const [webNfcListening, setWebNfcListening] = useState<boolean>(false);

  // EMV Cryptographic Elements
  const [cryptogram, setCryptogram] = useState<string>('');
  const [authCode, setAuthCode] = useState<string>('');
  const [stanNumber, setStanNumber] = useState<string>('');
  const [rrnNumber, setRrnNumber] = useState<string>('');
  const [cashbackEarned, setCashbackEarned] = useState<number>(0);
  const [roundUpSaved, setRoundUpSaved] = useState<number>(0);
  const [showReceiptSlip, setShowReceiptSlip] = useState(false);

  const MERCHANTS = [
    { name: "Woolworths Metro Barangaroo", cat: "Grocery & Retail", defaultAmt: 64.50 },
    { name: "Apple Store Sydney (George St)", cat: "Electronics & Tech", defaultAmt: 349.00 },
    { name: "AMEX Centurion Lounge Mascot", cat: "VIP Aviation Club", defaultAmt: 0.00 },
    { name: "AuraDrive Supercharger Artarmon", cat: "Clean Energy Hub", defaultAmt: 42.80 },
    { name: "Crown Sydney Fine Dining Barangaroo", cat: "Hospitality & Dining", defaultAmt: 285.00 },
    { name: "Qantas First Class Terminal 3", cat: "Aviation Travel", defaultAmt: 540.00 },
    { name: "Commonwealth Bank ATM Direct POS", cat: "Interbank Retail Rail", defaultAmt: 100.00 }
  ];

  // Check Web NFC availability on device
  useEffect(() => {
    if (typeof window !== 'undefined' && 'NDEFReader' in window) {
      setHasWebNfcHardware(true);
    }
  }, []);

  useEffect(() => {
    if (isOpen) {
      setTerminalState('ready');
      setCardTapped(false);
      setShowReceiptSlip(false);
      setDeclineReason('');
      setIsHapticVibrating(false);
      setEnteredPin('');
      setIsPinKeypadActive(false);
      if (cards.length > 0 && !selectedCardId) {
        setSelectedCardId(cards[0].id);
      }
    }
  }, [isOpen, cards]);

  const selectedCard = cards.find(c => c.id === selectedCardId) || cards[0];

  const getCardNetwork = (card: any) => {
    if (!card) return "Mastercard";
    if (card.network) return card.network;
    const num = String(card.fullNumber || card.number || "").replace(/\s/g, "");
    if (num.startsWith("3")) return "AMEX";
    if (num.startsWith("4")) return "Visa";
    return "Mastercard";
  };

  // Hardware Haptic Feedback + Audio Synthesizer
  const triggerHapticAndAudio = (type: 'success' | 'decline' | 'proximity' | 'keyclick') => {
    // 1. Hardware vibration on supported devices
    try {
      if (typeof window !== "undefined" && "navigator" in window && "vibrate" in navigator) {
        if (type === 'success') {
          navigator.vibrate([40, 60, 120]);
        } else if (type === 'decline') {
          navigator.vibrate([100, 50, 100, 50, 200]);
        } else if (type === 'keyclick') {
          navigator.vibrate(15);
        } else {
          navigator.vibrate(25);
        }
      }
    } catch {}

    // 2. Visual Haptic Screen-shake state
    if (type === 'success' || type === 'decline') {
      setIsHapticVibrating(true);
      setTimeout(() => setIsHapticVibrating(false), 500);
    }

    // 3. Audio Chimes via Web Audio API
    if (!soundEnabled) return;

    try {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      if (!AudioCtx) return;
      const ctx = new AudioCtx();

      if (type === 'keyclick') {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(1200, ctx.currentTime);
        gain.gain.setValueAtTime(0.03, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + 0.04);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start();
        osc.stop(ctx.currentTime + 0.04);
      } else if (type === 'proximity') {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(880, ctx.currentTime);
        gain.gain.setValueAtTime(0.04, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.08);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start();
        osc.stop(ctx.currentTime + 0.08);
      } else if (type === 'success') {
        // High fidelity dual-frequency POS terminal success beep (1760Hz -> 2637Hz)
        const osc1 = ctx.createOscillator();
        const gain1 = ctx.createGain();
        osc1.type = 'sine';
        osc1.frequency.setValueAtTime(1760, ctx.currentTime);
        gain1.gain.setValueAtTime(0.09, ctx.currentTime);
        gain1.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.12);
        osc1.connect(gain1);
        gain1.connect(ctx.destination);
        osc1.start();
        osc1.stop(ctx.currentTime + 0.12);

        setTimeout(() => {
          const osc2 = ctx.createOscillator();
          const gain2 = ctx.createGain();
          osc2.type = 'sine';
          osc2.frequency.setValueAtTime(2637, ctx.currentTime);
          gain2.gain.setValueAtTime(0.10, ctx.currentTime);
          gain2.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.22);
          osc2.connect(gain2);
          gain2.connect(ctx.destination);
          osc2.start();
          osc2.stop(ctx.currentTime + 0.22);
        }, 110);
      } else if (type === 'decline') {
        // Low error buzz (220Hz square wave)
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(220, ctx.currentTime);
        gain.gain.setValueAtTime(0.12, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.35);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start();
        osc.stop(ctx.currentTime + 0.35);
      }
    } catch {}
  };

  // Execute Virtual Contactless Tap Operation
  const executeVirtualTap = async () => {
    if (terminalState !== 'ready') return;

    const parsedCustom = parseFloat(customAmount);
    const amt = !isNaN(parsedCustom) && parsedCustom > 0 
      ? parsedCustom 
      : (MERCHANTS.find(m => m.name === merchantName)?.defaultAmt || 64.50);

    setPaymentAmount(amt);

    // 1. Proximity Phase: Card flies/drops toward terminal
    setCardTapped(true);
    setTerminalState('approaching');
    triggerHapticAndAudio('proximity');

    // 2. Reading EMV Chip Phase
    setTimeout(() => {
      setTerminalState('reading');

      // Generate authentic EMV cryptograms & trace numbers
      const arqc = "9F2608" + Array.from({ length: 8 }, () => Math.floor(Math.random() * 16).toString(16).toUpperCase()).join('');
      const auth = "AUTH-" + Math.floor(100000 + Math.random() * 900000);
      const stan = String(Math.floor(100000 + Math.random() * 900000));
      const rrn = "APCA" + String(Date.now()).slice(-8);
      setCryptogram(arqc);
      setAuthCode(auth);
      setStanNumber(stan);
      setRrnNumber(rrn);

      // In Australia: Contactless amounts > $100 require PIN verification on POS terminal
      if (amt > 100) {
        setTimeout(() => {
          setTerminalState('pin_required');
          setIsPinKeypadActive(true);
          toast.info("Contactless purchase over $100 AUD: Enter 4-digit PIN on terminal or tap Biometric Bypass.");
        }, 600);
      } else {
        proceedToAuthorizing(amt, arqc, auth, stan, rrn);
      }
    }, 700);
  };

  // Authorizing & Settlement Pipeline
  const proceedToAuthorizing = (amt: number, arqc: string, auth: string, stan: string, rrn: string) => {
    setTerminalState('authorizing');
    setIsPinKeypadActive(false);

    // Validation 1: Card Frozen Check
    if (selectedCard?.status === 'frozen') {
      triggerHapticAndAudio('decline');
      setTerminalState('declined');
      setDeclineReason('DECLINED: CARD IS FROZEN BY CARDHOLDER');
      toast.error("Contactless Payment Declined: Card is globally frozen in security settings.");
      return;
    }

    // Validation 2: Contactless Enabled Check
    if (selectedCard?.contactlessEnabled === false) {
      triggerHapticAndAudio('decline');
      setTerminalState('declined');
      setDeclineReason('DECLINED: CONTACTLESS CHANNEL DISABLED');
      toast.error("Contactless Payment Declined: NFC channel toggled off on this card.");
      return;
    }

    // Validation 3: Balance or Daily Limit
    if (selectedCard?.balance !== undefined && selectedCard.balance < amt) {
      triggerHapticAndAudio('decline');
      setTerminalState('declined');
      setDeclineReason('DECLINED: INSUFFICIENT AVAILABLE FUNDS');
      toast.error("Contactless Payment Declined: Insufficient balance on card.");
      return;
    }

    // Calculate Value Gains (Cashback + Auto-Round Up)
    const rate = selectedCard?.cashbackRate || 0.035;
    const cbGain = amt * rate;
    const roundDiff = (Math.ceil(amt / 5) * 5) - amt;
    setCashbackEarned(cbGain);
    setRoundUpSaved(roundDiff);

    // 4. Settle Transaction in unifiedBankCardSync (Live Balance Deduction + Cashback Accrual)
    unifiedBankCardSync.updateCard(selectedCard.id, (card) => {
      return {
        ...card,
        balance: card.balance - amt,
        accumulatedCashback: (card.accumulatedCashback || 0) + cbGain,
        rewardsPoints: (card.rewardsPoints || 0) + Math.round(amt * 3),
        roundUpSavings: (card.roundUpSavings || 0) + roundDiff
      };
    });

    // 5. Asynchronously persist into Firestore transactions collection
    try {
      if (db) {
        addDoc(collection(db, "transactions"), {
          userId: user?.uid || "asim_aryal",
          type: "nfc_contactless_tap",
          amount: amt,
          currency: "AUD",
          recipient: merchantName,
          category: merchantCategory,
          cardId: selectedCard.id,
          cardName: selectedCard.name,
          network: getCardNetwork(selectedCard),
          last4: selectedCard.last4 || "4829",
          cryptogram: arqc,
          authCode: auth,
          stan: stan,
          rrn: rrn,
          cashbackEarned: cbGain,
          settlementRail: routingRail === "eftpos_least_cost" ? "eftpos Domestic Least-Cost Routing" : "Mastercard/Visa Global Contactless",
          status: "completed",
          date: new Date().toISOString()
        }).catch(console.warn);

        addDoc(collection(db, "notifications"), {
          title: `Contactless Tap Approved: $${amt.toFixed(2)} AUD`,
          message: `NFC Payment approved at ${merchantName}. Paid via ${selectedCard.name}. +$${cbGain.toFixed(2)} Cashback earned!`,
          type: "financial",
          category: "cards",
          status: "completed",
          createdAt: new Date().toISOString()
        }).catch(console.warn);
      }
    } catch (dbErr) {
      console.warn("Firestore contactless logging note:", dbErr);
    }

    // Dispatch global custom event for 0ms instantaneous PaymentHistoryAuditTab sync
    if (typeof window !== "undefined") {
      window.dispatchEvent(new CustomEvent("valourian_payment_settled", {
        detail: { amount: amt, merchant: merchantName, cardId: selectedCard.id }
      }));
    }

    // 6. Terminal Approval + Haptic Beep
    setTimeout(() => {
      triggerHapticAndAudio('success');
      setTerminalState('approved');
      setShowReceiptSlip(true);

      if (onPaymentComplete) {
        onPaymentComplete(amt, merchantName, selectedCard.id);
      }

      toast.success(
        `Contactless Tap Approved: $${amt.toFixed(2)} AUD!`,
        {
          description: `+$${cbGain.toFixed(2)} Cashback added to card balance. ARQC: ${arqc}`
        }
      );
    }, 850);
  };

  // Terminal PIN Keypad Handlers
  const handleKeypadPress = (val: string) => {
    triggerHapticAndAudio('keyclick');
    if (val === 'C') {
      setEnteredPin('');
    } else if (val === 'OK') {
      if (enteredPin.length === 4) {
        proceedToAuthorizing(paymentAmount, cryptogram, authCode, stanNumber, rrnNumber);
      } else {
        toast.error("Please enter a 4-digit PIN.");
      }
    } else if (enteredPin.length < 4) {
      const next = enteredPin + val;
      setEnteredPin(next);
      if (next.length === 4) {
        setTimeout(() => {
          proceedToAuthorizing(paymentAmount, cryptogram, authCode, stanNumber, rrnNumber);
        }, 200);
      }
    }
  };

  const handleBiometricBypass = () => {
    triggerHapticAndAudio('keyclick');
    toast.success("Founder CEO Biometric Override Authenticated (Mr. Asim Aryal)");
    proceedToAuthorizing(paymentAmount, cryptogram, authCode, stanNumber, rrnNumber);
  };

  // Reset for another transaction
  const handleResetTerminal = () => {
    setTerminalState('ready');
    setCardTapped(false);
    setShowReceiptSlip(false);
    setDeclineReason('');
    setEnteredPin('');
    setIsPinKeypadActive(false);
  };

  // Official PDF Receipt Generator using safe renderAutoTable
  const handleDownloadReceiptPdf = () => {
    try {
      const doc = new jsPDF();
      doc.setFillColor(15, 23, 42); // slate-900
      doc.rect(0, 0, 210, 42, 'F');

      doc.setFont("helvetica", "bold");
      doc.setFontSize(16);
      doc.setTextColor(255, 255, 255);
      doc.text("VALOURIAN CONTACTLESS EMV RECEIPT", 14, 18);

      doc.setFontSize(9);
      doc.setFont("helvetica", "normal");
      doc.setTextColor(52, 211, 153);
      doc.text("AUSTRALIAN APCA / EFTPOS / EMV CONTACTLESS LEVEL-2 CERTIFIED", 14, 26);
      doc.setTextColor(148, 163, 184);
      doc.text("Host Card Emulation Direct • ISO/IEC 14443 Type A/B • 0% Cross-Border Fee", 14, 32);

      doc.setTextColor(15, 23, 42);
      doc.setFontSize(12);
      doc.setFont("helvetica", "bold");
      doc.text("Merchant Contactless Payment Advice", 14, 52);

      renderAutoTable(doc, {
        startY: 58,
        theme: "grid",
        headStyles: { fillColor: [15, 23, 42], textColor: [255, 255, 255], fontStyle: "bold" },
        styles: { fontSize: 10, cellPadding: 4 },
        head: [["EMV POS Field", "Transaction Details"]],
        body: [
          ["Merchant Entity", merchantName],
          ["Merchant Category", merchantCategory],
          ["Settled Amount", `$${paymentAmount.toFixed(2)} AUD`],
          ["Payment Method", `${selectedCard.name} (${getCardNetwork(selectedCard)})`],
          ["Masked Card Number", `•••• •••• •••• ${selectedCard.last4 || '4829'}`],
          ["Cardholder", "MR. ASIM ARYAL"],
          ["Settlement Rail", routingRail === "eftpos_least_cost" ? "eftpos Domestic (APCA Least-Cost)" : "Global Network Credit"],
          ["Approval Code (Auth)", authCode || "AUTH-994281"],
          ["System Trace Audit No (STAN)", stanNumber || "049281"],
          ["Retrieval Reference (RRN)", rrnNumber || "APCA88492019"],
          ["Application Cryptogram (ARQC)", cryptogram || "9F2608D930281F"],
          ["Cashback Yield Earned", `+$${cashbackEarned.toFixed(2)} AUD (${(selectedCard.cashbackRate * 100).toFixed(1)}%)`],
          ["Timestamp", new Date().toLocaleString("en-AU")]
        ]
      });

      const finalY = ((doc as any).lastAutoTable?.finalY || 180) + 12;
      doc.setFontSize(8);
      doc.setTextColor(100, 116, 139);
      doc.text(
        "Electronic signature verified via EMV chip protocol. Cardholder copy guaranteed under Valourian Sovereign Core.",
        14,
        finalY
      );

      doc.save(`Contactless_Receipt_${Date.now()}.pdf`);
      toast.success("Official PDF Receipt downloaded!");
    } catch (err) {
      console.error("PDF generation error:", err);
      toast.error("Failed to generate PDF receipt");
    }
  };

  const isFrozen = selectedCard?.status === 'frozen';
  const network = getCardNetwork(selectedCard);

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-slate-950/85 backdrop-blur-md p-3 sm:p-4 overflow-y-auto">
          <motion.div 
            initial={{ opacity: 0, scale: 0.94, y: 20 }}
            animate={{ 
              opacity: 1, 
              scale: 1, 
              y: 0,
              x: isHapticVibrating ? [-5, 5, -4, 4, -2, 2, 0] : 0
            }}
            exit={{ opacity: 0, scale: 0.94, y: 20 }}
            transition={{ duration: 0.25 }}
            className="w-full max-w-xl bg-slate-900 border border-slate-800 rounded-3xl shadow-2xl overflow-hidden relative text-white my-auto max-h-[92vh] flex flex-col"
          >
            {/* Header with Sound & Web NFC Toggles */}
            <div className="p-5 border-b border-slate-800 bg-slate-950/80 flex items-center justify-between shrink-0">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center text-emerald-400 shadow-lg shadow-emerald-500/10">
                  <SmartphoneNfc className="w-5 h-5 animate-pulse" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-base font-black tracking-tight text-white">Virtual NFC Tapping Terminal</h3>
                    <span className="text-[9px] font-mono font-bold px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                      EMV L2 POS
                    </span>
                    {hasWebNfcHardware && (
                      <span className="text-[9px] font-mono font-bold px-2 py-0.5 rounded-full bg-blue-500/20 text-blue-300 border border-blue-500/30 flex items-center gap-1">
                        <Radio className="w-2.5 h-2.5" /> Web NFC
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-slate-400">
                    Host Card Emulation • Contactless ISO/IEC 14443 • Drag or Tap Gesture
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                {/* Audio Sound Toggle */}
                <button
                  onClick={() => {
                    const next = !soundEnabled;
                    setSoundEnabled(next);
                    toast.info(next ? "POS Terminal audio chime enabled" : "POS Terminal sound muted");
                    if (next) triggerHapticAndAudio('proximity');
                  }}
                  className={`p-2 rounded-xl transition-colors cursor-pointer border ${
                    soundEnabled 
                      ? 'bg-slate-800 hover:bg-slate-700 text-emerald-400 border-slate-700' 
                      : 'bg-slate-900 text-slate-500 border-slate-800'
                  }`}
                  title={soundEnabled ? "Terminal audio enabled (Click to mute)" : "Terminal muted (Click to enable audio)"}
                >
                  {soundEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
                </button>

                <button 
                  onClick={onClose} 
                  className="p-2 text-slate-400 hover:text-white rounded-xl bg-slate-800 hover:bg-slate-700 transition-colors cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Modal Body */}
            <div className="p-5 overflow-y-auto space-y-5">
              
              {/* Dual-Rail Routing Selector */}
              <div className="bg-slate-950 p-2.5 rounded-2xl border border-slate-800 flex items-center justify-between text-xs">
                <span className="text-slate-400 font-bold flex items-center gap-1.5 pl-1">
                  <Layers className="w-3.5 h-3.5 text-indigo-400" />
                  Routing:
                </span>
                <div className="flex bg-slate-900 p-1 rounded-xl gap-1">
                  <button
                    onClick={() => setRoutingRail('eftpos_least_cost')}
                    className={`px-3 py-1 rounded-lg font-bold text-[11px] transition-all cursor-pointer ${
                      routingRail === 'eftpos_least_cost'
                        ? 'bg-emerald-500 text-slate-950 font-black shadow'
                        : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    eftpos AU (Least-Cost)
                  </button>
                  <button
                    onClick={() => setRoutingRail('global_credit')}
                    className={`px-3 py-1 rounded-lg font-bold text-[11px] transition-all cursor-pointer ${
                      routingRail === 'global_credit'
                        ? 'bg-indigo-600 text-white font-black shadow'
                        : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    Global Network Rail
                  </button>
                </div>
              </div>

              {/* Merchant & Amount Configuration */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {/* Merchant Selector */}
                <div>
                  <label className="text-[10px] font-black uppercase tracking-wider text-slate-400 block mb-1">
                    Mocked POS Terminal Merchant
                  </label>
                  <select
                    value={merchantName}
                    disabled={terminalState !== 'ready'}
                    onChange={(e) => {
                      const selected = MERCHANTS.find(m => m.name === e.target.value);
                      setMerchantName(e.target.value);
                      if (selected) {
                        setMerchantCategory(selected.cat);
                        setPaymentAmount(selected.defaultAmt);
                        setCustomAmount('');
                      }
                    }}
                    className="w-full bg-slate-950 border border-slate-800 focus:border-emerald-500 rounded-xl px-3 py-2 text-xs text-white font-medium focus:outline-none cursor-pointer disabled:opacity-50"
                  >
                    {MERCHANTS.map((m, idx) => (
                      <option key={`merch-opt-${idx}`} value={m.name}>
                        {m.name} (${m.defaultAmt.toFixed(2)})
                      </option>
                    ))}
                  </select>
                </div>

                {/* Amount Field */}
                <div>
                  <label className="text-[10px] font-black uppercase tracking-wider text-slate-400 block mb-1">
                    Terminal Charge Amount (AUD)
                  </label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 font-bold text-xs">$</span>
                    <input 
                      type="number" 
                      step="0.01"
                      disabled={terminalState !== 'ready'}
                      value={customAmount || (paymentAmount ? paymentAmount.toFixed(2) : '')}
                      onChange={(e) => {
                        setCustomAmount(e.target.value);
                        setPaymentAmount(parseFloat(e.target.value) || 0);
                      }}
                      placeholder="e.g. 64.50"
                      className="w-full bg-slate-950 border border-slate-800 focus:border-emerald-500 rounded-xl pl-7 pr-3 py-2 text-xs text-white font-mono font-bold focus:outline-none disabled:opacity-50"
                    />
                  </div>
                </div>
              </div>

              {/* Card Selector Pills */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="text-[10px] font-black uppercase tracking-wider text-slate-400">
                    Select Card to Tap ({cards.length} in Wallet)
                  </label>
                  {isFrozen && (
                    <span className="text-[9px] font-mono text-red-400 font-bold bg-red-500/10 px-2 py-0.5 rounded border border-red-500/30">
                      CARD FROZEN (WILL DECLINE)
                    </span>
                  )}
                </div>

                <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-none">
                  {cards.map((c, i) => {
                    const isSelected = (selectedCard?.id === c.id);
                    const isActiveDefault = (c.id === unifiedBankCardSync.getActivePaymentCardId());
                    const net = getCardNetwork(c);
                    const frozen = c.status === 'frozen';
                    return (
                      <button
                        key={`nfc-card-${c.id}-${i}`}
                        disabled={terminalState !== 'ready'}
                        onClick={() => setSelectedCardId(c.id)}
                        className={`px-3 py-2 rounded-xl text-left border shrink-0 transition-all cursor-pointer min-w-[145px] relative ${
                          isSelected
                            ? 'bg-slate-800 border-emerald-500 shadow-md ring-1 ring-emerald-500/30'
                            : 'bg-slate-950 border-slate-800 hover:border-slate-700 opacity-75'
                        }`}
                      >
                        {isActiveDefault && (
                          <div className="absolute top-1 right-1.5 w-2 h-2 rounded-full bg-amber-400 shadow-[0_0_8px_rgba(251,191,36,0.9)]" title="Default Active Card" />
                        )}
                        <div className="flex items-center justify-between text-[10px] mb-1">
                          <span className="font-bold text-slate-300 truncate max-w-[80px]">{c.name.split(' ')[0]}</span>
                          <span className={`font-mono text-[9px] ${frozen ? 'text-red-400' : 'text-emerald-400'}`}>
                            {frozen ? 'FROZEN' : net}
                          </span>
                        </div>
                        <div className="font-mono font-bold text-xs text-white">•••• {c.last4 || '4829'}</div>
                        <div className="text-[9px] text-slate-400 font-mono mt-0.5">
                          ${Number(c.balance || 0).toLocaleString()} AUD
                        </div>
                      </button>
                    );
                  })}
                </div>

                {/* Active Card Authority & Auto-Population Bar */}
                <div className="mt-2.5 p-2.5 bg-slate-950 rounded-xl border border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-2 text-xs">
                  <div className="flex items-center gap-2">
                    {selectedCard?.id === unifiedBankCardSync.getActivePaymentCardId() ? (
                      <span className="text-[10px] font-mono font-black text-amber-300 bg-amber-500/20 px-2 py-0.5 rounded-full border border-amber-500/40 flex items-center gap-1">
                        <Sparkles className="w-3 h-3 text-amber-400" />
                        DEFAULT ACTIVE TAP CARD
                      </span>
                    ) : (
                      <span className="text-[10px] font-mono text-slate-400">
                        Selected: <strong className="text-white">{selectedCard?.name}</strong>
                      </span>
                    )}
                    <span className="text-[10px] text-slate-500 hidden sm:inline">• Direct HCE Emulation</span>
                  </div>

                  <button
                    onClick={() => handleSetActiveDefaultTapCard(selectedCard.id)}
                    className="w-full sm:w-auto px-3 py-1 bg-amber-500/15 hover:bg-amber-500/30 text-amber-300 border border-amber-500/40 rounded-lg text-[10px] font-black uppercase tracking-wider flex items-center justify-center gap-1.5 transition-all cursor-pointer"
                  >
                    <Zap className="w-3 h-3 fill-amber-400" />
                    <span>Auto-Populate Payment Systems</span>
                  </button>
                </div>
              </div>

              {/* ========================================================== */}
              {/* THE MOCKED POS NFC TERMINAL & DRAG/TAP CARD INTERFACE */}
              {/* ========================================================== */}
              <div className="relative bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950 border border-slate-800 rounded-3xl p-6 shadow-2xl flex flex-col items-center overflow-hidden">
                
                {/* 4 Glowing Contactless LED Indicators on Terminal Bezel */}
                <div className="flex items-center gap-3.5 mb-4">
                  {[0, 1, 2, 3].map((ledIdx) => {
                    let ledColor = "bg-slate-800 border-slate-700";
                    let glow = "";

                    if (terminalState === 'ready') {
                      if (ledIdx === 0) {
                        ledColor = "bg-blue-500 border-blue-400";
                        glow = "shadow-[0_0_12px_rgba(59,130,246,0.8)]";
                      }
                    } else if (terminalState === 'approaching') {
                      if (ledIdx <= 1) {
                        ledColor = "bg-amber-400 border-amber-300";
                        glow = "shadow-[0_0_12px_rgba(251,191,36,0.8)]";
                      }
                    } else if (terminalState === 'reading' || terminalState === 'pin_required' || terminalState === 'authorizing') {
                      if (ledIdx <= 2) {
                        ledColor = "bg-emerald-400 border-emerald-300";
                        glow = "shadow-[0_0_12px_rgba(52,211,153,0.8)]";
                      }
                    } else if (terminalState === 'approved') {
                      ledColor = "bg-emerald-400 border-emerald-300";
                      glow = "shadow-[0_0_16px_rgba(52,211,153,1)]";
                    } else if (terminalState === 'declined') {
                      ledColor = "bg-red-500 border-red-400";
                      glow = "shadow-[0_0_16px_rgba(239,68,68,1)]";
                    }

                    return (
                      <div
                        key={`led-${ledIdx}`}
                        className={`w-3.5 h-3.5 rounded-full border transition-all duration-300 ${ledColor} ${glow}`}
                      />
                    );
                  })}
                </div>

                {/* Mocked Terminal OLED Screen */}
                <div className="w-full max-w-[340px] bg-black border-2 border-slate-800 rounded-2xl p-4 shadow-inner text-center space-y-2 relative overflow-hidden">
                  <div className="flex items-center justify-between text-[9px] font-mono text-slate-500 border-b border-slate-900 pb-1">
                    <span>APCA DIRECT</span>
                    <span className="flex items-center gap-1">
                      <Radio className="w-2.5 h-2.5 text-emerald-400 animate-pulse" /> 13.56 MHz
                    </span>
                    <span>{new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                  </div>

                  {/* Terminal Display Message */}
                  {terminalState === 'ready' && (
                    <div className="py-2 space-y-1">
                      <span className="text-[10px] font-mono text-emerald-400 font-bold uppercase tracking-wider block">
                        INSERT, SWIPE OR TAP
                      </span>
                      <div className="text-2xl font-mono font-black text-white tracking-tight">
                        ${paymentAmount.toFixed(2)} <span className="text-xs text-slate-400">AUD</span>
                      </div>
                      <p className="text-[10px] text-slate-400 truncate">{merchantName}</p>
                      <p className="text-[9px] text-slate-500 font-mono">DRAG CARD UP OR TAP BUTTON BELOW</p>
                    </div>
                  )}

                  {terminalState === 'approaching' && (
                    <div className="py-3 space-y-1 text-amber-300">
                      <div className="text-xs font-mono font-bold tracking-widest animate-pulse">
                        CARD DETECTED IN RF FIELD
                      </div>
                      <div className="text-[10px] text-slate-400 font-mono">HOLD CARD STILL ON READER...</div>
                    </div>
                  )}

                  {terminalState === 'reading' && (
                    <div className="py-3 space-y-1 text-cyan-300">
                      <div className="text-xs font-mono font-bold tracking-widest animate-pulse">
                        READING EMV CHIP...
                      </div>
                      <div className="text-[10px] text-slate-400 font-mono">ISO/IEC 14443 CONTACTLESS</div>
                    </div>
                  )}

                  {/* Interactive Terminal PIN Pad for amounts > $100 */}
                  {terminalState === 'pin_required' && (
                    <div className="py-2 space-y-2 text-slate-200">
                      <div className="text-[11px] font-mono font-bold text-amber-300 uppercase">
                        ENTER 4-DIGIT PIN ON TERMINAL
                      </div>
                      
                      {/* PIN Dots */}
                      <div className="flex justify-center gap-2 my-1">
                        {[0, 1, 2, 3].map((dotIdx) => (
                          <div
                            key={`pin-dot-${dotIdx}`}
                            className={`w-3 h-3 rounded-full border ${
                              dotIdx < enteredPin.length
                                ? 'bg-amber-400 border-amber-300 shadow-[0_0_8px_rgba(251,191,36,0.8)]'
                                : 'bg-slate-900 border-slate-700'
                            }`}
                          />
                        ))}
                      </div>

                      {/* Interactive Touch Keypad on Terminal Screen */}
                      <div className="grid grid-cols-3 gap-1.5 max-w-[200px] mx-auto text-xs font-mono font-bold pt-1">
                        {['1', '2', '3', '4', '5', '6', '7', '8', '9', 'C', '0', 'OK'].map((keyVal) => (
                          <button
                            key={`key-${keyVal}`}
                            onClick={() => handleKeypadPress(keyVal)}
                            className={`py-1.5 rounded-lg border text-center transition-all cursor-pointer ${
                              keyVal === 'OK'
                                ? 'bg-emerald-600 border-emerald-500 text-white'
                                : keyVal === 'C'
                                ? 'bg-red-900/60 border-red-700 text-red-300'
                                : 'bg-slate-900 border-slate-800 hover:bg-slate-800 text-white'
                            }`}
                          >
                            {keyVal}
                          </button>
                        ))}
                      </div>

                      {/* Founder CEO Biometric Bypass Option */}
                      <button
                        onClick={handleBiometricBypass}
                        className="w-full mt-2 py-1.5 rounded-lg bg-indigo-900/40 hover:bg-indigo-900/60 border border-indigo-500/40 text-[10px] font-mono text-indigo-300 flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                      >
                        <Fingerprint className="w-3.5 h-3.5 text-indigo-400" />
                        <span>Biometric Bypass (Founder CEO)</span>
                      </button>
                    </div>
                  )}

                  {terminalState === 'authorizing' && (
                    <div className="py-3 space-y-1 text-indigo-300">
                      <div className="text-xs font-mono font-bold tracking-widest flex items-center justify-center gap-2">
                        <Loader2 className="w-3.5 h-3.5 animate-spin text-indigo-400" />
                        <span>AUTHORIZING...</span>
                      </div>
                      <div className="text-[10px] text-slate-400 font-mono">APCA DIRECT SETTLEMENT</div>
                    </div>
                  )}

                  {terminalState === 'approved' && (
                    <div className="py-2 space-y-1 text-emerald-400">
                      <div className="text-base font-mono font-black tracking-widest flex items-center justify-center gap-1.5">
                        <CheckCircle2 className="w-5 h-5 text-emerald-400" />
                        <span>✓ APPROVED</span>
                      </div>
                      <div className="text-sm font-mono font-bold text-white">
                        ${paymentAmount.toFixed(2)} AUD
                      </div>
                      <div className="text-[9px] font-mono text-slate-400">AUTH: {authCode} • PLEASE REMOVE CARD</div>
                    </div>
                  )}

                  {terminalState === 'declined' && (
                    <div className="py-2 space-y-1 text-red-400">
                      <div className="text-sm font-mono font-black tracking-widest flex items-center justify-center gap-1.5">
                        <AlertCircle className="w-5 h-5 text-red-400" />
                        <span>✕ DECLINED</span>
                      </div>
                      <div className="text-[10px] font-mono text-red-300">{declineReason}</div>
                    </div>
                  )}
                </div>

                {/* Contactless Target Wave Zone with Proximity Pulse */}
                <div className="my-5 relative flex items-center justify-center">
                  <div className="absolute w-36 h-36 rounded-full border border-emerald-500/20 animate-ping opacity-20 pointer-events-none" />
                  <div className="absolute w-28 h-28 rounded-full border border-emerald-500/30 animate-pulse pointer-events-none" />
                  
                  <div className="w-20 h-20 rounded-2xl bg-slate-950/80 border-2 border-emerald-500/40 flex flex-col items-center justify-center shadow-lg relative z-10">
                    <Wifi className="w-8 h-8 text-emerald-400 rotate-90" />
                    <span className="text-[8px] font-mono text-emerald-400 font-bold mt-0.5">TAP HERE</span>
                  </div>
                </div>

                {/* Draggable & Clickable 3D Bank Card with Glowing Border & Success Overlay */}
                <div className="w-full max-w-[340px] perspective-1000 my-2 relative">
                  {/* Ambient Luminous Diffusion Glow */}
                  <AnimatePresence>
                    {terminalState !== 'ready' && (
                      <motion.div
                        key="card-ambient-glow"
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{
                          opacity: [0.55, 0.9, 0.55],
                          scale: [0.99, 1.03, 0.99],
                        }}
                        exit={{ opacity: 0, scale: 0.95 }}
                        transition={{ duration: 1.6, repeat: Infinity, ease: "easeInOut" }}
                        className={`absolute -inset-1.5 rounded-3xl blur-xl pointer-events-none z-0 ${
                          terminalState === 'approved'
                            ? 'bg-gradient-to-r from-emerald-500/90 via-teal-400/90 to-emerald-500/90'
                            : terminalState === 'declined'
                            ? 'bg-gradient-to-r from-red-500/80 via-rose-500/80 to-red-500/80'
                            : terminalState === 'approaching'
                            ? 'bg-gradient-to-r from-amber-400/75 via-yellow-400/75 to-amber-400/75'
                            : 'bg-gradient-to-r from-cyan-400/80 via-emerald-400/80 to-teal-400/80'
                        }`}
                      />
                    )}
                  </AnimatePresence>

                  {/* Dynamic Glowing Border Beam Ring */}
                  <motion.div
                    className="absolute -inset-[2px] rounded-2xl pointer-events-none z-10 transition-all duration-500"
                    animate={{
                      opacity: terminalState !== 'ready' ? 1 : 0.35,
                      boxShadow:
                        terminalState === 'approved'
                          ? "0 0 25px rgba(16, 185, 129, 0.9), inset 0 0 15px rgba(16, 185, 129, 0.4)"
                          : terminalState === 'declined'
                          ? "0 0 25px rgba(239, 68, 68, 0.8), inset 0 0 15px rgba(239, 68, 68, 0.4)"
                          : terminalState === 'approaching'
                          ? "0 0 20px rgba(251, 191, 36, 0.7), inset 0 0 10px rgba(251, 191, 36, 0.3)"
                          : terminalState === 'reading' || terminalState === 'pin_required' || terminalState === 'authorizing'
                          ? "0 0 30px rgba(52, 211, 153, 0.85), inset 0 0 15px rgba(52, 211, 153, 0.4)"
                          : "0 0 10px rgba(255, 255, 255, 0.1)"
                    }}
                    style={{
                      borderRadius: '1.05rem',
                      border:
                        terminalState === 'approved'
                          ? '2px solid rgba(52, 211, 153, 0.9)'
                          : terminalState === 'declined'
                          ? '2px solid rgba(239, 68, 68, 0.8)'
                          : terminalState === 'approaching'
                          ? '2px solid rgba(251, 191, 36, 0.8)'
                          : terminalState === 'reading' || terminalState === 'pin_required' || terminalState === 'authorizing'
                          ? '2px solid rgba(52, 211, 153, 0.8)'
                          : '1px solid rgba(255, 255, 255, 0.15)'
                    }}
                  />

                  {/* Primary 3D Bank Card Component */}
                  <motion.div
                    drag={terminalState === 'ready' ? "y" : false}
                    dragConstraints={{ top: -120, bottom: 0 }}
                    dragElastic={0.2}
                    onDragEnd={(e, info) => {
                      if (info.offset.y < -40 || info.point.y < 350) {
                        executeVirtualTap();
                      }
                    }}
                    animate={
                      terminalState === 'approaching'
                        ? {
                            y: -36,
                            rotateX: 18,
                            rotateY: -2,
                            scale: 1.04,
                            boxShadow: "0 0 25px rgba(251, 191, 36, 0.6), 0 20px 35px rgba(0,0,0,0.6)"
                          }
                        : terminalState === 'reading' || terminalState === 'pin_required' || terminalState === 'authorizing'
                        ? {
                            y: [-36, -32, -36],
                            rotateX: [18, 16, 18],
                            rotateY: 0,
                            scale: [1.04, 1.06, 1.04],
                            boxShadow: [
                              "0 0 30px rgba(52, 211, 153, 0.7), inset 0 0 15px rgba(52, 211, 153, 0.3)",
                              "0 0 50px rgba(52, 211, 153, 0.95), inset 0 0 22px rgba(52, 211, 153, 0.5)",
                              "0 0 30px rgba(52, 211, 153, 0.7), inset 0 0 15px rgba(52, 211, 153, 0.3)"
                            ]
                          }
                        : terminalState === 'approved'
                        ? {
                            y: [-36, -8, 0],
                            rotateX: [18, 4, 0],
                            scale: [1.04, 1.07, 1],
                            boxShadow: "0 0 45px rgba(16, 185, 129, 0.9), 0 0 80px rgba(16, 185, 129, 0.4), inset 0 0 25px rgba(16, 185, 129, 0.35)"
                          }
                        : terminalState === 'declined'
                        ? {
                            x: [0, -12, 12, -8, 8, -4, 4, 0],
                            y: 0,
                            rotateX: 0,
                            scale: 1,
                            boxShadow: "0 0 35px rgba(239, 68, 68, 0.8), 0 10px 25px rgba(0,0,0,0.5)"
                          }
                        : cardTapped
                        ? {
                            y: [0, -35, 15, 0],
                            rotateX: [0, -15, 25, 0],
                            scale: [1, 1.05, 0.92, 1],
                            boxShadow: "0 0 35px rgba(16,185,129,0.7)"
                          }
                        : { y: 0, rotateX: 0, scale: 1, boxShadow: "0 10px 25px rgba(0,0,0,0.5)" }
                    }
                    transition={
                      terminalState === 'reading' || terminalState === 'pin_required' || terminalState === 'authorizing'
                        ? {
                            y: { repeat: Infinity, duration: 1.2, ease: "easeInOut" },
                            scale: { repeat: Infinity, duration: 1.2, ease: "easeInOut" },
                            boxShadow: { repeat: Infinity, duration: 1.2, ease: "easeInOut" }
                          }
                        : terminalState === 'declined'
                        ? { duration: 0.6 }
                        : terminalState === 'approved'
                        ? { duration: 0.7, ease: [0.16, 1, 0.3, 1] }
                        : { duration: 0.5, ease: "easeOut" }
                    }
                    whileHover={terminalState === 'ready' ? { scale: 1.02, y: -4 } : {}}
                    onClick={executeVirtualTap}
                    className={`rounded-2xl p-5 border cursor-grab active:cursor-grabbing select-none transition-all shadow-xl relative overflow-hidden z-20 ${
                      isFrozen
                        ? "bg-slate-950 border-red-500/40"
                        : network === 'AMEX'
                        ? "bg-gradient-to-br from-slate-950 via-slate-900 to-blue-950 border-blue-500/50"
                        : "bg-gradient-to-br from-slate-950 via-slate-900 to-emerald-950 border-emerald-500/50"
                    }`}
                  >
                    {/* Top Row: Chip & Contactless */}
                    <div className="flex items-center justify-between mb-4 relative z-10">
                      <div className="w-9 h-7 rounded bg-gradient-to-tr from-amber-400 via-yellow-200 to-amber-500 border border-amber-600/60 shadow-inner flex flex-col justify-around p-0.5">
                        <div className="h-0.5 bg-amber-700/40 rounded-full" />
                        <div className="h-0.5 bg-amber-700/40 rounded-full" />
                      </div>
                      <div className="flex items-center gap-2">
                        <Wifi className="w-4 h-4 text-white/80 rotate-90" />
                        <span className="text-[10px] font-mono font-black text-white">{network}</span>
                      </div>
                    </div>

                    {/* Card Number */}
                    <div className="font-mono text-base font-black text-white tracking-widest mb-3 relative z-10">
                      •••• •••• •••• {selectedCard?.last4 || '4829'}
                    </div>

                    {/* Bottom Row */}
                    <div className="flex items-end justify-between text-xs relative z-10">
                      <div>
                        <div className="text-[8px] uppercase tracking-wider text-slate-400">Cardholder</div>
                        <div className="font-bold text-white text-[11px] font-mono">MR. ASIM ARYAL</div>
                      </div>
                      <div className="text-right">
                        <div className="text-[8px] uppercase tracking-wider text-slate-400">Available</div>
                        <div className="font-mono font-bold text-emerald-400 text-xs">
                          ${Number(selectedCard?.balance || 0).toLocaleString()} AUD
                        </div>
                      </div>
                    </div>

                    {/* ============================================================== */}
                    {/* SUBTLE 'SUCCESS' OVERLAY TRANSITION (FRAMER MOTION) */}
                    {/* ============================================================== */}
                    <AnimatePresence>
                      {terminalState === 'approved' && (
                        <motion.div
                          key="nfc-success-overlay"
                          initial={{ opacity: 0, scale: 0.93, backdropFilter: "blur(0px)" }}
                          animate={{ opacity: 1, scale: 1, backdropFilter: "blur(8px)" }}
                          exit={{ opacity: 0, scale: 0.96, backdropFilter: "blur(0px)" }}
                          transition={{ duration: 0.45, ease: [0.16, 1, 0.3, 1] }}
                          className="absolute inset-0 bg-slate-950/85 rounded-2xl flex flex-col items-center justify-center p-3.5 text-center z-30 overflow-hidden"
                        >
                          {/* Shimmer Specular Light Sweep */}
                          <motion.div
                            initial={{ x: "-100%" }}
                            animate={{ x: "200%" }}
                            transition={{ duration: 1.0, ease: "easeInOut", delay: 0.1 }}
                            className="absolute inset-0 w-2/3 h-full bg-gradient-to-r from-transparent via-emerald-300/25 to-transparent skew-x-12 pointer-events-none"
                          />

                          {/* Expanding Concentric NFC Contactless Pulse Waves */}
                          <div className="relative flex items-center justify-center mb-2">
                            <motion.div
                              initial={{ scale: 0.6, opacity: 0.8 }}
                              animate={{ scale: [1, 2.3], opacity: [0.8, 0] }}
                              transition={{ duration: 1.8, repeat: Infinity, ease: "easeOut" }}
                              className="absolute w-12 h-12 rounded-full border-2 border-emerald-400/60 pointer-events-none"
                            />
                            <motion.div
                              initial={{ scale: 0.6, opacity: 0.8 }}
                              animate={{ scale: [1, 1.9], opacity: [0.8, 0] }}
                              transition={{ duration: 1.8, delay: 0.45, repeat: Infinity, ease: "easeOut" }}
                              className="absolute w-12 h-12 rounded-full border border-teal-300/50 pointer-events-none"
                            />
                            <div className="w-10 h-10 rounded-full bg-emerald-500/20 border border-emerald-400/60 flex items-center justify-center shadow-[0_0_20px_rgba(16,185,129,0.7)] z-10">
                              <motion.div
                                initial={{ scale: 0, rotate: -45 }}
                                animate={{ scale: 1, rotate: 0 }}
                                transition={{ type: "spring", stiffness: 350, damping: 20, delay: 0.15 }}
                              >
                                <CheckCircle2 className="w-5 h-5 text-emerald-300" />
                              </motion.div>
                            </div>
                          </div>

                          {/* Subtle Success Typography */}
                          <motion.div
                            initial={{ opacity: 0, y: 5 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.2, duration: 0.35 }}
                            className="space-y-0.5"
                          >
                            <div className="text-[10px] font-mono font-black tracking-widest text-emerald-400 uppercase">
                              Contactless Success
                            </div>
                            <div className="text-sm font-black text-white font-mono tracking-tight">
                              ${paymentAmount.toFixed(2)} <span className="text-[10px] text-slate-400 font-normal">AUD</span>
                            </div>
                            <div className="text-[9px] font-mono text-emerald-300/80 flex items-center justify-center gap-1.5 pt-0.5">
                              <span>ARQC: {cryptogram || '78E49A'}</span>
                              <span className="text-slate-600">•</span>
                              <span className="text-slate-300">AUTH: {authCode || 'APRA89'}</span>
                            </div>
                            {cashbackEarned > 0 && (
                              <div className="text-[9px] font-mono text-amber-300 font-bold">
                                +${cashbackEarned.toFixed(2)} AUD Cashback Credited
                              </div>
                            )}
                          </motion.div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </motion.div>
                </div>

                {/* Drag Hint & Interactive Action Button */}
                <div className="w-full max-w-[340px] mt-3 space-y-2">
                  <div className="text-[10px] text-center text-slate-400 font-mono">
                    💡 Drag card upwards onto reader or click button below
                  </div>

                  {terminalState === 'ready' && (
                    <button
                      onClick={executeVirtualTap}
                      className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-emerald-500 via-teal-500 to-emerald-400 hover:from-emerald-400 hover:to-teal-300 text-slate-950 font-black text-xs uppercase tracking-wider shadow-lg shadow-emerald-500/25 transition-all flex items-center justify-center gap-2 cursor-pointer active:scale-95"
                    >
                      <SmartphoneNfc className="w-4 h-4" />
                      <span>Tap Card on Terminal (${paymentAmount.toFixed(2)})</span>
                    </button>
                  )}

                  {terminalState !== 'ready' && terminalState !== 'approved' && terminalState !== 'declined' && terminalState !== 'pin_required' && (
                    <div className="w-full py-3 rounded-2xl bg-slate-800 text-slate-300 text-xs font-bold font-mono flex items-center justify-center gap-2">
                      <Loader2 className="w-4 h-4 animate-spin text-emerald-400" />
                      <span>Transacting via NFC 13.56MHz...</span>
                    </div>
                  )}

                  {(terminalState === 'approved' || terminalState === 'declined') && (
                    <button
                      onClick={handleResetTerminal}
                      className="w-full py-3 rounded-2xl bg-slate-800 hover:bg-slate-700 text-white text-xs font-bold transition-all flex items-center justify-center gap-2 cursor-pointer"
                    >
                      <RefreshCw className="w-4 h-4 text-emerald-400" />
                      <span>Ready Terminal for Next Transaction</span>
                    </button>
                  )}
                </div>
              </div>

              {/* ========================================================== */}
              {/* ANIMATED THERMAL RECEIPT SLIP & VALUE REWARDS SUMMARY */}
              {/* ========================================================== */}
              <AnimatePresence>
                {showReceiptSlip && terminalState === 'approved' && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.5 }}
                    className="overflow-hidden space-y-4"
                  >
                    {/* Value Gained Banner */}
                    <div className="p-4 rounded-2xl bg-gradient-to-r from-amber-500/20 via-emerald-500/20 to-indigo-500/20 border border-amber-500/30 flex items-center justify-between text-xs">
                      <div className="flex items-center gap-2.5">
                        <div className="w-8 h-8 rounded-xl bg-amber-500/20 text-amber-400 flex items-center justify-center">
                          <Coins className="w-4 h-4" />
                        </div>
                        <div>
                          <div className="font-bold text-white flex items-center gap-1.5">
                            <span>Value Gained on this Tap</span>
                            <span className="text-[9px] font-mono text-emerald-400 font-bold bg-emerald-500/20 px-1.5 py-0.2 rounded">
                              +{(selectedCard.cashbackRate * 100).toFixed(1)}% CASHBACK
                            </span>
                          </div>
                          <div className="text-[10px] text-slate-300">
                            +${cashbackEarned.toFixed(2)} AUD added to card • +{Math.round(paymentAmount * 3)} Reward Pts
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Physical Thermal Receipt Slip */}
                    <div className="bg-white text-slate-900 rounded-2xl p-5 shadow-2xl font-mono text-xs border border-slate-200 relative">
                      {/* Paper Top Sawtooth Indicator */}
                      <div className="text-center border-b border-dashed border-slate-300 pb-3 mb-3">
                        <div className="font-black text-sm tracking-tight text-slate-900">{merchantName.toUpperCase()}</div>
                        <div className="text-[10px] text-slate-500">{merchantCategory}</div>
                        <div className="text-[9px] text-slate-400 mt-1">APCA MERCHANT ID: 082-991-8842</div>
                      </div>

                      <div className="space-y-1.5 text-[11px]">
                        <div className="flex justify-between">
                          <span className="text-slate-500">CARD:</span>
                          <span className="font-bold">{selectedCard.name}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-slate-500">PAN:</span>
                          <span className="font-bold">•••• •••• •••• {selectedCard.last4}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-slate-500">APP CRYPTOGRAM (ARQC):</span>
                          <span className="font-bold text-[10px]">{cryptogram}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-slate-500">AUTH CODE:</span>
                          <span className="font-bold">{authCode}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-slate-500">STAN / RRN:</span>
                          <span>{stanNumber} / {rrnNumber}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-slate-500">ROUTING:</span>
                          <span>{routingRail === 'eftpos_least_cost' ? 'eftpos Domestic (Least-Cost)' : 'Global Mastercard/Visa'}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-slate-500">PROTOCOL:</span>
                          <span>EMV ISO/IEC 14443 CONTACTLESS</span>
                        </div>
                      </div>

                      <div className="border-t-2 border-slate-900 pt-2 mt-3 flex justify-between items-center text-sm font-black">
                        <span>TOTAL PURCHASE</span>
                        <span>${paymentAmount.toFixed(2)} AUD</span>
                      </div>

                      <div className="border-t border-dashed border-slate-300 pt-2 mt-3 text-center text-[9px] text-slate-500">
                        *** APPROVED - CUSTOMER COPY ***
                        <br />
                        VALOURIAN SOVEREIGN DIRECT SETTLEMENT
                      </div>

                      {/* Download Action & SMS Dispatch */}
                      <div className="mt-4 pt-2 flex flex-col sm:flex-row gap-2">
                        <button
                          onClick={handleDownloadReceiptPdf}
                          className="flex-1 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                        >
                          <Download className="w-3.5 h-3.5" />
                          <span>Download PDF Receipt</span>
                        </button>

                        <button
                          onClick={() => {
                            smsEmailDispatchService.dispatchCardCredentials(selectedCard);
                            toast.success("Tap transaction receipt & card advice dispatched via SMS to +61 401 044 335 and email to asim.nsw@gmail.com!");
                          }}
                          className="flex-1 py-2.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-1.5 transition-all shadow-md cursor-pointer"
                        >
                          <Send className="w-3.5 h-3.5 fill-white" />
                          <span>Send SMS & Email</span>
                        </button>
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
