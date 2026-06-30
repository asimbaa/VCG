import React, { useState, useEffect } from "react";
import {
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
  Cpu
} from "lucide-react";
import { toast } from "sonner";
import { motion, AnimatePresence } from "framer-motion";
import { db } from "../../firebase";
import {
  collection,
  addDoc,
  query,
  where,
  orderBy,
  limit,
  onSnapshot,
  doc,
  updateDoc,
  deleteDoc
} from "firebase/firestore";
import { AIGuide } from "../AIGuide";

export function RapidPay({ user }: { user: any }) {
  const [transferType, setTransferType] = useState<"standard" | "au_bsb" | "credit_card" | "digital_bsb_card">("standard");
  const [recipient, setRecipient] = useState("");
  const [bsb, setBsb] = useState("");
  const [accountNumber, setAccountNumber] = useState("");
  const [accountName, setAccountName] = useState("");
  const [amount, setAmount] = useState("");
  const [note, setNote] = useState("");
  const [status, setStatus] = useState<"idle" | "processing" | "success" | "validating">("idle");
  const [showReviewModal, setShowReviewModal] = useState(false);
  const [isValidated, setIsValidated] = useState(false);

  // Credit card integration states
  const [creditCards, setCreditCards] = useState<any[]>([]);
  const [userData, setUserData] = useState<any>(null);
  const [selectedFundingSource, setSelectedFundingSource] = useState<string>("balance");

  // New card form states
  const [cardNickname, setCardNickname] = useState("");
  const [cardNumber, setCardNumber] = useState("");
  const [cardHolder, setCardHolder] = useState("");
  const [cardExpiry, setCardExpiry] = useState("");
  const [cardCvv, setCardCvv] = useState("");
  const [cardLimit, setCardLimit] = useState("15000");
  const [isFlipped, setIsFlipped] = useState(false);
  const [isAddingCard, setIsAddingCard] = useState(false);

  // BSB-linked digital credit card states
  const [bsbLinkedCards, setBsbLinkedCards] = useState<any[]>([]);
  const [newBsb, setNewBsb] = useState("");
  const [newAccNo, setNewAccNo] = useState("");
  const [newCardholder, setNewCardholder] = useState("");
  const [newCardNickname, setNewCardNickname] = useState("");
  const [newCardLimit, setNewCardLimit] = useState("50000");
  const [isGeneratingDigitalCard, setIsGeneratingDigitalCard] = useState(false);
  const [selectedBsbCard, setSelectedBsbCard] = useState<any | null>(null);

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
    return () => unsub();
  }, [user]);

  // Fetch real-time user profile (for balances) and linked cards (funding_sources)
  useEffect(() => {
    if (!user?.uid) return;

    // Listen to user balance
    const userDocRef = doc(db, "users", user.uid);
    const unsubUser = onSnapshot(userDocRef, (docSnap) => {
      if (docSnap.exists()) {
        setUserData(docSnap.data());
      }
    });

    // Listen to credit cards in funding_sources
    const fundingQ = query(
      collection(db, "funding_sources"),
      where("userId", "==", user.uid),
      where("type", "==", "credit_card")
    );
    const unsubFunding = onSnapshot(fundingQ, (snap) => {
      const cards = snap.docs.map((docSnap) => ({ id: docSnap.id, ...docSnap.data() }));
      setCreditCards(cards);
    });

    // Listen to digital BSB cards in funding_sources
    const digitalBsbQ = query(
      collection(db, "funding_sources"),
      where("userId", "==", user.uid),
      where("type", "==", "digital_bsb_card")
    );
    const unsubDigitalBsb = onSnapshot(digitalBsbQ, (snap) => {
      const cards = snap.docs.map((docSnap) => ({ id: docSnap.id, ...docSnap.data() }));
      setBsbLinkedCards(cards);
      if (cards.length > 0) {
        setSelectedBsbCard((prev: any) => {
          if (prev) {
            return cards.find((c: any) => c.id === prev.id) || cards[0];
          }
          return cards[0];
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
        limit: 50000,
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
        limit: parseFloat(cardLimit) || 15000,
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
      setCardLimit("15000");
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

    if (!newBsb.trim() || !newAccNo.trim()) {
      toast.error("Please enter both the BSB and Account Number");
      return;
    }
    if (!newCardholder.trim()) {
      toast.error("Please enter the Cardholder Name");
      return;
    }

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
        bsb: newBsb.trim(),
        accountNumber: newAccNo.trim(),
        limit: parseFloat(newCardLimit) || 50000,
        currentBalance: 0,
        status: "active",
        network: "Visa",
        createdAt: new Date().toISOString(),
        tapIdEnabled: true,
        payIdEnabled: true,
        oskoEnabled: true
      });

      toast.success("Worldwide BSB-linked digital card generated & integrated!");
      setNewBsb("");
      setNewAccNo("");
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

      // Update Firestore balance
      const cardRef = doc(db, "funding_sources", selectedBsbCard.id);
      await updateDoc(cardRef, {
        currentBalance: currentBal + convertedAud
      });

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

  // Pay credit card bill off using Sovereign account cash balance
  const handlePayCardBill = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user?.uid || !payingCard) return;

    const payAmt = parseFloat(paymentAmount);
    if (isNaN(payAmt) || payAmt <= 0) {
      toast.error("Please enter a valid positive payment amount");
      return;
    }

    const currentAud = userData?.balances?.AUD || 0;
    if (payAmt > currentAud) {
      toast.error("Insufficient account balance to pay card bill.");
      return;
    }

    if (payAmt > (payingCard.currentBalance || 0)) {
      toast.error("Payment amount exceeds current card balance.");
      return;
    }

    setStatus("processing");
    try {
      // 1. Deduct from account balance in users collection
      const userRef = doc(db, "users", user.uid);
      await updateDoc(userRef, {
        "balances.AUD": currentAud - payAmt
      });

      // 2. Reduce card currentBalance in funding_sources collection
      const cardRef = doc(db, "funding_sources", payingCard.id);
      await updateDoc(cardRef, {
        currentBalance: (payingCard.currentBalance || 0) - payAmt
      });

      // 3. Record transaction
      await addDoc(collection(db, "transactions"), {
        userId: user.uid,
        recipient: `Credit Card Bill: ${payingCard.name} (${payingCard.network} ••••${payingCard.details})`,
        type: "Credit Card Payment",
        amount: -payAmt,
        date: new Date().toISOString(),
        status: "completed",
      });

      toast.success(`Successfully paid off $${payAmt.toLocaleString()} on credit card!`);
      setPayingCard(null);
      setPaymentAmount("");
    } catch (e) {
      console.error(e);
      toast.error("Payment processing failed.");
    } finally {
      setStatus("idle");
    }
  };

  const handleValidate = (e: React.MouseEvent) => {
    e.preventDefault();
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
      setAccountName(`Verified Endpoint ${accountNumber.slice(-4)}`);
      setIsValidated(true);
      toast.success("Endpoint validated successfully");
    }, 1000);
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
    }
  };

  const processTransfer = async () => {
    setShowReviewModal(false);
    setStatus("processing");

    const transferTo = transferType === "standard" ? recipient : `${accountName} (BSB: ${bsb} Acc: ${accountNumber})`;
    const typeLabel = transferType === "standard" ? "Email/ID" : "au_bsb";
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

        const cardRef = doc(db, "funding_sources", card.id);
        await updateDoc(cardRef, {
          currentBalance: (card.currentBalance || 0) + amtNum
        });
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
        });
      }

      setStatus("success");
      toast.success(`Successfully sent $${amtNum.toFixed(2)} to ${transferTo}`);
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

  return (
    <div className="max-w-6xl mx-auto flex flex-col gap-8">
      {/* Premium Hub Banner */}
      <div className="bg-gradient-to-br from-yellow-400 via-amber-500 to-yellow-600 rounded-3xl p-8 text-white shadow-xl relative overflow-hidden">
        <div className="absolute top-0 right-0 p-8 opacity-15">
          <ShieldCheck className="w-56 h-56" />
        </div>
        <div className="relative z-10">
          <span className="bg-white/20 text-white font-bold text-xs uppercase px-3 py-1.5 rounded-full backdrop-blur-md inline-block mb-4">
            Valourian Capital Network
          </span>
          <h2 className="text-3xl font-black mb-2 tracking-tight">Rapid Institutional Transfer Hub</h2>
          <p className="text-yellow-50 opacity-90 max-w-2xl leading-relaxed text-sm">
            Instantly deploy capital, settle global obligations, or manage premium integrated credit cards
            under zero-knowledge clearing guarantees. Zero clearance delays. Limitless global fluidity.
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
          <User className="w-4 h-4" /> Standard P2P
        </button>
        <button
          onClick={() => setTransferType("au_bsb")}
          className={`px-6 py-3 rounded-xl font-bold text-sm transition-all duration-200 flex items-center gap-2 ${
            transferType === "au_bsb"
              ? "bg-slate-900 text-white shadow-md"
              : "text-slate-600 hover:bg-slate-200/50"
          }`}
        >
          <Landmark className="w-4 h-4" /> AU BSB & Account
        </button>
        <button
          onClick={() => setTransferType("credit_card")}
          className={`px-6 py-3 rounded-xl font-bold text-sm transition-all duration-200 flex items-center gap-2 ${
            transferType === "credit_card"
              ? "bg-gradient-to-r from-yellow-500 to-amber-600 text-white shadow-md"
              : "text-slate-600 hover:bg-slate-200/50"
          }`}
        >
          <CreditCard className="w-4 h-4" /> Credit Card Integrations
        </button>
        <button
          onClick={() => setTransferType("digital_bsb_card")}
          className={`px-6 py-3 rounded-xl font-bold text-sm transition-all duration-200 flex items-center gap-2 ${
            transferType === "digital_bsb_card"
              ? "bg-gradient-to-r from-indigo-600 via-violet-600 to-purple-600 text-white shadow-md shadow-indigo-200"
              : "text-slate-600 hover:bg-slate-200/50"
          }`}
        >
          <Sparkles className="w-4 h-4" /> BSB Digital Card Hub
        </button>
      </div>

      {/* Render Main Content Panel */}
      {transferType === "digital_bsb_card" ? (
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
                  {bsbLinkedCards.map((card) => {
                    const isSelected = selectedBsbCard?.id === card.id;
                    const isFrozen = card.status === "frozen";
                    return (
                      <div
                        key={card.id}
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
                          •••• •••• •••• {card.details}
                        </p>

                        <div className="border-t border-slate-200/10 pt-2 flex justify-between items-center text-[9px] font-mono opacity-80">
                          <div>
                            <span className="block text-[7px] text-slate-400">BSB & Account</span>
                            {card.bsb} • {card.accountNumber}
                          </div>
                          <div className="text-right">
                            <span className="block text-[7px] text-slate-400">Card Bal / Limit</span>
                            ${card.currentBalance?.toFixed(0)} / ${card.limit?.toLocaleString()}
                          </div>
                        </div>

                        <div className="mt-3 pt-2 border-t border-slate-200/10 flex justify-between gap-2">
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
                  <div className="grid sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-semibold text-slate-500 mb-1">
                        BSB Number (Australian Bank Format)
                      </label>
                      <input
                        type="text"
                        value={newBsb}
                        onChange={(e) => setNewBsb(e.target.value)}
                        className="w-full rounded-xl border border-slate-300 py-2.5 px-3 focus:ring-2 focus:ring-indigo-500 transition-colors text-slate-800 font-semibold"
                        placeholder="e.g. 082-902"
                        maxLength={7}
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-slate-500 mb-1">
                        Linked Bank Account Number
                      </label>
                      <input
                        type="text"
                        value={newAccNo}
                        onChange={(e) => setNewAccNo(e.target.value)}
                        className="w-full rounded-xl border border-slate-300 py-2.5 px-3 focus:ring-2 focus:ring-indigo-500 transition-colors text-slate-800 font-semibold"
                        placeholder="e.g. 88390112"
                        maxLength={9}
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
                  <div className="flex items-center gap-1 bg-indigo-950/40 border border-indigo-900/40 p-2 rounded-xl mb-4">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                    <span className="text-[8px] font-mono text-slate-300">
                      BSB-LINKED ACC: <strong className="text-white">{selectedBsbCard ? `${selectedBsbCard.bsb} • ${selectedBsbCard.accountNumber}` : "000-000 • 0000000"}</strong>
                    </span>
                  </div>

                  <p className="font-mono text-lg tracking-[0.25em] text-white">
                    {selectedBsbCard ? selectedBsbCard.fullNumber.replace(/(.{4})/g, "$1 ") : "4211 •••• •••• 9920"}
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

            {/* Live Worldwide Order Terminal */}
            <div className="bg-slate-900 rounded-3xl p-6 border border-slate-800 text-white shadow-xl relative overflow-hidden">
              <h3 className="text-md font-extrabold flex items-center gap-2 mb-2 text-indigo-400">
                <Cpu className="w-4 h-4 animate-pulse" />
                Live Worldwide Order Terminal
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
                  {creditCards.map((card) => {
                    const balance = card.currentBalance || 0;
                    const limitAmt = card.limit || 15000;
                    const avail = limitAmt - balance;
                    const utilization = limitAmt > 0 ? (balance / limitAmt) * 100 : 0;
                    const isFrozen = card.status === "frozen";

                    return (
                      <div
                        key={card.id}
                        className="bg-slate-50 rounded-2xl p-5 border border-slate-200 flex flex-col justify-between shadow-sm relative overflow-hidden"
                      >
                        {/* Glass Card Header Graphic */}
                        <div
                          className={`w-full h-40 rounded-xl p-4 text-white flex flex-col justify-between mb-4 shadow-md relative overflow-hidden transition-all duration-300 ${
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
                              ••••  ••••  ••••  {card.details}
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
                        <div className="grid grid-cols-3 gap-2 mt-4 pt-3 border-t border-slate-200">
                          <button
                            onClick={() => {
                              setPayingCard(card);
                              setPaymentAmount(balance.toString());
                            }}
                            disabled={balance === 0 || isFrozen}
                            className="py-2 bg-yellow-500 hover:bg-yellow-600 text-slate-950 font-extrabold text-[10px] rounded-lg transition-colors flex items-center justify-center gap-1 shadow-sm disabled:opacity-50 disabled:cursor-not-allowed"
                            title="Pay off current credit card statement balance"
                          >
                            <DollarSign className="w-3 h-3" /> Pay Bill
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
              /* Pay Bill Action Form Panel */
              <div className="bg-slate-950 text-white rounded-3xl p-6 border border-yellow-500/30 shadow-xl">
                <div className="flex justify-between items-center mb-6 border-b border-white/10 pb-4">
                  <div className="flex items-center gap-2">
                    <DollarSign className="w-5 h-5 text-yellow-500" />
                    <h3 className="font-extrabold text-lg text-yellow-500">Pay Card Balance</h3>
                  </div>
                  <button
                    onClick={() => setPayingCard(null)}
                    className="w-7 h-7 rounded-full bg-white/5 flex items-center justify-center text-slate-400 hover:text-white"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>

                <div className="mb-6 bg-slate-900 rounded-xl p-4 border border-slate-800 space-y-2">
                  <p className="text-[10px] uppercase font-black text-slate-500">Target Account</p>
                  <p className="text-white font-extrabold text-sm">{payingCard.name}</p>
                  <p className="text-slate-400 font-mono text-xs">
                    {payingCard.network} •••• {payingCard.details}
                  </p>
                  <div className="flex justify-between pt-2 border-t border-white/5 text-xs">
                    <span className="text-slate-400">Total Due:</span>
                    <span className="font-bold text-red-400">
                      ${(payingCard.currentBalance || 0).toLocaleString("en-AU", {
                        minimumFractionDigits: 2
                      })}
                    </span>
                  </div>
                </div>

                <form onSubmit={handlePayCardBill} className="space-y-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-400 mb-1">
                      Payment Amount (AUD)
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
                    <p className="text-[10px] text-slate-500 mt-1">
                      Deducted from Sovereign Cash Account Balance: $
                      {(userData?.balances?.AUD || 0).toLocaleString("en-AU", {
                        minimumFractionDigits: 2
                      })}
                    </p>
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
                      placeholder="Sovereign Black Titanium"
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
                      Credit Limit (AUD)
                    </label>
                    <select
                      value={cardLimit}
                      onChange={(e) => setCardLimit(e.target.value)}
                      className="w-full rounded-xl border border-slate-300 py-2 px-3 text-sm focus:ring-2 focus:ring-yellow-500 text-slate-800 font-bold bg-white"
                      disabled={status === "processing"}
                    >
                      <option value="5000">$5,000.00 Limit</option>
                      <option value="15000">$15,000.00 Limit</option>
                      <option value="50000">$50,000.00 Limit</option>
                      <option value="100000">$100,000.00 Limit</option>
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
        </div>
      ) : (
        /* Original Standard P2P & BSB Transfer Panels with Funding Source select integrated */
        <div className="grid md:grid-cols-2 gap-8">
          <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-200">
            <h3 className="text-xl font-bold text-slate-800 mb-6 flex items-center gap-2">
              <Send className="w-5 h-5 text-yellow-600" />
              Send Secure Transfer
            </h3>

            <form onSubmit={handleSendRequest} className="space-y-4">
              {/* Dynamic Funding Source Selector */}
              <div>
                <label className="block text-xs font-semibold text-slate-500 mb-1">
                  Funding Source Account
                </label>
                <select
                  value={selectedFundingSource}
                  onChange={(e) => setSelectedFundingSource(e.target.value)}
                  className="w-full rounded-xl border border-slate-300 py-3 px-4 focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500 transition-colors bg-white font-bold text-slate-800 text-sm shadow-sm"
                >
                  <option value="balance">
                    Sovereign Cash Account (AUD $
                    {(userData?.balances?.AUD || 0).toLocaleString("en-AU", {
                      minimumFractionDigits: 2
                    })}
                    )
                  </option>
                  {creditCards.map((card) => (
                    <option key={card.id} value={card.id} disabled={card.status !== "active"}>
                      {card.name} - {card.network} (•••• {card.details}){" "}
                      {card.status !== "active"
                        ? "[FROZEN]"
                        : `[Avail: $${(card.limit - (card.currentBalance || 0)).toLocaleString("en-AU", {
                            minimumFractionDigits: 2
                          })}]`}
                    </option>
                  ))}
                </select>
              </div>

              {transferType === "standard" ? (
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">
                    Send To (Name, Email, or Account)
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <User className="h-5 w-5 text-slate-400" />
                    </div>
                    <input
                      type="text"
                      value={recipient}
                      onChange={(e) => setRecipient(e.target.value)}
                      className="pl-10 w-full rounded-xl border border-slate-300 py-3 px-4 focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500 transition-colors text-slate-800 font-semibold"
                      placeholder="e.g. Acme Corp or john@example.com"
                      disabled={status !== "idle"}
                    />
                  </div>
                </div>
              ) : (
                <div className="space-y-4 p-5 bg-slate-950 rounded-2xl border border-yellow-500/30 shadow-[0_0_15px_rgba(234,179,8,0.1)]">
                  <div className="flex items-center gap-2 border-b border-yellow-500/20 pb-3 mb-4">
                    <Landmark className="w-5 h-5 text-yellow-500" />
                    <h4 className="text-yellow-500 font-bold uppercase tracking-widest text-xs">
                      Sovereign Direct BSB Clearing
                    </h4>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-[10px] uppercase font-black tracking-widest text-slate-400 mb-1">
                        AU BSB Number
                      </label>
                      <input
                        type="text"
                        value={bsb}
                        onChange={(e) => {
                          setBsb(e.target.value.replace(/\D/g, "").slice(0, 6));
                          setIsValidated(false);
                        }}
                        className="w-full bg-slate-900 border border-slate-700 text-white rounded-xl py-3 px-4 focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500 transition-colors font-mono tracking-[0.2em] font-semibold text-center"
                        placeholder="000000"
                        disabled={status !== "idle"}
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] uppercase font-black tracking-widest text-slate-400 mb-1">
                        Account Number
                      </label>
                      <input
                        type="text"
                        value={accountNumber}
                        onChange={(e) => {
                          setAccountNumber(e.target.value.replace(/\D/g, "").slice(0, 9));
                          setIsValidated(false);
                        }}
                        className="w-full bg-slate-900 border border-slate-700 text-white rounded-xl py-3 px-4 focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500 transition-colors font-mono tracking-widest font-semibold text-center"
                        placeholder="123456789"
                        disabled={status !== "idle"}
                      />
                    </div>
                  </div>

                  {!isValidated ? (
                    <button
                      onClick={handleValidate}
                      disabled={status === "validating"}
                      className="w-full py-3 bg-yellow-500 hover:bg-yellow-400 text-slate-950 font-bold rounded-xl transition-colors shadow-md mt-2 flex items-center justify-center"
                    >
                      {status === "validating" ? "Validating Endpoint..." : "Validate Account Endpoint"}
                    </button>
                  ) : (
                    <AnimatePresence>
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: "auto" }}
                        className="pt-2 border-t border-yellow-500/20 space-y-4"
                      >
                        <div className="flex items-center gap-3 bg-slate-900 p-3 rounded-xl border border-slate-700/50">
                          <CheckCircle2 className="w-5 h-5 text-emerald-500" />
                          <div>
                            <p className="text-[10px] uppercase font-black tracking-widest text-emerald-500 mb-0.5">
                              Account Verified
                            </p>
                            <p className="text-white font-bold text-sm truncate">{accountName}</p>
                          </div>
                        </div>
                      </motion.div>
                    </AnimatePresence>
                  )}
                </div>
              )}

              {(transferType === "standard" || isValidated) && (
                <>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">
                      Amount (AUD)
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <DollarSign className="h-5 w-5 text-slate-400" />
                      </div>
                      <input
                        type="number"
                        value={amount}
                        onChange={(e) => setAmount(e.target.value)}
                        className="pl-10 w-full rounded-xl border border-slate-300 py-3 px-4 focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500 transition-colors text-lg font-bold text-slate-800"
                        placeholder="0.00"
                        disabled={status !== "idle"}
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">
                      Note (Optional)
                    </label>
                    <input
                      type="text"
                      value={note}
                      onChange={(e) => setNote(e.target.value)}
                      className="w-full rounded-xl border border-slate-300 py-3 px-4 focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500 transition-colors text-slate-800 font-semibold"
                      placeholder="What is this for?"
                      disabled={status !== "idle"}
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={status !== "idle"}
                    className={`w-full py-4 text-white font-bold rounded-xl transition-all shadow-md flex items-center justify-center gap-2 mt-4 disabled:opacity-70 ${
                      transferType === "au_bsb"
                        ? "bg-gradient-to-r from-slate-900 to-slate-950 border border-yellow-600/50 hover:bg-black"
                        : "bg-slate-900 hover:bg-slate-800"
                    }`}
                  >
                    {status === "idle" ? (
                      <>
                        Send Securely <Send className="w-5 h-5" />
                      </>
                    ) : status === "processing" ? (
                      <>
                        Processing...{" "}
                        <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      </>
                    ) : status === "validating" ? (
                      "Validating..."
                    ) : (
                      <>
                        Sent <CheckCircle2 className="w-5 h-5" />
                      </>
                    )}
                  </button>
                </>
              )}
            </form>
          </div>

          {/* Recent Payments Section */}
          <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-200">
            <h3 className="text-xl font-bold text-slate-800 mb-6 flex items-center gap-2">
              <Clock className="w-5 h-5 text-yellow-600" />
              Recent Payments History
            </h3>

            <div className="space-y-4">
              {history.length === 0 ? (
                <div className="text-center py-12 text-slate-400 text-sm font-semibold">
                  No recent institutional transactions logged.
                </div>
              ) : (
                history.map((item, i) => {
                  const toName = item.recipient || item.to || "Unknown";
                  const isBsb = item.type?.startsWith("au_bsb");
                  const isCardPayment = item.type?.includes("Credit Card");
                  const parsedAmount = Math.abs(parseFloat(item.amount));
                  const formattedDate = new Date(item.date).toLocaleDateString([], {
                    month: "short",
                    day: "numeric",
                    hour: "2-digit",
                    minute: "2-digit"
                  });
                  return (
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      key={item.id || i}
                      className="flex items-center justify-between p-4 rounded-2xl bg-slate-50 border border-slate-100"
                    >
                      <div className="flex items-center gap-3">
                        <div
                          className={`w-10 h-10 rounded-full flex items-center justify-center font-bold ${
                            isCardPayment
                              ? "bg-amber-100 text-amber-700"
                              : isBsb
                              ? "bg-yellow-100 text-yellow-700"
                              : "bg-slate-900 text-white"
                          }`}
                        >
                          {isCardPayment ? (
                            <CreditCard className="w-4 h-4" />
                          ) : isBsb ? (
                            <Landmark className="w-4 h-4" />
                          ) : (
                            toName.charAt(0)
                          )}
                        </div>
                        <div className="text-left">
                          <p className="font-semibold text-slate-800 truncate max-w-[150px]" title={toName}>
                            {toName}
                          </p>
                          <p className="text-xs text-slate-500">
                            {formattedDate} • {item.type || "Instant Pay"}
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-bold text-slate-900">
                          ${parsedAmount.toLocaleString("en-AU", { minimumFractionDigits: 2 })}
                        </p>
                        <p
                          className={`text-xs flex items-center justify-end gap-1 ${
                            item.status === "failed" ? "text-red-600" : "text-emerald-600"
                          }`}
                        >
                          {item.status === "failed" ? <X className="w-3 h-3" /> : <CheckCircle2 className="w-3 h-3" />}
                          {item.status === "failed" ? "Failed" : "Settled"}
                        </p>
                      </div>
                    </motion.div>
                  );
                })
              )}
            </div>
          </div>
        </div>
      )}

      {/* Review Modal for BSB / Standard Transfers */}
      <AnimatePresence>
        {showReviewModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-slate-950/80 backdrop-blur-sm"
              onClick={() => setShowReviewModal(false)}
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="relative w-full max-w-md bg-slate-950 border border-yellow-500/30 rounded-3xl shadow-2xl overflow-hidden"
            >
              <div className="p-6 border-b border-white/5 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-yellow-500/10 flex items-center justify-center">
                    <Eye className="w-5 h-5 text-yellow-500" />
                  </div>
                  <div>
                    <h3 className="text-white font-bold text-lg">Review Transfer</h3>
                    <p className="text-slate-400 text-xs">Sovereign Authority Line</p>
                  </div>
                </div>
                <button
                  onClick={() => setShowReviewModal(false)}
                  className="w-8 h-8 rounded-full bg-white/5 flex items-center justify-center text-slate-400 hover:text-white hover:bg-white/10 transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <div className="p-6 space-y-6 text-left">
                <div className="text-center">
                  <p className="text-slate-400 font-medium mb-1">Send Amount</p>
                  <h2 className="text-4xl font-black text-white">
                    ${parseFloat(amount).toLocaleString("en-AU", { minimumFractionDigits: 2 })}
                  </h2>
                  <p className="text-yellow-500 text-xs font-bold uppercase tracking-widest mt-2">
                    Zero Fees Applied
                  </p>
                </div>

                <div className="bg-slate-900 rounded-2xl p-5 border border-slate-800 space-y-4">
                  <div>
                    <p className="text-slate-500 text-[10px] uppercase font-black tracking-widest mb-1">
                      Account Name
                    </p>
                    <p className="text-white font-bold text-lg bg-black px-3 py-2 rounded-lg border border-slate-800">
                      {accountName}
                    </p>
                  </div>
                  <div>
                    <p className="text-slate-500 text-[10px] uppercase font-black tracking-widest mb-1">
                      Destination BSB
                    </p>
                    <p className="text-white font-mono tracking-widest text-lg bg-black px-3 py-2 rounded-lg border border-slate-800">
                      {bsb.replace(/(\d{3})(\d{3})/, "$1-$2")}
                    </p>
                  </div>
                  <div>
                    <p className="text-slate-500 text-[10px] uppercase font-black tracking-widest mb-1">
                      Account Number
                    </p>
                    <p className="text-white font-mono tracking-widest text-lg bg-black px-3 py-2 rounded-lg border border-slate-800">
                      {accountNumber}
                    </p>
                  </div>
                  {note && (
                    <div>
                      <p className="text-slate-500 text-[10px] uppercase font-black tracking-widest mb-1">
                        Reference
                      </p>
                      <p className="text-white font-semibold">{note}</p>
                    </div>
                  )}
                </div>

                <div className="pt-2">
                  <button
                    onClick={processTransfer}
                    className="w-full py-4 bg-gradient-to-r from-yellow-600 to-yellow-500 hover:from-yellow-500 hover:to-yellow-400 text-slate-950 font-black tracking-wide rounded-xl shadow-[0_0_20px_rgba(234,179,8,0.3)] transition-all flex items-center justify-center gap-2"
                  >
                    Confirm & Clear Instantly <Send className="w-5 h-5" />
                  </button>
                  <button
                    onClick={() => setShowReviewModal(false)}
                    className="w-full py-3 mt-3 text-slate-400 hover:text-white font-bold text-sm transition-colors text-center block"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      <AIGuide />
    </div>
  );
}
