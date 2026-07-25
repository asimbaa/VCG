const fs = require('fs');

const path = './src/App.tsx';
let content = fs.readFileSync(path, 'utf8');

const targetStr = `                <h1 className="text-xl font-black tracking-tight text-slate-900 hidden sm:block uppercase">
                  Valourian Capital
                </h1>`;

const injection = `                <h1 className="text-xl font-black tracking-tight text-slate-900 hidden sm:block uppercase">
                  Valourian Capital
                </h1>
                <div className="hidden lg:flex items-center gap-1.5 px-2 py-1 ml-2 bg-emerald-50 border border-emerald-200 rounded-md">
                  <Sparkles className="w-3 h-3 text-emerald-600 animate-pulse" />
                  <span className="text-[10px] font-black uppercase text-emerald-800 tracking-widest">Neural Link Enabled</span>
                </div>`;

content = content.replace(targetStr, injection);
fs.writeFileSync(path, content);
console.log("Badge added to App.tsx");
