const fs = require('fs');
let code = fs.readFileSync('src/components/bank/ValourianDashboard.tsx', 'utf8');

const lines = code.split('\n');
const lineNum = lines.findIndex(l => l.includes('const DirectorVaultModal'));
console.log(lineNum);
