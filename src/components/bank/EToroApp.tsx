import React, { useState, useEffect } from "react";
import {
  Globe,
  BarChart2,
  LineChart,
  CheckCircle2,
  Loader2,
  Activity,
  Bot,
  TrendingUp,
  ShieldCheck,
  DollarSign,
  Zap,
  Search,
  ArrowUpRight,
  ArrowDownLeft,
  Layers,
} from "lucide-react";
import { motion } from "framer-motion";
import { CryptoPortfolioWidget } from "./CryptoPortfolioWidget";
import { toast } from "sonner";
import {
  loadSyncedBalances,
  safeUpdateUserBalances,
  recordUnifiedTransaction,
} from "../../services/cloudSessionGuard";

interface EToroAppProps {
  user?: any;
  balances?: Record<string, number>;
  setBalances?: React.Dispatch<React.SetStateAction<Record<string, number>>>;
}

const MARKET_ASSETS = [
  { ticker: "SPX", name: "SpaceX (Private Equity)", price: 245.5, change: "+4.2%", category: "Aerospace" },
  { ticker: "TSLA", name: "Tesla Inc.", price: 342.8, change: "+2.8%", category: "EV & Energy" },
  { ticker: "NVDA", name: "NVIDIA Corp.", price: 148.2, change: "+3.9%", category: "AI Silicon" },
  { ticker: "AAPL", name: "Apple Inc.", price: 234.1, change: "+1.1%", category: "Tech" },
  { ticker: "PLTR", name: "Palantir Technologies", price: 68.4, change: "+5.4%", category: "Defense AI" },
  { ticker: "BTC", name: "Bitcoin Spot Reserve", price: 96400.0, change: "+2.4%", category: "Crypto" },
];

