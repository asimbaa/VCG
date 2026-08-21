import re

with open("src/components/pay/RapidPay.tsx", "r") as f:
    content = f.read()

modal_jsx = """
      ) : null}

      <AnimatePresence>
        {showReviewModal && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm"
          >
            <motion.div 
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white rounded-3xl w-full max-w-md shadow-2xl overflow-hidden border border-slate-200"
            >
              <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-slate-50">
                <h3 className="text-xl font-bold text-slate-800">Review Transfer</h3>
                <button onClick={() => setShowReviewModal(false)} className="text-slate-400 hover:text-slate-600 transition-colors">
                  <X className="w-5 h-5" />
                </button>
              </div>
              <div className="p-6 space-y-4">
                <div className="flex justify-between items-center py-3 border-b border-slate-50">
                  <span className="text-sm font-bold text-slate-400 uppercase tracking-widest">Amount</span>
                  <span className="text-2xl font-black text-slate-800">
                    $ {amount}
                  </span>
                </div>
                <div className="flex justify-between items-center py-3 border-b border-slate-50">
                  <span className="text-sm font-bold text-slate-400 uppercase tracking-widest">Recipient</span>
                  <span className="text-sm font-bold text-slate-800 text-right">{accountName || recipient || payIdValue}</span>
                </div>
                {transferType === 'au_bsb' && (
                  <div className="flex justify-between items-center py-3 border-b border-slate-50">
                    <span className="text-sm font-bold text-slate-400 uppercase tracking-widest">Account Details</span>
                    <span className="text-sm font-bold text-slate-800 text-right">BSB: {bsb}<br/>Acc: {accountNumber}</span>
                  </div>
                )}
                {transferType === 'payid' && (
                  <div className="flex justify-between items-center py-3 border-b border-slate-50">
                    <span className="text-sm font-bold text-slate-400 uppercase tracking-widest">PayID</span>
                    <span className="text-sm font-bold text-slate-800 text-right">{payIdValue}</span>
                  </div>
                )}
              </div>
              <div className="p-6 bg-slate-50 border-t border-slate-100 flex gap-3">
                <button 
                  onClick={() => setShowReviewModal(false)}
                  className="w-1/3 py-3 rounded-xl bg-white text-slate-600 font-bold text-xs uppercase tracking-widest border border-slate-200 hover:bg-slate-50 transition-colors"
                >
                  Cancel
                </button>
                <button 
                  onClick={processTransfer}
                  disabled={status === 'processing'}
                  className="w-2/3 py-3 rounded-xl bg-blue-600 text-white font-black text-xs uppercase tracking-widest shadow-md hover:bg-blue-500 transition-all flex justify-center items-center gap-2 disabled:opacity-50"
                >
                  {status === 'processing' ? <Loader2 className="w-4 h-4 animate-spin" /> : "Confirm Transfer"}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <AIGuide />
"""

content = content.replace("      ) : null}\n\n      <AIGuide />", modal_jsx)
content = content.replace("      ) : null}\n            <AIGuide />", modal_jsx)
content = content.replace("      ) : null}\n      <AIGuide />", modal_jsx)
content = content.replace("      ) : null}\n    <AIGuide />", modal_jsx)

# Just in case, let's use a regex
content = re.sub(r'\)\s*:\s*null\}\s*<AIGuide\s*/>', modal_jsx.strip(), content)

with open("src/components/pay/RapidPay.tsx", "w") as f:
    f.write(content)

