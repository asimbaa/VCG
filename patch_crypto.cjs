const fs = require('fs');
let file = fs.readFileSync('src/components/bank/CryptoPortfolio.tsx', 'utf8');

const yieldBlock = `
                    <div className="bg-slate-800/40 border border-slate-700/50 rounded-2xl p-6 relative overflow-hidden">
                        <div className="absolute top-0 right-0 w-32 h-32 bg-purple-500/10 blur-[50px] rounded-full pointer-events-none" />
                        <div className="flex items-center justify-between mb-4">
                            <h3 className="text-sm font-black text-white uppercase tracking-widest flex items-center gap-2">
                                <Zap className="w-4 h-4 text-purple-400" />
                                Algorithmic Yield Farming
                            </h3>
                            <div className="flex items-center gap-2 text-[10px] text-emerald-400 font-bold bg-emerald-500/10 px-2 py-1 rounded-md border border-emerald-500/20">
                                <Activity className="w-3 h-3 animate-pulse" /> LIVE ACCUMULATION
                            </div>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            {[{ asset: 'BTC', apy: '4.2%', earned: '0.0412 BTC' }, { asset: 'ETH', apy: '8.5%', earned: '1.24 ETH' }, { asset: 'USDC', apy: '12.0%', earned: '$14,500.00' }].map((farm, i) => (
                                <div key={i} className="bg-slate-900/80 p-4 rounded-xl border border-slate-800 flex flex-col gap-1 hover:border-purple-500/30 transition-colors">
                                    <div className="flex justify-between items-center text-xs font-bold">
                                        <span className="text-slate-300">{farm.asset} Liquidity Pool</span>
                                        <span className="text-purple-400">{farm.apy} APY</span>
                                    </div>
                                    <div className="text-lg font-black text-white mt-1">+{farm.earned}</div>
                                    <div className="text-[10px] text-slate-500 uppercase tracking-widest">Auto-Compounding</div>
                                </div>
                            ))}
                        </div>
                    </div>
`;

if (!file.includes('Algorithmic Yield Farming')) {
    file = file.replace(
        'import {',
        'import { Zap, '
    );
    file = file.replace(
        '<div className="bg-slate-800/40 p-6 rounded-2xl border border-slate-700 h-80">',
        yieldBlock + '\n                    <div className="mt-8 bg-slate-800/40 p-6 rounded-2xl border border-slate-700 h-80">'
    );
}

fs.writeFileSync('src/components/bank/CryptoPortfolio.tsx', file);
