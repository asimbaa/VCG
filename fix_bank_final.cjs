const fs = require('fs');
let content = fs.readFileSync('src/components/bank/BankDashboard.tsx', 'utf8');

const target = '  return (\n    <div className="w-full mx-auto space-y-8 relative">';
const replacement = '  return (\n    <>\n      <PaymentStatusOverlay />\n    <div className="w-full mx-auto space-y-8 relative">';

if (content.includes(target)) {
  content = content.replace(target, replacement);
  console.log('Replaced correctly!');
} else {
  console.log('Target not found!');
}

fs.writeFileSync('src/components/bank/BankDashboard.tsx', content);
