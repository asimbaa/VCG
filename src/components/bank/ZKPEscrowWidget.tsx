import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Shield, Lock, Unlock, FileCheck, Fingerprint, EyeOff, Loader2, Key } from 'lucide-react';
import { toast } from 'sonner';

export function ZKPEscrowWidget() {
  const [escrowState, setEscrowState] = useState<'idle' | 'generating' | 'locked' | 'verifying' | 'released'>('idle');
  
  const handleLock = () => {
    setEscrowState('generating');
    setTimeout(() => {
      setEscrowState('locked');
      toast.success("Funds cryptographically locked in ZKP Escrow.");
    }, 2000);
  };
  
  const handleRelease = () => {
    setEscrowState('verifying');
    setTimeout(() => {
      setEscrowState('released');
      toast.success("ZKP Cryptographic verification passed. Funds released instantly without exposing underlying contract terms.");
      setTimeout(() => setEscrowState('idle'), 3000);
    }, 2500);
  };

  return (
    <div className="bg-slate-900 rounded-[2.5rem] p-8 border border-slate-800 relative overflow-hidden group">
      <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-500/10 blur-[80px] rounded-full group-hover:bg-emerald-500/20 transition-colors pointer-events-none" />
      
      <div className="relative z-10">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h3 className="text-xl font-black text-white italic tracking-tighter uppercase flex items-center gap-2">
              <EyeOff className="w-5 h-5 text-emerald-400" />
              ZKP Corporate Escrow
            </h3>
            <p className="text-slate-400 text-xs font-bold uppercase tracking-widest mt-1">
              Zero-Knowledge Proof Settlement
            </p>
          </div>
          <div className="px-3 py-1 bg-emerald-500/20 border border-emerald-500/30 rounded-full flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
            <span className="text-[10px] font-black text-emerald-400 uppercase tracking-widest">Active</span>
          </div>
        </div>

        <div className="bg-slate-950 rounded-2xl p-6 border border-slate-800 mb-6 flex flex-col items-center justify-center min-h-[160px]">
          <AnimatePresence mode="wait">
            {escrowState === 'idle' && (
              <motion.div key="idle" initial={{opacity:0}} animate={{opacity:1}} exit={{opacity:0}} className="text-center space-y-4">
                <Shield className="w-12 h-12 text-slate-500 mx-auto" />
                <div>
                  <h4 className="text-white font-bold">Awaiting Escrow Generation</h4>
                  <p className="text-xs text-slate-400">Lock multi-million dollar contracts with absolute privacy.</p>
                </div>
              </motion.div>
            )}
            {escrowState === 'generating' && (
              <motion.div key="generating" initial={{opacity:0}} animate={{opacity:1}} exit={{opacity:0}} className="text-center space-y-4">
                <Loader2 className="w-12 h-12 text-emerald-500 mx-auto animate-spin" />
                <div>
                  <h4 className="text-emerald-400 font-bold">Generating zk-SNARKs</h4>
                  <p className="text-xs text-emerald-500/80">Encrypting contract heuristics...</p>
                </div>
              </motion.div>
            )}
            {escrowState === 'locked' && (
              <motion.div key="locked" initial={{opacity:0}} animate={{opacity:1}} exit={{opacity:0}} className="text-center space-y-4">
                <Lock className="w-12 h-12 text-amber-500 mx-auto" />
                <div>
                  <h4 className="text-amber-400 font-bold">Funds Locked in ZKP</h4>
                  <p className="text-xs text-amber-500/80">Waiting for counterparty cryptographic signature.</p>
                </div>
              </motion.div>
            )}
            {escrowState === 'verifying' && (
              <motion.div key="verifying" initial={{opacity:0}} animate={{opacity:1}} exit={{opacity:0}} className="text-center space-y-4">
                <Fingerprint className="w-12 h-12 text-blue-500 mx-auto animate-pulse" />
                <div>
                  <h4 className="text-blue-400 font-bold">Verifying Proof</h4>
                  <p className="text-xs text-blue-500/80">Validating without decrypting payload...</p>
                </div>
              </motion.div>
            )}
            {escrowState === 'released' && (
              <motion.div key="released" initial={{opacity:0}} animate={{opacity:1}} exit={{opacity:0}} className="text-center space-y-4">
                <Unlock className="w-12 h-12 text-emerald-400 mx-auto" />
                <div>
                  <h4 className="text-emerald-400 font-bold">Settlement Complete</h4>
                  <p className="text-xs text-emerald-500/80">Funds disbursed with zero trace.</p>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <button 
            disabled={escrowState !== 'idle'}
            onClick={handleLock}
            className="py-3 bg-slate-800 hover:bg-slate-700 disabled:opacity-50 text-white font-black uppercase tracking-widest text-xs rounded-xl transition-all flex items-center justify-center gap-2"
          >
            <Lock className="w-4 h-4" /> Initialize
          </button>
          <button 
            disabled={escrowState !== 'locked'}
            onClick={handleRelease}
            className="py-3 bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white font-black uppercase tracking-widest text-xs rounded-xl transition-all shadow-[0_0_20px_rgba(16,185,129,0.3)] flex items-center justify-center gap-2"
          >
            <Key className="w-4 h-4" /> Release
          </button>
        </div>
      </div>
    </div>
  );
}
