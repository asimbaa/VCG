const fs = require('fs');
let content = fs.readFileSync('src/components/pay/RapidPay.tsx', 'utf8');

const targetAmountBlock = `                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-1.5">SMS Verification Phone Number</label>
                  <div className="relative">
                    <input
                      type="tel"
                      id="smsPhone"
                      placeholder="+61 400 000 000"
                      className="w-full px-4 py-3.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-4 focus:ring-emerald-500/10 outline-none font-mono text-sm text-slate-800 placeholder:text-slate-400"
                      required
                    />
                  </div>
                  <p className="text-[10px] text-slate-500 mt-1">Required for operational withdrawal authorization protocols.</p>
                </div>`;

const replAmountBlock = `                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-1.5">SMS Verification Phone Number</label>
                  <div className="relative">
                    <input
                      type="tel"
                      id="smsPhone"
                      placeholder="+61 400 000 000"
                      className="w-full px-4 py-3.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-4 focus:ring-emerald-500/10 outline-none font-mono text-sm text-slate-800 placeholder:text-slate-400"
                      required
                    />
                  </div>
                  <p className="text-[10px] text-slate-500 mt-1">Required for operational withdrawal authorization protocols.</p>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-1.5">Linked Administrator Email</label>
                  <div className="relative">
                    <input
                      type="email"
                      id="cryptoAdminEmail"
                      placeholder="admin@sovereign.local"
                      className="w-full px-4 py-3.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-4 focus:ring-emerald-500/10 outline-none font-mono text-sm text-slate-800 placeholder:text-slate-400"
                      required
                    />
                  </div>
                  <p className="text-[10px] text-slate-500 mt-1">Cryptographic withdrawal receipts and blockchain hash trackers will be routed here.</p>
                </div>`;

content = content.replace(targetAmountBlock, replAmountBlock);

const targetHandleSubmit = `const phoneInput = document.getElementById('smsPhone') as HTMLInputElement;
      if (!phoneInput || !phoneInput.value.trim()) {
        toast.error("SMS Verification Phone Number is required for withdrawal authorization.");
        return;
      }
      processCryptoTransfer(phoneInput.value.trim());`;

const replHandleSubmit = `const phoneInput = document.getElementById('smsPhone') as HTMLInputElement;
      const emailInput = document.getElementById('cryptoAdminEmail') as HTMLInputElement;
      if (!phoneInput || !phoneInput.value.trim()) {
        toast.error("SMS Verification Phone Number is required for withdrawal authorization.");
        return;
      }
      if (!emailInput || !emailInput.value.trim()) {
        toast.error("Administrator Email is required for security receipts.");
        return;
      }
      processCryptoTransfer(phoneInput.value.trim(), emailInput.value.trim());`;

content = content.replace(targetHandleSubmit, replHandleSubmit);

const targetProc = `const processCryptoTransfer = async (phone: string) => {`;
const replProc = `const processCryptoTransfer = async (phone: string, email: string) => {`;
content = content.replace(targetProc, replProc);

const targetToast = `toast.success(\`SMS Verification Code Authorized via \${phone}. Successfully sent \${numAmount} \${cryptoAsset} from treasury. Assets settled on-chain.\`);`;
const replToast = `toast.success(\`SMS Verification Code Authorized via \${phone}. Successfully sent \${numAmount} \${cryptoAsset} from treasury. Assets settled on-chain. Receipts forwarded to \${email}.\`);`;
content = content.replace(targetToast, replToast);

fs.writeFileSync('src/components/pay/RapidPay.tsx', content);
console.log("Patched RapidPay crypto email");
