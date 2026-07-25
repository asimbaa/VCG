const fs = require('fs');
let code = fs.readFileSync('src/components/pay/RapidPay.tsx', 'utf-8');

code = code.replace(
  '<span>{formatConverted(card.currentBalance?.toFixed(0)} / ${card.limit?)}</span>',
  '<span>{formatConverted(card.currentBalance || 0)} / {formatConverted(card.limit || 0)}</span>'
);

fs.writeFileSync('src/components/pay/RapidPay.tsx', code);
