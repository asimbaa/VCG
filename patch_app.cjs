const fs = require('fs');
let content = fs.readFileSync('src/App.tsx', 'utf8');

const hook = `              <div className="flex items-center">
                <div className="w-10 h-10 bg-[#ffcc00] rounded-xl flex items-center justify-center shadow-lg shadow-[#ffcc00]/20 border border-[#ffcc00]/50">
                  <ShieldCheck className="w-6 h-6 text-slate-900" />
                </div>
                <div className="ml-3 flex flex-col">
                  <h1 className="text-xl font-black italic tracking-tighter text-white leading-none">
                    SOVEREIGN<span className="text-[#ffcc00]">OS</span>
                  </h1>
                  <span className="text-[9px] uppercase tracking-[0.2em] text-slate-400 font-bold">Apex Administration</span>
                </div>`;
                
const newHook = `              <div className="flex items-center group cursor-pointer hover:opacity-90 transition-opacity">
                <div className="w-10 h-10 bg-gradient-to-br from-[#ffcc00] to-amber-600 rounded-xl flex items-center justify-center shadow-[0_0_15px_rgba(255,204,0,0.3)] border border-[#ffcc00]/50 group-hover:scale-105 transition-transform">
                  <ShieldCheck className="w-6 h-6 text-slate-900" />
                </div>
                <div className="ml-3 flex flex-col">
                  <h1 className="text-2xl font-black italic tracking-tighter text-white leading-none drop-shadow-md">
                    SOVEREIGN<span className="text-[#ffcc00]">OS</span>
                  </h1>
                  <span className="text-[9px] uppercase tracking-[0.2em] text-emerald-400 font-bold animate-pulse mt-0.5">Apex Administration Active</span>
                </div>`;

content = content.replace(hook, newHook);
fs.writeFileSync('src/App.tsx', content);
console.log("App.tsx refined");
