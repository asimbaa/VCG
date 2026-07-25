import re

with open("src/components/pay/RapidPay.tsx", "r") as f:
    content = f.read()

# We see that a modal was incorrectly injected around line 2230, breaking the JSX
# We need to remove the injected modal string from the middle of the JSX
content = re.sub(
    r'<AnimatePresence>\s*\{selectedCardView && \(\s*<div className="fixed inset-0 z-\[100\] flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md">.*?<button\s*type="button"',
    '<button\n                      type="button"',
    content,
    flags=re.DOTALL
)

with open("src/components/pay/RapidPay.tsx", "w") as f:
    f.write(content)
