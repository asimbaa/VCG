import React, { useState } from 'react';
import { Globe, ArrowRight, ExternalLink, ShieldCheck, Server, Search, Activity, Cpu } from "lucide-react";
import { ValourianAUWebsite } from "./ValourianAUWebsite";
import { DocuCraftAI } from "./DocuCraftAI";

export function WebsiteDeployments() {
  const [selectedSite, setSelectedSite] = useState<string | null>(null);

  if (selectedSite === "valourian.com.au") {
    return (
      <div className="space-y-4">
        <button 
          onClick={() => setSelectedSite(null)}
          className="flex items-center gap-2 text-slate-500 hover:text-slate-800 font-bold text-sm tracking-wider uppercase bg-white border border-slate-200 px-4 py-2 rounded-xl transition-colors"
        >
          <ArrowRight className="w-4 h-4 rotate-180" /> Back to Deployments
        </button>
        <ValourianAUWebsite />
      </div>
    );
  } else if (selectedSite === "docucraft.ai") {
    return (
      <div className="space-y-4">
        <button 
          onClick={() => setSelectedSite(null)}
          className="flex items-center gap-2 text-slate-500 hover:text-slate-800 font-bold text-sm tracking-wider uppercase bg-white border border-slate-200 px-4 py-2 rounded-xl transition-colors"
        >
          <ArrowRight className="w-4 h-4 rotate-180" /> Back to Deployments
        </button>
        <DocuCraftAI />
      </div>
    );
  }

  const websites = [
    {
      domain: "valourian.com.au",
      name: "Valourian Capital AU",
      status: "ACTIVE",
      type: "Corporate Primary",
      encryption: "TLS 1.3 Quantum-Safe",
      visitors: "14.2k/hr",
      server: "ap-southeast-2 (Sydney)"
    },
    {
      domain: "docucraft.ai",
      name: "DocuCraft AI",
      status: "ACTIVE",
      type: "SaaS Utility - Sovereign Engine",
      encryption: "TLS 1.3 Quantum-Safe",
      visitors: "Neural Sync",
      server: "Global Edge Network"
    },
    {
      domain: "valourian.capital",
      name: "Valourian Global Citadel",
      status: "ACTIVE",
      type: "Global Treasury",
      encryption: "TLS 1.3 Quantum-Safe",
      visitors: "42.8k/hr",
      server: "us-east-1 (N. Virginia)"
    },
    {
      domain: "aura.valourian.com.au",
      name: "Aura Neural Fleet",
      status: "ACTIVE",
      type: "Internal API Gateway",
      encryption: "TLS 1.3 Quantum-Safe",
      visitors: "System Sync",
      server: "ap-southeast-2 (Sydney)"
    }
  ];

  return (
    <div className="space-y-6">
      <div className="bg-slate-50 flex items-center justify-between p-4 rounded-[2rem] border border-slate-200 shadow-sm">
        <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-blue-500/10 flex items-center justify-center border border-blue-500/20">
                <Globe className="w-5 h-5 text-blue-600" />
            </div>
            <div>
                <h2 className="font-black text-slate-800 uppercase tracking-widest text-sm">WEBSITE DEPLOYMENTS</h2>
                <p className="text-xs text-slate-500 font-mono">Global Domain & Hosting Matrix</p>
            </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
         {/* Stats */}
         <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm space-y-2">
            <div className="text-slate-400 font-mono text-[10px] uppercase font-bold tracking-widest flex items-center gap-2">
               <Globe className="w-3.5 h-3.5" /> Total Active Domains
            </div>
            <div className="text-3xl font-black text-slate-900">12</div>
         </div>
         <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm space-y-2">
            <div className="text-emerald-500 font-mono text-[10px] uppercase font-bold tracking-widest flex items-center gap-2">
               <Activity className="w-3.5 h-3.5" /> Matrix Uptime
            </div>
            <div className="text-3xl font-black text-slate-900">99.999%</div>
         </div>
         <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm space-y-2">
            <div className="text-blue-500 font-mono text-[10px] uppercase font-bold tracking-widest flex items-center gap-2">
               <ShieldCheck className="w-3.5 h-3.5" /> Protected Routing
            </div>
            <div className="text-3xl font-black text-slate-900">100%</div>
         </div>
         <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm space-y-2">
            <div className="text-amber-500 font-mono text-[10px] uppercase font-bold tracking-widest flex items-center gap-2">
               <Server className="w-3.5 h-3.5" /> Global Nodes
            </div>
            <div className="text-3xl font-black text-slate-900">8</div>
         </div>
      </div>

      <div className="bg-white rounded-[2.5rem] border border-slate-200 shadow-xl overflow-hidden min-h-[600px]">
         <div className="p-6 md:p-8 border-b border-slate-100 flex flex-col md:flex-row gap-4 items-center justify-between bg-slate-50">
            <h3 className="font-black text-lg text-slate-800 flex items-center gap-2">
              <Server className="w-5 h-5 text-slate-400" /> Network Assets
            </h3>
            <div className="relative w-full md:w-64">
               <Search className="w-4 h-4 text-slate-400 absolute left-4 top-1/2 -translate-y-1/2" />
               <input 
                 type="text" 
                 placeholder="Search domains..." 
                 className="w-full bg-white border border-slate-200 rounded-full pl-10 pr-4 py-2.5 text-sm font-bold text-slate-700 focus:outline-none focus:ring-2 focus:ring-emerald-500"
               />
            </div>
         </div>

         <div className="p-0">
           <table className="w-full text-left border-collapse">
             <thead>
               <tr className="bg-slate-50/50 border-b border-slate-100 text-[10px] uppercase font-black tracking-widest text-slate-400">
                 <th className="px-8 py-4 font-bold">Domain Identity</th>
                 <th className="px-8 py-4 font-bold">Status</th>
                 <th className="px-8 py-4 font-bold">Encryption Protocol</th>
                 <th className="px-8 py-4 font-bold">Node Location</th>
                 <th className="px-8 py-4 font-bold text-right">Actions</th>
               </tr>
             </thead>
             <tbody>
                {websites.map((site, i) => (
                  <tr key={i} className="border-b border-slate-50 hover:bg-slate-50/50 transition-colors group cursor-pointer" onClick={() => { if(site.domain === "valourian.com.au" || site.domain === "docucraft.ai") setSelectedSite(site.domain) }}>
                     <td className="px-8 py-6">
                        <div className="flex items-center gap-4">
                           <div className={`p-2.5 rounded-xl border ${site.status === 'ACTIVE' ? 'bg-emerald-50 border-emerald-100 text-emerald-600' : 'bg-amber-50 border-amber-100 text-amber-600'}`}>
                              <Globe className="w-5 h-5" />
                           </div>
                           <div>
                              <p className="font-bold text-slate-900 group-hover:text-emerald-700 transition-colors">{site.domain}</p>
                              <p className="text-xs text-slate-500 font-medium">{site.name} • {site.type}</p>
                           </div>
                        </div>
                     </td>
                     <td className="px-8 py-6">
                        <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest border ${
                           site.status === 'ACTIVE' ? 'bg-emerald-500/10 text-emerald-700 border-emerald-500/20' : 'bg-amber-500/10 text-amber-700 border-amber-500/20 animate-pulse'
                        }`}>
                           {site.status === 'ACTIVE' && <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>}
                           {site.status}
                        </span>
                     </td>
                     <td className="px-8 py-6">
                        <div className="flex items-center gap-2 text-xs font-mono font-bold text-slate-600">
                           <ShieldCheck className={`w-3.5 h-3.5 ${site.encryption.includes('Quantum') ? 'text-blue-500' : 'text-slate-400'}`} />
                           {site.encryption}
                        </div>
                     </td>
                     <td className="px-8 py-6">
                        <div className="flex items-center gap-2 text-xs font-mono font-bold text-slate-500">
                           <Cpu className="w-3.5 h-3.5 text-slate-400" /> {site.server}
                        </div>
                     </td>
                     <td className="px-8 py-6 text-right">
                        <button 
                          className={`inline-flex items-center justify-center p-2.5 rounded-full border bg-white transition-all ${
                            site.domain === "valourian.com.au" 
                              ? "border-emerald-200 text-emerald-600 hover:bg-emerald-50 hover:border-emerald-300 shadow-sm" 
                              : "border-slate-200 text-slate-400 hover:text-slate-600 hover:bg-slate-50"
                          }`}
                          onClick={(e) => {
                             if (site.domain !== "valourian.com.au") {
                               e.stopPropagation();
                             }
                          }}
                        >
                           <ExternalLink className="w-4 h-4" />
                        </button>
                     </td>
                  </tr>
                ))}
             </tbody>
           </table>
         </div>
      </div>
    </div>
  );
}
