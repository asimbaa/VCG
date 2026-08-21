with open("src/components/bank/UberEatsApp.tsx", "r") as f:
    lines = f.readlines()
for i in range(3225, 3245):
    print(f"{i}: {lines[i]}", end="")
