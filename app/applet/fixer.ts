import fs from 'fs';

let code = fs.readFileSync('src/components/bank/BankDashboard.tsx', 'utf-8');

// I will remove the extra div tags between 5675 and 5686
const lines = code.split('\n');
const fixedLines = [];
for (let i = 0; i < lines.length; i++) {
   if (i >= 5676 && i <= 5686) {
       if (lines[i].trim() === '</div>') {
           continue; // skip extra closing tags
       }
   }
   fixedLines.push(lines[i]);
}

fs.writeFileSync('src/components/bank/BankDashboard.tsx', fixedLines.join('\n'));
