import re

with open("src/components/bank/EToroApp.tsx", "r") as f:
    content = f.read()

# Replace the Current Holdings block with CryptoPortfolioWidget
start_marker = '<h3 className="text-lg font-black text-white">Current Holdings</h3>'
end_marker = '                <div className="bg-slate-950 rounded-2xl p-6 border border-slate-800 mt-6">'

start_idx = content.find(start_marker)
end_idx = content.find(end_marker)

if start_idx != -1 and end_idx != -1:
    new_content = content[:start_idx] + '<CryptoPortfolioWidget totalEquity={totalEquity} />\n' + content[end_idx:]
    
    # Add import
    import_statement = 'import { CryptoPortfolioWidget } from "./CryptoPortfolioWidget";\n'
    if import_statement not in new_content:
        # insert after first import
        new_content = new_content.replace('import React, { useState } from \'react\';', 'import React, { useState } from \'react\';\n' + import_statement)
        
    with open("src/components/bank/EToroApp.tsx", "w") as f:
        f.write(new_content)
    print("EToroApp patched successfully")
else:
    print("Could not find markers")
