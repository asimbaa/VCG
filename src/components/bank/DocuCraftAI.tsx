import React, { useState } from 'react';
import { FileText, Cpu, CheckCircle2, ShieldCheck, Zap, ArrowRight, Server, FileSignature, Download, Briefcase } from 'lucide-react';
import { toast } from 'sonner';

interface DocuCraftAIProps {
  onDocumentGenerated?: (doc: any) => void;
}

export function DocuCraftAI({ onDocumentGenerated }: DocuCraftAIProps) {
  const [activeContract, setActiveContract] = useState<string | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [isPaid, setIsPaid] = useState(false);

  const contracts = [
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
    }
  ];

  const handleGenerate = (contractId: string) => {
    setActiveContract(contractId);
    setIsGenerating(true);
    setIsPaid(false);
    
    // Simulate complex generation
    setTimeout(() => {
      setIsGenerating(false);
      const contract = contracts.find(c => c.id === contractId);
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

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
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
                    
                    <div className="space-y-4 font-mono text-sm text-slate-600 mb-10">
                       <p>This legally binding protocol establishes a sovereign partnership bridging Valourian Capital OS and the selected entity.</p>
                       <p>&gt; Target Entity: {contracts.find(c => c.id === activeContract)?.id.split('-')[0].toUpperCase()}</p>
                       <p>&gt; Requested Duration: {activeContract === 'anthropic-25yr' ? '25 YEARS' : 'LIFETIME'}</p>
                       <p>&gt; Payment Terms: Upfront Treasury Settlement</p>
                       <p className="text-emerald-600 font-bold bg-emerald-50 p-3 rounded-lg border border-emerald-100 mt-4">
                         TOTAL COMMITMENT: ${contracts.find(c => c.id === activeContract)?.cost.toLocaleString()} USD
                       </p>
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
                           <button className="px-4 bg-white border border-slate-200 text-slate-600 hover:text-slate-900 hover:bg-slate-50 font-bold rounded-xl transition-all flex items-center justify-center shadow-sm">
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
    </div>
  );
}
