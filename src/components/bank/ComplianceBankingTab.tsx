import React from 'react';
import { ShieldCheck, Building2, Globe, FileText, CheckCircle2, Lock, Fingerprint, Activity, Server, Users, ArrowRight } from 'lucide-react';

export function ComplianceBankingTab() {
  const partners = [
    { name: "J.P. Morgan Chase", type: "Global Clearing & Custody", status: "ACTIVE INTEGRATION", limit: "Unlimited / T+0" },
    { name: "Goldman Sachs", type: "Prime Brokerage & Dark Pool", status: "ACTIVE INTEGRATION", limit: "$50B Daily Facility" },
    { name: "Commonwealth Bank (CBA)", type: "Domestic RBA Rails", status: "ACTIVE INTEGRATION", limit: "Direct RBA Settlement" },
    { name: "Stripe Treasury", type: "Banking-as-a-Service", status: "ACTIVE INTEGRATION", limit: "API Issuance Engine" }
  ];

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      <div className="bg-slate-900 rounded-3xl p-8 border border-slate-800 shadow-2xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-emerald-600/10 rounded-full blur-[100px] pointer-events-none translate-x-1/3 -translate-y-1/3" />
        
        <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6 relative z-10">
          <div>
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 bg-emerald-500/10 border border-emerald-500/20 rounded-xl flex items-center justify-center">
                <ShieldCheck className="w-6 h-6 text-emerald-400" />
              </div>
              <div>
                <h1 className="text-3xl font-black text-white uppercase tracking-widest">Digital Bank Issuance & Compliance</h1>
                <p className="text-slate-400 font-mono text-sm">Tier-1 Banking Partnerships, KYC/AML Infrastructure, and Global BaaS Capabilities.</p>
              </div>
            </div>
            
            <div className="mt-8">
              <div className="text-slate-500 font-black uppercase tracking-widest text-xs mb-1">Global Transaction Authorization Limit</div>
              <div className="text-5xl font-black text-white tracking-tighter flex items-center gap-4">
                UNLIMITED (T+0)
                <span className="text-sm font-bold text-emerald-400 bg-emerald-500/10 px-3 py-1 rounded-full border border-emerald-500/20 flex items-center gap-1">
                  <CheckCircle2 className="w-4 h-4" /> Full KYC Clear
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="space-y-6">
          <div className="bg-white rounded-3xl border border-slate-200 p-6">
            <h3 className="font-black text-slate-900 uppercase tracking-widest text-sm flex items-center gap-2 mb-6">
              <Building2 className="w-5 h-5 text-indigo-600" /> Tier-1 Banking Partnerships
            </h3>
            <p className="text-sm text-slate-500 font-medium mb-6 leading-relaxed">
              Our direct integrations with the world's most powerful financial institutions allow Valourian to bypass retail limits, issue digital bank architectures, and command massive liquidity pools natively.
            </p>
            <div className="space-y-3">
              {partners.map((p, i) => (
                <div key={i} className="flex flex-col md:flex-row md:items-center justify-between p-4 bg-slate-50 border border-slate-100 rounded-xl hover:border-indigo-200 transition-colors">
                  <div>
                    <div className="font-bold text-slate-900 text-sm">{p.name}</div>
                    <div className="text-xs text-slate-500">{p.type}</div>
                  </div>
                  <div className="text-right mt-3 md:mt-0">
                    <div className="text-[10px] font-black uppercase tracking-widest text-emerald-600 bg-emerald-100 px-2 py-0.5 rounded inline-block mb-1">
                      {p.status}
                    </div>
                    <div className="text-xs font-mono font-bold text-slate-700">{p.limit}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-indigo-600 rounded-3xl p-6 text-white relative overflow-hidden shadow-xl">
             <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full blur-2xl -mr-10 -mt-10 pointer-events-none" />
             <Server className="w-8 h-8 text-indigo-300 mb-4" />
             <h4 className="font-bold text-xl mb-2 tracking-wide">BaaS: Digital Bank Issuance Engine</h4>
             <p className="text-indigo-100 text-sm leading-relaxed mb-6 font-medium">
               Valourian holds direct API access to instantiate fully compliant, white-labeled digital bank accounts, complete with dedicated routing numbers, IBANs, and automated KYC onboarding flows for global entities.
             </p>
             <button className="bg-white text-indigo-900 font-black uppercase tracking-widest text-xs px-6 py-3 rounded-xl hover:bg-slate-100 transition-colors w-full md:w-auto shadow-lg shadow-indigo-900/50">
               Initialize New Sovereign Bank Entity
             </button>
          </div>
        </div>

        <div className="space-y-6">
          <div className="bg-slate-900 rounded-3xl border border-slate-800 p-6">
            <h3 className="font-black text-white uppercase tracking-widest text-sm flex items-center gap-2 mb-6 pb-4 border-b border-slate-800">
              <Fingerprint className="w-5 h-5 text-emerald-400" /> Compliance & AML Infrastructure
            </h3>
            
            <div className="relative border-l border-slate-700 ml-4 space-y-6 pb-2">
              <div className="relative pl-6">
                <div className="absolute -left-[9px] top-1 w-4 h-4 bg-emerald-500 rounded-full border-4 border-slate-900" />
                <h4 className="text-white font-bold text-sm mb-1">Automated Global KYC/KYB</h4>
                <p className="text-slate-400 text-xs">Neural analysis of corporate structures, ultimate beneficial owners (UBOs), and instant clearance against global watchlists (OFAC, UN, Interpol).</p>
              </div>
              <div className="relative pl-6">
                <div className="absolute -left-[9px] top-1 w-4 h-4 bg-emerald-500 rounded-full border-4 border-slate-900" />
                <h4 className="text-white font-bold text-sm mb-1">High-Velocity Transaction Monitoring</h4>
                <p className="text-slate-400 text-xs">Proprietary AI flags anomalous liquidity movements across $100B+ cashflow streams before settlement, guaranteeing 100% regulatory compliance.</p>
              </div>
              <div className="relative pl-6">
                <div className="absolute -left-[9px] top-1 w-4 h-4 bg-emerald-500 rounded-full border-4 border-slate-900" />
                <h4 className="text-white font-bold text-sm mb-1">Cryptographic Proof-of-Reserves</h4>
                <p className="text-slate-400 text-xs">Real-time ZK-rollups providing mathematical certainty of 1:1 asset backing without exposing wallet architectures or trade secrets.</p>
              </div>
            </div>
            
            <div className="mt-8 bg-slate-950 p-4 rounded-xl border border-slate-800">
              <div className="flex justify-between items-center mb-2">
                <span className="text-[10px] font-black uppercase tracking-widest text-slate-500">Live Audit Status</span>
                <span className="text-xs font-mono text-emerald-400 font-bold">100% COMPLIANT</span>
              </div>
              <div className="w-full h-1.5 bg-slate-800 rounded-full overflow-hidden">
                <div className="w-full h-full bg-emerald-500 shadow-[0_0_10px_rgba(16,185,129,0.5)]" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-sm">
             <div className="flex items-center justify-between mb-4">
                <h3 className="font-black text-slate-900 uppercase tracking-widest text-sm flex items-center gap-2">
                  <Activity className="w-5 h-5 text-blue-600" /> Massive Cashflow Routing
                </h3>
             </div>
             <p className="text-sm text-slate-500 font-medium mb-6">
               Interfacing with Tier-1 banking partners allows seamless conversion and acquisition of massive asset pools without disrupting underlying market liquidity.
             </p>
             <div className="grid grid-cols-2 gap-4">
                <div className="bg-slate-50 border border-slate-100 p-4 rounded-2xl">
                  <div className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-1">Fiat Clearing Capacity</div>
                  <div className="text-xl font-black text-slate-900">$100B+ / Day</div>
                </div>
                <div className="bg-slate-50 border border-slate-100 p-4 rounded-2xl">
                  <div className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-1">Settlement Latency</div>
                  <div className="text-xl font-black text-blue-600">{'< 400ms'} (T+0)</div>
                </div>
             </div>
          </div>
        </div>
      </div>
    </div>
  );
}
