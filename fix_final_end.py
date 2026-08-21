with open("src/components/bank/UberEatsApp.tsx", "r") as f:
    lines = f.readlines()

while lines[-1].strip() == '':
    lines.pop()

while lines[-1].strip() in ['}', ');', '</div>']:
    lines.pop()

# Now lines ends just after the EmailPreviewModal
# Let's append exactly ONE </div> for root, then );, then }
lines.append('    </div>\n')
lines.append('  );\n')
lines.append('}\n')

with open("src/components/bank/UberEatsApp.tsx", "w") as f:
    f.writelines(lines)
