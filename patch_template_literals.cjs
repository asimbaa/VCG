const fs = require('fs');

let content = fs.readFileSync('src/components/bank/GlobalTreasuryTab.tsx', 'utf8');

// Fix the template literals which were accidentally double-escaped or malformed
content = content.replace(
  'return \\`$\\${(value / 1000000000000).toFixed(2)}T\\`;',
  'return `$${(value / 1000000000000).toFixed(2)}T`;'
);

content = content.replace(/\\\`/g, '`');
content = content.replace(/\\\$/g, '$');
// But if it replaced `$${`, make sure it stays correct.

fs.writeFileSync('src/components/bank/GlobalTreasuryTab.tsx', content);
