const fs = require('fs');
let content = fs.readFileSync('src/components/bank/VaultRecords.tsx', 'utf8');

content = content.replace(/value: "\{\s*id: "LRS-NSW-009"14,500 AUD",/g, 'value: "$114,500 AUD",');

fs.writeFileSync('src/components/bank/VaultRecords.tsx', content);
