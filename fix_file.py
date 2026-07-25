import re

with open("src/components/pay/RapidPay.tsx", "r") as f:
    content = f.read()

# Let's completely remove all instances of the modal patches and replace them cleanly
content = re.sub(r'\{/\* Selected Card Modal \*/\}.*?</AnimatePresence>', '', content, flags=re.DOTALL)
content = re.sub(r'\{/\* Tap & Pay / Refund Modal \*/\}.*?</AnimatePresence>', '', content, flags=re.DOTALL)

with open("src/components/pay/RapidPay.tsx", "w") as f:
    f.write(content)

