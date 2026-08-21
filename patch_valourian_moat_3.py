import re

with open('src/components/bank/ValourianStrategicMoat.tsx', 'r') as f:
    content = f.read()

# 1. Update imports
new_imports = "import { Shield, BrainCircuit, Network, Globe2, LockKeyhole, Loader2, CheckCircle2, Zap, ArrowRightLeft, ShieldCheck, Cpu, Activity, Database, Download, Layers, ScanFace, FileJson, X } from 'lucide-react';"
content = re.sub(r"import \{ .*?\} from 'lucide-react';", new_imports, content)

# 2. Update ISO20022DashboardWidget
iso_old = """function ISO20022DashboardWidget() {
  const [messages, setMessages] = useState([
    { id: 'msg-01', from: 'AU', to: 'US', amount: '12.4M', curr: 'AUD', status: 'SETTLED', auth: 'BIOMETRIC_PASS' },
    { id: 'msg-02', from: 'UK', to: 'AU', amount: '8.1M', curr: 'GBP', status: 'SETTLED', auth: 'BIOMETRIC_PASS' },
    { id: 'msg-03', from: 'SG', to: 'JP', amount: '105M', curr: 'JPY', status: 'PENDING', auth: 'AWAITING_AUTH' },
  ]);

  return (
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
            <div key={msg.id} className="bg-slate-950 p-4 rounded-xl border border-slate-800 flex items-center justify-between">
              <div className="flex flex-col gap-1">
                <span className="text-white font-black text-sm uppercase tracking-wider">{msg.from} <ArrowRightLeft className="w-3 h-3 inline mx-1" /> {msg.to}</span>
                <span className="text-slate-500 font-mono text-xs">{msg.id}</span>
              </div>
              <div className="flex flex-col items-end gap-1">
                <span className="text-emerald-400 font-black text-sm">{msg.amount} {msg.curr}</span>
                <span className={`text-[9px] font-black uppercase tracking-widest px-2 py-0.5 rounded-full ${msg.status === 'SETTLED' ? 'bg-emerald-500/20 text-emerald-400' : 'bg-amber-500/20 text-amber-400'}`}>
                  {msg.auth}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}"""

iso_new = """function ISO20022DashboardWidget() {
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
}"""

content = content.replace(iso_old, iso_new)

# 3. Rename and Update TreasuryYieldPerformanceWidget
treasury_old = """function TreasuryYieldPerformanceWidget() {
  const [isSyncing, setIsSyncing] = useState(false);
  const yieldData = [
    { asset: 'US 10Y T-Note', rate: '4.21%', trend: 'up', spread: '+12bps' },
    { asset: 'UK Gilts 5Y', rate: '3.94%', trend: 'down', spread: '-4bps' },
    { asset: 'AUS Gov 10Y', rate: '4.35%', trend: 'up', spread: '+18bps' },
  ];

  const handleResync = () => {
    setIsSyncing(true);
    toast.info("Resyncing with global bond markets...");
    setTimeout(() => {
      setIsSyncing(false);
      toast.success("Yield curves recalibrated. Arbitrage ops active.");
    }, 2000);
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
              <h4 className="text-lg font-black text-white italic tracking-tighter uppercase">Live Treasury Yields</h4>
              <p className="text-[10px] text-emerald-300/80 font-bold uppercase tracking-widest">Bond/Gilt Arbitrage</p>
            </div>
          </div>
          <button onClick={handleResync} className="p-2 bg-emerald-900/30 text-emerald-400 hover:bg-emerald-900/60 rounded-xl transition-colors">
            <Loader2 className={`w-4 h-4 ${isSyncing ? 'animate-spin' : ''}`} />
          </button>
        </div>
        
        <div className="space-y-3 mb-6">
          {yieldData.map((data, idx) => (
            <div key={idx} className="flex items-center justify-between bg-emerald-950/50 p-3 rounded-xl border border-emerald-900/50">
              <span className="text-slate-300 font-bold text-xs uppercase tracking-widest">{data.asset}</span>
              <div className="flex items-center gap-3">
                <span className={`text-[10px] font-black uppercase ${data.trend === 'up' ? 'text-emerald-400' : 'text-rose-400'}`}>
                  {data.spread}
                </span>
                <span className="text-white font-black text-sm">{data.rate}</span>
              </div>
            </div>
          ))}
        </div>
        
        <div className="w-full py-3 rounded-xl font-black uppercase tracking-widest text-xs flex items-center justify-center gap-2 bg-emerald-900/20 text-emerald-400 border border-emerald-500/30">
          <CheckCircle2 className="w-4 h-4" /> AI Arbitrage Active
        </div>
      </div>
    </div>
  );
}"""

treasury_new = """function SovereignReserveArbitrageWidget() {
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
}"""

content = content.replace(treasury_old, treasury_new)
content = content.replace("<TreasuryYieldPerformanceWidget />", "<SovereignReserveArbitrageWidget />")

# 4. Update TorrensMatrixWidget
torrens_old = """function TorrensMatrixWidget() {
  const [syncStatus, setSyncStatus] = useState<'synced' | 'syncing'>('synced');
  
  const handleBatchExport = () => {
    setSyncStatus('syncing');
    toast.info("Force exporting offline Torrens proofs...");
    setTimeout(() => {
      setSyncStatus('synced');
      toast.success("Offline proofs successfully batch exported and verified.");
    }, 2500);
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
          {syncStatus === 'syncing' ? <Loader2 className="w-4 h-4 animate-spin" /> : <Layers className="w-4 h-4" />} 
          Force Batch Export
        </button>
      </div>
    </div>
  );
}"""

torrens_new = """function TorrensMatrixWidget() {
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
}"""

content = content.replace(torrens_old, torrens_new)

with open('src/components/bank/ValourianStrategicMoat.tsx', 'w') as f:
    f.write(content)
