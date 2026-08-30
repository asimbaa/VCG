const fs = require('fs');
let content = fs.readFileSync('src/components/bank/BankDashboard.tsx', 'utf8');

// I will just remove <PaymentStatusOverlay /> from BankDashboard and revert the structure.
// Wait, I don't know the exact original structure.
// I can just remove `<>\n      <PaymentStatusOverlay />\n` and `\n    </>`
content = content.replace('<>\n      <PaymentStatusOverlay />\n    ', '');
content = content.replace('    </div>\n    </>\n  );\n}', '    </div>\n  );\n}');

fs.writeFileSync('src/components/bank/BankDashboard.tsx', content);
