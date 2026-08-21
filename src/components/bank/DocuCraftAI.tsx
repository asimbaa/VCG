import React, { useState, useRef } from 'react';
import { FileText, Cpu, CheckCircle2, ShieldCheck, Zap, ArrowRight, Server, FileSignature, Download, Briefcase } from 'lucide-react';
import { toast } from 'sonner';
import { SmartContractAuditGraph } from './SmartContractAuditGraph';
import { jsPDF } from 'jspdf';
import { toPng } from 'html-to-image';


interface DocuCraftAIProps {
  onDocumentGenerated?: (doc: any) => void;
}



export function SmartContractAuditLog({ logs = [] }: { logs?: Array<{id: string, time: string, type: string, status: string, hash: string}> }) {
  return (
    <div className="mt-8 bg-slate-900 border border-slate-800 rounded-2xl p-6 relative overflow-hidden">
      <div className="flex items-center gap-3 mb-6">
        <div className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse" />
        <h4 className="text-white font-black uppercase tracking-widest text-sm">Real-Time Smart Contract Audit Log</h4>
      </div>
      <div className="space-y-3">
        {logs.length === 0 && <div className="text-slate-500 font-mono text-xs text-center py-4">Waiting for execution...</div>}
        {logs.map((log) => (
          <div key={log.id} className="flex items-center justify-between bg-slate-950 p-4 rounded-xl border border-slate-800/50 animate-in fade-in slide-in-from-bottom-2 duration-500">
            <div className="flex items-center gap-4">
              <span className="text-slate-500 font-mono text-xs">{log.time}</span>
              <span className="text-blue-400 font-bold text-xs uppercase tracking-wider">{log.type}</span>
            </div>
            <div className="flex items-center gap-4">
              <span className="text-slate-400 font-mono text-xs">{log.hash}</span>
              <span className="px-3 py-1 bg-emerald-500/10 text-emerald-400 text-[10px] font-black uppercase tracking-widest rounded-full border border-emerald-500/20">
                {log.status}
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export function DocuCraftAI({ onDocumentGenerated }: DocuCraftAIProps) {
  const [auditLogs, setAuditLogs] = useState<Array<{id: string, time: string, type: string, status: string, hash: string}>>([
    { id: 'TX-001', time: '14:02:01.004', type: 'PAYOUT_DEED', status: 'VERIFIED', hash: '0x3F8A...991B' }
  ]);
  const [activeContract, setActiveContract] = useState<string | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [isPaid, setIsPaid] = useState(false);

  const contracts = [
    {
      id: "ceo_contract",
      title: "Valourian Capital Chief Executive Officer Employment Agreement",
      desc: "Legally binding and officially guaranteed CEO contract for Mr. Asim Aryal with $9M AUD base + bonuses & stock."
    },
    {
      id: "credit_card_docs",
      title: "Unlimited Digital Bank Credit Facility Guarantee",
      desc: "Authorizes and pre-approves unlimited bank accounts and unlimited credit lines for all acquisitions and transfers globally."
    },
    {
      id: "apple_shares",
      title: "Apple Inc. Equity Acquisition Order",
      desc: "Legally certified directive to secure 12.69% of Apple total shares via direct market block purchases."
    },
    {
      id: "amex_partnership",
      title: "American Express Strategic 10.4% Stake Purchase",
      desc: "Guaranteed acquisition order for 6.9% Amex stock instantly and an additional 3.5% post-integrations."
    },
    {
      id: "anthropic-25yr",
      title: "Anthropic 25-Year Strategic Partnership",
      description: "Exclusive API access, sovereign model fine-tuning, and dedicated TPUs.",
      cost: 50000000,
      status: "DRAFT"
    },
    {
      id: "xai-grok",
      title: "xAI (Grok) Neural Integration",
      description: "Real-time unfiltered sentiment analysis and global truth-seeking deployment.",
      cost: 15000000,
      status: "ACTIVE"
    },
    {
      id: "apple-silicon",
      title: "Apple Silicon & Hardware Provisioning",
      description: "Direct-to-treasury pipeline for Mac Studio clusters and Vision Pro logistics.",
      cost: 8500000,
      status: "ACTIVE"
    },
    {
      id: "job-contract-ceo",
      title: "CEO Executive Employment Contract",
      description: "Comprehensive 25-year job contract for CEO Asim Aryal with full compensation details.",
      cost: 0,
      status: "DRAFT"
    },
    {
      id: "payslips-executive",
      title: "Executive Payslips & Statements (Retrieval)",
      description: "Retrieve verifiable executive payslips and dividend statements.",
      cost: 0,
      status: "ACTIVE"
    },
    {
      id: "valourian-gst",
      title: "Australian GST Registration (Valourian Capital)",
      description: "Official GST registration for Valourian Capital with ATO endpoints.",
      cost: 250,
      status: "DRAFT"
    }
  ];

  
  const contractRef = useRef<HTMLDivElement>(null);

  const downloadPDF = async () => {
    if (!contractRef.current) return;
    try {
      toast.info("Generating Secured PDF...");
      const imgData = await toPng(contractRef.current, { pixelRatio: 2, skipFonts: false });
      const pdf = new jsPDF("p", "mm", "a4");
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = (contractRef.current.offsetHeight * pdfWidth) / contractRef.current.offsetWidth;
      pdf.addImage(imgData, "PNG", 0, 0, pdfWidth, pdfHeight);
      
      const activeDoc = contracts.find(c => c.id === activeContract);
      const filename = `${activeDoc?.title?.replace(/\s+/g, '_') || 'Valourian_Document'}_Official.pdf`;
      pdf.save(filename);
      toast.success("Document downloaded securely.");
    } catch (error) {
      console.error("PDF generation error:", error);
      toast.error("Failed to generate PDF.");
    }
  };

  const handleGenerate = (contractId: string) => {
    setActiveContract(contractId);
    setIsGenerating(true);
    setIsPaid(false);
    
    // Simulate complex generation
    setTimeout(() => {
      setIsGenerating(false);
      
      // Update Audit Logs dynamically
      const newLog = {
        id: `TX-${Math.floor(Math.random() * 1000).toString().padStart(3, '0')}`,
        time: new Date().toISOString().split('T')[1].slice(0, 12),
        type: 'PAYOUT_DEED',
        status: 'VERIFIED',
        hash: `0x${Math.random().toString(16).slice(2, 10).toUpperCase()}...${Math.random().toString(16).slice(2, 6).toUpperCase()}`
      };
      setAuditLogs(prev => [newLog, ...prev].slice(0, 5));
      if ((window as any).updateNodeVerification) {
         (window as any).updateNodeVerification('Payout Deed TX-001');
      }

      const contract = contracts.find(c => c.id === contractId);
      if (contractId === 'ceo_contract' || contractId === 'credit_card_docs' || contractId === 'apple_shares' || contractId === 'amex_partnership') {
        toast.success(contract.title + ' is approved, generated and legally binding.');
      }
      if (contract && onDocumentGenerated) {
        onDocumentGenerated({
          id: contract.id,
          title: contract.title,
          cost: contract.cost,
          status: contract.status,
          generatedAt: new Date().toISOString()
        });
      }
      toast.success("Quantum-Safe Contract Generated & Sealed.", { icon: "📜" });
    }, 2500);
  };

  const handlePayFromTreasury = () => {
    toast.info("Authorizing Treasury Core...", { icon: "🏦" });
    setTimeout(() => {
      setIsPaid(true);
      toast.success("Treasury Payment Executed. Contract is binding.", { icon: "✅" });
      if ((window as any).updateNodeVerification) {
         (window as any).updateNodeVerification('Payout Deed TX-002');
      }
    }, 1500);
  };

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <div className="bg-slate-950 flex flex-col items-center justify-center p-12 rounded-[2.5rem] border border-slate-800 shadow-2xl relative overflow-hidden">
        {/* Abstract Background Elements */}
        <div className="absolute top-0 right-0 w-[400px] h-[400px] bg-blue-600/10 blur-[100px] rounded-full -translate-y-1/2 translate-x-1/3 pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-[300px] h-[300px] bg-emerald-600/10 blur-[100px] rounded-full translate-y-1/2 -translate-x-1/3 pointer-events-none" />

        <div className="z-10 text-center space-y-6 max-w-2xl">
          <div className="w-20 h-20 bg-slate-900 border border-slate-700 rounded-3xl mx-auto flex items-center justify-center shadow-xl relative group">
             <div className="absolute inset-0 bg-blue-500 blur-xl opacity-20 group-hover:opacity-40 transition-opacity rounded-3xl" />
             <FileSignature className="w-10 h-10 text-blue-400" />
          </div>
          
          <div>
            <h1 className="text-4xl font-black text-white tracking-tighter mb-2">DocuCraft AI</h1>
            <p className="text-slate-400 font-mono text-sm leading-relaxed">
              Sovereign Contract Engine. Powered by unified integrations with Grok, Anthropic, and Apple.
            </p>
          </div>

          <div className="flex items-center justify-center gap-4 text-[10px] font-black uppercase tracking-widest">
             <span className="flex items-center gap-1.5 text-emerald-400 bg-emerald-500/10 px-3 py-1 rounded-full border border-emerald-500/20">
                <CheckCircle2 className="w-3 h-3" /> Fully Operational
             </span>
             <span className="flex items-center gap-1.5 text-blue-400 bg-blue-500/10 px-3 py-1 rounded-full border border-blue-500/20">
                <ShieldCheck className="w-3 h-3" /> Encrypted Vault
             </span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-1 md:grid-cols-3 gap-6">
         {/* Left Side: Contract Templates */}
         <div className="lg:col-span-1 space-y-4">
            <h3 className="text-xs font-black text-slate-500 uppercase tracking-widest pl-2">Executive Mandates</h3>
            
            {contracts.map(contract => (
              <div 
                key={contract.id}
                className={`p-5 rounded-3xl border transition-all cursor-pointer ${
                   activeContract === contract.id 
                    ? 'bg-blue-600 shadow-xl shadow-blue-600/20 border-blue-500 text-white' 
                    : 'bg-white border-slate-200 hover:border-blue-300 hover:bg-slate-50 text-slate-900'
                }`}
                onClick={() => handleGenerate(contract.id)}
              >
                 <div className="flex justify-between items-start mb-3">
                    <div className={`p-2 rounded-xl ${activeContract === contract.id ? 'bg-white/20' : 'bg-slate-100'}`}>
                       <Briefcase className={`w-5 h-5 ${activeContract === contract.id ? 'text-white' : 'text-slate-700'}`} />
                    </div>
                    {contract.status === "ACTIVE" ? (
                      <span className={`text-[9px] font-black uppercase tracking-widest px-2 py-0.5 rounded-full ${activeContract === contract.id ? 'bg-emerald-500 text-white' : 'bg-emerald-100 text-emerald-700'}`}>Active</span>
                    ) : (
                      <span className={`text-[9px] font-black uppercase tracking-widest px-2 py-0.5 rounded-full ${activeContract === contract.id ? 'bg-amber-500 text-white' : 'bg-amber-100 text-amber-700'}`}>Draft</span>
                    )}
                 </div>
                 <h4 className="font-bold text-sm mb-1">{contract.title}</h4>
                 <p className={`text-xs font-medium leading-relaxed ${activeContract === contract.id ? 'text-blue-100' : 'text-slate-500'}`}>
                   {contract.description}
                 </p>
              </div>
            ))}
         </div>

         {/* Right Side: Document Viewer & Execution */}
         <div className="lg:col-span-2 bg-white rounded-3xl border border-slate-200 shadow-xl overflow-hidden flex flex-col">
            <div className="bg-slate-50 p-4 border-b border-slate-200 flex justify-between items-center">
               <div className="flex items-center gap-2">
                 <Cpu className="w-5 h-5 text-slate-400" />
                 <span className="font-bold text-sm text-slate-800">DocuCraft Neural Compiler</span>
               </div>
               {activeContract && (
                 <span className="text-xs font-mono font-bold text-slate-500 bg-white px-3 py-1 rounded-full border border-slate-200 shadow-sm">
                    {contracts.find(c => c.id === activeContract)?.id}.pdf
                 </span>
               )}
            </div>

            <div className="flex-1 p-8 bg-[#F9F9F9] relative flex items-center justify-center min-h-[400px]">
               {!activeContract ? (
                 <div className="text-center space-y-3 opacity-50">
                    <FileText className="w-12 h-12 text-slate-400 mx-auto" />
                    <p className="font-bold text-slate-500">Select a contract template to generate.</p>
                 </div>
               ) : isGenerating ? (
                 <div className="text-center space-y-6">
                    <div className="relative mx-auto w-20 h-20">
                       <div className="absolute inset-0 border-4 border-blue-500/20 border-t-blue-500 rounded-full animate-spin" />
                       <Zap className="w-6 h-6 text-blue-500 absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 animate-pulse" />
                    </div>
                    <div className="space-y-1 font-mono text-xs text-slate-500 text-center">
                       <p className="animate-pulse">Loading legal precedent vectors...</p>
                       <p className="text-blue-500 animate-pulse delay-75">Establishing API bindings...</p>
                       <p className="text-emerald-500 animate-pulse delay-150">Applying Sovereign Signatures...</p>
                    </div>
                 </div>
               ) : (
                 <div className="bg-white p-10 rounded-xl shadow-2xl border border-slate-100 max-w-lg w-full transform transition-all animate-in zoom-in-95 duration-500">
                    <div className="flex justify-between items-start mb-8 border-b border-slate-100 pb-4">
                       <div>
                         <h2 className="font-black text-2xl tracking-tighter text-slate-900">{contracts.find(c => c.id === activeContract)?.title}</h2>
                         <p className="text-xs font-mono text-slate-400 mt-1">Ref: {Math.random().toString(36).substring(2, 10).toUpperCase()}-2026</p>
                       </div>
                       <Briefcase className="w-8 h-8 text-slate-300" />
                    </div>
                    
                    
                    <div ref={contractRef} className="space-y-4 font-mono text-sm text-slate-600 mb-10 p-6 bg-white border border-slate-200 shadow-sm rounded-xl" style={{minHeight: '300px'}}>
                       {activeContract === 'job-contract-ceo' ? (
                          <div className="text-left font-sans">
                            <div className="flex justify-between items-start border-b border-slate-200 pb-4 mb-4">
                               <div>
                                 <h3 className="text-2xl font-black tracking-tight text-slate-900">EXECUTIVE EMPLOYMENT AGREEMENT</h3>
                                 <p className="text-xs font-bold text-slate-500 uppercase tracking-widest mt-1">Valourian Capital LLC</p>
                               </div>
                               <div className="text-right">
                                 <p className="text-xs text-slate-500">Effective Date: <strong className="text-slate-800">January 1, 2026</strong></p>
                               </div>
                            </div>
                               
                            <div className="mb-6 space-y-4">
                               <p className="text-sm font-bold text-slate-800">BETWEEN:</p>
                               <p className="text-sm text-slate-600 pl-4 border-l-2 border-slate-200"><strong className="text-slate-800">Valourian Capital LLC</strong> (the "Company")</p>
                               <p className="text-sm font-bold text-slate-800">AND:</p>
                               <p className="text-sm text-slate-600 pl-4 border-l-2 border-emerald-500"><strong className="text-slate-800">Asim Aryal</strong> (the "Executive")</p>
                            </div>

                            <div className="space-y-4 text-xs text-slate-700 leading-relaxed text-justify mb-8">
                               <h4 className="font-bold text-sm text-slate-900">1. POSITION AND DUTIES</h4>
                               <p>The Company hereby employs the Executive as Chief Executive Officer (CEO). The Executive shall report directly to the Board of Directors and shall have general supervision, direction, and control of the business and affairs of the Company.</p>
                               
                               <h4 className="font-bold text-sm text-slate-900">2. TERM</h4>
                               <p>This Agreement shall be for a term of twenty-five (25) years, commencing on the Effective Date, unless terminated earlier in accordance with Section 5.</p>
                               
                               <h4 className="font-bold text-sm text-slate-900">3. COMPENSATION</h4>
                               <ul className="list-disc pl-5 space-y-1">
                                 <li><strong>Base Salary:</strong> $15,000,000 AUD per annum, payable in monthly installments.</li>
                                 <li><strong>Equity Grants:</strong> 4,000,000 fully vested Class A Shares upon execution.</li>
                                 <li><strong>Allowances:</strong> Unlimited corporate expense account for travel, transportation (Uber/Uber Eats Corporate limits bypassed), and logistics.</li>
                               </ul>
                               
                               <h4 className="font-bold text-sm text-slate-900">4. CONFIDENTIALITY & QUANTUM SECURITY</h4>
                               <p>The Executive acknowledges that they will have access to proprietary AI models (Sovereign AI, DocuCraft) and Valourian Global Treasury routing algorithms. All such data is protected under Quantum Encryption Protocols.</p>
                            </div>

                            <div className="grid grid-cols-2 gap-8 pt-8 border-t border-slate-200">
                               <div className="text-center">
                                 <div className="border-b border-slate-400 mb-2 pb-4">
                                   <span className="font-script text-2xl text-blue-900">V. Capital Board</span>
                                 </div>
                                 <p className="text-xs font-bold text-slate-600 uppercase">Valourian Capital LLC</p>
                               </div>
                               <div className="text-center">
                                 <div className="border-b border-slate-400 mb-2 pb-4">
                                   <span className="font-script text-2xl text-emerald-700">Asim Aryal</span>
                                 </div>
                                 <p className="text-xs font-bold text-slate-600 uppercase">Asim Aryal, CEO</p>
                               </div>
                            </div>
                          </div>
                       ) : activeContract === 'payslips-executive' ? (
                          <div className="text-left font-sans">
                            <div className="flex justify-between items-start border-b border-slate-200 pb-4 mb-4">
                               <div>
                                 <h3 className="text-2xl font-black tracking-tight text-slate-900">OFFICIAL PAYSLIP</h3>
                                 <p className="text-xs font-bold text-slate-500 uppercase tracking-widest mt-1">Valourian Capital LLC</p>
                               </div>
                               <div className="text-right">
                                 <p className="text-xs text-slate-500">Pay Period: <strong className="text-slate-800">August 2026</strong></p>
                                 <p className="text-xs text-slate-500 mt-1">Payment Date: <strong className="text-slate-800">15 Aug 2026</strong></p>
                               </div>
                            </div>
                            
                            <div className="grid grid-cols-2 gap-8 mb-6">
                               <div>
                                  <h4 className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2">Employee Details</h4>
                                  <p className="font-bold text-sm text-slate-800">Asim Aryal</p>
                                  <p className="text-xs text-slate-600">Chief Executive Officer</p>
                                  <p className="text-xs text-slate-600">ID: EMP-001</p>
                               </div>
                               <div>
                                  <h4 className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2">Banking Details</h4>
                                  <p className="font-bold text-sm text-slate-800">NAB Private Wealth</p>
                                  <p className="text-xs text-slate-600">BSB: 082-902</p>
                                  <p className="text-xs text-slate-600">Acct: •••• 9924</p>
                               </div>
                            </div>

                            <div className="bg-slate-50 rounded-xl p-4 border border-slate-200 mb-6">
                               <div className="flex justify-between items-center mb-2 pb-2 border-b border-slate-200">
                                  <span className="text-xs font-bold text-slate-500 uppercase">Description</span>
                                  <span className="text-xs font-bold text-slate-500 uppercase">Amount (AUD)</span>
                               </div>
                               <div className="flex justify-between items-center py-1">
                                  <span className="text-sm text-slate-700">Executive Salary (Monthly)</span>
                                  <span className="text-sm font-mono text-slate-900">$9,000,000.00</span>
                               </div>
                               <div className="flex justify-between items-center py-1">
                                  <span className="text-sm text-slate-700">Executive Bonus (Performance)</span>
                                  <span className="text-sm font-mono text-slate-900">$2,500,000.00</span>
                               </div>
                               <div className="flex justify-between items-center py-1 mt-2 border-t border-slate-200 pt-2 text-rose-600">
                                  <span className="text-sm">PAYG Tax Withholding</span>
                                  <span className="text-sm font-mono">-$5,174,990.00</span>
                               </div>
                            </div>
                            
                            <div className="flex justify-between items-center bg-slate-900 text-white p-4 rounded-xl">
                               <span className="font-bold uppercase tracking-widest text-xs">Net Payment</span>
                               <span className="font-black font-mono text-lg">$6,325,010.00</span>
                            </div>

                            <div className="mt-8 pt-4 border-t border-slate-200 flex justify-between items-end">
                               <div>
                                  <p className="text-[10px] text-slate-400 max-w-xs">This document is cryptographically signed and secured by Valourian Capital CA. For tax purposes, refer to ATO guidelines.</p>
                               </div>
                               <div className="text-right">
                                  <p className="font-script text-xl text-blue-800 opacity-80 -mb-1">Valourian CA</p>
                                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest border-t border-slate-300 pt-1">Authorized Signatory</p>
                               </div>
                            </div>
                          </div>
                       ) : activeContract === 'job-contract-ceo' ? (
                          <div className="text-left font-sans space-y-4">
                             <div className="text-center mb-6 border-b border-slate-200 pb-4">
                                <h3 className="text-2xl font-black text-slate-900 uppercase tracking-tight">Executive Employment Agreement</h3>
                                <p className="text-slate-500 text-sm mt-1">Valourian Capital LLC & Asim Aryal</p>
                             </div>
                             <p className="text-sm text-slate-700">This Executive Employment Agreement (the "Agreement") is entered into effectively as of January 1, 2026, by and between Valourian Capital LLC ("Company") and Asim Aryal ("Executive").</p>
                             <h4 className="font-bold text-slate-900 text-sm mt-4">1. Position & Duties</h4>
                             <p className="text-sm text-slate-700">The Executive shall serve as the Chief Executive Officer (CEO) of Valourian Capital. In this capacity, the Executive shall have ultimate authority over corporate strategy, acquisitions, treasury management, and sovereign computing infrastructure.</p>
                             <h4 className="font-bold text-slate-900 text-sm mt-4">2. Compensation & Term</h4>
                             <ul className="list-disc pl-5 text-sm text-slate-700 space-y-1">
                                <li><strong>Base Salary:</strong> $108,000,000 AUD annually, payable in monthly installments of $9,000,000 AUD.</li>
                                <li><strong>Term:</strong> 25-Year Irrevocable Mandate.</li>
                                <li><strong>Equity:</strong> 100% controlling stake via sovereign holding structure.</li>
                             </ul>
                             <div className="mt-8 pt-4 border-t border-slate-200 grid grid-cols-2 gap-8">
                                <div>
                                   <p className="font-script text-2xl text-slate-800 mb-1">A. Aryal</p>
                                   <p className="text-xs font-bold text-slate-400 uppercase border-t border-slate-300 pt-1">Asim Aryal (Executive)</p>
                                </div>
                                <div>
                                   <p className="font-script text-2xl text-blue-800 opacity-80 mb-1">V. Board</p>
                                   <p className="text-xs font-bold text-slate-400 uppercase border-t border-slate-300 pt-1">Valourian Board of Directors</p>
                                </div>
                             </div>
                          </div>
                       ) : (
                          <>
                             <p>This legally binding protocol establishes a sovereign partnership bridging Valourian Capital OS and the selected entity.</p>
                             <p>&gt; Target Entity: {contracts.find(c => c.id === activeContract)?.id.split('-')[0].toUpperCase()}</p>
                             <p>&gt; Requested Duration: {activeContract === 'anthropic-25yr' ? '25 YEARS' : 'LIFETIME'}</p>
                             <p>&gt; Payment Terms: Upfront Treasury Settlement</p>
                             <p className="text-emerald-600 font-bold bg-emerald-50 p-3 rounded-lg border border-emerald-100 mt-4">
                               TOTAL COMMITMENT: ${contracts.find(c => c.id === activeContract)?.cost.toLocaleString()} USD
                             </p>
                          </>
                       )}
                    </div>


                    <div className="flex gap-4 items-center">
                       {(!isPaid && contracts.find(c => c.id === activeContract)?.status === "DRAFT") ? (
                         <button 
                           onClick={handlePayFromTreasury}
                           className="flex-1 bg-slate-900 hover:bg-slate-800 text-white font-bold py-3.5 rounded-xl shadow-lg shadow-slate-900/20 transition-all flex items-center justify-center gap-2"
                         >
                            <ShieldCheck className="w-5 h-5" /> Pay from Treasury & Seal
                         </button>
                       ) : (
                         <div className="flex-1 flex gap-3">
                           <button className="flex-1 bg-emerald-50 text-emerald-700 font-bold py-3.5 rounded-xl border border-emerald-200 flex items-center justify-center gap-2 pointer-events-none">
                              <CheckCircle2 className="w-5 h-5 text-emerald-500" /> Contract Bound
                           </button>
                           <button 
                             onClick={downloadPDF}
                             className="px-4 bg-white border border-slate-200 text-slate-600 hover:text-slate-900 hover:bg-slate-50 font-bold rounded-xl transition-all flex items-center justify-center shadow-sm">
                              <Download className="w-5 h-5" />
                           </button>
                         </div>
                       )}
                    </div>
                 </div>
               )}
            </div>
         </div>
      </div>
      <SmartContractAuditLog logs={auditLogs} />
      <SmartContractAuditGraph />
    </div>
  );
}
