with open("src/components/pay/RapidPay.tsx", "r") as f:
    lines = f.readlines()

new_lines = []
for i, line in enumerate(lines):
    # Remove the stray closing parenthesis if it exists in the AnimatePresence replacement issue
    if "      </AnimatePresence>" in line and i < len(lines) - 5 and "{/* Tap & Pay" in lines[i+2]:
        pass
    new_lines.append(line)

with open("src/components/pay/RapidPay.tsx", "w") as f:
    f.writelines(new_lines)
