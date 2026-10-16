import React from "react";
import { 
  MessageSquare, 
  ShieldCheck, 
  Lock, 
  Mail, 
  Smartphone, 
  CheckCircle2, 
  AlertTriangle, 
  Key, 
  Server,
  Terminal,
  FileCheck
} from "lucide-react";
import { toast } from "sonner";

export function CommsPolicyTab() {
  const WHITELIST_EMAILS = [
    { email: "asim.nsw@gmail.com", role: "Primary Founder Executive Channel", status: "VERIFIED & SIGNED", security: "TLS 1.3 • FIDO2 2FA" },
    { email: "asim.aryal@protonmail.com", role: "Encrypted Swiss Fallback", status: "PGP 4096-BIT ARMORED", security: "End-to-End Quantum Enclave" },
    { email: "asimaryal10@gmail.com", role: "Corporate Legal Inbound", status: "VERIFIED & SIGNED", security: "DKIM • DMARC Enforced" }
  ];

  const DISPATCH_RULES = [
    {
      rule: "Rule 1: Autonomous Dispatch for Real-World Capital Orders",
      desc: "All physical asset orders, property acquisitions, and banking transfers exceeding $5,000 AUD automatically generate cryptographic PDF receipts and dispatch synchronously to asim.nsw@gmail.com."
    },
    {
      rule: "Rule 2: SMS Verification & VoIP Handshake Protocol",
      desc: "Physical parcel dispatches to Australia Post St Leonards / Artarmon 712 transmit instantaneous two-way VoIP alerts to +61 400 286 693 with anti-tamper tracking manifests."
    },
    {
      rule: "Rule 3: Anti-Phishing & Zero-Trust Domain Signing",
      desc: "Inbound messages purporting to represent Valourian Capital must match DKIM/DMARC signatures from valourian.com or valourian.com.au. Non-matching traffic is dropped at edge."
    },
    {
      rule: "Rule 4: Zero Exposure of Private Seed Materials",
      desc: "Administrative credentials, BIP-39 root keys, and Torrens Title deed hashes are stored exclusively in isolated sovereign hardware enclaves with biometric multi-sig quorum."
    }
  ];

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      {/* Header Banner */}
      <div className="bg-slate-900 rounded-[2.5rem] p-8 text-white border border-slate-800 shadow-2xl relative overflow-hidden group">
        <div className="absolute top-0 right-0 w-80 h-80 bg-emerald-500/10 rounded-full blur-[100px] -mr-32 -mt-32 pointer-events-none" />
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="flex items-center gap-5">
            <div className="w-16 h-16 rounded-3xl bg-gradient-to-tr from-emerald-600 to-indigo-600 flex items-center justify-center text-white shadow-lg shadow-emerald-500/20">
              <MessageSquare className="w-8 h-8" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-2xl font-black italic uppercase tracking-tight text-white">
                  Communications & Security Policy
                </h3>
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 font-mono">
                  ZERO-TRUST GOVERNANCE
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-1">
                Official communication routing, cryptographic invoice dispatching, and identity whitelisting for Mr. Asim Aryal.
              </p>
            </div>
          </div>

          <div className="bg-slate-800/80 backdrop-blur-md px-6 py-3.5 rounded-2xl border border-slate-700/80 flex items-center gap-4">
            <div>
              <span className="text-[10px] uppercase font-bold tracking-widest text-slate-400 block">Enforcement Status</span>
              <span className="text-xl font-black font-mono text-emerald-400">100% ACTIVE</span>
            </div>
            <div className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" />
          </div>
        </div>
      </div>

      {/* Whitelisted Executive Communication Channels */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-sm space-y-4">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <div className="flex items-center gap-2">
            <Mail className="w-5 h-5 text-emerald-600" />
            <h4 className="text-base font-black text-slate-900">Whitelisted Dispatch Endpoints</h4>
          </div>
          <span className="text-xs font-mono font-bold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-200">
            DKIM / DMARC Attested
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {WHITELIST_EMAILS.map((item, idx) => (
            <div
              key={`email-w-${idx}`}
              className="p-5 rounded-2xl bg-slate-50 border border-slate-200 space-y-2.5"
            >
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-mono font-black uppercase text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded">
                  {item.status}
                </span>
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              </div>
              <div className="font-mono font-black text-sm text-slate-900">{item.email}</div>
              <div className="text-xs text-slate-500 font-medium">{item.role}</div>
              <div className="pt-2 border-t border-slate-200 text-[10px] font-mono text-slate-400">
                Security: {item.security}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Governance & Anti-Phishing Protocols */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-sm space-y-4">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-5 h-5 text-indigo-600" />
            <h4 className="text-base font-black text-slate-900">Executive Comms Operating Principles</h4>
          </div>
          <span className="text-xs font-mono text-slate-500 font-bold">Standard Operating Procedure</span>
        </div>

        <div className="space-y-3">
          {DISPATCH_RULES.map((r, idx) => (
            <div
              key={`rule-${idx}`}
              className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-1"
            >
              <div className="font-black text-sm text-slate-900">{r.rule}</div>
              <p className="text-xs text-slate-600 leading-relaxed">{r.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
