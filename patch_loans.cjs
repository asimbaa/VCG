const fs = require('fs');
let file = fs.readFileSync('src/components/bank/ValourianDashboard.tsx', 'utf8');

file = file.replace(
    'className="absolute left-0 right-0 top-full mt-1 bg-white border border-slate-200 rounded-xl shadow-lg z-50 overflow-hidden"',
    'className="absolute left-0 right-0 top-full mt-1 bg-white border border-slate-200 rounded-xl shadow-xl z-[999] max-h-64 overflow-y-auto"'
);

file = file.replace(
    'className="w-24 px-3 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none font-medium"',
    'className="w-24 px-3 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none font-medium cursor-pointer"'
);

fs.writeFileSync('src/components/bank/ValourianDashboard.tsx', file);
console.log("Fixed ValourianDashboard loans css");

let file2 = fs.readFileSync('src/components/bank/BankDashboard.tsx', 'utf8');

file2 = file2.replace(
    'className="absolute left-0 right-0 top-full mt-1 bg-white border border-slate-200 rounded-xl shadow-lg z-50 overflow-hidden"',
    'className="absolute left-0 right-0 top-full mt-1 bg-white border border-slate-200 rounded-xl shadow-xl z-[999] max-h-64 overflow-y-auto"'
);

file2 = file2.replace(
    'className="w-24 px-3 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none font-medium"',
    'className="w-24 px-3 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none font-medium cursor-pointer"'
);

fs.writeFileSync('src/components/bank/BankDashboard.tsx', file2);
console.log("Fixed BankDashboard loans css");
