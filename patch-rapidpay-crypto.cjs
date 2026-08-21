const fs = require('fs');
let content = fs.readFileSync('src/components/pay/RapidPay.tsx', 'utf8');

const targetAssetsList = `{(["VAL", "BTC", "ETH", "USDT"] as const).map(asset => (`;
const replAssetsList = `{(["VAL", "BTC", "ETH", "USDT", "SOL", "XRP", "ADA", "DOT"] as const).map(asset => (`;
content = content.replace(targetAssetsList, replAssetsList);
content = content.replace('grid grid-cols-4 gap-3', 'grid grid-cols-4 gap-2');

const targetCurrencySymbol = `{cryptoAsset === "VAL" ? "V" : ""}`;
const replCurrencySymbol = `{cryptoAsset === "VAL" ? "V" : ""}
                      {cryptoAsset === "SOL" ? "◎" : ""}
                      {cryptoAsset === "XRP" ? "✕" : ""}
                      {cryptoAsset === "ADA" ? "₳" : ""}
                      {cryptoAsset === "DOT" ? "●" : ""}`;
content = content.replace(targetCurrencySymbol, replCurrencySymbol);

// Add phone number for SMS
const amountBlock = `                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-1.5">Amount</label>
                  <div className="relative">
                    <input
                      type="text"
                      value={cryptoAmount}
                      onChange={(e) => setCryptoAmount(e.target.value.replace(/[^0-9.]/g, ""))}
                      placeholder="0.00"
                      className="w-full px-4 py-3.5 pl-12 bg-slate-50 border border-slate-200 rounded-xl focus:ring-4 focus:ring-emerald-500/10 outline-none font-bold text-lg text-slate-800 placeholder:text-slate-300"
                    />
                    <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 font-bold">
                      {cryptoAsset === "USDT" ? "$" : ""}
                      {cryptoAsset === "BTC" ? "₿" : ""}
                      {cryptoAsset === "ETH" ? "Ξ" : ""}
                      {cryptoAsset === "VAL" ? "V" : ""}
                      {cryptoAsset === "SOL" ? "◎" : ""}
                      {cryptoAsset === "XRP" ? "✕" : ""}
                      {cryptoAsset === "ADA" ? "₳" : ""}
                      {cryptoAsset === "DOT" ? "●" : ""}
                    </div>
                  </div>
                </div>`;

const amountBlockWithPhone = `                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-1.5">Amount</label>
                  <div className="relative">
                    <input
                      type="text"
                      value={cryptoAmount}
                      onChange={(e) => setCryptoAmount(e.target.value.replace(/[^0-9.]/g, ""))}
                      placeholder="0.00"
                      className="w-full px-4 py-3.5 pl-12 bg-slate-50 border border-slate-200 rounded-xl focus:ring-4 focus:ring-emerald-500/10 outline-none font-bold text-lg text-slate-800 placeholder:text-slate-300"
                    />
                    <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 font-bold">
                      {cryptoAsset === "USDT" ? "$" : ""}
                      {cryptoAsset === "BTC" ? "₿" : ""}
                      {cryptoAsset === "ETH" ? "Ξ" : ""}
                      {cryptoAsset === "VAL" ? "V" : ""}
                      {cryptoAsset === "SOL" ? "◎" : ""}
                      {cryptoAsset === "XRP" ? "✕" : ""}
                      {cryptoAsset === "ADA" ? "₳" : ""}
                      {cryptoAsset === "DOT" ? "●" : ""}
                    </div>
                  </div>
                </div>

                <div>
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

content = content.replace(amountBlock, amountBlockWithPhone);

fs.writeFileSync('src/components/pay/RapidPay.tsx', content);
console.log("Patched RapidPay crypto");
