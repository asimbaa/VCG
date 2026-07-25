import re

with open('src/components/bank/EToroApp.tsx', 'r') as f:
    content = f.read()

target = """                <div className="bg-slate-950 rounded-2xl p-6 border border-slate-800 mt-6">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${aiEnabled ? 'bg-emerald-500/20 border border-emerald-500/30' : 'bg-slate-800 border border-slate-700'}`}>"""

replace = """                {/* Automated Crypto Rebalancing Strategy Widget */}
                <div className="bg-slate-950 rounded-2xl p-6 border border-slate-800 mt-6 relative overflow-hidden">
                   <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/10 rounded-full blur-[40px] -mr-16 -mt-16 pointer-events-none"></div>
                   <div className="flex items-center gap-3 mb-6">
                     <div className="w-10 h-10 rounded-xl bg-blue-500/20 border border-blue-500/30 flex items-center justify-center">
                       <BarChart2 className="w-5 h-5 text-blue-400" />
                     </div>
                     <div>
                       <h3 className="text-lg font-black text-white">Custom Rebalancing Strategies</h3>
                       <p className="text-xs text-blue-400/80 uppercase tracking-widest font-bold">Automated Allocation Rules</p>
                     </div>
                   </div>
                   
                   <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                     <div className="bg-slate-900 rounded-xl p-4 border border-slate-800">
                       <label className="block text-[10px] font-black uppercase tracking-widest text-slate-500 mb-2">Target BTC Allocation (%)</label>
                       <input 
                         type="number" 
                         defaultValue={60}
                         className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 font-semibold text-white focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors"
                       />
                     </div>
                     <div className="bg-slate-900 rounded-xl p-4 border border-slate-800">
                       <label className="block text-[10px] font-black uppercase tracking-widest text-slate-500 mb-2">Threshold Deviation (%)</label>
                       <input 
                         type="number" 
                         defaultValue={5}
                         className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 font-semibold text-white focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors"
                       />
                     </div>
                   </div>
                   
                   <button 
                     onClick={() => toast.success("Custom rebalancing strategy saved and deployed to execution engine.")}
                     className="w-full bg-blue-600 hover:bg-blue-500 text-white font-black uppercase tracking-widest py-3 rounded-xl transition-colors text-xs"
                   >
                     Save & Deploy Strategy
                   </button>
                </div>

                <div className="bg-slate-950 rounded-2xl p-6 border border-slate-800 mt-6">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${aiEnabled ? 'bg-emerald-500/20 border border-emerald-500/30' : 'bg-slate-800 border border-slate-700'}`}>"""

if "Custom Rebalancing Strategies" not in content:
    content = content.replace("import { CryptoPortfolioWidget } from './CryptoPortfolioWidget';", "import { CryptoPortfolioWidget } from './CryptoPortfolioWidget';\nimport { BarChart2 } from 'lucide-react';")
    content = content.replace(target, replace)
    with open('src/components/bank/EToroApp.tsx', 'w') as f:
        f.write(content)

