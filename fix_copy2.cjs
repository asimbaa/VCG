const fs = require('fs');

let content = fs.readFileSync('src/components/bank/ValourianDashboard.tsx', 'utf8');
content = content.replace(
  'const copyText = `Card Number: ${card.fullNumber || card.number || `5119 3988 4562 ${card.last4}`}\\nExpiry: ${card.expiry}\\nCVC: ${card.cvv || card.cvc || "789"}\\nPIN: ${card.pin || "1994"}\\nZIP: ${card.zip || "10001"}\\nName: ${card.holder || "Asim Aryal"}`; navigator.clipboard.writeText(copyText);',
  'const copyText = `Card Number: ${card.fullNumber || card.number || `5119 3988 4562 ${card.last4}`}\\nExpiry: ${card.expiry}\\nCVC: ${card.cvv || card.cvc || "789"}\\nPIN: ${card.pin || "1994"}\\nZIP: ${card.zip || "10001"}\\nName: ${card.holder || "Asim Aryal"}`; navigator.clipboard.writeText(copyText);'
);

fs.writeFileSync('src/components/bank/ValourianDashboard.tsx', content);
