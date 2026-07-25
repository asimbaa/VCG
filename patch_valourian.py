import re

with open("src/components/bank/ValourianDashboard.tsx", "r") as f:
    content = f.read()

# Make the balances 100 Billion
content = content.replace('setTreasuryBalance(98240500);', 'setTreasuryBalance(100000000000);')
content = content.replace('setAvailableCash(25500000);', 'setAvailableCash(100000000000);')

# Add AI button to the navigation
ai_btn = """            <button 
              onClick={() => setActiveTab('aicluster')}
              className={`w-full text-left px-4 py-3 rounded-xl font-bold transition-all flex items-center gap-3 ${activeTab === 'aicluster' ? 'bg-indigo-500/20 text-indigo-400 shadow-sm border border-indigo-500/30' : 'text-slate-400 hover:bg-slate-900 hover:text-slate-200'}`}
            >
              <Cpu className="w-5 h-5" />
              <span className="hidden sm:inline">Deep Space AI</span>
            </button>"""

content = content.replace('            <button \n              onClick={() => setActiveTab(\'capital\')}', ai_btn + '\n            <button \n              onClick={() => setActiveTab(\'capital\')}')


# Add Deep Space AI tab content
ai_content = """        {activeTab === 'aicluster' && (
          <div className="space-y-6">
            <div className="bg-slate-900 rounded-3xl p-8 border border-indigo-500/30 shadow-2xl relative overflow-hidden">
               <div className="absolute inset-0 bg-gradient-to-br from-indigo-900/20 to-purple-900/20 mix-blend-overlay"></div>
               <div className="relative z-10 flex justify-between items-start">
                 <div>
                   <h2 className="text-3xl font-black text-white flex items-center gap-3">
                     <Cpu className="w-8 h-8 text-indigo-400" /> Deep Space Cluster AI
                   </h2>
                   <p className="text-slate-400 mt-2 max-w-xl text-sm leading-relaxed">
                     Omnipotent strategic intelligence overlay. Activating this cluster provides infinite oversight, predictive modeling, and absolute market control.
                   </p>
                 </div>
                 <div className="bg-indigo-500/20 border border-indigo-500/30 px-4 py-2 rounded-xl text-indigo-400 font-bold text-xs uppercase tracking-widest flex items-center gap-2">
                   <div className="w-2 h-2 bg-indigo-400 rounded-full animate-ping"></div> Active
                 </div>
               </div>

               <div className="grid md:grid-cols-3 gap-6 mt-8">
                 <div className="bg-slate-950 rounded-2xl p-5 border border-slate-800">
                   <h4 className="text-slate-400 font-bold text-xs uppercase tracking-widest mb-4">Neural Capacity</h4>
                   <div className="flex items-end justify-between">
                     <span className="text-4xl font-black text-white">99.9%</span>
                     <span className="text-indigo-400 font-bold text-sm">Optimal</span>
                   </div>
                 </div>
                 <div className="bg-slate-950 rounded-2xl p-5 border border-slate-800">
                   <h4 className="text-slate-400 font-bold text-xs uppercase tracking-widest mb-4">Global Reach</h4>
                   <div className="flex items-end justify-between">
                     <span className="text-4xl font-black text-white">100%</span>
                     <span className="text-emerald-400 font-bold text-sm">Omnipresent</span>
                   </div>
                 </div>
                 <div className="bg-slate-950 rounded-2xl p-5 border border-slate-800">
                   <h4 className="text-slate-400 font-bold text-xs uppercase tracking-widest mb-4">Execution Speed</h4>
                   <div className="flex items-end justify-between">
                     <span className="text-4xl font-black text-white">0.01ms</span>
                     <span className="text-indigo-400 font-bold text-sm">Tachyon</span>
                   </div>
                 </div>
               </div>
            </div>
          </div>
        )}"""

content = content.replace("        {activeTab === 'capital' && (", ai_content + "\n        {activeTab === 'capital' && (")

with open("src/components/bank/ValourianDashboard.tsx", "w") as f:
    f.write(content)

print("Valourian dashboard patched.")
