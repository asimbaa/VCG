import re

with open("src/components/bank/EToroApp.tsx", "r") as f:
    content = f.read()

# Mock AuthContext since it's not present
content = content.replace("import { useAuth } from \"../../context/AuthContext\";", "const useAuth = () => ({ user: { uid: 'mock-user-123' } });")

with open("src/components/bank/EToroApp.tsx", "w") as f:
    f.write(content)
