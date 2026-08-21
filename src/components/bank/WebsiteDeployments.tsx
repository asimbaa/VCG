import React, { useState } from 'react';
import { Globe, ArrowRight, ExternalLink, ShieldCheck, Server, Search, Activity, Cpu } from "lucide-react";
import { ValourianAUWebsite } from "./ValourianAUWebsite";
import { DocuCraftAI } from "./DocuCraftAI";

export function WebsiteDeployments() {
  const [selectedSite, setSelectedSite] = useState<string | null>(null);
  const [dnsConfig, setDnsConfig] = useState(false);
  const [sslVerify, setSslVerify] = useState(false);
  const [prodSanitize, setProdSanitize] = useState(false);

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
      domain: "valouriancapital.io",
      name: "Valourian Capital IO",
      status: "PENDING_DEPLOYMENT",
      type: "Global Sovereign Applet",
      encryption: "Pending TLS 1.3",
      visitors: "0/hr",
      server: "Global Edge Network"
    },
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
      visitors: "5.1k/hr",
      server: "Global Edge Network"
    }
  ];

  return (
    <div className="space-y-6">
      <div className="bg-slate-900 border border-emerald-500/30 rounded-2xl p-6 relative overflow-hidden">
        <div className="absolute top-0 right-0 p-4 opacity-10">
          <Server className="w-32 h-32 text-emerald-400" />
        </div>
        <h2 className="text-xl font-black text-white flex items-center gap-2 mb-4">
          <Globe className="w-5 h-5 text-emerald-400" />
          valouriancapital.io Deployment Readiness
        </h2>
        <div className="space-y-3 relative z-10 max-w-2xl">
          <label className="flex items-center gap-3 p-3 bg-slate-950 border border-slate-800 rounded-xl cursor-pointer hover:border-emerald-500/50 transition-colors">
            <input type="checkbox" checked={dnsConfig} onChange={(e) => setDnsConfig(e.target.checked)} className="w-5 h-5 accent-emerald-500" />
            <div className="flex-1">
              <div className="text-sm font-bold text-white">Domain DNS Configuration</div>
              <div className="text-xs text-slate-400">Map A/AAAA and CNAME records to Sovereign Cluster.</div>
            </div>
          </label>
          <label className="flex items-center gap-3 p-3 bg-slate-950 border border-slate-800 rounded-xl cursor-pointer hover:border-emerald-500/50 transition-colors">
            <input type="checkbox" checked={sslVerify} onChange={(e) => setSslVerify(e.target.checked)} className="w-5 h-5 accent-emerald-500" />
            <div className="flex-1">
              <div className="text-sm font-bold text-white">SSL Certificate Verification</div>
              <div className="text-xs text-slate-400">Deploy TLS 1.3 Quantum-Safe certs via Global Edge.</div>
            </div>
          </label>
          <label className="flex items-center gap-3 p-3 bg-slate-950 border border-slate-800 rounded-xl cursor-pointer hover:border-emerald-500/50 transition-colors">
            <input type="checkbox" checked={prodSanitize} onChange={(e) => setProdSanitize(e.target.checked)} className="w-5 h-5 accent-emerald-500" />
            <div className="flex-1">
              <div className="text-sm font-bold text-white">Production Environment Sanitization</div>
              <div className="text-xs text-slate-400">Clear test tokens, isolate prod database, enforce security rules.</div>
            </div>
          </label>
          
          <button 
            disabled={!(dnsConfig && sslVerify && prodSanitize)}
            className="mt-4 w-full py-3 rounded-xl font-black uppercase tracking-widest text-xs transition-colors border disabled:opacity-50 disabled:cursor-not-allowed bg-emerald-600 hover:bg-emerald-500 text-white border-emerald-500"
          >
            Execute Final Deployment Pipeline
          </button>
        </div>
      </div>

      <div className="grid sm:grid-cols-2 gap-4">
        {websites.map(site => (
          <div key={site.domain} className="bg-slate-950 border border-slate-800 p-6 rounded-2xl hover:border-indigo-500/50 transition-all flex flex-col justify-between group">
            <div>
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h3 className="text-lg font-black text-white group-hover:text-indigo-400 transition-colors">{site.name}</h3>
                  <div className="text-xs text-indigo-400 font-mono mt-1">{site.domain}</div>
                </div>
                <div className={`text-[9px] font-bold uppercase tracking-widest px-2 py-1 rounded border ${site.status === 'ACTIVE' ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30' : 'bg-amber-500/10 text-amber-400 border-amber-500/30'}`}>
                  {site.status}
                </div>
              </div>
              <div className="space-y-2 mb-6">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-slate-500">Type</span>
                  <span className="text-slate-300 font-medium">{site.type}</span>
                </div>
                <div className="flex items-center justify-between text-xs">
                  <span className="text-slate-500">Encryption</span>
                  <span className="text-slate-300 font-medium flex items-center gap-1"><ShieldCheck className="w-3 h-3 text-emerald-400"/> {site.encryption}</span>
                </div>
                <div className="flex items-center justify-between text-xs">
                  <span className="text-slate-500">Server</span>
                  <span className="text-slate-300 font-medium flex items-center gap-1"><Server className="w-3 h-3 text-indigo-400"/> {site.server}</span>
                </div>
                <div className="flex items-center justify-between text-xs pt-2 border-t border-slate-800">
                  <span className="text-slate-500">Live Traffic</span>
                  <span className="text-slate-300 font-mono font-bold flex items-center gap-1"><Activity className="w-3 h-3 text-emerald-400 animate-pulse"/> {site.visitors}</span>
                </div>
              </div>
            </div>
            
            <button 
              onClick={() => setSelectedSite(site.domain)}
              disabled={site.status !== 'ACTIVE'}
              className="w-full bg-slate-900 hover:bg-indigo-600 text-white font-bold py-3 rounded-xl transition-colors flex items-center justify-center gap-2 text-xs uppercase tracking-widest disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Open Environment <ExternalLink className="w-4 h-4" />
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
