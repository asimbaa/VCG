const fs = require('fs');

['src/components/bank/BookingApp.tsx', 'src/components/bank/BankDashboard.tsx', 'src/components/bank/ValourianDashboard.tsx'].forEach(file => {
  let code = fs.readFileSync(file, 'utf-8');
  code = code.replace(/doc\.lastAutoTable/g, '(doc as any).lastAutoTable');
  fs.writeFileSync(file, code);
});
