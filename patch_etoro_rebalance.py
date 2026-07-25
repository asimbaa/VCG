import re

with open('src/components/bank/EToroApp.tsx', 'r') as f:
    content = f.read()

state_repl = """  const [showExecutionModal, setShowExecutionModal] = useState(false);
  const [rebalanceStatus, setRebalanceStatus] = useState<'idle' | 'executing' | 'complete'>('idle');
  const [executionProgress, setExecutionProgress] = useState(0);
  const [currentExecutionStep, setCurrentExecutionStep] = useState(0);"""

content = content.replace("  const [showExecutionModal, setShowExecutionModal] = useState(false);", state_repl)

modal_code_old = """                    {showExecutionModal && (
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

modal_code_new = """                    {showExecutionModal && (
                        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
                            <div className="bg-slate-900 border border-emerald-500/30 rounded-2xl p-6 w-full max-w-md shadow-[0_0_50px_rgba(16,185,129,0.1)] relative">
                                {rebalanceStatus === 'idle' && (
                                    <button onClick={() => setShowExecutionModal(false)} className="absolute top-4 right-4 text-slate-400 hover:text-white">
                                        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
                                    </button>
                                )}
                                
                                <div className="flex items-center gap-3 mb-6">
                                    <Activity className={`w-6 h-6 text-emerald-400 ${rebalanceStatus === 'executing' ? 'animate-pulse' : ''}`} />
                                    <h3 className="text-xl font-black text-white">{rebalanceStatus === 'idle' ? 'Execution Details' : rebalanceStatus === 'executing' ? 'AI Execution in Progress' : 'Execution Complete'}</h3>
                                </div>
                                
                                {rebalanceStatus === 'idle' ? (
                                    <>
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
                                                setRebalanceStatus('executing');
                                                setExecutionProgress(0);
                                                setCurrentExecutionStep(0);
                                                
                                                toast.success("AI Agent executing portfolio rebalance...", { icon: <Bot className="w-4 h-4 text-emerald-400" />});
                                                
                                                // Simulate steps
                                                const simulateStep = (step, progress, delay) => {
                                                    setTimeout(() => {
                                                        setCurrentExecutionStep(step);
                                                        setExecutionProgress(progress);
                                                    }, delay);
                                                };
                                                
                                                simulateStep(1, 25, 1000); // Route optimization
                                                simulateStep(2, 50, 2500); // Acquiring liquidations
                                                simulateStep(3, 75, 4000); // Balancing assets
                                                simulateStep(4, 100, 5500); // Finalizing
                                                
                                                setTimeout(() => {
                                                    setRebalanceStatus('complete');
                                                    toast.success("Rebalance complete. Orders filled via TWAP.");
                                                    setTimeout(() => {
                                                        setShowExecutionModal(false);
                                                        setRebalanceStatus('idle');
                                                    }, 2000);
                                                }, 6000);
                                            }}
                                            className="w-full py-4 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black rounded-xl transition-colors uppercase tracking-widest text-xs"
                                        >
                                            CONFIRM REBALANCE
                                        </button>
                                    </>
                                ) : (
                                    <div className="space-y-6 mb-4">
                                        <div className="w-full h-2 bg-slate-800 rounded-full overflow-hidden">
                                            <motion.div 
                                                className="h-full bg-emerald-500"
                                                initial={{ width: 0 }}
                                                animate={{ width: `${executionProgress}%` }}
                                                transition={{ duration: 0.5 }}
                                            />
                                        </div>
                                        
                                        <div className="space-y-3">
                                            {[
                                                { label: "Neural Route Optimization", time: "est. 12s" },
                                                { label: "Executing Limit Orders (TWAP)", time: "est. 45m" },
                                                { label: "Validating Blockchain Confirmations", time: "est. 3m" },
                                                { label: "Finalizing Vault Deposits", time: "est. 1s" }
                                            ].map((step, idx) => (
                                                <div key={idx} className={`flex justify-between items-center pb-2 border-b border-slate-800 ${currentExecutionStep > idx ? 'text-emerald-400' : currentExecutionStep === idx ? 'text-white' : 'text-slate-600'}`}>
                                                    <div className="flex items-center gap-2">
                                                        {currentExecutionStep > idx ? (
                                                            <CheckCircle2 className="w-4 h-4" />
                                                        ) : currentExecutionStep === idx ? (
                                                            <Loader2 className="w-4 h-4 animate-spin" />
                                                        ) : (
                                                            <div className="w-4 h-4 rounded-full border border-slate-700" />
                                                        )}
                                                        <span className="font-bold text-xs uppercase tracking-widest">{step.label}</span>
                                                    </div>
                                                    <span className="font-mono text-xs">{step.time}</span>
                                                </div>
                                            ))}
                                        </div>
                                        
                                        {rebalanceStatus === 'complete' && (
                                            <div className="p-4 bg-emerald-500/10 border border-emerald-500/30 rounded-xl text-center">
                                                <p className="text-emerald-400 font-bold uppercase tracking-widest text-xs">Rebalance Finished Successfully</p>
                                            </div>
                                        )}
                                    </div>
                                )}
                            </div>
                        </div>
                    )}"""

content = content.replace(modal_code_old, modal_code_new)

with open('src/components/bank/EToroApp.tsx', 'w') as f:
    f.write(content)

