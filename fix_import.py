import re

with open("src/components/bank/ValourianDashboard.tsx", "r") as f:
    content = f.read()

# find firebase/firestore import
match = re.search(r'import\s+\{([^}]+)\}\s+from\s+"firebase/firestore";', content)
if match:
    imports = match.group(1)
    if "serverTimestamp" not in imports:
        new_imports = imports + ", serverTimestamp"
        content = content.replace(f'import {{{imports}}} from "firebase/firestore";', f'import {{{new_imports}}} from "firebase/firestore";')
        with open("src/components/bank/ValourianDashboard.tsx", "w") as f:
            f.write(content)
