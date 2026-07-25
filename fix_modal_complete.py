import re

with open("src/components/pay/RapidPay.tsx", "r") as f:
    content = f.read()

# I see it now. The button code on line 2230 is missing from the patch.
content = re.sub(
    r'<AnimatePresence>\s*\{selectedCardView && \(\s*<div className="fixed inset-0 z-\[100\] flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md">.*?<button\s*type="button"',
    '<button\n                      type="button"',
    content,
    flags=re.DOTALL
)

with open("src/components/pay/RapidPay.tsx", "w") as f:
    f.write(content)
