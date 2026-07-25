import re

with open("src/components/bank/EToroApp.tsx", "r") as f:
    content = f.read()

# Fix AuthContext
content = content.replace("import { useAuth } from \"../../context/AuthContext\";", "// Mock auth\nconst useAuth = () => ({ user: { uid: 'mock-user-123' } });")


with open("src/components/bank/EToroApp.tsx", "w") as f:
    f.write(content)
