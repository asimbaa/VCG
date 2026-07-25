import re

with open('src/components/bank/SovereignStore.tsx', 'r') as f:
    content = f.read()

content = content.replace("<option value=\"FedEx\">FedEx</option>", "<option value=\"FedEx\">FedEx</option>\n                    <option value=\"Apple Store Fleet\">Apple Store Fleet</option>")
content = content.replace("useState<'Australia Post' | 'Amazon Logistics' | 'FedEx' | 'DHL' | 'Aura Drive Tesla Fleet' | 'Apple Store Fleet'>('Apple Store Fleet')", "useState<'Australia Post' | 'Amazon Logistics' | 'FedEx' | 'DHL' | 'Aura Drive Tesla Fleet' | 'Apple Store Fleet'>('Amazon Logistics')")

with open('src/components/bank/SovereignStore.tsx', 'w') as f:
    f.write(content)
