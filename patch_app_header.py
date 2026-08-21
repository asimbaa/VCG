import re

with open("src/App.tsx", "r") as f:
    content = f.read()

import_lucide = 'import { Landmark, ShieldCheck, LogOut, Loader2, FileText, Globe, Send, Mail, Bot, Sparkles, X, Database, RefreshCw } from "lucide-react";'
content = re.sub(r'import \{ Landmark.*?\} from "lucide-react";', import_lucide, content)

# Define the new component state variable
state_vars = """
  const [torrensSyncState, setTorrensSyncState] = useState<'synced' | 'syncing'>('synced');
  
  const handleForceBatchExport = () => {
    if (torrensSyncState === 'syncing') return;
    setTorrensSyncState('syncing');
    toast.info("Offline Mode Active: Forcing encrypted JSON batch export to Torrens Matrix...");
    
    setTimeout(() => {
      // Simulate file download
      const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify({
        timestamp: new Date().toISOString(),
        batches: ["TX-001", "TX-002", "TX-003"],
        integrityHash: "0x" + Math.random().toString(16).slice(2, 12).toUpperCase(),
        status: "SECURED"
      }, null, 2));
      const downloadAnchorNode = document.createElement('a');
      downloadAnchorNode.setAttribute("href",     dataStr);
      downloadAnchorNode.setAttribute("download", "torrens_matrix_batch.json");
      document.body.appendChild(downloadAnchorNode); 
      downloadAnchorNode.click();
      downloadAnchorNode.remove();
      
      setTorrensSyncState('synced');
      toast.success("Torrens Matrix batch securely exported for offline reconciliation.");
    }, 2000);
  };
"""

content = content.replace("  const [activeTab, setActiveTab] = useState<string>(\"commbank\");", "  const [activeTab, setActiveTab] = useState<string>(\"commbank\");" + state_vars)

# Inject the UI element
header_ui = """            <div className="flex items-center gap-4">
              <div className="hidden lg:flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-emerald-400 bg-slate-950 px-3 py-1.5 rounded-full border border-slate-800">
                <Database className="w-4 h-4 text-emerald-500" />
                <span className="hidden xl:inline">Torrens Matrix: </span>
                <span className="flex items-center gap-1">
                  {torrensSyncState === 'synced' ? (
                    <>
                       <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse shadow-[0_0_5px_rgba(16,185,129,1)]"></div>
                       SYNCED
                    </>
                  ) : (
                    <>
                       <RefreshCw className="w-3 h-3 text-emerald-500 animate-spin" />
                       EXPORTING...
                    </>
                  )}
                </span>
                <button 
                  onClick={handleForceBatchExport}
                  disabled={torrensSyncState === 'syncing'}
                  className="ml-2 bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-500 border border-emerald-500/30 px-2 py-0.5 rounded transition-colors"
                >
                  Force Batch Export
                </button>
              </div>"""

content = content.replace('            <div className="flex items-center gap-4">', header_ui)

with open("src/App.tsx", "w") as f:
    f.write(content)
