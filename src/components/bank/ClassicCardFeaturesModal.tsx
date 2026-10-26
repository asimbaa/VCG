import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  X,
  Lock,
  Unlock,
  Key,
  CreditCard,
  ShieldCheck,
  RefreshCw,
  Copy,
  Download,
  Flame,
  Globe,
  Wifi,
  Smartphone,
  Sparkles,
  TrendingUp,
  DollarSign,
  Gift,
  CheckCircle2,
  AlertTriangle,
  Sliders,
  Plane,
  Eye,
  EyeOff,
  Building2,
  Check,
  FileText,
  QrCode,
  Zap,
  Coins,
  SmartphoneNfc,
  Send,
  UserCheck,
  ArrowRight,
  Loader2,
  Landmark,
  Share2
} from "lucide-react";
import { toast } from "sonner";
import { jsPDF } from "jspdf";
import { renderAutoTable } from "../../utils/safePdfAutoTable";
import { UnifiedBankCard, unifiedBankCardSync, TARGET_LINK_EMAIL, TARGET_LINK_HOLDER } from "../../services/unifiedBankCardSync";
import { useGlobalCurrency } from "../../contexts/CurrencyContext";
import { convertCurrency, formatCurrency } from "../../utils/CurrencyConverter";
import { NFCTapModal } from "../pay/NFCTapModal";
import {
  resolvePayIDDirectory,
  executeBilateralPayment,
  PaymentReceiptResult,
  SUPPORTED_COUNTRY_CODES
} from "../../services/paymentSettlementService";
import { generatePdfReceipt } from "../../utils/pdfGenerator";

interface ClassicCardFeaturesModalProps {
  card: UnifiedBankCard | null;
  isOpen: boolean;
  onClose: () => void;
  onCardUpdated?: (card: UnifiedBankCard) => void;
  initialTab?: "controls" | "payid" | "value" | "pin" | "limits" | "statements";
}

