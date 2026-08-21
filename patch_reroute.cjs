const fs = require('fs');
let content = fs.readFileSync('src/components/logistics/LogisticsDashboard.tsx', 'utf8');

// 1. Add Navigation icon to imports
content = content.replace(
  /Clock, Mail } from 'lucide-react';/,
  'Clock, Mail, Navigation, X, Send } from \'lucide-react\';'
);

// 2. Add state for re-route modal
const stateLogic = `  const [activeTab, setActiveTab] = useState<'keys' | 'items'>('keys');
  const [loading, setLoading] = useState(true);
  const [dynamicItems, setDynamicItems] = useState<any[]>([]);
  const [reRouteItem, setReRouteItem] = useState<any>(null);
  const [newAddress, setNewAddress] = useState("");
  const [isReRouting, setIsReRouting] = useState(false);
`;
content = content.replace(
  /  const \[activeTab, setActiveTab\] = useState<'keys' \| 'items'>\('keys'\);\n  const \[loading, setLoading\] = useState\(true\);\n  const \[dynamicItems, setDynamicItems\] = useState<any\[\]>\(\[\]\);/,
  stateLogic
);

// 3. Add re-route submit handler
const handlerLogic = `  const simulateEmail = (trackingId: string) => {
    toast.success(\`Tracking ID \${trackingId} and status update emailed to asim.nsw@gmail.com via encrypted SMTP.\`);
  };

  const handleReRoute = async () => {
    if (!newAddress || !reRouteItem) return;
    setIsReRouting(true);
    
    try {
      // Simulate DeepSpaceComputingCluster request
      await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          message: \`Execute RE-ROUTE Protocol for Tracking ID \${reRouteItem.trackingId} (\${reRouteItem.name || reRouteItem.address}). New Destination: \${newAddress}. Prioritize Deep Space Computing Cluster logistical support.\`, 
          agentId: 'DeepSpace' 
        })
      });
      
      toast.success(\`Re-route command dispatched to Deep Space Computing Cluster for \${reRouteItem.trackingId}\`);
      setReRouteItem(null);
      setNewAddress("");
    } catch (e) {
      toast.error("Cluster communication failed. Retrying...");
    } finally {
      setIsReRouting(false);
    }
  };
`;
content = content.replace(
  /  const simulateEmail = \(trackingId: string\) => \{\n    toast\.success\(\`Tracking ID \$\{trackingId\} and status update emailed to asim\.nsw@gmail\.com via encrypted SMTP\.\`\);\n  \};/,
  handlerLogic
);

// 4. Add "Re-route" button to keys
const keyButtonLogic = `              <button 
                onClick={() => setReRouteItem(item)}
                className="w-full sm:w-auto bg-slate-800 hover:bg-slate-700 text-slate-300 px-4 py-2 rounded-xl text-sm font-bold transition-all border border-slate-700 flex items-center justify-center gap-2"
              >
                <Navigation className="w-4 h-4" /> Re-route
              </button>
              <button 
                onClick={() => simulateEmail(item.trackingId)}`;
content = content.replace(
  /              <button \n                onClick=\{\(\) => simulateEmail\(item\.trackingId\)\}/,
  keyButtonLogic
);

// 5. Add "Re-route" button to items
const itemButtonLogic = `              <button 
                onClick={() => setReRouteItem(item)}
                className="w-full sm:w-auto bg-slate-800 hover:bg-slate-700 text-slate-300 px-4 py-2 rounded-xl text-sm font-bold transition-all border border-slate-700 flex items-center justify-center gap-2"
              >
                <Navigation className="w-4 h-4" /> Re-route
              </button>
              <button 
                onClick={() => simulateEmail(item.trackingId)}`;
content = content.replace(
  /              <button \n                onClick=\{\(\) => simulateEmail\(item\.trackingId\)\}/,
  itemButtonLogic
);

// 6. Add Modal JSX at the end of the return
const modalJSX = `        ))}
      </div>

      <AnimatePresence>
        {reRouteItem && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm"
          >
            <motion.div 
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 20 }}
              className="bg-slate-900 border border-emerald-500/30 rounded-3xl p-6 max-w-md w-full shadow-2xl relative overflow-hidden"
            >
              <div className="absolute top-0 right-0 p-6 opacity-5 pointer-events-none">
                <Navigation className="w-32 h-32" />
              </div>
              
              <button 
                onClick={() => setReRouteItem(null)}
                className="absolute top-4 right-4 p-2 text-slate-400 hover:text-white transition-colors bg-slate-800 rounded-full"
              >
                <X className="w-5 h-5" />
              </button>

              <h3 className="text-xl font-black text-white mb-2 flex items-center gap-2">
                <Navigation className="w-5 h-5 text-emerald-400" />
                Re-Route Consignment
              </h3>
              
              <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 mb-6">
                <div className="text-xs text-slate-500 uppercase font-black tracking-wider mb-1">Target</div>
                <div className="font-bold text-white text-sm">{reRouteItem.name || reRouteItem.address}</div>
                <div className="font-mono text-[#ffcc00] text-xs mt-1">{reRouteItem.trackingId}</div>
              </div>

              <div className="space-y-4">
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
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}`;

content = content.replace(/        \)\)\}\n      <\/div>\n    <\/div>\n  \);\n\}/, modalJSX);

fs.writeFileSync('src/components/logistics/LogisticsDashboard.tsx', content);
console.log('Added re-routing modal with DSCC integration');
