const fs = require('fs');
let content = fs.readFileSync('src/components/bank/ValourianDashboard.tsx', 'utf8');

content = content.replace(
  '{ id: "store", label: "Apple Store", icon: ShoppingBag }',
  '{ id: "store", label: "Sovereign Marketplace", icon: ShoppingBag }'
);

fs.writeFileSync('src/components/bank/ValourianDashboard.tsx', content);
