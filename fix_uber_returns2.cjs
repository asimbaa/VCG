const fs = require('fs');
const file = 'src/components/bank/UberEatsApp.tsx';
let code = fs.readFileSync(file, 'utf8');

code = code.replace(/return \(\s*return \(/g, 'return (');

fs.writeFileSync(file, code);
