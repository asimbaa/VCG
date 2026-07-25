import re

with open('src/components/bank/SovereignLogisticsDashboard.tsx', 'r') as f:
    content = f.read()

target = """             {/* Overlay UI */}
             <div className="absolute top-6 left-6 right-6 z-[400] flex justify-between pointer-events-none">
               <div className="bg-white/90 backdrop-blur-md px-6 py-4 rounded-2xl shadow-xl border border-slate-200 pointer-events-auto">
                 <h3 className="text-xs font-black uppercase tracking-widest text-slate-900 mb-1">Active Transit: Chatswood to Artarmon Hub</h3>
                 <p className="text-xs font-semibold text-emerald-600 flex items-center gap-2">
                   <div className="w-2 h-2 bg-emerald-500 rounded-full animate-ping" />
                   GPS Tracked • Armored Escort
                 </p>
               </div>
             </div>"""

replace = """             {/* Overlay UI */}
             <div className="absolute top-6 left-6 right-6 z-[400] flex flex-col md:flex-row justify-between items-start md:items-center gap-4 pointer-events-none">
               <div className="bg-white/90 backdrop-blur-md px-6 py-4 rounded-2xl shadow-xl border border-slate-200 pointer-events-auto flex items-center gap-6">
                 <div>
                   <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500 mb-1">Tracking ID</h3>
                   <p className="text-sm font-bold text-slate-900 font-mono">VAL-9942-8812-XC</p>
                 </div>
                 <div className="w-px h-10 bg-slate-200"></div>
                 <div>
                   <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500 mb-1">Delivery Status</h3>
                   <p className="text-sm font-bold text-emerald-600 flex items-center gap-2">
                     <span className="w-2 h-2 bg-emerald-500 rounded-full animate-ping" />
                     In Transit
                   </p>
                 </div>
                 <div className="w-px h-10 bg-slate-200"></div>
                 <div>
                   <h3 className="text-xs font-black uppercase tracking-widest text-slate-900 mb-1">Active Transit</h3>
                   <p className="text-xs font-semibold text-slate-600">Chatswood <span className="mx-1">→</span> Artarmon Hub</p>
                 </div>
               </div>
               <button 
                 className="pointer-events-auto bg-slate-900 text-white hover:bg-black px-6 py-3 rounded-xl font-black uppercase tracking-widest text-[10px] shadow-lg flex items-center gap-2 transition-all"
                 onClick={() => {
                   toast.success("Re-routing sequence initiated. The Sovereign Fleet is calculating the optimal secure vector.");
                 }}
               >
                 <Navigation className="w-4 h-4" />
                 Initiate Re-route
               </button>
             </div>"""

if "Tracking ID" not in content:
    content = content.replace(target, replace)
    
with open('src/components/bank/SovereignLogisticsDashboard.tsx', 'w') as f:
    f.write(content)
