with open("src/components/bank/UberEatsApp.tsx", "r") as f:
    lines = f.readlines()

new_lines = []
i = 0
while i < len(lines):
    if lines[i].strip() == '</div>' and i+1 < len(lines) and lines[i+1].strip() == '</div>' and i+3 < len(lines) and 'Checkout Confirm Modal' in lines[i+3]:
        new_lines.append('        </AnimatePresence>\n')
        new_lines.append('      </div>\n')
        i += 2 # skip the two divs
        continue
    
    if lines[i].strip() == '</div>' and i+1 < len(lines) and lines[i+1].strip() == ');':
        # we are at the end, but wait, the root div was already closed? No, it was just missing.
        # So we just insert a </div> here.
        new_lines.append('    </div>\n')
        new_lines.append(lines[i])
        i += 1
        continue
        
    new_lines.append(lines[i])
    i += 1

with open("src/components/bank/UberEatsApp.tsx", "w") as f:
    f.writelines(new_lines)

