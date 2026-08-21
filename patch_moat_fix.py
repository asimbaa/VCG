import re

with open('src/components/bank/ValourianStrategicMoat.tsx', 'r') as f:
    content = f.read()

# Replace the first TorrensMatrixWidget entirely
# We know it exists from earlier
old_torrens = """function TorrensMatrixWidget() {
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
}"""

content = content.replace(old_torrens, "")

with open('src/components/bank/ValourianStrategicMoat.tsx', 'w') as f:
    f.write(content)
