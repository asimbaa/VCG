const fs = require('fs');
let file = fs.readFileSync('src/components/bank/CryptoPortfolio.tsx', 'utf8');

const yieldBlock = `
      <div className="bg-slate-900 rounded-[2.5rem] p-8 border border-slate-800 shadow-2xl relative overflow-hidden mt-8">
          <div className="absolute top-0 right-0 w-32 h-32 bg-purple-500/10 blur-[50px] rounded-full pointer-events-none" />
          <div className="flex items-center justify-between mb-8 relative z-10">
              <h3 className="text-xl font-black text-white uppercase tracking-widest flex items-center gap-3">
                  <Zap className="w-6 h-6 text-purple-400" />
                  Algorithmic Yield Farming
              </h3>
              <div className="flex items-center gap-2 text-[10px] text-emerald-400 font-bold bg-emerald-500/10 px-3 py-1.5 rounded-full border border-emerald-500/20 shadow-[0_0_15px_rgba(16,185,129,0.2)]">
                  <Activity className="w-3 h-3 animate-pulse" /> LIVE ACCUMULATION
              </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 relative z-10">
              {[{ asset: 'BTC', apy: '4.2%', earned: '0.0412 BTC' }, { asset: 'ETH', apy: '8.5%', earned: '1.24 ETH' }, { asset: 'USDC', apy: '12.0%', earned: '$14,500.00' }].map((farm, i) => (
                  <div key={i} className="bg-slate-950 p-6 rounded-2xl border border-slate-800 flex flex-col gap-2 hover:border-purple-500/30 transition-colors shadow-lg">
                      <div className="flex justify-between items-center text-sm font-bold mb-2">
                          <span className="text-slate-400 uppercase tracking-widest">{farm.asset} Pool</span>
                          <span className="text-purple-400 bg-purple-500/10 px-2 py-0.5 rounded text-xs">{farm.apy} APY</span>
                      </div>
                      <div className="text-3xl font-black text-white">+{farm.earned}</div>
                      <div className="text-[10px] text-emerald-500/80 font-bold uppercase tracking-widest mt-1 flex items-center gap-1">
                          <RefreshCw className="w-3 h-3" /> Auto-Compounding
                      </div>
                  </div>
              ))}
          </div>
      </div>
    </div>
  );
}
`;

if (!file.includes('Algorithmic Yield Farming')) {
    if (!file.includes('Zap,')) {
        file = file.replace('import {', 'import { Zap, ');
    }
    file = file.replace('    </div>\n  );\n}', yieldBlock);
    fs.writeFileSync('src/components/bank/CryptoPortfolio.tsx', file);
    console.log("CryptoPortfolio patched.");
}
