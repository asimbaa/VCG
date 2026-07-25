import re

with open("src/components/bank/EToroApp.tsx", "r") as f:
    content = f.read()

# Fix the auth context import
content = content.replace("../../AuthContext", "../../context/AuthContext")

with open("src/components/bank/EToroApp.tsx", "w") as f:
    f.write(content)
