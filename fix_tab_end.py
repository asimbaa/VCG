with open("src/components/bank/UberEatsApp.tsx", "r") as f:
    lines = f.readlines()

new_lines = []
for line in lines:
    if '                })()}' in line:
        new_lines.append('                })()\n')
        new_lines.append('              )}\n')
    elif line == '              </div>\n' and '            </motion.div>\n' in lines[lines.index(line) + 1] if lines.index(line) + 1 < len(lines) else False:
        # skip this extra div!
        continue
    else:
        new_lines.append(line)

with open("src/components/bank/UberEatsApp.tsx", "w") as f:
    f.writelines(new_lines)
