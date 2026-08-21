const fs = require('fs');
let file = fs.readFileSync('src/components/bank/SovereignDispatchMonitor.tsx', 'utf8');

file = file.replace(/\\\`/g, '`');
file = file.replace(/\\\$/g, '$');

fs.writeFileSync('src/components/bank/SovereignDispatchMonitor.tsx', file);
console.log("Dispatch Monitor fixed.");
