import re

with open("src/components/bank/UberEatsApp.tsx", "r") as f:
    content = f.read()

content = re.sub(r'deliveryTime: "\d+-\d+ min"', 'deliveryTime: "15-55 min"', content)

with open("src/components/bank/UberEatsApp.tsx", "w") as f:
    f.write(content)
