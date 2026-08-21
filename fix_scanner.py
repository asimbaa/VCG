with open("src/components/bank/UberEatsApp.tsx", "r") as f:
    lines = f.readlines()

new_lines = []
skip = False
for i, line in enumerate(lines):
    if '                                        <span className="text-[9px] font-mono text-slate-300 font-bold block">' in line:
        new_lines.append(line)
        new_lines.append(lines[i+1]) # {scannedCardData.cardNumber}
        new_lines.append(lines[i+2]) # </span>
        # now insert the button right here!
        new_lines.append('                                        <button\n')
        new_lines.append('                                          id="populate-scanned-details-btn"\n')
        new_lines.append('                                          onClick={() => {\n')
        new_lines.append('                                            setCheckoutCardNumber(scannedCardData.cardNumber);\n')
        new_lines.append('                                            setCheckoutExpiry(scannedCardData.expiry);\n')
        new_lines.append('                                            setCheckoutCvv(scannedCardData.cvv);\n')
        new_lines.append('                                            setCheckoutCardholder(scannedCardData.cardholder);\n')
        new_lines.append('                                            setCheckoutCardBank(scannedCardData.bank);\n')
        new_lines.append('                                            setCheckoutCardNetwork(scannedCardData.network);\n')
        new_lines.append('                                            setIsScanningCard(false);\n')
        new_lines.append('                                            setScanStep("idle");\n')
        new_lines.append('                                            setIsScanningFromCheckout(false);\n')
        new_lines.append('                                            setScannedCardData(null);\n')
        new_lines.append('                                          }}\n')
        new_lines.append('                                          className="mt-2 w-full bg-emerald-600 hover:bg-emerald-700 text-white text-[10px] font-black uppercase py-2 rounded-lg transition-colors cursor-pointer text-center font-sans"\n')
        new_lines.append('                                        >\n')
        new_lines.append('                                          Populate Payment Details\n')
        new_lines.append('                                        </button>\n')
        
        skip = True
        continue
    
    if skip:
        if '                              </motion.div>' in line:
            skip = False
            # Wait, if we skip until `</motion.div>`, we need to add the closing tags for the camera div and the `isScanningCard` condition!
            # The structure was:
            new_lines.append('                                      </div>\n') # close the completed view
            new_lines.append('                                    )}\n')
            new_lines.append('                                  </div>\n') # close the camera box
            new_lines.append(line) # </motion.div>
        continue
        
    new_lines.append(line)

with open("src/components/bank/UberEatsApp.tsx", "w") as f:
    f.writelines(new_lines)

