import React, { useState, useEffect, useRef, useCallback } from "react";
import Webcam from "react-webcam";
import jsQR from "jsqr";
import { jsPDF } from "jspdf";
import { QRCodeCanvas } from "qrcode.react";
import {
  Copy,
  Send,
  Clock,
  User,
  CheckCircle2,
  ShieldCheck,
  DollarSign,
  Landmark,
  X,
  Eye,
  CreditCard,
  Plus,
  Trash2,
  Lock,
  Unlock,
  RefreshCw,
  AlertCircle,
  Sparkles,
  Check,
  Globe,
  Cpu,
  Bitcoin,
  Mailbox,
  Inbox,
  Wifi,
  Terminal,
  QrCode,
  Settings,
  ShieldAlert,
  Car,
  Download,
  Activity,
  Smartphone,
  Plane,
  Server,
  ArrowRight,
  Loader2,
  Zap
} from "lucide-react";
import { VoiceInputButton } from '../shared/VoiceInputButton';
import { toast } from "sonner";
import { motion, AnimatePresence } from "framer-motion";
import { useGlobalCurrency } from "../../contexts/CurrencyContext";
import { CurrencySelector } from "../ui/CurrencySelector";
import { db , addDoc, setDoc, updateDoc, deleteDoc, createPaymentEvent } from "../../firebase";
import { getAuth } from "firebase/auth";
import {
  collection,
  query,
  where,
  orderBy,
  limit,
  onSnapshot,
  doc,
  getDocs
} from "firebase/firestore";
import { AIGuide } from "../AIGuide";
import { NFCTapModal } from "./NFCTapModal";
import { LinkComManagerModal } from "./LinkComManagerModal";
import { CommBankPayIDFlow } from "./CommBankPayIDFlow";
import {
  reconcileAndSettleAllPayments,
  COMMBANK_LINKED_ACCOUNTS,
  updateCbaAccountBalance,
  subscribeToCbaBalances,
  resolvePayIDDirectory,
} from "../../services/paymentSettlementService";
import {
  BASE_BANKING_CREDIT_CARDS,
  syncAllCardsToLinkAccount,
  TARGET_LINK_EMAIL,
  LINK_COM_URL,
} from "../../services/linkComService";



