const fs = require('fs');
let content = fs.readFileSync('src/components/bank/BankDashboard.tsx', 'utf8');

const hook = `<h2 className="text-4xl md:text-5xl font-black text-slate-900 tracking-tighter mb-4">
              CommBank <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-500 to-[#ffcc00]">VIP Status</span>
            </h2>`;
            
const newHook = `<h2 className="text-5xl md:text-6xl font-black text-slate-900 tracking-tighter mb-4">
              CommBank <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#ffcc00] to-amber-600 drop-shadow-sm">Sovereign VIP</span>
            </h2>`;

content = content.replace(hook, newHook);

const hook2 = `<div className="text-[10px] font-black uppercase tracking-[0.3em] text-blue-400 leading-none mb-1.5 underline decoration-blue-500/50 underline-offset-4">
            Sovereign Core
          </div>`;
          
const newHook2 = `<div className="text-[10px] font-black uppercase tracking-[0.3em] text-blue-400 leading-none mb-1.5 flex items-center gap-2">
            <span className="w-1.5 h-1.5 rounded-full bg-blue-500 animate-pulse"></span> SOVEREIGN CORE
          </div>`;
          
content = content.replace(hook2, newHook2);

fs.writeFileSync('src/components/bank/BankDashboard.tsx', content);
console.log("BankDashboard updated");
