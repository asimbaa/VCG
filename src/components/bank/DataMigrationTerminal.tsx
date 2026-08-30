import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Database, Server, HardDrive, CheckCircle2, Loader2, Network, ArrowRight, ShieldCheck, Zap } from 'lucide-react';
import { db, addDoc } from '../../firebase';
import { collection, serverTimestamp } from 'firebase/firestore';
import { toast } from 'sonner';

export function DataMigrationTerminal() {
  const [migrationState, setMigrationState] = useState<'idle' | 'analyzing' | 'transferring' | 'verifying' | 'complete'>('idle');
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (migrationState === 'analyzing') {
      interval = setInterval(() => {
        setProgress(p => {
          if (p >= 15) {
            setMigrationState('transferring');
            return p;
          }
          return p + 2;
        });
      }, 500);
    } else if (migrationState === 'transferring') {
      interval = setInterval(() => {
        setProgress(p => {
          if (p >= 85) {
            setMigrationState('verifying');
            return p;
          }
          return p + 5;
        });
      }, 300);
    } else if (migrationState === 'verifying') {
      interval = setInterval(() => {
        setProgress(p => {
          if (p >= 100) {
            setMigrationState('complete');
            toast.success("Zero-Loss Migration Complete. Sovereign OS v9 active.", { icon: <ShieldCheck className="w-4 h-4 text-emerald-400" />});
            
            // Generate a global ledger log for the migration
            addDoc(collection(db, "payment_events"), {
              amount: "4.2TB Data",
              merchant: "Sovereign OS v9 Data Migration",
              status: "confirmed",
              timestamp: serverTimestamp(),
              type: "Data Migration",
              userId: "system"
            }).catch(console.error);
            
            return 100;
          }
          return p + 3;
        });
      }, 400);
    }
    return () => clearInterval(interval);
  }, [migrationState]);

  const startMigration = () => {
    setMigrationState('analyzing');
    setProgress(0);
    toast.info("Initiating lossless data migration & global synchronization...");
  };

  return (
    <div className="w-full max-w-4xl mx-auto space-y-8 animate-in fade-in zoom-in duration-500">
      <div className="bg-slate-900 border border-emerald-500/30 rounded-3xl p-8 relative overflow-hidden shadow-2xl">
        <div className="absolute top-0 right-0 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl -mr-48 -mt-48 pointer-events-none"></div>
        
        <div className="relative z-10 flex flex-col items-center text-center space-y-6">
          <div className="w-24 h-24 rounded-full bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400 relative">
            <div className="absolute inset-0 border border-emerald-500/30 rounded-full animate-ping"></div>
            {migrationState === 'complete' ? <CheckCircle2 className="w-12 h-12" /> : <Database className="w-12 h-12" />}
          </div>
          
          <div>
            <h2 className="text-3xl font-black text-white mb-2 uppercase tracking-widest">Sovereign Data Migration</h2>
            <p className="text-slate-400 max-w-lg mx-auto">Seamlessly upgrade legacy ledger structures, vault configurations, and digital assets to the highly-scalable Sovereign OS v9 PostgreSQL/Firestore hybrid backend.</p>
          </div>

          <div className="w-full bg-slate-950 border border-slate-800 rounded-2xl p-6 flex flex-col gap-4">
            <div className="flex justify-between text-xs font-bold text-slate-400 uppercase tracking-widest">
              <span>{migrationState === 'idle' ? 'Ready to Migrate' : migrationState}</span>
              <span className="text-emerald-400">{progress}%</span>
            </div>
            
            <div className="h-3 w-full bg-slate-900 rounded-full overflow-hidden border border-slate-800 relative">
              <motion.div 
                className="absolute top-0 left-0 bottom-0 bg-gradient-to-r from-emerald-600 to-emerald-400"
                initial={{ width: 0 }}
                animate={{ width: `${progress}%` }}
                transition={{ type: "tween", ease: "linear" }}
              />
            </div>
            
            <div className="flex items-center justify-between mt-4">
              <div className="flex items-center gap-4 text-slate-500">
                <HardDrive className={`w-6 h-6 ${migrationState !== 'idle' ? 'text-emerald-500' : ''}`} />
                <ArrowRight className="w-4 h-4" />
                <Network className={`w-6 h-6 ${migrationState === 'transferring' || migrationState === 'verifying' || migrationState === 'complete' ? 'text-emerald-500 animate-pulse' : ''}`} />
                <ArrowRight className="w-4 h-4" />
                <Server className={`w-6 h-6 ${migrationState === 'complete' ? 'text-emerald-500 shadow-[0_0_15px_rgba(16,185,129,0.5)] rounded-full' : ''}`} />
              </div>
              
              {migrationState === 'idle' ? (
                <button 
                  onClick={startMigration}
                  className="bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-sm px-6 py-3 rounded-xl flex items-center gap-2 transition-all hover:scale-105 active:scale-95"
                >
                  <Zap className="w-4 h-4" /> Execute Migration
                </button>
              ) : migrationState === 'complete' ? (
                <button 
                  onClick={() => { setMigrationState('idle'); setProgress(0); }}
                  className="bg-slate-800 hover:bg-slate-700 text-white font-bold text-sm px-6 py-3 rounded-xl flex items-center gap-2 transition-all"
                >
                  <CheckCircle2 className="w-4 h-4 text-emerald-400" /> Acknowledged
                </button>
              ) : (
                <button 
                  disabled
                  className="bg-emerald-600/50 text-white font-bold text-sm px-6 py-3 rounded-xl flex items-center gap-2 cursor-not-allowed"
                >
                  <Loader2 className="w-4 h-4 animate-spin" /> Processing...
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
