with open("src/components/bank/UberEatsApp.tsx", "r") as f:
    lines = f.readlines()

new_lines = []
for i in range(len(lines)):
    if '      {/* Checkout Confirm Modal */}' in lines[i]:
        # This is where we added the modals. Before this, we should close AnimatePresence
        new_lines.append('        </AnimatePresence>\n')
        new_lines.append(lines[i])
    else:
        new_lines.append(lines[i])

with open("src/components/bank/UberEatsApp.tsx", "w") as f:
    f.writelines(new_lines)
