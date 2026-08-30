import React, { useState } from 'react';
import { BookOpen, Building2, ShieldCheck, FileText, Globe, Hash, Briefcase, Database, Network, Server, Zap, Lock, Eye, Download } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export function EnterpriseWikiTab() {
  const [activeEntity, setActiveEntity] = useState('valourian');

  const entities = {
    valourian: {
      name: "Valourian Capital (Global HQ)",
      icon: Building2,
      duns: "08-142-9982 (US) / 74-510-4321 (APAC)",
      description: "Apex holding entity controlling all subsidiary treasuries, Sovereign AI Core, and cross-border M&A.",
      documents: [
        { name: "Certificate of Incorporation", type: "PDF", verified: true },
        { name: "Global Treasury Mandate 2026", type: "PDF", verified: true },
        { name: "KYC/AML Compliance Audit - Tier 1", type: "Ledger Hash", verified: true }
      ],
      playbook: "All AI agents must prioritize capital preservation and algorithmic yield generation. Transactions above $50M require multi-sig founder approval.",
      techStack: "Sovereign-Alpha V.4 (1T Params), Quantum-Resistant Cold Storage."
    },
    docucraft: {
      name: "DocuCraft Technologies",
      icon: FileText,
      duns: "11-442-7763",
      description: "Enterprise document generation and LLM-powered institutional reporting infrastructure.",
      documents: [
        { name: "SOC 2 Type II Certification", type: "PDF", verified: true },
        { name: "SaaS Enterprise Architecture Diagram", type: "SVG", verified: true },
        { name: "Global Privacy Policy & GDPR Addendum", type: "PDF", verified: true }
      ],
      playbook: "AI assistants utilize DocuCraft to auto-generate M&A term sheets, employment contracts, and compliance filings seamlessly in the background.",
      techStack: "Gemini 3.1 Pro backend, React/Vite front-end, distributed vector databases."
    },
    gateways: {
      name: "Sovereign Payment Gateways",
      icon: Network,
      duns: "42-881-0091",
      description: "Crypto-to-Fiat high speed routing, merchant BIN issuance, and Treasury multi-sig ledgers.",
      documents: [
        { name: "Swiss FINMA Banking License", type: "PDF", verified: true },
        { name: "DIFC Operational Charter", type: "PDF", verified: true },
        { name: "Mastercard/Visa Network Sponsor Agreement", type: "PDF", verified: true }
      ],
      playbook: "Handles instantaneous liquidity provision. AI can autonomously route crypto to fiat via dark pools to minimize market slippage.",
      techStack: "Node.js High-Frequency Trading Engine, HSM (Hardware Security Modules) for key signing."
    },
    logistics: {
      name: "Valourian Logistics Fleet",
      icon: Globe,
      duns: "99-311-2244",
      description: "Autonomous routing, high-value asset transport, and private executive logistics (Mobile HQ).",
      documents: [
        { name: "Global Aviation Charter Agreements", type: "PDF", verified: true },
        { name: "Armored Fleet Insurance Binder ($500M)", type: "PDF", verified: true },
        { name: "Starlink Enterprise Broadband Contracts", type: "PDF", verified: true }
      ],
      playbook: "AI swarm tracks real-time telemetry of physical assets. Deploys rapid response for supply chain disruptions.",
      techStack: "Real-time geospatial mapping, Satellite IoT uplink."
    }
  };

  const current = entities[activeEntity as keyof typeof entities];

  return (
    <div className="w-full max-w-7xl mx-auto flex flex-col md:flex-row gap-6 h-[800px]">
      {/* Sidebar Navigation */}
      <div className="w-full md:w-80 bg-slate-900 border border-slate-800 rounded-2xl flex flex-col overflow-hidden shrink-0 shadow-xl">
        <div className="p-6 border-b border-slate-800">
          <h2 className="text-xl font-black text-white tracking-widest uppercase flex items-center gap-2">
            <BookOpen className="w-6 h-6 text-indigo-500" />
            Enterprise Wiki
          </h2>
          <p className="text-xs text-slate-400 mt-2 font-mono">Central Knowledge Base & Proofs</p>
        </div>
        <div className="flex-1 overflow-y-auto p-4 space-y-2">
          {Object.entries(entities).map(([key, entity]) => {
            const Icon = entity.icon;
            const isActive = activeEntity === key;
            return (
              <button
                key={key}
                onClick={() => setActiveEntity(key)}
                className={`w-full text-left px-4 py-3 rounded-xl flex items-center gap-3 transition-all ${
                  isActive ? 'bg-indigo-500/10 border-indigo-500/30 text-indigo-400 border' : 'bg-transparent text-slate-400 hover:bg-slate-800 hover:text-white border border-transparent'
                }`}
              >
                <Icon className="w-5 h-5 shrink-0" />
                <span className="font-bold text-sm truncate">{entity.name}</span>
              </button>
            );
          })}
        </div>
        <div className="p-4 bg-slate-950 border-t border-slate-800">
          <div className="flex items-center gap-2 text-emerald-500 text-xs font-bold uppercase tracking-widest">
            <Database className="w-4 h-4" />
            AI Swarm Synced
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-xl flex flex-col">
        <AnimatePresence mode="wait">
          <motion.div
            key={activeEntity}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="flex-1 overflow-y-auto p-8 space-y-8"
          >
            {/* Header */}
            <div>
              <div className="flex items-center gap-4 mb-4">
                <div className="p-4 bg-indigo-500/10 border border-indigo-500/30 rounded-2xl">
                  <current.icon className="w-8 h-8 text-indigo-500" />
                </div>
                <div>
                  <h1 className="text-3xl font-black text-white">{current.name}</h1>
                  <div className="flex items-center gap-3 mt-2">
                    <span className="px-2 py-1 bg-emerald-500/10 border border-emerald-500/30 text-emerald-500 text-xs font-bold rounded uppercase tracking-wider flex items-center gap-1">
                      <ShieldCheck className="w-3 h-3" /> Verified Entity
                    </span>
                    <span className="text-slate-400 text-sm font-mono flex items-center gap-1">
                      <Hash className="w-4 h-4" /> D-U-N-S: {current.duns}
                    </span>
                  </div>
                </div>
              </div>
              <p className="text-slate-300 text-lg leading-relaxed">{current.description}</p>
            </div>

            {/* Proof Documents */}
            <div className="space-y-4">
              <h3 className="text-sm font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
                <FileText className="w-4 h-4" />
                Proof Documents & Certifications
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {current.documents.map((doc, idx) => (
                  <div key={idx} className="bg-slate-950 border border-slate-800 p-4 rounded-xl flex items-center justify-between group hover:border-indigo-500/30 transition-colors">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-slate-900 rounded-lg">
                        {doc.type === "PDF" ? <FileText className="w-5 h-5 text-red-400" /> : <Lock className="w-5 h-5 text-emerald-400" />}
                      </div>
                      <div>
                        <div className="font-bold text-slate-200 text-sm">{doc.name}</div>
                        <div className="text-xs font-mono text-slate-500 mt-0.5 flex items-center gap-1">
                          {doc.verified && <ShieldCheck className="w-3 h-3 text-emerald-500" />} Cryptographically Verified
                        </div>
                      </div>
                    </div>
                    <button className="text-slate-500 hover:text-indigo-400 transition-colors">
                      <Eye className="w-5 h-5" />
                    </button>
                  </div>
                ))}
              </div>
            </div>

            {/* AI Playbook & Architecture */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4">
              <div className="bg-indigo-950/20 border border-indigo-900/50 p-6 rounded-2xl">
                <h3 className="text-sm font-black text-indigo-400 uppercase tracking-widest flex items-center gap-2 mb-4">
                  <Zap className="w-4 h-4" />
                  AI Agent Playbook
                </h3>
                <p className="text-slate-300 text-sm leading-relaxed">
                  {current.playbook}
                </p>
              </div>
              <div className="bg-slate-950 border border-slate-800 p-6 rounded-2xl">
                <h3 className="text-sm font-black text-slate-400 uppercase tracking-widest flex items-center gap-2 mb-4">
                  <Server className="w-4 h-4" />
                  Core Infrastructure
                </h3>
                <p className="text-slate-300 text-sm font-mono leading-relaxed">
                  {current.techStack}
                </p>
              </div>
            </div>

          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
}
