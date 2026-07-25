import re

with open("src/components/bank/EToroApp.tsx", "r") as f:
    content = f.read()

# Add a robust trading function 
new_imports = "import { doc, getDoc, updateDoc, setDoc } from \"firebase/firestore\";\nimport { toast } from \"sonner\";\nimport { Bitcoin, LineChart, Globe, DollarSign, ArrowUpRight, ArrowDownRight, Search } from 'lucide-react';"
content = content.replace("import { doc, getDoc, updateDoc, setDoc } from \"firebase/firestore\";\nimport { toast } from \"sonner\";", new_imports)


with open("src/components/bank/EToroApp.tsx", "w") as f:
    f.write(content)
