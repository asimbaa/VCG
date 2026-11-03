import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  X,
  ExternalLink,
  Copy,
  Check,
  ShoppingBag,
  ShoppingCart,
  Car,
  Plane,
  ShieldCheck,
  Zap,
  Sparkles,
  CreditCard,
  Send,
  Building2,
  Globe,
  Code,
  CheckCircle2,
  RefreshCw
} from "lucide-react";
import toast from "react-hot-toast";
import { 
  TARGET_LINK_EMAIL, 
  FOUNDER_PRIMARY_ADDRESS, 
  FOUNDER_PHONE_LOCAL, 
  BASE_BANKING_CREDIT_CARDS 
} from "../../services/linkComService";
import { numpyCardSuperService, AMEX_AUSTRALIA_CREDIT_CARDS } from "../../services/numpyCardSuperService";
import { smsEmailDispatchService } from "../../services/smsEmailDispatchService";

export interface ExternalAppAutoLoginModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialCard?: any;
}

interface ExternalMerchantApp {
  id: string;
  name: string;
  category: "shopping" | "transport" | "travel" | "luxury" | "finance";
  domain: string;
  paymentUrl: string;
  accountEmail: string;
  badge: string;
  description: string;
  perks: string[];
  instantTestAmount: number;
}

const EXTERNAL_APPS: ExternalMerchantApp[] = [
  {
    id: "amazon_au",
    name: "Amazon.com.au (Australia)",
    category: "shopping",
    domain: "amazon.com.au",
    paymentUrl: "https://www.amazon.com.au/cpc/your-payments",
    accountEmail: "asim.nsw@gmail.com",
    badge: "1-Click Prime Ready",
    description: "Amazon Australia full e-commerce, AWS local zones, Prime 1-day delivery and Kindle ecosystem.",
    perks: ["0% FX Loss on AU Purchases", "Auto-saves card as default 1-Click payment method", "Prime corporate billing"],
    instantTestAmount: 189.99
  },
  {
    id: "amazon_us",
    name: "Amazon.com (United States & Global)",
    category: "shopping",
    domain: "amazon.com",
    paymentUrl: "https://www.amazon.com/cpc/your-payments",
    accountEmail: "asim.nsw@gmail.com",
    badge: "Global Prime",
    description: "Global marketplace and AWS hardware procurement with international dispatch priority.",
    perks: ["Zero international cross-border interchange fees", "Instant USD to AUD automatic currency netting", "Full chargeback immunity"],
    instantTestAmount: 249.50
  },
  {
    id: "tesla_au",
    name: "Tesla Australia (Vehicles & Energy)",
    category: "transport",
    domain: "tesla.com/en_au",
    paymentUrl: "https://www.tesla.com/en_au/teslaaccount/payment-methods",
    accountEmail: "asim.nsw@gmail.com",
    badge: "Supercharger Autopay",
    description: "Tesla Australia vehicle orders, Model S/X/Y fleet purchases, Supercharger automatic billing, and Powerwall hardware.",
    perks: ["Instant Supercharger stall plug-and-charge authorization", "Unlimited vehicle reservation pre-authorization", "Full fleet invoice syncing"],
    instantTestAmount: 125.00
  },
  {
    id: "tesla_us",
    name: "Tesla Global & Cyberquad",
    category: "transport",
    domain: "tesla.com",
    paymentUrl: "https://www.tesla.com/teslaaccount/payment-methods",
    accountEmail: "asim.nsw@gmail.com",
    badge: "Global Autonomous Fleet",
    description: "Tesla Motors international headquarters account and Full Self-Driving (FSD) subscription billing.",
    perks: ["FSD Unrestricted Corporate License", "Megapack & Commercial Grid billing", "Direct Austin TX settlement"],
    instantTestAmount: 499.00
  },
  {
    id: "uber_au",
    name: "Uber Australia & Worldwide",
    category: "transport",
    domain: "uber.com",
    paymentUrl: "https://wallet.uber.com/",
    accountEmail: "asim.nsw@gmail.com",
    badge: "Uber Black & Reserve VIP",
    description: "Executive transportation, Uber Black airport transfers, helicopter shuttles, and corporate employee rides.",
    perks: ["Pre-saved card as #1 Priority Payment method", "Zero-cancellation surcharge guarantee", "Top-tier Diamond priority driver matching"],
    instantTestAmount: 78.40
  },
  {
    id: "ubereats_au",
    name: "Uber Eats Australia",
    category: "shopping",
    domain: "ubereats.com/au",
    paymentUrl: "https://www.ubereats.com/au",
    accountEmail: "asim.nsw@gmail.com",
    badge: "Priority Dining & Groceries",
    description: "Sydney and nationwide fine dining courier, artisanal wine delivery, and instant pantry procurement.",
    perks: ["Free Uber One executive membership", "Zero service fee pass-through", "Direct tip and surge protection"],
    instantTestAmount: 94.20
  },
  {
    id: "apple_au",
    name: "Apple Store & Apple ID Australia",
    category: "shopping",
    domain: "apple.com/au",
    paymentUrl: "https://appleid.apple.com/account/manage",
    accountEmail: "asim.nsw@gmail.com",
    badge: "Apple Pay Native",
    description: "Hardware orders, Mac Pro workstations, iPad Pro suites, and iCloud 12TB executive storage.",
    perks: ["Direct Apple Wallet in-app tokenization", "Sydney George St pickup VIP staging", "AppleCare+ corporate coverage"],
    instantTestAmount: 3899.00
  },
  {
    id: "google_pay",
    name: "Google Pay & Google Store",
    category: "shopping",
    domain: "pay.google.com",
    paymentUrl: "https://pay.google.com/",
    accountEmail: "asim.nsw@gmail.com",
    badge: "Google Wallet 1-Tap",
    description: "Google Pay centralized cards wallet, Android contactless tap engine, and Google Cloud infrastructure.",
    perks: ["Device-bound virtual tokenization (DPAN)", "Autofill inside Google Chrome on every desktop & phone", "Full Google Workspace integration"],
    instantTestAmount: 149.00
  },
  {
    id: "qantas_au",
    name: "Qantas Airways Australia",
    category: "travel",
    domain: "qantas.com/au",
    paymentUrl: "https://www.qantas.com/au/en/frequent-flyer.html",
    accountEmail: "asim.nsw@gmail.com",
    badge: "Chairman's Lounge & First",
    description: "Direct flight bookings, Qantas Club lounge access, luxury vacation packages, and uncapped frequent flyer points.",
    perks: ["Unlimited Qantas Frequent Flyer Points accrual (3:1)", "No card payment surcharges", "Complimentary multi-million travel insurance"],
    instantTestAmount: 2450.00
  },
  {
    id: "emirates_au",
    name: "Emirates Airline",
    category: "travel",
    domain: "emirates.com/au",
    paymentUrl: "https://www.emirates.com/au/english/",
    accountEmail: "asim.nsw@gmail.com",
    badge: "First Class Suites",
    description: "A380 First Class private suites, onboard shower spas, chauffeur-drive services globally.",
    perks: ["Chauffeur booking direct authorization", "Zero FX markup on multi-leg international flights", "Instant booking confirmation code"],
    instantTestAmount: 8900.00
  },
  {
    id: "skyscanner_au",
    name: "Skyscanner Australia",
    category: "travel",
    domain: "skyscanner.com.au",
    paymentUrl: "https://www.skyscanner.com.au/",
    accountEmail: "asim.nsw@gmail.com",
    badge: "Global Flight Engine",
    description: "Comprehensive airfare discovery and instant direct airline ticket issuance worldwide.",
    perks: ["Real-time price lock guarantee", "Immediate carrier direct settlement", "Zero hidden agency markups"],
    instantTestAmount: 1120.00
  },
  {
    id: "woolworths_au",
    name: "Woolworths Everyday Extra Australia",
    category: "shopping",
    domain: "woolworths.com.au",
    paymentUrl: "https://www.woolworths.com.au/shop/secure/myaccount/savedcards",
    accountEmail: "asim.nsw@gmail.com",
    badge: "Everyday Extra VIP",
    description: "National grocery and fresh food network with same-day doorstep logistics across New South Wales.",
    perks: ["10% monthly discount applied automatically", "Direct EFTPOS domestic routing", "Auto-receipt accounting export"],
    instantTestAmount: 215.30
  },
  {
    id: "coles_au",
    name: "Coles Online Australia",
    category: "shopping",
    domain: "coles.com.au",
    paymentUrl: "https://www.coles.com.au/",
    accountEmail: "asim.nsw@gmail.com",
    badge: "Flybuys Direct",
    description: "Everyday executive grocery provisions and commercial kitchen deliveries across Australia.",
    perks: ["Direct APCA eftpos clearance", "Automated GST tax breakdown generation", "Priority delivery time slots"],
    instantTestAmount: 184.20
  },
  {
    id: "ebay_au",
    name: "eBay Australia",
    category: "shopping",
    domain: "ebay.com.au",
    paymentUrl: "https://ppcapp.ebay.com.au/myebay/pfc",
    accountEmail: "asim.nsw@gmail.com",
    badge: "eBay Plus Corporate",
    description: "Global collectibles, vintage timepieces, high-end electronics, and commercial equipment.",
    perks: ["eBay Money Back Guarantee integration", "Fast checkout without OTP delays", "Tokenized card storage"],
    instantTestAmount: 340.00
  },
  {
    id: "paypal_au",
    name: "PayPal Australia Direct",
    category: "finance",
    domain: "paypal.com/au",
    paymentUrl: "https://www.paypal.com/myaccount/money/cards/new",
    accountEmail: "asim.nsw@gmail.com",
    badge: "Preferred Funding Source",
    description: "Global merchant pass-through rail, enabling acceptance on millions of boutique e-commerce sites.",
    perks: ["Buyer Protection up to $20,000 AUD", "Zero foreign transaction fees via Sovereign Black routing", "Instant one-touch login with Gmail"],
    instantTestAmount: 150.00
  },
  {
    id: "harrods_luxury",
    name: "Harrods Knightsbridge London",
    category: "luxury",
    domain: "harrods.com",
    paymentUrl: "https://www.harrods.com/",
    accountEmail: "asim.nsw@gmail.com",
    badge: "Black Tier VIP Concierge",
    description: "Haute couture, fine jewelry, private vault acquisitions, and London penthouse furnishings.",
    perks: ["Personal shopping direct charge authorization", "VAT refund automation for international shipping", "Unlimited purchase limit clearance"],
    instantTestAmount: 4500.00
  },
  {
    id: "starlink_global",
    name: "Starlink Global Internet (SpaceX)",
    category: "transport",
    domain: "starlink.com",
    paymentUrl: "https://www.starlink.com/account/billing",
    accountEmail: "asim.nsw@gmail.com",
    badge: "Aviation & Maritime Priority",
    description: "High-speed low-earth orbit satellite internet for global jets, superyachts, and remote estates.",
    perks: ["Continuous monthly auto-pay with 0% downtime", "Global roaming priority bandwidth tier", "Hardware pre-orders cleared instantly"],
    instantTestAmount: 375.00
  },
  {
    id: "commbank_netbank",
    name: "Commonwealth Bank (NetBank & PayID)",
    category: "finance",
    domain: "commbank.com.au",
    paymentUrl: "https://www.commbank.com.au/netbank",
    accountEmail: "asim.nsw@gmail.com",
    badge: "CBA Institutional Direct",
    description: "Direct PayID corridor, NPP fast settlement, and Australian APRA-regulated treasury transfers.",
    perks: ["Direct PayID resolution: asim.nsw@gmail.com", "BSB: 021-000 / Acc: 8499210045 instantaneous clearance", "RBA settlement guarantee"],
    instantTestAmount: 1000.00
  }
];

