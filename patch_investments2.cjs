const fs = require('fs');
let file = fs.readFileSync('src/components/bank/ValourianDashboard.tsx', 'utf8');

// Strategic Equities was missing, I'll inject it safely right before the crypto portfolio logic.
const strategicBlock = `
            ) : activeTab === "strategic_equities" ? (
              <div className="bg-slate-900 rounded-[2.5rem] p-12 text-white relative overflow-hidden shadow-2xl border border-slate-800">
                <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-blue-500/10 blur-[120px] rounded-full -mr-32 -mt-32" />
                <div className="relative z-10 max-w-5xl mx-auto">
                    <h2 className="text-4xl font-black mb-4">Global Strategic Equities</h2>
                    <p className="text-slate-400 mb-10 text-lg">Sovereign Treasury deployments in multi-generational high-yield assets, aerospace, and critical minerals.</p>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
                        <div className="bg-slate-800/40 p-6 rounded-2xl border border-slate-700">
                            <h3 className="text-xl font-bold mb-4 flex items-center gap-2"><div className="w-8 h-8 rounded bg-slate-950 flex items-center justify-center border border-slate-700">🚀</div> SpaceX / Aerospace</h3>
                            <div className="text-3xl font-black text-white">$145,000,000.00</div>
                            <div className="text-emerald-400 text-sm font-bold mt-1">+14.2% (YTD)</div>
                            <div className="mt-4 pt-4 border-t border-slate-700">
                                <span className="text-xs text-slate-400">Class A Private Equity blocks secured via Valourian Master Trust.</span>
                            </div>
                        </div>
                        
                        <div className="bg-slate-800/40 p-6 rounded-2xl border border-slate-700">
                            <h3 className="text-xl font-bold mb-4 flex items-center gap-2"><div className="w-8 h-8 rounded bg-yellow-500/10 flex items-center justify-center border border-yellow-500/20 text-yellow-500">⛏️</div> Critical Minerals & Energy</h3>
                            <div className="text-3xl font-black text-white">$280,500,000.00</div>
                            <div className="text-emerald-400 text-sm font-bold mt-1">+8.7% (YTD)</div>
                            <div className="mt-4 pt-4 border-t border-slate-700 text-xs text-slate-400">
                                <div className="flex justify-between mb-1"><span>Gold/Platinum Vault</span> <span className="text-white">$85.2M</span></div>
                                <div className="flex justify-between mb-1"><span>Uranium/Nuclear Tech</span> <span className="text-white">$110.0M</span></div>
                                <div className="flex justify-between"><span>Copper/Silver (Electrification)</span> <span className="text-white">$85.3M</span></div>
                            </div>
                        </div>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        <div className="bg-slate-800/40 p-6 rounded-2xl border border-slate-700">
                            <h3 className="text-xl font-bold mb-4 flex items-center gap-2"><div className="w-8 h-8 rounded bg-rose-500/10 flex items-center justify-center border border-rose-500/20 text-rose-500">🧬</div> Longevity & Wellness</h3>
                            <div className="text-3xl font-black text-white">$95,000,000.00</div>
                            <div className="text-emerald-400 text-sm font-bold mt-1">+22.4% (YTD)</div>
                            <div className="mt-4 pt-4 border-t border-slate-700">
                                <span className="text-xs text-slate-400">Strategic stakes in advanced biotech, cellular reprogramming, and global wellness infrastructure.</span>
                            </div>
                        </div>
                        
                        <div className="bg-slate-800/40 p-6 rounded-2xl border border-slate-700">
                            <h3 className="text-xl font-bold mb-4 flex items-center gap-2"><div className="w-8 h-8 rounded bg-indigo-500/10 flex items-center justify-center border border-indigo-500/20 text-indigo-400">💎</div> High-Dividend Aristocrats</h3>
                            <div className="text-3xl font-black text-white">$420,000,000.00</div>
                            <div className="text-indigo-400 text-sm font-bold mt-1">6.8% Ann. Yield</div>
                            <div className="mt-4 pt-4 border-t border-slate-700">
                                <span className="text-xs text-slate-400">Stable, century-horizon defensive stocks providing massive recurring liquidity for Sovereign operations.</span>
                            </div>
                        </div>
                    </div>
                </div>
              </div>
`;

if (!file.includes('activeTab === "strategic_equities"')) {
    // Add the tab
    const tabMatch = /{ id: "crypto", label: "Crypto Portfolio", icon: Bitcoin },/g;
    file = file.replace(tabMatch, '{ id: "strategic_equities", label: "Strategic Equities", icon: Landmark },\n                    { id: "crypto", label: "Crypto Portfolio", icon: Bitcoin },');

    // Add the content securely by replacing `) : activeTab === "crypto" ? (` that is located inside the main switch.
    // The previous attempt failed because there are multiple `) : activeTab === "crypto" ? (` inside the code (e.g. for the title icon).
    // Let's specifically target the one with <CryptoPortfolio />
    
    file = file.replace(
        `            ) : activeTab === "crypto" ? (
              <CryptoPortfolio />`, 
        strategicBlock + `\n            ) : activeTab === "crypto" ? (
              <CryptoPortfolio />`
    );
    
    fs.writeFileSync('src/components/bank/ValourianDashboard.tsx', file);
    console.log("Strategic Equities added perfectly.");
}
