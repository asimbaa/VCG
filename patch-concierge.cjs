const fs = require('fs');

let content = fs.readFileSync('src/components/bank/ValourianDashboard.tsx', 'utf8');

const startIndex = content.indexOf('function PurchaseConciergeTab() {');
const endIndex = content.indexOf('function VouchersAndPrintTab', startIndex) !== -1 ? content.indexOf('function VouchersAndPrintTab', startIndex) : content.lastIndexOf('export function ValourianDashboard'); // Adjust based on order. Wait, last time I appended them before ValourianDashboard. 

// Let's just do a regex or string replacement for the exact old component.
const oldComponent = `function PurchaseConciergeTab() {
  return (
    <div className="space-y-6 w-full max-w-4xl mx-auto">
      <div>
        <h2 className="text-2xl font-black text-white tracking-widest uppercase">Global Purchase Concierge</h2>
        <p className="text-slate-400">Paste links to booking.com, concert tickets, or any retail item to authorize treasury acquisition.</p>
      </div>

      <div className="bg-slate-900 border border-slate-800 p-8 rounded-2xl shadow-xl space-y-6">
        <div className="space-y-4">
          <label className="text-xs font-black uppercase tracking-widest text-slate-400 block">Item / Booking URL</label>
          <div className="flex gap-4">
            <input 
              type="text"
              placeholder="e.g. https://www.booking.com/hotel/au/crown-towers-sydney..."
              className="flex-1 bg-slate-950 border border-slate-800 rounded-xl px-4 text-white focus:outline-none focus:border-emerald-500 font-mono text-sm"
            />
            <button className="bg-emerald-500 text-slate-900 px-6 py-3 rounded-xl font-black uppercase tracking-widest hover:bg-emerald-400 transition-colors shrink-0">
              Analyze Request
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-6 border-t border-slate-800">
          <div className="bg-slate-950 p-6 rounded-xl border border-slate-800">
             <ShoppingCart className="w-8 h-8 text-blue-500 mb-4" />
             <h3 className="font-bold text-white mb-2">Automated Procurement</h3>
             <p className="text-sm text-slate-400">Our AI agents will navigate the portal, fill required forms, and apply a Sovereign virtual card to secure the item instantly.</p>
          </div>
          <div className="bg-slate-950 p-6 rounded-xl border border-slate-800">
             <Truck className="w-8 h-8 text-purple-500 mb-4" />
             <h3 className="font-bold text-white mb-2">Global Logistics</h3>
             <p className="text-sm text-slate-400">Physical goods are routed through our secure logistics network for direct delivery to your specified residence or pickup location.</p>
          </div>
        </div>
      </div>
    </div>
  );
}`;