export const ClassicCardFeaturesModal: React.FC<ClassicCardFeaturesModalProps> = ({
  card,
  isOpen,
  onClose,
  onCardUpdated,
  initialTab
}) => {
  const { currency: globalCur } = useGlobalCurrency();
  const [isFlipped, setIsFlipped] = useState(false);
  const [activeTab, setActiveTab] = useState<"controls" | "payid" | "value" | "pin" | "limits" | "statements">(initialTab || "controls");

  useEffect(() => {
    if (initialTab) {
      setActiveTab(initialTab);
    }
  }, [initialTab]);

  const [showPin, setShowPin] = useState(false);
  const [newPin, setNewPin] = useState("");
  const [confirmPin, setConfirmPin] = useState("");
  const [isChangingPin, setIsChangingPin] = useState(false);
  const [copiedField, setCopiedField] = useState<string | null>(null);

  // PayID Transfers Suite State
  const [payIdType, setPayIdType] = useState<"phone" | "email" | "abn" | "organization">("phone");
  const [payIdValue, setPayIdValue] = useState<string>("");
  const [payIdSelectedCountryCode, setPayIdSelectedCountryCode] = useState<string>("+61");
  const [payIdAmount, setPayIdAmount] = useState<string>("");
  const [payIdDescription, setPayIdDescription] = useState<string>("");
  const [payIdReference, setPayIdReference] = useState<string>("");
  const [isResolvingPayId, setIsResolvingPayId] = useState<boolean>(false);
  const [payIdResolvedPayee, setPayIdResolvedPayee] = useState<{
    registeredName: string;
    payIdType: string;
    payIdValue: string;
    countryCode?: string;
    institution: string;
    fastPaymentEligible?: boolean;
  } | null>(null);
  const [payIdCustomLegalName, setPayIdCustomLegalName] = useState<string>("");
  const [isEditingPayIdLegalName, setIsEditingPayIdLegalName] = useState<boolean>(false);
  const [isExecutingPayId, setIsExecutingPayId] = useState<boolean>(false);
  const [payIdSuccessReceipt, setPayIdSuccessReceipt] = useState<PaymentReceiptResult | null>(null);

  // Debounced live PayID Confirmation of Payee verification
  useEffect(() => {
    const rawDigits = payIdValue.replace(/[^0-9]/g, "");
    const isReady =
      (payIdType === "phone" && rawDigits.length >= 8) ||
      (payIdType === "email" && payIdValue.includes("@") && payIdValue.length >= 5) ||
      (payIdType === "abn" && rawDigits.length >= 9) ||
      (payIdType === "organization" && payIdValue.length >= 4);

    if (!isReady) {
      setPayIdResolvedPayee(null);
      setIsResolvingPayId(false);
      return;
    }

    let active = true;
    setIsResolvingPayId(true);
    const timer = setTimeout(async () => {
      try {
        const res = await resolvePayIDDirectory(payIdValue, payIdType, payIdSelectedCountryCode);
        if (active && res.isValid) {
          setPayIdResolvedPayee({
            registeredName: res.registeredName,
            payIdType: res.payIdType,
            payIdValue: res.payIdValue,
            countryCode: res.countryCode,
            institution: res.institution,
            fastPaymentEligible: res.fastPaymentEligible,
          });
        }
      } catch (e) {
        console.warn("PayID directory preview note:", e);
      } finally {
        if (active) setIsResolvingPayId(false);
      }
    }, 200);

    return () => {
      active = false;
      clearTimeout(timer);
    };
  }, [payIdValue, payIdType, payIdSelectedCountryCode]);

  // Rewards redemption state
  const [pointsToRedeem, setPointsToRedeem] = useState<number>(10000);
  
  // Round up toggle local state
  const [roundUpActive, setRoundUpActive] = useState<boolean>(true);
  const [roundUpVaultBalance, setRoundUpVaultBalance] = useState<number>(4580.50);

  // Emergency ATM Cardless Cash state
  const [emergencyCode, setEmergencyCode] = useState<string | null>(null);
  const [emergencyCodeTimer, setEmergencyCodeTimer] = useState<number>(30);
  const [isNfcTapModalOpen, setIsNfcTapModalOpen] = useState(false);

  // VIP Privileges Modals
  const [isInsuranceScheduleOpen, setIsInsuranceScheduleOpen] = useState(false);
  const [isLoungePassOpen, setIsLoungePassOpen] = useState(false);
  const [isFxRateModalOpen, setIsFxRateModalOpen] = useState(false);
  const [loungeGateScanned, setLoungeGateScanned] = useState(false);
  const [selectedLoungeAirport, setSelectedLoungeAirport] = useState("SYD - Sydney Kingsford Smith (T1)");
  const [fxForeignAmount, setFxForeignAmount] = useState<number>(5000);
  const [fxSelectedCurrency, setFxSelectedCurrency] = useState<string>("USD");

  // Virtual NFC Tap Animation on Card State
  const [isCardNfcActive, setIsCardNfcActive] = useState(false);
  const [cardNfcSuccess, setCardNfcSuccess] = useState(false);

  if (!isOpen || !card) return null;

  const isFrozen = card.status === "frozen";
  const isAmex = card.network === "AMEX" || card.fullNumber.startsWith("3");

  const handleCopy = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    setCopiedField(label);
    toast.success(`Copied ${label} to clipboard!`);
    setTimeout(() => setCopiedField(null), 2000);
  };

  const handleToggleFreeze = () => {
    const nextFrozen = unifiedBankCardSync.toggleFreeze(card.id);
    const updated = { ...card, status: (nextFrozen ? "frozen" : "active") as any };
    toast.success(nextFrozen ? "Card frozen globally. All charges will be declined." : "Card unfrozen. 100% active and ready.");
    onCardUpdated?.(updated);
  };

  const handleClaimCashback = () => {
    if (card.accumulatedCashback <= 0) {
      toast.info("No cashback currently available to claim.");
      return;
    }
    const claimed = unifiedBankCardSync.claimCashback(card.id);
    const updated = {
      ...card,
      balance: card.balance + claimed,
      accumulatedCashback: 0
    };
    toast.success(`🎉 +$${claimed.toLocaleString("en-AU", { minimumFractionDigits: 2 })} Cashback added directly to card balance!`);
    onCardUpdated?.(updated);
  };

  const handleClaimInterest = () => {
    if (card.accruedInterest <= 0) {
      toast.info("No accrued interest currently available to claim.");
      return;
    }
    const claimed = unifiedBankCardSync.claimInterest(card.id);
    const updated = {
      ...card,
      balance: card.balance + claimed,
      accruedInterest: 0
    };
    toast.success(`💰 +$${claimed.toLocaleString("en-AU", { minimumFractionDigits: 2 })} Daily Compound Interest credited to card!`);
    onCardUpdated?.(updated);
  };

  // 1-Click Redeem Points for Statement Credit
  const handleRedeemPoints = () => {
    const available = card.rewardsPoints || 0;
    if (available < 1000) {
      toast.error("Minimum 1,000 rewards points required to redeem.");
      return;
    }
    const redeemAmount = Math.min(pointsToRedeem, available);
    const credit = (redeemAmount / 10000) * 100; // 10,000 points = $100 AUD
    
    const updated = {
      ...card,
      balance: card.balance + credit,
      rewardsPoints: available - redeemAmount
    };
    unifiedBankCardSync.updateCard(card.id, () => updated);
    toast.success(`🎁 Redeemed ${redeemAmount.toLocaleString()} points for +$${credit.toFixed(2)} AUD Statement Credit!`);
    onCardUpdated?.(updated);
  };

  // 1-Click Sweep All Value
  const handleClaimAllValue = () => {
    const cb = card.accumulatedCashback || 0;
    const intr = card.accruedInterest || 0;
    const totalYield = cb + intr;
    if (totalYield <= 0) {
      toast.info("No pending yield to sweep. Interest compounds daily!");
      return;
    }
    const claimedCb = unifiedBankCardSync.claimCashback(card.id);
    const claimedInt = unifiedBankCardSync.claimInterest(card.id);
    const sum = (claimedCb || cb) + (claimedInt || intr);
    const updated = {
      ...card,
      balance: card.balance + sum,
      accumulatedCashback: 0,
      accruedInterest: 0
    };
    toast.success(`🌟 Total Yield Swept: +$${sum.toLocaleString("en-AU", { minimumFractionDigits: 2 })} AUD credited to card balance!`);
    onCardUpdated?.(updated);
  };

  const handleUpdatePinSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (newPin.length !== 4 || !/^\d{4}$/.test(newPin)) {
      toast.error("PIN must be exactly 4 digits.");
      return;
    }
    if (newPin !== confirmPin) {
      toast.error("PIN confirmation does not match.");
      return;
    }
    unifiedBankCardSync.updatePin(card.id, newPin);
    const updated = { ...card, pin: newPin };
    toast.success("4-Digit Security PIN successfully updated on EMV chip & interbank network!");
    setIsChangingPin(false);
    setNewPin("");
    setConfirmPin("");
    onCardUpdated?.(updated);
  };

  const handleRotateCvv = () => {
    const newCvv = unifiedBankCardSync.rotateCvv(card.id);
    const updated = { ...card, dynamicCvv: newCvv };
    toast.success(`Quantum Dynamic CVV rotated: ${newCvv} (Valid for 60s)`);
    onCardUpdated?.(updated);
  };

  const handleReplaceCard = () => {
    const replaced = unifiedBankCardSync.replaceCard(card.id);
    if (replaced) {
      toast.success("New 16-digit card number and security code generated while retaining balance & cashback!");
      onCardUpdated?.(replaced);
    }
  };

  const handleToggleOnline = () => {
    const nextVal = !card.onlinePaymentsEnabled;
    unifiedBankCardSync.updateLimits(card.id, { online: nextVal });
    const updated = { ...card, onlinePaymentsEnabled: nextVal };
    toast.success(nextVal ? "Online & E-commerce payments enabled" : "Online payments blocked for security");
    onCardUpdated?.(updated);
  };

  const handleToggleInternational = () => {
    const nextVal = !card.internationalPaymentsEnabled;
    unifiedBankCardSync.updateLimits(card.id, { international: nextVal });
    const updated = { ...card, internationalPaymentsEnabled: nextVal };
    toast.success(nextVal ? "International 0% FX payments enabled" : "International transactions blocked");
    onCardUpdated?.(updated);
  };

  const handleToggleContactless = () => {
    const nextVal = !card.contactlessEnabled;
    unifiedBankCardSync.updateLimits(card.id, { contactless: nextVal });
    const updated = { ...card, contactlessEnabled: nextVal };
    toast.success(nextVal ? "Contactless NFC Tap-to-Pay enabled" : "Contactless Tap disabled");
    onCardUpdated?.(updated);
  };

  const handleGenerateEmergencyAtmCode = () => {
    const randomCode = Math.floor(10000000 + Math.random() * 90000000).toString();
    setEmergencyCode(randomCode);
    setEmergencyCodeTimer(30);
    toast.success("8-Digit Cardless Cash Claim Code Generated for CBA, ANZ, Westpac, & NAB ATMs!");
  };

  // Proof of Card Ownership & Statement PDF Generator
  const handleExportStatementPdf = () => {
    try {
      toast.info("Generating APRA Institutional Card Statement PDF...");
      const doc = new jsPDF();

      // Top Banner
      doc.setFillColor(15, 23, 42); // slate-900
      doc.rect(0, 0, 210, 42, "F");

      doc.setFont("helvetica", "bold");
      doc.setFontSize(16);
      doc.setTextColor(255, 255, 255);
      doc.text("VALOURIAN CAPITAL MANAGEMENT", 14, 18);

      doc.setFontSize(9);
      doc.setFont("helvetica", "normal");
      doc.setTextColor(52, 211, 153); // emerald-400
      doc.text("OFFICIAL CERTIFICATE OF BANK CARD OWNERSHIP & ACCOUNT VERIFICATION", 14, 26);
      doc.setTextColor(148, 163, 184);
      doc.text("APRA ADI Authorised Deposit-taking Entity • RBA Exchange Settlement Direct Participant", 14, 32);

      doc.setTextColor(15, 23, 42);
      doc.setFontSize(12);
      doc.setFont("helvetica", "bold");
      doc.text("Cardholder Account Verification & Compliance Details", 14, 52);

      renderAutoTable(doc, {
        startY: 58,
        theme: "grid",
        headStyles: { fillColor: [15, 23, 42], textColor: [255, 255, 255], fontStyle: "bold" },
        styles: { fontSize: 10, cellPadding: 4 },
        head: [["Verification Attribute", "Verified Institutional Record"]],
        body: [
          ["Card Product Name", card.name],
          ["Primary Account Number (PAN)", card.number],
          ["Card Network", card.network],
          ["Cardholder Name", "MR. ASIM ARYAL"],
          ["Available Balance", `$${card.balance.toLocaleString("en-AU", { minimumFractionDigits: 2 })} ${card.currency}`],
          ["Credit Limit", card.limit === "unlimited" ? "Unlimited AUD" : `$${Number(card.limit).toLocaleString()} AUD`],
          ["Status", card.status.toUpperCase()],
          ["Card Expiry Date", card.expiry],
          ["Interbank BSB", card.bsb],
          ["Institutional Account Number", card.accountNumber],
          ["PayID Alias", card.payId],
          ["Daily Spending Limit", `$${card.dailySpendingLimit.toLocaleString()} AUD`],
          ["Daily ATM Withdrawal Limit", `$${card.atmDailyLimit.toLocaleString()} AUD`],
          ["Cashback Rate", `${(card.cashbackRate * 100).toFixed(1)}% on All Spend`],
          ["APY Compound Yield", `${(card.apyInterestRate * 100).toFixed(2)}% p.a.`],
          ["Travel & Purchase Insurance", "APRA $20,000,000 Comprehensive Cover Included"],
          ["Issuance Date", new Date().toLocaleDateString("en-AU")]
        ]
      });

      const finalY = ((doc as any).lastAutoTable?.finalY || 180) + 14;
      doc.setFontSize(8);
      doc.setTextColor(100, 116, 139);
      doc.text(
        "This electronic document serves as definitive proof of cardholder identity, account standing, and interbank liquidity clearance.",
        14,
        finalY
      );

      doc.save(`Valourian_Card_Certificate_${card.last4}.pdf`);
      toast.success("Card Statement PDF successfully downloaded!");
    } catch (err) {
      console.error("PDF generation error:", err);
      toast.error("Failed to generate PDF statement.");
    }
  };

  // Worldwide Travel Insurance Schedule Certificate PDF
  const handleExportInsuranceCertificate = () => {
    try {
      toast.info("Generating APRA Sovereign Worldwide Travel Insurance Schedule PDF...");
      const doc = new jsPDF();

      // Top Banner
      doc.setFillColor(15, 23, 42); // slate-900
      doc.rect(0, 0, 210, 42, "F");

      doc.setFont("helvetica", "bold");
      doc.setFontSize(16);
      doc.setTextColor(255, 255, 255);
      doc.text("VALOURIAN SOVEREIGN UNDERWRITING", 14, 18);

      doc.setFontSize(9);
      doc.setFont("helvetica", "normal");
      doc.setTextColor(52, 211, 153); // emerald-400
      doc.text("WORLDWIDE COMPREHENSIVE TRAVEL & EMERGENCY EVACUATION CERTIFICATE", 14, 26);
      doc.setTextColor(148, 163, 184);
      doc.text("Underwritten by Lloyd's of London & APRA Sovereign Syndicate • Policy Class A-1", 14, 32);

      doc.setTextColor(15, 23, 42);
      doc.setFontSize(12);
      doc.setFont("helvetica", "bold");
      doc.text("Policy Schedule & Coverage Summary", 14, 52);

      const policyNum = `APRA-VAL-POL-2026-${card.id.slice(-6).toUpperCase()}`;

      renderAutoTable(doc, {
        startY: 58,
        theme: "grid",
        headStyles: { fillColor: [15, 23, 42], textColor: [255, 255, 255], fontStyle: "bold" },
        styles: { fontSize: 9, cellPadding: 3.5 },
        head: [["Benefit Category", "Maximum Sum Insured", "Standard Excess"]],
        body: [
          ["Overseas Emergency Medical & Hospitalisation", "$20,000,000 AUD", "NIL ($0.00)"],
          ["Emergency Sovereign Air Evacuation & Repatriation", "UNLIMITED / Sovereign Jet Charter", "NIL ($0.00)"],
          ["Trip Cancellation & Disruption", "$50,000 AUD", "NIL ($0.00)"],
          ["Lost, Stolen or Damaged Luggage & High-Value Items", "$25,000 AUD", "NIL ($0.00)"],
          ["Rental Vehicle Insurance Excess Waiver", "$10,000 AUD", "NIL ($0.00)"],
          ["Accidental Death & Permanent Disablement", "$1,000,000 AUD", "NIL ($0.00)"],
          ["Personal Liability & Legal Defence Cover", "$15,000,000 AUD", "NIL ($0.00)"],
          ["24/7 Global SOS Concierge & Translation", "Immediate Dispatch (+61 2 8999 4400)", "NIL ($0.00)"]
        ]
      });

      const finalY = (doc as any).lastAutoTable?.finalY || 160;

      doc.setFontSize(9);
      doc.setTextColor(100, 116, 139);
      doc.text(`Primary Cardholder: MR. ASIM ARYAL (Founder & Sovereign Executive)`, 14, finalY + 12);
      doc.text(`Attached Card Account: ${card.name} (${card.number})`, 14, finalY + 18);
      doc.text(`Certificate Policy ID: ${policyNum}`, 14, finalY + 24);
      doc.text(`Issue Date: ${new Date().toLocaleDateString("en-AU")} • Status: ACTIVE IN FORCE`, 14, finalY + 30);
      doc.text("Global 24/7 Emergency Medical Hotline: +61 2 8999 4400 / sos@valourian.com.au", 14, finalY + 36);

      doc.save(`Valourian_Travel_Insurance_Certificate_${card.last4}.pdf`);
      toast.success("Travel Insurance Policy Schedule PDF exported successfully!");
    } catch (e) {
      console.error(e);
      toast.error("Failed to generate insurance policy PDF.");
    }
  };

  // Simulate Lounge Scan Sound & Gate Status
  const handleSimulateLoungeScan = () => {
    try {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      if (AudioCtx) {
        const ctx = new AudioCtx();
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = "sine";
        osc.frequency.setValueAtTime(2093, ctx.currentTime);
        gain.gain.setValueAtTime(0.08, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.15);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start();
        osc.stop(ctx.currentTime + 0.15);
      }
    } catch {}
    setLoungeGateScanned(true);
    toast.success(`Access Confirmed! Welcome to the Centurion VIP Lounge, Mr. Asim Aryal.`);
  };

  // Virtual NFC Contactless Tap Simulation with Glowing Border & Success Overlay
  const handleTriggerCardContactlessTest = (e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    if (isFrozen) {
      toast.error("Cannot tap: Card is currently frozen.");
      return;
    }
    setIsCardNfcActive(true);
    setCardNfcSuccess(false);

    // Audio & Haptic feedback
    try {
      if (typeof window !== "undefined" && "navigator" in window && "vibrate" in navigator) {
        navigator.vibrate([35, 50, 90]);
      }
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      if (AudioCtx) {
        const ctx = new AudioCtx();
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = "sine";
        osc.frequency.setValueAtTime(1760, ctx.currentTime);
        gain.gain.setValueAtTime(0.08, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.12);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start();
        osc.stop(ctx.currentTime + 0.12);

        setTimeout(() => {
          const osc2 = ctx.createOscillator();
          const gain2 = ctx.createGain();
          osc2.type = "sine";
          osc2.frequency.setValueAtTime(2637, ctx.currentTime);
          gain2.gain.setValueAtTime(0.09, ctx.currentTime);
          gain2.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.22);
          osc2.connect(gain2);
          gain2.connect(ctx.destination);
          osc2.start();
          osc2.stop(ctx.currentTime + 0.22);
        }, 110);
      }
    } catch {}

    // Subtle 'Success' overlay transition trigger
    setTimeout(() => {
      setCardNfcSuccess(true);
      toast.success(`Virtual NFC Tap Verified on ${card.name}! +$1.75 Cashback Added.`);
      setTimeout(() => {
        setCardNfcSuccess(false);
        setIsCardNfcActive(false);
      }, 3200);
    }, 700);
  };

  // Real-Time PayID Transfer Execution directly from this Bank Card
  const handleExecutePayIdTransfer = async () => {
    if (!card) return;
    const num = parseFloat(payIdAmount.replace(/,/g, ""));
    if (isNaN(num) || num <= 0) {
      toast.error("Please enter a valid transfer amount.");
      return;
    }
    if (num > card.balance) {
      toast.error(`Insufficient balance in ${card.name}. Available: $${card.balance.toLocaleString("en-AU", { minimumFractionDigits: 2 })} AUD`);
      return;
    }
    if (!payIdResolvedPayee && !payIdValue.trim()) {
      toast.error("Please enter a valid recipient PayID.");
      return;
    }

    setIsExecutingPayId(true);
    try {
      const recipientLegal = (payIdCustomLegalName.trim() || payIdResolvedPayee?.registeredName || "VERIFIED RECIPIENT").toUpperCase();
      const institution = payIdResolvedPayee?.institution || "Commonwealth Bank of Australia";

      const receipt = await executeBilateralPayment({
        senderUserId: "asim_aryal",
        senderName: TARGET_LINK_HOLDER,
        senderEmail: TARGET_LINK_EMAIL,
        sourceAccount: {
          id: card.id,
          name: card.name,
          accountNumber: `${card.bsb || '021-000'} ${card.accountNumber || card.last4}`,
          currentBalance: card.balance,
        },
        recipient: {
          name: recipientLegal,
          payIdType: payIdResolvedPayee?.payIdType || payIdType,
          payIdValue: payIdResolvedPayee?.payIdValue || payIdValue.trim(),
          countryCode: payIdResolvedPayee?.countryCode || payIdSelectedCountryCode,
          bankName: institution,
        },
        amount: num,
        currency: "AUD",
        description: payIdDescription || `PayID Transfer from ${card.name}`,
        reference: payIdReference || `NPP-${card.id.slice(0, 4).toUpperCase()}`,
        paymentRail: "osko",
      });

      setPayIdSuccessReceipt(receipt);

      // Re-read card from sync or construct updated state
      const updatedCard = unifiedBankCardSync.getCardById(card.id) || {
        ...card,
        balance: Math.max(0, card.balance - num),
        accumulatedCashback: (card.accumulatedCashback || 0) + (num * (card.cashbackRate || 0.035)),
        rewardsPoints: (card.rewardsPoints || 0) + Math.round(num * 3),
      };
      onCardUpdated?.(updatedCard);

      toast.success(
        `⚡ Fast Payment of $${num.toLocaleString("en-AU", { minimumFractionDigits: 2 })} AUD settled directly to ${recipientLegal}!`,
        { icon: "🏛️" }
      );
    } catch (err: any) {
      toast.error(err.message || "PayID transfer failed to clear.");
    } finally {
      setIsExecutingPayId(false);
    }
  };

  const handleDownloadPayIdPdfReceipt = () => {
    if (!payIdSuccessReceipt || !card) return;
    try {
      generatePdfReceipt({
        id: payIdSuccessReceipt.receiptNumber,
        date: payIdSuccessReceipt.timestamp,
        amount: payIdSuccessReceipt.amount.toFixed(2),
        currency: "AUD",
        merchant: payIdSuccessReceipt.recipientLegalName || payIdSuccessReceipt.recipientName,
        type: "PayID Instant (Osko® / NPP 24/7)",
        status: "DELIVERED & ACCEPTED BY DESTINATION ADI",
        cardNetwork: card.network,
        cardLast4: card.last4 || card.number.slice(-4),
        sealText: "NPP PARTICIPANT APRA RBA DIRECT SETTLED",
      });
      toast.success("Official Signed PayID PDF Receipt Generated!");
    } catch (e) {
      console.error(e);
      toast.error("Failed to generate PDF receipt.");
    }
  };

  // Format card number with spaces (4-4-4-4 or 4-6-5 for Amex)
  const formattedNumber = isAmex
    ? `${card.fullNumber.slice(0, 4)} ${card.fullNumber.slice(4, 10)} ${card.fullNumber.slice(10)}`
    : card.fullNumber.replace(/(\d{4})/g, "$1 ").trim();

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/80 backdrop-blur-md overflow-y-auto">
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 15 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 15 }}
        className="relative w-full max-w-4xl bg-slate-900 border border-slate-800 rounded-3xl shadow-2xl overflow-hidden my-auto max-h-[92vh] flex flex-col text-slate-100"
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800 bg-slate-950/80 shrink-0">
          <div className="flex items-center gap-3">
            <div
              className={`w-10 h-10 rounded-xl flex items-center justify-center text-white shadow-lg ${
                isAmex
                  ? "bg-gradient-to-tr from-blue-700 to-indigo-600 border border-blue-400/40"
                  : "bg-gradient-to-tr from-emerald-600 to-teal-500 border border-emerald-400/40"
              }`}
            >
              <CreditCard className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-bold text-white tracking-tight">{card.name}</h3>
                <span
                  className={`text-[9px] font-mono font-bold px-2 py-0.5 rounded-full border ${
                    isFrozen
                      ? "bg-red-500/20 text-red-400 border-red-500/30"
                      : "bg-emerald-500/20 text-emerald-400 border-emerald-500/30"
                  }`}
                >
                  {isFrozen ? "FROZEN" : "ACTIVE 100%"}
                </span>
                <span className="text-[9px] bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 font-mono font-bold px-2 py-0.5 rounded-full uppercase">
                  {card.network}
                </span>
              </div>
              <p className="text-xs text-slate-400">
                Classic Bank Card Security, Controls & High-Yield Value Suite
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto space-y-6">
          {/* 3D Realistic Interactive Flippable Bank Card Showcase */}
          <div className="flex flex-col items-center">
            <div
              className="relative w-full max-w-[420px] h-[260px] perspective-1000 cursor-pointer select-none"
              onClick={() => setIsFlipped(!isFlipped)}
            >
              {/* Ambient Luminous Diffusion Glow when NFC Tapping */}
              <AnimatePresence>
                {(isCardNfcActive || cardNfcSuccess) && (
                  <motion.div
                    key="modal-card-ambient-glow"
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{
                      opacity: [0.65, 0.95, 0.65],
                      scale: [0.99, 1.03, 0.99],
                    }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
                    className="absolute -inset-2 rounded-3xl blur-xl bg-gradient-to-r from-emerald-500/80 via-teal-400/90 to-emerald-500/80 pointer-events-none z-0"
                  />
                )}
              </AnimatePresence>

              {/* Dynamic Glowing Border Beam Ring */}
              <motion.div
                className="absolute -inset-[2px] rounded-3xl pointer-events-none z-10 transition-all duration-500"
                animate={{
                  opacity: (isCardNfcActive || cardNfcSuccess) ? 1 : 0.35,
                  boxShadow: cardNfcSuccess
                    ? "0 0 35px rgba(16, 185, 129, 0.9), inset 0 0 15px rgba(16, 185, 129, 0.4)"
                    : isCardNfcActive
                    ? "0 0 30px rgba(52, 211, 153, 0.85), inset 0 0 15px rgba(52, 211, 153, 0.35)"
                    : "0 0 0px transparent"
                }}
                style={{
                  borderRadius: '1.5rem',
                  border: (isCardNfcActive || cardNfcSuccess)
                    ? '2px solid rgba(52, 211, 153, 0.9)'
                    : '1px solid rgba(255, 255, 255, 0.1)'
                }}
              />

              <motion.div
                className="w-full h-full relative transform-style-preserve-3d transition-transform duration-700"
                animate={{ 
                  rotateY: isFlipped ? 180 : 0,
                  y: isCardNfcActive && !cardNfcSuccess ? [-6, -18, -6] : 0,
                  rotateX: isCardNfcActive && !cardNfcSuccess ? [0, 10, 0] : 0,
                  scale: isCardNfcActive ? (cardNfcSuccess ? [1.02, 1.05, 1] : 1.03) : 1
                }}
                transition={{ duration: 0.6 }}
              >
                {/* CARD FRONT */}
                <div
                  className={`absolute inset-0 rounded-3xl p-6 flex flex-col justify-between shadow-2xl backface-hidden border overflow-hidden ${
                    isFrozen
                      ? "bg-slate-900/90 border-cyan-400/40 shadow-cyan-900/40"
                      : isAmex
                      ? "bg-gradient-to-br from-slate-950 via-slate-900 to-blue-950/80 border-blue-500/40 shadow-blue-950/60"
                      : "bg-gradient-to-br from-slate-950 via-slate-900 to-emerald-950/80 border-emerald-500/40 shadow-emerald-950/60"
                  }`}
                >
                  {/* Subtle sheen overlay */}
                  <div className="absolute -right-20 -top-20 w-60 h-60 bg-white/5 rounded-full blur-2xl pointer-events-none" />

                  {/* Frozen Overlay */}
                  {isFrozen && (
                    <div className="absolute inset-0 bg-cyan-950/70 backdrop-blur-xs flex flex-col items-center justify-center text-cyan-300 z-20">
                      <Lock className="w-10 h-10 mb-2 animate-pulse text-cyan-400" />
                      <span className="text-sm font-black tracking-widest uppercase">CARD FROZEN</span>
                      <span className="text-[10px] text-cyan-200/70">Click Unfreeze to restore spending</span>
                    </div>
                  )}

                  {/* Top Bar: Bank Logo & Contactless */}
                  <div className="flex items-center justify-between relative z-10">
                    <div className="flex items-center gap-2">
                      <div className="w-7 h-7 rounded-lg bg-white/10 flex items-center justify-center font-black text-xs text-white">
                        V
                      </div>
                      <span className="text-xs font-black tracking-wider uppercase text-white/90">
                        {card.name.split(" ")[0]} SOVEREIGN
                      </span>
                    </div>

                    <div className="flex items-center gap-2">
                      {/* Virtual NFC Tap Trigger Simulation Button */}
                      <button
                        onClick={handleTriggerCardContactlessTest}
                        className="flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-emerald-500/10 hover:bg-emerald-500/25 text-emerald-300 border border-emerald-500/30 transition-all cursor-pointer"
                        title="Simulate Virtual NFC Tap Animation on this Card"
                      >
                        <Wifi className="w-3.5 h-3.5 text-emerald-400 rotate-90" />
                        <span className="text-[9px] font-mono font-bold">NFC TAP</span>
                      </button>
                      <span className="text-[10px] font-mono text-emerald-400 font-bold bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">
                        {card.type.toUpperCase()}
                      </span>
                    </div>
                  </div>

                  {/* Middle: Golden EMV Chip & Available Balance */}
                  <div className="flex items-center justify-between my-2 relative z-10">
                    <div className="w-12 h-9 rounded-md bg-gradient-to-tr from-amber-400 via-yellow-200 to-amber-500 border border-amber-600/60 shadow-inner flex flex-col justify-around p-1">
                      <div className="h-0.5 bg-amber-700/40 rounded-full" />
                      <div className="h-0.5 bg-amber-700/40 rounded-full" />
                      <div className="h-0.5 bg-amber-700/40 rounded-full" />
                    </div>

                    <div className="text-right">
                      <span className="text-[10px] font-mono uppercase tracking-widest text-slate-400">Available Balance</span>
                      <div className="text-lg font-black text-white font-mono">
                        {formatCurrency(convertCurrency(card.balance, card.currency, globalCur), globalCur)}
                      </div>
                    </div>
                  </div>

                  {/* Bottom: Card Number, Expiry, Cardholder, Network */}
                  <div className="space-y-2 relative z-10">
                    <div className="text-lg sm:text-xl font-mono tracking-widest font-black text-white drop-shadow-md">
                      {formattedNumber}
                    </div>

                    <div className="flex items-end justify-between pt-1">
                      <div>
                        <div className="text-[9px] text-slate-400 uppercase tracking-widest">Cardholder</div>
                        <div className="text-xs font-black text-white uppercase tracking-wider font-mono">
                          MR. ASIM ARYAL
                        </div>
                      </div>

                      <div className="text-center">
                        <div className="text-[9px] text-slate-400 uppercase tracking-widest">Expires</div>
                        <div className="text-xs font-bold text-white font-mono">{card.expiry}</div>
                      </div>

                      <div className="text-right">
                        <span className="text-base font-black italic tracking-tight text-white/90">
                          {card.network}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* ============================================================== */}
                  {/* SUBTLE 'SUCCESS' OVERLAY TRANSITION (FRAMER MOTION) */}
                  {/* ============================================================== */}
                  <AnimatePresence>
                    {cardNfcSuccess && (
                      <motion.div
                        key="modal-card-success-overlay"
                        initial={{ opacity: 0, scale: 0.94, backdropFilter: "blur(0px)" }}
                        animate={{ opacity: 1, scale: 1, backdropFilter: "blur(8px)" }}
                        exit={{ opacity: 0, scale: 0.96, backdropFilter: "blur(0px)" }}
                        transition={{ duration: 0.45, ease: [0.16, 1, 0.3, 1] }}
                        className="absolute inset-0 bg-slate-950/85 rounded-3xl flex flex-col items-center justify-center p-4 text-center z-30 overflow-hidden"
                      >
                        {/* Shimmer Specular Light Sweep */}
                        <motion.div
                          initial={{ x: "-100%" }}
                          animate={{ x: "200%" }}
                          transition={{ duration: 1.0, ease: "easeInOut", delay: 0.1 }}
                          className="absolute inset-0 w-2/3 h-full bg-gradient-to-r from-transparent via-emerald-300/25 to-transparent skew-x-12 pointer-events-none"
                        />

                        {/* Concentric Contactless Wave Rings */}
                        <div className="relative flex items-center justify-center mb-2.5">
                          <motion.div
                            initial={{ scale: 0.6, opacity: 0.8 }}
                            animate={{ scale: [1, 2.4], opacity: [0.8, 0] }}
                            transition={{ duration: 1.8, repeat: Infinity, ease: "easeOut" }}
                            className="absolute w-14 h-14 rounded-full border-2 border-emerald-400/60 pointer-events-none"
                          />
                          <motion.div
                            initial={{ scale: 0.6, opacity: 0.8 }}
                            animate={{ scale: [1, 1.9], opacity: [0.8, 0] }}
                            transition={{ duration: 1.8, delay: 0.45, repeat: Infinity, ease: "easeOut" }}
                            className="absolute w-14 h-14 rounded-full border border-teal-300/50 pointer-events-none"
                          />
                          <div className="w-11 h-11 rounded-full bg-emerald-500/20 border border-emerald-400/60 flex items-center justify-center shadow-[0_0_20px_rgba(16,185,129,0.7)] z-10">
                            <motion.div
                              initial={{ scale: 0, rotate: -45 }}
                              animate={{ scale: 1, rotate: 0 }}
                              transition={{ type: "spring", stiffness: 350, damping: 20, delay: 0.15 }}
                            >
                              <CheckCircle2 className="w-6 h-6 text-emerald-300" />
                            </motion.div>
                          </div>
                        </div>

                        {/* Subtle Typography */}
                        <motion.div
                          initial={{ opacity: 0, y: 5 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: 0.2, duration: 0.35 }}
                          className="space-y-0.5"
                        >
                          <div className="text-[10px] font-mono font-black tracking-widest text-emerald-400 uppercase">
                            Contactless Approved
                          </div>
                          <div className="text-sm font-black text-white font-mono">
                            ISO/IEC 14443 Verified
                          </div>
                          <div className="text-[9px] font-mono text-emerald-300/80">
                            ARQC: {card.id.slice(-6).toUpperCase()} • RBA DIRECT SETTLED
                          </div>
                          <div className="text-[9px] font-mono text-amber-300 font-bold pt-0.5">
                            +${(card.cashbackRate * 50).toFixed(2)} AUD Cashback Credited
                          </div>
                        </motion.div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>

                {/* CARD BACK */}
                <div
                  className={`absolute inset-0 rounded-3xl flex flex-col justify-between shadow-2xl backface-hidden rotate-y-180 border overflow-hidden ${
                    isAmex
                      ? "bg-slate-950 border-blue-500/40"
                      : "bg-slate-950 border-emerald-500/40"
                  }`}
                >
                  {/* Magnetic Stripe */}
                  <div className="w-full h-11 bg-slate-950 border-y border-slate-800 mt-5" />

                  {/* Signature Strip & CVV Box */}
                  <div className="px-6 py-2">
                    <div className="flex items-center gap-3">
                      <div className="flex-1 h-9 bg-slate-200 rounded text-slate-800 font-mono italic text-[11px] flex items-center px-3 tracking-widest font-bold">
                        AUTHORIZED SIGNATURE — NOT VALID UNLESS SIGNED
                      </div>
                      <div className="h-9 px-3 bg-white text-slate-950 font-mono font-black text-sm flex items-center justify-center rounded border border-slate-300 shadow-inner">
                        {card.dynamicCvv || card.cvv}
                      </div>
                    </div>
                    <div className="flex items-center justify-between text-[9px] text-slate-400 font-mono mt-1">
                      <span>CVC2 / CVV Security Code</span>
                      <span>PIN: {card.pin || "4912"}</span>
                    </div>
                  </div>

                  {/* Australian Bank Routing & Concierge Info */}
                  <div className="px-6 pb-5 space-y-1.5 text-[9px] font-mono text-slate-400 border-t border-slate-800/80 pt-3">
                    <div className="flex items-center justify-between text-slate-300">
                      <span>BSB: <strong className="text-emerald-400">{card.bsb}</strong></span>
                      <span>ACC: <strong className="text-emerald-400">{card.accountNumber}</strong></span>
                      <span>PAYID: <strong className="text-indigo-400">{card.payId}</strong></span>
                    </div>
                    <div className="text-[8px] text-slate-500 leading-tight">
                      This card is issued by Valourian Capital Management Ltd pursuant to license by {card.network}.
                      Clears via RBA Exchange Settlement Direct Participant & NPP instant settlement.
                    </div>
                    <div className="flex items-center justify-between text-[8px] text-emerald-400/90 font-bold">
                      <span>24/7 Sovereign Concierge: +61 2 8000 8888</span>
                      <span>APRA ADI AUTHORISED</span>
                    </div>
                  </div>
                </div>
              </motion.div>
            </div>

            <button
              onClick={() => setIsFlipped(!isFlipped)}
              className="mt-3 text-xs text-slate-400 hover:text-white flex items-center gap-1.5 font-bold transition-colors cursor-pointer"
            >
              <RefreshCw className="w-3.5 h-3.5 text-emerald-400" />
              <span>Click Card or Tap Here to Flip ({isFlipped ? "Show Front" : "Show Back & CVV"})</span>
            </button>
          </div>

          {/* Quick Tabs Menu for Card Management */}
          <div className="flex flex-wrap gap-2 border-b border-slate-800 pb-3">
            {[
              { id: "controls", label: "Security & Controls", icon: ShieldCheck },
              { id: "payid", label: "PayID Instant Transfers", icon: Send, badge: "NPP 24/7" },
              { id: "value", label: "Rewards & Yield Vault", icon: TrendingUp, badge: "Gain Value" },
              { id: "pin", label: "PIN Management", icon: Key },
              { id: "limits", label: "Limits & Channels", icon: Sliders },
              { id: "statements", label: "Statements & ATM Cash", icon: FileText }
            ].map((tab) => (
              <button
                key={`card-tab-${tab.id}`}
                onClick={() => setActiveTab(tab.id as any)}
                className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 cursor-pointer ${
                  activeTab === tab.id
                    ? "bg-emerald-500 text-slate-950 font-black shadow-lg shadow-emerald-500/20"
                    : "bg-slate-950 text-slate-400 hover:text-white hover:bg-slate-800 border border-slate-800"
                }`}
              >
                <tab.icon className="w-3.5 h-3.5" />
                <span>{tab.label}</span>
                {tab.badge && (
                  <span className="text-[9px] bg-amber-400 text-slate-950 font-black px-1.5 py-0.2 rounded-full">
                    {tab.badge}
                  </span>
                )}
              </button>
            ))}
          </div>

          {/* TAB 1: Controls & Actions */}
          {activeTab === "controls" && (
            <div className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                {/* Freeze Button */}
                <button
                  onClick={handleToggleFreeze}
                  className={`p-4 rounded-2xl border text-left transition-all cursor-pointer ${
                    isFrozen
                      ? "bg-red-500/20 border-red-500/40 text-red-200"
                      : "bg-slate-950 border-slate-800 hover:border-slate-700 text-slate-200"
                  }`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-[10px] font-black uppercase tracking-wider text-slate-400">Lock State</span>
                    {isFrozen ? <Lock className="w-4 h-4 text-red-400" /> : <Unlock className="w-4 h-4 text-emerald-400" />}
                  </div>
                  <div className="text-sm font-bold text-white">{isFrozen ? "Card Frozen" : "Card Active"}</div>
                  <p className="text-[10px] text-slate-400 mt-1">
                    {isFrozen ? "Click to unfreeze card globally" : "Instantly block all charges globally"}
                  </p>
                </button>

                {/* Rotate Dynamic CVV */}
                <button
                  onClick={handleRotateCvv}
                  className="p-4 rounded-2xl bg-slate-950 border border-slate-800 hover:border-slate-700 text-left transition-all cursor-pointer"
                >
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-[10px] font-black uppercase tracking-wider text-slate-400">Dynamic CVV</span>
                    <RefreshCw className="w-4 h-4 text-indigo-400" />
                  </div>
                  <div className="text-sm font-bold text-white font-mono">{card.dynamicCvv || card.cvv}</div>
                  <p className="text-[10px] text-slate-400 mt-1">Rotate 3-digit security code on demand</p>
                </button>

                {/* Replace / Re-issue Card */}
                <button
                  onClick={handleReplaceCard}
                  className="p-4 rounded-2xl bg-slate-950 border border-slate-800 hover:border-slate-700 text-left transition-all cursor-pointer"
                >
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-[10px] font-black uppercase tracking-wider text-slate-400">Re-Issue</span>
                    <CreditCard className="w-4 h-4 text-amber-400" />
                  </div>
                  <div className="text-sm font-bold text-white">Replace Card</div>
                  <p className="text-[10px] text-slate-400 mt-1">Generate new 16-digit PAN while keeping balance</p>
                </button>

                {/* Apple Wallet / Google Pay */}
                <button
                  onClick={() => toast.success("Card token pushed to Apple Wallet & Google Pay")}
                  className="p-4 rounded-2xl bg-slate-950 border border-slate-800 hover:border-slate-700 text-left transition-all cursor-pointer"
                >
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-[10px] font-black uppercase tracking-wider text-slate-400">Digital Wallet</span>
                    <Smartphone className="w-4 h-4 text-emerald-400" />
                  </div>
                  <div className="text-sm font-bold text-white">Apple & Google Pay</div>
                  <p className="text-[10px] text-slate-400 mt-1">Instant NFC contactless provisioning</p>
                </button>

                {/* Virtual NFC Tap on Mocked Terminal */}
                <button
                  onClick={() => setIsNfcTapModalOpen(true)}
                  className="p-4 rounded-2xl bg-gradient-to-br from-emerald-950/60 to-slate-950 border border-emerald-500/40 hover:border-emerald-500/60 text-left transition-all cursor-pointer shadow-lg sm:col-span-1 lg:col-span-2 group"
                >
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="text-[10px] font-black uppercase tracking-wider text-emerald-400">Virtual NFC Contactless Engine</span>
                    <SmartphoneNfc className="w-4 h-4 text-emerald-400 animate-pulse" />
                  </div>
                  <div className="text-sm font-bold text-white flex items-center gap-2">
                    <span>Tap on Mocked Terminal</span>
                    <span className="text-[9px] font-mono text-emerald-400 bg-emerald-500/20 px-2 py-0.5 rounded-full border border-emerald-500/30">
                      3D HAPTIC
                    </span>
                  </div>
                  <p className="text-[10px] text-slate-400 mt-0.5">
                    Test contactless card tap with 3D animation, glowing border & instant cashback.
                  </p>
                </button>

                {/* PayID Instant Transfer Quick Action Tile */}
                <button
                  onClick={() => setActiveTab("payid")}
                  className="p-4 rounded-2xl bg-gradient-to-br from-blue-950/60 via-indigo-950/60 to-slate-950 border border-blue-500/40 hover:border-blue-400 text-left transition-all cursor-pointer shadow-lg sm:col-span-1 lg:col-span-2 group"
                >
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="text-[10px] font-black uppercase tracking-wider text-blue-400">NPP 24/7 PayID Settlement</span>
                    <Send className="w-4 h-4 text-blue-400 group-hover:translate-x-1 transition-transform" />
                  </div>
                  <div className="text-sm font-bold text-white flex items-center gap-2">
                    <span>Send PayID Transfer</span>
                    <span className="text-[9px] font-mono text-emerald-400 bg-emerald-500/20 px-2 py-0.5 rounded-full border border-emerald-500/30 font-bold">
                      +{((card.cashbackRate || 0.035) * 100).toFixed(1)}% YIELD
                    </span>
                  </div>
                  <p className="text-[10px] text-slate-400 mt-0.5">
                    Execute real-time Osko & PayID transfers directly from this card with bilateral clearance.
                  </p>
                </button>
              </div>

              {/* Quick Details Copy */}
              <div className="p-4 bg-slate-950 border border-slate-800 rounded-2xl space-y-3">
                <span className="text-[10px] font-black uppercase tracking-wider text-slate-400 block">
                  Quick Copy Australian Account Data
                </span>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs font-mono">
                  <div
                    onClick={() => handleCopy(card.fullNumber, "Card Number")}
                    className="p-2.5 bg-slate-900 border border-slate-800 rounded-xl hover:border-slate-700 transition-colors cursor-pointer flex items-center justify-between"
                  >
                    <div>
                      <div className="text-[9px] text-slate-500 uppercase">Card Number</div>
                      <div className="text-white font-bold">{card.number}</div>
                    </div>
                    <Copy className="w-3.5 h-3.5 text-slate-400" />
                  </div>

                  <div
                    onClick={() => handleCopy(card.bsb, "BSB")}
                    className="p-2.5 bg-slate-900 border border-slate-800 rounded-xl hover:border-slate-700 transition-colors cursor-pointer flex items-center justify-between"
                  >
                    <div>
                      <div className="text-[9px] text-slate-500 uppercase">BSB</div>
                      <div className="text-emerald-400 font-bold">{card.bsb}</div>
                    </div>
                    <Copy className="w-3.5 h-3.5 text-slate-400" />
                  </div>

                  <div
                    onClick={() => handleCopy(card.accountNumber, "Account Number")}
                    className="p-2.5 bg-slate-900 border border-slate-800 rounded-xl hover:border-slate-700 transition-colors cursor-pointer flex items-center justify-between"
                  >
                    <div>
                      <div className="text-[9px] text-slate-500 uppercase">Account</div>
                      <div className="text-emerald-400 font-bold">{card.accountNumber}</div>
                    </div>
                    <Copy className="w-3.5 h-3.5 text-slate-400" />
                  </div>

                  <div
                    onClick={() => handleCopy(card.payId, "PayID")}
                    className="p-2.5 bg-slate-900 border border-slate-800 rounded-xl hover:border-slate-700 transition-colors cursor-pointer flex items-center justify-between"
                  >
                    <div>
                      <div className="text-[9px] text-slate-500 uppercase">PayID</div>
                      <div className="text-indigo-400 font-bold truncate max-w-[100px]">{card.payId}</div>
                    </div>
                    <Copy className="w-3.5 h-3.5 text-slate-400" />
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB: PayID Instant Transfers (NPP 24/7 Rails directly from each Card) */}
          {activeTab === "payid" && (
            <div className="space-y-5">
              {/* Card Header & Yield Status */}
              <div className="p-4 rounded-2xl bg-gradient-to-r from-blue-950/60 via-indigo-950/70 to-slate-950 border border-blue-500/40 shadow-lg flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <div className={`w-11 h-11 rounded-2xl flex items-center justify-center font-black text-white shadow-md ${
                    isAmex
                      ? "bg-gradient-to-br from-blue-600 to-indigo-800 border border-blue-400/40"
                      : "bg-gradient-to-br from-emerald-600 to-teal-800 border border-emerald-400/40"
                  }`}>
                    <CreditCard className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h4 className="text-sm font-black text-white tracking-tight">{card.name}</h4>
                      <span className="text-[9px] font-mono px-2 py-0.5 rounded-full bg-blue-500/20 text-blue-300 border border-blue-500/30 font-bold uppercase">
                        {card.network}
                      </span>
                    </div>
                    <div className="text-xs text-slate-400 font-mono mt-0.5 flex items-center gap-2 flex-wrap">
                      <span>BSB: <strong className="text-emerald-400">{card.bsb || '021-000'}</strong></span>
                      <span>•</span>
                      <span>ACC: <strong className="text-emerald-400">{card.accountNumber || card.last4}</strong></span>
                      <span>•</span>
                      <span>PayID: <strong className="text-indigo-300">{card.payId || TARGET_LINK_EMAIL}</strong></span>
                    </div>
                  </div>
                </div>

                <div className="text-left sm:text-right shrink-0">
                  <span className="text-[10px] uppercase font-black tracking-wider text-slate-400 block">Available Balance</span>
                  <div className="text-xl font-black text-white font-mono">
                    ${card.balance.toLocaleString("en-AU", { minimumFractionDigits: 2 })} <span className="text-xs text-emerald-400 font-bold">AUD</span>
                  </div>
                  <span className="text-[10px] font-bold text-amber-300 bg-amber-500/20 px-2 py-0.5 rounded-full border border-amber-500/30 inline-flex items-center gap-1 mt-1">
                    <Sparkles className="w-2.5 h-2.5" />
                    +{((card.cashbackRate || 0.035) * 100).toFixed(1)}% Instant Cashback
                  </span>
                </div>
              </div>

              {/* SUCCESS RECEIPT STATE */}
              {payIdSuccessReceipt ? (
                <motion.div
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="bg-slate-950 border border-emerald-500/40 rounded-2xl p-6 shadow-2xl space-y-6"
                >
                  <div className="text-center">
                    <div className="w-16 h-16 rounded-full bg-emerald-500/20 border-2 border-emerald-400 text-emerald-300 flex items-center justify-center mx-auto mb-3 shadow-[0_0_30px_rgba(16,185,129,0.4)]">
                      <Check className="w-8 h-8" strokeWidth={3} />
                    </div>
                    <span className="text-xs font-black uppercase tracking-widest text-emerald-400">
                      Payment Accepted & Dispatched 24/7
                    </span>
                    <h3 className="text-2xl font-black text-white mt-1">
                      ${payIdSuccessReceipt.amount.toLocaleString("en-AU", { minimumFractionDigits: 2, maximumFractionDigits: 2 })} AUD
                    </h3>
                    <p className="text-xs text-slate-300 mt-1">
                      Instantly credited to <strong className="text-white">{payIdSuccessReceipt.recipientLegalName || payIdSuccessReceipt.recipientName}</strong> via NPP / Osko®
                    </p>
                  </div>

                  {/* Receipt Details Grid */}
                  <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-4 divide-y divide-slate-800 text-xs">
                    <div className="pb-2.5 flex justify-between items-center">
                      <span className="text-slate-400 uppercase font-bold text-[10px]">Receipt Number</span>
                      <span className="font-mono text-white font-bold">{payIdSuccessReceipt.receiptNumber}</span>
                    </div>
                    <div className="py-2.5 flex justify-between items-center">
                      <span className="text-slate-400 uppercase font-bold text-[10px]">Settlement Timestamp</span>
                      <span className="text-slate-200 font-mono">{payIdSuccessReceipt.timestamp}</span>
                    </div>
                    <div className="py-2.5 flex justify-between items-center">
                      <span className="text-slate-400 uppercase font-bold text-[10px]">Destination Bank</span>
                      <span className="text-white font-bold">{payIdSuccessReceipt.destinationBank}</span>
                    </div>
                    <div className="py-2.5 flex justify-between items-center">
                      <span className="text-slate-400 uppercase font-bold text-[10px]">Recipient PayID</span>
                      <span className="text-indigo-300 font-mono">{payIdSuccessReceipt.recipientTarget}</span>
                    </div>
                    <div className="py-2.5 flex justify-between items-center">
                      <span className="text-slate-400 uppercase font-bold text-[10px]">Debited Card</span>
                      <span className="text-slate-200">{card.name} (••• {card.last4 || card.number.slice(-4)})</span>
                    </div>
                    <div className="py-2.5 flex justify-between items-center">
                      <span className="text-slate-400 uppercase font-bold text-[10px]">Cashback Yield Credited</span>
                      <span className="text-amber-300 font-mono font-bold">
                        +${(payIdSuccessReceipt.amount * (card.cashbackRate || 0.035)).toLocaleString("en-AU", { minimumFractionDigits: 2, maximumFractionDigits: 2 })} AUD
                      </span>
                    </div>
                    <div className="pt-2.5 flex justify-between items-center">
                      <span className="text-slate-400 uppercase font-bold text-[10px]">RBA Direct Stream</span>
                      <span className="px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 text-[10px] font-black uppercase border border-emerald-500/30">
                        RTGS 0ms Finality
                      </span>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                    <button
                      onClick={handleDownloadPayIdPdfReceipt}
                      className="py-3 px-4 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-slate-950 font-black text-xs uppercase tracking-wider flex items-center justify-center gap-2 cursor-pointer shadow-lg shadow-emerald-500/20 transition-all"
                    >
                      <Download className="w-4 h-4" />
                      <span>Download Signed PayID PDF Receipt</span>
                    </button>
                    <button
                      onClick={() => {
                        setPayIdSuccessReceipt(null);
                        setPayIdAmount("");
                        setPayIdValue("");
                        setPayIdResolvedPayee(null);
                      }}
                      className="py-3 px-4 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-2 cursor-pointer transition-colors"
                    >
                      <RefreshCw className="w-4 h-4 text-slate-400" />
                      <span>Send Another PayID Transfer</span>
                    </button>
                  </div>
                </motion.div>
              ) : (
                <div className="space-y-4">
                  {/* Step 1: Recipient PayID Identification */}
                  <div className="bg-slate-950 border border-slate-800 rounded-2xl p-5 space-y-4">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-black uppercase tracking-wider text-slate-400 flex items-center gap-2">
                        <Send className="w-3.5 h-3.5 text-blue-400" />
                        1. Enter Recipient PayID
                      </span>
                      <span className="text-[10px] font-mono text-emerald-400 font-bold bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">
                        NPP Central Directory (Live CoP)
                      </span>
                    </div>

                    {/* PayID Type Pills */}
                    <div className="grid grid-cols-4 gap-2">
                      {[
                        { id: "phone", label: "Mobile" },
                        { id: "email", label: "Email" },
                        { id: "abn", label: "ABN / Tax" },
                        { id: "organization", label: "Org ID" },
                      ].map((t) => (
                        <button
                          key={`payid-type-${t.id}`}
                          type="button"
                          onClick={() => {
                            setPayIdType(t.id as any);
                            setPayIdValue("");
                            setPayIdResolvedPayee(null);
                          }}
                          className={`py-2 px-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                            payIdType === t.id
                              ? "bg-blue-600 text-white font-black shadow-md shadow-blue-600/30"
                              : "bg-slate-900 text-slate-400 hover:text-white hover:bg-slate-800 border border-slate-800"
                          }`}
                        >
                          {t.label}
                        </button>
                      ))}
                    </div>

                    {/* Input Field with Country Code for Mobile */}
                    <div className="flex gap-2">
                      {payIdType === "phone" && (
                        <select
                          value={payIdSelectedCountryCode}
                          onChange={(e) => setPayIdSelectedCountryCode(e.target.value)}
                          className="bg-slate-900 border border-slate-800 rounded-xl px-3 py-3 text-xs font-bold text-white focus:outline-none focus:border-blue-500"
                        >
                          {SUPPORTED_COUNTRY_CODES.map((item) => (
                            <option key={`cc-${item.code}`} value={item.code} className="bg-slate-900 text-white">
                              {item.flag} {item.code} ({item.country})
                            </option>
                          ))}
                        </select>
                      )}

                      <div className="relative flex-1">
                        <input
                          type={payIdType === "email" ? "email" : "text"}
                          value={payIdValue}
                          onChange={(e) => setPayIdValue(e.target.value)}
                          placeholder={
                            payIdType === "phone"
                              ? "0400 286 693"
                              : payIdType === "email"
                              ? "asim.nsw@gmail.com"
                              : payIdType === "abn"
                              ? "51 824 753 556"
                              : "ORG-AU-XXXXX"
                          }
                          className="w-full bg-slate-900 border border-slate-800 rounded-xl px-4 py-3 text-sm font-mono font-bold text-white placeholder:text-slate-500 focus:outline-none focus:border-blue-500"
                        />
                        {payIdValue && (
                          <button
                            type="button"
                            onClick={() => {
                              setPayIdValue("");
                              setPayIdResolvedPayee(null);
                            }}
                            className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white"
                          >
                            <X className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                    </div>

                    {/* Quick Demo Shortcuts */}
                    <div className="space-y-1.5 pt-1">
                      <span className="text-[10px] text-slate-500 uppercase font-black">Quick Fill Certified PayIDs:</span>
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                        <button
                          type="button"
                          onClick={() => {
                            setPayIdType("phone");
                            setPayIdSelectedCountryCode("+61");
                            setPayIdValue("0400 286 693");
                          }}
                          className="p-2 bg-slate-900 hover:bg-slate-800 border border-slate-800 rounded-xl text-left text-xs transition-colors cursor-pointer"
                        >
                          <div className="font-bold text-white">Christopher Scott</div>
                          <div className="text-[10px] text-slate-400 font-mono">+61 0400 286 693</div>
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            setPayIdType("email");
                            setPayIdValue("asim.nsw@gmail.com");
                          }}
                          className="p-2 bg-slate-900 hover:bg-slate-800 border border-slate-800 rounded-xl text-left text-xs transition-colors cursor-pointer"
                        >
                          <div className="font-bold text-white">Asim Aryal</div>
                          <div className="text-[10px] text-slate-400 font-mono">asim.nsw@gmail.com</div>
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            setPayIdType("abn");
                            setPayIdValue("51 824 753 556");
                          }}
                          className="p-2 bg-slate-900 hover:bg-slate-800 border border-slate-800 rounded-xl text-left text-xs transition-colors cursor-pointer"
                        >
                          <div className="font-bold text-white">Valourian Capital</div>
                          <div className="text-[10px] text-slate-400 font-mono">ABN 51 824 753 556</div>
                        </button>
                      </div>
                    </div>

                    {/* Confirmation of Payee Live Box */}
                    {isResolvingPayId && (
                      <div className="p-3 rounded-xl bg-blue-950/40 border border-blue-500/30 flex items-center gap-2.5 text-xs text-blue-300 animate-pulse">
                        <Loader2 className="w-4 h-4 animate-spin text-blue-400" />
                        <span>Querying Australian NPP Confirmation of Payee central directory...</span>
                      </div>
                    )}

                    {payIdResolvedPayee && (
                      <div className="p-4 rounded-xl bg-emerald-950/40 border border-emerald-500/40 space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="text-[10px] font-black uppercase tracking-wider text-emerald-400 flex items-center gap-1.5">
                            <ShieldCheck className="w-3.5 h-3.5" />
                            Confirmation of Payee: 100% Match
                          </span>
                          <span className="text-[10px] font-mono text-slate-400">Osko Verified</span>
                        </div>
                        <div className="flex items-center justify-between">
                          <div>
                            <div className="text-sm font-black text-white flex items-center gap-1.5">
                              <span>{payIdCustomLegalName || payIdResolvedPayee.registeredName}</span>
                              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                            </div>
                            <div className="text-xs text-slate-400 font-mono">
                              {payIdResolvedPayee.institution} • {payIdResolvedPayee.countryCode ? `${payIdResolvedPayee.countryCode} ` : ""}{payIdResolvedPayee.payIdValue}
                            </div>
                          </div>
                          <button
                            type="button"
                            onClick={() => {
                              const newName = window.prompt("Confirm or Refine Recipient Legal Name:", payIdCustomLegalName || payIdResolvedPayee.registeredName);
                              if (newName && newName.trim()) setPayIdCustomLegalName(newName.trim().toUpperCase());
                            }}
                            className="text-[11px] text-blue-400 hover:underline font-bold cursor-pointer"
                          >
                            Refine Name
                          </button>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Step 2: Amount & Cashback Yield */}
                  <div className="bg-slate-950 border border-slate-800 rounded-2xl p-5 space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-black uppercase tracking-wider text-slate-400">
                        2. Transfer Amount (AUD)
                      </span>
                      <span className="text-xs text-slate-400 font-mono">
                        Available: <strong className="text-white">${card.balance.toLocaleString("en-AU", { minimumFractionDigits: 2 })}</strong>
                      </span>
                    </div>

                    <div className="relative flex items-center">
                      <span className="text-2xl font-black text-slate-500 mr-2">$</span>
                      <input
                        type="number"
                        step="any"
                        value={payIdAmount}
                        onChange={(e) => setPayIdAmount(e.target.value)}
                        placeholder="0.00"
                        className="w-full text-2xl font-black text-white placeholder:text-slate-700 bg-transparent focus:outline-none font-mono"
                      />
                    </div>

                    {/* Quick Amount Chips */}
                    <div className="flex flex-wrap gap-1.5 pt-1">
                      {[50, 250, 1000, 5000, 25000].map((val) => (
                        <button
                          key={`payid-amt-${val}`}
                          type="button"
                          onClick={() => setPayIdAmount(String(val))}
                          className="py-1.5 px-3 rounded-lg bg-slate-900 hover:bg-blue-600 text-xs font-bold text-slate-300 hover:text-white transition-colors cursor-pointer"
                        >
                          +${val.toLocaleString()}
                        </button>
                      ))}
                      <button
                        type="button"
                        onClick={() => setPayIdAmount(String(card.balance))}
                        className="py-1.5 px-3 rounded-lg bg-slate-900 hover:bg-emerald-600 text-xs font-bold text-slate-300 hover:text-white transition-colors cursor-pointer"
                      >
                        Max Balance
                      </button>
                    </div>

                    {/* Live Cashback Yield Banner */}
                    {parseFloat(payIdAmount || "0") > 0 && (
                      <div className="p-3 rounded-xl bg-gradient-to-r from-emerald-950/40 via-teal-950/40 to-slate-950 border border-emerald-500/30 flex items-center justify-between text-xs text-emerald-300">
                        <div className="flex items-center gap-1.5 font-bold">
                          <Sparkles className="w-4 h-4 text-emerald-400" />
                          <span>Direct Card Cashback Yield:</span>
                        </div>
                        <span className="font-mono font-black text-amber-300">
                          +${(parseFloat(payIdAmount) * (card.cashbackRate || 0.035)).toLocaleString("en-AU", { minimumFractionDigits: 2, maximumFractionDigits: 2 })} AUD ({((card.cashbackRate || 0.035) * 100).toFixed(1)}%)
                        </span>
                      </div>
                    )}
                  </div>

                  {/* Step 3: Description & Reference */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div className="bg-slate-950 border border-slate-800 rounded-2xl p-4 space-y-1.5">
                      <label className="text-[10px] font-black uppercase tracking-wider text-slate-400 block">
                        Description (For Recipient)
                      </label>
                      <input
                        type="text"
                        maxLength={280}
                        value={payIdDescription}
                        onChange={(e) => setPayIdDescription(e.target.value)}
                        placeholder="e.g. Invoice settlement, Services"
                        className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white placeholder:text-slate-600 focus:outline-none focus:border-blue-500"
                      />
                    </div>
                    <div className="bg-slate-950 border border-slate-800 rounded-2xl p-4 space-y-1.5">
                      <label className="text-[10px] font-black uppercase tracking-wider text-slate-400 block">
                        Statement Reference (18 chars)
                      </label>
                      <input
                        type="text"
                        maxLength={18}
                        value={payIdReference}
                        onChange={(e) => setPayIdReference(e.target.value)}
                        placeholder="e.g. INV-1002"
                        className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white placeholder:text-slate-600 focus:outline-none focus:border-blue-500 font-mono"
                      />
                    </div>
                  </div>

                  {/* Step 4: Execute Button */}
                  <button
                    onClick={handleExecutePayIdTransfer}
                    disabled={isExecutingPayId || !payIdAmount || parseFloat(payIdAmount) <= 0 || (!payIdValue.trim() && !payIdResolvedPayee)}
                    className="w-full py-4 rounded-2xl bg-gradient-to-r from-blue-600 via-indigo-600 to-emerald-600 hover:from-blue-500 hover:to-emerald-500 active:scale-[0.99] text-white font-black text-sm uppercase tracking-wider shadow-xl shadow-indigo-600/20 flex items-center justify-center gap-2 cursor-pointer transition-all disabled:opacity-40 disabled:cursor-not-allowed"
                  >
                    {isExecutingPayId ? (
                      <>
                        <Loader2 className="w-5 h-5 animate-spin" />
                        <span>Clearing with Destination ADI via NPP Rails...</span>
                      </>
                    ) : (
                      <>
                        <Send className="w-5 h-5" />
                        <span>Execute Instant PayID Transfer from {card.name.split(" ")[0]}</span>
                        <ArrowRight className="w-5 h-5" />
                      </>
                    )}
                  </button>

                  <div className="text-center text-[10px] text-slate-500 font-mono">
                    Secured by ISO 20022 Interbank Messaging • APRA Authorised Deposit-taking Institution (ADI) Direct Settlement
                  </div>
                </div>
              )}
            </div>
          )}

          {/* TAB 2: Value Vault & Rewards (Maximum Value Gaining) */}
          {activeTab === "value" && (
            <div className="space-y-5">
              {/* Top Banner: 1-Click Sweep All Value */}
              <div className="p-4 rounded-2xl bg-gradient-to-r from-amber-500/20 via-emerald-500/20 to-indigo-500/20 border border-amber-500/30 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <div className="flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-amber-400" />
                    <span className="text-xs font-black uppercase tracking-wider text-amber-300">
                      Sovereign Yield & Rewards Engine
                    </span>
                  </div>
                  <p className="text-xs text-slate-300 mt-0.5">
                    Total pending yield: <strong className="text-emerald-400">${((card.accumulatedCashback || 0) + (card.accruedInterest || 0)).toLocaleString("en-AU", { minimumFractionDigits: 2 })} AUD</strong>
                  </p>
                </div>
                <button
                  onClick={handleClaimAllValue}
                  className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-slate-950 font-black text-xs uppercase tracking-wider transition-all shadow-lg shadow-emerald-500/20 cursor-pointer flex items-center gap-2 shrink-0"
                >
                  <Coins className="w-4 h-4" />
                  <span>Claim All Yield to Balance</span>
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Cashback Box */}
                <div className="bg-gradient-to-br from-slate-950 via-slate-900 to-emerald-950/40 border border-emerald-500/30 rounded-2xl p-5 shadow-lg relative overflow-hidden">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center">
                        <DollarSign className="w-4 h-4" />
                      </div>
                      <div>
                        <h4 className="text-sm font-black text-white">Unlimited Cashback Vault</h4>
                        <span className="text-[10px] text-emerald-400 font-bold">
                          {(card.cashbackRate * 100).toFixed(1)}% on All Transactions
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="my-3">
                    <span className="text-[10px] text-slate-400 uppercase tracking-wider">Available Cashback to Claim</span>
                    <div className="text-2xl font-black text-emerald-400 font-mono mt-0.5">
                      ${card.accumulatedCashback.toLocaleString("en-AU", { minimumFractionDigits: 2 })} AUD
                    </div>
                  </div>

                  <button
                    onClick={handleClaimCashback}
                    disabled={card.accumulatedCashback <= 0}
                    className="w-full mt-2 py-3 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black text-xs uppercase tracking-wider transition-all cursor-pointer shadow-lg shadow-emerald-500/20 disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                  >
                    <DollarSign className="w-4 h-4" />
                    <span>Claim Cashback to Card Balance</span>
                  </button>
                </div>

                {/* Staking / Interest Box */}
                <div className="bg-gradient-to-br from-slate-950 via-slate-900 to-blue-950/40 border border-blue-500/30 rounded-2xl p-5 shadow-lg relative overflow-hidden">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 rounded-xl bg-blue-500/20 text-blue-400 flex items-center justify-center">
                        <TrendingUp className="w-4 h-4" />
                      </div>
                      <div>
                        <h4 className="text-sm font-black text-white">High-Yield Daily Compound Interest</h4>
                        <span className="text-[10px] text-blue-400 font-bold">
                          {(card.apyInterestRate * 100).toFixed(2)}% p.a. Accrued Daily
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="my-3">
                    <span className="text-[10px] text-slate-400 uppercase tracking-wider">Accrued Interest Balance</span>
                    <div className="text-2xl font-black text-blue-400 font-mono mt-0.5">
                      ${card.accruedInterest.toLocaleString("en-AU", { minimumFractionDigits: 2 })} AUD
                    </div>
                  </div>

                  <button
                    onClick={handleClaimInterest}
                    disabled={card.accruedInterest <= 0}
                    className="w-full mt-2 py-3 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-black text-xs uppercase tracking-wider transition-all cursor-pointer shadow-lg shadow-blue-600/20 disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                  >
                    <TrendingUp className="w-4 h-4" />
                    <span>Claim Accrued Interest to Card</span>
                  </button>
                </div>
              </div>

              {/* Rewards Points Redemption & Auto-Round Up */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Rewards Points Redemption */}
                <div className="bg-slate-950 border border-slate-800 rounded-2xl p-5 space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Gift className="w-4 h-4 text-purple-400" />
                      <span className="text-xs font-bold text-white">Sovereign Rewards Points</span>
                    </div>
                    <span className="text-xs font-black text-purple-400 font-mono">
                      {(card.rewardsPoints || 1450200).toLocaleString()} PTS
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-400 leading-relaxed">
                    Earn 3x points on every purchase. Redeem 10,000 points for $100 AUD statement credit deposited directly onto this card.
                  </p>
                  <div className="flex items-center gap-2 pt-1">
                    <input
                      type="number"
                      step={5000}
                      min={1000}
                      value={pointsToRedeem}
                      onChange={(e) => setPointsToRedeem(Math.max(1000, Number(e.target.value)))}
                      className="w-28 bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-xs font-mono text-white focus:outline-none focus:border-purple-500"
                    />
                    <button
                      onClick={handleRedeemPoints}
                      className="flex-1 py-2 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs uppercase tracking-wider transition-colors cursor-pointer flex items-center justify-center gap-1.5"
                    >
                      <Zap className="w-3.5 h-3.5" />
                      <span>Redeem for ${(pointsToRedeem / 100).toFixed(2)} AUD</span>
                    </button>
                  </div>
                </div>

                {/* Auto-Round Up Spare Change Vault */}
                <div className="bg-slate-950 border border-slate-800 rounded-2xl p-5 space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Coins className="w-4 h-4 text-amber-400" />
                      <span className="text-xs font-bold text-white">Auto Round-Up Spare Change</span>
                    </div>
                    <button
                      onClick={() => {
                        setRoundUpActive(!roundUpActive);
                        toast.success(roundUpActive ? "Round-up savings paused" : "Round-up active: Rounding up to nearest $5");
                      }}
                      className={`w-10 h-5 rounded-full transition-colors relative cursor-pointer ${
                        roundUpActive ? "bg-amber-500" : "bg-slate-800"
                      }`}
                    >
                      <div
                        className={`w-4 h-4 rounded-full bg-white transition-transform ${
                          roundUpActive ? "translate-x-5" : "translate-x-1"
                        }`}
                      />
                    </button>
                  </div>
                  <p className="text-[11px] text-slate-400 leading-relaxed">
                    Rounds up purchases to nearest $5 and automatically deposits spare change into 5.10% APY compound treasury.
                  </p>
                  <div className="flex items-center justify-between pt-1 text-xs">
                    <span className="text-slate-400">Total Round-Up Saved:</span>
                    <span className="font-mono font-black text-amber-400">${roundUpVaultBalance.toFixed(2)} AUD</span>
                  </div>
                </div>
              </div>

              {/* Complimentary VIP Privileges */}
              <div className="bg-slate-950 border border-slate-800 rounded-2xl p-5 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-black uppercase tracking-wider text-slate-400 flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-amber-400" /> Included Institutional Privileges & Insurances
                  </span>
                  <span className="text-[10px] text-emerald-400 font-bold bg-emerald-500/10 border border-emerald-500/20 px-2 py-0.5 rounded-full">
                    Active on this Card
                  </span>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
                  {/* Travel Insurance Card Button */}
                  <button
                    onClick={() => setIsInsuranceScheduleOpen(true)}
                    className="p-3 bg-slate-900 hover:bg-slate-800/90 rounded-xl border border-slate-800 hover:border-emerald-500/40 transition-all text-left flex flex-col justify-between cursor-pointer group"
                  >
                    <div className="flex items-center gap-2.5 mb-2">
                      <div className="w-7 h-7 rounded-lg bg-emerald-500/20 text-emerald-400 flex items-center justify-center shrink-0">
                        <ShieldCheck className="w-4 h-4" />
                      </div>
                      <div className="overflow-hidden">
                        <div className="font-bold text-white group-hover:text-emerald-300 transition-colors truncate">Worldwide Insurance</div>
                        <div className="text-[10px] text-slate-400">$20M Comprehensive</div>
                      </div>
                    </div>
                    <div className="flex items-center justify-between pt-2 border-t border-slate-800/60 text-[10px]">
                      <span className="text-emerald-400 font-bold">Nil Excess Cover</span>
                      <span className="text-slate-400 group-hover:text-white flex items-center gap-0.5 font-bold">
                        View Schedule &rarr;
                      </span>
                    </div>
                  </button>

                  {/* 0% FX Markup Card Button */}
                  <button
                    onClick={() => setIsFxRateModalOpen(true)}
                    className="p-3 bg-slate-900 hover:bg-slate-800/90 rounded-xl border border-slate-800 hover:border-blue-500/40 transition-all text-left flex flex-col justify-between cursor-pointer group"
                  >
                    <div className="flex items-center gap-2.5 mb-2">
                      <div className="w-7 h-7 rounded-lg bg-blue-500/20 text-blue-400 flex items-center justify-center shrink-0">
                        <Globe className="w-4 h-4" />
                      </div>
                      <div className="overflow-hidden">
                        <div className="font-bold text-white group-hover:text-blue-300 transition-colors truncate">0% Foreign Exchange</div>
                        <div className="text-[10px] text-slate-400">Interbank Wholesale</div>
                      </div>
                    </div>
                    <div className="flex items-center justify-between pt-2 border-t border-slate-800/60 text-[10px]">
                      <span className="text-blue-400 font-bold">Save 3.5% vs Banks</span>
                      <span className="text-slate-400 group-hover:text-white flex items-center gap-0.5 font-bold">
                        FX Terminal &rarr;
                      </span>
                    </div>
                  </button>

                  {/* Centurion Lounge Card Button */}
                  <button
                    onClick={() => setIsLoungePassOpen(true)}
                    className="p-3 bg-slate-900 hover:bg-slate-800/90 rounded-xl border border-slate-800 hover:border-purple-500/40 transition-all text-left flex flex-col justify-between cursor-pointer group"
                  >
                    <div className="flex items-center gap-2.5 mb-2">
                      <div className="w-7 h-7 rounded-lg bg-purple-500/20 text-purple-400 flex items-center justify-center shrink-0">
                        <Plane className="w-4 h-4" />
                      </div>
                      <div className="overflow-hidden">
                        <div className="font-bold text-white group-hover:text-purple-300 transition-colors truncate">Centurion Lounge</div>
                        <div className="text-[10px] text-slate-400">1,400+ VIP Lounges</div>
                      </div>
                    </div>
                    <div className="flex items-center justify-between pt-2 border-t border-slate-800/60 text-[10px]">
                      <span className="text-purple-400 font-bold">Member + 4 Guests</span>
                      <span className="text-slate-400 group-hover:text-white flex items-center gap-0.5 font-bold">
                        Digital Pass &rarr;
                      </span>
                    </div>
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: PIN Management */}
          {activeTab === "pin" && (
            <div className="bg-slate-950 border border-slate-800 rounded-2xl p-6 max-w-lg mx-auto space-y-5">
              <div className="text-center">
                <div className="w-12 h-12 rounded-2xl bg-amber-500/10 text-amber-400 flex items-center justify-center mx-auto mb-3">
                  <Key className="w-6 h-6" />
                </div>
                <h4 className="text-base font-black text-white">Card PIN Security</h4>
                <p className="text-xs text-slate-400 mt-1">
                  View or reset your 4-digit card PIN for ATM cash withdrawals and physical EFTPOS chip terminals.
                </p>
              </div>

              {/* View Current PIN */}
              <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 flex items-center justify-between">
                <div>
                  <span className="text-[10px] uppercase font-bold text-slate-400">Current 4-Digit PIN</span>
                  <div className="text-2xl font-mono font-black text-amber-400 mt-0.5 tracking-widest">
                    {showPin ? (card.pin || "4912") : "••••"}
                  </div>
                </div>
                <button
                  onClick={() => setShowPin(!showPin)}
                  className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-xs font-bold text-slate-300 flex items-center gap-1.5 transition-colors cursor-pointer"
                >
                  {showPin ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  <span>{showPin ? "Hide" : "Reveal"}</span>
                </button>
              </div>

              {/* Set New PIN Form */}
              {!isChangingPin ? (
                <button
                  onClick={() => setIsChangingPin(true)}
                  className="w-full py-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-bold text-xs uppercase tracking-wider transition-colors cursor-pointer"
                >
                  Change Card PIN
                </button>
              ) : (
                <form onSubmit={handleUpdatePinSubmit} className="space-y-4 pt-2 border-t border-slate-800">
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="text-[10px] uppercase font-bold text-slate-400 block mb-1">New 4-Digit PIN</label>
                      <input
                        type="password"
                        maxLength={4}
                        value={newPin}
                        onChange={(e) => setNewPin(e.target.value.replace(/\D/g, ""))}
                        placeholder="••••"
                        className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-center text-lg font-mono font-black text-white focus:outline-none focus:border-emerald-500"
                        required
                      />
                    </div>
                    <div>
                      <label className="text-[10px] uppercase font-bold text-slate-400 block mb-1">Confirm PIN</label>
                      <input
                        type="password"
                        maxLength={4}
                        value={confirmPin}
                        onChange={(e) => setConfirmPin(e.target.value.replace(/\D/g, ""))}
                        placeholder="••••"
                        className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-center text-lg font-mono font-black text-white focus:outline-none focus:border-emerald-500"
                        required
                      />
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => setIsChangingPin(false)}
                      className="flex-1 py-2.5 rounded-xl bg-slate-800 text-slate-400 hover:text-white text-xs font-bold transition-colors cursor-pointer"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="flex-1 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 text-xs font-black uppercase tracking-wider transition-colors cursor-pointer shadow-lg shadow-emerald-500/20"
                    >
                      Save New PIN
                    </button>
                  </div>
                </form>
              )}
            </div>
          )}

          {/* TAB 4: Spending Limits & Payment Channels */}
          {activeTab === "limits" && (
            <div className="space-y-5">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Daily Spending Limit Slider */}
                <div className="bg-slate-950 border border-slate-800 rounded-2xl p-5 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-white">Daily Spending Limit</span>
                    <span className="text-xs font-black text-emerald-400 font-mono">
                      ${card.dailySpendingLimit.toLocaleString("en-AU")} AUD
                    </span>
                  </div>
                  <input
                    type="range"
                    min={10000}
                    max={50000000}
                    step={50000}
                    value={card.dailySpendingLimit}
                    onChange={(e) => {
                      const val = Number(e.target.value);
                      unifiedBankCardSync.updateLimits(card.id, { dailySpendingLimit: val });
                      onCardUpdated?.({ ...card, dailySpendingLimit: val });
                    }}
                    className="w-full accent-emerald-500 cursor-pointer"
                  />
                  <div className="flex justify-between text-[10px] text-slate-500 font-mono">
                    <span>$10,000</span>
                    <span>$50,000,000 (VIP High Roller)</span>
                  </div>
                </div>

                {/* ATM Daily Cash Limit Slider */}
                <div className="bg-slate-950 border border-slate-800 rounded-2xl p-5 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-white">Daily ATM Withdrawal Limit</span>
                    <span className="text-xs font-black text-cyan-400 font-mono">
                      ${card.atmDailyLimit.toLocaleString("en-AU")} AUD
                    </span>
                  </div>
                  <input
                    type="range"
                    min={1000}
                    max={1000000}
                    step={5000}
                    value={card.atmDailyLimit}
                    onChange={(e) => {
                      const val = Number(e.target.value);
                      unifiedBankCardSync.updateLimits(card.id, { atmDailyLimit: val });
                      onCardUpdated?.({ ...card, atmDailyLimit: val });
                    }}
                    className="w-full accent-cyan-500 cursor-pointer"
                  />
                  <div className="flex justify-between text-[10px] text-slate-500 font-mono">
                    <span>$1,000</span>
                    <span>$1,000,000 (Institutional Vault)</span>
                  </div>
                </div>
              </div>

              {/* Payment Channel Toggles */}
              <div className="bg-slate-950 border border-slate-800 rounded-2xl p-5 space-y-3">
                <span className="text-xs font-black uppercase tracking-wider text-slate-400 block mb-2">
                  Payment Channels & Network Protection
                </span>

                <div className="space-y-3">
                  <div className="flex items-center justify-between p-3 rounded-xl bg-slate-900 border border-slate-800">
                    <div>
                      <div className="text-xs font-bold text-white">Online & E-commerce Payments</div>
                      <div className="text-[10px] text-slate-400">Permit online shopping, subscriptions, and app checkouts</div>
                    </div>
                    <button
                      onClick={handleToggleOnline}
                      className={`w-12 h-6 rounded-full transition-colors relative cursor-pointer ${
                        card.onlinePaymentsEnabled ? "bg-emerald-500" : "bg-slate-800"
                      }`}
                    >
                      <div
                        className={`w-5 h-5 rounded-full bg-white transition-transform ${
                          card.onlinePaymentsEnabled ? "translate-x-6" : "translate-x-1"
                        }`}
                      />
                    </button>
                  </div>

                  <div className="flex items-center justify-between p-3 rounded-xl bg-slate-900 border border-slate-800">
                    <div>
                      <div className="text-xs font-bold text-white">International & Foreign Currency Spending</div>
                      <div className="text-[10px] text-slate-400">Zero foreign exchange fee transactions across 190+ countries</div>
                    </div>
                    <button
                      onClick={handleToggleInternational}
                      className={`w-12 h-6 rounded-full transition-colors relative cursor-pointer ${
                        card.internationalPaymentsEnabled ? "bg-emerald-500" : "bg-slate-800"
                      }`}
                    >
                      <div
                        className={`w-5 h-5 rounded-full bg-white transition-transform ${
                          card.internationalPaymentsEnabled ? "translate-x-6" : "translate-x-1"
                        }`}
                      />
                    </button>
                  </div>

                  <div className="flex items-center justify-between p-3 rounded-xl bg-slate-900 border border-slate-800">
                    <div>
                      <div className="text-xs font-bold text-white">Contactless NFC Tap-to-Pay</div>
                      <div className="text-[10px] text-slate-400">Allow contactless transactions on physical POS terminals & transit</div>
                    </div>
                    <button
                      onClick={handleToggleContactless}
                      className={`w-12 h-6 rounded-full transition-colors relative cursor-pointer ${
                        card.contactlessEnabled ? "bg-emerald-500" : "bg-slate-800"
                      }`}
                    >
                      <div
                        className={`w-5 h-5 rounded-full bg-white transition-transform ${
                          card.contactlessEnabled ? "translate-x-6" : "translate-x-1"
                        }`}
                      />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 5: Statements & Cardless ATM Cash */}
          {activeTab === "statements" && (
            <div className="space-y-5">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Proof of Card & Statement PDF Download */}
                <div className="bg-slate-950 border border-slate-800 rounded-2xl p-5 space-y-3">
                  <div className="flex items-center gap-2">
                    <FileText className="w-5 h-5 text-emerald-400" />
                    <div>
                      <h4 className="text-sm font-black text-white">Official Card Certificate PDF</h4>
                      <p className="text-[10px] text-slate-400">APRA / RBA compliant statement of ownership</p>
                    </div>
                  </div>
                  <p className="text-xs text-slate-300 leading-relaxed">
                    Download an electronically signed statement verifying card limits, account numbers, and sovereign institutional liquidity standing.
                  </p>
                  <button
                    onClick={handleExportStatementPdf}
                    className="w-full py-3 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black text-xs uppercase tracking-wider transition-all cursor-pointer shadow-lg shadow-emerald-500/20 flex items-center justify-center gap-2"
                  >
                    <Download className="w-4 h-4" />
                    <span>Download Signed PDF Statement</span>
                  </button>
                </div>

                {/* Emergency Cardless ATM Cash Code */}
                <div className="bg-slate-950 border border-slate-800 rounded-2xl p-5 space-y-3">
                  <div className="flex items-center gap-2">
                    <QrCode className="w-5 h-5 text-cyan-400" />
                    <div>
                      <h4 className="text-sm font-black text-white">Emergency ATM Cardless Cash</h4>
                      <p className="text-[10px] text-slate-400">Collect up to $500 AUD without a card</p>
                    </div>
                  </div>
                  <p className="text-xs text-slate-300 leading-relaxed">
                    Generate an instant 8-digit claim code redeemable at any CommBank, ANZ, Westpac, or NAB ATM nationwide.
                  </p>
                  
                  {emergencyCode ? (
                    <div className="p-3 bg-slate-900 border border-cyan-500/40 rounded-xl space-y-1 text-center">
                      <span className="text-[10px] uppercase font-bold text-slate-400">Active ATM Claim Code</span>
                      <div className="text-2xl font-mono font-black text-cyan-400 tracking-widest">{emergencyCode}</div>
                      <div className="text-[10px] text-slate-500">Valid for 30 minutes at any Australian ATM</div>
                    </div>
                  ) : (
                    <button
                      onClick={handleGenerateEmergencyAtmCode}
                      className="w-full py-3 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white font-black text-xs uppercase tracking-wider transition-all cursor-pointer shadow-lg shadow-cyan-600/20 flex items-center justify-center gap-2"
                    >
                      <Zap className="w-4 h-4" />
                      <span>Generate 8-Digit ATM Code</span>
                    </button>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
      </motion.div>

      {/* Embedded NFC Contactless Tap Terminal Modal */}
      <NFCTapModal
        isOpen={isNfcTapModalOpen}
        onClose={() => setIsNfcTapModalOpen(false)}
        cards={card ? [card] : []}
        onPaymentComplete={(amt, merch) => {
          toast.success(`NFC Terminal Payment of $${amt.toFixed(2)} AUD successfully cleared at ${merch}!`);
          handleTriggerCardContactlessTest();
        }}
      />

      {/* 1. Worldwide Travel Insurance Schedule Modal */}
      <AnimatePresence>
        {isInsuranceScheduleOpen && (
          <div className="fixed inset-0 z-60 flex items-center justify-center p-3 sm:p-4 bg-slate-950/85 backdrop-blur-md">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 15 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 15 }}
              className="relative w-full max-w-2xl bg-slate-900 border border-emerald-500/30 rounded-3xl shadow-2xl p-6 text-slate-100 max-h-[90vh] overflow-y-auto"
            >
              <div className="flex items-center justify-between pb-4 border-b border-slate-800">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center border border-emerald-500/30">
                    <ShieldCheck className="w-6 h-6" />
                  </div>
                  <div>
                    <h3 className="text-base font-black text-white">APRA Sovereign Travel Insurance Schedule</h3>
                    <p className="text-xs text-emerald-400 font-mono">Policy: APRA-VAL-POL-2026-{card.id.slice(-6).toUpperCase()}</p>
                  </div>
                </div>
                <button
                  onClick={() => setIsInsuranceScheduleOpen(false)}
                  className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="mt-5 space-y-4">
                <div className="bg-slate-950 p-4 rounded-2xl border border-slate-800 flex flex-wrap items-center justify-between gap-3">
                  <div>
                    <span className="text-[10px] uppercase font-bold text-slate-400 block">Insured Primary Executive</span>
                    <span className="text-sm font-black text-white">MR. ASIM ARYAL</span>
                  </div>
                  <div>
                    <span className="text-[10px] uppercase font-bold text-slate-400 block">Underwriting Syndicate</span>
                    <span className="text-xs font-bold text-emerald-400">Lloyd's of London & Valourian Sovereign</span>
                  </div>
                  <div>
                    <span className="text-[10px] uppercase font-bold text-slate-400 block">Deductible / Excess</span>
                    <span className="text-xs font-mono font-black text-white bg-emerald-500/20 px-2 py-0.5 rounded-full border border-emerald-500/30">
                      NIL ($0.00)
                    </span>
                  </div>
                </div>

                <div className="border border-slate-800 rounded-2xl overflow-hidden bg-slate-950">
                  <div className="px-4 py-2.5 bg-slate-800/50 text-[11px] font-black uppercase tracking-wider text-slate-300 flex justify-between">
                    <span>Coverage Schedule Benefit</span>
                    <span>Max Sum Insured</span>
                  </div>
                  <div className="divide-y divide-slate-800/70 text-xs">
                    {[
                      { name: "Emergency Overseas Hospital & Intensive Care", limit: "$20,000,000 AUD", highlight: true },
                      { name: "Medevac Sovereign Jet Evacuation & Repatriation", limit: "100% UNLIMITED", highlight: true },
                      { name: "Trip Disruption, Cancellation & Curtailment", limit: "$50,000 AUD" },
                      { name: "Luggage, Tech Gear & Personal Valuables", limit: "$25,000 AUD" },
                      { name: "Rental Vehicle Excess Damage Waiver", limit: "$10,000 AUD" },
                      { name: "Personal Liability & Legal Defence Cover", limit: "$15,000,000 AUD" },
                      { name: "24/7 Global SOS Concierge & Emergency Dispatch", limit: "Immediate Dispatch" }
                    ].map((item, idx) => (
                      <div key={`cov-${idx}`} className="px-4 py-3 flex items-center justify-between">
                        <span className="text-slate-300">{item.name}</span>
                        <span className={`font-mono font-bold ${item.highlight ? "text-emerald-400 font-black" : "text-white"}`}>
                          {item.limit}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="p-3 bg-emerald-500/10 border border-emerald-500/30 rounded-xl flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2 text-emerald-300">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                    <span>Global 24/7 Emergency SOS Line: <strong>+61 2 8999 4400</strong></span>
                  </div>
                  <span className="font-mono text-[10px] text-emerald-400">ACTIVE IN FORCE</span>
                </div>

                <div className="flex gap-3 pt-2">
                  <button
                    onClick={handleExportInsuranceCertificate}
                    className="flex-1 py-3 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black text-xs uppercase tracking-wider transition-all cursor-pointer shadow-lg shadow-emerald-500/20 flex items-center justify-center gap-2"
                  >
                    <Download className="w-4 h-4" />
                    <span>Download Signed Policy PDF</span>
                  </button>
                  <button
                    onClick={() => setIsInsuranceScheduleOpen(false)}
                    className="px-5 py-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-bold text-xs transition-colors cursor-pointer"
                  >
                    Close
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* 2. Centurion & Priority Pass Airport Lounge Pass Modal */}
      <AnimatePresence>
        {isLoungePassOpen && (
          <div className="fixed inset-0 z-60 flex items-center justify-center p-3 sm:p-4 bg-slate-950/85 backdrop-blur-md">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 15 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 15 }}
              className="relative w-full max-w-xl bg-slate-900 border border-purple-500/30 rounded-3xl shadow-2xl p-6 text-slate-100 max-h-[90vh] overflow-y-auto"
            >
              <div className="flex items-center justify-between pb-4 border-b border-slate-800">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-purple-500/20 text-purple-400 flex items-center justify-center border border-purple-500/30">
                    <Plane className="w-6 h-6" />
                  </div>
                  <div>
                    <h3 className="text-base font-black text-white">Centurion Sovereign VIP Lounge Pass</h3>
                    <p className="text-xs text-purple-400 font-mono">1,400+ International First Class Lounges</p>
                  </div>
                </div>
                <button
                  onClick={() => {
                    setIsLoungePassOpen(false);
                    setLoungeGateScanned(false);
                  }}
                  className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Digital Boarding QR Pass Body */}
              <div className="mt-5 space-y-4">
                <div className="p-5 bg-gradient-to-br from-slate-950 via-purple-950/40 to-slate-950 rounded-2xl border border-purple-500/40 shadow-xl relative overflow-hidden">
                  <div className="flex items-center justify-between border-b border-purple-500/20 pb-3 mb-4">
                    <div>
                      <span className="text-[10px] uppercase font-bold text-slate-400 block">Passenger / Member</span>
                      <span className="text-sm font-black text-white">MR. ASIM ARYAL</span>
                    </div>
                    <div className="text-right">
                      <span className="text-[10px] uppercase font-bold text-slate-400 block">Tier Status</span>
                      <span className="text-xs font-mono font-black text-purple-400 bg-purple-500/20 px-2 py-0.5 rounded-full border border-purple-500/30">
                        CENTURION BLACK SOVEREIGN
                      </span>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3 text-xs mb-4">
                    <div>
                      <span className="text-[10px] text-slate-400 block">Guest Privilege</span>
                      <span className="font-bold text-white">Member + 4 Guests Free</span>
                    </div>
                    <div>
                      <span className="text-[10px] text-slate-400 block">Linked Card</span>
                      <span className="font-mono font-bold text-white">{card.name}</span>
                    </div>
                  </div>

                  {/* Airport Terminal Selector */}
                  <div className="mb-4">
                    <label className="text-[10px] uppercase font-bold text-slate-400 block mb-1">
                      Select Airport Lounge Location
                    </label>
                    <select
                      value={selectedLoungeAirport}
                      onChange={(e) => {
                        setSelectedLoungeAirport(e.target.value);
                        setLoungeGateScanned(false);
                      }}
                      className="w-full bg-slate-900 border border-purple-500/30 rounded-xl px-3 py-2 text-xs font-bold text-white focus:outline-none focus:border-purple-400"
                    >
                      <option value="SYD - Sydney Kingsford Smith (T1)">SYD - Sydney Kingsford Smith (T1 Centurion Lounge)</option>
                      <option value="MEL - Melbourne Tullamarine (T2)">MEL - Melbourne Tullamarine (T2 International First)</option>
                      <option value="LHR - London Heathrow (T3)">LHR - London Heathrow (T3 Centurion Flagship)</option>
                      <option value="SIN - Singapore Changi (T3)">SIN - Singapore Changi (T3 SilverKris Sovereign)</option>
                      <option value="JFK - New York John F. Kennedy (T4)">JFK - New York JFK (T4 Centurion Sovereign)</option>
                      <option value="DXB - Dubai International (T3)">DXB - Dubai International (T3 Concourse A First)</option>
                    </select>
                  </div>

                  {/* Simulated QR Code & Barcode */}
                  <div className="bg-white rounded-xl p-4 text-center text-slate-950 relative">
                    <div className="flex items-center justify-center gap-4">
                      {/* Simulated QR Box */}
                      <div className="w-24 h-24 bg-slate-900 rounded-lg p-1.5 flex flex-col justify-between">
                        <div className="grid grid-cols-3 gap-1 h-full">
                          <div className="bg-white rounded-xs"></div>
                          <div className="bg-slate-900"></div>
                          <div className="bg-white rounded-xs"></div>
                          <div className="bg-slate-900"></div>
                          <div className="bg-white rounded-xs"></div>
                          <div className="bg-slate-900"></div>
                          <div className="bg-white rounded-xs"></div>
                          <div className="bg-slate-900"></div>
                          <div className="bg-white rounded-xs"></div>
                        </div>
                      </div>
                      <div className="text-left font-mono">
                        <div className="text-[11px] font-black text-slate-900 tracking-wider">PRIORITY PASS / CENTURION</div>
                        <div className="text-[10px] text-slate-600">ID: 8892-0041-3994-0182</div>
                        <div className="text-[10px] text-slate-600">BARCODE: *VALOURIAN-VIP-2026*</div>
                        <div className="text-[9px] text-emerald-700 font-bold mt-1 flex items-center gap-1">
                          <Check className="w-3 h-3 text-emerald-600" /> UNLIMITED GLOBAL ADMISSION
                        </div>
                      </div>
                    </div>

                    {/* Barcode Lines */}
                    <div className="mt-3 pt-2 border-t border-slate-200 flex justify-between items-center h-8 px-2 overflow-hidden">
                      {Array.from({ length: 42 }).map((_, i) => (
                        <div
                          key={`bar-${i}`}
                          className={`bg-slate-900 h-full ${i % 3 === 0 ? "w-1" : i % 5 === 0 ? "w-1.5" : "w-0.5"}`}
                        />
                      ))}
                    </div>
                  </div>

                  {/* Gate Scan Simulator Action */}
                  <div className="mt-4">
                    {loungeGateScanned ? (
                      <div className="p-3 bg-emerald-500/20 border border-emerald-500/40 rounded-xl text-center space-y-1">
                        <div className="text-xs font-black text-emerald-400 flex items-center justify-center gap-1.5">
                          <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                          <span>GATE ACCESS GRANTED • WELCOME MR. ARYAL</span>
                        </div>
                        <p className="text-[10px] text-slate-300">
                          {selectedLoungeAirport} staff notified. Private suite & champagne service prepared.
                        </p>
                      </div>
                    ) : (
                      <button
                        onClick={handleSimulateLoungeScan}
                        className="w-full py-3 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-black text-xs uppercase tracking-wider transition-all cursor-pointer shadow-lg shadow-purple-600/20 flex items-center justify-center gap-2"
                      >
                        <QrCode className="w-4 h-4" />
                        <span>Simulate Terminal Gate Scan</span>
                      </button>
                    )}
                  </div>
                </div>

                {/* Lounge Amenities */}
                <div className="bg-slate-950 p-4 rounded-2xl border border-slate-800 text-xs">
                  <span className="text-[10px] uppercase font-bold text-slate-400 block mb-2">
                    Complimentary VIP Lounge Inclusions
                  </span>
                  <div className="grid grid-cols-2 gap-2 text-slate-300 text-[11px]">
                    <div className="flex items-center gap-1.5">
                      <Check className="w-3.5 h-3.5 text-purple-400 shrink-0" />
                      <span>Executive Private Shower Suites</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <Check className="w-3.5 h-3.5 text-purple-400 shrink-0" />
                      <span>À la carte Chef Dining & Sommelier</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <Check className="w-3.5 h-3.5 text-purple-400 shrink-0" />
                      <span>Ultra High-Speed Gigabit Fiber Wi-Fi</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <Check className="w-3.5 h-3.5 text-purple-400 shrink-0" />
                      <span>Dedicated Sovereign Boardroom Pods</span>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* 3. 0% FX Currency Markup Interbank Wholesale Terminal Modal */}
      <AnimatePresence>
        {isFxRateModalOpen && (
          <div className="fixed inset-0 z-60 flex items-center justify-center p-3 sm:p-4 bg-slate-950/85 backdrop-blur-md">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 15 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 15 }}
              className="relative w-full max-w-xl bg-slate-900 border border-blue-500/30 rounded-3xl shadow-2xl p-6 text-slate-100 max-h-[90vh] overflow-y-auto"
            >
              <div className="flex items-center justify-between pb-4 border-b border-slate-800">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-blue-500/20 text-blue-400 flex items-center justify-center border border-blue-500/30">
                    <Globe className="w-6 h-6" />
                  </div>
                  <div>
                    <h3 className="text-base font-black text-white">0% FX Wholesale Interbank Terminal</h3>
                    <p className="text-xs text-blue-400 font-mono">Zero FX Spread • Interbank Mid-Market Rate</p>
                  </div>
                </div>
                <button
                  onClick={() => setIsFxRateModalOpen(false)}
                  className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="mt-5 space-y-4">
                {/* FX Rate Calculator */}
                <div className="bg-slate-950 p-5 rounded-2xl border border-slate-800 space-y-3">
                  <span className="text-[10px] uppercase font-bold text-slate-400 block">
                    Foreign Currency Spending Calculator
                  </span>
                  <div className="flex items-center gap-2">
                    <input
                      type="number"
                      step={500}
                      min={100}
                      value={fxForeignAmount}
                      onChange={(e) => setFxForeignAmount(Math.max(100, Number(e.target.value)))}
                      className="flex-1 bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-sm font-mono text-white focus:outline-none focus:border-blue-400"
                    />
                    <select
                      value={fxSelectedCurrency}
                      onChange={(e) => setFxSelectedCurrency(e.target.value)}
                      className="bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-xs font-bold text-white focus:outline-none focus:border-blue-400"
                    >
                      <option value="USD">USD (US Dollar)</option>
                      <option value="EUR">EUR (Euro)</option>
                      <option value="GBP">GBP (British Pound)</option>
                      <option value="JPY">JPY (Japanese Yen)</option>
                      <option value="SGD">SGD (Singapore Dollar)</option>
                      <option value="NZD">NZD (New Zealand Dollar)</option>
                    </select>
                  </div>

                  {/* Calculations */}
                  {(() => {
                    // Exchange rate relative to AUD (1 AUD = rate FC, or 1 FC = audRate AUD)
                    const ratesToAud: Record<string, number> = {
                      USD: 1.528,
                      EUR: 1.653,
                      GBP: 1.931,
                      JPY: 0.0102,
                      SGD: 1.135,
                      NZD: 0.918
                    };
                    const audRate = ratesToAud[fxSelectedCurrency] || 1.5;
                    const wholesaleAud = fxForeignAmount * audRate;
                    const retailBankAud = wholesaleAud * 1.035; // 3.5% markup typical at big 4
                    const totalSavings = retailBankAud - wholesaleAud;

                    return (
                      <div className="grid grid-cols-2 gap-3 pt-2 text-xs">
                        <div className="p-3 bg-emerald-950/30 border border-emerald-500/30 rounded-xl">
                          <span className="text-[10px] text-slate-400 uppercase font-bold block">Valourian Cost (0% FX)</span>
                          <div className="text-base font-black text-emerald-400 font-mono mt-0.5">
                            ${wholesaleAud.toLocaleString("en-AU", { minimumFractionDigits: 2, maximumFractionDigits: 2 })} AUD
                          </div>
                          <span className="text-[9px] text-emerald-400 font-mono">Wholesale Mid-Market</span>
                        </div>

                        <div className="p-3 bg-red-950/20 border border-red-500/30 rounded-xl">
                          <span className="text-[10px] text-slate-400 uppercase font-bold block">Big 4 Retail Banks (+3.5%)</span>
                          <div className="text-base font-black text-red-300 font-mono mt-0.5">
                            ${retailBankAud.toLocaleString("en-AU", { minimumFractionDigits: 2, maximumFractionDigits: 2 })} AUD
                          </div>
                          <span className="text-[9px] text-red-400 font-mono">+3.5% Hidden Spread</span>
                        </div>

                        <div className="col-span-2 p-3 bg-blue-950/30 border border-blue-500/30 rounded-xl flex items-center justify-between">
                          <div>
                            <span className="text-[10px] text-blue-300 uppercase font-bold block">
                              Instant Cash Saved on this Card
                            </span>
                            <div className="text-lg font-black text-white font-mono">
                              +${totalSavings.toLocaleString("en-AU", { minimumFractionDigits: 2, maximumFractionDigits: 2 })} AUD
                            </div>
                          </div>
                          <span className="text-xs font-black text-blue-400 bg-blue-500/20 px-3 py-1 rounded-full border border-blue-500/30">
                            ZERO SURCHARGES
                          </span>
                        </div>
                      </div>
                    );
                  })()}
                </div>

                {/* Wholesale Rates Matrix */}
                <div className="bg-slate-950 p-4 rounded-2xl border border-slate-800 text-xs">
                  <span className="text-[10px] uppercase font-bold text-slate-400 block mb-2">
                    Live Interbank Wholesale Settlement Rates
                  </span>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 font-mono text-[11px]">
                    <div className="p-2 bg-slate-900 rounded-lg flex justify-between">
                      <span className="text-slate-400">AUD/USD</span>
                      <span className="text-white font-bold">0.6544</span>
                    </div>
                    <div className="p-2 bg-slate-900 rounded-lg flex justify-between">
                      <span className="text-slate-400">AUD/EUR</span>
                      <span className="text-white font-bold">0.6050</span>
                    </div>
                    <div className="p-2 bg-slate-900 rounded-lg flex justify-between">
                      <span className="text-slate-400">AUD/GBP</span>
                      <span className="text-white font-bold">0.5178</span>
                    </div>
                    <div className="p-2 bg-slate-900 rounded-lg flex justify-between">
                      <span className="text-slate-400">AUD/JPY</span>
                      <span className="text-white font-bold">98.420</span>
                    </div>
                    <div className="p-2 bg-slate-900 rounded-lg flex justify-between">
                      <span className="text-slate-400">AUD/SGD</span>
                      <span className="text-white font-bold">0.8812</span>
                    </div>
                    <div className="p-2 bg-slate-900 rounded-lg flex justify-between">
                      <span className="text-slate-400">AUD/NZD</span>
                      <span className="text-white font-bold">1.0894</span>
                    </div>
                  </div>
                </div>

                <button
                  onClick={() => {
                    toast.success("Wholesale rate locked for 2 hours on your card transactions!");
                    setIsFxRateModalOpen(false);
                  }}
                  className="w-full py-3 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-black text-xs uppercase tracking-wider transition-all cursor-pointer shadow-lg shadow-blue-600/20 flex items-center justify-center gap-2"
                >
                  <Check className="w-4 h-4" />
                  <span>Lock Wholesale Rate for Next Transaction</span>
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};