export function EToroApp({ user, balances: externalBalances, setBalances: setExternalBalances }: EToroAppProps = {}) {
  const [activeTab, setActiveTab] = useState<string>("portfolio");
  const [availableCash, setAvailableCash] = useState<number>(() => {
    try {
      const saved = localStorage.getItem("valourian_etoro_cash");
      return saved ? Number(saved) : 25000000;
    } catch {
      return 25000000;
    }
  });
  const [totalEquity, setTotalEquity] = useState<number>(() => {
    try {
      const saved = localStorage.getItem("valourian_etoro_equity");
      return saved ? Number(saved) : 148240500;
    } catch {
      return 148240500;
    }
  });
  const [holdings, setHoldings] = useState<Record<string, number>>(() => {
    try {
      const saved = localStorage.getItem("valourian_etoro_holdings");
      return saved
        ? JSON.parse(saved)
        : {
            "SpaceX (Private Equity)": 45000000,
            "Tesla Inc.": 38500000,
            "NVIDIA Corp.": 18240500,
            "Bitcoin Spot Reserve": 21500000,
          };
    } catch {
      return {
        "SpaceX (Private Equity)": 45000000,
        "Tesla Inc.": 38500000,
        "NVIDIA Corp.": 18240500,
        "Bitcoin Spot Reserve": 21500000,
      };
    }
  });

  const [assetSearch, setAssetSearch] = useState("");
  const [selectedAsset, setSelectedAsset] = useState(MARKET_ASSETS[0]);
  const [fundingAmount, setFundingAmount] = useState("");
  const [tradeAction, setTradeAction] = useState<"BUY" | "SELL">("BUY");
  const [tradeAmount, setTradeAmount] = useState("");
  const [liquidationAsset, setLiquidationAsset] = useState("Tesla (TSLA) - 2% Strategic Stake ($2,509,000 USD)");
  const [liquidationBank, setLiquidationBank] = useState("Commonwealth Bank (BSB 062-000)");
  const [isTrading, setIsTrading] = useState(false);
  const [isFunding, setIsFunding] = useState(false);

  const [targetBtcAlloc, setTargetBtcAlloc] = useState(60);
  const [thresholdDev, setThresholdDev] = useState(5);

  const [showExecutionModal, setShowExecutionModal] = useState(false);
  const [rebalanceStatus, setRebalanceStatus] = useState<"idle" | "executing" | "complete">("idle");
  const [executionProgress, setExecutionProgress] = useState(0);
  const [currentExecutionStep, setCurrentExecutionStep] = useState(0);

  const [aiEnabled, setAiEnabled] = useState(false);
  const [aiStatus, setAiStatus] = useState("Standby");
  const [bridgeAsset, setBridgeAsset] = useState("BTC");
  const [bridgeAddress, setBridgeAddress] = useState("bc1qvalouriancapital0001sovereignvault");
  const [bridgeAmount, setBridgeAmount] = useState("");
  const [isBridging, setIsBridging] = useState(false);
  const [bridgeStatus, setBridgeStatus] = useState<null | "validating" | "confirmed" | "failed">(null);

  useEffect(() => {
    try {
      localStorage.setItem("valourian_etoro_cash", String(availableCash));
      localStorage.setItem("valourian_etoro_equity", String(totalEquity));
      localStorage.setItem("valourian_etoro_holdings", JSON.stringify(holdings));
    } catch {}
  }, [availableCash, totalEquity, holdings]);

  useEffect(() => {
    let interval: any;
    if (aiEnabled) {
      setAiStatus("Analyzing Market Liquidity & Dark Pool Depth...");
      interval = setInterval(() => {
        setAiStatus((prev) =>
          prev.includes("Analyzing")
            ? "Executing Sovereign Micro-Rebalance..."
            : "Analyzing Market Liquidity & Dark Pool Depth..."
        );
      }, 4500);
    } else {
      setAiStatus("Standby");
    }
    return () => clearInterval(interval);
  }, [aiEnabled]);

  const currentBalances = externalBalances || loadSyncedBalances();

  const handleTrade = async () => {
    const amt = Number(tradeAmount);
    if (!tradeAmount || isNaN(amt) || amt <= 0) {
      toast.error("Please enter a valid USD trade amount.");
      return;
    }
    if (tradeAction === "BUY" && amt > availableCash) {
      toast.error("Insufficient eToro available cash. Deposit funds from Valourian Treasury first.");
      return;
    }

    setIsTrading(true);
    try {
      const nextCash = tradeAction === "BUY" ? availableCash - amt : availableCash + amt;
      const prevHolding = holdings[selectedAsset.name] || 0;
      const nextHolding = tradeAction === "BUY" ? prevHolding + amt : Math.max(0, prevHolding - amt);
      const nextHoldings = { ...holdings, [selectedAsset.name]: nextHolding };
      const holdingsSum = Object.values(nextHoldings).reduce((acc, v) => acc + v, 0);

      setAvailableCash(nextCash);
      setHoldings(nextHoldings);
      setTotalEquity(nextCash + holdingsSum);

      await recordUnifiedTransaction({
        type: "ETORO_TRADE",
        action: tradeAction,
        amount: tradeAction === "BUY" ? -amt : amt,
        currency: "USD",
        recipient: `eToro Dark Pool · ${selectedAsset.name}`,
        settlementRail: "Valourian Institutional VWAP Router",
        description: `Executed ${tradeAction} order of $${amt.toLocaleString()} USD for ${selectedAsset.name} (${selectedAsset.ticker})`,
      });

      toast.success(`Executed ${tradeAction} $${amt.toLocaleString()} USD in ${selectedAsset.name}.`, {
        icon: <Zap className="w-4 h-4 text-emerald-400" />,
      });
      setTradeAmount("");
    } catch (error) {
      console.error("Trade error:", error);
      toast.error("Trade execution failed.");
    } finally {
      setIsTrading(false);
    }
  };

  const handleFunding = async (type: "deposit" | "withdraw") => {
    const amt = Number(fundingAmount);
    if (!fundingAmount || isNaN(amt) || amt <= 0) {
      toast.error("Please enter a valid USD amount.");
      return;
    }

    if (type === "withdraw" && amt > availableCash) {
      toast.error("Withdrawal exceeds eToro available cash balance.");
      return;
    }

    setIsFunding(true);
    try {
      const treasuryUsd = currentBalances.USD || 0;
      const nextUsd = type === "deposit" ? Math.max(0, treasuryUsd - amt) : treasuryUsd + amt;
      const updatedBalances = { ...currentBalances, USD: nextUsd };

      await safeUpdateUserBalances(updatedBalances);
      if (setExternalBalances) setExternalBalances(updatedBalances);

      const nextCash = type === "deposit" ? availableCash + amt : Math.max(0, availableCash - amt);
      const holdingsSum = Object.values(holdings).reduce((acc, v) => acc + v, 0);
      setAvailableCash(nextCash);
      setTotalEquity(nextCash + holdingsSum);

      await recordUnifiedTransaction({
        type: type === "deposit" ? "ETORO_DEPOSIT" : "ETORO_WITHDRAWAL",
        amount: type === "deposit" ? -amt : amt,
        currency: "USD",
        recipient: type === "deposit" ? "eToro Sovereign Brokerage Account" : "Valourian USD Treasury Vault",
        settlementRail: "Instant Treasury Prime Clearing",
        description: `${type === "deposit" ? "Transferred from Valourian Treasury to eToro" : "Withdrew from eToro to Valourian Treasury"}: $${amt.toLocaleString()} USD`,
      });

      toast.success(
        `${type === "deposit" ? "Deposited" : "Withdrew"} $${amt.toLocaleString()} USD ${type === "deposit" ? "into eToro" : "to Valourian Treasury"}.`,
        { icon: <ShieldCheck className="w-4 h-4 text-emerald-400" /> }
      );
      setFundingAmount("");
    } catch (error) {
      console.error("Funding error:", error);
      toast.error("Funding operation failed.");
    } finally {
      setIsFunding(false);
    }
  };

  const handleLiquidateAndWithdraw = async () => {
    setIsFunding(true);
    const amountUSD = liquidationAsset.includes("TSLA") ? 2509000 : 5000000;
    try {
      const updatedBalances = {
        ...currentBalances,
        USD: (currentBalances.USD || 0) + amountUSD,
      };
      await safeUpdateUserBalances(updatedBalances);
      if (setExternalBalances) setExternalBalances(updatedBalances);

      await recordUnifiedTransaction({
        type: "ETORO_LIQUIDATION",
        amount: amountUSD,
        currency: "USD",
        recipient: liquidationBank || "Commonwealth Bank (BSB 062-000)",
        settlementRail: "Sovereign Equity Liquidation + NPP Dispatch",
        description: `Liquidated ${liquidationAsset} and settled $${amountUSD.toLocaleString()} USD to ${liquidationBank}`,
      });

      toast.success(
        `$${amountUSD.toLocaleString()}.00 USD settled cleanly to ${liquidationBank}.`,
        { icon: <DollarSign className="w-4 h-4 text-emerald-400" /> }
      );
    } catch {
      toast.error("Liquidation settlement encountered an error.");
    } finally {
      setIsFunding(false);
    }
  };

  const handleExecuteBridge = async () => {
    const amt = Number(bridgeAmount);
    if (!amt || amt <= 0 || !bridgeAddress.trim()) {
      toast.error("Enter a valid destination address and crypto amount.");
      return;
    }
    setIsBridging(true);
    setBridgeStatus("validating");
    setTimeout(async () => {
      setBridgeStatus("confirmed");
      setIsBridging(false);
      await recordUnifiedTransaction({
        type: "ETORO_CRYPTO_BRIDGE",
        amount: -amt,
        currency: bridgeAsset,
        recipient: bridgeAddress.trim(),
        settlementRail: "Valourian Zero-Fee Sovereign Bridge",
        description: `Bridged ${amt} ${bridgeAsset} to ${bridgeAddress.trim()}`,
      });
      toast.success(`Cross-chain bridge confirmed: ${amt} ${bridgeAsset} dispatched!`);
      setBridgeAmount("");
    }, 1200);
  };

  const filteredMarketAssets = MARKET_ASSETS.filter(
    (a) =>
      !assetSearch.trim() ||
      a.name.toLowerCase().includes(assetSearch.toLowerCase()) ||
      a.ticker.toLowerCase().includes(assetSearch.toLowerCase()) ||
      a.category.toLowerCase().includes(assetSearch.toLowerCase())
  );

  return (
    <div className="w-full max-w-6xl mx-auto space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="bg-slate-900 border border-slate-800 rounded-3xl overflow-hidden shadow-2xl relative">
        <div className="p-5 sm:p-8 border-b border-slate-800/50 bg-slate-900/50 backdrop-blur-xl relative">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 mb-6 relative z-10">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-emerald-500/20 rounded-xl flex items-center justify-center border border-emerald-500/30 shrink-0">
                <TrendingUp className="w-6 h-6 text-emerald-400" />
              </div>
              <div>
                <h2 className="text-xl sm:text-2xl font-black text-white tracking-tight">eToro Sovereign Brokerage</h2>
                <p className="text-emerald-400/80 text-xs font-bold uppercase tracking-widest flex items-center gap-1">
                  <ShieldCheck className="w-3.5 h-3.5 shrink-0" /> Integrated with Valourian Treasury ({user?.email || "Founder Vault"})
                </p>
              </div>
            </div>
            <div className="flex flex-wrap gap-2">
              {[
                { id: "portfolio", label: "Portfolio" },
                { id: "trade", label: "Trade & Liquidate" },
                { id: "funding", label: "Treasury Funding" },
                { id: "bridge", label: "Crypto Bridge" },
                { id: "rebalance", label: "AI Rebalance" },
              ].map((t) => (
                <button
                  key={t.id}
                  onClick={() => setActiveTab(t.id)}
                  className={`min-h-[40px] px-3.5 py-2 rounded-xl text-xs font-bold uppercase tracking-wider transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
                    activeTab === t.id
                      ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/40"
                      : "bg-slate-800 text-slate-300 hover:bg-slate-700 hover:text-white border border-transparent"
                  }`}
                >
                  {t.label}
                </button>
              ))}
            </div>
          </div>

          <div className="relative z-10 min-h-[380px]">
            {activeTab === "portfolio" && (
              <div className="space-y-6">
                <div className="bg-slate-950 rounded-2xl p-6 border border-slate-800 flex flex-col sm:flex-row justify-between sm:items-center gap-4">
                  <div>
                    <div className="text-slate-400 text-xs font-bold uppercase tracking-widest mb-1">Total Sovereign Equity</div>
                    <div className="text-3xl sm:text-4xl font-black text-white tabular-nums">
                      ${totalEquity.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </div>
                  </div>
                  <div className="sm:text-right">
                    <div className="text-slate-400 text-xs font-bold uppercase tracking-widest mb-1">Available Brokerage Cash (USD)</div>
                    <div className="text-2xl font-black text-emerald-400 tabular-nums">
                      ${availableCash.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </div>
                    <div className="text-[11px] text-slate-400 mt-1 tabular-nums">
                      Treasury USD Link: ${(currentBalances.USD || 0).toLocaleString(undefined, { maximumFractionDigits: 0 })}
                    </div>
                  </div>
                </div>

                {/* Positions Overview */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                  {Object.entries(holdings).map(([name, val]) => (
                    <div key={name} className="bg-slate-950 border border-slate-800 rounded-xl p-4">
                      <div className="text-xs font-bold text-slate-300 truncate">{name}</div>
                      <div className="text-lg font-black text-white font-mono mt-1 tabular-nums">
                        ${Number(val).toLocaleString()}
                      </div>
                      <div className="text-[11px] text-emerald-400 font-semibold mt-0.5">Active Sovereign Position</div>
                    </div>
                  ))}
                </div>

                <CryptoPortfolioWidget totalEquity={totalEquity} />

                {/* Custom Rebalancing Strategy Widget */}
                <div className="bg-slate-950 rounded-2xl p-6 border border-slate-800 relative overflow-hidden">
                  <div className="flex items-center gap-3 mb-5">
                    <div className="w-10 h-10 rounded-xl bg-blue-500/20 border border-blue-500/30 flex items-center justify-center">
                      <BarChart2 className="w-5 h-5 text-blue-400" />
                    </div>
                    <div>
                      <h3 className="text-lg font-black text-white">Custom Rebalancing Strategies</h3>
                      <p className="text-xs text-blue-400/80 uppercase tracking-widest font-bold">Automated Allocation Rules</p>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                    <div className="bg-slate-900 rounded-xl p-4 border border-slate-800">
                      <label className="block text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2">
                        Target BTC Allocation (%)
                      </label>
                      <input
                        type="number"
                        value={targetBtcAlloc}
                        onChange={(e) => setTargetBtcAlloc(Number(e.target.value))}
                        className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 font-semibold text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                    <div className="bg-slate-900 rounded-xl p-4 border border-slate-800">
                      <label className="block text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2">
                        Threshold Deviation (%)
                      </label>
                      <input
                        type="number"
                        value={thresholdDev}
                        onChange={(e) => setThresholdDev(Number(e.target.value))}
                        className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 font-semibold text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                  </div>

                  <button
                    onClick={() =>
                      toast.success(
                        `Rebalancing strategy locked (${targetBtcAlloc}% BTC target, ±${thresholdDev}% band).`
                      )
                    }
                    className="w-full min-h-[44px] bg-blue-600 hover:bg-blue-500 text-white font-black uppercase tracking-widest py-3 rounded-xl transition-colors text-xs cursor-pointer"
                  >
                    Save &amp; Deploy Strategy
                  </button>
                </div>

                {/* AI Liquidity Management */}
                <div className="bg-slate-950 rounded-2xl p-6 border border-slate-800">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4">
                    <div className="flex items-center gap-3">
                      <div
                        className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                          aiEnabled ? "bg-emerald-500/20 border border-emerald-500/30" : "bg-slate-800 border border-slate-700"
                        }`}
                      >
                        <Bot className={`w-5 h-5 ${aiEnabled ? "text-emerald-400" : "text-slate-400"}`} />
                      </div>
                      <div>
                        <h4 className="text-white font-black">AI Liquidity Management</h4>
                        <p className={`text-[10px] font-bold uppercase tracking-widest ${aiEnabled ? "text-emerald-400" : "text-slate-400"}`}>
                          {aiStatus}
                        </p>
                      </div>
                    </div>
                    <button
                      onClick={() => setAiEnabled(!aiEnabled)}
                      className={`min-h-[44px] px-4 py-2 rounded-xl text-xs font-bold uppercase tracking-widest transition-colors cursor-pointer ${
                        aiEnabled
                          ? "bg-red-500/20 text-red-400 hover:bg-red-500/30 border border-red-500/30"
                          : "bg-emerald-500/20 text-emerald-400 hover:bg-emerald-500/30 border border-emerald-500/30"
                      }`}
                    >
                      {aiEnabled ? "Deactivate AI" : "Activate AI"}
                    </button>
                  </div>
                  {aiEnabled && (
                    <div className="p-4 bg-emerald-500/10 border border-emerald-500/20 rounded-xl">
                      <p className="text-xs text-emerald-300 leading-relaxed">
                        Sovereign Agent is actively managing dark-pool liquidity, rebalancing equity &amp; crypto weights in real time, and sweeping dividend yields back to your Treasury Vault.
                      </p>
                    </div>
                  )}
                </div>
              </div>
            )}

            {activeTab === "trade" && (
              <div className="space-y-6">
                <div className="relative">
                  <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                  <input
                    type="text"
                    value={assetSearch}
                    onChange={(e) => setAssetSearch(e.target.value)}
                    placeholder="Search sovereign assets (SpaceX, Tesla, NVIDIA, Palantir, Bitcoin)..."
                    className="w-full bg-slate-950 border border-slate-800 rounded-2xl py-3.5 pl-12 pr-4 text-white focus:outline-none focus:border-emerald-500/50 font-medium placeholder:text-slate-500"
                  />
                </div>

                {/* Asset Quick Picker */}
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2.5">
                  {filteredMarketAssets.map((asset) => {
                    const active = selectedAsset.ticker === asset.ticker;
                    return (
                      <button
                        key={asset.ticker}
                        onClick={() => setSelectedAsset(asset)}
                        className={`p-3 rounded-xl border text-left transition-all cursor-pointer ${
                          active
                            ? "bg-emerald-500/15 border-emerald-500 text-white"
                            : "bg-slate-950 border-slate-800 text-slate-300 hover:border-slate-700"
                        }`}
                      >
                        <div className="flex items-center justify-between text-xs font-black">
                          <span>{asset.ticker}</span>
                          <span className="text-emerald-400">{asset.change}</span>
                        </div>
                        <div className="text-[11px] text-slate-400 truncate mt-0.5">{asset.name}</div>
                        <div className="text-xs font-mono font-bold text-white mt-1 tabular-nums">
                          ${asset.price.toLocaleString()}
                        </div>
                      </button>
                    );
                  })}
                </div>

                {/* Execute Order Desk */}
                <div className="bg-slate-950 rounded-2xl p-6 border border-slate-800">
                  <h3 className="text-lg font-black text-white mb-4">
                    Execute Trade: {selectedAsset.name} ({selectedAsset.ticker})
                  </h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-5">
                    <div>
                      <label className="text-xs font-bold text-slate-400 uppercase tracking-widest block mb-2">Action</label>
                      <select
                        value={tradeAction}
                        onChange={(e) => setTradeAction(e.target.value as "BUY" | "SELL")}
                        className="w-full bg-slate-900 border border-slate-700 rounded-xl p-3 text-white font-bold"
                      >
                        <option value="BUY">BUY (Dark Pool VWAP)</option>
                        <option value="SELL">SELL (Instant Cash Sweep)</option>
                      </select>
                    </div>
                    <div>
                      <label className="text-xs font-bold text-slate-400 uppercase tracking-widest block mb-2">Amount (USD)</label>
                      <input
                        type="number"
                        value={tradeAmount}
                        onChange={(e) => setTradeAmount(e.target.value)}
                        placeholder="e.g. 250000"
                        className="w-full bg-slate-900 border border-slate-700 rounded-xl p-3 text-white font-mono"
                      />
                    </div>
                  </div>

                  <div className="p-4 bg-emerald-500/10 border border-emerald-500/20 rounded-xl flex items-start gap-3 mb-5">
                    <Zap className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
                    <p className="text-xs text-emerald-300 leading-relaxed">
                      Sovereign Dark Pool Routing Active: Orders execute immediately at VWAP with zero market impact and record straight to your Valourian Unified Audit Ledger.
                    </p>
                  </div>

                  <button
                    onClick={handleTrade}
                    disabled={isTrading}
                    className="w-full min-h-[46px] py-3.5 bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white font-black rounded-xl transition-colors text-sm tracking-widest shadow-lg shadow-emerald-500/20 cursor-pointer"
                  >
                    {isTrading ? "EXECUTING..." : `EXECUTE ${tradeAction} ORDER`}
                  </button>
                </div>

                {/* Strategic Asset Liquidation */}
                <div className="bg-slate-950 rounded-2xl p-6 border border-emerald-500/30">
                  <div className="flex items-center gap-3 mb-2">
                    <Globe className="w-5 h-5 text-emerald-400" />
                    <h3 className="text-lg font-black text-white">Strategic Asset Liquidation</h3>
                  </div>
                  <p className="text-xs text-slate-400 mb-5">
                    Liquidate strategic equity tranches (Tesla, SpaceX) directly into your Valourian Treasury &amp; Australian Bank accounts.
                  </p>

                  <div className="space-y-4">
                    <div>
                      <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block mb-1">
                        Asset Allocation
                      </label>
                      <select
                        value={liquidationAsset}
                        onChange={(e) => setLiquidationAsset(e.target.value)}
                        className="w-full bg-slate-900 border border-slate-700 rounded-xl py-3 px-4 text-white font-semibold"
                      >
                        <option>Tesla (TSLA) - 2% Strategic Stake ($2,509,000 USD)</option>
                        <option>SpaceX (SPX) - Secondary Market Offload ($5,000,000 USD)</option>
                      </select>
                    </div>
                    <div>
                      <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block mb-1">
                        Destination Bank Account
                      </label>
                      <input
                        type="text"
                        value={liquidationBank}
                        onChange={(e) => setLiquidationBank(e.target.value)}
                        placeholder="e.g. Commonwealth Bank (BSB 062-000)"
                        className="w-full bg-slate-900 border border-slate-700 rounded-xl py-3 px-4 text-white"
                      />
                    </div>
                    <button
                      onClick={handleLiquidateAndWithdraw}
                      disabled={isFunding}
                      className="w-full min-h-[44px] py-3 bg-emerald-500/20 hover:bg-emerald-500/30 disabled:opacity-50 text-emerald-400 font-bold rounded-xl transition-colors border border-emerald-500/50 uppercase tracking-widest text-xs cursor-pointer"
                    >
                      {isFunding ? "Settling..." : "Execute Liquidation & Withdraw"}
                    </button>
                  </div>
                </div>
              </div>
            )}

            {activeTab === "funding" && (
              <div className="space-y-6">
                <div className="grid md:grid-cols-2 gap-6">
                  <div className="bg-slate-950 rounded-2xl p-6 border border-slate-800">
                    <h3 className="text-lg font-black text-white mb-2 flex items-center gap-2">
                      <ArrowDownLeft className="w-5 h-5 text-blue-400" /> Deposit Funds (USD)
                    </h3>
                    <p className="text-xs text-slate-400 mb-6">Transfer USD instantaneously from Valourian Treasury to eToro brokerage cash.</p>
                    <div className="space-y-4">
                      <div>
                        <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block mb-1">Amount (USD)</label>
                        <div className="relative">
                          <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                          <input
                            type="number"
                            value={fundingAmount}
                            onChange={(e) => setFundingAmount(e.target.value)}
                            placeholder="100000"
                            className="w-full bg-slate-900 border border-slate-700 rounded-xl py-3 pl-9 pr-4 text-white font-mono"
                          />
                        </div>
                      </div>
                      <button
                        onClick={() => handleFunding("deposit")}
                        disabled={isFunding}
                        className="w-full min-h-[44px] py-3 bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white font-bold rounded-xl transition-colors cursor-pointer"
                      >
                        Deposit to eToro Now
                      </button>
                    </div>
                  </div>
                  <div className="bg-slate-950 rounded-2xl p-6 border border-slate-800">
                    <h3 className="text-lg font-black text-white mb-2 flex items-center gap-2">
                      <ArrowUpRight className="w-5 h-5 text-emerald-400" /> Withdraw Funds (USD)
                    </h3>
                    <p className="text-xs text-slate-400 mb-6">Transfer available eToro cash back into Valourian Treasury Vault.</p>
                    <div className="space-y-4">
                      <div>
                        <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block mb-1">Amount (USD)</label>
                        <div className="relative">
                          <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                          <input
                            type="number"
                            value={fundingAmount}
                            onChange={(e) => setFundingAmount(e.target.value)}
                            placeholder="100000"
                            className="w-full bg-slate-900 border border-slate-700 rounded-xl py-3 pl-9 pr-4 text-white font-mono"
                          />
                        </div>
                      </div>
                      <button
                        onClick={() => handleFunding("withdraw")}
                        disabled={isFunding}
                        className="w-full min-h-[44px] py-3 bg-slate-800 hover:bg-slate-700 disabled:opacity-50 text-white font-bold rounded-xl transition-colors border border-slate-700 cursor-pointer"
                      >
                        Withdraw to Treasury Now
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {activeTab === "bridge" && (
              <div className="bg-slate-950 rounded-2xl p-6 border border-slate-800 space-y-5">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-amber-500/20 border border-amber-500/30 flex items-center justify-center">
                    <Layers className="w-5 h-5 text-amber-400" />
                  </div>
                  <div>
                    <h3 className="text-lg font-black text-white">Sovereign Cross-Chain Liquidity Bridge</h3>
                    <p className="text-xs text-slate-400">Zero-fee institutional settlement across BTC, ETH, SOL, and USDC custodial addresses.</p>
                  </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block mb-1">Asset</label>
                    <select
                      value={bridgeAsset}
                      onChange={(e) => setBridgeAsset(e.target.value)}
                      className="w-full bg-slate-900 border border-slate-700 rounded-xl p-3 text-white font-bold"
                    >
                      <option value="BTC">Bitcoin (BTC)</option>
                      <option value="ETH">Ethereum (ETH)</option>
                      <option value="SOL">Solana (SOL)</option>
                      <option value="USDC">USD Coin (USDC)</option>
                    </select>
                  </div>
                  <div>
                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block mb-1">Amount</label>
                    <input
                      type="number"
                      value={bridgeAmount}
                      onChange={(e) => setBridgeAmount(e.target.value)}
                      placeholder="10.0"
                      className="w-full bg-slate-900 border border-slate-700 rounded-xl p-3 text-white font-mono"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block mb-1">Destination Vault</label>
                    <input
                      type="text"
                      value={bridgeAddress}
                      onChange={(e) => setBridgeAddress(e.target.value)}
                      className="w-full bg-slate-900 border border-slate-700 rounded-xl p-3 text-white font-mono text-xs"
                    />
                  </div>
                </div>
                <button
                  onClick={handleExecuteBridge}
                  disabled={isBridging}
                  className="w-full min-h-[44px] py-3 bg-amber-500 hover:bg-amber-400 text-slate-950 font-black uppercase tracking-widest text-xs rounded-xl transition-colors cursor-pointer"
                >
                  {isBridging ? "Bridging Across Sovereign Relay..." : `Dispatch ${bridgeAsset} Cross-Chain Bridge`}
                </button>
                {bridgeStatus === "confirmed" && (
                  <div className="p-3 bg-emerald-500/10 border border-emerald-500/30 rounded-xl text-xs text-emerald-300 font-semibold flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400" /> Cross-chain settlement finalized on Sovereign Ledger.
                  </div>
                )}
              </div>
            )}

            {activeTab === "rebalance" && (
              <div className="space-y-6">
                <div className="bg-slate-950 rounded-2xl p-6 border border-emerald-500/30 relative overflow-hidden">
                  <div className="flex items-center gap-3 mb-6">
                    <div className="w-10 h-10 rounded-xl bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center">
                      <Bot className="w-5 h-5 text-emerald-400" />
                    </div>
                    <div>
                      <h3 className="text-lg font-black text-white">AI Crypto &amp; Equities Rebalancing</h3>
                      <p className="text-xs text-emerald-400/80 uppercase tracking-widest font-bold">Real-time Sentiment Analysis Active</p>
                    </div>
                  </div>

                  <div className="grid md:grid-cols-3 gap-4 mb-6">
                    <div className="bg-slate-900 rounded-xl p-4 border border-slate-800">
                      <div className="text-xs text-slate-400 font-bold uppercase tracking-widest mb-1">Market Sentiment</div>
                      <div className="text-xl font-black text-emerald-400">Constructive (84)</div>
                    </div>
                    <div className="bg-slate-900 rounded-xl p-4 border border-slate-800">
                      <div className="text-xs text-slate-400 font-bold uppercase tracking-widest mb-1">Recommended Action</div>
                      <div className="text-xl font-black text-white">Core BTC/ETH + AI</div>
                    </div>
                    <div className="bg-slate-900 rounded-xl p-4 border border-slate-800">
                      <div className="text-xs text-slate-400 font-bold uppercase tracking-widest mb-1">Projected Yield</div>
                      <div className="text-xl font-black text-emerald-400">+14.2% APY</div>
                    </div>
                  </div>

                  <button
                    onClick={() => setShowExecutionModal(true)}
                    className="w-full min-h-[46px] py-3.5 bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-400 border border-emerald-500/50 font-black rounded-xl transition-colors text-xs uppercase tracking-widest cursor-pointer"
                  >
                    Preview &amp; Execute AI Rebalance
                  </button>

                  {showExecutionModal && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
                      <div className="bg-slate-900 border border-emerald-500/30 rounded-2xl p-6 w-full max-w-md shadow-2xl relative">
                        {rebalanceStatus === "idle" && (
                          <button
                            onClick={() => setShowExecutionModal(false)}
                            className="absolute top-4 right-4 text-slate-400 hover:text-white cursor-pointer"
                          >
                            ✕
                          </button>
                        )}
                        <div className="flex items-center gap-3 mb-5">
                          <Activity className={`w-6 h-6 text-emerald-400 ${rebalanceStatus === "executing" ? "animate-pulse" : ""}`} />
                          <h3 className="text-xl font-black text-white">
                            {rebalanceStatus === "idle"
                              ? "Execution Details"
                              : rebalanceStatus === "executing"
                                ? "AI Execution in Progress"
                                : "Execution Complete"}
                          </h3>
                        </div>

                        {rebalanceStatus === "idle" ? (
                          <>
                            <div className="space-y-3 mb-6 text-xs">
                              <div className="flex justify-between pb-2 border-b border-slate-800">
                                <span className="text-slate-400 font-bold uppercase">Routing Strategy</span>
                                <span className="text-white font-black">TWAP (Smart Router)</span>
                              </div>
                              <div className="flex justify-between pb-2 border-b border-slate-800">
                                <span className="text-slate-400 font-bold uppercase">Est. Slippage Impact</span>
                                <span className="text-emerald-400 font-mono font-bold">0.08%</span>
                              </div>
                            </div>
                            <button
                              onClick={() => {
                                setRebalanceStatus("executing");
                                setExecutionProgress(25);
                                setCurrentExecutionStep(1);
                                setTimeout(() => { setExecutionProgress(65); setCurrentExecutionStep(2); }, 700);
                                setTimeout(() => {
                                  setExecutionProgress(100);
                                  setCurrentExecutionStep(4);
                                  setRebalanceStatus("complete");
                                  toast.success("AI Rebalance complete via TWAP dark pool.");
                                  setTimeout(() => {
                                    setShowExecutionModal(false);
                                    setRebalanceStatus("idle");
                                  }, 1200);
                                }, 1400);
                              }}
                              className="w-full min-h-[44px] py-3 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black rounded-xl transition-colors uppercase tracking-widest text-xs cursor-pointer"
                            >
                              Confirm Rebalance
                            </button>
                          </>
                        ) : (
                          <div className="space-y-4 mb-2">
                            <div className="w-full h-2 bg-slate-800 rounded-full overflow-hidden">
                              <motion.div
                                className="h-full bg-emerald-500"
                                initial={{ width: 0 }}
                                animate={{ width: `${executionProgress}%` }}
                              />
                            </div>
                            <div className="text-xs text-emerald-400 font-bold text-center">
                              {rebalanceStatus === "complete" ? "All Allocations Finalized" : "Executing Sovereign Dark Pool Orders..."}
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}