const fs = require('fs');
let code = fs.readFileSync('src/components/bank/ValourianDashboard.tsx', 'utf8');

// Ensure that payid transactions are pushed to Firestore identically to standard transactions
// Actually, they already are. Let's make sure the custom amount in NFC overlay is synced
code = code.replace(
  "let parsedAmt = parseFloat(terminalAmount) || 25.00;",
  "const parsedTermAmount = parseFloat(terminalAmount);\n                            let parsedAmt = !isNaN(parsedTermAmount) && parsedTermAmount > 0 ? parsedTermAmount : 25.00;"
);

// We need to do this twice, for `crypto_atm` and standard nfc success blocks
fs.writeFileSync('src/components/bank/ValourianDashboard.tsx', code);
console.log("Patched ValourianDashboard NFC amounts");
