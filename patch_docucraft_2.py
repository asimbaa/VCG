import re

with open('src/components/bank/DocuCraftAI.tsx', 'r') as f:
    content = f.read()

import_statement = "import { SmartContractAuditGraph } from './SmartContractAuditGraph';"
if import_statement not in content:
    content = content.replace("import { toast } from 'sonner';", "import { toast } from 'sonner';\n" + import_statement)

# If we previously added <SmartContractAuditLog />, let's replace or append to it.
content = content.replace("<SmartContractAuditLog />", "<SmartContractAuditLog />\n      <SmartContractAuditGraph />")

with open('src/components/bank/DocuCraftAI.tsx', 'w') as f:
    f.write(content)
