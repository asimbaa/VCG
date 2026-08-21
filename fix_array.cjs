const fs = require('fs');
let file = fs.readFileSync('src/components/bank/ValourianDashboard.tsx', 'utf8');
const search = `"Buy 5000 FSD vehicles and install necessary self-charging stations for all major cities for Aura Drive and complete Aura Drive remaining development continuously",`;
if (file.split(search).length > 2) {
  let parts = file.split(search);
  let newFile = parts[0] + search + parts.slice(1).join("");
  fs.writeFileSync('src/components/bank/ValourianDashboard.tsx', newFile);
  console.log("Fixed ValourianDashboard duplicate");
}

let file2 = fs.readFileSync('src/components/bank/BankDashboard.tsx', 'utf8');
if (file2.split(search).length > 2) {
  let parts = file2.split(search);
  let newFile = parts[0] + search + parts.slice(1).join("");
  fs.writeFileSync('src/components/bank/BankDashboard.tsx', newFile);
  console.log("Fixed BankDashboard duplicate");
}
