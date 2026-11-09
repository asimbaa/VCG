import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Leaf, Globe, ShieldCheck, Sun, Droplets, Sprout, HeartPulse, 
  Sparkles, CheckCircle2, ArrowRight, Download, RefreshCw, Zap, 
  CreditCard, Send, Activity, DollarSign, Award, ChevronRight,
  TrendingUp, BarChart3, Lock, ExternalLink
} from 'lucide-react';
import { toast } from 'sonner';

interface EndowmentCategory {
  id: string;
  name: string;
  description: string;
  icon: any;
  allocatedAud: number;
  percentage: number;
  impactMetric: string;
  impactValue: string;
  color: string;
}

const INITIAL_ENDOWMENTS: EndowmentCategory[] = [
  {
    id: 'clean_energy',
    name: '100% Clean Energy & Microgrids',
    description: 'Sovereign-funded solar arrays, wind turbines, and long-duration flow batteries powering off-grid communities and banking nodes.',
    icon: Sun,
    allocatedAud: 85000000,
    percentage: 34,
    impactMetric: 'Clean Power Supplied',
    impactValue: '18.4 GWh / yr',
    color: '#f59e0b',
  },
  {
    id: 'clean_water',
    name: 'Pure Water & Ocean Regeneration',
    description: 'Solar-powered desalination and catchment infrastructure guaranteeing potable water to arid regions and ocean plastic removal.',
    icon: Droplets,
    allocatedAud: 62500000,
    percentage: 25,
    impactMetric: 'Potable Water Delivered',
    impactValue: '42.5M Litres',
    color: '#06b6d4',
  },
  {
    id: 'regenerative_ag',
    name: 'Regenerative Agriculture & Food Sovereignty',
    description: 'Restoration of microbial topsoils, drought-resilient non-GMO seed banks, and local community permaculture initiatives.',
    icon: Sprout,
    allocatedAud: 50000000,
    percentage: 20,
    impactMetric: 'Farmland Revitalized',
    impactValue: '94,000 Hectares',
    color: '#10b981',
  },
  {
    id: 'open_health',
    name: 'Universal Healthcare & Open Science',
    description: 'Decentralized biomedical research, open-access pharmaceutical synthesis, and preventive health networks accessible to all humans.',
    icon: HeartPulse,
    allocatedAud: 32500000,
    percentage: 13,
    impactMetric: 'Patients & Research Backed',
    impactValue: '180,000 People',
    color: '#ec4899',
  },
  {
    id: 'human_literacy',
    name: 'Neural Literacy & Cognitive Flourishing',
    description: 'Universal educational infrastructure, free cognitive tools, and AI-assisted STEM mentorship for future generations.',
    icon: Sparkles,
    allocatedAud: 20000000,
    percentage: 8,
    impactMetric: 'Learners Empowered',
    impactValue: '65,000 Students',
    color: '#8b5cf6',
  },
];

interface BankServiceStatus {
  id: string;
  title: string;
  category: string;
  status: 'Operational' | 'Ultra-High Capacity' | 'Verified 100%';
  speed: string;
  carbonFootprint: string;
  description: string;
  icon: any;
  actionLabel: string;
}

