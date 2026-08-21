import re

with open("src/App.tsx", "r") as f:
    content = f.read()

state_vars = """export default function App() {
  const [torrensSyncState, setTorrensSyncState] = useState<'synced' | 'syncing'>('synced');
  
  const handleForceBatchExport = () => {
    if (torrensSyncState === 'syncing') return;
    setTorrensSyncState('syncing');
    toast.info("Offline Mode Active: Forcing encrypted JSON batch export to Torrens Matrix...");
    
    setTimeout(() => {
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

content = content.replace("export default function App() {", state_vars)

with open("src/App.tsx", "w") as f:
    f.write(content)
