with open("src/components/bank/UberEatsApp.tsx", "r") as f:
    lines = f.readlines()

new_lines = []
for i in range(len(lines)):
    if '    </div>\n' == lines[i] and i+1 < len(lines) and lines[i+1].strip() == ');' and i > 4000:
        # Wait, if I do this I might delete a real </div>.
        pass
