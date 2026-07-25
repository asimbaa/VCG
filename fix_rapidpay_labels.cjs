const fs = require('fs');
let code = fs.readFileSync('src/components/pay/RapidPay.tsx', 'utf-8');

code = code.replace(
  '<Landmark className="w-4 h-4" /> AU BSB & Account',
  '<Landmark className="w-4 h-4" /> Global Bank Transfer'
);

code = code.replace(
  'Sovereign Direct BSB Clearing',
  'Sovereign Global Bank Clearing'
);

code = code.replace(
  'AU BSB Number',
  'Bank/Routing/BSB Code'
);

code = code.replace(
  'Amount (AUD)',
  'Amount ({globalCur})'
);

code = code.replace(
  '${parseFloat(amount).toLocaleString("en-AU", { minimumFractionDigits: 2 })}',
  '${formatConverted(parseFloat(amount))}'
);

fs.writeFileSync('src/components/pay/RapidPay.tsx', code);
