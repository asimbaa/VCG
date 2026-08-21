const fs = require('fs');
let content = fs.readFileSync('src/components/bank/BankDashboard.tsx', 'utf8');

const targetAmountTap = `                <div className="text-center">
                  <label className="block text-xs text-slate-400 font-bold uppercase tracking-widest mb-2">
                    Transaction Amount
                  </label>
                  <div className="flex items-center justify-center">
                    <span className="text-2xl text-slate-500 mr-1">$</span>
                    <input
                      type="number"
                      value={tapAmount}
                      onChange={(e) => setTapAmount(e.target.value)}
                      className="bg-transparent text-4xl font-extrabold text-white w-full max-w-[200px] text-center focus:outline-none"
                      placeholder="0.00"
                      disabled={tapStatus !== "idle"}
                    />
                  </div>
                </div>`;

const replAmountTap = `                <div className="text-center">
                  <label className="block text-xs text-slate-400 font-bold uppercase tracking-widest mb-2">
                    Transaction Amount
                  </label>
                  <div className="flex items-center justify-center">
                    <span className="text-2xl text-slate-500 mr-1">$</span>
                    <input
                      type="number"
                      value={tapAmount}
                      onChange={(e) => setTapAmount(e.target.value)}
                      className="bg-transparent text-4xl font-extrabold text-white w-full max-w-[200px] text-center focus:outline-none"
                      placeholder="0.00"
                      disabled={tapStatus !== "idle"}
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs text-slate-400 font-bold uppercase tracking-widest mb-2">
                    SMS Verification Phone Number
                  </label>
                  <input
                    type="tel"
                    id="bankTapSmsPhone"
                    placeholder="+61 400 000 000"
                    className="w-full px-4 py-3 bg-slate-900 border border-slate-700 rounded-xl focus:ring-2 focus:ring-blue-500 font-mono text-sm text-white placeholder:text-slate-500"
                    required
                  />
                  <p className="text-[10px] text-slate-500 mt-1">Required to authorize NFC payload via SMS.</p>
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
    const phoneInput = document.getElementById('bankTapSmsPhone') as HTMLInputElement;
    if (!phoneInput || !phoneInput.value.trim()) {
      toast.error("SMS Verification Phone Number is required for NFC transaction authorization.");
      return;
    }`;

content = content.replace(targetHandleTap, replHandleTap);

const targetTapSuccess = `toast.success(\`Successfully \${tapMode === "pay" ? "paid" : "refunded"} $\${amt.toFixed(2)} via Tap & \${tapMode === "pay" ? "Pay" : "Refund"}!\`);`;
const replTapSuccess = `toast.success(\`SMS Verification Code Authorized via \${phoneInput.value.trim()}. Successfully \${tapMode === "pay" ? "paid" : "refunded"} \${amt.toFixed(2)} via Tap & \${tapMode === "pay" ? "Pay" : "Refund"} to merchant!\`);`;
content = content.replace(targetTapSuccess, replTapSuccess);

fs.writeFileSync('src/components/bank/BankDashboard.tsx', content);
console.log("Patched BankDashboard Tap&Pay SMS");
