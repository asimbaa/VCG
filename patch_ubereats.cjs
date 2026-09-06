const fs = require('fs');
let content = fs.readFileSync('src/components/bank/UberEatsApp.tsx', 'utf8');

if (!content.includes('const [showCardQR, setShowCardQR] = useState(false);')) {
  content = content.replace(
    'const [checkoutPaymentMethod, setCheckoutPaymentMethod] = useState<',
    'const [showCardQR, setShowCardQR] = useState(false);\n  const [checkoutPaymentMethod, setCheckoutPaymentMethod] = useState<'
  );
}

const targetButtonBtn = `<button
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
                              </button>`;

const replacementButtonBtn = `<button
                                id="payment-card-method-btn"
                                onClick={() => {
                                  if (checkoutPaymentMethod === "card") {
                                    setShowCardQR(!showCardQR);
                                  } else {
                                    setCheckoutPaymentMethod("card");
                                    setShowCardQR(false);
                                  }
                                }}
                                className={\`p-2.5 rounded-xl border text-xs font-black transition-all flex flex-col items-center gap-1 cursor-pointer relative overflow-hidden \${
                                  checkoutPaymentMethod === "card"
                                    ? "bg-emerald-50 border-[#06C167] text-[#06C167] shadow-xs"
                                    : "bg-white border-slate-200 text-slate-600 hover:bg-slate-50"
                                }\`}
                              >
                                <span className="font-sans text-[10px] leading-tight z-10">
                                  Credit/Debit Card
                                </span>
                                <span className="text-[8px] text-slate-400 font-medium font-mono z-10">
                                  Linked or New
                                </span>

                                <AnimatePresence>
                                  {checkoutPaymentMethod === "card" && showCardQR && (
                                    <motion.div 
                                      initial={{ opacity: 0, scale: 0.8 }}
                                      animate={{ opacity: 1, scale: 1 }}
                                      exit={{ opacity: 0, scale: 0.8 }}
                                      className="absolute inset-0 bg-emerald-600/90 backdrop-blur-md rounded-xl flex flex-col items-center justify-center z-20 border border-emerald-400/50"
                                    >
                                       <QRCodeSVG value={\`VALOURIAN_CREDIT_LINE_\${user?.uid || 'UNKNOWN'}\`} size={40} level="H" fgColor="#ffffff" bgColor="transparent" />
                                    </motion.div>
                                  )}
                                </AnimatePresence>
                              </button>`;

content = content.replace(targetButtonBtn, replacementButtonBtn);

fs.writeFileSync('src/components/bank/UberEatsApp.tsx', content);
