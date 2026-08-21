import re

with open('src/components/bank/SmartContractAuditGraph.tsx', 'r') as f:
    content = f.read()

# Fix drag error
content = content.replace('.call(drag(simulation));', '.call(drag(simulation) as any);')

with open('src/components/bank/SmartContractAuditGraph.tsx', 'w') as f:
    f.write(content)
