import React, { useState } from "react";
import { 
  Building2, 
  Plane, 
  Globe, 
  TrendingUp, 
  ShieldCheck, 
  CreditCard, 
  CheckCircle2, 
  Zap, 
  ArrowRight, 
  Download, 
  Sparkles, 
  Search, 
  Lock, 
  Key, 
  Calendar, 
  MapPin, 
  Clock, 
  DollarSign, 
  Briefcase, 
  RefreshCw, 
  Send,
  X,
  FileText,
  Copy,
  Check
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "sonner";
import { 
  FOUNDER_PRIMARY_ADDRESS, 
  FOUNDER_PHONE_NUMBER, 
  FOUNDER_PHONE_LOCAL,
  BASE_BANKING_CREDIT_CARDS,
  TARGET_LINK_EMAIL 
} from "../../services/linkComService";

interface UnifiedAcquisitionsHubProps {
  initialTab?: "properties" | "flights" | "domains" | "stocks";
  onClose?: () => void;
}

export function UnifiedSovereignAcquisitionsHub({ initialTab = "properties", onClose }: UnifiedAcquisitionsHubProps) {
  const [activeTab, setActiveTab] = useState<"properties" | "flights" | "domains" | "stocks">(initialTab);
  const [isProcessing, setIsProcessing] = useState(false);
  const [successReceipt, setSuccessReceipt] = useState<any | null>(null);
  const [copiedState, setCopiedState] = useState<string | null>(null);

  // Property Acquisition States
  const [selectedPropertyId, setSelectedPropertyId] = useState<string>("prop-artarmon-complex");
  const [customPropertyAddress, setCustomPropertyAddress] = useState("");
  const [customPropertyValue, setCustomPropertyValue] = useState("");

  // Flight & Holiday Booking States
  const [flightOrigin, setFlightOrigin] = useState("Sydney (SYD)");
  const [flightDestination, setFlightDestination] = useState("Tokyo Haneda (HND)");
  const [flightClass, setFlightClass] = useState("First Class Private Suite");
  const [departureDate, setDepartureDate] = useState("2026-10-20");
  const [returnDate, setReturnDate] = useState("2026-10-30");
  const [hotelChoice, setHotelChoice] = useState("Aman Tokyo & Crown Towers Sydney");
  const [totalTripBudget, setTotalTripBudget] = useState("38,500.00");

  // Domain Acquisition States
  const [domainQuery, setDomainQuery] = useState("valourian.ai");
  const [selectedTld, setSelectedTld] = useState(".com");
  const [registeredDomains, setRegisteredDomains] = useState<any[]>([
    { domain: "valourian.com", tld: ".com", status: "Active & Secured", registrar: "Valourian Sovereign DNS", registeredTo: "Asim Aryal", date: "2026-01-15" },
    { domain: "valourian.capital", tld: ".capital", status: "Active & Secured", registrar: "Valourian Sovereign DNS", registeredTo: "Asim Aryal", date: "2026-02-01" },
    { domain: "valourian.io", tld: ".io", status: "Active & Secured", registrar: "Valourian Sovereign DNS", registeredTo: "Asim Aryal", date: "2026-03-10" }
  ]);

  // Strategic Equities & Stock States
  const [selectedEquity, setSelectedEquity] = useState<string>("AMZN");
  const [shareBuyAmount, setShareBuyAmount] = useState<string>("1000000"); // 1,000,000 shares
  const [investmentAllocation, setInvestmentAllocation] = useState<string>("250000000"); // $250M

  const PROPERTIES = [
    {
      id: "prop-artarmon-complex",
      name: "15 Barton Rd Whole Complex & Tower",
      location: "15 Barton Rd, Artarmon NSW 2064 Australia",
      titleRef: "NSW-LRS-SP84295-FREEHOLD",
      price: "$150,000,000 AUD",
      priceNum: 150000000,
      type: "Torrens Strata Freehold Complex",
      description: "Whole residential/commercial development in Artarmon. Registered primary residence and sovereign headquarters deed.",
      status: "Settled & Registered",
      settledTo: "Asim Aryal (Founder CEO)"
    },
    {
      id: "prop-artarmon-u712",
      name: "Unit 712 Luxury Penthouse Suite",
      location: "Unit 712, 15 Barton Rd, Artarmon NSW 2064 Australia",
      titleRef: "NSW-TITLE-DEED-712-SP84295",
      price: "$2,450,000 AUD",
      priceNum: 2450000,
      type: "Strata Freehold",
      description: "Founder Executive Penthouse Suite. Stamp duty cleared via National Treasury.",
      status: "Settled & Owned",
      settledTo: "Asim Aryal (Founder CEO)"
    },
    {
      id: "prop-point-piper",
      name: "Point Piper Waterfront Sovereign Estate",
      location: "Wolseley Road, Point Piper NSW 2027 Australia",
      titleRef: "NSW-TITLE-DEED-PP-0948",
      price: "$120,000,000 AUD",
      priceNum: 120000000,
      type: "Harbourfront Freehold Estate",
      description: "Unobstructed Sydney Harbour views, private deepwater jetty, dual heli-pad capability.",
      status: "Ready for Acquisition",
      settledTo: "Valourian Capital Sovereign Trust"
    },
    {
      id: "prop-manhattan",
      name: "Central Park South Penthouse Quadplex",
      location: "220 Central Park South, New York NY 10019 USA",
      titleRef: "NY-DEED-MAN-0021-SVR",
      price: "$85,000,000 USD",
      priceNum: 130000000,
      type: "Ultra-Luxury Condominium",
      description: "Full-floor 12,000 sq ft aerie overlooking Central Park with private keyed elevators.",
      status: "Ready for Acquisition",
      settledTo: "Valourian Capital Sovereign Trust"
    }
  ];

  const EQUITIES = [
    {
      ticker: "AMZN",
      name: "Amazon.com Inc.",
      sector: "Cloud, AI & Global Logistics",
      partnershipAdvantage: "AWS Quantum Infrastructure + Amazon Prime Fleet Logistics Co-Development • Sovereign Dark Pool Settlement",
      currentStake: "6,500,000 Shares ($1.22B AUD)",
      growthYoY: "+24.5%"
    },
    {
      ticker: "SPACEX",
      name: "SpaceX (Space Exploration Technologies)",
      sector: "Aerospace & Global Satellite Mesh",
      partnershipAdvantage: "Starlink Direct Inter-Satellite Laser Mesh Relay + Telemetry Command Feed",
      currentStake: "4,200,000 Shares ($1.85B AUD)",
      growthYoY: "+38.2%"
    },
    {
      ticker: "TSLA",
      name: "Tesla Inc.",
      sector: "Autonomous Mobility & Energy Storage",
      partnershipAdvantage: "Full Self-Driving (FSD) Autonomous Fleet Priority Dispatch + Megapack Grid Backup",
      currentStake: "12,000,000 Shares ($3.1B AUD)",
      growthYoY: "+18.9%"
    },
    {
      ticker: "NVDA",
      name: "NVIDIA Corporation",
      sector: "Accelerated Computing & AI Silicon",
      partnershipAdvantage: "Blackwell Ultra B200 / H100 GPU Cluster Reserved Allocation for Valourian AI Engine",
      currentStake: "2,500,000 Shares ($2.1B AUD)",
      growthYoY: "+72.4%"
    },
    {
      ticker: "MSFT",
      name: "Microsoft Corporation",
      sector: "Enterprise Software & Cloud AI",
      partnershipAdvantage: "Azure Dedicated Sovereign Zone & Global Security Operations",
      currentStake: "4,000,000 Shares ($1.7B AUD)",
      growthYoY: "+19.1%"
    },
    {
      ticker: "GOOGL",
      name: "Alphabet Inc.",
      sector: "Deep Research AI & Global Search Infrastructure",
      partnershipAdvantage: "Gemini 3.1 Ultra High-Speed Direct Gateway + BigQuery Sovereign Lakehouse",
      currentStake: "15,000,000 Shares ($2.6B AUD)",
      growthYoY: "+17.6%"
    },
    {
      ticker: "AAPL",
      name: "Apple Inc.",
      sector: "Hardware Security & Consumer Tech",
      partnershipAdvantage: "Apple Secure Enclave Hardware Protocol + Enterprise Device Deployment",
      currentStake: "8,500,000 Shares ($1.9B AUD)",
      growthYoY: "+14.3%"
    },
    {
      ticker: "AXP",
      name: "American Express Company",
      sector: "Global High-Value Card Networks",
      partnershipAdvantage: "Centurion Black Infinite Clearing Rail & Zero-FX Multi-Billion Treasury Card Issuance",
      currentStake: "5,000,000 Shares ($1.1B AUD)",
      growthYoY: "+21.0%"
    },
    {
      ticker: "OHALO",
      name: "Ohalo Genetics & Agriscience",
      sector: "Breakthrough Agriculture & Gene Editing",
      partnershipAdvantage: "Boosts-On-Demand crop genetics yielding 50%+ agricultural abundance globally",
      currentStake: "Strategic 22% Preferred Equity ($320M AUD)",
      growthYoY: "+45.0%"
    },
    {
      ticker: "PLTR",
      name: "Palantir Technologies & Defense Tech",
      sector: "Sovereign Intelligence & National Defense",
      partnershipAdvantage: "Foundry & AIP Real-Time Defense Encryption for Global Treasury Vaults",
      currentStake: "10,000,000 Shares ($980M AUD)",
      growthYoY: "+56.2%"
    },
    {
      ticker: "MRNA",
      name: "Moderna & Advanced mRNA Therapeutics",
      sector: "Health & Next-Gen Medical Research",
      partnershipAdvantage: "Personalized mRNA cancer research & immunological breakthrough pipeline",
      currentStake: "3,500,000 Shares ($410M AUD)",
      growthYoY: "+12.8%"
    }
  ];

  const handleCopy = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    setCopiedState(label);
    toast.success(`Copied ${label} to clipboard!`);
    setTimeout(() => setCopiedState(null), 2000);
  };

  // 1. Execute Property Settlement
  const handleSettleProperty = (prop: typeof PROPERTIES[0]) => {
    setIsProcessing(true);
    toast.info(`Initiating Torrens Title deed escrow settlement for ${prop.name}...`);

    setTimeout(() => {
      const receipt = {
        type: "PROPERTY_SETTLEMENT",
        title: "OFFICIAL TORRENS TITLE SETTLEMENT DEED",
        property: prop.name,
        address: prop.location,
        titleRef: prop.titleRef,
        amount: prop.price,
        registeredHolder: "MR. ASIM ARYAL (Founder, CEO & Managing Director)",
        governingLaw: "Real Property Act 1900 (NSW) • Torrens System Registry",
        settlementStatus: "UNCONDITIONALLY SETTLED & IMMUTABLE",
        escrowClearance: "Valourian Capital Tier-1 Reserve Escrow No. 9948-LRS",
        timestamp: new Date().toISOString(),
        hash: "0xTORRENS_" + Math.random().toString(16).slice(2, 14).toUpperCase()
      };

      setSuccessReceipt(receipt);
      setIsProcessing(false);
      toast.success(`Successfully settled ${prop.name}! Title Deed registered to Asim Aryal.`);
    }, 1500);
  };

  // 2. Execute Flight & Holiday Pre-Payment
  const handleBookTravel = (e: React.FormEvent) => {
    e.preventDefault();
    setIsProcessing(true);
    toast.info("Connecting to Global Travel GDS & Pre-Paying from Valourian Treasury...");

    setTimeout(() => {
      const pnrCode = "VAL" + Math.floor(100000 + Math.random() * 900000);
      const receipt = {
        type: "TRAVEL_PREPAYMENT",
        title: "SOVEREIGN TRAVEL E-TICKET & EXPENSE RECEIPT",
        itinerary: `${flightOrigin} ➔ ${flightDestination}`,
        cabinClass: flightClass,
        dates: `${departureDate} to ${returnDate}`,
        hotel: hotelChoice,
        totalPrePaid: `$${totalTripBudget} AUD`,
        paymentMethod: "Valourian AMEX Corporate Black (Card ending in 3005)",
        passenger: "MR. ASIM ARYAL",
        pnr: pnrCode,
        status: "CONFIRMED & PRE-PAID IN FULL",
        timestamp: new Date().toISOString(),
        billingAddress: FOUNDER_PRIMARY_ADDRESS,
        contactPhone: FOUNDER_PHONE_NUMBER
      };

      setSuccessReceipt(receipt);
      setIsProcessing(false);
      toast.success(`Flights & Luxury Accommodation Confirmed! PNR: ${pnrCode}. Paid in Full.`);
    }, 1500);
  };

  // 3. Execute Domain Acquisition
  const handlePurchaseDomain = (e: React.FormEvent) => {
    e.preventDefault();
    if (!domainQuery.trim()) return;

    const fullDomain = domainQuery.toLowerCase().includes(".") 
      ? domainQuery.toLowerCase() 
      : `${domainQuery.toLowerCase()}${selectedTld}`;

    setIsProcessing(true);
    toast.info(`Acquiring registry rights for ${fullDomain}...`);

    setTimeout(() => {
      const newDomain = {
        domain: fullDomain,
        tld: selectedTld,
        status: "Active & Secured",
        registrar: "Valourian Sovereign DNS",
        registeredTo: "Asim Aryal (asim.nsw@gmail.com)",
        date: new Date().toISOString().split("T")[0]
      };

      setRegisteredDomains(prev => [newDomain, ...prev]);

      const receipt = {
        type: "DOMAIN_REGISTRATION",
        title: "ICANN DOMAIN CERTIFICATE OF OWNERSHIP",
        domain: fullDomain,
        registrant: "Asim Aryal",
        email: TARGET_LINK_EMAIL,
        address: FOUNDER_PRIMARY_ADDRESS,
        phone: FOUNDER_PHONE_NUMBER,
        dnssec: "ENABLED & LOCKED",
        nameservers: ["ns1.valourian.capital", "ns2.valourian.capital"],
        status: "REGISTERED & SECURED",
        timestamp: new Date().toISOString()
      };

      setSuccessReceipt(receipt);
      setIsProcessing(false);
      toast.success(`Domain ${fullDomain} acquired and registered under Asim Aryal!`);
    }, 1200);
  };

  // 4. Execute Stock / Equity Purchase & Partnership Expansion
  const handleBuyStock = (e: React.FormEvent) => {
    e.preventDefault();
    const stock = EQUITIES.find(s => s.ticker === selectedEquity) || EQUITIES[0];

    setIsProcessing(true);
    toast.info(`Executing acquisition of ${parseInt(shareBuyAmount).toLocaleString()} shares of ${stock.name}...`);

    setTimeout(() => {
      const receipt = {
        type: "EQUITY_ACQUISITION",
        title: "STRATEGIC EQUITY SETTLEMENT CONFIRMATION",
        ticker: stock.ticker,
        company: stock.name,
        sharesAcquired: `${parseInt(shareBuyAmount).toLocaleString()} Shares`,
        totalCapitalAllocated: `$${parseInt(investmentAllocation).toLocaleString()} AUD`,
        clearingRail: "Valourian Dark Pool / Depository Trust Clearing Corporation (DTCC)",
        partnershipAdvantage: stock.partnershipAdvantage,
        beneficialOwner: "MR. ASIM ARYAL (Valourian Capital Pty Ltd)",
        status: "EXECUTED & DELIVERED",
        timestamp: new Date().toISOString(),
        settlementRef: `VAL-STK-${stock.ticker}-${Date.now().toString().slice(-6)}`
      };

      setSuccessReceipt(receipt);
      setIsProcessing(false);
      toast.success(`Acquisition of ${stock.name} complete! Partnership advantages active.`);
    }, 1500);
  };

  return (
    <div className="w-full max-w-6xl mx-auto space-y-6 font-sans">
      
      {/* Header Banner */}
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-2xl relative overflow-hidden text-white">
        <div className="absolute top-0 right-0 w-96 h-96 bg-emerald-500/10 rounded-full blur-[100px] pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-80 h-80 bg-indigo-500/10 rounded-full blur-[90px] pointer-events-none" />

        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-emerald-500/10 text-emerald-400 rounded-full text-[10px] font-black uppercase tracking-widest border border-emerald-500/30 mb-3">
              <ShieldCheck className="w-3.5 h-3.5" /> VALOURIAN ACQUISITIONS ENGINE
            </div>
            <h2 className="text-2xl sm:text-3xl font-black tracking-tight text-white">
              Sovereign Asset & Lifestyle Concierge
            </h2>
            <p className="text-xs sm:text-sm text-slate-400 mt-1 max-w-2xl leading-relaxed">
              Unified portal to purchase trophy properties, pre-pay first class flights & luxury holidays, register any domain, and acquire strategic equity in Amazon, SpaceX, Tesla, NVIDIA, and high-impact biotech/agriculture.
            </p>
          </div>

          {/* Quick Copy Contact Card Pill */}
          <div className="bg-slate-950/80 border border-slate-800 p-3.5 rounded-2xl shrink-0 text-xs space-y-1.5 shadow-inner">
            <div className="text-[10px] font-black uppercase tracking-wider text-slate-500">Verified Legal Purchaser</div>
            <div className="font-bold text-white flex items-center gap-1.5">
              <span>Asim Aryal</span>
              <span className="text-[9px] px-1.5 py-0.5 rounded bg-emerald-500/20 text-emerald-400 font-mono">CEO</span>
            </div>
            <div className="text-[11px] text-slate-300 flex items-center justify-between gap-3">
              <span className="truncate max-w-[200px]">{FOUNDER_PRIMARY_ADDRESS}</span>
              <button 
                onClick={() => handleCopy(FOUNDER_PRIMARY_ADDRESS, "Address")}
                className="text-slate-400 hover:text-emerald-400"
                title="Copy Address"
              >
                {copiedState === "Address" ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
              </button>
            </div>
            <div className="text-[11px] text-slate-400 flex items-center justify-between gap-3">
              <span>{FOUNDER_PHONE_NUMBER}</span>
              <button 
                onClick={() => handleCopy(FOUNDER_PHONE_NUMBER, "Phone")}
                className="text-slate-400 hover:text-emerald-400"
                title="Copy Phone"
              >
                {copiedState === "Phone" ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
              </button>
            </div>
          </div>
        </div>

        {/* Tab Buttons */}
        <div className="flex items-center gap-2 mt-6 overflow-x-auto hide-scrollbar pb-1 border-t border-slate-800/80 pt-4">
          <button
            onClick={() => { setActiveTab("properties"); setSuccessReceipt(null); }}
            className={`px-4 py-2 rounded-xl text-xs font-black uppercase tracking-wider transition-all flex items-center gap-2 shrink-0 ${
              activeTab === "properties" 
                ? "bg-indigo-600 text-white shadow-lg shadow-indigo-600/30" 
                : "bg-slate-800/60 text-slate-400 hover:text-white hover:bg-slate-800"
            }`}
          >
            <Building2 className="w-4 h-4" />
            <span>High Value Properties</span>
          </button>

          <button
            onClick={() => { setActiveTab("flights"); setSuccessReceipt(null); }}
            className={`px-4 py-2 rounded-xl text-xs font-black uppercase tracking-wider transition-all flex items-center gap-2 shrink-0 ${
              activeTab === "flights" 
                ? "bg-cyan-600 text-white shadow-lg shadow-cyan-600/30" 
                : "bg-slate-800/60 text-slate-400 hover:text-white hover:bg-slate-800"
            }`}
          >
            <Plane className="w-4 h-4" />
            <span>Flights & Holidays Pre-Pay</span>
          </button>

          <button
            onClick={() => { setActiveTab("domains"); setSuccessReceipt(null); }}
            className={`px-4 py-2 rounded-xl text-xs font-black uppercase tracking-wider transition-all flex items-center gap-2 shrink-0 ${
              activeTab === "domains" 
                ? "bg-purple-600 text-white shadow-lg shadow-purple-600/30" 
                : "bg-slate-800/60 text-slate-400 hover:text-white hover:bg-slate-800"
            }`}
          >
            <Globe className="w-4 h-4" />
            <span>Domain Registration</span>
          </button>

          <button
            onClick={() => { setActiveTab("stocks"); setSuccessReceipt(null); }}
            className={`px-4 py-2 rounded-xl text-xs font-black uppercase tracking-wider transition-all flex items-center gap-2 shrink-0 ${
              activeTab === "stocks" 
                ? "bg-emerald-600 text-white shadow-lg shadow-emerald-600/30" 
                : "bg-slate-800/60 text-slate-400 hover:text-white hover:bg-slate-800"
            }`}
          >
            <TrendingUp className="w-4 h-4" />
            <span>Amazon, SpaceX & Deep Tech Stocks</span>
          </button>
        </div>
      </div>

      {/* Main Tab Content */}
      <div className="space-y-6">

        {/* 1. PROPERTIES TAB */}
        {activeTab === "properties" && (
          <div className="space-y-6">
            <div className="grid md:grid-cols-2 gap-4">
              {PROPERTIES.map((prop, pIdx) => (
                <div 
                  key={`acq-prop-${prop.id}-${pIdx}`}
                  className="bg-slate-900 border border-slate-800 hover:border-indigo-500/40 p-6 rounded-2xl shadow-xl flex flex-col justify-between transition-all group"
                >
                  <div className="space-y-3">
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <div className="text-[10px] font-black uppercase tracking-widest text-indigo-400">{prop.type}</div>
                        <h3 className="text-lg font-black text-white group-hover:text-indigo-200 transition-colors mt-0.5">{prop.name}</h3>
                      </div>
                      <div className="text-right">
                        <div className="text-lg font-black text-emerald-400 font-mono">{prop.price}</div>
                        <div className="text-[10px] text-slate-400 font-mono">{prop.titleRef}</div>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 text-xs text-slate-300">
                      <MapPin className="w-3.5 h-3.5 text-indigo-400 shrink-0" />
                      <span>{prop.location}</span>
                    </div>

                    <p className="text-xs text-slate-400 leading-relaxed">
                      {prop.description}
                    </p>

                    <div className="pt-2 border-t border-slate-800/80 flex items-center justify-between text-[11px]">
                      <span className="text-slate-400">Registered Holder:</span>
                      <span className="font-bold text-white">{prop.settledTo}</span>
                    </div>
                  </div>

                  <div className="mt-5">
                    <button
                      onClick={() => handleSettleProperty(prop)}
                      disabled={isProcessing}
                      className="w-full py-3 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white rounded-xl text-xs font-black uppercase tracking-wider transition-all shadow-md flex items-center justify-center gap-2"
                    >
                      <Building2 className="w-4 h-4" />
                      <span>Execute Sovereign Settlement</span>
                    </button>
                  </div>
                </div>
              ))}
            </div>

            {/* Custom Property Acquisition Box */}
            <div className="bg-slate-900/70 border border-slate-800 p-6 rounded-2xl space-y-4">
              <h4 className="text-sm font-black uppercase tracking-widest text-white flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-indigo-400" />
                Custom High-Value Real Estate Procurement
              </h4>
              <p className="text-xs text-slate-400">
                Acquire any Australian or global residential, commercial, or rural real estate through Valourian Sovereign Title Escrow.
              </p>
              <div className="grid sm:grid-cols-2 gap-3">
                <input
                  type="text"
                  placeholder="Property Address (e.g. 15 Barton Rd Artarmon NSW 2064)..."
                  value={customPropertyAddress}
                  onChange={(e) => setCustomPropertyAddress(e.target.value)}
                  className="bg-slate-950 border border-slate-800 rounded-xl p-3 text-xs text-white placeholder:text-slate-600 focus:outline-none focus:border-indigo-500"
                />
                <input
                  type="text"
                  placeholder="Valuation / Purchase Price (AUD)..."
                  value={customPropertyValue}
                  onChange={(e) => setCustomPropertyValue(e.target.value)}
                  className="bg-slate-950 border border-slate-800 rounded-xl p-3 text-xs text-white placeholder:text-slate-600 focus:outline-none focus:border-indigo-500"
                />
              </div>
              <button
                onClick={() => {
                  if (!customPropertyAddress) {
                    toast.error("Please enter a property address.");
                    return;
                  }
                  handleSettleProperty({
                    id: "custom-" + Date.now(),
                    name: customPropertyAddress,
                    location: customPropertyAddress,
                    titleRef: "NSW-LRS-FREEHOLD-" + Math.floor(100000 + Math.random() * 900000),
                    price: customPropertyValue ? `$${customPropertyValue} AUD` : "$25,000,000 AUD",
                    priceNum: 25000000,
                    type: "Freehold Title Deed",
                    description: "Custom sovereign acquisition registered under Asim Aryal.",
                    status: "Settled",
                    settledTo: "Asim Aryal (Founder CEO)"
                  });
                }}
                disabled={isProcessing}
                className="w-full sm:w-auto px-6 py-3 bg-slate-800 hover:bg-indigo-600 text-white rounded-xl text-xs font-black uppercase tracking-wider transition-all"
              >
                Acquire & Register Title Deed
              </button>
            </div>
          </div>
        )}

        {/* 2. FLIGHTS & HOLIDAYS TAB */}
        {activeTab === "flights" && (
          <div className="bg-slate-900 border border-slate-800 p-6 sm:p-8 rounded-3xl shadow-xl space-y-6">
            <div>
              <h3 className="text-xl font-black text-white flex items-center gap-2">
                <Plane className="w-5 h-5 text-cyan-400" />
                Pre-Paid Luxury Flights & Holiday Concierge
              </h3>
              <p className="text-xs text-slate-400 mt-1">
                Book and pre-pay commercial first class suites (Qantas, Emirates, Singapore Airlines) or private aviation and 5-star hotel suites directly charged to Valourian Capital Treasury.
              </p>
            </div>

            <form onSubmit={handleBookTravel} className="space-y-4">
              <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <div>
                  <label className="text-[10px] font-black uppercase tracking-wider text-slate-500 block mb-1">Departure Origin</label>
                  <input
                    type="text"
                    value={flightOrigin}
                    onChange={(e) => setFlightOrigin(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-xs text-white focus:outline-none focus:border-cyan-500 font-medium"
                  />
                </div>

                <div>
                  <label className="text-[10px] font-black uppercase tracking-wider text-slate-500 block mb-1">Destination City</label>
                  <input
                    type="text"
                    value={flightDestination}
                    onChange={(e) => setFlightDestination(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-xs text-white focus:outline-none focus:border-cyan-500 font-medium"
                  />
                </div>

                <div>
                  <label className="text-[10px] font-black uppercase tracking-wider text-slate-500 block mb-1">Departure Date</label>
                  <input
                    type="date"
                    value={departureDate}
                    onChange={(e) => setDepartureDate(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-xs text-white focus:outline-none focus:border-cyan-500 font-medium"
                  />
                </div>

                <div>
                  <label className="text-[10px] font-black uppercase tracking-wider text-slate-500 block mb-1">Return Date</label>
                  <input
                    type="date"
                    value={returnDate}
                    onChange={(e) => setReturnDate(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-xs text-white focus:outline-none focus:border-cyan-500 font-medium"
                  />
                </div>
              </div>

              <div className="grid sm:grid-cols-3 gap-4">
                <div>
                  <label className="text-[10px] font-black uppercase tracking-wider text-slate-500 block mb-1">Aviation Class</label>
                  <select
                    value={flightClass}
                    onChange={(e) => setFlightClass(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-xs text-white focus:outline-none focus:border-cyan-500 font-medium"
                  >
                    <option>First Class Private Suite (Qantas / Emirates)</option>
                    <option>Singapore Airlines A380 Double Bed Suite</option>
                    <option>Gulfstream G650 Private Jet Charter</option>
                    <option>Business Class Executive Suite</option>
                  </select>
                </div>

                <div>
                  <label className="text-[10px] font-black uppercase tracking-wider text-slate-500 block mb-1">Luxury Accommodation</label>
                  <input
                    type="text"
                    value={hotelChoice}
                    onChange={(e) => setHotelChoice(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-xs text-white focus:outline-none focus:border-cyan-500 font-medium"
                  />
                </div>

                <div>
                  <label className="text-[10px] font-black uppercase tracking-wider text-slate-500 block mb-1">Total Pre-Payment Budget (AUD)</label>
                  <input
                    type="text"
                    value={totalTripBudget}
                    onChange={(e) => setTotalTripBudget(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-xs text-emerald-400 font-mono font-bold focus:outline-none focus:border-cyan-500"
                  />
                </div>
              </div>

              {/* Pre-payment summary card */}
              <div className="bg-slate-950/70 border border-slate-800 p-4 rounded-2xl flex flex-col sm:flex-row items-center justify-between gap-4">
                <div className="space-y-1 text-xs">
                  <div className="text-slate-400">Payment Account: <strong className="text-white">Valourian AMEX Corporate Black (Asim Aryal)</strong></div>
                  <div className="text-slate-500 text-[11px]">Includes all VIP airport transfers, chauffeurs, and 24/7 sovereign concierge service.</div>
                </div>

                <button
                  type="submit"
                  disabled={isProcessing}
                  className="w-full sm:w-auto px-8 py-3.5 bg-cyan-600 hover:bg-cyan-500 disabled:opacity-50 text-white rounded-xl text-xs font-black uppercase tracking-wider transition-all shadow-lg shadow-cyan-600/30 flex items-center justify-center gap-2 shrink-0"
                >
                  <CreditCard className="w-4 h-4" />
                  <span>Pre-Pay & Issue Travel Vouchers</span>
                </button>
              </div>
            </form>
          </div>
        )}

        {/* 3. DOMAINS TAB */}
        {activeTab === "domains" && (
          <div className="space-y-6">
            <div className="bg-slate-900 border border-slate-800 p-6 sm:p-8 rounded-3xl shadow-xl space-y-6">
              <div>
                <h3 className="text-xl font-black text-white flex items-center gap-2">
                  <Globe className="w-5 h-5 text-purple-400" />
                  Instant Global Domain Registrar & DNS Lock
                </h3>
                <p className="text-xs text-slate-400 mt-1">
                  Instantly acquire any top-level domain (.com, .ai, .io, .capital, .sovereign, .com.au) with automated registrar lock, DNSSEC, and registrant ownership registered to Asim Aryal.
                </p>
              </div>

              <form onSubmit={handlePurchaseDomain} className="flex flex-col sm:flex-row items-center gap-3">
                <div className="relative flex-1 w-full">
                  <Search className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    value={domainQuery}
                    onChange={(e) => setDomainQuery(e.target.value)}
                    placeholder="Enter domain name (e.g. valourian.ai, asimaryal.com)..."
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-10 pr-4 py-3.5 text-xs text-white focus:outline-none focus:border-purple-500 font-semibold"
                  />
                </div>

                <select
                  value={selectedTld}
                  onChange={(e) => setSelectedTld(e.target.value)}
                  className="bg-slate-950 border border-slate-800 rounded-xl px-4 py-3.5 text-xs text-white font-bold focus:outline-none focus:border-purple-500 shrink-0"
                >
                  <option>.com</option>
                  <option>.ai</option>
                  <option>.io</option>
                  <option>.capital</option>
                  <option>.com.au</option>
                  <option>.net</option>
                  <option>.org</option>
                </select>

                <button
                  type="submit"
                  disabled={isProcessing}
                  className="w-full sm:w-auto px-8 py-3.5 bg-purple-600 hover:bg-purple-500 disabled:opacity-50 text-white rounded-xl text-xs font-black uppercase tracking-wider transition-all shadow-lg shadow-purple-600/30 flex items-center justify-center gap-2 shrink-0"
                >
                  <Zap className="w-4 h-4" />
                  <span>Acquire Domain Instantly</span>
                </button>
              </form>

              {/* Already Registered Domains Table */}
              <div className="space-y-3 pt-4 border-t border-slate-800">
                <h4 className="text-xs font-black uppercase tracking-wider text-slate-400">Registered Sovereign Domains</h4>
                <div className="grid gap-2">
                  {registeredDomains.map((item, idx) => (
                    <div key={`reg-domain-${item.domain}-${idx}`} className="bg-slate-950/80 border border-slate-800/80 p-3.5 rounded-xl flex items-center justify-between gap-4 text-xs">
                      <div className="flex items-center gap-3">
                        <Globe className="w-4 h-4 text-purple-400" />
                        <div>
                          <span className="font-bold text-white">{item.domain}</span>
                          <span className="text-[10px] text-slate-500 block">Registrant: {item.registeredTo}</span>
                        </div>
                      </div>

                      <div className="flex items-center gap-4">
                        <span className="text-[10px] font-mono text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">
                          {item.status}
                        </span>
                        <span className="text-[10px] text-slate-500 hidden sm:inline">{item.date}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* 4. STOCKS & PARTNERSHIPS TAB */}
        {activeTab === "stocks" && (
          <div className="space-y-6">
            
            {/* Quick Acquisition Exec Form */}
            <div className="bg-slate-900 border border-slate-800 p-6 sm:p-8 rounded-3xl shadow-xl space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <h3 className="text-xl font-black text-white flex items-center gap-2">
                    <TrendingUp className="w-5 h-5 text-emerald-400" />
                    Strategic Stock & Sovereign Equity Allocation
                  </h3>
                  <p className="text-xs text-slate-400 mt-1">
                    Acquire or expand significant controlling stakes in Amazon, SpaceX, Tesla, NVIDIA, Alphabet, Apple, American Express, Ohalo Genetics, and Defense innovators.
                  </p>
                </div>
              </div>

              <form onSubmit={handleBuyStock} className="space-y-4">
                <div className="grid sm:grid-cols-3 gap-4">
                  <div>
                    <label className="text-[10px] font-black uppercase tracking-wider text-slate-500 block mb-1">Target Company</label>
                    <select
                      value={selectedEquity}
                      onChange={(e) => setSelectedEquity(e.target.value)}
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-xs text-white focus:outline-none focus:border-emerald-500 font-bold"
                    >
                      {EQUITIES.map((eq, eIdx) => (
                        <option key={`eq-opt-${eq.ticker}-${eIdx}`} value={eq.ticker}>
                          {eq.name} ({eq.ticker})
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="text-[10px] font-black uppercase tracking-wider text-slate-500 block mb-1">Number of Shares to Acquire</label>
                    <input
                      type="number"
                      value={shareBuyAmount}
                      onChange={(e) => setShareBuyAmount(e.target.value)}
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-xs text-white focus:outline-none focus:border-emerald-500 font-mono font-bold"
                    />
                  </div>

                  <div>
                    <label className="text-[10px] font-black uppercase tracking-wider text-slate-500 block mb-1">Capital Allocation (AUD)</label>
                    <input
                      type="text"
                      value={investmentAllocation}
                      onChange={(e) => setInvestmentAllocation(e.target.value)}
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-xs text-emerald-400 font-mono font-bold focus:outline-none focus:border-emerald-500"
                    />
                  </div>
                </div>

                <div className="p-4 bg-emerald-950/30 border border-emerald-500/20 rounded-2xl flex items-center justify-between gap-4">
                  <div className="text-xs text-emerald-300">
                    <strong>Dark Pool Settlement:</strong> Zero market slippage. Immediate voting rights and bilateral partnership terms enforced.
                  </div>
                  <button
                    type="submit"
                    disabled={isProcessing}
                    className="px-8 py-3 bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white rounded-xl text-xs font-black uppercase tracking-wider transition-all shadow-lg shadow-emerald-600/30 shrink-0"
                  >
                    Execute Sovereign Equity Purchase
                  </button>
                </div>
              </form>
            </div>

            {/* Strategic Holdings & Advantages List */}
            <div className="grid md:grid-cols-2 gap-4">
              {EQUITIES.map((eq, eIdx) => (
                <div key={`eq-card-${eq.ticker}-${eIdx}`} className="bg-slate-900 border border-slate-800 p-5 rounded-2xl space-y-3">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-400 font-mono font-black text-xs">
                          {eq.ticker}
                        </span>
                        <h4 className="text-sm font-black text-white">{eq.name}</h4>
                      </div>
                      <span className="text-[10px] text-slate-400 mt-1 block">{eq.sector}</span>
                    </div>
                    <span className="text-xs font-mono font-bold text-emerald-400">{eq.growthYoY}</span>
                  </div>

                  <div className="bg-slate-950 p-3 rounded-xl border border-slate-800/80 text-[11px] text-slate-300 leading-relaxed">
                    <strong className="text-emerald-400">Partnership Advantage: </strong>
                    {eq.partnershipAdvantage}
                  </div>

                  <div className="flex items-center justify-between text-[11px] text-slate-400 pt-1">
                    <span>Held Stake: <strong className="text-white">{eq.currentStake}</strong></span>
                    <button
                      onClick={() => {
                        setSelectedEquity(eq.ticker);
                        window.scrollTo({ top: 0, behavior: "smooth" });
                      }}
                      className="text-emerald-400 hover:underline font-bold"
                    >
                      Increase Stake &rarr;
                    </button>
                  </div>
                </div>
              ))}
            </div>

          </div>
        )}

      </div>

      {/* Official Settlement / Purchase Certificate Modal */}
      <AnimatePresence>
        {successReceipt && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md"
          >
            <motion.div
              initial={{ scale: 0.95, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.95, y: 20 }}
              className="bg-slate-900 border border-emerald-500/40 rounded-3xl max-w-2xl w-full p-6 sm:p-8 shadow-2xl relative text-white space-y-6"
            >
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
                    <CheckCircle2 className="w-6 h-6" />
                  </div>
                  <div>
                    <h3 className="text-base sm:text-lg font-black uppercase tracking-tight text-white">{successReceipt.title}</h3>
                    <p className="text-[11px] text-emerald-400 font-mono">Status: {successReceipt.status || "EXECUTED & VERIFIED"}</p>
                  </div>
                </div>
                <button
                  onClick={() => setSuccessReceipt(null)}
                  className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Receipt Details Box */}
              <div className="bg-slate-950 p-5 rounded-2xl border border-slate-800 font-mono text-xs space-y-2.5">
                {Object.entries(successReceipt).map(([key, value], rIdx) => {
                  if (key === "title" || key === "type") return null;
                  return (
                    <div key={`receipt-${key}-${rIdx}`} className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-slate-900 pb-1.5 text-slate-300">
                      <span className="text-slate-500 uppercase text-[10px] tracking-wider">{key}:</span>
                      <span className="font-semibold text-white truncate max-w-sm">{String(value)}</span>
                    </div>
                  );
                })}
              </div>

              {/* Verification & Done */}
              <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-2">
                <div className="text-[11px] text-slate-400 flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4 text-emerald-400" />
                  <span>Permanent Immutable Record stored in Valourian Global Ledger.</span>
                </div>

                <button
                  onClick={() => {
                    toast.success("Receipt downloaded and archived.");
                    setSuccessReceipt(null);
                  }}
                  className="w-full sm:w-auto px-6 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-black uppercase tracking-wider transition-colors"
                >
                  Close & Continue
                </button>
              </div>

            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

    </div>
  );
}
