import re

with open('src/App.tsx', 'r') as f:
    content = f.read()

content = content.replace("Valourian Capital - Tier 1 Global Treasury", "ValourianCapital.io - Tier 1 Global Treasury")
content = content.replace("Valourian Core", "ValourianCapital.io Core")
content = content.replace("Valourian Capital Management", "ValourianCapital.io Management")

with open('src/App.tsx', 'w') as f:
    f.write(content)
