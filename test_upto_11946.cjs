const fs = require('fs');
let code = fs.readFileSync('src/components/bank/ValourianDashboard.tsx', 'utf8');
const lines = code.split('\n');
code = lines.slice(0, 11946).join('\n');

let noStrings = code.replace(/"(?:[^"\\]|\\.)*"/g, '""')
                    .replace(/'(?:[^'\\]|\\.)*'/g, "''")
                    .replace(/`(?:[^`\\]|\\.)*`/g, "``");
noStrings = noStrings.replace(/\/\*[\s\S]*?\*\//g, '');
noStrings = noStrings.replace(/\/\/.*/g, '');

const openB = (noStrings.match(/\{/g) || []).length;
const closeB = (noStrings.match(/\}/g) || []).length;
const openP = (noStrings.match(/\(/g) || []).length;
const closeP = (noStrings.match(/\)/g) || []).length;

console.log(`Upto 11946: B_Diff=${openB - closeB}, P_Diff=${openP - closeP}`);
