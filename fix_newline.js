const fs = require('fs');
const content = fs.readFileSync('/src/components/bank/BankDashboard.tsx', 'utf8');
const fixed = content.replace('</>\\n            ) : null}', '</>\n            ) : null}');
fs.writeFileSync('/src/components/bank/BankDashboard.tsx', fixed);
console.log('Fixed literal newline at atm tab end');
