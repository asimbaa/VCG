import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Search,
  Plus,
  ArrowLeft,
  ChevronRight,
  ShieldCheck,
  Check,
  Sparkles,
  Smartphone,
  Mail,
  Building,
  Landmark,
  BookOpen,
  Share2,
  Copy,
  Download,
  X,
  Loader2,
  CheckCircle2,
  AlertCircle,
  Clock,
  Fingerprint,
  RefreshCw,
  UserCheck,
  Wallet,
  Edit2,
  Globe,
} from "lucide-react";
import toast from "react-hot-toast";
import {
  PayIDContact,
  DEFAULT_COMMBANK_PAYEES,
  SUPPORTED_COUNTRY_CODES,
  COMMBANK_LINKED_ACCOUNTS,
  subscribeToCbaBalances,
  updateCbaAccountBalance,
  resolvePayIDDirectory,
  executeBilateralPayment,
  reconcileAndSettleAllPayments,
  PaymentReceiptResult,
} from "../../services/paymentSettlementService";
import { generatePdfReceipt } from "../../utils/pdfGenerator";
import { collection, query, where, onSnapshot, limit } from "firebase/firestore";
import { db } from "../../firebase";

interface CommBankPayIDFlowProps {
  user: any;
  isOpen?: boolean;
  onClose?: () => void;
  initialPayee?: PayIDContact | null;
  onPaymentComplete?: (receipt: PaymentReceiptResult) => void;
  isInline?: boolean;
  availableBalances?: Record<string, number>;
  sourceCards?: any[];
}

