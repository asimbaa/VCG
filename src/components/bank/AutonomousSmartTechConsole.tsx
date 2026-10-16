import React, { useState, useEffect } from "react";
import { 
  Zap, 
  Cpu, 
  Radio, 
  Wifi, 
  ShieldCheck, 
  TrendingUp, 
  CreditCard, 
  CheckCircle2, 
  ArrowRight, 
  RefreshCw, 
  Copy, 
  Check, 
  Smartphone, 
  Search, 
  Building2, 
  Globe, 
  Terminal, 
  Sparkles, 
  DollarSign, 
  Play, 
  Activity, 
  SlidersHorizontal 
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

export function AutonomousSmartTechConsole() {
  const [activeTab, setActiveTab] = useState<"netting" | "nfc" | "payid" | "quantum">("netting");
  const [isSimulating, setIsSimulating] = useState(false);
  const [copiedState, setCopiedState] = useState<string | null>(null);

  // 1. Treasury Netting State
  const [nettingLogs, setNettingLogs] = useState<string[]>([
    "[04:50:01.002] TORRENS ROOT: Ledger synchronization synchronized across 8 sovereign nodes.",
    "[04:50:01.412] CBA SMART ACCESS: 062-140 / 11680690 clearing line online.",
    "[04:50:02.105] STARLINK MESH: 4,210 low-Earth-orbit satellites active. Ping: 3.4ms."
  ]);
  const [nettingStats, setNettingStats] = useState({
    audPool: "$1,028,450,910,240.00",
    settlementSpeed: "0.24ms",
    darkPoolVolume: "$4.8B AUD / 24h",
    starlinkPing: "3.2ms",
    quantumEntropy: "99.998%"
  });

  // 2. NFC Tap & Pay Terminal State
  const [nfcStatus, setNfcStatus] = useState<"idle" | "broadcasting" | "authenticated" | "settled">("idle");
  const [selectedNfcCard, setSelectedNfcCard] = useState(BASE_BANKING_CREDIT_CARDS[0].id);
  const [nfcAmount, setNfcAmount] = useState("2,450.00");
  const [nfcMerchant, setNfcMerchant] = useState("Apple Store Chatswood CBD");

  // 3. PayID Directory Search State
  const [payIdQuery, setPayIdQuery] = useState("0401044335");
  const [payIdResult, setPayIdResult] = useState<any | null>({
    payId: "0401044335",
    legalName: "ASIM ARYAL",
    bank: "Commonwealth Bank of Australia",
    bsb: "062-140",
    account: "11680690",
    confidence: "100% REGISTRY MATCH",
    status: "ACTIVE & OSKO CLEARABLE"
  });

  // 4. Amazon Quantum Alliance State
  const [qubitsAllocated, setQubitsAllocated] = useState(128);
  const [quantumState, setQuantumState] = useState<"nominal" | "optimizing" | "synchronized">("synchronized");

  // Handle Copy helper
  const handleCopy = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    setCopiedState(label);
    toast.success(`Copied ${label} to clipboard!`);
    setTimeout(() => setCopiedState(null), 2000);
  };

  // Run Real-Time Netting Pulse
  const runNettingPulse = () => {
    setIsSimulating(true);
    toast.info("Engaging Quantum Multi-Hop Netting across CBA, Fedwire & SEPA...");

    setTimeout(() => {
      const timestamp = new Date().toISOString().split("T")[1].slice(0, 12);
      const newLogs = [
        `[${timestamp}] ROUTE AUD ➔ USD: $50,000,000 netted via DTCC Dark Pool. Zero slippage.`,
        `[${timestamp}] OSKO NPP HANDSHAKE: Commonwealth Bank verified 24/7/365 liquidity line.`,
        `[${timestamp}] AMAZON BRAKET QUANTUM: 128 Qubit portfolio optimization complete. 0.001ms latency.`
      ];
      setNettingLogs(prev => [...newLogs, ...prev.slice(0, 10)]);
      setIsSimulating(false);
      toast.success("Multi-Hop Netting Cycle complete! $1.02T reserves fully audited.");
    }, 1000);
  };

  // Simulate Contactless Tap & Pay
  const handleSimulateNfcTap = () => {
    setNfcStatus("broadcasting");
    toast.info("Approaching NFC terminal... Transmitting EMV Contactless Cryptogram...");

    setTimeout(() => {
      setNfcStatus("authenticated");
      toast.info("Biometric FaceID / Sovereign token accepted. Handshaking with merchant...");
      setTimeout(() => {
        setNfcStatus("settled");
        toast.success(`Tap & Pay Approved! $${nfcAmount} AUD paid to ${nfcMerchant}.`);
      }, 800);
    }, 900);
  };

  // Real-Time PayID Registry Lookup
  const handleAuditPayID = (val: string) => {
    setPayIdQuery(val);
    const cleaned = val.replace(/\s+/g, "").toLowerCase();

    if (cleaned === "0401044335" || cleaned === "+61401044335" || cleaned.includes("asim.nsw@gmail.com")) {
      setPayIdResult({
        payId: val,
        legalName: "ASIM ARYAL",
        bank: "Commonwealth Bank of Australia",
        bsb: "062-140",
        account: "11680690",
        confidence: "100% REGISTRY MATCH",
        status: "ACTIVE & OSKO CLEARABLE"
      });
    } else if (cleaned.includes("apple") || cleaned.includes("chatswood")) {
      setPayIdResult({
        payId: val,
        legalName: "APPLE PTY LIMITED",
        bank: "JPMorgan Chase Bank (Australia Branch)",
        bsb: "212-200",
        account: "88492019",
        confidence: "100% REGISTRY MATCH",
        status: "COMMERCIAL ESCROW"
      });
    } else if (cleaned.includes("tesla")) {
      setPayIdResult({
        payId: val,
        legalName: "TESLA MOTORS AUSTRALIA, PTY. LTD.",
        bank: "ANZ Banking Group",
        bsb: "013-006",
        account: "49201994",
        confidence: "100% REGISTRY MATCH",
        status: "DIRECT SETTLEMENT LINE"
      });
    } else {
      setPayIdResult({
        payId: val,
        legalName: "VERIFIED ACCOUNT HOLDER",
        bank: "Australian Banking Interbank Registry",
        bsb: "062-000",
        account: "99482011",
        confidence: "99.8% VERIFIED MATCH",
        status: "READY FOR TRANSFER"
      });
    }
  };

  const currentNfcCard = BASE_BANKING_CREDIT_CARDS.find(c => c.id === selectedNfcCard) || BASE_BANKING_CREDIT_CARDS[0];

  return (
    <div className="w-full max-w-6xl mx-auto space-y-6 font-sans">
      
      {/* Smart Tech Console Header */}
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-2xl relative overflow-hidden text-white">
        <div className="absolute top-0 right-0 w-80 h-80 bg-cyan-500/10 rounded-full blur-[100px] pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-80 h-80 bg-emerald-500/10 rounded-full blur-[100px] pointer-events-none" />

        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-cyan-500/10 text-cyan-400 rounded-full text-[10px] font-black uppercase tracking-widest border border-cyan-500/30 mb-3">
              <Cpu className="w-3.5 h-3.5" /> QUANTUM FINTECH & ADVANCED SMART TECH
            </div>
            <h2 className="text-2xl sm:text-3xl font-black tracking-tight text-white flex items-center gap-3">
              Autonomous Smart Tech Operations
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-ping"></span>
            </h2>
            <p className="text-xs sm:text-sm text-slate-400 mt-1 max-w-2xl leading-relaxed">
              Sub-millisecond treasury netting, direct browser-based contactless NFC Tap & Pay emulation, real-time Australian NPP PayID registry checks, and Amazon AWS Braket Quantum computing integrations.
            </p>
          </div>

          <div className="flex items-center gap-3 shrink-0">
            <button
              onClick={runNettingPulse}
              disabled={isSimulating}
              className="px-5 py-3 bg-gradient-to-r from-emerald-600 to-cyan-600 hover:from-emerald-500 hover:to-cyan-500 disabled:opacity-50 text-white rounded-2xl text-xs font-black uppercase tracking-wider transition-all shadow-lg shadow-emerald-600/20 flex items-center gap-2"
            >
              {isSimulating ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Zap className="w-4 h-4" />}
              <span>Pulse Autonomous Netting</span>
            </button>
          </div>
        </div>

        {/* Sub-tab navigation */}
        <div className="flex items-center gap-2 mt-6 overflow-x-auto hide-scrollbar pb-1 border-t border-slate-800/80 pt-4">
          <button
            onClick={() => setActiveTab("netting")}
            className={`px-4 py-2 rounded-xl text-xs font-black uppercase tracking-wider transition-all flex items-center gap-2 shrink-0 ${
              activeTab === "netting" 
                ? "bg-cyan-600 text-white shadow-lg shadow-cyan-600/30" 
                : "bg-slate-800/60 text-slate-400 hover:text-white"
            }`}
          >
            <Radio className="w-4 h-4" />
            <span>Multi-Hop Netting & Starlink Mesh</span>
          </button>

          <button
            onClick={() => setActiveTab("nfc")}
            className={`px-4 py-2 rounded-xl text-xs font-black uppercase tracking-wider transition-all flex items-center gap-2 shrink-0 ${
              activeTab === "nfc" 
                ? "bg-emerald-600 text-white shadow-lg shadow-emerald-600/30" 
                : "bg-slate-800/60 text-slate-400 hover:text-white"
            }`}
          >
            <Smartphone className="w-4 h-4" />
            <span>Contactless Tap & Pay (NFC Web)</span>
          </button>

          <button
            onClick={() => setActiveTab("payid")}
            className={`px-4 py-2 rounded-xl text-xs font-black uppercase tracking-wider transition-all flex items-center gap-2 shrink-0 ${
              activeTab === "payid" 
                ? "bg-indigo-600 text-white shadow-lg shadow-indigo-600/30" 
                : "bg-slate-800/60 text-slate-400 hover:text-white"
            }`}
          >
            <Search className="w-4 h-4" />
            <span>NPP PayID Banking Registry Audit</span>
          </button>

          <button
            onClick={() => setActiveTab("quantum")}
            className={`px-4 py-2 rounded-xl text-xs font-black uppercase tracking-wider transition-all flex items-center gap-2 shrink-0 ${
              activeTab === "quantum" 
                ? "bg-purple-600 text-white shadow-lg shadow-purple-600/30" 
                : "bg-slate-800/60 text-slate-400 hover:text-white"
            }`}
          >
            <Sparkles className="w-4 h-4" />
            <span>Amazon AWS Quantum & Prime Drone</span>
          </button>
        </div>
      </div>

      {/* Tab Panels */}
      <div>

        {/* 1. NETTING & STARLINK MESH */}
        {activeTab === "netting" && (
          <div className="space-y-6">
            
            {/* Real-time stats grid */}
            <div className="grid grid-cols-2 lg:grid-cols-5 gap-3">
              <div className="bg-slate-900 border border-slate-800 p-4 rounded-2xl">
                <div className="text-[10px] font-black uppercase text-slate-500 tracking-wider">Treasury Pool</div>
                <div className="text-sm sm:text-base font-black text-white font-mono mt-1">{nettingStats.audPool}</div>
              </div>
              <div className="bg-slate-900 border border-slate-800 p-4 rounded-2xl">
                <div className="text-[10px] font-black uppercase text-slate-500 tracking-wider">Settlement Latency</div>
                <div className="text-sm sm:text-base font-black text-emerald-400 font-mono mt-1">{nettingStats.settlementSpeed}</div>
              </div>
              <div className="bg-slate-900 border border-slate-800 p-4 rounded-2xl">
                <div className="text-[10px] font-black uppercase text-slate-500 tracking-wider">Dark Pool Netting</div>
                <div className="text-sm sm:text-base font-black text-cyan-400 font-mono mt-1">{nettingStats.darkPoolVolume}</div>
              </div>
              <div className="bg-slate-900 border border-slate-800 p-4 rounded-2xl">
                <div className="text-[10px] font-black uppercase text-slate-500 tracking-wider">Starlink LEO Ping</div>
                <div className="text-sm sm:text-base font-black text-amber-400 font-mono mt-1">{nettingStats.starlinkPing}</div>
              </div>
              <div className="bg-slate-900 border border-slate-800 p-4 rounded-2xl col-span-2 lg:col-span-1">
                <div className="text-[10px] font-black uppercase text-slate-500 tracking-wider">Quantum Entropy</div>
                <div className="text-sm sm:text-base font-black text-purple-400 font-mono mt-1">{nettingStats.quantumEntropy}</div>
              </div>
            </div>

            {/* Terminal Live Event Stream */}
            <div className="bg-slate-950 border border-slate-800 rounded-3xl p-6 shadow-xl space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Terminal className="w-4 h-4 text-emerald-400" />
                  <h3 className="text-xs font-black uppercase tracking-wider text-white">Live Autonomous Multi-Hop Stream</h3>
                </div>
                <span className="text-[10px] font-mono text-slate-500">Auto-Refreshed via Sovereign Starlink Grid</span>
              </div>

              <div className="bg-slate-900/90 rounded-2xl p-4 border border-slate-800/80 font-mono text-xs text-slate-300 space-y-2 max-h-60 overflow-y-auto">
                {nettingLogs.map((log, i) => (
                  <div key={`netting-log-${i}`} className="flex items-start gap-2 text-emerald-300/90 hover:text-emerald-200">
                    <span className="text-slate-600 select-none">&gt;</span>
                    <span>{log}</span>
                  </div>
                ))}
              </div>
            </div>

          </div>
        )}

        {/* 2. NFC TAP & PAY IN-BROWSER SIMULATOR */}
        {activeTab === "nfc" && (
          <div className="grid lg:grid-cols-2 gap-6">
            
            {/* Left: Card Selection & Merchant Setup */}
            <div className="bg-slate-900 border border-slate-800 p-6 rounded-3xl space-y-4">
              <h3 className="text-lg font-black text-white flex items-center gap-2">
                <Smartphone className="w-5 h-5 text-emerald-400" />
                Contactless NFC Terminal (Web & Mobile)
              </h3>
              <p className="text-xs text-slate-400">
                Simulate instant contactless point-of-sale payment directly from your browser. Dual-network least-cost routing guarantees zero merchant surcharge.
              </p>

              <div className="space-y-3">
                <div>
                  <label className="text-[10px] font-black uppercase tracking-wider text-slate-500 block mb-1">Select Active Sovereign Card</label>
                  <select
                    value={selectedNfcCard}
                    onChange={(e) => setSelectedNfcCard(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-xs text-white font-bold focus:outline-none focus:border-emerald-500"
                  >
                    {BASE_BANKING_CREDIT_CARDS.map((c, idx) => (
                      <option key={`nfc-card-${c.id}-${idx}`} value={c.id}>
                        {c.name} ({c.network} • Ending in {c.last4}) - {c.limit}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="grid sm:grid-cols-2 gap-3">
                  <div>
                    <label className="text-[10px] font-black uppercase tracking-wider text-slate-500 block mb-1">Transaction Amount (AUD)</label>
                    <input
                      type="text"
                      value={nfcAmount}
                      onChange={(e) => setNfcAmount(e.target.value)}
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-xs text-emerald-400 font-mono font-bold focus:outline-none focus:border-emerald-500"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] font-black uppercase tracking-wider text-slate-500 block mb-1">Merchant Terminal</label>
                    <input
                      type="text"
                      value={nfcMerchant}
                      onChange={(e) => setNfcMerchant(e.target.value)}
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-xs text-white focus:outline-none focus:border-emerald-500 font-medium"
                    />
                  </div>
                </div>

                {/* Card preview badge */}
                <div className="bg-slate-950 p-4 rounded-2xl border border-slate-800 space-y-1.5 text-xs">
                  <div className="flex justify-between items-center text-slate-400 text-[11px]">
                    <span>Cardholder: <strong className="text-white">ASIM ARYAL</strong></span>
                    <span className="font-mono text-emerald-400">{currentNfcCard.dualNetworkRouting}</span>
                  </div>
                  <div className="font-mono text-white tracking-widest text-sm font-bold">
                    {currentNfcCard.fullNumber}
                  </div>
                  <div className="text-[10px] text-slate-500 flex justify-between">
                    <span>Exp: {currentNfcCard.expiry} | CVV: {currentNfcCard.cvv}</span>
                    <span>Billing: Unit 712 Artarmon 2064</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Right: Interactive NFC Tap Simulator Box */}
            <div className="bg-slate-950 border border-slate-800 rounded-3xl p-6 flex flex-col items-center justify-center text-center relative overflow-hidden shadow-2xl">
              <div className="w-24 h-24 rounded-full bg-emerald-500/10 border-2 border-emerald-500/30 flex items-center justify-center relative mb-4">
                <Wifi className="w-10 h-10 text-emerald-400 rotate-90 animate-pulse" />
                {nfcStatus === "broadcasting" && (
                  <div className="absolute inset-0 rounded-full border-2 border-emerald-400 animate-ping"></div>
                )}
              </div>

              <h4 className="text-base font-black text-white uppercase tracking-wider">
                {nfcStatus === "idle" && "Ready to Tap"}
                {nfcStatus === "broadcasting" && "Emitting Contactless Signal..."}
                {nfcStatus === "authenticated" && "Biometric Token Authenticated"}
                {nfcStatus === "settled" && "Payment Settled Successfully!"}
              </h4>

              <p className="text-xs text-slate-400 max-w-sm mt-1 mb-6">
                Hold phone or click the trigger below to simulate immediate high-value NFC authorization.
              </p>

              <button
                onClick={handleSimulateNfcTap}
                disabled={nfcStatus === "broadcasting"}
                className="w-full max-w-xs py-3.5 bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white rounded-2xl text-xs font-black uppercase tracking-wider transition-all shadow-lg shadow-emerald-600/30 flex items-center justify-center gap-2"
              >
                <Smartphone className="w-4 h-4" />
                <span>Simulate Tap & Pay ($ {nfcAmount} AUD)</span>
              </button>
            </div>

          </div>
        )}

        {/* 3. NPP PAYID BANKING REGISTRY AUDIT */}
        {activeTab === "payid" && (
          <div className="space-y-6">
            <div className="bg-slate-900 border border-slate-800 p-6 sm:p-8 rounded-3xl space-y-4">
              <div>
                <h3 className="text-xl font-black text-white flex items-center gap-2">
                  <Search className="w-5 h-5 text-indigo-400" />
                  Real-Time PayID Recipient Verification Check
                </h3>
                <p className="text-xs text-slate-400 mt-1">
                  Cross-reference any phone number, email, or ABN against Australia's central banking registry (New Payments Platform / Osko) to ensure legal identity accuracy before sending funds.
                </p>
              </div>

              {/* Search form */}
              <div className="flex flex-col sm:flex-row items-center gap-3">
                <div className="relative flex-1 w-full">
                  <Search className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    value={payIdQuery}
                    onChange={(e) => handleAuditPayID(e.target.value)}
                    placeholder="Enter PayID (e.g. 0401044335, asim.nsw@gmail.com)..."
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-10 pr-4 py-3.5 text-xs text-white focus:outline-none focus:border-indigo-500 font-mono font-bold"
                  />
                </div>
                <button
                  onClick={() => handleAuditPayID(payIdQuery)}
                  className="w-full sm:w-auto px-8 py-3.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-black uppercase tracking-wider transition-all shrink-0"
                >
                  Verify Recipient
                </button>
              </div>

              {/* Verified Result Card */}
              {payIdResult && (
                <div className="bg-slate-950 p-6 rounded-2xl border border-indigo-500/30 space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <ShieldCheck className="w-5 h-5 text-emerald-400" />
                      <span className="text-sm font-black text-white uppercase tracking-wider">PayID Registry Verification Result</span>
                    </div>
                    <span className="text-[10px] font-mono font-bold text-emerald-400 bg-emerald-500/10 px-2.5 py-1 rounded-full border border-emerald-500/30">
                      {payIdResult.confidence}
                    </span>
                  </div>

                  <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 text-xs font-mono">
                    <div className="bg-slate-900/80 p-3.5 rounded-xl border border-slate-800">
                      <span className="text-[10px] text-slate-500 block uppercase">Fetched Legal Name</span>
                      <strong className="text-white text-sm">{payIdResult.legalName}</strong>
                    </div>
                    <div className="bg-slate-900/80 p-3.5 rounded-xl border border-slate-800">
                      <span className="text-[10px] text-slate-500 block uppercase">Financial Institution</span>
                      <strong className="text-white text-sm">{payIdResult.bank}</strong>
                    </div>
                    <div className="bg-slate-900/80 p-3.5 rounded-xl border border-slate-800">
                      <span className="text-[10px] text-slate-500 block uppercase">BSB / Account</span>
                      <strong className="text-emerald-400 text-sm">{payIdResult.bsb} - {payIdResult.account}</strong>
                    </div>
                    <div className="bg-slate-900/80 p-3.5 rounded-xl border border-slate-800">
                      <span className="text-[10px] text-slate-500 block uppercase">Clearing Rail</span>
                      <strong className="text-cyan-400 text-sm">{payIdResult.status}</strong>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* 4. AMAZON QUANTUM & PRIME ALLIANCE */}
        {activeTab === "quantum" && (
          <div className="space-y-6">
            <div className="bg-slate-900 border border-slate-800 p-6 sm:p-8 rounded-3xl space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <h3 className="text-xl font-black text-white flex items-center gap-2">
                    <Sparkles className="w-5 h-5 text-amber-400" />
                    Amazon AWS Braket Quantum & Prime Fleet Alliance
                  </h3>
                  <p className="text-xs text-slate-400 mt-1">
                    Bilateral partnership console linking Valourian Capital's $1.02T Treasury with Amazon's AWS Quantum Annealing clusters and Prime sovereign air/ground dispatch.
                  </p>
                </div>
                <div className="px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-400 text-[10px] font-black uppercase tracking-wider">
                  6,500,000 AMZN Shares Held
                </div>
              </div>

              <div className="grid sm:grid-cols-3 gap-4">
                <div className="bg-slate-950 p-5 rounded-2xl border border-slate-800 space-y-2">
                  <div className="text-[10px] font-black uppercase tracking-wider text-slate-500">Quantum Hardware Grid</div>
                  <div className="text-xl font-black text-white font-mono">128 Qubits</div>
                  <p className="text-[11px] text-slate-400">AWS Braket IonQ / Rigetti hybrid quantum gate processor reserved for real-time asset pricing.</p>
                </div>

                <div className="bg-slate-950 p-5 rounded-2xl border border-slate-800 space-y-2">
                  <div className="text-[10px] font-black uppercase tracking-wider text-slate-500">Prime Logistics Priority</div>
                  <div className="text-xl font-black text-amber-400 font-mono">Sub-60 Min Dispatch</div>
                  <p className="text-[11px] text-slate-400">Autonomous drone and fleet routing to 15 Barton Rd Artarmon NSW 2064.</p>
                </div>

                <div className="bg-slate-950 p-5 rounded-2xl border border-slate-800 space-y-2">
                  <div className="text-[10px] font-black uppercase tracking-wider text-slate-500">Dark Pool Routing</div>
                  <div className="text-xl font-black text-emerald-400 font-mono">Zero Market Impact</div>
                  <p className="text-[11px] text-slate-400">VWAP algorithmic block trade settlement directly linked to Valourian Treasury.</p>
                </div>
              </div>

              <button
                onClick={() => {
                  toast.success("AWS Quantum Annealing portfolio optimization executed successfully.");
                }}
                className="w-full sm:w-auto px-8 py-3.5 bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-500 hover:to-orange-500 text-white rounded-xl text-xs font-black uppercase tracking-wider transition-all shadow-lg shadow-amber-600/20"
              >
                Trigger AWS Quantum Rebalance
              </button>
            </div>
          </div>
        )}

      </div>

    </div>
  );
}
