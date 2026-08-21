import re

with open("src/components/bank/UberEatsApp.tsx", "r") as f:
    content = f.read()

# At line 3230-3260: the card scanner modal has the download summary button injected.
# We need to remove the whole block.
bad_injected_download = re.compile(r"""\s*<div className="pt-2 border-t border-slate-100 flex justify-end mt-2">\s*<button.*?<Download className="w-3 h-3" /> Download Summary\s*</button>\s*</div>\s*</div>""", re.DOTALL)

# Let's replace the one around `scannedCardData.cardNumber` which got messed up:
target_scanner = re.compile(r"""                                      </div>\s*)}\s*<div className="pt-2 border-t border-slate-100 flex justify-end mt-2">\s*<button.*?Download Summary\s*</button>\s*</div>\s*</div>\s*{scanStep === "completed" &&\s*scannedCardData && \(\s*</div>\s*\)}\s*{scanStep === "completed" &&\s*scannedCardData && \(\s*<button\s*id="populate-scanned-details-btn\"""", re.DOTALL)

replacement_scanner = """                                      </div>
                                    )}
                                  </div>
                                )}
                                {scanStep === "completed" &&
                                  scannedCardData && (
                                    <button
                                      id="populate-scanned-details-btn\""""
content = re.sub(target_scanner, replacement_scanner, content)

# There is also one at 4577
target_history = re.compile(r"""                                </div>\\n                            \)}\\n                            \{\/\* Download summary button \*\/\}""", re.DOTALL)
content = re.sub(target_history, "", content)

# I also need to fix the history tab download summary which was inserted at the end of `order.items`
target_history_bad = re.compile(r"""\s*<div className="pt-2 border-t border-slate-100 flex justify-end mt-2">\s*<button.*?<Download className="w-3 h-3" /> Download Summary\s*</button>\s*</div>\s*</div>""", re.DOTALL)
content = re.sub(target_history_bad, "\n                              </div>\n                            )}", content)

with open("src/components/bank/UberEatsApp.tsx", "w") as f:
    f.write(content)

print("UberEatsApp fixes attempted")