export function CommBankPayIDFlow({
  user,
  isOpen = true,
  onClose,
  initialPayee = null,
  onPaymentComplete,
  isInline = false,
  availableBalances,
  sourceCards = [],
}: CommBankPayIDFlowProps) {
  const [screen, setScreen] = useState<
    | "pay_someone"
    | "choose_method"
    | "enter_payid"
    | "payment_details"
    | "review"
    | "sent_confirmation"
    | "receiver_accounts"
  >(initialPayee ? "payment_details" : "pay_someone");

  // Receiver Accounts State
  const [selectedReceiverAccountId, setSelectedReceiverAccountId] = useState<string>("acc_smart_access");
  const [incomingTransactions, setIncomingTransactions] = useState<any[]>([]);
  const [isReconciling, setIsReconciling] = useState(false);

  // Search & Filter
  const [searchQuery, setSearchQuery] = useState("");
  const [activeFilterTab, setActiveFilterTab] = useState<
    "all" | "payid" | "accounts" | "recent" | "favorites"
  >("all");
  const [contacts, setContacts] = useState<PayIDContact[]>(DEFAULT_COMMBANK_PAYEES);

  // Selected / Input Payee State
  const [payIdType, setPayIdType] = useState<"phone" | "email" | "abn" | "organization">(
    "phone"
  );
  const [payIdValue, setPayIdValue] = useState("");
  const [selectedCountryCode, setSelectedCountryCode] = useState<string>("+61");
  const [showCountryDropdown, setShowCountryDropdown] = useState<boolean>(false);
  const [customLegalName, setCustomLegalName] = useState<string>("");
  const [isEditingLegalName, setIsEditingLegalName] = useState<boolean>(false);
  const [livePreview, setLivePreview] = useState<{
    registeredName: string;
    payIdType: string;
    payIdValue: string;
    countryCode?: string;
    institution: string;
    fastPaymentEligible?: boolean;
    matchConfidence?: string;
  } | null>(null);
  const [isLiveChecking, setIsLiveChecking] = useState<boolean>(false);

  const [resolvedPayee, setResolvedPayee] = useState<{
    registeredName: string;
    payIdType: string;
    payIdValue: string;
    countryCode?: string;
    institution: string;
  } | null>(
    initialPayee
      ? {
          registeredName: initialPayee.name,
          payIdType: initialPayee.payIdType,
          payIdValue: initialPayee.payIdValue,
          countryCode: initialPayee.countryCode || "+61",
          institution: initialPayee.bankName || "Commonwealth Bank of Australia",
        }
      : null
  );

  // Debounced live Confirmation of Payee lookup for authentic directory verification
  useEffect(() => {
    const rawDigits = payIdValue.replace(/[^0-9]/g, "");
    const isReady =
      (payIdType === "phone" && rawDigits.length >= 8) ||
      (payIdType === "email" && payIdValue.includes("@") && payIdValue.length >= 5) ||
      (payIdType === "abn" && rawDigits.length >= 9) ||
      (payIdType === "organization" && payIdValue.length >= 4);

    if (!isReady) {
      setLivePreview(null);
      setIsLiveChecking(false);
      return;
    }

    let active = true;
    setIsLiveChecking(true);
    const timer = setTimeout(async () => {
      try {
        const res = await resolvePayIDDirectory(payIdValue, payIdType, selectedCountryCode);
        if (active && res.isValid) {
          setLivePreview(res);
          setValidationError("");
        }
      } catch (e) {
        console.warn("Live directory preview note:", e);
      } finally {
        if (active) setIsLiveChecking(false);
      }
    }, 180);

    return () => {
      active = false;
      clearTimeout(timer);
    };
  }, [payIdValue, payIdType, selectedCountryCode]);

  // Validation state
  const [isValidating, setIsValidating] = useState(false);
  const [validationError, setValidationError] = useState("");

  // Payment Details State
  const [amount, setAmount] = useState("");
  const [description, setDescription] = useState("");
  const [reference, setReference] = useState("");
  const [paymentTiming, setPaymentTiming] = useState<"now" | "later">("now");
  const [useBiometrics, setUseBiometrics] = useState(false);
  const [isProcessingPayment, setIsProcessingPayment] = useState(false);
  const [completedReceipt, setCompletedReceipt] = useState<PaymentReceiptResult | null>(null);

  // Source Accounts & Live Balances from Firestore
  const [liveCbaBalances, setLiveCbaBalances] = useState<Record<string, number>>({});

  useEffect(() => {
    const unsub = subscribeToCbaBalances(user?.uid || "asim_aryal", (b) => {
      setLiveCbaBalances(b);
    });
    return () => unsub();
  }, [user?.uid]);

  // Live listener for incoming transactions to receiver bank accounts
  useEffect(() => {
    if (!user?.uid) return;
    const q = query(
      collection(db, "transactions"),
      where("userId", "==", user.uid),
      limit(60)
    );
    const unsub = onSnapshot(q, (snap) => {
      const txs: any[] = [];
      snap.forEach((d) => {
        const data = d.data();
        if (
          data.amount > 0 ||
          data.type === "cba_received" ||
          data.type === "fast_payment_received" ||
          data.type === "payid_received" ||
          data.type === "fast_transfer_received"
        ) {
          txs.push({ id: d.id, ...data });
        }
      });
      txs.sort((a, b) => new Date(b.date || b.clearedAt || 0).getTime() - new Date(a.date || a.clearedAt || 0).getTime());
      setIncomingTransactions(txs);
    }, (err) => {
      console.warn("Incoming transactions snapshot note:", err);
    });
    return () => unsub();
  }, [user?.uid]);

  const userAccounts = COMMBANK_LINKED_ACCOUNTS.map((acc) => {
    const bal =
      liveCbaBalances[acc.id] !== undefined
        ? liveCbaBalances[acc.id]
        : acc.id === "acc_smart_access" && availableBalances?.AUD !== undefined
          ? availableBalances.AUD
          : acc.defaultBalance;
    return {
      id: acc.id,
      name: acc.name,
      number: `${acc.bsb} ${acc.accountNumber}`,
      balance: bal,
      currency: acc.currency,
      bankName: acc.bankName,
      accountHolder: acc.accountHolder,
    };
  });

  const [selectedAccountId, setSelectedAccountId] = useState(userAccounts[0].id);
  const [showAccountDrawer, setShowAccountDrawer] = useState(false);

  const activeAccount =
    userAccounts.find((a) => a.id === selectedAccountId) || userAccounts[0];

  // Helper formatting for Australian mobile (04XX XXX XXX) & ABN (XX XXX XXX XXX)
  const formatPayIdInput = (val: string, type: string) => {
    if (type === "phone") {
      // Check if user typed or pasted country code (e.g. +61 or 61)
      let cleaned = val;
      if (cleaned.startsWith("+")) {
        for (const item of SUPPORTED_COUNTRY_CODES) {
          if (cleaned.startsWith(item.code)) {
            setSelectedCountryCode(item.code);
            cleaned = cleaned.slice(item.code.length).trim();
            break;
          }
        }
      }

      const digits = cleaned.replace(/[^0-9]/g, "");
      if (digits.length <= 4) return digits;
      if (digits.length <= 7) return `${digits.slice(0, 4)} ${digits.slice(4)}`;
      return `${digits.slice(0, 4)} ${digits.slice(4, 7)} ${digits.slice(7, 10)}`;
    }
    if (type === "abn") {
      const digits = val.replace(/[^0-9]/g, "");
      if (digits.length <= 2) return digits;
      if (digits.length <= 5) return `${digits.slice(0, 2)} ${digits.slice(2)}`;
      if (digits.length <= 8) return `${digits.slice(0, 2)} ${digits.slice(2, 5)} ${digits.slice(5)}`;
      return `${digits.slice(0, 2)} ${digits.slice(2, 5)} ${digits.slice(5, 8)} ${digits.slice(8, 11)}`;
    }
    return val;
  };

  const handlePayIdChange = (text: string) => {
    setValidationError("");
    const formatted = formatPayIdInput(text, payIdType);
    setPayIdValue(formatted);
  };

  // Perform real-time PayID Directory Resolution (NPP Osko Verification)
  const handleVerifyPayId = async () => {
    if (!payIdValue.trim()) {
      setValidationError("Please enter a valid PayID.");
      return;
    }

    setIsValidating(true);
    setValidationError("");

    try {
      const result = await resolvePayIDDirectory(payIdValue, payIdType, selectedCountryCode);
      if (result.isValid) {
        setResolvedPayee({
          registeredName: result.registeredName,
          payIdType: result.payIdType,
          payIdValue: result.payIdValue,
          countryCode: result.countryCode || selectedCountryCode,
          institution: result.institution,
        });
        setCustomLegalName("");
        setIsEditingLegalName(false);
        setScreen("payment_details");
      } else {
        setValidationError("Unable to resolve PayID on the NPP directory. Please verify details.");
      }
    } catch (err: any) {
      setValidationError("Lookup timeout: Please check the PayID number or format.");
    } finally {
      setIsValidating(false);
    }
  };

  // Execute Payment
  const handleConfirmAndPay = async () => {
    if (!resolvedPayee) return;
    const numAmount = parseFloat(amount.replace(/,/g, ""));
    if (isNaN(numAmount) || numAmount <= 0) {
      toast.error("Please enter a valid payment amount.");
      return;
    }

    if (numAmount > activeAccount.balance) {
      toast.error(
        `Insufficient funds in ${activeAccount.name}. Available: $${activeAccount.balance.toLocaleString("en-AU", { minimumFractionDigits: 2 })} AUD`
      );
      return;
    }

    setIsProcessingPayment(true);

    const finalLegalName = (customLegalName.trim() || resolvedPayee.registeredName).toUpperCase();

    try {
      const result = await executeBilateralPayment({
        senderUserId: user?.uid || "current_user",
        senderName: user?.displayName || user?.email?.split("@")[0] || "Asim Aryal",
        senderEmail: user?.email || "asim.nsw@gmail.com",
        sourceAccount: {
          id: activeAccount.id,
          name: activeAccount.name,
          accountNumber: activeAccount.number,
          currentBalance: activeAccount.balance,
        },
        recipient: {
          name: finalLegalName,
          payIdType: resolvedPayee.payIdType,
          payIdValue: resolvedPayee.payIdValue,
          countryCode: resolvedPayee.countryCode || selectedCountryCode,
          bankName: resolvedPayee.institution,
        },
        amount: numAmount,
        currency: "AUD",
        description: description || "Osko Transfer",
        reference: reference || "NPP Settlement",
        paymentRail: "osko",
      });

      setCompletedReceipt(result);
      setIsProcessingPayment(false);
      setScreen("sent_confirmation");

      if (onPaymentComplete) {
        onPaymentComplete(result);
      }

      toast.success(
        `Payment of $${numAmount.toFixed(2)} AUD accepted & credited by ${resolvedPayee.institution} for ${finalLegalName}!`,
        { icon: "⚡", duration: 5000 }
      );
    } catch (err: any) {
      setIsProcessingPayment(false);
      toast.error(err.message || "Failed to complete payment.");
    }
  };

  // Filter contacts
  const filteredContacts = contacts.filter((c) => {
    const matchesSearch =
      c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.payIdValue.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (c.bankName && c.bankName.toLowerCase().includes(searchQuery.toLowerCase()));

    if (!matchesSearch) return false;
    if (activeFilterTab === "payid") return c.payIdType !== "account";
    if (activeFilterTab === "accounts") return c.payIdType === "account";
    if (activeFilterTab === "recent") return Boolean(c.lastPaidDate);
    if (activeFilterTab === "favorites") return c.category === "favorites";
    return true;
  });

  const handleSelectContact = (contact: PayIDContact) => {
    setResolvedPayee({
      registeredName: contact.name.toUpperCase(),
      payIdType: contact.payIdType,
      payIdValue: contact.payIdValue,
      countryCode: contact.countryCode || "+61",
      institution: contact.bankName || "Commonwealth Bank of Australia",
    });
    setSelectedCountryCode(contact.countryCode || "+61");
    setCustomLegalName("");
    setIsEditingLegalName(false);
    setScreen("payment_details");
  };

  // Share Receipt function
  const handleShareReceipt = () => {
    if (!completedReceipt) return;
    const shareText = `CommBank / Valourian Osko Payment Receipt\nReceipt Number: ${completedReceipt.receiptNumber}\nAmount: $${completedReceipt.amount.toFixed(2)} AUD\nPaid To: ${completedReceipt.recipientLegalName || completedReceipt.recipientName}\nPayID: ${completedReceipt.recipientTarget}\nBank: ${completedReceipt.destinationBank}\nStatus: Settled, Cleared & Accepted by Recipient Bank\nDate: ${completedReceipt.timestamp}`;

    if (navigator.share) {
      navigator.share({
        title: "Osko Payment Receipt",
        text: shareText,
      }).catch(() => {
        navigator.clipboard.writeText(shareText);
        toast.success("Receipt copied to clipboard!");
      });
    } else {
      navigator.clipboard.writeText(shareText);
      toast.success("Receipt copied to clipboard!");
    }
  };

  const handleMakeAnother = () => {
    setAmount("");
    setDescription("");
    setReference("");
    setPayIdValue("");
    setCustomLegalName("");
    setIsEditingLegalName(false);
    setResolvedPayee(null);
    setCompletedReceipt(null);
    setScreen("pay_someone");
  };

  if (!isOpen) return null;

  const content = (
    <div className="bg-white rounded-3xl overflow-hidden shadow-2xl border border-slate-200 w-full max-w-xl flex flex-col min-h-[640px] text-slate-900 font-sans relative">
      {/* Top Header Banner matching CommBank aesthetic (Gold/Yellow brand bar + Clean Title) */}
      <div className="bg-[#ffcc00] px-6 py-4 flex items-center justify-between border-b border-amber-300">
        <div className="flex items-center gap-3">
          {screen !== "pay_someone" && screen !== "sent_confirmation" && (
            <button
              onClick={() => {
                if (screen === "receiver_accounts") setScreen("pay_someone");
                else if (screen === "payment_details") setScreen("pay_someone");
                else if (screen === "enter_payid") setScreen("choose_method");
                else if (screen === "choose_method") setScreen("pay_someone");
                else if (screen === "review") setScreen("payment_details");
              }}
              className="p-1.5 -ml-2 rounded-full hover:bg-black/10 transition-colors text-slate-900 cursor-pointer"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
          )}
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-black text-[#ffcc00] flex items-center justify-center font-black text-xs shadow-sm">
              CBA
            </div>
            <div>
              <h2 className="text-base font-black text-slate-950 tracking-tight leading-none">
                {screen === "pay_someone" && "Pay someone"}
                {screen === "choose_method" && "Choose how to pay"}
                {screen === "enter_payid" && "Enter PayID"}
                {screen === "payment_details" && "Payment details"}
                {screen === "review" && "Review payment"}
                {screen === "sent_confirmation" && "Payment sent"}
                {screen === "receiver_accounts" && "Receiver bank accounts"}
              </h2>
              <p className="text-[10px] font-bold text-slate-800 tracking-wide mt-0.5">
                Fast payment (Osko® • NPP 24/7)
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setScreen(screen === "receiver_accounts" ? "pay_someone" : "receiver_accounts")}
            className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider flex items-center gap-1.5 transition-all cursor-pointer shadow-xs ${
              screen === "receiver_accounts"
                ? "bg-slate-950 text-[#ffcc00] ring-1 ring-amber-400"
                : "bg-black/10 hover:bg-black/20 text-slate-900"
            }`}
            title="Inspect receiver accounts, real-time balances & incoming statements"
          >
            <Landmark className="w-3.5 h-3.5" />
            <span>{screen === "receiver_accounts" ? "Make Payment" : "Receiver Accounts"}</span>
          </button>

          <div className="px-2 py-0.5 rounded-full bg-black/10 text-slate-900 text-[10px] font-black uppercase tracking-wider flex items-center gap-1">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-600 animate-pulse" />
            NPP Live
          </div>
          {onClose && (
            <button
              onClick={onClose}
              className="p-1.5 rounded-full hover:bg-black/10 text-slate-900 transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          )}
        </div>
      </div>

      {/* Screen Views */}
      <div className="flex-1 overflow-y-auto p-6 bg-slate-50 flex flex-col">
        {/* ========================================================================= */}
        {/* SCREEN 1: "PAY SOMEONE" DIRECTORY & SEARCH                                */}
        {/* ========================================================================= */}
        {screen === "pay_someone" && (
          <div className="space-y-5">
            {/* Search Input */}
            <div className="relative">
              <Search className="w-5 h-5 text-slate-400 absolute left-4 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search name, PayID or account"
                className="w-full bg-white rounded-2xl border border-slate-200 pl-11 pr-10 py-3.5 text-sm font-semibold text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[#ffcc00] focus:border-amber-400 shadow-sm"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery("")}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 p-1 text-slate-400 hover:text-slate-600"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>

            {/* Quick Action: Pay Someone New */}
            <button
              onClick={() => setScreen("choose_method")}
              className="w-full bg-white hover:bg-amber-50/50 border border-slate-200 hover:border-[#ffcc00] rounded-2xl p-4 flex items-center justify-between transition-all group shadow-sm cursor-pointer"
            >
              <div className="flex items-center gap-3.5">
                <div className="w-11 h-11 rounded-2xl bg-[#ffcc00] text-slate-950 flex items-center justify-center font-black group-hover:scale-105 transition-transform shadow-sm">
                  <Plus className="w-6 h-6" strokeWidth={2.5} />
                </div>
                <div className="text-left">
                  <div className="text-sm font-black text-slate-900">
                    Pay someone new
                  </div>
                  <div className="text-xs text-slate-500 font-medium">
                    PayID (Mobile, Email, ABN) or Bank Account
                  </div>
                </div>
              </div>
              <ChevronRight className="w-5 h-5 text-slate-400 group-hover:translate-x-1 group-hover:text-amber-600 transition-all" />
            </button>

            {/* Filter Tabs */}
            <div className="flex items-center gap-1.5 p-1 bg-slate-200/70 rounded-xl overflow-x-auto hide-scrollbar">
              {(
                [
                  { id: "all", label: "All" },
                  { id: "payid", label: "PayID" },
                  { id: "accounts", label: "Accounts" },
                  { id: "recent", label: "Recent" },
                  { id: "favorites", label: "Favorites" },
                ] as const
              ).map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveFilterTab(tab.id)}
                  className={`flex-1 py-1.5 px-3 rounded-lg text-xs font-bold transition-all whitespace-nowrap cursor-pointer ${
                    activeFilterTab === tab.id
                      ? "bg-white text-slate-950 shadow-sm"
                      : "text-slate-600 hover:text-slate-900"
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>

            {/* Payee Contacts List / Accounts View */}
            {activeFilterTab === "accounts" ? (
              <div className="space-y-3">
                <div className="flex items-center justify-between px-1">
                  <div className="text-xs font-black uppercase tracking-wider text-slate-400">
                    Linked CBA & Treasury Accounts ({userAccounts.length})
                  </div>
                  <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                    Live Balances
                  </span>
                </div>

                <div className="space-y-2.5">
                  {userAccounts.map((acc) => (
                    <div
                      key={acc.id}
                      className="w-full bg-white border border-slate-200 hover:border-amber-400 rounded-2xl p-4 transition-all shadow-sm flex flex-col justify-between gap-3"
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-xl bg-[#ffcc00] text-slate-950 flex items-center justify-center font-black shadow-xs shrink-0">
                            <Landmark className="w-5 h-5" />
                          </div>
                          <div>
                            <div className="text-sm font-bold text-slate-900 flex items-center gap-1.5">
                              <span>{acc.name}</span>
                              <span className="text-[9px] font-black uppercase px-1.5 py-0.5 bg-slate-100 rounded text-slate-600">
                                {acc.id === "acc_smart_access" ? "Primary Everyday" : acc.id === "acc_goalsaver" ? "High Yield" : "Live"}
                              </span>
                            </div>
                            <div className="text-xs text-slate-500 font-mono mt-0.5">
                              {acc.number} • {acc.bankName}
                            </div>
                            <div className="text-[10px] font-semibold text-slate-400 mt-0.5">
                              Account Holder: {acc.accountHolder}
                            </div>
                          </div>
                        </div>

                        <div className="text-right">
                          <div className="text-base font-black text-slate-950">
                            ${acc.balance.toLocaleString("en-AU", { minimumFractionDigits: 2 })}
                          </div>
                          <div className="text-[10px] text-emerald-600 font-bold uppercase tracking-wider mt-0.5">
                            Available Balance
                          </div>
                        </div>
                      </div>

                      <div className="pt-2 border-t border-slate-100 flex items-center justify-end gap-2">
                        <button
                          type="button"
                          onClick={() => {
                            setResolvedPayee({
                              registeredName: acc.accountHolder,
                              payIdType: "account",
                              payIdValue: acc.number,
                              institution: acc.bankName,
                            });
                            setCustomLegalName(acc.accountHolder);
                            setScreen("payment_details");
                          }}
                          className="px-3.5 py-1.5 rounded-xl bg-[#ffcc00] hover:bg-amber-400 text-slate-950 font-bold text-xs flex items-center gap-1.5 transition-colors cursor-pointer shadow-xs"
                        >
                          <span>Pay into this account</span>
                          <ChevronRight className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <div className="space-y-2.5">
                <div className="text-xs font-black uppercase tracking-wider text-slate-400 px-1">
                  Saved Payees ({filteredContacts.length})
                </div>

              {filteredContacts.length === 0 ? (
                <div className="text-center py-10 bg-white rounded-2xl border border-slate-200 p-6">
                  <Smartphone className="w-10 h-10 text-slate-300 mx-auto mb-2" />
                  <p className="text-sm font-bold text-slate-700">No payees found</p>
                  <p className="text-xs text-slate-400 mt-1 mb-4">
                    Tap "Pay someone new" to make a fast PayID payment.
                  </p>
                  <button
                    onClick={() => setScreen("choose_method")}
                    className="px-4 py-2 bg-[#ffcc00] text-slate-950 font-bold text-xs rounded-xl hover:bg-amber-400 transition-colors shadow-sm"
                  >
                    Add new PayID payee
                  </button>
                </div>
              ) : (
                filteredContacts.map((contact) => (
                  <button
                    key={contact.id}
                    onClick={() => handleSelectContact(contact)}
                    className="w-full bg-white hover:bg-slate-50 border border-slate-200 hover:border-slate-300 rounded-2xl p-3.5 flex items-center justify-between transition-all text-left shadow-sm group cursor-pointer"
                  >
                    <div className="flex items-center gap-3.5">
                      <div
                        className={`w-11 h-11 rounded-2xl ${
                          contact.avatarColor || "bg-indigo-600"
                        } text-white flex items-center justify-center font-black text-sm shadow-sm group-hover:scale-105 transition-transform`}
                      >
                        {contact.name
                          .split(" ")
                          .map((n) => n[0])
                          .slice(0, 2)
                          .join("")
                          .toUpperCase()}
                      </div>
                      <div>
                        <div className="text-sm font-bold text-slate-900 flex items-center gap-2">
                          {contact.name}
                          {contact.payIdType !== "account" && (
                            <span className="px-1.5 py-0.5 rounded text-[9px] font-black uppercase tracking-wider bg-emerald-100 text-emerald-700">
                              Osko PayID
                            </span>
                          )}
                        </div>
                        <div className="text-xs text-slate-500 font-mono mt-0.5">
                          {contact.countryCode ? `${contact.countryCode} ` : ""}{contact.payIdValue} • {contact.bankName || "Commonwealth Bank"}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      {contact.lastPaidDate && (
                        <span className="text-[11px] text-slate-400 font-medium">
                          {contact.lastPaidDate}
                        </span>
                      )}
                      <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center text-slate-500 group-hover:bg-[#ffcc00] group-hover:text-slate-950 transition-colors">
                        <ChevronRight className="w-4 h-4" />
                      </div>
                    </div>
                  </button>
                ))
              )}
            </div>
          )}
        </div>
      )}

        {/* ========================================================================= */}
        {/* SCREEN 2: "CHOOSE HOW TO PAY" METHOD SELECTOR                             */}
        {/* ========================================================================= */}
        {screen === "choose_method" && (
          <div className="space-y-4">
            <div className="bg-amber-50/70 border border-amber-200 rounded-2xl p-4 flex items-start gap-3">
              <Sparkles className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
              <div className="text-xs text-amber-900">
                <span className="font-bold">Instant Osko Settlement:</span> PayID payments
                clear 24/7 in real-time. The recipient's legal name registered with their bank
                is verified and displayed before any funds leave your account.
              </div>
            </div>

            <div className="space-y-3 pt-2">
              {/* Option 1: Mobile Number */}
              <button
                onClick={() => {
                  setPayIdType("phone");
                  setPayIdValue("");
                  setScreen("enter_payid");
                }}
                className="w-full bg-white hover:bg-amber-50/50 border border-slate-200 hover:border-[#ffcc00] rounded-2xl p-4 flex items-center justify-between transition-all group shadow-sm cursor-pointer"
              >
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-2xl bg-amber-100 text-amber-700 flex items-center justify-center group-hover:bg-[#ffcc00] group-hover:text-slate-950 transition-colors">
                    <Smartphone className="w-6 h-6" />
                  </div>
                  <div className="text-left">
                    <div className="text-sm font-black text-slate-900">
                      Mobile number
                    </div>
                    <div className="text-xs text-slate-500">
                      Pay using mobile number (Australian +61 or international)
                    </div>
                  </div>
                </div>
                <ChevronRight className="w-5 h-5 text-slate-400 group-hover:translate-x-1 group-hover:text-amber-600 transition-all" />
              </button>

              {/* Option 2: Email Address */}
              <button
                onClick={() => {
                  setPayIdType("email");
                  setPayIdValue("");
                  setScreen("enter_payid");
                }}
                className="w-full bg-white hover:bg-amber-50/50 border border-slate-200 hover:border-[#ffcc00] rounded-2xl p-4 flex items-center justify-between transition-all group shadow-sm cursor-pointer"
              >
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-2xl bg-blue-100 text-blue-700 flex items-center justify-center group-hover:bg-[#ffcc00] group-hover:text-slate-950 transition-colors">
                    <Mail className="w-6 h-6" />
                  </div>
                  <div className="text-left">
                    <div className="text-sm font-black text-slate-900">
                      Email address
                    </div>
                    <div className="text-xs text-slate-500">
                      Pay using a verified registered email address
                    </div>
                  </div>
                </div>
                <ChevronRight className="w-5 h-5 text-slate-400 group-hover:translate-x-1 group-hover:text-amber-600 transition-all" />
              </button>

              {/* Option 3: ABN / Organisation ID */}
              <button
                onClick={() => {
                  setPayIdType("abn");
                  setPayIdValue("");
                  setScreen("enter_payid");
                }}
                className="w-full bg-white hover:bg-amber-50/50 border border-slate-200 hover:border-[#ffcc00] rounded-2xl p-4 flex items-center justify-between transition-all group shadow-sm cursor-pointer"
              >
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-2xl bg-emerald-100 text-emerald-700 flex items-center justify-center group-hover:bg-[#ffcc00] group-hover:text-slate-950 transition-colors">
                    <Building className="w-6 h-6" />
                  </div>
                  <div className="text-left">
                    <div className="text-sm font-black text-slate-900">
                      ABN / Organisation ID
                    </div>
                    <div className="text-xs text-slate-500">
                      Pay a registered Australian business or company
                    </div>
                  </div>
                </div>
                <ChevronRight className="w-5 h-5 text-slate-400 group-hover:translate-x-1 group-hover:text-amber-600 transition-all" />
              </button>

              {/* Option 4: Bank account (BSB & Account) */}
              <button
                onClick={() => {
                  handleSelectContact(DEFAULT_COMMBANK_PAYEES[4]);
                }}
                className="w-full bg-white hover:bg-amber-50/50 border border-slate-200 hover:border-[#ffcc00] rounded-2xl p-4 flex items-center justify-between transition-all group shadow-sm cursor-pointer"
              >
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-2xl bg-indigo-100 text-indigo-700 flex items-center justify-center group-hover:bg-[#ffcc00] group-hover:text-slate-950 transition-colors">
                    <Landmark className="w-6 h-6" />
                  </div>
                  <div className="text-left">
                    <div className="text-sm font-black text-slate-900">
                      Bank account
                    </div>
                    <div className="text-xs text-slate-500">
                      Pay using BSB and account number (Osko eligible)
                    </div>
                  </div>
                </div>
                <ChevronRight className="w-5 h-5 text-slate-400 group-hover:translate-x-1 group-hover:text-amber-600 transition-all" />
              </button>
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* SCREEN 3: "ENTER PAYID" INPUT & LIVE VALIDATION                            */}
        {/* ========================================================================= */}
        {screen === "enter_payid" && (
          <div className="space-y-6 flex-1 flex flex-col justify-between">
            <div className="space-y-5">
              {/* Type Switcher Tabs */}
              <div className="flex items-center gap-1.5 p-1 bg-slate-200/80 rounded-2xl">
                {(
                  [
                    { id: "phone", label: "Mobile" },
                    { id: "email", label: "Email" },
                    { id: "abn", label: "ABN" },
                    { id: "organization", label: "Org ID" },
                  ] as const
                ).map((t) => (
                  <button
                    key={t.id}
                    type="button"
                    onClick={() => {
                      setPayIdType(t.id);
                      setPayIdValue("");
                      setValidationError("");
                      setShowCountryDropdown(false);
                    }}
                    className={`flex-1 py-2 rounded-xl text-xs font-black uppercase tracking-wider transition-all cursor-pointer ${
                      payIdType === t.id
                        ? "bg-white text-slate-950 shadow-sm"
                        : "text-slate-500 hover:text-slate-900"
                    }`}
                  >
                    {t.label}
                  </button>
                ))}
              </div>

              {/* Input Card with Country Code Selector */}
              <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm space-y-3">
                <div className="flex justify-between items-center">
                  <label className="block text-xs font-black uppercase tracking-wider text-slate-400">
                    {payIdType === "phone" && "Recipient Mobile number"}
                    {payIdType === "email" && "Email address"}
                    {payIdType === "abn" && "Australian Business Number (ABN)"}
                    {payIdType === "organization" && "Organisation Identifier"}
                  </label>
                  {payIdType === "phone" && (
                    <span className="text-[10px] font-bold text-amber-700 bg-amber-50 px-2 py-0.5 rounded-md border border-amber-200">
                      Country Code: {selectedCountryCode}
                    </span>
                  )}
                </div>

                <div className="flex gap-2 items-center">
                  {payIdType === "phone" && (
                    <div className="relative">
                      <button
                        type="button"
                        onClick={() => setShowCountryDropdown(!showCountryDropdown)}
                        className="h-[52px] px-3 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-xl flex items-center gap-1.5 text-xs font-black text-slate-800 transition-colors cursor-pointer shrink-0"
                      >
                        <span className="text-base">
                          {SUPPORTED_COUNTRY_CODES.find((c) => c.code === selectedCountryCode)?.flag || "🇦🇺"}
                        </span>
                        <span>{selectedCountryCode}</span>
                        <ChevronRight
                          className={`w-3.5 h-3.5 text-slate-400 transition-transform ${
                            showCountryDropdown ? "rotate-90" : ""
                          }`}
                        />
                      </button>

                      {showCountryDropdown && (
                        <div className="absolute left-0 top-full mt-1.5 w-64 bg-white border border-slate-200 rounded-2xl shadow-xl z-50 p-2 max-h-60 overflow-y-auto space-y-1">
                          <div className="text-[10px] font-black uppercase tracking-wider text-slate-400 px-2 py-1">
                            Select Country Code
                          </div>
                          {SUPPORTED_COUNTRY_CODES.map((item) => (
                            <button
                              key={item.code + item.country}
                              type="button"
                              onClick={() => {
                                setSelectedCountryCode(item.code);
                                setShowCountryDropdown(false);
                              }}
                              className={`w-full px-3 py-2 rounded-xl text-left flex items-center justify-between text-xs font-bold transition-colors cursor-pointer ${
                                selectedCountryCode === item.code
                                  ? "bg-[#ffcc00] text-slate-950 font-black"
                                  : "hover:bg-slate-50 text-slate-700"
                              }`}
                            >
                              <div className="flex items-center gap-2">
                                <span className="text-base">{item.flag}</span>
                                <span>{item.country}</span>
                              </div>
                              <span className="font-mono text-slate-500">{item.code}</span>
                            </button>
                          ))}
                        </div>
                      )}
                    </div>
                  )}

                  <div className="relative flex-1">
                    <input
                      type={payIdType === "email" ? "email" : "text"}
                      value={payIdValue}
                      onChange={(e) => handlePayIdChange(e.target.value)}
                      placeholder={
                        payIdType === "phone"
                          ? "0400 286 693"
                          : payIdType === "email"
                            ? "asim.nsw@gmail.com"
                            : payIdType === "abn"
                              ? "51 824 753 556"
                              : "ORG-AU-XXXXX"
                      }
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3.5 text-base font-bold font-mono text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[#ffcc00] focus:border-amber-400 transition-all"
                      autoFocus
                    />
                    {payIdValue && (
                      <button
                        onClick={() => setPayIdValue("")}
                        className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-1 cursor-pointer"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                </div>

                {/* Live Confirmation of Payee (CoP) Card */}
                {isLiveChecking && !livePreview && (
                  <div className="flex items-center gap-2.5 p-3 rounded-xl bg-amber-50/70 border border-amber-200 text-xs font-bold text-amber-900 animate-pulse">
                    <Loader2 className="w-4 h-4 animate-spin text-amber-600" />
                    <span>Querying NPP Confirmation of Payee directory for legal account holder...</span>
                  </div>
                )}

                {livePreview && (
                  <div className="p-4 rounded-xl bg-emerald-50/80 border border-emerald-200 shadow-xs space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-1.5 px-2.5 py-0.5 bg-emerald-100/90 text-emerald-800 rounded-full text-[10px] font-black uppercase tracking-wider">
                        <ShieldCheck className="w-3.5 h-3.5" />
                        Confirmation of Payee: 100% Name Match
                      </div>
                      <span className="text-[10px] font-bold text-slate-500 font-mono">
                        NPP / Osko
                      </span>
                    </div>

                    <div>
                      <span className="text-[10px] uppercase font-black tracking-wider text-slate-400 block mb-0.5">
                        Legal Account Holder Name
                      </span>
                      <div className="text-base font-black text-slate-900 tracking-tight flex items-center gap-2">
                        <span>{customLegalName || livePreview.registeredName}</span>
                        <CheckCircle2 className="w-4 h-4 text-emerald-600 inline shrink-0" />
                      </div>
                      <div className="text-xs text-slate-500 font-semibold mt-0.5 flex items-center gap-1.5 flex-wrap">
                        <span>{livePreview.institution}</span>
                        <span>•</span>
                        <span className="font-mono">{livePreview.countryCode ? `${livePreview.countryCode} ` : ""}{livePreview.payIdValue}</span>
                      </div>
                    </div>

                    <div className="pt-2 border-t border-emerald-200/60 flex items-center justify-between gap-2">
                      <button
                        type="button"
                        onClick={() => {
                          setResolvedPayee({
                            registeredName: customLegalName || livePreview.registeredName,
                            payIdType: livePreview.payIdType,
                            payIdValue: livePreview.payIdValue,
                            countryCode: livePreview.countryCode || selectedCountryCode,
                            institution: livePreview.institution,
                          });
                          setScreen("payment_details");
                        }}
                        className="flex-1 py-2.5 px-3 rounded-lg bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-1.5 cursor-pointer shadow-xs transition-colors"
                      >
                        <UserCheck className="w-3.5 h-3.5" />
                        <span>Confirm & Continue</span>
                      </button>
                      
                      <button
                        type="button"
                        onClick={() => {
                          const newName = window.prompt("Refine / Confirm Recipient Legal Name:", customLegalName || livePreview.registeredName);
                          if (newName && newName.trim()) {
                            setCustomLegalName(newName.trim().toUpperCase());
                          }
                        }}
                        className="py-2.5 px-3 rounded-lg bg-white border border-emerald-300 text-slate-800 font-bold text-xs hover:bg-slate-50 cursor-pointer"
                      >
                        Refine Name
                      </button>
                    </div>
                  </div>
                )}

                {validationError && (
                  <div className="flex items-center gap-2 text-xs font-bold text-rose-600 mt-2">
                    <AlertCircle className="w-4 h-4 shrink-0" />
                    <span>{validationError}</span>
                  </div>
                )}
              </div>

              {/* Sample PayID Shortcuts */}
              <div className="space-y-2">
                <div className="text-[11px] font-black uppercase tracking-wider text-slate-400">
                  Quick Select Demonstrations
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      setPayIdType("phone");
                      setSelectedCountryCode("+61");
                      setPayIdValue("0400 286 693");
                    }}
                    className="p-2.5 bg-white border border-slate-200 hover:border-amber-400 rounded-xl text-left text-xs font-semibold text-slate-700 transition-colors shadow-2xs cursor-pointer"
                  >
                    <div className="font-bold text-slate-900 flex items-center gap-1.5">
                      <span>Christopher Scott</span>
                      <span className="px-1.5 py-0.2 rounded bg-amber-100 text-amber-800 text-[9px] font-black">
                        🇦🇺 Mobile
                      </span>
                    </div>
                    <div className="text-[10px] text-slate-400 font-mono">+61 0400 286 693</div>
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setPayIdType("phone");
                      setSelectedCountryCode("+61");
                      setPayIdValue("0412 345 678");
                    }}
                    className="p-2.5 bg-white border border-slate-200 hover:border-amber-400 rounded-xl text-left text-xs font-semibold text-slate-700 transition-colors shadow-2xs cursor-pointer"
                  >
                    <div className="font-bold text-slate-900 flex items-center gap-1.5">
                      <span>Sarah Elizabeth Conner</span>
                      <span className="px-1.5 py-0.2 rounded bg-amber-100 text-amber-800 text-[9px] font-black">
                        🇦🇺 Mobile
                      </span>
                    </div>
                    <div className="text-[10px] text-slate-400 font-mono">+61 0412 345 678</div>
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setPayIdType("email");
                      setPayIdValue("asim.nsw@gmail.com");
                    }}
                    className="p-2.5 bg-white border border-slate-200 hover:border-amber-400 rounded-xl text-left text-xs font-semibold text-slate-700 transition-colors shadow-2xs cursor-pointer"
                  >
                    <div className="font-bold text-slate-900 flex items-center gap-1.5">
                      <span>Asim Aryal</span>
                      <span className="px-1.5 py-0.2 rounded bg-blue-100 text-blue-800 text-[9px] font-black">
                        PayID Email
                      </span>
                    </div>
                    <div className="text-[10px] text-slate-400 font-mono">asim.nsw@gmail.com</div>
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setPayIdType("phone");
                      setSelectedCountryCode("+61");
                      setPayIdValue("0400 111 222");
                    }}
                    className="p-2.5 bg-white border border-slate-200 hover:border-amber-400 rounded-xl text-left text-xs font-semibold text-slate-700 transition-colors shadow-2xs cursor-pointer"
                  >
                    <div className="font-bold text-slate-900 flex items-center gap-1.5">
                      <span>Lachlan Murdoch</span>
                      <span className="px-1.5 py-0.2 rounded bg-amber-100 text-amber-800 text-[9px] font-black">
                        🇦🇺 NAB
                      </span>
                    </div>
                    <div className="text-[10px] text-slate-400 font-mono">+61 0400 111 222</div>
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setPayIdType("abn");
                      setPayIdValue("51 824 753 556");
                    }}
                    className="col-span-2 p-2.5 bg-white border border-slate-200 hover:border-amber-400 rounded-xl text-left text-xs font-semibold text-slate-700 transition-colors shadow-2xs cursor-pointer"
                  >
                    <div className="font-bold text-slate-900 flex items-center justify-between">
                      <span>Valourian Capital Pty Ltd</span>
                      <span className="px-2 py-0.5 bg-slate-900 text-[#ffcc00] rounded text-[9px] font-black">
                        Sovereign Treasury ABN
                      </span>
                    </div>
                    <div className="text-[10px] text-slate-400 font-mono">51 824 753 556</div>
                  </button>
                </div>
              </div>

              {/* Informative Security Banner */}
              <div className="bg-slate-100/80 rounded-2xl p-4 text-xs text-slate-600 flex items-start gap-3">
                <ShieldCheck className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
                <div>
                  <span className="font-bold text-slate-800">Scam & Fraud Protection:</span> PayID
                  queries the official Australian central directory to show you the registered
                  legal name attached to the recipient's bank account before funds leave your account.
                </div>
              </div>
            </div>

            {/* Validate / Next Action Button */}
            <button
              onClick={handleVerifyPayId}
              disabled={isValidating || !payIdValue.trim()}
              className="w-full py-4 bg-[#ffcc00] hover:bg-amber-400 active:scale-[0.99] text-slate-950 font-black text-sm uppercase tracking-wider rounded-2xl shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed mt-4"
            >
              {isValidating ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  <span>Checking PayID Legal Directory...</span>
                </>
              ) : (
                <>
                  <span>Verify Payee Legal Name</span>
                  <ChevronRight className="w-5 h-5" />
                </>
              )}
            </button>
          </div>
        )}

        {/* ========================================================================= */}
        {/* SCREEN 5: "PAYMENT DETAILS" (AMOUNT, FROM ACCOUNT, OSKO DESCRIPTION)       */}
        {/* ========================================================================= */}
        {screen === "payment_details" && resolvedPayee && (
          <div className="space-y-5 flex-1 flex flex-col justify-between">
            <div className="space-y-4">
              {/* Verified Payee Header Card with Recipient Legal Name */}
              <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-sm relative overflow-hidden">
                <div className="absolute top-0 right-0 p-3 opacity-10">
                  <Sparkles className="w-16 h-16 text-amber-500" />
                </div>
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-1.5 px-2.5 py-0.5 bg-emerald-50 border border-emerald-200 text-emerald-700 rounded-full text-[10px] font-black uppercase tracking-wider">
                    <ShieldCheck className="w-3.5 h-3.5" />
                    PayID Legal Name Verified
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => setIsEditingLegalName(!isEditingLegalName)}
                      className="text-xs font-bold text-blue-600 hover:underline cursor-pointer flex items-center gap-1"
                    >
                      <Edit2 className="w-3 h-3" />
                      {isEditingLegalName ? "Cancel" : "Edit Name"}
                    </button>
                    <button
                      onClick={() => setScreen("enter_payid")}
                      className="text-xs font-bold text-amber-700 hover:underline cursor-pointer"
                    >
                      Change PayID
                    </button>
                  </div>
                </div>

                {!isEditingLegalName ? (
                  <>
                    <div className="text-base font-black text-slate-950 tracking-tight">
                      {customLegalName || resolvedPayee.registeredName}
                    </div>
                    <div className="text-xs text-slate-500 font-mono mt-0.5 flex items-center gap-2 flex-wrap">
                      <span>
                        PayID: {resolvedPayee.countryCode ? `${resolvedPayee.countryCode} ` : ""}{resolvedPayee.payIdValue}
                      </span>
                      <span>•</span>
                      <span>{resolvedPayee.institution}</span>
                    </div>
                  </>
                ) : (
                  <div className="mt-2 space-y-2 pt-1 border-t border-slate-100">
                    <label className="block text-[10px] uppercase font-black tracking-wider text-slate-400">
                      Confirm / Refine Recipient Legal Name
                    </label>
                    <div className="flex gap-2">
                      <input
                        type="text"
                        value={customLegalName || resolvedPayee.registeredName}
                        onChange={(e) => setCustomLegalName(e.target.value.toUpperCase())}
                        placeholder="e.g. ASIM ARYAL"
                        className="flex-1 bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-sm font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#ffcc00]"
                      />
                      <button
                        type="button"
                        onClick={() => setIsEditingLegalName(false)}
                        className="px-3.5 py-2 bg-slate-900 text-white rounded-xl text-xs font-bold cursor-pointer"
                      >
                        Save
                      </button>
                    </div>
                  </div>
                )}
              </div>

              {/* "From" Account Selector Card */}
              <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-sm space-y-2">
                <div className="flex justify-between items-center">
                  <span className="text-xs font-black uppercase tracking-wider text-slate-400">
                    From account
                  </span>
                  <button
                    type="button"
                    onClick={() => setShowAccountDrawer(!showAccountDrawer)}
                    className="text-xs font-bold text-amber-700 hover:underline cursor-pointer"
                  >
                    {showAccountDrawer ? "Done" : "Change account"}
                  </button>
                </div>

                {!showAccountDrawer ? (
                  <div
                    onClick={() => setShowAccountDrawer(true)}
                    className="flex items-center justify-between p-3 rounded-xl bg-slate-50 hover:bg-slate-100/80 transition-colors cursor-pointer"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-[#ffcc00] text-slate-950 flex items-center justify-center font-black">
                        <Wallet className="w-5 h-5" />
                      </div>
                      <div>
                        <div className="text-sm font-bold text-slate-900">
                          {activeAccount.name}
                        </div>
                        <div className="text-xs text-slate-500 font-mono">
                          {activeAccount.number}
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-sm font-black text-slate-900">
                        ${activeAccount.balance.toLocaleString("en-AU", { minimumFractionDigits: 2 })}
                      </div>
                      <div className="text-[10px] text-slate-400 font-semibold uppercase">
                        Available
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-2 pt-1">
                    {userAccounts.map((acc) => (
                      <button
                        key={acc.id}
                        type="button"
                        onClick={() => {
                          setSelectedAccountId(acc.id);
                          setShowAccountDrawer(false);
                        }}
                        className={`w-full p-3 rounded-xl border text-left flex items-center justify-between transition-all cursor-pointer ${
                          selectedAccountId === acc.id
                            ? "bg-amber-50/60 border-[#ffcc00]"
                            : "bg-white border-slate-200 hover:border-slate-300"
                        }`}
                      >
                        <div>
                          <div className="text-sm font-bold text-slate-900">{acc.name}</div>
                          <div className="text-xs text-slate-500 font-mono">{acc.number}</div>
                        </div>
                        <div className="text-right">
                          <div className="text-sm font-black text-slate-900">
                            ${acc.balance.toLocaleString("en-AU", { minimumFractionDigits: 2 })}
                          </div>
                          {selectedAccountId === acc.id && (
                            <span className="text-[10px] text-amber-700 font-black uppercase">
                              Active
                            </span>
                          )}
                        </div>
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* Amount Input with Currency and Quick Chips */}
              <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm space-y-3">
                <span className="text-xs font-black uppercase tracking-wider text-slate-400">
                  Amount
                </span>
                <div className="relative flex items-center">
                  <span className="text-3xl font-black text-slate-400 mr-2">$</span>
                  <input
                    type="number"
                    step="any"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    placeholder="0.00"
                    className="w-full text-3xl font-black text-slate-900 placeholder:text-slate-300 focus:outline-none bg-transparent"
                    autoFocus
                  />
                  <span className="text-xs font-black text-slate-400 uppercase tracking-widest ml-2">
                    AUD
                  </span>
                </div>

                {/* Quick Amount Chips */}
                <div className="flex items-center gap-2 pt-1 overflow-x-auto hide-scrollbar">
                  {[20, 50, 100, 200, 500, 5000].map((val) => (
                    <button
                      key={val}
                      type="button"
                      onClick={() => setAmount(String(val))}
                      className="py-1.5 px-3 rounded-xl bg-slate-100 hover:bg-[#ffcc00] hover:text-slate-950 text-xs font-bold text-slate-700 transition-colors cursor-pointer whitespace-nowrap"
                    >
                      +${val.toLocaleString()}
                    </button>
                  ))}
                  <button
                    type="button"
                    onClick={() => setAmount(String(activeAccount.balance))}
                    className="py-1.5 px-3 rounded-xl bg-slate-100 hover:bg-[#ffcc00] hover:text-slate-950 text-xs font-bold text-slate-700 transition-colors cursor-pointer"
                  >
                    All
                  </button>
                </div>
              </div>

              {/* Description (Osko 280 chars max) */}
              <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-sm space-y-2">
                <div className="flex justify-between items-center">
                  <label className="text-xs font-black uppercase tracking-wider text-slate-400">
                    Description (For recipient)
                  </label>
                  <span className="text-[10px] text-slate-400 font-mono">
                    {description.length}/280
                  </span>
                </div>
                <input
                  type="text"
                  maxLength={280}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="e.g. CS, Invoice Settlement, Direct Deposit"
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-sm font-medium text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[#ffcc00]"
                />
              </div>

              {/* Statement Reference (18 chars max) */}
              <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-sm space-y-2">
                <div className="flex justify-between items-center">
                  <label className="text-xs font-black uppercase tracking-wider text-slate-400">
                    Reference (For your statement)
                  </label>
                  <span className="text-[10px] text-slate-400 font-mono">
                    {reference.length}/18
                  </span>
                </div>
                <input
                  type="text"
                  maxLength={18}
                  value={reference}
                  onChange={(e) => setReference(e.target.value)}
                  placeholder="e.g. 10001"
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-sm font-medium text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[#ffcc00]"
                />
              </div>
            </div>

            {/* Review Button */}
            <button
              onClick={() => {
                const num = parseFloat(amount.replace(/,/g, ""));
                if (isNaN(num) || num <= 0) {
                  toast.error("Please enter a valid amount");
                  return;
                }
                setScreen("review");
              }}
              disabled={!amount || parseFloat(amount) <= 0}
              className="w-full py-4 bg-[#ffcc00] hover:bg-amber-400 active:scale-[0.99] text-slate-950 font-black text-sm uppercase tracking-wider rounded-2xl shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed mt-4"
            >
              <span>Review payment</span>
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>
        )}

        {/* ========================================================================= */}
        {/* SCREEN 6: "REVIEW PAYMENT" SCREEN (EXACT MATCH FOR USER ATTACHED IMAGE)   */}
        {/* ========================================================================= */}
        {screen === "review" && resolvedPayee && (
          <div className="space-y-5 flex-1 flex flex-col justify-between">
            <div className="space-y-4">
              {/* Prominent Amount Card */}
              <div className="bg-slate-950 rounded-2xl p-6 text-white text-center shadow-lg relative overflow-hidden">
                <div className="absolute top-0 right-0 w-32 h-32 bg-[#ffcc00]/10 rounded-full blur-2xl" />
                <span className="text-xs font-bold uppercase tracking-widest text-[#ffcc00]">
                  Payment Amount
                </span>
                <div className="text-4xl font-black text-white mt-1 tracking-tight">
                  $
                  {parseFloat(amount).toLocaleString("en-AU", {
                    minimumFractionDigits: 2,
                    maximumFractionDigits: 2,
                  })}{" "}
                  <span className="text-sm font-bold text-slate-400">AUD</span>
                </div>
                <div className="mt-3 inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-400 text-[10px] font-black uppercase tracking-wider border border-emerald-500/30">
                  <Sparkles className="w-3.5 h-3.5" />
                  Fast payment (Osko) • Clears in seconds
                </div>
              </div>

              {/* Review Breakdown Card - Clean CBA Layout */}
              <div className="bg-white rounded-2xl border border-slate-200 divide-y divide-slate-100 shadow-sm text-sm">
                {/* TO SECTION: SHOWS RECIPIENT'S LEGAL NAME ATTACHED TO PHONE NUMBER */}
                <div className="p-4 flex justify-between items-start">
                  <div>
                    <span className="text-xs font-black text-slate-400 uppercase tracking-wider block">
                      To
                    </span>
                    <button
                      type="button"
                      onClick={() => {
                        const newName = window.prompt("Confirm / Refine Recipient Legal Name:", customLegalName || resolvedPayee.registeredName);
                        if (newName && newName.trim()) {
                          setCustomLegalName(newName.trim().toUpperCase());
                        }
                      }}
                      className="text-[10px] font-bold text-amber-700 hover:underline mt-1 cursor-pointer flex items-center gap-1"
                    >
                      <Edit2 className="w-2.5 h-2.5" />
                      <span>Edit Name</span>
                    </button>
                  </div>
                  <div className="text-right">
                    <div className="font-black text-slate-950 text-lg tracking-tight">
                      {customLegalName || resolvedPayee.registeredName}
                    </div>
                    <div className="text-xs text-slate-600 font-mono mt-0.5">
                      PayID: {resolvedPayee.countryCode ? `${resolvedPayee.countryCode} ` : ""}{resolvedPayee.payIdValue}
                    </div>
                    <div className="text-xs font-bold text-slate-700 mt-0.5">
                      {resolvedPayee.institution}
                    </div>
                    <div className="text-[10px] text-emerald-700 font-black uppercase mt-1 flex items-center justify-end gap-1 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                      <ShieldCheck className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                      <span>✓ Registered PayID Verified (CoP)</span>
                    </div>
                  </div>
                </div>

                {/* FROM SECTION */}
                <div className="p-4 flex justify-between items-start">
                  <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                    From
                  </span>
                  <div className="text-right">
                    <div className="font-black text-slate-900">
                      {activeAccount.name}
                    </div>
                    <div className="text-xs text-slate-500 font-mono mt-0.5">
                      {activeAccount.number}
                    </div>
                    <div className="text-[11px] text-slate-400 mt-0.5">
                      Remaining after: $
                      {(activeAccount.balance - parseFloat(amount)).toLocaleString("en-AU", {
                        minimumFractionDigits: 2,
                        maximumFractionDigits: 2,
                      })}
                    </div>
                  </div>
                </div>

                {/* DESCRIPTION */}
                <div className="p-4 flex justify-between items-start">
                  <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                    Description
                  </span>
                  <span className="font-semibold text-slate-800 text-right max-w-[240px]">
                    {description || "CS"}
                  </span>
                </div>

                {/* REFERENCE */}
                <div className="p-4 flex justify-between items-start">
                  <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                    Reference
                  </span>
                  <span className="font-semibold text-slate-800 text-right">
                    {reference || "10001"}
                  </span>
                </div>

                {/* TRANSFER FEE */}
                <div className="p-4 flex justify-between items-center">
                  <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                    Transfer fee
                  </span>
                  <span className="font-black text-emerald-600">
                    $0.00 (Free)
                  </span>
                </div>

                {/* CLEARING RAIL */}
                <div className="p-4 flex justify-between items-center">
                  <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                    Clearing rail
                  </span>
                  <span className="font-bold text-slate-800">
                    New Payments Platform (NPP) 24/7
                  </span>
                </div>
              </div>

              {/* Biometric Face ID / Passkey */}
              <div className="bg-slate-100 rounded-2xl p-4 flex items-center justify-between border border-slate-200">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl bg-white text-slate-800 flex items-center justify-center shadow-xs">
                    <Fingerprint className="w-5 h-5 text-indigo-600" />
                  </div>
                  <div>
                    <div className="text-xs font-black text-slate-900">
                      Biometric Face ID / Passkey
                    </div>
                    <div className="text-[10px] text-slate-500">
                      Instant cryptographic settlement approval
                    </div>
                  </div>
                </div>
                <input
                  type="checkbox"
                  checked={useBiometrics}
                  onChange={(e) => setUseBiometrics(e.target.checked)}
                  className="w-5 h-5 rounded border-slate-300 text-indigo-600 focus:ring-[#ffcc00] cursor-pointer"
                />
              </div>
            </div>

            {/* Pay Now Button */}
            <button
              onClick={handleConfirmAndPay}
              disabled={isProcessingPayment}
              className="w-full py-4 bg-[#ffcc00] hover:bg-amber-400 active:scale-[0.99] text-slate-950 font-black text-sm uppercase tracking-wider rounded-2xl shadow-xl transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed mt-4"
            >
              {isProcessingPayment ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  <span>Clearing Payment via NPP...</span>
                </>
              ) : (
                <>
                  <ShieldCheck className="w-5 h-5" />
                  <span>Pay now</span>
                </>
              )}
            </button>
          </div>
        )}

        {/* ========================================================================= */}
        {/* SCREEN 7 & 8: "PAYMENT SENT" CONFIRMATION & RECEIPT                       */}
        {/* ========================================================================= */}
        {screen === "sent_confirmation" && completedReceipt && (
          <div className="space-y-6 flex-1 flex flex-col justify-between py-2">
            <div className="space-y-5">
              {/* Big Success Tick Circle */}
              <div className="text-center pt-2">
                <motion.div
                  initial={{ scale: 0.4, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ type: "spring", stiffness: 220, damping: 16 }}
                  className="w-20 h-20 rounded-full bg-emerald-500 text-white flex items-center justify-center mx-auto shadow-lg shadow-emerald-500/30 mb-4"
                >
                  <Check className="w-10 h-10" strokeWidth={3} />
                </motion.div>

                <h3 className="text-2xl font-black text-slate-950 tracking-tight">
                  Payment sent
                </h3>
                <p className="text-lg font-bold text-slate-700 mt-1">
                  $
                  {completedReceipt.amount.toLocaleString("en-AU", {
                    minimumFractionDigits: 2,
                    maximumFractionDigits: 2,
                  })}{" "}
                  AUD sent to {completedReceipt.recipientLegalName || completedReceipt.recipientName}
                </p>
                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-100 text-emerald-800 text-[11px] font-black uppercase tracking-wider mt-2">
                  <UserCheck className="w-3.5 h-3.5" />
                  Delivered & accepted by {completedReceipt.destinationBank}
                </div>
              </div>

              {/* Receipt Summary Card */}
              <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm divide-y divide-slate-100 text-xs">
                <div className="pb-3 flex justify-between">
                  <span className="text-slate-400 font-bold uppercase tracking-wider">
                    Receipt number
                  </span>
                  <span className="font-mono font-bold text-slate-900">
                    {completedReceipt.receiptNumber}
                  </span>
                </div>

                <div className="py-3 flex justify-between">
                  <span className="text-slate-400 font-bold uppercase tracking-wider">
                    Date & time
                  </span>
                  <span className="font-semibold text-slate-800">
                    {completedReceipt.timestamp}
                  </span>
                </div>

                <div className="py-3 flex justify-between">
                  <span className="text-slate-400 font-bold uppercase tracking-wider">
                    Paid to
                  </span>
                  <div className="text-right">
                    <div className="font-bold text-slate-900 text-sm">
                      {completedReceipt.recipientLegalName || completedReceipt.recipientName}
                    </div>
                    <div className="text-slate-500 font-mono text-[11px] mt-0.5">
                      {completedReceipt.recipientTarget}
                    </div>
                    <div className="text-[11px] font-semibold text-slate-600 mt-0.5">
                      {completedReceipt.destinationBank}
                    </div>
                  </div>
                </div>

                <div className="py-3 flex justify-between">
                  <span className="text-slate-400 font-bold uppercase tracking-wider">
                    Paid from
                  </span>
                  <span className="font-semibold text-slate-800 text-right">
                    {completedReceipt.sourceAccount}
                  </span>
                </div>

                {completedReceipt.description && (
                  <div className="py-3 flex justify-between">
                    <span className="text-slate-400 font-bold uppercase tracking-wider">
                      Description
                    </span>
                    <span className="font-semibold text-slate-800 text-right">
                      {completedReceipt.description}
                    </span>
                  </div>
                )}

                <div className="py-3 flex justify-between">
                  <span className="text-slate-400 font-bold uppercase tracking-wider">
                    Recipient Bank Status
                  </span>
                  <span className="text-emerald-600 font-black uppercase text-[10px]">
                    Accepted & Credited Instantly
                  </span>
                </div>

                <div className="pt-3 flex justify-between items-center">
                  <span className="text-slate-400 font-bold uppercase tracking-wider">
                    Clearing status
                  </span>
                  <span className="px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-700 font-black uppercase text-[10px]">
                    Settled via Fast payment (Osko® • NPP 24/7)
                  </span>
                </div>
              </div>
            </div>

            {/* Bottom Actions */}
            <div className="space-y-2.5">
              {/* Instant View Receiver's Bank Account */}
              <button
                type="button"
                onClick={() => {
                  if (completedReceipt) {
                    const recLegal = (completedReceipt.recipientLegalName || completedReceipt.recipientName || "").toUpperCase();
                    const matched = COMMBANK_LINKED_ACCOUNTS.find(
                      (a) =>
                        recLegal.includes(a.accountHolder.toUpperCase()) ||
                        completedReceipt.destinationBank.includes(a.bankName) ||
                        completedReceipt.recipientTarget.includes(a.accountNumber)
                    );
                    if (matched) {
                      setSelectedReceiverAccountId(matched.id);
                    } else {
                      setSelectedReceiverAccountId("acc_smart_access");
                    }
                  }
                  setScreen("receiver_accounts");
                }}
                className="w-full py-3.5 px-4 rounded-xl bg-slate-950 hover:bg-slate-900 active:scale-[0.99] text-[#ffcc00] font-black text-xs uppercase tracking-wider flex items-center justify-center gap-2.5 transition-all shadow-md cursor-pointer border border-amber-400/50"
              >
                <Landmark className="w-4 h-4 text-[#ffcc00]" />
                <span>View Receiver's Bank Account & Real-Time Balance</span>
              </button>

              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={handleShareReceipt}
                  className="py-3 px-4 rounded-xl bg-white hover:bg-slate-100 border border-slate-200 text-slate-800 font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-2 transition-colors cursor-pointer shadow-2xs"
                >
                  <Share2 className="w-4 h-4" />
                  <span>Share receipt</span>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    generatePdfReceipt({
                      id: completedReceipt.receiptNumber,
                      date: completedReceipt.timestamp,
                      amount: completedReceipt.amount.toFixed(2),
                      currency: completedReceipt.currency || "AUD",
                      merchant: completedReceipt.recipientLegalName || completedReceipt.recipientName,
                      type: `Osko® Fast PayID (${completedReceipt.destinationBank})`,
                      status: "Delivered & Accepted by Bank",
                      sealText: "OFFICIAL VALOURIAN / CBA OSKO RECEIPT",
                    });
                  }}
                  className="py-3 px-4 rounded-xl bg-white hover:bg-slate-100 border border-slate-200 text-slate-800 font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-2 transition-colors cursor-pointer shadow-2xs"
                >
                  <Download className="w-4 h-4" />
                  <span>Download PDF</span>
                </button>
              </div>

              <button
                type="button"
                onClick={handleMakeAnother}
                className="w-full py-4 rounded-2xl bg-[#ffcc00] hover:bg-amber-400 active:scale-[0.99] text-slate-950 font-black text-sm uppercase tracking-wider transition-all shadow-md cursor-pointer"
              >
                Pay someone else
              </button>
            </div>
          </div>
        )}

        {/* =================================================================== */}
        {/* SCREEN 8: "RECEIVER BANK ACCOUNTS & REAL-TIME STATEMENTS"           */}
        {/* =================================================================== */}
        {screen === "receiver_accounts" && (
          <div className="p-6 flex-1 flex flex-col justify-between space-y-6 animate-in fade-in duration-200">
            <div className="space-y-4">
              {/* Account Selector Horizontal Pills */}
              <div>
                <div className="text-[10px] font-black uppercase tracking-wider text-slate-400 mb-2 flex items-center justify-between">
                  <span>Linked Receiver Accounts ({COMMBANK_LINKED_ACCOUNTS.length})</span>
                  <span className="text-emerald-600 flex items-center gap-1 font-bold">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                    Live Balances
                  </span>
                </div>
                <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-thin">
                  {COMMBANK_LINKED_ACCOUNTS.map((acc) => {
                    const isSelected = acc.id === selectedReceiverAccountId;
                    const bal = liveCbaBalances[acc.id] !== undefined ? liveCbaBalances[acc.id] : acc.defaultBalance;
                    return (
                      <button
                        key={acc.id}
                        type="button"
                        onClick={() => setSelectedReceiverAccountId(acc.id)}
                        className={`shrink-0 px-3 py-2 rounded-xl text-left border transition-all cursor-pointer ${
                          isSelected
                            ? "bg-slate-900 text-white border-amber-400 shadow-sm"
                            : "bg-white text-slate-700 border-slate-200 hover:border-slate-300"
                        }`}
                      >
                        <div className={`text-[11px] font-bold ${isSelected ? "text-[#ffcc00]" : "text-slate-900"}`}>
                          {acc.name}
                        </div>
                        <div className={`text-[10px] font-mono ${isSelected ? "text-slate-300" : "text-slate-500"}`}>
                          ${bal.toLocaleString("en-AU", { minimumFractionDigits: 2 })}
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Active Receiver Account Showcase Card */}
              {(() => {
                const activeAcc = COMMBANK_LINKED_ACCOUNTS.find((a) => a.id === selectedReceiverAccountId) || COMMBANK_LINKED_ACCOUNTS[0];
                const activeBal = liveCbaBalances[activeAcc.id] !== undefined ? liveCbaBalances[activeAcc.id] : activeAcc.defaultBalance;
                
                // Filter transactions relevant to this account
                const accTxs = incomingTransactions.filter((t) => {
                  if (t.accountId === activeAcc.id) return true;
                  const rec = (t.recipient || t.recipientName || "").toLowerCase();
                  if (rec.includes(activeAcc.name.toLowerCase())) return true;
                  if (rec.includes(activeAcc.accountNumber)) return true;
                  if (activeAcc.id === "acc_smart_access" && (rec.includes("smart access") || rec.includes("asim aryal") || rec.includes("cba"))) return true;
                  if (activeAcc.id === "acc_goalsaver" && rec.includes("goalsaver")) return true;
                  if (activeAcc.id === "acc_cdia" && rec.includes("cdia")) return true;
                  if (activeAcc.id === "acc_cba_christopher_scott" && rec.includes("christopher")) return true;
                  return false;
                });

                return (
                  <div className="space-y-4">
                    {/* Official CommBank / Institution Header Card */}
                    <div className="p-5 rounded-2xl bg-gradient-to-br from-slate-900 via-slate-800 to-black text-white shadow-lg border border-slate-700 relative overflow-hidden">
                      <div className="absolute top-0 right-0 w-48 h-48 bg-[#ffcc00]/10 rounded-full blur-2xl pointer-events-none" />
                      
                      <div className="flex items-start justify-between relative z-10">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-xl bg-[#ffcc00] text-slate-950 font-black flex items-center justify-center text-sm shadow-md">
                            CBA
                          </div>
                          <div>
                            <div className="text-[10px] font-black uppercase tracking-widest text-[#ffcc00]">
                              {activeAcc.bankName}
                            </div>
                            <h3 className="text-base font-black text-white">
                              {activeAcc.name}
                            </h3>
                            <div className="text-xs text-slate-400 font-mono mt-0.5">
                              BSB: {activeAcc.bsb} • Acc: {activeAcc.accountNumber}
                            </div>
                          </div>
                        </div>

                        <div className="text-right">
                          <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 text-[9px] font-black uppercase tracking-wider flex items-center gap-1">
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                            Osko® Active
                          </span>
                        </div>
                      </div>

                      <div className="mt-5 pt-4 border-t border-slate-700/80 flex items-end justify-between relative z-10">
                        <div>
                          <div className="text-[10px] font-black uppercase tracking-widest text-slate-400">
                            Available Balance (Real-Time)
                          </div>
                          <div className="text-3xl font-black text-white tracking-tight mt-0.5 font-mono">
                            ${activeBal.toLocaleString("en-AU", { minimumFractionDigits: 2 })}
                            <span className="text-xs text-slate-400 ml-1.5 font-sans font-bold">AUD</span>
                          </div>
                        </div>

                        <div className="text-right">
                          <div className="text-[9px] uppercase tracking-wider text-slate-400 font-bold">
                            Legal Account Holder
                          </div>
                          <div className="text-xs font-black text-[#ffcc00]">
                            {activeAcc.accountHolder}
                          </div>
                        </div>
                      </div>

                      <div className="mt-3 py-1.5 px-3 rounded-lg bg-emerald-950/60 border border-emerald-500/30 text-[10px] text-emerald-300 font-medium flex items-center gap-2">
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                        <span>Connected to New Payments Platform (NPP) directory for immediate, sub-second settlement.</span>
                      </div>
                    </div>

                    {/* Real-Time Statement & Received Transfers Feed */}
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <h4 className="text-xs font-black uppercase tracking-wider text-slate-700 flex items-center gap-1.5">
                          <span>Live Incoming Payments & Statement Feed</span>
                          <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-slate-200 text-slate-700 font-bold">
                            {accTxs.length}
                          </span>
                        </h4>

                        <button
                          type="button"
                          disabled={isReconciling}
                          onClick={async () => {
                            setIsReconciling(true);
                            try {
                              const res = await reconcileAndSettleAllPayments(user?.uid);
                              toast.success(
                                `Synced ${res.reconciledCount} payments! Settle amount: $${res.totalSettledAmount.toFixed(2)} AUD credited.`
                              );
                            } catch (e: any) {
                              toast.error(e.message || "Reconciliation complete.");
                            } finally {
                              setIsReconciling(false);
                            }
                          }}
                          className="text-[10px] font-bold text-blue-600 hover:text-blue-700 flex items-center gap-1 cursor-pointer"
                        >
                          <RefreshCw className={`w-3 h-3 ${isReconciling ? "animate-spin" : ""}`} />
                          <span>{isReconciling ? "Syncing..." : "Reconcile All"}</span>
                        </button>
                      </div>

                      <div className="max-h-56 overflow-y-auto space-y-2 pr-1">
                        {accTxs.length > 0 ? (
                          accTxs.map((tx) => (
                            <div
                              key={tx.id}
                              className="p-3 rounded-xl bg-white border border-slate-200 hover:border-emerald-300 transition-colors shadow-2xs flex items-center justify-between"
                            >
                              <div className="flex items-center gap-3">
                                <div className="w-8 h-8 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center font-bold">
                                  <Plus className="w-4 h-4" />
                                </div>
                                <div>
                                  <div className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
                                    <span>From: {tx.sourceBank || tx.senderName || "Valourian Sovereign Treasury"}</span>
                                    <span className="px-1.5 py-0.2 rounded bg-emerald-100 text-emerald-800 text-[9px] font-black uppercase">
                                      Cleared
                                    </span>
                                  </div>
                                  <div className="text-[10px] text-slate-500 font-mono flex items-center gap-2 mt-0.5">
                                    <span>{tx.settlementRail || "Fast payment (Osko® • NPP 24/7)"}</span>
                                    {tx.receiptNumber && (
                                      <>
                                        <span>•</span>
                                        <span>Ref: {tx.receiptNumber}</span>
                                      </>
                                    )}
                                  </div>
                                </div>
                              </div>

                              <div className="text-right">
                                <div className="text-sm font-black text-emerald-600 font-mono">
                                  +${Math.abs(tx.amount).toLocaleString("en-AU", { minimumFractionDigits: 2 })}
                                </div>
                                <button
                                  type="button"
                                  onClick={() => {
                                    generatePdfReceipt({
                                      id: tx.receiptNumber || tx.id,
                                      date: tx.date || new Date().toISOString(),
                                      amount: Math.abs(tx.amount).toFixed(2),
                                      currency: tx.currency || "AUD",
                                      merchant: `${activeAcc.name} (${activeAcc.accountHolder})`,
                                      type: "Incoming Fast Payment (Osko® / NPP)",
                                      status: "Settled & Credited to Receiver Account",
                                      sealText: "OFFICIAL COMMONWEALTH BANK STATEMENT RECEIPT",
                                    });
                                  }}
                                  className="text-[9px] font-bold text-blue-600 hover:underline flex items-center gap-0.5 ml-auto mt-0.5 cursor-pointer"
                                >
                                  <Download className="w-2.5 h-2.5" />
                                  <span>Statement</span>
                                </button>
                              </div>
                            </div>
                          ))
                        ) : (
                          <div className="p-6 text-center rounded-xl bg-slate-50 border border-slate-200">
                            <Clock className="w-6 h-6 text-slate-400 mx-auto mb-2" />
                            <div className="text-xs font-bold text-slate-700">No incoming transactions yet for this account</div>
                            <p className="text-[10px] text-slate-500 max-w-xs mx-auto mt-1">
                              Send funds using PayID or Funds Transfer to deposit into this account immediately via Osko®.
                            </p>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })()}
            </div>

            {/* Bottom Actions */}
            <div className="pt-2 flex gap-3">
              <button
                type="button"
                onClick={() => setScreen("enter_payid")}
                className="flex-1 py-3.5 px-4 rounded-xl bg-[#ffcc00] hover:bg-amber-400 text-slate-950 font-black text-xs uppercase tracking-wider transition-all shadow-md cursor-pointer flex items-center justify-center gap-2"
              >
                <Plus className="w-4 h-4" />
                <span>Send Fast Payment</span>
              </button>

              <button
                type="button"
                onClick={() => setScreen("pay_someone")}
                className="py-3.5 px-5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold text-xs uppercase tracking-wider transition-colors cursor-pointer"
              >
                Back to Directory
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );

  if (isInline) {
    return content;
  }

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/70 backdrop-blur-md p-4 overflow-y-auto">
        <motion.div
          initial={{ opacity: 0, scale: 0.96, y: 15 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.96, y: 15 }}
          transition={{ duration: 0.2 }}
          className="w-full max-w-xl my-auto"
        >
          {content}
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
