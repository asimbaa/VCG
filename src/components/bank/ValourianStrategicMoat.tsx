import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Shield, BrainCircuit, Network, Globe2, LockKeyhole, Loader2, CheckCircle2, Zap, ArrowRightLeft, ShieldCheck, Cpu, Activity, Database, Download, Layers, ScanFace, FileJson, X } from 'lucide-react';
import { toast } from 'sonner';


function ISO20022DashboardWidget() {
  const [messages, setMessages] = useState([
    { id: 'msg-01', from: 'AU', to: 'US', amount: '12.4M', curr: 'AUD', status: 'SETTLED', auth: 'BIOMETRIC_PASS' },
    { id: 'msg-02', from: 'UK', to: 'AU', amount: '8.1M', curr: 'GBP', status: 'SETTLED', auth: 'BIOMETRIC_PASS' },
    { id: 'msg-03', from: 'SG', to: 'JP', amount: '105M', curr: 'JPY', status: 'PENDING', auth: 'AWAITING_AUTH' },
  ]);
  const [authModal, setAuthModal] = useState<string | null>(null);
  const [authStage, setAuthStage] = useState<'scan' | 'verifying' | 'success'>('scan');

  const startAuth = (id: string) => {
    setAuthModal(id);
    setAuthStage('scan');
  };

  const handleVerify = () => {
    setAuthStage('verifying');
    toast.info("Analyzing retinal and facial biometric markers...");
    setTimeout(() => {
      setAuthStage('success');
      toast.success("Biometric verification passed. Multi-million transfer cleared.");
      setTimeout(() => {
        setMessages(messages.map(m => m.id === authModal ? { ...m, status: 'SETTLED', auth: 'BIOMETRIC_PASS' } : m));
        setAuthModal(null);
      }, 1500);
    }, 2500);
  };

  return (
    <>
      <div className="bg-slate-900/50 rounded-[2rem] p-8 border border-slate-700/50 relative overflow-hidden group">
        <div className="absolute top-0 right-0 w-48 h-48 bg-slate-500/10 blur-[60px] rounded-full group-hover:bg-slate-500/20 transition-colors pointer-events-none" />
        <div className="relative z-10">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-slate-800/50 rounded-xl border border-slate-600/30">
                <Globe2 className="w-6 h-6 text-slate-300" />
              </div>
              <div>
                <h4 className="text-lg font-black text-white italic tracking-tighter uppercase">ISO-20022 Dashboard</h4>
                <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">Cross-Border Settlement</p>
              </div>
            </div>
          </div>
          
          <div className="space-y-3">
            {messages.map((msg) => (
              <div key={msg.id} className="bg-slate-950 p-4 rounded-xl border border-slate-800 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div className="flex flex-col gap-1">
                  <span className="text-white font-black text-sm uppercase tracking-wider">{msg.from} <ArrowRightLeft className="w-3 h-3 inline mx-1" /> {msg.to}</span>
                  <span className="text-slate-500 font-mono text-xs">{msg.id}</span>
                </div>
                <div className="flex items-center gap-4 w-full sm:w-auto justify-between sm:justify-end">
                  <div className="flex flex-col items-end gap-1">
                    <span className="text-emerald-400 font-black text-sm">{msg.amount} {msg.curr}</span>
                    <span className={`text-[9px] font-black uppercase tracking-widest px-2 py-0.5 rounded-full ${msg.status === 'SETTLED' ? 'bg-emerald-500/20 text-emerald-400' : 'bg-amber-500/20 text-amber-400'}`}>
                      {msg.auth}
                    </span>
                  </div>
                  {msg.status === 'PENDING' && (
                    <button onClick={() => startAuth(msg.id)} className="p-2 bg-amber-600 hover:bg-amber-500 text-white rounded-lg transition-colors">
                      <ScanFace className="w-4 h-4" />
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <AnimatePresence>
        {authModal && (
          <motion.div 
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md"
          >
            <motion.div 
              initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }}
              className="bg-slate-900 border border-slate-700 rounded-3xl p-8 max-w-md w-full relative overflow-hidden"
            >
              <div className="absolute -top-32 -right-32 w-64 h-64 bg-cyan-500/20 blur-[100px] rounded-full pointer-events-none" />
              
              <div className="flex items-center justify-between mb-8 relative z-10">
                <div>
                  <h3 className="text-xl font-black text-white uppercase tracking-wider">Biometric Verify</h3>
                  <p className="text-cyan-400 font-mono text-xs mt-1">Tx: {authModal}</p>
                </div>
                <button onClick={() => setAuthModal(null)} className="p-2 bg-slate-800 text-slate-400 hover:text-white rounded-full">
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="flex flex-col items-center justify-center py-8 relative z-10">
                <div className="relative">
                  <motion.div 
                    animate={{ rotate: 360 }}
                    transition={{ duration: 10, repeat: Infinity, ease: "linear" }}
                    className="absolute inset-0 border-2 border-dashed border-cyan-500/30 rounded-full"
                  />
                  <div className={`p-8 rounded-full border-4 ${authStage === 'success' ? 'border-emerald-500 bg-emerald-500/10' : authStage === 'verifying' ? 'border-cyan-500 bg-cyan-500/10' : 'border-slate-700 bg-slate-800'}`}>
                    {authStage === 'success' ? (
                      <CheckCircle2 className="w-16 h-16 text-emerald-400" />
                    ) : (
                      <ScanFace className={`w-16 h-16 ${authStage === 'verifying' ? 'text-cyan-400 animate-pulse' : 'text-slate-400'}`} />
                    )}
                  </div>
                  {authStage === 'verifying' && (
                    <motion.div 
                      initial={{ top: 0 }} animate={{ top: '100%' }} transition={{ duration: 1.5, repeat: Infinity, repeatType: 'reverse' }}
                      className="absolute left-0 right-0 h-1 bg-cyan-400/80 shadow-[0_0_10px_rgba(34,211,238,0.8)]"
                    />
                  )}
                </div>
                
                <h4 className="mt-8 text-lg font-black text-white uppercase tracking-widest text-center">
                  {authStage === 'scan' && 'Awaiting Scan'}
                  {authStage === 'verifying' && 'Verifying Retinal & Facial Match'}
                  {authStage === 'success' && 'Identity Confirmed'}
                </h4>
                <p className="text-slate-500 text-xs text-center mt-2 max-w-xs font-mono">
                  {authStage === 'scan' && 'Please align face within the scanning reticle to authorize transfer.'}
                  {authStage === 'verifying' && 'Checking biometric hash against Valourian Identity Oracle...'}
                  {authStage === 'success' && 'Biometric signature attached to ISO-20022 message payload.'}
                </p>
              </div>

              {authStage === 'scan' && (
                <button onClick={handleVerify} className="w-full mt-4 py-4 bg-cyan-600 hover:bg-cyan-500 text-white rounded-xl font-black uppercase tracking-widest text-sm shadow-[0_0_20px_rgba(6,182,212,0.4)] relative z-10 transition-all">
                  Initiate Scan
                </button>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}




function BlackCardTokenizationWidget() {
  const [state, setState] = useState<'idle'|'tokenizing'|'secured'>('idle');
  
  const handleTokenize = () => {
    setState('tokenizing');
    toast.info("Generating zero-knowledge token for physical hardware...");
    setTimeout(() => {
      setState('secured');
      toast.success("Tap & Pay tokenized. Hardware wallet synced seamlessly.");
    }, 2800);
  };

  return (
    <div className="bg-fuchsia-950/50 rounded-[2rem] p-8 border border-fuchsia-500/30 relative overflow-hidden group">
      <div className="absolute top-0 right-0 w-48 h-48 bg-fuchsia-500/10 blur-[60px] rounded-full group-hover:bg-fuchsia-500/20 transition-colors pointer-events-none" />
      <div className="relative z-10">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-fuchsia-900/50 rounded-xl border border-fuchsia-400/20">
              <Shield className="w-6 h-6 text-fuchsia-400" />
            </div>
            <div>
              <h4 className="text-lg font-black text-white italic tracking-tighter uppercase">Hardware Tokenization</h4>
              <p className="text-[10px] text-fuchsia-300/80 font-bold uppercase tracking-widest">Card Tap & Pay</p>
            </div>
          </div>
        </div>
        <p className="text-sm text-slate-400 mb-6 font-medium">Instantly tokenizes the Valourian Black Card for mathematically secure, offline-first NFC payments across the US and Australia.</p>
        
        <button 
          disabled={state !== 'idle'}
          onClick={handleTokenize}
          className={`w-full py-3 rounded-xl font-black uppercase tracking-widest text-xs transition-all flex items-center justify-center gap-2 ${state === 'secured' ? 'bg-fuchsia-500/20 text-fuchsia-400 border border-fuchsia-500' : 'bg-fuchsia-600 hover:bg-fuchsia-500 text-white shadow-[0_0_20px_rgba(192,38,211,0.3)]'}`}
        >
          {state === 'idle' && <><Cpu className="w-4 h-4" /> Issue Hardware Token</>}
          {state === 'tokenizing' && <><Loader2 className="w-4 h-4 animate-spin" /> Verifying Secure Element...</>}
          {state === 'secured' && <><CheckCircle2 className="w-4 h-4" /> Tap & Pay Armed</>}
        </button>
      </div>
    </div>
  );
}

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


function SovereignReserveArbitrageWidget() {
  const [isSyncing, setIsSyncing] = useState(false);
  const [yieldData, setYieldData] = useState([
    { asset: 'US Treasuries (10Y)', rate: '4.21%', trend: 'up', spread: '+12bps', balance: '12.4B' },
    { asset: 'ECB Gilts (5Y)', rate: '3.94%', trend: 'down', spread: '-4bps', balance: '8.1B' },
    { asset: 'RBA Bonds (10Y)', rate: '4.35%', trend: 'up', spread: '+18bps', balance: '14.2B' },
  ]);

  const handleResync = () => {
    setIsSyncing(true);
    toast.info("AI rebalancing sovereign reserve assets...", { icon: '🤖' });
    
    // Simulate AI rebalancing animation
    const interval = setInterval(() => {
      setYieldData(prev => prev.map(d => ({
        ...d,
        rate: (parseFloat(d.rate) + (Math.random() * 0.1 - 0.05)).toFixed(2) + '%'
      })));
    }, 200);

    setTimeout(() => {
      clearInterval(interval);
      setIsSyncing(false);
      setYieldData([
        { asset: 'US Treasuries (10Y)', rate: '4.26%', trend: 'up', spread: '+17bps', balance: '11.1B' },
        { asset: 'ECB Gilts (5Y)', rate: '3.90%', trend: 'down', spread: '-8bps', balance: '7.5B' },
        { asset: 'RBA Bonds (10Y)', rate: '4.41%', trend: 'up', spread: '+24bps', balance: '16.1B' },
      ]);
      toast.success("Sovereign asset reallocation complete. Alpha captured.");
    }, 2500);
  };

  return (
    <div className="bg-emerald-950/30 rounded-[2rem] p-8 border border-emerald-500/30 relative overflow-hidden group">
      <div className="absolute top-0 right-0 w-48 h-48 bg-emerald-500/10 blur-[60px] rounded-full group-hover:bg-emerald-500/20 transition-colors pointer-events-none" />
      <div className="relative z-10">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-emerald-900/50 rounded-xl border border-emerald-400/20">
              <Activity className="w-6 h-6 text-emerald-400" />
            </div>
            <div>
              <h4 className="text-lg font-black text-white italic tracking-tighter uppercase">Reserve Arbitrage</h4>
              <p className="text-[10px] text-emerald-300/80 font-bold uppercase tracking-widest">Sovereign Asset Rebalancing</p>
            </div>
          </div>
          <button onClick={handleResync} disabled={isSyncing} className="p-2 bg-emerald-900/30 text-emerald-400 hover:bg-emerald-900/60 rounded-xl transition-colors disabled:opacity-50">
            <Loader2 className={`w-4 h-4 ${isSyncing ? 'animate-spin' : ''}`} />
          </button>
        </div>
        
        <div className="space-y-3 mb-6 relative">
          {yieldData.map((data, idx) => (
            <div key={idx} className="flex flex-col gap-2 bg-emerald-950/50 p-3 rounded-xl border border-emerald-900/50 relative overflow-hidden">
               {isSyncing && (
                 <motion.div 
                   initial={{ left: '-100%' }} animate={{ left: '200%' }} 
                   transition={{ duration: 1.5, repeat: Infinity, ease: 'linear' }}
                   className="absolute top-0 bottom-0 w-1/2 bg-gradient-to-r from-transparent via-emerald-500/10 to-transparent skew-x-[-20deg]"
                 />
               )}
              <div className="flex items-center justify-between relative z-10">
                <span className="text-slate-300 font-bold text-xs uppercase tracking-widest">{data.asset}</span>
                <span className="text-slate-400 font-mono text-[10px]">{data.balance}</span>
              </div>
              <div className="flex items-center justify-between relative z-10">
                <span className={`text-[10px] font-black uppercase ${data.trend === 'up' ? 'text-emerald-400' : 'text-rose-400'}`}>
                  {data.spread}
                </span>
                <span className={`font-black text-sm transition-colors duration-300 ${isSyncing ? 'text-emerald-300' : 'text-white'}`}>{data.rate}</span>
              </div>
            </div>
          ))}
        </div>
        
        <div className="w-full py-3 rounded-xl font-black uppercase tracking-widest text-xs flex items-center justify-center gap-2 bg-emerald-900/20 text-emerald-400 border border-emerald-500/30">
          {isSyncing ? <Loader2 className="w-4 h-4 animate-spin" /> : <CheckCircle2 className="w-4 h-4" />} AI Arbitrage Active
        </div>
      </div>
    </div>
  );
}

function TorrensMatrixWidget() {
  const [syncStatus, setSyncStatus] = useState<'synced' | 'syncing'>('synced');
  
  const handleBatchExport = () => {
    setSyncStatus('syncing');
    toast.info("Generating encrypted batch export of pending proofs...", { icon: '🔒' });
    
    setTimeout(() => {
      // Create a mock encrypted JSON blob and trigger download
      const offlineBatch = {
        matrix_id: "TRNS-99X-MATRIX",
        timestamp: new Date().toISOString(),
        pending_proofs: [
          { tx_hash: "0x892a...f11b", auth_level: "BIOMETRIC", status: "PENDING_SYNC" },
          { tx_hash: "0x112b...c339", auth_level: "SMART_ESCROW", status: "PENDING_SYNC" }
        ],
        crypto_signature: "e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855"
      };
      
      const blob = new Blob([JSON.stringify(offlineBatch, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `torrens_batch_export_${Date.now()}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      
      setSyncStatus('synced');
      toast.success("Batch JSON exported securely for offline transmission.");
    }, 2000);
  };

  return (
    <div className="bg-amber-950/30 rounded-[2rem] p-8 border border-amber-500/30 relative overflow-hidden group">
      <div className="absolute top-0 right-0 w-48 h-48 bg-amber-500/10 blur-[60px] rounded-full group-hover:bg-amber-500/20 transition-colors pointer-events-none" />
      <div className="relative z-10">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-amber-900/50 rounded-xl border border-amber-400/20">
              <Database className="w-6 h-6 text-amber-400" />
            </div>
            <div>
              <h4 className="text-lg font-black text-white italic tracking-tighter uppercase">Torrens Sync Matrix</h4>
              <p className="text-[10px] text-amber-300/80 font-bold uppercase tracking-widest">Offline Cryptography</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <div className={`w-2 h-2 rounded-full ${syncStatus === 'synced' ? 'bg-emerald-400' : 'bg-amber-400 animate-pulse'}`} />
            <span className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">
              {syncStatus === 'synced' ? 'Fully Synced' : 'Syncing...'}
            </span>
          </div>
        </div>
        
        <p className="text-sm text-slate-400 mb-6 font-medium">Maintains the synchronization state of the offline Torrens cryptographic signing matrix for ultra-secure disconnected authorization.</p>
        
        <button 
          onClick={handleBatchExport}
          disabled={syncStatus === 'syncing'}
          className={`w-full py-3 rounded-xl font-black uppercase tracking-widest text-xs transition-all flex items-center justify-center gap-2 ${syncStatus === 'syncing' ? 'bg-amber-900/50 text-amber-600 cursor-not-allowed' : 'bg-amber-600 hover:bg-amber-500 text-white shadow-[0_0_20px_rgba(217,119,6,0.3)]'}`}
        >
          {syncStatus === 'syncing' ? <Loader2 className="w-4 h-4 animate-spin" /> : <FileJson className="w-4 h-4" />} 
          Force Batch Export
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
      
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <QuantumLedgerWidget />
        <TreasuryDirectAIWidget />
        <NeuralComplianceWidget />
        <CBDCBridgeWidget />
        <SovereignReserveArbitrageWidget />
        <TorrensMatrixWidget />
      </div>
    </div>
  );
}
