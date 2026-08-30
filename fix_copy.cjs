const fs = require('fs');

let content = fs.readFileSync('src/components/bank/ValourianDashboard.tsx', 'utf8');
content = content.replace(
  'navigator.clipboard.writeText(card.fullNumber || card.number || `5119 3988 4562 ${card.last4}`);',
  'const copyText = `Card Number: ${card.fullNumber || card.number || `5119 3988 4562 ${card.last4}`}\\nExpiry: ${card.expiry}\\nCVC: ${card.cvv || card.cvc || "789"}\\nPIN: ${card.pin || "1994"}\\nZIP: ${card.zip || "10001"}\\nName: ${card.holder || "Asim Aryal"}`; navigator.clipboard.writeText(copyText);'
);
content = content.replace(
  'toast.success("Card Details Copied. Authenticated across iOS/Android Secure Enclaves & Global Networks.", { icon: "🌍" });',
  'toast.success("Full Card Details Copied. Ready for entry.", { icon: "💳" });'
);
content = content.replace(
  '<div className="text-2xl font-black tracking-[0.2em] font-mono">',
  '<div className="text-2xl font-black tracking-[0.2em] font-mono select-all">'
)

fs.writeFileSync('src/components/bank/ValourianDashboard.tsx', content);
