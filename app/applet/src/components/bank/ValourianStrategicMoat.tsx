import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Shield, BrainCircuit, Network, Globe2, LockKeyhole, Loader2, CheckCircle2, Zap, ArrowRightLeft, ShieldCheck, Cpu } from 'lucide-react';
import { toast } from 'sonner';

function QuantumLedgerWidget() {
  const [state, setState] = useState<'idle'|'migrating'|'secured'>('idle');
  
  const handleMigrate = () => {
    setState('migrating');
    toast.info("Initiating Post-Quantum Cryptographic Migration...");
    setTimeout(() => {
      setState('secured');
      toast.success("Ledger secured against Shor's algorithm. Quantum-resistance achieved.");
    }, 3000);
  };

  return (
    <div className="bg-indigo-950/50 rounded-[2rem] p-8 border border-indigo-500/30 relative overflow-hidden group">
      <div className="absolute top-0 right-0 w-48 h-48 bg-indigo-500/10 blur-[60px] rounded-full group-hover:bg-indigo-500/20 transition-colors pointer-events-none" />
      <div className="relative z-10">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-indigo-900/50 rounded-xl border border-indigo-400/20">
              <LockKeyhole className="w-6 h-6 text-indigo-400" />
            </div>
            <div>
              <h4 className="text-lg font-black text-white italic tracking-tighter uppercase">Quantum-Resistant Sync</h4>
              <p className="text-[10px] text-indigo-300/80 font-bold uppercase tracking-widest">Post-Quantum Cryptography</p>
            </div>
          </div>
        </div>
        <p className="text-sm text-slate-400 mb-6 font-medium">Secures all global transactions and smart contracts against future quantum computing attacks, ensuring Valourian's ledger remains impenetrable.</p>
        
        <button 
          disabled={state !== 'idle'}
          onClick={handleMigrate}
          className={`w-full py-3 rounded-xl font-black uppercase tracking-widest text-xs transition-all flex items-center justify-center gap-2 ${state === 'secured' ? 'bg-indigo-500/20 text-indigo-400 border border-indigo-500' : 'bg-indigo-600 hover:bg-indigo-500 text-white shadow-[0_0_20px_rgba(99,102,241,0.3)]'}`}
        >
          {state === 'idle' && <><Shield className="w-4 h-4" /> Deploy QRLS Matrix</>}
          {state === 'migrating' && <><Loader2 className="w-4 h-4 animate-spin" /> Migrating Ledger...</>}
          {state === 'secured' && <><CheckCircle2 className="w-4 h-4" /> Quantum Shield Active</>}
        </button>
      </div>
    </div>
  );
}

function TreasuryDirectAIWidget() {
  const [state, setState] = useState<'idle'|'analyzing'|'executed'>('idle');
  
  const handleExecute = () => {
    setState('analyzing');
    toast.info("Sovereign AI deploying direct market operations...");
    setTimeout(() => {
      setState('executed');
      toast.success("DMO successful. +$12.4M AUD yield captured across ASX/NYSE in 400ms.");
    }, 3500);
  };

  return (
    <div className="bg-rose-950/50 rounded-[2rem] p-8 border border-rose-500/30 relative overflow-hidden group">
      <div className="absolute top-0 right-0 w-48 h-48 bg-rose-500/10 blur-[60px] rounded-full group-hover:bg-rose-500/20 transition-colors pointer-events-none" />
      <div className="relative z-10">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-rose-900/50 rounded-xl border border-rose-400/20">
              <BrainCircuit className="w-6 h-6 text-rose-400" />
            </div>
            <div>
              <h4 className="text-lg font-black text-white italic tracking-tighter uppercase">Sovereign AI Market Ops</h4>
              <p className="text-[10px] text-rose-300/80 font-bold uppercase tracking-widest">Direct Market Execution</p>
            </div>
          </div>
        </div>
        <p className="text-sm text-slate-400 mb-6 font-medium">Autonomous neural agent that executes Direct Market Operations (DMOs) to purchase bonds and liquidate assets based on predictive heuristic modeling.</p>
        
        <button 
          disabled={state !== 'idle'}
          onClick={handleExecute}
          className={`w-full py-3 rounded-xl font-black uppercase tracking-widest text-xs transition-all flex items-center justify-center gap-2 ${state === 'executed' ? 'bg-rose-500/20 text-rose-400 border border-rose-500' : 'bg-rose-600 hover:bg-rose-500 text-white shadow-[0_0_20px_rgba(244,63,94,0.3)]'}`}
        >
          {state === 'idle' && <><Zap className="w-4 h-4" /> Trigger Autonomous DMO</>}
          {state === 'analyzing' && <><Loader2 className="w-4 h-4 animate-spin" /> Scanning Global Order Books...</>}
          {state === 'executed' && <><CheckCircle2 className="w-4 h-4" /> Alpha Captured (+$12.4M)</>}
        </button>
      </div>
    </div>
  );
}

