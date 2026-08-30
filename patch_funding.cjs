const fs = require('fs');
let code = fs.readFileSync('src/components/bank/ValourianDashboard.tsx', 'utf8');

code = code.replace(
  `    const modifiedSources = sources.map(s => ({
        ...s,
        balance: 940000000,
        available: 150000
    }));
    setFundingSources(modifiedSources);`,
  `    setFundingSources(sources);`
);

fs.writeFileSync('src/components/bank/ValourianDashboard.tsx', code);
console.log("Patched fundingSources snapshot in ValourianDashboard");
