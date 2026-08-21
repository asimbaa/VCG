import re
with open("src/components/bank/UberEatsApp.tsx", "r") as f:
    lines = f.readlines()

new_lines = []
for line in lines:
    if line.startswith('import { Download,'):
        # check if it's lucide-react
        if 'lucide-react' in line:
            new_lines.append(line)
        else:
            new_lines.append(line.replace('import { Download,', 'import {'))
    else:
        new_lines.append(line)

with open("src/components/bank/UberEatsApp.tsx", "w") as f:
    f.writelines(new_lines)

