import re

with open('src/components/bank/ValourianStrategicMoat.tsx', 'r') as f:
    content = f.read()

new_imports = "import { Shield, BrainCircuit, Network, Globe2, LockKeyhole, Loader2, CheckCircle2, Zap, ArrowRightLeft, ShieldCheck, Cpu, Activity, Database, Download, Layers } from 'lucide-react';"
content = re.sub(r"import \{ Shield, BrainCircuit.*?\} from 'lucide-react';", new_imports, content, flags=re.DOTALL)

widgets_code = """
function TreasuryYieldPerformanceWidget() {
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
}

function TorrensMatrixWidget() {
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
}

"""
content = content.replace("export function ValourianStrategicMoat", widgets_code + "\nexport function ValourianStrategicMoat")

new_grid = """      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <QuantumLedgerWidget />
        <TreasuryDirectAIWidget />
        <NeuralComplianceWidget />
        <CBDCBridgeWidget />
        <TreasuryYieldPerformanceWidget />
        <TorrensMatrixWidget />
      </div>"""
content = re.sub(r'<div className="grid grid-cols-1 md:grid-cols-2 gap-6">.*?</div>', new_grid, content, flags=re.DOTALL)

with open('src/components/bank/ValourianStrategicMoat.tsx', 'w') as f:
    f.write(content)
