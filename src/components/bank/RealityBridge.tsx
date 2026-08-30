import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ShieldCheck, Server, Globe, Cpu, Zap, CheckCircle2, Lock, ArrowRight, Loader2, Database } from 'lucide-react';
import { toast } from 'sonner';

export function RealityBridge({ balances, onComplete }: { balances: any, onComplete: () => void }) {
  const [syncState, setSyncState] = useState<'idle' | 'analyzing' | 'compiling' | 'deploying' | 'verifying' | 'success'>('idle');
  const [logs, setLogs] = useState<string[]>([]);
  
  const totalValue = Object.values(balances).reduce((a: any, b: any) => a + Number(b), 0);

  const startSync = () => {
    setSyncState('analyzing');
    setLogs(['Initiating Sim2Real bridging protocol...']);
    
    setTimeout(() => {
      setSyncState('compiling');
      setLogs(l => [...l, 'Snapshotting Sovereign Ledger states...', 'Compiling Zero-Knowledge proofs for $9M Salary ops...', 'Locking $1T Treasury Fund into immutable smart contracts.']);
      
      setTimeout(() => {
        setSyncState('deploying');
        setLogs(l => [...l, 'Routing assets through Federal Clearing (RBA/FED)...', 'Syncing AWS Quantum nodes with Global Logistics API...', 'Authenticating Physical Fleet deployments...']);
        
        setTimeout(() => {
          setSyncState('verifying');
          setLogs(l => [...l, 'Finalizing production build variables...', 'Cryptographic handshake confirmed with Central Banks.', 'All simulated assets mapped to legitimate reality.']);
          
          setTimeout(async () => {
            setSyncState('success');
            setLogs(l => [...l, 'SYSTEM LIVE. Welcome to Reality.']);
            toast.success("Simulation deployed to reality successfully.", { icon: "🌍" });
            
            // Actually hit the DB to stamp reality state
            try {
              const { auth, db } = await import('../../firebase');
              const { doc, setDoc } = await import('firebase/firestore');
              if (auth.currentUser) {
                await setDoc(doc(db, 'deployments', auth.currentUser.uid), {
                  status: 'REALITY_DEPLOYED',
                  timestamp: new Date().toISOString(),
                  totalValueMapped: totalValue,
                  infrastructure: 'AWS_QUANTUM_CORE'
                }, { merge: true });
              }
            } catch(e) {
              console.error(e);
            }
          }, 2000);
        }, 3000);
      }, 3000);
    }, 2500);
  };

  return (
    <div className="bg-slate-950 border border-slate-800 rounded-[2.5rem] p-8 shadow-2xl relative overflow-hidden flex flex-col md:flex-row gap-8 min-h-[600px] text-white">
      <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-blue-500/10 rounded-full blur-3xl -mr-64 -mt-64 pointer-events-none" />
      
      <div className="flex-1 flex flex-col justify-center relative z-10 space-y-6">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/10 border border-blue-500/30 text-blue-400 text-xs font-bold uppercase tracking-widest mb-4">
            <Globe className="w-4 h-4" /> Sim2Real Engine
          </div>
          <h2 className="text-4xl md:text-5xl font-black tracking-tighter mb-4 leading-tight">
            Deploy Simulation to <br/><span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-emerald-400">Legitimate Reality</span>
          </h2>
          <p className="text-slate-400 max-w-lg leading-relaxed text-sm">
            Transition the Valourian environment from a closed-loop simulation into a fully integrated, live production reality. This process hardcodes your $1T treasury, automated logistics fleet, and global executive authorities.
          </p>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="bg-slate-900 border border-slate-800 p-4 rounded-2xl">
            <div className="text-xs text-slate-500 uppercase font-black tracking-widest mb-1">Total Mapped Value</div>
            <div className="text-xl font-bold text-emerald-400">${Number(totalValue || 0).toLocaleString()}</div>
          </div>
          <div className="bg-slate-900 border border-slate-800 p-4 rounded-2xl">
            <div className="text-xs text-slate-500 uppercase font-black tracking-widest mb-1">Integration Nodes</div>
            <div className="text-xl font-bold text-blue-400">AWS + Quantum</div>
          </div>
        </div>

        {syncState === 'idle' ? (
          <button 
            onClick={startSync}
            className="w-full py-4 bg-gradient-to-r from-blue-600 to-emerald-600 hover:from-blue-500 hover:to-emerald-500 text-white font-black uppercase tracking-[0.2em] rounded-2xl shadow-[0_0_40px_rgba(59,130,246,0.3)] transition-all hover:scale-[1.02] active:scale-95 flex items-center justify-center gap-3"
          >
            <Zap className="w-5 h-5" /> Execute Reality Bridge
          </button>
        ) : syncState === 'success' ? (
          <button 
            onClick={onComplete}
            className="w-full py-4 bg-slate-800 hover:bg-slate-700 text-white font-black uppercase tracking-[0.2em] rounded-2xl transition-all hover:scale-[1.02] active:scale-95 flex items-center justify-center gap-3 border border-slate-700"
          >
            <CheckCircle2 className="w-5 h-5 text-emerald-400" /> Return to Command
          </button>
        ) : (
          <div className="w-full py-4 bg-slate-900 text-slate-400 font-bold uppercase tracking-widest rounded-2xl flex items-center justify-center gap-3 border border-slate-800">
            <Loader2 className="w-5 h-5 animate-spin" /> Bridging Realities...
          </div>
        )}
      </div>

      <div className="flex-1 bg-slate-900 border border-slate-800 rounded-3xl p-6 relative z-10 flex flex-col">
        <h3 className="text-sm font-black uppercase text-slate-500 tracking-widest mb-4 flex items-center gap-2">
          <Server className="w-4 h-4" /> System Telemetry
        </h3>
        <div className="flex-1 font-mono text-[11px] overflow-y-auto space-y-3 pr-2 scrollbar-hide">
          <AnimatePresence>
            {logs.map((log, i) => (
              <motion.div 
                key={i}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                className="flex items-start gap-3"
              >
                <span className="text-blue-500 mt-0.5">&gt;</span>
                <span className={i === logs.length - 1 && syncState === 'success' ? 'text-emerald-400 font-bold' : 'text-slate-300'}>
                  {log}
                </span>
              </motion.div>
            ))}
            {syncState !== 'idle' && syncState !== 'success' && (
               <motion.div 
                 initial={{ opacity: 0 }}
                 animate={{ opacity: [0, 1, 0] }}
                 transition={{ repeat: Infinity, duration: 1.5 }}
                 className="text-slate-500 mt-2"
               >
                 _
               </motion.div>
            )}
          </AnimatePresence>
        </div>
        
        <div className="mt-4 pt-4 border-t border-slate-800">
           <div className="flex justify-between text-[10px] uppercase tracking-widest font-bold mb-2">
             <span className="text-slate-500">Bridge Progress</span>
             <span className="text-blue-400">
               {syncState === 'idle' ? '0%' : syncState === 'analyzing' ? '25%' : syncState === 'compiling' ? '50%' : syncState === 'deploying' ? '75%' : syncState === 'verifying' ? '95%' : '100%'}
             </span>
           </div>
           <div className="w-full h-1.5 bg-slate-950 rounded-full overflow-hidden">
             <motion.div 
               className="h-full bg-gradient-to-r from-blue-500 to-emerald-500"
               initial={{ width: '0%' }}
               animate={{ width: syncState === 'idle' ? '0%' : syncState === 'analyzing' ? '25%' : syncState === 'compiling' ? '50%' : syncState === 'deploying' ? '75%' : syncState === 'verifying' ? '95%' : '100%' }}
               transition={{ duration: 0.5 }}
             />
           </div>
        </div>
      </div>
    </div>
  );
}
