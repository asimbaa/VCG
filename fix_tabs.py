import re

with open("src/components/bank/ValourianDashboard.tsx", "r") as f:
    content = f.read()

# Replace the specific union type with string
content = re.sub(
    r'const \[activeTab, setActiveTab\] = useState<[^>]+>\("treasury"\);',
    'const [activeTab, setActiveTab] = useState<string>("treasury");',
    content
)

with open("src/components/bank/ValourianDashboard.tsx", "w") as f:
    f.write(content)

