import re

with open("src/components/bank/ValourianDashboard.tsx", "r") as f:
    content = f.read()

# Add AI Liquidity Logic
ai_logic = """
  const [activeTab, setActiveTab] = useState<
    | "treasury"
    | "operations"
    | "strategic_assets"
    | "deployments"
    | "legal"
    | "tax"
    | "hr"
    | "receipts"
    | "chat"
    | "australia"
    | "website"
    | "etoro"
    | "commbank"
    | "commsec"
    | "nab"
    | "pgy"
    | "coinbase"
    | "ordertracking"
    | "booking"
    | "uber"
    | "ubereats"
    | "skyscanner"
    | "store"
    | "docucraft"
    | "email"
    | "terminal"
    | "past-orders"
    | "eftpos"
    | "atm"
    | "subscriptions"
  >("treasury");
  
  const [aiEnabled, setAiEnabled] = useState(false);
  const [aiStatus, setAiStatus] = useState("Standby");

  React.useEffect(() => {
    let interval: any;
    if (aiEnabled) {
      setAiStatus("Scanning Global Markets...");
      interval = setInterval(() => {
        const statuses = ["Scanning Global Markets...", "Rebalancing Strategic Assets...", "Targeting High-Growth Tech..."];
        const nextStatus = statuses[(statuses.indexOf(aiStatus) + 1) % statuses.length];
        setAiStatus(nextStatus);
        
        if (Math.random() > 0.8) {
            toast.success("AI Agent executed rebalance across Tech Sector", { icon: <Zap className="w-4 h-4 text-emerald-400" /> });
        }
      }, 7000);
    } else {
      setAiStatus("Standby");
    }
    return () => clearInterval(interval);
  }, [aiEnabled, aiStatus]);
"""

content = re.sub(
    r"const \[activeTab, setActiveTab\] = useState<\s*\|.*?>(?:.*?)\);",
    ai_logic,
    content,
    flags=re.DOTALL
)

ai_ui = """
          {/* Main Dashboard Cards */}
          <div className="grid lg:grid-cols-3 gap-6 mb-8 relative z-10">
            <div className="bg-slate-900 rounded-3xl p-8 border border-slate-800 relative overflow-hidden shadow-2xl">
              <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/10 rounded-full blur-[40px] -mr-16 -mt-16 pointer-events-none"></div>
              
              <div className="flex items-center justify-between mb-4 relative z-10">
                <div className="flex items-center gap-3">
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${aiEnabled ? 'bg-emerald-500/20 border border-emerald-500/30' : 'bg-slate-800 border border-slate-700'}`}>
                    <Bot className={`w-5 h-5 ${aiEnabled ? 'text-emerald-400' : 'text-slate-400'}`} />
                  </div>
                  <div>
                    <h4 className="text-white font-black">AI Liquidity Management</h4>
                    <p className={`text-[10px] font-bold uppercase tracking-widest ${aiEnabled ? 'text-emerald-400' : 'text-slate-500'}`}>{aiStatus}</p>
                  </div>
                </div>
                <button 
                  onClick={() => setAiEnabled(!aiEnabled)}
                  className={`px-4 py-2 rounded-xl text-xs font-bold uppercase tracking-widest transition-colors ${aiEnabled ? 'bg-red-500/20 text-red-400 hover:bg-red-500/30 border border-red-500/30' : 'bg-emerald-500/20 text-emerald-400 hover:bg-emerald-500/30 border border-emerald-500/30'}`}
                >
                  {aiEnabled ? 'Deactivate' : 'Activate'}
                </button>
              </div>
              {aiEnabled && (
                <div className="p-4 bg-emerald-500/10 border border-emerald-500/20 rounded-xl mt-4">
                  <p className="text-xs text-emerald-300/80 leading-relaxed">
                    Sovereign Agent is now actively managing treasury liquidity, rebalancing assets in real-time, and targeting high-growth technology equities.
                  </p>
                </div>
              )}
            </div>
            
            <div className="bg-slate-900 rounded-[2.5rem] p-8 border border-emerald-500/30 shadow-[0_0_50px_rgba(16,185,129,0.15)] relative overflow-hidden group">
"""
content = content.replace("          {/* Main Dashboard Cards */}\n          <div className=\"grid lg:grid-cols-3 gap-6 mb-8 relative z-10\">\n            <div className=\"bg-slate-900 rounded-[2.5rem] p-8 border border-emerald-500/30 shadow-[0_0_50px_rgba(16,185,129,0.15)] relative overflow-hidden group\">", ai_ui)

with open("src/components/bank/ValourianDashboard.tsx", "w") as f:
    f.write(content)
