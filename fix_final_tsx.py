import re

with open("src/components/pay/RapidPay.tsx", "r") as f:
    content = f.read()

# We need to manually fix lines 933 and 2123 which are the missing tags.
# But looking at line 933, it's NOT missing a closing tag, TS is just confused because of line 2230 and 2416.
# We must replace the broken modal from the original file correctly.

content = re.sub(
    r'<AnimatePresence>\s*\{selectedCardView && \(\s*<div className="fixed inset-0 z-\[100\] flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md">.*?<motion.div\s*initial=\{\{ opacity: 0, scale: 0.95, y: 20 \}\}.*?</button>\s*</div>\s*</div>\s*</div>\s*</div>\s*</motion\.div>\s*</div>\s*\)\}\s*</AnimatePresence>',
    '<button\n                      type="button"',
    content,
    flags=re.DOTALL
)

with open("src/components/pay/RapidPay.tsx", "w") as f:
    f.write(content)
