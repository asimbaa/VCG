const fs = require('fs');
let content = fs.readFileSync('src/components/bank/ValourianDashboard.tsx', 'utf8');

// The BrainCircuit button in ValourianDashboard
content = content.replace(
  'className="fixed bottom-6 right-6 z-[100] bg-slate-900',
  'className="hidden fixed bottom-6 right-6 z-[100] bg-slate-900'
);

// The Bell button in ValourianDashboard
content = content.replace(
  'className="fixed bottom-8 right-8 z-[100] w-14 h-14',
  'className="hidden fixed bottom-8 right-8 z-[100] w-14 h-14'
);

fs.writeFileSync('src/components/bank/ValourianDashboard.tsx', content);
