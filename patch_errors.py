with open("src/components/bank/UberEatsApp.tsx", "r") as f:
    code = f.read()

# 1. Fix framer-motion Download import
# Actually, Download is from lucide-react. We can just replace 'Download' in framer-motion with nothing
import re
code = re.sub(r'Download,\s*motion,\s*AnimatePresence', 'motion, AnimatePresence', code)
code = re.sub(r'Download\s*,\s*motion', 'motion', code)

# Let's make sure lucide-react imports Download
if 'Download,' not in code and 'Download ' not in code:
    code = code.replace('import {', 'import { Download,', 1)

# 2. Fix handlePlaceOrder to handleOrder
code = code.replace('onClick={handlePlaceOrder}', 'onClick={handleOrder}')

# 3. Fix totalToPay by doing it inline
calc = 'Math.max(0, cart.reduce((acc, item) => acc + item.price, 0) + Math.round(((cart.reduce((acc, item) => acc + item.price, 0) * tipPercentage) / 100) * 100) / 100 - (appliedVoucher ? appliedVoucher.value : 0)).toFixed(2)'
code = code.replace('totalToPay.toFixed(2)', calc)

# 4. Fix callStatus("idle") to callStatus("ended")
code = code.replace('setCallStatus("idle")', 'setCallStatus("ended")')

# 5. Fix EmailPreviewModal email to data
code = code.replace('email={previewEmail}', 'data={previewEmail}')

with open("src/components/bank/UberEatsApp.tsx", "w") as f:
    f.write(code)

