import re

with open("src/components/bank/EToroApp.tsx", "r") as f:
    content = f.read()

# Replace the specific union type with string
content = re.sub(
    r"const \[activeTab, setActiveTab\] = useState\('portfolio' \| 'trade' \| 'funding'\)\('portfolio'\);",
    "const [activeTab, setActiveTab] = useState<string>('portfolio');",
    content
)
# Wait, the string is `useState<'portfolio' | 'trade' | 'funding'>('portfolio');`
content = content.replace("useState<'portfolio' | 'trade' | 'funding'>('portfolio')", "useState<string>('portfolio')")

with open("src/components/bank/EToroApp.tsx", "w") as f:
    f.write(content)

