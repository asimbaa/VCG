import re

with open("src/components/bank/EToroApp.tsx", "r") as f:
    content = f.read()

# Add TSLA to holdings
tsla_holding = """                   <div className="bg-slate-800/50 p-4 rounded-xl flex items-center justify-between border border-slate-700">
                      <div className="flex items-center gap-4">
                        <div className="w-10 h-10 bg-slate-900 rounded-lg flex items-center justify-center font-bold text-white">TSLA</div>
                        <div>
                          <div className="text-white font-bold">Tesla Inc.</div>
                          <div className="text-xs text-slate-400">Strategic Allocation (6.9%)</div>
                        </div>
                      </div>
                      <div className="text-right">
                         <div className="text-white font-bold">$125,450,000.00</div>
                         <div className="text-emerald-400 text-xs flex items-center justify-end gap-1"><ArrowUpRight className="w-3 h-3"/> +4.2%</div>
                      </div>
                   </div>
"""
content = content.replace('<div className="bg-slate-800/50 p-4 rounded-xl flex items-center justify-between border border-slate-700">', tsla_holding + '                   <div className="bg-slate-800/50 p-4 rounded-xl flex items-center justify-between border border-slate-700">', 1)

# Add "Asset Transfer" in funding tab
asset_transfer_ui = """                  <div className="bg-slate-950 rounded-2xl p-6 border border-emerald-500/30">
                     <div className="flex items-center gap-3 mb-2">
                        <Globe className="w-5 h-5 text-emerald-400" />
                        <h3 className="text-lg font-black text-white">Strategic Asset Liquidation</h3>
                     </div>
                     <p className="text-xs text-slate-400 mb-6">Transfer sovereign assets (e.g. Tesla, SpaceX) into eToro for immediate liquidation and bank withdrawal.</p>
                     
                     <div className="space-y-4">
                       <div>
                         <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest block mb-1">Asset Allocation</label>
                         <select className="w-full bg-slate-900 border border-slate-700 rounded-xl py-3 px-4 text-white font-semibold">
                             <option>Tesla (TSLA) - 2% Strategic Stake Liquidation</option>
                             <option>SpaceX (SPX) - Secondary Market Offload</option>
                         </select>
                       </div>
                       <div>
                         <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest block mb-1">Destination Bank Account</label>
                         <input type="text" placeholder="e.g. Commonwealth Bank (BSB 062-000)" className="w-full bg-slate-900 border border-slate-700 rounded-xl py-3 px-4 text-white" />
                       </div>
                       <button onClick={() => {
                           setIsFunding(true);
                           toast.success("Initiating 2% TSLA transfer to eToro...", { icon: <Activity className="w-4 h-4 text-emerald-400"/> });
                           setTimeout(() => {
                               toast.success("TSLA shares liquidated at market rate.", { icon: <LineChart className="w-4 h-4 text-emerald-400"/> });
                           }, 2000);
                           setTimeout(() => {
                               toast.success("$2,509,000.00 withdrawn to Commonwealth Bank successfully.", { icon: <DollarSign className="w-4 h-4 text-emerald-400"/> });
                               setIsFunding(false);
                           }, 4000);
                       }} disabled={isFunding} className="w-full py-3 bg-emerald-500/20 hover:bg-emerald-500/30 disabled:opacity-50 text-emerald-400 font-bold rounded-xl transition-colors border border-emerald-500/50 uppercase tracking-widest text-xs">
                         Execute 2% Transfer & Withdraw
                       </button>
                     </div>
                  </div>
"""

content = content.replace('<div className="bg-slate-950 rounded-2xl p-6 border border-slate-800">', asset_transfer_ui + '\n                  <div className="bg-slate-950 rounded-2xl p-6 border border-slate-800">', 1)


with open("src/components/bank/EToroApp.tsx", "w") as f:
    f.write(content)

