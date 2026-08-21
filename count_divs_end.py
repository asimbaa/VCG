with open('src/components/bank/DeliveryMap.tsx', 'r') as f:
    lines = f.readlines()

balance = 0
for i, line in enumerate(lines[497:1400], 498):
    opens = line.count('<div')
    closes = line.count('</div')
    balance += opens - closes

print(f"Final balance: {balance}")
