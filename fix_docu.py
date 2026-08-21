import re

with open("src/components/bank/DocuCraftAI.tsx", "r") as f:
    content = f.read()

content = content.replace(
    "function SmartContractAuditLog({ logs }: { logs: Array<{id: string, time: string, type: string, status: string, hash: string}> }) {",
    "export function SmartContractAuditLog({ logs }: { logs?: Array<{id: string, time: string, type: string, status: string, hash: string}> }) {"
)

with open("src/components/bank/DocuCraftAI.tsx", "w") as f:
    f.write(content)