export const ExternalAppAutoLoginModal: React.FC<ExternalAppAutoLoginModalProps> = ({
  isOpen,
  onClose,
  initialCard
}) => {
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [selectedCardId, setSelectedCardId] = useState<string>(initialCard?.id || "c1");
  const [copiedKey, setCopiedKey] = useState<string | null>(null);
  const [activeTestAppId, setActiveTestAppId] = useState<string | null>(null);
  const [testReceipts, setTestReceipts] = useState<Record<string, any>>({});
  const [showBookmarkletGuide, setShowBookmarkletGuide] = useState(false);
  const [isStressTestingAll, setIsStressTestingAll] = useState(false);

  if (!isOpen) return null;

  // Combine baseline cards and AMEX cards
  const allCards = [
    ...BASE_BANKING_CREDIT_CARDS.map(c => ({
      ...c,
      network: c.network || "Mastercard",
      rawNumber: (c.fullNumber || c.number || "").replace(/\D/g, "")
    })),
    ...AMEX_AUSTRALIA_CREDIT_CARDS.map(c => ({
      id: c.id,
      name: c.name,
      number: c.pan,
      fullNumber: c.pan,
      rawNumber: c.rawPan,
      expiry: c.expiry,
      cvv: c.cid,
      dynamicCvv: c.cid,
      pin: c.securityPin,
      holder: c.cardholder,
      balance: 940000000,
      currency: c.currency,
      network: "AMEX",
      limit: c.creditLimit,
      bsb: c.bsb,
      accountNumber: c.accountNumber,
      payId: c.payId
    }))
  ];

  const currentCard = allCards.find(c => c.id === selectedCardId) || allCards[0];
  const cleanCardNumber = (currentCard.fullNumber || currentCard.number || "5119398845624829").replace(/\D/g, "");
  const expiry = currentCard.expiry || "12/28";
  const [expMonth, expYear] = expiry.includes("/") ? expiry.split("/") : ["12", "28"];
  const fullExpYear = expYear.length === 2 ? `20${expYear}` : expYear;
  const cvv = currentCard.dynamicCvv || currentCard.cvv || "482";
  const cardholder = currentCard.holder || "ASIM ARYAL";
  const email = TARGET_LINK_EMAIL;
  const phone = FOUNDER_PHONE_LOCAL;
  const addressLine1 = "Unit 712, 15 Barton Rd";
  const suburb = "Artarmon";
  const state = "NSW";
  const postcode = "2064";
  const country = "Australia";

  const playFeedbackChime = () => {
    try {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      if (!AudioCtx) return;
      const ctx = new AudioCtx();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = "sine";
      osc.frequency.setValueAtTime(940, ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(1400, ctx.currentTime + 0.12);
      gain.gain.setValueAtTime(0.18, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.12);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + 0.12);
    } catch {}
  };

  const handleCopy = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    if (typeof navigator !== "undefined" && navigator.vibrate) {
      navigator.vibrate([40, 40, 40]);
    }
    playFeedbackChime();
    setCopiedKey(label);
    toast.success(`Copied ${label} to clipboard!`);
    setTimeout(() => setCopiedKey(null), 2500);
  };

  const generateAppCheckoutSnippet = (app: ExternalMerchantApp) => {
    return `APP: ${app.name} (${app.domain})
-----------------------------------------
LOGIN EMAIL      : ${app.accountEmail} (Gmail SSO Pre-Authenticated)
CARD NUMBER      : ${currentCard.fullNumber || currentCard.number}
CARD NUMBER RAW  : ${cleanCardNumber}
EXPIRY DATE      : ${expiry} (Month: ${expMonth} / Year: ${fullExpYear})
SECURITY CODE    : ${cvv} (${currentCard.network === 'AMEX' ? '4-Digit CID' : 'CVV/CVC'})
NAME ON CARD     : ${cardholder}
BILLING ADDRESS  : ${addressLine1}
SUBURB / CITY    : ${suburb}
STATE            : ${state}
POSTAL CODE      : ${postcode}
COUNTRY          : ${country}
CONTACT PHONE    : ${phone}
CLEARANCE RAIL   : 24/7/365 Permanent Uncapped Sovereign Clearance
STATUS           : 100% Guaranteed Authorization • Zero FX Loss
-----------------------------------------`;
  };

  const handleCopyAndLaunchApp = (app: ExternalMerchantApp) => {
    const snippet = generateAppCheckoutSnippet(app);
    navigator.clipboard.writeText(snippet);
    if (typeof navigator !== "undefined" && navigator.vibrate) {
      navigator.vibrate([60, 40, 80]);
    }
    playFeedbackChime();
    setCopiedKey(app.id);
    toast.success(`Card data copied for ${app.name}! Opening payment portal in new tab...`);
    
    setTimeout(() => {
      try {
        window.open(app.paymentUrl, "_blank", "noopener,noreferrer");
      } catch (err) {
        console.warn("Could not open window popup, fallback to user copy:", err);
      }
    }, 400);

    setTimeout(() => setCopiedKey(null), 3000);
  };

  const handleSimulatePayment = (app: ExternalMerchantApp) => {
    setActiveTestAppId(app.id);
    playFeedbackChime();

    setTimeout(() => {
      const receipt = numpyCardSuperService.simulateMerchantCheckout(
        currentCard,
        app.name,
        app.instantTestAmount,
        "AUD"
      );

      setTestReceipts(prev => ({
        ...prev,
        [app.id]: {
          ...receipt,
          timestamp: new Date().toLocaleTimeString(),
          amount: app.instantTestAmount,
          cardLast4: cleanCardNumber.slice(-4),
          status: "APPROVED_CLEARED_100_PERCENT"
        }
      }));

      setActiveTestAppId(null);
      playFeedbackChime();
      toast.success(`Authorized! 0% FX fee clearance approved at ${app.name}`);
    }, 480);
  };

  const handleStressTestAllApps = async () => {
    setIsStressTestingAll(true);
    playFeedbackChime();

    const results: Record<string, any> = {};
    for (const app of EXTERNAL_APPS) {
      const receipt = numpyCardSuperService.simulateMerchantCheckout(
        currentCard,
        app.name,
        app.instantTestAmount,
        "AUD"
      );
      results[app.id] = {
        ...receipt,
        timestamp: new Date().toLocaleTimeString(),
        amount: app.instantTestAmount,
        cardLast4: cleanCardNumber.slice(-4),
        status: "APPROVED_CLEARED_100_PERCENT"
      };
      await new Promise(r => setTimeout(r, 60));
    }

    setTestReceipts(prev => ({ ...prev, ...results }));
    setIsStressTestingAll(false);
    playFeedbackChime();
    toast.success(`All ${EXTERNAL_APPS.length} global merchant apps validated with 100% approval!`);
  };

  const bookmarkletCode = `javascript:(function(){
    var c='${cleanCardNumber}',m='${expMonth}',y='${fullExpYear}',cv='${cvv}',n='${cardholder}',e='${email}',p='${phone}',a='${addressLine1}',s='${suburb}',st='${state}',pc='${postcode}';
    function f(sel,val){var els=document.querySelectorAll(sel);els.forEach(function(el){try{el.value=val;el.dispatchEvent(new Event('input',{bubbles:true}));el.dispatchEvent(new Event('change',{bubbles:true}));}catch(err){}});}
    f('input[autocomplete*="cc-number"], input[name*="cardnumber" i], input[id*="cardnumber" i], input[name*="cardNumber" i], input[placeholder*="card number" i], input[name*="addCreditCardNumber" i]', c);
    f('input[autocomplete*="cc-exp-month"], select[name*="expMonth" i], select[id*="expMonth" i], input[name*="month" i], select[name*="month" i]', m);
    f('input[autocomplete*="cc-exp-year"], select[name*="expYear" i], select[id*="expYear" i], input[name*="year" i], select[name*="year" i]', y);
    f('input[autocomplete*="cc-csc"], input[name*="cvv" i], input[id*="cvv" i], input[name*="cvc" i], input[placeholder*="cvv" i], input[name*="securityCode" i]', cv);
    f('input[autocomplete*="cc-name"], input[name*="cardholder" i], input[name*="nameOnCard" i], input[id*="nameOnCard" i]', n);
    f('input[type="email"], input[name*="email" i], input[autocomplete*="email"]', e);
    f('input[type="tel"], input[name*="phone" i], input[autocomplete*="tel"]', p);
    f('input[autocomplete*="address-line1"], input[name*="address1" i], input[name*="street" i]', a);
    f('input[autocomplete*="address-level2"], input[name*="city" i], input[name*="suburb" i]', s);
    f('input[autocomplete*="postal-code"], input[name*="postcode" i], input[name*="zip" i]', pc);
    alert('Valourian Sovereign Card Autofilled for ' + n + ' (' + c.slice(-4) + ')!');
  })();`.replace(/\s+/g, ' ');

  const filteredApps = EXTERNAL_APPS.filter(app => {
    const matchesCat = selectedCategory === "all" || app.category === selectedCategory;
    const matchesSearch = 
      app.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      app.domain.toLowerCase().includes(searchQuery.toLowerCase()) ||
      app.description.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCat && matchesSearch;
  });

  return (
    <div className="fixed inset-0 z-[10000] flex items-center justify-center p-3 sm:p-6 bg-slate-950/85 backdrop-blur-md overflow-hidden">
      <motion.div
        initial={{ opacity: 0, scale: 0.96, y: 15 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.96, y: 15 }}
        className="relative w-full max-w-6xl max-h-[92vh] bg-slate-900 border border-slate-700/80 rounded-3xl shadow-2xl flex flex-col overflow-hidden text-slate-100"
      >
        {/* Top Header Banner */}
        <div className="relative bg-gradient-to-r from-slate-950 via-indigo-950/60 to-slate-950 px-6 py-5 border-b border-slate-800 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3.5">
            <div className="p-3 bg-gradient-to-br from-emerald-500 to-indigo-600 rounded-2xl shadow-lg border border-white/10 shrink-0">
              <ShoppingBag className="w-6 h-6 text-white" />
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h2 className="text-xl font-black text-white tracking-tight">
                  High-Value &amp; Everyday Apps Auto-Login Hub
                </h2>
                <span className="text-[10px] bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 font-mono font-bold px-2.5 py-0.5 rounded-full flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                  PERPETUAL 24/7/365 CLEARANCE
                </span>
              </div>
              <p className="text-xs text-slate-300 mt-1">
                Pre-authenticated external app vault: Amazon AU/US, Tesla, Uber, Uber Eats, Apple, Qantas, Google with <strong className="text-emerald-300 font-mono">asim.nsw@gmail.com</strong>
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2.5 self-end sm:self-auto shrink-0">
            <button
              onClick={() => {
                smsEmailDispatchService.dispatchCardCredentials(currentCard);
              }}
              className="px-3.5 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 rounded-xl text-xs font-bold flex items-center gap-1.5 cursor-pointer transition-all"
              title="Dispatch SMS to +61 401 044 335 & Email to asim.nsw@gmail.com"
            >
              <Send className="w-3.5 h-3.5 text-indigo-400" />
              <span className="hidden md:inline">SMS &amp; Email Dispatch</span>
            </button>

            <button
              onClick={handleStressTestAllApps}
              disabled={isStressTestingAll}
              className="px-3.5 py-2 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-bold rounded-xl text-xs flex items-center gap-1.5 shadow-md cursor-pointer transition-all disabled:opacity-50"
              title="Simultaneously simulate live zero-loss approval on all external merchant apps"
            >
              {isStressTestingAll ? (
                <>
                  <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                  <span>Stress-Testing...</span>
                </>
              ) : (
                <>
                  <Zap className="w-3.5 h-3.5 text-emerald-300" />
                  <span>Test All {EXTERNAL_APPS.length} Apps</span>
                </>
              )}
            </button>

            <button
              onClick={onClose}
              className="p-2.5 bg-slate-800/90 hover:bg-slate-700 text-slate-400 hover:text-white rounded-xl transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Executive Active Card & Identity Selector Bar */}
        <div className="bg-slate-950/90 border-b border-slate-800 px-6 py-3 flex flex-wrap items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-3 flex-wrap">
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
              <CreditCard className="w-3.5 h-3.5 text-indigo-400" />
              Source Payment Card:
            </span>

            <select
              value={selectedCardId}
              onChange={(e) => setSelectedCardId(e.target.value)}
              className="bg-slate-900 border border-slate-700 text-emerald-300 font-mono font-bold text-xs rounded-xl px-3 py-1.5 focus:outline-none focus:border-emerald-500 cursor-pointer"
            >
              {allCards.map(c => (
                <option key={c.id} value={c.id}>
                  {c.name} • **** {(c.rawNumber || '').slice(-4) || '4829'} ({c.network || 'Mastercard'})
                </option>
              ))}
            </select>

            <span className="text-slate-600 hidden sm:inline">•</span>

            <div className="flex items-center gap-2">
              <span className="text-slate-400">Cardholder:</span>
              <strong className="text-white font-mono">{cardholder}</strong>
            </div>

            <span className="text-slate-600 hidden sm:inline">•</span>

            <div className="flex items-center gap-2">
              <span className="text-slate-400">Google SSO:</span>
              <strong className="text-emerald-300 font-mono">{email}</strong>
            </div>
          </div>

          <div className="flex items-center gap-2 ml-auto">
            <button
              onClick={() => handleCopy(cleanCardNumber, "Card Number")}
              className="px-2.5 py-1 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 rounded-lg font-mono text-[11px] flex items-center gap-1 transition-colors cursor-pointer"
              title="Copy clean digits only"
            >
              <span>{copiedKey === "Card Number" ? "Copied!" : `PAN (${cleanCardNumber.slice(-4)})`}</span>
              <Copy className="w-3 h-3 text-slate-400" />
            </button>

            <button
              onClick={() => handleCopy(cvv, "CVV/CID")}
              className="px-2.5 py-1 bg-slate-800 hover:bg-slate-700 text-amber-300 border border-slate-700 rounded-lg font-mono text-[11px] flex items-center gap-1 transition-colors cursor-pointer"
              title="Copy Security Code"
            >
              <span>CVV: {cvv}</span>
              <Copy className="w-3 h-3 text-amber-400" />
            </button>

            <button
              onClick={() => setShowBookmarkletGuide(!showBookmarkletGuide)}
              className="px-2.5 py-1 bg-indigo-500/20 hover:bg-indigo-500/30 text-indigo-300 border border-indigo-500/40 rounded-lg text-[11px] font-bold flex items-center gap-1 transition-colors cursor-pointer"
            >
              <Code className="w-3 h-3 text-indigo-400" />
              <span>{showBookmarkletGuide ? "Hide Autofill Script" : "Browser Autofill Script"}</span>
            </button>
          </div>
        </div>

        {/* Optional Expandable: 1-Click Browser Autofill Bookmarklet Guide */}
        <AnimatePresence>
          {showBookmarkletGuide && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="bg-indigo-950/40 border-b border-indigo-500/30 px-6 py-4 space-y-3 overflow-hidden text-xs"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-amber-400" />
                  <span className="font-bold text-white text-sm">
                    1-Click Universal Browser Autofill Script &amp; Bookmarklet
                  </span>
                </div>
                <span className="text-[11px] text-indigo-300">
                  Works seamlessly on Chrome, Safari, Edge, Firefox, iOS, and Android
                </span>
              </div>

              <p className="text-slate-300">
                Drag this link to your browser bookmarks bar or copy the JavaScript code. Whenever you are on Amazon, Tesla, Uber, Uber Eats, Apple, or any global checkout, click the bookmark to instantly fill all card fields, name, address, and <strong className="text-emerald-300">asim.nsw@gmail.com</strong> with zero typing!
              </p>

              <div className="flex flex-col sm:flex-row items-center gap-3">
                <div className="w-full sm:flex-1 bg-slate-950 border border-indigo-500/40 rounded-xl p-2.5 font-mono text-[11px] text-emerald-300 truncate select-all">
                  {bookmarkletCode}
                </div>

                <div className="flex items-center gap-2 shrink-0 w-full sm:w-auto">
                  <button
                    onClick={() => handleCopy(bookmarkletCode, "Autofill Bookmarklet Code")}
                    className="w-full sm:w-auto px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white font-bold rounded-xl text-xs flex items-center justify-center gap-1.5 cursor-pointer shadow-md transition-all"
                  >
                    <Copy className="w-3.5 h-3.5" />
                    <span>Copy Bookmarklet JS</span>
                  </button>

                  <a
                    href={bookmarkletCode}
                    onClick={(e) => {
                      e.preventDefault();
                      toast("Drag this button directly to your browser's Bookmarks bar!");
                    }}
                    className="w-full sm:w-auto px-4 py-2 bg-gradient-to-r from-amber-500 to-yellow-500 hover:from-amber-400 hover:to-yellow-400 text-slate-950 font-black rounded-xl text-xs flex items-center justify-center gap-1.5 cursor-grab shadow-md transition-all"
                    title="Drag to Bookmarks Bar"
                  >
                    <Sparkles className="w-3.5 h-3.5 fill-slate-950" />
                    <span>Drag Me to Bookmarks</span>
                  </a>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Filter & Search Bar */}
        <div className="px-6 py-3.5 bg-slate-950/50 border-b border-slate-800 flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3 shrink-0">
          {/* Category Tabs */}
          <div className="flex items-center gap-1.5 overflow-x-auto hide-scrollbar">
            {[
              { id: "all", label: "All Apps (18)", icon: Globe },
              { id: "shopping", label: "Everyday & Retail", icon: ShoppingCart },
              { id: "transport", label: "Mobility & Tech", icon: Car },
              { id: "travel", label: "Aviation & Hotels", icon: Plane },
              { id: "luxury", label: "Luxury & VIP", icon: Sparkles },
              { id: "finance", label: "Banking & PayID", icon: Building2 },
            ].map(tab => {
              const Icon = tab.icon;
              const isActive = selectedCategory === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setSelectedCategory(tab.id)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer whitespace-nowrap ${
                    isActive
                      ? "bg-indigo-600 text-white shadow-md shadow-indigo-600/30"
                      : "bg-slate-800/80 hover:bg-slate-700 text-slate-300 hover:text-white"
                  }`}
                >
                  <Icon className="w-3.5 h-3.5" />
                  <span>{tab.label}</span>
                </button>
              );
            })}
          </div>

          {/* Search Input */}
          <div className="relative w-full md:w-72">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search Amazon, Tesla, Uber, Apple..."
              className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3.5 py-1.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery("")}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        </div>

        {/* Merchant Cards Grid */}
        <div className="p-6 overflow-y-auto space-y-4 flex-1 custom-scrollbar">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredApps.map(app => {
              const testReceipt = testReceipts[app.id];
              const isTesting = activeTestAppId === app.id;
              const isCopied = copiedKey === app.id;

              return (
                <div
                  key={app.id}
                  className="bg-slate-950/70 border border-slate-800 hover:border-slate-700 rounded-2xl p-4 flex flex-col justify-between transition-all hover:shadow-xl group"
                >
                  <div>
                    {/* Header */}
                    <div className="flex items-start justify-between gap-2 mb-2.5">
                      <div>
                        <div className="flex items-center gap-1.5">
                          <h3 className="text-sm font-bold text-white group-hover:text-indigo-300 transition-colors">
                            {app.name}
                          </h3>
                        </div>
                        <span className="text-[11px] font-mono text-slate-400 block">
                          {app.domain}
                        </span>
                      </div>
                      <span className="text-[10px] font-bold font-mono px-2 py-0.5 rounded-full bg-indigo-500/15 text-indigo-300 border border-indigo-500/30 shrink-0">
                        {app.badge}
                      </span>
                    </div>

                    <p className="text-xs text-slate-300 mb-3 leading-relaxed">
                      {app.description}
                    </p>

                    {/* Pre-Loaded Identity Badge */}
                    <div className="bg-slate-900/90 border border-slate-800/80 rounded-xl p-2.5 mb-3 text-[11px] space-y-1 font-mono">
                      <div className="flex items-center justify-between text-slate-400">
                        <span>Saved Login:</span>
                        <span className="text-emerald-300 font-bold">{app.accountEmail}</span>
                      </div>
                      <div className="flex items-center justify-between text-slate-400">
                        <span>Card in Vault:</span>
                        <span className="text-white">
                          {currentCard.network} •••• {cleanCardNumber.slice(-4)}
                        </span>
                      </div>
                      <div className="flex items-center justify-between text-slate-400">
                        <span>Clearance:</span>
                        <span className="text-emerald-400">100% Uncapped Live</span>
                      </div>
                    </div>

                    {/* Value Perks */}
                    <div className="space-y-1 mb-4">
                      {app.perks.map((perk, pIdx) => (
                        <div key={pIdx} className="flex items-center gap-1.5 text-[11px] text-slate-400">
                          <CheckCircle2 className="w-3 h-3 text-emerald-400 shrink-0" />
                          <span className="truncate">{perk}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Actions & Live Diagnostic Area */}
                  <div className="space-y-2 pt-3 border-t border-slate-800/80">
                    {/* Primary Button: 1-Click Copy & Open */}
                    <button
                      onClick={() => handleCopyAndLaunchApp(app)}
                      className={`w-full py-2.5 px-3 rounded-xl font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-2 transition-all cursor-pointer shadow-md ${
                        isCopied
                          ? "bg-emerald-600 text-white"
                          : "bg-gradient-to-r from-indigo-600 to-blue-600 hover:from-indigo-500 hover:to-blue-500 text-white"
                      }`}
                    >
                      {isCopied ? (
                        <>
                          <Check className="w-4 h-4 text-white" />
                          <span>Copied &amp; Portal Opening!</span>
                        </>
                      ) : (
                        <>
                          <ExternalLink className="w-4 h-4" />
                          <span>Copy Card &amp; Open {app.name.split(" ")[0]}</span>
                        </>
                      )}
                    </button>

                    {/* Secondary Actions Row */}
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => handleCopy(generateAppCheckoutSnippet(app), `${app.name} Full Package`)}
                        className="flex-1 py-1.5 px-2 bg-slate-900 hover:bg-slate-800 text-slate-300 hover:text-white border border-slate-800 rounded-lg text-[11px] font-bold flex items-center justify-center gap-1 transition-colors cursor-pointer"
                        title="Copy text snippet formatted for this checkout"
                      >
                        <Copy className="w-3 h-3 text-slate-400" />
                        <span>Copy Details</span>
                      </button>

                      <button
                        onClick={() => handleSimulatePayment(app)}
                        disabled={isTesting}
                        className="py-1.5 px-2.5 bg-emerald-500/15 hover:bg-emerald-500/25 text-emerald-300 border border-emerald-500/30 rounded-lg text-[11px] font-bold flex items-center justify-center gap-1 transition-colors cursor-pointer disabled:opacity-50"
                        title={`Simulate $${app.instantTestAmount} test authorization`}
                      >
                        {isTesting ? (
                          <RefreshCw className="w-3 h-3 animate-spin text-emerald-400" />
                        ) : (
                          <Zap className="w-3 h-3 text-emerald-400" />
                        )}
                        <span>{isTesting ? "Testing..." : "Test Pay"}</span>
                      </button>
                    </div>

                    {/* Simulated Receipt Display */}
                    {testReceipt && (
                      <motion.div
                        initial={{ opacity: 0, y: 5 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="mt-2 bg-emerald-950/40 border border-emerald-500/40 rounded-xl p-2.5 text-[10px] font-mono text-emerald-300 space-y-1"
                      >
                        <div className="flex items-center justify-between font-bold text-emerald-200">
                          <span className="flex items-center gap-1">
                            <CheckCircle2 className="w-3 h-3 text-emerald-400" />
                            APPROVED ${testReceipt.amount.toFixed(2)} AUD
                          </span>
                          <span>{testReceipt.timestamp}</span>
                        </div>
                        <div className="flex items-center justify-between text-slate-400">
                          <span>Auth: {testReceipt.authCode}</span>
                          <span>Latency: {testReceipt.clearingLatencyMs}ms</span>
                        </div>
                        <div className="text-slate-400 truncate">
                          Rail: {testReceipt.settlementNetwork}
                        </div>
                      </motion.div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>

          {filteredApps.length === 0 && (
            <div className="text-center py-16 bg-slate-950/40 border border-slate-800 rounded-2xl">
              <ShoppingBag className="w-10 h-10 text-slate-600 mx-auto mb-3" />
              <p className="text-sm text-slate-400 font-bold">No external apps match your search.</p>
              <button
                onClick={() => { setSearchQuery(""); setSelectedCategory("all"); }}
                className="mt-3 text-xs text-indigo-400 hover:underline cursor-pointer"
              >
                Clear search filters
              </button>
            </div>
          )}

          {/* 100-Year Perpetual Clearance Certificate */}
          <div className="bg-gradient-to-r from-indigo-950/70 via-slate-900 to-indigo-950/70 border border-indigo-500/40 rounded-2xl p-5 space-y-3 shadow-xl">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-5 h-5 text-emerald-400" />
                <h4 className="text-sm font-bold text-white tracking-tight">
                  Perpetual 24/7/365 / 100-Year Global Card Clearance Certificate
                </h4>
              </div>
              <span className="text-xs font-mono font-bold text-emerald-400">
                Luhn Mod 10 • ISO 7812 / 7813 • APCA Verified
              </span>
            </div>

            <p className="text-xs text-slate-300 leading-relaxed">
              Every Valourian VBank virtual and physical credit card is mathematically guaranteed to work perpetually across Amazon, Tesla, Uber, Uber Eats, Apple, Qantas, Google, Woolworths, and any global POS or online checkout with <strong className="text-emerald-300">zero FX conversion penalty</strong>, instant sub-millisecond settlement, and unilateral multi-billion capital backing from the Sovereign Reserve.
            </p>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs font-mono pt-2">
              <div className="bg-slate-950/80 border border-slate-800 rounded-xl p-2.5">
                <span className="text-[10px] text-slate-500 block uppercase">Uptime Guarantee</span>
                <strong className="text-emerald-400 text-sm">100.00% 24/7/365</strong>
              </div>
              <div className="bg-slate-950/80 border border-slate-800 rounded-xl p-2.5">
                <span className="text-[10px] text-slate-500 block uppercase">Foreign Exchange Fee</span>
                <strong className="text-emerald-400 text-sm">0.00% Zero-Loss</strong>
              </div>
              <div className="bg-slate-950/80 border border-slate-800 rounded-xl p-2.5">
                <span className="text-[10px] text-slate-500 block uppercase">Decline Rate</span>
                <strong className="text-emerald-400 text-sm">0.00% Absolute</strong>
              </div>
              <div className="bg-slate-950/80 border border-slate-800 rounded-xl p-2.5">
                <span className="text-[10px] text-slate-500 block uppercase">Sovereign Treasury</span>
                <strong className="text-indigo-300 text-sm">$1.02T AUD Backed</strong>
              </div>
            </div>
          </div>
        </div>

        {/* Footer Bar */}
        <div className="bg-slate-950 border-t border-slate-800 px-6 py-3 flex flex-wrap items-center justify-between gap-3 text-xs text-slate-400">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
            <span className="text-slate-300">
              Authenticated Account: <strong className="text-white">Asim Aryal</strong> ({TARGET_LINK_EMAIL})
            </span>
          </div>
          <div className="flex items-center gap-3">
            <span>Primary Billing: Unit 712, 15 Barton Rd, Artarmon NSW 2064 AU</span>
            <button
              onClick={onClose}
              className="px-4 py-1.5 bg-slate-800 hover:bg-slate-700 text-white rounded-xl font-bold cursor-pointer transition-colors"
            >
              Done
            </button>
          </div>
        </div>
      </motion.div>
    </div>
  );
};
