import re

with open("src/components/bank/EToroApp.tsx", "r") as f:
    content = f.read()

nav_tabs = """
          <div className="flex overflow-x-auto gap-2 pb-4 hide-scrollbar">
            {['portfolio', 'trade', 'funding', 'rebalance'].map(tab => (
              <button 
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`px-6 py-2.5 rounded-xl text-sm font-bold capitalize transition-colors whitespace-nowrap ${activeTab === tab ? 'bg-emerald-500 text-white shadow-lg shadow-emerald-500/20' : 'bg-slate-900 text-slate-400 hover:bg-slate-800'}`}
              >
                {tab === 'rebalance' ? 'AI Rebalance' : tab}
              </button>
            ))}
          </div>
"""

# Try to replace the tabs. First find where the tabs are mapped
content = re.sub(r'<div className="flex overflow-x-auto gap-2 pb-4 hide-scrollbar">.*?</div>', nav_tabs, content, flags=re.DOTALL)

rebalance_tab = """
            {activeTab === 'rebalance' && (
              <div className="space-y-6">
                <div className="bg-slate-950 rounded-2xl p-6 border border-emerald-500/30 relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/10 rounded-full blur-[40px] -mr-16 -mt-16 pointer-events-none"></div>
                    <div className="flex items-center gap-3 mb-6">
                        <div className="w-10 h-10 rounded-xl bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center">
                            <Bot className="w-5 h-5 text-emerald-400" />
                        </div>
                        <div>
                            <h3 className="text-lg font-black text-white">AI Crypto Rebalancing</h3>
                            <p className="text-xs text-emerald-400/80 uppercase tracking-widest font-bold">Real-time Sentiment Analysis Active</p>
                        </div>
                    </div>
                    
                    <div className="grid md:grid-cols-3 gap-4 mb-6">
                        <div className="bg-slate-900 rounded-xl p-4 border border-slate-800">
                            <div className="text-xs text-slate-500 font-bold uppercase tracking-widest mb-1">Market Sentiment</div>
                            <div className="text-xl font-black text-emerald-400">Extreme Greed (84)</div>
                        </div>
                        <div className="bg-slate-900 rounded-xl p-4 border border-slate-800">
                            <div className="text-xs text-slate-500 font-bold uppercase tracking-widest mb-1">Recommended Action</div>
                            <div className="text-xl font-black text-white">De-risk to BTC/ETH</div>
                        </div>
                        <div className="bg-slate-900 rounded-xl p-4 border border-slate-800">
                            <div className="text-xs text-slate-500 font-bold uppercase tracking-widest mb-1">Expected Yield</div>
                            <div className="text-xl font-black text-emerald-400">+14.2% APY</div>
                        </div>
                    </div>

                    <div className="space-y-4 mb-6">
                        <h4 className="text-sm font-bold text-white uppercase tracking-widest">Proposed Portfolio Adjustments</h4>
                        
                        <div className="space-y-2">
                            <div className="flex items-center justify-between bg-slate-900 p-3 rounded-xl border border-red-500/20">
                                <div className="flex items-center gap-3">
                                    <div className="w-8 h-8 rounded-full bg-red-500/10 flex items-center justify-center text-red-400 font-bold text-xs">SELL</div>
                                    <span className="text-white font-bold">Solana (SOL)</span>
                                </div>
                                <div className="text-right">
                                    <div className="text-white font-mono font-bold">-25%</div>
                                    <div className="text-xs text-slate-500 font-mono">Take profit on recent rally</div>
                                </div>
                            </div>
                            
                            <div className="flex items-center justify-between bg-slate-900 p-3 rounded-xl border border-red-500/20">
                                <div className="flex items-center gap-3">
                                    <div className="w-8 h-8 rounded-full bg-red-500/10 flex items-center justify-center text-red-400 font-bold text-xs">SELL</div>
                                    <span className="text-white font-bold">Dogecoin (DOGE)</span>
                                </div>
                                <div className="text-right">
                                    <div className="text-white font-mono font-bold">-100%</div>
                                    <div className="text-xs text-slate-500 font-mono">Sentiment turned bearish</div>
                                </div>
                            </div>

                            <div className="flex items-center justify-between bg-slate-900 p-3 rounded-xl border border-emerald-500/20">
                                <div className="flex items-center gap-3">
                                    <div className="w-8 h-8 rounded-full bg-emerald-500/10 flex items-center justify-center text-emerald-400 font-bold text-xs">BUY</div>
                                    <span className="text-white font-bold">Bitcoin (BTC)</span>
                                </div>
                                <div className="text-right">
                                    <div className="text-white font-mono font-bold">+15%</div>
                                    <div className="text-xs text-slate-500 font-mono">Safe haven asset</div>
                                </div>
                            </div>
                            
                            <div className="flex items-center justify-between bg-slate-900 p-3 rounded-xl border border-emerald-500/20">
                                <div className="flex items-center gap-3">
                                    <div className="w-8 h-8 rounded-full bg-emerald-500/10 flex items-center justify-center text-emerald-400 font-bold text-xs">BUY</div>
                                    <span className="text-white font-bold">Ethereum (ETH)</span>
                                </div>
                                <div className="text-right">
                                    <div className="text-white font-mono font-bold">+10%</div>
                                    <div className="text-xs text-slate-500 font-mono">Yield opportunities via staking</div>
                                </div>
                            </div>
                        </div>
                    </div>
                    
                    <button 
                        onClick={() => {
                            toast.success("AI Agent executing portfolio rebalance...", { icon: <Bot className="w-4 h-4 text-emerald-400" />});
                            setTimeout(() => toast.success("Rebalance complete. Orders filled via TWAP."), 2000);
                        }}
                        className="w-full py-4 bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-400 border border-emerald-500/50 font-black rounded-xl transition-colors text-sm tracking-widest"
                    >
                        EXECUTE AI REBALANCE
                    </button>
                </div>
              </div>
            )}
"""

content = content.replace("          </div>\n       </div>", "          </div>\n       </div>\n" + rebalance_tab)

with open("src/components/bank/EToroApp.tsx", "w") as f:
    f.write(content)
