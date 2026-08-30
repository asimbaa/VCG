const fs = require('fs');

let content = fs.readFileSync('src/components/bank/UberEatsApp.tsx', 'utf8');

// Update state type
content = content.replace(
  'const [checkoutPaymentMethod, setCheckoutPaymentMethod] = useState<\n    "vault" | "card"\n  >("vault");',
  'const [checkoutPaymentMethod, setCheckoutPaymentMethod] = useState<\n    "vault" | "card" | "qr"\n  >("vault");'
);

content = content.replace(
  'const [checkoutPaymentMethod, setCheckoutPaymentMethod] = useState<"vault" | "card">("vault");',
  'const [checkoutPaymentMethod, setCheckoutPaymentMethod] = useState<"vault" | "card" | "qr">("vault");'
);

// We should find the exact state definition
console.log("State matched? ", content.includes('"vault" | "card"'));

fs.writeFileSync('src/components/bank/UberEatsApp.tsx', content);
