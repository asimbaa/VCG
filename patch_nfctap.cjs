const fs = require('fs');
let code = fs.readFileSync('src/components/pay/NFCTapModal.tsx', 'utf8');

// Replace the hardcoded amount generation with an input
code = code.replace(
  "const [paymentAmount, setPaymentAmount] = useState<number>(0);",
  "const [paymentAmount, setPaymentAmount] = useState<number>(0);\n  const [customAmount, setCustomAmount] = useState<string>('');"
);

code = code.replace(
  "const randomAmount = Math.floor(Math.random() * 150) + 12.50;",
  "const parsedCustom = parseFloat(customAmount);\n      const randomAmount = !isNaN(parsedCustom) && parsedCustom > 0 ? parsedCustom : (Math.floor(Math.random() * 150) + 12.50);"
);

const inputUI = `                  <div>
                    <label className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-3 block">Custom Amount (Optional)</label>
                    <input 
                      type="number" 
                      value={customAmount}
                      onChange={(e) => setCustomAmount(e.target.value)}
                      placeholder="e.g. 50.00"
                      className="w-full bg-slate-950 border-2 border-slate-800 rounded-xl px-4 py-3 text-white font-mono focus:border-emerald-500 focus:outline-none"
                    />
                  </div>`;

code = code.replace(
  "<div>\n                    <label className=\"text-xs font-bold text-slate-400 uppercase tracking-widest mb-3 block\">Select Source Card</label>",
  inputUI + "\n                  <div>\n                    <label className=\"text-xs font-bold text-slate-400 uppercase tracking-widest mb-3 block\">Select Source Card</label>"
);

fs.writeFileSync('src/components/pay/NFCTapModal.tsx', code);
console.log("Patched NFCTapModal.tsx");
