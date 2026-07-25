import re

with open("src/components/bank/EToroApp.tsx", "r") as f:
    content = f.read()

# Replace the space-y-2 with grid for multi-column layout
old_layout = """                    <div className="space-y-4 mb-6">
                        <h4 className="text-sm font-bold text-white uppercase tracking-widest">Proposed Portfolio Adjustments</h4>
                        
                        <div className="space-y-2">"""

new_layout = """                    <div className="space-y-4 mb-6">
                        <h4 className="text-sm font-bold text-white uppercase tracking-widest">Proposed Portfolio Adjustments</h4>
                        
                        <div className="grid md:grid-cols-2 gap-4">"""
content = content.replace(old_layout, new_layout)

# Replace the button and add modal
old_btn = """                    <button 
                        onClick={() => {
                            toast.success("AI Agent executing portfolio rebalance...", { icon: <Bot className="w-4 h-4 text-emerald-400" />});
                            setTimeout(() => toast.success("Rebalance complete. Orders filled via TWAP."), 2000);
                        }}
                        className="w-full py-4 bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-400 border border-emerald-500/50 font-black rounded-xl transition-colors text-sm tracking-widest"
                    >
                        EXECUTE AI REBALANCE
                    </button>"""

new_btn_and_modal = """                    <button 
                        onClick={() => setShowExecutionModal(true)}
                        className="w-full py-4 bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-400 border border-emerald-500/50 font-black rounded-xl transition-colors text-sm tracking-widest"
                    >
                        PREVIEW & EXECUTE AI REBALANCE
                    </button>

                    {showExecutionModal && (
                        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
                            <div className="bg-slate-900 border border-emerald-500/30 rounded-2xl p-6 w-full max-w-md shadow-[0_0_50px_rgba(16,185,129,0.1)] relative">
                                <button onClick={() => setShowExecutionModal(false)} className="absolute top-4 right-4 text-slate-400 hover:text-white">
                                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
                                </button>
                                
                                <div className="flex items-center gap-3 mb-6">
                                    <Activity className="w-6 h-6 text-emerald-400" />
                                    <h3 className="text-xl font-black text-white">Execution Details</h3>
                                </div>
                                
                                <div className="space-y-4 mb-8">
                                    <div className="flex justify-between items-center pb-3 border-b border-slate-800">
                                        <span className="text-slate-400 font-bold text-xs uppercase tracking-widest">Routing Strategy</span>
                                        <span className="text-white font-black">TWAP (Smart Router)</span>
                                    </div>
                                    <div className="flex justify-between items-center pb-3 border-b border-slate-800">
                                        <span className="text-slate-400 font-bold text-xs uppercase tracking-widest">Estimated Gas Fees</span>
                                        <span className="text-yellow-400 font-mono font-bold">$142.50 (0.045 ETH)</span>
                                    </div>
                                    <div className="flex justify-between items-center pb-3 border-b border-slate-800">
                                        <span className="text-slate-400 font-bold text-xs uppercase tracking-widest">Est. Slippage Impact</span>
                                        <span className="text-emerald-400 font-mono font-bold">0.12%</span>
                                    </div>
                                    <div className="flex justify-between items-center pb-3 border-b border-slate-800">
                                        <span className="text-slate-400 font-bold text-xs uppercase tracking-widest">Execution Time</span>
                                        <span className="text-white font-mono font-bold">~45 minutes</span>
                                    </div>
                                </div>
                                
                                <button 
                                    onClick={() => {
                                        setShowExecutionModal(false);
                                        toast.success("AI Agent executing portfolio rebalance...", { icon: <Bot className="w-4 h-4 text-emerald-400" />});
                                        setTimeout(() => toast.success("Rebalance complete. Orders filled via TWAP."), 2000);
                                    }}
                                    className="w-full py-4 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black rounded-xl transition-colors uppercase tracking-widest text-xs"
                                >
                                    CONFIRM REBALANCE
                                </button>
                            </div>
                        </div>
                    )}"""
content = content.replace(old_btn, new_btn_and_modal)

with open("src/components/bank/EToroApp.tsx", "w") as f:
    f.write(content)

