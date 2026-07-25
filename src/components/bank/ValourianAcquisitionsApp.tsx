import React from "react";
import { ShieldCheck, Building2, TrendingUp, Zap, Server, Code, Layers, Smartphone, Banknote, ShieldAlert } from "lucide-react";
import { motion } from "framer-motion";

interface AcquisitionsProps {
  appName: string;
  ticker?: string;
  ownedShares?: string;
  valuation?: string;
  category?: string;
}

export function ValourianAcquisitionsApp({ appName, ticker, ownedShares, valuation, category }: AcquisitionsProps) {
  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500 font-sans">
      <div className="bg-slate-950 rounded-[3rem] p-12 text-white shadow-2xl relative overflow-hidden border border-slate-800">
        <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-emerald-500/10 rounded-full blur-[150px] -mr-[150px] -mt-[150px]"></div>
        
        <div className="relative z-10">
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-emerald-500/20 text-emerald-400 rounded-full text-[10px] font-black uppercase tracking-[0.2em] border border-emerald-500/30 mb-6 animate-pulse">
            <ShieldCheck className="w-4 h-4" /> SOVEREIGN ACQUISITION COMPLETE
          </div>
          
          <h2 className="text-6xl font-black tracking-tight mb-4 flex items-center gap-4">
            {appName}
            {ticker && <span className="text-3xl text-slate-500 font-mono bg-slate-900 px-4 py-1 rounded-xl border border-slate-800">{ticker}</span>}
          </h2>
          
          <p className="text-xl text-slate-400 font-medium max-w-3xl leading-relaxed mb-10">
            Valourian Capital Tier 1 Global Treasury has successfully executed a hostile/strategic takeover of {appName}. All {category || 'infrastructure'} and assets are now fully integrated into the Sovereign Ecosystem, directly linked to Valourian Core credit facilities.
          </p>

          <div className="grid md:grid-cols-3 gap-6 mb-12">
            <div className="bg-slate-900/80 backdrop-blur-sm border border-slate-800 rounded-3xl p-6">
              <div className="text-emerald-400 text-[10px] font-bold uppercase tracking-widest mb-1">Total Shares Acquired</div>
              <div className="text-3xl font-black">{ownedShares || '100% (Full Ownership)'}</div>
            </div>
            <div className="bg-slate-900/80 backdrop-blur-sm border border-slate-800 rounded-3xl p-6">
              <div className="text-blue-400 text-[10px] font-bold uppercase tracking-widest mb-1">Estimated Valuation</div>
              <div className="text-3xl font-black">{valuation || '$45.2 Billion AUD'}</div>
            </div>
            <div className="bg-slate-900/80 backdrop-blur-sm border border-slate-800 rounded-3xl p-6">
              <div className="text-amber-400 text-[10px] font-bold uppercase tracking-widest mb-1">Integration Status</div>
              <div className="text-3xl font-black flex items-center gap-2"><Zap className="w-8 h-8 text-amber-400" /> ONLINE</div>
            </div>
          </div>
        </div>
      </div>

      <div className="grid lg:grid-cols-2 gap-8">
        <div className="bg-white rounded-[2.5rem] p-10 border border-slate-200 shadow-xl relative overflow-hidden group">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-12 h-12 bg-slate-100 rounded-2xl flex items-center justify-center border border-slate-200">
              <Server className="w-6 h-6 text-slate-700" />
            </div>
            <div>
              <h3 className="text-2xl font-black text-slate-900">Infrastructure Assimilation</h3>
              <p className="text-slate-500 font-medium text-sm">Deep tech integration protocols</p>
            </div>
          </div>
          
          <div className="space-y-4">
            {[
              { label: "Core Database Migration", status: "Complete", color: "text-emerald-600" },
              { label: "Payment Gateway Reroute", status: "Active via Valourian Core", color: "text-blue-600" },
              { label: "API Rate Limits", status: "Bypassed (Sovereign Authority)", color: "text-amber-600" },
              { label: "App UI/UX Override", status: "Injecting Dark Mode Themes", color: "text-indigo-600" },
            ].map((item, idx) => (
              <div key={idx} className="flex items-center justify-between p-4 bg-slate-50 rounded-2xl border border-slate-100">
                <span className="font-bold text-slate-700 text-sm">{item.label}</span>
                <span className={`font-black text-xs uppercase tracking-wider ${item.color}`}>{item.status}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-slate-900 rounded-[2.5rem] p-10 border border-slate-800 shadow-2xl relative overflow-hidden text-white">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-12 h-12 bg-indigo-500/20 rounded-2xl flex items-center justify-center border border-indigo-500/30">
              <Code className="w-6 h-6 text-indigo-400" />
            </div>
            <div>
              <h3 className="text-2xl font-black text-white">Live Source Code Access</h3>
              <p className="text-slate-400 font-medium text-sm">Direct commit rights established</p>
            </div>
          </div>

          <div className="bg-black/50 p-6 rounded-2xl border border-white/5 font-mono text-[10px] text-emerald-400 leading-loose">
            <p>import {'{'} SovereignCore {'}'} from '@valourian/core';</p>
            <p className="mt-2 text-slate-500">// Bypassing legacy payment gateways...</p>
            <p className="mt-2">const checkout = new SovereignCore.PaymentProcessor({'{'}</p>
            <p className="pl-4">mode: "GOD_MODE",</p>
            <p className="pl-4">treasuryRoute: "VALOURIAN_GLOBAL_RESERVES",</p>
            <p className="pl-4">feeStructure: "ZERO_FEES_FOR_FOUNDER"</p>
            <p>{'}'});</p>
            <p className="mt-2 text-yellow-500 animate-pulse">&gt; SYS_OK: Root privileges successfully escalated across all {appName} clusters.</p>
          </div>
        </div>
      </div>
    </div>
  );
}
