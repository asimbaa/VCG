const fs = require('fs');
let code = fs.readFileSync('src/components/bank/ValourianDashboard.tsx', 'utf8');

code = code.replace(
  `    const modifiedCard = {
      ...card,
      balance: 940000000,
      limit: "940000000"
    };
    uniqueCards.push(modifiedCard);`,
  `    uniqueCards.push(card);`
);

fs.writeFileSync('src/components/bank/ValourianDashboard.tsx', code);
console.log("Patched ValourianDashboard cards snapshot");
