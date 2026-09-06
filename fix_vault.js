const fs = require('fs');
let content = fs.readFileSync('src/components/bank/VaultRecords.tsx', 'utf8');

// Find the second instance of id: "VEH-TESLA-001" and replace it
let count = 0;
content = content.replace(/id: "VEH-TESLA-001",/g, (match) => {
  count++;
  if (count === 2) {
    return 'id: "VEH-TESLA-002",';
  }
  return match;
});

fs.writeFileSync('src/components/bank/VaultRecords.tsx', content);
