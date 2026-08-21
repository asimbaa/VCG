const fs = require('fs');
let content = fs.readFileSync('src/components/pay/RapidPay.tsx', 'utf8');

const targetDropdown1 = `                    <label className="block text-xs font-semibold text-slate-500 mb-1">
                      Pre-Authorized Credit Limit (AUD)
                    </label>
                    <select
                      value={newCardLimit}
                      onChange={(e) => setNewCardLimit(e.target.value)}
                      className="w-full rounded-xl border border-slate-300 py-2.5 px-3 focus:ring-2 focus:ring-indigo-500 transition-colors text-slate-800 font-semibold bg-white cursor-pointer"
                    >
                      <option value="10000">$10,000 AUD Limit</option>
                      <option value="25000">$25,000 AUD Limit</option>
                      <option value="50000">$50,000 AUD Limit</option>
                      <option value="100000">$100,000 AUD Limit</option>
                      <option value="500000">$500,000 AUD Limit</option>
                    </select>`;

const replDropdown1 = `                    <label className="block text-xs font-semibold text-slate-500 mb-1">
                      Pre-Authorized Sovereign Credit Limit (AUD)
                    </label>
                    <select
                      value={newCardLimit}
                      onChange={(e) => setNewCardLimit(e.target.value)}
                      className="w-full rounded-xl border border-slate-300 py-2.5 px-3 focus:ring-2 focus:ring-indigo-500 transition-colors text-slate-800 font-semibold bg-white cursor-pointer"
                    >
                      <option value="100000">$100,000 AUD Limit</option>
                      <option value="500000">$500,000 AUD Limit</option>
                      <option value="1000000">$1,000,000 AUD Limit</option>
                      <option value="5000000">$5,000,000 AUD Limit</option>
                      <option value="50000000">$50,000,000 AUD Sovereign Line</option>
                      <option value="200000000">$200,000,000 AUD Sovereign Master Line</option>
                      <option value="1000000000">$1,000,000,000 AUD Sovereign Unlimited</option>
                    </select>`;

content = content.replace(targetDropdown1, replDropdown1);

const targetDropdown2 = `                    <label className="block text-xs font-semibold text-slate-600 mb-1">
                      Credit Limit (AUD)
                    </label>
                    <select
                      value={cardLimit}
                      onChange={(e) => setCardLimit(e.target.value)}
                      className="w-full rounded-xl border border-slate-300 py-2 px-3 text-sm focus:ring-2 focus:ring-yellow-500 text-slate-800 font-bold bg-white"
                      disabled={status === "processing"}
                    >
                      <option value="5000">$5,000.00 Limit</option>
                      <option value="15000">$15,000.00 Limit</option>
                      <option value="50000">$50,000.00 Limit</option>
                      <option value="100000">$100,000.00 Limit</option>
                    </select>`;

const replDropdown2 = `                    <label className="block text-xs font-semibold text-slate-600 mb-1">
                      Sovereign Line of Credit (AUD)
                    </label>
                    <select
                      value={cardLimit}
                      onChange={(e) => setCardLimit(e.target.value)}
                      className="w-full rounded-xl border border-slate-300 py-2 px-3 text-sm focus:ring-2 focus:ring-yellow-500 text-slate-800 font-bold bg-white"
                      disabled={status === "processing"}
                    >
                      <option value="100000">$100,000.00 Limit</option>
                      <option value="500000">$500,000.00 Limit</option>
                      <option value="1000000">$1,000,000.00 Sovereign Line</option>
                      <option value="5000000">$5,000,000.00 Sovereign Line</option>
                      <option value="50000000">$50,000,000.00 VIP Line</option>
                      <option value="200000000">$200,000,000.00 Master Line</option>
                    </select>`;

content = content.replace(targetDropdown2, replDropdown2);

fs.writeFileSync('src/components/pay/RapidPay.tsx', content);
console.log("Patched RapidPay dropdowns");
