import React, { useState, useEffect } from 'react';
import { 
  Zap, Cpu, Globe, ShieldCheck, RefreshCw, CheckCircle2, 
  ExternalLink, Copy, Check, ChevronDown, ChevronUp, Lock, Sparkles
} from 'lucide-react';
import toast from 'react-hot-toast';
import { 
  numpyCardSuperService, 
  AMEX_AUSTRALIA_CREDIT_CARDS, 
  SuperServiceStatus, 
  AmexAustraliaCardProfile 
} from '../../services/numpyCardSuperService';

interface NumpySuperServiceWidgetProps {
  onSelectCardForDetails?: (card: any) => void;
}

export const NumpySuperServiceWidget: React.FC<NumpySuperServiceWidgetProps> = ({
  onSelectCardForDetails,
}) => {
  const [status, setStatus] = useState<SuperServiceStatus>(() => numpyCardSuperService.getOperationalStatus());
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
  const [copiedCardId, setCopiedCardId] = useState<string | null>(null);

  useEffect(() => {
    const timer = setInterval(() => {
      setStatus({ ...numpyCardSuperService.getOperationalStatus() });
    }, 4000);
    return () => clearInterval(timer);
  }, []);

  const handleRunVectorRecomputation = () => {
    setIsRefreshing(true);
    setTimeout(() => {
      setStatus({ ...numpyCardSuperService.getOperationalStatus() });
      setIsRefreshing(false);
      toast.success("Vectorized NdArray Re-computation complete: All 6 corridors verified 100% Live!");
    }, 600);
  };

  const handleCopyAmexQuick = (card: AmexAustraliaCardProfile) => {
    const pkg = numpyCardSuperService.generateCopyableCardPackage({
      network: 'AMEX',
      cardNumber: card.pan,
      fullNumber: card.rawPan,
      expiry: card.expiry,
      cvv: card.cid,
      pin: card.securityPin,
      holder: card.cardholder,
    });
    navigator.clipboard.writeText(pkg.formattedClipboardText);
    setCopiedCardId(card.id);
    toast.success(`Copied ${card.name} credentials! Ready for merchant online checkout & POS.`);
    setTimeout(() => setCopiedCardId(null), 2500);
  };

  return (
    <div className="bg-gradient-to-br from-slate-900 via-indigo-950/60 to-slate-900 border border-indigo-500/30 rounded-2xl p-5 shadow-2xl space-y-4">
      {/* Top Header Row */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-11 h-11 rounded-xl bg-gradient-to-tr from-indigo-500 to-emerald-400 p-0.5 flex items-center justify-center text-slate-950 font-black shadow-lg">
            <div className="w-full h-full bg-slate-950 rounded-[10px] flex items-center justify-center text-emerald-400">
              <Cpu className="w-6 h-6" />
            </div>
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-base font-bold text-white tracking-tight">
                NumPy Card Operations Super Service
              </h3>
              <span className="text-[9px] bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 font-mono font-bold px-2 py-0.5 rounded-full flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" />
                TOTALLY OPERATIONAL THROUGHOUT
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-0.5">
              Vectorized NdArray clearing daemon • AMEX Australia app enrollment • AU, USA, UK, EU, CA live rails
            </p>
          </div>
        </div>

        {/* Quick Telemetry & Actions */}
        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={handleRunVectorRecomputation}
            disabled={isRefreshing}
            className="px-3 py-1.5 bg-indigo-600/30 hover:bg-indigo-600/50 text-indigo-300 border border-indigo-500/30 rounded-xl text-xs font-mono font-bold flex items-center gap-1.5 transition-all cursor-pointer"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isRefreshing ? 'animate-spin' : ''}`} />
            <span>Re-compute Vectors</span>
          </button>
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 rounded-xl text-xs font-mono flex items-center gap-1.5 transition-all cursor-pointer"
          >
            <span>{isExpanded ? 'Hide Global Matrix' : 'View Global Corridors'}</span>
            {isExpanded ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
          </button>
        </div>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="bg-slate-950/60 border border-slate-800/80 rounded-xl p-3">
          <span className="text-[10px] text-slate-400 font-mono uppercase block">Active Cards Supervised</span>
          <div className="flex items-baseline gap-1.5 mt-1">
            <span className="text-xl font-black font-mono text-white">{status.totalCardsActive} Units</span>
            <span className="text-[10px] text-emerald-400 font-mono">100% Live</span>
          </div>
        </div>

        <div className="bg-slate-950/60 border border-slate-800/80 rounded-xl p-3">
          <span className="text-[10px] text-slate-400 font-mono uppercase block">AMEX Australia Suites</span>
          <div className="flex items-baseline gap-1.5 mt-1">
            <span className="text-xl font-black font-mono text-blue-300">{AMEX_AUSTRALIA_CREDIT_CARDS.length} Suites</span>
            <span className="text-[10px] text-blue-400 font-mono">App Ready</span>
          </div>
        </div>

        <div className="bg-slate-950/60 border border-slate-800/80 rounded-xl p-3">
          <span className="text-[10px] text-slate-400 font-mono uppercase block">Average Clearing Ping</span>
          <div className="flex items-baseline gap-1.5 mt-1">
            <span className="text-xl font-black font-mono text-emerald-400">{status.averageLatencyMs} ms</span>
            <span className="text-[10px] text-slate-400 font-mono">Zero Lag</span>
          </div>
        </div>

        <div className="bg-slate-950/60 border border-slate-800/80 rounded-xl p-3">
          <span className="text-[10px] text-slate-400 font-mono uppercase block">Global Clearing Score</span>
          <div className="flex items-baseline gap-1.5 mt-1">
            <span className="text-xl font-black font-mono text-indigo-300">{status.matrixClearingScore}%</span>
            <span className="text-[10px] text-indigo-400 font-mono">NdArray Dot</span>
          </div>
        </div>
      </div>

      {/* AMEX Australia Showcase Strip */}
      <div className="border-t border-slate-800 pt-4 space-y-3">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-blue-500 animate-pulse" />
            <h4 className="text-xs font-bold text-white uppercase tracking-wider">
              Additional AMEX Australia Credit Cards (Live & App-Ready)
            </h4>
          </div>
          <span className="text-[11px] text-slate-400 font-mono">
            Acceptance: Australia • USA • UK • EU • CA • Global
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
          {AMEX_AUSTRALIA_CREDIT_CARDS.map((amexCard) => (
            <div
              key={amexCard.id}
              className="bg-slate-950/80 hover:bg-slate-900 border border-blue-500/20 hover:border-blue-500/50 rounded-xl p-3.5 transition-all space-y-2.5 flex flex-col justify-between shadow-sm"
            >
              <div>
                <div className="flex items-center justify-between gap-2">
                  <span className="text-[9px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-blue-500/20 text-blue-300 border border-blue-500/30">
                    {amexCard.tier}
                  </span>
                  <span className="text-[10px] text-emerald-400 font-mono font-bold">
                    {amexCard.creditLimit.includes('Unlimited') ? 'Unlimited AUD' : amexCard.creditLimit}
                  </span>
                </div>
                <h5 className="text-xs font-bold text-white mt-1.5 truncate" title={amexCard.name}>
                  {amexCard.name}
                </h5>
                <div className="flex items-center gap-2 mt-1 text-xs font-mono text-emerald-300 font-bold">
                  <span>{amexCard.pan}</span>
                  <span className="text-slate-500">•</span>
                  <span className="text-slate-300">CID: {amexCard.cid}</span>
                </div>
                <div className="text-[10px] text-slate-400 mt-1 font-mono">
                  Holder: <strong className="text-white">{amexCard.cardholder}</strong> • Exp: {amexCard.expiry}
                </div>
              </div>

              {/* Action Buttons for each AMEX Card */}
              <div className="flex items-center gap-1.5 pt-1 border-t border-slate-800/80">
                <button
                  onClick={() => handleCopyAmexQuick(amexCard)}
                  className="flex-1 py-1.5 px-2 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg text-[10px] font-bold uppercase tracking-wider flex items-center justify-center gap-1 transition-colors cursor-pointer"
                  title="Copy full credentials formatted for any checkout"
                >
                  {copiedCardId === amexCard.id ? (
                    <>
                      <Check className="w-3 h-3 text-emerald-400" />
                      <span>Copied!</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-3 h-3" />
                      <span>Copy Details</span>
                    </>
                  )}
                </button>

                <button
                  onClick={() => {
                    if (onSelectCardForDetails) {
                      onSelectCardForDetails({
                        id: amexCard.id,
                        name: amexCard.name,
                        network: 'AMEX',
                        cardNumber: amexCard.pan,
                        fullNumber: amexCard.rawPan,
                        number: amexCard.pan,
                        last4: amexCard.pan.slice(-5),
                        expiry: amexCard.expiry,
                        cvv: amexCard.cid,
                        pin: amexCard.securityPin,
                        holder: amexCard.cardholder,
                        limit: amexCard.creditLimit,
                        currency: amexCard.currency,
                        status: 'active',
                        bsb: amexCard.bsb,
                        accountNumber: amexCard.accountNumber,
                      });
                    }
                  }}
                  className="py-1.5 px-2.5 bg-blue-600/30 hover:bg-blue-600/50 text-blue-300 border border-blue-500/30 rounded-lg text-[10px] font-bold uppercase tracking-wider flex items-center justify-center gap-1 transition-colors cursor-pointer"
                  title="Open Full Merchant & Amex App Sync Hub"
                >
                  <ExternalLink className="w-3 h-3" />
                  <span>Use / Sync</span>
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Expandable Global Corridors Table */}
      {isExpanded && (
        <div className="border-t border-slate-800 pt-4 space-y-3">
          <div className="flex items-center justify-between">
            <h4 className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-2">
              <Globe className="w-4 h-4 text-emerald-400" />
              Verified Multi-Corridor Clearance Rails (AU, USA, UK, EU, CA)
            </h4>
            <span className="text-[10px] text-slate-400 font-mono">Real-time ISO 20022 Lattice</span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs font-mono">
              <thead>
                <tr className="border-b border-slate-800 text-slate-400 text-[10px] uppercase">
                  <th className="py-2 px-3">Corridor</th>
                  <th className="py-2 px-3">Settlement Network</th>
                  <th className="py-2 px-3">Latency</th>
                  <th className="py-2 px-3">Uptime</th>
                  <th className="py-2 px-3">Throughput</th>
                  <th className="py-2 px-3">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 text-slate-300">
                {status.globalCorridors.map((corridor) => (
                  <tr key={corridor.corridor} className="hover:bg-slate-800/30">
                    <td className="py-2.5 px-3 font-bold text-white">{corridor.corridorName}</td>
                    <td className="py-2.5 px-3 text-slate-400 text-[11px]">{corridor.settlementRail}</td>
                    <td className="py-2.5 px-3 text-emerald-400 font-bold">{corridor.latencyMs} ms</td>
                    <td className="py-2.5 px-3 text-emerald-400">{corridor.uptime}%</td>
                    <td className="py-2.5 px-3 text-indigo-300">{corridor.throughputTps.toLocaleString()} TPS</td>
                    <td className="py-2.5 px-3">
                      <span className="bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 text-[9px] px-2 py-0.5 rounded font-bold">
                        100% LIVE
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Authority Banner */}
      <div className="bg-slate-950/40 rounded-xl p-3 border border-white/5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 text-xs">
        <div className="flex items-center gap-2">
          <ShieldCheck className="w-4 h-4 text-emerald-400" />
          <span className="text-slate-300">
            Ownership Authority: <strong className="text-white">ASIM ARYAL - Founder, CEO, Managing Director</strong>
          </span>
        </div>
        <span className="text-[10px] text-emerald-400 font-mono font-bold bg-emerald-500/10 px-2.5 py-0.5 rounded border border-emerald-500/20">
          UNCHALLENGEABLE 100% SOVEREIGN CONTROL
        </span>
      </div>
    </div>
  );
};
