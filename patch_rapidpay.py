import re

with open("src/components/pay/RapidPay.tsx", "r") as f:
    content = f.read()

# 1. Add state selectedCardView
content = content.replace('  const [selectedBsbCard, setSelectedBsbCard] = useState<any | null>(null);',
                          '  const [selectedBsbCard, setSelectedBsbCard] = useState<any | null>(null);\n  const [selectedCardView, setSelectedCardView] = useState<any | null>(null);')

# 2. Update default limits to 1000000000
content = content.replace('limit: 50000,', 'limit: 1000000000,')
content = content.replace('setCardLimit("15000");', 'setCardLimit("1000000000");')
content = content.replace('limit: parseFloat(cardLimit) || 15000,', 'limit: parseFloat(cardLimit) || 1000000000,')
content = content.replace('const limitAmt = card.limit || 15000;', 'const limitAmt = card.limit || 1000000000;')

# 3. Make the card clickable to open selectedCardView
start_marker = '                        {/* Glass Card Header Graphic */}'
replacement = '''                        {/* Glass Card Header Graphic */}
                        <div
                          onClick={() => setSelectedCardView(card)}
                          className={`w-full h-40 rounded-xl p-4 text-white flex flex-col justify-between mb-4 shadow-md relative overflow-hidden transition-all duration-300 cursor-pointer hover:shadow-xl hover:-translate-y-1 ${'''

content = re.sub(
    r'                        \{/\* Glass Card Header Graphic \*/\}\n                        <div\n                          className=\{`w-full h-40 rounded-xl p-4 text-white flex flex-col justify-between mb-4 shadow-md relative overflow-hidden transition-all duration-300 \$\{',
    replacement,
    content
)

with open("src/components/pay/RapidPay.tsx", "w") as f:
    f.write(content)

print("Patched basic card stuff.")
