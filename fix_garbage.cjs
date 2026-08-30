const fs = require('fs');

const content = fs.readFileSync('src/components/bank/ValourianDashboard.tsx', 'utf8');
const lines = content.split('\n');

let safeLines = [];
for (let line of lines) {
    if (line.includes('w-full bg-slate-950 border border-x')) {
        // Skip this line!
        continue;
    }
    if (line.includes('Wpvuy')) {
        continue;
    }
    safeLines.push(line);
}

fs.writeFileSync('src/components/bank/ValourianDashboard.tsx', safeLines.join('\n'));
