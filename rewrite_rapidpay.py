import re

with open("src/components/pay/RapidPay.tsx", "r") as f:
    content = f.read()

# We need to manually reconstruct the JSX where it got broken around line 2230
# Let's find the original file if we can. Is it in github?
# If not, let's fix the JSX structure.

# The original code should look like:
"""
                  ) : (
                    <button
                      type="button"
"""

content = re.sub(
    r'\) : \(\s*<AnimatePresence>\s*\{selectedCardView && \(\s*<div className="fixed inset-0 z-\[100\] flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md">.*?<motion\.div\s*initial=\{\{ opacity: 0, scale: 0\.95, y: 20 \}\}\s*animate=\{\{ opacity: 1, scale: 1, y: 0 \}\}\s*exit=\{\{ opacity: 0, scale: 0\.95, y: 20 \}\}\s*className="bg-white rounded-3xl w-full max-w-4xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-\[90vh\]"\s*>\s*<div className="p-6 border-b border-slate-200 flex justify-between items-center bg-slate-50">\s*<div className="flex items-center gap-3">',
    ') : (\n                    <button\n                      type="button"',
    content,
    flags=re.DOTALL
)

with open("src/components/pay/RapidPay.tsx", "w") as f:
    f.write(content)

