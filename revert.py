import re
with open('src/components/bank/DeliveryMap.tsx', 'r') as f:
    content = f.read()

content = content.replace("  return (\n    <>\n    <div className=\"space-y-4 relative font-sans\">", "  return (\n    <div className=\"space-y-4 relative font-sans\">")
content = content.replace("    </div>\n    </>\n  );\n}\n\n\nexport function DeliveryMap", "    </div>\n  );\n}\n\n\nexport function DeliveryMap")

with open('src/components/bank/DeliveryMap.tsx', 'w') as f:
    f.write(content)
