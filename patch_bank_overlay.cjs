const fs = require('fs');
let content = fs.readFileSync('src/components/bank/BankDashboard.tsx', 'utf8');

if (!content.includes('import { PaymentStatusOverlay }')) {
  content = content.replace(
    'import { UberEatsApp } from "./UberEatsApp";',
    'import { UberEatsApp } from "./UberEatsApp";\nimport { PaymentStatusOverlay } from "./PaymentStatusOverlay";'
  );
}

if (!content.includes('<PaymentStatusOverlay />')) {
  content = content.replace(
    'return (',
    'return (\n    <>\n      <PaymentStatusOverlay />'
  );
  const lastIndex = content.lastIndexOf(');');
  if (lastIndex !== -1) {
    content = content.slice(0, lastIndex) + '\n    </>\n  );' + content.slice(lastIndex + 2);
  }
}

fs.writeFileSync('src/components/bank/BankDashboard.tsx', content);
