import re

with open('src/components/bank/ValourianDashboard.tsx', 'r') as f:
    content = f.read()

if 'import { DigitalChequeGenerator }' not in content:
    content = content.replace(
        "import { BlackCardsController } from './BlackCardsController';",
        "import { BlackCardsController } from './BlackCardsController';\nimport { DigitalChequeGenerator } from './DigitalChequeGenerator';"
    )

# Add tab button
tab_pattern = r"(\{ id: 'cards', label: 'Black Cards', icon: CreditCard \},)"
if "id: 'cheques'" not in content:
    content = re.sub(
        tab_pattern,
        r"\1\n    { id: 'cheques', label: 'Digital Cheques', icon: Landmark },",
        content
    )

# Add tab content
render_pattern = r"(activeTab === 'cards' && \(\s*<BlackCardsController />\s*\))"
if "activeTab === 'cheques'" not in content:
    content = re.sub(
        render_pattern,
        r"\1\n                }\n                {activeTab === 'cheques' && (\n                  <div className=\"space-y-6\">\n                    <DigitalChequeGenerator />\n                  </div>\n                )",
        content
    )

with open('src/components/bank/ValourianDashboard.tsx', 'w') as f:
    f.write(content)

print("Patched ValourianDashboard.tsx")
