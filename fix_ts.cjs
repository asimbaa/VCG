const fs = require('fs');
let content = fs.readFileSync('src/components/bank/UberEatsApp.tsx', 'utf8');

// Fix window timeout
content = content.replace(/window\.addressSearchTimeout/g, '(window as any).addressSearchTimeout');

// Let's check secondsRemaining at line 156
// It might be a type definition issue
// I'll just write it back
fs.writeFileSync('src/components/bank/UberEatsApp.tsx', content);
