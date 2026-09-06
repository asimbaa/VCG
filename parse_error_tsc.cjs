const fs = require('fs');
const code = fs.readFileSync('src/components/bank/AuraDriveMap.tsx', 'utf8');

const lines = code.split('\n');
console.log(lines[312]);
