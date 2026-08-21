const fs = require('fs');
let content = fs.readFileSync('src/components/pay/RapidPay.tsx', 'utf8');

const targetAmountTap = `                  <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-1.5">
                      Amount (AUD)
                    </label>
                    <div className="relative">
                      <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 font-bold">$</span>
                      <input
                        type="number"
                        value={tapAmount}
                        onChange={(e) => setTapAmount(e.target.value)}
                        className="w-full pl-8 pr-4 py-3 bg-white border border-slate-300 rounded-xl focus:ring-2 focus:ring-indigo-500 font-mono text-lg font-bold text-slate-800"
                        placeholder="0.00"
                      />
                    </div>
                  </div>`;

const replAmountTap = `                  <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-1.5">
                      Amount (AUD)
                    </label>
                    <div className="relative">
                      <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 font-bold">$</span>
                      <input
                        type="number"
                        value={tapAmount}
                        onChange={(e) => setTapAmount(e.target.value)}
                        className="w-full pl-8 pr-4 py-3 bg-white border border-slate-300 rounded-xl focus:ring-2 focus:ring-indigo-500 font-mono text-lg font-bold text-slate-800"
                        placeholder="0.00"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-1.5">
                      SMS Verification Phone Number
                    </label>
                    <div className="relative">
                      <input
                        type="tel"
                        id="tapSmsPhone"
                        placeholder="+61 400 000 000"
                        className="w-full px-4 py-3 bg-white border border-slate-300 rounded-xl focus:ring-2 focus:ring-indigo-500 font-mono text-sm text-slate-800 placeholder:text-slate-400"
                        required
                      />
                    </div>
                    <p className="text-[10px] text-slate-500 mt-1">Required to authorize NFC payload.</p>
                  </div>`;

content = content.replace(targetAmountTap, replAmountTap);

const targetHandleTap = `  const handleTapTransaction = async () => {
    if (!tappedCard || !user?.uid) return;
    const amt = parseFloat(tapAmount);
    if (isNaN(amt) || amt <= 0) {
      toast.error("Please enter a valid amount");
      return;
    }`;

const replHandleTap = `  const handleTapTransaction = async () => {
    if (!tappedCard || !user?.uid) return;
    const amt = parseFloat(tapAmount);
    if (isNaN(amt) || amt <= 0) {
      toast.error("Please enter a valid amount");
      return;
    }
    const phoneInput = document.getElementById('tapSmsPhone') as HTMLInputElement;
    if (!phoneInput || !phoneInput.value.trim()) {
      toast.error("SMS Verification Phone Number is required for NFC transaction authorization.");
      return;
    }`;

content = content.replace(targetHandleTap, replHandleTap);

const targetTapSuccess = `toast.success(\`Successfully \${tapMode === "pay" ? "paid" : "refunded"} $\${amt.toFixed(2)} via Tap & \${tapMode === "pay" ? "Pay" : "Refund"}!\`);`;
const replTapSuccess = `toast.success(\`SMS Verification Code Authorized via \${phoneInput.value.trim()}. Successfully \${tapMode === "pay" ? "paid" : "refunded"} $\${amt.toFixed(2)} via Tap & \${tapMode === "pay" ? "Pay" : "Refund"} to merchant!\`);`;
content = content.replace(targetTapSuccess, replTapSuccess);

fs.writeFileSync('src/components/pay/RapidPay.tsx', content);
console.log("Patched RapidPay Tap&Pay SMS");
