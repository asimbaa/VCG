import re

with open("src/components/pay/RapidPay.tsx", "r") as f:
    content = f.read()

# Replace the malformed AnimatePresence blocks with correct ones
content = re.sub(
    r'      <AnimatePresence>\s*\{\/\* Tap \& Pay / Refund Modal \*\/\}\s*<AnimatePresence>',
    r'      {/* Tap & Pay / Refund Modal */}\n      <AnimatePresence>',
    content
)

content = re.sub(
    r'      </AnimatePresence>\s*<AnimatePresence>\s*\{selectedCardView',
    r'      </AnimatePresence>\n      {/* Selected Card Modal */}\n      <AnimatePresence>\n        {selectedCardView',
    content
)

with open("src/components/pay/RapidPay.tsx", "w") as f:
    f.write(content)

