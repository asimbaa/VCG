import re

with open('src/components/bank/ValourianStrategicMoat.tsx', 'r') as f:
    content = f.read()

iso_and_torrens = """
function ISO20022DashboardWidget() {
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
}

function TorrensMatrixWidget() {
  const [syncStatus, setSyncStatus] = useState<'synced' | 'syncing'>('synced');
  
  const handleExport = () => {
    toast.info("Exporting single cryptographic batch...");
    setTimeout(() => toast.success("Export successful to Valourian OS"), 1500);
  };
  
  const handleBatchExport = () => {
    setSyncStatus('syncing');
    toast.info("Batch exporting to Valourian OS...");
    setTimeout(() => {
      setSyncStatus('synced');
      toast.success("All local cryptographic batches synced perfectly.");
    }, 2500);
  };

  return (
    <div className="bg-slate-900/50 rounded-[2rem] p-8 border border-slate-700/50 relative overflow-hidden group">
      <div className="absolute top-0 right-0 w-48 h-48 bg-slate-500/10 blur-[60px] rounded-full group-hover:bg-slate-500/20 transition-colors pointer-events-none" />
      <div className="relative z-10">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-slate-800/50 rounded-xl border border-slate-600/30">
              <Database className="w-6 h-6 text-slate-300" />
            </div>
            <div>
              <h4 className="text-lg font-black text-white italic tracking-tighter uppercase">Torrens Auth Matrix</h4>
              <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">Offline Syncer</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <div className={`w-2 h-2 rounded-full ${syncStatus === 'synced' ? 'bg-emerald-400' : 'bg-amber-400 animate-pulse'}`} />
            <span className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">{syncStatus === 'synced' ? 'Fully Synced' : 'Syncing...'}</span>
          </div>
        </div>
        
        <p className="text-sm text-slate-400 mb-6 font-medium">Manage cryptographic batch authorization blocks and ensure full local parity with the Valourian core network.</p>
        
        <div className="flex gap-3">
          <button 
            onClick={handleExport}
            className="flex-1 py-3 rounded-xl font-black uppercase tracking-widest text-xs transition-all flex items-center justify-center gap-2 bg-slate-800 hover:bg-slate-700 text-white shadow-lg"
          >
            <Download className="w-4 h-4" /> Export
          </button>
          <button 
            onClick={handleBatchExport}
            disabled={syncStatus === 'syncing'}
            className="flex-1 py-3 rounded-xl font-black uppercase tracking-widest text-xs transition-all flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-500 text-white shadow-[0_0_20px_rgba(37,99,235,0.3)] disabled:opacity-50"
          >
            {syncStatus === 'syncing' ? <Loader2 className="w-4 h-4 animate-spin" /> : <Layers className="w-4 h-4" />} Batch Export
          </button>
        </div>
      </div>
    </div>
  );
}
"""

content = content.replace("import { Shield, BrainCircuit, Network, Globe2, LockKeyhole, Loader2, CheckCircle2, Zap, ArrowRightLeft, ShieldCheck, Cpu } from 'lucide-react';", "import { Shield, BrainCircuit, Network, Globe2, LockKeyhole, Loader2, CheckCircle2, Zap, ArrowRightLeft, ShieldCheck, Cpu, Database, Download, Layers } from 'lucide-react';")

content = content.replace("<CBDCBridgeWidget />", "<CBDCBridgeWidget />\n        <ISO20022DashboardWidget />\n        <TorrensMatrixWidget />")

content = content.replace("function QuantumLedgerWidget() {", iso_and_torrens + "\nfunction QuantumLedgerWidget() {")

with open('src/components/bank/ValourianStrategicMoat.tsx', 'w') as f:
    f.write(content)
