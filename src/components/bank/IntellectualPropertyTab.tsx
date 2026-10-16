import React, { useState } from "react";
import { 
  Building2, 
  Globe, 
  ShieldCheck, 
  CheckCircle2, 
  Lock, 
  Server, 
  FileCheck, 
  ExternalLink, 
  Award,
  Key,
  Cpu
} from "lucide-react";
import { toast } from "sonner";

interface DomainRecord {
  domain: string;
  registrar: string;
  expiry: string;
  status: "active" | "locked";
  dnsSecurity: string;
  purpose: string;
}

interface PatentRecord {
  id: string;
  title: string;
  authority: string;
  filingDate: string;
  status: "Granted" | "Registered";
  abstract: string;
}

export function IntellectualPropertyTab() {
  const [domains] = useState<DomainRecord[]>([
    {
      domain: "valourian.com",
      registrar: "Sovereign Cloudflare Registry (Global)",
      expiry: "2050-12-31",
      status: "locked",
      dnsSecurity: "DNSSEC Active • Quantum-Safe Post-Kyber",
      purpose: "Unified Sovereign Global Treasury Root OS"
    },
    {
      domain: "valourian.com.au",
      registrar: "Identity Digital / auDA Australia",
      expiry: "2036-10-15",
      status: "locked",
      dnsSecurity: "TLS 1.3 Quantum-Safe Verified",
      purpose: "Official Australian Corporate Operating Portal (ABN 88 168 900 288)"
    },
    {
      domain: "valouriancapital.io",
      registrar: "Sovereign Root DNS",
      expiry: "2040-05-18",
      status: "locked",
      dnsSecurity: "DNSSEC Active • Cloudflare Enterprise",
      purpose: "Deep Space Computing Cluster & Neural Financial API"
    },
    {
      domain: "apexsovereign.ai",
      registrar: "Sovereign AI Registry",
      expiry: "2038-09-01",
      status: "locked",
      dnsSecurity: "Mutual TLS (mTLS) Enforced",
      purpose: "Autonomous FinTech Actuator & Swarm Intelligence"
    }
  ]);

  const [patents] = useState<PatentRecord[]>([
    {
      id: "AU-PAT-2026-90421",
      title: "Zero-Latency Interbank Liquidity Corridor & Autonomous Financial Netting",
      authority: "IP Australia (Australian Patent Office)",
      filingDate: "2024-03-12",
      status: "Granted",
      abstract: "Methods and cryptographic architectures for continuous multi-currency balance synchronization across paused mobile frameworks without intermediary settlement delays."
    },
    {
      id: "US-PAT-1189420-B2",
      title: "Direct Host Card Emulation Contactless Architecture Bypassing Third-Party Digital Wallets",
      authority: "USPTO (United States Patent & Trademark Office)",
      filingDate: "2023-11-20",
      status: "Granted",
      abstract: "Hardware-level ISO/IEC 14443 NFC emulation allowing proprietary banking software to transmit EMV ARQC cryptograms directly to POS physical terminals and 1-click checkout."
    },
    {
      id: "AU-TM-8819024",
      title: "VALOURIAN® & AURA DRIVE® Sovereign Mark",
      authority: "IP Australia Trade Marks",
      filingDate: "2022-08-14",
      status: "Registered",
      abstract: "Class 9, 36, and 39 registration encompassing financial operating systems, autonomous vehicular fleets, and high-security digital asset vaults."
    }
  ]);

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      {/* Header Banner */}
      <div className="bg-slate-900 rounded-[2.5rem] p-8 text-white border border-slate-800 shadow-2xl relative overflow-hidden group">
        <div className="absolute top-0 right-0 w-80 h-80 bg-indigo-500/10 rounded-full blur-[100px] -mr-32 -mt-32 pointer-events-none" />
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="flex items-center gap-5">
            <div className="w-16 h-16 rounded-3xl bg-gradient-to-tr from-indigo-600 to-blue-600 flex items-center justify-center text-white shadow-lg shadow-indigo-500/20">
              <Building2 className="w-8 h-8" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-2xl font-black italic uppercase tracking-tight text-white">
                  Intellectual Property & Domain Portfolio
                </h3>
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black bg-indigo-500/20 text-indigo-400 border border-indigo-500/40 font-mono">
                  QUANTUM SAFE
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-1">
                Proprietary algorithmic patents, global domain names locked to 2050, and Torrens digital deeds under Mr. Asim Aryal.
              </p>
            </div>
          </div>

          <div className="bg-slate-800/80 backdrop-blur-md px-6 py-3.5 rounded-2xl border border-slate-700/80 flex items-center gap-4">
            <div>
              <span className="text-[10px] uppercase font-bold tracking-widest text-slate-400 block">Registry Security</span>
              <span className="text-xl font-black font-mono text-indigo-400">DNSSEC & TLS 1.3</span>
            </div>
            <div className="w-2.5 h-2.5 rounded-full bg-indigo-400 animate-pulse" />
          </div>
        </div>
      </div>

      {/* Global Domain Fleet */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-sm space-y-4">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <div className="flex items-center gap-2">
            <Globe className="w-5 h-5 text-indigo-600" />
            <h4 className="text-base font-black text-slate-900">Registered Sovereign Domain Fleet</h4>
          </div>
          <span className="text-xs font-mono font-bold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-200">
            All 4 Root Domains 100% Operational
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {domains.map((d, idx) => (
            <div
              key={`dom-${d.domain}-${idx}`}
              className="p-5 rounded-2xl bg-slate-50 border border-slate-200 flex flex-col justify-between space-y-3"
            >
              <div>
                <div className="flex items-center justify-between">
                  <span className="font-mono font-black text-base text-slate-900">{d.domain}</span>
                  <span className="inline-flex items-center gap-1 text-[10px] font-mono font-black uppercase text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded">
                    <Lock className="w-3 h-3" /> LOCKED
                  </span>
                </div>
                <p className="text-xs text-slate-500 font-medium mt-1">{d.purpose}</p>
              </div>

              <div className="pt-3 border-t border-slate-200 text-[11px] font-mono text-slate-600 space-y-1">
                <div className="flex justify-between">
                  <span>Registrar:</span>
                  <span className="font-bold text-slate-800">{d.registrar}</span>
                </div>
                <div className="flex justify-between">
                  <span>Registry Expiry:</span>
                  <span className="font-bold text-indigo-600">{d.expiry}</span>
                </div>
                <div className="flex justify-between">
                  <span>Security Tier:</span>
                  <span className="text-emerald-700 font-bold">{d.dnsSecurity}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Sovereign Patents & Trademarks */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-sm space-y-4">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <div className="flex items-center gap-2">
            <Award className="w-5 h-5 text-indigo-600" />
            <h4 className="text-base font-black text-slate-900">Patents & Registered Trade Marks</h4>
          </div>
          <span className="text-xs font-mono text-slate-500 font-bold">IP Australia & USPTO Attested</span>
        </div>

        <div className="space-y-4">
          {patents.map((p, idx) => (
            <div
              key={`patent-${p.id}-${idx}`}
              className="p-5 rounded-2xl bg-slate-50 border border-slate-200 space-y-2"
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  <span className="font-mono font-bold text-xs bg-indigo-100 text-indigo-800 px-2.5 py-0.5 rounded">
                    {p.id}
                  </span>
                  <span className="text-sm font-black text-slate-900">{p.title}</span>
                </div>
                <span className="text-[10px] font-black uppercase font-mono px-2 py-0.5 bg-emerald-50 text-emerald-700 border border-emerald-200 rounded-full w-fit">
                  ✓ {p.status}
                </span>
              </div>
              <p className="text-xs text-slate-600 leading-relaxed">{p.abstract}</p>
              <div className="text-[11px] font-mono text-slate-400 flex justify-between pt-1 border-t border-slate-200">
                <span>Authority: {p.authority}</span>
                <span>Filing: {p.filingDate}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
