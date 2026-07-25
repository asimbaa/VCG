import re

with open("src/components/bank/ValourianDashboard.tsx", "r") as f:
    content = f.read()

# Add a robust trading function 
content = content.replace("import { EToroApp } from \"./EToroApp\";", "import { EToroApp } from \"./EToroApp\";")


with open("src/components/bank/ValourianDashboard.tsx", "w") as f:
    f.write(content)
