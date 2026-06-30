const fs = require('fs');

let code = fs.readFileSync('src/components/bank/BankDashboard.tsx', 'utf-8');

const lines = code.split('\n');
const fixedLines = [];
let removed = 0;
for (let i = 0; i < lines.length; i++) {
   if (i >= 5670 && i <= 5690) {
       if (lines[i].includes('</div>')) {
           removed++;
           if(removed > 3) continue; // Keep exactly 3 closing tags. Wait, how many are needed? 3.
       }
   }
   fixedLines.push(lines[i]);
}

fs.writeFileSync('src/components/bank/BankDashboard.tsx', fixedLines.join('\n'));
