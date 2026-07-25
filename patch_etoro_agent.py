import re

with open("src/components/bank/EToroApp.tsx", "r") as f:
    content = f.read()

# Make sure AI agent logic is implemented in eToroApp as requested by user
ai_agent_logic = """
  // AI Liquidity Management Logic
  const [aiEnabled, setAiEnabled] = useState(false);
  const [aiStatus, setAiStatus] = useState("Standby");
  const [aiTrades, setAiTrades] = useState<any[]>([]);

  React.useEffect(() => {
    let interval: any;
    if (aiEnabled) {
      setAiStatus("Scanning Markets...");
      interval = setInterval(() => {
        const statuses = ["Analyzing Order Book...", "Rebalancing Tech Equities...", "Executing Arbitrage...", "Optimizing Yield..."];
        const nextStatus = statuses[(statuses.indexOf(aiStatus) + 1) % statuses.length];
        setAiStatus(nextStatus);
        
        if (Math.random() > 0.7) {
            const possibleTrades = [
                { symbol: 'TSLA', action: 'BUY', amount: 50000 + Math.random() * 50000, price: 180 + Math.random() * 20 },
                { symbol: 'NVDA', action: 'BUY', amount: 100000 + Math.random() * 100000, price: 850 + Math.random() * 50 },
                { symbol: 'AMD', action: 'BUY', amount: 30000 + Math.random() * 20000, price: 160 + Math.random() * 10 },
                { symbol: 'AAPL', action: 'SELL', amount: 20000 + Math.random() * 10000, price: 170 + Math.random() * 5 },
                { symbol: 'MSFT', action: 'BUY', amount: 80000 + Math.random() * 40000, price: 400 + Math.random() * 10 },
            ];
            
            const trade = possibleTrades[Math.floor(Math.random() * possibleTrades.length)];
            
            setAiTrades(prev => [{
                id: Math.random().toString(36).substring(7),
                time: new Date(),
                ...trade
            }, ...prev].slice(0, 10)); // keep last 10 trades
            
            toast.success(`AI Agent executed ${trade.action} on ${trade.symbol}`, {
                icon: <Zap className="w-4 h-4 text-emerald-400" />
            });
        }
      }, 5000);
    } else {
      setAiStatus("Standby");
    }
    return () => clearInterval(interval);
  }, [aiEnabled, aiStatus]);
"""

# Inject before closing brace of EToroApp component
content = re.sub(r"const \[activeTab, setActiveTab\] = useState\('portfolio'\);", "const [activeTab, setActiveTab] = useState('portfolio');\n" + ai_agent_logic, content)


ai_ui = """
      {/* AI Liquidity Agent Panel */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 mb-6">
            <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${aiEnabled ? 'bg-emerald-500/20 border border-emerald-500/30' : 'bg-slate-800 border border-slate-700'}`}>
                        <Zap className={`w-5 h-5 ${aiEnabled ? 'text-emerald-400' : 'text-slate-400'}`} />
                    </div>
                    <div>
                        <h4 className="text-white font-bold">Automated Liquidity Management</h4>
                        <p className={`text-xs uppercase tracking-widest ${aiEnabled ? 'text-emerald-400' : 'text-slate-500'}`}>{aiStatus}</p>
                    </div>
                </div>
                <button 
                    onClick={() => setAiEnabled(!aiEnabled)}
                    className={`px-6 py-2 rounded-xl text-sm font-bold uppercase tracking-wider transition-colors ${aiEnabled ? 'bg-red-500/20 text-red-400 hover:bg-red-500/30 border border-red-500/30' : 'bg-emerald-500/20 text-emerald-400 hover:bg-emerald-500/30 border border-emerald-500/30'}`}
                >
                    {aiEnabled ? 'Deactivate Agent' : 'Activate AI Agent'}
                </button>
            </div>
            
            {aiEnabled && aiTrades.length > 0 && (
                <div className="mt-4 border-t border-slate-800 pt-4">
                    <h5 className="text-slate-400 text-xs font-bold mb-3 uppercase tracking-wider">Recent AI Executions</h5>
                    <div className="space-y-2">
                        {aiTrades.map(trade => (
                            <div key={trade.id} className="flex items-center justify-between bg-slate-800/50 p-3 rounded-lg border border-slate-700/50">
                                <div className="flex items-center gap-3">
                                    <div className={`w-2 h-2 rounded-full ${trade.action === 'BUY' ? 'bg-emerald-400' : 'bg-red-400'}`}></div>
                                    <span className="text-white font-mono text-sm">{trade.symbol}</span>
                                    <span className={`text-xs font-bold ${trade.action === 'BUY' ? 'text-emerald-400' : 'text-red-400'}`}>{trade.action}</span>
                                </div>
                                <div className="text-right">
                                    <div className="text-white font-mono text-sm">${trade.amount.toLocaleString(undefined, { maximumFractionDigits: 2 })}</div>
                                    <div className="text-slate-500 font-mono text-xs">@ ${trade.price.toFixed(2)}</div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </div>
      </div>
"""

content = content.replace("<div className=\"max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8\">", ai_ui + "\n<div className=\"max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8\">")

with open("src/components/bank/EToroApp.tsx", "w") as f:
    f.write(content)
