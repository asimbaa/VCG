const fs = require('fs');
let content = fs.readFileSync('src/components/bank/UberEatsApp.tsx', 'utf8');

// Ensure helper is imported
if (!content.includes('createPaymentEvent')) {
  content = content.replace(
    'import { db } from "../../firebase";',
    'import { db, createPaymentEvent } from "../../firebase";'
  );
}

// Ensure auth is available
if (!content.includes('import { getAuth }')) {
  content = content.replace(
    'import { db, createPaymentEvent } from "../../firebase";',
    'import { db, createPaymentEvent } from "../../firebase";\nimport { getAuth } from "firebase/auth";'
  );
}

// Find QR code rendering
if (content.includes('checkoutPaymentMethod === "qr" && (')) {
  // Let's add a button below the QR code to simulate merchant scan
  const target = '<QRCodeSVG value={`valourian://pay?amount=${cartTotal}&currency=AUD&merchant=UBEREATS_GLOBAL`} size={140} level="H" />';
  const replacement = `
                                    <QRCodeSVG value={\`valourian://pay?amount=\${cartTotal}&currency=AUD&merchant=UBEREATS_GLOBAL\`} size={140} level="H" />
                                    <button
                                      onClick={() => {
                                        const auth = getAuth();
                                        createPaymentEvent(db, auth, \`$\${cartTotal.toFixed(2)} AUD\`, "UberEats (QR POS)", "Sovereign Credit Line Settlement");
                                        // Wait a moment then clear cart to simulate success
                                        setTimeout(() => {
                                          setCart([]);
                                          setCheckoutPaymentMethod("vault"); // reset
                                        }, 4000);
                                      }}
                                      className="mt-4 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-[10px] px-4 py-2 rounded-full uppercase tracking-widest transition-colors"
                                    >
                                      Simulate POS Merchant Scan
                                    </button>
  `;
  content = content.replace(target, replacement);
}

// Find card checkout / transfer
if (content.includes('const handleConfirmCheckout = async () => {')) {
  const target = 'const handleConfirmCheckout = async () => {';
  const replacement = `const handleConfirmCheckout = async () => {
    const auth = getAuth();
    if (checkoutPaymentMethod !== 'qr') {
      createPaymentEvent(db, auth, \`$\${Math.max(0, cartTotal + tipAmount - discountAmount).toFixed(2)} AUD\`, "UberEats Delivery", "Sovereign Credit Line Settlement");
    }
  `;
  content = content.replace(target, replacement);
}

fs.writeFileSync('src/components/bank/UberEatsApp.tsx', content);
