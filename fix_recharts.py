with open("src/components/bank/UberEatsApp.tsx", "r") as f:
    lines = f.readlines()

new_lines = []
for i in range(len(lines)):
    if '                })()' in lines[i] and '              )}' in lines[i+1] and '                      margin={{' in lines[i+2]:
        new_lines.append('                      })()}\n')
        # skip next line
    elif '              )}' in lines[i] and '                      margin={{' in lines[i+1]:
        continue
    else:
        new_lines.append(lines[i])

with open("src/components/bank/UberEatsApp.tsx", "w") as f:
    f.writelines(new_lines)
