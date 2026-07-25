const fs = require('fs');
let content = fs.readFileSync('src/components/bank/UberEatsApp.tsx', 'utf8');
content = content.replace('  secondsRemaining?: number;\n  progress: number;\n  secondsRemaining: number;', '  progress: number;\n  secondsRemaining: number;');
fs.writeFileSync('src/components/bank/UberEatsApp.tsx', content);
