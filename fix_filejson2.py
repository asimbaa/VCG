import re

with open("src/components/bank/ValourianDashboard.tsx", "r") as f:
    content = f.read()

# Make sure FileJson is in the lucide-react import list
if "FileJson" not in content[:1000]:
    content = content.replace("import {\n  Wallet", "import {\n  FileJson,\n  Wallet")

with open("src/components/bank/ValourianDashboard.tsx", "w") as f:
    f.write(content)

