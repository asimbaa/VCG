const fs = require('fs');
let content = fs.readFileSync('src/components/bank/BlackCardsController.tsx', 'utf8');

const target = `<div className="mt-8 pt-8 border-t border-white/10">`;
const replacement = `<div className="mt-8 pt-8 border-t border-white/10">
          <div className="bg-slate-900 border border-slate-700/50 rounded-2xl p-6 mb-8 relative overflow-hidden">
             <div className="absolute top-0 right-0 bg-emerald-600 text-white text-[9px] font-black uppercase px-3 py-1 rounded-bl-lg tracking-widest z-10 shadow-xl">
                 Manufacturing Pipeline Active
             </div>
             <h3 className="text-lg font-bold text-white mb-2 flex items-center gap-2 relative z-10"><Settings className="w-5 h-5 text-emerald-400" /> Physical Card Outsourcing & Issuance</h3>
             <p className="text-sm text-slate-400 mb-4 relative z-10">Global manufacturing partnership with Gemalto/Thales secured for 25-100+ years of unyielding physical card supremacy. Solid Titanium and Tungsten Valourian Black Cards are currently in production for Director accounts.</p>
             <div className="grid grid-cols-1 md:grid-cols-3 gap-4 relative z-10">
                 <div className="bg-slate-950 p-4 rounded-xl border border-white/5">
                     <div className="text-[10px] uppercase font-black text-slate-500 mb-1">Batch 001-A (Directors)</div>
                     <div className="text-white font-mono text-sm">200 Titanium Cards</div>
                     <div className="text-emerald-400 text-xs mt-1">Status: En Route (Sydney)</div>
                 </div>
                 <div className="bg-slate-950 p-4 rounded-xl border border-white/5">
                     <div className="text-[10px] uppercase font-black text-slate-500 mb-1">Batch 002-B (Enterprise)</div>
                     <div className="text-white font-mono text-sm">10,000 Tungsten Cards</div>
                     <div className="text-amber-400 text-xs mt-1">Status: Forging</div>
                 </div>
                 <div className="bg-slate-950 p-4 rounded-xl border border-white/5 flex flex-col justify-center">
                     <button onClick={() => toast.success("Manufacturing Order Sent! Physical card forging initiated.")} className="w-full bg-emerald-600 hover:bg-emerald-500 text-white font-bold py-2 rounded-lg text-xs uppercase tracking-wider flex items-center justify-center gap-2 transition-colors">
                        <Plus className="w-4 h-4"/> Order New Batch
                     </button>
                 </div>
             </div>
             
             {/* Decorative Background Card */}
             <div className="absolute -right-10 -bottom-10 w-64 h-40 bg-gradient-to-br from-slate-800 to-black rounded-xl border border-slate-700/30 shadow-2xl transform rotate-12 opacity-40 pointer-events-none flex items-center justify-center">
                <div className="w-10 h-10 bg-slate-600/30 rounded-full" />
             </div>
          </div>`;

content = content.replace(target, replacement);

fs.writeFileSync('src/components/bank/BlackCardsController.tsx', content);
