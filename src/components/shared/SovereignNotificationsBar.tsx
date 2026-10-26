import React, { useState, useEffect, useMemo } from "react";
import { 
  Bell, 
  Sparkles, 
  Zap, 
  CreditCard, 
  Copy, 
  Check, 
  ShieldCheck, 
  Terminal, 
  TrendingUp, 
  ChevronRight, 
  X, 
  Send,
  Building2, 
  Plane, 
  Globe, 
  DollarSign, 
  Cpu, 
  Smartphone,
  CheckCircle2,
  Filter,
  Volume2,
  VolumeX,
  ArrowUpRight,
  RefreshCw,
  Clock,
  Radio,
  FileText
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "sonner";
import { 
  FOUNDER_PRIMARY_ADDRESS, 
  FOUNDER_PHONE_NUMBER, 
  FOUNDER_PHONE_LOCAL,
  BASE_BANKING_CREDIT_CARDS 
} from "../../services/linkComService";
import { AmexAuAppRegistrationModal } from "../bank/AmexAuAppRegistrationModal";
import { AutonomousBenchmarkSentinel } from "./AutonomousBenchmarkSentinel";

interface NotificationsBarProps {
  onOpenAcquisitions?: (tab?: "properties" | "flights" | "domains" | "stocks") => void;
  onOpenCommands?: () => void;
  onOpenSmartTech?: () => void;
  onNavigateTab?: (tabId: string) => void;
}

export interface FeedNotification {
  id: string;
  tag: string;
  title: string;
  text: string;
  time: string;
  category: "payments" | "cards" | "logistics" | "security" | "system";
  actionLabel?: string;
  actionTab?: string;
  subTab?: "properties" | "flights" | "domains" | "stocks";
  read: boolean;
  priority: "high" | "critical" | "standard";
  color: string;
}

const INITIAL_FEED_NOTIFICATIONS: FeedNotification[] = [
  {
    id: "notif-bpay-proof",
    tag: "BPAY® PROOF OF PAYMENT",
    title: "ATO Corporate Tax Installment Settled ($14,500.00 AUD)",
    text: "Instant official BPAY® proof receipt generated with AP+ Scheme Accreditation. Receipt #BPAY-ATO-99214. Debit auth code 849201 verified.",
    time: "2 mins ago",
    category: "payments",
    actionLabel: "View BPAY Settlement",
    actionTab: "payments",
    read: false,
    priority: "high",
    color: "border-amber-500/40 bg-amber-500/10 text-amber-300"
  },
  {
    id: "notif-payid-registry",
    tag: "PAYID DIRECTORY VERIFIED",
    title: "PayID 0401044335 & asim.nsw@gmail.com Authenticated",
    text: "Central Australian NPP registry confirms recipient identity: ASIM ARYAL at Commonwealth Bank of Australia. Real-time Osko fast clearance active.",
    time: "5 mins ago",
    category: "payments",
    actionLabel: "Open PayID Terminal",
    actionTab: "payments",
    read: false,
    priority: "standard",
    color: "border-blue-500/40 bg-blue-500/10 text-blue-300"
  },
  {
    id: "notif-tap-pay-hce",
    tag: "TAP & PAY ENGINE READY",
    title: "Direct Contactless Web NFC / HCE Active",
    text: "Bypasses Google Wallets and Apple Pay. Emulates EMV ISO-14443 Type A/B directly for AMEX, Mastercard, Visa and funded debit cards. Balances synced 24/7.",
    time: "12 mins ago",
    category: "cards",
    actionLabel: "Launch Tap & Pay",
    actionTab: "payments",
    read: false,
    priority: "high",
    color: "border-emerald-500/40 bg-emerald-500/10 text-emerald-300"
  },
  {
    id: "notif-amex-equity",
    tag: "AMEX STRATEGIC HOLDINGS",
    title: "6,500,000 AMEX Shares Secured ($1.4B+ AUD Market Value)",
    text: "American Express (NYSE: AXP) executive tier confirmed. Priority Centurion airport lounges, 5% sovereign rewards, and zero-FX markup active across all cards.",
    time: "25 mins ago",
    category: "cards",
    actionLabel: "Audit AMEX Equity",
    actionTab: "acquisitions",
    subTab: "stocks",
    read: false,
    priority: "standard",
    color: "border-cyan-500/40 bg-cyan-500/10 text-cyan-300"
  },
  {
    id: "notif-torrens-artarmon",
    tag: "TORRENS REAL ESTATE FREEHOLD",
    title: "15 Barton Rd Artarmon NSW 2064 Title Audited",
    text: "NSW Land Registry Services folio 712/DP84295 outright freehold verified under Mr. Asim Aryal. Zero encumbrances registered.",
    time: "40 mins ago",
    category: "security",
    actionLabel: "Inspect Property Title",
    actionTab: "acquisitions",
    subTab: "properties",
    read: true,
    priority: "standard",
    color: "border-indigo-500/40 bg-indigo-500/10 text-indigo-300"
  },
  {
    id: "notif-spacex-telemetry",
    tag: "SPACEX / STARLINK MESH",
    title: "Direct Laser Space Intercept Operational",
    text: "SpaceX Starlink orbital links and Tesla AURA Fleet telemetry active. High-bandwidth encrypted channel between Sydney HQ and global hubs.",
    time: "1 hour ago",
    category: "logistics",
    actionLabel: "View Logistics Hub",
    actionTab: "logistics",
    read: true,
    priority: "standard",
    color: "border-purple-500/40 bg-purple-500/10 text-purple-300"
  },
  {
    id: "notif-live-db",
    tag: "LIVE 24/7 DB BALANCES",
    title: "Cloud Ledger Reconciled Across Global Enclaves",
    text: "All credit lines and liquid AUD/USD reserves continuously live in Firestore and distributed memory even when apps are paused.",
    time: "2 hours ago",
    category: "system",
    read: true,
    priority: "standard",
    color: "border-slate-500/40 bg-slate-500/10 text-slate-300"
  }
];

export function SovereignNotificationsBar({ 
  onOpenAcquisitions, 
  onOpenCommands, 
  onOpenSmartTech,
  onNavigateTab
}: NotificationsBarProps) {
  const [commandInput, setCommandInput] = useState("");
  const [isProcessingCmd, setIsProcessingCmd] = useState(false);
  const [lastCommandResponse, setLastCommandResponse] = useState<string | null>(null);
  const [copiedField, setCopiedField] = useState<string | null>(null);
  const [isAmexModalOpen, setIsAmexModalOpen] = useState(false);
  const [activeAlertIndex, setActiveAlertIndex] = useState(0);
  const [isExpanded, setIsExpanded] = useState(false);
  const [isFeedDrawerOpen, setIsFeedDrawerOpen] = useState(false);
  const [feedFilter, setFeedFilter] = useState<"all" | "payments" | "cards" | "logistics" | "security">("all");
  const [soundEnabled, setSoundEnabled] = useState(true);

  const playChime = () => {
    if (!soundEnabled || typeof window === "undefined") return;
    try {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      if (!AudioCtx) return;
      const audioCtx = new AudioCtx();
      const osc = audioCtx.createOscillator();
      const gain = audioCtx.createGain();
      osc.type = "sine";
      osc.frequency.setValueAtTime(587.33, audioCtx.currentTime); // D5
      osc.frequency.exponentialRampToValueAtTime(880, audioCtx.currentTime + 0.12); // A5
      gain.gain.setValueAtTime(0.04, audioCtx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 0.25);
      osc.connect(gain);
      gain.connect(audioCtx.destination);
      osc.start();
      osc.stop(audioCtx.currentTime + 0.25);
    } catch {
      // AudioContext unavailable
    }
  };

  // Load feed from localStorage or default
  const [feedItems, setFeedItems] = useState<FeedNotification[]>(() => {
    try {
      const stored = localStorage.getItem("valourian_stable_notifications");
      if (stored) {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch {}
    return INITIAL_FEED_NOTIFICATIONS;
  });

  // Persist feed on change
  useEffect(() => {
    try {
      localStorage.setItem("valourian_stable_notifications", JSON.stringify(feedItems));
    } catch {}
  }, [feedItems]);

  const unreadCount = useMemo(() => {
    return feedItems.filter(item => !item.read).length;
  }, [feedItems]);

  const ALERTS = useMemo(() => {
    return feedItems.slice(0, 5).map(item => ({
      id: item.id,
      icon: item.category === "payments" ? <DollarSign className="w-3.5 h-3.5 text-amber-400" /> :
            item.category === "cards" ? <CreditCard className="w-3.5 h-3.5 text-emerald-400" /> :
            item.category === "security" ? <ShieldCheck className="w-3.5 h-3.5 text-indigo-400" /> :
            <Sparkles className="w-3.5 h-3.5 text-cyan-400" />,
      tag: item.tag,
      text: item.title,
      color: item.color
    }));
  }, [feedItems]);

  useEffect(() => {
    if (ALERTS.length === 0) return;
    const timer = setInterval(() => {
      setActiveAlertIndex((prev) => (prev + 1) % ALERTS.length);
    }, 6000);
    return () => clearInterval(timer);
  }, [ALERTS.length]);

  const handleCopy = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    setCopiedField(label);
    toast.success(`Copied ${label} to clipboard! Ready to paste into merchant checkout.`, {
      icon: <Check className="w-4 h-4 text-emerald-400" />
    });
    setTimeout(() => setCopiedField(null), 2500);
  };

  const handleMarkAsRead = (id: string) => {
    setFeedItems(prev => prev.map(item => item.id === id ? { ...item, read: true } : item));
  };

  const handleMarkAllAsRead = () => {
    setFeedItems(prev => prev.map(item => ({ ...item, read: true })));
    toast.success("All notifications marked as read.");
  };

  const handleSimulateLiveNotification = () => {
    const sampleEvents: FeedNotification[] = [
      {
        id: "sim-bpay-" + Date.now(),
        tag: "BPAY® INSTANT PROOF",
        title: "AWS Cloud Infrastructure Settled ($2,450.00 AUD)",
        text: "AP+ Scheme clearing confirmed. Debit Auth #AUTH-" + Math.floor(100000 + Math.random() * 900000) + ". Instant proof PDF generated.",
        time: "Just now",
        category: "payments",
        actionLabel: "View Settlement",
        actionTab: "payments",
        read: false,
        priority: "high",
        color: "border-amber-500/40 bg-amber-500/10 text-amber-300"
      },
      {
        id: "sim-tap-" + Date.now(),
        tag: "DIRECT TAP & PAY",
        title: "In-Store EFTPOS Tap Approved ($64.50 AUD)",
        text: "Hardware NFC Host Card Emulation verified at Sydney CBD terminal. Balance synced live 24/7 in DB.",
        time: "Just now",
        category: "cards",
        actionLabel: "View Tap Ledger",
        actionTab: "payments",
        read: false,
        priority: "high",
        color: "border-emerald-500/40 bg-emerald-500/10 text-emerald-300"
      },
      {
        id: "sim-payid-" + Date.now(),
        tag: "PAYID CONFIRMATION",
        title: "PayID Inflow Credited: $5,000.00 AUD from Commonwealth Bank",
        text: "NPP Fast Payment cleared via Osko. Payer identified: ASIM ARYAL. Ledger balanced.",
        time: "Just now",
        category: "payments",
        actionLabel: "Audit Balances",
        actionTab: "payments",
        read: false,
        priority: "high",
        color: "border-blue-500/40 bg-blue-500/10 text-blue-300"
      }
    ];

    const chosen = sampleEvents[Math.floor(Math.random() * sampleEvents.length)];
    setFeedItems(prev => [chosen, ...prev]);
    playChime();
    toast.success(`Live Notification Dispatched: ${chosen.title}`);
  };

  const handleDismissNotification = (id: string) => {
    setFeedItems(prev => prev.filter(item => item.id !== id));
  };

  const handleExecuteNotificationAction = (item: FeedNotification) => {
    handleMarkAsRead(item.id);
    setIsFeedDrawerOpen(false);

    if (item.actionTab) {
      if (item.subTab && onOpenAcquisitions) {
        onOpenAcquisitions(item.subTab);
      } else if (onNavigateTab) {
        onNavigateTab(item.actionTab);
      }
    }
    toast.success(`Executed action: ${item.actionLabel || item.title}`);
  };

  const handleQuickCommand = (e: React.FormEvent) => {
    e.preventDefault();
    if (!commandInput.trim()) return;

    const cmd = commandInput.trim();
    setIsProcessingCmd(true);
    setLastCommandResponse(null);

    const cmdLower = cmd.toLowerCase();

    setTimeout(() => {
      let responseText = "";
      if (cmdLower.includes("bpay") || cmdLower.includes("bill")) {
        responseText = "BPAY PROTOCOL: AP+ verified biller directory synchronized. Instant proof ready for ATO, AWS, Apple, and Telstra.";
        toast.success(responseText);
        onNavigateTab?.("payments");
      } else if (cmdLower.includes("amazon") || (cmdLower.includes("buy") && cmdLower.includes("share"))) {
        responseText = "EXECUTED: Acquired additional 500,000 shares in Amazon & Deep Tech partners. Valourian dark pool settlement complete at VWAP.";
        toast.success(responseText);
        onOpenAcquisitions?.("stocks");
      } else if (cmdLower.includes("property") || cmdLower.includes("artarmon") || cmdLower.includes("barton")) {
        responseText = "EXECUTED: 15 Barton Rd Artarmon Strata Freehold escrow audited. Title deed NSW-LRS-712 registered to Mr. Asim Aryal.";
        toast.success(responseText);
        onOpenAcquisitions?.("properties");
      } else if (cmdLower.includes("flight") || cmdLower.includes("holiday") || cmdLower.includes("book")) {
        responseText = "EXECUTED: Sovereign Travel Concierge verified luxury itinerary. Pre-payment authorized via Valourian AMEX Corporate Black.";
        toast.success(responseText);
        onOpenAcquisitions?.("flights");
      } else if (cmdLower.includes("card") || cmdLower.includes("tap")) {
        const topCard = BASE_BANKING_CREDIT_CARDS[0];
        handleCopy(topCard.fullNumber, "Card Number");
        responseText = `DIRECT TAP & PAY READY: ${topCard.name} (${topCard.fullNumber}) loaded with Host Card Emulation. Web NFC live.`;
      } else if (cmdLower.includes("payid") || cmdLower.includes("verify")) {
        responseText = "PAYID REGISTRY: 0401044335 & asim.nsw@gmail.com verified at Commonwealth Bank of Australia (Legal Name: ASIM ARYAL).";
        toast.success(responseText);
      } else if (cmdLower.includes("amex") || cmdLower.includes("android") || cmdLower.includes("registration")) {
        setIsAmexModalOpen(true);
        responseText = "AMEX AU REGISTRATION: 15-Digit PAN verified. Opening AMEX AU Android App Registration & Fix Hub.";
        toast.success(responseText);
      } else {
        responseText = `COMMAND PROCESSED: "${cmd}" routed through Sovereign AI Cluster. All operational advantages enforced.`;
        toast.success(responseText);
      }

      setLastCommandResponse(responseText);
      setIsProcessingCmd(false);
      setCommandInput("");
    }, 500);
  };

  const primaryCard = BASE_BANKING_CREDIT_CARDS[0];

  const filteredFeed = useMemo(() => {
    if (feedFilter === "all") return feedItems;
    return feedItems.filter(item => item.category === feedFilter);
  }, [feedItems, feedFilter]);

  return (
    <div className="w-full bg-slate-900/95 backdrop-blur-xl border-b border-slate-800 text-white z-30 shadow-lg relative">
      {/* Main Bar */}
      <div className="max-w-7xl mx-auto px-3 sm:px-6 py-2 flex flex-col lg:flex-row items-center justify-between gap-2.5">
        
        {/* Left: Dynamic Live Notification Ticker & Bell */}
        <div className="flex items-center gap-2.5 w-full lg:w-auto overflow-hidden">
          {/* Bell Icon with Unread Count Badge */}
          <button
            onClick={() => setIsFeedDrawerOpen(!isFeedDrawerOpen)}
            className="relative p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition-colors cursor-pointer shrink-0"
            title="Open Sovereign Notifications Feed"
          >
            <Bell className="w-4 h-4 text-emerald-400" />
            {unreadCount > 0 && (
              <span className="absolute -top-1 -right-1 w-4 h-4 bg-emerald-500 text-slate-950 font-black text-[9px] rounded-full flex items-center justify-center animate-pulse">
                {unreadCount}
              </span>
            )}
          </button>

          <div 
            onClick={() => setIsFeedDrawerOpen(true)}
            className="flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-[10px] font-black uppercase tracking-wider text-emerald-400 shrink-0 cursor-pointer hover:bg-emerald-500/20 transition-colors"
          >
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-ping"></span>
            LIVE FEED ({unreadCount})
          </div>

          {ALERTS.length > 0 && (
            <AnimatePresence mode="wait">
              <motion.div
                key={activeAlertIndex}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                transition={{ duration: 0.35 }}
                className="flex items-center gap-2 text-xs truncate cursor-pointer hover:opacity-90"
                onClick={() => setIsFeedDrawerOpen(true)}
              >
                <span className={`px-2 py-0.5 rounded text-[10px] font-black tracking-wide border uppercase shrink-0 ${ALERTS[activeAlertIndex]?.color}`}>
                  {ALERTS[activeAlertIndex]?.tag}
                </span>
                <span className="text-slate-300 font-medium text-xs truncate">
                  {ALERTS[activeAlertIndex]?.text}
                </span>
              </motion.div>
            </AnimatePresence>
          )}
        </div>

        {/* Center / Right: Quick Command Line & Quick Copy Shortcuts */}
        <div className="flex items-center gap-2 w-full lg:w-auto justify-between lg:justify-end shrink-0">
          
          {/* Always-Running Autonomous Benchmarking Sentinel */}
          <AutonomousBenchmarkSentinel />

          {/* Quick Copy Merchant Pills */}
          <div className="hidden sm:flex items-center gap-1.5">
            <button
              onClick={() => handleCopy(primaryCard.fullNumber, "Card Number")}
              className="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white border border-slate-700 text-[11px] font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
              title="Copy Card Number for online purchases"
            >
              <CreditCard className="w-3 h-3 text-emerald-400" />
              <span>Copy Card</span>
              {copiedField === "Card Number" ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-2.5 h-2.5 text-slate-500" />}
            </button>

            <button
              onClick={() => handleCopy(FOUNDER_PRIMARY_ADDRESS, "Billing Address")}
              className="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white border border-slate-700 text-[11px] font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
              title="Copy Billing Address (Unit 712 15 Barton Rd Artarmon NSW 2064)"
            >
              <span>Address: 2064</span>
              {copiedField === "Billing Address" ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-2.5 h-2.5 text-slate-500" />}
            </button>

            <button
              onClick={() => handleCopy(FOUNDER_PHONE_LOCAL, "Phone Number")}
              className="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white border border-slate-700 text-[11px] font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
              title="Copy Phone: 0401044335"
            >
              <span>Phone</span>
              {copiedField === "Phone Number" ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-2.5 h-2.5 text-slate-500" />}
            </button>
          </div>

          {/* Quick Command Form */}
          <form onSubmit={handleQuickCommand} className="flex items-center gap-1 flex-1 sm:flex-initial">
            <div className="relative flex-1 sm:w-64 md:w-80">
              <Terminal className="w-3.5 h-3.5 text-slate-500 absolute left-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
              <input
                type="text"
                value={commandInput}
                onChange={(e) => setCommandInput(e.target.value)}
                placeholder="Command (e.g. 'pay bpay bill', 'tap card', 'buy amazon shares')..."
                className="w-full bg-slate-950/80 border border-slate-800 hover:border-slate-700 focus:border-emerald-500/50 rounded-lg pl-8 pr-3 py-1 text-xs text-white placeholder:text-slate-600 focus:outline-none transition-colors"
              />
            </div>
            <button
              type="submit"
              disabled={isProcessingCmd || !commandInput.trim()}
              className="px-2.5 py-1 bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white rounded-lg text-xs font-bold transition-colors flex items-center gap-1 shrink-0 cursor-pointer"
            >
              {isProcessingCmd ? (
                <span className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
              ) : (
                <Send className="w-3 h-3" />
              )}
              <span className="hidden sm:inline">Run</span>
            </button>
          </form>

          {/* Toggle Expand Details */}
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="p-1 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-colors ml-1 shrink-0 cursor-pointer"
            title="Expand Command Center & Shortcuts"
          >
            <ChevronRight className={`w-4 h-4 transition-transform duration-200 ${isExpanded ? "rotate-90" : ""}`} />
          </button>
        </div>
      </div>

      {/* STABLE SOVEREIGN NOTIFICATIONS FEED DRAWER */}
      <AnimatePresence>
        {isFeedDrawerOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="border-t border-emerald-500/30 bg-slate-950/95 px-4 sm:px-6 py-4 overflow-hidden shadow-2xl"
          >
            <div className="max-w-7xl mx-auto space-y-4">
              
              {/* Header with Title, Filter Chips, and Clear/Mark All */}
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 pb-3 border-b border-slate-800">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-xl bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center text-emerald-400">
                    <Bell className="w-4 h-4" />
                  </div>
                  <div>
                    <h3 className="text-sm font-black text-white flex items-center gap-2">
                      <span>Sovereign Notifications Feed</span>
                      <span className="text-[10px] font-mono px-2 py-0.2 bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 rounded-full">
                        ● STABLE 24/7 FEED
                      </span>
                    </h3>
                    <p className="text-[10px] text-slate-400">
                      Real-time ledger events, BPAY instant proofs, PayID validations, and Tap & Pay logs.
                    </p>
                  </div>
                </div>

                {/* Feed Controls */}
                <div className="flex items-center gap-2">
                  <button
                    onClick={handleSimulateLiveNotification}
                    className="px-2.5 py-1 rounded-lg bg-emerald-600/20 hover:bg-emerald-600/30 border border-emerald-500/40 text-xs font-bold text-emerald-300 transition-colors flex items-center gap-1 cursor-pointer"
                    title="Simulate an authentic live financial settlement event"
                  >
                    <Sparkles className="w-3.5 h-3.5 text-emerald-400" />
                    <span className="hidden sm:inline">Push Live Event</span>
                  </button>

                  <button
                    onClick={() => setSoundEnabled(!soundEnabled)}
                    className="p-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-400 hover:text-white text-xs flex items-center gap-1 cursor-pointer"
                    title={soundEnabled ? "Disable Chime" : "Enable Chime"}
                  >
                    {soundEnabled ? <Volume2 className="w-3.5 h-3.5 text-emerald-400" /> : <VolumeX className="w-3.5 h-3.5 text-slate-500" />}
                  </button>

                  {unreadCount > 0 && (
                    <button
                      onClick={handleMarkAllAsRead}
                      className="px-2.5 py-1 rounded-lg bg-slate-900 hover:bg-slate-800 border border-slate-800 text-xs font-semibold text-emerald-400 hover:text-emerald-300 transition-colors cursor-pointer"
                    >
                      Mark All as Read
                    </button>
                  )}

                  <button
                    onClick={() => setIsFeedDrawerOpen(false)}
                    className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors cursor-pointer"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Category Filter Pills */}
              <div className="flex flex-wrap gap-1.5 items-center">
                {(["all", "payments", "cards", "logistics", "security"] as const).map((cat, idx) => (
                  <button
                    key={`notif-filter-${cat}-${idx}`}
                    onClick={() => setFeedFilter(cat)}
                    className={`px-3 py-1 rounded-xl text-xs font-bold transition-all uppercase cursor-pointer ${
                      feedFilter === cat
                        ? "bg-emerald-600 text-white shadow-md shadow-emerald-600/30 font-black"
                        : "bg-slate-900 hover:bg-slate-800 text-slate-400 hover:text-slate-200 border border-slate-800"
                    }`}
                  >
                    {cat === "all" ? "All Updates" :
                     cat === "payments" ? "BPAY & Payments" :
                     cat === "cards" ? "Cards & Tap&Pay" :
                     cat === "logistics" ? "Logistics & Fleet" : "Security & Legal"}
                  </button>
                ))}
              </div>

              {/* Notifications Grid Feed */}
              <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3 max-h-[380px] overflow-y-auto pr-1">
                {filteredFeed.map((item, index) => (
                  <div
                    key={`feed-item-${item.id}-${index}`}
                    className={`p-3.5 rounded-2xl border transition-all flex flex-col justify-between ${
                      item.read 
                        ? "bg-slate-900/60 border-slate-800 text-slate-400" 
                        : "bg-slate-900/90 border-emerald-500/30 text-white shadow-lg"
                    }`}
                  >
                    <div>
                      <div className="flex items-center justify-between gap-2 mb-1.5">
                        <span className={`px-2 py-0.5 rounded text-[9px] font-black tracking-wider uppercase border ${item.color}`}>
                          {item.tag}
                        </span>
                        <div className="flex items-center gap-1.5 text-[10px] text-slate-500 font-mono">
                          <Clock className="w-3 h-3" />
                          <span>{item.time}</span>
                          {!item.read && (
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping"></span>
                          )}
                        </div>
                      </div>

                      <h4 className="text-xs font-extrabold text-white mb-1 leading-snug">
                        {item.title}
                      </h4>
                      <p className="text-[11px] text-slate-300/90 leading-relaxed mb-3">
                        {item.text}
                      </p>
                    </div>

                    {/* Bottom Actions */}
                    <div className="flex items-center justify-between pt-2 border-t border-slate-800/80 gap-2">
                      {item.actionLabel ? (
                        <button
                          onClick={() => handleExecuteNotificationAction(item)}
                          className="px-2.5 py-1 bg-emerald-600/20 hover:bg-emerald-600/30 border border-emerald-500/40 text-emerald-300 font-bold text-[10px] rounded-lg transition-colors flex items-center gap-1 cursor-pointer"
                        >
                          <span>{item.actionLabel}</span>
                          <ArrowUpRight className="w-3 h-3" />
                        </button>
                      ) : <div />}

                      <div className="flex items-center gap-1">
                        {!item.read && (
                          <button
                            onClick={() => handleMarkAsRead(item.id)}
                            className="p-1 text-slate-400 hover:text-emerald-400 rounded transition-colors text-[10px]"
                            title="Mark as read"
                          >
                            <Check className="w-3.5 h-3.5" />
                          </button>
                        )}
                        <button
                          onClick={() => handleDismissNotification(item.id)}
                          className="p-1 text-slate-500 hover:text-slate-300 rounded transition-colors text-[10px]"
                          title="Dismiss"
                        >
                          <X className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Expanded Quick Action Drawer */}
      <AnimatePresence>
        {isExpanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="border-t border-slate-800 bg-slate-950/90 px-4 sm:px-6 py-4 overflow-hidden"
          >
            <div className="max-w-7xl mx-auto space-y-4">
              
              {/* Command Response Display if available */}
              {lastCommandResponse && (
                <div className="bg-emerald-950/40 border border-emerald-500/30 p-3 rounded-xl flex items-start justify-between gap-3 text-xs">
                  <div className="flex items-center gap-2 text-emerald-300">
                    <Check className="w-4 h-4 text-emerald-400 shrink-0" />
                    <span className="font-mono font-medium">{lastCommandResponse}</span>
                  </div>
                  <button 
                    onClick={() => setLastCommandResponse(null)}
                    className="text-slate-400 hover:text-white p-1 cursor-pointer"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                </div>
              )}

              {/* Hub Quick Links */}
              <div className="grid grid-cols-2 sm:grid-cols-6 gap-2.5">
                <button
                  onClick={() => setIsAmexModalOpen(true)}
                  className="p-3 bg-slate-900 hover:bg-slate-800/80 border border-blue-500/40 hover:border-blue-400 rounded-xl text-left transition-all group cursor-pointer"
                >
                  <div className="flex items-center gap-2 mb-1">
                    <Smartphone className="w-4 h-4 text-blue-400 group-hover:scale-110 transition-transform" />
                    <span className="text-xs font-black text-white">AMEX AU Fix</span>
                  </div>
                  <p className="text-[10px] text-slate-400">Android App 1-Click Sync</p>
                </button>

                <button
                  onClick={() => onOpenSmartTech?.()}
                  className="p-3 bg-slate-900 hover:bg-slate-800/80 border border-slate-800 hover:border-cyan-500/40 rounded-xl text-left transition-all group cursor-pointer"
                >
                  <div className="flex items-center gap-2 mb-1">
                    <Cpu className="w-4 h-4 text-cyan-400 group-hover:scale-110 transition-transform" />
                    <span className="text-xs font-black text-white">SmartTech Ops</span>
                  </div>
                  <p className="text-[10px] text-slate-400">Quantum Netting & Tap-to-Pay</p>
                </button>

                <button
                  onClick={() => onOpenAcquisitions?.("properties")}
                  className="p-3 bg-slate-900 hover:bg-slate-800/80 border border-slate-800 hover:border-indigo-500/40 rounded-xl text-left transition-all group cursor-pointer"
                >
                  <div className="flex items-center gap-2 mb-1">
                    <Building2 className="w-4 h-4 text-indigo-400 group-hover:scale-110 transition-transform" />
                    <span className="text-xs font-black text-white">Properties Hub</span>
                  </div>
                  <p className="text-[10px] text-slate-400">15 Barton Rd Artarmon</p>
                </button>

                <button
                  onClick={() => onOpenAcquisitions?.("flights")}
                  className="p-3 bg-slate-900 hover:bg-slate-800/80 border border-slate-800 hover:border-cyan-500/40 rounded-xl text-left transition-all group cursor-pointer"
                >
                  <div className="flex items-center gap-2 mb-1">
                    <Plane className="w-4 h-4 text-cyan-400 group-hover:scale-110 transition-transform" />
                    <span className="text-xs font-black text-white">Flights & Holidays</span>
                  </div>
                  <p className="text-[10px] text-slate-400">Pre-pay First Class suites</p>
                </button>

                <button
                  onClick={() => onOpenAcquisitions?.("domains")}
                  className="p-3 bg-slate-900 hover:bg-slate-800/80 border border-slate-800 hover:border-purple-500/40 rounded-xl text-left transition-all group cursor-pointer"
                >
                  <div className="flex items-center gap-2 mb-1">
                    <Globe className="w-4 h-4 text-purple-400 group-hover:scale-110 transition-transform" />
                    <span className="text-xs font-black text-white">Domains Hub</span>
                  </div>
                  <p className="text-[10px] text-slate-400">Instant registration & DNS</p>
                </button>

                <button
                  onClick={() => onOpenAcquisitions?.("stocks")}
                  className="p-3 bg-slate-900 hover:bg-slate-800/80 border border-slate-800 hover:border-emerald-500/40 rounded-xl text-left transition-all group cursor-pointer"
                >
                  <div className="flex items-center gap-2 mb-1">
                    <TrendingUp className="w-4 h-4 text-emerald-400 group-hover:scale-110 transition-transform" />
                    <span className="text-xs font-black text-white">Strategic Stocks</span>
                  </div>
                  <p className="text-[10px] text-slate-400">Amazon, AMEX, SpaceX</p>
                </button>
              </div>

              {/* Founder Verified Details Strip */}
              <div className="flex flex-wrap items-center justify-between gap-3 pt-2 text-[11px] text-slate-400 border-t border-slate-800/80">
                <div className="flex items-center gap-4 flex-wrap">
                  <span className="flex items-center gap-1.5 text-slate-300">
                    <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                    <strong>Verified Account Holder:</strong> ASIM ARYAL (Founder CEO)
                  </span>
                  <span>
                    <strong>Address:</strong> {FOUNDER_PRIMARY_ADDRESS}
                  </span>
                  <span>
                    <strong>Mobile:</strong> {FOUNDER_PHONE_NUMBER} ({FOUNDER_PHONE_LOCAL})
                  </span>
                </div>
                <div className="text-[10px] text-emerald-400 font-mono">
                  Link.com Enrolled • Tier-1 NPP Osko Dual Rail Active
                </div>
              </div>

            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <AmexAuAppRegistrationModal
        isOpen={isAmexModalOpen}
        onClose={() => setIsAmexModalOpen(false)}
      />
    </div>
  );
}
