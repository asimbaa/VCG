import re

with open('src/components/pay/RapidPay.tsx', 'r') as f:
    content = f.read()

# Replace parseFloat(card.limit) with something that defaults to 200M if NaN
content = content.replace("parseFloat(card.limit).toLocaleString()", "(isNaN(parseFloat(card.limit)) ? 200000000 : parseFloat(card.limit)).toLocaleString()")

# Replace newCardLimit default to 200000000
content = content.replace('useState("50000")', 'useState("200000000")')

with open('src/components/pay/RapidPay.tsx', 'w') as f:
    f.write(content)
