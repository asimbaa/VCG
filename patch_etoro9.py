import re

with open("src/components/bank/EToroApp.tsx", "r") as f:
    content = f.read()

# Add AI Liquidity Logic
ai_logic = """
  const [aiEnabled, setAiEnabled] = useState(false);
  const [aiStatus, setAiStatus] = useState("Standby");

  React.useEffect(() => {
    let interval: any;
    if (aiEnabled) {
      setAiStatus("Analyzing Market Liquidity...");
      interval = setInterval(() => {
        setAiStatus(prev => prev === "Analyzing Market Liquidity..." ? "Rebalancing Portfolios..." : "Analyzing Market Liquidity...");
        if (Math.random() > 0.7) {
            toast.success("AI Agent executed micro-rebalance across Tech Sector", { icon: <Zap className="w-4 h-4 text-emerald-400" /> });
        }
      }, 5000);
    } else {
      setAiStatus("Standby");
    }
    return () => clearInterval(interval);
  }, [aiEnabled]);
"""

content = content.replace("  const [isTrading, setIsTrading] = useState(false);", "  const [isTrading, setIsTrading] = useState(false);\n" + ai_logic)

ai_ui = """
                <div className="bg-slate-950 rounded-2xl p-6 border border-slate-800 mt-6">
                  <div className="flex items-center justify-between mb-4">
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
                      {aiEnabled ? 'Deactivate AI' : 'Activate AI'}
                    </button>
                  </div>
                  {aiEnabled && (
                    <div className="p-4 bg-emerald-500/10 border border-emerald-500/20 rounded-xl">
                      <p className="text-xs text-emerald-300/80 leading-relaxed">
                        Sovereign Agent is now actively managing liquidity, rebalancing assets in real-time, and targeting high-growth technology equities based on Deep Tech predictive models.
                      </p>
                    </div>
                  )}
                </div>
"""
content = content.replace("</div>\n              </div>\n            )}\n            \n            {activeTab === 'trade'", ai_ui + "\n              </div>\n            )}\n            \n            {activeTab === 'trade'")

with open("src/components/bank/EToroApp.tsx", "w") as f:
    f.write(content)
