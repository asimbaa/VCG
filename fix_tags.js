const fs = require('fs');
const content = fs.readFileSync('/src/components/bank/BankDashboard.tsx', 'utf8');
const lines = content.split('\n');
const lineIndex = lines.findIndex((l, i) => i > 4000 && i < 5000 && l.trim() === '</div>' && (lines[i + 2] || '').includes('space-y-6'));
if (lineIndex !== -1) {
    console.log('Found extra div at line', lineIndex + 1);
    lines.splice(lineIndex, 1);
    fs.writeFileSync('/src/components/bank/BankDashboard.tsx', lines.join('\n'));
} else {
    console.log('Extra div not found');
}
