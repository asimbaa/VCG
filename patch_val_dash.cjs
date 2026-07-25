const fs = require('fs');
let content = fs.readFileSync('src/components/bank/ValourianDashboard.tsx', 'utf8');

const hook = `              <h2 className="text-3xl font-black italic tracking-tighter uppercase">
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-indigo-500">Valourian</span> Capital
              </h2>`;
              
const newHook = `              <h2 className="text-4xl font-black italic tracking-tighter uppercase drop-shadow-lg">
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-indigo-400">Valourian</span> Capital
              </h2>`;

content = content.replace(hook, newHook);

const hook2 = `          <p className="text-slate-400 max-w-xl text-sm font-medium leading-relaxed">
            Sovereign multi-currency liquidity pool. All assets are cryptographically secured and insured by Valourian Global Treasury via Deep Tech override protocols.
          </p>`;
          
const newHook2 = `          <p className="text-slate-400 max-w-xl text-sm font-medium leading-relaxed border-l-2 border-indigo-500 pl-4 py-1">
            Sovereign multi-currency liquidity pool. All assets are cryptographically secured and insured by Valourian Global Treasury via Deep Tech override protocols.
          </p>`;
          
content = content.replace(hook2, newHook2);

fs.writeFileSync('src/components/bank/ValourianDashboard.tsx', content);
console.log("ValourianDashboard refined");