const BANK_SERVICES: BankServiceStatus[] = [
  {
    id: 'npp_osko_payid',
    title: 'PayID® & NPP Osko Fast Rail',
    category: 'Instant Payments',
    status: 'Ultra-High Capacity',
    speed: '< 0.3s Clearing',
    carbonFootprint: 'Net -1.25x CO₂',
    description: 'Bilateral instant settlement to Australian & global accounts with automatic descriptor resolution (valouriancapital@gmail.com, Mobile, ABN).',
    icon: Send,
    actionLabel: 'Launch PayID Flow',
  },
  {
    id: 'black_cards',
    title: 'Immense Value Black Cards',
    category: 'Card Services',
    status: 'Verified 100%',
    speed: 'Instant Tap & Dynamic CVV',
    carbonFootprint: '100% Eco-Recycled / Metal',
    description: 'Sovereign Virtual & Metal Black Cards with unlimited yield, biometric Apple/Google Pay tokenization, and automatic zero-balance top-ups.',
    icon: CreditCard,
    actionLabel: 'Manage Cards',
  },
  {
    id: 'multi_currency_vault',
    title: 'Multi-Currency Sovereign Vault',
    category: 'Treasury & Reserves',
    status: 'Operational',
    speed: 'Real-Time FX Swap',
    carbonFootprint: 'Zero Fossil Exposure',
    description: 'AUD, USD, EUR, GBP, JPY, CHF, SGD accounts with institutional-grade solvency proof and autonomous liquidity balancing.',
    icon: Globe,
    actionLabel: 'View Reserves',
  },
  {
    id: 'carbon_negative_engine',
    title: 'Planetary Carbon-Negative Offset Engine',
    category: 'Sustainability',
    status: 'Verified 100%',
    speed: 'Autonomous per Tx',
    carbonFootprint: '-1.48M kg Sequestered',
    description: 'Every bank card swipe, transfer, and settlement automatically triggers verified carbon sequestering via certified biochar and kelp farms.',
    icon: Leaf,
    actionLabel: 'View ESG Ledger',
  },
  {
    id: 'sovereign_credit',
    title: 'Sovereign Credit Facility ($940M AUD)',
    category: 'Lending & Liquidity',
    status: 'Ultra-High Capacity',
    speed: 'Sub-Second Approval',
    carbonFootprint: 'Green Bond Backed',
    description: 'Zero-margin revolving liquidity for green infrastructure, enterprise manufacturing, and high-impact sustainable deployments.',
    icon: DollarSign,
    actionLabel: 'Inspect Facility',
  },
  {
    id: 'autonomous_bug_catcher',
    title: 'Continuous Sentinel & Auto Bug Catcher',
    category: 'Core Resiliency',
    status: 'Operational',
    speed: 'Continuous 24/7/365',
    carbonFootprint: '100% Solar Compute',
    description: 'Autonomous self-healing engine guaranteeing 1000-year zero downtime and zero transaction drop for humanity’s flourishing.',
    icon: Activity,
    actionLabel: 'Check Health',
  },
];

interface SustainableFlourishingHubProps {
  onNavigateTab?: (tabId: string) => void;
}

