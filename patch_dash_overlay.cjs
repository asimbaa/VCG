const fs = require('fs');
let content = fs.readFileSync('src/components/bank/ValourianDashboard.tsx', 'utf8');

if (!content.includes('import { PaymentStatusOverlay }')) {
  content = content.replace(
    'import { ComplianceBankingTab } from "./ComplianceBankingTab";',
    'import { ComplianceBankingTab } from "./ComplianceBankingTab";\nimport { PaymentStatusOverlay } from "./PaymentStatusOverlay";'
  );
}

if (!content.includes('<PaymentStatusOverlay />')) {
  content = content.replace(
    'return (',
    'return (\n    <>\n      <PaymentStatusOverlay />'
  );
  // Need to close the fragment at the end.
  const lastIndex = content.lastIndexOf(');');
  if (lastIndex !== -1) {
    content = content.slice(0, lastIndex) + '\n    </>\n  );' + content.slice(lastIndex + 2);
  }
}

fs.writeFileSync('src/components/bank/ValourianDashboard.tsx', content);