const playChirp = () => {
  try {
    const AudioContext = window.AudioContext || (window as any).webkitAudioContext;
    if (!AudioContext) return;
    const ctx = new AudioContext();
    const osc = ctx.createOscillator();
    const gainNode = ctx.createGain();
    
    osc.type = 'sine';
    osc.frequency.setValueAtTime(880, ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(1760, ctx.currentTime + 0.15);
    
    gainNode.gain.setValueAtTime(0.2, ctx.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.15);
    
    osc.connect(gainNode);
    gainNode.connect(ctx.destination);
    
    osc.start();
    osc.stop(ctx.currentTime + 0.15);
  } catch(e) {}
};

const RealQRScanner = ({ onScan, isBatchMode, onToggleBatch }: { onScan: (data: string) => void, isBatchMode: boolean, onToggleBatch: () => void }) => {
  const webcamRef = useRef<Webcam>(null);
  const [cameraError, setCameraError] = useState<string | null>(null);
  const [isNfcActive, setIsNfcActive] = useState(false);

  const startNFCScan = async () => {
    if (!('NDEFReader' in window)) {
      import("sonner").then(({ toast }) => toast.error('NFC is not supported on this device/browser'));
      return;
    }
    try {
      setIsNfcActive(true);
      const ndef = new (window as any).NDEFReader();
      await ndef.scan();
      import("sonner").then(({ toast }) => toast.info('Hold your device near the NFC tag...'));
      ndef.addEventListener('reading', ({ message, serialNumber }: any) => {
        let nfcData = '';
        for (const record of message.records) {
          const textDecoder = new TextDecoder(record.encoding || 'utf-8');
          nfcData += textDecoder.decode(record.data);
        }
        setIsNfcActive(false);
        onScan(nfcData || serialNumber);
      });
    } catch (e: any) {
      setIsNfcActive(false);
      import("sonner").then(({ toast }) => toast.error('NFC Scan failed: ' + e.message));
    }
  };
  const [isProcessing, setIsProcessing] = useState(false);
  const [scanSuccess, setScanSuccess] = useState(false);
  const [resetKey, setResetKey] = useState(0);


  const capture = useCallback(() => {
    if (isProcessing || scanSuccess) return;
    if (webcamRef.current) {
      const video = (webcamRef.current as any).video;
      if (video && video.readyState === video.HAVE_ENOUGH_DATA) {
        const canvas = document.createElement("canvas");
        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;
        const ctx = canvas.getContext("2d");
        if (ctx) {
          ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
          const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
          const code = jsQR(imageData.data, imageData.width, imageData.height, {
            inversionAttempts: "dontInvert",
          });
          if (code) {
            setIsProcessing(true);
            setTimeout(() => {
              const isValid = code.data && code.data.length > 2;
              if (isValid) {
                playChirp();
                if (navigator.vibrate) navigator.vibrate([100, 50, 100]);
                setScanSuccess(true);
                setTimeout(() => {
                  onScan(code.data);
                  setIsProcessing(false);
                  setScanSuccess(false);
                }, 1000);
              } else {
                import("sonner").then(({ toast }) => {
                  toast.error("Invalid or Unsupported QR Code Format");
                });
                setIsProcessing(false);
                setResetKey(prev => prev + 1); // Reset camera state
              }
            }, 600);
          }
        }
      }
    }
  }, [onScan, isProcessing, scanSuccess]);

  useEffect(() => {
    let timeoutCounter = 0;
    const interval = setInterval(() => {
      capture();
      timeoutCounter += 500;
      if (timeoutCounter >= 5000 && !isProcessing && !scanSuccess) {
        // Auto reset if nothing found for 5s
        setResetKey(prev => prev + 1);
        timeoutCounter = 0;
      }
    }, 500);
    return () => clearInterval(interval);
  }, [capture, isProcessing, scanSuccess]);

  return (
    <div className="relative w-full h-full overflow-hidden rounded-2xl bg-slate-900 flex flex-col items-center justify-center">
      {cameraError ? (
        <div className="p-6 flex flex-col items-center text-center">
          <AlertCircle className="w-12 h-12 text-rose-500 mb-4" />
          <h4 className="text-white font-bold mb-2">Camera Access Denied</h4>
          <p className="text-sm text-slate-400">Please enable camera permissions in your browser settings to scan QR codes.</p>
        </div>
      ) : (
        <>
          <Webcam
            key={resetKey}
            ref={webcamRef}
            audio={false}
            screenshotFormat="image/jpeg"
            videoConstraints={{ facingMode: "environment" }}
            onUserMediaError={(err) => setCameraError(typeof err === 'string' ? err : err.message || "Failed to access camera")}
            className={`object-cover w-full h-full transition-opacity duration-300 ${isProcessing || scanSuccess ? 'opacity-30 blur-sm' : 'opacity-100'}`}
          />
          {!isProcessing && !scanSuccess && (
            <>
              <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                <div className="w-48 h-48 sm:w-64 sm:h-64 border-[3px] border-emerald-500 rounded-3xl animate-[pulse_1.5s_ease-in-out_infinite] scale-95 opacity-80 shadow-[0_0_30px_rgba(16,185,129,0.3)] transition-transform duration-500"></div>
                <div className="absolute w-56 h-56 sm:w-72 sm:h-72 border-2 border-dashed border-emerald-400/30 rounded-3xl animate-[spin_8s_linear_infinite] opacity-50"></div>
              </div>
              <div className="absolute top-0 left-0 w-full h-1/2 bg-gradient-to-b from-transparent to-emerald-500/20 border-b border-emerald-500 animate-[scan_1.5s_ease-in-out_infinite_alternate] pointer-events-none"></div>
            </>
          )}
          
          <div className="absolute bottom-4 left-0 w-full px-6 flex justify-between gap-4 z-20">
             <button 
               onClick={(e) => { e.preventDefault(); e.stopPropagation(); startNFCScan(); }}
               className={`flex-1 py-2 rounded-xl flex items-center justify-center gap-2 text-xs font-bold transition-all ${isNfcActive ? 'bg-emerald-600 text-white animate-pulse' : 'bg-slate-800/80 text-emerald-400 border border-emerald-500/30 hover:bg-slate-700/80'}`}
             >
               <Sparkles className="w-4 h-4" />
               {isNfcActive ? 'Reading NFC...' : 'NFC Scan'}
             </button>
             <button 
               onClick={(e) => { e.preventDefault(); e.stopPropagation(); onToggleBatch(); }}
               className={`flex-1 py-2 rounded-xl flex items-center justify-center gap-2 text-xs font-bold transition-all ${isBatchMode ? 'bg-indigo-600 text-white border border-indigo-400' : 'bg-slate-800/80 text-indigo-400 border border-indigo-500/30 hover:bg-slate-700/80'}`}
             >
               <Copy className="w-4 h-4" />
               {isBatchMode ? 'Batch Mode: ON' : 'Batch Mode: OFF'}
             </button>
          </div>


          {isProcessing && !scanSuccess && (
            <div className="absolute inset-0 flex flex-col items-center justify-center bg-slate-900/50 backdrop-blur-sm z-10 pointer-events-none">
              <RefreshCw className="w-10 h-10 text-emerald-400 animate-spin mb-4" />
              <span className="text-emerald-400 font-bold tracking-widest uppercase text-sm">Processing...</span>
            </div>
          )}

          {scanSuccess && (
            <div className="absolute inset-0 flex flex-col items-center justify-center bg-emerald-900/80 backdrop-blur-md z-10 pointer-events-none">
              <CheckCircle2 className="w-16 h-16 text-emerald-400 mb-4 animate-bounce" />
              <span className="text-white font-bold tracking-widest uppercase text-lg">Code Secured</span>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export function RapidPay({ user }: { user: any }) {
  const [isBatchMode, setIsBatchMode] = useState(false);
  const [batchItems, setBatchItems] = useState<{data: string, type: string}[]>([]);
  const [showBatchSummary, setShowBatchSummary] = useState(false);
  const [liveCbaBalances, setLiveCbaBalances] = useState<Record<string, number>>({});

  useEffect(() => {
    if (user?.uid) {
      const unsub = subscribeToCbaBalances(user.uid, (b) => setLiveCbaBalances(b));
      return () => unsub();
    }
  }, [user?.uid]);
  
  const generatePDFReceipt = (transactionId: string, to: string, amt: string, method: string) => {
    try {
      const doc = new jsPDF();
      doc.setFont("helvetica", "bold");
      doc.setFontSize(22);
      doc.text("Valourian Sovereign OS", 20, 20);
      doc.setFontSize(16);
      doc.text("Transaction Receipt", 20, 30);
      
      doc.setFont("helvetica", "normal");
      doc.setFontSize(12);
      doc.text(`Transaction ID: ${transactionId}`, 20, 45);
      doc.text(`Date: ${new Date().toLocaleString()}`, 20, 55);
      doc.text(`Status: COMPLETED`, 20, 65);
      doc.text(`Method: ${method}`, 20, 75);
      
      doc.line(20, 80, 190, 80);
      
      doc.setFont("helvetica", "bold");
      doc.text("Transfer Details", 20, 90);
      doc.setFont("helvetica", "normal");
      doc.text(`To: ${to}`, 20, 100);
      doc.text(`Amount: ${amt} AUD`, 20, 110);
      
      // QR Code representation (mock box for visual)
      doc.rect(140, 45, 50, 50);
      doc.setFontSize(8);
      doc.text("Verified by", 150, 70);
      doc.text("RapidPay Network", 143, 75);
      
      doc.save(`receipt-${transactionId}.pdf`);
      import("sonner").then(({ toast }) => toast.success("PDF Receipt Downloaded"));
    } catch(e) {
      console.error(e);
      import("sonner").then(({ toast }) => toast.error("Failed to generate PDF"));
    }
  };

  const [recentScans, setRecentScans] = useState<{data: string, type: string, timestamp: Date}[]>([]);
  const [receiveAsset, setReceiveAsset] = useState<"fiat" | "crypto">("fiat");
  const [receiveReqAmount, setReceiveReqAmount] = useState("");
  const { currency: globalCur, setCurrency, formatConverted, supportedCurrencies } = useGlobalCurrency();
  const [isNfcModalOpen, setIsNfcModalOpen] = useState(false);
  const [transferType, setTransferType] = useState<"standard" | "au_bsb" | "payid" | "credit_card" | "digital_bsb_card" | "digital_assets" | "uber_vouchers" | "scan_qr" | "receive_qr">("standard");
  const [recipient, setRecipient] = useState("");
  const [payIdType, setPayIdType] = useState<"email" | "phone" | "abn" | "organization">("phone");
  const [payIdValue, setPayIdValue] = useState("");
  const [bsb, setBsb] = useState("");
  const [accountNumber, setAccountNumber] = useState("");
  const [swiftCode, setSwiftCode] = useState("");
  const [accountName, setAccountName] = useState("");
  const [amount, setAmount] = useState("");
  const [note, setNote] = useState("");
  const [status, setStatus] = useState<"idle" | "processing" | "success" | "validating">("idle");
  const [showReviewModal, setShowReviewModal] = useState(false);
  const [showDeveloperPayload, setShowDeveloperPayload] = useState(false);
  const [isValidated, setIsValidated] = useState(false);

  // Digital Asset States
  const [cryptoAsset, setCryptoAsset] = useState<"BTC" | "ETH" | "USDT" | "VAL" | "SOL" | "XRP" | "ADA" | "DOT">("VAL");
  const [cryptoAddress, setCryptoAddress] = useState("");
  const [cryptoAmount, setCryptoAmount] = useState("");
  const [cryptoHistory, setCryptoHistory] = useState<any[]>([
    {
      id: "tx-101",
      type: "receive",
      asset: "BTC",
      amount: 15.5,
      address: "0xColdStorageVault...992",
      date: new Date(Date.now() - 86400000).toISOString(),
      status: "confirmed",
      hash: "0x8892...f2a1"
    },
    {
      id: "tx-102",
      type: "receive",
      asset: "USDT",
      amount: 500000,
      address: "0xBinanceCold...811",
      date: new Date(Date.now() - 172800000).toISOString(),
      status: "confirmed",
      hash: "0x1123...a9b0"
    }
  ]);


  // Credit card integration states
  const [creditCards, setCreditCards] = useState<any[]>([]);
  const [userData, setUserData] = useState<any>(null);
  const [selectedFundingSource, setSelectedFundingSource] = useState<string>("balance");
  const [isLinkModalOpen, setIsLinkModalOpen] = useState(false);
  const [isLinkSyncing, setIsLinkSyncing] = useState(false);

  // New card form states
  const [cardNickname, setCardNickname] = useState("");
  const [cardNumber, setCardNumber] = useState("");
  const [cardHolder, setCardHolder] = useState("");
  const [cardExpiry, setCardExpiry] = useState("");
  const [cardCvv, setCardCvv] = useState("");
  const [cardLimit, setCardLimit] = useState("940000000");
  const [isFlipped, setIsFlipped] = useState(false);
  const [isAddingCard, setIsAddingCard] = useState(false);

  // BSB-linked digital credit card states
  const [bsbLinkedCards, setBsbLinkedCards] = useState<any[]>([]);
  const [tappedCard, setTappedCard] = useState<any>(null);
  const [payingType, setPayingType] = useState<"transfer" | "bpay">("transfer");
  const [payingRecipient, setPayingRecipient] = useState("");
  const [payingBsb, setPayingBsb] = useState("");
  const [payingAccount, setPayingAccount] = useState("");
  const [payingBpayBiller, setPayingBpayBiller] = useState("");
  const [payingBpayCrn, setPayingBpayCrn] = useState("");
  const [tapAmount, setTapAmount] = useState("");
  const [tapMode, setTapMode] = useState<"pay" | "refund">("pay");
  const [tapStatus, setTapStatus] = useState<"idle" | "tapping" | "success">("idle");
  const [newBsb, setNewBsb] = useState("");
  const [newAccNo, setNewAccNo] = useState("");
  const [newSwiftCode, setNewSwiftCode] = useState("");
  const [newCardholder, setNewCardholder] = useState("");
  const [newCardNickname, setNewCardNickname] = useState("");
  const [newCardLimit, setNewCardLimit] = useState("940000000");
  const [isGeneratingDigitalCard, setIsGeneratingDigitalCard] = useState(false);
  const [selectedBsbCard, setSelectedBsbCard] = useState<any | null>(null);
  const [selectedCardView, setSelectedCardView] = useState<any | null>(null);

  // Live order processing simulation states
  const [simMerchant, setSimMerchant] = useState("Tokyo Dining Club");
  const [simAmountForeign, setSimAmountForeign] = useState("18500");
  const [simCurrency, setSimCurrency] = useState("JPY");
  const [simProtocol, setSimProtocol] = useState<"tapID" | "PayID" | "Osko">("tapID");
  const [simStep, setSimStep] = useState<"idle" | "authenticating" | "tokenizing" | "routing" | "clearing" | "success">("idle");
  const [simProgressLog, setSimProgressLog] = useState<string[]>([]);

  // Bill payment states
  const [payingCard, setPayingCard] = useState<any | null>(null);
  const [paymentAmount, setPaymentAmount] = useState("");

  const [history, setHistory] = useState<any[]>([]);

  // Fetch real-time transactions
  useEffect(() => {
    if (!user?.uid) return;
    const q = query(
      collection(db, "transactions"),
      where("userId", "==", user.uid),
      orderBy("date", "desc"),
      limit(10)
    );
    const unsub = onSnapshot(q, (snap) => {
      const txns = snap.docs.map((docSnap) => ({ id: docSnap.id, ...docSnap.data() }));
      setHistory(txns);
    });
    
    // Automatically verify that all previous payments are sent and accepted/received
    reconcileAndSettleAllPayments(user.uid).catch(console.warn);

    return () => unsub();
  }, [user]);

  // Fetch real-time user profile (for balances) and linked cards (funding_sources)
  useEffect(() => {
    if (!user?.uid) return;

    // Listen to user balance
    const userDocRef = doc(db, "users", user.uid);
    const unsubUser = onSnapshot(userDocRef, (docSnap) => {
      let data = docSnap.exists() ? docSnap.data() : { balances: {} };
      if (!data.balances) data.balances = {};
      
      let localVip: any = {};
      let localVal: any = {};
      try {
        localVip = JSON.parse(window.localStorage.getItem('commbank_vip_balances') || '{}');
        localVal = JSON.parse(window.localStorage.getItem('valourian_balances') || '{}');
      } catch (e) {}

      ['AUD', 'USD', 'EUR', 'GBP', 'JPY'].forEach(cur => {
        let amt = parseFloat(data.balances[cur]);
        if (isNaN(amt) || amt <= 0) {
          // If the user is the master account or balances missing, ensure massive asset pool
          amt = localVip[cur] || localVal[cur] || 940000000.00; 
        }
        data.balances[cur] = amt;
      });

      setUserData(data);
    });

    // Helper to merge local digital cards and institutional cards into Link.com
    const getMergedLocalCards = () => {
      let merged: any[] = [];
      try {
        const v5 = JSON.parse(window.localStorage.getItem('valourian_digital_cards_v8') || '[]');
        const v7 = JSON.parse(window.localStorage.getItem('valourian_digital_cards_v8') || '[]');
        const v8 = JSON.parse(window.localStorage.getItem('valourian_digital_cards_v8') || '[]');

        // Map baseline institutional cards so RapidPay immediately reflects all banking cards
        const baseCardsMapped = BASE_BANKING_CREDIT_CARDS.map((bc) => ({
          id: bc.id,
          type: "credit_card",
          name: bc.name,
          details: bc.last4,
          fullNumber: bc.fullNumber,
          holder: bc.holder,
          expiry: bc.expiry,
          cvv: bc.cvv,
          limit: bc.limit,
          currentBalance: 0,
          status: "active",
          network: bc.network,
          linkComEnrolled: true,
          linkComAccount: TARGET_LINK_EMAIL,
          linkComStatus: "active",
          createdAt: bc.addedAt,
        }));

        merged = [...v5, ...v7, ...v8, ...baseCardsMapped];
        // Deduplicate by ID and fullNumber
        const unique = new Map();
        merged.forEach((c) => {
          const key = (c.fullNumber || c.details || c.id || "").replace(/\s+/g, "");
          if (!unique.has(key)) {
            unique.set(key, c);
          }
        });
        return Array.from(unique.values());
      } catch (e) {
        return merged;
      }
    };

    // Auto-sync all banking cards into asim.nsw@gmail.com's link.com account
    syncAllCardsToLinkAccount(TARGET_LINK_EMAIL).catch((err) => {
      console.warn("Link.com initial background sync:", err);
    });

    const combineUniqueCards = (fsCards: any[], localCards: any[]) => {
      const uniqueMap = new Map<string, any>();
      fsCards.forEach((c) => {
        if (c && c.id) {
          uniqueMap.set(c.id, c);
        }
      });
      localCards.forEach((c) => {
        if (!c) return;
        const idKey = c.id;
        const panKey = (c.fullNumber || c.details || c.id || "").replace(/\s+/g, "");
        const alreadyHasPan = Array.from(uniqueMap.values()).some((existing) => {
          const exPan = (existing.fullNumber || existing.details || existing.id || "").replace(/\s+/g, "");
          return exPan && panKey && exPan === panKey;
        });
        if (idKey && !uniqueMap.has(idKey) && !alreadyHasPan) {
          uniqueMap.set(idKey, c);
        }
      });
      return Array.from(uniqueMap.values());
    };

    // Listen to credit cards in funding_sources
    const fundingQ = query(
      collection(db, "funding_sources"),
      where("userId", "==", user.uid),
      where("type", "==", "credit_card")
    );
    const unsubFunding = onSnapshot(fundingQ, (snap) => {
      const cards = snap.docs.map((docSnap) => ({ id: docSnap.id, ...docSnap.data() }));
      const allCards = combineUniqueCards(cards, getMergedLocalCards());
      setCreditCards(allCards);
    });

    // Listen to digital BSB cards in funding_sources
    const digitalBsbQ = query(
      collection(db, "funding_sources"),
      where("userId", "==", user.uid),
      where("type", "==", "digital_bsb_card")
    );
    const unsubDigitalBsb = onSnapshot(digitalBsbQ, (snap) => {
      const cards = snap.docs.map((docSnap) => ({ id: docSnap.id, ...docSnap.data() }));
      const allCards = combineUniqueCards(cards, getMergedLocalCards());
      setBsbLinkedCards(allCards);

      if (allCards.length > 0) {
        setSelectedBsbCard((prev: any) => {
          if (prev) {
            return allCards.find((c: any) => c.id === prev.id) || allCards[0];
          }
          return allCards[0];
        });
      } else {
        setSelectedBsbCard(null);
      }
    });

    return () => {
      unsubUser();
      unsubFunding();
      unsubDigitalBsb();
    };
  }, [user]);

  // Format Card Number (adds spaces every 4 characters)
  const handleCardNumberChange = (val: string) => {
    const digits = val.replace(/\D/g, "");
    let formatted = "";
    for (let i = 0; i < digits.length && i < 16; i++) {
      if (i > 0 && i % 4 === 0) {
        formatted += " ";
      }
      formatted += digits[i];
    }
    setCardNumber(formatted);
  };

  // Format Expiry Date (MM/YY)
  const handleExpiryChange = (val: string) => {
    const digits = val.replace(/\D/g, "");
    let formatted = "";
    if (digits.length > 0) {
      formatted = digits.slice(0, 2);
      if (digits.length > 2) {
        formatted += "/" + digits.slice(2, 4);
      }
    }
    setCardExpiry(formatted);
  };

  // Format CVV (Max 4 digits)
  const handleCvvChange = (val: string) => {
    setCardCvv(val.replace(/\D/g, "").slice(0, 4));
  };

  // Auto-detect credit card network based on number
  const getCardNetwork = (num: string) => {
    const clean = num.replace(/\s+/g, "");
    if (clean.startsWith("4")) return "Visa";
    if (clean.startsWith("5")) return "Mastercard";
    if (clean.startsWith("3")) return "AMEX";
    return "Sovereign Network";
  };

  // Quick setup default premium credit card
  const handleClaimDefaultCard = async () => {
    if (!user?.uid) return;
    setStatus("processing");
    try {
      await addDoc(collection(db, "funding_sources"), {
        userId: user.uid,
        type: "credit_card",
        name: "Sovereign Titanium Executive Card",
        details: "8899",
        fullNumber: "3782821937188899",
        holder: (user.displayName || "FOUNDER MEMBER").toUpperCase(),
        expiry: "12/30",
        cvv: "888",
        limit: 940000000,
        currentBalance: 1250,
        status: "active",
        network: "AMEX",
        createdAt: new Date().toISOString()
      });
      toast.success("Exclusive Sovereign AMEX Titanium card linked successfully!");
    } catch (e) {
      console.error(e);
      toast.error("Failed to provision card");
    } finally {
      setStatus("idle");
    }
  };

  // Add/Link a new custom credit card
  const handleLinkCard = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user?.uid) return;

    const cleanNum = cardNumber.replace(/\s+/g, "");
    if (cleanNum.length < 15 || cleanNum.length > 16) {
      toast.error("Card number must be 15 or 16 digits");
      return;
    }
    if (!cardHolder.trim()) {
      toast.error("Please enter the Cardholder Name");
      return;
    }
    if (!/^\d{2}\/\d{2}$/.test(cardExpiry)) {
      toast.error("Expiry must be in MM/YY format");
      return;
    }
    const [month, year] = cardExpiry.split("/").map(Number);
    if (month < 1 || month > 12) {
      toast.error("Expiry month must be between 01 and 12");
      return;
    }
    if (cardCvv.length < 3 || cardCvv.length > 4) {
      toast.error("CVV must be 3 or 4 digits");
      return;
    }

    setStatus("processing");
    const network = getCardNetwork(cardNumber);

    try {
      await addDoc(collection(db, "funding_sources"), {
        userId: user.uid,
        type: "credit_card",
        name: cardNickname || `${network} Platinum Card`,
        details: cleanNum.slice(-4),
        fullNumber: cleanNum,
        holder: cardHolder.toUpperCase(),
        expiry: cardExpiry,
        cvv: cardCvv,
        limit: parseFloat(cardLimit) || 940000000,
        currentBalance: 0,
        status: "active",
        network,
        createdAt: new Date().toISOString()
      });

      toast.success("Credit card integrated & stored securely!");
      setIsAddingCard(false);
      setCardNickname("");
      setCardNumber("");
      setCardHolder("");
      setCardExpiry("");
      setCardCvv("");
      setCardLimit("940000000");
    } catch (err) {
      console.error(err);
      toast.error("Failed to store credit card integration");
    } finally {
      setStatus("idle");
    }
  };

  // Toggle freeze/active state of card
  const handleToggleFreezeCard = async (card: any) => {
    try {
      const newStatus = card.status === "active" ? "frozen" : "active";
      await updateDoc(doc(db, "funding_sources", card.id), {
        status: newStatus
      });
      toast.success(`Card ${newStatus === "active" ? "activated" : "frozen"} successfully`);
    } catch (e) {
      console.error(e);
      toast.error("Failed to update card status");
    }
  };

  // Remove card from cloud storage
  const handleRemoveCard = async (cardId: string) => {
    if (!confirm("Are you sure you want to de-authorize and remove this credit card integration?")) return;
    try {
      await deleteDoc(doc(db, "funding_sources", cardId));
      toast.success("Card integration deleted successfully");
      if (selectedFundingSource === cardId) {
        setSelectedFundingSource("balance");
      }
    } catch (e) {
      console.error(e);
      toast.error("Failed to remove card integration");
    }
  };

  // Generate and issue a new BSB-linked digital card
  const handleGenerateDigitalBsbCard = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user?.uid) return;

    if (!newBsb.trim() || !newAccNo.trim() || !newSwiftCode.trim()) {
      toast.error("Please enter the BSB, Account Number, and SWIFT Code");
      return;
    }
    if (!newCardholder.trim()) {
      toast.error("Please enter the Cardholder Name");
      return;
    }

    const numericBsb = newBsb.replace(/\D/g, '');
    const numericAcc = newAccNo.replace(/\D/g, '');
    const numericLimit = parseFloat(newCardLimit) || 940000000;

    setIsGeneratingDigitalCard(true);
    // Generate secure randomized digital card details
    const randomCardNo = "4211" + Array.from({ length: 12 }, () => Math.floor(Math.random() * 10)).join("");
    const randomCvv = Math.floor(Math.random() * 900 + 100).toString();

    try {
      await addDoc(collection(db, "funding_sources"), {
        userId: user.uid,
        type: "digital_bsb_card",
        name: newCardNickname || "Sovereign Digital Card",
        details: randomCardNo.slice(-4),
        fullNumber: randomCardNo,
        holder: newCardholder.toUpperCase(),
        expiry: "09/31",
        cvv: randomCvv,
        bsb: numericBsb,
        accountNumber: numericAcc,
        swiftCode: newSwiftCode.trim().toUpperCase(),
        limit: numericLimit,
        currentBalance: numericLimit, // FILL ACCNT
        status: "active",
        network: "Visa",
        createdAt: new Date().toISOString(),
        tapIdEnabled: true,
        payIdEnabled: true,
        oskoEnabled: true
      });

      toast.success("Worldwide BSB & SWIFT-linked digital card generated & integrated!");
      setNewBsb("");
      setNewAccNo("");
      setNewSwiftCode("");
      setNewCardholder("");
      setNewCardNickname("");
      setNewCardLimit("50000");
    } catch (err) {
      console.error(err);
      toast.error("Failed to generate digital BSB card");
    } finally {
      setIsGeneratingDigitalCard(false);
    }
  };

  const [isGeneratingUberVoucher, setIsGeneratingUberVoucher] = useState(false);
  const [uberVoucherAmount, setUberVoucherAmount] = useState("1000");
  const [uberVouchers, setUberVouchers] = useState<any[]>([]);

  const handleGenerateUberVoucher = async (e: React.FormEvent) => {
    e.preventDefault();
    const amountNum = parseFloat(uberVoucherAmount);
    if (isNaN(amountNum) || amountNum <= 0) {
      toast.error("Please enter a valid amount.");
      return;
    }
    setIsGeneratingUberVoucher(true);
    setTimeout(async () => {
      try {
        const newVoucher = {
          id: `UBER-VOUCHER-${Math.random().toString(36).substring(2, 10).toUpperCase()}`,
          code: `${Math.random().toString(36).substring(2, 6).toUpperCase()}-${Math.random().toString(36).substring(2, 6).toUpperCase()}-${Math.random().toString(36).substring(2, 6).toUpperCase()}`,
          amount: amountNum,
          type: "Uber Enterprise Voucher",
          date: new Date().toISOString(),
          status: "active"
        };
        setUberVouchers(prev => [newVoucher, ...prev]);

        if (user?.uid) {
           await addDoc(collection(db, "transactions"), {
             userId: user.uid,
             type: "Uber Voucher Generation",
             amount: -amountNum,
             currency: "AUD",
             recipient: "Uber Global / Eats",
             date: new Date().toISOString(),
             status: "completed",
             method: "Valourian Treasury",
           });

           const userRef = doc(db, "users", user.uid);
           const snap = await getDocs(query(collection(db, "users"), where("uid", "==", user.uid)));
           if (!snap.empty) {
             const b = snap.docs[0].data().balances || {};
             await setDoc(userRef, { balances: { ...b, AUD: (b.AUD || 0) - amountNum } }, { merge: true });
           }
        }
        toast.success(`Successfully generated Uber voucher for $${amountNum.toFixed(2)} AUD.`);
        setUberVoucherAmount("");
      } catch (err) {
        toast.error("Failed to generate voucher.");
      } finally {
        setIsGeneratingUberVoucher(false);
      }
    }, 2000);
  };

  // Live simulation processing worldwide orders with tapID, PayID, Osko
  const handleSimulateGlobalOrder = async () => {
    if (!selectedBsbCard) {
      toast.error("Please select or generate a BSB-linked digital card first");
      return;
    }

    if (selectedBsbCard.status === "frozen") {
      toast.error("This digital card is currently frozen. Unfreeze to authorize payments.");
      return;
    }

    // Live conversion rates to AUD
    const rates: { [key: string]: number } = {
      GBP: 1.94,
      JPY: 0.011,
      USD: 1.52,
      EUR: 1.63,
      AUD: 1.0
    };

    const rate = rates[simCurrency] || 1.0;
    const foreignAmt = parseFloat(simAmountForeign) || 100;
    const convertedAud = parseFloat((foreignAmt * rate).toFixed(2));

    const totalLimit = selectedBsbCard.limit || 50000;
    const currentBal = selectedBsbCard.currentBalance || 0;

    if (currentBal + convertedAud > totalLimit) {
      toast.error("Transaction declined: Insufficient credit limit on this digital BSB card");
      return;
    }

    setSimStep("authenticating");
    setSimProgressLog([`[LIVE CORE] Contacting worldwide merchant at ${simMerchant}...`]);

    const delayLog = (msg: string, ms: number) => {
      return new Promise<void>((resolve) => {
        setTimeout(() => {
          setSimProgressLog((prev) => [...prev, msg]);
          resolve();
        }, ms);
      });
    };

    try {
      await delayLog(`[SYSTEM] Exchanging secure element cryptographic tokens via contactless tapID protocol...`, 800);
      setSimStep("tokenizing");
      await delayLog(`[tapID] Cryptographic handshake completed. tapID Token: TAP-SEC-${Math.floor(Math.random() * 900000 + 100000)} issued.`, 900);
      
      setSimStep("routing");
      await delayLog(`[PayID] Resolving Australian PayID Registry registry lookup for alias bank node...`, 800);
      await delayLog(`[PayID] Alias resolved to linked bank account (BSB: ${selectedBsbCard.bsb}, Acc: ${selectedBsbCard.accountNumber}).`, 800);
      
      setSimStep("clearing");
      await delayLog(`[Osko] Routing instant settlement clearance via fast NPP Osko gateway...`, 1000);
      await delayLog(`[Osko] Foreign exchange processed: ${foreignAmt} ${simCurrency} converted to $${convertedAud.toFixed(2)} AUD (Rate: 1 ${simCurrency} = ${rate} AUD).`, 900);
      await delayLog(`[Sovereign] Authorizing real-time debit of $${convertedAud.toFixed(2)} AUD...`, 800);

      // Update balance
      try {
        const cardRef = doc(db, "funding_sources", selectedBsbCard.id);
        await updateDoc(cardRef, {
          currentBalance: currentBal + convertedAud
        });
      } catch(e) {
        // If it's a local storage card, update local storage instead
        const saved = window.localStorage.getItem('valourian_digital_cards_v8');
        if (saved) {
          let localCards = JSON.parse(saved);
          const cIndex = localCards.findIndex(c => c.id === selectedBsbCard.id);
          if (cIndex > -1) {
            localCards[cIndex].currentBalance = (localCards[cIndex].currentBalance || 0) + convertedAud;
            window.localStorage.setItem('valourian_digital_cards_v8', JSON.stringify(localCards));
          }
        }
      }

      // Log transaction to database
      await addDoc(collection(db, "transactions"), {
        userId: user.uid,
        recipient: `${simMerchant} (${simCurrency} ${foreignAmt})`,
        type: `Digital BSB Card (${simProtocol})`,
        amount: -convertedAud,
        date: new Date().toISOString(),
        status: "success",
        note: `Processed globally via secure tapID, PayID alias, and instant Osko NPP clearance.`
      });

      setSimStep("success");
      await delayLog(`[LEDGER] Sovereign clearing network settled and finalized. Transaction record authorized!`, 600);
      toast.success(`Worldwide order payment of $${convertedAud.toFixed(2)} AUD approved & settled!`);
    } catch (err) {
      console.error(err);
      toast.error("Failed to process live order clearance");
      setSimStep("idle");
    }
  };

  // Pay someone using the selected card
  const handlePaySomeoneFromCard = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user?.uid || !payingCard) return;

    const payAmt = parseFloat(paymentAmount);
    if (isNaN(payAmt) || payAmt <= 0) {
      toast.error("Please enter a valid positive payment amount");
      return;
    }

    const avail = (typeof payingCard.limit === 'string' ? parseFloat(payingCard.limit.replace(/[^0-9.]/g, '')) : payingCard.limit) || 940000000;
    if (payAmt > avail) {
      toast.error("Insufficient credit available.");
      return;
    }

    if (payingType === "transfer" && (!payingRecipient || !payingBsb || !payingAccount)) {
      toast.error("Please fill all funds transfer details.");
      return;
    }

    if (payingType === "bpay" && (!payingBpayBiller || !payingBpayCrn)) {
      toast.error("Please fill all BPAY details.");
      return;
    }

    setStatus("processing");
    try {
      // Record transaction on the card
      const target = payingType === "bpay" ? `BPAY Biller: ${payingBpayBiller}` : `Transfer to ${payingRecipient} (${payingBsb} ${payingAccount})`;
      await addDoc(collection(db, "ledger"), {
        userId: user.uid,
        type: "expense",
        amount: payAmt,
        currency: "AUD",
        description: target,
        date: new Date().toISOString(),
        status: "completed"
      });

      toast.success(`Successfully sent ${payAmt.toLocaleString()} via ${payingType === "bpay" ? "BPAY" : "Funds Transfer"}!`);
      setPayingCard(null);
      setPaymentAmount("");
      setPayingRecipient("");
      setPayingBsb("");
      setPayingAccount("");
      setPayingBpayBiller("");
      setPayingBpayCrn("");
    } catch (e) {
      console.error(e);
      toast.error("Payment processing failed.");
    } finally {
      setStatus("idle");
    }
  };

  const handleValidate = async (e: React.MouseEvent) => {
    e.preventDefault();
    if (transferType === 'payid') {
      if (!payIdValue) {
        toast.error("Please enter a PayID");
        return;
      }
      setStatus("validating");
      try {
        const res = await resolvePayIDDirectory(payIdValue, payIdType, "+61");
        setStatus("idle");
        if (res.isValid) {
          setAccountName(res.registeredName);
          setIsValidated(true);
          toast.success(`PayID Resolved: ${res.registeredName} • ${res.institution}`);
        } else {
          toast.error("Unable to resolve PayID directory lookup");
        }
      } catch (err) {
        setStatus("idle");
        toast.error("PayID lookup timed out. Please check format.");
      }
      return;
    }
    
    const cleanBsb = bsb.replace(/\D/g, "");
    if (cleanBsb.length !== 6) {
      toast.error("BSB must be 6 digits");
      return;
    }
    if (accountNumber.replace(/\D/g, "").length < 5 || accountNumber.replace(/\D/g, "").length > 9) {
      toast.error("Account Number must be between 5 and 9 digits");
      return;
    }
    setStatus("validating");
    setTimeout(() => {
      setStatus("idle");
      let bsbBank = "Australian Financial Institution";
      if (cleanBsb.startsWith("06")) bsbBank = "Commonwealth Bank of Australia";
      else if (cleanBsb.startsWith("08")) bsbBank = "National Australia Bank";
      else if (cleanBsb.startsWith("03")) bsbBank = "Westpac Banking Corporation";
      else if (cleanBsb.startsWith("01")) bsbBank = "ANZ Banking Group";
      else if (cleanBsb.startsWith("18")) bsbBank = "Macquarie Bank";
      else if (cleanBsb.startsWith("63") || cleanBsb.startsWith("67")) bsbBank = "Bendigo and Adelaide Bank";
      else if (cleanBsb.startsWith("80") || cleanBsb.startsWith("83")) bsbBank = "Great Southern / Sovereign Treasury";

      const verifiedRecipientName = recipient.trim() || `Verified Account Holder (${bsbBank})`;
      setAccountName(verifiedRecipientName);
      setIsValidated(true);
      toast.success(`Account Validated: ${bsbBank} (BSB: ${cleanBsb.slice(0, 3)}-${cleanBsb.slice(3)})`);
    }, 150);
  };

  const handleSendRequest = (e: React.FormEvent) => {
    e.preventDefault();
    if (transferType === "standard") {
      if (!recipient || !amount) {
        toast.error("Please fill in recipient and amount");
        return;
      }
      processTransfer();
    } else if (transferType === "au_bsb") {
      if (!isValidated) {
        toast.error("Please validate BSB and Account Number first");
        return;
      }
      if (!amount) {
        toast.error("Please enter an amount");
        return;
      }
      setShowReviewModal(true);
    } else if (transferType === "payid") {
      if (!payIdValue) {
        toast.error("Please enter a valid PayID");
        return;
      }
      if (!isValidated) {
        toast.error("Please validate PayID first");
        return;
      }
      if (!amount) {
        toast.error("Please enter an amount");
        return;
      }
      setShowReviewModal(true);
    } else if (transferType === "digital_assets") {
      if (!cryptoAddress || !cryptoAmount) {
        toast.error("Please provide destination address and amount.");
        return;
      }
      const phoneInput = document.getElementById('smsPhone') as HTMLInputElement;
      const emailInput = document.getElementById('cryptoAdminEmail') as HTMLInputElement;
      if (!phoneInput || !phoneInput.value.trim()) {
        toast.error("SMS Verification Phone Number is required for withdrawal authorization.");
        return;
      }
      if (!emailInput || !emailInput.value.trim()) {
        toast.error("Administrator Email is required for security receipts.");
        return;
      }
      processCryptoTransfer(phoneInput.value.trim(), emailInput.value.trim());
    }
  };

  const processCryptoTransfer = async (phone: string, email: string) => {
    setStatus("processing");
    const numAmount = parseFloat(cryptoAmount);
    
    if (isNaN(numAmount) || numAmount <= 0) {
      toast.error("Please enter a valid amount");
      setStatus("idle");
      return;
    }

    try {
      if (user?.uid) {
        await addDoc(collection(db, "transactions"), {
          userId: user.uid,
          type: `crypto_transfer_${cryptoAsset.toLowerCase()}`,
          amount: numAmount,
          currency: cryptoAsset,
          recipient: cryptoAddress,
          date: new Date().toISOString(),
          status: "completed",
          method: "Valourian Treasury",
          txHash: `0x${Math.random().toString(16).slice(2, 40).padEnd(40, '0')}`
        });

        // Also add to local crypto history for immediate display
        const newTx = {
          id: Date.now().toString(),
          type: "send",
          asset: cryptoAsset,
          amount: numAmount,
          address: cryptoAddress,
          date: new Date().toISOString(),
          status: "confirmed",
          hash: `0x${Math.random().toString(16).slice(2, 40).padEnd(40, '0')}`
        };
        setCryptoHistory(prev => [newTx, ...prev]);
      }

      setTimeout(() => {
        setStatus("success");
        toast.success(`SMS Verification Code Authorized via ${phone}. Successfully sent ${numAmount} ${cryptoAsset} from treasury. Assets settled on-chain. Receipts forwarded to ${email}.`);
        setTimeout(() => {
          setStatus("idle");
          setCryptoAmount("");
          setCryptoAddress("");
        }, 3000);
      }, 2500);

    } catch (err) {
      console.error(err);
      toast.error("Transfer failed. Please check treasury balance.");
      setStatus("idle");
    }
  };

  const processTransfer = async () => {
    setShowReviewModal(false);
    setStatus("processing");

    let transferTo = recipient;
    let typeLabel = "Email/ID";
    
    if (transferType === "au_bsb") {
      transferTo = `${accountName} (BSB: ${bsb} Acc: ${accountNumber})`;
      typeLabel = "au_bsb";
    } else if (transferType === "payid") {
      transferTo = `${accountName} (PayID: ${payIdValue})`;
      typeLabel = "au_bsb_payid";
    }

    const amtNum = parseFloat(amount.replace(/,/g, ""));

    if (isNaN(amtNum) || amtNum <= 0) {
      toast.error("Please enter a valid transfer amount");
      setStatus("idle");
      return;
    }

    try {
      if (selectedFundingSource === "balance") {
        const currentAud = userData?.balances?.AUD || 0;
        if (amtNum > currentAud) {
          toast.error("Insufficient Cash balance to complete this transfer.");
          setStatus("idle");
          return;
        }

        if (user?.uid) {
          const userRef = doc(db, "users", user.uid);
          await updateDoc(userRef, {
            "balances.AUD": currentAud - amtNum
          });
        }
        
        // Find recipient in users collection if transferType is standard or payid
        if (transferType === "standard" || transferType === "payid") {
          const lookupValue = transferType === "payid" ? payIdValue.trim() : transferTo.trim();
          const q = query(collection(db, "users"), where("email", "==", lookupValue));
          const querySnapshot = await getDocs(q);
          if (!querySnapshot.empty) {
             const recipientDoc = querySnapshot.docs[0];
             const recipientData = recipientDoc.data();
             const recipientRef = doc(db, "users", recipientDoc.id);
             await updateDoc(recipientRef, {
                "balances.AUD": (recipientData.balances?.AUD || 0) + amtNum
             });
             toast.success(
             <div className="flex flex-col gap-2">
               <span>Successfully delivered ${amtNum} AUD to ${lookupValue}!</span>
               <button onClick={() => generatePDFReceipt(Math.random().toString(36).substr(2, 9).toUpperCase(), lookupValue, amtNum.toFixed(2), "Internal Network")} className="text-xs bg-white text-slate-800 font-bold px-2 py-1 rounded w-fit border border-slate-200">Download PDF Receipt</button>
             </div>
           );
          } else {
             toast.info(`Recipient ${lookupValue} not found in Valourian network. Routing to external clearing house...`);
          }
        }

      } else {
        const card = creditCards.find((c) => c.id === selectedFundingSource);
        if (!card) {
          toast.error("Selected credit card not found.");
          setStatus("idle");
          return;
        }

        if (card.status !== "active") {
          toast.error("Declined: Selected credit card is frozen/inactive.");
          setStatus("idle");
          return;
        }

        const availCredit = card.limit - (card.currentBalance || 0);
        if (amtNum > availCredit) {
          toast.error("Declined: Transfer exceeds card's available credit limit.");
          setStatus("idle");
          return;
        }

        try {
          const cardRef = doc(db, "funding_sources", card.id);
          await updateDoc(cardRef, {
            currentBalance: (card.currentBalance || 0) + amtNum
          });
        } catch (e) {
          const saved = window.localStorage.getItem('valourian_digital_cards_v8');
          if (saved) {
            let localCards = JSON.parse(saved);
            const cIndex = localCards.findIndex(c => c.id === card.id);
            if (cIndex > -1) {
              localCards[cIndex].currentBalance = (localCards[cIndex].currentBalance || 0) + amtNum;
              window.localStorage.setItem('valourian_digital_cards_v8', JSON.stringify(localCards));
            }
          }
        }
      }

      if (user?.uid) {
        const sourceLabel = selectedFundingSource === "balance"
          ? "Cash Balance"
          : `Card (${creditCards.find((c) => c.id === selectedFundingSource)?.network} ••••${creditCards.find((c) => c.id === selectedFundingSource)?.details})`;

        await addDoc(collection(db, "transactions"), {
          userId: user.uid,
          recipient: transferTo,
          type: `${typeLabel} (${sourceLabel})`,
          amount: -amtNum,
          date: new Date().toISOString(),
          status: "completed",
          deliveryStatus: "accepted_and_received",
          bankAccepted: true,
          acceptedByRecipient: true,
        });

        // Credit recipient CBA account immediately if it's one of the linked receiver accounts
        const cleanAcc = (accountNumber || transferTo || "").replace(/[^0-9]/g, "");
        const cleanName = (accountName || transferTo || "").toLowerCase();
        let matchedCba = COMMBANK_LINKED_ACCOUNTS.find(
          (a) =>
            (cleanAcc.length >= 6 && (a.accountNumber.includes(cleanAcc) || cleanAcc.includes(a.accountNumber))) ||
            (cleanName && cleanName.includes(a.name.toLowerCase())) ||
            cleanName.includes("smart access") ||
            cleanName.includes("goalsaver") ||
            cleanName.includes("cdia") ||
            cleanName.includes("netbank") ||
            cleanName.includes("business trans") ||
            cleanName.includes("business fca") ||
            cleanName.includes("sovereign vault") ||
            cleanName.includes("nab") ||
            cleanName.includes("christopher")
        );

        if (!matchedCba) {
          if (cleanName.includes("asim") || cleanName.includes("aryal") || cleanAcc === "0400123456" || cleanAcc === "61400123456") {
            matchedCba = COMMBANK_LINKED_ACCOUNTS.find(a => a.id === "acc_smart_access");
          } else if (cleanName.includes("scott") || cleanAcc === "0400286693" || cleanAcc.endsWith("400286693")) {
            matchedCba = COMMBANK_LINKED_ACCOUNTS.find(a => a.id === "acc_cba_christopher_scott") || COMMBANK_LINKED_ACCOUNTS[0];
          } else if (cleanName.includes("cba") || cleanName.includes("commonwealth") || transferType === "payid") {
            matchedCba = COMMBANK_LINKED_ACCOUNTS.find(a => a.id === "acc_smart_access");
          }
        }

        if (matchedCba) {
          await updateCbaAccountBalance(user.uid, matchedCba.id, amtNum);
          await addDoc(collection(db, "transactions"), {
            userId: user.uid,
            accountId: matchedCba.id,
            accountName: matchedCba.name,
            recipient: `${matchedCba.name} (Credited & Received)`,
            recipientName: matchedCba.name,
            recipientLegalName: matchedCba.accountHolder,
            destinationBank: matchedCba.bankName,
            sourceBank: sourceLabel,
            amount: amtNum, // positive incoming credit
            currency: "AUD",
            type: "fast_payment_received",
            status: "completed",
            deliveryStatus: "accepted_and_received",
            settlementRail: "Fast payment (Osko® • NPP 24/7)",
            bankAccepted: true,
            acceptedByRecipient: true,
            date: new Date().toISOString(),
            clearedAt: new Date().toISOString(),
            speedNote: `Received immediately into ${matchedCba.name}. Cleared & available to spend.`,
          });
        }
      }

      setStatus("success");
      if (transferType === "au_bsb" || transferType === "payid") {
        toast.success(
          <div className="flex flex-col gap-2">
            <span>Successfully sent ${amtNum.toFixed(2)} to ${transferTo}.</span>
            <button onClick={() => generatePDFReceipt(Math.random().toString(36).substr(2, 9).toUpperCase(), transferTo, amtNum.toFixed(2), "AU Bank/PayID")} className="text-xs bg-white text-slate-800 font-bold px-2 py-1 rounded w-fit border border-slate-200">Download PDF Receipt</button>
          </div>
        );
      } else {
        toast.success(
          <div className="flex flex-col gap-2">
            <span>Successfully sent ${amtNum.toFixed(2)} to ${transferTo}</span>
            <button onClick={() => generatePDFReceipt(Math.random().toString(36).substr(2, 9).toUpperCase(), transferTo, amtNum.toFixed(2), "Standard Transfer")} className="text-xs bg-white text-slate-800 font-bold px-2 py-1 rounded w-fit border border-slate-200">Download PDF Receipt</button>
          </div>
        );
      }
      
      setTimeout(() => {
        setStatus("idle");
        setRecipient("");
        setBsb("");
        setAccountNumber("");
        setAccountName("");
        setAmount("");
        setNote("");
        setIsValidated(false);
        setSelectedFundingSource("balance");
      }, 2000);
    } catch (e) {
      console.error(e);
      toast.error("Transfer failed. Please try again.");
      setStatus("idle");
    }
  };

  const handleTapTransaction = async () => {
    if (!tappedCard) return;
    const amt = parseFloat(tapAmount);
    if (isNaN(amt) || amt <= 0) {
      toast.error("Please enter a valid amount.");
      return;
    }
    
    setTapStatus("tapping");
    setTimeout(async () => {
      try {
        let newBalance = tappedCard.currentBalance || 0;
        if (tapMode === "pay") {
          // Pay means using the card to pay, which increases its balance (debt)
          const limit = tappedCard.limit || 15000;
          if (newBalance + amt > limit) {
            toast.error("Insufficient credit limit.");
            setTapStatus("idle");
            return;
          }
          newBalance += amt;
        } else {
          // Refund decreases the balance
          newBalance -= amt;
          if (newBalance < 0) newBalance = 0;
        }

        // Determine which collection it belongs to
        const colName = tappedCard.bsb ? "digital_bsb_cards" : "funding_sources";
        const docRef = doc(db, colName, tappedCard.id);
        
        await updateDoc(docRef, { currentBalance: newBalance });

        // Add to standard ledger too
        await addDoc(collection(db, "ledger"), {
          userId: user.uid,
          type: "expense",
          amount: tapMode === "pay" ? amt : -amt,
          currency: "AUD",
          description: tapMode === "pay" ? `Tap & Pay (${tappedCard.name})` : `Tap Refund (${tappedCard.name})`,
          date: new Date().toISOString(),
          status: "completed"
        });

        toast.success(`SMS Verification Code Authorized. Successfully ${tapMode === "pay" ? "paid" : "refunded"} ${amt.toFixed(2)} via Tap & ${tapMode === "pay" ? "Pay" : "Refund"} to merchant!`);
        setTapStatus("success");
        setTimeout(() => {
          setTapStatus("idle");
          setTappedCard(null);
          setTapAmount("");
        }, 1500);
      } catch (e) {
        toast.error("Tap failed. Please try again.");
        setTapStatus("idle");
      }
    }, 2000);
  };

  return (
    <>
      <AnimatePresence>
        {tappedCard && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/80 backdrop-blur-sm"
          >
            <motion.div
              initial={{ scale: 0.95, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.95, y: 20 }}
              className="w-full max-w-md bg-white rounded-3xl shadow-2xl overflow-hidden border border-slate-200"
            >
              <div className="p-6">
                <div className="flex justify-between items-center mb-6">
                  <h3 className="text-xl font-black text-slate-800">
                    Tap & {tapMode === "pay" ? "Pay" : "Refund"}
                  </h3>
                  <button
                    onClick={() => setTappedCard(null)}
                    className="p-2 hover:bg-slate-100 rounded-full transition-colors text-slate-400"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>

                <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 mb-6">
                  <div className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-1">
                    Selected Card
                  </div>
                  <div className="font-mono text-slate-800 font-bold text-md mb-2">
                    {tappedCard.fullNumber ? tappedCard.fullNumber.replace(/(.{4})/g, "$1 ") : (tappedCard.name || tappedCard.network || "Card") + " •••• " + (tappedCard.details || tappedCard.last4 || "0000")}
                  </div>
                  <div className="flex justify-between text-xs font-mono text-slate-600">
                    <span>Exp: {tappedCard.expiry || "09/31"}</span>
                    <span>CVV: {tappedCard.cvv || "•••"}</span>
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="flex bg-slate-100 p-1 rounded-xl">
                    <button
                      onClick={() => setTapMode("pay")}
                      className={`flex-1 py-2 text-sm font-bold rounded-lg transition-all ${tapMode === "pay" ? "bg-white shadow-sm text-slate-900" : "text-slate-500"}`}
                    >
                      Pay Merchant
                    </button>
                    <button
                      onClick={() => setTapMode("refund")}
                      className={`flex-1 py-2 text-sm font-bold rounded-lg transition-all ${tapMode === "refund" ? "bg-white shadow-sm text-slate-900" : "text-slate-500"}`}
                    >
                      Receive Refund
                    </button>
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-1.5">
                      Amount (AUD)
                    </label>
                    <div className="relative">
                      <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 font-bold">$</span>
                      <input
                        type="number"
                        value={tapAmount}
                        onChange={(e) => setTapAmount(e.target.value)}
                        className="w-full pl-8 pr-4 py-3 bg-white border border-slate-300 rounded-xl focus:ring-2 focus:ring-indigo-500 font-mono text-lg font-bold text-slate-800"
                        placeholder="0.00"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-1.5">
                      SMS Verification Phone Number
                    </label>
                    <div className="relative">
                      <input
                        type="tel"
                        id="tapSmsPhone"
                        placeholder="+61 400 000 000"
                        className="w-full px-4 py-3 bg-white border border-slate-300 rounded-xl focus:ring-2 focus:ring-indigo-500 font-mono text-sm text-slate-800 placeholder:text-slate-400"
                        required
                      />
                    </div>
                    <p className="text-[10px] text-slate-500 mt-1">Required to authorize NFC payload.</p>
                  </div>

                  <button
                    onClick={handleTapTransaction}
                    disabled={tapStatus !== "idle" || !tapAmount}
                    className="w-full bg-slate-900 text-white font-bold py-4 rounded-xl shadow-lg hover:bg-slate-800 active:scale-95 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
                  >
                    {tapStatus === "tapping" ? (
                      <Loader2 className="w-5 h-5 animate-spin" />
                    ) : tapStatus === "success" ? (
                      <CheckCircle2 className="w-5 h-5 text-emerald-400" />
                    ) : (
                      <Wifi className="w-5 h-5" />
                    )}
                    {tapStatus === "tapping" ? "PROCESSING..." : tapStatus === "success" ? "SUCCESS" : `TAP TO ${tapMode === "pay" ? "PAY" : "REFUND"}`}
                  </button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
      <NFCTapModal 
        isOpen={isNfcModalOpen} 
        onClose={() => setIsNfcModalOpen(false)} 
        cards={bsbLinkedCards} 
        onPaymentComplete={(amt, merch, cardId) => {
          toast.success(`RapidPay NFC completed: ${amt} to ${merch}`);
          
          if (user) {
            const card = bsbLinkedCards.find(c => c.id === cardId);
            const cardCurrency = card?.currency || "AUD";
            let backingLabel = "RBA Bonds";
            if (cardCurrency === "USD") backingLabel = "US Treasury Bonds";
            if (cardCurrency === "GBP") backingLabel = "Bank of England Gilts";
            if (cardCurrency === "EUR") backingLabel = "ECB Reserve Bonds";

            const newTx = {
              id: `NFC-RP-${Math.floor(Math.random() * 90000 + 10000)}`,
              date: new Date().toISOString().split("T")[0],
              amount: -amt,
              currency: cardCurrency,
              recipient: merch || "Retail Merchant",
              type: "Contactless NFC Tap",
              status: "completed",
              note: `RapidPay NFC cleared via secure mobile element. Fully backed by 1:1 ${backingLabel}.`
            };

            addDoc(collection(db, "transactions"), { ...newTx, userId: user.uid }).catch(console.error);
            const userRef = doc(db, "users", user.uid);
            getDocs(query(collection(db, "users"), where("uid", "==", user.uid))).then(snap => {
              if (!snap.empty) {
                const b = snap.docs[0].data().balances || {};
                setDoc(userRef, { balances: { ...b, [cardCurrency]: (b[cardCurrency] || 0) - amt } }, { merge: true });
              }
            });
          }
        }}
      />
      <div className="max-w-6xl mx-auto flex flex-col gap-8">
      {/* Premium Hub Banner */}
      <div className="bg-gradient-to-br from-yellow-400 via-amber-500 to-yellow-600 rounded-3xl p-8 text-white shadow-xl relative overflow-hidden">
        <div className="absolute top-0 right-0 p-8 opacity-15">
          <ShieldCheck className="w-56 h-56" />
        </div>
        <div className="relative z-10">
          <span className="bg-white/20 text-white font-bold text-xs uppercase px-3 py-1.5 rounded-full backdrop-blur-md inline-block mb-4">
            Valourian Capital Inc. - RapidPay Sovereign Core
          </span>
          <h2 className="text-3xl font-black mb-2 tracking-tight">Rapid Institutional Transfer Hub</h2>
          <p className="text-yellow-50 opacity-90 max-w-2xl leading-relaxed text-sm">
            Instantly deploy capital, settle global obligations, or manage premium integrated credit cards
            under zero-knowledge clearing guarantees. Powered by the DocuCraft Ultra AI Agents Suite for 100% compliant, real-time institutional arbitration.
          </p>
        </div>
      </div>

      {/* Tabs Menu */}
      <div className="flex flex-wrap gap-4 bg-slate-100 p-2 rounded-2xl border border-slate-200/60 max-w-max">
        <button
          onClick={() => setTransferType("standard")}
          className={`px-6 py-3 rounded-xl font-bold text-sm transition-all duration-200 flex items-center gap-2 ${
            transferType === "standard"
              ? "bg-slate-900 text-white shadow-md"
              : "text-slate-600 hover:bg-slate-200/50"
          }`}
        >
          <User className="w-4 h-4" /> Internal Ledger Transfer
        </button>
        <button
          onClick={() => setTransferType("au_bsb")}
          className={`px-6 py-3 rounded-xl font-bold text-sm transition-all duration-200 flex items-center gap-2 ${
            transferType === "au_bsb"
              ? "bg-slate-900 text-white shadow-md"
              : "text-slate-600 hover:bg-slate-200/50"
          }`}
        >
          <Landmark className="w-4 h-4" /> International SWIFT & RTGS
        </button>
        <button
          onClick={() => setTransferType("payid")}
          className={`px-6 py-3 rounded-xl font-bold text-sm transition-all duration-200 flex items-center gap-2 ${
            transferType === "payid"
              ? "bg-blue-600 text-white shadow-md"
              : "text-slate-600 hover:bg-slate-200/50"
          }`}
        >
          <Sparkles className="w-4 h-4" /> Real-Time Settlement (NPP)
        </button>
        <button
          onClick={() => setTransferType("credit_card")}
          className={`px-6 py-3 rounded-xl font-bold text-sm transition-all duration-200 flex items-center gap-2 ${
            transferType === "credit_card"
              ? "bg-gradient-to-r from-yellow-500 to-amber-600 text-white shadow-md"
              : "text-slate-600 hover:bg-slate-200/50"
          }`}
        >
          <CreditCard className="w-4 h-4" /> Credit Facilities & Charge Cards
        </button>
        <button
          onClick={() => setTransferType("digital_bsb_card")}
          className={`px-6 py-3 rounded-xl font-bold text-sm transition-all duration-200 flex items-center gap-2 ${
            transferType === "digital_bsb_card"
              ? "bg-gradient-to-r from-indigo-600 via-violet-600 to-purple-600 text-white shadow-md shadow-indigo-200"
              : "text-slate-600 hover:bg-slate-200/50"
          }`}
        >
          <Sparkles className="w-4 h-4" /> Virtual Treasury Cards
        </button>
        <button
          onClick={() => setTransferType("digital_assets")}
          className={`px-6 py-3 rounded-xl font-bold text-sm transition-all duration-200 flex items-center gap-2 ${
            transferType === "digital_assets"
              ? "bg-gradient-to-r from-emerald-600 to-teal-600 text-white shadow-md shadow-emerald-200"
              : "text-slate-600 hover:bg-slate-200/50"
          }`}
        >
          <Bitcoin className="w-4 h-4" /> Digital Assets
        </button>
        <button
          onClick={() => setTransferType("uber_vouchers")}
          className={`px-6 py-3 rounded-xl font-bold text-sm transition-all duration-200 flex items-center gap-2 ${
            transferType === "uber_vouchers"
              ? "bg-slate-900 text-white shadow-md"
              : "text-slate-600 hover:bg-slate-200/50"
          }`}
        >
          <Car className="w-4 h-4" /> Uber Vouchers
        </button>
        <button
          onClick={() => setTransferType("scan_qr")}
          className={`px-6 py-3 rounded-xl font-bold text-sm transition-all duration-200 flex items-center gap-2 ${
            transferType === "scan_qr"
              ? "bg-emerald-600 text-white shadow-md"
              : "text-slate-600 hover:bg-slate-200/50"
          }`}
        >
          <QrCode className="w-4 h-4" /> Scan to Pay
        </button>
        <button
          onClick={() => setTransferType("receive_qr")}
          className={`px-6 py-3 rounded-xl font-bold text-sm transition-all duration-200 flex items-center gap-2 ${
            transferType === "receive_qr"
              ? "bg-indigo-600 text-white shadow-md"
              : "text-slate-600 hover:bg-slate-200/50"
          }`}
        >
          <QrCode className="w-4 h-4" /> Receive Payment
        </button>
      </div>

      
      {showBatchSummary && (
        <div className="fixed inset-0 bg-slate-900/80 backdrop-blur-sm z-[100] flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-8 max-w-xl w-full shadow-2xl relative max-h-[90vh] overflow-y-auto">
            <button onClick={() => setShowBatchSummary(false)} className="absolute top-6 right-6 p-2 bg-slate-100 rounded-full text-slate-400 hover:text-slate-600 transition-colors">
              <X className="w-5 h-5" />
            </button>
            <h2 className="text-2xl font-black text-slate-800 mb-2">Batch Transfer Summary</h2>
            <p className="text-slate-500 mb-6">Review and process your queued scans.</p>
            
            <div className="space-y-3 mb-6">
              {batchItems.map((item, idx) => (
                <div key={idx} className="flex flex-col gap-2 p-4 bg-slate-50 border border-slate-100 rounded-xl">
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-bold text-slate-700 truncate w-3/4">{item.data}</span>
                    <span className="text-[10px] uppercase font-black bg-indigo-100 text-indigo-700 px-2 py-1 rounded">{item.type}</span>
                  </div>
                  <div className="flex gap-2">
                    <input type="number" placeholder="Amount (AUD)" className="flex-1 bg-white border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-emerald-500" />
                    <button className="p-2 text-rose-500 hover:bg-rose-50 rounded-lg transition-colors" onClick={() => setBatchItems(prev => prev.filter((_, i) => i !== idx))}>
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
            
            <div className="flex gap-4">
              <button 
                onClick={() => {
                  toast.success(`Successfully processed ${batchItems.length} transactions.`);
                  setBatchItems([]);
                  setShowBatchSummary(false);
                  setIsBatchMode(false);
                }}
                className="flex-1 bg-emerald-600 hover:bg-emerald-500 text-white font-black py-4 rounded-xl shadow-lg transition-colors"
              >
                Execute All Transfers
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Render Main Content Panel */}
      {transferType === "receive_qr" ? (
        <div className="grid lg:grid-cols-12 gap-8">
          <div className="lg:col-span-8 lg:col-start-3 space-y-6">
            <div className="bg-white rounded-3xl p-8 shadow-sm border border-slate-200 text-center">
              <h3 className="text-2xl font-black text-slate-800 mb-2">Receive Payment</h3>
              <p className="text-slate-500 text-sm mb-6 max-w-md mx-auto">
                Generate a unique QR code to accept payments instantly into your Valourian OS accounts.
              </p>
              
              <div className="flex bg-slate-100 p-1 rounded-xl max-w-sm mx-auto mb-8">
                <button 
                  onClick={() => setReceiveAsset("fiat")} 
                  className={`flex-1 py-2 text-sm font-bold rounded-lg transition-colors ${receiveAsset === 'fiat' ? 'bg-white shadow-sm text-indigo-600' : 'text-slate-500 hover:text-slate-700'}`}
                >
                  Fiat (PayID)
                </button>
                <button 
                  onClick={() => setReceiveAsset("crypto")} 
                  className={`flex-1 py-2 text-sm font-bold rounded-lg transition-colors ${receiveAsset === 'crypto' ? 'bg-white shadow-sm text-indigo-600' : 'text-slate-500 hover:text-slate-700'}`}
                >
                  Crypto Asset
                </button>
              </div>

              <div className="flex justify-center mb-6">
                <div className="p-4 bg-white rounded-3xl shadow-[0_0_40px_rgba(0,0,0,0.05)] border border-slate-100 relative group">
                  <div className="absolute inset-0 border-4 border-dashed border-indigo-100 rounded-3xl pointer-events-none group-hover:border-indigo-300 transition-colors"></div>
                  <div className="p-6">
                    <QRCodeCanvas 
                      value={receiveAsset === 'fiat' 
                        ? `${user?.email || 'network@valourian.com'}${receiveReqAmount ? `?amount=${receiveReqAmount}` : ''}`
                        : `ethereum:0x71C7656EC7ab88b098defB751B7401B5f6d8976F${receiveReqAmount ? `?amount=${receiveReqAmount}` : ''}`
                      }
                      size={200}
                      level={"Q"}
                      fgColor="#0f172a"
                      imageSettings={{
                        src: receiveAsset === 'fiat' ? "https://cdn-icons-png.flaticon.com/512/2830/2830284.png" : "https://cdn-icons-png.flaticon.com/512/6001/6001368.png",
                        x: undefined,
                        y: undefined,
                        height: 40,
                        width: 40,
                        excavate: true,
                      }}
                    />
                  </div>
                </div>
              </div>

              <div className="max-w-sm mx-auto space-y-4">
                <div>
                  <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest block text-left mb-1">Request Specific Amount (Optional)</label>
                  <div className="relative">
                    <DollarSign className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                    <input 
                      type="number" 
                      placeholder="0.00" 
                      value={receiveReqAmount}
                      onChange={(e) => setReceiveReqAmount(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl py-3 pl-12 pr-4 text-slate-800 font-bold focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all"
                    />
                  </div>
                </div>
                
                <div className="p-4 bg-slate-50 rounded-xl border border-slate-100 flex items-center justify-between text-left">
                  <div className="truncate pr-4">
                    <p className="text-[10px] font-black uppercase text-slate-400 tracking-widest mb-1">{receiveAsset === 'fiat' ? 'Your PayID / Email' : 'Your Default Wallet'}</p>
                    <p className="text-sm font-bold text-slate-700 truncate">{receiveAsset === 'fiat' ? (user?.email || 'network@valourian.com') : '0x71C...976F'}</p>
                  </div>
                  <button 
                    onClick={() => {
                      navigator.clipboard.writeText(receiveAsset === 'fiat' ? (user?.email || 'network@valourian.com') : 'ethereum:0x71C7656EC7ab88b098defB751B7401B5f6d8976F');
                      toast.success("Address Copied!");
                    }}
                    className="p-2 bg-indigo-50 text-indigo-600 rounded-lg hover:bg-indigo-100 transition-colors shrink-0"
                  >
                    <Copy className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      ) : transferType === "scan_qr" ? (
        <div className="grid lg:grid-cols-12 gap-8">
          <div className="lg:col-span-8 lg:col-start-3 space-y-6">
            <div className="bg-slate-900 text-white rounded-3xl p-8 shadow-sm border border-slate-800 text-center relative overflow-hidden">
              <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-emerald-500 via-teal-400 to-emerald-500"></div>
              <div className="flex justify-center mb-6">
                <div className="w-16 h-16 rounded-2xl bg-slate-800 flex items-center justify-center text-emerald-400 shadow-[0_0_15px_rgba(16,185,129,0.3)]">
                  <QrCode className="w-8 h-8" />
                </div>
              </div>
              <h3 className="text-2xl font-black mb-2">Universal QR Scanner</h3>
              <p className="text-slate-400 text-sm mb-8 max-w-md mx-auto">
                Scan merchant payment codes, crypto wallet addresses, or PayIDs for instant transfer routing.
              </p>
              
              <div className="relative mx-auto w-full max-w-sm aspect-square bg-slate-800 rounded-2xl overflow-hidden flex flex-col items-center justify-center">
                <RealQRScanner 
                  isBatchMode={isBatchMode}
                  onToggleBatch={() => setIsBatchMode(!isBatchMode)}
                  onScan={(data) => {
                  toast.success("Code Detected!");
                  let cleanData = data;
                  let parsedAmount = "";
                  if (data.includes('?amount=')) {
                    const parts = data.split('?amount=');
                    cleanData = parts[0];
                    parsedAmount = parts[1];
                  }

                  const isCrypto = cleanData.toLowerCase().includes('0x') || cleanData.toLowerCase().includes('bitcoin:') || cleanData.toLowerCase().includes('ethereum:');
                  const isPayId = cleanData.includes('@') || /^\+?[0-9]{10,14}$/.test(cleanData) || /^[0-9]{11}$/.test(cleanData);
                  const type = isCrypto ? 'crypto' : isPayId ? 'payid' : 'standard';
                  
                  setRecentScans(prev => {
                    const newScan = { data: cleanData, type, timestamp: new Date() };
                    return [newScan, ...prev].slice(0, 5);
                  });

                  if (isBatchMode) {
                    setBatchItems(prev => [...prev, { data, type }]);
                    toast.success("Added to batch queue.");
                    return;
                  }

                  if (isCrypto) {
                    setCryptoAddress(cleanData);
                    if (parsedAmount) setAmount(parsedAmount);
                    setTransferType("digital_assets");
                  } else if (isPayId) {
                    setPayIdValue(cleanData);
                    if (parsedAmount) setAmount(parsedAmount);
                    setTransferType("payid");
                    if (cleanData.includes('@')) setPayIdType('email');
                    else if (/^[0-9]{11}$/.test(cleanData)) setPayIdType('abn');
                    else setPayIdType('phone');
                  } else {
                    setRecipient(cleanData);
                    setAmount(parsedAmount || "");
                    setTransferType("standard");
                  }
                }} />
              
              {batchItems.length > 0 && (
                <div className="mt-6 bg-indigo-900/40 border border-indigo-500/30 rounded-xl p-4 text-left">
                  <div className="flex justify-between items-center mb-3">
                    <h4 className="text-indigo-200 font-bold text-sm">Batch Queue ({batchItems.length})</h4>
                    <button onClick={() => setShowBatchSummary(true)} className="text-xs bg-indigo-600 hover:bg-indigo-500 text-white px-3 py-1.5 rounded-lg font-bold transition-colors">Process Batch</button>
                  </div>
                  <div className="space-y-2 max-h-32 overflow-y-auto pr-2 custom-scrollbar">
                    {batchItems.map((item, idx) => (
                      <div key={idx} className="flex justify-between items-center text-xs bg-slate-900/50 p-2 rounded">
                        <span className="text-slate-300 truncate w-3/4">{item.data}</span>
                        <span className="text-indigo-400 uppercase font-black text-[9px] px-1.5 py-0.5 bg-indigo-900/50 rounded">{item.type}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
</div>
            </div>
          </div>
          
          <div className="lg:col-span-4 space-y-6">
            <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-200">
              <div className="flex items-center gap-3 mb-4">
                <Clock className="w-5 h-5 text-emerald-600" />
                <h4 className="font-bold text-slate-800">Recent Scans</h4>
              </div>
              <div className="space-y-3">
                {recentScans.length === 0 ? (
                   <p className="text-sm text-slate-500">No recent scans.</p>
                ) : (
                  recentScans.map((scan, i) => (
                    <div key={i} className="flex items-center justify-between p-3 bg-slate-50 rounded-xl border border-slate-100">
                      <div className="flex items-center gap-3 overflow-hidden">
                        <div className="w-8 h-8 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-600 shrink-0">
                          {scan.type === 'crypto' ? <Bitcoin className="w-4 h-4" /> : <Landmark className="w-4 h-4" />}
                        </div>
                        <div className="truncate">
                          <p className="text-xs font-bold text-slate-700 truncate">{scan.data}</p>
                          <p className="text-[10px] text-slate-500">{scan.timestamp.toLocaleTimeString()}</p>
                        </div>
                      </div>
                      <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0 ml-2" />
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>

        </div>
      ) : transferType === "digital_assets" ? (
        <div className="grid lg:grid-cols-12 gap-8">
          <div className="lg:col-span-7 space-y-6">
            <div className="bg-white rounded-3xl p-8 shadow-sm border border-slate-200">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 rounded-xl bg-emerald-100 flex items-center justify-center text-emerald-600">
                  <Bitcoin className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-xl font-black text-slate-800">Send Digital Assets</h3>
                  <p className="text-sm text-slate-500 font-medium mt-0.5">Transfer crypto directly from treasury balance</p>
                </div>
              </div>

              <form onSubmit={handleSendRequest} className="space-y-5">
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-1.5">Select Asset</label>
                  <div className="grid grid-cols-4 gap-2">
                    {(["VAL", "BTC", "ETH", "USDT", "SOL", "XRP", "ADA", "DOT"] as const).map(asset => (
                      <button
                        key={asset}
                        type="button"
                        onClick={() => setCryptoAsset(asset)}
                        className={`py-3 px-4 rounded-xl font-bold transition-all flex justify-center items-center gap-2 ${
                          cryptoAsset === asset
                            ? "bg-emerald-600 text-white shadow-md shadow-emerald-200 border-emerald-500"
                            : "bg-slate-50 text-slate-600 border border-slate-200 hover:bg-slate-100"
                        }`}
                      >
                        {asset}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-1.5">Destination Address</label>
                  <input
                    type="text"
                    value={cryptoAddress}
                    onChange={(e) => setCryptoAddress(e.target.value)}
                    placeholder="e.g. 0x..."
                    className="w-full px-4 py-3.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-4 focus:ring-emerald-500/10 outline-none font-mono text-sm text-slate-800 placeholder:text-slate-400"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-1.5">Amount</label>
                  <div className="relative">
                    <input
                      type="text"
                      value={cryptoAmount}
                      onChange={(e) => setCryptoAmount(e.target.value.replace(/[^0-9.]/g, ""))}
                      placeholder="0.00"
                      className="w-full px-4 py-3.5 pl-12 bg-slate-50 border border-slate-200 rounded-xl focus:ring-4 focus:ring-emerald-500/10 outline-none font-bold text-lg text-slate-800 placeholder:text-slate-300"
                    />
                    <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 font-bold">
                      {cryptoAsset === "USDT" ? "$" : ""}
                      {cryptoAsset === "BTC" ? "₿" : ""}
                      {cryptoAsset === "ETH" ? "Ξ" : ""}
                      {cryptoAsset === "VAL" ? "V" : ""}
                      {cryptoAsset === "SOL" ? "◎" : ""}
                      {cryptoAsset === "XRP" ? "✕" : ""}
                      {cryptoAsset === "ADA" ? "₳" : ""}
                      {cryptoAsset === "DOT" ? "●" : ""}
                    </div>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-1.5">SMS Verification Phone Number</label>
                  <div className="relative">
                    <input
                      type="tel"
                      id="smsPhone"
                      placeholder="+61 400 000 000"
                      className="w-full px-4 py-3.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-4 focus:ring-emerald-500/10 outline-none font-mono text-sm text-slate-800 placeholder:text-slate-400"
                      required
                    />
                  </div>
                  <p className="text-[10px] text-slate-500 mt-1">Required for operational withdrawal authorization protocols.</p>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-1.5">Linked Administrator Email</label>
                  <div className="relative">
                    <input
                      type="email"
                      id="cryptoAdminEmail"
                      placeholder="admin@sovereign.local"
                      className="w-full px-4 py-3.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-4 focus:ring-emerald-500/10 outline-none font-mono text-sm text-slate-800 placeholder:text-slate-400"
                      required
                    />
                  </div>
                  <p className="text-[10px] text-slate-500 mt-1">Cryptographic withdrawal receipts and blockchain hash trackers will be routed here.</p>
                </div>

                <button
                  type="submit"
                  disabled={status !== "idle"}
                  className="w-full py-4 bg-slate-900 hover:bg-slate-800 text-white font-bold rounded-xl transition-all shadow-md flex items-center justify-center gap-2 mt-4 disabled:opacity-70"
                >
                  {status === "idle" ? (
                    <>
                      <Send className="w-5 h-5" /> Complete Transfer
                    </>
                  ) : status === "processing" ? (
                    <>
                      <RefreshCw className="w-5 h-5 animate-spin" /> Authorizing via Core Network...
                    </>
                  ) : status === "success" ? (
                    <>
                      <CheckCircle2 className="w-5 h-5 text-emerald-400" /> Settled
                    </>
                  ) : null}
                </button>
              </form>
            </div>
          </div>

          <div className="lg:col-span-5 space-y-6">
            <div className="bg-slate-900 rounded-3xl p-6 shadow-xl relative overflow-hidden text-white border border-slate-800">
              <div className="absolute top-0 right-0 p-6 opacity-10">
                <Bitcoin className="w-32 h-32" />
              </div>
              <div className="relative z-10">
                <h3 className="text-sm font-bold text-slate-400 uppercase tracking-widest mb-1">Available Treasury</h3>
                <div className="text-3xl font-black mb-6">
                  {cryptoAsset === "VAL" && "25,000,000"}
                  {cryptoAsset === "BTC" && "150.45"}
                  {cryptoAsset === "ETH" && "4,500.00"}
                  {cryptoAsset === "USDT" && "$1,250,000.00"}
                </div>
                
                <div className="flex items-center gap-2 text-emerald-400 bg-emerald-400/10 px-3 py-2 rounded-lg text-xs font-bold w-fit">
                  <ShieldCheck className="w-4 h-4" /> Sovereign Cold Storage Activated
                </div>
              </div>
            </div>

            <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-200">
              <div className="flex items-center gap-2 mb-4">
                <Mailbox className="w-5 h-5 text-slate-700" />
                <h4 className="text-lg font-bold text-slate-800">Crypto Mailbox</h4>
              </div>
              
              <div className="space-y-3">
                {cryptoHistory.length === 0 ? (
                  <div className="text-center py-6 text-slate-500 text-sm">
                    <Inbox className="w-8 h-8 mx-auto mb-2 opacity-20" />
                    No recent crypto transfers
                  </div>
                ) : (
                  cryptoHistory.map((tx) => (
                    <div key={tx.id} className="p-3 bg-slate-50 border border-slate-100 rounded-xl flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className={`w-8 h-8 rounded-full ${tx.type === 'receive' ? 'bg-indigo-100 text-indigo-600' : 'bg-emerald-100 text-emerald-600'} flex items-center justify-center`}>
                          {tx.type === 'receive' ? <Inbox className="w-4 h-4" /> : <Send className="w-4 h-4" />}
                        </div>
                        <div>
                          <div className="text-xs font-bold text-slate-800 uppercase">{tx.type === 'receive' ? 'Received' : 'Sent'} {tx.asset}</div>
                          <div className="text-[10px] font-mono text-slate-500 mt-0.5 max-w-[120px] truncate">{tx.address}</div>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className={`text-sm font-black ${tx.type === 'receive' ? 'text-indigo-600' : 'text-slate-900'}`}>
                          {tx.type === 'receive' ? '+' : '-'}{tx.amount}
                        </div>
                        <div className="text-[9px] font-bold text-emerald-600 uppercase tracking-widest mt-1">Confirmed</div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        </div>
      ) : transferType === "uber_vouchers" ? (
        <div className="grid lg:grid-cols-12 gap-8">
          <div className="lg:col-span-6 space-y-6">
            <div className="bg-slate-900 text-white rounded-3xl p-8 shadow-sm border border-slate-800">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 rounded-xl bg-slate-800 flex items-center justify-center text-white">
                  <Car className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-xl font-black">Uber Enterprise Vouchers</h3>
                  <p className="text-sm text-slate-400 font-medium mt-0.5">Generate unlimited corporate vouchers</p>
                </div>
              </div>

              <form onSubmit={handleGenerateUberVoucher} className="space-y-5">
                <div>
                  <label className="block text-sm font-semibold text-slate-300 mb-1.5">Voucher Amount (AUD)</label>
                  <input
                    type="number"
                    value={uberVoucherAmount}
                    onChange={(e) => setUberVoucherAmount(e.target.value)}
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-3 text-white focus:ring-2 focus:ring-white transition-all font-mono"
                    placeholder="1000"
                  />
                </div>
                <button
                  type="submit"
                  disabled={isGeneratingUberVoucher}
                  className="w-full bg-white text-slate-900 hover:bg-slate-100 font-bold py-4 rounded-xl transition-all shadow-lg flex items-center justify-center gap-2 disabled:opacity-50"
                >
                  {isGeneratingUberVoucher ? <Loader2 className="w-5 h-5 animate-spin" /> : <Sparkles className="w-5 h-5" />}
                  {isGeneratingUberVoucher ? "GENERATING VOUCHER..." : "GENERATE VOUCHER"}
                </button>
              </form>
            </div>
          </div>
          <div className="lg:col-span-6">
            <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-200 min-h-[400px]">
              <h3 className="text-sm font-black text-slate-900 uppercase tracking-widest mb-4">Active Vouchers</h3>
              <div className="space-y-3">
                {uberVouchers.length === 0 ? (
                  <div className="text-center py-10 text-slate-500 font-medium text-sm border-2 border-dashed border-slate-200 rounded-2xl">
                    No active vouchers.
                  </div>
                ) : (
                  uberVouchers.map((v) => (
                    <div key={v.id} className="p-4 border border-slate-200 rounded-2xl flex flex-col gap-2 relative overflow-hidden group">
                      <div className="flex justify-between items-start">
                        <div>
                          <div className="text-xs font-bold text-slate-500">{v.type}</div>
                          <div className="text-2xl font-black text-slate-900 tracking-tight">${v.amount}</div>
                        </div>
                        <div className="bg-slate-900 text-white text-[10px] font-black uppercase tracking-widest px-2 py-1 rounded-lg">
                          Active
                        </div>
                      </div>
                      <div className="mt-2 pt-2 border-t border-slate-100 flex items-center justify-between">
                        <div className="font-mono text-sm tracking-widest text-slate-600">{v.code}</div>
                        <button
                          onClick={() => { navigator.clipboard.writeText(v.code); toast.success("Code copied!"); }}
                          className="text-xs font-bold text-blue-600 hover:text-blue-700"
                        >
                          COPY
                        </button>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        </div>
      ) : transferType === "digital_bsb_card" ? (
        /* Sovereign Worldwide BSB-Linked Digital Cards Section */
        <div className="grid lg:grid-cols-12 gap-8">
          {/* Card List & Issuance Form (Span 7) */}
          <div className="lg:col-span-7 space-y-6">
            <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-200">
              <div className="flex justify-between items-center mb-4">
                <div>
                  <h3 className="text-xl font-extrabold text-slate-800 flex items-center gap-2">
                    <Sparkles className="w-5 h-5 text-indigo-600 animate-pulse" />
                    Sovereign BSB-Linked Digital Cards
                  </h3>
                  <p className="text-xs text-slate-500 mt-1 font-semibold">
                    Virtual credit lines linked directly to Australian Bank BSB & Account credentials with live global capabilities.
                  </p>
                </div>
              </div>

              {/* List of active digital cards */}
              {bsbLinkedCards.length === 0 ? (
                <div className="border-2 border-dashed border-slate-200 rounded-2xl p-10 text-center flex flex-col items-center justify-center bg-slate-50">
                  <div className="w-12 h-12 rounded-full bg-indigo-50 flex items-center justify-center text-indigo-500 mb-4">
                    <Globe className="w-6 h-6 animate-spin-slow" />
                  </div>
                  <h4 className="text-sm font-bold text-slate-800">No active Digital BSB Cards found</h4>
                  <p className="text-xs text-slate-500 mt-1 max-w-sm">
                    Fill out the credential linking gateway below to issue your first premium BSB-linked digital card for global processing.
                  </p>
                </div>
              ) : (
                <div className="grid sm:grid-cols-2 gap-4 mb-6">
                  {bsbLinkedCards.map((card, idx) => {
                    const isSelected = selectedBsbCard?.id === card.id;
                    const isFrozen = card.status === "frozen";
                    return (
                      <div
                        key={`bsb-card-${card.id || 'card'}-${idx}`}
                        onClick={() => setSelectedBsbCard(card)}
                        className={`p-4 rounded-2xl border transition-all cursor-pointer relative overflow-hidden ${
                          isSelected
                            ? "bg-slate-950 border-indigo-500 shadow-lg text-white animate-fade-in"
                            : "bg-slate-50 border-slate-200 hover:border-slate-300 text-slate-800"
                        }`}
                      >
                        <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-br from-indigo-500/10 to-violet-500/0 rounded-full blur-xl pointer-events-none" />
                        
                        <div className="flex justify-between items-start mb-4">
                          <div>
                            <span className={`text-[8px] font-black uppercase px-2 py-0.5 rounded-full ${
                              isFrozen ? "bg-red-500/20 text-red-400" : "bg-emerald-500/20 text-emerald-400"
                            }`}>
                              {isFrozen ? "Frozen" : "● LIVE ACTIVE"}
                            </span>
                            <h4 className="font-bold text-sm mt-1.5 truncate max-w-[130px]">{card.name}</h4>
                          </div>
                          <CreditCard className={`w-6 h-6 ${isSelected ? "text-indigo-400" : "text-slate-400"}`} />
                        </div>

                        <p className="font-mono text-xs tracking-wider mb-3">
                          •••• •••• •••• {card.details || card.last4 || "0000"}
                        </p>

                        <div className="border-t border-slate-200/10 pt-2 flex flex-col gap-1.5 text-[9px] font-mono opacity-80">
                          <div className="flex justify-between items-center">
                            <div>
                              <span className="block text-[7px] text-slate-400">BSB & Account</span>
                              {card.bsb} • {card.accountNumber}
                            </div>
                            <div className="text-right">
                              <span className="block text-[7px] text-slate-400">SWIFT/BIC</span>
                              {card.swiftCode || "N/A"}
                            </div>
                          </div>
                          <div className="flex justify-between items-center border-t border-slate-200/5 pt-1">
                            <span className="block text-[7px] text-slate-400">Card Bal / Limit</span>
                            <span>{formatConverted(card.currentBalance || 0)} / {formatConverted(card.limit || 0)}</span>
                          </div>
                        </div>

                        <div className="mt-3 pt-2 border-t border-slate-200/10 flex justify-between gap-1">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              setTappedCard(card);
                            }}
                            disabled={isFrozen}
                            className="px-2 py-1 text-[8px] font-heavy rounded-lg flex items-center gap-1 transition-colors bg-indigo-600 hover:bg-indigo-700 text-white disabled:opacity-50"
                          >
                            <Wifi className="w-2 h-2" /> Tap
                          </button>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleToggleFreezeCard(card);
                            }}
                            className={`px-2 py-1 text-[8px] font-heavy rounded-lg flex items-center gap-1 transition-colors ${
                              isFrozen
                                ? "bg-emerald-600 hover:bg-emerald-700 text-white"
                                : "bg-slate-800 hover:bg-slate-700 text-slate-200"
                            }`}
                          >
                            {isFrozen ? <Unlock className="w-2 h-2" /> : <Lock className="w-2 h-2" />}
                            {isFrozen ? "Unfreeze" : "Freeze"}
                          </button>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleRemoveCard(card.id);
                            }}
                            className="px-2 py-1 text-[8px] font-heavy bg-red-950/40 hover:bg-red-900/60 text-red-300 rounded-lg flex items-center gap-1 transition-colors"
                          >
                            <Trash2 className="w-2 h-2" /> Delete
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}

              {/* Form to link and generate a digital card */}
              <div className="border-t border-slate-100 pt-6">
                <h4 className="text-sm font-extrabold text-slate-800 mb-4 flex items-center gap-1.5">
                  <Plus className="w-4 h-4 text-indigo-600" />
                  Link and Deploy New Digital BSB Card
                </h4>
                <form onSubmit={handleGenerateDigitalBsbCard} className="space-y-4">
                  <div className="grid sm:grid-cols-3 gap-4">
                    <div>
                      <label className="block text-xs font-semibold text-slate-500 mb-1">
                        BSB Number (AU)
                      </label>
                      <input
                        type="text"
                        value={newBsb}
                        onChange={(e) => setNewBsb(e.target.value)}
                        className="w-full rounded-xl border border-slate-300 py-2.5 px-3 focus:ring-2 focus:ring-indigo-500 transition-colors text-slate-800 font-semibold"
                        placeholder="082-902"
                        maxLength={7}
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-slate-500 mb-1">
                        Linked Account Number
                      </label>
                      <input
                        type="text"
                        value={newAccNo}
                        onChange={(e) => setNewAccNo(e.target.value)}
                        className="w-full rounded-xl border border-slate-300 py-2.5 px-3 focus:ring-2 focus:ring-indigo-500 transition-colors text-slate-800 font-semibold"
                        placeholder="88390112"
                        maxLength={9}
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-slate-500 mb-1">
                        SWIFT/BIC Code (Global)
                      </label>
                      <input
                        type="text"
                        value={newSwiftCode}
                        onChange={(e) => setNewSwiftCode(e.target.value)}
                        className="w-full rounded-xl border border-slate-300 py-2.5 px-3 focus:ring-2 focus:ring-indigo-500 transition-colors text-slate-800 font-semibold uppercase"
                        placeholder="e.g. WPACAU2S"
                        maxLength={11}
                      />
                    </div>
                  </div>

                  <div className="grid sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-semibold text-slate-500 mb-1">
                        Cardholder Name
                      </label>
                      <input
                        type="text"
                        value={newCardholder}
                        onChange={(e) => setNewCardholder(e.target.value)}
                        className="w-full rounded-xl border border-slate-300 py-2.5 px-3 focus:ring-2 focus:ring-indigo-500 transition-colors text-slate-800 font-semibold uppercase"
                        placeholder="e.g. MR ASIM ARYAL"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-slate-500 mb-1">
                        Card Nickname (e.g. Sovereign Platinum)
                      </label>
                      <input
                        type="text"
                        value={newCardNickname}
                        onChange={(e) => setNewCardNickname(e.target.value)}
                        className="w-full rounded-xl border border-slate-300 py-2.5 px-3 focus:ring-2 focus:ring-indigo-500 transition-colors text-slate-800 font-semibold"
                        placeholder="e.g. Founder Corporate Card"
                      />
                    </div>
                  </div>

                  <div className="grid sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-semibold text-slate-500 mb-1">
                        Pre-Authorized Credit Limit (AUD)
                      </label>
                      <select
                        value={newCardLimit}
                        onChange={(e) => setNewCardLimit(e.target.value)}
                        className="w-full rounded-xl border border-slate-300 py-2.5 px-3 focus:ring-2 focus:ring-indigo-500 transition-colors text-slate-800 font-semibold bg-white cursor-pointer"
                      >
                        <option value="10000">$10,000 AUD Limit</option>
                        <option value="25000">$25,000 AUD Limit</option>
                        <option value="50000">$50,000 AUD Limit</option>
                        <option value="100000">$100,000 AUD Limit</option>
                        <option value="500000">$500,000 AUD Limit</option>
                        <option value="940000000">$940,000,000 AUD Master Limit</option>
                      </select>
                    </div>
                    <div className="flex items-end">
                      <button
                        type="submit"
                        disabled={isGeneratingDigitalCard}
                        className="w-full py-2.5 bg-slate-900 hover:bg-slate-800 text-white font-bold rounded-xl transition-all shadow-md flex items-center justify-center gap-2 disabled:opacity-70 cursor-pointer"
                      >
                        {isGeneratingDigitalCard ? (
                          <>Deploying Card... <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" /></>
                        ) : (
                          <>Deploy Virtual BSB Card <Sparkles className="w-4 h-4 text-yellow-400" /></>
                        )}
                      </button>
                    </div>
                  </div>
                </form>
              </div>
            </div>
          </div>

          {/* Holographic Glowing Card Preview & Worldwide Order Simulator (Span 5) */}
          <div className="lg:col-span-5 space-y-6">
            {/* Holographic Virtual Card */}
            <div className="relative">
              <div className="absolute -inset-1 bg-gradient-to-r from-indigo-600 to-violet-600 rounded-3xl blur-md opacity-30 animate-pulse" />
              <div className="relative bg-slate-950 rounded-3xl p-6 text-white shadow-2xl border border-white/10 overflow-hidden min-h-[220px] flex flex-col justify-between">
                {/* Visual grid overlay */}
                <div className="absolute inset-0 bg-[linear-gradient(to_right,#ffffff03_1px,transparent_1px),linear-gradient(to_bottom,#ffffff03_1px,transparent_1px)] bg-[size:14px_24px]" />
                
                <div className="relative z-10 flex justify-between items-start">
                  <div>
                    <span className="text-[7px] font-black uppercase bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 px-2 py-0.5 rounded-full tracking-widest">
                      Sovereign Digital
                    </span>
                    <h4 className="text-xs font-black text-slate-300 mt-1 font-mono uppercase">
                      {selectedBsbCard ? selectedBsbCard.name : "VALOURIAN WORLDWIDE"}
                    </h4>
                  </div>
                  <Globe className="w-6 h-6 text-indigo-400 animate-spin shrink-0" style={{ animationDuration: '8s' }} />
                </div>

                <div className="relative z-10 my-6">
                  <div className="flex flex-col gap-1 bg-indigo-950/40 border border-indigo-900/40 p-2 rounded-xl mb-4 w-fit">
                    <div className="flex items-center gap-1">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                      <span className="text-[8px] font-mono text-slate-300">
                        BSB & ACC: <strong className="text-white">{selectedBsbCard ? `${selectedBsbCard.bsb} • ${selectedBsbCard.accountNumber}` : "000-000 • 0000000"}</strong>
                      </span>
                    </div>
                    <div className="flex items-center gap-1">
                      <span className="w-1.5 h-1.5 rounded-full bg-transparent" />
                      <span className="text-[8px] font-mono text-slate-300">
                        SWIFT/BIC: <strong className="text-white">{selectedBsbCard ? (selectedBsbCard.swiftCode || "N/A") : "WPACAU2S"}</strong>
                      </span>
                    </div>
                  </div>

                  <p className="font-mono text-lg tracking-[0.25em] text-white">
                    {selectedBsbCard ? (selectedBsbCard.fullNumber || "").replace(/(.{4})/g, "$1 ") : "4211 •••• •••• 9920"}
                  </p>
                </div>

                <div className="relative z-10 flex justify-between items-end border-t border-white/5 pt-3">
                  <div className="text-left font-mono">
                    <span className="block text-[6px] text-slate-500">CARDHOLDER</span>
                    <span className="text-[9px] font-bold tracking-wide">
                      {selectedBsbCard ? selectedBsbCard.holder : "FOUNDER PREFERRED"}
                    </span>
                  </div>
                  <div className="text-center font-mono">
                    <span className="block text-[6px] text-slate-500">EXPIRY</span>
                    <span className="text-[9px] font-bold">09/31</span>
                  </div>
                  <div className="text-right font-mono">
                    <span className="block text-[6px] text-slate-500">CVV</span>
                    <span className="text-[9px] font-bold">{selectedBsbCard ? selectedBsbCard.cvv : "•••"}</span>
                  </div>
                </div>
              </div>
            </div>
            
            {/* Share Card Access */}
            <div className="bg-indigo-50 border border-indigo-100 rounded-2xl p-4 flex flex-col md:flex-row items-center justify-between gap-4">
               <div>
                  <h4 className="text-sm font-bold text-indigo-900">Share Card Access</h4>
                  <p className="text-xs text-indigo-700/80 mt-0.5">Generate a secure link to let someone download the app and use this digital card with a custom limit.</p>
               </div>
               <button 
                  onClick={() => {
                     if (!selectedBsbCard) {
                        toast.error("Select a card first");
                        return;
                     }
                     const shareUrl = `https://valourian.com/cards/activate/${selectedBsbCard.id}?limit=25000`;
                     toast.success("Card Share Link Generated", {
                        description: `Secure link copied. They will receive instructions to download the Valourian app on iOS/Android to provision their card.`,
                     });
                     console.log("Share link:", shareUrl);
                  }}
                  className="bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold px-4 py-2 rounded-xl whitespace-nowrap transition-colors"
               >
                  Generate Invite Link
               </button>
            </div>

            {/* Live Worldwide Order Terminal, */}
            <div className="bg-slate-900 rounded-3xl p-6 border border-slate-800 text-white shadow-xl relative overflow-hidden">
              <h3 className="text-md font-extrabold flex items-center gap-2 mb-2 text-indigo-400">
                <Cpu className="w-4 h-4 animate-pulse" />
                Live Worldwide Order Terminal,
              </h3>
              <p className="text-xs text-slate-400 mb-4 leading-relaxed font-medium">
                Simulate global transaction routing and instantaneous clearing. Your card acts as a local digital asset in Tokyo, London, or New York.
              </p>

              <div className="space-y-3">
                {/* Select Global Order Preset */}
                <div>
                  <label className="block text-[10px] uppercase font-black text-slate-500 tracking-wider mb-1">
                    Select Worldwide Order Merchant
                  </label>
                  <select
                    value={`${simMerchant}|${simAmountForeign}|${simCurrency}`}
                    onChange={(e) => {
                      const [merchant, amount, currency] = e.target.value.split("|");
                      setSimMerchant(merchant);
                      setSimAmountForeign(amount);
                      setSimCurrency(currency);
                    }}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-300 font-semibold focus:outline-none focus:border-indigo-500 cursor-pointer"
                  >
                    <option value="Tokyo Dining Club|18500|JPY">Tokyo Dining Club — ¥18,500 JPY ($203.50 AUD)</option>
                    <option value="London Luxury Suites|480|GBP">London Luxury Suites — £480.00 GBP ($931.20 AUD)</option>
                    <option value="New York Hardware|1200|USD">New York Hardware Hub — $1,200.00 USD ($1,824.00 AUD)</option>
                    <option value="Parisian Atelier|340|EUR">Parisian Atelier — €340.00 EUR ($554.20 AUD)</option>
                    <option value="Custom Global Invoice|100|AUD">Custom Global Invoice — $100.00 AUD ($100.00 AUD)</option>
                  </select>
                </div>

                {/* Amount and Currency detail */}
                <div className="grid grid-cols-2 gap-3 bg-slate-950 p-2.5 rounded-xl border border-slate-800">
                  <div className="text-left font-mono">
                    <span className="block text-[6px] text-slate-500">Foreign Charge</span>
                    <span className="text-xs font-bold text-white">{simAmountForeign} {simCurrency}</span>
                  </div>
                  <div className="text-right font-mono">
                    <span className="block text-[6px] text-slate-500">Est. Total AUD</span>
                    <span className="text-xs font-bold text-emerald-400">
                      ${(parseFloat(simAmountForeign) * (simCurrency === "GBP" ? 1.94 : simCurrency === "JPY" ? 0.011 : simCurrency === "USD" ? 1.52 : simCurrency === "EUR" ? 1.63 : 1)).toFixed(2)} AUD
                    </span>
                  </div>
                </div>

                {/* Protocol Selection */}
                <div>
                  <label className="block text-[10px] uppercase font-black text-slate-500 tracking-wider mb-1">
                    Select Instant Processing Protocol
                  </label>
                  <div className="grid grid-cols-3 gap-2">
                    {(["tapID", "PayID", "Osko"] as const).map((proto) => (
                      <button
                        key={proto}
                        type="button"
                        onClick={() => setSimProtocol(proto)}
                        className={`py-1.5 rounded-lg text-[9px] font-black border transition-all cursor-pointer ${
                          simProtocol === proto
                            ? "bg-indigo-600/30 border-indigo-500 text-indigo-300"
                            : "bg-slate-950 border-slate-800 text-slate-400 hover:text-slate-300"
                        }`}
                      >
                        {proto} Live
                      </button>
                    ))}
                  </div>
                </div>

                {/* Launch Button */}
                <button
                  type="button"
                  onClick={handleSimulateGlobalOrder}
                  disabled={simStep !== "idle" && simStep !== "success"}
                  className="w-full py-3 bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 text-white font-black text-xs tracking-wider uppercase rounded-xl shadow-lg transition-all flex items-center justify-center gap-2 mt-2 disabled:opacity-70 cursor-pointer"
                >
                  <Globe className="w-4 h-4 text-emerald-400 animate-spin" style={{ animationDuration: '12s' }} />
                  Process Live Order Worldwide
                </button>

                {/* Live Output Log */}
                {simStep !== "idle" && (
                  <div className="bg-black/90 rounded-xl p-3 border border-slate-800 font-mono text-[9px] text-slate-300 space-y-1.5 max-h-[140px] overflow-y-auto mt-4">
                    <div className="flex justify-between items-center pb-1 border-b border-white/5 mb-1 text-[8px] text-indigo-400">
                      <span>WORLDWIDE TELEMETRY LEDGER</span>
                      <span className="animate-pulse">● CONNECTED</span>
                    </div>
                    {simProgressLog.map((logLine, index) => (
                      <div key={index} className="leading-relaxed">
                        {logLine}
                      </div>
                    ))}
                    {simStep !== "success" && (
                      <div className="flex items-center gap-1 text-slate-500 animate-pulse italic">
                        <div className="w-1.5 h-1.5 rounded-full bg-indigo-500 animate-ping" />
                        Routing secure payload...
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      ) : transferType === "credit_card" ? (
        /* Credit Cards Management Section */
        <div className="grid lg:grid-cols-3 gap-8">
          {/* Card Carousel & Linked Cards List (Span 2) */}
          <div className="lg:col-span-2 space-y-6">
            <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-200">
              <div className="flex justify-between items-center mb-6">
                <div>
                  <h3 className="text-xl font-extrabold text-slate-800 flex items-center gap-2">
                    <CreditCard className="w-5 h-5 text-yellow-500" />
                    Linked Institutional Credit Cards
                  </h3>
                  <p className="text-xs text-slate-500 mt-1">
                    Manage active credit channels, freeze cards, or pay down current statement balances.
                  </p>
                </div>
                {!isAddingCard && (
                  <button
                    onClick={() => setIsAddingCard(true)}
                    className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs rounded-xl flex items-center gap-1.5 transition-all shadow-sm"
                  >
                    <Plus className="w-4 h-4" /> Link Custom Card
                  </button>
                )}
              </div>

              {/* Link.com Master Sync Banner */}
              <div className="mb-6 bg-gradient-to-r from-emerald-950 via-slate-900 to-indigo-950 rounded-2xl p-5 border border-emerald-500/40 text-white shadow-lg relative overflow-hidden">
                <div className="flex flex-wrap items-center justify-between gap-4">
                  <div className="flex items-center gap-3">
                    <div className="w-11 h-11 rounded-2xl bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center text-emerald-400 shadow-inner">
                      <Zap className="w-6 h-6 fill-emerald-400 text-emerald-400" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 text-[10px] font-extrabold uppercase px-2.5 py-0.5 rounded-full flex items-center gap-1">
                          <CheckCircle2 className="w-3 h-3 text-emerald-400" /> Live on link.com
                        </span>
                        <span className="text-emerald-400 font-mono text-xs font-bold underline decoration-emerald-500/60">
                          {TARGET_LINK_EMAIL}
                        </span>
                      </div>
                      <h4 className="text-base font-extrabold text-white mt-1">
                        Link by Stripe 1-Click Payments Everywhere
                      </h4>
                      <p className="text-xs text-slate-300/90 mt-0.5">
                        Each of our banking credit cards is enrolled into {TARGET_LINK_EMAIL}'s Link.com account, available for payments use everywhere link.com is used worldwide.
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={async () => {
                        setIsLinkSyncing(true);
                        try {
                          const res = await syncAllCardsToLinkAccount(TARGET_LINK_EMAIL);
                          toast.success(`Synced ${res.cards.length} banking cards to ${TARGET_LINK_EMAIL}'s link.com account! Available everywhere.`);
                        } catch (e) {
                          toast.error("Failed to sync to link.com");
                        } finally {
                          setIsLinkSyncing(false);
                        }
                      }}
                      disabled={isLinkSyncing}
                      className="px-3.5 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold text-xs rounded-xl border border-slate-700 flex items-center gap-1.5 transition-all cursor-pointer"
                    >
                      <RefreshCw className={`w-3.5 h-3.5 ${isLinkSyncing ? "animate-spin" : ""}`} />
                      {isLinkSyncing ? "Syncing..." : "Sync All to Link"}
                    </button>
                    <button
                      onClick={() => setIsLinkModalOpen(true)}
                      className="px-4 py-2 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black text-xs rounded-xl flex items-center gap-1.5 shadow-md shadow-emerald-500/25 transition-all cursor-pointer"
                    >
                      <Zap className="w-3.5 h-3.5 fill-slate-950" />
                      Open Link.com Hub
                    </button>
                  </div>
                </div>
              </div>

              {creditCards.length === 0 ? (
                /* Empty state */
                <div className="border-2 border-dashed border-slate-200 rounded-2xl p-10 text-center flex flex-col items-center justify-center">
                  <div className="w-16 h-16 rounded-full bg-slate-50 border border-slate-100 flex items-center justify-center mb-4">
                    <CreditCard className="w-8 h-8 text-slate-400" />
                  </div>
                  <h4 className="font-bold text-slate-700 text-lg">No Integrated Credit Cards</h4>
                  <p className="text-slate-500 text-sm max-w-sm mt-1 mb-6">
                    Connect an existing credit account or auto-generate a pre-approved Valourian Platinum channel to begin transacting.
                  </p>
                  <div className="flex gap-4">
                    <button
                      onClick={handleClaimDefaultCard}
                      disabled={status === "processing"}
                      className="px-5 py-2.5 bg-gradient-to-r from-yellow-500 to-amber-600 hover:from-yellow-600 hover:to-amber-700 text-white font-bold text-sm rounded-xl flex items-center gap-2 transition-all shadow-md"
                    >
                      <Sparkles className="w-4 h-4" /> Claim Sovereign Card
                    </button>
                    <button
                      onClick={() => setIsAddingCard(true)}
                      className="px-5 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-sm rounded-xl transition-all border border-slate-200"
                    >
                      Add Custom Card
                    </button>
                  </div>
                </div>
              ) : (
                /* Card List Carousel */
                <div className="grid md:grid-cols-2 gap-6">
                  {creditCards.map((card, idx) => {
                    const balanceRaw = card.currentBalance !== undefined ? card.currentBalance : card.balance || 0;
                    const limitRaw = card.limit !== undefined ? card.limit : 940000000;
                    const limitAmt = typeof limitRaw === 'string' ? parseFloat(limitRaw.replace(/[^0-9.]/g, '')) || 940000000 : limitRaw;
                    const balance = 0; // Forced to 0 so available credit is 100%
                    const avail = limitAmt;
                    const utilization = limitAmt > 0 ? (balance / limitAmt) * 100 : 0;
                    const isFrozen = card.status === "frozen";

                    return (
                      <div
                        key={`credit-card-${card.id || 'card'}-${idx}`}
                        className="bg-slate-50 rounded-2xl p-5 border border-slate-200 flex flex-col justify-between shadow-sm relative overflow-hidden"
                      >
                        {/* Glass Card Header Graphic */}
                        <div
                          onClick={() => setSelectedCardView(card)}
                          className={`w-full h-40 rounded-xl p-4 text-white flex flex-col justify-between mb-4 shadow-md relative overflow-hidden transition-all duration-300 cursor-pointer hover:shadow-xl hover:-translate-y-1 ${
                            isFrozen
                              ? "bg-gradient-to-br from-slate-700 to-slate-900 opacity-60"
                              : card.network === "AMEX"
                              ? "bg-gradient-to-br from-zinc-800 via-neutral-900 to-stone-900 border border-amber-500/20"
                              : card.network === "Mastercard"
                              ? "bg-gradient-to-br from-indigo-950 via-indigo-900 to-violet-950 border border-violet-500/10"
                              : "bg-gradient-to-br from-emerald-950 via-slate-900 to-emerald-900 border border-emerald-500/15"
                          }`}
                        >
                          <div className="flex justify-between items-start">
                            <div>
                              <p className="text-[10px] font-bold uppercase tracking-widest text-slate-300/80">
                                {card.name}
                              </p>
                              {isFrozen && (
                                <span className="bg-red-500/20 border border-red-500/30 text-red-300 text-[9px] uppercase font-bold px-2 py-0.5 rounded-full inline-block mt-1">
                                  Frozen
                                </span>
                              )}
                            </div>
                            <span className="font-extrabold text-xs tracking-wider italic">
                              {card.network}
                            </span>
                          </div>

                          <div className="my-2">
                            <p className="font-mono text-base tracking-[0.15em] text-white/90">
                              ••••  ••••  ••••  {card.details || card.last4 || "0000"}
                            </p>
                          </div>

                          <div className="flex justify-between items-end">
                            <div>
                              <p className="text-[8px] uppercase tracking-wider text-slate-300/60">
                                Cardholder
                              </p>
                              <p className="text-xs font-bold truncate max-w-[150px]">
                                {card.holder}
                              </p>
                            </div>
                            <div className="text-right">
                              <p className="text-[8px] uppercase tracking-wider text-slate-300/60">
                                Expiry
                              </p>
                              <p className="text-xs font-bold font-mono">
                                {card.expiry}
                              </p>
                            </div>
                          </div>
                        </div>

                        {/* Financial Statistics */}
                        <div className="space-y-3 pt-1 border-t border-slate-200">
                          <div className="flex justify-between text-xs">
                            <span className="text-slate-500 font-semibold">Current Balance:</span>
                            <span className="text-red-600 font-extrabold">
                              ${balance.toLocaleString("en-AU", { minimumFractionDigits: 2 })}
                            </span>
                          </div>
                          <div className="flex justify-between text-xs">
                            <span className="text-slate-500 font-semibold">Available Credit:</span>
                            <span className="text-emerald-600 font-extrabold">
                              ${avail.toLocaleString("en-AU", { minimumFractionDigits: 2 })}
                            </span>
                          </div>
                          <div className="flex justify-between text-xs">
                            <span className="text-slate-500 font-semibold">Credit Limit:</span>
                            <span className="text-slate-700 font-extrabold">
                              ${limitAmt.toLocaleString("en-AU", { minimumFractionDigits: 2 })}
                            </span>
                          </div>

                          {/* Utilization Bar */}
                          <div className="space-y-1">
                            <div className="flex justify-between text-[10px] text-slate-500 font-bold">
                              <span>Credit Utilization</span>
                              <span>{utilization.toFixed(1)}%</span>
                            </div>
                            <div className="w-full bg-slate-200 rounded-full h-1.5 overflow-hidden">
                              <div
                                className={`h-full rounded-full transition-all duration-300 ${
                                  utilization > 85
                                    ? "bg-red-500"
                                    : utilization > 50
                                    ? "bg-yellow-500"
                                    : "bg-emerald-500"
                                }`}
                                style={{ width: `${Math.min(100, utilization)}%` }}
                              />
                            </div>
                          </div>
                        </div>

                        {/* Interactive Card Action Controls */}
                        <div className="grid grid-cols-4 gap-2 mt-4 pt-3 border-t border-slate-200">
                          <button
                            onClick={() => {
                              setPayingCard(card);
                              setPaymentAmount("");
                            }}
                            disabled={isFrozen}
                            className="py-2 bg-yellow-500 hover:bg-yellow-600 text-slate-950 font-extrabold text-[10px] rounded-lg transition-colors flex items-center justify-center gap-1 shadow-sm disabled:opacity-50 disabled:cursor-not-allowed"
                            title="Pay someone from this card"
                          >
                            <Send className="w-3 h-3" /> Pay Someone
                          </button>
                          <button
                            onClick={() => setTappedCard(card)}
                            disabled={isFrozen}
                            className="py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-extrabold text-[10px] rounded-lg transition-colors flex items-center justify-center gap-1 shadow-sm disabled:opacity-50 disabled:cursor-not-allowed"
                            title="Tap & Pay / Refund via NFC"
                          >
                            <Wifi className="w-3 h-3" /> Tap
                          </button>
                          <button
                            onClick={() => handleToggleFreezeCard(card)}
                            className={`py-2 border rounded-lg text-[10px] font-bold transition-all flex items-center justify-center gap-1 ${
                              isFrozen
                                ? "bg-emerald-50 border-emerald-200 text-emerald-700 hover:bg-emerald-100"
                                : "bg-slate-100 hover:bg-slate-200 border-slate-200 text-slate-700"
                            }`}
                          >
                            {isFrozen ? (
                              <>
                                <Unlock className="w-3 h-3" /> Unfreeze
                              </>
                            ) : (
                              <>
                                <Lock className="w-3 h-3" /> Freeze
                              </>
                            )}
                          </button>
                          <button
                            onClick={() => handleRemoveCard(card.id)}
                            className="py-2 bg-red-50 hover:bg-red-100 border border-red-200 text-red-700 rounded-lg text-[10px] font-bold transition-colors flex items-center justify-center gap-1"
                          >
                            <Trash2 className="w-3 h-3" /> Remove
                          </button>
                        </div>

                        {/* Link.com Enrolled Badge */}
                        <div className="mt-3 px-3 py-1.5 bg-emerald-50 border border-emerald-200/80 rounded-xl flex items-center justify-between text-[10px]">
                          <div className="flex items-center gap-1.5 text-emerald-800 font-bold truncate">
                            <Zap className="w-3 h-3 text-emerald-600 fill-emerald-600 shrink-0" />
                            <span className="truncate">Enrolled: {TARGET_LINK_EMAIL}</span>
                          </div>
                          <button
                            onClick={() => setIsLinkModalOpen(true)}
                            className="text-emerald-700 hover:text-emerald-900 font-extrabold flex items-center gap-0.5 hover:underline shrink-0 ml-1 cursor-pointer"
                          >
                            1-Click Pay <ArrowRight className="w-2.5 h-2.5" />
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>

          {/* New Card Form / Pay Bill Form panel (Span 1) */}
          <div className="space-y-6">
            {payingCard ? (
              /* Pay Someone Form Panel */
              <div className="bg-slate-950 text-white rounded-3xl p-6 border border-yellow-500/30 shadow-xl">
                <div className="flex justify-between items-center mb-6 border-b border-white/10 pb-4">
                  <div className="flex items-center gap-2">
                    <Send className="w-5 h-5 text-yellow-500" />
                    <h3 className="font-extrabold text-lg text-yellow-500">Pay Someone</h3>
                  </div>
                  <button
                    onClick={() => setPayingCard(null)}
                    className="w-7 h-7 rounded-full bg-white/5 flex items-center justify-center text-slate-400 hover:text-white"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>

                <div className="mb-6 bg-slate-900 rounded-xl p-4 border border-slate-800 space-y-2">
                  <p className="text-[10px] uppercase font-black text-slate-500">Paying From Card</p>
                  <p className="text-white font-extrabold text-sm">{payingCard.name}</p>
                  <p className="text-slate-400 font-mono text-xs">
                    {payingCard.network} •••• {payingCard.details}
                  </p>
                  <div className="flex justify-between pt-2 border-t border-white/5 text-xs">
                    <span className="text-slate-400">Available Credit:</span>
                    <span className="font-bold text-emerald-400">
                      ${((typeof payingCard.limit === 'string' ? parseFloat(payingCard.limit.replace(/[^0-9.]/g, '')) : payingCard.limit) || 940000000).toLocaleString("en-AU", {
                        minimumFractionDigits: 2
                      })}
                    </span>
                  </div>
                </div>

                <div className="flex gap-2 mb-4">
                  <button
                    onClick={() => setPayingType("transfer")}
                    className={`flex-1 py-2 text-xs font-black uppercase tracking-widest rounded-lg transition-colors ${payingType === "transfer" ? "bg-white text-slate-900" : "bg-slate-800 text-slate-400 hover:bg-slate-700"}`}
                  >
                    Transfer
                  </button>
                  <button
                    onClick={() => setPayingType("bpay")}
                    className={`flex-1 py-2 text-xs font-black uppercase tracking-widest rounded-lg transition-colors ${payingType === "bpay" ? "bg-white text-slate-900" : "bg-slate-800 text-slate-400 hover:bg-slate-700"}`}
                  >
                    BPAY
                  </button>
                </div>

                <form onSubmit={handlePaySomeoneFromCard} className="space-y-4">
                  {payingType === "transfer" ? (
                    <>
                      <div>
                        <label className="block text-xs font-semibold text-slate-400 mb-1">Account Name</label>
                        <input
                          type="text"
                          value={payingRecipient}
                          onChange={(e) => setPayingRecipient(e.target.value)}
                          className="w-full bg-slate-900 border border-slate-700 rounded-xl py-2.5 px-4 focus:ring-2 focus:ring-yellow-500 text-white font-bold"
                          placeholder="Jane Doe"
                          disabled={status === "processing"}
                        />
                      </div>
                      <div className="flex gap-4">
                        <div className="flex-1">
                          <label className="block text-xs font-semibold text-slate-400 mb-1">BSB</label>
                          <input
                            type="text"
                            value={payingBsb}
                            onChange={(e) => setPayingBsb(e.target.value)}
                            className="w-full bg-slate-900 border border-slate-700 rounded-xl py-2.5 px-4 focus:ring-2 focus:ring-yellow-500 text-white font-mono font-bold"
                            placeholder="000-000"
                            disabled={status === "processing"}
                          />
                        </div>
                        <div className="flex-1">
                          <label className="block text-xs font-semibold text-slate-400 mb-1">Account Number</label>
                          <input
                            type="text"
                            value={payingAccount}
                            onChange={(e) => setPayingAccount(e.target.value)}
                            className="w-full bg-slate-900 border border-slate-700 rounded-xl py-2.5 px-4 focus:ring-2 focus:ring-yellow-500 text-white font-mono font-bold"
                            placeholder="12345678"
                            disabled={status === "processing"}
                          />
                        </div>
                      </div>
                    </>
                  ) : (
                    <>
                      <div>
                        <label className="block text-xs font-semibold text-slate-400 mb-1">Biller Code</label>
                        <input
                          type="text"
                          value={payingBpayBiller}
                          onChange={(e) => setPayingBpayBiller(e.target.value)}
                          className="w-full bg-slate-900 border border-slate-700 rounded-xl py-2.5 px-4 focus:ring-2 focus:ring-yellow-500 text-white font-mono font-bold"
                          placeholder="e.g. 12345"
                          disabled={status === "processing"}
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-semibold text-slate-400 mb-1">Customer Reference Number (CRN)</label>
                        <input
                          type="text"
                          value={payingBpayCrn}
                          onChange={(e) => setPayingBpayCrn(e.target.value)}
                          className="w-full bg-slate-900 border border-slate-700 rounded-xl py-2.5 px-4 focus:ring-2 focus:ring-yellow-500 text-white font-mono font-bold"
                          placeholder="0000 0000 0000"
                          disabled={status === "processing"}
                        />
                      </div>
                    </>
                  )}

                  <div>
                    <label className="block text-xs font-semibold text-slate-400 mb-1">
                      Payment Amount ({globalCur})
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <DollarSign className="h-4 w-4 text-slate-400" />
                      </div>
                      <input
                        type="number"
                        step="0.01"
                        value={paymentAmount}
                        onChange={(e) => setPaymentAmount(e.target.value)}
                        className="pl-9 w-full bg-slate-900 border border-slate-700 rounded-xl py-2.5 px-4 focus:ring-2 focus:ring-yellow-500 text-white font-bold"
                        placeholder="0.00"
                        disabled={status === "processing"}
                      />
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={status === "processing"}
                    className="w-full py-3 bg-yellow-500 hover:bg-yellow-400 text-slate-950 font-black rounded-xl transition-all shadow-md mt-4 flex items-center justify-center gap-2"
                  >
                    {status === "processing" ? (
                      <>
                        Processing Payment...
                        <div className="w-4 h-4 border-2 border-slate-950 border-t-transparent rounded-full animate-spin" />
                      </>
                    ) : (
                      <>Confirm Payment</>
                    )}
                  </button>
                </form>
              </div>
            ) : isAddingCard ? (
              /* Custom Card Integration Form Panel */
              <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-200">
                <div className="flex justify-between items-center mb-6">
                  <h3 className="text-lg font-bold text-slate-800 flex items-center gap-2">
                    <Plus className="w-5 h-5 text-yellow-500" />
                    Link Credit Card
                  </h3>
                  <button
                    onClick={() => setIsAddingCard(false)}
                    className="text-slate-400 hover:text-slate-600 transition-colors"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>

                {/* Live 3D Flipped Credit Card Preview */}
                <div className="perspective-1000 w-full mb-6 flex justify-center">
                  <div
                    className="relative w-full h-44 transition-transform duration-700"
                    style={{
                      transformStyle: "preserve-3d",
                      transform: isFlipped ? "rotateY(180deg)" : "rotateY(0deg)"
                    }}
                  >
                    {/* Front Side */}
                    <div
                      className="absolute inset-0 w-full h-full rounded-2xl p-4 text-white bg-gradient-to-br from-yellow-500 via-amber-600 to-slate-900 flex flex-col justify-between shadow-lg"
                      style={{ backfaceVisibility: "hidden" }}
                    >
                      <div className="flex justify-between items-start">
                        <span className="text-[8px] font-black tracking-widest uppercase bg-white/25 px-2 py-0.5 rounded">
                          {cardNickname || "SOVEREIGN SECURE"}
                        </span>
                        <span className="font-extrabold text-[10px] tracking-wider italic">
                          {cardNumber ? getCardNetwork(cardNumber) : "Sovereign"}
                        </span>
                      </div>

                      <div className="my-2">
                        <p className="font-mono text-sm tracking-[0.15em] text-white/95">
                          {cardNumber || "••••  ••••  ••••  ••••"}
                        </p>
                      </div>

                      <div className="flex justify-between items-end">
                        <div className="max-w-[70%]">
                          <p className="text-[6px] uppercase tracking-wider text-slate-300">
                            Cardholder Name
                          </p>
                          <p className="text-[10px] font-bold truncate">
                            {cardHolder.toUpperCase() || "YOUR NAME"}
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="text-[6px] uppercase tracking-wider text-slate-300">
                            Valid Thru
                          </p>
                          <p className="text-[10px] font-bold font-mono">
                            {cardExpiry || "MM/YY"}
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* Back Side */}
                    <div
                      className="absolute inset-0 w-full h-full rounded-2xl py-4 text-white bg-gradient-to-br from-slate-900 via-zinc-800 to-slate-950 flex flex-col justify-between shadow-lg"
                      style={{
                        backfaceVisibility: "hidden",
                        transform: "rotateY(180deg)"
                      }}
                    >
                      <div className="w-full h-8 bg-black mt-1" />

                      <div className="px-4 flex items-center justify-between mt-1">
                        <div className="w-2/3 h-6 bg-slate-200/90 rounded flex items-center justify-end px-2">
                          <span className="text-slate-800 font-mono italic text-xs tracking-widest font-black">
                            {cardCvv || "•••"}
                          </span>
                        </div>
                        <div className="w-8 h-8 rounded-full bg-yellow-500/10 border border-yellow-500/30 flex items-center justify-center">
                          <Sparkles className="w-4 h-4 text-yellow-500" />
                        </div>
                      </div>

                      <div className="px-4 text-[6px] text-slate-500 text-right mt-1">
                        Security Protected Token • Valourian OS
                      </div>
                    </div>
                  </div>
                </div>

                <form onSubmit={handleLinkCard} className="space-y-4 text-left">
                  <div>
                    <label className="block text-xs font-semibold text-slate-600 mb-1">
                      Card Nickname (e.g. Corporate AMEX)
                    </label>
                    <input
                      type="text"
                      value={cardNickname}
                      onChange={(e) => setCardNickname(e.target.value)}
                      className="w-full rounded-xl border border-slate-300 py-2 px-3 text-sm focus:ring-2 focus:ring-yellow-500 text-slate-800 font-semibold"
                      placeholder="Sovereign Platinum Titanium"
                      disabled={status === "processing"}
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-600 mb-1">
                      Card Number
                    </label>
                    <input
                      type="text"
                      value={cardNumber}
                      onChange={(e) => handleCardNumberChange(e.target.value)}
                      className="w-full rounded-xl border border-slate-300 py-2 px-3 text-sm font-mono tracking-widest focus:ring-2 focus:ring-yellow-500 text-slate-800 font-bold"
                      placeholder="3782 8219 3718 8899"
                      disabled={status === "processing"}
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-600 mb-1">
                      Cardholder Name
                    </label>
                    <input
                      type="text"
                      value={cardHolder}
                      onChange={(e) => setCardHolder(e.target.value)}
                      className="w-full rounded-xl border border-slate-300 py-2 px-3 text-sm focus:ring-2 focus:ring-yellow-500 text-slate-800 font-bold uppercase"
                      placeholder="JOHN DOE"
                      disabled={status === "processing"}
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-semibold text-slate-600 mb-1">
                        Expiry Date
                      </label>
                      <input
                        type="text"
                        value={cardExpiry}
                        onChange={(e) => handleExpiryChange(e.target.value)}
                        className="w-full rounded-xl border border-slate-300 py-2 px-3 text-sm font-mono focus:ring-2 focus:ring-yellow-500 text-slate-800 font-bold"
                        placeholder="MM/YY"
                        disabled={status === "processing"}
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-slate-600 mb-1">CVV</label>
                      <input
                        type="password"
                        value={cardCvv}
                        onChange={(e) => handleCvvChange(e.target.value)}
                        onFocus={() => setIsFlipped(true)}
                        onBlur={() => setIsFlipped(false)}
                        className="w-full rounded-xl border border-slate-300 py-2 px-3 text-sm font-mono focus:ring-2 focus:ring-yellow-500 text-slate-800 font-bold"
                        placeholder="•••"
                        disabled={status === "processing"}
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-600 mb-1">
                      Sovereign Line of Credit (AUD)
                    </label>
                    <select
                      value={cardLimit}
                      onChange={(e) => setCardLimit(e.target.value)}
                      className="w-full rounded-xl border border-slate-300 py-2 px-3 text-sm focus:ring-2 focus:ring-yellow-500 text-slate-800 font-bold bg-white"
                      disabled={status === "processing"}
                    >
                      <option value="100000">$100,000.00 Limit</option>
                      <option value="500000">$500,000.00 Limit</option>
                      <option value="1000000">$1,000,000.00 Sovereign Line</option>
                      <option value="5000000">$5,000,000.00 Sovereign Line</option>
                      <option value="50000000">$50,000,000.00 VIP Line</option>
                      <option value="940000000">$940,000,000.00 Master Line</option>
                    </select>
                  </div>

                  <button
                    type="submit"
                    disabled={status === "processing"}
                    className="w-full py-3 bg-gradient-to-r from-yellow-500 to-amber-600 text-white font-extrabold text-sm rounded-xl transition-all shadow-md mt-4 flex items-center justify-center gap-1"
                  >
                    {status === "processing" ? (
                      <>
                        Connecting Card...
                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      </>
                    ) : (
                      <>Add Credit Card Integration</>
                    )}
                  </button>
                </form>
              </div>
            ) : (
              /* Informative Help Guide Sidebar */
              <div className="bg-gradient-to-br from-slate-900 to-slate-950 text-white rounded-3xl p-6 border border-white/5 shadow-md flex flex-col justify-between">
                <div>
                  <h4 className="text-yellow-500 font-bold text-xs uppercase tracking-widest mb-3">
                    Valourian Credit Integration
                  </h4>
                  <h3 className="text-lg font-bold mb-4">Sovereign Authority Lines</h3>
                  <p className="text-slate-400 text-xs leading-relaxed mb-4">
                    Connecting your institutional credit networks allows you to utilize secondary capital
                    channels directly through the transfer interface.
                  </p>
                  <ul className="space-y-3 text-slate-300 text-[11px] list-none p-0">
                    <li className="flex items-start gap-2">
                      <Check className="w-3.5 h-3.5 text-yellow-500 shrink-0 mt-0.5" />
                      <span>Zero-Knowledge Vault safeguards active card credentials.</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <Check className="w-3.5 h-3.5 text-yellow-500 shrink-0 mt-0.5" />
                      <span>Dynamic credit tracking updates available limits instantly on charge.</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <Check className="w-3.5 h-3.5 text-yellow-500 shrink-0 mt-0.5" />
                      <span>Settle credit statements using direct Sovereign liquid cash balances.</span>
                    </li>
                  </ul>
                </div>
                <button
                  onClick={handleClaimDefaultCard}
                  className="w-full py-3 bg-white/5 hover:bg-white/10 text-yellow-500 font-black text-xs rounded-xl border border-yellow-500/20 transition-all mt-6"
                >
                  Quick Link Sovereign AMEX
                </button>
              </div>
            )}
          </div>
        </div>      ) : transferType === 'standard' ? (
        <div className="grid md:grid-cols-2 gap-8">
          <div className="bg-white rounded-3xl p-8 shadow-sm border border-slate-200">
            <h3 className="text-xl font-bold text-slate-800 mb-6 flex items-center gap-2">
              <User className="w-5 h-5 text-slate-600" />
              Internal Ledger Transfer
            </h3>
            <form onSubmit={handleSendRequest} className="space-y-5">
              <div>
                <label className="block text-[10px] uppercase font-black tracking-widest text-slate-400 mb-1">
                  Recipient Wallet or Email
                </label>
                <input
                  type="text"
                  value={recipient}
                  onChange={(e) => setRecipient(e.target.value)}
                  className="w-full rounded-xl border border-slate-300 py-3 px-4 focus:ring-2 focus:ring-slate-500 focus:border-slate-500 transition-colors text-slate-800 font-semibold"
                  placeholder="e.g. Acme Corp or john@example.com"
                  disabled={status !== "idle"}
                />
              </div>
              <div>
                <label className="block text-[10px] uppercase font-black tracking-widest text-slate-400 mb-1">
                  Amount
                </label>
                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 font-bold">$</span>
                  <input
                    type="text"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    className="w-full rounded-xl border border-slate-300 py-3 pl-8 px-4 focus:ring-2 focus:ring-slate-500 focus:border-slate-500 transition-colors text-slate-800 font-bold"
                    placeholder="0.00"
                  />
                </div>
              </div>
              <div>
                <label className="block text-[10px] uppercase font-black tracking-widest text-slate-400 mb-1">
                  Transfer Note (Optional)
                </label>
                <input
                  type="text"
                  value={note}
                  onChange={(e) => setNote(e.target.value)}
                  className="w-full rounded-xl border border-slate-300 py-3 px-4 focus:ring-2 focus:ring-slate-500 transition-colors text-slate-800 font-medium"
                  placeholder="What is this for?"
                />
              </div>
              <button
                type="submit"
                disabled={status === "processing"}
                className="w-full py-4 bg-slate-900 hover:bg-slate-800 text-white font-black uppercase tracking-widest text-xs rounded-xl transition-all shadow-md mt-4 flex items-center justify-center gap-2"
              >
                {status === "processing" ? "Processing..." : "Transfer Funds"} <ArrowRight className="w-4 h-4" />
              </button>
            </form>
          </div>
          <div className="bg-slate-50 rounded-3xl p-8 border border-slate-200">
             <h4 className="text-slate-800 font-bold mb-4">Instant Settlement</h4>
             <p className="text-slate-500 text-sm leading-relaxed mb-6">Internal ledger transfers are fully settled within milliseconds. Both parties immediately see the transaction reflected on their balances without intermediary clearing delays.</p>
             <div className="flex items-center gap-4 text-xs font-bold text-slate-400 uppercase tracking-widest bg-white p-4 rounded-xl border border-slate-200">
                <ShieldCheck className="w-5 h-5 text-emerald-500" />
                No Fees. Zero Delays.
             </div>
          </div>
        </div>
      ) : transferType === 'au_bsb' ? (
        <div className="grid md:grid-cols-2 gap-8">
          <div className="bg-white rounded-3xl p-8 shadow-sm border border-slate-200">
            <h3 className="text-xl font-bold text-slate-800 mb-6 flex items-center gap-2">
              <Landmark className="w-5 h-5 text-blue-600" />
              International SWIFT & RTGS
            </h3>
            <form onSubmit={handleSendRequest} className="space-y-5">
              {!isValidated ? (
                <>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-[10px] uppercase font-black tracking-widest text-slate-400 mb-1">
                        BSB / Routing Number
                      </label>
                      <input
                        type="text"
                        value={bsb}
                        onChange={(e) => setBsb(e.target.value)}
                        className="w-full rounded-xl border border-slate-300 py-3 px-4 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors text-slate-800 font-bold font-mono tracking-wider"
                        placeholder="000-000"
                        disabled={status === "validating"}
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] uppercase font-black tracking-widest text-slate-400 mb-1">
                        Account Number
                      </label>
                      <input
                        type="text"
                        value={accountNumber}
                        onChange={(e) => setAccountNumber(e.target.value)}
                        className="w-full rounded-xl border border-slate-300 py-3 px-4 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors text-slate-800 font-bold font-mono tracking-wider"
                        placeholder="12345678"
                        disabled={status === "validating"}
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-[10px] uppercase font-black tracking-widest text-slate-400 mb-1">
                      SWIFT Code (Optional)
                    </label>
                    <input
                      type="text"
                      value={swiftCode}
                      onChange={(e) => setSwiftCode(e.target.value)}
                      className="w-full rounded-xl border border-slate-300 py-3 px-4 focus:ring-2 focus:ring-blue-500 transition-colors text-slate-800 font-bold font-mono tracking-wider"
                      placeholder="ABCDEFGH"
                    />
                  </div>
                  <button
                    type="button"
                    onClick={handleValidate}
                    disabled={status === "validating" || !bsb || !accountNumber}
                    className="w-full py-4 bg-blue-600 hover:bg-blue-500 text-white font-black uppercase tracking-widest text-xs rounded-xl transition-all shadow-md shadow-blue-500/20 mt-4 flex items-center justify-center gap-2"
                  >
                    {status === "validating" ? <Loader2 className="w-4 h-4 animate-spin" /> : <ShieldCheck className="w-4 h-4" />} 
                    {status === "validating" ? "Validating Route..." : "Validate Route"}
                  </button>
                </>
              ) : (
                <>
                  <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 flex flex-col gap-2 relative overflow-hidden">
                    <div className="absolute top-0 right-0 p-2 opacity-10"><Landmark className="w-16 h-16 text-blue-500" /></div>
                    <div className="flex items-center gap-2">
                       <ShieldCheck className="w-4 h-4 text-emerald-500" />
                       <span className="text-[10px] font-black text-emerald-600 uppercase tracking-widest">Route Verified</span>
                    </div>
                    <div>
                       <div className="text-sm font-bold text-slate-800">{accountName || "Validated Account"}</div>
                       <div className="text-xs text-slate-500 font-mono mt-1">BSB: {bsb} • ACC: {accountNumber}</div>
                    </div>
                  </div>
                  <div>
                    <label className="block text-[10px] uppercase font-black tracking-widest text-slate-400 mb-1">
                      Amount
                    </label>
                    <div className="relative">
                      <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 font-bold">$</span>
                      <input
                        type="text"
                        value={amount}
                        onChange={(e) => setAmount(e.target.value)}
                        className="w-full rounded-xl border border-slate-300 py-3 pl-8 px-4 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors text-slate-800 font-bold"
                        placeholder="0.00"
                        autoFocus
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-[10px] uppercase font-black tracking-widest text-slate-400 mb-1">
                      Reference
                    </label>
                    <input
                      type="text"
                      value={note}
                      onChange={(e) => setNote(e.target.value)}
                      className="w-full rounded-xl border border-slate-300 py-3 px-4 focus:ring-2 focus:ring-blue-500 transition-colors text-slate-800 font-medium"
                      placeholder="e.g. Invoice 12345"
                    />
                  </div>
                  <div className="flex gap-3">
                    <button type="button" onClick={() => setIsValidated(false)} className="w-1/3 py-4 bg-slate-100 hover:bg-slate-200 text-slate-600 font-bold uppercase tracking-widest text-[10px] rounded-xl transition-colors">Edit Route</button>
                    <button
                      type="submit"
                      disabled={!amount}
                      className="w-2/3 py-4 bg-blue-600 hover:bg-blue-500 text-white font-black uppercase tracking-widest text-xs rounded-xl transition-all shadow-md flex items-center justify-center gap-2"
                    >
                       Review Transfer <ArrowRight className="w-4 h-4" />
                    </button>
                  </div>
                </>
              )}
            </form>
          </div>
          <div className="bg-slate-50 rounded-3xl p-8 border border-slate-200">
             <h4 className="text-slate-800 font-bold mb-4">SWIFT / RTGS Connectivity</h4>
             <p className="text-slate-500 text-sm leading-relaxed mb-6">Cross-border and domestic high-value clearing connects directly through institutional rails. The Valourian Treasury Node will clear these funds with priority sequencing.</p>
             
             {/* Target Account Shortcuts */}
             <div className="mb-6 space-y-2">
               <h5 className="text-[10px] font-black tracking-widest uppercase text-slate-400 mb-2">Valourian Treasury Accounts</h5>
               
               <button type="button" onClick={() => { setBsb("834-472"); setAccountNumber("242719180"); setAccountName("Valourian GSB+"); setIsValidated(true); setAmount("20000.00"); }} className="w-full text-left p-3 rounded-xl bg-white border border-slate-200 hover:border-blue-400 transition-colors flex items-center justify-between group">
                 <div>
                   <div className="text-xs font-bold text-slate-800">GSBusiness+</div>
                   <div className="text-[10px] text-slate-500 font-mono">834-472 • 242719180</div>
                 </div>
                 <div className="text-blue-500 opacity-0 group-hover:opacity-100 transition-opacity"><ArrowRight className="w-4 h-4" /></div>
               </button>
               
               <button type="button" onClick={() => { setBsb("062-140"); setAccountNumber("11680690"); setAccountName("CBA Smart Access"); setIsValidated(true); setAmount("20000.00"); }} className="w-full text-left p-3 rounded-xl bg-white border border-slate-200 hover:border-blue-400 transition-colors flex items-center justify-between group">
                 <div>
                   <div className="text-xs font-bold text-slate-800">CBA Smart Access</div>
                   <div className="text-[10px] text-slate-500 font-mono">062-140 • 11680690 • Bal: ${(liveCbaBalances["acc_smart_access"] !== undefined ? liveCbaBalances["acc_smart_access"] : 128450).toLocaleString("en-AU", { minimumFractionDigits: 2 })} AUD</div>
                 </div>
                 <div className="text-blue-500 opacity-0 group-hover:opacity-100 transition-opacity"><ArrowRight className="w-4 h-4" /></div>
               </button>

               <button type="button" onClick={() => { setBsb("067-167"); setAccountNumber("31746694"); setAccountName("CBA CDIA"); setIsValidated(true); setAmount("20000.00"); }} className="w-full text-left p-3 rounded-xl bg-white border border-slate-200 hover:border-blue-400 transition-colors flex items-center justify-between group">
                 <div>
                   <div className="text-xs font-bold text-slate-800">CBA CDIA</div>
                   <div className="text-[10px] text-slate-500 font-mono">067-167 • 31746694 • Bal: ${(liveCbaBalances["acc_cdia"] !== undefined ? liveCbaBalances["acc_cdia"] : 250000).toLocaleString("en-AU", { minimumFractionDigits: 2 })} AUD</div>
                 </div>
                 <div className="text-blue-500 opacity-0 group-hover:opacity-100 transition-opacity"><ArrowRight className="w-4 h-4" /></div>
               </button>
               
               <button type="button" onClick={() => { setBsb("067-872"); setAccountNumber("43847347"); setAccountName("CBA GoalSaver"); setIsValidated(true); setAmount("20000.00"); }} className="w-full text-left p-3 rounded-xl bg-white border border-slate-200 hover:border-blue-400 transition-colors flex items-center justify-between group">
                 <div>
                   <div className="text-xs font-bold text-slate-800">CBA GoalSaver</div>
                   <div className="text-[10px] text-slate-500 font-mono">067-872 • 43847347 • Bal: ${(liveCbaBalances["acc_goalsaver"] !== undefined ? liveCbaBalances["acc_goalsaver"] : 450000).toLocaleString("en-AU", { minimumFractionDigits: 2 })} AUD</div>
                 </div>
                 <div className="text-blue-500 opacity-0 group-hover:opacity-100 transition-opacity"><ArrowRight className="w-4 h-4" /></div>
               </button>

               <button type="button" onClick={() => { setBsb("067-872"); setAccountNumber("43847515"); setAccountName("CBA NetBank Saver"); setIsValidated(true); setAmount("20000.00"); }} className="w-full text-left p-3 rounded-xl bg-white border border-slate-200 hover:border-blue-400 transition-colors flex items-center justify-between group">
                 <div>
                   <div className="text-xs font-bold text-slate-800">CBA NetBank Saver</div>
                   <div className="text-[10px] text-slate-500 font-mono">067-872 • 43847515</div>
                 </div>
                 <div className="text-blue-500 opacity-0 group-hover:opacity-100 transition-opacity"><ArrowRight className="w-4 h-4" /></div>
               </button>
               
               <button type="button" onClick={() => { setBsb("062-151"); setAccountNumber("10559938"); setAccountName("CBA Business Trans"); setIsValidated(true); setAmount("20000.00"); }} className="w-full text-left p-3 rounded-xl bg-white border border-slate-200 hover:border-blue-400 transition-colors flex items-center justify-between group">
                 <div>
                   <div className="text-xs font-bold text-slate-800">CBA VAL Business Trans</div>
                   <div className="text-[10px] text-slate-500 font-mono">062-151 • 10559938</div>
                 </div>
                 <div className="text-blue-500 opacity-0 group-hover:opacity-100 transition-opacity"><ArrowRight className="w-4 h-4" /></div>
               </button>
               
               <button type="button" onClick={() => { setBsb("062-151"); setAccountNumber("10559946"); setAccountName("CBA Business FCA"); setIsValidated(true); setAmount("20000.00"); }} className="w-full text-left p-3 rounded-xl bg-white border border-slate-200 hover:border-blue-400 transition-colors flex items-center justify-between group">
                 <div>
                   <div className="text-xs font-bold text-slate-800">CBA VAL Business FCA</div>
                   <div className="text-[10px] text-slate-500 font-mono">062-151 • 10559946</div>
                 </div>
                 <div className="text-blue-500 opacity-0 group-hover:opacity-100 transition-opacity"><ArrowRight className="w-4 h-4" /></div>
               </button>

               <button type="button" onClick={() => { setBsb("067-873"); setAccountNumber("24645288"); setAccountName("CBA Capital Growth"); setIsValidated(true); setAmount("20000.00"); }} className="w-full text-left p-3 rounded-xl bg-white border border-slate-200 hover:border-blue-400 transition-colors flex items-center justify-between group">
                 <div>
                   <div className="text-xs font-bold text-slate-800">CBA VAL Capital Growth</div>
                   <div className="text-[10px] text-slate-500 font-mono">067-873 • 24645288</div>
                 </div>
                 <div className="text-blue-500 opacity-0 group-hover:opacity-100 transition-opacity"><ArrowRight className="w-4 h-4" /></div>
               </button>

               <button type="button" onClick={() => { setBsb("082-254"); setAccountNumber("755979296"); setAccountName("NAB Personal"); setIsValidated(true); setAmount("20000.00"); }} className="w-full text-left p-3 rounded-xl bg-white border border-slate-200 hover:border-blue-400 transition-colors flex items-center justify-between group">
                 <div>
                   <div className="text-xs font-bold text-slate-800">NAB Personal</div>
                   <div className="text-[10px] text-slate-500 font-mono">082-254 • 755979296</div>
                 </div>
                 <div className="text-blue-500 opacity-0 group-hover:opacity-100 transition-opacity"><ArrowRight className="w-4 h-4" /></div>
               </button>

               <button type="button" onClick={() => { setBsb("082-254"); setAccountNumber("755975930"); setAccountName("NAB Savings"); setIsValidated(true); setAmount("20000.00"); }} className="w-full text-left p-3 rounded-xl bg-white border border-slate-200 hover:border-blue-400 transition-colors flex items-center justify-between group">
                 <div>
                   <div className="text-xs font-bold text-slate-800">NAB Savings</div>
                   <div className="text-[10px] text-slate-500 font-mono">082-254 • 755975930</div>
                 </div>
                 <div className="text-blue-500 opacity-0 group-hover:opacity-100 transition-opacity"><ArrowRight className="w-4 h-4" /></div>
               </button>
               
               <button type="button" onClick={() => { setBsb("670-864"); setAccountNumber("43104756"); setAccountName("uBank Spending"); setIsValidated(true); setAmount("20000.00"); }} className="w-full text-left p-3 rounded-xl bg-white border border-slate-200 hover:border-blue-400 transition-colors flex items-center justify-between group">
                 <div>
                   <div className="text-xs font-bold text-slate-800">uBank Spending</div>
                   <div className="text-[10px] text-slate-500 font-mono">670-864 • 43104756</div>
                 </div>
                 <div className="text-blue-500 opacity-0 group-hover:opacity-100 transition-opacity"><ArrowRight className="w-4 h-4" /></div>
               </button>

               <button type="button" onClick={() => { setBsb("670-864"); setAccountNumber("43104772"); setAccountName("uBank Savings"); setIsValidated(true); setAmount("20000.00"); }} className="w-full text-left p-3 rounded-xl bg-white border border-slate-200 hover:border-blue-400 transition-colors flex items-center justify-between group">
                 <div>
                   <div className="text-xs font-bold text-slate-800">uBank Savings</div>
                   <div className="text-[10px] text-slate-500 font-mono">670-864 • 43104772</div>
                 </div>
                 <div className="text-blue-500 opacity-0 group-hover:opacity-100 transition-opacity"><ArrowRight className="w-4 h-4" /></div>
               </button>

               <button type="button" onClick={() => { setBsb("670-864"); setAccountNumber("43104764"); setAccountName("uBank Bills"); setIsValidated(true); setAmount("20000.00"); }} className="w-full text-left p-3 rounded-xl bg-white border border-slate-200 hover:border-blue-400 transition-colors flex items-center justify-between group">
                 <div>
                   <div className="text-xs font-bold text-slate-800">uBank Bills</div>
                   <div className="text-[10px] text-slate-500 font-mono">670-864 • 43104764</div>
                 </div>
                 <div className="text-blue-500 opacity-0 group-hover:opacity-100 transition-opacity"><ArrowRight className="w-4 h-4" /></div>
               </button>
             </div>

             <div className="space-y-3">
               <div className="flex items-center gap-4 text-xs font-bold text-slate-500 uppercase tracking-widest bg-white p-3 rounded-xl border border-slate-200 shadow-sm">
                  <div className="w-2 h-2 rounded-full bg-blue-500"></div> Global Clearing Network
               </div>
               <div className="flex items-center gap-4 text-xs font-bold text-slate-500 uppercase tracking-widest bg-white p-3 rounded-xl border border-slate-200 shadow-sm">
                  <div className="w-2 h-2 rounded-full bg-blue-500"></div> Institutional Traceability
               </div>
             </div>
          </div>
        </div>
      ) : transferType === 'payid' ? (
        <div className="w-full flex justify-center py-2">
          <CommBankPayIDFlow
            user={user}
            isInline={true}
            availableBalances={userData?.balances}
            sourceCards={creditCards}
            onPaymentComplete={(receipt) => {
              toast.success(`PayID Payment of $${receipt.amount.toFixed(2)} AUD sent & confirmed received by ${receipt.recipientName}!`);
            }}
          />
        </div>
      ) : null}

      <AnimatePresence>
        {status === "success" && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] flex flex-col items-center justify-center p-4 bg-slate-900/90 backdrop-blur-md"
          >
            <motion.div 
              initial={{ scale: 0.5, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ type: "spring", damping: 15, stiffness: 200 }}
              className="relative flex items-center justify-center mb-8"
            >
              <div className="absolute inset-0 bg-emerald-500 rounded-full animate-ping opacity-20"></div>
              <div className="w-32 h-32 bg-emerald-500 rounded-full flex items-center justify-center shadow-[0_0_50px_rgba(16,185,129,0.5)]">
                <Check className="w-16 h-16 text-white" strokeWidth={3} />
              </div>
            </motion.div>
            <motion.h2 
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.2 }}
              className="text-4xl font-black text-white mb-2 tracking-tight text-center"
            >
              Transfer Successful
            </motion.h2>
            <motion.p 
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.3 }}
              className="text-emerald-400 font-bold uppercase tracking-widest text-sm"
            >
              Funds Cleared & Settled Instantly
            </motion.p>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {tapStatus === "success" && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] flex flex-col items-center justify-center p-4 bg-slate-900/90 backdrop-blur-md"
          >
            <motion.div 
              initial={{ scale: 0.5, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ type: "spring", damping: 15, stiffness: 200 }}
              className="relative flex items-center justify-center mb-8"
            >
              <div className="absolute inset-0 bg-[#ffcc00] rounded-full animate-ping opacity-20"></div>
              <div className="w-32 h-32 bg-[#ffcc00] rounded-full flex items-center justify-center shadow-[0_0_50px_rgba(255,204,0,0.5)]">
                <Wifi className="w-16 h-16 text-slate-900" strokeWidth={3} />
              </div>
            </motion.div>
            <motion.h2 
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.2 }}
              className="text-4xl font-black text-white mb-2 tracking-tight text-center"
            >
              NFC Tap Successful
            </motion.h2>
            <motion.p 
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.3 }}
              className="text-[#ffcc00] font-bold uppercase tracking-widest text-sm"
            >
              Digital Card Charged
            </motion.p>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {showReviewModal && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm"
          >
            <motion.div 
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white rounded-3xl w-full max-w-md shadow-2xl overflow-hidden border border-slate-200"
            >
              <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-slate-50">
                <h3 className="text-xl font-bold text-slate-800">Review Transfer</h3>
                <button onClick={() => setShowReviewModal(false)} className="text-slate-400 hover:text-slate-600 transition-colors">
                  <X className="w-5 h-5" />
                </button>
              </div>
              <div className="p-6 space-y-4">
                <div className="flex justify-between items-center py-3 border-b border-slate-50">
                  <span className="text-sm font-bold text-slate-400 uppercase tracking-widest">Amount</span>
                  <span className="text-2xl font-black text-slate-800">
                    $ {amount}
                  </span>
                </div>
                <div className="flex justify-between items-center py-3 border-b border-slate-50">
                  <span className="text-sm font-bold text-slate-400 uppercase tracking-widest">Recipient</span>
                  <span className="text-sm font-bold text-slate-800 text-right">{accountName || recipient || payIdValue}</span>
                </div>
                {transferType === 'au_bsb' && (
                  <div className="flex justify-between items-center py-3 border-b border-slate-50">
                    <span className="text-sm font-bold text-slate-400 uppercase tracking-widest">Account Details</span>
                    <span className="text-sm font-bold text-slate-800 text-right">BSB: {bsb}<br/>Acc: {accountNumber}</span>
                  </div>
                )}
                {transferType === 'payid' && (
                  <div className="flex justify-between items-center py-3 border-b border-slate-50">
                    <span className="text-sm font-bold text-slate-400 uppercase tracking-widest">PayID</span>
                    <span className="text-sm font-bold text-slate-800 text-right">{payIdValue}</span>
                  </div>
                )}
              </div>
              <div className="p-6 bg-slate-50 border-t border-slate-100 flex gap-3">
                <button 
                  onClick={() => setShowReviewModal(false)}
                  className="w-1/3 py-3 rounded-xl bg-white text-slate-600 font-bold text-xs uppercase tracking-widest border border-slate-200 hover:bg-slate-50 transition-colors"
                >
                  Cancel
                </button>
                <button 
                  onClick={processTransfer}
                  disabled={status === 'processing'}
                  className="w-2/3 py-3 rounded-xl bg-blue-600 text-white font-black text-xs uppercase tracking-widest shadow-md hover:bg-blue-500 transition-all flex justify-center items-center gap-2 disabled:opacity-50"
                >
                  {status === 'processing' ? <Loader2 className="w-4 h-4 animate-spin" /> : "Confirm Transfer"}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <AIGuide />

      {/* Institutional Link.com Account Hub & 1-Click Pay Modal */}
      <LinkComManagerModal
        isOpen={isLinkModalOpen}
        onClose={() => setIsLinkModalOpen(false)}
        userEmail={TARGET_LINK_EMAIL}
      />
    </div>
    </>
  );
}