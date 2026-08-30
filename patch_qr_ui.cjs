const fs = require('fs');

let content = fs.readFileSync('src/components/bank/UberEatsApp.tsx', 'utf8');

const targetStr = '<div className="grid grid-cols-2 gap-2">';
const replacementStr = '<div className="grid grid-cols-3 gap-2">';

content = content.replace(targetStr, replacementStr);

const buttonsTarget = `                              <button
                                id="payment-card-method-btn"
                                onClick={() => setCheckoutPaymentMethod("card")}
                                className={\`p-2.5 rounded-xl border text-xs font-black transition-all flex flex-col items-center gap-1 cursor-pointer \${
                                  checkoutPaymentMethod === "card"
                                    ? "bg-emerald-50 border-[#06C167] text-[#06C167] shadow-xs"
                                    : "bg-white border-slate-200 text-slate-600 hover:bg-slate-50"
                                }\`}
                              >
                                <span className="font-sans text-[10px] leading-tight">
                                  Credit/Debit Card
                                </span>
                                <span className="text-[8px] text-slate-400 font-medium font-mono">
                                  Linked or New
                                </span>
                              </button>
                            </div>`;

const buttonsReplacement = `                              <button
                                id="payment-card-method-btn"
                                onClick={() => setCheckoutPaymentMethod("card")}
                                className={\`p-2.5 rounded-xl border text-xs font-black transition-all flex flex-col items-center gap-1 cursor-pointer \${
                                  checkoutPaymentMethod === "card"
                                    ? "bg-emerald-50 border-[#06C167] text-[#06C167] shadow-xs"
                                    : "bg-white border-slate-200 text-slate-600 hover:bg-slate-50"
                                }\`}
                              >
                                <span className="font-sans text-[10px] leading-tight">
                                  Credit/Debit Card
                                </span>
                                <span className="text-[8px] text-slate-400 font-medium font-mono">
                                  Linked or New
                                </span>
                              </button>
                              
                              <button
                                onClick={() => setCheckoutPaymentMethod("qr")}
                                className={\`p-2.5 rounded-xl border text-xs font-black transition-all flex flex-col items-center gap-1 cursor-pointer \${
                                  checkoutPaymentMethod === "qr"
                                    ? "bg-indigo-50 border-indigo-600 text-indigo-600 shadow-xs"
                                    : "bg-white border-slate-200 text-slate-600 hover:bg-slate-50"
                                }\`}
                              >
                                <span className="font-sans text-[10px] leading-tight">
                                  Valourian QR
                                </span>
                                <span className="text-[8px] text-slate-400 font-medium font-sans">
                                  Scan to Pay
                                </span>
                              </button>
                            </div>`;

content = content.replace(buttonsTarget, buttonsReplacement);

const qrCodeUI = `                            {/* Dynamic QR Code Payment integration */}
                            {checkoutPaymentMethod === "qr" && (
                              <motion.div
                                initial={{ opacity: 0, height: 0 }}
                                animate={{ opacity: 1, height: "auto" }}
                                className="bg-slate-900 border border-slate-800 rounded-xl mt-2 p-5 text-center relative overflow-hidden"
                              >
                                <div className="absolute inset-0 opacity-20 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-indigo-500 via-slate-900 to-slate-900 pointer-events-none" />
                                
                                <div className="relative z-10 flex flex-col items-center">
                                  <div className="bg-white p-3 rounded-xl mb-3 shadow-[0_0_20px_rgba(99,102,241,0.2)]">
                                    <QRCodeSVG value={\`valourian://pay?amount=\${cartTotal + deliveryFee + serviceFee}&currency=AUD&merchant=UBEREATS_GLOBAL\`} size={140} level="H" />
                                  </div>
                                  
                                  <h4 className="text-white font-bold text-sm mb-1 tracking-wider uppercase">Valourian Instant Settlement</h4>
                                  <p className="text-slate-400 text-[10px] font-mono mb-4">Present this QR code to the merchant terminal or POS scanner to instantly settle via your Sovereign Credit Line.</p>
                                  
                                  <div className="flex items-center gap-4 text-[9px] font-black uppercase tracking-widest text-emerald-400 bg-slate-950 px-3 py-1.5 rounded-lg border border-slate-800">
                                    <span className="flex items-center gap-1">
                                      <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></div> Live
                                    </span>
                                    <span>T+0 Settlement</span>
                                  </div>
                                </div>
                              </motion.div>
                            )}`;

const cardTarget = '{checkoutPaymentMethod === "card" && (';

content = content.replace(cardTarget, qrCodeUI + '\n                            ' + cardTarget);

fs.writeFileSync('src/components/bank/UberEatsApp.tsx', content);
