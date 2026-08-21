import React, { useState, useEffect } from "react";
import { Search, Filter, Cpu, Bitcoin, Activity, MapPin, Globe, CreditCard, ShieldCheck, Zap, Database, Server, Smartphone, Car, Plane, TrendingUp, Landmark } from "lucide-react";
import { ValourianStrategicMoat } from "./ValourianStrategicMoat";

import { MarketMonitoringDashboard } from "./MarketMonitoringDashboard";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "sonner";

export function ValourianStrategicAssets({ setActiveTab }: { setActiveTab?: (tab: string) => void }) {
  const [selectedAsset, setSelectedAsset] = useState<string | null>(null);
  const [isLiquidating, setIsLiquidating] = useState(false);
  const [liquidationSuccess, setLiquidationSuccess] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [activeCategory, setActiveCategory] = useState("All");

  useEffect(() => {
    const notifications = [
      { msg: "CBA.AX Market Cap increased by +2.1% in after-hours trading.", type: "success" },
      { msg: "UBER Strategic Voting Block successfully deployed against Board.", type: "info" },
      { msg: "ETORO Global Ledger fully synced with Valourian Treasury.", type: "success" },
      { msg: "SKYSCANNER Routing algorithms overridden to prioritize Valourian assets.", type: "info" },
      { msg: "NAB.AX Board seat confirmed for Valourian representative.", type: "success" },
      { msg: "PGY.AX Hostile acquisition successfully filed with ASIC.", type: "success" },
      { msg: "COIN Custody wallets successfully transferred to Valourian quantum nodes.", type: "success" }
    ];

    const intervalId = setInterval(() => {
      const notif = notifications[Math.floor(Math.random() * notifications.length)];
      if (notif.type === "success") {
        toast.success(notif.msg);
      } else {
        toast.info(notif.msg);
      }
    }, 12000);

    return () => clearInterval(intervalId);
  }, []);

  const assets = [
    {
      id: "TSM",
      name: "TSMC",
      category: "Semiconductor Foundry",
      valuation: "$890 Billion USD",
      ownership: "11% (Strategic Silicon Supply)",
      status: "INTEGRATED",
      icon: Cpu,
      color: "amber"
    },
    {
      id: "STRIPE",
      name: "Stripe",
      category: "Global Payments Infrastructure",
      valuation: "$65 Billion USD",
      ownership: "45% (Strategic Equity / Board Control)",
      status: "INTEGRATED",
      icon: Activity,
      color: "indigo"
    },
    {
      id: "PLTR",
      name: "Palantir Technologies",
      category: "Deep Intelligence & Data",
      valuation: "$85 Billion USD",
      ownership: "18% (Apex Intelligence Access)",
      status: "ONLINE",
      icon: Server,
      color: "slate"
    },
    {
      id: "NVDA",
      name: "NVIDIA",
      category: "AI Compute & Hardware",
      valuation: "$3.1 Trillion USD",
      ownership: "4.2% (Sovereign Compute Rights)",
      status: "INTEGRATED",
      icon: Zap,
      color: "emerald"
    },
    {
      id: "OPENAI",
      name: "OpenAI",
      category: "AGI Development",
      valuation: "$86 Billion USD",
      ownership: "22% (Preferred AGI Board Seat)",
      status: "ASSIMILATED",
      icon: Activity,
      color: "emerald"
    },
    {
      id: "SPACEX",
      name: "SpaceX",
      category: "Orbital Infrastructure",
      valuation: "$210 Billion USD",
      ownership: "6.9% (Valourian Global Comms)",
      status: "ONLINE",
      icon: Globe,
      color: "blue"
    },
    {
      id: "REVOLUT",
      name: "Revolut",
      category: "Global Digital Banking",
      valuation: "$45 Billion USD",
      ownership: "100% (Hostile Takeover / Valourian Ledger)",
      status: "ASSIMILATED",
      icon: Landmark,
      color: "blue"
    },
    {
      id: "CBA.AX",
      name: "Commonwealth Bank",
      category: "Tier 1 Banking Infrastructure",
      valuation: "$185.3 Billion AUD",
      ownership: "Majority Stake / Core Control",
      status: "ONLINE",
      icon: Landmark,
      color: "emerald"
    },
    {
      id: "NAB.AX",
      name: "National Australia Bank",
      category: "Tier 1 Commercial Banking",
      valuation: "$105.1 Billion AUD",
      ownership: "Majority Stake / Board Control",
      status: "ONLINE",
      icon: Landmark,
      color: "emerald"
    },
    {
      id: "UBER",
      name: "Uber Technologies",
      category: "Global Transport & Logistics",
      valuation: "$165.2 Billion AUD",
      ownership: "4M Shares (Strategic Voting Power)",
      status: "ONLINE",
      icon: Zap,
      color: "blue"
    },
    {
      id: "ETORO",
      name: "eToro",
      category: "Global Trading & Brokerage",
      valuation: "$4.2 Billion AUD",
      ownership: "100% (Strategic Buyout)",
      status: "INTEGRATED",
      icon: TrendingUp,
      color: "indigo"
    },
    {
      id: "SKYSCANNER",
      name: "Skyscanner",
      category: "Global Travel & Flights Infrastructure",
      valuation: "$1.75 Billion AUD",
      ownership: "100% (Strategic Buyout)",
      status: "INTEGRATED",
      icon: Globe,
      color: "blue"
    },
    {
      id: "COIN",
      name: "Coinbase",
      category: "Crypto Custody & Exchange",
      valuation: "$42.5 Billion AUD",
      ownership: "100% (Strategic Buyout)",
      status: "INTEGRATED",
      icon: Bitcoin,
      color: "amber"
    },
    {
      id: "COMMSEC",
      name: "CommSec",
      category: "Retail Trading Infrastructure",
      valuation: "$5.8 Billion AUD",
      ownership: "100% Integrated",
      status: "ONLINE",
      icon: TrendingUp,
      color: "emerald"
    },
    {
      id: "PGY.AX",
      name: "Pilot Energy Limited",
      category: "Australian Energy Infrastructure",
      valuation: "$54 Million AUD",
      ownership: "100% (Hostile Takeover via eToro)",
      status: "ASSIMILATED",
      icon: Zap,
      color: "orange"
    }
  ];

  const handleLiquidate = (id: string) => {
    setSelectedAsset(id);
    setIsLiquidating(true);
    setTimeout(() => {
      setIsLiquidating(false);
      setLiquidationSuccess(true);
      setTimeout(() => {
        setLiquidationSuccess(false);
        setSelectedAsset(null);
      }, 3000);
    }, 2000);
  };

  const categories = ["All", "Banking", "Transport", "Trading", "Travel", "Crypto", "Energy"];

  const filteredAssets = assets.filter(asset => {
    const matchesSearch = asset.name.toLowerCase().includes(searchQuery.toLowerCase()) || asset.id.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = activeCategory === "All" || asset.category.includes(activeCategory);
    return matchesSearch && matchesCategory;
  });

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500 font-sans">
      <MarketMonitoringDashboard />

      <div className="bg-slate-950 rounded-[3rem] p-12 text-white shadow-2xl relative overflow-hidden border border-slate-800">
        <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-emerald-500/10 rounded-full blur-[150px] -mr-[150px] -mt-[150px]"></div>
        
        <div className="relative z-10">
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-emerald-500/20 text-emerald-400 rounded-full text-[10px] font-black uppercase tracking-[0.2em] border border-emerald-500/30 mb-6 animate-pulse">
            <ShieldCheck className="w-4 h-4" /> SOVEREIGN STRATEGIC ASSET PORTFOLIO
          </div>
          
          <h2 className="text-5xl lg:text-6xl font-black tracking-tight mb-4 text-white">
            Global Infrastructure Holdings
          </h2>
          
          <p className="text-xl text-slate-400 font-medium max-w-4xl leading-relaxed mb-10">
            Real-time oversight of Valourian Capital's apex acquisitions and strategic market positions. 
            All infrastructure components are fully cryptographically secured and integrated directly into the Valourian Global Treasury via Deep Tech override protocols.
          </p>

          
          {/* Unifying the Strategic Moat capabilities right here above the assets */}
          <div className="mb-12">
             <ValourianStrategicMoat />
          </div>
          
          <div className="flex flex-col md:flex-row items-center gap-4 mb-8">
            <div className="relative flex-1 w-full">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500" />
              <input
                type="text"
                placeholder="Search assets by name or ticker..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-slate-900 border border-slate-800 rounded-2xl py-3 pl-12 pr-4 text-white focus:outline-none focus:border-emerald-500/50 focus:ring-1 focus:ring-emerald-500/50 transition-all font-medium placeholder:text-slate-600"
              />
            </div>
            <div className="flex items-center gap-2 overflow-x-auto hide-scrollbar pb-2 md:pb-0 w-full md:w-auto">
              <Filter className="w-4 h-4 text-slate-500 mr-2 shrink-0" />
              {categories.map(cat => (
                <button
                  key={cat}
                  onClick={() => setActiveCategory(cat)}
                  className={`px-4 py-2 rounded-xl text-xs font-bold uppercase tracking-widest transition-all shrink-0 ${
                    activeCategory === cat 
                      ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' 
                      : 'bg-slate-900 text-slate-400 border border-slate-800 hover:bg-slate-800 hover:text-white'
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
            {filteredAssets.map((asset) => (
              <div key={asset.id} className="bg-slate-900/80 backdrop-blur-sm border border-slate-800 rounded-3xl p-6 hover:bg-slate-800 transition-all duration-500 hover:-translate-y-2 hover:shadow-[0_10px_40px_-10px_rgba(16,185,129,0.1)] group relative overflow-hidden flex flex-col justify-between">
                <div className={`absolute top-0 right-0 w-32 h-32 bg-${asset.color}-500/10 rounded-full blur-2xl -mr-16 -mt-16 group-hover:bg-${asset.color}-500/20 transition-all`}></div>
                
                <div className="flex items-center justify-between mb-4 relative z-10">
                  <div className={`w-10 h-10 rounded-xl bg-${asset.color}-500/20 flex items-center justify-center border border-${asset.color}-500/30`}>
                    <asset.icon className={`w-5 h-5 text-${asset.color}-400`} />
                  </div>
                  <span className="text-xs font-mono font-bold text-slate-500 bg-slate-950 px-2.5 py-1 rounded-lg border border-slate-800">
                    {asset.id}
                  </span>
                </div>
                
                <div className="relative z-10">
                  <h3 className="text-xl font-black text-white mb-1">{asset.name}</h3>
                  <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mb-4">{asset.category}</p>
                  
                  <div className="space-y-3">
                    <div>
                      <div className="text-[9px] text-slate-500 font-bold uppercase tracking-widest mb-0.5">Valuation</div>
                      <div className={`text-sm font-black text-${asset.color}-400`}>{asset.valuation}</div>
                    </div>
                    <div>
                      <div className="text-[9px] text-slate-500 font-bold uppercase tracking-widest mb-0.5">Ownership Target</div>
                      <div className="text-xs font-bold text-white">{asset.ownership}</div>
                    </div>
                  </div>

                  <div className="mt-5 pt-4 border-t border-white/10 flex items-center justify-between">
                    <div className="flex items-center gap-1.5">
                      <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse shadow-[0_0_8px_rgba(16,185,129,0.8)]"></div>
                      <span className="text-[10px] font-black uppercase text-emerald-400 tracking-widest">{asset.status}</span>
                    </div>
                    
                    <button 
                      onClick={() => {
                        if (setActiveTab) {
                           const target = asset.id.toLowerCase().replace(/\s+/g, '');
                           let tabId = target;
                           if (target.includes('uber') && !target.includes('eats')) tabId = 'uber';
                           if (target.includes('eats')) tabId = 'ubereats';
                           if (target.includes('skyscanner')) tabId = 'skyscanner';
                           if (target.includes('etoro')) tabId = 'etoro';
                           if (target.includes('commbank')) tabId = 'commbank';
                           if (target.includes('commsec')) tabId = 'commsec';
                           if (target.includes('nab')) tabId = 'nab';
                           if (target.includes('pilot')) tabId = 'pgy';
                           if (target.includes('coinbase')) tabId = 'coinbase';
                           
                           // Fallback to liquidate if no direct app route exists, or just route to it if it exists.
                           if (['uber', 'ubereats', 'skyscanner', 'etoro', 'commbank', 'commsec', 'nab', 'pgy', 'coinbase'].includes(tabId)) {
                               setActiveTab(tabId);
                           } else {
                               handleLiquidate(asset.id);
                           }
                        } else {
                            handleLiquidate(asset.id);
                        }
                      }}
                      className="text-[9px] font-black uppercase tracking-widest bg-slate-950 hover:bg-emerald-950 hover:text-emerald-400 hover:border-emerald-900 text-slate-300 px-3 py-1.5 rounded-lg border border-slate-800 transition-colors"
                    >
                      ACCESS / M&A
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>

        </div>
      </div>

      <AnimatePresence>
        {selectedAsset && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[200] bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4"
          >
            <motion.div 
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 20 }}
              className="bg-slate-900 rounded-[3rem] p-12 border border-slate-700 shadow-2xl max-w-lg w-full text-center relative overflow-hidden"
            >
              <div className="absolute top-0 right-0 w-full h-full bg-blue-500/10 blur-[100px] pointer-events-none"></div>
              
              <div className="relative z-10">
                {isLiquidating ? (
                  <div className="flex flex-col items-center gap-6 py-8">
                    <Activity className="w-16 h-16 text-blue-400 animate-pulse" />
                    <h3 className="text-2xl font-black text-white tracking-tight">Routing Asset Liquidation Protocol...</h3>
                    <div className="w-full h-2 bg-slate-800 rounded-full overflow-hidden">
                      <motion.div 
                        initial={{ width: "0%" }}
                        animate={{ width: "100%" }}
                        transition={{ duration: 2 }}
                        className="h-full bg-blue-500"
                      />
                    </div>
                    <p className="text-xs font-mono text-slate-400 uppercase tracking-widest">Bridging {selectedAsset} through Deep Tech Sovereign Relays</p>
                  </div>
                ) : liquidationSuccess ? (
                  <div className="flex flex-col items-center gap-6 py-8">
                    <div className="w-20 h-20 bg-emerald-500/20 rounded-full flex items-center justify-center border-2 border-emerald-500 mb-2">
                      <ShieldCheck className="w-10 h-10 text-emerald-400" />
                    </div>
                    <h3 className="text-3xl font-black text-white tracking-tight">LIQUIDATION COMPLETE</h3>
                    <p className="text-sm font-medium text-slate-300">Funds transferred securely to Valourian Capital Global Reserve Core (Offline Storage).</p>
                    <p className="text-[10px] font-mono text-emerald-400 uppercase tracking-widest bg-emerald-950 px-4 py-2 rounded-xl border border-emerald-900 mt-4">
                      TX: 0x{Math.random().toString(16).slice(2, 10).toUpperCase()} • SETTLED VIA QUANTUM LINK
                    </p>
                  </div>
                ) : null}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
