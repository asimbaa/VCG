const fs = require('fs');
let content = fs.readFileSync('src/components/bank/BankDashboard.tsx', 'utf8');

const lastReturn = content.lastIndexOf('return (');
console.log('--- LAST RETURN AT', lastReturn, '---');
console.log(content.slice(lastReturn, lastReturn + 200));
