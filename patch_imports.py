import re

with open("src/components/pay/RapidPay.tsx", "r") as f:
    content = f.read()

import_pattern = r'import\s*{\s*([^}]+?)\s*}\s*from\s*["\']lucide-react["\'];'
match = re.search(import_pattern, content)
if match:
    imports_str = match.group(1)
    imports_list = [i.strip() for i in imports_str.split(',')]
    if 'ArrowRight' not in imports_list:
        imports_list.append('ArrowRight')
    if 'Loader2' not in imports_list:
        imports_list.append('Loader2')
    
    new_imports_str = ',\n  '.join(imports_list)
    new_import_stmt = f'import {{\n  {new_imports_str}\n}} from "lucide-react";'
    
    content = content[:match.start()] + new_import_stmt + content[match.end():]

    with open("src/components/pay/RapidPay.tsx", "w") as f:
        f.write(content)
    print("Imports updated!")
else:
    print("Lucide import not found.")
