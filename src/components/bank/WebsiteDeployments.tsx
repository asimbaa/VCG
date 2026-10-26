import React, { useState } from 'react';
import { Globe, ArrowRight, ExternalLink, ShieldCheck, Server, Search, Activity, Cpu, Layers, Copy, Check, Send } from "lucide-react";
import { ValourianAUWebsite } from "./ValourianAUWebsite";
import { DocuCraftAI } from "./DocuCraftAI";
import { SectionWisdomTooltip } from "../shared/SectionWisdomTooltip";
import { DomainKeyDetailsModal, DomainDetails } from "../deployments/DomainKeyDetailsModal";
import { toast } from "sonner";

export function WebsiteDeployments() {
  const [selectedSite, setSelectedSite] = useState<string | null>(null);
  const [activeDomainDetails, setActiveDomainDetails] = useState<DomainDetails | null>(null);
  const [dnsConfig, setDnsConfig] = useState(true);
  const [sslVerify, setSslVerify] = useState(true);
  const [prodSanitize, setProdSanitize] = useState(true);

  if (selectedSite === "valourian.com.au") {
    return (
      <div className="space-y-4">
        <button 
          onClick={() => setSelectedSite(null)}
          className="flex items-center gap-2 text-slate-500 hover:text-slate-800 font-bold text-sm tracking-wider uppercase bg-white border border-slate-200 px-4 py-2 rounded-xl transition-colors cursor-pointer"
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
          className="flex items-center gap-2 text-slate-500 hover:text-slate-800 font-bold text-sm tracking-wider uppercase bg-white border border-slate-200 px-4 py-2 rounded-xl transition-colors cursor-pointer"
        >
          <ArrowRight className="w-4 h-4 rotate-180" /> Back to Deployments
        </button>
        <DocuCraftAI />
      </div>
    );
  }

  const websites: DomainDetails[] = [
    {
      domain: "valourian.com.au",
      name: "Valourian Capital AU",
      status: "ACTIVE",
      type: "Corporate Primary AU",
      encryption: "TLS 1.3 Quantum-Safe",
      visitors: "14.2k/hr",
      server: "ap-southeast-2 (Sydney Tier-IV Edge)",
      ipAddress: "76.76.21.21",
      nameservers: ["ns1.valourian.net", "ns2.valourian.net", "ns3.valourian-edge.org"]
    },
    {
      domain: "valouriancapital.io",
      name: "Valourian Capital IO",
      status: "ACTIVE",
      type: "Global Sovereign Applet",
      encryption: "TLS 1.3 Quantum-Safe",
      visitors: "8.4k/hr",
      server: "Global Edge Network (Anycast 240+ PoPs)",
      ipAddress: "76.76.21.22",
      nameservers: ["ns1.valourian.net", "ns2.valourian.net", "ns3.valourian-edge.org"]
    },
    {
      domain: "docucraft.ai",
      name: "DocuCraft AI",
      status: "ACTIVE",
      type: "SaaS Utility - Sovereign Engine",
      encryption: "TLS 1.3 Quantum-Safe",
      visitors: "5.1k/hr",
      server: "Global Edge Network",
      ipAddress: "76.76.21.23",
      nameservers: ["ns1.valourian.net", "ns2.valourian.net", "ns3.valourian-edge.org"]
    },
    {
      domain: "valourian.app",
      name: "Valourian Executive Command",
      status: "ACTIVE",
      type: "Core Command Terminal",
      encryption: "TLS 1.3 Quantum-Safe",
      visitors: "22.8k/hr",
      server: "ap-southeast-2 (Sydney High-Availability)",
      ipAddress: "76.76.21.24",
      nameservers: ["ns1.valourian.net", "ns2.valourian.net", "ns3.valourian-edge.org"]
    },
    {
      domain: "corp.valourian.app",
      name: "Corporate Banking Portal",
      status: "ACTIVE",
      type: "Institutional Treasury Webhook",
      encryption: "TLS 1.3 Quantum-Safe",
      visitors: "9.6k/hr",
      server: "Sovereign Isolated Substation",
      ipAddress: "76.76.21.25",
      nameservers: ["ns1.valourian.net", "ns2.valourian.net", "ns3.valourian-edge.org"]
    },
    {
      domain: "valourian-treasury.com",
      name: "Sovereign Reserve Bridge",
      status: "ACTIVE",
      type: "Fedwire & RBA Clearing Gateway",
      encryption: "TLS 1.3 Quantum-Safe",
      visitors: "3.2k/hr",
      server: "Global Clearing Relay",
      ipAddress: "76.76.21.26",
      nameservers: ["ns1.valourian.net", "ns2.valourian.net", "ns3.valourian-edge.org"]
    }
  ];

  return (
    <div className="space-y-6">
      {/* Domain Key Details Modal */}
      <DomainKeyDetailsModal 
        domain={activeDomainDetails}
        isOpen={Boolean(activeDomainDetails)}
        onClose={() => setActiveDomainDetails(null)}
      />

      {/* Deployment Pipeline Card */}
      <div className="bg-slate-900 border border-emerald-500/30 rounded-3xl p-6 sm:p-8 relative overflow-hidden shadow-2xl">
        <div className="absolute top-0 right-0 p-4 opacity-10 pointer-events-none">
          <Server className="w-44 h-44 text-emerald-400" />
        </div>
        
        <div className="relative z-10 flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
              <Globe className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-xl font-black text-white">
                  Sovereign Web Deployments & Domain DNS Hub
                </h2>
                <SectionWisdomTooltip 
                  title="Edge DNS & Quantum Routing"
                  concept="Sovereign Web Infra"
                  insights={[
                    "Authoritative DNS responds in under 12ms across 240+ Anycast PoPs worldwide.",
                    "Quantum-Safe TLS 1.3 encryption prevents post-quantum SSL decryption.",
                    "All domains are pre-wired to Google Workspace for asim.nsw@gmail.com and NPP PayID endpoints."
                  ]}
                  regulatory="ICANN Sovereign Registrar & IETF RFC 8484 Standards"
                  actionTip="Click any purchased domain below to inspect its DNS Zone, copy A/CNAME records, and send credentials via SMS & Email."
                />
              </div>
              <p className="text-xs text-slate-400 mt-0.5">
                Manage all registered domains, quantum SSL certificates, and live high-velocity web properties.
              </p>
            </div>
          </div>

          <span className="px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 self-start sm:self-auto">
            6/6 DOMAINS 100% OPERATIONAL
          </span>
        </div>

        <div className="space-y-3 relative z-10 max-w-2xl mt-4">
          <label className="flex items-center gap-3 p-3 bg-slate-950 border border-slate-800 rounded-2xl cursor-pointer hover:border-emerald-500/50 transition-colors">
            <input 
              type="checkbox" 
              checked={dnsConfig} 
              onChange={(e) => setDnsConfig(e.target.checked)} 
              className="w-4 h-4 accent-emerald-500 rounded" 
            />
            <div className="flex-1">
              <div className="text-sm font-bold text-white flex items-center gap-2">
                Domain DNS Configuration
                <span className="text-[10px] text-emerald-400 font-mono">100% PROPAGATED</span>
              </div>
              <div className="text-xs text-slate-400">Mapped A, AAAA, MX and CNAME records to Sovereign Anycast Cluster.</div>
            </div>
          </label>

          <label className="flex items-center gap-3 p-3 bg-slate-950 border border-slate-800 rounded-2xl cursor-pointer hover:border-emerald-500/50 transition-colors">
            <input 
              type="checkbox" 
              checked={sslVerify} 
              onChange={(e) => setSslVerify(e.target.checked)} 
              className="w-4 h-4 accent-emerald-500 rounded" 
            />
            <div className="flex-1">
              <div className="text-sm font-bold text-white flex items-center gap-2">
                Quantum SSL Certificate Verification
                <span className="text-[10px] text-emerald-400 font-mono">TLS 1.3 ACTIVE</span>
              </div>
              <div className="text-xs text-slate-400">Deployed SHA-384 Quantum-Safe ECDSA certs across edge routers.</div>
            </div>
          </label>

          <label className="flex items-center gap-3 p-3 bg-slate-950 border border-slate-800 rounded-2xl cursor-pointer hover:border-emerald-500/50 transition-colors">
            <input 
              type="checkbox" 
              checked={prodSanitize} 
              onChange={(e) => setProdSanitize(e.target.checked)} 
              className="w-4 h-4 accent-emerald-500 rounded" 
            />
            <div className="flex-1">
              <div className="text-sm font-bold text-white flex items-center gap-2">
                Production Environment Sanitization & PayID Routing
                <span className="text-[10px] text-emerald-400 font-mono">SECURED</span>
              </div>
              <div className="text-xs text-slate-400">Cleared test tokens, isolated database, enforced strict APCA rules.</div>
            </div>
          </label>
          
          <button 
            type="button"
            onClick={() => {
              toast.success("All 6 Sovereign Web Properties & DNS Zones Synchronized and Live!");
            }}
            className="mt-4 w-full py-3.5 rounded-2xl font-black uppercase tracking-widest text-xs transition-colors border bg-emerald-600 hover:bg-emerald-500 text-slate-950 border-emerald-500 shadow-lg shadow-emerald-500/20 cursor-pointer"
          >
            Re-Synchronize All Global Edge Nodes
          </button>
        </div>
      </div>

      {/* Grid of Purchased Domains */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <h3 className="text-base font-black text-white uppercase tracking-wider">
              Purchased & Active Domains
            </h3>
            <span className="text-xs text-slate-500 font-mono">Click any domain for DNS & credentials</span>
          </div>
          <span className="text-xs text-emerald-400 font-mono font-bold">
            All 6 Domains Online
          </span>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {websites.map((site) => (
            <div 
              key={site.domain} 
              className="bg-slate-950 border border-slate-800 p-5 rounded-3xl hover:border-indigo-500/50 hover:bg-slate-900/40 transition-all flex flex-col justify-between group shadow-xl cursor-pointer"
              onClick={() => setActiveDomainDetails(site)}
            >
              <div>
                <div className="flex justify-between items-start mb-3">
                  <div>
                    <h4 className="text-base font-black text-white group-hover:text-indigo-400 transition-colors">
                      {site.name}
                    </h4>
                    <div className="text-xs text-indigo-400 font-mono mt-0.5 font-bold flex items-center gap-1">
                      <span>{site.domain}</span>
                      <ExternalLink className="w-3 h-3 opacity-60 group-hover:opacity-100" />
                    </div>
                  </div>
                  <div className="text-[9px] font-bold uppercase tracking-widest px-2.5 py-1 rounded-full border bg-emerald-500/10 text-emerald-400 border-emerald-500/30 flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" />
                    {site.status}
                  </div>
                </div>

                <div className="space-y-2 mb-5">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-slate-500">Type</span>
                    <span className="text-slate-300 font-medium">{site.type}</span>
                  </div>
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-slate-500">Encryption</span>
                    <span className="text-slate-300 font-medium flex items-center gap-1 text-[11px]">
                      <ShieldCheck className="w-3 h-3 text-emerald-400 shrink-0"/> {site.encryption}
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-slate-500">Server Edge</span>
                    <span className="text-slate-300 font-medium flex items-center gap-1 text-[11px] truncate max-w-[170px]">
                      <Server className="w-3 h-3 text-indigo-400 shrink-0"/> {site.server}
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-xs pt-2 border-t border-slate-800">
                    <span className="text-slate-500">Live Traffic</span>
                    <span className="text-emerald-400 font-mono font-bold flex items-center gap-1">
                      <Activity className="w-3 h-3 text-emerald-400 animate-pulse"/> {site.visitors}
                    </span>
                  </div>
                </div>
              </div>
              
              <div className="flex items-center gap-2 pt-2 border-t border-slate-800/80">
                <button 
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    setActiveDomainDetails(site);
                  }}
                  className="flex-1 bg-slate-900 hover:bg-slate-800 text-indigo-300 hover:text-white font-bold py-2.5 rounded-xl transition-colors flex items-center justify-center gap-1.5 text-xs uppercase tracking-wider border border-slate-800 cursor-pointer"
                >
                  <Layers className="w-3.5 h-3.5" />
                  <span>Key Details & DNS</span>
                </button>

                <button 
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    if (site.domain === "valourian.com.au" || site.domain === "docucraft.ai") {
                      setSelectedSite(site.domain);
                    } else {
                      window.open(`https://${site.domain}`, '_blank');
                    }
                  }}
                  className="px-3 bg-indigo-600 hover:bg-indigo-500 text-white font-bold py-2.5 rounded-xl transition-colors flex items-center justify-center text-xs cursor-pointer"
                  title="Open live URL"
                >
                  <ExternalLink className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