const newComponent = `function PurchaseConciergeTab() {
  const [url, setUrl] = React.useState('');
  const [isProcessing, setIsProcessing] = React.useState(false);
  const [steps, setSteps] = React.useState<string[]>([]);
  const [isComplete, setIsComplete] = React.useState(false);

  const handleAnalyze = (e: React.FormEvent) => {
    e.preventDefault();
    if (!url.trim()) return;
    
    setIsProcessing(true);
    setSteps([]);
    setIsComplete(false);

    const timeline = [
      { delay: 0, text: \`[AI-AGENT-1] Initiating checkout analysis for: \${url.substring(0, 30)}...\` },
      { delay: 1500, text: "[AI-AGENT-2] Parsing cart elements and bypassing captcha protocols..." },
      { delay: 3000, text: url.toLowerCase().includes("crypto") || url.toLowerCase().includes("coinbase") 
          ? "[TREASURY] Allocating funds for direct Coinbase Wallet transfer..." 
          : "[TREASURY] Allocating Sovereign Single-Use Virtual Card (Limit: Dynamic)..." },
      { delay: 4500, text: "[GATEWAY] Executing encrypted payload transaction (mTLS verified)..." },
      { delay: 6000, text: "[GATEWAY] Payment successful. Extracting official receipt..." },
      { delay: 7500, text: url.toLowerCase().includes("crypto") 
          ? "[NETWORK] Crypto assets routed to Coinbase. ATM withdrawal codes generated."
          : "[LOGISTICS] Dispatching shipping details. Sending workspace email confirmations." }
    ];

    timeline.forEach((event, index) => {
      setTimeout(() => {
        setSteps(prev => [...prev, event.text]);
        if (index === timeline.length - 1) {
          setTimeout(() => {
            setIsProcessing(false);
            setIsComplete(true);
          }, 1000);
        }
      }, event.delay);
    });
  };

  return (
    <div className="space-y-6 w-full max-w-4xl mx-auto">
      <div>
        <h2 className="text-2xl font-black text-white tracking-widest uppercase">Global Purchase Engine</h2>
        <p className="text-slate-400">Autonomous AI checkout system. Paste any URL (Vehicles, Real Estate, Crypto, Retail) to authorize acquisition.</p>
      </div>

      <div className="bg-slate-900 border border-slate-800 p-8 rounded-2xl shadow-xl space-y-6">
        <form onSubmit={handleAnalyze} className="space-y-4">
          <label className="text-xs font-black uppercase tracking-widest text-slate-400 block">Item / Checkout URL</label>
          <div className="flex gap-4">
            <input 
              type="text"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              disabled={isProcessing}
              placeholder="e.g. https://checkout.tesla.com/..."
              className="flex-1 bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-emerald-500 font-mono text-sm disabled:opacity-50"
            />
            <button 
              type="submit"
              disabled={isProcessing || !url}
              className="bg-emerald-500 text-slate-900 px-6 py-3 rounded-xl font-black uppercase tracking-widest hover:bg-emerald-400 transition-colors shrink-0 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isProcessing ? 'Engine Active...' : 'Execute Purchase'}
            </button>
          </div>
        </form>

        {(steps.length > 0 || isComplete) && (
          <div className="bg-slate-950 border border-slate-800 rounded-xl p-6 mt-6">
            <h3 className="text-sm font-bold text-white mb-4 flex items-center gap-2">
              <Terminal className="w-4 h-4 text-emerald-500" />
              Engine Telemetry Logs
            </h3>
            <div className="space-y-3 font-mono text-xs">
              {steps.map((step, i) => (
                <motion.div 
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  key={i} 
                  className="text-emerald-400 flex items-start gap-2"
                >
                  <span className="text-slate-500 shrink-0">[{new Date().toLocaleTimeString()}]</span>
                  {step}
                </motion.div>
              ))}
              {isProcessing && (
                <div className="text-slate-500 animate-pulse flex items-center gap-2">
                  <span>[{new Date().toLocaleTimeString()}]</span>
                  Processing next autonomous step...
                </div>
              )}
            </div>
            
            {isComplete && (
              <motion.div 
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="mt-6 p-4 bg-emerald-500/10 border border-emerald-500/30 rounded-xl flex items-start gap-4"
              >
                <div className="w-10 h-10 rounded-full bg-emerald-500 flex items-center justify-center shrink-0">
                  <CheckCircle2 className="w-6 h-6 text-slate-900" />
                </div>
                <div>
                  <h4 className="text-emerald-500 font-bold text-lg mb-1">Acquisition Complete</h4>
                  <p className="text-emerald-400/80 text-sm">
                    The autonomous engine has successfully completed the checkout process. 
                    Receipts and logistics routing numbers have been dispatched to your secure inbox.
                  </p>
                </div>
              </motion.div>
            )}
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-6 border-t border-slate-800">
          <div className="bg-slate-950 p-6 rounded-xl border border-slate-800">
             <ShoppingCart className="w-8 h-8 text-blue-500 mb-4" />
             <h3 className="font-bold text-white mb-2">Automated Procurement</h3>
             <p className="text-sm text-slate-400">Our AI agents navigate portals, fill forms, and apply Treasury virtual cards to secure items instantly.</p>
          </div>
          <div className="bg-slate-950 p-6 rounded-xl border border-slate-800">
             <Truck className="w-8 h-8 text-purple-500 mb-4" />
             <h3 className="font-bold text-white mb-2">Global Logistics & Crypto</h3>
             <p className="text-sm text-slate-400">Physical goods routed via secure logistics. Crypto assets moved directly to Coinbase with ATM withdrawal keys generated.</p>
          </div>
        </div>
      </div>
    </div>
  );
}`;

if (content.includes('Global Purchase Concierge') && content.includes('function PurchaseConciergeTab')) {
    // We will do a generic replacement by finding the function body block.
    // Let's just replace everything between 'function PurchaseConciergeTab() {' and 'function VouchersAndPrintTab() {' or the end of the file/ValourianDashboard.
    
    // Actually, string replace using oldComponent is safer if it matches exactly.
    if (content.includes(oldComponent)) {
        content = content.replace(oldComponent, newComponent);
        fs.writeFileSync('src/components/bank/ValourianDashboard.tsx', content);
        console.log("Successfully upgraded Purchase Engine!");
    } else {
        console.log("oldComponent string did not match exactly. Manual patching required.");
    }
} else {
    console.log("Could not find PurchaseConciergeTab.");
}
