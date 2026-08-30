const fs = require('fs');
let content = fs.readFileSync('src/components/bank/BankDashboard.tsx', 'utf8');

if (content.endsWith('    </>\n  );')) {
  content = content + '\n}';
} else if (content.endsWith('    </>\n  );\n')) {
  content = content + '}';
}

fs.writeFileSync('src/components/bank/BankDashboard.tsx', content);
