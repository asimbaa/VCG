import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FileSignature, ShieldCheck, ArrowRight, CheckCircle2, Lock, Loader2, Globe } from 'lucide-react';
import { toast } from 'sonner';
import { useGlobalCurrency } from '../../contexts/CurrencyContext';

export function SmartLegalExecutionWidget({ documentText, onComplete }: { documentText: string, onComplete?: () => void }) {
  const [executionState, setExecutionState] = useState<'idle' | 'signing' | 'clearing' | 'success'>('idle');
  const { formatConverted } = useGlobalCurrency();
  
  const isEligible = documentText && (
    documentText.toLowerCase().includes('salary') || 
    documentText.toLowerCase().includes('payout') || 
    documentText.toLowerCase().includes('deed') || 
    documentText.toLowerCase().includes('agreement') || 
    documentText.toLowerCase().includes('contract') || 
    documentText.toLowerCase().includes('acquisition') || 
    documentText.toLowerCase().includes('m&a')
  );

  const executeSmartContract = () => {
    setExecutionState('signing');
    toast.info("Initiating Cryptographic Signatures...");
    
    setTimeout(() => {
      setExecutionState('clearing');
      toast.info("Signatures verified. Dispatching sovereign settlement via Valourian Gateway...");
      
      setTimeout(() => {
        setExecutionState('success');
        toast.success("Smart Legal Engine Executed! Payouts dispatched via global sovereign networks.");
        if (onComplete) {
            onComplete();
        }
        
        setTimeout(() => setExecutionState('idle'), 4000);
      }, 3500);
    }, 2000);
  };

  if (!isEligible) return null;

  return (
    <div className="mt-8 bg-slate-900 rounded-[2.5rem] p-8 border border-slate-800 relative overflow-hidden group">
      <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-500/10 blur-[80px] rounded-full group-hover:bg-emerald-500/20 transition-colors pointer-events-none" />
      
      <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-6">
        <div className="flex items-start gap-5">
          <div className="p-4 bg-emerald-900/50 rounded-3xl border border-emerald-400/20 shadow-inner">
            <FileSignature className="w-8 h-8 text-emerald-400" />
          </div>
          <div>
            <div className="flex items-center gap-3 mb-2">
              <h4 className="text-xl font-black text-white italic tracking-tighter uppercase">Smart Legal Execution</h4>
              <span className="px-3 py-1 bg-emerald-500/20 text-emerald-300 text-[10px] font-black uppercase tracking-widest rounded-full border border-emerald-500/30 flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" />
                Programmable Ledger
              </span>
            </div>
            <p className="text-sm text-slate-400 leading-relaxed max-w-xl font-medium">
              This document contains binding financial directives. Execute this contract to autonomously dispatch zero-latency sovereign payouts based on the encoded terms.
            </p>
          </div>
        </div>

        <div className="w-full md:w-auto">
          {executionState === 'idle' && (
            <button 
              onClick={executeSmartContract}
              className="w-full md:w-auto py-4 px-8 bg-emerald-600 hover:bg-emerald-500 text-white font-black uppercase tracking-widest text-xs rounded-2xl transition-all shadow-[0_0_20px_rgba(16,185,129,0.3)] flex items-center justify-center gap-3"
            >
              <Lock className="w-4 h-4" /> Sign & Execute Payouts
            </button>
          )}
          
          {executionState === 'signing' && (
            <div className="py-4 px-8 bg-slate-800 text-emerald-400 font-black uppercase tracking-widest text-xs rounded-2xl border border-emerald-500/30 flex items-center justify-center gap-3">
              <Loader2 className="w-4 h-4 animate-spin" /> Applying Cryptographic Signatures...
            </div>
          )}
          
          {executionState === 'clearing' && (
            <div className="py-4 px-8 bg-slate-800 text-blue-400 font-black uppercase tracking-widest text-xs rounded-2xl border border-blue-500/30 flex items-center justify-center gap-3">
              <Globe className="w-4 h-4 animate-pulse" /> Dispatching Sovereign Settlement...
            </div>
          )}
          
          {executionState === 'success' && (
            <div className="py-4 px-8 bg-emerald-500/20 text-emerald-400 font-black uppercase tracking-widest text-xs rounded-2xl border border-emerald-500 flex items-center justify-center gap-3">
              <CheckCircle2 className="w-4 h-4" /> Contract Executed
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
