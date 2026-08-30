const fs = require('fs');

let content = fs.readFileSync('src/components/bank/SovereignLogisticsTab.tsx', 'utf8');
content = content.replace(/\\\`/g, '`');
content = content.replace(/\\\$/g, '$');
fs.writeFileSync('src/components/bank/SovereignLogisticsTab.tsx', content);
