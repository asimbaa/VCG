const fs = require('fs');

let content = fs.readFileSync('src/components/bank/ValourianStrategicAssets.tsx', 'utf8');

const hook = `              <div key={asset.id} className="bg-slate-900/80 backdrop-blur-sm border border-slate-800 rounded-3xl p-6 hover:bg-slate-800 transition-colors group relative overflow-hidden flex flex-col justify-between">`;
const newHook = `              <div key={asset.id} className="bg-slate-900/80 backdrop-blur-sm border border-slate-800 rounded-3xl p-6 hover:bg-slate-800 transition-all duration-500 hover:-translate-y-2 hover:shadow-[0_10px_40px_-10px_rgba(16,185,129,0.1)] group relative overflow-hidden flex flex-col justify-between">`;

content = content.replace(hook, newHook);

fs.writeFileSync('src/components/bank/ValourianStrategicAssets.tsx', content);
console.log("ValourianStrategicAssets improved");
