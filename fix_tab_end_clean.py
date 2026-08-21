with open("src/components/bank/UberEatsApp.tsx", "r") as f:
    lines = f.readlines()

new_lines = []
skip = False
for i in range(len(lines)):
    line = lines[i]
    if skip:
        skip = False
        continue
    
    if line.strip() == '})()}':
        new_lines.append('                })()\n')
        new_lines.append('              )}\n')
    elif line.strip() == '</div>' and i+1 < len(lines) and lines[i+1].strip() == '</motion.div>':
        # Don't append </div>
        pass
    else:
        new_lines.append(line)

with open("src/components/bank/UberEatsApp.tsx", "w") as f:
    f.writelines(new_lines)