function NeuralComplianceWidget() {
  const [state, setState] = useState<'idle'|'scanning'|'verified'>('idle');
  
  const handleVerify = () => {
    setState('scanning');
    toast.info("Omni-node neural net cross-referencing global sanction lists...");
    setTimeout(() => {
      setState('verified');
      toast.success("Zero-latency VIP AML/KYC clearance verified. 0 false positives.");
    }, 2500);
  };

  return (
    <div className="bg-emerald-950/50 rounded-[2rem] p-8 border border-emerald-500/30 relative overflow-hidden group">
      <div className="absolute top-0 right-0 w-48 h-48 bg-emerald-500/10 blur-[60px] rounded-full group-hover:bg-emerald-500/20 transition-colors pointer-events-none" />
      <div className="relative z-10">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-emerald-900/50 rounded-xl border border-emerald-400/20">
              <ShieldCheck className="w-6 h-6 text-emerald-400" />
            </div>
            <div>
              <h4 className="text-lg font-black text-white italic tracking-tighter uppercase">Omni-Node AML/KYC</h4>
              <p className="text-[10px] text-emerald-300/80 font-bold uppercase tracking-widest">Neural Compliance Matrix</p>
            </div>
          </div>
        </div>
        <p className="text-sm text-slate-400 mb-6 font-medium">Instantly clears multi-million dollar cross-border transfers by heuristically validating counterparty identities, eliminating manual compliance bottlenecks.</p>
        
        <button 
          disabled={state !== 'idle'}
          onClick={handleVerify}
          className={`w-full py-3 rounded-xl font-black uppercase tracking-widest text-xs transition-all flex items-center justify-center gap-2 ${state === 'verified' ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500' : 'bg-emerald-600 hover:bg-emerald-500 text-white shadow-[0_0_20px_rgba(16,185,129,0.3)]'}`}
        >
          {state === 'idle' && <><Network className="w-4 h-4" /> Run VIP Clearance Matrix</>}
          {state === 'scanning' && <><Loader2 className="w-4 h-4 animate-spin" /> Cross-Referencing Nodes...</>}
          {state === 'verified' && <><CheckCircle2 className="w-4 h-4" /> Compliance Bypassed (100% Legal)</>}
        </button>
      </div>
    </div>
  );
}

function CBDCBridgeWidget() {
  const [state, setState] = useState<'idle'|'routing'|'bridged'>('idle');
  
  const handleRoute = () => {
    setState('routing');
    toast.info("Establishing direct Central Bank Digital Currency (CBDC) channels...");
    setTimeout(() => {
      setState('bridged');
      toast.success("e-AUD to e-USD bridge active. Zero FX slippage guaranteed on all capital flows.");
    }, 3000);
  };

  return (
    <div className="bg-cyan-950/50 rounded-[2rem] p-8 border border-cyan-500/30 relative overflow-hidden group">
      <div className="absolute top-0 right-0 w-48 h-48 bg-cyan-500/10 blur-[60px] rounded-full group-hover:bg-cyan-500/20 transition-colors pointer-events-none" />
      <div className="relative z-10">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-cyan-900/50 rounded-xl border border-cyan-400/20">
              <Globe2 className="w-6 h-6 text-cyan-400" />
            </div>
            <div>
              <h4 className="text-lg font-black text-white italic tracking-tighter uppercase">Multi-CBDC Liquidity</h4>
              <p className="text-[10px] text-cyan-300/80 font-bold uppercase tracking-widest">Central Bank Bridges</p>
            </div>
          </div>
        </div>
        <p className="text-sm text-slate-400 mb-6 font-medium">Direct routing through digital sovereign currencies (e-USD, e-AUD, Digital Euro) bypassing traditional SWIFT nostros to eliminate all FX slippage.</p>
        
        <button 
          disabled={state !== 'idle'}
          onClick={handleRoute}
          className={`w-full py-3 rounded-xl font-black uppercase tracking-widest text-xs transition-all flex items-center justify-center gap-2 ${state === 'bridged' ? 'bg-cyan-500/20 text-cyan-400 border border-cyan-500' : 'bg-cyan-600 hover:bg-cyan-500 text-white shadow-[0_0_20px_rgba(6,182,212,0.3)]'}`}
        >
          {state === 'idle' && <><ArrowRightLeft className="w-4 h-4" /> Establish CBDC Bridges</>}
          {state === 'routing' && <><Loader2 className="w-4 h-4 animate-spin" /> Negotiating Corridors...</>}
          {state === 'bridged' && <><CheckCircle2 className="w-4 h-4" /> Zero-Slippage Routing Active</>}
        </button>
      </div>
    </div>
  );
}

export function ValourianStrategicMoat() {
  return (
    <div className="mt-12 space-y-6">
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 bg-slate-900 rounded-[2.5rem] p-8 border border-slate-800 shadow-2xl relative overflow-hidden">
        <div className="absolute top-0 left-0 w-[500px] h-[500px] bg-blue-500/10 blur-[120px] rounded-full -ml-32 -mt-32 pointer-events-none" />
        <div className="relative z-10 flex items-center gap-5">
          <div className="p-4 bg-slate-800 rounded-2xl border border-slate-700">
            <Cpu className="w-8 h-8 text-blue-400" />
          </div>
          <div>
            <h3 className="text-2xl font-black uppercase italic tracking-tighter text-white">
              Valourian Strategic Moat
            </h3>
            <p className="text-slate-400 text-xs font-black uppercase tracking-[0.2em] mt-1">
              Absolute Global FinTech Dominance
            </p>
          </div>
        </div>
        <div className="relative z-10">
          <div className="px-4 py-2 bg-blue-500/20 border border-blue-500/30 text-blue-400 text-xs font-black uppercase tracking-widest rounded-xl flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-blue-400 animate-ping" />
            Core Systems Active
          </div>
        </div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <QuantumLedgerWidget />
        <TreasuryDirectAIWidget />
        <NeuralComplianceWidget />
        <CBDCBridgeWidget />
      </div>
    </div>
  );
}
