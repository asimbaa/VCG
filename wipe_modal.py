import re

with open("src/components/pay/RapidPay.tsx", "r") as f:
    content = f.read()

# We know the issue was introduced when replacing `<AnimatePresence>.*?</AnimatePresence>` for `selectedCardView`.
# Let's restore the ORIGINAL modal for `selectedCardView` that I accidentally overwrote.
# Wait, I don't have the original before `patch_modal.py` ran.

# Let's just fix the JSX structure manually. We will replace everything from `( <AnimatePresence> {selectedCardView && ...` down to the next `<AnimatePresence>` with what should be there.
# It seems the `Verify PayID` button had a `)` that was removed, causing `<AnimatePresence>` to be nested inside the `disabled` prop or something.

content = content.replace(
    '                    <AnimatePresence>\n        {selectedCardView && (\n          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md">',
    '                    <button\n                      type="button"\n                      onClick={handleValidate}\n                      disabled={status === "validating"}\n                      className="w-full py-3 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-xl transition-colors shadow-md mt-2 flex items-center justify-center"\n                    >\n                      {status === "validating" ? "Looking up PayID..." : "Verify PayID"}\n                    </button>\n                  )\n                } \n              </form>\n            </div>\n          </div>\n        )\n      }\n\n      {/* Selected Card Modal */}\n      <AnimatePresence>\n        {selectedCardView && (\n          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md">'
)

with open("src/components/pay/RapidPay.tsx", "w") as f:
    f.write(content)
