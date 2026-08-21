const fs = require('fs');
let content = fs.readFileSync('src/components/pay/RapidPay.tsx', 'utf8');

// Fix tappedCard rendering
content = content.replace('{tappedCard.name || `•••• ${tappedCard.details}`}', '{tappedCard.name || tappedCard.network || "Card"} •••• {tappedCard.details || tappedCard.last4 || "0000"}');
// Also fix credit card list rendering
content = content.replace('{card.details}', '{card.details || card.last4 || "0000"}');
content = content.replace('{card.details}', '{card.details || card.last4 || "0000"}'); // Replace all just in case

fs.writeFileSync('src/components/pay/RapidPay.tsx', content);
console.log("Patched RapidPay rendering");
