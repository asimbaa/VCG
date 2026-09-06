const fs = require('fs');
const code = fs.readFileSync('src/components/bank/AuraDriveMap.tsx', 'utf8');
const lines = code.split('\n');

for (let i = 310; i <= 316; i++) {
  console.log(`Line ${i+1}: ${lines[i]}`);
}
