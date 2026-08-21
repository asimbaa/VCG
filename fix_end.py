with open("src/components/bank/UberEatsApp.tsx", "r") as f:
    lines = f.readlines()

new_lines = []
for line in lines:
    new_lines.append(line)
    if 'Re-Order Items' in line:
        break

# We appended up to `Re-Order Items`

new_lines.append('                                  </button>\n')
new_lines.append('                                </div>\n')
new_lines.append('                              )}\n')
new_lines.append('                            {/* Download summary button */}\n')
new_lines.append('                            <div className="pt-2 border-t border-slate-100 flex justify-end mt-2">\n')
new_lines.append('                                <button\n')
new_lines.append('                                  onClick={(e) => {\n')
new_lines.append('                                      e.stopPropagation();\n')
new_lines.append('                                      const contentStr = `UBER EATS RECEIPT SUMMARY\\n\\nRestaurant: ${order.recipient}\\nDate: ${orderDate}\\nTotal: $${Math.abs(order.amount).toFixed(2)}\\n\\nItems:\\n${(order.items || []).map((it:any) => `- ${it.name} ($${it.price})`).join(\'\\n\')}\\n\\nDelivery Address: ${order.deliveryAddress || \'N/A\'}`;\n')
new_lines.append('                                      const blob = new Blob([contentStr], { type: \'text/plain\' });\n')
new_lines.append('                                      const url = URL.createObjectURL(blob);\n')
new_lines.append('                                      const a = document.createElement(\'a\');\n')
new_lines.append('                                      a.href = url;\n')
new_lines.append('                                      a.download = `Receipt_${order.id}.txt`;\n')
new_lines.append('                                      document.body.appendChild(a);\n')
new_lines.append('                                      a.click();\n')
new_lines.append('                                      document.body.removeChild(a);\n')
new_lines.append('                                      URL.revokeObjectURL(url);\n')
new_lines.append('                                  }}\n')
new_lines.append('                                  className="text-[10px] font-black uppercase tracking-widest text-[#06C167] hover:text-[#05a155] bg-emerald-50 hover:bg-emerald-100 px-3 py-1.5 rounded-lg flex items-center gap-1.5 transition-colors"\n')
new_lines.append('                                >\n')
new_lines.append('                                  <Download className="w-3 h-3" /> Download Summary\n')
new_lines.append('                                </button>\n')
new_lines.append('                            </div>\n')
new_lines.append('                          </div>\n')
new_lines.append('                        );\n')
new_lines.append('                      })}\n')
new_lines.append('                    </div>\n')
new_lines.append('                  );\n')
new_lines.append('                })()}\n')
new_lines.append('              </div>\n')
new_lines.append('            </motion.div>\n')
new_lines.append('          )}\n')

# Close the tab content area and the layout
new_lines.append('        </div>\n') # main scroll area
new_lines.append('      </div>\n') # inner app container

# Add the Modals
new_lines.append("""
      {/* Checkout Confirm Modal */}
      {showConfirmModal && (
        <div className="absolute inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white rounded-3xl p-6 w-full max-w-md shadow-2xl relative"
          >
            <button
              onClick={() => setShowConfirmModal(false)}
              className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 p-2"
            >
              <XCircle className="w-6 h-6" />
            </button>
            <h2 className="text-xl font-black text-slate-800 uppercase tracking-widest mb-4 flex items-center gap-2">
              <ShieldCheck className="w-6 h-6 text-[#06C167]" /> Secure Checkout
            </h2>
            <div className="bg-slate-50 p-4 rounded-xl space-y-3 mb-6 border border-slate-100">
              <div className="flex justify-between items-center text-sm font-bold text-slate-600">
                <span>Total Amount:</span>
                <span className="text-[#06C167] text-lg font-black">${totalToPay.toFixed(2)}</span>
              </div>
              <div className="flex justify-between items-center text-sm font-bold text-slate-600">
                <span>Payment Method:</span>
                <span className="text-slate-800 capitalize">{checkoutPaymentMethod}</span>
              </div>
            </div>
            <button
              onClick={handlePlaceOrder}
              disabled={isProcessing}
              className="w-full bg-[#06C167] text-white py-4 rounded-xl font-black uppercase tracking-widest hover:bg-[#05a155] transition-all disabled:opacity-50"
            >
              {isProcessing ? "Processing..." : "Confirm Secure Payment"}
            </button>
          </motion.div>
        </div>
      )}

      {/* Voice Bridge Modal */}
      {isCallingPartner && (
        <div className="absolute inset-0 z-[60] flex items-center justify-center bg-black/80 backdrop-blur-md">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-slate-900 rounded-3xl p-8 w-full max-w-sm border border-slate-800 text-center shadow-2xl"
          >
            <div className="w-20 h-20 mx-auto bg-indigo-500/20 rounded-full flex items-center justify-center mb-6 relative">
              <div className="absolute inset-0 rounded-full border-2 border-indigo-500/50 animate-ping"></div>
              <PhoneCall className="w-10 h-10 text-indigo-400" />
            </div>
            <h3 className="text-xl font-black text-white uppercase tracking-widest mb-2">
              Secure Courier Line
            </h3>
            <p className="text-indigo-400 font-mono text-sm mb-8">
              {callStatus === "dialing" ? "Establishing connection..." : `00:${callDuration.toString().padStart(2, "0")}`}
            </p>
            <div className="flex justify-center gap-6">
              <button
                onClick={() => setIsMuted(!isMuted)}
                className={`p-4 rounded-full transition-colors ${isMuted ? "bg-red-500 text-white" : "bg-slate-800 text-slate-400 hover:bg-slate-700"}`}
              >
                {isMuted ? <MicOff className="w-6 h-6" /> : <Mic className="w-6 h-6" />}
              </button>
              <button
                onClick={() => {
                  setIsCallingPartner(false);
                  setCallStatus("idle");
                }}
                className="p-4 rounded-full bg-red-500 text-white hover:bg-red-600 transition-colors"
              >
                <PhoneOff className="w-6 h-6" />
              </button>
            </div>
          </motion.div>
        </div>
      )}

      {previewEmail && (
        <EmailPreviewModal
          email={previewEmail}
          onClose={() => setPreviewEmail(null)}
        />
      )}
    </div>
  );
}
""")

with open("src/components/bank/UberEatsApp.tsx", "w") as f:
    f.writelines(new_lines)

print("UberEatsApp restored to working state")
