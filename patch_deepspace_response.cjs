const fs = require('fs');
let content = fs.readFileSync('src/components/logistics/LogisticsDashboard.tsx', 'utf8');

// Add reRouteResponse to state
const stateLogic = `  const [reRouteItem, setReRouteItem] = useState<any>(null);
  const [newAddress, setNewAddress] = useState("");
  const [isReRouting, setIsReRouting] = useState(false);
  const [reRouteResponse, setReRouteResponse] = useState<string | null>(null);`;
content = content.replace(
  /  const \[reRouteItem, setReRouteItem\] = useState<any>\(null\);\n  const \[newAddress, setNewAddress\] = useState\(""\);\n  const \[isReRouting, setIsReRouting\] = useState\(false\);/,
  stateLogic
);

// Update handler logic
const handlerLogic = `  const handleReRoute = async () => {
    if (!newAddress || !reRouteItem) return;
    setIsReRouting(true);
    setReRouteResponse(null);
    
    try {
      // Simulate DeepSpaceComputingCluster request
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          message: \`Execute RE-ROUTE Protocol for Tracking ID \${reRouteItem.trackingId} (\${reRouteItem.name || reRouteItem.address}). New Destination: \${newAddress}. Prioritize Deep Space Computing Cluster logistical support.\`, 
          agentId: 'DeepSpace' 
        })
      });
      
      const data = await res.json();
      setReRouteResponse(data.reply);
      toast.success(\`Re-route confirmed by Deep Space Computing Cluster for \${reRouteItem.trackingId}\`);
    } catch (e) {
      toast.error("Cluster communication failed. Retrying...");
    } finally {
      setIsReRouting(false);
    }
  };`;
content = content.replace(
  /  const handleReRoute = async \(\) => \{[\s\S]*?setIsReRouting\(false\);\n    \}\n  \};/,
  handlerLogic
);

// Render the response inside the modal
const modalRender = `              <div className="space-y-4">
                {reRouteResponse ? (
                  <div className="bg-emerald-950/20 border border-emerald-500/30 rounded-xl p-4 animate-fade-in-up">
                    <h4 className="text-emerald-400 font-bold text-xs uppercase tracking-wider mb-2 flex items-center gap-2">
                      <Truck className="w-4 h-4" /> Deep Space Cluster Response
                    </h4>
                    <p className="text-emerald-50/80 text-sm whitespace-pre-wrap">{reRouteResponse}</p>
                    <button 
                      onClick={() => {
                        setReRouteItem(null);
                        setReRouteResponse(null);
                        setNewAddress("");
                      }}
                      className="w-full mt-4 bg-slate-800 hover:bg-slate-700 text-white px-4 py-2 rounded-xl text-sm font-bold transition-all border border-slate-700 flex items-center justify-center gap-2"
                    >
                      Acknowledge & Close
                    </button>
                  </div>
                ) : (
                  <>
                    <div>
                      <label className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2 block">New Destination Address</label>
                      <textarea 
                        value={newAddress}
                        onChange={(e) => setNewAddress(e.target.value)}
                        className="w-full bg-slate-800 border border-slate-700 rounded-xl p-4 text-white text-sm focus:ring-2 focus:ring-emerald-500 focus:outline-none resize-none"
                        placeholder="Enter new delivery address..."
                        rows={3}
                      />
                    </div>
                    
                    <div className="text-[10px] text-emerald-400/80 font-mono bg-emerald-950/30 border border-emerald-900/50 p-3 rounded-lg flex gap-2">
                      <Truck className="w-4 h-4 shrink-0" />
                      Request will be routed via Deep Space Computing Cluster for real-time interception and logistical coordination.
                    </div>

                    <button 
                      onClick={handleReRoute}
                      disabled={!newAddress || isReRouting}
                      className="w-full bg-gradient-to-r from-emerald-600 to-blue-600 hover:from-emerald-500 hover:to-blue-500 text-white font-black py-4 rounded-xl transition-all shadow-lg flex items-center justify-center gap-2 uppercase tracking-widest text-xs disabled:opacity-50"
                    >
                      {isReRouting ? (
                        <><div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div> Comm Link Active...</>
                      ) : (
                        <><Send className="w-4 h-4" /> Dispatch Re-Route Command</>
                      )}
                    </button>
                  </>
                )}
              </div>`;

content = content.replace(/              <div className="space-y-4">[\s\S]*?<\/button>\n              <\/div>/, modalRender);

fs.writeFileSync('src/components/logistics/LogisticsDashboard.tsx', content);
console.log('Added Deep Space AI response rendering.');
