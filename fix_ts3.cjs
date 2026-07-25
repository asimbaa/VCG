const fs = require('fs');
let content = fs.readFileSync('src/components/bank/UberEatsApp.tsx', 'utf8');

const oldStr = `export function D3ProgressBar({ progress, status, secondsRemaining }: {
  progress: number;
  status: 'ordered' | 'preparing' | 'transit' | 'delivered';
})`;

const newStr = `export function D3ProgressBar({ progress, status, secondsRemaining }: {
  progress: number;
  status: 'ordered' | 'preparing' | 'transit' | 'delivered';
  secondsRemaining?: number;
})`;

content = content.replace(oldStr, newStr);

fs.writeFileSync('src/components/bank/UberEatsApp.tsx', content);
