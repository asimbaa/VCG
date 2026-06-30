const fs = require('fs');
const files = [
  'src/components/bank/BankDashboard.tsx',
  'src/components/bank/ValourianDashboard.tsx',
  'src/components/bank/WorkspaceMail.tsx'
];

files.forEach(file => {
  let text = fs.readFileSync(file, 'utf8');
  text = text.replace(/12\/31/g, '12/99');
  text = text.replace(/12\/32/g, '12/99');
  text = text.replace(/12\/36/g, '12/99');
  text = text.replace(/2031/g, '2099');
  text = text.replace(/2036/g, '2099');
  fs.writeFileSync(file, text);
});
console.log("Done");
