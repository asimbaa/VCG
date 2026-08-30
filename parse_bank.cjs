const fs = require('fs');
let content = fs.readFileSync('src/components/bank/BankDashboard.tsx', 'utf8');

// Find all functions and returns
const lines = content.split('\n');
lines.forEach((line, i) => {
  if (line.includes('export function') || line.includes('const DashboardFooter') || line.includes('return (')) {
    console.log(`${i + 1}: ${line}`);
  }
});
