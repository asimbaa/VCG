const fs = require('fs');
let content = fs.readFileSync('src/components/pay/RapidPay.tsx', 'utf8');

const target = `{/* Tab: Global Sovereign Vault */}`;

const repl = `<AnimatePresence>
        {selectedCardView && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[60] flex items-center justify-center bg-slate-900/80 backdrop-blur-md p-4"
            onClick={() => setSelectedCardView(null)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 20 }}
              className="bg-white rounded-3xl shadow-2xl max-w-md w-full relative overflow-hidden flex flex-col"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="absolute top-0 left-0 w-full h-3 bg-gradient-to-r from-emerald-600 via-teal-600 to-emerald-800 shrink-0 z-10"></div>
              <div className="p-6">
                <div className="flex justify-between items-center mb-6">
                  <h3 className="text-xl font-bold tracking-tight text-slate-900">
                    Card Credentials
                  </h3>
                  <div className="absolute top-6 left-1/2 -translate-x-1/2 bg-emerald-500/10 text-emerald-600 border border-emerald-500/20 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest flex items-center gap-1.5 whitespace-nowrap">
                    <CheckCircle2 className="w-3 h-3" /> Globally Accepted (Visa/MC/Amex/Beam)
                  </div>
                  <button
                    onClick={() => setSelectedCardView(null)}
                    className="p-2 text-slate-400 hover:bg-slate-100 rounded-full transition-colors"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>
                
                <div className="space-y-6">
                  <div>
                    <label className="block text-xs font-semibold text-slate-500 uppercase tracking-widest mb-1">
                      Card Number
                    </label>
                    <div className="flex items-center justify-between p-3 bg-slate-50 rounded-xl border border-slate-100">
                      <div className="text-sm font-mono tracking-widest text-slate-900 font-bold">
                        {selectedCardView.fullNumber || \`4511 8842 1093 \${selectedCardView.details || '9912'}\`}
                      </div>
                      <button
                        onClick={() => {
                          navigator.clipboard.writeText(selectedCardView.fullNumber || \`4511 8842 1093 \${selectedCardView.details || '9912'}\`);
                          toast.success("Card Number Copied. Active globally.");
                        }}
                        className="p-1.5 hover:bg-slate-200 rounded-lg text-slate-400 hover:text-emerald-600 transition-colors"
                      >
                        <Copy className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-semibold text-slate-500 uppercase tracking-widest mb-1">
                        Expiry
                      </label>
                      <div className="flex items-center justify-between p-3 bg-slate-50 rounded-xl border border-slate-100">
                        <div className="font-mono text-slate-900 font-bold text-sm">
                          {selectedCardView.expiry || "12/35"}
                        </div>
                      </div>
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-slate-500 uppercase tracking-widest mb-1">
                        CVV
                      </label>
                      <div className="flex items-center justify-between p-3 bg-slate-50 rounded-xl border border-slate-100">
                        <div className="font-mono text-slate-900 font-bold text-sm">
                          {selectedCardView.cvv || "882"}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
      {/* Tab: Global Sovereign Vault */}`;

// make sure to import Copy
if(!content.includes("import { Copy")) {
   content = content.replace("import {", "import {\n  Copy,");
}

content = content.replace(target, repl);
fs.writeFileSync('src/components/pay/RapidPay.tsx', content);
console.log("RapidPay patched.");
