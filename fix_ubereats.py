import re

with open("src/components/bank/UberEatsApp.tsx", "r") as f:
    content = f.read()

# Fix literal `\n` issue and misplaced replacements
content = content.replace("                                      </div>\\n                            )}\\n                            {/* Download summary button */}", "                                      </div>\n                                    )}                                  ")
content = content.replace(
"""                                    <button
                                      id="populate-scanned-details-btn\"""",
"""                                  </div>
                                )}

                                {scanStep === "completed" &&
                                  scannedCardData && (
                                    <button
                                      id="populate-scanned-details-btn\""""
)

with open("src/components/bank/UberEatsApp.tsx", "w") as f:
    f.write(content)

