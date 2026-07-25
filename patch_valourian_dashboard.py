import re

with open('src/components/bank/ValourianDashboard.tsx', 'r') as f:
    content = f.read()

# Replace any "$1B Limit" string with "$200M Limit"
content = content.replace("$1B Limit", "$200M Limit")

# "No Limit" string replacing with "200000000" everywhere limit is displayed, if applicable.
# Let's just fix the render logic.
# Wait, let's fix parseFloat(card.limit) in ValourianDashboard if it exists.
content = content.replace("parseFloat(card.limit)", "(isNaN(parseFloat(card.limit)) ? 200000000 : parseFloat(card.limit))")

with open('src/components/bank/ValourianDashboard.tsx', 'w') as f:
    f.write(content)
