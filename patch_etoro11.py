import re

with open("src/components/bank/EToroApp.tsx", "r") as f:
    content = f.read()

# Fix the JSX
content = content.replace(")}", ")}")

with open("src/components/bank/EToroApp.tsx", "w") as f:
    f.write(content)
