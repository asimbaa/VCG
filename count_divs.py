with open('src/components/bank/DeliveryMap.tsx', 'r') as f:
    lines = f.readlines()

balance = 0
for i, line in enumerate(lines[497:], 498):
    opens = line.count('<div')
    closes = line.count('</div')
    balance += opens - closes
    if balance < 0:
        print(f"Negative balance at line {i}: {line.strip()}")
        break
    if i == 1272:
        print(f"Balance at 1272: {balance}")

