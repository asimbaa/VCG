const fs = require('fs');
let content = fs.readFileSync('src/components/bank/ValourianDashboard.tsx', 'utf8');

// The suspense replacement earlier corrupted the ternary
// Let's find exactly what we did and reverse it, then do it correctly.

content = content.replace(
  /<React\.Suspense fallback=\{\s*<div className="flex items-center justify-center w-full h-96 bg-slate-50\/50 rounded-3xl border border-slate-100">\s*<div className="flex flex-col items-center gap-4">\s*<div className="w-12 h-12 rounded-full border-4 border-indigo-200 border-t-indigo-600 animate-spin" \/>\s*<div className="text-slate-400 font-mono text-sm tracking-widest uppercase">Initializing Module...<\/div>\s*<\/div>\s*<\/div>\s*\}\>\s*\{activeTab === "send" \? \(/,
  `{activeTab === "send" ? (`
);

content = content.replace(
  /<\/React\.Suspense>\s*\{activeTab === "treasury" && \(/,
  `) : activeTab === "treasury" ? (`
);

// Now wrap the entire <AnimatePresence> children with React.Suspense
const animateStart = /<AnimatePresence mode="wait">/;
const newAnimateStart = `<AnimatePresence mode="wait">
        <React.Suspense fallback={
            <div className="flex items-center justify-center w-full h-96 bg-slate-50/50 rounded-3xl border border-slate-100 shadow-sm animate-in fade-in">
               <div className="flex flex-col items-center gap-4">
                  <div className="w-12 h-12 rounded-full border-4 border-indigo-200 border-t-indigo-600 animate-spin" />
                  <div className="text-slate-400 font-mono text-xs tracking-widest uppercase font-bold">Instantiating Module Workspace</div>
               </div>
            </div>
          }>`;

content = content.replace(animateStart, newAnimateStart);

const animateEnd = /<\/AnimatePresence>/;
const newAnimateEnd = `</React.Suspense>
          </AnimatePresence>`;

content = content.replace(animateEnd, newAnimateEnd);

fs.writeFileSync('src/components/bank/ValourianDashboard.tsx', content);
