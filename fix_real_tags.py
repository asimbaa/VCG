import re

with open("src/components/pay/RapidPay.tsx", "r") as f:
    content = f.read()

# Let's fix the specific lines by closing the tags that are supposedly unclosed
content = re.sub(
    r'<AnimatePresence>\s*\{selectedCardView && \(\s*<div className="fixed inset-0 z-\[100\] flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md">.*?<motion.div\s*initial=\{\{ opacity: 0, scale: 0.95, y: 20 \}\}',
    '<motion.div initial={{ opacity: 0, scale: 0.95, y: 20 }}',
    content,
    flags=re.DOTALL
)

with open("src/components/pay/RapidPay.tsx", "w") as f:
    f.write(content)

