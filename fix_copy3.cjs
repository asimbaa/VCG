const fs = require('fs');

let content = fs.readFileSync('src/components/bank/ValourianDashboard.tsx', 'utf8');
content = content.replace(
  '{card.fullNumber || card.number || `5119 3988 4562 ${card.last4}`}',
  '{card.fullNumber || card.number || `5119 3988 4562 ${card.last4}`}'
);

fs.writeFileSync('src/components/bank/ValourianDashboard.tsx', content);
