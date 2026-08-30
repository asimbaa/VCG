const fs = require('fs');
let code = fs.readFileSync('src/components/bank/ValourianDashboard.tsx', 'utf8');

const replacement = `<div className="mt-4 pt-4 border-t border-slate-700 text-xs text-slate-400">
                                <div className="flex justify-between mb-1"><span>Gold/Platinum Vault</span> <span className="text-white">$85.2M</span></div>
                                <div className="flex justify-between mb-1"><span>Uranium/Nuclear Tech</span> <span className="text-white">$110.0M</span></div>
                                <div className="flex justify-between"><span>Copper/Silver (Electrification)</span> <span className="text-white">$85.3M</span></div>
                            </div>
                        </div>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
                        <div className="bg-slate-800/40 p-6 rounded-2xl border border-slate-700">
                            <h3 className="text-xl font-bold mb-4 flex items-center gap-2"><div className="w-8 h-8 rounded bg-blue-500/10 flex items-center justify-center border border-blue-500/20 text-blue-400">🌍</div> Top 12 Global Tech & Finance</h3>
                            <div className="text-3xl font-black text-white">$1,200,000,000.00</div>
                            <div className="text-emerald-400 text-sm font-bold mt-1">+11.4% (YTD)</div>
                            <div className="mt-4 pt-4 border-t border-slate-700">
                                <span className="text-xs text-slate-400">Recently increased stakes by $100M each across: AAPL, MSFT, TSLA, GOOGL, AMZN, NVDA, META, AVGO, LLY, TSM, BRK.B, JPM. <strong>100% Highly Liquid / Cleared for AU Cash-out.</strong></span>
                            </div>
                        </div>
                        
                        <div className="bg-slate-800/40 p-6 rounded-2xl border border-slate-700">
                            <h3 className="text-xl font-bold mb-4 flex items-center gap-2"><div className="w-8 h-8 rounded bg-emerald-500/10 flex items-center justify-center border border-emerald-500/20 text-emerald-400">🛰️</div> SpaceX Orbital Constellation</h3>
                            <div className="text-3xl font-black text-white">$450,000,000,000.00</div>
                            <div className="text-emerald-400 text-sm font-bold mt-1">+45.2% (YTD)</div>
                            <div className="mt-4 pt-4 border-t border-slate-700 text-xs text-slate-400">
                                <span className="text-xs text-slate-400">Full administrative override on Starlink satellite networks. Valuation secured via Sovereign Vault.</span>
                            </div>
                        </div>
                    </div>`;

code = code.replace(`<div className="mt-4 pt-4 border-t border-slate-700 text-xs text-slate-400">
                                <div className="flex justify-between mb-1"><span>Gold/Platinum Vault</span> <span className="text-white">$85.2M</span></div>
                                <div className="flex justify-between mb-1"><span>Uranium/Nuclear Tech</span> <span className="text-white">$110.0M</span></div>
                                <div className="flex justify-between"><span>Copper/Silver (Electrification)</span> <span className="text-white">$85.3M</span></div>
                            </div>
                        </div>
                    </div>`, replacement);

fs.writeFileSync('src/components/bank/ValourianDashboard.tsx', code);
console.log("Patched ValourianDashboard.tsx");
