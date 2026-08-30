const fs = require('fs');
let content = fs.readFileSync('src/components/bank/ValourianDashboard.tsx', 'utf8');

content = content.replace(
  '    return (\n    <>\n      <PaymentStatusOverlay />) => unsubscribe();',
  '    return () => unsubscribe();'
);

fs.writeFileSync('src/components/bank/ValourianDashboard.tsx', content);
