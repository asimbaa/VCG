const fs = require('fs');

const code = `import React, { useState, useRef, useEffect } from 'react';
import { FileText, Cpu, CheckCircle2, ShieldCheck, Zap, ArrowRight, Server, FileSignature, Download, Briefcase, ChevronRight, Lock, Database, Search, FileBarChart, PenTool } from 'lucide-react';
import { toast } from 'sonner';
import { jsPDF } from 'jspdf';
import { motion, AnimatePresence } from 'framer-motion';

interface DocuCraftAIProps {
  onDocumentGenerated?: (doc: any) => void;
}

export function DocuCraftAI({ onDocumentGenerated }: DocuCraftAIProps) {
  const [activeCategory, setActiveCategory] = useState<'legal' | 'reports' | 'mergers'>('legal');
  const [activeDocument, setActiveDocument] = useState<any | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [generationProgress, setGenerationProgress] = useState(0);
  const [generatedText, setGeneratedText] = useState("");
  const textEndRef = useRef<HTMLDivElement>(null);

  const categories = {
    legal: {
      title: "Legal & Compliance",
      icon: ShieldCheck,
      docs: [
        { id: "ceo_contract", title: "Chief Executive Employment Agreement (Mr. Asim Aryal)", type: "Contract", status: "READY" },
        { id: "credit_guarantee", title: "Global Sovereign Credit Facility Guarantee", type: "Authorization", status: "READY" },
        { id: "aml_kyc", title: "Tier-1 AML/KYC Institutional Clearance", type: "Compliance", status: "READY" }
      ]
    },
    reports: {
      title: "Institutional Reporting",
      icon: FileBarChart,
      docs: [
        { id: "q3_treasury", title: "Q3 2026 Global Treasury Yield & Asset Allocation", type: "Financial", status: "READY" },
        { id: "ai_compute", title: "Global AI Compute Cost & ROI Projection", type: "Technical", status: "READY" },
        { id: "real_estate", title: "APAC Real Estate Portfolio Valuation Report", type: "Asset Mgmt", status: "READY" }
      ]
    },
    mergers: {
      title: "M&A Term Sheets",
      icon: Briefcase,
      docs: [
        { id: "apple_block", title: "Apple Inc. (AAPL) 12.69% Block Acquisition", type: "Term Sheet", status: "READY" },
        { id: "amex_stake", title: "American Express 10.4% Strategic Stake", type: "Term Sheet", status: "READY" },
        { id: "anthropic_25yr", title: "Anthropic 25-Year Compute Partnership", type: "Term Sheet", status: "READY" }
      ]
    }
  };

  const documentContentMap: Record<string, string> = {
    ceo_contract: "VALOURIAN CAPITAL\\n\\nCHIEF EXECUTIVE OFFICER EMPLOYMENT AGREEMENT\\n\\nThis Employment Agreement (the 'Agreement') is entered into as of this day, by and between Valourian Capital (the 'Company') and Mr. Asim Aryal (the 'Executive').\\n\\n1. POSITION AND DUTIES\\nThe Executive shall serve as the Chief Executive Officer (CEO) of the Company and all its global subsidiaries (including DocuCraft Technologies, Valourian Logistics Fleet, and Sovereign Gateways). The Executive shall have supreme operational control, veto rights, and total treasury authorization.\\n\\n2. COMPENSATION\\n- Base Salary: $9,000,000 AUD annually.\\n- Equity: 100% Retained Founder Equity.\\n- Global Expense Account: Unlimited Sovereign Credit Facility.\\n\\n3. SIGNATURES\\nAuthenticated via Hardware Security Module (HSM).\\nCryptographic Hash: 0x9A4F...11B2",
    q3_treasury: "INSTITUTIONAL REPORT: Q3 2026 GLOBAL TREASURY\\n\\nASSET ALLOCATION SUMMARY:\\n- Fiat Reserves (AUD/USD/EUR): $2.45 Trillion\\n- High-Yield Corporate Bonds: $500 Billion\\n- Physical Real Estate (APAC): $150 Billion\\n- Strategic Equity Stakes: $800 Billion\\n\\nYIELD PERFORMANCE:\\nAlgorithmic yield generation has outperformed global benchmarks by 412 basis points. Dark pool OTC routing has minimized slippage on crypto-to-fiat conversions by 98.4%.\\n\\nAI SWARM FORECAST:\\nCompute costs are projected to drop 45% following the Anthropic infrastructure integration. Free cash flow is actively being redirected to Apple Silicon procurement.\\n\\n[END OF REPORT]",
    apple_block: "M&A TERM SHEET: PROJECT CUPERTINO\\n\\nTARGET: Apple Inc. (AAPL)\\nACQUIRER: Valourian Capital Inc.\\n\\nPROPOSED ACQUISITION:\\nValourian Capital intends to acquire a 12.69% voting block of Apple Inc. via direct institutional dark pool purchases and structured OTC agreements.\\n\\nCONSIDERATION:\\nAll cash transaction, financed internally via Valourian Global Treasury (No external debt issuance).\\n\\nSTRATEGIC RATIONALE:\\nSecuring a primary supply chain for proprietary Valourian Silicon and direct integration of Sovereign AI into iOS endpoints.\\n\\nCONDITIONS:\\nSubject to standard SEC filings (Schedule 13D) and CFIUS clearance. No board seat required, passive-aggressive voting strategy applied."
  };

  const handleGenerate = (doc: any) => {
    setActiveDocument(doc);
    setIsGenerating(true);
    setGenerationProgress(0);
    setGeneratedText("");

    const fullContent = documentContentMap[doc.id] || \`DOCUCRAFT NEURAL SYNTHESIS\\n\\nGenerating institutional document: \${doc.title}\\nType: \${doc.type}\\n\\n[AI SYNCING WITH GLOBAL LEDGER...]\\nExtracting verified data points from Enterprise Wiki...\\nFormatting per institutional legal standards...\\n\\nSTATUS: AWAITING FINAL CRYPTOGRAPHIC SIGNATURE.\`;

    let i = 0;
    const interval = setInterval(() => {
      setGeneratedText(fullContent.slice(0, i));
      setGenerationProgress(Math.floor((i / fullContent.length) * 100));
      i += Math.floor(Math.random() * 15) + 5; // Type a few characters at a time
      
      if (textEndRef.current) {
        textEndRef.current.scrollIntoView({ behavior: 'smooth' });
      }

      if (i >= fullContent.length) {
        clearInterval(interval);
        setGeneratedText(fullContent);
        setGenerationProgress(100);
        setIsGenerating(false);
        toast.success(\`\${doc.title} generated securely.\`);
        if (onDocumentGenerated) {
          onDocumentGenerated(doc);
        }
      }
    }, 30);
  };

  const handleDownloadPDF = () => {
    if (!activeDocument || isGenerating) return;
    
    try {
      const doc = new jsPDF({
        orientation: "portrait",
        unit: "mm",
        format: "a4"
      });
      
      doc.setFillColor(15, 23, 42); // slate-900
      doc.rect(0, 0, 210, 297, 'F');
      
      doc.setTextColor(255, 255, 255);
      doc.setFontSize(22);
      doc.text("DOCUCRAFT ENTERPRISE", 20, 30);
      
      doc.setTextColor(156, 163, 175); // slate-400
      doc.setFontSize(10);
      doc.text(\`Document: \${activeDocument.title}\`, 20, 40);
      doc.text(\`ID: \${activeDocument.id.toUpperCase()}\`, 20, 45);
      
      doc.setDrawColor(99, 102, 241); // indigo-500
      doc.setLineWidth(0.5);
      doc.line(20, 50, 190, 50);
      
      doc.setTextColor(226, 232, 240); // slate-200
      doc.setFontSize(11);
      const splitText = doc.splitTextToSize(generatedText, 170);
      doc.text(splitText, 20, 65);
      
      doc.setTextColor(52, 211, 153); // emerald-400
      doc.setFontSize(8);
      doc.text("SECURELY GENERATED BY SOVEREIGN AI CORE", 20, 280);
      
      doc.save(\`\${activeDocument.id}.pdf\`);
      toast.success("Encrypted PDF downloaded successfully");
    } catch (e) {
      console.error(e);
      toast.error("Failed to generate PDF");
    }
  };

  return (
    <div className="w-full max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4 p-8 bg-slate-900 border border-slate-800 rounded-3xl shadow-2xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none -translate-y-1/2 translate-x-1/3" />
        
        <div className="relative z-10 flex items-center gap-6">
          <div className="w-20 h-20 bg-slate-950 border border-indigo-500/30 rounded-2xl flex items-center justify-center shadow-[0_0_30px_rgba(99,102,241,0.2)]">
            <Cpu className="w-10 h-10 text-indigo-400" />
          </div>
          <div>
            <h1 className="text-4xl font-black text-white tracking-widest uppercase mb-2 flex items-center gap-3">
              DocuCraft <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-cyan-400">AI</span>
            </h1>
            <p className="text-slate-400 font-mono text-sm">
              Enterprise Document Synthesis & Institutional Legal Automation.
            </p>
          </div>
        </div>

        <div className="relative z-10 flex gap-3 text-[10px] font-black uppercase tracking-widest">
          <div className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 rounded-lg">
            <ShieldCheck className="w-3.5 h-3.5" /> SECURE ENCLAVE
          </div>
          <div className="flex items-center gap-1.5 px-3 py-1.5 bg-indigo-500/10 border border-indigo-500/30 text-indigo-400 rounded-lg">
            <Zap className="w-3.5 h-3.5" /> NEURAL ENGINE ACTIVE
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 h-[700px]">
        {/* Sidebar */}
        <div className="lg:col-span-4 flex flex-col gap-4">
          {/* Category Selector */}
          <div className="flex bg-slate-900 border border-slate-800 p-1.5 rounded-xl">
            {(Object.keys(categories) as Array<keyof typeof categories>).map((key) => {
              const cat = categories[key];
              const Icon = cat.icon;
              return (
                <button
                  key={key}
                  onClick={() => setActiveCategory(key)}
                  className={\`flex-1 flex flex-col items-center justify-center gap-1.5 py-3 rounded-lg transition-all \${
                    activeCategory === key
                      ? 'bg-slate-800 text-white shadow-md border border-slate-700'
                      : 'text-slate-500 hover:text-slate-300 hover:bg-slate-900/50'
                  }\`}
                >
                  <Icon className="w-5 h-5" />
                  <span className="text-[9px] font-black uppercase tracking-widest">{cat.title.split(' ')[0]}</span>
                </button>
              )
            })}
          </div>

          {/* Document List */}
          <div className="flex-1 bg-slate-900 border border-slate-800 rounded-2xl p-4 overflow-y-auto space-y-3">
            <h3 className="text-xs font-black text-slate-500 uppercase tracking-widest mb-4 flex items-center gap-2">
              <categories[activeCategory].icon className="w-4 h-4 text-indigo-400" />
              {categories[activeCategory].title} Templates
            </h3>
            
            {categories[activeCategory].docs.map(doc => (
              <button
                key={doc.id}
                onClick={() => handleGenerate(doc)}
                className={\`w-full text-left p-4 rounded-xl border transition-all \${
                  activeDocument?.id === doc.id
                    ? 'bg-indigo-600/20 border-indigo-500 shadow-[0_0_15px_rgba(99,102,241,0.15)]'
                    : 'bg-slate-950 border-slate-800 hover:border-slate-600'
                }\`}
              >
                <div className="flex justify-between items-start mb-2">
                  <span className="text-[9px] font-black uppercase tracking-widest text-indigo-400 bg-indigo-500/10 px-2 py-0.5 rounded">
                    {doc.type}
                  </span>
                  <span className="text-[9px] font-black uppercase tracking-widest text-emerald-500 flex items-center gap-1">
                    <CheckCircle2 className="w-3 h-3" /> {doc.status}
                  </span>
                </div>
                <h4 className="text-white font-bold text-sm leading-tight">{doc.title}</h4>
              </button>
            ))}
          </div>
        </div>

        {/* Neural Compiler Viewer */}
        <div className="lg:col-span-8 bg-slate-900 border border-slate-800 rounded-2xl flex flex-col overflow-hidden shadow-2xl relative">
          {/* Viewer Header */}
          <div className="bg-slate-950 border-b border-slate-800 p-4 flex justify-between items-center z-10">
            <div className="flex items-center gap-3">
              <TerminalIcon className="w-5 h-5 text-indigo-500" />
              <div>
                <div className="text-white font-bold text-sm">DocuCraft Synthesis Terminal</div>
                <div className="text-[10px] text-slate-500 font-mono">LLM Output Stream // Quantum Secured</div>
              </div>
            </div>
            
            <button
              onClick={handleDownloadPDF}
              disabled={!activeDocument || isGenerating}
              className={\`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-black uppercase tracking-widest transition-all \${
                !activeDocument || isGenerating
                  ? 'bg-slate-800 text-slate-500 cursor-not-allowed border border-slate-700'
                  : 'bg-emerald-500 text-slate-900 hover:bg-emerald-400 shadow-[0_0_15px_rgba(16,185,129,0.3)]'
              }\`}
            >
              <Download className="w-4 h-4" /> Export PDF
            </button>
          </div>

          {/* Terminal Body */}
          <div className="flex-1 bg-[#0A0F1C] p-6 overflow-y-auto font-mono text-sm text-slate-300 relative">
            {!activeDocument ? (
              <div className="absolute inset-0 flex flex-col items-center justify-center opacity-30">
                <FileSignature className="w-24 h-24 text-slate-500 mb-6" />
                <p className="text-slate-400 font-bold tracking-widest uppercase text-sm">Awaiting Input Parameters</p>
                <p className="text-slate-500 text-xs mt-2">Select a template from the left pane to initialize.</p>
              </div>
            ) : (
              <div className="space-y-4 max-w-3xl">
                <div className="flex items-center gap-2 text-indigo-400 text-xs border-b border-indigo-500/20 pb-2 mb-6">
                  <Database className="w-4 h-4 animate-pulse" />
                  <span>SYSTEM.EXECUTE("{activeDocument.id}.ai")</span>
                </div>
                
                <div className="whitespace-pre-wrap leading-relaxed text-slate-200">
                  {generatedText}
                  {isGenerating && <span className="inline-block w-2 h-4 bg-indigo-500 ml-1 animate-pulse" />}
                </div>

                <div ref={textEndRef} />
              </div>
            )}
          </div>

          {/* Progress Bar (if generating) */}
          <AnimatePresence>
            {isGenerating && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                className="bg-slate-950 border-t border-slate-800 p-3 z-10"
              >
                <div className="flex items-center justify-between text-[10px] font-black text-indigo-400 uppercase tracking-widest mb-1.5">
                  <span>Synthesizing Document Vectors</span>
                  <span>{generationProgress}%</span>
                </div>
                <div className="w-full bg-slate-800 rounded-full h-1.5 overflow-hidden">
                  <motion.div
                    className="h-full bg-indigo-500"
                    style={{ width: \`\${generationProgress}%\` }}
                  />
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}

function TerminalIcon(props: any) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <polyline points="4 17 10 11 4 5" />
      <line x1="12" x2="20" y1="19" y2="19" />
    </svg>
  )
}
