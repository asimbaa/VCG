with open("src/components/bank/UberEatsApp.tsx", "r") as f:
    lines = f.readlines()

new_lines = []
i = 0
while i < len(lines):
    if lines[i] == '    </div>\n' and i+1 < len(lines) and lines[i+1].strip() == '</div>' and i+2 < len(lines) and lines[i+2].strip() == ');':
        # Skip the '    </div>\n' that I injected
        # Wait, my previous script did:
        # new_lines.append('    </div>\n')
        # new_lines.append(lines[i]) # which is </div>
        pass
    else:
        new_lines.append(lines[i])
    i += 1

with open("src/components/bank/UberEatsApp.tsx", "w") as f:
    f.writelines(new_lines)