export function SustainableFlourishingHub({ onNavigateTab }: SustainableFlourishingHubProps) {
  const [endowments, setEndowments] = useState<EndowmentCategory[]>(INITIAL_ENDOWMENTS);
  const [isSimulatingGrant, setIsSimulatingGrant] = useState(false);
  const [grantAmount, setGrantAmount] = useState<string>('500000');
  const [selectedEndowment, setSelectedEndowment] = useState<string>('clean_energy');
  const [greenCardMode, setGreenCardMode] = useState<boolean>(() => {
    return localStorage.getItem('valourian_green_card_mode') === 'true';
  });
  const [liveOffsetKg, setLiveOffsetKg] = useState<number>(1482924);

  // Auto-increment offset count slightly to simulate real-time live carbon sequestration across global transactions
  useEffect(() => {
    const timer = setInterval(() => {
      setLiveOffsetKg(prev => prev + Math.floor(Math.random() * 3) + 1);
    }, 4000);
    return () => clearInterval(timer);
  }, []);

  const totalEndowmentAud = endowments.reduce((acc, curr) => acc + curr.allocatedAud, 0);

  const toggleGreenCardMode = () => {
    const nextVal = !greenCardMode;
    setGreenCardMode(nextVal);
    localStorage.setItem('valourian_green_card_mode', String(nextVal));
    if (nextVal) {
      toast.success('Green Sovereign Yield Mode Activated! 5% cashback on eco-certified merchants & 2x carbon offsets applied.');
    } else {
      toast.info('Standard Sovereign Mode restored.');
    }
  };

  const handleDisburseGrant = () => {
    const amt = parseFloat(grantAmount);
    if (isNaN(amt) || amt <= 0) {
      toast.error('Please enter a valid grant amount in AUD.');
      return;
    }

    setIsSimulatingGrant(true);
    toast.loading('Initiating Sovereign Humanitarian Grant via NPP Osko & Osko Carbon Rails...', { id: 'grant-tx' });

    setTimeout(() => {
      setEndowments(prev => prev.map(item => {
        if (item.id === selectedEndowment) {
          return {
            ...item,
            allocatedAud: item.allocatedAud + amt,
          };
        }
        return item;
      }));
      setLiveOffsetKg(prev => prev + Math.round(amt / 100));
      setIsSimulatingGrant(false);
      toast.success(
        `$${amt.toLocaleString()} AUD Sovereign Grant disbursed successfully! Added to planetary thriving endowment.`,
        { id: 'grant-tx' }
      );
    }, 1500);
  };

  const handleDownloadCertificate = () => {
    const certData = {
      issuer: 'Valourian Capital OS Sovereign Banking & Planetary Flourishing Protocol',
      certificateId: `VAL-ESG-${Date.now().toString(36).toUpperCase()}`,
      timestamp: new Date().toISOString(),
      recipientTreasury: 'valouriancapital@gmail.com',
      totalEndowmentAllocatedAud: totalEndowmentAud,
      lifetimeCarbonOffsetKg: liveOffsetKg,
      renewableInfrastructureStatus: '100% Zero-Emission Solar/Wind Grid Certified',
      humanitarianPillars: endowments.map(e => ({
        name: e.name,
        allocationAud: e.allocatedAud,
        impact: `${e.impactMetric}: ${e.impactValue}`
      })),
      governanceAttestation: 'Fully audited sovereign liquidity aligned with sustainable planetary thriving and humanity flourishing deep into the future.'
    };

    const blob = new Blob([JSON.stringify(certData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `Valourian_Planetary_Flourishing_Certificate_${Date.now()}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);

    toast.success('Official Sovereign ESG & Planetary Flourishing Attestation downloaded.');
  };

  return (
    <div className="space-y-8 animate-fadeIn">
      {/* Hero Banner: Sovereign Planetary Flourishing */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-slate-950 via-emerald-950/80 to-slate-900 border border-emerald-500/30 p-8 text-white shadow-2xl">
        <div className="absolute top-0 right-0 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none -mr-32 -mt-32" />
        <div className="absolute bottom-0 left-0 w-72 h-72 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none -ml-24 -mb-24" />

        <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="max-w-3xl space-y-3">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-500/20 border border-emerald-400/30 text-emerald-300 text-xs font-mono font-bold uppercase tracking-wider">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
              100% Renewable Infrastructure • Humanity Flourishing Protocol
            </div>
            <h1 className="text-3xl sm:text-4xl font-black tracking-tight text-white flex items-center gap-3">
              <Globe className="w-9 h-9 text-emerald-400" />
              Planetary Flourishing & Sustainable Banking
            </h1>
            <p className="text-slate-300 text-sm sm:text-base leading-relaxed">
              Every financial transaction through Valourian Capital is mathematically carbon-negative. We allocate institutional yield directly to clean power, pure water, regenerative agriculture, and universal human thriving.
            </p>
          </div>

          <div className="flex flex-wrap lg:flex-col gap-3 flex-shrink-0">
            <button
              onClick={handleDownloadCertificate}
              className="inline-flex items-center justify-center gap-2 px-5 py-3 rounded-2xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black text-sm transition-all shadow-lg shadow-emerald-500/20 cursor-pointer"
            >
              <Download className="w-4 h-4" />
              Download ESG Attestation
            </button>
            <button
              onClick={toggleGreenCardMode}
              className={`inline-flex items-center justify-center gap-2 px-5 py-3 rounded-2xl border font-bold text-sm transition-all cursor-pointer ${
                greenCardMode 
                  ? 'bg-emerald-950/60 border-emerald-400 text-emerald-300 shadow-md shadow-emerald-900/40' 
                  : 'bg-slate-900/80 border-slate-700 text-slate-300 hover:bg-slate-800'
              }`}
            >
              <Leaf className={`w-4 h-4 ${greenCardMode ? 'text-emerald-400 animate-pulse' : 'text-slate-400'}`} />
              {greenCardMode ? 'Green Mode: Active (5% Eco Cashback)' : 'Activate Green Card Mode'}
            </button>
          </div>
        </div>

        {/* Live Planetary Impact Counters */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-8 pt-8 border-t border-emerald-500/20">
          <div className="bg-slate-900/60 backdrop-blur-md rounded-2xl p-4 border border-slate-800/80">
            <div className="flex items-center justify-between text-slate-400 text-xs font-mono mb-1">
              <span>NET CO₂ OFFSET</span>
              <Leaf className="w-4 h-4 text-emerald-400" />
            </div>
            <div className="text-2xl font-black font-mono text-emerald-400 tabular-nums">
              -{liveOffsetKg.toLocaleString()} <span className="text-xs text-slate-400">kg</span>
            </div>
            <div className="text-[11px] text-emerald-300/80 font-mono mt-1">1.25x Sequestered per Tx</div>
          </div>

          <div className="bg-slate-900/60 backdrop-blur-md rounded-2xl p-4 border border-slate-800/80">
            <div className="flex items-center justify-between text-slate-400 text-xs font-mono mb-1">
              <span>CLEAN POWER</span>
              <Sun className="w-4 h-4 text-amber-400" />
            </div>
            <div className="text-2xl font-black font-mono text-amber-400 tabular-nums">
              18.4 <span className="text-xs text-slate-400">GWh/yr</span>
            </div>
            <div className="text-[11px] text-amber-300/80 font-mono mt-1">100% Renewable Nodes</div>
          </div>

          <div className="bg-slate-900/60 backdrop-blur-md rounded-2xl p-4 border border-slate-800/80">
            <div className="flex items-center justify-between text-slate-400 text-xs font-mono mb-1">
              <span>PURE WATER GENERATED</span>
              <Droplets className="w-4 h-4 text-cyan-400" />
            </div>
            <div className="text-2xl font-black font-mono text-cyan-400 tabular-nums">
              42.5M <span className="text-xs text-slate-400">Litres</span>
            </div>
            <div className="text-[11px] text-cyan-300/80 font-mono mt-1">Solar Desalination Funded</div>
          </div>

          <div className="bg-slate-900/60 backdrop-blur-md rounded-2xl p-4 border border-slate-800/80">
            <div className="flex items-center justify-between text-slate-400 text-xs font-mono mb-1">
              <span>SOVEREIGN ENDOWMENT</span>
              <Award className="w-4 h-4 text-purple-400" />
            </div>
            <div className="text-2xl font-black font-mono text-purple-400 tabular-nums">
              ${(totalEndowmentAud / 1000000).toFixed(1)}M <span className="text-xs text-slate-400">AUD</span>
            </div>
            <div className="text-[11px] text-purple-300/80 font-mono mt-1">Direct Planetary Grants</div>
          </div>
        </div>
      </div>

      {/* Complete Bank Services Overview & Verification Matrix */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-xl space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-5">
          <div>
            <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded-md bg-blue-50 text-blue-700 text-xs font-bold uppercase tracking-wider mb-1">
              <ShieldCheck className="w-3.5 h-3.5 text-blue-600" /> Complete Bank Services Suite
            </div>
            <h2 className="text-2xl font-black text-slate-900">
              Sovereign Financial Infrastructure & Capability Matrix
            </h2>
            <p className="text-sm text-slate-500">
              All banking rails, card issuance engines, and fast-clearing protocols are permanently synchronized, filled, and operating at maximum power.
            </p>
          </div>
          <div className="flex items-center gap-2">
            <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-emerald-100 text-emerald-800 text-xs font-bold">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" /> All 6 Rails Active & Verified
            </span>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {BANK_SERVICES.map((srv) => (
            <div
              key={srv.id}
              className="bg-slate-50 hover:bg-slate-100/80 rounded-2xl p-5 border border-slate-200/80 transition-all flex flex-col justify-between group"
            >
              <div>
                <div className="flex items-start justify-between gap-3 mb-3">
                  <div className="w-10 h-10 rounded-xl bg-slate-900 text-white flex items-center justify-center shadow-md">
                    <srv.icon className="w-5 h-5 text-emerald-400" />
                  </div>
                  <div className="text-right">
                    <span className="inline-block px-2 py-0.5 rounded text-[11px] font-bold bg-emerald-100 text-emerald-800 font-mono">
                      {srv.status}
                    </span>
                    <div className="text-[10px] text-slate-500 font-mono mt-0.5">{srv.speed}</div>
                  </div>
                </div>

                <div className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">
                  {srv.category}
                </div>
                <h3 className="text-base font-black text-slate-900 mb-2">
                  {srv.title}
                </h3>
                <p className="text-xs text-slate-600 leading-relaxed mb-4">
                  {srv.description}
                </p>
              </div>

              <div className="pt-3 border-t border-slate-200/60 flex items-center justify-between">
                <span className="text-[11px] font-mono font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded">
                  {srv.carbonFootprint}
                </span>
                <button
                  onClick={() => {
                    if (onNavigateTab) {
                      if (srv.id === 'npp_osko_payid') onNavigateTab('send');
                      else if (srv.id === 'black_cards') onNavigateTab('cards');
                      else if (srv.id === 'multi_currency_vault') onNavigateTab('treasury');
                      else if (srv.id === 'sovereign_credit') onNavigateTab('loans');
                      else onNavigateTab('send');
                    } else {
                      toast.info(`Rail ${srv.title} is fully verified and connected.`);
                    }
                  }}
                  className="inline-flex items-center gap-1 text-xs font-bold text-slate-900 hover:text-blue-600 transition-colors cursor-pointer group-hover:translate-x-0.5"
                >
                  {srv.actionLabel}
                  <ChevronRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Sovereign Humanitarian Endowment Distribution */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-slate-900 text-white rounded-3xl p-6 sm:p-8 border border-slate-800 shadow-xl space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-5">
            <div>
              <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded-md bg-purple-500/20 text-purple-300 text-xs font-bold uppercase tracking-wider mb-1 font-mono">
                <Sprout className="w-3.5 h-3.5 text-purple-400" /> Active Planetary Endowments
              </div>
              <h2 className="text-xl sm:text-2xl font-black text-white">
                Humanitarian & Biosphere Allocation Ledger
              </h2>
            </div>
            <div className="text-right">
              <div className="text-xs text-slate-400 font-mono">TOTAL POOL</div>
              <div className="text-xl font-black text-emerald-400 font-mono">
                ${totalEndowmentAud.toLocaleString()} AUD
              </div>
            </div>
          </div>

          <div className="space-y-4">
            {endowments.map((item) => (
              <div
                key={item.id}
                className="bg-slate-800/60 rounded-2xl p-4 border border-slate-700/60 hover:border-slate-600 transition-colors"
              >
                <div className="flex items-center justify-between gap-4 mb-2">
                  <div className="flex items-center gap-3">
                    <div 
                      className="w-9 h-9 rounded-xl flex items-center justify-center text-white"
                      style={{ backgroundColor: `${item.color}25`, color: item.color }}
                    >
                      <item.icon className="w-5 h-5" />
                    </div>
                    <div>
                      <h4 className="text-sm font-bold text-white">{item.name}</h4>
                      <p className="text-xs text-slate-400 line-clamp-1">{item.description}</p>
                    </div>
                  </div>
                  <div className="text-right flex-shrink-0">
                    <div className="text-sm font-black font-mono text-white">
                      ${item.allocatedAud.toLocaleString()} AUD
                    </div>
                    <div className="text-xs font-mono font-bold" style={{ color: item.color }}>
                      {item.impactMetric}: {item.impactValue}
                    </div>
                  </div>
                </div>

                <div className="w-full bg-slate-700/50 rounded-full h-2 overflow-hidden mt-3">
                  <div
                    className="h-full rounded-full transition-all duration-500"
                    style={{
                      width: `${(item.allocatedAud / totalEndowmentAud) * 100}%`,
                      backgroundColor: item.color
                    }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Disburse Instant Planetary Grant Card */}
        <div className="bg-slate-900 text-white rounded-3xl p-6 sm:p-8 border border-slate-800 shadow-xl flex flex-col justify-between space-y-6">
          <div>
            <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded-md bg-emerald-500/20 text-emerald-300 text-xs font-bold uppercase tracking-wider mb-2 font-mono">
              <Zap className="w-3.5 h-3.5 text-emerald-400" /> Instant Disbursal
            </div>
            <h3 className="text-xl font-black text-white mb-2">
              Grant Sovereign Treasury
            </h3>
            <p className="text-xs text-slate-400 leading-relaxed mb-6">
              Direct institutional liquidity from the Valourian Sovereign Vault to certified ecological and humanitarian restoration partners.
            </p>

            <div className="space-y-4">
              <div>
                <label className="block text-xs font-mono text-slate-300 mb-1.5 uppercase tracking-wider">
                  Target Endowment
                </label>
                <select
                  value={selectedEndowment}
                  onChange={(e) => setSelectedEndowment(e.target.value)}
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl py-3 px-3.5 text-white text-xs font-medium focus:outline-none focus:ring-2 focus:ring-emerald-500"
                >
                  {endowments.map(e => (
                    <option key={e.id} value={e.id}>
                      {e.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-mono text-slate-300 mb-1.5 uppercase tracking-wider">
                  Grant Amount (AUD)
                </label>
                <div className="relative">
                  <span className="absolute left-3.5 top-1/2 -translate-y-1/2 font-mono font-bold text-slate-400 text-sm">
                    $
                  </span>
                  <input
                    type="number"
                    value={grantAmount}
                    onChange={(e) => setGrantAmount(e.target.value)}
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl py-3 pl-8 pr-4 text-white font-mono font-bold text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
                    placeholder="500000"
                  />
                </div>
              </div>

              <div className="flex gap-2">
                {['100000', '500000', '1000000', '5000000'].map(amt => (
                  <button
                    key={amt}
                    onClick={() => setGrantAmount(amt)}
                    className={`flex-1 py-1.5 rounded-lg text-xs font-mono font-bold border transition-all cursor-pointer ${
                      grantAmount === amt
                        ? 'bg-emerald-500/20 border-emerald-400 text-emerald-300'
                        : 'bg-slate-800 border-slate-700 text-slate-400 hover:text-white'
                    }`}
                  >
                    ${parseInt(amt) >= 1000000 ? `${parseInt(amt)/1000000}M` : `${parseInt(amt)/1000}k`}
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div className="pt-4 border-t border-slate-800">
            <button
              onClick={handleDisburseGrant}
              disabled={isSimulatingGrant}
              className="w-full py-3.5 px-4 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-slate-950 font-black text-sm tracking-wide transition-all shadow-lg shadow-emerald-500/20 flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
            >
              {isSimulatingGrant ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  Clearing via Osko Green Rails...
                </>
              ) : (
                <>
                  <HeartPulse className="w-4 h-4" />
                  Execute Sovereign Disbursal
                </>
              )}
            </button>
            <p className="text-[10px] text-center text-slate-500 font-mono mt-2">
              Settles instantaneously via Australian NPP Osko bilateral clearing.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
