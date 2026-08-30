const fs = require('fs');
let content = fs.readFileSync('src/components/bank/BankDashboard.tsx', 'utf8');

const exportIndex = content.indexOf('export function BankDashboard({');
let current = exportIndex;
while (true) {
  const nextReturn = content.indexOf('return (', current);
  if (nextReturn === -1) break;
  // Get 50 chars context around it
  console.log('--- RETURN AT', nextReturn, '---');
  console.log(content.slice(nextReturn - 20, nextReturn + 80));
  current = nextReturn + 8;
  if (current - exportIndex > 50000) break; // limit search
}
