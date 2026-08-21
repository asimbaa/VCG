const fs = require('fs');
let content = fs.readFileSync('src/components/bank/ValourianDashboard.tsx', 'utf8');

const target = `<h3 className="text-xl font-bold tracking-tight text-slate-900">
                    Card Credentials
                  </h3>`;

const repl = `<h3 className="text-xl font-bold tracking-tight text-slate-900">
                    Card Credentials
                  </h3>
                  <div className="absolute top-6 left-1/2 -translate-x-1/2 bg-emerald-500/10 text-emerald-600 border border-emerald-500/20 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest flex items-center gap-1.5 whitespace-nowrap">
                    <CheckCircle2 className="w-3 h-3" /> Globally Accepted (Visa/MC/Amex/Beam)
                  </div>`;

if(content.includes(target)) {
  content = content.replace(target, repl);
  fs.writeFileSync('src/components/bank/ValourianDashboard.tsx', content);
  console.log("ValourianDashboard card modal patched.");
}

let contentBank = fs.readFileSync('src/components/bank/BankDashboard.tsx', 'utf8');
if(contentBank.includes(target)) {
  contentBank = contentBank.replace(target, repl);
  fs.writeFileSync('src/components/bank/BankDashboard.tsx', contentBank);
  console.log("BankDashboard card modal patched.");
}
