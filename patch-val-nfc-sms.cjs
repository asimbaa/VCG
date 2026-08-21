const fs = require('fs');
let content = fs.readFileSync('src/components/bank/ValourianDashboard.tsx', 'utf8');

const targetAmountNfc = `              <div className="w-full space-y-4 mb-6">
                <div className="flex gap-4">
                  <div className="flex-1">
                    <label className="text-white/60 text-xs font-bold uppercase tracking-widest ml-2 mb-1 block">Amount (AUD)</label>
                    <input 
                      type="number"
                      className="w-full bg-white/10 border border-white/20 rounded-xl px-4 py-3 text-white font-mono text-xl focus:outline-none focus:border-emerald-500"
                      value={terminalAmount}
                      onChange={(e) => setTerminalAmount(e.target.value)}
                      placeholder="0.00"
                    />
                  </div>
                </div>
                <div>
                  <label className="text-white/60 text-xs font-bold uppercase tracking-widest ml-2 mb-1 block">Merchant / Region</label>
                  <input 
                    type="text"
                    className="w-full bg-white/10 border border-white/20 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-emerald-500"
                    value={selectedMerchant}
                    onChange={(e) => setSelectedMerchant(e.target.value)}
                    placeholder="e.g. Starbucks Global"
                  />
                </div>
              </div>`;

const replAmountNfc = `              <div className="w-full space-y-4 mb-6">
                <div className="flex gap-4">
                  <div className="flex-1">
                    <label className="text-white/60 text-xs font-bold uppercase tracking-widest ml-2 mb-1 block">Amount (AUD)</label>
                    <input 
                      type="number"
                      className="w-full bg-white/10 border border-white/20 rounded-xl px-4 py-3 text-white font-mono text-xl focus:outline-none focus:border-emerald-500"
                      value={terminalAmount}
                      onChange={(e) => setTerminalAmount(e.target.value)}
                      placeholder="0.00"
                    />
                  </div>
                </div>
                <div>
                  <label className="text-white/60 text-xs font-bold uppercase tracking-widest ml-2 mb-1 block">Merchant / Region</label>
                  <input 
                    type="text"
                    className="w-full bg-white/10 border border-white/20 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-emerald-500"
                    value={selectedMerchant}
                    onChange={(e) => setSelectedMerchant(e.target.value)}
                    placeholder="e.g. Starbucks Global"
                  />
                </div>
                <div>
                  <label className="text-white/60 text-xs font-bold uppercase tracking-widest ml-2 mb-1 block">SMS Verification Phone Number</label>
                  <input 
                    type="tel"
                    id="valNfcSmsPhone"
                    className="w-full bg-white/10 border border-white/20 rounded-xl px-4 py-3 text-white font-mono text-sm focus:outline-none focus:border-emerald-500"
                    placeholder="+61 400 000 000"
                    required
                  />
                  <p className="text-[10px] text-white/50 mt-1 ml-2">Required for global withdrawal authorization protocols.</p>
                </div>
              </div>`;

content = content.replace(targetAmountNfc, replAmountNfc);

const targetHandleNfc = `  const handleInitiateNfc = async () => {
    if (!activeNfcCard || !user?.uid) return;
    
    if (nfcMode === "pay" || nfcMode === "refund") {
      const amt = parseFloat(terminalAmount);
      if (isNaN(amt) || amt <= 0) {
        toast.error("Please enter a valid amount");
        return;
      }
    }`;

const replHandleNfc = `  const handleInitiateNfc = async () => {
    if (!activeNfcCard || !user?.uid) return;
    
    if (nfcMode === "pay" || nfcMode === "refund") {
      const amt = parseFloat(terminalAmount);
      if (isNaN(amt) || amt <= 0) {
        toast.error("Please enter a valid amount");
        return;
      }
      const phoneInput = document.getElementById('valNfcSmsPhone') as HTMLInputElement;
      if (!phoneInput || !phoneInput.value.trim()) {
        toast.error("SMS Verification Phone Number is required for withdrawal authorization.");
        return;
      }
    }`;

content = content.replace(targetHandleNfc, replHandleNfc);

const targetNfcSuccess = `toast.success(\`NFC \${nfcMode.toUpperCase()} SUCCESS: $\${amt.toFixed(2)} AUD via \${activeNfcCard.network}\`, { duration: 5000 });`;
const replNfcSuccess = `const phoneInput = document.getElementById('valNfcSmsPhone') as HTMLInputElement;
        const phone = phoneInput ? phoneInput.value.trim() : "";
        toast.success(\`SMS Verification Code Authorized via \${phone}. NFC \${nfcMode.toUpperCase()} SUCCESS: $\${amt.toFixed(2)} AUD via \${activeNfcCard.network} to \${selectedMerchant}\`, { duration: 5000 });`;
content = content.replace(targetNfcSuccess, replNfcSuccess);

fs.writeFileSync('src/components/bank/ValourianDashboard.tsx', content);
console.log("Patched ValourianDashboard NFC SMS");
