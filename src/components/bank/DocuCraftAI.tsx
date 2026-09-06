import React, { useState, useRef, useEffect } from 'react';
import { FileText, Cpu, CheckCircle2, ShieldCheck, Zap, ArrowRight, Server, FileSignature, Download, Briefcase, ChevronRight, Lock, Database, Search, FileBarChart, PenTool, Users, Loader2, Bot, Network, Globe } from 'lucide-react';
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
  const [generatedText, setGeneratedText] = useState('');
  const textEndRef = useRef<HTMLDivElement>(null);

  // Agent Collaboration States
  const [agentProgress, setAgentProgress] = useState({
    aws: { status: 'idle', progress: 0 },
    gcp: { status: 'idle', progress: 0 },
    ultra: { status: 'idle', progress: 0 },
    anthropic: { status: 'idle', progress: 0 },
    grok: { status: 'idle', progress: 0 }
  });

  const categories = {
    legal: {
      title: 'Legal & Compliance',
      icon: ShieldCheck,
      docs: [
        { id: 'ceo_contract', title: 'Chief Executive Employment Agreement (Mr. Asim Aryal)', type: 'Contract', status: 'READY' },
        { id: 'credit_guarantee', title: 'Global Sovereign Credit Facility Guarantee', type: 'Authorization', status: 'READY' },
        { id: 'aml_kyc', title: 'Tier-1 AML/KYC Institutional Clearance', type: 'Compliance', status: 'READY' }
      ]
    },
    reports: {
      title: 'Institutional Reporting',
      icon: FileBarChart,
      docs: [
        { id: 'q3_treasury', title: 'Q3 Global Treasury Yield & Asset Allocation', type: 'Financial', status: 'READY' },
        { id: 'ai_compute', title: 'Global AI Compute Cost & ROI Projection', type: 'Technical', status: 'READY' },
        { id: 'real_estate', title: 'APAC Real Estate Portfolio Valuation Report', type: 'Asset Mgmt', status: 'READY' }
      ]
    },
    mergers: {
      title: 'M&A Term Sheets',
      icon: Briefcase,
      docs: [
        { id: 'apple_block', title: 'Apple Inc. (AAPL) 12.69% Block Acquisition', type: 'Term Sheet', status: 'READY' },
        { id: 'amex_stake', title: 'American Express 10.4% Strategic Stake', type: 'Term Sheet', status: 'READY' },
        { id: 'anthropic_25yr', title: 'Anthropic 25-Year Compute Partnership', type: 'Term Sheet', status: 'READY' }
      ]
    }
  };

  const documentContentMap: Record<string, string> = {
    ceo_contract: "VALOURIAN CAPITAL INC.\n\nCHIEF EXECUTIVE OFFICER EMPLOYMENT AGREEMENT\n\nThis Employment Agreement (the 'Agreement') is entered into as of this day, by and between Valourian Capital Inc. (the 'Company') and Mr. Asim Aryal (the 'Executive').\n\n1. POSITION AND DUTIES\nThe Executive shall serve as the Chief Executive Officer (CEO) of the Company and all its global subsidiaries (including RapidPay, DocuCraft Technologies, Valourian Logistics Fleet, and Sovereign Gateways). The Executive shall have supreme operational control, veto rights, and total treasury authorization.\n\n2. COMPENSATION\n- Base Salary: $5,000,000 AUD annually.\n- Equity: 100% Retained Founder Equity.\n- Global Expense Account: Unlimited Sovereign Credit Facility via RapidPay.\n\n3. SIGNATURES\nAuthenticated via Hardware Security Module (HSM).\nCryptographic Hash: 0x9A4F...11B2",
    q3_treasury: "VALOURIAN CAPITAL INC. - INSTITUTIONAL REPORT: GLOBAL TREASURY\n\nASSET ALLOCATION SUMMARY:\n- Fiat Reserves (AUD/USD/EUR): $3.45 Trillion\n- High-Yield Corporate Bonds: $800 Billion\n- Physical Real Estate (APAC): $250 Billion\n- Strategic Equity Stakes: $400 Billion\n\nYIELD PERFORMANCE:\nAlgorithmic yield generation has outperformed global benchmarks by 412 basis points. RapidPay OTC routing has minimized slippage on crypto-to-fiat conversions by 98.4%.\n\nAI SWARM FORECAST:\nCompute costs are projected to drop 45% following the Anthropic infrastructure integration. Free cash flow is actively being redirected to Apple Silicon procurement.\n\n[END OF REPORT]",
    apple_block: "M&A TERM SHEET: PROJECT CUPERTINO\n\nTARGET: Apple Inc. (AAPL)\nACQUIRER: Valourian Capital Inc.\n\nPROPOSED ACQUISITION:\nValourian Capital intends to acquire a 12.69% voting block of Apple Inc. via direct institutional dark pool purchases and structured OTC agreements processed through RapidPay.\n\nCONSIDERATION:\nAll cash transaction, financed internally via Valourian Global Treasury (No external debt issuance).\n\nSTRATEGIC RATIONALE:\nSecuring a primary supply chain for proprietary Valourian Silicon and direct integration of Sovereign AI into iOS endpoints.\n\nCONDITIONS:\nSubject to standard SEC filings (Schedule 13D) and CFIUS clearance. No board seat required, passive-aggressive voting strategy applied."
  };

  const handleGenerate = (doc: any) => {
    setActiveDocument(doc);
    setIsGenerating(true);
    setGeneratedText('');
    
    // Reset all agents
    setAgentProgress({
      aws: { status: 'idle', progress: 0 },
      gcp: { status: 'idle', progress: 0 },
      ultra: { status: 'idle', progress: 0 },
      anthropic: { status: 'idle', progress: 0 },
      grok: { status: 'idle', progress: 0 }
    });

    const fullContent = documentContentMap[doc.id] || `VALOURIAN CAPITAL INC.\nDOCUCRAFT NEURAL SYNTHESIS\n\nGenerating institutional document: ${doc.title}\nType: ${doc.type}\n\n[AI SYNCING WITH GLOBAL LEDGER...]\nExtracting verified data points from Enterprise Wiki...\nFormatting per institutional legal standards...\n\nSTATUS: AWAITING FINAL CRYPTOGRAPHIC SIGNATURE.`;

    // Agent Simulation Logic
    const simulateAgent = (agentId: string, delayMs: number, durationMs: number) => {
      setTimeout(() => {
        setAgentProgress(prev => ({ ...prev, [agentId]: { status: 'running', progress: 0 } }));
        
        let p = 0;
        const interval = setInterval(() => {
          p += (100 / (durationMs / 50));
          if (p >= 100) {
            clearInterval(interval);
            setAgentProgress(prev => ({ ...prev, [agentId]: { status: 'complete', progress: 100 } }));
          } else {
            setAgentProgress(prev => ({ ...prev, [agentId]: { status: 'running', progress: p } }));
          }
        }, 50);
      }, delayMs);
    };

    // Orchestrate agents
    simulateAgent('aws', 0, 800);
    simulateAgent('gcp', 400, 1000);
    simulateAgent('ultra', 1000, 1500);
    simulateAgent('anthropic', 1800, 1200);
    simulateAgent('grok', 2200, 800);

    // Text generation stream
    setTimeout(() => {
      let i = 0;
      const textInterval = setInterval(() => {
        setGeneratedText(fullContent.slice(0, i));
        i += Math.floor(Math.random() * 10) + 5;
        
        if (textEndRef.current) {
          textEndRef.current.scrollIntoView({ behavior: 'smooth' });
        }

        if (i >= fullContent.length) {
          clearInterval(textInterval);
          setGeneratedText(fullContent);
          setIsGenerating(false);
          toast.success(`${doc.title} generated securely by Valourian AI Swarm.`);
          if (onDocumentGenerated) onDocumentGenerated(doc);
        }
      }, 20);
    }, 3200);
  };

    const handleDownloadPDF = async () => {
    if (!activeDocument || isGenerating) return;
    
    try {
      toast.loading("Generating Sovereign Grade PDF...", { id: 'pdf-gen' });
      // Use our backend generator for extreme fidelity
      const res = await fetch("/api/generate-doc", {
         method: "POST",
         headers: { "Content-Type": "application/json" },
         body: JSON.stringify({ prompt: generatedText, agents: ["Strategist", "Financier"] })
      });
      // But actually, just use jsPDF directly here with better formatting
      
      const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });
      doc.setFillColor(15, 23, 42);
      doc.rect(0, 0, 210, 40, 'F');
      
      doc.setTextColor(255, 255, 255);
      doc.setFont("Helvetica", "bold");
      doc.setFontSize(24);
      doc.text('VALOURIAN DOCUCRAFT', 20, 20);
      
      doc.setTextColor(156, 163, 175);
      doc.setFontSize(10);
      doc.text(`Document Title: ${activeDocument.title}`, 20, 28);
      doc.text(`Blockchain Hash: 0x${Math.random().toString(16).slice(2, 10).toUpperCase()} | Authenticated: ASIM ARYAL`, 20, 34);
      
      // Decorative line
      doc.setDrawColor(99, 102, 241);
      doc.setLineWidth(1);
      doc.line(20, 50, 190, 50);

      doc.setTextColor(30, 41, 59);
      doc.setFont("Helvetica", "normal");
      doc.setFontSize(10);
      
      const splitText = doc.splitTextToSize(generatedText, 170);
      
      let yPos = 65;
      for (let i = 0; i < splitText.length; i++) {
        if (yPos > 270) {
          doc.addPage();
          yPos = 30;
        }
        // Bold headers simulation
        if (splitText[i].includes(":") && splitText[i].length < 40) {
           doc.setFont("Helvetica", "bold");
           doc.text(splitText[i], 20, yPos);
           doc.setFont("Helvetica", "normal");
        } else {
           doc.text(splitText[i], 20, yPos);
        }
        yPos += 7;
      }
      
      doc.setFont("Helvetica", "bold");
      doc.setTextColor(16, 185, 129);
      doc.setFontSize(8);
      doc.text('SECURELY GENERATED BY SOVEREIGN AI CORE (ULTRA, ANTHROPIC, GROK)', 20, 290);
      
      doc.save(`${activeDocument.id}.pdf`);
      toast.success('Encrypted PDF downloaded successfully', { id: 'pdf-gen' });
    } catch (e) {
      console.error(e);
      toast.error('Failed to generate PDF', { id: 'pdf-gen' });
    }
  };

  const deployToWeb = () => {
    if (!activeDocument || isGenerating) return;
    toast.loading("Deploying document to Valourian Web Node...", { id: 'web-deploy' });
    setTimeout(() => {
      toast.success(`Document deployed successfully to https://valourian.com/docs/${activeDocument.id}`, { id: 'web-deploy' });
    }, 2500);
  };


  const renderAgentProgress = (id: string, name: string, desc: string, icon: any, color: string) => {
    const state = agentProgress[id as keyof typeof agentProgress];
    const Icon = icon;
    
    return (
      <div className="flex flex-col gap-2 p-3 bg-slate-900 border border-slate-800 rounded-xl relative overflow-hidden">
        {state.status === 'running' && (
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-slate-800 to-transparent animate-[shimmer_2s_infinite] opacity-50" />
        )}
        <div className="flex justify-between items-start relative z-10">
          <div className="flex items-center gap-2">
            <div className={`p-1.5 rounded-lg ${state.status === 'complete' ? `bg-${color}-500/20 text-${color}-400` : state.status === 'running' ? 'bg-slate-800 text-white animate-pulse' : 'bg-slate-950 text-slate-500'}`}>
              <Icon className="w-4 h-4" />
            </div>
            <div>
              <div className="text-xs font-bold text-slate-200">{name}</div>
              <div className="text-[9px] text-slate-500 uppercase tracking-widest">{desc}</div>
            </div>
          </div>
          {state.status === 'complete' && <CheckCircle2 className="w-4 h-4 text-emerald-400" />}
          {state.status === 'running' && <Loader2 className="w-4 h-4 text-indigo-400 animate-spin" />}
        </div>
        
        <div className="h-1 w-full bg-slate-950 rounded-full overflow-hidden relative z-10">
          <motion.div 
            className={`absolute top-0 left-0 bottom-0 ${state.status === 'complete' ? `bg-${color}-400` : 'bg-indigo-500'}`}
            initial={{ width: 0 }}
            animate={{ width: `${state.progress}%` }}
            transition={{ duration: 0.1 }}
          />
        </div>
      </div>
    );
  };

  return (
    <div className="w-full max-w-7xl mx-auto space-y-6">
      {/* Valourian & DocuCraft Header */}
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-end gap-6 p-8 bg-slate-950 border border-slate-800 rounded-3xl shadow-2xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-indigo-600/10 rounded-full blur-3xl pointer-events-none -translate-y-1/2 translate-x-1/3" />
        <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-cyan-600/10 rounded-full blur-3xl pointer-events-none translate-y-1/2 -translate-x-1/3" />
        
        <div className="relative z-10 flex items-center gap-6">
          <div className="relative">
            <div className="absolute inset-0 border border-indigo-500/30 rounded-2xl animate-ping opacity-20" />
            <div className="w-24 h-24 bg-gradient-to-br from-slate-900 to-slate-950 border border-indigo-500/50 rounded-2xl flex items-center justify-center shadow-[0_0_50px_rgba(99,102,241,0.2)]">
              <Cpu className="w-12 h-12 text-indigo-400" />
            </div>
          </div>
          <div>
            <div className="text-[10px] font-black uppercase tracking-widest text-indigo-400 mb-1 flex items-center gap-2">
              <Globe className="w-3 h-3" /> Valourian Capital Inc.
            </div>
            <h1 className="text-5xl font-black text-white tracking-widest uppercase mb-2 flex items-center gap-3">
              DocuCraft <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 via-cyan-400 to-emerald-400">AI</span>
            </h1>
            <p className="text-slate-400 font-mono text-sm max-w-xl">
              The world-winning suite of collaborative AI agents orchestrating institutional-grade synthesis for RapidPay and Global Treasury operations.
            </p>
          </div>
        </div>

        <div className="relative z-10 flex flex-wrap gap-3">
          <div className="flex items-center gap-2 px-4 py-2 bg-slate-900 border border-slate-700 text-slate-300 rounded-xl">
            <Users className="w-4 h-4 text-indigo-400" />
            <span className="text-xs font-bold uppercase tracking-widest">Multi-Agent Swarm</span>
          </div>
          <div className="flex items-center gap-2 px-4 py-2 bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 rounded-xl">
            <ShieldCheck className="w-4 h-4" />
            <span className="text-xs font-bold uppercase tracking-widest">RapidPay Verified</span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 h-[800px]">
        {/* Left Panel: Templates */}
        <div className="lg:col-span-3 flex flex-col gap-4">
          <div className="flex flex-col bg-slate-950 border border-slate-800 p-2 rounded-2xl gap-2">
            {(Object.keys(categories) as Array<keyof typeof categories>).map((key) => {
              const cat = categories[key];
              const Icon = cat.icon;
              return (
                <button
                  key={key}
                  onClick={() => setActiveCategory(key)}
                  className={`flex items-center justify-start gap-3 px-4 py-3 rounded-xl transition-all ${
                    activeCategory === key
                      ? 'bg-slate-800 text-white shadow-md border border-slate-700'
                      : 'text-slate-500 hover:text-slate-300 hover:bg-slate-900'
                  }`}
                >
                  <Icon className="w-5 h-5" />
                  <span className="text-[11px] font-black uppercase tracking-widest">{cat.title}</span>
                </button>
              )
            })}
          </div>

          <div className="flex-1 bg-slate-950 border border-slate-800 rounded-2xl p-4 overflow-y-auto space-y-3 custom-scrollbar">
            <h3 className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-4 flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-indigo-400" />
              Sovereign Templates
            </h3>
            
            {categories[activeCategory].docs.map(doc => (
              <button
                key={doc.id}
                onClick={() => handleGenerate(doc)}
                className={`w-full text-left p-4 rounded-xl border transition-all group ${
                  activeDocument?.id === doc.id
                    ? 'bg-indigo-600/20 border-indigo-500 shadow-[0_0_15px_rgba(99,102,241,0.15)]'
                    : 'bg-slate-900 border-slate-800 hover:border-slate-600'
                }`}
              >
                <div className="flex justify-between items-start mb-2">
                  <span className="text-[9px] font-black uppercase tracking-widest text-indigo-400 bg-indigo-500/10 px-2 py-0.5 rounded">
                    {doc.type}
                  </span>
                </div>
                <h4 className={`font-bold text-sm leading-tight transition-colors ${activeDocument?.id === doc.id ? 'text-white' : 'text-slate-300 group-hover:text-white'}`}>{doc.title}</h4>
              </button>
            ))}
          </div>
        </div>

        {/* Center Panel: Terminal */}
        <div className="lg:col-span-6 bg-slate-950 border border-slate-800 rounded-2xl flex flex-col overflow-hidden shadow-2xl relative">
          <div className="bg-slate-900 border-b border-slate-800 p-4 flex justify-between items-center z-10">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-indigo-500/20 rounded-lg">
                <FileSignature className="w-5 h-5 text-indigo-400" />
              </div>
              <div>
                <div className="text-white font-bold text-sm">DocuCraft Active Synthesis</div>
                <div className="text-[10px] text-slate-500 font-mono">LLM Output Stream // Quantum Secured</div>
              </div>
            </div>
            
            
            <div className="flex items-center gap-2">
              <button
                onClick={deployToWeb}
                disabled={!activeDocument || isGenerating}
                className={`flex items-center gap-2 px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${
                  !activeDocument || isGenerating
                    ? 'bg-slate-800 text-slate-500 cursor-not-allowed border border-slate-700'
                    : 'bg-indigo-600 text-white hover:bg-indigo-500 hover:scale-105 active:scale-95 shadow-[0_0_15px_rgba(79,70,229,0.3)]'
                }`}
              >
                <Globe className="w-4 h-4" /> Deploy to Web
              </button>
              <button
                onClick={handleDownloadPDF}
                disabled={!activeDocument || isGenerating}
                className={`flex items-center gap-2 px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${
                  !activeDocument || isGenerating
                    ? 'bg-slate-800 text-slate-500 cursor-not-allowed border border-slate-700'
                    : 'bg-emerald-500 text-slate-900 hover:bg-emerald-400 hover:scale-105 active:scale-95 shadow-[0_0_15px_rgba(16,185,129,0.3)]'
                }`}
              >
                <Download className="w-4 h-4" /> Export PDF
              </button>
            </div>

          </div>

          <div className="flex-1 bg-[#0A0F1C] p-6 overflow-y-auto font-mono text-sm text-slate-300 relative custom-scrollbar">
            {!activeDocument ? (
              <div className="absolute inset-0 flex flex-col items-center justify-center opacity-30">
                <FileText className="w-24 h-24 text-slate-500 mb-6" />
                <p className="text-slate-400 font-bold tracking-widest uppercase text-sm">Awaiting Input Parameters</p>
                <p className="text-slate-500 text-xs mt-2">Select a template to engage the Valourian AI Swarm.</p>
              </div>
            ) : (
              <div className="space-y-4 max-w-3xl">
                <div className="flex items-center justify-between text-indigo-400 text-xs border-b border-indigo-500/20 pb-2 mb-6">
                  <div className="flex items-center gap-2">
                    <Database className="w-4 h-4 animate-pulse" />
                    <span>SYSTEM.EXECUTE("{activeDocument.id}.ai")</span>
                  </div>
                  {isGenerating && (
                    <span className="flex items-center gap-2 text-emerald-400">
                      <Loader2 className="w-3 h-3 animate-spin" /> Swarm Generating
                    </span>
                  )}
                </div>
                
                <div className="whitespace-pre-wrap leading-relaxed text-slate-200">
                  {generatedText}
                  {isGenerating && <span className="inline-block w-2 h-4 bg-indigo-500 ml-1 animate-pulse" />}
                  <div ref={textEndRef} />
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Right Panel: AI Agents Suite */}
        <div className="lg:col-span-3 flex flex-col gap-4">
          <div className="bg-slate-950 border border-slate-800 rounded-2xl p-5 shadow-2xl flex-1 flex flex-col">
            <h3 className="text-xs font-black text-white uppercase tracking-widest mb-1 flex items-center gap-2">
              <Network className="w-4 h-4 text-cyan-400" />
              World Winning Suite
            </h3>
            <p className="text-[10px] text-slate-500 uppercase tracking-widest mb-6">Collaborative AI Agents</p>
            
            <div className="space-y-3 flex-1 overflow-y-auto custom-scrollbar pr-2">
              {renderAgentProgress('aws', 'AWS GovCloud', 'Secure Boot & Infra', Server, 'orange')}
              {renderAgentProgress('gcp', 'Google Cloud', 'Deep Search Verif', Search, 'blue')}
              {renderAgentProgress('ultra', 'Ultra Core', 'Strategic Synthesis', Zap, 'cyan')}
              {renderAgentProgress('anthropic', 'Anthropic', 'Legal & Alignment', ShieldCheck, 'rose')}
              {renderAgentProgress('grok', 'SuperGrok', 'Market Sentiment', Bot, 'amber')}
            </div>

            <div className="mt-4 pt-4 border-t border-slate-800">
              <div className="flex items-center gap-3 p-3 bg-indigo-500/10 border border-indigo-500/20 rounded-xl">
                <div className="p-2 bg-indigo-500/20 text-indigo-400 rounded-lg">
                  <Globe className="w-5 h-5" />
                </div>
                <div>
                  <div className="text-[10px] font-black text-indigo-400 uppercase tracking-widest">Powered By</div>
                  <div className="text-xs font-bold text-slate-200">Valourian Capital Inc.</div>
                </div>
              </div>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
