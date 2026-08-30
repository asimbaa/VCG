const fs = require('fs');
let content = fs.readFileSync('src/components/bank/BankDashboard.tsx', 'utf8');

if (content.endsWith('  </footer>;')) {
  content = content.replace('  </footer>;', '  </footer>\n);');
}

fs.writeFileSync('src/components/bank/BankDashboard.tsx', content);
